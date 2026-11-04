import type { RequestEvent } from '@sveltejs/kit';
import { signup, applyToken, CONSENT_VERSION, WaitlistError, processOutbox } from './service.ts';
import { deliver } from './delivery.ts';
import { escapeHtml, waitlistOrigin } from './email.ts';
export const PRIVATE_HEADERS = {
	'cache-control': 'no-store, max-age=0',
	'cdn-cache-control': 'no-store',
	'vercel-cdn-cache-control': 'no-store',
	'x-robots-tag': 'noindex, nofollow',
	'referrer-policy': 'no-referrer',
	'x-content-type-options': 'nosniff'
};
export function documentResponse(
	title: string,
	message: string,
	status = 200,
	purpose?: 'confirm' | 'unsubscribe',
	token = ''
) {
	const form = purpose
		? `<form method="post" action="/api/waitlist/${purpose}"><input type="hidden" name="token" value="${escapeHtml(token)}"><button>${purpose === 'confirm' ? 'Confirm my email address' : 'Unsubscribe'}</button></form>`
		: '';
	return new Response(
		`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>${escapeHtml(title)} | Revolution Trading Pros</title><style>body{margin:0;background:#0b0e12;color:#f4f5f0;font:18px/1.6 system-ui;min-height:100svh;display:grid;place-items:center}main{max-width:560px;padding:32px}h1{font-size:32px;line-height:1.2}a{color:#dcff65}button{background:#dcff65;color:#11151a;padding:16px;border:0;font:700 17px system-ui;cursor:pointer}button:focus-visible,a:focus-visible{outline:3px solid #ff7969;outline-offset:4px}</style></head><body><main><p>REVOLUTION TRADING PROS</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p>${form}<p><a href="mailto:support@revolutiontradingpros.com">Contact support</a> · <a href="/privacy-policy">Privacy</a></p></main></body></html>`,
		{
			status,
			headers: {
				...PRIVATE_HEADERS,
				'content-type': 'text/html; charset=utf-8',
				'content-security-policy':
					"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"
			}
		}
	);
}
async function boundedForm(request: Request): Promise<Record<string, unknown>> {
	const type = request.headers.get('content-type')?.split(';')[0];
	if (
		!['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data'].includes(
			type || ''
		)
	)
		throw new WaitlistError(415, 'Unsupported form format.');
	const reader = request.body?.getReader();
	const chunks: Uint8Array[] = [];
	let length = 0;
	if (reader) {
		for (;;) {
			const { done, value } = await reader.read();
			if (done) break;
			length += value.byteLength;
			if (length > 4096) {
				await reader.cancel();
				throw new WaitlistError(413, 'Form is too large.');
			}
			chunks.push(value);
		}
	}
	const body = Buffer.concat(chunks);
	try {
		if (type === 'application/json') {
			const value: unknown = JSON.parse(body.toString('utf8'));
			if (!value || typeof value !== 'object' || Array.isArray(value))
				throw new Error('Invalid form');
			return value as Record<string, unknown>;
		}
		const form = await new Response(body, {
			headers: { 'content-type': request.headers.get('content-type') || '' }
		}).formData();
		return Object.fromEntries(form);
	} catch {
		throw new WaitlistError(400, 'Invalid form.');
	}
}
function originCheck(request: Request) {
	const allowed = new Set([
		waitlistOrigin(),
		'https://revolutiontradingpros.com',
		'https://www.revolutiontradingpros.com'
	]);
	const origin = request.headers.get('origin');
	if (!origin || !allowed.has(origin))
		throw new WaitlistError(403, 'Please submit this form from our website.');
}
function failure(error: unknown, json: boolean) {
	const status = error instanceof WaitlistError ? error.status : 503;
	const message =
		error instanceof WaitlistError
			? error.message
			: 'Unable to save your request right now. Please try again.';
	const response = json
		? Response.json({ error: message }, { status, headers: PRIVATE_HEADERS })
		: documentResponse('Request unavailable', message, status);
	if (error instanceof WaitlistError && error.retryAfter)
		response.headers.set('retry-after', String(error.retryAfter));
	return response;
}
export async function signupHandler(event: RequestEvent) {
	const enhanced = event.request.headers.get('accept')?.includes('application/json') ?? false;
	try {
		if (process.env.WAITLIST_SIGNUPS_ENABLED !== 'true')
			throw new WaitlistError(
				503,
				'Waitlist signup is temporarily unavailable. Please contact support.'
			);
		if (
			process.env.VERCEL_ENV === 'production' &&
			(!process.env.DATABASE_URL ||
				!/^postgres(?:ql)?:/.test(process.env.DATABASE_URL) ||
				process.env.DATABASE_URL.includes('user:password@'))
		)
			throw new WaitlistError(503, 'Waitlist signup is temporarily unavailable.');
		originCheck(event.request);
		const form = await boundedForm(event.request);
		if (form.website)
			return Response.json({ accepted: true }, { status: 202, headers: PRIVATE_HEADERS });
		if (
			typeof form.email !== 'string' ||
			!['on', 'true', true, '1'].includes(form.consent as string) ||
			form.consentVersion !== CONSENT_VERSION
		)
			throw new WaitlistError(400, 'Enter your email and agree to the reopening notification.');
		const jobId = await signup(form.email, event.getClientAddress());
		if (jobId) await processOutbox(deliver, { jobId, limit: 1 }).catch(() => undefined);
		const message =
			'Your request is saved. If your address is eligible, check your inbox for a confirmation link. Confirming your address joins the waitlist; it creates no paid membership.';
		return enhanced
			? Response.json({ accepted: true, message }, { status: 202, headers: PRIVATE_HEADERS })
			: documentResponse('Request saved', message, 202);
	} catch (error) {
		return failure(error, enhanced);
	}
}
export async function tokenHandler(event: RequestEvent, purpose: 'confirm' | 'unsubscribe') {
	try {
		const form = await boundedForm(event.request);
		const oneClick = purpose === 'unsubscribe' && form['List-Unsubscribe'] === 'One-Click';
		if (!oneClick) originCheck(event.request);
		const token = oneClick ? event.url.searchParams.get('token') : form.token;
		if (typeof token !== 'string') throw new WaitlistError(400, 'Invalid link.');
		await applyToken(token, purpose);
		if (purpose === 'confirm') await processOutbox(deliver, { limit: 1 }).catch(() => undefined);
		return oneClick
			? new Response(null, { headers: PRIVATE_HEADERS })
			: documentResponse(
					purpose === 'confirm' ? 'Your address is confirmed' : 'You’re unsubscribed',
					purpose === 'confirm'
						? 'You’re on the Revolution Trading Pros waitlist. We will email you when we reopen.'
						: 'You will not receive the reopening notification.'
				);
	} catch (error) {
		return failure(error, false);
	}
}
export function tokenDocument(url: URL, purpose: 'confirm' | 'unsubscribe') {
	const token = url.searchParams.get('token') || '';
	if (!/^[A-Za-z0-9_-]{43}$/.test(token))
		return documentResponse('Invalid link', 'This link is invalid or has expired.', 400);
	return documentResponse(
		purpose === 'confirm' ? 'Confirm your email address' : 'Unsubscribe from the waitlist',
		purpose === 'confirm'
			? 'Choose confirm below to join the reopening waitlist. Opening this page does not change your subscription.'
			: 'Choose unsubscribe below to stop reopening notifications.',
		200,
		purpose,
		token
	);
}

export function methodNotAllowed(allow: string) {
	return () =>
		new Response('Method not allowed', { status: 405, headers: { ...PRIVATE_HEADERS, allow } });
}
