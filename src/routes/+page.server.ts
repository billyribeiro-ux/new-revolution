import { error } from '@sveltejs/kit';
import { getPublicBlogListing } from '#lib/server/services/blog-discovery';
import { setNoStoreCache } from '#lib/server/posts/cache';
import { emptyBlogListing, HOME_BLOG_PAGE_SIZE } from '#lib/shared/blog/discovery';
import type { BlogListing } from '#lib/shared/blog/discovery';
import { isPageOutOfRange, parsePageParam } from '#lib/shared/blog/pagination';
import type { PageServerLoad } from './$types';

/** CMS publication must update the homepage without rebuilding static output. */
export const prerender = false;

export const load: PageServerLoad = async ({ url, setHeaders }) => {
	setNoStoreCache(setHeaders);
	const parsed = parsePageParam(url.searchParams.get('blogPage'));
	if (!parsed.ok) error(404, 'Page not found');
	let blogListing: BlogListing;
	try {
		blogListing = await getPublicBlogListing({ page: parsed.page, perPage: HOME_BLOG_PAGE_SIZE });
	} catch (err) {
		console.error('[/] Blog discovery unavailable:', err);
		return { blogListing: emptyBlogListing(), blogUnavailable: true };
	}
	if (isPageOutOfRange(parsed.page, blogListing.pagination.totalPages))
		error(404, 'Page not found');
	return { blogListing, blogUnavailable: false };
};
