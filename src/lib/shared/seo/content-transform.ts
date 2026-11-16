import { normaliseComparisonText, stripHtmlToText } from './toc';

export interface MediaDimensionLookupItem {
	blobUrl: string;
	width: number | null;
	height: number | null;
	altText: string;
}

export type MediaLookupFn = (
	urls: string[]
) => Promise<Map<string, MediaDimensionLookupItem>> | Map<string, MediaDimensionLookupItem>;

const DASH_CHAR_REGEX = /[\u2013\u2014]/;

export function hasEmOrEnDash(text: string | null | undefined): boolean {
	if (!text) return false;
	return DASH_CHAR_REGEX.test(text);
}

export function stripLeadingDuplicateHeading(
	html: string,
	title: string
): {
	html: string;
	stripped: boolean;
} {
	if (!html || !title.trim()) return { html, stripped: false };
	const normTitle = normaliseComparisonText(title);
	if (!normTitle) return { html, stripped: false };

	let checkedFirst = false;
	let stripped = false;

	const nextHtml = html.replace(
		/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gis,
		(full, levelStr, inner) => {
			if (checkedFirst) return full;
			checkedFirst = true;
			const level = Number(levelStr);
			if (
				(level === 1 || level === 2) &&
				normaliseComparisonText(stripHtmlToText(inner)) === normTitle
			) {
				stripped = true;
				return '';
			}
			return full;
		}
	);

	return { html: nextHtml.trim(), stripped };
}

export function extractImageSrcsFromHtml(html: string): string[] {
	const srcs = new Set<string>();
	for (const match of html.matchAll(/<img\b[^>]*?\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)')/gi)) {
		const src = (match[1] ?? match[2] ?? '').trim();
		if (src) srcs.add(src);
	}
	return [...srcs];
}

function getAttr(tag: string, attrName: string): string | undefined {
	const regex = new RegExp(`\\b${attrName}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i');
	const m = tag.match(regex);
	if (!m) return undefined;
	return m[1] ?? m[2] ?? '';
}

function setOrReplaceAttr(tag: string, attrName: string, value: string): string {
	const escaped = value.replace(/"/g, '&quot;');
	const regex = new RegExp(`(\\b${attrName}\\s*=\\s*)(?:"[^"]*"|'[^']*')`, 'i');
	if (regex.test(tag)) {
		return tag.replace(regex, `$1"${escaped}"`);
	}
	return tag.replace(/(\s*\/?)>$/, ` ${attrName}="${escaped}"$1>`);
}

export interface ContentTransformPayload {
	title: string;
	content: string;
	metaTitle?: string | null;
	metaDescription?: string | null;
	excerpt?: string | null;
	coverImageAlt?: string | null;
	coverImageCaption?: string | null;
	ogTitle?: string | null;
	ogDescription?: string | null;
	twitterTitle?: string | null;
	twitterDescription?: string | null;
	faqItems?: string | null;
	focusKeyword?: string | null;
	secondaryKeywords?: string | null;
	customFields?: string | null;
}

export interface ContentTransformResult<T extends ContentTransformPayload> {
	data: T;
	changes: string[];
}

/**
 * Runs all 6 steps of Section 7.4 in exact order:
 * 1. Strip the first <h1> or <h2> whose normalised text equals the title
 * 2. One media lookup for all <img src> in content (excluding soft-deleted rows)
 * 3. Inject width and height on <img> when either is missing and the media row has both
 * 4. Backfill EMPTY alt from media.alt_text (never overwrite an explicit alt)
 * Authored punctuation is preserved. Editorial review is advisory, not a save transform.
 */
export async function applyContentSeoTransforms<T extends ContentTransformPayload>(
	input: T,
	mediaLookup?: MediaLookupFn
): Promise<ContentTransformResult<T>> {
	const clone: T = { ...input };
	const changes: string[] = [];

	// Step 1: Strip first h1 or h2 equal to title
	const headingStrip = stripLeadingDuplicateHeading(clone.content, clone.title);
	if (headingStrip.stripped) {
		clone.content = headingStrip.html;
		changes.push('stripped_duplicate_lead_heading');
	}

	// Step 2, 3, 4: Single media lookup, inject missing width/height, backfill empty alt
	const imgSrcs = extractImageSrcsFromHtml(clone.content);
	if (imgSrcs.length > 0 && mediaLookup) {
		const mediaMap = await mediaLookup(imgSrcs);
		if (mediaMap.size > 0) {
			let injectedDimensions = false;
			let backfilledAlt = false;

			clone.content = clone.content.replace(/<img\b[^>]*>/gi, (imgTag) => {
				const src = getAttr(imgTag, 'src')?.trim();
				if (!src) return imgTag;
				const mediaRow = mediaMap.get(src);
				if (!mediaRow) return imgTag;

				let updatedTag = imgTag;
				const currentWidth = getAttr(updatedTag, 'width')?.trim();
				const currentHeight = getAttr(updatedTag, 'height')?.trim();

				if (
					(!currentWidth || !currentHeight) &&
					typeof mediaRow.width === 'number' &&
					mediaRow.width > 0 &&
					typeof mediaRow.height === 'number' &&
					mediaRow.height > 0
				) {
					if (!currentWidth) {
						updatedTag = setOrReplaceAttr(updatedTag, 'width', String(mediaRow.width));
					}
					if (!currentHeight) {
						updatedTag = setOrReplaceAttr(updatedTag, 'height', String(mediaRow.height));
					}
					injectedDimensions = true;
				}

				const currentAlt = getAttr(updatedTag, 'alt');
				if (
					(!currentAlt || currentAlt.trim() === '') &&
					mediaRow.altText &&
					mediaRow.altText.trim() !== ''
				) {
					updatedTag = setOrReplaceAttr(updatedTag, 'alt', mediaRow.altText.trim());
					backfilledAlt = true;
				}

				return updatedTag;
			});

			if (injectedDimensions) changes.push('injected_img_dimensions');
			if (backfilledAlt) changes.push('backfilled_img_alt');
		}
	}

	return {
		data: clone,
		changes
	};
}
