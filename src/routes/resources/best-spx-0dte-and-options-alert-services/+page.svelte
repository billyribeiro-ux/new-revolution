<!-- src/routes/resources/best-spx-0dte-and-options-alert-services/+page.svelte -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import { BRAND } from '#lib/config/brand';
	import { ALERT_SERVICES_COMPARISON_2026 } from '#lib/data/comparison-guides.ts';
	import { BEST_OPTIONS_ALERTS_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import { scrollToSection } from '#lib/utils/scroll.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#best-options-alerts-page">Skip to content</a>

<Navbar />

<main id="best-options-alerts-page" class="inner-page best-options-alerts-page">
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true" class="crumb-sep"><CaretRightIcon size={12} weight="bold" /></li>
				<li><a href={resolve('/resources')}>Free Trading Resources</a></li>
				<li aria-hidden="true" class="crumb-sep"><CaretRightIcon size={12} weight="bold" /></li>
				<li aria-current="page">Best SPX 0DTE &amp; Options Alert Services</li>
			</ol>
			<p class="breadcrumb-bar__telemetry">
				<span>2026 Criteria Matrix</span> · <span>6 Alert Services Evaluated</span> ·
				<span>Section 1256 &amp; Binary Stops</span>
			</p>
		</div>
	</nav>

	<section class="section hero-section" aria-labelledby="alerts-comp-h1">
		<div class="container hero-section__grid">
			<div class="hero-section__main">
				<div class="eyebrow-pill">
					<span class="eyebrow-pill__badge">2026 Alert Buyer’s Guide</span>
					<span class="eyebrow-pill__text">5-Point Blueprints vs. Raw SMS/Discord Pings</span>
				</div>

				<h1 id="alerts-comp-h1" class="hero-h1">
					<span class="hero-h1__seo-kicker seo-kicker">
						Best SPX 0DTE &amp; Options Alert Services (2026)
					</span>
					<span class="hero-h1__display">
						Why Pre-Trade Structural Blueprints Beat Blind “Buy Now” Signal Chats.
					</span>
				</h1>

				<p class="lead-copy">
					On fast-moving SPX 0DTE and weekly options, a raw “BTO Strike @ $3.20” ping with zero
					underlying chart context forces subscribers to chase gamma after the move has already
					started. Compare six options alert architectures across pre-trade thesis depth, indicator
					dependency, cash-settled index mechanics, and hard stop-loss transparency.
				</p>

				<div class="cta-row comp-cta-row">
					<button
						type="button"
						class="btn btn-primary"
						onclick={() => scrollToSection('six-alerts-matrix')}
					>
						<span>Jump to 6-Service Matrix</span>
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</button>
					<a href={resolve('/alert-services')} class="btn btn-outline">
						Inspect SPX Profit Pulse &amp; Sunday Alpha
					</a>
				</div>

				<p class="comp-byline">
					<strong>Publisher Disclosure:</strong> Published by
					<a href={resolve('/about')}>{BRAND.name}</a>
					({BRAND.founder.name}) · Updated <time datetime="2026-11-16">November 16, 2026</time>. We
					publish SPX Profit Pulse and Sunday Alpha Protocol; third-party entries summarize publicly
					stated alert formats, instruments, and methodologies as of Q4 2026.
				</p>
			</div>
		</div>
	</section>

	<section id="six-alerts-matrix" class="section is-light" aria-labelledby="alerts-matrix-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">2026 Side-by-Side Evaluation</span>
				<h2 id="alerts-matrix-h2">6 SPX 0DTE &amp; Options Swing Alert Services Compared</h2>
			</div>

			<div class="comp-table-wrap">
				<table class="comp-table">
					<thead>
						<tr>
							<th scope="col">Service</th>
							<th scope="col">Focus Instruments</th>
							<th scope="col">Pre-Trade Thesis Depth</th>
							<th scope="col">Indicator Dependency</th>
							<th scope="col">Stop-Loss Protocol</th>
							<th scope="col">Cadence &amp; Format</th>
						</tr>
					</thead>
					<tbody>
						{#each ALERT_SERVICES_COMPARISON_2026 as row, index (row.name)}
							<tr class={{ 'comp-table__self': index === 0 }}>
								<th scope="row">{row.name}</th>
								<td>{row.focusInstruments}</td>
								<td>{row.preTradeThesisDepth}</td>
								<td>{row.indicatorDependency}</td>
								<td>{row.stopLossProtocol}</td>
								<td>{row.cadenceAndFormat}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>

	<section class="section calls-section" aria-labelledby="alert-standards-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Execution Reality · Protecting Options Capital</span>
				<h2 id="alert-standards-h2">Three Structural Tests Before Following Any Options Alert</h2>
			</div>

			<div class="comp-cards-grid">
				<article class="call-card">
					<span class="meta-label">TEST 01 · PRE-TRADE ZONE</span>
					<h3 class="call-card__title">Is the Inflection Level Mapped Before Price Arrives?</h3>
					<p class="comp-card-copy">
						Pre-market SPX and Sunday swing blueprints let you stage conditional alerts calm and
						unrushed instead of market-buying after a 30% candle spike.
					</p>
				</article>
				<article class="call-card">
					<span class="meta-label">TEST 02 · CASH SETTLEMENT</span>
					<h3 class="call-card__title">SPX &amp; Mini-XSP vs. Single-Stock Pin Risk</h3>
					<p class="comp-card-copy">
						European-style cash-settled SPX and mini-XSP contracts eliminate early share assignment
						and overnight dividend/pin surprises while qualifying eligible U.S. traders for Section
						1256 tax treatment.
					</p>
				</article>
				<article class="call-card">
					<span class="meta-label">TEST 03 · BINARY INVALIDATION</span>
					<h3 class="call-card__title">Never Subscribe to “Averaging Down” Into 0DTE Losers</h3>
					<p class="comp-card-copy">
						Adding to an invalidated 0DTE contract compounds theta decay exponentially. Verify that
						every alert carries one exact underlying stop print and test sizing first in our
						<a href={resolve('/resources/options-calculator')} class="comp-inline-link"
							>Options Greeks Calculator</a
						>.
					</p>
				</article>
			</div>
		</div>
	</section>

	<section class="section faq-section" aria-labelledby="alerts-comp-faq-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Options Alert Evaluation FAQ</span>
				<h2 id="alerts-comp-faq-h2">Questions About Comparing SPX &amp; Options Alert Services</h2>
			</div>

			<div class="faq-list">
				{#each BEST_OPTIONS_ALERTS_FAQ_ITEMS as item, index (item.id)}
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

	<section class="section final-banner" aria-labelledby="alerts-comp-final-h2">
		<div class="container final-banner__inner">
			<span class="eyebrow">Explore Our 5-Point Structural Blueprints</span>
			<h2 id="alerts-comp-final-h2" class="final-banner__h2">
				Compare SPX Profit Pulse (Intraday Index) &amp; Sunday Alpha Protocol (9-to-5 Swings).
			</h2>
			<div class="cta-row comp-cta-row">
				<a href={resolve('/alert-services/spx-profit-pulse')} class="btn btn-dark">
					<span>SPX Profit Pulse</span>
					<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
				</a>
				<a href={resolve('/alert-services/sunday-alpha-protocol')} class="btn btn-outline-dark">
					Sunday Alpha Protocol
				</a>
				<a
					href={resolve('/resources/best-live-options-and-day-trading-rooms')}
					class="btn btn-outline-dark"
				>
					Compare Live Trading Rooms
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
		min-inline-size: 11rem;
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
