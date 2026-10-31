// @sveltejs/kit/internal/server has no usable typings (its types/index.d.ts is not a module), so this
// import is untyped. with_request_store is the same function kit uses to set the request event per request.
// @ts-expect-error untyped SvelteKit internal export
import { with_request_store } from '@sveltejs/kit/internal/server';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestDatabase, setActiveDbForTest } from './db';
import { user } from './db/schema';

/**
 * Regression test for docs/ADMIN_AUTH_PLAN.md F2: Better Auth must expose `user.role` on the
 * session, and `role` must never be settable by a client at sign-up (`input: false`).
 *
 * Uses the real `auth` instance from `./auth.ts` against an in-memory PGlite database with the
 * repo migration applied.
 */

type TestEnv = Awaited<ReturnType<typeof createTestDatabase>>;

/** `role` is included on purpose: the sign-up test sends it to prove the server ignores it. */
type SignUpBody = { email: string; password: string; name: string; role?: string };

/**
 * Better Auth's SvelteKit cookie plugin (`sveltekitCookies`) calls `getRequestEvent()` after any
 * endpoint that sets cookies, and that throws outside a real request. We run each auth call inside
 * a stub request store whose cookie jar is a no-op. The cookies under test are read from the
 * Response `Set-Cookie` headers, so the stub does not affect the assertions.
 */
const stubRequestStore = {
	event: {
		cookies: {
			set: () => undefined,
			get: () => undefined,
			getAll: () => [],
			delete: () => undefined,
			serialize: () => ''
		}
	}
};

function inRequest<T>(fn: () => Promise<T>): Promise<T> {
	return with_request_store(stubRequestStore, fn);
}

describe('Better Auth user.role (auth-role.db.spec)', () => {
	let testEnv: TestEnv;
	let auth: typeof import('./auth.ts').auth;

	beforeAll(async () => {
		process.env.BETTER_AUTH_SECRET = 'test-secret-with-at-least-32-characters-entropy';
		testEnv = await createTestDatabase();
		setActiveDbForTest(testEnv.db, testEnv.client);
		({ auth } = await import('./auth.ts'));
	});

	afterAll(async () => {
		await testEnv.cleanup();
	});

	/** Signs up through the real endpoint and returns the Cookie header the browser would send back. */
	async function signUp(body: SignUpBody): Promise<string> {
		const response = await inRequest(() => auth.api.signUpEmail({ body, asResponse: true }));
		expect(response.status).toBe(200);
		const cookie = response.headers
			.getSetCookie()
			.map((c: string) => c.split(';')[0])
			.join('; ');
		expect(cookie).toContain('session_token');
		return cookie;
	}

	it('returns role "user" on the session for a fresh sign-up', async () => {
		const cookie = await signUp({
			email: 'fresh-user@example.com',
			password: 'correct-horse-battery-staple',
			name: 'Fresh User'
		});

		const session = await inRequest(() =>
			auth.api.getSession({ headers: new Headers({ cookie }) })
		);
		expect(session?.user.email).toBe('fresh-user@example.com');
		expect(session?.user.role).toBe('user');
	});

	it('ignores a client-supplied role at sign-up (input: false)', async () => {
		// Non-literal so the excess-property check does not apply; this is the attack payload.
		const body: SignUpBody = {
			email: 'self-promoted@example.com',
			password: 'correct-horse-battery-staple',
			name: 'Self Promoted',
			role: 'admin'
		};
		const cookie = await signUp(body);

		const session = await inRequest(() =>
			auth.api.getSession({ headers: new Headers({ cookie }) })
		);
		expect(session?.user.role).toBe('user');

		const [row] = await testEnv.db
			.select({ role: user.role })
			.from(user)
			.where(eq(user.email, 'self-promoted@example.com'));
		expect(row?.role).toBe('user');
	});

	it('returns role "admin" on the session after the row is promoted in SQL', async () => {
		const cookie = await signUp({
			email: 'promoted-admin@example.com',
			password: 'correct-horse-battery-staple',
			name: 'Promoted Admin'
		});

		await testEnv.client.query(`UPDATE "user" SET role = 'admin' WHERE email = $1`, [
			'promoted-admin@example.com'
		]);

		const session = await inRequest(() =>
			auth.api.getSession({ headers: new Headers({ cookie }) })
		);
		expect(session?.user.role).toBe('admin');
	});
});
