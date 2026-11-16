# Blog Layout, CMS Lifecycle, Freshness & Media Contract (`docs/BLOG_CONTRACT.md`)

> **Applies To:** `/blog`, `/blog/[slug]`, `/blog/category/[slug]`, `/blog/tag/[slug]`, `/rss.xml`, homepage blog discovery (`/`), `/admin/posts/**`, `/admin/media`, `src/lib/styles/prose.css`, `src/lib/server/services/{posts,blog-discovery,media}.ts`, and `src/lib/server/media-storage.ts`.

`/blog` and `/blog/[slug]` share the **exact same SSOT 3-font pipeline and fluid typography scale** (`--blog-h1..h4`, `--blog-body`, `--step-*` in [`docs/CSS_STANDARDS.md`](CSS_STANDARDS.md) §3.3), while enforcing a **protected layout and SSR CMS contract** that must never be overwritten by generic marketing-page templates.

---

## 1. Protected Blog Layout, TOC & Archive Geometry Contract

1. **100% Container-Flush Article Alignment (`1424px` Inner Width at `>=1536px`):**
   - `.container` (`--max: 96rem` / `1536px` border-box cap with `56px` inline padding per side at `>=1536px`) defines the `1424px` inner content box.
   - On `/blog/[slug]`, `.article-header`, `.article-h1`, `.article-subtitle`, `.article-excerpt`, `.article-cover-figure`, `.article-body-layout`, `.article-main-column`, `.prose-base` ([`src/lib/styles/prose.css`](../src/lib/styles/prose.css)), `.article-service-cta`, `.article-faq-section`, `.author-bio-box`, and `.related-articles-section` align **100% flush (`0px` delta)** with `.container` inner edges.
   - **Never add `65ch`, `70ch`, `680px`, or `900px` `max-inline-size` caps onto `.prose-base p`, headings, or lists** (enforced by [`scripts/typography-standard.spec.ts`](../scripts/typography-standard.spec.ts) and [`src/routes/blog/toc-layout.e2e.ts`](../src/routes/blog/toc-layout.e2e.ts)). Both the Admin `RichTextEditor.svelte` canvas and public `/blog/[slug]` share 1:1 full-container prose parity.
2. **External Left-Margin Sticky TOC Rail (`>= 118.75rem` / `1900px` Only):**
   - `.article-toc-aside` (`TableOfContents.svelte` + [`src/lib/attachments/article-toc.ts`](../src/lib/attachments/article-toc.ts)) renders **outside** `.container` in the left viewport margin exclusively at `@media (min-width: 118.75rem)` (`1900px+`), where `>= 238px` of left margin accommodates `>= 16px` screen inset + `194px–260px` TOC rail + `28px–40px` gap before the `1424px` article column.
   - Public routes reserve symmetric `scrollbar-gutter: stable both-edges` from `118.75rem` (`1900px`) so native scrollbars never shift the TOC rail or `.container` center.
   - Below `118.75rem` (`1900px`), the external TOC rail is hidden and removed from focus order so it never cramps or shifts the article column.
   - TOC extracts `<h2>` headings (`[2]` in `src/lib/shared/seo/toc.ts`), preserves authored numbering and deterministic unique heading IDs, and scrolls smoothly via `article-toc.ts` **without mutating `window.location` with `#fragment` hashes**.
   - Expanding native `<details>` FAQ items below the article must shift sticky TOC position by `<= 1px`.
3. **Shared Archive, Lead Card & Search Rules (`BlogArchive`, `ArchiveControls`, `ArchiveResults`, `PostCard`):**
   - Unfiltered `/blog` displays one featured (or newest) lead card above the `"More articles"` 3-column standing grid (`repeat(3, minmax(0, 1fr))` desktop, `2` cols tablet, `1` col mobile). Regular cards cap at `25rem`; single-result/lead cards cap at `75rem`.
   - When only 1 published post exists (and leads the page), `"More articles"` is omitted rather than duplicating the lead or showing an empty remainder (`ArchiveResults.svelte`).
   - Query parameter is `search` (accepts legacy `q`), preserved across category/tag switches while resetting `page`. Search responses emit `Cache-Control: private, no-store`, `robots: 'noindex, nofollow'`, and `canonical: undefined`.

---

## 2. CMS Discovery, Authoring Lifecycle & Publish Gate

