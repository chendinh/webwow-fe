# ARCHITECTURE

## Directory Structure

```
webwow-fe/
├── .eslintrc.json          # ESLint configuration for TypeScript/React linting rules
├── .gitignore              # Git ignore patterns
├── README.md               # Project overview and setup instructions
├── next-env.d.ts           # Next.js TypeScript environment declarations (auto-generated)
├── next.config.mjs         # Next.js configuration (routing, env vars, image domains, etc.)
├── package.json            # Dependencies, scripts, and project metadata
├── postcss.config.mjs      # PostCSS configuration used by Tailwind CSS pipeline
├── tailwind.config.ts      # Tailwind CSS theme, content paths, and plugin configuration
├── tsconfig.json           # TypeScript compiler options and path aliases
├── tsconfig.tsbuildinfo    # TypeScript incremental build cache
└── src/                    # All application source code lives here
    ├── app/                # Next.js App Router: route groups, layouts, and pages
    │   ├── (app)/          # Route group for authenticated application shell
    │   ├── (auth)/         # Route group for authentication flows (login, register, etc.)
    │   ├── (marketing)/    # Route group for public-facing marketing pages
    │   ├── globals.css     # Global CSS resets and Tailwind base directives
    │   ├── layout.tsx      # Root layout: wraps all routes with providers and global UI
    │   └── page.tsx        # Root page (likely redirect or landing entry point)
    ├── components/         # Reusable React components organized by concern
    │   ├── common/         # Shared utility components used across multiple route groups
    │   ├── layout/         # Structural layout components (nav, sidebar, header, footer)
    │   ├── marketing/      # Components specific to marketing/public pages
    │   ├── providers.tsx   # Aggregated React context and store providers for the app tree
    │   └── ui/             # Low-level, design-system-level UI primitives (buttons, inputs, etc.)
    ├── lib/                # Non-component logic: API clients, hooks, and utilities
    │   ├── api/            # API client functions and request abstractions
    │   ├── hooks/          # Custom React hooks encapsulating reusable stateful logic
    │   └── utils/          # Pure utility/helper functions (formatting, validation, etc.)
    ├── stores/             # Zustand global state stores
    │   ├── auth.store.ts   # Authentication state: user session, tokens, login/logout actions
    │   └── org.store.ts    # Organization/workspace state: active org, membership data
    └── types/              # Shared TypeScript type definitions
        └── api.types.ts    # Types for API request/response shapes and domain entities
```

---

## Architectural Patterns

### Next.js App Router
The project uses the **Next.js 13+ App Router** (`src/app/`) rather than the legacy Pages Router. Routes are defined by directory structure, and each segment can export a `layout.tsx`, `page.tsx`, `loading.tsx`, or `error.tsx`. The root `layout.tsx` wraps the entire application tree.

### Route Groups for Concern Separation
Three route groups partition the application without affecting URL paths:
- `(app)/` — authenticated product UI, likely protected by middleware or layout-level auth checks.
- `(auth)/` — unauthenticated flows such as login, registration, and password reset.
- `(marketing)/` — public-facing pages (landing, pricing, docs) with a distinct layout.

This pattern allows each group to have its own nested layout, navigation shell, and data-fetching strategy without polluting the URL namespace.

### Server Components by Default, Client Components on Demand
Next.js App Router renders components as **React Server Components (RSC)** by default. Client interactivity is isolated to components explicitly marked with `"use client"`. The `src/components/ui/` and `src/components/common/` directories likely contain a mix; stateful components (forms, modals, interactive widgets) are client components, while structural/display components remain server-rendered.

### Layered Frontend Architecture
The codebase follows a clear layered separation:
1. **Routing layer** — `src/app/` (pages and layouts)
2. **Component layer** — `src/components/` (UI rendering)
3. **Logic layer** — `src/lib/hooks/` (stateful logic), `src/lib/utils/` (pure functions)
4. **Data access layer** — `src/lib/api/` (HTTP calls to backend)
5. **State layer** — `src/stores/` (global client state via Zustand)
6. **Type layer** — `src/types/` (shared contracts)

### Utility-First Styling
Tailwind CSS is used for all styling, configured in `tailwind.config.ts` and processed via PostCSS (`postcss.config.mjs`). Global resets and Tailwind directives are applied in `src/app/globals.css`.

---

## Request Lifecycle

A typical page navigation or data fetch follows this flow:

1. **Browser request** — User navigates to a URL (e.g., `/dashboard`).
2. **Next.js routing** — The App Router matches the URL to `src/app/(app)/dashboard/page.tsx` (or equivalent nested segment).
3. **Middleware (if configured)** — `middleware.ts` (not yet visible in tree but conventional) intercepts the request to validate session tokens before rendering begins. Unauthenticated requests are redirected to `(auth)/login`.
4. **Layout rendering** — The nearest `layout.tsx` files in the route hierarchy are rendered server-side, establishing the page shell (navigation, sidebar).
5. **Server Component data fetch** — The `page.tsx` Server Component calls functions in `src/lib/api/` directly (server-side fetch with credentials/headers) to retrieve data from the backend API.
6. **Component tree render** — Server Components render HTML; Client Components hydrate in the browser with their interactive state.
7. **Client-side hydration** — `src/components/providers.tsx` initializes Zustand stores and React context on the client. Stores may be seeded with data passed from server components via props.
8. **Subsequent API calls** — User interactions trigger calls through `src/lib/api/` functions (using `fetch` or an HTTP client), updating Zustand stores in `src/stores/` which re-render subscribed components.
9. **Response rendered** — Updated UI reflects new state without full page reload.

