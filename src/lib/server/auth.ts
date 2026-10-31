import { ORIGIN, BETTER_AUTH_SECRET } from '$app/env/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '#lib/server/db/index.ts';
import { emailAndPasswordOptions, userAdditionalFields } from '#lib/server/auth-options.ts';

export const auth = betterAuth({
	baseURL: ORIGIN,
	secret: BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: emailAndPasswordOptions,
	user: {
		// Shared with scripts/seed-admin.ts; see auth-options.ts (docs/ADMIN_AUTH_PLAN.md F2).
		additionalFields: userAdditionalFields
	},
	plugins: [
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});

export type AuthSession = typeof auth.$Infer.Session;
