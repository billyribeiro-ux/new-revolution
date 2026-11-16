import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium, firefox, webkit } from '@playwright/test';
import sharp from 'sharp';

const { values } = parseArgs({
	options: {
		origin: { type: 'string' },
		outdir: { type: 'string' },
		article: { type: 'string' },
		tag: { type: 'string' },
		'cookie-file': { type: 'string' },
		engine: { type: 'string' },
		'only-interactions': { type: 'boolean' },
		help: { type: 'boolean' }
	}
});
if (values.help) {
	console.log(
		'pnpm exec node docs/reviews/blog-layout-system-2026-11-05/release/verify-browser.mjs --origin URL --outdir PATH [--article /blog/slug] [--tag risk-management] [--cookie-file PATH] [--engine chromium|firefox|webkit] [--only-interactions]'
	);
	process.exit(0);
}
assert(values.origin && values.outdir, '--origin and --outdir are required');
const originUrl = new URL(values.origin);
assert(
	['http:', 'https:'].includes(originUrl.protocol) &&
		!originUrl.username &&
		!originUrl.password &&
		originUrl.pathname === '/' &&
		!originUrl.search &&
		!originUrl.hash,
	'--origin must be a plain HTTP(S) origin'
);
const origin = originUrl.origin;
const article = values.article?.startsWith('/')
	? values.article
	: `/blog/${values.article ?? '0dte-spx-options-strategy-guide'}`;
const tag = values.tag?.startsWith('/')
	? values.tag
	: `/blog/tag/${values.tag ?? 'risk-management'}`;
assert(
	/^\/blog\/[^/?#]+$/.test(article) && /^\/blog\/tag\/[^/?#]+$/.test(tag),
	'Article/tag must be concrete local blog paths'
);
const outdir = resolve(values.outdir);
await mkdir(outdir, { recursive: true });
let cookies = [];
if (values['cookie-file']) {
	try {
		const parsed = JSON.parse(await readFile(values['cookie-file'], 'utf8'));
		cookies = Array.isArray(parsed) ? parsed : parsed.cookies;
		assert(Array.isArray(cookies));
	} catch {
		throw new Error('Cookie file must contain a cookie array or Playwright storage-state object');
	}
}
const secrets = cookies.flatMap((cookie) =>
	typeof cookie?.value === 'string' && cookie.value ? [cookie.value] : []
);
const redact = (value) =>
	secrets.reduce((text, secret) => text.replaceAll(secret, '[redacted]'), String(value));
const report = {
	origin,
	article,
	tag,
	protectedStage: Boolean(values['cookie-file']),
	generatedAt: new Date().toISOString(),
	scenarios: []
};
const started = Date.now();
const selectedEngines = values.engine ? [values.engine] : ['chromium', 'firefox', 'webkit'];
assert(
	selectedEngines.every((engine) => ['chromium', 'firefox', 'webkit'].includes(engine)),
	'Unknown engine'
);
report.scope = { engines: selectedEngines, onlyInteractions: Boolean(values['only-interactions']) };
const redactValue = (value) =>
	typeof value === 'string'
		? redact(value)
		: Array.isArray(value)
			? value.map(redactValue)
			: value && typeof value === 'object'
				? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactValue(item)]))
				: value;
