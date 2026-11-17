import { expect, test } from '@playwright/test';
import { chromium, firefox, webkit } from 'playwright';

const articlePath = `/blog/${process.env.PLAYWRIGHT_TOC_SLUG ?? 'institutional-order-flow-and-gamma-flip-playbook'}`;

interface TocFrame {
	height: number;
	width: number;
	display: string;
	visibility: string;
	fontStatus: string;
	sameNode: boolean;
}

test('expanded article TOC stays the same size from SSR through font wrapping and delayed hydration', async ({
	baseURL
}) => {
	test.setTimeout(90_000);
	for (const [engine, browserType] of Object.entries({ chromium, firefox, webkit })) {
		await test.step(engine, async () => {
			const browser = await browserType.launch();
			let holdScripts = true;
			let releaseScripts = () => {};
			let releaseFonts = () => {};
			const scriptsReady = new Promise<void>((resolve) => {
				releaseScripts = resolve;
			});
			const fontsReady = new Promise<void>((resolve) => {
				releaseFonts = resolve;
			});
			// Some engines defer their first rendering opportunity until pending fonts finish.
			const fontDeadline = setTimeout(() => releaseFonts(), 500);
			try {
				const context = await browser.newContext({
					baseURL,
					viewport: { width: 1920, height: 1000 },
					reducedMotion: 'reduce'
				});
				await context.route('**/*', async (route) => {
					if (!['GET', 'HEAD'].includes(route.request().method()))
						return route.fulfill({ status: 204 });
					if (route.request().resourceType() === 'font') await fontsReady;
					const clientEntry =
						route.request().url().includes('/runtime/client/entry.js') ||
						route.request().url().includes('/_app/immutable/entry/');
					if (holdScripts && clientEntry) await scriptsReady;
					await route.continue();
				});
				await context.addInitScript(() => {
					const state = window as typeof window & {
						tocFrames: TocFrame[];
						stopTocFrames?: boolean;
					};
					state.tocFrames = [];
					let firstPanel: Element | null = null;
					function sample() {
						const panel = document.querySelector('.toc-details');
						if (panel) {
							firstPanel ??= panel;
							const rect = panel.getBoundingClientRect();
							const style = getComputedStyle(panel);
							state.tocFrames.push({
								height: rect.height,
								width: rect.width,
								display: style.display,
								visibility: style.visibility,
								fontStatus: document.fonts.status,
								sameNode: panel === firstPanel
							});
						}
						if (!state.stopTocFrames) requestAnimationFrame(sample);
					}
					requestAnimationFrame(sample);
				});
				const page = await context.newPage();
				const response = await page.goto(articlePath, { waitUntil: 'commit' });
				console.log(`${engine}: document committed`);
				expect(response?.status()).toBe(200);
				const panel = page.locator('.toc-details');
				await expect(panel).toBeVisible();
				expect(await panel.locator('[data-toc-id]').count()).toBeGreaterThanOrEqual(3);
				await page.evaluate(async () => {
					for (let frame = 0; frame < 12; frame++) await new Promise(requestAnimationFrame);
				});
				console.log(`${engine}: SSR frames captured`);
				releaseFonts();
				await expect.poll(() => page.evaluate(() => document.fonts.status)).toBe('loaded');
				console.log(`${engine}: fonts ready`);
				// A late glyph-width change also covers the documented text-spacing override.
				// Prove that content wraps differently rather than merely inspecting a CSS declaration.
				const contentHeights = await panel.locator('.toc-list').evaluate(async (list) => {
					const element = list as HTMLElement;
					const before = element.getBoundingClientRect().height;
					for (const link of element.querySelectorAll<HTMLElement>('a')) {
						link.style.letterSpacing = '0.12em';
						link.style.wordSpacing = '0.16em';
					}
					await new Promise(requestAnimationFrame);
					return { before, after: element.getBoundingClientRect().height };
				});
				expect(contentHeights.after).toBeGreaterThan(contentHeights.before);
				console.log(`${engine}: wrapping changed`);
				holdScripts = false;
				releaseScripts();
				await expect.poll(() => page.evaluate(() => history.scrollRestoration)).toBe('manual');
				await page.evaluate(() => document.fonts.ready);
				console.log(`${engine}: client hydrated`);
				const frames = await page.evaluate(async () => {
					for (let frame = 0; frame < 12; frame++) await new Promise(requestAnimationFrame);
					const state = window as typeof window & {
						tocFrames: TocFrame[];
						stopTocFrames?: boolean;
					};
					state.stopTocFrames = true;
					return state.tocFrames;
				});
				await test.info().attach(`toc-${engine}-frames`, {
					body: Buffer.from(JSON.stringify({ contentHeights, frames })),
					contentType: 'application/json'
				});
				expect(frames.length).toBeGreaterThanOrEqual(24);
				const heights = frames.map((frame) => frame.height);
				expect(
					Math.max(...heights) - Math.min(...heights),
					`${engine}: SSR/font/hydration TOC heights ${JSON.stringify([...new Set(heights)])}`
				).toBeLessThan(1);
				for (const frame of frames) {
					expect(frame.sameNode).toBe(true);
					expect(frame.width).toBeGreaterThanOrEqual(194);
					expect(frame.display).not.toBe('none');
					expect(frame.visibility).toBe('visible');
				}
			} finally {
				clearTimeout(fontDeadline);
				releaseFonts();
				releaseScripts();
				await browser.close();
			}
		});
	}
});

