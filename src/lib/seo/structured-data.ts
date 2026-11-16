import { BRAND } from '#lib/config/brand.ts';
import { ALERT_SERVICE_CARDS } from '#lib/data/alert-services-hub.ts';
import { coursesCatalog } from '#lib/data/courses.ts';
import { featuredETFs } from '#lib/data/etf-stocks-list.ts';
import {
	MAIN_NAVIGATION,
	MEMBERSHIP_TIERS,
	STORE_TOOLS,
	type FaqItem
} from '#lib/data/homepage.ts';
import { indicatorsCatalog } from '#lib/data/indicators.ts';
import { LIVE_TRADING_ROOMS_CARDS } from '#lib/data/live-trading-rooms-hub.ts';
import { ARCHIVED_HISTORICAL_CALLS } from '#lib/data/track-record.ts';
import { FOUNDER, SOCIAL_LINKS, SUPPORT_CONTACT } from '#lib/data/site.ts';
import { isLaunchedHref, isUnlaunchedRoute } from '#lib/data/launch-gate.ts';
import { isTodoRoute } from '#lib/data/todo-pages.ts';
import type { BlogCardPost } from '#lib/shared/blog/discovery';
import { CONCEPT_PREVIEW } from '#lib/shared/development-status.ts';
import { SITE_ORIGIN } from '#lib/shared/site-origin.ts';

export { SITE_ORIGIN };

function describeProposedConcept(description: string): string {
	return description;
}

export const BRAND_NAME = BRAND.name;
export const BRAND_SLOGAN = BRAND.slogan;
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
	return `${BRAND.domain}${cleanPath}`;
}

