import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { resolveBlogRedirect } from '../../hooks.server';
import { createTestDatabase, setActiveDbForTest, setSimulatedDbFailure } from '#lib/server/db';
import { media, redirects } from '#lib/server/db/schema';
import { getPostPasswordCookieName, signDraftPreviewToken } from '#lib/server/posts/visibility';
import { clearRateLimitsForTest } from '#lib/server/rate-limit';
import { createAuthor } from '#lib/server/services/authors';
import { createCategory } from '#lib/server/services/categories';
import { createPost, updatePost } from '#lib/server/services/posts';
import { createTag } from '#lib/server/services/tags';
import { GET as getRss } from '../rss.xml/+server';
import { GET as getSitemap } from '../sitemap.xml/+server';
import { load as loadBlogIndex } from './+page.server';
import { actions as slugActions, load as loadBlogPost } from './[slug]/+page.server';
import { load as loadCategoryPage } from './category/[slug]/+page.server';
import { load as loadTagPage } from './tag/[slug]/+page.server';

function makeValidSeoBody(keyword: string): string {
	const paragraph = `In this institutional ${keyword} guide, we examine liquidity pools, delta exposure, gamma walls, and risk-defined execution across volatile equity index sessions. Traders who master ${keyword} discipline protect their capital first and scale systematically.`;
	const bodyParagraphs = Array.from(
		{ length: 14 },
		(_, i) => `<p>${paragraph} (Section ${i + 1})</p>`
	).join('\n');
	return `
		<h2>Understanding ${keyword} Structure</h2>
		${bodyParagraphs}
		<pre><code class="language-typescript">const edge = "${keyword}";\nconsole.log(edge);</code></pre>
		<h2>Execution Rules for ${keyword}</h2>
		<p>Check out our <a href="/live-trading-rooms/day-trading-room">Day Trading Room</a> and review <a href="https://www.cboe.com" target="_blank" rel="noopener noreferrer">CBOE Options Data</a>.</p>
		<h3>Position Sizing Discipline</h3>
		<p>${paragraph}</p>
		<h4>Intraday Volatility Adjustments</h4>
		<p>${paragraph}</p>
	`;
}

