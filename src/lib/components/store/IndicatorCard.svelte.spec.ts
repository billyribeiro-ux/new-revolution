import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { indicatorsCatalog } from '#lib/data/indicators.ts';
import IndicatorCard from './IndicatorCard.svelte';

const flagship = indicatorsCatalog[0];
const regular = indicatorsCatalog[1];

describe('IndicatorCard', () => {
	it('is one article named by its title link, targeting the typed detail route', async () => {
		render(IndicatorCard, { indicator: regular });

		await expect.element(page.getByRole('article', { name: regular.name })).toBeInTheDocument();
		await expect
			.element(page.getByRole('link', { name: regular.name }))
			.toHaveAttribute('href', `/store/indicators/${regular.slug}`);
		expect(document.querySelectorAll('article a').length).toBe(1);
	});

	it('renders the platforms as a labelled list and the chart as decorative art', async () => {
		render(IndicatorCard, { indicator: regular });

		const chips = document.querySelectorAll('ul[aria-label="Supported platforms"] > li');
		expect(chips.length).toBe(regular.platforms.split(' • ').length);
		const svg = document.querySelector('svg.chart') as SVGElement;
		expect(svg.getAttribute('aria-hidden')).toBe('true');
		expect(svg.getAttribute('width')).toBe('320');
		expect(svg.getAttribute('height')).toBe('96');
	});

	it('keeps the specs crawlable: all spec rows are in the DOM, open only on the featured card', async () => {
		render(IndicatorCard, { indicator: regular });
		const closed = document.querySelector('details') as HTMLDetailsElement;
		expect(closed.open).toBe(false);
		expect(closed.querySelectorAll('dl > div').length).toBe(3);
		expect(closed.textContent).toContain(regular.timeframes);
	});

	it('opens the specs by default and marks the lead card when featured', async () => {
		render(IndicatorCard, { indicator: flagship });
		expect(flagship.featured).toBe(true);
		expect((document.querySelector('details') as HTMLDetailsElement).open).toBe(true);
		expect(document.querySelector('article')?.classList.contains('is-featured')).toBe(true);
	});

	it('forwards class and rest attributes to the card', async () => {
		render(IndicatorCard, {
			indicator: regular,
			class: 'host',
			'data-testid': 'ind'
		} as never);
		const article = document.querySelector('article') as HTMLElement;
		expect(article.classList.contains('indicator-card')).toBe(true);
		expect(article.classList.contains('host')).toBe(true);
		expect(article.getAttribute('data-testid')).toBe('ind');
		expect(article.id).toBe(regular.id);
	});
});
