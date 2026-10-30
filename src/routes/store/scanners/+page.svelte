<!-- src/routes/store/scanners/+page.svelte -->
<script lang="ts">
	import '#lib/styles/inner-page.css';
	import { resolve } from '$app/paths';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import { SCANNERS_STORE_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import type { PageData } from './$types';

	type ScannerCategory =
		| 'all'
		| 'multi-timeframe-squeeze'
		| 'order-flow-reversals'
		| 'options-gamma'
		| 'small-accounts-swing';

	type RadarPreviewTab = 'squeeze-radar' | 'liquidity-sweep' | 'contrarian-oxy';

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

	interface LiveRadarRow {
		ticker: string;
		timeframeAlign: string;
		signalRead: string;
		expectedMove: string;
		status: string;
	}

	interface ComparisonRow {
		criterion: string;
		retailScreeners: string;
		revolutionScanners: string;
	}

	interface RoomCta {
		badge: string;
		title: string;
		description: string;
		ctaLabel: string;
		href: string;
	}

	interface Props {
		data?: Partial<PageData> & {
			scanners?: ScannerProduct[];
		};
	}

	let { data }: Props = $props();

	const categoryTabs: { id: ScannerCategory; label: string }[] = [
		{ id: 'all', label: 'All Scanners (8)' },
		{ id: 'multi-timeframe-squeeze', label: 'Multi-Timeframe Squeeze' },
		{ id: 'order-flow-reversals', label: 'Order Flow & Liquidity Sweeps' },
		{ id: 'options-gamma', label: 'Options & SPX Gamma' },
		{ id: 'small-accounts-swing', label: '$500+ Small Accounts & Swings' }
	];

	const radarPreviewData: Record<
		RadarPreviewTab,
		{ title: string; subtitle: string; rows: LiveRadarRow[] }
	> = {
		'squeeze-radar': {
			title: '18-Timeframe Volatility Compression Radar',
			subtitle: 'Scanning 5,000+ Liquid US Stocks, ETFs & Indexes in Real Time',
			rows: [
				{
					ticker: 'NVDA',
					timeframeAlign: '5M • 15M • 1H • 4H • D [ALIGNED]',
					signalRead: 'Ultra Compression + Early In Absorption',
					expectedMove: '+4.6R Avg (8 Bars)',
					status: 'PRE-IGNITION ▲'
				},
				{
					ticker: 'SPY',
					timeframeAlign: '3M • 5M • 15M • 30M [ALIGNED]',
					signalRead: 'Opening Drive Squeeze Above Call Wall',
					expectedMove: '+3.8R Avg (6 Bars)',
					status: 'FIRING LONG ▲'
				},
				{
					ticker: 'META',
					timeframeAlign: '1H • 4H • Daily • Weekly [ALIGNED]',
					signalRead: 'Multi-Day Swing Compression Shelf',
					expectedMove: '+5.2R Avg (9 Bars)',
					status: 'SWING READY ■'
				},
				{
					ticker: 'TSLA',
					timeframeAlign: '5M • 15M • 1H [ALIGNED]',
					signalRead: 'High-Velocity Momentum Ignition',
					expectedMove: '+4.1R Avg (7 Bars)',
					status: 'FIRING LONG ▲'
				}
			]
		},
		'liquidity-sweep': {
			title: 'Institutional Stop-Hunt & Liquidity Sweep Radar',
			subtitle: 'Detecting Failed Retail Breakouts & Smart-Money Absorption',
			rows: [
				{
					ticker: 'QQQ',
					timeframeAlign: '5M • 15M Sweep Zone',
					signalRead: 'Pre-Market High Swept + Institutional Sell Block',
					expectedMove: '+3.9R Downside Target',
					status: 'SWEEP TRAP ▼'
				},
				{
					ticker: 'AAPL',
					timeframeAlign: '15M • 1H Demand Shelf',
					signalRead: 'Retail Sell-Stop Sweep + Buyer Absorption',
					expectedMove: '+4.4R Reversal Target',
					status: 'REVERSAL LONG ▲'
				},
				{
					ticker: 'AMD',
					timeframeAlign: '5M • 30M Exhaustion',
					signalRead: 'Abandoned Price Bar at Supply Zone',
					expectedMove: '+3.5R Mean Reversion',
					status: 'EXHAUSTION ▼'
				},
				{
					ticker: 'IWM',
					timeframeAlign: '1H • Daily Capitulation',
					signalRead: 'Capitulation Volume Climax + Bid Support',
					expectedMove: '+5.0R Multi-Day Bounce',
					status: 'ACCUMULATION ▲'
				}
			]
		},
		'contrarian-oxy': {
			title: 'Contrarian Distribution & Put Options Radar (The +600% OXY Engine)',
			subtitle: 'Spotting Institutional Selling Hiding Behind Bullish Media Headlines',
			rows: [
				{
					ticker: 'OXY (Case)',
					timeframeAlign: '15M • 1H • Daily Climax',
					signalRead: 'Retail Headline Euphoria + Heavy Block Distribution',
					expectedMove: '+600% Overnight (Verified)',
					status: 'PUT TRIGGER ▼'
				},
				{
					ticker: 'SMCI',
					timeframeAlign: '15M • 1H Parabolic Top',
					signalRead: 'Abandoned Top Bar + IV Skew Divergence',
					expectedMove: '+4.8R Put Spread Target',
					status: 'DISTRIBUTION ▼'
				},
				{
					ticker: 'NFLX',
					timeframeAlign: '1H • 4H Post-Gap Fade',
					signalRead: 'Up-Gap Liquidity Exhaustion + Dark Pool Selling',
					expectedMove: '+3.7R Gap-Fill Target',
					status: 'SHORT SETUP ▼'
				},
				{
					ticker: 'XLE',
					timeframeAlign: '4H • Daily Sector Top',
					signalRead: 'Relative Volume Divergence at Macro Resistance',
					expectedMove: '+4.2R Sector Unwind',
					status: 'DISTRIBUTION ▼'
				}
			]
		}
	};

	const defaultScannersCatalog: ScannerProduct[] = [
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
				'100% non-repainting scan triggers with built-in structural stop-loss levels'
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
			hook: 'Catch Wall Street stop-hunts in real time—identifying where retail traders are trapped at highs or lows right as institutions reverse the tape.',
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
			hook: 'Find A+ institutional stock and options setups priced specifically for $500 to $2,500 accounts—with zero penny-stock garbage.',
			description:
				'Most scanners surface $800 stocks whose options cost $1,500 per contract—pricing out small accounts. This dedicated scanner filters strictly for high-liquidity stocks and ETFs whose options premiums and vertical spreads fit safely inside a $500+ risk budget.',
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
				'Pairs directly with our Swing Trading Room and Explosive Swings video watchlists'
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
			hook: 'Know by 9:00 AM ET which pre-market gaps are backed by real institutional continuation—and which are retail traps ready to fade.',
			description:
				'Every morning before the opening bell, this scanner grades pre-market gappers by institutional volume quality, multi-day resistance clearance, and options liquidity—giving you a laser-focused 3-to-5 ticker morning game plan.',
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

	const comparisonRows: ComparisonRow[] = [
		{
			criterion: 'Signal Integrity & Speed',
			retailScreeners:
				'Delayed 15-minute data or repainted signals that only show up after the move is over.',
			revolutionScanners:
				'Real-time, 100% non-repainting institutional scans that flag pre-ignition compression and sweeps.'
		},
		{
			criterion: 'Underlying Scan Logic',
			retailScreeners:
				'Basic RSI overbought/oversold or moving-average crossovers that get crushed in trends.',
			revolutionScanners:
				'Goldman Sachs prop-desk order flow, 18-timeframe compression, and liquidity sweep detection.'
		},
		{
			criterion: 'Ticker Quality & Liquidity',
			retailScreeners:
				'Floods your screen with 200 illiquid penny stocks and wide-spread options traps.',
			revolutionScanners:
				'Pre-filtered for deeply liquid US stocks, ETFs, SPX/NDX, and tight-spread options chains.'
		},
		{
			criterion: '$500+ Small Account & 9-to-5 Fit',
			retailScreeners:
				'Forces one generic scan that ignores contract cost and requires staring at screens all day.',
			revolutionScanners:
				'Includes dedicated $500+ affordable-contract filters and 20-minute evening swing scans.'
		},
		{
			criterion: 'Pricing & Ethical Standard',
			retailScreeners: 'Charges $1,500–$3,000/year for standalone software upsells.',
			revolutionScanners:
				'People Over Profits: Accessible tools backed by live daily execution in our Trading Rooms.'
		}
	];

	const bottomRoomCards: RoomCta[] = [
		{
			badge: 'Live Intraday Floor',
			title: 'Day Trading Room',
			description:
				'Watch our live market scanners run on screen every morning with real-time voice commentary.',
			ctaLabel: 'Learn More →',
			href: '/live-trading-rooms/day-trading-room'
		},
		{
			badge: 'Working Professionals',
			title: 'Swing Trading Room',
			description:
				'Multi-day stock and options swing setups uncovered by our 18-Timeframe Squeeze Scanner.',
			ctaLabel: 'Learn More →',
			href: '/live-trading-rooms/swing-trading-room'
		},
		{
			badge: '$500+ Starting Capital',
			title: 'Small Accounts Room',
			description: 'Trade setups filtered by our $500+ Small Account Affordable Options Scanner.',
			ctaLabel: 'Learn More →',
			href: '/live-trading-rooms/small-accounts-room'
		},
		{
			badge: '0DTE & Index Options',
			title: 'SPX Profit Pulse Alerts',
			description: 'High-conviction SPX index options alerts powered by our Dealer Gamma Scanner.',
			ctaLabel: 'Explore Alerts →',
			href: '/alert-services/spx-profit-pulse'
		},
		{
			badge: 'Video Watchlist Tier',
			title: 'Explosive Swings Alerts',
			description:
				'Affordable video watchlists delivering our top scanner picks with exact entries and stops.',
			ctaLabel: 'Explore Alerts →',
			href: '/alert-services/explosive-swings'
		}
	];

	let activeCategory = $state<ScannerCategory>('all');
	let activeRadarTab = $state<RadarPreviewTab>('squeeze-radar');

	const scannersCatalog = $derived(
		data?.scanners && data.scanners.length > 0 ? data.scanners : defaultScannersCatalog
	);

	const filteredScanners = $derived(
		activeCategory === 'all'
			? scannersCatalog
			: scannersCatalog.filter((s) => s.category === activeCategory)
	);

	const currentRadar = $derived(radarPreviewData[activeRadarTab]);

	function showAllScanners() {
		activeCategory = 'all';
		const el = document.getElementById('popular-scanners-grid');
		if (el) {
			el.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

{#if data?.jsonLdSchema}
	<JsonLd schema={data.jsonLdSchema} />
{/if}

<div class="app-shell">
	<Navbar />

	<main
		id="scanners-store-page"
		class="inner-page scanners-page"
		itemscope
		itemtype="https://schema.org/CollectionPage"
	>
		<!-- =========================================================================
       SECTION 1: BREADCRUMB & REAL-TIME RADAR TELEMETRY BAR
       ========================================================================= -->
		<nav class="breadcrumb-bar" aria-label="Breadcrumb">
			<div class="container breadcrumb-bar__inner">
				<ol class="breadcrumb-list">
					<li><a href={resolve('/')}>Home</a></li>
					<li aria-hidden="true">/</li>
					<li><span>Store</span></li>
					<li aria-hidden="true">/</li>
					<li aria-current="page">Trading Scanners</li>
				</ol>
				<p class="breadcrumb-bar__telemetry">
					<span>Real-Time Institutional Radar</span> • <span>100% Non-Repainting</span> •
					<span>ThinkorSwim &amp; TradingView</span>
				</p>
			</div>
		</nav>

		<!-- =========================================================================
       SECTION 2: ABOVE-THE-FOLD HERO + INTERACTIVE LIVE RADAR TERMINAL
       ========================================================================= -->
		<section class="hero-section" aria-labelledby="scanners-h1">
			<div class="container hero-section__grid">
				<!-- Left 7 Columns: Search-Intent H1 + Institutional Scanner Authority -->
				<div class="hero-section__main">
					<div class="eyebrow-pill">
						<span class="eyebrow-pill__badge">Innovate • Real-Time Radar</span>
						<span class="eyebrow-pill__text">
							Mentored by Former Goldman Sachs Legend Mark "Goldfinger" McGoldrick
						</span>
					</div>

					<h1 id="scanners-h1" class="hero-h1" itemprop="name">
						<span class="hero-h1__seo-kicker seo-kicker">
							Live Stock, ETF &amp; Options Trading Scanners • Institutional Order Flow &amp;
							Squeeze Radar
						</span>
						<span class="hero-h1__display">
							Stop Flipping Through 500 Charts by Hand. Let Institutional Order Flow Come to You.
						</span>
					</h1>

					<p class="lead-copy" itemprop="description">
						By the time a ticker trends on social media or trips a basic retail stock screener, the
						institutional move is already 80% over. Our
						<strong>100% Non-Repainting Trading Scanners</strong> scan thousands of stocks, ETFs,
						and options chains in real time—surfacing
						<strong
							>multi-timeframe volatility squeezes, institutional liquidity sweeps, and smart-money
							accumulation before the breakout candle even prints</strong
						>.
					</p>

					<p class="body-copy">
						<strong
							>I know the frustration of missing A+ moves or buying late at the top, because I stood
							on the losing end myself in the past.</strong
						>
						Retail traders lose because they waste hours hunting for setups manually while Wall
						Street algorithms scan the entire market in milliseconds. When former Goldman Sachs
						proprietary trading legend <strong>Mark "Goldfinger" McGoldrick</strong> mentored me
						directly and called me <em>"the future of trading,"</em> I learned how institutional desks
						filter the tape.
					</p>

					<p class="body-copy">
						We engineered these exact scanners to power our own trading floor—helping us call the
						<strong>2020 COVID Top and Bottom</strong>, call the
						<strong>2022 Bull Market Top and Bear Bottom</strong>, and spot the institutional
						distribution on <strong>Occidental Petroleum (OXY)</strong> that banked us
						<strong>+600% overnight on Put Options live</strong> while Warren Buffett went long
						millions of dollars. Because <strong>we focus on PEOPLE, not making money</strong>, we
						make our entire radar suite accessible for every trader.
					</p>

					<div class="cta-row">
						<a href="#popular-scanners-grid" class="btn btn--solid">
							Browse All 8 Market Scanners ↓
						</a>
						<a href={resolve('/store/indicators')} class="btn btn--outline">
							Pair With Custom Indicators →
						</a>
					</div>
				</div>

				<!-- Right 5 Columns: Interactive Live Radar Terminal Simulator -->
				<aside class="radar-terminal" aria-label="Interactive Live Market Scanner Radar Preview">
					<div class="radar-terminal__header">
						<div>
							<span class="meta-label">Live Scanner Telemetry Preview</span>
							<h2 class="radar-terminal__title">See What Our Scanners Surface Live</h2>
						</div>
						<span class="radar-terminal__live">● SCANNING LIVE</span>
					</div>

					<p class="radar-terminal__intro">
						Switch between our three core radar engines below to see how our scanners filter 5,000+
						tickers down to high-conviction setups:
					</p>

					<div class="radar-tabs" role="tablist" aria-label="Select Scanner Radar Mode">
						<button
							type="button"
							role="tab"
							aria-selected={activeRadarTab === 'squeeze-radar'}
							class="radar-tab"
							class:radar-tab--active={activeRadarTab === 'squeeze-radar'}
							onclick={() => (activeRadarTab = 'squeeze-radar')}
						>
							1. 18-TF Squeeze
						</button>
						<button
							type="button"
							role="tab"
							aria-selected={activeRadarTab === 'liquidity-sweep'}
							class="radar-tab"
							class:radar-tab--active={activeRadarTab === 'liquidity-sweep'}
							onclick={() => (activeRadarTab = 'liquidity-sweep')}
						>
							2. Stop-Hunt Sweep
						</button>
						<button
							type="button"
							role="tab"
							aria-selected={activeRadarTab === 'contrarian-oxy'}
							class="radar-tab"
							class:radar-tab--active={activeRadarTab === 'contrarian-oxy'}
							onclick={() => (activeRadarTab = 'contrarian-oxy')}
						>
							3. +600% OXY Scan
						</button>
					</div>

					<div class="radar-screen">
						<div class="radar-screen__bar">
							<strong>{currentRadar.title}</strong>
							<span>{currentRadar.subtitle}</span>
						</div>

						<div class="radar-table-wrap">
							<table class="radar-table">
								<thead>
									<tr>
										<th scope="col">Ticker</th>
										<th scope="col">Timeframe &amp; Telemetry Read</th>
										<th scope="col">Expectancy</th>
										<th scope="col">Trigger</th>
									</tr>
								</thead>
								<tbody>
									{#each currentRadar.rows as row (row.ticker)}
										<tr>
											<td class="radar-table__ticker">{row.ticker}</td>
											<td>
												<span class="radar-table__tf">{row.timeframeAlign}</span>
												<span class="radar-table__read">{row.signalRead}</span>
											</td>
											<td class="radar-table__exp">{row.expectedMove}</td>
											<td>
												<span class="radar-table__badge">{row.status}</span>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>

					<div class="radar-terminal__footer">
						<p class="radar-terminal__note">
							Works on <strong>ThinkorSwim Desktop &amp; Mobile</strong> +
							<strong>TradingView</strong> • <a href="#popular-scanners-grid">Inspect Scanners ↓</a>
						</p>
					</div>
				</aside>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 3: UPGRADED SCANNERS CATALOG GRID (CRAWLABLE <A> LINKS — NO GOTO BUG)
       Header Split: "Popular Market Scanners:" (Left) + "See All Scanners" (Top Right)
       ========================================================================= -->
		<section
			id="popular-scanners-grid"
			class="catalog-section"
			aria-labelledby="popular-scanners-h2"
		>
			<div class="container">
				<!-- Top Header Split -->
				<div class="catalog-top-bar">
					<div class="catalog-top-bar__left">
						<span class="section-kicker">Educate • Innovate • Prosper</span>
						<h2 id="popular-scanners-h2" class="section-h2">Popular Market Scanners:</h2>
						<p class="catalog-top-bar__sub">
							Every scanner includes one-click installation links, custom watchlist columns, and
							step-by-step video training.
						</p>
					</div>

					<div class="catalog-top-bar__right">
						<button type="button" class="btn btn--solid" onclick={showAllScanners}>
							See All Scanners ({scannersCatalog.length}) →
						</button>
					</div>
				</div>

				<!-- Category Filter Tabs -->
				<div class="filter-bar" role="tablist" aria-label="Filter scanners by trading style">
					{#each categoryTabs as tab (tab.id)}
						<button
							type="button"
							role="tab"
							aria-selected={activeCategory === tab.id}
							class="filter-tab"
							class:filter-tab--active={activeCategory === tab.id}
							onclick={() => (activeCategory = tab.id)}
						>
							{tab.label}
						</button>
					{/each}
				</div>

				<!-- 8-Card Semantic Scanners Grid (100% Crawlable <a> Links & Zero Prices) -->
				<div class="scanners-grid" role="list">
					{#each filteredScanners as scanner (scanner.id)}
						<article
							id={scanner.id}
							class="scanner-card"
							role="listitem"
							itemscope
							itemtype="https://schema.org/SoftwareApplication"
						>
							<!-- Top Radar Banner -->
							<div class="scanner-card__banner">
								<div class="scanner-card__banner-top">
									<span class="scanner-card__code">{scanner.code}</span>
									<span class="scanner-card__no-repaint">Zero Repaint</span>
								</div>

								<!-- High-Contrast SVG Radar Schematic -->
								<div class="scanner-card__svg-box" aria-hidden="true">
									{#if scanner.radarPattern === 'matrix'}
										<svg viewBox="0 0 320 84" class="scanner-svg">
											<rect x="8" y="8" width="304" height="18" fill="#222222" />
											<text x="16" y="20" font-size="8" font-weight="800" fill="#ffffff">
												SCANNING 18 TIMEFRAMES: [5M ■] [15M ■] [1H ■] [4H ■] [D ■]
											</text>
											<rect
												x="8"
												y="32"
												width="96"
												height="42"
												fill="#111111"
												stroke="#ffffff"
												stroke-width="1"
											/>
											<text
												x="56"
												y="50"
												font-size="9"
												font-weight="900"
												text-anchor="middle"
												fill="#ffffff">NVDA ▲</text
											>
											<text x="56" y="64" font-size="7.5" text-anchor="middle" fill="#cccccc"
												>ULTRA SQUEEZE</text
											>
											<rect
												x="112"
												y="32"
												width="96"
												height="42"
												fill="#111111"
												stroke="#ffffff"
												stroke-width="1"
											/>
											<text
												x="160"
												y="50"
												font-size="9"
												font-weight="900"
												text-anchor="middle"
												fill="#ffffff">SPY ▲</text
											>
											<text x="160" y="64" font-size="7.5" text-anchor="middle" fill="#cccccc"
												>6-TF ALIGNED</text
											>
											<rect x="216" y="32" width="96" height="42" fill="#ffffff" />
											<text
												x="264"
												y="50"
												font-size="9"
												font-weight="900"
												text-anchor="middle"
												fill="#000000">META ▲</text
											>
											<text
												x="264"
												y="64"
												font-size="7.5"
												font-weight="800"
												text-anchor="middle"
												fill="#000000">FIRING NOW</text
											>
										</svg>
									{:else if scanner.radarPattern === 'sweep'}
										<svg viewBox="0 0 320 84" class="scanner-svg">
											<line
												x1="10"
												y1="22"
												x2="310"
												y2="22"
												stroke="#777777"
												stroke-dasharray="4 4"
												stroke-width="1"
											/>
											<polyline
												fill="none"
												stroke="#ffffff"
												stroke-width="2.5"
												points="14,64 68,42 120,10 165,38 225,58 295,72"
											/>
											<circle cx="120" cy="10" r="5" fill="#ffffff" />
											<rect x="136" y="6" width="168" height="20" fill="#ffffff" />
											<text
												x="220"
												y="19"
												font-size="8"
												font-weight="900"
												text-anchor="middle"
												fill="#000000"
											>
												RADAR ALERT: SWEEP DETECTED ▼
											</text>
										</svg>
									{:else if scanner.radarPattern === 'gamma'}
										<svg viewBox="0 0 320 84" class="scanner-svg">
											<rect x="10" y="10" width="300" height="20" fill="#ffffff" />
											<text
												x="160"
												y="23"
												font-size="8"
												font-weight="900"
												text-anchor="middle"
												fill="#000000"
											>
												DEALER CALL WALL / GAMMA PINNING ZONE
											</text>
											<polyline
												fill="none"
												stroke="#ffffff"
												stroke-width="2.5"
												points="16,68 75,54 135,32 195,30 255,52 304,70"
											/>
											<circle cx="195" cy="30" r="4.5" fill="#ffffff" />
										</svg>
									{:else}
										<svg viewBox="0 0 320 84" class="scanner-svg">
											<rect x="18" y="52" width="22" height="22" fill="#666666" />
											<rect x="54" y="48" width="22" height="26" fill="#666666" />
											<rect x="90" y="56" width="22" height="18" fill="#666666" />
											<rect x="126" y="20" width="22" height="54" fill="#ffffff" />
											<rect x="162" y="12" width="22" height="62" fill="#ffffff" />
											<rect x="198" y="16" width="22" height="58" fill="#ffffff" />
											<rect x="230" y="22" width="80" height="22" fill="#ffffff" />
											<text
												x="270"
												y="36"
												font-size="8"
												font-weight="900"
												text-anchor="middle"
												fill="#000000"
											>
												RVOL 420% ▲
											</text>
										</svg>
									{/if}
								</div>

								<div class="scanner-card__banner-bottom">
									<span itemprop="applicationCategory">{scanner.categoryLabel}</span>
									<span class="scanner-card__platforms" itemprop="operatingSystem"
										>{scanner.platforms}</span
									>
								</div>
							</div>

							<!-- Card Body: Crawlable H3 + Hook + Full Features List (Zero Truncation) -->
							<div class="scanner-card__body">
								<h3 class="scanner-card__title" itemprop="name">
									<a href={resolve(`/store/scanners/${scanner.slug}` as '/')}>{scanner.name}</a>
								</h3>

								<p class="scanner-card__hook">
									{scanner.hook}
								</p>

								<p class="scanner-card__desc" itemprop="description">
									{scanner.description}
								</p>

								<!-- Full Features List (Fixes Old Page's .slice(0,3) Truncation) -->
								<div class="scanner-card__features-box">
									<span class="meta-label">What This Scanner Detects:</span>
									<ul class="scanner-features-list" aria-label={`Key features of ${scanner.name}`}>
										{#each scanner.features as feature (feature)}
											<li>
												<span class="check-mark" aria-hidden="true">✓</span>
												<span>{feature}</span>
											</li>
										{/each}
									</ul>
								</div>

								<div class="scanner-card__fit">
									<strong>Ideal For:</strong>
									{scanner.bestFor}
								</div>
							</div>

							<!-- Card Footer: Crawlable <a href> Links (Fixes Old Page's JS goto() Bug) -->
							<div class="scanner-card__footer">
								<a
									href={resolve(`/store/scanners/${scanner.slug}` as '/')}
									class="btn btn--solid btn--full"
									itemprop="url"
									aria-label={`Learn more about ${scanner.name}`}
								>
									Inspect Scanner &amp; Setup Guide →
								</a>
							</div>
						</article>
					{/each}
				</div>

				<!-- Bottom Store Navigation Bar -->
				<div class="catalog-bottom-bar">
					<button type="button" class="btn btn--solid" onclick={showAllScanners}>
						See All Scanners ({scannersCatalog.length})
					</button>
					<a href={resolve('/store/indicators')} class="btn btn--outline">
						Explore Custom Indicators →
					</a>
					<a href={resolve('/store/courses')} class="btn btn--outline">
						Explore Trading Courses →
					</a>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 4: THE 3-STEP INSTITUTIONAL EXECUTION LOOP
       (How Scanners + Non-Repainting Indicators + Options Greeks Work Together)
       ========================================================================= -->
		<section class="workflow-section" aria-labelledby="workflow-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">Complete Desk Architecture • Zero Guesswork</span>
					<h2 id="workflow-h2" class="section-h2">
						How Our Scanners, Non-Repainting Indicators &amp; Options Calculator Work Together
					</h2>
					<p class="body-copy section-header__sub">
						A scanner finds the needle in the haystack; your chart telemetry and risk calculator
						execute the trade. Here is the exact 3-step workflow we run every day:
					</p>
				</div>

				<div class="workflow-grid">
					<article class="workflow-card">
						<div class="workflow-card__top">
							<span class="workflow-card__step">Step 01 // Market-Wide Detection</span>
							<span class="meta-label">Store → Scanners</span>
						</div>
						<h3 class="workflow-card__title">
							Scanner Filters 5,000+ Tickers Down to 3–5 A+ Candidates
						</h3>
						<p class="workflow-card__copy">
							Instead of manually clicking through hundreds of sloppy charts, your scanner
							automatically flags liquid stocks, ETFs, or index strikes where multi-timeframe
							compression or institutional liquidity sweeps are forming right now.
						</p>
					</article>

					<article class="workflow-card">
						<div class="workflow-card__top">
							<span class="workflow-card__step">Step 02 // Precision Chart Timing</span>
							<span class="meta-label">Store → Indicators</span>
						</div>
						<h3 class="workflow-card__title">
							Non-Repainting Indicators Pinpoint the Exact Entry &amp; Hard Stop
						</h3>
						<p class="workflow-card__copy">
							Load the flagged ticker onto your chart and let
							<a href={resolve('/store/indicators')}>The Move Prior to The Move™</a> and our
							<strong>On-Chart Historical Stats Engine</strong> verify the exact entry trigger, average
							bar duration, and structural invalidation stop-loss.
						</p>
					</article>

					<article class="workflow-card">
						<div class="workflow-card__top">
							<span class="workflow-card__step">Step 03 // Mathematical Risk Sizing</span>
							<span class="meta-label">Resources → Options Calculator</span>
						</div>
						<h3 class="workflow-card__title">
							Structure the Exact Options Delta, DTE &amp; Position Size
						</h3>
						<p class="workflow-card__copy">
							Plug your entry and stop into our free
							<a href={resolve('/resources/options-calculator' as '/')}>Options Calculator</a> to select
							the optimal Delta, expiration window, or vertical spread—ensuring your risk is 100% capped
							before submitting the order.
						</p>
					</article>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 5: RETAIL STOCK SCREENERS VS. OUR INSTITUTIONAL SCANNERS (TABLE)
       ========================================================================= -->
		<section class="comparison-section" aria-labelledby="comparison-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">The Anti-Guru Standard • Hard Evidence</span>
					<h2 id="comparison-h2" class="section-h2">
						Generic Retail Stock Screeners vs. Revolution Trading Pros Institutional Scanners
					</h2>
				</div>

				<div class="table-wrapper" role="region" aria-labelledby="comparison-h2" tabindex="0">
					<table class="comparison-table">
						<thead>
							<tr>
								<th scope="col">Comparison Standard</th>
								<th scope="col">Generic Retail Screeners &amp; Guru Upsells</th>
								<th scope="col">Revolution Trading Pros Market Scanners</th>
							</tr>
						</thead>
						<tbody>
							{#each comparisonRows as row (row.criterion)}
								<tr>
									<th scope="row" class="comparison-table__feature">{row.criterion}</th>
									<td class="comparison-table__negative">✕ {row.retailScreeners}</td>
									<td class="comparison-table__positive">✓ {row.revolutionScanners}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 6: SCANNERS FAQ ACCORDION (SEO & AI OVERVIEW OPTIMIZED)
       ========================================================================= -->
		<section id="faq" class="faq-section" aria-labelledby="scanners-faq-h2">
			<div class="container faq-container">
				<div class="section-header">
					<span class="section-kicker">Direct Answers • Zero Marketing Fluff</span>
					<h2 id="scanners-faq-h2" class="section-h2">
						Frequently Asked Questions About Our Trading Scanners
					</h2>
				</div>

				<div class="faq-list">
					<details class="faq-item" open>
						<summary class="faq-item__question">
							<h3 class="faq-item__heading">{SCANNERS_STORE_FAQ_ITEMS[0].question}</h3>
							<span class="faq-item__icon" aria-hidden="true">+</span>
						</summary>
						<p class="faq-item__answer">
							Every scanner includes one-click import links and custom thinkScript code for
							<strong>ThinkorSwim</strong> (working inside both Stock Hacker, Option Hacker, and
							dynamic MarketWatch watchlist columns) as well as <strong>TradingView</strong> alert and
							screener templates—plus a step-by-step installation walkthrough video.
						</p>
					</details>

					<details class="faq-item">
						<summary class="faq-item__question">
							<h3 class="faq-item__heading">{SCANNERS_STORE_FAQ_ITEMS[1].question}</h3>
							<span class="faq-item__icon" aria-hidden="true">+</span>
						</summary>
						<p class="faq-item__answer">
							<strong>Never.</strong> All 8 scanners run on real-time market data using 100%
							non-repainting institutional math. Even better, because our scanners look for
							<em>pre-ignition volatility compression</em> and <em>liquidity absorption</em>, they
							alert you <strong>before</strong> the breakout candle fires rather than chasing extended
							moves.
						</p>
					</details>

					<details class="faq-item">
						<summary class="faq-item__question">
							<h3 class="faq-item__heading">{SCANNERS_STORE_FAQ_ITEMS[2].question}</h3>
							<span class="faq-item__icon" aria-hidden="true">+</span>
						</summary>
						<p class="faq-item__answer">
							If you are building a small account starting around $500, use
							<strong
								>Scanner 04 ($500+ Small Account Affordable Options &amp; Spread Scanner)</strong
							>, which filters strictly for liquid options contracts and vertical spreads that fit a
							small risk budget. If you work a 9-to-5 career, use
							<strong>Scanner 05 (Working Professional 20-Minute End-of-Day Swing Scanner)</strong> to
							plan conditional multi-day orders in the evening.
						</p>
					</details>

					<details class="faq-item">
						<summary class="faq-item__question">
							<h3 class="faq-item__heading">{SCANNERS_STORE_FAQ_ITEMS[3].question}</h3>
							<span class="faq-item__icon" aria-hidden="true">+</span>
						</summary>
						<p class="faq-item__answer">
							Yes. We run these exact scanners live on our shared screens every market morning
							inside our
							<a href={resolve('/live-trading-rooms/day-trading-room')}>Day Trading Room</a>,
							<a href={resolve('/live-trading-rooms/swing-trading-room')}>Swing Trading Room</a>,
							and
							<a href={resolve('/live-trading-rooms/small-accounts-room')}>Small Accounts Room</a>,
							and use them to curate the setups in
							<a href={resolve('/alert-services/spx-profit-pulse')}>SPX Profit Pulse</a> and
							<a href={resolve('/alert-services/explosive-swings' as '/')}>Explosive Swings</a>.
						</p>
					</details>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 7: START TRADING LIKE A PROFESSIONAL (5 ROOM & ALERT CTA CARDS)
       ========================================================================= -->
		<section class="pro-cta-section" aria-labelledby="pro-cta-h2">
			<div class="container">
				<div class="pro-cta-box">
					<div class="pro-cta-box__header">
						<span class="section-kicker">Educate • Innovate • Prosper</span>
						<h2 id="pro-cta-h2" class="section-h2 pro-cta-box__h2">
							Watch Our Scanners Uncover A+ Setups Live Every Market Day
						</h2>
						<p class="body-copy pro-cta-box__sub">
							Pair our real-time institutional scanners with our Live Trading Rooms or Video
							Watchlist Alert Services:
						</p>
					</div>

					<div class="room-cta-grid">
						{#each bottomRoomCards as room (room.href)}
							<article class="room-cta-card">
								<div>
									<span class="room-cta-card__badge">{room.badge}</span>
									<h3 class="room-cta-card__title">{room.title}</h3>
									<p class="room-cta-card__desc">{room.description}</p>
								</div>
								<a href={resolve(room.href as '/')} class="btn btn--solid btn--full">
									{room.ctaLabel}
								</a>
							</article>
						{/each}
					</div>
				</div>
			</div>
		</section>
	</main>

	<Footer />
</div>
