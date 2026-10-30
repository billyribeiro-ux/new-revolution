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
		expect(pageMetaTags.title).toBe('Free Stock & Options Resources');
		expect(pageMetaTags.openGraph.title).toBe(
			'Free Stock & Options Resources | Revolution Trading Pros'
		);
		expect(pageMetaTags.openGraph.title.length).toBe(56);

		// 147 chars description
		expect(pageMetaTags.description).toBe(
			'Access free stock and options trading resources: our interactive Options Calculator, ETF Stocks List, Stock Indexes List, and institutional guides.'
		);
		expect(pageMetaTags.description.length).toBe(147);
		expect(pageMetaTags.openGraph.url).toBe('https://revolutiontradingpros.com/resources');
		expect(result.jsonLdSchema).toBeDefined();
	});
});

describe('/resources/+page.svelte component', () => {
	it('renders the hero H1, 3 flagship utilities, 6 vault categories, 24 resource links, 4 FAQs, and 5 bottom room cards', async () => {
		const data = runLoad();
		render(Page, { data: data as never });

		const h1 = page.getByRole('heading', {
			level: 1,
			name: /Free Stock, ETF & Options Trading Resources/i
		});
		await expect.element(h1).toBeInTheDocument();

		const utilityCards = document.querySelectorAll('.utility-card');
		expect(utilityCards.length).toBe(3);

		const vaultCards = document.querySelectorAll('.vault-card');
		expect(vaultCards.length).toBe(6);

		const vaultLinks = document.querySelectorAll('.vault-link');
		expect(vaultLinks.length).toBe(24);

		const faqItems = document.querySelectorAll('.faq-item');
		expect(faqItems.length).toBe(4);

		const roomCards = document.querySelectorAll('.room-cta-card');
		expect(roomCards.length).toBe(5);
	});
});
