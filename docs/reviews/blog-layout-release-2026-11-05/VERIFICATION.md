# Shared blog layout and maintenance-off release

Date: November 5, 2026 (America/New_York). The owner explicitly requested the shared site width for the blog, maintenance off until a later instruction, and commit/push/squash merge of the implementation. The owner then clarified: finish these fixes first; discussion of the original `blogs/0DTE-spx-options-strategy.md` follows afterward.

## Implemented layout

The archive/search/category/tag templates omitted the shared container; their headings, cards and navigation could reach the viewport edge. The article had an independent 1280px shell. Taxonomy grids and related-card minimum widths could exceed a 320px viewport's available content width.

All four templates now use the existing `.container` outer shell and standard spacing. The actual SSOT in `src/app.css` is `min(100% - --gutter, --max)`, centered with automatic inline margins: 1320px maximum from 1024px, 1440px from 1280px, 1536px from 1536px. No guessed 2420px content width or new global token was introduced. Article text stays at most 900px wide; the cover retains its intentional 960px limit. Protected branches use the same shared outer shell.

The CSS-standard width/gutter table, publishing guide and agent handoff now match the source. Navigation/footer and navigation JSON-LD remain data-driven; article title/schema data still comes from the saved CMS record.

## Local acceptance

| Check                                  | Result                                              |
| -------------------------------------- | --------------------------------------------------- |
| CSS tokens                             | 98 in use, all declared                             |
| Svelte diagnostics                     | 0 errors, 0 warnings                                |
| Unit/component suite                   | 79 files, 575 passed                                |
| Complete build                         | Pass, including maintenance output                  |
| Static page contracts                  | 46 passed                                           |
| Standalone SEO                         | 3 passed                                            |
| Full authenticated Chromium E2E        | 42 passed                                           |
| Firefox homepage/publishing/layout E2E | 14 passed                                           |
| WebKit homepage/publishing/layout E2E  | 14 passed                                           |
| Final browser failures/skips/flaky     | 0 / 0 / 0                                           |
| Repository lint                        | Formatting, Oxlint and Svelte ESLint pass           |
| Official Svelte MCP                    | Four final templates clean at 5.57.3, async enabled |

The new authenticated layout test visits archive, search, category, tag and the actual published test article at 320, 768, 1440, 1920 and 2420px. It compares every outer blog container to the real navbar container, asserts no horizontal overflow and preserves article readability. At 2420px each shell is 1536px wide with a 442px left margin. The existing upload/draft/reload/publish/schema workflow remains fully exercised. Each engine's throwaway account was revoked.

Retained [screenshots](screenshots/) include wide archive/article and narrow taxonomy pages, plus the original real-media card and menu checks. These are generated local test records and development examples, not approved financial publications. [Source hashes](source-manifest.json), [official MCP output](svelte-mcp.json), engine summaries and [command logs](logs/) record the tested implementation. Generated evidence is formatted before the final full repository lint.

## Production preparation

Production previously lacked `DATABASE_URL`. The existing auth/password secrets and public `ORIGIN` were already present. Created `revolution-production` on the existing Neon integration with the explicit **free_v3** plan, `iad1` region and Neon Auth disabled; connected it only to Production. Confirmed zero public tables before initialization, then applied the four existing numbered forward migrations using the repository helper. Postflight: **55 tables, zero posts, zero users**. Preview's database was preserved. See [database result](production-database.json) and migration log.

Updated the Production build environment to `MAINTENANCE_MODE=false` under the owner's explicit instruction. Existing immutable deployments retain their own routing until a new verified Production build is promoted. Keep automatic custom-domain assignment disabled and Preview authentication intact. Waitlist capture and email configuration remain separately disabled/unconnected; no real email was sent. No hosted article was imported or published.

The original 0DTE article, its financial/editorial corrections and specified image assets remain the next discussion, exactly as the owner requested. This release does not invent article/media records to fill the empty CMS.

## Published deployment

Exact merged commit, staged and public HTTP/browser proof are appended after release verification. A successful environment edit, merge, deployment status or HTTP 200 alone is insufficient proof: a queued Vercel deployment can return HTTP 200 with a “Deployment is building” page.
