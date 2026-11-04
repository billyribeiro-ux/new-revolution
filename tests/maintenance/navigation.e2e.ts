import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { buildEnabledMaintenancePage } from './enabled-page.ts';

let enabledWaitlistPage: string;
test.beforeAll(async () => {
	enabledWaitlistPage = await buildEnabledMaintenancePage();
});

async function openEnabledWaitlist(page: Page) {
	await page.route('**/maintenance/index.html', (route) =>
		route.fulfill({ contentType: 'text/html', body: enabledWaitlistPage })
	);
	await page.goto('http://localhost:4173/maintenance/index.html');
}

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
	await expect(page.getByRole('heading', { name: /a stronger trading experience/i })).toBeVisible();
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
	await expect(page.getByRole('heading', { name: /a stronger trading experience/i })).toBeVisible();
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
	await expect(page.getByRole('link', { name: 'Email support' })).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
	expect(
		await page
			.locator('.market-chart')
			.evaluate((element) => getComputedStyle(element).animationName)
	).toBe('none');
	expect(errors).toEqual([]);
});

test('waitlist and chart reflow from 320px to desktop and preserve keyboard access', async ({
	page,
	browserName
}) => {
	await openEnabledWaitlist(page);
	await expect(page.locator('#market-chart canvas').first()).toBeVisible();
	for (const width of [320, 375, 768, 1024, 1440]) {
		await page.setViewportSize({ width, height: 844 });
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth - document.documentElement.clientWidth
			),
			`${width}px`
		).toBe(0);
		await expect(page.locator('.maintenance-visual')).toBeVisible();
		await expect(page.getByRole('button', { name: /notify me/i })).toBeVisible();
	}
	await page.goto('http://localhost:4173/maintenance/index.html');
	await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
	await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(page.locator('#maintenance-main')).toBeFocused();
	await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
	await expect(page.getByLabel('Your email address')).toBeFocused();
});

test('playback can pause and restart; form shows provider-independent saved/error states', async ({
	page
}) => {
	await openEnabledWaitlist(page);
	await expect(page.getByRole('button', { name: 'Pause playback' })).toBeVisible();
	await page.getByRole('button', { name: 'Pause playback' }).click();
	const readout = await page.locator('#chart-readout').innerText();
	await page.waitForTimeout(350);
	await expect(page.locator('#chart-readout')).toHaveText(readout);
	await page.getByRole('button', { name: 'Restart & follow' }).click();
	await page.route('**/api/waitlist/signup', (route) =>
		route.fulfill({
			status: 503,
			contentType: 'application/json',
			body: JSON.stringify({ error: 'Unable to save right now.' })
		})
	);
	await page.getByLabel('Your email address').fill('fixture@example.com');
	await page.getByRole('checkbox').check();
	await page.getByRole('button', { name: /notify me/i }).click();
	await expect(page.getByRole('status')).toContainText('Unable to save');
	await page.route('**/api/waitlist/signup', (route) =>
		route.fulfill({
			status: 202,
			contentType: 'application/json',
			body: JSON.stringify({ message: 'Request saved. Check your email to confirm.' })
		})
	);
	await page.getByRole('button', { name: /notify me/i }).click();
	await expect(page.getByRole('status')).toContainText('Request saved');
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
		page.getByRole('heading', { level: 1, name: /a stronger trading experience/i })
	).toBeVisible();
	await expect(page.getByRole('link', { name: 'Email support', exact: true })).toHaveAttribute(
		'href',
		'mailto:support@revolutiontradingpros.com'
	);
	await expect(page.getByRole('button', { name: 'Try this page again' })).toBeHidden();
	await expect(page.locator('#waitlist-form')).toHaveCount(0);
	await expect(page.getByText(/The signup works without JavaScript/)).toHaveCount(0);
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth - document.documentElement.clientWidth
		)
	).toBe(0);
	await context.close();
});

test('disabled capture offers support without a failing form or reopening-email promise', async ({
	page
}) => {
	await page.goto('http://localhost:4173/maintenance/index.html');
	await expect(page.locator('#waitlist-form')).toHaveCount(0);
	await expect(page.getByRole('link', { name: 'Email support', exact: true })).toBeVisible();
	await expect(page.getByText(/Leave your email|Notify me when|Confirm your email/i)).toHaveCount(
		0
	);
	await expect(page.locator('#market-chart canvas').first()).toBeVisible();
});

test('enabled capture has identified controls and dimensioned images without JavaScript', async ({
	browser
}) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	try {
		const page = await context.newPage();
		await openEnabledWaitlist(page);
		await expect(page.getByLabel('Your email address')).toBeVisible();
		await expect(page.getByText(/The signup works without JavaScript/)).toBeVisible();
		const warnings = await page.evaluate(() => ({
			unnamedControls: [...document.querySelectorAll('input,select,textarea')]
				.filter((element) => !element.id && !element.getAttribute('name'))
				.map((element) => element.outerHTML),
			lazyImagesWithoutSize: [...document.querySelectorAll('img[loading="lazy"]')]
				.filter(
					(element) =>
						!(element.getAttribute('width') && element.getAttribute('height')) &&
						getComputedStyle(element).aspectRatio === 'auto'
				)
				.map((element) => element.outerHTML)
		}));
		expect(warnings).toEqual({ unnamedControls: [], lazyImagesWithoutSize: [] });
		await expect(page.locator('.maintenance-emblem')).toHaveAttribute('width', '40');
		await expect(page.locator('.maintenance-emblem')).toHaveAttribute('height', '40');
	} finally {
		await context.close();
	}
});
