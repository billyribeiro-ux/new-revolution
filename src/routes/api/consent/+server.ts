/**
 * Consent ingestion endpoint.
 *
 * The cookie-consent banner POSTs the visitor's decision here. We append an
 * immutable row to `consent_records` (GDPR audit trail). Public + unauthenticated
 * by design — anyone on the site makes a consent decision — so it's rate-limited
 * per IP like /api/events.
 */
import { type RequestHandler } from '@sveltejs/kit';
import { consentRecordSchema } from '#lib/shared/schemas/consent.js';
import { recordConsent } from '#lib/server/services/consent.js';
import { checkRateLimit } from '#lib/server/rate-limit.js';

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const clientIp = getClientAddress();
	const limit = await checkRateLimit(`consent:${clientIp}`, 20);
	if (!limit.allowed) {
		return Response.json({ ok: false, error: 'rate_limited' }, { status: 429 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ ok: false, error: 'invalid_json' }, { status: 400 });
	}

	const parsed = consentRecordSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
	}

	await recordConsent({
		anonId: parsed.data.anonId,
		categories: parsed.data.categories,
		policyVersion: parsed.data.policyVersion,
		ip: clientIp,
		userAgent: request.headers.get('user-agent')
	});

	return Response.json({ ok: true }, { status: 201 });
};
