import { and, asc, eq, gt, ilike, inArray, isNull, or, sql, type SQL } from 'drizzle-orm';
import type { AppDatabase } from '../db/index.ts';
import { postCategories, posts, postTags } from '../db/schema.ts';
import { normalizeBlogSearch } from '../../shared/blog/search.ts';
import { buildPostSearchProjection } from './search-projection.ts';
import { postSearchSourceSelection } from './search-persistence.ts';
import { publicIndexablePostPredicate } from './visibility.ts';

export type PublicPostQueryDb = Pick<AppDatabase, 'select'>;
export interface PublicPostFilters {
	search?: string;
	categoryId?: number;
	tagId?: number;
}

/** All public discovery callers use this predicate before COUNT and LIMIT/OFFSET in one snapshot. */
export async function buildPublicPostFilter(
	db: PublicPostQueryDb,
	options: PublicPostFilters,
	now: Date
): Promise<SQL> {
	const filters = [publicIndexablePostPredicate(now)];
	if (options.categoryId) {
		const categoryPostIds = db
			.select({ postId: postCategories.postId })
			.from(postCategories)
			.where(eq(postCategories.categoryId, options.categoryId));
		filters.push(or(eq(posts.categoryId, options.categoryId), inArray(posts.id, categoryPostIds))!);
	}
	if (options.tagId) {
		const tagPostIds = db
			.select({ postId: postTags.postId })
			.from(postTags)
			.where(eq(postTags.tagId, options.tagId));
		filters.push(inArray(posts.id, tagPostIds));
	}
	const eligible = and(...filters)!;
	const search = normalizeBlogSearch(options.search ?? '');
	if (!search) return eligible;
	const pattern = `%${search.replace(/[%_\\]/g, '\\$&')}%`;
	const pendingMatches: number[] = [];
	let afterId = 0;
	// A pre-deployment writer may invalidate a projection after backfill. Derive only pending eligible
	// rows, in bounded batches, without changing stored content or writing during a public GET.
	for (;;) {
		const pending = await db
			.select(postSearchSourceSelection)
			.from(posts)
			.where(and(eligible, isNull(posts.searchText), gt(posts.id, afterId)))
			.orderBy(asc(posts.id))
			.limit(100);
		if (pending.length === 0) break;
		afterId = pending[pending.length - 1].id;
		const candidates = pending.flatMap((row) => {
			const projection = buildPostSearchProjection(row);
			return projection.searchExcluded
				? []
				: [sql`(${row.id}::integer, ${projection.searchText}::text)`];
		});
		if (candidates.length > 0) {
			// Matching through the same database ILIKE avoids locale/case differences between indexed
			// and pending text. IDs/text are parameters, never interpolated SQL or client payloads.
			const matches = await db
				.select({ id: sql<number>`candidate.id` })
				.from(sql`(values ${sql.join(candidates, sql`, `)}) as candidate(id, body)`)
				.where(sql`candidate.body ilike ${pattern}`);
			pendingMatches.push(...matches.map((row) => row.id));
		}
		if (pending.length < 100) break;
	}
	return and(
		eligible,
		or(
			and(eq(posts.searchExcluded, false), ilike(posts.searchText, pattern)),
			pendingMatches.length > 0
				? and(
						isNull(posts.searchText),
						sql`${posts.id} = any(${`{${pendingMatches.join(',')}}`}::integer[])`
					)
				: sql`false`
		)
	)!;
}
