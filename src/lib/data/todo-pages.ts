import { BRAND } from '#lib/config/brand.ts';
/**
 * Central registry of every unbuilt destination ("TODO" placeholder page) across the site.
 *
 * Architectural contract:
 * - Zero misleading fallbacks: navigation items, resource cards, store cards, and enrollment CTAs
 *   point to their true canonical destination instead of dumping visitors onto `/contact`,
 *   `/admin/login`, `/about`, or `/live-trading-rooms/day-trading-room`.
 * - Every TODO page renders its exact Page Name, canonical route, `TODO` badge, and planned build
 *   checklist, while emitting `robots: 'noindex, nofollow'` (`canonical: undefined`) and staying
 *   excluded from `sitemap.xml` until its production implementation replaces the placeholder.
 */

import { definePageMetaTags } from 'svelte-meta-tags';
import { SITE_ORIGIN } from '#lib/shared/site-origin';

const TODO_BRAND_NAME = `${BRAND.name}`;

export interface TodoBreadcrumbItem {
	label: string;
	href?: string;
}

export interface TodoRelatedLink {
	label: string;
	href: string;
	description: string;
}

export interface TodoPageSpec {
	route: string;
	slug?: string;
	pageName: string;
	metaTitle: string;
	metaDescription: string;
	categoryBadge: string;
	summary: string;
	connectedFrom: string;
	todoChecklist: readonly string[];
	breadcrumbs: readonly TodoBreadcrumbItem[];
	relatedLinks: readonly TodoRelatedLink[];
}

export const STATIC_TODO_PAGES = {
	'/login': {
		route: '/login',
		pageName: 'Member Login Portal',
		metaTitle: 'Member Login Portal — TODO',
		metaDescription: `Dedicated member authentication portal placeholder for ${BRAND.name}. Separates member sign-in from internal staff administration (/admin/login).`,
		categoryBadge: 'MEMBER PORTAL · TODO',
		summary: `Dedicated sign-in portal for ${BRAND.name} members accessing trading rooms, video watchlists, courses, indicators, and scanners — cleanly separated from the internal staff CMS login (/admin/login).`,
		connectedFrom:
			'Header & Mobile Navbar ("Member Login") and Store enrollment sidebars ("Already a Member? Sign In Here").',
		todoChecklist: [
			'Build member email/password + magic-link sign-in form distinct from staff /admin/login.',
			'Route authenticated members to their active room, alert dispatch, and indicator downloads.',
			'Add password recovery, session management, and 2FA account security controls.'
		],
		breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Member Login (TODO)' }],
		relatedLinks: [
			{
				label: 'Live Trading Rooms Hub',
				href: '/live-trading-rooms',
				description: 'Compare the Opening Bell, Swing, and $500+ Small Accounts trading rooms.'
			},
			{
				label: 'Create Free Member Account (TODO)',
				href: '/register',
				description: 'View the planned free member registration onboarding route.'
			},
			{
				label: 'Contact Member Support',
				href: '/contact',
				description: 'Reach the desk directly with account or access questions.'
			}
		]
	},
	'/register': {
		route: '/register',
		pageName: 'Create Free Member Account',
		metaTitle: 'Create Free Account — TODO',
		metaDescription: `Dedicated free member registration placeholder for ${BRAND.name}. Replaces temporary /contact routing on public resource onboarding buttons.`,
		categoryBadge: 'MEMBER ONBOARDING · TODO',
		summary: `Dedicated onboarding page for creating a free ${BRAND.name} member profile to save calculator presets, bookmark institutional research, and preview room schedules.`,
		connectedFrom: 'Resources Hub bottom CTA ("Get Started Free").',
		todoChecklist: [
			'Build free member account creation form with email verification and risk-disclosure acknowledgment.',
			'Provision free member dashboard access to calculators, watchlists, and starter guides.',
			'Connect experience-level onboarding preferences (Intraday, 9-to-5 Swing, or $500+ Small Account).'
		],
		breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Create Free Account (TODO)' }],
		relatedLinks: [
			{
				label: 'Free Trading Resources',
				href: '/resources',
				description: 'Return to public calculators, ETF & index directories, and starter guides.'
			},
			{
				label: 'Member Login Portal (TODO)',
				href: '/login',
				description: 'View the dedicated member login route.'
			},
			{
				label: 'Live Trading Rooms Hub',
				href: '/live-trading-rooms',
				description: 'Explore all three live trading rooms side by side.'
			}
		]
	},
	'/memberships': {
		route: '/memberships',
		pageName: 'All Memberships Overview & Comparison',
		metaTitle: 'All Memberships Hub — TODO',
		metaDescription: `Unified comparison hub placeholder across Live Trading Rooms, Video Watchlist Alert Services, and 1-on-1 Mentorship at ${BRAND.name}.`,
		categoryBadge: 'PARENT HUB · TODO',
		summary: `Master comparison hub uniting all ${BRAND.name} memberships — Live Trading Rooms, Video Watchlist & Alert Services, and Application-Only 1-on-1 Mentorship — in one side-by-side matrix.`,
		connectedFrom:
			'Navbar primary CTA ("Explore Memberships"), Homepage Hero ("Explore Our Memberships"), Homepage Closing CTA, and Footer ("All Memberships").',
		todoChecklist: [
			'Build unified comparison matrix across Live Rooms, Alert Services, and Mentorship.',
			'Add account-size ($500+ cash/FINRA 4210 margin to $25k+) and schedule selector.',
			'Display transparent tier inclusions, cadence differences, and direct enrollment links.'
		],
		breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'All Memberships (TODO)' }],
		relatedLinks: [
			{
				label: 'Live Trading Rooms Hub',
				href: '/live-trading-rooms',
				description:
					'Built comparison hub for Day Trading, Swing Trading, and Small Accounts rooms.'
			},
			{
				label: 'Alert Services Hub',
				href: '/alert-services',
				description: 'Overview hub for SPX Profit Pulse and Sunday Alpha Protocol.'
			},
			{
				label: '1-on-1 Private Mentorship',
				href: '/mentorship',
				description: 'Explore the selective, application-only mentorship program.'
			}
		]
	},
	'/store': {
		route: '/store',
		pageName: 'Store: Courses, Indicators & Scanners Hub',
		metaTitle: 'Store Overview Hub — TODO',
		metaDescription:
			'Parent store hub placeholder uniting self-paced trading courses, ThinkorSwim & TradingView chart studies, and real-time market scanners.',
		categoryBadge: 'PARENT HUB · TODO',
		summary:
			'Top-level Store directory uniting all three educational tool categories: Self-Paced Trading Courses (/store/courses), Chart Structure Overlays (/store/indicators), and Live Market Scanners (/store/scanners).',
		connectedFrom:
			'Store navigation submenu, Store category breadcrumbs, and About page ("Courses, Chart Structure Overlays & Scanners").',
		todoChecklist: [
			'Build unified Store storefront overview showcasing Courses, Indicators, and Scanners.',
			'Add platform compatibility matrix for ThinkorSwim Desktop, ThinkorSwim Mobile, and TradingView.',
			'Surface flagship bundles and direct navigation into each category catalog.'
		],
		breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Store (TODO)' }],
		relatedLinks: [
			{
				label: 'Self-Paced Trading Courses',
				href: '/store/courses',
				description: 'Browse the 8-course institutional order-flow and risk curriculum.'
			},
			{
				label: 'Custom Trading Indicators',
				href: '/store/indicators',
				description: 'Explore confirmed bar-close ThinkorSwim and TradingView chart telemetry.'
			},
			{
				label: 'Institutional Market Scanners',
				href: '/store/scanners',
				description: 'Explore real-time multi-timeframe squeeze and liquidity-sweep scanners.'
			}
		]
	},
	'/mentorship/apply': {
		route: '/mentorship/apply',
		pageName: '1-on-1 Private Mentorship Application',
		metaTitle: 'Mentorship Application — TODO',
		metaDescription: `Dedicated admissions questionnaire placeholder for ${BRAND.name} selective 1-on-1 Private Trading Mentorship with Billy Ribeiro.`,
		categoryBadge: 'ADMISSIONS FLOW · TODO',
		summary:
			'Dedicated admissions application and trading-experience questionnaire for selective 1-on-1 Private Mentorship — replacing generic /contact routing on mentorship application buttons.',
		connectedFrom:
			'1-on-1 Mentorship page ("Apply for 1-on-1 Mentorship") and Homepage Mentorship section.',
		todoChecklist: [
			'Build structured applicant intake form (account size, primary instruments, schedule, execution bottlenecks).',
			'Add mandatory suitability and risk-capital screening acknowledgments.',
			'Wire admissions review queue and calendar scheduling for approved candidates.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: '1-on-1 Mentorship', href: '/mentorship' },
			{ label: 'Application (TODO)' }
		],
		relatedLinks: [
			{
				label: '1-on-1 Mentorship Overview',
				href: '/mentorship',
				description: 'Return to the 1-on-1 Mentorship curriculum, pillars, and admissions criteria.'
			},
			{
				label: 'Live Trading Rooms Hub',
				href: '/live-trading-rooms',
				description: 'Explore daily group trading rooms while mentorship cohorts are reviewed.'
			},
			{
				label: 'Our Anti-Guru Mission',
				href: '/our-mission',
				description: 'Read why mentorship admissions are capped and selective.'
			}
		]
	}
} as const satisfies Record<string, TodoPageSpec>;

