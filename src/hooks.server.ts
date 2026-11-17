import { CONTENT_SECURITY_POLICY, PERMISSIONS_POLICY } from '#lib/shared/security-policy.ts';
import { randomUUID } from 'node:crypto';
import type { Handle } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { and, eq, sql } from 'drizzle-orm';
import { BRAND } from '#lib/config/brand.ts';
import { escapeJsonLdBlocksInHtml, isNoIndexRoute } from '#lib/seo/structured-data.ts';
import { auth } from '#lib/server/auth.ts';
import { ensureDbReady } from '#lib/server/db';
import { redirects } from '#lib/server/db/schema';
import { isLiveBlogPath } from '#lib/server/posts/redirect-integrity';
import { requestLogger } from '#lib/server/logger.ts';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { conceptCommerceResponse } from '#lib/server/commerce-guard';

const SKIPPED_REDIRECT_PREFIXES = [
	'/_app/',
	'/api/',
	'/admin/',
	'/favicon.ico',
	'/robots.txt',
	'/llms.txt',
	'/sitemap.xml',
	'/rss.xml'
];

/**
 * Only preload JS and CSS chunks. Automatic font preloads remain disabled; src/app.html owns the two approved critical preloads:
 * all fonts are self-hosted statically in `src/app.css` without any font `href` tags.
 */
export function shouldPreload(input: { type: string; path: string; filename?: string }): boolean {
	return input.type === 'js' || input.type === 'css';
}

export function isNonProductionHost(hostname: string): boolean {
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

const SHORT_RESOURCE_REDIRECTS: Readonly<Record<string, string>> = {
	'/options-calculator': '/resources/options-calculator',
	'/intraday-margin-calculator': '/resources/intraday-margin-calculator',
	'/guides/finra-intraday-margin-rule-2026': '/resources/finra-intraday-margin-rule-2026',
	'/sunday-alpha-alerts': '/alert-services/sunday-alpha-protocol',
	'/alert-services/sunday-alpha': '/alert-services/sunday-alpha-protocol'
};

const FALLBACK_BLOG_TO_RESOURCE_REDIRECTS: Readonly<Record<string, string>> = {
	'/blog/finra-intraday-margin-rule-2026': '/resources/finra-intraday-margin-rule-2026',
	'/blog/best-live-options-and-day-trading-rooms':
		'/resources/best-live-options-and-day-trading-rooms',
	'/blog/best-spx-0dte-and-options-alert-services':
		'/resources/best-spx-0dte-and-options-alert-services'
};

export async function resolveBlogRedirect(url: URL): Promise<Response | null> {
	const normalizedPath = normaliseRedirectLookupPath(url.pathname);
	const shortTarget = SHORT_RESOURCE_REDIRECTS[normalizedPath];
	if (shortTarget) {
		return new Response(null, {
			status: 308,
			headers: {
				Location: `${shortTarget}${url.search || ''}`,
				'Cache-Control': 'public, max-age=3600'
			}
		});
	}
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

	const resourceFallback = FALLBACK_BLOG_TO_RESOURCE_REDIRECTS[normalizedPath];

	try {
		const db = await ensureDbReady();
		const [matched] = await db
			.select()
			.from(redirects)
			.where(and(eq(redirects.sourcePath, normalizedPath), eq(redirects.isActive, true)))
			.limit(1);

		if (!matched) {
			if (resourceFallback && !(await isLiveBlogPath(db, normalizedPath))) {
				return new Response(null, {
					status: 308,
					headers: {
						Location: `${resourceFallback}${url.search || ''}`,
						'Cache-Control': 'public, max-age=3600'
					}
				});
			}
			return null;
		}

		// Never 301 into a 404: a redirect whose target is unpublished, trashed or gone is skipped, so the
		// requested URL falls through to the router and answers 404 itself.
		if (!(await isLiveBlogPath(db, matched.targetPath))) {
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
		if (resourceFallback) {
			return new Response(null, {
				status: 308,
				headers: {
					Location: `${resourceFallback}${url.search || ''}`,
					'Cache-Control': 'public, max-age=3600'
				}
			});
		}
		return null;
	}
}

export interface StagingShieldInput {
	pathname: string;
	hostname: string;
	status: number;
	isProduction: boolean;
	existingRobotsTag: string | null;
}

function isStaticAssetPath(pathname: string): boolean {
	return (
		pathname.startsWith('/_app/') ||
		pathname.startsWith('/fonts/') ||
		/\.(?:woff2?|css|js|mjs|png|jpe?g|webp|avif|svg|ico|webmanifest)$/i.test(pathname)
	);
}

export function resolveRobotsAndSecurityHeaders(input: StagingShieldInput): Record<string, string> {
	const out: Record<string, string> = {
		'Content-Security-Policy': CONTENT_SECURITY_POLICY,
		'Permissions-Policy': PERMISSIONS_POLICY
	};
	const isProdEnv = input.isProduction && !isNonProductionHost(input.hostname);

	if (!isProdEnv) {
		if (!input.existingRobotsTag || input.existingRobotsTag === 'noindex') {
			out['X-Robots-Tag'] = 'noindex, nofollow, noarchive, nosnippet';
		}
		return out;
	}

	out['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload';

	if (input.existingRobotsTag || isStaticAssetPath(input.pathname)) {
		return out;
	}

	if (input.status >= 400 || input.pathname.startsWith('/api/') || isNoIndexRoute(input.pathname)) {
		out['X-Robots-Tag'] = 'noindex, nofollow';
		return out;
	}

	out['X-Robots-Tag'] =
		'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
	return out;
}

const handleApp: Handle = async ({ event, resolve }) => {
	const method = event.request.method.toUpperCase();
	const pathname = event.url.pathname;
	const reqId = randomUUID();
	event.locals.reqId = reqId;
	event.locals.logger = requestLogger({ reqId, route: pathname, method });
	const commerceResponse = conceptCommerceResponse(pathname);
	if (commerceResponse) return commerceResponse;

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
			preload: shouldPreload,
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

	const shieldHeaders = resolveRobotsAndSecurityHeaders({
		pathname,
		hostname: event.url.hostname,
		status: response.status,
		isProduction: BRAND.isProduction,
		existingRobotsTag: response.headers.get('X-Robots-Tag')
	});

	if (Object.keys(shieldHeaders).length > 0) {
		const headers = new Headers(response.headers);
		for (const [key, value] of Object.entries(shieldHeaders)) {
			headers.set(key, value);
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
