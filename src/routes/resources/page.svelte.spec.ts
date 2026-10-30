import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import { load } from './+page';

function runLoad() {
	const url = new URL('https://revolutiontradingpros.com/resources');
	return load({ url } as Parameters<typeof load>[0]) as Record<string, unknown>;
}

describe('/resources/+page.ts load()', () => {
	it('returns character-locked SEO meta tags and JSON-LD schema for /resources', () => {
		const result = runLoad();
		const pageMetaTags = result.pageMetaTags as {
			title: string;
			description: string;
			openGraph: { title: string; description: string; url: string };
		};

		// 30 chars before suffix -> 56 chars total with " | Revolution Trading Pros"
		expect(pageMetaTags.title).toBe('Free Trading Resources & Tools');
		expect(pageMetaTags.openGraph.title).toBe(
			'Free Trading Resources & Tools | Revolution Trading Pros'
		);
		expect(pageMetaTags.openGraph.title.length).toBe(56);

		// 148 chars description
		expect(pageMetaTags.description).toBe(
			'Free stock, ETF, and options trading resources. Access beginner guides, position size and options calculators, video tutorials, and market analysis.'
		);
		expect(pageMetaTags.description.length).toBe(148);
		expect(pageMetaTags.openGraph.url).toBe('https://revolutiontradingpros.com/resources');
		expect(result.jsonLdSchema).toBeDefined();
	});
});

describe('/resources/+page.svelte component', () => {
	it('renders the hero H1, 3 flagship utilities, 6 resource categories with exact H3 headings, 24 resource items, and bottom CTA banner', async () => {
		const data = runLoad();
		render(Page, { data: data as never });

		const h1 = page.getByRole('heading', {
			level: 1,
			name: /Free Trading Resources/i
		});
		await expect.element(h1).toBeInTheDocument();

		const utilityCards = document.querySelectorAll('.flagship-utility-card');
		expect(utilityCards.length).toBe(3);

		const resourceCards = document.querySelectorAll('.resource-card');
		expect(resourceCards.length).toBe(6);

		const expectedCategories = [
			'Beginner Guides',
			'Free Tools',
			'Video Tutorials',
			'Market Analysis',
			'Trading Psychology',
			'FAQ & Support'
		];
		for (const cat of expectedCategories) {
			const h3 = page.getByRole('heading', { level: 3, name: cat });
			await expect.element(h3).toBeInTheDocument();
		}

		const resourceItems = document.querySelectorAll('.resource-card__item');
		expect(resourceItems.length).toBe(24);

		const ctaH2 = page.getByRole('heading', {
			level: 2,
			name: /Ready to Take the Next Step\?/i
		});
		await expect.element(ctaH2).toBeInTheDocument();

		const ctaLink = page.getByRole('link', { name: /Get Started Free/i });
		await expect.element(ctaLink).toHaveAttribute('href', '/signup');
	});
});
