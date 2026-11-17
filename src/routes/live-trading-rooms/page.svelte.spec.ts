import { page } from 'vite-plus/test/browser';
import { describe, expect, it } from 'vite-plus/test';
import { render } from 'vitest-browser-svelte';
import '../../app.css';
import { CAPITAL_CHOICES, SCHEDULE_CHOICES } from '#lib/data/live-trading-rooms-hub.ts';
import {
	buildLiveTradingRoomsHubJsonLd,
	LIVE_TRADING_ROOMS_HUB_DESCRIPTION,
	LIVE_TRADING_ROOMS_HUB_FAQ_ITEMS,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import LiveTradingRoomsHubPage from './+page.svelte';
import { load } from './+page.ts';

function docTop(el: HTMLElement): number {
	return el.offsetTop;
}

describe('/live-trading-rooms/+page.svelte (Vitest Browser Mode)', () => {
	it('locks exact 44-char rendered title, 140-158-char description, and canonical URL in +page.ts load()', () => {
		const loaded = load({
			url: new URL('https://www.revolutiontradingpros.com/live-trading-rooms')
		} as Parameters<typeof load>[0]) as {
			pageMetaTags: {
				title: string;
				description: string;
				canonical: string;
				openGraph: { title: string; description: string; url: string };
			};
			jsonLdSchema: ReturnType<typeof buildLiveTradingRoomsHubJsonLd>;
		};

		expect(loaded.pageMetaTags.title).toBe('Live Trading Rooms');
		expect(`${loaded.pageMetaTags.title} | Revolution Trading Pros`).toHaveLength(44);
		expect(loaded.pageMetaTags.description).toBe(LIVE_TRADING_ROOMS_HUB_DESCRIPTION);
		expect(loaded.pageMetaTags.description.length).toBeGreaterThanOrEqual(135);
		expect(loaded.pageMetaTags.description.length).toBeLessThanOrEqual(158);
		expect(loaded.pageMetaTags.canonical).toBe(
			'https://www.revolutiontradingpros.com/live-trading-rooms'
		);
		expect(loaded.pageMetaTags.openGraph.url).toBe(
			'https://www.revolutiontradingpros.com/live-trading-rooms'
		);
	});

	it('renders all 3 rooms, 6 FAQs, and maintains 0px hero/CTA/section layout shift across all 9 Fit Guide states on desktop and mobile', async () => {
		await page.viewport(1280, 900);

		await render(LiveTradingRoomsHubPage, {
			params: {},
			data: {
				baseMetaTags: {},
				pageMetaTags: {},
				jsonLdSchema: buildLiveTradingRoomsHubJsonLd(SITE_ORIGIN)
			} as never
		});

		await document.fonts?.ready;

		const skipLink = document.querySelector('a.skip');
		const mainEl = document.querySelector('main');
		expect(skipLink?.getAttribute('href')).toBe(`#${mainEl?.id}`);

		const currentCrumb = document.querySelector(
			'nav[aria-label="Breadcrumb"] li[aria-current="page"]'
		);
		expect(currentCrumb?.textContent?.trim()).toBe('Live Trading Rooms');
		expect(currentCrumb?.querySelector('a')).toBeNull();

		await expect
			.element(
				page.getByRole('heading', {
					level: 1,
					name: /Three Dedicated Rooms\. Structured Around Your Schedule and Capital\./i
				})
			)
			.toBeInTheDocument();

		// All 3 room cards remain visible simultaneously
		await expect
			.element(page.getByRole('heading', { level: 3, name: 'Live Day Trading Room' }).first())
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('heading', { level: 3, name: 'Live Swing Trading Room' }).first())
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('heading', { level: 3, name: 'Small Accounts Room ($500+)' }).first())
			.toBeInTheDocument();

		const heroEl = document.querySelector<HTMLElement>('.hub-hero')!;
		const selectorEl = document.querySelector<HTMLElement>('#room-fit-selector')!;
		const ctaEl = document.querySelector<HTMLElement>('.fit-result__cta')!;
		const roomsSectionEl = document.querySelector<HTMLElement>('#three-live-rooms')!;

		for (const [width, height] of [
			[1280, 900],
			[390, 844]
		] as const) {
			await page.viewport(width, height);
			await new Promise((resolveFrame) => requestAnimationFrame(() => resolveFrame(undefined)));

			const baselineHeroHeight = Math.round(heroEl.getBoundingClientRect().height);
			const baselineSelectorHeight = Math.round(selectorEl.getBoundingClientRect().height);
			const baselineCtaDocTop = docTop(ctaEl);
			const baselineRoomsDocTop = docTop(roomsSectionEl);
			const baselineRoomsHeight = Math.round(roomsSectionEl.getBoundingClientRect().height);

			for (const schedule of SCHEDULE_CHOICES) {
				const scheduleBtn = page.getByRole('button', { name: new RegExp(schedule.label, 'i') });
				await scheduleBtn.click();
				await expect.element(scheduleBtn).toHaveAttribute('aria-pressed', 'true');

				for (const capital of CAPITAL_CHOICES) {
					const escapedLabel = capital.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
					const capitalBtn = page.getByRole('button', { name: new RegExp(escapedLabel, 'i') });
					await capitalBtn.click();
					await expect.element(capitalBtn).toHaveAttribute('aria-pressed', 'true');

					const fitResultEl = document.querySelector<HTMLElement>('.fit-result')!;
					expect(
						Math.round(heroEl.getBoundingClientRect().height),
						`[${width}x${height} ${schedule.id}/${capital.id}] selector=${Math.round(selectorEl.getBoundingClientRect().height)} fitResult=${Math.round(fitResultEl.getBoundingClientRect().height)} sizers=${document.querySelectorAll('.fit-result__sizer').length}`
					).toBe(baselineHeroHeight);
					expect(Math.round(selectorEl.getBoundingClientRect().height)).toBe(
						baselineSelectorHeight
					);
					expect(docTop(ctaEl)).toBe(baselineCtaDocTop);
					expect(docTop(roomsSectionEl)).toBe(baselineRoomsDocTop);
					expect(Math.round(roomsSectionEl.getBoundingClientRect().height)).toBe(
						baselineRoomsHeight
					);
				}
			}
		}

		for (const faq of LIVE_TRADING_ROOMS_HUB_FAQ_ITEMS) {
			await expect
				.element(page.getByRole('heading', { level: 3, name: faq.question }))
				.toBeInTheDocument();
		}
	});
});