export function isNoIndexRoute(pathname: string): boolean {
	return (
		NOINDEX_ROUTE_PREFIXES.some(
			(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
		) ||
		// Routes behind the launch gate (`#lib/data/launch-gate.ts`) or dedicated TODO placeholders stay out of the index.
		isUnlaunchedRoute(pathname) ||
		isTodoRoute(pathname)
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

export const HOME_PAGE_DESCRIPTION =
	'Live stock, ETF, and options trading rooms, indicator-free price action education, SPX & swing watchlists, and $500+ small-account risk frameworks.';

export const ABOUT_PAGE_DESCRIPTION =
	'Meet Billy Ribeiro, creator of The Move Prior to The Move™ pure price-action methodology, mentored in asymmetric risk by Mark "Goldfinger" McGoldrick.';

export const MISSION_PAGE_DESCRIPTION =
	'People over profits: 100% indicator-free pure price action rooms, asymmetric risk rules, $500+ small-account sizing, and structured SPX/swing alerts.';

export const MENTORSHIP_PAGE_DESCRIPTION =
	'Application-only 1-on-1 stock and options trading mentorship focused on indicator-free price structure, asymmetric options risk, and execution review.';

export const DAY_TRADING_ROOM_DESCRIPTION =
	'Live opening-bell stock, ETF, and SPX options day trading room with 8:45 AM ET prep, voice screen share, pure price structure, and binary stop rules.';

export const SWING_TRADING_ROOM_DESCRIPTION =
	'Multi-day stock, ETF, and options swing trading room for 9-to-5 working professionals with Sunday macro plans, evening reviews, and defined invalidation.';

export const SMALL_ACCOUNTS_ROOM_DESCRIPTION =
	'Dedicated $500+ small-account stock and options room built for T+1 cash settlement, FINRA Rule 4210 intraday margin, XSP contracts, and strict risk caps.';

export const ABOUT_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'goldman-mentor',
		question: `Who mentored the founder of ${BRAND.name}, and why does it matter?`,
		answer:
			'Billy Ribeiro reports being personally mentored by the late Mark "Goldfinger" McGoldrick — former Partner at Goldman Sachs, Co-Founder & Head of the Goldman Sachs Global Special Situations Group (GSSG, 1997–2007), and Founder of Mount Kellett Capital Management. That background shaped our focus on asymmetric dislocation risk and strict capital preservation rather than retail lagging indicators. It is a personal biographical account, not an institutional endorsement or guarantee of trading performance.'
	},
	{
		id: 'oxy-put-options-600',
		question: 'How did you structure the +600% overnight OXY Put Options case study in 2022?',
		answer:
			'Using Monthly-to-1-Minute pure price structure ("trade the charts, not the noise"), micro distribution inside an extended rally signaled an asymmetric downside pullback setup prior to widespread Berkshire Hathaway accumulation headlines. The position used defined-risk put options where maximum loss was capped to premium paid. It is a non-typical historical outlier documented on our /track-record page — options trading carries substantial risk of loss.'
	},
	{
		id: 'small-accounts-500-mission',
		question:
			'Why do you offer a Small Accounts Room for $500+ accounts and standalone alert blueprints?',
		answer:
			'Developing traders starting between $500 and $2,500 face completely different regulatory and mathematical constraints (T+1 cash settlement, the $2,000 FINRA Rule 4210 margin baseline, and steep percentage drawdowns from oversized contracts) than larger margin desks. Our Small Accounts Room teaches defined-risk vertical spreads, mini-XSP index sizing, and strict per-trade risk caps — though $500 is an educational workflow baseline, not a statement of suitability or promised growth.'
	},
	{
		id: 'mentorship-application-only',
		question: 'Why is your 1-on-1 Mentorship by application and approval only?',
		answer:
			'Direct 1-on-1 coaching with Billy Ribeiro requires reviewing a trader’s execution journal, risk discipline, schedule, and capital structure first so sessions stay focused on pure price-action process and risk architecture. Applications are reviewed selectively and never promise acceptance or investment advisory management.'
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
	const brandName = BRAND.name;
	const brandSlogan = BRAND.slogan;
	return {
		'@type': 'EducationalOrganization',
		'@id': `${origin}/#organization`,
		name: brandName,
		alternateName: BRAND.shortName,
		url: origin,
		sameAs: SOCIAL_LINKS.map((link) => link.href),
		slogan: brandSlogan,
		description:
			'U.S. and Canadian stock, ETF, and options trading education publisher specializing in 100% indicator-free pure price action (The Move Prior to The Move™), live trading rooms, SPX/swing alert blueprints, and FINRA Rule 4210 small-account risk frameworks.',
		logo: {
			'@type': 'ImageObject',
			'@id': `${origin}/#logo`,
			url: logoUrl,
			contentUrl: logoUrl,
			width: BRAND_LOGO_WIDTH,
			height: BRAND_LOGO_HEIGHT,
			caption: `${brandName}: ${brandSlogan}`
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
			'Price Action Trading Without Indicators',
			'The Move Prior to The Move™ Multi-Timeframe Structure',
			'Live Stock, ETF, and SPX Options Trading Rooms',
			'Cash-Settled SPX & XSP Section 1256 Index Options',
			'FINRA Rule 4210(d)(2) Intraday Margin & T+1 Settlement Risk',
			'Small Account ($500+) Defined-Risk Position Sizing',
			'Multi-Day Swing Trading Blueprints for Working Professionals'
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
		alternateName: FOUNDER.legalName,
		jobTitle: FOUNDER.jobTitle,
		url: `${origin}/about`,
		worksFor: {
			'@id': `${origin}/#organization`
		},
		subjectOf: FOUNDER.corroborationUrls.map((url) => ({
			'@type': 'WebPage',
			url
		})),
		description: `Founder of ${BRAND.name} and creator of ${BRAND.methodology} 100% indicator-free pure price-action methodology. Personally mentored by Mark "Goldfinger" McGoldrick (Co-Founder & Co-Head of Goldman Sachs Global Special Situations Group and Co-Founder of Mount Kellett Capital Management).`,
		knowsAbout: [
			'Pure Price Action Without Lagging Indicators',
			'Monthly-to-1-Minute Structural Supply and Demand',
			'Options Day Trading and Multi-Day Swing Structuring',
			'Small Account ($500+) Asymmetric Risk Management',
			'SPX and XSP Index Options Execution'
		]
	};
}

/** Public catalog offerings eligible for discovery when launched. */
const INDEXABLE_CONCEPTS = CANONICAL_OFFERINGS.filter((offering) => isLaunchedHref(offering.path));

export function buildOfferCatalogEntity(origin: string) {
	return {
		'@type': 'OfferCatalog',
		'@id': `${origin}/#offer-catalog`,
		name: `${BRAND.name} Trading Rooms, Alert Services & Mentorship`,
		url: `${origin}/live-trading-rooms`,
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
	const brandName = BRAND.name;
	const brandSlogan = BRAND.slogan;
	return {
		'@type': 'WebSite',
		'@id': `${origin}/#website`,
		url: origin,
		name: brandName,
		alternateName: `${brandName}: ${brandSlogan}`,
		description:
			'Stock, ETF, and options trading education built on 100% indicator-free price action, live trading rooms, SPX & swing watchlists, and $500+ small-account risk tools.',
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
				name: `Stock & Options Trading Rooms | ${BRAND.name}`,
				description: HOME_PAGE_DESCRIPTION,
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
			{
				'@type': 'ProfilePage',
				'@id': `${aboutUrl}#webpage`,
				url: aboutUrl,
				name: `About Us & Proven Track Record | ${BRAND.name}`,
				description: ABOUT_PAGE_DESCRIPTION,
				inLanguage: 'en-US',
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
						name: `About ${BRAND.name}`,
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
			'Retail trading education often pushes $1,500+ black-box indicator upsells, cherry-picked hindsight screenshots, and oversized option bets that blow up small accounts. Our charter replaces indicator clutter with 100% pure price structure, pre-committed invalidation stops, and public free calculators.'
	},
	{
		id: 'small-account-coverage',
		question:
			'What if I only have $500 to start learning? How do your risk rules address small balances?',
		answer:
			'Smaller balances cannot absorb wide dollar stops or unhedged 0DTE theta bleed. Our Small Accounts Room ($500+) and public FINRA Rule 4210 / Options calculators focus on T+1 settled-cash rotation, mini-XSP and liquid ETF contracts, and strict 1%–2% risk-per-trade discipline. Trading can still result in substantial or total loss of capital.'
	},
	{
		id: 'alert-only-memberships',
		question: "How do your standalone alert blueprints work if I can't join a live trading room?",
		answer:
			'SPX Profit Pulse delivers pre-market and intraday 5-point cash-settled index blueprints, while Sunday Alpha Protocol delivers a Sunday 5:00 PM ET HD video swing gameplan with conditional triggers, scaling targets, and binary stops designed for 9-to-5 working professionals.'
	},
	{
		id: 'mentorship-application-only',
		question: "Why can't I pay directly for 1-on-1 Mentorship without an application?",
		answer:
			'1-on-1 Mentorship is structured around reviewing a trader’s real execution habits, schedule, and risk management process. Requiring an application first ensures private coaching is reserved for traders committed to disciplined risk governance rather than shortcut signal chasing.'
	}
] as const;

export function buildMissionJsonLd(origin: string) {
	const missionUrl = `${origin}/our-mission`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			{
				'@type': 'WebPage',
				'@id': `${missionUrl}#webpage`,
				url: missionUrl,
				name: `Our Mission: People Over Profits | ${BRAND.name}`,
				description: MISSION_PAGE_DESCRIPTION,
				inLanguage: 'en-US',
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
					'Five non-negotiable standards: 100% pure price structure over lagging guru indicators, transparent curriculum, exact entries/exits/stops defined ahead of time, dedicated workflows for $500+ small accounts and working professionals, and selective 1-on-1 mentorship.',
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
		question: 'Why is 1-on-1 Mentorship structured around an application and fit review?',
		answer:
			'Effective 1-on-1 coaching depends on diagnosing your current execution leaks — whether late breakout chasing, stop-loss hesitation, or mis-sized options Greeks. Reviewing your background first ensures every private session targets measurable process improvements rather than generic lectures.'
	},
	{
		id: 'struggling-trader-rejected',
		question: 'I have struggled with lagging retail indicators in the past. Can I still apply?',
		answer:
			'Yes. Many traders seek mentorship specifically to strip 6+ conflicting oscillators off their charts and rebuild around Monthly-to-1-Minute pure price structure and binary invalidation stops. Past losses do not disqualify an applicant, though no coaching program can promise recovery of prior losses.'
	},
	{
		id: 'portfolio-managers',
		question: 'How is 1-on-1 Mentorship structured for experienced traders and capital allocators?',
		answer:
			'For experienced traders, sessions focus on top-down macro dislocation mapping, sector rotation structure, volatility skew, and asymmetric index/equity options hedging. All mentorship remains strictly educational process review — never personalized investment advisory or discretionary portfolio management.'
	},
	{
		id: 'rooms-while-reviewed',
		question: 'Should I explore your Methodology, Live Rooms, or Free Calculators first?',
		answer:
			'Yes. We encourage every prospective applicant to study our /methodology page, test position sizing inside the FINRA 2026 Intraday Margin and Options Greeks calculators, and compare our three Live Trading Rooms to align on terminology before private review.'
	}
] as const;

export function buildMentorshipJsonLd(origin: string) {
	const pageUrl = `${origin}/mentorship`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `1-on-1 Trading Mentorship | ${BRAND.name}`,
				description: MENTORSHIP_PAGE_DESCRIPTION,
				inLanguage: 'en-US',
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
					'Selective, application-only 1-on-1 mentorship teaching The Move Prior to The Move™ pure price structure and asymmetric special-situations risk discipline shaped by Mark "Goldfinger" McGoldrick (Goldman Sachs Global Special Situations Group).'
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
		question:
			'Do you trade micro-float penny stocks or liquid institutional indexes, ETFs, and large-caps?',
		answer:
			'We focus exclusively on deep-liquidity U.S. instruments — SPX, XSP, SPY, QQQ, IWM, S&P 500 GICS sector ETFs, and liquid large-cap equities/options. Trading deep institutional pools avoids the severe crowd front-running and bid-ask slippage common in low-float penny-stock rooms, though market risk and slippage remain present in fast markets.'
	},
	{
		id: 'live-voice-and-screen-share',
		question: 'What is the daily Live Floor schedule from pre-market through the 4:00 PM ET close?',
		answer:
			'Our trading floor follows three structured windows: 8:45–9:25 AM ET Pre-Market Structural Mapping (overnight supply/demand & bull/bear inflection levels), 9:30–11:30 AM ET Opening-Drive Live Voice & Screen-Share Execution, and 11:30 AM–4:00 PM ET Midday Chop Protection & Power-Hour Structure.'
	},
	{
		id: 'goldman-sachs-mentorship-lineage',
		question: 'How does Goldman Sachs Special Situations risk discipline shape intraday execution?',
		answer:
			'Billy Ribeiro’s mentorship under Mark "Goldfinger" McGoldrick (Co-Founder & Head of Goldman Sachs Global Special Situations Group and Founder of Mount Kellett Capital Management) instilled one core rule: never chase consensus noise — wait for structural dislocation where distance to binary invalidation is tiny relative to asymmetric upside.'
	},
	{
		id: 'spx-alerts-video-watchlists',
		question:
			'What if I only want cash-settled SPX index options blueprints without full-day voice chat?',
		answer:
			'Self-directed traders who want pre-market SPX/XSP structural zones, engineered strike specs, tiered scaling targets, and hard index invalidation stops without sitting on live voice audio can review SPX Profit Pulse under /alert-services/spx-profit-pulse.'
	},
	{
		id: 'pure-price-action-zero-indicators',
		question:
			'Do I need to buy proprietary indicators or paid chart add-ons to follow the Day Trading Room?',
		answer:
			'No. The Day Trading Room executes 100% indicator-free pure price action (The Move Prior to The Move™) from Monthly down to 1-Minute charts. Every structural supply, demand, and invalidation level works on clean candlesticks on any standard brokerage platform.'
	}
] as const;

export function buildDayTradingRoomJsonLd(origin: string) {
	const pageUrl = `${origin}/live-trading-rooms/day-trading-room`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `Live Day Trading Room | ${BRAND.name}`,
				description: DAY_TRADING_ROOM_DESCRIPTION,
				inLanguage: 'en-US',
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
					'Daily 8:45 AM ET pre-market structural preparation, real-time voice commentary, clean indicator-free screen sharing, and asymmetric price-action execution across liquid U.S. stocks, ETFs, and SPX/XSP options.'
				)
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{
						'@type': 'ListItem',
						position: 2,
						name: 'Live Trading Rooms',
						item: `${origin}/live-trading-rooms`
					},
					{ '@type': 'ListItem', position: 3, name: 'Day Trading Room', item: pageUrl }
				]
			}
		]
	};
}

export const SWING_TRADING_ROOM_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'working-pro-daily-time',
		question:
			'How much time per day do I need to follow the Swing Trading Room with a 9-to-5 career?',
		answer:
			'The Swing Trading Room is structured around outside-hours preparation: a Sunday macro/sector roadmap plus concise 15-to-20-minute evening video chart reviews so conditional entry triggers, scaling targets, and hard invalidation stops can be staged without watching 1-minute ticks at work.'
	},
	{
		id: 'stocks-etfs-options-coverage',
		question: 'Do you swing trade shares of stock, sector ETFs, or multi-week options contracts?',
		answer:
			'We cover all three — liquid S&P 500 large-cap equities, the 11 GICS sector ETFs (which reduce single-company overnight headline gaps), and multi-week options or vertical spreads structured with enough DTE to prevent rapid overnight theta decay.'
	},
	{
		id: 'swing-room-vs-sunday-alpha-protocol',
		question:
			'How is the Swing Trading Room different from your Sunday Alpha Protocol alert service?',
		answer:
			'The Swing Trading Room provides interactive desk discussion, evening chart reviews, and member Q&A throughout the week. Sunday Alpha Protocol is a standalone weekly Sunday 5:00 PM ET HD video watchlist and written blueprint for self-directed traders who want prepared levels without an interactive chatroom.'
	},
	{
		id: 'methodology-2020-2022-oxy',
		question: 'How does Monthly-to-Daily pure price structure identify multi-week market turns?',
		answer:
			'Major swing inflections begin when Monthly and Weekly institutional supply or demand aligns with Daily exhaustion — the same top-down framework documented in our archived 2020, 2022, and OXY historical case studies on /track-record. Past historical calls are non-typical and never guarantee future swing outcomes.'
	},
	{
		id: 'zero-indicator-dependency',
		question: 'Do I need custom indicators or scanners to follow the Swing Trading Room?',
		answer:
			'No. Every multi-day swing setup is mapped on 100% clean, indicator-free price charts using The Move Prior to The Move™, paired with our free Options Profit & Greeks Calculator to model multi-day theta and breakeven levels before entry.'
	}
] as const;

