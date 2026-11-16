<!-- src/routes/risk-disclosure/+page.svelte -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import { BRAND } from '#lib/config/brand';
	import { RISK_DISCLOSURE_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#risk-disclosure-page">Skip to content</a>

<Navbar />

<main id="risk-disclosure-page" class="inner-page risk-disclosure-page">
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true">/</li>
				<li aria-current="page">Risk Disclosure</li>
			</ol>
			<p class="breadcrumb-bar__telemetry">
				<span>U.S. &amp; Canada Regulatory Notice</span> ·
				<span>OCC · CFTC Rule 4.41 · FINRA Rule 4210</span>
			</p>
		</div>
	</nav>

	<section class="page-hero" aria-labelledby="risk-h1">
		<div class="hero-inner">
			<span class="section-kicker">Mandatory Financial &amp; Derivatives Risk Statement</span>
			<h1 id="risk-h1" class="hero-h1">U.S. &amp; Canadian Risk &amp; Regulatory Disclosure</h1>
			<p class="lead-copy">
				Trading equities, Exchange-Traded Funds (ETFs), and listed equity or index options
				(including 0DTE SPX and XSP contracts) involves substantial risk of loss and is not suitable
				for every investor. Read every regulatory disclosure below carefully before using any
				educational room, watchlist, article, or interactive calculator published by <strong
					>{BRAND.name}</strong
				>.
			</p>
			<p class="risk-byline">
				Published by <a href={resolve('/about')}>{BRAND.founder.name}</a> · Effective
				<time datetime="2026-11-16">November 16, 2026</time>
			</p>
		</div>
	</section>

	<section class="content-section" aria-labelledby="risk-clauses-h2">
		<div class="section-header">
			<span class="section-kicker">Statutory &amp; Market Structure Disclosures</span>
			<h2 id="risk-clauses-h2" class="section-h2">
				Six Core Regulatory &amp; Capital-Preservation Disclosures
			</h2>
		</div>

		<div class="card-grid">
			<article class="info-card">
				<h3>1. Educational Publisher Exclusion (U.S. &amp; Canada)</h3>
				<p>
					{BRAND.name} operates strictly as an impersonal financial trading education and research publisher
					pursuant to the publisher’s exclusion of the U.S. Investment Advisers Act of 1940 (15 U.S.C.
					§ 80b-2(a)(11)(D)) and comparable Canadian provincial securities exemptions (including OSC/CSA
					general market commentary standards). Neither {BRAND.name}
					nor {BRAND.founder.name} is registered as an investment adviser, broker-dealer, commodity trading
					advisor, or tax professional. Nothing published constitutes personalized investment, legal,
					or tax advice.
				</p>
			</article>

			<article class="info-card">
				<h3>2. OCC Standardized Options &amp; 0DTE Decay Risk</h3>
				<p>
					Options transactions are complex, leveraged, and subject to rapid non-linear implied
					volatility shifts and daily theta time decay. Short-dated and Zero-Days-to-Expiration
					(0DTE) index or equity options can lose 100% of committed premium within minutes if the
					underlying fails to reach your strike before expiration. Uncovered option writing and
					multi-leg early assignment can expose accounts to losses exceeding initial margin. Prior
					to buying or selling options, obtain and review the Options Clearing Corporation (OCC)
					disclosure document <strong>Characteristics and Risks of Standardized Options</strong>
					from your broker or the OCC.
				</p>
			</article>

			<article class="info-card">
				<h3>3. CFTC Rule 4.41 — Hypothetical &amp; Simulated Limitations</h3>
				<p>
					<strong>HYPOTHETICAL OR SIMULATED PERFORMANCE RESULTS HAVE CERTAIN LIMITATIONS.</strong>
					Unlike an actual performance record, simulated results (including outputs from our
					<a href={resolve('/resources/options-calculator')}
						>Options Profit &amp; Greeks Calculator</a
					>
					and
					<a href={resolve('/resources/intraday-margin-calculator')}>FINRA 2026 Margin Calculator</a
					>) do not represent actual trading. Also, since the trades have not been executed, the
					results may have under-or-over compensated for the impact, if any, of certain market
					factors, such as lack of liquidity, bid-ask spread widening, exchange fees, and slippage.
					No representation is being made that any account will or is likely to achieve profit or
					losses similar to those shown.
				</p>
			</article>

			<article class="info-card">
				<h3>4. Non-Typicality of Historical Case Studies</h3>
				<p>
					Historical market turn analyses and outlier options examples (such as the archived 2020
					COVID crash, 2022 bear-cycle extremes, and 2022 OXY put study documented on our
					<a href={resolve('/track-record')}>Track Record</a> page) are rare statistical outliers
					and are <strong>not typical</strong>. Most retail day and options traders experience
					losing periods, and past structural calls never guarantee future accuracy.
				</p>
			</article>

			<article class="info-card">
				<h3>5. FINRA Rule 4210(d)(2) Margin &amp; T+1 Settlement</h3>
				<p>
					While FINRA Regulatory Notice 26-10 (Amended Rule 4210(d)(2), effective June 4, 2026 with
					broker cutovers running through October 20, 2027) replaces the legacy $25,000 Pattern Day
					Trader rule with real-time Intraday Margin Level (IML) monitoring above the $2,000 margin
					baseline, each clearing broker enforces its own house margin multipliers, liquidation
					thresholds, and T+1 cash-account Good Faith Violation rules. Read our
					<a href={resolve('/resources/finra-intraday-margin-rule-2026')}>FINRA Rule 4210 Guide</a>
					and confirm your broker’s live margin agreement before trading.
				</p>
			</article>

			<article class="info-card">
				<h3>6. IRC Section 1256 &amp; Canadian Cross-Border Tax Rules</h3>
				<p>
					References to cash-settled SPX and mini-XSP index options qualifying for U.S. Internal
					Revenue Code Section 1256 (60% long-term / 40% short-term capital gains treatment) apply
					solely to eligible U.S. taxpayers and remain subject to holding-period and straddle rules.
					Canadian residents trading U.S.-listed options in TFSA, RRSP, or non-registered margin
					accounts face distinct CRA income vs. capital characterization and foreign-exchange rules.
					Consult a licensed CPA or chartered tax adviser in your jurisdiction.
				</p>
			</article>
		</div>
	</section>

	<section class="section faq-section" aria-labelledby="risk-faq-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Regulatory &amp; Compliance FAQ</span>
				<h2 id="risk-faq-h2">Common Questions About Risk, Licensing &amp; Disclosures</h2>
			</div>

			<div class="faq-list">
				{#each RISK_DISCLOSURE_FAQ_ITEMS as item, index (item.id)}
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
</main>

<Footer />

<style>
	.risk-byline {
		margin-block: 1rem 0;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		line-height: 1.6;
		color: var(--muted);
	}

	.risk-byline a,
	.risk-byline time {
		color: var(--text);
		font-weight: var(--weight-semibold);
	}
</style>
