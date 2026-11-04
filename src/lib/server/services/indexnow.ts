import * as env from '$app/env/private';
import { getPublicBaseUrl } from '#lib/server/config/runtime.js';
import { logger } from '#lib/server/logger.js';

/**
 * IndexNow, instant URL submission to Bing and every other IndexNow
 * engine (Yandex, Seznam, Naver, Yep; one endpoint propagates to all
 * participants, per indexnow.org/faq). Yahoo organic results are served
 * by Bing, so this is also the Yahoo freshness path.
 *
 * Call this after ANY change to a post's PUBLIC visibility: publish,
 * live-content update, unpublish, archive, trash, restore. The protocol
 * covers additions, updates AND deletions: engines recrawl the URL and
 * drop it if it now 404s. Use {@link shouldNotifyIndexNow} to decide,
 * so never-published drafts are NEVER submitted (their slugs would leak
 * to engines as permanently-404 URLs, and repeated 404 submissions can
 * erode the engines' trust in the site's key).
 *
 * Callers MUST await the returned promise. On Vercel serverless the
 * instance can be frozen as soon as the response is sent, so an
 * un-awaited fetch may silently never complete. The promise never
 * rejects for delivery failures (they resolve as success:false and are
 * logged here), so awaiting cannot fail the surrounding request.
 *
 * Requires INDEXNOW_API_KEY env var to be set (key file is served by
 * src/routes/[indexnowKey].txt).
 *
 * Docs: https://www.indexnow.org/documentation
 */

/**
 * Notify engines only when the post WAS publicly visible or BECOMES
 * publicly visible. Truth table: publish (false to true) yes, live edit
 * (true to true) yes, unpublish/archive (true to false) yes, draft save
 * of a never-published post (false to false) NO.
 */
export function shouldNotifyIndexNow(prevPublished: boolean, nowPublished: boolean): boolean {
	return prevPublished || nowPublished;
}

/**
 * Abort deadline for the IndexNow POST. Publish handlers await this in
 * parallel with the Search Console submission (same 5s deadline) inside
 * Vercel's 10s Hobby function cap, so a stalled endpoint must give up long
 * before it can time out the editor's save or the publish cron.
 */
const SUBMIT_DEADLINE_MS = 5000;

export interface IndexNowResult {
	success: boolean;
	/** URLs actually sent this call (after in-call dedupe). */
	submitted: number;
	error?: string;
}

export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
	const apiKey = env['INDEXNOW_API_KEY'];
	if (!apiKey) {
		// Misconfiguration must be loud: without this line an unset key means
		// every submission silently no-ops forever.
		logger.warn({ urls }, '[indexnow] INDEXNOW_API_KEY not configured, submission skipped');
		return { success: false, submitted: 0, error: 'INDEXNOW_API_KEY not configured' };
	}

	const siteUrl = getPublicBaseUrl();
	const siteHost = new URL(siteUrl).hostname;
	const due = [...new Set(urls)];

	try {
		const response = await fetch('https://api.indexnow.org/indexnow', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json; charset=utf-8' },
			body: JSON.stringify({
				host: siteHost,
				key: apiKey,
				keyLocation: `${siteUrl}/${apiKey}.txt`,
				urlList: due
			}),
			// An abort rejects into the catch below: logged, success:false.
			signal: AbortSignal.timeout(SUBMIT_DEADLINE_MS)
		});

		if (response.ok || response.status === 202) {
			return { success: true, submitted: due.length };
		}

		// Failures resolve (never reject) so call sites can't crash, which
		// means logging HERE is the only place a 429/5xx becomes observable.
		logger.warn({ status: response.status, urls: due }, '[indexnow] submission rejected');
		return { success: false, submitted: 0, error: `IndexNow returned ${response.status}` };
	} catch (err) {
		logger.warn({ err, urls: due }, '[indexnow] submission failed');
		return {
			success: false,
			submitted: 0,
			error: err instanceof Error ? err.message : 'Unknown error'
		};
	}
}

/**
 * Submit a post's URL plus the /blog listing (which changes whenever a
 * post appears on, changes on, or disappears from it). On a slug rename
 * pass `renamedFromSlug` so the OLD URL is submitted too: engines recrawl
 * it and pick up the 301 to the new slug instead of serving the stale
 * copy until an organic recrawl.
 */
export async function submitPostToIndexNow(
	slug: string,
	renamedFromSlug?: string | null
): Promise<IndexNowResult> {
	const siteUrl = getPublicBaseUrl();
	const urls = [`${siteUrl}/blog/${slug}`, `${siteUrl}/blog`];
	if (renamedFromSlug && renamedFromSlug !== slug) {
		urls.push(`${siteUrl}/blog/${renamedFromSlug}`);
	}
	return submitToIndexNow(urls);
}
