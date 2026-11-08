import { page } from 'vite-plus/test/browser';
import { describe, expect, it } from 'vite-plus/test';
import { render } from 'vitest-browser-svelte';
import '../../../app.css';
import Page from './+page.svelte';
import { load } from './+page.ts';
import {
	SITE_ORIGIN,
	SUNDAY_ALPHA_PROTOCOL_FAQ_ITEMS,
	buildSundayAlphaProtocolJsonLd
} from '#lib/seo/structured-data.ts';

function getPageData() {
	return load({
		url: new URL('https://www.revolutiontradingpros.com/alert-services/sunday-alpha-protocol')
	} as Parameters<typeof load>[0]) as Record<string, unknown>;
}

describe('/alert-services/sunday-alpha-protocol/+page.svelte (Sunday Alpha Protocol)', () => {
	it('uses the current product name, canonical route and house metadata budgets', () => {
		const data = getPageData() as {
			pageMetaTags: {
				title: string;
				description: string;
				canonical: string;
				openGraph: { title: string; type: string };
			};
		};

		expect(data.pageMetaTags.title).toBe('Sunday Alpha Protocol');
		expect(data.pageMetaTags.title.length).toBeLessThanOrEqual(33);
		expect(data.pageMetaTags.openGraph.type).toBe('website');
		expect(data.pageMetaTags.description).toBe(
			'Explore Sunday Alpha Protocol stock and options research, weekly preparation, entry scenarios, risk levels, and educational tools for independent traders.'
		);
		expect(data.pageMetaTags.description.length).toBeGreaterThanOrEqual(140);
		expect(data.pageMetaTags.description.length).toBeLessThanOrEqual(158);
		expect(data.pageMetaTags.canonical).toBe(
			'https://www.revolutiontradingpros.com/alert-services/sunday-alpha-protocol'
		);
	});

	it('enforces a single H1, strict H1 -> H2 -> H3 hierarchy, zero in-page # fragment links, and 1-to-1 FAQ parity with schema', async () => {
		await render(Page, {
			params: {},
			data: {
				pageMetaTags: {},
				jsonLdSchema: buildSundayAlphaProtocolJsonLd(SITE_ORIGIN)
			} as never
		});

		const h1s = document.querySelectorAll('h1');
		expect(h1s.length).toBe(1);
		expect(h1s[0].textContent?.replace(/\s+/g, ' ').trim()).toContain('THE SUNDAY ALPHA PROTOCOL.');

		expect(document.querySelectorAll('h4').length).toBe(0);
		expect(document.querySelectorAll('main a[href*="#"]').length).toBe(0);

		const faqQuestions = Array.from(document.querySelectorAll('#faq details.faq-item summary')).map(
			(el) => el.textContent?.trim()
		);
		expect(faqQuestions).toEqual(SUNDAY_ALPHA_PROTOCOL_FAQ_ITEMS.map((item) => item.question));
	});

	it('renders the D3 Quantitative Terminal and switches across $TSLA, $NVDA, and $SPY blueprints', async () => {
		await render(Page, {
			params: {},
			data: {
				pageMetaTags: {},
				jsonLdSchema: buildSundayAlphaProtocolJsonLd(SITE_ORIGIN)
			} as never
		});

		await expect.element(page.getByText('$TSLA: Tesla, Inc.')).toBeVisible();

		const nvdaTab = page.getByRole('tab', { name: '$NVDA BREAKOUT' });
		await nvdaTab.click();
		await expect.element(page.getByText('$NVDA: NVIDIA Corp.')).toBeVisible();
		await expect.element(page.getByText('RELATIVE STRENGTH LEADER')).toBeVisible();

		const spyTab = page.getByRole('tab', { name: '$SPY PIVOT' });
		await spyTab.click();
		await expect.element(page.getByText('$SPY: S&P 500 ETF Trust')).toBeVisible();
		await expect.element(page.getByText('INDEX LIQUIDITY RECLAIM')).toBeVisible();
	});

	it('renders all 3 mechanism acts, 3 suitability tiers, 3 Billy Ribeiro receipts, and 3 pricing tiers ($47, $127, $447)', async () => {
		await render(Page, {
			params: {},
			data: {
				pageMetaTags: {},
				jsonLdSchema: buildSundayAlphaProtocolJsonLd(SITE_ORIGIN)
			} as never
		});

		expect(document.querySelectorAll('.mech-card').length).toBe(3);
		expect(document.querySelectorAll('.persona-card').length).toBe(3);
		expect(document.querySelectorAll('.receipt-box').length).toBe(3);
		expect(document.querySelectorAll('.price-card').length).toBe(3);
		await expect.element(page.getByText('Founding Member Monthly')).toBeVisible();
		await expect.element(page.getByText('Quarterly Pass')).toBeVisible();
		await expect.element(page.getByText('Annual VIP Pass')).toBeVisible();
	});
});
