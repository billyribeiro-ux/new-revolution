import { randomUUID } from 'node:crypto';
import type { Handle } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { and, eq, sql } from 'drizzle-orm';
import { escapeJsonLdBlocksInHtml, isNoIndexRoute } from '#lib/seo/structured-data.ts';
import { auth } from '#lib/server/auth.ts';
import { ensureDbReady } from '#lib/server/db';
import { redirects } from '#lib/server/db/schema';
import { requestLogger } from '#lib/server/logger.ts';
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

export function isNonProductionHost(hostname: string, headers?: Headers): boolean {
	if (headers?.get('x-seo-nonprod-test') === '1') {
		return true;
	}
	const vercelEnv = process.env.VERCEL_ENV || process.env.CF_PAGES_BRANCH || '';
	if (vercelEnv && vercelEnv !== 'production' && vercelEnv !== 'main') {
		return true;
	}
	const lowered = hostname.trim().toLowerCase();
	if (
		lowered.endsWith('.vercel.app') ||
		lowered.endsWith('.pages.dev') ||
		lowered.endsWith('.netlify.app') ||
		lowered.startsWith('staging.') ||
		lowered.startsWith('preview.')
	) {
		return true;
	}
	return false;
}

export function normaliseRedirectLookupPath(pathname: string): string {
	const lowered = pathname.trim().toLowerCase();
	if (lowered.length > 1 && lowered.endsWith('/')) {
		return lowered.replace(/\/+$/, '');
	}
	return lowered || '/';
}

export async function resolveBlogRedirect(url: URL): Promise<Response | null> {
	const normalizedPath = normaliseRedirectLookupPath(url.pathname);
	if (normalizedPath === '/blogs') {
		return new Response(null, {
			status: 308,
			headers: {
				Location: `/blog${url.search || ''}`,
				'Cache-Control': 'public, max-age=3600'
			}
		});
	}
	if (normalizedPath.startsWith('/blogs/')) {
		const slugRest = normalizedPath.slice('/blogs/'.length);
		return new Response(null, {
			status: 308,
			headers: {
				Location: `/blog/${slugRest}${url.search || ''}`,
				'Cache-Control': 'public, max-age=3600'
			}
		});
	}
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
	const reqId = randomUUID();
	event.locals.reqId = reqId;
	event.locals.logger = requestLogger({ reqId, route: pathname, method });

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

	// 2. Populate Better Auth session (ensure local PGlite schema is initialized first)
	if (!building) {
		try {
			await ensureDbReady();
			const session = await auth.api.getSession({ headers: event.request.headers });

			if (session) {
				event.locals.session = session.session;
				event.locals.user = session.user;
			}
		} catch {
			// Database not connected in local design/preview mode
		}
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

	const customResolve: typeof resolve = (resolvedEvent, opts) =>
		resolve(resolvedEvent, {
			...opts,
			preload: ({ type }) => type === 'js' || type === 'css' || type === 'font',
			transformPageChunk: ({ html, done }) => {
				const transformed = opts?.transformPageChunk
					? opts.transformPageChunk({ html, done })
					: html;
				if (typeof transformed === 'string') {
					return escapeJsonLdBlocksInHtml(transformed);
				}
				return Promise.resolve(transformed).then((chunk) =>
					typeof chunk === 'string' ? escapeJsonLdBlocksInHtml(chunk) : chunk
				);
			}
		});

	const response = await svelteKitHandler({
		event,
		resolve: customResolve,
		auth,
		building
	});

	if (isNoIndexRoute(pathname) || isNonProductionHost(event.url.hostname, event.request.headers)) {
		const headers = new Headers(response.headers);
		if (!headers.has('X-Robots-Tag')) {
			headers.set('X-Robots-Tag', 'noindex, nofollow');
		}
		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers
		});
	}

	return response;
};

export const handle: Handle = handleApp;
