# Technical SEO Owner Decisions (`docs/seo/DECISIONS.md`)

> **Blog work — November 5, 2026:** Read the [mandatory blog handoff](../BLOG_AGENT_HANDOFF.md) before adding or changing articles, editor workflows, blog SEO or automation. It distinguishes the existing CMS workflow from the proposed intake tooling.

**Recorded:** 2026-10-31
**Authority:** Repository Owner (`Billy Ribeiro`) — Phase 4 of the Evidence-Gated Technical SEO Audit (`docs/seo/audit/04-plan.md`).

---

## 1. Canonical Origin, Host & Locale (`URL-01`, `URL-02`, `I18N-01`..`I18N-04`, `MAP-05`)

- **Canonical Production Origin:** `https://www.revolutiontradingpros.com` (`SITE_ORIGIN` in [`src/lib/seo/structured-data.ts`](../../src/lib/seo/structured-data.ts) `[CODE src/lib/seo/structured-data.ts:6]`).
- **Preferred Host:** www (`www.revolutiontradingpros.com`), `trailingSlash = 'never'` (`[CODE src/routes/+layout.ts:13]`).
- **Local / Preview Origin:** `http://localhost:5173/` (or `pnpm preview` on port `4173`). Non-production hosts automatically emit `X-Robots-Tag: noindex, nofollow` via [`src/hooks.server.ts`](../../src/hooks.server.ts) `[CODE src/hooks.server.ts:340-343]`.
- **Locale Strategy:** Single-locale English (`<html lang="en">` `[CODE src/app.html:2]`, `og:locale="en_US"` `[CODE src/routes/+layout.ts:43]`). Duplicate `hreflang="en-us"`, `hreflang="en-ca"`, and `hreflang="x-default"` tags pointing to the identical URL are omitted from `<head>` and `sitemap.xml` per Google's localized-versions specification (`[DOC https://developers.google.com/search/docs/specialty/international/localized-versions §guidelines]`).

---

## 2. Generative AI Search & Snippet Controls (`MON-02`, `MON-03`, `META-14`)

- **Search Console Generative-AI Opt-Out (`MON-02`):** **Do not opt out** (`AI_SEARCH_OPT_OUT = no`). All indexable public pages emit `index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1` so pages remain eligible for classic Google Search snippets, Discover large image previews (`max-image-preview:large`), and generative AI features. Google says generative AI features need no extra requirements beyond being indexed and snippet-eligible (`[DOC ai-features, 2025-12-10]`); the Search Console generative AI control is documented at `[DOC control-what-you-share, 2026-10-21]` (`[CODE src/routes/+layout.ts:30-37]`, `[CODE src/lib/seo/blog-seo.ts:113-119]`).
- **`Google-Extended` Crawler Control (`MON-03`):** **Allow `Google-Extended`** in [`static/robots.txt`](../../static/robots.txt) (`User-agent: Google-Extended` / `Allow: /` `[CODE static/robots.txt:15-16]`). Per Google (`[DOC https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers, updated 2026-10-30]`), `Google-Extended` is a standalone token for Gemini training and grounding and "does not impact a site's inclusion in Google Search nor is it used as a ranking signal". Google plans to support a shared AI training signal in early 2027 (`[DOC https://developers.google.com/search/blog/2026/10/ai-training-control]`); revisit this decision then. The earlier citation (`overview-google-crawlers`) does not contain a Google-Extended entry.

---

## 3. YMYL Trust Pages & Internal Link Graph (`YMYL-07`, `IDX-04`, `IDX-10`, `IDX-11`)

- **Five Mandatory YMYL Trust Pages Built (`YMYL-07`):**
  1. [`/contact`](../../src/routes/contact/+page.svelte) — Support email (`support@revolutiontradingpros.com`), market-hours availability, and an inquiry form. **No phone number and no mailing address are published**: `SUPPORT_CONTACT` in `src/lib/data/site.ts` is intentionally empty until real values exist (checked in the built `contact.html` on 2026-11-01). An earlier version of this line listed a `555-0199` phone and a mailing address that the page never rendered.
  2. [`/editorial-policy`](../../src/routes/editorial-policy/+page.svelte) — Primary-source verification, distinction between live and hypothetical/backtested results, human-authored disclosure, and timestamped correction policy (`YMYL-03`, `YMYL-08`, `YMYL-09`).
  3. [`/privacy-policy`](../../src/routes/privacy-policy/+page.svelte) — Data collection, session cookies, analytics, third-party processors, and CCPA/CPRA/PIPEDA privacy rights.
  4. [`/terms-of-service`](../../src/routes/terms-of-service/+page.svelte) — Educational-only non-advisory scope, U.S. (SEC/CFTC/FINRA) and Canadian (OSC/BCSC/ASC) regulatory disclosures, options risk warnings, and IP rules.
  5. [`/refund-policy`](../../src/routes/refund-policy/+page.svelte) — Membership cancellation rules, founding rate locks, digital product refund eligibility, and billing dispute resolution.
