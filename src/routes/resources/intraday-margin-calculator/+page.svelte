<!-- src/routes/resources/intraday-margin-calculator/+page.svelte -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import IntradayMarginCalculator from '#lib/components/tools/IntradayMarginCalculator.svelte';
	import { INTRADAY_MARGIN_CALCULATOR_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#intraday-margin-calculator-page">Skip to content</a>

<Navbar />

<main id="intraday-margin-calculator-page" class="inner-page intraday-margin-calculator-page">
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true" class="crumb-sep"><CaretRightIcon size={12} weight="bold" /></li>
				<li><a href={resolve('/resources')}>Free Trading Resources</a></li>
				<li aria-hidden="true" class="crumb-sep"><CaretRightIcon size={12} weight="bold" /></li>
				<li aria-current="page">FINRA 2026 Margin Calculator</li>
			</ol>
			<p class="breadcrumb-bar__telemetry">
				<span>100% Free Public Utility · $0</span> ·
				<span>FINRA Notice 26-10 / Rule 4210(d)(2)</span>
				·
				<span>T+1 Cash &amp; Margin</span>
			</p>
		</div>
	</nav>

	<section class="section hero-section" aria-labelledby="iml-page-h1">
		<div class="container hero-section__grid">
			<div class="hero-section__main">
				<div class="eyebrow-pill">
					<span class="eyebrow-pill__badge">FINRA Notice 26-10 · Free Tool</span>
					<span class="eyebrow-pill__text"
						>Replaces Legacy $25,000 PDT Rule · Rollout Through Oct 2027</span
					>
				</div>

				<hgroup>
					<p class="hero-h1__seo-kicker seo-kicker">
						FINRA Rule 4210(d)(2) Intraday Margin &amp; Position Sizer
					</p>
					<h1 id="iml-page-h1" class="hero-h1">
						<span class="hero-h1__display">
							Calculate Your Real-Time Intraday Margin Level (IML), De Minimis Buffer &amp; Safe
							Contract Size.
						</span>
					</h1>
				</hgroup>

				<p class="lead-copy">
					Under FINRA Regulatory Notice 26-10 (effective June 4, 2026, with an 18-month broker
					implementation window through October 20, 2027), margin accounts above the
					<strong>$2,000</strong> baseline transition off the 2001-era 4-trade/$25,000 Pattern Day
					Trader rule onto real-time <strong>Intraday Margin Level (IML)</strong> monitoring. Test your
					exact margin cushion or T+1 settled-cash rotation below before placing a trade.
				</p>
			</div>
		</div>
	</section>

	<section class="section calls-section" aria-label="Interactive FINRA Rule 4210 Calculator">
		<div class="container">
			<IntradayMarginCalculator
				headingLevel="h2"
				canonicalPath="/resources/intraday-margin-calculator"
			/>
		</div>
	</section>

	<section class="section is-light" aria-labelledby="iml-formulas-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Statutory Math · FINRA Rule 4210(d)(2)</span>
				<h2 id="iml-formulas-h2">
					Three Core Rules Governing Post-PDT Margin &amp; Small Accounts
				</h2>
			</div>

			<div class="iml-rules-grid">
				<article class="crisis-card">
					<span class="meta-label">RULE 01 · INTRADAY MARGIN LEVEL (IML)</span>
					<h3 class="crisis-card__title">IML = Margin Equity − Intraday Maintenance</h3>
					<p class="crisis-card__body">
						Whenever your real-time Margin Equity minus peak Intraday Maintenance drops below $0,
						your account records an Intraday Margin Deficit (IMD). Keeping IML comfortably positive
						prevents forced intraday broker liquidations.
					</p>
				</article>
				<article class="crisis-card">
					<span class="meta-label">RULE 02 · DE MINIMIS EXCEPTION</span>
					<h3 class="crisis-card__title">Lesser of 5% of Equity or $1,000</h3>
					<p class="crisis-card__body">
						Minor intraday deficits within `min(0.05 × Equity, $1,000)` are excused from FINRA’s
						15-business-day deficit tracking and 90-day repeated-violation restriction, though house
						broker overlays can still liquidate over-leveraged positions.
					</p>
				</article>
				<article class="crisis-card">
					<span class="meta-label">RULE 03 · UNDER $2,000 = T+1 CASH</span>
					<h3 class="crisis-card__title">Overnight Options &amp; Equity Settlement</h3>
					<p class="crisis-card__body">
						Accounts below FINRA’s $2,000 margin floor trade in a T+1 Cash Account where stocks and
						listed options settle the next business morning — allowing 100% of settled cash to
						rotate daily without Good Faith Violations.
					</p>
				</article>
			</div>
		</div>
	</section>

	<section class="section faq-section" aria-labelledby="iml-faq-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">FINRA Rule 4210 Calculator FAQ</span>
				<h2 id="iml-faq-h2">Questions About Intraday Margin, De Minimis &amp; Broker Cutovers</h2>
			</div>

			<div class="faq-list">
				{#each INTRADAY_MARGIN_CALCULATOR_FAQ_ITEMS as item, index (item.id)}
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

	<section class="section final-banner" aria-labelledby="iml-final-h2">
		<div class="container final-banner__inner">
			<span class="eyebrow">Read the Full Playbook or Join Our $500+ Risk Desk</span>
			<h2 id="iml-final-h2" class="final-banner__h2">
				Master Every Detail of FINRA Notice 26-10 &amp; Small-Account Risk Governance.
			</h2>
			<div class="cta-row iml-cta-row">
				<a href={resolve('/resources/finra-intraday-margin-rule-2026')} class="btn btn-dark">
					<span>Read Complete FINRA 2026 Guide</span>
					<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
				</a>
				<a href={resolve('/live-trading-rooms/small-accounts-room')} class="btn btn-outline-dark">
					Small Accounts Room ($500+)
				</a>
				<a href={resolve('/resources/options-calculator')} class="btn btn-outline-dark">
					Options Greeks Calculator
				</a>
			</div>
		</div>
	</section>
</main>

<Footer />

<style>
	.iml-rules-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
		gap: 1.25rem;
	}

	.iml-cta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.iml-cta-row :global(.btn) {
		inline-size: auto;
	}
</style>
