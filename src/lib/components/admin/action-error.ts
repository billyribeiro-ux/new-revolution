/**
 * The message to show for a failed admin action.
 *
 * Remote commands reject with SvelteKit's `HttpError`, which is not an
 * `Error` subclass: its text is on `body.message`, so an `instanceof Error`
 * check alone would always fall through to the fallback.
 */
export function actionErrorMessage(err: unknown, fallback: string): string {
	if (err && typeof err === 'object') {
		const e = err as { body?: { message?: unknown }; message?: unknown };
		if (typeof e.body?.message === 'string' && e.body.message) return e.body.message;
		if (typeof e.message === 'string' && e.message) return e.message;
	}
	return fallback;
}
