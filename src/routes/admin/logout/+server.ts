import { redirect } from '@sveltejs/kit';
import { auth } from '#lib/server/auth.ts';
import type { RequestHandler } from './$types';

/**
 * Signs the admin out. Only POST is exported, so a link or prefetch cannot sign anyone out.
 *
 * CSRF: SvelteKit's built-in origin check (`is_csrf_forbidden` in `@sveltejs/kit` runtime) rejects cross-origin
 * form POSTs before this handler runs, so no token is needed here (verified in node_modules/@sveltejs/kit 3.1.1).
 */
export const POST: RequestHandler = async ({ request }) => {
	await auth.api.signOut({ headers: request.headers });
	redirect(303, '/admin/login');
};
