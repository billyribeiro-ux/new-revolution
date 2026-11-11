import {
	MAIN_NAVIGATION,
	MEMBERSHIP_TIERS,
	STORE_TOOLS,
	type FaqItem
} from '#lib/data/homepage.ts';
import { coursesCatalog } from '#lib/data/courses.ts';
import { featuredETFs } from '#lib/data/etf-stocks-list.ts';
import { indicatorsCatalog } from '#lib/data/indicators.ts';
import { FOUNDER, SOCIAL_LINKS, SUPPORT_CONTACT } from '#lib/data/site.ts';
import { isLaunchedHref, isUnlaunchedRoute } from '#lib/data/launch-gate.ts';
import type { BlogCardPost } from '#lib/shared/blog/discovery';
import { SITE_ORIGIN } from '#lib/shared/site-origin';

export { SITE_ORIGIN };

function describeProposedConcept(description: string): string {
	return `Concept in development; unavailable for purchase. Proposed design: ${description}`;
}

export const BRAND_NAME = 'Revolution Trading Pros';
export const BRAND_SLOGAN = 'Educate. Innovate. Prosper.';
export const BRAND_LOGO_PATH = '/logo.png';
export const BRAND_LOGO_WIDTH = 3163;
export const BRAND_LOGO_HEIGHT = 835;
export const BRAND_SOCIAL_IMAGE_PATH = '/og-image.png';
export const BRAND_SOCIAL_IMAGE_WIDTH = 1200;
export const BRAND_SOCIAL_IMAGE_HEIGHT = 630;

const NOINDEX_ROUTE_PREFIXES = [
	'/lp',
	'/login',
	'/register',
	'/dashboard',
	'/admin',
	'/checkout',
	'/demo'
] as const;

/**
 * Canonical production origin, used for canonical URLs, hreflang, Open Graph, Twitter and JSON-LD.
 *
 * Deliberately NOT derived from the request URL:
 * - prerendered (SSG) HTML is built where `url.origin` is only a placeholder
 *   (`http://sveltekit-prerender`);
 * - universal `load` functions re-run in the browser during hydration, so a request-derived origin
 *   makes the hydrated head differ from the server-rendered head (verified: og:url/og:image changed
 *   to the browser origin after hydration);
 * - preview/staging deployments must never present themselves as canonical.
 */

export function getCanonicalUrl(url: Pick<URL, 'pathname'>): string {
	const cleanPath = url.pathname === '/' ? '' : url.pathname.replace(/\/+$/, '');
	return `${SITE_ORIGIN}${cleanPath}`;
}

export function isNoIndexRoute(pathname: string): boolean {
	return (
		NOINDEX_ROUTE_PREFIXES.some(
			(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
		) ||
		// Routes behind the launch gate (`#lib/data/launch-gate.ts`) stay out of the index until they launch.
		isUnlaunchedRoute(pathname)
	);
}

/**
 * Safely serializes a JSON-LD object for embedding inside `<script type="application/ld+json">`,
 * escaping `<`, `>`, `&`, `U+2028`, and `U+2029` per SD-02.
 */
export function serializeJsonLd(schema: unknown): string {
	return JSON.stringify(schema)
		.replace(/</g, '\\u003c')
		.replace(/>/g, '\\u003e')
		.replace(/&/g, '\\u0026')
		.replace(/\u2028/g, '\\u2028')
		.replace(/\u2029/g, '\\u2029');
}

/**
 * Escapes `<`, `>`, `&`, `U+2028`, and `U+2029` inside any rendered
 * `<script type="application/ld+json">...</script>` block in HTML.
 */
export function escapeJsonLdBlocksInHtml(html: string): string {
	return html.replace(
		/(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?\})\s*(<\/script>)/gi,
		(_match, openTag: string, body: string, closeTag: string) => {
			const escaped = body
				.replace(/</g, '\\u003c')
				.replace(/>/g, '\\u003e')
				.replace(/&/g, '\\u0026')
				.replace(/\u2028/g, '\\u2028')
				.replace(/\u2029/g, '\\u2029');
			return `${openTag}${escaped}${closeTag}`;
		}
	);
}

export interface CatalogOffering {
	id: string;
	schemaType: 'Service';
	name: string;
	serviceType?: string;
	description: string;
	path: string;
}

export const CANONICAL_OFFERINGS: readonly CatalogOffering[] = [
	{
		id: 'day-trading-room',
		schemaType: 'Service',
		name: 'Day Trading Room',
		serviceType: 'Live Stock and Options Day Trading Room',
		description: MEMBERSHIP_TIERS[0].description,
		path: '/live-trading-rooms/day-trading-room'
	},
	{
		id: 'swing-trading-room',
		schemaType: 'Service',
		name: 'Swing Trading Room',
		serviceType: 'Multi-Day Stock and Options Swing Trading Room',
		description: MEMBERSHIP_TIERS[1].description,
		path: '/live-trading-rooms/swing-trading-room'
	},
	{
		id: 'small-accounts-room',
		schemaType: 'Service',
		name: 'Small Accounts Room',
		serviceType: 'Small Account ($500+) Risk-First Trading Mentorship Room',
		description: MEMBERSHIP_TIERS[2].description,
		path: '/live-trading-rooms/small-accounts-room'
	},
	{
		id: 'spx-profit-pulse',
		schemaType: 'Service',
		name: 'SPX Profit Pulse',
		serviceType: 'SPX Options Video Watchlist and Alert Service',
		description:
			'S&P 500 index options video watchlists and planned alert scenarios with defined trigger zones, profit targets, and invalidation levels.',
		path: '/alert-services/spx-profit-pulse'
	},
	{
		id: 'sunday-alpha-protocol',
		schemaType: 'Service',
		name: 'Sunday Alpha Protocol',
		serviceType: 'Multi-Day Swing Trading Video Watchlist and Alert Service',
		description:
			'Multi-day stock and options video watchlists with pre-planned entry zones, profit targets, and stop-loss invalidation levels for working professionals.',
		path: '/alert-services/sunday-alpha-protocol'
	},
	{
		id: 'private-mentorship',
		schemaType: 'Service',
		name: 'Private 1-on-1 Trading Mentorship',
		serviceType: 'Application-Only 1-on-1 Trading Mentorship',
		description:
			'Selective, application-only 1-on-1 trading mentorship focused on execution process, risk management, and structured trade review.',
		path: '/mentorship'
	},
	{
		id: 'trading-courses',
		schemaType: 'Service',
		name: 'Stock & Options Trading Courses',
		serviceType: 'Self-Paced Stock and Options Trading Curriculum',
		description: STORE_TOOLS[1].description,
		path: '/store/courses'
	},
	{
		id: 'custom-indicators',
		schemaType: 'Service',
		name: 'Custom Trading Indicators',
		serviceType: 'Market-Structure, Liquidity, and Volume Trading Indicators',
		description: STORE_TOOLS[0].description,
		path: '/store/indicators'
	},
	{
		id: 'institutional-scanners',
		schemaType: 'Service',
		name: 'Institutional Trading Scanners',
		serviceType: 'Stock and Options Liquidity and Inflection Scanners',
		description:
			'Technical market scanners designed to monitor liquidity, unusual volume, and structural inflection zones across stocks, ETFs, and options.',
		path: '/store/scanners'
	}
] as const;

export const ABOUT_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'goldman-mentor',
		question: 'Who mentored the founder of Revolution Trading Pros, and why does it matter?',
		answer:
			'The founder reports a personal mentorship experience with Mark McGoldrick. This is a personal account, not an independently verified credential, endorsement, affiliation, or evidence of product performance. The proposed programs remain unavailable.'
	},
	{
		id: 'oxy-put-options-600',
		question: 'How did you make 600% overnight on OXY Put Options when Warren Buffett went long?',
		answer:
			'This is a historical performance claim, not a verified customer result or a promised return. It should not be relied on without the original trade records, costs, dates, and risk context. No proposed service is available for purchase.'
	},
	{
		id: 'small-accounts-500-mission',
		question:
			'Why do you offer a Small Accounts Room for $500+ accounts and affordable alert services?',
		answer:
			'The concept explores education for people with limited trading capital. A $500 example is not a recommended minimum, a statement of suitability, or a promise of account growth. No room or membership is available.'
	},
	{
		id: 'mentorship-application-only',
		question: 'Why is your 1-on-1 Mentorship by application and approval only?',
		answer:
			'An application and fit review is a proposed design for a possible future program. Applications and paid enrollment are not currently open, and no future availability is guaranteed.'
	}
] as const;

