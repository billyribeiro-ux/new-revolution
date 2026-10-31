# Changelog

All notable changes to this repository. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Newest first. **Every PR adds an entry under `[Unreleased]`** (agents: see
[`docs/AGENT_COORDINATION.md`](docs/AGENT_COORDINATION.md)). Entries that add anything
**temporary** are tagged `TEMPORARY` and must also appear in [`docs/TEMPORARY.md`](docs/TEMPORARY.md).

Categories: Added, Changed, Deprecated, Removed, Fixed, Security, Docs.

## [Unreleased]

### Added

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
