import { and, eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { resolveBlogRedirect } from '../../../hooks.server';
import { createTestDatabase, setActiveDbForTest } from '../db';
import { savePostWithRedirect } from '../db/save-post';
import { posts, redirects } from '../db/schema';
import { permanentlyDeletePost, trashPost } from '../services/posts';
import {
	analyzeRedirectGraph,
	findRedirectIntegrityIssues,
	type RedirectEdge
} from './redirect-integrity';

const edge = (sourcePath: string, targetPath: string): RedirectEdge => ({ sourcePath, targetPath });

describe('analyzeRedirectGraph', () => {
	it('accepts a flat graph whose targets are live', () => {
		const live = new Set(['/blog/b', '/blog/d']);
		expect(
			analyzeRedirectGraph([edge('/blog/a', '/blog/b'), edge('/blog/c', '/blog/d')], live)
		).toEqual([]);
	});

	it('flags a self-loop', () => {
		expect(analyzeRedirectGraph([edge('/blog/a', '/blog/a')])).toEqual([
			{ kind: 'self-loop', sourcePath: '/blog/a', targetPath: '/blog/a' }
		]);
	});

	it('flags every edge of a two-node and a three-node cycle', () => {
		const two = analyzeRedirectGraph([edge('/blog/a', '/blog/b'), edge('/blog/b', '/blog/a')]);
		expect(two.map((i) => i.kind)).toEqual(['cycle', 'cycle']);
		const three = analyzeRedirectGraph([
			edge('/blog/a', '/blog/b'),
			edge('/blog/b', '/blog/c'),
			edge('/blog/c', '/blog/a')
		]);
		expect(three.map((i) => i.kind)).toEqual(['cycle', 'cycle', 'cycle']);
	});

	it('flags a chain on its first hop only', () => {
		const issues = analyzeRedirectGraph([edge('/blog/a', '/blog/b'), edge('/blog/b', '/blog/c')]);
		expect(issues).toEqual([{ kind: 'chain', sourcePath: '/blog/a', targetPath: '/blog/b' }]);
	});

	it('flags a dangling blog target only when live paths are supplied', () => {
		const edges = [edge('/blog/a', '/blog/gone')];
		expect(analyzeRedirectGraph(edges)).toEqual([]);
		expect(analyzeRedirectGraph(edges, new Set(['/blog/other']))).toEqual([
			{ kind: 'dangling-target', sourcePath: '/blog/a', targetPath: '/blog/gone' }
		]);
	});
});

describe('redirect integrity against the database', () => {
	let env: Awaited<ReturnType<typeof createTestDatabase>>;

	beforeAll(async () => {
		env = await createTestDatabase();
		setActiveDbForTest(env.db, env.client);
	});
	afterAll(async () => {
		await env.cleanup();
	});

	const values = (slug: string, status: 'published' | 'draft' = 'published') => ({
		title: `Fixture ${slug}`,
		slug,
		content: `<p>Body of ${slug}.</p>`,
		status,
		isFixture: true
	});
	const create = async (slug: string, status: 'published' | 'draft' = 'published') =>
		(await savePostWithRedirect({ mode: 'create', values: values(slug, status) })).post;
	const rename = async (id: number, from: string, to: string) =>
		(await savePostWithRedirect({ mode: 'update', id, values: values(to) })).renamedFromSlug ===
		from;
	const hit = (path: string) => resolveBlogRedirect(new URL(`https://example.test${path}`));
	const active = () => env.db.select().from(redirects).where(eq(redirects.isActive, true));

	it('serves a renamed slug as exactly one 301 hop to a live post, then stays loop-free through further renames', async () => {
		const post = await create('rn-a');
		expect(await rename(post.id, 'rn-a', 'rn-b')).toBe(true);
		expect(await rename(post.id, 'rn-b', 'rn-c')).toBe(true);

		for (const old of ['/blog/rn-a', '/blog/rn-b']) {
			const res = await hit(old);
			expect(res?.status).toBe(301);
			expect(res?.headers.get('location')).toBe('/blog/rn-c');
		}
		expect(await hit('/blog/rn-c')).toBeNull();
		expect(await findRedirectIntegrityIssues(env.db)).toEqual([]);
	});

	it('renaming back to a former slug leaves no redirect from the live slug and no loop', async () => {
		const post = await create('rb-a');
		await rename(post.id, 'rb-a', 'rb-b');
		await rename(post.id, 'rb-b', 'rb-a');

		expect(await hit('/blog/rb-a')).toBeNull();
		const toA = (await hit('/blog/rb-b'))?.headers.get('location');
		expect(toA).toBe('/blog/rb-a');
		expect(await findRedirectIntegrityIssues(env.db)).toEqual([]);
	});

	it('does not serve a redirect whose target is unpublished, and serves it again once republished', async () => {
		const post = await create('up-a');
		await rename(post.id, 'up-a', 'up-b');
		expect((await hit('/blog/up-a'))?.status).toBe(301);

		await env.db
			.update(posts)
			.set({ status: 'draft', published: false })
			.where(eq(posts.id, post.id));
		expect(await hit('/blog/up-a')).toBeNull();

		await env.db
			.update(posts)
			.set({ status: 'published', published: true })
			.where(eq(posts.id, post.id));
		expect((await hit('/blog/up-a'))?.status).toBe(301);
	});

	it('trashing the target retires redirects into it and the deleted slug resolves to nothing', async () => {
		const post = await create('tr-a');
		await rename(post.id, 'tr-a', 'tr-b');
		await trashPost(post.id, null);

		expect(await hit('/blog/tr-a')).toBeNull();
		expect(await hit('/blog/tr-b')).toBeNull();
		const rows = await env.db
			.select()
			.from(redirects)
			.where(and(eq(redirects.targetPath, '/blog/tr-b'), eq(redirects.isActive, true)));
		expect(rows).toEqual([]);
	});

	it('lets a new post reuse a slug that used to redirect, instead of being shadowed by the old 301', async () => {
		const old = await create('reuse-a');
		await rename(old.id, 'reuse-a', 'reuse-b');
		expect((await hit('/blog/reuse-a'))?.status).toBe(301);

		await create('reuse-a');
		expect(await hit('/blog/reuse-a')).toBeNull();
		expect(await findRedirectIntegrityIssues(env.db)).toEqual([]);
	});

	it('lets a slug be reused after the original post is permanently deleted', async () => {
		const gone = await create('del-a');
		await rename(gone.id, 'del-a', 'del-b');
		await trashPost(gone.id, null);
		await permanentlyDeletePost(gone.id, null);

		await create('del-b');
		expect(await hit('/blog/del-a')).toBeNull();
		expect(await findRedirectIntegrityIssues(env.db)).toEqual([]);
	});

	it('aborts and rolls back a save that would leave the redirect graph cyclic', async () => {
		const post = await create('cy-a');
		await env.db.insert(redirects).values([
			{ sourcePath: '/blog/cy-x', targetPath: '/blog/cy-y', type: 301 },
			{ sourcePath: '/blog/cy-y', targetPath: '/blog/cy-x', type: 301 }
		]);

		await expect(rename(post.id, 'cy-a', 'cy-b')).rejects.toThrow(/REDIRECT_INTEGRITY: cycle/);
		const [after] = await env.db.select().from(posts).where(eq(posts.id, post.id));
		expect(after.slug).toBe('cy-a');
		await env.db.delete(redirects).where(eq(redirects.type, 301));
	});

	it('reports a dangling target in the full audit', async () => {
		await env.db.delete(redirects);
		await env.db
			.insert(redirects)
			.values({ sourcePath: '/blog/dg-old', targetPath: '/blog/dg-missing', type: 301 });
		expect((await active()).length).toBe(1);
		expect(await findRedirectIntegrityIssues(env.db)).toEqual([
			{ kind: 'dangling-target', sourcePath: '/blog/dg-old', targetPath: '/blog/dg-missing' }
		]);
	});
});
