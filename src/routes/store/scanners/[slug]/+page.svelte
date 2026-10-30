<!-- src/routes/store/scanners/[slug]/+page.svelte -->
<script lang="ts">
	import '#lib/styles/inner-page.css';
	import { resolve } from '$app/paths';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import { SINGLE_SCANNER_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type CadenceType = 'monthly' | 'annual';
	type TerminalMode = 'options-ignition' | 'multi-tf-squeeze' | 'small-account-filter';

	interface ScannerFeatureCard {
		id: string;
		code: string;
		badge: string;
		title: string;
		platforms: string;
		description: string;
		traderEdge: string;
		iconType: 'radar' | 'filter' | 'bell' | 'stats' | 'small-cap' | 'bonus';
		isBonus?: boolean;
	}

	interface TerminalScanRow {
		ticker: string;
		contractOrZone: string;
		telemetryRead: string;
		histExpectancy: string;
		signalBadge: string;
	}

	interface SuitabilityColumn {
		tag: string;
		title: string;
		subtitle: string;
		bullets: string[];
	}

	interface ComparisonRow {
		criterion: string;
		genericScanners: string;
		highOctaneScanner: string;
	}

	interface MemberReview {
		quote: string;
		author: string;
		profile: string;
		scanModeUsed: string;
	}

	interface RoomCta {
		badge: string;
		title: string;
		description: string;
		ctaLabel: string;
		href: string;
	}

	/* ===========================================================================
     MASTER SCANNER PRODUCT CONFIG (EDIT HERE TO RENAME OR CLONE LATER)
     =========================================================================== */
	const scannerConfig = {
		id: 'high-octane-scanner',
		slug: 'high-octane-scanner',
		name: 'High Octane Scanner™',
		// 27 chars before suffix -> 53 chars total with " | Revolution Trading Pros"
		seoTitle: 'High Octane Options Scanner | Revolution Trading Pros',
		// 149 chars total -> Zero Google Desktop or Mobile SERP Truncation
		seoDescription:
			'Find explosive stock, ETF, and options setups in real time with the 100% non-repainting High Octane Scanner for ThinkorSwim & TradingView. Zero hype.',
		eyebrowBadge: 'Real-Time Institutional Radar • 100% Non-Repainting',
		seoKicker: 'High Octane Stock, ETF & Options Scanner for ThinkorSwim, TradingView & Mobile',
		heroTitle: 'Spot High-Probability Institutional Options & Equity Setups in Milliseconds.',
		heroTagline:
			'Stop flipping through 500 charts by hand and arriving after the move is already over. The High Octane Scanner™ monitors thousands of liquid stocks, ETFs, and options chains in real time—surfacing multi-timeframe volatility squeezes, institutional liquidity sweeps, and unusual options flow before the crowd reacts.',
		creatorName: 'Billy Ribeiro',
		creatorRole: 'Founder of Revolution Trading Pros • Mentored by Mark "Goldfinger" McGoldrick',
		creatorAvatar:
			'https://revolutiontradingpros.com/wp-content/uploads/2025/05/Billy-no-grey-768x768.png.webp',
		supportPhone: '+1 (203) 721-0940',
		supportEmail: 'support@revolutiontradingpros.com',
		coreBenefits: [
			'Find high-probability institutional stock, ETF, and options trades in seconds—reducing manual chart prep time by 90%',
			'100% Non-Repainting real-time scan triggers: never chase an extended retail breakout candle again',
			'Built-in $500+ Small Account Filter: screens strictly for affordable option contracts with tight penny-wide bid-ask spreads',
			'20-Minute Working Professional Mode: run evening end-of-day scans to set conditional orders before your 9-to-5 workday',
			'Instant notifications across ThinkorSwim Desktop, ThinkorSwim Mobile App, TradingView, SMS, and Email',
			'Includes step-by-step installation guide, custom watchlist columns, and 5 recorded live-market scanning sessions'
		]
	};

	/* ===========================================================================
     INTERACTIVE 3-MODE TERMINAL PREVIEW DATA (REPLACES OLD PLACEHOLDER BOX)
     =========================================================================== */
	const terminalModes: Record<
		TerminalMode,
		{ label: string; headerTitle: string; headerSub: string; rows: TerminalScanRow[] }
	> = {
		'options-ignition': {
			label: '1. Options Ignition',
			headerTitle: 'High Octane Mode 01 // Real-Time Options & Order-Flow Ignition',
			headerSub: 'Scanning Liquid Options Chains for Institutional Block Sweep + RVOL Expansion',
			rows: [
				{
					ticker: 'NVDA',
					contractOrZone: '0.60 Delta Call • Tight Spread',
					telemetryRead: 'RVOL 410% + Pre-Ignition Absorption',
					histExpectancy: '+4.8R Avg (7 Bars)',
					signalBadge: 'EARLY IN ▲'
				},
				{
					ticker: 'SPX',
					contractOrZone: '0DTE / 2DTE Gamma Wall Break',
					telemetryRead: 'Dealer Short-Gamma Acceleration Zone',
					histExpectancy: '+4.2R Avg (5 Bars)',
					signalBadge: 'IGNITION ▲'
				},
				{
					ticker: 'OXY (Case)',
					contractOrZone: 'Contrarian Put Options',
					telemetryRead: 'Retail Euphoria + Heavy Block Distribution',
					histExpectancy: '+600% Overnight',
					signalBadge: 'PUT SWEEP ▼'
				},
				{
					ticker: 'META',
					contractOrZone: '30–45 DTE Vertical Spread',
					telemetryRead: 'Institutional Demand Shelf Bounce',
					histExpectancy: '+3.9R Avg (9 Bars)',
					signalBadge: 'ACCUMULATION ▲'
				}
			]
		},
		'multi-tf-squeeze': {
			label: '2. 18-TF Squeeze',
			headerTitle: 'High Octane Mode 02 // 18-Timeframe Synchronized Compression',
			headerSub: 'Filtering 5,000+ Tickers for Stacked Intraday, 4H & Daily Volatility Squeezes',
			rows: [
				{
					ticker: 'SPY',
					contractOrZone: '5M • 15M • 30M • 1H • 4H',
					telemetryRead: 'Ultra Compression Aligned Across 5 TFs',
					histExpectancy: '82% Fired Long',
					signalBadge: 'ULTRA SQUEEZE ●'
				},
				{
					ticker: 'QQQ',
					contractOrZone: '15M • 1H • 4H • Daily',
					telemetryRead: 'Multi-Day Trend Thrust + Low IV Rank',
					histExpectancy: '79% Fired Long',
					signalBadge: 'SWING READY ▲'
				},
				{
					ticker: 'TSLA',
					contractOrZone: '5M • 15M • 1H',
					telemetryRead: 'Opening Drive Compression Release',
					histExpectancy: '+4.5R Avg Move',
					signalBadge: 'FIRING NOW ▲'
				},
				{
					ticker: 'SMCI',
					contractOrZone: '1H • 4H • Daily',
					telemetryRead: 'Bearish Breakdown Squeeze at Supply',
					histExpectancy: '77% Fired Short',
					signalBadge: 'SHORT SQUEEZE ▼'
				}
			]
		},
		'small-account-filter': {
			label: '3. $500+ Account Scan',
			headerTitle: 'High Octane Mode 03 // $500+ Small Account Affordable Contract Filter',
			headerSub:
				'Strictly Liquid Underlyings With Affordable Option Premiums & Zero Penny-Stock Traps',
			rows: [
				{
					ticker: 'AMD',
					contractOrZone: '5-Wide Debit Spread Eligible',
					telemetryRead: '15M Liquidity Sweep + Tight Stop',
					histExpectancy: 'Capped Dollar Risk',
					signalBadge: '$500+ FIT ✓'
				},
				{
					ticker: 'IWM',
					contractOrZone: 'Affordable ATM Calls/Puts',
					telemetryRead: 'T+1 Cash Account Intraday Rotation',
					histExpectancy: '+3.6R Asymmetry',
					signalBadge: 'CASH READY ✓'
				},
				{
					ticker: 'XLF',
					contractOrZone: 'Low-Cost Sector ETF Options',
					telemetryRead: 'Multi-Day Institutional Breakout Base',
					histExpectancy: 'Zero Theta Trap',
					signalBadge: '9-TO-5 FIT ✓'
				},
				{
					ticker: 'AAPL',
					contractOrZone: 'High-Liquidity Weekly/Monthly',
					telemetryRead: 'Penny-Wide Bid/Ask • Zero Slippage',
					histExpectancy: '+4.0R Target Zone',
					signalBadge: 'A+ LIQUIDITY ✓'
				}
			]
		}
	};

	/* ===========================================================================
     6 CORE SCANNER ENGINES & INCLUDED BONUSES (UPGRADES OLD 4-CARD FEATURES)
     =========================================================================== */
	const scannerFeatures: ScannerFeatureCard[] = [
		{
			id: 'real-time-institutional-scanning',
			code: 'Engine 01 // Zero-Latency Detection',
			badge: 'Milliseconds Execution',
			title: 'Real-Time Institutional Order Flow & Options Scanning',
			platforms: 'ThinkorSwim • TradingView • Web Dashboard',
			description:
				'Scans thousands of liquid US stocks, ETFs, and options contracts in real time to detect where institutional balance sheets are accumulating or distributing before the retail breakout candle even prints.',
			traderEdge:
				'Eliminates manual chart flipping and ensures you never arrive late to a move as Wall Street’s exit liquidity.',
			iconType: 'radar'
		},
		{
			id: 'proprietary-50-plus-filters',
			code: 'Engine 02 // 50+ Institutional Criteria',
			badge: '100% Non-Repainting',
			title: 'Advanced Multi-Timeframe & Options Greeks Filtering',
			platforms: 'Pre-Configured + Fully Customizable Criteria',
			description:
				'Pre-loaded with over 50 proprietary technical, volume, and options criteria—including 18-timeframe volatility compression, Relative Volume (RVOL), IV Percentile, Delta/Theta sweet spots, and bid-ask spread tightness.',
			traderEdge:
				'Automatically strips out illiquid penny stocks, wide-spread options traps, and choppy midday noise.',
			iconType: 'filter'
		},
		{
			id: 'smart-multi-channel-alerts',
			code: 'Engine 03 // Desktop & Mobile Dispatch',
			badge: 'Instant Notifications',
			title: 'Smart Audio, Visual, Mobile App, SMS & Email Alerts',
			platforms: 'ThinkorSwim Mobile App • TradingView • SMS/Email',
			description:
				'You do not need to sit glued to six monitors to catch explosive moves. The moment a ticker meets all High Octane institutional criteria, you receive an instant alert with the exact trigger level and structural invalidation stop.',
			traderEdge:
				'Built for both full-time opening-bell scalpers and 9-to-5 working professionals checking setups from their phone.',
			iconType: 'bell'
		},
		{
			id: 'historical-expectancy-backtesting',
			code: 'Engine 04 // Quantitative Proof',
			badge: '10+ Years Data',
			title: 'On-Chart Historical Expectancy & Move Duration Analytics',
			platforms: 'Automated Per-Ticker Statistical Readout',
			description:
				'Every scan candidate is graded against 10+ years of historical price and volatility behavior—showing you the average move magnitude, average bar duration, and historical long vs. short win rate before you risk a dollar.',
			traderEdge:
				'Tells options traders the exact strike distance (Delta) and expiration window (DTE) supported by real data.',
			iconType: 'stats'
		},
		{
			id: 'small-account-and-swing-presets',
			code: 'Engine 05 // Account-Specific Presets',
			badge: '$500+ & 9-to-5 Ready',
			title: 'Dedicated $500+ Small Account & Working Pro Swing Presets',
			platforms: 'One-Click Workspace Switcher',
			description:
				'Includes built-in scan modes engineered specifically for small accounts starting at $500 (filtering by contract affordability and T+1 cash rotation) and working professionals (evening 4H/Daily conditional order scans).',
			traderEdge:
				'Ensures every setup surfaced by the scanner matches your exact account size and daily schedule.',
			iconType: 'small-cap'
		},
		{
			id: 'live-days-and-install-bonus',
			code: 'Exclusive Bonus // Fast-Track Onboarding',
			badge: 'Included Free Bonus',
			title: 'BONUS: 5 Recorded Live-Scanning Days + Step-by-Step Setup Guide',
			platforms: 'On-Demand HD Video Vault + 1-Click Import Links',
			description:
				'Import all High Octane Scanner scripts and watchlist columns into ThinkorSwim and TradingView in under 5 minutes—then watch 5 full recorded market sessions showing how Billy Ribeiro trades the scanner live.',
			traderEdge:
				'Bridges the gap between installing software and executing profitable trades with mechanical discipline.',
			iconType: 'bonus',
			isBonus: true
		}
	];

	const suitabilityColumns: SuitabilityColumn[] = [
		{
			tag: 'Profile 01 // Intraday Velocity',
			title: 'Active Day Traders & Options Scalpers',
			subtitle: 'Opening-Bell Gaps, Liquidity Sweeps & 0DTE Flow',
			bullets: [
				'Uncovers the top 3 to 5 pre-market and opening-drive stocks and ETFs by 9:15 AM ET',
				'Flags real-time institutional stop-hunts and failed retail breakouts on 1M, 5M, and 15M charts',
				'Filters strictly for deep options liquidity so you enter and exit with zero slippage'
			]
		},
		{
			tag: 'Profile 02 // Busy 9-to-5 Careers',
			title: 'Working Professionals & Swing Traders',
			subtitle: '20-Minute Evening Routine & Multi-Day Setups',
			bullets: [
				'Run the End-of-Day Swing Preset in 5 minutes after work to find 4H, Daily, and Weekly compressions',
				'Provides exact entry triggers, profit targets, and hard stops for conditional broker orders',
				'Mobile alerts notify you only when your pre-planned institutional trigger price is hit'
			]
		},
		{
			tag: 'Profile 03 // Starting at $500+ Capital',
			title: '$500+ Small Account Builders',
			subtitle: 'Affordable Contracts, Spreads & T+1 Cash Rotation',
			bullets: [
				'Automatically excludes overpriced $1,000+ options contracts that wreck small accounts',
				'Surfaces high-asymmetry 3R–5R setups ideal for T+1 cash-account daily buying power',
				'Identifies optimal candidates for defined-risk vertical debit and credit spreads'
			]
		}
	];

	const comparisonRows: ComparisonRow[] = [
		{
			criterion: 'Signal Integrity (Repainting)',
			genericScanners:
				'Uses lagging or repainted conditions that only appear after the candle has already rocketed.',
			highOctaneScanner:
				'100% Non-Repainting: Flags pre-ignition volatility compression and absorption before the breakout.'
		},
		{
			criterion: 'Options & Greeks Intelligence',
			genericScanners:
				'Scans stock price only—ignoring wide bid-ask spreads, Theta traps, and IV crush.',
			highOctaneScanner:
				'Built-in options liquidity, IV Percentile, and historical bar-duration filters for smart contract selection.'
		},
		{
			criterion: 'Small Account ($500+) Protection',
			genericScanners: 'Dumps $900 stocks or illiquid penny-stock pump-and-dumps onto your screen.',
			highOctaneScanner:
				'Dedicated $500+ Small Account Filter for affordable, liquid contracts and defined-risk spreads.'
		},
		{
			criterion: 'Wall Street Pedigree',
			genericScanners: 'Built by software marketers who do not trade live market order flow.',
			highOctaneScanner:
				'Engineered by Billy Ribeiro—mentored by Goldman Sachs prop legend Mark "Goldfinger" McGoldrick.'
		},
		{
			criterion: 'Ethical Pricing Philosophy',
			genericScanners: 'Forces $2,000+ annual software lock-ins and hidden data-feed fees.',
			highOctaneScanner:
				'People Over Profits: Accessible monthly or annual access with zero extra data-feed markups.'
		}
	];

	const memberReviews: MemberReview[] = [
		{
			quote:
				'Before the High Octane Scanner, I spent two hours every night clicking through charts and still missed the best moves. Now I run the 18-Timeframe Squeeze scan in 5 minutes and have my exact watchlist ready before work.',
			author: 'Kevin D.',
			profile: 'Working Professional & Swing Trader',
			scanModeUsed: 'Uses Mode 02: 18-Timeframe Squeeze Scan'
		},
		{
			quote:
				'The $500+ Small Account Filter saved my trading career. It keeps me completely away from overpriced contracts and illiquid garbage, surfacing clean ETF and large-cap setups that fit my cash account.',
			author: 'Natalie S.',
			profile: '$500+ Small Account Trader',
			scanModeUsed: 'Uses Mode 03: Small Account Affordable Filter'
		},
		{
			quote:
				'Having the High Octane watchlist columns running live on ThinkorSwim at the opening bell is like having a Goldman Sachs radar on my desk. It spots liquidity sweeps and RVOL explosions the second they start.',
			author: 'Brian W.',
			profile: 'Full-Time Options & Equity Day Trader',
			scanModeUsed: 'Uses Mode 01: Real-Time Options Ignition'
		},
		{
			quote:
				'Zero hype and zero repainting. Watching the 5 recorded live-market scanning days showed me exactly how Billy combines the scanner with hard stop-losses and Delta selection.',
			author: 'Mark T.',
			profile: 'SPX & Large-Cap Options Trader',
			scanModeUsed: 'Full High Octane Suite + Custom Indicators'
		}
	];

	const bottomRoomCards: RoomCta[] = [
		{
			badge: 'Live Intraday Floor',
			title: 'Day Trading Room',
			description:
				'Watch the High Octane Scanner run live on our shared screens every market morning.',
			ctaLabel: 'Learn More →',
			href: '/live-trading-rooms/day-trading-room'
		},
		{
			badge: 'Working Professionals',
			title: 'Swing Trading Room',
			description:
				'Execute the multi-day swing setups uncovered by our 18-Timeframe High Octane scans.',
			ctaLabel: 'Learn More →',
			href: '/live-trading-rooms/swing-trading-room'
		},
		{
			badge: '$500+ Starting Capital',
			title: 'Small Accounts Room',
			description: 'Trade affordable setups surfaced by our $500+ Small Account Scanner preset.',
			ctaLabel: 'Learn More →',
			href: '/live-trading-rooms/small-accounts-room'
		},
		{
			badge: '0DTE & Index Options',
			title: 'SPX Profit Pulse Alerts',
			description: 'Get real-time SPX index options alerts with exact entries, targets, and stops.',
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

	let selectedCadence = $state<CadenceType>('annual');
	let activeTerminalMode = $state<TerminalMode>('options-ignition');

	const currentTerminal = $derived(terminalModes[activeTerminalMode]);
</script>

<JsonLd schema={data.jsonLdSchema} />

<div class="app-shell">
	<Navbar />

	<main id="main-content" class="inner-page scanner-product-page">
		<!-- =========================================================================
       SECTION 1: BREADCRUMB & REAL-TIME RADAR STATUS BAR
       ========================================================================= -->
		<nav class="breadcrumb-bar" aria-label="Breadcrumb">
			<div class="container breadcrumb-bar__inner">
				<ol class="breadcrumb-list">
					<li><a href={resolve('/')}>Home</a></li>
					<li class="breadcrumb-sep" aria-hidden="true"><CaretRightIcon size={12} /></li>
					<li><a href={resolve('/store/scanners')}>Store: Scanners</a></li>
					<li class="breadcrumb-sep" aria-hidden="true"><CaretRightIcon size={12} /></li>
					<li aria-current="page">{scannerConfig.name}</li>
				</ol>
				<p class="breadcrumb-bar__member">
					<span>Already a Member?</span>
					<a href={resolve('/login' as '/')}>Sign In Here →</a>
				</p>
			</div>
		</nav>

		<!-- =========================================================================
       SECTION 2: ABOVE-THE-FOLD SPLIT HERO (12-COLUMN ASYMMETRIC LAYOUT)
       ========================================================================= -->
		<section class="hero-section" aria-labelledby="scanner-h1">
			<div class="container hero-section__grid">
				<!-- Left 7 Columns: H1, Institutional Origin Story, Cadence Toggle & CTAs -->
				<div class="hero-section__main">
					<div class="eyebrow-pill">
						<span class="eyebrow-pill__badge">{scannerConfig.eyebrowBadge}</span>
					</div>

					<h1 id="scanner-h1" class="hero-h1">
						<span class="hero-h1__kicker">{scannerConfig.seoKicker}</span>
						<span class="hero-h1__display">
							{scannerConfig.name}: {scannerConfig.heroTitle}
						</span>
					</h1>

					<div class="creator-strip">
						<img
							src={scannerConfig.creatorAvatar}
							alt={scannerConfig.creatorName}
							width="54"
							height="54"
							class="creator-strip__avatar"
						/>
						<div>
							<span class="meta-label">Engineered &amp; Traded Live By:</span>
							<strong class="creator-strip__name">{scannerConfig.creatorName}</strong>
							<span class="creator-strip__role">{scannerConfig.creatorRole}</span>
						</div>
					</div>

					<p class="lead-copy">
						{scannerConfig.heroTagline}
					</p>

					<p class="body-copy">
						<strong
							>I know how exhausting it is to spend hours clicking through charts only to buy at the
							top of an exhausted move, because I stood on the losing end myself in the past.</strong
						>
						Most retail stock screeners use lagging oscillators that only alert you after Wall Street
						algorithms have already made their money. When former Goldman Sachs proprietary trading legend
						<strong>Mark "Goldfinger" McGoldrick</strong> mentored me directly and called me
						<em>"the future of trading,"</em> I learned how institutional desks scan the tape for pre-breakout
						absorption and liquidity sweeps.
					</p>

					<p class="body-copy">
						We built the <strong>{scannerConfig.name}</strong> to put that exact institutional radar
						on your screen. It is the core scanning engine that helped us call the
						<strong>2020 COVID Top and Bottom</strong>, call the
						<strong>2022 Bull Market Top and Bear Bottom</strong>, and spot the heavy institutional
						distribution on <strong>Occidental Petroleum (OXY)</strong> where we banked
						<strong>+600% overnight on Put Options live</strong> while Warren Buffett bought
						millions long. Because <strong>we focus on PEOPLE, not making money</strong>, it is
						built to serve $500+ starter accounts, 9-to-5 working professionals, and full-time pros
						alike.
					</p>

					<!-- Cadence Selector Box (Replaces Old Hardcoded Dollar Price Box) -->
					<div class="cadence-box" aria-label="Select Scanner Membership Cadence">
						<div class="cadence-box__top">
							<span class="meta-label">Select Your Preferred Access Cadence:</span>
							<span class="cadence-box__tag">Instant Digital Setup</span>
						</div>

						<div class="cadence-toggle" role="tablist" aria-label="Billing interval toggle">
							<button
								type="button"
								role="tab"
								aria-selected={selectedCadence === 'monthly'}
								class="cadence-btn"
								class:cadence-btn--active={selectedCadence === 'monthly'}
								onclick={() => (selectedCadence = 'monthly')}
							>
								Monthly Access Cadence
							</button>
							<button
								type="button"
								role="tab"
								aria-selected={selectedCadence === 'annual'}
								class="cadence-btn"
								class:cadence-btn--active={selectedCadence === 'annual'}
								onclick={() => (selectedCadence = 'annual')}
							>
								Annual Access Cadence
								<span class="cadence-btn__badge">Most Popular</span>
							</button>
						</div>

						<p class="cadence-box__desc">
							{#if selectedCadence === 'annual'}
								<strong>Annual Institutional Access Selected:</strong> Includes full 365-day access
								to the {scannerConfig.name}, all 50+ non-repainting filters, mobile/desktop alerts,
								5 recorded live-scanning sessions, and priority setup support.
							{:else}
								<strong>Flexible Monthly Access Selected:</strong> Includes complete month-to-month
								access to the {scannerConfig.name}, all 50+ non-repainting filters, mobile/desktop
								alerts, and step-by-step installation guides.
							{/if}
						</p>

						<div class="cta-row">
							<a href={resolve('/contact' as '/')} class="btn btn--solid">
								Unlock {scannerConfig.name} ({selectedCadence === 'annual' ? 'Annual' : 'Monthly'})
								→
							</a>
							<a href="#what-you-get" class="btn btn--outline"> See Full Included Inventory ↓ </a>
						</div>
					</div>
				</div>

				<!-- Right 5 Columns: Interactive 3-Mode Scanner Terminal (Replaces Empty Placeholder) -->
				<aside
					class="terminal-sidebar"
					aria-label="Interactive High Octane Scanner Interface Preview"
				>
					<div class="terminal-card">
						<div class="terminal-card__header">
							<div>
								<span class="meta-label">Interactive Scanner Interface</span>
								<h2 class="terminal-card__title">Live {scannerConfig.name} Telemetry</h2>
							</div>
							<span class="terminal-card__status">● REAL-TIME</span>
						</div>

						<p class="terminal-card__intro">
							Click any of the three scan presets below to inspect how the {scannerConfig.name} filters
							the market in real time:
						</p>

						<div class="terminal-tabs" role="tablist" aria-label="Switch Scanner Preset Mode">
							<button
								type="button"
								role="tab"
								aria-selected={activeTerminalMode === 'options-ignition'}
								class="terminal-tab"
								class:terminal-tab--active={activeTerminalMode === 'options-ignition'}
								onclick={() => (activeTerminalMode = 'options-ignition')}
							>
								{terminalModes['options-ignition'].label}
							</button>
							<button
								type="button"
								role="tab"
								aria-selected={activeTerminalMode === 'multi-tf-squeeze'}
								class="terminal-tab"
								class:terminal-tab--active={activeTerminalMode === 'multi-tf-squeeze'}
								onclick={() => (activeTerminalMode = 'multi-tf-squeeze')}
							>
								{terminalModes['multi-tf-squeeze'].label}
							</button>
							<button
								type="button"
								role="tab"
								aria-selected={activeTerminalMode === 'small-account-filter'}
								class="terminal-tab"
								class:terminal-tab--active={activeTerminalMode === 'small-account-filter'}
								onclick={() => (activeTerminalMode = 'small-account-filter')}
							>
								{terminalModes['small-account-filter'].label}
							</button>
						</div>

						<!-- Simulated Live Scanner Output Window -->
						<div class="terminal-window">
							<div class="terminal-window__bar">
								<strong>{currentTerminal.headerTitle}</strong>
								<span>{currentTerminal.headerSub}</span>
							</div>

							<div class="terminal-table-scroll">
								<table class="terminal-table">
									<thead>
										<tr>
											<th scope="col">Ticker</th>
											<th scope="col">Structure &amp; Telemetry Read</th>
											<th scope="col">Expectancy</th>
											<th scope="col">Status</th>
										</tr>
									</thead>
									<tbody>
										{#each currentTerminal.rows as row (row.ticker)}
											<tr>
												<td class="terminal-table__symbol">{row.ticker}</td>
												<td>
													<span class="terminal-table__zone">{row.contractOrZone}</span>
													<span class="terminal-table__read">{row.telemetryRead}</span>
												</td>
												<td class="terminal-table__exp">{row.histExpectancy}</td>
												<td>
													<span class="terminal-table__pill">{row.signalBadge}</span>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>

						<!-- High-Contrast SVG Velocity Schematic -->
						<div class="terminal-svg-box" aria-hidden="true">
							<svg viewBox="0 0 380 86" class="velocity-svg">
								<rect x="6" y="6" width="368" height="18" fill="#000000" />
								<text x="14" y="18" font-size="8" font-weight="800" fill="#ffffff">
									SCANNER TRIGGER TIMING: PRE-IGNITION ABSORPTION VS. LATE RETAIL CHASE
								</text>
								<polyline
									fill="none"
									stroke="#000000"
									stroke-width="2.5"
									points="14,70 68,66 122,67 176,65 224,38 278,28 332,32 366,46"
								/>
								<circle cx="176" cy="65" r="5.5" fill="#000000" />
								<rect x="82" y="42" width="128" height="18" fill="#000000" />
								<text
									x="146"
									y="54"
									font-size="8"
									font-weight="900"
									text-anchor="middle"
									fill="#ffffff"
								>
									▲ HIGH OCTANE ALERT
								</text>
								<circle cx="278" cy="28" r="5" fill="#ffffff" stroke="#000000" stroke-width="2" />
								<text x="295" y="46" font-size="7.5" font-weight="800" fill="#333333">
									✕ Late Retail Chase
								</text>
							</svg>
						</div>
					</div>

					<!-- Quick What's Included Box -->
					<div id="what-you-get" class="benefits-sidebar-card">
						<div class="benefits-sidebar-card__header">
							<span class="meta-label">Complete Deliverable Checklist</span>
							<h3 class="benefits-sidebar-card__title">What You Get Today:</h3>
						</div>
						<ul class="benefits-sidebar-list">
							{#each scannerConfig.coreBenefits as benefit (benefit)}
								<li>
									<span class="check-mark" aria-hidden="true">✓</span>
									<span>{benefit}</span>
								</li>
							{/each}
						</ul>
					</div>
				</aside>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 3: POWERFUL INSTITUTIONAL FEATURES & BONUSES (6-CARD BENTO GRID)
       ========================================================================= -->
		<section class="features-section" aria-labelledby="features-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">Educate • Innovate • Prosper</span>
					<h2 id="features-h2" class="section-h2">
						Six Core Engines Inside the {scannerConfig.name}
					</h2>
					<p class="body-copy section-header__sub">
						Every feature is engineered to replace emotional guessing and manual chart hunting with
						cold, mathematical speed:
					</p>
				</div>

				<div class="features-grid">
					{#each scannerFeatures as feature (feature.id)}
						<article class="feature-card" class:feature-card--bonus={feature.isBonus}>
							<div>
								<div class="feature-card__top">
									<div class="feature-card__icon-box" aria-hidden="true">
										{#if feature.iconType === 'radar'}
											<svg
												viewBox="0 0 24 24"
												width="22"
												height="22"
												fill="none"
												stroke="currentColor"
												stroke-width="2.2"
											>
												<circle cx="12" cy="12" r="9" />
												<circle cx="12" cy="12" r="4" />
												<line x1="12" y1="12" x2="18.5" y2="5.5" />
											</svg>
										{:else if feature.iconType === 'filter'}
											<svg
												viewBox="0 0 24 24"
												width="22"
												height="22"
												fill="none"
												stroke="currentColor"
												stroke-width="2.2"
											>
												<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
											</svg>
										{:else if feature.iconType === 'bell'}
											<svg
												viewBox="0 0 24 24"
												width="22"
												height="22"
												fill="none"
												stroke="currentColor"
												stroke-width="2.2"
											>
												<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
												<path d="M13.73 21a2 2 0 0 1-3.46 0" />
											</svg>
										{:else if feature.iconType === 'stats'}
											<svg
												viewBox="0 0 24 24"
												width="22"
												height="22"
												fill="none"
												stroke="currentColor"
												stroke-width="2.2"
											>
												<line x1="18" y1="20" x2="18" y2="10" />
												<line x1="12" y1="20" x2="12" y2="4" />
												<line x1="6" y1="20" x2="6" y2="14" />
											</svg>
										{:else if feature.iconType === 'small-cap'}
											<svg
												viewBox="0 0 24 24"
												width="22"
												height="22"
												fill="none"
												stroke="currentColor"
												stroke-width="2.2"
											>
												<polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
												<polyline points="17 6 23 6 23 12" />
											</svg>
										{:else}
											<svg
												viewBox="0 0 24 24"
												width="22"
												height="22"
												fill="none"
												stroke="currentColor"
												stroke-width="2.2"
											>
												<polygon
													points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
												/>
											</svg>
										{/if}
									</div>
									<div class="feature-card__meta">
										<span class="meta-label">{feature.code}</span>
										<span class="feature-card__badge">{feature.badge}</span>
									</div>
								</div>

								<h3 class="feature-card__title">{feature.title}</h3>
								<p class="feature-card__platform">{feature.platforms}</p>
								<p class="feature-card__desc">{feature.description}</p>
							</div>

							<div class="feature-card__edge">
								<strong>The Trader Edge:</strong>
								{feature.traderEdge}
							</div>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 4: WHO IS THE HIGH OCTANE SCANNER BUILT FOR? (3-PILLAR MATRIX)
       ========================================================================= -->
		<section class="suitability-section" aria-labelledby="suitability-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">No Trader Left Behind • Universal Fit</span>
					<h2 id="suitability-h2" class="section-h2">
						Built Around Your Schedule, Your Experience &amp; Your Account Balance
					</h2>
					<p class="body-copy section-header__sub">
						Whether you scalp the opening bell full-time, trade swings around a 9-to-5 job, or are
						building a $500+ small account, the {scannerConfig.name} includes a dedicated preset for you:
					</p>
				</div>

				<div class="suitability-grid">
					{#each suitabilityColumns as col (col.title)}
						<article class="suitability-card">
							<span class="meta-label">{col.tag}</span>
							<h3 class="suitability-card__title">{col.title}</h3>
							<p class="suitability-card__sub">{col.subtitle}</p>
							<ul class="suitability-list">
								{#each col.bullets as item (item)}
									<li>
										<span class="check-mark" aria-hidden="true">✓</span>
										<span>{item}</span>
									</li>
								{/each}
							</ul>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 5: GENERIC RETAIL SCREENERS VS. HIGH OCTANE SCANNER (TABLE)
       ========================================================================= -->
		<section class="comparison-section" aria-labelledby="comparison-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">The Anti-Guru Standard • Hard Evidence</span>
					<h2 id="comparison-h2" class="section-h2">
						Why Generic Stock Screeners Lose Money—And How the {scannerConfig.name} Wins
					</h2>
				</div>

				<div class="table-wrapper" role="region" aria-labelledby="comparison-h2">
					<table class="comparison-table">
						<thead>
							<tr>
								<th scope="col">Evaluation Standard</th>
								<th scope="col">Generic Retail Screeners &amp; Guru Upsells</th>
								<th scope="col">Revolution Trading Pros {scannerConfig.name}</th>
							</tr>
						</thead>
						<tbody>
							{#each comparisonRows as row (row.criterion)}
								<tr>
									<th scope="row" class="comparison-table__feature">{row.criterion}</th>
									<td class="comparison-table__negative">✕ {row.genericScanners}</td>
									<td class="comparison-table__positive">✓ {row.highOctaneScanner}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 6: CHOOSE YOUR CADENCE & ENROLLMENT DOSSIER (#enroll-scanner)
       ========================================================================= -->
		<section id="enroll-scanner" class="enroll-section" aria-labelledby="enroll-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">People Over Making Money • Accessible Access</span>
					<h2 id="enroll-h2" class="section-h2">
						Ready to Start Scanning With Institutional Precision?
					</h2>
					<p class="body-copy section-header__sub">
						We keep the {scannerConfig.name} genuinely accessible so your capital stays inside your brokerage
						account where it belongs. Choose Monthly or Annual access below:
					</p>
				</div>

				<div class="packages-grid">
					<!-- Option 1: Monthly Access -->
					<article class="package-card">
						<div>
							<div class="package-card__header">
								<span class="meta-label">Option 01 // Flexible Month-to-Month</span>
								<h3 class="package-card__title">Monthly {scannerConfig.name} Access</h3>
								<p class="package-card__sub">
									Full Access to All Real-Time Scans, Watchlist Columns &amp; Mobile Alerts
								</p>
							</div>

							<ul class="package-list">
								<li>
									<span class="check-mark" aria-hidden="true">✓</span>
									<span
										><strong>Real-Time {scannerConfig.name} Suite</strong> (ThinkorSwim, TradingView &amp;
										Mobile)</span
									>
								</li>
								<li>
									<span class="check-mark" aria-hidden="true">✓</span>
									<span
										><strong>All 50+ Institutional Filters</strong> (18-TF Squeeze, Liquidity Sweeps &amp;
										RVOL)</span
									>
								</li>
								<li>
									<span class="check-mark" aria-hidden="true">✓</span>
									<span
										><strong>Dedicated $500+ Small Account &amp; 9-to-5 Swing Scan Presets</strong
										></span
									>
								</li>
								<li>
									<span class="check-mark" aria-hidden="true">✓</span>
									<span
										><strong>Instant SMS, Email &amp; Mobile App Trigger Notifications</strong
										></span
									>
								</li>
								<li>
									<span class="check-mark" aria-hidden="true">✓</span>
									<span
										><strong
											>Quick-Start 5-Minute Installation Video &amp; Workspace Templates</strong
										></span
									>
								</li>
							</ul>
						</div>

						<div class="package-card__footer">
							<a href={resolve('/contact' as '/')} class="btn btn--outline btn--full">
								Get Started With Monthly Access →
							</a>
						</div>
					</article>

					<!-- Option 2: Annual Access (Featured) -->
					<article class="package-card package-card--featured">
						<div>
							<div class="package-card__ribbon">
								Most Popular • Includes 5 Recorded Live-Scanning Days Bonus
							</div>

							<div class="package-card__header">
								<span class="meta-label">Option 02 // Full-Year Institutional Edge</span>
								<h3 class="package-card__title">Annual {scannerConfig.name} Access</h3>
								<p class="package-card__sub">
									365 Days of Uninterrupted Scanning + All Recorded Live-Market Training Bonuses
								</p>
							</div>

							<ul class="package-list">
								<li>
									<span class="check-mark" aria-hidden="true">✓</span>
									<span
										><strong>Everything Included in Monthly {scannerConfig.name} Access</strong
										></span
									>
								</li>
								<li>
									<span class="check-mark" aria-hidden="true">✓</span>
									<span
										><strong>BONUS: 5 Recorded Live-Market Scanning &amp; Execution Days</strong
										></span
									>
								</li>
								<li>
									<span class="check-mark" aria-hidden="true">✓</span>
									<span
										><strong
											>BONUS: On-Chart Historical Expectancy &amp; Move Duration Module</strong
										></span
									>
								</li>
								<li>
									<span class="check-mark" aria-hidden="true">✓</span>
									<span
										><strong
											>BONUS: Options Greeks &amp; Scanner Strike-Selection Playbook PDF</strong
										></span
									>
								</li>
								<li>
									<span class="check-mark" aria-hidden="true">✓</span>
									<span
										><strong>Priority 1-on-1 Desk Support for Custom Scan Configuration</strong
										></span
									>
								</li>
							</ul>
						</div>

						<div class="package-card__footer">
							<a href={resolve('/contact' as '/')} class="btn btn--solid btn--full">
								Get Started With Annual Access →
							</a>
						</div>
					</article>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 7: ABOUT THE CREATOR (BILLY RIBEIRO — GOLDMAN SACHS LINEAGE)
       ========================================================================= -->
		<section class="creator-section" aria-labelledby="creator-h2">
			<div class="container">
				<div class="creator-box">
					<div class="creator-box__grid">
						<div class="creator-box__left">
							<img
								src={scannerConfig.creatorAvatar}
								alt="Billy Ribeiro — Founder of Revolution Trading Pros"
								width="180"
								height="180"
								loading="lazy"
								class="creator-box__avatar"
							/>
							<span class="creator-box__seal">The Future of Trading</span>
						</div>

						<div class="creator-box__right">
							<span class="section-kicker">Wall Street Mentorship Lineage</span>
							<h2 id="creator-h2" class="section-h2">
								Engineered by Billy Ribeiro — Mentored by Goldman Sachs Legend Mark "Goldfinger"
								McGoldrick
							</h2>
							<p class="body-copy">
								Having stood on the losing end early in his trading career,
								<strong>Billy Ribeiro</strong> built Revolution Trading Pros so retail traders would never
								again be exploited by overpriced courses or fake, repainted "holy grail" software.
							</p>
							<p class="body-copy">
								Mentored directly by former Wall Street Goldman Sachs proprietary trading legend
								<strong>Mark "Goldfinger" McGoldrick</strong>—who explicitly called Billy
								<em>"the future of trading"</em>—Billy designed the
								<strong>{scannerConfig.name}</strong> to automate his signature institutional
								methodology. It is the exact radar used to call the
								<strong>2020 COVID Top and Bottom</strong>, call the
								<strong>2022 Bull Market Top and Bear Bottom</strong>, and execute a live
								<strong>+600% overnight gain on OXY Put Options</strong> opposite Warren Buffett.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 8: VERIFIED MEMBER REVIEWS + FAQ ACCORDION
       ========================================================================= -->
		<section class="reviews-faq-section" aria-labelledby="reviews-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">Verified Member Experience</span>
					<h2 id="reviews-h2" class="section-h2">
						What Traders Say About the {scannerConfig.name}
					</h2>
				</div>

				<div class="reviews-grid">
					{#each memberReviews as rev (rev.author)}
						<blockquote class="review-card">
							<p class="review-card__quote">"{rev.quote}"</p>
							<footer class="review-card__footer">
								<strong>— {rev.author}</strong>
								<span>{rev.profile}</span>
								<span class="review-card__mode">{rev.scanModeUsed}</span>
							</footer>
						</blockquote>
					{/each}
				</div>

				<!-- FAQ Accordion -->
				<div class="faq-wrapper">
					<div class="section-header">
						<span class="section-kicker">Direct Answers • Zero Evasion</span>
						<h2 id="scanner-faq-h2" class="section-h2">
							Frequently Asked Questions About the {scannerConfig.name}
						</h2>
					</div>

					<div class="faq-list">
						{#each SINGLE_SCANNER_FAQ_ITEMS as faq, idx (faq.id)}
							<details
								id={`faq-${faq.id}`}
								class="faq-item"
								name="scanner-product-faq"
								open={idx === 0}
							>
								<summary class="faq-item__question">
									<h3 class="faq-item__heading">Q: {faq.question}</h3>
									<span class="faq-item__icon" aria-hidden="true">+</span>
								</summary>
								<p class="faq-item__answer">
									<strong>A:</strong>
									{faq.answer}
								</p>
							</details>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 9: 5-CARD TRADING ROOM & ALERT ECOSYSTEM BRIDGE
       ========================================================================= -->
		<section class="pro-cta-section" aria-labelledby="pro-cta-h2">
			<div class="container">
				<div class="pro-cta-box">
					<div class="pro-cta-box__header">
						<span class="section-kicker">Educate • Innovate • Prosper</span>
						<h2 id="pro-cta-h2" class="section-h2 pro-cta-box__h2">
							Watch the {scannerConfig.name} Traded Live Every Market Day
						</h2>
						<p class="body-copy pro-cta-box__sub">
							Pair your scanner with our Live Trading Rooms or Video Watchlist Alert Services:
						</p>
					</div>

					<div class="room-cta-grid">
						{#each bottomRoomCards as card (card.href)}
							<article class="room-cta-card">
								<div>
									<span class="room-cta-card__badge">{card.badge}</span>
									<h3 class="room-cta-card__title">{card.title}</h3>
									<p class="room-cta-card__desc">{card.description}</p>
								</div>
								<a href={resolve(card.href as '/')} class="btn btn--solid btn--full">
									{card.ctaLabel}
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
