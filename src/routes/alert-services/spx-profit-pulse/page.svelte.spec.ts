import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import '../../../app.css';
import Page from './+page.svelte';
import { load } from './+page.ts';
import {
	SITE_ORIGIN,
	SPX_PROFIT_PULSE_FAQ_ITEMS,
	buildSpxProfitPulseJsonLd
} from '#lib/seo/structured-data.ts';

function getPageData() {
	return load({
		url: new URL('https://revolutiontradingpros.com/alert-services/spx-profit-pulse')
	} as Parameters<typeof load>[0]) as Record<string, unknown>;
}

describe('/alert-services/spx-profit-pulse/+page.svelte', () => {
	it('locks title tag to 31 chars before suffix (57 total) and meta description to 149 chars', () => {
		const data = getPageData() as {
			pageMetaTags: {
				title: string;
				description: string;
				canonical: string;
				openGraph: { title: string; type: string };
			};
		};

		expect(data.pageMetaTags.title).toBe('SPX Profit Pulse Options Alerts');
		expect(data.pageMetaTags.title.length).toBe(31);
		expect(data.pageMetaTags.openGraph.title).toBe(
			'SPX Profit Pulse Options Alerts | Revolution Trading Pros'
		);
		expect(data.pageMetaTags.openGraph.title.length).toBe(57);
		expect(data.pageMetaTags.openGraph.type).toBe('website');
		expect(data.pageMetaTags.description).toBe(
			'Real-time SPX & 0DTE index options alerts with video watchlists, gamma levels, and exact entries, targets, and stops. People over profits. Zero hype.'
		);
		expect(data.pageMetaTags.description.length).toBe(149);
		expect(data.pageMetaTags.canonical).toBe(
			'https://revolutiontradingpros.com/alert-services/spx-profit-pulse'
		);
	});

	it('enforces a single H1, strict H1 -> H2 -> H3 hierarchy (zero H4s), and 4 semantic H3 FAQ summaries', async () => {
		render(Page, {
			params: {},
			data: {
				pageMetaTags: {},
				jsonLdSchema: buildSpxProfitPulseJsonLd(SITE_ORIGIN)
			} as never
		});

		const h1s = document.querySelectorAll('h1');
		expect(h1s.length).toBe(1);
		expect(h1s[0].querySelector('.seo-kicker')?.textContent?.trim()).toContain(
			'SPX Profit Pulse • Real-Time S&P 500 & 0DTE Index Options Trade Alert Service'
		);
		expect(h1s[0].textContent?.replace(/\s+/g, ' ').trim()).toContain(
			'Get Precise SPX Options Alerts—Catch the Big Index Moves Without Staring at Screens All Day.'
		);

		expect(document.querySelectorAll('h4').length).toBe(0);

		const faqHeadings = Array.from(
			document.querySelectorAll('details.faq-item summary h3.faq-item__heading')
		).map((el) => el.textContent?.trim());
		expect(faqHeadings).toEqual(SPX_PROFIT_PULSE_FAQ_ITEMS.map((item) => item.question));
	});

	it('switches the interactive SPX Alert Simulator across all 3 SPX playbooks', async () => {
		render(Page, {
			params: {},
			data: {
				pageMetaTags: {},
				jsonLdSchema: buildSpxProfitPulseJsonLd(SITE_ORIGIN)
			} as never
		});

		await expect
			.element(
				page.getByRole('heading', { level: 3, name: 'SPX Opening Drive Gamma Wall Breakout' })
			)
			.toBeInTheDocument();

		const gammaReversalTab = page.getByRole('tab', { name: 'Gamma Reversal' });
		await gammaReversalTab.click();
		await expect
			.element(
				page.getByRole('heading', { level: 3, name: 'SPX Exhaustion Trap & Failed Breakout Fade' })
			)
			.toBeInTheDocument();

		const verticalSpreadTab = page.getByRole('tab', { name: 'Vertical Spread' });
		await verticalSpreadTab.click();
		await expect
			.element(
				page.getByRole('heading', {
					level: 3,
					name: 'High-Probability SPX Vertical Spread (Theta & Working Pro Friendly)'
				})
			)
			.toBeInTheDocument();
	});

	it('renders all 6 deliverables, 4 SPX structural advantages, 3 membership cadences with zero prices, trader bio, 4 member reviews, and 5 ecosystem cards', async () => {
		render(Page, {
			params: {},
			data: {
				pageMetaTags: {},
				jsonLdSchema: buildSpxProfitPulseJsonLd(SITE_ORIGIN)
			} as never
		});

		expect(document.querySelectorAll('.deliverable-card').length).toBe(6);
		expect(document.querySelectorAll('.advantage-card').length).toBe(4);
		expect(document.querySelectorAll('.package-card').length).toBe(3);
		expect(document.querySelectorAll('.package-card--featured').length).toBe(1);
		expect(document.querySelectorAll('.trader-box').length).toBe(1);
		expect(document.querySelectorAll('.review-card').length).toBe(4);
		expect(document.querySelectorAll('.room-cta-card').length).toBe(5);

		// Verify zero subscription prices inside the membership cadence cards
		const packagesText = document.querySelector('#choose-your-package')?.textContent ?? '';
		expect(packagesText).not.toMatch(/\$\d+\s*\/\s*(mo|month|qtr|quarter|yr|year)/i);

		await expect
			.element(
				page.getByRole('heading', {
					level: 2,
					name: /Billy Ribeiro — The Only Trader Feared by Wall Street/i
				})
			)
			.toBeInTheDocument();
		await expect.element(page.getByText('+1 (203) 721-0940')).toBeInTheDocument();
	});
});
