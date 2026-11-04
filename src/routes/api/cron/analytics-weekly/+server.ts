import { dev } from '$app/env';
import * as env from '$app/env/private';
import { error, type RequestHandler } from '@sveltejs/kit';
import { apiSuccess } from '#lib/server/api-response.js';
import { upsertWeeklyAnalyticsSummaryNotification } from '#lib/server/services/analytics.js';

export const GET: RequestHandler = async ({ request }) => {
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

	const notification = await upsertWeeklyAnalyticsSummaryNotification();

	return apiSuccess({
		ok: true,
		notificationId: notification.id,
		dedupeKey: notification.dedupeKey
	});
};
