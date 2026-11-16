import { db } from '#lib/server/db/index.js';
import { logger } from '#lib/server/logger.js';
import { NotFoundError } from '#lib/server/service-errors.js';
import {
	adminNotifications,
	type AdminNotification as AdminNotificationRow,
	type ContactSubmission,
	type Lead
} from '#lib/server/db/schema.js';
import { and, desc, eq, inArray, isNotNull, isNull, sql } from 'drizzle-orm';
import { shouldFanOutNotification, type NotificationType } from './notification-preferences';

export type AdminNotificationSeverity = 'info' | 'success' | 'warning' | 'danger';
export type AdminNotificationType = 'lead' | 'contact' | 'email' | 'analytics' | 'system';

/**
 * Types the admin bell surfaces — intentionally scoped to "the basics":
 * emails received (`email`), traffic up/down (`analytics`), and contact-form
 * messages (`contact`). `lead` and `system` are still recorded in the table
 * (history is preserved) but excluded from the bell's count and list so the
 * dropdown stays focused. Applied to BOTH `getNotificationHead` (the badge
 * count) and `listAdminNotifications` (the dropdown) so they never disagree.
 */
export const BELL_NOTIFICATION_TYPES = ['email', 'analytics', 'contact'] as const;

export type CreateAdminNotificationInput = {
	type: AdminNotificationType;
	severity?: AdminNotificationSeverity | undefined;
	title: string;
	body?: string | undefined;
	targetHref: string;
	sourceTable?: string | undefined;
	sourceId?: number | undefined;
	dedupeKey: string;
	metadata?: Record<string, unknown> | undefined;
	occurredAt?: Date | undefined;
	/**
	 * When true (default false), consult `notification_preferences` before
	 * writing. If every admin has the type disabled or is in their quiet-
	 * hours window, drop the write and return null. v1 defaults to
	 * false to preserve existing call-site behaviour; new call sites
	 * (CTR anomaly, email engagement digest, daily traffic delta) opt
	 * in explicitly so operators get fine-grained control over the new
	 * notification classes without touching the legacy ones.
	 */
	respectPreferences?: boolean;
};

/**
 * Function overloads so existing call sites (no `respectPreferences`)
 * get a non-null return type and new call sites that opt in get the
 * nullable variant. TypeScript narrows on the literal `true` value at
 * the boundary, so callers don't have to cast.
 */
export async function upsertAdminNotification(
	input: CreateAdminNotificationInput & { respectPreferences: true }
): Promise<AdminNotificationRow | null>;
export async function upsertAdminNotification(
	input: CreateAdminNotificationInput & { respectPreferences?: false | undefined }
): Promise<AdminNotificationRow>;
export async function upsertAdminNotification(
	input: CreateAdminNotificationInput
): Promise<AdminNotificationRow | null> {
	const now = new Date();

	if (input.respectPreferences) {
		const wanted = await shouldFanOutNotification(input.type as NotificationType, now);
		if (!wanted) {
			// Was a Sentry breadcrumb. Sentry was removed on 2026-08-14 (it had no
			// DSN configured, so init() never ran and every call here was a no-op).
			// Kept as a pino line so a suppressed notification is still traceable.
			// No PII: `type` is enum-bounded and `dedupeKey` is our own
			// deterministic identifier.
			logger.info(
				{
					type: input.type,
					dedupeKey: input.dedupeKey,
					reason: 'all-admins-disabled-or-quiet'
				},
				'[notifications] suppressed'
			);
			return null;
		}
	}

	const inserted = await db
		.insert(adminNotifications)
		.values({
			type: input.type,
			severity: input.severity ?? 'info',
			title: input.title,
			body: input.body ?? null,
			targetHref: input.targetHref,
			sourceTable: input.sourceTable ?? null,
			sourceId: input.sourceId ?? null,
			dedupeKey: input.dedupeKey,
			metadata: input.metadata ?? null,
			occurredAt: input.occurredAt ?? now,
			createdAt: now
		})
		.onConflictDoUpdate({
			target: adminNotifications.dedupeKey,
			set: {
				type: input.type,
				severity: input.severity ?? 'info',
				title: input.title,
				body: input.body ?? null,
				targetHref: input.targetHref,
				metadata: input.metadata ?? null,
				occurredAt: input.occurredAt ?? now
			}
		})
		.returning();

	if (!inserted[0]) throw new Error('Failed to create admin notification');

	// Was a Sentry breadcrumb, now a pino line. Sentry was removed on 2026-08-14
	// (no DSN was ever configured, so init() never ran and this was a no-op).
	//
	// `dedupeKey` is safe to log (our own deterministic identifier, no PII) and
	// `severity` is enum-bounded. Deliberately NO titles or bodies: those
	// sometimes carry user-provided strings such as a lead's name.
	logger.info(
		{
			type: input.type,
			severity: input.severity ?? 'info',
			dedupeKey: input.dedupeKey,
			notificationId: inserted[0].id
		},
		'[notifications] written'
	);

	return inserted[0];
}

