export interface TocEntry {
	id: string;
	text: string;
	level: number;
}

export function stripHtmlToText(html: string): string {
	return html
		.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/&quot;/gi, '"')
		.replace(/&#39;|&apos;/gi, "'")
		.replace(/\s+/g, ' ')
		.trim();
}

export function normaliseComparisonText(text: string): string {
	return stripHtmlToText(text)
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function slugifyHeadingId(text: string, usedIds: Map<string, number>): string {
	const base =
		stripHtmlToText(text)
			.normalize('NFKD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'section';

	const seen = usedIds.get(base) ?? 0;
	usedIds.set(base, seen + 1);
	return seen === 0 ? base : `${base}-${seen + 1}`;
}

export function isCtaHeadingText(plainText: string): boolean {
	const norm = normaliseComparisonText(plainText);
	return norm === 'cta' || norm === 'call to action';
}

/**
 * Shared heading normaliser and TOC generator (Section 10.3 & 4.7).
 * - Removes a first h1/h2 whose normalised text equals `postTitle`
 * - Demotes remaining body `<h1>` to `<h2>`
 * - Strips any existing `id` attribute on headings
 * - Assigns deterministic slug-based IDs with `-2`, `-3` deduplication
 * - Excludes headings titled "CTA" or "Call to Action" from `toc` while still assigning an `id`
 */
export function normalizePostHeadings(
	html: string,
	postTitle: string = ''
): { html: string; toc: TocEntry[] } {
	if (!html) return { html: '', toc: [] };

	const normTitle = normaliseComparisonText(postTitle);
	const usedIds = new Map<string, number>();
	const toc: TocEntry[] = [];
	let seenFirstHeading = false;

	const transformed = html.replace(
		/<h([1-6])(\b[^>]*)>([\s\S]*?)<\/h\1>/gis,
		(fullMatch, levelStr: string, rawAttrs: string, innerHtml: string) => {
			const rawLevel = parseInt(levelStr, 10);
			const plainText = stripHtmlToText(innerHtml);

			if (!seenFirstHeading) {
				seenFirstHeading = true;
				if (
					normTitle &&
					(rawLevel === 1 || rawLevel === 2) &&
					normaliseComparisonText(plainText) === normTitle
				) {
					return '';
				}
			}

			const effectiveLevel = rawLevel === 1 ? 2 : rawLevel;
			const attrsWithoutId = rawAttrs.replace(/\s+\bid\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

			if (!plainText) {
				return `<h${effectiveLevel}${attrsWithoutId}>${innerHtml}</h${effectiveLevel}>`;
			}

			const headingId = slugifyHeadingId(plainText, usedIds);
			if (!isCtaHeadingText(plainText)) {
				toc.push({
					id: headingId,
					text: plainText,
					level: effectiveLevel
				});
			}

			return `<h${effectiveLevel}${attrsWithoutId} id="${headingId}">${innerHtml}</h${effectiveLevel}>`;
		}
	);

	return {
		html: transformed,
		toc
	};
}

export function extractTocFromHtml(html: string, postTitle: string = ''): TocEntry[] {
	return normalizePostHeadings(html, postTitle).toc;
}

export function countContentWords(html: string): number {
	const plain = stripHtmlToText(html);
	if (!plain) return 0;
	return plain.split(/\s+/).filter(Boolean).length;
}

export function computeReadingTime(wordCount: number): number {
	if (wordCount <= 0) return 0;
	return Math.max(1, Math.ceil(wordCount / 200));
}
