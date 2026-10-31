import { createSign } from 'node:crypto';
import * as env from '$app/env/private';
import { getPublicBaseUrl } from '#lib/server/config/runtime.js';
import { logger } from '#lib/server/logger.js';

/**
 * Google Search Console sitemap resubmission via the Search Console API
 * (`sitemaps.submit`). This is Google's sanctioned replacement for the
 * sitemap ping endpoint it retired in 2023: there is NO compliant per-URL
 * push for blog content (the Indexing API is restricted to JobPosting /
 * BroadcastEvent), so notifying Google that sitemap.xml changed is the
 * strongest automatic publish-time signal available. Sources, both under
 * developers.google.com: search/blog/2023/06/sitemaps-lastmod-ping and
 * webmaster-tools/v1/sitemaps/submit. Google still decides crawl timing;
 * the accurate per-post `lastmod` in the sitemap remains the priority
 * signal.
 *
 * Call this alongside IndexNow after ANY change to a post's PUBLIC
 * visibility (use `submitPostToSearchEngines` from `search-engines.ts`
 * rather than calling either service directly).
 *
 * Callers MUST await the returned promise (Vercel serverless can freeze
 * the instance once the response is sent, silently dropping un-awaited
 * fetches). The promise never rejects: config and delivery failures are
 * logged here and resolve as success:false, so awaiting cannot fail the
 * surrounding request.
 *
 * Requires two env vars; unset means every submission no-ops WITH a
 * warning log (same contract as INDEXNOW_API_KEY):
 * - GSC_SERVICE_ACCOUNT_JSON: the entire downloaded service-account key
 *   file, as one line. The service account must be added as a user on
 *   the Search Console property.
 * - GSC_SITE_URL: the exact property identifier, either
 *   "sc-domain:teamconsulting360.com" or "https://www.teamconsulting360.com/".
 *
 * Setup runbook: SEO/runbooks/google-indexing-operations.md
 */

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/webmasters';
/**
 * One deadline for the whole submission (token + PUT). Publish handlers
 * run inside Vercel's 10s Hobby function cap alongside DB writes and the
 * IndexNow POST, so a hanging Google endpoint must abort long before it
 * can time the request out.
 */
const SUBMIT_DEADLINE_MS = 5000;

export interface GscSubmitResult {
	success: boolean;
	error?: string;
}

interface ServiceAccountKey {
	clientEmail: string;
	privateKey: string;
}

interface GscConfig {
	account: ServiceAccountKey;
	siteUrl: string;
}

function readConfig(): GscConfig | { error: string } {
	const rawJson = env['GSC_SERVICE_ACCOUNT_JSON'];
	const siteUrl = env['GSC_SITE_URL']?.trim();
	if (!rawJson || !siteUrl) {
		// Misconfiguration must be loud: without this line an unset var means
		// every submission silently no-ops forever.
		const missing = [
			...(rawJson ? [] : ['GSC_SERVICE_ACCOUNT_JSON']),
			...(siteUrl ? [] : ['GSC_SITE_URL'])
		].join(', ');
		logger.warn(`[gsc] ${missing} not configured, sitemap submission skipped`);
		return { error: `${missing} not configured` };
	}

	try {
		const parsed: unknown = JSON.parse(rawJson);
		const clientEmail =
			typeof parsed === 'object' && parsed !== null && 'client_email' in parsed
				? parsed.client_email
				: undefined;
		const privateKey =
			typeof parsed === 'object' && parsed !== null && 'private_key' in parsed
				? parsed.private_key
				: undefined;
		if (typeof clientEmail !== 'string' || typeof privateKey !== 'string') {
			logger.warn('[gsc] GSC_SERVICE_ACCOUNT_JSON is missing client_email/private_key');
			return { error: 'GSC_SERVICE_ACCOUNT_JSON is missing client_email/private_key' };
		}
		return { account: { clientEmail, privateKey }, siteUrl };
	} catch {
		logger.warn('[gsc] GSC_SERVICE_ACCOUNT_JSON is not valid JSON');
		return { error: 'GSC_SERVICE_ACCOUNT_JSON is not valid JSON' };
	}
}

