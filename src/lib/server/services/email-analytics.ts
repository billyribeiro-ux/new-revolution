import { db } from '#lib/server/db/index.js';
import { sql } from 'drizzle-orm';
import { emailCohortSql } from './email-cohort';
import { fillDailySeries, trendPct, pct } from './metrics';

/**
 * Email Analytics Service — Resend email engagement tracking.
 */

export interface EmailMetrics {
	totalLeads: number;
	emailsSent: number;
	delivered: number;
	opened: number;
	clicked: number;
	bounced: number;
	complained: number;
	deliveryRate: number;
	openRate: number;
	clickRate: number;
	bounceRate: number;
	complaintRate: number;
	/**
	 * Period-over-period growth. `null` means no prior-period activity —
	 * UI should render "NEW" rather than a percentage. `0` means no change.
	 */
	trends: {
		emailsSent: number | null;
		openRate: number | null;
		clickRate: number | null;
	};
}

export interface DailyEmailStats {
	date: string;
	sent: number;
	delivered: number;
	opened: number;
	clicked: number;
}

export interface EmailFunnel {
	stage: string;
	count: number;
	percentage: number;
	dropoff: number;
}

/** Both periods use the same distinct-message cohort and delivered denominator. */
export async function getEmailMetrics(days: number = 30): Promise<EmailMetrics> {
	const now = new Date();
	const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
	const previous = new Date(since.getTime() - days * 24 * 60 * 60 * 1000);
	const result = await db.execute<Record<string, number>>(sql`
		WITH cohort AS (${emailCohortSql(previous, now)})
		SELECT
			(SELECT count(*)::int FROM leads WHERE deleted_at IS NULL AND created_at >= ${since.toISOString()}::timestamptz) AS total,
			count(*) FILTER (WHERE sent_at >= ${since.toISOString()}::timestamptz)::int AS sent,
			count(*) FILTER (WHERE sent_at >= ${since.toISOString()}::timestamptz AND delivered)::int AS delivered,
			count(*) FILTER (WHERE sent_at >= ${since.toISOString()}::timestamptz AND opened)::int AS opened,
			count(*) FILTER (WHERE sent_at >= ${since.toISOString()}::timestamptz AND clicked)::int AS clicked,
			count(*) FILTER (WHERE sent_at >= ${since.toISOString()}::timestamptz AND bounced)::int AS bounced,
			count(*) FILTER (WHERE sent_at >= ${since.toISOString()}::timestamptz AND complained)::int AS complained,
			count(*) FILTER (WHERE sent_at < ${since.toISOString()}::timestamptz)::int AS sent_prev,
			count(*) FILTER (WHERE sent_at < ${since.toISOString()}::timestamptz AND delivered)::int AS delivered_prev,
			count(*) FILTER (WHERE sent_at < ${since.toISOString()}::timestamptz AND opened)::int AS opened_prev,
			count(*) FILTER (WHERE sent_at < ${since.toISOString()}::timestamptz AND clicked)::int AS clicked_prev
		FROM cohort
	`);
	const r = result.rows[0] ?? {};
	const sent = Number(r['sent'] ?? 0),
		del = Number(r['delivered'] ?? 0);
	const open = Number(r['opened'] ?? 0),
		click = Number(r['clicked'] ?? 0);
	const bounce = Number(r['bounced'] ?? 0),
		complaint = Number(r['complained'] ?? 0);
	return {
		totalLeads: Number(r['total'] ?? 0),
		emailsSent: sent,
		delivered: del,
		opened: open,
		clicked: click,
		bounced: bounce,
		complained: complaint,
		deliveryRate: pct(del, sent),
		openRate: pct(open, del),
		clickRate: pct(click, del),
		bounceRate: pct(bounce, sent),
		complaintRate: pct(complaint, sent),
		trends: {
			emailsSent: trendPct(sent, Number(r['sent_prev'] ?? 0)),
			openRate: trendPct(
				pct(open, del),
				pct(Number(r['opened_prev'] ?? 0), Number(r['delivered_prev'] ?? 0))
			),
			clickRate: trendPct(
				pct(click, del),
				pct(Number(r['clicked_prev'] ?? 0), Number(r['delivered_prev'] ?? 0))
			)
		}
	};
}

/** Daily cohorts are grouped by send date, so every series shares a denominator. */
export async function getDailyEmailStats(days: number = 30): Promise<DailyEmailStats[]> {
	const now = new Date();
	const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
	const result = await db.execute<DailyEmailStats & Record<string, unknown>>(sql`
		WITH cohort AS (${emailCohortSql(since, now)})
		SELECT (sent_at AT TIME ZONE 'UTC')::date::text AS date, count(*)::int AS sent,
			count(*) FILTER (WHERE delivered)::int AS delivered,
			count(*) FILTER (WHERE opened)::int AS opened,
			count(*) FILTER (WHERE clicked)::int AS clicked
		FROM cohort GROUP BY 1 ORDER BY 1
	`);
	return fillDailySeries(result.rows, days, (date) => ({
		date,
		sent: 0,
		delivered: 0,
		opened: 0,
		clicked: 0
	}));
}

/**
 * Get email conversion funnel
 */
export async function getEmailFunnel(days: number = 30): Promise<EmailFunnel[]> {
	const metrics = await getEmailMetrics(days);

	const funnel: EmailFunnel[] = [
		{
			stage: 'Emails Sent',
			count: metrics.emailsSent,
			percentage: 100,
			dropoff: 0
		},
		{
			stage: 'Delivered',
			count: metrics.delivered,
			percentage: pct(metrics.delivered, metrics.emailsSent),
			dropoff: metrics.emailsSent - metrics.delivered
		},
		{
			stage: 'Opened',
			count: metrics.opened,
			percentage: pct(metrics.opened, metrics.emailsSent),
			dropoff: metrics.delivered - metrics.opened
		},
		{
			stage: 'Clicked',
			count: metrics.clicked,
			percentage: pct(metrics.clicked, metrics.emailsSent),
			dropoff: metrics.opened - metrics.clicked
		}
	];

	return funnel;
}

/**
 * Get top performing email campaigns (by source)
 */
export async function getTopEmailSources(limit: number = 10, days: number = 30) {
	const now = new Date();
	const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
	const result = await db.execute<{
		source: string | null;
		sent: number;
		opened: number;
		clicked: number;
	}>(sql`
		WITH cohort AS (${emailCohortSql(since, now)})
		SELECT source, count(*)::int AS sent, count(*) FILTER (WHERE opened)::int AS opened,
			count(*) FILTER (WHERE clicked)::int AS clicked
		FROM cohort GROUP BY source ORDER BY sent DESC LIMIT ${limit}
	`);
	return result.rows;
}
