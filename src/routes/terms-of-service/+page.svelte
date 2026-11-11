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
			<span class="section-kicker">Concept Development &amp; Public Testing</span>
			<h1 id="terms-h1" class="hero-h1">Terms of Service &amp; Disclosures</h1>
			<p class="lead-copy">
				This website is a concept in progress, developed with AI and made public for real-browser
				testing and search visibility. It does not offer products, services, or paid enrollment.
			</p>
			<p class="meta-byline">
				Published by <a href={resolve('/about')}>Billy Ribeiro</a> • Effective
				<time datetime="2026-11-11">November 11, 2026</time>
			</p>
		</div>
	</section>

	<section class="content-section" aria-labelledby="terms-sections-h2">
		<div class="section-header">
			<span class="section-kicker">U.S. &amp; Canadian Regulatory Notice</span>
			<h2 id="terms-sections-h2" class="section-h2">
				Development Terms &amp; Risk Acknowledgements
			</h2>
		</div>
		<div class="card-grid">
			<article class="info-card">
				<h3>1. Concept Status &amp; No Sales</h3>
				<p>
					Purchases and paid subscriptions have never been made available. We do not accept orders,
					payments, deposits, or paid enrollment. Described trading rooms, alerts, mentorship,
					courses, indicators, and scanners are proposed concepts. Features, pricing, and
					availability may change; no launch is guaranteed.
				</p>
			</article>
			<article class="info-card">
				<h3>2. AI Development &amp; Accuracy</h3>
				<p>
					This website is developed with AI. Text, code, charts, examples, and demonstrations may
					contain errors, inaccuracies, omissions, outdated information, or unfinished
					functionality. Verify material information against authoritative sources. A prototype or
					disclosure is not evidence that a factual, technical, or performance claim has been
					verified. Please <a href={resolve('/contact')}>report suspected inaccuracies</a>.
				</p>
			</article>
			<article class="info-card">
				<h3>3. Educational Content &amp; Trading Risk</h3>
				<p>
					Content is for general education and testing, not personalized investment, legal, or tax
					advice. Demonstrations are illustrative unless expressly documented otherwise. No trading
					outcome is guaranteed. Stocks and options involve substantial risk, including loss of
					capital; some strategies can lose more than the initial investment. Consult appropriately
					qualified professionals before acting.
				</p>
			</article>
			<article class="info-card">
				<h3>4. Feedback &amp; Development Updates</h3>
				<p>
					Contacting us or requesting development emails does not purchase, reserve, or guarantee a
					product, launch date, price, or future access. Email updates are separate from paid
					subscriptions. Read our <a href={resolve('/privacy-policy')}>Privacy Policy</a> for
					information handling and our
					<a href={resolve('/refund-policy')}>purchase availability notice</a>.
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
