# Phase 6 — Baseline vs. Final Diff (`06-diff.md`)

**Date:** 2026-10-31  
**Branch:** `seo/audit-2026-10-31`  
**Inputs:** [`docs/seo/audit/03-baseline.json`](03-baseline.json), [`docs/seo/audit/06-final.json`](06-final.json), [`docs/seo/audit/03-lab/lab-summary.json`](03-lab/lab-summary.json), [`docs/seo/audit/06-lab/lab-summary.json`](06-lab/lab-summary.json), [`docs/seo/audit/03-matrix-baseline.md`](03-matrix-baseline.md), [`docs/seo/audit/06-matrix-final.md`](06-matrix-final.md)

---

## 1. Compliance Matrix Scoreboard (`03-matrix-baseline.md` → `06-matrix-final.md`)

| Metric                     | Baseline (`03-matrix-baseline.md`) | Final (`06-matrix-final.md`) | Delta | Evidence                                         |
| -------------------------- | ---------------------------------- | ---------------------------- | ----- | ------------------------------------------------ |
| `PASS` rows                | 53                                 | **84**                       | +31   | `[CODE docs/seo/audit/06-matrix-final.md:11-18]` |
| `FAIL` rows                | 29                                 | **0**                        | -29   | `[CODE docs/seo/audit/06-matrix-final.md:11-18]` |
| `N-A` rows                 | 9                                  | **9**                        | 0     | `[CODE docs/seo/audit/06-matrix-final.md:11-18]` |
| `BLOCKED` rows             | 2                                  | **0**                        | -2    | `[CODE docs/seo/DECISIONS.md:1-42]`              |
| **Total Requirement Rows** | **93**                             | **93**                       | **0** | `[CODE docs/seo/SEO_STANDARD.md:1-380]`          |

---

## 2. Crawler Telemetry Diff (`03-baseline.json` → `06-final.json`)

| Metric                                                | Baseline (`03-baseline.json`) | Final (`06-final.json`) | Delta | Evidence (`[HTTP]` / `[CODE]`)                                                                                                            |
| ----------------------------------------------------- | ----------------------------- | ----------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Total Concrete URLs Audited (`02-inventory.json`)     | 74                            | **79**                  | +5    | Added 5 prerendered trust pages (`/contact`, `/editorial-policy`, `/privacy-policy`, `/terms-of-service`, `/refund-policy`) (`YMYL-07`)   |
| Indexable URLs Returning HTTP `200`                   | 19 / 22                       | **27 / 27**             | +8    | Fixed PGlite published post seeding (`[CODE src/lib/server/db/index.ts:95-105]`) + added 5 trust pages (`[HTTP]` `06-final.json`)         |
| `/sitemap.xml` Canonical URL Count                    | 19                            | **27**                  | +8    | `[HTTP]` `06-final.json` (`sitemapXml.urlCount: 27`, `non200Locs: []`, `nonCanonicalLocs: []`, `noindexLocs: []`)                         |
| `robots.txt` Disallowing `noindex` Routes (`IDX-07`)  | 5 (`/login`, `/admin`, etc.)  | **0**                   | -5    | `[CODE static/robots.txt:1-18]`, `[HTTP]` `06-final.json` (`robotsDisallowsNoindexRoutes: []`)                                            |
| Soft-404 / Error Page Violations (`IDX-06`)           | 7 / 7                         | **0 / 7**               | -7    | `[CODE src/routes/+error.svelte:1-145]`, `[CODE src/routes/+layout.svelte:20-26]`, `[HTTP]` `06-final.json` (`soft404Failures: 0`)        |
| Orphan Indexable URLs (`HTML-04`)                     | 6                             | **0**                   | -6    | `[HTTP]` `06-final.json` (`orphanUrls: []`, `clickDepthFromHome <= 2` on all 27 indexable URLs)                                           |
| Non-Indexable URLs Emitting `<link rel="canonical">`  | 52                            | **0**                   | -52   | `[CODE src/routes/+layout.ts:20-35]`, `[CODE src/routes/store/courses/[slug]/+page.ts:30-45]`, `[HTTP]` `06-final.json`                   |
| Duplicate `<meta name="robots">` Tags (`META-05`)     | 9 routes + `/blog/*` 404s     | **0**                   | -10   | `[CODE src/lib/components/SEO.svelte:1-25]`, `[CODE src/routes/admin/media/+page.svelte:1-25]`, `[HTTP]` `06-final.json`                  |
| Out-of-Range `<title>` Lengths (`<30` or `>60` chars) | 1 (`/` at 91 chars)           | **0** (`44–60` chars)   | -1    | `[CODE src/routes/+page.ts:9]`, `[HTTP]` `06-final.json`                                                                                  |
| Out-of-Range `<meta name="description">` Lengths      | 2 (`/` at 207, course at 163) | **0** (`135–158` chars) | -2    | `[CODE src/routes/+page.ts:10-11]`, `[CODE src/routes/store/courses/[slug]/+page.ts:24-26]`, `[HTTP]` `06-final.json`                     |
| Restricted/Retired JSON-LD Types (`FAQPage`/`Course`) | 18 routes                     | **0 routes**            | -18   | `[CODE src/lib/seo/structured-data.ts:1-2111]`, `[CODE src/lib/seo/blog-seo.ts:286-458]`, `[HTTP]` `06-final.json`                        |
| Breadcrumb DOM ↔ JSON-LD Mismatches (`SD-05`)         | 11 / 18 inner routes          | **0 / 26 inner routes** | -11   | `[HTTP]` `06-final.json` (`breadcrumbParity: true` across all 26 non-home indexable routes)                                               |
| Redundant Single-Locale `hreflang` Tags (`I18N-03`)   | 19 routes + `/sitemap.xml`    | **0**                   | -20   | `[CODE src/routes/+layout.ts:1-40]`, `[CODE src/routes/sitemap.xml/+server.ts:1-160]`, `[HTTP]` `06-final.json` (`head.hreflangs: []`)    |
| Missing YMYL Author / Date Attribution (`YMYL-01/02`) | 3 routes                      | **0 routes**            | -3    | `[HTTP]` `06-final.json` (`trustSignals.hasByline: true`, `hasAuthorLink: true`, `hasVisibleDate: true`, `hasDisclosure: true` on all 27) |

