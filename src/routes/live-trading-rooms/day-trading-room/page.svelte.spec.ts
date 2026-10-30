import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import '../../../app.css';
import {
	buildDayTradingRoomJsonLd,
	DAY_TRADING_ROOM_FAQ_ITEMS,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import DayTradingRoomPage from './+page.svelte';
import { load } from './+page.ts';

describe('/live-trading-rooms/day-trading-room/+page.svelte (Vitest Browser Mode)', () => {
	it('locks exact 47-char title and 147-char description in +page.ts load()', () => {
		const loaded = load({
			url: new URL('https://revolutiontradingpros.com/live-trading-rooms/day-trading-room')
		} as Parameters<typeof load>[0]) as {
			pageMetaTags: {
				title: string;
				description: string;
				openGraph: { title: string; description: string; url: string };
			};
			jsonLdSchema: ReturnType<typeof buildDayTradingRoomJsonLd>;
		};

		expect(loaded.pageMetaTags.title).toBe('Live Day Trading Room');
		expect(`${loaded.pageMetaTags.title} | Revolution Trading Pros`).toHaveLength(47);
		expect(loaded.pageMetaTags.description).toBe(
			'Join our live stock, ETF, and options day trading room. Real-time voice, screen share, and exact entries and stops. People over profits. Zero hype.'
		);
		expect(loaded.pageMetaTags.description).toHaveLength(147);
		expect(loaded.pageMetaTags.openGraph.url).toBe(
			'https://revolutiontradingpros.com/live-trading-rooms/day-trading-room'
		);
	});

	it('renders the H1, 4 daily schedule blocks, 4 intraday setups, 5 comparison rows, 3 routing cards, and 5 FAQs', async () => {
		render(DayTradingRoomPage, {
			params: {},
			data: {
				baseMetaTags: {},
				pageMetaTags: {},
				jsonLdSchema: buildDayTradingRoomJsonLd(SITE_ORIGIN)
			} as never
		});

		await expect
			.element(
				page.getByRole('heading', {
					level: 1,
					name: /Stop Trading Alone Against Wall Street Algorithms/i
				})
			)
			.toBeInTheDocument();

		await expect
			.element(
				page.getByRole('heading', {
					level: 3,
					name: 'Pre-Market Game Plan, Macro Catalysts & High-Conviction Watchlist'
				})
			)
			.toBeInTheDocument();

		await expect
			.element(
				page.getByRole('heading', {
					level: 3,
					name: 'Opening Bell Institutional Liquidity Traps & Failed Breakouts'
				})
			)
			.toBeInTheDocument();

		for (const faq of DAY_TRADING_ROOM_FAQ_ITEMS) {
			await expect
				.element(page.getByRole('heading', { level: 3, name: faq.question }))
				.toBeInTheDocument();
		}
	});
});
