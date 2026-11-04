export const UNSUBSCRIBE_BODY_MAX_BYTES = 16_384;

export function isUnsubscribeFormContentType(value: string | null): boolean {
	return /^(application\/x-www-form-urlencoded|multipart\/form-data)(?:;|$)/i.test(value ?? '');
}

/** Bounded body parsing also works for chunked requests with no length header. */
export async function parseUnsubscribeForm(request: Request): Promise<FormData | null> {
	const contentType = request.headers.get('content-type');
	if (!contentType || !isUnsubscribeFormContentType(contentType)) return null;
	const reader = request.body?.getReader();
	if (!reader) return null;
	const chunks: Uint8Array<ArrayBuffer>[] = [];
	let size = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			size += value.byteLength;
			if (size > UNSUBSCRIBE_BODY_MAX_BYTES) {
				await reader.cancel();
				return null;
			}
			chunks.push(new Uint8Array(value));
		}
		// Blob.type lowercases its entire value, including case-sensitive multipart
		// boundaries. Preserve the original header separately from the body bytes.
		const form = await new Response(new Blob(chunks), {
			headers: { 'content-type': contentType }
		}).formData();
		return form.getAll('List-Unsubscribe').length === 1 &&
			form.get('List-Unsubscribe') === 'One-Click'
			? form
			: null;
	} catch {
		return null;
	} finally {
		reader.releaseLock();
	}
}
