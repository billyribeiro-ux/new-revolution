import { expect, test } from '@playwright/test';

const articlePath = '/blog/institutional-order-flow-and-gamma-flip-playbook';

test('keeps the TOC on desktop and aligns the article reading column across breakpoints', async ({
	page
}) => {
	await page.goto(articlePath);
	const toc = page.locator('.article-toc-aside');
	for (const width of [320, 375, 768, 1024, 1179, 1180, 1280, 1440, 1920, 2420]) {
		await page.setViewportSize({ width, height: 900 });
		await expect(toc).toBeVisible({ visible: width >= 1180 });
		const geometry = await page.evaluate(() => {
			const rect = (selector: string) => {
				const element = document.querySelector(selector);
				if (!element) throw new Error(`Missing ${selector}`);
				return element.getBoundingClientRect().toJSON();
			};
			return {
				scrollWidth: document.documentElement.scrollWidth,
				header: rect('.article-header'),
				cover: rect('.article-cover-figure'),
				body: rect('.article-main-column')
			};
		});
		expect(geometry.scrollWidth).toBeLessThanOrEqual(width);
		expect(geometry.body.width).toBeLessThanOrEqual(901);
		expect(Math.abs(geometry.header.x - geometry.body.x)).toBeLessThan(2);
		expect(Math.abs(geometry.cover.x - geometry.body.x)).toBeLessThan(2);
	}
});

test('supports native collapse, keyboard control, heading navigation and active tracking', async ({
	page
}) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await page.goto(articlePath);
	const details = page.locator('.toc-details');
	const summary = details.locator('summary');
	const nav = details.getByRole('navigation', { name: 'Article sections' });
	await expect(details).toHaveAttribute('open', '');
	await expect(nav).toBeVisible();
	await expect(nav.locator('.toc-list ol a').first()).toBeVisible();
	await summary.focus();
	await page.keyboard.press('Enter');
	await expect(details).not.toHaveAttribute('open', '');
	await expect(nav).not.toBeVisible();
	await expect(summary).toBeFocused();
	await page.setViewportSize({ width: 768, height: 900 });
	await expect(page.locator('.article-toc-aside')).not.toBeVisible();
	await page.setViewportSize({ width: 1440, height: 900 });
	await expect(details).not.toHaveAttribute('open', '');
	await summary.focus();
	await page.keyboard.press('Space');
	await expect(details).toHaveAttribute('open', '');
	await expect(nav).toBeVisible();
	const link = nav.locator('a[href^="#"]').nth(1);
	const hash = await link.getAttribute('href');
	expect(hash).toBeTruthy();
	const target = page.locator('.article-prose').locator(`[id="${hash!.slice(1)}"]`);
	await expect(target).toHaveCount(1);
	await link.click();
	await expect(page).toHaveURL(new RegExp(`${hash!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
	await expect
		.poll(() => target.evaluate((el) => el.getBoundingClientRect().top))
		.toBeLessThan(250);
	await expect(link).toHaveAttribute('aria-current', 'location');
});

test('keeps its control and scrollable links reachable in a short desktop viewport', async ({
	page
}) => {
	await page.setViewportSize({ width: 1280, height: 320 });
	await page.goto(articlePath);
	const details = page.locator('.toc-details');
	await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }));
	const bounds = await details.evaluate((el) => {
		const summary = el.querySelector('summary')!.getBoundingClientRect();
		const nav = el.querySelector('nav')!.getBoundingClientRect();
		return { top: summary.top, height: summary.height, bottom: nav.bottom, viewport: innerHeight };
	});
	expect(bounds.height).toBeGreaterThanOrEqual(44);
	expect(bounds.top).toBeGreaterThanOrEqual(0);
	expect(bounds.bottom).toBeLessThanOrEqual(bounds.viewport);
	const lastLink = details.locator('.toc-list a').last();
	const hash = await lastLink.getAttribute('href');
	const targetId = hash!.slice(1);
	await page.evaluate((id) => {
		const target = document.getElementById(id);
		if (!target) throw new Error('Missing heading');
		window.scrollTo({
			top: target.getBoundingClientRect().top + scrollY - 120,
			behavior: 'instant'
		});
	}, targetId);
	await expect(lastLink).toHaveAttribute('aria-current', 'location');
	const nav = details.getByRole('navigation', { name: 'Article sections' });
	await nav.evaluate((el) => {
		el.scrollTop = 0;
	});
	await details.locator('summary').click();
	await details.locator('summary').click();
	await expect
		.poll(() =>
			lastLink.evaluate((el) => {
				const link = el.getBoundingClientRect();
				const container = el.closest('nav')!.getBoundingClientRect();
				return link.top >= container.top - 1 && link.bottom <= container.bottom + 1;
			})
		)
		.toBe(true);
});

test('TOC disclosure and heading links work without JavaScript', async ({ browser, baseURL }) => {
	const context = await browser.newContext({
		javaScriptEnabled: false,
		viewport: { width: 1440, height: 900 }
	});
	try {
		const page = await context.newPage();
		await page.goto(new URL(articlePath, baseURL).href);
		const details = page.locator('.toc-details');
		const summary = details.locator('summary');
		await expect(details).toHaveAttribute('open', '');
		await summary.click();
		await expect(details).not.toHaveAttribute('open', '');
		await summary.click();
		await expect(details).toHaveAttribute('open', '');
		const link = details.locator('.toc-list a').first();
		const hash = await link.getAttribute('href');
		await link.click();
		expect(new URL(page.url()).hash).toBe(hash);
		await page.setViewportSize({ width: 375, height: 900 });
		await expect(page.locator('.article-toc-aside')).not.toBeVisible();
	} finally {
		await context.close();
	}
});
