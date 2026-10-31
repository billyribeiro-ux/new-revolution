export type NavIconKey =
	| 'broadcast'
	| 'bell'
	| 'mentorship'
	| 'storefront'
	| 'mission'
	| 'about'
	| 'blog'
	| 'resources'
	| 'day-trading'
	| 'swing-trading'
	| 'small-accounts'
	| 'spx'
	| 'explosive-swings'
	| 'courses'
	| 'indicators'
	| 'scanners'
	| 'calculator'
	| 'etf-list'
	| 'index-list';

export interface SubMenuItem {
	label: string;
	href: string;
	previewTarget: string;
	description?: string;
	icon?: NavIconKey;
}

export interface NavItem {
	id: string;
	label: string;
	href?: string;
	previewTarget?: string;
	icon?: NavIconKey;
	children?: SubMenuItem[];
}

export const MAIN_NAVIGATION: readonly NavItem[] = [
	{
		id: 'live-trading-rooms',
		icon: 'broadcast',
		label: 'Live Trading Rooms',
		children: [
			{
				label: 'Day Trading Room',
				href: '/live-trading-rooms/day-trading-room',
				previewTarget: 'memberships',
				icon: 'day-trading',
				description: 'Live pre-market prep and intraday execution.'
			},
			{
				label: 'Swing Trading Room',
				href: '/live-trading-rooms/swing-trading-room',
				previewTarget: 'memberships',
				icon: 'swing-trading',
				description: 'Multi-day setups built around a 9-to-5.'
			},
			{
				label: 'Small Accounts Room',
				href: '/live-trading-rooms/small-accounts-room',
				previewTarget: 'memberships',
				icon: 'small-accounts',
				description: 'Risk-first education for $500+ accounts.'
			}
		]
	},
	{
		id: 'alert-services',
		icon: 'bell',
		label: 'Alert Services',
		children: [
			{
				label: 'SPX Profit Pulse',
				href: '/alert-services/spx-profit-pulse',
				previewTarget: 'memberships',
				icon: 'spx',
				description: 'Index options video watchlists and alerts.'
			},
			{
				label: 'Explosive Swings',
				href: '/alert-services/explosive-swings',
				previewTarget: 'memberships',
				icon: 'explosive-swings',
				description: 'Multi-day watchlists with defined entries and stops.'
			}
		]
	},
	{
		id: 'mentorship',
		icon: 'mentorship',
		label: 'Mentorship',
		href: '/mentorship',
		previewTarget: 'mentorship'
	},
	{
		id: 'store',
		icon: 'storefront',
		label: 'Store',
		children: [
			{
				label: 'Courses',
				href: '/store/courses',
				previewTarget: 'tools',
				icon: 'courses',
				description: 'Self-paced stock and options education.'
			},
			{
				label: 'Indicators',
				href: '/store/indicators',
				previewTarget: 'tools',
				icon: 'indicators',
				description: 'Non-repainting market-structure tools.'
			},
			{
				label: 'Scanners',
				href: '/store/scanners',
				previewTarget: 'tools',
				icon: 'scanners',
				description: 'Liquidity and unusual-volume scanners.'
			}
		]
	},
	{
		id: 'our-mission',
		icon: 'mission',
		label: 'Our Mission',
		href: '/our-mission',
		previewTarget: 'why-us'
	},
	{
		id: 'about',
		icon: 'about',
		label: 'About',
		href: '/about',
		previewTarget: 'track-record'
	},
	{
		id: 'blogs',
		icon: 'blog',
		label: 'Blogs',
		href: '/blog',
		previewTarget: 'blog'
	},
	{
		id: 'resources',
		icon: 'resources',
		label: 'Resources',
		children: [
			{
				label: 'Options Calculator',
				href: '/resources/options-calculator',
				previewTarget: 'tools',
				icon: 'calculator',
				description: 'Free payoff and risk calculator.'
			},
			{
				label: 'ETF Stocks List',
				href: '/resources/etf-stocks-list',
				previewTarget: 'tools',
				icon: 'etf-list',
				description: 'Free reference list of ETFs.'
			},
			{
				label: 'Stock Indexes List',
				href: '/resources/stock-indexes-list',
				previewTarget: 'tools',
				icon: 'index-list',
				description: 'Free reference list of major stock indexes.'
			}
		]
	}
] as const;

