import {
	BLOG_ARTICLES,
	FAQ_ITEMS,
	MAIN_NAVIGATION,
	MEMBERSHIP_TIERS,
	STORE_TOOLS,
	type FaqItem
} from '#lib/data/homepage.ts';
import { SOCIAL_LINKS } from '#lib/data/site.ts';

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
export const SITE_ORIGIN = 'https://revolutiontradingpros.com';

export function getCanonicalUrl(url: Pick<URL, 'pathname'>): string {
	const cleanPath = url.pathname === '/' ? '' : url.pathname.replace(/\/+$/, '');
	return `${SITE_ORIGIN}${cleanPath}`;
}

export function isNoIndexRoute(pathname: string): boolean {
	return NOINDEX_ROUTE_PREFIXES.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
	);
}

export interface CatalogOffering {
	id: string;
	schemaType: 'Service' | 'Course';
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
		id: 'explosive-swings',
		schemaType: 'Service',
		name: 'Explosive Swings',
		serviceType: 'Multi-Day Swing Trading Video Watchlist and Alert Service',
		description:
			'Multi-day stock and options video watchlists with pre-planned entry zones, profit targets, and stop-loss invalidation levels for working professionals.',
		path: '/alert-services/explosive-swings'
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
		schemaType: 'Course',
		name: 'Stock & Options Trading Courses',
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
			'Our founder was mentored directly by former Wall Street Goldman Sachs proprietary trading legend Mark "Goldfinger" McGoldrick, who explicitly called him "the future of trading." It matters because most retail trading educators only teach recycled chart patterns. Learning directly from a Goldman Sachs proprietary trading veteran means our rooms, indicators, and courses are grounded in institutional order flow, liquidity mechanics, and asymmetric risk control.'
	},
	{
		id: 'oxy-put-options-600',
		question: 'How did you make 600% overnight on OXY Put Options when Warren Buffett went long?',
		answer:
			'When news broke that Warren Buffett had purchased millions of dollars of Occidental Petroleum (OXY) shares, retail traders chased the headline at the top of an exhausted move. Using our institutional volume and liquidity exhaustion rules, we identified distribution into that retail buying wave, entered defined-risk OXY Put Options live, and locked in a 600% overnight gain—demonstrating why price and liquidity structure come before media headlines.'
	},
	{
		id: 'small-accounts-500-mission',
		question:
			'Why do you offer a Small Accounts Room for $500+ accounts and affordable alert services?',
		answer:
			'Because our founder stood on the losing end in the past and built Revolution Trading Pros around people, not making money. A trader starting with $500 or a working professional following our video watchlists (Explosive Swings or SPX Profit Pulse) deserves the same institutional discipline and risk transparency as a full-time day trader.'
	},
	{
		id: 'mentorship-application-only',
		question: 'Why is your 1-on-1 Mentorship by application and approval only?',
		answer:
			'Predatory marketers will charge exorbitant high-ticket fees to anyone with a credit card because they only care about subscription revenue. We refuse to operate that way. Our 1-on-1 Mentorship requires a formal application and manual approval so we only work with traders who are coachable, disciplined, and committed to the process.'
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
			'Stock and options trading education, live trading rooms, small-account mentorship ($500+), custom indicators, scanners, and video watchlists for US and Canadian traders. People over profits.',
		logo: {
			'@type': 'ImageObject',
			'@id': `${origin}/#logo`,
			url: logoUrl,
			contentUrl: logoUrl,
			width: BRAND_LOGO_WIDTH,
			height: BRAND_LOGO_HEIGHT,
			caption: `${BRAND_NAME} — ${BRAND_SLOGAN}`
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
			'SPX Profit Pulse and Explosive Swings Video Watchlists',
			'Institutional Order Flow and Market Structure Education'
		],
		contactPoint: {
			'@type': 'ContactPoint',
			contactType: 'customer support',
			url: `${origin}/contact`,
			availableLanguage: ['en-US', 'en-CA']
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
		name: 'Billy Ribeiro',
		jobTitle: 'Founder & Head Institutional Trader',
		url: `${origin}/about`,
		worksFor: {
			'@id': `${origin}/#organization`
		},
		description:
			'Founder of Revolution Trading Pros. Mentored directly by former Goldman Sachs proprietary trading legend Mark "Goldfinger" McGoldrick, who called him "the future of trading." Known for calling the 2020 and 2022 market cycle tops and bottoms and executing a live 600% overnight return on Occidental Petroleum (OXY) Put Options.',
		knowsAbout: [
			'Institutional Order Flow Execution',
			'Options Day Trading and Swing Trading',
			'Small Account Risk Management ($500+)',
			'Macro Market Cycle Inflection Timing',
			'Non-Repainting Technical Indicators'
		]
	};
}

