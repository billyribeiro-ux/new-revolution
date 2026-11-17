<!-- src/routes/track-record/+page.svelte -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import { BRAND } from '#lib/config/brand';
	import { VERIFIED_CASE_STUDIES } from '#lib/data/homepage.ts';
	import {
		ARCHIVED_HISTORICAL_CALLS,
		LEDGER_AUDIT_STANDARDS,
		LEDGER_FILTER_TABS,
		LEDGER_KPI_CARDS,
		type LedgerFilterTrack
	} from '#lib/data/track-record.ts';
	import { TRACK_RECORD_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import { scrollToSection } from '#lib/utils/scroll.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let selectedTrack = $state<LedgerFilterTrack>('all');

	let filteredHistoricalCalls = $derived(
		selectedTrack === 'all'
			? ARCHIVED_HISTORICAL_CALLS
			: ARCHIVED_HISTORICAL_CALLS.filter((c) => c.track === selectedTrack)
	);
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#track-record-page">Skip to content</a>

<Navbar />

<main id="track-record-page" class="inner-page track-record-page">
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true" class="crumb-sep"><CaretRightIcon size={12} weight="bold" /></li>
				<li aria-current="page">Track Record</li>
			</ol>
			<p class="breadcrumb-bar__telemetry">
				<span>Zero Hindsight Cherry-Picking</span> · <span>Stop-Outs Retained</span> ·
				<span>CFTC Rule 4.41 Compliant</span>
			</p>
		</div>
	</nav>

	<!-- SECTION 1: HERO -->
	<section class="section hero-section" aria-labelledby="ledger-h1">
		<div class="container hero-section__grid">
			<div class="hero-section__main">
				<div class="eyebrow-pill">
					<span class="eyebrow-pill__badge">Verification Vault</span>
					<span class="eyebrow-pill__text">Pre-Trade Thesis · Binary Stops · Full Retention</span>
				</div>

				<hgroup>
					<p class="hero-h1__seo-kicker seo-kicker">
						Public Trade Ledger &amp; Historical Case Studies
					</p>
					<h1 id="ledger-h1" class="hero-h1">
						<span class="hero-h1__display">
							Every Setup Logged With Its Pre-Trade Stop — Wins and Stop-Outs Alike.
						</span>
					</h1>
				</hgroup>

				<p class="lead-copy">
					Retail chatrooms market hindsight peak-of-day screenshots while quietly deleting
					stopped-out alerts. Our public trade ledger enforces a strict institutional standard: no
					live trade row receives a <strong>Primary-Receipt Verified</strong> badge without a dated pre-trade
					room or dispatch timestamp, exact contract parameters, and permanent retention of every stopped-out
					invalidation.
				</p>

				<div class="cta-row ledger-cta-row">
					<button
						type="button"
						class="btn btn-primary"
						onclick={() => scrollToSection('historical-archive')}
					>
						<span>Inspect Archived Case Studies</span>
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</button>
					<a href={resolve('/methodology')} class="btn btn-outline">
						Read {BRAND.methodology}
					</a>
				</div>

				<p class="ledger-byline">
					Maintained by <a href={resolve('/about')}>{BRAND.founder.name}</a> · Updated
					<time datetime="2026-11-16">November 16, 2026</time> · Non-typical historical examples;
					see full <a href={resolve('/risk-disclosure')}>U.S. &amp; Canada Risk Disclosure</a>.
				</p>
			</div>
		</div>
	</section>

	<!-- SECTION 2: 4-POINT PRIMARY-RECEIPT VERIFICATION STANDARD (LIGHT SURFACE) -->
	<section class="section is-light" aria-labelledby="audit-standard-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Ledger Governance · Zero Reconstructed Backtests</span>
				<h2 id="audit-standard-h2">Our 4-Point Primary-Receipt Audit Standard</h2>
				<p class="body-copy section-header__sub">
					Every published entry in our live ledger must satisfy all four verification gates below.
					Until primary pre-trade and post-session archive media are attached, entries remain
					explicitly labeled as unverified historical accounts rather than machine-verified fills.
				</p>
			</div>

			<div class="ledger-standards-grid">
				{#each LEDGER_AUDIT_STANDARDS as rule (rule.field)}
					<article class="crisis-card">
						<span class="meta-label">{rule.field}</span>
						<h3 class="crisis-card__title">{rule.requirement}</h3>
						<p class="crisis-card__body">{rule.whyItMatters}</p>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- SECTION 3: LIVE VERIFIED LEDGER VAULT + FILTERABLE ARCHIVED CASE STUDIES -->
	<section id="historical-archive" class="section calls-section" aria-labelledby="archive-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Documented Structural Calls &amp; Live Ledger Feed</span>
				<h2 id="archive-h2">Archived Historical Dislocations &amp; Verified Session Feed</h2>
			</div>

			<div class="ledger-kpi-grid" aria-label="Live session ledger KPI summary">
				{#each LEDGER_KPI_CARDS as kpi (kpi.id)}
					<div class="ledger-kpi-card">
						<span class="meta-label">{kpi.label}</span>
						<strong class="ledger-kpi-card__value tabular-nums">
							{kpi.id === 'closed-setups' ? String(VERIFIED_CASE_STUDIES.length) : kpi.value}
						</strong>
						<span class="ledger-kpi-card__sub">{kpi.sublabel}</span>
					</div>
				{/each}
			</div>

			<div class="ledger-vault-banner" role="status">
				<strong>Live Session Receipt Vault Status:</strong>
				{#if VERIFIED_CASE_STUDIES.length === 0}
					<span>
						0 live post-launch session receipts published yet — we never fabricate sample trade
						rows, hypothetical win rates, or cherry-picked fills. As live room and alert dispatches
						archive dated pre-trade timestamps alongside winning and stopped-out outcomes, verified
						rows populate directly in the table below.
					</span>
				{:else}
					<span>
						{VERIFIED_CASE_STUDIES.length} primary-receipt verified session entries published.
					</span>
				{/if}
			</div>

			<div
				class="ledger-table-wrap"
				aria-label="Verified closed setups and stopped-out invalidations"
			>
				<table class="ledger-table">
					<thead>
						<tr>
							<th scope="col">Session Date (ET)</th>
							<th scope="col">Instrument &amp; Contract</th>
							<th scope="col">Execution Track</th>
							<th scope="col">Pre-Trade Entry &amp; Binary Stop</th>
							<th scope="col">Outcome (Wins &amp; Stop-Outs)</th>
							<th scope="col">Primary Receipt</th>
						</tr>
					</thead>
					<tbody>
						{#if VERIFIED_CASE_STUDIES.length === 0}
							<tr>
								<td colspan="6" class="ledger-table__empty">
									No post-launch live session receipts have been recorded yet. Every future closed
									setup — both target scales and mechanical binary stop-out invalidations — will
									remain permanently published here.
								</td>
							</tr>
						{:else}
							{#each VERIFIED_CASE_STUDIES as entry (entry.id)}
								<tr>
									<td class="tabular-nums">{entry.enteredAt}</td>
									<td>{entry.contractSymbol} ({entry.strike})</td>
									<td>{entry.kicker}</td>
									<td>Max Risk: {entry.maxRisk}</td>
									<td class="tabular-nums">{entry.result}</td>
									<td>Timestamped Chart Attached</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>

			<div
				class="ledger-filter-bar"
				role="group"
				aria-label="Filter archived case studies by track"
			>
				{#each LEDGER_FILTER_TABS as tab (tab.id)}
					<button
						type="button"
						class={['ledger-pill', { 'is-active': selectedTrack === tab.id }]}
						aria-pressed={selectedTrack === tab.id}
						onclick={() => (selectedTrack = tab.id)}
					>
						{tab.label}
					</button>
				{/each}
			</div>

			{#if filteredHistoricalCalls.length === 0}
				<div class="ledger-empty-track">
					<p>
						No archived pre-launch case studies in the <strong>{selectedTrack}</strong> filter yet.
						Select <strong>All Documented Cases</strong> above to review our archived macro S&amp;P 500
						and single-name options case studies.
					</p>
				</div>
			{:else}
				<div class="calls-grid ledger-cases-grid">
					{#each filteredHistoricalCalls as call (call.id)}
						<article class="call-card">
							<div class="call-card__top">
								<span class="meta-label">{call.code}</span>
								<span class="call-card__metric">{call.periodLabel}</span>
							</div>
							<h3 class="call-card__title">{call.title}</h3>
							<figure class="case-proof-frame">
								{#if call.chartImage}
									<img
										src={call.chartImage.src}
										width={call.chartImage.width}
										height={call.chartImage.height}
										alt={call.chartImage.alt}
										loading="lazy"
										decoding="async"
									/>
								{:else}
									<svg
										viewBox="0 0 1280 720"
										width="1280"
										height="720"
										role="img"
										aria-label="16:9 chart proof frame reserved for {call.title}"
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
											{call.title}
										</text>
										<text x="64" y="194" fill="#9aa6b2" font-size="20">
											{call.instrument} · Asset slot: static{call.plannedAssetPath}
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
									<strong>Non-Typicality Disclosure:</strong>
									{call.nonTypicalityNote}
								</figcaption>
							</figure>
							<dl class="call-card__details">
								<div>
									<dt>Instrument &amp; Structure</dt>
									<dd>{call.instrument} · {call.directionAndStructure}</dd>
								</div>
								<div>
									<dt>Market Benchmark</dt>
									<dd>{call.marketBenchmark}</dd>
								</div>
								<div>
									<dt>Pure Price-Action Thesis</dt>
									<dd>{call.structuralRead}</dd>
								</div>
								<div>
									<dt>Risk Governance</dt>
									<dd>{call.executionAndRisk}</dd>
								</div>
							</dl>
							<div class="call-card__footer">
								<span class="meta-label">{call.verificationStatus}</span>
							</div>
						</article>
					{/each}
				</div>
			{/if}

			<aside class="cftc-box" aria-label="CFTC Rule 4.41 and non-typicality disclosure">
				<h3 class="cftc-box__title">Mandatory CFTC Rule 4.41 &amp; Non-Typicality Notice</h3>
				<p>
					Historical structural case studies represent rare outlier market dislocations reported by
					{BRAND.founder.name} and are <strong>not typical</strong> of everyday member results. Trading
					equities, ETFs, and listed options — particularly 0DTE and short-dated contracts — carries substantial
					risk of loss up to 100% of premium committed. Never trade with capital you cannot afford to
					lose.
				</p>
			</aside>
		</div>
	</section>

	<!-- SECTION 4: FAQ + FINAL CTA -->
	<section class="section faq-section" aria-labelledby="ledger-faq-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Verification &amp; Compliance FAQ</span>
				<h2 id="ledger-faq-h2">Questions About Our Public Trade Ledger Standard</h2>
			</div>

			<div class="faq-list">
				{#each TRACK_RECORD_FAQ_ITEMS as item, index (item.id)}
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

	<section class="section final-banner" aria-labelledby="ledger-final-h2">
		<div class="container final-banner__inner">
			<span class="eyebrow">Verify the Methodology Behind Every Setup</span>
			<h2 id="ledger-final-h2" class="final-banner__h2">
				Study {BRAND.methodology} or Test Your Pre-Trade Sizing Math Free.
			</h2>
			<div class="cta-row ledger-cta-row">
				<a href={resolve('/methodology')} class="btn btn-dark">
					<span>Read Our Methodology</span>
					<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
				</a>
				<a href={resolve('/live-trading-rooms')} class="btn btn-outline-dark">
					Compare Live Trading Rooms
				</a>
				<a href={resolve('/risk-disclosure')} class="btn btn-outline-dark">
					Full Risk Disclosure
				</a>
			</div>
		</div>
	</section>
</main>

<Footer />

<style>
	.ledger-cta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.ledger-cta-row :global(.btn) {
		inline-size: auto;
	}

	.ledger-byline {
		margin-block: 1.5rem 0;
		padding-block-start: 1rem;
		border-block-start: 1px solid var(--line);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		line-height: 1.65;
		color: var(--muted);
		max-inline-size: 68ch;
	}

	.ledger-byline a,
	.ledger-byline time {
		color: var(--text);
		font-weight: var(--weight-semibold);
	}

	.ledger-standards-grid,
	.ledger-cases-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
		gap: 1.25rem;
	}

	.ledger-vault-banner {
		padding: 1.15rem 1.35rem;
		margin-block-end: 1.5rem;
		border: 1px solid #35404a;
		border-inline-start: 3px solid var(--acid);
		background: #12181e;
		font-size: var(--step-body-sm);
		line-height: 1.65;
		color: var(--text-secondary);
	}

	.ledger-vault-banner strong {
		color: var(--acid);
		margin-inline-end: 0.4rem;
	}

	.ledger-filter-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-block-end: 1.5rem;
	}

	.ledger-pill {
		padding: 0.65rem 1rem;
		background: #141a20;
		border: 1px solid #313942;
		color: var(--text-secondary);
		font-family: var(--font-mono);
		font-weight: var(--weight-semibold);
		font-size: 0.75rem;
		line-height: 1.4;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		cursor: pointer;
	}

	.ledger-pill.is-active {
		background: var(--acid);
		border-color: var(--acid);
		color: var(--ink);
		font-weight: var(--weight-bold);
	}

	.ledger-empty-track {
		padding: 1.5rem;
		background: #141a20;
		border: 1px solid #313942;
		font-size: var(--step-body-sm);
		line-height: 1.65;
		color: var(--text-secondary);
	}

	.cftc-box {
		margin-block-start: 2rem;
		padding: 1.35rem 1.5rem;
		border: 1px solid var(--status-amber-border);
		background: rgba(255, 196, 86, 0.06);
	}

	.cftc-box__title {
		margin: 0 0 0.5rem;
		font-family: var(--font-display);
		font-weight: var(--weight-bold);
		font-size: var(--step-sub);
		line-height: 1.35;
		color: var(--status-amber-text);
	}

	.cftc-box p {
		margin: 0;
		font-size: var(--step-sm);
		line-height: 1.65;
		color: var(--text-secondary);
		max-inline-size: 80ch;
	}

	.cftc-box strong {
		color: var(--text);
	}

	.ledger-kpi-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
		gap: 0.85rem;
		margin-block-end: 1.25rem;
	}

	.ledger-kpi-card {
		padding: 1rem 1.1rem;
		background: #141a20;
		border: 1px solid #313942;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.ledger-kpi-card__value {
		font-family: var(--font-mono);
		font-weight: var(--weight-bold);
		font-size: var(--step-h3);
		line-height: 1.2;
		color: var(--text);
	}

	.ledger-kpi-card__sub {
		font-size: 0.75rem;
		line-height: 1.45;
		color: var(--muted);
	}

	.ledger-table-wrap {
		overflow-x: auto;
		margin-block-end: 1.75rem;
		border: 1px solid #313942;
		background: #12181e;
	}

	.ledger-table {
		inline-size: 100%;
		border-collapse: collapse;
		font-size: var(--step-body-sm);
		line-height: 1.55;
		color: var(--text);
	}

	.ledger-table th,
	.ledger-table td {
		padding: 0.85rem 1rem;
		border-block-end: 1px solid #262e37;
		text-align: start;
		vertical-align: top;
	}

	.ledger-table thead th {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: var(--weight-bold);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background: #0f1419;
		color: var(--muted);
	}

	.ledger-table__empty {
		color: var(--text-secondary);
		padding: 1.15rem 1rem;
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