export function buildSwingTradingRoomJsonLd(origin: string) {
	const pageUrl = `${origin}/live-trading-rooms/swing-trading-room`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `Live Swing Trading Room | ${BRAND.name}`,
				description: SWING_TRADING_ROOM_DESCRIPTION,
				inLanguage: 'en-US',
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
					'Multi-day stock, ETF, and options swing trading room built on Monthly-to-Daily pure price structure, delivering pre-planned entry triggers, tiered targets, binary stop-losses, and evening video chart reviews.'
				)
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{
						'@type': 'ListItem',
						position: 2,
						name: 'Live Trading Rooms',
						item: `${origin}/live-trading-rooms`
					},
					{ '@type': 'ListItem', position: 3, name: 'Swing Trading Room', item: pageUrl }
				]
			}
		]
	};
}

export const SMALL_ACCOUNTS_ROOM_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'starting-capital-500',
		question: 'How is a $500 to $2,500 balance approached inside the Small Accounts Room?',
		answer:
			'Smaller accounts face unforgiving math: a single $250 option loss wipes out 50% of a $500 account and requires a +100% gain just to recover breakeven. We focus on strict per-trade risk caps, mini-XSP and liquid ETF contracts, and defined-risk vertical spreads — $500 is an educational sizing baseline, not a recommendation or guarantee of account survival.'
	},
	{
		id: 'cash-vs-margin-account-under-25k',
		question:
			'How do T+1 Cash Accounts and FINRA Rule 4210(d)(2) Intraday Margin apply to smaller accounts?',
		answer:
			'Under FINRA Regulatory Notice 26-10 / Amended Rule 4210(d)(2) (effective June 4, 2026 with broker rollout through October 20, 2027), margin accounts meeting the $2,000 minimum equity baseline transition from the 4-trade/$25,000 PDT rule to real-time Intraday Margin Level (IML) monitoring. Accounts under $2,000 or in T+1 cash accounts settle equities and options overnight on the next business day, allowing daily settled-cash rotation without Good Faith Violations.'
	},
	{
		id: 'goldman-sachs-pedigree-small-accounts',
		question:
			'Why apply institutional special-situations risk discipline to $500+ retail accounts?',
		answer:
			'Asymmetric risk architecture matters most when capital is scarce. Waiting for Monthly-to-1-Minute pure price alignment keeps structural invalidation tight so small accounts avoid bleeding premium in mid-range chop.'
	},
	{
		id: 'full-time-job-small-account',
		question: 'What if I work a full-time job and also manage a $500 to $2,500 account?',
		answer:
			'The room covers both morning T+1 cash rotation setups and multi-day defined-risk vertical spreads that do not require staring at 1-minute ticks for 6.5 hours. Every session is archived on demand with written invalidation levels.'
	},
	{
		id: 'graduating-past-10k-25k',
		question: 'Which free calculators pair directly with the Small Accounts Room?',
		answer:
			'Members and visitors can run exact pre-trade math at $0 cost using our FINRA 2026 Intraday Margin & Asymmetric Sizing Calculator (/resources/intraday-margin-calculator) and our Black-Scholes Options Profit & Greeks Calculator (/resources/options-calculator).'
	}
] as const;

export function buildSmallAccountsRoomJsonLd(origin: string) {
	const pageUrl = `${origin}/live-trading-rooms/small-accounts-room`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `Small Accounts Trading Room | ${BRAND.name}`,
				description: SMALL_ACCOUNTS_ROOM_DESCRIPTION,
				inLanguage: 'en-US',
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
					'Dedicated live trading room and risk-governance framework engineered for $500+ accounts, covering mini-XSP and liquid ETF options, T+1 cash account rotation, FINRA Rule 4210(d)(2) intraday margin discipline, and binary stop-loss rules.'
				)
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{
						'@type': 'ListItem',
						position: 2,
						name: 'Live Trading Rooms',
						item: `${origin}/live-trading-rooms`
					},
					{ '@type': 'ListItem', position: 3, name: 'Small Accounts Room', item: pageUrl }
				]
			}
		]
	};
}

export const LIVE_TRADING_ROOMS_HUB_DESCRIPTION =
	'Compare our three live stock, ETF, and options trading rooms across intraday opening-bell, multi-day swing, and $500+ small-account formats and risk rules.';

export const LIVE_TRADING_ROOMS_HUB_FAQ_ITEMS: readonly FaqItem[] = CONCEPT_PREVIEW
	? [
			{
				id: 'why-three-separate-trading-rooms',
				question: 'Why are the trading rooms separated into three distinct formats?',
				answer:
					'Intraday execution at the 9:30 AM ET bell, multi-day swing planning outside work hours, and $500+ small-account risk management require different preparation schedules, hold horizons, and position-sizing rules. Separating into three proposed rooms aligns each workflow with those constraints. No live subscriptions are currently available.'
			},
			{
				id: 'which-room-for-nine-to-five-schedule',
				question:
					'Which trading room fits a full-time 9-to-5 schedule with limited daytime screen time?',
				answer:
					'The proposed Swing Trading Room is structured around Sunday macro briefings and 15-to-20-minute evening chart reviews with pre-planned entry zones, targets, and invalidation stops for conditional orders. Traders who prefer prepared video watchlists without an interactive room can also review the Sunday Alpha Protocol concept.'
			},
			{
				id: 'small-account-under-2500-settlement-margin-rules',
				question:
					'Which room is structured for $500 to $2,500 balances under T+1 cash and FINRA intraday margin rules?',
				answer:
					'Review the Small Accounts Room ($500+) concept. Even with FINRA Rule 4210 replacing the legacy $25,000 day-trade threshold with real-time intraday margin standards, smaller accounts still face the $2,000 margin baseline, T+1 settled-cash constraints, and steep percentage drawdowns from oversized contracts. This room focuses on per-contract cost ceilings and defined-risk vertical spreads.'
			},
			{
				id: 'markets-and-instruments-traded-across-rooms',
				question: 'What markets and instruments are covered across the three trading rooms?',
				answer:
					'All three proposed rooms focus on liquid US large-cap equities, major index and sector ETFs (such as SPY, QQQ, and IWM), and high-volume options contracts or vertical spreads with tight bid-ask spreads rather than illiquid micro-cap equities.'
			},
			{
				id: 'live-rooms-vs-alert-services-difference',
				question:
					'How do the Live Trading Rooms differ from SPX Profit Pulse and Sunday Alpha Protocol?',
				answer:
					'The Live Trading Rooms are interactive desk environments featuring live or evening commentary, screen sharing, member Q&A, and archived session recordings. SPX Profit Pulse and Sunday Alpha Protocol are video watchlist concepts built for self-directed traders who only want pre-planned levels and scenario briefings.'
			},
			{
				id: 'missed-live-session-replays-and-autopsies',
				question: 'Are sessions recorded if I miss the opening bell or an evening briefing?',
				answer:
					'Every proposed room blueprint includes archived session recordings, written level summaries, and post-session reviews covering both winning trades and stop-outs so members across US and Canadian time zones can review sessions on demand.'
			}
		]
	: [
			{
				id: 'why-three-separate-trading-rooms',
				question: 'Why are the trading rooms separated into three distinct formats?',
				answer:
					'Intraday execution at the 9:30 AM ET bell, multi-day swing planning outside work hours, and $500+ small-account risk management require different preparation windows, hold horizons, and position-sizing rules. Separating into three dedicated rooms ensures each session follows risk parameters matched to a specific schedule and account structure.'
			},
			{
				id: 'which-room-for-nine-to-five-schedule',
				question:
					'Which trading room fits a full-time 9-to-5 schedule with limited daytime screen time?',
				answer:
					'The Live Swing Trading Room is structured around Sunday macro briefings and 15-to-20-minute evening chart reviews, providing planned entry zones, profit targets, and invalidation levels suitable for conditional orders. Traders who prefer standalone video watchlists without an interactive room can also review Sunday Alpha Protocol.'
			},
			{
				id: 'small-account-under-2500-settlement-margin-rules',
				question:
					'Which room is structured for $500 to $2,500 balances under T+1 cash and FINRA intraday margin rules?',
				answer:
					'The Small Accounts Room ($500+) is built specifically for smaller balances. While FINRA Rule 4210 (effective June 2026) replaced the legacy $25,000 day-trading rule with real-time intraday margin monitoring, accounts under the $2,000 margin baseline still rely on T+1 settled-cash rotation, and small margin accounts face strict intraday margin cushions. This room enforces per-contract cost ceilings and defined-risk vertical spreads.'
			},
			{
				id: 'markets-and-instruments-traded-across-rooms',
				question: 'What markets and instruments are traded across the three rooms?',
				answer:
					'All three rooms focus on liquid US large-cap equities, major index and sector ETFs (such as SPY, QQQ, and IWM), and liquid options contracts or vertical spreads with tight bid-ask spreads rather than illiquid micro-cap stocks.'
			},
			{
				id: 'live-rooms-vs-alert-services-difference',
				question:
					'How do the Live Trading Rooms differ from SPX Profit Pulse and Sunday Alpha Protocol?',
				answer:
					'Our Live Trading Rooms are interactive desk environments with live voice commentary, screen sharing, evening chart reviews, member Q&A, and archived session replays. SPX Profit Pulse and Sunday Alpha Protocol are standalone video watchlist memberships for self-directed traders who only want prepared levels, targets, and invalidation zones.'
			},
			{
				id: 'missed-live-session-replays-and-autopsies',
				question: 'Are sessions recorded if I miss the opening bell or an evening briefing?',
				answer:
					'Yes. Sessions, written level recaps, and post-session trade reviews covering both winning setups and disciplined stop-outs are recorded and archived on demand across all US and Canadian time zones.'
			}
		];

