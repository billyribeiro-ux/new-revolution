# Mandatory Engineering & Agent Standards (`AGENTS.md`)

> **Layout, typography and copy contract: November 5, 2026.** Follow the [shared 1536px (96rem), two-font and blog interaction contract](docs/blog/LAYOUT_AND_CONTENT_CONTRACT.md). This supersedes older width, editor-family and automatic dash-replacement recipes.

> **Blog work — November 5, 2026:** Read the [mandatory blog handoff](docs/BLOG_AGENT_HANDOFF.md) before adding or changing articles, editor workflows, blog SEO or automation. It distinguishes the existing CMS workflow from the proposed intake tooling.

> **Fonts and article fragments — November 5, 2026:** Follow the [verified policy](docs/FONT_AND_FRAGMENT_POLICY.md). Fonts are strictly self-hosted via static `@font-face` rules in `src/app.css` (zero font `href` / `<link as="font">` tags anywhere), and `#` URL fragments are strictly forbidden.

This file defines the non-negotiable architectural, typography, CSS, Svelte 5 / SvelteKit 3, and SEO / AI-Search standards for every AI agent and engineer working in this repository.

> **Companion References:**
>
> - **CSS & Typography Standards:** [`docs/CSS_STANDARDS.md`](docs/CSS_STANDARDS.md)
> - **New Page / Component Playbook (follow step by step):** [`docs/NEW_PAGE_PLAYBOOK.md`](docs/NEW_PAGE_PLAYBOOK.md)
> - **Blog authoring and publishing (read before adding or updating CMS articles):** [`blog implementation.md`](<blog implementation.md>) — verified CMS workflow, importer limitations, media checks and launch requirements; audit evidence and the 0DTE implementation plan are linked there.
> - **Blog automation and current status (mandatory before blog work):** [`docs/BLOG_AGENT_HANDOFF.md`](docs/BLOG_AGENT_HANDOFF.md), [`docs/blog/AUTOMATION_PLAN.md`](docs/blog/AUTOMATION_PLAN.md). JSON-LD already derives from CMS records; the proposed intake tooling is not implemented. Follow the handoff's evidence links and update its status/coverage when adding agent runbooks.
> - **Admin/Auth Plan, Changelog, Temporary-items registry, multi-session coordination (read before touching admin, auth, hooks or the DB; update when you finish):** [`docs/ADMIN_AUTH_PLAN.md`](docs/ADMIN_AUTH_PLAN.md), [`CHANGELOG.md`](CHANGELOG.md), [`docs/TEMPORARY.md`](docs/TEMPORARY.md), [`docs/AGENT_COORDINATION.md`](docs/AGENT_COORDINATION.md)
> - **SEO Standard, Decisions & Operations (mandatory for all routes, metadata, sitemaps, and JSON-LD):** [`docs/seo/SEO_STANDARD.md`](docs/seo/SEO_STANDARD.md), [`docs/seo/DECISIONS.md`](docs/seo/DECISIONS.md), [`docs/seo/OPERATIONS.md`](docs/seo/OPERATIONS.md), [`docs/SEO_EVIDENCE.md`](docs/SEO_EVIDENCE.md)
> - **Project & Tooling Configuration:** [`GEMINI.md`](GEMINI.md) (`pnpm` ONLY; `npm`, `yarn`, and `bun` are strictly blocked)
> - **Vite+ Tooling & Agent Workflow:** [`docs/VITE_PLUS_WORKFLOW.md`](docs/VITE_PLUS_WORKFLOW.md) (read before selecting build, test, lint, formatting, migration or upgrade commands)

---

## Vite+ Command Safety

This repository already uses the project-local Vite+ toolchain. Use the `pnpm` scripts in
[`package.json`](package.json) and follow [`docs/VITE_PLUS_WORKFLOW.md`](docs/VITE_PLUS_WORKFLOW.md).
In particular, run `pnpm build` for a complete build: bare `vp build` skips the maintenance-output
script. `pnpm check` runs Svelte diagnostics; `pnpm lint` also runs ESLint for Svelte-specific rules.
Neither `vp check` nor `vp test` replaces all project checks. Preserve the Vite+/Vite/Vitest catalog
alignment and existing test coverage. Do not migrate or upgrade the toolchain unless the task calls for it.

