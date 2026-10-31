import { createHash } from 'node:crypto';
import { dev } from '$app/env';
import * as env from '$app/env/private';

/**
 * Shared page-view ingest primitives, extracted from the old
 * hooks.server.ts ingest path when measurement moved to the client
 * beacon (/api/page-view). Pure functions so the rules are unit-tested
 * once and shared by any future ingest surface.
 */

/** Fixed salt used only when `dev` is true and the env var is unset/empty. */
export const DEV_FINGERPRINT_SALT = 'dev-only-fingerprint-salt';

/**
 * Env key for the first-party analytics visitor fingerprint salt.
 * Must be a non-empty secret in Production and Preview (Vercel).
 * Generate with: `openssl rand -hex 32`
 */
export const ANALYTICS_FINGERPRINT_SALT_ENV = 'ANALYTICS_FINGERPRINT_SALT';

let saltMissingLogged = false;

/**
 * Resolve the fingerprint salt for server-side visitor pseudonyms.
 *
 * - Trims the env value; empty / whitespace-only is treated as missing
 *   (a present-but-empty Vercel key used to look "set" while still
 *   failing closed at the beacon).
 * - In `dev`, falls back to {@link DEV_FINGERPRINT_SALT} so local and
 *   unit tests stay deterministic without a populated `.env`.
 * - In non-dev, returns `null` when missing so callers fail closed
 *   (ack-and-drop beacons) instead of hashing with a known empty salt.
 *
 * This is intentionally not a boot-fatal critical env: the marketing
 * site must stay up if analytics is misconfigured. Boot warns via
 * `assertProductionEnv`; `/api/health` surfaces `analytics.ok`.
 */
export function getAnalyticsFingerprintSalt(): string | null {
	const raw = env[ANALYTICS_FINGERPRINT_SALT_ENV];
	const trimmed = typeof raw === 'string' ? raw.trim() : '';
	if (trimmed.length > 0) return trimmed;
	if (dev) return DEV_FINGERPRINT_SALT;
	return null;
}

/**
 * Whether a non-empty fingerprint salt is available for this runtime.
 * Safe to call from health probes (no secret returned).
 */
export function hasAnalyticsFingerprintSalt(): boolean {
	return getAnalyticsFingerprintSalt() !== null;
}

/**
 * Log once per serverless isolate when salt is missing in production.
 * Avoids flooding Vercel logs on every page-view / click beacon.
 */
export function logFingerprintSaltMissingOnce(
	logger: { error: (objOrMsg: unknown, msg?: string) => void },
	context: 'page-view' | 'click'
): void {
	if (saltMissingLogged) return;
	saltMissingLogged = true;
	logger.error(
		{ analyticsContext: context },
		`[analytics] ${ANALYTICS_FINGERPRINT_SALT_ENV} is missing or empty; ` +
			'dropping first-party beacons until a non-empty secret is set in Vercel and redeployed'
	);
}

/** @internal test-only: reset the once-per-process log latch */
export function resetFingerprintSaltMissingLogForTests(): void {
	saltMissingLogged = false;
}

/**
 * Pseudonymous visitor fingerprint = sha256(salt + ip + ua), truncated
 * to 16 hex chars (64 bits, collision-resistant at this traffic volume,
 * compact in the DB). Stable across days for the same (ip, ua) so
 * Unique Visitors does not rotate identities at midnight. The salt
 * prevents reversing the hash to (ip, ua). Production must set
 * ANALYTICS_FINGERPRINT_SALT (non-empty); missing salt → callers drop
 * beacons (fail closed). Dev uses a fixed string so tests stay
 * deterministic.
 */
export function fingerprintVisitor(salt: string, ip: string, ua: string): string {
	return createHash('sha256')
		.update(salt + ip + ua)
		.digest('hex')
		.slice(0, 16);
}

/**
 * Keep only EXTERNAL referrers: same-site navigation, preview deploys
 * (vercel.app), and configured internal hostnames are attribution
 * noise, not acquisition sources. Returns undefined for internal,
 * invalid, or missing referrers.
 */
export function externalReferrerOf(
	referer: string | null | undefined,
	currentHost: string,
	internalHostnames: ReadonlySet<string>
): string | undefined {
	if (!referer) return undefined;
	try {
		const refUrl = new URL(referer);
		const isSameDomain = refUrl.hostname === currentHost;
		const isInternalDomain =
			refUrl.hostname.includes('vercel.app') ||
			[...internalHostnames].some(
				(hostname) => refUrl.hostname === hostname || refUrl.hostname.endsWith(`.${hostname}`)
			);
		if (!isSameDomain && !isInternalDomain) return referer;
		return undefined;
	} catch {
		return undefined;
	}
}