export const RESOURCE_TODO_PAGES: readonly TodoPageSpec[] = [
	{
		route: '/resources/position-size-calculator',
		slug: 'position-size-calculator',
		pageName: 'Position Size & Risk-Budget Calculator',
		metaTitle: 'Position Size Tool — TODO',
		metaDescription:
			'Dedicated placeholder for the Stock & Options Position Size Calculator supporting T+1 cash rotation and FINRA Rule 4210 intraday margin risk budgets.',
		categoryBadge: 'FREE PUBLIC TOOL · TODO',
		summary:
			'Interactive position-sizing calculator computing exact share or option contract quantities from account equity, per-trade risk percentage (0.5%–2%), entry price, and hard invalidation stop.',
		connectedFrom:
			'Resources Hub ("Position Size Calculator") and Live Trading Rooms Hub ("Open Position Size Calculator").',
		todoChecklist: [
			'Compute exact share count and option contract limit from account balance, risk %, and stop distance.',
			'Add T+1 settled-cash daily bucket partitioning and FINRA Rule 4210 $2,000 margin baseline checks.',
			'Display automatic drawdown recovery math and oversized-contract warnings.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Position Size Calculator (TODO)' }
		],
		relatedLinks: [
			{
				label: '0DTE Risk & Position Sizing Playbook',
				href: '/resources/finra-intraday-margin-rule-2026',
				description: 'Read our published institutional position-sizing research article.'
			},
			{
				label: 'Small Accounts Room ($500+)',
				href: '/live-trading-rooms/small-accounts-room',
				description: 'See how disciplined sizing is applied in smaller accounts.'
			},
			{
				label: 'Free Trading Resources Hub',
				href: '/resources',
				description: 'Return to all public tools and guides.'
			}
		]
	},
	{
		route: '/resources/risk-reward-calculator',
		slug: 'risk-reward-calculator',
		pageName: 'Asymmetric Risk/Reward (3R–5R) Calculator',
		metaTitle: 'Risk/Reward Tool — TODO',
		metaDescription: `Dedicated placeholder for the R-Multiple, Win-Rate Breakeven, and Tiered Scale-Out Expectancy Calculator at ${BRAND.name}.`,
		categoryBadge: 'FREE PUBLIC TOOL · TODO',
		summary:
			'Mathematical expectancy calculator mapping entry trigger, hard stop-loss (1R), tiered profit targets (T1/T2/Runners), and minimum win-rate required for positive expectancy.',
		connectedFrom: 'Resources Hub Free Tools ("Risk/Reward Calculator").',
		todoChecklist: [
			'Calculate R-multiple, dollar risk, tiered scale-out blended return, and breakeven win rate.',
			'Simulate 50-trade expectancy curves across 1:2, 1:3, and 1:5 risk-to-reward setups.',
			'Flag negative-asymmetry setups below a 1:2 reward-to-risk threshold.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Risk/Reward Calculator (TODO)' }
		],
		relatedLinks: [
			{
				label: 'Free Trading Resources Hub',
				href: '/resources',
				description: 'Return to all calculators and directories.'
			},
			{
				label: 'Sunday Alpha Protocol',
				href: '/alert-services/sunday-alpha-protocol',
				description: 'See how a strict 1:2.50+ R-multiple filter structures multi-day swings.'
			},
			{
				label: 'Live Trading Rooms Hub',
				href: '/live-trading-rooms',
				description: 'Compare pre-trade risk rules across all three rooms.'
			}
		]
	},
	{
		route: '/resources/trading-journal-template',
		slug: 'trading-journal-template',
		pageName: 'Institutional Trading Journal & Expectancy Ledger',
		metaTitle: 'Trading Journal — TODO',
		metaDescription:
			'Dedicated placeholder for the downloadable and interactive Trading Journal Template tracking R-multiples, rule adherence, and setup expectancy.',
		categoryBadge: 'FREE TEMPLATE · TODO',
		summary:
			'Structured pre-trade and post-trade ledger template tracking setup classification, entry/target/stop adherence, R-multiple outcomes, emotional tilt tags, and session expectancy.',
		connectedFrom: 'Resources Hub Free Tools ("Trading Journal Template").',
		todoChecklist: [
			'Provide downloadable CSV/Notion/Excel ledger plus interactive browser trade-audit checklist.',
			'Track setup expectancy by time-of-day window, instrument class, and rule-compliance score.',
			'Include weekly review prompts for eliminating FOMO, early exits, and stop-widening.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Trading Journal Template (TODO)' }
		],
		relatedLinks: [
			{
				label: 'Free Trading Resources Hub',
				href: '/resources',
				description: 'Return to all public tools and starter playbooks.'
			},
			{
				label: '1-on-1 Private Mentorship',
				href: '/mentorship',
				description: 'Learn how trade-ledger audits drive individualized coaching.'
			},
			{
				label: 'Institutional Blog',
				href: '/blog',
				description: 'Read our published execution and risk playbooks.'
			}
		]
	},
	{
		route: '/resources/beginners-guide-to-trading',
		slug: 'beginners-guide-to-trading',
		pageName: "Complete Beginner's Guide to Stock & Options Trading",
		metaTitle: "Beginner's Guide — TODO",
		metaDescription:
			'Dedicated placeholder for the Complete Beginner Guide to Stock, ETF, and Options Trading covering market mechanics, order types, and capital survival.',
		categoryBadge: 'BEGINNER GUIDE · TODO',
		summary:
			'Foundational step-by-step guide introducing market structure, bid-ask spreads, limit vs. stop-limit orders, liquid underlyings, and capital preservation before placing a live trade.',
		connectedFrom: 'Resources Hub Beginner Guides ("Complete Beginner\'s Guide to Trading").',
		todoChecklist: [
			'Write plain-English modules on equities, liquid ETFs, standardized options, and order routing.',
			'Explain why liquidity, spread width, and pre-defined invalidation matter more than chart indicators.',
			'Provide a 30-day paper-to-live readiness checklist for new traders.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Resources', href: '/resources' },
			{ label: "Beginner's Guide (TODO)" }
		],
		relatedLinks: [
			{
				label: 'ETF Stocks & Sector Directory',
				href: '/resources/etf-stocks-list',
				description: 'Start with the most liquid US index and sector ETFs.'
			},
			{
				label: 'Small Accounts Room ($500+)',
				href: '/live-trading-rooms/small-accounts-room',
				description: 'Explore our beginner-friendly risk-first trading room.'
			},
			{
				label: 'Free Trading Resources Hub',
				href: '/resources',
				description: 'Browse all 6 resource categories.'
			}
		]
	},
	{
		route: '/resources/trading-account-setup-guide',
		slug: 'trading-account-setup-guide',
		pageName: 'How to Set Up Your Trading Account (T+1 Cash & FINRA 4210)',
		metaTitle: 'Account Setup Guide — TODO',
		metaDescription:
			'Dedicated placeholder guide comparing T+1 settled-cash accounts and FINRA Rule 4210 intraday margin accounts ($2,000 baseline), options tiers, and data feeds.',
		categoryBadge: 'BEGINNER GUIDE · TODO',
		summary:
			'Practical brokerage configuration guide covering T+1 cash settlement vs. FINRA Rule 4210 intraday margin (effective June 2026, replacing the legacy $25k rule), options approval tiers, and real-time OPRA data.',
		connectedFrom: 'Resources Hub Beginner Guides ("How to Set Up Your Trading Account").',
		todoChecklist: [
			'Compare Cash Accounts (T+1 overnight settlement, zero Good Faith Violations) vs. FINRA Rule 4210 Intraday Margin ($2,000 minimum equity baseline).',
			'Explain Level 1 / Tier 2 defined-risk options permissions (long calls/puts and vertical spreads).',
			'Document real-time NYSE/Nasdaq/OPRA market-data feed verification.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Account Setup Guide (TODO)' }
		],
		relatedLinks: [
			{
				label: 'Small Accounts Room ($500+)',
				href: '/live-trading-rooms/small-accounts-room',
				description: 'See how T+1 cash rotation and FINRA 4210 margin discipline work in practice.'
			},
			{
				label: 'Stock Market Indexes Guide',
				href: '/resources/stock-indexes-list',
				description: 'Learn cash-settled vs. physically settled options mechanics.'
			},
			{
				label: 'Free Trading Resources Hub',
				href: '/resources',
				description: 'Return to all starter playbooks.'
			}
		]
	},
	{
		route: '/resources/options-basics-guide',
		slug: 'options-basics-guide',
		pageName: 'Understanding Options Basics: Calls, Puts & Greeks',
		metaTitle: 'Options Basics Guide — TODO',
		metaDescription:
			'Dedicated placeholder guide covering call and put contracts, strike selection, expiration cycles, intrinsic vs. extrinsic value, and the four Greeks.',
		categoryBadge: 'BEGINNER GUIDE · TODO',
		summary:
			'Comprehensive Options 101 primer covering call and put mechanics, intrinsic vs. time value, Delta/Gamma/Theta/Vega, and why retail traders lose money buying cheap out-of-the-money contracts.',
		connectedFrom: 'Resources Hub Beginner Guides ("Understanding Options Basics").',
		todoChecklist: [
			'Explain contract multipliers (100x), strike moneyness (ITM/ATM/OTM), and bid-ask slippage.',
			'Break down Delta, Gamma, Theta, and Vega with concrete dollar P&L tables.',
			'Compare single-leg calls/puts against defined-risk vertical debit and credit spreads.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Options Basics (TODO)' }
		],
		relatedLinks: [
			{
				label: '0DTE Risk Management Playbook',
				href: '/resources/finra-intraday-margin-rule-2026',
				description: 'Read our live deep-dive on options Gamma and position sizing.'
			},
			{
				label: 'Options Calculator (TODO)',
				href: '/resources/options-calculator',
				description: 'View the planned interactive Options Greeks calculator.'
			},
			{
				label: 'Free Trading Resources Hub',
				href: '/resources',
				description: 'Return to all public guides.'
			}
		]
	},
	{
		route: '/resources/risk-management-for-new-traders',
		slug: 'risk-management-for-new-traders',
		pageName: 'Risk Management Rules for New & Developing Traders',
		metaTitle: 'Risk Rules Guide — TODO',
		metaDescription:
			'Dedicated placeholder guide detailing per-trade risk caps, hard structural invalidation stops, daily circuit breakers, and drawdown recovery mathematics.',
		categoryBadge: 'BEGINNER GUIDE · TODO',
		summary:
			'Non-negotiable capital-preservation playbook covering 1%–2% per-trade risk budgets, structural stop placement, daily loss circuit breakers, and the mathematical asymmetry of drawdowns.',
		connectedFrom: 'Resources Hub Beginner Guides ("Risk Management for New Traders").',
		todoChecklist: [
			'Publish the drawdown recovery table (-10% needs +11.1%, -50% needs +100%, -80% needs +400%).',
			'Define mechanical pre-trade invalidation rules before any order is routed.',
			'Establish 2-loss / 3R daily circuit-breaker rules to eliminate revenge trading.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Risk Management Guide (TODO)' }
		],
		relatedLinks: [
			{
				label: '0DTE Risk Management Playbook',
				href: '/resources/finra-intraday-margin-rule-2026',
				description: 'Read our published risk-architecture article.'
			},
			{
				label: 'Our Anti-Guru Mission',
				href: '/our-mission',
				description: 'Read why risk transparency comes before upside claims.'
			},
			{
				label: 'Free Trading Resources Hub',
				href: '/resources',
				description: 'Return to all resources.'
			}
		]
	},
	{
		route: '/resources/platform-setup-walkthrough',
		slug: 'platform-setup-walkthrough',
		pageName: 'ThinkorSwim & TradingView Platform Setup Walkthrough',
		metaTitle: 'Platform Setup Video — TODO',
		metaDescription:
			'Dedicated placeholder for the step-by-step video walkthrough configuring ThinkorSwim and TradingView chart grids, options chains, and order brackets.',
		categoryBadge: 'VIDEO TUTORIAL · TODO',
		summary:
			'Step-by-step workspace configuration walkthrough showing how to set up clean multi-timeframe charts, Active Trader / OCO bracket templates, and liquid options chain columns in ThinkorSwim and TradingView.',
		connectedFrom: 'Resources Hub Video Tutorials ("Platform Setup Walkthrough").',
		todoChecklist: [
			'Record HD workspace setup walkthrough for ThinkorSwim Desktop and TradingView.',
			'Provide downloadable chart-grid layout and options-chain column presets (Delta, IV%, Open Interest, Volume).',
			'Demonstrate pre-configured OCO stop-loss and profit-target bracket orders.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Platform Setup Walkthrough (TODO)' }
		],
		relatedLinks: [
			{
				label: 'Free Trading Resources Hub',
				href: '/resources',
				description: 'Return to all video tutorials and public tools.'
			},
			{
				label: 'Live Trading Rooms Hub',
				href: '/live-trading-rooms',
				description: 'See how multi-timeframe workspaces are used live each session.'
			}
		]
	},
	{
		route: '/resources/reading-charts-for-beginners',
		slug: 'reading-charts-for-beginners',
		pageName: 'Reading Price Structure & Institutional Charts for Beginners',
		metaTitle: 'Reading Charts Video — TODO',
		metaDescription:
			'Dedicated placeholder for the beginner video tutorial on multi-timeframe price structure, key liquidity levels, volume absorption, and volatility compression.',
		categoryBadge: 'VIDEO TUTORIAL · TODO',
		summary:
			'Visual price-action tutorial teaching how to mark higher-timeframe supply/demand shelves, pre-market highs/lows, volume absorption, and multi-timeframe volatility squeezes without indicator clutter.',
		connectedFrom: 'Resources Hub Video Tutorials ("Reading Charts for Beginners").',
		todoChecklist: [
			'Record annotated chart breakdown across Daily, 1-Hour, 15-Minute, and 5-Minute timeframes.',
			'Contrast lagging retail trendlines against institutional liquidity pools and sweep wicks.',
			'Include downloadable pre-market level-mapping checklist.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Reading Charts Tutorial (TODO)' }
		],
		relatedLinks: [
			{
				label: 'Institutional Order Flow & Gamma Flip Playbook',
				href: '/methodology',
				description: 'Read our published market-structure guide.'
			},
			{
				label: 'Free Trading Resources Hub',
				href: '/resources',
				description: 'Return to all video tutorials.'
			}
		]
	},
	{
		route: '/resources/your-first-option-trade',
		slug: 'your-first-option-trade',
		pageName: 'Your First Defined-Risk Option Trade Walkthrough',
		metaTitle: 'First Option Trade — TODO',
		metaDescription:
			'Dedicated placeholder for the end-to-end walkthrough of planning, sizing, routing, and managing a defined-risk option trade with limit and stop orders.',
		categoryBadge: 'VIDEO TUTORIAL · TODO',
		summary:
			'End-to-end execution tutorial walking through selecting a liquid underlying, choosing expiration and Delta, sizing contracts to a 1R risk cap, placing a limit entry, and setting mechanical invalidation.',
		connectedFrom: 'Resources Hub Video Tutorials ("Your First Option Trade").',
		todoChecklist: [
			'Walk through contract selection, mid-price limit entry, and bid-ask spread hygiene on a paper simulator.',
			'Show exact stop-loss invalidation and tiered profit-taking execution.',
			'Highlight the 5 most common beginner order-entry errors and how to prevent them.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'First Option Trade (TODO)' }
		],
		relatedLinks: [
			{
				label: 'Small Accounts Room ($500+)',
				href: '/live-trading-rooms/small-accounts-room',
				description: 'Explore live guided education for newer options traders.'
			},
			{
				label: 'Free Trading Resources Hub',
				href: '/resources',
				description: 'Return to all video tutorials.'
			}
		]
	},
	{
		route: '/resources/live-trade-walkthrough',
		slug: 'live-trade-walkthrough',
		pageName: 'Live Institutional Trade Execution Walkthrough',
		metaTitle: 'Live Trade Replay — TODO',
		metaDescription:
			'Dedicated placeholder for annotated tape replays deconstructing pre-trade thesis, trigger confirmation, risk invalidation, and scale-out management.',
		categoryBadge: 'VIDEO TUTORIAL · TODO',
		summary:
			'Annotated bar-by-bar execution replay breaking down pre-market thesis, liquidity sweep confirmation, exact invalidation stop placement, and disciplined tiered exits.',
		connectedFrom: 'Resources Hub Video Tutorials ("Live Trade Walkthrough").',
		todoChecklist: [
			'Publish full bar-by-bar video autopsy with both winning and stopped-out trade examples.',
			'Display pre-trade plan timestamps alongside actual chart execution.',
			'Include CFTC Rule 4.41 and historical replay risk disclosures.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Live Trade Walkthrough (TODO)' }
		],
		relatedLinks: [
			{
				label: 'Day Trading Room',
				href: '/live-trading-rooms/day-trading-room',
				description: 'Explore the live opening-bell execution workflow.'
			},
			{
				label: 'Track Record & Case Studies (TODO)',
				href: '/track-record',
				description: 'View the planned verified trade case-study archive.'
			}
		]
	},
	{
		route: '/resources/weekly-market-recap',
		slug: 'weekly-market-recap',
		pageName: 'Weekly Institutional Market Recap & Tape Review',
		metaTitle: 'Weekly Market Recap — TODO',
		metaDescription: `Dedicated placeholder archive for weekly S&P 500, Nasdaq 100, volatility regime, and sector breadth recaps from the ${BRAND.name} desk.`,
		categoryBadge: 'MARKET ANALYSIS · TODO',
		summary:
			'Dedicated weekly recap hub reviewing S&P 500 (SPX) and Nasdaq 100 (NDX) weekly structure, VIX term structure, breadth shifts, and key levels heading into the upcoming week.',
		connectedFrom: 'Resources Hub Market Analysis ("Weekly Market Recap").',
		todoChecklist: [
			'Build chronological archive of weekly index, volatility, and sector recaps.',
			'Integrate weekly macro catalyst calendar and dealer gamma regime notes.',
			'Cross-link published deep-dive research from /blog.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Weekly Market Recap (TODO)' }
		],
		relatedLinks: [
			{
				label: 'Institutional Blog & Research',
				href: '/blog',
				description: 'Read our live market-structure articles.'
			},
			{
				label: 'Sunday Alpha Protocol',
				href: '/alert-services/sunday-alpha-protocol',
				description: 'Explore our Sunday 5:00 PM ET weekly swing preparation service.'
			}
		]
	},
	{
		route: '/resources/economic-calendar-explained',
		slug: 'economic-calendar-explained',
		pageName: 'Macro Economic Calendar Explained (FOMC, CPI, NFP & PCE)',
		metaTitle: 'Economic Calendar — TODO',
		metaDescription:
			'Dedicated placeholder guide explaining how FOMC rate decisions, CPI/PCE inflation prints, NFP jobs data, and Treasury auctions impact options volatility.',
		categoryBadge: 'MARKET ANALYSIS · TODO',
		summary:
			'Reference guide to tier-1 US macro catalysts — FOMC decisions, CPI, PCE, Non-Farm Payrolls, ISM, and Treasury auctions — and how implied volatility (Vega) prices binary event risk.',
		connectedFrom: 'Resources Hub Market Analysis ("Economic Calendar Explained").',
		todoChecklist: [
			'Document release times (8:30 AM ET, 10:00 AM ET, 2:00 PM ET) and liquidity withdrawal behavior.',
			'Explain pre-event IV expansion vs. post-release volatility crush on options premiums.',
			'Define desk rules for flat/reduced exposure ahead of binary macro prints.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Economic Calendar Explained (TODO)' }
		],
		relatedLinks: [
			{
				label: 'Stock Market Indexes Guide',
				href: '/resources/stock-indexes-list',
				description: 'Review SPX, NDX, RUT, and VIX index specifications.'
			},
			{
				label: 'Free Trading Resources Hub',
				href: '/resources',
				description: 'Return to all market-analysis resources.'
			}
		]
	},
	{
		route: '/resources/key-levels-to-watch',
		slug: 'key-levels-to-watch',
		pageName: 'Key Institutional Levels & SPX Dealer Gamma Walls',
		metaTitle: 'Key Levels Guide — TODO',
		metaDescription:
			'Dedicated placeholder methodology guide on mapping SPX call walls, put walls, gamma flip pivots, overnight highs/lows, and institutional supply/demand zones.',
		categoryBadge: 'MARKET ANALYSIS · TODO',
		summary:
			'Educational framework explaining how institutional desks map SPX/SPY call walls, put walls, positive vs. negative dealer gamma regimes, and multi-day structural pivots before the bell.',
		connectedFrom: 'Resources Hub Market Analysis ("Key Levels to Watch").',
		todoChecklist: [
			'Document step-by-step pre-market level hierarchy (Macro Weekly/Daily -> Overnight High/Low -> Gamma Walls).',
			'Explain pinning behavior in positive gamma vs. directional acceleration below the gamma flip.',
			'Provide annotated SPX and QQQ reference charts.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Key Levels to Watch (TODO)' }
		],
		relatedLinks: [
			{
				label: 'Institutional Order Flow & Gamma Flip Playbook',
				href: '/methodology',
				description: 'Read our published dealer-gamma playbook on the blog.'
			},
			{
				label: 'SPX Profit Pulse',
				href: '/alert-services/spx-profit-pulse',
				description: 'Explore our dedicated SPX index options alert service.'
			}
		]
	},
	{
		route: '/resources/sector-rotation-analysis',
		slug: 'sector-rotation-analysis',
		pageName: 'S&P 500 GICS Sector Rotation & Relative Strength Analysis',
		metaTitle: 'Sector Rotation Guide — TODO',
		metaDescription:
			'Dedicated placeholder guide on tracking institutional capital rotation across all 11 S&P 500 GICS sectors, market breadth, and relative volume leadership.',
		categoryBadge: 'MARKET ANALYSIS · TODO',
		summary:
			'Top-down institutional framework for tracking capital rotation across offensive (XLK, XLY, XLC, XLF) and defensive/cyclical (XLV, XLP, XLU, XLE, XLI, XLB, XLRE) S&P 500 sectors.',
		connectedFrom: 'Resources Hub Market Analysis ("Sector Rotation Analysis").',
		todoChecklist: [
			'Explain relative-strength vs. SPY ranking across all 11 GICS sector ETFs.',
			'Show how sector divergence warns of index exhaustion before headline averages roll over.',
			'Pair sector leadership with high-liquidity component equity selection.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Sector Rotation Analysis (TODO)' }
		],
		relatedLinks: [
			{
				label: 'ETF Stocks & Sector Directory',
				href: '/resources/etf-stocks-list',
				description: 'Explore all 11 S&P 500 GICS sector ETFs (Live Page).'
			},
			{
				label: 'Swing Trading Room',
				href: '/live-trading-rooms/swing-trading-room',
				description: 'See how sector rotation drives multi-day swing selection.'
			}
		]
	},
	{
		route: '/resources/managing-trading-emotions',
		slug: 'managing-trading-emotions',
		pageName: 'Managing Trading Emotions: Eradicating FOMO & Tilt',
		metaTitle: 'Trading Emotions Guide — TODO',
		metaDescription:
			'Dedicated placeholder guide on eliminating FOMO, revenge trading, stop-widening, and emotional sizing spikes through mechanical pre-trade rules.',
		categoryBadge: 'TRADING PSYCHOLOGY · TODO',
		summary:
			'Practical behavioral protocol addressing the four primary retail execution failures: chasing extended candles (FOMO), moving invalidation stops, cutting winners at +0.5R, and revenge sizing after a loss.',
		connectedFrom: 'Resources Hub Trading Psychology ("Managing Trading Emotions").',
		todoChecklist: [
			'Map physiological & behavioral tilt triggers to hard mechanical desk circuit breakers.',
			'Show why sizing down to sleep-well risk eliminates 80% of emotional execution errors.',
			'Provide printable pre-session mental and risk readiness card.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Managing Trading Emotions (TODO)' }
		],
		relatedLinks: [
			{
				label: 'Our Anti-Guru Mission',
				href: '/our-mission',
				description: 'Read how our rooms replace hype triggers with structured rules.'
			},
			{
				label: 'Free Trading Resources Hub',
				href: '/resources',
				description: 'Return to all Trading Psychology guides.'
			}
		]
	},
	{
		route: '/resources/developing-trading-discipline',
		slug: 'developing-trading-discipline',
		pageName: 'Developing Mechanical Pre-Trade Execution Discipline',
		metaTitle: 'Trading Discipline — TODO',
		metaDescription:
			'Dedicated placeholder guide on building repeatable pre-market routines, binary entry criteria, and post-session rule-compliance scoring.',
		categoryBadge: 'TRADING PSYCHOLOGY · TODO',
		summary:
			'Systems-based guide to grading every session on rule execution rather than single-trade P&L noise — using written if/then scenarios, conditional alerts, and hard session cutoffs.',
		connectedFrom: 'Resources Hub Trading Psychology ("Developing Discipline").',
		todoChecklist: [
			'Publish the 6-point pre-trade gate (Structure, Liquidity, Catalyst Check, Invalidation, Size, R-Multiple).',
			'Separate outcome variance from process-execution scoring in weekly reviews.',
			'Define time-of-day trading windows to prevent midday overtrading.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Developing Discipline (TODO)' }
		],
		relatedLinks: [
			{
				label: 'Live Trading Rooms Hub',
				href: '/live-trading-rooms',
				description: 'Compare structured daily execution cadences across our rooms.'
			},
			{
				label: 'Free Trading Resources Hub',
				href: '/resources',
				description: 'Return to all public guides.'
			}
		]
	},
	{
		route: '/resources/dealing-with-losing-streaks',
		slug: 'dealing-with-losing-streaks',
		pageName: 'Dealing with Losing Streaks & Drawdown Circuit Breakers',
		metaTitle: 'Drawdown Recovery — TODO',
		metaDescription:
			'Dedicated placeholder guide on navigating statistical losing streaks, progressive size step-downs, and diagnostic ledger audits without blowing up capital.',
		categoryBadge: 'TRADING PSYCHOLOGY · TODO',
		summary:
			'Institutional drawdown-containment protocol explaining normal losing-streak probability math, tiered risk step-downs (50% size reduction rules), and how to diagnose market-regime mismatch vs. execution error.',
		connectedFrom: 'Resources Hub Trading Psychology ("Dealing with Losing Streaks").',
		todoChecklist: [
			'Publish statistical streak-probability tables across 45%, 55%, and 60% win-rate systems.',
			'Define progressive risk step-down thresholds at -4R, -6R, and -8R drawdowns.',
			'Provide a 10-trade diagnostic audit to separate bad variance from broken rules.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Dealing with Losing Streaks (TODO)' }
		],
		relatedLinks: [
			{
				label: '0DTE Risk Management Playbook',
				href: '/resources/finra-intraday-margin-rule-2026',
				description: 'Read our published drawdown and position-sizing rules.'
			},
			{
				label: '1-on-1 Private Mentorship',
				href: '/mentorship',
				description: 'Explore individualized execution diagnostics.'
			}
		]
	},
	{
		route: '/resources/building-trading-confidence',
		slug: 'building-trading-confidence',
		pageName: 'Building Conviction Through Verified Expectancy',
		metaTitle: 'Trading Confidence — TODO',
		metaDescription:
			'Dedicated placeholder guide on replacing hope and guru dependency with data-backed setup expectancy, sample-size tracking, and independent chart conviction.',
		categoryBadge: 'TRADING PSYCHOLOGY · TODO',
		summary:
			'Guide to building earned, evidence-backed conviction — moving from hesitant copy-trading to independent execution grounded in 30-trade setup samples and bounded 1R risk.',
		connectedFrom: 'Resources Hub Trading Psychology ("Building Confidence").',
		todoChecklist: [
			'Outline the 3-stage progression: Sim/Micro-Size Proof -> Fixed-R Execution -> Earned Scaling.',
			'Show how bounded downside eliminates hesitation at valid structural triggers.',
			'Connect trade-journal sample tracking to objective confidence metrics.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Building Confidence (TODO)' }
		],
		relatedLinks: [
			{
				label: 'About Billy Ribeiro',
				href: '/about',
				description: 'Read the founder background and educational philosophy.'
			},
			{
				label: 'Free Trading Resources Hub',
				href: '/resources',
				description: 'Return to all public guides.'
			}
		]
	},
	{
		route: '/resources/frequently-asked-questions',
		slug: 'frequently-asked-questions',
		pageName: 'Master Frequently Asked Questions (Rooms, Alerts & Rules)',
		metaTitle: 'Master FAQ — TODO',
		metaDescription:
			'Dedicated placeholder for the unified Frequently Asked Questions directory covering trading rooms, alert services, account minimums, platforms, and billing.',
		categoryBadge: 'FAQ & SUPPORT · TODO',
		summary:
			'Centralized FAQ hub aggregating common questions across Live Trading Rooms, Video Watchlist Alerts, T+1 cash & FINRA Rule 4210 margin accounts, supported charting platforms, and membership policies.',
		connectedFrom: 'Resources Hub FAQ & Support ("Frequently Asked Questions").',
		todoChecklist: [
			'Organize searchable native <details> FAQ sections by Account Size, Rooms, Alerts, Tools, and Policies.',
			'Ensure every answer reflects current FINRA Rule 4210 (June 2026) and T+1 settlement standards.',
			'Link directly to primary policy pages (/refund-policy, /risk-disclosure, /terms-of-service).'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Frequently Asked Questions (TODO)' }
		],
		relatedLinks: [
			{
				label: 'Live Trading Rooms Hub',
				href: '/live-trading-rooms',
				description: 'Read room-specific FAQs and compare all three rooms.'
			},
			{
				label: 'Contact Support',
				href: '/contact',
				description: `Send a direct question to the ${BRAND.name} desk.`
			}
		]
	},
	{
		route: '/resources/trading-glossary',
		slug: 'trading-glossary',
		pageName: 'Glossary of Institutional Options & Order-Flow Terms',
		metaTitle: 'Trading Glossary — TODO',
		metaDescription:
			'Dedicated placeholder A-to-Z glossary defining institutional order flow, dealer gamma (GEX), liquidity sweeps, options Greeks, Section 1256, and T+1 terms.',
		categoryBadge: 'FAQ & SUPPORT · TODO',
		summary:
			'A-to-Z reference dictionary defining institutional tape terminology: Absorption, Abandoned Bar, Call/Put Wall, Delta, Gamma Flip, GEX, IV Percentile, Liquidity Sweep, OCO Bracket, R-Multiple, Section 1256, Theta, T+1 Settlement, and Vega.',
		connectedFrom: 'Resources Hub FAQ & Support ("Glossary of Trading Terms").',
		todoChecklist: [
			'Publish A-to-Z searchable definitions with concrete chart and options-chain examples.',
			'Cross-link glossary entries to deep-dive blog playbooks and calculators.',
			'Keep definitions concise, mechanical, and free of retail jargon.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Trading Glossary (TODO)' }
		],
		relatedLinks: [
			{
				label: 'Stock Market Indexes Guide',
				href: '/resources/stock-indexes-list',
				description: 'Review cash-settlement and Section 1256 index definitions.'
			},
			{
				label: 'ETF Stocks & Sector Directory',
				href: '/resources/etf-stocks-list',
				description: 'Review core index and GICS sector ETFs.'
			}
		]
	},
	{
		route: '/resources/community-guidelines',
		slug: 'community-guidelines',
		pageName: 'Trading Floor Community Guidelines & Code of Conduct',
		metaTitle: 'Community Guidelines — TODO',
		metaDescription: `Dedicated placeholder for the ${BRAND.name} live room etiquette, anti-hype conduct rules, zero-pump policy, and member safety standards.`,
		categoryBadge: 'FAQ & SUPPORT · TODO',
		summary: `Code of conduct governing all ${BRAND.name} live rooms and member channels: zero penny-stock pumping, zero unverified P&L bragging, mandatory stop-loss context on shared ideas, and strict anti-impersonation security.`,
		connectedFrom: 'Resources Hub FAQ & Support ("Community Guidelines").',
		todoChecklist: [
			'Document live microphone/chat etiquette during the 9:30 AM–11:30 AM ET execution window.',
			'Detail zero-tolerance rules against solicitation, DM impersonators, and penny-stock promotions.',
			'Explain moderation escalation and member safety reporting.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Resources', href: '/resources' },
			{ label: 'Community Guidelines (TODO)' }
		],
		relatedLinks: [
			{
				label: 'Our Anti-Guru Mission',
				href: '/our-mission',
				description: 'Read our core institutional ethics and anti-hype charter.'
			},
			{
				label: 'Editorial Policy',
				href: '/editorial-policy',
				description: 'Review our standards for claims, evidence, and corrections.'
			}
		]
	}
] as const;

