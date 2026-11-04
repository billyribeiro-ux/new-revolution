/**
 * Campaign events beacon — records popup/CTA impressions and conversions.
 * Public + unauthenticated (any visitor), so rate-limited per IP and
 * filtered at ingest: JS-running crawlers fire the onMount beacon, and
 * the operator's own browsing is not campaign performance (forensic
 * audit 2026-06-11). Conversion dedupe lives in recordCampaignEvent.
 */
import { type RequestHandler } from '@sveltejs/kit';
import { campaignEventSchema } from '#lib/shared/schemas/campaigns.js';
import { recordCampaignEvent } from '#lib/server/services/campaigns.js';
import { checkRateLimit } from '#lib/server/rate-limit.js';
import { ANALYTICS_BOT_UA_PATTERN } from '#lib/server/analytics/path-filter.js';

export const POST: RequestHandler = async ({ request, getClientAddress, locals }) => {
	const clientIp = getClientAddress();
	const limit = await checkRateLimit(`campaign-events:${clientIp}`, 60);
	if (!limit.allowed) {
		return Response.json({ ok: false, error: 'rate_limited' }, { status: 429 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ ok: false, error: 'invalid_json' }, { status: 400 });
	}

	const parsed = campaignEventSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json({ ok: false, error: 'invalid_payload' }, { status: 400 });
	}

	// Drop (with a 202 ack) instead of erroring: the client needs no signal
	// and an error would only invite retries.
	const ua = request.headers.get('user-agent') ?? '';
	if (ANALYTICS_BOT_UA_PATTERN.test(ua) || locals.session) {
		return Response.json({ ok: true, dropped: true }, { status: 202 });
	}

	try {
		await recordCampaignEvent({
			campaignId: parsed.data.campaignId,
			variantKey: parsed.data.variantKey ?? null,
			type: parsed.data.type,
			sessionId: parsed.data.sessionId ?? null
		});
	} catch (err) {
		// The campaign_id FK rejects spoofed/deleted campaigns; that is a
		// client problem, not a server error.
		locals.logger.warn(
			{ err, campaignId: parsed.data.campaignId },
			'[campaign-events] insert rejected'
		);
		return Response.json({ ok: false, error: 'invalid_campaign' }, { status: 400 });
	}

	return Response.json({ ok: true }, { status: 201 });
};
