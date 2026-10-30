<!--
	URL: /resources/etf-stocks-list
-->
<script lang="ts">
	/**
	 * ETF Stock List Page - Google L11 Enterprise Standard
	 * Comprehensive ETF education and reference resource
	 */
	import '#lib/styles/inner-page.css';
	import { resolve } from '$app/paths';
	import { cubicOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import {
		IconChartLine,
		IconCoin,
		IconBuildingBank,
		IconHeartbeat,
		IconBolt,
		IconCpu,
		IconShoppingCart,
		IconHome,
		IconTools,
		IconLeaf,
		IconArrowRight,
		IconCheck,
		IconExternalLink
	} from '#lib/icons/index.ts';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Featured ETFs with full descriptions
	const featuredETFs = [
		{
			symbol: 'SPY',
			name: 'SPDR S&P 500 ETF',
			description:
				'One of the oldest and most well-known ETFs, designed to track the performance of the S&P 500 index, which includes 500 of the largest U.S. companies.',
			features: ['High liquidity', 'Broad market exposure', 'Long track record']
		},
		{
			symbol: 'QQQ',
			name: 'Invesco QQQ Trust',
			description:
				'Tracks the performance of the Nasdaq-100 Index, which includes 100 of the largest non-financial companies listed on the Nasdaq Stock Market.',
			features: ['Technology focus', 'Innovation-driven companies', 'Strong historical performance']
		},
		{
			symbol: 'VTI',
			name: 'Vanguard Total Stock Market ETF',
			description:
				'Aims to track the performance of the CRSP US Total Market Index, providing exposure to the entire U.S. stock market, including small-, mid-, and large-cap stocks.',
			features: ['Comprehensive coverage', 'Low expense ratio', 'High liquidity']
		},
		{
			symbol: 'EEM',
			name: 'iShares MSCI Emerging Markets ETF',
			description:
				'Seeks to track the performance of the MSCI Emerging Markets Index, offering exposure to companies in emerging markets such as China, Brazil, and India.',
			features: [
				'High-growth potential',
				'Diversified emerging markets',
				'Geographic diversification'
			]
		},
		{
			symbol: 'IWM',
			name: 'iShares Russell 2000 ETF',
			description:
				'Tracks the performance of the Russell 2000 Index, providing exposure to small-cap U.S. companies.',
			features: ['Small-cap focus', 'Growth-oriented', 'Sector diversification']
		},
		{
			symbol: 'VEA',
			name: 'Vanguard FTSE Developed Markets ETF',
			description:
				'Aims to track the performance of the FTSE Developed All Cap ex US Index, offering exposure to developed markets outside of the U.S., including Europe, Japan, and Canada.',
			features: ['International exposure', 'Low expense ratio', 'Developed markets']
		},
		{
			symbol: 'AGG',
			name: 'iShares Core U.S. Aggregate Bond ETF',
			description:
				'Seeks to track the performance of the Bloomberg Barclays U.S. Aggregate Bond Index, providing broad exposure to U.S. investment-grade bonds.',
			features: ['Income generation', 'Fixed income diversification', 'Low expense ratio']
		},
		{
			symbol: 'VIG',
			name: 'Vanguard Dividend Appreciation ETF',
			description:
				'Focuses on U.S. companies that have a history of increasing dividends over time, tracking the performance of the NASDAQ US Dividend Achievers Select Index.',
			features: ['Dividend income', 'Financially stable companies', 'Low expense ratio']
		},
		{
			symbol: 'GLD',
			name: 'SPDR Gold Shares',
			description:
				'Aims to track the performance of the price of gold bullion, providing a simple and cost-effective way to invest in gold.',
			features: ['Inflation hedge', 'Physical gold backing', 'High liquidity']
		},
		{
			symbol: 'ARKK',
			name: 'ARK Innovation ETF',
			description:
				'Managed by ARK Invest, this actively managed ETF focuses on disruptive innovation across various sectors, including technology, healthcare, and industrials.',
			features: ['High growth potential', 'Cutting-edge technologies', 'Actively managed']
		},
		{
			symbol: 'EFA',
			name: 'iShares MSCI EAFE ETF',
			description:
				'Aims to track the performance of the MSCI EAFE Index, which includes large- and mid-cap stocks across developed markets outside of the U.S. and Canada.',
			features: ['International diversification', 'Established global companies', 'High liquidity']
		},
		{
			symbol: 'SCHB',
			name: 'Schwab U.S. Broad Market ETF',
			description:
				'Seeks to track the performance of the Dow Jones U.S. Broad Stock Market Index, providing exposure to the entire U.S. equity market.',
			features: ['Comprehensive exposure', 'Low expense ratio', 'High liquidity']
		}
	];

	// Sector ETFs
	// `variant` controls the icon gradient via .sector-card__icon--<variant> classes.
	const sectorETFs: Array<{
		sector: string;
		symbol: string;
		icon: typeof IconCpu;
		variant:
			'blue' | 'pink' | 'orange' | 'green' | 'teal' | 'yellow' | 'slate' | 'purple' | 'indigo';
		etfs: string[];
	}> = [
		{
			sector: 'Technology',
			symbol: 'XLK',
			icon: IconCpu,
			variant: 'blue',
			etfs: ['XLK', 'VGT', 'SMH', 'SOXX', 'PSI']
		},
		{
			sector: 'Healthcare',
			symbol: 'XLV',
			icon: IconHeartbeat,
			variant: 'pink',
			etfs: ['XLV', 'VHT', 'IHF', 'IBB', 'XBI', 'BBH']
		},
		{
			sector: 'Energy',
			symbol: 'XLE',
			icon: IconBolt,
			variant: 'orange',
			etfs: ['XLE', 'VDE', 'IYE', 'ICLN', 'TAN', 'PBW']
		},
		{
			sector: 'Financial',
			symbol: 'XLF',
			icon: IconBuildingBank,
			variant: 'green',
			etfs: ['XLF', 'VFH', 'IYF', 'KRE', 'KBE']
		},
		{
			sector: 'Materials',
			symbol: 'XLB',
			icon: IconLeaf,
			variant: 'teal',
			etfs: ['XLB', 'VAW', 'IYM', 'XME', 'PICK', 'GDX']
		},
		{
			sector: 'Utilities',
			symbol: 'XLU',
			icon: IconHome,
			variant: 'yellow',
			etfs: ['XLU', 'VPU', 'IDU']
		},
		{
			sector: 'Industrials',
			symbol: 'XLI',
			icon: IconTools,
			variant: 'slate',
			etfs: ['XLI', 'VIS', 'IYJ', 'ITA', 'XAR', 'PPA']
		},
		{
			sector: 'Consumer Staples',
			symbol: 'XLP',
			icon: IconShoppingCart,
			variant: 'purple',
			etfs: ['XLP', 'VDC', 'KXI']
		},
		{
			sector: 'Consumer Discretionary',
			symbol: 'XLY',
			icon: IconCoin,
			variant: 'indigo',
			etfs: ['XLY', 'VCR', 'IYC', 'ITB']
		}
	];

	// ETF Benefits
	const etfBenefits = [
		{
			title: 'Diverse Holdings',
			description:
				'ETFs often track an index, such as the S&P 500, meaning they include a broad selection of stocks or other securities from that index. This inherent diversity helps spread risk across various assets.'
		},
		{
			title: 'Tradable Like Stocks',
			description:
				'ETFs are bought and sold on stock exchanges throughout the trading day at market prices. This allows investors to trade ETFs just like individual stocks, with the flexibility to enter and exit positions as needed during market hours.'
		},
		{
			title: 'Lower Costs',
			description:
				'Compared to mutual funds, ETFs typically have lower expense ratios. This is because most ETFs are passively managed, meaning they aim to replicate the performance of an index rather than actively selecting securities.'
		},
		{
			title: 'Transparency',
			description:
				'ETFs disclose their holdings daily, providing investors with a clear and up-to-date view of the assets they are investing in. This level of transparency helps investors make informed decisions.'
		},
		{
			title: 'Tax Efficiency',
			description:
				'ETFs are generally more tax-efficient than mutual funds. Due to their unique structure, ETFs can minimize capital gains distributions, which can result in lower tax liabilities for investors.'
		}
	];

	// ETF Types
	const etfTypes = [
		{
			type: 'Stock ETFs',
			description:
				'Track a specific index of stocks, providing exposure to a wide range of companies within that index.'
		},
		{
			type: 'Bond ETFs',
			description:
				'Hold a collection of bonds, offering exposure to various types of debt securities including government and corporate bonds.'
		},
		{
			type: 'Commodity ETFs',
			description:
				'Invest in physical commodities such as gold, silver, oil, or agricultural products without having to physically purchase and store them.'
		},
		{
			type: 'Sector ETFs',
			description:
				'Focus on specific sectors or industries, such as technology, healthcare, or energy, allowing targeted investment.'
		},
		{
			type: 'International ETFs',
			description:
				"Provide exposure to markets outside of the investor's home country, helping to diversify geographically."
		}
	];

	// ETF vs Mutual Fund comparison
	const comparisonData = [
		{
			feature: 'Trading',
			etf: 'Traded throughout the day like stocks',
			mutualFund: 'Bought/sold at end of day at NAV price',
			etfBetter: true
		},
		{
			feature: 'Management',
			etf: 'Generally passive, tracking an index',
			mutualFund: 'Can be actively or passively managed',
			etfBetter: null
		},
		{
			feature: 'Expense Ratios',
			etf: 'Often lower due to passive nature',
			mutualFund: 'May be higher, especially if actively managed',
			etfBetter: true
		},
		{
			feature: 'Minimum Investment',
			etf: 'No minimum - buy as little as one share',
			mutualFund: 'Often have minimum requirements ($500-$3000+)',
			etfBetter: true
		},
		{
			feature: 'Tax Efficiency',
			etf: 'More tax-efficient structure',
			mutualFund: 'Less tax-efficient, more capital gains distributions',
			etfBetter: true
		},
		{
			feature: 'Flexibility',
			etf: 'Intraday trading, short selling, limit orders',
			mutualFund: 'End of day trading only',
			etfBetter: true
		},
		{
			feature: 'Best For',
			etf: 'Cost-conscious, active traders',
			mutualFund: 'Hands-off investors, professional management',
			etfBetter: null
		}
	];
</script>

<JsonLd schema={data.jsonLdSchema} />

<div class="app-shell">
	<Navbar />

	<main id="main-content" class="etf-page">
		<!-- Hero Section -->
		<section class="hero">
			<div class="hero__bg">
				<div class="hero__gradient"></div>
				<div class="hero__grid"></div>
			</div>
			<div class="hero__content" in:fly={{ y: 30, duration: 600, easing: cubicOut }}>
				<div class="hero__badge">
					<IconChartLine size={20} />
					<span>Investment Resource</span>
				</div>
				<h1 class="hero__title">ETF Stock List</h1>
				<p class="hero__subtitle">
					Your comprehensive guide to Exchange-Traded Funds. Explore top ETFs, understand their
					benefits, and discover sector-specific opportunities for portfolio diversification.
				</p>
			</div>
		</section>

		<!-- What is an ETF Section -->
		<section class="section" in:fade={{ delay: 200, duration: 400 }}>
			<div class="container">
				<div class="section__header">
					<h2 class="section__title">What Is an ETF?</h2>
					<p class="section__description">
						Exchange-Traded Funds (ETFs) are investment vehicles that trade on stock exchanges, much
						like individual stocks. These funds are designed to track the performance of a specific
						index, sector, commodity, or asset class, thereby offering investors a way to gain
						exposure to a broad range of underlying assets through a single investment.
					</p>
				</div>

				<!-- Benefits Grid -->
				<div class="benefits-grid">
					{#each etfBenefits as benefit, i (benefit.title)}
						<div class="benefit-card" in:fly={{ y: 20, delay: 100 * i, duration: 400 }}>
							<div class="benefit-card__icon">
								<IconCheck size={24} />
							</div>
							<h3 class="benefit-card__title">{benefit.title}</h3>
							<p class="benefit-card__text">{benefit.description}</p>
						</div>
					{/each}
				</div>

				<!-- ETF Types -->
				<div class="types-section">
					<h3 class="types-title">Types of ETFs</h3>
					<div class="types-grid">
						{#each etfTypes as type, i (type.type)}
							<div class="type-card" in:fly={{ x: -20, delay: 100 * i, duration: 400 }}>
								<h4 class="type-card__title">{type.type}</h4>
								<p class="type-card__text">{type.description}</p>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<!-- Featured ETFs Section -->
		<section class="section section--dark">
			<div class="container">
				<div class="section__header">
					<h2 class="section__title">Popular ETFs</h2>
					<p class="section__description">
						Explore the most widely traded and recognized ETFs in the market, each offering unique
						exposure and benefits.
					</p>
				</div>

				<div class="etf-grid">
					{#each featuredETFs as etf, i (etf.symbol)}
						<div class="etf-card" in:fly={{ y: 20, delay: 50 * i, duration: 400 }}>
							<div class="etf-card__header">
								<span class="etf-card__symbol">{etf.symbol}</span>
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
								<a
									href="https://www.tradingview.com/symbols/AMEX-{etf.symbol}/"
									target="_blank"
									rel="noopener noreferrer"
									class="etf-card__chart-link"
									aria-label="View {etf.symbol} chart on TradingView"
								>
									<IconExternalLink size={16} />
								</a>
							</div>
							<h3 class="etf-card__name">{etf.name}</h3>
							<p class="etf-card__description">{etf.description}</p>
							<div class="etf-card__features">
								{#each etf.features as feature (feature)}
									<span class="etf-card__feature">{feature}</span>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Sector ETFs Section -->
		<section class="section">
			<div class="container">
				<div class="section__header">
					<h2 class="section__title">ETFs By Sector</h2>
					<p class="section__description">
						Sector ETFs allow you to target specific segments of the economy. Click on any sector to
						explore available ETFs.
					</p>
				</div>

				<div class="sector-grid">
					{#each sectorETFs as sector, i (sector.sector)}
						{@const Icon = sector.icon}
						<div class="sector-card" in:fly={{ y: 20, delay: 50 * i, duration: 400 }}>
							<div class={['sector-card__icon', `sector-card__icon--${sector.variant}`]}>
								<Icon size={28} />
							</div>
							<h3 class="sector-card__title">{sector.sector}</h3>
							<div class="sector-card__etfs">
								{#each sector.etfs as etf (etf)}
									<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
									<a
										href="https://www.tradingview.com/symbols/AMEX-{etf}/"
										target="_blank"
										rel="noopener noreferrer"
										class="sector-card__etf"
									>
										{etf}
									</a>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- ETFs vs Mutual Funds Section -->
		<section class="section section--dark">
			<div class="container">
				<div class="section__header">
					<h2 class="section__title">ETFs vs Mutual Funds</h2>
					<p class="section__description">
						Both ETFs and mutual funds are popular investment vehicles, but they have key
						differences that make them suitable for different types of investors.
					</p>
				</div>

				<div class="comparison-table-wrapper">
					<table class="comparison-table">
						<thead>
							<tr>
								<th>Feature</th>
								<th>ETFs</th>
								<th>Mutual Funds</th>
							</tr>
						</thead>
						<tbody>
							{#each comparisonData as row (row.feature)}
								<tr>
									<td class="comparison-table__feature">{row.feature}</td>
									<td
										class={[
											'comparison-table__cell',
											{ 'comparison-table__cell--better': row.etfBetter === true }
										]}
									>
										{#if row.etfBetter === true}
											<IconCheck
												size={16}
												class="comparison-table__icon comparison-table__icon--check"
											/>
										{/if}
										{row.etf}
									</td>
									<td
										class={[
											'comparison-table__cell',
											{ 'comparison-table__cell--better': row.etfBetter === false }
										]}
									>
										{#if row.etfBetter === false}
											<IconCheck
												size={16}
												class="comparison-table__icon comparison-table__icon--check"
											/>
										{/if}
										{row.mutualFund}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<div class="comparison-summary">
					<div class="comparison-summary__item">
						<h3>ETFs are ideal for:</h3>
						<p>
							Cost-conscious investors who want to trade throughout the day and seek tax efficiency.
						</p>
					</div>
					<div class="comparison-summary__item">
						<h3>Mutual Funds are better for:</h3>
						<p>
							Those looking for professional management and who are comfortable with end-of-day
							trading.
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- CTA Section -->
		<section class="cta-section">
			<div class="container">
				<div class="cta-content">
					<h2 class="cta-title">Ready to Start Trading?</h2>
					<p class="cta-text">
						Join Revolution Trading Pros and get access to live trading rooms, expert alerts, and
						professional education.
					</p>
					<div class="cta-buttons">
						<a
							href={resolve('/live-trading-rooms/day-trading-room')}
							class="cta-btn cta-btn--primary"
						>
							Get Started
							<IconArrowRight size={20} />
						</a>
						<a
							href={resolve('/resources/stock-indexes-list' as '/')}
							class="cta-btn cta-btn--secondary"
						>
							View Stock Indexes List
						</a>
					</div>
				</div>
			</div>
		</section>
	</main>

	<Footer />
</div>
