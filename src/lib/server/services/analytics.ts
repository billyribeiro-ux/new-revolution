import { db } from '#lib/server/db/index.js';
import { emailEvents, leads, pageViews } from '#lib/server/db/schema.js';
import { desc, sql, and, like, gte, lt, eq } from 'drizzle-orm';
import { TRACKABLE_PATH_LIKE_FRAGMENT } from '#lib/server/analytics/path-filter.js';
import { fillDailySeries, pct, trendPct } from './metrics';
import { upsertAdminNotification } from './notifications';

/**
 * SQL fragment that excludes admin / API / framework / file-probe paths
 * from analytics queries. The same predicate is used at write-time in
 * `hooks.server.ts:analyticsTracking` so future ingest-blocked paths
 * can never reappear in admin dashboards. Historical pollution that
 * already lives in `page_views` (bot scans recorded before the
 * ingest-side filter was added) is masked by this fragment too.
 */
const TRACKABLE = sql.raw(TRACKABLE_PATH_LIKE_FRAGMENT);

type DailyPageView = { date: string; views: number; visitors: number };
type TopPageAnalytics = { path: string; views: number; visitors: number };
type ReferrerAnalytics = { referrer: string | null; views: number };
/**
 * "First-touch visitors": distinct visitors whose first tracked pageview
 * of the window landed on this path. NOT GA-style landing sessions; the
 * old `sessions` field was the same number under a wrong name (audit
 * 2026-06-11).
 */
type LandingPageAnalytics = { path: string; visitors: number };
type BreakdownItem = { label: string; value: number };

export type AnalyticsDashboardData = {
	overview: {
		views30d: number;
		views7d: number;
		visitors30d: number;
		visitors7d: number;
		views30dPrev: number;
		visitors30dPrev: number;
		sessions30d: number;
		sessions30dPrev: number;
		singlePageSessions: number;
		engagedSessions: number;
		bounceRate: number;
		engagementRate: number;
		viewsPerSession: number;
		leads30d: number;
		leads30dPrev: number;
		leadConversionRate: number;
		activeVisitors: number;
		windowDays: number;
		shortWindowDays: number;
		source: 'postgres';
		lastUpdated: Date;
		trends: {
			views30d: number | null;
			visitors30d: number | null;
			sessions30d: number | null;
			leads30d: number | null;
		};
	};
	dailyViews: DailyPageView[];
	topPages: TopPageAnalytics[];
	topReferrers: ReferrerAnalytics[];
	topLandingPages: LandingPageAnalytics[];
	popularPosts: TopPageAnalytics[];
	browserBreakdown: BreakdownItem[];
	deviceBreakdown: BreakdownItem[];
	countryBreakdown: BreakdownItem[];
};

type AnalyticsDashboardRow = {
	views_period: number;
	views_period_prev: number;
	views_short: number;
	views_short_prev: number;
	visitors_period: number;
	visitors_period_prev: number;
	visitors_short: number;
	visitors_short_prev: number;
	sessions_period: number;
	sessions_period_prev: number;
	single_page_sessions: number;
	engaged_sessions: number;
	active_visitors: number;
	leads_period: number;
	leads_period_prev: number;
	browser_edge: number;
	browser_opera: number;
	browser_firefox: number;
	browser_chrome: number;
	browser_safari: number;
	browser_ie: number;
	browser_other: number;
	device_mobile: number;
	device_tablet: number;
	device_desktop: number;
	daily_views: unknown;
	top_pages: unknown;
	top_referrers: unknown;
	top_landing_pages: unknown;
	popular_posts: unknown;
	country_breakdown: unknown;
};

const ANALYTICS_DASHBOARD_CACHE_TTL_MS = 15_000;
const analyticsDashboardCache = new Map<
	number,
	{ expiresAt: number; value: AnalyticsDashboardData }
>();

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

function normalizeBreakdown(items: BreakdownItem[]): BreakdownItem[] {
	return items.filter((item) => item.value > 0).sort((a, b) => b.value - a.value);
}