export interface ProofDossierItem {
	number: string;
	title: string;
	description: string;
}

export const PROOF_DOSSIER_ITEMS: readonly ProofDossierItem[] = [
	{
		number: '01',
		title: 'Mark “Goldfinger” McGoldrick Institutional Mentorship',
		description:
			'Founder-reported professional mentorship and “future of trading” quote; independently verifiable attribution should be published.'
	},
	{
		number: '02',
		title: 'Reported +600% Overnight OXY Put Trade',
		description:
			'A defined-risk put-options case study to support with strike, expiration, actual fills, timestamps, capital at risk, and loss exposure.'
	},
	{
		number: '03',
		title: 'Reported 2020 & 2022 Turning-Point Calls',
		description:
			'Historical market timing claims to document against contemporaneous dated alerts, charts, and the underlying market structure.'
	}
] as const;

export interface TrustMetric {
	label: string;
	value: string;
}

export const TRUST_BAR_METRICS: readonly TrustMetric[] = [
	{
		label: 'MARKETS COVERED',
		value: 'Stocks. ETFs. Options.'
	},
	{
		label: 'STARTING CAPITAL',
		value: 'Small-account education from $500+'
	},
	{
		label: 'BUILT AROUND YOU',
		value: 'Day. Swing. Video Alerts.'
	},
	{
		label: 'CORE PRINCIPLE',
		value: 'People First. Risk Always.'
	}
] as const;

export interface CaseStudy {
	kicker: string;
	state: string;
	title: string;
	description: string;
	evidenceRequirement: string;
}

export const CASE_STUDIES: readonly CaseStudy[] = [
	{
		kicker: '01 / 2020',
		state: 'DOCUMENTATION PENDING',
		title: 'The 2020 COVID Market Top & Bottom',
		description:
			'Founder-reported market turning-point calls. The eventual analysis should distinguish the pre-move prediction from later interpretation and explain the claimed liquidity and price-structure signals.',
		evidenceRequirement:
			'dated original alerts, archived charts, exact market reference levels, and outcome comparison.'
	},
	{
		kicker: '02 / 2022',
		state: 'DOCUMENTATION PENDING',
		title: 'The 2022 Market Cycle Top & Bottom',
		description:
			'A reported top-and-bottom market call. The planned breakdown can examine distribution, volatility, confirmation criteria, invalidation levels, and the complete record of contemporaneous predictions.',
		evidenceRequirement:
			'advance communications, precise dates, relevant symbols, and adverse scenarios.'
	},
	{
		kicker: '03 / OXY',
		state: 'DOCUMENTATION PENDING',
		title: 'The Reported +600% Overnight OXY Put Trade',
		description:
			'The founder describes an overnight OXY put-options trade during a period of reported Warren Buffett buying. A transparent study must separate publicity from the actual option position and its risk.',
		evidenceRequirement:
			'option symbol, strike, expiry, timestamps, fills, sizing, realized return, and maximum loss.'
	}
] as const;

export interface ComparisonPoint {
	lead: string;
	detail: string;
}

export const MANIFESTO_NEGATIVE_POINTS: readonly ComparisonPoint[] = [
	{
		lead: '“Holy grail” indicators',
		detail: 'Signals that shift after the candle closes or imply impossible certainty.'
	},
	{
		lead: 'Overpriced, recycled theory',
		detail: 'Large fees attached to generic concepts without practical, testable application.'
	},
	{
		lead: 'Hindsight-only win screenshots',
		detail: 'Wins posted without original plans, position risk, or losing-trade context.'
	},
	{
		lead: 'One-size-fits-all trading',
		detail:
			'Strategies that overlook different account sizes, time constraints, and experience levels.'
	}
] as const;

