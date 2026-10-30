import { describe, expect, it } from 'vitest';
import {
	MAIN_NAVIGATION,
	PROOF_DOSSIER_ITEMS,
	TRUST_BAR_METRICS,
	CASE_STUDIES,
	MANIFESTO_NEGATIVE_POINTS,
	MANIFESTO_POSITIVE_POINTS,
	TRADER_PERSONAS,
	MEMBERSHIP_TIERS,
	STORE_TOOLS,
	MENTORSHIP_STEPS,
	EBOOK_TAKEAWAYS,
	EBOOK_PROFILES,
	BLOG_ARTICLES,
	FAQ_ITEMS,
	CLOSING_CONTENT,
	FOOTER_COLUMNS
} from './homepage.ts';

describe('homepage data and navigation taxonomy', () => {
	it('enforces the exact 8-item main navigation order and submenu items from menu-submenu.md', () => {
		expect(MAIN_NAVIGATION.map((item) => item.label)).toEqual([
			'Live Trading Rooms',
			'Alert Services',
			'Mentorship',
			'Store',
			'Our Mission',
			'About',
			'Blogs',
			'Resources'
		]);

		const [
			liveTradingRooms,
			alertServices,
			mentorship,
			store,
			ourMission,
			about,
			blogs,
			resources
		] = MAIN_NAVIGATION;

		expect(liveTradingRooms.children?.map((c) => c.label)).toEqual([
			'Day Trading Room',
			'Swing Trading Room',
			'Small Accounts Room'
		]);
		expect(alertServices.children?.map((c) => c.label)).toEqual([
			'SPX Profit Pulse',
			'Explosive Swings'
		]);
		expect(mentorship.children).toBeUndefined();
		expect(mentorship.href).toBe('/mentorship');

		expect(store.children?.map((c) => c.label)).toEqual(['Courses', 'Indicators', 'Scanners']);
		expect(ourMission.children).toBeUndefined();
		expect(ourMission.href).toBe('/our-mission');
		expect(about.children).toBeUndefined();
		expect(about.href).toBe('/about');
		expect(blogs.children).toBeUndefined();
		expect(blogs.href).toBe('/blogs');

		expect(resources.children?.map((c) => c.label)).toEqual([
			'Options Calculator',
			'ETF Stocks List',
			'Stock Indexes List'
		]);
	});

	it('provides complete structured data for all 11 homepage sections and footer', () => {
		expect(PROOF_DOSSIER_ITEMS).toHaveLength(3);
		expect(TRUST_BAR_METRICS).toHaveLength(4);
		expect(CASE_STUDIES).toHaveLength(3);
		expect(MANIFESTO_NEGATIVE_POINTS).toHaveLength(4);
		expect(MANIFESTO_POSITIVE_POINTS).toHaveLength(4);
		expect(TRADER_PERSONAS).toHaveLength(4);
		expect(MEMBERSHIP_TIERS).toHaveLength(4);
		expect(MEMBERSHIP_TIERS.filter((t) => t.featured)).toHaveLength(1);
		expect(STORE_TOOLS).toHaveLength(2);
		expect(STORE_TOOLS.map((t) => t.href)).toEqual(['/store/indicators', '/store/courses']);
		expect(MENTORSHIP_STEPS).toHaveLength(3);
		expect(EBOOK_TAKEAWAYS).toHaveLength(4);
		expect(EBOOK_PROFILES.length).toBeGreaterThanOrEqual(4);
		expect(BLOG_ARTICLES).toHaveLength(3);
		expect(BLOG_ARTICLES.map((b) => b.href)).toEqual([
			'/blogs/how-we-shorted-oxy-put-options-600-percent-overnight',
			'/blogs/growing-a-500-dollar-small-options-account-without-blowing-up',
			'/blogs/swing-trading-options-with-a-full-time-job-watchlist-routine'
		]);
		expect(FAQ_ITEMS).toHaveLength(5);
		expect(CLOSING_CONTENT.primaryCta.href).toBe('/memberships');
		expect(CLOSING_CONTENT.secondaryCta.href).toBe('/mentorship');
		expect(FOOTER_COLUMNS).toHaveLength(5);

		const legalCol = FOOTER_COLUMNS.find((col) => col.id === 'footer-legal');
		expect(legalCol?.links.map((l) => l.href)).toEqual([
			'/contact',
			'/privacy-policy',
			'/terms-of-service'
		]);
	});
});
