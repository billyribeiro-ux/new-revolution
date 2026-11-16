import { sanitizePostHtml } from '../../sanitize-post-html.ts';
import { normalizePostHeadings } from '../../shared/seo/toc.ts';

export function stripDuplicateLeadImage(
	html: string,
	coverImageUrl: string | null | undefined
): string {
	if (!html || !coverImageUrl) return html;
	const getFileStem = (url: string) => {
		const filename = url.split('/').pop()?.split('?')[0] ?? '';
		return filename
			.replace(/-(?:480|800|1200)w\.(?:webp|png|jpe?g|avif)$/i, '')
			.replace(/\.[a-z0-9]+$/i, '')
			.toLowerCase();
	};
	const coverStem = getFileStem(coverImageUrl);
	if (!coverStem) return html;
	return html.replace(
		/^\s*(?:<p>\s*)?<img\b[^>]*?\bsrc=["']([^"']+)["'][^>]*>\s*(?:<\/p>)?/i,
		(full, imgSrc: string) => (getFileStem(imgSrc) === coverStem ? '' : full)
	);
}

/** Search and the public renderer must prepare exactly the same authored body. */
export function preparePublicPostContent(
	content: string,
	title: string,
	coverImage?: string | null
) {
	return normalizePostHeadings(
		stripDuplicateLeadImage(sanitizePostHtml(content), coverImage),
		title
	);
}
