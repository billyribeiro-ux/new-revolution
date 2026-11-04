/**
 * Consent service — append-only GDPR/ePrivacy audit log for the in-house CMP.
 *
 * Every consent decision (accept/reject/customize) is recorded as an APPEND-ONLY
 * row keyed to the anonymous visitor id (`_t_vid`). Rows are never UPDATED — the
 * latest row for an anonId is the current state and the history is the audit
 * trail, which is what Art. 7(1) accountability needs. `policyVersion` lets the
 * banner re-prompt when the policy text changes.
 *
 * Append-only is not the same as undeletable. Two paths remove rows, and both
 * are required rather than optional:
 *
 *   - {@link deleteConsentRecords}      GDPR Art. 17, right to erasure.
 *   - {@link purgeExpiredConsentRecords} Art. 5(1)(e), storage limitation.
 *
 * The docstring here previously said records "are never deleted", and the code
 * matched it: there was no delete path at all, which made an erasure request
 * unanswerable (2026-07-28 audit).
 *
 * IPs are anonymised at ingest, see `./consent-ip`.
 */
import { db } from '#lib/server/db/index.js';
import { consentRecords } from '#lib/server/db/schema.js';
import { desc, sql, eq, lt, inArray } from 'drizzle-orm';
import { anonymiseIp } from './consent-ip';
import { logger } from '#lib/server/logger.js';

/** The current cookie-policy version. Bump to force a global re-prompt. */
export const CONSENT_POLICY_VERSION = 1;

/**
 * How long a consent record is kept.
 *
 * Art. 5(1)(e) GDPR (storage limitation) requires a defined period; "forever"
 * is not one. 24 months is the conventional CMP ceiling and comfortably
 * outlives the consent itself: the CNIL recommends re-prompting at 6 to 13
 * months, and this repo's `CONSENT_POLICY_VERSION` re-prompt is the mechanism
 * for that. Keeping the proof for a year beyond the longest re-prompt window
 * leaves room to answer a supervisory-authority query about a decision that
 * has already expired.
 *
 * Enforced by {@link purgeExpiredConsentRecords}; nothing calls it on a timer,
 * and nothing calls it by hand either, see the note on that function.
 */
export const CONSENT_RETENTION_DAYS = 730;

/** Hard cap on a single admin page of records. */
export const CONSENT_PAGE_SIZE_MAX = 200;

export type ConsentCategories = {
	necessary: true;
	analytics: boolean;
	marketing: boolean;
};

/**
 * Append a consent decision.
 *
 * The IP is ANONYMISED here, not stored raw: see `./consent-ip`. Art. 7(1)
 * requires proof that consent was given, and `anonId` + `createdAt` +
 * `categories` + `policyVersion` already carry that. A full IP adds nothing to
 * the proof and makes the log a higher-risk personal-data store than the thing
 * it exists to protect. Every one of the 283 rows written before 2026-07-28
 * holds a full IP; those are historical and unchanged by this.
 */
export async function recordConsent(data: {
	anonId: string;
	categories: ConsentCategories;
	policyVersion: number;
	ip?: string | null;
	userAgent?: string | null;
}): Promise<void> {
	await db.insert(consentRecords).values({
		anonId: data.anonId,
		categories: data.categories,
		policyVersion: data.policyVersion,
		ip: anonymiseIp(data.ip),
		userAgent: data.userAgent ?? null
	});
}

/**
 * One page of consent records, newest first, WITH the total so the admin UI
 * can paginate honestly.
 *
 * This used to take an optional limit defaulting to 250 and return a bare
 * array. The admin page called it with no arguments and rendered whatever came
 * back, so at 283 rows (measured 2026-07-28) the oldest 33 records were
 * invisible with nothing on screen to say so. An audit log you cannot page
 * through is not an audit log.
 */
export async function listConsentRecords(filters?: { limit?: number; offset?: number }): Promise<{
	rows: (typeof consentRecords.$inferSelect)[];
	total: number;
	limit: number;
	offset: number;
}> {
	const limit = Math.min(
		CONSENT_PAGE_SIZE_MAX,
		Math.max(1, Math.trunc(filters?.limit ?? CONSENT_PAGE_SIZE_MAX))
	);
	const offset = Math.max(0, Math.trunc(filters?.offset ?? 0));

	const [rows, countRows] = await Promise.all([
		db
			.select()
			.from(consentRecords)
			.orderBy(desc(consentRecords.createdAt))
			.limit(limit)
			.offset(offset),
		db.select({ total: sql<number>`count(*)::int` }).from(consentRecords)
	]);

	return { rows, total: countRows[0]?.total ?? 0, limit, offset };
}

/**
 * Erase consent records.
 *
 * The append-only design is right for Art. 7(1) accountability, but "never
 * deleted" cannot be absolute: Art. 17 gives a data subject the right to
 * erasure, and a controller with no delete path cannot honour it. There was no
 * delete anywhere in this codebase before 2026-07-28.
 *
 * Two modes, deliberately:
 *   - `anonId`  erases every decision by one visitor. This is the Art. 17
 *               shape: a subject asks to be forgotten, and their whole
 *               history goes, not just the newest row.
 *   - `ids`     erases specific rows, for operational cleanup (test traffic,
 *               a duplicate from a retry storm).
 *
 * Erasing an accountability record is itself a decision worth recording, so
 * this logs via the repo's `logger` (there is no `audit_log` table) and
 * returns the count for the caller to surface. Never swallowed.
 */