---

## 3. Lab CWV, Mobile Usability & Accessibility Diff (`03-lab` → `06-lab`)

| Template             | URL                                                      | Baseline LCP (`03-lab`) | Final LCP (`06-lab`) | Baseline CLS / Final CLS | Baseline TBT / Final TBT | Baseline Undersized Tap Targets (`<24x24px`) | Final Undersized Tap Targets (`<24x24px`) | Baseline / Final A11y Score |
| -------------------- | -------------------------------------------------------- | ----------------------- | -------------------- | ------------------------ | ------------------------ | -------------------------------------------- | ----------------------------------------- | --------------------------- |
| `home`               | `/`                                                      | 56 ms                   | **60 ms**            | `0` / **`0`**            | `0 ms` / **`0 ms`**      | 25                                           | **0**                                     | 100 / **100**               |
| `profile`            | `/about`                                                 | 52 ms                   | **52 ms**            | `0` / **`0`**            | `0 ms` / **`0 ms`**      | 35                                           | **0**                                     | 100 / **100**               |
| `static`             | `/our-mission`                                           | 44 ms                   | **56 ms**            | `0` / **`0`**            | `0 ms` / **`0 ms`**      | 30                                           | **0**                                     | 100 / **100**               |
| `static-resource`    | `/resources/stock-indexes-list`                          | 56 ms                   | **52 ms**            | `0` / **`0`**            | `0 ms` / **`0 ms`**      | 24                                           | **0**                                     | 100 / **100**               |
| `membership-product` | `/live-trading-rooms/day-trading-room`                   | 68 ms                   | **68 ms**            | `0` / **`0`**            | `0 ms` / **`0 ms`**      | 34                                           | **0**                                     | 100 / **100**               |
| `listing`            | `/store/courses`                                         | 68 ms                   | **76 ms**            | `0` / **`0`**            | `0 ms` / **`0 ms`**      | 29                                           | **0**                                     | 100 / **100**               |
| `product`            | `/store/courses/move-prior-to-the-move-ultra`            | 76 ms                   | **64 ms**            | `0` / **`0`**            | `0 ms` / **`0 ms`**      | 29                                           | **0**                                     | 100 / **100**               |
| `blog-listing`       | `/blog`                                                  | 128 ms                  | **136 ms**           | `0` / **`0`**            | `0 ms` / **`0 ms`**      | 20                                           | **0**                                     | 100 / **100**               |
| `article`            | `/blog/institutional-order-flow-and-gamma-flip-playbook` | `404` (in baseline)     | **92 ms**            | N/A / **`0`**            | N/A / **`0 ms`**         | N/A (`404` in baseline)                      | **0**                                     | N/A / **100**               |
