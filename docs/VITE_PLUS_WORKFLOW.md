# Vite+ Toolchain & Agent Workflow (`docs/VITE_PLUS_WORKFLOW.md`)

This repository uses the project-local **Vite+** toolchain (`vite-plus@1.6.0`). Do **not** run `vp create`, `vp migrate`, or global CLI installers unless an explicit toolchain upgrade is requested by the owner.

---

## 1. Verified Installed Toolchain (`package.json`, `pnpm-workspace.yaml`, `vite.config.ts`)

| Component                     | Version / Config                                                     | Role                                                                                                  |
| :---------------------------- | :------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| **Node.js**                   | `26.x` (`.nvmrc` / `.node-version`: `26.13.0`)                       | Local development, build, and CLI runtime (Vercel functions target `nodejs24.x`)                      |
| **`pnpm`**                    | `pnpm@12.16.1`                                                       | Sole package manager (`scripts/check-package-manager.mjs` blocks `npm`, `yarn`, `bun`)                |
| **Vite+**                     | `vite-plus@1.6.0` (`pnpm exec vp`)                                   | Unified CLI orchestrating Vite, Rolldown, Vitest, Oxlint, and Oxfmt                                   |
| **`vite` alias**              | `npm:@voidzero-dev/vite-plus-core@1.6.0`                             | Mapped via `pnpm-workspace.yaml` `catalog:` (`Vite 8.3.7` / `Rolldown 1.2.18`)                        |
| **Vitest**                    | `vitest@5.1.0` + `@vitest/browser-playwright@5.1.0`                  | `server` (Node) + `client` (headless Chromium) test projects (`maxWorkers: 4`)                        |
| **TypeScript & Svelte Check** | `typescript@6.0.3`, `svelte-check@4.7.8`                             | Pinned at `6.0.3` (SvelteKit `3.2.0` & `typescript-eslint@8.72.2` peer boundary)                      |
| **Linting**                   | Oxlint (`1.93.0`) + `ESLint 10.15.0` (`eslint-plugin-svelte@3.21.0`) | Oxlint runs type-aware TS/JS rules; ESLint enforces all 37 Svelte rules + Vite+ import policy (`T15`) |
| **Formatting**                | Oxfmt (`0.78.0`)                                                     | Configured in `vite.config.ts` `fmt` block (tabs, single quotes, `printWidth: 100`, Svelte plugin)    |

> **Important (`vite.config.ts` vs `svelte.config.js`):** SvelteKit `3.2.0` is configured directly inside `vite.config.ts` (`sveltekit({ compilerOptions, adapter, preprocess, extensions, experimental })`). There is no `svelte.config.js` file in this repository.

---

## 2. Project Command Contract (`pnpm` Scripts vs. `pnpm exec vp`)

Always prefer the `package.json` `pnpm` scripts for repository gates:

| Command                | Underlying Execution                                         | What It Verifies                                                                                                             |
| :--------------------- | :----------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`             | `vp dev`                                                     | Local SvelteKit + Vite+ dev server (`http://localhost:5173`) with immutable `/fonts/*` cache middleware                      |
| `pnpm build`           | `vp build && node scripts/maintenance-build.mjs`             | **Complete build:** SvelteKit SSG/SSR + Vercel output + maintenance functions + `/brand-ui.css` + `sharp`/email verification |
| `pnpm preview`         | `vp preview`                                                 | Serves SvelteKit build output locally (does not emulate Vercel `.vercel/output/config.json` routing)                         |
| `pnpm check:css`       | `node scripts/check-css-tokens.mjs`                          | Verifies all `var(--token)` references (`129` tokens), 3-font token usage, and zero font `<link href>` violations            |
| `pnpm check`           | `svelte-kit sync && svelte-check --tsconfig ./tsconfig.json` | TypeScript + Svelte 5 compiler/a11y/unused-CSS diagnostics (`0` errors, `0` warnings required)                               |
| `pnpm typecheck`       | `pnpm run check`                                             | CI alias used by Vercel build checks                                                                                         |
| `pnpm format`          | `vp fmt .`                                                   | Formats repository files with Oxfmt (`retired/`, `blogs/`, `drizzle/`, `static/`, `pnpm-lock.yaml` ignored)                  |
| `pnpm lint`            | `vp fmt --check . && vp lint . && eslint "**/*.svelte"`      | Full format + Oxlint type-aware check + ESLint 37-rule Svelte gate (`svelte/no-navigation-without-resolve`, etc.)            |
| `pnpm test:unit --run` | `vp test --run`                                              | Runs all `server` (`*.spec.ts`) and `client` (`*.svelte.spec.ts`) Vitest suites once                                         |
| `pnpm check:pages`     | `node scripts/check-prerendered-pages.mjs`                   | Audits all `99` prerendered HTML files (`<h1>`, `.skip` link, canonical/`noindex`, JSON-LD parse & FAQ parity)               |
| `pnpm test:seo`        | `playwright test --config playwright.seo.config.ts`          | Runs the 3 Playwright SEO Standard suites against `docs/seo/audit/02-inventory.json`                                         |
| `pnpm test:e2e`        | `playwright install && playwright test`                      | Installs Playwright browsers if missing and runs E2E suites (use `pnpm exec playwright test` when browsers exist)            |