export const MANIFESTO_POSITIVE_POINTS: readonly ComparisonPoint[] = [
	{
		lead: 'Accessible membership choices',
		detail: 'Different service levels designed around the help you actually need.'
	},
	{
		lead: 'Market-structure education',
		detail: 'Price, liquidity, volume, options mechanics, and the reasoning behind trade decisions.'
	},
	{
		lead: 'Entries, targets & invalidation levels',
		detail:
			'A stated trading thesis and defined exit criteria before a setup is considered actionable.'
	},
	{
		lead: 'Services for multiple schedules',
		detail: 'Live day trading, swing planning, small-account education, and video alerts.'
	}
] as const;

export type PersonaIcon = 'briefcase' | 'wallet' | 'lightning' | 'target';

export interface TraderPersona {
	icon: PersonaIcon;
	graphic: string;
	tag: string;
	title: string;
	description: string;
	ctaLabel: string;
	href: string;
	previewTarget: string;
}

export const TRADER_PERSONAS: readonly TraderPersona[] = [
	{
		icon: 'briefcase',
		graphic: '09—05',
		tag: 'BUSY CAREERS',
		title: 'Working Professionals & Swing Traders',
		description:
			'For full-time schedules: pre-planned swing ideas and video watchlists with entries, exits, and invalidation levels that can be reviewed outside the live session.',
		ctaLabel: 'Explore swing & watchlists',
		href: '/live-trading-rooms/swing-trading-room',
		previewTarget: 'memberships'
	},
	{
		icon: 'wallet',
		graphic: '$500+',
		tag: 'SMALL ACCOUNT EDUCATION',
		title: 'Small-Account Traders ($500+)',
		description:
			'Learn position sizing, options contract risk, settlement rules, and how to protect limited capital. A $500 account is not a promise of sustainable profits.',
		ctaLabel: 'View small-account program',
		href: '/live-trading-rooms/small-accounts-room',
		previewTarget: 'memberships'
	},
	{
		icon: 'lightning',
		graphic: '9:30—4:00',
		tag: 'LIVE INTRADAY EXECUTION',
		title: 'Active Day Traders & Scalpers',
		description:
			'Follow real-time market context, chart sharing, trade planning, and position management for stocks, ETFs, and options during active sessions.',
		ctaLabel: 'Explore the day trading room',
		href: '/live-trading-rooms/day-trading-room',
		previewTarget: 'memberships'
	},
	{
		icon: 'target',
		graphic: 'PRO',
		tag: 'ADVANCED TRADERS',
		title: 'Experienced & Full-Time Traders',
		description:
			'Go deeper into execution process, repeatability, custom tools, and structured 1-on-1 review through a selective mentorship program.',
		ctaLabel: 'Apply for private mentorship',
		href: '/mentorship',
		previewTarget: 'mentorship'
	}
] as const;

export interface MembershipChecklistItem {
	lead: string;
	body: string;
}

export interface MembershipTier {
	index: string;
	tag: string;
	title: string;
	description: string;
	featured: boolean;
	bullets: readonly MembershipChecklistItem[];
	ctaLabel: string;
	href: string;
	previewTarget: string;
}

