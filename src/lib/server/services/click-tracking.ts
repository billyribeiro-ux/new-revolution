/**
 * Internal-link click telemetry service.
 *
 * Backed by the `click_events` (raw, 30-day retention) and
 * `click_events_hourly` (rollup, indefinite retention) tables added in
 * migration 0017. The flow is:
 *
 *   1. Public visitor clicks an internal link.
 *   2. `+layout.svelte` capture script batches clicks (~2s or 10
 *      items) and POSTs to `/api/track/click`.
 *   3. Endpoint validates + IP-rate-limits + calls `recordClickEvents`
 *      which bulk-inserts the batch.
 *   4. Daily cron (Phase E commit 11) calls `rollupClicksToHourly`
 *      and then `purgeRawClickEvents(now - 30d)`.
 *   5. `detectCtrAnomalies` runs in the same cron and writes a
 *      notification when a target_path's CTR deviates ≥40% from its
 *      7-day median (with min volume thresholds to avoid noise).
 *
 * All public functions are pure-DB or pure-compute; the rate-limit
 * and auth gate live one layer up at the endpoint.
 */
import { and, desc, eq, gte, lt, sql } from 'drizzle-orm';
import { db } from '#lib/server/db/index.js';
import { clickEvents, clickEventsHourly, type NewClickEvent } from '#lib/server/db/schema.js';

/** Per-row insert input. linkText is truncated server-side. */
export interface RecordClickEventInput {
	sourcePath: string;
	targetPath: string;
	targetHost?: string | null | undefined;
	linkText?: string | null | undefined;
	sessionId?: string | null | undefined;
	userAgent?: string | null | undefined;
	country?: string | null | undefined;
}

const LINK_TEXT_MAX = 120;

/** Truncate at a code-point boundary so we don't split a surrogate pair. */
function truncateLinkText(value: string | null | undefined): string | null {
	if (value == null) return null;
	const trimmed = value.trim();
	if (trimmed.length === 0) return null;
	if (trimmed.length <= LINK_TEXT_MAX) return trimmed;
	return Array.from(trimmed).slice(0, LINK_TEXT_MAX).join('');
}

/**
 * Bulk-insert a batch of clicks in a single round-trip. Returns the
 * number of rows inserted (always batch.length unless the DB rejects
 * the whole batch, in which case it throws — let the caller decide
 * whether to retry).
 *
 * No deduplication here — the throttle and session fingerprint live in
 * the client; we trust the batch as delivered.
 */
export async function recordClickEvents(batch: RecordClickEventInput[]): Promise<number> {
	if (batch.length === 0) return 0;
	const now = new Date();
	const rows: NewClickEvent[] = batch.map((r) => ({
		sourcePath: r.sourcePath,
		targetPath: r.targetPath,
		targetHost: r.targetHost ?? null,
		linkText: truncateLinkText(r.linkText),
		sessionId: r.sessionId ?? null,
		userAgent: r.userAgent ?? null,
		country: r.country ?? null,
		createdAt: now
	}));
	const inserted = await db.insert(clickEvents).values(rows).returning({ id: clickEvents.id });
	return inserted.length;
}

/**
 * Aggregate the last `lookbackHours` of raw click events into the
 * hourly rollup. Idempotent — `ON CONFLICT (hour_bucket, source_path,
 * target_path) DO UPDATE` so re-running the cron after a partial
 * failure (or after the raw-purge step) leaves correct totals.
 *
 * A null lookback rebuilds all retained raw hours. The daily cron uses that
 * mode before purging, so missed runs cannot permanently lose an older day.
 * A numeric lookback always starts on an hour boundary.
 */
export async function rollupClicksToHourly(lookbackHours: number | null = 25): Promise<number> {
	const since =
		lookbackHours === null ? null : new Date(Date.now() - lookbackHours * 60 * 60 * 1000);
	// Replacing a bucket requires every raw event in that hour.
	since?.setUTCMinutes(0, 0, 0);

	// Insert ... select ... on conflict do update.
	// Using drizzle's `db.execute` because the aggregation source is a
	// subquery that doesn't fit the table builder cleanly.
	const result = await db.execute(sql`
		INSERT INTO ${clickEventsHourly} (hour_bucket, source_path, target_path, clicks, uniques)
		SELECT
			date_trunc('hour', ${clickEvents.createdAt}) AS hour_bucket,
			${clickEvents.sourcePath} AS source_path,
			${clickEvents.targetPath} AS target_path,
			count(*)::int AS clicks,
			count(DISTINCT ${clickEvents.sessionId})::int AS uniques
		FROM ${clickEvents}
		WHERE ${since ? sql`${clickEvents.createdAt} >= ${since}` : sql`true`}
		GROUP BY 1, 2, 3
		ON CONFLICT (hour_bucket, source_path, target_path) DO UPDATE SET
			clicks = EXCLUDED.clicks,
			uniques = EXCLUDED.uniques
	`);
	// Postgres returns rowCount on the underlying result; drizzle exposes
	// it as the response shape's length when available.
	const rows = (result as unknown as { rowCount?: number; rows?: unknown[] }).rowCount ?? 0;
	return rows;
}

