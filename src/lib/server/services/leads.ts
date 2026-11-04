/**
 * Lead service.
 *
 * Lifecycle (mirrors posts.ts soft-delete pattern):
 *
 *   created          → deleted_at IS NULL          (active)
 *   moveToTrash      → deleted_at = NOW()          (recoverable)
 *   restore          → deleted_at = NULL           (back to active)
 *   permanentlyDelete → row + email_events removed (gone forever)
 *
 * Default reads (`listAllLeads`, `getLeadStats`, dashboard counts) filter
 * out trashed rows. The Trash tab in the admin uses the dedicated
 * `listTrashedLeads` query.
 *
 * Bulk variants exist for every state transition so the admin UI's
 * select-all-and-delete affordance does ONE round-trip instead of N.
 */
import { db } from '#lib/server/db/index.js';
import { leads, emailEvents } from '#lib/server/db/schema.js';
import { ConflictError, NotFoundError } from '#lib/server/service-errors.js';
import { backgroundTask } from '#lib/server/background.js';
import { notifyNewLead } from '#lib/server/services/notifications.js';
import type { LeadDashboardFiltersInput } from '#lib/shared/schemas/leads.js';
import { desc, eq, sql, and, gte, isNull, isNotNull, inArray } from 'drizzle-orm';
import { pct, trendPct } from './metrics';

/** Create a new lead record (always created with `deleted_at = NULL`). */
export async function createLead(data: {
	email: string;
	name?: string | undefined;
	source?: string | undefined;
	sourcePage?: string | undefined;
	ip?: string | undefined;
	userAgent?: string | undefined;
	resendMessageId?: string | undefined;
}) {
	// One LIVE lead per email address: form retries after a timeout,
	// refresh-resubmits, and the same person using two different forms
	// must not create duplicate rows; every duplicate inflated every lead
	// count, the funnel, and the conversion-rate denominator (audit
	// 2026-06-11). Case-insensitive match; a trashed lead's email may
	// legitimately sign up again. `created` lets callers skip duplicate
	// welcome emails, sequence enrollment, and operator notifications.
	const email = data.email.trim().toLowerCase();
	// Capture and restore share the same transaction-scoped email lock. The
	// unique index remains the invariant; the lock makes conflict reporting
	// deterministic when a new signup races an admin restoring an older row.
	const [, result, existing] = await db.batch([
		db.execute(sql`SELECT pg_advisory_xact_lock(740361, hashtext(${email}))`),
		db
			.insert(leads)
			.values({
				email,
				name: data.name ?? null,
				source: data.source ?? 'lead_form',
				sourcePage: data.sourcePage ?? null,
				status: 'new',
				ip: data.ip ?? null,
				userAgent: data.userAgent ?? null,
				resendMessageId: data.resendMessageId ?? null,
				createdAt: new Date()
			})
			.onConflictDoNothing()
			.returning(),
		db
			.select()
			.from(leads)
			.where(and(sql`lower(${leads.email}) = ${email}`, isNull(leads.deletedAt)))
			.limit(1)
	]);
	const lead = result[0];
	if (!lead) {
		if (!existing[0]) throw new Error('Failed to create lead');
		return { lead: existing[0], created: false as const };
	}
	// waitUntil, not a bare promise: the capture response must not wait on
	// the bell, but a frozen serverless instance must not drop it either.
	backgroundTask(`notifications:new-lead:${lead.id}`, notifyNewLead(lead));
	return { lead, created: true as const };
}

/**
 * List ACTIVE leads (deleted_at IS NULL) for the admin grid.
 *
 * Trashed rows are excluded — the Trash view uses `listTrashedLeads`.
 * `status` filter, when provided, layers on top of the trash filter.
 */
export async function listAllLeads(filters?: {
	status?: string | undefined;
	limit?: number | undefined;
	offset?: number | undefined;
}) {
	const limit = filters?.limit ?? 50;
	const offset = filters?.offset ?? 0;

	const conditions = [isNull(leads.deletedAt)];
	if (filters?.status) {
		conditions.push(eq(leads.status, filters.status));
	}

	return await db
		.select()
		.from(leads)
		.where(and(...conditions))
		.orderBy(desc(leads.createdAt))
		.limit(limit)
		.offset(offset);
}