1. **Shared SSR Discovery (`prerender = false`):**
   - Both `/` ([`src/routes/+page.server.ts`](../src/routes/+page.server.ts), `6` cards) and `/blog` ([`src/routes/blog/+page.server.ts`](../src/routes/blog/+page.server.ts), `12` per page) call `getPublicBlogListing` in [`src/lib/server/services/blog-discovery.ts`](../src/lib/server/services/blog-discovery.ts) with `no-store` listing reads so publishing or updating a CMS post updates initial SSR HTML immediately without a rebuild.
   - Remote functions consumed by SSR `/` (such as desk status) must declare `{ dynamic: true }` so generated Vercel handlers permit runtime invocation.
   - Only `status === 'published'`, `visibility === 'public'`, non-trashed, non-expired, non-future posts appear in public listings, `/rss.xml`, and `/sitemap.xml`.
   - Publishing a new public post automatically promotes it to `featured = true` and demotes any prior featured post inside the same DB transaction (`save-post.ts` & `services/cron.ts`).
   - Restoring a post from Trash (`restoreTrashedPost`) always restores it as `status: 'draft'` (`published: false`) so trashed content never goes live without explicit re-review.
   - Renaming a published slug (`savePostWithRedirect`) records a `301` in `redirects` while preventing loops, cycles, chains, or `301`-to-`404` targets (`src/lib/server/posts/redirect-integrity.ts`).
2. **Live CMS Workflow vs. Unimplemented Intake Automation:**
   - **Live Today:** Admin UI (`/admin/posts/new`, `/admin/posts/[id]`), SvelteKit remote functions (`posts.remote.ts`), REST endpoints (`/api/admin/posts*`, `/api/media/*`), automatic `@graph` JSON-LD generation from saved post fields (`src/lib/seo/blog-seo.ts`), and the legacy Markdown CLI (`pnpm db:import-posts`, `scripts/import-markdown-posts.ts` — defaults to `draft`; use with care).
   - **Proposed / Not Implemented Yet:** Automated single-package intake CLI/validator (`todo.md` §7). Never assume intake-package scripts exist in `scripts/` beyond what is in `package.json`.
3. **Server SEO Publish Gate (`enforcePublishSeoGate` in `src/lib/shared/seo/score.ts`):**
   - Publishing or scheduling requires a score **≥ `80/100`** and **zero blocking items**:
     - Meta title present & starts with an uppercase letter; meta description present;
     - Cover image or OG image set, with non-empty cover `alt` differing from the post title;
     - Author assigned, ≥ 1 category assigned, ≥ 1 tag assigned;
     - Body ≥ `300` words (`300–599` warns), ≥ `2` distinct external `https://` domains linked, and zero `IMAGE PLACEHOLDER` text.
   - **Editorial Punctuation Rule:** Authored punctuation (including em dashes and en dashes in quotes, ranges, code, and prose) is preserved untouched on save/autosave/restore; `editorial_em_dash` is a `0`-point non-blocking review advisory.

---

## 3. Public Cache Freshness & Cache Tags (`src/lib/server/posts/cache.ts`)

| Surface                                                            | `Cache-Control` Header                                                                                                                                     | `Vercel-Cache-Tag`           |
| :----------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------- |
| Public `/blog/[slug]` (`public`, live)                             | `public, s-maxage=300, stale-while-revalidate=60, stale-if-error=3600`                                                                                     | `blog-post:<slug>`           |
| Unfiltered `/blog`, `/blog/{category,tag}/[slug]` (valid page)     | `public, s-maxage=300, stale-while-revalidate=60, stale-if-error=3600` (note: `/blog` SSR discovery currently sets `no-store` for instant post visibility) | `blog-lists`                 |
| `/rss.xml` & `/sitemap.xml`                                        | `public, s-maxage=300, stale-while-revalidate=60`                                                                                                          | `blog-feed` / `blog-sitemap` |
| Draft preview, password-locked post, `?search=*`, or `404` / error | `private, no-store` (never cached at CDN)                                                                                                                  | none                         |

- **Phase 1b CDN Purge Status:** `invalidatePublicBlogCache` (`src/lib/server/posts/cache-tags.ts`) maps mutations to tags and invokes any registered `BlogCachePurger`. No hosted Vercel CDN purge token is wired yet (`todo.md` §7), so cached public article responses expire naturally within the ~`6`-minute (`300s + 60s`) window unless redeployed.
- **Coverage Probe:** Run `node scripts/blog-coverage-probe.mjs` against a running server when auditing blog route/status/header coverage.

---

## 4. Forward-Only `0004` Search Projection (`pnpm db:backfill-post-search`)

- Migration `drizzle/0004_*.sql` maintains internal derived `search_text` and `search_excluded` columns on `posts` (covering title, excerpt, subtitle/series, sanitized visible body, captions, and FAQs while excluding scripts/styles/malformed custom metadata).
- Current CMS writes refresh the projection in the same transaction; a DB trigger invalidates projections if an older writer mutates source columns, and read-only repeatable-read search derives pending rows on the fly without mutating DB state.
- Backfill CLI (safe keyset batches, preserves editorial timestamps):
  ```sh
  pnpm db:backfill-post-search --dry-run
  pnpm db:backfill-post-search --apply
  ```

---

## 5. Media Storage Drivers & Responsive Cover Crops

