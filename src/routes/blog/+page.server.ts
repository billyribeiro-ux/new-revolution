import { error } from '@sveltejs/kit';
import { buildBlogIndexJsonLd, buildBlogPageMetaTags } from '#lib/seo/blog-seo';
import { setNoStoreCache } from '#lib/server/posts/cache';
import { listPublicCategoriesWithCounts } from '#lib/server/services/categories';
import { getPublicBlogListing } from '#lib/server/services/blog-discovery';
import type { BlogListing } from '#lib/shared/blog/discovery';
import {
	BLOG_PAGE_SIZE,
	isPageOutOfRange,
	pageLabel,
	parsePageParam
} from '#lib/shared/blog/pagination';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ url, setHeaders }) => {
	const parsedPage = parsePageParam(url.searchParams.get('page'));
	if (!parsedPage.ok) error(404, 'Page not found');
	const page = parsedPage.page;
	const search = (url.searchParams.get('search') ?? url.searchParams.get('q') ?? '').trim();

	let loaded: [BlogListing, Awaited<ReturnType<typeof listPublicCategoriesWithCounts>>];
	try {
		loaded = await Promise.all([
			getPublicBlogListing({ page, perPage: BLOG_PAGE_SIZE, search }),
			listPublicCategoriesWithCounts()
		]);
	} catch (err) {
		console.error('[/blog] Failed to load blog index:', err);
		error(503, 'Service temporarily unavailable.');
	}
	const [listing, categoriesWithCounts] = loaded;
	if (isPageOutOfRange(page, listing.pagination.totalPages)) error(404, 'Page not found');
	setNoStoreCache(setHeaders);
	const title = `Market Structure & Options Blog${pageLabel(page)}`;
	const description = `Institutional stock, ETF, and options trading research, market structure case studies, Options Greeks tutorials, and risk management playbooks.${pageLabel(page)}`;

	return {
		...buildBlogPageMetaTags({ title, description, pathname: '/blog', page, indexable: !search }),
		jsonLdSchema: buildBlogIndexJsonLd([...listing.featuredPosts, ...listing.posts]),
		...listing,
		categories: categoriesWithCounts.filter((cat) => cat.postCount >= 1)
	};
};