/** List trashed leads (deleted_at IS NOT NULL) for the recovery workflow. */
export async function listTrashedLeads() {
	return await db
		.select()
		.from(leads)
		.where(isNotNull(leads.deletedAt))
		.orderBy(desc(leads.deletedAt));
}

/**
 * One lead by id, trashed or not. Notification deep links (`/admin/leads?lead=`)
 * name a lead that may since have been trashed or fall outside the list the
 * page is showing; the page uses this to say which. `null` means the row was
 * permanently deleted.
 */
export async function getLeadById(id: number) {
	const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
	return result[0] ?? null;
}

/** Get total ACTIVE leads count. Optional `since` window. */
export async function getLeadsCount(since?: Date) {
	const conditions = [isNull(leads.deletedAt)];
	if (since) conditions.push(gte(leads.createdAt, since));
	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(leads)
		.where(and(...conditions));
	return Number(result[0]?.count ?? 0);
}

/** Get the count of trashed leads (used by the Trash tab badge). */
export async function getTrashedLeadsCount() {
	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(leads)
		.where(isNotNull(leads.deletedAt));
	return Number(result[0]?.count ?? 0);
}

/** Update a lead's status. Refuses to touch trashed rows. */
export async function updateLeadStatus(id: number, status: string) {
	const result = await db
		.update(leads)
		.set({ status })
		.where(and(eq(leads.id, id), isNull(leads.deletedAt)))
		.returning();
	if (!result[0]) throw new NotFoundError('Lead not found or in trash');
	return result[0];
}

/** Update a lead's Resend message ID (after email is sent). */
export async function updateLeadMessageId(id: number, messageId: string) {
	await db
		.update(leads)
		.set({ resendMessageId: messageId, emailSentAt: new Date() })
		.where(eq(leads.id, id));
}

/** Finish the first welcome and enrollment atomically, including retry recovery. */
export async function completeLeadWelcome(id: number, messageId: string): Promise<void> {
	// New completions persist acceptance and enrollment in this same batch.
	// An existing provider ID without completion is therefore a legacy welcome,
	// including an old invocation that accepted after the migration backfill.
	await db.batch([
		db.select({ id: leads.id }).from(leads).where(eq(leads.id, id)).for('update'),
		db.execute(sql`
			INSERT INTO email_enrollments (lead_id, sequence_id, current_step, status, next_send_at)
			SELECT l.id, s.id, first_step.step_index, 'active', clock_timestamp() + first_step.delay_days * interval '1 day'
			FROM leads l CROSS JOIN email_sequences s
			JOIN LATERAL (
				SELECT step_index, delay_days FROM email_sequence_steps
				WHERE sequence_id = s.id AND is_active = true ORDER BY step_index LIMIT 1
			) first_step ON true
			WHERE l.id = ${id} AND l.deleted_at IS NULL AND l.welcome_completed_at IS NULL
				AND l.resend_message_id IS NULL
				AND s.trigger_source = 'lead_magnet' AND s.is_active = true
				AND NOT EXISTS (SELECT 1 FROM email_suppressions WHERE email = lower(l.email))
			ON CONFLICT (lead_id, sequence_id) DO NOTHING
		`),
		db
			.update(leads)
			.set({
				resendMessageId: messageId,
				emailSentAt: new Date(),
				welcomeCompletedAt: sql`coalesce(${leads.welcomeCompletedAt},
					CASE WHEN ${leads.resendMessageId} IS NOT NULL THEN ${leads.createdAt} END,
					clock_timestamp())`
			})
			.where(and(eq(leads.id, id), isNull(leads.deletedAt)))
	]);
}

// ─── Trash flow ─────────────────────────────────────────────────────────

/**
 * Move a lead to Trash (soft delete). Idempotent — re-stamps `deleted_at`
 * if already trashed, which is harmless and avoids a "row not found"
 * error for repeated clicks.
 */
export async function softDeleteLead(id: number) {
	const updated = await db
		.update(leads)
		.set({ deletedAt: new Date() })
		.where(eq(leads.id, id))
		.returning({ id: leads.id });
	if (updated.length === 0) throw new NotFoundError(`Lead ${id} not found`);
	return { success: true };
}

/**
 * Bulk move to Trash. Used by the "Trash selected" button in the admin
 * grid. Returns the number of rows actually transitioned (excludes
 * unknown ids; same-trip idempotency).
 */
