# Automatic homepage and blog discovery

Date: **November 5, 2026** (America/New_York). Branch: `docs/blog-audit-20261105`.

## Implemented behavior

The homepage previously used three hardcoded editorial placeholders, and the blog index could repeat its featured post below the featured area. The owner requested every new blog post to follow the same homepage/archive structure automatically.

Both route loaders now call [one public discovery service](../../../src/lib/server/services/blog-discovery.ts). It selects only card fields through the existing public-post visibility predicate. One marked featured post leads; otherwise the newest eligible publication leads. The lead is excluded **before** pagination and appears only on the first unfiltered page. Search includes matching featured posts as ordinary results. Regular posts use publication order with an ID tie-break; due schedules use their effective publication date rather than PostgreSQL's NULL-first descending ordering.

- `/blog`: one lead above up to 12 regular articles; older regular articles remain reachable through pagination.
- Homepage: the same lead above up to 6 regular articles; `?blogPage=n#blog` reaches older articles.
- Drafts, private/member-only, fixtures, noindex, trashed, expired and future-scheduled records remain excluded.
- The shared card renders actual stored covers, dimensions, bylines, dates and detail links, with light/dark tones and a full-width lead layout. Empty/unavailable states never substitute fake posts.
- Homepage SSR is the documented exception to generic marketing SSG. A new publication appears in initial HTML without rebuilding. Homepage and blog-index responses use no-store; other article/taxonomy cache behavior and the unconnected purger are unchanged.
- Homepage JSON-LD accepts the same visible saved card data. The article ItemList remains omitted while blog indexing is launch-gated. No per-title source edits are needed.

Public maintenance, navigation/footer/indexing/sitemap gates, article intake and hosted content were not changed by this implementation. The homepage CMS section is the explicit owner-requested exception to hiding all blog promotion while gated; see [decision §7](../../seo/DECISIONS.md#7-automatic-cms-discovery-and-featured-placement-2026-11-05).

## Final verification

| Check                                | Result                                                                                        |
| ------------------------------------ | --------------------------------------------------------------------------------------------- |
| `pnpm check:css`                     | 98 custom properties in use, all declared                                                     |
| `pnpm check`                         | 0 errors, 0 warnings                                                                          |
| `pnpm lint`                          | Formatting, Oxlint and Svelte ESLint pass                                                     |
| `pnpm test:unit --run`               | **79 files / 575 tests passed**                                                               |
| `pnpm build`                         | Complete build including maintenance output passes                                            |
| `pnpm check:pages`                   | **46** static page contracts pass; homepage moved from static output to separately tested SSR |
| `pnpm test:seo`                      | **3 passed**                                                                                  |
| `pnpm test:e2e --reporter=list,json` | **40 passed; zero skips, failures or flaky tests**                                            |
| Official Svelte MCP autofixer        | All four changed components clean at **5.57.3**, with the actual async compiler setting       |
| Mobile/desktop visual review         | Four retained real-card screenshots at **320px / 1440px**, both surfaces                      |

The isolated worktree uses the already installed project toolchain. Commands above were invoked through `pnpm --config.verify-deps-before-run=false` with the installed Node/pnpm directories on PATH to prevent an unrelated worktree dependency reinstall. No package, lockfile or tooling configuration was changed. The final E2E run adds JSON reporting only to retain evidence; its assertions and the complete project suite are unchanged. Log presentation normalizes terminal color escapes and trailing whitespace without changing results. See [logs](logs/), [MCP results](svelte-mcp.json), [browser summary](visual-evidence.json) and [source hashes](source-manifest.json).

The authenticated image-flow test saves a real image-backed draft and proves its card is absent from both public listings. It publishes through the normal UI/service gate, then verifies both **raw HTML** and rendered cards without rebuilding: one occurrence, the correct detail link, actual decoded media, no horizontal overflow and the same saved title. Existing transaction/service tests continue to cover publication and featured-state lifecycle. New shared-query tests cover lead placement, no duplication, complete pagination, visibility exclusions, publication/rename/unpublish changes, search wildcard handling and due-schedule ordering. Component tests cover light/dark presentation, real covers, empty/unavailable states and navigation.

Earlier fixtures assumed static default cards, cached archive reads and 13 posts producing two regular pages. Tests were updated for explicit CMS input, no-store reads and a 14-post fixture (one lead plus 12 regular posts plus one overflow), preserving page-two coverage. No SEO/CWV thresholds or assertions were lowered. `logs/unit-initial.log` is historical failure evidence; `logs/unit.log` records the final passing suite. Visual review also caught and corrected the visible `ReadArticle` spacing defect before the final run.

## Visual evidence

- [Homepage, 320px](screenshots/cms-card-home-320.png)
- [Homepage, 1440px](screenshots/cms-card-home-1440.png)
- [Blog index, 320px](screenshots/cms-card-blog-320.png)
- [Blog index, 1440px](screenshots/cms-card-blog-1440.png)

These are explicitly generated local test images/articles, not approved financial publications or final cover artwork. An earlier targeted image-flow repeat retained the initial screenshots because the default list reporter did not persist attachments; the final complete E2E run replaced them with the final source's screenshots.

## Operational boundaries

The throwaway local PGlite admin was revoked after each browser run. Test post/tag/media cleanup completed through the existing suite. Temporary credential/report files were removed; no credentials were committed. No application preview server was left running by the tests.

Existing build notices remain: chunk size, color-environment warnings and optional Vercel dependency tracing. Hosted performance, storage, CDN purging and publishing are not certified by local tests. The homepage now depends on a request-time database read; an unavailable database yields an honest unavailable article section while preserving the marketing page.

The hosted Preview was independently observed earlier with no CMS posts/authors/categories/media. This feature does not import repository Markdown, fabricate missing authors/media, approve financial claims, publish the 0DTE article, merge the branch or deploy/promote Production. The separate [intake automation plan](../../blog/AUTOMATION_PLAN.md) remains proposed. Future authors follow [the publishing guide](../../../blog%20implementation.md), save/publish through the CMS and verify both automatically populated surfaces.
