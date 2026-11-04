import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { eq, sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { createTestDatabase, setActiveDbForTest } from './index';
import { posts } from './schema';
import { savePostWithRedirect } from './save-post';

// Editorial modification date (blog-editor-report.md Phase 2 / G3): `content_updated_at` moves only on a real
// editorial change; `updated_at` moves on every write and must never stand in for it.
describe('content_updated_at (editorial modification date)', () => {
	let env: Awaited<ReturnType<typeof createTestDatabase>>;
	const wait = (ms = 15) => new Promise((done) => setTimeout(done, ms));

	beforeAll(async () => {
		env = await createTestDatabase();
		setActiveDbForTest(env.db, env.client);
	});
	afterAll(async () => {
		await env.cleanup();
	});

	const base = (slug: string) => ({
		title: `Fixture ${slug}`,
		slug,
		content: '<p>Original body.</p>',
		excerpt: 'Original excerpt.',
		coverImage: '/media/a.webp',
		status: 'published' as const,
		isFixture: true
	});

	async function create(slug: string) {
		const { post } = await savePostWithRedirect({ mode: 'create', values: base(slug) });
		return post;
	}
	async function update(
		id: number,
		slug: string,
		overrides: Partial<typeof posts.$inferInsert>,
		minorEdit = false
	) {
		const { post } = await savePostWithRedirect({
			mode: 'update',
			id,
			minorEdit,
			values: { ...base(slug), ...overrides }
		});
		return post;
	}

	it('is set on create', async () => {
		const post = await create('md-create');
		expect(post.contentUpdatedAt).toBeInstanceOf(Date);
	});

	it('does not move when only non-editorial fields change, while updated_at does', async () => {
		const created = await create('md-featured');
		await wait();
		const after = await update(created.id, 'md-featured', { featured: true });
		expect(after.contentUpdatedAt?.getTime()).toBe(created.contentUpdatedAt?.getTime());
		expect(after.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
	});

	it.each([
		['body', { content: '<p>Changed body.</p>' }],
		['title', { title: 'A new title' }],
		['excerpt', { excerpt: 'A different excerpt.' }],
		['cover image', { coverImage: '/media/b.webp' }]
	] as const)('moves when the %s changes', async (label, change) => {
		const slug = `md-change-${label.replace(' ', '-')}`;
		const created = await create(slug);
		await wait();
		const after = await update(created.id, slug, change);
		expect(after.contentUpdatedAt!.getTime()).toBeGreaterThan(created.contentUpdatedAt!.getTime());
	});

	it('keeps the date for an editorial change flagged as a minor edit', async () => {
		const created = await create('md-minor');
		await wait();
		const after = await update(created.id, 'md-minor', { content: '<p>Typo fixed.</p>' }, true);
		expect(after.content).toBe('<p>Typo fixed.</p>');
		expect(after.contentUpdatedAt?.getTime()).toBe(created.contentUpdatedAt?.getTime());
	});

	it('ignores minorEdit on create', async () => {
		const { post } = await savePostWithRedirect({
			mode: 'create',
			minorEdit: true,
			values: base('md-minor-create')
		});
		expect(post.contentUpdatedAt).toBeInstanceOf(Date);
	});

	it('never falls back to updated_at for a legacy row with no editorial date', async () => {
		const created = await create('md-legacy');
		const published = new Date('2024-03-01T12:00:00.000Z');
		await env.db
			.update(posts)
			.set({ contentUpdatedAt: null, publishedAt: published })
			.where(eq(posts.id, created.id));
		await wait();
		const after = await update(created.id, 'md-legacy', { featured: true });
		expect(after.contentUpdatedAt?.toISOString()).toBe(published.toISOString());
		expect(after.updatedAt.getTime()).toBeGreaterThan(published.getTime());
	});

	it('backfill migration fills published rows from published_at, leaves drafts NULL, and is idempotent', async () => {
		const live = await create('md-backfill-live');
		const { post: draft } = await savePostWithRedirect({
			mode: 'create',
			values: { ...base('md-backfill-draft'), status: 'draft' as const }
		});
		const published = new Date('2023-05-05T09:30:00.000Z');
		await env.db
			.update(posts)
			.set({ contentUpdatedAt: null, publishedAt: published })
			.where(eq(posts.id, live.id));
		await env.db
			.update(posts)
			.set({ contentUpdatedAt: null, publishedAt: null })
			.where(eq(posts.id, draft.id));

		const migration = readFileSync(
			resolve(process.cwd(), 'drizzle/0001_content_updated_at_backfill.sql'),
			'utf8'
		);
		await env.client.exec(migration);
		await env.client.exec(migration);

		const rows = await env.db
			.select({ id: posts.id, at: posts.contentUpdatedAt })
			.from(posts)
			.where(sql`${posts.id} IN (${live.id}, ${draft.id})`);
		const byId = new Map(rows.map((r) => [r.id, r.at]));
		expect(byId.get(live.id)?.toISOString()).toBe(published.toISOString());
		expect(byId.get(draft.id)).toBeNull();
	});
});
