import type { RequestHandler } from './$types';
import { VERCEL_GIT_COMMIT_SHA } from '$app/env/private';
import { version as PACKAGE_VERSION } from '../../../../package.json';

import { sql } from 'drizzle-orm';
import { db } from '#lib/server/db/index.js';
import { hasAnalyticsFingerprintSalt } from '#lib/server/analytics/ingest.js';

const BOOT_AT = Date.now();
// Short commit SHA on Vercel (scripts/db/sync-lock.ts verifies deploys with
// it); the package.json version elsewhere, as docs/runbooks/observability.md
// documents. Read through Kit's env model, not process.env.
const VERSION = VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? PACKAGE_VERSION;

/**
 * Liveness + readiness probe.
 *
 * Returns 200 with `{ status: 'ok' }` when the server can answer requests AND
 * round-trip a trivial query against Postgres. Returns 503 on DB failure so
 * external monitors (Vercel, UptimeRobot, etc.) page the right team without
 * a custom log query.
 *
 * Intentionally cheap: a single `SELECT 1` and no auth — anyone hitting this
 * endpoint already knows the URL exists. The response is `Cache-Control:
 * no-store` so probes always see live state, never an edge-cached snapshot.
 *
 * `analytics.ok` reports whether ANALYTICS_FINGERPRINT_SALT is non-empty.
 * A false value does not change HTTP status (site stays up; first-party
 * beacons fail closed). Operators / monitors should alert on
 * `analytics.ok === false` separately from DB readiness.
 *
 * The structured envelope is documented in docs/runbooks/observability.md.
 */
export const GET: RequestHandler = async ({ locals }) => {
	const startedAt = Date.now();
	let dbOk = false;
	let dbLatencyMs = 0;
	try {
		const t0 = performance.now();
		await db.execute(sql`select 1`);
		dbLatencyMs = Math.round(performance.now() - t0);
		dbOk = true;
	} catch (err) {
		locals.logger.error({ err }, '[health] DB ping failed');
	}

	const analyticsOk = hasAnalyticsFingerprintSalt();

	const body = {
		status: dbOk ? 'ok' : 'degraded',
		db: dbOk ? { ok: true, latencyMs: dbLatencyMs } : { ok: false },
		analytics: analyticsOk
			? { ok: true as const }
			: { ok: false as const, reason: 'fingerprint_salt_missing' as const },
		uptimeMs: startedAt - BOOT_AT,
		version: VERSION,
		requestId: locals.reqId
	};

	return Response.json(body, {
		status: dbOk ? 200 : 503,
		headers: { 'Cache-Control': 'no-store, max-age=0' }
	});
};
