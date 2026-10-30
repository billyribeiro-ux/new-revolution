import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import '../../../app.css';
import Page from './+page.svelte';
import { load } from './+page.ts';
import {
	SCANNERS_STORE_FAQ_ITEMS,
	SITE_ORIGIN,
	buildScannersStoreJsonLd
} from '#lib/seo/structured-data.ts';

function getPageData() {
	return load({
		url: new URL('https://revolutiontradingpros.com/store/scanners')
	} as Parameters<typeof load>[0]) as Record<string, unknown>;
}

describe('/store/scanners/+page.svelte', () => {
	it('locks title tag to 29 chars before suffix (55 total) and meta description to 148 chars', () => {
		const data = getPageData() as {
			pageMetaTags: {
				title: string;
				description: string;
				canonical: string;
				openGraph: { title: string; type: string };
			};
		};

		expect(data.pageMetaTags.title).toBe('Live Stock & Options Scanners');
		expect(data.pageMetaTags.title.length).toBe(29);
		expect(data.pageMetaTags.openGraph.title).toBe(
			'Live Stock & Options Scanners | Revolution Trading Pros'
		);
		expect(data.pageMetaTags.openGraph.title.length).toBe(55);
		expect(data.pageMetaTags.openGraph.type).toBe('website');
		expect(data.pageMetaTags.description).toBe(
			'Real-time, 100% non-repainting stock, ETF, and options scanners. Spot institutional order flow, multi-timeframe squeezes, and liquidity sweeps live.'
		);
		expect(data.pageMetaTags.description.length).toBe(148);
		expect(data.pageMetaTags.canonical).toBe('https://revolutiontradingpros.com/store/scanners');
	});

	it('enforces a single H1, strict H1 -> H2 -> H3 hierarchy (zero H4s), and 4 semantic H3 FAQ summaries', async () => {
		render(Page, {
			data: {
				pageMetaTags: {},
				jsonLdSchema: buildScannersStoreJsonLd(SITE_ORIGIN)
			} as never
		});

		const h1s = document.querySelectorAll('h1');
		expect(h1s.length).toBe(1);
		expect(h1s[0].querySelector('.seo-kicker')?.textContent?.trim()).toContain(
			'Live Stock, ETF & Options Trading Scanners • Institutional Order Flow & Squeeze Radar'
		);
		expect(h1s[0].textContent?.replace(/\s+/g, ' ').trim()).toContain(
			'Stop Flipping Through 500 Charts by Hand. Let Institutional Order Flow Come to You.'
		);

		expect(document.querySelectorAll('h4').length).toBe(0);

		const faqHeadings = Array.from(
			document.querySelectorAll('details.faq-item summary h3.faq-item__heading')
		).map((el) => el.textContent?.trim());
		expect(faqHeadings).toEqual(SCANNERS_STORE_FAQ_ITEMS.map((item) => item.question));
	});

	it('switches the interactive Live Radar Terminal across all 3 radar engines and filters the 8-scanner catalog', async () => {
		render(Page, {
			data: {
				pageMetaTags: {},
				jsonLdSchema: buildScannersStoreJsonLd(SITE_ORIGIN)
			} as never
		});

		// Default radar tab: 1. 18-TF Squeeze
		await expect
			.element(page.getByText('18-Timeframe Volatility Compression Radar'))
			.toBeInTheDocument();

		// Switch to 2. Stop-Hunt Sweep
		const sweepTab = page.getByRole('tab', { name: '2. Stop-Hunt Sweep' });
		await sweepTab.click();
		await expect
			.element(page.getByText('Institutional Stop-Hunt & Liquidity Sweep Radar'))
			.toBeInTheDocument();

		// Switch to 3. +600% OXY Scan
		const oxyTab = page.getByRole('tab', { name: '3. +600% OXY Scan' });
		await oxyTab.click();
		await expect
			.element(page.getByText('Contrarian Distribution & Put Options Radar (The +600% OXY Engine)'))
			.toBeInTheDocument();

		// Default catalog: 8 scanners, 3 workflow cards, 5 comparison rows, 5 room CTA cards
		expect(document.querySelectorAll('.scanner-card').length).toBe(8);
		expect(document.querySelectorAll('.workflow-card').length).toBe(3);
		expect(document.querySelectorAll('.comparison-table tbody tr').length).toBe(5);
		expect(document.querySelectorAll('.room-cta-card').length).toBe(5);

		// Filter by "Options & SPX Gamma" (2 scanners)
		const gammaFilter = page.getByRole('tab', { name: 'Options & SPX Gamma' });
		await gammaFilter.click();
		expect(document.querySelectorAll('.scanner-card').length).toBe(2);

		// Reset with "See All Scanners (8) →" button
		const seeAllBtn = page.getByRole('button', { name: /See All Scanners \(8\) →/i });
		await seeAllBtn.click();
		expect(document.querySelectorAll('.scanner-card').length).toBe(8);
	});
});