export const MEMBERSHIP_TIERS: readonly MembershipTier[] = [
	{
		index: 'MEMBERSHIP / 01',
		tag: 'DAY TRADERS · SCALPERS · PROS',
		title: 'Day Trading Room — Live Stock & Options Execution',
		description:
			'Step into our virtual trading floor. Follow real-time market reads, voice commentary, screen sharing, and execution discipline across stocks and options.',
		featured: true,
		bullets: [
			{
				lead: 'Live pre-market preparation:',
				body: 'key levels, catalysts, and stock/options trading scenarios before the open.'
			},
			{
				lead: 'Real-time voice & screen sharing:',
				body: 'hear and see decision-making, entries, scaling, and stop management.'
			},
			{
				lead: 'Stocks & options intraday setups:',
				body: 'identify potential momentum trades and options structures with clear risk.'
			},
			{
				lead: 'Live education as we trade:',
				body: 'understand the thesis, the invalidation, and when no trade is the right trade.'
			}
		],
		ctaLabel: 'Join the Day Trading Room',
		href: '/live-trading-rooms/day-trading-room',
		previewTarget: 'memberships'
	},
	{
		index: 'MEMBERSHIP / 02',
		tag: 'WORKING PROFESSIONALS',
		title: 'Swing Trading Room — Multi-Day Stock & Options Setups',
		description:
			'Built for people who cannot watch charts all day. Plan multi-day and multi-week stock and options ideas around a career and personal life.',
		featured: false,
		bullets: [
			{
				lead: '9-to-5-friendly trade planning:',
				body: 'setup briefs that help you evaluate conditional orders around your schedule.'
			},
			{
				lead: 'Entry, target & stop levels:',
				body: 'defined zones, potential exits, and trade invalidation before the setup triggers.'
			},
			{
				lead: 'Rotation & macro context:',
				body: 'lessons about market cycles, relative strength, and volatility.'
			},
			{
				lead: 'Evening & weekly video breakdowns:',
				body: 'digestible reviews of planned swing scenarios and positions.'
			}
		],
		ctaLabel: 'Explore Swing Trading Room',
		href: '/live-trading-rooms/swing-trading-room',
		previewTarget: 'memberships'
	},
	{
		index: 'MEMBERSHIP / 03',
		tag: 'STARTING ACCOUNTS FROM $500+',
		title: 'Small Accounts Room — Risk-First Mentorship ($500+)',
		description:
			'A dedicated educational track for traders working with limited capital. The priority is understanding risk, not promising fast or guaranteed account growth.',
		featured: false,
		bullets: [
			{
				lead: 'Appropriately sized setups:',
				body: 'learn how stock and options exposure interacts with smaller account sizes.'
			},
			{
				lead: 'Capital-preservation rules:',
				body: 'position sizing, maximum loss, and why a single trade must never define your account.'
			},
			{
				lead: 'Account rules education:',
				body: 'understand settlement, margin, and applicable pattern day-trading requirements.'
			},
			{
				lead: 'Structured learning roadmap:',
				body: 'build habits, review mistakes, and develop a repeatable process.'
			}
		],
		ctaLabel: 'Explore Small Accounts Room',
		href: '/live-trading-rooms/small-accounts-room',
		previewTarget: 'memberships'
	},
	{
		index: 'MEMBERSHIP / 04',
		tag: 'SPX PROFIT PULSE · EXPLOSIVE SWINGS',
		title: 'Alert Services — SPX Profit Pulse & Explosive Swings',
		description:
			'Want planned stock and options setups without a live room? Review the video thesis, intended trigger areas, targets, and invalidation in your own time.',
		featured: false,
		bullets: [
			{
				lead: 'Detailed video watchlists:',
				body: 'setups explained with charts, market context, and relevant catalysts.'
			},
			{
				lead: 'Planned entries, exits & stops:',
				body: 'trigger zones, potential profit levels, and invalidation points.'
			},
			{
				lead: 'Timely setup alerts:',
				body: 'updates across SPX Profit Pulse and Explosive Swings when monitored levels trigger.'
			},
			{
				lead: 'Lower-commitment access:',
				body: 'prepared ideas for members who do not need live voice commentary.'
			}
		],
		ctaLabel: 'Explore Alert Services',
		href: '/alert-services/spx-profit-pulse',
		previewTarget: 'memberships'
	}
] as const;

export interface StoreToolCard {
	id: string;
	visualVariant: 'indicators' | 'courses';
	visualCorner: string;
	visualStamp: string;
	tag: string;
	title: string;
	description: string;
	bullets: readonly string[];
	ctaLabel: string;
	href: string;
	previewTarget: string;
}

