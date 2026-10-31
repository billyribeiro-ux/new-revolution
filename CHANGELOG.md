# Changelog

All notable changes to this repository. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Newest first. **Every PR adds an entry under `[Unreleased]`** (agents: see
[`docs/AGENT_COORDINATION.md`](docs/AGENT_COORDINATION.md)). Entries that add anything
**temporary** are tagged `TEMPORARY` and must also appear in [`docs/TEMPORARY.md`](docs/TEMPORARY.md).

Categories: Added, Changed, Deprecated, Removed, Fixed, Security, Docs.

## [Unreleased]

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
