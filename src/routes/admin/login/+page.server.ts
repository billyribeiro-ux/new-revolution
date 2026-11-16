import { createHash } from 'node:crypto';
import { fail, redirect, type Cookies } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth } from '#lib/server/auth.ts';
import { consumeRateLimit } from '#lib/server/rate-limit';
import { safeAdminNext } from './safe-next.ts';
import type { Actions, PageServerLoad } from './$types';

export const prerender = false;

/** Sliding window for sign-in attempts. Applied per client IP and per email (hashed, so the table holds no raw email). */
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LIMIT_PER_IP = 30;
const LOGIN_LIMIT_PER_EMAIL = 10;
const MAX_EMAIL_LENGTH = 254;

const MSG_MISSING = 'Enter your email and password.';
/** One message for unknown email and wrong password alike, so the form does not reveal which accounts exist. */
const MSG_BAD_CREDENTIALS = 'Email or password is incorrect.';
const MSG_NOT_AUTHORISED = 'Not authorised.';
const MSG_RATE_LIMITED = 'Too many sign-in attempts. Try again in a few minutes.';

export const load: PageServerLoad = ({ locals, url }) => {
	if (locals.user?.role === 'admin') {
		redirect(303, safeAdminNext(url.searchParams.get('next')));
	}
	return {};
};

/**
 * Calls Better Auth's email sign-in. Returns `null` only for Better Auth API errors (bad credentials).
 * Anything else (database down, misconfiguration) is rethrown so it surfaces as a real error page.
 */
async function attemptSignIn(email: string, password: string) {
	try {
		return await auth.api.signInEmail({ body: { email, password } });
	} catch (err) {
		if (err instanceof APIError) return null;
		throw err;
	}
}

/**
 * Removes a session that was created in this same request. `auth.api.signOut` reads the session cookie from
 * the *request* headers, and a sign-in made inside this action only sets the cookie on the response, so
 * signOut would not find it. Deleting the session row by token and clearing the cookie does the same job.
 */
async function revokeSessionCreatedHere(cookies: Cookies, sessionToken: string): Promise<void> {
	const ctx = await auth.$context;
	await ctx.internalAdapter.deleteSession(sessionToken);
	cookies.delete(ctx.authCookies.sessionToken.name, { path: '/' });
}

function hashForKey(value: string): string {
	return createHash('sha256').update(value).digest('hex');
}

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const rawEmail = formData.get('email');
		const rawPassword = formData.get('password');
		const email = typeof rawEmail === 'string' ? rawEmail.trim() : '';
		const password = typeof rawPassword === 'string' ? rawPassword : '';

		if (!email || !password) {
			return fail(400, { message: MSG_MISSING, email });
		}
		if (email.length > MAX_EMAIL_LENGTH) {
			return fail(400, { message: MSG_BAD_CREDENTIALS, email: '' });
		}

		const [byIp, byEmail] = await Promise.all([
			consumeRateLimit({
				key: `admin-login:ip:${event.getClientAddress()}`,
				limit: LOGIN_LIMIT_PER_IP,
				windowMs: LOGIN_WINDOW_MS
			}),
			consumeRateLimit({
				key: `admin-login:email:${hashForKey(email.toLowerCase())}`,
				limit: LOGIN_LIMIT_PER_EMAIL,
				windowMs: LOGIN_WINDOW_MS
			})
		]);
		if (!byIp.allowed || !byEmail.allowed) {
			return fail(429, { message: MSG_RATE_LIMITED, email });
		}

		const signIn = await attemptSignIn(email, password);
		if (!signIn) {
			return fail(400, { message: MSG_BAD_CREDENTIALS, email });
		}

		if (signIn.user.role !== 'admin') {
			await revokeSessionCreatedHere(event.cookies, signIn.token);
			return fail(403, { message: MSG_NOT_AUTHORISED, email });
		}

		redirect(303, safeAdminNext(event.url.searchParams.get('next')));
	}
};
