/**
 * Lead Welcome Email Template
 * Single source of truth for the lead capture transactional email.
 *
 * From-address is **not** tied to `ADMIN_FROM_EMAIL` (password resets may use a
 * generic no-reply). The ebook / checklist should arrive from Steven's address
 * on the verified domain unless overridden via `LEAD_FROM_EMAIL`.
 */
import * as env from '$app/env/private';
import * as pubEnv from '$app/env/public';
import { getPublicBaseUrl } from '#lib/server/config/runtime.js';
import { FINANCE_CHECKLIST_PDF_BASE64 } from '#lib/server/assets/finance-checklist-pdf-base64.js';

function trimEnv(key: keyof typeof env): string | undefined {
	const v = env[key]?.trim();
	return v && v.length > 0 ? v : undefined;
}

/**
 * HTML-escape user-controlled text before interpolating into the email
 * template. `recipientName` originates from the public `/api/lead` form
 * and reaches the welcome template via the first-name extraction below;
 * a payload like `<script>alert(1)</script>` would otherwise be rendered
 * verbatim into the `From: steven@…` HTML body, weaponising a
 * verified-domain transactional email as a phishing carrier.
 */
function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/** Verified sender for lead capture; override with `LEAD_FROM_EMAIL` in production if needed. */
export const DEFAULT_LEAD_FROM_EMAIL = 'steven@teamconsulting360.com';

const DEFAULT_LEAD_FROM_NAME = 'Steven Johnson';

const PDF_FILENAME = 'The-7-Keys-to-MultiView-Mastery.pdf';

function loadPdfBase64(): string | null {
	// Bundled server-only constant (not under static/). Vercel cannot serve it
	// as a public URL; delivery is email attachment after lead capture only.
	return FINANCE_CHECKLIST_PDF_BASE64 || null;
}

export function buildLeadWelcomeEmail(
	recipientEmail: string,
	recipientName?: string | undefined,
	options: { fromEmail?: string; fromName?: string; replyTo?: string } = {}
): {
	from: string;
	to: string;
	replyTo?: string;
	subject: string;
	html: string;
	attachments?: Array<{ filename: string; content: string }>;
} {
	const baseUrl = getPublicBaseUrl();
	const fromEmail = options.fromEmail ?? trimEnv('LEAD_FROM_EMAIL') ?? DEFAULT_LEAD_FROM_EMAIL;
	const fromName = options.fromName ?? trimEnv('LEAD_FROM_NAME') ?? DEFAULT_LEAD_FROM_NAME;
	const pdfBase64 = loadPdfBase64();
	const firstName = recipientName?.trim().split(' ')[0] ?? null;
	const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : 'Hi,';
	const calendlyUrl = pubEnv['PUBLIC_CALENDLY_URL']?.trim() || `${baseUrl}/contact`;

	const email: ReturnType<typeof buildLeadWelcomeEmail> = {
		from: `${fromName} <${fromEmail}>`,
		to: recipientEmail,
		subject: 'Your 7 Keys to MultiView Mastery [Inside]',
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
			</head>
			<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f9f9f9;">
				<table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
					<tr>
						<td style="padding: 40px 30px;">
							<p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">${greeting}</p>

							<p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
								Your guide is <strong>attached to this email</strong> as a PDF. Save it somewhere you can find it when you are ready to work through the checklist.
							</p>

							<p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
								Inside you will find the exact framework I use with clients to transform their financial operations. From month-end closes that drag on for weeks to systems that practically run themselves.
							</p>

							<p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 10px;">
								<strong style="color: #2c2c2c;">Here is what catches most people off guard when they first read it:</strong>
							</p>

							<p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
								<strong style="color: #1a5f4f;">The continuous close concept (Key #1).</strong> The best-performing organizations do not cram all their close activities into a few chaotic days. They spread tasks throughout the month, making the final close almost effortless.
							</p>

							<p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
								That single shift has saved my clients <strong>5 to 7 days per month</strong>. Every month.
							</p>

							<p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
								Over the next few days I will share specific implementation strategies for each key. Things I have learned from 20+ years of MultiView implementations that did not fit in the guide.
							</p>

							<p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 30px;">
								For now, start with <strong>pages 3 and 4</strong>. That is where most organizations find their biggest quick win.
							</p>

							<p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 5px;">
								Talk soon,
							</p>

							<p style="color: #2c2c2c; font-size: 15px; line-height: 1.6; margin: 0 0 30px;">
								<strong>Steven Johnson, CPA</strong><br>
								<span style="color: #666666;">Fractional CFO | MultiView Expert</span>
							</p>

							<div style="background: #f8fafc; border-left: 4px solid #1a5f4f; padding: 20px; margin: 0;">
								<p style="color: #555555; font-size: 14px; line-height: 1.6; margin: 0;">
									<strong style="color: #1a5f4f;">P.S.</strong> If you already know your setup needs work and want to skip ahead, I offer a complimentary 15-minute ERP Readiness Audit. No pitch, just clarity on your next best step. <a href="${calendlyUrl}" style="color: #1a5f4f; text-decoration: underline;">Book your audit here &rarr;</a>
								</p>
							</div>
						</td>
					</tr>
					<tr>
						<td style="background: #f5f5f5; padding: 20px 30px; text-align: center;">
							<p style="color: #999999; margin: 0; font-size: 12px;">
								&copy; 2026 Team Consulting 360. All rights reserved.
							</p>
						</td>
					</tr>
				</table>
			</body>
			</html>
		`
	};

	if (options.replyTo) email.replyTo = options.replyTo;

	if (pdfBase64) {
		email.attachments = [{ filename: PDF_FILENAME, content: pdfBase64 }];
	}

	return email;
}