async function fetchAnalyticsDashboardData(days: number): Promise<AnalyticsDashboardData> {
	const now = new Date();
	const safeDays = Math.max(1, Math.min(365, Math.trunc(days)));
	const shortWindowDays = Math.min(7, safeDays);
	const tPeriod = new Date(now.getTime() - safeDays * 24 * 60 * 60 * 1000);
	const tPrevPeriod = new Date(now.getTime() - safeDays * 2 * 24 * 60 * 60 * 1000);
	const tShort = new Date(now.getTime() - shortWindowDays * 24 * 60 * 60 * 1000);
	const tPrevShort = new Date(now.getTime() - shortWindowDays * 2 * 24 * 60 * 60 * 1000);
	const tActive = new Date(now.getTime() - 5 * 60 * 1000);
	const trackable = sql.raw(TRACKABLE_PATH_LIKE_FRAGMENT);

	const result = await db.execute<AnalyticsDashboardRow>(sql`
		WITH scoped AS (
			SELECT path, referrer, user_agent, session_id, country, created_at
			FROM ${pageViews}
			WHERE created_at >= ${tPrevPeriod} AND ${trackable}
		),
		current AS (
			SELECT *
			FROM scoped
			WHERE created_at >= ${tPeriod}
		),
		previous AS (
			SELECT *
			FROM scoped
			WHERE created_at >= ${tPrevPeriod} AND created_at < ${tPeriod}
		),
		-- Real sessions, GA4-style: a session starts whenever a visitor
		-- (session_id column = pseudonymous visitor fingerprint) has been
		-- inactive for >= 30 minutes. Without this gap-and-island logic,
		-- "sessions" used to equal "unique visitors" exactly because both
		-- were count(distinct session_id). The views aggregate per
		-- session still drives bounce / engagement metrics below.
		session_bursts AS (
			SELECT
				session_id,
				created_at,
				CASE
					WHEN LAG(created_at) OVER (PARTITION BY session_id ORDER BY created_at) IS NULL
						OR created_at - LAG(created_at) OVER (PARTITION BY session_id ORDER BY created_at) > INTERVAL '30 minutes'
					THEN 1 ELSE 0
				END AS is_new_session
			FROM current
			WHERE session_id IS NOT NULL AND session_id != ''
		),
		session_ids AS (
			SELECT
				session_id,
				created_at,
				sum(is_new_session) OVER (PARTITION BY session_id ORDER BY created_at) AS burst
			FROM session_bursts
		),
		sessions AS (
			SELECT session_id, burst, count(*)::int AS views
			FROM session_ids
			GROUP BY session_id, burst
		),
		previous_session_bursts AS (
			SELECT
				session_id,
				created_at,
				CASE
					WHEN LAG(created_at) OVER (PARTITION BY session_id ORDER BY created_at) IS NULL
						OR created_at - LAG(created_at) OVER (PARTITION BY session_id ORDER BY created_at) > INTERVAL '30 minutes'
					THEN 1 ELSE 0
				END AS is_new_session
			FROM previous
			WHERE session_id IS NOT NULL AND session_id != ''
		),
		previous_session_ids AS (
			SELECT
				session_id,
				created_at,
				sum(is_new_session) OVER (PARTITION BY session_id ORDER BY created_at) AS burst
			FROM previous_session_bursts
		),
		previous_sessions AS (
			SELECT session_id, burst, count(*)::int AS views
			FROM previous_session_ids
			GROUP BY session_id, burst
		),
		-- One row per VISITOR, not per page view. The donuts are labelled
		-- "Devices" / "Browsers" / "Countries", so a reader reads them as
		-- people. Counting page views made one visitor who read 50 pages
		-- weigh 50x, which at this traffic volume let a couple of heavy
		-- sessions define the whole chart (2026-07-28 audit). GA4 and
		-- Plausible both report these per visitor.
		--
		-- DISTINCT ON picks each visitor's FIRST user agent in the window; a
		-- visitor who switched browsers mid-window counts once, under the one
		-- they arrived with, instead of appearing in two slices.
		ua AS (
			SELECT DISTINCT ON (session_id) session_id, user_agent
			FROM current
			WHERE user_agent IS NOT NULL AND user_agent != ''
				AND session_id IS NOT NULL AND session_id != ''
			ORDER BY session_id, created_at ASC
		)
		SELECT
			(SELECT count(*) FROM current) AS views_period,
			(SELECT count(*) FROM scoped WHERE created_at >= ${tPrevPeriod} AND created_at < ${tPeriod}) AS views_period_prev,
			(SELECT count(*) FROM scoped WHERE created_at >= ${tShort}) AS views_short,
			(SELECT count(*) FROM scoped WHERE created_at >= ${tPrevShort} AND created_at < ${tShort}) AS views_short_prev,
			(SELECT count(DISTINCT NULLIF(session_id, '')) FROM current) AS visitors_period,
			(SELECT count(DISTINCT NULLIF(session_id, '')) FROM scoped WHERE created_at >= ${tPrevPeriod} AND created_at < ${tPeriod}) AS visitors_period_prev,
			(SELECT count(DISTINCT NULLIF(session_id, '')) FROM scoped WHERE created_at >= ${tShort}) AS visitors_short,
			(SELECT count(DISTINCT NULLIF(session_id, '')) FROM scoped WHERE created_at >= ${tPrevShort} AND created_at < ${tShort}) AS visitors_short_prev,
			(SELECT count(*) FROM sessions) AS sessions_period,
			(SELECT count(*) FROM previous_sessions) AS sessions_period_prev,
			(SELECT count(*) FROM sessions WHERE views = 1) AS single_page_sessions,
			(SELECT count(*) FROM sessions WHERE views > 1) AS engaged_sessions,
			(SELECT count(DISTINCT NULLIF(session_id, '')) FROM scoped WHERE created_at >= ${tActive}) AS active_visitors,
			(SELECT count(*) FROM ${leads} WHERE created_at >= ${tPeriod} AND deleted_at IS NULL) AS leads_period,
			(SELECT count(*) FROM ${leads} WHERE created_at >= ${tPrevPeriod} AND created_at < ${tPeriod} AND deleted_at IS NULL) AS leads_period_prev,
			(SELECT count(*) FROM ua WHERE user_agent ~* 'Edg/') AS browser_edge,
			(SELECT count(*) FROM ua WHERE user_agent ~* 'OPR|Opera' AND user_agent !~* 'Edg/') AS browser_opera,
			(SELECT count(*) FROM ua WHERE user_agent ~* 'Firefox' AND user_agent !~* 'Edg/|OPR|Opera') AS browser_firefox,
			(SELECT count(*) FROM ua WHERE user_agent ~* 'Chrome' AND user_agent !~* 'Edg/|OPR|Opera|Firefox') AS browser_chrome,
			(SELECT count(*) FROM ua WHERE user_agent ~* 'Safari' AND user_agent !~* 'Chrome|Edg/|OPR|Opera|Firefox') AS browser_safari,
			(SELECT count(*) FROM ua WHERE user_agent ~* 'MSIE|Trident' AND user_agent !~* 'Chrome|Safari|Edg/|OPR|Opera|Firefox') AS browser_ie,
			(SELECT count(*) FROM ua WHERE user_agent !~* 'Edg/|OPR|Opera|Firefox|Chrome|Safari|MSIE|Trident') AS browser_other,
			(SELECT count(*) FROM ua WHERE user_agent ~* 'Mobile|Android.*Mobile|iPhone') AS device_mobile,
			(SELECT count(*) FROM ua WHERE user_agent !~* 'Mobile|Android.*Mobile|iPhone' AND (user_agent ~* 'iPad|Tablet' OR (user_agent ~* 'Android' AND user_agent !~* 'Mobile'))) AS device_tablet,
			(SELECT count(*) FROM ua WHERE user_agent !~* 'Mobile|Android.*Mobile|iPhone|iPad|Tablet' AND NOT (user_agent ~* 'Android' AND user_agent !~* 'Mobile')) AS device_desktop,
			COALESCE((
				SELECT json_agg(row_to_json(d))
				FROM (
					SELECT created_at::date::text AS date, count(*)::int AS views, count(DISTINCT session_id)::int AS visitors
					FROM current
					GROUP BY 1
					ORDER BY 1
				) d
			), '[]'::json) AS daily_views,
			COALESCE((
				SELECT json_agg(row_to_json(p))
				FROM (
					SELECT path, count(*)::int AS views, count(DISTINCT session_id)::int AS visitors
					FROM current
					GROUP BY path
					ORDER BY count(*) DESC
					LIMIT 10
				) p
			), '[]'::json) AS top_pages,
			COALESCE((
				SELECT json_agg(row_to_json(r))
				FROM (
					SELECT referrer, count(*)::int AS views
					FROM current
					WHERE referrer IS NOT NULL AND referrer != ''
					GROUP BY referrer
					ORDER BY count(*) DESC
					LIMIT 10
				) r
			), '[]'::json) AS top_referrers,
			COALESCE((
				SELECT json_agg(row_to_json(lp))
				FROM (
					-- One row per visitor (DISTINCT ON session_id), so count(*)
					-- IS the first-touch visitor count; the old extra
					-- count(DISTINCT session_id) column was always equal to it.
					SELECT path, count(*)::int AS visitors
					FROM (
						SELECT DISTINCT ON (session_id) session_id, path
						FROM current
						WHERE session_id IS NOT NULL AND session_id != ''
						ORDER BY session_id, created_at ASC, path ASC
					) first_pages
					GROUP BY path
					ORDER BY count(*) DESC
					LIMIT 10
				) lp
			), '[]'::json) AS top_landing_pages,
			COALESCE((
				SELECT json_agg(row_to_json(p))
				FROM (
					SELECT path, count(*)::int AS views, count(DISTINCT session_id)::int AS visitors
					FROM current
					WHERE path LIKE '/blog/%'
					GROUP BY path
					ORDER BY count(*) DESC
					LIMIT 10
				) p
			), '[]'::json) AS popular_posts,
			COALESCE((
				SELECT json_agg(row_to_json(c))
				FROM (
					-- Visitors, not page views. Same reasoning as the ua CTE
					-- above: the chart says "Countries" and a reader counts people.
					SELECT coalesce(country, 'Unknown') AS label,
					       count(DISTINCT NULLIF(session_id, ''))::int AS value
					FROM current
					GROUP BY coalesce(country, 'Unknown')
					ORDER BY count(DISTINCT NULLIF(session_id, '')) DESC
					LIMIT 10
				) c
			), '[]'::json) AS country_breakdown
	`);

	const row = rowsFromResult<AnalyticsDashboardRow>(result)[0];
	if (!row) {
		throw new Error('analytics dashboard query returned no rows');
	}

	const viewsPeriod = num(row.views_period);
	const viewsPeriodPrev = num(row.views_period_prev);
	const viewsShort = num(row.views_short);
	const visitorsPeriod = num(row.visitors_period);
	const visitorsPeriodPrev = num(row.visitors_period_prev);
	const visitorsShort = num(row.visitors_short);
	const sessionsPeriod = num(row.sessions_period);
	const sessionsPeriodPrev = num(row.sessions_period_prev);
	const singlePageSessions = num(row.single_page_sessions);
	const engagedSessions = num(row.engaged_sessions);
	const leadsPeriod = num(row.leads_period);
	const leadsPeriodPrev = num(row.leads_period_prev);

	return {
		overview: {
			views30d: viewsPeriod,
			views7d: viewsShort,
			visitors30d: visitorsPeriod,
			visitors7d: visitorsShort,
			views30dPrev: viewsPeriodPrev,
			visitors30dPrev: visitorsPeriodPrev,
			sessions30d: sessionsPeriod,
			sessions30dPrev: sessionsPeriodPrev,
			singlePageSessions,
			engagedSessions,
			bounceRate: pct(singlePageSessions, sessionsPeriod),
			engagementRate: pct(engagedSessions, sessionsPeriod),
			viewsPerSession:
				sessionsPeriod > 0 ? Math.round((viewsPeriod / sessionsPeriod) * 10) / 10 : 0,
			leads30d: leadsPeriod,
			leads30dPrev: leadsPeriodPrev,
			leadConversionRate: pct(leadsPeriod, visitorsPeriod),
			activeVisitors: num(row.active_visitors),
			windowDays: safeDays,
			shortWindowDays,
			source: 'postgres',
			lastUpdated: now,
			trends: {
				views30d: trendPct(viewsPeriod, viewsPeriodPrev),
				visitors30d: trendPct(visitorsPeriod, visitorsPeriodPrev),
				sessions30d: trendPct(sessionsPeriod, sessionsPeriodPrev),
				leads30d: trendPct(leadsPeriod, leadsPeriodPrev)
			}
		},
		// Dense series: zero-view days get explicit zero entries so the area
		// chart and sparklines stop drawing nonzero lines across dead days.
		dailyViews: fillDailySeries(
			arrayFromJson<DailyPageView>(row.daily_views).map((item) => ({
				date: String(item.date),
				views: num(item.views),
				visitors: num(item.visitors)
			})),
			safeDays,
			(date) => ({ date, views: 0, visitors: 0 }),
			now
		),
		topPages: arrayFromJson<TopPageAnalytics>(row.top_pages).map((item) => ({
			path: String(item.path),
			views: num(item.views),
			visitors: num(item.visitors)
		})),
		topReferrers: arrayFromJson<ReferrerAnalytics>(row.top_referrers).map((item) => ({
			referrer: item.referrer,
			views: num(item.views)
		})),
		topLandingPages: arrayFromJson<LandingPageAnalytics>(row.top_landing_pages).map((item) => ({
			path: String(item.path),
			visitors: num(item.visitors)
		})),
		popularPosts: arrayFromJson<TopPageAnalytics>(row.popular_posts).map((item) => ({
			path: String(item.path),
			views: num(item.views),
			visitors: num(item.visitors)
		})),
		browserBreakdown: normalizeBreakdown([
			{ label: 'Edge', value: num(row.browser_edge) },
			{ label: 'Opera', value: num(row.browser_opera) },
			{ label: 'Firefox', value: num(row.browser_firefox) },
			{ label: 'Chrome', value: num(row.browser_chrome) },
			{ label: 'Safari', value: num(row.browser_safari) },
			{ label: 'IE', value: num(row.browser_ie) },
			{ label: 'Other', value: num(row.browser_other) }
		]),
		deviceBreakdown: normalizeBreakdown([
			{ label: 'Mobile', value: num(row.device_mobile) },
			{ label: 'Tablet', value: num(row.device_tablet) },
			{ label: 'Desktop', value: num(row.device_desktop) }
		]),
		countryBreakdown: arrayFromJson<BreakdownItem>(row.country_breakdown).map((item) => ({
			label: String(item.label),
			value: num(item.value)
		}))
	};
}

