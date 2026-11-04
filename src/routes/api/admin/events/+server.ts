import { type RequestHandler } from '@sveltejs/kit';
import { requireAdmin } from '#lib/server/auth-guards.js';

/**
 * Event pipeline proxy — Rust server (Fly.io) has been decommissioned.
 * Returns empty/offline responses so dashboard pages degrade gracefully
 * instead of spamming 503s and WebSocket reconnect loops.
 */

/** GET /api/admin/events?endpoint=kpis|daily|top-pages|top-referrers|utm-campaigns|active */
export const GET: RequestHandler = async () => {
	requireAdmin();
	return Response.json({ error: 'Event pipeline offline' }, { status: 503 });
};

/** POST — previously returned WebSocket URL for real-time dashboard */
export const POST: RequestHandler = async () => {
	requireAdmin();
	return Response.json({ error: 'Event pipeline offline' }, { status: 503 });
};
