/**
 * Launch gate: the single place that says which parts of the site are not ready to be found yet.
 *
 * Gated routes still exist and still render (so they can be built out and reviewed), but they are
 * kept out of search indexing until the owner flips them live:
 *   - the sitemap (and its database queries), offer catalog and homepage article ItemList
 *   - indexing: they emit `noindex` and no canonical (see `isNoIndexRoute`)
 * The owner requested CMS-backed homepage cards and visible Blog navigation on 2026-11-05.
 * The published blog is open for indexing; post and taxonomy eligibility still applies.
 * Store navigation/promotion and the unwritten eBook remain hidden.
 *
 * Why `noindex` and not a robots.txt `Disallow`: Google documents that robots.txt "is not a mechanism
 * for keeping a web page out of Google", and a disallowed URL "might still" be indexed when it is linked.
 * It also cannot read a `noindex` on a page it is not allowed to fetch
 * (https://developers.google.com/search/docs/crawling-indexing/robots/intro). `tests/seo/seo-standard.spec.ts`
 * asserts the same: noindex prefixes must not appear as `Disallow:` lines.
 *
 * To launch a section: remove its prefix here, then follow docs/seo/LAUNCH_TRACKER.md.
 * Temporary item T10 in docs/TEMPORARY.md.
 */
export const UNLAUNCHED_ROUTE_PREFIXES = ['/store'] as const;

/**
 * The free eBook ("The Institutional Execution Playbook") has not been written and no email delivery is
 * wired to it, so the homepage form, the announcement-bar link and the footer link stay hidden.
 * Set to `true` only when the PDF exists and `submitEbookLead` really sends it.
 */
export const FREE_EBOOK_AVAILABLE = false;

/** True when `pathname` (no query or hash) is, or is under, a route that has not launched. */
export function isUnlaunchedRoute(pathname: string): boolean {
	return UNLAUNCHED_ROUTE_PREFIXES.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
	);
}

/** True when an internal `href` (which may carry a query or hash) points at a route that is live. */
export function isLaunchedHref(href: string): boolean {
	return !isUnlaunchedRoute(href.split(/[?#]/, 1)[0] ?? href);
}

/**
 * Menu visibility is separate from indexing:
 * - Blog is launched and visible in navigation.
 * - Store routes are unlaunched and hidden on published production builds, but remain discoverable
 *   during local development (`import.meta.env.DEV`) so store pages can be worked on offline with
 *   the exact published site styling and structure.
 */
export function isNavigationHrefVisible(href: string, options?: { isDev?: boolean }): boolean {
	const pathname = href.split(/[?#]/, 1)[0] ?? href;
	const isStore = pathname === '/store' || pathname.startsWith('/store/');
	if (isStore) {
		return options?.isDev ?? Boolean(import.meta.env?.DEV);
	}
	return pathname === '/blog' || pathname.startsWith('/blog/') || isLaunchedHref(href);
}
