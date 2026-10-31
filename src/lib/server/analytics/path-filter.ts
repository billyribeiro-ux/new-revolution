/**
 * Single source of truth for "what counts as a real public page view."
 *
 * Used at TWO layers so the contract stays uniform:
 *
 *   1. Ingestion (`hooks.server.ts:analyticsTracking`) — refuses to insert a
 *      `page_views` row for non-public paths. Stops bot-scan noise from
 *      polluting the table at write time.
 *
 *   2. Query (`services/analytics.ts`) — every read query that powers admin
 *      dashboards (`getTopPages`, `getDailyPageViews`, etc.) joins the
 *      same predicate as a SQL `WHERE` clause so the historical pollution
 *      already in the DB doesn't leak into the admin views.
 *
 * The list is deliberately conservative. We start with a strict prefix
 * deny-list (admin/api/internal SvelteKit asset paths) plus a deny-list
 * of bot-probe shapes that have actually shown up in production logs
 * (.git/, .env, wp-*, vendor/, /sites/, /.well-known/* except the small
 * approved subset). When the deny-list grows, the test in
 * `path-filter.test.ts` documents the policy.
 *
 * Public path shape (allowed):
 *   /, /about, /mission, /contact, /privacy, /terms,
 *   /blog, /blog/<slug>, /blog/category/<slug>, /blog/tag/<slug>,
 *   /downloads/<file>.pdf
 *
 * Anything outside that envelope SHOULD be a 404 on this site, so even if
 * an attacker probes a typo of a real path, we don't track it.
 */

/**
 * Exact-match deny-list for system / framework paths the public never
 * navigates to but that may legitimately respond 200 (manifest, robots
 * etc.). Keeping these as pure equality avoids accidentally matching a
 * future real public route that happens to start with the same prefix.
 */
const DENY_EXACT = new Set<string>([
	'/favicon.ico',
	'/favicon.svg',
	'/favicon-32x32.png',
	'/favicon-48x48.png',
	'/favicon-96x96.png',
	'/favicon-192x192.png',
	'/apple-touch-icon.png',
	'/apple-touch-icon-precomposed.png',
	'/manifest.json',
	'/app.webmanifest',
	'/robots.txt',
	'/sitemap.xml',
	'/rss.xml',
	'/service-worker.js',
	'/health'
]);

/**
 * Prefix deny-list for admin / internal / framework / file-extension
 * surfaces. Order doesn't matter; first match wins.
 */
const DENY_PREFIXES: ReadonlyArray<string> = [
	'/admin',
	'/api',
	'/_app',
	'/_vercel',
	'/.well-known',
	'/.git',
	'/.env',
	'/.vscode',
	'/.idea',
	'/.aws',
	'/.npm',
	'/.svelte-kit',
	'/wp-',
	'/wordpress',
	'/vendor/',
	'/sites/',
	'/cgi-bin',
	'/phpinfo',
	'/phpmyadmin',
	'/server-status',
	'/server-info',
	'/console',
	'/.DS_Store',
	'/images/',
	'/fonts/',
	'/static/',
	'/assets/'
];

/**
 * File-extension deny-list for direct file probes (`/foo.php`, `/x.aspx`,
 * shell-script hunts, etc.). Real pages on this site never end in a file
 * extension — SvelteKit routes are extension-less.
 */
const DENY_EXTENSIONS: ReadonlyArray<string> = [
	'.php',
	'.asp',
	'.aspx',
	'.jsp',
	'.cgi',
	'.pl',
	'.py',
	'.rb',
	'.sh',
	'.bash',
	'.zsh',
	'.sql',
	'.bak',
	'.backup',
	'.old',
	'.swp',
	'.swo',
	'.log',
	'.config',
	'.ini',
	'.yml',
	'.yaml',
	'.toml',
	'.env',
	'.json',
	'.xml',
	'.zip',
	'.tar',
	'.gz',
	'.7z',
	'.rar',
	'.exe',
	'.bin',
	'.dll',
	'.dat',
	'.htaccess',
	'.htpasswd',
	'.well-known',
	'.git',
	'.svn',
	'.hg'
];

/**
 * Predicate: should this path be recorded as a public page view?
 *
 * Only normalised string-shaped paths are accepted. Caller is responsible
 * for stripping query strings before passing the value in (we deliberately
 * don't strip here so a caller that forgets fails the linter loudly via
 * the test suite).
 */
/**
 * UA-substring bot filter shared by every first-party ingest path
 * (page_views via hooks.server.ts, campaign-event beacons). Catches the
 * common Googlebot / Bingbot / Yandex / AhrefsBot family plus the named
 * LLM scrapers, which omit the generic tokens. Keep this list narrow:
 * every entry is enforced at ingest, so an over-broad regex silently
 * zeroes out real human traffic.
 */
export const ANALYTICS_BOT_UA_PATTERN =
	/bot|crawl|spider|slurp|bingpreview|facebookexternalhit|mediapartners|googleother|GPTBot|ClaudeBot|PerplexityBot|CCBot|anthropic-ai|Bytespider|Google-Extended|cohere-ai|Diffbot|FacebookBot|ImagesiftBot|Omgilibot|YouBot/i;

