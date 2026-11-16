# Enterprise Technical SEO, Structured Data, YMYL & Launch Standard (`docs/SEO_STANDARD.md`)

> **Canonical Origin (`SITE_ORIGIN`):** `https://www.revolutiontradingpros.com` ([`src/lib/shared/site-origin.ts`](../src/lib/shared/site-origin.ts))  
> **Automated Suites:** [`tests/seo/seo-standard.spec.ts`](../tests/seo/seo-standard.spec.ts) (`pnpm test:seo`), [`scripts/check-prerendered-pages.mjs`](../scripts/check-prerendered-pages.mjs) (`pnpm check:pages`), [`tests/seo/crawler.ts`](../tests/seo/crawler.ts), and [`tests/seo/lab.ts`](../tests/seo/lab.ts).  
> **URL Inventory:** [`docs/seo/audit/02-inventory.json`](seo/audit/02-inventory.json)

Every SEO rule in this document traces either to a fetched **Google Search Central / SvelteKit primary source** (Section 13) or is explicitly labeled a **[house convention]**. Never cite a house convention as a Google requirement.

---

## 1. Tooling & Verification Architecture (`TOOL`)

| ID        | Requirement                                                                                                                                                                                                                                                                                  | Implementation / Verification    |
| :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------- |
| `TOOL-01` | Single metadata framework (`svelte-meta-tags@5.0.3`): root `defineBaseMetaTags` in [`src/routes/+layout.ts`](../src/routes/+layout.ts), route `definePageMetaTags` in `+page.ts` / `+page.server.ts`, merged via `deepMerge` in [`src/routes/+layout.svelte`](../src/routes/+layout.svelte). | `package.json`, `pnpm check`     |
| `TOOL-02` | Prerendered HTML contract guard (`pnpm check:pages`): verifies single `<h1>`, valid `.skip` link, canonical on `SITE_ORIGIN` (or clean `noindex` with no canonical), zero `localhost`/`sveltekit-prerender` leaks, and valid JSON-LD across all `99` prerendered HTML files.                 | `pnpm build && pnpm check:pages` |
| `TOOL-03` | Full-inventory Playwright SEO gate (`pnpm test:seo`): crawls [`docs/seo/audit/02-inventory.json`](seo/audit/02-inventory.json) against built `pnpm preview` and enforces HTTP status, canonicals, `robots`, JSON-LD `@graph`, breadcrumbs, and prohibited schema exclusions.                 | `pnpm test:seo` (`3/3` suites)   |
| `TOOL-04` | Deterministic HTTP link-graph/shingle crawler (`tests/seo/crawler.ts`) and headless Chromium CWV/WCAG lab (`tests/seo/lab.ts`). Thresholds are never lowered to make a run pass.                                                                                                             | CLI audit output                 |

---

## 2. Crawling, Rendering & Indexing (`IDX`)

