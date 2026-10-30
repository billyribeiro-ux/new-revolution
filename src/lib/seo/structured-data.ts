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

export const DAY_TRADING_ROOM_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'liquid-institutional-stocks-options',
		question: 'Do you trade micro-float penny stocks or liquid institutional stocks and options?',
		answer:
			'We strictly trade high-liquidity US stocks, ETFs, and options. We never touch illiquid micro-float penny stocks. In penny-stock chatrooms, the host buys shares early and alerts 5,000 members who drive the price up for 10 seconds before getting dumped on. By trading deeply liquid institutional equities, ETFs, and options contracts, every member in our room can enter and exit cleanly without slippage traps.'
	},
	{
		id: 'live-voice-and-screen-share',
		question:
			'Will I actually see your screen and hear your voice live, or is it just text alerts?',
		answer:
			'You get live voice commentary and real-time screen sharing every market morning, paired with written level posts. Text-only rooms only tell you what someone bought after the fact. Watching our charts live and hearing our institutional thesis before the trigger price is hit teaches you why the trade works so you become a self-sufficient trader.'
	},
	{
		id: 'goldman-sachs-mentorship-lineage',
		question: 'How does your Goldman Sachs mentorship lineage change how you day trade?',
		answer:
			'Our founder was mentored directly by former Wall Street Goldman Sachs proprietary trading legend Mark "Goldfinger" McGoldrick, who called him "the future of trading." Instead of chasing retail breakout candles, we track institutional order flow, liquidity sweeps, and buyer/seller exhaustion—the exact methodology behind our 2020 COVID top and bottom calls, our 2022 bull top and bear bottom calls, and our live 600% overnight gain on OXY Put Options opposite Warren Buffett.'
	},
	{
		id: 'spx-alerts-video-watchlists',
		question: 'What if I only want SPX index options alerts or pre-planned video watchlists?',
		answer:
			'If you prefer dedicated alert-only services without sitting in the full day trading room, explore SPX Profit Pulse (/alert-services/spx-profit-pulse) for high-precision S&P 500 index options execution or Explosive Swings (/alert-services/explosive-swings), our accessible video watchlist alert membership delivering exact targeted entries, profit exits, and stop-loss levels.'
	},
	{
		id: 'custom-non-repainting-indicators-scanners',
		question:
			'Can I also use your custom non-repainting indicators and scanners alongside the room?',
		answer:
			'Yes. The exact 100% non-repainting indicators and institutional order-flow scanners you see on our shared screens every morning are available in our Store (/store/indicators, /store/scanners, and /store/courses), alongside our free Options Calculator (/resources/options-calculator).'
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
					'Join our live stock, ETF, and options day trading room. Real-time voice, screen share, and exact entries and stops. People over profits. Zero hype.',
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
				description:
					'Daily live pre-market preparation, real-time voice commentary, live screen sharing, and institutional order-flow execution across liquid US stocks, ETFs, and options.'
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{ '@type': 'ListItem', position: 2, name: 'Live Trading Rooms', item: pageUrl },
					{ '@type': 'ListItem', position: 3, name: 'Day Trading Room', item: pageUrl }
				]
			},
			{
				'@type': 'FAQPage',
				'@id': `${pageUrl}#faq`,
				url: `${pageUrl}#faq`,
				isPartOf: { '@id': `${pageUrl}#webpage` },
				mainEntity: DAY_TRADING_ROOM_FAQ_ITEMS.map((item) => ({
					'@type': 'Question',
					'@id': `${pageUrl}#faq-${item.id}`,
					name: item.question,
					acceptedAnswer: { '@type': 'Answer', text: item.answer }
				}))
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
			'Most working professionals in our room spend 15 to 20 minutes in the evening or before work. Because our swing setups focus on multi-day and multi-week institutional moves, we map out exact entry trigger prices, profit targets, and hard stop-losses ahead of time so you can set conditional orders with your broker without watching intraday ticks.'
	},
	{
		id: 'stocks-etfs-options-coverage',
		question: 'Do you swing trade shares of stock, ETFs, or options contracts?',
		answer:
			'We cover all three: liquid US stocks, sector and index ETFs (See our ETF Stocks List (/resources/etf-stocks-list) and Stock Indexes List (/resources/stock-indexes-list)), and options contracts. Every setup specifies both the underlying stock/ETF price levels and the exact options structure (calls, puts, or defined-risk vertical/diagonal spreads) so you can trade shares, options, or both.'
	},
	{
		id: 'swing-room-vs-explosive-swings',
		question: 'How is the Swing Trading Room different from your Explosive Swings alert service?',
		answer:
			'The Swing Trading Room gives you full interactive room access—including live and recorded chart review sessions, portfolio hedging and sector rotation education, and direct Q&A where we review tickers you ask about. Explosive Swings (/alert-services/explosive-swings) is our affordable alert-only tier designed for independent traders who simply want our video watchlists and trade alerts with exact entries, exits, and stops sent to them.'
	},
	{
		id: 'methodology-2020-2022-oxy',
		question:
			'How did your methodology call the 2020 and 2022 tops/bottoms and the +600% OXY trade?',
		answer:
			'Our founder was mentored directly by former Wall Street Goldman Sachs proprietary trading legend Mark "Goldfinger" McGoldrick, who called him "the future of trading." By tracking institutional liquidity exhaustion, volume anomalies, and smart-money distribution rather than lagging retail indicators, we called the 2020 COVID top and bottom, the 2022 bull top and bear bottom, and shorted Occidental Petroleum (OXY) live with Put Options for a 600% overnight gain while Warren Buffett bought millions long.'
	},
	{
		id: 'non-repainting-indicators-courses-mentorship',
		question:
			'Can I pair the Swing Trading Room with your custom non-repainting indicators and courses?',
		answer:
			'Yes. All of the 100% non-repainting indicators and institutional scanners we use to spot multi-day accumulation and distribution are available in our Store (/store/indicators, /store/scanners, and /store/courses). If you want private, personalized coaching, you can also apply for our application-only 1-on-1 Mentorship (/mentorship).'
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
					'Stock, ETF, and options swing trading room built for working professionals. Pre-planned entries, profit targets, and stops. People over profits.',
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
				description:
					'Institutional multi-day stock, ETF, and options swing trading room delivering pre-planned entry triggers, tiered profit targets, hard stop-losses, and evening video chart reviews.'
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{ '@type': 'ListItem', position: 2, name: 'Live Trading Rooms', item: pageUrl },
					{ '@type': 'ListItem', position: 3, name: 'Swing Trading Room', item: pageUrl }
				]
			},
			{
				'@type': 'FAQPage',
				'@id': `${pageUrl}#faq`,
				url: `${pageUrl}#faq`,
				isPartOf: { '@id': `${pageUrl}#webpage` },
				mainEntity: SWING_TRADING_ROOM_FAQ_ITEMS.map((item) => ({
					'@type': 'Question',
					'@id': `${pageUrl}#faq-${item.id}`,
					name: item.question,
					acceptedAnswer: { '@type': 'Answer', text: item.answer }
				}))
			}
		]
	};
}

