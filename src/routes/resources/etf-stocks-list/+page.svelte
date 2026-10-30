<!-- src/routes/resources/etf-stocks-list/+page.svelte -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { JsonLd } from 'svelte-meta-tags';
	import Breadcrumb from '#lib/components/layout/Breadcrumb.svelte';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import {
		bottomRoomCards,
		comparisonData,
		etfBenefits,
		etfFilters,
		etfTypes,
		featuredETFs,
		sectorETFs,
		type EtfFilterCategory
	} from '#lib/data/etf-stocks-list.ts';
	import { ETF_STOCKS_LIST_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let activeFilter = $state<EtfFilterCategory>('all');
	let searchQuery = $state('');

	const filteredETFs = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		return featuredETFs.filter((etf) => {
			const matchesTab =
				activeFilter === 'all' ||
				(activeFilter === 'small-account-options'
					? etf.smallAccountFit
					: etf.category === activeFilter);
			const matchesQuery =
				q === '' ||
				etf.symbol.toLowerCase().includes(q) ||
				etf.name.toLowerCase().includes(q) ||
				etf.description.toLowerCase().includes(q);
			return matchesTab && matchesQuery;
		});
	});
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#etf-stocks-list-page">Skip to content</a>

<div class="app-shell">
	<Navbar />

	<main id="etf-stocks-list-page" class="etf-page">
		<!-- =========================================================================
       SECTION 1: BREADCRUMB & PUBLIC UTILITY BAR
       ========================================================================= -->
		<Breadcrumb
			class="container"
			items={[
				{ label: 'Home', href: '/' },
				{ label: 'Resources', href: '/resources' },
				{ label: 'ETF Stocks List' }
			]}
		>
			<span>100% Free Public Resource</span> •
			<span>12 Core ETFs + All 11 S&amp;P 500 Sectors</span>
		</Breadcrumb>

		<!-- =========================================================================
       SECTION 2: ABOVE-THE-FOLD HERO + INSTITUTIONAL ETF ROTATION BRIEFING
       ========================================================================= -->
		<section class="hero-section" aria-labelledby="etf-h1">
			<div class="container hero-section__grid">
				<!-- Left 7 Columns: Search-Intent H1 + Institutional ETF Context -->
				<div class="hero-section__main">
					<div class="eyebrow-pill">
						<span class="eyebrow-pill__badge">Free Trader Resource</span>
						<span class="eyebrow-pill__text">
							Educate • Innovate • Prosper • People Over Profits
						</span>
					</div>

					<h1 id="etf-h1" class="hero-h1">
						<span class="hero-h1__kicker">
							Complete Exchange-Traded Funds (ETF) Directory • Index, Sector &amp; Options Guide
						</span>
						<span class="hero-h1__display">
							The Institutional ETF Stocks List: Master Liquidity, Sector Rotation &amp; Options
							Execution.
						</span>
					</h1>

					<p class="lead-copy">
						Your comprehensive reference guide to <strong>Exchange-Traded Funds (ETFs)</strong>.
						Explore the 12 most heavily traded flagship ETFs, inspect all
						<strong>11 official S&amp;P 500 GICS Sectors</strong>, compare ETFs against mutual
						funds, and learn how institutional desks use ETFs for intraday scalping, 9-to-5 swing
						trading, and <strong>$500+ small account compounding</strong>.
					</p>

					<p class="body-copy">
						Mentored directly by former Wall Street Goldman Sachs proprietary trading legend <strong
							>Mark "Goldfinger" McGoldrick</strong
						>—who called our founder <em>"the future of trading"</em>—we track ETF order flow every
						single morning before the opening bell. Because institutional balance sheets deploy
						billions of dollars through index and sector ETFs (<strong
							>SPY, QQQ, IWM, XLE, XLK, XLF</strong
						>), reading ETF accumulation and distribution is how we called the
						<strong>2020 COVID Top and Bottom</strong>, called the
						<strong>2022 Bull Market Top and Bear Bottom</strong>, and spotted the energy sector
						distribution that fueled our live
						<strong>+600% overnight gain on OXY Put Options</strong>.
					</p>

					<div class="cta-row">
						<a href="#popular-etfs-directory" class="btn btn--solid">
							Explore Popular ETFs Directory ↓
						</a>
						<a href="#etfs-by-sector" class="btn btn--outline"> Jump to All 11 Sector ETFs ↓ </a>
						<a href={resolve('/resources/options-calculator' as '/')} class="btn btn--outline">
							Free Options Risk Calculator →
						</a>
					</div>
				</div>

				<!-- Right 5 Columns: Quick-Reference Institutional ETF Cheat Card -->
				<aside class="quick-ref-card" aria-label="Institutional ETF Quick-Reference Matrix">
					<div class="quick-ref-card__header">
						<div>
							<span class="meta-label">Desk Execution Cheat Sheet</span>
							<h2 class="quick-ref-card__title">How Our Desk Uses ETFs Daily</h2>
						</div>
						<span class="quick-ref-card__stamp">Zero Single-Stock Gap Risk</span>
					</div>

					<dl class="quick-ref-list">
						<div class="quick-ref-list__row">
							<dt>01 // Opening-Bell &amp; 0DTE Options Scalping</dt>
							<dd>
								<strong>SPY, QQQ &amp; IWM</strong> offer penny-wide bid-ask spreads, daily
								expirations, and predictable dealer Gamma walls for our
								<a href={resolve('/live-trading-rooms/day-trading-room')}>Day Trading Room</a>.
							</dd>
						</div>
						<div class="quick-ref-list__row">
							<dt>02 // 9-to-5 Working Professional Swings</dt>
							<dd>
								Sector ETFs (<strong>XLK, XLE, XLF, SMH, GLD</strong>) eliminate single-company CEO
								or earnings blowup risk—making them ideal for our
								<a href={resolve('/live-trading-rooms/swing-trading-room')}>Swing Trading Room</a>
								and
								<a href={resolve('/alert-services/explosive-swings' as '/')}>Explosive Swings</a>.
							</dd>
						</div>
						<div class="quick-ref-list__row">
							<dt>03 // $500+ Small Account Compounding</dt>
							<dd>
								Lower-priced, high-liquidity ETFs like <strong>IWM, XLF, EEM, and XLE</strong> offer
								affordable options contracts and tight vertical spreads for our
								<a href={resolve('/live-trading-rooms/small-accounts-room')}>Small Accounts Room</a
								>.
							</dd>
						</div>
						<div class="quick-ref-list__row">
							<dt>04 // Sibling Market Reference Lists</dt>
							<dd>
								Pair this ETF directory with our <a href={resolve('/resources/stock-indexes-list')}
									>Stock Indexes List (SPX, NDX, DJI, RUT, VIX)</a
								>
								and our <a href={resolve('/store/scanners')}>Live Market Scanners</a>.
							</dd>
						</div>
					</dl>
				</aside>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 3: WHAT IS AN ETF? + 5 CORE BENEFITS + 5 TYPES OF ETFS
       ========================================================================= -->
		<section class="foundation-section" aria-labelledby="what-is-etf-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">Foundation &amp; Mechanics • Complete Breakdown</span>
					<h2 id="what-is-etf-h2" class="section-h2">What Is an Exchange-Traded Fund (ETF)?</h2>
					<p class="body-copy section-header__sub">
						<strong>Exchange-Traded Funds (ETFs)</strong> are SEC- and IIROC-regulated investment vehicles
						that trade on stock exchanges throughout the market day, just like individual stocks. Each
						ETF holds an underlying basket of assets—such as an equity index, an economic sector, Treasury
						bonds, or physical commodities—allowing traders and investors to capture broad market trends
						or hedge risk through a single liquid ticker.
					</p>
				</div>

				<!-- 5 Core Benefits Grid -->
				<div class="benefits-grid">
					{#each etfBenefits as benefit (benefit.title)}
						<article class="benefit-card">
							<div class="benefit-card__top">
								<span class="benefit-card__num">Benefit #{benefit.num}</span>
								<span class="benefit-card__check" aria-hidden="true">✓</span>
							</div>
							<h3 class="benefit-card__title">{benefit.title}</h3>
							<p class="benefit-card__text">{benefit.description}</p>
						</article>
					{/each}
				</div>

				<!-- 5 Types of ETFs Sub-Section -->
				<div class="types-box">
					<div class="types-box__header">
						<span class="meta-label">Asset Class Taxonomy</span>
						<h3 class="types-box__title">
							The 5 Primary Types of ETFs Traded on Institutional Desks
						</h3>
					</div>

					<div class="types-grid">
						{#each etfTypes as item (item.type)}
							<article class="type-card">
								<div class="type-card__head">
									<span class="meta-label">{item.code}</span>
									<span class="type-card__tickers">{item.examples}</span>
								</div>
								<h4 class="type-card__title">{item.type}</h4>
								<p class="type-card__text">{item.description}</p>
							</article>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 4: POPULAR ETFS DIRECTORY (12 FLAGSHIP ETFS + LIVE FILTER/SEARCH)
       ========================================================================= -->
		<section
			id="popular-etfs-directory"
			class="directory-section"
			aria-labelledby="popular-etfs-h2"
		>
			<div class="container">
				<div class="directory-top-bar">
					<div>
						<span class="section-kicker">Interactive Directory • Verified Exchange Links</span>
						<h2 id="popular-etfs-h2" class="section-h2">
							Popular ETFs: The 12 Most Widely Traded Benchmark Funds
						</h2>
						<p class="body-copy section-header__sub">
							Filter by trading category or search by ticker symbol below. Click any TradingView
							chart badge to inspect live price action on its exact primary exchange:
						</p>
					</div>

					<div class="search-box">
						<label for="etf-search" class="meta-label">Search Ticker or Name:</label>
						<input
							type="search"
							id="etf-search"
							bind:value={searchQuery}
							placeholder="Search SPY, QQQ, IWM, Gold, Bond..."
							class="search-box__input"
						/>
					</div>
				</div>

				<!-- Interactive Category Filter Tabs -->
				<div class="filter-bar" role="group" aria-label="Filter Popular ETFs">
					{#each etfFilters as filter (filter.id)}
						<button
							type="button"
							class="filter-tab"
							aria-pressed={activeFilter === filter.id}
							onclick={() => (activeFilter = filter.id)}
						>
							{filter.label}
						</button>
					{/each}
				</div>

				<p class="filter-status" role="status">
					Showing {filteredETFs.length} of {featuredETFs.length} ETFs
				</p>

				<!-- 12 Featured ETFs Grid -->
				<div class="etf-grid">
					{#each filteredETFs as etf (etf.symbol)}
						<article class="etf-card">
							<div>
								<div class="etf-card__header">
									<div class="etf-card__symbol-group">
										<span class="etf-card__symbol">{etf.symbol}</span>
										<span class="etf-card__cat">{etf.categoryLabel}</span>
									</div>

									<!-- Fixed Exchange-Specific TradingView Link (NYSEARCA vs NASDAQ) -->
									<a
										href={`https://www.tradingview.com/symbols/${etf.exchange}-${etf.symbol}/`}
										target="_blank"
										rel="noopener noreferrer"
										class="etf-card__chart-link"
										aria-label={`View ${etf.symbol} live chart on TradingView (${etf.exchange}), opens in a new tab`}
									>
										<span>Chart</span>
										<svg
											viewBox="0 0 24 24"
											width="14"
											height="14"
											fill="none"
											stroke="currentColor"
											stroke-width="2.5"
											aria-hidden="true"
										>
											<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
											<polyline points="15 3 21 3 21 9" />
											<line x1="10" y1="14" x2="21" y2="3" />
										</svg>
									</a>
								</div>

								<h3 class="etf-card__name">{etf.name}</h3>
								<p class="etf-card__options-tier">{etf.optionsTier}</p>
								<p class="etf-card__description">{etf.description}</p>

								<div class="etf-card__inst-note">
									<strong>Desk Execution Note:</strong>
									{etf.institutionalNote}
								</div>
							</div>

							<div class="etf-card__features">
								{#each etf.features as feature (feature)}
									<span class="etf-card__feature">{feature}</span>
								{/each}
							</div>
						</article>
					{:else}
						<p class="etf-grid__empty">
							No ETFs match your search. Clear the search box or choose "All Popular ETFs".
						</p>
					{/each}
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 5: ETFS BY SECTOR (ALL 11 OFFICIAL S&P 500 GICS SECTORS)
       ========================================================================= -->
		<section id="etfs-by-sector" class="sector-section" aria-labelledby="sector-etfs-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker"
						>Complete 11-Sector Institutional Map • Zero Missing Sectors</span
					>
					<h2 id="sector-etfs-h2" class="section-h2">
						ETFs By Sector: All 11 Official S&amp;P 500 GICS Sectors &amp; Sub-Industries
					</h2>
					<p class="body-copy section-header__sub">
						Institutional capital rarely leaves the market all at once—it rotates from one sector to
						another. Click any sector ticker pill below to open its live TradingView chart:
					</p>
				</div>

				<div class="sector-grid">
					{#each sectorETFs as sector (sector.sector)}
						<article class="sector-card">
							<div>
								<div class="sector-card__top">
									<span class="meta-label">{sector.code}</span>
									<span class="sector-card__primary-ticker">{sector.symbol}</span>
								</div>

								<h3 class="sector-card__title">{sector.sector}</h3>
								<p class="sector-card__weight">{sector.weightNote}</p>
								<p class="sector-card__role">{sector.rotationRole}</p>
							</div>

							<div class="sector-card__etfs-box">
								<span class="meta-label">Click Ticker to Open Live Chart:</span>
								<div class="sector-card__etfs">
									{#each sector.etfs as item (item.ticker)}
										<a
											href={`https://www.tradingview.com/symbols/${item.exchange}-${item.ticker}/`}
											target="_blank"
											rel="noopener noreferrer"
											class="sector-card__etf"
											aria-label={`${item.ticker} — ${item.label}, chart opens in a new tab`}
										>
											<strong>{item.ticker}</strong>
											<span aria-hidden="true">↗</span>
										</a>
									{/each}
								</div>
							</div>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 6: ETFS VS. MUTUAL FUNDS (7-ROW COMPARISON MATRIX)
       ========================================================================= -->
		<section class="comparison-section" aria-labelledby="comparison-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">Structural Comparison • Hard Evidence</span>
					<h2 id="comparison-h2" class="section-h2">
						ETFs vs. Mutual Funds: Why Active Traders &amp; Options Strategists Choose ETFs
					</h2>
					<p class="body-copy section-header__sub">
						Both ETFs and mutual funds hold baskets of securities, but their execution mechanics,
						tax treatment, and options capabilities are fundamentally different:
					</p>
				</div>

				<div class="table-wrapper" role="region" aria-labelledby="comparison-h2">
					<table class="comparison-table">
						<thead>
							<tr>
								<th scope="col">Comparison Feature</th>
								<th scope="col">Exchange-Traded Funds (ETFs)</th>
								<th scope="col">Traditional Mutual Funds</th>
							</tr>
						</thead>
						<tbody>
							{#each comparisonData as row (row.feature)}
								<tr>
									<th scope="row" class="comparison-table__feature">{row.feature}</th>
									<td
										class={[
											'comparison-table__etf',
											{ 'comparison-table__winner': row.etfBetter === true }
										]}
									>
										{#if row.etfBetter === true}
											<span class="winner-check" aria-hidden="true">✓</span>
										{/if}
										<span>{row.etf}</span>
									</td>
									<td class="comparison-table__mf">
										<span>{row.mutualFund}</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<div class="comparison-summary">
					<div class="comparison-summary__card comparison-summary__card--featured">
						<span class="meta-label">Active Execution &amp; Options</span>
						<h3>ETFs Are Ideal For:</h3>
						<p>
							Cost-conscious investors, 9-to-5 swing traders, $500+ small accounts, and options
							traders who require intraday liquidity, exact stop-loss control, and deep call/put
							chains.
						</p>
					</div>

					<div class="comparison-summary__card">
						<span class="meta-label">Passive Payroll Retirement</span>
						<h3>Mutual Funds Are Suited For:</h3>
						<p>
							Hands-off 401(k) participants who only execute automated bi-weekly payroll
							contributions and never trade intraday or use options strategies.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 7: ETF TRADING & OPTIONS FAQ ACCORDION
       ========================================================================= -->
		<section class="faq-section" aria-labelledby="etf-faq-h2">
			<div class="container faq-container">
				<div class="section-header">
					<span class="section-kicker">Direct Answers • Zero Fluff</span>
					<h2 id="etf-faq-h2" class="section-h2">
						Frequently Asked Questions About Trading ETFs &amp; Sector Rotation
					</h2>
				</div>

				<div class="faq-list">
					{#each ETF_STOCKS_LIST_FAQ_ITEMS as faq, idx (faq.id)}
						<details class="faq-item" open={idx === 0}>
							<summary class="faq-item__question">
								<span>{faq.question}</span>
								<span class="faq-item__icon" aria-hidden="true">+</span>
							</summary>
							<p class="faq-item__answer">{faq.answer}</p>
						</details>
					{/each}
				</div>

				<!-- Sibling Free Resources Bar -->
				<div class="resources-bridge">
					<div>
						<span class="meta-label">Explore Our Other Free Public Utilities</span>
						<h3 class="resources-bridge__title">Continue With Our Free Trader Resources</h3>
					</div>
					<div class="resources-bridge__links">
						<a href={resolve('/resources/stock-indexes-list')} class="btn btn--outline">
							View Stock Indexes List (SPX, NDX, VIX) →
						</a>
						<a href={resolve('/resources/options-calculator' as '/')} class="btn btn--solid">
							Launch Free Options Risk Calculator →
						</a>
					</div>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 8: START TRADING LIKE A PROFESSIONAL (5 ROOM & ALERT CTA CARDS)
       ========================================================================= -->
		<section class="pro-cta-section" aria-labelledby="pro-cta-h2">
			<div class="container">
				<div class="pro-cta-box">
					<div class="pro-cta-box__header">
						<span class="section-kicker">Educate • Innovate • Prosper</span>
						<h2 id="pro-cta-h2" class="section-h2 pro-cta-box__h2">
							Ready to Trade These ETFs With Institutional Precision?
						</h2>
						<p class="body-copy pro-cta-box__sub">
							Join Revolution Trading Pros for live trading rooms, pre-planned video watchlists with
							exact entries and stops, and $500+ small account mentorship:
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

<style>
	/* ===========================================================================
     PURE NATIVE SCOPED CSS — BLACK & WHITE EDITORIAL ETF DIRECTORY
     Typography: --font-display (Headings/Tickers/CTAs) + --font-sans (Body/Data)
     =========================================================================== */
	.etf-page {
		background-color: var(--bg-soft);
		color: var(--text);
		font-family: var(--font-sans);
		line-height: 1.65;
		overflow-x: clip;
	}

	.container {
		max-width: 1440px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	/* Shared Typography Tokens */
	.meta-label {
		display: inline-block;
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #c4c8c7;
	}

	.section-kicker {
		display: inline-block;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		background-color: var(--panel2);
		color: #ffffff;
		padding: 0.25rem 0.625rem;
		margin-bottom: 0.625rem;
	}

	.section-h2 {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: clamp(1.65rem, 3vw, 2.45rem);
		line-height: 1.14;
		letter-spacing: -0.025em;
		max-width: 28ch;
		margin: 0;
		color: var(--text);
	}

	.lead-copy {
		font-family: var(--font-sans);
		font-weight: 500;
		font-size: clamp(1.0625rem, 1.25vw, 1.2rem);
		line-height: 1.65;
		max-width: 66ch;
		margin: 1.25rem 0 0;
		color: var(--text);
	}

	.body-copy {
		font-family: var(--font-sans);
		font-weight: 400;
		font-size: 1rem;
		line-height: 1.65;
		max-width: 66ch;
		margin: 1rem 0 0;
		color: var(--text);
	}

	.lead-copy strong,
	.body-copy strong {
		font-weight: 700;
		color: var(--text);
	}

	/* Buttons */
	.cta-row {
		margin-top: 1.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 48px;
		padding: 0.75rem 1.35rem;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		text-decoration: none;
		border: 2px solid var(--line-strong);
		text-align: center;
		cursor: pointer;
		box-sizing: border-box;
	}

	.btn--solid {
		background-color: var(--acid);
		color: var(--ink);
	}

	.btn--outline {
		background-color: var(--bg-soft);
		color: var(--text);
	}

	.btn--full {
		width: 100%;
	}

	/* 2. Hero Section */
	.hero-section {
		padding: 2.5rem 0 3.5rem;
		border-bottom: 2px solid var(--line-strong);
	}

	.hero-section__grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 2.5rem;
		align-items: start;
	}

	.eyebrow-pill {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		border: 1.5px solid var(--line-strong);
		background-color: var(--panel);
		padding: 0.375rem 0.75rem;
		margin-bottom: 1.25rem;
	}

	.eyebrow-pill__badge {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		background-color: var(--panel2);
		color: #ffffff;
		padding: 0.125rem 0.45rem;
	}

	.eyebrow-pill__text {
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.hero-h1 {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.hero-h1__kicker {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.09em;
		color: #c4c8c7;
		border-left: 3px solid var(--line-strong);
		padding-left: 0.625rem;
		max-width: 65ch;
	}

	.hero-h1__display {
		font-family: var(--font-display);
		font-weight: 900;
		font-size: clamp(2rem, 4.1vw, 3.15rem);
		line-height: 1.08;
		letter-spacing: -0.03em;
		max-width: 22ch;
		color: var(--text);
	}

	/* Right Column Quick-Reference Card */
	.quick-ref-card {
		border: 2px solid var(--line-strong);
		background-color: var(--panel);
		padding: 1.5rem;
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
	}

	.quick-ref-card__header {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid var(--line-strong);
	}

	.quick-ref-card__title {
		font-family: var(--font-display);
		font-weight: 900;
		font-size: 1.25rem;
		margin: 0.25rem 0 0;
	}

	.quick-ref-card__stamp {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.6875rem;
		text-transform: uppercase;
		background-color: var(--panel2);
		color: #ffffff;
		padding: 0.25rem 0.5rem;
		white-space: nowrap;
	}

	.quick-ref-list {
		margin: 0;
	}

	.quick-ref-list__row {
		padding: 0.875rem 0;
		border-bottom: 1px solid var(--line);
	}

	.quick-ref-list__row:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.quick-ref-list__row dt {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text);
	}

	.quick-ref-list__row dd {
		margin: 0.25rem 0 0;
		font-family: var(--font-sans);
		font-size: 0.90625rem;
		line-height: 1.5;
		color: #c4c8c7;
	}

	.quick-ref-list__row a {
		color: var(--text);
		font-weight: 700;
		text-decoration: underline;
	}

	/* 3. What Is an ETF + 5 Benefits + 5 Types */
	.foundation-section {
		padding: 3.5rem 0;
		border-bottom: 2px solid var(--line-strong);
	}

	.section-header {
		margin-bottom: 2.25rem;
	}

	.section-header__sub {
		margin-top: 0.625rem;
	}

	.benefits-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.25rem;
		margin-bottom: 2.75rem;
	}

	.benefit-card {
		border: 2px solid var(--line-strong);
		background-color: var(--panel);
		padding: 1.5rem;
	}

	.benefit-card__top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 0.625rem;
		border-bottom: 1.5px solid var(--line-strong);
		margin-bottom: 0.875rem;
	}

	.benefit-card__num {
		font-family: var(--font-display);
		font-weight: 900;
		font-size: 0.75rem;
		text-transform: uppercase;
		background-color: var(--panel2);
		color: #ffffff;
		padding: 0.2rem 0.5rem;
	}

	.benefit-card__check {
		font-family: var(--font-display);
		font-weight: 900;
		font-size: 1rem;
	}

	.benefit-card__title {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 1.125rem;
		line-height: 1.28;
		margin: 0 0 0.5rem;
	}

	.benefit-card__text {
		margin: 0;
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		line-height: 1.58;
		color: var(--text);
	}

	.types-box {
		border: 2px solid var(--line-strong);
		background-color: var(--panel);
		padding: 1.75rem;
	}

	.types-box__header {
		padding-bottom: 1rem;
		border-bottom: 2px solid var(--line-strong);
		margin-bottom: 1.5rem;
	}

	.types-box__title {
		font-family: var(--font-display);
		font-weight: 900;
		font-size: 1.35rem;
		margin: 0.25rem 0 0;
	}

	.types-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.25rem;
	}

	.type-card {
		border: 1.5px solid var(--line-strong);
		background-color: var(--bg-soft);
		padding: 1.25rem;
	}

	.type-card__head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.type-card__tickers {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.6875rem;
		background-color: var(--panel2);
		color: #ffffff;
		padding: 0.15rem 0.45rem;
	}

	.type-card__title {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 1.0625rem;
		margin: 0 0 0.375rem;
	}

	.type-card__text {
		margin: 0;
		font-family: var(--font-sans);
		font-size: 0.875rem;
		line-height: 1.55;
		color: #c4c8c7;
	}

	/* 4. Popular ETFs Directory Section */
	.directory-section {
		padding: 3.5rem 0;
		border-bottom: 2px solid var(--line-strong);
		background-color: var(--panel);
	}

	.directory-top-bar {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 1.25rem;
		margin-bottom: 1.5rem;
	}

	.search-box {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		width: 100%;
		max-width: 360px;
	}

	.search-box__input {
		padding: 0.625rem 0.875rem;
		border: 2px solid var(--line-strong);
		background-color: var(--bg-soft);
		font-family: var(--font-sans);
		font-size: 0.9375rem;
	}

	.filter-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding-bottom: 1.5rem;
		border-bottom: 2px solid var(--line-strong);
		margin-bottom: 2rem;
	}

	.filter-tab {
		min-height: 42px;
		padding: 0.5rem 1rem;
		border: 2px solid var(--line-strong);
		background-color: var(--bg-soft);
		color: var(--text);
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		cursor: pointer;
	}

	.filter-tab[aria-pressed='true'],
	.filter-tab:hover {
		background-color: var(--panel2);
		color: #ffffff;
	}

	.filter-status {
		margin: 0 0 1rem;
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.8125rem;
		line-height: 1.5rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: #c4c8c7;
	}

	.etf-grid__empty {
		grid-column: 1 / -1;
		margin: 0;
		padding: 2rem 1rem;
		border: 2px dashed var(--line-strong);
		text-align: center;
		color: #c4c8c7;
	}

	.etf-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.5rem;
	}

	.etf-card {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		border: 2px solid var(--line-strong);
		background-color: var(--bg-soft);
		padding: 1.5rem;
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}

	.etf-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
	}

	.etf-card__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding-bottom: 0.75rem;
		border-bottom: 2px solid var(--line-strong);
	}

	.etf-card__symbol-group {
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}

	.etf-card__symbol {
		font-family: var(--font-display);
		font-weight: 900;
		font-size: 1.25rem;
		background-color: var(--panel2);
		color: #ffffff;
		padding: 0.2rem 0.6rem;
		letter-spacing: 0.02em;
	}

	.etf-card__cat {
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.6875rem;
		text-transform: uppercase;
		color: #c4c8c7;
	}

	.etf-card__chart-link {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.6875rem;
		text-transform: uppercase;
		border: 1.5px solid var(--line-strong);
		background-color: var(--bg-soft);
		color: var(--text);
		padding: 0.25rem 0.5rem;
		text-decoration: none;
	}

	.etf-card__chart-link:hover {
		background-color: var(--panel2);
		color: #ffffff;
	}

	.etf-card__name {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 1.125rem;
		line-height: 1.25;
		margin: 0.875rem 0 0.25rem;
	}

	.etf-card__options-tier {
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-secondary);
		margin: 0 0 0.75rem;
	}

	.etf-card__description {
		font-family: var(--font-sans);
		font-size: 0.90625rem;
		line-height: 1.55;
		color: var(--text);
		margin: 0 0 0.875rem;
	}

	.etf-card__inst-note {
		background-color: var(--panel);
		border-left: 3px solid var(--line-strong);
		padding: 0.625rem 0.75rem;
		font-family: var(--font-sans);
		font-size: 0.8125rem;
		line-height: 1.45;
		color: var(--text);
		margin-bottom: 1rem;
	}

	.etf-card__features {
		margin-top: auto;
		padding-top: 0.75rem;
		border-top: 1px solid var(--line);
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.etf-card__feature {
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.6875rem;
		text-transform: uppercase;
		border: 1px solid var(--line-strong);
		background-color: var(--panel);
		padding: 0.15rem 0.45rem;
	}

	/* 5. All 11 S&P 500 Sector ETFs Grid */
	.sector-section {
		padding: 3.5rem 0;
		border-bottom: 2px solid var(--line-strong);
	}

	.sector-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.5rem;
	}

	.sector-card {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		border: 2px solid var(--line-strong);
		background-color: var(--bg-soft);
		padding: 1.5rem;
	}

	.sector-card__top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding-bottom: 0.625rem;
		border-bottom: 2px solid var(--line-strong);
	}

	.sector-card__primary-ticker {
		font-family: var(--font-display);
		font-weight: 900;
		font-size: 0.875rem;
		background-color: var(--panel2);
		color: #ffffff;
		padding: 0.2rem 0.55rem;
	}

	.sector-card__title {
		font-family: var(--font-display);
		font-weight: 900;
		font-size: 1.25rem;
		margin: 0.875rem 0 0.25rem;
	}

	.sector-card__weight {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-secondary);
		margin: 0 0 0.625rem;
	}

	.sector-card__role {
		font-family: var(--font-sans);
		font-size: 0.90625rem;
		line-height: 1.55;
		color: var(--text);
		margin: 0 0 1.25rem;
	}

	.sector-card__etfs-box {
		margin-top: auto;
		padding-top: 0.875rem;
		border-top: 1px solid var(--line);
	}

	.sector-card__etfs {
		margin-top: 0.5rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
	}

	.sector-card__etf {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		border: 1.5px solid var(--line-strong);
		background-color: var(--panel);
		color: var(--text);
		padding: 0.3rem 0.6rem;
		text-decoration: none;
	}

	.sector-card__etf:hover {
		background-color: var(--panel2);
		color: #ffffff;
	}

	/* 6. ETFs vs Mutual Funds Comparison Table */
	.comparison-section {
		padding: 3.5rem 0;
		border-bottom: 2px solid var(--line-strong);
		background-color: var(--panel);
	}

	.table-wrapper {
		width: 100%;
		overflow-x: auto;
		border: 2px solid var(--line-strong);
		background-color: var(--bg-soft);
	}

	.comparison-table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
		min-width: 680px;
	}

	.comparison-table th,
	.comparison-table td {
		padding: 1rem 1.25rem;
		border-bottom: 1.5px solid var(--line);
		border-right: 1.5px solid var(--line);
		vertical-align: top;
	}

	.comparison-table thead th {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.8125rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background-color: var(--panel2);
		color: #ffffff;
	}

	.comparison-table__feature {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.875rem;
		width: 24%;
		background-color: var(--panel);
	}

	.comparison-table__etf {
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		width: 38%;
	}

	.comparison-table__winner {
		font-weight: 700;
		color: var(--text);
	}

	.winner-check {
		font-family: var(--font-display);
		font-weight: 900;
		margin-right: 0.35rem;
	}

	.comparison-table__mf {
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		color: #c4c8c7;
		width: 38%;
	}

	.comparison-summary {
		margin-top: 1.75rem;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.5rem;
	}

	.comparison-summary__card {
		border: 2px solid var(--line-strong);
		background-color: var(--bg-soft);
		padding: 1.5rem;
	}

	.comparison-summary__card--featured {
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
	}

	.comparison-summary__card h3 {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 1.2rem;
		margin: 0.375rem 0 0.5rem;
	}

	.comparison-summary__card p {
		margin: 0;
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		line-height: 1.55;
	}

	/* 7. FAQ & Sibling Resources Bar */
	.faq-section {
		padding: 3.5rem 0;
		border-bottom: 2px solid var(--line-strong);
	}

	.faq-container {
		max-width: 960px;
	}

	.faq-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.faq-item {
		border: 2px solid var(--line-strong);
		background-color: var(--panel);
		padding: 1.25rem 1.5rem;
	}

	.faq-item__question {
		list-style: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 1.0625rem;
	}

	.faq-item__question::-webkit-details-marker {
		display: none;
	}

	.faq-item__icon {
		font-family: var(--font-display);
		font-weight: 900;
		font-size: 1.25rem;
	}

	.faq-item__answer {
		margin: 1rem 0 0;
		padding-top: 1rem;
		border-top: 1px solid var(--line);
		font-family: var(--font-sans);
		font-size: 0.96875rem;
		line-height: 1.65;
	}

	.resources-bridge {
		margin-top: 2.25rem;
		border: 2px solid var(--line-strong);
		background-color: var(--panel);
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 1rem;
	}

	.resources-bridge__title {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 1.2rem;
		margin: 0.25rem 0 0;
	}

	.resources-bridge__links {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* 8. 5-Card Room & Alert CTA Section */
	.pro-cta-section {
		padding: 3.5rem 0 4rem;
		background-color: var(--bg-soft);
	}

	.pro-cta-box {
		border: 2px solid var(--line-strong);
		background-color: var(--panel);
		padding: 2rem 1.25rem;
	}

	.pro-cta-box__header {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 2rem;
	}

	.pro-cta-box__h2 {
		text-align: center;
	}

	.pro-cta-box__sub {
		text-align: center;
		margin: 0.75rem auto 0;
	}

	.room-cta-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.25rem;
	}

	.room-cta-card {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		border: 2px solid var(--line-strong);
		background-color: var(--bg-soft);
		padding: 1.35rem;
		text-align: center;
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}

	.room-cta-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
	}

	.room-cta-card__badge {
		display: inline-block;
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.6875rem;
		text-transform: uppercase;
		border: 1px solid var(--line-strong);
		background-color: var(--panel);
		padding: 0.15rem 0.5rem;
	}

	.room-cta-card__title {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 1.125rem;
		margin: 0.75rem 0 0.5rem;
	}

	.room-cta-card__desc {
		font-family: var(--font-sans);
		font-size: 0.875rem;
		line-height: 1.5;
		color: #c4c8c7;
		margin: 0 0 1.25rem;
	}

	/* ===========================================================================
     ENTERPRISE RESPONSIVE BREAKPOINTS (480px, 640px, 768px, 1024px, 1280px, 1536px)
     =========================================================================== */
	@media (min-width: 480px) {
		.container {
			padding: 0 1.25rem;
		}
	}

	@media (min-width: 640px) {
		.container {
			padding: 0 1.5rem;
		}
		.cta-row,
		.resources-bridge__links {
			flex-direction: row;
			flex-wrap: wrap;
		}
		.benefits-grid,
		.types-grid,
		.etf-grid,
		.sector-grid,
		.comparison-summary,
		.room-cta-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 768px) {
		.directory-top-bar,
		.resources-bridge {
			flex-direction: row;
			align-items: center;
		}
		.pro-cta-box {
			padding: 2.75rem 2rem;
		}
	}

	@media (min-width: 1024px) {
		.container {
			padding: 0 2rem;
		}
		.hero-section,
		.foundation-section,
		.directory-section,
		.sector-section,
		.comparison-section,
		.faq-section {
			padding: 4.5rem 0;
		}
		.hero-section__grid {
			grid-template-columns: repeat(12, minmax(0, 1fr));
			gap: 2.5rem;
		}
		.hero-section__main {
			grid-column: span 7;
		}
		.quick-ref-card {
			grid-column: span 5;
		}
		.benefits-grid,
		.types-grid,
		.etf-grid,
		.sector-grid,
		.room-cta-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@media (min-width: 1280px) {
		.hero-section__grid {
			gap: 3.5rem;
		}
		.etf-grid {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
		.room-cta-grid {
			grid-template-columns: repeat(5, minmax(0, 1fr));
		}
	}

	@media (min-width: 1536px) {
		.container {
			max-width: 1536px;
		}
	}
</style>
