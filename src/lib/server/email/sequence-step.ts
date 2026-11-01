/**
 * Sequence-step email builder.
 *
 * Turns an admin-authored drip step (subject + HTML body) into a Resend send
 * payload, with the RFC 8058 one-click unsubscribe headers and a visible
 * unsubscribe footer.
 *
 * Why we inject the headers ourselves: Resend auto-injects List-Unsubscribe
 * ONLY for Broadcasts/Audiences. This drip engine uses the transactional
 * `emails.send` API, so the one-click headers — required by Gmail/Yahoo bulk
 * rules — are our responsibility. RFC 8058 requires BOTH:
 *   List-Unsubscribe: <https-url>
 *   List-Unsubscribe-Post: List-Unsubscribe=One-Click
 */
import { getPublicBaseUrl } from '#lib/server/config/runtime.js';
import { buildUnsubscribeUrl } from './unsubscribe-token';

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export type SequenceStepEmail = {
	from: string;
	to: string;
	replyTo?: string;
	subject: string;
	html: string;
	headers: Record<string, string>;
};

export function buildSequenceStepEmail(args: {
	recipientEmail: string;
	recipientName?: string | null;
	subject: string;
	bodyHtml: string;
	fromEmail: string;
	fromName: string;
	replyTo?: string | null;
}): SequenceStepEmail {
	const baseUrl = getPublicBaseUrl();
	const unsubscribeUrl = buildUnsubscribeUrl(baseUrl, args.recipientEmail);
	const firstName = args.recipientName?.trim().split(' ')[0] ?? null;
	const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : 'Hi,';

	// The admin-authored body is trusted (only the owner edits it). The
	// greeting interpolates recipient-derived text, so it is escaped above.
	const html = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
		</head>
		<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background-color:#f9f9f9;">
			<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;">
				<tr>
					<td style="padding:40px 30px;">
						<p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 20px;">${greeting}</p>
						${args.bodyHtml}
					</td>
				</tr>
				<tr>
					<td style="background:#f5f5f5;padding:20px 30px;text-align:center;">
						<p style="color:#999;margin:0 0 8px;font-size:12px;">
							&copy; 2026 Revolution Trading Pros. All rights reserved.
						</p>
						<p style="color:#999;margin:0;font-size:12px;">
							Don't want these emails?
							<a href="${unsubscribeUrl}" style="color:#999;text-decoration:underline;">Unsubscribe</a>.
						</p>
					</td>
				</tr>
			</table>
		</body>
		</html>
	`;

	const email: SequenceStepEmail = {
		from: `${args.fromName} <${args.fromEmail}>`,
		subject: args.subject,
		to: args.recipientEmail,
		html,
		// RFC 8058 one-click unsubscribe. Both headers are mandatory for the
		// one-click flow; the POST header value is exact and case-sensitive.
		headers: {
			'List-Unsubscribe': `<${unsubscribeUrl}>`,
			'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
		}
	};
	if (args.replyTo) email.replyTo = args.replyTo;
	return email;
}
