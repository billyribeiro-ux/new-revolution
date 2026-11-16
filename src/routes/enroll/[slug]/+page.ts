import { error } from '@sveltejs/kit';
import {
	ENROLL_TODO_PAGES,
	buildTodoPageMetaTags,
	getEnrollTodoSpec
} from '#lib/data/todo-pages.ts';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	ENROLL_TODO_PAGES.map((spec) => ({ slug: spec.slug! }));

export const load: PageLoad = ({ params }) => {
	const spec = getEnrollTodoSpec(params.slug);
	if (!spec) {
		error(404, 'Enrollment route not found');
	}
	return {
		...buildTodoPageMetaTags(spec),
		todoSpec: spec
	};
};
