import { error } from '@sveltejs/kit';
import { buildBlogPageMetaTags, buildTaxonomyCollectionJsonLd } from '#lib/seo/blog-seo';
import { sanitizePostHtml } from '#lib/sanitize-post-html';
import { setNoStoreCache, setPublicReadCache } from '#lib/server/posts/cache';
import { listCacheTags } from '#lib/server/posts/cache-tags';
import { listPublicCategoriesWithCounts } from '#lib/server/services/categories';
import { getPublicBlogListing } from '#lib/server/services/blog-discovery';
import { isCategoryIndexable } from '#lib/shared/seo/taxonomy';
import {
	BLOG_PAGE_SIZE,
	isPageOutOfRange,
	pageLabel,
	parsePageParam
} from '#lib/shared/blog/pagination';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ params, url, locals, request, setHeaders }) => {
	const slug = params.slug.trim().toLowerCase();
	// A malformed `page` is a 404, decided before anything is cached (docs/seo/DECISIONS.md section 6).
	const parsedPage = parsePageParam(url.searchParams.get('page'));
	if (!parsedPage.ok) {
		error(404, 'Page not found');
	}
	const page = parsedPage.page;
	const search = url.searchParams.get('search') ?? url.searchParams.get('q') ?? '';

	const categoriesWithCounts = await listPublicCategoriesWithCounts();
	const currentCategory = categoriesWithCounts.find(
		(c) => c.slug.toLowerCase() === slug && c.isActive
	);

	if (!currentCategory || currentCategory.postCount === 0) {
		error(404, 'Category not found');
	}

	const listing = await getPublicBlogListing({
		categoryId: currentCategory.id,
		page,
		perPage: BLOG_PAGE_SIZE,
		search
	});

	if (isPageOutOfRange(page, listing.pagination.totalPages)) {
		error(404, 'Category not found');
	}

	// Cached only now that the response is a real page: unknown slugs and bad pages never carry public cache headers.
	if (listing.search) setNoStoreCache(setHeaders);
	else setPublicReadCache(setHeaders, locals, request, listCacheTags());

	// Indexable archives are indexable on every page, each with its own canonical.
	const indexable = !listing.search && isCategoryIndexable(currentCategory.postCount);

	// Section 10.5: Sidebar lists indexable categories, ALWAYS including the current category
	const sidebarCategories = categoriesWithCounts.filter(
		(c) => c.isIndexable || c.id === currentCategory.id
	);

	const posts = listing.posts;

	const title = `${(currentCategory.metaTitle || `${currentCategory.name} Trading Articles`).trim()}${pageLabel(page)}`;
	const rawDescription = (
		currentCategory.metaDescription ||
		currentCategory.description ||
		''
	).trim();
	const description = `${
		rawDescription.length >= 110 && rawDescription.length <= 160
			? rawDescription
			: `Explore ${currentCategory.postCount} institutional stock, ETF, and options trading articles, case studies, and execution playbooks filed under ${currentCategory.name}.`
	}${pageLabel(page)}`;

	return {
		...buildBlogPageMetaTags({
			title,
			description,
			pathname: `/blog/category/${currentCategory.slug}`,
			page,
			indexable
		}),
		jsonLdSchema: buildTaxonomyCollectionJsonLd({
			kind: 'category',
			name: currentCategory.name,
			slug: currentCategory.slug,
			description,
			posts
		}),
		category: {
			...currentCategory,
			pillarHtml: currentCategory.pillarContent
				? sanitizePostHtml(currentCategory.pillarContent)
				: null
		},
		sidebarCategories,
		...listing
	};
};
