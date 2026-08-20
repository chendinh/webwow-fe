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
├── postcss.config.mjs      # PostCSS configuration used by Tailwind CSS
├── tailwind.config.ts      # Tailwind CSS theme, content paths, and plugin configuration
├── tsconfig.json           # TypeScript compiler options and path aliases
├── tsconfig.tsbuildinfo    # TypeScript incremental build cache
└── src/                    # All application source code lives here
    ├── app/                # Next.js App Router: route segments, layouts, and pages
    │   ├── (app)/          # Route group for authenticated application shell
    │   ├── (auth)/         # Route group for authentication flows (login, register, etc.)
    │   ├── (marketing)/    # Route group for public-facing marketing pages
    │   ├── globals.css     # Global CSS resets and Tailwind base imports
    │   ├── layout.tsx      # Root layout: wraps all routes with providers and global UI
    │   └── page.tsx        # Root page (likely redirect or landing entry point)
    ├── components/         # Reusable React components organized by concern
    │   ├── common/         # Shared utility components used across multiple route groups
    │   ├── layout/         # Structural layout components (nav, sidebar, header, footer)
    │   ├── marketing/      # Components specific to marketing/public pages
    │   ├── providers.tsx   # Aggregated React context and store providers tree
    │   └── ui/             # Low-level, design-system-level UI primitives (buttons, inputs, etc.)
    ├── lib/                # Non-component logic: API clients, hooks, and utilities
    │   ├── api/            # API client modules for communicating with backend services
    │   ├── hooks/          # Custom React hooks encapsulating reusable stateful logic
    │   └── utils/          # Pure utility/helper functions (formatting, validation, etc.)
    ├── stores/             # Zustand global state stores
    │   ├── auth.store.ts   # Authentication state: user session, tokens, login/logout actions
    │   └── org.store.ts    # Organization/tenant state: active org, membership, switching
    └── types/              # Shared TypeScript type definitions
        └── api.types.ts    # Types mirroring backend API request/response shapes
```

---

## Architectural Patterns

### Next.js App Router
The project uses the **Next.js 13+ App Router** (`src/app/`) rather than the legacy Pages Router. Routes are defined as file-system segments. Parenthesized directories `(app)`, `(auth)`, and `(marketing)` are **route groups** — they organize routes without affecting the URL path, allowing each group to have its own nested layout.

### Layered Frontend Architecture
The codebase follows a clear layered separation:

| Layer | Location | Responsibility |
|---|---|---|
| Routing / Pages | `src/app/` | URL segments, layouts, page entry points |
| Components | `src/components/` | Presentational and composite UI |
| State | `src/stores/` | Global client-side state via Zustand |
| Data Access | `src/lib/api/` | HTTP calls to external backend APIs |
| Logic | `src/lib/hooks/`, `src/lib/utils/` | Reusable hooks and pure functions |
| Types | `src/types/` | Shared TypeScript contracts |

### Server vs Client Components
- **Server Components** (default in App Router) are used for layouts and pages that do not require interactivity or browser APIs. They render on the server, reducing client bundle size.
- **Client Components** (marked with `"use client"`) are used for interactive UI, components that consume Zustand stores, or components using browser APIs (e.g., `localStorage`, event listeners).
- `src/components/providers.tsx` is a Client Component that wraps the tree with context/store providers, enabling child Server Components to remain server-rendered while still having access to client state where needed.

### Multi-Tenant / Org-Scoped Design
The presence of `org.store.ts` alongside `auth.store.ts` indicates a **multi-tenant architecture** where users belong to one or more organizations. The active organization context is maintained globally and likely scopes all API requests.

### Utility-First Styling
Tailwind CSS is used exclusively for styling, configured via `tailwind.config.ts` and processed through PostCSS. No CSS Modules or styled-components are used.

---

## Request Lifecycle

A typical authenticated page request flows as follows:

1. **Browser** navigates to a URL (e.g., `/dashboard`).
2. **Next.js Router** matches the URL to `src/app/(app)/dashboard/page.tsx` via the App Router file-system convention.
3. **Root Layout** (`src/app/layout.tsx`) renders first, mounting `src/components/providers.tsx` which initializes Zustand stores and any React context providers.
4. **Route Group Layout** (`src/app/(app)/layout.tsx`) renders next — this layout is responsible for authentication guards (checking `auth.store` for a valid session) and rendering the application shell (sidebar, header via `src/components/layout/`).
5. **Page Component** (`page.tsx`) renders. If it is a Server Component, it may fetch data directly. If it is a Client Component, it calls custom hooks from `src/lib/hooks/`.
6. **Custom Hook** (e.g., `useProjects`) calls an API client function from `src/lib/api/`.
7. **API Client** (`src/lib/api/`) constructs an HTTP request, attaches the auth token from `auth.store`, and the active org ID from `org.store`, then calls the external backend REST API.
8. **Backend API** processes the request and returns a JSON response typed by `src/types/api.types.ts`.
9. **API Client** returns the parsed response to the hook, which updates local or global state.
10. **Component** re-renders with the new data, displaying the UI to the user.

---

## Background Job Architecture

This is a **frontend-only** Next.js application. There are no background job queues, workers, or async job processors in this codebase. Any background processing (e.g., email sending, data pipelines) is handled entirely by the external backend API that this frontend communicates with.

If background-like behavior is needed on the client side (e.g., polling), it is implemented via `setInterval` or React Query-style refetch intervals within custom hooks in `src/lib/hooks/`.

---

## Module Interactions

```
src/app/ (pages & layouts)
    └── depends on → src/components/
    └── depends on → src/lib/hooks/
    └── depends on → src/stores/

