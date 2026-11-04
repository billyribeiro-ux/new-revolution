import type { RequestHandler } from './$types';
import { verifyCronAuthorization } from '#lib/server/services/cron.ts';
import { processOutbox, retainWaitlist } from '#lib/server/waitlist/service.ts';
import { deliver } from '#lib/server/waitlist/delivery.ts';
import { PRIVATE_HEADERS } from '#lib/server/waitlist/http.ts';
export const GET: RequestHandler = async ({ request }) => {
	const auth = verifyCronAuthorization(request.headers.get('authorization'));
	if (auth.status !== 200)
		return Response.json(
			{ error: 'Unauthorized' },
			{ status: auth.status, headers: PRIVATE_HEADERS }
		);
	try {
		const result = await processOutbox(deliver);
		await retainWaitlist();
		return Response.json(result, { headers: PRIVATE_HEADERS });
	} catch {
		return Response.json(
			{ error: 'Worker unavailable' },
			{ status: 503, headers: PRIVATE_HEADERS }
		);
	}
};

import { methodNotAllowed } from '#lib/server/waitlist/http.ts';
export const POST = methodNotAllowed('GET, HEAD'),
	PUT = methodNotAllowed('GET, HEAD'),
	PATCH = methodNotAllowed('GET, HEAD'),
	DELETE = methodNotAllowed('GET, HEAD'),
	OPTIONS = methodNotAllowed('GET, HEAD');
