/**
 * Public environment-variable validation primitives.
 *
 * These helpers wrap `PUBLIC_*` reads from SvelteKit 3's explicit public env
 * (`$app/env/public`, every key declared in src/env.ts) with explicit
 * required-vs-optional semantics and crash loud at module load when a
 * deployment is misconfigured.
 *
 * Why
 * ----
 * Hardcoded fallbacks for deployment-specific values (canonical URL, CTA
 * scheduling links, contact info) are an L7 anti-pattern: a missing env var
 * silently ships wrong data to real users — corrupted SEO canonicals, broken
 * "Schedule" buttons that point nowhere, the brand showing the wrong contact
 * email. We want misconfiguration to fail the build / first request, not
 * degrade quietly.
 *
 * Dev ergonomics
 * --------------
 * `requireEnv` accepts an opt-in `devOnly` fallback so `pnpm run dev` works
 * without a populated `.env`. Production (`!dev && !building`) always throws
 * when a required value is absent — the fallback is bypassed.
 *
 * Boundary
 * --------
 * This file MUST NOT import from `$lib/server/*`. It is loaded in client
 * bundles (component scripts that read `siteConfig`), and any `server/*`
 * import would either tree-shake-fail or leak server code into the browser.
 * For server-side env validation see `$lib/server/config/runtime.ts`.
 */

import { dev, building } from '$app/env';
import * as declaredPublicEnv from '$app/env/public';

/**
 * Read by key, so the namespace is re-typed as an index of possibly-missing
 * strings: a mistyped or undeclared key is `undefined` at runtime, and the
 * type system should force validation before use. Declared variables are
 * dynamic (read when the app runs, not inlined at build), and the browser
 * receives them from `/_app/env.js`. A key that is not declared in
 * src/env.ts does not exist here at all.
 */
type PublicEnv = Record<string, string | undefined>;

const publicEnv = declaredPublicEnv as unknown as PublicEnv;

const trim = (v: string | undefined): string => (v ?? '').trim();

/**
 * In non-dev builds, a missing required env should fail loud at module load.
 * `building` is true during the prerender pass: we honour the `devOnly`
 * fallback there so the build doesn't fail just because the build host
 * happens to lack a value (the declared variables are dynamic, so the
 * running app reads the real value from its runtime env).
 */
const allowFallback = dev || building;

/**
 * Read a required `PUBLIC_*` env var. Throws at module load when missing
 * outside dev/build, with a message that names the exact var and points
 * the operator at where to fix it.
 *
 * @param key      The full env var name, e.g. `'PUBLIC_APP_URL'`.
 * @param devOnly  Optional fallback applied ONLY in dev / build. Production
 *                 always throws. Use this for keys where having `pnpm run dev`
 *                 work without a `.env` is genuinely useful (e.g. localhost
 *                 URLs); omit it for keys whose fallback would be a lie
 *                 (e.g. someone's personal Calendly link).
 */
export function requireEnv(key: string, devOnly?: string): string {
	const value = trim(publicEnv[key]);
	if (value.length > 0) return value;
	if (allowFallback && devOnly !== undefined) return devOnly;
	throw new Error(
		`[config/env] Missing required public env var: ${key}. ` +
			`Set it in Vercel → Project Settings → Environment Variables ` +
			`(Production, Preview, Development). For local dev, copy ` +
			`.env.example to .env and populate this key.`
	);
}

/**
 * Read an optional `PUBLIC_*` env var. Returns `''` when absent so callers
 * can pass it directly to attributes like `href` (which becomes a noop) or
 * gate rendering with a truthiness check.
 */
export function optionalEnv(key: string): string {
	return trim(publicEnv[key]);
}

/**
 * Strip trailing slashes from a URL. Useful for `PUBLIC_APP_URL` so we never
 * generate `https://site.com//path` when concatenating.
 */
export function ensureNoTrailingSlash(url: string): string {
	return url.replace(/\/+$/, '');
}