| ID       | Requirement                                                                                                                                                                                                                                                                                                                                         | Implementation / Verification                        |
| :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------- |
| `IDX-01` | Build-time-stable marketing pages export `prerender = true` (`SSG`). `/` and `/blog/**` export `prerender = false` (`SSR`) so CMS publications appear without a rebuild ([`docs/BLOG_CONTRACT.md`](BLOG_CONTRACT.md)). Never set `ssr = false` on indexable routes.                                                                                 | Route `+page.ts` / `+page.server.ts`                 |
| `IDX-02` | Trailing-slash normalization: canonical URLs never end with `/` except root `https://www.revolutiontradingpros.com`. `getCanonicalUrl(url)` strips trailing slashes.                                                                                                                                                                                | `structured-data.spec.ts`                            |
| `IDX-03` | Lowercase hyphenated route paths (`url-structure`, Google 2026-10-21). Never use underscores, uppercase letters, or `#fragment`-switched content.                                                                                                                                                                                                   | Route tree & `crawler.ts`                            |
| `IDX-04` | Crawlable `<a href>` links wrapped with SvelteKit 3.2 `resolve()` (`$app/paths`). Relative `./` / `../` hrefs emitted by SvelteKit are explicitly supported by Google (`links-crawlable`).                                                                                                                                                          | `pnpm lint` (`svelte/no-navigation-without-resolve`) |
| `IDX-05` | Real HTTP `404` status on missing routes, unpublished/trashed blog slugs, and out-of-range/malformed `?page=` parameters (never soft-`200` empty states). Google treats `404` and `410` equivalently (`http-network-errors`, 2026-02-04).                                                                                                           | `blog-pagination.spec.ts`, `seo-standard.spec.ts`    |
| `IDX-06` | Dynamic [`src/routes/robots.txt/+server.ts`](../src/routes/robots.txt/+server.ts) returns `Disallow: /` when `!BRAND.isProduction` (`PUBLIC_ENV !== 'production'`) and in production allows Google/AI crawlers, blocks `/api/` & `/account/`, omits `/admin` & `/checkout` `Disallow` (`IDX-08`), and emits `Sitemap: ${BRAND.domain}/sitemap.xml`. | `robots.txt/+server.ts`, `seo-standard.spec.ts`      |
| `IDX-08` | **Mutual exclusivity of `noindex` and `canonical`:** any route emitting `noindex` (`/admin/**`, `/login`, `/register`, `/enroll/*`, `/blog?search=*`, launch-gated `/store/*` `T10`, `[TODO]` routes `T16`) must set `canonical: undefined` and be omitted from `/sitemap.xml`.                                                                     | `src/routes/+layout.svelte`, `pnpm check:pages`      |
| `IDX-09` | Zero-Leak Staging Shield: [`src/hooks.server.ts`](../src/hooks.server.ts) (`resolveRobotsAndSecurityHeaders`) emits `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` whenever `!BRAND.isProduction` (`PUBLIC_ENV !== 'production'`) or `isNonProductionHost`, and [`vercel.json`](../vercel.json) enforces `.vercel.app` headers.            | `hooks.server.spec.ts`, `seo-certification.spec.ts`  |
| `IDX-12` | HTTPS, HSTS & canonical `www` host: `http://` and bare `https://revolutiontradingpros.com` redirect (`308`) to `https://www.revolutiontradingpros.com` with `Strict-Transport-Security`.                                                                                                                                                            | Production `curl -sI` check (§15.1)                  |

---

## 3. Metadata, Titles, Snippets & Icons (`META`)

| ID        | Requirement                                                                                                                                                                                                                                                                  | Source / Verification               |
| :-------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------- |
| `META-01` | Unique `<title>` per indexable URL. **[House convention]:** page `title` ≤ `33` chars before ` \| Revolution Trading Pros` (`+26` chars) so rendered `<title>` stays `30–60` chars (Google sets no character limit; `title-link`, 2025-12-10). `<h1>` agrees with `<title>`. | Page specs & `seo-standard.spec.ts` |
| `META-02` | Unique `<meta name="description">` per indexable URL. **[House convention]:** `140–158` chars matching `WebPage.description` (Google sets no length limit; `snippet`, 2026-04-20).                                                                                           | Page specs & `seo-standard.spec.ts` |
| `META-04` | Canonical, Open Graph (`og:url`, `og:image`), and Twitter URLs always resolve against `SITE_ORIGIN` (`https://www.revolutiontradingpros.com`), never `url.origin` (which leaks `http://sveltekit-prerender` during SSG or mutates on client hydration).                      | `src/lib/seo/structured-data.ts`    |
| `META-05` | Never place raw `<svelte:head><title>` or `<meta name="description">` on public pages; `/admin` suppresses marketing `<MetaTags>` in `+layout.svelte` and sets its own `noindex, nofollow` admin title.                                                                      | `admin-shell.e2e.ts`                |
| `META-06` | Default social card `/og-image.png` (`1200×630` real PNG in `static/`) inherited from `+layout.ts`; blog articles emit their verified large cover URL. Never reference `/og-default.png` (does not exist).                                                                   | `static/og-image.png`               |
| `META-07` | Square 1:1 crawlable favicons (`/favicon.ico` `48×48`, `/favicon-48x48.png`, `/icon-192.png`, `/apple-touch-icon.png`) at stable URLs (`favicon-in-search`, 2026-10-27; Google requires ≥ `8×8` square and recommends `> 48×48` — there is no "multiple of 48px" rule).      | `src/routes/+layout.svelte`         |

