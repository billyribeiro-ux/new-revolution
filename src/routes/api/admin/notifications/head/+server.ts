import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { getNotificationHead } from '#lib/server/services/notifications.js';

/**
 * Cheap "is there anything new?" probe for the admin notification bell.
 *
 * Polled every 20 seconds by `NotificationBell.svelte` while an admin
 * session is active in the foreground tab. Two reasons it exists
 * separately from the full `fetchAdminNotifications` remote function:
 *
 *   1. **Bandwidth**: returns 3 small numbers instead of N full rows.
 *      The bell only needs the count + a change-detection key to
 *      decide whether to refresh its dropdown list.
 *   2. **ETag short-circuit**: subsequent polls send `If-None-Match`
 *      and get a 304 with no body when nothing has changed. Cuts the
 *      cheap-path latency from ~80ms (full query) to ~15ms (header
 *      compare only, no DB read past it). At the solo-admin polling
 *      cadence (8h/day, 20s active interval), this is ~80% of polls.
 *
 * ETag format: `"${unread}:${maxId}"`. unread is monotonic-decreasing
 * as rows get read; maxId is monotonic-increasing as rows get inserted.
 * Together the tuple is a perfect change-detection key — any
 * notification write OR mark-read action mutates one of the two.
 *
 * Auth: requires an admin session via `event.locals.user.isAdmin`. The
 * existing `authGate` in `hooks.server.ts` already 401s unauthenticated
 * calls to `/api/admin/*` prefixes, but we double-check here so a
 * future hook re-ordering can't silently open the endpoint.
 *
 * Cache-Control: `private, must-revalidate` so the browser keeps the
 * ETag stored against the URL but always re-asks the server. No edge
 * caching — this is per-admin data.
 */
export const GET: RequestHandler = async ({ locals, request, setHeaders }) => {
	if (locals.user?.role !== 'admin') error(401, 'Unauthorized');

	let head: Awaited<ReturnType<typeof getNotificationHead>>;
	try {
		head = await getNotificationHead();
	} catch (err) {
		// The bell polls this every 20s; a raw 500 here leaks the Postgres error
		// to the client and gives us no correlated server log. Log with the
		// request-scoped logger (correlated by reqId via handleError),
		// and return 503 so the poller's `!response.ok` guard skips this tick and
		// retries on the next interval instead of surfacing the DB internals.
		locals.logger.error({ err }, '[notifications/head] getNotificationHead failed');
		error(503, 'Notification head temporarily unavailable');
	}

	const etag = `"${head.unread}:${head.maxId ?? 0}"`;
	const ifNoneMatch = request.headers.get('if-none-match');

	setHeaders({
		'cache-control': 'private, must-revalidate',
		etag
	});

	if (ifNoneMatch === etag) {
		return new Response(null, {
			status: 304,
			headers: { etag, 'cache-control': 'private, must-revalidate' }
		});
	}

	return new Response(
		JSON.stringify({
			unread: head.unread,
			maxId: head.maxId,
			latestOccurredAt: head.latestOccurredAt?.toISOString() ?? null
		}),
		{
			status: 200,
			headers: { 'content-type': 'application/json', etag }
		}
	);
};
