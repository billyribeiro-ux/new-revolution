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

/**
 * Replaces em (\u2014) and en (\u2013) dashes in plain text while preserving URLs:
 * - digit-dash-optional `$`-digit -> "<a> to <b>"
 * - leading dash at start of string or line -> dropped
 * - all other em/en dashes -> ", "
 * - collapses duplicate commas `,\s*,`
 */
export function replaceEmEnDashesInPlainText(text: string): string {
	if (!text || !DASH_CHAR_REGEX.test(text)) return text;

	// Protect URLs so dashes in URLs are never rewritten
	const urls: string[] = [];
	const withProtectedUrls = text.replace(/https?:\/\/[^\s"'<>)+]+/gi, (match) => {
		const idx = urls.length;
		urls.push(match);
		return `__RTP_URL_TOKEN_${idx}__`;
	});

	let out = withProtectedUrls
		// 1. Numeric ranges: 15–20 or $500—$1,000 -> "15 to 20" / "$500 to $1,000"
		.replace(/(\$?\d[\d,.]*)\s*[\u2013\u2014]\s*(\$?\d[\d,.]*)/g, '$1 to $2')
		// 2. Leading dash at line start
		.replace(/(^|\n)(\s*)[\u2013\u2014]\s*/g, '$1$2')
		// 3. Remaining em/en dashes -> ", "
		.replace(/\s*[\u2013\u2014]\s*/g, ', ')
		// 4. Collapse duplicate commas
		.replace(/,\s*,+/g, ', ')
		.replace(/^,\s*/, '');

	// Restore URLs
	out = out.replace(/__RTP_URL_TOKEN_(\d+)__/g, (_, idxStr) => urls[Number(idxStr)] ?? '');
	return out;
}

/**
 * HTML-aware em/en dash replacement (Section 7.4):
 * - Skips `<pre>...</pre>` and `<code>...</code>` subtrees completely
 * - Skips HTML tag definitions (`<...>`) so attribute values and URLs are untouched
 * - Drops a leading dash immediately following `>`
 */
export function replaceEmEnDashesInHtml(html: string): string {
	if (!html || !DASH_CHAR_REGEX.test(html)) return html;

	// Protect <pre> and <code> blocks first
	const codeBlocks: string[] = [];
	const withProtectedCode = html.replace(/<(pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi, (match) => {
		const idx = codeBlocks.length;
		codeBlocks.push(match);
		return `__RTP_CODE_TOKEN_${idx}__`;
	});

	// Split by HTML tags `<...>` so we only transform text nodes
	const parts = withProtectedCode.split(/(<[^>]+>)/g);
	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		if (!part || part.startsWith('<')) continue;
		// Leading dash right after a closing `>` tag
		const strippedLeading = part.replace(/^\s*[\u2013\u2014]\s*/, '');
		parts[i] = replaceEmEnDashesInPlainText(strippedLeading);
	}

	const joined = parts.join('');
	return joined.replace(
		/__RTP_CODE_TOKEN_(\d+)__/g,
		(_, idxStr) => codeBlocks[Number(idxStr)] ?? ''
	);
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
 * 5. Replace em and en dashes in the body with HTML-aware logic (skip <pre>, <code>, attributes, URLs)
 * 6. Replace dashes in title, metaTitle, metaDescription, excerpt, coverImageAlt, coverImageCaption,
 *    ogTitle, ogDescription, twitterTitle, twitterDescription, faqItems, focusKeyword, secondaryKeywords
 */
export async function applyContentSeoTransforms<T extends ContentTransformPayload>(
	input: T,
	mediaLookup?: MediaLookupFn
): Promise<ContentTransformResult<T>> {
	const clone: T = { ...input };
	const changes: string[] = [];

	// Transform title dashes first so duplicate-heading comparison matches cleaned title
	const cleanTitle = replaceEmEnDashesInPlainText(clone.title);
	if (cleanTitle !== clone.title) {
		clone.title = cleanTitle;
		changes.push('stripped_dashes:title');
	}

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

	// Step 5: HTML-aware dash replacement in body
	const bodyAfterDashes = replaceEmEnDashesInHtml(clone.content);
	if (bodyAfterDashes !== clone.content) {
		clone.content = bodyAfterDashes;
		changes.push('stripped_dashes:content');
	}

	// Step 6: Plain-text dash replacement in metadata and JSON fields
	const textFields = [
		'metaTitle',
		'metaDescription',
		'excerpt',
		'coverImageAlt',
		'coverImageCaption',
		'ogTitle',
		'ogDescription',
		'twitterTitle',
		'twitterDescription',
		'focusKeyword'
	] as const;

	for (const field of textFields) {
		const val = clone[field];
		if (typeof val === 'string' && val.length > 0) {
			const cleaned = replaceEmEnDashesInPlainText(val);
			if (cleaned !== val) {
				(clone as Record<string, unknown>)[field] = cleaned;
				changes.push(`stripped_dashes:${field}`);
			}
		}
	}

	if (typeof clone.faqItems === 'string' && clone.faqItems.trim() !== '') {
		try {
			const parsed: unknown = JSON.parse(clone.faqItems);
			if (Array.isArray(parsed)) {
				let faqChanged = false;
				const nextFaq = parsed.map((item) => {
					if (typeof item !== 'object' || item === null) return item;
					const q =
						typeof (item as { question?: unknown }).question === 'string'
							? replaceEmEnDashesInPlainText((item as { question: string }).question)
							: '';
					const a =
						typeof (item as { answer?: unknown }).answer === 'string'
							? replaceEmEnDashesInPlainText((item as { answer: string }).answer)
							: '';
					if (
						q !== (item as { question?: string }).question ||
						a !== (item as { answer?: string }).answer
					) {
						faqChanged = true;
					}
					return { question: q, answer: a };
				});
				if (faqChanged) {
					clone.faqItems = JSON.stringify(nextFaq);
					changes.push('stripped_dashes:faqItems');
				}
			}
		} catch {
			// Invalid JSON will be caught by schema validation
		}
	}

	if (typeof clone.secondaryKeywords === 'string' && clone.secondaryKeywords.trim() !== '') {
		try {
			const parsed: unknown = JSON.parse(clone.secondaryKeywords);
			if (Array.isArray(parsed)) {
				let kwChanged = false;
				const nextKw = parsed.map((kw) => {
					if (typeof kw !== 'string') return kw;
					const cleaned = replaceEmEnDashesInPlainText(kw);
					if (cleaned !== kw) kwChanged = true;
					return cleaned;
				});
				if (kwChanged) {
					clone.secondaryKeywords = JSON.stringify(nextKw);
					changes.push('stripped_dashes:secondaryKeywords');
				}
			}
		} catch {
			// Invalid JSON will be caught by schema validation
		}
	}

	return {
		data: clone,
		changes
	};
}
