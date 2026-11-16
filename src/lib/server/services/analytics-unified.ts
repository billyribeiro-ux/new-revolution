import { db } from '#lib/server/db/index.js';
import { pageViews } from '#lib/server/db/schema.js';
import { sql, and } from 'drizzle-orm';
import { trendPct } from './metrics';
import { TRACKABLE_PATH_LIKE_FRAGMENT } from '#lib/server/analytics/path-filter.js';

/**
 * SQL fragment that excludes admin / API / framework / file-probe paths
 * from analytics aggregates. Same predicate as ingestion-side filter.
 * Without this, page-view counts include `/admin`, `/api/...`, and bot
 * scans of `/.git/config`, `/.env`, `/wp-login.php` etc., which would
 * massively over-report traffic in the dashboard.
 */
const TRACKABLE = sql.raw(TRACKABLE_PATH_LIKE_FRAGMENT);

/**
 * Unified Analytics Metrics
 * Sources data from Postgres pageViews table.
 *
 * Naming convention: `*30d` / `*7d` are historical names from when the
 * dashboard window was hard-coded; the underlying values are now
 * always for the CURRENT `windowDays` / `shortWindowDays` snapshot.
 * `*Prev` is the immediately-preceding window of the same length —
 * used for true period-over-period comparison rather than synthetic
 * extrapolation (e.g. multiplying a 7d count by 4 to fake a 30d
 * baseline gives garbage when there's any week-over-week variance).
 */
export interface UnifiedMetrics {
	views30d: number;
	views7d: number;
	visitors30d: number;
	visitors7d: number;
	/** Page views in the period BEFORE `views30d`'s window (same length). */
	views30dPrev: number;
	/** Unique visitors in the period BEFORE `visitors30d`'s window (same length). */
	visitors30dPrev: number;
	windowDays: number;
	shortWindowDays: number;
	source: 'postgres';
	lastUpdated: Date;
	/**
	 * Period-over-period growth. `null` means there was no activity in the
	 * prior period — no baseline to compare against, so the UI should
	 * render "NEW" rather than a percentage. `0` means no change.
	 */
	trends: {
		views30d: number | null;
		views7d: number | null;
		visitors30d: number | null;
		visitors7d: number | null;
	};
}

/**
 * Fetch from Postgres pageViews table
 */
async function fetchMetrics(days: number) {
	const now = new Date();
	const safeDays = Math.max(1, days);
	const shortWindowDays = Math.min(7, safeDays);
	const tPeriod = new Date(now.getTime() - safeDays * 24 * 60 * 60 * 1000);
	const tPrevPeriod = new Date(now.getTime() - safeDays * 2 * 24 * 60 * 60 * 1000);
	const tShort = new Date(now.getTime() - shortWindowDays * 24 * 60 * 60 * 1000);
	const tPrevShort = new Date(now.getTime() - shortWindowDays * 2 * 24 * 60 * 60 * 1000);

	const [
		views30d,
		views30dPrev,
		views7d,
		views7dPrev,
		visitors30d,
		visitors30dPrev,
		visitors7d,
		visitors7dPrev
	] = await Promise.all([
		db
			.select({ count: sql<number>`count(*)` })
			.from(pageViews)
			.where(and(sql`${pageViews.createdAt} >= ${tPeriod}`, TRACKABLE)),
		db
			.select({ count: sql<number>`count(*)` })
			.from(pageViews)
			.where(
				and(
					sql`${pageViews.createdAt} >= ${tPrevPeriod} AND ${pageViews.createdAt} < ${tPeriod}`,
					TRACKABLE
				)
			),
		db
			.select({ count: sql<number>`count(*)` })
			.from(pageViews)
			.where(and(sql`${pageViews.createdAt} >= ${tShort}`, TRACKABLE)),
		db
			.select({ count: sql<number>`count(*)` })
			.from(pageViews)
			.where(
				and(
					sql`${pageViews.createdAt} >= ${tPrevShort} AND ${pageViews.createdAt} < ${tShort}`,
					TRACKABLE
				)
			),
		db
			.select({ count: sql<number>`count(distinct ${pageViews.sessionId})` })
			.from(pageViews)
			.where(and(sql`${pageViews.createdAt} >= ${tPeriod}`, TRACKABLE)),
		db
			.select({ count: sql<number>`count(distinct ${pageViews.sessionId})` })
			.from(pageViews)
			.where(
				and(
					sql`${pageViews.createdAt} >= ${tPrevPeriod} AND ${pageViews.createdAt} < ${tPeriod}`,
					TRACKABLE
				)
			),
		db
			.select({ count: sql<number>`count(distinct ${pageViews.sessionId})` })
			.from(pageViews)
			.where(and(sql`${pageViews.createdAt} >= ${tShort}`, TRACKABLE)),
		db
			.select({ count: sql<number>`count(distinct ${pageViews.sessionId})` })
			.from(pageViews)
			.where(
				and(
					sql`${pageViews.createdAt} >= ${tPrevShort} AND ${pageViews.createdAt} < ${tShort}`,
					TRACKABLE
				)
			)
	]);

	const v30 = Number(views30d[0]?.count ?? 0);
	const v30p = Number(views30dPrev[0]?.count ?? 0);
	const v7 = Number(views7d[0]?.count ?? 0);
	const v7p = Number(views7dPrev[0]?.count ?? 0);
	const vis30 = Number(visitors30d[0]?.count ?? 0);
	const vis30p = Number(visitors30dPrev[0]?.count ?? 0);
	const vis7 = Number(visitors7d[0]?.count ?? 0);
	const vis7p = Number(visitors7dPrev[0]?.count ?? 0);

	return {
		views30d: v30,
		views7d: v7,
		visitors30d: vis30,
		visitors7d: vis7,
		views30dPrev: v30p,
		visitors30dPrev: vis30p,
		windowDays: safeDays,
		shortWindowDays,
		trends: {
			views30d: trendPct(v30, v30p),
			views7d: trendPct(v7, v7p),
			visitors30d: trendPct(vis30, vis30p),
			visitors7d: trendPct(vis7, vis7p)
		}
	};
}

/**
 * Get unified analytics metrics from Postgres
 */
export async function getUnifiedMetrics(days: number = 30): Promise<UnifiedMetrics> {
	const metrics = await fetchMetrics(days);

	return {
		views30d: metrics.views30d,
		views7d: metrics.views7d,
		visitors30d: metrics.visitors30d,
		visitors7d: metrics.visitors7d,
		views30dPrev: metrics.views30dPrev,
		visitors30dPrev: metrics.visitors30dPrev,
		windowDays: metrics.windowDays,
		shortWindowDays: metrics.shortWindowDays,
		source: 'postgres',
		lastUpdated: new Date(),
		trends: metrics.trends
	};
}
