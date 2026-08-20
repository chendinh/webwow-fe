# PROJECT

## Overview

**webwow-fe** is a TypeScript-based frontend web application built with Next.js 14 and React 18. It serves as the client-facing interface for the WebWow platform, targeting end users who interact with marketing, authentication, and core application workflows. The project follows a route-group architecture separating marketing, authentication, and application concerns. It leverages a modern component library stack (Radix UI + Tailwind CSS) to deliver a polished, accessible user experience. State management is handled via Zustand stores, and server communication is abstracted through Axios with TanStack React Query for data fetching and caching.

## Technology Stack

| Category            | Technology / Library                                      |
|---------------------|-----------------------------------------------------------|
| Primary Language    | TypeScript 5.4                                            |
| Runtime             | Node.js (≥18 recommended for Next.js 14)                 |
| Framework           | Next.js 14.2.3 (App Router)                              |
| UI Framework        | React 18.3                                               |
| Component Library   | Radix UI (Dialog, Dropdown, Label, Select, Tabs, Toast)  |
| Styling             | Tailwind CSS 3.4, tailwind-merge, class-variance-authority |
| Icons               | Lucide React                                             |
| Animation           | Motion (Framer Motion successor) 13.1                    |
| State Management    | Zustand 4.5                                              |
| Data Fetching       | TanStack React Query 5.40, Axios 1.7                     |
| Forms               | React Hook Form 7.52, Zod 3.23, @hookform/resolvers      |
| Date Utilities      | date-fns 3.6                                             |
| Linting             | ESLint 8 with eslint-config-next                         |
| Package Manager     | npm                                                      |
| Database / ORM      | None detected                                            |
| Auth Mechanism      | Client-side auth store (Zustand); inferred token-based   |

## Project Structure

```
webwow-fe/
├── src/
│   ├── app/                  # Next.js App Router root
│   │   ├── (app)/            # Route group: authenticated application pages
│   │   ├── (auth)/           # Route group: login, register, and auth flows
│   │   ├── (marketing)/      # Route group: public-facing marketing pages
│   │   ├── globals.css       # Global CSS / Tailwind base styles
│   │   ├── layout.tsx        # Root layout wrapping all routes
│   │   └── page.tsx          # Root index page (redirect or landing)
│   ├── components/
│   │   ├── common/           # Shared, reusable UI components
│   │   ├── layout/           # Layout-level components (nav, sidebar, etc.)
│   │   ├── marketing/        # Marketing-specific components
│   │   ├── ui/               # Primitive UI components (shadcn/ui style)
│   │   └── providers.tsx     # React context/query providers tree
│   ├── lib/
│   │   ├── api/              # Axios instances and API call definitions
│   │   ├── hooks/            # Custom React hooks
│   │   └── utils/            # Utility/helper functions
│   ├── stores/
│   │   ├── auth.store.ts     # Zustand store for authentication state
│   │   └── org.store.ts      # Zustand store for organisation state
│   └── types/
│       └── api.types.ts      # Shared TypeScript types for API contracts
├── next.config.mjs           # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── postcss.config.mjs        # PostCSS configuration
├── tsconfig.json             # TypeScript compiler configuration
└── package.json              # Project manifest and scripts
```

## Entry Points

| Purpose                  | File Path                        |
|--------------------------|----------------------------------|
| Root HTML layout         | `src/app/layout.tsx`             |
| Root page / index route  | `src/app/page.tsx`               |
| Global styles            | `src/app/globals.css`            |
| Provider tree            | `src/components/providers.tsx`   |
| Next.js configuration    | `next.config.mjs`                |
| TypeScript configuration | `tsconfig.json`                  |

The root layout (`src/app/layout.tsx`) is the primary entry point for all rendered pages. It wraps the application in global providers defined in `src/components/providers.tsx`, which includes TanStack React Query and any other context providers.

## Development Setup

### Prerequisites

- Node.js ≥ 18.x
- npm ≥ 9.x

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd webwow-fe

# Install dependencies
npm install
```

### Running Locally

```bash
# Start the development server on port 3001
npm run dev
```

The application will be available at [http://localhost:3001](http://localhost:3001).

### Additional Scripts

```bash
# Type-check without emitting files
npm run type-check

# Run ESLint
npm run lint

# Build for production
npm run build

# Start the production server on port 3001
npm start
```

## Environment Variables

No `.env.example` file was detected in the repository. Based on the project structure and dependencies, the following environment variables are likely required:

| Variable                        | Description                                              | Required |
|---------------------------------|----------------------------------------------------------|----------|
| `NEXT_PUBLIC_API_BASE_URL`      | Base URL for the backend REST API (used by Axios)        | Yes      |
| `NEXT_PUBLIC_APP_URL`           | Public URL of the frontend application                   | Likely   |
| `NEXT_PUBLIC_APP_ENV`           | Environment identifier (`development`, `production`)     | Optional |

> **Note:** Create a `.env.local` file in the project root and populate it with the required values. Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser bundle.

```bash
# .env.local (example)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## Build & Deploy

### Production Build

```bash
npm run build
```

Next.js outputs the optimised build to the `.next/` directory.

### Starting the Production Server

```bash
npm start
# Serves on port 3001
```

### Deployment Notes

- **No Dockerfile** is present; containerisation must be added manually if required.
- **No CI/CD workflow** is configured; a pipeline (e.g., GitHub Actions) should be added for automated testing and deployment.
- The application is compatible with any Node.js hosting platform that supports Next.js, including **Vercel** (recommended), **AWS App Runner**, **Railway**, or a self-hosted Node.js server.
- For static export (if applicable), add `output: 'export'` to `next.config.mjs` and run `npm run build`.
- Ensure all `NEXT_PUBLIC_*` environment variables are set in the deployment environment before building, as they are inlined at build time.