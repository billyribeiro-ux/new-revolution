import { describe, expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser';
import { render } from 'vitest-browser-svelte';
import { emptyBlogListing, type BlogListing } from '#lib/shared/blog/discovery';
import BlogSection from './BlogSection.svelte';

const listing: BlogListing = {
	featuredPosts: [
		{ id: 1, slug: 'featured-research', title: 'Featured research', excerpt: 'Featured summary.' }
	],
	posts: [{ id: 2, slug: 'latest-research', title: 'Latest research', excerpt: 'Latest summary.' }],
	search: '',
	pagination: { page: 1, perPage: 6, total: 8, totalPages: 2 }
};

describe('Homepage CMS blog discovery', () => {
	it('renders the featured article above distinct regular articles with real detail links', async () => {
		await render(BlogSection, { listing });
		const ids = [...document.querySelectorAll('.blog-post-card')].map((node) =>
			node.getAttribute('data-post-id')
		);
		expect(ids).toEqual(['1', '2']);
		await expect
			.element(page.getByRole('link', { name: 'Latest research', exact: true }))
			.toHaveAttribute('href', '/blog/latest-research');
		expect(document.querySelector('[data-testid="home-featured-post"] .is-lead')).not.toBeNull();
	});

	it('keeps older articles reachable and returns page two to the bare homepage anchor', async () => {
		await render(BlogSection, {
			listing: { ...listing, featuredPosts: [], pagination: { ...listing.pagination, page: 2 } }
		});
		await expect
			.element(page.getByRole('link', { name: 'Newer articles' }))
			.toHaveAttribute('href', '/#blog');
		expect(document.querySelector('[data-testid="home-featured-post"]')).toBeNull();
	});

	it('shows an honest empty state without resurrecting hardcoded article cards', async () => {
		await render(BlogSection, { listing: emptyBlogListing() });
		await expect.element(page.getByText('Articles will appear here once published.')).toBeVisible();
		expect(document.querySelectorAll('.blog-post-card')).toHaveLength(0);
		expect(document.querySelector('svg text')).toBeNull();
	});

	it('distinguishes an unavailable collection from an empty collection', async () => {
		await render(BlogSection, { listing: emptyBlogListing(), unavailable: true });
		await expect
			.element(page.getByRole('status'))
			.toHaveTextContent('Articles are temporarily unavailable. Please try again later.');
		expect(document.body.textContent).not.toContain('Articles will appear here once published.');
	});
});
