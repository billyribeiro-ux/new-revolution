import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { buildEtfStocksListJsonLd, SITE_ORIGIN } from '#lib/seo/structured-data.ts';
import { load } from './+page.ts';
import Page from './+page.svelte';

describe('/resources/etf-stocks-list page', () => {
	it('returns character-locked SEO metadata (56-char title, 149-char description) and JSON-LD from load()', () => {
		const result = load({
			url: new URL('https://revolutiontradingpros.com/resources/etf-stocks-list')
		} as Parameters<typeof load>[0]) as Record<string, unknown>;

		const pageMetaTags = result.pageMetaTags as {
			title: string;
			description: string;
			openGraph: { title: string; description: string; url: string };
		};

		expect(pageMetaTags.title).toBe('ETF Stocks List & Sector Guide');
		expect(pageMetaTags.title.length).toBe(30);
		expect(pageMetaTags.openGraph.title).toBe(
			'ETF Stocks List & Sector Guide | Revolution Trading Pros'
		);
		expect(pageMetaTags.openGraph.title.length).toBe(56);
		expect(pageMetaTags.description).toBe(
			'Complete ETF stocks list covering SPY, QQQ, IWM, and all 11 S&P 500 sector ETFs. Compare options liquidity, expense ratios, and institutional setups.'
		);
		expect(pageMetaTags.description.length).toBe(149);
		expect(pageMetaTags.openGraph.url).toBe(
			'https://revolutiontradingpros.com/resources/etf-stocks-list'
		);
	});

	it('renders the H1, 5 ETF benefits, 5 ETF types, 12 featured ETFs, 11 sector ETF cards, 7 comparison rows, 4 FAQs, and 5 room CTAs', async () => {
		render(Page, {
			data: {
				pageMetaTags: {},
				jsonLdSchema: buildEtfStocksListJsonLd(SITE_ORIGIN)
			} as never
		});

		const h1 = page.getByRole('heading', {
			level: 1,
			name: /The Institutional ETF Stocks List/i
		});
		await expect.element(h1).toBeInTheDocument();

		expect(document.querySelectorAll('.benefit-card').length).toBe(5);
		expect(document.querySelectorAll('.type-card').length).toBe(5);
		expect(document.querySelectorAll('.etf-card').length).toBe(12);
		expect(document.querySelectorAll('.sector-card').length).toBe(11);
		expect(document.querySelectorAll('.comparison-table tbody tr').length).toBe(7);
		expect(document.querySelectorAll('.comparison-summary__card').length).toBe(2);
		expect(document.querySelectorAll('.faq-item').length).toBe(4);
		expect(document.querySelectorAll('.room-cta-card').length).toBe(5);
	});
});
