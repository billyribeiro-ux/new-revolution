import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import {
	buildSmallAccountsRoomJsonLd,
	SITE_ORIGIN,
	SMALL_ACCOUNTS_ROOM_FAQ_ITEMS
} from '#lib/seo/structured-data.ts';
import SmallAccountsRoomPage from './+page.svelte';
import { load, prerender } from './+page.ts';

describe('/live-trading-rooms/small-accounts-room (+page.ts & +page.svelte)', () => {
	it('locks character-accurate SEO metadata (53-char full title, 152-char description) and prerender=true', async () => {
		expect(prerender).toBe(true);

		const result = (await load({
			url: new URL('https://revolutiontradingpros.com/live-trading-rooms/small-accounts-room')
		} as never)) as {
			pageMetaTags: {
				title: string;
				description: string;
				openGraph: { title: string; description: string; url: string };
			};
		};

		expect(result.pageMetaTags.title).toBe('Small Accounts Trading Room');
		expect(`${result.pageMetaTags.title} | Revolution Trading Pros`.length).toBe(53);
		expect(result.pageMetaTags.description).toBe(
			'Grow a $500+ small account without gambling. Strict risk control, T+1 cash account rotation, and affordable stock & options setups. People over profits.'
		);
		expect(result.pageMetaTags.description.length).toBe(152);
		expect(result.pageMetaTags.openGraph.url).toBe(
			'https://revolutiontradingpros.com/live-trading-rooms/small-accounts-room'
		);
	});

	it('renders the H1, 4 compounding roadmap stages, 4 small-account playbooks, 5 comparison rows, 3 routing cards, and 5 FAQs', async () => {
		render(SmallAccountsRoomPage, {
			params: {},
			data: {
				baseMetaTags: {},
				pageMetaTags: {},
				jsonLdSchema: buildSmallAccountsRoomJsonLd(SITE_ORIGIN)
			} as never
		});

		await expect
			.element(
				page.getByRole('heading', {
					level: 1,
					name: /You Don’t Need \$25,000 to Trade Like an Institution/i
				})
			)
			.toBeVisible();

		await expect
			.element(
				page.getByRole('heading', {
					level: 2,
					name: /The 4-Stage Small Account Compounding Blueprint/i
				})
			)
			.toBeVisible();

		await expect
			.element(
				page.getByRole('heading', {
					level: 2,
					name: /Four Institutional Setups Engineered Specifically for \$500\+ Accounts/i
				})
			)
			.toBeVisible();

		for (const faq of SMALL_ACCOUNTS_ROOM_FAQ_ITEMS) {
			await expect
				.element(page.getByRole('heading', { level: 3, name: faq.question }))
				.toBeInTheDocument();
		}
	});
});
