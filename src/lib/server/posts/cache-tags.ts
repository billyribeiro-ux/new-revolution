/**
 * Cache tags for the public blog responses (docs/blog/FRESHNESS.md).
 *
 * Vercel's CDN can purge every cached response that carries a tag (`Vercel-Cache-Tag` response header, a
 * comma-separated list). Rules from "Purging Vercel CDN Cache": tags are case-sensitive, must not contain a comma,
 * are at most 256 UTF-8 bytes, and a response may carry at most 128.
 *
 * Granularity: a post change purges that post, every list (index, category, tag; they and the article page's
 * related content are derived from the post set), the feed and the sitemap. That over-purges lists on purpose:
 * it is always correct, and cheap for a publication this size.
 */

export const BLOG_LISTS_TAG = 'blog-lists';
export const BLOG_FEED_TAG = 'blog-feed';
export const BLOG_SITEMAP_TAG = 'blog-sitemap';

const MAX_TAG_BYTES = 256;
const MAX_TAGS_PER_RESPONSE = 128;

export const postCacheTag = (slug: string): string => `blog-post:${slug}`;

/** Non-empty, no comma, no whitespace or control characters, within the byte limit. */
export function isValidCacheTag(tag: string): boolean {
	if (tag.length === 0 || /[,\s]/.test(tag)) return false;
	for (const char of tag) {
		const code = char.codePointAt(0) ?? 0;
		// C0 controls and DEL are never valid in a header value.
		if (code < 0x20 || code === 0x7f) return false;
	}
	return new TextEncoder().encode(tag).length <= MAX_TAG_BYTES;
}

/** Valid, de-duplicated tags in first-seen order, capped at the per-response limit. */
export function normalizeCacheTags(tags: readonly string[]): string[] {
	return [...new Set(tags.filter(isValidCacheTag))].slice(0, MAX_TAGS_PER_RESPONSE);
}

/** Value for the `Vercel-Cache-Tag` header. */
export function cacheTagHeaderValue(tags: readonly string[]): string {
	return normalizeCacheTags(tags).join(',');
}

/** Tags carried by an article response. */
export const articleCacheTags = (slug: string): string[] =>
	normalizeCacheTags([postCacheTag(slug), BLOG_LISTS_TAG]);

/** Tags carried by an index, category or tag archive response. */
export const listCacheTags = (): string[] => [BLOG_LISTS_TAG];

/**
 * Maps the URL paths a lifecycle event invalidates (see `invalidatePublicBlogCache` callers) to the tags that
 * purge them. Unknown paths contribute nothing.
 */
export function tagsForInvalidatedPaths(paths: readonly string[]): string[] {
	const tags: string[] = [];
	for (const raw of paths) {
		const path = raw.split(/[?#]/, 1)[0] ?? raw;
		if (path === '/rss.xml') {
			tags.push(BLOG_FEED_TAG);
		} else if (path === '/sitemap.xml') {
			tags.push(BLOG_SITEMAP_TAG);
		} else if (path === '/blog' || /^\/blog\/(?:category|tag)\/[^/]+$/.test(path)) {
			tags.push(BLOG_LISTS_TAG);
		} else {
			const article = /^\/blog\/([^/]+)$/.exec(path);
			if (article?.[1] && article[1] !== 'category' && article[1] !== 'tag') {
				tags.push(postCacheTag(article[1]), BLOG_LISTS_TAG);
			}
		}
	}
	return normalizeCacheTags(tags);
}
