# Mandatory Engineering & Agent Standards (`AGENTS.md`)

This document is the **Single Source of Truth (SSOT) rulebook** for every AI agent and engineer working in `new-revolution-web`.

- **Precedence:** Live verified repository behavior (`package.json`, `vite.config.ts`, `src/**`, `scripts/**`, `tests/**`) > `AGENTS.md` > domain specs in `docs/*.md` > `GEMINI.md` / `README.md`. Never consult `retired/` for active rules.
- **Companion SSOT Documents (`docs/`):**
  - **CSS, Tokens, 3-Font Pipeline, Fluid Type & Zero-`#` Policy:** [`docs/CSS_STANDARDS.md`](docs/CSS_STANDARDS.md)
  - **New Page & Component Playbook:** [`docs/NEW_PAGE_PLAYBOOK.md`](docs/NEW_PAGE_PLAYBOOK.md)
  - **Technical SEO, Structured Data, Evidence & Launch Gate:** [`docs/SEO_STANDARD.md`](docs/SEO_STANDARD.md)
  - **Blog Layout Exception, CMS Lifecycle, Freshness & Media:** [`docs/BLOG_CONTRACT.md`](docs/BLOG_CONTRACT.md)
  - **Admin Auth, Local Seed Login, Maintenance & Waitlist Ops:** [`docs/ADMIN_AND_OPS.md`](docs/ADMIN_AND_OPS.md)
  - **Vite+ Toolchain, Testing & Upgrade Contract:** [`docs/VITE_PLUS_WORKFLOW.md`](docs/VITE_PLUS_WORKFLOW.md)
  - **Temporary Items (`T1`–`T16`) & Session Coordination:** [`docs/TEMPORARY.md`](docs/TEMPORARY.md)
  - **Master Roadmap & Release Ledger:** [`todo.md`](todo.md), [`CHANGELOG.md`](CHANGELOG.md)

---

## 1. Repository Governance, Branching & Vite+ Command Safety

1. **Sole Branch `main`:** Only `main` is used locally and on `origin`. Never create feature branches unless the owner explicitly instructs you to, never run bare `git stash` in a shared worktree, and check/update [`docs/TEMPORARY.md`](docs/TEMPORARY.md) (`Active Work` / `Recently Finished`) plus [`CHANGELOG.md`](CHANGELOG.md) (`[Unreleased]`).
2. **`pnpm` Only:** `pnpm@12.16.1` is enforced by `scripts/check-package-manager.mjs`. Never run `npm`, `npx`, `yarn`, or `bun`. Use `pnpm exec <bin>` for local binaries and `pnpm dlx` only when an external one-off package is explicitly required.
3. **Project Scripts Over Bare `vp` Built-Ins ([`docs/VITE_PLUS_WORKFLOW.md`](docs/VITE_PLUS_WORKFLOW.md)):**
   - Run `pnpm build` (never bare `vp build`) so `scripts/maintenance-build.mjs` generates `.vercel/output` maintenance/brand CSS artifacts and verifies native `sharp` + offline email output.
   - Run `pnpm check` (`svelte-kit sync && svelte-check`) for TypeScript + Svelte diagnostics (`vite.config.ts` sets `lint.options.typeCheck: false`).
   - Run `pnpm lint` (`vp fmt --check . && vp lint . && eslint "**/*.svelte"`) because ESLint enforces the 37 Svelte rules (including `svelte/no-navigation-without-resolve`) that Oxlint does not cover.
   - Do not upgrade `vite-plus`, `svelte`, `@sveltejs/kit`, or `typescript` (`6.0.3` pinned for SvelteKit 3.2 / `svelte-check` peer compatibility) unless explicitly requested.

---

## 2. Self-Hosted 3-Font Pipeline, CSS SSOT & Zero-`#`-Fragment Rules

Full specification: [`docs/CSS_STANDARDS.md`](docs/CSS_STANDARDS.md).

