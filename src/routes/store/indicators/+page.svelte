<!-- src/routes/store/indicators/+page.svelte -->
<script lang="ts">
	import '#lib/styles/inner-page.css';
	import { resolve } from '$app/paths';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import IndicatorCard from '#lib/components/store/IndicatorCard.svelte';
	import CatalogGrid from '#lib/components/ui/CatalogGrid.svelte';
	import FilterChips from '#lib/components/ui/FilterChips.svelte';
	import {
		indicatorFilters,
		indicatorsCatalog,
		type IndicatorCategoryFilter
	} from '#lib/data/indicators.ts';
	import { INDICATORS_STORE_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	interface ComparisonRow {
		criterion: string;
		fakeGuruScripts: string;
		revolutionIndicators: string;
	}

	interface RoomCta {
		badge: string;
		title: string;
		description: string;
		ctaLabel: string;
		href: string;
	}

	const comparisonRows: ComparisonRow[] = [
		{
			criterion: 'Signal Integrity (Repainting)',
			fakeGuruScripts:
				'Uses future-bar lookahead code that erases losing arrows after the candle closes.',
			revolutionIndicators:
				'100% Non-Repainting: Once a bar closes and a level or signal prints, it stays permanently.'
		},
		{
			criterion: 'Underlying Mathematical Logic',
			fakeGuruScripts:
				'Repackaged free RSI/MACD crossovers renamed as a $2,500 "secret algorithm."',
			revolutionIndicators:
				'Built on Goldman Sachs prop-desk order flow, liquidity sweeps, and volatility compression.'
		},
		{
			criterion: 'Pricing & Ethical Philosophy',
			fakeGuruScripts:
				'Predatory $1,500–$3,000 price tags that drain a trader’s brokerage account.',
			revolutionIndicators:
				'People Over Profits: Accessible pricing so your capital stays in your trading account.'
		},
		{
			criterion: 'Live Market Verification',
			fakeGuruScripts:
				'Only shown on cherry-picked historical screenshots—never traded live on screen.',
			revolutionIndicators:
				'Used live on screen every market morning in our Day Trading, Swing, and Small Accounts rooms.'
		},
		{
			criterion: 'Risk & Stop-Loss Integration',
			fakeGuruScripts: 'Blind buy/sell arrows with zero invalidation level or stop-loss structure.',
			revolutionIndicators:
				'Every indicator plots objective structural invalidation zones to define exact entries and stops.'
		}
	];

	const bottomRoomCards: RoomCta[] = [
		{
			badge: 'Live Intraday Floor',
			title: 'Day Trading Room',
			description:
				'Watch our custom indicators in action live on screen with real-time voice commentary.',
			ctaLabel: 'Learn More →',
			href: '/live-trading-rooms/day-trading-room'
		},
		{
			badge: '9-to-5 Friendly',
			title: 'Swing Trading Room',
			description:
				'Multi-day stock and options swing setups identified using our non-repainting telemetry.',
			ctaLabel: 'Learn More →',
			href: '/live-trading-rooms/swing-trading-room'
		},
		{
			badge: '$500+ Starting Capital',
			title: 'Small Accounts Room',
			description:
				'Right-sized setups and strict risk rules engineered to compound a $500+ account.',
			ctaLabel: 'Learn More →',
			href: '/live-trading-rooms/small-accounts-room'
		},
		{
			badge: '0DTE & Index Options',
			title: 'SPX Profit Pulse Alerts',
			description:
				'High-conviction SPX index options alerts powered by our Gamma Inflection levels.',
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

	let activeCategory = $state<IndicatorCategoryFilter>('all');

	const displayedIndicators = $derived(
		activeCategory === 'all'
			? indicatorsCatalog
			: indicatorsCatalog.filter((item) => item.category === activeCategory)
	);

	function showAllIndicators() {
		activeCategory = 'all';
		const gridEl = document.getElementById('popular-indicators-grid');
		if (gridEl) {
			gridEl.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#indicators-store-page">Skip to content</a>

<div class="app-shell">
	<Navbar />

	<main id="indicators-store-page" class="inner-page indicators-page">
		<!-- =========================================================================
       SECTION 1: BREADCRUMB & ZERO-REPAINT TELEMETRY BAR
       ========================================================================= -->
		<nav class="breadcrumb-bar" aria-label="Breadcrumb">
			<div class="container breadcrumb-bar__inner">
				<ol class="breadcrumb-list">
					<li><a href={resolve('/')}>Home</a></li>
					<li aria-hidden="true">
						<CaretRightIcon size={12} weight="bold" />
					</li>
					<li><span>Store</span></li>
					<li aria-hidden="true">
						<CaretRightIcon size={12} weight="bold" />
					</li>
					<li aria-current="page">Indicators from Revolution Trading Pros</li>
				</ol>
				<p class="breadcrumb-bar__telemetry">
					<span>100% Non-Repainting Code</span> • <span>ThinkorSwim &amp; TradingView</span> •
					<span>Zero Fake "Holy Grails"</span>
				</p>
			</div>
		</nav>

		<!-- =========================================================================
       SECTION 2: ABOVE-THE-FOLD HERO SECTION (12-COLUMN ASYMMETRIC SPLIT)
       ========================================================================= -->
		<section class="hero-section" aria-labelledby="indicators-h1">
			<div class="container hero-section__grid">
				<!-- Left 7 Columns: Search-Intent H1 + Anti-Guru Zero-Repaint Manifesto -->
				<div class="hero-section__main">
					<div class="eyebrow-pill">
						<span class="eyebrow-pill__badge">Innovate • Zero Repaint</span>
						<span class="eyebrow-pill__text">
							Mentored by Former Goldman Sachs Legend Mark "Goldfinger" McGoldrick
						</span>
					</div>

					<h1 id="indicators-h1" class="hero-h1">
						<span class="hero-h1__seo-kicker">
							Proprietary Stock, ETF &amp; Options Trading Indicators • ThinkorSwim &amp;
							TradingView
						</span>
						<span class="hero-h1__display">
							No Fake "Holy Grail" Arrows. Just 100% Non-Repainting Institutional Telemetry.
						</span>
					</h1>

					<p class="lead-copy">
						When you load our custom indicators onto your charts, you immediately see what 95% of
						retail traders are blind to:
						<strong
							>where institutional balance sheets are accumulating, where retail breakout chasers
							are trapped, and where volatility is about to explode</strong
						>—with zero repainting and zero hindsight lies.
					</p>

					<p class="body-copy">
						<strong
							>I hate the online indicator industry because I have stood on the losing end myself in
							the past.</strong
						>
						I know how predatory marketers operate: they take a free lagging oscillator, add lookahead
						code that erases losing arrows after the candle closes, slap a $2,500 price tag on it, and
						call it a "holy grail." At Revolution Trading Pros,
						<strong>we focus on PEOPLE, not making money</strong>.
					</p>

					<p class="body-copy">
						Mentored directly by former Wall Street Goldman Sachs proprietary trading legend
						<strong>Mark "Goldfinger" McGoldrick</strong>—who called me
						<em>"the future of trading"</em>—I engineered our proprietary indicator suite (led by
						<strong>"The Move Prior to The Move™"</strong>) to expose real institutional footprints.
						These are the exact tools on our screens when we called the
						<strong>2020 COVID Top and Bottom</strong>, called the
						<strong>2022 Market Top and Bottom</strong>, and shorted
						<strong
							>Occidental Petroleum (OXY) live with Put Options for a 600% overnight gain</strong
						>
						while Warren Buffett bought millions long.
					</p>

					<div class="cta-row">
						<a href="#popular-indicators-grid" class="btn btn--solid">
							Browse Popular Indicators ↓
						</a>
						<a href={resolve('/store/scanners' as '/')} class="btn btn--outline">
							Explore Live Market Scanners →
						</a>
					</div>
				</div>

				<!-- Right 5 Columns: The Zero-Repaint Engineering Standard Card -->
				<aside
					class="engineering-card"
					aria-label="The Zero-Repaint Institutional Engineering Standard"
				>
					<div class="engineering-card__header">
						<div>
							<span class="meta-label">Verified Code Architecture</span>
							<h2 class="engineering-card__title">Our 4-Point Indicator Guarantee</h2>
						</div>
						<span class="engineering-card__stamp">Zero Repaint</span>
					</div>

					<dl class="engineering-list">
						<div class="engineering-list__item">
							<dt>01 // 100% Non-Repainting Signals</dt>
							<dd>
								Once a price bar closes and a structural level, squeeze dot, or exhaustion signal
								prints, it is locked in permanently. What you see in backtesting is what printed
								live.
							</dd>
						</div>
						<div class="engineering-list__item">
							<dt>02 // Built for Exact Entries, Exits &amp; Stops</dt>
							<dd>
								Every indicator maps objective structural invalidation zones so you know your exact
								entry trigger, profit target, and hard stop-loss before risking a dollar.
							</dd>
						</div>
						<div class="engineering-list__item">
							<dt>03 // All Timeframes &amp; Account Sizes ($500+)</dt>
							<dd>
								Works seamlessly on 1-minute scalping charts, multi-day swing charts for working
								professionals, and affordable options setups in our
								<a href={resolve('/live-trading-rooms/small-accounts-room' as '/')}
									>Small Accounts Room</a
								>.
							</dd>
						</div>
						<div class="engineering-list__item">
							<dt>04 // Step-by-Step Setup &amp; Live Room Integration</dt>
							<dd>
								Every indicator includes complete installation guides, strategy training, and live
								daily demonstration inside our
								<a href={resolve('/live-trading-rooms/day-trading-room' as '/')}
									>Live Trading Rooms</a
								>.
							</dd>
						</div>
					</dl>
				</aside>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 3: UPGRADED SIMPLER-STYLE INDICATOR CATALOG GRID
       Header Split: "Popular Indicators:" (Left) + "See All Indicators" (Top Right)
       ========================================================================= -->
		<section
			id="popular-indicators-grid"
			class="catalog-section"
			aria-labelledby="popular-indicators-h2"
		>
			<div class="container">
				<!-- Simpler Trading Top Header Bar: Left Title + Top-Right "See All Indicators" Button -->
				<div class="catalog-top-bar">
					<div class="catalog-top-bar__left">
						<span class="section-kicker">Educate • Innovate • Prosper</span>
						<h2 id="popular-indicators-h2" class="section-h2">Popular Indicators:</h2>
						<p class="catalog-top-bar__sub">
							Select a category below or inspect our complete suite of 100% non-repainting
							institutional trading tools.
						</p>
					</div>

					<div class="catalog-top-bar__right">
						<button type="button" class="btn btn--solid" onclick={showAllIndicators}>
							See All Indicators ({indicatorsCatalog.length}) →
						</button>
					</div>
				</div>

				<FilterChips
					label="Filter indicators by strategy type"
					options={indicatorFilters}
					bind:value={activeCategory}
				/>

				<!-- Catalog: crawlable h3 titles; every spec sheet is in the server-rendered HTML (native <details>). -->
				<CatalogGrid
					items={displayedIndicators}
					key={(indicator) => indicator.id}
					isFeatured={(indicator) => indicator.featured === true}
					total={indicatorsCatalog.length}
					noun="indicators"
					emptyMessage="No indicators match this strategy type."
				>
					{#snippet children(indicator)}
						<IndicatorCard {indicator} />
					{/snippet}
				</CatalogGrid>

				<!-- Simpler Trading Bottom "See All Indicators" + Store Sibling Navigation Bar -->
				<div class="catalog-bottom-bar">
					<button type="button" class="btn btn--solid" onclick={showAllIndicators}>
						See All Indicators ({indicatorsCatalog.length})
					</button>
					<a href={resolve('/store/scanners' as '/')} class="btn btn--outline">
						Explore Institutional Scanners →
					</a>
					<a href={resolve('/store/courses' as '/')} class="btn btn--outline">
						Explore Trading Courses →
					</a>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 4: FAKE GURU "HOLY GRAIL" SCRIPTS VS. OUR NON-REPAINTING CODE
       ========================================================================= -->
		<section class="comparison-section" aria-labelledby="comparison-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">The Anti-Guru Standard • Hard Evidence</span>
					<h2 id="comparison-h2" class="section-h2">
						Why 99% of Online "Buy/Sell Arrow" Indicators Destroy Accounts—And Why Ours Never
						Repaint
					</h2>
					<p class="body-copy section-header__sub">
						Before you ever put a third-party indicator on your ThinkorSwim or TradingView chart,
						compare how internet marketers code their scripts versus our institutional engineering
						standard:
					</p>
				</div>

				<div class="table-wrapper" role="region" aria-labelledby="comparison-h2">
					<table class="comparison-table">
						<thead>
							<tr>
								<th scope="col">Engineering Standard</th>
								<th scope="col">Predatory "Holy Grail" Guru Indicators</th>
								<th scope="col">Revolution Trading Pros Custom Indicators</th>
							</tr>
						</thead>
						<tbody>
							{#each comparisonRows as row (row.criterion)}
								<tr>
									<th scope="row" class="comparison-table__feature">{row.criterion}</th>
									<td class="comparison-table__negative">✕ {row.fakeGuruScripts}</td>
									<td class="comparison-table__positive">✓ {row.revolutionIndicators}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 5: PROVEN IN LIVE COMBAT (2020, 2022 & +600% OXY PUT OPTIONS)
       ========================================================================= -->
		<section class="proof-section" aria-labelledby="proof-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">Battle-Tested Telemetry • Zero Hindsight</span>
					<h2 id="proof-h2" class="section-h2">
						The Exact Chart Telemetry Behind Our Biggest Verified Market Calls
					</h2>
					<p class="body-copy section-header__sub">
						An indicator is only as good as the live trades it produces under pressure. Here is how
						our proprietary telemetry performed when the crowd was wrong:
					</p>
				</div>

				<div class="proof-grid">
					<article class="proof-card">
						<span class="meta-label">Case Study 01 // Single-Stock Options</span>
						<p class="proof-card__metric">+600% Overnight on OXY Puts</p>
						<h3 class="proof-card__title">
							Spotting Institutional Distribution While Warren Buffett Bought Millions Long
						</h3>
						<p class="proof-card__copy">
							When retail traders blindly chased headlines of Warren Buffett buying Occidental
							Petroleum (OXY), our <strong>Abandoned Price Bar</strong> and
							<strong>Liquidity Sweep</strong> telemetry exposed heavy institutional distribution
							into the rally—allowing us to enter
							<strong>OXY Put Options live for a 600% overnight gain</strong>.
						</p>
					</article>

					<article class="proof-card">
						<span class="meta-label">Case Study 02 // 2020 Macro Inflection</span>
						<p class="proof-card__metric">2020 COVID Top &amp; Bottom</p>
						<h3 class="proof-card__title">
							Calling the February 2020 Breakdown &amp; March 2020 Capitulation Low
						</h3>
						<p class="proof-card__copy">
							Using <strong>The Move Prior to The Move™ (MP_EarlyInNOut)</strong> and our multi-timeframe
							volatility telemetry, we warned traders of institutional exhaustion before the February
							2020 crash cascaded—and identified the exact March 2020 capitulation bottom.
						</p>
					</article>

					<article class="proof-card">
						<span class="meta-label">Case Study 03 // 2022 Macro Inflection</span>
						<p class="proof-card__metric">2022 Bull Top &amp; Bear Bottom</p>
						<h3 class="proof-card__title">
							Repeating the Feat Across Both Sides of the 2022 Bear Market Cycle
						</h3>
						<p class="proof-card__copy">
							Once is luck; twice is institutional architecture. Our
							<strong>Smart-Money Relative Volume</strong> and <strong>Trend Thrust</strong>
							indicators flagged the January 2022 distribution top and pinpointed the October 2022 institutional
							accumulation low in real time.
						</p>
					</article>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 6: INDICATORS FAQ ACCORDION (SEO & AI OVERVIEW OPTIMIZED)
       ========================================================================= -->
		<section id="faq" class="faq-section" aria-labelledby="indicators-faq-h2">
			<div class="container faq-container">
				<div class="section-header">
					<span class="section-kicker">Direct Answers • Zero Fluff</span>
					<h2 id="indicators-faq-h2" class="section-h2">
						Frequently Asked Questions About Our Custom Trading Indicators
					</h2>
				</div>

				<div class="faq-list">
					{#each INDICATORS_STORE_FAQ_ITEMS as faq, idx (faq.id)}
						<details id={`faq-${faq.id}`} class="faq-item" open={idx === 0}>
							<summary class="faq-item__question">
								<h3 class="faq-item__heading">{faq.question}</h3>
								<span class="faq-item__icon" aria-hidden="true">+</span>
							</summary>
							{#if faq.id === 'never-repaint'}
								<p class="faq-item__answer">
									<strong>Never.</strong> Every indicator in our Store is 100% non-repainting. Once a
									candle closes and a signal, squeeze dot, abandoned bar, or gamma level prints on your
									chart, it stays there permanently. We built Revolution Trading Pros to destroy the fake
									"holy grail" indicator scam, not participate in it.
								</p>
							{:else if faq.id === 'platforms-markets'}
								<p class="faq-item__answer">
									Our custom indicators are built for <strong>ThinkorSwim (thinkScript)</strong> and
									<strong>TradingView</strong>. They work across all liquid US stocks, sector and
									index ETFs (see our free
									<a href={resolve('/resources/etf-stocks-list' as '/')}>ETF Stocks List</a>
									and
									<a href={resolve('/resources/stock-indexes-list' as '/')}>Stock Indexes List</a>),
									SPX/NDX index charts, and options contracts on intraday, daily, and weekly
									timeframes.
								</p>
							{:else if faq.id === 'small-accounts-working-pros'}
								<p class="faq-item__answer">
									Yes. Because our indicators plot objective entry triggers and tight structural
									stop-loss invalidation levels, they are ideal both for
									<a href={resolve('/live-trading-rooms/small-accounts-room' as '/')}
										>Small Accounts Room ($500+)</a
									>
									traders who need strict risk caps and for 9-to-5 working professionals in our
									<a href={resolve('/live-trading-rooms/swing-trading-room' as '/')}
										>Swing Trading Room</a
									>
									and
									<a href={resolve('/alert-services/explosive-swings' as '/')}>Explosive Swings</a>
									alert tier.
								</p>
							{:else}
								<p class="faq-item__answer">
									Our
									<a href={resolve('/store/scanners' as '/')}>Institutional Scanners</a>
									automatically scan the entire market in real time to find tickers triggering our indicator
									conditions (such as Multi-Timeframe Squeezes or Liquidity Sweeps), while our
									<a href={resolve('/store/courses' as '/')}>Trading Courses</a> teach you the complete
									Goldman Sachs-mentored execution rules behind every setup.
								</p>
							{/if}
						</details>
					{/each}
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
							See Our Non-Repainting Indicators in Action Live Every Market Day
						</h2>
						<p class="body-copy pro-cta-box__sub">
							Tools are powerful, but live institutional execution is unstoppable. Join our Live
							Trading Rooms or Video Watchlist Alert Services to trade alongside our desk:
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