export function buildNavigationElements(origin: string) {
	const flattened: { name: string; url: string }[] = [];

	for (const item of MAIN_NAVIGATION) {
		if (item.href) {
			flattened.push({
				name: item.label,
				url: `${origin}${item.href}`
			});
		}
		if (item.children) {
			for (const child of item.children) {
				flattened.push({
					name: child.label,
					url: `${origin}${child.href}`
				});
			}
		}
	}

	return flattened.map((entry, idx) => ({
		'@type': 'SiteNavigationElement',
		'@id': `${origin}/#nav-item-${idx + 1}`,
		position: idx + 1,
		name: entry.name,
		url: entry.url
	}));
}

export function buildOrganizationEntity(origin: string) {
	const logoUrl = `${origin}${BRAND_LOGO_PATH}`;
	return {
		'@type': 'EducationalOrganization',
		'@id': `${origin}/#organization`,
		name: BRAND_NAME,
		alternateName: 'RTP',
		url: origin,
		sameAs: SOCIAL_LINKS.map((link) => link.href),
		slogan: BRAND_SLOGAN,
		description:
			'AI-assisted trading education website concept, public for browser testing and search visibility. No purchases or paid subscriptions are available.',
		logo: {
			'@type': 'ImageObject',
			'@id': `${origin}/#logo`,
			url: logoUrl,
			contentUrl: logoUrl,
			width: BRAND_LOGO_WIDTH,
			height: BRAND_LOGO_HEIGHT,
			caption: `${BRAND_NAME}: ${BRAND_SLOGAN}`
		},
		image: {
			'@id': `${origin}/#logo`
		},
		founder: {
			'@id': `${origin}/#founder`
		},
		areaServed: [
			{
				'@type': 'Country',
				name: 'United States'
			},
			{
				'@type': 'Country',
				name: 'Canada'
			}
		],
		knowsAbout: [
			'Live Stock and Options Trading Room',
			'Options Trading Mentorship',
			'Swing Trading Alerts for Working Professionals',
			'Small Account ($500+) Risk Management',
			'Custom Non-Repainting Trading Indicators and Scanners',
			'SPX Profit Pulse and Sunday Alpha Protocol Video Watchlists',
			'Institutional Order Flow and Market Structure Education'
		],
		contactPoint: {
			'@type': 'ContactPoint',
			contactType: 'website feedback and corrections',
			url: `${origin}/contact`,
			availableLanguage: ['en-US', 'en-CA'],
			// Only real, published values: `SUPPORT_CONTACT` is empty until the owner supplies them.
			...(SUPPORT_CONTACT.phone ? { telephone: SUPPORT_CONTACT.phone } : {}),
			...(SUPPORT_CONTACT.email ? { email: SUPPORT_CONTACT.email } : {})
		},
		hasOfferCatalog: {
			'@id': `${origin}/#offer-catalog`
		}
	};
}

export function buildFounderEntity(origin: string) {
	return {
		'@type': 'Person',
		'@id': `${origin}/#founder`,
		name: FOUNDER.name,
		jobTitle: FOUNDER.jobTitle,
		url: `${origin}/about`,
		worksFor: {
			'@id': `${origin}/#organization`
		},
		// Deliberately claim-free: mentorship and performance statements are not machine-asserted here because
		// no primary evidence is published for them. The founder's own account is on /about.
		description:
			'Founder of Revolution Trading Pros, a stock and options trading education company.',
		knowsAbout: [
			'Institutional Order Flow Execution',
			'Options Day Trading and Swing Trading',
			'Small Account Risk Management ($500+)',
			'Macro Market Cycle Inflection Timing',
			'Non-Repainting Technical Indicators'
		]
	};
}

/** Public concept descriptions eligible for discovery; this does not enable purchasing. */
const INDEXABLE_CONCEPTS = CANONICAL_OFFERINGS.filter((offering) => isLaunchedHref(offering.path));

export function buildOfferCatalogEntity(origin: string) {
	return {
		'@type': 'OfferCatalog',
		'@id': `${origin}/#offer-catalog`,
		name: 'Revolution Trading Pros Proposed Concepts — Not Available for Purchase',
		url: `${origin}/live-trading-rooms/day-trading-room`,
		numberOfItems: INDEXABLE_CONCEPTS.length,
		itemListElement: INDEXABLE_CONCEPTS.map((offering, index) => ({
			'@type': offering.schemaType,
			'@id': `${origin}${offering.path}#${offering.schemaType.toLowerCase()}`,
			position: index + 1,
			name: offering.name,
			description: describeProposedConcept(offering.description),
			url: `${origin}${offering.path}`,
			provider: {
				'@id': `${origin}/#organization`
			},
			serviceType: offering.serviceType,
			areaServed: [
				{ '@type': 'Country', name: 'United States' },
				{ '@type': 'Country', name: 'Canada' }
			]
		}))
	};
}

export function buildWebSiteEntity(origin: string) {
	return {
		'@type': 'WebSite',
		'@id': `${origin}/#website`,
		url: origin,
		name: BRAND_NAME,
		alternateName: `${BRAND_NAME}: ${BRAND_SLOGAN}`,
		description:
			'Stock and options trading education, live trading rooms, swing trading alerts, small-account mentorship ($500+), custom indicators, and scanners.',
		inLanguage: 'en-US',
		publisher: {
			'@id': `${origin}/#organization`
		}
	};
}

export function buildHomepageJsonLd(origin: string, articles: readonly BlogCardPost[] = []) {
	const navigationElements = buildNavigationElements(origin);
	// Discoverable schema respects launch policy and never advertises unsaved editorial placeholders.
	const blogListed = isLaunchedHref('/blog') && articles.length > 0;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			buildWebSiteEntity(origin),
			{
				'@type': 'WebPage',
				'@id': `${origin}/#webpage`,
				url: origin,
				name: 'Stock & Options Trading Rooms | Revolution Trading Pros',
				description:
					'Live stock and options trading rooms, $500+ small-account mentorship, non-repainting indicators, courses, and video watchlists. People over profits.',
				inLanguage: 'en-US',
				isPartOf: {
					'@id': `${origin}/#website`
				},
				about: {
					'@id': `${origin}/#organization`
				},
				primaryImageOfPage: {
					'@id': `${origin}/#logo`
				},
				mainEntity: {
					'@id': `${origin}/#offer-catalog`
				},
				hasPart: [
					{ '@id': `${origin}/#navigation` },
					...(blogListed ? [{ '@id': `${origin}/#latest-blogs` }] : [])
				]
			},
			{
				'@type': 'ItemList',
				'@id': `${origin}/#navigation`,
				name: 'Primary Site Navigation',
				numberOfItems: navigationElements.length,
				itemListElement: navigationElements
			},
			...(blogListed
				? [
						{
							'@type': 'ItemList',
							'@id': `${origin}/#latest-blogs`,
							name: 'Latest Market Intelligence Articles',
							numberOfItems: articles.length,
							itemListElement: articles.map((article, idx) => ({
								'@type': 'ListItem',
								position: idx + 1,
								url: `${origin}/blog/${article.slug}`,
								name: article.title
							}))
						}
					]
				: [])
		]
	};
}

export function buildAboutJsonLd(origin: string) {
	const aboutUrl = `${origin}/about`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			buildWebSiteEntity(origin),
			{
				'@type': 'ProfilePage',
				'@id': `${aboutUrl}#webpage`,
				url: aboutUrl,
				name: 'About Us & Proven Track Record | Revolution Trading Pros',
				description:
					'Mentored by Goldman Sachs legend Mark McGoldrick, we called the 2020 & 2022 tops/bottoms and made 600% overnight on OXY puts. People over profits.',
				inLanguage: 'en-US',
				isPartOf: {
					'@id': `${origin}/#website`
				},
				about: {
					'@id': `${origin}/#organization`
				},
				mainEntity: {
					'@id': `${origin}/#founder`
				},
				primaryImageOfPage: {
					'@id': `${origin}/#logo`
				},
				breadcrumb: {
					'@id': `${aboutUrl}#breadcrumb`
				}
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${aboutUrl}#breadcrumb`,
				itemListElement: [
					{
						'@type': 'ListItem',
						position: 1,
						name: 'Home',
						item: origin
					},
					{
						'@type': 'ListItem',
						position: 2,
						name: 'About Revolution Trading Pros',
						item: aboutUrl
					}
				]
			}
		]
	};
}