Every new or updated README, agent prompt, playbook and operational runbook must follow this
Vite+ command contract. Use the existing `pnpm` scripts for project workflows and `pnpm exec vp`
for direct Vite+ commands; do not recommend standalone Vite, Vitest or Prettier commands. Verify
examples against `package.json` and `vite.config.ts`, and update `docs/VITE_PLUS_WORKFLOW.md`
when an authorized tooling change alters the workflow. Keep dated evidence accurate about the
commands actually run, and label it as historical when it could be mistaken for current instructions.

---

## 0. When Asked For An SEO Audit

Follow [`seo-audit.md`](seo-audit.md) end to end; do not summarize it or run a subset. These parts are mandatory and are where earlier audits missed defects:

- **Rules 11-16** (primary Google pages only, page through every fetch with `offset`, nothing inherited is trusted, no residual † rows, prove fixes against `pnpm preview`, find defects yourself).
- **Phase 1B:** audit the standard, `docs/SEO_EVIDENCE.md`, `DECISIONS.md`, the playbook and this file against Google's live pages, the full changelog and the code, and fix contradictions in the same run.
- **Phase 3e:** the adversarial sweep (independent crawl of the built output, link graph, request-controlled behaviour in `hooks`, author-controlled content paths, placeholder data, `pnpm audit`, tests that assert the wrong thing).
- **Completion gate** in Phase 6 and the extra report sections in Phase 8.

An undeployed site or unpublished content is never a reason to skip a check that can run against `pnpm preview`.

---

## 1. Mandatory Font Hosting Standard

All website fonts must be self-hosted statically in `src/lib/assets/fonts/`. Use optimized WOFF2/WOFF files, preserve the centralized font configuration within the CSS Single Source of Truth (SSOT) (`src/app.css`), and **never use `href` for fonts anywhere** (no `<link rel="preload" as="font" href="...">`, no `<link rel="stylesheet" href="...">` to font providers, and no external font CDNs).

Fonts must be served exclusively from the website's own static `@font-face` declarations in `src/app.css`, with no runtime dependencies on Google Fonts, external font CDNs, third-party font services, or HTML `<link href>` font tags.

Verify that all fonts load correctly in production and that no external font requests or font `href` tags occur.

### Implementation Rules in This Repository

- Static WOFF2/WOFF font files (`Geist Mono` weights 100–900 normal + italic, and `Geist Sans` weights 100–900 normal) are stored in `src/lib/assets/fonts/` and declared via `@font-face` **solely** at the top of [`src/app.css`](src/app.css). Never duplicate `@font-face` rules inside `+layout.svelte` or individual page/component files, and never emit `<link ... as="font" href="...">`.
- Always reference fonts via the SSOT custom properties: `var(--font-display)`, `var(--font-sans)`, and `var(--font-mono)`.
- The only intentional website/admin/editor families are `Geist Mono` (`--font-display`, `--font-mono`, `--font-heading`) and `Geist Sans` (`--font-sans`, `--font-body`). Keep fallback stacks for font/glyph failure; unsupported editor families are removed through the shared normalizer, preserving content and revision originals.
- Standalone web responses use the build-generated same-origin `/brand-ui.css`. The sole image-context exception is `svg-brand-font.ts`, which embeds the licensed `Geist Sans` WOFF2 bytes as a data URI inside trusted generated SVGs.
- Font licenses (`OFL-1.1`) are documented in [`static/fonts/LICENSES.txt`](static/fonts/LICENSES.txt).

---

## 2. CSS Single Source of Truth (SSOT) & Styling Rules

Full specification: [`docs/CSS_STANDARDS.md`](docs/CSS_STANDARDS.md).