---

## Background Job Architecture

This is a **frontend-only** project. There is no background job infrastructure, queue system, or worker process within this repository. Async operations are limited to:

- **Client-side async/await** — API calls made from hooks (`src/lib/hooks/`) or store actions (`src/stores/`) using standard `Promise`-based patterns.
- **React Suspense boundaries** — Used with Server Components to stream partial UI while data loads.

Any background processing (email sending, data pipelines, scheduled tasks) is handled by a separate backend service outside this repository.

---

## Module Interactions

The dependency graph flows strictly top-down to avoid circular dependencies:

```
src/app/ (pages & layouts)
    └── depends on → src/components/
                         └── depends on → src/lib/hooks/
                                              └── depends on → src/lib/api/
                                                                   └── depends on → src/types/
                         └── depends on → src/stores/
                                              └── depends on → src/types/
                         └── depends on → src/lib/utils/
                                              └── depends on → src/types/
```

**Key rules:**
- `src/app/` imports from `src/components/` and `src/lib/` but never the reverse.
- `src/components/` imports from `src/lib/`, `src/stores/`, and `src/types/` but not from `src/app/`.
- `src/stores/` imports from `src/types/` and `src/lib/api/` only.
- `src/lib/api/` imports from `src/types/` only — no store or component imports.
- `src/types/` has no internal imports; it is a pure leaf module.
- `src/components/providers.tsx` is the single aggregation point for all context/store providers, imported once by `src/app/layout.tsx`.

---

## State Management

### Global Client State — Zustand
Two Zustand stores manage persistent client-side state:

- **`src/stores/auth.store.ts`** — Holds the authenticated user object, access token (if stored client-side), authentication status (`authenticated | unauthenticated | loading`), and actions for `login`, `logout`, and `refreshToken`. Components subscribe to slices of this store to conditionally render auth-gated UI.

- **`src/stores/org.store.ts`** — Holds the currently active organization/workspace, the user's list of organizations, and actions to switch the active org. This enables multi-tenant UI where the active org context affects API calls and displayed data.

### Provider Initialization
`src/components/providers.tsx` wraps the application tree (mounted in `src/app/layout.tsx`) and initializes all Zustand stores, React Query (if used), and any React context providers in a single location.

### Server State
Server Components fetch data directly at render time. This data is passed as props to Client Components or used to render static HTML. There is no server-side session store within this frontend project — session validation is delegated to the backend API and/or Next.js middleware via cookies.

### Local Component State
Ephemeral UI state (modal open/close, form field values, loading spinners) is managed with `useState` and `useReducer` within individual components and custom hooks in `src/lib/hooks/`.

---

## Authentication & Authorization

### Token Type
Authentication uses **HTTP-only cookies** or **Bearer tokens** (JWT) issued by the backend. The `auth.store.ts` tracks the decoded user identity and token expiry on the client.

### Auth Flow
1. User submits credentials on a page within `src/app/(auth)/`.
2. The login handler calls `src/lib/api/` which POSTs to the backend auth endpoint.
3. On success, the backend sets an HTTP-only session cookie and/or returns a JWT.
4. `auth.store.ts` is updated with the user object and auth status.
5. The user is redirected into `src/app/(app)/`.

### Route Protection
- **Middleware-level** — Next.js middleware reads the session cookie on every request to `(app)/` routes and redirects unauthenticated users to `(auth)/login`.
- **Layout-level** — The `(app)/layout.tsx` may perform a secondary server-side auth check and redirect if the middleware is bypassed.
- **Component-level** — Client components subscribe to `auth.store.ts`; if `authenticated` is false, they render nothing or redirect.

### Organization Authorization
`org.store.ts` tracks the active organization. API calls made through `src/lib/api/` include the active org identifier (as a header or path parameter). The backend enforces ownership and membership checks — the frontend does not implement authorization logic itself, but it gates UI elements based on the user's role stored in the org store.

---

## Error Handling Strategy

### API Errors
Functions in `src/lib/api/` wrap `fetch` calls and normalize error responses into typed error objects (defined in `src/types/api.types.ts`). HTTP 4xx/5xx responses are thrown as structured errors with `status`, `code`, and `message` fields.

### Hook-Level Handling
Custom hooks in `src/lib/hooks/` catch errors from API calls and expose them via an `error` state value. Components render error states (inline messages, toast notifications) based on this value.

### React Error Boundaries
Next.js `error.tsx` files at route segment boundaries act as React Error Boundaries, catching unhandled rendering errors and displaying a fallback UI without crashing the entire application.

### Auth Errors
HTTP 401 responses intercepted in `src/lib/api/` trigger a logout action on `auth.store.ts`, clearing client state and redirecting the user to `(auth)/login`.

### Form Validation Errors
Client-side validation errors (from a library such as Zod or React Hook Form) are handled locally within form components and never reach the global error handling layer.

### No Worker Failure Handling
As there are no background jobs in this project, there is no retry strategy, dead-letter queue, or worker crash recovery to document.