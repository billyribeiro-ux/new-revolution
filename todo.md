# Master Engineering, Content & Launch Roadmap (`todo.md`)

**Last Updated:** November 16, 2026 · **Branch:** `main`  
**Verification Rule:** Check a box (`[x]`) **only** when backed by reproducible code, passing `pnpm` verification gates ([`docs/VITE_PLUS_WORKFLOW.md`](docs/VITE_PLUS_WORKFLOW.md)), and (for production/Search Console items) live HTTP/console proof. Temporary placeholders and feature gates are tracked in [`docs/TEMPORARY.md`](docs/TEMPORARY.md).

---

## 1. Where We Stand Right Now (`99` Prerendered Pages + SSR Surfaces)

| Surface / Category                         | Count | Current Status         | Notes & Gate                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| :----------------------------------------- | :---: | :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Live Indexable Public Pages**            | `29`  | ✅ Live (`200`)        | `/` (SSR), `/about`, `/methodology`, `/our-mission`, `/track-record`, `/contact`, `/editorial-policy`, `/privacy-policy`, `/terms-of-service`, `/risk-disclosure`, `/refund-policy`, `/mentorship`, `/live-trading-rooms` + 3 child rooms, `/alert-services` + 2 child alert services, `/resources`, `/resources/options-calculator`, `/resources/intraday-margin-calculator`, `/resources/finra-intraday-margin-rule-2026`, `/resources/best-live-options-and-day-trading-rooms`, `/resources/best-spx-0dte-and-options-alert-services`, `/resources/etf-stocks-list`, `/resources/stock-indexes-list`, `/blog` (SSR), `/blog/0dte-spx-options-strategy-guide` (SSR CMS). |
| **Built Store Pages (Launch-Gated)**       |  `6`  | 🟡 Built (`noindex`)   | `/store/courses`, `/store/indicators`, `/store/scanners`, plus the 3 flagship detail pages (`move-prior-to-the-move-ultra`, `move-prior-to-the-move-system`, `high-octane-scanner`). Gated by `T10` (`src/lib/data/launch-gate.ts`).                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **Admin & Staff CMS**                      | `17`  | ✅ Built (`noindex`)   | `/admin/login` + 16 authenticated `/admin/**` SSR routes (Posts, TipTap Editor, Media, Leads, Subscribers, Sequences, Email Analytics, Calls, Inbox, Notifications, Analytics, Consent, Campaigns, Integrations).                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Core, Resource & Enroll `[TODO]` Pages** | `35`  | 🚧 Placeholder (`T16`) | `5` static hubs/portals (`/login`, `/register`, `/memberships`, `/store`, `/mentorship/apply`) + `22` `/resources/[slug]` tools/guides + `8` `/enroll/[slug]` flows. All render `<TodoPageShell />` with `noindex, nofollow` and zero broken/misleading links.                                                                                                                                                                                                                                                                                                                                                                                                             |
| **Store `[slug]` `[TODO]` Pages**          | `32`  | 🚧 Placeholder (`T16`) | `21` non-flagship catalog products (`7` courses, `7` indicators, `7` scanners) + `1` `move-prior-to-the-move-radar` scanner slug + `10` legacy alias slugs (`1` course, `9` indicators) rendering `<TodoPageShell />` (`noindex, nofollow`).                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Concept Banners vs. Commerce Guard**     |   —   | 🟡 Active (`T14`)      | `CONCEPT_PREVIEW = false` (public concept banners/dialogs hidden cleanly); `COMMERCE_ENABLED = false` (`src/lib/server/commerce-guard.ts` blocks `/checkout` & payment endpoints with `403`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

> **Exact Prerender Math (`pnpm check:pages`):** `26` static indexable SSG pages (`/` and `/blog/**` are SSR) + `6` built Store SSG pages + `35` core/resource/enroll `[TODO]` SSG pages + `32` Store `[slug]` `[TODO]` SSG pages = **`99` verified prerendered HTML contracts**.

---

## 2. Priority 1 — Core Parent Hubs, Cornerstone Methodology, Legal & Verification Pages

Build these first so top-level navbar buttons, homepage primary CTAs, and footer trust links graduate from `[TODO]` placeholders into flagship public pages ([`docs/NEW_PAGE_PLAYBOOK.md`](docs/NEW_PAGE_PLAYBOOK.md)):

- [ ] **`/memberships` — All Memberships Overview & Comparison Hub**
  - Connected from: Navbar primary CTA (`"Explore Memberships"`), Homepage Hero (`"Explore Our Memberships"`), Homepage Closing CTA, and Footer (`"All Memberships"`).
  - Scope: Side-by-side decision matrix uniting Live Trading Rooms, Alert Services (`SPX Profit Pulse` & `Sunday Alpha Protocol`), and 1-on-1 Mentorship; account-size (`$500+` T+1 cash / FINRA Rule 4210 `$2,000` margin baseline to `$25k+`) and daily-schedule fit selector; `CollectionPage` + `ItemList` JSON-LD; remove from `todo-pages.ts` and flip `indexable: true` in `docs/seo/audit/02-inventory.json`.
- [x] **`/methodology` — Cornerstone Pure Price-Action Methodology Pillar (`The Move Prior to The Move™`)**
  - Built with 100% indicator-free Monthly-to-1-Minute interactive timeframe alignment, Lagging Indicators vs. Pure Price Structure matrix, archived 2020/2022/OXY dislocation case studies, `Article` JSON-LD, and `indexable: true`.
- [x] **`/alert-services` — Alert Services & Video Watchlists Hub**
  - Graduated from `[TODO]`: head-to-head comparison of `SPX Profit Pulse` vs. `Sunday Alpha Protocol`, 5-point pre-trade structural blueprint anatomy, `CollectionPage` + `ItemList` JSON-LD, and `indexable: true`.
- [x] **`/risk-disclosure` — Standalone US & Canada Risk Disclosure Statement**
  - Graduated from `[TODO]`: full standalone financial & regulatory disclosure covering OCC standardized options, CFTC Rule 4.41 hypothetical/simulated limits, FINRA Rule 4210(d)(2) intraday margin, T+1 settlement, IRC Section 1256, and U.S./Canadian publisher exclusions; `WebPage` JSON-LD; `indexable: true`.
- [x] **`/track-record` — Public Trade Ledger & Archived Historical Case Studies**
  - Graduated from `[TODO]`: 4-point primary-receipt verification standard, permanent stop-out retention policy, filterable archived 2020/2022/OXY structural case studies with CFTC Rule 4.41 non-typicality notice, zero fabricated live rows (`T11`), `CollectionPage` + `ItemList` JSON-LD, and `indexable: true`.

---

## 3. Priority 2 — Interactive Free Public Calculators & Link-Magnet Playbooks (`/resources/*`)

- [x] **`/resources/options-calculator` — Interactive Black-Scholes Options Profit, Greeks & Asymmetric Risk Calculator**
  - Graduated from `[TODO]`: analytical Black-Scholes engine (`src/lib/utils/options-calculator.ts`), single-leg & vertical spread modeling, SSR-safe SVG payoff curve, `$500+` small-account sizer, 1-click HTML citation backlink widget, and `WebApplication` JSON-LD (`indexable: true`).
- [x] **`/resources/intraday-margin-calculator` — FINRA 2026 Rule 4210(d)(2) Intraday Margin (`IML`) & Asymmetric Position Sizer**
  - Built with reusable `<IntradayMarginCalculator />`, `IML` / `IMD` / `min(5% equity, $1,000)` De Minimis math (`src/lib/utils/intraday-margin.ts`), T+1 cash vs. `$2,000+` margin toggle, 1-click HTML citation widget, and `WebApplication` JSON-LD (`indexable: true`).
- [x] **`/resources/finra-intraday-margin-rule-2026` — FINRA Regulatory Notice 26-10 Playbook**
  - Built with 68-word AIO summary, Legacy 2001 PDT vs. Amended Rule 4210(d)(2) table, June 4, 2026 → October 20, 2027 broker rollout timeline, embedded `<IntradayMarginCalculator headingLevel="h3" />`, `Article` JSON-LD (`indexable: true`), and matching CMS Markdown package (`content/blog-posts/blog-post-43-finra-intraday-margin-rule-2026.md`).
- [x] **`/resources/best-live-options-and-day-trading-rooms` & `/resources/best-spx-0dte-and-options-alert-services` — 2026 Criteria Comparison Matrices**
  - Built objective 7-room and 6-alert-service structural matrices with publisher disclosures, `Article` JSON-LD, and matching CMS Markdown packages (`content/blog-posts/blog-post-41-*.md` & `blog-post-42-*.md`).
- [ ] **`/resources/position-size-calculator` — Position Size & Risk-Budget Calculator**
  - Scope: Exact share & option-contract sizing from account equity, risk `%` (`0.5%–2%`), entry, and invalidation stop; T+1 settled-cash daily bucket calculator + FINRA Rule 4210 `$2,000` margin baseline check; drawdown recovery math table; flip `indexable: true`.
- [ ] **`/resources/risk-reward-calculator` — Risk/Reward, R-Multiple & Expectancy Calculator**
  - Scope: Multi-target (`T1`/`T2`/runner) R-multiple payoff modeler, minimum breakeven win-rate curve, and 20-trade expectancy simulator; flip `indexable: true`.
- [ ] **`/resources/trading-journal-template` — Institutional Trading Journal & Audit Template**
  - Scope: Structured pre-trade checklist, execution tagging taxonomy, weekly R-distribution review framework, and downloadable CSV/spreadsheet template; flip `indexable: true`.

---

## 4. Priority 3 — Member Portal, Onboarding, Admissions & Enrollment Flows

**Backend implementation deferred by the owner on November 16, 2026.** Retain these requirements; resume backend work only when the owner requests it. See §7.1 for the consolidated backend backlog. Frontend completion and backend integration remain separate milestones.

- [ ] **`/login` — Member Login Portal** (distinct from internal staff `/admin/login`; stays `noindex, nofollow`).
- [ ] **`/register` — Free Member Account Registration** (email verification, risk-disclosure acknowledgment, experience-track onboarding; stays `noindex, nofollow`).
- [ ] **`/mentorship/apply` — 1-on-1 Private Mentorship Application Flow** (structured suitability & bottleneck intake form, server validation, admin leads queue notification; stays `noindex, nofollow`).
- [ ] **`/enroll/[slug]` — Dedicated Membership & Store Enrollment Flows (`8` routes, `noindex, nofollow`):**
  - [ ] `/enroll/day-trading-room`
  - [ ] `/enroll/swing-trading-room`
  - [ ] `/enroll/small-accounts-room`
  - [ ] `/enroll/spx-profit-pulse`
  - [ ] `/enroll/sunday-alpha-protocol`
  - [ ] `/enroll/move-prior-to-the-move-ultra`
  - [ ] `/enroll/move-prior-to-the-move-system`
  - [ ] `/enroll/high-octane-scanner`
- [ ] **Commerce Activation Gate (`T14` in [`docs/TEMPORARY.md`](docs/TEMPORARY.md)):** Keep `COMMERCE_ENABLED = false` in `src/lib/shared/development-status.ts` and `src/lib/server/commerce-guard.ts` until payment processor integration, legal disclosures, webhook entitlement provisioning, and checkout E2E tests are complete and owner-approved.

---

## 5. Priority 4 — Free Resource Vault Guides, Tutorials & Playbooks (`19` Routes)

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

- [ ] **`/store` — Store Overview Hub** (uniting Courses, Chart Structure Studies, and Institutional Scanners + ThinkorSwim / TradingView compatibility matrix).
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
  - [ ] Reconcile or retire the `9` obsolete indicator slugs noted in SEO Audit `F06`.
- [ ] **Non-Flagship Scanner Pages (`8` catalog slugs in `src/lib/data/scanners.ts`):**
  - [ ] `/store/scanners/move-prior-to-the-move-radar`
  - [ ] `/store/scanners/multi-timeframe-squeeze-scanner`
  - [ ] `/store/scanners/liquidity-sweep-stop-hunt-scanner`
  - [ ] `/store/scanners/small-account-affordable-options-scanner`
  - [ ] `/store/scanners/working-pro-eod-swing-scanner`
  - [ ] `/store/scanners/spx-dealer-gamma-iv-skew-scanner`
  - [ ] `/store/scanners/smart-money-relative-volume-scanner`
  - [ ] `/store/scanners/opening-bell-gap-and-go-fade-scanner`
- [ ] **Lift Store Launch Gate (`T10` in `src/lib/data/launch-gate.ts`):** Follow [`docs/SEO_STANDARD.md`](docs/SEO_STANDARD.md) §10.3 once all Store product pages, pricing, legal disclosures, and checkout flows pass launch review.

---

## 7. Priority 6 — Open Engineering, Accessibility, CMS & SEO Audit Items

Tracked from the November 15 SEO audit (`docs/seo/audit/2026-11-15/`), [`docs/TEMPORARY.md`](docs/TEMPORARY.md), and [`docs/BLOG_CONTRACT.md`](docs/BLOG_CONTRACT.md):

- [x] **SEO Audit `F01`:** Build `/live-trading-rooms` overview hub and wire navigation, footer, child 3-level breadcrumbs + JSON-LD `BreadcrumbList`, `sitemap.xml`, and `02-inventory.json` (`f374a8f`).
- [x] **SEO Audit `F02`:** Replace retired `/watchlist` anchor in published 0DTE CMS article with Sunday Alpha Protocol (`8f14dbe`).
- [x] **SEO Audit `F07` & `F08` (Documentation & 3-Font Policy Consolidation):** Reconcile 3-font (`Plus Jakarta Sans` + `Inter` + `Geist Mono`) pipeline (`b5f5965`), archive `105` legacy `.md` files to `retired/` (`0fe0363`), and consolidate active engineering docs into the 12-file SSOT architecture.
- [ ] **Placeholder Contact Fields Cleanup (`src/lib/config/site.ts`):** Quarantine or remove dev fallback `(800) 555-0199` / `100 Wall Street` defaults in `src/lib/config/site.ts` once real `PUBLIC_CONTACT_*` values are confirmed.
- [ ] **SEO Audit `F03` (`src/lib/seo/blog-seo.ts`):** Validate custom blog JSON-LD nodes recursively at every nesting depth, block nested prohibited schema types, and reject duplicate/conflicting `@id` entities.
- [x] **SEO Audit `F04` (Accessibility — real `axe-core`):** Fixed named, native keyboard scroll regions on the six confirmed routes (including `stock-indexes-list`) and three additional gated store templates; marked redundant index-directory Phosphor icons decorative. Real axe and native keyboard regressions cover narrow/wide layouts and the seeded article; its earlier reported scroll defect was not reproduced. See [frontend implementation evidence](docs/audit/2026-11-16/frontend-implementation.md).
- [x] **SEO Audit `F05` (`tests/seo/lab.ts`):** Replaced handwritten checks and the invented score with pinned axe-core results, engine identity, and incomplete/manual-review checks. Added positive/negative controls, including a hidden control; generated lab output defaults to ignored `test-results/`.
- [ ] **Frontend accessibility follow-up:** Review the real axe lab's moderate complementary-landmark and announcement-region findings, plus manual assistive-technology coverage. The repaired serious scroll/SVG failures are separately closed; see the frontend implementation ledger.
- [ ] **SEO Audit `F06` (`docs/seo/audit/02-inventory.json`):** Derive URL inventory dynamically from routes, active catalogs, and selected CMS environment; separate local seed fixtures (`T4`) from live production post coverage.
- [ ] **SEO Audit `F09` & `F10` (Host Headers & Redirect Hop):** Tighten non-production `X-Robots-Tag` host matching in `src/hooks.server.ts` / `vercel.json` and collapse `http://revolutiontradingpros.com` → `https://www.revolutiontradingpros.com` from two `308` hops to one.
- [ ] **SEO Audit `F11` (Schema Typing & Closed `@graph`):** Ensure blog `@graph` payloads define or cleanly resolve shared `#founder` / `#offer-catalog` entities and add strict `schema-dts` compile-time typing across `structured-data.ts` and `blog-seo.ts`.
- [ ] **SEO Audit `F12` (`patchPost` `minorEdit`):** Forward `minorEdit` through `src/lib/server/services/posts.ts` (`patchPost`) to `save-post.ts` with unit/DB regression coverage.
- [ ] **SEO Audit `F13` (`/images/blog/[...file]`):** Separate local dev/test SVG fallback placeholders from publishable media verification so missing production blog images never masquerade as `200 OK` images.
- [ ] **SEO Audit `F14` (CI Gate Automation):** Add versioned GitHub/CI workflow running `pnpm check:css`, `pnpm check`, `pnpm lint`, `pnpm test:unit --run`, `pnpm build`, `pnpm check:pages`, `pnpm test:seo`, and Playwright E2E on every push.
- [ ] **SEO Audit `F15` (`pnpm audit`):** Review and remediate the 4 transitive dependency advisories (`@vercel/blob` → `@vercel/cli-config` `zod`, `glob`, `minimatch`, `deepmerge`) safely as upstream releases land.
- [ ] **CMS Intake Automation & CDN Purge (`docs/BLOG_CONTRACT.md` §2–§3):** Implement read-only package validator/draft-intake CLI, scheduled-publication worker, and Phase 1b hosted CDN cache-tag purge integration.

---

### 7.1 Owner-Deferred Backend Backlog — November 16, 2026

**Status: Deferred at the owner's request.** Record the work now and leave backend implementation, provider activation, and related operational wiring for a later backend workstream. Keep these requirements unchecked until the backend is properly built and verified.

Track these items as unfinished backend build and integration requirements. Address the observed behavior as part of completing the backend end to end, without starting a separate repair workstream now. Source and runtime evidence remain in [backend-report.md](backend-report.md) and [the claim-verification report](docs/audit/2026-11-16/verification-report.md). Existing overlapping `F*` entries in §7 remain open and refer to the same work.

| Item                                                     | Kind                      | Required outcome when backend work resumes                                                                                                                                              |
| -------------------------------------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ ] **A04 — Database and authenticated test isolation**  | Test infrastructure       | Seed and application honor the same disposable database path; authenticated admin E2E tests run against that database and clean up safely.                                              |
| [ ] **A01 — Authentication configuration**               | Unfinished implementation | Production rejects missing, weak, and known development authentication secrets, with isolated positive/negative regression coverage.                                                    |
| [ ] **A06 / F03, F11 — CMS structured data**             | Unfinished implementation | Validate nested custom JSON-LD and reject prohibited types and conflicting entity identifiers in the resulting graph.                                                                   |
| [ ] **A07 / F12 — Editorial modification dates**         | Unfinished implementation | Declare and forward PATCH `minorEdit`; preserve dates for minor edits while ordinary editorial updates still advance them.                                                              |
| [ ] **A05 / F13 — Missing media responses**              | Unfinished implementation | Distinguish real production assets from development/test placeholders and verify intended publishable media.                                                                            |
| [ ] **A03 — Analytics and sequence-email schedules**     | Operational wiring        | Verify intended services/provider readiness, then configure daily/weekly analytics and sequence-email invocation with observable failures.                                              |
| [ ] **Customer accounts and member access**              | Unfinished feature        | Complete registration, email verification, login, member access, and experience/risk-disclosure onboarding; retain the staff/member authorization distinction.                          |
| [ ] **Mentorship applications**                          | Unfinished feature        | Validate and persist applications server-side, connect the admin leads queue, and verify notification behavior.                                                                         |
| [ ] **Eight enrollment flows and commerce**              | Unfinished integration    | Connect enrollment persistence, payment processing, webhook-driven entitlements, and end-to-end failure/recovery states. Activation still requires explicit owner approval.             |
| [ ] **CMS package intake and hosted cache invalidation** | Unfinished automation     | Implement the package validator/intake workflow and wire the existing cache-invalidation abstraction to the hosted provider.                                                            |
| [ ] **Production email and waitlist delivery**           | Provider integration      | Verify sending-domain, API/webhook configuration, consent, and delivery/retry behavior before enabling capture or sending.                                                              |
| [ ] **A02 / F15 and A09 / F14 — Dependencies and CI**    | Shared engineering        | Refresh advisory evidence before remediation; automate the repository gates with isolated data and explicit authenticated coverage. Backend-related work is deferred with this backlog. |