`POST /api/media/upload` converts raster uploads via `sharp` to WebP with `480w`, `800w`, and `1200w` width variants and stores them through `selectMediaStorageDriver(process.env)` in [`src/lib/server/media-storage.ts`](../src/lib/server/media-storage.ts):

| Environment / Flag                                                                    | Active Driver   | Storage Location & Behavior                                                                                                                                                     |
| :------------------------------------------------------------------------------------ | :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Production (`BLOB_READ_WRITE_TOKEN` set, or `MEDIA_STORAGE=blob`)                     | **Vercel Blob** | Public store `revolution-production-media` (`https://<store>.public.blob.vercel-storage.com/...`)                                                                               |
| Local dev / E2E (`MEDIA_STORAGE=disk`, or dev with no Blob token; `T8`)               | **Local Disk**  | `<repo>/.data/media/` served by `GET\|HEAD /media/[...path]` (`404` when Blob driver is active; atomic temp+rename writes; strict path-traversal rejection; CSP sandbox on SVG) |
| Production / `VERCEL=1` with **no** `BLOB_READ_WRITE_TOKEN` and `MEDIA_STORAGE` unset | **Hard Error**  | Throws on upload (zero silent ephemeral fallback)                                                                                                                               |

### Article Structured-Data Cover Crops (`src/lib/shared/cover-crops.ts`)

For PNG/JPEG/AVIF/WebP uploads, the pipeline also cuts up to three attention-cropped (`fit: 'cover', position: 'attention'`, never upscaled) WebP crops when the largest fit is **≥ `50,000` pixels** (`width × height`):

- `<stem>-<hex>-crop-16x9.webp` (up to `1200×675`)
- `<stem>-<hex>-crop-4x3.webp` (up to `1200×900`)
- `<stem>-<hex>-crop-1x1.webp` (up to `1200×1200`)

Stored in `media.variants_json` with `kind: 'crop'`. Any width-descriptor `srcset` builder must skip `isCropVariant(entry)` (`coverSrcsetFromMedia` already does). `getMediaCropsForUrl(post.coverImage)` supplies the `ImageObject[]` array to `buildBlogPostJsonLd`, while `og:image` / `twitter:image` retain the full `16:9` cover. Backfill existing media rows idempotently with `node --env-file-if-exists=.env scripts/backfill-blog-image-variants.ts [--apply]`.

### Approved Blog Image Budgets

- **Hero Cover:** `1600×900` or `1200×675` WebP (`< 90 KB`), `loading="eager"`, `fetchpriority="high"`, preloaded in `<svelte:head>` on `/blog/[slug]` and keyed with `{#key data.post.slug}`.
- **Archive Card:** `800×450` (`< 35 KB`) with accurate slot `sizes`.
- **Inline Diagram:** `1200×675` (`16:9` uncropped, `< 75 KB`) with stored `width`, `height`, `srcset`, and `sizes` injected by `lazyifyAndDimensionContentImages`.
- **Social Card:** `1200×630` (`< 80 KB`).

---

## 6. Admin Media Picker & TipTap Image UI Contract

Files: [`src/lib/components/admin/MediaLibrary.svelte`](../src/lib/components/admin/MediaLibrary.svelte), [`MediaSidebar.svelte`](../src/lib/components/admin/MediaSidebar.svelte), `FeaturedImagePanel.svelte`, `ImageControlMenu.svelte`, `src/lib/tiptap/image-with-dimensions.ts`.

1. **Stable `MediaInsertPayload` Contract:**
   ```ts
   {
   	item: MediaItem;
   	url: string;
   	width: number | null;
   	height: number | null;
   	alt: string; // never invented from filename or media title when blank!
   	caption: string;
   	size: 'thumbnail' | 'medium' | 'large' | 'full'; // default 'full'
   	align: 'left' | 'center' | 'right' | 'full'; // default 'center' — locked contract with TipTap ImageAlign
   	linkUrl: string;
   }
   ```
   Do **not** rename `align` values (`left`, `center`, `right`, `full`) without updating `src/lib/tiptap/image-with-dimensions.ts` and `src/lib/styles/prose.css` (`data-align="full"`) in the same change.
2. **Non-Invented Alt Text:** Empty `alt_text` stays `''` on insert and renders an editor-only red dashed outline + `"Add alt text"` chip (`image-alt-warning.ts`); the publish gate blocks missing/duplicate cover `alt`.
3. **Uploads, Bulk Actions & Deletion:** XHR `uploadWithProgress` (`POST /api/media/upload`) assigns unique `upload-N` queue IDs with `<progress>` bars; bulk move/delete runs with concurrency `3` (`409 MEDIA_IN_USE` lists referencing posts; deleted blobs cannot be restored and return `409 MEDIA_RESTORE_UNAVAILABLE`).
4. **Modal Accessibility:** `role="dialog"`, `aria-modal="true"`, focus moves to search input on open, `Tab` wraps, `Escape` clears bulk selection first and closes second, and focus restores to opener.