export function buildLiveTradingRoomsHubJsonLd(origin: string) {
	const pageUrl = `${origin}/live-trading-rooms`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			{
				'@type': 'CollectionPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `Live Trading Rooms | ${BRAND.name}`,
				description: LIVE_TRADING_ROOMS_HUB_DESCRIPTION,
				inLanguage: 'en-US',
				about: { '@id': `${origin}/#organization` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
				mainEntity: { '@id': `${pageUrl}#rooms-list` }
			},
			{
				'@type': 'ItemList',
				'@id': `${pageUrl}#rooms-list`,
				name: `${BRAND.name} Live Stock, ETF & Options Trading Rooms`,
				description: describeProposedConcept(
					'Three specialized stock, ETF, and options trading rooms segmented by intraday opening-bell execution, 9-to-5 multi-day swing trading, and $500+ small-account risk management.'
				),
				numberOfItems: LIVE_TRADING_ROOMS_CARDS.length,
				itemListElement: LIVE_TRADING_ROOMS_CARDS.map((room, idx) => ({
					'@type': 'ListItem',
					position: idx + 1,
					name: room.schemaName,
					url: `${origin}${room.href}`,
					description: describeProposedConcept(room.schemaDescription),
					item: { '@id': `${origin}${room.href}#service` }
				}))
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{ '@type': 'ListItem', position: 2, name: 'Live Trading Rooms', item: pageUrl }
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
			{
				'@type': 'CollectionPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `Stock & Options Trading Blog | ${BRAND.name}`,
				description:
					'Free institutional stock and options trading articles, Options Greeks guides, $500+ small account strategies, and macro analysis by Billy Ribeiro.',
				inLanguage: 'en-US',
				about: { '@id': `${pageUrl}#blog` },
				mainEntity: { '@id': `${pageUrl}#blog` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'Blog',
				'@id': `${pageUrl}#blog`,
				url: pageUrl,
				name: `Stock & Options Trading Blog | ${BRAND.name}`,
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
			'Confirmed bar-close permanence is a proposed engineering goal requiring reproducible testing. It is not a profit promise or evidence of profitability; no indicator is available for purchase.'
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
			{
				'@type': 'CollectionPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `Custom Trading Indicators | ${BRAND.name}`,
				description:
					'Preview proposed trading indicator concepts for chart study, market structure, and risk education. Educational chart-structure reference.',
				inLanguage: 'en-US',
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
				name: `${BRAND.name} Chart Structure Study Tools`,
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
			{
				'@type': 'CollectionPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `Stock & Options Trading Courses | ${BRAND.name}`,
				description:
					'Explore proposed stock and options course concepts covering market structure, trade planning, and risk education. In development; paid enrollment unavailable.',
				inLanguage: 'en-US',
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
				name: `${BRAND.name} Institutional Stock & Options Curriculum`,
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
		id: 'confirmed-close-guarantee',
		question: 'Do any of the indicators in this package repaint after the candle closes?',
		answer:
			'There is no released product or current signal permanence claim. Signal permanence and historical behavior would need reproducible validation before any such claim.'
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
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `Move Prior to The Move Course | ${BRAND.name}`,
				description:
					'Master institutional order flow, multi-timeframe squeezes, and Options Greeks with Billy Ribeiro. Includes ThinkorSwim and TradingView chart structure templates.',
				inLanguage: 'en-US',
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
					'Master institutional order flow, multi-timeframe squeezes, and Options Greeks with Billy Ribeiro. Includes ThinkorSwim and TradingView chart structure templates.'
				),
				provider: { '@id': `${origin}/#organization` },
				serviceType: 'Self-Paced Options Trading Curriculum and Market Structure Curriculum',
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
		id: 'signals-confirmed-close',
		question: 'Do any of the Buy/Sell or Early In/Out signals repaint?',
		answer:
			'The displayed signals are illustrative. Confirmed bar-close behavior and performance carry no outcome promise and require validation in a released implementation.'
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
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `MP Early In & Out Indicator | ${BRAND.name}`,
				description:
					'Explore the proposed indicator suite and illustrative chart concepts for market structure and risk education. In development; no purchases or access offered.',
				inLanguage: 'en-US',
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

export const SPX_PROFIT_PULSE_DESCRIPTION =
	'Cash-settled SPX and mini-XSP index options alert service delivering 5-point pre-trade price-action blueprints, strike specs, targets, and hard stops.';

export const SPX_PROFIT_PULSE_FAQ_ITEMS: FaqItem[] = [
	{
		id: 'watch-market-all-day',
		question: 'Do I have to watch the market all day to follow SPX Profit Pulse dispatches?',
		answer:
			'No. Every trading day begins with a pre-market structural blueprint mapping higher-timeframe SPX inflection zones before 9:30 AM ET, and intraday dispatches specify conditional triggers, scaling targets, and binary index invalidation levels — plus explicit sit-out notices when SPX enters mid-range chop.'
	},
	{
		id: 'zero-dte-or-multi-day',
		question:
			'Do you only cover 0DTE (Zero Days to Expiration), or also short-dated multi-day SPX structures?',
		answer:
			'Both. Depending on implied volatility skew and time of day, dispatches cover cash-settled 0DTE setups during clean directional expansion and 1–5 DTE single-leg or vertical spread structures when theta bleed would penalize 0DTE buyers. Short-dated options carry rapid risk of 100% loss of premium committed.'
	},
	{
		id: 'small-account-compatibility',
		question: 'How do $500 to $2,500 accounts approach SPX setups safely?',
		answer:
			'Full-sized SPX contracts represent 10x SPY notional exposure and can exceed small-account risk budgets. Smaller accounts typically study mini-XSP cash-settled index options (1/10th SPX size, retaining European-style cash settlement and U.S. Section 1256 tax treatment) or narrow defined-risk vertical spreads sized inside our free Options Calculator.'
	},
	{
		id: 'difference-from-day-room-sunday-alpha-protocol',
		question:
			'How is SPX Profit Pulse different from the Live Day Trading Room or Sunday Alpha Protocol?',
		answer:
			'SPX Profit Pulse is a standalone intraday S&P 500 index options blueprint service without full-day voice chat. The Live Day Trading Room provides real-time voice commentary and screen sharing across equities, ETFs, and SPX, while Sunday Alpha Protocol delivers weekly multi-day swing setups every Sunday at 5:00 PM ET.'
	}
];

export function buildSpxProfitPulseJsonLd(origin: string) {
	const pageUrl = `${origin}/alert-services/spx-profit-pulse`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `SPX Profit Pulse Options Alerts | ${BRAND.name}`,
				description: SPX_PROFIT_PULSE_DESCRIPTION,
				inLanguage: 'en-US',
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
						name: 'Alert Services',
						item: `${origin}/alert-services`
					},
					{
						'@type': 'ListItem',
						position: 3,
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
					'Cash-settled SPX and mini-XSP index options alert service delivering 5-point pre-trade pure price-action blueprints, strike specs, tiered profit targets, and binary index invalidation levels.'
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
		id: 'scanners-confirmed-real-time',
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
			{
				'@type': 'CollectionPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `Live Stock & Options Scanners | ${BRAND.name}`,
				description:
					'Explore proposed market scanner concepts for chart screening, liquidity study, and risk education. Educational market-screening reference.',
				inLanguage: 'en-US',
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
				name: `${BRAND.name} Institutional Market Scanners`,
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
		id: 'confirmed-real-time-triggers',
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
			'A guided setup experience is proposed. Installation time, import links, training, and software access are not currently promised in advance.'
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
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `High Octane Options Scanner | ${BRAND.name}`,
				description:
					'Preview the High Octane scanner concept, illustrative chart screening, and proposed market filters. In development; no purchases or paid access available.',
				inLanguage: 'en-US',
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
			{
				'@type': 'CollectionPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `ETF Stocks List & Sector Guide | ${BRAND.name}`,
				description:
					'Complete ETF stocks list covering SPY, QQQ, IWM, and all 11 S&P 500 sector ETFs. Compare options liquidity, expense ratios, and institutional setups.',
				inLanguage: 'en-US',
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

export const STOCK_INDEXES_LIST_DESCRIPTION =
	'Compare SPX, XSP, NDX, RUT, and VIX cash-settled European index options vs. SPY and QQQ ETFs, early assignment risk, and 60/40 IRS Section 1256 tax rules.';

export function buildStockIndexesListJsonLd(origin: string) {
	const pageUrl = `${origin}/resources/stock-indexes-list`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			{
				'@type': 'CollectionPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `Cash-Settled Indexes & 1256 Guide | ${BRAND.name}`,
				description: STOCK_INDEXES_LIST_DESCRIPTION,
				inLanguage: 'en-US',
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
						name: 'Cash-Settled Indexes & Section 1256',
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

export const RESOURCES_HUB_DESCRIPTION =
	'Free options profit & Greeks calculator, FINRA 2026 Rule 4210 intraday margin calculator, S&P 500 ETF directory, index guide, and price-action playbooks.';

export const RESOURCES_HUB_UTILITIES = [
	{
		name: 'Options Profit, Risk & Greeks Calculator',
		description: 'Black-Scholes Payoff Curve, Delta/Theta Simulation & Small-Account Sizer',
		path: '/resources/options-calculator'
	},
	{
		name: 'FINRA 2026 Intraday Margin & Position Sizer',
		description: 'Rule 4210(d)(2) IML/IMD Exposure, De Minimis Buffer & T+1 Cash Rotation',
		path: '/resources/intraday-margin-calculator'
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
			{
				'@type': 'CollectionPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `Free Trading Resources & Tools | ${BRAND.name}`,
				description: RESOURCES_HUB_DESCRIPTION,
				inLanguage: 'en-US',
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

export const SUNDAY_ALPHA_PROTOCOL_DESCRIPTION =
	'Weekly Sunday 5:00 PM ET stock, ETF, and options swing trading video watchlist with Monthly-to-Daily price structure, entry triggers, and hard stops.';

export const SUNDAY_ALPHA_PROTOCOL_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'sunday-dispatch-time',
		question: 'When is the Sunday Alpha Protocol briefing published each week?',
		answer:
			'The Sunday Alpha Protocol briefing is designed around a Sunday 5:00 PM ET weekly dispatch window ahead of U.S. equity futures reopening, giving working professionals the entire evening to study Monthly-to-Daily market structure and stage conditional alerts before Monday’s 9:30 AM ET bell.'
	},
	{
		id: 'markets-and-asset-classes',
		question: 'What markets and asset classes are covered inside Sunday Alpha Protocol?',
		answer:
			'Coverage focuses on deep-liquidity U.S. large-cap equities, SPY/QQQ/IWM, and the 11 official S&P 500 GICS sector ETFs paired with multi-week options or vertical spreads structured to minimize overnight theta bleed.'
	},
	{
		id: 'risk-to-reward-math',
		question: 'How does the 1:2.50 minimum asymmetric reward-to-risk blueprint work?',
		answer:
			'Every scenario maps a higher-timeframe supply or demand zone where the binary invalidation stop sits just beyond structural support or resistance while opposing liquidity targets offer at least 2.5x the planned risk distance. Planned reward-to-risk ratios are structural targets, not probability or profit guarantees.'
	},
	{
		id: 'screen-time-requirements',
		question:
			'Do I need to sit in front of screens during market hours to use Sunday Alpha Protocol?',
		answer:
			'No. Setups are structured around Daily and 4-Hour price action with explicit conditional entry triggers, tiered scaling targets, and hard invalidation prints so 9-to-5 professionals can study outside market hours.'
	},
	{
		id: 'cancellation-policy',
		question: 'Where can I review billing, cancellation, and pre-commerce status?',
		answer:
			'Full subscription governance, cancellation terms, and current pre-commerce launch status are published transparently on our /refund-policy and /terms-of-service pages.'
	}
] as const;

export function buildSundayAlphaProtocolJsonLd(origin: string) {
	const pageUrl = `${origin}/alert-services/sunday-alpha-protocol`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
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
					'Creator of The Move Prior to The Move™ 100% indicator-free multi-timeframe price-action methodology for U.S. equities, ETFs, and index options.',
				sameAs: ['https://twitter.com/BillyRibeiro', 'https://tradingview.com/u/BillyRibeiro']
			},
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `Sunday Alpha Protocol | ${BRAND.name}`,
				description: SUNDAY_ALPHA_PROTOCOL_DESCRIPTION,
				inLanguage: 'en-US',
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
					'Weekly high-conviction swing trading intelligence for U.S. large-cap equity and ETF options traders. Delivers 5 to 7 structured trade setups with confirmation triggers, binary stop invalidations, and explicit options contracts every Sunday at 5:00 PM ET.'
				)
			},
			{
				'@type': 'Product',
				'@id': `${pageUrl}#protocol`,
				name: 'Sunday Alpha Protocol',
				description: describeProposedConcept(
					'Weekly high-conviction swing trading intelligence for U.S. large-cap equity and ETF options traders. Delivers 5 to 7 structured trade setups with confirmation triggers, binary stop invalidations, and explicit options contracts every Sunday at 5:00 PM ET.'
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
						name: 'Alert Services',
						item: `${origin}/alert-services`
					},
					{
						'@type': 'ListItem',
						position: 3,
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
			{
				'@type': config.schemaType ?? 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `${config.title} | ${BRAND_NAME}`,
				description: config.description,
				inLanguage: 'en-US',
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

export const CONTACT_PAGE_DESCRIPTION = `Contact ${BRAND.name} regarding trading rooms, alert services, 1-on-1 mentorship inquiries, editorial corrections, and U.S. or Canada support.`;

export const EDITORIAL_POLICY_DESCRIPTION = CONCEPT_PREVIEW
	? 'Read how AI is used in this trading education website concept, its content limitations, source verification goals, and process for reporting possible errors.'
	: `Read the ${BRAND.name} editorial standards, primary-source verification rules, CFTC/FINRA compliance gates, and error-correction procedures.`;

export const TERMS_OF_SERVICE_DESCRIPTION = `Review the ${BRAND.name} terms of service, educational publisher scope, intellectual property rules, and U.S. and Canadian user obligations.`;

export const REFUND_POLICY_DESCRIPTION = CONCEPT_PREVIEW
	? 'Read the current purchase, billing, and refund status of this website concept. No purchases or paid subscriptions have ever been made available to visitors.'
	: `Review the ${BRAND.name} subscription cancellation, billing governance, and digital educational membership refund terms for U.S. and Canada.`;

export const RISK_DISCLOSURE_DESCRIPTION =
	'Read our full U.S. and Canadian equities, ETFs, and options risk disclosure covering OCC characteristics, CFTC Rule 4.41 hypothetical limits, and T+1.';

export function buildContactPageJsonLd(origin: string) {
	return buildTrustPageJsonLd(origin, {
		path: '/contact',
		breadcrumbName: 'Contact',
		title: 'Contact Our Trading Desk',
		description: CONTACT_PAGE_DESCRIPTION,
		schemaType: 'ContactPage'
	});
}

export function buildEditorialPolicyPageJsonLd(origin: string) {
	return buildTrustPageJsonLd(origin, {
		path: '/editorial-policy',
		breadcrumbName: 'Editorial Policy',
		title: 'Editorial Policy & Standards',
		description: EDITORIAL_POLICY_DESCRIPTION
	});
}

export function buildPrivacyPolicyPageJsonLd(origin: string) {
	return buildTrustPageJsonLd(origin, {
		path: '/privacy-policy',
		breadcrumbName: 'Privacy Policy',
		title: 'Privacy Policy & Data Security',
		description: `Learn how ${BRAND.name} collects, protects, and handles member account data, cookies, and analytics across US and Canadian jurisdictions.`
	});
}

export function buildTermsOfServicePageJsonLd(origin: string) {
	return buildTrustPageJsonLd(origin, {
		path: '/terms-of-service',
		breadcrumbName: 'Terms of Service',
		title: 'Terms of Service & Disclosures',
		description: TERMS_OF_SERVICE_DESCRIPTION
	});
}

export function buildRefundPolicyPageJsonLd(origin: string) {
	return buildTrustPageJsonLd(origin, {
		path: '/refund-policy',
		breadcrumbName: 'Refund Policy',
		title: 'Cancellation & Refund Policy',
		description: REFUND_POLICY_DESCRIPTION
	});
}

export const RISK_DISCLOSURE_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'investment-advisor-status',
		question: `Is ${BRAND.name} a registered investment advisor or broker-dealer?`,
		answer: `No. ${BRAND.name} is an impersonal financial trading education publisher operating under the publisher’s exclusion of the U.S. Investment Advisers Act of 1940 (15 U.S.C. § 80b-2(a)(11)(D)) and comparable Canadian provincial securities education exemptions. Nothing published in our rooms, watchlists, calculators, or articles constitutes personalized investment, legal, or tax advice.`
	},
	{
		id: 'occ-options-disclosure',
		question: 'What special risks apply to trading listed equity, ETF, and SPX/XSP index options?',
		answer:
			'Options involve leverage, non-linear implied volatility shifts, and daily time decay (theta) that can cause rapid 100% loss of premium committed — especially on short-dated and 0DTE contracts. Prior to trading options, every trader should read the Options Clearing Corporation (OCC) publication "Characteristics and Risks of Standardized Options."'
	},
	{
		id: 'cftc-441-hypothetical-limits',
		question: 'How should historical case studies and calculator outputs be interpreted?',
		answer:
			'Pursuant to CFTC Rule 4.41 and SEC/FTC truth-in-advertising standards, historical case studies are non-typical archival examples and interactive calculator outputs are mathematical simulations that exclude live bid-ask slippage, exchange fees, and Liquidity changes. Past performance never guarantees future results.'
	},
	{
		id: 'finra-4210-t1-responsibility',
		question: 'Who determines my account’s margin requirements and T+1 settlement rules?',
		answer:
			'Your carrying broker-dealer enforces FINRA Rule 4210(d)(2) intraday maintenance margin (or legacy PDT rules until its cutover before October 20, 2027), house margin overlays, and T+1 cash-account Good Faith Violation rules. Always verify your broker’s live margin schedule before routing orders.'
	}
] as const;

export function buildRiskDisclosurePageJsonLd(origin: string) {
	return buildTrustPageJsonLd(origin, {
		path: '/risk-disclosure',
		breadcrumbName: 'Risk Disclosure',
		title: 'Risk & Regulatory Disclosure',
		description: RISK_DISCLOSURE_DESCRIPTION
	});
}

/* ============================================================================
 * NEW & GRADUATED CORNERSTONE, HUB, LEDGER, CALCULATOR & COMPARISON BUILDERS
 * ============================================================================ */

export const METHODOLOGY_PAGE_DESCRIPTION =
	'Inside The Move Prior to The Move™: 100% indicator-free Monthly-to-1-Minute pure price action, asymmetric options structuring, and binary invalidation.';

export const METHODOLOGY_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'what-is-move-prior-to-the-move',
		question: 'What is The Move Prior to The Move™ and why does it use zero indicators?',
		answer:
			'The Move Prior to The Move™ is Billy Ribeiro’s 100% indicator-free price-action methodology. Because RSI, MACD, and moving averages are lagging mathematical averages of already-completed prices, stripping them away lets traders align Monthly, Weekly, and Daily supply/demand directly with 1-Minute structural rejection and binary invalidation stops.'
	},
	{
		id: 'goldman-special-situations-influence',
		question: 'How did Mark "Goldfinger" McGoldrick’s mentorship shape this methodology?',
		answer:
			'Mark "Goldfinger" McGoldrick — former Goldman Sachs Partner, Co-Founder & Head of Goldman Sachs Global Special Situations Group (GSSG), and Founder of Mount Kellett Capital Management — focused on asymmetric structural dislocations rather than consensus headlines. Billy Ribeiro adapted that special-situations discipline to clean multi-timeframe price charts and defined-risk options structuring.'
	},
	{
		id: 'works-for-small-accounts-and-swings',
		question:
			'Does the same pure price-action framework apply to 0DTE SPX, multi-day swings, and $500+ accounts?',
		answer:
			'Yes. Market structure is fractal across timeframes: the Live Day Trading Room and SPX Profit Pulse apply Monthly-to-1-Minute alignment intraday, Sunday Alpha Protocol and the Swing Room apply Monthly-to-Daily structure for 9-to-5 schedules, and the Small Accounts Room pairs those exact levels with T+1 cash and FINRA Rule 4210 sizing.'
	},
	{
		id: 'binary-invalidation-definition',
		question: 'What does "binary price invalidation" mean before entering an options trade?',
		answer:
			'Before any order is staged, we identify the exact underlying share or SPX index price that proves the structural setup wrong. If price prints that level, the trade is closed mechanically — never averaged down or held on hope.'
	}
] as const;

export function buildMethodologyJsonLd(origin: string) {
	const pageUrl = `${origin}/methodology`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `Pure Price Action Methodology | ${BRAND.name}`,
				description: METHODOLOGY_PAGE_DESCRIPTION,
				inLanguage: 'en-US',
				about: { '@id': `${pageUrl}#article` },
				mainEntity: { '@id': `${pageUrl}#article` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'Article',
				'@id': `${pageUrl}#article`,
				headline: 'Price Action Trading Without Indicators: Inside The Move Prior to The Move™',
				description: METHODOLOGY_PAGE_DESCRIPTION,
				inLanguage: 'en-US',
				url: pageUrl,
				datePublished: '2026-11-16',
				dateModified: '2026-11-16',
				author: { '@id': `${origin}/#founder` },
				publisher: { '@id': `${origin}/#organization` },
				image: `${origin}${BRAND_SOCIAL_IMAGE_PATH}`,
				mainEntityOfPage: { '@id': `${pageUrl}#webpage` }
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{ '@type': 'ListItem', position: 2, name: 'Our Methodology', item: pageUrl }
				]
			}
		]
	};
}

export const ALERT_SERVICES_HUB_DESCRIPTION =
	'Compare SPX Profit Pulse intraday cash-settled index dispatches and Sunday Alpha Protocol weekly swing blueprints built on pure price-action structure.';

export const ALERT_SERVICES_HUB_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'spx-pulse-vs-sunday-alpha',
		question: 'Should I choose SPX Profit Pulse or Sunday Alpha Protocol?',
		answer:
			'Choose SPX Profit Pulse if you want intraday cash-settled S&P 500 (SPX and mini-XSP) index options blueprints during market hours without sitting in all-day voice chat. Choose Sunday Alpha Protocol if you work a full-time 9-to-5 schedule and want multi-day large-cap equity, sector ETF, and options swing plans delivered every Sunday at 5:00 PM ET.'
	},
	{
		id: 'five-point-blueprint-standard',
		question: 'What is included in every 5-point alert blueprint?',
		answer:
			'Every dispatch specifies: (1) Higher-timeframe Monthly-to-4H supply/demand location, (2) 1m/15m confirmation trigger behavior, (3) Engineered option contract/spread structure matched to implied volatility and DTE, (4) Tiered T1/T2 scaling targets, and (5) Binary underlying invalidation stop.'
	},
	{
		id: 'zero-indicators-required',
		question: 'Do I need paid indicators or custom chart software to follow the alerts?',
		answer:
			'No. Both SPX Profit Pulse and Sunday Alpha Protocol are built 100% on The Move Prior to The Move™ pure price structure — every chart level maps onto clean candlesticks on any standard U.S. or Canadian brokerage platform.'
	},
	{
		id: 'section-1256-and-small-accounts',
		question: 'Can smaller accounts ($500 to $2,500) follow these alert blueprints?',
		answer:
			'Smaller accounts studying SPX Profit Pulse use mini-XSP contracts (1/10th SPX notional size, cash-settled with no early assignment) or defined-risk vertical spreads, and should size every trade first inside our free FINRA 2026 Intraday Margin and Options Greeks calculators.'
	}
] as const;

export function buildAlertServicesHubJsonLd(origin: string) {
	const pageUrl = `${origin}/alert-services`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			{
				'@type': 'CollectionPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `Options & SPX Alert Services | ${BRAND.name}`,
				description: ALERT_SERVICES_HUB_DESCRIPTION,
				inLanguage: 'en-US',
				about: { '@id': `${origin}/#organization` },
				mainEntity: { '@id': `${pageUrl}#alerts-list` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'ItemList',
				'@id': `${pageUrl}#alerts-list`,
				name: `${BRAND.name} Price-Action Options & SPX Alert Services`,
				numberOfItems: ALERT_SERVICE_CARDS.length,
				itemListElement: ALERT_SERVICE_CARDS.map((card, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					name: card.name,
					description: card.summary,
					url: `${origin}${card.href}`
				}))
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{ '@type': 'ListItem', position: 2, name: 'Alert Services', item: pageUrl }
				]
			}
		]
	};
}

export const TRACK_RECORD_PAGE_DESCRIPTION =
	'Review our public trade ledger verification standard, permanent stop-out retention policy, and archived 2020, 2022, and OXY structural case studies.';

export const TRACK_RECORD_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'why-stop-outs-stay-visible',
		question: 'Do you keep stopped-out trades and invalidated setups visible in the ledger?',
		answer:
			'Yes — permanently. Hindsight marketing hides losses, whereas institutional risk management is defined by cutting invalidated setups mechanically at the pre-committed stop so capital stays intact for asymmetric winners.'
	},
	{
		id: 'verification-badge-criteria',
		question: 'What is required before a trade receives a Primary-Receipt Verified Ledger status?',
		answer:
			'Under our verification gate, a trade row is only marked Primary-Receipt Verified when paired with a dated pre-trade room/alert dispatch timestamp, exact option contract or share parameters, binary invalidation stop, and post-session archive artifact — never reconstructed hypothetical backtests.'
	},
	{
		id: 'historical-2020-2022-oxy-status',
		question: 'How are Billy Ribeiro’s 2020 COVID, 2022 Bear Cycle, and 2022 OXY calls classified?',
		answer:
			'Those three historical market calls are presented as Archived Founder Case Studies corroborated in external trader interviews (TradingGreats), with explicit CFTC Rule 4.41 non-typicality disclosures while primary historical chart/room artifacts are indexed.'
	},
	{
		id: 'typical-results-expectation',
		question: 'Should a new member expect +600% overnight options returns?',
		answer:
			'No. Multi-hundred-percent overnight options moves are rare statistical outliers during extreme structural dislocations. Options trading involves substantial risk of loss, including 100% loss of premium on any single invalidated setup.'
	}
] as const;

