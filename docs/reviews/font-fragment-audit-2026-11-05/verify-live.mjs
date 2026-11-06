import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const require = createRequire(`${process.cwd()}/package.json`);
const { chromium } = require('@playwright/test');
const origin = 'https://www.revolutiontradingpros.com';
const article = '/blog/0dte-spx-options-strategy-guide';
const out = process.env.FONT_FRAGMENT_PROOF_DIR || '/private/tmp/font-fragment-live-audit';
await mkdir(out, { recursive: true });
const inventory = await readFile('urls.md', 'utf8');
const publicPaths = [
	...inventory.matchAll(/https:\/\/www\.revolutiontradingpros\.com(?:\/[^\s`<)]*)?/g)
]
	.map((match) => new URL(match[0]).pathname)
	.filter((path) => !path.endsWith('.xml') && !path.endsWith('.txt'));
const paths = [
	...new Set([...publicPaths, '/admin/login', '/maintenance/index.html', '/font-audit-nonexistent'])
];
const browser = await chromium.launch({ headless: true });
const results = [];
let fragments;
try {
	for (const path of paths) {
		const context = await browser.newContext({
			viewport: { width: 1440, height: 1000 },
			serviceWorkers: 'block'
		});
		const page = await context.newPage();
		const requests = [];
		const fontResponses = [];
		const errors = [];
		page.on('request', (r) => {
			if (
				r.resourceType() === 'font' ||
				r.resourceType() === 'stylesheet' ||
				/fonts\.(googleapis|gstatic)|use\.typekit|fonts\.bunny/.test(r.url())
			)
				requests.push({ type: r.resourceType(), url: r.url() });
		});
		page.on('response', (r) => {
			if (r.request().resourceType() === 'font')
				fontResponses.push({
					url: r.url(),
					status: r.status(),
					contentType: r.headers()['content-type']
				});
		});
		page.on('pageerror', (e) => errors.push(e.message));
		const response = await page.goto(origin + path, { waitUntil: 'networkidle', timeout: 45000 });
		await page.evaluate(() => document.fonts.ready);
		const state = await page.evaluate(() => ({
			preloads: [...document.querySelectorAll('link[as="font"]')].map((x) => ({
				href: x.href,
				rel: x.rel
			})),
			stylesheets: [...document.querySelectorAll('link[rel="stylesheet"]')].map((x) => x.href),
			loadedFaces: [...document.fonts]
				.filter((x) => x.status === 'loaded')
				.map((x) => ({ family: x.family, style: x.style, weight: x.weight })),
			headingFamily: document.querySelector('h1')
				? getComputedStyle(document.querySelector('h1')).fontFamily
				: null,
			bodyFamily: getComputedStyle(document.body).fontFamily
		}));
		const external = requests.filter((x) => new URL(x.url).origin !== origin);
		if (external.length)
			throw Error(`External font/stylesheet on ${path}: ${JSON.stringify(external)}`);
		if (
			fontResponses.some(
				(x) => x.status !== 200 || !x.url.startsWith(origin + '/_app/immutable/assets/')
			)
		)
			throw Error(`Font response failure ${path}`);
		if (path === article) {
			const initialHash = await page.evaluate(() => location.hash);
			if (initialHash) throw Error('Initial article hash mutated');
			const heading = await page.locator('.toc-list a').first().getAttribute('href');
			const id = heading.slice(1);
			const selectorEvidence = await page.evaluate((id) => {
				let rawThrows = false;
				try {
					document.querySelector('#' + id);
				} catch {
					rawThrows = true;
				}
				return {
					id,
					getElementByIdFound: !!document.getElementById(id),
					escapedSelectorFound: !!document.querySelector('#' + CSS.escape(id)),
					rawSelectorThrows: rawThrows
				};
			}, id);
			await page.evaluate((id) => document.getElementById(id).scrollIntoView(), id);
			await page.waitForTimeout(250);
			const hashAfterScroll = await page.evaluate(() => location.hash);
			if (hashAfterScroll) throw Error('Scroll-spy mutates hash');
			await page.locator('.toc-list a').first().click();
			await page.waitForTimeout(200);
			const clickedHash = await page.evaluate(() => location.hash);
			if (clickedHash !== heading) throw Error('TOC hash does not match heading');
			const metadata = await page.evaluate(() => ({
				canonical: document.querySelector('link[rel="canonical"]').getAttribute('href'),
				ogUrl: document.querySelector('meta[property="og:url"]').content
			}));
			if (Object.values(metadata).some((x) => new URL(x).hash)) throw Error('Metadata hash leak');
			await page.reload({ waitUntil: 'networkidle' });
			const reloadHash = await page.evaluate(() => location.hash);
			if (reloadHash !== heading) throw Error('Deep link lost on reload');
			fragments = {
				initialHash,
				hashAfterScroll,
				clickedHash,
				reloadHash,
				selectorEvidence,
				metadata
			};
		}
		results.push({
			path,
			status: response.status(),
			requests,
			fontResponses,
			externalRequests: external,
			errors,
			...state
		});
		await context.close();
	}
	const plain = await browser.newContext({
		javaScriptEnabled: false,
		viewport: { width: 1440, height: 1000 }
	});
	const page = await plain.newPage();
	await page.goto(origin + article + fragments.clickedHash, { waitUntil: 'networkidle' });
	const pos = await page.evaluate(
		(id) => document.getElementById(id)?.getBoundingClientRect().top,
		fragments.clickedHash.slice(1)
	);
	if (pos === undefined || pos > 300) throw Error(`No-JS deep-link target not reached ${pos}`);
	fragments.noJavaScriptTargetTop = pos;
	await plain.close();
	await writeFile(out + '/proof.json', JSON.stringify({ results, fragments }, null, 2) + '\n');
	console.log(
		JSON.stringify(
			{
				pages: results.length,
				fontRequests: results.reduce((n, x) => n + x.fontResponses.length, 0),
				externalFontOrStylesheetRequests: 0,
				fragments
			},
			null,
			2
		)
	);
} finally {
	await browser.close();
}
