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
| Full authenticated Chromium E2E        | 43 passed                                           |
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

[PR #27](https://github.com/billyribeiro-ux/new-revolution/pull/27) was squash-merged as **`b19c91f8749d8162f3be0b6d2a342ed4609700aa`**. The complete application/configuration scope matches reviewed head `26c4a74`; main additionally contains owner-authored editorial reference changes. No unrelated reference deletion was restored.

Exact Production: **`dpl_5QU1Tz3sngobduDUb1jKoqmaggpF`**, `new-revolution-ca1oj6x7k-will-ribeiros-projects.vercel.app`, READY / Production / exact squash SHA. Its Production-configured staged URL passed **18 browser cases and eight HTTP checks** before explicit promotion. The public `https://www.revolutiontradingpros.com` then passed the same checks **without bypass credentials**. Root and blog return 200, maintenance state is false, database health is true, admin/media-list APIs return 401, login/RSS/sitemap return 200 and an unknown article returns404. The first immediate public probe during cutover returned 503; the subsequent alias/marker check and full clean-browser public run confirmed the new normal deployment. No further application change was made for that transition.

Each browser run covers Chromium/Firefox/WebKit at 320, 1440 and 2420px on homepage/blog: loaded first-party fonts and brand image, visible desktop/mobile Blog navigation, centered container alignment, no overflow, no page/console/network errors, correct indexing controls and honest empty CMS state. Public Chrome was also opened and visually observed rendering the normal centered Blog layout. Generated test images/posts were never copied into Production.

The private development alias now points to the verified corrected **Preview `dpl_9F5jprZgVDUwV7SAXfRWg2bjbGiz`**, source `26c4a74`, whose application matches the published build. Anonymous access still redirects to Vercel SSO. Automatic custom-domain assignment remains false and protection remains `all_except_custom_domains`. Production maintenance is off until the owner requests otherwise.

See [release identity/parity](release.json), [Preview proof](hosted-preview/preview-proof.json), [staged Production proof](hosted-production-stage/production-stage-proof.json) and [public proof](public/public-proof.json), with screenshots alongside each. A successful build, promotion command or HTTP 200 alone is insufficient: the earlier queued deployment returned 200 with a “Deployment is building” page; the earlier 128d679 Preview built successfully but returned 500. These were caught before release.

## Hosted runtime defect found before merge

The build-successful Preview for head `128d679` returned HTTP 500 on `/`. Runtime logs identified `remote_prerender_not_dynamic` in `home.remote.js`. The homepage SSR conversion still called a default build-only `getDeskStatus` remote prerender function. Vite preview could reuse its generated asset, hiding the missing runtime implementation.

The unchanged generated Vercel handler reproduced the same 500 locally with an isolated in-memory database, while `/blog` returned 200; see `logs/adapter-before-fix.log`. `getDeskStatus` now uses the documented `{ dynamic: true }` option, retaining its constant public payload at runtime. A permanent deployment E2E imports the generated handler directly in an isolated child process and verifies real SSR responses and desk-status content, without Vite's asset fallback or a shared test database. Official documentation, installed Kit implementation and MCP evidence are retained in `home-runtime-mcp.json`. The failing hosted build was not merged or promoted.

The final full E2E suite includes the new generated-handler regression (**43 passed**). Two default-concurrency unit attempts hit the existing 10-second auth setup hook; those historical logs are retained. The isolated auth suite passed 3/3; the final full unit run passed 575/575 with `--maxWorkers 4`, preserving every test and timeout. No global worker, timeout or threshold configuration changed.

## Release evidence follow-up

This documentation-only follow-up records the final live state after the implementation squash merge. The application/source fingerprints remain identical to the tested and published release. The final repository-wide lint reports formatting in two newly inherited owner-authored references (`blogs/first-blog.md`, `blogs/head-to-head-blog.md`); those editorial files are preserved unchanged. Owned release documents pass formatting; Oxlint and Svelte ESLint pass separately. No article text was approved, imported or published. All 40 handoff entrypoint references, the Claude import and byte-identical SEO-standard copies were reverified. The owner’s retirement of the separate `old-footer.md` reference was preserved.
