import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(`${process.cwd()}/package.json`);
const { chromium, firefox, webkit } = require('@playwright/test');
const out = process.env.BLOG_INDEX_PROOF_DIR || '/private/tmp/blog-index-browser';
await mkdir(out, { recursive: true });
const origin = 'https://www.revolutiontradingpros.com';
const paths = ['/', '/blog', '/blog/0dte-spx-options-strategy-guide', '/watchlist'];
const proof = [];
for (const [engine, type] of Object.entries({ chromium, firefox, webkit })) {
	const browser = await type.launch({ headless: true });
	try {
		for (const width of [320, 1440]) {
			const context = await browser.newContext({ viewport: { width, height: 1000 } });
			const page = await context.newPage();
			for (const path of paths) {
				const errors = [];
				const listener = (e) => errors.push(e.message);
				page.on('pageerror', listener);
				const response = await page.goto(origin + path, {
					waitUntil: 'networkidle',
					timeout: 45000
				});
				if (response.status() !== 200) throw Error(`${engine} ${path} HTTP ${response.status()}`);
				await page.evaluate(() => document.fonts.ready);
				const state = await page.evaluate(() => ({
					width: innerWidth,
					scrollWidth: document.documentElement.scrollWidth,
					canonical: [...document.querySelectorAll('link[rel="canonical"]')].map((x) =>
						x.getAttribute('href')
					),
					robots: [...document.querySelectorAll('meta[name="robots"]')].map((x) => x.content),
					h1: [...document.querySelectorAll('h1')].map((x) => x.textContent.trim()),
					links: [...document.querySelectorAll('a')].map((x) => x.href),
					fonts: document.fonts.status,
					brokenImages: [...document.images]
						.filter((x) => x.complete && !x.naturalWidth)
						.map((x) => x.currentSrc || x.src),
					tocVisible: [...document.querySelectorAll('nav[aria-label="Table of contents"]')].some(
						(x) => x.getBoundingClientRect().width > 0
					)
				}));
				if (state.scrollWidth > width)
					throw Error(`${engine} ${path} overflows at ${width}: ${state.scrollWidth}`);
				if (
					state.canonical.length !== 1 ||
					state.canonical[0] !== origin + (path === '/' ? '' : path)
				)
					throw Error(`canonical mismatch: ${path}`);
				if (state.robots.some((x) => x.includes('noindex'))) throw Error(`noindex: ${path}`);
				if (state.h1.length !== 1) throw Error(`H1 count: ${path}`);
				if (state.brokenImages.length)
					throw Error(`broken images: ${path} ${JSON.stringify(state.brokenImages)}`);
				if (errors.length) throw Error(`browser errors: ${path} ${JSON.stringify(errors)}`);
				if (['/', '/blog'].includes(path) && !state.links.includes(origin + paths[2]))
					throw Error(`missing article link ${path}`);
				if (engine === 'chromium')
					await page.screenshot({
						path: `${out}/${engine}-${path === '/' ? 'home' : path === '/blog' ? 'archive' : path === '/watchlist' ? 'watchlist' : 'article'}-${width}.png`,
						fullPage: false
					});
				proof.push({
					engine,
					width,
					path,
					status: response.status(),
					...state,
					links: undefined,
					errors
				});
				page.off('pageerror', listener);
			}
			await context.close();
		}
	} finally {
		await browser.close();
	}
}
await writeFile(`${out}/browser-proof.json`, JSON.stringify(proof, null, 2) + '\n');
console.log(
	`${proof.length} public browser cases passed across three engines at 320px and 1440px.`
);
