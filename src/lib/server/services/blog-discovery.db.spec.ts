import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vite-plus/test';
import { createTestDatabase, setActiveDbForTest } from '../db';
import { posts } from '../db/schema';
import { getPublicBlogListing } from './blog-discovery';

describe('Shared homepage and blog discovery', () => {
	let env: Awaited<ReturnType<typeof createTestDatabase>>;
	beforeAll(async () => {
		env = await createTestDatabase();
		setActiveDbForTest(env.db, env.client);
	});
	beforeEach(async () => {
		await env.db.delete(posts);
	});
	afterAll(async () => {
		await env.cleanup();
	});

	async function add(slug: string, overrides: Partial<typeof posts.$inferInsert> = {}) {
		const [post] = await env.db
			.insert(posts)
			.values({
				title: `Article ${slug}`,
				slug,
				content: '<p>Private body is not part of a discovery payload.</p>',
				status: 'published',
				published: (overrides.status ?? 'published') === 'published',
				visibility: 'public',
				publishedAt: new Date('2026-11-01T14:00:00Z'),
				...overrides
			})
			.returning();
		return post;
	}

	it('returns an honest empty state with no placeholder posts', async () => {
		expect(await getPublicBlogListing()).toEqual({
			featuredPosts: [],
			posts: [],
			search: '',
			pagination: { page: 1, perPage: 12, total: 0, totalPages: 1 }
		});
	});

	it('puts the selected feature above newer articles and never repeats it in the grid', async () => {
		await add('selected-lead', { featured: true });
		await add('new-publication', { publishedAt: new Date('2026-11-05T14:00:00Z') });
		const listing = await getPublicBlogListing();
		expect(listing.featuredPosts.map((p) => p.slug)).toEqual(['selected-lead']);
		expect(listing.posts.map((p) => p.slug)).toEqual(['new-publication']);
		expect(listing.pagination.total).toBe(2);
		expect(JSON.stringify(listing)).not.toContain('Private body');
		expect(listing.posts[0]).not.toHaveProperty('password');
	});

	it('automatically leads with the newest post when none is marked featured', async () => {
		await add('older');
		await add('newest', { publishedAt: new Date('2026-11-05T14:00:00Z') });
		const listing = await getPublicBlogListing();
		expect(listing.featuredPosts[0]?.slug).toBe('newest');
		expect(listing.posts.map((p) => p.slug)).toEqual(['older']);
	});

	it('fills regular pages before pagination, keeping every older post reachable exactly once', async () => {
		await add('lead', { featured: true });
		for (let i = 0; i < 7; i++)
			await add(`regular-${i}`, { publishedAt: new Date(2026, 9, i + 1) });
		const first = await getPublicBlogListing({ perPage: 3 });
		const second = await getPublicBlogListing({ page: 2, perPage: 3 });
		const third = await getPublicBlogListing({ page: 3, perPage: 3 });
		expect(first.posts).toHaveLength(3);
		expect(second.posts).toHaveLength(3);
		expect(third.posts).toHaveLength(1);
		expect(second.featuredPosts).toHaveLength(0);
		expect(first.pagination).toEqual({ page: 1, perPage: 3, total: 8, totalPages: 3 });
		const ids = [...first.featuredPosts, ...first.posts, ...second.posts, ...third.posts].map(
			(p) => p.id
		);
		expect(new Set(ids).size).toBe(8);
	});

	it('excludes drafts, private/member/fixture/noindex/trashed/expired/future-scheduled posts on both surfaces', async () => {
		await add('public');
		await add('draft', { status: 'draft', featured: true });
		await add('protected', { visibility: 'password_protected', password: 'secret' });
		await add('members', { visibility: 'members' });
		await add('fixture', { isFixture: true });
		await add('noindex', { robotsNoindex: true });
		await add('trashed', { deletedAt: new Date() });
		await add('expired', { expiresAt: new Date('2000-01-01T00:00:00Z') });
		await add('scheduled', { status: 'scheduled', scheduledAt: new Date('2100-01-01T00:00:00Z') });
		for (const perPage of [6, 12]) {
			const listing = await getPublicBlogListing({ perPage });
			expect([...listing.featuredPosts, ...listing.posts].map((p) => p.slug)).toEqual(['public']);
			expect(listing.pagination.total).toBe(1);
		}
	});

	it('includes due scheduled posts consistently with the existing public visibility policy', async () => {
		await add('due', {
			status: 'scheduled',
			publishedAt: null,
			scheduledAt: new Date('2000-01-01T00:00:00Z')
		});
		await add('newer-publication');
		const listing = await getPublicBlogListing();
		expect(listing.featuredPosts[0]?.slug).toBe('newer-publication');
		expect(listing.posts.map((post) => post.slug)).toEqual(['due']);
	});

	it('updates both listings after publication, a feature switch, a rename and unpublishing', async () => {
		const older = await add('older', { featured: true });
		const fresh = await add('fresh', { status: 'draft' });
		await env.db
			.update(posts)
			.set({ status: 'published', published: true })
			.where(eq(posts.id, fresh.id));
		for (const perPage of [6, 12]) {
			const listing = await getPublicBlogListing({ perPage });
			expect(listing.posts.map((p) => p.slug)).toEqual(['fresh']);
		}
		await env.db.update(posts).set({ featured: false }).where(eq(posts.id, older.id));
		await env.db
			.update(posts)
			.set({ featured: true, slug: 'renamed' })
			.where(eq(posts.id, fresh.id));
		expect((await getPublicBlogListing()).featuredPosts[0]?.slug).toBe('renamed');
		await env.db
			.update(posts)
			.set({ status: 'draft', published: false })
			.where(eq(posts.id, fresh.id));
		expect((await getPublicBlogListing()).featuredPosts[0]?.slug).toBe('older');
	});

	it('searches the featured post normally, escapes SQL wildcards and honors search exclusion', async () => {
		await add('lead', { featured: true, title: '100% risk discipline' });
		await add('other', { title: '1000 risk discipline' });
		await add('excluded', {
			title: '100% private search note',
			customFields: '[{"key":"__excludeFromSearch","value":"true"}]'
		});
		const listing = await getPublicBlogListing({ search: '100%' });
		expect(listing.featuredPosts).toEqual([]);
		expect(listing.posts.map((p) => p.slug)).toEqual(['lead']);
	});
});
