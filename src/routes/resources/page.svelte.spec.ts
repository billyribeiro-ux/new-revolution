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
	it('renders the hero H1, 6 resource category cards, 24 resource items, and bottom CTA', async () => {
		const data = runLoad();
		render(Page, { data: data as never });

		const h1 = page.getByRole('heading', {
			level: 1,
			name: /Free Trading Resources/i
		});
		await expect.element(h1).toBeInTheDocument();

		const cards = document.querySelectorAll('.resource-card');
		expect(cards.length).toBe(6);

		const items = document.querySelectorAll('.resource-card__item');
		expect(items.length).toBe(24);

		await expect
			.element(page.getByRole('heading', { level: 3, name: 'Beginner Guides' }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('heading', { level: 3, name: 'Free Tools' }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('heading', { level: 3, name: 'Video Tutorials' }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('heading', { level: 3, name: 'Market Analysis' }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('heading', { level: 3, name: 'Trading Psychology' }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('heading', { level: 3, name: 'FAQ & Support' }))
			.toBeInTheDocument();

		const ctaHeading = page.getByRole('heading', {
			level: 2,
			name: /Ready to Take the Next Step\?/i
		});
		await expect.element(ctaHeading).toBeInTheDocument();

		const ctaLink = page.getByRole('link', { name: /Get Started Free/i });
		await expect.element(ctaLink).toBeInTheDocument();
		await expect.element(ctaLink).toHaveAttribute('href', '/signup');
	});
});
