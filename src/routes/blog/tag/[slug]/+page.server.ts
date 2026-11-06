import { error } from '@sveltejs/kit';
import { buildBlogPageMetaTags, buildTaxonomyCollectionJsonLd } from '#lib/seo/blog-seo';
import { setNoStoreCache, setPublicReadCache } from '#lib/server/posts/cache';
import { listCacheTags } from '#lib/server/posts/cache-tags';
import { getPublicBlogListing } from '#lib/server/services/blog-discovery';
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
	const search = url.searchParams.get('search') ?? url.searchParams.get('q') ?? '';

	const tagsWithCounts = await listPublicTagsWithCounts();
	const currentTag = tagsWithCounts.find((t) => t.slug.toLowerCase() === slug);

	if (!currentTag || currentTag.postCount === 0) {
		error(404, 'Tag not found');
	}

	const listing = await getPublicBlogListing({
		tagId: currentTag.id,
		page,
		perPage: BLOG_PAGE_SIZE,
		search
	});

	if (isPageOutOfRange(page, listing.pagination.totalPages)) {
		error(404, 'Tag not found');
	}

	// Cached only now that the response is a real page: unknown slugs and bad pages never carry public cache headers.
	if (listing.search) setNoStoreCache(setHeaders);
	else setPublicReadCache(setHeaders, locals, request, listCacheTags());

	// Indexable archives are indexable on every page, each with its own canonical.
	const indexable =
		!listing.search && isTagIndexable(currentTag.postCount, currentTag.totalPublicPosts);

	// Section 10.5: Sidebar lists indexable tags, ALWAYS including the current tag
	const sidebarTags = tagsWithCounts.filter((t) => t.isIndexable || t.id === currentTag.id);

	const posts = listing.posts;

	const title = `${currentTag.name} Trading Articles${pageLabel(page)}`;
	const description = (
		currentTag.description ||
		`Browse ${currentTag.postCount} stock and options trading articles covering ${currentTag.name} from Revolution Trading Pros.`
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
		...listing
	};
};