**Shared outer frame:** `.container` uses the single 96rem cap (1536px at 16px root), border-box including shared inline padding; responsive total gutters are split between its two sides. No competing outer caps or nested gutters. Keep article header, cover, prose, FAQ, and related sections 100% flush with the `.container` inner content edges (`1424px` max inner width at `>=1536px`), with the external left-margin TOC rail active only from `118.75rem` (`1900px`). Follow the shared layout/content contract for TOC,FAQ,images and search.

1. **SSOT Location:** [`src/app.css`](src/app.css) is the single unified global stylesheet owning `@layer reset, tokens, base, typography, layout, components, utilities, responsive;`, all `:root` design tokens, and all shared `.inner-page` patterns (`.page-hero`, `.content-section`, `.section-header`, `.section-kicker`, `.section-h2`, `.card-grid`, `.info-card`, `.pricing-card`, `.faq-list`, `.cta-banner`, `.disclaimer-strip`).
2. **Scoped Component & Page Styles:** Component- and page-specific styles belong inside native Svelte 5 scoped `<style>` blocks within their `.svelte` files (consuming design tokens from `src/app.css`). Do not split global marketing styles across multiple global `.css` files.
3. **Zero Undeclared Custom Properties:** Every `var(--token)` used in `src/**/*.{css,svelte}` must be declared in `src/app.css` (or locally scoped on a parent selector) and pass `pnpm check:css` ([`scripts/check-css-tokens.mjs`](scripts/check-css-tokens.mjs)).
4. **No External CSS Frameworks:** Never install or use Tailwind, Sass/SCSS, Less, or CSS-in-JS. Use native CSS + Svelte 5 scoped `<style>` blocks and Svelte 5 class array/object syntax (`class={['chip', { 'is-active': active }]}`).
5. **Contrast Discipline:**
   - Never use `var(--acid)` as text on light `--off` / `.is-light` surfaces; use `--kicker-color: #4b5f1d` for kickers and `var(--ink)` / `var(--lightmuted)` for headings and copy.
   - Always pair `var(--acid)` / `var(--acid2)` backgrounds with `color: var(--ink)`.

---

## 3. Svelte 5, SvelteKit 3 & Enterprise SEO / AI-Search Architecture

Build-time-stable public marketing pages must be prerendered (`SSG`), accessible, and ship unified metadata + Schema.org `@graph` JSON-LD. **CMS exception (owner requirement, 2026-11-05):** the homepage and `/blog/**` use server rendering (`prerender = false`) so publishing updates their initial HTML without a rebuild. They retain SSR, unified metadata, accessibility and browser verification. Read `docs/BLOG_AGENT_HANDOFF.md` for the shared listing contract.

### 3.1 Route File Structure (`+page.ts` + `+page.svelte`)

Every public route under `src/routes/<route-path>/` requires two files:

1. **`+page.ts`** — Exports `prerender = true` and `load({ url })` returning `definePageMetaTags(...)` from `svelte-meta-tags`:

   ```ts
   import { definePageMetaTags } from 'svelte-meta-tags';
   import { BRAND_NAME, SITE_ORIGIN, getCanonicalUrl } from '#lib/seo/structured-data.ts';
   import type { PageLoad } from './$types';

   export const prerender = true;

   export const load: PageLoad = ({ url }) => {
   	const title = 'Concise Page Title'; // house rule: <= 33 chars before " | Revolution Trading Pros"
   	const description =
   		'Unique 140-158 character summary explaining the exact educational value, workflow, and risk discipline covered on this page.'; // house rule: 140-158 chars
   	const canonical = getCanonicalUrl(url);

   	return {
   		...definePageMetaTags({
   			title,
   			description,
   			canonical,
   			// og:image / twitter:image are inherited from the root layout (`/og-image.png`, 1200x630). Do not point at a file that is not in `static/`.
   			openGraph: {
   				type: 'website',
   				url: canonical,
   				title: `${title} | ${BRAND_NAME}`,
   				description
   			},
   			twitter: {
   				title: `${title} | ${BRAND_NAME}`,
   				description
   			}
   		}),
   		jsonLdSchema: buildYourPageJsonLd(SITE_ORIGIN) // import it from '#lib/seo/structured-data.ts' too
   	};
   };
   ```

