import { error, type RequestEvent } from '@sveltejs/kit';

export interface AuthenticatedAdmin {
	id: string;
	name: string;
	email: string;
	role: 'admin';
}

/**
 * Admin authorization guard (Section 7.16):
 * - 401 without an authenticated user session
 * - 403 when the user lacks the `'admin'` role
 */
export function requireAdmin(
	event: Pick<RequestEvent, 'locals'> | { locals?: App.Locals; request?: Request; url?: URL }
): AuthenticatedAdmin {
	const user = event.locals?.user;

	if (!user) {
		error(401, 'Authentication required.');
	}

	if (user.role !== 'admin') {
		error(403, 'Admin role required.');
	}

	// verifyCsrfOrigin itself returns early for GET/HEAD/OPTIONS, so this is safe to call for every
	// request that carries a request/url. Missing Origin AND Referer is rejected there with 403.
	if ('request' in event && event.request && 'url' in event && event.url) {
		verifyCsrfOrigin(event.request, event.url);
	}

	return {
		id: user.id,
		name: user.name,
		email: user.email,
		role: 'admin'
	};
}

/**
 * CSRF validation for mutating cookie-authenticated requests (Section 7.16):
 * Rejects with 403 when both Origin and Referer are absent or when either mismatches the request host.
 */
export function verifyCsrfOrigin(request: Request, url: URL): void {
	const method = request.method.toUpperCase();
	if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
		return;
	}

	const originHeader = request.headers.get('origin');
	const refererHeader = request.headers.get('referer');

	if (!originHeader && !refererHeader) {
		error(403, 'CSRF validation failed: missing Origin and Referer headers.');
	}

	const expectedHost = url.host.toLowerCase();

	if (originHeader) {
		try {
			const parsedOrigin = new URL(originHeader);
			if (parsedOrigin.host.toLowerCase() !== expectedHost) {
				error(403, 'CSRF validation failed: Origin host mismatch.');
			}
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err) throw err;
			error(403, 'CSRF validation failed: invalid Origin header.');
		}
	}

	if (refererHeader) {
		try {
			const parsedReferer = new URL(refererHeader);
			if (parsedReferer.host.toLowerCase() !== expectedHost) {
				error(403, 'CSRF validation failed: Referer host mismatch.');
			}
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err) throw err;
			error(403, 'CSRF validation failed: invalid Referer header.');
		}
	}
}

export function getClientIp(event: { getClientAddress?: () => string; request?: Request }): string {
	const forwarded = event.request?.headers.get('x-forwarded-for');
	if (forwarded) {
		const first = forwarded.split(',')[0]?.trim();
		if (first) return first;
	}
	if (typeof event.getClientAddress === 'function') {
		try {
			return event.getClientAddress();
		} catch {
			return '127.0.0.1';
		}
	}
	return '127.0.0.1';
}
