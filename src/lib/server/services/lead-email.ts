import type { Resend } from 'resend';
import * as env from '$app/env/private';
import { buildLeadWelcomeEmail } from '#lib/server/email/lead-welcome.js';
import { logger } from '#lib/server/logger.js';
import { getResendRuntimeConfig } from './integrations';

/** Lazy-initialized Resend client singleton - dynamic import avoids CJS at module load time */
let resendInstance: { apiKey: string; client: Resend } | null = null;

async function getResend(apiKey: string): Promise<Resend> {
	if (resendInstance?.apiKey === apiKey) return resendInstance.client;
	if (!apiKey) {
		throw new Error('Resend API key is not configured');
	}
	const { Resend } = await import('resend');
	const client = new Resend(apiKey);
	resendInstance = { apiKey, client };
	return client;
}

/** Send lead capture email with PDF checklist, and persist the lead in DB */
export async function sendLeadEmail(
	email: string,
	meta?: {
		name?: string | undefined;
		source?: string | undefined;
		sourcePage?: string | undefined;
		ip?: string | undefined;
		userAgent?: string | undefined;
	}
): Promise<{ success: boolean; message: string }> {
	// 1. Validate Resend availability up front so a missing env var fails the
	//    request cleanly instead of leaving an orphan lead row with no email sent.
	const resendConfig = await getResendRuntimeConfig();
	if (!resendConfig) {
		logger.error('[lead] RESEND_API_KEY is not configured');
		return {
			success: false,
			message: 'Email delivery is temporarily unavailable. Please try again later.'
		};
	}

	// 2. Persist the lead. If the DB is unreachable we still want to attempt
	//    the email, so DB failures degrade gracefully rather than blocking delivery.
	const { createLead, completeLeadWelcome } = await import('./leads');
	let leadId: number | undefined;
	// False when the email already belongs to a live lead: the welcome
	// email is still (re)sent so a resubmitting visitor gets their guide.
	// Durable welcome completion decides enrollment eligibility, including
	// retries of failed first signups. This flag controls the owner notification.
	let isNewLead = false;
	try {
		const { lead, created } = await createLead({
			email,
			name: meta?.name ?? undefined,
			source: meta?.source ?? 'lead_form',
			sourcePage: meta?.sourcePage ?? undefined,
			ip: meta?.ip ?? undefined,
			userAgent: meta?.userAgent ?? undefined
		});
		leadId = lead.id;
		isNewLead = created;
	} catch (err) {
		logger.error({ err }, '[lead] createLead failed; proceeding to email-only path');
	}

	// 3. Send the email via Resend. The SDK returns `{ error }` for API-level
	//    rejections but THROWS on transport failures (network, DNS, abort);
	//    without the catch a thrown error escapes as a generic 500 after the
	//    lead row is already committed, so the visitor is captured yet never
	//    told delivery failed.
	const resend = await getResend(resendConfig.apiKey);
	const emailPayload = buildLeadWelcomeEmail(email, meta?.name, {
		fromEmail: resendConfig.fromEmail,
		fromName: resendConfig.fromName,
		replyTo: resendConfig.replyTo
	});
	let emailResponse: Awaited<ReturnType<typeof resend.emails.send>>;
	try {
		emailResponse = await resend.emails.send(emailPayload);
	} catch (err) {
		logger.error({ err, from: emailPayload.from }, '[lead] Resend send threw');
		return { success: false, message: 'We could not send your email. Please try again later.' };
	}

	if (emailResponse.error) {
		// Include `from` in the log so a future Resend rejection (e.g. domain
		// not verified, address malformed) shows exactly which sender we tried.
		// We deliberately don't log the recipient address — it's PII.
		logger.error(
			{ err: emailResponse.error, from: emailPayload.from },
			'[lead] Resend send failed'
		);
		return { success: false, message: 'We could not send your email. Please try again later.' };
	}

	const messageId = emailResponse.data?.id;
	if (!messageId) {
		logger.error('[lead] provider returned no accepted message ID');
		return { success: false, message: 'We could not send your email. Please try again later.' };
	}
	if (leadId) {
		try {
			await completeLeadWelcome(leadId, messageId);
		} catch (err) {
			// The provider already accepted the guide. Reporting a delivery failure
			// here invites duplicate requests and skips the new-lead notification.
			// Keep bookkeeping retryable without asking the visitor to send again.
			logger.error({ err, leadId }, '[lead] welcome completion failed and remains retryable');
		}
	}

	// 5. Await the optional owner notification so the invocation owns its work.
	//    Notify Steven so he knows a new lead came
	//    in. Only for genuinely new leads; resubmits are not news.
	if (isNewLead) {
		const notifyEmail =
			resendConfig.notifyEmail ?? env['LEAD_NOTIFY_EMAIL'] ?? 'spjwaste@gmail.com';
		const displayName = meta?.name ? `${meta.name} (${email})` : email;
		const sourceLine = meta?.sourcePage
			? `<br><strong>Page:</strong> ${escapeHtml(meta.sourcePage)}`
			: '';
		await resend.emails
			.send({
				from: `${resendConfig.fromName} <${resendConfig.fromEmail}>`,
				replyTo: resendConfig.replyTo,
				to: notifyEmail,
				subject: `New lead: ${displayName}`,
				html: `<p>New lead signed up.</p><p><strong>Name:</strong> ${escapeHtml(meta?.name ?? 'not provided')}<br><strong>Email:</strong> ${escapeHtml(email)}${sourceLine}</p>`
			})
			.then((response) => {
				if (response.error || !response.data?.id)
					logger.error({ err: response.error }, '[lead] Lead notification rejected');
			})
			.catch((err: unknown) => {
				logger.error({ err }, '[lead] Failed to send lead notification');
			});
	}

	return { success: true, message: 'Check your email for your free checklist!' };
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}