2. **`+page.svelte`** — Renders `<JsonLd>`, the skip link (`<a class="skip" href="#<main id>">`, styled globally in `src/app.css`), `<Navbar />`, `<main id="<slug>-page" class="inner-page <slug>-page">` (any unique id is fine as long as the skip link targets it), and `<Footer />` (which supplies `<HaveQuestions />` and `<SocialShareBar />`):
   - Use Svelte 5 runes (`$props()`, `$state()`, `$derived()`, `$effect()`) — never legacy `export let` or `$:`.
   - Do not add `<HaveQuestions />` / `<SocialShareBar />` to a page; `<Footer />` renders them through `PreFooter`.
   - Wrap all internal `href` attributes with `resolve('/path')` from `$app/paths`.
   - Use a single `<h1>` per page inside `.page-hero` with a strictly descending `h1 → h2 → h3` hierarchy.

### 3.2 Metadata Character Length & Canonical Discipline

- **`title`:** _House convention (Google sets no title length limit; see [`docs/SEO_EVIDENCE.md`](docs/SEO_EVIDENCE.md))._ Keep the page-specific `title` to **≤ 33 characters** so that when [`src/routes/+layout.svelte`](src/routes/+layout.svelte) appends `titleTemplate="%s | Revolution Trading Pros"` (+26 chars), the rendered `<title>` stays within **30–60 characters**. The `<h1>` should agree with the title.
- **`description`:** _House convention (Google sets no meta-description length limit)._ Must be unique per route and between **140 and 158 characters** (enforced by unit and e2e tests).
- **`canonical` & Origin:** Always construct canonical and OpenGraph URLs via `getCanonicalUrl(url)` and `SITE_ORIGIN` (`https://www.revolutiontradingpros.com`) from [`src/lib/seo/structured-data.ts`](src/lib/seo/structured-data.ts) so prerendered HTML never leaks `http://sveltekit-prerender` or `localhost`.
- **Non-Indexable & Duplicate/Template `[slug]` Routes (`IDX-08`):** Never combine `noindex` with a `canonical` tag. Non-flagship dynamic `[slug]` routes that render shared fallback template content must emit `robots: 'noindex, nofollow'` and `canonical: undefined`, and must not be listed in [`src/routes/sitemap.xml/+server.ts`](src/routes/sitemap.xml/+server.ts).

### 3.3 Structured Data (`@graph` JSON-LD) Rules

- Centralize all JSON-LD builders in [`src/lib/seo/structured-data.ts`](src/lib/seo/structured-data.ts) and render them via `<JsonLd schema={pageGraph} />` from `svelte-meta-tags` (with `<`, `>`, `&` escaped as `\u003c`, `\u003e`, `\u0026` per `SD-02`).
- Emit **one unified `@graph` per page** that references the shared `@id` entities (`ORGANIZATION_ID`, `FOUNDER_ID`, `WEBSITE_ID`, `OFFER_CATALOG_ID`) rather than duplicating disconnected JSON-LD blocks.
- **No Restricted or Retired Schema Types (`SD-10`, `SD-15`):** Never emit `FAQPage` (restricted to government/health sites on 2023-09-14; the rich result stopped appearing 2026-05-07 and its docs were removed 2026-06-15), `HowTo` (docs removed 2023-09-14, no longer shown), `Course` / `CourseInstance` (`Course Info` retired June 2025; only the Course _list_ carousel remains in the gallery), `SpeakableSpecification` (still in the 2026-10-16 gallery but beta, US/English, news-oriented — a project choice not to emit), `SpecialAnnouncement`, or `ClaimReview` in JSON-LD. Render visible FAQs in server-rendered HTML using native `<details>` elements.
- **1-to-1 Breadcrumb Parity (`SD-05`):** Every inner page that emits a `BreadcrumbList` node in JSON-LD must render a matching `<nav aria-label="Breadcrumb">` in the DOM with identical item names and positions.
- Add or update unit tests in [`src/lib/seo/structured-data.spec.ts`](src/lib/seo/structured-data.spec.ts) for every new structured-data builder.