export async function softDeleteLeads(ids: number[]) {
	if (ids.length === 0) return { trashed: 0 };
	const updated = await db
		.update(leads)
		.set({ deletedAt: new Date() })
		.where(inArray(leads.id, ids))
		.returning({ id: leads.id });
	return { trashed: updated.length };
}

/** Restore a single lead from Trash. */
export async function restoreLead(
	id: number
): Promise<{ success: true } | { success: false; conflict: 'active_email_exists' }> {
	const rows = await restoreLeadRows([id]);
	const row = rows[0];
	if (!row) throw new NotFoundError(`Lead ${id} not found`);
	return row.status === 'conflict'
		? { success: false, conflict: 'active_email_exists' }
		: { success: true };
}

/** Bulk restore keeps conflicts in Trash and reports only actual transitions. */
export async function restoreLeads(ids: number[]) {
	const rows = ids.length ? await restoreLeadRows(ids) : [];
	const restoredIds = rows.filter((row) => row.status === 'restored').map((row) => row.id);
	const conflictedIds = rows.filter((row) => row.status === 'conflict').map((row) => row.id);
	return { restored: restoredIds.length, restoredIds, conflictedIds };
}

async function restoreLeadRows(
	ids: number[]
): Promise<{ id: number; status: 'restored' | 'already_active' | 'conflict' }[]> {
	const [, result] = await db.batch([
		// Acquire distinct lock keys in the same order for every bulk request,
		// including hash collisions. Email itself is immutable in lead updates.
		db.execute(sql`
			SELECT pg_advisory_xact_lock(740361, lock_key)
			FROM (
				SELECT DISTINCT hashtext(lower(email)) AS lock_key
				FROM leads WHERE id = ANY(${sql.param(ids)}::integer[]) ORDER BY lock_key
			) email_locks
		`),
		db.execute(sql`
			WITH eligible AS (
				SELECT DISTINCT ON (lower(candidate.email)) candidate.id
				FROM leads candidate
				WHERE candidate.id = ANY(${sql.param(ids)}::integer[]) AND candidate.deleted_at IS NOT NULL
					AND NOT EXISTS (
						SELECT 1 FROM leads active
						WHERE active.deleted_at IS NULL AND lower(active.email) = lower(candidate.email)
					)
				ORDER BY lower(candidate.email), candidate.id
			), restored AS (
				UPDATE leads SET deleted_at = NULL
				WHERE id IN (SELECT id FROM eligible) AND deleted_at IS NOT NULL
				RETURNING id
			)
			SELECT candidate.id,
				CASE WHEN restored.id IS NOT NULL THEN 'restored'
					WHEN candidate.deleted_at IS NULL THEN 'already_active'
					ELSE 'conflict' END AS status
			FROM leads candidate LEFT JOIN restored ON restored.id = candidate.id
			WHERE candidate.id = ANY(${sql.param(ids)}::integer[]) ORDER BY candidate.id
		`)
	]);
	return result.rows as { id: number; status: 'restored' | 'already_active' | 'conflict' }[];
}

/**
 * Delete trashed leads (one id, or all of Trash when `id` is null) in ONE
 * statement, returning the ids actually removed.
 *
 * `email_events.lead_id` and `user_journeys.lead_id` are `ON DELETE no action`
 * (drizzle/0000_*.sql:337 for user_journeys), so those rows must go with the
 * lead; `email_enrollments` cascades on its own. Without the journeys delete a
 * single user_journeys row made Delete forever and Empty Trash fail on the FK.
 * The trash check, the lock and every delete share one statement: `target`
 * locks only rows still in Trash (a Restore that committed first is re-checked
 * and skipped; one that arrives later waits for us), and child rows are
 * removed only for those locked rows. A SELECT-then-DELETE sequence used to
 * strip a concurrently restored lead's events and then delete the lead anyway.
 * The NO ACTION FKs are checked at end of statement, after all deletes.
 */
