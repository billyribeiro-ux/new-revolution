/**
 * Turns an error thrown by a SvelteKit remote call into the message to show the owner.
 *
 * Server errors arrive as `HttpError`-shaped objects (`{ status, body: { message } }`), which are not `Error`
 * instances, so a plain `err instanceof Error` check falls through to a generic message and the real reason
 * (for example "Author slug ... already exists.") is lost. The leading machine code (`DUPLICATE_SLUG:`) is dropped.
 */
export function rpcErrorMessage(err: unknown, fallback: string): string {
	let raw: string | null = null;
	if (err instanceof Error) {
		raw = err.message;
	} else if (err && typeof err === 'object') {
		const body = (err as { body?: unknown }).body;
		const bodyMessage =
			body && typeof body === 'object' ? (body as { message?: unknown }).message : undefined;
		const directMessage = (err as { message?: unknown }).message;
		if (typeof bodyMessage === 'string') raw = bodyMessage;
		else if (typeof directMessage === 'string') raw = directMessage;
	}
	const cleaned = raw?.replace(/^[A-Z][A-Z_]+:\s*/, '').trim() ?? '';
	return cleaned.length > 0 ? cleaned : fallback;
}
