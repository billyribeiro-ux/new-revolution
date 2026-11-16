import { error } from '@sveltejs/kit';
import {
	RESOURCE_TODO_PAGES,
	buildTodoPageMetaTags,
	getResourceTodoSpec
} from '#lib/data/todo-pages.ts';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	RESOURCE_TODO_PAGES.map((spec) => ({ slug: spec.slug! }));

export const load: PageLoad = ({ params }) => {
	const spec = getResourceTodoSpec(params.slug);
	if (!spec) {
		error(404, 'Resource page not found');
	}
	return {
		...buildTodoPageMetaTags(spec),
		todoSpec: spec
	};
};
