import { and, asc, eq, gt, isNull, lte, or, sql } from 'drizzle-orm';
import type { AppDatabase } from '../db/index.ts';
import { posts } from '../db/schema.ts';
import { buildPostSearchProjection } from './search-projection.ts';

export const postSearchSourceSelection = {
	id: posts.id,
	title: posts.title,
	excerpt: posts.excerpt,
	content: posts.content,
	faqItems: posts.faqItems,
	customFields: posts.customFields,
	coverImage: posts.coverImage,
	coverImageCaption: posts.coverImageCaption
};
export type PostSearchSourceRow = Pick<
	typeof posts.$inferSelect,
	keyof typeof postSearchSourceSelection
>;
type SearchWriteDb = Pick<AppDatabase, 'select' | 'update'>;

/** Call after the source write, using its returned row, within the SAME transaction. */
export async function persistPostSearchProjection(db: SearchWriteDb, source: PostSearchSourceRow) {
	const projection = buildPostSearchProjection(source);
	await db.update(posts).set(projection).where(eq(posts.id, source.id));
	return projection;
}

/** Compare every source input: some historical direct writers did not move updatedAt. */
export async function compareAndSetPostSearchProjection(
	db: SearchWriteDb,
	source: PostSearchSourceRow
): Promise<boolean> {
	const rows = await db
		.update(posts)
		.set(buildPostSearchProjection(source))
		.where(
			and(
				eq(posts.id, source.id),
				isNull(posts.searchText),
				isNull(posts.searchExcluded),
				sql`${posts.title} is not distinct from ${source.title}`,
				sql`${posts.excerpt} is not distinct from ${source.excerpt}`,
				sql`${posts.content} is not distinct from ${source.content}`,
				sql`${posts.faqItems} is not distinct from ${source.faqItems}`,
				sql`${posts.customFields} is not distinct from ${source.customFields}`,
				sql`${posts.coverImage} is not distinct from ${source.coverImage}`,
				sql`${posts.coverImageCaption} is not distinct from ${source.coverImageCaption}`
			)
		)
		.returning({ id: posts.id });
	return rows.length > 0;
}

/** A finite keyset pass with bounded memory. Concurrently changed rows remain pending for a retry. */
export async function backfillPostSearchProjections(
	db: SearchWriteDb,
	options: { batchSize?: number; limit?: number; dryRun?: boolean } = {}
) {
	const batchSize = Math.max(1, Math.min(500, Math.floor(options.batchSize ?? 100)));
	const limit =
		options.limit === undefined ? Number.POSITIVE_INFINITY : Math.max(0, Math.floor(options.limit));
	const [{ lastId }] = await db
		.select({ lastId: sql<number>`coalesce(max(${posts.id}), 0)` })
		.from(posts);
	let afterId = 0;
	let scanned = 0;
	let updated = 0;
	let skipped = 0;
	while (scanned < limit) {
		const rows = await db
			.select(postSearchSourceSelection)
			.from(posts)
			.where(
				and(
					gt(posts.id, afterId),
					lte(posts.id, lastId),
					or(isNull(posts.searchText), isNull(posts.searchExcluded))
				)
			)
			.orderBy(asc(posts.id))
			.limit(Math.min(batchSize, limit - scanned));
		if (rows.length === 0) break;
		for (const row of rows) {
			scanned += 1;
			if (options.dryRun !== false) buildPostSearchProjection(row);
			else if (await compareAndSetPostSearchProjection(db, row)) updated += 1;
			else skipped += 1;
		}
		afterId = rows[rows.length - 1].id;
	}
	const [{ pending }] = await db
		.select({ pending: sql<number>`count(*)::integer` })
		.from(posts)
		.where(or(isNull(posts.searchText), isNull(posts.searchExcluded)));
	return { dryRun: options.dryRun !== false, scanned, updated, skipped, pending };
}
