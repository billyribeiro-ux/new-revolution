import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin } from '#lib/server/auth-guard';
import { mediaPatchSchema } from '#lib/shared/schemas/media';
import {
	getMediaById,
	getMediaUsageInPosts,
	updateMediaMetadata,
	restoreMediaItem,
	deleteMediaItem
} from '#lib/server/services/media';
import { toRestErrorResponse } from '#lib/server/posts/error-mapper';

export const GET: RequestHandler = async (event) => {
	try {
		requireAdmin(event);
		const id = event.params.id?.trim();
		if (!id) {
			return json({ code: 'VALIDATION_ERROR', error: 'Invalid media ID.' }, { status: 400 });
		}

		const item = await getMediaById(id);
		if (!item) {
			return json({ code: 'MEDIA_NOT_FOUND', error: 'Media item not found.' }, { status: 404 });
		}

		const usage = await getMediaUsageInPosts({
			blobUrl: item.urls.original,
			variantsJson: null
		});
		return json({ ...item, item, usage });
	} catch (err) {
		return toRestErrorResponse(err);
	}
};

export const PATCH: RequestHandler = async (event) => {
	try {
		const admin = requireAdmin(event);
		const id = event.params.id?.trim();
		if (!id) {
			return json({ code: 'VALIDATION_ERROR', error: 'Invalid media ID.' }, { status: 400 });
		}

		const body = await event.request.json().catch(() => ({}));
		if (body && typeof body === 'object' && 'action' in body && body.action === 'restore') {
			const restored = await restoreMediaItem(id, admin.id);
			if (!restored) {
				return json({ code: 'MEDIA_NOT_FOUND', error: 'Media item not found.' }, { status: 404 });
			}
			return json({ ...restored, item: restored });
		}

		const parsed = mediaPatchSchema.safeParse(body);
		if (!parsed.success) {
			return json(
				{
					code: 'VALIDATION_ERROR',
					error: parsed.error.issues[0]?.message ?? 'Invalid media update payload.',
					details: parsed.error.issues
				},
				{ status: 400 }
			);
		}

		const updated = await updateMediaMetadata(id, parsed.data, admin.id);
		if (!updated) {
			return json({ code: 'MEDIA_NOT_FOUND', error: 'Media item not found.' }, { status: 404 });
		}
		return json({ ...updated, item: updated });
	} catch (err) {
		return toRestErrorResponse(err);
	}
};

export const DELETE: RequestHandler = async (event) => {
	try {
		const admin = requireAdmin(event);
		const id = event.params.id?.trim();
		if (!id) {
			return json({ code: 'VALIDATION_ERROR', error: 'Invalid media ID.' }, { status: 400 });
		}

		await deleteMediaItem(id, admin.id);
		return new Response(null, { status: 204 });
	} catch (err) {
		return toRestErrorResponse(err);
	}
};
