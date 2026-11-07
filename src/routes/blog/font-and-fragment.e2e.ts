import { expect, test } from '@playwright/test';

declare global {
	interface Window {
		fontCspViolations?: string[];
	}
}

for (const path of [
	'/',
	'/blog',
	'/blog/institutional-order-flow-and-gamma-flip-playbook',
	'/sunday-alpha-alerts',
	'/store/courses',
	'/admin/login',
	'/maintenance/index.html',
	'/font-audit-not-found'
]) {
	test(`serves fonts and stylesheets from the page origin on ${path}`, async ({ page }) => {
		const resources: { type: string; url: string }[] = [];
		const fonts: { url: string; status: number }[] = [];
		page.on('request', (request) => {
			if (['font', 'stylesheet'].includes(request.resourceType()))
				resources.push({ type: request.resourceType(), url: request.url() });
		});
		page.on('response', (response) => {
			if (response.request().resourceType() === 'font')
				fonts.push({ url: response.url(), status: response.status() });
		});
		const response = await page.goto(path, { waitUntil: 'networkidle' });
		expect(response?.status()).toBe(path === '/font-audit-not-found' ? 404 : 200);
		await page.evaluate(() => document.fonts.ready);
		const origin = new URL(page.url()).origin;
		expect(fonts.length).toBeGreaterThanOrEqual(2);
		for (const resource of resources)
			expect(new URL(resource.url).origin, resource.url).toBe(origin);
		for (const font of fonts) {
			expect(font.status, font.url).toBe(200);
			expect(new URL(font.url).pathname).toMatch(/^\/_app\/immutable\/assets\/.+\.woff2$/);
		}
		const loadedFamilies = await page.evaluate(() =>
			[...document.fonts]
				.filter((font) => font.status === 'loaded')
				.map((font) => font.family.replace(/^['"]|['"]$/g, ''))
		);
		expect(loadedFamilies).toContain('Montserrat Variable');
		expect(loadedFamilies).toContain('Sofia Sans Variable');
	});
}

test('keeps article entry and passive scrolling clean while native TOC deep links remain usable', async ({
	page
}) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.setViewportSize({ width: 1920, height: 1000 });
	await page.goto('/blog/institutional-order-flow-and-gamma-flip-playbook');
	expect(new URL(page.url()).hash).toBe('');
	const link = page.locator('.toc-list a').nth(1);
	const hash = (await link.getAttribute('href'))!;
	await page.evaluate((id) => document.getElementById(id)?.scrollIntoView(), hash.slice(1));
	await expect(link).toHaveAttribute('aria-current', 'location');
	expect(new URL(page.url()).hash).toBe('');
	await link.click();
	await expect(page).toHaveURL(new RegExp(`${hash}$`));
	await page.reload();
	expect(new URL(page.url()).hash).toBe(hash);
	for (const selector of ['link[rel="canonical"]', 'meta[property="og:url"]']) {
		const url = await page
			.locator(selector)
			.getAttribute(selector.startsWith('link') ? 'href' : 'content');
		expect(new URL(url!).hash).toBe('');
	}
	expect(errors).toEqual([]);
});

test('uses the shared Sofia compatibility token in product SVG charts', async ({ page }) => {
	await page.goto('/sunday-alpha-alerts');
	const labels = page.locator('svg text[font-family]');
	await expect.poll(() => labels.count()).toBeGreaterThan(0);
	const fontTokens = await labels.evaluateAll((elements) =>
		elements.map((element) => element.getAttribute('font-family'))
	);
	expect(fontTokens.every((token) => token === 'var(--font-mono)')).toBe(true);
	const resolvedFamily = await labels
		.first()
		.evaluate((element) => getComputedStyle(element).fontFamily);
	expect(resolvedFamily).toContain('Sofia Sans Variable');
	expect(
		await labels.first().evaluate((element) => getComputedStyle(element).fontVariantNumeric)
	).toContain('tabular-nums');
	expect(resolvedFamily).not.toContain('JetBrains');
});

for (const path of ['/api/unsubscribe', '/waitlist/confirm', '/waitlist/unsubscribe']) {
	test(`standalone brand fonts respect CSP and do not copy tokens to CSS on ${path}`, async ({
		page
	}) => {
		await page.addInitScript(() => {
			const violations: string[] = [];
			window.fontCspViolations = violations;
			window.addEventListener('securitypolicyviolation', (event) => {
				violations.push(`${event.effectiveDirective}:${event.blockedURI}`);
			});
		});
		const referrers: string[] = [];
		page.on('request', (request) => {
			if (request.resourceType() === 'stylesheet') referrers.push(request.headers().referer ?? '');
		});
		await page.goto(`${path}?token=local-font-referrer-probe`, { waitUntil: 'networkidle' });
		await page.evaluate(() => document.fonts.ready);
		expect(await page.locator('body').evaluate((el) => getComputedStyle(el).fontFamily)).toContain(
			'Sofia Sans Variable'
		);
		expect(await page.locator('h1').evaluate((el) => getComputedStyle(el).fontFamily)).toContain(
			'Montserrat Variable'
		);
		expect(await page.evaluate(() => window.fontCspViolations)).toEqual([]);
		expect(referrers.every((referrer) => !referrer.includes('local-font-referrer-probe'))).toBe(
			true
		);
	});
}

test('redirects the old product route with query and fragment and emits zero in-page fragment links', async ({
	page,
	request
}) => {
	const response = await request.get('/watchlist?source=legacy', { maxRedirects: 0 });
	expect(response.status()).toBe(308);
	const location = new URL(response.headers().location, response.url());
	expect(location.pathname + location.search).toBe('/sunday-alpha-alerts?source=legacy');
	await page.goto('/sunday-alpha-alerts');
	await expect(page.locator('.sticky-bar')).toHaveCount(0);
	await expect(page.locator('.cinema-shutter')).toHaveCount(0);
	await expect(page.locator('main a[href*="#"]')).toHaveCount(0);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