export const ENROLL_TODO_PAGES: readonly TodoPageSpec[] = [
	{
		route: '/enroll/day-trading-room',
		slug: 'day-trading-room',
		pageName: 'Day Trading Room Enrollment',
		metaTitle: 'Enroll: Day Trading — TODO',
		metaDescription:
			'Dedicated enrollment placeholder for the Live Day Trading Room. Replaces temporary /contact routing on Day Trading Room join buttons.',
		categoryBadge: 'ENROLLMENT FLOW · TODO',
		summary:
			'Dedicated membership enrollment and onboarding page for the Live Day Trading Room (Pre-Market Prep + 9:30 AM ET Opening Bell voice & screen-share floor).',
		connectedFrom: 'Day Trading Room page ("Join the Live Day Trading Room" CTAs).',
		todoChecklist: [
			'Connect membership cadence selection, risk-disclosure sign-off, and billing once commerce is enabled.',
			'Provision instant trading-floor voice/screen-share access and pre-market schedule onboarding.',
			'Keep direct commerce blocked via commerce-guard until owner enables live billing.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Live Trading Rooms', href: '/live-trading-rooms' },
			{ label: 'Day Trading Room', href: '/live-trading-rooms/day-trading-room' },
			{ label: 'Enrollment (TODO)' }
		],
		relatedLinks: [
			{
				label: 'Day Trading Room Overview',
				href: '/live-trading-rooms/day-trading-room',
				description: 'Return to the full Day Trading Room schedule, methodology, and FAQs.'
			},
			{
				label: 'Compare All 3 Live Rooms',
				href: '/live-trading-rooms',
				description: 'Compare Day Trading, Swing Trading, and Small Accounts rooms.'
			},
			{
				label: 'Questions Before Enrolling?',
				href: '/contact',
				description: 'Contact the desk with pre-enrollment questions.'
			}
		]
	},
	{
		route: '/enroll/swing-trading-room',
		slug: 'swing-trading-room',
		pageName: 'Swing Trading Room Enrollment',
		metaTitle: 'Enroll: Swing Room — TODO',
		metaDescription:
			'Dedicated enrollment placeholder for the Live Swing Trading Room for 9-to-5 professionals. Replaces temporary /contact routing on join buttons.',
		categoryBadge: 'ENROLLMENT FLOW · TODO',
		summary:
			'Dedicated membership enrollment and onboarding page for the Multi-Day Stock, ETF & Options Swing Trading Room designed for 9-to-5 working schedules.',
		connectedFrom: 'Swing Trading Room page ("Join the Swing Trading Room" CTAs).',
		todoChecklist: [
			'Connect membership cadence selection, risk-disclosure sign-off, and billing once commerce is enabled.',
			'Provision evening review archive, Sunday macro briefing access, and conditional-order templates.',
			'Keep direct commerce blocked via commerce-guard until owner enables live billing.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Live Trading Rooms', href: '/live-trading-rooms' },
			{ label: 'Swing Trading Room', href: '/live-trading-rooms/swing-trading-room' },
			{ label: 'Enrollment (TODO)' }
		],
		relatedLinks: [
			{
				label: 'Swing Trading Room Overview',
				href: '/live-trading-rooms/swing-trading-room',
				description: 'Return to the full Swing Trading Room workflow and FAQs.'
			},
			{
				label: 'Compare All 3 Live Rooms',
				href: '/live-trading-rooms',
				description: 'Compare Day Trading, Swing Trading, and Small Accounts rooms.'
			},
			{
				label: 'Questions Before Enrolling?',
				href: '/contact',
				description: 'Contact the desk with pre-enrollment questions.'
			}
		]
	},
	{
		route: '/enroll/small-accounts-room',
		slug: 'small-accounts-room',
		pageName: 'Small Accounts Room ($500+) Enrollment',
		metaTitle: 'Enroll: Small Accounts — TODO',
		metaDescription:
			'Dedicated enrollment placeholder for the Small Accounts Trading Room ($500+). Replaces temporary /contact routing on Small Accounts join buttons.',
		categoryBadge: 'ENROLLMENT FLOW · TODO',
		summary:
			'Dedicated membership enrollment and onboarding page for the Small Accounts Room ($500+ starting capital), focused on T+1 settled-cash rotation, FINRA Rule 4210 margin discipline, and contract cost ceilings.',
		connectedFrom: 'Small Accounts Room page ("Join the Small Accounts Room" CTAs).',
		todoChecklist: [
			'Connect membership cadence selection, small-account risk acknowledgment, and billing once commerce is enabled.',
			'Deliver T+1 cash-partitioning worksheet and small-account position-sizing onboarding.',
			'Keep direct commerce blocked via commerce-guard until owner enables live billing.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Live Trading Rooms', href: '/live-trading-rooms' },
			{ label: 'Small Accounts Room', href: '/live-trading-rooms/small-accounts-room' },
			{ label: 'Enrollment (TODO)' }
		],
		relatedLinks: [
			{
				label: 'Small Accounts Room Overview',
				href: '/live-trading-rooms/small-accounts-room',
				description: 'Return to the full Small Accounts Room methodology and FAQs.'
			},
			{
				label: 'Compare All 3 Live Rooms',
				href: '/live-trading-rooms',
				description: 'Compare Day Trading, Swing Trading, and Small Accounts rooms.'
			},
			{
				label: 'Questions Before Enrolling?',
				href: '/contact',
				description: 'Contact the desk with pre-enrollment questions.'
			}
		]
	},
	{
		route: '/enroll/spx-profit-pulse',
		slug: 'spx-profit-pulse',
		pageName: 'SPX Profit Pulse Alert Service Enrollment',
		metaTitle: 'Enroll: SPX Pulse — TODO',
		metaDescription:
			'Dedicated enrollment placeholder for SPX Profit Pulse S&P 500 & 0DTE index options alerts and pre-market video watchlists.',
		categoryBadge: 'ENROLLMENT FLOW · TODO',
		summary:
			'Dedicated enrollment and alert-delivery setup page for SPX Profit Pulse (S&P 500 & 0DTE index options pre-market video watchlists, dealer gamma walls, and real-time trade dispatches).',
		connectedFrom: 'SPX Profit Pulse page enrollment CTAs.',
		todoChecklist: [
			'Connect alert tier selection, 0DTE/options risk-disclosure acknowledgment, and billing once commerce is enabled.',
			'Configure instant SMS, push, and member-portal video watchlist dispatch channels.',
			'Keep direct commerce blocked via commerce-guard until owner enables live billing.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Alert Services', href: '/alert-services' },
			{ label: 'SPX Profit Pulse', href: '/alert-services/spx-profit-pulse' },
			{ label: 'Enrollment (TODO)' }
		],
		relatedLinks: [
			{
				label: 'SPX Profit Pulse Overview',
				href: '/alert-services/spx-profit-pulse',
				description: 'Return to SPX Profit Pulse alert samples, methodology, and FAQs.'
			},
			{
				label: 'Alert Services Hub (TODO)',
				href: '/alert-services',
				description: 'Compare SPX Profit Pulse with Sunday Alpha Protocol.'
			}
		]
	},
	{
		route: '/enroll/sunday-alpha-protocol',
		slug: 'sunday-alpha-protocol',
		pageName: 'Sunday Alpha Protocol Enrollment',
		metaTitle: 'Enroll: Sunday Alpha — TODO',
		metaDescription:
			'Dedicated enrollment placeholder for Sunday Alpha Protocol weekly multi-day stock and options swing video watchlists and blueprints.',
		categoryBadge: 'ENROLLMENT FLOW · TODO',
		summary:
			'Dedicated enrollment and dispatch onboarding page for Sunday Alpha Protocol (Sunday 5:00 PM ET video briefing with 5–7 structured multi-day stock & options swing blueprints).',
		connectedFrom: 'Sunday Alpha Protocol page primary enrollment CTAs.',
		todoChecklist: [
			'Connect subscription cadence selection, swing-options risk acknowledgment, and billing once commerce is enabled.',
			'Provision Sunday 5:00 PM ET briefing access and conditional-order alert notifications.',
			'Keep direct commerce blocked via commerce-guard until owner enables live billing.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Alert Services', href: '/alert-services' },
			{ label: 'Sunday Alpha Protocol', href: '/alert-services/sunday-alpha-protocol' },
			{ label: 'Enrollment (TODO)' }
		],
		relatedLinks: [
			{
				label: 'Sunday Alpha Protocol Overview',
				href: '/alert-services/sunday-alpha-protocol',
				description: 'Return to the Sunday Alpha Protocol interactive terminal and FAQs.'
			},
			{
				label: 'Alert Services Hub (TODO)',
				href: '/alert-services',
				description: 'Compare Sunday Alpha Protocol with SPX Profit Pulse.'
			}
		]
	},
	{
		route: '/enroll/move-prior-to-the-move-ultra',
		slug: 'move-prior-to-the-move-ultra',
		pageName: 'Move Prior to The Move™ Ultra Course Enrollment',
		metaTitle: 'Enroll: MPTM Course — TODO',
		metaDescription:
			'Dedicated enrollment placeholder for The Move Prior to The Move Ultra course and study-suite packages.',
		categoryBadge: 'STORE ENROLLMENT · TODO',
		summary:
			'Dedicated course package enrollment and TradingView / ThinkorSwim provisioning page for The Move Prior to The Move™ Ultra System.',
		connectedFrom: 'Flagship Course detail page (/store/courses/move-prior-to-the-move-ultra).',
		todoChecklist: [
			'Connect Standard vs. Mastery package selection and license provisioning once Store launches.',
			'Collect ThinkorSwim & TradingView usernames for automated script entitlement.',
			'Unlock on-demand HD curriculum modules inside the member portal.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Store', href: '/store' },
			{ label: 'Courses', href: '/store/courses' },
			{ label: 'Enrollment (TODO)' }
		],
		relatedLinks: [
			{
				label: 'Move Prior to The Move™ Course Page',
				href: '/store/courses/move-prior-to-the-move-ultra',
				description: 'Return to the flagship course syllabus and component breakdown.'
			},
			{
				label: 'All Trading Courses',
				href: '/store/courses',
				description: 'Browse all 8 courses in the curriculum.'
			}
		]
	},
	{
		route: '/enroll/move-prior-to-the-move-system',
		slug: 'move-prior-to-the-move-system',
		pageName: 'Move Prior to The Move™ Indicator Suite Access',
		metaTitle: 'Enroll: MPTM Indicator — TODO',
		metaDescription:
			'Dedicated license provisioning placeholder for The Move Prior to The Move (MP_EarlyInNOut) chart-structure overlay suite.',
		categoryBadge: 'STORE ENROLLMENT · TODO',
		summary:
			'Dedicated indicator license provisioning and setup page for The Move Prior to The Move™ (MP_EarlyInNOut) System on ThinkorSwim and TradingView.',
		connectedFrom:
			'Flagship Indicator detail page (/store/indicators/move-prior-to-the-move-system).',
		todoChecklist: [
			'Connect indicator license entitlement and TradingView/ThinkorSwim script delivery once Store launches.',
			'Deliver workspace import links and step-by-step installation video.',
			'Keep Store gated until launch readiness sign-off.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Store', href: '/store' },
			{ label: 'Indicators', href: '/store/indicators' },
			{ label: 'License Access (TODO)' }
		],
		relatedLinks: [
			{
				label: 'MP Early In & Out Indicator Page',
				href: '/store/indicators/move-prior-to-the-move-system',
				description: 'Return to the flagship indicator preview and technical specs.'
			},
			{
				label: 'All Custom Indicators',
				href: '/store/indicators',
				description: 'Browse all 8 chart-structure overlays.'
			}
		]
	},
	{
		route: '/enroll/high-octane-scanner',
		slug: 'high-octane-scanner',
		pageName: 'High Octane Scanner™ Access Enrollment',
		metaTitle: 'Enroll: Scanner Access — TODO',
		metaDescription:
			'Dedicated scanner access placeholder for the High Octane Scanner on ThinkorSwim, TradingView, and Web Radar.',
		categoryBadge: 'STORE ENROLLMENT · TODO',
		summary:
			'Dedicated scanner license and watchlist-import onboarding page for the High Octane Scanner™.',
		connectedFrom: 'Flagship Scanner detail page (/store/scanners/high-octane-scanner).',
		todoChecklist: [
			'Connect Monthly vs. Annual scanner license provisioning once Store launches.',
			'Deliver ThinkorSwim Stock/Option Hacker import links and TradingView screener templates.',
			'Keep Store gated until launch readiness sign-off.'
		],
		breadcrumbs: [
			{ label: 'Home', href: '/' },
			{ label: 'Store', href: '/store' },
			{ label: 'Scanners', href: '/store/scanners' },
			{ label: 'Scanner Access (TODO)' }
		],
		relatedLinks: [
			{
				label: 'High Octane Scanner™ Page',
				href: '/store/scanners/high-octane-scanner',
				description: 'Return to the interactive scanner terminal and feature breakdown.'
			},
			{
				label: 'All Market Scanners',
				href: '/store/scanners',
				description: 'Browse all 8 institutional market scanners.'
			}
		]
	}
] as const;

