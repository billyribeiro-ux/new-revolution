# Blog menu, schema and publishing acceptance

Reference date: November 5, 2026. Follow-up to the [automatic CMS discovery implementation](../blog-discovery-2026-11-05/VERIFICATION.md), on `docs/blog-audit-20261105` / [draft PR #27](https://github.com/billyribeiro-ux/new-revolution/pull/27).

## Evidence and implementation

The old `MAIN_NAVIGATION` and `FOOTER_COLUMNS` used `isLaunchedHref()`, which excludes `/blog`. Both desktop and mobile Navbar render that shared data. `buildNavigationElements()` in `structured-data.ts` also consumes `MAIN_NAVIGATION`; a manual JSON-LD entry would create a second source of truth.

`isNavigationHrefVisible()` now includes Blog independently of the indexing gate. Shared navigation/footer labels are **Blog**. Desktop/mobile navigation, the footer and homepage navigation JSON-LD therefore agree automatically. Store promotion, the unwritten eBook, blog noindex/no-canonical, sitemap exclusion and gated homepage article-ItemList exclusion remain in place. No article titles are hardcoded into schema: the archive and detail graphs already derive saved titles/URLs from CMS fields, while homepage article schema derives visible CMS cards when indexing is launched.

The publishing guide, shared handoff, launch decisions, temporary registry, launch tracker and changelog describe that distinction. The forty existing agent-entrypoint references continue to lead to the updated handoff. The two SEO-standard copies remain identical.

## Verification record

Final local gate results are recorded below; hosted acceptance is added after deployment verification. Logs preserve command output. A historical Firefox run exposed an unsynchronized immediate reload after Save Draft; its initial log and summary are retained separately rather than presented as a passing run.

The full-file official Svelte MCP review targets installed Svelte **5.57.3**, with the actual async compiler setting, and reports zero issues/suggestions for Navbar. A temporary browser fixture measured seven menu items, no document/navigation overflow and no desktop brand/link/action overlap at fifteen widths from 320 to 1920px. It also verified mobile Blog active state on a child route and Escape dismissal; the passing measurement fixture was removed. Permanent E2E assertions cover navigation, schema parity, actual menu clicks, responsive visibility and indexing policy.

The Firefox failure was a test synchronization defect, not evidence of lost saved content. Installed Kit 3.1.1 client code updates browser history before awaiting `onNavigate` callbacks and applying the navigation result. The root layout’s maintenance callback awaits a fetch and deliberately falls back to a document navigation if it fails. The premature reload could abort that fetch and trigger a second same-URL navigation. The test now waits for the newly mounted saved editor’s **Ready** indicator and persisted title before performing the real reload. The outgoing create editor instead reports **All changes saved**, so this assertion distinguishes destination readiness from a changed URL. The product’s maintenance fallback is preserved; no sleeps, retries or weaker persistence assertions were added.

The first WebKit expansion passed publishing/cards/schema but exposed two older tests that assumed Chromium’s tabbing and click-focus behavior. The keyboard tests now enter the dropdown with Enter, assert each focused submenu link and use Option-Tab for macOS WebKit link navigation. Focus-outline assertions now also prove the intended CTA is focused and matches `:focus-visible`; the original outline color, width and offset requirements remain unchanged. This follows [WebKit’s documented link-navigation behavior](https://bugs.webkit.org/show_bug.cgi?id=161394) and the [Playwright macOS keyboard-navigation issue](https://github.com/microsoft/playwright/issues/41808). No OS preferences or product CSS were changed. Initial WebKit logs/summary remain explicitly historical.

## Scope and operation

The full default authenticated Chromium suite includes all application E2E and SEO tests. Firefox and WebKit each run the complete homepage/navigation spec plus the three-test authenticated image workflow, sequentially with separate throwaway accounts. The latter verify genuine upload/selection, saved-draft persistence, draft exclusion, normal publication, raw no-store listing HTML, decoded covers, correct article links, single cards and generated CMS title/URL/image schema. Unit/database coverage separately verifies selected-feature ordering, all older posts across pagination, feature changes, renaming, unpublishing and private/draft/fixture/schedule/expiry exclusions.

The isolated local PGlite test database and generated media were reset after the historical Firefox cleanup was interrupted. Every test account was revoked after its run, including failures. Reports/credentials remain temporary; retained summaries contain only results and generated test screenshots. No hosted CMS records were created or published.

All gates use the existing `pnpm` scripts. The installed Node/pnpm paths and verification-only `--config.verify-deps-before-run=false` override avoid an unrelated isolated-worktree dependency reinstall. Browser evidence uses `--reporter=list,json`; the extra engines use `pnpm test:e2e src/routes/page.svelte.e2e.ts src/routes/admin/image-flow.e2e.ts --browser <firefox|webkit> --workers 1 --reporter=list,json`. Thresholds and application configuration are unchanged.

The hosted CMS was previously observed empty. Local publishing coverage does not certify hosted Blob setup, mail delivery, CDN purging or the proposed Markdown intake automation. The original 0DTE brief is not an approved/published article. This work keeps Production maintenance and the separate indexing launch decision intact.

## Final local results

| Gate                               | Result                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------ |
| CSS tokens                         | 98 custom properties, all declared                                       |
| Svelte diagnostics                 | 0 errors / 0 warnings                                                    |
| Unit/component tests               | 79 files / 575 passed                                                    |
| Full build                         | Pass, including maintenance output                                       |
| Static page contracts              | 46 passed                                                                |
| SEO suite                          | 3 passed                                                                 |
| Full authenticated Chromium E2E    | 41 passed                                                                |
| Firefox homepage + image-flow E2E  | 13 passed                                                                |
| WebKit homepage + image-flow E2E   | 13 passed                                                                |
| Final browser skips/failures/flaky | 0 / 0 / 0                                                                |
| Built navigation sweep             | All 46 static public pages contain desktop/mobile/footer Blog links      |
| Documentation references           | 40 entrypoints, Claude import and identical SEO-standard copies verified |
| Navbar official Svelte MCP         | 0 issues / 0 suggestions                                                 |

The [source fingerprints](source-manifest.json), three engine summaries, [static navigation sweep](static-navigation.json), [documentation check](documentation-check.json), [MCP](svelte-mcp.json), [logs](logs/) and [screenshots](screenshots/) retain the evidence. Final lint runs after formatting generated evidence and the eight inherited main-branch formatting failures. The only mission-component formatting change removes trailing whitespace after its opening comment; the owner’s wording is preserved. Editorial Markdown formatting is included to satisfy the repository-wide formatter, without approving or publishing those drafts. Existing chunk-size/color and optional Vercel dependency-tracing notices remain; no dependency/toolchain change is included.