export const STORE_TOOLS: readonly StoreToolCard[] = [
	{
		id: 'indicators-scanners',
		visualVariant: 'indicators',
		visualCorner: 'INDICATOR CONCEPT / NOT LIVE',
		visualStamp: 'SIGNAL INTEGRITY / VISIBLE HISTORICAL STATE',
		tag: 'INNOVATE / PROPRIETARY INDICATORS & SCANNERS',
		title: 'Custom indicators & scanners. No repainting promises without tests.',
		description:
			'Explore technical tools designed to examine liquidity, price behavior, volume, and possible inflection zones. Any “non-repainting” claim should be backed by reproducible real-time tests and clear signal definitions.',
		bullets: [
			'Transparent signal timing and historical-state behavior.',
			'Market-structure context instead of unexplained arrows.',
			'Accessible tools intended to support—not replace—risk management.'
		],
		ctaLabel: 'Explore Custom Indicators',
		href: '/store/indicators',
		previewTarget: 'tools'
	},
	{
		id: 'trading-courses',
		visualVariant: 'courses',
		visualCorner: 'CURRICULUM CONCEPT / NOT LIVE',
		visualStamp: 'FROM FOUNDATIONS TO EXECUTION',
		tag: 'EDUCATE / STOCK & OPTIONS COURSES',
		title: 'Real skills. Structured from day one.',
		description:
			'Our self-paced educational curriculum is designed to explain why markets move, how options contracts behave, and how to build an execution process that can withstand uncertainty.',
		bullets: [
			'Price action, volume, market structure, and order-flow concepts.',
			'Calls, puts, spreads, implied volatility, and contract selection.',
			'Defined-risk plans, trader psychology, and post-trade reviews.'
		],
		ctaLabel: 'Explore Trading Courses',
		href: '/store/courses',
		previewTarget: 'tools'
	}
] as const;

export interface MentorshipStep {
	number: string;
	title: string;
	description: string;
}

export const MENTORSHIP_STEPS: readonly MentorshipStep[] = [
	{
		number: '01',
		title: 'Submit your trader application',
		description: 'Share your experience, current struggles, preferred markets, schedule, and goals.'
	},
	{
		number: '02',
		title: 'Personal review & fit assessment',
		description: 'We assess whether the program format matches your needs and commitment.'
	},
	{
		number: '03',
		title: 'Individual education plan',
		description:
			'If accepted, define specific learning priorities, process goals, and review checkpoints.'
	}
] as const;

export interface EbookTakeaway {
	number: string;
	text: string;
}

export const EBOOK_TAKEAWAYS: readonly EbookTakeaway[] = [
	{
		number: '01',
		text: 'Read a transparent case study and separate historical evidence from storytelling.'
	},
	{
		number: '02',
		text: 'Map possible entries, exits, and invalidation before placing a trade.'
	},
	{
		number: '03',
		text: 'Understand risk and position-sizing constraints for small accounts.'
	},
	{
		number: '04',
		text: 'Learn what “non-repainting” means and what an indicator cannot guarantee.'
	}
] as const;

export const EBOOK_PROFILES = [
	'Day Trader / Scalper',
	'Working Professional / Swing Trader',
	'Small Account Trader ($500+)',
	'Video Watchlists & Alerts'
] as const;

export type EbookProfile = (typeof EBOOK_PROFILES)[number];

export interface BlogArticle {
	id: string;
	coverVariant: 'cover1' | 'cover2' | 'cover3';
	coverLabel: string;
	meta: string;
	title: string;
	excerpt: string;
	href: string;
}

