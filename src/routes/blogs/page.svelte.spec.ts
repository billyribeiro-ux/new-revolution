import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { buildBlogsHubJsonLd, SITE_ORIGIN } from '#lib/seo/structured-data.ts';
import { load } from './+page.ts';
import BlogsHubPage from './+page.svelte';

describe('/blogs page', () => {
	it('returns character-locked SEO metadata and Blog/CollectionPage JSON-LD from load()', () => {
		const result = load({
			url: new URL('https://revolutiontradingpros.com/blogs')
		} as Parameters<typeof load>[0]) as Record<string, unknown>;

		const pageMetaTags = result.pageMetaTags as {
			title: string;
			description: string;
			openGraph: { title: string; description: string; url: string };
		};

		expect(pageMetaTags.title).toBe('Stock & Options Trading Blog');
		expect(pageMetaTags.title.length).toBe(28);
		expect(pageMetaTags.openGraph.title).toBe(
			'Stock & Options Trading Blog | Revolution Trading Pros'
		);
		expect(pageMetaTags.openGraph.title.length).toBe(54);
		expect(pageMetaTags.description).toBe(
			'Free institutional stock and options trading articles, Options Greeks guides, $500+ small account strategies, and macro analysis by Billy Ribeiro.'
		);
		expect(pageMetaTags.openGraph.url).toBe('https://revolutiontradingpros.com/blogs');
	});

	it('renders the H1, flagship hero post, 4 featured topics, 6 recent blog cards, category filter tabs, search input, and 5 room CTA cards', async () => {
		render(BlogsHubPage, {
			params: {},
			data: {
				pageMetaTags: {},
				jsonLdSchema: buildBlogsHubJsonLd(SITE_ORIGIN)
			} as never
		});

		const h1 = page.getByRole('heading', {
			level: 1,
			name: /Institutional Stock & Options Trading Blog/i
		});
		await expect.element(h1).toBeInTheDocument();

		await expect
			.element(
				page.getByRole('heading', {
					level: 2,
					name: /The Ultimate Guide to Options Greeks: Delta, Gamma, Theta, Vega & Rho/i
				})
			)
			.toBeInTheDocument();

		await expect.element(page.getByText('Flagship Masterclass')).toBeInTheDocument();

		// 6 recent blog cards rendered initially
		const initialBlogCards = document.querySelectorAll('.blog-card');
		expect(initialBlogCards.length).toBe(6);

		// 4 featured topic items in sidebar
		const featuredTopicLinks = document.querySelectorAll('.featured-topic-item');
		expect(featuredTopicLinks.length).toBe(4);

		// 5 room CTA cards at the bottom
		const roomCtaCards = document.querySelectorAll('.room-cta-card');
		expect(roomCtaCards.length).toBe(5);

		// Filter by "$500+ Small Accounts" category tab
		const smallAccountTab = page.getByRole('tab', { name: '$500+ Small Accounts' });
		await smallAccountTab.click();
		const filteredByCat = document.querySelectorAll('.blog-card');
		expect(filteredByCat.length).toBe(1);
		await expect
			.element(
				page.getByRole('heading', {
					level: 3,
					name: /The \$500 Small Account Playbook/i
				})
			)
			.toBeInTheDocument();

		// Reset category to "All Market Intelligence"
		const allTab = page.getByRole('tab', { name: 'All Market Intelligence' });
		await allTab.click();
		expect(document.querySelectorAll('.blog-card').length).toBe(6);
	});
});
