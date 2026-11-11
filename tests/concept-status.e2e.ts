import { expect, test } from '@playwright/test';

test('concept offers explain unavailability and close with keyboard focus restored', async ({
	page
}) => {
	for (const url of [
		'/',
		'/live-trading-rooms/day-trading-room',
		'/alert-services/sunday-alpha-protocol',
		'/store/indicators/move-prior-to-the-move-system'
	]) {
		await page.goto(url);
		await expect(page.getByLabel('Concept development notice')).toContainText('developed with AI');
		await expect(page.getByLabel('Concept development notice')).toContainText(
			'have never been made available'
		);
		const trigger = page.locator('[data-concept-offer]').first();
		await trigger.click();
		const dialog = page.getByRole('dialog', { name: 'Purchases unavailable — concept only' });
		await expect(dialog).toBeVisible();
		await expect(dialog).toContainText(
			'No orders, payments, deposits, or paid enrollment are accepted.'
		);
		await expect(dialog.locator('input')).toHaveCount(0);
		await page.keyboard.press('Escape');
		await expect(dialog).not.toBeVisible();
		await expect(trigger).toBeFocused();
		await expect(page).toHaveURL(new RegExp(`${url === '/' ? '/$' : url + '$'}`));
	}
});

test('mobile concept disclosure and offer dialog fit the viewport', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');
	await page.locator('[data-concept-offer]').first().click();
	const dialog = page.getByRole('dialog', { name: 'Purchases unavailable — concept only' });
	await expect(dialog).toBeVisible();
	await page.screenshot({ path: '/tmp/concept-dialog-mobile.png' });
	const bounds = await dialog.boundingBox();
	expect(bounds).not.toBeNull();
	expect(bounds!.x).toBeGreaterThanOrEqual(0);
	expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
	await dialog.getByRole('button', { name: 'Close and continue exploring' }).click();
	await expect(dialog).not.toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
	await page.screenshot({ path: '/tmp/concept-mobile.png', fullPage: false });
});

test('direct commerce requests are blocked while public educational pages remain indexable', async ({
	request,
	baseURL
}) => {
	for (const method of ['GET', 'POST']) {
		for (const path of [
			'/checkout',
			'/api/checkout/session',
			'/api/payments',
			'/api/subscriptions/create'
		]) {
			const response = await request.fetch(path, {
				method,
				headers: { Origin: baseURL!, 'Content-Type': 'application/json' }
			});
			expect(response.status()).toBe(403);
			expect(response.headers()['x-robots-tag']).toBe('noindex, nofollow');
			expect(await response.json()).toMatchObject({ code: 'CONCEPT_ONLY' });
		}
	}
	const home = await request.get('/');
	expect(home.status()).toBe(200);
	const html = await home.text();
	expect(html).toContain('Concept preview');
	expect(html).toContain('index, follow');
	const protocol = await request.get('/alert-services/sunday-alpha-protocol');
	const protocolHtml = await protocol.text();
	expect(protocolHtml).not.toContain('https://schema.org/InStock');
	expect(protocolHtml).not.toContain('Lock In $47/Month');
	expect(protocolHtml).not.toContain('"@type":"Offer"');
});
