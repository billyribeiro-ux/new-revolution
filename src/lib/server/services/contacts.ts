import { db } from '#lib/server/db/index.js';
import { contactSubmissions } from '#lib/server/db/schema.js';
import { NotFoundError } from '#lib/server/service-errors.js';
import { backgroundTask } from '#lib/server/background.js';
import { notifyNewContact } from '#lib/server/services/notifications.js';
import { desc, eq, sql, and, gte } from 'drizzle-orm';

/** Create a new contact submission */
export async function createContactSubmission(data: {
	name: string;
	email: string;
	phone?: string | undefined;
	company?: string | undefined;
	message: string;
}) {
	const result = await db
		.insert(contactSubmissions)
		.values({
			name: data.name,
			email: data.email,
			phone: data.phone ?? null,
			company: data.company ?? null,
			message: data.message,
			status: 'unread',
			createdAt: new Date()
		})
		.returning();
	const submission = result[0];
	if (!submission) throw new Error('Failed to create contact submission');
	// waitUntil, not a bare promise: see createLead.
	backgroundTask(`notifications:new-contact:${submission.id}`, notifyNewContact(submission));
	return submission;
}

/** List contact submissions with optional filters */
export async function listAllContacts(filters?: {
	status?: string | undefined;
	limit?: number | undefined;
	offset?: number | undefined;
}) {
	const limit = filters?.limit ?? 50;
	const offset = filters?.offset ?? 0;

	const conditions = [];
	if (filters?.status) {
		conditions.push(eq(contactSubmissions.status, filters.status));
	}

	const query = db
		.select()
		.from(contactSubmissions)
		.orderBy(desc(contactSubmissions.createdAt))
		.limit(limit)
		.offset(offset);

	if (conditions.length > 0) {
		return await query.where(and(...conditions));
	}
	return await query;
}

/**
 * One contact submission by id. Notification deep links
 * (`/admin/inbox?contact=`) can name a message beyond the inbox's capped
 * list; `null` means it was deleted.
 */
export async function getContactById(id: number) {
	const result = await db
		.select()
		.from(contactSubmissions)
		.where(eq(contactSubmissions.id, id))
		.limit(1);
	return result[0] ?? null;
}

/** Get unread contact count */
export async function getUnreadContactCount() {
	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(contactSubmissions)
		.where(eq(contactSubmissions.status, 'unread'));
	// neon-http returns count(*) (int8) as a string; sql<number> is a cast,
	// not a parser, so coerce at the boundary.
	return Number(result[0]?.count ?? 0);
}

/**
 * True totals for the inbox header in ONE query: every message ever
 * recorded plus how many are still unread. The inbox list itself is
 * capped (default 50 rows), so header counts derived from the fetched
 * rows under-report once the table outgrows the cap (audit 2026-06-11).
 */
export async function getContactCounts() {
	const result = await db
		.select({
			total: sql<number>`count(*)::int`,
			unread: sql<number>`count(*) FILTER (WHERE ${contactSubmissions.status} = 'unread')::int`
		})
		.from(contactSubmissions);
	return {
		total: Number(result[0]?.total ?? 0),
		unread: Number(result[0]?.unread ?? 0)
	};
}

/** Get total contacts count */
export async function getContactsCount(since?: Date) {
	const conditions = [];
	if (since) {
		conditions.push(gte(contactSubmissions.createdAt, since));
	}
	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(contactSubmissions)
		.where(conditions.length > 0 ? and(...conditions) : undefined);
	// Same neon-http string-aggregate coercion as above.
	return Number(result[0]?.count ?? 0);
}

/** Mark a contact as read */
export async function markContactAsRead(id: number) {
	const result = await db
		.update(contactSubmissions)
		.set({
			// A delayed read request must not undo an archive committed first.
			status: sql`CASE WHEN ${contactSubmissions.status} = 'unread' THEN 'read' ELSE ${contactSubmissions.status} END`,
			readAt: sql`CASE WHEN ${contactSubmissions.status} = 'unread' THEN ${new Date().toISOString()}::timestamp ELSE ${contactSubmissions.readAt} END`
		})
		.where(eq(contactSubmissions.id, id))
		.returning();
	if (!result[0]) throw new NotFoundError('Contact submission not found');
	return result[0];
}

/** Archive a contact */
export async function archiveContact(id: number) {
	const result = await db
		.update(contactSubmissions)
		.set({
			status: 'archived'
		})
		.where(eq(contactSubmissions.id, id))
		.returning();
	if (!result[0]) throw new NotFoundError('Contact submission not found');
	return result[0];
}

/** Delete a contact submission */
export async function deleteContactSubmission(id: number) {
	await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
	return { success: true };
}
