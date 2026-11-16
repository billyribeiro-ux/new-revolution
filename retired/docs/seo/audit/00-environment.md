# Phase 0 — Environment & Baseline Preflight (`00-environment.md`)

**Date:** 2026-10-31
**Branch:** `seo/audit-2026-10-31` (`[CMD]` `git checkout -b seo/audit-2026-10-31`, exit 0)
**Base Commit (`main`):** `7911485` (`[CMD]` `git rev-parse main`, exit 0)

> **Addendum (2026-11-03, dependency update, branch `chore/deps-bump-2026-11`).** The §2 table and §4 results are the 2026-10-31 snapshot and stay as audit evidence. Versions resolved after the update: `svelte-check` 4.7.8 (was 4.7.7), `better-auth` 1.7.15 and `auth` 1.7.15 (were 1.7.14), `@electric-sql/pglite` 0.5.15, `@threlte/core` 8.7.0, `@threlte/extras` 9.23.1, `shiki` 4.6.0, `globals` 17.14.0. `vitest` and `@vitest/browser-playwright` stay at 5.0.5 (5.1.0 is blocked by the `vite-plus@1.4.0` pin; see CHANGELOG). Gate results for the updated tree are in the CHANGELOG entry, not in this table.

---

## 1. Standard & Svelte MCP Availability

- **SEO Standard:** Present at [`SEO_STANDARD.md`](../../../SEO_STANDARD.md) (`[CODE SEO_STANDARD.md:1-209]`) and mirrored at [`docs/seo/SEO_STANDARD.md`](../SEO_STANDARD.md) (`[CMD]` `cp SEO_STANDARD.md docs/seo/SEO_STANDARD.md`, exit 0).
- **Svelte MCP (`TOOL-01`):** `svelte` MCP server responded to `list-sections` (207 sections returned) and `get-documentation` (`[DOC https://svelte.dev/docs/kit/seo §SEO]`).

---

## 2. Installed & Resolved Package Versions (Rule 3)

Verified against [`package.json`](../../../package.json) (`[CODE package.json:6-118]`), [`pnpm-lock.yaml`](../../../pnpm-lock.yaml) (`[CODE pnpm-lock.yaml:1-120]`), and installed `node_modules/*/package.json` (`[CMD]` `node -e ...`, exit 0):

| Package                        | Specifier in `package.json` | Resolved Version (`node_modules`) | Evidence Tag                                                                               |
| :----------------------------- | :-------------------------- | :-------------------------------- | :----------------------------------------------------------------------------------------- |
| `node` (Engine)                | `26.13.0`                   | `26.13.0`                         | `[CODE package.json:8]`                                                                    |
| `pnpm` (Package Manager)       | `pnpm@12.16.1`              | `12.16.1`                         | `[CODE package.json:6]`, `[CODE pnpm-lock.yaml:9-10]`                                      |
| `svelte`                       | `^5.57.3`                   | `5.57.3`                          | `[CODE package.json:62]`, `[CMD]` `node_modules/svelte/package.json`                       |
| `@sveltejs/kit`                | `^3.1.1`                    | `3.1.1`                           | `[CODE package.json:42]`, `[CODE node_modules/@sveltejs/kit/package.json:2-3]`             |
| `@sveltejs/adapter-vercel`     | `^7.0.2`                    | `7.0.2`                           | `[CODE package.json:40]`, `[CMD]` `node_modules/@sveltejs/adapter-vercel/package.json`     |
| `@sveltejs/enhanced-img`       | `^1.0.0`                    | `1.0.0`                           | `[CODE package.json:41]`, `[CMD]` `node_modules/@sveltejs/enhanced-img/package.json`       |
| `@sveltejs/vite-plugin-svelte` | `^7.3.1`                    | `7.3.1`                           | `[CODE package.json:43]`, `[CMD]` `node_modules/@sveltejs/vite-plugin-svelte/package.json` |
| `vite`                         | `^8.3.5`                    | `8.3.5`                           | `[CODE package.json:66]`, `[CMD]` `node_modules/vite/package.json`                         |
| `typescript`                   | `6.0.3`                     | `6.0.3`                           | `[CODE package.json:64]`, `[CMD]` `node_modules/typescript/package.json`                   |
| `svelte-check`                 | `^4.7.7`                    | `4.7.7`                           | `[CODE package.json:63]`, `[CMD]` `node_modules/svelte-check/package.json`                 |
| `svelte-meta-tags`             | `^5.0.3`                    | `5.0.3`                           | `[CODE package.json:114]`, `[CODE node_modules/svelte-meta-tags/dist/index.d.ts:1-5]`      |
| `@playwright/test`             | `^1.64.1`                   | `1.64.1`                          | `[CODE package.json:39]`, `[CMD]` `node_modules/@playwright/test/package.json`             |
| `vitest`                       | `5.0.5`                     | `5.0.5`                           | `[CODE package.json:67]`, `[CMD]` `node_modules/vitest/package.json`                       |
| `drizzle-orm`                  | `^0.45.4`                   | `0.45.4`                          | `[CODE package.json:52]`, `[CMD]` `node_modules/drizzle-orm/package.json`                  |
| `better-auth`                  | `^1.7.14`                   | `1.7.14`                          | `[CODE package.json:50]`, `[CMD]` `node_modules/better-auth/package.json`                  |
| `sanitize-html`                | `^2.18.1`                   | `2.18.1`                          | `[CODE package.json:111]`, `[CMD]` `node_modules/sanitize-html/package.json`               |
| `sharp`                        | `^0.35.5`                   | `0.35.5`                          | `[CODE package.json:112]`, `[CMD]` `node_modules/sharp/package.json`                       |

