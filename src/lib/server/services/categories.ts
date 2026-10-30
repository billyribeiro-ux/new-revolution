import { and, asc, eq, isNull, ne, or, sql } from 'drizzle-orm';
import {
	categoryCreateSchema,
	categoryUpdateSchema,
	type CategoryCreateInput,
	type CategoryUpdateInput
} from '../../shared/schemas/taxonomy';
import { replaceEmEnDashesInPlainText } from '../../shared/seo/content-transform';
import { isCategoryIndexable } from '../../shared/seo/taxonomy';
import { writeAuditLog } from '../audit';
import { ensureDbReady } from '../db';
import { categories, postCategories, posts } from '../db/schema';
import { publicIndexablePostPredicate } from '../posts/visibility';

async function assertNoCategoryCycle(categoryId: number, parentId: number | null | undefined) {
	if (!parentId) return;
	if (parentId === categoryId) {
		throw new Error('CATEGORY_CYCLE: A category cannot be its own parent.');
	}

	const db = await ensureDbReady();
	const visited = new Set<number>([categoryId]);
	let currentParentId: number | null = parentId;

	while (currentParentId !== null) {
		if (visited.has(currentParentId)) {
			throw new Error('CATEGORY_CYCLE: Assigning this parent would create a circular hierarchy.');
		}
		visited.add(currentParentId);

		const rows = await db
			.select({ parentId: categories.parentId })
			.from(categories)
			.where(eq(categories.id, currentParentId))
			.limit(1);

		if (rows.length === 0) {
			throw new Error('CATEGORY_PARENT_NOT_FOUND: Parent category does not exist.');
		}
		currentParentId = rows[0].parentId ?? null;
	}
}