/**
 * Hard-delete raw click events older than `olderThan`. Called daily
 * from the cron after the rollup step has captured the long-horizon
 * data. Returns the row count deleted (so the cron can log it).
 *
 * Retention: 30 days — long enough for a weekly admin review window
 * with one missed week, short enough that the raw table never bloats
 * past a few million rows for this site.
 */
export async function purgeRawClickEvents(olderThan: Date): Promise<number> {
	const result = await db
		.delete(clickEvents)
		.where(lt(clickEvents.createdAt, olderThan))
		.returning({ id: clickEvents.id });
	return result.length;
}

export interface CtrAnomaly {
	targetPath: string;
	clicks: number;
	uniques: number;
	medianClicks: number;
	deltaPct: number;
	direction: 'up' | 'down';
}

/**
 * Detect target_paths whose click volume on `referenceDate` (typically
 * yesterday in UTC) deviates ≥`thresholdPct` from their prior-7-day
 * median.
 *
 * Min-volume thresholds suppress noise from low-traffic pages:
 *   - minClicks (default 50): yesterday's bucket must have at least
 *     this many clicks to be considered.
 *   - minUniques (default 30): yesterday's bucket must have at least
 *     this many unique sessions (filters bot-clicks and refresh
 *     storms).
 *
 * Returns the list of anomalies; the cron emits one notification per
 * anomaly via `upsertAdminNotification`.
 */
export async function detectCtrAnomalies(
	referenceDate: Date = new Date(),
	options: { thresholdPct?: number; minClicks?: number; minUniques?: number } = {}
): Promise<CtrAnomaly[]> {
	const threshold = options.thresholdPct ?? 0.4;
	const minClicks = options.minClicks ?? 50;
	const minUniques = options.minUniques ?? 30;

	// Anchor at UTC midnight for stable day buckets across runs.
	const dayStart = new Date(
		Date.UTC(
			referenceDate.getUTCFullYear(),
			referenceDate.getUTCMonth(),
			referenceDate.getUTCDate()
		)
	);
	const baselineStart = new Date(dayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

	const todayRows = await db
		.select({
			targetPath: clickEventsHourly.targetPath,
			clicks: sql<number>`sum(${clickEventsHourly.clicks})::int`,
			uniques: sql<number>`sum(${clickEventsHourly.uniques})::int`
		})
		.from(clickEventsHourly)
		.where(
			and(
				gte(clickEventsHourly.hourBucket, dayStart),
				lt(clickEventsHourly.hourBucket, new Date(dayStart.getTime() + 24 * 60 * 60 * 1000))
			)
		)
		.groupBy(clickEventsHourly.targetPath);

	const eligible = todayRows.filter((r) => r.clicks >= minClicks && r.uniques >= minUniques);
	if (eligible.length === 0) return [];

	const anomalies: CtrAnomaly[] = [];
	for (const row of eligible) {
		const dailyBuckets = await db
			.select({
				day: sql<string>`date_trunc('day', ${clickEventsHourly.hourBucket})::text`,
				clicks: sql<number>`sum(${clickEventsHourly.clicks})::int`
			})
			.from(clickEventsHourly)
			.where(
				and(
					eq(clickEventsHourly.targetPath, row.targetPath),
					gte(clickEventsHourly.hourBucket, baselineStart),
					lt(clickEventsHourly.hourBucket, dayStart)
				)
			)
			.groupBy(sql`date_trunc('day', ${clickEventsHourly.hourBucket})`)
			.orderBy(desc(sql`date_trunc('day', ${clickEventsHourly.hourBucket})`));

		if (dailyBuckets.length < 3) continue; // not enough history to call a baseline
		const median = computeMedian(dailyBuckets.map((b) => b.clicks));
		if (median <= 0) continue;
		const delta = (row.clicks - median) / median;
		if (Math.abs(delta) < threshold) continue;
		anomalies.push({
			targetPath: row.targetPath,
			clicks: row.clicks,
			uniques: row.uniques,
			medianClicks: median,
			deltaPct: delta,
			direction: delta > 0 ? 'up' : 'down'
		});
	}
	return anomalies;
}

function computeMedian(values: number[]): number {
	if (values.length === 0) return 0;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	if (sorted.length % 2 === 0) {
		const left = sorted[mid - 1] ?? 0;
		const right = sorted[mid] ?? 0;
		return (left + right) / 2;
	}
	return sorted[mid] ?? 0;
}
