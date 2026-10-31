import { query } from '$app/server';
import { requireAdmin } from '#lib/server/auth-guards.js';
import { listSubscribers, exportSubscribersCsv } from '#lib/server/services/email-sequences.js';
import { subscriberListFiltersSchema } from '#lib/shared/schemas/subscribers.js';

/**
 * Subscribers roster: active lead-magnet signups with drip status. `search`
 * filters on the server, so it reaches rows beyond the capped page.
 * @boundary query - admin subscribers list
 */
export const fetchSubscribers = query(subscriberListFiltersSchema, async ({ search }) => {
	requireAdmin();
	return listSubscribers({ search });
});

/**
 * Export subscribers as CSV.
 * @boundary query - admin subscribers CSV
 */
export const fetchSubscribersCsv = query(async () => {
	requireAdmin();
	return exportSubscribersCsv();
});
