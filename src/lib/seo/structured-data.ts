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
