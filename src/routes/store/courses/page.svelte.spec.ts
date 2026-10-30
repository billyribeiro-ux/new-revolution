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
import { coursesCatalog } from '#lib/data/courses.ts';

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

		// 8 course cards in a semantic list, one h3 title link each, pointing at the typed detail route
		expect(document.querySelectorAll('ul.courses-grid > li').length).toBe(8);
		expect(document.querySelectorAll('.course-card').length).toBe(8);
		const titleLinks = [...document.querySelectorAll<HTMLAnchorElement>('.course-card h3 a')];
		expect(titleLinks.length).toBe(8);
		expect(titleLinks.map((a) => a.getAttribute('href'))).toEqual(
			coursesCatalog.map((c) => `/store/courses/${c.slug}`)
		);

		// Exactly one featured (lead) card: Course 01
		const featured = document.querySelectorAll('.courses-grid__item.is-featured');
		expect(featured.length).toBe(1);
		expect(featured[0].querySelector('.course-card__code')?.textContent).toContain('Course 01');

		// Every syllabus is in the HTML without interaction (native <details>); only the lead card opens by default
		const syllabi = [
			...document.querySelectorAll<HTMLDetailsElement>('details.course-card__syllabus')
		];
		expect(syllabi.length).toBe(8);
		expect(syllabi.filter((d) => d.open).length).toBe(1);
		expect(syllabi[0].open).toBe(true);
		expect(syllabi.every((d) => d.querySelectorAll('ol > li').length === 4)).toBe(true);
		(syllabi[1].querySelector('summary') as HTMLElement).click();
		expect(syllabi[1].open).toBe(true);

		// Filter: accessible pressed state, live count, and filtered list
		const allBtn = page.getByRole('button', { name: /^All Courses \(8\)$/ });
		await expect.element(allBtn).toHaveAttribute('aria-pressed', 'true');
		const smallAccountBtn = page.getByRole('button', { name: '$500+ Small Accounts & Foundation' });
		await smallAccountBtn.click();
		await expect.element(smallAccountBtn).toHaveAttribute('aria-pressed', 'true');
		await expect.element(allBtn).toHaveAttribute('aria-pressed', 'false');
		expect(document.querySelectorAll('.course-card').length).toBe(2);
		await expect.element(page.getByRole('status')).toHaveTextContent('Showing 2 of 8 courses');
		// The featured card is filtered out: no lead card remains
		expect(document.querySelectorAll('.courses-grid__item.is-featured').length).toBe(0);

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
