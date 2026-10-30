import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import {
	INDICATORS_STORE_FAQ_ITEMS,
	buildIndicatorsStoreJsonLd,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import { load } from './+page.ts';
import IndicatorsStorePage from './+page.svelte';

describe('/store/indicators page', () => {
	it('returns character-locked SEO metadata (51-char title, 151-char description) and JSON-LD from load()', () => {
		const result = load({
			url: new URL('https://revolutiontradingpros.com/store/indicators')
		} as Parameters<typeof load>[0]) as Record<string, unknown>;

		const pageMetaTags = result.pageMetaTags as {
			title: string;
			description: string;
			openGraph: { title: string; description: string; url: string };
		};

		expect(pageMetaTags.title).toBe('Custom Trading Indicators');
		expect(pageMetaTags.title.length).toBe(25);
		expect(pageMetaTags.openGraph.title).toBe(
			'Custom Trading Indicators | Revolution Trading Pros'
		);
		expect(pageMetaTags.openGraph.title.length).toBe(51);
		expect(pageMetaTags.description).toBe(
			'100% non-repainting stock, ETF, and options trading indicators for ThinkorSwim and TradingView. Spot institutional order flow and liquidity. Zero hype.'
		);
		expect(pageMetaTags.description.length).toBe(151);
		expect(pageMetaTags.openGraph.url).toBe('https://revolutiontradingpros.com/store/indicators');
	});

	it('renders the H1, 8 indicator cards, interactive category filter tabs, expandable technical specs, 5 comparison rows, 3 proof cards, and 4 FAQs', async () => {
		render(IndicatorsStorePage, {
			params: {},
			data: {
				pageMetaTags: {},
				jsonLdSchema: buildIndicatorsStoreJsonLd(SITE_ORIGIN)
			} as never
		});

		const h1 = page.getByRole('heading', {
			level: 1,
			name: /No Fake "Holy Grail" Arrows\. Just 100% Non-Repainting Institutional Telemetry\./i
		});
		await expect.element(h1).toBeInTheDocument();

		await expect.element(page.getByText('Our 4-Point Indicator Guarantee')).toBeInTheDocument();

		// 8 indicator cards initially rendered
		expect(document.querySelectorAll('.indicator-card').length).toBe(8);

		// Filter by "Order Flow & Reversals" -> 3 cards
		const orderFlowTab = page.getByRole('tab', { name: 'Order Flow & Reversals' });
		await orderFlowTab.click();
		expect(document.querySelectorAll('.indicator-card').length).toBe(3);

		// Click "See All Indicators (8) →" button to reset to all 8 cards
		const seeAllBtn = page.getByRole('button', { name: 'See All Indicators (8) →' });
		await seeAllBtn.click();
		expect(document.querySelectorAll('.indicator-card').length).toBe(8);

		// Expand technical specs on the first card
		expect(document.querySelectorAll('.indicator-card__expanded').length).toBe(0);
		const inspectButtons = document.querySelectorAll<HTMLButtonElement>(
			'.indicator-card__spec-btn'
		);
		inspectButtons[0].click();
		await expect.element(page.getByText('Supported Timeframes:')).toBeInTheDocument();

		// 5 comparison rows, 3 proof cards, 5 room CTA cards
		expect(document.querySelectorAll('.comparison-table tbody tr').length).toBe(5);
		expect(document.querySelectorAll('.proof-card').length).toBe(3);
		expect(document.querySelectorAll('.room-cta-card').length).toBe(5);

		// 4 FAQ items
		for (const faq of INDICATORS_STORE_FAQ_ITEMS) {
			await expect.element(page.getByText(faq.question)).toBeInTheDocument();
		}
	});
});
