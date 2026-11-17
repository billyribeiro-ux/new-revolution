import { expect, test } from '@playwright/test';
import { chromium, firefox, webkit } from 'playwright';

test('article full reload restores scroll before delayed hydration and returns SPA ownership to Kit', async ({
	baseURL
}) => {
	test.setTimeout(90_000);
	for (const [engine, browserType] of Object.entries({ chromium, firefox, webkit })) {
		await test.step(engine, async () => {
			const browser = await browserType.launch();
			let holdClientModules = false;
			let releaseClientModules = () => {};
			const clientGate = new Promise<void>((resolve) => {
				releaseClientModules = resolve;
			});
			try {
				const context = await browser.newContext({
					baseURL,
					viewport: { width: 1920, height: 1000 },
					reducedMotion: 'reduce'
				});
				await context.route('**/*', async (route) => {
					if (holdClientModules && route.request().resourceType() === 'script') await clientGate;
					await route.continue();
				});
				const page = await context.newPage();
				await page.goto('/blog/institutional-order-flow-and-gamma-flip-playbook');
				await expect.poll(() => page.evaluate(() => history.scrollRestoration)).toBe('manual');
				await page.evaluate(() => scrollTo({ top: 450, behavior: 'instant' }));
				await expect.poll(() => page.evaluate(() => scrollY)).toBe(450);
				holdClientModules = true;
				// Use the browser reload path: WebKit's protocol Page.reload resets native
				// restoration even for static HTML and would hide the behavior under test.
				await Promise.all([
					page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
					page.evaluate(() => location.reload())
				]);
				await page.locator('.article-cover-img').waitFor();
				const beforeHydration = await page.evaluate(async () => {
					const positions: number[] = [];
					for (let frame = 0; frame < 12; frame++) {
						await new Promise(requestAnimationFrame);
						positions.push(scrollY);
					}
					return positions;
				});
				expect(
					beforeHydration.every((position) => Math.abs(position - 450) <= 1),
					`${engine}: native reload position before client modules: ${JSON.stringify(beforeHydration)}`
				).toBe(true);
				expect(
					await page.evaluate(() => sessionStorage.getItem('rtp:page-reload-scroll:v1'))
				).toBeNull();
				holdClientModules = false;
				releaseClientModules();
				await expect.poll(() => page.evaluate(() => history.scrollRestoration)).toBe('manual');
				await expect.poll(() => page.evaluate(() => scrollY)).toBe(450);
				await page
					.locator('main a[href="/blog"]')
					.first()
					.evaluate((link: HTMLAnchorElement) => link.click());
				await expect(page).toHaveURL(/\/blog$/);
				await expect.poll(() => page.evaluate(() => history.scrollRestoration)).toBe('manual');
				await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
				await page.goBack();
				await expect(page).toHaveURL(/institutional-order-flow-and-gamma-flip-playbook$/);
				await expect.poll(() => page.evaluate(() => history.scrollRestoration)).toBe('manual');
				await expect.poll(() => page.evaluate(() => scrollY)).toBe(450);
				// Full-document back/forward must retain Kit/native restoration as well.
				await page.goto('/blog');
				await page.goBack();
				await expect(page).toHaveURL(/institutional-order-flow-and-gamma-flip-playbook$/);
				await expect.poll(() => page.evaluate(() => history.scrollRestoration)).toBe('manual');
				await expect.poll(() => page.evaluate(() => scrollY)).toBe(450);
				const heading = page.locator('.prose-base h2[id]').first();
				const headingId = await heading.getAttribute('id');
				expect(headingId).toBeTruthy();
				await page.goto('/blog');
				await page.goto(`/blog/institutional-order-flow-and-gamma-flip-playbook#${headingId}`);
				await expect.poll(() => page.evaluate(() => location.hash)).toBe('');
				await expect.poll(() => page.evaluate(() => history.scrollRestoration)).toBe('manual');
				await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
				const targetTop = await heading.evaluate((target) => target.getBoundingClientRect().top);
				expect(targetTop).toBeGreaterThanOrEqual(0);
				expect(targetTop).toBeLessThan(1000);
			} finally {
				releaseClientModules();
				await browser.close();
			}
		});
	}
});

test('article cover reserves its frame through delayed loading and hydration in every engine', async ({
	baseURL
}) => {
	test.setTimeout(90_000);
	for (const [engine, browserType] of Object.entries({ chromium, firefox, webkit })) {
		await test.step(engine, async () => {
			const browser = await browserType.launch();
			let releaseImages = () => {};
			const imageGate = new Promise<void>((resolve) => {
				releaseImages = resolve;
			});
			try {
				const context = await browser.newContext({
					baseURL,
					viewport: { width: 1440, height: 1000 }
				});
				await context.route('**/images/blog/**', async (route) => {
					await imageGate;
					await route.continue();
				});
				const page = await context.newPage();
				const response = await page.goto('/blog/institutional-order-flow-and-gamma-flip-playbook', {
					waitUntil: 'domcontentloaded'
				});
				expect(response?.status()).toBe(200);
				const cover = page.locator('.article-cover-img');
				await expect(cover).toBeVisible();
				await page.evaluate(() => document.fonts.ready);
				const before = await cover.boundingBox();
				expect(before).not.toBeNull();
				expect(before!.width).toBeGreaterThan(1000);
				expect(Math.abs(before!.width / before!.height - 16 / 9)).toBeLessThan(0.005);
				await cover.evaluate((image) => {
					image.setAttribute('data-stability-probe', 'same-node');
				});
				releaseImages();
				await expect
					.poll(() =>
						cover.evaluate(
							(image) =>
								(image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0
						)
					)
					.toBe(true);
				const frames = await cover.evaluate(async (image) => {
					const initial = image;
					const frames: Array<{
						width: number;
						height: number;
						same: boolean;
						opacity: string;
						visibility: string;
					}> = [];
					for (let frame = 0; frame < 45; frame++) {
						await new Promise(requestAnimationFrame);
						const rect = image.getBoundingClientRect();
						const style = getComputedStyle(image);
						frames.push({
							width: rect.width,
							height: rect.height,
							same: document.querySelector('.article-cover-img') === initial,
							opacity: style.opacity,
							visibility: style.visibility
						});
					}
					return frames;
				});
				for (const frame of frames) {
					expect(frame.same).toBe(true);
					expect(frame.opacity).toBe('1');
					expect(frame.visibility).toBe('visible');
					expect(Math.abs(frame.width - before!.width)).toBeLessThan(0.1);
					expect(Math.abs(frame.height - before!.height)).toBeLessThan(0.1);
				}
				await expect(cover).toHaveAttribute('data-stability-probe', 'same-node');
				for (const width of [320, 1535, 1536, 1900, 1920]) {
					await page.setViewportSize({ width, height: 1000 });
					const geometry = await page.evaluate(() => {
						const cover = document.querySelector('.article-cover-figure')!.getBoundingClientRect();
						const header = document.querySelector('.article-header')!.getBoundingClientRect();
						const image = document.querySelector('.article-cover-img')!.getBoundingClientRect();
						return {
							cover: { x: cover.x, width: cover.width },
							header: { x: header.x, width: header.width },
							image: { width: image.width, height: image.height }
						};
					});
					expect(Math.abs(geometry.cover.x - geometry.header.x)).toBeLessThan(1);
					expect(Math.abs(geometry.cover.width - geometry.header.width)).toBeLessThan(1);
					expect(Math.abs(geometry.image.width / geometry.image.height - 16 / 9)).toBeLessThan(
						0.005
					);
				}
			} finally {
				releaseImages();
				await browser.close();
			}
		});
	}
});
