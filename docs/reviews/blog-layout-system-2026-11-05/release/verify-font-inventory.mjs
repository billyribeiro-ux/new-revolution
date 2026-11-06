import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from '@playwright/test';

const allowedFamilies = ['Montserrat Variable', 'Sofia Sans Variable'];
const fallbackPolicy = [
	{
		family: 'Montserrat Variable Fallback',
		primary: 'Montserrat Variable',
		token: '--font-display'
	},
	{
		family: 'Sofia Sans Variable Fallback',
		primary: 'Sofia Sans Variable',
		token: '--font-sans'
	}
];
const viewport = { width: 1440, height: 1000 };
let secrets = [];
let reportPath;

function safeUrl(value) {
	try {
		const url = new URL(value);
		url.username = '';
		url.password = '';
		url.hash = '';
		for (const key of new Set(url.searchParams.keys())) url.searchParams.set(key, '[redacted]');
		return url.href;
	} catch {
		return '[unparseable URL]';
	}
}

function redact(value) {
	let text = String(value);
	for (const secret of secrets) text = text.replaceAll(secret, '[redacted]');
	return text
		.replace(/https?:\/\/[^\s"'<>]+/g, (url) => safeUrl(url))
		.replace(
			/\b(token|secret|password|authorization|api[_-]?key|cookie)\s*[:=]\s*[^\s,;]+/gi,
			'$1=[redacted]'
		);
}

function scrub(value) {
	if (typeof value === 'string') return redact(value);
	if (Array.isArray(value)) return value.map(scrub);
	if (value && typeof value === 'object')
		return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, scrub(item)]));
	return value;
}

async function readCookies(path) {
	if (!path) return [];
	try {
		const parsed = JSON.parse(await readFile(path, 'utf8'));
		const cookies = Array.isArray(parsed) ? parsed : parsed.cookies;
		assert(Array.isArray(cookies));
		assert(cookies.every((cookie) => typeof cookie?.value === 'string'));
		secrets = cookies.flatMap(({ value }) => (value ? [value, encodeURIComponent(value)] : []));
		return cookies;
	} catch {
		throw new Error('Cookie file must contain a cookie array or Playwright storage-state object');
	}
}