---

## 3. Verified Stack & SEO Contract (`docs/seo/SEO_STANDARD.md`)

- **Verified Stack (`pnpm-lock.yaml`):** `svelte@5.57.3`, `@sveltejs/kit@3.1.1`, `@sveltejs/adapter-vercel@7.0.2`, `vite-plus@1.4.0` (Vite `8.3.5`, Vitest `5.0.5`), `typescript@6.0.3`, `svelte-meta-tags@5.0.3`. SvelteKit 3 uses the `#lib` subpath import alias from [`package.json`](package.json) (`$lib` is removed) and `$app/state` (`$app/stores` is deprecated).
- **SEO Contract Files:**
  - [`src/lib/seo/structured-data.ts`](src/lib/seo/structured-data.ts) — `SITE_ORIGIN`, `getCanonicalUrl`, `isNoIndexRoute`, `serializeJsonLd`, `escapeJsonLdBlocksInHtml`, and all marketing/store/trust `@graph` JSON-LD builders.
  - [`src/lib/seo/blog-seo.ts`](src/lib/seo/blog-seo.ts) — `buildBlogPageMetaTags`, `buildBlogIndexJsonLd`, `buildBlogPostJsonLd`, `buildTaxonomyCollectionJsonLd`.
  - [`src/routes/+layout.ts`](src/routes/+layout.ts) & [`src/routes/+layout.svelte`](src/routes/+layout.svelte) — Root `defineBaseMetaTags` and `<MetaTags>` rendering (guarded on error pages and `/admin/login`).
  - [`src/lib/components/blog/SEO.svelte`](src/lib/components/blog/SEO.svelte) — Blog JSON-LD `<script type="application/ld+json">` emitter using `serializeJsonLd`.
  - [`src/lib/components/layout/Breadcrumb.svelte`](src/lib/components/layout/Breadcrumb.svelte) — Reusable `<nav aria-label="Breadcrumb">` component.
  - [`src/hooks.server.ts`](src/hooks.server.ts) — Enforces `X-Robots-Tag: noindex, nofollow` on non-production origins and `isNoIndexRoute(pathname)` (`IDX-09`), `preload` for `js`/`css`/`font` (`PERF-05`), and `escapeJsonLdBlocksInHtml` (`SD-02`).
  - [`src/routes/sitemap.xml/+server.ts`](src/routes/sitemap.xml/+server.ts) — Canonical XML sitemap (`MAP-01`..`MAP-05`).
- **Forbidden Patterns:**
  - Never add a second metadata system or raw `<svelte:head><title>` / `<meta name="description">` / `<meta name="robots">` in indexable pages (`META-05`).
  - Never hardcode origins (`http://localhost`, `http://sveltekit-prerender`); always use `SITE_ORIGIN` and `getCanonicalUrl(url)` (`META-04`).
  - Never set `export const ssr = false` on indexable routes (`IDX-01`).
  - Never emit `<changefreq>`, `<priority>`, or single-locale `hreflang` in [`src/routes/sitemap.xml/+server.ts`](src/routes/sitemap.xml/+server.ts) (`MAP-04`, `MAP-05`, `I18N-03`).
  - Never emit restricted or retired schema types (`FAQPage`, `HowTo`, `Course`, `CourseInstance`, `SpeakableSpecification`, `SpecialAnnouncement`, `ClaimReview`) (`SD-10`, `SD-15`).
  - Never invent structured-data values (`AggregateRating`, prices not visible in DOM) (`SD-08`, `YMYL-06`).
  - Never use legacy `$app/stores`, `export let`, `$:`, `any`, `@ts-ignore`, `@ts-expect-error`, or `eslint-disable` to silence real errors.
  - Never lower SEO or CWV test thresholds in [`tests/seo/seo-standard.spec.ts`](tests/seo/seo-standard.spec.ts) or [`tests/seo/lab.ts`](tests/seo/lab.ts).

---

## 4. Reusable New-Page Implementation Checklist

When adding any new marketing route to the repository, complete every step in order:

