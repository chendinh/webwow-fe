# BUSINESS_RULES
## Rules

> **Note:** No domain or service files were provided for this project. The following business rules have been inferred from standard React and Next.js architectural patterns, conventions, and best practices typically applied in a project named `webwow-fe`.

---

## 1. Routing & Navigation

| # | Rule | Inferred Location |
|---|------|-------------------|
| 1.1 | All application routes must be defined as file-based routes under the `pages/` or `app/` directory following Next.js conventions. | `pages/**` / `app/**` |
| 1.2 | Dynamic route segments must be enclosed in square brackets (e.g., `[id].tsx`) to enable parameterized routing. | `pages/[id].tsx` / `app/[id]/page.tsx` |
| 1.3 | The root path `/` must resolve to a valid index page component. | `pages/index.tsx` / `app/page.tsx` |
| 1.4 | Catch-all routes (`[...slug]`) must handle unknown paths gracefully and render a 404 or fallback UI. | `pages/404.tsx` / `app/not-found.tsx` |
| 1.5 | Navigation between pages must use the Next.js `<Link>` component rather than native `<a>` tags to preserve client-side routing. | Global layout / navigation components |

---

## 2. Authentication & Authorization

| # | Rule | Inferred Location |
|---|------|-------------------|
| 2.1 | Protected routes must redirect unauthenticated users to the login page before rendering any content. | `middleware.ts` / route guards |
| 2.2 | Authentication state must be persisted and validated on each request via server-side session or token verification. | `middleware.ts` / `_app.tsx` |
| 2.3 | Role-based access control must prevent unauthorized users from accessing admin or privileged pages. | `middleware.ts` / page-level guards |
| 2.4 | Authentication tokens must not be stored in `localStorage`; secure, HTTP-only cookies or server-side sessions are required. | Auth service / API handlers |
| 2.5 | Logout must invalidate the session or token and redirect the user to the public landing page. | Auth service / logout handler |

---

## 3. Data Fetching & API Integration

| # | Rule | Inferred Location |
|---|------|-------------------|
| 3.1 | Server-side data fetching must use `getServerSideProps` or React Server Components to avoid exposing sensitive API keys to the client. | `pages/**` / `app/**` |
| 3.2 | Static data that does not change per request must be fetched using `getStaticProps` with appropriate revalidation intervals. | `pages/**` |
| 3.3 | All API calls must handle error states and return meaningful error messages to the UI layer. | API utility / service layer |
| 3.4 | Client-side data fetching must implement loading and error states to prevent rendering incomplete data. | React components / hooks |
| 3.5 | API routes under `pages/api/` or `app/api/` must validate request methods and reject unsupported HTTP verbs with a `405` response. | `pages/api/**` / `app/api/**` |
| 3.6 | External API base URLs and secrets must be sourced exclusively from environment variables and never hardcoded. | `.env.local` / API service files |

---

## 4. Form Validation & User Input

| # | Rule | Inferred Location |
|---|------|-------------------|
| 4.1 | All user-facing forms must validate required fields before submission and display inline error messages. | Form components |
| 4.2 | Email fields must be validated against a standard email format regex before form submission is allowed. | Form components / validation utils |
| 4.3 | Password fields must enforce a minimum length of at least 8 characters. | Registration / password form components |
| 4.4 | Form submissions must be disabled while a previous submission is in progress to prevent duplicate requests. | Form components |
| 4.5 | User input must be sanitized before being sent to the API to prevent injection attacks. | Form handlers / API utility |
| 4.6 | File upload inputs must enforce allowed file types and maximum file size limits before uploading. | File upload components |

---

## 5. State Management

| # | Rule | Inferred Location |
|---|------|-------------------|
| 5.1 | Global application state must be managed through a centralized store (e.g., Redux, Zustand, or React Context) and not duplicated across components. | `store/` / `context/` |
| 5.2 | Component-local state must not be promoted to global state unless it is consumed by more than one unrelated component. | React components |
| 5.3 | Derived state must be computed from existing state rather than stored as a separate state value to avoid inconsistency. | Selectors / computed values |
| 5.4 | State updates must be immutable; direct mutation of state objects is prohibited. | Store reducers / state handlers |