export function buildOfferCatalogEntity(origin: string) {
	return {
		'@type': 'OfferCatalog',
		'@id': `${origin}/#offer-catalog`,
		name: 'Revolution Trading Pros Trading Rooms, Alert Services, Mentorship & Store',
		url: `${origin}/memberships`,
		numberOfItems: CANONICAL_OFFERINGS.length,
		itemListElement: CANONICAL_OFFERINGS.map((offering, index) => {
			const baseItem = {
				'@type': offering.schemaType,
				'@id': `${origin}${offering.path}#${offering.schemaType.toLowerCase()}`,
				position: index + 1,
				name: offering.name,
				description: offering.description,
				url: `${origin}${offering.path}`,
				provider: {
					'@id': `${origin}/#organization`
				}
			};

			if (offering.schemaType === 'Course') {
				return {
					...baseItem,
					hasCourseInstance: {
						'@type': 'CourseInstance',
						courseMode: 'online'
					}
				};
			}

			return {
				...baseItem,
				serviceType: offering.serviceType,
				areaServed: [
					{ '@type': 'Country', name: 'United States' },
					{ '@type': 'Country', name: 'Canada' }
				]
			};
		})
	};
}

export function buildWebSiteEntity(origin: string) {
	return {
		'@type': 'WebSite',
		'@id': `${origin}/#website`,
		url: origin,
		name: BRAND_NAME,
		alternateName: `${BRAND_NAME} — ${BRAND_SLOGAN}`,
		description:
			'Stock and options trading education, live trading rooms, swing trading alerts, small-account mentorship ($500+), custom indicators, and scanners.',
		inLanguage: ['en-US', 'en-CA'],
		publisher: {
			'@id': `${origin}/#organization`
		}
	};
}

export function buildHomepageJsonLd(origin: string) {
	const navigationElements = buildNavigationElements(origin);

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
				name: 'Live Stock & Options Trading Room, Mentorship & Custom Indicators | Revolution Trading Pros',
				description:
					'Explore Revolution Trading Pros: stock and options trading rooms, swing trading, small-account mentorship ($500+), custom indicators, trading courses, and video watchlists. Trading involves substantial risk.',
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
				breadcrumb: {
					'@id': `${origin}/#breadcrumb`
				},
				mainEntity: {
					'@id': `${origin}/#offer-catalog`
				},
				hasPart: [
					{ '@id': `${origin}/#faq` },
					{ '@id': `${origin}/#navigation` },
					{ '@id': `${origin}/#latest-blogs` }
				],
				speakable: {
					'@type': 'SpeakableSpecification',
					cssSelector: ['#hero-title', '.hero-lead', '#faq-title']
				}
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${origin}/#breadcrumb`,
				itemListElement: [
					{
						'@type': 'ListItem',
						position: 1,
						name: 'Home',
						item: origin
					}
				]
			},
			{
				'@type': 'ItemList',
				'@id': `${origin}/#navigation`,
				name: 'Primary Site Navigation',
				numberOfItems: navigationElements.length,
				itemListElement: navigationElements
			},
			{
				'@type': 'ItemList',
				'@id': `${origin}/#latest-blogs`,
				name: 'Latest Market Intelligence Articles',
				numberOfItems: BLOG_ARTICLES.length,
				itemListElement: BLOG_ARTICLES.map((article, idx) => ({
					'@type': 'ListItem',
					position: idx + 1,
					url: `${origin}${article.href}`,
					name: article.title
				}))
			},
			{
				'@type': 'FAQPage',
				'@id': `${origin}/#faq`,
				url: `${origin}/#faq`,
				isPartOf: {
					'@id': `${origin}/#webpage`
				},
				mainEntity: FAQ_ITEMS.map((item) => ({
					'@type': 'Question',
					'@id': `${origin}/#faq-${item.id}`,
					name: item.question,
					acceptedAnswer: {
						'@type': 'Answer',
						text: item.answer
					}
				}))
			}
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
				'@type': ['AboutPage', 'ProfilePage'],
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
				},
				hasPart: [
					{
						'@id': `${aboutUrl}#faq`
					}
				]
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
						name: 'About',
						item: aboutUrl
					}
				]
			},
			{
				'@type': 'FAQPage',
				'@id': `${aboutUrl}#faq`,
				url: `${aboutUrl}#faq`,
				isPartOf: {
					'@id': `${aboutUrl}#webpage`
				},
				mainEntity: ABOUT_FAQ_ITEMS.map((item) => ({
					'@type': 'Question',
					'@id': `${aboutUrl}#faq-${item.id}`,
					name: item.question,
					acceptedAnswer: {
						'@type': 'Answer',
						text: item.answer
					}
				}))
			}
		]
	};
}

