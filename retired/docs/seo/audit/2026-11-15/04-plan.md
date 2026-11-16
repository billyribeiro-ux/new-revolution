# Implementation plan after the November 15 audit

The owner requested an audit before implementation. This is the concrete proposed sequence; the retired CMS link correction is already complete. Use the [blog handoff](../../../BLOG_AGENT_HANDOFF.md), [Vite+ workflow](../../../VITE_PLUS_WORKFLOW.md), current source and this run's evidence. Do not copy contradictory recipes identified in `01b-standard-audit.md`.

## 1. Reconcile the implementation contract

Update `AGENTS.md`, `docs/NEW_PAGE_PLAYBOOK.md`, `docs/seo/SEO_STANDARD.md`, `docs/SEO_EVIDENCE.md`, `docs/seo/OPERATIONS.md` and `docs/seo/DECISIONS.md` together. Remove the deleted planned-route warning-bypass recipe, nonexistent export/requirement references, stale publication/offer claims and incorrect axe/Lighthouse descriptions. Retain strict prerender failures and distinguish Google requirements from project preferences. [CODE paths above; CMD `01b-standard-audit.md`]

Resolve the actual Inter/Plus Jakarta Sans/Geist Mono implementation against the written two-Geist-family policy before any typography work. A font migration is a visual/layout change with its own browser/CLS acceptance; it is not a prerequisite imposed by Google. Preserve self-hosting and zero font hrefs. [CODE `src/app.css:1`, `docs/FONT_AND_FRAGMENT_POLICY.md:7`; CMD `browser-audit.json`]

## 2. Build the missing Live Trading Rooms overview

Create `src/routes/live-trading-rooms/+page.ts` and `+page.svelte`, with `prerender = true`, SSR, the existing root metadata system, a unique descriptive title/description, canonical from `getCanonicalUrl`, and the existing `.container`/`.inner-page` layout. Use the established page components rather than adding another head system or stylesheet. [CODE `src/routes/+layout.svelte:66`, `src/app.css`; HTTP `production-crawl.json`]

The overview should let visitors compare the three room concepts and follow a real link to each:

- Day Trading Room: intraday preparation/execution education.
- Swing Trading Room: multi-day planning around a working schedule.
- Small Accounts Room: position sizing and capital-risk education for limited accounts.

Reuse the existing room data in `src/lib/data/homepage.ts` and `CANONICAL_OFFERINGS` without creating competing manual URL lists. Present the six-concept ecosystem honestly: three primary room cards, with separate related links to the two alert concepts and mentorship if a general membership/catalog CTA points here. Do not imply live room access, availability, enrollment or paid delivery currently exists. [CODE `src/lib/data/homepage.ts:45`, `src/lib/data/homepage.ts:459`, `src/lib/seo/structured-data.ts:109`; CODE `docs/seo/DECISIONS.md:89`]

