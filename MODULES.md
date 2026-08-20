# MODULES
## Module Index

- [App](#app)
- [App (app)](#app-app)
- [App (auth)](#app-auth)
- [App (marketing)](#app-marketing)
- [Components Common](#components-common)
- [Components Layout](#components-layout)
- [Components Marketing](#components-marketing)
- [Components UI](#components-ui)
- [Providers](#providers)
- [Lib API](#lib-api)
- [Lib Hooks](#lib-hooks)
- [Lib Utils](#lib-utils)
- [Stores](#stores)
- [Types](#types)

---

### App

- **Location:** `src/app/`
- **Type:** feature
- **Responsibility:** Root Next.js App Router directory containing the global layout, root page, and global CSS. Serves as the entry point for all route groups and page rendering.

---

### App (app)

- **Location:** `src/app/(app)/`
- **Type:** feature
- **Responsibility:** Route group encapsulating the authenticated application shell and its associated pages. Provides the layout and routing context for logged-in users accessing core product features.

---

### App (auth)

- **Location:** `src/app/(auth)/`
- **Type:** feature
- **Responsibility:** Route group handling authentication-related pages such as login, registration, and password reset. Isolates auth flows from the main application and marketing layouts.

---

### App (marketing)

- **Location:** `src/app/(marketing)/`
- **Type:** feature
- **Responsibility:** Route group containing public-facing marketing pages such as the landing page, pricing, and about sections. Renders with a distinct layout optimized for unauthenticated visitors.

---

### Components Common

- **Location:** `src/components/common/`
- **Type:** shared
- **Responsibility:** Reusable, domain-agnostic components shared across multiple features and route groups. Includes general-purpose UI elements that do not belong to a specific feature or the base UI library.

---

### Components Layout

- **Location:** `src/components/layout/`
- **Type:** shared
- **Responsibility:** Structural layout components such as headers, footers, sidebars, and navigation wrappers. Consumed by route group layouts to compose consistent page scaffolding.

---

### Components Marketing

- **Location:** `src/components/marketing/`
- **Type:** feature
- **Responsibility:** Components purpose-built for marketing and public-facing pages, such as hero sections, feature grids, and call-to-action blocks. Scoped to the marketing route group.

---

### Components UI

- **Location:** `src/components/ui/`
- **Type:** shared
- **Responsibility:** Low-level, primitive UI components forming the project's design system (e.g., buttons, inputs, modals, badges). Intended to be composable building blocks consumed by all other component layers.

---

### Providers

- **Location:** `src/components/providers.tsx`
- **Type:** shared
- **Responsibility:** Aggregates and wraps global React context providers (e.g., auth, theme, query client) into a single component. Mounted at the root layout to make shared state available throughout the application.

---

### Lib API

- **Location:** `src/lib/api/`
- **Type:** utility
- **Responsibility:** Centralizes API client configuration, request helpers, and service functions for communicating with backend endpoints. Abstracts HTTP logic away from components and stores.

---

### Lib Hooks

- **Location:** `src/lib/hooks/`
- **Type:** utility
- **Responsibility:** Custom React hooks encapsulating reusable stateful logic and side effects. Promotes separation of concerns by keeping data-fetching and business logic out of UI components.

---

### Lib Utils

- **Location:** `src/lib/utils/`
- **Type:** utility
- **Responsibility:** Pure utility and helper functions used across the codebase (e.g., formatting, validation, class name merging). Contains no React-specific code and has no side effects.

---

### Stores

- **Location:** `src/stores/`
- **Type:** feature
- **Responsibility:** Global client-side state stores managing authentication (`auth.store.ts`) and organization (`org.store.ts`) state. Provides reactive, shared state accessible across components without prop drilling.

---

### Types

- **Location:** `src/types/`
- **Type:** utility
- **Responsibility:** Centralized TypeScript type definitions and interfaces for the project, including API response and request shapes (`api.types.ts`). Ensures consistent typing across the application layers.