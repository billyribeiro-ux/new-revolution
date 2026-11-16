import { describe, expect, it } from 'vite-plus/test';
import { render } from 'vitest-browser-svelte';
import '../../../app.css';
import D3HeatmapCalendar from './D3HeatmapCalendar.svelte';

/** Local calendar key, matching the component (not toISOString, which is UTC). */
function key(daysAgo: number): string {
	const d = new Date();
	d.setDate(d.getDate() - daysAgo);
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${d.getFullYear()}-${m}-${day}`;
}

describe('D3HeatmapCalendar', () => {
	it('names the chart after the window and exposes the drawn days as a table', async () => {
		const data = [
			{ date: key(3), value: 1200 },
			{ date: key(2), value: 0 },
			{ date: key(1), value: 7 },
			// Far outside a 4-week window: must not appear in the text alternative.
			{ date: key(200), value: 99 }
		];
		const { container } = await render(D3HeatmapCalendar, { data, weeks: 4 });

		const svg = container.querySelector('svg');
		expect(svg?.getAttribute('aria-label')).toBe('Daily activity heatmap for the last 4 weeks');

		const rows = [...container.querySelectorAll('[data-testid="heatmap-data"] tbody tr')].map(
			(tr) => [...tr.children].map((c) => c.textContent?.trim())
		);
		expect(rows).toEqual([
			[key(3), '1,200'],
			[key(2), '0'],
			[key(1), '7']
		]);
	});

	it('draws one rect per elapsed day plus the five legend swatches', async () => {
		const { container } = await render(D3HeatmapCalendar, {
			data: [{ date: key(1), value: 5 }],
			weeks: 4
		});
		await expect.poll(() => container.querySelectorAll('svg rect').length).toBeGreaterThan(5);
	});
});
