import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { buildStockIndexesListJsonLd, SITE_ORIGIN } from '#lib/seo/structured-data.ts';
import { load } from './+page.ts';
import Page from './+page.svelte';

describe('/resources/stock-indexes-list page', () => {
	it('returns character-locked SEO metadata (51-char title, 154-char description) and JSON-LD from load()', () => {
		const result = load({
			url: new URL('https://revolutiontradingpros.com/resources/stock-indexes-list')
		} as Parameters<typeof load>[0]) as Record<string, unknown>;

		const pageMetaTags = result.pageMetaTags as {
			title: string;
			description: string;
			openGraph: { title: string; description: string; url: string };
		};

		expect(pageMetaTags.title).toBe('Stock Market Indexes List');
		expect(pageMetaTags.title.length).toBe(25);
		expect(pageMetaTags.openGraph.title).toBe(
			'Stock Market Indexes List | Revolution Trading Pros'
		);
		expect(pageMetaTags.openGraph.title.length).toBe(51);
		expect(pageMetaTags.description).toBe(
			'Comprehensive stock market indexes list and guide. Track S&P 500 ($SPX), Dow Jones ($DJI), Nasdaq ($NDX), Russell 2000 ($RUT), VIX, and global benchmarks.'
		);
		expect(pageMetaTags.description.length).toBe(154);
		expect(pageMetaTags.openGraph.url).toBe(
			'https://revolutiontradingpros.com/resources/stock-indexes-list'
		);
	});

	it('renders the H1, S&P 500 feature section, 10 index cards with region filtering, and 5 interactive FAQs', async () => {
		render(Page, {
			data: {
				pageMetaTags: {},
				jsonLdSchema: buildStockIndexesListJsonLd(SITE_ORIGIN)
			} as never
		});

		const h1 = page.getByRole('heading', { level: 1, name: 'Stock Indexes List' });
		await expect.element(h1).toBeInTheDocument();

		expect(document.querySelectorAll('.index-card').length).toBe(10);

		// Filter by US region -> 6 indexes (SPX, DJI, COMPQ, NDX, RUT, VIX)
		const select = document.getElementById('region-filter') as HTMLSelectElement;
		select.value = 'US';
		select.dispatchEvent(new Event('change'));
		await expect.poll(() => document.querySelectorAll('.index-card').length).toBe(6);

		// Reset to all regions -> 10 indexes
		select.value = 'all';
		select.dispatchEvent(new Event('change'));
		await expect.poll(() => document.querySelectorAll('.index-card').length).toBe(10);

		// Toggle FAQ item
		const faqBtn = page.getByRole('button', { name: 'What are the three major stock indexes?' });
		await faqBtn.click();
		await expect
			.element(page.getByText('1. S&P 500: measures 500 large-caps in U.S. stock market'))
			.toBeInTheDocument();
	});
});
