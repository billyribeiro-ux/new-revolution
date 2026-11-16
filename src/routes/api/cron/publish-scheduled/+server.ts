import { json, type RequestHandler } from '@sveltejs/kit';
import { runScheduledPublishSweep, verifyCronAuthorization } from '#lib/server/services/cron.ts';

export const GET: RequestHandler = async ({ request }) => {
	const authCheck = verifyCronAuthorization(request.headers.get('authorization'));
	if (authCheck.status !== 200) {
		return json(
			{ ok: false, error: authCheck.error },
			{ status: authCheck.status, headers: { 'Cache-Control': 'no-store' } }
		);
	}

	const result = await runScheduledPublishSweep();
	return json(
		{
			ok: true,
			requestId: result.requestId,
			published: result.published,
			archived: result.archived
		},
		{ status: 200, headers: { 'Cache-Control': 'no-store' } }
	);
};
