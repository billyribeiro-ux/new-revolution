import { isHttpError } from '@sveltejs/kit';

/**
 * True when `err` is a SvelteKit `HttpError` carrying a 401 or 403 status —
 * i.e. the admin session lapsed or the user lacks the required role.
 *
 * Remote functions (`$app/server` query/command) reject with the `HttpError`
 * thrown by `requireAdmin()` (`error(401, …)` / `error(403, …)`), so a client
 * caller can branch on this to show a re-auth prompt instead of a generic
 * failure message. Mirrors the 401/403 branches in `admin/+error.svelte`.
 */
export function isAuthError(err: unknown): boolean {
	return isHttpError(err, 401) || isHttpError(err, 403);
}

/** Codes `rethrowServiceRefusal` attaches to a business-rule refusal. */
const REFUSAL_CODES = new Set(['NOT_FOUND', 'CONFLICT', 'NOT_CONFIGURED']);

/**
 * The message to show the operator for a failed remote call.
 *
 * A business-rule refusal (`src/lib/server/service-errors.ts`: a 404
 * `NOT_FOUND`, 409 `CONFLICT` or 503 `NOT_CONFIGURED`) carries the service's
 * own explanation, such as which scheduled post still uses a tag or which
 * environment variable the deployment is missing, and so does the SEO publish
 * gate's 422. Those are shown as written. Everything else, including Kit's terse
 * framework 404 and the scrubbed 500 from `handleError`, gets `fallback`.
 * Note `HttpError` does not extend `Error`, so an `instanceof Error` check
 * never sees these messages.
 */
export function refusalMessage(err: unknown, fallback: string): string {
	if (!isHttpError(err)) return fallback;
	const { message, code } = err.body;
	const deliberate = err.status === 422 || (code !== undefined && REFUSAL_CODES.has(code));
	return deliberate && typeof message === 'string' && message.trim() ? message : fallback;
}