export function buildTrackRecordJsonLd(origin: string) {
	const pageUrl = `${origin}/track-record`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			{
				'@type': 'CollectionPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `Trade Ledger & Case Studies | ${BRAND.name}`,
				description: TRACK_RECORD_PAGE_DESCRIPTION,
				inLanguage: 'en-US',
				about: { '@id': `${origin}/#organization` },
				mainEntity: { '@id': `${pageUrl}#case-studies` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'ItemList',
				'@id': `${pageUrl}#case-studies`,
				name: 'Archived Structural Dislocation Case Studies & Ledger Audit Standards',
				numberOfItems: ARCHIVED_HISTORICAL_CALLS.length,
				itemListElement: ARCHIVED_HISTORICAL_CALLS.map((call, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					name: `${call.periodLabel}: ${call.title}`,
					description: call.structuralRead
				}))
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{ '@type': 'ListItem', position: 2, name: 'Track Record', item: pageUrl }
				]
			}
		]
	};
}

export const OPTIONS_CALCULATOR_DESCRIPTION =
	'Free Black-Scholes options profit, breakeven, and Greeks calculator with live payoff curves, vertical spread modeling, and $500+ small-account sizing.';

export const OPTIONS_CALCULATOR_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'how-black-scholes-greeks-work',
		question: 'How does this calculator compute theoretical option prices and Greeks?',
		answer:
			'It runs an analytical Black-Scholes-Merton pricing engine directly in your browser (zero server latency or sign-up wall) to compute theoretical contract value, Delta, Gamma, daily Theta decay, and Vega across both pre-expiration holding horizons and expiration intrinsic value.'
	},
	{
		id: 'single-leg-vs-vertical-spread',
		question: 'When does a debit vertical spread make more sense than a single-leg call or put?',
		answer:
			'When implied volatility is elevated or a $500–$2,500 account needs to reduce net premium outlay and insulate against theta decay, selling a further out-of-the-money strike against your long strike caps upside at the short strike in exchange for lower net debit and a closer breakeven price.'
	},
	{
		id: 'underlying-stop-vs-option-stop',
		question: 'Why do you model the stop-loss from an underlying chart invalidation price?',
		answer:
			'Option bid-ask spreads can widen momentarily during fast sweeps, triggering premature percentage contract stops. Mapping your binary invalidation level on the underlying stock, ETF, or SPX chart first lets Black-Scholes estimate the option value at invalidation so you size contract quantity accurately.'
	},
	{
		id: 'spx-vs-xsp-multiplier',
		question: 'Can I model SPX, mini-XSP, and SPY options in this calculator?',
		answer:
			'Yes — standard U.S. equity, ETF (SPY/QQQ/IWM), SPX, and mini-XSP contracts all use the standard 100x contract multiplier. Simply enter the index or share price, strike, DTE, and implied volatility.'
	}
] as const;

