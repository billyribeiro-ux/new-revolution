/**
 * Scheduled-calls service.
 *
 * Booking happens in the Calendly popup; the Calendly webhook
 * (invitee.created / invitee.canceled) calls into here to keep a first-party
 * record so the admin has name/email/date/time without leaving the CMS.
 *
 * Idempotency: every upsert is keyed on Calendly's `calendly_event_uri` unique
 * index — Calendly redelivers webhooks on retry, so a replay updates the same
 * row instead of inserting a duplicate.
 */
import { db } from '#lib/server/db/index.js';
import { scheduledCalls } from '#lib/server/db/schema.js';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { logger } from '#lib/server/logger.js';

export type UpsertCallInput = {
	calendlyEventUri: string;
	name?: string | null;
	email: string;
	scheduledAt: Date;
	endAt?: Date | null;
	inviteeUri?: string | null;
	payload?: Record<string, unknown> | null;
};

/**
 * Insert or update a scheduled call from an invitee.created event. Idempotent
 * on calendly_event_uri. Returns the row id and whether it was a NEW booking
 * (so the caller fires the "new booking" notification only on first insert,
 * not on Calendly's webhook retries).
 *
 * Postgres surfaces insert-vs-update via the system column `xmax`: it is 0 for
 * a freshly inserted row and non-zero for a row touched by ON CONFLICT UPDATE.
 * That gives us a precise isNew in a single round-trip.
 */
export async function upsertScheduledCall(
	data: UpsertCallInput
): Promise<{ id: number; isNew: boolean }> {
	const rows = await db
		.insert(scheduledCalls)
		.values({
			calendlyEventUri: data.calendlyEventUri,
			name: data.name ?? null,
			email: data.email.trim().toLowerCase(),
			scheduledAt: data.scheduledAt,
			endAt: data.endAt ?? null,
			status: 'scheduled',
			inviteeUri: data.inviteeUri ?? null,
			payloadJson: data.payload ?? null
		})
		.onConflictDoUpdate({
			target: scheduledCalls.calendlyEventUri,
			set: {
				name: data.name ?? null,
				email: data.email.trim().toLowerCase(),
				scheduledAt: data.scheduledAt,
				endAt: data.endAt ?? null,
				inviteeUri: data.inviteeUri ?? null,
				payloadJson: data.payload ?? null,
				// Re-activate if a previously-canceled slot is re-booked.
				status: 'scheduled',
				updatedAt: new Date()
			}
		})
		.returning({ id: scheduledCalls.id, isNew: sql<boolean>`(xmax = 0)` });

	const row = rows[0];
	if (!row) return { id: 0, isNew: false };
	return { id: row.id, isNew: row.isNew };
}

/** Mark a call canceled from an invitee.canceled event. Idempotent. */
export async function cancelScheduledCall(calendlyEventUri: string): Promise<void> {
	await db
		.update(scheduledCalls)
		.set({ status: 'canceled', updatedAt: new Date() })
		.where(eq(scheduledCalls.calendlyEventUri, calendlyEventUri));
}

/**
 * Admin list with optional status + search filters.
 *
 * Returns the (possibly capped) page of rows PLUS the true total under
 * the SAME filters, so the UI can say "N calls, showing first M" instead
 * of silently reporting the 250-row cap as the population (audit
 * 2026-06-11). The count is cast ::int so neon-http returns a JS number.
 */
export async function listScheduledCalls(filters?: {
	status?: 'scheduled' | 'canceled' | 'completed' | undefined;
	search?: string | undefined;
	limit?: number | undefined;
	offset?: number | undefined;
}) {
	const limit = filters?.limit ?? 250;
	const offset = filters?.offset ?? 0;
	const conditions = [];
	if (filters?.status) conditions.push(eq(scheduledCalls.status, filters.status));
	if (filters?.search?.trim()) {
		const q = `%${filters.search.trim()}%`;
		conditions.push(or(ilike(scheduledCalls.email, q), ilike(scheduledCalls.name, q)));
	}
	const where = conditions.length ? and(...conditions) : undefined;
	const [calls, totalRows] = await Promise.all([
		db
			.select()
			.from(scheduledCalls)
			.where(where)
			.orderBy(desc(scheduledCalls.scheduledAt))
			.limit(limit)
			.offset(offset),
		db
			.select({ count: sql<number>`count(*)::int` })
			.from(scheduledCalls)
			.where(where)
	]);
	return { calls, total: Number(totalRows[0]?.count ?? 0) };
}

/** Count of upcoming scheduled calls (status='scheduled', in the future). */
export async function getUpcomingCallsCount(now = new Date()): Promise<number> {
	const rows = await db
		.select({ n: sql<number>`count(*)::int` })
		.from(scheduledCalls)
		.where(
			and(eq(scheduledCalls.status, 'scheduled'), sql`${scheduledCalls.scheduledAt} >= ${now}`)
		);
	return rows[0]?.n ?? 0;
}

function csvCell(val: unknown): string {
	const raw = String(val ?? '').replace(/"/g, '""');
	return /^[=+\-@\t\r]/.test(raw) ? `"'${raw}"` : `"${raw}"`;
}

/** Export scheduled calls as CSV (name, email, date/time, status). */
export async function exportCallsCsv(): Promise<string> {
	const { calls: rows } = await listScheduledCalls({ limit: 10_000, offset: 0 });
	const header = 'Name,Email,Scheduled,Status\n';
	const body = rows
		.map((r) =>
			[
				csvCell(r.name ?? ''),
				csvCell(r.email),
				csvCell(r.scheduledAt?.toISOString() ?? ''),
				csvCell(r.status)
			].join(',')
		)
		.join('\n');
	return header + body;
}

/** Fire-and-forget admin notification for a new booking. */
export async function notifyNewCall(call: {
	id: number;
	name: string | null;
	email: string;
	scheduledAt: Date;
}): Promise<void> {
	const { upsertAdminNotification } = await import('./notifications');
	const who = call.name?.trim() || call.email;
	await upsertAdminNotification({
		type: 'lead',
		severity: 'success',
		title: 'New call booked',
		body: `${who} booked a call for ${call.scheduledAt.toLocaleString('en-US')}.`,
		targetHref: `/admin/calls`,
		sourceTable: 'scheduled_calls',
		sourceId: call.id,
		dedupeKey: `call:${call.id}:created`,
		metadata: { email: call.email, name: call.name },
		occurredAt: call.scheduledAt
	}).catch((err: unknown) => {
		logger.error({ err, callId: call.id }, '[scheduled-calls] notifyNewCall failed');
	});
}
