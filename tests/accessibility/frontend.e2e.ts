import { expect, test } from '@playwright/test';
import { chromium, firefox, webkit } from 'playwright';
import { auditAccessibility } from './axe';

const TABLE_ROUTES = [
	'/live-trading-rooms/day-trading-room',
	'/live-trading-rooms/swing-trading-room',
	'/live-trading-rooms/small-accounts-room',
	'/resources/etf-stocks-list',
	'/resources/stock-indexes-list',
	'/store/courses'
];
const AUDIT_ROUTES = [...TABLE_ROUTES, '/blog/institutional-order-flow-and-gamma-flip-playbook'];

for (const width of [320, 375, 1440, 1584]) {
	test(`real axe scan at ${width}px`, async ({ page }, testInfo) => {
		test.setTimeout(120_000);
		await page.setViewportSize({ width, height: 900 });
		for (const route of AUDIT_ROUTES) {
			expect((await page.goto(route))?.status(), route).toBe(200);
			await page.locator('h1').waitFor();
			await page.evaluate(() => document.fonts.ready);
			const result = await auditAccessibility(page);
			await testInfo.attach(`${route.replaceAll('/', '_')}-${width}-axe`, {
				body: JSON.stringify(result, null, 2),
				contentType: 'application/json'
			});
			expect(
				result.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious'),
				`${route}: ${JSON.stringify(result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`
			).toEqual([]);
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
				`${route} must reflow without page-level horizontal overflow`
			).toBe(true);
		}
	});
}

for (const [browserName, browserType] of Object.entries({ chromium, firefox, webkit })) {
	for (const javaScriptEnabled of [true, false]) {
		test(`${browserName}: native table keyboard access, JavaScript=${javaScriptEnabled}`, async ({
			baseURL
		}) => {
			test.setTimeout(90_000);
			const browser = await browserType.launch();
			try {
				const context = await browser.newContext({
					baseURL,
					javaScriptEnabled,
					viewport: { width: 320, height: 900 }
				});
				const page = await context.newPage();
				for (const route of TABLE_ROUTES) {
					await test.step(route, async () => {
						expect((await page.goto(route))?.status(), route).toBe(200);
						const region = page.locator('.table-wrapper, .sec1256-table-wrap');
						await expect(region).toHaveRole('region');
						await expect(region).toHaveAccessibleName(/\S/);
						await expect(region).toHaveAttribute('tabindex', '0');
						await region.focus();
						await expect(region).toBeFocused();
						await page.keyboard.press('Shift+Tab');
						await expect(region).not.toBeFocused();
						await page.keyboard.press('Tab');
						await expect(region).toBeFocused();
						// WebKit needs a real key duration to start native scroll animation.
						await page.keyboard.press('ArrowRight', { delay: 150 });
						await expect.poll(() => region.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
						const outline = await region.evaluate((el) => {
							const style = getComputedStyle(el);
							return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
						});
						expect(outline.style).toBe('solid');
						expect(outline.width).toBeGreaterThanOrEqual(3);
						await page.keyboard.press('Tab');
						await expect(region).not.toBeFocused();
					});
				}
			} finally {
				await browser.close();
			}
		});
	}
}

test('axe detects the original defects and ignores hidden decorative icons', async ({ page }) => {
	await page.setContent(`<!doctype html><html lang="en"><head><title>Accessibility control</title></head>
		<body><main><h1>Accessibility control</h1><svg role="img"><path d="M0 0h10v10z"/></svg>
		<div id="scroll" style="width:100px;overflow:auto"><p style="width:600px">Wide content</p></div>
		<div hidden><button></button></div></main></body></html>`);
	const before = await auditAccessibility(page);
	expect(before.violations.map((v) => v.id)).toEqual(
		expect.arrayContaining(['svg-img-alt', 'scrollable-region-focusable'])
	);
	expect(before.violations.map((v) => v.id)).not.toContain('button-name');
	await page.locator('svg').evaluate((el) => el.setAttribute('aria-hidden', 'true'));
	await page.locator('#scroll').evaluate((el) => {
		el.setAttribute('tabindex', '0');
		el.setAttribute('role', 'region');
		el.setAttribute('aria-label', 'Wide content');
	});
	const after = await auditAccessibility(page);
	expect(after.violations).toEqual([]);
});

test('320px reflow survives enlarged text and spacing overrides', async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 900 });
	for (const route of AUDIT_ROUTES) {
		expect((await page.goto(route))?.status(), route).toBe(200);
		await page.addStyleTag({
			content: `html { font-size: 200% !important; }
   * { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; }
   p { margin-block-end: 2em !important; }`
		});
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
			route
		).toBe(true);
		const clippedText = await page.evaluate(() => {
			const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
			const outside: string[] = [];
			while (walker.nextNode()) {
				const node = walker.currentNode;
				const parent = node.parentElement;
				if (
					!parent ||
					!node.textContent?.trim() ||
					parent.closest(
						'script, style, .sr-only, [hidden], [aria-hidden="true"], .table-wrapper, .sec1256-table-wrap'
					)
				)
					continue;
				if (getComputedStyle(parent).visibility !== 'visible') continue;
				const range = document.createRange();
				range.selectNodeContents(node);
				const rect = range.getBoundingClientRect();
				if (rect.width > 0 && (rect.right > innerWidth + 1 || rect.left < -1))
					outside.push(node.textContent.trim().slice(0, 80));
			}
			return outside;
		});
		expect(
			clippedText,
			`${route}: visible text must remain readable, including inside clipped containers`
		).toEqual([]);
	}
});
