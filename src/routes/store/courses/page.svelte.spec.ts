import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import {
	COURSES_STORE_FAQ_ITEMS,
	buildCoursesStoreJsonLd,
	SITE_ORIGIN
} from '#lib/seo/structured-data.ts';
import { load } from './+page.ts';
import CoursesStorePage from './+page.svelte';

describe('/store/courses page', () => {
	it('returns character-locked SEO metadata (57-char title, 148-char description) and JSON-LD from load()', () => {
		const result = load({
			url: new URL('https://revolutiontradingpros.com/store/courses')
		} as Parameters<typeof load>[0]) as Record<string, unknown>;

		const pageMetaTags = result.pageMetaTags as {
			title: string;
			description: string;
			openGraph: { title: string; description: string; url: string };
		};

		expect(pageMetaTags.title).toBe('Stock & Options Trading Courses');
		expect(pageMetaTags.title.length).toBe(31);
		expect(pageMetaTags.openGraph.title).toBe(
			'Stock & Options Trading Courses | Revolution Trading Pros'
		);
		expect(pageMetaTags.openGraph.title.length).toBe(57);
		expect(pageMetaTags.description).toBe(
			'Self-paced stock, ETF, and options trading courses. Master institutional order flow, Options Greeks, and $500+ small account compounding. Zero hype.'
		);
		expect(pageMetaTags.description.length).toBe(148);
		expect(pageMetaTags.openGraph.url).toBe('https://revolutiontradingpros.com/store/courses');
	});

	it('renders the H1, diagnostic router, 8 course cards, interactive track filter tabs, 6 deliverables, 5 comparison rows, and 4 FAQs', async () => {
		render(CoursesStorePage, {
			params: {},
			data: {
				pageMetaTags: {},
				jsonLdSchema: buildCoursesStoreJsonLd(SITE_ORIGIN)
			} as never
		});

		const h1 = page.getByRole('heading', {
			level: 1,
			name: /Stop Paying \$3,000 for Recycled Retail Theory\. Learn Real Wall Street Execution\./i
		});
		await expect.element(h1).toBeInTheDocument();

		await expect.element(page.getByText('Not Sure Where to Start?')).toBeInTheDocument();

		// 8 course cards initially rendered
		expect(document.querySelectorAll('.course-card').length).toBe(8);

		// Course 01 syllabus is open by default
		expect(document.querySelectorAll('.course-card__syllabus').length).toBe(1);

		// Filter by "$500+ Small Accounts & Foundation" -> 2 courses
		const smallAccountTab = page.getByRole('tab', {
			name: '$500+ Small Accounts & Foundation'
		});
		await smallAccountTab.click();
		expect(document.querySelectorAll('.course-card').length).toBe(2);

		// Reset to all 8 courses
		const seeAllBtn = page.getByRole('button', { name: 'See All Courses (8) →' });
		await seeAllBtn.click();
		expect(document.querySelectorAll('.course-card').length).toBe(8);

		// 6 deliverable cards, 5 comparison rows, 5 room CTA cards
		expect(document.querySelectorAll('.deliverable-card').length).toBe(6);
		expect(document.querySelectorAll('.comparison-table tbody tr').length).toBe(5);
		expect(document.querySelectorAll('.room-cta-card').length).toBe(5);

		// 4 FAQ items
		for (const faq of COURSES_STORE_FAQ_ITEMS) {
			await expect.element(page.getByText(faq.question)).toBeInTheDocument();
		}
	});
});
