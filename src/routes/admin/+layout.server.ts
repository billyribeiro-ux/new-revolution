import { error, redirect } from '@sveltejs/kit';
import { decideAdminAccess } from './login/admin-access.ts';
import type { LayoutServerLoad } from './$types';

/** Admin pages are private and must never be prerendered or cached as public HTML. */
export const prerender = false;

/**
 * Guards every `/admin/**` page except `/admin/login`. Data handlers still call `requireAdmin` (defence in depth).
 *
 * `X-Robots-Tag` is set here so every admin page, including the login page, is marked noindex. robots.txt
 * `Disallow` alone does not stop indexing (see docs/ADMIN_AUTH_PLAN.md section 3).
 */
export const load: LayoutServerLoad = ({ locals, url, route, setHeaders }) => {
	setHeaders({ 'X-Robots-Tag': 'noindex, nofollow' });

	const decision = decideAdminAccess({
		routeId: route.id,
		pathname: url.pathname,
		search: url.search,
		user: locals.user
	});

	if (decision.kind === 'public') return { admin: null };
	if (decision.kind === 'allow') return { admin: decision.admin };
	if (decision.kind === 'redirect') redirect(303, decision.location);
	error(403, 'Admin role required.');
};
