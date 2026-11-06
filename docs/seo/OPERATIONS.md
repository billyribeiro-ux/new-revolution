# Technical SEO Operations & Verification Runbook (`docs/seo/OPERATIONS.md`)

> **Blog work — November 5, 2026:** Read the [mandatory blog handoff](../BLOG_AGENT_HANDOFF.md) before adding or changing articles, editor workflows, blog SEO or automation. It distinguishes the existing CMS workflow from the proposed intake tooling.

**Updated:** 2026-10-31
**Companion Standard:** [`docs/seo/SEO_STANDARD.md`](SEO_STANDARD.md)
**Recorded Owner Decisions:** [`docs/seo/DECISIONS.md`](DECISIONS.md)

---

## 1. Automated Pre-Commit & CI Gate (`MON-05`, `TOOL-02`..`TOOL-04`)

Every pull request and production release must pass the following verification suite using `pnpm` exclusively:

For Vite+ command semantics and project-specific build steps, see [`docs/VITE_PLUS_WORKFLOW.md`](../VITE_PLUS_WORKFLOW.md).

```bash
# 1. CSS custom-property SSOT check
pnpm check:css

# 2. SvelteKit sync + svelte-check (0 errors, 0 warnings)
pnpm check

# 3. Oxfmt + Oxlint + ESLint for Svelte (0 errors, 0 warnings)
pnpm lint

# 4. Vitest unit & server tests (includes structured-data, blog-seo, and XSS-safe JSON-LD tests)
pnpm test:unit --run

# 5. Production build & prerender verification (strictly fails on any 404 or broken internal link)
pnpm build

# 6. Prerendered HTML + JSON-LD + metadata contract check
pnpm check:pages

# 7. Playwright E2E + SEO Standard regression suite
pnpm test:e2e

# 8. Deterministic HTTP crawler + link-graph + shingle similarity audit
node tests/seo/crawler.ts --output docs/seo/audit/06-final.json

# 9. Headless Chromium CWV lab + axe-core WCAG 2.2 AA + tap-target audit
node tests/seo/lab.ts --outdir docs/seo/audit/06-lab
```

---

## 2. Production Deployment & Post-Deploy Checklist (`IDX-12`, `PERF-01`, `MON-01`, `MON-04`)

Because the site is currently running in pre-production local preview (`http://localhost:5173/` / `pnpm preview`), the following items are gated on production DNS + HTTPS cutover to `https://www.revolutiontradingpros.com`:

### 2.1 HTTPS, HSTS & Single-Hop Host Canonicalization (`IDX-12`)

Once DNS for `revolutiontradingpros.com` and `www.revolutiontradingpros.com` is pointed at the production edge (Vercel):

1. Verify HTTP → HTTPS redirect is a single-hop `301` or `308`:
   ```bash
   curl -sI http://revolutiontradingpros.com/
   ```
2. Verify `revolutiontradingpros.com` → `https://www.revolutiontradingpros.com` is a single-hop `308` redirect:
   ```bash
   curl -sI https://www.revolutiontradingpros.com/
   ```
3. Verify `Strict-Transport-Security` header is present on `https://www.revolutiontradingpros.com/` (also set in `src/hooks.server.ts` when `event.url.protocol === 'https:'` or `x-forwarded-proto === 'https'`).

### 2.1a Pre-launch data and decisions (re-checked 2026-11-01)

1. Set real `PUBLIC_CONTACT_PHONE`, `PUBLIC_CONTACT_EMAIL`, `PUBLIC_CALENDLY_URL` and `PUBLIC_APP_URL` in Vercel for Production **and** Preview. `src/lib/config/site.ts` falls back to placeholders (including the fictional `(800) 555-0199`) only in dev and during `building`; a missing value must never be allowed to bake a placeholder into prerendered HTML. After the first production build, run `grep -rl "555-01" .svelte-kit/output/prerendered` and expect no output.
2. Prerendered pages are static files on Vercel, so `handle` in `src/hooks.server.ts` cannot add `X-Robots-Tag` to them on preview deployments. Protect previews with Vercel Deployment Protection, or add `headers` in `vercel.json`, and verify with `curl -I` on a preview URL (`IDX-09`).
3. Re-read the `Google-Extended` decision (`DECISIONS.md` §2) when Google ships the shared AI training signal (announced for early 2027).

### 2.2 Google Search Console & Rich Results Verification (`MON-01`, `MAP-06`, `SD-12`)

1. Verify the `revolutiontradingpros.com` Domain property in [Google Search Console](https://search.google.com/search-console).
2. Submit `https://www.revolutiontradingpros.com/sitemap.xml` under **Indexing → Sitemaps** (do not use deprecated sitemap ping URLs).
3. Run the **URL Inspection Live Test** and [Google Rich Results Test](https://search.google.com/test/rich-results) on one representative URL per template:
   - Homepage: `https://www.revolutiontradingpros.com/`
   - ProfilePage: `https://www.revolutiontradingpros.com/about`
   - Service / Room: `https://www.revolutiontradingpros.com/live-trading-rooms/day-trading-room`
   - Product / Watchlist: `https://www.revolutiontradingpros.com/watchlist`
   - Blog Index: `https://www.revolutiontradingpros.com/blog`
   - Blog Post (`BlogPosting`): `https://www.revolutiontradingpros.com/blog/0dte-spx-options-strategy-guide`
   - Trust Page: `https://www.revolutiontradingpros.com/contact`
4. Review **Security & Manual Actions** reports in Search Console to confirm zero issues (`SPAM-10`).

### 2.3 Bing Webmaster Tools (`MON-04`)

1. Verify `https://www.revolutiontradingpros.com` in [Bing Webmaster Tools](https://www.bing.com/webmasters) (can import directly from Google Search Console).
2. Submit `https://www.revolutiontradingpros.com/sitemap.xml`.

### 2.4 Field Core Web Vitals Monitoring (`PERF-01`)

After 28 days of production traffic accumulation in the Chrome User Experience Report (CrUX):

1. Query the PageSpeed Insights / CrUX API for mobile and desktop 75th-percentile field metrics:
   - **LCP** ≤ 2.5 s
   - **INP** ≤ 200 ms
   - **CLS** ≤ 0.1
2. Review the **Core Web Vitals** report in Google Search Console weekly.
