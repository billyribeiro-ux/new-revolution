# Changelog

All notable changes to this repository. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Newest first. **Every PR adds an entry under `[Unreleased]`** (agents: see
[`docs/AGENT_COORDINATION.md`](docs/AGENT_COORDINATION.md)). Entries that add anything
**temporary** are tagged `TEMPORARY` and must also appear in [`docs/TEMPORARY.md`](docs/TEMPORARY.md).

Categories: Added, Changed, Deprecated, Removed, Fixed, Security, Docs.

## [Unreleased]

### 2026-11-05 — Shared blog layout and owner-authorized maintenance-off release

- Align the archive, search, category, tag, article and protected-article shells with the existing `.container` and responsive section spacing. Preserve 900px article readability and centered media; remove conflicting fixed shells and narrow-screen grid/form overflow.
- Add browser assertions against the actual navbar container across 320–2420px, including a 1536px centered shell at 2420px. Correct the CSS standards table to match the implemented width/gutter tokens; update the blog handoff and publishing guide.
- Catch and fix a hosted-only homepage500 before release: its remote desk-status prerender function now explicitly permits runtime calls after the SSR conversion. Add a regression against the actual generated Vercel handler, rather than Vite preview alone.
- At the owner’s explicit request, prepare maintenance off, a verified Production release and squash merge of PR #27. Initialize a separate free-plan Production Neon database with the four existing forward migrations; keep article preparation/publication for the subsequent discussion.
- Evidence, exact release state and remaining article work are recorded in `docs/reviews/blog-layout-release-2026-11-05/VERIFICATION.md`.

### 2026-11-05 — Visible Blog navigation and schema parity

- Separate menu visibility from indexing policy: Blog appears in desktop/mobile navigation and the footer, while Store promotion and blog noindex/canonical/sitemap protections remain in place.
- Derive navigation JSON-LD automatically from the same menu data. Add regression coverage for the visible Blog link, schema/DOM parity, actual navigation and responsive layouts; update the publishing guide and shared agent handoff with the exact policy.
- Synchronize the saved-editor readiness assertion before reloading in Firefox; strengthen platform-aware keyboard focus assertions without changing product behavior or lowering thresholds. Verify saved CMS title/URL parity in archive and article JSON-LD.
- Integrate the owner’s latest mission/editorial commit and format its eight inherited lint failures; the mission edit is trailing whitespace only. Preserve its authored text.
- Full acceptance and protected Preview evidence are recorded in `docs/reviews/blog-navigation-2026-11-05/VERIFICATION.md`. Public Production maintenance remains unchanged.

### 2026-11-05 — Automatic CMS blog placement

