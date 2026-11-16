// Read-only local preview audit; requires the locked Playwright browser.
// node docs/reviews/blog-audit-2026-11-05/browser-probe.mjs http://127.0.0.1:4173
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const base = process.argv[2];
if (!base || !['localhost', '127.0.0.1'].includes(new URL(base).hostname)) {
	throw new Error('Use a local production preview.');
}
const out = 'docs/reviews/blog-audit-2026-11-05';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
	for (const width of [320, 375, 768, 1440]) {
		for (const path of [
			'/blog',
			'/blog/category/market-structure',
			'/blog/tag/spx-options',
			'/blog/institutional-order-flow-and-gamma-flip-playbook'
		]) {
			const context = await browser.newContext({ viewport: { width, height: 900 } });
			const page = await context.newPage();
			const errors = [];
			page.on('pageerror', (err) => errors.push(err.message));
			const response = await page.goto(base + path);
			await page.evaluate(() => document.fonts.ready);
			const data = await page.evaluate(() => {
				const schema = [...document.querySelectorAll('script[type="application/ld+json"]')].map(
					(n) => JSON.parse(n.textContent || '{}')
				);
				const graph = schema.flatMap((s) => s['@graph'] ?? []);
				return {
					title: document.title,
					description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
					h1Count: document.querySelectorAll('h1').length,
					headings: [...document.querySelectorAll('main h1,main h2,main h3,main h4')].map((h) => ({
						level: h.tagName,
						text: h.textContent?.trim()
					})),
					viewportWidth: innerWidth,
					documentWidth: document.documentElement.scrollWidth,
					overflowElements: [...document.querySelectorAll('main *')]
						.filter((n) => n.getBoundingClientRect().right > innerWidth + 1)
						.slice(0, 8)
						.map((n) => ({
							tag: n.tagName,
							class: n.className,
							right: n.getBoundingClientRect().right
						})),
					bodyLinks: [...document.querySelectorAll('main a[href]')]
						.map((n) => new URL(n.href))
						.filter((u) => u.origin === location.origin)
						.map((u) => u.pathname + u.search),
					breadcrumbDom: [...document.querySelectorAll('nav[aria-label="Breadcrumb"] li')]
						.map((n) => n.textContent?.trim())
						.filter((s) => s && s !== '/'),
					breadcrumbSchema: graph
						.find((n) => n['@type'] === 'BreadcrumbList')
						?.itemListElement.map((n) => n.name),
					graphTypes: graph.map((n) => n['@type']),
					images: [...document.querySelectorAll('main img')].map((n) => ({
						src: n.getAttribute('src'),
						width: n.getAttribute('width'),
						height: n.getAttribute('height'),
						complete: n.complete,
						naturalWidth: n.naturalWidth,
						alt: n.alt
					})),
					fontUrls: performance
						.getEntriesByType('resource')
						.map((r) => r.name)
						.filter((s) => /woff|fonts\./.test(s))
				};
			});
			results.push({ width, path, status: response?.status(), errors, ...data });
			if (
				(width === 375 || width === 1440) &&
				(path === '/blog' || path.includes('gamma-flip-playbook'))
			) {
				await page.screenshot({
					path: `${out}/${path === '/blog' ? 'index' : 'article'}-${width}.png`,
					fullPage: true
				});
			}
			await context.close();
		}
	}
} finally {
	await browser.close();
}
const paths = [
	...new Set(
		results
			.flatMap((r) => r.bodyLinks)
			.concat([
				'/spx-profit-pulse',
				'/live-trading-rooms/day-trading',
				'/memberships',
				'/resources',
				'/images/blog/0dte-spx-gex-execution-hero.webp',
				'/images/blog/not-a-real-file.webp'
			])
	)
];
const links = [];
for (const path of paths) {
	const response = await fetch(base + path, { redirect: 'manual' });
	const body = await response.text();
	links.push({
		path,
		status: response.status,
		type: response.headers.get('content-type'),
		placeholder: body.includes('IMAGE PLACEHOLDER'),
		location: response.headers.get('location')
	});
}
writeFileSync(`${out}/browser-results.json`, JSON.stringify({ results, links }, null, 2) + '\n');
console.log(
	JSON.stringify(
		{
			pages: results.length,
			overflows: results.filter((r) => r.documentWidth > r.viewportWidth),
			errors: results.flatMap((r) => r.errors),
			links
		},
		null,
		2
	)
);