export async function listCategories() {
	const db = await ensureDbReady();
	return db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getCategoryById(id: number) {
	const db = await ensureDbReady();
	const rows = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
	return rows[0] ?? null;
}

export async function createCategory(rawInput: CategoryCreateInput, actorUserId?: string | null) {
	const parsed = categoryCreateSchema.parse(rawInput);
	const db = await ensureDbReady();

	const targetSlug = parsed.slug.trim().toLowerCase();
	const dup = await db
		.select({ id: categories.id })
		.from(categories)
		.where(eq(categories.slug, targetSlug))
		.limit(1);

	if (dup.length > 0) {
		throw new Error(`DUPLICATE_SLUG: Category slug "${targetSlug}" already exists.`);
	}

	const now = new Date();
	const inserted = await db
		.insert(categories)
		.values({
			name: replaceEmEnDashesInPlainText(parsed.name),
			slug: targetSlug,
			description: parsed.description ? replaceEmEnDashesInPlainText(parsed.description) : null,
			metaTitle: parsed.metaTitle ? replaceEmEnDashesInPlainText(parsed.metaTitle) : null,
			metaDescription: parsed.metaDescription
				? replaceEmEnDashesInPlainText(parsed.metaDescription)
				: null,
			pillarContent: parsed.pillarContent ?? null,
			icon: parsed.icon ?? null,
			color: parsed.color ?? '#4b5f1d',
			image: parsed.image || null,
			imageAlt: parsed.imageAlt ? replaceEmEnDashesInPlainText(parsed.imageAlt) : null,
			parentId: parsed.parentId ?? null,
			sortOrder: parsed.sortOrder ?? 0,
			isActive: parsed.isActive ?? true,
			createdAt: now,
			updatedAt: now
		})
		.returning();

	const row = inserted[0];
	await writeAuditLog({
		actorUserId,
		action: 'category.create',
		entityType: 'category',
		entityId: row.id,
		summary: { name: row.name, slug: row.slug }
	});

	return row;
}

export async function updateCategory(rawInput: CategoryUpdateInput, actorUserId?: string | null) {
	const parsed = categoryUpdateSchema.parse(rawInput);
	const db = await ensureDbReady();

	const existing = await getCategoryById(parsed.id);
	if (!existing) {
		throw new Error('CATEGORY_NOT_FOUND: Category does not exist.');
	}

	const targetSlug = parsed.slug.trim().toLowerCase();
	const dup = await db
		.select({ id: categories.id })
		.from(categories)
		.where(and(eq(categories.slug, targetSlug), ne(categories.id, parsed.id)))
		.limit(1);

	if (dup.length > 0) {
		throw new Error(`DUPLICATE_SLUG: Category slug "${targetSlug}" already exists.`);
	}

	await assertNoCategoryCycle(parsed.id, parsed.parentId ?? null);

	// Preserve existing `is_active` when `isActive` is omitted (Section 8.8)
	const preservedIsActive = parsed.isActive !== undefined ? parsed.isActive : existing.isActive;

	const updated = await db
		.update(categories)
		.set({
			name: replaceEmEnDashesInPlainText(parsed.name),
			slug: targetSlug,
			description:
				parsed.description !== undefined
					? parsed.description
						? replaceEmEnDashesInPlainText(parsed.description)
						: null
					: existing.description,
			metaTitle:
				parsed.metaTitle !== undefined
					? parsed.metaTitle
						? replaceEmEnDashesInPlainText(parsed.metaTitle)
						: null
					: existing.metaTitle,
			metaDescription:
				parsed.metaDescription !== undefined
					? parsed.metaDescription
						? replaceEmEnDashesInPlainText(parsed.metaDescription)
						: null
					: existing.metaDescription,
			pillarContent:
				parsed.pillarContent !== undefined ? parsed.pillarContent : existing.pillarContent,
			icon: parsed.icon !== undefined ? parsed.icon : existing.icon,
			color: parsed.color ?? existing.color ?? '#4b5f1d',
			image: parsed.image !== undefined ? parsed.image || null : existing.image,
			imageAlt:
				parsed.imageAlt !== undefined
					? parsed.imageAlt
						? replaceEmEnDashesInPlainText(parsed.imageAlt)
						: null
					: existing.imageAlt,
			parentId: parsed.parentId !== undefined ? parsed.parentId : existing.parentId,
			sortOrder: parsed.sortOrder ?? existing.sortOrder,
			isActive: preservedIsActive,
			updatedAt: new Date()
		})
		.where(eq(categories.id, parsed.id))
		.returning();

	const row = updated[0];
	await writeAuditLog({
		actorUserId,
		action: 'category.update',
		entityType: 'category',
		entityId: row.id,
		summary: { name: row.name, slug: row.slug, isActive: row.isActive }
	});

	return row;
}

/**
 * Deletes a category ONLY when no non-deleted post references it (Section 7.6 & 13).
 * Prevents silently stripping categories from scheduled or published posts.
 */
export async function deleteCategory(id: number, actorUserId?: string | null) {
	const db = await ensureDbReady();
	const existing = await getCategoryById(id);
	if (!existing) {
		throw new Error('CATEGORY_NOT_FOUND: Category does not exist.');
	}

	const pivotPostIds = db
		.select({ postId: postCategories.postId })
		.from(postCategories)
		.where(eq(postCategories.categoryId, id));

	const referencingPosts = await db
		.select({ id: posts.id, title: posts.title, status: posts.status })
		.from(posts)
		.where(
			and(
				isNull(posts.deletedAt),
				or(eq(posts.categoryId, id), sql`${posts.id} IN (${pivotPostIds})`)
			)
		);

	if (referencingPosts.length > 0) {
		throw new Error(
			`CATEGORY_IN_USE: Cannot delete category "${existing.name}" because it is assigned to ${referencingPosts.length} active post(s).`
		);
	}

	await db.delete(categories).where(eq(categories.id, id));
	await writeAuditLog({
		actorUserId,
		action: 'category.delete',
		entityType: 'category',
		entityId: id,
		summary: { name: existing.name, slug: existing.slug }
	});

	return { deleted: true, id };
}

export async function listPublicCategoriesWithCounts() {
	const db = await ensureDbReady();
	const now = new Date();
	const activeCats = await db
		.select()
		.from(categories)
		.where(eq(categories.isActive, true))
		.orderBy(asc(categories.sortOrder), asc(categories.name));

	const publicPostRows = await db
		.select({
			id: posts.id,
			categoryId: posts.categoryId
		})
		.from(posts)
		.where(publicIndexablePostPredicate(now));

	const publicPostIds = new Set(publicPostRows.map((p) => p.id));
	const pivotRows = publicPostIds.size > 0 ? await db.select().from(postCategories) : [];

	const countByCat = new Map<number, Set<number>>();
	for (const p of publicPostRows) {
		if (p.categoryId) {
			const set = countByCat.get(p.categoryId) ?? new Set<number>();
			set.add(p.id);
			countByCat.set(p.categoryId, set);
		}
	}
	for (const piv of pivotRows) {
		if (publicPostIds.has(piv.postId)) {
			const set = countByCat.get(piv.categoryId) ?? new Set<number>();
			set.add(piv.postId);
			countByCat.set(piv.categoryId, set);
		}
	}

	return activeCats.map((cat) => {
		const postCount = countByCat.get(cat.id)?.size ?? 0;
		return {
			...cat,
			postCount,
			isIndexable: isCategoryIndexable(postCount)
		};
	});
}
