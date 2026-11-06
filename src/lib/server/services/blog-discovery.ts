import { and, count, desc, eq, inArray, isNull, ne, or, sql } from 'drizzle-orm';
import { ensureDbReady } from '../db';
import { authors, categories, media, posts } from '../db/schema';
import { coverSrcsetFromMedia, type CoverMediaRow } from '../../shared/cover-srcset';
import {
	buildPublicPostFilter,
	type PublicPostQueryDb,
	type PublicPostFilters
} from '../posts/search-query';
import { normalizeBlogSearch } from '../../shared/blog/search';
import type { BlogCardPost, BlogListing } from '#lib/shared/blog/discovery';
import { BLOG_PAGE_SIZE } from '#lib/shared/blog/pagination';

// Select card fields only: listing payloads must never include private bodies, passwords or tokens.
const cardSelection = {
	id: posts.id,
	title: posts.title,
	slug: posts.slug,
	excerpt: posts.excerpt,
	coverImage: posts.coverImage,
	coverImageAlt: posts.coverImageAlt,
	coverImageWidth: posts.coverImageWidth,
	coverImageHeight: posts.coverImageHeight,
	publishedAt: posts.publishedAt,
	contentUpdatedAt: posts.contentUpdatedAt,
	readingTime: posts.readingTime,
	featured: posts.featured,
	isPillar: posts.isPillar,
	categoryName: categories.name,
	categorySlug: categories.slug,
	categoryColor: categories.color,
	authorName: authors.name,
	authorSlug: authors.slug
};

// A due schedule may be readable before the cron fills publishedAt. DESC would otherwise put NULL
// first and promote an older due schedule over a newer publication.
const publicationDate = sql<Date>`coalesce(${posts.publishedAt}, ${posts.scheduledAt}, ${posts.createdAt})`;

function selectCards(db: PublicPostQueryDb) {
	return db
		.select(cardSelection)
		.from(posts)
		.leftJoin(authors, eq(posts.authorId, authors.id))
		.leftJoin(categories, eq(posts.categoryId, categories.id));
}

type CardRow = Awaited<ReturnType<typeof selectCards>>[number];

function toCard(row: CardRow, coverMedia?: CoverMediaRow): BlogCardPost {
	return {
		id: row.id,
		title: row.title,
		slug: row.slug,
		excerpt: row.excerpt,
		coverImage: row.coverImage,
		coverImageAlt: row.coverImageAlt,
		coverImageWidth: row.coverImageWidth,
		coverImageHeight: row.coverImageHeight,
		coverImageSrcset: row.coverImage ? coverSrcsetFromMedia(row.coverImage, coverMedia) : undefined,
		publishedAt: row.publishedAt,
		contentUpdatedAt: row.contentUpdatedAt,
		readingTime: row.readingTime,
		featured: row.featured,
		isPillar: row.isPillar,
		category:
			row.categoryName && row.categorySlug
				? { name: row.categoryName, slug: row.categorySlug, color: row.categoryColor }
				: null,
		author: row.authorName && row.authorSlug ? { name: row.authorName, slug: row.authorSlug } : null
	};
}

/** Resolve exact stored originals/variants in one lookup; unknown URLs never invent sibling files. */
async function resolveCardCoverMedia(db: PublicPostQueryDb, rows: CardRow[]) {
	const urls = [...new Set(rows.flatMap((row) => (row.coverImage ? [row.coverImage] : [])))];
	const byUrl = new Map<string, CoverMediaRow>();
	if (urls.length === 0) return byUrl;
	const records = await db
		.select({ blobUrl: media.blobUrl, width: media.width, variantsJson: media.variantsJson })
		.from(media)
		.where(
			and(
				isNull(media.deletedAt),
				or(
					inArray(media.blobUrl, urls),
					sql`exists (select 1 from jsonb_each(case when jsonb_typeof(${media.variantsJson}) = 'object' then ${media.variantsJson} else '{}'::jsonb end) as variant where variant.value->>'url' in (${sql.join(
						urls.map((url) => sql`${url}`),
						sql`, `
					)}))`
				)
			)
		);
	for (const row of records) {
		byUrl.set(row.blobUrl, row);
		for (const variant of Object.values(row.variantsJson ?? {}))
			if (variant?.url) byUrl.set(variant.url, row);
	}
	return byUrl;
}

/**
 * One CMS discovery contract for the homepage and blog archive. A marked feature wins; otherwise the
 * newest eligible publication leads. The lead is excluded BEFORE pagination so pages never lose a slot
 * or repeat it below. Search includes every matching post and has no separate lead.
 */
export async function getPublicBlogListing(
	options: PublicPostFilters & {
		page?: number;
		perPage?: number;
	} = {}
): Promise<BlogListing> {
	const db = await ensureDbReady();
	const page = Math.max(1, Math.floor(options.page ?? 1));
	const perPage = Math.max(1, Math.min(50, Math.floor(options.perPage ?? BLOG_PAGE_SIZE)));
	const search = normalizeBlogSearch(options.search ?? '');
	return db.transaction(
		async (tx) => {
			const eligible = await buildPublicPostFilter(tx, { ...options, search }, new Date());
			const [lead] =
				search || options.categoryId || options.tagId
					? []
					: await selectCards(tx)
							.where(eligible)
							.orderBy(desc(posts.featured), desc(publicationDate), desc(posts.id))
							.limit(1);
			const filters = [eligible];
			if (lead) filters.push(ne(posts.id, lead.id));
			const where = and(...filters)!;
			const [totals, rows] = await Promise.all([
				tx.select({ total: count() }).from(posts).where(where),
				selectCards(tx)
					.where(where)
					.orderBy(desc(publicationDate), desc(posts.id))
					.limit(perPage)
					.offset((page - 1) * perPage)
			]);
			const remaining = Number(totals[0]?.total ?? 0);
			const coverMedia = await resolveCardCoverMedia(
				tx,
				lead && page === 1 ? [lead, ...rows] : rows
			);
			return {
				featuredPosts:
					lead && page === 1 ? [toCard(lead, coverMedia.get(lead.coverImage ?? ''))] : [],
				posts: rows.map((row) => toCard(row, coverMedia.get(row.coverImage ?? ''))),
				search,
				pagination: {
					page,
					perPage,
					total: remaining + (lead ? 1 : 0),
					totalPages: Math.max(1, Math.ceil(remaining / perPage))
				}
			};
		},
		{ isolationLevel: 'repeatable read', accessMode: 'read only' }
	);
}
