import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { coursesCatalog } from '#lib/data/courses.ts';
import CourseCard from './CourseCard.svelte';

const flagship = coursesCatalog[0];
const regular = coursesCatalog[1];

describe('CourseCard', () => {
	it('renders one article named by its title link, which targets the typed detail route', async () => {
		render(CourseCard, { course: regular });

		const article = page.getByRole('article', { name: regular.title });
		await expect.element(article).toBeInTheDocument();
		await expect
			.element(page.getByRole('link', { name: regular.title }))
			.toHaveAttribute('href', `/store/courses/${regular.slug}`);
		await expect
			.element(page.getByRole('link', { name: regular.room.label }))
			.toHaveAttribute('href', regular.room.href);
	});

	it('defaults to an h3 title', async () => {
		render(CourseCard, { course: regular });
		await expect
			.element(page.getByRole('heading', { level: 3, name: regular.title }))
			.toBeVisible();
	});

	it('uses the requested heading level and keeps heading and article ids paired', async () => {
		render(CourseCard, { course: regular, headingLevel: 2 });
		await expect
			.element(page.getByRole('heading', { level: 2, name: regular.title }))
			.toBeVisible();
		const article = document.querySelector('article.course-card') as HTMLElement;
		expect(article.getAttribute('aria-labelledby')).toBe(
			(document.querySelector('.catalog-card__title') as HTMLElement).id
		);
	});

	it('merges the class prop and forwards rest attributes onto the article', async () => {
		render(CourseCard, {
			course: regular,
			class: ['host-class', { 'is-extra': true }],
			'data-testid': 'card'
		} as never);

		const article = document.querySelector('article') as HTMLElement;
		expect(article.classList.contains('course-card')).toBe(true);
		expect(article.classList.contains('host-class')).toBe(true);
		expect(article.classList.contains('is-extra')).toBe(true);
		expect(article.getAttribute('data-testid')).toBe('card');
		expect(article.id).toBe(regular.id);
	});

	it('opens the syllabus by default on the featured card and shows every module', async () => {
		render(CourseCard, { course: flagship });
		expect(flagship.featured).toBe(true);
		expect((document.querySelector('details') as HTMLDetailsElement).open).toBe(true);
		expect(document.querySelectorAll('.course-card__modules > li').length).toBe(
			flagship.syllabus.length
		);
		expect(document.querySelector('article')?.classList.contains('is-featured')).toBe(true);
	});

	it('keeps a collapsed syllabus crawlable: every module is in the DOM while closed', async () => {
		render(CourseCard, { course: regular });
		expect((document.querySelector('details') as HTMLDetailsElement).open).toBe(false);
		expect(document.querySelectorAll('.course-card__modules > li').length).toBe(
			regular.syllabus.length
		);
		expect(document.querySelector('.course-card__modules')?.textContent).toContain(
			regular.syllabus[0].split(': ')[1]
		);
	});

	it('hides the decorative CTA from assistive technology so the title is the single detail link', async () => {
		render(CourseCard, { course: regular });
		expect(document.querySelector('.catalog-card__cta')?.getAttribute('aria-hidden')).toBe('true');
		expect(document.querySelectorAll('a[href="/store/courses/' + regular.slug + '"]').length).toBe(
			1
		);
	});
});
