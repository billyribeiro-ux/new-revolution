/**
 * Static content module for `/methodology` — Cornerstone Pillar Page:
 * "Price Action Trading Without Indicators: Inside The Move Prior to The Move™".
 */

import { BRAND } from '#lib/config/brand.ts';

export type TimeframeId = 'monthly-weekly' | 'daily-4h' | 'hourly-15m' | 'five-1m';

export interface TimeframeAlignmentStep {
	id: TimeframeId;
	stepNumber: string;
	tabLabel: string;
	horizon: string;
	structuralRole: string;
	whatWeMap: readonly string[];
	binaryInvalidationRule: string;
}

export interface IndicatorComparisonRow {
	dimension: string;
	laggingRetailIndicators: string;
	movePriorToTheMove: string;
}

export interface HistoricalCaseChartImage {
	src: string;
	width: number;
	height: number;
	alt: string;
}

export interface HistoricalCaseStudy {
	id: string;
	code: string;
	periodLabel: string;
	title: string;
	marketBenchmark: string;
	structuralRead: string;
	executionAndRisk: string;
	verificationStatus: string;
	plannedAssetPath: string;
	chartImage: HistoricalCaseChartImage | null;
	nonTypicalityNote: string;
}

export const METHODOLOGY_PILLARS = [
	{
		code: 'PILLAR 01 // MACRO TO MICRO',
		title: 'Monthly-to-1-Minute Structural Alignment',
		description:
			'Major market tops, capitulation bottoms, and high-velocity intraday reversals never originate on an isolated 5-minute oscillator crossover. When monthly, weekly, and daily supply or demand converges with 1-minute structural rejection, downside risk compresses to pennies or single SPX points while upside remains asymmetric.'
	},
	{
		code: 'PILLAR 02 // ZERO CHART CLUTTER',
		title: 'Trade the Charts, Not the Noise',
		description:
			'RSI, MACD, moving averages, and paid "squeeze" add-ons are backward-looking mathematical averages of past prices — and financial headlines routinely peak right as institutional accumulation or distribution finishes. Stripping every indicator off the chart leaves one binary structural question: does the level hold, or does price print invalidation?'
	},
	{
		code: 'PILLAR 03 // SPECIAL-SITUATIONS ASYMMETRY',
		title: 'Engineered Options Structuring',
		description: `Shaped by ${BRAND.founder.name}'s personal mentorship under ${BRAND.founder.mentorshipLineage.replace('Personally mentored by ', '')} Calling an inflection zone is half the equation — pairing it with the right cash-settled SPX/XSP strike, delta, or vertical spread ensures volatility and time decay work with the structure rather than bleeding premium.`
	}
] as const;

