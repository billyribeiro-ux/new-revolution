import { SITE_ORIGIN } from '#lib/seo/structured-data.ts';
export type WaitlistEmail = {
	from: string;
	to: string;
	replyTo: string;
	subject: string;
	text: string;
	html: string;
	headers: Record<string, string>;
};
export type WaitlistEmailPurpose = 'confirm' | 'receipt' | 'launch' | 'update';
export type WaitlistUpdate = { subject: string; body: string };

export function parseWaitlistUpdate(value: unknown): WaitlistUpdate {
	if (!value || typeof value !== 'object' || Array.isArray(value))
		throw new Error('Update message must contain a subject and plain-text body.');
	const content = value as Record<string, unknown>;
	if (
		Object.keys(content).some((key) => !['subject', 'body'].includes(key)) ||
		typeof content.subject !== 'string' ||
		typeof content.body !== 'string'
	)
		throw new Error('Update message must contain only a subject and plain-text body.');
	const subject = content.subject.trim();
	const body = content.body.trim();
	if (!subject || subject.length > 120 || /[\r\n\p{Cc}]/u.test(subject))
		throw new Error('Update subject must be 1–120 characters on one line.');
	if (!body || body.length > 4000 || /[\p{Cc}&&[^\r\n\t]]/v.test(body))
		throw new Error('Update body must be 1–4000 plain-text characters.');
	return { subject, body };
}
export const escapeHtml = (v: string) =>
	v.replace(
		/[&<>"']/g,
		(c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c
	);
export function waitlistOrigin(): string {
	const origin = process.env.WAITLIST_ORIGIN || SITE_ORIGIN;
	const parsed = new URL(origin);
	if (
		parsed.origin !== origin ||
		(!['https:'].includes(parsed.protocol) && !['localhost', '127.0.0.1'].includes(parsed.hostname))
	)
		throw new Error('Invalid waitlist origin');
	return origin;
}
export function prepareEmail(
	email: string,
	purpose: WaitlistEmailPurpose,
	token: string,
	unsubscribe: string,
	options: { updatesAllowed?: boolean; update?: WaitlistUpdate } = {}
): WaitlistEmail {
	if (purpose === 'update' && (!options.updatesAllowed || !options.update))
		throw new Error('An update requires update consent and message content.');
	const update = purpose === 'update' ? parseWaitlistUpdate(options.update) : undefined;
	const origin = waitlistOrigin();
	const optOut = `${origin}/waitlist/unsubscribe?token=${unsubscribe}`;
	const action = purpose === 'confirm' ? `${origin}/waitlist/confirm?token=${token}` : origin;
	const subject =
		purpose === 'confirm'
			? 'Thanks — confirm your Revolution Trading Pros waitlist request'
			: purpose === 'receipt'
				? 'You’re on the Revolution Trading Pros waitlist'
				: (update?.subject ?? 'Revolution Trading Pros is open');
	const notifications = options.updatesAllowed
		? 'occasional launch updates and our reopening notification'
		: 'our reopening notification';
	const body =
		purpose === 'confirm'
			? `Thank you for requesting a spot on the Revolution Trading Pros waitlist. Confirm your email address to receive ${notifications}. This link expires in 24 hours. You are not subscribed until you confirm.`
			: purpose === 'receipt'
				? `Thank you for joining the Revolution Trading Pros waitlist. Your email address is confirmed. You will receive ${notifications}. Joining the waitlist creates no paid membership.`
				: (update?.body ??
					'Revolution Trading Pros has reopened. Visit the site to explore the experience. Trading involves substantial risk of loss.');
	const htmlBody = body
		.split(/\n\s*\n/)
		.map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\r?\n/g, '<br>')}</p>`)
		.join('');
	const from = process.env.WAITLIST_FROM_EMAIL,
		replyTo = process.env.WAITLIST_REPLY_TO;
	if (!from || !replyTo) throw new Error('Waitlist sender unavailable');
	return {
		from,
		to: email,
		replyTo,
		subject,
		text: `${subject}\n\n${body}\n\n${purpose === 'confirm' ? 'Confirm email' : 'Visit the site'}: ${action}\n\nUnsubscribe: ${optOut}\nSupport: ${replyTo}`,
		html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:32px auto;line-height:1.7;color:#11151a"><p>REVOLUTION TRADING PROS</p><h1 style="font-size:26px">${escapeHtml(subject)}</h1>${htmlBody}<p><a href="${escapeHtml(action)}">${purpose === 'confirm' ? 'Confirm my email address' : 'Visit Revolution Trading Pros'}</a></p><p><a href="${escapeHtml(optOut)}">Unsubscribe</a> · <a href="mailto:${escapeHtml(replyTo)}">Contact support</a></p></div>`,
		headers: {
			'List-Unsubscribe': `<${origin}/api/waitlist/unsubscribe?token=${unsubscribe}>`,
			'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
		}
	};
}