async function deleteTrashedLeads(id: number | null): Promise<number[]> {
	const result = await db.execute<{ id: number }>(sql`
		WITH target AS (
			SELECT id FROM leads
			WHERE deleted_at IS NOT NULL ${id === null ? sql`` : sql`AND id = ${id}`}
			FOR UPDATE
		), events AS (
			DELETE FROM email_events WHERE lead_id IN (SELECT id FROM target)
		), journeys AS (
			DELETE FROM user_journeys WHERE lead_id IN (SELECT id FROM target)
		)
		DELETE FROM leads
		WHERE id IN (SELECT id FROM target) AND deleted_at IS NOT NULL
		RETURNING id
	`);
	return result.rows.map((row) => Number(row.id));
}

/**
 * Permanently delete a single lead. Refuses to run unless the lead is
 * currently in Trash: guards against an admin click destroying an
 * active lead by mistake (the UI never offers permanent-delete on the
 * active grid; this is the server-side enforcement of that contract).
 * Also removes its `email_events` and `user_journeys` (see deleteTrashedLeads).
 */
export async function permanentlyDeleteLead(id: number) {
	const deleted = await deleteTrashedLeads(id);
	if (deleted.length === 0)
		throw new ConflictError('Lead must be in trash before permanent deletion');
	return { success: true };
}

/**
 * Permanently delete EVERY lead currently in Trash, plus their related
 * `email_events` and `user_journeys`. The "Empty Trash" button on the Trash tab. `deleted`
 * counts the rows actually removed; a lead restored mid-sweep is kept
 * with its events.
 */
export async function permanentlyDeleteAllTrashedLeads() {
	return { deleted: (await deleteTrashedLeads(null)).length };
}

// ─── Stats / export ─────────────────────────────────────────────────────

/**
 * Single source of truth for "this lead exists for counting purposes":
 * trashed (soft-deleted) leads are invisible to EVERY metric, on every
 * surface. The 2026-06-11 forensic audit found /admin and email
 * analytics counting trashed leads while /admin/leads excluded them, so
 * the same window showed different numbers per screen. Interpolate this
 * fragment in drizzle .where() and raw sql templates alike (it renders
 * the fully qualified column, so it works wherever the leads table is
 * not aliased). `isCountableLead` is the pure, unit-tested mirror; the
 * two MUST stay semantically identical.
 */
export const countableLeadsSql = sql`${leads.deletedAt} IS NULL`;

/** Pure mirror of {@link countableLeadsSql} (see posts.visibility pattern). */
export function isCountableLead(lead: { deletedAt: Date | null }): boolean {
	return lead.deletedAt === null;
}

/**
 * Get lead stats for the dashboard. Counts EXCLUDE trashed leads — the
 * dashboard reflects "real" leads, not deleted ones. By-status grouping
 * is also alive-only.
 */
export async function getLeadStats() {
	const now = new Date();
	const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
	const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

	const aliveOnly = isNull(leads.deletedAt);

	const [total, last30d, last7d, byStatus] = await Promise.all([
		db
			.select({ count: sql<number>`count(*)` })
			.from(leads)
			.where(aliveOnly),
		db
			.select({ count: sql<number>`count(*)` })
			.from(leads)
			.where(and(aliveOnly, gte(leads.createdAt, thirtyDaysAgo))),
		db
			.select({ count: sql<number>`count(*)` })
			.from(leads)
			.where(and(aliveOnly, gte(leads.createdAt, sevenDaysAgo))),
		db
			.select({
				status: leads.status,
				count: sql<number>`count(*)`
			})
			.from(leads)
			.where(aliveOnly)
			.groupBy(leads.status)
	]);

	return {
		total: Number(total[0]?.count ?? 0),
		last30d: Number(last30d[0]?.count ?? 0),
		last7d: Number(last7d[0]?.count ?? 0),
		// neon-http returns count(*) (int8) as a string; sql<number> is a
		// cast, not a parser. Coerce per group like the totals above.
		byStatus: byStatus.map((row) => ({
			status: row.status,
			count: Number(row.count ?? 0)
		}))
	};
}

/** Email-event aggregate stats (open/click rates). Trash-blind — these
 * roll up the lifetime of the events table itself, not lead state. */
