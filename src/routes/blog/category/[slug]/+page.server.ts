import { error } from '@sveltejs/kit';
import { buildBlogPageMetaTags, buildTaxonomyCollectionJsonLd } from '#lib/seo/blog-seo';
import { sanitizePostHtml } from '#lib/sanitize-post-html';
import { setPublicReadCache } from '#lib/server/posts/cache';
import { listCacheTags } from '#lib/server/posts/cache-tags';
import { listPublicCategoriesWithCounts } from '#lib/server/services/categories';
import { listPublicPosts } from '#lib/server/services/posts';
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

	const categoriesWithCounts = await listPublicCategoriesWithCounts();
	const currentCategory = categoriesWithCounts.find(
		(c) => c.slug.toLowerCase() === slug && c.isActive
	);

	if (!currentCategory || currentCategory.postCount === 0) {
		error(404, 'Category not found');
	}

	const postsPage = await listPublicPosts({
		categoryId: currentCategory.id,
		page,
		perPage: BLOG_PAGE_SIZE
	});

	if (postsPage.total === 0 || isPageOutOfRange(page, postsPage.totalPages)) {
		error(404, 'Category not found');
	}

	// Cached only now that the response is a real page: unknown slugs and bad pages never carry public cache headers.
	setPublicReadCache(setHeaders, locals, request, listCacheTags());

	// Indexable archives are indexable on every page, each with its own canonical.
	const indexable = isCategoryIndexable(postsPage.total);

	// Section 10.5: Sidebar lists indexable categories, ALWAYS including the current category
	const sidebarCategories = categoriesWithCounts.filter(
		(c) => c.isIndexable || c.id === currentCategory.id
	);

	const posts = postsPage.items.map((p) => ({
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
		category: {
			name: currentCategory.name,
			slug: currentCategory.slug
		},
		author:
			p.authorName && p.authorSlug
				? {
						name: p.authorName,
						slug: p.authorSlug
					}
				: null
	}));

	const title = `${(currentCategory.metaTitle || `${currentCategory.name} Trading Articles`).trim()}${pageLabel(page)}`;
	const rawDescription = (
		currentCategory.metaDescription ||
		currentCategory.description ||
		''
	).trim();
	const description = `${
		rawDescription.length >= 110 && rawDescription.length <= 160
			? rawDescription
			: `Explore ${postsPage.total} institutional stock, ETF, and options trading articles, case studies, and execution playbooks filed under ${currentCategory.name}.`
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
		posts,
		pagination: {
			page: postsPage.page,
			perPage: postsPage.perPage,
			total: postsPage.total,
			totalPages: postsPage.totalPages
		}
	};
};