---

## 4. Structured Data (`@graph` JSON-LD) (`SD`)

| ID                | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                  | Implementation / Verification                      |
| :---------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------- |
| `SD-01`           | **[House convention]:** Single unified `@graph` per page built in [`src/lib/seo/structured-data.ts`](../src/lib/seo/structured-data.ts) or [`src/lib/seo/blog-seo.ts`](../src/lib/seo/blog-seo.ts), referencing shared `#organization`, `#founder`, and `#offer-catalog` `@id`s without duplicate definitions.                                                                                                               | `structured-data.spec.ts`, `blog-seo.spec.ts`      |
| `SD-02`           | XSS-safe serialization: `<`, `>`, `&`, `U+2028`, and `U+2029` escaped via `serializeJsonLd` and `escapeJsonLdBlocksInHtml` in `src/hooks.server.ts`.                                                                                                                                                                                                                                                                         | `structured-data.spec.ts`                          |
| `SD-03`           | **1:1 Visible Content Parity (`sd-policies`, 2026-07-10):** structured data must represent content visible to readers in SSR HTML. Never mark up hidden text, unverified ratings, or unshown prices.                                                                                                                                                                                                                         | `pnpm check:pages`, `seo-standard.spec.ts`         |
| `SD-04`           | `WebSite` node (`#website`) emitted **solely on `/`** per Google Search Central Site Names spec (`site-names`, 2025-12-10). Do **not** emit `WebSite` on inner routes and do **not** emit `SearchAction` (`Sitelinks Search Box` retired Nov 2024).                                                                                                                                                                          | `structured-data.ts`, `seo-certification.spec.ts`  |
| `SD-05`           | `BreadcrumbList` on inner pages matches `<nav aria-label="Breadcrumb">` item names and positions 1-to-1.                                                                                                                                                                                                                                                                                                                     | `seo-standard.spec.ts`                             |
| `SD-06`           | `BlogPosting` / `Article` (`article`, 2026-09-08): emits `headline`, `description`, `datePublished`, honest `dateModified` (`contentUpdatedAt`, never row `updatedAt`), `author` (`Person`), `publisher` (`#organization`), and `image` (`ImageObject` array of `16:9`, `4:3`, `1:1` crops ≥ `50,000` px when available).                                                                                                    | `blog-seo.ts`, `modified-date.db.spec.ts`          |
| `SD-08`           | `Product` / `SoftwareApplication` / `Service`: never invent `AggregateRating` or self-controlled star reviews (`review-snippet`, 2026-09-08); while `COMMERCE_ENABLED = false` (`T14`), never emit live `InStock` checkout claims where purchase is unavailable.                                                                                                                                                             | `structured-data.spec.ts`                          |
| `SD-10` & `SD-15` | **Prohibited / Retired Schema Types:** Never emit `FAQPage` (rich result ended `2026-05-07`, docs removed `2026-06-15`), `HowTo` (removed `2023-09-14`), `Course` / `CourseInstance` (`Course Info` retired June 2025; project policy omits `Course`), `SpeakableSpecification` (project policy), `SpecialAnnouncement`, or `ClaimReview`. `dropRestrictedJsonLdNodes` in `blog-seo.ts` blocks them from custom CMS JSON-LD. | `seo-standard.spec.ts`, `blog-seo.spec.ts`         |
| `SD-11`           | **AI Overviews & LLM Grounding (`ai-features`, 2025-12-10):** Google requires zero special AI schema; [`src/routes/llms.txt/+server.ts`](../src/routes/llms.txt/+server.ts) serves a `noindex` Markdown entity brief in production (`PUBLIC_ENV === 'production'`) for non-Google grounding crawlers (`OAI-SearchBot`, `PerplexityBot`, `Claude-SearchBot`).                                                                 | `llms.txt/+server.ts`, `seo-certification.spec.ts` |

