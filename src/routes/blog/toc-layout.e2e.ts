import { expect, test } from '@playwright/test';

const articlePath = '/blog/institutional-order-flow-and-gamma-flip-playbook';

test('keeps the TOC on wide desktop and aligns the article reading column flush with container across breakpoints', async ({
	page
}) => {
	await page.goto(articlePath);
	const toc = page.locator('.article-toc-aside');
	for (const width of [
		320, 375, 768, 1024, 1180, 1280, 1440, 1536, 1728, 1899, 1900, 1920, 2048, 2440, 2880
	]) {
		await page.setViewportSize({ width, height: 900 });
		await expect(toc).toBeVisible({ visible: width >= 1900 });
		const geometry = await page.evaluate(() => {
			const rect = (selector: string) => {
				const element = document.querySelector(selector);
				if (!element) throw new Error(`Missing ${selector}`);
				return element.getBoundingClientRect().toJSON();
			};
			const navContainer = document.querySelector<HTMLElement>(
				'header.nav-shell > .container.nav'
			)!;
			const navRect = navContainer.getBoundingClientRect();
			const navInnerLeft =
				navRect.x + Number.parseFloat(getComputedStyle(navContainer).paddingInlineStart);
			const navInnerWidth =
				navRect.width -
				Number.parseFloat(getComputedStyle(navContainer).paddingInlineStart) -
				Number.parseFloat(getComputedStyle(navContainer).paddingInlineEnd);
			const related = document.querySelector<HTMLElement>('.related-articles-section');
			const backRow = document.querySelector<HTMLElement>('.back-to-blog-row');
			const tocEl = document.querySelector<HTMLElement>('.article-toc-aside');
			const tocVisible = tocEl && getComputedStyle(tocEl).display !== 'none';
			return {
				availableInlineSize: document.documentElement.getBoundingClientRect().width,
				availableInlineStart: document.documentElement.getBoundingClientRect().x,
				rootFontSize: Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
				scrollWidth: document.documentElement.scrollWidth,
				navShell: navRect.toJSON(),
				navInnerLeft,
				navInnerWidth,
				breadcrumbShell: rect('.breadcrumb-bar__inner'),
				articleShell: rect('.article-container'),
				header: rect('.article-header'),
				cover: rect('.article-cover-figure'),
				body: rect('.article-main-column'),
				prose: rect('.article-prose'),
				faq: rect('.article-faq-section'),
				toc: tocVisible && tocEl ? tocEl.getBoundingClientRect().toJSON() : null,
				related: related ? related.getBoundingClientRect().toJSON() : null,
				backRow: backRow ? backRow.getBoundingClientRect().toJSON() : null
			};
		});
		expect(geometry.scrollWidth).toBeLessThanOrEqual(width);
		expect(Math.abs(geometry.breadcrumbShell.x - geometry.navShell.x)).toBeLessThan(1);
		expect(Math.abs(geometry.breadcrumbShell.width - geometry.navShell.width)).toBeLessThan(1);
		expect(Math.abs(geometry.articleShell.x - geometry.navShell.x)).toBeLessThan(1);
		expect(Math.abs(geometry.articleShell.width - geometry.navShell.width)).toBeLessThan(1);
		// The frame fills the available root layout box, capped at 96rem. Reserved
		// gutters sit outside that box even when headless Chromium hides the scrollbar.
		// From the external TOC breakpoint they are symmetric on every public route.
		// Keep both the independent root origin and width when checking centering.
		if (width >= 1900) {
			const reservedInlineEnd =
				width - geometry.availableInlineStart - geometry.availableInlineSize;
			expect(Math.abs(geometry.availableInlineStart - reservedInlineEnd)).toBeLessThan(1);
		}
		const expectedFrame = Math.min(96 * geometry.rootFontSize, geometry.availableInlineSize);
		expect(Math.abs(geometry.navShell.width - expectedFrame)).toBeLessThan(1);
		expect(
			Math.abs(
				geometry.navShell.x -
					(geometry.availableInlineStart + (geometry.availableInlineSize - expectedFrame) / 2)
			)
		).toBeLessThan(1);
		if (geometry.related) {
			expect(Math.abs(geometry.related.x - geometry.navInnerLeft)).toBeLessThan(1);
			expect(Math.abs(geometry.related.width - geometry.navInnerWidth)).toBeLessThan(1);
		}
		if (geometry.backRow) {
			expect(Math.abs(geometry.backRow.x - geometry.navInnerLeft)).toBeLessThan(1);
			expect(Math.abs(geometry.backRow.width - geometry.navInnerWidth)).toBeLessThan(1);
		}
		expect(Math.abs(geometry.header.x - geometry.navInnerLeft)).toBeLessThan(1);
		expect(Math.abs(geometry.header.width - geometry.navInnerWidth)).toBeLessThan(1);
		expect(Math.abs(geometry.cover.x - geometry.navInnerLeft)).toBeLessThan(1);
		expect(Math.abs(geometry.cover.width - geometry.navInnerWidth)).toBeLessThan(1);
		expect(Math.abs(geometry.body.x - geometry.navInnerLeft)).toBeLessThan(1);
		expect(Math.abs(geometry.body.width - geometry.navInnerWidth)).toBeLessThan(1);
		expect(Math.abs(geometry.prose.x - geometry.navInnerLeft)).toBeLessThan(1);
		expect(Math.abs(geometry.prose.width - geometry.navInnerWidth)).toBeLessThan(1);
		expect(Math.abs(geometry.faq.x - geometry.navInnerLeft)).toBeLessThan(1);
		expect(Math.abs(geometry.faq.width - geometry.navInnerWidth)).toBeLessThan(1);
		if (geometry.toc) {
			expect(geometry.toc.x).toBeGreaterThanOrEqual(15);
			expect(geometry.header.x - (geometry.toc.x + geometry.toc.width)).toBeGreaterThanOrEqual(27);
		}
	}

	for (const width of [320, 1440, 1536, 1920]) {
		await page.setViewportSize({ width, height: 900 });
		const overflowAt200Percent = await page.evaluate(async () => {
			document.documentElement.style.fontSize = '32px';
			await new Promise<void>((resolve) =>
				requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
			);
			const overflow = document.documentElement.scrollWidth - window.innerWidth;
			document.documentElement.style.fontSize = '';
			await new Promise<void>((resolve) =>
				requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
			);
			return overflow;
		});
		expect(overflowAt200Percent).toBeLessThanOrEqual(0);
	}
});