export function isTrackablePath(path: string): boolean {
	if (typeof path !== 'string' || path.length === 0) return false;
	if (path[0] !== '/') return false; // must be a route path, not absolute URL
	if (path[1] === '/') return false; // protocol-relative (`//evil.com/x`) — never a real route
	if (path.includes('?') || path.includes('#')) return false; // caller should normalise
	if (path.length > 256) return false; // long paths are almost always probes

	if (DENY_EXACT.has(path)) return false;

	for (const prefix of DENY_PREFIXES) {
		if (path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(prefix)) {
			// startsWith covers `/admin` AND `/admin/posts`; the equality check
			// catches the bare prefix (e.g. `/wp-admin` vs `/wp-admin/`).
			return false;
		}
	}

	const lower = path.toLowerCase();
	for (const ext of DENY_EXTENSIONS) {
		if (lower.endsWith(ext)) return false;
	}

	// Anything that survived the gauntlet is a public route. The 200/404
	// gate happens in the caller (`hooks.server.ts`) — this predicate is
	// path-shape-only.
	return true;
}

/**
 * SQL fragment that mirrors the predicate above. Drizzle's `sql` template
 * tag interpolates values safely so no manual escaping is needed.
 *
 * NOTE: the SQL filter is INTENTIONALLY broader than the JS predicate at
 * the prefix level — Postgres LIKE patterns can't easily express "starts
 * with one of these N strings AND doesn't match any of these M strings."
 * The cost of the mild over-filtering is zero (worst case, an admin
 * dashboard hides one or two legitimate rows that happened to live under
 * the same prefix); the cost of UNDER-filtering would be bot scans
 * leaking into "Top Pages." Trade-off goes the right way.
 */
export const TRACKABLE_PATH_LIKE_FRAGMENT = `
	path NOT IN (
		'/favicon.ico', '/favicon.svg', '/favicon-32x32.png', '/favicon-48x48.png',
		'/favicon-96x96.png', '/favicon-192x192.png', '/apple-touch-icon.png',
		'/apple-touch-icon-precomposed.png', '/manifest.json', '/app.webmanifest',
		'/robots.txt', '/sitemap.xml', '/rss.xml', '/service-worker.js', '/health'
	)
	AND path NOT LIKE '/admin%'
	AND path NOT LIKE '/api%'
	AND path NOT LIKE '/_app%'
	AND path NOT LIKE '/_vercel%'
	AND path NOT LIKE '/.well-known%'
	AND path NOT LIKE '/.git%'
	AND path NOT LIKE '/.env%'
	AND path NOT LIKE '/.vscode%'
	AND path NOT LIKE '/.idea%'
	AND path NOT LIKE '/.aws%'
	AND path NOT LIKE '/.svelte-kit%'
	AND path NOT LIKE '/wp-%'
	AND path NOT LIKE '/wordpress%'
	AND path NOT LIKE '/vendor/%'
	AND path NOT LIKE '/sites/%'
	AND path NOT LIKE '/cgi-bin%'
	AND path NOT LIKE '/phpinfo%'
	AND path NOT LIKE '/phpmyadmin%'
	AND path NOT LIKE '/server-status%'
	AND path NOT LIKE '/server-info%'
	AND path NOT LIKE '/console%'
	AND path NOT LIKE '/.DS_Store%'
	AND path NOT LIKE '/images/%'
	AND path NOT LIKE '/fonts/%'
	AND path NOT LIKE '/static/%'
	AND path NOT LIKE '/assets/%'
	AND path NOT LIKE '%.php'
	AND path NOT LIKE '%.asp'
	AND path NOT LIKE '%.aspx'
	AND path NOT LIKE '%.jsp'
	AND path NOT LIKE '%.cgi'
	AND path NOT LIKE '%.pl'
	AND path NOT LIKE '%.py'
	AND path NOT LIKE '%.rb'
	AND path NOT LIKE '%.sh'
	AND path NOT LIKE '%.sql'
	AND path NOT LIKE '%.bak'
	AND path NOT LIKE '%.backup'
	AND path NOT LIKE '%.old'
	AND path NOT LIKE '%.config'
	AND path NOT LIKE '%.ini'
	AND path NOT LIKE '%.yml'
	AND path NOT LIKE '%.yaml'
	AND path NOT LIKE '%.toml'
	AND path NOT LIKE '%.env'
	AND path NOT LIKE '%.json'
	AND path NOT LIKE '%.xml'
	AND path NOT LIKE '%.zip'
	AND path NOT LIKE '%.tar'
	AND path NOT LIKE '%.gz'
	AND path NOT LIKE '%.htaccess'
	AND path NOT LIKE '%.htpasswd'
	AND path NOT LIKE '%.git'
	AND path NOT LIKE '%.svn'
	AND path NOT LIKE '%.hg'
`;
