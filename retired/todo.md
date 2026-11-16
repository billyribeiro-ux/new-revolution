# Master Engineering, Content & Launch Roadmap (`todo.md`)

**Last Updated:** November 15, 2026 · **Baseline Commit on `main`:** `f374a8f`
**Verification Rules:** Check a box (`[x]`) **only** when backed by reproducible code, passing `pnpm` verification gates (`docs/VITE_PLUS_WORKFLOW.md`), and (for production/Search Console items) live HTTP/console proof. Temporary placeholders and gates are tracked in [`docs/TEMPORARY.md`](docs/TEMPORARY.md).

---

## 1. Where We Stand Right Now (94 Prerendered Pages + SSR Surfaces)

| Surface / Category                         | Count | Current Status         | Notes & Gate                                                                                                                                                                                                                                                                                                                                                |
| :----------------------------------------- | :---: | :--------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Live Indexable Public Pages**            | `20`  | ✅ Live (`200`)        | `/` (SSR), `/about`, `/our-mission`, `/contact`, `/editorial-policy`, `/privacy-policy`, `/terms-of-service`, `/refund-policy`, `/mentorship`, `/live-trading-rooms`, 3 child rooms, 2 child alert services, `/resources`, `/resources/etf-stocks-list`, `/resources/stock-indexes-list`, `/blog` (SSR), `/blog/0dte-spx-options-strategy-guide` (SSR CMS). |
| **Built Store Pages (Launch-Gated)**       |  `6`  | 🟡 Built (`noindex`)   | `/store/courses`, `/store/indicators`, `/store/scanners`, plus the 3 flagship detail pages (`move-prior-to-the-move-ultra`, `move-prior-to-the-move-system`, `high-octane-scanner`). Gated by `T10` (`src/lib/data/launch-gate.ts`).                                                                                                                        |
| **Admin & Staff CMS**                      | `17`  | ✅ Built (`noindex`)   | `/admin/login` + 16 authenticated `/admin/**` SSR routes (Posts, TipTap Editor, Media, Leads, Subscribers, Sequences, Campaigns, Analytics, Inbox, Calls, Consent, Integrations, Notifications).                                                                                                                                                            |
| **Core, Resource & Enroll `[TODO]` Pages** | `39`  | 🚧 Placeholder (`T16`) | `8` static hubs/portals/disclosures + `23` `/resources/[slug]` tools/guides + `8` `/enroll/[slug]` flows. All render `<TodoPageShell />` with `noindex, nofollow` and zero broken/misleading links.                                                                                                                                                         |
| **Store `[slug]` `[TODO]` Pages**          | `32`  | 🚧 Placeholder (`T16`) | `21` non-flagship catalog products (`7` courses, `7` indicators, `7` scanners) + `1` `move-prior-to-the-move-radar` scanner slug + `10` legacy alias slugs (`1` course, `9` indicators) rendering `<TodoPageShell />` (`noindex, nofollow`).                                                                                                                |
| **Concept Banners vs. Commerce Guard**     |   —   | 🟡 Active (`T14`)      | `CONCEPT_PREVIEW = false` (public concept banners/dialogs hidden cleanly); `COMMERCE_ENABLED = false` (`src/lib/server/commerce-guard.ts` still blocks `/checkout` & payment endpoints with `403`).                                                                                                                                                         |

> **Exact Prerender Math (`pnpm check:pages`):** `17` static indexable SSG pages (`/` and `/blog/**` are SSR) + `6` built Store SSG pages + `39` core/resource/enroll `[TODO]` SSG pages + `32` Store `[slug]` `[TODO]` SSG pages = **`94` verified prerendered HTML contracts**.

---

## 2. Priority 1 — Core Parent Hubs, Legal & Verification Pages

Build these first so top-level navbar buttons, homepage primary CTAs, and footer trust links graduate from `[TODO]` placeholders into flagship public pages:

- [ ] **`/memberships` — All Memberships Overview & Comparison Hub**
  - Connected from: Navbar primary CTA (`"Explore Memberships"`), Homepage Hero (`"Explore Our Memberships"`), Homepage Closing CTA, Stock Indexes CTA, and Footer (`"All Memberships"`).
  - Scope: Side-by-side decision matrix uniting Live Trading Rooms, Alert Services (`SPX Profit Pulse` & `Sunday Alpha Protocol`), and 1-on-1 Mentorship; account-size (`$500+` T+1 cash / FINRA Rule 4210 `$2,000` margin baseline to `$25k+`) and daily-schedule fit selector; `CollectionPage` + `ItemList` JSON-LD; remove from `todo-pages.ts` and flip `indexable: true` in `02-inventory.json`.
- [ ] **`/alert-services` — Alert Services & Video Watchlists Hub**
  - Connected from: Navbar `Alert Services` menu, Homepage Tier 04 CTA, child alert 3-level breadcrumbs, `/about`, `/our-mission`, and Footer.
  - Scope: Head-to-head comparison of `SPX Profit Pulse` (intraday 0DTE/SPX options) vs. `Sunday Alpha Protocol` (Sunday 5:00 PM ET multi-day swing blueprints); alert anatomy (entry trigger, tiered targets, hard invalidation stop); when to pick standalone alerts vs. a Live Trading Room; `CollectionPage` + `ItemList` JSON-LD; flip `indexable: true`.
- [ ] **`/risk-disclosure` — Standalone US & Canada Risk Disclosure Statement**
  - Connected from: Footer Legal column (`"Risk Disclosure"`).
  - Scope: Full standalone financial & regulatory disclosure covering equities, options, 0DTE index options, IRC Section 1256 (US taxpayers only, non-tax-advice), OCC _Characteristics and Risks of Standardized Options_, FINRA Rule 4210 intraday margin, T+1 settlement, CFTC Rule 4.41 hypothetical/historical performance rules, and SEC / FINRA / CFTC / Canadian CSA & CIRO non-registered publisher status; `WebPage` JSON-LD; flip `indexable: true` (subject to legal counsel review).
- [ ] **`/track-record` — Verified Track Record & Trade Case Studies Ledger**
  - Connected from: Footer (`"Track Record & Case Studies"`).
  - Scope: Public verification archive displaying primary execution evidence (contract symbols, strikes, expirations, entry/exit timestamps, position sizing, max risk, chart captures, and losing/scratched trades alongside winners) paired with `VERIFIED_CASE_STUDIES` (`T11` in `src/lib/data/homepage.ts`). Do not publish invented figures.

---

## 3. Priority 2 — Interactive Free Public Calculators (`/resources/[slug]`)

High-utility lead magnets and educational tools linked across rooms, store pages, and directories:

- [ ] **`/resources/options-calculator` — Options Profit, Risk & Greeks Calculator**
  - Connected from: Navbar `Resources` menu, Footer, `/resources` Flagship Utility 01, `/live-trading-rooms`, `day-trading-room`, `small-accounts-room`, `etf-stocks-list`, `store/scanners`, `/about`, and `/our-mission`.
  - Scope: Pure deterministic Black-Scholes / binomial pricing & payoff engine (`src/lib/utils/options-math.ts` + 100% unit test coverage) for long calls/puts and vertical debit/credit spreads; live IV (Vega) & DTE (Theta) sliders; `$500+` small-account contract cost ceiling & `1%–2%` risk-budget validator; SSR zero-CLS SVG payoff chart using `var(--font-mono)` / `var(--font-sans)`; flip `indexable: true`.
- [ ] **`/resources/position-size-calculator` — Position Size & Risk-Budget Calculator**
  - Connected from: `/resources` (`Free Tools`) and `/live-trading-rooms`.
  - Scope: Exact share & option-contract sizing from account equity, risk `%` (`0.5%–2%`), entry, and invalidation stop; T+1 settled-cash daily bucket calculator + FINRA Rule 4210 `$2,000` margin baseline check; drawdown recovery math table; flip `indexable: true`.
