# Phase 4 — Remediation Plan (`04-plan.md`)

**Date:** 2026-10-31  
**Branch:** `seo/audit-2026-10-31`  
**Baseline Matrix:** [`docs/seo/audit/03-matrix-baseline.md`](03-matrix-baseline.md) (`29 FAIL`, `2 BLOCKED`)

---

## Execution Order & Work Packages

### Group 1 — Build, Prerendering, Crawlable Links & Error/404 Handling (`IDX-04`, `IDX-05`, `IDX-06`, `IDX-10`, `MAP-01`, `YMYL-07`)

1. **Fix Local PGlite Baseline Seeding (`IDX-04`, `MAP-01`)**
   - **Root Cause:** `[CODE src/lib/server/db/index.ts:95-99]` checks `totalPosts > 0 && !isMemoryDb` and returns early even when `0` posts have `status = 'published'` (because `scripts/import-markdown-posts.ts` imported 40 posts as `draft` into `.svelte-kit/pglite-blog`). As a result, `/sitemap.xml` lists 0 blog posts and `/blog/[slug]` + `/blog/category/[slug]` return `404` on preview.
   - **Files to Change:**
     - `src/lib/server/db/index.ts` — Check published post count (`status = 'published'`) in `seedPreviewBaselineIfEmpty` so the 3 baseline posts (`institutional-order-flow-and-gamma-flip-playbook`, `zero-dte-risk-management-and-position-sizing-rules`, and the draft `private-desk-quarterly-gamma-levels-briefing`) and categories/tags are always seeded when no published baseline post exists.

2. **Build Missing Trust Pages & Resolve Broken Internal Links / Prerender Suppressions (`IDX-04`, `IDX-05`, `IDX-10`, `YMYL-07`)**
   - **Root Cause:**
     - `[CODE vite.config.ts:12-36]` suppresses `404` errors during `pnpm build` for `PLANNED_ROUTE_PATTERN` and omits `handleUnseenRoutes`.
     - `[CODE src/lib/data/homepage.ts:523-547]`, `[CODE src/routes/resources/+page.svelte:95-115]`, and `[CODE src/lib/seo/structured-data.ts:448-475]` link to `/blogs/*` (which 308-redirect to `/blog/*` and 404) and unbuilt routes (`/contact`, `/privacy-policy`, `/terms-of-service`, `/editorial-policy`, `/refund-policy`, `/login`, `/signup`, `/memberships`, `/alert-services/explosive-swings`, `/resources/options-calculator`, `/resources/free-trading-ebook`).
   - **Files to Change:**
     - Create the 5 required YMYL trust pages (`YMYL-07`):
       - `src/routes/contact/+page.ts` & `src/routes/contact/+page.svelte`
       - `src/routes/editorial-policy/+page.ts` & `src/routes/editorial-policy/+page.svelte`
       - `src/routes/privacy-policy/+page.ts` & `src/routes/privacy-policy/+page.svelte`
       - `src/routes/terms-of-service/+page.ts` & `src/routes/terms-of-service/+page.svelte`
       - `src/routes/refund-policy/+page.ts` & `src/routes/refund-policy/+page.svelte`
     - Update all `/blogs/*` links in `src/lib/data/homepage.ts`, `src/routes/resources/+page.svelte`, and `src/lib/seo/structured-data.ts` to point directly to live published `/blog/[slug]` articles (`IDX-04`, `IDX-10`).
     - Update `src/lib/components/layout/Navbar.svelte`, `src/lib/components/layout/Footer.svelte`, `src/routes/+page.svelte`, `src/routes/about/+page.svelte`, `src/routes/our-mission/+page.svelte`, `src/routes/mentorship/+page.svelte`, `src/routes/live-trading-rooms/*/+page.svelte`, `src/routes/alert-services/spx-profit-pulse/+page.svelte`, `src/routes/resources/+page.svelte`, and `src/lib/seo/structured-data.ts` so every `<a href>` targets a real `200` route (zero links to unbuilt `404` paths).
     - Update `vite.config.ts` so `prerender.handleHttpError` fails the build on any `404` (`PLANNED_ROUTE_PATTERN` removed) and `handleUnseenRoutes: 'warn'` is explicitly configured (`IDX-05`).

