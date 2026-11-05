/**
 * Pagination policy for the blog index and the category and tag archives (docs/seo/DECISIONS.md section 6).
 *
 * - Every page has its own URL (`?page=n`) and, when indexable, its own self-referencing canonical. Google:
 *   "give each page its own canonical URL"; the first page is not the canonical of later pages.
 * - Page 1 has one URL: the bare path. `?page=1` is never emitted by our links and is canonicalized to it.
 * - A `page` value that is not a positive integer, or is beyond the last page, is a 404, never an empty 200
 *   (that would be a soft 404).
 */

export const BLOG_PAGE_SIZE = 12;

/** Largest page number accepted. Bounds the integer and rejects absurd input before any query runs. */
const MAX_PAGE = 100_000;

export type PageParam = { ok: true; page: number } | { ok: false };

/** `null` (parameter absent) is page 1. Anything else must be a plain positive integer without sign or padding. */
export function parsePageParam(raw: string | null): PageParam {
	if (raw === null) return { ok: true, page: 1 };
	if (!/^[1-9]\d{0,5}$/.test(raw)) return { ok: false };
	const page = Number(raw);
	return page <= MAX_PAGE ? { ok: true, page } : { ok: false };
}

/**
 * True when `page` does not exist. An empty collection still has a page 1 (the empty state), so only pages
 * beyond that are out of range.
 */
export function isPageOutOfRange(page: number, totalPages: number): boolean {
	return page > Math.max(1, totalPages);
}

/** `/blog` for page 1, `/blog?page=3` otherwise. Extra params (such as `search`) are kept, `page` is added last. */
export function pageHref<T extends string>(
	basePath: T,
	page: number,
	extra: Readonly<Record<string, string>> = {}
): T | `${T}?${string}` {
	const params = new URLSearchParams(extra);
	if (page > 1) params.set('page', String(page));
	const query = params.toString();
	return query ? `${basePath}?${query}` : basePath;
}

/** Suffix that keeps titles and descriptions of later pages distinct from page 1. */
export function pageLabel(page: number): string {
	return page > 1 ? ` (Page ${page})` : '';
}
