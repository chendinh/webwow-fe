# CONVENTIONS
## TypeScript

### Compiler Target & Libraries
- Target runtime libraries: `dom`, `dom.iterable`, and `esnext`.
- ESNext module syntax is used throughout (`"module": "esnext"`).
- Module resolution strategy is set to `bundler`, aligning with Next.js and modern bundlers (e.g., Turbopack/Webpack 5).

### Strict Mode
- TypeScript `strict` mode is **enabled**. All strict type-checking options apply, including:
  - `strictNullChecks`
  - `strictFunctionTypes`
  - `noImplicitAny`
  - `strictPropertyInitialization`
- All new code must be fully type-safe. Avoid `any` unless absolutely necessary and document the reason with a comment.

### JavaScript Interop
- `allowJs` is **enabled** — plain `.js` files are permitted in the project.
- `skipLibCheck` is **enabled** — type errors in `node_modules` declaration files are ignored.
- `esModuleInterop` is **enabled** — use default imports for CommonJS modules (e.g., `import fs from 'fs'`).

### Emit & Build
- `noEmit` is **enabled** — TypeScript is used for type-checking only; the Next.js build pipeline handles transpilation.
- `incremental` compilation is **enabled** — TypeScript caches build information to speed up subsequent type checks.
- `isolatedModules` is **enabled** — every file must be a valid standalone module. Avoid constructs that require cross-file type information at emit time (e.g., `const enum`, ambient module re-exports without `export {}`).

### JSX
- JSX transform is set to `preserve` — Next.js handles JSX transformation. Use `.tsx` for files containing JSX.

### JSON Modules
- `resolveJsonModule` is **enabled** — JSON files may be imported directly as typed modules.
  ```ts
  import config from '@/config/settings.json';
  ```

### Path Aliases
- The `@/` alias maps to `./src/`. Always use this alias for internal imports instead of relative paths that traverse more than one directory level.
  ```ts
  // Preferred
  import { Button } from '@/components/Button';

  // Avoid
  import { Button } from '../../../components/Button';
  ```

### Next.js Plugin
- The `next` TypeScript plugin is active. It provides enhanced type checking for Next.js-specific APIs (e.g., `page.tsx` props, route handlers).

### Included & Excluded Files
- Included: `next-env.d.ts`, all `**/*.ts` and `**/*.tsx` files, and `.next/types/**/*.ts`.
- Excluded: `node_modules` and `src/example-ui`. Do not place production code inside `src/example-ui`; it is not type-checked.

### File Naming
- Use `.tsx` for files that contain JSX markup.
- Use `.ts` for pure logic, utilities, types, and configuration files with no JSX.

### Type Declarations
- Prefer explicit return types on exported functions and React components.
- Define shared types and interfaces in dedicated `*.types.ts` or `types/` files under `src/`.
- Use `type` for object shapes and unions; use `interface` when declaration merging is needed.

---

## Linting

### Status
- **No ESLint configuration is present** in this project.

### Recommended Setup
Until an ESLint config is added, follow these conventions manually:

- Do not use `var`. Use `const` by default; use `let` only when reassignment is required.
- Do not leave `console.log` statements in committed code. Use a logger utility or remove before committing.
- Do not use `// @ts-ignore`. Prefer `// @ts-expect-error` with an explanatory comment if suppression is truly necessary.
- Avoid unused variables and imports. TypeScript's `strict` mode will catch many of these.
- No unused function parameters. Prefix intentionally unused parameters with `_` (e.g., `_event`).

### Recommended ESLint Configuration (Future)
When adding ESLint, use the following baseline:
- `eslint-config-next` (includes React, React Hooks, and Next.js rules)
- `@typescript-eslint/eslint-plugin` with `recommended-type-checked` ruleset
- Enable `plugin:react-hooks/recommended` to enforce Rules of Hooks

---

## Formatting

### Status
- **No Prettier configuration is present** in this project.

### Recommended Conventions
Until a formatter is enforced, adhere to the following style rules consistently:

#### Indentation & Spacing
- Use **2 spaces** for indentation. Do not use tabs.
- Place a single blank line between top-level declarations.
- No trailing whitespace on any line.

#### Quotes
- Use **single quotes** for strings in TypeScript/JavaScript.
- Use **double quotes** for JSX attribute values.
  ```tsx
  const label = 'Submit';
  return <Button className="primary">{label}</Button>;
  ```

#### Semicolons
- **Always** include semicolons at the end of statements.

#### Trailing Commas
- Use trailing commas in multi-line arrays, objects, function parameters, and generics.
  ```ts
  const config = {
    host: 'localhost',
    port: 3000,
  };
  ```

#### Line Length
- Keep lines to a maximum of **100 characters**.

#### Imports Order
Organize imports in the following order, separated by blank lines:
1. Node built-ins (if applicable)
2. External packages (e.g., `react`, `next`)
3. Internal aliases (`@/...`)
4. Relative imports (`./`, `../`)
5. Type-only imports (`import type ...`)

#### Brackets & Braces
- Always use braces for control flow blocks, even single-line bodies.
  ```ts
  // Preferred
  if (isValid) {
    process();
  }

  // Avoid
  if (isValid) process();
  ```

### Recommended Prettier Configuration (Future)
When adding Prettier, use the following baseline `.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "jsxSingleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}