import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { softDeleteLead } from '#lib/server/services/leads.js';
import { requireAdmin } from '#lib/server/auth-guards.js';
import { checkRateLimit } from '#lib/server/rate-limit.js';

function parseIdParam(idParam: string): number {
	const id = parseInt(idParam, 10);
	if (isNaN(id) || id <= 0) {
		throw error(400, 'Invalid lead ID');
	}
	return id;
}

/**
 * DELETE /api/admin/leads/[id] — Move a lead to Trash (soft delete).
 *
 * Permanent deletion is intentionally not exposed on this endpoint.
 * To purge a row, the admin must first land it in Trash and then call
 * the dedicated remote command (`permanentlyDeleteLeadCmd` /
 * `emptyLeadsTrashCmd`). This mirrors the posts trash flow and the
 * desktop-recycle-bin mental model — DELETE here is recoverable, never
 * destructive.
 *
 * Rate-limited at 60 writes/min per IP to mirror the posts write quota
 * (see `/api/admin/posts/[id]/+server.ts`). A compromised admin session
 * cannot mass-trash leads without hitting the cap.
 */
export const DELETE: RequestHandler = async ({ params, getClientAddress }) => {
	requireAdmin();

	const limit = await checkRateLimit(`admin-leads-write:${getClientAddress()}`, 60);
	if (!limit.allowed) throw error(429, 'Too many requests');

	const id = parseIdParam(params.id);
	await softDeleteLead(id);
	return Response.json({ success: true });
};
