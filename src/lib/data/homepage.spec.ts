import { describe, expect, it } from 'vite-plus/test';
import {
	MAIN_NAVIGATION,
	DOCUMENTATION_STANDARD_ITEMS,
	TRUST_BAR_METRICS,
	VERIFIED_CASE_STUDIES,
	isPublishableCaseStudy,
	type VerifiedCaseStudy,
	MANIFESTO_NEGATIVE_POINTS,
	MANIFESTO_POSITIVE_POINTS,
	TRADER_PERSONAS,
	MEMBERSHIP_TIERS,
	STORE_TOOLS,
	MENTORSHIP_STEPS,
	EBOOK_TAKEAWAYS,
	EBOOK_PROFILES,
	FAQ_ITEMS,
	CLOSING_CONTENT,
	FOOTER_COLUMNS
} from './homepage.ts';
import { FREE_EBOOK_AVAILABLE } from './launch-gate.ts';

describe('homepage data and navigation taxonomy', () => {
	it('shows only launched navigation: the Store dropdown and Blogs link are gated (launch-gate.ts)', () => {
		expect(MAIN_NAVIGATION.map((item) => item.label)).toEqual([
			'Live Trading Rooms',
			'Alert Services',
			'Mentorship',
			'Our Mission',
			'About',
			'Resources'
		]);

		const [liveTradingRooms, alertServices, mentorship, ourMission, about, resources] =
			MAIN_NAVIGATION;

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
		expect(ourMission.children).toBeUndefined();
		expect(ourMission.href).toBe('/our-mission');
		expect(about.children).toBeUndefined();
		expect(about.href).toBe('/about');

		expect(resources.children?.map((c) => c.label)).toEqual([
			'Options Calculator',
			'ETF Stocks List',
			'Stock Indexes List'
		]);

		const allHrefs = MAIN_NAVIGATION.flatMap((item) => [
			...(item.href ? [item.href] : []),
			...(item.children?.map((c) => c.href) ?? [])
		]);
		expect(
			allHrefs.filter((href) => href.startsWith('/store') || href.startsWith('/blog'))
		).toEqual([]);
	});

	it('provides complete structured data for all 11 homepage sections and footer', () => {
		expect(DOCUMENTATION_STANDARD_ITEMS).toHaveLength(3);
		expect(TRUST_BAR_METRICS).toHaveLength(4);
		expect(VERIFIED_CASE_STUDIES).toHaveLength(0);
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
		expect(FAQ_ITEMS).toHaveLength(5);
		expect(CLOSING_CONTENT.primaryCta.href).toBe('/live-trading-rooms/day-trading-room');
		expect(CLOSING_CONTENT.secondaryCta.href).toBe('/mentorship');
		expect(FOOTER_COLUMNS).toHaveLength(5);

		const legalCol = FOOTER_COLUMNS.find((col) => col.id === 'footer-legal');
		expect(legalCol?.links.map((l) => l.href)).toEqual([
			'/contact',
			'/editorial-policy',
			'/privacy-policy',
			'/terms-of-service',
			'/terms-of-service#options-leverage-risk-disclosure',
			'/refund-policy'
		]);
	});

	it('keeps gated routes and the unwritten eBook out of every footer column', () => {
		const hrefs = FOOTER_COLUMNS.flatMap((col) => col.links.map((l) => l.href));
		expect(hrefs.filter((href) => href.startsWith('/store') || href.startsWith('/blog'))).toEqual(
			[]
		);
		expect(FREE_EBOOK_AVAILABLE).toBe(false);
		expect(FOOTER_COLUMNS.flatMap((col) => col.links.map((l) => l.label))).not.toContain(
			'Free Trading eBook'
		);

		// "Our Mission" is all that is left in the former Store column, so it must not still say "STORE & TOOLS".
		const storeColumn = FOOTER_COLUMNS.find((col) => col.id === 'footer-store');
		expect(storeColumn?.title).toBe('COMPANY');
		expect(storeColumn?.links.map((l) => l.href)).toEqual(['/our-mission']);
	});

	it('ships no placeholder or authoring-prompt copy in the proof panel or trust bar', () => {
		const copy = JSON.stringify([DOCUMENTATION_STANDARD_ITEMS, TRUST_BAR_METRICS]);
		expect(copy).not.toMatch(/pending|should be published|to support with|reserves room|preview/i);
	});
});

describe('case study publish gate', () => {
	const complete: VerifiedCaseStudy = {
		id: 'fixture',
		kicker: '01 / FIXTURE',
		title: 'Fixture trade',
		summary: 'A fully documented fixture, used only by this test.',
		contractSymbol: 'FIXTURE260116P00060000',
		strike: '$60.00',
		expiration: '2026-01-16',
		enteredAt: '2026-01-14T15:42:10-05:00',
		exitedAt: '2026-01-15T09:35:00-05:00',
		positionSize: '5 contracts',
		maxRisk: '$850 (premium paid)',
		result: 'Fixture result',
		chart: { src: '/fixture.webp', width: 1200, height: 675, alt: 'Fixture chart alt text' }
	};

	it('has no records until real evidence exists (nothing is invented)', () => {
		expect(VERIFIED_CASE_STUDIES).toEqual([]);
	});

	it('accepts a complete record', () => {
		expect(isPublishableCaseStudy(complete)).toBe(true);
	});

	it.each([
		['blank contract symbol', { contractSymbol: '  ' }],
		['blank max risk', { maxRisk: '' }],
		['blank chart alt', { chart: { ...complete.chart, alt: '' } }],
		['date-only entry time', { enteredAt: '2026-01-14' }],
		['timestamp without an offset', { exitedAt: '2026-01-15T09:35:00' }],
		['impossible expiration date', { expiration: '2026-13-45' }],
		['non-existent calendar day', { expiration: '2026-02-31' }],
		['exit before entry', { exitedAt: '2026-01-13T09:35:00-05:00' }]
	])('rejects %s', (_label, override) => {
		expect(isPublishableCaseStudy({ ...complete, ...override })).toBe(false);
	});
});
