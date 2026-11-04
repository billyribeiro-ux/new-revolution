import { z } from 'zod';

/**
 * Single source of truth for the admin-password minimum length.
 *
 * This constant is consumed by:
 *   - `resetPasswordSchema` (server-side zod validation)
 *   - `src/routes/admin/reset-password/+page.svelte` (client-side pre-check)
 *   - `$lib/server/services/password-reset.ts::resetPassword` (service guard)
 *   - `scripts/seed-admin.ts`, `scripts/rotate-admin-password.ts` (seed guard)
 *
 * Raising the minimum is a one-line change; never hard-code a length at a
 * call site.
 */
export const MIN_PASSWORD_LENGTH = 12;

/** Schema for admin login credentials */
export const loginSchema = z.object({
	username: z.string().min(1, 'Username is required'),
	password: z.string().min(1, 'Password is required')
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Schema for requesting a password reset */
export const forgotPasswordSchema = z.object({
	email: z.string().email('Please enter a valid email address')
});

/**
 * Schema for resetting the password with a token.
 *
 * Minimum length is `MIN_PASSWORD_LENGTH` (April 2026 hardening). The
 * previous 8-char minimum was well below NIST SP 800-63B guidance for
 * memorised secrets and allowed a realistic brute-force window in a scrypt
 * cost setting.
 */
export const resetPasswordSchema = z.object({
	token: z.string().min(1, 'Token is required'),
	newPassword: z
		.string()
		.min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
