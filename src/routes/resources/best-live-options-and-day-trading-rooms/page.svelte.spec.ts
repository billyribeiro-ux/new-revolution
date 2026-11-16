import { page } from 'vite-plus/test/browser';
import { describe, expect, it } from 'vite-plus/test';
import { render } from 'vitest-browser-svelte';
import '../../../app.css';
import {
	BEST_TRADING_ROOMS_DESCRIPTION,
	buildBestTradingRoomsComparisonJsonLd,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import BestTradingRoomsPage from './+page.svelte';
import { load } from './+page.ts';

describe('/resources/best-live-options-and-day-trading-rooms/+page.svelte', () => {
	it('locks canonical title, 140-158 char description, and Article JSON-LD in +page.ts', () => {
		const loaded = load({
			url: new URL(
				'https://www.revolutiontradingpros.com/resources/best-live-options-and-day-trading-rooms'
			)
		} as Parameters<typeof load>[0]) as {
			pageMetaTags: { title: string; description: string; canonical: string };
		};

		expect(loaded.pageMetaTags.title).toBe('Best Options Trading Rooms 2026');
		expect(loaded.pageMetaTags.description).toBe(BEST_TRADING_ROOMS_DESCRIPTION);
		expect(loaded.pageMetaTags.description.length).toBeGreaterThanOrEqual(140);
		expect(loaded.pageMetaTags.description.length).toBeLessThanOrEqual(158);
		expect(loaded.pageMetaTags.canonical).toBe(
			'https://www.revolutiontradingpros.com/resources/best-live-options-and-day-trading-rooms'
		);
	});

	it('renders 7-room comparison matrix, publisher disclosure, and FAQs', async () => {
		await page.viewport(1280, 900);
		await render(BestTradingRoomsPage, {
			params: {},
			data: {
				baseMetaTags: {},
				pageMetaTags: {},
				jsonLdSchema: buildBestTradingRoomsComparisonJsonLd(SITE_ORIGIN)
			} as never
		});

		await expect
			.element(
				page.getByRole('heading', {
					level: 2,
					name: /7 Live Options & Day Trading Rooms Compared/i
				})
			)
			.toBeInTheDocument();
	});
});