async function readInventory() {
	const source = await readFile(new URL('../../../../urls.md', import.meta.url), 'utf8');
	const start = source.search(/^## Public pages eligible for indexing\b/m);
	const end = source.search(/^## Evidence and scope\b/m);
	assert(start >= 0 && end > start, 'Public inventory sections are missing');
	const urls = [...source.slice(start, end).matchAll(/^- (https:\/\/[^\s]+)\s*$/gm)].map(
		(match) => new URL(match[1])
	);
	assert(urls.length > 0, 'Public inventory is empty');
	assert(urls.every((url) => url.origin === 'https://www.revolutiontradingpros.com'));
	assert(urls.every((url) => !url.search && !url.hash && !url.username && !url.password));
	const paths = urls.map((url) => url.pathname);
	assert.equal(new Set(paths).size, paths.length, 'Duplicate public inventory routes');
	return paths.map((path) => ({ path, publicInventory: true, expectedStatus: 200 }));
}

async function inspectSurface(browser, origin, cookies, surface) {
	const record = {
		...surface,
		status: 'failed',
		failures: [],
		pageErrors: [],
		consoleErrors: [],
		resources: [],
		interceptedPassiveAnalytics: [],
		preventedWrites: []
	};
	const context = await browser.newContext({
		viewport,
		deviceScaleFactor: 1,
		reducedMotion: 'reduce',
		serviceWorkers: 'block'
	});
	const fail = (message) => record.failures.push(redact(message));
	try {
		try {
			if (cookies.length) await context.addCookies(cookies);
		} catch {
			throw new Error('Unable to apply cookies; check cookie-file format');
		}
		// Prevent scripts or unexpected page behavior from making hosted writes. Routing also disables
		// the HTTP cache, so each isolated surface records its own real stylesheet/font delivery.
		await context.route('**/*', async (route) => {
			const request = route.request();
			if (!['GET', 'HEAD'].includes(request.method())) {
				const url = new URL(request.url());
				if (
					request.method() === 'POST' &&
					url.origin === origin &&
					url.pathname === '/api/analytics/pageview' &&
					!url.search
				) {
					record.interceptedPassiveAnalytics.push({
						method: request.method(),
						url: safeUrl(request.url()),
						localStatus: 204,
						hostedOperationExercised: false
					});
					await route.fulfill({ status: 204 });
					return;
				}
				record.preventedWrites.push({ method: request.method(), url: safeUrl(request.url()) });
				await route.abort('blockedbyclient');
				return;
			}
			await route.continue();
		});
		const page = await context.newPage();
		const resourcesByRequest = new Map();
		page.on('pageerror', (error) => record.pageErrors.push(redact(error.message)));
		page.on('console', (message) => {
			if (message.type() !== 'error') return;
			const location = message.location();
			record.consoleErrors.push({
				text: redact(message.text()),
				url: location.url ? safeUrl(location.url) : '',
				line: location.lineNumber,
				expectedDocumentStatusDiagnostic: false
			});
		});
		page.on('request', (request) => {
			const type = request.resourceType();
			if (!['font', 'stylesheet'].includes(type)) return;
			const resource = {
				type,
				url: safeUrl(request.url()),
				sameOrigin: new URL(request.url()).origin === origin,
				status: null,
				failure: null
			};
			resourcesByRequest.set(request, resource);
			record.resources.push(resource);
		});
		page.on('response', (response) => {
			const resource = resourcesByRequest.get(response.request());
			if (!resource) return;
			resource.status = response.status();
			resource.sameOrigin &&= new URL(response.url()).origin === origin;
		});
		page.on('requestfailed', (request) => {
			const resource = resourcesByRequest.get(request);
			if (resource) resource.failure = redact(request.failure()?.errorText ?? 'Request failed');
		});
		const response = await page.goto(`${origin}${surface.path}`, {
			waitUntil: 'load',
			timeout: 30000
		});
		record.httpStatus = response?.status() ?? null;
		record.finalUrl = safeUrl(page.url());
		if (record.httpStatus !== surface.expectedStatus)
			fail(`Expected HTTP${surface.expectedStatus}; received HTTP${record.httpStatus}`);
		const final = new URL(page.url());
		if (final.origin !== origin || final.pathname !== surface.path)
			fail('Navigation redirected away from the requested origin/path');
		// Hydration can discover an error-route stylesheet after the document load event.
		// Wait for a bounded quiet period before checking completed font/stylesheet responses.
		await page.waitForLoadState('networkidle', { timeout: 10000 });
		await page.evaluate(async () => {
			let timer;
			try {
				await Promise.race([
					document.fonts.ready,
					new Promise((_, reject) => {
						timer = setTimeout(() => reject(new Error('Font readiness timed out')), 20000);
					})
				]);
			} finally {
				clearTimeout(timer);
			}
			await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
		});
		record.rendering = await page.evaluate((fallbackPolicy) => {
			const content = document.querySelector('main') ?? document.body;
			const box = content?.getBoundingClientRect();
			const style = content ? getComputedStyle(content) : null;
			const documentWidth = Math.max(
				document.documentElement.scrollWidth,
				document.body?.scrollWidth ?? 0
			);
			const normalizeFamily = (family) => family.replaceAll(/['"]/g, '').trim();
			const rootStyle = getComputedStyle(document.documentElement);
			const fallbackTokens = fallbackPolicy.map((policy) => {
				const stack = rootStyle.getPropertyValue(policy.token).split(',').map(normalizeFamily);
				return {
					...policy,
					stack,
					secondaryTokenFallback: stack[0] === policy.primary && stack[1] === policy.family
				};
			});
			const registeredLocalFallbackRules = [];
			const unreadableStylesheets = [];
			const visitedSheets = new Set();
			function inspectRules(rules, sheetUrl) {
				for (const rule of rules) {
					if (rule.type === CSSRule.FONT_FACE_RULE) {
						const family = normalizeFamily(rule.style.getPropertyValue('font-family'));
						if (!fallbackPolicy.some((policy) => policy.family === family)) continue;
						const source = rule.style.getPropertyValue('src').trim();
						const remainder = source
							.replaceAll(/local\(\s*(?:"[^"]*"|'[^']*'|[^()]*)\s*\)/gi, '')
							.replaceAll(/[\s,]/g, '');
						registeredLocalFallbackRules.push({
							family,
							source,
							stylesheet: sheetUrl,
							localOnly: /local\(/i.test(source) && !/url\(/i.test(source) && !remainder,
							style: rule.style.getPropertyValue('font-style') || 'normal',
							weight: rule.style.getPropertyValue('font-weight') || 'normal',
							stretch: rule.style.getPropertyValue('font-stretch') || 'normal',
							unicodeRange: rule.style.getPropertyValue('unicode-range') || 'U+0-10FFFF'
						});
					} else if (rule.styleSheet) {
						inspectSheet(rule.styleSheet);
					} else if (rule.cssRules) {
						inspectRules(rule.cssRules, sheetUrl);
					}
				}
			}
			function inspectSheet(sheet) {
				if (visitedSheets.has(sheet)) return;
				visitedSheets.add(sheet);
				try {
					inspectRules(sheet.cssRules, sheet.href ?? 'inline');
				} catch {
					unreadableStylesheets.push(sheet.href ?? 'inline');
				}
			}
			for (const sheet of document.styleSheets) inspectSheet(sheet);
			return {
				contentElement: content?.tagName.toLowerCase() ?? null,
				visibleContent: Boolean(
					box?.width &&
					box.height &&
					style?.display !== 'none' &&
					style?.visibility !== 'hidden' &&
					content?.textContent?.trim()
				),
				viewportWidth: innerWidth,
				documentWidth,
				horizontalOverflow: documentWidth > innerWidth + 1,
				bodyFamily: document.body ? getComputedStyle(document.body).fontFamily : null,
				headingFamily: document.querySelector('h1')
					? getComputedStyle(document.querySelector('h1')).fontFamily
					: null,
				fallbackTokens,
				registeredLocalFallbackRules,
				unreadableStylesheets,
				loadedFaces: [...document.fonts]
					.filter((face) => face.status === 'loaded')
					.map((face) => ({
						family: face.family,
						style: face.style,
						weight: face.weight,
						stretch: face.stretch,
						display: face.display,
						unicodeRange: face.unicodeRange
					}))
			};
		}, fallbackPolicy);
		if (!record.rendering.visibleContent) fail('Main/body content is not visibly rendered');
		if (record.rendering.horizontalOverflow) fail('Document overflows the viewport horizontally');
		const loaded = new Set(
			record.rendering.loadedFaces.map((face) => face.family.replaceAll(/['"]/g, '').trim())
		);
		if (!loaded.size) fail('No custom font face loaded');
		for (const face of record.rendering.loadedFaces) {
			const family = face.family.replaceAll(/['"]/g, '').trim();
			if (allowedFamilies.includes(family)) continue;
			const policy = record.rendering.fallbackTokens.find((policy) => policy.family === family);
			const rules = record.rendering.registeredLocalFallbackRules.filter(
				(rule) => rule.family === family
			);
			const matchingLocalRule = rules.some(
				(rule) =>
					rule.localOnly &&
					rule.style === face.style &&
					rule.weight === face.weight &&
					rule.stretch === face.stretch &&
					rule.unicodeRange === face.unicodeRange
			);
			if (
				!policy?.secondaryTokenFallback ||
				!matchingLocalRule ||
				rules.some((rule) => !rule.localOnly)
			)
				fail(`Unsupported or unverified loaded font family: ${family}`);
		}
		if (surface.publicInventory)
			for (const family of allowedFamilies)
				if (!loaded.has(family)) fail(`Public page did not load ${family}`);
		for (const resource of record.resources)
			if (
				!resource.sameOrigin ||
				resource.failure ||
				resource.status === null ||
				resource.status < 200 ||
				resource.status >= 400
			)
				fail(`Unsuccessful or external ${resource.type}: ${resource.url}`);
		for (const error of record.consoleErrors) {
			// Chromium reports an expected tokenless400/unknown404 document as a resource error.
			// Admit only that exact document diagnostic; font/style/CSP/runtime errors never qualify.
			error.expectedDocumentStatusDiagnostic =
				surface.expectedStatus >= 400 &&
				record.httpStatus === surface.expectedStatus &&
				error.url === record.finalUrl &&
				new RegExp(
					`^Failed to load resource: the server responded with a status of ${surface.expectedStatus} \\(.*\\)$`
				).test(error.text);
			if (!error.expectedDocumentStatusDiagnostic) fail(`Console error: ${error.text}`);
		}
		for (const error of record.pageErrors) fail(`Runtime error: ${error}`);
		if (record.preventedWrites.length) fail('Unexpected state-changing requests were prevented');
	} catch (error) {
		fail(error instanceof Error ? error.message : error);
	} finally {
		await context.close();
	}
	if (!record.failures.length) record.status = 'passed';
	return record;
}

async function main() {
	const { values } = parseArgs({
		options: {
			origin: { type: 'string' },
			out: { type: 'string' },
			'cookie-file': { type: 'string' }
		}
	});
	assert(values.origin && values.out, 'Require --origin and --out');
	const url = new URL(values.origin);
	assert(
		['http:', 'https:'].includes(url.protocol) &&
			!url.username &&
			!url.password &&
			url.pathname === '/' &&
			!url.search &&
			!url.hash,
		'--origin must be a plain HTTP(S) origin'
	);
	reportPath = resolve(values.out);
	const cookies = await readCookies(values['cookie-file']);
	const inventory = await readInventory();
	const surfaces = [
		...inventory,
		{ path: '/admin/login', publicInventory: false, expectedStatus: 200 },
		{ path: '/waitlist/confirm', publicInventory: false, expectedStatus: 400 },
		{ path: '/waitlist/unsubscribe', publicInventory: false, expectedStatus: 400 },
		{ path: '/api/unsubscribe', publicInventory: false, expectedStatus: 400 },
		{ path: '/blog/unknown-layout-font-check', publicInventory: false, expectedStatus: 404 }
	];
	const report = {
		origin: url.origin,
		generatedAt: new Date().toISOString(),
		browser: 'chromium',
		viewport,
		publicInventoryCount: inventory.length,
		expectedSurfaceCount: surfaces.length,
		protectedStage: Boolean(values['cookie-file']),
		readOnly:
			'Only GET/HEAD reach the host; same-origin POST /api/analytics/pageview receives local204; all other writes blocked',
		passiveAnalyticsOperationExercised: false,
		queryValuesRedacted: true,
		allowedFamilies,
		fallbackPolicy,
		fatalErrors: [],
		surfaces: []
	};
	let browser;
	try {
		browser = await chromium.launch();
		report.browserVersion = browser.version();
		for (const surface of surfaces)
			report.surfaces.push(await inspectSurface(browser, url.origin, cookies, surface));
	} catch (error) {
		report.fatalErrors.push(redact(error instanceof Error ? error.message : error));
	} finally {
		await browser?.close();
	}
	report.passed = report.surfaces.filter((surface) => surface.status === 'passed').length;
	report.failed = report.surfaces.filter((surface) => surface.status === 'failed').length;
	report.unexecuted = surfaces.length - report.surfaces.length;
	report.status =
		report.failed || report.unexecuted || report.fatalErrors.length ? 'failed' : 'passed';
	await mkdir(dirname(reportPath), { recursive: true });
	await writeFile(reportPath, `${JSON.stringify(scrub(report), null, 2)}\n`, { mode: 0o600 });
	console.log(
		JSON.stringify({
			status: report.status,
			publicInventoryCount: inventory.length,
			surfaces: surfaces.length,
			passed: report.passed,
			failed: report.failed,
			unexecuted: report.unexecuted,
			fatalErrors: report.fatalErrors.length,
			report: redact(reportPath)
		})
	);
	if (report.status === 'failed') process.exitCode = 1;
}

main().catch(() => {
	// Argument/cookie errors may contain secrets in upstream exception messages. Never print them.
	console.log(
		JSON.stringify({
			status: 'failed',
			error:
				'Unable to initialize or write the font inventory probe; check arguments and local files',
			...(reportPath ? { report: redact(reportPath) } : {})
		})
	);
	process.exitCode = 1;
});
