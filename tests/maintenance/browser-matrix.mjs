import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, firefox, webkit, expect } from '@playwright/test';
const origin = process.env.MAINTENANCE_PREVIEW_URL || 'http://127.0.0.1:4195';
const dir = 'docs/reviews/maintenance-waitlist';
await mkdir(dir, { recursive: true });
const results = [];
for (const [name, type] of Object.entries({ chromium, firefox, webkit })) {
	const browser = await type.launch();
	try {
		const page = await browser.newPage();
		const errors = [];
		page.on('pageerror', (e) => errors.push(e.message));
		page.on('requestfailed', (r) => errors.push(`${r.url()}: ${r.failure()?.errorText}`));
		page.on('console', (m) => {
			if (m.type() === 'error') errors.push(m.text());
		});
		await page.goto(`${origin}/maintenance/index.html`);
		await expect(page.locator('#market-chart canvas').first()).toBeVisible();
		await page.evaluate(() => document.fonts.ready);
		for (const width of [320, 375, 768, 1440]) {
			await page.setViewportSize({ width, height: 1000 });
			const overflow = await page.evaluate(
				() => document.documentElement.scrollWidth - document.documentElement.clientWidth
			);
			assert.equal(overflow, 0, `${name} at ${width}px`);
			await expect(page.getByRole('button', { name: 'Pause playback' })).toBeVisible();
			assert.deepEqual(errors, []);
			results.push({
				browser: name,
				width,
				overflow,
				canvas: await page.locator('canvas').count(),
				errors: [...errors]
			});
			if (name === 'chromium' && [375, 1440].includes(width))
				await page.screenshot({ path: `${dir}/${name}-${width}.png`, fullPage: true });
		}
		await page.getByRole('button', { name: 'Pause playback' }).click();
		await expect(page.getByRole('button', { name: 'Play playback' })).toBeVisible();
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.reload();
		await expect(page.getByRole('button', { name: 'Play playback' })).toBeVisible();
		assert.deepEqual(errors, []);
	} finally {
		await browser.close();
	}
}
await writeFile(`${dir}/browser-matrix.json`, JSON.stringify(results, null, 2) + '\n');
console.log(
	'12 browser/viewport cases passed; pause and reduced-motion verified in all three engines.'
);