async function saveProgress() {
	report.elapsedMs = Date.now() - started;
	await writeFile(
		resolve(outdir, 'browser-verification.json'),
		JSON.stringify(redactValue(report), null, 2) + '\n'
	);
}
const decoded = new Map();
const contextTraffic = new WeakMap();
// Node-side bounded settling also works when site JavaScript (and animation callbacks) is disabled.
const settle = (page) => page.waitForTimeout(80);
const closeTo = (actual, expected, label, tolerance = 1) =>
	assert(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} vs ${expected}`);
const pathName = (path) => path.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home';

async function contextFor(browser, options = {}) {
	const context = await browser.newContext({
		baseURL: origin,
		reducedMotion: 'reduce',
		serviceWorkers: 'block',
		...options
	});
	context.setDefaultTimeout(15000);
	context.setDefaultNavigationTimeout(25000);
	const traffic = {
		interceptedPassiveAnalytics: [],
		preventedWrites: [],
		javaScriptDisabled: options.javaScriptEnabled === false
	};
	contextTraffic.set(context, traffic);
	await context.route('**/*', async (route) => {
		const request = route.request();
		if (['GET', 'HEAD'].includes(request.method())) return route.continue();
		const url = new URL(request.url());
		if (
			request.method() === 'POST' &&
			url.origin === origin &&
			url.pathname === '/api/analytics/pageview' &&
			!url.search
		) {
			traffic.interceptedPassiveAnalytics.push({
				method: 'POST',
				path: url.pathname,
				localStatus: 204,
				hostedOperationExercised: false
			});
			return route.fulfill({ status: 204 });
		}
		traffic.preventedWrites.push({ method: request.method(), url: request.url() });
		return route.abort('blockedbyclient');
	});
	try {
		if (cookies.length) await context.addCookies(cookies);
	} catch {
		await context.close();
		throw new Error('Unable to apply cookies; check cookie-file format');
	}
	return context;
}
function watch(page, blockedFonts = false) {
	const events = {
		pageErrors: [],
		consoleErrors: [],
		resources: [],
		requestFailures: [],
		expectedBlockedFontErrors: []
	};
	events.traffic = contextTraffic.get(page.context());
	page.on('pageerror', (error) => events.pageErrors.push(redact(error.message)));
	page.on('console', (message) => {
		if (message.type() !== 'error') return;
		const text = redact(message.text());
		if (
			blockedFonts &&
			/font|woff|ERR_FAILED|NS_ERROR|Load failed|Failed to load resource|cancelled/i.test(text)
		)
			events.expectedBlockedFontErrors.push(text);
		else events.consoleErrors.push(text);
	});
	page.on('requestfailed', (request) => {
		const type = request.resourceType();
		const error = request.failure()?.errorText;
		const noJsBlock = events.traffic.javaScriptDisabled && type === 'script' && error === 'csp';
		const fontBlock = blockedFonts && type === 'font';
		events.requestFailures.push({
			type,
			url: request.url(),
			error,
			expected: Boolean(noJsBlock || fontBlock),
			reason: noJsBlock
				? 'Browser intentionally blocks module preloads with JavaScript disabled'
				: fontBlock
					? 'Font request intentionally blocked by this scenario'
					: undefined
		});
	});
	page.on('response', (response) => {
		const type = response.request().resourceType();
		if (type === 'font' || type === 'stylesheet')
			events.resources.push({ type, url: response.url(), status: response.status() });
	});
	return events;
}
async function navigate(page, path) {
	const response = await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 25000 });
	assert(response?.status() === 200, `Expected HTTP200 for ${path}, got ${response?.status()}`);
	// Without site JavaScript, DOMContentLoaded can precede stylesheet loading and the native
	// fragment jump. FontFaceSet can temporarily report loaded before those styles register faces.
	await page.waitForLoadState('load', { timeout: 25000 });
	let fontsLoaded = false;
	for (let attempt = 0; attempt < 200; attempt += 1) {
		if (await page.evaluate(() => document.fonts.status === 'loaded')) {
			fontsLoaded = true;
			break;
		}
		await page.waitForTimeout(50);
	}
	assert(fontsLoaded, 'Font loading did not settle within10seconds');
	await settle(page);
}
function assertEvents(events) {
	assert.deepEqual(events.pageErrors, [], 'Browser page errors');
	assert.deepEqual(events.consoleErrors, [], 'Browser console errors');
	assert.deepEqual(events.traffic.preventedWrites, [], 'Unexpected write request was blocked');
	assert(
		events.requestFailures.every((failure) => failure.expected),
		'Unexpected failed resource request'
	);
	for (const resource of events.resources) {
		assert.equal(
			new URL(resource.url).origin,
			origin,
			`External ${resource.type}: ${resource.url}`
		);
		assert(
			resource.status >= 200 && resource.status < 400,
			`Failed ${resource.type}: ${resource.status}`
		);
	}
}
async function geometry(page, path, width) {
	const result = await page.evaluate(() => {
		const reference = document.querySelector('.nav-shell .container.nav');
		assertElement(reference, 'Navbar container');
		function assertElement(element, label) {
			if (!element) throw new Error(`${label} is missing`);
		}
		const rect = reference.getBoundingClientRect();
		const edge = rect.x + parseFloat(getComputedStyle(reference).paddingInlineStart);
		const main = document.querySelector('main') ?? document.querySelector('#top');
		const boxes = [...document.querySelectorAll('main .container')].map((element) => {
			const box = element.getBoundingClientRect();
			return { x: box.x, width: box.width };
		});
		const heading = document.querySelector('main h1') ?? document.querySelector('h1');
		const overflow = [
			...document.querySelectorAll(
				'main h1, main .archive-controls, main .article-main-column, main .card-body'
			)
		]
			.filter((element) => {
				const box = element.getBoundingClientRect();
				return box.width && (box.left < -1 || box.right > innerWidth + 1);
			})
			.map((element) => element.className);
		return {
			reference: { x: rect.x, width: rect.width, edge },
			boxes,
			headingX: heading?.getBoundingClientRect().x,
			mainPresent: Boolean(main),
			documentOverflow: document.documentElement.scrollWidth > innerWidth + 1,
			overflow,
			loadedFaces: [...document.fonts]
				.filter((font) => font.status === 'loaded')
				.map((font) => font.family),
			tocVisible: Boolean(
				document.querySelector('.article-toc-aside')?.getBoundingClientRect().width
			)
		};
	});
	assert(result.mainPresent, 'Missing main content');
	assert(
		!result.documentOverflow && !result.overflow.length,
		'Visible horizontal overflow/clipping'
	);
	for (const family of ['Montserrat Variable', 'Sofia Sans Variable'])
		assert(
			result.loadedFaces.some(
				(loaded) => loaded.replaceAll('"', '').replaceAll("'", '') === family
			),
			`Brand face not loaded: ${family}`
		);
	closeTo(result.reference.width, Math.min(width, 2440), 'Outer border-box width');
	closeTo(result.reference.x, Math.max(0, (width - 2440) / 2), 'Outer border-box position');
	for (const box of result.boxes) {
		closeTo(box.x, result.reference.x, 'Shared container position');
		closeTo(box.width, result.reference.width, 'Shared container width');
	}
	if (path !== article && path !== '/')
		closeTo(result.headingX, result.reference.edge, 'Heading content edge');
	if (path === article)
		assert.equal(result.tocVisible, width >= 1180, 'Desktop-only TOC visibility');
	return result;
}
async function mediaEvidence(page, context) {
	const results = [];
	for (const image of await page
		.locator('.blog-post-card img, .article-cover-img, .article-prose img')
		.all()) {
		await image.scrollIntoViewIfNeeded();
		// Firefox rejects decode() before a newly visible lazy request has started. Wait for the
		// actual request, then retry decoding only if responsive source identity changes.
		const deadline = Date.now() + 15000;
		const state = () =>
			image.evaluate((element) => ({
				currentSrc: element.currentSrc,
				srcset: element.srcset,
				sizes: element.sizes,
				complete: element.complete,
				naturalWidth: element.naturalWidth
			}));
		try {
			let stable = false;
			while (Date.now() < deadline) {
				let before = await state();
				while (!before.currentSrc || !before.complete) {
					assert(Date.now() < deadline, 'Image request did not become ready within15seconds');
					await page.waitForTimeout(50);
					before = await state();
				}
				assert(before.naturalWidth > 0, 'Browser reported a broken image');
				const identity = (value) => `${value.currentSrc}\n${value.srcset}\n${value.sizes}`;
				try {
					await image.evaluate((element) => element.decode());
				} catch (error) {
					if (identity(await state()) !== identity(before)) continue;
					throw error;
				}
				const after = await state();
				if (identity(after) !== identity(before)) continue;
				assert(after.complete && after.naturalWidth > 0, 'Image became unavailable after decoding');
				stable = true;
				break;
			}
			assert(stable, 'Responsive image source did not stabilize within15seconds');
		} catch (error) {
			error.evidence = { mediaState: await state().catch(() => ({ unavailable: true })) };
			throw error;
		}
		await settle(page);
		const item = await image.evaluate((element) => {
			const box = element.getBoundingClientRect();
			const candidates = element.srcset.split(',').flatMap((part) => {
				const match = part.trim().match(/^(.*)\s+(\d+)w$/);
				return match
					? [{ url: new URL(match[1], document.baseURI).href, width: Number(match[2]) }]
					: [];
			});
			return {
				url: element.currentSrc,
				width: box.width,
				height: box.height,
				fit: getComputedStyle(element).objectFit,
				alt: element.alt,
				card: Boolean(element.closest('.blog-post-card')),
				cover: element.classList.contains('article-cover-img'),
				candidates,
				dpr: devicePixelRatio
			};
		});
		assert(
			item.width > 0 && item.height > 0 && item.alt.trim(),
			'Image lacks visible dimensions or alt'
		);
		closeTo(item.width / item.height, 16 / 9, 'Actual image element aspect ratio', 0.02);
		if (item.card || item.cover)
			assert.equal(item.fit, 'contain', 'Editorial media must be uncropped');
		if (!decoded.has(item.url)) {
			const response = await context.request.get(item.url);
			assert.equal(response.status(), 200, 'Image response');
			const bytes = await response.body();
			assert(
				!bytes.subarray(0, 10000).toString().includes('IMAGE PLACEHOLDER'),
				'Placeholder image detected'
			);
			const metadata = await sharp(bytes).metadata();
			await sharp(bytes).stats();
			assert(metadata.width > 0 && metadata.height > 0, 'Image bytes did not decode');
			decoded.set(item.url, {
				width: metadata.width,
				height: metadata.height,
				bytes: bytes.length,
				format: metadata.format
			});
		}
		item.decoded = decoded.get(item.url);
		if (item.candidates.length) {
			assert(
				item.candidates.some((candidate) => candidate.url === item.url),
				'Selected source is absent from srcset'
			);
			const maximum = Math.max(...item.candidates.map((candidate) => candidate.width));
			assert(
				item.decoded.width >= Math.min(maximum, Math.floor(item.width * item.dpr)),
				'Selected source is undersized for the available density'
			);
		}
		results.push(item);
	}
	return results;
}
async function scenario(name, action) {
	const record = { name, status: 'passed' };
	try {
		record.evidence = await action();
	} catch (error) {
		record.status = 'failed';
		record.error = redact(error instanceof Error ? error.message : error);
		if (error?.evidence) record.evidence = error.evidence;
	}
	report.scenarios.push(record);
	await saveProgress();
	console.log(
		JSON.stringify({ scenario: name, status: record.status, completed: report.scenarios.length })
	);
	return record;
}
async function instrumentToc(page) {
	await page.addInitScript(() => {
		const active = new Set();
		const Native = window.ResizeObserver;
		window.__releaseTocObserverCount = () => active.size;
		window.ResizeObserver = class extends Native {
			observe(element, options) {
				if (element.matches('.article-main-column')) active.add(this);
				return super.observe(element, options);
			}
			unobserve(element) {
				if (element.matches('.article-main-column')) active.delete(this);
				return super.unobserve(element);
			}
			disconnect() {
				active.delete(this);
				return super.disconnect();
			}
		};
	});
}
async function tocInteractions(browser) {
	const context = await contextFor(browser, { viewport: { width: 1440, height: 1000 } });
	const page = await context.newPage();
	const events = watch(page);
	let step = 'instrumentation';
	try {
		await instrumentToc(page);
		step = 'initial navigation';
		await navigate(page, article);
		step = 'initial observer readiness';
		await page.waitForFunction(() => window.__releaseTocObserverCount() === 1);
		const links = page.locator('.toc-list a');
		assert((await links.count()) >= 2, 'Article needs at least two TOC links for history checks');
		const first = links.nth(0),
			second = links.nth(1);
		step = 'first-link hover';
		await first.scrollIntoViewIfNeeded();
		await page.mouse.move(0, 0);
		const measureLink = () =>
			first.evaluate((link) => {
				const box = link.getBoundingClientRect();
				const range = document.createRange();
				const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
				let text;
				while ((text = walker.nextNode()) && !text.textContent.trim()) {
					/* Skip hydration whitespace. */
				}
				if (!text) throw new Error('TOC link has no text node');
				const start = text.textContent.search(/\S/);
				range.setStart(text, start);
				range.setEnd(text, Math.min(text.textContent.length, start + 3));
				const token = range.getBoundingClientRect();
				return {
					x: box.x,
					y: box.y,
					width: box.width,
					height: box.height,
					tokenX: token.x,
					tokenY: token.y,
					tokenWidth: token.width,
					numberPresent: /^\s*\d/.test(link.textContent)
				};
			});
		const beforeHover = await measureLink();
		await first.hover();
		await settle(page);
		const afterHover = await measureLink();
		for (const key of ['x', 'y', 'width', 'height', 'tokenX', 'tokenY', 'tokenWidth'])
			closeTo(afterHover[key], beforeHover[key], `TOC hover ${key}`);
		step = 'native collapse/expand';
		const details = page.locator('.toc-details');
		await details.locator('summary').focus();
		await page.keyboard.press('Enter');
		assert.equal(await details.evaluate((element) => element.open), false, 'Native collapse');
		await page.keyboard.press('Space');
		assert.equal(await details.evaluate((element) => element.open), true, 'Native expand');
		const firstHash = await first.getAttribute('href'),
			secondHash = await second.getAttribute('href');
		step = 'first fragment';
		await first.click();
		await page.waitForURL((url) => url.hash === firstHash);
		await settle(page);
		step = 'second fragment';
		await second.click();
		await page.waitForURL((url) => url.hash === secondHash);
		await settle(page);
		await page.goBack();
		await page.waitForURL((url) => url.hash === firstHash);
		step = 'fragment forward';
		await page.goForward();
		await page.waitForURL((url) => url.hash === secondHash);
		const passiveBefore = await page.evaluate(() => ({
			url: location.href,
			length: history.length
		}));
		await page.evaluate(() => scrollBy({ top: 180, behavior: 'instant' }));
		await settle(page);
		assert.deepEqual(
			await page.evaluate(() => ({ url: location.href, length: history.length })),
			passiveBefore,
			'Passive scrolling mutated URL/history'
		);
		step = 'last FAQ boundary';
		let faq = { status: 'not_exercised', reason: 'No viable last FAQ boundary' };
		const lastFaq = page.locator('.faq-details').last();
		if (await lastFaq.count()) {
			if (await lastFaq.evaluate((element) => element.open))
				await lastFaq.locator('summary').click();
			await lastFaq.locator('summary').evaluate((element) =>
				scrollTo({
					top: element.getBoundingClientRect().top + scrollY - 150,
					behavior: 'instant'
				})
			);
			await settle(page);
			const measure = () =>
				page.evaluate(() => {
					const panel = document.querySelector('.toc-details').getBoundingClientRect(),
						boundary = document.querySelector('.article-main-column').getBoundingClientRect(),
						summary = [...document.querySelectorAll('.faq-summary')].at(-1).getBoundingClientRect();
					return {
						x: panel.x,
						y: panel.y,
						bottom: panel.bottom,
						boundary: boundary.bottom,
						summary: summary.top,
						scrollY,
						stickyTop:
							document.querySelector('.nav-shell').getBoundingClientRect().height +
							parseFloat(getComputedStyle(document.documentElement).fontSize) * 0.5
					};
				});
			const before = await measure();
			if (
				Math.abs(before.y - before.stickyTop) <= 1 &&
				before.summary > 0 &&
				before.summary < 900
			) {
				await lastFaq.locator('summary').click();
				await settle(page);
				const after = await measure();
				for (const key of ['x', 'y', 'summary', 'scrollY'])
					closeTo(after[key], before[key], `Last FAQ ${key}`);
				assert(after.bottom <= after.boundary + 1, 'TOC crossed reading boundary');
				faq = { status: 'passed', before, after };
			}
		}
		// The marker is created only now, never by an init script. A document reload cannot recreate it.
		const marker = `release-${Date.now()}-${Math.random()}`;
		await page.evaluate((value) => {
			window.__releaseClientMarker = value;
		}, marker);
		step = 'header Blog client navigation';
		await page.locator('header.nav-shell').getByRole('link', { name: 'Blog', exact: true }).click();
		await page.waitForURL((url) => url.pathname === '/blog');
		assert.equal(
			await page.evaluate(() => window.__releaseClientMarker),
			marker,
			'Header Blog click performed a document reload'
		);
		step = 'observer cleanup after Blog';
		await page.waitForFunction(() => window.__releaseTocObserverCount() === 0);
		await page.locator('#archive-h1').waitFor({ state: 'visible' });
		// Complete the destination route before intentionally going back. Otherwise the probe
		// itself can abort a still-running Blog data request and misreport it as a site failure.
		await page.waitForLoadState('networkidle', { timeout: 10000 });
		step = 'history return to article';
		await page.goBack();
		await page.waitForURL((url) => url.pathname === article);
		assert.equal(
			await page.evaluate(() => window.__releaseClientMarker),
			marker,
			'Return to article performed a document reload'
		);
		await page.waitForFunction(() => window.__releaseTocObserverCount() === 1);
		await page.waitForLoadState('networkidle', { timeout: 10000 });
		assertEvents(events);
		return {
			hover: { before: beforeHover, after: afterHover },
			collapse: 'native keyboard Enter/Space',
			fragments: [firstHash, secondHash],
			passiveBefore,
			faq,
			cleanup: {
				method: 'Header Blog click, then client history back; same window marker',
				counts: [1, 0, 1]
			},
			events
		};
	} catch (error) {
		error.evidence = {
			step,
			events,
			state: await page
				.evaluate(() => ({
					url: location.href,
					observerCount: window.__releaseTocObserverCount?.(),
					headerHeight: document
						.querySelector('.article-container')
						?.style.getPropertyValue('--article-header-height'),
					ready: document.readyState
				}))
				.catch(() => ({ unavailable: true }))
		};
		throw error;
	} finally {
		await context.close();
	}
}

for (const [engine, type] of Object.entries({ chromium, firefox, webkit })) {
	if (!selectedEngines.includes(engine)) continue;
	let browser;
	try {
		browser = await type.launch({ headless: true });
		for (const path of values['only-interactions']
			? []
			: ['/blog', tag, article, '/sunday-alpha-alerts'])
			for (const width of [375, 1440, 2440, 2800])
				await scenario(`${engine} ${path} ${width}`, async () => {
					const context = await contextFor(browser, { viewport: { width, height: 1000 } });
					const page = await context.newPage();
					const events = watch(page);
					try {
						await navigate(page, path);
						const layout = await geometry(page, path, width);
						const media = await mediaEvidence(page, context);
						assertEvents(events);
						await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
						await settle(page);
						if (engine === 'chromium' && [375, 1440, 2440].includes(width))
							await page.screenshot({
								path: resolve(outdir, `${engine}-${pathName(path)}-${width}.jpg`),
								type: 'jpeg',
								quality: 80,
								fullPage: true
							});
						return { layout, media, events };
					} catch (error) {
						error.evidence = { ...error.evidence, events };
						throw error;
					} finally {
						await context.close();
					}
				});
		await scenario(`${engine} TOC interactions and client cleanup`, () => tocInteractions(browser));
		await scenario(`${engine} no-JavaScript deep fragment`, async () => {
			const context = await contextFor(browser, {
				javaScriptEnabled: false,
				viewport: { width: 1440, height: 1000 }
			});
			const page = await context.newPage();
			let events = watch(page);
			try {
				await navigate(page, article);
				const hash = await page.locator('.toc-list a').first().getAttribute('href');
				assert(hash, 'No SSR TOC fragment');
				// A same-document goto returns null. Cold entry must make a new document request.
				await page.goto('about:blank');
				await settle(page);
				// Extraction/navigation may cancel its own preloads. Audit only the cold target document.
				events = watch(page);
				await navigate(page, `${article}${hash}`);
				const geometry = await page.evaluate((fragment) => {
					const target = document.getElementById(decodeURIComponent(fragment.slice(1)));
					return {
						targetTop: target.getBoundingClientRect().top,
						headerBottom: document.querySelector('.nav-shell').getBoundingClientRect().bottom,
						hash: location.hash
					};
				}, hash);
				assert(
					geometry.targetTop >= geometry.headerBottom - 1 && geometry.targetTop < 1000,
					`No-JS fragment is hidden by header or outside viewport: ${JSON.stringify(geometry)}`
				);
				assertEvents(events);
				return { geometry, events };
			} catch (error) {
				error.evidence = { events };
				throw error;
			} finally {
				await context.close();
			}
		});
		await scenario(`${engine} reduced motion with blocked fonts`, async () => {
			const context = await contextFor(browser, { viewport: { width: 375, height: 1000 } });
			const page = await context.newPage();
			const events = watch(page, true);
			try {
				await page.route('**/*', (route) =>
					route.request().resourceType() === 'font' ? route.abort() : route.fallback()
				);
				await navigate(page, article);
				const readability = await page.evaluate(() => {
					const heading = document.querySelector('main h1'),
						text = document.querySelector('.article-prose p');
					return {
						reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
						headingHeight: heading.getBoundingClientRect().height,
						textHeight: text.getBoundingClientRect().height,
						textSize: parseFloat(getComputedStyle(text).fontSize),
						overflow: document.documentElement.scrollWidth > innerWidth + 1
					};
				});
				assert(
					readability.reducedMotion &&
						readability.headingHeight > 0 &&
						readability.textHeight > 0 &&
						readability.textSize >= 16 &&
						!readability.overflow,
					'Fallback text is not visibly readable'
				);
				assertEvents(events);
				return { readability, events };
			} finally {
				await context.close();
			}
		});
	} catch (error) {
		report.scenarios.push({
			name: `${engine} setup`,
			status: 'failed',
			error: redact(error instanceof Error ? error.message : error)
		});
	} finally {
		await browser?.close();
	}
}
report.passed = report.scenarios.filter((item) => item.status === 'passed').length;
report.failed = report.scenarios.filter((item) => item.status === 'failed').length;
report.coverageNotes = [
	'Uses reduced motion for stable screenshots; normal-motion animation behavior is not claimed.',
	'Thin taxonomy noindex/canonical policy is intentionally left to the separate HTTP/indexability audit.',
	'FAQ boundary evidence is marked not_exercised if the real article cannot provide viable geometry.',
	'No CMS/admin writes, signup submissions or external messages are performed.',
	'Only GET/HEAD reach the host; exact passive analytics POST is fulfilled locally with204 and remains untested.'
];
await saveProgress();
console.log(
	JSON.stringify({
		passed: report.passed,
		failed: report.failed,
		report: resolve(outdir, 'browser-verification.json')
	})
);
process.exitCode = report.failed ? 1 : 0;