test('article TOC preserves native toggling and vertical scrolling in short and enlarged viewports', async ({
	baseURL
}) => {
	test.setTimeout(90_000);
	for (const [engine, browserType] of Object.entries({ chromium, firefox, webkit })) {
		await test.step(engine, async () => {
			const browser = await browserType.launch();
			try {
				const page = await browser.newPage({ baseURL, viewport: { width: 1920, height: 1000 } });
				await page.route('**/*', (route) =>
					['GET', 'HEAD'].includes(route.request().method())
						? route.continue()
						: route.fulfill({ status: 204 })
				);
				await page.goto(articlePath);
				const panel = page.locator('.toc-details');
				const summary = panel.locator('summary');
				const expanded = (await panel.boundingBox())!.height;
				await summary.press('Enter');
				await expect(panel).not.toHaveAttribute('open');
				await expect(panel.locator('nav')).toBeHidden();
				expect((await panel.boundingBox())!.height).toBeLessThan(expanded);
				await summary.press('Space');
				await expect(panel).toHaveAttribute('open');
				expect(Math.abs((await panel.boundingBox())!.height - expanded)).toBeLessThan(1);
				await page.setViewportSize({ width: 1920, height: 320 });
				for (const enlargement of ['100%', '200%']) {
					await page.evaluate((size) => {
						document.documentElement.style.fontSize = size;
						window.scrollTo({ top: 600, behavior: 'instant' });
					}, enlargement);
					const geometry = await panel.evaluate(async (element) => {
						await new Promise(requestAnimationFrame);
						await new Promise(requestAnimationFrame);
						const panel = element as HTMLElement;
						const nav = panel.querySelector<HTMLElement>('nav')!;
						panel.scrollTop = panel.scrollHeight;
						nav.scrollTop = nav.scrollHeight;
						const rect = panel.getBoundingClientRect();
						const navRect = nav.getBoundingClientRect();
						const style = getComputedStyle(nav);
						return {
							top: rect.top,
							bottom: rect.bottom,
							navTop: navRect.top,
							navBottom: navRect.bottom,
							lastLinkBottom: nav.querySelector('li:last-child')!.getBoundingClientRect().bottom,
							textSpace:
								nav.clientHeight -
								Number.parseFloat(style.paddingTop) -
								Number.parseFloat(style.paddingBottom)
						};
					});
					expect(geometry.top).toBeGreaterThanOrEqual(0);
					expect(geometry.bottom).toBeLessThanOrEqual(320);
					expect(geometry.navTop).toBeLessThan(geometry.bottom);
					expect(geometry.textSpace).toBeGreaterThan(0);
					expect(geometry.lastLinkBottom).toBeLessThanOrEqual(geometry.navBottom + 1);
				}
				await page.evaluate(() => {
					document.documentElement.style.fontSize = '100%';
				});
				await page.setViewportSize({ width: 1899, height: 1000 });
				await expect(panel).toBeHidden();
				await page.setViewportSize({ width: 1900, height: 1000 });
				await expect(panel).toBeVisible();
			} finally {
				await browser.close();
			}
		});
	}
});