When the owner resumes backend work, establish the complete architecture and service contracts, incorporate these requirements into that build, and verify the resulting workflows end to end. Keep `COMMERCE_ENABLED = false`, store launch gating, and the intentional custom-domain removal in their current states.

---

## 8. Owner-Only Business, Evidence & Search Console Actions

- [ ] **Google Search Console:** Submit `https://www.revolutiontradingpros.com/sitemap.xml`, inspect representative URLs, and monitor Page Indexing, Generative AI reports, and 28-day CrUX field Core Web Vitals ([`docs/SEO_STANDARD.md`](docs/SEO_STANDARD.md) §10.2).
- [ ] **Rich Results Test & Schema Validator:** Capture live validation snapshots on `search.google.com/test/rich-results` and `validator.schema.org`.
- [ ] **Primary Trade & Biographical Evidence (`T11`):** Supply verifiable brokerage/alert documentation for `VERIFIED_CASE_STUDIES` (`2020`, `2022`, `OXY` claims) and founder mentorship/endorsement references—or soften unverified historical claims in page copy.
- [ ] **Real Founder Portrait (`T9`):** Supply real portrait photo in `static/` and update `FOUNDER_PORTRAIT` in `src/lib/data/site.ts`.
- [ ] **Support Contact Details:** Confirm official public support email, phone (if any), and business mailing address for `SUPPORT_CONTACT` in `src/lib/data/site.ts`, `PUBLIC_CONTACT_*` in Vercel, `/contact`, Footer, and `EducationalOrganization` schema.
- [ ] **Legal Counsel Sign-Off:** Review `/terms-of-service`, `/privacy-policy`, `/refund-policy`, `/risk-disclosure`, and the Footer US/Canada risk box prior to enabling paid commerce.
- [ ] **Free Trading eBook Asset (`FREE_EBOOK_AVAILABLE`):** Author _"The Institutional Execution Playbook"_ PDF and connect consented email delivery before flipping `FREE_EBOOK_AVAILABLE = true` in `src/lib/data/homepage.ts`.
- [ ] **Waitlist Production Services (`T13`):** Connect verified Resend sending domain/API/webhook secrets when ready to enable maintenance/waitlist email capture ([`docs/ADMIN_AND_OPS.md`](docs/ADMIN_AND_OPS.md) §4).
