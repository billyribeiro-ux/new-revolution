import { and, count, desc, eq, ilike, isNull, ne, notIlike, or, sql } from 'drizzle-orm';
import { ensureDbReady } from '../db';
import { authors, categories, posts } from '../db/schema';
import { publicIndexablePostPredicate } from '../posts/visibility';
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

function selectCards(db: Awaited<ReturnType<typeof ensureDbReady>>) {
	return db
		.select(cardSelection)
		.from(posts)
		.leftJoin(authors, eq(posts.authorId, authors.id))
		.leftJoin(categories, eq(posts.categoryId, categories.id));
}

type CardRow = Awaited<ReturnType<typeof selectCards>>[number];

function toCard(row: CardRow): BlogCardPost {
	return {
		id: row.id,
		title: row.title,
		slug: row.slug,
		excerpt: row.excerpt,
		coverImage: row.coverImage,
		coverImageAlt: row.coverImageAlt,
		coverImageWidth: row.coverImageWidth,
		coverImageHeight: row.coverImageHeight,
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

/**
 * One CMS discovery contract for the homepage and blog archive. A marked feature wins; otherwise the
 * newest eligible publication leads. The lead is excluded BEFORE pagination so pages never lose a slot
 * or repeat it below. Search includes every matching post and has no separate lead.
 */
export async function getPublicBlogListing(
	options: {
		page?: number;
		perPage?: number;
		search?: string;
	} = {}
): Promise<BlogListing> {
	const db = await ensureDbReady();
	const page = Math.max(1, Math.floor(options.page ?? 1));
	const perPage = Math.max(1, Math.min(50, Math.floor(options.perPage ?? BLOG_PAGE_SIZE)));
	const search = options.search?.trim() ?? '';
	const eligible = publicIndexablePostPredicate(new Date());
	const [lead] = search
		? []
		: await selectCards(db)
				.where(eligible)
				.orderBy(desc(posts.featured), desc(publicationDate), desc(posts.id))
				.limit(1);
	const filters = [eligible];
	if (lead) filters.push(ne(posts.id, lead.id));
	if (search) {
		const pattern = `%${search.replace(/[%_\\]/g, '\\$&')}%`;
		filters.push(or(ilike(posts.title, pattern), ilike(posts.excerpt, pattern))!);
		filters.push(
			or(
				isNull(posts.customFields),
				notIlike(posts.customFields, '%"__excludeFromSearch","value":"true"%')
			)!
		);
	}
	const where = and(...filters)!;
	const [totals, rows] = await Promise.all([
		db.select({ total: count() }).from(posts).where(where),
		selectCards(db)
			.where(where)
			.orderBy(desc(publicationDate), desc(posts.id))
			.limit(perPage)
			.offset((page - 1) * perPage)
	]);
	const remaining = Number(totals[0]?.total ?? 0);
	return {
		featuredPosts: lead && page === 1 ? [toCard(lead)] : [],
		posts: rows.map(toCard),
		search,
		pagination: {
			page,
			perPage,
			total: remaining + (lead ? 1 : 0),
			totalPages: Math.max(1, Math.ceil(remaining / perPage))
		}
	};
}