---

## 5. XML Sitemap & RSS (`MAP`)

- Served by [`src/routes/sitemap.xml/+server.ts`](../src/routes/sitemap.xml/+server.ts) (`application/xml`): contains **only** HTTP `200`, canonical (`SITE_ORIGIN`), indexable URLs (zero `noindex` pages, zero `[TODO]` shells `T16`, zero gated `/store/*` routes `T10`, zero redirects).
- Emits `<lastmod>` only from verifiable editorial timestamps (`contentUpdatedAt ?? publishedAt`), never build time. Never emits `<priority>` or `<changefreq>` (ignored by Google; `build-sitemap`, 2026-07-08).
- Image sitemap entries emit `<image:loc>` only (deprecated `<image:title>` / `<image:caption>` omitted per `image-sitemaps`, 2025-12-10).
- Do not ping deprecated sitemap ping endpoints (retired by Google in June 2023); submit via Search Console.

---

## 6. Core Web Vitals, Media & Accessibility (`PERF`, `HTML`, `A11Y`)

- **CWV Field Pass Targets (`core-web-vitals`, 2025-12-10, p75 mobile & desktop):** **LCP ≤ 2.5 s**, **INP ≤ 200 ms**, **CLS ≤ 0.1** (local preview lab verified at `0.0000` initial & refresh CLS across core templates).
- **Fonts (`PERF-05`):** Self-hosted `.woff2` in `static/fonts/` with `font-display: optional`, metric-matched fallback faces, immutable 1-year caching, and `shouldPreload` preloading `js`/`css` only (`0` `<link as="font">` tags; [`docs/CSS_STANDARDS.md`](CSS_STANDARDS.md) §3).
- **Images (`PERF-02`..`04`):** `@sveltejs/enhanced-img` listed before `sveltekit()` in `vite.config.ts`; explicit `width`/`height` on all `<img>` elements; LCP hero/cover images carry `fetchpriority="high"` and `loading="eager"` (never `loading="lazy"`).
- **HTML & A11Y (`HTML-01`..`05`, `A11Y-01`..`02`):** Single `<h1>`, strict `h1 → h2 → h3`, semantic landmarks (`header`, `nav`, `main`, `footer`), `<a class="skip">`, descriptive `alt` text (`alt=""` for decorative), descriptive anchor text, and zero `serious`/`critical` `axe-core` violations.

---

## 7. YMYL, E-E-A-T & Spam-Policy Compliance (`YMYL`, `SPAM`)

Trading, options, and financial education are strict **YMYL** surfaces (`creating-helpful-content`, 2026-10-05; `spam-policies`, 2026-08-28):

1. **Verifiable Attribution (`YMYL-01`, `YMYL-02`):** Visible founder/desk attribution (`FOUNDER` in [`src/lib/data/site.ts`](../src/lib/data/site.ts): `Billy Ribeiro`, `Founder & Head Trader`) linking to `/about` (`ProfilePage`). Never fabricate authors, AI headshots (`T9` uses `/icon-512.png` honestly until a real photo is supplied), or unverified credentials.
2. **Honest Methodology, Regulatory & Risk Disclosures (`YMYL-03`..`07`):**
   - Site-wide US & Canada non-registered educational publisher and options/leverage risk disclosures in `Footer.svelte`, plus contextual disclosures on room/alert/article pages.
   - Regulatory accuracy: **FINRA Rule 4210 intraday margin (`$2,000` baseline, effective June 4, 2026)** and **T+1 cash settlement**; hypothetical/illustrative charts and case studies labeled honestly (`VERIFIED_CASE_STUDIES` gated by `T11`).
   - Crawlable trust pages live: `/about`, `/our-mission`, `/contact`, `/editorial-policy`, `/privacy-policy`, `/terms-of-service`, `/refund-policy`.
