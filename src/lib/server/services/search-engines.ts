import { submitPostToIndexNow, type IndexNowResult } from './indexnow';
import { submitSitemapToGoogle, type GscSubmitResult } from './google-search-console';

/**
 * One publish-time notification fan-out for every search engine we can
 * legitimately reach. Call sites (admin editor remote functions, admin
 * REST endpoints, the scheduled-publish cron) go through HERE, never
 * through the per-engine services, so a new engine integration is one
 * edit in one file:
 *
 * - IndexNow: per-URL push to Bing, Yandex, Seznam, Naver, Yep (and
 *   therefore Yahoo and Bing Copilot grounding).
 * - Google: sitemap resubmission through the Search Console API, the
 *   only compliant publish-time signal Google accepts for articles.
 *
 * Same contract as both underlying services: MUST be awaited (Vercel
 * serverless freeze semantics), never rejects (each service resolves
 * failures as success:false and logs them internally).
 *
 * Gate every call with {@link shouldNotifySearchEngines} so never-
 * published drafts are never announced (their slugs would leak to
 * engines as permanently-404 URLs).
 */

export { shouldNotifyIndexNow as shouldNotifySearchEngines } from './indexnow';

export interface SearchEngineNotifyResult {
	indexNow: IndexNowResult;
	google: GscSubmitResult;
}

/**
 * Notify all engines that a post's public URL changed (or appeared or
 * vanished). Pass `renamedFromSlug` after a slug rename so the old URL is
 * announced too (IndexNow recrawls it and sees the 301; Google learns the
 * URL set changed from the resubmitted sitemap).
 */
export async function submitPostToSearchEngines(
	slug: string,
	options?: { renamedFromSlug?: string | null }
): Promise<SearchEngineNotifyResult> {
	// Promise.all is safe: both services resolve failures instead of
	// rejecting, so one engine's outage can't hide the other's submission.
	const [indexNow, google] = await Promise.all([
		submitPostToIndexNow(slug, options?.renamedFromSlug),
		submitSitemapToGoogle()
	]);
	return { indexNow, google };
}