const RESOURCE_TODO_MAP = new Map<string, TodoPageSpec>(
	RESOURCE_TODO_PAGES.map((spec) => [spec.slug!, spec])
);

const ENROLL_TODO_MAP = new Map<string, TodoPageSpec>(
	ENROLL_TODO_PAGES.map((spec) => [spec.slug!, spec])
);

export const TODO_NOINDEX_PREFIXES = [
	'/login',
	'/register',
	'/memberships',
	'/mentorship/apply',
	'/enroll'
] as const;

const EXACT_TODO_PATHS = new Set<string>([
	...Object.keys(STATIC_TODO_PAGES).filter((path) => path !== '/memberships'),
	...RESOURCE_TODO_PAGES.map((p) => p.route)
]);

/**
 * True when `pathname` is a dedicated TODO placeholder page.
 * Important: `/alert-services` is an exact match so its built child routes
 * (`/alert-services/spx-profit-pulse` and `/alert-services/sunday-alpha-protocol`) remain indexable!
 */
export function isTodoRoute(pathname: string): boolean {
	const normalized =
		pathname.length > 1 && pathname.endsWith('/') ? pathname.replace(/\/+$/, '') : pathname;
	if (EXACT_TODO_PATHS.has(normalized)) {
		return true;
	}
	if (normalized === '/enroll' || normalized.startsWith('/enroll/')) {
		return true;
	}
	return false;
}