describe('Public Blog Routes, Redirect Hook, Feeds & Password Unlock', () => {
	let testDbCtx: Awaited<ReturnType<typeof createTestDatabase>>;
	let authorId = 0;
	let categoryId = 0;
	let tagId = 0;

	beforeAll(async () => {
		process.env.POST_PASSWORD_SECRET = 'test-post-password-secret-at-least-32-chars!!';
		testDbCtx = await createTestDatabase();
		setActiveDbForTest(testDbCtx.db, testDbCtx.client);

		const author = await createAuthor({
			name: 'Billy Ribeiro',
			slug: 'billy-ribeiro',
			jobTitle: 'Head Options Strategist',
			shortBio: 'Institutional options and order flow strategist.',
			bio: 'Mentored by Wall Street proprietary trading veterans.',
			credentials: 'CMT',
			isActive: true
		});
		authorId = author.id;

		const category = await createCategory({
			name: 'Options Strategy',
			slug: 'options-strategy',
			description: 'Institutional options structure and volatility playbooks.',
			isActive: true
		});
		categoryId = category.id;

		const tag = await createTag({
			name: 'Gamma Exposure',
			slug: 'gamma-exposure',
			description: 'Dealer gamma positioning and index pinning.'
		});
		tagId = tag.id;
	});

	beforeEach(() => {
		setSimulatedDbFailure(null);
		clearRateLimitsForTest();
	});

	afterAll(async () => {
		setSimulatedDbFailure(null);
		await testDbCtx.cleanup();
	});

	it('serves published posts on /blog and /blog/[slug] with Shiki highlighting, TOC, and caching headers', async () => {
		const keyword = 'options gamma';
		const created = await createPost({
			title: 'Options Gamma Exposure Playbook for Index Traders',
			slug: 'options-gamma-exposure-playbook',
			excerpt:
				'Learn how dealer options gamma exposure shapes intraday support, resistance, and volatility expansion on SPX and QQQ.',
			content: makeValidSeoBody(keyword),
			authorId,
			categoryId,
			categoryIds: [categoryId],
			tagIds: [tagId],
			coverImage: 'https://cdn.example.com/gamma-1200w.webp',
			coverImageAlt: 'Dealer gamma exposure chart across SPX strike prices',
			coverImageCaption: 'SPX net gamma profile prior to market open',
			metaTitle: 'Options Gamma Exposure Playbook for Index Traders',
			metaDescription:
				'Learn how dealer options gamma exposure shapes intraday support, resistance, and volatility expansion on SPX and QQQ with defined risk.',
			focusKeyword: keyword,
			faqItems: JSON.stringify([
				{
					question: 'What is options gamma exposure?',
					answer:
						'Options gamma exposure measures how market makers must hedge underlying futures or shares as price moves across strike levels.'
				}
			]),
			status: 'published',
			visibility: 'public'
		});

		expect(created.status).toBe('published');

		// 1. Test /blog index load for anonymous visitor
		const indexHeaders: Record<string, string> = {};
		const indexData = (await loadBlogIndex({
			url: new URL('https://revolutiontradingpros.com/blog'),
			locals: {} as App.Locals,
			request: new Request('https://revolutiontradingpros.com/blog'),
			setHeaders: (h: Record<string, string>) => Object.assign(indexHeaders, h)
		} as never)) as Record<string, unknown>;

		expect(indexHeaders['Cache-Control']).toContain('public');
		expect((indexData.posts as unknown[]).length).toBeGreaterThanOrEqual(1);

		// 2. Test /blog/[slug] load
		const postHeaders: Record<string, string> = {};
		const postData = (await loadBlogPost({
			params: { slug: 'options-gamma-exposure-playbook' },
			url: new URL('https://revolutiontradingpros.com/blog/options-gamma-exposure-playbook'),
			locals: {} as App.Locals,
			request: new Request(
				'https://revolutiontradingpros.com/blog/options-gamma-exposure-playbook'
			),
			cookies: { get: () => undefined },
			setHeaders: (h: Record<string, string>) => Object.assign(postHeaders, h)
		} as never)) as {
			locked: boolean;
			post: {
				title: string;
				content: string;
				toc: Array<{ id: string; text: string; level: number }>;
				faqList: Array<{ question: string; answer: string }>;
			};
			jsonLdSchema: { '@graph': Array<Record<string, unknown>> };
		};

		expect(postData.locked).toBe(false);
		expect(postHeaders['Cache-Control']).toContain('public');
		expect(postData.post.content).toContain('shiki');
		expect(postData.post.toc.length).toBeGreaterThanOrEqual(3);
		expect(postData.post.faqList).toHaveLength(1);

		// Verify Person is emitted once and referenced by @id in BlogPosting
		const graph = postData.jsonLdSchema['@graph'];
		const personNodes = graph.filter((n) => n['@type'] === 'Person');
		expect(personNodes).toHaveLength(1);
		const articleNode = graph.find((n) => n['@type'] === 'BlogPosting');
		expect(articleNode?.author).toEqual({
			'@id': 'https://revolutiontradingpros.com/#author-billy-ribeiro'
		});
	});

	it('derives the cover srcset and dimensions from the media row, never inventing a 1200w file or 1200x675', async () => {
		const base = 'https://cdn.example.com/media/cover-test-aaaaaaaaaaaa';
		await testDbCtx.db.insert(media).values({
			id: 'cover-media-800',
			filename: 'cover-test.webp',
			slug: 'cover-test-800w.webp',
			mimeType: 'image/webp',
			sizeBytes: 1000,
			width: 800,
			height: 500,
			blobUrl: `${base}-800w.webp`,
			blobPathname: 'cover-test-aaaaaaaaaaaa-800w.webp',
			variantsJson: {
				'480': {
					width: 480,
					height: 300,
					url: `${base}-480w.webp`,
					pathname: 'cover-test-aaaaaaaaaaaa-480w.webp'
				}
			}
		});
		const keyword = 'options gamma';
		const common = {
			excerpt:
				'Learn how dealer options gamma exposure shapes intraday support, resistance, and volatility expansion on SPX and QQQ.',
			content: makeValidSeoBody(keyword),
			authorId,
			categoryId,
			categoryIds: [categoryId],
			tagIds: [tagId],
			coverImageAlt: 'Dealer gamma exposure chart across SPX strike prices',
			title: 'Options Gamma Exposure Playbook for Index Traders',
			metaTitle: 'Options Gamma Exposure Playbook for Index Traders',
			metaDescription:
				'Learn how dealer options gamma exposure shapes intraday support, resistance, and volatility expansion on SPX and QQQ with defined risk.',
			focusKeyword: keyword,
			status: 'published' as const,
			visibility: 'public' as const
		};
		await createPost({
			...common,
			content: `${makeValidSeoBody(keyword)}<img src="${base}-800w.webp" alt="Body chart options gamma" width="800" height="500" data-align="full" />`,
			slug: 'cover-srcset-real-variants',
			coverImage: `${base}-800w.webp`
		});
		await createPost({
			...common,
			slug: 'cover-srcset-unknown-library-row',
			coverImage: 'https://elsewhere.example.com/plain-cover.jpg'
		});

		const call = async (slug: string) =>
			(await loadBlogPost({
				params: { slug },
				url: new URL(`https://revolutiontradingpros.com/blog/${slug}`),
				locals: {} as App.Locals,
				request: new Request(`https://revolutiontradingpros.com/blog/${slug}`),
				cookies: { get: () => undefined },
				setHeaders: () => {}
			} as never)) as {
				post: {
					coverWidth: number | null;
					coverHeight: number | null;
					coverSrcset: string | null;
					content: string;
				};
			};

		const real = await call('cover-srcset-real-variants');
		expect(real.post.coverSrcset).toBe(`${base}-480w.webp 480w, ${base}-800w.webp 800w`);
		expect(real.post.coverSrcset).not.toContain('1200w');
		expect([real.post.coverWidth, real.post.coverHeight]).toEqual([800, 500]);
		// Body images get lazy/decoding appended before the closing bracket, not after a self-closing slash.
		const bodyImg = real.post.content.match(/<img[^>]*Body chart[^>]*>/)?.[0] ?? '';
		expect(bodyImg).toContain('data-align="full"');
		expect(bodyImg).toContain('decoding="async"');
		expect(bodyImg).not.toMatch(/\s\/\s+\w+=/);

		const unknown = await call('cover-srcset-unknown-library-row');
		expect(unknown.post.coverSrcset).toBeNull();
		expect([unknown.post.coverWidth, unknown.post.coverHeight]).toEqual([null, null]);
	});

	it('serves draft posts via signed preview token with no-store and noindex', async () => {
		const draft = await createPost({
			title: 'Unpublished Draft Market Note',
			slug: 'unpublished-draft-market-note',
			content: '<p>Draft analysis in progress.</p>',
			status: 'draft'
		});

		// Without preview token -> 404
		await expect(
			loadBlogPost({
				params: { slug: draft.slug },
				url: new URL(`https://revolutiontradingpros.com/blog/${draft.slug}`),
				locals: {} as App.Locals,
				request: new Request(`https://revolutiontradingpros.com/blog/${draft.slug}`),
				cookies: { get: () => undefined },
				setHeaders: () => {}
			} as never)
		).rejects.toMatchObject({ status: 404 });

		// With valid signed preview token -> 200 with private, no-store
		const token = signDraftPreviewToken(draft.id);
		const headers: Record<string, string> = {};
		const previewData = (await loadBlogPost({
			params: { slug: draft.slug },
			url: new URL(
				`https://revolutiontradingpros.com/blog/${draft.slug}?preview=${encodeURIComponent(token)}`
			),
			locals: {} as App.Locals,
			request: new Request(
				`https://revolutiontradingpros.com/blog/${draft.slug}?preview=${encodeURIComponent(token)}`
			),
			cookies: { get: () => undefined },
			setHeaders: (h: Record<string, string>) => Object.assign(headers, h)
		} as never)) as {
			locked: boolean;
			post: { isPreview: boolean; title: string };
			pageMetaTags: { robots: string };
		};

		expect(previewData.locked).toBe(false);
		expect(previewData.post.isPreview).toBe(true);
		expect(headers['Cache-Control']).toContain('no-store');
		expect(previewData.pageMetaTags.robots).toContain('noindex');
	});

	it('protects password-protected posts with zero metadata leak and unlocks via rate-limited form action', async () => {
		const keyword = 'protected alpha';
		const protectedPost = await createPost({
			title: 'Protected Alpha Research Report for Desk Traders',
			slug: 'protected-alpha-research-report',
			excerpt:
				'Confidential desk research on protected alpha setups and institutional block positioning across index options.',
			content: makeValidSeoBody(keyword),
			authorId,
			categoryId,
			categoryIds: [categoryId],
			tagIds: [tagId],
			coverImage: 'https://cdn.example.com/secret-cover-1200w.webp',
			coverImageAlt: 'Confidential chart showing institutional block trades',
			coverImageCaption: 'Internal desk flow chart',
			metaTitle: 'Protected Alpha Research Report for Desk Traders',
			metaDescription:
				'Confidential desk research on protected alpha setups and institutional block positioning across index options and futures.',
			focusKeyword: keyword,
			status: 'published',
			visibility: 'password_protected',
			password: 'DeskSecretPassword2026!'
		});

		const lockedHeaders: Record<string, string> = {};
		const lockedRes = (await loadBlogPost({
			params: { slug: protectedPost.slug },
			url: new URL(`https://revolutiontradingpros.com/blog/${protectedPost.slug}`),
			locals: {} as App.Locals,
			request: new Request(`https://revolutiontradingpros.com/blog/${protectedPost.slug}`),
			cookies: { get: () => undefined },
			setHeaders: (h: Record<string, string>) => Object.assign(lockedHeaders, h)
		} as never)) as Record<string, unknown>;

		expect(lockedRes.locked).toBe(true);
		expect(lockedRes.post).toBeNull();
		expect(lockedHeaders['Cache-Control']).toContain('no-store');

		// Verify zero sensitive fields leaked in payload, meta tags, or JSON-LD
		const serializedLocked = JSON.stringify(lockedRes);
		expect(serializedLocked).not.toContain('secret-cover-1200w.webp');
		expect(serializedLocked).not.toContain('Confidential desk research');
		expect(serializedLocked).not.toContain('DeskSecretPassword2026!');

		// Wrong password -> 401
		const wrongForm = new FormData();
		wrongForm.set('password', 'WrongPass');
		const wrongResult = await slugActions.unlock({
			params: { slug: protectedPost.slug },
			request: new Request(`https://revolutiontradingpros.com/blog/${protectedPost.slug}?/unlock`, {
				method: 'POST',
				body: wrongForm
			}),
			url: new URL(`https://revolutiontradingpros.com/blog/${protectedPost.slug}`),
			cookies: { set: () => {} },
			getClientAddress: () => '198.51.100.42'
		} as never);
		expect(wrongResult).toMatchObject({ status: 401 });

		// Correct password -> sets httpOnly cookie and redirects 303
		const cookiesMap = new Map<string, string>();
		const rightForm = new FormData();
		rightForm.set('password', 'DeskSecretPassword2026!');
		await expect(
			slugActions.unlock({
				params: { slug: protectedPost.slug },
				request: new Request(
					`https://revolutiontradingpros.com/blog/${protectedPost.slug}?/unlock`,
					{ method: 'POST', body: rightForm }
				),
				url: new URL(`https://revolutiontradingpros.com/blog/${protectedPost.slug}`),
				cookies: {
					set: (name: string, val: string) => {
						cookiesMap.set(name, val);
					}
				},
				getClientAddress: () => '198.51.100.42'
			} as never)
		).rejects.toMatchObject({ status: 303 });

		const cookieName = getPostPasswordCookieName(protectedPost.id);
		expect(cookiesMap.has(cookieName)).toBe(true);

		// Subsequent load with the unlock cookie returns unlocked content
		const unlockedRes = (await loadBlogPost({
			params: { slug: protectedPost.slug },
			url: new URL(`https://revolutiontradingpros.com/blog/${protectedPost.slug}`),
			locals: {} as App.Locals,
			request: new Request(`https://revolutiontradingpros.com/blog/${protectedPost.slug}`),
			cookies: { get: (name: string) => cookiesMap.get(name) },
			setHeaders: () => {}
		} as never)) as { locked: boolean; post: { title: string } | null };

		expect(unlockedRes.locked).toBe(false);
		expect(unlockedRes.post?.title).toBe(protectedPost.title);
	});

	it('serves 301 redirect via resolveBlogRedirect when a published post slug is renamed and increments hits', async () => {
		const keyword = 'swing momentum';
		const post = await createPost({
			title: 'Swing Momentum Entry Tactics for Weekly Options',
			slug: 'old-swing-momentum-slug',
			excerpt:
				'Structured swing momentum entry tactics for multi-day options positions with clear invalidation levels and profit scaling.',
			content: makeValidSeoBody(keyword),
			authorId,
			categoryId,
			categoryIds: [categoryId],
			tagIds: [tagId],
			coverImage: 'https://cdn.example.com/swing-1200w.webp',
			coverImageAlt: 'Daily swing momentum breakout chart',
			coverImageCaption: 'Multi-day swing structure',
			metaTitle: 'Swing Momentum Entry Tactics for Weekly Options',
			metaDescription:
				'Structured swing momentum entry tactics for multi-day options positions with clear invalidation levels and profit scaling rules.',
			focusKeyword: keyword,
			status: 'published',
			visibility: 'public'
		});

		await updatePost({
			id: post.id,
			title: post.title,
			slug: 'new-swing-momentum-slug',
			excerpt: post.excerpt,
			content: post.content,
			authorId,
			categoryId,
			categoryIds: [categoryId],
			tagIds: [tagId],
			coverImage: post.coverImage,
			coverImageAlt: post.coverImageAlt,
			coverImageCaption: post.coverImageCaption,
			metaTitle: post.metaTitle,
			metaDescription: post.metaDescription,
			focusKeyword: post.focusKeyword,
			status: 'published',
			visibility: 'public',
			forceOverwrite: true
		});

		const redirectRes = await resolveBlogRedirect(
			new URL('https://revolutiontradingpros.com/blog/old-swing-momentum-slug?utm_source=x')
		);
		expect(redirectRes).not.toBeNull();
		expect(redirectRes?.status).toBe(301);
		expect(redirectRes?.headers.get('Location')).toBe('/blog/new-swing-momentum-slug?utm_source=x');

		// Wait briefly for async hit increment
		await new Promise((r) => setTimeout(r, 30));
		const rows = await testDbCtx.db.select().from(redirects);
		const matched = rows.find((r) => r.sourcePath === '/blog/old-swing-momentum-slug');
		expect(matched?.hits).toBeGreaterThanOrEqual(1);
	});

	it('serves category and tag archives and enforces indexability rules', async () => {
		const catData = (await loadCategoryPage({
			params: { slug: 'options-strategy' },
			url: new URL('https://revolutiontradingpros.com/blog/category/options-strategy'),
			locals: {} as App.Locals,
			request: new Request('https://revolutiontradingpros.com/blog/category/options-strategy'),
			setHeaders: () => {}
		} as never)) as {
			category: { slug: string };
			sidebarCategories: Array<{ slug: string }>;
			posts: unknown[];
		};

		expect(catData.category.slug).toBe('options-strategy');
		expect(catData.posts.length).toBeGreaterThanOrEqual(2);
		expect(catData.sidebarCategories.some((c) => c.slug === 'options-strategy')).toBe(true);

		const tagData = (await loadTagPage({
			params: { slug: 'gamma-exposure' },
			url: new URL('https://revolutiontradingpros.com/blog/tag/gamma-exposure'),
			locals: {} as App.Locals,
			request: new Request('https://revolutiontradingpros.com/blog/tag/gamma-exposure'),
			setHeaders: () => {}
		} as never)) as {
			tag: { slug: string };
			sidebarTags: Array<{ slug: string }>;
			pageMetaTags: { robots: string };
		};

		expect(tagData.tag.slug).toBe('gamma-exposure');
		// Only 2 posts have this tag (< 5 minimum), so tag page is noindex, follow AND still listed in its own sidebar
		expect(tagData.pageMetaTags.robots).toBe('noindex, follow');
		expect(tagData.sidebarTags.some((t) => t.slug === 'gamma-exposure')).toBe(true);
	});

	it('serves RSS 2.0 and Sitemap XML with ETag/304 support and 503 on DB error', async () => {
		const rssRes = await getRss({
			request: new Request('https://revolutiontradingpros.com/rss.xml')
		} as never);
		expect(rssRes.status).toBe(200);
		const rssXml = await rssRes.text();
		expect(rssXml).toContain('<content:encoded>');
		expect(rssXml).toContain('options-gamma-exposure-playbook');

		const rssEtag = rssRes.headers.get('ETag');
		expect(rssEtag).toBeTruthy();

		// 304 Not Modified when If-None-Match matches ETag
		const rss304 = await getRss({
			request: new Request('https://revolutiontradingpros.com/rss.xml', {
				headers: { 'if-none-match': rssEtag! }
			})
		} as never);
		expect(rss304.status).toBe(304);

		// Sitemap includes published post with <image:image>
		const sitemapRes = await getSitemap({
			request: new Request('https://revolutiontradingpros.com/sitemap.xml')
		} as never);
		expect(sitemapRes.status).toBe(200);
		const sitemapXml = await sitemapRes.text();
		expect(sitemapXml).toContain(
			'<loc>https://revolutiontradingpros.com/blog/options-gamma-exposure-playbook</loc>'
		);
		expect(sitemapXml).toContain('<image:image>');

		// Simulated DB failure -> 503 with Retry-After: 60
		setSimulatedDbFailure(new Error('DB connection lost'));
		const rss503 = await getRss({
			request: new Request('https://revolutiontradingpros.com/rss.xml')
		} as never);
		expect(rss503.status).toBe(503);
		expect(rss503.headers.get('Retry-After')).toBe('60');
	});
});
