/**
 * Public click-beacon endpoint.
 *
 * Receives batched internal-link clicks from `+layout.svelte`'s
 * delegated click handler. Public — no auth — but rate-limited per
 * IP and Zod-validated to keep cost bounded.
 *
 * The data path is fire-and-forget from the browser's perspective:
 *   - `navigator.sendBeacon` on `pagehide` survives navigation
 *   - `fetch({ keepalive: true })` on the 2s flush timer doesn't
 *     show as XHR pending
 *
 * Server-side enrichment:
 *   - `country` from `x-vercel-ip-country` (Vercel edge header).
 *   - `userAgent` from the request, truncated to 256 chars to bound
 *     the column.
 *   - `sessionId` falls back to a SHA-256 fingerprint of (salt + ip +
 *     ua) if the client didn't send one. Matches the `page_views`
 *     fingerprint shape so the two tables JOIN cleanly for
 *     CTR-per-visitor analysis later.
 */
import type { RequestHandler } from './$types';
import { apiError, apiSuccess } from '#lib/server/api-response.js';
import { checkRateLimit } from '#lib/server/rate-limit.js';
import { recordClickEvents } from '#lib/server/services/click-tracking.js';
import { clickEventsBatchSchema } from '#lib/shared/schemas/click-events.js';
import { ANALYTICS_BOT_UA_PATTERN } from '#lib/server/analytics/path-filter.js';
import {
	fingerprintVisitor,
	getAnalyticsFingerprintSalt,
	logFingerprintSaltMissingOnce
} from '#lib/server/analytics/ingest.js';

/**
 * 60 clicks / 60s / IP. Looser than `/api/lead` (5/60s) because clicks
 * are inherently sparser per visitor; tight enough that a bot
 * hammering the endpoint hits the limiter quickly.
 */
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;
const UA_MAX = 256;

export const POST: RequestHandler = async ({ request, getClientAddress, locals }) => {
	let ip: string;
	try {
		ip = getClientAddress();
	} catch {
		// Prerender or unknown context — silently drop, never throw to the client.
		return apiSuccess({ recorded: 0 });
	}

	// The operator's own clicks are not content CTR, and JS-running
	// crawlers fire the capture listener like humans do. Ack-and-drop:
	// beacons are best-effort and an error would only invite retries
	// (audit 2026-06-11; operator decision: own visits must not count).
	const uaRaw = request.headers.get('user-agent') ?? '';
	if (locals.session || ANALYTICS_BOT_UA_PATTERN.test(uaRaw)) {
		return apiSuccess({ recorded: 0 });
	}

	const limit = await checkRateLimit(`click:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
	if (!limit.allowed) {
		return apiError('RATE_LIMITED', 'Rate limit exceeded', 429);
	}

	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return apiError('VALIDATION', 'Invalid JSON', 400);
	}

	const parsed = clickEventsBatchSchema.safeParse(payload);
	if (!parsed.success) {
		return apiError('VALIDATION', 'Invalid click batch', 400);
	}

	const ua = uaRaw.slice(0, UA_MAX);
	const country = request.headers.get('x-vercel-ip-country') ?? undefined;
	// Fail closed: no salt in production means fingerprints would be
	// reversible to (ip, ua). Beacons are best-effort, so ack-and-drop.
	// Uses the same salt + shape as /api/page-view so the tables JOIN.
	const salt = getAnalyticsFingerprintSalt();
	if (!salt) {
		logFingerprintSaltMissingOnce(locals.logger, 'click');
		return apiSuccess({ recorded: 0 });
	}
	const fallbackSessionId = fingerprintVisitor(salt, ip, ua);

	try {
		const recorded = await recordClickEvents(
			parsed.data.clicks.map((c) => ({
				sourcePath: c.sourcePath,
				targetPath: c.targetPath,
				targetHost: c.targetHost ?? null,
				linkText: c.linkText ?? null,
				sessionId: c.sessionId ?? fallbackSessionId,
				userAgent: ua,
				country
			}))
		);
		return apiSuccess({ recorded });
	} catch (err) {
		// Don't surface storage errors to the client — beacons must be
		// best-effort. Return 200 with recorded: 0 so a retry isn't
		// triggered; the client doesn't have anything useful to do
		// about a server-side insert failure. Log it, though: a silent
		// catch hid a dead click pipeline from operators.
		locals.logger.error({ err, op: 'record-clicks' }, '[track/click] recordClickEvents failed');
		return apiSuccess({ recorded: 0 });
	}
};
