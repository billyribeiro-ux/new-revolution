/**
 * Static indicator catalog for /store/indicators (module scope: created once, shared by the list page,
 * the cards and the JSON-LD). `slug` is the detail route segment (`/store/indicators/[slug]`);
 * `id` is the in-page anchor and equals `slug` for every product.
 */

export type IndicatorCategory =
	'order-flow' | 'volatility-squeeze' | 'options-levels' | 'trend-momentum';
export type IndicatorCategoryFilter = 'all' | IndicatorCategory;
export type IndicatorChartPattern = 'reversal' | 'squeeze' | 'levels' | 'volume';

export interface IndicatorProduct {
	id: string;
	slug: string;
	codeName: string;
	name: string;
	category: IndicatorCategory;
	categoryLabel: string;
	platforms: string;
	timeframes: string;
	hook: string;
	whatItExposes: string;
	bestFor: string;
	chartPattern: IndicatorChartPattern;
	/** Rendered as the large lead card when present in the visible list. */
	featured?: boolean;
}

export const indicatorsCatalog: readonly IndicatorProduct[] = [
	{
		id: 'mp-early-in-n-out',
		slug: 'mp-early-in-n-out',
		featured: true,
		codeName: 'Flagship System // MP_EarlyInNOut',
		name: 'The Move Prior to The Move™ (Early In & Out)',
		category: 'order-flow',
		categoryLabel: 'Order Flow & Reversals',
		platforms: 'ThinkorSwim • TradingView',
		timeframes: 'Intraday, Swing & Macro',
		hook: 'Anticipate institutional accumulation and distribution before the retail breakout candle even prints.',
		whatItExposes:
			'Detects pre-breakout institutional absorption and buyer/seller exhaustion—the core system behind our 2020 and 2022 market top and bottom calls.',
		bestFor: 'Day Traders, Swing Traders & Portfolio Managers',
		chartPattern: 'reversal'
	},
	{
		id: 'liquidity-sweep-radar',
		slug: 'liquidity-sweep-radar',
		codeName: 'Telemetry 02 // Stop-Hunt Detection',
		name: 'Institutional Liquidity Sweep & Trap Detector',
		category: 'order-flow',
		categoryLabel: 'Order Flow & Reversals',
		platforms: 'ThinkorSwim • TradingView',
		timeframes: '1-Min to Daily Charts',
		hook: 'Spot exact price zones where Wall Street algorithms sweep retail stops and reverse the tape.',
		whatItExposes:
			'Highlights failed retail breakouts, institutional liquidity pools, and high-asymmetry reversal triggers with tight stop-loss invalidation.',
		bestFor: 'Opening Bell Scalpers & Contrarian Options Traders',
		chartPattern: 'reversal'
	},
	{
		id: 'compression-squeeze-matrix',
		slug: 'compression-squeeze-matrix',
		codeName: 'Telemetry 03 // Multi-Timeframe Energy',
		name: 'Multi-Timeframe Volatility Squeeze Matrix',
		category: 'volatility-squeeze',
		categoryLabel: 'Volatility & Squeeze',
		platforms: 'ThinkorSwim • TradingView',
		timeframes: 'All Timeframes Synchronized',
		hook: 'Get in on the most powerful volatility compressions earlier and lock in gains before momentum fades.',
		whatItExposes:
			'Tracks simultaneous volatility compression across 3 to 5 timeframes so you enter right as institutional energy releases.',
		bestFor: 'Working Professionals, Swing Traders & $500+ Accounts',
		chartPattern: 'squeeze'
	},
	{
		id: 'spx-gamma-zones',
		slug: 'spx-gamma-zones',
		codeName: 'Telemetry 04 // Index Options Architecture',
		name: 'Dynamic SPX & Index Gamma Inflection Levels',
		category: 'options-levels',
		categoryLabel: 'Index & Options Levels',
		platforms: 'ThinkorSwim • TradingView',
		timeframes: 'Intraday & Multi-Day Index',
		hook: 'Expose dynamic institutional support, resistance, and dealer gamma walls in the most actively traded indexes.',
		whatItExposes:
			'Maps institutional call/put walls, dealer hedging pivot zones, and magnet strikes on SPX, SPY, QQQ, and IWM.',
		bestFor: 'SPX Profit Pulse Members & Index Options Traders',
		chartPattern: 'levels'
	},
	{
		id: 'abandoned-bar-exhaustion',
		slug: 'abandoned-bar-exhaustion',
		codeName: 'Telemetry 05 // Structural Inflections',
		name: 'Abandoned Price Bar & Exhaustion Telemetry',
		category: 'order-flow',
		categoryLabel: 'Order Flow & Reversals',
		platforms: 'ThinkorSwim • TradingView',
		timeframes: '5-Min, 15-Min, 4H & Daily',
		hook: 'Identify trapped buyers at structural tops and trapped sellers at capitulation bottoms in real time.',
		whatItExposes:
			'Flags structural abandoned bars and volume divergence—the exact signal we used to short OXY Put Options live for +600% overnight.',
		bestFor: 'Options Buyers Seeking Explosive 3R–5R Reversals',
		chartPattern: 'reversal'
	},
	{
		id: 'smart-money-volume-delta',
		slug: 'smart-money-volume-delta',
		codeName: 'Telemetry 06 // Institutional Tape',
		name: 'Smart-Money Relative Volume & Absorption Oscillator',
		category: 'trend-momentum',
		categoryLabel: 'Trend & Momentum',
		platforms: 'ThinkorSwim • TradingView',
		timeframes: 'All Timeframes',
		hook: 'A non-repainting volume oscillator that shows whether institutions are quietly buying dips or selling rips.',
		whatItExposes:
			'Separates emotional retail volume churn from true institutional block accumulation across stocks and ETFs.',
		bestFor: 'All Traders ($500+ Small Accounts to Institutional)',
		chartPattern: 'volume'
	},
	{
		id: 'hot-zone-time-structure',
		slug: 'hot-zone-time-structure',
		codeName: 'Telemetry 07 // Session Windows',
		name: 'Institutional Hot-Zone & Opening Drive Windows',
		category: 'options-levels',
		categoryLabel: 'Index & Options Levels',
		platforms: 'ThinkorSwim • TradingView',
		timeframes: 'Intraday (1-Min to 30-Min)',
		hook: 'See within seconds the highest-probability institutional execution windows—and avoid midday chop.',
		whatItExposes:
			'Plots opening range liquidity imbalances, institutional execution windows, and low-expectancy chop zones to protect your Theta.',
		bestFor: 'Day Trading Room Members & Options Scalpers',
		chartPattern: 'levels'
	},
	{
		id: 'true-thrust-trend-ribbon',
		slug: 'true-thrust-trend-ribbon',
		codeName: 'Telemetry 08 // Multi-Day Alignment',
		name: 'Institutional Trend Thrust & Structure Ribbon',
		category: 'trend-momentum',
		categoryLabel: 'Trend & Momentum',
		platforms: 'ThinkorSwim • TradingView',
		timeframes: '15-Min, 1H, Daily & Weekly',
		hook: 'Combine price structure, institutional thrust, and regime momentum to stay on the right side of major trends.',
		whatItExposes:
			'Eliminates counter-trend guessing by locking in institutional trend direction, pullback entry shelves, and trailing stop levels.',
		bestFor: 'Swing Trading Room & Explosive Swings Members',
		chartPattern: 'squeeze'
	}
];

export const indicatorFilters: readonly { id: IndicatorCategoryFilter; label: string }[] = [
	{ id: 'all', label: `All Indicators (${indicatorsCatalog.length})` },
	{ id: 'order-flow', label: 'Order Flow & Reversals' },
	{ id: 'volatility-squeeze', label: 'Volatility & Squeeze' },
	{ id: 'options-levels', label: 'Index & Options Levels' },
	{ id: 'trend-momentum', label: 'Trend & Momentum' }
];
