import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import {
	SINGLE_INDICATOR_FAQ_ITEMS,
	buildSingleIndicatorJsonLd,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import { entries, load } from './+page.ts';
import SingleIndicatorPage from './+page.svelte';

describe('/store/indicators/[slug] page', () => {
	it('returns character-locked SEO metadata (53-char title, 150-char description) and JSON-LD from load()', () => {
		const slugList = entries();
		expect(slugList).toContainEqual({ slug: 'move-prior-to-the-move-system' });

		const result = load({
			url: new URL(
				'https://revolutiontradingpros.com/store/indicators/move-prior-to-the-move-system'
			),
			params: { slug: 'move-prior-to-the-move-system' }
		} as Parameters<typeof load>[0]) as Record<string, unknown>;

		const pageMetaTags = result.pageMetaTags as {
			title: string;
			description: string;
			openGraph: { title: string; description: string; url: string };
		};

		expect(pageMetaTags.title).toBe('MP Early In & Out Indicator');
		expect(pageMetaTags.title.length).toBe(27);
		expect(pageMetaTags.openGraph.title).toBe(
			'MP Early In & Out Indicator | Revolution Trading Pros'
		);
		expect(pageMetaTags.openGraph.title.length).toBe(53);
		expect(pageMetaTags.description).toBe(
			'Spot explosive stock, ETF, and options moves early with our 100% non-repainting indicator system for ThinkorSwim and TradingView. People over profits.'
		);
		expect(pageMetaTags.description.length).toBe(150);
		expect(pageMetaTags.openGraph.url).toBe(
			'https://revolutiontradingpros.com/store/indicators/move-prior-to-the-move-system'
		);
	});

	it('renders the H1, interactive 3-tab preview, 6 system components & bonuses, 3 suitability pillars, enrollment dossier, instructor bio, 4 member reviews, 4 FAQs, and 5 room CTA cards', async () => {
		render(SingleIndicatorPage, {
			params: { slug: 'move-prior-to-the-move-system' },
			data: {
				pageMetaTags: {},
				jsonLdSchema: buildSingleIndicatorJsonLd(SITE_ORIGIN, 'move-prior-to-the-move-system')
			} as never
		});

		const h1 = page.getByRole('heading', {
			level: 1,
			name: /Predict Explosive Institutional Moves With The Move Prior to The Move™ System/i
		});
		await expect.element(h1).toBeInTheDocument();

		// Interactive 3-tab preview switching
		const tabEarly = page.getByRole('tab', { name: '2. Early In/Out' });
		await tabEarly.click();
		await expect.element(tabEarly).toHaveAttribute('aria-selected', 'true');

		const tabStats = page.getByRole('tab', { name: '3. Stats Tool' });
		await tabStats.click();
		await expect.element(tabStats).toHaveAttribute('aria-selected', 'true');

		// 6 system components, 3 suitability cards, 4 member reviews, 5 room CTA cards
		expect(document.querySelectorAll('.comp-card').length).toBe(6);
		expect(document.querySelectorAll('.comp-card--bonus').length).toBe(2);
		expect(document.querySelectorAll('.suitability-card').length).toBe(3);
		expect(document.querySelectorAll('.review-card').length).toBe(4);
		expect(document.querySelectorAll('.room-cta-card').length).toBe(5);

		// 4 FAQ items
		for (const faq of SINGLE_INDICATOR_FAQ_ITEMS) {
			await expect.element(page.getByText(faq.question)).toBeInTheDocument();
		}
	});
});