---

## 6. Component Architecture

| # | Rule | Inferred Location |
|---|------|-------------------|
| 6.1 | Presentational components must not contain business logic or direct API calls; they must receive data exclusively via props. | UI components |
| 6.2 | Container components or custom hooks must be responsible for data fetching and passing results to presentational components. | Container components / `hooks/` |
| 6.3 | Reusable UI components must be placed in a shared `components/` directory and must not contain page-specific logic. | `components/` |
| 6.4 | Each component file must export a single default component matching the file name. | All component files |
| 6.5 | Components must define PropTypes or TypeScript interfaces for all props to enforce type safety. | All component files |

---

## 7. Performance & Optimization

| # | Rule | Inferred Location |
|---|------|-------------------|
| 7.1 | Images must be rendered using the Next.js `<Image>` component to enforce automatic optimization, lazy loading, and correct sizing. | All components rendering images |
| 7.2 | Third-party scripts must be loaded using the Next.js `<Script>` component with an appropriate loading strategy (`lazyOnload`, `afterInteractive`). | Layout / `_document.tsx` |
| 7.3 | Large components or pages that are not required on initial load must be dynamically imported using `next/dynamic`. | Page components / heavy UI components |
| 7.4 | Memoization (`React.memo`, `useMemo`, `useCallback`) must be applied to components and values that are computationally expensive or cause unnecessary re-renders. | Performance-critical components |

---

## 8. SEO & Metadata

| # | Rule | Inferred Location |
|---|------|-------------------|
| 8.1 | Every page must define a unique `<title>` and `<meta name="description">` tag using Next.js `<Head>` or the Metadata API. | `pages/**` / `app/**/layout.tsx` |
| 8.2 | Open Graph and social sharing metadata must be present on all public-facing pages. | Page-level metadata / layout |
| 8.3 | A `robots.txt` and `sitemap.xml` must be generated and served to support search engine indexing. | `public/robots.txt` / sitemap generator |

---

## 9. Error Handling & Logging

| # | Rule | Inferred Location |
|---|------|-------------------|
| 9.1 | A custom `_error.tsx` or `error.tsx` boundary must be implemented to handle unexpected runtime errors gracefully. | `pages/_error.tsx` / `app/error.tsx` |
| 9.2 | All unhandled promise rejections in async operations must be caught and surfaced to the user or logged. | API utilities / async handlers |
| 9.3 | Client-side errors must be reported to an error monitoring service (e.g., Sentry) in production environments. | `_app.tsx` / error boundary |
| 9.4 | Console logging of sensitive data (tokens, passwords, PII) is strictly prohibited in any environment. | All files |

---

## 10. Environment & Configuration

| # | Rule | Inferred Location |
|---|------|-------------------|
| 10.1 | Environment variables exposed to the browser must be prefixed with `NEXT_PUBLIC_`; all other variables remain server-side only. | `.env.local` / `next.config.js` |
| 10.2 | The `next.config.js` file must define allowed image domains for the Next.js Image Optimization API. | `next.config.js` |
| 10.3 | Production builds must not include development-only dependencies or debug tooling. | `package.json` / build pipeline |
| 10.4 | The application must pass `next build` without errors or type errors before deployment. | CI/CD pipeline |

---

## 11. Accessibility (a11y)

| # | Rule | Inferred Location |
|---|------|-------------------|
| 11.1 | All interactive elements must be keyboard-navigable and must have visible focus indicators. | UI components |
| 11.2 | Images must include descriptive `alt` attributes; decorative images must use `alt=""`. | All components rendering images |
| 11.3 | Form inputs must be associated with visible `<label>` elements using `htmlFor` / `id` pairing. | Form components |
| 11.4 | Color contrast ratios must meet WCAG 2.1 AA standards for all text and interactive elements. | Global styles / theme |