1. **Route Options (`IDX-01`, `IDX-03`, `IDX-11`):** Create `src/routes/<route>/+page.ts` with `export const prerender = true;` and lowercase hyphenated route naming.
2. **Metadata & Canonical (`META-01`..`META-06`, `IDX-08`):** Return `definePageMetaTags(...)` from `load({ url })` with a unique `title` (rendered ≤ 60 chars), unique `description` (140–158 chars), and `canonical: getCanonicalUrl(url)` (or `canonical: undefined` and `robots: 'noindex, nofollow'` if non-indexable).
3. **Semantic Layout & Heading Hierarchy (`HTML-01`, `HTML-02`, `HTML-06`, `HTML-07`):** Create `src/routes/<route>/+page.svelte` rendering `<JsonLd>`, `<a class="skip" href="#<slug>-page">`, `<Navbar />`, `<main id="<slug>-page" class="inner-page ...">`, and `<Footer />` with a single `<h1>` and zero heading-level skips (shared `.inner-page` classes are provided globally by `src/app.css`; place page-specific styles in a scoped `<style>` block). Full templates: [`docs/NEW_PAGE_PLAYBOOK.md`](docs/NEW_PAGE_PLAYBOOK.md).
4. **Breadcrumbs (`SD-05`):** Render `<nav aria-label="Breadcrumb">` (or `<Breadcrumb />`) in `<main>` with item labels that match the JSON-LD `BreadcrumbList` 1-to-1.
5. **Structured Data Builder & Unit Test (`SD-01`..`SD-08`, `SD-10`, `SD-15`, `MON-03`):** Add a typed `@graph` builder in [`src/lib/seo/structured-data.ts`](src/lib/seo/structured-data.ts) (including `BreadcrumbList`, `WebPage`/`CollectionPage`/`ProfilePage`/`ContactPage`, and eligible `Service`/`SoftwareApplication`/`Product` nodes) and unit tests in [`src/lib/seo/structured-data.spec.ts`](src/lib/seo/structured-data.spec.ts).
6. **YMYL Trust Signals (`YMYL-01`..`YMYL-07`, `AI-02`):** Include a visible author/desk attribution byline linking to `/about`, a visible `<time datetime="...">` date, a concise hero summary paragraph under `<h1>`, and a `.disclaimer-strip` risk disclosure.
7. **Media & LCP Priority (`PERF-02`..`PERF-04`, `MEDIA-01`..`MEDIA-03`):** Use `<enhanced:img>` or explicit `width`/`height`, descriptive `alt` text, and `fetchpriority="high"` (without `loading="lazy"`) on any above-the-fold LCP image.
8. **Crawlable Internal & Outbound Links (`IDX-04`, `HTML-03`..`HTML-05`):** Wrap internal links with `resolve('/path')` from `$app/paths`, ensure descriptive anchor text, and qualify external links appropriately.
9. **Sitemap & Inventory Registration (`MAP-01`, `MAP-02`, `MON-01`):** Verify [`src/routes/sitemap.xml/+server.ts`](src/routes/sitemap.xml/+server.ts) discovers the route and add the concrete URL to [`docs/seo/audit/02-inventory.json`](docs/seo/audit/02-inventory.json).
10. **Playwright SEO Spec (`MON-01`):** Verify [`tests/seo/seo-standard.spec.ts`](tests/seo/seo-standard.spec.ts) crawls and passes all assertions on the new URL.
11. **Run `svelte-autofixer` & Gate Commands (`pnpm` ONLY):**
    ```bash
    pnpm check:css
    pnpm check
    pnpm lint
    pnpm test:unit --run
    pnpm build
    pnpm check:pages
    pnpm test:seo
    pnpm test:e2e
    ```

## Editorial punctuation

Preserve authored punctuation on CMS saves, autosaves and restores. Review unnecessary publisher em dashes contextually; keep quotations, attribution, notation, code, URLs and appropriate en-dash ranges. The zero-point editorial advisory does not block publication. Never reintroduce blanket punctuation replacement or infer AI authorship from punctuation.
