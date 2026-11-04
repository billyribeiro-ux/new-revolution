import { type RequestHandler } from '@sveltejs/kit';
import { createHmac, timingSafeEqual } from 'crypto';
import * as env from '$app/env/private';
import { dev } from '$app/env';
import { db } from '#lib/server/db/index.js';
import { emailEnrollments, emailEvents, emailSends, leads } from '#lib/server/db/schema.js';
import { logger } from '#lib/server/logger.js';
import { notifyResendEmailEvent } from '#lib/server/services/notifications.js';
import { eq } from 'drizzle-orm';
import { recordEvent } from '#lib/server/waitlist/service.ts';

/**
 * Resend → Svix webhook signature verification.
 *
 * Audit BLOCKER #2. The previous implementation HMAC-ed the raw `whsec_…`
 * secret string over the bare body, hex-encoded it, and compared it to the
 * entire `svix-signature` header — none of which matches how Resend (via
 * Svix) actually signs. Result: every legitimate production webhook 401'd
 * and `email_events` ingestion was silently dead. Proven via a self-built
 * Svix signature that matched the canonical svix-webhooks test vector yet
 * was rejected by the old verifier.
 *
 * Correct scheme (docs.svix.com/receiving/verifying-payloads/how-manual):
 *   - key            = base64-decode(secret without the "whsec_" prefix)
 *   - signed content = `${svix-id}.${svix-timestamp}.${rawBody}`
 *   - signature      = base64( HMAC-SHA256(key, signedContent) )
 *   - `svix-signature` header is a SPACE-delimited list of `v1,<sig>`
 *     tokens (key rotation / multi-sig); a match against ANY `v1` token
 *     is a pass.
 *
 * Returns a discriminated result so the caller maps each failure to the
 * right status code (400 malformed vs 401 unauthenticated).
 */
type SvixVerifyResult = { ok: true } | { ok: false; status: 400 | 401; reason: string };

/** Replay window: reject deliveries whose timestamp is outside ±5 min. */
const SVIX_TOLERANCE_SECONDS = 5 * 60;

function verifySvixSignature(
	rawBody: string,
	headers: Headers,
	secret: string,
	nowMs: number
): SvixVerifyResult {
	const svixId = headers.get('svix-id');
	const svixTimestamp = headers.get('svix-timestamp');
	const svixSignature = headers.get('svix-signature');

	// All three are mandatory for a Svix-signed delivery. Absent ⇒ this is
	// not a well-formed Svix request (malformed, not merely unauthorized).
	if (!svixId || !svixTimestamp || !svixSignature) {
		return { ok: false, status: 400, reason: 'missing svix headers' };
	}

	// Replay / clock-skew defense. Svix timestamps are unix SECONDS.
	const ts = Number(svixTimestamp);
	if (!Number.isFinite(ts)) {
		return { ok: false, status: 400, reason: 'invalid svix-timestamp' };
	}
	if (Math.abs(nowMs / 1000 - ts) > SVIX_TOLERANCE_SECONDS) {
		return { ok: false, status: 401, reason: 'timestamp outside tolerance' };
	}

	let key: Buffer;
	try {
		key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
	} catch {
		return { ok: false, status: 401, reason: 'malformed secret' };
	}

	const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
	const expected = createHmac('sha256', key).update(signedContent).digest('base64');
	const expectedBuf = Buffer.from(expected);

	// Header is a space-delimited list of `version,signature` tokens.
	for (const token of svixSignature.split(' ')) {
		const comma = token.indexOf(',');
		if (comma === -1) continue;
		const version = token.slice(0, comma);
		const sig = token.slice(comma + 1);
		if (version !== 'v1' || !sig) continue;
		const sigBuf = Buffer.from(sig);
		// timingSafeEqual throws on length mismatch — guard first so a
		// length difference is a clean "no match", not a thrown 500.
		if (sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf)) {
			return { ok: true };
		}
	}

	return { ok: false, status: 401, reason: 'no matching v1 signature' };
}

/**
 * Resend Webhook Handler.
 *
 * Fail CLOSED in any non-dev environment when `RESEND_WEBHOOK_SECRET` is
 * unset (503 — operator misconfiguration, refuse the write). Dev loopback
 * skips verification so local Resend simulation works without a secret.
 *
 * Ingestion is idempotent: Svix delivers at-least-once and replays the
 * same `svix-id` on retry, so the insert is `ON CONFLICT (svix_id) DO
 * NOTHING` against the `email_events_svix_id_uq` unique index — a replay
 * cannot double-write.
 */