/** RS256 service-account JWT for the OAuth token exchange. */
function buildAssertion(account: ServiceAccountKey, nowSeconds: number): string {
	const encode = (value: object): string =>
		Buffer.from(JSON.stringify(value)).toString('base64url');
	const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
		iss: account.clientEmail,
		scope: SCOPE,
		aud: TOKEN_URL,
		iat: nowSeconds,
		exp: nowSeconds + 3600
	})}`;
	const signature = createSign('RSA-SHA256').update(unsigned).sign(account.privateKey, 'base64url');
	return `${unsigned}.${signature}`;
}

/**
 * Access-token cache. Serverless instances are reused between requests,
 * so caching saves one round-trip per publish while the token is fresh.
 */
let cachedToken: { token: string; expiresAtMs: number } | null = null;

async function getAccessToken(account: ServiceAccountKey, signal: AbortSignal): Promise<string> {
	if (cachedToken && cachedToken.expiresAtMs - 60_000 > Date.now()) {
		return cachedToken.token;
	}

	const assertion = buildAssertion(account, Math.floor(Date.now() / 1000));
	const response = await fetch(TOKEN_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
			assertion
		}),
		signal
	});
	if (!response.ok) {
		throw new Error(`token endpoint returned ${response.status}`);
	}
	const payload = (await response.json()) as { access_token?: string; expires_in?: number };
	if (!payload.access_token) {
		throw new Error('token endpoint returned no access_token');
	}
	cachedToken = {
		token: payload.access_token,
		expiresAtMs: Date.now() + (payload.expires_in ?? 3600) * 1000
	};
	return payload.access_token;
}

async function doSubmit(): Promise<GscSubmitResult> {
	const config = readConfig();
	if ('error' in config) {
		return { success: false, error: config.error };
	}

	// Everything below stays inside the try so the never-rejects contract
	// holds even when getPublicBaseUrl() throws (unset PUBLIC_APP_URL).
	let sitemapUrl = '';
	try {
		sitemapUrl = `${getPublicBaseUrl()}/sitemap.xml`;
		const submitUrl =
			'https://www.googleapis.com/webmasters/v3/sites/' +
			`${encodeURIComponent(config.siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;

		const signal = AbortSignal.timeout(SUBMIT_DEADLINE_MS);
		const token = await getAccessToken(config.account, signal);
		const response = await fetch(submitUrl, {
			method: 'PUT',
			headers: { Authorization: `Bearer ${token}` },
			signal
		});

		if (response.ok) {
			return { success: true };
		}
		// A 403 here means the service account is not a user on the property
		// (or GSC_SITE_URL names the wrong property). Failures resolve (never
		// reject) so call sites can't crash, which makes logging HERE the only
		// place they become observable.
		logger.warn(
			{ status: response.status, siteUrl: config.siteUrl, sitemapUrl },
			'[gsc] sitemap submission rejected'
		);
		return { success: false, error: `sitemaps.submit returned ${response.status}` };
	} catch (err) {
		logger.warn({ err, siteUrl: config.siteUrl, sitemapUrl }, '[gsc] sitemap submission failed');
		return {
			success: false,
			error: err instanceof Error ? err.message : 'Unknown error'
		};
	}
}

/**
 * Concurrent callers share one in-flight submission: the scheduled-publish
 * cron fires one notification per flipped post, but Google only needs to
 * hear "sitemap.xml changed" once per batch. Sequential calls (publish
 * then unpublish minutes later) still each submit, because the slot clears
 * as soon as the submission settles.
 */
let inflight: Promise<GscSubmitResult> | null = null;

export async function submitSitemapToGoogle(): Promise<GscSubmitResult> {
	if (inflight) return inflight;
	inflight = doSubmit().finally(() => {
		inflight = null;
	});
	return inflight;
}
