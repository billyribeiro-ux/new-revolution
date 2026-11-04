/**
 * Daily analytics cron — runs at 14:00 UTC every day (one hour after
 * the Monday 13:00 weekly cron's slot to avoid a Neon connection
 * stampede). Configured in vercel.json.
 *
 * Five jobs, run in order, all idempotent so re-runs after partial
 * failure converge to correct state:
 *
 *   1. `notifyDailyTrafficDelta` — yesterday's visitors vs 7-day
 *      median. Suppresses on cold-start days (baseline < 20) and
 *      noise (|delta| < 25%).
 *   2. `rollupClicksToHourly` — aggregates raw `click_events` into
 *      the hourly rollup table. ON CONFLICT DO UPDATE so a re-run
 *      replaces stale rollup rows with the current truth.
 *   3. `detectCtrAnomalies` — flags target_paths whose volume
 *      deviates ≥40% from their 7-day median (with min 50 clicks /
 *      30 uniques to suppress low-traffic noise). Emits one
 *      `ctr:daily:<date>:<target>` notification per anomaly.
 *   4. `aggregateEmailEngagementForDate(yesterday)` — one daily
 *      digest of sent / opens / clicks / bounces / complaints from
 *      Resend webhook events.
 *   5. `purgeRawClickEvents(now - 30d)` — hard-deletes raw click
 *      events older than 30 days. The hourly rollup survives.
 *   6. `purgeExpiredConsentRecords()` — hard-deletes consent records
 *      past CONSENT_RETENTION_DAYS (730). GDPR Art. 5(1)(e) storage
 *      limitation. This function existed since #249 but nothing called
 *      it, on a timer or otherwise, so the retention period was policy
 *      only and never enforced (docs/OPEN-ITEMS.md 2.1). It lives here
 *      rather than in a new cron because this job is already the daily
 *      retention sweep, and a fifth vercel.json cron would cost a slot
 *      for work that fits an existing one.
 *
 * Auth: CRON_SECRET bearer header. Mirrors the weekly cron exactly.
 *
 * A failed job does not fail the run: its message goes into the 200 summary
 * (the response contract) AND is logged at error with the job name, so a
 * failing consent purge pages someone instead of hiding in a cron response.
 */
import { dev } from '$app/env';
import * as env from '$app/env/private';
import { error, type RequestHandler } from '@sveltejs/kit';
import { apiSuccess } from '#lib/server/api-response.js';
import {
	aggregateEmailEngagementForDate,
	notifyDailyTrafficDelta
} from '#lib/server/services/analytics.js';
import {
	detectCtrAnomalies,
	purgeRawClickEvents,
	rollupClicksToHourly
} from '#lib/server/services/click-tracking.js';
import { upsertAdminNotification } from '#lib/server/services/notifications.js';
import { purgeExpiredConsentRecords } from '#lib/server/services/consent.js';

export const GET: RequestHandler = async ({ request, locals }) => {
	const secret = env['CRON_SECRET'];
	if (!dev && !secret) {
		throw error(500, 'CRON_SECRET not configured');
	}
	if (secret) {
		const header = request.headers.get('authorization');
		if (header !== `Bearer ${secret}`) {
			throw error(401, 'Unauthorized');
		}
	}

	const now = new Date();
	const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
	const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

	/** Log a failed job at error and return its summary entry. */
	const failed = (job: string, err: unknown) => {
		locals.logger.error({ err, job }, `[cron/analytics-daily] ${job} failed`);
		return { error: err instanceof Error ? err.message : 'unknown' };
	};

	const summary: Record<string, unknown> = {
		ok: true,
		trafficDelta: null,
		clickRollupRows: 0,
		ctrAnomalies: 0,
		emailEngagement: null,
		clickEventsPurged: 0
	};

	// 1. Traffic delta
	try {
		const trafficNote = await notifyDailyTrafficDelta(now);
		summary['trafficDelta'] = trafficNote
			? { id: trafficNote.id, dedupeKey: trafficNote.dedupeKey }
			: 'suppressed';
	} catch (err) {
		summary['trafficDelta'] = failed('traffic-delta', err);
	}

	// 2. Rebuild the retained raw window so missed cron runs can recover.
	let clickRollupSucceeded = false;
	try {
		summary['clickRollupRows'] = await rollupClicksToHourly(null);
		clickRollupSucceeded = true;
	} catch (err) {
		summary['clickRollupRows'] = failed('click-rollup', err);
	}

	// 3. CTR anomalies — emit one notification per anomaly. Respect prefs
	//    so an operator on quiet hours doesn't get woken up.
	try {
		const anomalies = await detectCtrAnomalies(yesterday);
		summary['ctrAnomalies'] = anomalies.length;
		for (const a of anomalies) {
			const pctLabel = `${Math.round(Math.abs(a.deltaPct) * 100)}%`;
			const arrow = a.direction === 'up' ? '▲' : '▼';
			const severity = a.direction === 'up' ? 'info' : 'warning';
			await upsertAdminNotification({
				type: 'analytics',
				severity,
				title: `CTR ${a.direction} ${pctLabel} on ${a.targetPath} ${arrow}`,
				body: `Yesterday: ${a.clicks} clicks · 7-day median: ${a.medianClicks}.`,
				targetHref: '/admin/analytics',
				dedupeKey: `ctr:daily:${yesterday.toISOString().slice(0, 10)}:${a.targetPath}`,
				metadata: {
					targetPath: a.targetPath,
					clicks: a.clicks,
					uniques: a.uniques,
					medianClicks: a.medianClicks,
					deltaPct: a.deltaPct,
					direction: a.direction
				},
				occurredAt: yesterday,
				respectPreferences: true
			});
		}
	} catch (err) {
		summary['ctrAnomalies'] = failed('ctr-anomalies', err);
	}

	// 4. Email engagement digest
	try {
		const emailNote = await aggregateEmailEngagementForDate(yesterday);
		summary['emailEngagement'] = emailNote
			? { id: emailNote.id, dedupeKey: emailNote.dedupeKey }
			: 'no-activity';
	} catch (err) {
		summary['emailEngagement'] = failed('email-engagement', err);
	}

	// 5. Purge raw click events older than 30 days
	try {
		if (clickRollupSucceeded) {
			// Keep whole raw hours; the next rollup must not overwrite a partial bucket.
			thirtyDaysAgo.setUTCMinutes(0, 0, 0);
			summary['clickEventsPurged'] = await purgeRawClickEvents(thirtyDaysAgo);
		} else summary['clickEventsPurged'] = 'skipped: rollup failed';
	} catch (err) {
		summary['clickEventsPurged'] = failed('click-purge', err);
	}

	// 6. Enforce the consent retention window (GDPR Art. 5(1)(e)).
	//    The cutoff is computed inside the service from CONSENT_RETENTION_DAYS;
	//    `now` is passed explicitly so the boundary is testable.
	try {
		const consentPurge = await purgeExpiredConsentRecords(now);
		summary['consentRecordsPurged'] = consentPurge.deleted;
		summary['consentCutoff'] = consentPurge.cutoff.toISOString();
	} catch (err) {
		summary['consentRecordsPurged'] = failed('consent-retention-purge', err);
	}

	return apiSuccess(summary);
};