3. **Honest Dates (`YMYL-08`):** `dateModified` and visible `"Updated"` badges advance only on substantive content changes (`contentUpdatedAt`), never routine metadata/featured toggles.
4. **Spam-Policy Guardrails (`SPAM-01`..`11`):** Zero cloaking, zero doorway/scaled thin `[slug]` pages (non-flagship slugs are `noindex` `[TODO]` shells `T16`), zero hidden LLM prompt-injection text (`SPAM-11`, 2026-05-15 / 2026-08-28), zero back-button hijacking (`2026-04-13`), `rel="sponsored"` on any paid/affiliate link, and `pnpm audit` tracked (`todo.md` `F15`).

---

## 8. Primary-Source Evidence Summary (Re-Verified 2026-11-01 / 2026-11-02)

| Topic                        | Primary Google / SvelteKit Source & Date                                                                                                                       | Repository Rule                                                                                  |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| FAQ Rich Result Retired      | Search Central Changelog `2026-05-08` (stopped `2026-05-07`) & `2026-06-15` (docs removed)                                                                     | Never emit `FAQPage` JSON-LD; render native `<details>` FAQs for readers.                        |
| Retired Gallery Types        | `2025-06-12` Simplifying Search Results (`Course Info`, `Claim Review`, `Special Announcement`); `HowTo` (`2023-09-14`); `Sitelinks Search Box` (`2024-11-21`) | Blocked by `seo-standard.spec.ts` and `dropRestrictedJsonLdNodes`.                               |
| Visible Content Parity       | `sd-policies` (`2026-07-10`) & `ai-features` (`2025-12-10`)                                                                                                    | 1:1 DOM-to-JSON-LD parity enforced by `pnpm check:pages`.                                        |
| AI Overviews & `llms.txt`    | `ai-features` (`2025-12-10`); Changelog `2026-06-15` (`llms.txt` not used by Google Search)                                                                    | Zero special AI schema; `/llms.txt` served with `X-Robots-Tag: noindex` for LLM bots.            |
| Title & Description Length   | `title-link` (`2025-12-10`), `snippet` (`2026-04-20`): Google sets no character limit                                                                          | `30–60` title & `140–158` description are labeled **[house conventions]**.                       |
| Sitemap `lastmod` & Priority | `build-sitemap` (`2026-07-08`): `<priority>` & `<changefreq>` ignored; `lastmod` must be verifiable                                                            | Emit verifiable `lastmod` only; omit `<priority>` and `<changefreq>`.                            |
| Article `image` Crops        | `structured-data/article` (`2026-09-08`): `16:9`, `4:3`, `1:1` crops ≥ `50,000` px recommended                                                                 | Media pipeline generates `crop-16x9`, `crop-4x3`, `crop-1x1` WebPs (`docs/BLOG_CONTRACT.md` §5). |
| `robots.txt` vs `noindex`    | `robots/intro` (`2025-12-10`): `Disallow` does not prevent indexing of linked URLs                                                                             | Gate unlaunched/placeholder routes with `noindex` (`IDX-08`), never `robots.txt` `Disallow`.     |
| Prerendered Headers          | SvelteKit `hooks` docs & Vercel `vercel.json` (`2026-08-14`)                                                                                                   | Prerendered SSG pages bypass `handle` in prod; preview `X-Robots-Tag` lives in `vercel.json`.    |

---

## 9. Recorded Owner SEO & Policy Decisions

