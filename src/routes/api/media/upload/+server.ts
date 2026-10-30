import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin } from '#lib/server/auth-guard';
import { consumeRateLimit, RATE_LIMIT_MEDIA_UPLOAD_PER_MIN } from '#lib/server/rate-limit';
import {
	MEDIA_UPLOAD_MAX_BYTES,
	MEDIA_REQUEST_MAX_BYTES,
	MEDIA_METADATA_MAX_BYTES,
	MEDIA_ALLOWED_METADATA_KEYS
} from '#lib/shared/media-upload';
import { mediaPatchSchema } from '#lib/shared/schemas/media';
import { uploadMediaAsset } from '#lib/server/services/media';
import { toRestErrorResponse } from '#lib/server/posts/error-mapper';

class PayloadTooLargeError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'PayloadTooLargeError';
	}
}

async function readRequestWithByteCap(request: Request, maxBytes: number): Promise<Request> {
	const contentLengthHeader = request.headers.get('content-length');
	if (contentLengthHeader !== null) {
		const declaredLength = Number(contentLengthHeader);
		if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
			throw new PayloadTooLargeError(
				`Request body exceeds the maximum allowed size of ${maxBytes} bytes.`
			);
		}
	}

	if (!request.body) {
		return request;
	}

	const reader = request.body.getReader();
	const chunks: Uint8Array[] = [];
	let totalBytes = 0;

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			if (value) {
				totalBytes += value.byteLength;
				if (totalBytes > maxBytes) {
					await reader.cancel('Payload exceeded byte cap').catch(() => {});
					throw new PayloadTooLargeError(
						`Streamed request body exceeds the maximum allowed size of ${maxBytes} bytes.`
					);
				}
				chunks.push(value);
			}
		}
	} finally {
		reader.releaseLock();
	}

	const merged = new Uint8Array(totalBytes);
	let offset = 0;
	for (const chunk of chunks) {
		merged.set(chunk, offset);
		offset += chunk.byteLength;
	}

	return new Request(request.url, {
		method: request.method,
		headers: request.headers,
		body: merged
	});
}

export const POST: RequestHandler = async (event) => {
	try {
		const admin = requireAdmin(event);

		const rateLimit = await consumeRateLimit({
			key: `media_upload:${admin.id}`,
			limit: RATE_LIMIT_MEDIA_UPLOAD_PER_MIN,
			windowMs: 60_000
		});
		if (!rateLimit.allowed) {
			return json(
				{
					code: 'RATE_LIMITED',
					error: 'Upload rate limit exceeded (max 30 uploads per minute).'
				},
				{ status: 429 }
			);
		}

		const contentType = event.request.headers.get('content-type') ?? '';
		if (!contentType.toLowerCase().startsWith('multipart/form-data')) {
			return json(
				{
					code: 'UNSUPPORTED_MEDIA_TYPE',
					error: 'Content-Type must be multipart/form-data.'
				},
				{ status: 415 }
			);
		}

		const boundedRequest = await readRequestWithByteCap(event.request, MEDIA_REQUEST_MAX_BYTES);

		let formData: FormData;
		try {
			formData = await boundedRequest.formData();
		} catch {
			return json(
				{
					code: 'VALIDATION_ERROR',
					error: 'Malformed multipart/form-data body.'
				},
				{ status: 400 }
			);
		}

		const allowedMetaKeys = new Set<string>([...MEDIA_ALLOWED_METADATA_KEYS, 'altText', 'name']);
		let totalMetadataBytes = 0;
		const metadataRaw: Record<string, string> = {};

		for (const [key, value] of formData.entries()) {
			if (key === 'file') continue;
			if (!allowedMetaKeys.has(key)) {
				return json(
					{
						code: 'VALIDATION_ERROR',
						error: `Unexpected form field "${key}".`
					},
					{ status: 400 }
				);
			}
			if (typeof value !== 'string') {
				return json(
					{
						code: 'VALIDATION_ERROR',
						error: `Field "${key}" must be a text value.`
					},
					{ status: 400 }
				);
			}
			const byteLength = Buffer.byteLength(value, 'utf8');
			totalMetadataBytes += byteLength;
			if (byteLength > MEDIA_METADATA_MAX_BYTES || totalMetadataBytes > MEDIA_METADATA_MAX_BYTES) {
				return json(
					{
						code: 'PAYLOAD_TOO_LARGE',
						error: `Metadata fields exceed the ${MEDIA_METADATA_MAX_BYTES} byte limit.`
					},
					{ status: 413 }
				);
			}
			metadataRaw[key] = value;
		}

		const fileEntry = formData.get('file');
		if (!(fileEntry instanceof File)) {
			return json(
				{
					code: 'VALIDATION_ERROR',
					error: 'Multipart field "file" is required.'
				},
				{ status: 400 }
			);
		}

		if (fileEntry.size === 0) {
			return json(
				{
					code: 'VALIDATION_ERROR',
					error: 'Uploaded file cannot be empty.'
				},
				{ status: 400 }
			);
		}

		if (fileEntry.size > MEDIA_UPLOAD_MAX_BYTES) {
			return json(
				{
					code: 'PAYLOAD_TOO_LARGE',
					error: `File size (${fileEntry.size} bytes) exceeds maximum allowed (${MEDIA_UPLOAD_MAX_BYTES} bytes).`
				},
				{ status: 413 }
			);
		}

		const parsedMeta = mediaPatchSchema.safeParse(metadataRaw);
		if (!parsedMeta.success) {
			return json(
				{
					code: 'VALIDATION_ERROR',
					error: parsedMeta.error.issues[0]?.message ?? 'Invalid metadata fields.',
					details: parsedMeta.error.issues
				},
				{ status: 400 }
			);
		}

		const buffer = Buffer.from(await fileEntry.arrayBuffer());
		const item = await uploadMediaAsset({
			filename: fileEntry.name || 'upload.bin',
			buffer,
			declaredMimeType: fileEntry.type,
			metadata: parsedMeta.data,
			actorUserId: admin.id
		});

		return json({ ...item, item, url: item.urls.original }, { status: 201 });
	} catch (err) {
		if (err instanceof PayloadTooLargeError) {
			return json(
				{
					code: 'PAYLOAD_TOO_LARGE',
					error: err.message
				},
				{ status: 413 }
			);
		}
		return toRestErrorResponse(err);
	}
};
