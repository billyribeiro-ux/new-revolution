// Shared Better Auth option fragments. Imported by `src/lib/server/auth.ts` (SvelteKit runtime) AND by
// `scripts/seed-admin.ts` (plain Node). Keep this file free of `$app/*` and any SvelteKit-only import.

/**
 * Exposes `user.role` on the session user. Without this Better Auth omits `role` and `requireAdmin`
 * rejects everyone (docs/ADMIN_AUTH_PLAN.md F2). `input: false` stops a client from choosing its own
 * role at sign-up.
 */
export const userAdditionalFields = {
	role: { type: 'string', defaultValue: 'user', input: false }
} as const;

export const emailAndPasswordOptions = { enabled: true } as const;