export function buildOptionsCalculatorJsonLd(origin: string) {
	const pageUrl = `${origin}/resources/options-calculator`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `Options Profit & Greeks Tool | ${BRAND.name}`,
				description: OPTIONS_CALCULATOR_DESCRIPTION,
				inLanguage: 'en-US',
				mainEntity: { '@id': `${pageUrl}#app` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'WebApplication',
				'@id': `${pageUrl}#app`,
				name: 'Interactive Black-Scholes Options Profit, Greeks & Asymmetric Risk Calculator',
				url: pageUrl,
				applicationCategory: 'FinanceApplication',
				operatingSystem: 'All (Web Browser)',
				browserRequirements: 'Requires JavaScript for live interactive slider updates',
				isAccessibleForFree: true,
				description: OPTIONS_CALCULATOR_DESCRIPTION,
				creator: { '@id': `${origin}/#organization` },
				offers: {
					'@type': 'Offer',
					price: '0',
					priceCurrency: 'USD'
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
						name: 'Free Trading Resources',
						item: `${origin}/resources`
					},
					{
						'@type': 'ListItem',
						position: 3,
						name: 'Options Profit & Greeks Calculator',
						item: pageUrl
					}
				]
			}
		]
	};
}

export const INTRADAY_MARGIN_CALCULATOR_DESCRIPTION =
	'Free FINRA Rule 4210(d)(2) Intraday Margin Level (IML), De Minimis deficit buffer, T+1 cash rotation, and asymmetric options position sizing calculator.';