const handleWebhook: RequestHandler = async ({ request, locals }) => {
	const log = locals.logger ?? logger;
	try {
		const rawBody = await request.text();
		const webhookSecret = env['RESEND_WEBHOOK_SECRET'];
		let svixId: string | null = null;

		if (webhookSecret) {
			const result = verifySvixSignature(rawBody, request.headers, webhookSecret, Date.now());
			if (!result.ok) {
				log.warn(
					{ reason: result.reason, status: result.status },
					'[webhook/resend] signature verification failed, rejecting'
				);
				return Response.json({ error: 'Invalid signature' }, { status: result.status });
			}
			svixId = request.headers.get('svix-id');
		} else if (!dev) {
			// Fail closed outside dev. 503 (not 401) signals operator
			// misconfiguration so ops can act, while refusing the write.
			log.error(
				'[webhook/resend] RESEND_WEBHOOK_SECRET is not configured, refusing to accept unsigned events'
			);
			return Response.json({ error: 'Webhook not configured' }, { status: 503 });
		} else {
			log.warn('[webhook/resend] RESEND_WEBHOOK_SECRET not set (dev only), skipping verification');
		}

		const payload = JSON.parse(rawBody);
		const eventType: string = payload.type;
		const eventData = payload.data;

		if (!eventType || !eventData) {
			return Response.json({ error: 'Invalid payload' }, { status: 400 });
		}

		const messageId: string | undefined = eventData.email_id;
		const supportedEvents = [
			'email.delivered',
			'email.opened',
			'email.clicked',
			'email.bounced',
			'email.complained'
		];

		if (!supportedEvents.includes(eventType)) {
			return Response.json({ received: true });
		}

		// Normalize event name (strip "email." prefix)
		const event = eventType.replace('email.', '');

		// Look up the lead by messageId (check leads.resendMessageId first, then emailSends -> emailEnrollments.leadId)
		let leadId: number | null = null;
		if (messageId) {
			const matchedLeads = await db
				.select({ id: leads.id })
				.from(leads)
				.where(eq(leads.resendMessageId, messageId))
				.limit(1);
			leadId = matchedLeads[0]?.id ?? null;

			if (leadId === null) {
				const matchedSends = await db
					.select({ leadId: emailEnrollments.leadId })
					.from(emailSends)
					.innerJoin(emailEnrollments, eq(emailEnrollments.id, emailSends.enrollmentId))
					.where(eq(emailSends.resendMessageId, messageId))
					.limit(1);
				leadId = matchedSends[0]?.leadId ?? null;
			}
		}

		// Idempotent store: a replayed delivery (same svix-id) conflicts on
		// `email_events_svix_id_uq` and is silently dropped. svix-id is null
		// only in dev (no signature) — Postgres treats NULLs as distinct so
		// dev inserts are never deduped against each other.
		await db
			.insert(emailEvents)
			.values({
				leadId,
				messageId: messageId ?? null,
				event,
				metadata: JSON.stringify(eventData),
				createdAt: new Date(),
				svixId
			})
			.onConflictDoNothing({ target: emailEvents.svixId });

		// Deliverability hygiene: a hard bounce or spam complaint means we must
		// stop emailing this address. Add it to our own suppression list (the
		// drip engine checks this before every send). Resend's payload carries
		// the recipient address in `to` (array or string).
		if (event === 'bounced' || event === 'complained') {
			const rawTo = eventData.to;
			const recipient = Array.isArray(rawTo) ? rawTo[0] : rawTo;
			if (typeof recipient === 'string' && recipient.includes('@')) {
				const { suppressEmail } = await import('#lib/server/services/email-sequences.js');
				// Acknowledge only durable suppression. On failure the outer handler
				// returns 500 so a retry can finish this after event deduplication.
				await suppressEmail(recipient, event);
			}
		}

		if (svixId && messageId) await recordEvent(svixId, messageId, event);

		// Awaited: an un-awaited promise can be dropped once the serverless
		// instance freezes after the response. The event is already stored, so
		// a failed notification is logged and still answers 200.
		await notifyResendEmailEvent({
			event,
			leadId,
			messageId: messageId ?? null,
			metadata: {
				emailId: messageId,
				eventType,
				createdAt: eventData.created_at
			}
		}).catch((err: unknown) => {
			log.error({ err, event, leadId }, '[notifications] notifyResendEmailEvent failed');
		});

		return Response.json({ received: true });
	} catch (error) {
		log.error({ err: error }, '[webhook/resend] handler failed');
		return Response.json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const POST: RequestHandler = async (event) => {
	const response = await handleWebhook(event);
	response.headers.set('cache-control', 'no-store');
	response.headers.set('cdn-cache-control', 'no-store');
	response.headers.set('vercel-cdn-cache-control', 'no-store');
	return response;
};

import { methodNotAllowed } from '#lib/server/waitlist/http.ts';
export const GET = methodNotAllowed('POST'),
	HEAD = methodNotAllowed('POST'),
	PUT = methodNotAllowed('POST'),
	PATCH = methodNotAllowed('POST'),
	DELETE = methodNotAllowed('POST'),
	OPTIONS = methodNotAllowed('POST');
