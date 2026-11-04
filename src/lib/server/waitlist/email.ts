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
	purpose: 'confirm' | 'receipt' | 'launch',
	token: string,
	unsubscribe: string
): WaitlistEmail {
	const origin = waitlistOrigin();
	const optOut = `${origin}/waitlist/unsubscribe?token=${unsubscribe}`;
	const action = purpose === 'confirm' ? `${origin}/waitlist/confirm?token=${token}` : origin;
	const subject =
		purpose === 'confirm'
			? 'Confirm your Revolution Trading Pros waitlist request'
			: purpose === 'receipt'
				? 'You’re on the Revolution Trading Pros waitlist'
				: 'Revolution Trading Pros is open';
	const body =
		purpose === 'confirm'
			? 'We received your request. Confirm your email address to receive one notification when we reopen. This link expires in 24 hours.'
			: purpose === 'receipt'
				? 'Your email address is confirmed. We will email you when Revolution Trading Pros reopens. Joining the waitlist creates no paid membership.'
				: 'Revolution Trading Pros has reopened. Visit the site to explore the experience. Trading involves substantial risk of loss.';
	const from = process.env.WAITLIST_FROM_EMAIL,
		replyTo = process.env.WAITLIST_REPLY_TO;
	if (!from || !replyTo) throw new Error('Waitlist sender unavailable');
	return {
		from,
		to: email,
		replyTo,
		subject,
		text: `${subject}\n\n${body}\n\n${purpose === 'confirm' ? 'Confirm email' : 'Visit the site'}: ${action}\n\nUnsubscribe: ${optOut}\nSupport: ${replyTo}`,
		html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:32px auto;line-height:1.7;color:#11151a"><p>REVOLUTION TRADING PROS</p><h1 style="font-size:26px">${escapeHtml(subject)}</h1><p>${escapeHtml(body)}</p><p><a href="${escapeHtml(action)}">${purpose === 'confirm' ? 'Confirm my email address' : 'Visit Revolution Trading Pros'}</a></p><p><a href="${escapeHtml(optOut)}">Unsubscribe</a> · <a href="mailto:${escapeHtml(replyTo)}">Contact support</a></p></div>`,
		headers: {
			'List-Unsubscribe': `<${origin}/api/waitlist/unsubscribe?token=${unsubscribe}>`,
			'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
		}
	};
}
