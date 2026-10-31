import { query } from '$app/server';
import { requireAdmin } from '#lib/server/auth-guards.js';
import { listScheduledCalls, exportCallsCsv } from '#lib/server/services/scheduled-calls.js';
import { callListFiltersSchema } from '#lib/shared/schemas/calls.js';

/**
 * Scheduled calls list with optional filters.
 * @boundary query - admin calls list
 */
export const fetchCalls = query(callListFiltersSchema, async (filters) => {
	requireAdmin();
	return listScheduledCalls(filters);
});

/**
 * Export scheduled calls as CSV.
 * @boundary query - admin calls CSV
 */
export const fetchCallsCsv = query(async () => {
	requireAdmin();
	return exportCallsCsv();
});
