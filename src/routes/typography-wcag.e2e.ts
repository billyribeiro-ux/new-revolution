import { expect, test } from '@playwright/test';

const REPRESENTATIVE_ROUTES = [
	'/',
	'/blog',
	'/live-trading-rooms',
	'/mentorship',
	'/contact'
] as const;

test.describe('Enterprise Typography & WCAG 2.2 AA Verification', () => {
	test('scales homepage hero & announcement typography monotonically across 320px–1920px with zero horizontal overflow', async ({
		page
	}) => {
		const widths = [1920, 1536, 1440, 1280, 1024, 1023, 768, 375, 320];
		await page.goto('/', { waitUntil: 'domcontentloaded' });

		const measured: Array<{
			width: number;
			annMsg: number;
			eyebrow: number;
			kicker: number;
			h1: number;
			overflow: boolean;
		}> = [];

		for (const width of widths) {
			await page.setViewportSize({ width, height: 900 });
			const snap = await page.evaluate(() => {
				const px = (sel: string) =>
					Number.parseFloat(getComputedStyle(document.querySelector(sel)!).fontSize);
				return {
					annMsg: px('.announcement-message'),
					eyebrow: px('.hero .eyebrow'),
					kicker: px('.hero .h1-query'),
					h1: px('.hero .h1-emotional'),
					overflow: document.documentElement.scrollWidth > window.innerWidth + 1
				};
			});
			expect(snap.overflow, `Horizontal overflow at ${width}px`).toBe(false);
			measured.push({ width, ...snap });
		}

		// Endpoint checks (1920/1536 ceiling -> 375/320 floor)
		expect(measured[0].eyebrow).toBeCloseTo(16, 1);
		expect(measured[0].kicker).toBeCloseTo(14, 1);
		expect(measured[0].h1).toBeCloseTo(50, 1);
		expect(measured.at(-1)!.eyebrow).toBeCloseTo(12, 1);
		expect(measured.at(-1)!.kicker).toBeCloseTo(12, 1);
		expect(measured.at(-1)!.h1).toBeCloseTo(32, 1);

		// Monotonic non-increasing when dragging narrower from 1920 -> 320 (0.05px float tolerance)
		for (let i = 1; i < measured.length; i++) {
			expect(measured[i].eyebrow).toBeLessThanOrEqual(measured[i - 1].eyebrow + 0.05);
			expect(measured[i].kicker).toBeLessThanOrEqual(measured[i - 1].kicker + 0.05);
			expect(measured[i].h1).toBeLessThanOrEqual(measured[i - 1].h1 + 0.05);
			expect(measured[i].annMsg).toBeLessThanOrEqual(measured[i - 1].annMsg + 0.05);
		}
	});

	for (const route of REPRESENTATIVE_ROUTES) {
		test(`passes WCAG 1.4.10 (320px reflow), WCAG 1.4.4 (200% root resize), and WCAG 1.4.12 (text spacing) on ${route}`, async ({
			page
		}) => {
			// 1. WCAG 1.4.10: 320 CSS px reflow without page-level horizontal scroll
			await page.setViewportSize({ width: 320, height: 900 });
			await page.goto(route, { waitUntil: 'domcontentloaded' });
			const overflowAt320 = await page.evaluate(
				() => document.documentElement.scrollWidth > window.innerWidth + 1
			);
			expect(overflowAt320, `${route} overflows horizontally at 320px`).toBe(false);

			// 2. WCAG 1.4.4: 200% root font-size preference (32px root at 1280px desktop)
			await page.setViewportSize({ width: 1280, height: 900 });
			const baseH1Size = await page
				.locator('h1')
				.first()
				.evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize));
			await page.evaluate(
				() =>
					new Promise<void>((resolve) => {
						document.documentElement.style.fontSize = '32px';
						requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
					})
			);
			const enlarged = await page.evaluate(() => {
				const h1 = document.querySelector('h1')!;
				const rect = h1.getBoundingClientRect();
				return {
					h1Size: Number.parseFloat(getComputedStyle(h1).fontSize),
					h1Right: rect.right,
					viewportWidth: window.innerWidth,
					overflow: document.documentElement.scrollWidth > window.innerWidth + 1
				};
			});
			expect(enlarged.h1Size).toBeGreaterThan(baseH1Size * 1.4);
			expect(enlarged.h1Right).toBeLessThanOrEqual(enlarged.viewportWidth + 1);
			expect(enlarged.overflow, `${route} overflows at 200% root font-size`).toBe(false);

			// Reset root font-size and apply WCAG 1.4.12 normative text-spacing overrides
			await page.evaluate(
				() =>
					new Promise<void>((resolve) => {
						document.documentElement.style.removeProperty('font-size');
						requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
					})
			);
			await page.addStyleTag({
				content: `
					* {
						line-height: 1.5 !important;
						letter-spacing: 0.12em !important;
						word-spacing: 0.16em !important;
					}
					p {
						margin-bottom: 2em !important;
					}
				`
			});
			await page.evaluate(
				() =>
					new Promise<void>((resolve) => {
						requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
					})
			);

			const spacingCheck = await page.evaluate(() => {
				const h1 = document.querySelector('h1')!;
				const h1Rect = h1.getBoundingClientRect();
				return {
					overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
					h1Visible: h1Rect.width > 0 && h1Rect.height > 0 && h1Rect.right <= window.innerWidth + 1
				};
			});
			expect(spacingCheck.overflow, `${route} overflows under WCAG 1.4.12 text-spacing`).toBe(
				false
			);
			expect(spacingCheck.h1Visible, `${route} h1 clipped under WCAG 1.4.12`).toBe(true);
		});
	}
});
