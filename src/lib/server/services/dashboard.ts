import { db } from '#lib/server/db/index.js';
import { posts, leads, contactSubmissions, pageViews } from '#lib/server/db/schema.js';
import { sql, desc, isNull } from 'drizzle-orm';
import { fillDailySeries, trendPct, pct } from './metrics';
import { countableLeadsSql } from './leads';
import { emailCohortSql } from './email-cohort';
import { TRACKABLE_PATH_LIKE_FRAGMENT } from '#lib/server/analytics/path-filter.js';

/**
 * Single-round-trip dashboard KPI bundle.
 *
 * Previously this fanned out into 19 separate Drizzle queries (11 here +
 * 8 inside `getUnifiedMetrics`) running through `Promise.all`. Each one
 * was an independent HTTPS POST through `neon-http`, and the gateway
 * serialised concurrent connections per session — so switching the
 * dashboard range selector took several seconds while 19 round-trips
 * drained.
 *
 * The replacement collapses every count into a single Postgres `SELECT`
 * via scalar subqueries. Postgres plans them as parallel-safe count(*)
 * scans backed by `page_views_created_at_idx` / `leads_created_at_idx`,
 * and the whole response comes back in one TLS round-trip (~150ms total
 * end-to-end vs ~2s before).
 *
 * The trackable-path filter is applied via `TRACKABLE_PATH_LIKE_FRAGMENT`
 * so the same predicate that gates ingestion + dashboard queries also
 * gates this batched count — no admin-route or bot-probe leaks into
 * Page Views / Visitors KPI cards.
 */
