import { expect, test } from '@playwright/test';

const articlePath = '/blog/institutional-order-flow-and-gamma-flip-playbook';

test('keeps the TOC on desktop and aligns the article reading column across breakpoints', async ({
	page
}) => {
	await page.goto(articlePath);
	const toc = page.locator('.article-toc-aside');
	for (const width of [320, 375, 768, 1024, 1179, 1180, 1181, 1280, 1440, 1920, 2440, 2880]) {
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
				body: rect('.article-main-column'),
				faq: rect('.article-faq-section')
			};
		});
		expect(geometry.scrollWidth).toBeLessThanOrEqual(width);
		expect(geometry.body.width).toBeLessThanOrEqual(901);
		expect(Math.abs(geometry.header.x - geometry.body.x)).toBeLessThan(2);
		expect(Math.abs(geometry.cover.x - geometry.body.x)).toBeLessThan(2);
		expect(Math.abs(geometry.faq.x - geometry.body.x)).toBeLessThan(2);
		expect(Math.abs(geometry.cover.width - geometry.body.width)).toBeLessThan(2);
	}
});

test('keeps link and icon geometry stable on hover and focus', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto(articlePath);
	const link = page.locator('.toc-list a').first();
	const icon = page.locator('.toc-toggle-icon');
	const before = { link: await link.boundingBox(), icon: await icon.boundingBox() };
	await link.hover();
	expect(await link.boundingBox()).toEqual(before.link);
	await link.focus();
	expect(await link.boundingBox()).toEqual(before.link);
	await page.locator('.toc-summary').hover();
	expect(await icon.boundingBox()).toEqual(before.icon);
});

/** The seeded article has four links. Extend only its local DOM to exercise a
 * production-length TOC against the real template and native FAQ controls. */
async function extendLocalToc(page: import('@playwright/test').Page) {
	// Wait for the real enhancement before extending the browser-only fixture;
	// hydration legitimately owns and reconciles the server-rendered list.
	await expect
		.poll(() =>
			page
				.locator('.toc-details')
				.evaluate((panel) => (panel as HTMLElement).style.getPropertyValue('--toc-nav-limit'))
		)
		.not.toBe('');
	await page.locator('.toc-list').evaluate((list) => {
		const item = list.children[0];
		for (let i = 0; i < 25; i++) list.append(item.cloneNode(true));
	});
}

test('adapts the navigation height without moving the panel when the last FAQ opens', async ({
	page
}) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto(articlePath);
	await extendLocalToc(page);
	const lastSummary = page.locator('.faq-details').last().locator('summary');
	await lastSummary.evaluate((element) =>
		window.scrollTo({
			top: element.getBoundingClientRect().top + scrollY - 150,
			behavior: 'instant'
		})
	);
	const measure = () =>
		page.evaluate(() => {
			const panel = document.querySelector('.toc-details')!.getBoundingClientRect();
			const boundary = document.querySelector('.article-main-column')!.getBoundingClientRect();
			const nav = document.querySelector('.toc-details nav')!;
			const summary = [...document.querySelectorAll('.faq-summary')]
				.at(-1)!
				.getBoundingClientRect();
			return {
				top: panel.top,
				x: panel.x,
				bottom: panel.bottom,
				boundary: boundary.bottom,
				height: nav.clientHeight,
				scrollHeight: nav.scrollHeight,
				summary: summary.top,
				scrollY
			};
		});
	const stickyTop = await page.evaluate(
		() =>
			document.querySelector('.nav-shell')!.getBoundingClientRect().height +
			Number.parseFloat(getComputedStyle(document.documentElement).fontSize) * 0.5
	);
	await expect.poll(async () => (await measure()).top).toBeCloseTo(stickyTop, 0);
	const before = await measure();
	expect(before.scrollHeight).toBeGreaterThan(before.height);
	await lastSummary.click();
	await expect.poll(async () => (await measure()).height).toBeGreaterThan(before.height);
	const after = await measure();
	expect(Math.abs(after.top - before.top)).toBeLessThanOrEqual(1);
	expect(after.x).toBe(before.x);
	expect(Math.abs(after.summary - before.summary)).toBeLessThanOrEqual(1);
	expect(after.scrollY).toBe(before.scrollY);
	expect(after.bottom).toBeLessThanOrEqual(after.boundary);
	await lastSummary.click();
	await expect.poll(async () => (await measure()).height).toBe(before.height);
	expect(Math.abs((await measure()).top - before.top)).toBeLessThanOrEqual(1);
});

test('chains wheel scrolling to the page at the TOC edge', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 640 });
	await page.goto(articlePath);
	await extendLocalToc(page);
	await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }));
	const nav = page.locator('.toc-details nav');
	await nav.evaluate((element) => {
		element.scrollTop = element.scrollHeight;
	});
	await nav.hover();
	const before = await page.evaluate(() => scrollY);
	await page.mouse.wheel(0, 300);
	await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
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
		const anchorOffset =
			document.querySelector('.nav-shell')!.getBoundingClientRect().height +
			Number.parseFloat(getComputedStyle(document.documentElement).fontSize) * 1.5;
		window.scrollTo({
			top: target.getBoundingClientRect().top + scrollY - anchorOffset,
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