src/components/
    └── depends on → src/lib/hooks/
    └── depends on → src/lib/utils/
    └── depends on → src/stores/
    └── depends on → src/types/

src/lib/hooks/
    └── depends on → src/lib/api/
    └── depends on → src/stores/
    └── depends on → src/types/

src/lib/api/
    └── depends on → src/stores/ (reads auth token, org ID)
    └── depends on → src/types/

src/stores/
    └── depends on → src/types/ (typed state shapes)
    └── NO dependency on components, hooks, or api (avoids circular deps)

src/types/
    └── NO dependencies (pure type definitions — leaf module)

src/lib/utils/
    └── NO dependencies on stores or components (pure functions — leaf module)
```

**Key rules enforced by this structure:**
- `src/types/` and `src/lib/utils/` are leaf modules with no internal dependencies.
- `src/stores/` does not import from `src/lib/api/` directly to avoid circular dependencies; API calls are initiated from hooks, not stores.
- `src/components/ui/` does not import from `src/stores/` — UI primitives are stateless and receive all data via props.

---

## State Management

### Global Client State — Zustand
Two Zustand stores manage global application state:

**`src/stores/auth.store.ts`**
- Holds: current user object, authentication token (JWT or session token), authentication status (`authenticated | unauthenticated | loading`).
- Actions: `login()`, `logout()`, `setUser()`, `setToken()`.
- Persistence: likely uses Zustand's `persist` middleware to sync token to `localStorage` or `sessionStorage` for session continuity across page refreshes.

**`src/stores/org.store.ts`**
- Holds: list of organizations the user belongs to, the currently active organization ID/object.
- Actions: `setOrganizations()`, `setActiveOrg()`, `switchOrg()`.
- Consumed by: API client (to scope requests), layout components (to display org name/switcher).

### Local Component State
Standard React `useState` and `useReducer` are used for ephemeral UI state (form inputs, modal open/close, loading spinners) that does not need to be shared globally.

### Server State / Data Fetching
Custom hooks in `src/lib/hooks/` manage server state (fetched data, loading, error states). These hooks wrap `src/lib/api/` calls. Depending on project requirements, React Query (`@tanstack/react-query`) may be integrated and initialized in `src/components/providers.tsx`.

### React Context
`src/components/providers.tsx` serves as the single aggregation point for all providers (Zustand store hydration, React Query client, theme context, etc.), keeping `src/app/layout.tsx` clean.

---

## Authentication & Authorization

### Token Type
Authentication uses a **bearer token** (JWT or opaque token) issued by the external backend API upon successful login. The token is stored in `auth.store.ts` and persisted client-side.

### Auth Flow
1. Unauthenticated user visits a protected route under `(app)/`.
2. The `(app)` route group layout checks `auth.store` for a valid token.
3. If no token is present, the layout redirects to `/login` (within the `(auth)/` route group).
4. On the login page, credentials are submitted via `src/lib/api/` to the backend.
5. On success, the returned token and user object are written to `auth.store` (and persisted).
6. The user is redirected to the application.

### Authorization & Org Scoping
- **Organization ownership checks** are enforced server-side by the backend API. The frontend passes the active `orgId` (from `org.store`) as a header or path parameter on every API request.
- The frontend enforces **UI-level authorization** by conditionally rendering features based on the user's role stored in `auth.store` (e.g., hiding admin-only controls for non-admin users).
- Route group `(app)/` acts as the authenticated boundary; `(marketing)/` and `(auth)/` are publicly accessible.

---

## Error Handling Strategy

### API Errors
- The API client in `src/lib/api/` wraps all `fetch` calls in `try/catch` blocks.
- HTTP error responses (4xx, 5xx) are detected by checking `response.ok`. A normalized error object (containing `status`, `message`, and optionally `code`) is thrown or returned.
- Error shapes are typed via `src/types/api.types.ts` (e.g., `ApiError` type).

### Hook-Level Error Handling
- Custom hooks in `src/lib/hooks/` catch errors from API calls and expose an `error` state alongside `data` and `isLoading`.
- Components consume the `error` state to render user-facing error messages or fallback UI.

### Global Error Boundaries
- Next.js App Router supports `error.tsx` files at each route segment level. These act as React Error Boundaries, catching unhandled rendering errors and displaying a fallback UI without crashing the entire application.
- A root-level `error.tsx` may exist within `src/app/` for catch-all error handling.

### Authentication Errors
- A 401 response from the API triggers a logout action in `auth.store` (clearing the token) and redirects the user to the login page, handled centrally in the API client interceptor logic.

### Form Validation Errors
- Client-side validation errors (e.g., from a form library or manual validation in `src/lib/utils/`) are handled locally within components and displayed inline, never reaching the API layer.