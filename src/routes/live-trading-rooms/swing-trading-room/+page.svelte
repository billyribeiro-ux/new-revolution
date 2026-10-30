<!-- src/routes/live-trading-rooms/swing-trading-room/+page.svelte -->
<script lang="ts">
	import '#lib/styles/inner-page.css';
	import { resolve } from '$app/paths';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import CheckCircleIcon from 'phosphor-svelte/lib/CheckCircleIcon';
	import XCircleIcon from 'phosphor-svelte/lib/XCircleIcon';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import { SWING_TRADING_ROOM_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	interface WeeklyWorkflowStep {
		stepCode: string;
		timeCommitment: string;
		title: string;
		description: string;
		deliverables: string[];
	}

	interface SwingStrategyPillar {
		code: string;
		holdWindow: string;
		title: string;
		retailTrap: string;
		institutionalEdge: string;
		riskStructure: string;
	}

	interface ComparisonRow {
		dimension: string;
		typicalSwingServices: string;
		revolutionSwingRoom: string;
	}

	const workflowSteps: WeeklyWorkflowStep[] = [
		{
			stepCode: 'Phase 01 // Sunday & Evening Macro Prep',
			timeCommitment: '20 Mins Evening Review',
			title: 'Top-Down Macro Regime, Sector Rotation & Institutional Watchlist',
			description:
				'Before the trading week begins—and each evening after the market closes—we map where institutional capital is rotating across indexes, sector ETFs, and leading stocks so you never have to scramble at the 9:30 AM opening bell.',
			deliverables: [
				'Macro breadth, volatility regime, and institutional accumulation/distribution read',
				'Focused multi-day watchlist of high-liquidity stocks, ETFs, and options structures',
				'Complete video and chart walkthroughs available on demand around your work and family schedule'
			]
		},
		{
			stepCode: 'Phase 02 // Pre-Planned Order Structuring',
			timeCommitment: '10 Mins Pre-Market or Mobile',
			title: 'Exact Trigger Entries, Tiered Profit Targets & Hard Stop-Losses',
			description:
				'Because you have a career or business to run, every swing setup is delivered well ahead of the trigger with exact price coordinates. You can input conditional orders on your phone or desktop in minutes and go back to your day.',
			deliverables: [
				'Exact entry trigger zone—never vague "watch this ticker" commentary',
				'Specific options contract structure (strike, expiration, delta, and debit/credit spread selection)',
				'Pre-calculated hard invalidation stop-loss and tiered profit-taking targets (Target 1, Target 2, Runner)'
			]
		},
		{
			stepCode: 'Phase 03 // Multi-Day Position Management',
			timeCommitment: 'Real-Time Room & Alert Updates',
			title: 'Scaling Out Into Strength, Trailing Stops & Overnight Risk Control',
			description:
				'Capturing 3-to-15-day institutional swings requires knowing when to lock in partial profits, when to raise stops to breakeven, and how to hedge overnight macro catalysts without getting shaken out by normal intraday noise.',
			deliverables: [
				'Instant room updates whenever a swing setup triggers, hits Target 1, or adjusts its trailing stop',
				'Options time-decay (Theta) and implied volatility (Vega) protection rules for multi-day holds',
				'Portfolio-level exposure limits so you never over-concentrate in a single sector'
			]
		},
		{
			stepCode: 'Phase 04 // Interactive Desk Reviews & Q&A',
			timeCommitment: 'Live & Recorded Sessions',
			title: 'Deep-Dive Chart Diagnostics, Open Position Audits & Member Q&A',
			description:
				'Unlike one-way alert newsletters that leave you guessing, the Swing Trading Room gives you direct access to our desk to review open positions, diagnose tickers on your personal radar, and master institutional swing mechanics.',
			deliverables: [
				'Interactive chart reviews breaking down every open and closed swing trade',
				'Full archive of recorded sessions so working professionals in any time zone never miss a setup',
				'Direct education on why a setup worked—building your lifelong independence as a trader'
			]
		}
	];

	const swingStrategies: SwingStrategyPillar[] = [
		{
			code: 'Playbook 01 // Multi-Week Institutional Accumulation Breakouts',
			holdWindow: '3 to 15 Trading Days',
			title: 'Compression-to-Expansion Breakouts Backed by Smart-Money Volume',
			retailTrap:
				'Retail swing traders buy late into extended 5-day rallies right as institutional algorithms begin distributing shares into retail FOMO.',
			institutionalEdge:
				'Using the proprietary order-flow principles passed down by former Goldman Sachs legend Mark "Goldfinger" McGoldrick, we identify multi-week institutional accumulation bases and enter as smart-money volume ignites out of compression.',
			riskStructure:
				'Hard stop placed below the institutional accumulation shelf, targeting a minimum 3:1 to 5:1 reward-to-risk expansion.'
		},
		{
			code: 'Playbook 02 // Contrarian Distribution & Liquidity Exhaustion Swings',
			holdWindow: '1 to 10 Trading Days',
			title: 'The +600% OXY Put Options Playbook: Fading Retail Euphoria at Structural Tops',
			retailTrap:
				'When mainstream financial media celebrates a billionaire headline or earnings hype, retail traders pile in on the long side at the exact top of a liquidity sweep.',
			institutionalEdge:
				'This is the exact methodology we used when Warren Buffett went long millions of dollars in Occidental Petroleum (OXY) and we shorted live with OXY Put Options for a 600% overnight gain. We spot institutional distribution hiding behind bullish headlines.',
			riskStructure:
				'Defined-risk put options or put debit spreads with capped downside and explosive asymmetric payoff during multi-day unwinds.'
		},
		{
			code: 'Playbook 03 // Macro Inflection & Sector Rotation Swings',
			holdWindow: '1 to 4 Weeks',
			title: 'Riding Major Regime Shifts Using Our 2020 & 2022 Cycle Framework',
			retailTrap:
				'Most swing services use static bull-market rules that get obliterated when the macro regime flips from accumulation to bear distribution.',
			institutionalEdge:
				'Anchored in the exact macro timing framework that called the 2020 COVID top and bottom and the 2022 bull market top and bear market bottom, we rotate capital into leading sectors—or pivot to index/sector puts when macro breadth breaks.',
			riskStructure:
				'Top-down sector relative strength filtering combined with trailing structural stops behind daily and weekly higher lows.'
		},
		{
			code: 'Playbook 04 // Asymmetric Options Spreads & Time-Decay Control',
			holdWindow: '3 to 21 Trading Days',
			title: 'Structuring Calls, Puts, Verticals & Diagonals That Survive Overnight Noise',
			retailTrap:
				'Amateurs buy short-dated, far out-of-the-money weekly options for swing trades and lose money to Theta decay even when the stock moves in their direction.',
			institutionalEdge:
				'We structure swing options positions with institutional precision—selecting the right expiration window, delta profile, or vertical/diagonal spread so time decay and implied volatility work in your favor.',
			riskStructure:
				'100% defined capital at risk per trade—knowing your maximum dollar risk before you ever submit the order.'
		}
	];

	const comparisonData: ComparisonRow[] = [
		{
			dimension: 'Core Ethical Priority',
			typicalSwingServices:
				'Selling $3,000 upsell courses and $2,000 repainted "holy grail" swing indicators.',
			revolutionSwingRoom:
				'People Over Profits: Accessible membership focused entirely on member growth and consistency.'
		},
		{
			dimension: 'Institutional Lineage',
			typicalSwingServices:
				'Part-time social media marketers with zero Wall Street training or verified macro calls.',
			revolutionSwingRoom:
				'Mentored by former Goldman Sachs prop legend Mark "Goldfinger" McGoldrick ("the future of trading").'
		},
		{
			dimension: '9-to-5 Schedule Compatibility',
			typicalSwingServices:
				'Sends impulsive mid-day alerts that are already up 40% by the time you check your phone.',
			revolutionSwingRoom:
				'Pre-planned setups with exact entry zones, targets, and stops you can set in 15–20 minutes a day.'
		},
		{
			dimension: 'Options Structuring',
			typicalSwingServices:
				'Reckless out-of-the-money lottery tickets that decay to zero over a 3-day hold.',
			revolutionSwingRoom:
				'Institutional expiration, delta, and spread structuring built to hold cleanly across multi-day moves.'
		},
		{
			dimension: 'Proven Track Record',
			typicalSwingServices:
				'Cherry-picked hindsight screenshots with losing trades quietly deleted.',
			revolutionSwingRoom:
				'Called the 2020 & 2022 market tops and bottoms and banked +600% overnight on OXY Put Options live.'
		}
	];
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#swing-trading-room-page">Skip to content</a>

<Navbar />

<main id="swing-trading-room-page" class="inner-page swing-room-page">
	<!-- =========================================================================
       SECTION 1: BREADCRUMB & SCHEDULE TELEMETRY BAR
       ========================================================================= -->
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true" class="crumb-sep"><CaretRightIcon size={12} weight="bold" /></li>
				<li><span>Live Trading Rooms</span></li>
				<li aria-hidden="true" class="crumb-sep"><CaretRightIcon size={12} weight="bold" /></li>
				<li aria-current="page">Swing Trading Room</li>
			</ol>
			<p class="breadcrumb-bar__telemetry">
				<span>Built for Working Professionals</span> •
				<span>Multi-Day Stocks, ETFs &amp; Options</span> • <span>US &amp; Canada</span>
			</p>
		</div>
	</nav>

	<!-- =========================================================================
       SECTION 2: ABOVE-THE-FOLD HERO SECTION (12-COLUMN ASYMMETRIC SPLIT)
       ========================================================================= -->
	<section class="section hero-section" aria-labelledby="swing-room-h1">
		<div class="container hero-section__grid">
			<!-- Left 7 Columns: Search-Intent H1 + Working Professional Authority Hook -->
			<div class="hero-section__main">
				<div class="eyebrow-pill">
					<span class="eyebrow-pill__badge">People Over Profits</span>
					<span class="eyebrow-pill__text">
						Mentored by Former Goldman Sachs Legend Mark "Goldfinger" McGoldrick
					</span>
				</div>

				<h1 id="swing-room-h1" class="hero-h1">
					<span class="hero-h1__seo-kicker seo-kicker">
						Stock, ETF &amp; Options Swing Trading Room for Working Professionals
					</span>
					<span class="hero-h1__display">
						Capture Institutional Multi-Day Moves Without Quitting Your Career or Staring at Screens
						All Day.
					</span>
				</h1>

				<p class="lead-copy">
					When you step into the <strong>Revolution Trading Pros Swing Trading Room</strong>, you
					immediately know you finally found what you have been searching for—not hype, not fake
					"holy grail" repainted indicators, and not impulsive alerts you miss while at work, but
					<strong>pre-planned institutional swing execution built around your real life</strong>.
				</p>

				<p class="body-copy">
					<strong
						>I know what it feels like to be on the losing end of the market, because I stood there
						myself in the past.</strong
					>
					I know the frustration of working hard at your job, buying an overpriced course from an internet
					guru, and watching your swing trades get chopped to pieces because nobody taught you institutional
					accumulation, options time-decay control, or hard stop-losses. That is why we built this room
					with one uncompromising rule:
					<strong>we focus on PEOPLE, not making money.</strong>
				</p>

				<p class="body-copy">
					Directly mentored by former Wall Street Goldman Sachs proprietary trading giant
					<strong>Mark "Goldfinger" McGoldrick</strong>—who explicitly called me
					<em>"the future of trading"</em>—I became the only retail trader feared by Wall Street:
					calling the <strong>2020 COVID Top and Bottom</strong>, calling the
					<strong>2022 Bull Market Top and Bear Bottom</strong>, and embarrassing
					<strong>Warren Buffett live on Occidental Petroleum (OXY)</strong> when he went long
					millions of dollars and I shorted with Put Options for a
					<strong>600% overnight gain</strong>. Now, we hand you that exact multi-day institutional
					playbook in 15 to 20 minutes a day.
				</p>

				<blockquote class="editorial-quote">
					"Educate, Innovate, and Prosper. You don't need six monitors or eight free hours a day to
					trade like a Goldman Sachs prop desk—you need pre-planned institutional structure, exact
					entries, and ironclad stops."
				</blockquote>

				<div class="cta-row">
					<a href="#join-swing-trading-room" class="btn btn-primary">
						Join the Swing Trading Room
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</a>
					<a href="#working-pro-workflow" class="btn btn-outline">
						See the 20-Minute Working Pro Routine
					</a>
				</div>

				<!-- 4-Column Telemetry Strip -->
				<dl class="hero-metrics">
					<div class="hero-metrics__item">
						<dt>Ideal Trader Profile</dt>
						<dd>9-to-5 Pros &amp; Swing Traders</dd>
					</div>
					<div class="hero-metrics__item">
						<dt>Typical Hold Duration</dt>
						<dd>2 Days to 3+ Weeks</dd>
					</div>
					<div class="hero-metrics__item">
						<dt>Daily Time Required</dt>
						<dd>15–20 Mins Pre-Planned</dd>
					</div>
					<div class="hero-metrics__item">
						<dt>Risk Architecture</dt>
						<dd>Exact Entries, Targets &amp; Stops</dd>
					</div>
				</dl>
			</div>

			<!-- Right 5 Columns: Pre-Planned Swing Execution Blueprint Card -->
			<aside class="swing-blueprint" aria-label="Sample Pre-Planned Swing Trade Dossier">
				<div class="swing-blueprint__header">
					<div>
						<span class="meta-label">9-to-5 Execution Architecture</span>
						<h2 class="swing-blueprint__title">How Every Swing Setup Is Delivered</h2>
					</div>
					<span class="swing-blueprint__tag">Set &amp; Execute</span>
				</div>

				<p class="swing-blueprint__intro">
					You never have to panic-buy a moving candle from a meeting room. Every multi-day stock,
					ETF, and options swing trade is mapped out ahead of time with five institutional
					coordinates:
				</p>

				<div class="blueprint-items">
					<div class="blueprint-item">
						<div class="blueprint-item__top">
							<span class="blueprint-item__code">01 // Macro &amp; Sector Thesis</span>
							<span class="blueprint-item__pill">Video + Chart Markup</span>
						</div>
						<p>
							Full breakdown of institutional accumulation or distribution, sector relative
							strength, and why smart money is positioning for a multi-day move.
						</p>
					</div>

					<div class="blueprint-item">
						<div class="blueprint-item__top">
							<span class="blueprint-item__code">02 // Exact Entry Trigger Zone</span>
							<span class="blueprint-item__pill">Conditional Order Ready</span>
						</div>
						<p>
							The exact price level and volume confirmation required to trigger the swing—allowing
							you to place limit or stop-limit orders before work.
						</p>
					</div>

					<div class="blueprint-item">
						<div class="blueprint-item__top">
							<span class="blueprint-item__code">03 // Options Contract or Equity Structure</span>
							<span class="blueprint-item__pill">Zero Theta Traps</span>
						</div>
						<p>
							Exact strike, expiration date (with ample time cushion), or vertical/diagonal spread
							structure so overnight holds never bleed out to time decay.
						</p>
					</div>

					<div class="blueprint-item">
						<div class="blueprint-item__top">
							<span class="blueprint-item__code"
								>04 // Hard Stop-Loss &amp; Tiered Profit Targets</span
							>
							<span class="blueprint-item__pill">3R–5R Asymmetry</span>
						</div>
						<p>
							Pre-defined invalidation stop-loss level plus Target 1, Target 2, and trailing runner
							zones so your downside is capped and your upside compounds.
						</p>
					</div>
				</div>

				<div class="swing-blueprint__footer">
					<p class="swing-blueprint__note">
						Only want the video watchlist &amp; alerts without the full room? See
						<a href={resolve('/alert-services/explosive-swings' as '/')}>Explosive Swings →</a>
					</p>
				</div>
			</aside>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 3: THE 20-MINUTE WORKING PROFESSIONAL WORKFLOW (4-STAGE ROUTINE)
       ========================================================================= -->
	<section id="working-pro-workflow" class="section workflow-section" aria-labelledby="workflow-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Engineered for Busy Careers • Zero Screen Addiction</span>
				<h2 id="workflow-h2">The 20-Minute Working Professional Swing Trading Workflow</h2>
				<p class="body-copy section-header__sub">
					You don’t lose to Wall Street because you have a full-time job—you lose when you try to
					day trade on a 5-minute break without a plan. Here is how our members trade institutional
					swings alongside demanding careers:
				</p>
			</div>

			<div class="workflow-grid">
				{#each workflowSteps as step (step.stepCode)}
					<article class="workflow-card">
						<div>
							<div class="workflow-card__top">
								<span class="meta-label">{step.stepCode}</span>
								<span class="workflow-card__badge">{step.timeCommitment}</span>
							</div>

							<h3 class="workflow-card__title">{step.title}</h3>
							<p class="workflow-card__desc">{step.description}</p>
						</div>

						<div class="workflow-card__deliverables">
							<span class="meta-label">Included in Your Room Membership:</span>
							<ul class="check-list">
								{#each step.deliverables as deliverable (deliverable)}
									<li>
										<span class="deliverable-check" aria-hidden="true"
											><CheckCircleIcon size={18} weight="fill" /></span
										>
										<span>{deliverable}</span>
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
       SECTION 4: THE 4 INSTITUTIONAL SWING PLAYBOOKS WE EXECUTE (2x2 BENTO)
       ========================================================================= -->
	<section class="section is-light playbooks-section" aria-labelledby="playbooks-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Goldman Sachs Mentored Methodology • Verified Market Calls</span>
				<h2 id="playbooks-h2">Four Institutional Swing Playbooks Forged in Real Market Cycles</h2>
				<p class="body-copy section-header__sub">
					Simple "buy the dip" retail swing trading gets crushed when volatility expands. Every
					trade in our Swing Trading Room is governed by one of four institutional playbooks:
				</p>
			</div>

			<div class="playbooks-grid">
				{#each swingStrategies as strategy (strategy.code)}
					<article class="playbook-card">
						<div class="playbook-card__header">
							<span class="meta-label">{strategy.code}</span>
							<span class="playbook-card__window">Hold: {strategy.holdWindow}</span>
						</div>

						<h3 class="playbook-card__title">{strategy.title}</h3>

						<dl class="playbook-card__specs">
							<div>
								<dt>Why Retail Swing Traders Get Trapped:</dt>
								<dd>{strategy.retailTrap}</dd>
							</div>
							<div>
								<dt>Our Institutional Execution Edge:</dt>
								<dd>{strategy.institutionalEdge}</dd>
							</div>
							<div class="playbook-card__risk">
								<dt>Risk, Stop-Loss &amp; Options Structure:</dt>
								<dd>{strategy.riskStructure}</dd>
							</div>
						</dl>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 5: FAKE GURU SWING NEWSLETTERS VS. OUR SWING ROOM (COMPARISON)
       ========================================================================= -->
	<section class="section comparison-section" aria-labelledby="comparison-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">The Anti-Guru Standard • Hard Evidence</span>
				<h2 id="comparison-h2">
					Why Most Swing Trading Alert Services Fail Working Professionals—And How We Protect You
				</h2>
				<p class="body-copy section-header__sub">
					Compare the typical retail stock-picking newsletter against the institutional discipline
					inside the Revolution Trading Pros Swing Trading Room:
				</p>
			</div>

			<div class="table-wrapper" role="region" aria-labelledby="comparison-h2">
				<table class="comparison-table">
					<thead>
						<tr>
							<th scope="col">Comparison Standard</th>
							<th scope="col">Typical "Guru" Swing Newsletters &amp; Indicators</th>
							<th scope="col">Revolution Trading Pros Swing Trading Room</th>
						</tr>
					</thead>
					<tbody>
						{#each comparisonData as row (row.dimension)}
							<tr>
								<th scope="row" class="comparison-table__feature">{row.dimension}</th>
								<td class="comparison-table__negative">
									<XCircleIcon
										size={18}
										weight="fill"
										class="ic-mark ic-mark--no"
										aria-hidden="true"
									/>
									{row.typicalSwingServices}
								</td>
								<td class="comparison-table__positive">
									<CheckCircleIcon
										size={18}
										weight="fill"
										class="ic-mark ic-mark--yes"
										aria-hidden="true"
									/>
									{row.revolutionSwingRoom}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 6: HONEST FIT CHECK (SWING ROOM VS. EXPLOSIVE SWINGS VS. SMALL ACCOUNTS)
       ========================================================================= -->
	<section
		id="join-swing-trading-room"
		class="section is-light routing-section"
		aria-labelledby="routing-h2"
	>
		<div class="container">
			<div class="routing-header section-heading">
				<span class="eyebrow">People Over Making Money • Choose Your Exact Fit</span>
				<h2 id="routing-h2">
					Enroll in the Swing Trading Room—Or Select the Tier Built for Your Capital &amp; Schedule
				</h2>
				<p class="body-copy section-header__sub">
					We never push you into the wrong tier just to collect a fee. Compare our three multi-day
					and account-specific pathways below so you start in the exact right place:
				</p>
			</div>

			<div class="routing-grid">
				<!-- Primary Selection: Swing Trading Room -->
				<article class="route-card route-card--featured">
					<div>
						<div class="route-card__top">
							<span class="meta-label">You Are Here // Full Room Experience</span>
							<span class="route-card__badge">Best for Working Professionals</span>
						</div>
						<h3 class="route-card__title">Swing Trading Room</h3>
						<p class="route-card__copy">
							The complete interactive swing trading desk: evening and weekly video chart reviews,
							pre-planned stock, ETF, and options swing setups with exact entries, targets, and
							stops, portfolio rotation workshops, and direct Q&amp;A with our team.
						</p>
					</div>
					<a href={resolve('/contact' as '/')} class="btn btn-dark btn--full">
						Enroll in the Swing Trading Room
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</a>
				</article>

				<!-- Option 2: Explosive Swings (Alert-Only Video Watchlist) -->
				<article class="route-card">
					<div>
						<div class="route-card__top">
							<span class="meta-label">Want Alert-Only Video Watchlists?</span>
						</div>
						<h3 class="route-card__title">Explosive Swings (Alert Service)</h3>
						<p class="route-card__copy">
							Prefer an ultra-affordable alert-only membership without full room sessions?
							<a href={resolve('/alert-services/explosive-swings' as '/')}>Explosive Swings</a>
							sends you our detailed video watchlists and trade alerts complete with exact targeted entries,
							profit exits, and stop-loss levels.
						</p>
					</div>
					<a
						href={resolve('/alert-services/explosive-swings' as '/')}
						class="btn btn-outline-dark btn--full"
					>
						Explore Explosive Swings Alerts
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</a>
				</article>

				<!-- Option 3: Small Accounts Room ($500+ Capital) -->
				<article class="route-card">
					<div>
						<div class="route-card__top">
							<span class="meta-label">Starting With a $500+ Account?</span>
						</div>
						<h3 class="route-card__title">Small Accounts Room ($500+ Capital)</h3>
						<p class="route-card__copy">
							Growing an account starting as low as <strong>$500</strong>? Our dedicated
							<a href={resolve('/live-trading-rooms/small-accounts-room' as '/')}
								>Small Accounts Room</a
							>
							teaches strict small-account risk management, affordable options and stock selection, and
							safe capital compounding.
						</p>
					</div>
					<a
						href={resolve('/live-trading-rooms/small-accounts-room' as '/')}
						class="btn btn-outline-dark btn--full"
					>
						Explore Small Accounts Room
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</a>
				</article>
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 7: SWING TRADING ROOM FAQ ACCORDION (SEO & AI OVERVIEW OPTIMIZED)
       ========================================================================= -->
	<section id="faq" class="section faq-section" aria-labelledby="swing-faq-h2">
		<div class="container faq-container">
			<div class="section-heading">
				<span class="eyebrow">Direct Transparency • Zero Fluff</span>
				<h2 id="swing-faq-h2">Frequently Asked Questions About the Swing Trading Room</h2>
			</div>

			<div class="faq-list">
				{#each SWING_TRADING_ROOM_FAQ_ITEMS as item, index (item.id)}
					<details class="faq-item" open={index === 0}>
						<summary class="faq-item__question">
							<h3 class="faq-item__heading">{item.question}</h3>
							<span class="faq-item__icon" aria-hidden="true">+</span>
						</summary>
						<p class="faq-item__answer">{item.answer}</p>
					</details>
				{/each}
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 8: FINAL MOVEMENT CTA BANNER
       ========================================================================= -->
	<section class="section final-banner" aria-labelledby="final-banner-h2">
		<div class="container final-banner__inner">
			<span class="eyebrow">Educate • Innovate • Prosper</span>
			<h2 id="final-banner-h2" class="final-banner__h2">
				Wall Street Protects Its Own. Mark "Goldfinger" McGoldrick Called Us the Future of Trading.
				We Are the Revolution!
			</h2>
			<p class="body-copy final-banner__copy">
				Stop letting fake gurus, repainted indicators, and a busy 9-to-5 schedule hold back your
				financial future. Step into a Swing Trading Room that puts people over profits.
			</p>
			<div class="cta-row cta-row--centered">
				<a href={resolve('/contact' as '/')} class="btn btn-dark">
					Join the Swing Trading Room
					<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
				</a>
				<a href={resolve('/alert-services/explosive-swings' as '/')} class="btn btn-outline-dark">
					Explore Explosive Swings Alerts
				</a>
				<a
					href={resolve('/live-trading-rooms/small-accounts-room' as '/')}
					class="btn btn-outline-dark"
				>
					Small Accounts Room ($500+)
				</a>
			</div>
		</div>
	</section>
</main>

<Footer />
