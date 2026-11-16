import { requireAdmin } from '#lib/server/auth-guard';
import { listAdminPosts } from '#lib/server/services/posts';
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

	const [posts, categories, tags, authors] = await Promise.all([
		withTimeout(listAdminPosts(), 'posts'),
		withTimeout(listCategories(), 'categories'),
		withTimeout(listTags(), 'tags'),
		withTimeout(listAuthors(), 'authors')
	]);

	return {
		admin,
		categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
		tags: tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
		authors: authors.map((a) => ({ id: a.id, name: a.name, jobTitle: a.jobTitle })),
		allPosts: posts.map((p) => ({ id: p.id, title: p.title, slug: p.slug }))
	};
};
