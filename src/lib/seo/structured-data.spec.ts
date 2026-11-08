import { describe, expect, it, vi } from 'vite-plus/test';
import * as launchGate from '#lib/data/launch-gate.ts';
import {
	ABOUT_FAQ_ITEMS,
	COURSES_STORE_FAQ_ITEMS,
	DAY_TRADING_ROOM_FAQ_ITEMS,
	INDICATORS_STORE_FAQ_ITEMS,
	MENTORSHIP_FAQ_ITEMS,
	MISSION_FAQ_ITEMS,
	SCANNERS_STORE_FAQ_ITEMS,
	SINGLE_COURSE_FAQ_ITEMS,
	SINGLE_INDICATOR_FAQ_ITEMS,
	SINGLE_SCANNER_FAQ_ITEMS,
	SMALL_ACCOUNTS_ROOM_FAQ_ITEMS,
	SPX_PROFIT_PULSE_FAQ_ITEMS,
	STOCK_INDEXES_LIST_FAQ_ITEMS,
	SUNDAY_ALPHA_PROTOCOL_FAQ_ITEMS,
	SWING_TRADING_ROOM_FAQ_ITEMS,
	buildAboutJsonLd,
	buildBlogsHubJsonLd,
	buildContactPageJsonLd,
	buildCoursesStoreJsonLd,
	buildDayTradingRoomJsonLd,
	buildEditorialPolicyPageJsonLd,
	buildEtfStocksListJsonLd,
	buildHomepageJsonLd,
	buildIndicatorsStoreJsonLd,
	buildMentorshipJsonLd,
	buildMissionJsonLd,
	buildPrivacyPolicyPageJsonLd,
	buildRefundPolicyPageJsonLd,
	buildResourcesHubJsonLd,
	buildScannersStoreJsonLd,
	buildSingleCourseJsonLd,
	buildSingleIndicatorJsonLd,
	buildSingleScannerJsonLd,
	buildSmallAccountsRoomJsonLd,
	buildSpxProfitPulseJsonLd,
	buildStockIndexesListJsonLd,
	buildSundayAlphaProtocolJsonLd,
	buildSwingTradingRoomJsonLd,
	buildTermsOfServicePageJsonLd,
	escapeJsonLdBlocksInHtml,
	serializeJsonLd,
	buildFounderEntity,
	buildOrganizationEntity,
	isNoIndexRoute
} from './structured-data.ts';

const ORIGIN = 'https://example.com';

type Node = Record<string, unknown>;

const FORBIDDEN_TYPES = new Set([
	'FAQPage',
	'HowTo',
	'Course',
	'CourseInstance',
	'SpeakableSpecification',
	'SpecialAnnouncement',
	'ClaimReview'
]);

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

function collectTypes(value: unknown, types: Set<string>) {
	if (Array.isArray(value)) {
		for (const item of value) collectTypes(item, types);
	} else if (value && typeof value === 'object') {
		const obj = value as Node;
		const t = obj['@type'];
		if (typeof t === 'string') types.add(t);
		else if (Array.isArray(t)) {
			for (const entry of t) if (typeof entry === 'string') types.add(entry);
		}
		for (const v of Object.values(obj)) collectTypes(v, types);
	}
}