- **Prerender Strictness (`IDX-04`):** `PLANNED_ROUTE_PATTERN` has been removed from [`vite.config.ts`](../../vite.config.ts) so any broken internal link or 404 during prerendering fails the build immediately.

---

## 4. Structured Data & Rich-Result Eligibility (`SD-08`, `SD-10`, `SD-15`)

- **Retired & Restricted Schema Types Removed (`SD-10`, `SD-15`):**
  - `FAQPage` JSON-LD removed from all pages (restricted to government/health sites on 2023-09-14, no longer shown since 2026-05-07, docs removed 2026-06-15; visible `<details>` FAQ accordions remain in the server-rendered DOM).
  - `Course`, `CourseInstance`, and `SpeakableSpecification` JSON-LD removed from all pages (project policy: the Course list carousel and Speakable beta are still in Google's 2026-10-16 gallery but do not fit this site).
- **Visible Price Parity for `Product` + `Offer` (`SD-08`):**
  - `Product` + `Offer` (`AggregateOffer` with `$47`–`$447` USD pricing and `image`) is emitted only on `/watchlist`, where those exact prices are visibly rendered in the DOM (`[CODE src/lib/seo/structured-data.ts:1388-1409]`).

---

## 5. Launch Gate, Temporary-Host Protection & Unevidenced Claims (`IDX-08`, `YMYL-03`, `YMYL-06`)

**Recorded:** 2026-11-02 · **Authority:** Repository Owner (`Billy Ribeiro`), launch-readiness audit. Evidence for every line is in [`LAUNCH_TRACKER.md`](LAUNCH_TRACKER.md) and `docs/SEO_EVIDENCE.md` rows 34-39.

- **Unlaunched sections are kept out with `noindex`, not robots.txt.** Only `/store` remains in `UNLAUNCHED_ROUTE_PREFIXES` after the owner-authorized, publicly verified November 5 blog indexing launch. Eligible blog posts and archives now participate in the generated sitemap and homepage article ItemList; protected, excluded and thin archive content retains its own restrictions. Store promotion remains hidden. Googlebot can crawl blog pages under the existing `Allow: /`; individual page URLs do not belong in robots.txt. See [release evidence](../reviews/blog-indexing-release-2026-11-05/VERIFICATION.md).
- **The temporary `*.vercel.app` host is `noindex` at the platform layer.** `vercel.json` sets `X-Robots-Tag: noindex, nofollow, noarchive` for hosts ending `.vercel.app`. The hook in `src/hooks.server.ts` cannot do this alone because prerendered pages are served as static files and never reach `handle` (`SEO_EVIDENCE.md` row 38). The production domain is unaffected. HSTS is left to Vercel, which already sends the header.
- **No phone number or postal address is published until the owner supplies verified values.** `SUPPORT_CONTACT` stays the single input; the Organization `contactPoint` adds `telephone`/`email` only when they are non-empty. `src/lib/config/site.ts` holds a fabricated address and phone and must not be used for display or schema.
- **The homepage makes no performance or endorsement claim it cannot evidence.** The founder's mentorship is worded as the founder's own account and links to `/about#institutional-mentorship`. The 2020, 2022 and OXY results appear on the homepage only as a `VerifiedCaseStudy` record (contract symbol, strike, expiration, entry and exit timestamps, size, maximum risk, result, chart with alt text); an incomplete record never renders, and there are no records yet. The schema `Person` (`#founder`) carries no such claims. Other pages still carry them; see `LAUNCH_TRACKER.md` §A and §F.
- **One founder title.** `FOUNDER.jobTitle` ("Founder & Head Trader", from the owner's brief) feeds the byline on `/about` and the schema `Person`.
- **Free eBook hidden.** `FREE_EBOOK_AVAILABLE = false` hides the homepage form (it only validated and sent nothing), the announcement-bar link and the footer link.
- **Fonts:** only the upright Latin faces of Montserrat and Sofia Sans are preloaded; other subsets and italics load on demand through `unicode-range`.
- **robots.txt does not disallow `/admin`, `/login` or `/checkout`** (2026-11-02). Commit `2eaf6a5` added those lines; they were removed again because Google cannot read a `noindex` on a URL it may not fetch and can still list the bare URL, and `/admin/login` is linked from every header. These routes are kept out of search by `X-Robots-Tag`/meta `noindex`. `tests/seo/seo-standard.spec.ts` enforces this. `/api/`, the token/session query parameters and the non-existent `/member-login` and `/account` paths remain disallowed.

---

## 6. Blog Engine Decisions (`IDX-08`, `MAP-01`, `FEED-01`)

**Recorded:** 2026-11-02 · **Authority:** Repository Owner (approved the evidence-based recommendations). Evidence: `blog-editor-report.md` Part B, `docs/blog/COVERAGE_MATRIX.md`; sources are Google's HTTP-status, pagination and Article documents and Vercel's CDN-cache and purge documents.

1. **Deleted posts return 404, not 410.** Google treats all 4xx except 429 the same and removes the URL from the index for both; 410 adds a tombstone for no Google benefit. A soft 404 (200 with an error-like page) is the thing to prevent.
2. **No author archives for now.** Article authorship points at the existing founder `Person` (`#founder`, `/about`). Build `/blog/author/[slug]` when a second real author exists. Google requires no author page; `author.url` need only identify the author, with `sameAs` as the alternative.
3. **Pagination:** pages 2+ are indexable with their own self-canonical; out-of-range pages return 404; search and filter results stay `noindex`; tracking parameters are stripped from canonicals. Policy choice: Google documents "give each page its own canonical" but offers no ranking evidence either way.
4. **Cache freshness:** purge by cache tag on every lifecycle event, using delete for unpublish and delete. The numeric target is set only after measuring on a preview deployment (`docs/blog/FRESHNESS.md`). Needs the owner's authorization for either the `@vercel/functions` dependency or a Vercel API token.
5. **Scheduling:** stored as a UTC instant (`timestamptz`, already true); the editor shows its time zone explicitly (default `America/New_York`); inputs without an offset are rejected.

## 7. Automatic CMS discovery and featured placement (2026-11-05)

**Authority:** owner instruction: every blog belongs on the blog page and homepage blog section, featured on top and the others below, for every new post.

- One shared server service, `src/lib/server/services/blog-discovery.ts`, supplies both surfaces from the existing eligible-public-post predicate. No manual article/title arrays are maintained.
- The marked featured publication leads; when none is marked, the newest eligible publication leads automatically. The lead appears only on the first unfiltered page and is excluded before regular-post pagination. Search includes matching featured posts as ordinary results.
- `/blog` has 12 regular posts per page; the homepage section has 6. Both retain pagination so older eligible posts remain reachable. Drafts, protected/member-only, fixture, noindex, trashed, expired and future-scheduled posts stay excluded.
- The homepage is an explicit exception to the generic SSG rule: request-time SSR loads current CMS cards into initial HTML. Homepage and blog-index responses use no-store rather than pretending the unconnected CDN purger provides immediate freshness. Other marketing routes retain SSG.
- Homepage CMS cards are an explicit exception to hiding the blog section while launch-gated. The owner also requested a visible Blog menu. `isNavigationHrefVisible()` now includes Blog in desktop/mobile navigation and footer independently of `isLaunchedHref()`. Navigation JSON-LD derives from that same `MAIN_NAVIGATION` data. Blog noindex/canonical suppression, sitemap exclusion and homepage article-ItemList exclusion remain in place. Public maintenance mode remains a separate deployment setting.
- Homepage JSON-LD accepts the exact visible card data, rather than a hardcoded title list. It omits the article ItemList while the blog remains launch-gated; after launch it derives names and URLs from the saved cards.
- This implements discovery, not article intake: creating repository Markdown does not save or publish CMS content. The separate intake automation plan remains proposed.