export const SMALL_ACCOUNTS_ROOM_FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'starting-capital-500',
		question: 'Is $500 really enough starting capital to join the Small Accounts Room?',
		answer:
			'Yes. We specifically built the Small Accounts Room so traders starting with as little as $500 have an honest, institutional home. Instead of calling expensive contracts that require a $25,000 account, we focus on liquid, affordable stock, ETF, and options structures (including defined-risk vertical spreads) where your risk per trade is strictly capped.'
	},
	{
		id: 'cash-vs-margin-account-under-25k',
		question: 'Should I use a Cash Account or a Margin Account if I have less than $25,000?',
		answer:
			'We teach you how to navigate both. In the United States, a Cash Account is exempt from the Pattern Day Trader (PDT) 3-day-trade limit—and because options and equities settle overnight on a T+1 schedule, your settled cash refreshes every single market morning. If you prefer a small margin account (or trade from Canada where PDT rules differ), we also execute multi-day swing setups and defined-risk spreads.'
	},
	{
		id: 'goldman-sachs-pedigree-small-accounts',
		question:
			'Why do you care about $500 small accounts when you have Goldman Sachs mentorship pedigree?',
		answer:
			'Because our founder stood on the losing end in the past before being mentored by former Wall Street Goldman Sachs proprietary trading legend Mark "Goldfinger" McGoldrick (who called him "the future of trading"). After calling the 2020 COVID top and bottom, the 2022 market top and bottom, and banking 600% overnight on OXY Put Options live opposite Warren Buffett, our founder built Revolution Trading Pros to put people over making money—protecting everyday traders from the fake gurus who prey on small accounts.'
	},
	{
		id: 'full-time-job-small-account',
		question: 'What if I work a full-time job and also have a small $500+ account?',
		answer:
			'Every setup in the Small Accounts Room includes pre-planned entry triggers, profit targets, and hard invalidation stops—and all live sessions are recorded for on-demand replay. You can also pair your learning with our affordable Explosive Swings (/alert-services/explosive-swings) video watchlist alerts or our self-paced Trading Courses (/store/courses).'
	},
	{
		id: 'graduating-past-10k-25k',
		question: 'What happens once my small account grows past $10,000 or $25,000?',
		answer:
			'Our entire goal is to graduate you. As your account compounds through our 4-Stage Roadmap, you seamlessly transition into our Day Trading Room (/live-trading-rooms/day-trading-room), Swing Trading Room (/live-trading-rooms/swing-trading-room), or apply for our application-only 1-on-1 Mentorship (/mentorship).'
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
					'Grow a $500+ small account without gambling. Strict risk control, T+1 cash account rotation, and affordable stock & options setups. People over profits.',
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
				description:
					'Dedicated live trading room and compounding framework engineered specifically for accounts starting as low as $500—covering affordable options contracts, T+1 cash account rotation, PDT navigation, and strict stop-loss discipline.'
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{ '@type': 'ListItem', position: 2, name: 'Live Trading Rooms', item: pageUrl },
					{ '@type': 'ListItem', position: 3, name: 'Small Accounts Room', item: pageUrl }
				]
			},
			{
				'@type': 'FAQPage',
				'@id': `${pageUrl}#faq`,
				url: `${pageUrl}#faq`,
				isPartOf: { '@id': `${pageUrl}#webpage` },
				mainEntity: SMALL_ACCOUNTS_ROOM_FAQ_ITEMS.map((item) => ({
					'@type': 'Question',
					'@id': `${pageUrl}#faq-${item.id}`,
					name: item.question,
					acceptedAnswer: { '@type': 'Answer', text: item.answer }
				}))
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
			'Never. Every indicator in our Store is 100% non-repainting. Once a candle closes and a signal, squeeze dot, abandoned bar, or gamma level prints on your chart, it stays there permanently. We built Revolution Trading Pros to destroy the fake "holy grail" indicator scam, not participate in it.'
	},
	{
		id: 'platforms-markets',
		question: 'Which trading platforms and markets do these indicators work on?',
		answer:
			'Our custom indicators are built for ThinkorSwim (thinkScript) and TradingView. They work across all liquid US stocks, sector and index ETFs (see our free ETF Stocks List and Stock Indexes List), SPX/NDX index charts, and options contracts on intraday, daily, and weekly timeframes.'
	},
	{
		id: 'small-accounts-working-pros',
		question: 'Are these indicators suitable for $500+ small accounts or working professionals?',
		answer:
			'Yes. Because our indicators plot objective entry triggers and tight structural stop-loss invalidation levels, they are ideal both for Small Accounts Room ($500+) traders who need strict risk caps and for 9-to-5 working professionals in our Swing Trading Room and Explosive Swings alert tier.'
	},
	{
		id: 'pair-with-scanners-courses',
		question: 'How do your indicators pair with your Scanners and Trading Courses?',
		answer:
			'Our Institutional Scanners automatically scan the entire market in real time to find tickers triggering our indicator conditions (such as Multi-Timeframe Squeezes or Liquidity Sweeps), while our Trading Courses teach you the complete Goldman Sachs-mentored execution rules behind every setup.'
	}
];

