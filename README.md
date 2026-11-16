# Revolution Trading Pros (`new-revolution-web`)

Institutional options, futures, and equities trading education platform, live trading rooms hub, and full-stack editorial CMS built with **Svelte 5**, **SvelteKit 3**, **TypeScript**, **Vite+**, **Drizzle ORM**, **Better Auth**, and `@sveltejs/adapter-vercel`.

- **Canonical Production Origin:** `https://www.revolutiontradingpros.com`
- **Branch Policy:** Sole branch `main` locally and on GitHub (see [`docs/TEMPORARY.md`](docs/TEMPORARY.md)).
- **Package Manager:** `pnpm` **ONLY** (`pnpm@12.16.1`; `npm`, `npx`, `yarn`, and `bun` are blocked by `scripts/check-package-manager.mjs` and `.npmrc`).

---

## Verified Stack (`package.json` & `pnpm-lock.yaml`)

| Layer                         | Technology & Version                                                                                      | Notes                                                                               |
| :---------------------------- | :-------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| **Runtime & Package Manager** | Node.js `26.x` (`.nvmrc`: `26.13.0`), `pnpm@12.16.1`                                                      | Vercel serverless runtime targets `nodejs24.x` (`vite.config.ts`)                   |
| **Framework & Language**      | `svelte@5.57.3` (forced Runes), `@sveltejs/kit@3.2.0`, `typescript@6.0.3`                                 | `#lib/*` subpath imports (`package.json`), `$app/state`, typed `resolve()`          |
| **Unified Toolchain**         | `vite-plus@1.6.0` (`Vite 8.3.7`, `Rolldown 1.2.18`, `Vitest 5.1.0`, `Oxlint`, `Oxfmt`) + `ESLint 10.15.0` | `ESLint` enforces all 37 Svelte rules + `vite-plus/prefer-vite-plus-imports`        |
| **Styling & Typography**      | Native CSS `@layer` SSOT (`src/app.css`) + Svelte 5 scoped `<style>`                                      | Self-hosted WOFF2 (`Plus Jakarta Sans`, `Inter`, `Geist Mono`); zero CSS frameworks |
| **Database & Auth**           | `drizzle-orm@0.45.4` (`postgres@4.1.1` / `@electric-sql/pglite@0.5.16`), `better-auth@1.7.25`             | Neon Postgres in Production/Preview; local PGlite fallback in development/test      |
| **CMS, Charts & SEO**         | `@tiptap/*@3.34.0`, `d3@7.9.2`, `lightweight-charts@5.2.1`, `svelte-meta-tags@5.0.3`, `sharp@0.35.5`      | Unified `@graph` JSON-LD, WebP responsive variants & Article cover crops            |

---

## Quickstart

```sh
pnpm install --frozen-lockfile
pnpm exec vp --version
pnpm exec vp toolchain
pnpm dev
```

For local `/admin` access against PGlite, copy `.env.example` to `.env`, set `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` (12+ chars), run `pnpm db:seed-admin`, and sign in at `http://localhost:5173/admin/login` (full instructions in [`docs/ADMIN_AND_OPS.md`](docs/ADMIN_AND_OPS.md)).

---

## Verification & Build Gates

Always use the repository `pnpm` scripts rather than bare `vp` built-ins (`pnpm build` runs both `vp build` and the deployment-time maintenance output step `scripts/maintenance-build.mjs`):

```sh
pnpm check:css          # CSS custom-property SSOT, 3-font token & zero-font-href guard
pnpm check              # SvelteKit sync + svelte-check (0 errors, 0 warnings)
pnpm lint               # Oxfmt check + Oxlint + ESLint for Svelte rules
pnpm test:unit --run    # Vitest server + headless Chromium component suites
pnpm build              # Complete Vite+ production build + maintenance output
pnpm check:pages        # Verifies all 99 prerendered HTML/JSON-LD/canonical contracts
pnpm test:seo           # Playwright SEO Standard full-inventory gate
pnpm exec playwright test # Configured Playwright E2E suite (use `pnpm test:e2e` if browsers need installing)
```

---

## Canonical Documentation Map (12 SSOT Files)

All engineering rules, runbooks, and trackers are consolidated into **12 Single Source of Truth (SSOT) Markdown files** (historical drafts and retired runbooks are archived in `retired/` and excluded from active guidance):

| File                                                       | Scope & Ownership                                                                                                                                          |
| :--------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`AGENTS.md`](AGENTS.md)                                   | **Master AI & Engineering Rulebook** — precedence, architecture, Svelte 5 / SvelteKit 3, CSS/font rules, SEO, and regulatory accuracy                      |
| [`GEMINI.md`](GEMINI.md)                                   | Antigravity / Gemini agent entrypoint and mandatory Svelte MCP tool workflow                                                                               |
| [`todo.md`](todo.md)                                       | Prioritized master roadmap (`99` prerendered contracts, `[TODO]` route graduations, open audit items, owner prerequisites)                                 |
| [`CHANGELOG.md`](CHANGELOG.md)                             | Chronological Keep-a-Changelog release and engineering ledger (`[Unreleased]` first)                                                                       |
| [`docs/CSS_STANDARDS.md`](docs/CSS_STANDARDS.md)           | `src/app.css` SSOT tokens, 3-font self-hosted WOFF2 pipeline, fluid `clamp()`/`cqi` scale, zero-`#`-fragment policy, and WCAG 2.2 AA rules                 |
| [`docs/NEW_PAGE_PLAYBOOK.md`](docs/NEW_PAGE_PLAYBOOK.md)   | Step-by-step route, catalog-card, and Svelte 5 component implementation & verification playbook                                                            |
| [`docs/SEO_STANDARD.md`](docs/SEO_STANDARD.md)             | Technical SEO requirements (`TOOL`–`MON`), Google primary-source evidence, owner decisions, Search Console ops, and launch gates                           |
| [`docs/BLOG_CONTRACT.md`](docs/BLOG_CONTRACT.md)           | Protected `/blog/**` `1424px` container-flush & `1900px` TOC layout, SSR discovery, CMS publish gate, cache freshness, `0004` search, and media storage/UI |
| [`docs/ADMIN_AND_OPS.md`](docs/ADMIN_AND_OPS.md)           | Better Auth `/admin` architecture, `pnpm db:seed-admin`, deployment-time maintenance mode, reopening waitlist, and health/cron ops                         |
| [`docs/VITE_PLUS_WORKFLOW.md`](docs/VITE_PLUS_WORKFLOW.md) | Local Vite+ `1.6.0` CLI semantics, test runner configuration, `PLAYWRIGHT_PORT`, TypeScript recovery, and upgrade protocol                                 |
| [`docs/TEMPORARY.md`](docs/TEMPORARY.md)                   | Active temporary items & feature-gate registry (`T1`–`T16`) + multi-session `main`-branch coordination board                                               |