- [ ] **`/resources/risk-reward-calculator` — Risk/Reward, R-Multiple & Expectancy Calculator**
  - Connected from: `/resources` (`Free Tools`).
  - Scope: Multi-target (`T1`/`T2`/runner) R-multiple payoff modeler, minimum breakeven win-rate curve, and 20-trade expectancy simulator; flip `indexable: true`.
- [ ] **`/resources/trading-journal-template` — Institutional Trading Journal & Audit Template**
  - Connected from: `/resources` (`Free Tools`).
  - Scope: Structured pre-trade checklist, execution tagging taxonomy, weekly R-distribution review framework, and downloadable CSV/spreadsheet template; flip `indexable: true`.

---

## 4. Priority 3 — Member Portal, Onboarding, Admissions & Enrollment Flows

Separate member authentication from staff `/admin`, wire real admissions/waitlist/enrollment flows, and clear `T14` prerequisites before enabling live billing:

- [ ] **`/login` — Member Login Portal** (distinct from internal staff `/admin/login`; session routing to subscribed rooms, watchlists, courses, indicators, and scanners; stays `noindex, nofollow`).
- [ ] **`/register` — Free Member Account Registration** (email verification, risk-disclosure acknowledgment, experience-track onboarding; stays `noindex, nofollow`).
- [ ] **`/mentorship/apply` — 1-on-1 Private Mentorship Application Flow** (structured suitability & bottleneck intake form, server validation, admin leads queue notification; stays `noindex, nofollow`).
- [ ] **`/enroll/[slug]` — Dedicated Membership & Store Enrollment Flows (`8` routes, `noindex, nofollow`):**
  - [ ] `/enroll/day-trading-room`
  - [ ] `/enroll/swing-trading-room`
  - [ ] `/enroll/small-accounts-room`
  - [ ] `/enroll/spx-profit-pulse`
  - [ ] `/enroll/sunday-alpha-protocol` (includes dedicated Sunday Alpha Protocol purpose, consent, and weekly delivery setup — replacing the historical "Sunday Recon" checklist note)
  - [ ] `/enroll/move-prior-to-the-move-ultra`
  - [ ] `/enroll/move-prior-to-the-move-system`
  - [ ] `/enroll/high-octane-scanner`
- [ ] **Commerce Activation Gate (`T14` in `docs/TEMPORARY.md`):** Keep `COMMERCE_ENABLED = false` in `src/lib/shared/development-status.ts` and `src/lib/server/commerce-guard.ts` active until payment processor integration, billing/cancellation/refund disclosures, webhook entitlement provisioning, and end-to-end checkout tests are complete and owner-approved.

---

## 5. Priority 4 — Free Resource Vault Guides, Tutorials & Playbooks (`19` Routes)

Graduate the remaining `/resources/[slug]` `[TODO]` pages into comprehensive, indexable educational guides:

### Beginner Guides (`4`)

- [ ] `/resources/beginners-guide-to-trading` — Beginner's Guide to Institutional Trading
- [ ] `/resources/trading-account-setup-guide` — Cash vs. Margin Account Setup Guide (T+1 & FINRA Rule 4210)
- [ ] `/resources/options-basics-guide` — Options Trading Basics: Calls, Puts, Strikes & Greeks
- [ ] `/resources/risk-management-for-new-traders` — Risk Management Rules for New Traders

### Video Tutorials (`4`)

- [ ] `/resources/platform-setup-walkthrough` — ThinkorSwim & TradingView Workspace Setup Walkthrough
- [ ] `/resources/reading-charts-for-beginners` — Reading Price Action, Volume & Key Levels
- [ ] `/resources/your-first-option-trade` — Executing Your First Defined-Risk Option Trade
- [ ] `/resources/live-trade-walkthrough` — Pre-Market Plan to Exit: Full Trade Breakdown

### Market Analysis (`4`)

