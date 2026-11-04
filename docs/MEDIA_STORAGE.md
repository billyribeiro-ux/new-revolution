# Media storage

Uploaded images (`POST /api/media/upload`) are converted to WebP with 480/800/1200 variants and stored through one
driver, chosen by `selectMediaStorageDriver(process.env)` in `src/lib/server/media-storage.ts`.

| Situation                                                  | Driver                                                   |
| ---------------------------------------------------------- | -------------------------------------------------------- |
| `MEDIA_STORAGE=disk`                                       | Local disk (even in production, single server only)      |
| `MEDIA_STORAGE=blob`                                       | Vercel Blob (requires `BLOB_READ_WRITE_TOKEN`)           |
| unset, `BLOB_READ_WRITE_TOKEN` set                         | Vercel Blob (`access: public`, `addRandomSuffix: false`) |
| unset, no token, `NODE_ENV!=production` and `VERCEL` unset | Local disk                                               |
| unset, no token, on Vercel or `NODE_ENV=production`        | Error on first upload (no silent fallback)               |

## Local disk driver

- Files: `<repo>/.data/media/<stem>-<hex>-<width>w.webp` (gitignored). They survive dev-server restarts.
- URLs are absolute, `<ORIGIN>/media/<path>`, because post `coverImage`/`ogImage`/`twitterImage` must be absolute URLs.
  Rows pin the `ORIGIN` they were created under; change `ORIGIN` and old URLs point at the old host (the file route itself
  works on any host).
- Served by `src/routes/media/[...path]/+server.ts` (GET/HEAD): webp/png/jpg/jpeg/gif/avif/svg only, immutable cache,
  `nosniff`, weak ETag, CSP sandbox for SVG. It returns 404 unless the disk driver is the active driver.
- Writes are atomic (temp file + rename); paths with `..`, absolute, backslash or NUL are rejected.

## Switching to Vercel Blob

1. Create a Blob store in the Vercel project and set `BLOB_READ_WRITE_TOKEN` (Production, optionally Preview).
2. New uploads then get `https://<store>.public.blob.vercel-storage.com/...` URLs. Existing rows keep their
   `/media/...` URLs; re-upload them (or write a one-off copy script) before removing `.data/media`.
3. Remove the temporary row T8 in `docs/TEMPORARY.md` when the disk driver is no longer wanted.

Delete removes the original and variant files first, then soft-deletes the row; restore is refused (409
`MEDIA_RESTORE_UNAVAILABLE`) because the files are gone.

## Cover crops (Article structured data)

Google recommends Article `image` as several images of at least 50,000 px in 16x9, 4x3 and 1x1 (docs/SEO_EVIDENCE.md row 19).
For PNG/JPEG/AVIF/WebP uploads the pipeline therefore also stores up to three WebP crops cut from the original upload bytes
(EXIF-rotated, `fit: 'cover'`, `position: attention` so the most salient region stays in frame; `centre` would drop off-centre subjects):

| File                          | Target size (never upscaled)                             |
| ----------------------------- | -------------------------------------------------------- |
| `<stem>-<hex>-crop-16x9.webp` | 1200x675, or the largest exact 16:9 that fits the source |
| `<stem>-<hex>-crop-4x3.webp`  | 1200x900, or the largest exact 4:3 that fits the source  |
| `<stem>-<hex>-crop-1x1.webp`  | 1200x1200, capped by the source's shorter side           |

- A ratio whose largest fit is under 50,000 px (width x height) is skipped and nothing is recorded for it (e.g. 600x200 gets 16x9 and 4x3 only; 200x200 gets none). GIF and SVG are not cropped. A crop that fails to encode is skipped with a warning; a failed storage put cleans up every file already stored and writes no row (same allSettled pattern as the width variants).
- They live in `media.variants_json` under keys `crop-16x9` / `crop-4x3` / `crop-1x1` with `kind: 'crop'` and `aspect`. Width variants keep their numeric keys (`480`, `800`, `1200`) and have no `kind`. Anything that builds a width-descriptor `srcset` must skip entries where `kind === 'crop'` (`isCropVariant` in `src/lib/shared/cover-crops.ts`; `coverSrcsetFromMedia` already does).
- Delete and the in-use check use `allMediaRowUrls`, which includes crops, so a post that embeds a crop URL blocks deletion and delete removes the crop files.
- Existing rows: `pnpm tsx scripts/backfill-blog-image-variants.ts` (dry-run default; add `--apply`) now also runs `backfillCoverCrops`, which adds crops to rows with none (source = the stored original, so one extra lossy pass). Idempotent: rows that already have a crop or cannot yield a 50K px crop are skipped without fetching.

## End-to-end tests

`playwright.config.ts` builds and runs `vite preview` on port 4173. `vite preview` runs with `NODE_ENV=production`, where the driver
selector refuses to guess, so the e2e `webServer.env` sets `MEDIA_STORAGE=disk` (files go to `.data/media`, served by `/media/[...path]`)
and `ORIGIN=http://localhost:4173` (media URLs are absolute `<ORIGIN>/media/...`, so ORIGIN must equal the preview origin). This applies to the
e2e server only. `src/routes/admin/image-flow.e2e.ts` uploads through the UI and deletes its media, post and tag afterwards.
