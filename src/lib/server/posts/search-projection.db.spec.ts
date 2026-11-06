import { and, eq, sql } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vite-plus/test';
import { createTestDatabase, setActiveDbForTest } from '../db';
import { categories, media, postCategories, posts, postTags, revisions, tags } from '../db/schema';
import { savePostWithRedirect } from '../db/save-post';
import { getPublicBlogListing } from '../services/blog-discovery';
import {
	listPublicPosts,
	restorePostRevision,
	restoreTrashedPost,
	trashPost
} from '../services/posts';
import {
	backfillPostSearchProjections,
	compareAndSetPostSearchProjection,
	persistPostSearchProjection
} from './search-persistence';

describe('Persistent public search and compatible legacy writers', () => {
	let env: Awaited<ReturnType<typeof createTestDatabase>>;
	beforeAll(async () => {
		env = await createTestDatabase();
		setActiveDbForTest(env.db, env.client);
	});
	beforeEach(async () => {
		await env.db.delete(posts);
		await env.db.delete(categories);
		await env.db.delete(tags);
		await env.db.delete(media);
	});
	afterAll(async () => {
		await env.cleanup();
	});
	async function add(
		slug: string,
		extra: Partial<typeof posts.$inferInsert> = {},
		projected = false
	) {
		return env.db.transaction(async (tx) => {
			const [row] = await tx
				.insert(posts)
				.values({
					title: 'Research note',
					slug,
					content: '<p>pre<strong>mium</strong> risk management &amp; execution</p>',
					status: 'published',
					published: true,
					publishedAt: new Date('2026-11-01T12:00:00Z'),
					...extra
				})
				.returning();
			if (projected) await persistPostSearchProjection(tx, row);
			return row;
		});
	}
	async function stored(id: number) {
		return (await env.db.select().from(posts).where(eq(posts.id, id)))[0];
	}
	const slugs = (result: Awaited<ReturnType<typeof getPublicBlogListing>>) =>
		result.posts.map((row) => row.slug);

	it('matches visible body words and entities identically before and after bounded backfill', async () => {
		await add('pending');
		await add('projected', {}, true);
		await add(
			'attribute-only',
			{
				content:
					'<p title="premium risk">Something else</p><img src="/premium-risk.png" alt="premium risk">'
			},
			true
		);
		for (const query of ['premium', 'risk\u00a0\nmanagement', '& execution']) {
			expect((await getPublicBlogListing({ search: query })).pagination.total).toBe(2);
		}
		const before = await getPublicBlogListing({ search: 'premium' });
		const report = await backfillPostSearchProjections(env.db, { dryRun: false, batchSize: 1 });
		expect(report).toMatchObject({ scanned: 1, updated: 1, skipped: 0, pending: 0 });
		expect(await getPublicBlogListing({ search: 'premium' })).toEqual(before);
		expect(JSON.stringify(before)).not.toContain('pre<strong>mium');
		expect(before.posts[0]).not.toHaveProperty('searchText');
		expect((await listPublicPosts({ search: 'premium' })).items[0]).not.toHaveProperty(
			'searchText'
		);
	});

	it('excludes every semantic flag shape and malformed metadata before totals and pagination', async () => {
		await add('visible-one', {}, true);
		await add('visible-two');
		for (const [index, customFields] of [
			'[{"key":"__excludeFromSearch","value":"true"}]',
			'[\n { "value": "true", "key": "__excludeFromSearch" }\n]',
			'{"__excludeFromSearch":"true"}',
			'{',
			'[{"key":"__excludeFromSearch","value":"false"},{"key":"__excludeFromSearch","value":"true"}]'
		].entries())
			await add(`excluded-${index}`, { customFields }, index % 2 === 0);
		for (const page of [1, 2]) {
			const listing = await getPublicBlogListing({ search: 'premium', perPage: 1, page });
			expect(listing.pagination).toEqual({ page, perPage: 1, total: 2, totalPages: 2 });
			expect(listing.posts).toHaveLength(1);
			expect(listing.posts[0].slug).toMatch(/^visible-/);
			const legacy = await listPublicPosts({ search: 'premium', perPage: 1, page });
			expect(legacy.total).toBe(2);
			expect(legacy.items[0].slug).toBe(listing.posts[0].slug);
		}
		// The editor's search flag is distinct from public visibility and indexability.
		expect((await getPublicBlogListing()).pagination.total).toBe(7);
	});

	it('intersects category and tag membership without duplicates and disables the separate lead', async () => {
		const [cat] = await env.db
			.insert(categories)
			.values({ name: 'Options', slug: 'options' })
			.returning();
		const [tag] = await env.db.insert(tags).values({ name: 'Risk', slug: 'risk' }).returning();
		const both = await add('both', { featured: true, categoryId: cat.id }, true);
		await env.db.insert(postCategories).values({ postId: both.id, categoryId: cat.id });
		await env.db.insert(postTags).values({ postId: both.id, tagId: tag.id });
		await add('category-only', { categoryId: cat.id });
		const tagOnly = await add('tag-only');
		await env.db.insert(postTags).values({ postId: tagOnly.id, tagId: tag.id });
		await add('neither');
		const filters = { categoryId: cat.id, tagId: tag.id, search: 'premium' };
		const listing = await getPublicBlogListing(filters);
		expect(slugs(listing)).toEqual(['both']);
		expect(listing.featuredPosts).toEqual([]);
		expect(listing.pagination.total).toBe(1);
		expect((await listPublicPosts(filters)).items.map((p) => p.slug)).toEqual(['both']);
		expect((await getPublicBlogListing({ categoryId: cat.id })).featuredPosts).toEqual([]);
	});

	it('escapes percent, underscore and backslash identically for pending and persisted bodies', async () => {
		await add('literal-pending', { content: '<p>100% desk_code C:\\research</p>' });
		await add('literal-stored', { content: '<p>100% desk_code C:\\research</p>' }, true);
		await add('wildcard-lookalike', { content: '<p>1000 deskXcode CXresearch</p>' }, true);
		for (const search of ['100%', 'desk_code', 'C:\\research']) {
			expect((await getPublicBlogListing({ search })).pagination.total).toBe(2);
		}
	});

	it('never searches private, future, expired, noindex, fixture or deleted pending rows', async () => {
		await add('visible');
		for (const [slug, extra] of [
			['draft', { status: 'draft', published: false }],
			['members', { visibility: 'members' }],
			['protected', { visibility: 'password_protected', password: 'secret' }],
			['fixture', { isFixture: true }],
			['noindex', { robotsNoindex: true }],
			['trashed', { deletedAt: new Date() }],
			['expired', { expiresAt: new Date('2000-01-01') }],
			['future', { status: 'scheduled', published: false, scheduledAt: new Date('2100-01-01') }]
		] satisfies Array<[string, Partial<typeof posts.$inferInsert>]>)
			await add(slug, extra);
		expect(slugs(await getPublicBlogListing({ search: 'premium' }))).toEqual(['visible']);
	});

	it('invalidates old-app writes immediately and searches their current text without writing on GET', async () => {
		const row = await add('legacy-update', {}, true);
		await env.db.update(posts).set({ content: '<p>newneedle</p>' }).where(eq(posts.id, row.id));
		expect(await stored(row.id)).toMatchObject({ searchText: null, searchExcluded: null });
		expect(slugs(await getPublicBlogListing({ search: 'newneedle' }))).toEqual(['legacy-update']);
		expect((await getPublicBlogListing({ search: 'premium' })).pagination.total).toBe(0);
		expect(await stored(row.id)).toMatchObject({ searchText: null, searchExcluded: null });
		await env.db
			.update(posts)
			.set({ customFields: '{"__excludeFromSearch":"true"}' })
			.where(eq(posts.id, row.id));
		expect((await getPublicBlogListing({ search: 'newneedle' })).pagination.total).toBe(0);
	});

	it('dry run preserves content/dates and CAS rejects intervening source edits without updatedAt', async () => {
		const row = await add('backfill-race');
		const report = await backfillPostSearchProjections(env.db, { batchSize: 1 });
		expect(report).toMatchObject({ dryRun: true, scanned: 1, updated: 0, pending: 1 });
		await env.db
			.update(posts)
			.set({ content: '<p>concurrent content</p>' })
			.where(eq(posts.id, row.id));
		expect(await compareAndSetPostSearchProjection(env.db, row)).toBe(false);
		await backfillPostSearchProjections(env.db, { dryRun: false });
		const after = await stored(row.id);
		expect(after.searchText).toContain('concurrent content');
		expect(after.updatedAt).toEqual(row.updatedAt);
		expect(after.contentUpdatedAt).toEqual(row.contentUpdatedAt);
		expect(after.publishedAt).toEqual(row.publishedAt);
	});

	it('populates creates, updates, quick updates and clones in their source transaction', async () => {
		const first = await savePostWithRedirect({
			mode: 'create',
			values: { title: 'First', slug: 'first', content: '<p>oldneedle</p>' }
		});
		expect(await stored(first.post.id)).toMatchObject({
			searchText: 'First oldneedle',
			searchExcluded: false
		});
		await savePostWithRedirect({
			mode: 'quick_update',
			id: first.post.id,
			values: {
				title: 'Retitled',
				slug: 'first',
				content: '<p>newneedle</p>',
				customFields: '{"__excludeFromSearch":"true"}'
			}
		});
		expect(await stored(first.post.id)).toMatchObject({
			searchText: 'Retitled newneedle',
			searchExcluded: true
		});
		const clone = await savePostWithRedirect({
			mode: 'create',
			values: { title: 'Clone', slug: 'clone', content: first.post.content }
		});
		expect(await stored(clone.post.id)).toMatchObject({
			searchText: 'Clone oldneedle',
			searchExcluded: false
		});
	});

	it('refreshes revision/Trash restores and internal-link rewrite projections', async () => {
		const row = await add('restore', { status: 'draft', published: false }, true);
		const [revision] = await env.db
			.insert(revisions)
			.values({
				postId: row.id,
				titleSnapshot: 'Restored title',
				contentSnapshot: '<p>restoredneedle</p>',
				excerptSnapshot: 'Restored summary',
				wordCount: 1
			})
			.returning();
		await restorePostRevision(row.id, revision.id);
		expect(await stored(row.id)).toMatchObject({
			searchText: 'Restored title Restored summary restoredneedle',
			searchExcluded: false
		});
		await trashPost(row.id);
		await restoreTrashedPost(row.id);
		expect((await stored(row.id)).searchText).toContain('restoredneedle');
		const source = await add('old-slug', {}, true);
		const linking = await add(
			'linking',
			{ content: '<p><a href="/blog/old-slug">Visible anchor</a></p>' },
			true
		);
		await savePostWithRedirect({
			mode: 'update',
			id: source.id,
			values: {
				title: source.title,
				slug: 'new-slug',
				content: source.content,
				status: 'published'
			}
		});
		expect((await stored(linking.id)).content).toContain('/blog/new-slug');
		expect((await stored(linking.id)).searchText).toBe('Research note Visible anchor');
	});

	it('rejects partial pairs and ignores supplied projections on insert', async () => {
		const row = await add('invariant', { searchText: 'untrusted', searchExcluded: false });
		expect(await stored(row.id)).toMatchObject({ searchText: null, searchExcluded: null });
		await expect(
			env.db.update(posts).set({ searchText: 'half projection' }).where(eq(posts.id, row.id))
		).rejects.toThrow();
	});

	it('keeps projections when only publication/metadata fields change', async () => {
		const row = await add('stable-projection', {}, true);
		await env.db.update(posts).set({ robotsNoindex: true }).where(eq(posts.id, row.id));
		expect((await stored(row.id)).searchText).toContain('premium risk');
		const [pending] = await env.db
			.select({ total: sql<number>`count(*)::integer` })
			.from(posts)
			.where(and(eq(posts.id, row.id), sql`${posts.searchText} is null`));
		expect(pending.total).toBe(0);
	});

	it('resolves only recorded active cover files, including arbitrary variant URLs', async () => {
		await env.db.insert(media).values({
			id: 'known',
			filename: 'original.webp',
			slug: 'known',
			mimeType: 'image/webp',
			sizeBytes: 100,
			blobUrl: '/original.webp',
			blobPathname: 'original.webp',
			width: 1600,
			height: 900,
			variantsJson: {
				'480': { url: '/small-art.webp', pathname: 'small-art.webp', width: 480, height: 270 },
				'800': { url: '/chosen-art.webp', pathname: 'chosen-art.webp', width: 800, height: 450 },
				'crop-1x1': {
					url: '/square.webp',
					pathname: 'square.webp',
					width: 800,
					height: 800,
					kind: 'crop',
					aspect: '1x1'
				}
			}
		});
		await add('known-original', {
			coverImage: '/original.webp',
			coverImageWidth: 1600,
			coverImageHeight: 900
		});
		await add('known-variant', {
			coverImage: '/chosen-art.webp',
			coverImageWidth: 800,
			coverImageHeight: 450
		});
		await add('unknown', { coverImage: '/unverified-1600w.webp' });
		let listing = await getPublicBlogListing({ search: 'premium' });
		expect(listing.posts.find((post) => post.slug === 'known-original')?.coverImageSrcset).toBe(
			'/small-art.webp 480w, /chosen-art.webp 800w, /original.webp 1600w'
		);
		expect(listing.posts.find((post) => post.slug === 'known-variant')?.coverImageSrcset).toBe(
			'/small-art.webp 480w, /chosen-art.webp 800w'
		);
		expect(listing.posts.find((post) => post.slug === 'known-variant')).toMatchObject({
			coverImageWidth: 800,
			coverImageHeight: 450
		});
		expect(listing.posts.find((post) => post.slug === 'unknown')?.coverImageSrcset).toBeUndefined();
		await env.db.update(media).set({ deletedAt: new Date() }).where(eq(media.id, 'known'));
		listing = await getPublicBlogListing({ search: 'premium' });
		expect(listing.posts.every((post) => post.coverImageSrcset === undefined)).toBe(true);
	});
});