- [ ] `/resources/weekly-market-recap` — Weekly S&P 500, Nasdaq & Macro Structure Recap
- [ ] `/resources/economic-calendar-explained` — Trading Around CPI, FOMC, NFP & Macro Catalysts
- [ ] `/resources/key-levels-to-watch` — Institutional Gamma Walls, Prior Highs/Lows & VWAP Levels
- [ ] `/resources/sector-rotation-analysis` — Tracking Institutional Flows Across the 11 S&P 500 Sectors

### Trading Psychology (`4`)

- [ ] `/resources/managing-trading-emotions` — Managing FOMO, Hesitation & Revenge Trading
- [ ] `/resources/developing-trading-discipline` — Daily Pre-Market & Post-Close Execution Routines
- [ ] `/resources/dealing-with-losing-streaks` — Drawdown Protocols & Step-Down Sizing Math
- [ ] `/resources/building-trading-confidence` — Evidence-Based Confidence Through 30-Trade Sample Audits

### Reference & Community (`3`)

- [ ] `/resources/frequently-asked-questions` — Master Platform, Room, Alert & Account FAQ
- [ ] `/resources/trading-glossary` — A–Z Options, Order-Flow, Gamma & Market-Structure Glossary
- [ ] `/resources/community-guidelines` — Trading Floor Etiquette, Risk Culture & Moderation Rules

---

## 6. Priority 5 — Store Hub, Non-Flagship Product Pages & Store Launch Gate (`T10`)

- [ ] **`/store` — Store Overview Hub** (uniting Courses, Non-Repainting Indicators, and Institutional Scanners + ThinkorSwim / TradingView compatibility matrix).
- [ ] **Non-Flagship Course Pages (`7` catalog slugs in `src/lib/data/courses.ts`):**
  - [ ] `/store/courses/small-account-compounding-blueprint`
  - [ ] `/store/courses/options-greeks-and-volatility-mastery`
  - [ ] `/store/courses/working-pro-swing-trading-system`
  - [ ] `/store/courses/spx-0dte-and-index-gamma-execution`
  - [ ] `/store/courses/contrarian-distribution-and-shorting`
  - [ ] `/store/courses/macro-cycle-inflection-mastery`
  - [ ] `/store/courses/institutional-risk-and-trader-psychology`
  - [ ] Reconcile or `308`-redirect legacy alias `/store/courses/move-prior-to-the-move-masterclass` → `/store/courses/move-prior-to-the-move-ultra`.
- [ ] **Non-Flagship Indicator Pages (`7` catalog slugs in `src/lib/data/indicators.ts`):**
  - [ ] `/store/indicators/liquidity-sweep-radar`
  - [ ] `/store/indicators/compression-squeeze-matrix`
  - [ ] `/store/indicators/spx-gamma-zones`
  - [ ] `/store/indicators/abandoned-bar-exhaustion`
  - [ ] `/store/indicators/smart-money-volume-delta`
  - [ ] `/store/indicators/hot-zone-time-structure`
  - [ ] `/store/indicators/true-thrust-trend-ribbon`
  - [ ] Reconcile or retire the `9` obsolete indicator slugs noted in SEO Audit `F06` (`move-prior-to-the-move-pro`, `mp-early-in-n-out-pro`, `mp-early-in-n-out`, `multi-timeframe-squeeze-pro`, `institutional-volume-absorption`, `spx-dealer-gamma-levels`, `volatility-regime-compass`, `anchored-vwap-liquidity-bands`, `options-expected-move-corridor`).
- [ ] **Non-Flagship Scanner Pages (`8` catalog slugs in `src/lib/data/scanners.ts`):**
  - [ ] `/store/scanners/move-prior-to-the-move-radar`
  - [ ] `/store/scanners/multi-timeframe-squeeze-scanner`
  - [ ] `/store/scanners/liquidity-sweep-stop-hunt-scanner`
  - [ ] `/store/scanners/small-account-affordable-options-scanner`
  - [ ] `/store/scanners/working-pro-eod-swing-scanner`
  - [ ] `/store/scanners/spx-dealer-gamma-iv-skew-scanner`
  - [ ] `/store/scanners/smart-money-relative-volume-scanner`
  - [ ] `/store/scanners/opening-bell-gap-and-go-fade-scanner`
