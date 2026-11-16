/** Route id of the public sign-in page. The admin layout does not guard this route. */
export const ADMIN_LOGIN_ROUTE_ID = '/admin/login';
export const ADMIN_LOGIN_PATH = '/admin/login';

export interface AdminAccessUser {
	name: string;
	email: string;
	role?: string | null;
}

export interface AdminAccessInput {
	/** `route.id` of the requested page (e.g. `/admin/posts/[id]`), or null when unmatched. */
	routeId: string | null;
	pathname: string;
	search: string;
	user: AdminAccessUser | null | undefined;
}

export type AdminAccessDecision =
	| { kind: 'public' }
	| { kind: 'allow'; admin: { name: string; email: string } }
	| { kind: 'redirect'; location: string }
	| { kind: 'forbidden' };

/**
 * Decides what the `/admin` layout does for a request. Pure, so it can be unit tested without SvelteKit.
 *
 * The login route is detected by `route.id` rather than by string-matching `pathname`: the route id is
 * exact (it ignores trailing slashes and query strings) and is typed by SvelteKit.
 */
export function decideAdminAccess(input: AdminAccessInput): AdminAccessDecision {
	if (input.routeId === ADMIN_LOGIN_ROUTE_ID) {
		return { kind: 'public' };
	}

	if (!input.user) {
		const next = encodeURIComponent(`${input.pathname}${input.search}`);
		return { kind: 'redirect', location: `${ADMIN_LOGIN_PATH}?next=${next}` };
	}

	if (input.user.role !== 'admin') {
		return { kind: 'forbidden' };
	}

	return { kind: 'allow', admin: { name: input.user.name, email: input.user.email } };
}
