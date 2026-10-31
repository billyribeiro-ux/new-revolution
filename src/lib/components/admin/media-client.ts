/**
 * Browser-side helpers for the media picker. Pure TypeScript (no runes) so they can be unit tested
 * without rendering. Every helper rejects with a `MediaRequestError` carrying the HTTP status and the
 * server's own message; nothing is swallowed.
 */
import type { MediaItem } from '#lib/shared/media-upload';

export interface MediaUsageRef {
	id: number;
	title: string;
	slug: string;
}

export class MediaRequestError extends Error {
	readonly status: number;
	readonly usage: MediaUsageRef[];

	constructor(message: string, status: number, usage: MediaUsageRef[] = []) {
		super(message);
		this.name = 'MediaRequestError';
		this.status = status;
		this.usage = usage;
	}
}

interface ErrorBody {
	error?: unknown;
	details?: unknown;
}

function parseBody(text: string): ErrorBody {
	if (!text) return {};
	try {
		const parsed: unknown = JSON.parse(text);
		return parsed && typeof parsed === 'object' ? (parsed as ErrorBody) : {};
	} catch {
		// Not JSON (for example a proxy error page): the caller falls back to the status code.
		return {};
	}
}

function usageFrom(details: unknown): MediaUsageRef[] {
	if (!Array.isArray(details)) return [];
	return details.filter(
		(d): d is MediaUsageRef =>
			!!d &&
			typeof d === 'object' &&
			typeof (d as MediaUsageRef).id === 'number' &&
			typeof (d as MediaUsageRef).title === 'string' &&
			typeof (d as MediaUsageRef).slug === 'string'
	);
}

function toError(status: number, text: string, fallback: string): MediaRequestError {
	const body = parseBody(text);
	const message =
		typeof body.error === 'string' && body.error ? body.error : `${fallback} (${status})`;
	return new MediaRequestError(message, status, usageFrom(body.details));
}

export interface UploadFields {
	folder?: string;
	alt_text?: string;
}

/**
 * Uploads one file with `XMLHttpRequest`, because `fetch` exposes no upload progress events.
 * `onProgress` receives 0-100 based on `upload.onprogress` (only when `lengthComputable`).
 */
export function uploadWithProgress(
	file: File,
	fields: UploadFields,
	onProgress: (percent: number) => void,
	signal?: AbortSignal
): Promise<MediaItem> {
	return new Promise<MediaItem>((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('POST', '/api/media/upload');
		xhr.upload.onprogress = (e) => {
			if (e.lengthComputable && e.total > 0) {
				onProgress(Math.min(100, Math.round((e.loaded / e.total) * 100)));
			}
		};
		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				const body = parseBody(xhr.responseText) as { item?: MediaItem } & Partial<MediaItem>;
				const item = body.item ?? (body.id ? (body as MediaItem) : null);
				if (!item) {
					reject(
						new MediaRequestError('Upload response did not include a media item.', xhr.status)
					);
					return;
				}
				onProgress(100);
				resolve(item);
			} else {
				reject(toError(xhr.status, xhr.responseText, 'Upload failed'));
			}
		};
		xhr.onerror = () => reject(new MediaRequestError('Network error during upload.', 0));
		xhr.onabort = () => reject(new MediaRequestError('Upload cancelled.', 0));
		if (signal) {
			if (signal.aborted) {
				xhr.abort();
				return;
			}
			signal.addEventListener('abort', () => xhr.abort(), { once: true });
		}

		const fd = new FormData();
		fd.set('file', file);
		if (fields.folder?.trim()) fd.set('folder', fields.folder.trim());
		if (fields.alt_text?.trim()) fd.set('alt_text', fields.alt_text.trim());
		xhr.send(fd);
	});
}

/** DELETE /api/media/:id. A 409 `MEDIA_IN_USE` carries the referencing posts in `usage`. */
export async function deleteMediaRequest(id: string): Promise<void> {
	const res = await fetch(`/api/media/${encodeURIComponent(id)}`, { method: 'DELETE' });
	if (res.status === 204 || res.ok) return;
	throw toError(res.status, await res.text(), 'Could not delete media item');
}

/** PATCH /api/media/:id { folder }. An empty string moves the item to Root. */
export async function moveMediaRequest(id: string, folder: string): Promise<void> {
	const res = await fetch(`/api/media/${encodeURIComponent(id)}`, {
		method: 'PATCH',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ folder })
	});
	if (res.ok) return;
	throw toError(res.status, await res.text(), 'Could not move media item');
}

export type BulkResult<T> =
	{ item: T; ok: true } | { item: T; ok: false; error: MediaRequestError | Error };

/**
 * Runs `worker` over `items` with at most `limit` in flight. Never rejects: each item yields an
 * ok/error entry in input order so the caller can report partial failures per item.
 */
export async function runBounded<T>(
	items: readonly T[],
	limit: number,
	worker: (item: T) => Promise<void>
): Promise<BulkResult<T>[]> {
	const results: BulkResult<T>[] = new Array(items.length);
	let next = 0;
	async function lane(): Promise<void> {
		while (next < items.length) {
			const index = next++;
			const item = items[index] as T;
			try {
				await worker(item);
				results[index] = { item, ok: true };
			} catch (err) {
				results[index] = {
					item,
					ok: false,
					error: err instanceof Error ? err : new Error(String(err))
				};
			}
		}
	}
	await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, lane));
	return results;
}

/** Concurrency for bulk write requests. The write endpoints allow 60 requests per minute per admin. */
export const MEDIA_BULK_CONCURRENCY = 3;
