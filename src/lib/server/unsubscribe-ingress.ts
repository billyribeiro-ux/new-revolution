import { verifySignedUnsubscribeToken } from './email/unsubscribe-signature.js';
import {
	isUnsubscribeFormContentType,
	UNSUBSCRIBE_BODY_MAX_BYTES
} from './email/unsubscribe-request.js';

/**
 * RFC 8058 clients have no browser Origin, cookie or HTTP authorization.
 * Kit rejects such form POSTs before hooks, so Vercel validates the signed
 * capability here, then supplies a same-origin header for this endpoint only.
 * All other requests retain Kit's normal CSRF checks. The endpoint revalidates
 * both token and body before persisting suppression.
 */
export function unsubscribeIngress(
	request: Request,
	secret: string | undefined
): Headers | Response | null {
	const url = new URL(request.url);
	if (url.pathname !== '/api/unsubscribe' || request.method !== 'POST') return null;
	if (request.headers.has('origin')) return null;
	if (request.headers.has('cookie') || request.headers.has('authorization')) {
		return new Response('Cookie-independent unsubscribe request required', { status: 403 });
	}
	if (!isUnsubscribeFormContentType(request.headers.get('content-type'))) {
		return new Response('Expected an unsubscribe form', { status: 415 });
	}
	if (Number(request.headers.get('content-length') ?? 0) > UNSUBSCRIBE_BODY_MAX_BYTES) {
		return new Response('Unsubscribe request is too large', { status: 413 });
	}
	if (!verifySignedUnsubscribeToken(url.searchParams.get('token') ?? '', secret)) {
		return new Response('Invalid unsubscribe link', { status: 400 });
	}
	const headers = new Headers(request.headers);
	headers.set('origin', url.origin);
	return headers;
}
