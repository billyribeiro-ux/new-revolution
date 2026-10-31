import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin } from '#lib/server/auth-guard';
import { consumeRateLimit, RATE_LIMIT_MEDIA_WRITES_PER_MIN } from '#lib/server/rate-limit';
import { listDistinctMediaFolders, createMediaFolderRecord } from '#lib/server/services/media';
import { toRestErrorResponse } from '#lib/server/posts/error-mapper';

export const GET: RequestHandler = async (event) => {
	try {
		requireAdmin(event);
		const folders = await listDistinctMediaFolders();
		return json({ folders });
	} catch (err) {
		return toRestErrorResponse(err);
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		const admin = requireAdmin(event);
		const rl = await consumeRateLimit({
			key: `media_write:${admin.id}`,
			limit: RATE_LIMIT_MEDIA_WRITES_PER_MIN,
			windowMs: 60_000
		});
		if (!rl.allowed) {
			return json(
				{ code: 'RATE_LIMITED', error: 'Media write rate limit exceeded (max 60 per minute).' },
				{ status: 429 }
			);
		}
		const body = await event.request.json().catch(() => ({}));
		const name =
			body && typeof body === 'object' && 'name' in body && typeof body.name === 'string'
				? body.name
				: body && typeof body === 'object' && 'folder' in body && typeof body.folder === 'string'
					? body.folder
					: '';

		const folder = await createMediaFolderRecord(name, admin.id);
		return json({ folder }, { status: 201 });
	} catch (err) {
		return toRestErrorResponse(err);
	}
};