function assertGraphIntegrity(graph: Node[], options?: { isHomepage?: boolean }) {
	expect(() => JSON.parse(JSON.stringify(graph))).not.toThrow();
	const refs = new Set<string>();
	const ids = new Set<string>();
	const types = new Set<string>();
	collectRefs(graph, refs);
	collectDefinedIds(graph, ids);
	collectTypes(graph, types);
	expect([...refs].filter((ref) => !ids.has(ref))).toEqual([]);

	const topIds = graph.map((n) => n['@id']);
	expect(new Set(topIds).size).toBe(topIds.length);

	for (const forbidden of FORBIDDEN_TYPES) {
		expect(types.has(forbidden)).toBe(false);
	}

	const breadcrumbLists = graph.filter((n) => n['@type'] === 'BreadcrumbList');
	if (options?.isHomepage) {
		expect(breadcrumbLists).toHaveLength(0);
	} else {
		expect(breadcrumbLists).toHaveLength(1);
		const items = breadcrumbLists[0].itemListElement as Array<{
			'@type': string;
			position: number;
			name: string;
			item: string;
		}>;
		expect(items.length).toBeGreaterThanOrEqual(2);
		const itemUrls = new Set<string>();
		items.forEach((entry, idx) => {
			expect(entry['@type']).toBe('ListItem');
			expect(entry.position).toBe(idx + 1);
			expect(entry.name.trim().length).toBeGreaterThan(0);
			expect(entry.item.startsWith(ORIGIN)).toBe(true);
			itemUrls.add(entry.item);
		});
		expect(itemUrls.size).toBe(items.length);
	}
}

describe('JSON-LD XSS escaping (SD-02)', () => {
	it('escapes </script>, <!--, <, >, and & inside serializeJsonLd and escapeJsonLdBlocksInHtml while remaining valid JSON', () => {
		const payload = {
			'@context': 'https://schema.org',
			name: '</script><script>alert(1)</script> <!-- comment --> & test'
		};
		const serialized = serializeJsonLd(payload);
		expect(serialized).not.toContain('</script>');
		expect(serialized).not.toContain('<script>');
		expect(serialized).not.toContain('<!--');
		expect(serialized).toContain('\\u003c/script\\u003e');
		expect(JSON.parse(serialized)).toEqual(payload);

		const html = `<head><script type="application/ld+json">{"name":"</script><script>alert(1)</script>"}</script></head>`;
		const escapedHtml = escapeJsonLdBlocksInHtml(html);
		expect(escapedHtml).toContain(
			'\\u003c/script\\u003e\\u003cscript\\u003ealert(1)\\u003c/script\\u003e'
		);
	});
});

describe('Visible FAQ item data exports', () => {
	it('keeps non-empty visible FAQ arrays for native <details> accordions', () => {
		for (const faqList of [
			ABOUT_FAQ_ITEMS,
			MISSION_FAQ_ITEMS,
			MENTORSHIP_FAQ_ITEMS,
			DAY_TRADING_ROOM_FAQ_ITEMS,
			SWING_TRADING_ROOM_FAQ_ITEMS,
			SMALL_ACCOUNTS_ROOM_FAQ_ITEMS,
			INDICATORS_STORE_FAQ_ITEMS,
			COURSES_STORE_FAQ_ITEMS,
			SINGLE_COURSE_FAQ_ITEMS,
			SINGLE_INDICATOR_FAQ_ITEMS,
			SPX_PROFIT_PULSE_FAQ_ITEMS,
			SCANNERS_STORE_FAQ_ITEMS,
			SINGLE_SCANNER_FAQ_ITEMS,
			STOCK_INDEXES_LIST_FAQ_ITEMS,
			SUNDAY_ALPHA_PROTOCOL_FAQ_ITEMS
		]) {
			expect(faqList.length).toBeGreaterThanOrEqual(4);
		}
	});
});

