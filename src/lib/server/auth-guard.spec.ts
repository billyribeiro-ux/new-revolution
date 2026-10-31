import { isHttpError } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';
import { requireAdmin } from './auth-guard';

const APP_URL = 'https://revolutiontradingpros.com/api/admin/posts';

function makeUser(role: string) {
	return {
		id: `user-${role}`,
		name: 'Test User',
		email: `${role}@example.com`,
		emailVerified: true,
		image: null,
		role,
		createdAt: new Date('2026-01-01T00:00:00Z'),
		updatedAt: new Date('2026-01-01T00:00:00Z')
	};
}

function makeEvent(options: {
	user?: ReturnType<typeof makeUser>;
	method?: string;
	headers?: Record<string, string>;
	url?: string;
}) {
	const url = options.url ?? APP_URL;
	const request = new Request(url, {
		method: options.method ?? 'GET',
		headers: options.headers
	});
	return {
		locals: options.user ? { user: options.user } : {},
		request,
		url: new URL(url)
	};
}

/** Runs `fn`, returns the HTTP status it throws with, and rethrows anything that is not an HttpError. */
function thrownStatus(fn: () => unknown): number {
	try {
		fn();
	} catch (err) {
		if (isHttpError(err)) return err.status;
		throw err;
	}
	throw new Error('expected requireAdmin to throw an HttpError');
}

describe('requireAdmin (auth-guard)', () => {
	it('returns 401 when there is no authenticated user', () => {
		const status = thrownStatus(() => requireAdmin(makeEvent({})));
		expect(status).toBe(401);
	});

	it('returns 403 when the user has the default role "user"', () => {
		const status = thrownStatus(() => requireAdmin(makeEvent({ user: makeUser('user') })));
		expect(status).toBe(403);
	});

	it('returns the admin identity when the user has the "admin" role', () => {
		const admin = requireAdmin(makeEvent({ user: makeUser('admin') }));
		expect(admin).toEqual({
			id: 'user-admin',
			name: 'Test User',
			email: 'admin@example.com',
			role: 'admin'
		});
	});

	it('rejects a state-changing request with no Origin and no Referer (403)', () => {
		const status = thrownStatus(() =>
			requireAdmin(makeEvent({ user: makeUser('admin'), method: 'POST' }))
		);
		expect(status).toBe(403);
	});

	it('rejects a state-changing request whose Origin host does not match (403)', () => {
		const status = thrownStatus(() =>
			requireAdmin(
				makeEvent({
					user: makeUser('admin'),
					method: 'POST',
					headers: { origin: 'https://evil.example.com' }
				})
			)
		);
		expect(status).toBe(403);
	});

	it('rejects a state-changing request whose Referer host does not match (403)', () => {
		const status = thrownStatus(() =>
			requireAdmin(
				makeEvent({
					user: makeUser('admin'),
					method: 'DELETE',
					headers: { referer: 'https://evil.example.com/page' }
				})
			)
		);
		expect(status).toBe(403);
	});

	it('accepts a state-changing request whose Origin matches the request host', () => {
		const admin = requireAdmin(
			makeEvent({
				user: makeUser('admin'),
				method: 'POST',
				headers: { origin: 'https://revolutiontradingpros.com' }
			})
		);
		expect(admin.role).toBe('admin');
	});

	it('accepts a GET with no Origin or Referer', () => {
		const admin = requireAdmin(makeEvent({ user: makeUser('admin'), method: 'GET' }));
		expect(admin.id).toBe('user-admin');
	});

	it('does not apply the CSRF check to a Pick<locals> event without request/url', () => {
		const admin = requireAdmin({ locals: { user: makeUser('admin') } });
		expect(admin.role).toBe('admin');
	});
});