export async function listAdminNotifications(filters?: {
	status?: 'all' | 'unread' | 'read' | undefined;
	/** `active` = not archived (default), `archived` = the archive folder. */
	folder?: 'active' | 'archived' | undefined;
	limit?: number | undefined;
}) {
	const status = filters?.status ?? 'all';
	const folder = filters?.folder ?? 'active';
	const limit = Math.min(Math.max(filters?.limit ?? 20, 1), 50);
	// Scope to the bell's basics (email/traffic/contact); see BELL_NOTIFICATION_TYPES.
	const conditions = [inArray(adminNotifications.type, [...BELL_NOTIFICATION_TYPES])];

	// Active folder hides archived rows; Archive folder shows only them.
	conditions.push(
		folder === 'archived'
			? isNotNull(adminNotifications.archivedAt)
			: isNull(adminNotifications.archivedAt)
	);

	if (status === 'unread') conditions.push(isNull(adminNotifications.readAt));
	if (status === 'read') conditions.push(isNotNull(adminNotifications.readAt));

	return await db
		.select()
		.from(adminNotifications)
		.where(and(...conditions))
		.orderBy(desc(adminNotifications.occurredAt), desc(adminNotifications.id))
		.limit(limit);
}

export async function getUnreadAdminNotificationCount() {
	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(adminNotifications)
		.where(
			and(
				isNull(adminNotifications.readAt),
				isNull(adminNotifications.archivedAt),
				inArray(adminNotifications.type, [...BELL_NOTIFICATION_TYPES])
			)
		);
	return Number(result[0]?.count ?? 0);
}

export interface NotificationHead {
	unread: number;
	maxId: number | null;
	latestOccurredAt: Date | null;
}

/**
 * Single-round-trip "is there anything new?" query for the bell's
 * polling endpoint. Combines the unread count, the max notification id
 * (monotonic, so a change in maxId proves a new row landed), and the
 * latest occurred_at into one COUNT/MAX SELECT.
 *
 * Backed by `admin_notifications_unread_partial_idx` (migration 0017,
 * partial btree on occurred_at WHERE read_at IS NULL), so the
 * `count(*) FILTER (WHERE read_at IS NULL)` is an index-only scan.
 * Cost stays under a millisecond even at 1M+ lifetime rows.
 *
 * The HEAD endpoint sets `ETag: "${unread}:${maxId}"` from this
 * payload; subsequent polls send `If-None-Match` and short-circuit
 * to 304 when the tuple is unchanged, avoiding even this query on
 * the cheap path.
 */
/** Raw row shape returned by the neon-http driver for the head aggregate. */
export interface NotificationHeadRow {
	unread: string | number | null;
	maxId: string | number | null;
	latest: string | Date | null;
}

/**
 * Coerce a raw aggregate row into a typed {@link NotificationHead}.
 *
 * `sql<T>` is only a compile-time cast — it does NOT make Drizzle parse the
 * value. The neon-http driver returns raw `max(...)` / `count(...)` aggregates
 * as their wire form: numerics as strings, timestamps as strings (NOT Date
 * objects). So every field must be coerced at runtime. Typing `latest` as
 * `sql<Date>` and returning it raw shipped a string whose `.toISOString()`
 * threw a TypeError in the /head endpoint on every authenticated poll.
 */
export function coerceNotificationHead(row: NotificationHeadRow | undefined): NotificationHead {
	const latestRaw = row?.latest ?? null;
	const latestDate = latestRaw == null ? null : new Date(latestRaw);
	return {
		unread: Number(row?.unread ?? 0),
		maxId: row?.maxId != null ? Number(row.maxId) : null,
		latestOccurredAt: latestDate && !Number.isNaN(latestDate.getTime()) ? latestDate : null
	};
}

export async function getNotificationHead(): Promise<NotificationHead> {
	const result = await db
		.select({
			unread: sql<string | number>`count(*) FILTER (WHERE ${adminNotifications.readAt} IS NULL)`,
			maxId: sql<string | number | null>`max(${adminNotifications.id})`,
			latest: sql<string | Date | null>`max(${adminNotifications.occurredAt})`
		})
		.from(adminNotifications)
		// Scope to the bell's basics AND the Active folder so the badge count
		// matches the Active dropdown list (archived rows don't ring the bell).
		.where(
			and(
				inArray(adminNotifications.type, [...BELL_NOTIFICATION_TYPES]),
				isNull(adminNotifications.archivedAt)
			)
		);

	return coerceNotificationHead(result[0]);
}