Add `buildLiveTradingRoomsJsonLd` and tests in the existing `src/lib/seo/structured-data.ts` and `.spec.ts`. Use a `CollectionPage`, two visible breadcrumbs (Home → Live Trading Rooms), and a three-item `ItemList` that describes the visible room cards. Reference shared Organization/WebSite/provider identities and existing room services. Use actual visible data. No FAQPage, fake review/rating, priced Offer or invented availability. A generic ItemList/Service is descriptive schema, not a promised Google rich-result feature. [DOC https://developers.google.com/search/docs/appearance/structured-data/sd-policies, last updated 2026-07-10; DOC search-gallery, last updated 2026-10-16]

Add a genuine desk/author attribution, maintained review date and risk statement. Keep useful FAQ content in native details if questions help visitors choose; do not add FAQs merely to increase schema volume. Preserve a usable skip link and meaningful heading order. [CODE `AGENTS.md`; DOC helpful-content, last updated 2026-10-05]

## 3. Wire the whole discovery path

Update generic room/membership destinations in:

- `src/lib/components/layout/Navbar.svelte` (desktop/mobile action and an explicit overview option in the room menu).
- `src/lib/data/homepage.ts` (closing CTA/footer and any overview entries).
- Generic room CTAs in `/blog/[slug]`, `/resources`, relevant store pages and other source locations found by a full route-string/label scan.
- `buildOfferCatalogEntity().url`, currently the day-room URL.

Named Day/Swing/Small Accounts links must continue to open their specific room. A label promising all memberships must have a destination that presents those choices; otherwise relabel it accurately. Do not change a named room link into a generic hub link. [CODE `src/lib/components/layout/Navbar.svelte:346`, `src/lib/data/homepage.ts:749`, `src/lib/seo/structured-data.ts:337`, `src/routes/blog/[slug]/+page.svelte:383`]

For the three room detail pages, derive DOM and JSON-LD breadcrumbs from the same data and add the overview between Home and the current room. Test exact names/positions and 320px reflow. Let the current sitemap discover the new static route; verify its actual output rather than assuming discovery succeeded. Update the audit inventory/data-driven SEO regression source to include the concrete route. [CODE `src/routes/sitemap.xml/+server.ts:28`; DOC breadcrumb, last updated 2026-09-08]

## 4. Harden schema and publication behavior

In `src/lib/seo/blog-seo.ts`, validate custom schema recursively, reject invalid node shape and conflicting/duplicate IDs, and preserve the single-graph context/identity contract. In the article loader/editor, report invalid custom schema honestly rather than silently promising an override. Add meaningful nested-type, null, duplicate-ID and merge regressions. [CMD `03-custom-schema-probes.json`; CODE `src/routes/blog/[slug]/+page.server.ts:362`]

Fix PATCH `minorEdit` propagation in the shared schema/service path, using existing transactional save logic and update-date tests. The November 15 correction is already a real recorded modification; do not rewrite its dates directly. Preserve historical article revisions and original publication instant. [CMD `cms-watchlist-correction.json`; CODE `src/lib/server/services/posts.ts:623`, `src/lib/server/db/save-post.ts:189`]

Make graph typing and shared-entity ownership agree with the documented architecture. Do not add pointless entity duplication just to inflate markup. Any direct dependency addition requires a scoped, verified change rather than an incidental toolchain upgrade. [CMD `03-url-summary.json`; CODE `package.json`, `src/lib/seo/blog-seo.ts:373`]

## 5. Correct measured accessibility and performance gaps

Use the exact axe node reports for the six affected URLs. Add an accessible name to the stock-index SVG and make meaningful horizontal scroll regions operable and named. Re-test keyboard operation and avoid introducing noninteractive tabindex compiler suppressions. Replace/rename the limited custom audit so future reports cannot call it axe-core. [CMD `browser-audit.json`; CODE `tests/seo/lab.ts:419`]

Profile service templates that scored below the diagnostic performance budget; retain the current thresholds and use actual LCP/long-task traces before changing code. Unlaunched store noindex is intentional and must not be removed to raise an SEO tool score. Keep lab results separate from field CWV. [CMD `unlighthouse-summary.json`, `lighthouse-summary.json`; CODE `src/lib/data/launch-gate.ts:29`]

## 6. Close protection, coverage and operational gaps

Define/verify nonproduction noindex behavior for both SSR and static hosting, without trusting arbitrary forwarded hosts. Consider the recorded two-hop HTTP-apex redirect against the single-hop preference. Review the missing-image placeholder behavior and real media validation. [CODE `src/hooks.server.ts:36`, `vercel.json:21`, `src/routes/images/blog/[...file]/+server.ts:41`; HTTP `03-host-and-image-probes.json`]

Replace stale environment-specific inventory assumptions with route/catalog/CMS-derived coverage. Add the missing versioned SEO/lab CI gate and retain failure artifacts. Cover the actual published article, fresh publications, unpublished/deleted posts, pagination/search variants and the new overview. Keep fixture-only URLs separate from production verification. [CODE `tests/seo/seo-standard.spec.ts:17`, `docs/seo/audit/02-inventory.json`; HTTP `production-crawl.json`]

Handle the four advisory records in a separate dependency review. Preserve Vite+/Vite/Vitest catalog alignment and do not apply unapproved blanket upgrades. [CMD `logs/dependency-audit.json`]

## 7. Acceptance before release

Use the existing commands, with actual exit codes and all skips/warnings recorded:

```bash
pnpm check:css
pnpm check
pnpm lint
pnpm test:unit --run
pnpm build
pnpm check:pages
pnpm test:seo
pnpm test:e2e
```

If resource contention requires `pnpm test:unit --run --maxWorkers=4`, identify that exact variant and keep the default-run failure in the record. Run Svelte MCP autofixer on every changed Svelte file. Retain current test assertions and budgets. Use the complete `pnpm build`; direct Vite builds are not equivalent. [CODE `package.json`, `docs/VITE_PLUS_WORKFLOW.md`; CMD `logs/test-final.log`, `logs/unit-limited.log`]

Verify the new route and each changed generic link against `pnpm preview` with before/after HTTP evidence. Check canonical/meta/graph/breadcrumb parity, no-JavaScript navigation, all internal links, real images and font requests at 320/390/768/1536/1900px, 200% text enlargement, text-spacing overrides and reduced motion. Repeat real axe, independent BFS/status/variant probes, and lab diagnostics. A generated READY build is not proof of deployed CMS availability. [CODE `docs/BLOG_AGENT_HANDOFF.md`; CMD this audit's raw artifacts]

After a separately authorized release, verify the exact public deployment and CMS state, inspect Search Console/rich-result results, and collect field CWV when traffic permits. The acceptance claim is technically verified behavior, not guaranteed Google indexing or ranking. [DOC AI optimization guide, last updated 2026-07-10; DOC structured-data policies, last updated 2026-07-10]
