import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { eq } from 'drizzle-orm';
import { posts } from '#lib/server/db/schema';
import { createTestDatabase, setActiveDbForTest } from '#lib/server/db';
import {
	clearInvalidatedCacheTagsForTest,
	getInvalidatedCacheTags,
	invalidatePublicBlogCache,
	setBlogCachePurger
} from '#lib/server/posts/cache';
import { createAuthor } from '#lib/server/services/authors';
import { createCategory } from '#lib/server/services/categories';
import { createPost, trashPost } from '#lib/server/services/posts';
import { createTag } from '#lib/server/services/tags';
import { BLOG_PAGE_SIZE } from '#lib/shared/blog/pagination';
import { load as loadBlogIndex } from './+page.server';
import { load as loadBlogPost } from './[slug]/+page.server';
import { load as loadCategoryPage } from './category/[slug]/+page.server';
import { load as loadTagPage } from './tag/[slug]/+page.server';

// This spec exercises the blog as it behaves once launched: /blog is opened, /store stays gated.
// While /blog is gated every blog page is noindex with no canonical; that is covered in blog-seo.spec.ts.
vi.mock('#lib/data/launch-gate', async (importOriginal) => {
	const original = await importOriginal<typeof import('#lib/data/launch-gate')>();
	const isGated = (path: string) => path === '/store' || path.startsWith('/store/');
	return {
		...original,
		isUnlaunchedRoute: isGated,
		isLaunchedHref: (href: string) => !isGated(href.split(/[?#]/, 1)[0] ?? href)
	};
});

const ORIGIN = 'https://revolutiontradingpros.com';
/** One lead plus a full regular page and one overflow article. */
const POST_COUNT = BLOG_PAGE_SIZE + 2;

function body(keyword: string): string {
	const paragraph = `In this institutional ${keyword} guide, we examine liquidity pools, delta exposure, gamma walls, and risk-defined execution across volatile equity index sessions. Traders who master ${keyword} discipline protect their capital first and scale systematically.`;
	const paragraphs = Array.from({ length: 14 }, (_, i) => `<p>${paragraph} (Section ${i + 1})</p>`);
	return `<h2>Understanding ${keyword} Structure</h2>${paragraphs.join('\n')}<h2>Execution Rules for ${keyword}</h2><p>${paragraph}</p><h3>Position Sizing Discipline</h3><p>${paragraph} Review the <a href="https://www.cboe.com" target="_blank" rel="noopener noreferrer">Cboe options data</a> for contract specifications.</p>`;
}

type IndexEvent = Parameters<typeof loadBlogIndex>[0];
type PostEvent = Parameters<typeof loadBlogPost>[0];
type CategoryEvent = Parameters<typeof loadCategoryPage>[0];
type TagEvent = Parameters<typeof loadTagPage>[0];

/**
 * Builds the few fields the loaders read from a SvelteKit server load event. The framework event has many more
 * fields, so this is the one place the partial fixture is widened to the loader's parameter type (the same
 * approach `blog-routes.spec.ts` uses with `as never`).
 */
function event<E>(
	path: string,
	params: Record<string, string> = {}
): { evt: E; headers: Record<string, string> } {
	const headers: Record<string, string> = {};
	const partial = {
		params,
		url: new URL(`${ORIGIN}${path}`),
		locals: {} as App.Locals,
		request: new Request(`${ORIGIN}${path}`),
		cookies: { get: () => undefined },
		setHeaders: (h: Record<string, string>) => Object.assign(headers, h)
	};
	return { evt: partial as unknown as E, headers };
}

type Meta = { pageMetaTags: { title?: string; robots?: string; canonical?: string } };

describe('Blog pagination, 404 handling and cache tags', () => {
	let ctx: Awaited<ReturnType<typeof createTestDatabase>>;
	const slugs: string[] = [];
	let fixtureAuthorId = 0;
	let fixtureCategoryId = 0;

	beforeAll(async () => {
		process.env.POST_PASSWORD_SECRET = 'test-post-password-secret-at-least-32-chars!!';
		ctx = await createTestDatabase();
		setActiveDbForTest(ctx.db, ctx.client);

		const author = await createAuthor({
			name: 'Fixture Author',
			slug: 'fixture-author',
			jobTitle: 'Strategist',
			shortBio: 'Fixture author used only by tests.',
			bio: 'Fixture author used only by tests.',
			credentials: 'CMT',
			isActive: true
		});
		const category = await createCategory({
			name: 'Pagination Category',
			slug: 'pagination-category',
			description: 'Fixture category used only by tests.',
			isActive: true
		});
		fixtureAuthorId = author.id;
		fixtureCategoryId = category.id;
		const tag = await createTag({
			name: 'Pagination Tag',
			slug: 'pagination-tag',
			description: 'Fixture tag used only by tests.'
		});

		const words = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel'];
		for (let i = 0; i < POST_COUNT; i++) {
			const keyword = `${words[i % words.length]} fixture ${i + 1}`;
			const slug = `pagination-fixture-${String(i + 1).padStart(2, '0')}`;
			slugs.push(slug);
			await createPost({
				title: `Pagination Fixture Article ${i + 1} on ${keyword}`,
				slug,
				excerpt: `Fixture article ${i + 1} covering ${keyword} for the pagination tests only; it is not real content.`,
				content: body(keyword),
				authorId: author.id,
				categoryId: category.id,
				categoryIds: [category.id],
				tagIds: [tag.id],
				coverImage: `https://cdn.example.com/fixture-${i + 1}-1200w.webp`,
				coverImageAlt: `Fixture chart ${i + 1} used by tests`,
				metaTitle: `Pagination Fixture Article ${i + 1} on ${keyword}`,
				metaDescription: `Fixture article ${i + 1} covering ${keyword} for the pagination tests only; it is not real content and never ships.`,
				focusKeyword: keyword,
				status: 'published',
				visibility: 'public'
			});
		}
	});

	afterAll(async () => {
		await ctx.cleanup();
	});

	afterEach(() => {
		setBlogCachePurger(null);
		clearInvalidatedCacheTagsForTest();
		vi.restoreAllMocks();
	});

	describe('blog index', () => {
		it('serves one lead plus a full regular page with its own canonical and fresh no-store reads', async () => {
			const { evt, headers } = event<IndexEvent>('/blog');
			const data = (await loadBlogIndex(evt)) as unknown as Meta & {
				posts: unknown[];
				featuredPosts: Array<{ id: number }>;
				pagination: { totalPages: number };
			};
			expect(data.posts).toHaveLength(BLOG_PAGE_SIZE);
			expect(data.featuredPosts).toHaveLength(1);
			expect(data.posts).not.toContainEqual(
				expect.objectContaining({ id: data.featuredPosts[0].id })
			);
			expect(data.pagination.totalPages).toBe(2);
			expect(data.pageMetaTags.canonical).toBe(`${ORIGIN}/blog`);
			expect(data.pageMetaTags.robots).toMatch(/^index/);
			expect(headers['Cache-Control']).toContain('no-store');
			expect(headers['Cache-Control']).not.toContain('public');
			expect(headers['Vercel-Cache-Tag']).toBeUndefined();
		});

		it('treats an explicit ?page=1 as page 1 (canonical is the bare URL, no second indexable URL)', async () => {
			const { evt } = event<IndexEvent>('/blog?page=1');
			const data = (await loadBlogIndex(evt)) as unknown as Meta;
			expect(data.pageMetaTags.canonical).toBe(`${ORIGIN}/blog`);
		});

		it('serves page 2 indexable with its own self-referencing canonical and a distinct title', async () => {
			const { evt } = event<IndexEvent>('/blog?page=2');
			const data = (await loadBlogIndex(evt)) as unknown as Meta & { posts: unknown[] };
			expect(data.posts).toHaveLength(1);
			expect(data.pageMetaTags.canonical).toBe(`${ORIGIN}/blog?page=2`);
			expect(data.pageMetaTags.robots).toMatch(/^index/);
			expect(data.pageMetaTags.title).toContain('(Page 2)');
		});

		it('never makes search results indexable and gives them no canonical', async () => {
			const { evt } = event<IndexEvent>('/blog?search=fixture');
			const data = (await loadBlogIndex(evt)) as unknown as Meta;
			expect(data.pageMetaTags.robots).toMatch(/^noindex/);
			expect(data.pageMetaTags.canonical).toBeUndefined();
		});

		it.each(['3', '99', '100000'])(
			'returns 404 for ?page=%s beyond the last page, with no public cache headers',
			async (page) => {
				const { evt, headers } = event<IndexEvent>(`/blog?page=${page}`);
				await expect(loadBlogIndex(evt)).rejects.toMatchObject({ status: 404 });
				expect(headers['Cache-Control']).toBeUndefined();
				expect(headers['Vercel-Cache-Tag']).toBeUndefined();
			}
		);

		it.each(['0', '-1', '1.5', 'abc', '', '01', '1e2'])(
			'returns 404 for the malformed ?page=%j',
			async (page) => {
				const { evt, headers } = event<IndexEvent>(`/blog?page=${encodeURIComponent(page)}`);
				await expect(loadBlogIndex(evt)).rejects.toMatchObject({ status: 404 });
				expect(headers['Cache-Control']).toBeUndefined();
			}
		);
	});

	describe('category and tag archives', () => {
		it('serves category page 2 indexable-by-rule with its own canonical', async () => {
			const { evt, headers } = event<CategoryEvent>('/blog/category/pagination-category?page=2', {
				slug: 'pagination-category'
			});
			const data = (await loadCategoryPage(evt)) as unknown as Meta & { posts: unknown[] };
			expect(data.posts).toHaveLength(2);
			expect(data.pageMetaTags.title).toContain('(Page 2)');
			expect(headers['Vercel-Cache-Tag']).toBe('blog-lists');
			// 14 posts is above the category indexing threshold, so the canonical must be the page's own URL.
			expect(data.pageMetaTags.robots).toMatch(/^index/);
			expect(data.pageMetaTags.canonical).toBe(
				`${ORIGIN}/blog/category/pagination-category?page=2`
			);
		});

		it('serves tag page 2 with the same rule applied to the tag threshold', async () => {
			const { evt } = event<TagEvent>('/blog/tag/pagination-tag?page=2', {
				slug: 'pagination-tag'
			});
			const data = (await loadTagPage(evt)) as unknown as Meta & { posts: unknown[] };
			expect(data.posts).toHaveLength(2);
			if (data.pageMetaTags.robots?.startsWith('index')) {
				expect(data.pageMetaTags.canonical).toBe(`${ORIGIN}/blog/tag/pagination-tag?page=2`);
			} else {
				expect(data.pageMetaTags.canonical).toBeUndefined();
			}
		});

		it.each([
			['category', 'pagination-category', loadCategoryPage],
			['tag', 'pagination-tag', loadTagPage]
		] as const)(
			'returns 404 for a %s page beyond the last page, uncached',
			async (kind, slug, load) => {
				const { evt, headers } = event<CategoryEvent & TagEvent>(`/blog/${kind}/${slug}?page=3`, {
					slug
				});
				await expect(load(evt)).rejects.toMatchObject({ status: 404 });
				expect(headers['Cache-Control']).toBeUndefined();
			}
		);

		it.each([
			['category', loadCategoryPage],
			['tag', loadTagPage]
		] as const)('returns an uncacheable 404 for an unknown %s', async (kind, load) => {
			const { evt, headers } = event<CategoryEvent & TagEvent>(`/blog/${kind}/does-not-exist`, {
				slug: 'does-not-exist'
			});
			await expect(load(evt)).rejects.toMatchObject({ status: 404 });
			expect(headers['Cache-Control']).toBeUndefined();
			expect(headers['Vercel-Cache-Tag']).toBeUndefined();
		});
	});

	describe('article cache tags', () => {
		it('tags a public article with its post tag and the lists tag', async () => {
			const slug = slugs[0];
			const { evt, headers } = event<PostEvent>(`/blog/${slug}`, { slug });
			await loadBlogPost(evt);
			expect(headers['Cache-Control']).toContain('public');
			expect(headers['Vercel-Cache-Tag']).toBe(`blog-post:${slug},blog-lists`);
		});

		it.each(['draft', 'trashed'] as const)(
			'answers 404 with no cache headers for a %s article, never an empty 200',
			async (state) => {
				const slug = `unavailable-${state}-fixture`;
				const keyword = `${state} fixture`;
				const post = await createPost({
					title: `Unavailable ${state} fixture article for removal tests`,
					slug,
					excerpt: `A ${state} fixture used only to prove removed content answers 404; it is not real content.`,
					content: body(keyword),
					authorId: fixtureAuthorId,
					categoryId: fixtureCategoryId,
					categoryIds: [fixtureCategoryId],
					coverImage: `https://cdn.example.com/${slug}-1200w.webp`,
					coverImageAlt: `Fixture chart for ${state} article`,
					metaTitle: `Unavailable ${state} fixture article for removal tests`,
					metaDescription: `A ${state} fixture used only to prove removed content answers 404; it is not real content and never ships.`,
					focusKeyword: keyword,
					status: 'draft',
					visibility: 'public'
				});
				if (state === 'trashed') {
					// Publish directly: the publish gate is covered elsewhere and is not what is under test here.
					await ctx.db
						.update(posts)
						.set({ status: 'published', published: true, publishedAt: new Date() })
						.where(eq(posts.id, post.id));
					const live = event<PostEvent>(`/blog/${slug}`, { slug });
					await loadBlogPost(live.evt);
					await trashPost(post.id, null);
				}

				const { evt, headers } = event<PostEvent>(`/blog/${slug}`, { slug });
				await expect(loadBlogPost(evt)).rejects.toMatchObject({ status: 404 });
				expect(headers['Cache-Control']).toBeUndefined();
				expect(headers['Vercel-Cache-Tag']).toBeUndefined();
			}
		);

		it('sends no cache headers for an unknown article', async () => {
			const { evt, headers } = event<PostEvent>('/blog/does-not-exist', { slug: 'does-not-exist' });
			await expect(loadBlogPost(evt)).rejects.toMatchObject({ status: 404 });
			expect(headers['Cache-Control']).toBeUndefined();
		});
	});

	describe('cache invalidation seam', () => {
		it('records the tags a publish event purges and hands them to the registered purger', async () => {
			const purger = vi.fn().mockResolvedValue(undefined);
			setBlogCachePurger(purger);
			invalidatePublicBlogCache(['/blog', '/blog/some-post', '/rss.xml', '/sitemap.xml']);
			const expected = ['blog-lists', 'blog-post:some-post', 'blog-feed', 'blog-sitemap'];
			expect(getInvalidatedCacheTags().at(-1)?.tags).toEqual(expected);
			// Invoked on the next microtask so that a throwing purger cannot reach the caller.
			await vi.waitFor(() => expect(purger).toHaveBeenCalledTimes(1));
			expect(purger).toHaveBeenCalledWith(expected);
		});

		it('does not fail the content write when the purge fails, and reports the failure', async () => {
			const error = vi.spyOn(console, 'error').mockImplementation(() => {});
			setBlogCachePurger(() => Promise.reject(new Error('purge unavailable')));
			expect(() => invalidatePublicBlogCache(['/blog/some-post'])).not.toThrow();
			await vi.waitFor(() => expect(error).toHaveBeenCalled());
			expect(String(error.mock.calls[0]?.[0])).toContain('CDN purge failed');
		});

		it('also contains a purger that throws synchronously instead of returning a rejected promise', async () => {
			const error = vi.spyOn(console, 'error').mockImplementation(() => {});
			setBlogCachePurger(() => {
				throw new Error('purger crashed before returning');
			});
			expect(() => invalidatePublicBlogCache(['/blog/some-post'])).not.toThrow();
			await vi.waitFor(() => expect(error).toHaveBeenCalled());
		});

		it('records tags and does nothing else when no purger is registered', () => {
			expect(() => invalidatePublicBlogCache(['/blog/some-post'])).not.toThrow();
			expect(getInvalidatedCacheTags().at(-1)?.tags).toEqual(['blog-post:some-post', 'blog-lists']);
		});
	});
});
