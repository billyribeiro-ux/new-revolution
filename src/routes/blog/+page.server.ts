import { error } from '@sveltejs/kit';
import { buildBlogIndexJsonLd, buildBlogPageMetaTags } from '#lib/seo/blog-seo';
import { setPublicReadCache } from '#lib/server/posts/cache';
import { listCacheTags } from '#lib/server/posts/cache-tags';
import { listPublicCategoriesWithCounts } from '#lib/server/services/categories';
import { listFeaturedPosts, listPublicPosts } from '#lib/server/services/posts';
import {
	BLOG_PAGE_SIZE,
	isPageOutOfRange,
	pageLabel,
	parsePageParam
} from '#lib/shared/blog/pagination';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ url, locals, request, setHeaders }) => {
	// A malformed `page` is a 404, decided before anything is cached (docs/seo/DECISIONS.md section 6).
	const parsedPage = parsePageParam(url.searchParams.get('page'));
	if (!parsedPage.ok) {
		error(404, 'Page not found');
	}
	const page = parsedPage.page;
	const search = (url.searchParams.get('search') ?? url.searchParams.get('q') ?? '').trim();

	let loaded: [
		Awaited<ReturnType<typeof listPublicPosts>>,
		Awaited<ReturnType<typeof listPublicCategoriesWithCounts>>,
		Awaited<ReturnType<typeof listFeaturedPosts>>
	];
	try {
		loaded = await Promise.all([
			listPublicPosts({ page, perPage: BLOG_PAGE_SIZE, search: search || undefined }),
			listPublicCategoriesWithCounts(),
			page === 1 && !search ? listFeaturedPosts(3) : Promise.resolve([])
		]);
	} catch (err) {
		console.error('[/blog] Failed to load blog index:', err);
		error(503, 'Service temporarily unavailable.');
	}
	const [postsPage, categoriesWithCounts, featuredRaw] = loaded;

	// Beyond the last page there is nothing to show: 404, not an empty 200 (a soft 404).
	if (isPageOutOfRange(page, postsPage.totalPages)) {
		error(404, 'Page not found');
	}

	// Cached only now that the response is a real page, so error responses never carry public cache headers.
	setPublicReadCache(setHeaders, locals, request, listCacheTags());

	const activeCategories = categoriesWithCounts.filter((cat) => cat.postCount >= 1);

	const mapPostToCard = (p: (typeof postsPage.items)[number]) => ({
		id: p.id,
		title: p.title,
		slug: p.slug,
		excerpt: p.excerpt,
		coverImage: p.coverImage,
		coverImageAlt: p.coverImageAlt,
		publishedAt: p.publishedAt,
		contentUpdatedAt: p.contentUpdatedAt,
		readingTime: p.readingTime,
		featured: p.featured,
		isPillar: p.isPillar,
		category:
			p.categoryName && p.categorySlug
				? {
						name: p.categoryName,
						slug: p.categorySlug
					}
				: null,
		author:
			p.authorName && p.authorSlug
				? {
						name: p.authorName,
						slug: p.authorSlug
					}
				: null
	});

	const posts = postsPage.items.map(mapPostToCard);
	const featuredPosts = featuredRaw.map((f) => ({
		id: f.id,
		title: f.title,
		slug: f.slug,
		excerpt: f.excerpt,
		coverImage: f.coverImage,
		coverImageAlt: f.coverImageAlt,
		publishedAt: f.publishedAt,
		contentUpdatedAt: f.contentUpdatedAt,
		readingTime: f.readingTime,
		featured: f.featured,
		isPillar: f.isPillar,
		category:
			f.categoryName && f.categorySlug
				? {
						name: f.categoryName,
						slug: f.categorySlug
					}
				: null,
		author:
			f.authorName && f.authorSlug
				? {
						name: f.authorName,
						slug: f.authorSlug
					}
				: null
	}));

	const title = `Market Structure & Options Blog${pageLabel(page)}`;
	const description = `Institutional stock, ETF, and options trading research, market structure case studies, Options Greeks tutorials, and risk management playbooks.${pageLabel(page)}`;

	return {
		...buildBlogPageMetaTags({
			title,
			description,
			pathname: '/blog',
			page,
			// Every browse page is indexable with its own canonical; search results are not.
			indexable: !search
		}),
		jsonLdSchema: buildBlogIndexJsonLd(posts),
		posts,
		featuredPosts,
		categories: activeCategories,
		search,
		pagination: {
			page: postsPage.page,
			perPage: postsPage.perPage,
			total: postsPage.total,
			totalPages: postsPage.totalPages
		}
	};
};