export const BLOG_ARTICLES: readonly BlogArticle[] = [
	{
		id: 'oxy-put-options',
		coverVariant: 'cover1',
		coverLabel: 'OPTIONS CASE STUDY / EDITORIAL PLACEHOLDER',
		meta: 'OPTIONS CASE STUDY • OCT 2026',
		title: 'Behind the Reported 600% Overnight OXY Put-Options Trade',
		excerpt:
			'What a rigorous review needs to show about option structure, timing, risk, actual execution, and the broader market narrative.',
		href: '/blogs/how-we-shorted-oxy-put-options-600-percent-overnight'
	},
	{
		id: 'small-account-blueprint',
		coverVariant: 'cover2',
		coverLabel: 'SMALL ACCOUNTS / CAPITAL PROTECTION',
		meta: 'SMALL ACCOUNTS • OCT 2026',
		title: 'The $500 Small-Account Blueprint: Risk Before Returns',
		excerpt:
			'How position sizing, contract selection, settlement, and account rules can shape an educational plan for limited capital.',
		href: '/blogs/growing-a-500-dollar-small-options-account-without-blowing-up'
	},
	{
		id: 'swing-trading-professionals',
		coverVariant: 'cover3',
		coverLabel: 'WORKING PROFESSIONALS / SWING SETUPS',
		meta: 'SWING TRADING • OCT 2026',
		title: 'How Working Professionals Use Video Watchlists & Planned Stops',
		excerpt:
			'Build a repeatable market review around your schedule with video watchlists, pre-set triggers, and pre-defined risk.',
		href: '/blogs/swing-trading-options-with-a-full-time-job-watchlist-routine'
	}
] as const;

export interface FaqItem {
	id: string;
	question: string;
	answer: string;
}

export const FAQ_ITEMS: readonly FaqItem[] = [
	{
		id: 'what-makes-different',
		question: 'What makes Revolution Trading Pros different?',
		answer:
			'Our proposed approach puts education, pre-trade planning, defined risk, and accessible service options ahead of exaggerated promises. We intend to publish timestamped documentation behind founder-reported historical trading claims. Marketing statements are not a substitute for verified records or a guarantee of results.'
	},
	{
		id: 'small-account-500',
		question: 'I have a $500 account. Is there a membership for me?',
		answer:
			'Yes, the planned Small Accounts Room mentorship is intended for people who want to learn how limited capital affects position sizing, stock and options exposure, and account rules. A $500 account can be lost, and small balances limit what strategies are practical or appropriate.'
	},
	{
		id: 'full-time-9-to-5',
		question: 'Which option works with a full-time 9-to-5 job?',
		answer:
			'Start with the Swing Trading Room or our Alert Services (SPX Profit Pulse and Explosive Swings). Both are designed around prepared market scenarios, entries, targets, and invalidation levels so you can review ideas outside a live trading room.'
	},
	{
		id: 'video-watchlist-deliverables',
		question: 'What comes with the video watchlist & alert memberships?',
		answer:
			'Planned deliverables include detailed video setup explanations, relevant charts and catalysts, proposed entry zones, profit targets, risk levels, and alerts as scenarios develop across SPX Profit Pulse and Explosive Swings. Delivery terms and timing should be confirmed on the live membership page.'
	},
	{
		id: 'apply-1-on-1-mentorship',
		question: 'How do I apply for 1-on-1 mentorship?',
		answer:
			'Submit an application describing your experience, needs, goals, and schedule. The team reviews applications for fit. The program is not sold by immediate checkout, and acceptance or financial success is never guaranteed.'
	}
] as const;

export interface ClosingContent {
	eyebrow: string;
	headlineLead: string;
	headlineUnderline: string;
	description: string;
	primaryCta: {
		label: string;
		href: string;
		previewTarget: string;
	};
	secondaryCta: {
		label: string;
		href: string;
		previewTarget: string;
	};
}

