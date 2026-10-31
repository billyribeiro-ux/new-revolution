import { createRawSnippet } from 'svelte';
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CatalogCard from './CatalogCard.svelte';

const titleSnippet = createRawSnippet(() => ({
	render: () => '<a class="catalog-card__link" href="/x">The Title</a>'
}));
const text = (value: string) => createRawSnippet(() => ({ render: () => `<span>${value}</span>` }));

describe('CatalogCard', () => {
	it('renders an article named by its heading, with the consumer-provided stretched link inside it', async () => {
		render(CatalogCard, { title: titleSnippet });

		await expect.element(page.getByRole('article', { name: 'The Title' })).toBeInTheDocument();
		await expect
			.element(page.getByRole('heading', { level: 3, name: 'The Title' }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('link', { name: 'The Title' }))
			.toHaveAttribute('href', '/x');
	});

	it('honors headingLevel and pairs aria-labelledby with the heading id', async () => {
		render(CatalogCard, { title: titleSnippet, headingLevel: 2 });

		await expect
			.element(page.getByRole('heading', { level: 2, name: 'The Title' }))
			.toBeInTheDocument();
		const article = document.querySelector('article') as HTMLElement;
		const heading = document.querySelector('.catalog-card__title') as HTMLElement;
		expect(article.getAttribute('aria-labelledby')).toBe(heading.id);
	});

	it('renders each optional region only when its snippet is provided', async () => {
		const { container } = await render(CatalogCard, { title: titleSnippet });
		expect(container.querySelector('.catalog-card__media')).toBeNull();
		expect(container.querySelector('.catalog-card__top')).toBeNull();
		expect(container.querySelector('.catalog-card__eyebrow')).toBeNull();
		expect(container.querySelector('.catalog-card__detail')).toBeNull();
	});

	it('renders media, top, eyebrow, intro, detail and footer content in the right regions', async () => {
		// `intro` is also a mount() option name, so props go through the explicit `props` key here.
		render(CatalogCard, {
			props: {
				title: titleSnippet,
				media: text('M'),
				top: text('T'),
				eyebrow: text('E'),
				intro: text('I'),
				children: text('D'),
				footer: text('F')
			}
		});

		expect(document.querySelector('.catalog-card__media')?.textContent).toBe('M');
		expect(document.querySelector('.catalog-card__top')?.textContent).toBe('T');
		expect(document.querySelector('.catalog-card__eyebrow')?.textContent).toBe('E');
		expect(document.querySelector('.catalog-card__intro')?.textContent).toContain('I');
		expect(document.querySelector('.catalog-card__detail')?.textContent).toBe('D');
		expect(document.querySelector('.catalog-card__footer')?.textContent).toContain('F');
	});

	it('keeps the CTA decorative (aria-hidden) with a configurable label, so the title is the only link', async () => {
		render(CatalogCard, { title: titleSnippet, ctaLabel: 'Read article' });

		const cta = document.querySelector('.catalog-card__cta') as HTMLElement;
		expect(cta.getAttribute('aria-hidden')).toBe('true');
		expect(cta.textContent).toContain('Read article');
		expect(document.querySelectorAll('article a').length).toBe(1);
	});

	it('is dark by default and light only when asked (tone)', async () => {
		render(CatalogCard, { title: titleSnippet });
		expect(document.querySelector('article')?.classList.contains('is-light')).toBe(false);
	});

	it('applies the light tone class on light sections', async () => {
		render(CatalogCard, { title: titleSnippet, tone: 'light' });
		expect(document.querySelector('article')?.classList.contains('is-light')).toBe(true);
	});

	it('uses the stack layout by default and the cover layout only when asked', async () => {
		render(CatalogCard, { title: titleSnippet });
		expect(document.querySelector('article')?.classList.contains('is-cover')).toBe(false);
	});

	it('applies the cover layout class and keeps title, media and footer regions in order', async () => {
		render(CatalogCard, {
			props: { title: titleSnippet, layout: 'cover', media: text('M'), footer: text('F') }
		});
		const article = document.querySelector('article') as HTMLElement;
		expect(article.classList.contains('is-cover')).toBe(true);
		const regions = [...article.children].map((el) => el.className.split(' ')[0]);
		expect(regions).toEqual(['catalog-card__media', 'catalog-card__body', 'catalog-card__footer']);
	});

	it('marks featured cards, merges the class prop and forwards rest attributes', async () => {
		render(CatalogCard, {
			title: titleSnippet,
			featured: true,
			class: ['host', { 'is-extra': true }],
			'data-testid': 'shell',
			id: 'card-1'
		} as never);

		const article = document.querySelector('article') as HTMLElement;
		expect(article.classList.contains('catalog-card')).toBe(true);
		expect(article.classList.contains('is-featured')).toBe(true);
		expect(article.classList.contains('host')).toBe(true);
		expect(article.classList.contains('is-extra')).toBe(true);
		expect(article.getAttribute('data-testid')).toBe('shell');
		expect(article.id).toBe('card-1');
	});
});