3. **Create Root `+error.svelte` and Fix Error Page Metadata (`IDX-06`, `META-05`)**
   - **Root Cause:**
     - No root `src/routes/+error.svelte` exists.
     - `[CODE src/routes/+layout.svelte:11,22]` renders `<MetaTags {...metaTags} />` from `[CODE src/routes/+layout.ts:19-39]` even when `page.error` is non-null (`page.status >= 400`), causing every 404 page to emit the homepage `<title>` and a `<link rel="canonical">`.
     - `[CODE src/routes/blog/+error.svelte:25-27]` emits a duplicate `<meta name="robots" content="noindex, nofollow" />` on `/blog/*` 404s.
   - **Files to Change:**
     - Create `src/routes/+error.svelte` rendering `<Navbar />`, `<main>` with status code (`page.status`), error heading, helpful navigation links, and `<Footer />`.
     - Update `src/routes/+layout.svelte` so when `page.error` is truthy (`page.status >= 400`), `<MetaTags>` overrides `title` to `"${page.status} — Page Not Found"`, sets `robots: 'noindex, nofollow'`, and omits `canonical` and `languageAlternates`.
     - Remove duplicate `<svelte:head>` tags from `src/routes/blog/+error.svelte`.

---

### Group 2 — Robots, Non-Production `X-Robots-Tag` & Canonical/Noindex Discipline (`IDX-07`, `IDX-08`, `IDX-09`, `META-04`, `META-05`, `AI-04`)

1. **Fix `static/robots.txt` (`IDX-07`, `IDX-08`, `AI-04`)**
   - **Root Cause:** `[CODE static/robots.txt:3-7]` disallows `/login`, `/register`, `/dashboard`, `/admin`, `/checkout` (`IDX-08` requires `noindex` pages **not** to be disallowed in `robots.txt` so crawlers can read the `noindex` directive), and has no explicit `Google-Extended` policy comment (`AI-04`).
   - **Files to Change:**
     - `static/robots.txt` — Keep `User-agent: *`, `Allow: /`, `Disallow: /api/`, explicit `Google-Extended` policy per owner decision, and `Sitemap: https://revolutiontradingpros.com/sitemap.xml`.

2. **Add Non-Production & Noindex `X-Robots-Tag` in `src/hooks.server.ts` (`IDX-08`, `IDX-09`)**
   - **Root Cause:** `[CODE src/hooks.server.ts:91-146]` never sets `X-Robots-Tag: noindex, nofollow` on non-production hosts or `noindex` sections (`/admin`, `/demo`, etc.).
   - **Files to Change:**
     - `src/hooks.server.ts` — Set `X-Robots-Tag: noindex, nofollow` when `event.url.origin !== SITE_ORIGIN` (in non-preview or when host is not `revolutiontradingpros.com`, with configurable env check so local crawler can verify both behaviors) and on all `isNoIndexRoute(pathname)` routes.

3. **Eliminate Conflicting `canonical` + `noindex` and Duplicate Admin Meta Tags (`IDX-08`, `META-04`, `META-05`)**
   - **Root Cause:**
     - `[CODE src/routes/+layout.ts:32]` sets `canonical: canonicalUrl` even when `noIndex` is `true`.
     - `[CODE src/routes/store/courses/[slug]/+page.ts:34-41]`, `[CODE src/routes/store/indicators/[slug]/+page.ts:38-45]`, and `[CODE src/routes/store/scanners/[slug]/+page.ts:38-45]` set `robots: 'noindex, follow'` while also emitting a cross-page `canonical` (`IDX-08` violation).
     - `[CODE src/lib/components/SEO.svelte:26-33]` emits duplicate `<title>`, `<meta name="description">`, and `<meta name="robots">` on `/admin/*` pages.
   - **Files to Change:**
     - `src/routes/+layout.ts` — Set `canonical: noIndex ? undefined : canonicalUrl`.
     - `src/routes/store/courses/[slug]/+page.ts`, `src/routes/store/indicators/[slug]/+page.ts`, `src/routes/store/scanners/[slug]/+page.ts` — Omit `canonical` when `robots` is `noindex, follow` (or per owner decision on non-flagship slugs).
     - `src/lib/components/SEO.svelte` — Remove duplicate `<meta name="robots">` / `<meta name="description">` / `<title>` collisions with `svelte-meta-tags` or route through `page.data.pageMetaTags`.

---

### Group 3 — Metadata Length & Uniqueness (`META-02`, `META-03`)