export const CLOSING_CONTENT: ClosingContent = {
	eyebrow: 'EDUCATE. INNOVATE. PROSPER.',
	headlineLead: 'We Are the Present. We Are the Future.',
	headlineUnderline: 'We Are the Revolution.',
	description:
		'Leave the hype behind. Choose education, transparency, and realistic risk management. Explore a trading community designed to help you improve your process—not to sell you a promise of easy profits.',
	primaryCta: {
		label: 'Explore Memberships Now',
		href: '/memberships',
		previewTarget: 'memberships'
	},
	secondaryCta: {
		label: 'Apply for Private Mentorship',
		href: '/mentorship',
		previewTarget: 'mentorship'
	}
} as const;

export interface FooterColumn {
	id: string;
	title: string;
	ariaLabel: string;
	links: readonly {
		label: string;
		href: string;
		previewTarget: string;
	}[];
}

export const FOOTER_COLUMNS: readonly FooterColumn[] = [
	{
		id: 'footer-rooms',
		title: 'LIVE TRADING ROOMS',
		ariaLabel: 'Live trading rooms',
		links: [
			{
				label: 'Day Trading Room',
				href: '/live-trading-rooms/day-trading-room',
				previewTarget: 'memberships'
			},
			{
				label: 'Swing Trading Room',
				href: '/live-trading-rooms/swing-trading-room',
				previewTarget: 'memberships'
			},
			{
				label: 'Small Accounts Room',
				href: '/live-trading-rooms/small-accounts-room',
				previewTarget: 'memberships'
			},
			{
				label: 'All Memberships',
				href: '/memberships',
				previewTarget: 'memberships'
			}
		]
	},
	{
		id: 'footer-alerts-mentorship',
		title: 'ALERTS & MENTORSHIP',
		ariaLabel: 'Alert services and mentorship',
		links: [
			{
				label: 'SPX Profit Pulse',
				href: '/alert-services/spx-profit-pulse',
				previewTarget: 'memberships'
			},
			{
				label: 'Explosive Swings',
				href: '/alert-services/explosive-swings',
				previewTarget: 'memberships'
			},
			{
				label: 'Private 1-on-1 Mentorship',
				href: '/mentorship',
				previewTarget: 'mentorship'
			},
			{
				label: 'Track Record & Case Studies',
				href: '/about',
				previewTarget: 'track-record'
			}
		]
	},
	{
		id: 'footer-store',
		title: 'STORE & TOOLS',
		ariaLabel: 'Store, courses, indicators, and scanners',
		links: [
			{
				label: 'Courses',
				href: '/store/courses',
				previewTarget: 'tools'
			},
			{
				label: 'Indicators',
				href: '/store/indicators',
				previewTarget: 'tools'
			},
			{
				label: 'Scanners',
				href: '/store/scanners',
				previewTarget: 'tools'
			},
			{
				label: 'Our Mission',
				href: '/our-mission',
				previewTarget: 'why-us'
			}
		]
	},
	{
		id: 'footer-resources',
		title: 'FREE RESOURCES',
		ariaLabel: 'Free trading resources',
		links: [
			{
				label: 'Options Calculator',
				href: '/resources/options-calculator',
				previewTarget: 'tools'
			},
			{
				label: 'ETF Stocks List',
				href: '/resources/etf-stocks-list',
				previewTarget: 'tools'
			},
			{
				label: 'Stock Indexes List',
				href: '/resources/stock-indexes-list',
				previewTarget: 'tools'
			},
			{
				label: 'Free Trading eBook',
				href: '/resources/free-trading-ebook',
				previewTarget: 'ebook'
			},
			{
				label: 'Blogs',
				href: '/blog',
				previewTarget: 'blog'
			}
		]
	},
	{
		id: 'footer-legal',
		title: 'LEGAL & SUPPORT',
		ariaLabel: 'Legal disclosures and support',
		links: [
			{
				label: 'Contact',
				href: '/contact',
				previewTarget: 'footer'
			},
			{
				label: 'Privacy Policy',
				href: '/privacy-policy',
				previewTarget: 'footer'
			},
			{
				label: 'Terms of Service',
				href: '/terms-of-service',
				previewTarget: 'footer'
			}
		]
	}
] as const;