export const MISSION_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'people-over-making-money',
		question: 'Why do you emphasize "People Over Profits" so strongly?',
		answer:
			'The development goal is clear educational explanations and realistic risk discussion. Purchases and paid subscriptions have never been available; the public concept is used for browser testing and search visibility.'
	},
	{
		id: 'small-account-coverage',
		question: 'What if I only have $500 to start trading? Am I really covered?',
		answer:
			'Small-account education is a proposed concept, not an available service or a promise of growth. Trading can exhaust a small account, and examples do not establish suitability.'
	},
	{
		id: 'alert-only-memberships',
		question: "How do your alert-only memberships work if I can't join a live trading room?",
		answer:
			'SPX Profit Pulse and Sunday Alpha Protocol are proposed concepts for educational watchlists and scenarios. There is no active alert membership, paid subscription, or enrollment.'
	},
	{
		id: 'mentorship-application-only',
		question: "Why can't I pay directly for 1-on-1 Mentorship on your website?",
		answer:
			'An application and fit review is a proposed design for a possible future program. Applications and paid enrollment are not currently open, and no future availability is guaranteed.'
	}
] as const;

export function buildMissionJsonLd(origin: string) {
	const missionUrl = `${origin}/our-mission`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			buildWebSiteEntity(origin),
			{
				'@type': 'WebPage',
				'@id': `${missionUrl}#webpage`,
				url: missionUrl,
				name: 'Our Mission: People Over Profits | Revolution Trading Pros',
				description:
					'Educate, Innovate, and Prosper. We put people over profits with honest live trading rooms, $500+ small account mentorship, and zero fake indicators.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				about: { '@id': `${origin}/#organization` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${missionUrl}#breadcrumb` },
				hasPart: [{ '@id': `${missionUrl}#charter` }]
			},
			{
				'@type': 'CreativeWork',
				'@id': `${missionUrl}#charter`,
				name: 'The People Over Profits Charter',
				description:
					'Five non-negotiable standards: no fake holy grail indicators, no overpriced guru courses, exact entries, exits and stops defined ahead of time, dedicated environments for small accounts and working professionals, and application-only 1-on-1 mentorship.',
				inLanguage: 'en-US',
				url: missionUrl,
				isPartOf: { '@id': `${missionUrl}#webpage` },
				publisher: { '@id': `${origin}/#organization` }
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${missionUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{ '@type': 'ListItem', position: 2, name: 'Our Mission', item: missionUrl }
				]
			}
		]
	};
}

export const MENTORSHIP_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'why-application-only',
		question: "Why can't I just pay and join 1-on-1 Mentorship immediately?",
		answer:
			'A future program might use an application and fit review. This is a proposed workflow only; applications, paid enrollment, and personalized trading services are unavailable.'
	},
	{
		id: 'struggling-trader-rejected',
		question:
			'I am a struggling trader who has lost money to fake gurus. Will my application be rejected?',
		answer:
			'Potential eligibility criteria are draft concepts, not an active application process. No applications are accepted and no recovery of trading losses is promised.'
	},
	{
		id: 'portfolio-managers',
		question:
			'How do you structure 1-on-1 Mentorship for Portfolio Managers and Institutional Traders?',
		answer:
			'The draft explores structured learning and trade-review topics for experienced readers. It is not an available advisory, portfolio management, or private coaching service.'
	},
	{
		id: 'rooms-while-reviewed',
		question:
			'What if I want to join a Live Trading Room or Alert Service while my 1-on-1 application is reviewed?',
		answer:
			'No rooms, alert memberships, or mentorship enrollment are currently available. Visitors can explore the concept and educational material without purchasing or reserving access.'
	}
] as const;

export function buildMentorshipJsonLd(origin: string) {
	const pageUrl = `${origin}/mentorship`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			buildWebSiteEntity(origin),
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: '1-on-1 Trading Mentorship | Revolution Trading Pros',
				description:
					'Explore our proposed one-on-one trading mentorship concept, including learning goals, process review, and risk education. No applications or paid enrollment.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				about: { '@id': `${pageUrl}#service` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'Service',
				'@id': `${pageUrl}#service`,
				name: 'Private 1-on-1 Stock & Options Trading Mentorship (Application Only)',
				url: pageUrl,
				provider: { '@id': `${origin}/#organization` },
				serviceType: 'Executive & Turnaround 1-on-1 Financial Trading Mentorship',
				areaServed: [
					{ '@type': 'Country', name: 'United States' },
					{ '@type': 'Country', name: 'Canada' }
				],
				audience: [
					{ '@type': 'Audience', audienceType: 'Portfolio Managers and Capital Allocators' },
					{
						'@type': 'Audience',
						audienceType: 'Full-Time Professional Stock and Options Traders'
					},
					{ '@type': 'Audience', audienceType: 'Struggling Retail Traders Seeking Turnaround' }
				],
				description: describeProposedConcept(
					"Strictly application-and-approval-only 1-on-1 mentorship built on the Goldman Sachs proprietary trading lineage of Mark 'Goldfinger' McGoldrick."
				)
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{ '@type': 'ListItem', position: 2, name: '1-on-1 Mentorship', item: pageUrl }
				]
			}
		]
	};
}

export const DAY_TRADING_ROOM_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'liquid-institutional-stocks-options',
		question: 'Do you trade micro-float penny stocks or liquid institutional stocks and options?',
		answer:
			'The proposed educational scope includes liquid U.S. stocks, ETFs, and options. Liquidity varies and does not guarantee execution, prevent slippage, or eliminate losses. No live room is operating as an available service.'
	},
	{
		id: 'live-voice-and-screen-share',
		question:
			'Will I actually see your screen and hear your voice live, or is it just text alerts?',
		answer:
			'Live commentary and screen sharing are proposed features, not currently available room access. Any interface demonstrations are illustrative and do not represent a live session.'
	},
	{
		id: 'goldman-sachs-mentorship-lineage',
		question: 'How does your Goldman Sachs mentorship lineage change how you day trade?',
		answer:
			'The founder reports a personal mentorship experience. That account does not establish institutional affiliation, endorsement, independently verified performance, or the effectiveness of a proposed service.'
	},
	{
		id: 'spx-alerts-video-watchlists',
		question: 'What if I only want SPX index options alerts or pre-planned video watchlists?',
		answer:
			'The proposed concepts explore educational options scenarios and video watchlists. Alerts, memberships, paid access, and delivery schedules are not currently available.'
	},
	{
		id: 'custom-non-repainting-indicators-scanners',
		question:
			'Can I also use your custom non-repainting indicators and scanners alongside the room?',
		answer:
			'Indicators and scanners are concepts under development. Compatibility, signal behavior, and performance require validation; no software access, purchase, or download is offered.'
	}
] as const;

export function buildDayTradingRoomJsonLd(origin: string) {
	const pageUrl = `${origin}/live-trading-rooms/day-trading-room`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			buildWebSiteEntity(origin),
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: 'Live Day Trading Room | Revolution Trading Pros',
				description:
					'Explore our proposed day trading room, with concepts for market preparation, chart reviews, and risk education. In development; no purchases or enrollment.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				about: { '@id': `${pageUrl}#service` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'Service',
				'@id': `${pageUrl}#service`,
				name: 'Real-Time Live Stock, ETF & Options Day Trading Room',
				url: pageUrl,
				provider: { '@id': `${origin}/#organization` },
				serviceType: 'Live Intraday Stock and Options Trading Room',
				areaServed: [
					{ '@type': 'Country', name: 'United States' },
					{ '@type': 'Country', name: 'Canada' }
				],
				audience: {
					'@type': 'Audience',
					audienceType: 'Active Day Traders, Options Scalpers, and Full-Time Traders'
				},
				description: describeProposedConcept(
					'Daily live pre-market preparation, real-time voice commentary, live screen sharing, and institutional order-flow execution across liquid US stocks, ETFs, and options.'
				)
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{ '@type': 'ListItem', position: 2, name: 'Day Trading Room', item: pageUrl }
				]
			}
		]
	};
}

