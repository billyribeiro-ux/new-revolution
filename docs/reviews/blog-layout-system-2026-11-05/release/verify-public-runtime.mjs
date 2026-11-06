import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { chromium } from '@playwright/test';

const { values } = parseArgs({ options: { out: { type: 'string' } } });
assert(values.out, 'Require --out');
const origin = 'https://www.revolutiontradingpros.com';
const slug = '0dte-spx-options-strategy-guide';
const articlePath = `/blog/${slug}`;
const checks = [];
async function check(name, action) {
	try {
		checks.push({ name, status: 'passed', evidence: await action() });
	} catch (error) {
		checks.push({ name, status: 'failed', error: error.message });
	}
}
const source = await fetch(`${origin}${articlePath}`).then((r) => r.text());
assert(source.includes('GetYYYYMMDD'), 'Body-only source term is absent');
for (const path of [
	'/blog?search=GetYYYYMMDD',
	'/blog/category/spx-options?search=GetYYYYMMDD',
	'/blog/tag/risk-management?search=GetYYYYMMDD',
	'/blog?q=GetYYYYMMDD'
])
	await check(`body-only keyword ${path}`, async () => {
		const response = await fetch(`${origin}${path}`),
			body = await response.text();
		assert.equal(response.status, 200);
		const cards = [
			...body.matchAll(
				/<article\b[^>]*class="[^"]*\bblog-post-card\b[^"]*"[^>]*>[\s\S]*?<\/article>/g
			)
		].map((match) => match[0]);
		assert.equal(cards.length, 1);
		assert(cards[0].includes(slug));
		return {
			status: response.status,
			visibleCards: cards.length,
			expectedArticle: slug,
			term: 'GetYYYYMMDD'
		};
	});
await check('nonmatching keyword', async () => {
	const response = await fetch(`${origin}/blog?search=nonexistent-runtime-20261105-xyz`),
		body = await response.text();
	assert.equal(response.status, 200);
	assert(!/<article\b[^>]*class="[^"]*\bblog-post-card\b/.test(body));
	return { status: response.status, visibleCards: 0 };
});
await check('RSS public article', async () => {
	const response = await fetch(`${origin}/rss.xml`),
		body = await response.text();
	assert.equal(response.status, 200);
	assert(body.includes(`${origin}${articlePath}`));
	return { status: response.status, containsPublishedArticle: true };
});
const sitemap = await fetch(`${origin}/sitemap.xml`).then((response) => response.text());
for (const [url] of [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => [match[1]]))
	await check(`Googlebot user-agent ${url}`, async () => {
		const response = await fetch(url, {
				headers: {
					'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
				}
			}),
			body = await response.text();
		assert.equal(response.status, 200);
		assert(!/noindex/i.test(response.headers.get('x-robots-tag') ?? ''));
		assert(!/<meta\b(?=[^>]*name="robots")(?=[^>]*content="[^"]*noindex)[^>]*>/i.test(body));
		const canonical = [
			...body.matchAll(/<link\b(?=[^>]*rel="canonical")[^>]*href="([^"]*)"[^>]*>/gi)
		].map((match) => match[1]);
		assert.deepEqual(canonical, [url]);
		return { status: response.status, canonical: canonical[0] };
	});
for (const path of ['/blog', articlePath, '/sunday-alpha-alerts'])
	await check(`non-www redirect ${path}`, async () => {
		const response = await fetch(`https://revolutiontradingpros.com${path}`, {
			redirect: 'manual'
		});
		assert([301, 308].includes(response.status));
		assert.equal(response.headers.get('location'), `${origin}${path}`);
		return { status: response.status, location: response.headers.get('location') };
	});
await check('legacy query and fragment', async () => {
	const browser = await chromium.launch();
	try {
		const context = await browser.newContext({ reducedMotion: 'reduce' });
		const page = await context.newPage();
		const response = await page.goto(`${origin}/watchlist?ref=public-proof#pricing`, {
			waitUntil: 'load',
			timeout: 25000
		});
		assert.equal(response.status(), 200);
		assert.equal(page.url(), `${origin}/sunday-alpha-alerts?ref=public-proof#pricing`);
		assert.equal(await page.locator('#pricing').count(), 1);
		return { finalUrl: page.url(), status: response.status() };
	} finally {
		await browser.close();
	}
});
await check('private deployment remains protected', async () => {
	const response = await fetch(
		'https://new-revolution-2dhdbttvh-will-ribeiros-projects.vercel.app',
		{ redirect: 'manual' }
	);
	assert([401, 403, 307, 302].includes(response.status));
	const locationOrigin = response.headers.get('location')
		? new URL(response.headers.get('location')).origin
		: null;
	if (locationOrigin) assert.equal(locationOrigin, 'https://vercel.com');
	return { status: response.status, locationOrigin };
});
const report = {
	origin,
	generatedAt: new Date().toISOString(),
	simulatedUserAgentIsNotGoogleIndexingEvidence: true,
	checks,
	passed: checks.filter((item) => item.status === 'passed').length,
	failed: checks.filter((item) => item.status === 'failed').length
};
await writeFile(values.out, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ passed: report.passed, failed: report.failed, report: values.out }));
process.exitCode = report.failed ? 1 : 0;