describe('buildHomepageJsonLd', () => {
	const graph = buildHomepageJsonLd(ORIGIN)['@graph'] as Node[];

	it('satisfies graph integrity, excludes restricted/retired types, and omits single-item BreadcrumbList on root homepage (SD-05)', () => {
		assertGraphIntegrity(graph, { isHomepage: true });
	});

	it('includes visible Blog navigation while excluding gated store products and blog article lists', () => {
		const urls = JSON.stringify(graph);
		expect(urls).not.toContain(`${ORIGIN}/store`);
		const navigation = graph.find((n) => n['@id'] === `${ORIGIN}/#navigation`) as Node;
		expect(navigation.itemListElement).toContainEqual(
			expect.objectContaining({
				'@type': 'SiteNavigationElement',
				name: 'Blog',
				url: `${ORIGIN}/blog`
			})
		);
		expect(graph.some((n) => n['@id'] === `${ORIGIN}/#latest-blogs`)).toBe(false);
		const webpage = graph.find((n) => n['@id'] === `${ORIGIN}/#webpage`) as Node;
		expect(webpage.hasPart).toEqual([{ '@id': `${ORIGIN}/#navigation` }]);
	});

	it('derives the launched article list from the same saved CMS cards the page renders', () => {
		const original = launchGate.isLaunchedHref;
		const spy = vi
			.spyOn(launchGate, 'isLaunchedHref')
			.mockImplementation((href) => href === '/blog' || original(href));
		try {
			const cards = [
				{ id: 92, title: 'Selected saved feature', slug: 'selected-saved-feature' },
				{ id: 105, title: 'New saved publication', slug: 'new-saved-publication' }
			];
			const withArticles = buildHomepageJsonLd(ORIGIN, cards)['@graph'] as Node[];
			const list = withArticles.find((n) => n['@id'] === `${ORIGIN}/#latest-blogs`) as Node;
			expect(list.numberOfItems).toBe(2);
			expect(list.itemListElement).toEqual(
				cards.map((card, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					name: card.title,
					url: `${ORIGIN}/blog/${card.slug}`
				}))
			);
			assertGraphIntegrity(withArticles, { isHomepage: true });
			expect(
				buildHomepageJsonLd(ORIGIN)['@graph'].some((n) => n['@id'] === `${ORIGIN}/#latest-blogs`)
			).toBe(false);
		} finally {
			spy.mockRestore();
		}
	});
});

describe('founder and organization entities (YMYL entity signals)', () => {
	const founder = buildFounderEntity(ORIGIN) as Node;
	const org = buildOrganizationEntity(ORIGIN) as Node;

	it('emits one Person node tied to the organization, titled exactly as the About page shows it', () => {
		expect(founder['@type']).toBe('Person');
		expect(founder['@id']).toBe(`${ORIGIN}/#founder`);
		expect(founder.name).toBe('Billy Ribeiro');
		expect(founder.jobTitle).toBe('Founder & Head Trader');
		expect(founder.worksFor).toEqual({ '@id': `${ORIGIN}/#organization` });
		expect(org.founder).toEqual({ '@id': `${ORIGIN}/#founder` });
	});

	it('asserts no unevidenced performance or endorsement claims in machine-readable form', () => {
		const text = JSON.stringify(founder);
		expect(text).not.toMatch(/McGoldrick|Goldman|OXY|600%|future of trading|2020|2022/);
	});

	it('publishes no telephone or email until real values exist in SUPPORT_CONTACT', () => {
		const contact = org.contactPoint as Node;
		expect(contact.contactType).toBe('customer support');
		expect(contact.url).toBe(`${ORIGIN}/contact`);
		expect(contact).not.toHaveProperty('telephone');
		expect(contact).not.toHaveProperty('email');
	});
});

describe('isNoIndexRoute launch gate', () => {
	it.each(['/store', '/store/courses', '/store/indicators/move-prior-to-the-move-system'])(
		'treats %s as noindex while it is gated',
		(path) => {
			expect(isNoIndexRoute(path)).toBe(true);
		}
	);

	it.each([
		'/',
		'/about',
		'/mentorship',
		'/resources/etf-stocks-list',
		'/blogger',
		'/storefront',
		'/blog',
		'/blog/any-post',
		'/blog/tag/spx-options'
	])('leaves %s indexable', (path) => {
		expect(isNoIndexRoute(path)).toBe(false);
	});

	it('still blocks the always-private prefixes', () => {
		for (const path of ['/admin', '/admin/login', '/login', '/checkout', '/demo/playwright']) {
			expect(isNoIndexRoute(path)).toBe(true);
		}
	});
});

