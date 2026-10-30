<!-- src/routes/live-trading-rooms/day-trading-room/+page.svelte -->
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
	import { DAY_TRADING_ROOM_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	interface DailySessionBlock {
		timeWindow: string;
		phaseTag: string;
		title: string;
		description: string;
		deliverables: string[];
	}

	interface IntradaySetup {
		code: string;
		badge: string;
		title: string;
		marketCondition: string;
		executionLogic: string;
		riskProtocol: string;
	}

	interface RoomComparisonRow {
		feature: string;
		fakeGuruRooms: string;
		revolutionDayRoom: string;
	}

	const dailySchedule: DailySessionBlock[] = [
		{
			timeWindow: 'Stage 01 // Pre-Market Bell Prep',
			phaseTag: 'Institutional Level Mapping',
			title: 'Pre-Market Game Plan, Macro Catalysts & High-Conviction Watchlist',
			description:
				'Long before the 9:30 AM ET opening bell rings, we map overnight institutional liquidity pools, key gamma and volume levels, economic catalysts, and our top stock, ETF, and options setups for the session.',
			deliverables: [
				'Exact pre-market support, resistance, and institutional liquidity sweep zones',
				'Focused watchlist of high-liquidity stocks, ETFs, and options contracts (zero illiquid penny-stock traps)',
				'If/Then scenario mapping so you know our exact trigger prices before the market opens'
			]
		},
		{
			timeWindow: 'Stage 02 // Opening Bell Execution',
			phaseTag: 'Live Voice & Screen Share',
			title: 'Real-Time Opening Drive, Momentum Scalping & Options Order Flow',
			description:
				'Trade the highest-velocity window of the market alongside our desk with live voice commentary and real-time screen sharing. Watch our charts, non-repainting indicators, and order-flow scanners update tick by tick.',
			deliverables: [
				'Live voice callouts explaining the exact thesis BEFORE entry triggers are hit',
				'Defined-risk execution with exact entry price, tiered profit targets, and hard invalidation stops',
				'Real-time options contract selection (strike, expiration, and implied volatility discipline)'
			]
		},
		{
			timeWindow: 'Stage 03 // Midday Structure & Rotation',
			phaseTag: 'Capital Preservation & Trend',
			title: 'Midday Institutional Accumulation, Reversals & Patience Discipline',
			description:
				'Most retail day traders give back their morning profits between 11:30 AM and 2:00 PM ET by overtrading chop. We show you how to protect morning gains, spot institutional midday accumulation, and wait for A+ setups.',
			deliverables: [
				'Live discipline enforcement—knowing when to press size and when to sit flat on your hands',
				'Tracking sector rotation, market breadth, and institutional block flow into the afternoon session',
				'Live member Q&A and chart diagnostics while price consolidates'
			]
		},
		{
			timeWindow: 'Stage 04 // Power Hour & Post-Bell Autopsy',
			phaseTag: 'Review & Replay Archive',
			title: 'Closing Bell Order Flow, Trade Autopsies & Full Session Replays',
			description:
				'Whether we bank a massive green session or manage a disciplined stop, every trade is reviewed transparently. Missed the morning session? Full recordings and level recaps are archived for on-demand study.',
			deliverables: [
				'Power Hour institutional positioning and overnight risk assessment',
				'Transparent post-trade breakdown of both winning setups and stopped-out trades',
				'On-demand session replays so traders in any time zone never miss a lesson'
			]
		}
	];

	const intradaySetups: IntradaySetup[] = [
		{
			code: 'Setup 01 // Liquidity Sweep Reversals',
			badge: 'Stocks, ETFs & Options',
			title: 'Opening Bell Institutional Liquidity Traps & Failed Breakouts',
			marketCondition:
				'Retail traders chase obvious pre-market highs or lows right at the open, walking straight into institutional sell or buy programs.',
			executionLogic:
				'Using the proprietary order-flow principles passed down by former Goldman Sachs legend Mark "Goldfinger" McGoldrick, we wait for retail stops to get swept, confirm institutional absorption on our non-repainting indicators, and execute the reversal.',
			riskProtocol:
				'Tight, mechanical stop-loss placed directly beyond the liquidity sweep extreme for asymmetric 3R to 5R reward-to-risk.'
		},
		{
			code: 'Setup 02 // High-Velocity Options Scalping',
			badge: 'Intraday Calls, Puts & Spreads',
			title: 'Momentum Ignition & Gamma Acceleration Scalps',
			marketCondition:
				'High-volume expansion on liquid large-cap equities and index ETFs (SPY, QQQ, IWM, NVDA, TSLA, AAPL, META) breaking out of multi-day compression.',
			executionLogic:
				'We select high-liquidity options contracts with tight bid-ask spreads and optimal delta/gamma profiles—capturing rapid intraday premium expansion without holding overnight decay.',
			riskProtocol:
				'Pre-calculated position sizing and tiered profit scaling (locking in partial gains at Target 1 and moving stops to breakeven).'
		},
		{
			code: 'Setup 03 // Contrarian Distribution Shorts',
			badge: 'The +600% OXY Playbook',
			title: 'Fading Retail Euphoria Into Institutional Distribution',
			marketCondition:
				'Mainstream news or earnings headlines trigger blind retail buying into an already exhausted, overextended chart structure.',
			executionLogic:
				'The exact playbook we used when Warren Buffett bought millions in Occidental Petroleum (OXY) long and we shorted live with OXY Put Options for +600% overnight. We spot heavy institutional selling hiding behind bullish headlines.',
			riskProtocol:
				'Defined-risk put options or strict equity stop-losses above the distribution high—never averaging down on a losing short.'
		},
		{
			code: 'Setup 04 // Macro & Sector Inflection Drives',
			badge: '2020 & 2022 Cycle Framework',
			title: 'Intraday Trend Days Aligned With Macro Regime Shifts',
			marketCondition:
				'FOMC days, CPI releases, or major macro inflection sessions where institutions reprice entire sectors in a single trend day.',
			executionLogic:
				'Grounded in the macro timing methodology that called the 2020 COVID top and bottom and the 2022 bull top and bear bottom, we align intraday trades with the dominant institutional flow instead of fighting the tape.',
			riskProtocol:
				'Trailing structural stops behind institutional 5-minute and 15-minute higher lows (or lower highs) to capture full-session runners.'
		}
	];

	const comparisonRows: RoomComparisonRow[] = [
		{
			feature: 'Primary Revenue Motive',
			fakeGuruRooms:
				'Profiting off overpriced subscriptions, upsells, and $2,500 repainted indicators.',
			revolutionDayRoom:
				'People Over Profits: Affordable access focused 100% on member execution and consistency.'
		},
		{
			feature: 'Institutional Pedigree',
			fakeGuruRooms:
				'Self-proclaimed internet gurus with zero Wall Street training or verifiable macro calls.',
			revolutionDayRoom:
				'Mentored by former Goldman Sachs prop legend Mark "Goldfinger" McGoldrick ("the future of trading").'
		},
		{
			feature: 'Markets & Liquidity',
			fakeGuruRooms:
				'Illiquid micro-float penny stocks where the host buys first and dumps on the chatroom.',
			revolutionDayRoom:
				'Deeply liquid US Stocks, ETFs, and Options where every member gets clean institutional fills.'
		},
		{
			feature: 'How Trades Are Called',
			fakeGuruRooms:
				'Delayed text messages after the move already happened, with no stop-loss mentioned.',
			revolutionDayRoom:
				'Live voice & screen share walking through the exact entry trigger, targets, and hard stop ahead of time.'
		},
		{
			feature: 'Chart Telemetry & Tools',
			fakeGuruRooms:
				'Lagging retail oscillators or repainted "holy grail" buy/sell arrows that erase losses.',
			revolutionDayRoom:
				'100% non-repainting institutional indicators, real-time volume/liquidity structure, and order flow.'
		}
	];
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#day-trading-room-page">Skip to content</a>

<Navbar />

<main id="day-trading-room-page" class="inner-page day-room-page">
	<!-- =========================================================================
       SECTION 1: BREADCRUMB & LIVE TRADING FLOOR STATUS BAR
       ========================================================================= -->
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true" class="crumb-sep"><CaretRightIcon size={12} weight="bold" /></li>
				<li><span>Live Trading Rooms</span></li>
				<li aria-hidden="true" class="crumb-sep"><CaretRightIcon size={12} weight="bold" /></li>
				<li aria-current="page">Day Trading Room</li>
			</ol>
			<p class="breadcrumb-bar__telemetry">
				<span>Live Voice &amp; Screen Share</span> • <span>Stocks, ETFs &amp; Options</span> •
				<span>US &amp; Canada</span>
			</p>
		</div>
	</nav>

	<!-- =========================================================================
       SECTION 2: ABOVE-THE-FOLD HERO SECTION (12-COLUMN ASYMMETRIC SPLIT)
       ========================================================================= -->
	<section class="section hero-section" aria-labelledby="day-room-h1">
		<div class="container hero-section__grid">
			<!-- Left 7 Columns: Search-Intent H1 + Anti-Guru Authority Copy -->
			<div class="hero-section__main">
				<div class="eyebrow-pill">
					<span class="eyebrow-pill__badge">People Over Profits</span>
					<span class="eyebrow-pill__text">
						Mentored by Former Goldman Sachs Legend Mark "Goldfinger" McGoldrick
					</span>
				</div>

				<h1 id="day-room-h1" class="hero-h1">
					<span class="hero-h1__seo-kicker seo-kicker">
						Live Stock, ETF &amp; Options Day Trading Room • Real-Time Voice &amp; Screen Share
					</span>
					<span class="hero-h1__display">
						Stop Trading Alone Against Wall Street Algorithms. Trade the Opening Bell Live With Our
						Desk.
					</span>
				</h1>

				<p class="lead-copy">
					When you log into our <strong>Live Day Trading Room</strong>, you immediately know you
					finally found what you have been searching for—not a chaotic text chat shouting out
					hindsight tickers, and not a fake guru peddling repainted "holy grail" indicators, but
					<strong
						>real-time institutional execution with live voice, live screen sharing, and 100%
						transparency</strong
					>.
				</p>

				<p class="body-copy">
					<strong
						>I know how painful it is to sit on the losing end of day trading, because I stood there
						myself in the past.</strong
					>
					I watched how typical chatrooms operate: moderators front-running illiquid penny stocks so members
					become their exit liquidity, or posting winning screenshots after the close without ever mentioning
					a stop-loss. That is why I built Revolution Trading Pros around one unbreakable rule:
					<strong>we focus on PEOPLE, not making money.</strong>
				</p>

				<p class="body-copy">
					Directly mentored by former Wall Street Goldman Sachs proprietary trading giant
					<strong>Mark "Goldfinger" McGoldrick</strong>—who explicitly called me
					<em>"the future of trading"</em>—I became the only retail trader feared by Wall Street:
					calling the <strong>2020 COVID Top and Bottom</strong>, calling the
					<strong>2022 Market Top and Bottom</strong>, and embarrassing
					<strong>Warren Buffett live on OXY</strong> by shorting with Put Options for a
					<strong>600% overnight gain</strong> while he went long millions of dollars. Every morning,
					we bring that exact institutional order-flow playbook live to your screen.
				</p>

				<blockquote class="editorial-quote">
					"Educate, Innovate, and Prosper. You don't just copy tickers here—you watch our screens
					live, hear our exact thesis before the trigger hits, and master institutional risk
					control."
				</blockquote>

				<div class="cta-row">
					<a href="#join-day-trading-room" class="btn btn-primary">
						Join the Live Day Trading Room
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</a>
					<a href="#daily-floor-schedule" class="btn btn-outline">
						See Our Daily Bell-to-Bell Routine
					</a>
				</div>

				<!-- 4-Column Floor Telemetry Strip -->
				<dl class="hero-metrics">
					<div class="hero-metrics__item">
						<dt>Instruments Traded</dt>
						<dd>Liquid Stocks, ETFs &amp; Options</dd>
					</div>
					<div class="hero-metrics__item">
						<dt>Execution Format</dt>
						<dd>Live Voice, Screen Share &amp; Alerts</dd>
					</div>
					<div class="hero-metrics__item">
						<dt>Risk Architecture</dt>
						<dd>Exact Entries, Targets &amp; Stops</dd>
					</div>
					<div class="hero-metrics__item">
						<dt>Session Archive</dt>
						<dd>Daily Replays &amp; Trade Recaps</dd>
					</div>
				</dl>
			</div>

			<!-- Right 5 Columns: Live Trading Floor Execution Ticket Wireframe -->
			<aside class="execution-ticket" aria-label="Sample Live Day Trading Room Execution Blueprint">
				<div class="execution-ticket__header">
					<div>
						<span class="meta-label">Live Trading Floor Telemetry</span>
						<h2 class="execution-ticket__title">How Every Live Trade Is Structured</h2>
					</div>
					<span class="execution-ticket__status">Zero Hindsight</span>
				</div>

				<p class="execution-ticket__intro">
					We never yell "Buy now!" without a plan. Before we ever click a button on screen, every
					day trade and scalp in the room is mapped out using five mandatory institutional
					parameters:
				</p>

				<div class="ticket-steps">
					<div class="ticket-step">
						<div class="ticket-step__head">
							<span class="ticket-step__code">01 // Institutional Thesis &amp; Catalyst</span>
							<span class="ticket-step__tag">Pre-Trade Read</span>
						</div>
						<p>
							Live screen-share breakdown of where retail traders are trapped, where institutional
							liquidity sits, and why the setup has asymmetric expectancy.
						</p>
					</div>

					<div class="ticket-step">
						<div class="ticket-step__head">
							<span class="ticket-step__code">02 // Exact Entry Trigger Zone</span>
							<span class="ticket-step__tag">Price &amp; Volume</span>
						</div>
						<p>
							The exact key level, liquidity sweep, or volume confirmation required to trigger
							entry—plus the exact options strike and expiration we are selecting.
						</p>
					</div>

					<div class="ticket-step">
						<div class="ticket-step__head">
							<span class="ticket-step__code">03 // Hard Invalidation Stop-Loss</span>
							<span class="ticket-step__tag">Capital Protection</span>
						</div>
						<p>
							Stated out loud <strong>before entry</strong>. You always know the exact dollar and
							chart level where the thesis is wrong so one loss never damages your account.
						</p>
					</div>

					<div class="ticket-step">
						<div class="ticket-step__head">
							<span class="ticket-step__code">04 // Tiered Profit Scaling Targets</span>
							<span class="ticket-step__tag">Target 1 • Target 2 • Runner</span>
						</div>
						<p>
							Mechanical profit-taking zones where we scale out to lock in green cash flow and trail
							stops on remaining runners into institutional supply/demand.
						</p>
					</div>
				</div>

				<div class="execution-ticket__footer">
					<p class="execution-ticket__note">
						Starting with a $500 account? See our dedicated
						<a href={resolve('/live-trading-rooms/small-accounts-room' as '/')}
							>Small Accounts Room →</a
						>
					</p>
				</div>
			</aside>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 3: BELL-TO-BELL DAILY SCHEDULE (4-STAGE FLOOR TIMELINE)
       ========================================================================= -->
	<section id="daily-floor-schedule" class="section schedule-section" aria-labelledby="schedule-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Structured Daily Routine • Repeatable Process</span>
				<h2 id="schedule-h2">Inside a Live Market Day on Our Trading Floor</h2>
				<p class="body-copy section-header__sub">
					Amateurs show up at 9:29 AM guessing what to buy. Professionals execute a calm, repeatable
					four-stage routine every single market day:
				</p>
			</div>

			<div class="schedule-grid">
				{#each dailySchedule as block (block.timeWindow)}
					<article class="schedule-card">
						<div>
							<div class="schedule-card__top">
								<span class="meta-label">{block.timeWindow}</span>
								<span class="schedule-card__badge">{block.phaseTag}</span>
							</div>

							<h3 class="schedule-card__title">{block.title}</h3>
							<p class="schedule-card__desc">{block.description}</p>
						</div>

						<div class="schedule-card__deliverables">
							<span class="meta-label">What You Get in This Window:</span>
							<ul class="check-list">
								{#each block.deliverables as item (item)}
									<li>
										<span class="deliverable-check" aria-hidden="true"
											><CheckCircleIcon size={18} weight="fill" /></span
										>
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
       SECTION 4: THE 4 INTRADAY SETUPS WE EXECUTE LIVE (2x2 BENTO GRID)
       ========================================================================= -->
	<section class="section is-light setups-section" aria-labelledby="setups-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Goldman Sachs Mentored Order Flow • Zero Repainting</span>
				<h2 id="setups-h2">The Four Institutional Intraday Setups We Trade Live</h2>
				<p class="body-copy section-header__sub">
					We don’t chase random 1-minute candles or rely on fake "holy grail" arrows. Every trade in
					the Day Trading Room belongs to one of four high-expectancy institutional setups:
				</p>
			</div>

			<div class="setups-grid">
				{#each intradaySetups as setup (setup.code)}
					<article class="setup-card">
						<div class="setup-card__header">
							<span class="meta-label">{setup.code}</span>
							<span class="setup-card__badge">{setup.badge}</span>
						</div>

						<h3 class="setup-card__title">{setup.title}</h3>

						<dl class="setup-card__specs">
							<div>
								<dt>The Market Structure &amp; Retail Trap:</dt>
								<dd>{setup.marketCondition}</dd>
							</div>
							<div>
								<dt>Our Live Institutional Execution:</dt>
								<dd>{setup.executionLogic}</dd>
							</div>
							<div class="setup-card__risk-box">
								<dt>Risk &amp; Stop-Loss Protocol:</dt>
								<dd>{setup.riskProtocol}</dd>
							</div>
						</dl>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 5: WHY MOST DAY TRADING CHATROOMS FAIL VS. OUR DESK (COMPARISON)
       ========================================================================= -->
	<section class="section comparison-section" aria-labelledby="comparison-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">The Anti-Guru Standard • Hard Evidence</span>
				<h2 id="comparison-h2">
					Why 95% of Day Trading Chatrooms Cause Retail Traders to Blow Up—And Why We Built the
					Opposite
				</h2>
				<p class="body-copy section-header__sub">
					Before you join any live trading room in the United States or Canada, compare how typical
					internet marketers operate versus the institutional standard inside Revolution Trading
					Pros:
				</p>
			</div>

			<div class="table-wrapper" role="region" aria-labelledby="comparison-h2">
				<table class="comparison-table">
					<thead>
						<tr>
							<th scope="col">Evaluation Standard</th>
							<th scope="col">Typical "Fake Guru" Day Trading Chatrooms</th>
							<th scope="col">Revolution Trading Pros Day Trading Room</th>
						</tr>
					</thead>
					<tbody>
						{#each comparisonRows as row (row.feature)}
							<tr>
								<th scope="row" class="comparison-table__feature">{row.feature}</th>
								<td class="comparison-table__negative">
									<XCircleIcon
										size={18}
										weight="fill"
										class="ic-mark ic-mark--no"
										aria-hidden="true"
									/>
									{row.fakeGuruRooms}
								</td>
								<td class="comparison-table__positive">
									<CheckCircleIcon
										size={18}
										weight="fill"
										class="ic-mark ic-mark--yes"
										aria-hidden="true"
									/>
									{row.revolutionDayRoom}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 6: WHICH ROOM OR ALERT TIER FITS YOUR SCHEDULE & ACCOUNT SIZE?
       ========================================================================= -->
	<section
		id="join-day-trading-room"
		class="section is-light routing-section"
		aria-labelledby="routing-h2"
	>
		<div class="container">
			<div class="routing-banner">
				<div class="routing-banner__main">
					<div class="section-heading">
						<span class="eyebrow">People Over Making Money • Honest Fit Check</span>
						<h2 id="routing-h2">
							Step Into the Live Day Trading Room—Or Choose the Exact Room Built for Your Life
						</h2>
						<p class="body-copy section-header__sub">
							Because our mission is helping you prosper rather than forcing everyone into a single
							subscription, make sure you choose the room or alert service that matches your daily
							schedule and starting capital:
						</p>
					</div>

					<div class="routing-cards">
						<!-- Current Page Primary Selection -->
						<article class="route-card route-card--primary">
							<div>
								<div class="route-card__top">
									<span class="meta-label">You Are Here // Intraday Execution</span>
									<span class="route-card__pill">Most Popular For Active Traders</span>
								</div>
								<h3 class="route-card__title">Live Day Trading Room</h3>
								<p class="route-card__copy">
									Ideal for active day traders, options scalpers, and full-time traders who can
									attend the morning bell session (or study replays) and want real-time voice, live
									screen sharing, and intraday stock, ETF, and options execution.
								</p>
							</div>
							<a href={resolve('/contact' as '/')} class="btn btn-dark btn--full">
								Enroll in the Day Trading Room
								<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
							</a>
						</article>

						<!-- Alternative 1: Working Professionals -->
						<article class="route-card">
							<div>
								<div class="route-card__top">
									<span class="meta-label">Working a Full-Time 9-to-5 Job?</span>
								</div>
								<h3 class="route-card__title">Swing Trading Room &amp; Explosive Swings</h3>
								<p class="route-card__copy">
									Can’t watch live screens during market hours? Join our
									<a href={resolve('/live-trading-rooms/swing-trading-room' as '/')}
										>Swing Trading Room</a
									>
									or our affordable
									<a href={resolve('/alert-services/explosive-swings' as '/')}>Explosive Swings</a>
									video watchlist tier for multi-day setups with pre-planned entries, targets, and stops.
								</p>
							</div>
							<a
								href={resolve('/live-trading-rooms/swing-trading-room' as '/')}
								class="btn btn-outline-dark btn--full"
							>
								Explore the Swing Trading Room
								<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
							</a>
						</article>

						<!-- Alternative 2: $500+ Small Accounts -->
						<article class="route-card">
							<div>
								<div class="route-card__top">
									<span class="meta-label">Starting With a $500 to $2,500 Account?</span>
								</div>
								<h3 class="route-card__title">Small Accounts Room ($500+ Capital)</h3>
								<p class="route-card__copy">
									Trading with a smaller balance requires strict contract affordability,
									cash-account T+1 rotation, and ironclad drawdown rules. Our
									<a href={resolve('/live-trading-rooms/small-accounts-room' as '/')}
										>Small Accounts Room</a
									>
									is engineered specifically for accounts starting as low as $500.
								</p>
							</div>
							<a
								href={resolve('/live-trading-rooms/small-accounts-room' as '/')}
								class="btn btn-outline-dark btn--full"
							>
								Explore the Small Accounts Room
								<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
							</a>
						</article>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 7: DAY TRADING ROOM FAQ ACCORDION (SEO & AI OVERVIEW OPTIMIZED)
       ========================================================================= -->
	<section id="faq" class="section faq-section" aria-labelledby="day-room-faq-h2">
		<div class="container faq-container">
			<div class="section-heading">
				<span class="eyebrow">Direct Answers • Zero Marketing Fluff</span>
				<h2 id="day-room-faq-h2">Frequently Asked Questions About the Live Day Trading Room</h2>
			</div>

			<div class="faq-list">
				{#each DAY_TRADING_ROOM_FAQ_ITEMS as item, index (item.id)}
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
				We Are the Present and the Future. We Are the Revolution!
			</h2>
			<p class="body-copy final-banner__copy">
				Leave fake holy grail indicators, hindsight screenshots, and overpriced guru rooms behind.
				Step onto a transparent live trading floor built to put people over profits.
			</p>
			<div class="cta-row cta-row--centered">
				<a href={resolve('/contact' as '/')} class="btn btn-dark">
					Join the Live Day Trading Room
					<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
				</a>
				<a
					href={resolve('/live-trading-rooms/small-accounts-room' as '/')}
					class="btn btn-outline-dark"
				>
					Small Accounts Room ($500+)
				</a>
				<a href={resolve('/mentorship' as '/')} class="btn btn-outline-dark">
					Apply for 1-on-1 Mentorship
				</a>
			</div>
		</div>
	</section>
</main>

<Footer />
