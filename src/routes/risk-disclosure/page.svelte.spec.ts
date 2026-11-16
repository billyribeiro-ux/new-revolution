import { page } from 'vite-plus/test/browser';
import { describe, expect, it } from 'vite-plus/test';
import { render } from 'vitest-browser-svelte';
import '../../app.css';
import {
	buildRiskDisclosurePageJsonLd,
	RISK_DISCLOSURE_DESCRIPTION,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import RiskDisclosurePage from './+page.svelte';
import { load } from './+page.ts';

describe('/risk-disclosure/+page.svelte', () => {
	it('locks canonical title, 140-158 char description, and JSON-LD schema in +page.ts', () => {
		const loaded = load({
			url: new URL('https://www.revolutiontradingpros.com/risk-disclosure')
		} as Parameters<typeof load>[0]) as {
			pageMetaTags: { title: string; description: string; canonical: string };
		};

		expect(loaded.pageMetaTags.title).toBe('Risk & Regulatory Disclosure');
		expect(loaded.pageMetaTags.description).toBe(RISK_DISCLOSURE_DESCRIPTION);
		expect(loaded.pageMetaTags.description.length).toBeGreaterThanOrEqual(140);
		expect(loaded.pageMetaTags.description.length).toBeLessThanOrEqual(158);
		expect(loaded.pageMetaTags.canonical).toBe(
			'https://www.revolutiontradingpros.com/risk-disclosure'
		);
	});

	it('renders all 6 statutory disclosure cards (OCC, CFTC 4.41, FINRA 4210, Section 1256) and FAQs', async () => {
		await page.viewport(1280, 900);
		await render(RiskDisclosurePage, {
			params: {},
			data: {
				baseMetaTags: {},
				pageMetaTags: {},
				jsonLdSchema: buildRiskDisclosurePageJsonLd(SITE_ORIGIN)
			} as never
		});

		await expect
			.element(
				page.getByRole('heading', {
					level: 1,
					name: /U\.S\. & Canadian Risk & Regulatory Disclosure/i
				})
			)
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('heading', { level: 3, name: /CFTC Rule 4\.41/i }))
			.toBeInTheDocument();
	});
});
