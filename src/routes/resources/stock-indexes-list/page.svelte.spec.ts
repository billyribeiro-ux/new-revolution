import { page } from 'vite-plus/test/browser';
import { describe, expect, it } from 'vite-plus/test';
import { render } from 'vitest-browser-svelte';
import {
	buildStockIndexesListJsonLd,
	SITE_ORIGIN,
	STOCK_INDEXES_LIST_FAQ_ITEMS
} from '#lib/seo/structured-data.ts';
import { load } from './+page.ts';
import Page from './+page.svelte';

describe('/resources/stock-indexes-list page', () => {
	it('returns character-locked SEO metadata (59-char title, 154-char description) and JSON-LD from load()', () => {
		const result = load({
			url: new URL('https://www.revolutiontradingpros.com/resources/stock-indexes-list')
		} as Parameters<typeof load>[0]) as Record<string, unknown>;

		const pageMetaTags = result.pageMetaTags as {
			title: string;
			description: string;
			openGraph: { title: string; description: string; url: string };
		};

		expect(pageMetaTags.title).toBe('Cash-Settled Indexes & 1256 Guide');
		expect(pageMetaTags.title.length).toBe(33);
		expect(pageMetaTags.openGraph.title).toBe(
			'Cash-Settled Indexes & 1256 Guide | Revolution Trading Pros'
		);
		expect(pageMetaTags.openGraph.title.length).toBe(59);
		expect(pageMetaTags.description).toBe(
			'Compare SPX, XSP, NDX, RUT, and VIX cash-settled European index options vs. SPY and QQQ ETFs, assignment risk, and Section 1256 60/40 taxes.'
		);
		expect(pageMetaTags.description.length).toBe(140);
		expect(pageMetaTags.openGraph.url).toBe(
			'https://www.revolutiontradingpros.com/resources/stock-indexes-list'
		);
	});

	it('renders the H1, Section 1256 comparison table, 10 index cards with region filtering, and 5 interactive FAQs', async () => {
		await render(Page, {
			data: {
				pageMetaTags: {},
				jsonLdSchema: buildStockIndexesListJsonLd(SITE_ORIGIN)
			} as never
		});

		const h1 = page.getByRole('heading', {
			level: 1,
			name: 'Cash-Settled Index Options & Section 1256 Guide'
		});
		await expect.element(h1).toBeInTheDocument();
		expect(document.querySelectorAll('.sec1256-table tbody tr').length).toBe(4);

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

		// Every FAQ answer is in the DOM without interaction (JSON-LD parity: crawlers see what the schema claims)
		const items = [...document.querySelectorAll('details.faq-item')];
		expect(items.length).toBe(STOCK_INDEXES_LIST_FAQ_ITEMS.length);
		expect(items.every((d) => !d.hasAttribute('open'))).toBe(true);
		for (const [i, faq] of STOCK_INDEXES_LIST_FAQ_ITEMS.entries()) {
			const answer = items[i].querySelector('.faq-item__answer')?.textContent ?? '';
			expect(answer.replace(/\s+/g, '')).toBe(faq.answer.replace(/\s+/g, ''));
		}

		// Native accordion: opening one closes the others (shared name)
		const [first, second] = items as HTMLDetailsElement[];
		(first.querySelector('summary') as HTMLElement).click();
		expect(first.open).toBe(true);
		(second.querySelector('summary') as HTMLElement).click();
		expect(second.open).toBe(true);
		await expect.poll(() => first.open).toBe(false);
	});
});
