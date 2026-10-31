import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { and, desc, eq, inArray, isNotNull, isNull, lte, sql } from 'drizzle-orm';
import { writeAuditLog } from '../audit';
import { ensureDbReady } from '../db';
import { posts } from '../db/schema';
import { invalidatePublicBlogCache, notifySearchEnginesAsync } from '../posts/cache';

export function verifyCronAuthorization(
	authHeader: string | null,
	configuredSecret: string | undefined = process.env.CRON_SECRET,
	isProduction: boolean = process.env.NODE_ENV === 'production'
): { status: 200 | 401 | 500; error?: string } {
	if (!configuredSecret || !configuredSecret.trim()) {
		if (isProduction) {
			return {
				status: 500,
				error: 'CRON_SECRET_MISSING: CRON_SECRET is not configured in production.'
			};
		}
		return {
			status: 401,
			error: 'Unauthorized: CRON_SECRET is not set.'
		};
	}

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return { status: 401, error: 'Unauthorized: Missing Bearer token.' };
	}

	const provided = authHeader.slice('Bearer '.length).trim();
	const digestA = createHash('sha256').update(provided).digest();
	const digestB = createHash('sha256').update(configuredSecret.trim()).digest();

	if (!timingSafeEqual(digestA, digestB)) {
		return { status: 401, error: 'Unauthorized: Invalid Bearer token.' };
	}

	return { status: 200 };
}

export interface ScheduledSweepResult {
	requestId: string;
	published: Array<{ id: number; slug: string }>;
	archived: Array<{ id: number; slug: string }>;
	retriedNotificationSlugs: string[];
}

export async function runScheduledPublishSweep(): Promise<ScheduledSweepResult> {
	const requestId = randomUUID();
	const db = await ensureDbReady();
	const now = new Date();

	// 1. Atomic transaction for scheduled -> published (excludes fixtures and deleted, requires author & category,
	//    and scopes featured demotion so `posts_single_live_featured_idx` is never violated)
	const publishedRows = await db.transaction(async (tx) => {
		const dueRows = await tx
			.select({
				id: posts.id,
				featured: posts.featured
			})
			.from(posts)
			.where(
				and(
					eq(posts.status, 'scheduled'),
					isNotNull(posts.scheduledAt),
					lte(posts.scheduledAt, now),
					isNull(posts.deletedAt),
					eq(posts.isFixture, false),
					isNotNull(posts.authorId),
					isNotNull(posts.categoryId)
				)
			)
			.orderBy(desc(posts.scheduledAt), desc(posts.id));

		if (dueRows.length === 0) {
			return [];
		}

		const dueFeaturedIds = dueRows.filter((r) => r.featured).map((r) => r.id);
		if (dueFeaturedIds.length > 0) {
			// Demote any currently live featured post before promoting the scheduled featured post
			await tx
				.update(posts)
				.set({ featured: false })
				.where(
					and(eq(posts.featured, true), eq(posts.status, 'published'), isNull(posts.deletedAt))
				);

			// If multiple scheduled posts had featured = true, keep only the newest one featured
			if (dueFeaturedIds.length > 1) {
				await tx
					.update(posts)
					.set({ featured: false })
					.where(inArray(posts.id, dueFeaturedIds.slice(1)));
			}
		}

		return tx
			.update(posts)
			.set({
				status: 'published',
				published: true,
				publishedAt: sql`COALESCE(${posts.publishedAt}, ${now.toISOString()}::timestamptz)`,
				updatedAt: now,
				searchNotifyPending: true
			})
			.where(
				inArray(
					posts.id,
					dueRows.map((r) => r.id)
				)
			)
			.returning();
	});

	// 2. Atomic UPDATE for published -> archived on expiry
	const archivedRows = await db
		.update(posts)
		.set({
			status: 'archived',
			published: false,
			updatedAt: now,
			searchNotifyPending: true
		})
		.where(
			and(
				eq(posts.status, 'published'),
				isNotNull(posts.expiresAt),
				lte(posts.expiresAt, now),
				isNull(posts.deletedAt),
				eq(posts.isFixture, false)
			)
		)
		.returning();

	// 3. Pick up any rows with pending search engine notifications (including from an interrupted prior run)
	const pendingNotifyRows = await db
		.select({ id: posts.id, slug: posts.slug })
		.from(posts)
		.where(and(eq(posts.searchNotifyPending, true), eq(posts.isFixture, false)));

	const allSlugsToNotify = [
		...new Set([
			...publishedRows.map((r) => r.slug),
			...archivedRows.map((r) => r.slug),
			...pendingNotifyRows.map((r) => r.slug)
		])
	];

	if (allSlugsToNotify.length > 0) {
		invalidatePublicBlogCache([
			'/blog',
			'/rss.xml',
			'/sitemap.xml',
			...allSlugsToNotify.map((s) => `/blog/${s}`)
		]);

		const urls = allSlugsToNotify.map((s) => `https://revolutiontradingpros.com/blog/${s}`);
		await Promise.allSettled([
			new Promise<void>((resolve) => {
				notifySearchEnginesAsync(urls, {
					onResult: async (succeeded) => {
						if (succeeded && pendingNotifyRows.length > 0) {
							await db
								.update(posts)
								.set({ searchNotifyPending: false })
								.where(
									inArray(
										posts.id,
										pendingNotifyRows.map((r) => r.id)
									)
								);
						}
						resolve();
					}
				});
			})
		]);
	}

	if (publishedRows.length > 0 || archivedRows.length > 0) {
		await writeAuditLog({
			actorUserId: null,
			action: 'cron.publish_scheduled',
			entityType: 'cron',
			entityId: requestId,
			summary: {
				publishedCount: publishedRows.length,
				archivedCount: archivedRows.length,
				publishedSlugs: publishedRows.map((r) => r.slug),
				archivedSlugs: archivedRows.map((r) => r.slug)
			}
		});
	}

	return {
		requestId,
		published: publishedRows,
		archived: archivedRows,
		retriedNotificationSlugs: allSlugsToNotify
	};
}
