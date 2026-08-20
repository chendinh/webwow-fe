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
- **Responsibility:** Root Next.js App Router directory containing the global layout, global styles, and the top-level entry page. Serves as the application shell that wraps all route groups.

---

### App (app)

- **Location:** `src/app/(app)/`
- **Type:** feature
- **Responsibility:** Route group encapsulating the authenticated application experience. Contains pages and layouts accessible only to logged-in users, such as dashboards and protected features.

---

### App (auth)

- **Location:** `src/app/(auth)/`
- **Type:** feature
- **Responsibility:** Route group handling authentication flows including login, registration, and password recovery. Provides dedicated layouts and pages for unauthenticated user journeys.

---

### App (marketing)

- **Location:** `src/app/(marketing)/`
- **Type:** feature
- **Responsibility:** Route group for public-facing marketing pages such as the landing page, pricing, and about sections. Operates independently of authentication state with its own layout.

---

### Components Common

- **Location:** `src/components/common/`
- **Type:** shared
- **Responsibility:** Houses reusable, general-purpose React components shared across multiple features and route groups. Includes elements such as buttons, modals, and form controls that are not tied to a specific domain.

---

### Components Layout

- **Location:** `src/components/layout/`
- **Type:** shared
- **Responsibility:** Contains structural layout components such as headers, footers, sidebars, and navigation bars. These components define the visual scaffolding used across different sections of the application.

---

### Components Marketing

- **Location:** `src/components/marketing/`
- **Type:** feature
- **Responsibility:** Provides React components specific to the marketing and public-facing pages, such as hero sections, feature highlights, and call-to-action blocks. Scoped to the marketing route group.

---

### Components UI

- **Location:** `src/components/ui/`
- **Type:** shared
- **Responsibility:** Low-level, design-system-aligned UI primitives such as typography, badges, cards, and input elements. Intended to be composed by higher-level feature and common components throughout the application.

---

### Providers

- **Location:** `src/components/providers.tsx`
- **Type:** shared
- **Responsibility:** Aggregates and wraps the application with all necessary React context providers, such as authentication, theming, and state management. Acts as the single provider boundary consumed by the root layout.

---

### Lib API

- **Location:** `src/lib/api/`
- **Type:** utility
- **Responsibility:** Centralises API client configuration, request helpers, and service modules for communicating with backend endpoints. Abstracts HTTP logic away from UI components and stores.

---

### Lib Hooks

- **Location:** `src/lib/hooks/`
- **Type:** utility
- **Responsibility:** Contains custom React hooks that encapsulate reusable stateful logic, side effects, and data-fetching patterns. Promotes separation of concerns by keeping logic out of component bodies.

---

### Lib Utils

- **Location:** `src/lib/utils/`
- **Type:** utility
- **Responsibility:** Provides pure utility and helper functions used across the codebase, such as formatting, validation, and class name merging. Functions here have no React or framework dependencies.

---

### Stores

- **Location:** `src/stores/`
- **Type:** utility
- **Responsibility:** Manages global client-side state using store modules for authentication (`auth.store.ts`) and organisation context (`org.store.ts`). Provides reactive state accessible across components without prop drilling.

---

### Types

- **Location:** `src/types/`
- **Type:** shared
- **Responsibility:** Defines shared TypeScript interfaces, types, and enumerations used throughout the project, including API response and request shapes (`api.types.ts`). Ensures type consistency across the frontend codebase.