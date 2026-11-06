import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(`${process.cwd()}/package.json`);
const { chromium, firefox, webkit } = require('@playwright/test');
const out = '/private/tmp/font-release-public';
await mkdir(out, { recursive: true });
const origin = 'https://www.revolutiontradingpros.com';
const article = '/blog/0dte-spx-options-strategy-guide';
const proof = [];
for (const [engine, type] of Object.entries({ chromium, firefox, webkit })) {
	const browser = await type.launch({ headless: true });
	try {
		for (const path of [article, '/watchlist']) {
			const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
			const page = await context.newPage();
			const resources = [];
			const errors = [];
			page.on('request', (r) => {
				if (['font', 'stylesheet'].includes(r.resourceType()))
					resources.push({ type: r.resourceType(), url: r.url() });
			});
			page.on('pageerror', (e) => errors.push(e.message));
			const response = await page.goto(origin + path, { waitUntil: 'networkidle' });
			if (response.status() !== 200) throw Error('HTTP ' + response.status());
			await page.evaluate(() => document.fonts.ready);
			const state = await page.evaluate(() => ({
				families: [...document.fonts]
					.filter((x) => x.status === 'loaded')
					.map((x) => x.family.replace(/^["']|["']$/g, '')),
				canonical: document.querySelector('link[rel="canonical"]').getAttribute('href'),
				robots: document.querySelector('meta[name="robots"]').content,
				headingFamily: getComputedStyle(document.querySelector('h1')).fontFamily,
				bodyFamily: getComputedStyle(document.body).fontFamily
			}));
			if (
				!state.families.includes('Montserrat Variable') ||
				!state.families.includes('Sofia Sans Variable')
			)
				throw Error('Primary faces not loaded');
			if (state.canonical !== origin + path || state.robots.includes('noindex'))
				throw Error('metadata mismatch');
			let details;
			if (path === article) {
				if (new URL(page.url()).hash) throw Error('Initial hash mutation');
				const hash = await page.locator('.toc-list a').first().getAttribute('href');
				await page.evaluate((id) => document.getElementById(id).scrollIntoView(), hash.slice(1));
				await page.waitForTimeout(200);
				if (new URL(page.url()).hash) throw Error('Passive hash mutation');
				await page.locator('.toc-list a').first().click();
				await page.waitForURL((url) => url.hash === hash);
				if (new URL(page.url()).hash !== hash) throw Error('TOC navigation');
				await page.reload({ waitUntil: 'networkidle' });
				if (new URL(page.url()).hash !== hash) throw Error('Reload deep link');
				details = {
					hash,
					numericIdLookup: await page.evaluate((id) => !!document.getElementById(id), hash.slice(1))
				};
			} else {
				await page.waitForFunction(
					() => document.querySelectorAll('svg text[font-family]').length > 0
				);
				details = await page
					.locator('svg text[font-family]')
					.evaluateAll((nodes) => ({
						tokens: [...new Set(nodes.map((n) => n.getAttribute('font-family')))],
						resolved: [...new Set(nodes.map((n) => getComputedStyle(n).fontFamily))]
					}));
				if (
					details.tokens.length !== 1 ||
					details.tokens[0] !== 'var(--font-mono)' ||
					details.resolved.some((x) => x.includes('JetBrains') || !x.includes('monospace'))
				)
					throw Error('Chart token not deployed');
			}
			if (resources.some((r) => new URL(r.url).origin !== origin) || errors.length)
				throw Error('External font/stylesheet or page error');
			if (engine === 'chromium')
				await page.screenshot({ path: `${out}/${path === article ? 'article' : 'watchlist'}.png` });
			proof.push({ engine, path, status: response.status(), resources, errors, ...state, details });
			await context.close();
		}
		const context = await browser.newContext({
			javaScriptEnabled: false,
			viewport: { width: 1440, height: 1000 }
		});
		const page = await context.newPage();
		const hash = '#1-what-0dte-changes-about-the-trade';
		await page.goto(origin + article + hash, { waitUntil: 'networkidle' });
		const top = await page.evaluate(
			(id) => document.getElementById(id)?.getBoundingClientRect().top,
			hash.slice(1)
		);
		if (top === undefined || top > 300) throw Error('No-JS deep link');
		proof.push({ engine, path: article + hash, javaScriptEnabled: false, targetTop: top });
		await context.close();
	} finally {
		await browser.close();
	}
}
await writeFile(out + '/proof.json', JSON.stringify(proof, null, 2) + '\n');
console.log(
	'9 live cases passed: article/watchlist fonts and interactions plus no-JavaScript deep links across three browser engines.'
);