export async function getAnalyticsDashboardData(
	days: number = 30
): Promise<AnalyticsDashboardData> {
	const safeDays = Math.max(1, Math.min(365, Math.trunc(days || 30)));
	const cached = analyticsDashboardCache.get(safeDays);
	const now = Date.now();
	if (cached && cached.expiresAt > now) return cached.value;
	const value = await fetchAnalyticsDashboardData(safeDays);
	analyticsDashboardCache.set(safeDays, {
		expiresAt: now + ANALYTICS_DASHBOARD_CACHE_TTL_MS,
		value
	});
	return value;
}

function weekKeyUtc(date: Date): string {
	const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
	const day = start.getUTCDay() || 7;
	start.setUTCDate(start.getUTCDate() - day + 1);
	return start.toISOString().slice(0, 10);
}

function compactNumber(value: number): string {
	if (value >= 10000) return `${Math.round(value / 1000)}k`;
	if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
	return value.toLocaleString();
}

export async function upsertWeeklyAnalyticsSummaryNotification(referenceDate = new Date()) {
	const data = await getAnalyticsDashboardData(7);
	const overview = data.overview;
	const topPage = data.topPages[0];
	const severity =
		overview.leads30d > 0 ? 'success' : overview.bounceRate >= 70 ? 'warning' : 'info';

	return upsertAdminNotification({
		type: 'analytics',
		severity,
		title: 'Weekly analytics summary',
		body: `${compactNumber(overview.views30d)} views, ${compactNumber(
			overview.visitors30d
		)} visitors, ${compactNumber(overview.leads30d)} leads${
			topPage ? ` · top page ${topPage.path}` : ''
		}.`,
		targetHref: '/admin/analytics',
		dedupeKey: `analytics:weekly:${weekKeyUtc(referenceDate)}`,
		metadata: {
			windowDays: overview.windowDays,
			views: overview.views30d,
			visitors: overview.visitors30d,
			sessions: overview.sessions30d,
			leads: overview.leads30d,
			bounceRate: overview.bounceRate,
			leadConversionRate: overview.leadConversionRate,
			topPage: topPage?.path ?? null
		},
		occurredAt: referenceDate
	});
}

