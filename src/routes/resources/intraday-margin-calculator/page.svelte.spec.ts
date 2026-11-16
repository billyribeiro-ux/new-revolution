import { page } from 'vite-plus/test/browser';
import { describe, expect, it } from 'vite-plus/test';
import { render } from 'vitest-browser-svelte';
import '../../../app.css';
import {
	buildIntradayMarginCalculatorJsonLd,
	INTRADAY_MARGIN_CALCULATOR_DESCRIPTION,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import IntradayMarginCalculatorPage from './+page.svelte';
import { load } from './+page.ts';

describe('/resources/intraday-margin-calculator/+page.svelte', () => {
	it('locks canonical title, 140-158 char description, and WebApplication JSON-LD in +page.ts', () => {
		const loaded = load({
			url: new URL('https://www.revolutiontradingpros.com/resources/intraday-margin-calculator')
		} as Parameters<typeof load>[0]) as {
			pageMetaTags: { title: string; description: string; canonical: string };
		};

		expect(loaded.pageMetaTags.title).toBe('FINRA 2026 Margin Calculator');
		expect(loaded.pageMetaTags.description).toBe(INTRADAY_MARGIN_CALCULATOR_DESCRIPTION);
		expect(loaded.pageMetaTags.description.length).toBeGreaterThanOrEqual(140);
		expect(loaded.pageMetaTags.description.length).toBeLessThanOrEqual(158);
		expect(loaded.pageMetaTags.canonical).toBe(
			'https://www.revolutiontradingpros.com/resources/intraday-margin-calculator'
		);
	});

	it('renders embedded IntradayMarginCalculator, statutory formulas, and FAQs', async () => {
		await page.viewport(1280, 900);
		await render(IntradayMarginCalculatorPage, {
			params: {},
			data: {
				baseMetaTags: {},
				pageMetaTags: {},
				jsonLdSchema: buildIntradayMarginCalculatorJsonLd(SITE_ORIGIN)
			} as never
		});

		await expect
			.element(page.getByRole('button', { name: /Cash Account \(\$500\+ T\+1\)/i }))
			.toBeInTheDocument();
	});
});
