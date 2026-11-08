import { expect, test } from '@playwright/test';

test('keeps the shared navigation usable without JavaScript and at 200% text', async ({
	browser,
	baseURL
}) => {
	const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
	try {
		const page = await context.newPage();
		for (const width of [320, 1440, 2440]) {
			await page.setViewportSize({ width, height: 900 });
			await page.goto('/blog');
			// The site's scripts remain disabled; test tooling changes only the text scale.
			await page.evaluate(() => {
				document.documentElement.style.fontSize = '32px';
			});
			const navigation = page.getByRole('navigation', {
				name: 'Site navigation without JavaScript'
			});
			await expect(navigation).toBeVisible();
			await expect(navigation.getByRole('link', { name: 'Blog', exact: true })).toHaveAttribute(
				'href',
				/blog$/
			);
			await expect(
				navigation.getByRole('link', { name: 'Sunday Alpha Protocol', exact: true })
			).toHaveAttribute('href', /\/alert-services\/sunday-alpha-protocol$/);
			await expect(
				navigation.getByRole('link', { name: 'Member Login', exact: true })
			).toBeVisible();
			const outside = await navigation.locator('a').evaluateAll((links) =>
				links
					.filter((link) => {
						const rect = link.getBoundingClientRect();
						return rect.left < -1 || rect.right > innerWidth + 1;
					})
					.map((link) => link.textContent)
			);
			expect(outside).toEqual([]);
			await expect(page.locator('.mobile-toggle')).toBeHidden();
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
				width
			);
		}
	} finally {
		await context.close();
	}
});
