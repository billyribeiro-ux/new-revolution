# Media UI contract

## Cover crops

Service: `getMediaCropsForUrl(coverUrl)` from `src/lib/server/services/media.ts`.

```ts
import { getMediaCropsForUrl } from '#lib/server/services/media';
const coverImageCrops = await getMediaCropsForUrl(post.coverImage); // CoverCrop[]
```

- Input: the post's `coverImage` URL. It may be the original, a width variant (`-1200w.webp`) or a crop URL of the same media row. Unknown URL, deleted row, null: returns `[]`.
- Output (`CoverCrop` in `src/lib/shared/cover-crops.ts`): `{ aspect: '16x9' | '4x3' | '1x1', url, width, height }`, ordered 16x9, 4x3, 1x1, every entry >= 50,000 px. URLs are what the storage driver returned (absolute for the disk and Blob drivers).
- Public page (`src/routes/blog/[slug]/+page.server.ts`), owned by the public-page agent: pass it to the JSON-LD builder, e.g. `buildBlogPostJsonLd({ ..., coverImageCrops })`. The builder emits `image` as an ImageObject array (16x9, 4x3, 1x1) when crops exist and the single cover ImageObject otherwise. `og:image`/`twitter:image` stay the large cover; do not use crops there.
- The page already loads all active `media` rows (`allMediaRowsByUrl` style code at ~line 140); if you prefer no extra query, use `extractCoverCrops(coverMediaRow.variantsJson)` from `src/lib/shared/cover-crops.ts` on the matched row instead.
- `variantsJson` now also contains `crop-*` entries (`kind: 'crop'`). Width-keyed consumers are unaffected, but anything that iterates `Object.values(variantsJson)` to build a width `srcset` must skip `kind === 'crop'` (`deriveVariantSrcset` in the blog page: add `if (v.kind === 'crop') continue`, or switch to `coverSrcsetFromMedia`, which already skips them). Using crop URLs for dimension lookup (as the page does for lazy `width`/`height`) is correct: each crop record carries its own width and height.
- Library UI: crops are not listed as sizes (`available_sizes`/`urls` are unchanged); no client change is required.

## Picker (`MediaLibrary.svelte`)

Files: `src/lib/components/admin/MediaLibrary.svelte` (orchestrator) plus `MediaModalHeader`, `MediaToolbar`, `MediaBulkBar`,
`MediaGrid`, `MediaSidebar`, `MediaUploadPanel`, `MediaUploadQueue`, `media-client.ts` (XHR upload, delete/move requests,
`runBounded`) and `media-library.css` (shared `.ml-*` control styles). Specs: `MediaLibrary.svelte.spec.ts`, `media-client.spec.ts`.

### Props and events (unchanged for existing callers)

| Prop                                               | Type                                 | Meaning                                                                                         |
| -------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `mode`                                             | `'modal' \| 'page'` (default `page`) | `modal` renders `role="dialog"`, traps Tab, closes on Escape; `page` is the `/admin/media` view |
| `isOpen`                                           | `boolean` (default `true`)           | Modal visibility                                                                                |
| `initialItems` / `initialFolders` / `initialTotal` | server-loaded first page             | Skips the first `GET /api/media/list` when non-empty                                            |
| `onSelect(payload)`                                | `(MediaInsertPayload) => void`       | Insert mode (modal only). Its presence shows the insert settings and "Insert Into Post"         |
| `onClose()`                                        | `() => void`                         | Close button, Escape (when nothing is ticked for bulk actions)                                  |

### `MediaInsertPayload` (stable)

```ts
{
	item: MediaItem; // full API item, unchanged
	url: string; // URL of the chosen size (falls back to the 'full' size, then urls.original)
	width: number | null; // dimensions of the chosen size
	height: number | null;
	alt: string; // edited alt || item.alt_text || item.title (may be '' only if all three are empty)
	caption: string;
	size: 'thumbnail' | 'medium' | 'large' | 'full';
	align: 'left' | 'center' | 'right' | 'full';
	linkUrl: string; // '' when unset
}
```

Alignment value names are a contract with the editor image extension (`src/lib/tiptap/image-with-dimensions.ts`,
`ImageAlign`): the picker emits exactly `left`, `center`, `right`, `full` (labels: Float Left, Center, Float Right,
Full Width; default `center`). Do not rename or add values without changing the editor in the same PR. Default
`size` is `'full'`, reset every time a different item is selected.

Selecting is single-item: click selects (inspector shows), double-click or "Insert Into Post" emits the payload. Bulk
checkboxes never change what is inserted.

### Upload

- Client: `uploadWithProgress` (`XMLHttpRequest`, because `fetch` has no upload progress) posts multipart `file`, `folder`,
  `alt_text` to `POST /api/media/upload`. Progress is the request-body percentage (`upload.onprogress`); at 100% the row reads
  "Processing..." while the server converts and writes variants.
- Queue entries have a generated id (`upload-N`), never the file name, so same-named files are legal. One file uploads at a time;
  files added during a run are appended. Each row has a `<progress>` (implicit progressbar role) and its own visible error.
- Entry points: "Choose files" button (keyboard path), drop on the Upload tab zone, drop anywhere on the Library tab grid
  (uses the Target Folder field, else the active folder filter). Files over `MEDIA_UPLOAD_MAX_BYTES` are rejected before sending.
- No paste handler in the picker: the reference picker has none either (paste lives in the editor).

### Bulk actions

Per-card (and table-row) checkboxes, shift-click range, "Select all on page", "Clear selection". Ticked items persist across
pages. Actions use the single-item endpoints (no bulk endpoint exists) with concurrency `MEDIA_BULK_CONCURRENCY` (3):

- Move: `PATCH /api/media/:id { folder }` (`''` = Root).
- Delete: `DELETE /api/media/:id` after a `ConfirmDialog`.

Every item reports its own result. Failures stay ticked, are listed with the server message, and a 409 `MEDIA_IN_USE`
lists the referencing posts. The write endpoints allow 60 requests per minute per admin, so a bulk run over 60 items will
surface the 429 for the remainder per item rather than hide it.

### Focus and announcements

Modal: `aria-modal`, `aria-label="Media Library Picker"`, focus moves to the search box on open, Tab wraps inside, Escape
clears a bulk selection first and closes second, keystrokes do not reach editor shortcuts underneath, focus returns to the
opener on close. Errors render in a persistent `role="alert"` region, results in a persistent `role="status"` region.
Arrow keys move between cards in grid view.
