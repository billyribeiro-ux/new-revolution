import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin } from '#lib/server/auth-guard';
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
