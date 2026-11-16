import { page } from 'vite-plus/test/browser';
import { describe, expect, it } from 'vite-plus/test';
import { render } from 'vitest-browser-svelte';
import '../../app.css';
import {
	buildTrackRecordJsonLd,
	SITE_ORIGIN,
	TRACK_RECORD_PAGE_DESCRIPTION
} from '#lib/seo/structured-data.ts';
import TrackRecordPage from './+page.svelte';
import { load } from './+page.ts';

describe('/track-record/+page.svelte', () => {
	it('locks canonical title, 140-158 char description, and JSON-LD schema in +page.ts', () => {
		const loaded = load({
			url: new URL('https://www.revolutiontradingpros.com/track-record')
		} as Parameters<typeof load>[0]) as {
			pageMetaTags: { title: string; description: string; canonical: string };
		};

		expect(loaded.pageMetaTags.title).toBe('Trade Ledger & Case Studies');
		expect(loaded.pageMetaTags.description).toBe(TRACK_RECORD_PAGE_DESCRIPTION);
		expect(loaded.pageMetaTags.description.length).toBeGreaterThanOrEqual(140);
		expect(loaded.pageMetaTags.description.length).toBeLessThanOrEqual(158);
		expect(loaded.pageMetaTags.canonical).toBe(
			'https://www.revolutiontradingpros.com/track-record'
		);
	});

	it('renders verification audit gates, filterable archived calls, and CFTC Rule 4.41 notice without fabricated live rows', async () => {
		await page.viewport(1280, 900);
		await render(TrackRecordPage, {
			params: {},
			data: {
				baseMetaTags: {},
				pageMetaTags: {},
				jsonLdSchema: buildTrackRecordJsonLd(SITE_ORIGIN)
			} as never
		});

		await expect
			.element(
				page.getByRole('heading', {
					level: 1,
					name: /Every Setup Logged With Its Pre-Trade Stop/i
				})
			)
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('heading', { level: 3, name: /Mandatory CFTC Rule 4\.41/i }))
			.toBeInTheDocument();
	});
});