/** Record a page view (non-blocking, called from hooks.server.ts) */
export async function recordPageView(data: {
	path: string;
	referrer?: string | undefined;
	userAgent?: string | undefined;
	sessionId?: string | undefined;
	country?: string | undefined;
}) {
	await db.insert(pageViews).values({
		path: data.path,
		referrer: data.referrer ?? null,
		userAgent: data.userAgent ?? null,
		sessionId: data.sessionId ?? null,
		country: data.country ?? null,
		createdAt: new Date()
	});
}

/** Get total page views count (excludes bot/admin/framework paths) */
export async function getPageViewsCount(since?: Date) {
	const conditions = [TRACKABLE];
	if (since) {
		conditions.push(sql`${pageViews.createdAt} >= ${since}`);
	}
	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(pageViews)
		.where(and(...conditions));
	return Number(result[0]?.count ?? 0);
}

/** Get unique visitors (by sessionId) — excludes bot/admin/framework paths */
export async function getUniqueVisitors(since?: Date) {
	const conditions = [TRACKABLE];
	if (since) {
		conditions.push(sql`${pageViews.createdAt} >= ${since}`);
	}
	const result = await db
		.select({ count: sql<number>`count(distinct ${pageViews.sessionId})` })
		.from(pageViews)
		.where(and(...conditions));
	return Number(result[0]?.count ?? 0);
}