export const SWING_TRADING_ROOM_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'working-pro-daily-time',
		question:
			'How much time per day do I need to follow the Swing Trading Room if I have a full-time job?',
		answer:
			'The proposed workflow explores preparation outside market hours. Time requirements depend on the activity and are not established or guaranteed. No live service or enrollment is available.'
	},
	{
		id: 'stocks-etfs-options-coverage',
		question: 'Do you swing trade shares of stock, ETFs, or options contracts?',
		answer:
			'Stocks, ETFs, and options are the proposed educational scope. They involve different risks and may be unsuitable for a particular reader. This is not an available trading or advisory service.'
	},
	{
		id: 'swing-room-vs-sunday-alpha-protocol',
		question:
			'How is the Swing Trading Room different from your Sunday Alpha Protocol alert service?',
		answer:
			'The swing room concept explores discussion and chart review; Sunday Alpha explores prepared educational scenarios. Both are in development and neither offers current paid access or subscriptions.'
	},
	{
		id: 'methodology-2020-2022-oxy',
		question:
			'How did your methodology call the 2020 and 2022 tops/bottoms and the +600% OXY trade?',
		answer:
			'Historical timing and return claims require original supporting records and context. They do not verify the effectiveness of this concept or predict future results.'
	},
	{
		id: 'non-repainting-indicators-courses-mentorship',
		question:
			'Can I pair the Swing Trading Room with your custom non-repainting indicators and courses?',
		answer:
			'The store, courses, indicators, scanners, and mentorship are proposed concepts. No purchases, software delivery, applications, or paid enrollment are currently available.'
	}
] as const;

export function buildSwingTradingRoomJsonLd(origin: string) {
	const pageUrl = `${origin}/live-trading-rooms/swing-trading-room`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			buildWebSiteEntity(origin),
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: 'Live Swing Trading Room | Revolution Trading Pros',
				description:
					'Explore a proposed swing trading room for multi-day planning, chart review, and risk education. Concept in development; no purchases or paid subscriptions.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				about: { '@id': `${pageUrl}#service` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'Service',
				'@id': `${pageUrl}#service`,
				name: 'Stock, ETF & Options Swing Trading Room for Working Professionals',
				url: pageUrl,
				provider: { '@id': `${origin}/#organization` },
				serviceType: 'Multi-Day Stock and Options Swing Trading Room',
				areaServed: [
					{ '@type': 'Country', name: 'United States' },
					{ '@type': 'Country', name: 'Canada' }
				],
				audience: {
					'@type': 'Audience',
					audienceType:
						'Working Professionals, 9-to-5 Careers, and Multi-Day Stock and Options Swing Traders'
				},
				description: describeProposedConcept(
					'Institutional multi-day stock, ETF, and options swing trading room delivering pre-planned entry triggers, tiered profit targets, hard stop-losses, and evening video chart reviews.'
				)
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{ '@type': 'ListItem', position: 2, name: 'Swing Trading Room', item: pageUrl }
				]
			}
		]
	};
}

export const SMALL_ACCOUNTS_ROOM_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'starting-capital-500',
		question: 'Is $500 really enough starting capital to join the Small Accounts Room?',
		answer:
			'A $500 figure is an illustrative account example, not a recommended starting balance or a statement that trading is suitable. Losses may consume the account. No membership is available.'
	},
	{
		id: 'cash-vs-margin-account-under-25k',
		question: 'Should I use a Cash Account or a Margin Account if I have less than $25,000?',
		answer:
			'We teach you how to navigate both. In the United States, a Cash Account is exempt from the Pattern Day Trader (PDT) 3-day-trade limit. Because options and equities settle overnight on a T+1 schedule, your settled cash refreshes every single market morning. If you prefer a small margin account (or trade from Canada where PDT rules differ), we also execute multi-day swing setups and defined-risk spreads.'
	},
	{
		id: 'goldman-sachs-pedigree-small-accounts',
		question:
			'Why do you care about $500 small accounts when you have Goldman Sachs mentorship pedigree?',
		answer:
			'The small-account concept concerns position sizing and risk awareness. Personal background claims are not evidence that the proposed program protects capital or produces profits.'
	},
	{
		id: 'full-time-job-small-account',
		question: 'What if I work a full-time job and also have a small $500+ account?',
		answer:
			'The concept explores planning and risk education for different schedules and account sizes. It does not establish suitability or promise a manageable workload or return. No access is offered.'
	},
	{
		id: 'graduating-past-10k-25k',
		question: 'What happens once my small account grows past $10,000 or $25,000?',
		answer:
			'Account growth and progression are not promised. Any roadmap is illustrative, and future programs, eligibility, and access have not been established.'
	}
] as const;

export function buildSmallAccountsRoomJsonLd(origin: string) {
	const pageUrl = `${origin}/live-trading-rooms/small-accounts-room`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			buildWebSiteEntity(origin),
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: 'Small Accounts Trading Room | Revolution Trading Pros',
				description:
					'Explore a proposed small-account trading education room focused on position sizing and risk awareness. Concept in development; paid enrollment unavailable.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				about: { '@id': `${pageUrl}#service` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'Service',
				'@id': `${pageUrl}#service`,
				name: 'Small Accounts Stock & Options Trading Room ($500+ Starting Capital)',
				url: pageUrl,
				provider: { '@id': `${origin}/#organization` },
				serviceType: 'Small Account Stock and Options Trading Room and Risk Mentorship',
				areaServed: [
					{ '@type': 'Country', name: 'United States' },
					{ '@type': 'Country', name: 'Canada' }
				],
				audience: {
					'@type': 'Audience',
					audienceType: 'Traders Starting With Small Accounts ($500 to $5,000+)'
				},
				description: describeProposedConcept(
					'Dedicated live trading room and compounding framework engineered specifically for accounts starting as low as $500, covering affordable options contracts, T+1 cash account rotation, PDT navigation, and strict stop-loss discipline.'
				)
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{ '@type': 'ListItem', position: 2, name: 'Small Accounts Room', item: pageUrl }
				]
			}
		]
	};
}

export function buildBlogsHubJsonLd(origin: string) {
	const pageUrl = `${origin}/blogs`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			buildWebSiteEntity(origin),
			{
				'@type': 'CollectionPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: 'Stock & Options Trading Blog | Revolution Trading Pros',
				description:
					'Free institutional stock and options trading articles, Options Greeks guides, $500+ small account strategies, and macro analysis by Billy Ribeiro.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				about: { '@id': `${pageUrl}#blog` },
				mainEntity: { '@id': `${pageUrl}#blog` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'Blog',
				'@id': `${pageUrl}#blog`,
				url: pageUrl,
				name: 'Stock & Options Trading Blog | Revolution Trading Pros',
				description:
					'Free institutional stock and options trading articles, Options Greeks guides, $500+ small account strategies, and macro analysis by Billy Ribeiro.',
				inLanguage: 'en-US',
				publisher: { '@id': `${origin}/#organization` },
				author: { '@id': `${origin}/#founder` }
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{ '@type': 'ListItem', position: 2, name: 'Blogs', item: pageUrl }
				]
			}
		]
	};
}

export const INDICATORS_STORE_FAQ_ITEMS: FaqItem[] = [
	{
		id: 'never-repaint',
		question: 'Do your indicators ever repaint or change past signals after the bar closes?',
		answer:
			'Non-repainting behavior is a proposed engineering goal requiring reproducible testing. It is not a current product guarantee or evidence of profitability; no indicator is available for purchase.'
	},
	{
		id: 'platforms-markets',
		question: 'Which trading platforms and markets do these indicators work on?',
		answer:
			'ThinkorSwim and TradingView are potential integration targets. Compatibility and supported markets have not been verified for a released product, and no software access is available.'
	},
	{
		id: 'small-accounts-working-pros',
		question: 'Are these indicators suitable for $500+ small accounts or working professionals?',
		answer:
			'The proposed indicators explore chart-study workflows for different schedules and risk budgets. Suitability and effectiveness are not established and access is unavailable.'
	},
	{
		id: 'pair-with-scanners-courses',
		question: 'How do your indicators pair with your Scanners and Trading Courses?',
		answer:
			'Combining indicators, scanners, and lessons is a proposed workflow. These products and bundles are not available for purchase, download, or enrollment.'
	}
];

