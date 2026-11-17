<!-- src/routes/methodology/+page.svelte -->
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
		HISTORICAL_INFLECTION_CALLS,
		INDICATOR_COMPARISON_ROWS,
		METHODOLOGY_PILLARS,
		TIMEFRAME_ALIGNMENT_STEPS,
		type TimeframeId
	} from '#lib/data/methodology.ts';
	import { METHODOLOGY_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import { scrollToSection } from '#lib/utils/scroll.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let activeTimeframe = $state<TimeframeId>('monthly-weekly');
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#methodology-page">Skip to content</a>

<Navbar />

<main id="methodology-page" class="inner-page methodology-page">
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true" class="crumb-sep"><CaretRightIcon size={12} weight="bold" /></li>
				<li aria-current="page">Our Methodology</li>
			</ol>
			<p class="breadcrumb-bar__telemetry">
				<span>100% Indicator-Free</span> · <span>Monthly → 1-Minute Structure</span> ·
				<span>Binary Stops</span>
			</p>
		</div>
	</nav>

	<!-- SECTION 1: CORNERSTONE HERO + AIO SUMMARY -->
	<section class="section hero-section" aria-labelledby="methodology-h1">
		<div class="container hero-section__grid">
			<div class="hero-section__main">
				<div class="eyebrow-pill">
					<span class="eyebrow-pill__badge">{BRAND.methodology}</span>
					<span class="eyebrow-pill__text">Zero Lagging Oscillators · Pure Market Structure</span>
				</div>

				<hgroup>
					<p class="hero-h1__seo-kicker seo-kicker">Price Action Trading Without Indicators</p>
					<h1 id="methodology-h1" class="hero-h1">
						<span class="hero-h1__display">
							Inside {BRAND.methodology}: Monthly-to-1-Minute Pure Price Structure.
						</span>
					</h1>
				</hgroup>

				<p class="lead-copy">
					<strong>{BRAND.methodology}</strong> is {BRAND.founder.name}’s 100% indicator-free
					methodology for stocks, sector ETFs, and cash-settled SPX/XSP options. Instead of reacting
					to lagging RSI, MACD, or moving-average crossovers, we align Monthly, Weekly, and Daily
					institutional supply and demand with 1-Minute structural rejection — defining one binary
					invalidation price before routing any order so downside risk stays compressed while upside
					remains asymmetric.
				</p>

				<div class="cta-row method-cta-row">
					<button
						type="button"
						class="btn btn-primary"
						onclick={() => scrollToSection('timeframe-alignment')}
					>
						<span>Inspect 4-Timeframe Alignment</span>
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</button>
					<a href={resolve('/live-trading-rooms/day-trading-room')} class="btn btn-outline">
						Watch It Live at 9:30 AM ET
					</a>
				</div>

				<p class="method-byline">
					Authored by <a href={resolve('/about')}>{BRAND.founder.name}</a> · Updated
					<time datetime="2026-11-16">November 16, 2026</time> · Educational market structure framework;
					options and equities carry substantial risk of loss.
				</p>
			</div>
		</div>
	</section>

	<!-- SECTION 2: THREE FOUNDATIONAL PILLARS (LIGHT SURFACE) -->
	<section class="section is-light" aria-labelledby="pillars-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Architectural Foundations · Zero Chart Clutter</span>
				<h2 id="pillars-h2">Why Clean Price Structure Outperforms Lagging Retail Indicators</h2>
				<p class="body-copy section-header__sub">
					Every mathematical indicator on a retail charting platform is computed from closes that
					have already printed. By the time two moving averages cross or an oscillator flashes
					green, institutional expansion is often halfway to opposing supply — inflating option
					premiums and widening the distance to your stop.
				</p>
			</div>

			<div class="method-pillars-grid">
				{#each METHODOLOGY_PILLARS as pillar (pillar.code)}
					<article class="crisis-card">
						<div class="crisis-card__header">
							<span class="meta-label">{pillar.code}</span>
						</div>
						<h3 class="crisis-card__title">{pillar.title}</h3>
						<p class="crisis-card__body">{pillar.description}</p>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- SECTION 3: INTERACTIVE 4-TIMEFRAME FRACTAL ALIGNMENT + CLEAN CHART ANATOMY -->
	<section id="timeframe-alignment" class="section calls-section" aria-labelledby="alignment-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Top-Down Execution · Monthly Down to 1-Minute</span>
				<h2 id="alignment-h2">How Four Timeframe Layers Compress Risk to Pennies</h2>
				<p class="body-copy section-header__sub">
					Higher timeframes dictate <strong>where</strong> institutional liquidity sits; the
					1-minute and 5-minute charts dictate <strong>when</strong> buyers or sellers prove control inside
					that zone. Select each layer below to inspect its exact role and binary invalidation rule.
				</p>
			</div>

			<div class="tf-tabs" role="tablist" aria-label="Timeframe alignment layers">
				{#each TIMEFRAME_ALIGNMENT_STEPS as step (step.id)}
					<button
						type="button"
						role="tab"
						id={`tab-${step.id}`}
						aria-controls={`panel-${step.id}`}
						aria-selected={activeTimeframe === step.id}
						class={['tf-tab', { 'is-active': activeTimeframe === step.id }]}
						onclick={() => (activeTimeframe = step.id)}
					>
						{step.tabLabel}
					</button>
				{/each}
			</div>

			<div class="tf-stage">
				{#each TIMEFRAME_ALIGNMENT_STEPS as step (step.id)}
					<div
						role="tabpanel"
						id={`panel-${step.id}`}
						aria-labelledby={`tab-${step.id}`}
						aria-hidden={activeTimeframe !== step.id}
						class={['tf-panel', { 'is-visible': activeTimeframe === step.id }]}
					>
						<div class="tf-panel__head">
							<span class="meta-label">LAYER {step.stepNumber} · {step.horizon}</span>
							<h3 class="tf-panel__title">{step.tabLabel}: {step.horizon}</h3>
							<p class="tf-panel__role">{step.structuralRole}</p>
						</div>

						<ul class="tf-checklist">
							{#each step.whatWeMap as bullet (bullet)}
								<li>
									<CheckIcon size={16} weight="bold" aria-hidden="true" />
									<span>{bullet}</span>
								</li>
							{/each}
						</ul>

						<div class="tf-invalidation">
							<strong>Binary Invalidation Standard:</strong>
							<span>{step.binaryInvalidationRule}</span>
						</div>
					</div>
				{/each}
			</div>

			<!-- Clean Price-Structure Diagram (Zero Oscillators) -->
			<figure class="structure-diagram" aria-labelledby="structure-caption">
				<svg
					viewBox="0 0 760 220"
					role="img"
					aria-label="Pure price-action demand zone reclaim with binary invalidation below the structural sweep low and tiered upside targets"
				>
					<rect x="0" y="0" width="760" height="220" fill="#10151a" />
					<!-- Higher-Timeframe Demand Zone -->
					<rect
						x="36"
						y="142"
						width="688"
						height="30"
						fill="rgba(220, 255, 101, 0.1)"
						stroke="#66764d"
						stroke-dasharray="4 4"
					/>
					<text x="48" y="161" fill="#dcff65" font-size="12" font-weight="700">
						WEEKLY / DAILY INSTITUTIONAL DEMAND ZONE
					</text>
					<!-- Binary Invalidation Line -->
					<line
						x1="36"
						y1="192"
						x2="724"
						y2="192"
						stroke="#ff6b6b"
						stroke-width="1.5"
						stroke-dasharray="6 4"
					/>
					<text x="48" y="208" fill="#ff9e9e" font-size="12" font-weight="700">
						BINARY HARD INVALIDATION PRINT (MECHANICAL EXIT — ZERO AVERAGING DOWN)
					</text>
					<!-- Target 1 / Target 2 Opposing Supply -->
					<line
						x1="36"
						y1="52"
						x2="724"
						y2="52"
						stroke="#8be9fd"
						stroke-width="1.2"
						stroke-dasharray="4 4"
					/>
					<text x="48" y="42" fill="#8be9fd" font-size="12" font-weight="700">
						OPPOSING HIGHER-TIMEFRAME SUPPLY (TARGET 1 &amp; TARGET 2 SCALING)
					</text>
					<!-- Pure Price Trajectory -->
					<polyline
						fill="none"
						stroke="#e8edf2"
						stroke-width="2.5"
						points="56,74 140,108 210,96 290,152 340,180 385,136 430,148 520,88 610,56 690,62"
					/>
					<circle cx="340" cy="180" r="5" fill="#ff6b6b" />
					<circle cx="430" cy="148" r="6" fill="#dcff65" />
					<text x="442" y="138" fill="#dcff65" font-size="12" font-weight="700">
						1M RECLAIM TRIGGER
					</text>
				</svg>
				<figcaption id="structure-caption">
					Illustrative educational schematic of {BRAND.methodology}: higher-timeframe demand defines
					location, 1-minute reclaim triggers execution, and the invalidation line caps downside
					risk without a single lagging indicator on screen.
				</figcaption>
			</figure>
		</div>
	</section>

	<!-- SECTION 4: SIDE-BY-SIDE COMPARISON TABLE (LIGHT SURFACE) -->
	<section class="section is-light" aria-labelledby="comparison-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Side-by-Side Architecture · Pure Structure vs. Retail Clutter</span>
				<h2 id="comparison-h2">Lagging Retail Indicators vs. {BRAND.methodology}</h2>
			</div>

			<div class="method-table-wrap">
				<table class="method-table">
					<thead>
						<tr>
							<th scope="col">Execution Dimension</th>
							<th scope="col">Lagging Retail Indicators</th>
							<th scope="col">{BRAND.methodology}</th>
						</tr>
					</thead>
					<tbody>
						{#each INDICATOR_COMPARISON_ROWS as row (row.dimension)}
							<tr>
								<th scope="row">{row.dimension}</th>
								<td>{row.laggingRetailIndicators}</td>
								<td class="method-table__win">{row.movePriorToTheMove}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>

	<!-- SECTION 5: ARCHIVED HISTORICAL DISLOCATION CASE STUDIES -->
	<section class="section protection-section" aria-labelledby="historical-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Historical Stress-Testing · Trade the Charts, Not the Noise</span>
				<h2 id="historical-h2">Archived Macro &amp; Single-Name Dislocation Case Studies</h2>
				<p class="body-copy section-header__sub">
					Shaped by {BRAND.founder.name}’s personal mentorship under Mark “Goldfinger” McGoldrick
					(Goldman Sachs Global Special Situations Group &amp; Mount Kellett Capital Management),
					pure price structure shines brightest when financial headlines reach peak panic or
					euphoria. Review our full verification standards and CFTC Rule 4.41 disclosures on the
					<a href={resolve('/track-record')} class="inline-acid-link">Public Trade Ledger</a>.
				</p>
			</div>

			<div class="calls-grid method-cases-grid">
				{#each HISTORICAL_INFLECTION_CALLS as item (item.id)}
					<article class="call-card">
						<div class="call-card__top">
							<span class="meta-label">{item.code}</span>
							<span class="call-card__metric">{item.periodLabel}</span>
						</div>
						<h3 class="call-card__title">{item.title}</h3>
						<figure class="case-proof-frame">
							{#if item.chartImage}
								<img
									src={item.chartImage.src}
									width={item.chartImage.width}
									height={item.chartImage.height}
									alt={item.chartImage.alt}
									loading="lazy"
									decoding="async"
								/>
							{:else}
								<svg
									viewBox="0 0 1280 720"
									width="1280"
									height="720"
									role="img"
									aria-label="16:9 chart proof frame reserved for {item.title}"
								>
									<rect x="0" y="0" width="1280" height="720" fill="#0d1217" />
									<rect
										x="28"
										y="28"
										width="1224"
										height="664"
										fill="none"
										stroke="#2f3943"
										stroke-width="2"
										stroke-dasharray="8 8"
									/>
									<text x="64" y="96" fill="#dcff65" font-size="22" font-weight="700">
										ARCHIVED CHART PROOF SLOT · 16:9 ZERO-CLS FRAME
									</text>
									<text x="64" y="146" fill="#e8edf2" font-size="28" font-weight="700">
										{item.title}
									</text>
									<text x="64" y="194" fill="#9aa6b2" font-size="20">
										Period: {item.periodLabel} · Asset slot: static{item.plannedAssetPath}
									</text>
									<polyline
										fill="none"
										stroke="#dcff65"
										stroke-width="4"
										points="80,540 260,470 420,510 610,280 790,340 980,210 1180,250"
									/>
								</svg>
							{/if}
							<figcaption class="case-proof-frame__caption">
								<strong>Non-Typicality Disclosure (FTC / CFTC Rule 4.41):</strong>
								{item.nonTypicalityNote}
							</figcaption>
						</figure>
						<dl class="call-card__details">
							<div>
								<dt>Market Context</dt>
								<dd>{item.marketBenchmark}</dd>
							</div>
							<div>
								<dt>Pure Price-Action Read</dt>
								<dd>{item.structuralRead}</dd>
							</div>
							<div>
								<dt>Asymmetric Risk Structuring</dt>
								<dd>{item.executionAndRisk}</dd>
							</div>
						</dl>
						<div class="call-card__footer">
							<span class="meta-label">{item.verificationStatus}</span>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- SECTION 6: FAQ + CLOSING FUNNEL -->
	<section class="section faq-section" aria-labelledby="methodology-faq-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Methodology FAQ · Pure Price Structure</span>
				<h2 id="methodology-faq-h2">Questions About Indicator-Free Price Action Trading</h2>
			</div>

			<div class="faq-list">
				{#each METHODOLOGY_FAQ_ITEMS as item, index (item.id)}
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

	<section class="section final-banner" aria-labelledby="method-final-h2">
		<div class="container final-banner__inner">
			<span class="eyebrow">Put Pure Price Structure Into Practice</span>
			<h2 id="method-final-h2" class="final-banner__h2">
				Choose Your Execution Track or Run Your Pre-Trade Risk Math Free.
			</h2>
			<p class="body-copy final-banner__copy">
				Compare our three schedule-matched Live Trading Rooms, explore standalone SPX &amp; Sunday
				swing blueprints, or size your next setup inside our free FINRA 2026 &amp; Options Greeks
				calculators.
			</p>
			<div class="cta-row method-cta-row">
				<a href={resolve('/live-trading-rooms')} class="btn btn-dark">
					<span>Compare Live Trading Rooms</span>
					<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
				</a>
				<a href={resolve('/alert-services')} class="btn btn-outline-dark">
					Explore Alert Services
				</a>
				<a href={resolve('/resources/intraday-margin-calculator')} class="btn btn-outline-dark">
					FINRA 2026 Margin Calculator
				</a>
			</div>
		</div>
	</section>
</main>

<Footer />

<style>
	.method-cta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.method-cta-row :global(.btn) {
		inline-size: auto;
	}

	.method-byline {
		margin-block: 1.5rem 0;
		padding-block-start: 1rem;
		border-block-start: 1px solid var(--line);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		line-height: 1.65;
		color: var(--muted);
		max-inline-size: 68ch;
	}

	.method-byline a,
	.method-byline time {
		color: var(--text);
		font-weight: var(--weight-semibold);
	}

	.method-pillars-grid,
	.method-cases-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
		gap: 1.25rem;
	}

	.tf-tabs {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
		gap: 0.5rem;
		margin-block-end: 1.25rem;
	}

	.tf-tab {
		padding: 0.85rem 1rem;
		background: #141a20;
		border: 1px solid #303840;
		color: var(--text-secondary);
		font-family: var(--font-mono);
		font-weight: var(--weight-semibold);
		font-size: var(--step-sm);
		line-height: 1.4;
		text-align: start;
		cursor: pointer;
	}

	.tf-tab.is-active {
		background: var(--acid);
		border-color: var(--acid);
		color: var(--ink);
		font-weight: var(--weight-bold);
	}

	.tf-stage {
		display: grid;
	}

	.tf-panel {
		grid-area: 1 / 1;
		visibility: hidden;
		pointer-events: none;
		padding: clamp(1.25rem, 2.5vw, 2rem);
		background: var(--surface-case-card);
		border: 1px solid #333b43;
	}

	.tf-panel.is-visible {
		visibility: visible;
		pointer-events: auto;
	}

	.tf-panel__title {
		margin-block: 0.5rem 0.75rem;
		font-size: var(--step-h3);
		line-height: var(--leading-card-h3);
	}

	.tf-panel__role {
		margin-block: 0 1.25rem;
		font-size: var(--step-body);
		line-height: 1.7;
		color: #c5ccd1;
		max-inline-size: 72ch;
	}

	.tf-checklist {
		list-style: none;
		margin: 0 0 1.25rem;
		padding: 0;
		display: grid;
		gap: 0.75rem;
	}

	.tf-checklist li {
		display: flex;
		align-items: flex-start;
		gap: 0.65rem;
		font-size: var(--step-body-sm);
		line-height: 1.65;
		color: var(--text-secondary);
	}

	.tf-checklist li :global(svg) {
		flex-shrink: 0;
		margin-block-start: 0.25rem;
		color: var(--acid);
	}

	.tf-invalidation {
		padding: 0.9rem 1.1rem;
		border-inline-start: 3px solid var(--acid);
		background: rgba(220, 255, 101, 0.06);
		font-size: var(--step-sm);
		line-height: 1.65;
		color: var(--text);
	}

	.tf-invalidation strong {
		color: var(--acid);
		margin-inline-end: 0.35rem;
	}

	.structure-diagram {
		margin: 2rem 0 0;
		padding: 1.25rem;
		background: #10151a;
		border: 1px solid #2e363e;
	}

	.structure-diagram svg {
		display: block;
		inline-size: 100%;
		block-size: auto;
	}

	.structure-diagram figcaption {
		margin-block-start: 0.85rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		line-height: 1.6;
		color: var(--muted);
	}

	.method-table-wrap {
		overflow-x: auto;
		border: 1px solid var(--card-light-border);
		background: var(--card-white);
	}

	.method-table {
		inline-size: 100%;
		border-collapse: collapse;
		text-align: start;
	}

	.method-table th,
	.method-table td {
		padding: 1rem 1.15rem;
		border-block-end: 1px solid var(--card-light-border);
		font-size: var(--step-body-sm);
		line-height: 1.6;
		vertical-align: top;
		color: #2f363d;
	}

	.method-table thead th {
		background: var(--ink);
		color: #ffffff;
		font-family: var(--font-display);
		font-weight: var(--weight-bold);
		font-size: var(--step-sm);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.method-table tbody th {
		font-family: var(--font-display);
		font-weight: var(--weight-bold);
		color: var(--ink);
		min-inline-size: 11rem;
	}

	.method-table__win {
		background: rgba(75, 95, 29, 0.06);
		color: var(--ink);
		font-weight: var(--weight-medium);
	}

	.inline-acid-link {
		color: var(--acid);
		font-weight: var(--weight-semibold);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.case-proof-frame {
		margin: 0.75rem 0 1rem;
		border: 1px solid #2d3640;
		background: #0d1217;
	}

	.case-proof-frame img,
	.case-proof-frame svg {
		display: block;
		inline-size: 100%;
		block-size: auto;
		aspect-ratio: 16 / 9;
	}

	.case-proof-frame__caption {
		padding: 0.65rem 0.85rem;
		border-block-start: 1px solid #242c34;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		line-height: 1.55;
		color: var(--muted);
	}

	.case-proof-frame__caption strong {
		color: var(--text);
	}
</style>