export const INDICATORS_CATALOG_SCHEMA_ITEMS = [
	{
		position: 1,
		name: 'The Move Prior to The Move (MP_EarlyInNOut)',
		description:
			'Anticipate institutional accumulation and distribution before the retail breakout candle prints.'
	},
	{
		position: 2,
		name: 'Institutional Liquidity Sweep & Trap Detector',
		description:
			'Spot exact price zones where Wall Street algorithms sweep retail stops and reverse the tape.'
	},
	{
		position: 3,
		name: 'Multi-Timeframe Volatility Squeeze Matrix',
		description:
			'Get in on the most powerful volatility compressions earlier across synchronized timeframes.'
	},
	{
		position: 4,
		name: 'Dynamic SPX & Index Gamma Inflection Levels',
		description:
			'Expose dynamic institutional support, resistance, and dealer gamma walls on SPX, SPY, and QQQ.'
	},
	{
		position: 5,
		name: 'Abandoned Price Bar & Exhaustion Telemetry',
		description:
			'Identify trapped buyers at structural tops and trapped sellers at capitulation bottoms in real time.'
	},
	{
		position: 6,
		name: 'Smart-Money Relative Volume & Absorption Oscillator',
		description:
			'A non-repainting volume oscillator that shows whether institutions are buying dips or selling rips.'
	},
	{
		position: 7,
		name: 'Institutional Hot-Zone & Opening Drive Windows',
		description:
			'See within seconds the highest-probability institutional trading windows and avoid midday chop.'
	},
	{
		position: 8,
		name: 'Institutional Trend Thrust & Structure Ribbon',
		description:
			'Combine price structure, thrust, and regime momentum to identify high-probability trend setups.'
	}
] as const;

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
					'100% non-repainting stock, ETF, and options trading indicators for ThinkorSwim and TradingView. Spot institutional order flow and liquidity. Zero hype.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				about: { '@id': `${pageUrl}#catalog` },
				mainEntity: { '@id': `${pageUrl}#catalog` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
				hasPart: [{ '@id': `${pageUrl}#faq` }]
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{ '@type': 'ListItem', position: 2, name: 'Store', item: pageUrl },
					{ '@type': 'ListItem', position: 3, name: 'Indicators', item: pageUrl }
				]
			},
			{
				'@type': 'ItemList',
				'@id': `${pageUrl}#catalog`,
				name: 'Revolution Trading Pros Proprietary Non-Repainting Indicators',
				numberOfItems: INDICATORS_CATALOG_SCHEMA_ITEMS.length,
				itemListElement: INDICATORS_CATALOG_SCHEMA_ITEMS.map((item) => ({
					'@type': 'ListItem',
					position: item.position,
					name: item.name,
					description: item.description
				}))
			},
			{
				'@type': 'FAQPage',
				'@id': `${pageUrl}#faq`,
				url: `${pageUrl}#faq`,
				isPartOf: { '@id': `${pageUrl}#webpage` },
				mainEntity: INDICATORS_STORE_FAQ_ITEMS.map((item) => ({
					'@type': 'Question',
					'@id': `${pageUrl}#faq-${item.id}`,
					name: item.question,
					acceptedAnswer: { '@type': 'Answer', text: item.answer }
				}))
			}
		]
	};
}

