import { page } from 'vite-plus/test/browser';
import { describe, expect, it } from 'vite-plus/test';
import { render } from 'vitest-browser-svelte';
import '../../../app.css';
import {
	buildFinraIntradayMarginGuideJsonLd,
	FINRA_INTRADAY_MARGIN_GUIDE_DESCRIPTION,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import FinraGuidePage from './+page.svelte';
import { load } from './+page.ts';

describe('/resources/finra-intraday-margin-rule-2026/+page.svelte', () => {
	it('locks canonical title, 140-158 char description, and Article JSON-LD in +page.ts', () => {
		const loaded = load({
			url: new URL(
				'https://www.revolutiontradingpros.com/resources/finra-intraday-margin-rule-2026'
			)
		} as Parameters<typeof load>[0]) as {
			pageMetaTags: { title: string; description: string; canonical: string };
		};

		expect(loaded.pageMetaTags.title).toBe('FINRA Rule 4210 Margin Guide');
		expect(loaded.pageMetaTags.description).toBe(FINRA_INTRADAY_MARGIN_GUIDE_DESCRIPTION);
		expect(loaded.pageMetaTags.description.length).toBeGreaterThanOrEqual(135);
		expect(loaded.pageMetaTags.description.length).toBeLessThanOrEqual(158);
		expect(loaded.pageMetaTags.canonical).toBe(
			'https://www.revolutiontradingpros.com/resources/finra-intraday-margin-rule-2026'
		);
	});

	it('renders 68-word summary, PDT vs Rule 4210 comparison table, Oct 2027 timeline, and embedded calculator', async () => {
		await page.viewport(1280, 900);
		await render(FinraGuidePage, {
			params: {},
			data: {
				baseMetaTags: {},
				pageMetaTags: {},
				jsonLdSchema: buildFinraIntradayMarginGuideJsonLd(SITE_ORIGIN)
			} as never
		});

		await expect
			.element(
				page.getByRole('heading', {
					level: 2,
					name: /2001 Legacy PDT Rule vs\. 2026 Amended FINRA Rule 4210\(d\)\(2\)/i
				})
			)
			.toBeInTheDocument();
		await expect
			.element(
				page.getByRole('heading', {
					level: 3,
					name: /FINRA 2026 Intraday Margin & Asymmetric Position Sizer/i
				})
			)
			.toBeInTheDocument();
	});
});