1. **Single Global Stylesheet (`src/app.css`):**
   - [`src/app.css`](src/app.css) owns `@layer reset, tokens, base, typography, layout, components, utilities, responsive;`, all `@font-face` declarations, all `:root` custom properties, `.container` (`--max: 96rem` / `1536px` border-box cap with responsive `--gutter` `24px`–`112px`), and shared `.inner-page` primitives.
   - Never install Tailwind, Sass/SCSS, Less, PostCSS plugins, or CSS-in-JS. Component- and page-specific styles belong in native Svelte 5 scoped `<style>` blocks.
   - Every `var(--token)` in `src/**/*.{css,svelte}` must be declared in `src/app.css` (or locally scoped on a parent selector) and pass `pnpm check:css` ([`scripts/check-css-tokens.mjs`](scripts/check-css-tokens.mjs)).
2. **Self-Hosted 3-Font Stack & Zero Font `href` Policy:**
   - All web fonts are self-hosted `.woff2` files in `static/fonts/` (`OFL-1.1` licenses in [`static/fonts/LICENSES.txt`](static/fonts/LICENSES.txt)) declared **solely** via `@font-face` in `src/app.css` with `font-display: optional` and metric-calibrated fallbacks (`Plus Jakarta Sans Fallback`, `Inter Fallback`, `Geist Mono Fallback`):
     - `var(--font-display)` (aliases `--font-heading`, `--font-secondary`): **Plus Jakarta Sans** (`600`, `700`, `800`)
     - `var(--font-sans)` (aliases `--font-body`, `--font-primary`): **Inter** (`400`, `500`, `600`)
     - `var(--font-mono)`: **Geist Mono** (`100`–`900` variable via `GeistMono-Variable.woff2`)
   - **Never emit font `href` tags anywhere:** zero Google Fonts/CDN links, zero `<link rel="preload" as="font" href="...">`, and zero `.woff2` `<link>` tags (`shouldPreload` in [`src/hooks.server.ts`](src/hooks.server.ts) preloads only `js` and `css`). Enforced by [`scripts/font-policy.mjs`](scripts/font-policy.mjs).
   - **Documented Exceptions:** Standalone responses consume build-generated same-origin `/brand-ui.css`; `<img>`-context fallback SVGs embed one licensed bundled WOFF2 data URI in [`src/lib/server/svg-brand-font.ts`](src/lib/server/svg-brand-font.ts); outbound emails use client-safe system fallbacks.
3. **Always-Fluid Typography & WCAG 2.2 AA Discipline:**
   - `html` uses `font-size: 100%` (honoring OS/browser root preferences) and `font-synthesis-weight: none; font-synthesis-style: none;`.
   - Every HTML typography size above the `0.75rem` (`12px`) visual legibility floor must use an SSOT fluid token (`--step-hero` through `--step-caption`, `--text-eyebrow`, `--text-seo-kicker`, `--blog-h1..h4`, `--blog-body`) interpolating linearly across `[375px, 1536px]` via `clamp(minRem, interceptRem + slopeVi, maxRem)` — never static `> 0.75rem` sizes and never bare `vw`/`vi` preferred terms.
   - Asymmetric split-column heroes must set `container-type: inline-size` on the copy column and use $C^0$-continuous `clamp(minRem, min(viRamp, cqiRamp), maxRem)`.
   - Use semantic `--weight-*` tokens (`400`–`800` matching shipped faces; never `450`, `750`, `900`, or synthetic `italic` on upright-only fonts), unitless `line-height` (`--leading-*`, never fixed `rem`/`px`), `Inter` `'cv02'..'cv11'` scoped to `body` (reset on headings/display/mono), and `tabular-nums` scoped to tables/time/code/metrics/`svg text`/`.tabular-nums`.
   - Contrast: never use `var(--acid)` as text or focus ring on light `--off` / `.is-light` surfaces (use `--kicker-color: #4b5f1d` or `--acid-text-on-light`, and `var(--ink)` / `var(--lightmuted)` for copy); always pair `var(--acid)` backgrounds with `color: var(--ink)`.
4. **Zero `#` URL Fragments Policy:**
   - Never emit `#section` fragments in navigable `<a href="...">` links, canonical URLs, Open Graph URLs, or sitemaps.
   - Use `<button type="button" onclick={() => scrollToSection('target-id')}>` ([`src/lib/utils/scroll.ts`](src/lib/utils/scroll.ts)) for in-page jumps and TOC controls.
   - Every page renders `<a class="skip" href="#<main-id>">Skip to content</a>` first in DOM; [`src/routes/+layout.svelte`](src/routes/+layout.svelte) (`stripLocationHash`) scrolls to any incoming `#id` and strips the hash via `history.replaceState`. Internal JSON-LD `@id` graph identifiers (`#webpage`, `/#organization`) are non-navigable entity URIs and remain valid.

