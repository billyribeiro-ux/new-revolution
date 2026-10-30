import { createHash } from 'node:crypto';

export const PUBLIC_READ_CACHE =
	'public, max-age=0, s-maxage=300, stale-while-revalidate=86400, stale-if-error=86400';

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
}

export function setPublicReadCache(
	setHeaders: (headers: Record<string, string>) => void,
	locals: App.Locals | undefined,
	request: Pick<Request, 'method'>
): void {
	const method = request.method.toUpperCase();
	const isReadMethod = method === 'GET' || method === 'HEAD';
	const hasSession = Boolean(locals?.user || locals?.session);

	if (isReadMethod && !hasSession) {
		setHeaders({
			'Cache-Control': PUBLIC_READ_CACHE
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
	sMaxAgeSeconds: number
): Response {
	const etag = computeWeakOrStrongEtag(xml);
	const cacheControl = `public, max-age=0, s-maxage=${sMaxAgeSeconds}, stale-while-revalidate=86400, stale-if-error=86400`;

	if (matchesIfNoneMatch(request.headers.get('if-none-match'), etag)) {
		return new Response(null, {
			status: 304,
			headers: {
				ETag: etag,
				'Cache-Control': cacheControl
			}
		});
	}

	return new Response(xml, {
		status: 200,
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			ETag: etag,
			'Cache-Control': cacheControl
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
