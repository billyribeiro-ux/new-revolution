import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin } from '#lib/server/auth-guard';
import { mediaListQuerySchema } from '#lib/shared/schemas/media';
import {
	listMediaItems,
	listDistinctMediaFolders,
	listTrashedMediaItems
} from '#lib/server/services/media';
import { toRestErrorResponse } from '#lib/server/posts/error-mapper';

export const GET: RequestHandler = async (event) => {
	try {
		requireAdmin(event);

		if (event.url.searchParams.get('trashed') === 'true') {
			const [items, folders] = await Promise.all([
				listTrashedMediaItems(),
				listDistinctMediaFolders()
			]);
			return json({ items, total: items.length, folders, page: 1, per_page: items.length || 24 });
		}

		const rawQuery: Record<string, string> = {};
		for (const [key, value] of event.url.searchParams.entries()) {
			rawQuery[key] = value;
		}

		const parsed = mediaListQuerySchema.safeParse(rawQuery);
		if (!parsed.success) {
			return json(
				{
					code: 'VALIDATION_ERROR',
					error: parsed.error.issues[0]?.message ?? 'Invalid query parameters.',
					details: parsed.error.issues
				},
				{ status: 400 }
			);
		}

		const [listResult, folders] = await Promise.all([
			listMediaItems(parsed.data),
			listDistinctMediaFolders()
		]);

		return json({
			...listResult,
			folders
		});
	} catch (err) {
		return toRestErrorResponse(err);
	}
};
