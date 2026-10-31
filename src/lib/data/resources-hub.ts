/**
 * Static content for /resources. Module scope: created once, not per component instance.
 * Hrefs use `string` because several targets are planned routes (see PLANNED_ROUTE_PATTERN in vite.config.ts).
 */

export interface ResourceItemLink {
	label: string;
	href: string;
	tag: string;
}

export type ResourceIconType = 'book' | 'calculator' | 'video' | 'chart' | 'mindset' | 'support';

export interface ResourceCategoryCard {
	code: string;
	badge: string;
	title:
		| 'Beginner Guides'
		| 'Free Tools'
		| 'Video Tutorials'
		| 'Market Analysis'
		| 'Trading Psychology'
		| 'FAQ & Support';
	summary: string;
	iconType: ResourceIconType;
	items: [ResourceItemLink, ResourceItemLink, ResourceItemLink, ResourceItemLink];
}

export interface FlagshipUtility {
	code: string;
	badge: string;
	name: string;
	description: string;
	ctaLabel: string;
	href: string;
}

/* ===========================================================================
     3 CANONICAL MENU PUBLIC UTILITIES (USES .flagship-utility-card SO
     .resource-card COUNT REMAINS EXACTLY 6 FOR VITEST)
     =========================================================================== */
export const flagshipUtilities: FlagshipUtility[] = [
	{
		code: 'Public Utility 01 // Interactive Risk Engine',
		badge: '100% Free Tool',
		name: 'Options Calculator (Profit, Risk & Greeks)',
		description:
			'Calculate exact option profit targets, breakeven levels, Delta/Gamma/Theta/Vega sensitivity, and $500+ small account position sizing before entering a trade.',
		ctaLabel: 'Open Options Calculator →',
		href: '/resources/options-calculator'
	},
	{
		code: 'Public Utility 02 // Institutional Sector Map',
		badge: '12 Core + 11 Sectors',
		name: 'ETF Stocks List & Sector Directory',
		description:
			'Explore SPY, QQQ, IWM, GLD, and all 11 official S&P 500 GICS sector ETFs with live TradingView chart links and options liquidity ratings.',
		ctaLabel: 'Open ETF Stocks List →',
		href: '/resources/etf-stocks-list'
	},
	{
		code: 'Public Utility 03 // Cash-Settled Index Guide',
		badge: 'SPX • NDX • DJI • RUT • VIX',
		name: 'Stock Indexes List & Section 1256 Guide',
		description:
			'Master SPX, NDX, RUT, DJI, and VIX mechanics—including European cash settlement, zero early assignment risk, and US Section 1256 60/40 tax treatment.',
		ctaLabel: 'Open Stock Indexes List →',
		href: '/resources/stock-indexes-list'
	}
];

/* ===========================================================================
     EXACTLY 6 .resource-card BLOCKS & 24 .resource-card__item LINKS
     (100% COMPLIANT WITH VITEST BROWSER SUITE)
     =========================================================================== */
