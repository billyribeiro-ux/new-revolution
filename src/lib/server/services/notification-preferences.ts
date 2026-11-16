/**
 * Per-user, per-type notification preferences.
 *
 * Backed by `notification_preferences` table (migration 0017). One row
 * per (user_id, type) with: enabled flag, digest frequency, optional
 * quiet-hours window in the user's tz.
 *
 * Defaults: when no row exists for a (user, type) pair, treat the
 * preference as fully ENABLED with no quiet hours — backwards-
 * compatible with the pre-prefs world. So an empty table means
 * "everyone sees everything," exactly the v1 ship state.
 *
 * v1 honours `enabled` and `quiet_hours_*`; `digest_frequency` is
 * stored but always treated as `immediate` (digest mode is a follow-up
 * PR after the bell UI is in operator hands and we have real signal
 * on which notifications they actually want batched).
 */
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '#lib/server/db/index.js';
import {
	notificationPreferences,
	users,
	type NotificationPreference
} from '#lib/server/db/schema.js';
import { logger } from '#lib/server/logger.js';

export type NotificationType = 'lead' | 'contact' | 'email' | 'analytics' | 'system' | 'ctr';
export type DigestFrequency = 'immediate' | 'daily' | 'weekly';

export interface UpsertPreferenceInput {
	userId: number;
	type: NotificationType;
	enabled?: boolean | undefined;
	digestFrequency?: DigestFrequency | undefined;
	quietHoursStart?: string | null | undefined;
	quietHoursEnd?: string | null | undefined;
	tz?: string | undefined;
}

/** Return all preference rows for a single user. */
export async function getPreferencesForUser(userId: number): Promise<NotificationPreference[]> {
	return db
		.select()
		.from(notificationPreferences)
		.where(eq(notificationPreferences.userId, userId));
}

/**
 * Idempotent upsert keyed on (user_id, type). Partial input fills only
 * the columns the caller passed; everything else stays at its current
 * value or the column default.
 */
export async function upsertPreference(
	input: UpsertPreferenceInput
): Promise<NotificationPreference> {
	const now = new Date();
	const baseValues = {
		userId: input.userId,
		type: input.type,
		enabled: input.enabled ?? true,
		digestFrequency: input.digestFrequency ?? 'immediate',
		quietHoursStart: input.quietHoursStart ?? null,
		quietHoursEnd: input.quietHoursEnd ?? null,
		tz: input.tz ?? 'UTC',
		updatedAt: now
	};

	const rows = await db
		.insert(notificationPreferences)
		.values(baseValues)
		.onConflictDoUpdate({
			target: [notificationPreferences.userId, notificationPreferences.type],
			set: {
				...(input.enabled !== undefined && { enabled: input.enabled }),
				...(input.digestFrequency !== undefined && { digestFrequency: input.digestFrequency }),
				...(input.quietHoursStart !== undefined && { quietHoursStart: input.quietHoursStart }),
				...(input.quietHoursEnd !== undefined && { quietHoursEnd: input.quietHoursEnd }),
				...(input.tz !== undefined && { tz: input.tz }),
				updatedAt: now
			}
		})
		.returning();
	const row = rows[0];
	if (!row) throw new Error('Failed to upsert notification preference');
	return row;
}

export interface ResolvedPreference {
	enabled: boolean;
	inQuietHours: boolean;
}

/**
 * Compute the effective preference for (userId, type) at a given
 * instant. Two responsibilities:
 *
 *   1. Decide whether the user wants this type at all (`enabled`).
 *      Missing row = default ENABLED, so a fresh admin sees everything
 *      without ever touching settings.
 *   2. Decide whether `now` falls inside the user's quiet-hours
 *      window in their declared tz. Quiet hours that cross midnight
 *      (e.g. 22:00 → 07:00) are honoured. Both ends null = no window.
 *
 * Returns `{ enabled, inQuietHours }`. The caller decides what to do
 * with the combination — typically "suppress write if !enabled OR
 * inQuietHours."
 */
export async function resolvePreference(
	userId: number,
	type: NotificationType,
	now: Date = new Date()
): Promise<ResolvedPreference> {
	const rows = await db
		.select()
		.from(notificationPreferences)
		.where(and(eq(notificationPreferences.userId, userId), eq(notificationPreferences.type, type)))
		.limit(1);

	const pref = rows[0];
	if (!pref) {
		// No row → defaults: enabled, no quiet hours.
		return { enabled: true, inQuietHours: false };
	}

	return {
		enabled: pref.enabled,
		inQuietHours: isWithinQuietHours(now, pref.tz, pref.quietHoursStart, pref.quietHoursEnd)
	};
}