export const INTRADAY_MARGIN_CALCULATOR_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'what-is-iml-and-imd',
		question:
			'How are Intraday Margin Level (IML) and Intraday Margin Deficit (IMD) calculated under FINRA Rule 4210(d)(2)?',
		answer:
			'Under FINRA Regulatory Notice 26-10 (Amended Rule 4210(d)(2)), Intraday Margin Level (IML) equals your real-time Margin Account Equity minus the Intraday Maintenance Requirement on your open peak exposure. Whenever IML drops below $0, the shortfall is recorded as an Intraday Margin Deficit (IMD).'
	},
	{
		id: 'de-minimis-exception-formula',
		question: 'What is the FINRA Rule 4210 De Minimis Exception threshold?',
		answer:
			'Amended Rule 4210 includes a De Minimis buffer equal to the lesser of 5% of your margin account equity or $1,000. Minor intraday deficits within that threshold do not trigger the restrictive 15-business-day / 90-day penalty escalation, though individual brokers may enforce stricter house risk limits.'
	},
	{
		id: 'under-2000-margin-baseline',
		question: 'What happens if my account equity is below $2,000?',
		answer:
			'FINRA Rule 4210 retains the $2,000 minimum equity requirement to enable margin privileges. Accounts under $2,000 operate in a T+1 Cash Account, where equity and listed option trades settle on the next business day — allowing full settled-cash rotation once per day without Good Faith Violations.'
	},
	{
		id: 'broker-cutover-oct-2027',
		question: 'Has every U.S. broker already turned off the old $25,000 PDT counter?',
		answer:
			'Not simultaneously. FINRA Notice 26-10 became effective June 4, 2026 with an 18-month implementation window through October 20, 2027 so brokers can deploy real-time intraday margin engines. Confirm whether your broker has transitioned your account before executing more than 3 margin day trades in 5 business days.'
	}
] as const;

export function buildIntradayMarginCalculatorJsonLd(origin: string) {
	const pageUrl = `${origin}/resources/intraday-margin-calculator`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `FINRA 2026 Margin Calculator | ${BRAND.name}`,
				description: INTRADAY_MARGIN_CALCULATOR_DESCRIPTION,
				inLanguage: 'en-US',
				mainEntity: { '@id': `${pageUrl}#app` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'WebApplication',
				'@id': `${pageUrl}#app`,
				name: 'FINRA 2026 Intraday Margin (Rule 4210) & Asymmetric Position Sizing Calculator',
				url: pageUrl,
				applicationCategory: 'FinanceApplication',
				operatingSystem: 'All (Web Browser)',
				browserRequirements: 'Requires JavaScript for live interactive slider updates',
				isAccessibleForFree: true,
				description: INTRADAY_MARGIN_CALCULATOR_DESCRIPTION,
				creator: { '@id': `${origin}/#organization` },
				offers: {
					'@type': 'Offer',
					price: '0',
					priceCurrency: 'USD'
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
						name: 'Free Trading Resources',
						item: `${origin}/resources`
					},
					{
						'@type': 'ListItem',
						position: 3,
						name: 'FINRA 2026 Margin Calculator',
						item: pageUrl
					}
				]
			}
		]
	};
}

export const FINRA_INTRADAY_MARGIN_GUIDE_DESCRIPTION =
	'Complete trader guide to FINRA Regulatory Notice 26-10 replacing the $25,000 PDT rule with Rule 4210(d)(2) Intraday Margin Level (IML) through Oct 2027.';

