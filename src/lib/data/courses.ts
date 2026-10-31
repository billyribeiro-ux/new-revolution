/**
 * Static course catalog for /store/courses (module scope: created once, shared by the list page, cards and JSON-LD).
 * `slug` is the detail route segment (`/store/courses/[slug]`); `id` is the stable in-page anchor.
 */

export type CourseTrack =
	'small-accounts' | 'options-greeks' | 'intraday-orderflow' | 'swing-macro';
export type CourseTrackFilter = 'all' | CourseTrack;

export interface TradingCourse {
	id: string;
	slug: string;
	code: string;
	title: string;
	track: CourseTrack;
	trackLabel: string;
	level: string;
	modules: number;
	perk: string;
	hook: string;
	coreOutcome: string;
	syllabus: readonly string[];
	room: { label: string; href: string };
	/** Rendered as the large lead card when present in the visible list. */
	featured?: boolean;
}

export const coursesCatalog: readonly TradingCourse[] = [
	{
		id: 'move-prior-to-the-move-masterclass',
		slug: 'move-prior-to-the-move-ultra',
		featured: true,
		code: 'Course 01 // Flagship Institutional System',
		title: 'The Move Prior to The Move™: Institutional Order Flow & Price Action',
		track: 'intraday-orderflow',
		trackLabel: 'Intraday Order Flow & Scalping',
		level: 'All Levels to Pro',
		modules: 12,
		perk: 'On-Demand HD',
		hook: 'Discover how Billy Ribeiro anticipates institutional accumulation and distribution before the retail breakout candle even prints.',
		coreOutcome:
			'Master the proprietary system praised by former Goldman Sachs legend Mark "Goldfinger" McGoldrick—replacing lagging retail patterns with real-time liquidity and volume structure.',
		syllabus: [
			'Module 1: Why 95% of Retail Chart Patterns Are Engineered Liquidity Traps',
			'Module 2: Reading Institutional Absorption, Abandoned Bars & Exhaustion Sweeps',
			'Module 3: Mapping Pre-Trade Entry Triggers, Tiered Profit Targets & Hard Stops',
			'Module 4: Live Tape Execution Across Liquid Stocks, ETFs & Index Options'
		],
		room: { label: 'Pairs With: Day Trading Room →', href: '/live-trading-rooms/day-trading-room' }
	},
	{
		id: 'small-account-compounding-blueprint',
		slug: 'small-account-compounding-blueprint',
		code: 'Course 02 // $500+ Capital Engineering',
		title: 'The $500+ Small Account Compounding & T+1 Cash Rotation Blueprint',
		track: 'small-accounts',
		trackLabel: '$500+ Small Accounts & Foundation',
		level: 'Beginner to Intermediate',
		modules: 8,
		perk: 'Includes Workbook',
		hook: 'Proven mathematical strategies for protecting and growing a small trading account starting as low as $500 without gambling.',
		coreOutcome:
			'Eliminate small-account blowups by mastering T+1 cash-account settlement rotation, Pattern Day Trader (PDT) bypass rules, contract price ceilings, and strict drawdown caps.',
		syllabus: [
			'Module 1: The Mathematics of $500 Account Survival & Why "All-In" Challenges Fail',
			'Module 2: T+1 Cash Account Partitioning for Daily Buying Power Without $25K Margin',
			'Module 3: Selecting Affordable, High-Liquidity Options Contracts & Tight Spreads',
			'Module 4: The 4-Stage Scaling Roadmap from $500 to $25,000+ Institutional Sizing'
		],
		room: {
			label: 'Pairs With: Small Accounts Room →',
			href: '/live-trading-rooms/small-accounts-room'
		}
	},
	{
		id: 'options-greeks-and-volatility-mastery',
		slug: 'options-greeks-and-volatility-mastery',
		code: 'Course 03 // Options Pricing & Asymmetry',
		title: 'Options Greeks Mastery: Delta, Gamma, Theta & Vega Execution',
		track: 'options-greeks',
		trackLabel: 'Options & Greeks Mastery',
		level: 'Beginner to Advanced',
		modules: 10,
		perk: 'Cheat Sheets Included',
		hook: 'Stop losing money when you are right on direction. Master the four primary Greeks to structure asymmetric options trades.',
		coreOutcome:
			'Learn how to select optimal strikes and expirations, avoid post-earnings implied volatility (Vega) crush, and harness 30–45 DTE Theta decay like an institutional desk.',
		syllabus: [
			'Module 1: Delta as Directional Speedometer, Probability Gauge & Position Sizer',
			'Module 2: Harnessing Gamma Acceleration on Long Plays & Avoiding Expiration Blowups',
			'Module 3: The Theta Time-Decay Machine: Structuring 15–20 Delta Credit Spreads',
			'Module 4: Vega & Volatility Regimes: Buying Low IV vs. Selling High IV'
		],
		room: { label: 'Try Free: Options Calculator →', href: '/resources/options-calculator' }
	},
	{
		id: 'working-pro-swing-trading-system',
		slug: 'working-pro-swing-trading-system',
		code: 'Course 04 // 9-to-5 Schedule Architecture',
		title: 'Multi-Day Swing Trading for Working Professionals (20-Minute Routine)',
		track: 'swing-macro',
		trackLabel: 'Swing Trading & Macro Cycles',
		level: 'All Levels',
		modules: 9,
		perk: 'Conditional Order Templates',
		hook: 'Learn how to capture explosive 3-to-15 day stock and options moves in 20 minutes a day without watching screens at work.',
		coreOutcome:
			'Install a repeatable evening and pre-market routine using conditional triggers, multi-day options structures that survive overnight Theta, and trailing structural stops.',
		syllabus: [
			'Module 1: Building Your Sunday & Evening 20-Minute Institutional Watchlist',
			'Module 2: Multi-Timeframe Volatility Squeeze & Sector Rotation Alignment',
			'Module 3: Structuring Multi-Day Calls, Puts, Verticals & Diagonals',
			'Module 4: Automated Order Execution (Limit, Stop-Limit & OCO Bracket Orders)'
		],
		room: {
			label: 'Pairs With: Swing Trading Room →',
			href: '/live-trading-rooms/swing-trading-room'
		}
	},
	{
		id: 'spx-0dte-and-index-gamma-execution',
		slug: 'spx-0dte-and-index-gamma-execution',
		code: 'Course 05 // High-Velocity Index Options',
		title: 'SPX & Index Options Execution: Dealer Gamma Walls & Intraday Flow',
		track: 'options-greeks',
		trackLabel: 'Options & Greeks Mastery',
		level: 'Intermediate to Pro',
		modules: 8,
		perk: 'Live Tape Replays',
		hook: 'Identify institutional dealer hedging levels, gamma magnet strikes, and A+ intraday reversals on SPX, SPY, and QQQ.',
		coreOutcome:
			'Understand how market-maker Delta and Gamma hedging drives intraday index moves—and how to structure defined-risk index options trades during key session windows.',
		syllabus: [
			'Module 1: How Dealer Gamma Exposure (GEX) Pins or Accelerates the S&P 500',
			'Module 2: Mapping Pre-Market Call Walls, Put Walls & Liquidity Sweep Zones',
			'Module 3: Single-Leg vs. Vertical Spread Structuring on SPX Index Options',
			'Module 4: Avoiding Midday Theta Chop & Executing Power-Hour Inflections'
		],
		room: { label: 'Pairs With: SPX Profit Pulse →', href: '/alert-services/spx-profit-pulse' }
	},
	{
		id: 'contrarian-distribution-and-shorting',
		slug: 'contrarian-distribution-and-shorting',
		code: 'Course 06 // The +600% OXY Put Playbook',
		title: 'Contrarian Distribution & Put Options: Fading Retail Euphoria Live',
		track: 'intraday-orderflow',
		trackLabel: 'Intraday Order Flow & Scalping',
		level: 'Intermediate to Pro',
		modules: 7,
		perk: 'Full OXY Case Autopsy',
		hook: 'Deconstruct the exact institutional distribution playbook behind our live +600% overnight OXY Put Options trade vs. Warren Buffett.',
		coreOutcome:
			'Learn how to spot when breaking news and retail buying frenzy are actually institutional exit liquidity—and how to strike with defined-risk Put Options.',
		syllabus: [
			'Module 1: Anatomy of a Liquidity Trap: Why Retail Chases Headlines at the Top',
			'Module 2: Tick-by-Tick Autopsy of Our +600% Overnight OXY Put Options Execution',
			'Module 3: Identifying climax Volume, Abandoned Tops & Failed Breakout Candles',
			'Module 4: Structuring Put Contracts & Debit Spreads for Asymmetric Downside Velocity'
		],
		room: { label: 'Pairs With: Explosive Swings →', href: '/alert-services/explosive-swings' }
	},
	{
		id: 'macro-cycle-inflection-mastery',
		slug: 'macro-cycle-inflection-mastery',
		code: 'Course 07 // 2020 & 2022 Top/Bottom Playbook',
		title: 'Macro Cycle Inflection Timing: Calling Generational Tops & Bottoms',
		track: 'swing-macro',
		trackLabel: 'Swing Trading & Macro Cycles',
		level: 'Intermediate to Institutional',
		modules: 10,
		perk: 'Macro Case Ledger',
		hook: 'Learn the exact top-down macro breadth, liquidity, and volatility framework that called the 2020 COVID and 2022 market tops and bottoms.',
		coreOutcome:
			'Protect your portfolio before major bear market liquidations and position aggressively at generational capitulation bottoms when mainstream pundits are paralyzed.',
		syllabus: [
			'Module 1: The Goldman Sachs Prop Framework for Macro Regime Detection',
			'Module 2: Case Study: How We Called the Feb 2020 Crash Top & March 2020 Bottom',
			'Module 3: Case Study: Calling the Jan 2022 Bull Top & Oct 2022 Accumulation Low',
			'Module 4: Portfolio Hedging & Sector Rotation Across Bull and Bear Regimes'
		],
		room: { label: 'Pairs With: 1-on-1 Mentorship →', href: '/mentorship' }
	},
	{
		id: 'institutional-risk-and-trader-psychology',
		slug: 'institutional-risk-and-trader-psychology',
		code: 'Course 08 // Mechanical Discipline & Mindset',
		title: 'Ironclad Risk Architecture & Eradicating Retail Self-Sabotage',
		track: 'small-accounts',
		trackLabel: '$500+ Small Accounts & Foundation',
		level: 'Mandatory for All Traders',
		modules: 6,
		perk: 'Pre-Trade Checklists',
		hook: 'Eliminate FOMO, revenge trading, hesitation, and early profit-taking by installing a mechanical pre-trade execution protocol.',
		coreOutcome:
			'Built by a founder who stood on the losing end in the past—this course replaces emotional guessing with mathematical position sizing and drawdown circuit breakers.',
		syllabus: [
			'Module 1: Why Smart People Self-Sabotage in Live Markets (And How to Stop)',
			'Module 2: The Pre-Trade Checklist: Never Entering Without Entry, Target & Stop',
			'Module 3: Daily & Weekly Drawdown Circuit Breakers to Prevent Tilt Days',
			'Module 4: Journaling & Expectancy Audits: Scaling Size Without Scaling Emotion'
		],
		room: { label: 'Read: Our Anti-Guru Mission →', href: '/our-mission' }
	}
];

export const trackFilters: readonly { id: CourseTrackFilter; label: string }[] = [
	{ id: 'all', label: `All Courses (${coursesCatalog.length})` },
	{ id: 'small-accounts', label: '$500+ Small Accounts & Foundation' },
	{ id: 'options-greeks', label: 'Options & Greeks Mastery' },
	{ id: 'intraday-orderflow', label: 'Intraday Order Flow & Scalping' },
	{ id: 'swing-macro', label: 'Swing Trading & Macro Cycles' }
];