---

## 3. Installed SvelteKit 3.1.1 Type Definitions Verification (`.d.ts`)

- **Configuration in `vite.config.ts`:** SvelteKit 3.1.1 configures `adapter`, `prerender` (`handleHttpError`, `handleMissingId`, `handleEntryGeneratorMismatch`, `handleUnseenRoutes`, `handleInvalidUrl`), `preprocess`, and `compilerOptions` directly inside `sveltekit({ ... })` in [`vite.config.ts`](../../../vite.config.ts) (`[CODE vite.config.ts:18-40]`, `[CODE node_modules/@sveltejs/kit/types/index.d.ts:1992-2043]`). `svelte.config.js` is not used in SvelteKit 3 (`[DOC https://svelte.dev/docs/kit/@sveltejs-kit-vite §sveltekit]`).
- **Ambient Modules:**
  - `$app/env` exports `browser`, `dev`, `building`, `version` (`[CODE node_modules/@sveltejs/kit/types/index.d.ts:2389-2408]`).
  - `$app/state` exports `page`, `navigating`, `updated` (`[CODE node_modules/@sveltejs/kit/types/index.d.ts:3837-3975]`).
  - `$app/paths` exports `resolve`, `asset` (`[CODE node_modules/@sveltejs/kit/types/index.d.ts:2912-2990]`).
  - `#lib` subpath import alias is configured in `package.json#imports` (`[CODE package.json:70-76]`).
- **`svelte-meta-tags@5.0.3`:** Exports `MetaTags`, `JsonLd`, `deepMerge`, `defineBaseMetaTags`, `definePageMetaTags` (`[CODE node_modules/svelte-meta-tags/dist/index.d.ts:1-5]`).

---

## 4. Phase 0 Preflight Command Results

| Command                          | Exit Code | Errors / Warnings                                   | Summary (`[CMD]`)                                                                                                                                     |
| :------------------------------- | :-------- | :-------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile` | `0`       | `0` errors, `0` warnings                            | `Lockfile is up to date, resolution step is skipped. Done in 26ms using pnpm v12.16.1`                                                                |
| `pnpm check`                     | `0`       | `0` errors, `0` warnings                            | `svelte-check found 0 errors and 0 warnings`                                                                                                          |
| `pnpm lint`                      | `0`       | `0` errors, `0` warnings                            | `prettier --check . && eslint .` exited `0`                                                                                                           |
| `pnpm check:css`                 | `0`       | `0` errors, `0` warnings                            | `CSS tokens OK: 90 custom properties in use, all declared.`                                                                                           |
| `pnpm test:unit --run`           | `0`       | `0` failed, `0` skipped                             | `Test Files 61 passed (61), Tests 412 passed (412)`                                                                                                   |
| `pnpm exec playwright test`      | `0`       | `0` failed, `3` skipped                             | `14 passed, 3 skipped (22.3s)` (3 skipped require external DB/blob env vars)                                                                          |
| `pnpm build`                     | `0`       | Prerender warnings for `PLANNED_ROUTE_PATTERN` 404s | `vite build` + `@sveltejs/adapter-vercel` succeeded; prerender handler logged 14 `PLANNED_ROUTE_PATTERN` 404 warnings (`[CODE vite.config.ts:12-35]`) |
| `pnpm check:pages`               | `0`       | `0` errors                                          | `50 prerendered page(s) satisfy the contract.`                                                                                                        |
