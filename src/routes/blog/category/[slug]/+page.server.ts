import { error } from '@sveltejs/kit';
import { buildBlogPageMetaTags, buildTaxonomyCollectionJsonLd } from '#lib/seo/blog-seo';
import { sanitizePostHtml } from '#lib/sanitize-post-html';
import { setPublicReadCache } from '#lib/server/posts/cache';
import { listPublicCategoriesWithCounts } from '#lib/server/services/categories';
import { listPublicPosts } from '#lib/server/services/posts';
import { isCategoryIndexable } from '#lib/shared/seo/taxonomy';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ params, url, locals, request, setHeaders }) => {
	setPublicReadCache(setHeaders, locals, request);

	const slug = params.slug.trim().toLowerCase();
	const rawPage = Number(url.searchParams.get('page') ?? '1');
	const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

	const categoriesWithCounts = await listPublicCategoriesWithCounts();
	const currentCategory = categoriesWithCounts.find(
		(c) => c.slug.toLowerCase() === slug && c.isActive
	);

	if (!currentCategory || currentCategory.postCount === 0) {
		throw error(404, 'Category not found');
	}

	const postsPage = await listPublicPosts({
		categoryId: currentCategory.id,
		page,
		perPage: 12
	});

	if (postsPage.total === 0) {
		throw error(404, 'Category not found');
	}

	const indexable = isCategoryIndexable(postsPage.total) && page === 1;

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

	const title = (currentCategory.metaTitle || `${currentCategory.name} Trading Articles`).trim();
	const description = (
		currentCategory.metaDescription ||
		currentCategory.description ||
		`Explore ${postsPage.total} institutional trading articles and tutorials filed under ${currentCategory.name}.`
	).trim();

	return {
		...buildBlogPageMetaTags({
			title,
			description,
			pathname: `/blog/category/${currentCategory.slug}`,
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
