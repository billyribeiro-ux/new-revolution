/**
 * Shared scanner catalog for /store/scanners and /store/scanners/[slug].
 * Each scanner has its own unique `slug` matching `SCANNERS_STORE_CATALOG_ITEMS` in `structured-data.ts`.
 * The standalone flagship landing page lives at `/store/scanners/high-octane-scanner`.
 */

export type ScannerCategory =
	| 'all'
	| 'multi-timeframe-squeeze'
	| 'order-flow-reversals'
	| 'options-gamma'
	| 'small-accounts-swing';

export interface ScannerProduct {
	id: string;
	slug: string;
	code: string;
	name: string;
	category: ScannerCategory;
	categoryLabel: string;
	platforms: string;
	scanUniverse: string;
	hook: string;
	description: string;
	features: string[];
	bestFor: string;
	radarPattern: 'matrix' | 'sweep' | 'gamma' | 'volume';
}

export const FLAGSHIP_SCANNER_SLUG = 'high-octane-scanner';

export const scannersCatalog: ScannerProduct[] = [
	{
		id: 'move-prior-to-the-move-radar',
		slug: 'move-prior-to-the-move-radar',
		code: 'Scanner 01 // Flagship Institutional Radar',
		name: 'The Move Prior to The Move™ Live Market Radar',
		category: 'order-flow-reversals',
		categoryLabel: 'Order Flow & Liquidity Sweeps',
		platforms: 'ThinkorSwim • TradingView • Web Radar',
		scanUniverse: 'Liquid US Stocks, ETFs & Indexes (1-Min to Daily)',
		hook: 'Automatically scan thousands of tickers to spot institutional accumulation and distribution before the breakout candle prints.',
		description:
			'Stop flipping through 300 charts by hand and arriving after the move is over. Our flagship scanner continuously monitors the entire liquid market for pre-breakout institutional absorption and MP_EarlyInNOut™ triggers.',
		features: [
			'Real-time detection of Low, High, and Ultra institutional compression zones',
			'Pre-ignition alerts when smart-money volume enters before price breaks out',
			'Automatic filtering for liquid options chains with tight bid-ask spreads',
			'Confirmed bar-close scan triggers with built-in structural stop-loss levels'
		],
		bestFor: 'Day Traders, Swing Traders & Full-Time Desks',
		radarPattern: 'sweep'
	},
	{
		id: 'multi-timeframe-squeeze-scanner',
		slug: 'multi-timeframe-squeeze-scanner',
		code: 'Scanner 02 // 18-Timeframe Alignment Engine',
		name: 'Multi-Timeframe Volatility Squeeze & Alignment Scanner',
		category: 'multi-timeframe-squeeze',
		categoryLabel: 'Multi-Timeframe Squeeze',
		platforms: 'ThinkorSwim • TradingView',
		scanUniverse: 'S&P 500, Nasdaq 100, Sector ETFs & Liquid Options',
		hook: 'Instantly surface the exact stocks and ETFs with simultaneous volatility squeezes aligned across 3 to 18 timeframes.',
		description:
			'Single-timeframe squeezes often fizzle out in choppy markets. This scanner filters the entire market down to the top 5 to 10 A+ tickers where intraday, 1-hour, 4-hour, and Daily compressions are stacked in the same direction.',
		features: [
			'Simultaneous multi-timeframe compression scanning (from 1-Min up to Weekly)',
			'Ranks candidates by historical expectancy, average move size, and bar duration',
			'Separates bullish trend-continuation squeezes from bearish breakdown squeezes',
			'One-click watchlist export directly into ThinkorSwim and TradingView'
		],
		bestFor: 'Working Professionals, Swing Traders & Options Buyers',
		radarPattern: 'matrix'
	},
	{
		id: 'liquidity-sweep-stop-hunt-scanner',
		slug: 'liquidity-sweep-stop-hunt-scanner',
		code: 'Scanner 03 // Anti-Trap Reversal Engine',
		name: 'Institutional Liquidity Sweep & Failed Breakout Scanner',
		category: 'order-flow-reversals',
		categoryLabel: 'Order Flow & Liquidity Sweeps',
		platforms: 'ThinkorSwim • TradingView',
		scanUniverse: 'High-Beta Large Caps, Index ETFs & SPX/NDX',
		hook: 'Catch Wall Street stop-hunts in real time, identifying where retail traders are trapped at highs or lows right as institutions reverse the tape.',
		description:
			'Built on the proprietary order-flow principles passed down by former Goldman Sachs legend Mark "Goldfinger" McGoldrick, this scanner flags stocks sweeping key pre-market, daily, or multi-day highs/lows with institutional absorption.',
		features: [
			'Detects opening-bell liquidity sweeps and failed retail breakout traps live',
			'Identifies abandoned price bars and climax volume exhaustion at structural extremes',
			'Provides tight, mechanical stop-loss invalidation just beyond the sweep wick',
			'The exact scanner logic behind our live +600% overnight OXY Put Options trade'
		],
		bestFor: 'Opening-Bell Scalpers & Contrarian Options Traders',
		radarPattern: 'sweep'
	},
	{
		id: 'small-account-affordable-options-scanner',
		slug: 'small-account-affordable-options-scanner',
		code: 'Scanner 04 // $500+ Capital Filter',
		name: '$500+ Small Account Affordable Options & Spread Scanner',
		category: 'small-accounts-swing',
		categoryLabel: '$500+ Small Accounts & Swings',
		platforms: 'ThinkorSwim • TradingView',
		scanUniverse: 'Liquid Underlyings With Affordable Option Contracts',
		hook: 'Find A+ institutional stock and options setups priced specifically for $500 to $2,500 accounts, with zero penny-stock garbage.',
		description:
			'Most scanners surface $800 stocks whose options cost $1,500 per contract, pricing out small accounts. This dedicated scanner filters strictly for high-liquidity stocks and ETFs whose options premiums and vertical spreads fit safely inside a $500+ risk budget.',
		features: [
			'Filters by maximum option contract cost and tight penny-wide bid-ask spreads',
			'Highlights 3R-to-5R setups ideal for T+1 cash-account daily buying-power rotation',
			'Screens for high-probability vertical debit and credit spread candidates',
			'Eliminates illiquid micro-float penny stocks where retail traders get dumped on'
		],
		bestFor: 'Small Accounts Room ($500+) Members & Developing Traders',
		radarPattern: 'volume'
	},
	{
		id: 'working-pro-eod-swing-scanner',
		slug: 'working-pro-eod-swing-scanner',
		code: 'Scanner 05 // 9-to-5 Evening Prep Radar',
		name: 'Working Professional 20-Minute End-of-Day Swing Scanner',
		category: 'small-accounts-swing',
		categoryLabel: '$500+ Small Accounts & Swings',
		platforms: 'ThinkorSwim • TradingView',
		scanUniverse: 'US Equities, Sector ETFs & Market Indexes (4H, Daily & Weekly)',
		hook: 'Run one scan in 5 minutes after dinner to uncover the highest-probability multi-day stock and options swing setups for tomorrow.',
		description:
			'Engineered for busy 9-to-5 professionals who cannot watch screens during work hours. Run this scanner in the evening to identify multi-week institutional accumulation bases ready to trigger via conditional orders the next day.',
		features: [
			'Scans 4-Hour, Daily, and Weekly charts for institutional pullback shelves and squeezes',
			'Calculates pre-planned entry trigger zones, profit targets, and hard stop levels',
			'Filters out tickers with upcoming binary earnings risk within 7 days',
			'Pairs directly with our Swing Trading Room and Sunday Alpha Protocol video watchlists'
		],
		bestFor: '9-to-5 Working Professionals & Multi-Day Swing Traders',
		radarPattern: 'matrix'
	},
	{
		id: 'spx-dealer-gamma-iv-skew-scanner',
		slug: 'spx-dealer-gamma-iv-skew-scanner',
		code: 'Scanner 06 // Index & Volatility Telemetry',
		name: 'SPX & Index Options Dealer Gamma & IV Percentile Scanner',
		category: 'options-gamma',
		categoryLabel: 'Options & SPX Gamma',
		platforms: 'ThinkorSwim • TradingView',
		scanUniverse: 'SPX, XSP, SPY, QQQ, IWM & Liquid Options Leaders',
		hook: 'Expose dealer Gamma walls, implied volatility (Vega) extremes, and optimal Delta/Theta strike zones in seconds.',
		description:
			'Whether you are buying 0DTE directional contracts or selling 30–45 DTE credit spreads, this scanner cross-references price structure with IV Percentile and dealer hedging levels so you never buy overpriced volatility or sell into a Gamma explosion.',
		features: [
			'Flags low-IV Percentile tickers (ideal for buying calls, puts, and debit spreads)',
			'Flags elevated-IV Percentile tickers (ideal for selling Theta-positive credit spreads)',
			'Tracks intraday SPX and QQQ proximity to major institutional Call and Put walls',
			'Integrates seamlessly with our Options Greeks hierarchy and Options Calculator'
		],
		bestFor: 'SPX Profit Pulse Members & Options Greeks Strategists',
		radarPattern: 'gamma'
	},
	{
		id: 'smart-money-relative-volume-scanner',
		slug: 'smart-money-relative-volume-scanner',
		code: 'Scanner 07 // Institutional Block Tape',
		name: 'Smart-Money Relative Volume (RVOL) & Accumulation Scanner',
		category: 'order-flow-reversals',
		categoryLabel: 'Order Flow & Liquidity Sweeps',
		platforms: 'ThinkorSwim • TradingView',
		scanUniverse: 'All Liquid US Stocks & Sector ETFs',
		hook: 'Spot unusual institutional volume footprints (200% to 500%+ RVOL) the exact minute smart-money desks step onto the tape.',
		description:
			'Institutions cannot hide billions of dollars in order flow. This scanner compares current volume against time-of-day historical norms to reveal which sectors and stocks are experiencing genuine institutional accumulation or distribution.',
		features: [
			'Time-adjusted Relative Volume (RVOL) scanning from the 9:30 AM opening bell',
			'Separates quiet institutional block accumulation from noisy retail exhaustion spikes',
			'Tracks live sector rotation across all 11 S&P 500 institutional sectors',
			'Core breadth and volume telemetry used in our 2020 and 2022 macro cycle calls'
		],
		bestFor: 'Momentum Day Traders, Sector Rotators & Portfolio Managers',
		radarPattern: 'volume'
	},
	{
		id: 'opening-bell-gap-and-go-fade-scanner',
		slug: 'opening-bell-gap-and-go-fade-scanner',
		code: 'Scanner 08 // Pre-Market Bell Preparation',
		name: 'Pre-Market Institutional Gap & Liquidity Imbalance Scanner',
		category: 'options-gamma',
		categoryLabel: 'Options & SPX Gamma',
		platforms: 'ThinkorSwim • TradingView',
		scanUniverse: 'Pre-Market Liquid Equities & ETFs (8:00 AM – 9:30 AM ET)',
		hook: 'Know by 9:00 AM ET which pre-market gaps are backed by real institutional continuation and which are retail traps ready to fade.',
		description:
			'Every morning before the opening bell, this scanner grades pre-market gappers by institutional volume quality, multi-day resistance clearance, and options liquidity, giving you a laser-focused 3-to-5 ticker morning game plan.',
		features: [
			'Distinguishes "Gap-and-Go" institutional breakouts from "Gap-and-Crap" distribution traps',
			'Plots automatic pre-market high/low trigger levels and opening-range invalidation stops',
			'Filters strictly for liquid options underlyings so you never get stuck in wide spreads',
			'Used live every morning during our Day Trading Room pre-market prep session'
		],
		bestFor: 'Day Trading Room Members & Opening-Bell Options Traders',
		radarPattern: 'gamma'
	}
];