### Why Bare `vp` Commands Do Not Replace Project Scripts

1. **Never substitute `pnpm exec vp build` for `pnpm build`:** bare `vp build` skips `scripts/maintenance-build.mjs`, leaving `.vercel/output` without `/maintenance-state.json`, `/brand-ui.css`, and packaged native `sharp` checks.
2. **Never substitute `pnpm exec vp check` for `pnpm check` + `pnpm lint`:** `vite.config.ts` sets `lint.options.typeCheck: false` and Oxlint does not execute `eslint-plugin-svelte` rules on `.svelte` templates.

---

## 3. Running Targeted Unit, Browser-Component & Authenticated E2E Tests

### Single Unit or Component Spec

```sh
pnpm exec vp test run src/lib/seo/structured-data.spec.ts
pnpm exec vp test run src/routes/live-trading-rooms/page.svelte.spec.ts
```

- **Imports Enforced by Lint:** Import test primitives from `vite-plus/test` (`describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach`) and browser helpers from `vite-plus/test/browser` (`page`, `userEvent`). Never import directly from `'vitest'` or `'vite'` (`vite-plus/prefer-vite-plus-imports`).
- **Async `render()`:** In `vitest-browser-svelte`, `render()` returns a `Promise` — always `await render(...)`. If a component declares a prop literally named `intro`, pass `await render(Component, { props: { intro: '...' } })` so it does not collide with Svelte's `mount()` `intro` option.

### Port Override (`PLAYWRIGHT_PORT`)

`playwright.config.ts` and `playwright.seo.config.ts` default to port `4173` (`reuseExistingServer: false`). If port `4173` is occupied on the host, pass `PLAYWRIGHT_PORT`:

```sh
PLAYWRIGHT_PORT=4273 pnpm test:seo
PLAYWRIGHT_PORT=4273 pnpm exec playwright test
```

### Complete Zero-Skip Authenticated E2E Run (Disposable Local Admin)

17 admin/CMS Playwright E2E cases require `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD` against an isolated local PGlite instance (never against a shared or production database). Always revoke the disposable admin and remove the temporary PGlite directory afterward:

```sh
export DATABASE_URL="pglite://.svelte-kit/pglite-e2e-verify"
export ADMIN_SEED_EMAIL="e2e-verify@example.test"
export ADMIN_SEED_PASSWORD="disposable-local-pass-99"
pnpm db:seed-admin
DATABASE_URL="$DATABASE_URL" E2E_ADMIN_EMAIL="$ADMIN_SEED_EMAIL" E2E_ADMIN_PASSWORD="$ADMIN_SEED_PASSWORD" pnpm exec playwright test
pnpm db:seed-admin --revoke
rm -rf .svelte-kit/pglite-e2e-verify
```

---

## 4. TypeScript & Editor Recovery

Generated `$types` imports (`./$types`) live under `.svelte-kit/types` and are created by `svelte-kit sync`. If an IDE or fresh checkout reports missing `./$types` or `#lib/*` resolutions:

```sh
pnpm exec svelte-kit sync
pnpm check
```

Keep `ssr.noExternal: ['sanitize-html', 'htmlparser2']` and `ssr.optimizeDeps.include: ['sanitize-html']` in `vite.config.ts` — Vercel's `nodejs24.x` serverless ESM loader fails on external CommonJS-to-ESM `require()` calls in `sanitize-html` without SSR bundling.

---

## 5. Explicit Toolchain Upgrade Procedure (Only When Requested)

Never upgrade `vite-plus` opportunistically during feature work. When the owner explicitly asks for a toolchain upgrade:

1. Check peer ranges first (`@sveltejs/kit`, `svelte-check`, `typescript-eslint`, `@vitest/browser-playwright`) before bumping `typescript` or `vite-plus`.
2. Update `pnpm-workspace.yaml` `catalog:` entries (`vite-plus`, `vite` → `npm:@voidzero-dev/vite-plus-core@<ver>`, `vitest`, `@vitest/browser-playwright`) together so Vitest and Vite+ core stay locked to identical versions.
3. Run `pnpm install`, inspect `pnpm exec vp toolchain`, and verify all 8 gates in `AGENTS.md` §5 (plus the zero-skip authenticated E2E run above).
