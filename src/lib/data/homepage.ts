import { FREE_EBOOK_AVAILABLE, isLaunchedHref, isNavigationHrefVisible } from './launch-gate.ts';

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

const FULL_NAVIGATION: readonly NavItem[] = [
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
				label: 'Sunday Alpha Protocol',
				href: '/watchlist',
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
		label: 'Blog',
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
				href: '/resources',
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

/**
 * Navigation shared by desktop/mobile, footer policy and navigation JSON-LD.
 * Blog visibility is independent of its search-indexing gate; hidden dropdowns disappear.
 */
export const MAIN_NAVIGATION: readonly NavItem[] = FULL_NAVIGATION.flatMap((item): NavItem[] => {
	if (item.children) {
		const children = item.children.filter((child) => isNavigationHrefVisible(child.href));
		return children.length > 0 ? [{ ...item, children }] : [];
	}
	return !item.href || isNavigationHrefVisible(item.href) ? [item] : [];
});

export interface DocumentationStandardItem {
	number: string;
	title: string;
	description: string;
}

/**
 * Hero panel: how content is documented. Each line restates a commitment already published on
 * `/editorial-policy` (src/routes/editorial-policy/+page.svelte, "Our Editorial Commitments" cards 1 and 2
 * and the "Editorial Disclosure" strip), so the homepage never claims more than the policy page does.
 */
export const DOCUMENTATION_STANDARD_ITEMS: readonly DocumentationStandardItem[] = [
	{
		number: '01',
		title: 'Primary sources, cited',
		description:
			'Contract specifications, settlement rules and tax references cite primary sources such as Cboe, CME Group, the SEC, FINRA, the OSC and IRS documentation.'
	},
	{
		number: '02',
		title: 'Risk stated before reward',
		description:
			'No strategy, indicator or alert service is presented as a guaranteed return. Setups state invalidation levels, position-sizing limits and realistic drawdown risk.'
	},
	{
		number: '03',
		title: 'Education, not advice',
		description:
			'Content is for educational purposes only and is not personalized investment advice. Trading involves substantial risk of loss.'
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

/** An image of the trade as it was communicated, 1200x675, served from `static/`. */
export interface CaseStudyChart {
	src: string;
	width: 1200;
	height: 675;
	/** Describe the market structure shown, not just "chart". */
	alt: string;
}

/**
 * A fully documented trade. Every field is required on purpose: the homepage renders a case study only if
 * all of it is real (see `isPublishableCaseStudy`), so there is no way to ship a half-filled "pending" card.
 */
export interface VerifiedCaseStudy {
	id: string;
	/** e.g. `01 / OXY` */
	kicker: string;
	title: string;
	/** What was communicated and why, in one or two sentences. */
	summary: string;
	/** Full option contract symbol, e.g. OCC format. */
	contractSymbol: string;
	strike: string;
	/** ISO date (YYYY-MM-DD). */
	expiration: string;
	/** ISO 8601 timestamps with offset, e.g. 2022-03-01T15:42:10-05:00. */
	enteredAt: string;
	exitedAt: string;
	positionSize: string;
	/** Maximum loss on the position, stated in dollars or % of account. */
	maxRisk: string;
	/** Realised result, with the fills it is computed from. */
	result: string;
	chart: CaseStudyChart;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

/** A calendar date that really exists: `2026-02-31` matches the pattern but round-trips to a different day. */
const isRealDate = (iso: string) => {
	const time = Date.parse(`${iso}T00:00:00Z`);
	return (
		ISO_DATE.test(iso) && !Number.isNaN(time) && new Date(time).toISOString().slice(0, 10) === iso
	);
};

/** True only when every required field is filled and the dates parse. Incomplete records never render. */
export function isPublishableCaseStudy(study: VerifiedCaseStudy): boolean {
	const text = [
		study.id,
		study.kicker,
		study.title,
		study.summary,
		study.contractSymbol,
		study.strike,
		study.positionSize,
		study.maxRisk,
		study.result,
		study.chart.src,
		study.chart.alt
	];
	return (
		text.every((value) => value.trim().length > 0) &&
		isRealDate(study.expiration) &&
		ISO_INSTANT.test(study.enteredAt) &&
		ISO_INSTANT.test(study.exitedAt) &&
		!Number.isNaN(Date.parse(study.enteredAt)) &&
		!Number.isNaN(Date.parse(study.exitedAt)) &&
		Date.parse(study.exitedAt) >= Date.parse(study.enteredAt)
	);
}

/**
 * Documented trades for the homepage "receipts" section. Intentionally empty: the repository holds no
 * contract symbols, fills, timestamps or chart captures for the founder's reported 2020, 2022 or OXY calls,
 * and this site does not invent them. Add a record here once the original alerts and broker fills exist;
 * the section appears by itself. Tracked in docs/seo/LAUNCH_TRACKER.md.
 */
export const VERIFIED_CASE_STUDIES: readonly VerifiedCaseStudy[] = [] as const;

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
		tag: 'SPX PROFIT PULSE · SUNDAY ALPHA PROTOCOL',
		title: 'Alert Services — SPX Profit Pulse & Sunday Alpha Protocol',
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
				body: 'updates across SPX Profit Pulse and Sunday Alpha Protocol when monitored levels trigger.'
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
			'Start with the Swing Trading Room or our Alert Services (SPX Profit Pulse and Sunday Alpha Protocol). Both are designed around prepared market scenarios, entries, targets, and invalidation levels so you can review ideas outside a live trading room.'
	},
	{
		id: 'video-watchlist-deliverables',
		question: 'What comes with the video watchlist & alert memberships?',
		answer:
			'Planned deliverables include detailed video setup explanations, relevant charts and catalysts, proposed entry zones, profit targets, risk levels, and alerts as scenarios develop across SPX Profit Pulse and Sunday Alpha Protocol. Delivery terms and timing should be confirmed on the live membership page.'
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
		href: '/live-trading-rooms/day-trading-room',
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

const FULL_FOOTER_COLUMNS: readonly FooterColumn[] = [
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
				href: '/live-trading-rooms/day-trading-room#join-day-trading-room',
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
				label: 'Sunday Alpha Protocol',
				href: '/watchlist',
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
		// With the store gated only "Our Mission" is left, so the column is renamed rather than left mislabelled.
		title: isLaunchedHref('/store') ? 'STORE & TOOLS' : 'COMPANY',
		ariaLabel: isLaunchedHref('/store') ? 'Store, courses, indicators, and scanners' : 'Company',
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
				href: '/resources',
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
			...(FREE_EBOOK_AVAILABLE
				? [
						{
							label: 'Free Trading eBook',
							href: '/resources#resource-categories-h2',
							previewTarget: 'ebook'
						}
					]
				: []),
			{
				label: 'Blog',
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
				label: 'Editorial Policy',
				href: '/editorial-policy',
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
			},
			{
				label: 'Risk Disclosure',
				href: '/terms-of-service#options-leverage-risk-disclosure',
				previewTarget: 'footer'
			},
			{
				label: 'Refund Policy',
				href: '/refund-policy',
				previewTarget: 'footer'
			}
		]
	}
] as const;

/** Footer columns with every link behind the launch gate removed; a column left empty is dropped. */
export const FOOTER_COLUMNS: readonly FooterColumn[] = FULL_FOOTER_COLUMNS.map((column) => ({
	...column,
	links: column.links.filter((link) => isNavigationHrefVisible(link.href))
})).filter((column) => column.links.length > 0);
