import { createHash } from 'node:crypto';
import { cacheTagHeaderValue, tagsForInvalidatedPaths } from './cache-tags';

/**
 * `Cache-Control` for public blog responses (docs/blog/FRESHNESS.md).
 *
 * The worst case for content that should be gone (an unpublished or deleted post) is
 * `s-maxage + stale-while-revalidate`: 5 + 1 minutes, down from 5 minutes + 24 hours. `stale-if-error` only
 * applies while the origin is failing, and is capped at an hour.
 */
export function buildPublicCacheControl(sMaxAgeSeconds: number): string {
	return `public, max-age=0, s-maxage=${sMaxAgeSeconds}, stale-while-revalidate=60, stale-if-error=3600`;
}

export const PUBLIC_READ_CACHE = buildPublicCacheControl(300);

/** Response header Vercel's CDN reads to tag a cached response for purging. */
export const CACHE_TAG_HEADER = 'Vercel-Cache-Tag';

export const PRIVATE_NO_STORE_CACHE = 'private, no-store, no-cache, must-revalidate';

const invalidatedPathsLog: Array<{ path: string; at: number }> = [];

export function getInvalidatedCachePaths(): ReadonlyArray<{ path: string; at: number }> {
	return invalidatedPathsLog;
}

export function clearInvalidatedCachePathsForTest(): void {
	invalidatedPathsLog.length = 0;
}

export function invalidatePublicBlogCache(paths: string[]): void {
	const now = Date.now();
	for (const p of paths) {
		invalidatedPathsLog.push({ path: p, at: now });
	}
	if (invalidatedPathsLog.length > 500) {
		invalidatedPathsLog.splice(0, invalidatedPathsLog.length - 500);
	}

	const tags = tagsForInvalidatedPaths(paths);
	if (tags.length > 0) {
		invalidatedTagsLog.push({ tags, at: now });
		if (invalidatedTagsLog.length > 500) {
			invalidatedTagsLog.splice(0, invalidatedTagsLog.length - 500);
		}
		runCachePurger(tags);
	}
}

/**
 * Deletes (not just invalidates) the cached responses carrying `tags`, so the next request reaches the origin.
 * Unpublish and delete need that: "invalidate" would serve the stale copy once more.
 */
export type BlogCachePurger = (tags: readonly string[]) => Promise<void>;

let cachePurger: BlogCachePurger | null = null;

/**
 * Registers the CDN purge implementation. None is registered yet: the Vercel purge call needs an authorized
 * credential or dependency (docs/blog/FRESHNESS.md, Phase 1b), so until then tags are only recorded.
 */
export function setBlogCachePurger(purger: BlogCachePurger | null): void {
	cachePurger = purger;
}

/** A failed purge must not fail the content write, but it must be visible, never swallowed. */
function runCachePurger(tags: readonly string[]): void {
	const purger = cachePurger;
	if (!purger) return;
	// `Promise.resolve().then` also contains a purger that throws before it returns a promise.
	void Promise.resolve()
		.then(() => purger(tags))
		.catch((err: unknown) => {
			console.error(
				'[blog-cache] CDN purge failed; cached copies may stay until s-maxage expires:',
				{
					tags,
					err
				}
			);
		});
}

const invalidatedTagsLog: Array<{ tags: string[]; at: number }> = [];

export function getInvalidatedCacheTags(): ReadonlyArray<{ tags: string[]; at: number }> {
	return invalidatedTagsLog;
}

export function clearInvalidatedCacheTagsForTest(): void {
	invalidatedTagsLog.length = 0;
}

export function setPublicReadCache(
	setHeaders: (headers: Record<string, string>) => void,
	locals: Partial<App.Locals> | undefined,
	request: Pick<Request, 'method'>,
	tags: readonly string[] = []
): void {
	const method = request.method.toUpperCase();
	const isReadMethod = method === 'GET' || method === 'HEAD';
	const hasSession = Boolean(locals?.user || locals?.session);

	if (isReadMethod && !hasSession) {
		const tagValue = cacheTagHeaderValue(tags);
		setHeaders({
			'Cache-Control': PUBLIC_READ_CACHE,
			...(tagValue ? { [CACHE_TAG_HEADER]: tagValue } : {})
		});
	} else {
		setHeaders({
			'Cache-Control': PRIVATE_NO_STORE_CACHE
		});
	}
}