export const TIMEFRAME_ALIGNMENT_STEPS: readonly TimeframeAlignmentStep[] = [
	{
		id: 'monthly-weekly',
		stepNumber: '01',
		tabLabel: '01 · Monthly & Weekly',
		horizon: 'Macro Cycle & Institutional Dislocation Map',
		structuralRole:
			'Identifies multi-quarter accumulation floors, euphoric distribution ceilings, and untouched institutional liquidity pools before retail narratives shift.',
		whatWeMap: [
			'Multi-year supply/demand imbalances where pension and sovereign flows are forced to rebalance.',
			'Structural exhaustion wicks and failed macro breakouts across S&P 500, Nasdaq-100, and GICS sector ETFs.',
			'Directional regime bias: whether extreme weakness favors asymmetric calls or extreme strength favors puts.'
		],
		binaryInvalidationRule:
			'A weekly close beyond the macro structural boundary invalidates the thesis immediately — zero averaging down.'
	},
	{
		id: 'daily-4h',
		stepNumber: '02',
		tabLabel: '02 · Daily & 4-Hour',
		horizon: 'Swing Inflection & Pre-Market Battleground',
		structuralRole:
			'Translates macro bias into concrete Sunday Alpha Protocol and pre-market inflection zones for the upcoming week and trading session.',
		whatWeMap: [
			'Prior-day highs/lows, unfilled structural air pockets, and multi-day consolidation boundaries.',
			'Relative strength and weakness rotation across SPY, QQQ, IWM, and the 11 S&P 500 GICS sectors.',
			'Conditional bull/bear trigger zones and tiered scaling targets mapped before 9:30 AM ET.'
		],
		binaryInvalidationRule:
			'If price slices through a daily/4H zone without structural absorption, no entry triggers — standing aside preserves 100% of capital.'
	},
	{
		id: 'hourly-15m',
		stepNumber: '03',
		tabLabel: '03 · 1-Hour & 15-Minute',
		horizon: 'Intraday Session Structure & Trap Detection',
		structuralRole:
			'Filters opening-drive head-fakes from genuine institutional sponsorship during the 9:30–11:30 AM and afternoon windows.',
		whatWeMap: [
			'Failed opening-range breakouts and liquidity sweeps that trap late momentum chasers.',
			'Higher-low accumulation or lower-high distribution forming directly inside a higher-timeframe zone.',
			'Midday chop boundaries where option buyers must sit on hands to avoid 0DTE theta decay.'
		],
		binaryInvalidationRule:
			'Mid-range chop between 1H boundaries is a mandatory no-trade zone across all rooms and alert feeds.'
	},
	{
		id: 'five-1m',
		stepNumber: '04',
		tabLabel: '04 · 5-Minute & 1-Minute',
		horizon: 'Surgical Trigger & Penny-Tight Risk Execution',
		structuralRole:
			'Executes the entry only after raw candle rejection confirms buyers or sellers defending the higher-timeframe inflection price.',
		whatWeMap: [
			'Exact 1-minute structural reclaim or rejection print inside the pre-planned daily/hourly level.',
			'Contract selection (SPX/XSP cash-settled index option or defined-risk spread) calibrated to the distance to stop.',
			'Pre-committed scaling exits (Target 1, Target 2, trailing runner with stop moved to breakeven).'
		],
		binaryInvalidationRule:
			'Hard index/underlying price stop set before order routing — if printed, the position is closed without hesitation and logged.'
	}
] as const;

export const INDICATOR_COMPARISON_ROWS: readonly IndicatorComparisonRow[] = [
	{
		dimension: 'Signal Timing',
		laggingRetailIndicators:
			'Derived from past closes (RSI, MACD, EMA crossovers) — triggers late after institutional expansion is already underway.',
		movePriorToTheMove:
			'Maps structural supply, demand, and exhaustion levels in advance — preparing execution before crowd momentum reacts.'
	},
	{
		dimension: 'Options Premium Cost',
		laggingRetailIndicators:
			'Enters on extended green/red breakout candles when implied volatility and contract premiums are inflated.',
		movePriorToTheMove:
			'Buys into structural weakness at support or sells into extreme strength at resistance when distance to invalidation is minimal.'
	},
	{
		dimension: 'Invalidation Clarity',
		laggingRetailIndicators:
			'Subjective ("RSI can stay overbought/oversold for weeks"), encouraging hope-based holding through drawdowns.',
		movePriorToTheMove:
			'Binary price invalidation: one exact underlying print proves the thesis wrong and caps loss to the pre-sized risk budget.'
	},
	{
		dimension: 'Multi-Timeframe Consistency',
		laggingRetailIndicators:
			'5-minute RSI conflicts with 1-hour MACD and daily moving averages, creating analysis paralysis.',
		movePriorToTheMove:
			'Identical structural geometry from Monthly down to 1-Minute — higher timeframes set location, 1-minute sets trigger.'
	},
	{
		dimension: 'Recurring Software Upsells',
		laggingRetailIndicators:
			'$500–$1,500+ proprietary indicator add-ons and black-box repainting arrows.',
		movePriorToTheMove:
			'100% clean, indicator-free price charts on any standard brokerage platform ($0 indicator dependency).'
	}
] as const;