export function buildIndicatorsStoreJsonLd(origin: string) {
	const pageUrl = `${origin}/store/indicators`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			buildWebSiteEntity(origin),
			{
				'@type': 'CollectionPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: 'Custom Trading Indicators | Revolution Trading Pros',
				description:
					'Preview proposed trading indicator concepts for chart study, market structure, and risk education. AI-assisted development; no purchases or downloads offered.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				about: { '@id': `${pageUrl}#catalog` },
				mainEntity: { '@id': `${pageUrl}#catalog` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{
						'@type': 'ListItem',
						position: 2,
						name: 'Trading Indicators',
						item: pageUrl
					}
				]
			},
			{
				'@type': 'ItemList',
				'@id': `${pageUrl}#catalog`,
				name: 'Revolution Trading Pros Proprietary Non-Repainting Indicators',
				numberOfItems: indicatorsCatalog.length,
				// Derived from the catalog the cards render, so JSON-LD text always matches the visible card text.
				itemListElement: indicatorsCatalog.map((item, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					name: item.name,
					description: item.hook
				}))
			}
		]
	};
}

export const COURSES_STORE_FAQ_ITEMS: FaqItem[] = [
	{
		id: 'beginner-500-account',
		question:
			'I am a complete beginner or starting with a $500 account. Which course should I take first?',
		answer:
			'Draft course ideas include position sizing, options mechanics, and risk awareness. These are concepts, not available courses or a recommendation to trade with $500.'
	},
	{
		id: 'indicators-scanners-optional',
		question:
			'Do I need to buy your custom indicators or scanners to use what is taught in the courses?',
		answer:
			'The concept explores education that can be understood without proprietary software. No course or software purchase is available or required to browse the public material.'
	},
	{
		id: 'courses-vs-mentorship-rooms',
		question:
			'How is a self-paced course different from your 1-on-1 Mentorship or Live Trading Rooms?',
		answer:
			'Self-paced lessons, discussion rooms, and private review are different proposed learning formats. None is currently available for paid enrollment.'
	},
	{
		id: 'us-canadian-brokerages',
		question: 'Do your courses cover both US and Canadian brokerage accounts?',
		answer:
			'Brokerage access and trading eligibility depend on jurisdiction and the provider. No brokerage compatibility, integration, or regulatory approval is claimed for this concept.'
	}
];

export function buildCoursesStoreJsonLd(origin: string) {
	const pageUrl = `${origin}/store/courses`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			buildWebSiteEntity(origin),
			{
				'@type': 'CollectionPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: 'Stock & Options Trading Courses | Revolution Trading Pros',
				description:
					'Explore proposed stock and options course concepts covering market structure, trade planning, and risk education. In development; paid enrollment unavailable.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				about: { '@id': `${pageUrl}#catalog` },
				mainEntity: { '@id': `${pageUrl}#catalog` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{
						'@type': 'ListItem',
						position: 2,
						name: 'Trading Courses',
						item: pageUrl
					}
				]
			},
			{
				'@type': 'ItemList',
				'@id': `${pageUrl}#catalog`,
				name: 'Revolution Trading Pros Institutional Stock & Options Curriculum',
				numberOfItems: coursesCatalog.length,
				// Derived from the catalog the cards render, so JSON-LD text always matches the visible card text.
				itemListElement: coursesCatalog.map((course, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					name: course.title,
					description: course.hook
				}))
			}
		]
	};
}

export const SINGLE_COURSE_FAQ_ITEMS: FaqItem[] = [
	{
		id: 'package-1-vs-package-2',
		question:
			'What is the difference between Package 1 (Indicator Suite) and Package 2 (Indicators + Accelerator Class)?',
		answer:
			'The package comparison is a proposed design only. Contents, pricing, licenses, and availability are not finalized; no package can be purchased or reserved.'
	},
	{
		id: 'non-repainting-guarantee',
		question: 'Do any of the indicators in this package repaint after the candle closes?',
		answer:
			'There is no released product or current non-repainting guarantee. Signal permanence and historical behavior would need reproducible validation before any such claim.'
	},
	{
		id: 'platforms-tickers-timeframes',
		question: 'Which platforms, tickers, and timeframes do these tools and strategies work on?',
		answer:
			'Platform, instrument, and timeframe descriptions are proposed specifications. They are not verified compatibility commitments or available software access.'
	},
	{
		id: 'working-pro-and-500-account',
		question:
			'Can I use this course and indicator suite if I work a 9-to-5 job or have a $500 small account?',
		answer:
			'The concept explores educational examples for different schedules and account sizes. It does not establish suitability, protect capital, or promise trading outcomes.'
	},
	{
		id: 'lifetime-on-demand-access',
		question: 'Is the Accelerator Class live or recorded, and how long do I keep access?',
		answer:
			'No course access, downloads, lifetime license, or enrollment is available. Any possible future access terms would be published before a purchase becomes possible.'
	}
] as const;

export function buildSingleCourseJsonLd(origin: string, slug = 'move-prior-to-the-move-ultra') {
	const pageUrl = `${origin}/store/courses/${slug}`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			buildWebSiteEntity(origin),
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: 'Move Prior to The Move Course | Revolution Trading Pros',
				description:
					'Master institutional order flow, multi-timeframe squeezes, and Options Greeks with Billy Ribeiro. Includes 100% non-repainting ThinkorSwim and TradingView tools.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				mainEntity: { '@id': `${pageUrl}#service` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{
						'@type': 'ListItem',
						position: 2,
						name: 'Trading Courses',
						item: `${origin}/store/courses`
					},
					{
						'@type': 'ListItem',
						position: 3,
						name: 'The Move Prior to The Move™ Ultra Class & Indicator Suite',
						item: pageUrl
					}
				]
			},
			{
				'@type': 'Service',
				'@id': `${pageUrl}#service`,
				name: 'Get the NEW Automated Move Prior to The Move™ Ultra System',
				description: describeProposedConcept(
					'Master institutional order flow, multi-timeframe squeezes, and Options Greeks with Billy Ribeiro. Includes 100% non-repainting ThinkorSwim and TradingView tools.'
				),
				provider: { '@id': `${origin}/#organization` },
				serviceType: 'Self-Paced Options Trading Curriculum and Non-Repainting Indicator Suite',
				areaServed: [
					{ '@type': 'Country', name: 'United States' },
					{ '@type': 'Country', name: 'Canada' }
				]
			}
		]
	};
}

export const SINGLE_INDICATOR_FAQ_ITEMS: FaqItem[] = [
	{
		id: 'step-by-step-install-desktop-mobile',
		question:
			'Are there step-by-step instructions for installing the indicators on desktop and mobile?',
		answer:
			'Installation guides and import workflows are proposed features. No indicator download or installation entitlement is currently offered.'
	},
	{
		id: 'platforms-and-devices',
		question: 'What charting platforms and devices work with these indicators?',
		answer:
			'Desktop and mobile compatibility are proposed design targets and remain subject to testing. No released indicator access is available.'
	},
	{
		id: 'signals-non-repainting',
		question: 'Do any of the Buy/Sell or Early In/Out signals repaint?',
		answer:
			'The displayed signals are illustrative. Non-repainting behavior and performance are not guaranteed and require validation in a released implementation.'
	},
	{
		id: 'access-and-duration',
		question:
			'Where do I get access, and how long will I have access to the indicators and training?',
		answer:
			'There is no current paid access, subscription term, or lifetime license. Purchases and paid subscriptions have never been made available.'
	}
];

export function buildSingleIndicatorJsonLd(origin: string, slug = 'move-prior-to-the-move-system') {
	const pageUrl = `${origin}/store/indicators/${slug}`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			buildWebSiteEntity(origin),
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: 'MP Early In & Out Indicator | Revolution Trading Pros',
				description:
					'Explore the proposed indicator suite and illustrative chart concepts for market structure and risk education. In development; no purchases or access offered.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				mainEntity: { '@id': `${pageUrl}#software` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{
						'@type': 'ListItem',
						position: 2,
						name: 'Trading Indicators',
						item: `${origin}/store/indicators`
					},
					{
						'@type': 'ListItem',
						position: 3,
						name: 'The Move Prior to The Move™ Pro System',
						item: pageUrl
					}
				]
			},
			{
				'@type': 'SoftwareApplication',
				'@id': `${pageUrl}#software`,
				name: 'The Move Prior to The Move™ Pro System',
				applicationCategory: 'FinanceApplication',
				operatingSystem: 'ThinkorSwim Desktop, ThinkorSwim Mobile App, TradingView',
				description: describeProposedConcept(
					'Explore the proposed indicator suite and illustrative chart concepts for market structure and risk education. In development; no purchases or access offered.'
				),
				creator: {
					'@type': 'Person',
					'@id': `${origin}/#founder`,
					name: 'Billy Ribeiro'
				}
			}
		]
	};
}

