import { expect, test } from '@playwright/test';

for (const width of [320, 1440, 1536, 2440, 2800]) {
	test(`stock index sections use one shared gutter at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 1000 });
		await page.goto('/resources/stock-indexes-list');
		const geometry = await page.evaluate(() => {
			const anchor = document.querySelector<HTMLElement>('.nav-shell .container')!;
			const rect = anchor.getBoundingClientRect();
			const left = rect.left + Number.parseFloat(getComputedStyle(anchor).paddingLeft);
			return {
				left,
				sections: [
					...document.querySelectorAll<HTMLElement>(
						'.indexes-page .section > .container, .indexes-page .cta-section > .container'
					)
				].map((node) => ({
					left:
						node.getBoundingClientRect().left +
						Number.parseFloat(getComputedStyle(node).paddingLeft),
					width: node.getBoundingClientRect().width
				}))
			};
		});
		expect(geometry.sections.length).toBeGreaterThan(2);
		for (const section of geometry.sections)
			expect(Math.abs(section.left - geometry.left)).toBeLessThanOrEqual(1);
	});
}
