import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import {
	SINGLE_SCANNER_FAQ_ITEMS,
	buildSingleScannerJsonLd,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import { entries, load } from './+page.ts';
import SingleScannerPage from './+page.svelte';

describe('/store/scanners/[slug] page', () => {
	it('returns character-locked SEO metadata (53-char title, 149-char description) and JSON-LD from load()', () => {
		const slugList = entries();
		expect(slugList).toContainEqual({ slug: 'high-octane-scanner' });
		expect(slugList).toContainEqual({ slug: 'move-prior-to-the-move-radar' });

		const result = load({
			url: new URL('https://revolutiontradingpros.com/store/scanners/high-octane-scanner'),
			params: { slug: 'high-octane-scanner' }
		} as Parameters<typeof load>[0]) as Record<string, unknown>;

		const pageMetaTags = result.pageMetaTags as {
			title: string;
			description: string;
			openGraph: { title: string; description: string; url: string };
		};

		expect(pageMetaTags.title).toBe('High Octane Options Scanner');
		expect(pageMetaTags.title.length).toBe(27);
		expect(pageMetaTags.openGraph.title).toBe(
			'High Octane Options Scanner | Revolution Trading Pros'
		);
		expect(pageMetaTags.openGraph.title.length).toBe(53);
		expect(pageMetaTags.description).toBe(
			'Find explosive stock, ETF, and options setups in real time with the 100% non-repainting High Octane Scanner for ThinkorSwim & TradingView. Zero hype.'
		);
		expect(pageMetaTags.description.length).toBe(149);
		expect(pageMetaTags.openGraph.url).toBe(
			'https://revolutiontradingpros.com/store/scanners/high-octane-scanner'
		);
	});

	it('renders the H1, interactive cadence toggle, 3-mode terminal preview, 6 feature cards, 3 suitability cards, 5 comparison rows, 2 packages, 4 reviews, 5 FAQs, and 5 room CTA cards', async () => {
		render(SingleScannerPage, {
			params: { slug: 'high-octane-scanner' },
			data: {
				pageMetaTags: {},
				jsonLdSchema: buildSingleScannerJsonLd(SITE_ORIGIN, 'high-octane-scanner')
			} as never
		});

		const h1s = document.querySelectorAll('h1');
		expect(h1s.length).toBe(1);
		expect(h1s[0].textContent?.replace(/\s+/g, ' ').trim()).toContain(
			'High Octane Scanner™: Spot High-Probability Institutional Options & Equity Setups in Milliseconds.'
		);
		expect(document.querySelectorAll('h4').length).toBe(0);

		// Interactive Cadence Toggle
		const monthlyTab = page.getByRole('tab', { name: 'Monthly Access Cadence' });
		await monthlyTab.click();
		await expect.element(monthlyTab).toHaveAttribute('aria-selected', 'true');
		await expect.element(page.getByText(/Flexible Monthly Access Selected:/i)).toBeInTheDocument();

		const annualTab = page.getByRole('tab', { name: /Annual Access Cadence/i });
		await annualTab.click();
		await expect.element(annualTab).toHaveAttribute('aria-selected', 'true');

		// Interactive 3-mode terminal switching
		const modeSqueeze = page.getByRole('tab', { name: '2. 18-TF Squeeze' });
		await modeSqueeze.click();
		await expect.element(modeSqueeze).toHaveAttribute('aria-selected', 'true');
		await expect
			.element(page.getByText('High Octane Mode 02 // 18-Timeframe Synchronized Compression'))
			.toBeInTheDocument();

		const modeSmall = page.getByRole('tab', { name: '3. $500+ Account Scan' });
		await modeSmall.click();
		await expect.element(modeSmall).toHaveAttribute('aria-selected', 'true');
		await expect
			.element(
				page.getByText('High Octane Mode 03 // $500+ Small Account Affordable Contract Filter')
			)
			.toBeInTheDocument();

		// Core sections & counts
		expect(document.querySelectorAll('.feature-card').length).toBe(6);
		expect(document.querySelectorAll('.feature-card--bonus').length).toBe(1);
		expect(document.querySelectorAll('.suitability-card').length).toBe(3);
		expect(document.querySelectorAll('.comparison-table tbody tr').length).toBe(5);
		expect(document.querySelectorAll('.package-card').length).toBe(2);
		expect(document.querySelectorAll('.review-card').length).toBe(4);
		expect(document.querySelectorAll('.room-cta-card').length).toBe(5);

		// 5 FAQ items
		for (const faq of SINGLE_SCANNER_FAQ_ITEMS) {
			await expect.element(page.getByText(`Q: ${faq.question}`)).toBeInTheDocument();
		}
	});
});