/**
 * Reduce a fan-out preference resolution across every admin user to a
 * single "should we write this notification at all?" boolean. The
 * notification table is shared across the admin team (such as it is),
 * so the rule is: write the row if AT LEAST ONE admin wants to see
 * the type AND is not currently in their quiet-hours window. If no
 * admin wants it right now, drop the write — the next admin who
 * checks the bell after their quiet hours end will simply not see
 * stale stuff that was suppressed.
 *
 * v1 ships with no UI to flip preferences, so this fan-out reliably
 * returns true (defaults are enabled, no quiet hours). Once the
 * settings page ships in a follow-up PR, operators can opt out
 * without needing a separate write-path change.
 */
export async function shouldFanOutNotification(
	type: NotificationType,
	now: Date = new Date()
): Promise<boolean> {
	try {
		const adminRows = await db
			.select({ id: users.id })
			.from(users)
			.where(and(eq(users.role, 'admin'), eq(users.isActive, true)));
		if (adminRows.length === 0) {
			// No admins exist (first-run UX). Don't suppress — surface anyway
			// so the bell isn't silently empty when an admin is seeded later.
			return true;
		}
		const adminIds = adminRows.map((r) => r.id);
		const prefs = await db
			.select()
			.from(notificationPreferences)
			.where(
				and(
					inArray(notificationPreferences.userId, adminIds),
					eq(notificationPreferences.type, type)
				)
			);

		const prefByUser = new Map(prefs.map((p) => [p.userId, p]));
		for (const id of adminIds) {
			const pref = prefByUser.get(id);
			if (!pref) return true; // default = enabled, want it
			if (!pref.enabled) continue;
			const quiet = isWithinQuietHours(now, pref.tz, pref.quietHoursStart, pref.quietHoursEnd);
			if (!quiet) return true;
		}
		return false;
	} catch (err) {
		// On any DB hiccup, fail OPEN — never suppress a notification
		// because the prefs lookup misbehaved. Missing the bell badge
		// is worse than a too-noisy one for a solo operator.
		logger.warn({ err, type }, '[notification-prefs] fan-out check failed, defaulting to write');
		return true;
	}
}

/**
 * Pure quiet-hours math. Exported for unit tests.
 *
 * Both `start` and `end` are `'HH:MM'` strings interpreted in the
 * user's `tz`. When the window crosses midnight (e.g. 22:00 → 07:00),
 * any time at or after start OR before end is in-window.
 *
 * Implementation note: Intl.DateTimeFormat with the user's tz is the
 * portable way to get "what hour:minute does `now` read in that tz"
 * without dragging in a tz library. Node 24 + modern browsers ship
 * the full ICU timezone database, so this works for every IANA tz.
 */
export function isWithinQuietHours(
	now: Date,
	tz: string,
	start: string | null,
	end: string | null
): boolean {
	if (!start || !end) return false;
	const startMin = parseHHMM(start);
	const endMin = parseHHMM(end);
	if (startMin === null || endMin === null) return false;
	if (startMin === endMin) return false;

	const nowMin = minutesIntoDay(now, tz);
	if (nowMin === null) return false;

	if (startMin < endMin) {
		// Same-day window, e.g. 13:00 → 17:00.
		return nowMin >= startMin && nowMin < endMin;
	}
	// Crosses midnight, e.g. 22:00 → 07:00.
	return nowMin >= startMin || nowMin < endMin;
}

function parseHHMM(value: string): number | null {
	const match = /^(\d{2}):(\d{2})$/.exec(value);
	if (!match) return null;
	const hours = Number(match[1]);
	const minutes = Number(match[2]);
	if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
	return hours * 60 + minutes;
}

function minutesIntoDay(now: Date, tz: string): number | null {
	try {
		const parts = new Intl.DateTimeFormat('en-GB', {
			timeZone: tz,
			hour12: false,
			hour: '2-digit',
			minute: '2-digit'
		}).formatToParts(now);
		const hour = parts.find((p) => p.type === 'hour')?.value;
		const minute = parts.find((p) => p.type === 'minute')?.value;
		if (hour === undefined || minute === undefined) return null;
		const h = Number(hour);
		const m = Number(minute);
		if (Number.isNaN(h) || Number.isNaN(m)) return null;
		// Some locales render midnight as '24' for hour-2-digit; normalize.
		const normalisedHour = h === 24 ? 0 : h;
		return normalisedHour * 60 + m;
	} catch {
		return null;
	}
}