- [ ] **Lift Store Launch Gate (`T10` in `src/lib/data/launch-gate.ts`):** Only after all Store product pages, pricing, legal disclosures, and checkout/provisioning flows pass launch review.

---

## 7. Priority 6 — Open Engineering, Accessibility, CMS & SEO Audit Items

Tracked from [`docs/seo/audit/2026-11-15/08-report.md`](docs/seo/audit/2026-11-15/08-report.md) (`F01` and `F02` are already **completed**), [`docs/TEMPORARY.md`](docs/TEMPORARY.md), and [`docs/blog/AUTOMATION_PLAN.md`](docs/blog/AUTOMATION_PLAN.md):

- [x] **SEO Audit `F01`:** Build `/live-trading-rooms` overview hub and wire navigation, footer, child 3-level breadcrumbs + JSON-LD `BreadcrumbList`, `sitemap.xml`, and `02-inventory.json` (completed in `f374a8f`).
- [x] **SEO Audit `F02`:** Replace retired `/watchlist` anchor in published 0DTE CMS article with Sunday Alpha Protocol (completed in `8f14dbe`).
- [ ] **SEO Audit `F03` (`src/lib/seo/blog-seo.ts`):** Validate custom blog JSON-LD nodes recursively at every nesting depth, block nested prohibited schema types, and reject duplicate/conflicting `@id` entities.
- [ ] **SEO Audit `F04` (Accessibility — real `axe-core`):** Fix keyboard-focusable scroll regions on `day-trading-room`, `swing-trading-room`, `small-accounts-room`, `etf-stocks-list`, `store/courses`, and `/blog/[slug]`, plus accessible SVG naming on `stock-indexes-list`; re-verify with real `axe-core`.
- [ ] **SEO Audit `F05` (`tests/seo/lab.ts`):** Wire real `axe-core` (or rename heuristic output honestly) and ignore hidden `<dialog>` headings when checking visible heading outlines.
- [ ] **SEO Audit `F06` (`docs/seo/audit/02-inventory.json`):** Derive URL inventory dynamically from routes, active catalogs, and selected CMS environment; separate local seed fixtures (`T4`) from live production post coverage.
- [ ] **SEO Audit `F07` & `F08` (Documentation & Font Policy Alignment):** Reconcile stale references across `docs/NEW_PAGE_PLAYBOOK.md`, `docs/seo/LAUNCH_TRACKER.md`, `docs/seo/SEO_STANDARD.md` (`†` markers), and `AGENTS.md` / `src/app.css` font-family naming (`Plus Jakarta Sans` / `Inter` / `Geist Mono` vs. written two-font policy) without causing geometry/CLS drift; also remove or quarantine fabricated placeholder contact fields in `src/lib/config/site.ts` and align founder `jobTitle` strings (`LAUNCH_TRACKER.md` §F).
- [ ] **SEO Audit `F09` & `F10` (Host Headers & Redirect Hop):** Tighten non-production `X-Robots-Tag` host matching in `src/hooks.server.ts` / `vercel.json` and collapse `http://revolutiontradingpros.com` → `https://www.revolutiontradingpros.com` from two `308` hops to one.
- [ ] **SEO Audit `F11` (Schema Typing & Closed `@graph`):** Ensure blog `@graph` payloads define or cleanly resolve shared `#founder` / `#offer-catalog` entities and add strict `schema-dts` compile-time typing across `structured-data.ts` and `blog-seo.ts`.
- [ ] **SEO Audit `F12` (`patchPost` `minorEdit`):** Forward `minorEdit` through `src/lib/server/services/posts.ts` (`patchPost`) to `save-post.ts` with unit/DB regression coverage.
- [ ] **SEO Audit `F13` (`/images/blog/[...file]`):** Separate local dev/test SVG fallback placeholders from publishable media verification so missing production blog images never masquerade as `200 OK` images.
- [ ] **SEO Audit `F14` (CI Gate Automation):** Add versioned GitHub/CI workflow running `pnpm check:css`, `pnpm check`, `pnpm lint`, `pnpm test:unit --run`, `pnpm build`, `pnpm check:pages`, `pnpm test:seo`, and Playwright E2E on every push.
- [ ] **SEO Audit `F15` (`pnpm audit`):** Review and remediate the 4 transitive dependency advisories (`@vercel/blob` → `@vercel/cli-config` `zod`, `glob`, `minimatch`, `deepmerge`) safely as upstream releases land.
- [ ] **CMS Automation & Freshness (`docs/blog/AUTOMATION_PLAN.md`, `docs/blog/FRESHNESS.md`):** Implement read-only package validator/draft-intake CLI, scheduled-publication worker, and hosted CDN cache invalidation; monitor thin category/tag archive thresholds as article count grows.
- [ ] **Production DB & Auth Hardening (`T2`, `T3`, `T4`, `T7`, `T8` in `docs/TEMPORARY.md`):** Enforce `disableSignUp` + remove `ADMIN_SEED_*` in production (`T2`), gate seed fixtures behind `is_fixture` (`T4`), and keep disk media driver dev/test-only (`T8`).

