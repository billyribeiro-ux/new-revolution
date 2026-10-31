/**
 * Cover crops for Article/BlogPosting structured data.
 *
 * Google recommends multiple high-resolution images of at least 50,000 pixels (width x height) in
 * 16x9, 4x3 and 1x1 aspect ratios (docs/SEO_EVIDENCE.md row 19). Uploads therefore store up to three
 * extra WebP crops next to the width variants. They live in `media.variants_json` under the keys
 * `crop-16x9` / `crop-4x3` / `crop-1x1` and carry `kind: 'crop'`, so code that builds a width-descriptor
 * `srcset` must skip them (use `isCropVariant`). Pure module: no sharp, no DB, safe on the client.
 */

export const MEDIA_CROP_ASPECTS = ['16x9', '4x3', '1x1'] as const;
export type MediaCropAspect = (typeof MEDIA_CROP_ASPECTS)[number];

/** Google's minimum for Article `image` (width x height). */
export const MEDIA_CROP_MIN_PIXELS = 50_000;
/** Target (maximum) crop width; never upscaled beyond the source. */
export const MEDIA_CROP_TARGET_WIDTH = 1200;

const RATIOS: Record<MediaCropAspect, { w: number; h: number }> = {
	'16x9': { w: 16, h: 9 },
	'4x3': { w: 4, h: 3 },
	'1x1': { w: 1, h: 1 }
};

export function cropVariantKey(aspect: MediaCropAspect): string {
	return `crop-${aspect}`;
}

export interface CropVariantLike {
	url: string;
	width?: number | null;
	height?: number | null;
	kind?: string;
	aspect?: string;
}

export function isCropVariant(variant: object | null | undefined): boolean {
	return (variant as { kind?: string } | null | undefined)?.kind === 'crop';
}

export interface PlannedCrop {
	aspect: MediaCropAspect;
	width: number;
	height: number;
}

/**
 * Plans exact-ratio crop sizes: the largest size with width <= 1200 that fits inside the source (never
 * upscales). A crop whose area would be below 50,000 px is omitted (not recorded at all).
 */
export function planCoverCrops(
	sourceWidth: number | null | undefined,
	sourceHeight: number | null | undefined
): PlannedCrop[] {
	if (!sourceWidth || !sourceHeight || sourceWidth <= 0 || sourceHeight <= 0) return [];
	const plans: PlannedCrop[] = [];
	for (const aspect of MEDIA_CROP_ASPECTS) {
		const { w: rw, h: rh } = RATIOS[aspect];
		const maxWidth = Math.min(
			MEDIA_CROP_TARGET_WIDTH,
			sourceWidth,
			Math.floor((sourceHeight * rw) / rh)
		);
		// Width must be a multiple of rw so the height is an integer and the ratio is exact.
		const width = Math.floor(maxWidth / rw) * rw;
		if (width <= 0) continue;
		const height = (width / rw) * rh;
		if (width * height < MEDIA_CROP_MIN_PIXELS) continue;
		plans.push({ aspect, width, height });
	}
	return plans;
}

export interface CoverCrop {
	aspect: MediaCropAspect;
	url: string;
	width: number;
	height: number;
}

/** Extracts valid crops (known aspect, positive size, >= 50K px) from a media row's variants, ordered 16x9, 4x3, 1x1. */
export function extractCoverCrops(
	variants: Record<string, CropVariantLike> | null | undefined
): CoverCrop[] {
	if (!variants || typeof variants !== 'object') return [];
	const out: CoverCrop[] = [];
	for (const aspect of MEDIA_CROP_ASPECTS) {
		const v = variants[cropVariantKey(aspect)];
		if (!v || v.kind !== 'crop' || v.aspect !== aspect || !v.url) continue;
		const width = Number(v.width);
		const height = Number(v.height);
		if (!(width > 0) || !(height > 0) || width * height < MEDIA_CROP_MIN_PIXELS) continue;
		out.push({ aspect, url: v.url, width, height });
	}
	return out;
}
