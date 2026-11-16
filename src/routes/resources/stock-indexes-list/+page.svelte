<!--
	URL: /resources/stock-indexes-list
-->
<script lang="ts">
	/**
	 * Stock Indexes List Page - Google L11 Enterprise Standard
	 * Comprehensive stock index education and reference resource
	 */
	import { resolve } from '$app/paths';
	import { cubicOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import { JsonLd } from 'svelte-meta-tags';
	import Breadcrumb from '#lib/components/layout/Breadcrumb.svelte';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import { BRAND } from '#lib/config/brand.ts';
	import { STOCK_INDEXES_LIST_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import {
		IconChartLine,
		IconWorld,
		IconArrowRight,
		IconQuestionMark,
		IconExternalLink,
		IconChartBar,
		IconBuildingSkyscraper,
		IconChevronDown
	} from '#lib/icons/index.ts';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Major Stock Indexes with detailed info
	const majorIndexes = [
		{
			symbol: 'SPX',
			ticker: '$SPX',
			name: 'S&P 500',
			description:
				'Tracks the 500 largest companies listed on major U.S. exchanges. Market capitalization-weighted, offering comprehensive representation of the U.S. stock market.',
			etfs: ['SPY', 'VOO', 'IVV'],
			region: 'US',
			companies: 500,
			type: 'Large-Cap'
		},
		{
			symbol: 'DJI',
			ticker: '$DJI',
			name: 'Dow Jones Industrial Average',
			description:
				'Measures the top 30 U.S. large-cap stocks. One of the oldest and most widely followed indexes, representing blue-chip companies.',
			etfs: ['DIA'],
			region: 'US',
			companies: 30,
			type: 'Large-Cap'
		},
		{
			symbol: 'COMPQ',
			ticker: '$COMPQ',
			name: 'NASDAQ Composite',
			description:
				'Includes all stocks listed on the NASDAQ exchange. Heavily weighted toward technology and growth companies.',
			etfs: ['QQQ', 'ONEQ'],
			region: 'US',
			companies: 3000,
			type: 'All-Cap'
		},
		{
			symbol: 'NDX',
			ticker: '$NDX',
			name: 'NASDAQ 100',
			description:
				'Measures the top 100 largest non-financial companies listed on NASDAQ. Known for its tech-heavy composition.',
			etfs: ['QQQ', 'QQQM'],
			region: 'US',
			companies: 100,
			type: 'Large-Cap'
		},
		{
			symbol: 'RUT',
			ticker: '$RUT',
			name: 'Russell 2000',
			description:
				'Tracks 2,000 small-cap U.S. companies. A benchmark for small-cap stock performance and economic health.',
			etfs: ['IWM', 'VTWO'],
			region: 'US',
			companies: 2000,
			type: 'Small-Cap'
		},
		{
			symbol: 'VIX',
			ticker: '$VIX',
			name: 'CBOE Volatility Index',
			description:
				'Measures market expectations of near-term volatility. Known as the "fear gauge" of the market.',
			etfs: ['VXX', 'UVXY'],
			region: 'US',
			companies: 0,
			type: 'Volatility'
		},
		{
			symbol: 'FTSE',
			ticker: 'FTSE',
			name: 'FTSE 100',
			description:
				'Tracks the 100 largest companies listed on the London Stock Exchange by market capitalization.',
			etfs: ['ISF', 'VUKE'],
			region: 'UK',
			companies: 100,
			type: 'Large-Cap'
		},
		{
			symbol: 'DAX',
			ticker: 'DAX',
			name: 'DAX 40',
			description:
				"Germany's premier stock index, tracking the 40 largest and most liquid companies on the Frankfurt Stock Exchange.",
			etfs: ['EWG', 'DAX'],
			region: 'Germany',
			companies: 40,
			type: 'Large-Cap'
		},
		{
			symbol: 'N225',
			ticker: 'N225',
			name: 'Nikkei 225',
			description:
				"Japan's leading stock index, tracking 225 large, publicly owned companies from a wide range of industries.",
			etfs: ['EWJ', 'DXJ'],
			region: 'Japan',
			companies: 225,
			type: 'Large-Cap'
		},
		{
			symbol: 'HSI',
			ticker: 'HSI',
			name: 'Hang Seng Index',
			description:
				'Tracks the largest companies listed on the Hong Kong Stock Exchange, representing about 60% of total market cap.',
			etfs: ['EWH', 'FXI'],
			region: 'Hong Kong',
			companies: 82,
			type: 'Large-Cap'
		}
	];

	let selectedRegion = $state('all');

	let regions = $derived(['all', ...new Set(majorIndexes.map((i) => i.region))]);

	let filteredIndexes = $derived(
		majorIndexes.filter((index) => {
			return selectedRegion === 'all' || index.region === selectedRegion;
		})
	);
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#main-content">Skip to content</a>

<div class="app-shell">
	<Navbar />

	<main id="main-content" class="indexes-page">
		<Breadcrumb
			items={[
				{ label: 'Home', href: '/' },
				{ label: 'Free Trading Resources', href: '/resources' },
				{ label: 'Cash-Settled Indexes & Section 1256' }
			]}
		>
			<span>10 Global Benchmarks</span> • <span>SPX, XSP, NDX, RUT &amp; VIX</span> •
			<span>Section 1256 Cash-Settled Guide</span>
		</Breadcrumb>

		<!-- Hero Section -->
		<section class="hero">
			<div class="hero__bg">
				<div class="hero__gradient"></div>
				<div class="hero__grid"></div>
			</div>
			<div class="hero__content" in:fly={{ y: 30, duration: 600, easing: cubicOut }}>
				<div class="hero__badge">
					<IconChartBar size={20} aria-hidden="true" focusable="false" />
					<span>IRC Section 1256 &amp; Index Reference</span>
				</div>
				<h1 class="hero__title">Cash-Settled Index Options &amp; Section 1256 Guide</h1>
				<p class="hero__subtitle">
					Compare SPX, mini-XSP, NDX, RUT, and VIX European cash-settled index contracts against SPY
					and QQQ equity ETFs — eliminating early share assignment while qualifying for 60/40 U.S.
					Section 1256 tax treatment across 10 major benchmarks.
				</p>
				<p class="hero__byline">
					Authored by <a href={resolve('/about')}>{BRAND.founder.name}</a> •
					<time datetime="2026-11-16">Updated November 16, 2026</time>
				</p>
			</div>
		</section>

		<!-- S&P 500 Feature Section -->
		<section class="section" in:fade={{ delay: 200, duration: 400 }}>
			<div class="container">
				<div class="sp500-feature">
					<div class="sp500-feature__content">
						<div class="sp500-feature__badge">Featured Index</div>
						<h2 class="sp500-feature__title">S&amp;P 500 Index</h2>
						<p class="sp500-feature__text">
							The S&amp;P 500 is a prominent stock index that tracks the 500 largest companies
							listed on major U.S. exchanges, such as the NYSE and NASDAQ. This index is weighted
							based on the total market capitalization of each company's outstanding shares, which
							means it offers a comprehensive representation of the overall U.S. stock market, more
							so than other indexes like the Dow Jones Industrial Average (DJIA) or the Russell
							2000.
						</p>
						<p class="sp500-feature__text">
							Recognized globally as one of the most influential stock indexes, the S&amp;P 500 is
							market capitalization-weighted. This indicates that companies with larger market
							values have a more significant impact on the index's overall performance compared to
							smaller companies. In essence, bigger companies exert more influence over the market's
							overall movement.
						</p>
						<p class="sp500-feature__text sp500-feature__text--highlight">
							<strong>Pro Tip:</strong> Investors aiming for exposure to large-cap stocks (such as
							Apple or Microsoft) might find it beneficial to invest in ETFs like
							<span class="ticker">VOO</span>
							or <span class="ticker">IVV</span> rather than picking individual stocks for their portfolio.
						</p>
						<p class="sp500-feature__text">
							To closely monitor market trends, <span class="ticker">$SPY</span> and
							<span class="ticker">$ES</span> (S&amp;P 500 futures) are commonly used instruments. Having
							a chart of either SPY or SPY futures is crucial when trading stocks, as the majority of
							stocks tend to move in tandem with the broader market.
						</p>
						<div class="sp500-feature__etfs">
							<span class="sp500-feature__etfs-label">Popular S&amp;P 500 ETFs:</span>
							<div class="sp500-feature__etfs-list">
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
								<a
									href="https://www.tradingview.com/symbols/AMEX-SPY/"
									target="_blank"
									rel="noopener noreferrer"
									class="etf-chip">SPY</a
								>
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
								<a
									href="https://www.tradingview.com/symbols/AMEX-VOO/"
									target="_blank"
									rel="noopener noreferrer"
									class="etf-chip">VOO</a
								>
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
								<a
									href="https://www.tradingview.com/symbols/AMEX-IVV/"
									target="_blank"
									rel="noopener noreferrer"
									class="etf-chip">IVV</a
								>
							</div>
						</div>
					</div>
					<div class="sp500-feature__chart">
						<div class="chart-placeholder">
							<IconChartLine size={64} aria-hidden="true" focusable="false" />
							<span>SPY Chart</span>
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a
								href="https://www.tradingview.com/symbols/AMEX-SPY/"
								target="_blank"
								rel="noopener noreferrer"
								class="chart-link"
							>
								View on TradingView
								<IconExternalLink size={16} aria-hidden="true" focusable="false" />
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- All Indexes Section -->
		<section class="section section--dark">
			<div class="container">
				<div class="section__header">
					<h2 class="section__title">Major Stock Indexes</h2>
					<p class="section__description">
						Explore the world's most important stock market indexes and learn how to track them.
					</p>
				</div>

				<!-- Region Filter -->
				<div class="filter-bar">
					<label for="region-filter">
						<IconWorld size={20} aria-hidden="true" focusable="false" />
						<span class="sr-only">Filter by region</span>
					</label>
					<select
						id="region-filter"
						name="regionFilter"
						aria-label="Filter stock indexes by region"
						bind:value={selectedRegion}
						class="filter-select"
						autocomplete="off"
					>
						{#each regions as region (region)}
							<option value={region}>{region === 'all' ? 'All Regions' : region}</option>
						{/each}
					</select>
				</div>

				<!-- Index Cards Grid -->
				<div class="index-grid">
					{#each filteredIndexes as index, i (index.symbol)}
						<div class="index-card" in:fly={{ y: 20, delay: 50 * i, duration: 400 }}>
							<div class="index-card__header">
								<div class="index-card__symbol">{index.symbol}</div>
								<span class="index-card__region">{index.region}</span>
							</div>
							<h3 class="index-card__name">{index.name}</h3>
							<p class="index-card__ticker">Ticker: <span>{index.ticker}</span></p>
							<p class="index-card__description">{index.description}</p>
							<div class="index-card__meta">
								<div class="index-card__meta-item">
									<IconBuildingSkyscraper size={16} aria-hidden="true" focusable="false" />
									<span>{index.companies > 0 ? `${index.companies} Companies` : 'N/A'}</span>
								</div>
								<div class="index-card__meta-item">
									<IconChartBar size={16} aria-hidden="true" focusable="false" />
									<span>{index.type}</span>
								</div>
							</div>
							<div class="index-card__etfs">
								<span class="index-card__etfs-label">Related ETFs:</span>
								<div class="index-card__etfs-list">
									{#each index.etfs as etf (etf)}
										<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
										<a
											href="https://www.tradingview.com/symbols/AMEX-{etf}/"
											target="_blank"
											rel="noopener noreferrer"
											class="etf-chip etf-chip--small"
										>
											{etf}
										</a>
									{/each}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Section 1256 Cash-Settled Index Options vs. Equity ETF Options -->
		<section class="section sec1256-section" aria-labelledby="sec1256-h2">
			<div class="container">
				<div class="section__header">
					<p class="sec1256-kicker">U.S. IRC Section 1256 · Settlement &amp; Tax Mechanics</p>
					<h2 id="sec1256-h2" class="section__title">
						Cash-Settled Index Options (SPX, XSP, NDX, RUT, VIX) vs. Equity ETFs (SPY, QQQ, IWM)
					</h2>
					<p class="section__description">
						Active U.S. options traders frequently transition from equity ETF options (SPY, QQQ,
						IWM) into Cboe and Nasdaq broad-based index contracts (SPX, mini-XSP, NDX, RUT, VIX) to
						eliminate early share assignment, avoid 4:00–5:30 PM ET pin risk, and qualify for 60/40
						Section 1256 capital-gains treatment. (Educational tax overview only — Canadian traders
						and U.S. filers should consult a licensed CPA.)
					</p>
				</div>

				<!-- svelte-ignore a11y_no_noninteractive_tabindex (Scrollable table regions need native keyboard access.) -->
				<div
					class="sec1256-table-wrap"
					role="region"
					aria-label="Cash-settled index options comparison table"
					tabindex="0"
				>
					<table class="sec1256-table">
						<thead>
							<tr>
								<th scope="col">Contract Dimension</th>
								<th scope="col">Broad-Based Index Options (SPX, XSP, NDX, RUT, VIX)</th>
								<th scope="col">Equity ETF Options (SPY, QQQ, IWM, DIA)</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<th scope="row">Exercise Style</th>
								<td>
									<strong>European-Style:</strong> Cannot be exercised prior to expiration — zero early
									assignment risk on short spread legs.
								</td>
								<td>
									<strong>American-Style:</strong> Short in-the-money legs can be assigned shares early,
									especially around ex-dividend dates.
								</td>
							</tr>
							<tr>
								<th scope="row">Expiration Settlement</th>
								<td>
									<strong>100% Cash-Settled:</strong> Credits or debits net cash directly to your brokerage
									balance with zero stock delivery.
								</td>
								<td>
									<strong>Physical Share Delivery:</strong> Delivers 100 ETF shares per contract, triggering
									after-hours margin/pin risk between 4:00 PM and 5:30 PM ET.
								</td>
							</tr>
							<tr>
								<th scope="row">U.S. Federal Tax Rule (IRC § 1256)</th>
								<td class="sec1256-win tabular-nums">
									<strong>60% Long-Term / 40% Short-Term</strong> regardless of holding period (even
									on 0DTE intraday trades) — ~<strong>26.8%</strong> max blended federal rate vs. 37%
									ordinary rate, marked-to-market on IRS Form 6781.
								</td>
								<td class="tabular-nums">
									<strong>100% Short-Term Ordinary Income</strong> on positions held ≤ 1 year (up to
									<strong>37%</strong> top federal bracket) and subject to 30-day wash-sale tracking.
								</td>
							</tr>
							<tr>
								<th scope="row">Notional Sizing &amp; Small Accounts</th>
								<td class="tabular-nums">
									SPX = 10× SPY notional (institutional commission efficiency); mini-XSP = 1/10th
									SPX (1× SPY notional) for $500+ small accounts.
								</td>
								<td class="tabular-nums">
									1× ETF share price × 100 multiplier; accessible per-contract cost but carries
									share-assignment margin exposure.
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<aside class="sec1256-funnel" aria-label="Related execution desks and calculators">
					<p class="sec1256-funnel__copy">
						<strong>Put Cash-Settled Index Mechanics Into Action:</strong> Follow pre-planned SPX
						and XSP 0DTE/1DTE structural blueprints in
						<a href={resolve('/alert-services/spx-profit-pulse')}>SPX Profit Pulse</a>, watch live
						Monthly-to-1-Minute execution in our
						<a href={resolve('/live-trading-rooms/day-trading-room')}>Day Trading Room</a>, or plan
						multi-day sector/index setups in the
						<a href={resolve('/live-trading-rooms/swing-trading-room')}>Swing Trading Room</a>.
					</p>
				</aside>
			</div>
		</section>

		<!-- FAQ Section -->
		<section class="section">
			<div class="container">
				<div class="section__header">
					<h2 class="section__title">Frequently Asked Questions</h2>
					<p class="section__description">
						Common questions about stock indexes and how to invest in them.
					</p>
				</div>

				<div class="faq-list">
					{#each STOCK_INDEXES_LIST_FAQ_ITEMS as faq (faq.id)}
						<details class="faq-item" name="stock-indexes-faq">
							<summary class="faq-item__question">
								<IconQuestionMark
									size={20}
									class="faq-item__icon"
									aria-hidden="true"
									focusable="false"
								/>
								<span>{faq.question}</span>
								<span class="faq-item__chevron" aria-hidden="true"
									><IconChevronDown size={20} aria-hidden="true" focusable="false" /></span
								>
							</summary>
							<div class="faq-item__answer">
								{#each faq.answer.split('\n') as line, lineIdx (`${lineIdx}-${line}`)}
									<p>{line}</p>
								{/each}
							</div>
						</details>
					{/each}
				</div>
			</div>
		</section>

		<!-- CTA Section -->
		<section class="cta-section">
			<div class="container">
				<div class="cta-content">
					<h2 class="cta-title">Ready to Trade Clean Index &amp; Sector Structure?</h2>
					<p class="cta-text">
						Join {BRAND.name} for live 100% indicator-free execution rooms, structured SPX &amp; swing
						blueprints, and free risk calculators.
					</p>
					<div class="cta-buttons">
						<a href={resolve('/alert-services/spx-profit-pulse')} class="cta-btn cta-btn--primary">
							Explore SPX Profit Pulse Alerts
							<IconArrowRight size={20} aria-hidden="true" focusable="false" />
						</a>
						<a
							href={resolve('/live-trading-rooms/day-trading-room')}
							class="cta-btn cta-btn--secondary"
						>
							Live Day Trading Room
						</a>
						<a
							href={resolve('/live-trading-rooms/swing-trading-room')}
							class="cta-btn cta-btn--secondary"
						>
							Swing Trading Room
						</a>
						<a href={resolve('/resources/options-calculator')} class="cta-btn cta-btn--secondary">
							Model SPX &amp; XSP Options Greeks
						</a>
					</div>
				</div>
			</div>
		</section>
	</main>

	<Footer />
</div>

<style>
	.sec1256-section {
		border-block-start: 1px solid var(--line);
	}

	.sec1256-kicker {
		font-family: var(--font-mono);
		font-size: var(--text-eyebrow);
		font-weight: var(--weight-bold);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--acid);
		margin: 0 0 0.5rem;
	}

	.sec1256-table-wrap:focus-visible {
		outline: 3px solid var(--acid);
		outline-offset: -3px;
	}

	.sec1256-table-wrap {
		overflow-x: auto;
		border: 1px solid var(--line-strong);
		background: var(--panel);
		margin-block-start: 1.5rem;
	}

	.sec1256-table {
		inline-size: 100%;
		border-collapse: collapse;
		font-size: var(--step-body-sm);
		line-height: var(--leading-body);
		color: var(--text);
	}

	.sec1256-table th,
	.sec1256-table td {
		padding: 0.95rem 1.1rem;
		border-block-end: 1px solid var(--line);
		text-align: start;
		vertical-align: top;
	}

	.sec1256-table thead th {
		font-family: var(--font-display);
		font-weight: var(--weight-bold);
		background: var(--bg);
		color: var(--text);
	}

	.sec1256-table tbody th {
		font-family: var(--font-display);
		font-weight: var(--weight-semibold);
		min-inline-size: 11rem;
	}

	.sec1256-win {
		color: var(--text);
	}

	.sec1256-funnel {
		margin-block-start: 1.25rem;
		padding: 1.1rem 1.25rem;
		border: 1px solid var(--line-strong);
		background: var(--panel);
	}

	.sec1256-funnel__copy {
		margin: 0;
		font-size: var(--step-body-sm);
		line-height: var(--leading-body);
		color: var(--text);
	}

	.sec1256-funnel__copy a {
		color: var(--acid);
		text-decoration: underline;
		text-underline-offset: 0.18em;
	}
</style>