1. **Fix Homepage `<title>` and `<meta name="description">` Length (`META-02`, `META-03`)**
   - **Root Cause:**
     - `[CODE src/routes/+layout.ts:20-21]` & `[CODE src/routes/+page.ts:15-18]` produce a 91-char `<title>` (`Live Stock & Options Trading Room, Mentorship & Custom Indicators | Revolution Trading Pros`) and a 207-char `<meta name="description">` on `/`.
     - `[CODE src/routes/store/courses/[slug]/+page.ts:25-26]` has a 159-char description containing `&`, which renders as 163 chars (`&amp;`) in raw HTML.
   - **Files to Change:**
     - `src/routes/+layout.ts` & `src/routes/+page.ts` — Shorten homepage `title` to ≤ 33 chars (`Stock & Options Trading Rooms` → `55` chars with ` | Revolution Trading Pros`) and `description` to 140–158 chars (`152` chars), and align homepage `<h1>` lead/display.
     - `src/routes/store/courses/[slug]/+page.ts` — Replace `&` with `and` so rendered description is `155` chars (≤ 158 chars).

---

### Group 4 — Structured Data (`SD-01`, `SD-02`, `SD-03`, `SD-05`, `SD-07`, `SD-08`, `SD-10`, `SD-15`)

1. **Replace `svelte-meta-tags` `<JsonLd>` with Safe `JsonLdBlock.svelte` Escaping `<`, `>`, `&`, `U+2028`, `U+2029` (`SD-02`)**
   - **Root Cause:** `[CODE node_modules/svelte-meta-tags/dist/JsonLd.svelte:22]` only escapes `<`.
   - **Files to Change:**
     - Create `src/lib/components/seo/JsonLd.svelte` (or `serializeJsonLd` helper in `src/lib/seo/structured-data.ts`) that escapes `<`, `>`, `&`, `\u2028`, `\u2029` and use it across all routes.

2. **Remove Restricted/Retired Schema Types (`FAQPage`, `Course`, `CourseInstance`, `SpeakableSpecification`) (`SD-01`, `SD-10`, `SD-15`)**
   - **Root Cause:** `[CODE src/lib/seo/structured-data.ts:328-333, 368, 600-1540]` and `[CODE src/lib/seo/blog-seo.ts:218-240]` emit `FAQPage` (restricted to government/health sites per `SD-10`), `Course` / `CourseInstance` (retired June 2025 per `SD-15`), and `SpeakableSpecification`.
   - **Files to Change:**
     - `src/lib/seo/structured-data.ts` & `src/lib/seo/blog-seo.ts` — Remove `FAQPage`, `Course`, `CourseInstance`, and `SpeakableSpecification` nodes from JSON-LD `@graph` builders while preserving the visible `<details>` FAQ sections in the HTML (`AI-02`).
     - Update unit tests in `src/lib/seo/structured-data.spec.ts` and `src/lib/seo/blog-seo.test.ts` and `scripts/check-all-pages.mjs`.

3. **Emit `ProfilePage` on `/about` (`SD-07`)**
   - **Root Cause:** `[CODE src/lib/seo/structured-data.ts:690-750]` emits `@type: 'AboutPage'` instead of `@type: 'ProfilePage'` with `mainEntity: { '@id': FOUNDER_ID }`.
   - **Files to Change:**
     - `src/lib/seo/structured-data.ts` — Change `/about` webpage schema `@type` to `'ProfilePage'` with `mainEntity: { '@id': FOUNDER_ID }` (`Person` with `name`, `jobTitle`, `description`, `url`, `worksFor`, `sameAs`).

4. **Ensure 1-to-1 `BreadcrumbList` Parity Across All Non-Home Indexable Pages (`SD-03`, `SD-05`)**
   - **Root Cause:**
     - `/watchlist`, `/resources/stock-indexes-list`, and `/blog` lack a visible `<nav aria-label="Breadcrumb">` in the DOM.
     - `/about`, `/mentorship`, `/store/courses`, `/store/indicators`, `/store/scanners`, `/store/courses/[slug]`, `/store/indicators/[slug]`, and `/store/scanners/[slug]` have mismatched labels between JSON-LD `BreadcrumbList` and `<nav aria-label="Breadcrumb">`.
   - **Files to Change:**
     - Add visible `<nav class="breadcrumb-nav" aria-label="Breadcrumb">` to `src/routes/watchlist/+page.svelte`, `src/routes/resources/stock-indexes-list/+page.svelte`, and `src/routes/blog/+page.svelte`.
     - Align breadcrumb item names 1-to-1 between `src/lib/seo/structured-data.ts` and the visible `<nav aria-label="Breadcrumb">` in `src/routes/about/+page.svelte`, `src/routes/mentorship/+page.svelte`, `src/routes/store/courses/+page.svelte`, `src/routes/store/indicators/+page.svelte`, `src/routes/store/scanners/+page.svelte`, `src/routes/store/courses/[slug]/+page.svelte`, `src/routes/store/indicators/[slug]/+page.svelte`, and `src/routes/store/scanners/[slug]/+page.svelte`.

