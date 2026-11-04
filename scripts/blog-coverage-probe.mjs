#!/usr/bin/env node
/**
 * Blog route and publication coverage probe (docs/blog/COVERAGE_MATRIX.md).
 *
 * Usage: node scripts/blog-coverage-probe.mjs <baseUrl> [--json]
 * Requests a fixed set of blog URLs WITHOUT following redirects and prints, per URL: HTTP status, the
 * X-Robots-Tag and Cache-Control headers, the robots meta and canonical in the initial HTML, and counts of
 * the singleton head tags (title, description, canonical, robots) so duplicates are visible.
 *
 * Read-only GETs. Point it at a local `vp preview` seeded with fixtures/mock content, never at production
 * content you are not allowed to touch. Add fixture slugs with BLOG_PROBE_EXTRA="/blog/some-slug,/blog/other".
 */
const base = (process.argv[2] ?? '').replace(/\/+$/, '');
if (!/^https?:\/\//.test(base)) {
	console.error('Usage: node scripts/blog-coverage-probe.mjs <baseUrl> [--json]');
	process.exit(2);
}
const asJson = process.argv.includes('--json');

const URLS = [
	'/blog',
	'/blog?page=2',
	'/blog?page=999',
	'/blog?page=abc',
	'/blog?search=gamma',
	'/blog?utm_source=probe',
	'/blog/does-not-exist-probe',
	'/blog/category/does-not-exist-probe',
	'/blog/tag/does-not-exist-probe',
	'/blog/author/does-not-exist-probe',
	'/blogs',
	'/rss.xml',
	'/sitemap.xml',
	...(process.env.BLOG_PROBE_EXTRA
		? process.env.BLOG_PROBE_EXTRA.split(',').map((s) => s.trim())
		: [])
];

const count = (html, re) => (html.match(re) ?? []).length;
const first = (html, re) => html.match(re)?.[1] ?? null;

const rows = [];
for (const path of URLS) {
	const res = await fetch(base + path, {
		redirect: 'manual',
		headers: { accept: 'text/html,application/xml' }
	});
	const body = (await res.text()).slice(0, 2_000_000);
	rows.push({
		path,
		status: res.status,
		location: res.headers.get('location'),
		xRobots: res.headers.get('x-robots-tag'),
		cacheControl: res.headers.get('cache-control'),
		contentType: res.headers.get('content-type'),
		metaRobots: first(body, /<meta name="robots" content="([^"]*)"/),
		canonical: first(body, /<link rel="canonical" href="([^"]*)"/),
		titles: count(body, /<title>/g),
		descriptions: count(body, /<meta name="description"/g),
		canonicals: count(body, /<link rel="canonical"/g),
		robotsTags: count(body, /<meta name="robots"/g)
	});
}

if (asJson) {
	console.log(JSON.stringify(rows, null, 2));
} else {
	console.log(
		'| URL | Status | X-Robots-Tag | Cache-Control | Meta robots | Canonical | title/desc/canon/robots tags |'
	);
	console.log('| --- | --- | --- | --- | --- | --- | --- |');
	for (const r of rows) {
		const cell = (v) => (v == null || v === '' ? '-' : String(v).replace(/\|/g, '\\|'));
		console.log(
			`| \`${r.path}\` | ${r.status}${r.location ? ` → ${r.location}` : ''} | ${cell(r.xRobots)} | ${cell(r.cacheControl)} | ${cell(r.metaRobots)} | ${cell(r.canonical)} | ${r.titles}/${r.descriptions}/${r.canonicals}/${r.robotsTags} |`
		);
	}
}
