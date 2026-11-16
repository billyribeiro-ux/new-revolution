# Approved implementation plan: November 5, 2026

Owner authorized implementation, verification, documentation, feature PR, push and squash merge. Baseline: main 54caa06. Installed Svelte 5.57.3 / Kit 3.1.1; no tooling migration. Maintenance stays off. Preserve untracked owner files in the original checkout.

## Shared contract

- One 152.5rem / 2440px border-box outer container including padding, existing responsive total gutters split between sides, full-width surfaces. Remove competing outer caps. Article prose remains 900px; article title/cover/body/FAQ share the reading anchor. Archives/navigation/footer align to shared inner edge.
- Common category/tag/search presentation: no decorative tag hashes, no empty sidebar reservations, compact content-driven spacing, regular cards up to 25rem, single wide result up to 75rem with equal columns from 48rem.
- Only Montserrat display and Sofia Sans body/forms/editor/code/data throughout public/admin. Central Fontsource CSS imports; mono token compatibility alias. Shared editor/sanitizer allowlist; preserve source records/revisions. Build-derived same-origin brand-ui.css for standalone HTML and an embedded licensed Sofia face for isolated placeholder SVGs.
- Native left desktop TOC at 73.75rem+, removed below. Preserve authored numbering and published deterministic IDs. Actual header height drives sticky +0.5rem and anchor/spy +1.5rem offsets. Bound rail by reading column; adapt panel navigation height at FAQ boundary, natural exit when space is insufficient. Native collapse/FAQ, no geometry-changing hover, no passive URL writes, no scroll traps, full observer/frame cleanup.
- Approved images: hero 1600 × 900 or 1200 × 675 under 90 KB; regular 800 × 450 under 35 KB; inline 1200 × 675 under 75 KB; social 1200 × 630 under 80 KB. Fix media-link padding, consistent uncropped 16:9 diagrams, real srcset/sizes and LCP priority. Record density limits.
- Search index/category/tag via search and legacy q; retain query across topics/pagination. Search prepared visible article text and authored fields. Semantic exclusion parsing, malformed metadata excluded. Shared count/page eligibility before pagination. Add paired nullable `search_text`/`search_excluded`, source-change invalidation trigger, transactional writers, bounded compare-and-set backfill. Read-only repeatable-read pending fallback. Search no-store/noindex/no canonical.
- Rename canonical product route to `/sunday-alpha-alerts`; `/watchlist` 308 preserves query and browser fragments. Update navigation/schema/metadata/links/inventories/tests. Remove fake RTP emblem. Align shared layout; correct hypothetical demo claims; replace unsupported Recon enrollment with contact action.
- Review first-party web/admin copy contextually for unnecessary em dashes. Preserve legitimate quotes/attribution/notation/code/URLs. Remove destructive punctuation save transforms; editorial advisory, not blanket publication block.

## Ownership

Lead: app.css/inner-page outer caps, all font delivery/editor sanitizer, Sunday route/data/schema rename, source copy, integration/docs/release. Search agent: discovery/query/projection/migration/writers/backfill/tests. Archive agent: blog listing/category/tag components/loaders/cards/home blog section and focused tests. TOC agent: article component/attachment and focused interaction tests. No concurrent shared edits; coordinate article tag/media edits through TOC owner.

## Confirmed baseline evidence

- Tag `#` is rendered text, not `location.hash`; the independently centered 820px hero and repeated section padding cause misalignment/excess space.
- Global anchor block padding of 4px reduces media image height by 8px.
- FAQ expansion at article-bottom sticky clamp changes TOC top by 87px while `scrollY` is unchanged. Hover number movement not reproduced.
- Search matches title/excerpt only and excludes a single serialized custom-field shape.
- Mono token, Georgia press mark, index ticker stacks and five editor choices violate new two-family policy. Existing article package contains no inline families.
- Current Sunday Recon handler posts to generic lead/checklist workflow and falsely reports success on failures.

## Acceptance and release

Add meaningful search/persistence/sanitizer, layout, TOC/FAQ/media/font/redirect regressions. Test 320px, intermediate widths, 1179px, 1180px, 1181px, 2440px and wider, short viewports, 200% text, keyboard/reduced-motion, noJS/history/client navigation and cold DPR 1/2 media. Official Svelte MCP for changed components/modules. Full pnpm gates: `check:css`, `check`, `lint`, `test:unit --run`, `build`, `check:pages`, `test:seo`, `test:e2e` with disposable local admin. Verify generated Vercel handler and deployed Chromium/Firefox/WebKit. Keep lab/field evidence distinct.

Update CHANGELOG and maintained layout/font/blog/SEO handoffs, URL inventory and todo. Preserve historical references. Independent integrated review; normal branch PR checks/protections and squash merge; verify exact main SHA and public deployment. Additive migration before compatible deployment, safe backfill before promotion; retain legacy-writer fallback. Never export bulk production credentials, send emails, bypass protections or fabricate evidence.
