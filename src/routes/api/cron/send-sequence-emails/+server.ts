import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { dev } from '$app/env';
import * as env from '$app/env/private';
import {
	processDueEnrollments,
	type StepSender,
	type StepPreparer
} from '#lib/server/services/email-sequences.js';
import { buildSequenceStepEmail } from '#lib/server/email/sequence-step.js';
import { getResendRuntimeConfig } from '#lib/server/services/integrations.js';
import { apiSuccess } from '#lib/server/api-response.js';
import type { Resend } from 'resend';

/**
 * Cron: send the next due step for every active drip enrollment.
 *
 * Schedule: hourly (see vercel.json). Weekly cadence is enforced per-recipient
 * by `nextSendAt` (now + delayDays); the cron just needs to run often enough to
 * catch due rows promptly.
 *
 * Auth: Vercel sends `Authorization: Bearer $CRON_SECRET`. Required in prod;
 * dev allows an unauthenticated call for local testing. Mirrors publish-scheduled.
 *
 * Idempotent: durable leases and a frozen provider idempotency key protect
 * retries; only accepted deliveries advance the enrollment. Ambiguous attempts
 * beyond the provider retention window pause for operator review.
 */
async function createResend(apiKey: string): Promise<Resend> {
	const { Resend } = await import('resend');
	return new Resend(apiKey);
}

export const GET: RequestHandler = async ({ request, locals }) => {
	const secret = env['CRON_SECRET'];
	if (!dev && !secret) {
		throw error(500, 'CRON_SECRET not configured');
	}
	if (secret) {
		const header = request.headers.get('authorization');
		if (header !== `Bearer ${secret}`) {
			throw error(401, 'Unauthorized');
		}
	}

	const resendConfig = await getResendRuntimeConfig();
	if (!resendConfig) {
		locals.logger.error('[cron send-sequence-emails] Resend not configured, skipping run');
		return apiSuccess({ ok: false, reason: 'resend_not_configured' });
	}
	const resend = await createResend(resendConfig.apiKey);

	const prepare: StepPreparer = ({ email, name, subject, bodyHtml }) =>
		buildSequenceStepEmail({
			recipientEmail: email,
			recipientName: name,
			subject,
			bodyHtml,
			fromEmail: resendConfig.fromEmail,
			fromName: resendConfig.fromName,
			replyTo: resendConfig.replyTo
		});
	const send: StepSender = async (payload, options) => {
		const res = await resend.emails.send(payload, options);
		if (res.error) {
			locals.logger.error(
				{ err: res.error, from: payload.from },
				'[cron send-sequence-emails] Resend send failed'
			);
			return null;
		}
		return res.data?.id ?? null;
	};

	const summary = await processDueEnrollments({ prepare, send }, { now: new Date() });
	locals.logger.info({ summary }, '[cron send-sequence-emails] run complete');
	return apiSuccess({ ok: true, ...summary });
};