export function getResourceTodoSpec(slug: string): TodoPageSpec | undefined {
	return RESOURCE_TODO_MAP.get(slug);
}

export function getEnrollTodoSpec(slug: string): TodoPageSpec | undefined {
	return ENROLL_TODO_MAP.get(slug);
}

/**
 * Helper to build consistent `noindex, nofollow` (`canonical: undefined`) metadata for any TODO route.
 */
export function cleanPlannedLabel(label: string): string {
	return label.replace(/\s*—\s*TODO\b|\s*\[TODO\]|\s*\(TODO\)|\bTODO\b/g, '').trim();
}

export function buildTodoPageMetaTags(
	spec: Pick<TodoPageSpec, 'route' | 'metaTitle' | 'metaDescription'>
) {
	const title = cleanPlannedLabel(spec.metaTitle);
	const description = `Explore ${title} at ${BRAND.name}. Review current availability, find published resources, or contact the desk for guidance.`;
	const ogUrl = `${SITE_ORIGIN}${spec.route}`;
	return definePageMetaTags({
		title,
		description,
		canonical: ogUrl,
		robots: 'noindex, nofollow',
		additionalRobotsProps: undefined,
		openGraph: { type: 'website', url: ogUrl, title: `${title} | ${TODO_BRAND_NAME}`, description },
		twitter: { title: `${title} | ${TODO_BRAND_NAME}`, description }
	});
}