/** Get daily page view counts for charting (filtered). Gap-filled:
 * zero-traffic days are present as explicit zeros so charts and
 * sparklines keep the real temporal shape (audit 2026-06-11). */
export async function getDailyPageViews(days: number = 30) {
	const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
	const result = await db
		.select({
			date: sql<string>`${pageViews.createdAt}::date`.as('date'),
			views: sql<number>`count(*)`.as('views'),
			visitors: sql<number>`count(distinct ${pageViews.sessionId})`.as('visitors')
		})
		.from(pageViews)
		.where(and(sql`${pageViews.createdAt} >= ${since}`, TRACKABLE))
		.groupBy(sql`${pageViews.createdAt}::date`)
		.orderBy(sql`${pageViews.createdAt}::date`);
	return fillDailySeries(
		result.map((row) => ({
			date: row.date,
			views: Number(row.views ?? 0),
			visitors: Number(row.visitors ?? 0)
		})),
		days,
		(date) => ({ date, views: 0, visitors: 0 })
	);
}

/** Get top pages by view count (filtered to public routes only) */
export async function getTopPages(limit: number = 10, days: number = 30) {
	const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
	const rows = await db
		.select({
			path: pageViews.path,
			views: sql<number>`count(*)`.as('views'),
			visitors: sql<number>`count(distinct ${pageViews.sessionId})`.as('visitors')
		})
		.from(pageViews)
		.where(and(sql`${pageViews.createdAt} >= ${since}`, TRACKABLE))
		.groupBy(pageViews.path)
		.orderBy(desc(sql`count(*)`))
		.limit(limit);
	return rows.map((row) => ({
		path: row.path,
		views: Number(row.views ?? 0),
		visitors: Number(row.visitors ?? 0)
	}));
}