describe('buildAboutJsonLd', () => {
	const graph = buildAboutJsonLd(ORIGIN)['@graph'] as Node[];

	it('satisfies graph integrity and uses ProfilePage with mainEntity Person (SD-09)', () => {
		assertGraphIntegrity(graph);
		const page = graph.find((n) => n['@id'] === `${ORIGIN}/about#webpage`) as Node;
		expect(page['@type']).toBe('ProfilePage');
		expect(page.mainEntity).toEqual({ '@id': `${ORIGIN}/#founder` });
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

	it('satisfies graph integrity and is a WebPage about the organization', () => {
		assertGraphIntegrity(graph);
		const page = graph.find((n) => n['@id'] === `${ORIGIN}/our-mission#webpage`) as Node;
		expect(page['@type']).toBe('WebPage');
		expect(page.about).toEqual({ '@id': `${ORIGIN}/#organization` });
		expect(page.mainEntity).toBeUndefined();
	});
});

describe('buildMentorshipJsonLd', () => {
	const graph = buildMentorshipJsonLd(ORIGIN)['@graph'] as Node[];

	it('satisfies graph integrity and describes the mentorship as a Service for all three audiences', () => {
		assertGraphIntegrity(graph);
		const service = graph.find((n) => n['@id'] === `${ORIGIN}/mentorship#service`) as Node;
		expect(service['@type']).toBe('Service');
		expect(service.audience).toHaveLength(3);
	});
});

describe('buildDayTradingRoomJsonLd', () => {
	const graph = buildDayTradingRoomJsonLd(ORIGIN)['@graph'] as Node[];

	it('satisfies graph integrity and describes the Day Trading Room as a Service linked from the WebPage', () => {
		assertGraphIntegrity(graph);
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
});

describe('buildSwingTradingRoomJsonLd', () => {
	const graph = buildSwingTradingRoomJsonLd(ORIGIN)['@graph'] as Node[];

	it('satisfies graph integrity and describes the Swing Trading Room as a Service linked from the WebPage', () => {
		assertGraphIntegrity(graph);
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
});

describe('buildSmallAccountsRoomJsonLd', () => {
	const graph = buildSmallAccountsRoomJsonLd(ORIGIN)['@graph'] as Node[];

	it('satisfies graph integrity and describes the Small Accounts Room as a Service linked from the WebPage', () => {
		assertGraphIntegrity(graph);
		const page = graph.find(
			(n) => n['@id'] === `${ORIGIN}/live-trading-rooms/small-accounts-room#webpage`
		) as Node;
		expect(page['@type']).toBe('WebPage');
		expect(page.about).toEqual({
			'@id': `${ORIGIN}/live-trading-rooms/small-accounts-room#service`
		});

		const service = graph.find(
			(n) => n['@id'] === `${ORIGIN}/live-trading-rooms/small-accounts-room#service`
		) as Node;
		expect(service['@type']).toBe('Service');
		expect(service.provider).toEqual({ '@id': `${ORIGIN}/#organization` });
	});
});

describe('buildBlogsHubJsonLd', () => {
	const graph = buildBlogsHubJsonLd(ORIGIN)['@graph'] as Node[];

	it('satisfies graph integrity and describes the Blog Hub as a CollectionPage and Blog linked to the Organization', () => {
		assertGraphIntegrity(graph);
		const page = graph.find((n) => n['@id'] === `${ORIGIN}/blogs#webpage`) as Node;
		expect(page['@type']).toBe('CollectionPage');
		expect(page.mainEntity).toEqual({ '@id': `${ORIGIN}/blogs#blog` });

		const blog = graph.find((n) => n['@id'] === `${ORIGIN}/blogs#blog`) as Node;
		expect(blog['@type']).toBe('Blog');
		expect(blog.publisher).toEqual({ '@id': `${ORIGIN}/#organization` });
	});
});

describe('buildIndicatorsStoreJsonLd', () => {
	const graph = buildIndicatorsStoreJsonLd(ORIGIN)['@graph'] as Node[];

	it('satisfies graph integrity and describes the Indicators Store as a CollectionPage with an 8-item ItemList', () => {
		assertGraphIntegrity(graph);
		const page = graph.find((n) => n['@id'] === `${ORIGIN}/store/indicators#webpage`) as Node;
		expect(page['@type']).toBe('CollectionPage');
		expect(page.mainEntity).toEqual({ '@id': `${ORIGIN}/store/indicators#catalog` });

		const catalog = graph.find((n) => n['@id'] === `${ORIGIN}/store/indicators#catalog`) as Node;
		expect(catalog['@type']).toBe('ItemList');
		expect(catalog.numberOfItems).toBe(8);
		expect((catalog.itemListElement as unknown[]).length).toBe(8);
	});
});

describe('buildCoursesStoreJsonLd', () => {
	const graph = buildCoursesStoreJsonLd(ORIGIN)['@graph'] as Node[];

	it('satisfies graph integrity and describes the Courses Store as a CollectionPage with an 8-item ItemList', () => {
		assertGraphIntegrity(graph);
		const page = graph.find((n) => n['@id'] === `${ORIGIN}/store/courses#webpage`) as Node;
		expect(page['@type']).toBe('CollectionPage');
		expect(page.mainEntity).toEqual({ '@id': `${ORIGIN}/store/courses#catalog` });

		const catalog = graph.find((n) => n['@id'] === `${ORIGIN}/store/courses#catalog`) as Node;
		expect(catalog['@type']).toBe('ItemList');
		expect(catalog.numberOfItems).toBe(8);
		expect((catalog.itemListElement as unknown[]).length).toBe(8);
	});
});

describe('buildSingleCourseJsonLd', () => {
	const slug = 'move-prior-to-the-move-ultra';
	const graph = buildSingleCourseJsonLd(ORIGIN, slug)['@graph'] as Node[];

	it('satisfies graph integrity and describes the Single Course page as a WebPage with Service mainEntity', () => {
		assertGraphIntegrity(graph);
		const page = graph.find((n) => n['@id'] === `${ORIGIN}/store/courses/${slug}#webpage`) as Node;
		expect(page['@type']).toBe('WebPage');
		expect(page.mainEntity).toEqual({ '@id': `${ORIGIN}/store/courses/${slug}#service` });

		const service = graph.find(
			(n) => n['@id'] === `${ORIGIN}/store/courses/${slug}#service`
		) as Node;
		expect(service['@type']).toBe('Service');
		expect(service.name).toBe('Get the NEW Automated Move Prior to The Move™ Ultra System');
		expect(service.provider).toEqual({ '@id': `${ORIGIN}/#organization` });
	});
});

describe('buildSingleIndicatorJsonLd', () => {
	const slug = 'move-prior-to-the-move-system';
	const graph = buildSingleIndicatorJsonLd(ORIGIN, slug)['@graph'] as Node[];

	it('satisfies graph integrity and describes the Single Indicator page as a WebPage with SoftwareApplication mainEntity', () => {
		assertGraphIntegrity(graph);
		const page = graph.find(
			(n) => n['@id'] === `${ORIGIN}/store/indicators/${slug}#webpage`
		) as Node;
		expect(page['@type']).toBe('WebPage');
		expect(page.mainEntity).toEqual({ '@id': `${ORIGIN}/store/indicators/${slug}#software` });

		const software = graph.find(
			(n) => n['@id'] === `${ORIGIN}/store/indicators/${slug}#software`
		) as Node;
		expect(software['@type']).toBe('SoftwareApplication');
		expect(software.name).toBe('The Move Prior to The Move™ Pro System');
		expect(software.applicationCategory).toBe('FinanceApplication');
		expect((software.creator as Node).name).toBe('Billy Ribeiro');
	});
});

describe('buildSpxProfitPulseJsonLd', () => {
	const graph = buildSpxProfitPulseJsonLd(ORIGIN)['@graph'] as Node[];

	it('satisfies graph integrity and describes SPX Profit Pulse as a Service linked from the WebPage', () => {
		assertGraphIntegrity(graph);
		const page = graph.find(
			(n) => n['@id'] === `${ORIGIN}/alert-services/spx-profit-pulse#webpage`
		) as Node;
		expect(page['@type']).toBe('WebPage');
		expect(page.about).toEqual({
			'@id': `${ORIGIN}/alert-services/spx-profit-pulse#service`
		});

		const service = graph.find(
			(n) => n['@id'] === `${ORIGIN}/alert-services/spx-profit-pulse#service`
		) as Node;
		expect(service['@type']).toBe('Service');
		expect(service.name).toBe(
			'SPX Profit Pulse: Real-Time S&P 500 & 0DTE Index Options Alert Service'
		);
		expect(service.provider).toEqual({ '@id': `${ORIGIN}/#organization` });
	});
});

describe('buildScannersStoreJsonLd', () => {
	const graph = buildScannersStoreJsonLd(ORIGIN)['@graph'] as Node[];

	it('satisfies graph integrity and describes the Scanners Store as a CollectionPage with an 8-item SoftwareApplication ItemList', () => {
		assertGraphIntegrity(graph);
		const page = graph.find((n) => n['@id'] === `${ORIGIN}/store/scanners#webpage`) as Node;
		expect(page['@type']).toBe('CollectionPage');
		expect(page.mainEntity).toEqual({ '@id': `${ORIGIN}/store/scanners#catalog` });

		const catalog = graph.find((n) => n['@id'] === `${ORIGIN}/store/scanners#catalog`) as Node;
		expect(catalog['@type']).toBe('ItemList');
		expect(catalog.numberOfItems).toBe(8);
		expect((catalog.itemListElement as unknown[]).length).toBe(8);
	});
});

describe('buildSingleScannerJsonLd', () => {
	const graph = buildSingleScannerJsonLd(ORIGIN)['@graph'] as Node[];

	it('satisfies graph integrity and describes the High Octane Scanner as a SoftwareApplication linked to the Founder', () => {
		assertGraphIntegrity(graph);
		const page = graph.find(
			(n) => n['@id'] === `${ORIGIN}/store/scanners/high-octane-scanner#webpage`
		) as Node;
		expect(page['@type']).toBe('WebPage');
		expect(page.mainEntity).toEqual({
			'@id': `${ORIGIN}/store/scanners/high-octane-scanner#software`
		});

		const software = graph.find(
			(n) => n['@id'] === `${ORIGIN}/store/scanners/high-octane-scanner#software`
		) as Node;
		expect(software['@type']).toBe('SoftwareApplication');
		expect(software.name).toBe('High Octane Scanner™');
		expect(software.creator).toEqual({
			'@type': 'Person',
			'@id': `${ORIGIN}/#founder`,
			name: 'Billy Ribeiro'
		});
	});
});

describe('buildEtfStocksListJsonLd', () => {
	const graph = buildEtfStocksListJsonLd(ORIGIN)['@graph'] as Node[];

	it('satisfies graph integrity and describes the ETF Stock List page as a CollectionPage with a 12-item ItemList', () => {
		assertGraphIntegrity(graph);
		const page = graph.find(
			(n) => n['@id'] === `${ORIGIN}/resources/etf-stocks-list#webpage`
		) as Node;
		expect(page['@type']).toBe('CollectionPage');
		expect(page.mainEntity).toEqual({ '@id': `${ORIGIN}/resources/etf-stocks-list#etf-list` });

		const list = graph.find(
			(n) => n['@id'] === `${ORIGIN}/resources/etf-stocks-list#etf-list`
		) as Node;
		expect(list['@type']).toBe('ItemList');
		expect(list.numberOfItems).toBe(12);
	});
});

describe('buildStockIndexesListJsonLd', () => {
	const graph = buildStockIndexesListJsonLd(ORIGIN)['@graph'] as Node[];

	it('satisfies graph integrity and describes the Stock Indexes List page as a CollectionPage with a 10-item ItemList', () => {
		assertGraphIntegrity(graph);
		const page = graph.find(
			(n) => n['@id'] === `${ORIGIN}/resources/stock-indexes-list#webpage`
		) as Node;
		expect(page['@type']).toBe('CollectionPage');
		expect(page.mainEntity).toEqual({ '@id': `${ORIGIN}/resources/stock-indexes-list#index-list` });

		const list = graph.find(
			(n) => n['@id'] === `${ORIGIN}/resources/stock-indexes-list#index-list`
		) as Node;
		expect(list['@type']).toBe('ItemList');
		expect(list.numberOfItems).toBe(10);
	});
});

describe('buildResourcesHubJsonLd', () => {
	const graph = buildResourcesHubJsonLd(ORIGIN)['@graph'] as Node[];

	it('satisfies graph integrity and describes the Resources Hub page as a CollectionPage with a 3-item utilities ItemList', () => {
		assertGraphIntegrity(graph);
		const page = graph.find((n) => n['@id'] === `${ORIGIN}/resources#webpage`) as Node;
		expect(page['@type']).toBe('CollectionPage');
		expect(page.name).toBe('Free Trading Resources & Tools | Revolution Trading Pros');
		expect(page.mainEntity).toEqual({ '@id': `${ORIGIN}/resources#utilities` });

		const list = graph.find((n) => n['@id'] === `${ORIGIN}/resources#utilities`) as Node;
		expect(list['@type']).toBe('ItemList');
		expect(list.numberOfItems).toBe(3);
	});
});

describe('buildSundayAlphaProtocolJsonLd', () => {
	const graph = buildSundayAlphaProtocolJsonLd(ORIGIN)['@graph'] as Node[];

	it('satisfies graph integrity and includes Billy Ribeiro Person and Sunday Alpha Protocol Product with image and 3 Offers ($47, $127, $447)', () => {
		assertGraphIntegrity(graph);
		const person = graph.find((n) => n['@id'] === `${ORIGIN}/#billy-ribeiro`) as Node;
		expect(person['@type']).toBe('Person');
		expect(person.name).toBe('Billy Ribeiro');

		const product = graph.find(
			(n) => n['@id'] === `${ORIGIN}/alert-services/sunday-alpha-protocol#protocol`
		) as Node;
		expect(product['@type']).toBe('Product');
		expect(product.name).toBe('Sunday Alpha Protocol');
		expect(product.image).toBe(`${ORIGIN}/og-image.png`);
		const offers = product.offers as { name: string; price: string; url: string }[];
		expect(offers).toHaveLength(3);
		expect(offers.map((o) => o.price)).toEqual(['47.00', '127.00', '447.00']);
		for (const offer of offers) {
			expect(offer.url).toBe(`${ORIGIN}/alert-services/sunday-alpha-protocol`);
		}
	});
});

describe('Trust & Policy JSON-LD builders (YMYL-07)', () => {
	it('builds valid ContactPage and WebPage graphs for all 5 trust pages', () => {
		for (const [builder, expectedPath, expectedType] of [
			[buildContactPageJsonLd, '/contact', 'ContactPage'],
			[buildEditorialPolicyPageJsonLd, '/editorial-policy', 'WebPage'],
			[buildPrivacyPolicyPageJsonLd, '/privacy-policy', 'WebPage'],
			[buildTermsOfServicePageJsonLd, '/terms-of-service', 'WebPage'],
			[buildRefundPolicyPageJsonLd, '/refund-policy', 'WebPage']
		] as const) {
			const graph = builder(ORIGIN)['@graph'] as Node[];
			assertGraphIntegrity(graph);
			const page = graph.find((n) => n['@id'] === `${ORIGIN}${expectedPath}#webpage`) as Node;
			expect(page['@type']).toBe(expectedType);
		}
	});
});
