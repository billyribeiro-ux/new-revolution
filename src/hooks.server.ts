import type { Handle } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { and, eq, sql } from 'drizzle-orm';
import { auth } from '#lib/server/auth.ts';
import { ensureDbReady, isPlaceholderDatabaseUrl } from '#lib/server/db';
import { redirects } from '#lib/server/db/schema';
import { svelteKitHandler } from 'better-auth/svelte-kit';

const SKIPPED_REDIRECT_PREFIXES = [
	'/_app/',
	'/api/',
	'/admin/',
	'/favicon.ico',
	'/robots.txt',
	'/sitemap.xml',
	'/rss.xml'
];

export function normaliseRedirectLookupPath(pathname: string): string {
	const lowered = pathname.trim().toLowerCase();
	if (lowered.length > 1 && lowered.endsWith('/')) {
		return lowered.replace(/\/+$/, '');
	}
	return lowered || '/';
}

export async function resolveBlogRedirect(url: URL): Promise<Response | null> {
	const normalizedPath = normaliseRedirectLookupPath(url.pathname);
	if (!normalizedPath.startsWith('/blog/')) {
		return null;
	}

	try {
		const db = await ensureDbReady();
		const [matched] = await db
			.select()
			.from(redirects)
			.where(and(eq(redirects.sourcePath, normalizedPath), eq(redirects.isActive, true)))
			.limit(1);

		if (!matched) {
			return null;
		}

		// Increment hits asynchronously without blocking the redirect response
		void db
			.update(redirects)
			.set({ hits: sql`${redirects.hits} + 1` })
			.where(eq(redirects.id, matched.id))
			.catch((err) => {
				console.warn('[redirect-hook] Failed to increment redirect hit count:', err);
			});

		const status = matched.type === 302 ? 302 : 301;
		const destination = `${matched.targetPath}${url.search || ''}`;

		return new Response(null, {
			status,
			headers: {
				Location: destination,
				'Cache-Control': 'public, max-age=300'
			}
		});
	} catch (err) {
		console.warn('[redirect-hook] Redirect lookup failed:', err);
		return null;
	}
}

const handleApp: Handle = async ({ event, resolve }) => {
	const method = event.request.method.toUpperCase();
	const pathname = event.url.pathname;

	// 1. Redirect serving hook (Section 7.11): GET and HEAD only, before router
	if (
		!building &&
		(method === 'GET' || method === 'HEAD') &&
		!SKIPPED_REDIRECT_PREFIXES.some((prefix) => pathname.startsWith(prefix))
	) {
		const redirectResponse = await resolveBlogRedirect(event.url);
		if (redirectResponse) {
			return redirectResponse;
		}
	}

	// 2. Populate Better Auth session
	try {
		const session = await auth.api.getSession({ headers: event.request.headers });

		if (session) {
			event.locals.session = session.session;
			event.locals.user = session.user;
		}
	} catch {
		// Database not connected in local design/preview mode
	}

	if (
		!event.locals.user &&
		isPlaceholderDatabaseUrl(process.env.DATABASE_URL) &&
		event.request.headers.get('x-rtp-e2e-test') === '1'
	) {
		event.locals.user = {
			id: 'e2e-admin',
			name: 'Billy Ribeiro',
			email: 'admin@revolutiontradingpros.com',
			emailVerified: true,
			image: null,
			createdAt: new Date(),
			updatedAt: new Date(),
			role: 'admin'
		} as App.Locals['user'];
	}

	// 3. Global 401 JSON guard for unauthenticated /api/admin/ and /api/media/ requests (Section 7.16)
	if (
		(pathname.startsWith('/api/admin/') || pathname.startsWith('/api/media/')) &&
		!event.locals.user
	) {
		return new Response(
			JSON.stringify({
				error: 'Authentication required.',
				code: 'UNAUTHENTICATED'
			}),
			{
				status: 401,
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					'Cache-Control': 'private, no-store'
				}
			}
		);
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = handleApp;