export async function getEmailEventStats() {
	const [delivered, opened, clicked] = await Promise.all([
		db
			.select({ count: sql<number>`count(*)` })
			.from(emailEvents)
			.where(eq(emailEvents.event, 'delivered')),
		db
			.select({ count: sql<number>`count(*)` })
			.from(emailEvents)
			.where(eq(emailEvents.event, 'opened')),
		db
			.select({ count: sql<number>`count(*)` })
			.from(emailEvents)
			.where(eq(emailEvents.event, 'clicked'))
	]);

	const deliveredCount = Number(delivered[0]?.count ?? 0);
	const openedCount = Number(opened[0]?.count ?? 0);
	const clickedCount = Number(clicked[0]?.count ?? 0);

	return {
		delivered: deliveredCount,
		opened: openedCount,
		clicked: clickedCount,
		openRate: deliveredCount > 0 ? Math.round((openedCount / deliveredCount) * 100) : 0,
		clickRate: deliveredCount > 0 ? Math.round((clickedCount / deliveredCount) * 100) : 0
	};
}

type LeadEngagementState =
	| 'no_email'
	| 'sent'
	| 'delivered'
	| 'opened'
	| 'clicked'
	| 'bounced'
	| 'complained';

export type LeadDashboardRow = {
	id: number;
	email: string;
	name: string | null;
	source: string | null;
	sourcePage: string | null;
	status: string | null;
	ip: string | null;
	userAgent: string | null;
	resendMessageId: string | null;
	createdAt: Date | null;
	deletedAt: Date | null;
	emailEngagement: LeadEngagementState;
	latestEmailEvent: string | null;
	latestEmailEventAt: Date | null;
	deliveredAt: Date | null;
	openedAt: Date | null;
	clickedAt: Date | null;
	bouncedAt: Date | null;
	complainedAt: Date | null;
};

export type LeadDashboardData = {
	overview: {
		total: number;
		totalPrevious: number;
		trend: number | null;
		newLeads: number;
		contactedLeads: number;
		convertedLeads: number;
		unsubscribedLeads: number;
		emailSent: number;
		delivered: number;
		opened: number;
		clicked: number;
		bounced: number;
		complained: number;
		deliveryRate: number;
		openRate: number;
		clickRate: number;
		conversionRate: number;
		windowDays: number;
		lastUpdated: Date;
		source: 'postgres';
	};
	dailyLeads: { date: string; count: number }[];
	sourceBreakdown: {
		source: string;
		count: number;
		converted: number;
		sent: number;
		opened: number;
		clicked: number;
	}[];
	funnel: { label: string; value: number; color: string }[];
	leads: LeadDashboardRow[];
	totalMatching: number;
};

type LeadDashboardSqlRow = {
	total: number;
	total_previous: number;
	new_count: number;
	contacted_count: number;
	converted_count: number;
	unsubscribed_count: number;
	email_sent: number;
	delivered_count: number;
	opened_count: number;
	clicked_count: number;
	bounced_count: number;
	complained_count: number;
	daily_leads: unknown;
	source_breakdown: unknown;
	rows: unknown;
};

type LeadDashboardJsonRow = Omit<
	LeadDashboardRow,
	| 'createdAt'
	| 'deletedAt'
	| 'latestEmailEventAt'
	| 'deliveredAt'
	| 'openedAt'
	| 'clickedAt'
	| 'bouncedAt'
	| 'complainedAt'
> & {
	createdAt: string | null;
	deletedAt: string | null;
	latestEmailEventAt: string | null;
	deliveredAt: string | null;
	openedAt: string | null;
	clickedAt: string | null;
	bouncedAt: string | null;
	complainedAt: string | null;
};

function rowsFromResult<T>(result: unknown): T[] {
	if (Array.isArray(result)) return result as T[];
	return ((result as { rows?: T[] }).rows ?? []) as T[];
}

function arrayFromJson<T>(value: unknown): T[] {
	if (Array.isArray(value)) return value as T[];
	if (typeof value !== 'string') return [];
	try {
		const parsed = JSON.parse(value);
		return Array.isArray(parsed) ? (parsed as T[]) : [];
	} catch {
		return [];
	}
}

function num(value: unknown): number {
	return Number(value ?? 0);
}

function parseDateFilter(value: string | undefined, endOfDay: boolean): Date | undefined {
	if (!value) return undefined;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return undefined;
	if (endOfDay && !value.includes('T')) date.setHours(23, 59, 59, 999);
	return date;
}