/** Get top referrers (filtered) */
export async function getTopReferrers(limit: number = 10, days: number = 30) {
	const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
	const rows = await db
		.select({
			referrer: pageViews.referrer,
			views: sql<number>`count(*)`.as('views')
		})
		.from(pageViews)
		.where(
			and(
				sql`${pageViews.createdAt} >= ${since}`,
				sql`${pageViews.referrer} is not null and ${pageViews.referrer} != ''`,
				TRACKABLE
			)
		)
		.groupBy(pageViews.referrer)
		.orderBy(desc(sql`count(*)`))
		.limit(limit);
	return rows.map((row) => ({
		referrer: row.referrer,
		views: Number(row.views ?? 0)
	}));
}

/** Get popular blog posts by views. The /blog/% match is already public-
 * only by definition, but we layer the trackable filter for safety against
 * imaginative attacker probes like `/blog/.git`. */
export async function getPopularPosts(limit: number = 10, days: number = 30) {
	const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
	const rows = await db
		.select({
			path: pageViews.path,
			views: sql<number>`count(*)`.as('views'),
			visitors: sql<number>`count(distinct ${pageViews.sessionId})`.as('visitors')
		})
		.from(pageViews)
		.where(and(sql`${pageViews.createdAt} >= ${since}`, like(pageViews.path, '/blog/%'), TRACKABLE))
		.groupBy(pageViews.path)
		.orderBy(desc(sql`count(*)`))
		.limit(limit);
	return rows.map((row) => ({
		path: row.path,
		views: Number(row.views ?? 0),
		visitors: Number(row.visitors ?? 0)
	}));
}

/** Clean up old page views (retention policy) */
export async function cleanupOldPageViews(retentionDays: number = 90) {
	const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
	await db.delete(pageViews).where(sql`${pageViews.createdAt} < ${cutoff}`);
}

// ── Device / Browser / Country breakdowns ─────────────────────────────────
//
// These used to be three standalone queries with their own JS user-agent
// parsers, running ALONGSIDE the equivalent SQL inside the dashboard query.
// Two implementations of one metric, and nothing keeping them honest: the JS
// pair also fetched EVERY matching row's user agent into Node and counted in a
// loop, unbounded across the 90-day retention window.
//
// They now read the single dashboard query, so there is exactly one definition
// of "which browser is this" and one of "count visitors, not page views"
// (2026-07-28 audit). `getAnalyticsDashboardData` is request-cached, so the
// three remotes that call these share one round trip.

