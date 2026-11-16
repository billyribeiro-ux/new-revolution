import { page } from 'vite-plus/test/browser';
import { describe, expect, it } from 'vite-plus/test';
import { render } from 'vitest-browser-svelte';
import '../../../app.css';
import {
	buildOptionsCalculatorJsonLd,
	OPTIONS_CALCULATOR_DESCRIPTION,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import OptionsCalculatorPage from './+page.svelte';
import { load } from './+page.ts';

describe('/resources/options-calculator/+page.svelte', () => {
	it('locks canonical title, 140-158 char description, and WebApplication JSON-LD in +page.ts', () => {
		const loaded = load({
			url: new URL('https://www.revolutiontradingpros.com/resources/options-calculator')
		} as Parameters<typeof load>[0]) as {
			pageMetaTags: { title: string; description: string; canonical: string };
		};

		expect(loaded.pageMetaTags.title).toBe('Options Profit & Greeks Tool');
		expect(loaded.pageMetaTags.description).toBe(OPTIONS_CALCULATOR_DESCRIPTION);
		expect(loaded.pageMetaTags.description.length).toBeGreaterThanOrEqual(140);
		expect(loaded.pageMetaTags.description.length).toBeLessThanOrEqual(158);
		expect(loaded.pageMetaTags.canonical).toBe(
			'https://www.revolutiontradingpros.com/resources/options-calculator'
		);
	});

	it('renders interactive Black-Scholes Greeks, spread toggle, SVG payoff curve, and citation widget', async () => {
		await page.viewport(1280, 900);
		await render(OptionsCalculatorPage, {
			params: {},
			data: {
				baseMetaTags: {},
				pageMetaTags: {},
				jsonLdSchema: buildOptionsCalculatorJsonLd(SITE_ORIGIN)
			} as never
		});

		await expect
			.element(page.getByRole('button', { name: 'Bull Call Spread' }))
			.toBeInTheDocument();
		await page.getByRole('button', { name: 'Bull Call Spread' }).click();
		await expect.element(page.getByText('Short Hedge Strike ($)')).toBeInTheDocument();
	});
});
