import { type RequestHandler } from '@sveltejs/kit';
import { createHmac, timingSafeEqual } from 'node:crypto';
import * as env from '$app/env/private';
import { dev } from '$app/env';
import {
	upsertScheduledCall,
	cancelScheduledCall,
	notifyNewCall
} from '#lib/server/services/scheduled-calls.js';

/**
 * Calendly webhook handler.
 *
 * Events handled: `invitee.created` (a booking) and `invitee.canceled`. The
 * record is upserted/canceled idempotently on Calendly's scheduled_event URI —
 * Calendly retries deliveries, so processing must be replay-safe.
 *
 * Signature: Calendly signs with the `Calendly-Webhook-Signature` header in the
 * form `t=<unix-seconds>,v1=<hex-hmac-sha256>` where the signed payload is
 * `${t}.${rawBody}` keyed by the subscription's signing key. We verify it in
 * constant time and enforce a replay window — mirroring the Resend/Svix
 * verifier discipline already in this repo.
 *
 * Fail closed in prod when the signing key is unset (503). Dev loopback skips
 * verification so local simulation works.
 */
const TOLERANCE_SECONDS = 5 * 60;

type VerifyResult = { ok: true } | { ok: false; status: 400 | 401; reason: string };

function verifyCalendlySignature(
	rawBody: string,
	header: string | null,
	key: string,
	nowMs: number
): VerifyResult {
	if (!header) return { ok: false, status: 400, reason: 'missing signature header' };

	// Parse `t=…,v1=…` (order-independent).
	let t: string | undefined;
	let v1: string | undefined;
	for (const part of header.split(',')) {
		const eq = part.indexOf('=');
		if (eq === -1) continue;
		const k = part.slice(0, eq).trim();
		const val = part.slice(eq + 1).trim();
		if (k === 't') t = val;
		else if (k === 'v1') v1 = val;
	}
	if (!t || !v1) return { ok: false, status: 400, reason: 'malformed signature header' };

	const ts = Number(t);
	if (!Number.isFinite(ts)) return { ok: false, status: 400, reason: 'invalid timestamp' };
	if (Math.abs(nowMs / 1000 - ts) > TOLERANCE_SECONDS) {
		return { ok: false, status: 401, reason: 'timestamp outside tolerance' };
	}

	const expected = createHmac('sha256', key).update(`${t}.${rawBody}`).digest('hex');
	const a = Buffer.from(v1);
	const b = Buffer.from(expected);
	if (a.length !== b.length || !timingSafeEqual(a, b)) {
		return { ok: false, status: 401, reason: 'signature mismatch' };
	}
	return { ok: true };
}

type CalendlyPayload = {
	event?: string;
	payload?: {
		email?: string;
		name?: string;
		uri?: string; // invitee URI
		scheduled_event?: {
			uri?: string;
			start_time?: string;
			end_time?: string;
		};
	};
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const rawBody = await request.text();
		const signingKey = env['CALENDLY_WEBHOOK_SIGNING_KEY'];

		if (signingKey) {
			const result = verifyCalendlySignature(
				rawBody,
				request.headers.get('calendly-webhook-signature'),
				signingKey,
				Date.now()
			);
			if (!result.ok) {
				locals.logger.warn(
					{ reason: result.reason, status: result.status },
					'[webhook/calendly] signature verification failed'
				);
				return Response.json({ error: 'Invalid signature' }, { status: result.status });
			}
		} else if (!dev) {
			locals.logger.error(
				'[webhook/calendly] CALENDLY_WEBHOOK_SIGNING_KEY not configured, refusing unsigned events'
			);
			return Response.json({ error: 'Webhook not configured' }, { status: 503 });
		} else {
			locals.logger.warn('[webhook/calendly] no signing key (dev), skipping verification');
		}

		const body = JSON.parse(rawBody) as CalendlyPayload;
		const eventType = body.event;
		const p = body.payload;

		if (!eventType || !p) {
			return Response.json({ error: 'Invalid payload' }, { status: 400 });
		}

		const eventUri = p.scheduled_event?.uri;
		const startTime = p.scheduled_event?.start_time;

		if (eventType === 'invitee.created') {
			if (!p.email || !eventUri || !startTime) {
				return Response.json({ error: 'Missing booking fields' }, { status: 400 });
			}
			const { id, isNew } = await upsertScheduledCall({
				calendlyEventUri: eventUri,
				name: p.name ?? null,
				email: p.email,
				scheduledAt: new Date(startTime),
				endAt: p.scheduled_event?.end_time ? new Date(p.scheduled_event.end_time) : null,
				inviteeUri: p.uri ?? null,
				payload: body as unknown as Record<string, unknown>
			});
			if (isNew && id) {
				// Awaited: an un-awaited promise can be dropped once the serverless
				// instance freezes after the response. The booking is already
				// stored, so a failed notification is logged and still answers 200.
				await notifyNewCall({
					id,
					name: p.name ?? null,
					email: p.email,
					scheduledAt: new Date(startTime)
				}).catch((err: unknown) => {
					locals.logger.error({ err, callId: id }, '[webhook/calendly] notifyNewCall failed');
				});
			}
			return Response.json({ received: true });
		}

		if (eventType === 'invitee.canceled') {
			if (eventUri) await cancelScheduledCall(eventUri);
			return Response.json({ received: true });
		}

		// Unhandled event types are acknowledged so Calendly doesn't retry.
		return Response.json({ received: true });
	} catch (error) {
		locals.logger.error({ err: error }, '[webhook/calendly] handler failed');
		return Response.json({ error: 'Internal server error' }, { status: 500 });
	}
};
