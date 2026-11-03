import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('an open app navigates to maintenance and recovers after deactivation', async ({
	page,
	browserName
}) => {
	let maintenance = false;
	const html = await readFile('.svelte-kit/output/client/maintenance/index.html', 'utf8');
	await page.route('**/*', async (route) => {
		const url = new URL(route.request().url());
		if (
			url.hostname === 'localhost' &&
			maintenance &&
			!url.pathname.startsWith('/_app/immutable/') &&
			url.pathname !== '/api/health'
		) {
			return route.fulfill({
				status: 503,
				contentType: 'text/html',
				headers: { 'cache-control': 'no-store' },
				body: html
			});
		}
		return route.continue();
	});
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	const normal = await page.goto('http://localhost:4173/');
	expect(normal?.status()).toBe(200);
	await page.waitForLoadState('networkidle');
	maintenance = true;
	await page.locator('a[href="/about"]').first().click();
	await expect(page.getByRole('heading', { name: /platform maintenance/i })).toBeVisible();
	maintenance = false;
	await page.goto('http://localhost:4173/');
	await page.waitForLoadState('networkidle');
	await page.evaluate(() => {
		const link = document.createElement('a');
		link.href = '/admin/login';
		link.textContent = 'Test admin navigation';
		document.body.append(link);
	});
	maintenance = true;
	await page.getByRole('link', { name: 'Test admin navigation' }).click();
	await expect(page.getByRole('heading', { name: /platform maintenance/i })).toBeVisible();
	const blocked = await page.goto('http://localhost:4173/resources/stock-indexes-list');
	expect(blocked?.status()).toBe(503);
	await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
	await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
	maintenance = false;
	const restored = await page.goto('http://localhost:4173/about');
	expect(restored?.status()).toBe(200);
	expect(errors).toEqual([]);
});

test('maintenance page fits a mobile viewport and honours reduced motion', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	page.on('requestfailed', (request) =>
		errors.push(`${request.url()}: ${request.failure()?.errorText}`)
	);
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push(message.text());
	});
	await page.setViewportSize({ width: 375, height: 812 });
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('http://localhost:4173/maintenance/index.html');
	await expect(page.getByRole('link', { name: /support@revolutiontradingpros.com/ })).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
	expect(
		await page
			.locator('.maintenance-chart')
			.evaluate((element) => getComputedStyle(element).animationName)
	).toBe('none');
	expect(errors).toEqual([]);
});

test('notice reflows at narrow widths and keeps the support action close to the message', async ({
	page,
	browserName
}) => {
	await page.goto('http://localhost:4173/maintenance/index.html');
	await page.evaluate(() => document.fonts.ready);
	for (const width of [320, 360, 390, 480, 640, 768, 1024, 1280, 1536]) {
		await page.setViewportSize({ width, height: width === 320 ? 568 : width === 1280 ? 720 : 844 });
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth - document.documentElement.clientWidth
			),
			`${width}px`
		).toBe(0);
		const primary = await page
			.getByRole('link', { name: 'Email support', exact: true })
			.boundingBox();
		expect(primary).not.toBeNull();
		if (width === 320 || width === 390 || width === 1280)
			expect((primary?.y ?? 9999) + (primary?.height ?? 0)).toBeLessThan(
				width === 320 ? 568 : width === 1280 ? 720 : 844
			);
		if (width < 768) await expect(page.locator('.maintenance-visual')).toBeHidden();
	}
	await page.setViewportSize({ width: 390, height: 844 });
	const email = await page
		.getByRole('link', { name: 'support@revolutiontradingpros.com', exact: true })
		.boundingBox();
	expect((email?.y ?? 9999) + (email?.height ?? 0)).toBeLessThan(844);
	await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
	await page.keyboard.press('Enter');
	await expect(page.locator('#maintenance-main')).toBeFocused();
	await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
	await expect(page.getByRole('link', { name: 'Email support', exact: true })).toBeFocused();
});

test('retry performs a document navigation and preserves the requested path and query', async ({
	page
}) => {
	let active = true;
	const html = await readFile('.svelte-kit/output/client/maintenance/index.html', 'utf8');
	await page.route('**/*', async (route) => {
		const url = new URL(route.request().url());
		if (active && url.hostname === 'localhost' && !url.pathname.startsWith('/_app/immutable/')) {
			return route.fulfill({
				status: 503,
				contentType: 'text/html',
				headers: { 'cache-control': 'no-store' },
				body: html
			});
		}
		return route.continue();
	});
	const url = 'http://localhost:4173/about?origin=maintenance';
	await page.goto(url);
	const blocked = page.waitForResponse(
		(response) => response.request().isNavigationRequest() && response.url() === url
	);
	await page.getByRole('button', { name: 'Try this page again' }).click();
	expect((await blocked).status()).toBe(503);
	await expect(page.getByRole('button', { name: 'Try this page again' })).toBeEnabled();
	active = false;
	const restored = page.waitForResponse(
		(response) => response.request().isNavigationRequest() && response.url() === url
	);
	await page.getByRole('button', { name: 'Try this page again' }).click();
	expect((await restored).status()).toBe(200);
	await expect(page).toHaveURL(url);
});

test('the core notice remains usable with JavaScript and web fonts unavailable', async ({
	browser
}) => {
	const context = await browser.newContext({
		javaScriptEnabled: false,
		viewport: { width: 320, height: 568 }
	});
	const page = await context.newPage();
	await page.route('**/*.woff2', (route) => route.abort());
	await page.goto('http://localhost:4173/maintenance/index.html');
	await expect(
		page.getByRole('heading', { level: 1, name: 'Platform maintenance.' })
	).toBeVisible();
	await expect(page.getByRole('link', { name: 'Email support', exact: true })).toHaveAttribute(
		'href',
		'mailto:support@revolutiontradingpros.com'
	);
	await expect(page.getByRole('button', { name: 'Try this page again' })).toBeHidden();
	await expect(
		page.getByText('Refresh this page to check whether access has been restored.', { exact: true })
	).toBeVisible();
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth - document.documentElement.clientWidth
		)
	).toBe(0);
	await context.close();
});
