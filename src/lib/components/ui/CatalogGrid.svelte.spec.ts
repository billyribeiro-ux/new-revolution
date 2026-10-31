import { createRawSnippet } from 'svelte';
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CatalogGrid from './CatalogGrid.svelte';

interface Item {
	id: string;
	name: string;
	lead?: boolean;
}

const cell = createRawSnippet<[Item]>((item) => ({
	render: () => `<span class="cell">${item().name}</span>`
}));

const items: Item[] = [
	{ id: 'a', name: 'Alpha', lead: true },
	{ id: 'b', name: 'Beta' },
	{ id: 'c', name: 'Gamma' }
];

describe('CatalogGrid', () => {
	it('renders a semantic list with one keyed item per entry, in order', async () => {
		render(CatalogGrid<Item>, {
			items,
			key: (i: Item) => i.id,
			total: 3,
			noun: 'things',
			children: cell
		});

		const li = [...document.querySelectorAll('ul.catalog-grid > li')];
		expect(li.map((n) => n.textContent)).toEqual(['Alpha', 'Beta', 'Gamma']);
	});

	it('announces the filtered count through a status region', async () => {
		render(CatalogGrid<Item>, {
			items: items.slice(0, 2),
			key: (i: Item) => i.id,
			total: 3,
			noun: 'things',
			children: cell
		});

		await expect.element(page.getByRole('status')).toHaveTextContent('Showing 2 of 3 things');
	});

	it('marks only featured items so the host grid can span them', async () => {
		render(CatalogGrid<Item>, {
			items,
			key: (i: Item) => i.id,
			isFeatured: (i: Item) => i.lead === true,
			total: 3,
			noun: 'things',
			children: cell
		});

		const featured = document.querySelectorAll('li.is-featured');
		expect(featured.length).toBe(1);
		expect(featured[0].textContent).toBe('Alpha');
	});

	it('shows the default and a custom empty message when there are no items', async () => {
		const first = await render(CatalogGrid<Item>, {
			items: [],
			key: (i: Item) => i.id,
			total: 3,
			noun: 'things',
			children: cell
		});
		expect(first.container.querySelector('.catalog-grid__empty')?.textContent).toBe(
			'No things match this filter.'
		);
	});

	it('marks the status and list light only on light sections', async () => {
		render(CatalogGrid<Item>, {
			items,
			key: (i: Item) => i.id,
			total: 3,
			noun: 'things',
			tone: 'light',
			children: cell
		});
		expect(document.querySelector('.catalog-grid__status')?.classList.contains('is-light')).toBe(
			true
		);
		expect(document.querySelector('ul.catalog-grid')?.classList.contains('is-light')).toBe(true);
	});

	it('uses a custom empty message when provided', async () => {
		render(CatalogGrid<Item>, {
			items: [],
			key: (i: Item) => i.id,
			total: 3,
			noun: 'things',
			emptyMessage: 'Nothing here.',
			children: cell
		});
		await expect.element(page.getByText('Nothing here.')).toBeInTheDocument();
	});
});
