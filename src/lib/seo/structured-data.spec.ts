import { describe, expect, it } from 'vitest';
import {
	ABOUT_FAQ_ITEMS,
	DAY_TRADING_ROOM_FAQ_ITEMS,
	MENTORSHIP_FAQ_ITEMS,
	MISSION_FAQ_ITEMS,
	SWING_TRADING_ROOM_FAQ_ITEMS,
	buildAboutJsonLd,
	buildDayTradingRoomJsonLd,
	buildMentorshipJsonLd,
	buildMissionJsonLd,
	buildSwingTradingRoomJsonLd
} from './structured-data.ts';

const ORIGIN = 'https://example.com';

type Node = Record<string, unknown>;

function collectRefs(value: unknown, refs: Set<string>) {
	if (Array.isArray(value)) {
		for (const item of value) collectRefs(item, refs);
	} else if (value && typeof value === 'object') {
		const obj = value as Node;
		if (typeof obj['@id'] === 'string' && Object.keys(obj).length === 1) refs.add(obj['@id']);
		for (const v of Object.values(obj)) collectRefs(v, refs);
	}
}

function collectDefinedIds(value: unknown, ids: Set<string>) {
	if (Array.isArray(value)) {
		for (const item of value) collectDefinedIds(item, ids);
	} else if (value && typeof value === 'object') {
		const obj = value as Node;
		if (typeof obj['@id'] === 'string' && Object.keys(obj).length > 1) ids.add(obj['@id']);
		for (const v of Object.values(obj)) collectDefinedIds(v, ids);
	}
}

describe('buildAboutJsonLd', () => {
	const graph = buildAboutJsonLd(ORIGIN)['@graph'] as Node[];

	it('is JSON-serialisable and every @id reference resolves inside the graph', () => {
		expect(() => JSON.parse(JSON.stringify(graph))).not.toThrow();
		const refs = new Set<string>();
		const ids = new Set<string>();
		collectRefs(graph, refs);
		collectDefinedIds(graph, ids);
		expect([...refs].filter((ref) => !ids.has(ref))).toEqual([]);
	});

	it('defines each node @id only once', () => {
		const topIds = graph.map((n) => n['@id']);
		expect(new Set(topIds).size).toBe(topIds.length);
	});

	it('contains the entities required for the about page', () => {
		const types = graph.flatMap((n) => (Array.isArray(n['@type']) ? n['@type'] : [n['@type']]));
		for (const t of [
			'EducationalOrganization',
			'Person',
			'WebSite',
			'AboutPage',
			'BreadcrumbList',
			'FAQPage'
		]) {
			expect(types).toContain(t);
		}
	});

	it('keeps FAQ schema in sync with the visible FAQ source', () => {
		const faq = graph.find((n) => n['@type'] === 'FAQPage') as Node;
		const questions = faq.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
		expect(questions.map((q) => q.name)).toEqual(ABOUT_FAQ_ITEMS.map((i) => i.question));
		expect(questions.map((q) => q.acceptedAnswer.text)).toEqual(
			ABOUT_FAQ_ITEMS.map((i) => i.answer)
		);
	});

	it('uses absolute URLs in breadcrumbs', () => {
		const crumbs = graph.find((n) => n['@type'] === 'BreadcrumbList') as Node;
		for (const item of crumbs.itemListElement as { item: string }[]) {
			expect(item.item.startsWith(ORIGIN)).toBe(true);
		}
	});
});

describe('buildMissionJsonLd', () => {
	const graph = buildMissionJsonLd(ORIGIN)['@graph'] as Node[];

	it('resolves every @id reference inside the graph', () => {
		const refs = new Set<string>();
		const ids = new Set<string>();
		collectRefs(graph, refs);
		collectDefinedIds(graph, ids);
		expect([...refs].filter((ref) => !ids.has(ref))).toEqual([]);
	});

	it('is a WebPage about the organization, not a profile page', () => {
		const page = graph.find((n) => n['@id'] === `${ORIGIN}/our-mission#webpage`) as Node;
		expect(page['@type']).toBe('WebPage');
		expect(page.about).toEqual({ '@id': `${ORIGIN}/#organization` });
		expect(page.mainEntity).toBeUndefined();
	});

	it('keeps FAQ schema in sync with the visible FAQ source', () => {
		const faq = graph.find((n) => n['@type'] === 'FAQPage') as Node;
		const questions = faq.mainEntity as { name: string }[];
		expect(questions.map((q) => q.name)).toEqual(MISSION_FAQ_ITEMS.map((i) => i.question));
	});
});

