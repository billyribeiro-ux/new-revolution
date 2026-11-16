import { requireAdmin } from '#lib/server/auth-guard';
import { listAdminPosts, listTrashedPosts } from '#lib/server/services/posts';
import { listCategories } from '#lib/server/services/categories';
import { listTags } from '#lib/server/services/tags';
import { listAuthors } from '#lib/server/services/authors';
import type { PageServerLoad } from './$types';

export const prerender = false;

function withTimeout<T>(promise: Promise<T>, label: string, ms = 15_000): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const timer = setTimeout(() => {
			reject(new Error(`Timed out loading ${label} after ${ms}ms`));
		}, ms);
		promise
			.then((val) => {
				clearTimeout(timer);
				resolve(val);
			})
			.catch((err) => {
				clearTimeout(timer);
				reject(err);
			});
	});
}

export const load: PageServerLoad = async (event) => {
	const admin = requireAdmin(event);

	try {
		const [posts, trashedPosts, categories, tags, authors] = await Promise.all([
			withTimeout(listAdminPosts(), 'posts'),
			withTimeout(listTrashedPosts(), 'trashed posts'),
			withTimeout(listCategories(), 'categories'),
			withTimeout(listTags(), 'tags'),
			withTimeout(listAuthors(), 'authors')
		]);

		return {
			admin,
			posts,
			trashedPosts,
			categories,
			tags,
			authors,
			loadError: null as string | null
		};
	} catch (err) {
		return {
			admin,
			posts: [],
			trashedPosts: [],
			categories: [],
			tags: [],
			authors: [],
			loadError: err instanceof Error ? err.message : 'Failed to load blog administration data.'
		};
	}
};
