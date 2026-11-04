import { error } from '@sveltejs/kit';
import { buildBlogPageMetaTags, buildTaxonomyCollectionJsonLd } from '#lib/seo/blog-seo';
import { setPublicReadCache } from '#lib/server/posts/cache';
import { listCacheTags } from '#lib/server/posts/cache-tags';
import { listPublicPosts } from '#lib/server/services/posts';
import { listPublicTagsWithCounts } from '#lib/server/services/tags';
import { isTagIndexable } from '#lib/shared/seo/taxonomy';
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

	const tagsWithCounts = await listPublicTagsWithCounts();
	const currentTag = tagsWithCounts.find((t) => t.slug.toLowerCase() === slug);

	if (!currentTag || currentTag.postCount === 0) {
		error(404, 'Tag not found');
	}

	const postsPage = await listPublicPosts({
		tagId: currentTag.id,
		page,
		perPage: BLOG_PAGE_SIZE
	});

	if (postsPage.total === 0 || isPageOutOfRange(page, postsPage.totalPages)) {
		error(404, 'Tag not found');
	}

	// Cached only now that the response is a real page: unknown slugs and bad pages never carry public cache headers.
	setPublicReadCache(setHeaders, locals, request, listCacheTags());

	// Indexable archives are indexable on every page, each with its own canonical.
	const indexable = isTagIndexable(postsPage.total, currentTag.totalPublicPosts);

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

	const title = `#${currentTag.name} Trading Articles${pageLabel(page)}`;
	const description = (
		currentTag.description ||
		`Browse ${postsPage.total} stock and options trading articles tagged with #${currentTag.name} from Revolution Trading Pros.`
	)
		.concat(pageLabel(page))
		.trim();

	return {
		...buildBlogPageMetaTags({
			title,
			description,
			pathname: `/blog/tag/${currentTag.slug}`,
			page,
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