export const SPX_PROFIT_PULSE_FAQ_ITEMS: FaqItem[] = [
	{
		id: 'watch-market-all-day',
		question: 'Do I have to watch the market all day to follow SPX Profit Pulse alerts?',
		answer:
			'The concept explores prepared educational scenarios, not an active alert delivery service. It does not promise a particular screen-time requirement or execution outcome.'
	},
	{
		id: 'zero-dte-or-multi-day',
		question:
			'Do you only trade 0DTE (Zero Days to Expiration), or do you also alert multi-day SPX setups?',
		answer:
			'The draft explores short-dated SPX options scenarios for education. Such options can lose value rapidly; no real-time alert subscription or trading service is available.'
	},
	{
		id: 'small-account-compatibility',
		question: 'Can I follow SPX Profit Pulse if I have a small account ($500 to $2,500)?',
		answer:
			'Options trading may be unsuitable for small accounts and can cause substantial losses. These examples do not establish suitability or affordable risk for any reader.'
	},
	{
		id: 'difference-from-day-room-sunday-alpha-protocol',
		question:
			'How is SPX Profit Pulse different from the Live Day Trading Room or Sunday Alpha Protocol?',
		answer:
			'SPX Profit Pulse explores index-options scenarios; the other concepts explore discussion or weekly preparation. All remain in development with no paid access.'
	}
];

export function buildSpxProfitPulseJsonLd(origin: string) {
	const pageUrl = `${origin}/alert-services/spx-profit-pulse`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			buildWebSiteEntity(origin),
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: 'SPX Profit Pulse Options Alerts | Revolution Trading Pros',
				description:
					'Preview the SPX Profit Pulse concept for options education, illustrative scenarios, and risk planning. In development; no purchases or paid subscriptions.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				about: { '@id': `${pageUrl}#service` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{
						'@type': 'ListItem',
						position: 2,
						name: 'SPX Profit Pulse',
						item: pageUrl
					}
				]
			},
			{
				'@type': 'Service',
				'@id': `${pageUrl}#service`,
				name: 'SPX Profit Pulse: Real-Time S&P 500 & 0DTE Index Options Alert Service',
				provider: { '@id': `${origin}/#organization` },
				serviceType: 'SPX and 0DTE Index Options Trade Alert and Video Watchlist Service',
				areaServed: [
					{ '@type': 'Country', name: 'United States' },
					{ '@type': 'Country', name: 'Canada' }
				],
				audience: {
					'@type': 'Audience',
					audienceType:
						'Full-Time and Part-Time SPX Index Options Traders, Working Professionals, and Small Accounts'
				},
				description: describeProposedConcept(
					'Real-time SPX and 0DTE index options trade alerts paired with pre-market video watchlists, institutional dealer gamma walls, and exact entry, profit target, and hard stop-loss levels.'
				)
			}
		]
	};
}

export const SCANNERS_STORE_FAQ_ITEMS: FaqItem[] = [
	{
		id: 'install-thinkorswim-tradingview',
		question: 'How do these scanners install on ThinkorSwim and TradingView?',
		answer:
			'Import links, setup guides, and platform integration are proposed features. No scanner installation, software delivery, or purchase is currently available.'
	},
	{
		id: 'scanners-non-repainting-real-time',
		question: 'Do your scanners ever repaint or lag behind live market price action?',
		answer:
			'Real-time scanning and stable signals are proposed engineering goals. The demonstrations do not establish production capability, signal reliability, or profitability.'
	},
	{
		id: 'best-scanner-small-account-working-pro',
		question:
			'Which scanner is best if I have a $500+ small account or work a full-time 9-to-5 job?',
		answer:
			'Draft filter presets explore different schedules and risk budgets. No scanner is available, and affordability filters do not establish suitability or protect an account.'
	},
	{
		id: 'watch-scanners-live-market-hours',
		question: 'Can I watch your team use these scanners live during market hours?',
		answer:
			'The concept explores different scanning cadences. Actual operation, workload, and alert delivery have not been established; no scanner access is offered.'
	}
];

const SCANNERS_STORE_CATALOG_ITEMS = [
	{
		slug: 'move-prior-to-the-move-radar',
		name: 'The Move Prior to The Move™ Live Market Radar',
		operatingSystem: 'ThinkorSwim, TradingView, Web'
	},
	{
		slug: 'multi-timeframe-squeeze-scanner',
		name: 'Multi-Timeframe Volatility Squeeze & Alignment Scanner',
		operatingSystem: 'ThinkorSwim, TradingView'
	},
	{
		slug: 'liquidity-sweep-stop-hunt-scanner',
		name: 'Institutional Liquidity Sweep & Failed Breakout Scanner',
		operatingSystem: 'ThinkorSwim, TradingView'
	},
	{
		slug: 'small-account-affordable-options-scanner',
		name: '$500+ Small Account Affordable Options & Spread Scanner',
		operatingSystem: 'ThinkorSwim, TradingView'
	},
	{
		slug: 'working-pro-eod-swing-scanner',
		name: 'Working Professional 20-Minute End-of-Day Swing Scanner',
		operatingSystem: 'ThinkorSwim, TradingView'
	},
	{
		slug: 'spx-dealer-gamma-iv-skew-scanner',
		name: 'SPX & Index Options Dealer Gamma & IV Percentile Scanner',
		operatingSystem: 'ThinkorSwim, TradingView'
	},
	{
		slug: 'smart-money-relative-volume-scanner',
		name: 'Smart-Money Relative Volume (RVOL) & Accumulation Scanner',
		operatingSystem: 'ThinkorSwim, TradingView'
	},
	{
		slug: 'opening-bell-gap-and-go-fade-scanner',
		name: 'Pre-Market Institutional Gap & Liquidity Imbalance Scanner',
		operatingSystem: 'ThinkorSwim, TradingView'
	}
] as const;

export function buildScannersStoreJsonLd(origin: string) {
	const pageUrl = `${origin}/store/scanners`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			buildWebSiteEntity(origin),
			{
				'@type': 'CollectionPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: 'Live Stock & Options Scanners | Revolution Trading Pros',
				description:
					'Explore proposed market scanner concepts for chart screening, liquidity study, and risk education. AI-assisted development; no purchases or access offered.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				mainEntity: { '@id': `${pageUrl}#catalog` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{
						'@type': 'ListItem',
						position: 2,
						name: 'Trading Scanners',
						item: pageUrl
					}
				]
			},
			{
				'@type': 'ItemList',
				'@id': `${pageUrl}#catalog`,
				name: 'Revolution Trading Pros Institutional Market Scanners',
				numberOfItems: SCANNERS_STORE_CATALOG_ITEMS.length,
				itemListElement: SCANNERS_STORE_CATALOG_ITEMS.map((scanner, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					item: {
						'@type': 'SoftwareApplication',
						'@id': `${pageUrl}/${scanner.slug}#software`,
						name: scanner.name,
						applicationCategory: 'FinanceApplication',
						operatingSystem: scanner.operatingSystem,
						url: `${pageUrl}/${scanner.slug}`
					}
				}))
			}
		]
	};
}

export const SINGLE_SCANNER_FAQ_ITEMS: FaqItem[] = [
	{
		id: 'supported-platforms-and-devices',
		question: 'Which platforms and devices work with the High Octane Scanner™?',
		answer:
			'The proposed scanner explores ThinkorSwim and TradingView workflows. Device and platform support are not verified release commitments, and access is unavailable.'
	},
	{
		id: 'non-repainting-real-time-triggers',
		question: 'Do any of the High Octane Scanner triggers repaint or use delayed data?',
		answer:
			'The trigger display is an illustrative prototype. Stable bar-close signals and real-time operation require testing and are not current guarantees.'
	},
	{
		id: 'small-account-filter-benefit',
		question: 'How does the High Octane Scanner help if I only have $500 to $2,500 in my account?',
		answer:
			'A proposed affordability filter could screen contract prices, but it cannot make trading suitable or safe. No filter or scanner product is currently available.'
	},
	{
		id: 'installation-for-non-programmers',
		question: 'Is installation difficult if I am not a programmer?',
		answer:
			'A guided setup experience is proposed. Installation time, import links, training, and software access are not currently available or guaranteed.'
	},
	{
		id: 'monthly-vs-annual-access',
		question: 'What is the difference between Monthly and Annual access?',
		answer:
			'Monthly and annual options are draft interface concepts. No paid subscription, price, billing cadence, access entitlement, or rate reservation is available.'
	}
];