---

### Group 5 — Single-Locale `hreflang` Cleanup (`MAP-05`, `I18N-03`)

1. **Remove Redundant Single-URL `hreflang` Alternates (`MAP-05`, `I18N-03`)**
   - **Root Cause:** `[CODE src/routes/+layout.ts:35-39]` and `[CODE src/routes/sitemap.xml/+server.ts:138-140]` emit `en-us`, `en-ca`, and `x-default` all pointing to the exact same URL on a single-locale (`en`) site.
   - **Files to Change:**
     - `src/routes/+layout.ts` — Omit `languageAlternates` and `og:locale:alternate` when only one locale URL exists.
     - `src/routes/sitemap.xml/+server.ts` — Omit `<xhtml:link rel="alternate" hreflang=...>` on single-locale URLs.

---

### Group 6 — Font Preloading, Internal Linking, Tap Targets & YMYL Attribution (`PERF-05`, `HTML-02`, `HTML-04`, `HTML-06`, `YMYL-01`, `YMYL-02`)

1. **Add Critical Font Preload in `src/hooks.server.ts` (`PERF-05`)**
   - **Root Cause:** `[CODE src/hooks.server.ts:145]` does not pass a `preload` filter to `resolve`.
   - **Files to Change:**
     - `src/hooks.server.ts` — Wrap `resolve` to pass `preload: ({ type }) => type === 'js' || type === 'css' || type === 'font'`.

2. **Resolve Orphan Pages (`HTML-04`)**
   - **Root Cause:** `/watchlist`, `/store/indicators/move-prior-to-the-move-system`, and `/store/scanners/high-octane-scanner` are in `/sitemap.xml` but have zero incoming internal links (`clickDepthFromHome: null`).
   - **Files to Change:**
     - `src/lib/components/layout/Navbar.svelte` & `src/lib/components/layout/Footer.svelte` — Link `/watchlist`.
     - `src/routes/store/indicators/+page.svelte` — Ensure the flagship card links to `/store/indicators/move-prior-to-the-move-system`.
     - `src/routes/store/scanners/+page.svelte` — Ensure the flagship card links to `/store/scanners/high-octane-scanner`.

3. **Fix Mobile Tap Target Sizing (`>= 24x24` CSS px) (`HTML-06`)**
   - **Root Cause:** `.breadcrumb-nav a`, `.footer-links a`, `.cross-links a`, and `.text-link` have rendered heights of `15px–22px` (`< 24px`).
   - **Files to Change:**
     - `src/lib/styles/inner-page.css`, `src/lib/components/layout/Footer.svelte`, and page scoped styles — Add `min-height: 24px; display: inline-flex; align-items: center;` to interactive link elements so all tap targets measure `>= 24x24` CSS px at `375x812`.

4. **Add Visible Author Byline & `<time datetime>` on Resource & Blog Hub Pages (`YMYL-01`, `YMYL-02`)**
   - **Root Cause:** `/resources/etf-stocks-list` and `/resources/stock-indexes-list` lack a visible author byline (`Billy Ribeiro` linking to `/about`), and `/resources/stock-indexes-list` and `/blog` lack a visible `<time datetime="...">` element.
   - **Files to Change:**
     - `src/routes/resources/etf-stocks-list/+page.svelte`, `src/routes/resources/stock-indexes-list/+page.svelte`, and `src/routes/blog/+page.svelte`.

---

### Group 7 — Automated SEO Gate, Lab Gate, Operations Runbook & Agent Standards (`MON-01`..`MON-05`)

1. **Automated SEO & Lab Test Suite (`MON-01`, `MON-02`, `MON-03`)**
   - **Files to Change:**
     - Create `tests/seo/seo-standard.spec.ts` asserting every automated requirement in `SEO_STANDARD.md` (`IDX-*`, `META-*`, `SD-*`, `MAP-*`, `I18N-*`, `PERF-*`, `MEDIA-*`, `HTML-*`, `YMYL-*`, `SPAM-*`).
     - Update `package.json` scripts so `pnpm check:pages` / `pnpm test:seo` runs the crawler and lab assertions.
2. **Operations Runbook & Agent Rules (`MON-04`, `MON-05`, Phase 7)**
   - **Files to Change:**
     - Create `docs/seo/OPERATIONS.md` (`MON-04`).
     - Update `AGENTS.md` and create `CLAUDE.md` (`@AGENTS.md` on line 1) (`MON-05`).
