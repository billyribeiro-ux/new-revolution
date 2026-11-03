import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('an open app navigates to maintenance and recovers after deactivation', async ({ page }) => {
	let maintenance = false;
	const html = await readFile('static/maintenance/index.html', 'utf8');
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
	await expect(page.getByRole('heading', { name: /we'll be back soon/i })).toBeVisible();
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
	await expect(page.getByRole('heading', { name: /we'll be back soon/i })).toBeVisible();
	const blocked = await page.goto('http://localhost:4173/resources/stock-indexes-list');
	expect(blocked?.status()).toBe(503);
	await page.keyboard.press('Tab');
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
		await page.locator('.chart').evaluate((element) => getComputedStyle(element).animationName)
	).toBe('none');
	expect(errors).toEqual([]);
});
