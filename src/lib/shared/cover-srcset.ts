/**
 * Responsive `srcset` for blog cover images.
 *
 * Uploads store the original at its native width plus WebP variants at 480/800/1200 px, but ONLY
 * for widths strictly below the original (see `MEDIA_VARIANT_WIDTHS` and the upload service). A
 * srcset must therefore list only files that exist: an 800 px original has no `-1200w` file.
 */
import { isCropVariant } from './cover-crops';
import { MEDIA_VARIANT_WIDTHS } from './media-upload';

export interface CoverMediaRow {
	blobUrl: string;
	width: number | null;
	variantsJson?: Record<string, { width?: number | null; url: string; kind?: string }> | null;
}

export interface CoverSrcsetEntry {
	url: string;
	width: number;
}

const VARIANT_URL = /^(.*)-(\d{2,5})w\.webp$/i;

function format(entries: CoverSrcsetEntry[]): string | undefined {
	const byWidth = new Map<number, string>();
	for (const entry of entries) {
		if (entry.width > 0 && !byWidth.has(entry.width)) byWidth.set(entry.width, entry.url);
	}
	if (byWidth.size < 2) return undefined;
	return [...byWidth.entries()]
		.sort((a, b) => a[0] - b[0])
		.map(([width, url]) => `${url} ${width}w`)
		.join(', ');
}

/**
 * Preferred: build from the media row's REAL files. The cover URL may be the original or one of
 * the variants; the srcset lists every stored file no wider than the cover, so the editor's
 * chosen size stays the largest candidate.
 */
export function coverSrcsetFromMedia(
	coverUrl: string,
	row: CoverMediaRow | null | undefined
): string | undefined {
	if (!row) return undefined;
	const files: CoverSrcsetEntry[] = [];
	if (row.width) files.push({ url: row.blobUrl, width: row.width });
	for (const variant of Object.values(row.variantsJson ?? {})) {
		// Fixed-ratio crops share no width ladder with the originals: never list them in a width srcset.
		if (isCropVariant(variant)) continue;
		if (variant?.kind === 'crop') continue;
		if (variant?.url && variant.width) files.push({ url: variant.url, width: variant.width });
	}
	const cover = files.find((f) => f.url === coverUrl);
	if (!cover) return undefined;
	return format(files.filter((f) => f.width <= cover.width));
}

/**
 * Fallback when no media row is known (e.g. a hand-typed cover URL): infer from the
 * `-{width}w.webp` naming convention. Only widths strictly below the URL's own width are
 * emitted, plus the URL itself, so no candidate points at a file that was never generated.
 */
export function coverSrcsetFromUrl(url: string | null | undefined): string | undefined {
	if (!url) return undefined;
	const match = url.match(VARIANT_URL);
	if (!match?.[1] || !match[2]) return undefined;
	const width = Number.parseInt(match[2], 10);
	const prefix = match[1];
	const entries: CoverSrcsetEntry[] = MEDIA_VARIANT_WIDTHS.filter((w) => w < width).map((w) => ({
		url: `${prefix}-${w}w.webp`,
		width: w
	}));
	entries.push({ url, width });
	return format(entries);
}
