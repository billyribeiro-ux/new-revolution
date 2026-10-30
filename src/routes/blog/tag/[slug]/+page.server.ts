import { error } from '@sveltejs/kit';
import { buildBlogPageMetaTags, buildTaxonomyCollectionJsonLd } from '#lib/seo/blog-seo';
import { setPublicReadCache } from '#lib/server/posts/cache';
import { listPublicPosts } from '#lib/server/services/posts';
import { listPublicTagsWithCounts } from '#lib/server/services/tags';
import { isTagIndexable } from '#lib/shared/seo/taxonomy';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ params, url, locals, request, setHeaders }) => {
	setPublicReadCache(setHeaders, locals, request);

	const slug = params.slug.trim().toLowerCase();
	const rawPage = Number(url.searchParams.get('page') ?? '1');
	const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

	const tagsWithCounts = await listPublicTagsWithCounts();
	const currentTag = tagsWithCounts.find((t) => t.slug.toLowerCase() === slug);

	if (!currentTag || currentTag.postCount === 0) {
		throw error(404, 'Tag not found');
	}

	const postsPage = await listPublicPosts({
		tagId: currentTag.id,
		page,
		perPage: 12
	});

	if (postsPage.total === 0) {
		throw error(404, 'Tag not found');
	}

	const indexable = isTagIndexable(postsPage.total, currentTag.totalPublicPosts) && page === 1;

	// Section 10.5: Sidebar lists indexable tags, ALWAYS including the current tag
	const sidebarTags = tagsWithCounts.filter((t) => t.isIndexable || t.id === currentTag.id);

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
	}));

	const title = `#${currentTag.name} Trading Articles`;
	const description = (
		currentTag.description ||
		`Browse ${postsPage.total} stock and options trading articles tagged with #${currentTag.name} from Revolution Trading Pros.`
	).trim();

	return {
		...buildBlogPageMetaTags({
			title,
			description,
			pathname: `/blog/tag/${currentTag.slug}`,
			indexable
		}),
		jsonLdSchema: buildTaxonomyCollectionJsonLd({
			kind: 'tag',
			name: currentTag.name,
			slug: currentTag.slug,
			description,
			posts
		}),
		tag: currentTag,
		sidebarTags,
		posts,
		pagination: {
			page: postsPage.page,
			perPage: postsPage.perPage,
			total: postsPage.total,
			totalPages: postsPage.totalPages
		}
	};
};
