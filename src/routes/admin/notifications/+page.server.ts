/**
 * /admin/notifications — full-page notification inbox.
 *
 * The bell in the admin toolbar gives a quick "what's new" peek; this
 * page is the long-form view: filter by status, see every row with
 * its full metadata, mark read/unread/delete individually.
 *
 * Server load reads the filter from the URL (?status=all|unread|read)
 * so deep links + browser-back preserve the user's filter choice.
 * Limit is fixed at 50 (the service-layer cap); deeper history will
 * live in a follow-up "see older" pagination step if it becomes
 * useful — for a solo admin, 50 rows is usually weeks of history.
 */
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { listAdminNotifications } from '#lib/server/services/notifications.js';

type Status = 'all' | 'unread' | 'read';
const ALLOWED_STATUSES: Status[] = ['all', 'unread', 'read'];

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user?.role !== 'admin') error(401, 'Unauthorized');

	const statusParam = url.searchParams.get('status') ?? 'all';
	const status: Status = (ALLOWED_STATUSES as string[]).includes(statusParam)
		? (statusParam as Status)
		: 'all';

	const notifications = await listAdminNotifications({ status, limit: 50 });
	return { notifications, status };
};
