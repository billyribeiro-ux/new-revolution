import { and, asc, eq, isNull, ne } from 'drizzle-orm';
import {
	tagCreateSchema,
	tagUpdateSchema,
	type TagCreateInput,
	type TagUpdateInput
} from '../../shared/schemas/taxonomy';
import { replaceEmEnDashesInPlainText } from '../../shared/seo/content-transform';
import { isTagIndexable } from '../../shared/seo/taxonomy';
import { writeAuditLog } from '../audit';
import { ensureDbReady } from '../db';
import { posts, postTags, tags } from '../db/schema';
import { publicIndexablePostPredicate } from '../posts/visibility';

export async function listTags() {
	const db = await ensureDbReady();
	return db.select().from(tags).orderBy(asc(tags.name));
}

export async function getTagById(id: number) {
	const db = await ensureDbReady();
	const rows = await db.select().from(tags).where(eq(tags.id, id)).limit(1);
	return rows[0] ?? null;
}

export async function createTag(rawInput: TagCreateInput, actorUserId?: string | null) {
	const parsed = tagCreateSchema.parse(rawInput);
	const db = await ensureDbReady();

	const targetSlug = parsed.slug.trim().toLowerCase();
	const dup = await db.select({ id: tags.id }).from(tags).where(eq(tags.slug, targetSlug)).limit(1);

	if (dup.length > 0) {
		throw new Error(`DUPLICATE_SLUG: Tag slug "${targetSlug}" already exists.`);
	}

	const now = new Date();
	const inserted = await db
		.insert(tags)
		.values({
			name: replaceEmEnDashesInPlainText(parsed.name),
			slug: targetSlug,
			description: parsed.description ? replaceEmEnDashesInPlainText(parsed.description) : null,
			createdAt: now,
			updatedAt: now
		})
		.returning();

	const row = inserted[0];
	await writeAuditLog({
		actorUserId,
		action: 'tag.create',
		entityType: 'tag',
		entityId: row.id,
		summary: { name: row.name, slug: row.slug }
	});

	return row;
}

export async function updateTag(rawInput: TagUpdateInput, actorUserId?: string | null) {
	const parsed = tagUpdateSchema.parse(rawInput);
	const db = await ensureDbReady();

	const existing = await getTagById(parsed.id);
	if (!existing) {
		throw new Error('TAG_NOT_FOUND: Tag does not exist.');
	}

	const targetSlug = parsed.slug.trim().toLowerCase();
	const dup = await db
		.select({ id: tags.id })
		.from(tags)
		.where(and(eq(tags.slug, targetSlug), ne(tags.id, parsed.id)))
		.limit(1);

	if (dup.length > 0) {
		throw new Error(`DUPLICATE_SLUG: Tag slug "${targetSlug}" already exists.`);
	}

	const updated = await db
		.update(tags)
		.set({
			name: replaceEmEnDashesInPlainText(parsed.name),
			slug: targetSlug,
			description:
				parsed.description !== undefined
					? parsed.description
						? replaceEmEnDashesInPlainText(parsed.description)
						: null
					: existing.description,
			updatedAt: new Date()
		})
		.where(eq(tags.id, parsed.id))
		.returning();

	const row = updated[0];
	await writeAuditLog({
		actorUserId,
		action: 'tag.update',
		entityType: 'tag',
		entityId: row.id,
		summary: { name: row.name, slug: row.slug }
	});

	return row;
}

export async function deleteTag(id: number, actorUserId?: string | null) {
	const db = await ensureDbReady();
	const existing = await getTagById(id);
	if (!existing) {
		throw new Error('TAG_NOT_FOUND: Tag does not exist.');
	}

	const referencing = await db
		.select({ postId: postTags.postId })
		.from(postTags)
		.innerJoin(posts, eq(postTags.postId, posts.id))
		.where(and(eq(postTags.tagId, id), isNull(posts.deletedAt)));

	if (referencing.length > 0) {
		throw new Error(
			`TAG_IN_USE: Cannot delete tag "${existing.name}" because it is assigned to ${referencing.length} active post(s).`
		);
	}

	await db.delete(tags).where(eq(tags.id, id));
	await writeAuditLog({
		actorUserId,
		action: 'tag.delete',
		entityType: 'tag',
		entityId: id,
		summary: { name: existing.name, slug: existing.slug }
	});

	return { deleted: true, id };
}

export async function listPublicTagsWithCounts() {
	const db = await ensureDbReady();
	const now = new Date();
	const allTags = await db.select().from(tags).orderBy(asc(tags.name));

	const publicPostRows = await db
		.select({ id: posts.id })
		.from(posts)
		.where(publicIndexablePostPredicate(now));

	const totalPublicPosts = publicPostRows.length;
	const publicPostIds = new Set(publicPostRows.map((p) => p.id));

	const pivotRows = totalPublicPosts > 0 ? await db.select().from(postTags) : [];
	const countByTag = new Map<number, number>();
	for (const piv of pivotRows) {
		if (publicPostIds.has(piv.postId)) {
			countByTag.set(piv.tagId, (countByTag.get(piv.tagId) ?? 0) + 1);
		}
	}

	return allTags.map((tag) => {
		const postCount = countByTag.get(tag.id) ?? 0;
		return {
			...tag,
			postCount,
			totalPublicPosts,
			isIndexable: isTagIndexable(postCount, totalPublicPosts)
		};
	});
}
