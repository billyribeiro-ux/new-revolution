import { createHash } from 'node:crypto';
import type { RequestHandler } from './$types';
import { verifyUnsubscribeToken } from '#lib/server/email/unsubscribe-token.js';
import { unsubscribeByEmail } from '#lib/server/services/email-sequences.js';
import {
	isUnsubscribeFormContentType,
	parseUnsubscribeForm
} from '#lib/server/email/unsubscribe-request.js';

/**
 * One-click unsubscribe (RFC 8058).
 *
 * POST: email clients send List-Unsubscribe=One-Click as form data.
 * We persist suppression and return a blank 200, without a redirect. Must succeed
 * without auth and without leaking whether the address existed.
 *
 * GET: human confirmation form only. Link scanners must never unsubscribe.
 *
 * The token is a signed HMAC of the email (see unsubscribe-token.ts) — a
 * forged/tampered token verifies to null and we return 400 without touching DB.
 */
function getEmail(url: URL): string | null {
	const token = url.searchParams.get('token');
	if (!token) return null;
	return verifyUnsubscribeToken(token);
}

export const POST: RequestHandler = async ({ url, request, locals }) => {
	const email = getEmail(url);
	if (!email) {
		return new Response('Invalid unsubscribe link', { status: 400 });
	}
	if (!isUnsubscribeFormContentType(request.headers.get('content-type'))) {
		return new Response('Expected an unsubscribe form', { status: 415 });
	}
	const form = await parseUnsubscribeForm(request);
	if (!form) return new Response('Invalid unsubscribe request', { status: 400 });
	try {
		await unsubscribeByEmail(email);
	} catch (err) {
		locals.logger.error({ err }, '[unsubscribe] failed to suppress (POST)');
		return new Response('Unable to unsubscribe right now. Please try again.', {
			status: 503,
			headers: { 'retry-after': '60', 'cache-control': 'no-store' }
		});
	}
	if (form.get('confirm') === '1') {
		return htmlResponse(
			'Unsubscribed',
			'You will not receive further follow-up emails. You can close this tab.',
			200
		);
	}
	// Blank 200, no redirect — RFC 8058 one-click expectation.
	return new Response(null, { status: 200, headers: { 'cache-control': 'no-store' } });
};

export const GET: RequestHandler = async ({ url }) => {
	const email = getEmail(url);
	if (!email) {
		return htmlResponse('Invalid link', 'This unsubscribe link is invalid or has expired.', 400);
	}
	return htmlResponse(
		'Unsubscribe from follow-up emails',
		'Confirm below to stop receiving follow-up emails.',
		200,
		true
	);
};

/** The page's only inline content. Hashed into the CSP below, so keep it static. */
const PAGE_STYLE = `
		body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f9f9f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#2c2c2c;}
		.card{max-width:440px;margin:1rem;padding:2.5rem;background:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.06);text-align:center;}
		h1{font-size:1.25rem;margin:0 0 .75rem;}
		p{color:#555;font-size:.95rem;line-height:1.6;margin:0;}
		a{color:#1a5f4f;}
	`;

/**
 * Kit's `csp` option only covers pages Kit renders, and the hooks-layer
 * fallback (src/lib/server/csp.ts) skips text/html, so this hand-built page
 * shipped with no policy at all. It loads nothing: no script, one inline
 * <style> admitted by its hash, and a form that posts back to this URL.
 * `img-src 'self'` only admits the browser's own /favicon.ico request,
 * which Firefox otherwise reports as a violation on every view.
 */
const PAGE_CSP = [
	"default-src 'none'",
	`style-src 'sha256-${createHash('sha256').update(PAGE_STYLE).digest('base64')}'`,
	"img-src 'self'",
	"form-action 'self'",
	"frame-ancestors 'none'",
	"base-uri 'none'"
].join('; ');

function htmlResponse(title: string, message: string, status: number, confirm = false): Response {
	const safeTitle = title.replace(/[<>&]/g, '');
	const safeMessage = message.replace(/[<>&]/g, '');
	const html = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="robots" content="noindex,nofollow">
	<title>${safeTitle} | Revolution Trading Pros</title>
	<style>${PAGE_STYLE}</style>
</head>
<body>
	<div class="card">
		<h1>${safeTitle}</h1>
		<p>${safeMessage}</p>
		${confirm ? '<form method="post"><input type="hidden" name="List-Unsubscribe" value="One-Click"><button type="submit" name="confirm" value="1">Unsubscribe</button></form>' : ''}
	</div>
</body>
</html>`;
	return new Response(html, {
		status,
		headers: {
			'content-type': 'text/html; charset=utf-8',
			'content-security-policy': PAGE_CSP,
			'x-robots-tag': 'noindex, nofollow',
			// same-origin, never no-referrer: the confirmation form POSTs to this
			// URL, and a no-referrer document sends `Origin: null`, which Kit's
			// CSRF guard rejects with 403. same-origin still keeps the token off
			// every cross-site request.
			'referrer-policy': 'same-origin',
			'cache-control': 'no-store'
		}
	});
}