export async function deleteConsentRecords(target: {
	anonId?: string;
	ids?: bigint[];
}): Promise<{ deleted: number }> {
	if (target.anonId) {
		const removed = await db
			.delete(consentRecords)
			.where(eq(consentRecords.anonId, target.anonId))
			.returning({ id: consentRecords.id });
		logger.info(
			{ op: 'consent.erase', mode: 'anonId', anonId: target.anonId, deleted: removed.length },
			'[consent] erased all records for a visitor (GDPR Art. 17)'
		);
		return { deleted: removed.length };
	}

	const ids = target.ids ?? [];
	if (ids.length === 0) return { deleted: 0 };

	const removed = await db
		.delete(consentRecords)
		.where(inArray(consentRecords.id, ids))
		.returning({ id: consentRecords.id });
	logger.info(
		{ op: 'consent.erase', mode: 'ids', requested: ids.length, deleted: removed.length },
		'[consent] erased specific records'
	);
	return { deleted: removed.length };
}

/**
 * Drop consent records past {@link CONSENT_RETENTION_DAYS}.
 *
 * Mirrors `cleanupOldPageViews`, which page_views has had all along while the
 * consent log, the table holding the MORE sensitive data, had no retention at
 * all. Safe to run repeatedly; returns the count for the operator's log.
 *
 * Not wired to a cron, and there is no manual entry point either. The
 * `purgeExpiredConsent` remote command (`src/lib/remote/admin/consent.remote.ts:86`)
 * is imported by no component (`src/routes/admin/consent/+page.svelte` imports
 * the other five) and no script calls it, so as of 2026-08-14 nothing in the
 * repo can run this. `vercel.json` already declares four crons, so adding a
 * fifth is a routine addition, not a change of contract. It is also untested:
 * `consent.test.ts` covers record/CSV/policy-version only, so the cutoff
 * arithmetic below is unverified. Scheduling it, or wiring an admin button, is
 * the work.
 */
export async function purgeExpiredConsentRecords(
	now: Date = new Date()
): Promise<{ deleted: number; cutoff: Date }> {
	const cutoff = new Date(now.getTime() - CONSENT_RETENTION_DAYS * 24 * 60 * 60 * 1000);
	const removed = await db
		.delete(consentRecords)
		.where(lt(consentRecords.createdAt, cutoff))
		.returning({ id: consentRecords.id });
	return { deleted: removed.length, cutoff };
}

/**
 * Grant-rate stats for the admin dashboard: total decisions and how many
 * granted analytics / marketing. Computed over the full table — cheap on the
 * indexed created_at, and the volume is decisions-per-visitor, not per-pageview.
 */
export async function getConsentStats(): Promise<{
	total: number;
	analyticsGranted: number;
	marketingGranted: number;
}> {
	// One row per VISITOR, not per decision.
	//
	// `consent_records` is append-only: re-deciding inserts another row, it does
	// not update the old one. A plain `count(*)` over the table therefore counted
	// a visitor once per decision and kept counting a grant the visitor had
	// already revoked, forever. Measured against a real database on 2026-08-14:
	// with one visitor who granted analytics, kept it, then revoked it, the old
	// query reported 146 analytics grants where the current state was 144.
	//
	// `DISTINCT ON (anon_id) … ORDER BY anon_id, created_at DESC` keeps only each
	// visitor's newest decision, which is what the service docstring has always
	// said the current state is. Same shape as the analytics `ua` breakdown.
	//
	// The percentages at src/routes/admin/consent/+page.svelte divide by `total`,
	// so this was a wrong RATE on the dashboard, not just a wrong count.
	const result = await db.execute(sql`
		SELECT
			count(*)::int AS total,
			count(*) FILTER (WHERE latest.categories->>'analytics' = 'true')::int AS analytics_granted,
			count(*) FILTER (WHERE latest.categories->>'marketing' = 'true')::int AS marketing_granted
		FROM (
			SELECT DISTINCT ON (anon_id) anon_id, categories
			FROM consent_records
			ORDER BY anon_id, created_at DESC
		) latest
	`);
	// neon-http returns `{ rows }`; some drivers return the array directly.
	const rows = (result as unknown as { rows?: Record<string, unknown>[] }).rows ?? result;
	const r = (Array.isArray(rows) ? rows[0] : undefined) as Record<string, unknown> | undefined;
	return {
		total: Number(r?.['total'] ?? 0),
		analyticsGranted: Number(r?.['analytics_granted'] ?? 0),
		marketingGranted: Number(r?.['marketing_granted'] ?? 0)
	};
}

/**
 * Export the FULL consent log as CSV.
 *
 * Pages through the table rather than taking a single `limit: 10_000`, which
 * silently truncated: an export that quietly omits rows is worse than no
 * export, because it looks authoritative when handed to a regulator.
 */
function csvCell(val: string | number | null | undefined): string {
	const raw = String(val ?? '').replace(/"/g, '""');
	return /^[=+\-@\t\r]/.test(raw) ? `"'${raw}"` : `"${raw}"`;
}

export async function exportConsentCsv(): Promise<string> {
	const all: (typeof consentRecords.$inferSelect)[] = [];
	for (let offset = 0; ; offset += CONSENT_PAGE_SIZE_MAX) {
		const page = await listConsentRecords({ limit: CONSENT_PAGE_SIZE_MAX, offset });
		all.push(...page.rows);
		if (all.length >= page.total || page.rows.length === 0) break;
	}
	const header = 'Date,Anon ID,Analytics,Marketing,Policy Version\n';
	const body = all
		.map((r) => {
			const c = (r.categories ?? {}) as Record<string, boolean>;
			return [
				csvCell(r.createdAt?.toISOString() ?? ''),
				csvCell(r.anonId),
				csvCell(c['analytics'] ? 'yes' : 'no'),
				csvCell(c['marketing'] ? 'yes' : 'no'),
				csvCell(r.policyVersion)
			].join(',');
		})
		.join('\n');
	return header + body;
}