1. **Canonical Host:** `https://www.revolutiontradingpros.com` (`www` is canonical; bare apex `308`-redirects to `www`).
2. **`Google-Extended` (`MON-03`):** Allowed in [`src/routes/robots.txt/+server.ts`](../src/routes/robots.txt/+server.ts) when `PUBLIC_ENV === 'production'` (owner decision for Gemini grounding visibility; `google-common-crawlers`, 2026-10-30). Revisit when Google ships the IETF `AIPREF` shared AI-training signal in early 2027.
3. **Search Console Generative-AI Control (`MON-02`):** Remain opted-in to Google Search generative AI features (`control-what-you-share`, 2026-10-21).
4. **Locale Strategy (`I18N`):** Single English (`en-US`) canonical content tree serving US & Canadian traders with dual US/Canada regulatory disclosures; no multi-locale URL prefixing until translated content exists.
5. **Section Launch Gating (`T10`):** `/blog` was un-gated on November 5, 2026 (`0dte-spx-options-strategy-guide` live). `/store/*` remains gated in `src/lib/data/launch-gate.ts` (`noindex, nofollow`, excluded from prod nav/footer/sitemap) until Priority 5 completion.
6. **Blog Archive Pagination & Thin Taxonomies:** Page 1 canonicalizes to `/blog` (or `/blog/{category,tag}/<slug>`); pages `2+` self-canonicalize to `?page=n` with `(Page n)` title suffix; malformed or out-of-bounds `?page=` returns uncached `404`. Category/tag archives with `< 3` published posts emit `noindex, follow` to avoid thin taxonomy indexing.

---

## 10. Production SEO Operations & Launch Un-Gating Runbook

### 10.1 Post-Deploy HTTP & Redirect Verification (`IDX-12`)

Automatic custom-domain assignment on Vercel is disabled (`autoAssignCustomDomains=false`); verify staged Production deployments before `vercel promote` ([`docs/ADMIN_AND_OPS.md`](ADMIN_AND_OPS.md) §3):

```sh
curl -sI http://revolutiontradingpros.com/
curl -sI https://revolutiontradingpros.com/
curl -sI https://www.revolutiontradingpros.com/
```

Confirm single-hop `308` to `https://www.revolutiontradingpros.com/`, `Strict-Transport-Security`, and zero placeholder strings (`grep -rl "555-01" .svelte-kit/output/prerendered` must return empty when real `PUBLIC_CONTACT_*` env vars are set).

### 10.2 Search Console, Bing & CrUX Operations (`MON-01`, `MON-04`, `PERF-01`)

- Verify `revolutiontradingpros.com` Domain property in Google Search Console and submit `https://www.revolutiontradingpros.com/sitemap.xml` (plus Bing Webmaster Tools import). Optional server-side GSC inspection/IndexNow helpers live in `src/lib/server/services/{google-search-console,indexnow}.ts` (`GSC_SERVICE_ACCOUNT_JSON`, `GSC_SITE_URL`, `INDEXNOW_API_KEY` in `src/env.ts`).
- Run URL Inspection Live Test + Rich Results Test (`search.google.com/test/rich-results`) + `validator.schema.org` on representative templates (`/`, `/about`, `/live-trading-rooms`, `/live-trading-rooms/day-trading-room`, `/alert-services/sunday-alpha-protocol`, `/blog`, `/blog/0dte-spx-options-strategy-guide`, `/contact`).
- Monitor 28-day CrUX 75th-percentile field metrics (**LCP ≤ 2.5 s**, **INP ≤ 200 ms**, **CLS ≤ 0.1**) and Search Console Security / Manual Actions reports.

### 10.3 Store Section Un-Gating Checklist (When Lifting `T10`)

1. Graduate remaining `[TODO]` store product routes (`todo.md` §6) and receive legal/pricing/checkout sign-off (`T14`).
2. Remove `'/store'` from `UNLAUNCHED_PREFIXES` in [`src/lib/data/launch-gate.ts`](../src/lib/data/launch-gate.ts).
3. Update `indexable: true` on launched `/store/*` URLs in [`docs/seo/audit/02-inventory.json`](seo/audit/02-inventory.json) and navigation assertions in `homepage.spec.ts` / `page.svelte.e2e.ts`.
4. Run full `pnpm` verification gates (`AGENTS.md` §5), promote verified Production deployment, and re-submit `/sitemap.xml` in Search Console.
