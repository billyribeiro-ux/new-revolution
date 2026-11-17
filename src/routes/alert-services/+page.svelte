<!-- src/routes/alert-services/+page.svelte -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import { BRAND } from '#lib/config/brand';
	import {
		ALERT_BLUEPRINT_ANATOMY,
		ALERT_SERVICE_CARDS,
		ALERTS_VS_ROOMS_ROWS
	} from '#lib/data/alert-services-hub.ts';
	import { ALERT_SERVICES_HUB_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import { CONCEPT_PREVIEW } from '#lib/shared/development-status.ts';
	import { scrollToSection } from '#lib/utils/scroll.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#alert-services-page">Skip to content</a>

<Navbar />

<main id="alert-services-page" class="inner-page alert-services-hub-page">
	{#if CONCEPT_PREVIEW}
		<aside class="disclaimer-strip" aria-label="Proposed product and demonstration notice">
			<p>
				<strong>Proposed concept, not an available service.</strong> Educational watchlist designs only;
				no paid subscriptions or personalized advisory services are offered.
			</p>
		</aside>
	{/if}

	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true" class="crumb-sep"><CaretRightIcon size={12} weight="bold" /></li>
				<li aria-current="page">Alert Services</li>
			</ol>
			<p class="breadcrumb-bar__telemetry">
				<span>2 Standalone Blueprints</span> · <span>SPX 0DTE &amp; Multi-Day Swings</span> ·
				<span>Binary Stops</span>
			</p>
		</div>
	</nav>

	<!-- SECTION 1: HERO -->
	<section class="section hero-section" aria-labelledby="alerts-hub-h1">
		<div class="container hero-section__grid">
			<div class="hero-section__main">
				<div class="eyebrow-pill">
					<span class="eyebrow-pill__badge">Alert Blueprints</span>
					<span class="eyebrow-pill__text">5-Point Pre-Trade Structure · Zero Blind Pings</span>
				</div>

				<hgroup>
					<p class="hero-h1__seo-kicker seo-kicker">
						Price-Action Options &amp; SPX Alert Services
					</p>
					<h1 id="alerts-hub-h1" class="hero-h1">
						<span class="hero-h1__display">
							Prepared Structural Blueprints for Self-Directed SPX &amp; Swing Traders.
						</span>
					</h1>
				</hgroup>

				<p class="lead-copy">
					Raw “Buy Strike X Now” chat pings fail working traders because option gamma reprices
					before you unlock your phone. Powered by <strong>{BRAND.methodology}</strong>, our two
					standalone alert services deliver pre-mapped higher-timeframe inflection zones,
					conditional entry triggers, engineered contract structures, tiered targets, and binary
					invalidation stops.
				</p>

				<div class="cta-row hub-cta-row">
					<button
						type="button"
						class="btn btn-primary"
						onclick={() => scrollToSection('compare-alert-services')}
					>
						<span>Compare Both Alert Services</span>
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</button>
					<button
						type="button"
						class="btn btn-outline"
						onclick={() => scrollToSection('five-point-anatomy')}
					>
						See 5-Point Blueprint Standard
					</button>
				</div>

				<p class="hub-byline">
					Reviewed by <a href={resolve('/about')}>{BRAND.founder.name}</a> · Updated
					<time datetime="2026-11-16">November 16, 2026</time> · Educational trade scenarios only; short-dated
					and multi-day options carry substantial risk of loss.
				</p>
			</div>
		</div>
	</section>

	<!-- SECTION 2: TWO FLAGSHIP ALERT SERVICES (LIGHT SURFACE) -->
	<section id="compare-alert-services" class="section is-light" aria-labelledby="two-services-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Select Your Cadence · Intraday SPX vs. Weekly 9-to-5 Swings</span>
				<h2 id="two-services-h2">Two Standalone Price-Action Blueprint Memberships</h2>
			</div>

			<div class="alerts-cards-grid">
				{#each ALERT_SERVICE_CARDS as card (card.id)}
					<article class="crisis-card alert-hub-card">
						<div class="crisis-card__header">
							<span class="meta-label">{card.badge}</span>
						</div>
						<h3 class="crisis-card__title">{card.name}</h3>
						<p class="alert-hub-card__cadence">{card.cadence}</p>
						<p class="crisis-card__body">{card.summary}</p>

						<dl class="alert-hub-card__specs">
							<div>
								<dt>Ideal Trader Fit</dt>
								<dd>{card.bestFor}</dd>
							</div>
							<div>
								<dt>Core Instruments</dt>
								<dd>{card.instruments}</dd>
							</div>
						</dl>

						<ul class="alert-hub-card__list">
							{#each card.deliverables as line (line)}
								<li>
									<CheckIcon size={16} weight="bold" aria-hidden="true" />
									<span>{line}</span>
								</li>
							{/each}
						</ul>

						<div class="alert-hub-card__cta">
							<a href={resolve(card.href)} class="btn btn-dark">
								<span>{card.ctaLabel}</span>
								<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
							</a>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- SECTION 3: 5-POINT PRE-TRADE BLUEPRINT ANATOMY -->
	<section id="five-point-anatomy" class="section calls-section" aria-labelledby="anatomy-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Execution Governance · Every Dispatch Follows One Standard</span>
				<h2 id="anatomy-h2">Inside Our 5-Point Pre-Trade Structural Blueprint</h2>
				<p class="body-copy section-header__sub">
					Whether we are mapping an intraday cash-settled SPX setup or a 3-week sector ETF swing,
					every scenario published across our desk includes all five structural elements before
					activation.
				</p>
			</div>

			<div class="anatomy-grid">
				{#each ALERT_BLUEPRINT_ANATOMY as item (item.step)}
					<article class="call-card">
						<span class="meta-label">POINT {item.step}</span>
						<h3 class="call-card__title">{item.title}</h3>
						<p class="anatomy-copy">{item.detail}</p>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- SECTION 4: STANDALONE ALERTS VS LIVE TRADING ROOMS (LIGHT SURFACE) -->
	<section class="section is-light" aria-labelledby="vs-rooms-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Format Comparison · Blueprints vs. Live Voice Floor</span>
				<h2 id="vs-rooms-h2">Standalone Alert Services vs. Live Trading Rooms</h2>
			</div>

			<div class="hub-table-wrap">
				<table class="hub-table">
					<thead>
						<tr>
							<th scope="col">Workflow Criterion</th>
							<th scope="col">Standalone Alert Blueprints</th>
							<th scope="col">Live Trading Rooms</th>
						</tr>
					</thead>
					<tbody>
						{#each ALERTS_VS_ROOMS_ROWS as row (row.criterion)}
							<tr>
								<th scope="row">{row.criterion}</th>
								<td>{row.standaloneAlerts}</td>
								<td>{row.liveTradingRooms}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>

	<!-- SECTION 5: FAQ + FINAL CTA -->
	<section class="section faq-section" aria-labelledby="alerts-faq-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Alert Services FAQ · Cadence, Sizing &amp; Section 1256</span>
				<h2 id="alerts-faq-h2">Questions About SPX Profit Pulse &amp; Sunday Alpha Protocol</h2>
			</div>

			<div class="faq-list">
				{#each ALERT_SERVICES_HUB_FAQ_ITEMS as item, index (item.id)}
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

	<section class="section final-banner" aria-labelledby="alerts-final-h2">
		<div class="container final-banner__inner">
			<span class="eyebrow">Inspect Each Blueprint Service in Detail</span>
			<h2 id="alerts-final-h2" class="final-banner__h2">
				Choose Intraday Cash-Settled SPX or Weekly 9-to-5 Swing Preparation.
			</h2>
			<p class="body-copy final-banner__copy">
				Review full dispatch schedules, sample 5-point structural blueprints, or model contract
				payoffs free in our Black-Scholes Options Calculator.
			</p>
			<div class="cta-row hub-cta-row">
				<a href={resolve('/alert-services/spx-profit-pulse')} class="btn btn-dark">
					<span>SPX Profit Pulse</span>
					<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
				</a>
				<a href={resolve('/alert-services/sunday-alpha-protocol')} class="btn btn-outline-dark">
					Sunday Alpha Protocol
				</a>
				<a href={resolve('/resources/options-calculator')} class="btn btn-outline-dark">
					Free Options Greeks Calculator
				</a>
			</div>
		</div>
	</section>
</main>

<Footer />

<style>
	.hub-cta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.hub-cta-row :global(.btn) {
		inline-size: auto;
	}

	.hub-byline {
		margin-block: 1.5rem 0;
		padding-block-start: 1rem;
		border-block-start: 1px solid var(--line);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		line-height: 1.65;
		color: var(--muted);
		max-inline-size: 68ch;
	}

	.hub-byline a,
	.hub-byline time {
		color: var(--text);
		font-weight: var(--weight-semibold);
	}

	.alerts-cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
		gap: 1.5rem;
	}

	.alert-hub-card__cadence {
		margin: 0 0 0.85rem;
		font-family: var(--font-mono);
		font-weight: var(--weight-semibold);
		font-size: 0.75rem;
		line-height: 1.5;
		color: #4b5f1d;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.alert-hub-card__specs {
		margin: 0 0 1.15rem;
		display: grid;
		gap: 0.75rem;
		padding-block: 0.85rem;
		border-block: 1px solid var(--card-light-border);
	}

	.alert-hub-card__specs dt {
		font-family: var(--font-display);
		font-weight: var(--weight-bold);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #4b5f1d;
	}

	.alert-hub-card__specs dd {
		margin: 0.25rem 0 0;
		font-size: var(--step-body-sm);
		line-height: 1.6;
		color: var(--ink);
	}

	.alert-hub-card__list {
		list-style: none;
		margin: 0 0 1.5rem;
		padding: 0;
		display: grid;
		gap: 0.6rem;
	}

	.alert-hub-card__list li {
		display: flex;
		align-items: flex-start;
		gap: 0.55rem;
		font-size: var(--step-body-sm);
		line-height: 1.55;
		color: #2f363d;
	}

	.alert-hub-card__list li :global(svg) {
		flex-shrink: 0;
		margin-block-start: 0.2rem;
		color: #4b5f1d;
	}

	.alert-hub-card__cta {
		margin-block-start: auto;
	}

	.anatomy-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
		gap: 1rem;
	}

	.anatomy-copy {
		margin: 0;
		font-size: var(--step-body-sm);
		line-height: 1.65;
		color: var(--text-secondary);
	}

	.hub-table-wrap {
		overflow-x: auto;
		border: 1px solid var(--card-light-border);
		background: var(--card-white);
	}

	.hub-table {
		inline-size: 100%;
		border-collapse: collapse;
		text-align: start;
	}

	.hub-table th,
	.hub-table td {
		padding: 1rem 1.15rem;
		border-block-end: 1px solid var(--card-light-border);
		font-size: var(--step-body-sm);
		line-height: 1.6;
		color: #2f363d;
		vertical-align: top;
	}

	.hub-table thead th {
		background: var(--ink);
		color: #ffffff;
		font-family: var(--font-display);
		font-weight: var(--weight-bold);
		font-size: var(--step-sm);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.hub-table tbody th {
		font-family: var(--font-display);
		font-weight: var(--weight-bold);
		color: var(--ink);
	}
</style>