export const COURSES_STORE_FAQ_ITEMS: FaqItem[] = [
	{
		id: 'beginner-500-account',
		question:
			'I am a complete beginner or starting with a $500 account—which course should I take first?',
		answer:
			'Start with Course 02 (The $500+ Small Account Compounding & T+1 Cash Rotation Blueprint) paired with Course 08 (Ironclad Risk Architecture). They give you the exact mathematical position-sizing rules, cash-account settlement rotation, and pre-trade checklists we execute daily inside our Small Accounts Room.'
	},
	{
		id: 'indicators-scanners-optional',
		question:
			'Do I need to buy your custom indicators or scanners to use what is taught in the courses?',
		answer:
			'No—raw price, volume, and Options Greeks come first. Every course teaches you how to read institutional market structure on any standard charting platform. Our 100% non-repainting Custom Indicators and Institutional Scanners are optional accelerators designed to spot those exact setups faster across multiple timeframes.'
	},
	{
		id: 'courses-vs-mentorship-rooms',
		question:
			'How is a self-paced course different from your 1-on-1 Mentorship or Live Trading Rooms?',
		answer:
			'Our Courses give you permanent, on-demand video modules and written playbooks to study at your own pace. Our Live Trading Rooms and Alert Services let you execute those playbooks alongside our desk in real time. Our 1-on-1 Mentorship is an application-and-approval-only private coaching partnership for Portfolio Managers, Pro Traders, and Struggling Traders seeking direct personal transformation.'
	},
	{
		id: 'us-canadian-brokerages',
		question: 'Do your courses cover both US and Canadian brokerage accounts?',
		answer:
			'Yes. Our curriculum covers US-listed stocks, ETFs, and options contracts traded by members across both the United States and Canada—including US Pattern Day Trader (PDT) and T+1 cash settlement rules as well as Canadian margin and registered account considerations.'
	}
];

