import type { MediaItem } from '#lib/shared/media-upload';

/** The subset of the picker's MediaInsertPayload that the editor wiring reads. */
export interface PickedMedia {
	item: MediaItem;
	url: string;
	width: number | null;
	height: number | null;
	alt: string;
	caption: string;
	size: 'thumbnail' | 'medium' | 'large' | 'full';
}

/**
 * Alt text for a picked image. The picker falls back to the media TITLE when the item has no alt;
 * that is an invented description, so it is dropped here. Alt is only ever what the author typed
 * or what the media item really carries; otherwise it stays empty and the editor/gate flag it.
 */
export function pickedAlt(payload: Pick<PickedMedia, 'item' | 'alt'>): string {
	const alt = (payload.alt ?? '').trim();
	if (!alt) return '';
	const itemAlt = (payload.item.alt_text ?? '').trim();
	if (!itemAlt && alt === (payload.item.title ?? '').trim()) return '';
	return alt;
}

export interface PickedCover {
	url: string;
	width: number | null;
	height: number | null;
	alt: string;
	caption: string;
}

/**
 * Featured image from a picked media item. The default variant is `large` (1200w). The picker's
 * own default size is `full`; an explicit non-`full` choice in the picker is respected.
 */
export function resolveCoverFromPick(payload: PickedMedia): PickedCover {
	const large =
		payload.size === 'full'
			? payload.item.available_sizes.find((s) => s.value === 'large' && s.available && s.url)
			: undefined;
	return {
		url: large?.url ?? payload.url,
		width: large ? (large.width ?? payload.item.width) : payload.width,
		height: large ? (large.height ?? payload.item.height) : payload.height,
		alt: pickedAlt(payload),
		caption: (payload.caption ?? '').trim()
	};
}