export const resourceCategories: ResourceCategoryCard[] = [
	{
		code: 'Category 01 // Foundation & $500+ Accounts',
		badge: 'Starter Playbooks',
		title: 'Beginner Guides',
		summary:
			'Step-by-step foundational playbooks built to protect new traders from fake guru traps and grow $500+ small accounts safely.',
		iconType: 'book',
		items: [
			{
				label: "Complete Beginner's Guide to Trading",
				href: '/store/courses',
				tag: 'Guide'
			},
			{
				label: 'How to Set Up Your Trading Account',
				href: '/live-trading-rooms/small-accounts-room',
				tag: '$500+ Setup'
			},
			{
				label: 'Understanding Options Basics',
				href: '/blogs/ultimate-guide-to-options-greeks',
				tag: 'Options 101'
			},
			{
				label: 'Risk Management for New Traders',
				href: '/blogs/risk-management-essentials-for-active-traders',
				tag: 'Risk Rules'
			}
		]
	},
	{
		code: 'Category 02 // Calculators & Market Lists',
		badge: 'Interactive Utilities',
		title: 'Free Tools',
		summary:
			'Institutional calculators and market directories to plan contract size, reward-to-risk asymmetry, and daily trade journaling.',
		iconType: 'calculator',
		items: [
			{
				label: 'Position Size Calculator',
				href: '/resources/options-calculator',
				tag: 'Live Tool'
			},
			{
				label: 'Risk/Reward Calculator',
				href: '/resources/options-calculator#risk-reward',
				tag: '3R–5R Math'
			},
			{
				label: 'Options Profit Calculator',
				href: '/resources/options-calculator',
				tag: 'Greeks Engine'
			},
			{
				label: 'Trading Journal Template',
				href: '/resources/etf-stocks-list',
				tag: 'Ledger'
			}
		]
	},
	{
		code: 'Category 03 // Visual Execution Walk-Throughs',
		badge: 'On-Demand HD',
		title: 'Video Tutorials',
		summary:
			'Watch how our desk configures ThinkorSwim and TradingView, reads institutional price structure, and executes live options trades.',
		iconType: 'video',
		items: [
			{
				label: 'Platform Setup Walkthrough',
				href: '/store/indicators',
				tag: 'ToS & TV'
			},
			{
				label: 'Reading Charts for Beginners',
				href: '/store/courses',
				tag: 'Price Action'
			},
			{
				label: 'Your First Option Trade',
				href: '/blogs/ultimate-guide-to-options-greeks',
				tag: 'Walkthrough'
			},
			{
				label: 'Live Trade Walkthrough',
				href: '/blogs/how-we-shorted-oxy-put-options-600-percent-overnight',
				tag: '+600% OXY'
			}
		]
	},
	{
		code: 'Category 04 // Institutional Order Flow & Macro',
		badge: 'Market Intelligence',
		title: 'Market Analysis',
		summary:
			'Top-down institutional research covering weekly recaps, FOMC/CPI macro catalysts, dealer gamma walls, and sector money flow.',
		iconType: 'chart',
		items: [
			{
				label: 'Weekly Market Recap',
				href: '/blog',
				tag: 'Recap'
			},
			{
				label: 'Economic Calendar Explained',
				href: '/resources/stock-indexes-list',
				tag: 'Macro Events'
			},
			{
				label: 'Key Levels to Watch',
				href: '/alert-services/spx-profit-pulse',
				tag: 'SPX Gamma'
			},
			{
				label: 'Sector Rotation Analysis',
				href: '/resources/etf-stocks-list#etfs-by-sector',
				tag: '11 Sectors'
			}
		]
	},
	{
		code: 'Category 05 // Mental Game & Discipline',
		badge: 'Mindset Architecture',
		title: 'Trading Psychology',
		summary:
			'Eradicate FOMO, revenge trading, and hesitation by installing Goldman Sachs prop-desk discipline and pre-trade checklists.',
		iconType: 'mindset',
		items: [
			{
				label: 'Managing Trading Emotions',
				href: '/blogs/risk-management-essentials-for-active-traders',
				tag: 'Mindset'
			},
			{
				label: 'Developing Discipline',
				href: '/our-mission',
				tag: 'Process'
			},
			{
				label: 'Dealing with Losing Streaks',
				href: '/mentorship',
				tag: 'Turnaround'
			},
			{
				label: 'Building Confidence',
				href: '/about#verified-calls',
				tag: 'Conviction'
			}
		]
	},
	{
		code: 'Category 06 // Direct Desk Assistance',
		badge: 'Member Support',
		title: 'FAQ & Support',
		summary:
			'Get straight answers on options terminology, community rules, and how our rooms and alert services operate.',
		iconType: 'support',
		items: [
			{
				label: 'Frequently Asked Questions',
				href: '/about#about-faq-h2',
				tag: 'Answers'
			},
			{
				label: 'Glossary of Trading Terms',
				href: '/blogs/ultimate-guide-to-options-greeks',
				tag: 'Glossary'
			},
			{
				label: 'Community Guidelines',
				href: '/our-mission',
				tag: 'Standards'
			},
			{
				label: 'Contact Support',
				href: '/contact',
				tag: 'Live Desk'
			}
		]
	}
];

/** 24x24 outline glyph per category (stroke icons, rendered by one <svg> in the page). */
export const RESOURCE_ICON_PATHS: Record<ResourceIconType, string> = {
	book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
	calculator:
		'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
	video:
		'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
	chart:
		'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
	mindset:
		'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
	support:
		'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
};