export const COURSES_CATALOG_SCHEMA_ITEMS = [
	{
		position: 1,
		name: 'The Move Prior to The Move: Institutional Order Flow & Price Action',
		description:
			'Anticipate institutional accumulation and distribution before the retail breakout candle prints.'
	},
	{
		position: 2,
		name: 'The $500+ Small Account Compounding & T+1 Cash Rotation Blueprint',
		description:
			'Mathematical strategies for protecting and growing a small trading account starting as low as $500.'
	},
	{
		position: 3,
		name: 'Options Greeks Mastery: Delta, Gamma, Theta & Vega Execution',
		description:
			'Master the four primary Options Greeks to structure high-probability spreads and directional trades.'
	},
	{
		position: 4,
		name: 'Multi-Day Swing Trading for Working Professionals (20-Minute Routine)',
		description:
			'Capture explosive 3-to-15 day stock and options moves in 20 minutes a day around a 9-to-5 career.'
	},
	{
		position: 5,
		name: 'SPX & Index Options Execution: Dealer Gamma Walls & Intraday Flow',
		description:
			'Identify institutional dealer hedging levels, gamma magnet strikes, and A+ intraday reversals on SPX, SPY, and QQQ.'
	},
	{
		position: 6,
		name: 'Contrarian Distribution & Put Options: Fading Retail Euphoria Live',
		description:
			'Deconstruct the exact institutional distribution playbook behind our live +600% overnight OXY Put Options trade vs. Warren Buffett.'
	},
	{
		position: 7,
		name: 'Macro Cycle Inflection Timing: Calling Generational Tops & Bottoms',
		description:
			'Learn the exact top-down macro breadth, liquidity, and volatility framework that called the 2020 COVID and 2022 market tops and bottoms.'
	},
	{
		position: 8,
		name: 'Ironclad Risk Architecture & Eradicating Retail Self-Sabotage',
		description:
			'Eliminate FOMO, revenge trading, hesitation, and early profit-taking by installing a mechanical pre-trade execution protocol.'
	}
] as const;

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
					'Self-paced stock, ETF, and options trading courses. Master institutional order flow, Options Greeks, and $500+ small account compounding. Zero hype.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				about: { '@id': `${pageUrl}#catalog` },
				mainEntity: { '@id': `${pageUrl}#catalog` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
				hasPart: [{ '@id': `${pageUrl}#faq` }]
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{ '@type': 'ListItem', position: 2, name: 'Store', item: pageUrl },
					{ '@type': 'ListItem', position: 3, name: 'Courses', item: pageUrl }
				]
			},
			{
				'@type': 'ItemList',
				'@id': `${pageUrl}#catalog`,
				name: 'Revolution Trading Pros Institutional Stock & Options Curriculum',
				numberOfItems: COURSES_CATALOG_SCHEMA_ITEMS.length,
				itemListElement: COURSES_CATALOG_SCHEMA_ITEMS.map((course) => ({
					'@type': 'ListItem',
					position: course.position,
					item: {
						'@type': 'Course',
						name: course.name,
						description: course.description,
						provider: { '@id': `${origin}/#organization` }
					}
				}))
			},
			{
				'@type': 'FAQPage',
				'@id': `${pageUrl}#faq`,
				url: `${pageUrl}#faq`,
				isPartOf: { '@id': `${pageUrl}#webpage` },
				mainEntity: COURSES_STORE_FAQ_ITEMS.map((item) => ({
					'@type': 'Question',
					'@id': `${pageUrl}#faq-${item.id}`,
					name: item.question,
					acceptedAnswer: { '@type': 'Answer', text: item.answer }
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
			'Package 1 gives you the complete 4-tool non-repainting indicator suite (Move Prior to The Move™ Ultra, Multi-Timeframe Matrix, On-Chart Stats Engine, and Bonus MP_EarlyInNOut™ Pro) plus our step-by-step installation session for ThinkorSwim and TradingView. Package 2 includes the entire indicator suite PLUS the 6-Module Accelerator Class where Billy Ribeiro teaches you the complete Goldman Sachs-mentored execution playbook, Options Greeks structuring, and bar-by-bar case studies.'
	},
	{
		id: 'non-repainting-guarantee',
		question: 'Do any of the indicators in this package repaint after the candle closes?',
		answer:
			'Never. Every indicator engineered by Revolution Trading Pros is 100% non-repainting. Once a price bar closes, every compression dot, liquidity sweep marker, early in/out trigger, and historical stat is permanently locked on your chart.'
	},
	{
		id: 'platforms-tickers-timeframes',
		question: 'Which platforms, tickers, and timeframes do these tools and strategies work on?',
		answer:
			'All indicators and workspace templates are built for ThinkorSwim and TradingView. They work on any liquid instrument—including US stocks, ETFs, SPX/NDX indexes, and futures—across all timeframes from 1-minute scalping charts to Daily and Weekly swing charts.'
	},
	{
		id: 'working-pro-and-500-account',
		question:
			'Can I use this course and indicator suite if I work a 9-to-5 job or have a $500 small account?',
		answer:
			'Yes. Module 04 of the Accelerator Class is dedicated specifically to 9-to-5 working professionals (using a 20-minute evening routine and conditional orders) and $500+ small accounts (using T+1 cash account rotation and affordable, defined-risk options structures).'
	},
	{
		id: 'lifetime-on-demand-access',
		question: 'Is the Accelerator Class live or recorded, and how long do I keep access?',
		answer:
			'You receive immediate, lifetime on-demand access to all HD training modules, downloadable PDF playbooks, and workspace files so you can study and review them at your own pace 24/7.'
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
					'Master institutional order flow, multi-timeframe squeezes, and Options Greeks with Billy Ribeiro. Includes 100% non-repainting ThinkorSwim & TradingView tools.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				mainEntity: { '@id': `${pageUrl}#course` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
				hasPart: [{ '@id': `${pageUrl}#faq` }]
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{
						'@type': 'ListItem',
						position: 2,
						name: 'Courses',
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
				'@type': 'Course',
				'@id': `${pageUrl}#course`,
				name: 'Get the NEW Automated Move Prior to The Move™ Ultra System',
				description:
					'Master institutional order flow, multi-timeframe squeezes, and Options Greeks with Billy Ribeiro. Includes 100% non-repainting ThinkorSwim & TradingView tools.',
				provider: { '@id': `${origin}/#organization` },
				instructor: {
					'@type': 'Person',
					'@id': `${origin}/#founder`,
					name: 'Billy Ribeiro',
					jobTitle: 'Founder & Head Institutional Trader'
				},
				hasCourseInstance: {
					'@type': 'CourseInstance',
					courseMode: 'Online',
					courseWorkload: 'Self-Paced On-Demand HD Modules'
				}
			},
			{
				'@type': 'FAQPage',
				'@id': `${pageUrl}#faq`,
				url: `${pageUrl}#faq`,
				isPartOf: { '@id': `${pageUrl}#webpage` },
				mainEntity: SINGLE_COURSE_FAQ_ITEMS.map((item) => ({
					'@type': 'Question',
					'@id': `${pageUrl}#faq-${item.id}`,
					name: item.question,
					acceptedAnswer: { '@type': 'Answer', text: item.answer }
				}))
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
			'Yes. You get instant access to our Quick-Start Indicator Installation Video and written setup guide the moment you enroll—covering ThinkorSwim Desktop, the ThinkorSwim Mobile App, and TradingView. If you ever want a hand, our support desk is available by phone or email.'
	},
	{
		id: 'platforms-and-devices',
		question: 'What charting platforms and devices work with these indicators?',
		answer:
			'The complete indicator suite is available for ThinkorSwim and TradingView on Windows, Mac, and Web—and the core Move Prior to The Move™ indicator is also fully compatible with the ThinkorSwim Mobile App (iOS and Android) so working professionals can monitor setups from anywhere.'
	},
	{
		id: 'signals-non-repainting',
		question: 'Do any of the Buy/Sell or Early In/Out signals repaint?',
		answer:
			'Never. Unlike predatory "holy grail" scripts that erase losing signals in hindsight, 100% of our code is non-repainting. Once a candle closes, the compression level, Early In/Out marker, and Buy/Sell trigger remain on your chart permanently.'
	},
	{
		id: 'access-and-duration',
		question:
			'Where do I get access, and how long will I have access to the indicators and training?',
		answer:
			'Immediately upon enrollment, all indicator scripts, workspace templates, the Strategy Class, the Precision Entries bonus session, and the 5 recorded live-trading days are unlocked in your member dashboard with lifetime on-demand access.'
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
					'Spot explosive stock, ETF, and options moves early with our 100% non-repainting indicator system for ThinkorSwim and TradingView. People over profits.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				mainEntity: { '@id': `${pageUrl}#software` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
				hasPart: [{ '@id': `${pageUrl}#faq` }]
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{
						'@type': 'ListItem',
						position: 2,
						name: 'Indicators',
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
				description:
					'Spot explosive stock, ETF, and options moves early with our 100% non-repainting indicator system for ThinkorSwim and TradingView. People over profits.',
				creator: {
					'@type': 'Person',
					'@id': `${origin}/#founder`,
					name: 'Billy Ribeiro'
				}
			},
			{
				'@type': 'FAQPage',
				'@id': `${pageUrl}#faq`,
				url: `${pageUrl}#faq`,
				isPartOf: { '@id': `${pageUrl}#webpage` },
				mainEntity: SINGLE_INDICATOR_FAQ_ITEMS.map((item) => ({
					'@type': 'Question',
					'@id': `${pageUrl}#faq-${item.id}`,
					name: item.question,
					acceptedAnswer: { '@type': 'Answer', text: item.answer }
				}))
			}
		]
	};
}

export const SPX_PROFIT_PULSE_FAQ_ITEMS: FaqItem[] = [
	{
		id: 'watch-market-all-day',
		question: 'Do I have to watch the market all day to follow SPX Profit Pulse alerts?',
		answer:
			'No. SPX Profit Pulse is specifically designed for traders who want institutional S&P 500 options execution without sitting in a 6-hour chatroom. Because we publish detailed video watchlists mapping our exact trigger levels ahead of time—and dispatch real-time API alerts the moment a trade opens, scales out, or adjusts its stop—both full-time traders and 9-to-5 working professionals can follow seamlessly.'
	},
	{
		id: 'zero-dte-or-multi-day',
		question:
			'Do you only trade 0DTE (Zero Days to Expiration), or do you also alert multi-day SPX setups?',
		answer:
			'We trade both. When intraday volatility and dealer Gamma walls align, we execute high-asymmetry 0DTE and 1DTE setups. When macro structure favors multi-day expansion or high-probability Theta collection, we structure 2-to-14 DTE directional plays and defined-risk vertical spreads.'
	},
	{
		id: 'small-account-compatibility',
		question: 'Can I follow SPX Profit Pulse if I have a small account ($500 to $2,500)?',
		answer:
			'Yes. While a single full-sized SPX option contract can be expensive, every SPX Profit Pulse alert can be executed in a smaller account using three methods we teach in the Learning Center: (1) Defined-risk 5-wide SPX vertical spreads, (2) XSP (Mini-SPX index options at 1/10th the notional size with the same cash settlement and Section 1256 tax perks), or (3) SPY ETF options.'
	},
	{
		id: 'difference-from-day-room-explosive-swings',
		question:
			'How is SPX Profit Pulse different from the Live Day Trading Room or Explosive Swings?',
		answer:
			'SPX Profit Pulse is a dedicated, alerts-and-video-watchlist service focused 100% on S&P 500 index options (SPX/XSP/SPY). Our Day Trading Room (/live-trading-rooms/day-trading-room) is a full live-voice and screen-share floor covering individual stocks, ETFs, and options. Explosive Swings (/alert-services/explosive-swings) is our multi-day stock and options swing alert service.'
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
					'Real-time SPX & 0DTE index options alerts with video watchlists, gamma levels, and exact entries, targets, and stops. People over profits. Zero hype.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				about: { '@id': `${pageUrl}#service` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
				hasPart: [{ '@id': `${pageUrl}#faq` }]
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
						item: pageUrl
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
				name: 'SPX Profit Pulse — Real-Time S&P 500 & 0DTE Index Options Alert Service',
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
				description:
					'Real-time SPX and 0DTE index options trade alerts paired with pre-market video watchlists, institutional dealer gamma walls, and exact entry, profit target, and hard stop-loss levels.'
			},
			{
				'@type': 'FAQPage',
				'@id': `${pageUrl}#faq`,
				url: `${pageUrl}#faq`,
				isPartOf: { '@id': `${pageUrl}#webpage` },
				mainEntity: SPX_PROFIT_PULSE_FAQ_ITEMS.map((item) => ({
					'@type': 'Question',
					'@id': `${pageUrl}#faq-${item.id}`,
					name: item.question,
					acceptedAnswer: { '@type': 'Answer', text: item.answer }
				}))
			}
		]
	};
}

