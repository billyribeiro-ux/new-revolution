import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import {
	SINGLE_COURSE_FAQ_ITEMS,
	buildSingleCourseJsonLd,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import { entries, load } from './+page.ts';
import SingleCoursePage from './+page.svelte';

describe('/store/courses/[slug] page', () => {
	it('returns character-locked SEO metadata (55-char title, 155-char description) and JSON-LD from load()', () => {
		const slugList = entries();
		expect(slugList).toContainEqual({ slug: 'move-prior-to-the-move-ultra' });

		const result = load({
			url: new URL('https://revolutiontradingpros.com/store/courses/move-prior-to-the-move-ultra'),
			params: { slug: 'move-prior-to-the-move-ultra' }
		} as Parameters<typeof load>[0]) as Record<string, unknown>;

		const pageMetaTags = result.pageMetaTags as {
			title: string;
			description: string;
			openGraph: { title: string; description: string; url: string };
		};

		expect(pageMetaTags.title).toBe('Move Prior to The Move Course');
		expect(pageMetaTags.title.length).toBe(29);
		expect(pageMetaTags.openGraph.title).toBe(
			'Move Prior to The Move Course | Revolution Trading Pros'
		);
		expect(pageMetaTags.openGraph.title.length).toBe(55);
		expect(pageMetaTags.description).toBe(
			'Master institutional order flow, multi-timeframe squeezes, and Options Greeks with Billy Ribeiro. Includes 100% non-repainting ThinkorSwim & TradingView tools.'
		);
		expect(pageMetaTags.description.length).toBe(159);
		expect(pageMetaTags.openGraph.url).toBe(
			'https://revolutiontradingpros.com/store/courses/move-prior-to-the-move-ultra'
		);
	});

	it('renders the H1, 2 package cards, 5 anchored component blocks, 6 curriculum modules, instructor bio, 6 unique member reviews, 5 FAQs, and 5 room CTA cards', async () => {
		render(SingleCoursePage, {
			params: { slug: 'move-prior-to-the-move-ultra' },
			data: {
				pageMetaTags: {},
				jsonLdSchema: buildSingleCourseJsonLd(SITE_ORIGIN, 'move-prior-to-the-move-ultra')
			} as never
		});

		const h1 = page.getByRole('heading', {
			level: 1,
			name: /Get the NEW Automated Move Prior to The Move™ Ultra System/i
		});
		await expect.element(h1).toBeInTheDocument();

		// 2 package cards
		expect(document.querySelectorAll('.package-card').length).toBe(2);

		// 5 anchored component deep-dive blocks
		expect(document.querySelectorAll('.component-block').length).toBe(5);
		expect(document.getElementById('accelerator-class')).not.toBeNull();
		expect(document.getElementById('core-indicator')).not.toBeNull();
		expect(document.getElementById('multi-timeframe')).not.toBeNull();
		expect(document.getElementById('stats-engine')).not.toBeNull();
		expect(document.getElementById('bonus-early-in-out')).not.toBeNull();

		// 6 curriculum modules, 6 member reviews, 5 room CTA cards
		expect(document.querySelectorAll('.module-card').length).toBe(6);
		expect(document.querySelectorAll('.review-card').length).toBe(6);
		expect(document.querySelectorAll('.room-cta-card').length).toBe(5);

		// Instructor bio section
		await expect
			.element(
				page.getByRole('heading', {
					level: 2,
					name: 'Billy Ribeiro — Founder of Revolution Trading Pros'
				})
			)
			.toBeInTheDocument();

		// 5 FAQ items
		for (const faq of SINGLE_COURSE_FAQ_ITEMS) {
			await expect.element(page.getByText(faq.question)).toBeInTheDocument();
		}
	});
});