async function fetchDashboardKPIs(days: number = 30) {
	const now = new Date();
	const safeDays = Math.max(1, days);
	const shortWindowDays = Math.min(7, safeDays);
	const tPeriod = new Date(now.getTime() - safeDays * 24 * 60 * 60 * 1000);
	const tPrevPeriod = new Date(now.getTime() - safeDays * 2 * 24 * 60 * 60 * 1000);
	const tShort = new Date(now.getTime() - shortWindowDays * 24 * 60 * 60 * 1000);
	const tPrevShort = new Date(now.getTime() - shortWindowDays * 2 * 24 * 60 * 60 * 1000);

	// Pre-build the trackable fragment once so the SQL template stays readable.
	const trackable = sql.raw(TRACKABLE_PATH_LIKE_FRAGMENT);

	type KpiRow = {
		total_posts: number;
		published_posts: number;
		unread_contacts: number;
		leads_period: number;
		leads_period_prev: number;
		leads_short: number;
		leads_short_prev: number;
		emails_sent: number;
		emails_delivered: number;
		emails_opened: number;
		emails_clicked: number;
		views_period: number;
		views_period_prev: number;
		views_short: number;
		views_short_prev: number;
		visitors_period: number;
		visitors_period_prev: number;
		visitors_short: number;
		visitors_short_prev: number;
	};

	const result = await db.execute<KpiRow>(sql`
		WITH email_cohort AS (${emailCohortSql(tPeriod, now)})
		SELECT
			(SELECT count(*) FROM ${posts} WHERE deleted_at IS NULL) AS total_posts,
			(SELECT count(*) FROM ${posts} WHERE status = 'published' AND deleted_at IS NULL) AS published_posts,
			(SELECT count(*) FROM ${contactSubmissions} WHERE status = 'unread') AS unread_contacts,
			(SELECT count(*) FROM ${leads} WHERE created_at >= ${tPeriod} AND ${countableLeadsSql}) AS leads_period,
			(SELECT count(*) FROM ${leads} WHERE created_at >= ${tPrevPeriod} AND created_at < ${tPeriod} AND ${countableLeadsSql}) AS leads_period_prev,
			(SELECT count(*) FROM ${leads} WHERE created_at >= ${tShort} AND ${countableLeadsSql}) AS leads_short,
			(SELECT count(*) FROM ${leads} WHERE created_at >= ${tPrevShort} AND created_at < ${tShort} AND ${countableLeadsSql}) AS leads_short_prev,
			(SELECT count(*) FROM email_cohort) AS emails_sent,
			(SELECT count(*) FROM email_cohort WHERE delivered) AS emails_delivered,
			(SELECT count(*) FROM email_cohort WHERE opened) AS emails_opened,
			(SELECT count(*) FROM email_cohort WHERE clicked) AS emails_clicked,
			(SELECT count(*) FROM ${pageViews} WHERE created_at >= ${tPeriod} AND ${trackable}) AS views_period,
			(SELECT count(*) FROM ${pageViews} WHERE created_at >= ${tPrevPeriod} AND created_at < ${tPeriod} AND ${trackable}) AS views_period_prev,
			(SELECT count(*) FROM ${pageViews} WHERE created_at >= ${tShort} AND ${trackable}) AS views_short,
			(SELECT count(*) FROM ${pageViews} WHERE created_at >= ${tPrevShort} AND created_at < ${tShort} AND ${trackable}) AS views_short_prev,
			(SELECT count(DISTINCT session_id) FROM ${pageViews} WHERE created_at >= ${tPeriod} AND ${trackable}) AS visitors_period,
			(SELECT count(DISTINCT session_id) FROM ${pageViews} WHERE created_at >= ${tPrevPeriod} AND created_at < ${tPeriod} AND ${trackable}) AS visitors_period_prev,
			(SELECT count(DISTINCT session_id) FROM ${pageViews} WHERE created_at >= ${tShort} AND ${trackable}) AS visitors_short,
			(SELECT count(DISTINCT session_id) FROM ${pageViews} WHERE created_at >= ${tPrevShort} AND created_at < ${tShort} AND ${trackable}) AS visitors_short_prev
	`);

	// neon-http returns NeonHttpQueryResult ({ rows, rowCount, ... }); the
	// shape varies slightly from drizzle's pg driver, so normalise to an array.
	const rows = (
		Array.isArray(result) ? result : ((result as { rows?: KpiRow[] }).rows ?? [])
	) as KpiRow[];
	const r = rows[0];
	if (!r) {
		throw new Error('dashboard KPI batch query returned no rows');
	}

	const num = (v: unknown): number => Number(v ?? 0);

	const v30 = num(r.views_period);
	const v30p = num(r.views_period_prev);
	const v7 = num(r.views_short);
	const v7p = num(r.views_short_prev);
	const vis30 = num(r.visitors_period);
	const vis30p = num(r.visitors_period_prev);
	const vis7 = num(r.visitors_short);
	const vis7p = num(r.visitors_short_prev);
	const l30 = num(r.leads_period);
	const l30p = num(r.leads_period_prev);
	const l7 = num(r.leads_short);
	const l7p = num(r.leads_short_prev);
	const sent = num(r.emails_sent);
	const delivered = num(r.emails_delivered);
	const opened = num(r.emails_opened);
	const clicked = num(r.emails_clicked);

	return {
		totalPosts: num(r.total_posts),
		publishedPosts: num(r.published_posts),
		leads30d: l30,
		leads7d: l7,
		views30d: v30,
		views7d: v7,
		uniqueVisitors30d: vis30,
		uniqueVisitors7d: vis7,
		// Previous-period values were computed for `trends` below and then
		// thrown away, so the dashboard could not use `KpiCard` (which derives
		// its own trend from value + previousValue) and hand-rolled static cards
		// instead. Exposing them lets both admin pages share one card component
		// (2026-07-28 audit).
		leads30dPrev: l30p,
		views30dPrev: v30p,
		uniqueVisitors30dPrev: vis30p,
		// Same definition as /admin/analytics: leads over unique visitors, via
		// the shared `pct` helper. The dashboard simply did not surface this
		// metric, so the two admin pages disagreed on what they showed rather
		// than on how they computed it. One helper, one formula (2026-07-28).
		leadConversionRate: pct(l30, vis30),
		leadConversionRatePrev: pct(l30p, vis30p),
		unreadContacts: num(r.unread_contacts),
		emailsSent30d: sent,
		emailDelivered30d: delivered,
		emailOpened30d: opened,
		emailClicked30d: clicked,
		windowDays: safeDays,
		shortWindowDays,
		emailOpenRate: delivered > 0 ? Math.round((opened / delivered) * 100) : 0,
		emailClickRate: delivered > 0 ? Math.round((clicked / delivered) * 100) : 0,
		emailClickToOpenRate: opened > 0 ? Math.round((clicked / opened) * 100) : 0,
		analyticsSource: 'postgres' as const,
		trends: {
			leads30d: trendPct(l30, l30p),
			leads7d: trendPct(l7, l7p),
			views30d: trendPct(v30, v30p),
			views7d: trendPct(v7, v7p),
			uniqueVisitors30d: trendPct(vis30, vis30p),
			uniqueVisitors7d: trendPct(vis7, vis7p)
		}
	};
}

