import { and, asc, eq, isNull, ne } from 'drizzle-orm';
import {
	authorCreateSchema,
	authorUpdateSchema,
	type AuthorCreateInput,
	type AuthorUpdateInput
} from '../../shared/schemas/authors';
import { replaceEmEnDashesInPlainText } from '../../shared/seo/content-transform';
import { writeAuditLog } from '../audit';
import { ensureDbReady } from '../db';
import { authors, posts } from '../db/schema';

export async function listAuthors() {
	const db = await ensureDbReady();
	return db.select().from(authors).orderBy(asc(authors.name));
}

export async function getAuthorById(id: number) {
	const db = await ensureDbReady();
	const rows = await db.select().from(authors).where(eq(authors.id, id)).limit(1);
	return rows[0] ?? null;
}

export async function createAuthor(rawInput: AuthorCreateInput, actorUserId?: string | null) {
	const parsed = authorCreateSchema.parse(rawInput);
	const db = await ensureDbReady();

	const targetSlug = parsed.slug.trim().toLowerCase();
	const dup = await db
		.select({ id: authors.id })
		.from(authors)
		.where(eq(authors.slug, targetSlug))
		.limit(1);

	if (dup.length > 0) {
		throw new Error(`DUPLICATE_SLUG: Author slug "${targetSlug}" already exists.`);
	}

	const now = new Date();
	const inserted = await db
		.insert(authors)
		.values({
			name: replaceEmEnDashesInPlainText(parsed.name),
			slug: targetSlug,
			email: parsed.email || null,
			bio: parsed.bio ? replaceEmEnDashesInPlainText(parsed.bio) : null,
			shortBio: parsed.shortBio ? replaceEmEnDashesInPlainText(parsed.shortBio) : null,
			jobTitle: parsed.jobTitle ? replaceEmEnDashesInPlainText(parsed.jobTitle) : null,
			company: parsed.company ? replaceEmEnDashesInPlainText(parsed.company) : null,
			credentials: parsed.credentials ? replaceEmEnDashesInPlainText(parsed.credentials) : null,
			expertise: parsed.expertise ? replaceEmEnDashesInPlainText(parsed.expertise) : null,
			yearsExperience: parsed.yearsExperience ?? null,
			linkedin: parsed.linkedin || null,
			twitter: parsed.twitter || null,
			website: parsed.website || null,
			avatar: parsed.avatar || null,
			avatarAlt: parsed.avatarAlt ? replaceEmEnDashesInPlainText(parsed.avatarAlt) : null,
			isActive: parsed.isActive ?? true,
			createdAt: now,
			updatedAt: now
		})
		.returning();

	const row = inserted[0];
	await writeAuditLog({
		actorUserId,
		action: 'author.create',
		entityType: 'author',
		entityId: row.id,
		summary: { name: row.name, slug: row.slug }
	});

	return row;
}

export async function updateAuthor(rawInput: AuthorUpdateInput, actorUserId?: string | null) {
	const parsed = authorUpdateSchema.parse(rawInput);
	const db = await ensureDbReady();

	const existing = await getAuthorById(parsed.id);
	if (!existing) {
		throw new Error('AUTHOR_NOT_FOUND: Author does not exist.');
	}

	const targetSlug = parsed.slug.trim().toLowerCase();
	const dup = await db
		.select({ id: authors.id })
		.from(authors)
		.where(and(eq(authors.slug, targetSlug), ne(authors.id, parsed.id)))
		.limit(1);

	if (dup.length > 0) {
		throw new Error(`DUPLICATE_SLUG: Author slug "${targetSlug}" already exists.`);
	}

	// Preserve `is_active` when omitted (Section 8.8)
	const preservedIsActive = parsed.isActive !== undefined ? parsed.isActive : existing.isActive;

	const updated = await db
		.update(authors)
		.set({
			name: replaceEmEnDashesInPlainText(parsed.name),
			slug: targetSlug,
			email: parsed.email !== undefined ? parsed.email || null : existing.email,
			bio:
				parsed.bio !== undefined
					? parsed.bio
						? replaceEmEnDashesInPlainText(parsed.bio)
						: null
					: existing.bio,
			shortBio:
				parsed.shortBio !== undefined
					? parsed.shortBio
						? replaceEmEnDashesInPlainText(parsed.shortBio)
						: null
					: existing.shortBio,
			jobTitle:
				parsed.jobTitle !== undefined
					? parsed.jobTitle
						? replaceEmEnDashesInPlainText(parsed.jobTitle)
						: null
					: existing.jobTitle,
			company:
				parsed.company !== undefined
					? parsed.company
						? replaceEmEnDashesInPlainText(parsed.company)
						: null
					: existing.company,
			credentials:
				parsed.credentials !== undefined
					? parsed.credentials
						? replaceEmEnDashesInPlainText(parsed.credentials)
						: null
					: existing.credentials,
			expertise:
				parsed.expertise !== undefined
					? parsed.expertise
						? replaceEmEnDashesInPlainText(parsed.expertise)
						: null
					: existing.expertise,
			yearsExperience:
				parsed.yearsExperience !== undefined ? parsed.yearsExperience : existing.yearsExperience,
			linkedin: parsed.linkedin !== undefined ? parsed.linkedin || null : existing.linkedin,
			twitter: parsed.twitter !== undefined ? parsed.twitter || null : existing.twitter,
			website: parsed.website !== undefined ? parsed.website || null : existing.website,
			avatar: parsed.avatar !== undefined ? parsed.avatar || null : existing.avatar,
			avatarAlt:
				parsed.avatarAlt !== undefined
					? parsed.avatarAlt
						? replaceEmEnDashesInPlainText(parsed.avatarAlt)
						: null
					: existing.avatarAlt,
			isActive: preservedIsActive,
			updatedAt: new Date()
		})
		.where(eq(authors.id, parsed.id))
		.returning();

	const row = updated[0];
	await writeAuditLog({
		actorUserId,
		action: 'author.update',
		entityType: 'author',
		entityId: row.id,
		summary: { name: row.name, slug: row.slug, isActive: row.isActive }
	});

	return row;
}

export async function deleteAuthor(id: number, actorUserId?: string | null) {
	const db = await ensureDbReady();
	const existing = await getAuthorById(id);
	if (!existing) {
		throw new Error('AUTHOR_NOT_FOUND: Author does not exist.');
	}

	const referencing = await db
		.select({ id: posts.id })
		.from(posts)
		.where(and(eq(posts.authorId, id), isNull(posts.deletedAt)));

	if (referencing.length > 0) {
		throw new Error(
			`AUTHOR_IN_USE: Cannot delete author "${existing.name}" because they are assigned to ${referencing.length} active post(s).`
		);
	}

	await db.delete(authors).where(eq(authors.id, id));
	await writeAuditLog({
		actorUserId,
		action: 'author.delete',
		entityType: 'author',
		entityId: id,
		summary: { name: existing.name, slug: existing.slug }
	});

	return { deleted: true, id };
}
