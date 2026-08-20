# OVERVIEW

## Product Summary

webwow-fe is the frontend web application for the WebWow platform, a SaaS product that serves organizations and their members through a structured multi-tenant interface. The application provides both a public-facing marketing surface and an authenticated product experience, separated via Next.js route groups. Users are likely business teams or organizations that sign up, authenticate, and then operate within an organization context to access the platform's core features. The app is built as a modern React/Next.js 14 SPA-style frontend that communicates with a separate backend API over HTTP. It handles authentication state, organization context switching, and a component-driven UI built on Radix UI primitives styled with Tailwind CSS. The product is in early-stage development (v0.1.0), with foundational architecture in place but feature completeness still evolving.

## Core User Journeys

### 1. Marketing Discovery → Sign Up
1. Visitor lands on the public marketing page (`/` or routes under `(marketing)`).
2. Visitor browses marketing content rendered by `src/components/marketing/` components.
3. Visitor clicks a call-to-action to sign up, navigating to the `(auth)` route group.
4. Visitor completes a registration form validated with `react-hook-form` + `zod`.
5. On success, the user is redirected into the authenticated `(app)` experience.

### 2. Authentication (Login)
1. Unauthenticated user navigates to a login route under `(auth)`.
2. User submits credentials via a validated form.
3. The frontend calls the backend API via `axios` (configured in `src/lib/api/`).
4. On success, auth state is persisted in the Zustand `auth.store.ts`.
5. User is redirected to the main app dashboard inside `(app)`.

### 3. Organization Context Selection
1. Authenticated user enters the `(app)` route group.
2. The app reads or fetches the user's available organizations.
3. Active organization is stored in `org.store.ts` (Zustand).
4. All subsequent API calls and UI rendering are scoped to the active organization.
5. User may switch organizations via a dropdown in the layout, updating the store.

### 4. Core App Feature Usage
1. User navigates within the `(app)` route group using the app layout (`src/components/layout/`).
2. Data is fetched via TanStack Query hooks defined in `src/lib/hooks/`.
3. UI state (modals, toasts, dialogs) is managed via Radix UI components in `src/components/ui/`.
4. User performs actions (form submissions, selections) that trigger API mutations.
5. Optimistic updates or cache invalidations via TanStack Query reflect changes in the UI.

### 5. Error / Toast Feedback Loop
1. An API call fails or a form validation error occurs.
2. The error is caught in a query/mutation handler or form resolver.
3. A Radix UI Toast notification is triggered to surface the error to the user.
4. The user corrects input or retries the action.

## Key Domain Concepts

- **Organization (Org)**: The primary multi-tenant unit; all authenticated app features are scoped to an active organization, tracked in `org.store.ts`.
- **Auth State**: The authenticated user's session data (tokens, user identity) persisted in `auth.store.ts` via Zustand.
- **Route Group `(app)`**: The protected, authenticated section of the Next.js app where core product features live.
- **Route Group `(auth)`**: The unauthenticated section handling login, registration, and related flows.
- **Route Group `(marketing)`**: The public-facing marketing pages visible to unauthenticated visitors.
- **API Client**: The centralized Axios-based HTTP client in `src/lib/api/` used for all backend communication.
- **Query Hook**: A TanStack Query-based custom hook in `src/lib/hooks/` that encapsulates data fetching and caching for a specific resource.
- **Store**: A Zustand global state slice (e.g., `auth.store.ts`, `org.store.ts`) that holds client-side state shared across components.
- **UI Primitive**: A Radix UI component (Dialog, Select, Tabs, Toast, etc.) wrapped and styled in `src/components/ui/` for consistent design system usage.
- **Provider**: The `src/components/providers.tsx` component that wraps the app with global context providers (TanStack Query client, Toast provider, etc.).
- **API Types**: Shared TypeScript interfaces in `src/types/api.types.ts` that define the shape of backend request/response payloads.
- **Form Validation Schema**: A `zod` schema paired with `react-hook-form` + `@hookform/resolvers` used to validate user input before submission.
- **Layout Component**: Components in `src/components/layout/` that define the shell (nav, sidebar, header) for the authenticated app experience.

## System Boundaries

### What This System DOES
- Renders the full user interface for the WebWow platform (marketing, auth, and app surfaces).
- Manages client-side authentication state and organization context.
- Communicates with a backend REST API over HTTP using Axios.
- Handles form input, validation, and submission for all user-facing workflows.
- Caches and synchronizes server state using TanStack Query.
- Provides a responsive, accessible UI via Radix UI + Tailwind CSS.