describe('buildMentorshipJsonLd', () => {
	const graph = buildMentorshipJsonLd(ORIGIN)['@graph'] as Node[];

	it('resolves every @id reference inside the graph', () => {
		const refs = new Set<string>();
		const ids = new Set<string>();
		collectRefs(graph, refs);
		collectDefinedIds(graph, ids);
		expect([...refs].filter((ref) => !ids.has(ref))).toEqual([]);
	});

	it('describes the mentorship as a Service for all three audiences', () => {
		const service = graph.find((n) => n['@id'] === `${ORIGIN}/mentorship#service`) as Node;
		expect(service['@type']).toBe('Service');
		expect(service.audience).toHaveLength(3);
	});

	it('keeps FAQ schema in sync with the visible FAQ source', () => {
		const faq = graph.find((n) => n['@type'] === 'FAQPage') as Node;
		const questions = faq.mainEntity as { name: string }[];
		expect(questions.map((q) => q.name)).toEqual(MENTORSHIP_FAQ_ITEMS.map((i) => i.question));
	});
});

describe('buildDayTradingRoomJsonLd', () => {
	const graph = buildDayTradingRoomJsonLd(ORIGIN)['@graph'] as Node[];

	it('is JSON-serialisable and every @id reference resolves inside the graph', () => {
		expect(() => JSON.parse(JSON.stringify(graph))).not.toThrow();
		const refs = new Set<string>();
		const ids = new Set<string>();
		collectRefs(graph, refs);
		collectDefinedIds(graph, ids);
		expect([...refs].filter((ref) => !ids.has(ref))).toEqual([]);
	});

	it('defines each top-level node @id only once', () => {
		const topIds = graph.map((n) => n['@id']);
		expect(new Set(topIds).size).toBe(topIds.length);
	});

	it('describes the Day Trading Room as a Service linked from the WebPage', () => {
		const page = graph.find(
			(n) => n['@id'] === `${ORIGIN}/live-trading-rooms/day-trading-room#webpage`
		) as Node;
		expect(page['@type']).toBe('WebPage');
		expect(page.about).toEqual({
			'@id': `${ORIGIN}/live-trading-rooms/day-trading-room#service`
		});

		const service = graph.find(
			(n) => n['@id'] === `${ORIGIN}/live-trading-rooms/day-trading-room#service`
		) as Node;
		expect(service['@type']).toBe('Service');
		expect(service.provider).toEqual({ '@id': `${ORIGIN}/#organization` });
	});

	it('keeps FAQ schema in sync with the visible FAQ source (5 questions)', () => {
		const faq = graph.find((n) => n['@type'] === 'FAQPage') as Node;
		const questions = faq.mainEntity as { name: string }[];
		expect(questions).toHaveLength(5);
		expect(questions.map((q) => q.name)).toEqual(DAY_TRADING_ROOM_FAQ_ITEMS.map((i) => i.question));
	});
});

describe('buildSwingTradingRoomJsonLd', () => {
	const graph = buildSwingTradingRoomJsonLd(ORIGIN)['@graph'] as Node[];

	it('is JSON-serialisable and every @id reference resolves inside the graph', () => {
		expect(() => JSON.parse(JSON.stringify(graph))).not.toThrow();
		const refs = new Set<string>();
		const ids = new Set<string>();
		collectRefs(graph, refs);
		collectDefinedIds(graph, ids);
		expect([...refs].filter((ref) => !ids.has(ref))).toEqual([]);
	});

	it('defines each top-level node @id only once', () => {
		const topIds = graph.map((n) => n['@id']);
		expect(new Set(topIds).size).toBe(topIds.length);
	});

	it('describes the Swing Trading Room as a Service linked from the WebPage', () => {
		const page = graph.find(
			(n) => n['@id'] === `${ORIGIN}/live-trading-rooms/swing-trading-room#webpage`
		) as Node;
		expect(page['@type']).toBe('WebPage');
		expect(page.about).toEqual({
			'@id': `${ORIGIN}/live-trading-rooms/swing-trading-room#service`
		});

		const service = graph.find(
			(n) => n['@id'] === `${ORIGIN}/live-trading-rooms/swing-trading-room#service`
		) as Node;
		expect(service['@type']).toBe('Service');
		expect(service.provider).toEqual({ '@id': `${ORIGIN}/#organization` });
	});

	it('keeps FAQ schema in sync with the visible FAQ source (5 questions)', () => {
		const faq = graph.find((n) => n['@type'] === 'FAQPage') as Node;
		const questions = faq.mainEntity as { name: string }[];
		expect(questions).toHaveLength(5);
		expect(questions.map((q) => q.name)).toEqual(
			SWING_TRADING_ROOM_FAQ_ITEMS.map((i) => i.question)
		);
	});
});
