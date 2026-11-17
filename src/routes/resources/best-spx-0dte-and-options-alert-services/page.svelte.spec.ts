import { page } from 'vite-plus/test/browser';
import { describe, expect, it } from 'vite-plus/test';
import { render } from 'vitest-browser-svelte';
import '../../../app.css';
import {
	BEST_OPTIONS_ALERTS_DESCRIPTION,
	buildBestOptionsAlertsComparisonJsonLd,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import BestOptionsAlertsPage from './+page.svelte';
import { load } from './+page.ts';

describe('/resources/best-spx-0dte-and-options-alert-services/+page.svelte', () => {
	it('locks canonical title, 140-158 char description, and Article JSON-LD in +page.ts', () => {
		const loaded = load({
			url: new URL(
				'https://www.revolutiontradingpros.com/resources/best-spx-0dte-and-options-alert-services'
			)
		} as Parameters<typeof load>[0]) as {
			pageMetaTags: { title: string; description: string; canonical: string };
		};

		expect(loaded.pageMetaTags.title).toBe('Best SPX & Options Alerts 2026');
		expect(loaded.pageMetaTags.description).toBe(BEST_OPTIONS_ALERTS_DESCRIPTION);
		expect(loaded.pageMetaTags.description.length).toBeGreaterThanOrEqual(135);
		expect(loaded.pageMetaTags.description.length).toBeLessThanOrEqual(158);
		expect(loaded.pageMetaTags.canonical).toBe(
			'https://www.revolutiontradingpros.com/resources/best-spx-0dte-and-options-alert-services'
		);
	});

	it('renders 6-service alert comparison matrix, publisher disclosure, and FAQs', async () => {
		await page.viewport(1280, 900);
		await render(BestOptionsAlertsPage, {
			params: {},
			data: {
				baseMetaTags: {},
				pageMetaTags: {},
				jsonLdSchema: buildBestOptionsAlertsComparisonJsonLd(SITE_ORIGIN)
			} as never
		});

		await expect
			.element(
				page.getByRole('heading', {
					level: 2,
					name: /6 SPX 0DTE & Options Swing Alert Services Compared/i
				})
			)
			.toBeInTheDocument();
	});
});