---

## 8. Owner-Only Business, Evidence & Search Console Actions

Items that code alone cannot complete without owner credentials, assets, or legal/editorial sign-off:

- [ ] **Google Search Console:** Submit `https://www.revolutiontradingpros.com/sitemap.xml` in the verified property, inspect `/`, `/live-trading-rooms`, `/alert-services/sunday-alpha-protocol`, `/blog`, and `/blog/0dte-spx-options-strategy-guide`, and monitor Page Indexing, Generative AI performance reports, and 28-day CrUX field Core Web Vitals.
- [ ] **Rich Results Test & Schema Validator:** Capture live validation snapshots on `search.google.com/test/rich-results` and `validator.schema.org` for representative production templates.
- [ ] **Primary Trade & Biographical Evidence (`T11` & `LAUNCH_TRACKER.md` §A):** Supply verifiable brokerage/alert documentation for `VERIFIED_CASE_STUDIES` (`2020`, `2022`, `OXY` claims) and founder mentorship/endorsement references—or soften unverified historical claims in page copy.
- [ ] **Real Founder Portrait (`T9`):** Supply real portrait photo in `static/` and update `FOUNDER_PORTRAIT` in `src/lib/data/site.ts` (currently using `/icon-512.png`).
- [ ] **Support Contact Details (`LAUNCH_TRACKER.md` §A):** Confirm official public support email, phone (if any), and business mailing address for `SUPPORT_CONTACT` in `src/lib/data/site.ts`, `/contact`, Footer, and `EducationalOrganization` schema.
- [ ] **Legal Counsel Sign-Off:** Review `/terms-of-service`, `/privacy-policy`, `/refund-policy`, `/risk-disclosure`, and the Footer US/Canada risk box prior to enabling paid commerce.
- [ ] **Free Trading eBook Asset (`FREE_EBOOK_AVAILABLE`):** Author _"The Institutional Execution Playbook"_ PDF and connect consented email delivery before flipping `FREE_EBOOK_AVAILABLE = true` in `src/lib/data/homepage.ts`.
- [ ] **Waitlist Production Services (`T13`):** Connect dedicated Waitlist database + Resend domain/API/webhook secrets when ready to enable maintenance/waitlist email capture (`docs/WAITLIST_SETUP.md`).
- [ ] **Higher-Density Blog Master Graphics:** Source `>= 2400px` master originals when needed for full `2x` Retina rendering in wide featured slots without artificial upscaling.
