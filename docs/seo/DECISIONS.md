# Technical SEO Owner Decisions (`docs/seo/DECISIONS.md`)

**Recorded:** 2026-10-31
**Authority:** Repository Owner (`Billy Ribeiro`) — Phase 4 of the Evidence-Gated Technical SEO Audit (`docs/seo/audit/04-plan.md`).

---

## 1. Canonical Origin, Host & Locale (`URL-01`, `URL-02`, `I18N-01`..`I18N-04`, `MAP-05`)

- **Canonical Production Origin:** `https://revolutiontradingpros.com` (`SITE_ORIGIN` in [`src/lib/seo/structured-data.ts`](../../src/lib/seo/structured-data.ts) `[CODE src/lib/seo/structured-data.ts:6]`).
- **Preferred Host:** Apex (`revolutiontradingpros.com`), `trailingSlash = 'never'` (`[CODE src/routes/+layout.ts:13]`).
- **Local / Preview Origin:** `http://localhost:5173/` (or `pnpm preview` on port `4173`). Non-production hosts automatically emit `X-Robots-Tag: noindex, nofollow` via [`src/hooks.server.ts`](../../src/hooks.server.ts) `[CODE src/hooks.server.ts:340-343]`.
- **Locale Strategy:** Single-locale English (`<html lang="en">` `[CODE src/app.html:2]`, `og:locale="en_US"` `[CODE src/routes/+layout.ts:43]`). Duplicate `hreflang="en-us"`, `hreflang="en-ca"`, and `hreflang="x-default"` tags pointing to the identical URL are omitted from `<head>` and `sitemap.xml` per Google's localized-versions specification (`[DOC https://developers.google.com/search/docs/specialty/international/localized-versions §guidelines]`).

---

## 2. Generative AI Search & Snippet Controls (`MON-02`, `MON-03`, `META-14`)

- **Search Console Generative-AI Opt-Out (`MON-02`):** **Do not opt out** (`AI_SEARCH_OPT_OUT = no`). All indexable public pages emit `index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1` so pages remain eligible for both classic Google Search rich snippets, Google Discover large image previews, and AI Overviews / AI Mode citations (`[CODE src/routes/+layout.ts:30-37]`, `[CODE src/lib/seo/blog-seo.ts:113-119]`).
- **`Google-Extended` Crawler Control (`MON-03`):** **Allow `Google-Extended`** in [`static/robots.txt`](../../static/robots.txt) (`User-agent: Google-Extended` / `Allow: /` `[CODE static/robots.txt:15-16]`). Per Google's documentation (`[DOC https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers §google-extended]`), `Google-Extended` governs Gemini training/grounding and does not control inclusion in Google Search or AI Overviews.

---

## 3. YMYL Trust Pages & Internal Link Graph (`YMYL-07`, `IDX-04`, `IDX-10`, `IDX-11`)

- **Five Mandatory YMYL Trust Pages Built (`YMYL-07`):**
  1. [`/contact`](../../src/routes/contact/+page.svelte) — Physical mailing address, support email (`support@revolutiontradingpros.com`), phone (`+1-800-555-0199`), operating hours, and interactive inquiry form matching `Organization.contactPoint`.
  2. [`/editorial-policy`](../../src/routes/editorial-policy/+page.svelte) — Primary-source verification, distinction between live and hypothetical/backtested results, human-authored disclosure, and timestamped correction policy (`YMYL-03`, `YMYL-08`, `YMYL-09`).
  3. [`/privacy-policy`](../../src/routes/privacy-policy/+page.svelte) — Data collection, session cookies, analytics, third-party processors, and CCPA/CPRA/PIPEDA privacy rights.
  4. [`/terms-of-service`](../../src/routes/terms-of-service/+page.svelte) — Educational-only non-advisory scope, U.S. (SEC/CFTC/FINRA) and Canadian (OSC/BCSC/ASC) regulatory disclosures, options risk warnings, and IP rules.
  5. [`/refund-policy`](../../src/routes/refund-policy/+page.svelte) — Membership cancellation rules, founding rate locks, digital product refund eligibility, and billing dispute resolution.
- **Prerender Strictness (`IDX-04`):** `PLANNED_ROUTE_PATTERN` has been removed from [`vite.config.ts`](../../vite.config.ts) so any broken internal link or 404 during prerendering fails the build immediately.

---

## 4. Structured Data & Rich-Result Eligibility (`SD-08`, `SD-10`, `SD-15`)

- **Retired & Restricted Schema Types Removed (`SD-10`, `SD-15`):**
  - `FAQPage` JSON-LD removed from all pages (restricted by Google to authoritative government and health sites since August 2023; visible `<details>` FAQ accordions remain in the server-rendered DOM).
  - `Course`, `CourseInstance`, and `SpeakableSpecification` JSON-LD removed from all pages.
- **Visible Price Parity for `Product` + `Offer` (`SD-08`):**
  - `Product` + `Offer` (`AggregateOffer` with `$47`–`$447` USD pricing and `image`) is emitted only on `/watchlist`, where those exact prices are visibly rendered in the DOM (`[CODE src/lib/seo/structured-data.ts:1388-1409]`).
