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
import { indicatorsCatalog } from '#lib/data/indicators.ts';

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

		// 8 indicator cards in a semantic list; each title link targets the typed detail route
		expect(document.querySelectorAll('ul.catalog-grid > li').length).toBe(8);
		expect(document.querySelectorAll('.indicator-card').length).toBe(8);
		const titleLinks = [...document.querySelectorAll<HTMLAnchorElement>('.indicator-card h3 a')];
		expect(titleLinks.map((a) => a.getAttribute('href'))).toEqual(
			indicatorsCatalog.map((i) => `/store/indicators/${i.slug}`)
		);

		// One lead card; every spec sheet is in the HTML without interaction, only the lead one open
		expect(document.querySelectorAll('.catalog-grid__item.is-featured').length).toBe(1);
		const specs = [
			...document.querySelectorAll<HTMLDetailsElement>('details.indicator-card__specs')
		];
		expect(specs.length).toBe(8);
		expect(specs.filter((d) => d.open).length).toBe(1);
		expect(document.body.textContent).toContain('Supported timeframes');

		// Filter: accessible pressed state + live status; "Order Flow & Reversals" -> 3 cards
		const orderFlowBtn = page.getByRole('button', { name: 'Order Flow & Reversals' });
		await orderFlowBtn.click();
		await expect.element(orderFlowBtn).toHaveAttribute('aria-pressed', 'true');
		expect(document.querySelectorAll('.indicator-card').length).toBe(3);
		await expect.element(page.getByRole('status')).toHaveTextContent('Showing 3 of 8 indicators');

		// Click "See All Indicators (8) →" button to reset to all 8 cards
		const seeAllBtn = page.getByRole('button', { name: 'See All Indicators (8) →' });
		await seeAllBtn.click();
		expect(document.querySelectorAll('.indicator-card').length).toBe(8);

		// Native disclosure opens on demand
		const closed = document.querySelector<HTMLDetailsElement>(
			'details.indicator-card__specs:not([open])'
		);
		(closed?.querySelector('summary') as HTMLElement).click();
		expect(closed?.open).toBe(true);

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
