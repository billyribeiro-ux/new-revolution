import { command, form, getRequestEvent } from '$app/server';
import { error, invalid } from '@sveltejs/kit';
import { checkRateLimit } from '#lib/server/rate-limit.js';
import { sendLeadEmail } from '#lib/server/services/lead-email.js';
import { leadCaptureSchema, type LeadCaptureInput } from '#lib/shared/schemas/lead.js';

/**
 * Capture a lead and send the PDF checklist through either public transport.
 *
 * Both the progressive form and the blog guide command share the budget and
 * delivery path below. Rate limiting only `/api/lead` does not protect remote
 * functions. The 3 submissions / 60s / IP budget is especially important
 * because the recipient is caller-supplied and a successful submission enrolls
 * the lead in an email sequence. Forward request context for the lead audit
 * trail.
 *
 * Only the refusal differs. The command answers `error(429)`. The form answers
 * a form-level `invalid(...)`, so Kit re-renders it with the message (and,
 * without JavaScript, with what the visitor typed) instead of showing the
 * error page; the same fix the contact form got (audit 2026-10-09).
 */
const RATE_LIMITED = 'Too many requests. Please wait a minute and try again.';

/** Claim one submission from the shared per-IP budget; the caller refuses when not allowed. */
async function claimLeadBudget(): Promise<{ allowed: boolean; ip: string }> {
	const ip = getRequestEvent().getClientAddress();
	const limit = await checkRateLimit(`lead:${ip}`, 3, 60_000);
	return { allowed: limit.allowed, ip };
}

function deliver({ email, name, sourcePage }: LeadCaptureInput, ip: string) {
	return sendLeadEmail(email, {
		name,
		source: 'lead_form',
		sourcePage: sourcePage ?? undefined,
		ip,
		userAgent: getRequestEvent().request.headers.get('user-agent') ?? undefined
	});
}

export const captureLeadEmail = command(leadCaptureSchema, async (input) => {
	const { allowed, ip } = await claimLeadBudget();
	if (!allowed) error(429, RATE_LIMITED);
	return deliver(input, ip);
});

export const captureLeadForm = form(leadCaptureSchema, async (input) => {
	const { allowed, ip } = await claimLeadBudget();
	if (!allowed) invalid(RATE_LIMITED);
	return deliver(input, ip);
});