test('keeps link and icon geometry stable on hover and focus', async ({ page }) => {
	await page.setViewportSize({ width: 1920, height: 1000 });
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

test('keeps the navigation height stable without squishing or moving the panel when the last FAQ opens', async ({
	page
}) => {
	await page.setViewportSize({ width: 1920, height: 1000 });
	await page.goto(articlePath);
	await extendLocalToc(page);
	const lastSummary = page.locator('.faq-details').last().locator('summary');
	await page.evaluate(() =>
		window.scrollTo({
			top: 600,
			behavior: 'instant'
		})
	);
	const measure = () =>
		page.evaluate(() => {
			const panel = document.querySelector('.toc-details')!.getBoundingClientRect();
			const boundary = document.querySelector('.article-prose')!.getBoundingClientRect();
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
	await lastSummary.dispatchEvent('click');
	const after = await measure();
	expect(after.height).toBe(before.height);
	expect(Math.abs(after.top - before.top)).toBeLessThanOrEqual(1);
	expect(after.x).toBe(before.x);
	expect(Math.abs(after.summary - before.summary)).toBeLessThanOrEqual(1);
	expect(after.scrollY).toBe(before.scrollY);
	await lastSummary.dispatchEvent('click');
	await expect.poll(async () => (await measure()).height).toBe(before.height);
	expect(Math.abs((await measure()).top - before.top)).toBeLessThanOrEqual(1);
});

test('chains wheel scrolling to the page at the TOC edge', async ({ page }) => {
	await page.setViewportSize({ width: 1920, height: 640 });
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

test('supports native collapse, keyboard control, heading navigation without # URL pollution, and active tracking', async ({
	page
}) => {
	await page.setViewportSize({ width: 1920, height: 900 });
	await page.goto(articlePath);
	const details = page.locator('.toc-details');
	const summary = details.locator('summary');
	const nav = details.getByRole('navigation', { name: 'Article sections' });
	await expect(details).toHaveAttribute('open', '');
	await expect(nav).toBeVisible();
	await expect(nav.locator('.toc-list ol a')).toHaveCount(0);
	await summary.focus();
	await page.keyboard.press('Enter');
	await expect(details).not.toHaveAttribute('open', '');
	await expect(nav).not.toBeVisible();
	await expect(summary).toBeFocused();
	await page.setViewportSize({ width: 768, height: 900 });
	await expect(page.locator('.article-toc-aside')).not.toBeVisible();
	await page.setViewportSize({ width: 1920, height: 900 });
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
	expect(new URL(page.url()).hash).toBe('');
	await expect
		.poll(() => target.evaluate((el) => el.getBoundingClientRect().top))
		.toBeLessThan(250);
	await expect(link).toHaveAttribute('aria-current', 'location');
});

test('keeps its control and scrollable links reachable in a short desktop viewport', async ({
	page
}) => {
	await page.setViewportSize({ width: 1920, height: 320 });
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
		viewport: { width: 1920, height: 900 }
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
