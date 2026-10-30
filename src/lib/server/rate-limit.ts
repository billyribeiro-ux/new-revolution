import { sql } from 'drizzle-orm';
import { ensureDbReady } from './db';
import { rateLimits } from './db/schema';

export const RATE_LIMIT_POST_WRITES_PER_MIN = 60;
export const RATE_LIMIT_MEDIA_UPLOAD_PER_MIN = 30;
export const RATE_LIMIT_MEDIA_WRITES_PER_MIN = 60;
export const RATE_LIMIT_PASSWORD_UNLOCK_ATTEMPTS = 10;
export const RATE_LIMIT_PASSWORD_UNLOCK_WINDOW_MS = 10 * 60 * 1000;

const memoryBuckets = new Map<string, { count: number; resetAtMs: number }>();

export function clearRateLimitsForTest(): void {
	memoryBuckets.clear();
}

export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	resetAt: Date;
}

function consumeInMemory(key: string, limit: number, windowMs: number): RateLimitResult {
	const now = Date.now();
	const current = memoryBuckets.get(key);

	if (!current || current.resetAtMs <= now) {
		const resetAtMs = now + windowMs;
		memoryBuckets.set(key, { count: 1, resetAtMs });
		return {
			allowed: true,
			remaining: Math.max(0, limit - 1),
			resetAt: new Date(resetAtMs)
		};
	}

	current.count += 1;
	return {
		allowed: current.count <= limit,
		remaining: Math.max(0, limit - current.count),
		resetAt: new Date(current.resetAtMs)
	};
}

/**
 * Postgres-backed rate limiter with in-memory fallback (Section 7.16).
 */
export async function consumeRateLimit(options: {
	key: string;
	limit: number;
	windowMs: number;
}): Promise<RateLimitResult> {
	const { key, limit, windowMs } = options;
	const now = new Date();
	const nextReset = new Date(now.getTime() + windowMs);

	try {
		const db = await ensureDbReady();
		const rows = await db
			.insert(rateLimits)
			.values({
				key,
				count: 1,
				resetAt: nextReset
			})
			.onConflictDoUpdate({
				target: rateLimits.key,
				set: {
					count: sql`CASE WHEN ${rateLimits.resetAt} <= ${now.toISOString()}::timestamptz THEN 1 ELSE ${rateLimits.count} + 1 END`,
					resetAt: sql`CASE WHEN ${rateLimits.resetAt} <= ${now.toISOString()}::timestamptz THEN ${nextReset.toISOString()}::timestamptz ELSE ${rateLimits.resetAt} END`
				}
			})
			.returning();

		const row = rows[0];
		if (!row) {
			return consumeInMemory(key, limit, windowMs);
		}

		return {
			allowed: row.count <= limit,
			remaining: Math.max(0, limit - row.count),
			resetAt: row.resetAt instanceof Date ? row.resetAt : new Date(row.resetAt)
		};
	} catch {
		return consumeInMemory(key, limit, windowMs);
	}
}
