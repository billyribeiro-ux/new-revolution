import { error } from '@sveltejs/kit';
import { buildBlogIndexJsonLd, buildBlogPageMetaTags } from '#lib/seo/blog-seo';
import { setPublicReadCache } from '#lib/server/posts/cache';
import { listPublicCategoriesWithCounts } from '#lib/server/services/categories';
import { listFeaturedPosts, listPublicPosts } from '#lib/server/services/posts';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ url, locals, request, setHeaders }) => {
	setPublicReadCache(setHeaders, locals, request);

	const rawPage = Number(url.searchParams.get('page') ?? '1');
	const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
	const search = (url.searchParams.get('search') ?? '').trim();

	try {
		const [postsPage, categoriesWithCounts, featuredRaw] = await Promise.all([
			listPublicPosts({ page, perPage: 12, search: search || undefined }),
			listPublicCategoriesWithCounts(),
			page === 1 && !search ? listFeaturedPosts(3) : Promise.resolve([])
		]);

		const activeCategories = categoriesWithCounts.filter((cat) => cat.postCount >= 1);

		const mapPostToCard = (p: (typeof postsPage.items)[number]) => ({
			id: p.id,
			title: p.title,
			slug: p.slug,
			excerpt: p.excerpt,
			coverImage: p.coverImage,
			coverImageAlt: p.coverImageAlt,
			publishedAt: p.publishedAt,
			updatedAt: p.updatedAt,
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
			updatedAt: f.updatedAt,
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

		const title = 'Market Structure & Options Blog';
		const description =
			'Institutional stock, ETF, and options trading research, market structure case studies, Options Greeks tutorials, and risk management playbooks.';

		return {
			...buildBlogPageMetaTags({
				title,
				description,
				pathname: '/blog',
				indexable: page === 1 && !search
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
	} catch (err) {
		console.error('[/blog] Failed to load blog index:', err);
		throw error(503, 'Service temporarily unavailable.');
	}
};
