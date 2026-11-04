import { describe, expect, it } from 'vite-plus/test';
import { render } from 'vitest-browser-svelte';
import SparkBar from './SparkBar.svelte';

function bars(): { y: number; height: number }[] {
	return [...document.querySelectorAll('svg.spark-bar rect')].map((r) => ({
		y: Number(r.getAttribute('y')),
		height: Number(r.getAttribute('height'))
	}));
}

describe('SparkBar', () => {
	it('draws an all-zero series as hairlines on the baseline, not as tall bars', async () => {
		await render(SparkBar, { data: [0, 0, 0, 0, 0], height: 80 });
		await expect.poll(() => bars().length).toBe(5);
		for (const bar of bars()) {
			expect(bar.height).toBe(1);
			// Baseline: bottom padding is 2, so a 1px bar ends at height - 2.
			expect(bar.y + bar.height).toBe(78);
		}
	});

	it('scales real values against the series maximum', async () => {
		await render(SparkBar, { data: [0, 5, 10], height: 80 });
		await expect.poll(() => bars().length).toBe(3);
		const [zero, half, full] = bars();
		expect(zero!.height).toBe(1);
		expect(full!.height).toBeGreaterThan(half!.height);
		expect(half!.height).toBeCloseTo(full!.height / 2, 0);
	});
});