### What This System Does NOT Do
- Does NOT implement any backend logic, database access, or server-side business rules.
- Does NOT handle payments, billing, or subscription management directly (no payment SDK detected).
- Does NOT include end-to-end or unit tests (no test framework detected in dependencies).
- Does NOT have a CI/CD pipeline configured.
- Does NOT run in a container (no Dockerfile present).
- Does NOT manage file uploads, media processing, or real-time WebSocket connections (none detected).

### External Integrations
- **Backend API**: A separate service (URL likely configured via environment variable) that handles all business logic and data persistence.
- No third-party OAuth providers, analytics SDKs, or payment processors are currently wired in at the dependency level.

## Data Flow

1. **User Action**: The user interacts with a UI component (form submit, button click, navigation).
2. **Form Validation**: If a form is involved, `react-hook-form` + `zod` validates input client-side before any network call is made.
3. **API Call**: A TanStack Query mutation or query hook calls a function from `src/lib/api/`, which uses the Axios client to make an HTTP request to the backend API.
4. **Auth Headers**: The Axios client attaches authentication tokens from `auth.store.ts` (via an interceptor or manual header injection) to outbound requests.
5. **Backend Response**: The backend returns a typed response matching shapes defined in `src/types/api.types.ts`.
6. **Cache Update**: TanStack Query updates its cache; dependent components re-render with fresh data automatically.
7. **UI Feedback**: Success or error states are surfaced via Radix UI Toast notifications or inline form error messages.
8. **Store Update**: If the response affects global state (e.g., login, org switch), the relevant Zustand store is updated, triggering re-renders across subscribed components.

## Critical Invariants

1. **All authenticated routes must be protected**: No component or page inside `(app)` should render sensitive data without verifying auth state from `auth.store.ts` first.
2. **All API calls must be org-scoped where applicable**: Any request that operates on org-level resources must include the active organization identifier from `org.store.ts`; never assume a default.
3. **Never bypass zod validation on form submission**: All user-submitted data must pass through a zod schema before being sent to the API — no raw unvalidated payloads.
4. **API types must be the single source of truth for payload shapes**: Always use types from `src/types/api.types.ts` for request/response typing; do not inline ad-hoc type definitions in components.
5. **Zustand stores are client-only**: Never attempt to access `auth.store.ts` or `org.store.ts` in Next.js server components or during SSR without a hydration guard.
6. **UI primitives must come from `src/components/ui/`**: Do not use raw Radix UI components directly in feature code; always use the wrapped, styled versions to maintain design consistency.
7. **TanStack Query is the only mechanism for server state**: Do not use `useState` or Zustand to cache server-fetched data; server state belongs in TanStack Query's cache.
8. **Environment-specific configuration (API base URL, etc.) must come from environment variables**: Never hardcode backend URLs or secrets in source code.
9. **TypeScript strict mode must be respected**: The codebase uses `tsc --noEmit` as a check; all new code must be type-safe with no `any` escapes unless explicitly justified and commented.
10. **The `(marketing)`, `(auth)`, and `(app)` route groups must remain cleanly separated**: Do not import app-specific components into marketing pages or auth pages into the app shell.

## Known Limitations & Technical Debt

- **No test coverage**: There are zero unit, integration, or end-to-end tests. Any refactor or new feature carries unquantified regression risk.
- **No CI/CD pipeline**: Builds and deployments are entirely manual. There is no automated lint, type-check, or build gate on pull requests.
- **No Dockerfile or deployment configuration**: The production deployment strategy is undefined in this repository; environment setup is undocumented.
- **Minimal README**: The README contains only the project name with no setup instructions, environment variable documentation, or architecture notes.
- **Auth implementation details are opaque**: It is unclear from the file tree whether token refresh, expiry handling, or secure storage (httpOnly cookies vs. localStorage) is properly implemented in `auth.store.ts`.
- **No error boundary implementation detected**: There are no React error boundaries visible in the file tree, meaning unhandled render errors will crash the entire app subtree.
- **Route protection mechanism is unknown**: There is no visible middleware (`middleware.ts`) in the file tree, so how unauthenticated users are redirected from `(app)` routes is unclear and may be inconsistent.
- **`motion` library version mismatch risk**: The dependency is listed as `"motion": "^13.1.0"` rather than `"framer-motion"`, which is an unusual package name and may indicate a fork or alias that could cause confusion.
- **No internationalization (i18n) support**: All strings appear to be hardcoded in English with no i18n framework in place, which will be costly to retrofit later.
- **Early-stage feature completeness**: At v0.1.0, many features visible in the route structure may be stubs or partially implemented; treat all `(app)` sub-routes as potentially incomplete.