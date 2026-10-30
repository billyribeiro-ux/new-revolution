# Mandatory Engineering & Agent Standards (`AGENTS.md`)

This file defines the non-negotiable architectural, typography, CSS, Svelte 5 / SvelteKit 3, and SEO / AI-Search standards for every AI agent and engineer working in this repository.

> **Companion References:**
>
> - **CSS & Typography Standards:** [`docs/CSS_STANDARDS.md`](docs/CSS_STANDARDS.md)
> - **Project & Tooling Configuration:** [`GEMINI.md`](GEMINI.md) (`pnpm` ONLY; `npm`, `yarn`, and `bun` are strictly blocked)

---

## 1. Mandatory Font Hosting Standard

All website fonts must be self-hosted, preferably sourced from Fontsource.org. Use optimized WOFF2 files, preserve the existing typography, and maintain a centralized font configuration within the CSS Single Source of Truth (SSOT).

Fonts must be served exclusively from the website's own infrastructure, with no runtime dependencies on Google Fonts, external font CDNs, or third-party font services.

Follow official Svelte, Fontsource, and web performance guidance for font loading, weight selection, fallback fonts, font-display, and selective preloading.

Verify that all fonts load correctly in production and that no external font requests occur.

### Implementation Rules in This Repository

- Fontsource variable packages (`@fontsource-variable/montserrat` and `@fontsource-variable/sofia-sans`) are imported **solely** at the top of [`src/app.css`](src/app.css). Never duplicate font imports inside `+layout.svelte` or individual page/component files.
- Always reference fonts via the SSOT custom properties: `var(--font-display)`, `var(--font-sans)`, and `var(--font-mono)`.
- Both packages ship only the `wght` axis (normal + italic). Do not add `font-stretch` or `font-variation-settings: 'wdth'` expecting condensed glyph widths.
- Font licenses (`OFL-1.1`) are documented in [`static/fonts/LICENSES.txt`](static/fonts/LICENSES.txt).

---

## 2. CSS Single Source of Truth (SSOT) & Styling Rules

Full specification: [`docs/CSS_STANDARDS.md`](docs/CSS_STANDARDS.md).

1. **SSOT Location:** [`src/app.css`](src/app.css) owns `@layer reset, tokens, base, typography, layout, components, utilities, responsive;` and all `:root` design tokens.
2. **Inner-Page System:** [`src/lib/styles/inner-page.css`](src/lib/styles/inner-page.css) owns shared `.inner-page` patterns (`.page-hero`, `.content-section`, `.section-header`, `.section-kicker`, `.section-h2`, `.card-grid`, `.info-card`, `.pricing-card`, `.faq-list`, `.cta-banner`, `.disclaimer-strip`).
3. **Zero Undeclared Custom Properties:** Every `var(--token)` used in `src/**/*.{css,svelte}` must be declared in `src/app.css` (or locally scoped on a parent selector) and pass `pnpm check:css` ([`scripts/check-css-tokens.mjs`](scripts/check-css-tokens.mjs)).
4. **No External CSS Frameworks:** Never install or use Tailwind, Sass/SCSS, Less, or CSS-in-JS. Use native CSS + Svelte 5 scoped `<style>` blocks and Svelte 5 class array/object syntax (`class={['chip', { 'is-active': active }]}`).
5. **Contrast Discipline:**
   - Never use `var(--acid)` as text on light `--off` / `.is-light` surfaces; use `--kicker-color: #4b5f1d` for kickers and `var(--ink)` / `var(--lightmuted)` for headings and copy.
   - Always pair `var(--acid)` / `var(--acid2)` backgrounds with `color: var(--ink)`.

---

## 3. Svelte 5, SvelteKit 3 & Enterprise SEO / AI-Search Architecture

Every public marketing page must be prerendered (`SSG`), accessible, and ship unified metadata + Schema.org `@graph` JSON-LD.

### 3.1 Route File Structure (`+page.ts` + `+page.svelte`)

Every public route under `src/routes/<route-path>/` requires two files:

1. **`+page.ts`** — Exports `prerender = true` and `load({ url })` returning `definePageMetaTags(...)` from `svelte-meta-tags`:

   ```ts
   import { definePageMetaTags } from 'svelte-meta-tags';
   import { SITE_NAME, SITE_ORIGIN, getCanonicalUrl } from '$lib/seo/structured-data';
   import type { PageLoad } from './$types';

   export const prerender = true;

   export const load: PageLoad = ({ url }) => {
   	const title = 'Concise Page Title'; // <= 30-35 chars before " | Revolution Trading Pros"
   	const description =
   		'Unique 140-158 character summary explaining the exact educational value, workflow, and risk discipline covered on this page.';
   	const canonical = getCanonicalUrl(url);

   	return {
   		...definePageMetaTags({
   			title,
   			description,
   			canonical,
   			openGraph: {
   				type: 'website',
   				url: canonical,
   				title: `${title} | ${SITE_NAME}`,
   				description,
   				siteName: SITE_NAME,
   				images: [
   					{
   						url: `${SITE_ORIGIN}/og-default.png`,
   						width: 1200,
   						height: 630,
   						alt: `${title} — ${SITE_NAME}`
   					}
   				]
   			},
   			twitter: {
   				cardType: 'summary_large_image',
   				title: `${title} | ${SITE_NAME}`,
   				description,
   				image: `${SITE_ORIGIN}/og-default.png`,
   				imageAlt: `${title} — ${SITE_NAME}`
   			}
   		})
   	};
   };
   ```

