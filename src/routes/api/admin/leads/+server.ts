import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listAllLeads } from '#lib/server/services/leads.js';
import { requireAdmin } from '#lib/server/auth-guards.js';
import { checkRateLimit } from '#lib/server/rate-limit.js';
import { parseQuery } from '#lib/server/api-response.js';
import { leadRestQuerySchema } from '#lib/shared/schemas/leads.js';

/** GET /api/admin/leads - List all leads */
export const GET: RequestHandler = async ({ url, getClientAddress }) => {
	requireAdmin();

	const limit = await checkRateLimit(`admin-leads-read:${getClientAddress()}`, 120);
	if (!limit.allowed) throw error(429, 'Too many requests');

	const query = parseQuery(url, leadRestQuerySchema, 'Invalid leads query');
	if (!query.ok) return query.response;
	const { status, limit: pageSize, offset } = query.data;
	return Response.json(await listAllLeads({ status, limit: pageSize, offset }));
};
