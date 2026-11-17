<!-- src/routes/resources/finra-intraday-margin-rule-2026/+page.svelte -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import IntradayMarginCalculator from '#lib/components/tools/IntradayMarginCalculator.svelte';
	import { BRAND } from '#lib/config/brand';
	import {
		BROKER_TRANSITION_STEPS,
		FINRA_4210_COMPARISON_ROWS
	} from '#lib/data/finra-intraday-margin-guide.ts';
	import { FINRA_INTRADAY_MARGIN_GUIDE_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import { scrollToSection } from '#lib/utils/scroll.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#finra-margin-guide-page">Skip to content</a>

<Navbar />

<main id="finra-margin-guide-page" class="inner-page finra-margin-guide-page">
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true" class="crumb-sep"><CaretRightIcon size={12} weight="bold" /></li>
				<li><a href={resolve('/resources')}>Free Trading Resources</a></li>
				<li aria-hidden="true" class="crumb-sep"><CaretRightIcon size={12} weight="bold" /></li>
				<li aria-current="page">FINRA Rule 4210 Margin Guide</li>
			</ol>
			<p class="breadcrumb-bar__telemetry">
				<span>FINRA Notice 26-10</span> · <span>Effective June 4, 2026</span> ·
				<span>Rollout Through Oct 20, 2027</span>
			</p>
		</div>
	</nav>

	<!-- SECTION 1: HERO + 68-WORD AIO EXECUTIVE SUMMARY -->
	<section class="section hero-section" aria-labelledby="finra-guide-h1">
		<div class="container hero-section__grid">
			<div class="hero-section__main">
				<div class="eyebrow-pill">
					<span class="eyebrow-pill__badge">Regulatory Playbook · 2026–2027</span>
					<span class="eyebrow-pill__text">FINRA Notice 26-10 · Amended Rule 4210(d)(2)</span>
				</div>

				<hgroup>
					<p class="hero-h1__seo-kicker seo-kicker">FINRA Intraday Margin Rule (2026)</p>
					<h1 id="finra-guide-h1" class="hero-h1">
						<span class="hero-h1__display">
							How Amended Rule 4210(d)(2) Replaces the $25,000 PDT Rule for Options &amp; Equity
							Traders.
						</span>
					</h1>
				</hgroup>

				<p class="lead-copy">
					<strong>68-Word Regulatory Summary:</strong> Through FINRA Regulatory Notice 26-10
					(effective June 4, 2026, with an 18-month broker implementation window through October 20,
					2027), SEC-approved amendments to FINRA Rule 4210(d)(2) eliminate the 2001-era 4-trade
					Pattern Day Trader (PDT) counter and $25,000 minimum equity lock. Margin accounts meeting
					the $2,000 baseline are instead governed by real-time
					<strong>Intraday Margin Level (IML)</strong> exposure and a De Minimis buffer of the lesser
					of 5% of equity or $1,000.
				</p>

				<div class="cta-row guide-cta-row">
					<button
						type="button"
						class="btn btn-primary"
						onclick={() => scrollToSection('embedded-iml-calculator')}
					>
						<span>Run Your Live IML Numbers</span>
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</button>
					<button
						type="button"
						class="btn btn-outline"
						onclick={() => scrollToSection('pdt-vs-4210-table')}
					>
						Legacy PDT vs. Rule 4210 Table
					</button>
				</div>

				<p class="guide-byline">
					Authored by <a href={resolve('/about')}>{BRAND.founder.name}</a> · Updated
					<time datetime="2026-11-16">November 16, 2026</time> · Primary source: FINRA Regulatory Notice
					26-10; educational summary, not broker or legal advice.
				</p>
			</div>
		</div>
	</section>

	<!-- SECTION 2: LEGACY PDT VS AMENDED RULE 4210(d)(2) TABLE (LIGHT SURFACE) -->
	<section id="pdt-vs-4210-table" class="section is-light" aria-labelledby="table-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Side-by-Side Statutory Comparison</span>
				<h2 id="table-h2">2001 Legacy PDT Rule vs. 2026 Amended FINRA Rule 4210(d)(2)</h2>
			</div>

			<div class="guide-table-wrap">
				<table class="guide-table">
					<thead>
						<tr>
							<th scope="col">Regulatory Dimension</th>
							<th scope="col">Legacy 2001 PDT Rule</th>
							<th scope="col">Amended Rule 4210(d)(2) (2026–2027)</th>
						</tr>
					</thead>
					<tbody>
						{#each FINRA_4210_COMPARISON_ROWS as row (row.dimension)}
							<tr>
								<th scope="row">{row.dimension}</th>
								<td>{row.legacyPdtRule}</td>
								<td class="guide-table__highlight">{row.amendedRule4210}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>

	<!-- SECTION 3: 18-MONTH BROKER IMPLEMENTATION TIMELINE -->
	<section class="section calls-section" aria-labelledby="timeline-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Broker Cutover Calendar · April 2026 → October 20, 2027</span>
				<h2 id="timeline-h2">Why Your Broker’s Rollout Date Matters Right Now</h2>
				<p class="body-copy section-header__sub">
					Clearing brokers must rebuild real-time intraday option and equity risk engines before
					switching customer accounts off the legacy 3-day-trade counter. Verify where your carrying
					firm sits on the 18-month rollout schedule below.
				</p>
			</div>

			<div class="timeline-grid">
				{#each BROKER_TRANSITION_STEPS as step (step.dateLabel)}
					<article class="call-card">
						<span class="meta-label">{step.dateLabel}</span>
						<h3 class="call-card__title">{step.title}</h3>
						<p class="timeline-copy">{step.detail}</p>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- SECTION 4: EMBEDDED LIVE IML CALCULATOR -->
	<section
		id="embedded-iml-calculator"
		class="section protection-section"
		aria-labelledby="embed-calc-h2"
	>
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Interactive Verification · Test Your Account Equity</span>
				<h2 id="embed-calc-h2">
					Simulate Your Intraday Margin Level (IML) &amp; Safe Contract Size
				</h2>
			</div>

			<IntradayMarginCalculator
				headingLevel="h3"
				canonicalPath="/resources/intraday-margin-calculator"
			/>
		</div>
	</section>

	<!-- SECTION 5: FAQ + FINAL CTA -->
	<section class="section faq-section" aria-labelledby="finra-faq-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">FINRA Notice 26-10 FAQ</span>
				<h2 id="finra-faq-h2">
					Common Questions About Rule 4210(d)(2), 0DTE Options &amp; T+1 Cash
				</h2>
			</div>

			<div class="faq-list">
				{#each FINRA_INTRADAY_MARGIN_GUIDE_FAQ_ITEMS as item, index (item.id)}
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

	<section class="section final-banner" aria-labelledby="finra-final-h2">
		<div class="container final-banner__inner">
			<span class="eyebrow">Removing PDT Doesn’t Remove Market Risk</span>
			<h2 id="finra-final-h2" class="final-banner__h2">
				Pair Post-PDT Freedom With Binary Price-Action Stops Inside Our Small Accounts Room.
			</h2>
			<div class="cta-row guide-cta-row">
				<a href={resolve('/live-trading-rooms/small-accounts-room')} class="btn btn-dark">
					<span>Explore Small Accounts Room ($500+)</span>
					<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
				</a>
				<a href={resolve('/methodology')} class="btn btn-outline-dark">
					Read {BRAND.methodology}
				</a>
				<a href={resolve('/resources/options-calculator')} class="btn btn-outline-dark">
					Options Profit &amp; Greeks Tool
				</a>
			</div>
		</div>
	</section>
</main>

<Footer />

<style>
	.guide-cta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.guide-cta-row :global(.btn) {
		inline-size: auto;
	}

	.guide-byline {
		margin-block: 1.5rem 0;
		padding-block-start: 1rem;
		border-block-start: 1px solid var(--line);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		line-height: 1.65;
		color: var(--muted);
		max-inline-size: 68ch;
	}

	.guide-byline a,
	.guide-byline time {
		color: var(--text);
		font-weight: var(--weight-semibold);
	}

	.guide-table-wrap {
		overflow-x: auto;
		border: 1px solid var(--card-light-border);
		background: var(--card-white);
	}

	.guide-table {
		inline-size: 100%;
		border-collapse: collapse;
		text-align: start;
	}

	.guide-table th,
	.guide-table td {
		padding: 1rem 1.15rem;
		border-block-end: 1px solid var(--card-light-border);
		font-size: var(--step-body-sm);
		line-height: 1.6;
		color: #2f363d;
		vertical-align: top;
	}

	.guide-table thead th {
		background: var(--ink);
		color: #ffffff;
		font-family: var(--font-display);
		font-weight: var(--weight-bold);
		font-size: var(--step-sm);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.guide-table tbody th {
		font-family: var(--font-display);
		font-weight: var(--weight-bold);
		color: var(--ink);
	}

	.guide-table__highlight {
		background: rgba(75, 95, 29, 0.06);
		color: var(--ink);
		font-weight: var(--weight-medium);
	}

	.timeline-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
		gap: 1.25rem;
	}

	.timeline-copy {
		margin: 0;
		font-size: var(--step-body-sm);
		line-height: 1.65;
		color: var(--text-secondary);
	}
</style>