export const SCANNERS_STORE_FAQ_ITEMS: FaqItem[] = [
	{
		id: 'install-thinkorswim-tradingview',
		question: 'How do these scanners install on ThinkorSwim and TradingView?',
		answer:
			'Every scanner includes one-click import links and custom thinkScript code for ThinkorSwim (working inside both Stock Hacker, Option Hacker, and dynamic MarketWatch watchlist columns) as well as TradingView alert and screener templates—plus a step-by-step installation walkthrough video.'
	},
	{
		id: 'scanners-non-repainting-real-time',
		question: 'Do your scanners ever repaint or lag behind live market price action?',
		answer:
			'Never. All 8 scanners run on real-time market data using 100% non-repainting institutional math. Even better, because our scanners look for pre-ignition volatility compression and liquidity absorption, they alert you before the breakout candle fires rather than chasing extended moves.'
	},
	{
		id: 'best-scanner-small-account-working-pro',
		question:
			'Which scanner is best if I have a $500+ small account or work a full-time 9-to-5 job?',
		answer:
			'If you are building a small account starting around $500, use Scanner 04 ($500+ Small Account Affordable Options & Spread Scanner), which filters strictly for liquid options contracts and vertical spreads that fit a small risk budget. If you work a 9-to-5 career, use Scanner 05 (Working Professional 20-Minute End-of-Day Swing Scanner) to plan conditional multi-day orders in the evening.'
	},
	{
		id: 'watch-scanners-live-market-hours',
		question: 'Can I watch your team use these scanners live during market hours?',
		answer:
			'Yes. We run these exact scanners live on our shared screens every market morning inside our Day Trading Room, Swing Trading Room, and Small Accounts Room, and use them to curate the setups in SPX Profit Pulse and Explosive Swings.'
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
					'Real-time, 100% non-repainting stock, ETF, and options scanners. Spot institutional order flow, multi-timeframe squeezes, and liquidity sweeps live.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				mainEntity: { '@id': `${pageUrl}#catalog` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
				hasPart: [{ '@id': `${pageUrl}#faq` }]
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{
						'@type': 'ListItem',
						position: 2,
						name: 'Store',
						item: pageUrl
					},
					{
						'@type': 'ListItem',
						position: 3,
						name: 'Scanners',
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
			},
			{
				'@type': 'FAQPage',
				'@id': `${pageUrl}#faq`,
				url: `${pageUrl}#faq`,
				isPartOf: { '@id': `${pageUrl}#webpage` },
				mainEntity: SCANNERS_STORE_FAQ_ITEMS.map((item) => ({
					'@type': 'Question',
					'@id': `${pageUrl}#faq-${item.id}`,
					name: item.question,
					acceptedAnswer: { '@type': 'Answer', text: item.answer }
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
			'The High Octane Scanner™ works seamlessly with ThinkorSwim (Desktop and ThinkorSwim Mobile App via shared scan queries and dynamic watchlist alerts) and TradingView, plus instant SMS and email notifications.'
	},
	{
		id: 'non-repainting-real-time-triggers',
		question: 'Do any of the High Octane Scanner triggers repaint or use delayed data?',
		answer:
			'Never. Every scan condition is 100% non-repainting and processes real-time market data. Once a compression, liquidity sweep, or Relative Volume anomaly triggers at bar close, it is permanent.'
	},
	{
		id: 'small-account-filter-benefit',
		question: 'How does the High Octane Scanner help if I only have $500 to $2,500 in my account?',
		answer:
			'We built Mode 03 ($500+ Small Account Affordable Contract Filter) specifically so small accounts never get priced out. It automatically filters for deeply liquid stocks and ETFs whose options contracts and vertical spreads fit safely within a $500+ risk rule.'
	},
	{
		id: 'installation-for-non-programmers',
		question: 'Is installation difficult if I am not a programmer?',
		answer:
			'No coding is required. You receive one-click import links for ThinkorSwim and TradingView plus a step-by-step Quick-Start installation video. Most members have all scan presets and watchlist columns running in under 5 minutes.'
	},
	{
		id: 'monthly-vs-annual-access',
		question: 'What is the difference between Monthly and Annual access?',
		answer:
			'Both Monthly and Annual access unlock the complete High Octane Scanner™ suite, all 50+ institutional filters, mobile/desktop alerts, and the 5 recorded live-scanning training sessions. Annual access is designed for committed traders who want uninterrupted year-round access across all four quarterly earnings cycles.'
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
					'Find explosive stock, ETF, and options setups in real time with the 100% non-repainting High Octane Scanner for ThinkorSwim & TradingView. Zero hype.',
				inLanguage: 'en-US',
				isPartOf: { '@id': `${origin}/#website` },
				mainEntity: { '@id': `${pageUrl}#software` },
				primaryImageOfPage: { '@id': `${origin}/#logo` },
				breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
				hasPart: [{ '@id': `${pageUrl}#faq` }]
			},
			{
				'@type': 'BreadcrumbList',
				'@id': `${pageUrl}#breadcrumb`,
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Home', item: origin },
					{
						'@type': 'ListItem',
						position: 2,
						name: 'Scanners',
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
				description:
					'Find explosive stock, ETF, and options setups in real time with the 100% non-repainting High Octane Scanner for ThinkorSwim & TradingView. Zero hype.',
				creator: {
					'@type': 'Person',
					'@id': `${origin}/#founder`,
					name: 'Billy Ribeiro'
				}
			},
			{
				'@type': 'FAQPage',
				'@id': `${pageUrl}#faq`,
				url: `${pageUrl}#faq`,
				isPartOf: { '@id': `${pageUrl}#webpage` },
				mainEntity: SINGLE_SCANNER_FAQ_ITEMS.map((item) => ({
					'@type': 'Question',
					'@id': `${pageUrl}#faq-${item.id}`,
					name: item.question,
					acceptedAnswer: { '@type': 'Answer', text: item.answer }
				}))
			}
		]
	};
}