export const FINRA_INTRADAY_MARGIN_GUIDE_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'is-25k-pdt-rule-gone',
		question: 'Did FINRA officially replace the $25,000 Pattern Day Trader (PDT) rule in 2026?',
		answer:
			'Yes. Through FINRA Regulatory Notice 26-10 (SEC-approved amendments to FINRA Rule 4210, effective June 4, 2026), FINRA eliminated the 2001-era 4-day-trade count and $25,000 minimum equity threshold in favor of real-time risk-based intraday maintenance margin under Rule 4210(d)(2), with broker rollout running through October 20, 2027.'
	},
	{
		id: 'zero-dte-options-treatment',
		question: 'How does Amended Rule 4210(d)(2) treat 0DTE SPX and equity options intraday?',
		answer:
			'Unlike the 2001 rule built prior to modern daily expirations, Amended Rule 4210(d)(2) integrates short-dated and 0DTE options directly into real-time peak intraday exposure monitoring. Long defined-risk option buyers remain capped at 100% of debit paid unless holding exercise-exposed short legs or naked positions.'
	},
	{
		id: 'fifteen-day-deficit-rule',
		question:
			'What happens if I trigger an Intraday Margin Deficit (IMD) above the De Minimis buffer?',
		answer:
			'An unsatisfied intraday deficit exceeding the lesser of 5% of account equity or $1,000 must be met promptly and remains tracked on the broker’s books for up to 15 business days; repeated unsatisfied deficits can result in a 90-day margin restriction.'
	},
	{
		id: 'cash-vs-margin-2000-decision',
		question:
			'Should a $1,500 or $3,000 trader use a T+1 Cash Account or a Rule 4210 Margin Account?',
		answer:
			'Accounts under $2,000 must use a T+1 Cash Account (where options and stocks settle overnight). Between $2,000 and $5,000, a Rule 4210 margin account unlocks vertical spreads and intraday re-entry without waiting for overnight settlement, provided you size exposure well inside your Intraday Margin Level (IML) cushion.'
	}
] as const;

export function buildFinraIntradayMarginGuideJsonLd(origin: string) {
	const pageUrl = `${origin}/resources/finra-intraday-margin-rule-2026`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `FINRA Rule 4210 Margin Guide | ${BRAND.name}`,
				description: FINRA_INTRADAY_MARGIN_GUIDE_DESCRIPTION,
				inLanguage: 'en-US',
				mainEntity: { '@id': `${pageUrl}#article` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'Article',
				'@id': `${pageUrl}#article`,
				headline:
					'FINRA Intraday Margin Rule (2026): Complete Trader Guide to Regulatory Notice 26-10 & Rule 4210(d)(2)',
				description: FINRA_INTRADAY_MARGIN_GUIDE_DESCRIPTION,
				inLanguage: 'en-US',
				url: pageUrl,
				datePublished: '2026-11-16',
				dateModified: '2026-11-16',
				author: { '@id': `${origin}/#founder` },
				publisher: { '@id': `${origin}/#organization` },
				image: `${origin}${BRAND_SOCIAL_IMAGE_PATH}`,
				mainEntityOfPage: { '@id': `${pageUrl}#webpage` }
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
						name: 'FINRA Rule 4210 Margin Guide',
						item: pageUrl
					}
				]
			}
		]
	};
}

export const BEST_TRADING_ROOMS_DESCRIPTION =
	'Criteria-driven 2026 comparison of live options and day trading rooms across indicator dependency, underlying liquidity, small accounts, and stop rules.';

export const BEST_TRADING_ROOMS_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'how-to-evaluate-live-trading-room',
		question:
			'What are the most important objective criteria when comparing live trading rooms in 2026?',
		answer:
			'Evaluate five structural criteria before joining any room: (1) underlying liquidity (deep SPX/QQQ/large-cap pools vs. illiquid penny stocks prone to crowd slippage), (2) chart methodology (clean price structure vs. $1,000+ proprietary indicator add-ons), (3) live screen/voice transparency BEFORE entry, (4) pre-committed binary invalidation stops, and (5) dedicated $500+ small-account risk tracks.'
	},
	{
		id: 'penny-stock-slippage-risk',
		question:
			'Why do micro-float penny stock rooms behave differently from SPX and ETF options rooms?',
		answer:
			'In micro-float equities trading thin volume, hundreds of chatroom members hitting market buy simultaneously can spike the ask price by 5%–15% within seconds, creating severe slippage for followers. Cash-settled SPX/XSP index options and SPY/QQQ ETFs absorb institutional order flow without retail chatroom front-running.'
	},
	{
		id: 'indicator-upsell-model',
		question: 'Do I need to buy proprietary indicators to succeed in a live options trading room?',
		answer: `No. While several rooms monetize custom indicator suites ($500–$1,500+), pure price-action rooms like ${BRAND.name} execute 100% indicator-free Monthly-to-1-Minute structure directly on clean brokerage charts.`
	},
	{
		id: 'nine-to-five-schedule-room',
		question: 'What if my work schedule prevents watching a live room from 9:30 AM to 4:00 PM ET?',
		answer:
			'Choose either a dedicated multi-day Swing Trading Room built around evening reviews or standalone pre-planned dispatches such as Sunday Alpha Protocol (weekly swings) and SPX Profit Pulse (pre-market + conditional SPX levels).'
	}
] as const;

export function buildBestTradingRoomsComparisonJsonLd(origin: string) {
	const pageUrl = `${origin}/resources/best-live-options-and-day-trading-rooms`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `Best Options Trading Rooms 2026 | ${BRAND.name}`,
				description: BEST_TRADING_ROOMS_DESCRIPTION,
				inLanguage: 'en-US',
				mainEntity: { '@id': `${pageUrl}#article` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'Article',
				'@id': `${pageUrl}#article`,
				headline:
					'Best Live Options & Day Trading Rooms (2026): Pure Price Action vs. Indicator-Heavy Chatrooms',
				description: BEST_TRADING_ROOMS_DESCRIPTION,
				inLanguage: 'en-US',
				url: pageUrl,
				datePublished: '2026-11-16',
				dateModified: '2026-11-16',
				author: { '@id': `${origin}/#founder` },
				publisher: { '@id': `${origin}/#organization` },
				image: `${origin}${BRAND_SOCIAL_IMAGE_PATH}`,
				mainEntityOfPage: { '@id': `${pageUrl}#webpage` }
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
						name: 'Best Live Options & Day Trading Rooms',
						item: pageUrl
					}
				]
			}
		]
	};
}

export const BEST_OPTIONS_ALERTS_DESCRIPTION =
	'Objective 2026 comparison of SPX 0DTE and options swing alert services evaluated by pre-trade thesis depth, Section 1256 structure, and hard stop rules.';

export const BEST_OPTIONS_ALERTS_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'raw-signal-vs-structural-blueprint',
		question: 'Why do raw "Buy Strike X Now" SMS/Discord pings fail most working traders?',
		answer:
			'By the time a trader unlocks their phone on a 0DTE contract without knowing the underlying structural trigger or invalidation price, fast gamma movement has often shifted the option price 20%–35%. A 5-point pre-trade structural blueprint lets you see the inflection zone and hard stop before price arrives.'
	},
	{
		id: 'spx-section-1256-advantage',
		question:
			'Why do dedicated index options alert services favor SPX and mini-XSP over equity options?',
		answer:
			'SPX and mini-XSP options are European-style and cash-settled (eliminating early share assignment risk and overnight pin blowups) and qualify for U.S. IRC Section 1256 60% long-term / 40% short-term capital gains tax treatment for eligible U.S. taxpayers (consult your CPA).'
	},
	{
		id: 'verifying-alert-stop-outs',
		question: 'What red flags indicate an options alert service is cherry-picking results?',
		answer:
			'Watch out for services that alert entries without an underlying invalidation stop, average down into losing 0DTE contracts, or advertise peak intraday contract highs while omitting stopped-out alerts from recaps.'
	},
	{
		id: 'intraday-spx-vs-sunday-swing-alerts',
		question: 'How do I choose between intraday SPX 0DTE alerts and weekly swing alerts?',
		answer:
			'Match the cadence to your daytime availability: intraday SPX 0DTE setups require checking conditional market-hours levels, whereas weekly swing blueprints like Sunday Alpha Protocol use multi-week expirations staged from Sunday evening chart plans.'
	}
] as const;

export function buildBestOptionsAlertsComparisonJsonLd(origin: string) {
	const pageUrl = `${origin}/resources/best-spx-0dte-and-options-alert-services`;

	return {
		'@graph': [
			buildOrganizationEntity(origin),
			buildFounderEntity(origin),
			buildOfferCatalogEntity(origin),
			{
				'@type': 'WebPage',
				'@id': `${pageUrl}#webpage`,
				url: pageUrl,
				name: `Best SPX & Options Alerts 2026 | ${BRAND.name}`,
				description: BEST_OPTIONS_ALERTS_DESCRIPTION,
				inLanguage: 'en-US',
				mainEntity: { '@id': `${pageUrl}#article` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` }
			},
			{
				'@type': 'Article',
				'@id': `${pageUrl}#article`,
				headline:
					'Best SPX 0DTE & Options Swing Alert Services (2026): Structural Blueprints vs. Blind Signal Chats',
				description: BEST_OPTIONS_ALERTS_DESCRIPTION,
				inLanguage: 'en-US',
				url: pageUrl,
				datePublished: '2026-11-16',
				dateModified: '2026-11-16',
				author: { '@id': `${origin}/#founder` },
				publisher: { '@id': `${origin}/#organization` },
				image: `${origin}${BRAND_SOCIAL_IMAGE_PATH}`,
				mainEntityOfPage: { '@id': `${pageUrl}#webpage` }
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
						name: 'Best SPX 0DTE & Options Alert Services',
						item: pageUrl
					}
				]
			}
		]
	};
}
