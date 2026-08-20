# CONVENTIONS
## TypeScript

### Compiler Target & Libraries
- Target environment includes `dom`, `dom.iterable`, and `esnext` standard libraries.
- Module format is `esnext` with `bundler` module resolution strategy (optimized for Next.js/Vite-style bundlers).

### Strict Mode
- `strict` is enabled. All strict type-checking options are enforced, including:
  - `strictNullChecks`
  - `strictFunctionTypes`
  - `noImplicitAny`
  - `strictBindCallApply`

### JavaScript Interop
- `allowJs` is enabled — JavaScript files (`.js`, `.jsx`) are permitted alongside TypeScript files.
- `skipLibCheck` is enabled — type-checking of declaration files in `node_modules` is skipped for faster builds.
- `esModuleInterop` is enabled — allows default imports from CommonJS modules without explicit namespace imports.

### Module & Path Aliases
- `resolveJsonModule` is enabled — JSON files can be imported directly as modules.
- `isolatedModules` is enabled — each file must be independently transpilable; avoid constructs that require cross-file type information (e.g., `const enum`, namespace merging across files).
- Path alias `@/*` maps to `./src/*`. Always use `@/` for absolute imports within the `src` directory. Avoid relative paths that traverse more than one directory level.

### JSX
- JSX transform is set to `preserve` — Next.js handles JSX transformation downstream. Do not configure a custom JSX factory.

### Build Behavior
- `noEmit` is enabled — the TypeScript compiler is used for type-checking only; the bundler (Next.js) handles output emission.
- `incremental` is enabled — TypeScript caches build information for faster subsequent type-checks.
- The `next` TypeScript plugin is active — provides enhanced IDE support and Next.js-specific type checking.

### File Inclusion & Exclusion
- Included: `next-env.d.ts`, all `**/*.ts` and `**/*.tsx` files, and `.next/types/**/*.ts`.
- Excluded: `node_modules` and `src/example-ui`. Do not place production source code inside `src/example-ui`; it is intentionally excluded from compilation.

---

## Linting

### Status
- No ESLint configuration file was detected in this project.

### Recommendations
- Add an ESLint configuration (`.eslintrc.json`, `eslint.config.mjs`, or equivalent) to enforce consistent code quality.
- For a Next.js + TypeScript project, the following ESLint setup is recommended:

  **Required packages:**
  ```
  eslint
  eslint-config-next
  @typescript-eslint/eslint-plugin
  @typescript-eslint/parser
  ```

  **Recommended base config (`.eslintrc.json`):**
  ```json
  {
    "extends": [
      "next/core-web-vitals",
      "plugin:@typescript-eslint/recommended"
    ],
    "rules": {
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }
  ```

- Until a config is added, developers must rely on TypeScript strict mode and editor-level warnings for code quality enforcement.
- Do not disable or bypass TypeScript strict checks as a substitute for linting rules.

---

## Formatting

### Status
- No Prettier configuration file was detected in this project.

### Recommendations
- Add a Prettier configuration (`.prettierrc`, `prettier.config.mjs`, or equivalent) to enforce consistent formatting across all contributors.
- For a Next.js + TypeScript project, the following Prettier setup is recommended:

  **Required packages:**
  ```
  prettier
  eslint-config-prettier
  eslint-plugin-prettier
  ```

  **Recommended base config (`.prettierrc`):**
  ```json
  {
    "semi": true,
    "singleQuote": true,
    "trailingComma": "all",
    "printWidth": 100,
    "tabWidth": 2,
    "useTabs": false
  }
  ```

- Add a `.prettierignore` file to exclude generated and non-source directories:
  ```
  .next/
  node_modules/
  src/example-ui/
  ```

- Integrate Prettier with ESLint via `eslint-config-prettier` to prevent rule conflicts.
- Until a config is added, all contributors should manually follow these style guidelines:
  - Use 2-space indentation.
  - Use single quotes for strings.
  - Always include trailing commas in multi-line structures.
  - Keep lines under 100 characters.
  - Always include semicolons at the end of statements.