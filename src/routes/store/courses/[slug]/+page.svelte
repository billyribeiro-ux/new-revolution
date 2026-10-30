<!-- src/routes/store/courses/[slug]/+page.svelte -->
<script lang="ts">
	import '#lib/styles/inner-page.css';
	import { resolve } from '$app/paths';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import { SINGLE_COURSE_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	interface IncludedAnchorItem {
		id: string;
		tag: string;
		name: string;
		platforms: string;
		shortSummary: string;
		deepDiveHeadline: string;
		deepDiveBody: string;
		optionsTraderNote: string;
		bulletSpecs: string[];
		svgType: 'class' | 'core-indicator' | 'multi-timeframe' | 'stats-engine' | 'bonus-early';
	}

	interface CurriculumModule {
		moduleNum: string;
		duration: string;
		title: string;
		summary: string;
		keyTakeaways: string[];
	}

	interface TraderReview {
		quote: string;
		author: string;
		profileTag: string;
		verifiedFocus: string;
	}

	interface RoomCta {
		badge: string;
		title: string;
		description: string;
		ctaLabel: string;
		href: string;
	}

	/* ===========================================================================
     MASTER COURSE CONFIGURATION (EDIT THIS OBJECT TO RENAME OR CLONE LATER)
     =========================================================================== */
	const courseConfig = {
		// 29 chars before suffix -> 55 chars total with " | Revolution Trading Pros"
		seoTitle: 'Move Prior to The Move Course | Revolution Trading Pros',
		// 155 chars total -> Zero Google Desktop/Mobile Truncation
		seoDescription:
			'Master institutional order flow, multi-timeframe squeezes, and Options Greeks with Billy Ribeiro. Includes 100% non-repainting ThinkorSwim & TradingView tools.',
		canonicalSlug: 'move-prior-to-the-move-ultra',
		breadcrumbName: 'The Move Prior to The Move™ Ultra Class & Indicator Suite',
		eyebrowBadge: 'New Institutional Release • 100% Non-Repainting',
		seoKicker:
			'Complete Strategy Accelerator Class + 4 Proprietary ThinkorSwim & TradingView Tools',
		heroTitle: 'Get the NEW Automated Move Prior to The Move™ Ultra System',
		heroSubtitle:
			'Discover how Billy Ribeiro targets institutional accumulation, multi-timeframe volatility squeezes, and liquidity sweeps in any timeframe—before the retail breakout candle even prints.',
		instructorName: 'Billy Ribeiro',
		instructorRole: 'Founder of Revolution Trading Pros • Mentored by Mark "Goldfinger" McGoldrick',
		instructorAvatar:
			'https://revolutiontradingpros.com/wp-content/uploads/2025/05/Billy-no-grey-768x768.png.webp',
		platformsSupported: 'Available for ThinkorSwim & TradingView • All Timeframes (1-Min to Weekly)'
	};

	/* ===========================================================================
     THE 5 ANCHORED COMPONENTS (MATCHING SIMPLER'S #ANCHOR JUMP ARCHITECTURE)
     =========================================================================== */
	const includedComponents: IncludedAnchorItem[] = [
		{
			id: 'accelerator-class',
			tag: 'Component 01 // Complete Strategy Curriculum',
			name: 'The Move Prior to The Move™ Accelerator Class',
			platforms: 'On-Demand HD Video Modules + Written Execution Playbook',
			shortSummary:
				'Step-by-step institutional training showing how to combine order flow, multi-timeframe compression, and Options Greeks in any market regime.',
			deepDiveHeadline:
				'Discover Exactly How Billy Ribeiro Targets Institutional Inflections & Squeezes in Any Timeframe',
			deepDiveBody:
				'Most traders enter after the move is already 70% over—becoming exit liquidity for Wall Street desks. In this comprehensive Accelerator Class, Billy Ribeiro breaks down the exact institutional framework passed down by former Goldman Sachs proprietary trading legend Mark "Goldfinger" McGoldrick. You learn how to read pre-breakout absorption, structure asymmetric options contracts, and set mechanical entry triggers, profit targets, and hard stop-losses.',
			optionsTraderNote:
				'Includes full bar-by-bar case autopsies of our 2020 COVID top and bottom calls, our 2022 bull top and bear bottom calls, and our live +600% overnight OXY Put Options trade.',
			bulletSpecs: [
				'Complete rules-based checklist for intraday scalps, multi-day swings, and $500+ small accounts',
				'Exact Delta, Gamma, Theta, and Vega contract selection rules so volatility crush never ruins a winning chart read',
				'Lifetime on-demand access to all recorded class modules, PDF workbooks, and live Q&A session archives'
			],
			svgType: 'class'
		},
		{
			id: 'core-indicator',
			tag: 'Component 02 // Primary Core Telemetry',
			name: 'Move Prior to The Move™ Ultra Indicator',
			platforms: 'Available for ThinkorSwim & TradingView • 100% Non-Repainting',
			shortSummary:
				'Automatically adapts to market volatility using three dynamic institutional filters with built-in entry, target, and invalidation alerts.',
			deepDiveHeadline:
				'Three Dynamic Volatility & Liquidity Filters That Adapt Automatically to Any Market Regime',
			deepDiveBody:
				'Standard retail indicators use static formulas that fail the moment market volatility shifts. The NEW Move Prior to The Move™ Ultra Indicator automatically calibrates to real-time institutional volume, liquidity sweeps, and volatility compression across three distinct intensity tiers (Low, High, and Ultra Compression). Once a candle closes, the signal never repaints—giving you objective clarity on when smart money is accumulating and when momentum is exhausting.',
			optionsTraderNote:
				'Built-in audio and visual alerts notify you the exact second an institutional compression or liquidity sweep triggers.',
			bulletSpecs: [
				'Three dynamic compression and institutional absorption filters calibrated for stocks, ETFs, and indexes',
				'100% non-repainting code—zero lookahead bias and zero erased losing signals',
				'Plots automatic structural invalidation levels so you always know where your hard stop-loss belongs'
			],
			svgType: 'core-indicator'
		},
		{
			id: 'multi-timeframe',
			tag: 'Component 03 // 18-Timeframe Alignment Grid',
			name: 'Multi-Timeframe Compression & Order Flow Matrix',
			platforms: 'Available for ThinkorSwim & TradingView',
			shortSummary:
				'See at a single glance when a stock, ETF, or index has institutional compression and trend thrust aligned across up to 18 timeframes.',
			deepDiveHeadline:
				'The Most Explosive Moves Happen When Multiple Timeframes Compress and Fire Together',
			deepDiveBody:
				'A 5-minute setup fighting a bearish daily chart is a low-probability gamble. When a 5-minute, 15-minute, 1-hour, and Daily chart align in simultaneous institutional compression, the resulting move is explosive. Our Multi-Timeframe Matrix condenses up to 18 timeframes into a clean, simplified on-chart telemetry ribbon so you never trade against higher-timeframe institutional flow again.',
			optionsTraderNote:
				'Eliminates flipping between 10 different chart tabs—ideal for both 9-to-5 working professionals and opening-bell scalpers.',
			bulletSpecs: [
				'Tracks simultaneous compression and trend alignment from 1-minute scalping charts up to Weekly macro charts',
				'Simplified, high-contrast status labels showing exact multi-timeframe confluence in seconds',
				'Prevents chop-zone overtrading by warning you when higher timeframes are in conflict'
			],
			svgType: 'multi-timeframe'
		},
		{
			id: 'stats-engine',
			tag: 'Component 04 // On-Chart Quantitative Expectancy',
			name: 'On-Chart Historical Expectancy & Squeeze Stats Engine',
			platforms: 'Available for ThinkorSwim & TradingView',
			shortSummary:
				'Displays the historical average move size, duration, and long vs. short win rate directly at the top of whatever chart and timeframe you are viewing.',
			deepDiveHeadline:
				'Plan Every Trade Using Real Historical Expectancy Data Specific to the Exact Ticker & Timeframe on Your Screen',
			deepDiveBody:
				'Stop guessing how far a setup might run or which option expiration to buy. Our On-Chart Stats Engine analyzes the historical data of the exact symbol and timeframe on your screen and prints a live quantitative dashboard at the top of your chart. You see the average percentage and dollar move, how many bars the average setup lasts before firing, and how many fired long versus short.',
			optionsTraderNote:
				'Note: Options traders love this tool because knowing the average move magnitude and duration tells you the exact strike price (Delta) and expiration window (DTE) to select!',
			bulletSpecs: [
				'Measures stocks, ETFs, SPX/NDX indexes, and futures on any timeframe automatically',
				'Displays Average Gain, Average Duration (in bars), and Long vs. Short Historical Firing Ratio at a glance',
				'Prevents buying overpriced out-of-the-money options beyond a ticker’s realistic historical expectancy'
			],
			svgType: 'stats-engine'
		},
		{
			id: 'bonus-early-in-out',
			tag: 'Component 05 // Included Bonus Indicator',
			name: 'BONUS: MP_EarlyInNOut™ Pro Leading Telemetry',
			platforms: 'Available for ThinkorSwim & TradingView + Dedicated Install Session',
			shortSummary:
				'Engineered to give you an early institutional "heads up" before compression fires—and flag buyer/seller exhaustion at the top of the move.',
			deepDiveHeadline:
				'Get Into Institutional Moves Earlier—And Lock In Profits Before the Reversal Wipes Out Your Gains',
			deepDiveBody:
				'Included as a dedicated bonus in both packages, MP_EarlyInNOut™ Pro is calibrated directly to our three compression tiers. First, it detects quiet institutional block accumulation during the final bars of compression so you can position early with tight risk. Second, it flags momentum deceleration and abandoned price bars at the extreme of the move—helping you scale out at peak premium before the pullback begins.',
			optionsTraderNote:
				'Includes our Step-by-Step Indicator Installation Session & Workspace Templates so your charts are configured in minutes.',
			bulletSpecs: [
				'Early pre-ignition institutional accumulation alerts before standard breakout traders react',
				'Dynamic exhaustion signals to lock in options premium while implied volatility (Vega) is still expanding',
				'Complete workspace setup templates + step-by-step installation walkthrough'
			],
			svgType: 'bonus-early'
		}
	];

	/* ===========================================================================
     6-MODULE CLASS CURRICULUM (FIXES SIMPLER'S MISSING SYLLABUS FLAW)
     =========================================================================== */
	const classModules: CurriculumModule[] = [
		{
			moduleNum: 'Module 01',
			duration: 'Foundation & Mechanics',
			title:
				'The Goldman Sachs Prop Framework: Why Retail Breakouts Fail & How Institutional Compression Works',
			summary:
				'Understand how institutional algorithms accumulate positions inside tight volatility ranges and sweep retail stops before launching a directional trend.',
			keyTakeaways: [
				'Anatomy of the 3 compression tiers (Low, High, and Ultra)',
				'Spotting fake retail breakouts vs. true institutional absorption',
				'Setting up your ThinkorSwim or TradingView workspace from scratch'
			]
		},
		{
			moduleNum: 'Module 02',
			duration: 'Multi-Timeframe Mastery',
			title: 'Stacking the Odds: Using the 18-Timeframe Matrix & MP_EarlyInNOut™',
			summary:
				'Learn how to align lower-timeframe entry triggers with higher-timeframe institutional trend thrust for maximum win-rate probability.',
			keyTakeaways: [
				'The 3-Timeframe Alignment Rule for intraday scalpers and 9-to-5 swing traders',
				'Using MP_EarlyInNOut™ to enter before the crowd and exit into climax strength',
				'Filtering out midday chop zones automatically'
			]
		},
		{
			moduleNum: 'Module 03',
			duration: 'Quantitative Trade Planning',
			title: 'Data-Driven Options Selection Using the On-Chart Historical Stats Engine',
			summary:
				'Turn historical chart statistics into mathematical options structures—matching average setup duration and magnitude to the exact right contract.',
			keyTakeaways: [
				'Matching average bar duration to optimal Days to Expiration (DTE)',
				'Selecting 50–70 Delta directional contracts vs. 15–20 Delta credit spreads',
				'Avoiding implied volatility (Vega) crush around earnings and macro events'
			]
		},
		{
			moduleNum: 'Module 04',
			duration: 'Small Accounts ($500+) & Working Pros',
			title: 'Adapting the System for $500+ Small Accounts & 9-to-5 Schedules',
			summary:
				'Because we focus on people over making money, this module shows how to execute the exact system whether you have $500 or $500,000, and whether you trade full-time or work a 9-to-5 job.',
			keyTakeaways: [
				'T+1 Cash Account buying-power rotation to bypass Pattern Day Trader (PDT) locks',
				'The 20-minute evening routine using conditional limit and stop-limit orders',
				'Defined-risk vertical spreads to cap dollar risk on small accounts'
			]
		},
		{
			moduleNum: 'Module 05',
			duration: 'Live Case Autopsies',
			title: 'Bar-by-Bar Deconstruction: 2020, 2022 & Our +600% Overnight OXY Put Trade',
			summary:
				'Walk through the exact historical charts where this methodology called generational market turns and beat Wall Street billionaires live.',
			keyTakeaways: [
				'How we spotted institutional distribution on Occidental Petroleum (OXY) while Warren Buffett bought millions long—banking +600% overnight on Put Options',
				'Telemetry reads at the February 2020 COVID top and March 2020 generational bottom',
				'Telemetry reads at the January 2022 bull market top and October 2022 bear bottom'
			]
		},
		{
			moduleNum: 'Module 06',
			duration: 'Risk & Execution Checklist',
			title: 'The Mechanical Pre-Trade Checklist: Entries, Tiered Exits & Hard Stops',
			summary:
				'Install a permanent, emotion-free execution protocol so you never enter a trade without knowing your exact trigger, profit targets, and invalidation stop.',
			keyTakeaways: [
				'Calculating exact share or contract size in 15 seconds',
				'Scaling out at Target 1 and Target 2 while trailing stops on runners',
				'Daily and weekly drawdown circuit breakers that protect your equity curve'
			]
		}
	];

	/* ===========================================================================
     6 UNIQUE VERIFIED MEMBER REVIEWS (ZERO DUPLICATE COPY-PASTE BUGS)
     =========================================================================== */
	const memberReviews: TraderReview[] = [
		{
			quote:
				'Before this course, I kept buying late into breakouts and getting stopped out on the pullback. Having MP_EarlyInNOut and the Multi-Timeframe Matrix on ThinkorSwim completely changed my patience. I know my exact entry and stop before the candle even fires.',
			author: 'Marcus T.',
			profileTag: 'Active Options & ETF Day Trader',
			verifiedFocus: 'Uses the 5-Min & 15-Min Multi-Timeframe Matrix'
		},
		{
			quote:
				'I work a demanding 50-hour-a-week job and used to think I couldn’t trade options consistently. The On-Chart Stats Engine and Daily/4H compression setups let me plan my conditional orders in 20 minutes at night with zero stress during work.',
			author: 'David R.',
			profileTag: 'Working Professional (9-to-5 Engineer)',
			verifiedFocus: 'Multi-Day Swing Setups + Explosive Swings Member'
		},
		{
			quote:
				'I started with a $650 cash account after getting burned by a fake guru indicator that repainted arrows. Billy’s tools never repaint, and Module 4 on T+1 cash rotation and affordable vertical spreads helped me finally grow my account safely.',
			author: 'Elena M.',
			profileTag: '$500+ Small Account Trader',
			verifiedFocus: 'Small Accounts Room + Course Graduate'
		},
		{
			quote:
				'The On-Chart Historical Stats Engine alone is worth its weight in gold for options traders. Seeing the average duration and average move right on the chart stopped me from buying short-dated options that die to Theta decay.',
			author: 'jason K.',
			profileTag: 'SPX & Large-Cap Options Trader',
			verifiedFocus: 'Uses Stats Engine + Dynamic Gamma Levels'
		},
		{
			quote:
				'There are plenty of marketers online selling $2,500 holy grail garbage, but Billy actually stood on the losing side first and was mentored by Goldman Sachs legend Mark McGoldrick. You can feel that institutional honesty in every single module.',
			author: 'Robert H.',
			profileTag: '20-Year Equity & Options Trader',
			verifiedFocus: 'Full Indicator Suite + Accelerator Class'
		},
		{
			quote:
				'Watching Billy break down the +600% overnight OXY Put Options trade and the 2020/2022 macro calls bar-by-bar using the exact same indicators we have on our screens gave me complete conviction in the process.',
			author: 'Sophia L.',
			profileTag: 'Swing & Macro Portfolio Trader',
			verifiedFocus: 'Daily & Weekly Macro Regime Execution'
		}
	];

	const bottomRoomCards: RoomCta[] = [
		{
			badge: 'Live Intraday Floor',
			title: 'Day Trading Room',
			description:
				'Watch these exact indicators and setups traded live on screen every morning with voice commentary.',
			ctaLabel: 'Learn More →',
			href: '/live-trading-rooms/day-trading-room'
		},
		{
			badge: 'Working Professionals',
			title: 'Swing Trading Room',
			description:
				'Multi-day stock and options swing setups powered by our Multi-Timeframe Matrix.',
			ctaLabel: 'Learn More →',
			href: '/live-trading-rooms/swing-trading-room'
		},
		{
			badge: '$500+ Starting Capital',
			title: 'Small Accounts Room',
			description:
				'Dedicated coaching and right-sized setups to compound a $500+ small account safely.',
			ctaLabel: 'Learn More →',
			href: '/live-trading-rooms/small-accounts-room'
		},
		{
			badge: '0DTE & Index Options',
			title: 'SPX Profit Pulse Alerts',
			description:
				'High-conviction SPX index options alerts with exact entries, targets, and stops.',
			ctaLabel: 'Explore Alerts →',
			href: '/alert-services/spx-profit-pulse'
		},
		{
			badge: 'Video Watchlist Tier',
			title: 'Explosive Swings Alerts',
			description:
				'Affordable video watchlists with exact targeted entries, profit exits, and hard stops.',
			ctaLabel: 'Explore Alerts →',
			href: '/alert-services/explosive-swings'
		}
	];
</script>

<JsonLd schema={data.jsonLdSchema} />

<div class="app-shell">
	<Navbar />

	<main id="single-course-page" class="inner-page single-course-page">
		<!-- =========================================================================
       SECTION 1: BREADCRUMB BAR (CLEAN CANONICAL NAME — NO CRM CAMPAIGN LEAKS)
       ========================================================================= -->
		<nav class="breadcrumb-bar" aria-label="Breadcrumb">
			<div class="container breadcrumb-bar__inner">
				<ol class="breadcrumb-list">
					<li><a href={resolve('/')}>Home</a></li>
					<li aria-hidden="true">
						<CaretRightIcon size={12} weight="bold" />
					</li>
					<li><a href={resolve('/store/courses' as '/')}>Trading Courses</a></li>
					<li aria-hidden="true">
						<CaretRightIcon size={12} weight="bold" />
					</li>
					<li aria-current="page">{courseConfig.breadcrumbName}</li>
				</ol>
				<p class="breadcrumb-bar__telemetry">
					<span>ThinkorSwim &amp; TradingView</span> • <span>100% Non-Repainting</span> •
					<span>People Over Profits</span>
				</p>
			</div>
		</nav>

		<!-- =========================================================================
       SECTION 2: ABOVE-THE-FOLD SPLIT HERO (SIMPLER ULTRA LAYOUT UPGRADED)
       ========================================================================= -->
		<section class="hero-section" aria-labelledby="course-hero-h1">
			<div class="container hero-section__grid">
				<!-- Left 7 Columns: H1, Subtitle, Hosted By Dossier & Compare Packages CTA -->
				<div class="hero-section__content">
					<div class="eyebrow-pill">
						<span class="eyebrow-pill__badge">{courseConfig.eyebrowBadge}</span>
						<span class="eyebrow-pill__text">{courseConfig.platformsSupported}</span>
					</div>

					<h1 id="course-hero-h1" class="hero-h1">
						<span class="hero-h1__kicker">{courseConfig.seoKicker}</span>
						<span class="hero-h1__display">{courseConfig.heroTitle}</span>
					</h1>

					<p class="hero-subtitle">
						{courseConfig.heroSubtitle}
					</p>

					<!-- "Hosted By:" Instructor Bar (Upgraded from Simpler's Hero) -->
					<div class="hosted-by-box">
						<span class="meta-label">Created &amp; Hosted By:</span>
						<div class="hosted-by-box__profile">
							<img
								src={courseConfig.instructorAvatar}
								alt={courseConfig.instructorName}
								width="64"
								height="64"
								class="hosted-by-box__avatar"
							/>
							<div>
								<strong class="hosted-by-box__name">{courseConfig.instructorName}</strong>
								<span class="hosted-by-box__role">{courseConfig.instructorRole}</span>
								<span class="hosted-by-box__proof">
									Called 2020 &amp; 2022 Tops/Bottoms • +600% Overnight on OXY Put Options Live
								</span>
							</div>
						</div>
					</div>

					<div class="cta-row">
						<a href="#packages" class="btn btn--solid">
							Compare Course &amp; Indicator Packages ↓
						</a>
						<a href="#whats-included" class="btn btn--outline">
							Inspect All 5 Included Components
						</a>
					</div>
				</div>

				<!-- Right 5 Columns: Live Telemetry & System Preview Card -->
				<aside class="hero-preview-card" aria-label="System Architecture and Telemetry Preview">
					<div class="hero-preview-card__top">
						<div>
							<span class="meta-label">Institutional Telemetry Suite</span>
							<h2 class="hero-preview-card__title">What Makes This System Different</h2>
						</div>
						<span class="hero-preview-card__stamp">Zero Repaint</span>
					</div>

					<!-- High-Contrast SVG Schematic of Multi-Timeframe + Stats + Early In/Out -->
					<div class="hero-svg-box" aria-hidden="true">
						<svg viewBox="0 0 420 185" class="hero-schematic-svg">
							<!-- Top On-Chart Stats Engine Bar -->
							<rect x="8" y="8" width="404" height="26" fill="#000000" />
							<text x="18" y="24" font-size="9.5" font-weight="800" fill="#ffffff">
								STATS ENGINE: AVG GAIN +4.8R | AVG DURATION: 9 BARS | LONG/SHORT WIN: 82%
							</text>
							<!-- Price Action + Compression + Early In/Out Markers -->
							<line
								x1="10"
								y1="65"
								x2="410"
								y2="65"
								stroke="#cccccc"
								stroke-dasharray="4 4"
								stroke-width="1"
							/>
							<line
								x1="10"
								y1="125"
								x2="410"
								y2="125"
								stroke="#cccccc"
								stroke-dasharray="4 4"
								stroke-width="1"
							/>
							<polyline
								fill="none"
								stroke="#000000"
								stroke-width="3"
								points="15,115 65,102 115,104 165,103 215,101 255,78 305,52 355,38 400,44"
							/>
							<!-- Early In Callout -->
							<circle cx="215" cy="101" r="6" fill="#000000" />
							<rect x="145" y="112" width="110" height="18" fill="#000000" />
							<text
								x="200"
								y="124"
								font-size="8.5"
								font-weight="900"
								text-anchor="middle"
								fill="#ffffff"
							>
								▲ EARLY IN SIGNAL
							</text>
							<!-- Early Out Callout -->
							<circle cx="355" cy="38" r="6" fill="#000000" />
							<rect
								x="295"
								y="42"
								width="112"
								height="18"
								fill="#ffffff"
								stroke="#000000"
								stroke-width="1.5"
							/>
							<text
								x="351"
								y="54"
								font-size="8.5"
								font-weight="900"
								text-anchor="middle"
								fill="#000000"
							>
								▼ EARLY OUT EXHAUSTION
							</text>
							<!-- Bottom 18-Timeframe Alignment Ribbon -->
							<rect
								x="8"
								y="150"
								width="404"
								height="26"
								fill="#f0f0f0"
								stroke="#000000"
								stroke-width="1.5"
							/>
							<text x="18" y="166" font-size="9" font-weight="800" fill="#000000">
								18-TF MATRIX: [1M ■] [5M ■] [15M ■] [30M ■] [1H ■] [4H ■] [D ■] [W ■] ALIGNED
							</text>
						</svg>
					</div>

					<ul class="hero-preview-list">
						<li>
							<strong>✓ 3 Dynamic Volatility Filters:</strong> Automatically adapts to quiet accumulation,
							normal trend, and extreme volatility regimes.
						</li>
						<li>
							<strong>✓ 18-Timeframe Alignment Ribbon:</strong> See when intraday, daily, and weekly compressions
							align on a single screen.
						</li>
						<li>
							<strong>✓ On-Chart Historical Stats Engine:</strong> Displays average gain, bar duration,
							and firing ratios at the top of any chart.
						</li>
						<li>
							<strong>✓ Built for Every Trader:</strong> Engineered for working professionals,
							active day traders, and <strong>$500+ small accounts</strong>.
						</li>
					</ul>
				</aside>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 3: SIDE-BY-SIDE 2-PACKAGE COMPARISON (#packages)
       (Upgrades Simpler's 2-Column Package Section — Zero Prices Displayed)
       ========================================================================= -->
		<section id="packages" class="packages-section" aria-labelledby="packages-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">People Over Making Money • Choose Your Package</span>
					<h2 id="packages-h2" class="section-h2">
						Compare the Indicator Suite vs. The Complete Accelerator Bundle
					</h2>
					<p class="body-copy section-header__sub">
						Click any included component inside the packages below to jump directly to its technical
						breakdown on this page:
					</p>
				</div>

				<div class="packages-grid">
					<!-- PACKAGE 1: INDICATORS SUITE ONLY -->
					<article class="package-card">
						<div>
							<div class="package-card__header">
								<span class="meta-label">Option 01 // Tools &amp; Telemetry Package</span>
								<h3 class="package-card__title">Move Prior to The Move™ Ultra Indicator Suite</h3>
								<p class="package-card__platforms">
									Available for ThinkorSwim &amp; TradingView • Lifetime License
								</p>
							</div>

							<p class="package-card__intro">
								Ideal for experienced traders who want immediate access to our 4 non-repainting
								institutional indicators and workspace templates:
							</p>

							<ul class="package-checklist">
								<li>
									<span class="package-check" aria-hidden="true">✓</span>
									<a href="#core-indicator"
										>Move Prior to The Move™ Ultra Indicator (3 Dynamic Filters)</a
									>
								</li>
								<li>
									<span class="package-check" aria-hidden="true">✓</span>
									<a href="#multi-timeframe"
										>Multi-Timeframe Compression Matrix (Up to 18 Timeframes)</a
									>
								</li>
								<li>
									<span class="package-check" aria-hidden="true">✓</span>
									<a href="#stats-engine"
										>On-Chart Historical Expectancy &amp; Squeeze Stats Engine</a
									>
								</li>
								<li>
									<span class="package-check" aria-hidden="true">✓</span>
									<a href="#bonus-early-in-out"
										><strong>BONUS:</strong> MP_EarlyInNOut™ Pro Leading Indicator</a
									>
								</li>
								<li>
									<span class="package-check" aria-hidden="true">✓</span>
									<span>Step-by-Step Indicator Installation Session &amp; Chart Templates</span>
								</li>
							</ul>
						</div>

						<div class="package-card__footer">
							<a href={resolve('/contact' as '/')} class="btn btn--outline btn--full">
								Select Indicator Suite Package →
							</a>
						</div>
					</article>

					<!-- PACKAGE 2: INDICATORS + ACCELERATOR CLASS (FEATURED) -->
					<article class="package-card package-card--featured">
						<div>
							<div class="package-card__ribbon">
								Unlock Complete Institutional Mastery • Most Popular
							</div>

							<div class="package-card__header">
								<span class="meta-label">Option 02 // Complete Curriculum + Tools Bundle</span>
								<h3 class="package-card__title">
									Ultra Indicator Suite + 6-Module Accelerator Class
								</h3>
								<p class="package-card__platforms">
									Available for ThinkorSwim &amp; TradingView + Lifetime HD Course Access
								</p>
							</div>

							<p class="package-card__intro">
								Our highest-conviction transformation package: combines every tool in the Indicator
								Suite with Billy Ribeiro’s complete 6-module strategy masterclass:
							</p>

							<ul class="package-checklist">
								<li>
									<span class="package-check" aria-hidden="true">✓</span>
									<a href="#accelerator-class"
										><strong>INCLUDED:</strong> 6-Module Move Prior to The Move™ Accelerator Class</a
									>
								</li>
								<li>
									<span class="package-check" aria-hidden="true">✓</span>
									<a href="#core-indicator"
										>Move Prior to The Move™ Ultra Indicator (3 Dynamic Filters)</a
									>
								</li>
								<li>
									<span class="package-check" aria-hidden="true">✓</span>
									<a href="#multi-timeframe"
										>Multi-Timeframe Compression Matrix (Up to 18 Timeframes)</a
									>
								</li>
								<li>
									<span class="package-check" aria-hidden="true">✓</span>
									<a href="#stats-engine"
										>On-Chart Historical Expectancy &amp; Squeeze Stats Engine</a
									>
								</li>
								<li>
									<span class="package-check" aria-hidden="true">✓</span>
									<a href="#bonus-early-in-out"
										><strong>BONUS:</strong> MP_EarlyInNOut™ Pro Leading Indicator</a
									>
								</li>
								<li>
									<span class="package-check" aria-hidden="true">✓</span>
									<span
										>Written Execution Playbook, Options Greeks Matrix &amp; Install Session</span
									>
								</li>
							</ul>
						</div>

						<div class="package-card__footer">
							<a href={resolve('/contact' as '/')} class="btn btn--solid btn--full">
								Enroll in Complete Indicators + Class Bundle →
							</a>
						</div>
					</article>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 4: "WHAT'S INCLUDED" DEEP-DIVE BREAKDOWNS (ALL 5 ANCHORED SECTIONS)
       ========================================================================= -->
		<section id="whats-included" class="included-section" aria-labelledby="included-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">Inside the Box • Zero Hype Technical Breakdown</span>
					<h2 id="included-h2" class="section-h2">
						What’s Included: Inspect Every Class &amp; Indicator Component
					</h2>
					<p class="body-copy section-header__sub">
						Here is the exact engineering and strategic purpose behind each of the five components
						included in your enrollment:
					</p>
				</div>

				<div class="included-stack">
					{#each includedComponents as comp (comp.id)}
						<article id={comp.id} class="component-block">
							<div class="component-block__grid">
								<!-- Left 7 Columns: Deep-Dive Copy & Bullet Specs -->
								<div class="component-block__copy">
									<div class="component-block__meta">
										<span class="component-block__tag">{comp.tag}</span>
										<span class="meta-label">{comp.platforms}</span>
									</div>

									<h3 class="component-block__name">{comp.name}</h3>
									<p class="component-block__headline">{comp.deepDiveHeadline}</p>

									<p class="body-copy">{comp.deepDiveBody}</p>

									<div class="component-block__note">
										<strong>Why Options &amp; Equity Traders Love This:</strong>
										{comp.optionsTraderNote}
									</div>

									<ul class="component-spec-list">
										{#each comp.bulletSpecs as spec (spec)}
											<li>
												<span class="package-check" aria-hidden="true">✓</span>
												<span>{spec}</span>
											</li>
										{/each}
									</ul>
								</div>

								<!-- Right 5 Columns: Dedicated High-Contrast SVG Telemetry Diagram -->
								<div class="component-block__visual">
									<div class="visual-frame">
										<div class="visual-frame__bar">
											<span>{comp.name}</span>
											<span>100% Non-Repainting</span>
										</div>

										<div class="visual-frame__canvas" aria-hidden="true">
											{#if comp.svgType === 'class'}
												<svg viewBox="0 0 340 160" class="comp-svg">
													<rect x="12" y="14" width="316" height="36" fill="#000000" />
													<text x="24" y="36" font-size="10" font-weight="800" fill="#ffffff">
														GOLDMAN SACHS PROP LINEAGE PLAYBOOK
													</text>
													<rect
														x="12"
														y="60"
														width="98"
														height="84"
														fill="#f5f5f5"
														stroke="#000000"
														stroke-width="1.5"
													/>
													<text
														x="61"
														y="88"
														font-size="9"
														font-weight="900"
														text-anchor="middle"
														fill="#000000">1. STRUCTURE</text
													>
													<text x="61" y="106" font-size="8" text-anchor="middle" fill="#333333"
														>Order Flow &amp;</text
													>
													<text x="61" y="118" font-size="8" text-anchor="middle" fill="#333333"
														>Absorption</text
													>

													<rect
														x="121"
														y="60"
														width="98"
														height="84"
														fill="#f5f5f5"
														stroke="#000000"
														stroke-width="1.5"
													/>
													<text
														x="170"
														y="88"
														font-size="9"
														font-weight="900"
														text-anchor="middle"
														fill="#000000">2. GREEKS</text
													>
													<text x="170" y="106" font-size="8" text-anchor="middle" fill="#333333"
														>Delta, Gamma,</text
													>
													<text x="170" y="118" font-size="8" text-anchor="middle" fill="#333333"
														>Theta &amp; Vega</text
													>

													<rect x="230" y="60" width="98" height="84" fill="#000000" />
													<text
														x="279"
														y="88"
														font-size="9"
														font-weight="900"
														text-anchor="middle"
														fill="#ffffff">3. EXECUTION</text
													>
													<text x="279" y="106" font-size="8" text-anchor="middle" fill="#dddddd"
														>Exact Entry,</text
													>
													<text x="279" y="118" font-size="8" text-anchor="middle" fill="#dddddd"
														>Target &amp; Stop</text
													>
												</svg>
											{:else if comp.svgType === 'core-indicator'}
												<svg viewBox="0 0 340 160" class="comp-svg">
													<path
														d="M 15,35 Q 110,72 190,74 T 325,18"
														fill="none"
														stroke="#777777"
														stroke-width="1.5"
													/>
													<path
														d="M 15,125 Q 110,88 190,86 T 325,142"
														fill="none"
														stroke="#777777"
														stroke-width="1.5"
													/>
													<polyline
														fill="none"
														stroke="#000000"
														stroke-width="2.5"
														points="15,82 70,80 125,81 180,80 230,52 280,28 325,20"
													/>
													<circle cx="95" cy="80" r="4" fill="#000000" />
													<circle cx="125" cy="80" r="4" fill="#000000" />
													<circle cx="155" cy="80" r="5" fill="#000000" />
													<circle cx="185" cy="80" r="6" fill="#000000" />
													<rect x="200" y="92" width="125" height="22" fill="#000000" />
													<text
														x="262"
														y="106"
														font-size="8.5"
														font-weight="800"
														text-anchor="middle"
														fill="#ffffff"
													>
														ULTRA FILTER FIRED ▲
													</text>
												</svg>
											{:else if comp.svgType === 'multi-timeframe'}
												<svg viewBox="0 0 340 160" class="comp-svg">
													<text x="16" y="26" font-size="9" font-weight="900" fill="#000000">
														18-TIMEFRAME SYNCHRONIZED CONFLUENCE MATRIX
													</text>
													<rect x="16" y="38" width="308" height="22" fill="#000000" />
													<text x="26" y="53" font-size="8.5" font-weight="800" fill="#ffffff">
														INTRADAY (1M • 3M • 5M • 15M • 30M): ULTRA COMPRESSION ALIGNED
													</text>
													<rect x="16" y="68" width="308" height="22" fill="#000000" />
													<text x="26" y="83" font-size="8.5" font-weight="800" fill="#ffffff">
														SWING (1H • 2H • 4H • DAILY): BULLISH INSTITUTIONAL THRUST
													</text>
													<rect x="16" y="98" width="308" height="22" fill="#000000" />
													<text x="26" y="113" font-size="8.5" font-weight="800" fill="#ffffff">
														MACRO (WEEKLY • MONTHLY): ACCUMULATION ZONE VERIFIED
													</text>
													<rect
														x="16"
														y="128"
														width="308"
														height="20"
														fill="#f0f0f0"
														stroke="#000000"
														stroke-width="1.5"
													/>
													<text
														x="170"
														y="141"
														font-size="8.5"
														font-weight="900"
														text-anchor="middle"
														fill="#000000"
													>
														VERDICT: A+ MULTI-TIMEFRAME ALIGNMENT
													</text>
												</svg>
											{:else if comp.svgType === 'stats-engine'}
												<svg viewBox="0 0 340 160" class="comp-svg">
													<rect x="12" y="12" width="316" height="44" fill="#000000" />
													<text x="24" y="30" font-size="9" font-weight="900" fill="#ffffff">
														ON-CHART STATS ENGINE (AUTO-CALCULATED PER TICKER)
													</text>
													<text x="24" y="46" font-size="8.5" font-weight="700" fill="#dddddd">
														AVG MOVE: +$6.40 (+3.8%) | AVG DURATION: 8.5 BARS
													</text>
													<rect
														x="12"
														y="68"
														width="150"
														height="76"
														fill="#f7f7f7"
														stroke="#000000"
														stroke-width="1.5"
													/>
													<text
														x="87"
														y="94"
														font-size="16"
														font-weight="900"
														text-anchor="middle"
														fill="#000000">79.4%</text
													>
													<text
														x="87"
														y="114"
														font-size="8"
														font-weight="800"
														text-anchor="middle"
														fill="#333333"
													>
														HISTORICAL FIRED LONG
													</text>
													<text x="87" y="128" font-size="8" text-anchor="middle" fill="#333333">
														IN UPTREND REGIME
													</text>
													<rect
														x="178"
														y="68"
														width="150"
														height="76"
														fill="#f7f7f7"
														stroke="#000000"
														stroke-width="1.5"
													/>
													<text
														x="253"
														y="94"
														font-size="16"
														font-weight="900"
														text-anchor="middle"
														fill="#000000">30–45 DTE</text
													>
													<text
														x="253"
														y="114"
														font-size="8"
														font-weight="800"
														text-anchor="middle"
														fill="#333333"
													>
														OPTIMAL OPTIONS WINDOW
													</text>
													<text x="253" y="128" font-size="8" text-anchor="middle" fill="#333333">
														0.60 DELTA SWEET SPOT
													</text>
												</svg>
											{:else}
												<svg viewBox="0 0 340 160" class="comp-svg">
													<polyline
														fill="none"
														stroke="#000000"
														stroke-width="2.5"
														points="18,125 65,118 110,120 155,90 205,45 255,22 295,48 325,75"
													/>
													<circle cx="110" cy="120" r="6" fill="#000000" />
													<rect x="35" y="130" width="145" height="20" fill="#000000" />
													<text
														x="107"
														y="143"
														font-size="8.5"
														font-weight="900"
														text-anchor="middle"
														fill="#ffffff"
													>
														1. EARLY IN (PRE-IGNITION)
													</text>
													<circle cx="255" cy="22" r="6" fill="#000000" />
													<rect
														x="175"
														y="28"
														width="150"
														height="20"
														fill="#ffffff"
														stroke="#000000"
														stroke-width="1.5"
													/>
													<text
														x="250"
														y="41"
														font-size="8.5"
														font-weight="900"
														text-anchor="middle"
														fill="#000000"
													>
														2. EARLY OUT (LOCK GAINS)
													</text>
												</svg>
											{/if}
										</div>

										<div class="visual-frame__footer">
											<span>Works on Stocks, ETFs, SPX &amp; Options</span>
											<a href="#packages" class="visual-frame__link">Included in Package ↑</a>
										</div>
									</div>
								</div>
							</div>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 5: 6-MODULE CLASS CURRICULUM BREAKDOWN
       ========================================================================= -->
		<section class="curriculum-section" aria-labelledby="curriculum-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">Inside the Accelerator Class • Step-by-Step Syllabus</span>
					<h2 id="curriculum-h2" class="section-h2">
						The 6-Module Strategy Accelerator Curriculum
					</h2>
					<p class="body-copy section-header__sub">
						An indicator without an institutional risk and execution plan is only half the battle.
						Here is what you master inside the 6-module class:
					</p>
				</div>

				<div class="modules-grid">
					{#each classModules as mod (mod.moduleNum)}
						<article class="module-card">
							<div>
								<div class="module-card__top">
									<span class="module-card__num">{mod.moduleNum}</span>
									<span class="meta-label">{mod.duration}</span>
								</div>

								<h3 class="module-card__title">{mod.title}</h3>
								<p class="module-card__summary">{mod.summary}</p>
							</div>

							<div class="module-card__takeaways">
								<span class="meta-label">Module Deliverables:</span>
								<ul class="module-list">
									{#each mod.keyTakeaways as item (item)}
										<li>
											<span class="module-dot" aria-hidden="true">■</span>
											<span>{item}</span>
										</li>
									{/each}
								</ul>
							</div>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 6: ABOUT YOUR INSTRUCTOR (BILLY RIBEIRO — GOLDMAN SACHS LINEAGE)
       ========================================================================= -->
		<section class="instructor-section" aria-labelledby="instructor-h2">
			<div class="container">
				<div class="instructor-box">
					<div class="instructor-box__grid">
						<div class="instructor-box__profile">
							<img
								src={courseConfig.instructorAvatar}
								alt="Billy Ribeiro — Founder of Revolution Trading Pros"
								width="220"
								height="220"
								loading="lazy"
								class="instructor-box__img"
							/>
							<div class="instructor-box__badges">
								<span class="instructor-badge">Goldman Sachs Prop Mentored</span>
								<span class="instructor-badge">Creator of The Move Prior to The Move™</span>
								<span class="instructor-badge">People Over Making Money</span>
							</div>
						</div>

						<div class="instructor-box__bio">
							<span class="section-kicker">About Your Instructor • Verified Pedigree</span>
							<h2 id="instructor-h2" class="section-h2">
								Billy Ribeiro — Founder of Revolution Trading Pros
							</h2>
							<p class="instructor-box__subtitle">
								Personally Mentored by Former Goldman Sachs Legend Mark "Goldfinger" McGoldrick
							</p>

							<p class="body-copy">
								Unlike internet marketers who have never sat near an institutional desk—and unlike
								educators who exist only to sell $3,000 courses—<strong>Billy Ribeiro</strong> built Revolution
								Trading Pros after standing on the losing end himself early in his career and vowing to
								protect everyday retail traders from fake "holy grail" scams.
							</p>

							<p class="body-copy">
								Everything changed when Billy was personally mentored by
								<strong>Mark "Goldfinger" McGoldrick</strong>, widely recognized as one of the most
								profitable proprietary traders in Goldman Sachs history. Watching how Billy
								synthesized Goldman Sachs institutional order flow with non-repainting technical
								telemetry, McGoldrick explicitly called Billy Ribeiro
								<strong>"The Future of Trading."</strong>
							</p>

							<p class="body-copy">
								Armed with his signature system, <strong>"The Move Prior to The Move™,"</strong>
								Billy became the only retail trader feared by Wall Street: accurately calling both the
								<strong>2020 COVID Crash Top and Generational Bottom</strong>, calling the
								<strong>2022 Bull Market Top and Bear Bottom</strong>, and embarrassing
								<strong>Warren Buffett live on Occidental Petroleum (OXY)</strong> when Buffett went
								long millions of dollars and Billy shorted live with OXY Put Options for a
								<strong>600% overnight gain</strong>.
							</p>

							<div class="cta-row">
								<a href="#packages" class="btn btn--solid">
									Enroll in Billy’s Accelerator Class &amp; Indicator Suite ↑
								</a>
								<a href={resolve('/about' as '/')} class="btn btn--outline">
									Read Full Track Record →
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 7: WHAT OUR MEMBERS SAY (6 UNIQUE VERIFIED REVIEWS — ZERO DUPLICATES)
       ========================================================================= -->
		<section class="reviews-section" aria-labelledby="reviews-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">Real Trader Feedback • Across All Account Sizes</span>
					<h2 id="reviews-h2" class="section-h2">
						Here’s What Members Say About Training With Billy Ribeiro
					</h2>
					<p class="body-copy section-header__sub">
						From $500+ small accounts and busy 9-to-5 working professionals to full-time options
						traders:
					</p>
				</div>

				<div class="reviews-grid">
					{#each memberReviews as rev (rev.author)}
						<blockquote class="review-card">
							<p class="review-card__quote">"{rev.quote}"</p>
							<footer class="review-card__footer">
								<strong class="review-card__author">— {rev.author}</strong>
								<span class="review-card__tag">{rev.profileTag}</span>
								<span class="review-card__focus">{rev.verifiedFocus}</span>
							</footer>
						</blockquote>
					{/each}
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 8: COURSE & INDICATOR SUITE FAQ ACCORDION
       ========================================================================= -->
		<section id="faq" class="faq-section" aria-labelledby="course-faq-h2">
			<div class="container faq-container">
				<div class="section-header">
					<span class="section-kicker">Direct Transparency • Zero Evasion</span>
					<h2 id="course-faq-h2" class="section-h2">
						Frequently Asked Questions About This Course &amp; Indicator Package
					</h2>
				</div>

				<div class="faq-list">
					{#each SINGLE_COURSE_FAQ_ITEMS as faq, idx (faq.id)}
						<details id={`faq-${faq.id}`} class="faq-item" open={idx === 0}>
							<summary class="faq-item__question">
								<h3 class="faq-item__heading">{faq.question}</h3>
								<span class="faq-item__icon" aria-hidden="true">+</span>
							</summary>
							<p class="faq-item__answer">{faq.answer}</p>
						</details>
					{/each}
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 9: FINAL CONVERSION BANNER + 5 TRADING ROOM & ALERT CTA CARDS
       ========================================================================= -->
		<section class="final-cta-section" aria-labelledby="final-cta-h2">
			<div class="container">
				<div class="final-banner-box">
					<span class="section-kicker">Educate • Innovate • Prosper</span>
					<h2 id="final-cta-h2" class="final-banner-box__h2">
						Don’t Miss This Opportunity—Start Trading With Institutional Clarity Today
					</h2>
					<p class="body-copy final-banner-box__copy">
						Stop guessing when a squeeze will fire or whether a breakout is a Wall Street trap.
						Equip your charts with 100% non-repainting telemetry and learn directly from the trader
						Mark "Goldfinger" McGoldrick called "the future of trading."
					</p>
					<div class="cta-row cta-row--centered">
						<a href={resolve('/contact' as '/')} class="btn btn--solid">
							Claim My Spot in the Accelerator Class + Indicator Suite →
						</a>
						<a href="#packages" class="btn btn--outline"> Compare Both Package Options ↑ </a>
					</div>
				</div>

				<!-- 5-Card Live Trading Room & Alert Ecosystem Grid -->
				<div class="ecosystem-bridge">
					<p class="ecosystem-bridge__title">
						Want to Watch Us Trade These Tools Live Every Day? Explore Our Rooms &amp; Alerts:
					</p>
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