function dateOrNull(value: string | Date | null): Date | null {
	if (!value) return null;
	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

export async function getLeadsDashboardData(
	filters: Partial<LeadDashboardFiltersInput> = {}
): Promise<LeadDashboardData> {
	const now = new Date();
	const safeDays = Math.max(7, Math.min(365, Math.trunc(filters.days ?? 30)));
	const limit = Math.max(1, Math.min(1000, Math.trunc(filters.limit ?? 250)));
	const offset = Math.max(0, Math.trunc(filters.offset ?? 0));
	const since = new Date(now.getTime() - safeDays * 24 * 60 * 60 * 1000);
	const previousSince = new Date(now.getTime() - safeDays * 2 * 24 * 60 * 60 * 1000);
	const dateFrom = parseDateFilter(filters.dateFrom, false);
	const dateTo = parseDateFilter(filters.dateTo, true);
	const baseConditions = [sql`l.deleted_at IS NULL`];
	// The Window dropdown (7/30/90/365 days) defines the dashboard's
	// reporting window for EVERYTHING: KPIs, funnel, sources, table. The
	// overview advertises `windowDays`, and the trend compares against the
	// prior window of equal length, which is only meaningful when the
	// current side is windowed too (audit 2026-06-11: this predicate was
	// missing, so the headline was all-time and the trend was wrong).
	// Explicit From/To filters take over the time axis entirely; ANDing
	// both would silently mask the wider range.
	if (!dateFrom && !dateTo) {
		baseConditions.push(sql`l.created_at >= ${since}`);
	}
	const previousConditions = [
		sql`l.deleted_at IS NULL`,
		sql`l.created_at >= ${previousSince}`,
		sql`l.created_at < ${since}`
	];
	const search = filters.search?.trim();
	const source = filters.source?.trim();

	if (filters.status) {
		baseConditions.push(sql`l.status = ${filters.status}`);
		previousConditions.push(sql`l.status = ${filters.status}`);
	}
	if (source) {
		baseConditions.push(sql`coalesce(l.source, '') = ${source}`);
		previousConditions.push(sql`coalesce(l.source, '') = ${source}`);
	}
	if (search) {
		const pattern = `%${search}%`;
		const searchCondition = sql`(
			l.email ILIKE ${pattern}
			OR coalesce(l.name, '') ILIKE ${pattern}
			OR coalesce(l.source, '') ILIKE ${pattern}
			OR coalesce(l.source_page, '') ILIKE ${pattern}
		)`;
		baseConditions.push(searchCondition);
		previousConditions.push(searchCondition);
	}
	if (dateFrom) baseConditions.push(sql`l.created_at >= ${dateFrom}`);
	if (dateTo) baseConditions.push(sql`l.created_at <= ${dateTo}`);

	const where = sql.join(baseConditions, sql` AND `);
	const previousWhere = sql.join(previousConditions, sql` AND `);
	const engagement = filters.engagement ?? 'all';
	const engagementWhere = engagement === 'all' ? sql`TRUE` : sql`email_engagement = ${engagement}`;

	const result = await db.execute<LeadDashboardSqlRow>(sql`
		WITH event_rollup AS (
			SELECT
				ee.lead_id,
				max(ee.created_at) FILTER (WHERE ee.event = 'delivered') AS delivered_at,
				max(ee.created_at) FILTER (WHERE ee.event = 'opened') AS opened_at,
				max(ee.created_at) FILTER (WHERE ee.event = 'clicked') AS clicked_at,
				max(ee.created_at) FILTER (WHERE ee.event = 'bounced') AS bounced_at,
				max(ee.created_at) FILTER (WHERE ee.event = 'complained') AS complained_at,
				(array_agg(ee.event ORDER BY ee.created_at DESC NULLS LAST, ee.id DESC))[1] AS latest_event,
				max(ee.created_at) AS latest_event_at
			FROM ${emailEvents} ee
			WHERE ee.lead_id IS NOT NULL
			GROUP BY ee.lead_id
		),
		scoped AS (
			SELECT
				l.id,
				l.email,
				l.name,
				l.source,
				l.source_page,
				l.status,
				l.ip,
				l.user_agent,
				l.resend_message_id,
				l.created_at,
				l.deleted_at,
				e.delivered_at,
				e.opened_at,
				e.clicked_at,
				e.bounced_at,
				e.complained_at,
				e.latest_event,
				e.latest_event_at,
				CASE
					WHEN e.complained_at IS NOT NULL THEN 'complained'
					WHEN e.bounced_at IS NOT NULL THEN 'bounced'
					WHEN e.clicked_at IS NOT NULL THEN 'clicked'
					WHEN e.opened_at IS NOT NULL THEN 'opened'
					WHEN e.delivered_at IS NOT NULL THEN 'delivered'
					WHEN l.resend_message_id IS NOT NULL THEN 'sent'
					ELSE 'no_email'
				END AS email_engagement
			FROM ${leads} l
			LEFT JOIN event_rollup e ON e.lead_id = l.id
			WHERE ${where}
		),
		filtered AS (
			SELECT *
			FROM scoped
			WHERE ${engagementWhere}
		),
		previous_scoped AS (
			SELECT
				l.id,
				CASE
					WHEN e.complained_at IS NOT NULL THEN 'complained'
					WHEN e.bounced_at IS NOT NULL THEN 'bounced'
					WHEN e.clicked_at IS NOT NULL THEN 'clicked'
					WHEN e.opened_at IS NOT NULL THEN 'opened'
					WHEN e.delivered_at IS NOT NULL THEN 'delivered'
					WHEN l.resend_message_id IS NOT NULL THEN 'sent'
					ELSE 'no_email'
				END AS email_engagement
			FROM ${leads} l
			LEFT JOIN event_rollup e ON e.lead_id = l.id
			WHERE ${previousWhere}
		),
		previous_filtered AS (
			SELECT *
			FROM previous_scoped
			WHERE ${engagementWhere}
		),
		paged AS (
			SELECT *
			FROM filtered
			ORDER BY created_at DESC NULLS LAST, id DESC
			LIMIT ${limit}
			OFFSET ${offset}
		)
		SELECT
			(SELECT count(*)::int FROM filtered) AS total,
			(SELECT count(*)::int FROM previous_filtered) AS total_previous,
			(SELECT count(*)::int FROM filtered WHERE coalesce(status, 'new') = 'new') AS new_count,
			(SELECT count(*)::int FROM filtered WHERE status = 'contacted') AS contacted_count,
			(SELECT count(*)::int FROM filtered WHERE status = 'converted') AS converted_count,
			(SELECT count(*)::int FROM filtered WHERE status = 'unsubscribed') AS unsubscribed_count,
			(SELECT count(*)::int FROM filtered WHERE resend_message_id IS NOT NULL) AS email_sent,
			(SELECT count(*)::int FROM filtered WHERE delivered_at IS NOT NULL) AS delivered_count,
			(SELECT count(*)::int FROM filtered WHERE opened_at IS NOT NULL) AS opened_count,
			(SELECT count(*)::int FROM filtered WHERE clicked_at IS NOT NULL) AS clicked_count,
			(SELECT count(*)::int FROM filtered WHERE bounced_at IS NOT NULL) AS bounced_count,
			(SELECT count(*)::int FROM filtered WHERE complained_at IS NOT NULL) AS complained_count,
			COALESCE((
				SELECT json_agg(row_to_json(d))
				FROM (
					SELECT created_at::date::text AS date, count(*)::int AS count
					FROM filtered
					GROUP BY 1
					ORDER BY 1
				) d
			), '[]'::json) AS daily_leads,
			COALESCE((
				SELECT json_agg(row_to_json(s))
				FROM (
					SELECT
						coalesce(source, 'unknown') AS source,
						count(*)::int AS count,
						count(*) FILTER (WHERE status = 'converted')::int AS converted,
						count(*) FILTER (WHERE resend_message_id IS NOT NULL)::int AS sent,
						count(*) FILTER (WHERE opened_at IS NOT NULL)::int AS opened,
						count(*) FILTER (WHERE clicked_at IS NOT NULL)::int AS clicked
					FROM filtered
					GROUP BY coalesce(source, 'unknown')
					ORDER BY count(*) DESC
					LIMIT 12
				) s
			), '[]'::json) AS source_breakdown,
			COALESCE((
				SELECT json_agg(r.item)
				FROM (
					SELECT json_build_object(
						'id', id,
						'email', email,
						'name', name,
						'source', source,
						'sourcePage', source_page,
						'status', status,
						'ip', ip,
						'userAgent', user_agent,
						'resendMessageId', resend_message_id,
						'createdAt', created_at,
						'deletedAt', deleted_at,
						'emailEngagement', email_engagement,
						'latestEmailEvent', latest_event,
						'latestEmailEventAt', latest_event_at,
						'deliveredAt', delivered_at,
						'openedAt', opened_at,
						'clickedAt', clicked_at,
						'bouncedAt', bounced_at,
						'complainedAt', complained_at
					) AS item
					FROM paged
				) r
			), '[]'::json) AS rows
	`);

	const row = rowsFromResult<LeadDashboardSqlRow>(result)[0];
	if (!row) throw new Error('lead dashboard query returned no rows');

	const total = num(row.total);
	const emailSent = num(row.email_sent);
	const delivered = num(row.delivered_count);
	const opened = num(row.opened_count);
	const clicked = num(row.clicked_count);
	const converted = num(row.converted_count);
	const dailyLeads = arrayFromJson<{ date: string; count: number }>(row.daily_leads).map(
		(item) => ({
			date: String(item.date),
			count: num(item.count)
		})
	);
	const sourceBreakdown = arrayFromJson<{
		source: string;
		count: number;
		converted: number;
		sent: number;
		opened: number;
		clicked: number;
	}>(row.source_breakdown).map((item) => ({
		source: String(item.source),
		count: num(item.count),
		converted: num(item.converted),
		sent: num(item.sent),
		opened: num(item.opened),
		clicked: num(item.clicked)
	}));
	const leadRows = arrayFromJson<LeadDashboardJsonRow>(row.rows).map((item) => ({
		...item,
		createdAt: dateOrNull(item.createdAt),
		deletedAt: dateOrNull(item.deletedAt),
		latestEmailEventAt: dateOrNull(item.latestEmailEventAt),
		deliveredAt: dateOrNull(item.deliveredAt),
		openedAt: dateOrNull(item.openedAt),
		clickedAt: dateOrNull(item.clickedAt),
		bouncedAt: dateOrNull(item.bouncedAt),
		complainedAt: dateOrNull(item.complainedAt)
	}));

	return {
		overview: {
			total,
			totalPrevious: num(row.total_previous),
			trend: trendPct(total, num(row.total_previous)),
			newLeads: num(row.new_count),
			contactedLeads: num(row.contacted_count),
			convertedLeads: converted,
			unsubscribedLeads: num(row.unsubscribed_count),
			emailSent,
			delivered,
			opened,
			clicked,
			bounced: num(row.bounced_count),
			complained: num(row.complained_count),
			deliveryRate: pct(delivered, emailSent),
			openRate: pct(opened, delivered),
			clickRate: pct(clicked, opened),
			conversionRate: pct(converted, total),
			windowDays: safeDays,
			lastUpdated: now,
			source: 'postgres'
		},
		dailyLeads,
		sourceBreakdown,
		funnel: [
			{ label: 'Captured', value: total, color: '#c5a059' },
			{ label: 'Email Sent', value: emailSent, color: '#60a5fa' },
			{ label: 'Delivered', value: delivered, color: '#86efac' },
			{ label: 'Opened', value: opened, color: '#fcd34d' },
			{ label: 'Clicked', value: clicked, color: '#fca5a5' },
			{ label: 'Converted', value: converted, color: '#34d399' }
		],
		leads: leadRows,
		totalMatching: total
	};
}

function csvCell(val: string | number | null | undefined): string {
	const raw = String(val ?? '').replace(/"/g, '""');
	return /^[=+\-@\t\r]/.test(raw) ? `"'${raw}"` : `"${raw}"`;
}

/** Export ACTIVE leads as CSV. Trash is excluded — exports represent
 * real, current leads. */
export async function exportLeadsCsv() {
	const allLeads = await db
		.select()
		.from(leads)
		.where(isNull(leads.deletedAt))
		.orderBy(desc(leads.createdAt));
	const header = 'Email,Source,Status,Date\n';
	const rows = allLeads
		.map((l) =>
			[
				csvCell(l.email),
				csvCell(l.source ?? ''),
				csvCell(l.status ?? ''),
				csvCell(l.createdAt?.toISOString() ?? '')
			].join(',')
		)
		.join('\n');
	return header + rows;
}