export const MISSION_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'people-over-making-money',
		question: 'Why do you emphasize "People Over Making Money" so strongly?',
		answer:
			'Because our founder has stood on the losing end in the past and knows firsthand how destructive fake gurus are to hardworking families. After being mentored by former Goldman Sachs proprietary trading legend Mark "Goldfinger" McGoldrick—and proving our edge live on the 2020 COVID top and bottom, the 2022 top and bottom, and our 600% overnight OXY Put Options trade—we didn\'t need to exploit retail traders for high-ticket course fees. We keep our services affordable so our members can actually prosper.'
	},
	{
		id: 'small-account-coverage',
		question: 'What if I only have $500 to start trading—am I really covered?',
		answer:
			'Yes. Our Small Accounts Room was created specifically so traders starting with as little as $500 never have to gamble or copy trades meant for six-figure portfolios. We teach strict risk-per-trade limits, affordable contract selection, and cash-account settlement discipline so you can grow safely.'
	},
	{
		id: 'alert-only-memberships',
		question: "How do your alert-only memberships work if I can't join a live trading room?",
		answer:
			'Through our accessible alert services—Explosive Swings and SPX Profit Pulse—we send you detailed video watchlists and trade alerts that map out the exact thesis, targeted entry price, tiered profit targets, and hard stop-loss level before the trade plays out.'
	},
	{
		id: 'mentorship-application-only',
		question: "Why can't I pay directly for 1-on-1 Mentorship on your website?",
		answer:
			"Because 1-on-1 Mentorship is strictly by application and approval only. If our goal were making quick money, we would put a checkout button on that page and take anyone's credit card. Instead, we review every applicant personally to ensure we only accept disciplined, coachable traders who are ready to commit to the process."
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
				hasPart: [{ '@id': `${missionUrl}#charter` }, { '@id': `${missionUrl}#faq` }]
			},
			{
				'@type': 'CreativeWork',
				'@id': `${missionUrl}#charter`,
				name: 'The People Over Profits Charter',
				description:
					'Five non-negotiable standards: no fake holy grail indicators, no overpriced guru courses, exact entries, exits and stops defined ahead of time, dedicated environments for small accounts and working professionals, and application-only 1-on-1 mentorship.',
				inLanguage: 'en-US',
				url: `${missionUrl}#charter`,
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
			},
			{
				'@type': 'FAQPage',
				'@id': `${missionUrl}#faq`,
				url: `${missionUrl}#faq`,
				isPartOf: { '@id': `${missionUrl}#webpage` },
				mainEntity: MISSION_FAQ_ITEMS.map((item) => ({
					'@type': 'Question',
					'@id': `${missionUrl}#faq-${item.id}`,
					name: item.question,
					acceptedAnswer: { '@type': 'Answer', text: item.answer }
				}))
			}
		]
	};
}

export const MENTORSHIP_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'why-application-only',
		question: "Why can't I just pay and join 1-on-1 Mentorship immediately?",
		answer:
			'Because we focus on people over making money. Taking a credit card from someone who isn\'t ready to be coached is how predatory internet gurus operate. Because our founder was mentored 1-on-1 by former Goldman Sachs legend Mark "Goldfinger" McGoldrick, we treat 1-on-1 mentorship as a serious partnership. We manually vet every applicant to guarantee a 100% fit before we ever discuss enrollment.'
	},
	{
		id: 'struggling-trader-rejected',
		question:
			'I am a struggling trader who has lost money to fake gurus—will my application be rejected?',
		answer:
			'Never for past losses—only for a bad attitude. Our founder stood on the losing end in the past too, which is why we created Track 03 (Struggling Trader Turnaround). We do not judge you by your past drawdowns or account size; we judge you strictly by your honesty, work ethic, and willingness to unlearn bad retail habits and follow mechanical entry, exit, and stop-loss rules.'
	},
	{
		id: 'portfolio-managers',
		question:
			'How do you structure 1-on-1 Mentorship for Portfolio Managers and Institutional Traders?',
		answer:
			'Under Track 01, we work directly with Portfolio Managers, family offices, and proprietary traders on macro cycle regime detection (the exact framework behind our 2020 and 2022 top/bottom calls), liquidity-sweep execution, and asymmetric options hedging structures (such as the institutional distribution read behind our +600% overnight OXY Put Options trade).'
	},
	{
		id: 'rooms-while-reviewed',
		question:
			'What if I want to join a Live Trading Room or Alert Service while my 1-on-1 application is reviewed?',
		answer:
			'You do not have to wait to access our daily preparation. While your 1-on-1 dossier is under review, you can step directly into our Day Trading Room, Swing Trading Room, Small Accounts Room ($500+), or our video watchlist alert services (SPX Profit Pulse and Explosive Swings).'
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
					'Application-only 1-on-1 trading mentorship for portfolio managers, pro traders, and struggling traders. Mentored by Goldman Sachs legend Mark McGoldrick.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				about: { '@id': `${pageUrl}#service` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
				hasPart: [{ '@id': `${pageUrl}#faq` }]
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
				description:
					"Strictly application-and-approval-only 1-on-1 mentorship built on the Goldman Sachs proprietary trading lineage of Mark 'Goldfinger' McGoldrick."
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{ '@type': 'ListItem', position: 2, name: 'Mentorship', item: pageUrl }
				]
			},
			{
				'@type': 'FAQPage',
				'@id': `${pageUrl}#faq`,
				url: `${pageUrl}#faq`,
				isPartOf: { '@id': `${pageUrl}#webpage` },
				mainEntity: MENTORSHIP_FAQ_ITEMS.map((item) => ({
					'@type': 'Question',
					'@id': `${pageUrl}#faq-${item.id}`,
					name: item.question,
					acceptedAnswer: { '@type': 'Answer', text: item.answer }
				}))
			}
		]
	};
}