export async function markAdminNotificationRead(id: number) {
	const result = await db
		.update(adminNotifications)
		.set({ readAt: new Date() })
		.where(eq(adminNotifications.id, id))
		.returning();
	if (!result[0]) throw new NotFoundError('Notification not found');
	return result[0];
}

export async function markAdminNotificationClicked(id: number) {
	const now = new Date();
	const result = await db
		.update(adminNotifications)
		.set({ clickedAt: now, readAt: now })
		.where(eq(adminNotifications.id, id))
		.returning();
	if (!result[0]) throw new NotFoundError('Notification not found');
	return result[0];
}

export async function markAdminNotificationUnread(id: number) {
	const result = await db
		.update(adminNotifications)
		.set({ readAt: null, clickedAt: null })
		.where(eq(adminNotifications.id, id))
		.returning();
	if (!result[0]) throw new NotFoundError('Notification not found');
	return result[0];
}

export async function archiveAdminNotification(id: number) {
	// Archiving also marks read — an archived item is no longer "new".
	const now = new Date();
	const result = await db
		.update(adminNotifications)
		.set({ archivedAt: now, readAt: sql`COALESCE(${adminNotifications.readAt}, ${now})` })
		.where(eq(adminNotifications.id, id))
		.returning();
	if (!result[0]) throw new NotFoundError('Notification not found');
	return result[0];
}

export async function unarchiveAdminNotification(id: number) {
	const result = await db
		.update(adminNotifications)
		.set({ archivedAt: null })
		.where(eq(adminNotifications.id, id))
		.returning();
	if (!result[0]) throw new NotFoundError('Notification not found');
	return result[0];
}

export async function deleteAdminNotification(id: number) {
	const result = await db
		.delete(adminNotifications)
		.where(eq(adminNotifications.id, id))
		.returning({ id: adminNotifications.id });
	if (!result[0]) throw new NotFoundError('Notification not found');
	return { id: result[0].id };
}

export async function notifyNewLead(lead: Lead) {
	const name = lead.name?.trim() || lead.email;
	return upsertAdminNotification({
		type: 'lead',
		severity: 'success',
		title: 'New lead captured',
		body: `${name} signed up${lead.sourcePage ? ` from ${lead.sourcePage}` : ''}.`,
		targetHref: `/admin/leads?lead=${lead.id}`,
		sourceTable: 'leads',
		sourceId: lead.id,
		dedupeKey: `lead:${lead.id}:created`,
		metadata: {
			email: lead.email,
			name: lead.name,
			source: lead.source,
			sourcePage: lead.sourcePage
		},
		occurredAt: lead.createdAt ?? new Date()
	});
}

export async function notifyNewContact(contact: ContactSubmission) {
	return upsertAdminNotification({
		type: 'contact',
		severity: 'info',
		title: 'New inbox message',
		body: `${contact.name} sent a message${contact.company ? ` from ${contact.company}` : ''}.`,
		targetHref: `/admin/inbox?contact=${contact.id}`,
		sourceTable: 'contact_submissions',
		sourceId: contact.id,
		dedupeKey: `contact:${contact.id}:created`,
		metadata: {
			email: contact.email,
			company: contact.company
		},
		occurredAt: contact.createdAt ?? new Date()
	});
}

export async function notifyResendEmailEvent(input: {
	event: string;
	leadId: number | null;
	messageId: string | null;
	metadata?: Record<string, unknown> | undefined;
}) {
	if (input.event !== 'bounced' && input.event !== 'complained') return null;
	const severity = input.event === 'complained' ? 'danger' : 'warning';
	const label = input.event === 'complained' ? 'complaint' : 'bounce';

	return upsertAdminNotification({
		type: 'email',
		severity,
		title: `Email ${label} detected`,
		body: input.leadId
			? `Resend reported an email ${label} for lead #${input.leadId}.`
			: `Resend reported an unattributed email ${label}.`,
		targetHref: input.leadId ? `/admin/leads?lead=${input.leadId}` : '/admin/email-analytics',
		sourceTable: input.leadId ? 'leads' : 'email_events',
		sourceId: input.leadId ?? undefined,
		dedupeKey: `resend:${input.messageId ?? 'unknown'}:${input.event}`,
		metadata: input.metadata,
		occurredAt: new Date()
	});
}
