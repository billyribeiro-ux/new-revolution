# Published blog availability and layout stability, November 11, 2026

## Verified incident

The public `/blog` initially returned Vercel HTTP 404 `DEPLOYMENT_NOT_FOUND`. The current project's assigned `new-revolution-ruby.vercel.app/blog` returned HTTP 503. These were different failures, before successful article rendering.

The previously linked project was `prj_tZfGFo3Kzo7NSQvtGl9s1VJRY5kE`. The current project, `prj_TJA4UdRjIDz2qHNcLV7cZ5OckArX`, was created on November 11 and had **zero environment variables**, no custom-domain assignment, and no connected CMS/media resources. Runtime logs for `dpl_4DbqGTzpdH9XwLBo4xbWdngUuUJX` show `ENOENT` while creating `/var/task/.svelte-kit/pglite-blog`. A READY build had therefore been serving a broken CMS. This evidence establishes the configuration loss; it does not establish who recreated the project or why.

Read-only verification found the original Production database still intact: post 1, `0dte-spx-options-strategy-guide`, published/public/featured, published at `2026-11-05T21:29:51.520Z`, with six active media rows. Its exact stored body SHA-256 remains `73d9ccd75661dae8685cd49585e00f86c1cc3e7fcea7b4f321a515d6cbbb93f4`, identical to the [original publication record](../first-blog-2026-11-05/production.json). See [incident facts](hosting-incident.json).

## Recovery and prevention

Reconnected the existing `revolution-production` Neon resource to Production and the separate `revolution-preview` resource to Preview. Reconnected `revolution-production-media` to **Production only**. Restored missing origin and signing settings after read-only checks confirmed zero users, sessions, protected posts or trashed posts. Restored `www.revolutiontradingpros.com` and the apex 308 redirect to www, and restored the documented `autoAssignCustomDomains: false` control. Preview authentication remains enabled. No database, article, media, author, taxonomy, revision, account, migration or email was created or modified in Production.

Recovery deployment `dpl_8pEs4aEJPQqBDiCRtP7oNaS1xXZn` serves `/blog` and the full article with HTTP 200; apex `/blog` redirects once to the matching www path. The observed error-log window after recovery contains zero error records.

`pnpm build` now checks hosted database configuration **before bundling**. The runtime applies the same guard before considering local PGlite fallback. Missing, placeholder and local-only URLs fail with an actionable configuration error without exposing credentials. Explicit local development/test databases remain supported. A generated-function regression exercises the actual missing-configuration path and requires HTTP 503 with the configuration diagnosis, without `ENOENT`/`mkdir` fallback. This prevents accidental empty development databases from masquerading as the published CMS; it does not replace connection, content or deployed-browser checks.

## Browser findings and bounded fixes

Chromium PerformanceObserver and frame-by-frame geometry reproduced an enlarged-text hydration shift: desktop brand text used a three-row grid before the measured compact navigation mode, then changed to flex. At 1440px/200% text the header moved from 98.890625px to 88px; at 1920px it moved from 101.625px to 88px. Delaying fonts reproduced the same change. The fix retains that grid across desktop compact selection. No font, width breakpoint, global stylesheet or animation migration was needed.

The new regression fails on the original compiled output (9.890625px brand-position change at 1024px versus the existing 1px stability invariant) and passes the corrected compiled component at 1024/1280/1440/1920px. It delays hydration, captures pre/post frame geometry and records actual navigation-attributed layout-shift entries. Shared navigation tests also cover 320px/200% text with JavaScript disabled.

The lead blog card violated the [existing layout contract](../../blog/LAYOUT_AND_CONTENT_CONTRACT.md): 1361px at a 1440px viewport versus the documented 75rem/1200px cap. Restored that cap and adjusted the desktop responsive-image upper bound to half its split width. Existing browser coverage checks card widths and decoded media.

The earlier 1536px frame failures were incorrect test expectations, not a reason to remove the stable scrollbar gutter. Browser measurement shows a 1536px viewport with a **1521px root layout box**; `documentElement.clientWidth` can still report 1536px in headless Chromium. The shared container correctly fills available layout width up to 96rem. Tests now compare against that independent root box and root font size, preserving all existing alignment/overflow checks and their tolerances.

Initial cold-load tests at 390/1024/1280/1440/1920px and eighteen scrolled transitions across home/about/blog at 390/1440/1920px, with normal/reduced motion, produced zero layout-shift entries and immediate destination scroll position zero. These negative results do not prove universal zero CLS. The existing 18px reveal transform changes visual position without changing document geometry; it was not misreported as a layout-shift defect.

The article-specific local harness copies the public body/media/taxonomy into an isolated PGlite database. Its serial sequences are reset and only the local article's featured flag is disabled to coexist with the development fixture; the eligible newest article still leads discovery. Production's featured flag and content remain unchanged. Initial harness errors from copied sequences and the development feature uniqueness constraint were corrected before accepting any article-specific measurements.

At 390px and 1440px the full article returns 200, renders 21,805 body characters / 3,192 visible words, eight numbered h2 sections, three h3 sections, five FAQs and its bottom risk disclosure/footer. All seven main images decode with nonzero natural dimensions; there are no page errors or horizontal overflow. Screenshots were inspected at both sizes. Word count differences from the CMS's stored 3,199 are renderer/text-extraction differences, not a missing-body claim.

## Validation and deployment

Validation in progress; final gate counts and deployed source identity are recorded below before delivery. All testing uses isolated local databases and disposable administrators. The sole local and remote branch remains `main`.