/** Browser breakdown, by VISITOR. Single source: the dashboard query. */
export async function getBrowserBreakdown(days: number = 30) {
	const { browserBreakdown } = await getAnalyticsDashboardData(days);
	return browserBreakdown;
}

/** Device breakdown (Desktop/Mobile/Tablet), by VISITOR. */
export async function getDeviceBreakdown(days: number = 30) {
	const { deviceBreakdown } = await getAnalyticsDashboardData(days);
	return deviceBreakdown;
}

/** Country breakdown, by VISITOR. `limit` is fixed at 10 by the shared query. */
export async function getCountryBreakdown(_limit: number = 10, days: number = 30) {
	void _limit;
	const { countryBreakdown } = await getAnalyticsDashboardData(days);
	return countryBreakdown;
}

// ============================================
// Daily traffic delta
// ============================================

export interface DailyDelta {
	yesterday: string; // YYYY-MM-DD
	visitorsYesterday: number;
	visitorsBaseline: number;
	deltaPct: number;
	direction: 'up' | 'down';
	enoughBaseline: boolean;
	worthNotifying: boolean;
}

/**
 * Compute yesterday's unique-visitor count vs the median of the 7
 * days before it. Returns `worthNotifying: false` for two cases:
 *   1. Baseline < 20 visits — too small for a meaningful percent
 *      change (a 25% swing on a 4-visit baseline is one extra visit).
 *   2. |delta| < 25% — the operator doesn't need a notification for
 *      day-to-day noise.
 */
export async function computeDailyAnalyticsDelta(now: Date = new Date()): Promise<DailyDelta> {
	const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
	const yesterdayStart = new Date(today.getTime() - 24 * 60 * 60 * 1000);
	const baselineStart = new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000);
	const trackable = sql.raw(TRACKABLE_PATH_LIKE_FRAGMENT);

	type Row = { day: Date; visitors: number };
	const rows = (await db
		.select({
			day: sql<Date>`date_trunc('day', ${pageViews.createdAt})`,
			visitors: sql<number>`count(DISTINCT ${pageViews.sessionId})::int`
		})
		.from(pageViews)
		.where(and(gte(pageViews.createdAt, baselineStart), lt(pageViews.createdAt, today), trackable))
		.groupBy(sql`date_trunc('day', ${pageViews.createdAt})`)) as Row[];

	const byDay = new Map<string, number>();
	for (const r of rows) {
		const key = (r.day instanceof Date ? r.day : new Date(r.day)).toISOString().slice(0, 10);
		byDay.set(key, Number(r.visitors));
	}

	const yesterdayKey = yesterdayStart.toISOString().slice(0, 10);
	const visitorsYesterday = byDay.get(yesterdayKey) ?? 0;
	const baselineValues: number[] = [];
	for (let i = 2; i <= 8; i++) {
		const day = new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
		baselineValues.push(byDay.get(day) ?? 0);
	}
	const baseline = median(baselineValues);
	const enoughBaseline = baseline >= 20;
	const delta = baseline > 0 ? (visitorsYesterday - baseline) / baseline : 0;
	const worthNotifying = enoughBaseline && Math.abs(delta) >= 0.25;

	return {
		yesterday: yesterdayKey,
		visitorsYesterday,
		visitorsBaseline: baseline,
		deltaPct: delta,
		direction: delta >= 0 ? 'up' : 'down',
		enoughBaseline,
		worthNotifying
	};
}

/**
 * Emit one notification for yesterday's traffic delta if the change
 * is worth surfacing. Idempotent via dedupeKey `analytics:daily:DATE`.
 */
export async function notifyDailyTrafficDelta(now: Date = new Date()) {
	const delta = await computeDailyAnalyticsDelta(now);
	if (!delta.worthNotifying) return null;
	const pctLabel = `${Math.round(Math.abs(delta.deltaPct) * 100)}%`;
	const arrow = delta.direction === 'up' ? '▲' : '▼';
	const severity = delta.direction === 'up' ? 'info' : 'warning';
	return upsertAdminNotification({
		type: 'analytics',
		severity,
		title: `Traffic ${delta.direction} ${pctLabel} vs 7-day median ${arrow}`,
		body: `Yesterday: ${delta.visitorsYesterday} visitors · 7-day median: ${delta.visitorsBaseline}.`,
		targetHref: '/admin/analytics',
		dedupeKey: `analytics:daily:${delta.yesterday}`,
		metadata: {
			yesterday: delta.yesterday,
			visitorsYesterday: delta.visitorsYesterday,
			visitorsBaseline: delta.visitorsBaseline,
			deltaPct: delta.deltaPct,
			direction: delta.direction
		},
		occurredAt: new Date(`${delta.yesterday}T23:59:59Z`),
		respectPreferences: true
	});
}

