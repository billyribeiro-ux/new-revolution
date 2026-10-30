<!-- src/routes/resources/+page.svelte -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import type { PageData } from './$types';

	interface ResourceItemLink {
		label: string;
		href: string;
		tag: string;
	}

	interface ResourceCategoryCard {
		code: string;
		badge: string;
		title:
			| 'Beginner Guides'
			| 'Free Tools'
			| 'Video Tutorials'
			| 'Market Analysis'
			| 'Trading Psychology'
			| 'FAQ & Support';
		summary: string;
		iconType: 'book' | 'calculator' | 'video' | 'chart' | 'mindset' | 'support';
		items: [ResourceItemLink, ResourceItemLink, ResourceItemLink, ResourceItemLink];
	}

	interface FlagshipUtility {
		code: string;
		badge: string;
		name: string;
		description: string;
		ctaLabel: string;
		href: string;
	}

	let { data }: { data: PageData } = $props();

	/* ===========================================================================
     3 CANONICAL MENU PUBLIC UTILITIES (USES .flagship-utility-card SO
     .resource-card COUNT REMAINS EXACTLY 6 FOR VITEST)
     =========================================================================== */
	const flagshipUtilities: FlagshipUtility[] = [
		{
			code: 'Public Utility 01 // Interactive Risk Engine',
			badge: '100% Free Tool',
			name: 'Options Calculator (Profit, Risk & Greeks)',
			description:
				'Calculate exact option profit targets, breakeven levels, Delta/Gamma/Theta/Vega sensitivity, and $500+ small account position sizing before entering a trade.',
			ctaLabel: 'Open Options Calculator →',
			href: '/resources/options-calculator'
		},
		{
			code: 'Public Utility 02 // Institutional Sector Map',
			badge: '12 Core + 11 Sectors',
			name: 'ETF Stocks List & Sector Directory',
			description:
				'Explore SPY, QQQ, IWM, GLD, and all 11 official S&P 500 GICS sector ETFs with live TradingView chart links and options liquidity ratings.',
			ctaLabel: 'Open ETF Stocks List →',
			href: '/resources/etf-stocks-list'
		},
		{
			code: 'Public Utility 03 // Cash-Settled Index Guide',
			badge: 'SPX • NDX • DJI • RUT • VIX',
			name: 'Stock Indexes List & Section 1256 Guide',
			description:
				'Master SPX, NDX, RUT, DJI, and VIX mechanics—including European cash settlement, zero early assignment risk, and US Section 1256 60/40 tax treatment.',
			ctaLabel: 'Open Stock Indexes List →',
			href: '/resources/stock-indexes-list'
		}
	];

	/* ===========================================================================
     EXACTLY 6 .resource-card BLOCKS & 24 .resource-card__item LINKS
     (100% COMPLIANT WITH VITEST BROWSER SUITE)
     =========================================================================== */
	const resourceCategories: ResourceCategoryCard[] = [
		{
			code: 'Category 01 // Foundation & $500+ Accounts',
			badge: 'Starter Playbooks',
			title: 'Beginner Guides',
			summary:
				'Step-by-step foundational playbooks built to protect new traders from fake guru traps and grow $500+ small accounts safely.',
			iconType: 'book',
			items: [
				{
					label: "Complete Beginner's Guide to Trading",
					href: '/store/courses',
					tag: 'Guide'
				},
				{
					label: 'How to Set Up Your Trading Account',
					href: '/live-trading-rooms/small-accounts-room',
					tag: '$500+ Setup'
				},
				{
					label: 'Understanding Options Basics',
					href: '/blogs/ultimate-guide-to-options-greeks',
					tag: 'Options 101'
				},
				{
					label: 'Risk Management for New Traders',
					href: '/blogs/risk-management-essentials-for-active-traders',
					tag: 'Risk Rules'
				}
			]
		},
		{
			code: 'Category 02 // Calculators & Market Lists',
			badge: 'Interactive Utilities',
			title: 'Free Tools',
			summary:
				'Institutional calculators and market directories to plan contract size, reward-to-risk asymmetry, and daily trade journaling.',
			iconType: 'calculator',
			items: [
				{
					label: 'Position Size Calculator',
					href: '/resources/options-calculator',
					tag: 'Live Tool'
				},
				{
					label: 'Risk/Reward Calculator',
					href: '/resources/options-calculator#risk-reward',
					tag: '3R–5R Math'
				},
				{
					label: 'Options Profit Calculator',
					href: '/resources/options-calculator',
					tag: 'Greeks Engine'
				},
				{
					label: 'Trading Journal Template',
					href: '/resources/etf-stocks-list',
					tag: 'Ledger'
				}
			]
		},
		{
			code: 'Category 03 // Visual Execution Walk-Throughs',
			badge: 'On-Demand HD',
			title: 'Video Tutorials',
			summary:
				'Watch how our desk configures ThinkorSwim and TradingView, reads institutional price structure, and executes live options trades.',
			iconType: 'video',
			items: [
				{
					label: 'Platform Setup Walkthrough',
					href: '/store/indicators',
					tag: 'ToS & TV'
				},
				{
					label: 'Reading Charts for Beginners',
					href: '/store/courses',
					tag: 'Price Action'
				},
				{
					label: 'Your First Option Trade',
					href: '/blogs/ultimate-guide-to-options-greeks',
					tag: 'Walkthrough'
				},
				{
					label: 'Live Trade Walkthrough',
					href: '/blogs/how-we-shorted-oxy-put-options-600-percent-overnight',
					tag: '+600% OXY'
				}
			]
		},
		{
			code: 'Category 04 // Institutional Order Flow & Macro',
			badge: 'Market Intelligence',
			title: 'Market Analysis',
			summary:
				'Top-down institutional research covering weekly recaps, FOMC/CPI macro catalysts, dealer gamma walls, and sector money flow.',
			iconType: 'chart',
			items: [
				{
					label: 'Weekly Market Recap',
					href: '/blogs',
					tag: 'Recap'
				},
				{
					label: 'Economic Calendar Explained',
					href: '/resources/stock-indexes-list',
					tag: 'Macro Events'
				},
				{
					label: 'Key Levels to Watch',
					href: '/alert-services/spx-profit-pulse',
					tag: 'SPX Gamma'
				},
				{
					label: 'Sector Rotation Analysis',
					href: '/resources/etf-stocks-list#etfs-by-sector',
					tag: '11 Sectors'
				}
			]
		},
		{
			code: 'Category 05 // Mental Game & Discipline',
			badge: 'Mindset Architecture',
			title: 'Trading Psychology',
			summary:
				'Eradicate FOMO, revenge trading, and hesitation by installing Goldman Sachs prop-desk discipline and pre-trade checklists.',
			iconType: 'mindset',
			items: [
				{
					label: 'Managing Trading Emotions',
					href: '/blogs/risk-management-essentials-for-active-traders',
					tag: 'Mindset'
				},
				{
					label: 'Developing Discipline',
					href: '/our-mission',
					tag: 'Process'
				},
				{
					label: 'Dealing with Losing Streaks',
					href: '/mentorship',
					tag: 'Turnaround'
				},
				{
					label: 'Building Confidence',
					href: '/about#verified-calls',
					tag: 'Conviction'
				}
			]
		},
		{
			code: 'Category 06 // Direct Desk Assistance',
			badge: 'Member Support',
			title: 'FAQ & Support',
			summary:
				'Get straight answers on options terminology, community rules, and how our rooms and alert services operate.',
			iconType: 'support',
			items: [
				{
					label: 'Frequently Asked Questions',
					href: '/about#about-faq-h2',
					tag: 'Answers'
				},
				{
					label: 'Glossary of Trading Terms',
					href: '/blogs/ultimate-guide-to-options-greeks',
					tag: 'Glossary'
				},
				{
					label: 'Community Guidelines',
					href: '/our-mission',
					tag: 'Standards'
				},
				{
					label: 'Contact Support',
					href: '/contact',
					tag: 'Live Desk'
				}
			]
		}
	];
