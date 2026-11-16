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

interface NavGeometry {
	headerHeight: number;
	brandTop: number;
	brandHeight: number;
}

declare global {
	interface Window {
		__navHydrationFrames: NavGeometry[];
		__navHydrationShifts: Array<{ value: number; sources: string[] }>;
		__stopNavHydrationSampling: boolean;
	}
}

test('keeps brand and header geometry stable while enlarged-text navigation hydrates', async ({
	page
}) => {
	await page.addInitScript(() => {
		window.__navHydrationFrames = [];
		window.__navHydrationShifts = [];
		window.__stopNavHydrationSampling = false;
		if (PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
			new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					const shift = entry as PerformanceEntry & {
						value: number;
						hadRecentInput: boolean;
						sources?: Array<{ node?: Node }>;
					};
					const navigationSources = (shift.sources ?? [])
						.map(({ node }) => (node instanceof Element ? node : node?.parentElement))
						.filter((node) => node?.closest('.nav-shell'))
						.map((node) => node?.className ?? '');
					if (!shift.hadRecentInput && navigationSources.length) {
						window.__navHydrationShifts.push({ value: shift.value, sources: navigationSources });
					}
				}
			}).observe({ type: 'layout-shift', buffered: true });
		}

		function sampleNavigation() {
			const header = document.querySelector('.nav-shell');
			const brand = header?.querySelector('.brand');
			if (header && brand) {
				const headerRect = header.getBoundingClientRect();
				const brandRect = brand.getBoundingClientRect();
				window.__navHydrationFrames.push({
					headerHeight: headerRect.height,
					brandTop: brandRect.top - headerRect.top,
					brandHeight: brandRect.height
				});
			}
			if (!window.__stopNavHydrationSampling) requestAnimationFrame(sampleNavigation);
		}
		requestAnimationFrame(sampleNavigation);
	});

	// Model enlarged browser text before first paint. Changing text size after load would
	// test an intentional user resize instead of the server-to-hydrated layout transition.
	await page.route('**/contact', async (route) => {
		const response = await route.fetch();
		await route.fulfill({
			response,
			body: (await response.text()).replace('<html', '<html style="font-size:32px"')
		});
	});
	await page.route('**/*.js', async (route) => {
		// Give the server-rendered layout time to paint before its event handlers mount.
		await new Promise((resolve) => setTimeout(resolve, 250));
		await route.continue();
	});

	for (const width of [1024, 1280, 1440, 1920]) {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/contact');
		await expect(page.locator('.nav-shell')).toHaveClass(/is-compact/);
		await expect(page.locator('.nav-shell')).toHaveAttribute('style', /--navigation-menu-height/);
		await page.evaluate(async () => {
			await document.fonts.ready;
			await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
			await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
			window.__stopNavHydrationSampling = true;
		});
		const measurements = await page.evaluate(() => ({
			frames: window.__navHydrationFrames,
			shifts: window.__navHydrationShifts
		}));
		expect(measurements.frames.length).toBeGreaterThan(2);
		for (const key of ['headerHeight', 'brandTop', 'brandHeight'] as const) {
			const values = measurements.frames.map((frame) => frame[key]);
			expect(Math.max(...values) - Math.min(...values), `${width}px ${key}`).toBeLessThanOrEqual(1);
		}
		expect(measurements.shifts, `${width}px navbar-attributed layout shifts`).toEqual([]);
	}
});