function median(values: number[]): number {
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

// ============================================
// Email engagement daily digest
// ============================================

export interface EmailEngagementSnapshot {
	date: string; // YYYY-MM-DD (UTC)
	sent: number;
	opens: number;
	clicks: number;
	bounces: number;
	complaints: number;
	openRate: number; // 0..1
	clickRate: number; // 0..1
}

/**
 * Compute email engagement KPIs for the UTC day containing `date`.
 *
 * Counts DISTINCT leadIds per event type — so an open + click on the
 * same email contributes 1 to each metric, not 2. Open/click rates
 * are computed as `events / sent`; when sent is 0, both rates are 0
 * (we never emit a divide-by-zero or NaN to the admin UI).
 */
export async function getEmailEngagementForDate(date: Date): Promise<EmailEngagementSnapshot> {
	const dayStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
	const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

	const rows = await db
		.select({
			event: emailEvents.event,
			leadCount: sql<number>`count(distinct ${emailEvents.leadId})::int`
		})
		.from(emailEvents)
		.where(and(gte(emailEvents.createdAt, dayStart), lt(emailEvents.createdAt, dayEnd)))
		.groupBy(emailEvents.event);

	const byEvent = new Map<string, number>();
	for (const row of rows) {
		byEvent.set(row.event, Number(row.leadCount ?? 0));
	}
	const sent = byEvent.get('delivered') ?? 0;
	const opens = byEvent.get('opened') ?? 0;
	const clicks = byEvent.get('clicked') ?? 0;
	const bounces = byEvent.get('bounced') ?? 0;
	const complaints = byEvent.get('complained') ?? 0;
	const openRate = sent > 0 ? opens / sent : 0;
	const clickRate = sent > 0 ? clicks / sent : 0;
	const dateStr = dayStart.toISOString().slice(0, 10);
	return { date: dateStr, sent, opens, clicks, bounces, complaints, openRate, clickRate };
}

/**
 * Emit one admin notification summarising yesterday's email
 * engagement. Idempotent via dedupeKey `email:engagement:${yyyy-mm-dd}`
 * — re-running the cron after a partial failure overwrites the row,
 * never duplicates it.
 *
 * Severity heuristic:
 *   - success: click_rate ≥ 3% (campaign performed; celebrate)
 *   - warning: sent > 0 AND open_rate < 10% (deliverability concern)
 *   - info:    everything else (baseline)
 *
 * Suppressed entirely when sent == 0 (no email activity to report;
 * no notification = no noise).
 */
export async function aggregateEmailEngagementForDate(date: Date) {
	const snap = await getEmailEngagementForDate(date);
	if (snap.sent === 0) return null;

	const severity = snap.clickRate >= 0.03 ? 'success' : snap.openRate < 0.1 ? 'warning' : 'info';
	const openPct = (snap.openRate * 100).toFixed(1);
	const clickPct = (snap.clickRate * 100).toFixed(1);

	return upsertAdminNotification({
		type: 'email',
		severity,
		title: `Email engagement, ${snap.date}`,
		body: `${snap.sent} sent · ${snap.opens} opens (${openPct}%) · ${snap.clicks} clicks (${clickPct}%)${
			snap.bounces > 0 ? ` · ${snap.bounces} bounces` : ''
		}${snap.complaints > 0 ? ` · ${snap.complaints} complaints` : ''}.`,
		targetHref: '/admin/email-analytics',
		dedupeKey: `email:engagement:${snap.date}`,
		metadata: {
			sent: snap.sent,
			opens: snap.opens,
			clicks: snap.clicks,
			bounces: snap.bounces,
			complaints: snap.complaints,
			openRate: snap.openRate,
			clickRate: snap.clickRate
		},
		occurredAt: new Date(`${snap.date}T23:59:59Z`),
		respectPreferences: true
	});
}

// Suppress unused-import linter for `eq` when callers above don't use it.
void eq;