export const HISTORICAL_INFLECTION_CALLS: readonly HistoricalCaseStudy[] = [
	{
		id: 'covid-2020-inflection',
		code: 'HISTORICAL CASE 01 · S&P 500 MACRO DISLOCATION',
		periodLabel: 'Feb 19 – Mar 23, 2020',
		title: '2020 COVID Crash Peak & March Capitulation Low',
		marketBenchmark:
			'S&P 500 declined approximately 33.9% across 33 calendar days while lagging daily oscillators remained pinned in "oversold" readings.',
		structuralRead:
			'Using Monthly-to-Daily structural exhaustion in February 2020 and multi-timeframe capitulation demand in late March 2020, Billy Ribeiro mapped both macro turning zones from pure price action without indicators.',
		executionAndRisk:
			'Demonstrated how top-down structural location separates forced institutional liquidation bottoms from mid-decline bear traps — always paired with a hard structural invalidation boundary.',
		verificationStatus:
			'Documented in third-party trader profile (TradingGreats); primary chart/room archive media scheduled for attachment in the /track-record verification vault.',
		plannedAssetPath: '/images/case-studies/2020-covid-crash-spx.webp',
		chartImage: null,
		nonTypicalityNote:
			'Archived historical market extreme — not typical of daily setups. Every trade carries binary invalidation stop-out risk.'
	},
	{
		id: 'bear-market-2022-cycle',
		code: 'HISTORICAL CASE 02 · S&P 500 FULL BEAR CYCLE',
		periodLabel: 'Jan 4 – Oct 13, 2022',
		title: '2022 Bear Market Distribution Peak & October Cycle Bottom',
		marketBenchmark:
			'S&P 500 fell 27.5% intraday from the January 4, 2022 high (4,818.62) to the October 13, 2022 intraday capitulation low (3,491.58) amid aggressive rate hikes.',
		structuralRead:
			'Identified macro distribution exhaustion at the January 2022 peak and major structural demand absorption during the October 2022 CPI capitulation sweep while consensus remained overwhelmingly bearish.',
		executionAndRisk:
			'Applied Goldman Sachs Special Situations asymmetry — buying into maximum panic at higher-timeframe demand rather than chasing late relief rallies.',
		verificationStatus:
			'Historical founder market call documented externally (TradingGreats); primary dated chart and timestamped room archive queued for /track-record publication.',
		plannedAssetPath: '/images/case-studies/2022-bear-market-spx.webp',
		chartImage: null,
		nonTypicalityNote:
			'Extraordinary multi-quarter cycle inflection — non-typical historical outcome; past calls do not indicate future returns.'
	},
	{
		id: 'oxy-2022-puts',
		code: 'HISTORICAL CASE 03 · SINGLE-NAME OPTIONS ASYMMETRY',
		periodLabel: '2022 · Overnight Options Structure',
		title: 'Occidental Petroleum (OXY) Structural Exhaustion Put Play (+600% Overnight)',
		marketBenchmark:
			'Executed strictly from chart rejection immediately prior to widespread Warren Buffett / Berkshire Hathaway accumulation headlines.',
		structuralRead:
			'Ignoring financial media noise completely ("trade the charts, not the noise"), micro distribution inside macro extension signaled an asymmetric downside pullback setup.',
		executionAndRisk:
			'Structured via defined-risk OXY put options where maximum possible loss was strictly capped to premium committed, capturing a +600% overnight return on the structural move.',
		verificationStatus:
			'Historical outlier case study reported by founder Billy Ribeiro (TradingGreats); non-typical result — primary trade archive queued before verified ledger badge activation.',
		plannedAssetPath: '/images/case-studies/2022-oxy-600-puts.webp',
		chartImage: null,
		nonTypicalityNote:
			'Outlier overnight options event (+600%) — strictly non-typical; options can expire 100% worthless if invalidation triggers.'
	}
] as const;
