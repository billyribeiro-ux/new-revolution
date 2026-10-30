import { eq } from 'drizzle-orm';
import sharp from 'sharp';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestDatabase, setActiveDbForTest } from '../db';
import { media, posts, redirects, user } from '../db/schema';
import { setPublicReadCache } from '../posts/cache';
import {
	signPostUnlockToken,
	verifyPostPassword,
	verifyPostUnlockToken
} from '../posts/visibility';
import { consumeRateLimit, clearRateLimitsForTest } from '../rate-limit';
import { createAuthor, deleteAuthor, updateAuthor } from './authors';
import { createCategory, deleteCategory, updateCategory } from './categories';
import { runScheduledPublishSweep, verifyCronAuthorization } from './cron';
import {
	deleteMediaItem,
	setMediaStorageDriverForTest,
	updateMediaMetadata,
	uploadMediaAsset
} from './media';
import {
	autosavePost,
	createPost,
	getPostById,
	getPublicPostViewBySlug,
	listFeaturedPosts,
	listPostRevisions,
	patchPost,
	permanentlyDeletePost,
	quickUpdatePost,
	restorePostRevision,
	updatePost
} from './posts';
import { createTag, deleteTag } from './tags';

describe('Blog Server Services & Transactional DB Suite (*.db.spec.ts)', () => {
	let testEnv: Awaited<ReturnType<typeof createTestDatabase>>;
	let authorId = 0;
	let categoryId = 0;
	let secondCategoryId = 0;
	let tagId1 = 0;
	let tagId2 = 0;
	const actorUserId = 'admin-user-1';

	beforeAll(async () => {
		process.env.BETTER_AUTH_SECRET = 'test-secret-with-at-least-32-characters-entropy';
		testEnv = await createTestDatabase();
		setActiveDbForTest(testEnv.db, testEnv.client);

		await testEnv.db.insert(user).values({
			id: actorUserId,
			name: 'Billy Ribeiro',
			email: 'billy@revolutiontradingpros.com',
			emailVerified: true,
			role: 'admin'
		});

		const author = await createAuthor(
			{
				name: 'Billy Ribeiro',
				slug: 'billy-ribeiro',
				email: 'billy@revolutiontradingpros.com',
				jobTitle: 'Founder & Lead Options Strategist',
				credentials: 'Mentored by Mark McGoldrick',
				yearsExperience: 18,
				avatar: 'https://revolutiontradingpros.com/billy.webp',
				avatarAlt: 'Billy Ribeiro portrait'
			},
			actorUserId
		);
		authorId = author.id;

		const cat1 = await createCategory(
			{
				name: 'Options Mastery',
				slug: 'options-mastery',
				description: 'Institutional options Greeks and volatility structures.',
				color: '#4b5f1d'
			},
			actorUserId
		);
		categoryId = cat1.id;

		const cat2 = await createCategory(
			{
				name: 'Small Accounts',
				slug: 'small-accounts',
				description: 'Risk-first compounding for $500+ accounts.',
				color: '#879e46'
			},
			actorUserId
		);
		secondCategoryId = cat2.id;

		const t1 = await createTag({ name: 'Delta Hedging', slug: 'delta-hedging' }, actorUserId);
		const t2 = await createTag({ name: 'Gamma Exposure', slug: 'gamma-exposure' }, actorUserId);
		tagId1 = t1.id;
		tagId2 = t2.id;
	});

	afterAll(async () => {
		setMediaStorageDriverForTest(null);
		await testEnv.cleanup();
	});

	beforeEach(() => {
		clearRateLimitsForTest();
		setMediaStorageDriverForTest(null);
	});

	function buildCompliantPostInput(overrides: Record<string, unknown> = {}) {
		const filler = Array.from({ length: 340 }, (_, i) => `execution${i}`).join(' ');
		return {
			title: 'Institutional Options Greeks Risk Architecture for Active Desks',
			slug: `options-greeks-architecture-${Math.random().toString(36).slice(2, 8)}`,
			content: `<p>Mastering options greeks requires strict mathematical position sizing. ${filler}</p><p>Reference data from <a href="https://www.cboe.com/tradable_products/sp_500/spx_options/">Cboe SPX</a> and <a href="https://www.cmegroup.com/markets/equities.html">CME Group</a>.</p><img src="https://revolutiontradingpros.com/media/chart.webp" alt="Options greeks risk profile" width="1200" height="675" />`,
			excerpt:
				'Learn how institutional options desks manage Delta, Gamma, Theta, and Vega exposure across volatile expirations without blowing up capital.',
			metaTitle: 'Options Greeks Risk Architecture for Active Traders',
			metaDescription:
				'Master options greeks risk discipline with our institutional breakdown of Delta, Gamma, Theta, and Vega exposure across volatile expirations.',
			coverImage: 'https://revolutiontradingpros.com/media/cover.webp',
			coverImageAlt: 'Options Greeks Delta and Gamma risk matrix chart',
			coverImageCaption: 'Institutional Delta and Gamma risk matrix.',
			ogImage: 'https://revolutiontradingpros.com/media/cover.webp',
			authorId,
			categoryId,
			categoryIds: [categoryId, secondCategoryId],
			tagIds: [tagId1, tagId2],
			focusKeyword: 'options greeks',
			faqItems: JSON.stringify([
				{
					question: 'What is Delta in options trading?',
					answer:
						'Delta measures the expected price change of an option contract for every one dollar move in the underlying asset.'
				},
				{
					question: 'Why does Gamma accelerate near expiration?',
					answer:
						'Gamma measures the rate of change in Delta and peaks near at-the-money strikes during expiration week.'
				},
				{
					question: 'How do desks manage Theta decay?',
					answer:
						'Institutional desks structure defined-risk spreads and diagonals in the 30 to 45 DTE window to offset daily Theta decay.'
				}
			]),
			status: 'draft' as const,
			visibility: 'public' as const,
			featured: false,
			isPillar: false,
			isSticky: false,
			commentsEnabled: true,
			pingbacksEnabled: false,
			robotsNoindex: false,
			robotsNofollow: false,
			schemaType: 'BlogPosting' as const,
			twitterCardType: 'summary_large_image' as const,
			template: 'default' as const,
			postFormat: 'standard' as const,
			language: 'en',
			isFixture: false,
			relatedPostIds: [],
			...overrides
		};
	}

	it('enforces publish-gate transitions: positive control passes, missing category blocks, cover alt equal to title blocks, and dashes are stripped before gate', async () => {
		// 1. Positive control with em-dash in title that transforms strip BEFORE the gate runs
		const published = await createPost(
			buildCompliantPostInput({
				title: `Options Greeks \u2014 Institutional Risk Guide`,
				status: 'published'
			}),
			actorUserId
		);
		expect(published.status).toBe('published');
		expect(published.published).toBe(true);
		expect(published.title).toBe('Options Greeks, Institutional Risk Guide');
		expect(published.publishedAt).toBeInstanceOf(Date);

		// 2. Blocks when no category is provided
		await expect(
			createPost(
				buildCompliantPostInput({
					status: 'published',
					categoryId: null,
					categoryIds: []
				}),
				actorUserId
			)
		).rejects.toThrow(/SEO_GATE_BLOCKED:/);

		// 3. Blocks when coverImageAlt equals the post title
		const sameTitle = 'Options Greeks Institutional Risk Guide';
		await expect(
			createPost(
				buildCompliantPostInput({
					title: sameTitle,
					coverImageAlt: sameTitle.toLowerCase(),
					status: 'published'
				}),
				actorUserId
			)
		).rejects.toThrow(/SEO_GATE_BLOCKED:[\s\S]*duplicate the post title/i);
	});

	it('enforces scheduled post rules (author required, past scheduledAt refused, 60s grace window allowed)', async () => {
		const futureDate = new Date(Date.now() + 3_600_000).toISOString();

		// Missing author blocks via SEO gate on scheduled post
		await expect(
			createPost(
				buildCompliantPostInput({
					status: 'scheduled',
					scheduledAt: futureDate,
					authorId: null
				}),
				actorUserId
			)
		).rejects.toThrow(/SEO_GATE_BLOCKED:/);

		// Past scheduledAt (> 60s ago) refused
		const twoMinAgo = new Date(Date.now() - 120_000).toISOString();
		await expect(
			createPost(
				buildCompliantPostInput({
					status: 'scheduled',
					scheduledAt: twoMinAgo
				}),
				actorUserId
			)
		).rejects.toThrow(/60 seconds in the past/);

		// Within 60s grace window succeeds
		const twentySecAgo = new Date(Date.now() - 20_000).toISOString();
		const scheduledPost = await createPost(
			buildCompliantPostInput({
				status: 'scheduled',
				scheduledAt: twentySecAgo
			}),
			actorUserId
		);
		expect(scheduledPost.status).toBe('scheduled');
	});

	it('rolls back the entire post save transaction if a pivot insert fails (atomic save rollback)', async () => {
		const draft = await createPost(
			buildCompliantPostInput({
				status: 'draft',
				categoryIds: [categoryId],
				tagIds: [tagId1]
			}),
			actorUserId
		);

		// Attempt an update with a non-existent foreign-key tag ID (999999)
		await expect(
			updatePost(
				{
					...buildCompliantPostInput({
						title: 'Should Roll Back Title',
						slug: draft.slug,
						categoryIds: [secondCategoryId],
						tagIds: [999999]
					}),
					id: draft.id,
					forceOverwrite: true
				},
				actorUserId
			)
		).rejects.toThrow();

		// Verify title, categoryIds, and tagIds were NOT partially mutated or wiped
		const afterFailedSave = await getPostById(draft.id);
		expect(afterFailedSave?.title).toBe(draft.title);
		expect(afterFailedSave?.categoryIds).toEqual([categoryId]);
		expect(afterFailedSave?.tagIds).toEqual([tagId1]);
	});

	it('handles slug rename redirects on both full update and quick update, collapses redirect chains, handles rename-back, and rewrites internal links', async () => {
		const postA = await createPost(
			buildCompliantPostInput({
				slug: 'slug-alpha-one',
				status: 'published'
			}),
			actorUserId
		);

		const linkingPost = await createPost(
			buildCompliantPostInput({
				slug: 'linking-post-test',
				content: `<p>See our <a href="/blog/slug-alpha-one">Alpha Guide</a> for details.</p>`,
				status: 'draft'
			}),
			actorUserId
		);

		// 1. Full update rename: slug-alpha-one -> slug-beta-two
		const renamed1 = await updatePost(
			{
				...buildCompliantPostInput({
					slug: 'slug-beta-two',
					status: 'published'
				}),
				id: postA.id,
				forceOverwrite: true
			},
			actorUserId
		);
		expect(renamed1.renamedFromSlug).toBe('slug-alpha-one');
		expect(renamed1.rewrittenInternalLinksCount).toBeGreaterThanOrEqual(1);

		const updatedLinking = await getPostById(linkingPost.id);
		expect(updatedLinking?.content).toContain('href="/blog/slug-beta-two"');

		// 2. Quick update rename: slug-beta-two -> slug-gamma-three (collapses chain!)
		const renamed2 = await quickUpdatePost(
			{
				id: postA.id,
				slug: 'slug-gamma-three'
			},
			actorUserId
		);
		expect(renamed2.renamedFromSlug).toBe('slug-beta-two');

		const activeRedirects = await testEnv.db
			.select()
			.from(redirects)
			.where(eq(redirects.isActive, true));

		const fromAlpha = activeRedirects.find((r) => r.sourcePath === '/blog/slug-alpha-one');
		const fromBeta = activeRedirects.find((r) => r.sourcePath === '/blog/slug-beta-two');
		expect(fromAlpha?.targetPath).toBe('/blog/slug-gamma-three');
		expect(fromBeta?.targetPath).toBe('/blog/slug-gamma-three');

		// 3. Rename back to slug-alpha-one: deactivates redirect whose source_path === /blog/slug-alpha-one
		await quickUpdatePost(
			{
				id: postA.id,
				slug: 'slug-alpha-one'
			},
			actorUserId
		);
		const afterRenameBack = await testEnv.db
			.select()
			.from(redirects)
			.where(eq(redirects.sourcePath, '/blog/slug-alpha-one'));
		expect(afterRenameBack.every((r) => !r.isActive)).toBe(true);
	});

	it('creates revisions with user_id, deduplicates identical autosaves, prunes autosaves beyond 20, and restores stripped text', async () => {
		const post = await createPost(
			buildCompliantPostInput({
				title: 'Revisions Lifecycle Post',
				status: 'draft'
			}),
			actorUserId
		);

		// Autosave 1
		const auto1 = await autosavePost(
			{
				id: post.id,
				title: `Draft Title \u2014 Step 1`,
				content: `<p>Autosave content 15\u201320 delta.</p>`,
				excerpt: 'Short excerpt'
			},
			actorUserId
		);
		expect(auto1.deduplicated).toBe(false);

		// Autosave 2 with identical content -> deduplicated!
		const auto2 = await autosavePost(
			{
				id: post.id,
				title: `Draft Title \u2014 Step 1`,
				content: `<p>Autosave content 15\u201320 delta.</p>`,
				excerpt: 'Short excerpt'
			},
			actorUserId
		);
		expect(auto2.deduplicated).toBe(true);
		expect(auto2.revisionId).toBe(auto1.revisionId);

		// Insert 25 distinct autosaves and verify pruning keeps only 20 autosave rows + the initial manual revision
		for (let i = 2; i <= 26; i++) {
			await autosavePost(
				{
					id: post.id,
					title: `Draft Title Step ${i}`,
					content: `<p>Autosave iteration ${i}</p>`,
					excerpt: null
				},
				actorUserId
			);
		}

		const revList = await listPostRevisions(post.id);
		const autosavesOnly = revList.filter((r) => r.changeType === 'autosave');
		const manualsOnly = revList.filter((r) => r.changeType === 'manual');
		expect(autosavesOnly.length).toBe(20);
		expect(manualsOnly.length).toBe(1);
		expect(revList[0].userId).toBe(actorUserId);
		expect('contentSnapshot' in revList[0]).toBe(false);

		// Restore the first manual revision
		const restored = await restorePostRevision(post.id, manualsOnly[0].id, actorUserId);
		expect(restored.title).toBe('Revisions Lifecycle Post');
	});

	it('scopes featured demotion to published undeleted posts only', async () => {
		const liveFeatured = await createPost(
			buildCompliantPostInput({
				slug: 'live-featured-one',
				status: 'published',
				featured: true
			}),
			actorUserId
		);
		expect(liveFeatured.featured).toBe(true);

		// Saving a featured DRAFT must NOT demote the live featured post!
		const draftFeatured = await createPost(
			buildCompliantPostInput({
				slug: 'draft-featured-two',
				status: 'draft',
				featured: true
			}),
			actorUserId
		);
		expect(draftFeatured.featured).toBe(true);

		const stillFeaturedLive = await getPostById(liveFeatured.id);
		expect(stillFeaturedLive?.featured).toBe(true);

		// Saving a SECOND published featured post DOES demote the first live featured post atomically
		const newLiveFeatured = await createPost(
			buildCompliantPostInput({
				slug: 'live-featured-three',
				status: 'published',
				featured: true
			}),
			actorUserId
		);
		expect(newLiveFeatured.featured).toBe(true);

		const demotedOldLive = await getPostById(liveFeatured.id);
		expect(demotedOldLive?.featured).toBe(false);

		const publicFeaturedList = await listFeaturedPosts(3);
		expect(publicFeaturedList.map((p) => p.slug)).toEqual(['live-featured-three']);
	});

	it('preserves multi-category pivots on quickUpdatePost and preserves omitted pivots on patchPost', async () => {
		const multiCatPost = await createPost(
			buildCompliantPostInput({
				slug: 'multi-cat-test-post',
				categoryId,
				categoryIds: [categoryId, secondCategoryId],
				tagIds: [tagId1, tagId2]
			}),
			actorUserId
		);
		expect(multiCatPost.categoryIds).toEqual(
			expect.arrayContaining([categoryId, secondCategoryId])
		);

		// Quick update changing only title and primary categoryId must not collapse the 2 categories to 1
		const afterQuick = await quickUpdatePost(
			{
				id: multiCatPost.id,
				title: 'Updated Quick Title',
				categoryId: secondCategoryId
			},
			actorUserId
		);
		expect(afterQuick.categoryIds.length).toBe(2);

		// Patch omitting relatedPostIds and tagIds preserves existing tagIds
		const afterPatch = await patchPost(
			{
				id: multiCatPost.id,
				title: 'Patched Title Only',
				forceOverwrite: true
			},
			actorUserId
		);
		expect(afterPatch.tagIds).toEqual(expect.arrayContaining([tagId1, tagId2]));
	});

	it('enforces category, tag, and author delete protection (409) and preserves is_active when omitted on update', async () => {
		const inactiveCat = await createCategory(
			{
				name: 'Inactive Category',
				slug: 'inactive-category',
				color: '#4b5f1d',
				isActive: false
			},
			actorUserId
		);
		expect(inactiveCat.isActive).toBe(false);

		const updatedInactiveCat = await updateCategory(
			{
				id: inactiveCat.id,
				name: 'Renamed Inactive Category',
				slug: 'inactive-category',
				color: '#4b5f1d'
			},
			actorUserId
		);
		expect(updatedInactiveCat.isActive).toBe(false);

		const inactiveAuthor = await createAuthor(
			{
				name: 'Inactive Analyst',
				slug: 'inactive-analyst',
				isActive: false
			},
			actorUserId
		);
		const updatedInactiveAuthor = await updateAuthor(
			{
				id: inactiveAuthor.id,
				name: 'Renamed Inactive Analyst',
				slug: 'inactive-analyst'
			},
			actorUserId
		);
		expect(updatedInactiveAuthor.isActive).toBe(false);

		// Deleting category, tag, or author used by active posts fails with 409 conflict code
		await expect(deleteCategory(categoryId, actorUserId)).rejects.toThrow(/^CATEGORY_IN_USE:/);
		await expect(deleteTag(tagId1, actorUserId)).rejects.toThrow(/^TAG_IN_USE:/);
		await expect(deleteAuthor(authorId, actorUserId)).rejects.toThrow(/^AUTHOR_IN_USE:/);
	});

	it('verifies cron secret constant-time comparison and idempotently sweeps scheduled and expired posts while excluding fixtures', async () => {
		expect(verifyCronAuthorization(null, 'my-cron-secret', true).status).toBe(401);
		expect(verifyCronAuthorization('Bearer wrong', 'my-cron-secret', true).status).toBe(401);
		expect(verifyCronAuthorization('Bearer my-cron-secret', '', true).status).toBe(500);
		expect(verifyCronAuthorization('Bearer my-cron-secret', 'my-cron-secret', true).status).toBe(
			200
		);

		const dueSched = await createPost(
			buildCompliantPostInput({
				slug: 'cron-due-scheduled',
				status: 'scheduled',
				scheduledAt: new Date(Date.now() - 5_000).toISOString()
			}),
			actorUserId
		);

		const fixtureSched = await createPost(
			buildCompliantPostInput({
				slug: 'cron-fixture-scheduled',
				status: 'scheduled',
				isFixture: true,
				scheduledAt: new Date(Date.now() - 5_000).toISOString()
			}),
			actorUserId
		);

		const firstSweep = await runScheduledPublishSweep();
		expect(firstSweep.published.map((p) => p.id)).toContain(dueSched.id);
		expect(firstSweep.published.map((p) => p.id)).not.toContain(fixtureSched.id);

		// Second sweep is idempotent (0 rows)
		const secondSweep = await runScheduledPublishSweep();
		expect(secondSweep.published).toHaveLength(0);
	});

	it('handles media upload, WebP conversion, variants, DB-failure blob cleanup, usage tracking, and delete protection', async () => {
		const pngBuffer = await sharp({
			create: {
				width: 1400,
				height: 800,
				channels: 3,
				background: { r: 20, g: 40, b: 60 }
			}
		})
			.png()
			.toBuffer();

		const uploaded = await uploadMediaAsset({
			filename: 'SPX Gamma Map.png',
			buffer: pngBuffer,
			metadata: {
				title: `SPX Gamma \u2014 Map`,
				alt_text: 'SPX Gamma Exposure Chart',
				folder: '/charts/'
			},
			actorUserId
		});

		expect(uploaded.mime_type).toBe('image/webp');
		expect(uploaded.width).toBe(1400);
		expect(uploaded.height).toBe(800);
		expect(uploaded.title).toBe('SPX Gamma, Map');
		expect(uploaded.folder).toBe('charts');
		// Real variant URLs for 480, 800, 1200 (not fake copies of original!)
		expect(uploaded.urls.thumbnail).toContain('-480w.webp');
		expect(uploaded.urls.medium).toContain('-800w.webp');
		expect(uploaded.urls.large).toContain('-1200w.webp');
		expect(uploaded.urls.original).toContain('-1400w.webp');

		// Reference this media item in a draft post and verify delete protection (409 MEDIA_IN_USE)
		const postUsingMedia = await createPost(
			buildCompliantPostInput({
				slug: 'post-using-media-item',
				coverImage: uploaded.urls.original,
				status: 'draft'
			}),
			actorUserId
		);

		await expect(deleteMediaItem(uploaded.id, actorUserId)).rejects.toThrow(/^MEDIA_IN_USE:/);

		// Update media metadata atomically
		const patched = await updateMediaMetadata(
			uploaded.id,
			{
				title: `Updated Title \u2014 Clean`,
				altText: 'Updated Alt Text'
			},
			actorUserId
		);
		expect(patched?.title).toBe('Updated Title, Clean');
		expect(patched?.alt_text).toBe('Updated Alt Text');
		expect(patched?.usage_count).toBe(1);

		// Delete the post so media is no longer in use, then verify blob delete failure aborts DB soft-delete
		await permanentlyDeletePost(postUsingMedia.id, actorUserId);

		setMediaStorageDriverForTest({
			async put(pathname) {
				return { url: `https://revolutiontradingpros.com/media/${pathname}`, pathname };
			},
			async del() {
				throw new Error('BLOB_DEL_NETWORK_ERROR');
			}
		});

		await expect(deleteMediaItem(uploaded.id, actorUserId)).rejects.toThrow(
			'BLOB_DEL_NETWORK_ERROR'
		);
		// Row must STILL be undeleted because blob deletion failed!
		const stillPresent = await testEnv.db.select().from(media).where(eq(media.id, uploaded.id));
		expect(stillPresent[0].deletedAt).toBeNull();

		// Restore working storage driver and delete cleanly
		setMediaStorageDriverForTest(null);
		const delOk = await deleteMediaItem(uploaded.id, actorUserId);
		expect(delOk.deleted).toBe(true);
	});

	it('protects password-protected posts without leaking metadata, verifies scrypt/HMAC tokens, and enforces rate limits and cache headers', async () => {
		const protectedPost = await createPost(
			buildCompliantPostInput({
				slug: 'secret-institutional-playbook',
				status: 'published',
				visibility: 'password_protected',
				password: 'goldfinger-secret-key'
			}),
			actorUserId
		);
		expect('password' in protectedPost).toBe(false);
		expect(protectedPost.hasPassword).toBe(true);

		// Locked view returns ONLY title, slug, breadcrumbs, notice, and strips all metadata/content
		const lockedRes = await getPublicPostViewBySlug('secret-institutional-playbook', {
			isAdmin: false
		});
		expect(lockedRes.status).toBe(200);
		if (lockedRes.status === 200 && lockedRes.locked) {
			const payload = lockedRes.payload as unknown as Record<string, unknown>;
			expect(payload.title).toBe(protectedPost.title);
			expect(payload.metaDescription).toBeUndefined();
			expect(payload.coverImage).toBeUndefined();
			expect(payload.content).toBeUndefined();
			expect(payload.wordCount).toBeUndefined();
			expect(payload.faqItems).toBeUndefined();
		}

		// Verify password hash and HMAC unlock cookie token
		const rawRow = (await testEnv.db.select().from(posts).where(eq(posts.id, protectedPost.id)))[0];
		expect(verifyPostPassword('goldfinger-secret-key', rawRow.password)).toBe(true);
		expect(verifyPostPassword('wrong-password', rawRow.password)).toBe(false);

		const token = signPostUnlockToken(protectedPost.id, rawRow.password!);
		expect(verifyPostUnlockToken(token, protectedPost.id, rawRow.password)).toBe(true);

		// Unlocked view returns full post
		const unlockedRes = await getPublicPostViewBySlug('secret-institutional-playbook', {
			isPasswordUnlocked: (id, hash) => verifyPostUnlockToken(token, id, hash)
		});
		expect(unlockedRes.status).toBe(200);
		if (unlockedRes.status === 200 && !unlockedRes.locked) {
			expect(unlockedRes.post.content).toContain('Mastering options greeks');
		}

		// Rate limit: 10 attempts allowed, 11th blocked
		for (let i = 1; i <= 10; i++) {
			const rl = await consumeRateLimit({
				key: 'unlock:127.0.0.1:secret-institutional-playbook',
				limit: 10,
				windowMs: 600_000
			});
			expect(rl.allowed).toBe(true);
		}
		const rl11 = await consumeRateLimit({
			key: 'unlock:127.0.0.1:secret-institutional-playbook',
			limit: 10,
			windowMs: 600_000
		});
		expect(rl11.allowed).toBe(false);

		// Caching headers by role
		const headersPublic: Record<string, string> = {};
		setPublicReadCache((h) => Object.assign(headersPublic, h), {}, new Request('https://x.com'));
		expect(headersPublic['Cache-Control']).toContain('s-maxage=300');

		const headersAdmin: Record<string, string> = {};
		setPublicReadCache(
			(h) => Object.assign(headersAdmin, h),
			{ user: { id: '1', name: 'A', email: 'a@b.c' } as App.Locals['user'] },
			new Request('https://x.com')
		);
		expect(headersAdmin['Cache-Control']).toContain('no-store');
	});
});
