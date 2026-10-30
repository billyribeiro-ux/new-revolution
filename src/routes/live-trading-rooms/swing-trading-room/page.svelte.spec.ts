import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import {
	buildSwingTradingRoomJsonLd,
	SITE_ORIGIN,
	SWING_TRADING_ROOM_FAQ_ITEMS
} from '#lib/seo/structured-data.ts';
import SwingTradingRoomPage from './+page.svelte';
import { load, prerender } from './+page.ts';

describe('/live-trading-rooms/swing-trading-room (+page.ts & +page.svelte)', () => {
	it('locks character-accurate SEO metadata (49-char full title, 144-char description) and prerender=true', async () => {
		expect(prerender).toBe(true);

		const result = (await load({
			url: new URL('https://revolutiontradingpros.com/live-trading-rooms/swing-trading-room')
		} as never)) as {
			pageMetaTags: {
				title: string;
				description: string;
				openGraph: { title: string; description: string; url: string };
			};
		};

		expect(result.pageMetaTags.title).toBe('Live Swing Trading Room');
		expect(`${result.pageMetaTags.title} | Revolution Trading Pros`.length).toBe(49);
		expect(result.pageMetaTags.description).toBe(
			'Stock, ETF, and options swing trading room built for working professionals. Pre-planned entries, profit targets, and stops. People over profits.'
		);
		expect(result.pageMetaTags.description.length).toBe(144);
		expect(result.pageMetaTags.openGraph.url).toBe(
			'https://revolutiontradingpros.com/live-trading-rooms/swing-trading-room'
		);
	});

	it('renders the H1, 4 workflow steps, 4 swing playbooks, 5 comparison rows, 3 routing cards, and 5 FAQs', async () => {
		render(SwingTradingRoomPage, {
			params: {},
			data: {
				baseMetaTags: {},
				pageMetaTags: {},
				jsonLdSchema: buildSwingTradingRoomJsonLd(SITE_ORIGIN)
			} as never
		});

		await expect
			.element(
				page.getByRole('heading', {
					level: 1,
					name: /Capture Institutional Multi-Day Moves Without Quitting Your Career/i
				})
			)
			.toBeVisible();

		await expect
			.element(
				page.getByRole('heading', {
					level: 2,
					name: /The 20-Minute Working Professional Swing Trading Workflow/i
				})
			)
			.toBeVisible();

		await expect
			.element(
				page.getByRole('heading', {
					level: 2,
					name: /Four Institutional Swing Playbooks Forged in Real Market Cycles/i
				})
			)
			.toBeVisible();

		for (const faq of SWING_TRADING_ROOM_FAQ_ITEMS) {
			await expect
				.element(page.getByRole('heading', { level: 3, name: faq.question }))
				.toBeInTheDocument();
		}
	});
});