2. **`+page.svelte`** — Renders `<JsonLd>`, skip-link, `<Navbar />`, `<main id="main-content" class="inner-page">`, `<HaveQuestions />`, `<SocialShareBar />`, and `<Footer />`:
   - Use Svelte 5 runes (`$props()`, `$state()`, `$derived()`, `$effect()`) — never legacy `export let` or `$:`.
   - Wrap all internal `href` attributes with `resolve('/path')` from `$app/paths`.
   - Use a single `<h1>` per page inside `.page-hero` with a strictly descending `h1 → h2 → h3` hierarchy.

### 3.2 Metadata Character Length & Canonical Discipline

- **`title`:** Keep the page-specific `title` to **≤ 33 characters** so that when [`src/routes/+layout.svelte`](src/routes/+layout.svelte) appends `titleTemplate="%s | Revolution Trading Pros"` (+26 chars), the rendered `<title>` stays within **30–60 characters**.
- **`description`:** Must be unique per route and between **140 and 158 characters** (enforced by unit and e2e tests).
- **`canonical` & Origin:** Always construct canonical and OpenGraph URLs via `getCanonicalUrl(url)` and `SITE_ORIGIN` (`https://revolutiontradingpros.com`) from [`src/lib/seo/structured-data.ts`](src/lib/seo/structured-data.ts) so prerendered HTML never leaks `http://sveltekit-prerender` or `localhost`.
- **Duplicate/Template `[slug]` Routes:** If a dynamic `[slug]` route renders shared fallback template content for non-flagship slugs, canonicalize non-flagship slugs to the flagship slug URL and list only canonical URLs in [`src/routes/sitemap.xml/+server.ts`](src/routes/sitemap.xml/+server.ts).

### 3.3 Structured Data (`@graph` JSON-LD) Rules

- Centralize all JSON-LD builders in [`src/lib/seo/structured-data.ts`](src/lib/seo/structured-data.ts) and render them via `<JsonLd schema={pageGraph} />` from `svelte-meta-tags`.
- Emit **one unified `@graph` per page** that references the shared `@id` entities (`ORGANIZATION_ID`, `FOUNDER_ID`, `WEBSITE_ID`, `OFFER_CATALOG_ID`) rather than duplicating disconnected JSON-LD blocks.
- **1-to-1 FAQ Parity:** Whenever a page includes a `FAQPage` node in its `@graph`, every question and answer in the JSON-LD must match the visible FAQ accordion text on the page 1-to-1.
- Add or update unit tests in [`src/lib/seo/structured-data.spec.ts`](src/lib/seo/structured-data.spec.ts) for every new structured-data builder.

---

## 4. Reusable New-Page Implementation Checklist

When adding any new marketing route to the repository, complete every step in order:

1. **Create Route Files:**
   - Create `src/routes/<route>/+page.ts` with `export const prerender = true;` and `definePageMetaTags(...)` (verify `title` + suffix ≤ 60 chars, `description` 140–158 chars, and `canonical` via `getCanonicalUrl(url)`).
   - Create `src/routes/<route>/+page.svelte` importing `$lib/styles/inner-page.css`, rendering `<JsonLd>`, `<a class="skip-link" href="#main-content">`, `<Navbar />`, `<main id="main-content" class="inner-page ...">`, `<HaveQuestions />`, `<SocialShareBar />`, and `<Footer />`.
2. **Add Structured Data Builder & Unit Test:**
   - Add a typed `@graph` builder in [`src/lib/seo/structured-data.ts`](src/lib/seo/structured-data.ts) (including `BreadcrumbList`, `WebPage`/`CollectionPage`/`ItemPage`, and domain-specific `Service`/`Course`/`SoftwareApplication`/`FAQPage` nodes).
   - Add unit test coverage in [`src/lib/seo/structured-data.spec.ts`](src/lib/seo/structured-data.spec.ts).
3. **Register Navigation & Prerender Guards:**
   - If the route was previously in `PLANNED_ROUTE_PATTERN` inside [`vite.config.ts`](vite.config.ts), remove it from `PLANNED_ROUTE_PATTERN` and add it to `LIVE_ROUTES` in [`src/routes/+page.svelte`](src/routes/+page.svelte) (and [`src/lib/components/layout/Navbar.svelte`](src/lib/components/layout/Navbar.svelte) / [`src/lib/components/layout/Footer.svelte`](src/lib/components/layout/Footer.svelte) as appropriate).
   - Verify [`src/routes/sitemap.xml/+server.ts`](src/routes/sitemap.xml/+server.ts) automatically discovers the new `+page.svelte` via `import.meta.glob` (or add explicit canonical slug expansion if it is a unique dynamic route).
4. **Run the Svelte Autofixer & Full Verification Suite:**
   - Run the `svelte-autofixer` MCP tool on new/modified `.svelte` files.
   - Run all mandatory checks (`pnpm` ONLY):
     ```bash
     pnpm check:css
     pnpm check
     pnpm lint
     pnpm test:unit --run
     pnpm build
     pnpm test:e2e
     ```
