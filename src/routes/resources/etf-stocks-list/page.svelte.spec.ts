import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { buildEtfStocksListJsonLd, SITE_ORIGIN } from '#lib/seo/structured-data.ts';
import { load } from './+page.ts';
import Page from './+page.svelte';

describe('/resources/etf-stocks-list page', () => {
	it('returns character-locked SEO metadata (55-char title, 144-char description) and JSON-LD from load()', () => {
		const result = load({
			url: new URL('https://revolutiontradingpros.com/resources/etf-stocks-list')
		} as Parameters<typeof load>[0]) as Record<string, unknown>;

		const pageMetaTags = result.pageMetaTags as {
			title: string;
			description: string;
			openGraph: { title: string; description: string; url: string };
		};

		expect(pageMetaTags.title).toBe('ETF Stock List & Sector Guide');
		expect(pageMetaTags.title.length).toBe(29);
		expect(pageMetaTags.openGraph.title).toBe(
			'ETF Stock List & Sector Guide | Revolution Trading Pros'
		);
		expect(pageMetaTags.openGraph.title.length).toBe(55);
		expect(pageMetaTags.description).toBe(
			'Comprehensive ETF stock list and sector guide. Explore top liquid ETFs (SPY, QQQ, IWM, XLK, XLF), benefits, and ETF vs. mutual fund comparisons.'
		);
		expect(pageMetaTags.description.length).toBe(144);
		expect(pageMetaTags.openGraph.url).toBe(
			'https://revolutiontradingpros.com/resources/etf-stocks-list'
		);
	});

	it('renders the H1, 5 ETF benefits, 5 ETF types, 12 featured ETFs, 9 sector ETF cards, and 7 comparison rows', async () => {
		render(Page, {
			data: {
				pageMetaTags: {},
				jsonLdSchema: buildEtfStocksListJsonLd(SITE_ORIGIN)
			} as never
		});

		const h1 = page.getByRole('heading', { level: 1, name: 'ETF Stock List' });
		await expect.element(h1).toBeInTheDocument();

		expect(document.querySelectorAll('.benefit-card').length).toBe(5);
		expect(document.querySelectorAll('.type-card').length).toBe(5);
		expect(document.querySelectorAll('.etf-card').length).toBe(12);
		expect(document.querySelectorAll('.sector-card').length).toBe(9);
		expect(document.querySelectorAll('.comparison-table tbody tr').length).toBe(7);
		expect(document.querySelectorAll('.comparison-summary__item').length).toBe(2);
	});
});

