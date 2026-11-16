import { db } from '#lib/server/db/index.js';
import { authEvents, type AuthEventType } from '#lib/server/db/schema.js';
import { logger } from '#lib/server/logger.js';

/**
 * Append-only audit log for auth state changes.
 *
 * Design:
 *   - Writes are fire-and-forget from hot paths: hand the promise to
 *     `backgroundTask` (`#lib/server/background.js`), which registers it with
 *     `waitUntil` so a frozen serverless instance cannot drop it. A bare
 *     `void` promise can be lost after the response. We never let an audit-log
 *     failure abort a user-facing action (write amplification or a transient
 *     DB failure on an unindexed table would silently lock admins out).
 *   - UA strings are truncated defensively — some bots send multi-KB values.
 *   - `metadata` is typed as a JSON-safe record. Do not pass objects with
 *     cycles, Buffers, or non-serialisable values.
 *
 * Read paths: queries by `(userId, createdAt desc)` or `(eventType, createdAt desc)`
 * are indexed in migration 0004.
 */

export interface AuthEventContext {
	ip?: string | null;
	userAgent?: string | null;
	metadata?: Record<string, unknown>;
}

const UA_MAX_LEN = 512;

export async function recordAuthEvent(
	eventType: AuthEventType,
	userId: number | null,
	success: boolean,
	ctx: AuthEventContext = {}
): Promise<void> {
	try {
		await db.insert(authEvents).values({
			userId,
			eventType,
			success,
			ip: ctx.ip ?? null,
			userAgent: ctx.userAgent?.slice(0, UA_MAX_LEN) ?? null,
			metadata: ctx.metadata ?? null
		});
	} catch (err) {
		// Never throw from an audit sink. Log-only so ops can notice a
		// degraded-audit condition, but the originating auth action proceeds.
		logger.error({ err, eventType }, '[audit] recordAuthEvent failed');
	}
}
