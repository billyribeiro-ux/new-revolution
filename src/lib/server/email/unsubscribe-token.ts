/**
 * Unsubscribe token — a stateless, signed token that authorizes a one-click
 * unsubscribe for a single email address without auth and without exposing an
 * enumerable id.
 *
 * Format: `base64url(email) + '.' + base64url(HMAC-SHA256(secret, email))`.
 * The endpoint recomputes the HMAC over the decoded email and compares it in
 * constant time — a forged or tampered token fails verification.
 *
 * Secret resolution: `UNSUBSCRIBE_SECRET` if set, else falls back to
 * `CRON_SECRET` (always present in this deploy). Either is a high-entropy
 * server secret never exposed to the client.
 */
import * as env from '$app/env/private';
import { signUnsubscribeEmail, verifySignedUnsubscribeToken } from './unsubscribe-signature.js';

function getSecret(): string {
	const secret = env['UNSUBSCRIBE_SECRET']?.trim() || env['CRON_SECRET']?.trim();
	if (!secret) {
		throw new Error('UNSUBSCRIBE_SECRET (or CRON_SECRET) must be set to sign unsubscribe links');
	}
	return secret;
}

function b64url(input: Buffer | string): string {
	return Buffer.from(input).toString('base64url');
}

function sign(email: string): string {
	return signUnsubscribeEmail(email, getSecret());
}

/** Build a signed unsubscribe token for an email address. */
export function createUnsubscribeToken(email: string): string {
	const normalized = email.trim().toLowerCase();
	return `${b64url(normalized)}.${sign(normalized)}`;
}

/**
 * Verify a token and return the email it authorizes, or null if invalid.
 * Constant-time signature comparison; never throws on bad input.
 */
export function verifyUnsubscribeToken(token: string): string | null {
	try {
		return verifySignedUnsubscribeToken(token, getSecret());
	} catch {
		return null;
	}
}

/** Absolute one-click unsubscribe URL for List-Unsubscribe headers / footer. */
export function buildUnsubscribeUrl(baseUrl: string, email: string): string {
	const token = createUnsubscribeToken(email);
	return `${baseUrl.replace(/\/$/, '')}/api/unsubscribe?token=${encodeURIComponent(token)}`;
}
