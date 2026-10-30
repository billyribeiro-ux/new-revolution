<!-- src/routes/alert-services/spx-profit-pulse/+page.svelte -->
<script lang="ts">
	import '#lib/styles/inner-page.css';
	import { resolve } from '$app/paths';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import { SPX_PROFIT_PULSE_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type AlertSampleTab = 'zero-dte-momentum' | 'gamma-wall-reversal' | 'defined-risk-spread';

	interface SampleAlertTicket {
		id: AlertSampleTab;
		tabLabel: string;
		setupName: string;
		structureType: string;
		marketRegime: string;
		entryZone: string;
		targetOne: string;
		targetTwo: string;
		hardStop: string;
		thesisNote: string;
	}

	interface DeliverableBonus {
		code: string;
		badge: string;
		title: string;
		description: string;
		traderBenefit: string;
	}

	interface SpxAdvantageCard {
		num: string;
		title: string;
		subtitle: string;
		detail: string;
	}

	interface MembershipCadence {
		id: string;
		tierTag: string;
		name: string;
		subtitle: string;
		featured?: boolean;
		badgeText?: string;
		includes: string[];
		ctaLabel: string;
	}

	interface TraderTestimonial {
		quote: string;
		author: string;
		profile: string;
		strategyUsed: string;
	}

	type RoomRoute =
		| '/live-trading-rooms/day-trading-room'
		| '/live-trading-rooms/swing-trading-room'
		| '/live-trading-rooms/small-accounts-room'
		| '/alert-services/explosive-swings'
		| '/store/indicators';

	interface RoomCta {
		badge: string;
		title: string;
		description: string;
		ctaLabel: string;
		href: RoomRoute;
	}

	const sampleAlerts: Record<AlertSampleTab, SampleAlertTicket> = {
		'zero-dte-momentum': {
			id: 'zero-dte-momentum',
			tabLabel: '01 // 0DTE Gamma Ignition',
			setupName: 'SPX Opening Drive Gamma Wall Breakout',
			structureType: 'Single-Leg Call or Put (0.55–0.65 Delta)',
			marketRegime: 'Multi-Timeframe Compression Firing Above Dealer Call Wall',
			entryZone: 'Pre-Planned Trigger Level + Volume Confirmation (Sent Ahead of Bell)',
			targetOne: '+30% to +50% Option Premium (Scale 1/2 & Move Stop to Breakeven)',
			targetTwo: '+80% to +120%+ into Next Institutional Gamma Magnet',
			hardStop: 'Hard Structural Invalidation Below Sweep Candle Low',
			thesisNote:
				'When market makers are short Gamma above a key SPX call wall, they are forced to buy S&P 500 futures as price rises—fueling rapid directional expansion.'
		},
		'gamma-wall-reversal': {
			id: 'gamma-wall-reversal',
			tabLabel: '02 // Liquidity Sweep Reversal',
			setupName: 'SPX Exhaustion Trap & Failed Breakout Fade',
			structureType: 'Intraday or 1–3 DTE Put / Call Debit Structure',
			marketRegime: 'Retail Chasing Extended Highs Into Institutional Distribution',
			entryZone: 'Triggered on Abandoned Price Bar Inside Pre-Mapped Supply Zone',
			targetOne: 'VWAP & Mid-Range Liquidity Pool (Lock In Core Profit)',
			targetTwo: 'Opening Range Low / Put Wall Magnet (3R to 5R Asymmetry)',
			hardStop: 'Strict Invalidation Just Above the Liquidity Sweep High',
			thesisNote:
				'Uses the exact institutional distribution read behind our live +600% overnight OXY Put Options trade—fading retail euphoria when smart money steps in.'
		},
		'defined-risk-spread': {
			id: 'defined-risk-spread',
			tabLabel: '03 // Defined-Risk Credit/Debit Spread',
			setupName: 'High-Probability SPX Vertical Spread (Theta & Working Pro Friendly)',
			structureType: '5-Wide or 10-Wide SPX Vertical Credit or Debit Spread',
			marketRegime: 'Pinned Dealer Gamma Regime or Multi-Day Swing Inflection',
			entryZone: 'Limit Order Placed at Pre-Planned Institutional Support/Resistance',
			targetOne: '50% to 65% of Maximum Spread Credit/Value Captured',
			targetTwo: '75% to 85% Capture Before Final-Hour Gamma Acceleration',
			hardStop: '100% Capped Dollar Risk Defined Before Order Submission',
			thesisNote:
				'Ideal for 9-to-5 working professionals and $500+ small accounts (using SPX spreads or mini-SPX XSP) who want neutralized Theta decay and strictly capped risk.'
		}
	};

	const serviceDeliverables: DeliverableBonus[] = [
		{
			code: 'Deliverable 01 // Zero-Latency Dispatch',
			badge: 'Instant API-Powered Alerts',
			title: 'Real-Time SPX Trade Alerts via Automated Dispatch (Desktop & Mobile)',
			description:
				'Seconds matter when trading S&P 500 index options. Instead of slow, copy-pasted chat messages sent after a move is already halfway over, SPX Profit Pulse uses instant automated dispatch to deliver every setup, entry trigger, target scale-out, and stop adjustment in real time.',
			traderBenefit:
				'Every alert includes the exact SPX underlying trigger price, option contract/spread structure, tiered profit exits, and hard stop-loss.'
		},
		{
			code: 'Deliverable 02 // Pre-Market & Weekly Video Watchlists',
			badge: 'Video Game Plans Included',
			title: 'Detailed Video Watchlists Mapping Dealer Gamma Levels Ahead of Time',
			description:
				'You never have to guess why we are taking a trade. Each week—and before key market sessions—Billy Ribeiro sends out a concise, high-conviction video breakdown mapping institutional call walls, put walls, liquidity sweep zones, and both directional and neutral SPX strategies.',
			traderBenefit:
				'Allows busy working professionals to see the exact battle plan and set conditional orders without staring at 1-minute ticks all day.'
		},
		{
			code: 'Deliverable 03 // Dedicated SPX Execution Feed',
			badge: 'Focused Signal Channel',
			title: 'Specialized SPX Profit Pulse Feed With Live Chart Markups',
			description:
				'Zero clutter and zero penny-stock noise. All SPX Profit Pulse alerts, annotated institutional chart snapshots, and intraday gamma updates are delivered inside a dedicated, distraction-free SPX channel.',
			traderBenefit:
				'Follow every trade from pre-market thesis to final exit with crystal-clear chart visuals showing our non-repainting indicators.'
		},
		{
			code: 'Deliverable 04 // SPX & 0DTE Learning Center',
			badge: 'On-Demand Strategy Vault',
			title: 'Full Access to the SPX & Index Options Learning Center',
			description:
				'New to S&P 500 index options? Unlock our on-demand SPX Learning Center covering how SPX differs from SPY, how to use mini-SPX (XSP) for $500+ small accounts, and how to master Delta, Gamma, Theta, and Vega on index contracts.',
			traderBenefit:
				'Transforms you from a passive alert follower into a self-sufficient institutional index options trader.'
		},
		{
			code: 'Deliverable 05 // Fast-Track Onboarding Bonus',
			badge: 'Included QuickStart Training',
			title: 'BONUS: QuickStart to SPX 0DTE & Vertical Spreads Execution Session',
			description:
				'Get up to speed before your very first alert. In this focused walkthrough right inside your member dashboard, Billy Ribeiro covers broker order entry, avoiding bid-ask slippage, scaling out into strength, and position sizing for your exact account balance.',
			traderBenefit:
				'Ensures you execute your very first SPX alert with calm, mechanical precision.'
		},
		{
			code: 'Deliverable 06 // Weekly Trade Autopsy & Regime Review',
			badge: '100% Transparent Ledger',
			title: 'Weekly Recap Video Reviewing Every Win, Stop-Out & Next Week’s Map',
			description:
				'Fake gurus hide their losing trades. Every weekend, we review our closed SPX trades from the week—both winners and disciplined stops—and lay out the macro volatility regime for the week ahead.',
			traderBenefit:
				'Builds real institutional pattern recognition and keeps you aligned with the dominant macro cycle.'
		}
	];

	const spxStructuralAdvantages: SpxAdvantageCard[] = [
		{
			num: '01',
			title: 'Section 1256 Tax Advantage (60/40 Rule in the US)',
			subtitle: 'Keep More of Your Trading Profits',
			detail:
				'Under US IRS Section 1256, SPX index options gains are taxed at a blended 60% long-term / 40% short-term capital gains rate—regardless of whether you held the trade for 10 minutes or 10 days.'
		},
		{
			num: '02',
			title: '100% Cash-Settled & European-Style Exercise',
			subtitle: 'Zero Early Assignment or Share-Delivery Risk',
			detail:
				'Unlike equity options or SPY ETF options, SPX settles directly into cash and cannot be exercised early—eliminating overnight pin risk and unexpected margin calls.'
		},
		{
			num: '03',
			title: 'Institutional Liquidity & Predictable Gamma Walls',
			subtitle: 'No Single-Stock Earnings Gaps or CEO Headline Shocks',
			detail:
				'Because the S&P 500 is the world’s largest institutional hedging arena, dealer Call Walls, Put Walls, and Gamma pinning zones act like mathematical magnets on intraday price action.'
		},
		{
			num: '04',
			title: 'Scalable From $500+ Accounts (XSP/Spreads) to 7-Figure Desks',
			subtitle: '10x Notional Efficiency With Mini-SPX Compatibility',
			detail:
				'One SPX contract equals 10x SPY—reducing commission drag for pros, while $500+ small accounts can execute the exact same levels using tight SPX vertical spreads or 1/10th-size XSP contracts.'
		}
	];

	const cadencePackages: MembershipCadence[] = [
		{
			id: 'monthly-cadence',
			tierTag: 'Option 01 // Flexible Monthly Access',
			name: 'Monthly SPX Profit Pulse',
			subtitle: 'Month-to-Month Access to All Real-Time SPX Alerts & Video Watchlists',
			includes: [
				'Real-Time SPX 0DTE & Multi-Day Options Alerts (Exact Entries, Targets & Stops)',
				'Pre-Market & Weekly SPX Video Watchlists & Gamma Level Maps',
				'Dedicated SPX Profit Pulse Channel & Annotated Chart Stream',
				'Full Access to the SPX & 0DTE Learning Center',
				'QuickStart to SPX Execution Onboarding Session'
			],
			ctaLabel: 'Select Monthly SPX Profit Pulse →'
		},
		{
			id: 'quarterly-cadence',
			tierTag: 'Option 02 // Most Popular Cadence',
			name: 'Quarterly SPX Profit Pulse',
			subtitle: '90-Day Institutional Commitment Across Full Earnings & Fed Cycles',
			featured: true,
			badgeText: 'Most Popular • Best Consistency Rhythm',
			includes: [
				'Everything Included in Monthly SPX Profit Pulse Access',
				'Full 90-Day Coverage Across FOMC, CPI & Quarterly OpEx Cycles',
				'Complete Archive of Weekly Neutral & Directional Strategy Videos',
				'Small-Account ($500+) Vertical Spread & XSP Sizing Guide',
				'Priority Desk Q&A Support on SPX Strike & Expiration Selection'
			],
			ctaLabel: 'Select Quarterly SPX Profit Pulse →'
		},
		{
			id: 'annual-cadence',
			tierTag: 'Option 03 // Go All In (Full-Year Edge)',
			name: 'Annual SPX Profit Pulse',
			subtitle: '365 Days of Institutional SPX Execution Across All Market Regimes',
			includes: [
				'Everything Included in Quarterly SPX Profit Pulse Access',
				'Uninterrupted Full-Year Access Through Bull, Bear & Volatility Regimes',
				'Bonus: SPX Dealer Gamma & Options Greeks Execution Playbook PDF',
				'Direct Integration Guide for ThinkorSwim & TradingView Gamma Levels',
				'Locked-In Member Priority for Future SPX Masterclasses'
			],
			ctaLabel: 'Select Annual SPX Profit Pulse →'
		}
	];

	const testimonials: TraderTestimonial[] = [
		{
			quote:
				'I took my first SPX trade with Billy’s pre-planned gamma levels this week and scaled out at Target 1 and Target 2 cleanly. After struggling in noisy Discord groups for years, having the exact entry, target, and hard stop ahead of time makes all the difference.',
			author: 'Daniel K.',
			profile: 'Part-Time SPX & SPY Options Trader',
			strategyUsed: 'Pre-Planned Gamma Wall Reversals'
		},
		{
			quote:
				'Because of my day job, I cannot sit on a live stream for six hours. The pre-market video watchlist shows me the exact SPX inflection zones so I can set my vertical spread orders and let the trade work without staring at my screen.',
			author: 'Victor G.',
			profile: 'Working Professional (9-to-5 Schedule)',
			strategyUsed: 'Defined-Risk SPX Vertical Spreads'
		},
		{
			quote:
				'Most 0DTE alert services gamble on out-of-the-money lottery tickets with no stop-loss. Billy treats SPX like the Goldman Sachs prop desk he was mentored by—every alert respects Delta, Theta, and strict invalidation levels.',
			author: 'chris M.',
			profile: 'Full-Time Index Options Trader',
			strategyUsed: '0DTE & 1–3 DTE Directional Calls/Puts'
		},
		{
			quote:
				'Starting with a smaller account, I used Billy’s exact SPX Profit Pulse levels on 5-wide defined-risk spreads and XSP. Knowing my maximum dollar risk before entering gave me the confidence to follow the plan without panic selling.',
			author: 'Sarah J.',
			profile: '$500+ Small Account Builder',
			strategyUsed: 'Defined-Risk Spreads & XSP Execution'
		}
	];

	const bottomRoomCards: RoomCta[] = [
		{
			badge: 'Live Intraday Floor',
			title: 'Day Trading Room',
			description:
				'Want live voice and screen-share execution across stocks, ETFs, and SPX? Join our main floor.',
			ctaLabel: 'Learn More →',
			href: '/live-trading-rooms/day-trading-room'
		},
		{
			badge: 'Working Professionals',
			title: 'Swing Trading Room',
			description:
				'Multi-day stock, ETF, and options swing trading room built for busy 9-to-5 careers.',
			ctaLabel: 'Learn More →',
			href: '/live-trading-rooms/swing-trading-room'
		},
		{
			badge: '$500+ Starting Capital',
			title: 'Small Accounts Room',
			description:
				'Dedicated coaching, T+1 cash rotation, and affordable setups to grow a $500+ account.',
			ctaLabel: 'Learn More →',
			href: '/live-trading-rooms/small-accounts-room'
		},
		{
			badge: 'Multi-Day Video Alerts',
			title: 'Explosive Swings Alerts',
			description:
				'Pair SPX Profit Pulse with our flagship multi-day stock and options video watchlist alerts.',
			ctaLabel: 'Explore Alerts →',
			href: '/alert-services/explosive-swings'
		},
		{
			badge: 'Zero-Repaint Tools',
			title: 'Custom SPX Indicators',
			description:
				'Get the exact non-repainting SPX Gamma Levels and Multi-Timeframe indicators on your charts.',
			ctaLabel: 'Explore Indicators →',
			href: '/store/indicators'
		}
	];

	let activeAlertTab = $state<AlertSampleTab>('zero-dte-momentum');
	const currentSample = $derived(sampleAlerts[activeAlertTab]);
</script>

<JsonLd schema={data.jsonLdSchema} />

<div class="app-shell">
	<Navbar />

	<main id="spx-profit-pulse-page" class="inner-page spx-page">
		<!-- =========================================================================
       SECTION 1: BREADCRUMB & REAL-TIME DISPATCH TELEMETRY BAR
       ========================================================================= -->
		<nav class="breadcrumb-bar" aria-label="Breadcrumb">
			<div class="container breadcrumb-bar__inner">
				<ol class="breadcrumb-list">
					<li><a href={resolve('/')}>Home</a></li>
					<li aria-hidden="true">/</li>
					<li><span>Alert Services</span></li>
					<li aria-hidden="true">/</li>
					<li aria-current="page">SPX Profit Pulse</li>
				</ol>
				<p class="breadcrumb-bar__telemetry">
					<span>Instant Real-Time Dispatch</span> • <span>0DTE &amp; Multi-Day SPX Options</span> •
					<span>Exact Entries, Exits &amp; Stops</span>
				</p>
			</div>
		</nav>

		<!-- =========================================================================
       SECTION 2: ABOVE-THE-FOLD SPLIT HERO (12-COLUMN ASYMMETRIC LAYOUT)
       ========================================================================= -->
		<section class="hero-section" aria-labelledby="spx-h1">
			<div class="container hero-section__grid">
				<!-- Left 7 Columns: H1, Lead Hook, Goldman Sachs Lineage & Suitability -->
				<div class="hero-section__main">
					<div class="eyebrow-pill">
						<span class="eyebrow-pill__badge">People Over Profits • Alerts + Video Watchlists</span>
						<span class="eyebrow-pill__text">
							Mentored by Former Goldman Sachs Legend Mark "Goldfinger" McGoldrick
						</span>
					</div>

					<h1 id="spx-h1" class="hero-h1">
						<span class="hero-h1__kicker seo-kicker">
							SPX Profit Pulse • Real-Time S&amp;P 500 &amp; 0DTE Index Options Trade Alert Service
						</span>
						<span class="hero-h1__display">
							Get Precise SPX Options Alerts—Catch the Big Index Moves Without Staring at Screens
							All Day.
						</span>
					</h1>

					<p class="lead-copy">
						When you step inside <strong>SPX Profit Pulse</strong>, you immediately know you finally
						found what you have been searching for—not a chaotic Discord group spamming 30 impulsive
						0DTE lottery tickets with zero stop-losses, and not fake repainted "holy grail" arrows,
						but
						<strong
							>pre-planned institutional S&amp;P 500 index options execution with exact entries,
							tiered profit exits, and hard invalidation stops</strong
						>.
					</p>

					<p class="body-copy">
						<strong
							>I know how fast an undisciplined trader can blow up trading index options, because I
							stood on the losing end myself in the past.</strong
						>
						Most SPX alert services exist only to churn subscription fees while members get crushed by
						Theta decay and dealer Gamma traps. That is why I built Revolution Trading Pros around one
						unbreakable law: <strong>we focus on PEOPLE, not making money.</strong>
					</p>

					<p class="body-copy">
						Personally mentored by former Wall Street Goldman Sachs proprietary trading legend
						<strong>Mark "Goldfinger" McGoldrick</strong>—who explicitly called me
						<em>"the future of trading"</em>—I learned how institutional dealer Gamma walls,
						liquidity sweeps, and macro order flow drive the S&amp;P 500 every single day. It is the
						exact methodology that allowed us to call the
						<strong>2020 COVID Top and Bottom</strong>, call the
						<strong>2022 Bull Market Top and Bear Bottom</strong>, and short
						<strong
							>Occidental Petroleum (OXY) live with Put Options for a 600% overnight gain</strong
						> while Warren Buffett went long millions of dollars.
					</p>

					<!-- Upgraded "This Alert Service Is Engineered For:" Box -->
					<div class="good-for-box">
						<span class="meta-label">Who SPX Profit Pulse Is Engineered For:</span>
						<div class="good-for-grid">
							<div class="good-for-item">
								<strong>✓ Full-Time SPX &amp; 0DTE Traders</strong>
								<span
									>Real-time dealer gamma walls, opening-bell momentum &amp; afternoon reversals</span
								>
							</div>
							<div class="good-for-item">
								<strong>✓ Busy 9-to-5 Working Professionals</strong>
								<span
									>Pre-planned video watchlists &amp; instant mobile alerts—no screen addiction
									required</span
								>
							</div>
							<div class="good-for-item">
								<strong>✓ $500+ Small Account Builders</strong>
								<span>Execute every alert via defined-risk SPX vertical spreads, XSP, or SPY</span>
							</div>
							<div class="good-for-item">
								<strong>✓ Tax-Smart US &amp; Canadian Traders</strong>
								<span
									>Harness cash settlement, zero early assignment risk &amp; Section 1256 60/40 tax
									rules</span
								>
							</div>
						</div>
					</div>

					<div class="cta-row">
						<a href="#choose-your-package" class="btn btn--solid">
							Compare SPX Profit Pulse Packages ↓
						</a>
						<a href="#exclusive-bonuses" class="btn btn--outline">
							See All 6 Included Deliverables
						</a>
					</div>
				</div>

				<!-- Right 5 Columns: Interactive Live SPX Alert Ticket Simulator -->
				<aside
					class="alert-simulator"
					aria-label="Interactive Sample SPX Profit Pulse Alert Ticket"
				>
					<div class="alert-simulator__header">
						<div>
							<span class="meta-label">Zero-Latency API Dispatch Preview</span>
							<h2 class="alert-simulator__title">Inspect a Real SPX Profit Pulse Alert</h2>
						</div>
						<span class="alert-simulator__badge">Exact Levels</span>
					</div>

					<p class="alert-simulator__intro">
						Click the three SPX playbooks below to see the exact coordinates delivered in every
						alert and video watchlist:
					</p>

					<div class="sim-tabs" role="tablist" aria-label="Select SPX Alert Playbook Type">
						<button
							type="button"
							role="tab"
							aria-selected={activeAlertTab === 'zero-dte-momentum'}
							class="sim-tab"
							class:sim-tab--active={activeAlertTab === 'zero-dte-momentum'}
							onclick={() => (activeAlertTab = 'zero-dte-momentum')}
						>
							0DTE Ignition
						</button>
						<button
							type="button"
							role="tab"
							aria-selected={activeAlertTab === 'gamma-wall-reversal'}
							class="sim-tab"
							class:sim-tab--active={activeAlertTab === 'gamma-wall-reversal'}
							onclick={() => (activeAlertTab = 'gamma-wall-reversal')}
						>
							Gamma Reversal
						</button>
						<button
							type="button"
							role="tab"
							aria-selected={activeAlertTab === 'defined-risk-spread'}
							class="sim-tab"
							class:sim-tab--active={activeAlertTab === 'defined-risk-spread'}
							onclick={() => (activeAlertTab = 'defined-risk-spread')}
						>
							Vertical Spread
						</button>
					</div>

					<!-- Simulated Dispatch Ticket -->
					<div class="ticket-body">
						<div class="ticket-body__head">
							<span class="ticket-body__code">{currentSample.tabLabel}</span>
							<span class="ticket-body__live">● INSTANT DISPATCH</span>
						</div>

						<h3 class="ticket-body__name">{currentSample.setupName}</h3>

						<dl class="ticket-specs">
							<div class="ticket-specs__row">
								<dt>Contract / Spread Structure:</dt>
								<dd>{currentSample.structureType}</dd>
							</div>
							<div class="ticket-specs__row">
								<dt>Institutional Regime Read:</dt>
								<dd>{currentSample.marketRegime}</dd>
							</div>
							<div class="ticket-specs__row">
								<dt>Targeted Entry Trigger:</dt>
								<dd>{currentSample.entryZone}</dd>
							</div>
							<div class="ticket-specs__row">
								<dt>Profit Exit Target 1 &amp; Target 2:</dt>
								<dd>
									<strong>T1:</strong>
									{currentSample.targetOne}<br />
									<strong>T2:</strong>
									{currentSample.targetTwo}
								</dd>
							</div>
							<div class="ticket-specs__row ticket-specs__row--stop">
								<dt>Hard Invalidation Stop-Loss:</dt>
								<dd>{currentSample.hardStop}</dd>
							</div>
						</dl>

						<div class="ticket-body__thesis">
							<strong>Billy’s Institutional Note:</strong>
							{currentSample.thesisNote}
						</div>
					</div>

					<div class="alert-simulator__footer">
						<a href="#choose-your-package" class="btn btn--solid btn--full">
							Start Receiving SPX Profit Pulse Alerts ↓
						</a>
					</div>
				</aside>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 3: WHEN YOU SIGN UP, YOU GET THESE 6 DELIVERABLES & BONUSES
       (Upgrades Simpler's 5 Bonuses Section With Zero Fluff)
       ========================================================================= -->
		<section id="exclusive-bonuses" class="deliverables-section" aria-labelledby="deliverables-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">Educate • Innovate • Prosper</span>
					<h2 id="deliverables-h2" class="section-h2">
						When You Sign Up, You Get These 6 Core Deliverables &amp; Exclusive Bonuses
					</h2>
					<p class="body-copy section-header__sub">
						SPX Profit Pulse is more than a text notification—it is a complete S&amp;P 500
						institutional intelligence system designed so you understand the exact level, thesis,
						and risk before entering:
					</p>
				</div>

				<div class="deliverables-grid">
					{#each serviceDeliverables as item (item.code)}
						<article class="deliverable-card">
							<div>
								<div class="deliverable-card__top">
									<span class="meta-label">{item.code}</span>
									<span class="deliverable-card__badge">{item.badge}</span>
								</div>

								<h3 class="deliverable-card__title">{item.title}</h3>
								<p class="deliverable-card__desc">{item.description}</p>
							</div>

							<div class="deliverable-card__benefit">
								<strong>Your Execution Edge:</strong>
								{item.traderBenefit}
							</div>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 4: WHY INSTITUTIONAL PROS PREFER SPX INDEX OPTIONS (4 ADVANTAGES)
       ========================================================================= -->
		<section class="advantages-section" aria-labelledby="advantages-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">Structural Alpha • Tax &amp; Liquidity Mathematics</span>
					<h2 id="advantages-h2" class="section-h2">
						Why Institutional Desks Trade SPX Index Options Over Individual Stocks
					</h2>
					<p class="body-copy section-header__sub">
						Focusing exclusively on the S&amp;P 500 Index gives you four structural advantages that
						single-stock traders never enjoy:
					</p>
				</div>

				<div class="advantages-grid">
					{#each spxStructuralAdvantages as adv (adv.num)}
						<article class="advantage-card">
							<div class="advantage-card__head">
								<span class="advantage-card__num">Advantage #{adv.num}</span>
								<span class="meta-label">{adv.subtitle}</span>
							</div>
							<h3 class="advantage-card__title">{adv.title}</h3>
							<p class="advantage-card__detail">{adv.detail}</p>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 5: CHOOSE YOUR MEMBERSHIP CADENCE (MONTHLY / QUARTERLY / ANNUAL)
       (Upgrades Simpler's 3-Column Package Section — Strictly Zero Prices Shown)
       ========================================================================= -->
		<section id="choose-your-package" class="packages-section" aria-labelledby="packages-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">People Over Making Money • Accessible Tiers</span>
					<h2 id="packages-h2" class="section-h2">
						Choose Your SPX Profit Pulse Membership Cadence
					</h2>
					<p class="body-copy section-header__sub">
						We keep SPX Profit Pulse genuinely affordable so your trading capital stays inside your
						brokerage account where it belongs. Select your preferred enrollment cadence below:
					</p>
				</div>

				<div class="packages-grid">
					{#each cadencePackages as pkg (pkg.id)}
						<article class="package-card" class:package-card--featured={pkg.featured}>
							<div>
								{#if pkg.badgeText}
									<div class="package-card__ribbon">{pkg.badgeText}</div>
								{/if}

								<div class="package-card__header">
									<span class="meta-label">{pkg.tierTag}</span>
									<h3 class="package-card__title">{pkg.name}</h3>
									<p class="package-card__sub">{pkg.subtitle}</p>
								</div>

								<div class="package-card__body">
									<span class="meta-label">Package Includes:</span>
									<ul class="package-list">
										{#each pkg.includes as inc (inc)}
											<li>
												<span class="check-mark" aria-hidden="true">✓</span>
												<span>{inc}</span>
											</li>
										{/each}
									</ul>
								</div>
							</div>

							<div class="package-card__footer">
								<a
									href={resolve('/contact' as '/')}
									class="btn btn--full"
									class:btn--solid={pkg.featured}
									class:btn--outline={!pkg.featured}
								>
									{pkg.ctaLabel}
								</a>
							</div>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 6: MEET THE TRADER BEHIND SPX PROFIT PULSE (SINGLE CLEAN BIO)
       (Fixes Simpler Trading's Triplicated Bio Bug)
       ========================================================================= -->
		<section class="trader-section" aria-labelledby="trader-h2">
			<div class="container">
				<div class="trader-box">
					<div class="trader-box__grid">
						<div class="trader-box__profile">
							<img
								src="https://revolutiontradingpros.com/wp-content/uploads/2025/05/Billy-no-grey-768x768.png.webp"
								alt="Billy Ribeiro — Founder of Revolution Trading Pros"
								width="190"
								height="190"
								loading="lazy"
								class="trader-box__avatar"
							/>
							<span class="trader-box__seal">Goldman Sachs Prop Mentored</span>
						</div>

						<div class="trader-box__content">
							<span class="section-kicker">Meet Your Head Strategist • Single Unified Desk</span>
							<h2 id="trader-h2" class="section-h2">
								Billy Ribeiro — The Only Trader Feared by Wall Street
							</h2>
							<p class="trader-box__subtitle">
								Founder of Revolution Trading Pros • Mentored Directly by Mark "Goldfinger"
								McGoldrick
							</p>

							<p class="body-copy">
								Early in his career, <strong>Billy Ribeiro</strong> stood on the losing end of the
								market and experienced firsthand how retail traders are exploited by overpriced
								courses and fake, repainted "holy grail" indicators. Everything changed when Billy
								was mentored directly by former Wall Street Goldman Sachs proprietary trading legend
								<strong>Mark "Goldfinger" McGoldrick</strong>—who explicitly called Billy
								<strong>"The Future of Trading."</strong>
							</p>

							<p class="body-copy">
								Combining Goldman Sachs institutional order flow with his proprietary non-repainting
								system (<strong>"The Move Prior to The Move™"</strong>), Billy accurately called
								both the <strong>2020 COVID Crash Top and Generational Bottom</strong>, called the
								<strong>2022 Bull Market Top and Bear Bottom</strong>, and embarrassed
								<strong>Warren Buffett live on Occidental Petroleum (OXY)</strong> by shorting with
								Put Options for a <strong>600% overnight gain</strong> while Buffett went long
								millions of dollars. Inside <strong>SPX Profit Pulse</strong>, Billy delivers his
								highest-conviction S&amp;P 500 index setups directly to you.
							</p>

							<div class="cta-row">
								<a href="#choose-your-package" class="btn btn--solid">
									Join SPX Profit Pulse Today ↑
								</a>
								<a href={resolve('/about')} class="btn btn--outline">
									Read Full Track Record &amp; Story →
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 7: WHAT MEMBERS SAY ABOUT SPX PROFIT PULSE (4 UNIQUE REVIEWS)
       (Fixes Simpler Trading's Duplicate Testimonial Copy-Paste Bug)
       ========================================================================= -->
		<section class="reviews-section" aria-labelledby="reviews-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">Verified Member Experience • Zero Duplicates</span>
					<h2 id="reviews-h2" class="section-h2">
						Here’s What Members Are Saying About SPX Profit Pulse
					</h2>
				</div>

				<div class="reviews-grid">
					{#each testimonials as t (t.author)}
						<blockquote class="review-card">
							<p class="review-card__quote">"{t.quote}"</p>
							<footer class="review-card__footer">
								<strong>— {t.author}</strong>
								<span>{t.profile}</span>
								<span class="review-card__strategy">{t.strategyUsed}</span>
							</footer>
						</blockquote>
					{/each}
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 8: SPX PROFIT PULSE FAQ ACCORDION + LIVE SUPPORT CALLOUT
       ========================================================================= -->
		<section id="faq" class="faq-section" aria-labelledby="spx-faq-h2">
			<div class="container faq-container">
				<div class="section-header">
					<span class="section-kicker">Direct Transparency • Zero Marketing Spin</span>
					<h2 id="spx-faq-h2" class="section-h2">
						Frequently Asked Questions About SPX Profit Pulse
					</h2>
				</div>

				<div class="faq-list">
					{#each SPX_PROFIT_PULSE_FAQ_ITEMS as faq, idx (faq.id)}
						<details class="faq-item" open={idx === 0}>
							<summary class="faq-item__question">
								<h3 class="faq-item__heading">{faq.question}</h3>
								<span class="faq-item__icon" aria-hidden="true">+</span>
							</summary>
							<p class="faq-item__answer">{faq.answer}</p>
						</details>
					{/each}
				</div>

				<div class="support-banner">
					<h3 class="support-banner__title">Have Questions Before Joining SPX Profit Pulse?</h3>
					<p class="support-banner__copy">
						Speak directly with our team at <strong>+1 (203) 721-0940</strong>, email
						<a href="mailto:support@revolutiontradingpros.com">support@revolutiontradingpros.com</a
						>, or <a href={resolve('/contact' as '/')}>send us a message online</a>.
					</p>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 9: EXPLORE THE REST OF OUR ECOSYSTEM (5-CARD ROOM & ALERT GRID)
       ========================================================================= -->
		<section class="pro-cta-section" aria-labelledby="pro-cta-h2">
			<div class="container">
				<div class="pro-cta-box">
					<div class="pro-cta-box__header">
						<span class="section-kicker">Educate • Innovate • Prosper</span>
						<h2 id="pro-cta-h2" class="section-h2 pro-cta-box__h2">
							Explore Our Complete Trading Rooms, Alerts &amp; Non-Repainting Tools
						</h2>
						<p class="body-copy pro-cta-box__sub">
							Whether you want live voice execution, multi-day stock swings, or $500+ small account
							mentorship, we have a dedicated home built for you:
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