---

## 3. Protected `/blog/**` Layout Exception

Full specification: [`docs/BLOG_CONTRACT.md`](docs/BLOG_CONTRACT.md).

- **SSR CMS Discovery:** `/` and `/blog/**` run with `prerender = false` so newly published CMS articles appear immediately via [`src/lib/server/services/blog-discovery.ts`](src/lib/server/services/blog-discovery.ts) (`6` slots on `/`, `12` per page on `/blog`, featured/newest lead first) without rebuilding the site.
- **Container-Flush Reading Width + External TOC Rail:** `/blog` and `/blog/[slug]` use the **exact same SSOT fluid typography scale** (`--blog-h1..h4`, `--blog-body`, `--step-*`), while strictly preserving:
  1. **100% container-flush inner alignment (`1424px` max inner width at `>=1536px`)** across `.article-header`, `.article-cover-figure`, `.prose-base` (`max-inline-size: 100%` in [`src/lib/styles/prose.css`](src/lib/styles/prose.css) — **never** add a `65ch`/`680px`/`900px` cap onto `.prose-base`), CTA, FAQ, author bio, and related posts.
  2. **External left-margin sticky TOC rail active only at `>= 118.75rem` (`1900px`)**, paired with symmetric `scrollbar-gutter: stable both-edges` at `>= 118.75rem` across public routes. Below `1900px`, the desktop TOC rail is hidden and removed from tab order.
- **Editorial Punctuation:** Never strip or auto-replace authored em dashes/en dashes on CMS saves, autosaves, or restores. `editorial_em_dash` in [`src/lib/shared/seo/score.ts`](src/lib/shared/seo/score.ts) is a `0`-point non-blocking advisory.

---

## 4. Svelte 5, SvelteKit 3.2 & Enterprise SEO / YMYL Architecture

Full specifications: [`docs/NEW_PAGE_PLAYBOOK.md`](docs/NEW_PAGE_PLAYBOOK.md) and [`docs/SEO_STANDARD.md`](docs/SEO_STANDARD.md).

1. **Svelte 5 & SvelteKit 3.2 Idioms (Configured in `vite.config.ts` — there is no `svelte.config.js`):**
   - Runes only (`$props()`, `$state()`, `$state.raw()`, `$derived()`, `$derived.by()`, `$effect()`, `{@attach}`); never legacy `export let`, `$:`, `on:*`, `<slot>`, or `$app/stores` (use `$app/state`).
   - Subpath imports use `#lib/*` from `package.json` (`$lib` is removed in SvelteKit 3).
   - Wrap every internal `<a href>` with typed `resolve('/route')` or `resolve('/resources/[slug]', { slug })` from `$app/paths`.
   - Use Svelte MCP (`list-sections` → `get-documentation` before coding; `svelte-autofixer` with `desired_svelte_version: "5.57.3"` after coding until 0 issues/suggestions remain).
2. **Public Route Contract (`+page.ts` + `+page.svelte`):**
   - Build-time-stable public routes export `export const prerender = true;` in `+page.ts` and return `definePageMetaTags(...)` + `jsonLdSchema: build*JsonLd(SITE_ORIGIN)`.
   - **Metadata House Conventions:** `title` ≤ **33 chars** before ` | Revolution Trading Pros` (`30–60` rendered chars); unique `description` **140–158 chars** matching `WebPage.description`; `canonical: getCanonicalUrl(url)` on `SITE_ORIGIN` (`https://www.revolutiontradingpros.com`).
   - **`noindex` Exclusivity (`IDX-08`):** Non-indexable routes (`/admin/**`, `/login`, `/register`, `/enroll/*`, launch-gated `/store/*` via `T10`, and `[TODO]` placeholders via `T16` in [`src/lib/data/todo-pages.ts`](src/lib/data/todo-pages.ts)) must emit `robots: 'noindex, nofollow'` and `canonical: undefined`, and must never appear in `/sitemap.xml`.
   - **Landmarks & Single-Owner FAQ:** Render `<JsonLd>`, `<a class="skip" href="#<slug>-page">`, `<Navbar />`, `<main id="<slug>-page" class="inner-page ...">` with one `<h1>` and strict `h1 → h2 → h3` order, native `<details>` FAQs driven from a single `*_FAQ_ITEMS` export in [`src/lib/seo/structured-data.ts`](src/lib/seo/structured-data.ts), 1:1 DOM-to-JSON-LD breadcrumbs, and `<Footer />` (which already includes `PreFooter` / `HaveQuestions` / `SocialShareBar`).
