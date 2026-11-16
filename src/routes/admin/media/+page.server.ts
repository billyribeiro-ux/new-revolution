import type { PageServerLoad } from './$types';
import { requireAdmin } from '#lib/server/auth-guard';
import { listMediaItems, listDistinctMediaFolders } from '#lib/server/services/media';

export const load: PageServerLoad = async (event) => {
	requireAdmin(event);
	const [listResult, folders] = await Promise.all([
		listMediaItems({ page: 1, per_page: 24 }),
		listDistinctMediaFolders()
	]);

	return {
		items: listResult.items,
		total: listResult.total,
		folders
	};
};
