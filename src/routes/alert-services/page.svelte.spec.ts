import { page } from 'vite-plus/test/browser';
import { describe, expect, it } from 'vite-plus/test';
import { render } from 'vitest-browser-svelte';
import '../../app.css';
import {
	ALERT_SERVICES_HUB_DESCRIPTION,
	buildAlertServicesHubJsonLd,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import AlertServicesHubPage from './+page.svelte';
import { load } from './+page.ts';

describe('/alert-services/+page.svelte', () => {
	it('locks canonical title, 140-158 char description, and JSON-LD schema in +page.ts', () => {
		const loaded = load({
			url: new URL('https://www.revolutiontradingpros.com/alert-services')
		} as Parameters<typeof load>[0]) as {
			pageMetaTags: { title: string; description: string; canonical: string };
		};

		expect(loaded.pageMetaTags.title).toBe('Options & SPX Alert Services');
		expect(loaded.pageMetaTags.description).toBe(ALERT_SERVICES_HUB_DESCRIPTION);
		expect(loaded.pageMetaTags.description.length).toBeGreaterThanOrEqual(140);
		expect(loaded.pageMetaTags.description.length).toBeLessThanOrEqual(158);
		expect(loaded.pageMetaTags.canonical).toBe(
			'https://www.revolutiontradingpros.com/alert-services'
		);
	});

	it('renders both flagship alert services, 5-point blueprint anatomy, and FAQs', async () => {
		await page.viewport(1280, 900);
		await render(AlertServicesHubPage, {
			params: {},
			data: {
				baseMetaTags: {},
				pageMetaTags: {},
				jsonLdSchema: buildAlertServicesHubJsonLd(SITE_ORIGIN)
			} as never
		});

		await expect
			.element(page.getByRole('heading', { level: 3, name: 'SPX Profit Pulse' }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('heading', { level: 3, name: 'Sunday Alpha Protocol' }))
			.toBeInTheDocument();
	});
});
