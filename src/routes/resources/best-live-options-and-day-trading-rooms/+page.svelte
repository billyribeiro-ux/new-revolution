<!-- src/routes/resources/best-live-options-and-day-trading-rooms/+page.svelte -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import { BRAND } from '#lib/config/brand';
	import { TRADING_ROOMS_COMPARISON_2026 } from '#lib/data/comparison-guides.ts';
	import { BEST_TRADING_ROOMS_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import { scrollToSection } from '#lib/utils/scroll.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#best-trading-rooms-page">Skip to content</a>

<Navbar />

<main id="best-trading-rooms-page" class="inner-page best-trading-rooms-page">
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true" class="crumb-sep"><CaretRightIcon size={12} weight="bold" /></li>
				<li><a href={resolve('/resources')}>Free Trading Resources</a></li>
				<li aria-hidden="true" class="crumb-sep"><CaretRightIcon size={12} weight="bold" /></li>
				<li aria-current="page">Best Live Options &amp; Day Trading Rooms</li>
			</ol>
			<p class="breadcrumb-bar__telemetry">
				<span>2026 Criteria Matrix</span> · <span>7 Rooms Compared</span> ·
				<span>Publisher Editorial Disclosure Included</span>
			</p>
		</div>
	</nav>

	<section class="section hero-section" aria-labelledby="rooms-comp-h1">
		<div class="container hero-section__grid">
			<div class="hero-section__main">
				<div class="eyebrow-pill">
					<span class="eyebrow-pill__badge">2026 Buyer’s Matrix</span>
					<span class="eyebrow-pill__text">Indicator Dependency · Liquidity · Stop Governance</span>
				</div>

				<h1 id="rooms-comp-h1" class="hero-h1">
					<span class="hero-h1__seo-kicker seo-kicker">
						Best Live Options &amp; Day Trading Rooms (2026)
					</span>
					<span class="hero-h1__display">
						Pure Price Structure vs. Indicator-Heavy &amp; Low-Float Momentum Chatrooms.
					</span>
				</h1>

				<p class="lead-copy">
					Most traders choose a live trading room based on flashy P&amp;L clips — only to discover
					the moderator trades illiquid low-float penny stocks that spike 10% before members can get
					filled, or requires $1,000+ in proprietary indicator add-ons. Below is our objective 2026
					structural comparison across seven established U.S. trading rooms.
				</p>

				<div class="cta-row comp-cta-row">
					<button
						type="button"
						class="btn btn-primary"
						onclick={() => scrollToSection('seven-room-matrix')}
					>
						<span>Jump to 7-Room Matrix</span>
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</button>
					<a href={resolve('/live-trading-rooms')} class="btn btn-outline">
						Inspect Our 3 Schedule-Matched Rooms
					</a>
				</div>

				<p class="comp-byline">
					<strong>Publisher Disclosure:</strong> Published by
					<a href={resolve('/about')}>{BRAND.name}</a>
					({BRAND.founder.name}) · Updated <time datetime="2026-11-16">November 16, 2026</time>. We
					operate one of the platforms compared below; competitor attributes reflect publicly
					published curriculum, market focus, and pricing models as of Q4 2026.
				</p>
			</div>
		</div>
	</section>

	<section id="seven-room-matrix" class="section is-light" aria-labelledby="matrix-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">2026 Side-by-Side Evaluation</span>
				<h2 id="matrix-h2">
					7 Live Options &amp; Day Trading Rooms Compared by Structural Criteria
				</h2>
			</div>

			<div class="comp-table-wrap">
				<table class="comp-table">
					<thead>
						<tr>
							<th scope="col">Platform</th>
							<th scope="col">Chart Methodology</th>
							<th scope="col">Core Markets &amp; Slippage Profile</th>
							<th scope="col">Live Voice &amp; Screen</th>
							<th scope="col">$500+ Small-Account Track</th>
							<th scope="col">Stop-Out Protocol</th>
							<th scope="col">Pricing Structure</th>
						</tr>
					</thead>
					<tbody>
						{#each TRADING_ROOMS_COMPARISON_2026 as row, index (row.name)}
							<tr class={{ 'comp-table__self': index === 0 }}>
								<th scope="row">{row.name}</th>
								<td>{row.chartMethodology}</td>
								<td>{row.coreMarkets}</td>
								<td>{row.liveScreenShare}</td>
								<td>{row.smallAccountTrack}</td>
								<td>{row.stopOutTransparency}</td>
								<td>{row.pricingModel}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>

	<section class="section calls-section" aria-labelledby="criteria-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">5 Non-Negotiable Due-Diligence Checks</span>
				<h2 id="criteria-h2">How to Audit Any Live Trading Room Before Subscribing</h2>
			</div>

			<div class="comp-cards-grid">
				<article class="call-card">
					<span class="meta-label">CHECK 01 · CROWD SLIPPAGE</span>
					<h3 class="call-card__title">Deep SPX / QQQ Liquidity vs. Micro-Float Penny Stocks</h3>
					<p class="comp-card-copy">
						When 500 traders buy a 2-million-share float stock at once, followers absorb severe
						entry slippage. Cash-settled SPX/XSP options and SPY/QQQ ETFs trade billions in notional
						depth so room commentary does not distort the bid-ask spread.
					</p>
				</article>
				<article class="call-card">
					<span class="meta-label">CHECK 02 · CHART DEPENDENCY</span>
					<h3 class="call-card__title">Clean Candlesticks vs. $1,500 Proprietary Indicators</h3>
					<p class="comp-card-copy">
						Ask whether you can replicate every setup on a clean chart if you cancel software
						add-ons.
						<a href={resolve('/methodology')} class="comp-inline-link">{BRAND.methodology}</a> uses zero
						indicators from Monthly down to 1-Minute charts.
					</p>
				</article>
				<article class="call-card">
					<span class="meta-label">CHECK 03 · BINARY STOPS &amp; SMALL ACCOUNTS</span>
					<h3 class="call-card__title">Pre-Trade Invalidation &amp; FINRA Rule 4210 Sizing</h3>
					<p class="comp-card-copy">
						Verify that every setup declares its exact underlying invalidation print before entry
						and provides dedicated sizing rules for T+1 cash and FINRA Rule 4210(d)(2) intraday
						margin accounts.
					</p>
				</article>
			</div>
		</div>
	</section>

	<section class="section faq-section" aria-labelledby="rooms-comp-faq-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Trading Room Evaluation FAQ</span>
				<h2 id="rooms-comp-faq-h2">Questions About Choosing an Options or Day Trading Room</h2>
			</div>

			<div class="faq-list">
				{#each BEST_TRADING_ROOMS_FAQ_ITEMS as item, index (item.id)}
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

	<section class="section final-banner" aria-labelledby="rooms-comp-final-h2">
		<div class="container final-banner__inner">
			<span class="eyebrow">Match Your Schedule &amp; Capital Bracket</span>
			<h2 id="rooms-comp-final-h2" class="final-banner__h2">
				Compare Our Opening-Bell Day Room, 9-to-5 Swing Room, and $500+ Small Accounts Room.
			</h2>
			<div class="cta-row comp-cta-row">
				<a href={resolve('/live-trading-rooms')} class="btn btn-dark">
					<span>Compare Our 3 Live Rooms</span>
					<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
				</a>
				<a
					href={resolve('/resources/best-spx-0dte-and-options-alert-services')}
					class="btn btn-outline-dark"
				>
					Compare SPX &amp; Options Alert Services
				</a>
			</div>
		</div>
	</section>
</main>

<Footer />

<style>
	.comp-cta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.comp-cta-row :global(.btn) {
		inline-size: auto;
	}

	.comp-byline {
		margin-block: 1.5rem 0;
		padding-block-start: 1rem;
		border-block-start: 1px solid var(--line);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		line-height: 1.65;
		color: var(--muted);
		max-inline-size: 74ch;
	}

	.comp-byline a,
	.comp-byline strong,
	.comp-byline time {
		color: var(--text);
		font-weight: var(--weight-semibold);
	}

	.comp-table-wrap {
		overflow-x: auto;
		border: 1px solid var(--card-light-border);
		background: var(--card-white);
	}

	.comp-table {
		inline-size: 100%;
		border-collapse: collapse;
		text-align: start;
	}

	.comp-table th,
	.comp-table td {
		padding: 0.9rem 1rem;
		border-block-end: 1px solid var(--card-light-border);
		font-size: var(--step-sm);
		line-height: 1.55;
		color: #2f363d;
		vertical-align: top;
	}

	.comp-table thead th {
		background: var(--ink);
		color: #ffffff;
		font-family: var(--font-display);
		font-weight: var(--weight-bold);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.comp-table tbody th {
		font-family: var(--font-display);
		font-weight: var(--weight-bold);
		color: var(--ink);
		min-inline-size: 10rem;
	}

	.comp-table__self {
		background: rgba(75, 95, 29, 0.07);
	}

	.comp-cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
		gap: 1.25rem;
	}

	.comp-card-copy {
		margin: 0;
		font-size: var(--step-body-sm);
		line-height: 1.65;
		color: var(--text-secondary);
	}

	.comp-inline-link {
		color: var(--acid);
		text-decoration: underline;
	}
</style>