export function buildSingleScannerJsonLd(origin: string, slug = 'high-octane-scanner') {
	const pageUrl = `${origin}/store/scanners/${slug}`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			buildWebSiteEntity(origin),
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: 'High Octane Options Scanner | Revolution Trading Pros',
				description:
					'Preview the High Octane scanner concept, illustrative chart screening, and proposed market filters. In development; no purchases or paid access available.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				mainEntity: { '@id': `${pageUrl}#software` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{
						'@type': 'ListItem',
						position: 2,
						name: 'Trading Scanners',
						item: `${origin}/store/scanners`
					},
					{
						'@type': 'ListItem',
						position: 3,
						name: 'High Octane Scanner™',
						item: pageUrl
					}
				]
			},
			{
				'@type': 'SoftwareApplication',
				'@id': `${pageUrl}#software`,
				name: 'High Octane Scanner™',
				applicationCategory: 'FinanceApplication',
				operatingSystem: 'ThinkorSwim Desktop, ThinkorSwim Mobile App, TradingView, Web',
				description: describeProposedConcept(
					'Preview the High Octane scanner concept, illustrative chart screening, and proposed market filters. In development; no purchases or paid access available.'
				),
				creator: {
					'@type': 'Person',
					'@id': `${origin}/#founder`,
					name: 'Billy Ribeiro'
				}
			}
		]
	};
}

export const ETF_STOCKS_LIST_FAQ_ITEMS: FaqItem[] = [
	{
		id: 'small-account-etf-options',
		question: 'Which ETFs are best for trading options in a $500+ small account?',
		answer:
			'For accounts starting between $500 and $2,500, we focus on ETFs that combine penny-wide bid-ask spreads with affordable contract prices: IWM (Russell 2000), XLF (Financials), XLE (Energy), GLD (Gold), and EEM (Emerging Markets), as well as defined-risk vertical spreads on SPY and QQQ.'
	},
	{
		id: 'sector-etfs-vs-single-stocks',
		question:
			'Why do institutional traders and working professionals prefer Sector ETFs over single stocks?',
		answer:
			'Single stocks carry overnight idiosyncratic risk (such as an unexpected FDA rejection, SEC probe, or earnings gap). Sector ETFs like XLK, XLE, XLF, and SMH allow 9-to-5 working professionals to trade the dominant institutional money flow with smooth technical structure and zero single-company blowup risk.'
	},
	{
		id: 'spy-vs-spx-options',
		question: 'What is the difference between SPY and SPX when trading S&P 500 options?',
		answer:
			'SPY is an Exchange-Traded Fund (ETF) priced at roughly 1/10th the S&P 500 Index with American-style share settlement and dividend payments. SPX is the cash-settled S&P 500 Index itself (10x the notional size of SPY) with European-style exercise and US Section 1256 60/40 tax treatment. We trade SPY in our Day, Swing, and Small Accounts rooms and SPX inside SPX Profit Pulse.'
	},
	{
		id: 'sp500-11-gics-sectors',
		question: 'How many official sectors are in the S&P 500, and which ETFs track them?',
		answer:
			'There are 11 official GICS (Global Industry Classification Standard) sectors in the S&P 500, tracked by the 11 Select Sector SPDR ETFs: XLK (Technology), XLV (Healthcare), XLF (Financials), XLY (Consumer Discretionary), XLC (Communication Services), XLI (Industrials), XLP (Consumer Staples), XLE (Energy), XLU (Utilities), XLRE (Real Estate), and XLB (Materials).'
	}
];

export function buildEtfStocksListJsonLd(origin: string) {
	const pageUrl = `${origin}/resources/etf-stocks-list`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			buildWebSiteEntity(origin),
			{
				'@type': 'CollectionPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: 'ETF Stocks List & Sector Guide | Revolution Trading Pros',
				description:
					'Complete ETF stocks list covering SPY, QQQ, IWM, and all 11 S&P 500 sector ETFs. Compare options liquidity, expense ratios, and institutional setups.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				mainEntity: { '@id': `${pageUrl}#etf-list` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{
						'@type': 'ListItem',
						position: 2,
						name: 'Free Trading Resources',
						item: `${origin}/resources`
					},
					{
						'@type': 'ListItem',
						position: 3,
						name: 'ETF Stocks List',
						item: pageUrl
					}
				]
			},
			{
				'@type': 'ItemList',
				'@id': `${pageUrl}#etf-list`,
				name: 'Most Liquid U.S. Index, Sector, Commodity & International ETFs',
				numberOfItems: featuredETFs.length,
				itemListElement: featuredETFs.map((etf, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					name: `${etf.symbol}: ${etf.name}`
				}))
			}
		]
	};
}

export const STOCK_INDEXES_LIST_FAQ_ITEMS: FaqItem[] = [
	{
		id: 'three-major-stock-indexes',
		question: 'What are the three major stock indexes?',
		answer:
			'1. S&P 500: measures 500 large-caps in U.S. stock market\n2. Dow Jones 30: measures the top 30 U.S. large-cap stocks\n3. Nasdaq 100: measures the top 100 largest non-financial companies'
	},
	{
		id: 'difference-between-stock-and-index',
		question: 'What is the difference between a stock and an index?',
		answer:
			'A stock allows investors partial ownership in a company. An index gives investors the option of investing in a basket of companies through products like ETFs, mutual funds, and derivatives.'
	},
	{
		id: 'invest-directly-in-index',
		question: 'Can you invest directly in an index?',
		answer:
			'An index cannot be traded or invested in directly. Many different products, such as ETFs, mutual funds, and derivatives, are available to investors to gain exposure to index performance.'
	},
	{
		id: 'ticker-symbols-major-indexes',
		question: 'What are the ticker symbols for major indexes?',
		answer:
			'1. S&P 500 – SPX or $SPX\n2. Dow Jones Industrial Average (DJIA) – $DJI\n3. Nasdaq Composite – COMPQ or $COMPQ\n4. NYSE Composite – (DJ)\n5. Russell 2000 – RUT or $RUT'
	},
	{
		id: 'most-widely-cited-us-index',
		question: 'What is the most widely cited US stock market index?',
		answer:
			'The most widely cited US stock market index is the S&P 500, which measures 500 large-cap stocks and is considered the best representation of the overall U.S. stock market.'
	}
];

const STOCK_INDEXES_LIST_ITEMS = [
	{ symbol: 'SPX', name: 'S&P 500' },
	{ symbol: 'DJI', name: 'Dow Jones Industrial Average' },
	{ symbol: 'COMPQ', name: 'NASDAQ Composite' },
	{ symbol: 'NDX', name: 'NASDAQ 100' },
	{ symbol: 'RUT', name: 'Russell 2000' },
	{ symbol: 'VIX', name: 'CBOE Volatility Index' },
	{ symbol: 'FTSE', name: 'FTSE 100' },
	{ symbol: 'DAX', name: 'DAX 40' },
	{ symbol: 'N225', name: 'Nikkei 225' },
	{ symbol: 'HSI', name: 'Hang Seng Index' }
] as const;

export function buildStockIndexesListJsonLd(origin: string) {
	const pageUrl = `${origin}/resources/stock-indexes-list`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			buildWebSiteEntity(origin),
			{
				'@type': 'CollectionPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: 'Stock Market Indexes List | Revolution Trading Pros',
				description:
					'Comprehensive stock market indexes list and guide. Track S&P 500 ($SPX), Dow Jones ($DJI), Nasdaq ($NDX), Russell 2000 ($RUT), VIX, and global benchmarks.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				mainEntity: { '@id': `${pageUrl}#index-list` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{
						'@type': 'ListItem',
						position: 2,
						name: 'Free Trading Resources',
						item: `${origin}/resources`
					},
					{
						'@type': 'ListItem',
						position: 3,
						name: 'Stock Indexes List',
						item: pageUrl
					}
				]
			},
			{
				'@type': 'ItemList',
				'@id': `${pageUrl}#index-list`,
				name: 'Major Global Stock Market Indexes',
				numberOfItems: STOCK_INDEXES_LIST_ITEMS.length,
				itemListElement: STOCK_INDEXES_LIST_ITEMS.map((idx, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					name: `${idx.symbol}: ${idx.name}`
				}))
			}
		]
	};
}