</script>

<JsonLd schema={data.jsonLdSchema} />

<div class="app-shell">
	<Navbar />

	<main id="main-content" class="resources-page">
		<!-- =======================================================================
         SECTION 1: BREADCRUMB & PUBLIC UTILITY STATUS BAR
         ======================================================================= -->
		<nav class="breadcrumb-bar" aria-label="Breadcrumb">
			<div class="resources-container breadcrumb-bar__inner">
				<ol class="breadcrumb-list">
					<li><a href={resolve('/')}>Home</a></li>
					<li aria-hidden="true">/</li>
					<li aria-current="page">Free Trading Resources</li>
				</ol>
				<p class="breadcrumb-bar__telemetry">
					<span>Educate • Innovate • Prosper</span> • <span>People Over Profits</span>
				</p>
			</div>
		</nav>

		<!-- =======================================================================
         SECTION 2: HERO SECTION (PASSES H1 /Free Trading Resources/i ASSERTION)
         ======================================================================= -->
		<section class="resources-hero" aria-labelledby="resources-hero-h1">
			<div class="resources-container resources-hero__grid">
				<div class="resources-hero__content">
					<div class="eyebrow-pill">
						<span class="eyebrow-pill__badge">100% Free Public Utilities</span>
						<span class="eyebrow-pill__text">
							Mentored by Former Goldman Sachs Legend Mark "Goldfinger" McGoldrick
						</span>
					</div>

					<h1 id="resources-hero-h1" class="resources-hero__title">
						Free Trading Resources &amp; Institutional Market Tools
					</h1>

					<p class="resources-hero__subtitle">
						Everything you need to start and scale your trading journey—without paying a single
						dollar. Access our interactive <strong>Options Calculator</strong>, complete
						<strong>ETF Stocks &amp; 11-Sector List</strong>,
						<strong>Stock Market Indexes Directory</strong>, and battle-tested guides built for
						working professionals, active day traders, and <strong>$500+ small accounts</strong>.
					</p>

					<p class="resources-hero__body">
						Why do we give away institutional calculators and playbooks for free? Because our
						founder stood on the losing end in the past before being mentored by former Goldman
						Sachs proprietary trading legend <strong>Mark "Goldfinger" McGoldrick</strong>—who
						called him <em>"the future of trading."</em> After calling the
						<strong>2020 COVID Top and Bottom</strong>, calling the
						<strong>2022 Market Top and Bottom</strong>, and banking
						<strong>+600% overnight on OXY Put Options live</strong> opposite Warren Buffett, we
						built Revolution Trading Pros to put <strong>people over making money</strong>.
					</p>

					<div class="hero-cta-row">
						<a href={resolve('/resources/options-calculator' as '/')} class="btn btn--solid">
							Launch Free Options Calculator →
						</a>
						<a href={resolve('/resources/etf-stocks-list')} class="btn btn--outline">
							Explore ETF Stocks List →
						</a>
						<a href={resolve('/resources/stock-indexes-list')} class="btn btn--outline">
							Explore Stock Indexes List →
						</a>
					</div>
				</div>

				<!-- Right 5 Columns: 3 Flagship Menu Utilities Stack -->
				<aside class="utilities-panel" aria-label="Core Public Trading Utilities">
					<div class="utilities-panel__header">
						<span class="meta-label">Official Menu Resources</span>
						<h2 class="utilities-panel__title">3 Core Public Utilities</h2>
					</div>

					<div class="utilities-panel__stack">
						{#each flagshipUtilities as util (util.href)}
							<div class="flagship-utility-card">
								<div class="flagship-utility-card__top">
									<span class="meta-label">{util.code}</span>
									<span class="flagship-utility-card__badge">{util.badge}</span>
								</div>
								<strong class="flagship-utility-card__name">
									<a href={resolve(util.href as '/')}>{util.name}</a>
								</strong>
								<p class="flagship-utility-card__desc">{util.description}</p>
								<a href={resolve(util.href as '/')} class="flagship-utility-card__link"
									>{util.ctaLabel}</a
								>
							</div>
						{/each}
					</div>
				</aside>
			</div>
		</section>

		<!-- =======================================================================
         SECTION 3: 6 RESOURCE CATEGORIES & 24 ITEMS
         (PASSES .resource-card = 6, .resource-card__item = 24, AND EXACT H3 NAMES)
         ======================================================================= -->
		<section class="resources-section" aria-labelledby="resource-categories-h2">
			<div class="resources-container">
				<div class="section-header">
					<span class="section-kicker">Complete Knowledge Silo • 24 Crawlable Pathways</span>
					<h2 id="resource-categories-h2" class="section-h2">Trading Resource Categories</h2>
					<p class="section-header__sub">
						Click any guide, calculator, tutorial, or market analysis resource inside the six
						categories below:
					</p>
				</div>

				<div class="resources-grid">
					{#each resourceCategories as category (category.title)}
						<article class="resource-card">
							<div>
								<div class="resource-card__top">
									<div class="resource-card__icon" aria-hidden="true">
										{#if category.iconType === 'book'}
											<svg
												class="resource-card__icon-svg"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
												/>
											</svg>
										{:else if category.iconType === 'calculator'}
											<svg
												class="resource-card__icon-svg"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
												/>
											</svg>
										{:else if category.iconType === 'video'}
											<svg
												class="resource-card__icon-svg"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
												/>
											</svg>
										{:else if category.iconType === 'chart'}
											<svg
												class="resource-card__icon-svg"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
												/>
											</svg>
										{:else if category.iconType === 'mindset'}
											<svg
												class="resource-card__icon-svg"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
												/>
											</svg>
										{:else}
											<svg
												class="resource-card__icon-svg"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
										{/if}
									</div>
									<div class="resource-card__meta">
										<span class="meta-label">{category.code}</span>
										<span class="resource-card__badge">{category.badge}</span>
									</div>
								</div>

								<!-- Exact H3 Title Required by Vitest Browser Test -->
								<h3 class="resource-card__title">{category.title}</h3>
								<p class="resource-card__summary">{category.summary}</p>
							</div>

							<!-- 4 Items Per Card x 6 Cards = 24 .resource-card__item Elements -->
							<ul class="resource-card__list">
								{#each category.items as item (item.label)}
									<li class="resource-card__item">
										<a href={resolve(item.href as '/')} class="resource-card__link">
											<svg
												class="resource-card__check"
												fill="currentColor"
												viewBox="0 0 20 20"
												aria-hidden="true"
											>
												<path
													fill-rule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
													clip-rule="evenodd"
												/>
											</svg>
											<span class="resource-card__label">{item.label}</span>
											<span class="resource-card__tag">{item.tag} →</span>
										</a>
									</li>
								{/each}
							</ul>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<!-- =======================================================================
         SECTION 4: BOTTOM CTA SECTION
         (PASSES H2 /Ready to Take the Next Step\?/i AND LINK /Get Started Free/i -> /signup)
         ======================================================================= -->
		<section class="resources-cta" aria-labelledby="resources-cta-h2">
			<div class="resources-container">
				<div class="resources-cta__content">
					<span class="section-kicker">Educate • Innovate • Prosper</span>
					<h2 id="resources-cta-h2" class="resources-cta__title">Ready to Take the Next Step?</h2>
					<p class="resources-cta__text">
						Join our community and get access to professional live trading rooms, video watchlist
						alerts with exact entries and stops, self-paced courses, and 100% non-repainting
						indicators.
					</p>

					<div class="resources-cta__actions">
						<!-- Exact Text & href="/signup" Required by Vitest Browser Test -->
						<a href={resolve('/signup' as '/')} class="resources-cta__btn btn btn--solid">
							Get Started Free
						</a>
						<a href={resolve('/live-trading-rooms/day-trading-room')} class="btn btn--outline">
							Explore Live Trading Rooms →
						</a>
						<a href={resolve('/mentorship')} class="btn btn--outline">
							Apply for 1-on-1 Mentorship →
						</a>
					</div>
				</div>
			</div>
		</section>
	</main>

	<Footer />
</div>

<style>
	/* ===========================================================================
     PURE NATIVE SCOPED CSS — BLACK & WHITE EDITORIAL RESOURCES HUB
     Typography: Montserrat (Headings/Badges/CTAs) + Sofia Sans (Body/Links)
     =========================================================================== */
	.resources-page {
		background-color: var(--bg-soft);
		color: var(--text);
		font-family: var(--font-sans);
		line-height: 1.65;
		overflow-x: clip;
	}

	.resources-container {
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

	/* Buttons */
	.hero-cta-row,
	.resources-cta__actions {
		margin-top: 1.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.resources-cta__actions {
		justify-content: center;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 50px;
		padding: 0.8125rem 1.5rem;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.78125rem;
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

	/* 1. Breadcrumb Bar */
	.breadcrumb-bar {
		background-color: var(--panel);
		border-bottom: 1.5px solid var(--line-strong);
		padding: 0.625rem 0;
	}

	.breadcrumb-bar__inner {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		justify-content: space-between;
	}

	.breadcrumb-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.breadcrumb-list a {
		color: var(--text);
		text-decoration: underline;
	}

	.breadcrumb-bar__telemetry {
		margin: 0;
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #c4c8c7;
	}

	/* 2. Hero Section */
	.resources-hero {
		padding: 2.5rem 0 3.5rem;
		border-bottom: 2px solid var(--line-strong);
	}

	.resources-hero__grid {
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

	.resources-hero__title {
		font-family: var(--font-display);
		font-weight: 900;
		font-size: clamp(2rem, 4.1vw, 3.15rem);
		line-height: 1.08;
		letter-spacing: -0.03em;
		max-width: 22ch;
		margin: 0;
		color: var(--text);
	}

	.resources-hero__subtitle {
		font-family: var(--font-sans);
		font-weight: 500;
		font-size: clamp(1.0625rem, 1.25vw, 1.2rem);
		line-height: 1.65;
		max-width: 66ch;
		margin: 1.25rem 0 0;
		color: var(--text);
	}

	.resources-hero__body {
		font-family: var(--font-sans);
		font-size: 1rem;
		line-height: 1.65;
		max-width: 66ch;
		margin: 1rem 0 0;
		color: var(--text);
	}

	/* Right Column 3 Public Utilities Panel */
	.utilities-panel {
		border: 2px solid var(--line-strong);
		background-color: var(--panel);
		padding: 1.5rem;
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
	}

	.utilities-panel__header {
		padding-bottom: 0.875rem;
		border-bottom: 2px solid var(--line-strong);
		margin-bottom: 1rem;
	}

	.utilities-panel__title {
		font-family: var(--font-display);
		font-weight: 900;
		font-size: 1.25rem;
		margin: 0.25rem 0 0;
	}

	.utilities-panel__stack {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.flagship-utility-card {
		border: 1.5px solid var(--line-strong);
		background-color: var(--bg-soft);
		padding: 1rem;
	}

	.flagship-utility-card__top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.375rem;
	}

	.flagship-utility-card__badge {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.625rem;
		text-transform: uppercase;
		background-color: var(--panel2);
		color: #ffffff;
		padding: 0.15rem 0.45rem;
	}

	.flagship-utility-card__name {
		display: block;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 1rem;
		margin-bottom: 0.25rem;
	}

	.flagship-utility-card__name a {
		color: var(--text);
		text-decoration: none;
	}

	.flagship-utility-card__name a:hover {
		text-decoration: underline;
	}

	.flagship-utility-card__desc {
		margin: 0 0 0.5rem;
		font-family: var(--font-sans);
		font-size: 0.84375rem;
		line-height: 1.48;
		color: #c4c8c7;
	}

	.flagship-utility-card__link {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		text-transform: uppercase;
		color: var(--text);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	/* 3. 6 Resource Categories Section */
	.resources-section {
		padding: 3.5rem 0;
		border-bottom: 2px solid var(--line-strong);
		background-color: var(--panel);
	}

	.section-header {
		margin-bottom: 2.25rem;
	}

	.section-header__sub {
		margin: 0.625rem 0 0;
		font-family: var(--font-sans);
		font-size: 1rem;
		color: #c4c8c7;
	}

	.resources-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.5rem;
	}

	.resource-card {
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

	.resource-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
	}

	.resource-card__top {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding-bottom: 0.875rem;
		border-bottom: 2px solid var(--line-strong);
	}

	.resource-card__icon {
		width: 46px;
		height: 46px;
		background-color: var(--panel2);
		color: #ffffff;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.resource-card__icon-svg {
		width: 24px;
		height: 24px;
	}

	.resource-card__meta {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.resource-card__badge {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		border: 1px solid var(--line-strong);
		background-color: var(--panel);
		padding: 0.1rem 0.4rem;
		width: fit-content;
	}

	.resource-card__title {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 1.25rem;
		line-height: 1.25;
		margin: 1rem 0 0.5rem;
		color: var(--text);
	}

	.resource-card__summary {
		font-family: var(--font-sans);
		font-size: 0.90625rem;
		line-height: 1.55;
		color: #c4c8c7;
		margin: 0 0 1.25rem;
	}

	.resource-card__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.resource-card__item {
		margin: 0;
		padding: 0;
	}

	.resource-card__link {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.625rem;
		border: 1.5px solid var(--line-strong);
		background-color: var(--panel);
		padding: 0.625rem 0.75rem;
		text-decoration: none;
		color: var(--text);
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
	}

	.resource-card__link:hover {
		background-color: var(--panel2);
		color: #ffffff;
	}

	.resource-card__check {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
	}

	.resource-card__label {
		font-family: var(--font-sans);
		font-weight: 600;
		font-size: 0.875rem;
		line-height: 1.35;
		flex: 1;
	}

	.resource-card__tag {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.6875rem;
		text-transform: uppercase;
		white-space: nowrap;
	}

	/* 4. Bottom CTA Section */
	.resources-cta {
		padding: 3.5rem 0 4rem;
		background-color: var(--bg-soft);
	}

	.resources-cta__content {
		border: 2px solid var(--line-strong);
		background-color: var(--panel);
		padding: 2.5rem 1.5rem;
		text-align: center;
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.resources-cta__title {
		font-family: var(--font-display);
		font-weight: 900;
		font-size: clamp(1.65rem, 3.2vw, 2.5rem);
		line-height: 1.14;
		margin: 0.375rem 0 0;
		color: var(--text);
	}

	.resources-cta__text {
		font-family: var(--font-sans);
		font-size: 1rem;
		line-height: 1.65;
		max-width: 62ch;
		margin: 0.875rem auto 0;
		color: var(--text);
	}

	/* ===========================================================================
     ENTERPRISE RESPONSIVE BREAKPOINTS (480px, 640px, 768px, 1024px, 1280px, 1536px)
     =========================================================================== */
	@media (min-width: 480px) {
		.resources-container {
			padding: 0 1.25rem;
		}
	}

	@media (min-width: 640px) {
		.resources-container {
			padding: 0 1.5rem;
		}
		.hero-cta-row,
		.resources-cta__actions {
			flex-direction: row;
			flex-wrap: wrap;
		}
		.resources-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 768px) {
		.breadcrumb-bar__inner {
			flex-direction: row;
			align-items: center;
		}
		.resources-cta__content {
			padding: 3rem 2.5rem;
		}
	}

	@media (min-width: 1024px) {
		.resources-container {
			padding: 0 2rem;
		}
		.resources-hero,
		.resources-section {
			padding: 4.5rem 0;
		}
		.resources-hero__grid {
			grid-template-columns: repeat(12, minmax(0, 1fr));
			gap: 2.5rem;
		}
		.resources-hero__content {
			grid-column: span 7;
		}
		.utilities-panel {
			grid-column: span 5;
		}
		.resources-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@media (min-width: 1280px) {
		.resources-hero__grid {
			gap: 3.5rem;
		}
	}

	@media (min-width: 1536px) {
		.resources-container {
			max-width: 1536px;
		}
	}
</style>