/** Get recent activity feed for dashboard */
export async function getRecentActivity(limit: number = 15) {
	const [recentLeads, recentContacts, recentPosts] = await Promise.all([
		db
			.select({
				id: leads.id,
				email: leads.email,
				source: leads.source,
				createdAt: leads.createdAt
			})
			.from(leads)
			.where(countableLeadsSql)
			.orderBy(desc(leads.createdAt))
			.limit(limit),

		db
			.select({
				id: contactSubmissions.id,
				name: contactSubmissions.name,
				email: contactSubmissions.email,
				status: contactSubmissions.status,
				createdAt: contactSubmissions.createdAt
			})
			.from(contactSubmissions)
			.orderBy(desc(contactSubmissions.createdAt))
			.limit(limit),

		db
			.select({
				id: posts.id,
				title: posts.title,
				status: posts.status,
				createdAt: posts.createdAt,
				publishedAt: posts.publishedAt
			})
			.from(posts)
			.where(isNull(posts.deletedAt))
			.orderBy(desc(posts.createdAt))
			.limit(limit)
	]);

	type ActivityItem = {
		type: 'lead' | 'contact' | 'post';
		id: number;
		title: string;
		subtitle: string;
		timestamp: Date | null;
	};

	const activities: ActivityItem[] = [
		...recentLeads.map((l) => ({
			type: 'lead' as const,
			id: l.id,
			title: l.email,
			subtitle: `New lead from ${l.source ?? 'unknown'}`,
			timestamp: l.createdAt
		})),
		...recentContacts.map((c) => ({
			type: 'contact' as const,
			id: c.id,
			title: c.name,
			subtitle: `${c.email}, ${c.status}`,
			timestamp: c.createdAt
		})),
		...recentPosts.map((p) => ({
			type: 'post' as const,
			id: p.id,
			title: p.title,
			// status is the canonical lifecycle column; the legacy boolean
			// mislabeled scheduled/archived posts as Draft/Published.
			subtitle: p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : 'Draft',
			timestamp: p.publishedAt ?? p.createdAt
		}))
	];

	activities.sort((a, b) => {
		const aTime = a.timestamp?.getTime() ?? 0;
		const bTime = b.timestamp?.getTime() ?? 0;
		return bTime - aTime;
	});

	return activities.slice(0, limit);
}

/** Get daily leads for charting. Gap-filled: days with zero leads are
 * present as explicit zeros so index-positioned bars keep real cadence
 * (audit 2026-06-11). */
export async function getDailyLeads(days: number = 30) {
	const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
	const rows = await db
		.select({
			date: sql<string>`${leads.createdAt}::date`.as('date'),
			count: sql<number>`count(*)`.as('count')
		})
		.from(leads)
		.where(sql`${leads.createdAt} >= ${since} AND ${countableLeadsSql}`)
		.groupBy(sql`${leads.createdAt}::date`)
		.orderBy(sql`${leads.createdAt}::date`);
	return fillDailySeries(
		rows.map((row) => ({
			date: row.date,
			count: Number(row.count ?? 0)
		})),
		days,
		(date) => ({ date, count: 0 })
	);
}

/** Get all dashboard KPIs with trend vs prior period (live) */
export async function getDashboardKPIs() {
	// Intentionally uncached so admin dashboard reflects near-real-time DB state.
	return fetchDashboardKPIs();
}

/** Get all dashboard KPIs with custom time window (live) */
export async function getDashboardKPIsForDays(days: number) {
	// Intentionally uncached so admin dashboard reflects near-real-time DB state.
	return fetchDashboardKPIs(days);
}