Review: [draft PR #27](https://github.com/billyribeiro-ux/new-revolution/pull/27); no merge or Production promotion.

- Replace hardcoded homepage blog placeholders with the same public CMS discovery service used by `/blog`. Marked featured content leads; otherwise the newest eligible publication leads automatically. Exclude the lead before paginating the remaining articles, with all older articles reachable and no duplicate lead card.
- Render actual covers and CMS card data on both surfaces, with one featured lead, responsive regular grids, homepage pagination and honest empty/unavailable states. Preserve draft/private/fixture/expiry visibility rules and derive homepage schema from visible saved cards after launch.
- Make the homepage an explicit SSR exception to static marketing rendering so publishing needs no rebuild; homepage/blog-index reads are no-store. Document the owner-requested homepage discovery exception while retaining public maintenance and other launch protections.
- Add shared-query database tests and focused component tests; extend authenticated image-flow E2E to prove a draft is absent and its publication appears in initial HTML and mobile/desktop cards on both pages. Update the publishing guide, agent handoff, rendering policy and operational records. The separate intake automation and article import remain unimplemented.
- Final checks: 575 unit/component tests, 40 authenticated E2E tests with no skips, 3 SEO tests and 46 static page contracts pass. Retain four reviewed mobile/desktop publishing screenshots and clean Svelte MCP results in `docs/reviews/blog-discovery-2026-11-05/VERIFICATION.md`; homepage SSR is verified separately from the remaining static pages.

### 2026-11-05 — Blog handoff across agent documentation

- Add `docs/BLOG_AGENT_HANDOFF.md` as the shared current-status and required-reading entry point for blog work, with an explicit inventory of 40 existing agent-facing Markdown files.
- Add dated handoff references to agent configuration, README, engineering/SEO standards, prompts, playbooks and operational runbooks. Import the handoff explicitly from `CLAUDE.md`; preserve byte-identical SEO-standard copies and original editorial/evidence artifacts.
- Make the current CMS workflow, automatic data-driven JSON-LD, proposed-but-unimplemented intake tooling, Svelte MCP review evidence and publication/launch boundaries discoverable from every inventoried entry point. No application or hosted content changes.
- Correct the new-page playbook's obsolete instruction to edit the nonexistent `src/lib/data/blog-hub.ts`; point CMS card edits to saved post records and the publishing guide. Verify all 40 handoff references and their links, the Claude import, front matter and SEO-standard parity; check formatting across the 44 files in this documentation follow-up.

### 2026-11-05 — Blog intake automation design

- Add `docs/blog/AUTOMATION_PLAN.md` with a versioned package contract, shared preparation/report service, authenticated one-package draft intake, durable retry/conflict handling, real-media verification and content-specific preview acceptance criteria.
- Clarify in `blog implementation.md` that post JSON-LD already derives from CMS fields and does not need a manual title entry. Link the proposed automation and distinguish it from the existing executable API workflow.
- Review the official Svelte/SvelteKit MCP documentation and verify the installed Svelte 5.57.3 / Kit 3.1.1 baseline. Record that a 3.2.0 release could not be verified on November 5, 2026; preserve the existing toolchain and rendering architecture.
- Documentation only: the intake tooling and publication/cache hardening remain implementation work. No application code, dependencies, CMS records, media, launch flags or deployments changed.

### 2026-11-05 — Blog workflow audit and 0DTE publication plan

- Audit the blog routes, editor, service/transaction lifecycle, previews, taxonomy, media, scheduled publishing, metadata, feeds, caching and launch gate. Preserve source, HTTP, browser, dependency and Svelte MCP evidence in `docs/reviews/blog-audit-2026-11-05/`.
- Review `blogs/0DTE-spx-options-strategy.md` against the current CMS and primary exchange/regulatory sources. Record publication blockers, verified arithmetic, broken CTA paths, outdated PDT assumptions, unsupported claims and a phased implementation plan; preserve the original brief unchanged.
- Add `blog implementation.md` and link it from `AGENTS.md` so future agents follow the actual CMS authoring workflow, service schemas, real-media checks, review/publish steps and launch boundaries. Document the legacy importer's overwrite/gate-bypass risks and discrepancies between current code and older instructions.
- No application code, dependencies, launch flags, hosted data or deployments changed. Validation and existing defects remain explicit in the audit; a working publish score is not presented as proof of financial accuracy or production readiness.

### 2026-11-04 — Published maintenance and development handoff

- Promote the exact verified `6c35cf2` Production build, then independently verify both public domains and the maintenance experience across Chromium, Firefox and WebKit at 320px and 1440px. Keep future Production builds staged until verified.
- Provide a stable Vercel-sign-in-protected normal development Preview. Document its snapshot behavior, how to repoint it after verification and the owner's deferred email/database hookup; capture stays visibly disabled.
- Clarify the future hookup sequence: isolated native-flow test with its own matching origin, final staged Production configuration/API checks, then canonical delivery/callback/cron proof after promotion with rollback on failure.
- Record the complete final integrated gate results and actual deployment evidence in `docs/reviews/maintenance-ready/VERIFICATION.md`. Format the changelog blank line introduced when merging the completed CLS work. No application source or dependencies changed in this handoff.

### 2026-11-04 — Market playback and ready-to-connect waitlist

- Use green/red candles, wicks and volume with bounded intrabar price reversals and historical crosshair readouts. Preserve the explicit simulated-data label, accessible candle table and reduced-motion controls.
- Keep the completed email section visible, with native disabled controls and an honest availability note until capture is configured. Prepare an immediate thank-you/confirmation email and a targeted welcome receipt after confirmation.
- Add separately consented progress-update campaigns with encrypted outbox delivery, dry-run-first queueing, legacy-consent protection and forward migration `0003_waitlist_updates.sql`. Supply configuration/migration helpers and the authenticated minute worker schedule.
- Verify normal authenticated Preview development separately from public Production maintenance. The owner will connect the database/email services later; no service provisioning, Production migration or live email send is part of this change.

### Fixed — home page font-swap layout shift (CLS)

- Root cause (measured on a production build with fonts held back and then released, which isolates the swap; identical with JS blocked): when the web fonts arrived after first paint, text reflowed from the unadjusted `system-ui` fallback, and `ch`-based `max-inline-size` boxes changed width because `ch` follows the first available font. Swap CLS on `/` across 30 widths (320–1920 px): mean 0.0619, max 0.150, 9/30 widths > 0.1.
- `src/app.css`: weight-banded, metric-matched fallback faces (`Montserrat Variable Fallback`, `Sofia Sans Variable Fallback`: Arial / Liberation Sans / Arimo with measured `size-adjust`, ascent/descent/line-gap overrides, limited to the Fontsource Latin `unicode-range`), added to `--font-display` / `--font-sans` (SEO_STANDARD PERF-05). Generator: `scripts/generate-font-fallbacks.mjs`.
- The home page and shared footer `ch` widths are converted to the exact `em` equivalent of each rule's declared web font. The global `h2`/`h3`/`p` rules keep `ch`.
- Result on `/`: mean 0.0078, max 0.0596, 0/30 widths > 0.1. Settled layout across all 47 prerendered pages × 3 widths matches the previous build to within 0.1 px (sub-pixel `ch` rounding); the only larger differences were a pulsing animation and an italic face that had not loaded yet.
- Known gaps: Android (no Arial) keeps the old system fallback. Inner pages still have `ch` widths in `inner-page.css` and a breadcrumb that wraps differently before the swap (baseline swap CLS up to 0.42).

### 2026-11-04 — Maintenance release and capture readiness

- Keep the keyboard skip link's text on the SSOT ink color: the template's unlayered anchor styling otherwise overrides the shared layered rule and produces low-contrast white text on chartreuse. Verify the focused link in the browser.
- Diagnose the public-domain mismatch: manual domain promotion left the November 3 deployment live after later successful builds. Add an explicit staged Production verification, promotion and public-domain completion checklist.
- Render the signup form, invitation and no-JavaScript signup promise only when capture is explicitly enabled. Production currently lacks the required waitlist services, so the support notice and simulated chart remain usable without advertising failing capture.
- Give every maintenance form input a unique identifier while preserving names and labels. Test actual generated documents in both capture states, native markup, explicit image dimensions and browser rendering.

### 2026-11-04 — Vite+ documentation command policy

- Require all new and updated operational documentation and agent prompts to follow the existing local Vite+ workflow and project pnpm scripts, including the complete build and separate Svelte diagnostics/ESLint gates.
- Replace remaining actionable `npx` examples with `pnpm dlx`, align media-preview instructions with the actual Vite+ scripts, and add the complete build to the CSS verification checklist. Preserve dated command evidence as historical records.

### 2026-11-04 — Consolidated repository history

- Verify that all remaining branch changes are already integrated in `main`, including the Vite+ documentation, diagnostics fixes, production maintenance rollout and verified waitlist.
- At the owner's explicit request, replace the complete `main` history with one root commit and remove the redundant local and remote branches. Preserve the original refs and history in `.git/backups/before-consolidation-20261104.bundle`.
- Close the stale YMYL coordination claim. The former `develop` branch is retired; existing deployment records describe its historical Preview setup, and future branch-based development needs a new Preview branch.

### 2026-11-04 — Maintenance chart and verified reopening waitlist

- Replace the static SVG with a bundled Lightweight Charts candlestick/volume/EMA panel and GSAP entrance; preserve mobile rendering, readable candle data, reduced motion and explicit pause/restart. Owner requested continuous playback; demonstration candles are explicitly simulated rather than attributed to an exchange.
- Add forward-only Drizzle waitlist storage, hashed purpose-specific tokens, row-bound encrypted email outbox, durable abuse limits, provider retries/fencing, signed-event reconciliation, opt-out/suppression, retention and dry-run-first reopening batches.
- Add operational signup/confirmation/unsubscribe/worker handlers and exact maintenance exceptions; preserve blocked admin/auth/lead routes. Document independent Production configuration and outstanding staged-cloud/mailbox checks. No deployment, production migration or live email send performed.

### 2026-11-03 — Maintenance chart and verified waitlist plan

- Document a repository-specific GSAP/Lightweight Charts redesign and durable Drizzle/Resend waitlist, including confirmation, retry/suppression semantics, exact maintenance exceptions, acceptance tests and Production provisioning requirements. Planning only; no application or deployment changes.

### 2026-11-03 — Production maintenance and development Preview

- Resume Vercel behind temporary authentication, publish the verified maintenance build, and keep normal application development on a separate protected Preview URL. Scope maintenance settings to Production and Preview independently; retain manual production promotion.
- Provision a separate free-plan Neon Preview database and initialize the existing migrations on the verified empty database.
- Bundle `sanitize-html` and its ESM parser in the server build: deployed Node 24 rejected their external CommonJS-to-ESM require before API handlers could execute. No sanitizer rules or dependency versions changed.

### 2026-11-03 — Repository diagnostics and validation repairs

- Specialize the generic catalog component in a typed Svelte test fixture so both Svelte diagnostics and plain TypeScript can check the tests. Include the SEO test tooling in the TypeScript project and prompt VS Code to use the workspace SDK; document type-generation and editor recovery.
- Replace unsafe object-to-string coercions with scalar checks in editor hydration, article unlock/custom fields and error handling; narrow CSV inputs, correct test mocks and remove redundant constructs reported by lint. Add focused malformed-input regressions.
- Reject malformed breadcrumb names in the SEO crawler; align the admin image-flow sitemap assertions with the existing blog launch gate, and await the Svelte DOM update explicitly in the image-menu test.
- Format the six existing evidence/prompt files that blocked the full lint command; evidence JSON values are preserved.

### 2026-11-03 — Vite+ agent documentation

- Added a sourced Vite+ workflow for project scripts, Svelte-specific checks, test authoring and explicitly requested upgrades; linked it from the agent entry points and README.
- Corrected stale formatter, adapter/version and SEO test-command references in the engineering playbooks and audit instructions. No toolchain dependencies or test thresholds changed.

### 2026-11-03 — Dependency updates

#### Added (2026-11-03)

- `lightweight-charts` `^5.2.1` (TradingView; latest on npm as of 2026-11-03, published 2026-08-12; Apache-2.0). Installed only: nothing imports it yet.

#### Changed (2026-11-03)

- Updated to the latest published releases: `@threlte/core` 8.6.1 → 8.7.0, `@threlte/extras` 9.23.0 → 9.23.1, `better-auth` and `auth` (CLI) 1.7.14 → 1.7.15, `@electric-sql/pglite` (dev) 0.5.13 → 0.5.15, `svelte-check` (dev) 4.7.7 → 4.7.8, `globals` (dev) 17.13.0 → 17.14.0, `shiki` 4.5.0 → 4.6.0.
- **Not bumped: `vitest` and `@vitest/browser-playwright` stay at 5.0.5** (`pnpm-workspace.yaml` catalog). Bumping both to 5.1.0 broke 107 browser-mode tests (`browserTraceDomSnapshot` is undefined inside `vitest-browser-svelte` `render`). The cause is `vite-plus@1.4.0` (latest release), which pins its own `vitest` and `@vitest/browser-*` at exactly 5.0.5, so the test runner is 5.0.5 whatever the direct devDependency says. At 5.0.5, all 70 unit files (520 tests) pass and `pnpm peers check` is clean. Revisit when a `vite-plus` release pins vitest 5.1.0.
- **Not bumped: `typescript` stays at 6.0.3**, which `AGENTS.md` pins. `7.0.2` is available; that is a separate decision.
- `pnpm-workspace.yaml` `minimumReleaseAgeExclude` lists `@electric-sql/pglite@0.5.15`, so the install passes the release-age policy for that version.
- Gate on this tree (2026-11-03): `pnpm check` 0 errors, 0 warnings (2117 files); `pnpm test:unit --run` 70 files, 520 tests passed; `pnpm build` exit 0; `pnpm check:css` OK (90 properties); `pnpm check:pages` 47 pages satisfy the contract; `pnpm test:seo` 3 passed; `pnpm test:e2e` 19 passed, 13 skipped (admin-credential gated, `HAS_ADMIN_CREDENTIALS`); `vp lint .` and `eslint "**/*.svelte"` exit 0. `vp fmt --check .` fails on `follow-up-prompt.md` and `improve-layout-prompt.md`, which fail the same way on `origin/main` and are not touched here.

#### Docs (2026-11-03)

- Version references updated to the new ranges: `README.md` (Key Dependency Versions), `GEMINI.md` (Key Dependencies; `@sveltejs/kit` corrected to `^3.1.1` to match `package.json`), `docs/BLOG_ADAPTATION_MAP.md` (better-auth, shiki), `docs/ADMIN_AUTH_PLAN.md` (better-auth). The `@better-auth/core` `disableSignUp` line reference (`init-options.d.mts` line 704) still matches 1.7.15.
- `docs/seo/audit/00-environment.md`: dated addendum; the 2026-10-31 evidence rows are unchanged.

### 2026-11-03 — Maintenance desk notice design

- Replaced the oversized maintenance hero and repeated contact section with a compact branded notice, direct support link, readable status, responsive illustrative chart and a document retry control with a no-JavaScript fallback.
- Reuse the compiled root CSS and its existing Fontsource assets; embed the square brand emblem and validate template tokens and asset references during the build. The 320 px overflow is covered by regression tests.
- Preserve deployment-time activation, 503/no-store responses and route exceptions. Add narrow-screen, retry/recovery, keyboard, reduced-motion and font-failure checks.

### 2026-11-03 — Deployment-time maintenance mode

- Added a self-contained maintenance experience and Vercel Build Output API routing/functions for 503 responses, with a client-navigation state check and a documented deployment-time switch. Health and immutable application assets remain available; other application and API requests are blocked.
- Added route/function regression tests and a browser navigation test. The source signup is replaced by the existing support contact because its in-memory storage is not durable. Vercel preview verification remains required.

### 2026-11-02 — Blog engine Phase 3: removal and redirect integrity (G10)

#### Added (2026-11-02)

- `src/lib/server/posts/redirect-integrity.ts`: pure graph analysis (self-loop, cycle, chain, dangling target), an in-transaction loop/cycle check, a read-only full audit (`findRedirectIntegrityIssues`) and `isLiveBlogPath`.
- Tests: `redirect-integrity.db.spec.ts` (13) and 2 article-loader cases in `blog-pagination.spec.ts` (draft and trashed articles answer 404 with no cache headers).

#### Changed (2026-11-02)

- `savePostWithRedirect` retires any active redirect whose source is the slug being saved (a live post owns its URL), and aborts and rolls back with `REDIRECT_INTEGRITY` if the active redirect graph would contain a loop, cycle or chain.
- The redirect hook no longer serves a 301 whose target is unpublished, trashed or gone; the requested URL falls through to the router and answers 404.

### 2026-11-02 — Blog engine Phase 2: trustworthy modified date (G3)

Plan: [`blog-editor-report.md`](blog-editor-report.md) Part C, Phase 2.

#### Changed (2026-11-02)

- The modification date behind JSON-LD `dateModified`, RSS and sitemap `lastmod` is now `contentUpdatedAt`, else `publishedAt`, else none. It no longer falls back to `updatedAt` (moved by any row write) or `createdAt`.
- `contentUpdatedAt` now also moves when the excerpt or cover image changes (was title and body only). `updatePost` accepts `minorEdit: true` to save an editorial change without moving it; the editor UI toggle is not built yet.
- `dateModified` / `datePublished` are omitted when unknown instead of emitting `1970-01-01`. `updatedAt` is no longer sent to the public blog pages or read by the sitemap query.
- `ensureDbReady`, `createTestDatabase` and `scripts/seed-admin.ts` now apply every `drizzle/NNNN_*.sql` in order (was `0000` only).

#### Added (2026-11-02)

- `drizzle/0001_content_updated_at_backfill.sql`: forward-only, idempotent. Fills published posts with no editorial date from `published_at`; never-published rows stay NULL. **Not run against production** (needs owner authorization).
- Tests: `src/lib/server/db/modified-date.db.spec.ts` (featured toggle leaves the date alone while `updated_at` moves; body, title, excerpt and cover move it; minor edit; legacy row; backfill and its idempotence), `src/lib/shared/seo/modified-date.spec.ts`.

### 2026-11-02 — Blog engine Phase 1a: cache headers, tags, pagination and 404 handling

Plan and evidence: [`blog-editor-report.md`](blog-editor-report.md), [`docs/blog/COVERAGE_MATRIX.md`](docs/blog/COVERAGE_MATRIX.md), [`docs/blog/FRESHNESS.md`](docs/blog/FRESHNESS.md).

#### Added (2026-11-02)

- `src/lib/shared/blog/pagination.ts`, `src/lib/server/posts/cache-tags.ts`, `scripts/blog-coverage-probe.mjs`, `docs/blog/*`.
- Every public blog response carries a `Vercel-Cache-Tag` (`blog-post:<slug>`, `blog-lists`, `blog-feed`, `blog-sitemap`). `invalidatePublicBlogCache` maps invalidated paths to tags and calls a registered `BlogCachePurger` (none registered yet; purge failures are logged, never swallowed).

#### Changed (2026-11-02)

- Public `Cache-Control` is `s-maxage=300, stale-while-revalidate=60, stale-if-error=3600` (was `swr=86400`, `sie=86400`), so removed content can be served for at most about 6 minutes instead of up to 24 hours.
- Index, category and tag pages 2+ are indexable with their own `?page=n` canonical and a `(Page n)` title suffix (were `noindex` with no canonical). Search results stay `noindex`.
- Pagination links go through `pageHref`; page 1 always links to the bare URL.

#### Fixed (2026-11-02)

- `?page=` beyond the last page, or malformed (`abc`, `0`, `1.5`, `01`), returned HTTP 200 with no articles (soft 404); now 404, uncached.
- Unknown category and tag URLs returned a 404 with public cache headers, which Vercel's CDN caches; now uncached.

### 2026-11-02 — YMYL and launch-readiness hardening (`feat/ymyl-launch-hardening`)

Audit of the temporary Vercel deployment against a launch-readiness brief. Each item was checked against the built output, the live temp URL and Google/Vercel/SvelteKit primary sources first; what the evidence disproved was left alone and is listed in [`docs/seo/LAUNCH_TRACKER.md`](docs/seo/LAUNCH_TRACKER.md) §E.

#### Added (2026-11-02)

- **Launch gate** (`src/lib/data/launch-gate.ts`, `TEMPORARY` T10): `/store/*` and `/blog/*` are removed from the navigation, footer, homepage sections, sitemap, offer-catalog and homepage JSON-LD, and emit `noindex` with no canonical (`isNoIndexRoute`, store product pages, `buildBlogPageMetaTags`). `static/robots.txt` is unchanged on purpose (`docs/seo/DECISIONS.md` §5).
- **`VerifiedCaseStudy` + `isPublishableCaseStudy`** (`homepage.ts`, `TEMPORARY` T11): the homepage "receipts" section renders only fully documented trades (contract symbol, strike, expiration, entry/exit timestamps, size, maximum risk, result, 1200×675 chart with alt). There are none yet, so it does not render.
- **`vercel.json` headers:** `X-Robots-Tag: noindex, nofollow, noarchive` on hosts ending `.vercel.app` (prerendered pages never reach the `handle` hook), plus `X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`.
- **Footer "Risk Disclosure"** link to `/terms-of-service#options-leverage-risk-disclosure`; `id="institutional-mentorship"` on the About mentorship heading.
- `FOUNDER` in `src/lib/data/site.ts` (one name and title for the byline and the schema `Person`).
- Docs: `docs/seo/LAUNCH_TRACKER.md`, `docs/seo/DECISIONS.md` §5, `docs/SEO_EVIDENCE.md` rows 34-39.

#### Changed (2026-11-02)

- **Homepage copy is free of authoring text:** removed "Evidence publication pending", "PROOF PENDING", three "DOCUMENTATION PENDING" cards, the "SVELTE 5 / SVELTEKIT 3.1 ENTERPRISE BLUEPRINT" watermark, the "Preview route…" toast and its link interception (it also swallowed any `href` with a `#fragment`), and the footer sentence "…must be reviewed before launch." The hero panel now restates `/editorial-policy`; the founder's mentorship is worded as the founder's own account with a link to `/about#institutional-mentorship`; the CTA "See Track Record & Evidence" is "Meet the Founder".
- **Fonts:** `shouldPreload` in `src/hooks.server.ts` preloads 2 of 18 font files (upright Latin faces only). Lab result on a mobile profile, same machine, median of 5: LCP 1248 → 852 ms, CLS 0.0055 → 0, 18 → 3 font requests.
- **Logo:** `?w=360` on both `<enhanced:img>` (was a 3163 px source for a ~46 px box); `width="360" height="95"`, AVIF 5.9 KB (was 25–32 KB), `decoding="async"`.
- **Schema:** founder `Person` description no longer asserts mentorship or performance claims and its `jobTitle` matches the visible byline; Organization `contactPoint` adds `telephone`/`email` only from `SUPPORT_CONTACT` (empty today).
- Homepage HTML 141,988 → 107,481 bytes.

#### Removed (2026-11-02)

- The homepage eBook form, the announcement-bar eBook link and the footer eBook link are hidden (`FREE_EBOOK_AVAILABLE = false`): the form only validated and sent nothing, and the eBook does not exist.

#### Fixed (2026-11-02)

- **`/sitemap.xml` returned HTTP 500 on the deployed temp URL** because it queried a blog database that is not connected there. While `/blog` is gated it runs no blog queries. (`/blog` and `/rss.xml` still 500 there until `DATABASE_URL` is set; `LAUNCH_TRACKER.md` §A.)
- `/editorial-policy` heading said "Four Editorial Commitments" above three cards.
- Tests: updated for the gate and new copy (`homepage.spec.ts`, `HomeSections.svelte.spec.ts`, `blog-seo.spec.ts`, `blog-routes.spec.ts`, `page.svelte.e2e.ts`, `tests/seo/seo-standard.spec.ts`, `docs/seo/audit/02-inventory.json`); added `launch-gate.spec.ts`, the `shouldPreload` cases, and structured-data cases. `page.svelte.e2e.ts` `.reveal` floor 20 → 15 because three sections are gated (17 present).

### 2026-11-02 — Toolchain migrated to Vite+ (`vp`)

#### Changed (2026-11-02)

- **Vite+ 1.4.0 via `vp migrate --no-interactive --no-agent --no-editor --no-hooks`** (run from the repo root; no agent, editor or git-hook files written). `vite` and `vitest` now resolve through the pnpm catalog (`vite` → `@voidzero-dev/vite-plus-core@1.4.0`, `vitest` 5.0.5, `vite-plus` 1.4.0). Prerequisites met before migrating: Vite 8.3.5, Vitest 5.0.5, Node 26.13.0 (Vite+ requires `^22.18.0 || ^24.11.0 || >=26.0.0`).
- `vite.config.ts` imports from `vite-plus` and `vite-plus/test*`. Lint and format settings moved into its `lint` and `fmt` blocks. `dev`, `build`, `preview` and `test:unit` run through `vp`. `format` is `vp fmt .`.
- **Formatting moved from Prettier to Oxfmt.** `prettier.config.js` and the Prettier devDependencies were removed, and the same options live in the `fmt` block. Oxfmt changed union-type layout in 84 files; no code changed.
- Test files import `describe`/`expect`/`it` from `vite-plus/test`, and `page` from `vite-plus/test/browser`. Browser specs now `await render(...)`: `vitest-browser-svelte` 3.1.0 types `render` as returning a `Promise`, and the previous calls left that promise unhandled.
- `vite.config.ts` lint block: Oxlint type-aware rules on, TypeScript compiler diagnostics off (`typeCheck: false`). `pnpm check` (svelte-check) stays the type gate, as before the migration.
- **Vitest v4 and tsdown compatibility settings: none generated.** The migrator found nothing to insert in this project (no `pack` block, no Vitest v4 settings to add), so there were none to remove.

#### Kept (2026-11-02)

- **ESLint still lints `.svelte` files.** `eslint.config.js` and its devDependencies are restored, and `lint` runs `eslint "**/*.svelte"` after `vp lint`. Reason: Oxlint selects 109 `.svelte` files, but zero `svelte/*` rules are registered in `vp lint --rules`, and a probe `{@html}` file passed Oxlint while ESLint fails it with `svelte/no-at-html-tags`. Vite+'s lint guide does not document Svelte support, so the rules that enforce `svelte/no-navigation-without-resolve` (AGENTS.md) would have silently stopped. Revisit when Oxlint runs `eslint-plugin-svelte` rules on `.svelte` files.
- `eslint-disable` directives in `.svelte` files are unchanged; they are valid again because ESLint runs on them. The migrator converted the directives in three `.ts` files to `oxlint-disable` because Oxlint lints those files.

#### Fixed (2026-11-02)

- **Unsafe optional-chaining call in the `/store/indicators` spec.** `(closed?.querySelector('summary') as HTMLElement).click()` would throw a `TypeError` instead of failing an assertion when `closed` is null. It now asserts `closed` is not null, then clicks with `?.`.

#### Verified (2026-11-02)

- `pnpm lint`: exit 0 (formatting clean, Oxlint 0 errors, ESLint on `.svelte` 0 problems).
- `pnpm check` (svelte-check): 0 errors, 0 warnings, 2105 files. `vp check`: 0 errors, 48 warnings.
- `pnpm check:css`: 90 custom properties, all declared. `pnpm check:pages`: 47 prerendered pages pass.
- `pnpm run test:unit --run` (`vp test`): 375 of 375 tests pass across 63 files. The count matches the pre-migration run.
- `pnpm build` (`vp build`): passes.
- E2E against the built app on port 4174 (the port 4173 was held by another project's preview server, so the run used a temporary Playwright override that was then deleted): `test:seo` 3/3, full suite 30/30 with nothing skipped. Admin specs ran against the seeded local PGlite (`pnpm db:seed-admin`, `DATABASE_URL=pglite://local`).
- `pnpm install --frozen-lockfile`: lockfile up to date. `pnpm dev` (`vp dev`) served `/`, `/blog`, `/admin/login`, `/store/indicators`, `/resources` with 200, an unknown route with 404, and logged no errors.

#### Known warnings and gaps (2026-11-02)

- **48 Oxlint warnings remain, unchanged.** 39 are `no-base-to-string` on `unknown`/`Record<string, unknown>` values in `src/lib/components/admin/post-editor/form-actions.ts` (`hydrateFromFullPost`), `src/lib/server/services/*`, and `src/routes/blog/[slug]/+page.server.ts`. They are type-aware warnings for pre-existing code the old non-type-aware ESLint never checked. A typed hydration schema would remove them. Also: 2 `no-useless-fallback-in-spread`, 2 `no-misused-spread`, 1 `no-new-array`, 1 `no-empty-file` (`src/lib/index.ts`), 1 `no-duplicate-type-constituents`, 1 `no-redundant-type-constituents`, 1 `await-thenable`.
- `tests/` is outside `tsconfig.json` `include`, so its TypeScript is not type-checked, as before the migration.
- The build reports a chunk-size warning and a missing `@img/sharp-libvips-dev/cplusplus` module; not compared against a pre-migration build yet.
- The docs in `docs/NEW_PAGE_PLAYBOOK.md` now name the `vp` commands; the README's original scaffold command is historical and unchanged.

### 2026-11-01 — Local run verified as if deployed (production build with the real `.env`, and dev mode)

#### Verified (2026-11-01)

- Booted the app both ways (`vite preview` after a production build, and `vite dev`) with the real `.env`, and walked all 27 sitemap pages, an unknown URL, all 14 admin routes, and a real editor session in a browser (type a title and body, open every panel, add an FAQ item, save a draft, see it in the list, trash and permanently delete it). Console errors, page errors, failed requests and 4xx/5xx: none, apart from the deliberate 404 probe.

#### Fixed (2026-11-01)

- **Five public pages requested a founder photo from `https://revolutiontradingpros.com/wp-content/uploads/...`**, a legacy WordPress path this app does not serve (the host returned an HTML page for it), so the image failed on every product and alert page (`net::ERR_CERT_COMMON_NAME_INVALID` locally, a broken image after deploy). The four hard-coded URLs are replaced by one `FOUNDER_PORTRAIT` constant in `src/lib/data/site.ts` pointing at the square brand emblem (`/icon-512.png`) with an honest alt text. The real portrait is not in the repository and was not recreated; it is tracked as temporary item T9 in `docs/TEMPORARY.md`.
- Owner follow-up: the support phone `+1 (203) 721-0940` shown on the product pages (`supportPhone` in `src/routes/store/{indicators,courses,scanners}/[slug]/+page.svelte`) will be updated by the owner; `docs/seo/DECISIONS.md` and `SUPPORT_CONTACT` still publish no phone number.

### 2026-11-01 — Svelte MCP audit of all 113 Svelte files; admin shell and blog editor coherence pass

#### Audit (2026-11-01)

- Ran `svelte-autofixer` (Svelte 5) on every `.svelte` and `.svelte.ts` file in `src` (109 + 4): 0 issues. 9 files returned suggestions, all reviewed against the Svelte docs and left unchanged with reasons: the D3 sparkline/chart attachments and the inbox/leads deep-link effects only touch the DOM or defer a remote call behind a cleaned-up timer (no state is assigned in the effect); `ImageControlMenu` uses `untrack` as a deliberate edge trigger; the "unused `eslint-disable`" hint for `consent.svelte.ts` is wrong for this repo's ESLint config (removing it fails `prefer-rest-params`). One reported `await` issue in `about/+page.svelte` did not reproduce when re-run directly.
- The admin e2e tests that were skipped for lack of credentials now run against the seeded local admin (`docs/ADMIN_LOCAL_LOGIN.md`): 7 passed.
- Browser audit of all 15 admin routes at 1440 px and 4 at 390 px (console errors, failed requests, labels, overflow, targets).

#### Fixed (2026-11-01)

- **Every admin page showed the public home page title** ("Stock & Options Trading Rooms | ...") and the marketing description and Open Graph tags. `src/routes/+layout.svelte` now skips `<MetaTags>` for the whole `/admin` tree; `src/routes/admin/+layout.svelte` sets one title per page from its nav list (`Posts | Admin | Revolution Trading Pros`, `New post`, `Edit post`) plus `noindex, nofollow`.
- **Blog editor had no `<h1>`**: the "Add New Post" / "Edit Post" label in `PostEditorTopBar.svelte` is now an `<h1>`.
- **Charts drew full-height bars for zero data** (`SparkBar`, `SparkArea`, `KpiCard`): `max(data) ?? 1` left a degenerate `[0, 0]` domain when every value is 0 (d3 maps all values to mid-range; the old code drew bars of height 37 of 78). Now `|| 1`, and a true zero is a 1 px hairline. The dashboard's Lead Captures card shows "No leads captured in this period." instead of a chart when the period has no leads.
- **Dashboard KPI grid** orphaned the seventh tile ("Unread inbox"): seven columns on wide screens, four below 1280 px.
- **Checkboxes were 13x13 px** (post table selects, category/tag lists, robots flags, integrations): all admin checkboxes are now 24x24 (WCAG 2.2 SC 2.5.8), accent-coloured; the rich-text editor's own task boxes are untouched. The media grid's 20 px select box is 24 px.
- Post table Actions buttons no longer wrap onto a second line.
- Corrected a code comment in `+layout.svelte` that repeated the false "favicon multiple of 48px" claim.

#### Tests (2026-11-01)

- `src/lib/components/admin/SparkBar.svelte.spec.ts` (fails on the old code: height 37 for zero values).
- `src/routes/admin/admin-shell.e2e.ts`: per-page titles, robots and absent marketing meta, editor `<h1>`, checkbox sizes, Lead Captures empty state.

### 2026-11-01 — SEO audit prompt hardened (`seo-audit.md`)

#### Docs (2026-11-01)

- `seo-audit.md`: added evidence rules 11-16 (primary sources only, page through truncated fetches, nothing inherited is trusted, no residual †, built-output proof, agent must find defects itself), Phase 1B (audit every SEO document against Google, the changelog and the code), Phase 3e (adversarial sweep), a completion gate, and extra report sections. `AGENTS.md` §0, `SEO-Prompt.md` and `seo-verify.md` now point to them.

### 2026-11-01 — SEO markdown files re-verified against Google docs fetched 2026-11-01

#### Docs (2026-11-01)

- `docs/seo/SEO_STANDARD.md` (and its root copy `SEO_STANDARD.md`): every `G:` row re-fetched; corrected META-07 (favicon: no "multiple of 48px" rule), SD-04, SD-07, SD-08, SD-09, SD-10 (dated retirements; Speakable/Course-list still in gallery), SD-13 (`hasPart`/`cssSelector` are recommended, not required), IDX-05 (410 not special), IDX-07, IDX-12, SPAM-11 (Google's actual wording), section 11 header, MON-02 (primary source; unverified "June 2026 announcement" removed), MON-03; IDX-04 verified against installed `@sveltejs/kit` types.
- `docs/SEO_EVIDENCE.md`: rows 22-33 added, row 1 and row 14 corrected, §3 pruned.
- `docs/seo/DECISIONS.md`: Google-Extended citation fixed; FAQ date fixed; `/contact` description now matches the built page (no phone or mailing address).
- `docs/NEW_PAGE_PLAYBOOK.md`: template no longer shows a `FAQPage` or `Course` node. `docs/seo/OPERATIONS.md`: pre-launch data and preview-noindex checklist.

### 2026-11-01 — Removed request-header `noindex` switch from `handle` (IDX-09, security)

#### Security (2026-11-01)

- `isNonProductionHost` (`src/hooks.server.ts`) no longer honors the `x-seo-nonprod-test: 1` request header. On a CDN-cacheable SSR route (e.g. `/blog`, `Cache-Control: public, s-maxage=300`) any client could make the origin answer `X-Robots-Tag: noindex, nofollow` and have it cached for everyone. Nothing in `src`/`tests` used the header. Regression test: `src/hooks.server.spec.ts`.

### 2026-11-01 — AGENTS.md schema-type history corrected against fetched Google docs

#### Docs (2026-11-01)

- `AGENTS.md` §3.3: FAQPage/HowTo/Speakable/Course status restated from Google pages fetched 2026-11-01 (FAQ feature ended 2026-05-07; Speakable remains in the gallery as a beta feature).

### 2026-11-01 — Restricted schema types can no longer enter blog JSON-LD via custom JSON-LD (SD-10/SD-15)

#### Fixed (2026-11-01, verification pass)

- The admin `__customJsonLd` field could still inject `HowTo`/`FAQPage` (and other restricted types) into public post JSON-LD. `dropRestrictedJsonLdNodes` (`src/lib/seo/blog-seo.ts`) now filters them in `src/routes/blog/[slug]/+page.server.ts`; `blog-routes.spec.ts` previously asserted `HowTo` was emitted and now asserts it is dropped while an allowed type is kept.

### 2026-11-01 — Retired `HowTo` schema type removed from blog posts (SD-15)

#### Fixed (2026-11-01)

- `HowTo` is no longer selectable as a post Schema Type (`src/lib/shared/schemas/posts.ts`, `src/lib/shared/seo/autofill.ts`), and `buildBlogPostJsonLd` (`src/lib/seo/blog-seo.ts`) maps a legacy `HowTo` value to `BlogPosting`, so the retired type can no longer reach public JSON-LD. Regression test added in `src/lib/seo/blog-seo.spec.ts`.
- Corrected the admin FAQ note (`PostEditorMainColumn.svelte`), which wrongly claimed FAQPage markup is emitted; only the visible accordion is rendered.

### 2026-10-31 18:16 EDT (`2026-10-31T22:16:00Z`) — Complete `/dev/tc` Executive Backend Admin Dashboard Port (All 14 Sections, Services, Remote Functions, API Routes, D3 Charts & Audit Fixes)

#### Added (2026-10-31 18:16 EDT)

- **Complete `/dev/tc` Database Schema & Idempotent SQL Migration (`src/lib/server/db/schema.ts`, `drizzle/0000_blog_system.sql`, `src/lib/server/db/index.ts`, `src/lib/types/db.ts`)**:
  - Extended `page_views` (`pageViews`) with `user_agent`, `session_id`, and `country` columns and indexes (`page_views_session_id_idx`, `page_views_post_created_idx`).
  - Added all 29 `/dev/tc` backend tables, Drizzle relations, indexes, and exported row/insert types: `leads`, `contact_submissions`, `email_events`, `user_journeys`, `series`, `users`, `comments`, `webhooks`, `editorial_notes`, `site_settings`, `content_templates`, `admin_sessions`, `rate_limit_buckets`, `password_reset_tokens`, `auth_events`, `admin_notifications`, `click_events`, `click_events_hourly`, `notification_preferences`, `integration_connections`, `integration_test_runs`, `email_sequences`, `email_sequence_steps`, `email_enrollments`, `email_sends`, `email_suppressions`, `scheduled_calls`, `campaigns`, `campaign_variants`, and `campaign_events`, plus `consent_records`.
  - Seeded default admin row `id = 1` in `users` (`welberribeirodrums@gmail.com`, `role = 'admin'`) idempotently inside `drizzle/0000_blog_system.sql` so foreign keys referencing `users.id` resolve out of the box.
  - Added `batch<const U extends readonly PromiseLike<unknown>[]>(queries: U)` helper on `db` and `AppDatabase` in `src/lib/server/db/index.ts` for parallel multi-KPI dashboard and analytics queries.
- **Full 14-Section Collapsible Admin Shell & All Admin Route Modules (`src/routes/admin/**`)**:
  - Upgraded `src/routes/admin/+layout.svelte` to the `/dev/tc` collapsible sidebar shell (`224px` expanded / `60px` rail collapsed, persisted in `localStorage['admin-sidebar-collapsed']`) with grouped navigation across all 14 admin sections (`Overview`: Dashboard; `Content`: Posts, Media; `Audience & CRM`: Leads, Subscribers, Sequences, Email Analytics, Calls, Inbox, Notifications; `System`: Analytics, Consent, Campaigns, Integrations), mobile drawer, `AdminNotifications` bell popover, `ConfirmDialogHost`, `Toast`, and Better Auth sign-out.
  - Replaced `src/routes/admin/+page.svelte` with the full `/dev/tc` Executive Overview Dashboard (7-day/30-day/90-day range selector, 6 `KpiCard` tiles with D3 sparklines, `D3AreaChart` traffic & lead velocity, `D3FunnelChart` conversion funnel, `D3DonutChart` lead status & traffic sources, `D3HeatmapCalendar` publishing & lead cadence, `D3BarList` top posts & top click targets, and live recent leads & contact inbox tables).
  - Added `/admin/leads` (`src/routes/admin/leads/+page.ts`, `+page.svelte`) — CRM pipeline with status filters, search, bulk actions, lead detail drawer, notes, Resend delivery timeline, and CSV export.
  - Added `/admin/subscribers` (`src/routes/admin/subscribers/+page.ts`, `+page.svelte`) — newsletter subscriber management, status filtering, and CSV export.
  - Added `/admin/sequences` (`src/routes/admin/sequences/+page.ts`, `+page.svelte`, `[id]/+page.ts`, `[id]/+page.svelte`) — automated drip email sequence builder, step editor, enrollment inspector, and suppression manager.
  - Added `/admin/email-analytics` (`src/routes/admin/email-analytics/+page.ts`, `+page.svelte`) — Resend delivery, open, click, bounce, and cohort retention analytics.
  - Added `/admin/calls` (`src/routes/admin/calls/+page.ts`, `+page.svelte`) — Calendly scheduled calls pipeline, status management, and CSV export.
  - Added `/admin/inbox` (`src/routes/admin/inbox/+page.ts`, `+page.svelte`) — contact form submission inbox, status workflow, and reply actions.
  - Added `/admin/notifications` (`src/routes/admin/notifications/+page.server.ts`, `+page.svelte`) — real-time admin notification center and per-category notification preferences.
  - Added `/admin/analytics` (`src/routes/admin/analytics/+page.ts`, `+page.svelte`) — unified site traffic, click tracking, Google Search Console, and user journey analytics.
  - Added `/admin/consent` (`src/routes/admin/consent/+page.ts`, `+page.svelte`) — GDPR/CCPA cookie consent audit log, breakdown charts, and CSV export.
  - Added `/admin/campaigns` (`src/routes/admin/campaigns/+page.ts`, `+page.svelte`, `[id]/+page.ts`, `[id]/+page.svelte`) — promotional campaign & A/B variant manager with conversion attribution.
  - Added `/admin/integrations` (`src/routes/admin/integrations/+page.ts`, `+page.svelte`) — encrypted third-party integration credentials manager (Resend, Calendly, Google Search Console, IndexNow, webhooks) with live connection test runner.
- **Admin D3 Visualization Suite & Shared UI Components (`src/lib/components/admin/**`, `src/lib/components/**`)**:
  - Added `AdminNotifications.svelte`, `ChartCard.svelte`, `CollapsibleMetaBox.svelte`, `ConfirmDialogHost.svelte`, `D3AreaChart.svelte`, `D3BarList.svelte`, `D3DonutChart.svelte`, `D3FunnelChart.svelte`, `D3HeatmapCalendar.svelte`, `KpiCard.svelte`, `Skeleton.svelte`, `SparkArea.svelte`, `SparkBar.svelte`, `action-error.ts`, `SEO.svelte`, and `Toast.svelte`.
- **Complete Backend Services, Remote Functions & API Endpoints (`src/lib/server/services/**`, `src/lib/remote/**`, `src/routes/api/**`)**:
  - Added 22 server services in `src/lib/server/services/`: `analytics-unified.ts`, `analytics.ts`, `campaigns.ts`, `click-tracking.ts`, `consent-ip.ts`, `consent.ts`, `contacts.ts`, `dashboard.ts`, `email-analytics.ts`, `email-cohort.ts`, `email-sequences.ts`, `google-search-console.ts`, `indexnow.ts`, `integrations.ts`, `lead-email.ts`, `leads.ts`, `metrics.ts`, `notification-preferences.ts`, `notifications.ts`, `scheduled-calls.ts`, `search-engines.ts`, and `search.ts`.
  - Added server infrastructure modules: `src/lib/server/{logger,background,auth-guards,service-errors,api-response,audit-log,unsubscribe-ingress}.ts`, `src/lib/server/config/runtime.ts`, `src/lib/server/analytics/{path-filter,ingest}.ts`, `src/lib/server/integrations/{crypto,providers}.ts`, `src/lib/server/email/{lead-welcome,sequence-step,unsubscribe-request,unsubscribe-signature,unsubscribe-token}.ts`, and `src/lib/server/assets/finance-checklist-pdf-base64.ts`.
  - Added 14 SvelteKit remote function modules in `src/lib/remote/{contact,lead}.remote.ts` and `src/lib/remote/admin/{analytics,calls,campaigns,consent,contacts,dashboard,email-analytics,integrations,leads,notifications,sequences,subscribers}.remote.ts`.
  - Added 17 API endpoints under `src/routes/api/`: `/api/admin/events`, `/api/admin/leads`, `/api/admin/leads/[id]`, `/api/admin/notifications/head`, `/api/campaign-events`, `/api/campaigns/active`, `/api/consent`, `/api/cron/analytics-daily`, `/api/cron/analytics-weekly`, `/api/cron/send-sequence-emails`, `/api/health`, `/api/lead`, `/api/page-view`, `/api/track/click`, `/api/unsubscribe`, `/api/webhooks/calendly`, and `/api/webhooks/resend`.
  - Added shared Valibot schemas (`src/lib/shared/schemas/{analytics,auth,calls,campaigns,categories,click-events,consent,contacts,integrations,lead,leads,notifications,sequences,subscribers,tags}.ts`), stores (`src/lib/stores/{confirm,consent,theme,toast}.svelte.ts`), utilities (`src/lib/shared/{campaigns,safe-href}.ts`, `src/lib/utils/{http-error,notification-time}.ts`, `src/lib/attachments/focusTrap.ts`), and site config (`src/lib/config/{env,site,index}.ts`).

#### Fixed (2026-10-31 18:16 EDT)

- **Resend Webhook Sequence Email Attribution (`[DATA-1]` from `/dev/tc` Audit)**:
  - Fixed `POST /api/webhooks/resend` (`src/routes/api/webhooks/resend/+server.ts`) so that when `data.email_id` does not match `leads.resendMessageId` (e.g., drip sequence emails recorded in `email_sends`), the webhook falls back to looking up `emailSends.resendMessageId` -> `emailEnrollments.leadId` before inserting into `emailEvents`, preventing silent loss of sequence email open/click/bounce events.
- **CSV Export Formula-Injection Sanitization (`[SEC-5]` from `/dev/tc` Audit)**:
  - Hardened `escapeCsv` in `src/lib/server/services/{leads,email-sequences,scheduled-calls,consent}.ts` to prefix values starting with `=`, `+`, `-`, `@`, `\t`, or `\r` with a leading single quote (`'`) and wrap in double quotes, neutralizing spreadsheet formula injection when opening exported CSVs in Excel or Google Sheets.
- **Reactive D3 Chart & Sparkline Re-Rendering (`[UI-1]` from `/dev/tc` Audit)**:
  - Fixed `src/lib/components/admin/D3AreaChart.svelte` and `src/lib/components/admin/KpiCard.svelte` by reading reactive props (`data`, `sparkData`, `height`, `color`) at the top of the `{@attach}` callback before the `ResizeObserver` setup so Svelte 5 re-runs the D3 render whenever chart data updates without waiting for a DOM resize event.
- **Better Auth Principal Bridge & Request Context (`src/lib/server/auth-guards.ts`, `src/hooks.server.ts`, `src/app.d.ts`)**:
  - Bridged Better Auth's `event.locals.user` (`role === 'admin'`) to `/dev/tc`'s `Principal` interface (`id: 1`, `userId: 1`, `isAdmin: true`) in `src/lib/server/auth-guards.ts` and populated `event.locals.reqId` and `event.locals.logger` in `src/hooks.server.ts`.

### 2026-10-31 17:08 EDT (`2026-10-31T21:08:00Z`) — End-to-End Admin Dashboard, RichTextEditor, TOC & Public Blog Hardening (Phases 1–6)

#### Added (2026-10-31 17:08 EDT)

- **Idempotent 40-Article Markdown Blog Importer (`[NRW-CONTENT-1]`)**:
  - Moved all 40 production Markdown blog posts (`blog-post-01-*.md` through `blog-post-40-*.md`) from the repository root into `content/blog-posts/`.
  - Added `scripts/import-markdown-posts.ts` and `"db:import-posts": "node --env-file-if-exists=.env scripts/import-markdown-posts.ts"` in `package.json` (supports `--dry-run` to validate parsing without DB writes and `--publish` to import as `'published'`, defaulting to `'draft'` while preserving existing `'published'` rows).
  - Parses Markdown frontmatter metadata (`Slug`, `Meta Title`, `Meta Description`, `Excerpt`, `Focus Keyword`, `Secondary Keywords`, `Category`, `Tags`, `Schema Type`, `Is Pillar`, `Cover Image`, `Cover Image Alt`, `Cover Image Caption`), converts the Markdown body and FAQ blocks into sanitized HTML (`sanitizePostHtml`) and structured `faqItems` JSON, normalizes H2/H3 headings and extracts `tableOfContents` (`normalizePostHeadings`), computes `wordCount` and `readingTime`, and upserts authors, categories, tags, and posts idempotently.
- **Full-Table Sitemap Blog Query (`[NRW-SEO-2]`)**:
  - Added `listSitemapBlogEntries()` in `src/lib/server/services/posts.ts` to select `slug`, `updatedAt`, `contentUpdatedAt`, `publishedAt`, `coverImage`, `coverImageAlt`, and `title` for all publicly visible, indexable blog posts in a single lightweight query without a 50-post pagination cap.
- **Interactive Admin Sidebar TOC Jump (`[NRW-TOC-5]`)**:
  - Upgraded the Table of Contents preview inside `src/lib/components/admin/PostEditorSidebar.svelte` from static `<span>` items to interactive `<button type="button" class="toc-preview-btn">` elements that scroll the corresponding heading inside `.rich-text-editor-prosemirror` into view and briefly highlight it.
- **Public Article `Updated <date>` Badge (`[NRW-SEO-7]`)**:
  - Added a visible `Updated <date>` `<time>` element in `src/routes/blog/[slug]/+page.svelte` whenever `post.contentUpdatedAt` is at least 60 seconds newer than `post.publishedAt`, matching the `dateModified` emitted in the article's Schema.org JSON-LD.

#### Changed (2026-10-31 17:08 EDT)

- **Unified `/blogs` -> `/blog` Architecture (`[NRW-SEO-1]`, closes `T5` in `docs/TEMPORARY.md`)**:
  - Updated `resolveBlogRedirect` in `src/hooks.server.ts` so `/blogs` 308-redirects to `/blog` and `/blogs/<slug>` 308-redirects to `/blog/<slug>` (while still consulting `post_redirects` first).
  - Updated `handleApp` in `src/hooks.server.ts` to call `await ensureDbReady()` (when `!building`) before `auth.api.getSession(...)`, preventing `relation "session" does not exist` on first request to non-blog routes when a fresh local PGlite database is initialized.
  - Updated primary navigation, footer, homepage, mission page, and resource hub blog links in `src/lib/data/homepage.ts`, `src/lib/data/homepage.spec.ts`, `src/lib/components/home/BlogSection.svelte`, `src/routes/+page.svelte`, `src/routes/our-mission/+page.svelte`, `src/lib/data/resources-hub.ts`, and `src/routes/page.svelte.e2e.ts` to point directly to `/blog`.
- **Restore Trashed Posts as `'draft'` (`[NRW-BE-6]`, Owner Decision A3)**:
  - Updated `restoreTrashedPost` in `src/lib/server/services/posts.ts` to restore trashed posts with `status: 'draft'` and `published: false` (instead of immediately re-publishing to the live site) and to recompute `wordCount`, `readingTime`, and `tableOfContents` (`JSON.stringify(toc)`) on restore.
- **TypeScript Configuration & Native Node 26 Script Imports**:
  - Added `"scripts/**/*.ts"` to `tsconfig.json` `include` so `pnpm check` (`svelte-check`) typechecks all TypeScript scripts under `scripts/`.
  - Added explicit `.ts` extensions to relative imports in `src/lib/server/db/index.ts`, `src/lib/server/db/schema.ts`, and `src/lib/server/posts/visibility.ts` for compatibility with Node 26 native TypeScript execution.

#### Fixed (2026-10-31 17:08 EDT)

- **Password-Protected Post Updates (`[NRW-BE-1]`)**:
  - Fixed `applyPostLifecycleRefinements` in `src/lib/shared/schemas/posts.ts` by introducing `{ requirePasswordWhenProtected?: boolean }`. `postCreateSchema` still requires a non-empty password (`>= 4` chars) when `visibility === 'password_protected'`, whereas `postUpdateSchema` and `postPatchSchema` allow omitting `password` to preserve the existing stored `passwordHash` in `posts.ts` (while still rejecting explicitly short passwords or `clearPassword: true` while remaining `password_protected`).
  - Updated `src/lib/components/admin/PostEditorSidebar.svelte` so checking "Clear existing password" automatically resets `form.visibility` to `'public'`.
  - Added unit test coverage in `src/lib/shared/schemas/posts.spec.ts`.
- **Scheduled Featured Post Promotion Transaction (`[NRW-BE-2]`)**:
  - Fixed `promoteDueScheduledPosts` in `src/lib/server/services/cron.ts` by wrapping each scheduled-to-published promotion inside a `db.transaction` that demotes any existing published `featured = true` posts before promoting a due scheduled post with `featured = true`, preventing unique index violations (`23505`) on `posts_single_live_featured_idx`.
  - Added integration test coverage in `src/lib/server/services/posts.db.spec.ts`.
- **Pageview Analytics Table Separation (`[NRW-BE-3]`)**:
  - Fixed `POST /api/analytics/pageview` (`src/routes/api/analytics/pageview/+server.ts`) to insert into `pageViews` (`page_views`) instead of `audit_log`, with 5-second per-IP+post deduplication so public traffic cannot pollute admin audit history.
- **Admin Unsaved-Changes Navigation Guard & New-Post `goto()` Race (`[NRW-UI-1]`, `[NRW-UI-2]`, `[NRW-UI-3]`)**:
  - Registered SvelteKit `beforeNavigate` inside `src/lib/components/admin/PostEditor.svelte` (wrapped in a `try/catch` for standalone component unit tests) to prompt before SPA link navigation when `isDirty` is true, and added `allowProgrammaticNavigation` bypass for intentional post-save redirects.
  - Fixed the competing double-`goto()` race in `persistForm` and `publishNow` when saving or publishing a new post from `/admin/posts/new` (`isNew` transitioned from `/admin/posts/${saved.id}` or `/admin/posts`).
- **Client-Server SEO Score Parity (`[NRW-UI-4]`)**:
  - Updated `seoResult` `$derived.by` in `src/lib/components/admin/PostEditor.svelte` to pass the current form state through `applyPostAutofill` before calling `getSeoScore`, ensuring the live client SEO score and checklist match the server's `enforcePublishSeoGate` calculation 1-to-1 even when `metaTitle`, `metaDescription`, `excerpt`, or `slug` rely on autofill.
- **Public Article TOC Scroll-Spy, Sticky Overflow & Smooth-Scroll Polish (`[NRW-TOC-1]`, `[NRW-TOC-2]`, `[NRW-TOC-3]`)**:
  - Replaced `el.offsetTop <= scrollTop + 150` with viewport-relative `el.getBoundingClientRect().top <= 150` in `src/routes/blog/[slug]/+page.svelte` so active TOC highlighting stays accurate regardless of offset parent positioning.
  - Added `max-height: calc(100vh - 120px); overflow-y: auto; overscroll-behavior: contain;` to `.article-toc-aside` at `min-width: 1180px` in `src/routes/blog/[slug]/+page.svelte` so long TOCs remain scrollable on desktop viewports.
  - Updated `scrollToHeading` in `src/routes/blog/[slug]/+page.svelte` to honor `prefers-reduced-motion: reduce`, sync the URL hash via `history.replaceState(null, '', '#...')`, and auto-close the mobile `<details class="toc-mobile">` disclosure when a TOC item is selected.
- **Deterministic UTC Date Formatting (`[NRW-SEO-3]`)**:
  - Added `timeZone: 'UTC'` to `Intl.DateTimeFormat` in `src/routes/blog/[slug]/+page.svelte` and `src/lib/components/blog/PostCard.svelte` to prevent hydration date-shift mismatches between UTC servers and negative-offset client timezones.
- **RichTextEditor Selection Performance, Bubble Bar & Popover Accessibility (`[NRW-UI-5]`, `[NRW-UI-7]`, `[NRW-UI-8]`)**:
  - Updated `refreshToolbarState(ed, recountContent)` in `src/lib/components/admin/RichTextEditor.svelte` so `onSelectionUpdate` only refreshes toolbar active states without calling `ed.getHTML()` and regex word counting on every cursor movement (`recountContent = true` runs only on `onCreate` and `onUpdate`).
  - Added `Strike`, `Code`, `Link (⌘K)`, and `Clear` formatting buttons to `.selection-bubble-bar` in `src/lib/components/admin/RichTextEditor.svelte`.
  - Added `aria-haspopup="dialog"` to toolbar popover triggers and a window `Escape` key handler that closes open toolbar popovers (`showLinkPopover`, `showColorPopover`, `showTablePopover`, `showCalloutPopover`, `showEmbedPopover`, `showTocConfigPopover`) and returns focus to the editor.
- **Structured RPC Error Surfacing on `/admin/posts` (`[NRW-UI-6]`)**:
  - Updated all catch blocks in `src/routes/admin/posts/+page.svelte` (`runFilter`, `handleDeleteConfirm`, `handleRestore`, `handlePermanentDeleteConfirm`, `runBulkAction`) to format errors via `rpcErrorMessage(err, fallback)`.
- **ConfirmDialog Focus Trap (`[NRW-UI-9]`)**:
  - Added `Tab` / `Shift+Tab` keyboard focus-trap cycling across focusable elements inside `src/lib/components/admin/ConfirmDialog.svelte`.
- **Multi-Field Revision Diffs (`[NRW-UI-10]`)**:
  - Enhanced `src/lib/components/admin/RevisionDiffViewer.svelte` with `All | Content | Title | Excerpt` diff tabs, `+added / -removed` word delta badges, and `htmlToStructuredText` conversion that preserves `[IMAGE: alt (src)]` and `[LINK: href]` structural markers in diffs.
- **MediaLibrary Explicit Alt Text Contract (`[NRW-UI-11]`)**:
  - Removed the `|| selectedItem.title` fallback in `handleInsert` inside `src/lib/components/admin/MediaLibrary.svelte` so inserting an image with empty `altText` stays `''` and triggers the editor's explicit alt-text warning.
- **Sitemap & RSS Feed Query Optimization (`[NRW-SEO-2]`, `[NRW-BE-4]`)**:
  - Wired `src/routes/sitemap.xml/+server.ts` to `listSitemapBlogEntries()`.
  - Updated `src/routes/rss.xml/+server.ts` to filter `media` rows with `inArray(media.blobUrl, coverUrls)` instead of loading the entire `media` table into memory.
- **Retired `SearchAction` Schema Removal (`[NRW-SEO-4]`)**:
  - Removed the retired `potentialAction` (`SearchAction`) block from `buildBlogWebsiteEntity` in `src/lib/seo/blog-seo.ts` per Google's Sitelinks Search Box retirement (`docs/SEO_EVIDENCE.md`).

#### Security (2026-10-31 17:08 EDT)

- **Password-Unlock Cookie Scope (`[NRW-BE-5]`)**:
  - Changed the `rtp_post_unlock_<id>` cookie `path` from `'/'` to `'/blog'` in `src/routes/blog/[slug]/+page.server.ts`.
- **Production Auth, Preview Token & Seed Password Hardening (`[NRW-BE-7]`)**:
  - Set `disableSignUp: process.env.NODE_ENV === 'production'` in `src/lib/server/auth-options.ts` so public Better Auth email/password sign-up is disabled in production while remaining enabled in local/dev for `scripts/seed-admin.spec.ts`.
  - Updated `seedPreviewBaselineIfEmpty` in `src/lib/server/db/index.ts` to store `hashPostPassword('AlphaDesk2026!')` (scrypt) instead of plaintext `'AlphaDesk2026!'`.
  - Updated `getDraftPreviewSecret` in `src/lib/server/posts/visibility.ts` to throw in production when `BETTER_AUTH_SECRET` is missing or shorter than 16 characters instead of falling back to a hardcoded dev string.

#### Removed (2026-10-31 17:08 EDT)

- **Deprecated Static Mock `/blogs` Route (`[NRW-SEO-1]`, `T5`)**:
  - Deleted `src/routes/blogs/+page.svelte`, `src/routes/blogs/+page.ts`, `src/routes/blogs/page.svelte.spec.ts`, `src/lib/data/blog-hub.ts`, `src/lib/components/blog/BlogCard.svelte`, `src/lib/components/blog/BlogCard.svelte.spec.ts`, and `static/blog-mocks/*.svg`.

#### Docs (2026-10-31 17:08 EDT)

- Updated `docs/TEMPORARY.md` (marked `T5` as `removed`), `docs/AGENT_COORDINATION.md` (recorded session completion and verification summary), and `CHANGELOG.md`.

### Added (Earlier)

- Editor images (parity with the reference app): floating `ImageControlMenu` (alignment incl. Full width, width presets that keep the aspect ratio, alt, title, caption, Replace image through the media picker, Remove), keyboard and touch usable; an editor-only "Add alt text" chip and dashed outline on every image with empty alt (`src/lib/tiptap/image-alt-warning.ts`, never saved); the Featured Image panel is its own component (`FeaturedImagePanel.svelte`: saved-URL preview with real dimensions when picked, load-failure alert, required-alt indicator, Remove). Pure helpers in `src/lib/tiptap/image-actions.ts`, `post-editor/image-pick.ts`, `src/lib/shared/cover-srcset.ts`. Specs: `ImageControlMenu.svelte.spec.ts`, `RichTextEditor.images.svelte.spec.ts`, `image-actions.svelte.spec.ts`, `FeaturedImagePanel.svelte.spec.ts`, `image-pick.spec.ts`, `cover-srcset.spec.ts`, and cover cases in `blog-routes.spec.ts`.
- Media picker (`MediaLibrary.svelte`): XHR upload with per-file progress (`<progress>`), unique queue ids (fixes the duplicate-key error for same-named files), drag and drop onto the Library tab, multi-select with shift-range, bulk move and bulk delete via the single-item endpoints with bounded concurrency and per-item failure reporting (409 in-use lists the posts), focus restore to the opener, persistent live regions, arrow-key grid navigation, stale list responses ignored. Split into `MediaModalHeader`, `MediaToolbar`, `MediaBulkBar`, `MediaGrid`, `MediaSidebar`, `MediaUploadPanel`, `MediaUploadQueue`, `media-client.ts`, `media-library.css`; props and `MediaInsertPayload` unchanged. Contract: docs/MEDIA_UI_CONTRACT.md. Specs: `MediaLibrary.svelte.spec.ts`, `media-client.spec.ts`.
- Media cover crops: uploads store 16x9, 4x3 and 1x1 WebP crops (>= 50,000 px, never upscaled) in `variants_json` (`kind: 'crop'`); `getMediaCropsForUrl` and `buildBlogPostJsonLd({ coverImageCrops })` emit an Article `image` ImageObject array; the backfill script adds crops to existing media. See docs/MEDIA_STORAGE.md and docs/MEDIA_UI_CONTRACT.md.
- `TEMPORARY` Persistent local disk media storage (T8): `src/lib/server/media-storage.ts` holds the Vercel Blob driver and a
  disk driver (`.data/media`, atomic writes, strict path-traversal checks, absolute `<ORIGIN>/media/<path>` URLs because post
  image fields require absolute URLs); `selectMediaStorageDriver(env)` picks Blob with `BLOB_READ_WRITE_TOKEN`, disk in
  development, and THROWS on Vercel/production without a token unless `MEDIA_STORAGE=disk`. New `GET|HEAD /media/[...path]`
  route (allow-listed image types, immutable cache, nosniff, weak ETag/304, locked-down CSP on SVG; 404 unless the disk driver
  is active). Env keys `BLOB_READ_WRITE_TOKEN` and `MEDIA_STORAGE` documented in `.env.example` and `src/env.ts`.
  How-to: `docs/MEDIA_STORAGE.md`. Specs: `media-storage.spec.ts`, `media-route.spec.ts`, `media-pipeline.db.spec.ts`.
- `TEMPORARY` `pnpm db:seed-admin` (`scripts/seed-admin.ts`): creates or repairs a local admin account from
  `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`; `--reset-password` and `--revoke`; refuses when `NODE_ENV=production`
  or `VERCEL` is set unless the database is the local PGlite file; never prints the password. Registered as T2.
  Spec: `scripts/seed-admin.spec.ts`. How-to: `docs/ADMIN_LOCAL_LOGIN.md`.
- `.env.example`: `TEMPORARY` placeholder keys `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD`.
- Admin sign-in at `/admin/login` (P2): form action on Better Auth `signInEmail`; generic
  "Email or password is incorrect." message; rate limit per client IP and per hashed email (`consumeRateLimit`);
  non-admin accounts get 403 and their session is revoked; `next` is accepted only through `safeAdminNext()`
  (`src/routes/admin/login/safe-next.ts`, open-redirect rules documented there). Specs:
  `safe-next.spec.ts`, `admin-access.spec.ts`, `login-page.svelte.spec.ts`.
- Admin shell (P2): `src/routes/admin/+layout.server.ts` redirects anonymous visitors to login (303, `next` kept),
  returns 403 for non-admins, and sends `X-Robots-Tag: noindex, nofollow` on every `/admin/**` page. `+layout.svelte`
  adds a skip link, nav (Dashboard, Posts, Media, View site) with `aria-current`, and a POST sign-out form
  (`src/routes/admin/logout/+server.ts`).
- Admin dashboard (P2) at `/admin`: counts of drafts, scheduled, published, trashed (plus in review and archived so the
  totals add up), and the five most recently updated posts, computed from `listAdminPosts` and `listTrashedPosts`.
  Quick links: New post, All posts, Media.
- E2E: `src/routes/admin/image-flow.e2e.ts` drives the owner image flow through the real UI (login, upload a generated PNG, featured + inline image, publishing checklist, Save Draft, reload, Publish, public cover/srcset/og:image/JSON-LD crops/sitemap) and deletes everything it created. `playwright.config.ts` webServer now sets `ORIGIN=http://localhost:4173` and `MEDIA_STORAGE=disk` for the preview. Found by it and fixed: `requireAdmin` no longer reads `event.url` on POST (it threw `remote_request_property` inside queries refreshed by a command's single-flight response, so the refresh silently failed and the client refetched); the CSRF host now comes from `event.request.url` (spec in `auth-guard.spec.ts`).

### Changed

- Better Auth options shared by `src/lib/server/auth.ts` and the seed script now live in
  `src/lib/server/auth-options.ts` (`userAdditionalFields`, `emailAndPasswordOptions`). Behaviour unchanged.

### Fixed

- Sitemap: stop emitting the deprecated `<image:title>` (Google removed it from the image sitemap docs, `docs/SEO_EVIDENCE.md` row 18); `<image:loc>` only.
- `requireAdmin` no longer reads `event.url` inside remote queries (it threw `remote_request_property`, 500 on slug checks and query refreshes).
  (editor and public images)

- Alt text is never invented: the editor no longer stores `Article image` (or the filename or media title) as alt; an empty alt stays empty, is flagged in the editor and blocks publishing through the existing `missing_cover_alt` rule (cover). The picker's title fallback is dropped in the editor wiring (`pickedAlt`).
- The picker's "Full Width" alignment was silently dropped by the editor and the sanitizer; it is now stored as `data-align="full"`, survives server sanitisation and renders full width on the public post (rules already in `prose.css`). Image `title` now survives sanitisation (plain text, 300 chars max).
- Width presets changed only `width`, leaving a stale `height`; they now set both from the real aspect ratio (100% restores the natural size).
- Image insert used `setImage(...).updateAttributes(...)`, which lost the extra attributes when the selection was not on the new node; images are now inserted with all attributes in one `insertContent`.
- Public cover `srcset` listed a `-1200w` file that does not exist for originals narrower than 1200 px. It is built from the media row's real files (capped at the chosen cover, crops skipped), with the `-{w}w.webp` naming rule as fallback (also used by `PostCard`).
- Public cover `width`/`height` are the stored media dimensions; when unknown the attributes are omitted instead of claiming 1200x675.
- Body images no longer get `/ decoding="async"` (attributes appended after the self-closing slash).
- The Featured Image panel previews the saved URL, defaults to the `large` (1200w) variant, and shows an error when the URL does not load.

### Fixed (media server)

- Uploaded images were saved as rows with a fake `https://revolutiontradingpros.com/media/...` URL backed by an in-process
  `Map` that nothing served and that was lost on restart; the Map and `getLocalBlobBuffer` are removed.
- Variant uploads used `Promise.all`, so a failed put orphaned the puts that had succeeded; now `allSettled`, the successful
  blobs are deleted and the original error is rethrown (upload fails with 500, no row).
- An audit-log (or folder registry) failure after a successful insert deleted the blobs of the already-saved row; those writes
  now log with `console.error` and the row and blobs are kept.
- Restore after delete resurrected rows whose files were already deleted. Decision: restore is refused with 409
  `MEDIA_RESTORE_UNAVAILABLE` because `deleteMediaItem` deletes the blobs first (same as a permanent delete, Section 9.5);
  keeping blobs on soft delete would orphan storage forever (no purge job). Re-upload instead.
- `toRestErrorResponse`/`throwRpcServiceError` no longer return raw exception text on 500 and now `console.error` the error.
- Backfill script reads `/media/...` sources through the disk driver (no network fallback; a missing file is an error).

### Fixed (P4: publishing through `/admin`, verified in a browser)

- A refused publish now shows its reasons. The SEO gate refusal (`SEO_GATE_BLOCKED`) is parsed into one list item per
  issue (blocking items marked, then warnings) in a `role="alert"` box at the top of the editor, focus moves to it, and
  the SEO panel opens. Before, the reason was a raw multi-line string at the top of the page, out of view from the
  Publish button, and the SEO panel's issue list sat in a hidden tab. `src/lib/components/admin/post-editor/publish-gate.ts`
  (spec: `publish-gate.spec.ts`); `PostEditorMainColumn.revealSeoPanel()`.
- The gate's error text no longer labels non-blocking errors as "Blocking errors": items are marked `[BLOCKING]` where
  they stop publishing on their own (`src/lib/shared/seo/score.ts`, `enforcePublishSeoGate`).
- Publish button label: an existing draft showed "Update and close", but that button publishes. Drafts now show
  "Publish" (top bar, sidebar, mobile bar). "Update and close" is shown only for a published post.
- Server errors from author, category, tag and other remote calls showed a generic "Failed to ..." message because the
  remote error is not an `Error` instance. The server message is now shown (e.g. `Author slug "x" already exists.`) via
  `post-editor/rpc-error.ts` (spec: `rpc-error.spec.ts`).
- Login email field: `value=` was replaced by `defaultValue=` so hydration no longer clears an email typed before
  JavaScript loaded. Before, the cleared required field blocked the native submit (no POST). `/admin/login`.

### Removed

- `/demo/better-auth` scaffold (`TEMPORARY` T6, now `removed`): it had a public sign-up form and linked to a
  non-existent `/auth/verification-success`. Replaced by `/admin/login`. The `/demo` index no longer lists it.

### Docs

- Add `docs/ADMIN_AUTH_PLAN.md`: evidence-based audit of the admin/auth/blog backend and the phased plan
  to make `/admin` reachable (Better Auth login, temporary admin account). (docs/admin-auth-plan)
- Add `docs/TEMPORARY.md` (registry of temporary code, credentials and bypasses with removal criteria)
  and `docs/AGENT_COORDINATION.md` (multi-session protocol and active-work board).
- Add this `CHANGELOG.md`.

### Security (see `docs/ADMIN_AUTH_PLAN.md` section 2)

- F2 fixed: Better Auth now exposes `user.role` (`additionalFields`, `input: false`), so `requireAdmin` accepts real admins.
  `App.Locals.user` is typed from `auth.$Infer`. Regression test: `src/lib/server/auth-role.db.spec.ts`.
- F3 fixed: removed the `x-rtp-e2e-test` header bypass from `src/hooks.server.ts` (`TEMPORARY` T1, now `removed`). Admin e2e
  tests log in through `/admin/login` and skip when `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` are unset.
- F5 fixed: `requireAdmin` now runs the CSRF origin check on every non-GET/HEAD/OPTIONS request, so a mutation with neither
  `Origin` nor `Referer` gets 403. Unit tests: `src/lib/server/auth-guard.spec.ts`.

## [0.1.0-pre] - 2026-10-30 to 2026-10-31

Entries reconstructed from `git log` (merged PRs #1 to #6), not written at the time.

### Added

- Dynamic blog system and admin dashboard (TipTap editor, SEO tools, media library) - `350e8c7`.
- `CatalogCard` shell and `CourseCard`, `IndicatorCard`, `BlogCard` (PR #4, #6).
- SEO evidence log, new-page playbook, CSS standards docs.

### Changed

- `@sveltejs/kit` 3.1.0 to 3.1.1, `@sveltejs/adapter-vercel` 7.0.1 to 7.0.2 (security fixes) - PR #5.

> Open, unmerged: PR #7 `feat/blog-cover-cards` (image-background blog cards, mock covers).
