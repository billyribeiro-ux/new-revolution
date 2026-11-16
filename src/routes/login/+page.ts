import { STATIC_TODO_PAGES, buildTodoPageMetaTags } from '#lib/data/todo-pages.ts';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = () => {
	const spec = STATIC_TODO_PAGES['/login'];
	return {
		...buildTodoPageMetaTags(spec),
		todoSpec: spec
	};
};
