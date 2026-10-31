/**
 * Page-view beacon ingest.
 *
 * Replaces the old hooks.server.ts document-load ingest (forensic audit
 * 2026-06-11, two CRITICAL findings): (1) pages served from the Vercel
 * edge cache never reached the server hook, so traffic was undercounted
 * exactly when the site was busiest; (2) SvelteKit client-side
 * navigations produced no document load, so every multi-page visit
 * looked like a single-page bounce. The root layout now beacons every
 * navigation (initial load AND SPA navigations) here.
 *
 * Posture is unchanged from the hook it replaces: cookieless, the
 * visitor pseudonym is derived SERVER-side (sha256(salt + ip + ua), so
 * the client cannot choose its identity), and the same single-source
 * filters apply: isTrackablePath, the shared bot UA list, and the
 * operator's own sessions are dropped. Known trade-off: visitors with
 * JS disabled are no longer counted (they previously were); bots
 * without JS disappear with them, which is a net accuracy gain.
 */
import { type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';
import { checkRateLimit } from '#lib/server/rate-limit.js';
import { recordPageView } from '#lib/server/services/analytics.js';
import { ANALYTICS_BOT_UA_PATTERN, isTrackablePath } from '#lib/server/analytics/path-filter.js';
import {
	externalReferrerOf,
	fingerprintVisitor,
	getAnalyticsFingerprintSalt,
	logFingerprintSaltMissingOnce
} from '#lib/server/analytics/ingest.js';
import { siteConfig } from '#lib/config/site.js';

const internalHostnames = new Set([new URL(siteConfig.url).hostname]);

const payloadSchema = z.object({
	/** pathname only (no query/hash); isTrackablePath enforces the shape */
	path: z.string().min(1).max(256),
	/** document.referrer, sent on the initial load only */
	referrer: z.string().max(2048).optional()
});

export const POST: RequestHandler = async ({ request, getClientAddress, locals, url }) => {
	let ip: string;
	try {
		ip = getClientAddress();
	} catch {
		return Response.json({ ok: true, dropped: true }, { status: 202 });
	}

	// SPA navigation can be quick; budget well above human browsing speed
	// while still capping abuse per IP.
	const limit = await checkRateLimit(`page-view:${ip}`, 120);
	if (!limit.allowed) {
		return Response.json({ ok: false, error: 'rate_limited' }, { status: 429 });
	}

	// Cross-site POSTs are not page views. Browsers send Sec-Fetch-Site on
	// all modern fetches; same-origin is the only legitimate value here.
	const secFetchSite = request.headers.get('sec-fetch-site');
	if (secFetchSite && secFetchSite !== 'same-origin') {
		return Response.json({ ok: true, dropped: true }, { status: 202 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ ok: false, error: 'invalid_json' }, { status: 400 });
	}
	const parsed = payloadSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
	}

	// Single-source ingest filters, identical rules to query time.
	if (!isTrackablePath(parsed.data.path)) {
		return Response.json({ ok: true, dropped: true }, { status: 202 });
	}
	const ua = request.headers.get('user-agent') ?? '';
	if (ANALYTICS_BOT_UA_PATTERN.test(ua)) {
		return Response.json({ ok: true, dropped: true }, { status: 202 });
	}
	// The operator's own browsing is not visitor traffic (operator
	// decision, audit 2026-06-11).
	if (locals.session) {
		return Response.json({ ok: true, dropped: true }, { status: 202 });
	}

	// Fail closed: an empty/missing salt in production would make visitor
	// fingerprints reversible to (ip, ua). Beacons are best-effort, so
	// drop instead of erroring. Empty Vercel placeholders count as missing.
	const salt = getAnalyticsFingerprintSalt();
	if (!salt) {
		logFingerprintSaltMissingOnce(locals.logger, 'page-view');
		return Response.json({ ok: true, dropped: true }, { status: 202 });
	}
	const visitorId = fingerprintVisitor(salt, ip, ua);
	const country = request.headers.get('x-vercel-ip-country') || undefined;
	const referrer = externalReferrerOf(parsed.data.referrer, url.hostname, internalHostnames);

	try {
		await recordPageView({
			path: parsed.data.path,
			referrer,
			userAgent: ua.slice(0, 256),
			sessionId: visitorId,
			country
		});
	} catch (err) {
		locals.logger.error({ err }, '[analytics] recordPageView failed');
		// Beacons are best-effort; a 200-family response avoids client retries.
		return Response.json({ ok: false }, { status: 202 });
	}

	return Response.json({ ok: true }, { status: 201 });
};