export const RESOURCES_HUB_UTILITIES = [
	{
		name: 'Options Profit, Risk & Greeks Calculator',
		description: 'Position Sizing, Delta/Theta Simulation & Breakeven Mapping',
		path: '/resources'
	},
	{
		name: 'Complete ETF Stocks & Sector Directory',
		description: 'SPY, QQQ, IWM, GLD & All 11 Official S&P 500 GICS Sectors',
		path: '/resources/etf-stocks-list'
	},
	{
		name: 'Stock Market Indexes Directory',
		description: 'Cash-Settled Index Mechanics, Section 1256 Taxes & Dealer Gamma',
		path: '/resources/stock-indexes-list'
	}
] as const;

export function buildResourcesHubJsonLd(origin: string) {
	const pageUrl = `${origin}/resources`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			buildWebSiteEntity(origin),
			{
				'@type': 'CollectionPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: 'Free Trading Resources & Tools | Revolution Trading Pros',
				description:
					'Free stock, ETF, and options trading resources. Access beginner guides, position size and options calculators, video tutorials, and market analysis.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				about: { '@id': `${origin}/#organization` },
				mainEntity: { '@id': `${pageUrl}#utilities` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{
						'@type': 'ListItem',
						position: 2,
						name: 'Free Trading Resources',
						item: pageUrl
					}
				]
			},
			{
				'@type': 'ItemList',
				'@id': `${pageUrl}#utilities`,
				name: 'Free Public Trading Utilities & Resource Vault',
				numberOfItems: RESOURCES_HUB_UTILITIES.length,
				itemListElement: RESOURCES_HUB_UTILITIES.map((util, idx) => ({
					'@type': 'ListItem',
					position: idx + 1,
					name: util.name,
					description: util.description,
					url: `${origin}${util.path}`
				}))
			}
		]
	};
}

export const SUNDAY_ALPHA_PROTOCOL_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'sunday-dispatch-time',
		question: 'When exactly do I receive the Sunday Alpha Protocol every week?',
		answer:
			'A weekly preparation schedule is a proposed design only. No paid dispatch, member dashboard, subscription, or guaranteed delivery time is available.'
	},
	{
		id: 'markets-and-asset-classes',
		question: 'What markets and asset classes do you cover?',
		answer:
			'The concept explores educational scenarios for U.S. stocks and ETFs with listed options. Instrument examples do not establish suitability, execution quality, or a live service.'
	},
	{
		id: 'risk-to-reward-math',
		question: 'How does the 1:2.50 minimum Risk-to-Reward math work?',
		answer:
			'The displayed targets and allocations are illustrative assumptions. A calculated reward-to-risk ratio does not establish target probabilities or expected returns; losses and costs can change outcomes.'
	},
	{
		id: 'screen-time-requirements',
		question: 'Do I need to sit in front of screens during market hours?',
		answer:
			'The concept explores prepared scenarios that can be studied outside market hours. No workload, execution, or delivery commitment is established.'
	},
	{
		id: 'cancellation-policy',
		question: 'What is your cancellation policy?',
		answer:
			'There are no paid subscriptions to cancel. Purchases and paid subscriptions have never been available; any future billing and cancellation terms would be published before sales are enabled.'
	}
] as const;

export function buildSundayAlphaProtocolJsonLd(origin: string) {
	const pageUrl = `${origin}/alert-services/sunday-alpha-protocol`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			buildWebSiteEntity(origin),
			{
				'@type': 'Person',
				'@id': `${origin}/#billy-ribeiro`,
				name: 'Billy Ribeiro',
				jobTitle: 'Chief Market Strategist & Founder',
				affiliation: {
					'@type': 'Organization',
					'@id': `${origin}/#organization`,
					name: BRAND_NAME,
					url: origin
				},
				description:
					'Proprietary market technician and macro strategist known for calling major macroeconomic inflection points, including the March 2020 pandemic bottom to the cent and the 2022 market cycle extremes.',
				sameAs: ['https://twitter.com/BillyRibeiro', 'https://tradingview.com/u/BillyRibeiro']
			},
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: 'Sunday Alpha Protocol | Revolution Trading Pros',
				description:
					'Explore the Sunday Alpha Protocol concept for weekly stock and options preparation and illustrative plans. In development; paid subscriptions unavailable.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				about: { '@id': `${pageUrl}#protocol` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'Service',
				'@id': `${pageUrl}#service`,
				name: 'Sunday Alpha Protocol: Institutional Stock & Options Swing Trading Blueprint',
				url: pageUrl,
				provider: { '@id': `${origin}/#organization` },
				serviceType: 'Institutional Stock and Options Swing Trading Watchlist Blueprint',
				areaServed: [
					{ '@type': 'Country', name: 'United States' },
					{ '@type': 'Country', name: 'Canada' }
				],
				audience: {
					'@type': 'Audience',
					audienceType: 'Beginners, Active Stock & Options Swing Traders, and Portfolio Allocators'
				},
				description: describeProposedConcept(
					'Weekly high-conviction swing trading intelligence for U.S. large-cap equity and ETF options traders. Delivers 5 to 7 structured trade setups with 15-minute confirmation triggers, cent-level stop invalidations, and explicit options contracts every Sunday at 5:00 PM EST.'
				)
			},
			{
				'@type': 'Product',
				'@id': `${pageUrl}#protocol`,
				name: 'Sunday Alpha Protocol',
				description: describeProposedConcept(
					'Weekly high-conviction swing trading intelligence for U.S. large-cap equity and ETF options traders. Delivers 5 to 7 structured trade setups with 15-minute confirmation triggers, cent-level stop invalidations, and explicit options contracts every Sunday at 5:00 PM EST.'
				),
				image: `${origin}${BRAND_SOCIAL_IMAGE_PATH}`,
				brand: {
					'@id': `${origin}/#organization`
				}
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{
						'@type': 'ListItem',
						position: 2,
						name: 'Sunday Alpha Protocol',
						item: pageUrl
					}
				]
			}
		]
	};
}

export function buildTrustPageJsonLd(
	origin: string,
	config: {
		path: string;
		breadcrumbName: string;
		title: string;
		description: string;
		schemaType?: 'WebPage' | 'ContactPage';
	}
) {
	const pageUrl = `${origin}${config.path}`;
	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			buildWebSiteEntity(origin),
			{
				'@type': config.schemaType ?? 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `${config.title} | ${BRAND_NAME}`,
				description: config.description,
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				about: { '@id': `${origin}/#organization` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{ '@type': 'ListItem', position: 2, name: config.breadcrumbName, item: pageUrl }
				]
			}
		]
	};
}

export function buildContactPageJsonLd(origin: string) {
	return buildTrustPageJsonLd(origin, {
		path: '/contact',
		breadcrumbName: 'Contact',
		title: 'Contact Our Trading Desk',
		description:
			'Contact Revolution Trading Pros about its AI-assisted website concept, browser testing, or content corrections. No sales, paid enrollment, or subscriptions.',
		schemaType: 'ContactPage'
	});
}

export function buildEditorialPolicyPageJsonLd(origin: string) {
	return buildTrustPageJsonLd(origin, {
		path: '/editorial-policy',
		breadcrumbName: 'Editorial Policy',
		title: 'Editorial Policy & Standards',
		description:
			'Read how AI is used in this trading education website concept, its content limitations, source verification goals, and process for reporting possible errors.'
	});
}

export function buildPrivacyPolicyPageJsonLd(origin: string) {
	return buildTrustPageJsonLd(origin, {
		path: '/privacy-policy',
		breadcrumbName: 'Privacy Policy',
		title: 'Privacy Policy & Data Security',
		description:
			'Learn how Revolution Trading Pros collects, protects, and handles member account data, cookies, and analytics across US and Canadian jurisdictions.'
	});
}

export function buildTermsOfServicePageJsonLd(origin: string) {
	return buildTrustPageJsonLd(origin, {
		path: '/terms-of-service',
		breadcrumbName: 'Terms of Service',
		title: 'Terms of Service & Disclosures',
		description:
			'Read the terms for this AI-assisted website concept, development status, content limitations, and trading risks. No purchases or paid subscriptions offered.'
	});
}

export function buildRefundPolicyPageJsonLd(origin: string) {
	return buildTrustPageJsonLd(origin, {
		path: '/refund-policy',
		breadcrumbName: 'Refund Policy',
		title: 'Cancellation & Refund Policy',
		description:
			'Read the current purchase, billing, and refund status of this website concept. No purchases or paid subscriptions have ever been made available to visitors.'
	});
}
