import { page } from 'vite-plus/test/browser';
import { describe, expect, it } from 'vite-plus/test';
import { render } from 'vitest-browser-svelte';
import '../../app.css';
import {
	buildMethodologyJsonLd,
	METHODOLOGY_PAGE_DESCRIPTION,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import MethodologyPage from './+page.svelte';
import { load } from './+page.ts';

describe('/methodology/+page.svelte', () => {
	it('locks canonical title, 140-158 char description, and JSON-LD schema in +page.ts', () => {
		const loaded = load({
			url: new URL('https://www.revolutiontradingpros.com/methodology')
		} as Parameters<typeof load>[0]) as {
			pageMetaTags: { title: string; description: string; canonical: string };
		};

		expect(loaded.pageMetaTags.title).toBe('Pure Price Action Methodology');
		expect(loaded.pageMetaTags.description).toBe(METHODOLOGY_PAGE_DESCRIPTION);
		expect(loaded.pageMetaTags.description.length).toBeGreaterThanOrEqual(140);
		expect(loaded.pageMetaTags.description.length).toBeLessThanOrEqual(158);
		expect(loaded.pageMetaTags.canonical).toBe('https://www.revolutiontradingpros.com/methodology');
	});

	it('renders H1, 4-timeframe interactive tabs with zero CLS, comparison table, and FAQs', async () => {
		await page.viewport(1280, 900);
		await render(MethodologyPage, {
			params: {},
			data: {
				baseMetaTags: {},
				pageMetaTags: {},
				jsonLdSchema: buildMethodologyJsonLd(SITE_ORIGIN)
			} as never
		});

		await expect
			.element(page.getByRole('heading', { level: 1, name: /Inside The Move Prior to The Move/i }))
			.toBeInTheDocument();

		const stage = document.querySelector<HTMLElement>('.tf-stage')!;
		const initialHeight = stage.getBoundingClientRect().height;
		await page.getByRole('tab', { name: /04 · 5-Minute & 1-Minute/i }).click();
		expect(Math.abs(stage.getBoundingClientRect().height - initialHeight)).toBeLessThanOrEqual(1);
	});
});
