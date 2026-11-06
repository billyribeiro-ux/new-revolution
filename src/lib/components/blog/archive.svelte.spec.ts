import { describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser';
import { render } from 'vitest-browser-svelte';
import '../../../app.css';
import type { BlogListing } from '#lib/shared/blog/discovery';
import ArchiveControls from './ArchiveControls.svelte';
import ArchiveResults from './ArchiveResults.svelte';

const listing: BlogListing = {
	featuredPosts: [],
	posts: [
		{
			id: 1,
			title: 'Risk management guide',
			slug: 'risk-management-guide',
			excerpt: 'Defined risk and trade planning.'
		}
	],
	search: 'gamma & risk',
	pagination: { page: 2, perPage: 12, total: 13, totalPages: 3 }
};

describe('Shared blog archive controls and results', () => {
	it('shows a sole featured article without an empty More articles section', async () => {
		await render(ArchiveResults, {
			listing: {
				...listing,
				featuredPosts: listing.posts,
				posts: [],
				search: '',
				pagination: { page: 1, perPage: 12, total: 1, totalPages: 1 }
			},
			basePath: '/blog'
		});
		await expect.element(page.getByRole('heading', { name: 'Featured article' })).toBeVisible();
		expect(document.querySelectorAll('.blog-post-card')).toHaveLength(1);
		expect(document.querySelector('.articles-section, .archive-empty, .pagination-nav')).toBeNull();
		expect(document.body.textContent).not.toContain('More articles');
	});

	it.each([1, 2])(
		'counts only the %i regular articles beneath the featured lead',
		async (regularCount) => {
			await render(ArchiveResults, {
				listing: {
					...listing,
					featuredPosts: listing.posts,
					posts: Array.from({ length: regularCount }, (_, i) => ({
						id: i + 2,
						title: `Article ${i + 2}`,
						slug: `article-${i + 2}`
					})),
					search: '',
					pagination: { page: 1, perPage: 12, total: regularCount + 1, totalPages: 1 }
				},
				basePath: '/blog'
			});
			await expect.element(page.getByRole('heading', { name: 'More articles' })).toBeVisible();
			await expect
				.element(page.getByRole('status'))
				.toHaveTextContent(`${regularCount} ${regularCount === 1 ? 'article' : 'articles'}`);
			expect(document.querySelectorAll('.featured-section .blog-post-card')).toHaveLength(1);
			expect(document.querySelectorAll('.articles-section .blog-post-card')).toHaveLength(
				regularCount
			);
		}
	);

	it('retains the honest empty archive when there are no published articles', async () => {
		await render(ArchiveResults, {
			listing: {
				...listing,
				posts: [],
				search: '',
				pagination: { page: 1, perPage: 12, total: 0, totalPages: 1 }
			},
			basePath: '/blog'
		});
		await expect
			.element(page.getByRole('heading', { name: 'Articles', exact: true }))
			.toBeVisible();
		await expect.element(page.getByRole('status')).toHaveTextContent('0 articles');
		await expect.element(page.getByText('Articles will appear here once published.')).toBeVisible();
		expect(
			document.querySelector('.featured-section, .blog-post-card, .pagination-nav')
		).toBeNull();
	});

	it('fits two readable capped cards into a 712px intermediate collection', async () => {
		await render(ArchiveResults, {
			listing: {
				...listing,
				posts: [...listing.posts, { id: 2, title: 'Another article', slug: 'another-article' }]
			},
			basePath: '/blog'
		});
		const collection = document.querySelector<HTMLElement>('.articles-grid')!;
		collection.style.inlineSize = '712px';
		const boxes = [...collection.querySelectorAll('.blog-post-card')].map((card) =>
			card.getBoundingClientRect()
		);
		expect(boxes[0].width).toBe(344);
		expect(boxes[1].width).toBe(344);
		expect(boxes[1].x - boxes[0].right).toBe(24);
		expect(boxes[0].y).toBe(boxes[1].y);
	});

	it('submits a native GET on the current archive and preserves search while changing topics', async () => {
		await render(ArchiveControls, {
			basePath: '/blog/tag/risk-management',
			search: listing.search,
			topics: [
				{ id: 1, name: 'Risk management', postCount: 13, path: '/blog/tag/risk-management' },
				{ id: 2, name: 'Options', postCount: 7, path: '/blog/tag/options' }
			]
		});
		const form = document.querySelector('form')!;
		expect(form.getAttribute('method')).toBe('GET');
		expect(form.getAttribute('action')).toBe('/blog/tag/risk-management');
		await expect
			.element(page.getByRole('searchbox', { name: 'Search articles' }))
			.toHaveValue(listing.search);
		await expect
			.element(page.getByRole('link', { name: 'Options (7)' }))
			.toHaveAttribute('href', '/blog/tag/options?search=gamma+%26+risk');
		await expect
			.element(page.getByRole('link', { name: 'All articles', exact: true }))
			.toHaveAttribute('href', '/blog?search=gamma+%26+risk');
		await expect
			.element(page.getByRole('link', { name: 'Clear search', exact: true }))
			.toHaveAttribute('href', '/blog/tag/risk-management');
		expect(document.querySelector('[aria-current="page"]')?.textContent).toContain(
			'Risk management'
		);
		expect(document.body.textContent).not.toContain('#Risk');
	});

	it('keeps query and archive scope in both pagination directions and caps a single wide result', async () => {
		await render(ArchiveResults, { listing, basePath: '/blog/category/options' });
		await expect.element(page.getByRole('status')).toHaveTextContent('13 articles found');
		await expect
			.element(page.getByRole('link', { name: 'Previous page' }))
			.toHaveAttribute('href', '/blog/category/options?search=gamma+%26+risk');
		await expect
			.element(page.getByRole('link', { name: 'Next page' }))
			.toHaveAttribute('href', '/blog/category/options?search=gamma+%26+risk&page=3');
		expect(document.querySelector('.articles-grid.is-single')).not.toBeNull();
		expect(
			document.querySelector('.blog-post-card.is-lead')?.getBoundingClientRect().width
		).toBeLessThanOrEqual(1200);
	});

	it('offers an honest empty search state with a scope-preserving reset', async () => {
		await render(ArchiveResults, {
			listing: {
				...listing,
				posts: [],
				pagination: { ...listing.pagination, page: 1, total: 0, totalPages: 1 }
			},
			basePath: '/blog/tag/risk-management'
		});
		await expect.element(page.getByText('No published articles match this search.')).toBeVisible();
		await expect.element(page.getByRole('status')).toHaveTextContent('0 articles found');
		await expect
			.element(page.getByRole('link', { name: 'Clear search and browse this archive' }))
			.toHaveAttribute('href', '/blog/tag/risk-management');
		expect(document.querySelector('aside, .blog-post-card, .pagination-nav')).toBeNull();
	});
});
