<script lang="ts">
	import { resolve } from '$app/paths';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#terms-of-service-page">Skip to main content</a>
<Navbar />

<main id="terms-of-service-page" class="inner-page terms-of-service-page">
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true">/</li>
				<li aria-current="page">Terms of Service</li>
			</ol>
			<p class="breadcrumb-bar__telemetry">
				<span>Legal Terms</span> • <span>U.S. &amp; Canadian Regulatory Disclosures</span>
			</p>
		</div>
	</nav>

	<section class="page-hero" aria-labelledby="terms-h1">
		<div class="hero-inner">
			<span class="section-kicker">Legal Terms &amp; Regulatory Disclosures</span>
			<h1 id="terms-h1" class="hero-h1">Terms of Service &amp; Disclosures</h1>
			<p class="lead-copy">
				These Terms of Service govern your access to Revolution Trading Pros live trading rooms,
				alert services, courses, and custom software indicators.
			</p>
			<p class="meta-byline">
				Reviewed by <a href={resolve('/about')}>Billy Ribeiro</a> • Effective
				<time datetime="2026-10-31">October 31, 2026</time>
			</p>
		</div>
	</section>

	<section class="content-section" aria-labelledby="terms-sections-h2">
		<div class="section-header">
			<span class="section-kicker">U.S. &amp; Canadian Regulatory Notice</span>
			<h2 id="terms-sections-h2" class="section-h2">Core Terms &amp; Risk Acknowledgements</h2>
		</div>
		<div class="card-grid">
			<article class="info-card">
				<h3>1. Educational &amp; Non-Advisory Scope</h3>
				<p>
					Revolution Trading Pros is not registered as an investment adviser, broker-dealer, or
					commodity trading advisor with the U.S. SEC, CFTC, FINRA, or Canadian provincial
					regulators (OSC, BCSC, ASC). All commentary, watchlists, and indicators are strictly
					educational.
				</p>
			</article>
			<article class="info-card">
				<h3 id="options-leverage-risk-disclosure">2. Options &amp; Leverage Risk Disclosure</h3>
				<p>
					Options trading involves substantial risk of loss and is not suitable for every investor.
					Before trading options, read the Characteristics and Risks of Standardized Options
					published by the Options Clearing Corporation (OCC).
				</p>
			</article>
			<article class="info-card">
				<h3>3. Software Licensing &amp; Cancellations</h3>
				<p>
					Proprietary thinkScript and Pine Script code is licensed for individual member use only.
					Subscription billing and cancellations are governed by our
					<a href={resolve('/refund-policy')}>Cancellation &amp; Refund Policy</a> and
					<a href={resolve('/privacy-policy')}>Privacy Policy</a>.
				</p>
			</article>
		</div>
	</section>

	<aside class="disclaimer-strip" aria-label="Educational risk disclaimer">
		<p>
			<strong>Substantial Risk Warning:</strong> Never trade with capital you cannot afford to lose. Past
			performance of any trading system or methodology is not necessarily indicative of future results.
		</p>
	</aside>
</main>

<Footer />

<style>
	.meta-byline {
		margin-top: 1rem;
		font-size: 0.9375rem;
		color: var(--muted);
	}
	.meta-byline a {
		color: var(--text);
		text-decoration: underline;
		min-height: 24px;
		display: inline-flex;
		align-items: center;
	}
</style>