export function setNoStoreCache(setHeaders: (headers: Record<string, string>) => void): void {
	setHeaders({
		'Cache-Control': PRIVATE_NO_STORE_CACHE
	});
}

export function computeWeakOrStrongEtag(body: string): string {
	const digest = createHash('sha256').update(body, 'utf8').digest('hex');
	return `"${digest}"`;
}

export function matchesIfNoneMatch(ifNoneMatchHeader: string | null, currentEtag: string): boolean {
	if (!ifNoneMatchHeader) return false;
	const trimmed = ifNoneMatchHeader.trim();
	if (trimmed === '*') return true;

	const normaliseTag = (tag: string) => tag.trim().replace(/^W\//i, '');
	const target = normaliseTag(currentEtag);

	return trimmed
		.split(',')
		.map((part) => normaliseTag(part))
		.some((candidate) => candidate === target);
}

export function createXmlFeedResponse(
	xml: string,
	request: Request,
	sMaxAgeSeconds: number,
	tags: readonly string[] = []
): Response {
	const etag = computeWeakOrStrongEtag(xml);
	const cacheControl = buildPublicCacheControl(sMaxAgeSeconds);
	const tagValue = cacheTagHeaderValue(tags);
	const tagHeaders: Record<string, string> = tagValue ? { [CACHE_TAG_HEADER]: tagValue } : {};

	if (matchesIfNoneMatch(request.headers.get('if-none-match'), etag)) {
		return new Response(null, {
			status: 304,
			headers: {
				ETag: etag,
				'Cache-Control': cacheControl,
				...tagHeaders
			}
		});
	}

	return new Response(xml, {
		status: 200,
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			ETag: etag,
			'Cache-Control': cacheControl,
			...tagHeaders
		}
	});
}

export function createFeedErrorResponse(): Response {
	return new Response('Service temporarily unavailable', {
		status: 503,
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'no-store',
			'Retry-After': '60'
		}
	});
}

export interface SearchNotifyRecord {
	urls: string[];
	at: number;
	succeeded: boolean;
}

const recentNotifications: SearchNotifyRecord[] = [];

export function getSearchNotificationsForTest(): ReadonlyArray<SearchNotifyRecord> {
	return recentNotifications;
}

/**
 * Non-blocking search engine notification (IndexNow + sitemap ping, Section 7.12).
 * Uses platform `waitUntil` if available or runs detached without blocking the save response.
 */
export function notifySearchEnginesAsync(
	urls: string[],
	options?: {
		waitUntil?: (promise: Promise<unknown>) => void;
		onResult?: (succeeded: boolean) => Promise<void> | void;
	}
): void {
	const uniqueUrls = [...new Set(urls.filter(Boolean))];
	if (uniqueUrls.length === 0) return;

	const task = (async () => {
		let succeeded = true;
		try {
			const indexNowKey = process.env.INDEXNOW_KEY;
			if (indexNowKey && process.env.NODE_ENV === 'production') {
				const res = await fetch('https://api.indexnow.org/indexnow', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json; charset=utf-8' },
					body: JSON.stringify({
						host: 'revolutiontradingpros.com',
						key: indexNowKey,
						urlList: uniqueUrls
					})
				});
				if (!res.ok) {
					succeeded = false;
					console.warn(`[search-notify] IndexNow returned HTTP ${res.status}`);
				}
			}
		} catch (err) {
			succeeded = false;
			console.warn('[search-notify] IndexNow notification failed:', err);
		}

		recentNotifications.push({
			urls: uniqueUrls,
			at: Date.now(),
			succeeded
		});
		if (options?.onResult) {
			await options.onResult(succeeded);
		}
	})();

	if (options?.waitUntil) {
		options.waitUntil(task);
	}
}
