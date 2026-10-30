<!-- src/routes/store/indicators/[slug]/+page.svelte -->
<script lang="ts">
	import '#lib/styles/inner-page.css';
	import { resolve } from '$app/paths';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import { SINGLE_INDICATOR_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type PreviewTabId = 'three-levels' | 'early-in-out' | 'stats-engine';

	interface SystemComponent {
		id: string;
		badge: string;
		title: string;
		platformNote: string;
		description: string;
		keyAdvantage: string;
		isBonus?: boolean;
	}

	interface SuitabilityPillar {
		tag: string;
		title: string;
		subtitle: string;
		points: string[];
	}

	interface MemberReview {
		quote: string;
		author: string;
		role: string;
	}

	interface RoomCta {
		badge: string;
		title: string;
		description: string;
		ctaLabel: string;
		href: string;
	}

	/* ===========================================================================
     MASTER INDICATOR PRODUCT CONFIG (CHANGE NAME/SPECS HERE LATER IN 1 PLACE)
     =========================================================================== */
	const indicatorConfig = {
		// 27 chars before suffix -> 53 chars total with " | Revolution Trading Pros"
		seoTitle: 'MP Early In & Out Indicator | Revolution Trading Pros',
		// 150 chars total -> Zero Desktop or Mobile SERP Truncation
		seoDescription:
			'Spot explosive stock, ETF, and options moves early with our 100% non-repainting indicator system for ThinkorSwim and TradingView. People over profits.',
		slug: 'move-prior-to-the-move-system',
		systemName: 'The Move Prior to The Move™ Pro System',
		shortName: 'MP_EarlyInNOut™ Pro',
		eyebrowBadge: '100% Non-Repainting Telemetry • Desktop & Mobile Compatible',
		seoKicker: 'Proprietary Stock, ETF & Options Timing System for ThinkorSwim & TradingView',
		heroTitle: 'Predict Explosive Institutional Moves With The Move Prior to The Move™ System',
		instructorName: 'Billy Ribeiro',
		instructorRole: 'Founder of Revolution Trading Pros • Mentored by Mark "Goldfinger" McGoldrick',
		instructorAvatar:
			'https://revolutiontradingpros.com/wp-content/uploads/2025/05/Billy-no-grey-768x768.png.webp',
		supportPhone: '+1 (203) 721-0940',
		supportEmail: 'support@revolutiontradingpros.com',
		whatsIncludedQuickList: [
			'The Move Prior to The Move™ Core Indicator (3 Dynamic Compression Levels)',
			'Objective Buy/Sell & Structural Invalidation Signals',
			'MP_EarlyInNOut™ Pro Leading Accumulation & Exhaustion Telemetry',
			'On-Chart Historical Expectancy & Move Stats Tool',
			'5 Recorded Live-Market Trading Sessions (Real-Time Execution)',
			'Step-by-Step Quick-Start & Mobile App Installation Guide',
			'Complete System Strategy Class (On-Demand HD)',
			'Special Bonus: Precision Options & Equity Entries Masterclass'
		],
		coreCapabilities: [
			'Target big, high-velocity institutional moves—and never chase an extended retail candle again',
			'Instantly spot multi-level compression and order-flow absorption on ANY chart or timeframe',
			'Know the historical "average" profit target and bar duration on ANY ticker at a glance',
			'Protect your capital with pre-defined structural invalidation stops before risking a dollar'
		]
	};

	/* ===========================================================================
     6 INCLUDED SYSTEM COMPONENTS & EXCLUSIVE BONUSES
     =========================================================================== */
	const systemComponents: SystemComponent[] = [
		{
			id: 'core-pro-indicator',
			badge: 'Core Engine 01 // Desktop & ThinkorSwim Mobile Ready',
			title: 'The Move Prior to The Move™ Core Indicator (3 Signals in 1)',
			platformNote: 'Available for ThinkorSwim (Desktop + Mobile App) & TradingView',
			description:
				'Our flagship breakthrough combines three distinct institutional compression and absorption thresholds (Low, High, and Ultra) into a single non-repainting indicator. It dynamically adapts to faster, slower, and volatile price action—giving you an earlier "heads up" before an explosive directional move fires long or short.',
			keyAdvantage:
				'Catches high-velocity moves that standard lagging oscillators miss while keeping you out of flat, "go-nowhere" midday chop.'
		},
		{
			id: 'objective-buy-sell-signals',
			badge: 'Core Engine 02 // Rule-Based Execution',
			title: 'Calibrated Buy/Sell Entry & Invalidation Signals',
			platformNote: 'Available for ThinkorSwim & TradingView • 100% Non-Repainting',
			description:
				'Engineered to eliminate hesitation at the moment of execution, these objective entry triggers are specifically calibrated to each of the three compression power levels. Higher-timeframe institutional trend direction and volume structure are automatically factored in.',
			keyAdvantage:
				'Plots both the exact directional trigger bar and the structural invalidation stop-loss level—and once the candle closes, the signal never repaints.'
		},
		{
			id: 'early-in-out-pro',
			badge: 'Core Engine 03 // Leading Order-Flow Edge',
			title: 'The Early In & Out Pro Indicator (MP_EarlyInNOut™)',
			platformNote: 'Available for ThinkorSwim & TradingView',
			description:
				'Designed to give you a market-defying institutional edge, this leading telemetry tool is calibrated directly to our three power levels. First, it anticipates when smart-money accumulation is about to fire a compression early. Second, it flags buyer or seller exhaustion at the extreme of the move so you lock in gains before the reversal.',
			keyAdvantage:
				'The exact exhaustion and distribution signal behind our live +600% overnight gain on Occidental Petroleum (OXY) Put Options.'
		},
		{
			id: 'on-chart-stats-tool',
			badge: 'Core Engine 04 // Quantitative Expectancy',
			title: 'On-Chart Historical Move & Duration Stats Tool',
			platformNote: 'Available for ThinkorSwim & TradingView',
			description:
				'Puts real historical performance data directly at the top of your chart—calculating the average dollar/percentage gain, average bar duration, and historical long vs. short firing outcomes for every compression level on whatever symbol and timeframe you are viewing.',
			keyAdvantage:
				'Options traders love this tool: knowing the average move size and duration tells you the exact strike (Delta) and expiration (DTE) to choose.'
		},
		{
			id: 'quick-start-and-live-days',
			badge: 'Exclusive Bonus 01 // Real-Market Proof',
			title: 'Quick-Start Setup Session + 5 Recorded Live-Trading Days',
			platformNote: 'On-Demand HD Video Archive + Workspace Templates',
			description:
				'Get up to speed in minutes with our step-by-step installation and chart configuration session—then watch 5 full recorded live-trading days showing how we execute the indicator suite in real market conditions across opening-bell scalps and multi-day swings.',
			keyAdvantage:
				'Watch real-time trade selection, contract sizing, and stop management in live markets—not cherry-picked hindsight slides.',
			isBonus: true
		},
		{
			id: 'precision-entries-bonus',
			badge: 'Exclusive Bonus 02 // Pinpoint Execution Class',
			title: 'Special Bonus: The Precision Entries Recorded Masterclass',
			platformNote: 'Lifetime On-Demand HD Access + PDF Checklist',
			description:
				'Master the art of sniper entries and asymmetric 3R-to-5R risk structuring for stocks, ETFs, SPX index options, and $500+ small accounts. Learn how to combine our three indicator levels with Options Greeks (Delta, Gamma, Theta, and Vega) so you never overpay for implied volatility.',
			keyAdvantage:
				'Includes our downloadable Pre-Trade Execution Checklist covering exact entries, tiered profit exits, and hard stops.',
			isBonus: true
		}
	];

	/* ===========================================================================
     3-PILLAR SUITABILITY MATRIX (FIXES SIMPLER'S "SMALL LOT ROOM" TYPO)
     =========================================================================== */
	const suitabilityPillars: SuitabilityPillar[] = [
		{
			tag: 'Pillar 01 // Account Size & Experience',
			title: 'All Skill Levels & Account Sizes ($500+ to Pro)',
			subtitle: 'Built for Beginners, Developing Traders & Institutional Desks',
			points: [
				'Eliminates chart-reading guesswork with objective, color-coded non-repainting signals',
				'Includes dedicated risk and contract-selection rules for $500+ small cash accounts',
				'Scales seamlessly for six-figure day traders and portfolio managers hedging macro risk'
			]
		},
		{
			tag: 'Pillar 02 // Market Compatibility',
			title: 'All Liquid Asset Classes',
			subtitle: 'Stocks, ETFs, SPX/NDX Indexes, Options & Futures',
			points: [
				'Pinpoints directional options setups (calls, puts, debit spreads, and credit spreads)',
				'Works on high-liquidity large-cap equities, sector ETFs, and S&P 500 (SPX/SPY) index charts',
				'On-Chart Stats Tool automatically recalculates historical expectancy for whatever symbol you load'
			]
		},
		{
			tag: 'Pillar 03 // Schedule Flexibility',
			title: 'All Timeframes (Intraday to Macro)',
			subtitle: 'Opening-Bell Scalpers & 9-to-5 Working Professionals',
			points: [
				'1-Minute, 3-Minute, and 5-Minute charts for active morning bell day traders and scalpers',
				'1-Hour, 4-Hour, and Daily charts for working professionals executing in 20 minutes a day',
				'Weekly and Monthly charts for macro cycle inflection timing (our 2020 & 2022 top/bottom framework)'
			]
		}
	];

	const memberReviews: MemberReview[] = [
		{
			quote:
				'The new Move Prior to The Move tools and Precision Entries class are the best I have ever used. Having the 3 compression levels plus the Early In/Out signal stopped me from chasing late breakouts. All I can say is wow.',
			author: 'Rob C.',
			role: 'Active Stock & Options Trader'
		},
		{
			quote:
				'I loaded the indicator on both my ThinkorSwim desktop and mobile app so I can check Daily and 4-Hour setups at work. Knowing the exact entry trigger and invalidation stop ahead of time completely transformed my swing trading.',
			author: 'Scott M.',
			role: 'Working Professional & Swing Trader'
		},
		{
			quote:
				'After getting burned by a fake guru selling a repainted indicator, I was skeptical. Billy’s signals never repaint after the bar closes, and the On-Chart Stats Tool keeps my $500+ small account out of low-probability gambles.',
			author: 'Phil R.',
			role: 'Small Account Options Trader'
		},
		{
			quote:
				'The 5 recorded live-trading days included in the package showed me exactly how Billy combines the indicator with Delta and Theta selection in real time. Worth every single penny.',
			author: 'M.W.',
			role: 'SPX & ETF Options Trader'
		}
	];

	const bottomRoomCards: RoomCta[] = [
		{
			badge: 'Live Intraday Floor',
			title: 'Day Trading Room',
			description:
				'Watch this exact indicator system traded live on screen every morning with voice commentary.',
			ctaLabel: 'Learn More →',
			href: '/live-trading-rooms/day-trading-room'
		},
		{
			badge: 'Working Professionals',
			title: 'Swing Trading Room',
			description:
				'Multi-day stock and options swing setups powered by our 4H and Daily compression signals.',
			ctaLabel: 'Learn More →',
			href: '/live-trading-rooms/swing-trading-room'
		},
		{
			badge: '$500+ Starting Capital',
			title: 'Small Accounts Room',
			description:
				'Dedicated coaching and right-sized setups to grow a $500+ small account safely.',
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
				'Affordable alert-only video watchlists with exact targeted entries, exits, and stops.',
			ctaLabel: 'Explore Alerts →',
			href: '/alert-services/explosive-swings'
		}
	];

	let activePreviewTab = $state<PreviewTabId>('three-levels');
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#indicator-product-page">Skip to content</a>

<div class="app-shell">
	<Navbar />

	<main id="indicator-product-page" class="inner-page indicator-product-page">
		<!-- =========================================================================
       SECTION 1: BREADCRUMB & MEMBER SIGN-IN BAR
       ========================================================================= -->
		<nav class="breadcrumb-bar" aria-label="Breadcrumb">
			<div class="container breadcrumb-bar__inner">
				<ol class="breadcrumb-list">
					<li><a href={resolve('/')}>Home</a></li>
					<li aria-hidden="true">
						<CaretRightIcon size={12} weight="bold" />
					</li>
					<li><a href={resolve('/store/indicators' as '/')}>Store: Indicators</a></li>
					<li aria-hidden="true">
						<CaretRightIcon size={12} weight="bold" />
					</li>
					<li aria-current="page">{indicatorConfig.systemName}</li>
				</ol>
				<p class="breadcrumb-bar__member">
					<span>Already a Member?</span>
					<a href={resolve('/login' as '/')}>Sign In Here →</a>
				</p>
			</div>
		</nav>

		<!-- =========================================================================
       SECTION 2: ABOVE-THE-FOLD SPLIT HERO (ORIGIN STORY LEFT + PREVIEW RIGHT)
       ========================================================================= -->
		<section class="hero-section" aria-labelledby="product-h1">
			<div class="container hero-section__grid">
				<!-- Left 7 Columns: H1, Instructor Credit, Breakthrough Story & Capabilities -->
				<div class="hero-section__main">
					<div class="eyebrow-pill">
						<span class="eyebrow-pill__badge">{indicatorConfig.eyebrowBadge}</span>
					</div>

					<h1 id="product-h1" class="hero-h1">
						<span class="hero-h1__kicker">{indicatorConfig.seoKicker}</span>
						<span class="hero-h1__display">{indicatorConfig.heroTitle}</span>
					</h1>

					<div class="instructor-strip">
						<img
							src={indicatorConfig.instructorAvatar}
							alt={indicatorConfig.instructorName}
							width="54"
							height="54"
							class="instructor-strip__avatar"
						/>
						<div>
							<span class="meta-label">Engineered &amp; Traded Live By:</span>
							<strong class="instructor-strip__name">{indicatorConfig.instructorName}</strong>
							<span class="instructor-strip__role">{indicatorConfig.instructorRole}</span>
						</div>
					</div>

					<p class="lead-copy">
						<strong>{indicatorConfig.systemName}</strong> is the single greatest trade-timing
						breakthrough we have ever released—because it combines
						<strong
							>three institutional compression and order-flow signals into one 100% non-repainting
							indicator</strong
						>.
					</p>

					<p class="body-copy">
						<strong
							>I know the pain of getting chopped up by volatile, "go-nowhere" price action and fake
							repainted arrows, because I stood on the losing end myself in the past.</strong
						>
						Once I stopped chasing late retail breakouts and was mentored directly by former Wall Street
						Goldman Sachs proprietary trading legend
						<strong>Mark "Goldfinger" McGoldrick</strong>—who called me
						<em>"the future of trading"</em>—everything changed.
					</p>

					<p class="body-copy">
						Instead of waiting for lagging retail oscillators, this system is engineered to give you
						an <strong>earlier institutional "heads up"</strong> that an explosive move is
						forming—allowing you to get in on the most powerful moves earlier, lock in gains sooner,
						and avoid midday chop. It is the exact telemetry behind our live calls on the
						<strong>2020 COVID Top and Bottom</strong>, the
						<strong>2022 Market Top and Bottom</strong>, and our
						<strong>+600% overnight gain on OXY Put Options live</strong> opposite Warren Buffett.
					</p>

					<!-- "With This System, You Can:" Box -->
					<div class="capabilities-box">
						<h2 class="capabilities-box__title">
							With {indicatorConfig.systemName}, You Can:
						</h2>
						<ul class="capabilities-list">
							{#each indicatorConfig.coreCapabilities as item (item)}
								<li>
									<span class="check-icon" aria-hidden="true">✓</span>
									<span>{item}</span>
								</li>
							{/each}
						</ul>
					</div>

					<div class="cta-row">
						<a href="#choose-your-package" class="btn btn--solid">
							Get Instant Access to the System ↓
						</a>
						<a href="#exclusive-bonuses" class="btn btn--outline">
							Inspect All 6 Included Tools &amp; Bonuses
						</a>
					</div>
				</div>

				<!-- Right 5 Columns: Interactive Telemetry Preview + "What's Included" Checklist -->
				<aside class="preview-sidebar" aria-label="System Telemetry Preview and Included Checklist">
					<!-- Interactive 3-Tab Chart Preview Box -->
					<div class="preview-box">
						<div class="preview-box__header">
							<span class="preview-box__tag">LIVE TELEMETRY PREVIEW</span>
							<span class="meta-label">ThinkorSwim &amp; TradingView</span>
						</div>

						<div class="preview-tabs" role="tablist" aria-label="Switch indicator preview mode">
							<button
								type="button"
								role="tab"
								aria-selected={activePreviewTab === 'three-levels'}
								class="preview-tab"
								class:preview-tab--active={activePreviewTab === 'three-levels'}
								onclick={() => (activePreviewTab = 'three-levels')}
							>
								1. 3 Power Levels
							</button>
							<button
								type="button"
								role="tab"
								aria-selected={activePreviewTab === 'early-in-out'}
								class="preview-tab"
								class:preview-tab--active={activePreviewTab === 'early-in-out'}
								onclick={() => (activePreviewTab = 'early-in-out')}
							>
								2. Early In/Out
							</button>
							<button
								type="button"
								role="tab"
								aria-selected={activePreviewTab === 'stats-engine'}
								class="preview-tab"
								class:preview-tab--active={activePreviewTab === 'stats-engine'}
								onclick={() => (activePreviewTab = 'stats-engine')}
							>
								3. Stats Tool
							</button>
						</div>

						<div class="preview-canvas" aria-hidden="true">
							{#if activePreviewTab === 'three-levels'}
								<svg viewBox="0 0 380 165" class="preview-svg">
									<rect x="8" y="8" width="364" height="22" fill="#000000" />
									<text x="16" y="22" font-size="8.5" font-weight="800" fill="#ffffff">
										3 DYNAMIC COMPRESSION LEVELS: LOW [○] • HIGH [◐] • ULTRA [●]
									</text>
									<polyline
										fill="none"
										stroke="#000000"
										stroke-width="2.5"
										points="14,122 64,116 114,118 164,117 214,88 264,52 314,38 364,42"
									/>
									<circle cx="80" cy="117" r="4" fill="#ffffff" stroke="#000000" stroke-width="2" />
									<circle
										cx="114"
										cy="118"
										r="4.5"
										fill="#777777"
										stroke="#000000"
										stroke-width="1.5"
									/>
									<circle cx="148" cy="117" r="5.5" fill="#000000" />
									<circle cx="180" cy="112" r="6" fill="#000000" />
									<rect x="196" y="96" width="160" height="22" fill="#000000" />
									<text
										x="276"
										y="110"
										font-size="8.5"
										font-weight="900"
										text-anchor="middle"
										fill="#ffffff"
									>
										▲ OBJECTIVE BUY SIGNAL + STOP
									</text>
									<line
										x1="14"
										y1="142"
										x2="366"
										y2="142"
										stroke="#000000"
										stroke-dasharray="4 4"
										stroke-width="1.5"
									/>
									<text x="16" y="156" font-size="8" font-weight="800" fill="#333333">
										HARD INVALIDATION STOP-LOSS LEVEL (PLOTTED AUTOMATICALLY)
									</text>
								</svg>
							{:else if activePreviewTab === 'early-in-out'}
								<svg viewBox="0 0 380 165" class="preview-svg">
									<rect x="8" y="8" width="364" height="22" fill="#000000" />
									<text x="16" y="22" font-size="8.5" font-weight="800" fill="#ffffff">
										MP_EARLYINNOUT™ PRO: PRE-IGNITION ENTRY &amp; CLIMAX EXIT
									</text>
									<polyline
										fill="none"
										stroke="#000000"
										stroke-width="2.5"
										points="16,130 70,124 125,125 175,92 225,54 275,36 320,62 362,88"
									/>
									<circle cx="125" cy="125" r="6" fill="#000000" />
									<rect x="42" y="135" width="155" height="20" fill="#000000" />
									<text
										x="119"
										y="148"
										font-size="8.5"
										font-weight="900"
										text-anchor="middle"
										fill="#ffffff"
									>
										▲ EARLY IN (ABSORPTION)
									</text>
									<circle cx="275" cy="36" r="6" fill="#000000" />
									<rect
										x="195"
										y="44"
										width="165"
										height="20"
										fill="#ffffff"
										stroke="#000000"
										stroke-width="1.5"
									/>
									<text
										x="277"
										y="57"
										font-size="8.5"
										font-weight="900"
										text-anchor="middle"
										fill="#000000"
									>
										▼ EARLY OUT (LOCK IN GAINS)
									</text>
								</svg>
							{:else}
								<svg viewBox="0 0 380 165" class="preview-svg">
									<rect x="8" y="8" width="364" height="36" fill="#000000" />
									<text x="18" y="23" font-size="8.5" font-weight="900" fill="#ffffff">
										ON-CHART HISTORICAL STATS ENGINE (ANY TICKER OR TIMEFRAME)
									</text>
									<text x="18" y="37" font-size="8" font-weight="700" fill="#dddddd">
										ULTRA LEVEL: AVG GAIN +4.9R | AVG DURATION: 8 BARS | 81% FIRED LONG
									</text>
									<rect
										x="12"
										y="56"
										width="172"
										height="92"
										fill="#f7f7f7"
										stroke="#000000"
										stroke-width="1.5"
									/>
									<text
										x="98"
										y="88"
										font-size="18"
										font-weight="900"
										text-anchor="middle"
										fill="#000000">+4.9R</text
									>
									<text
										x="98"
										y="108"
										font-size="8.5"
										font-weight="800"
										text-anchor="middle"
										fill="#000000"
									>
										HISTORICAL AVG TARGET
									</text>
									<text x="98" y="124" font-size="8" text-anchor="middle" fill="#333333">
										Know realistic profit targets
									</text>
									<rect
										x="196"
										y="56"
										width="172"
										height="92"
										fill="#f7f7f7"
										stroke="#000000"
										stroke-width="1.5"
									/>
									<text
										x="282"
										y="88"
										font-size="18"
										font-weight="900"
										text-anchor="middle"
										fill="#000000">8.2 BARS</text
									>
									<text
										x="282"
										y="108"
										font-size="8.5"
										font-weight="800"
										text-anchor="middle"
										fill="#000000"
									>
										AVG MOVE DURATION
									</text>
									<text x="282" y="124" font-size="8" text-anchor="middle" fill="#333333">
										Pick optimal Options DTE
									</text>
								</svg>
							{/if}
						</div>
					</div>

					<!-- "What's Included:" Quick-Scan Card (Upgraded from Simpler's Hero Sidebar) -->
					<div class="included-summary-card">
						<div class="included-summary-card__header">
							<span class="meta-label">Complete System Inventory</span>
							<h2 class="included-summary-card__title">What’s Included:</h2>
						</div>

						<ul class="included-summary-list">
							{#each indicatorConfig.whatsIncludedQuickList as item (item)}
								<li>
									<span class="check-icon" aria-hidden="true">■</span>
									<span>{item}</span>
								</li>
							{/each}
						</ul>

						<div class="included-summary-card__footer">
							<a href="#choose-your-package" class="btn btn--solid btn--full">
								Enroll &amp; Download Indicator Suite ↓
							</a>
						</div>
					</div>
				</aside>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 3: WHEN YOU SIGN UP, YOU GET THESE 6 COMPONENTS & BONUSES
       (Upgrades Simpler's "When You Sign Up, You Also Get..." Section)
       ========================================================================= -->
		<section id="exclusive-bonuses" class="components-section" aria-labelledby="components-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">Complete Institutional Toolkit • Desktop &amp; Mobile</span>
					<h2 id="components-h2" class="section-h2">
						When You Sign Up, You Get These 6 Core Indicators, Tools &amp; Exclusive Bonuses
					</h2>
					<p class="body-copy section-header__sub">
						We don’t sell you a bare script and leave you guessing how to trade it. Every enrollment
						includes the complete 4-part indicator engine plus 2 recorded live-market training
						bonuses:
					</p>
				</div>

				<div class="components-grid">
					{#each systemComponents as comp (comp.id)}
						<article id={comp.id} class="comp-card" class:comp-card--bonus={comp.isBonus}>
							<div>
								<div class="comp-card__top">
									<span class="meta-label">{comp.badge}</span>
									{#if comp.isBonus}
										<span class="comp-card__bonus-pill">Included Bonus</span>
									{:else}
										<span class="comp-card__core-pill">100% Non-Repainting</span>
									{/if}
								</div>

								<h3 class="comp-card__title">{comp.title}</h3>
								<p class="comp-card__platform">{comp.platformNote}</p>
								<p class="comp-card__desc">{comp.description}</p>
							</div>

							<div class="comp-card__advantage">
								<strong>The Trader Advantage:</strong>
								{comp.keyAdvantage}
							</div>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 4: WHO IS THIS INDICATOR SYSTEM FOR? (3-PILLAR MATRIX)
       (Fixes Simpler Trading's Broken "Who is the Small Lot Trading Room for?" Heading)
       ========================================================================= -->
		<section class="suitability-section" aria-labelledby="suitability-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">No Trader Left Behind • Universal Adaptability</span>
					<h2 id="suitability-h2" class="section-h2">
						Who Is {indicatorConfig.systemName} Built For?
					</h2>
					<p class="body-copy section-header__sub">
						Because our indicator suite automatically calibrates to volatility and timeframe
						structure, it adapts directly to your account size, preferred asset class, and daily
						schedule:
					</p>
				</div>

				<div class="suitability-grid">
					{#each suitabilityPillars as pillar (pillar.title)}
						<article class="suitability-card">
							<span class="meta-label">{pillar.tag}</span>
							<h3 class="suitability-card__title">{pillar.title}</h3>
							<p class="suitability-card__sub">{pillar.subtitle}</p>
							<ul class="suitability-list">
								{#each pillar.points as pt (pt)}
									<li>
										<span class="check-icon" aria-hidden="true">✓</span>
										<span>{pt}</span>
									</li>
								{/each}
							</ul>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 5: CHOOSE YOUR PACKAGE / COMPLETE ENROLLMENT DOSSIER
       (Upgrades Simpler's "Choose Your Package" Box — Zero Prices Displayed)
       ========================================================================= -->
		<section id="choose-your-package" class="enrollment-section" aria-labelledby="enrollment-h2">
			<div class="container">
				<div class="enrollment-box">
					<div class="enrollment-box__header">
						<div>
							<span class="section-kicker">People Over Making Money • Lifetime Access</span>
							<h2 id="enrollment-h2" class="section-h2">
								Complete System Enrollment: {indicatorConfig.systemName}
							</h2>
							<p class="enrollment-box__sub">
								Available for ThinkorSwim (Desktop &amp; Mobile App) and TradingView • Instant
								Digital Delivery
							</p>
						</div>
						<span class="enrollment-box__seal">Zero Repaint Guarantee</span>
					</div>

					<div class="enrollment-box__grid">
						<div class="enrollment-box__col">
							<h3 class="enrollment-box__col-title">
								Included Proprietary Indicators &amp; Scripts:
							</h3>
							<ul class="enrollment-checklist">
								<li>
									<span class="check-icon" aria-hidden="true">✓</span>
									<span
										><strong>The Move Prior to The Move™ Core Indicator</strong> (Low, High &amp; Ultra
										Compression Levels)</span
									>
								</li>
								<li>
									<span class="check-icon" aria-hidden="true">✓</span>
									<span
										><strong>Calibrated Buy/Sell Signals &amp; Hard Stops</strong> (With automatic trend
										filtering)</span
									>
								</li>
								<li>
									<span class="check-icon" aria-hidden="true">✓</span>
									<span
										><strong>MP_EarlyInNOut™ Pro Leading Indicator</strong> (Early accumulation &amp;
										climax exit alerts)</span
									>
								</li>
								<li>
									<span class="check-icon" aria-hidden="true">✓</span>
									<span
										><strong>On-Chart Historical Stats Engine</strong> (Average gain, duration &amp; long/short
										ratios)</span
									>
								</li>
							</ul>
						</div>

						<div class="enrollment-box__col">
							<h3 class="enrollment-box__col-title">
								Included Strategy Training &amp; Live-Market Bonuses:
							</h3>
							<ul class="enrollment-checklist">
								<li>
									<span class="check-icon" aria-hidden="true">✓</span>
									<span
										><strong>Recorded System Strategy Class</strong> (Complete Goldman Sachs-mentored
										execution rules)</span
									>
								</li>
								<li>
									<span class="check-icon" aria-hidden="true">✓</span>
									<span
										><strong>5 Recorded Live-Trading Days</strong> (Watch real-time execution across stocks
										&amp; options)</span
									>
								</li>
								<li>
									<span class="check-icon" aria-hidden="true">✓</span>
									<span
										><strong>Special Bonus: Precision Entries Masterclass</strong> (Options Greeks &amp;
										sniper triggers)</span
									>
								</li>
								<li>
									<span class="check-icon" aria-hidden="true">✓</span>
									<span
										><strong>Quick-Start Installation Video &amp; Mobile Setup Guide</strong></span
									>
								</li>
							</ul>
						</div>
					</div>

					<div class="enrollment-box__cta-bar">
						<a href={resolve('/contact' as '/')} class="btn btn--solid btn--large">
							Sign Up Now &amp; Unlock Instant Access →
						</a>
						<p class="enrollment-box__support">
							Have a question before enrolling? Call our desk at
							<strong>{indicatorConfig.supportPhone}</strong> or email
							<a href={`mailto:${indicatorConfig.supportEmail}`}>{indicatorConfig.supportEmail}</a>
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 6: WHO IS BILLY RIBEIRO? (INSTRUCTOR AUTHORITY SECTION)
       ========================================================================= -->
		<section class="bio-section" aria-labelledby="bio-h2">
			<div class="container">
				<div class="bio-card">
					<div class="bio-card__grid">
						<div class="bio-card__left">
							<img
								src={indicatorConfig.instructorAvatar}
								alt="Billy Ribeiro — Founder of Revolution Trading Pros"
								width="200"
								height="200"
								loading="lazy"
								class="bio-card__avatar"
							/>
							<span class="bio-card__tag">The Future of Trading</span>
						</div>

						<div class="bio-card__right">
							<span class="section-kicker">Wall Street Mentorship Lineage</span>
							<h2 id="bio-h2" class="section-h2">Who Is Billy Ribeiro?</h2>
							<p class="bio-card__role">
								Founder of Revolution Trading Pros • Personally Mentored by Mark "Goldfinger"
								McGoldrick
							</p>
							<p class="body-copy">
								Billy Ribeiro started <strong>Revolution Trading Pros</strong> because he stood on
								the losing end early in his journey and saw how everyday retail traders are
								exploited by overpriced courses and fake, repainted "holy grail" indicators. He
								vowed to build a community that focuses on
								<strong>people and member success—not making money off subscriptions</strong>.
							</p>
							<p class="body-copy">
								Personally mentored by former Wall Street Goldman Sachs proprietary trading legend
								<strong>Mark "Goldfinger" McGoldrick</strong>—who called Billy
								<em>"the future of trading"</em>—Billy engineered
								<strong>The Move Prior to The Move™</strong> to expose institutional accumulation
								and distribution before retail traders even react. Using these exact tools, Billy
								called the
								<strong>2020 COVID Crash Top and Bottom</strong>, called the
								<strong>2022 Bull Market Top and Bear Bottom</strong>, and shorted
								<strong
									>Occidental Petroleum (OXY) live with Put Options for a 600% overnight gain</strong
								>
								while Warren Buffett bought millions long.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 7: WHAT OUR MEMBERS SAY (VERIFIED TRADER TESTIMONIALS)
       ========================================================================= -->
		<section class="reviews-section" aria-labelledby="reviews-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">Verified Member Feedback</span>
					<h2 id="reviews-h2" class="section-h2">
						Here’s What Traders Say About {indicatorConfig.systemName}
					</h2>
				</div>

				<div class="reviews-grid">
					{#each memberReviews as rev (rev.author)}
						<blockquote class="review-card">
							<p class="review-card__quote">"{rev.quote}"</p>
							<footer class="review-card__footer">
								<strong>— {rev.author}</strong>
								<span>{rev.role}</span>
							</footer>
						</blockquote>
					{/each}
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 8: FREQUENTLY ASKED QUESTIONS + DIRECT SUPPORT BAR
       ========================================================================= -->
		<section id="faq" class="faq-section" aria-labelledby="faq-h2">
			<div class="container faq-container">
				<div class="section-header">
					<span class="section-kicker">Direct Answers • Zero Evasion</span>
					<h2 id="faq-h2" class="section-h2">Frequently Asked Questions</h2>
				</div>

				<div class="faq-list">
					{#each SINGLE_INDICATOR_FAQ_ITEMS as faq, idx (faq.id)}
						<details id={`faq-${faq.id}`} class="faq-item" open={idx === 0}>
							<summary class="faq-item__question">
								<h3 class="faq-item__heading">{faq.question}</h3>
								<span class="faq-item__icon" aria-hidden="true">+</span>
							</summary>
							<p class="faq-item__answer">
								<strong>A:</strong>
								{faq.answer}
							</p>
						</details>
					{/each}
				</div>

				<div class="support-callout">
					<h3 class="support-callout__title">Have Questions? Speak With Our Desk</h3>
					<p class="support-callout__copy">
						If you would like to speak with our team about how this indicator system fits your
						platform or account size, call <strong>{indicatorConfig.supportPhone}</strong>, email
						<a href={`mailto:${indicatorConfig.supportEmail}`}>{indicatorConfig.supportEmail}</a>,
						or <a href={resolve('/contact' as '/')}>contact us online</a>.
					</p>
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
							Watch This Indicator System Traded Live Every Market Day
						</h2>
						<p class="body-copy pro-cta-box__sub">
							Pair your indicator suite with our Live Trading Rooms or Video Watchlist Alert
							Services:
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