3. **Structured Data (`@graph` JSON-LD):**
   - Emit one unified `@graph` per page via [`src/lib/seo/structured-data.ts`](src/lib/seo/structured-data.ts) (or [`src/lib/seo/blog-seo.ts`](src/lib/seo/blog-seo.ts)) referencing shared `#organization`, `#founder`, and `#offer-catalog` `@id`s, with `WebSite` (`#website`) emitted **solely on `/`** (`SD-04`), serialized safely with `\u003c`/`\u003e`/`\u0026` (`SD-02`).
   - **Prohibited Schema Types (`SD-10`, `SD-15`):** Never emit `FAQPage` (Google rich result ended `2026-05-07`), `HowTo`, `Course` / `CourseInstance`, `SpeakableSpecification`, `SpecialAnnouncement`, `ClaimReview`, or `SearchAction`, and never invent `AggregateRating` or prices not shown in DOM.
4. **Brand, Lineage, Staging Shield, Regulatory & Feature-Gate Accuracy (November 2026 Standard):**
   - **Brand, Staging Shield & Founder Lineage SSOT ([`src/lib/config/brand.ts`](src/lib/config/brand.ts)):** Parameterize brand identity globally via `PUBLIC_BRAND_NAME`, `PUBLIC_SITE_URL`, and `PUBLIC_ENV` (`BRAND.isProduction === true` strictly when `PUBLIC_ENV === 'production'`, gating `X-Robots-Tag`, `/robots.txt`, and `/llms.txt`). Never hardcode legacy brand names or slogans outside `brand.ts`; lock in **The Move Prior to The Move™** (100% indicator-free Monthly-to-1-Minute pure price structure) and verified **Mark "Goldfinger" McGoldrick** lineage (**Partner at Goldman Sachs, Co-Founder & Co-Head of Goldman Sachs Global Special Situations Group [GSSG, 1997–2007], and Co-Founder of Mount Kellett Capital Management** — never describe him as a retail prop-desk day trader).
   - **FINRA Rule 4210(d)(2) & T+1 Settlement:** Reflect **FINRA Regulatory Notice 26-10 / Amended Rule 4210(d)(2)** intraday risk-based maintenance margin (`$2,000` minimum margin equity baseline, effective June 4, 2026 with an 18-month broker implementation window through October 20, 2027, Intraday Margin Level `IML`, and `min(5% equity, $1,000)` De Minimis buffer) and **T+1 next-business-day cash settlement** (`$500+` defined-risk cash workflows). Never promise profits, use `"predict"` / `"guarantee"` / `"risk-free"`, or portray educational alerts as personalized investment advice.
   - **Active Gates (`T10`, `T14`, `T16` in [`docs/TEMPORARY.md`](docs/TEMPORARY.md)):** Preserve `CONCEPT_PREVIEW = false` and `COMMERCE_ENABLED = false` in [`src/lib/shared/development-status.ts`](src/lib/shared/development-status.ts) + [`src/lib/server/commerce-guard.ts`](src/lib/server/commerce-guard.ts) (`403` on `/checkout` & payment paths) and Store launch gating in [`src/lib/data/launch-gate.ts`](src/lib/data/launch-gate.ts) until explicitly authorized by the owner.

---

## 5. Mandatory Pre-Push Verification Sequence

Test changed units while iterating; run the full gate once before committing/pushing to `main` and report exact command results (never claim an unexecuted check passed):

```sh
pnpm check:css
pnpm check
pnpm lint
pnpm test:unit --run
pnpm build
pnpm check:pages
pnpm test:seo
pnpm exec playwright test
```
