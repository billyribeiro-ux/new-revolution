<script lang="ts">
	import { resolve } from '$app/paths';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#editorial-policy-page">Skip to main content</a>
<Navbar />

<main id="editorial-policy-page" class="inner-page editorial-policy-page">
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true">/</li>
				<li aria-current="page">Editorial Policy</li>
			</ol>
			<p class="breadcrumb-bar__telemetry">
				<span>Research Integrity</span> • <span>YMYL Verification &amp; Risk Disclosure</span>
			</p>
		</div>
	</nav>

	<section class="page-hero" aria-labelledby="editorial-h1">
		<div class="hero-inner">
			<span class="section-kicker">AI Development &amp; Editorial Transparency</span>
			<h1 id="editorial-h1" class="hero-h1">Editorial Policy &amp; Standards</h1>
			<p class="lead-copy">
				This AI-developed concept website may contain inaccurate, incomplete, or outdated content.
				The standards below describe our review goals, not a guarantee that every statement has been
				verified.
			</p>
			<p class="meta-byline">
				Published by <a href={resolve('/about')}>Billy Ribeiro</a> • Updated
				<time datetime="2026-11-11">November 11, 2026</time>
			</p>
		</div>
	</section>

	<section class="content-section" aria-labelledby="verification-h2">
		<div class="section-header">
			<span class="section-kicker">People Over Profits</span>
			<h2 id="verification-h2" class="section-h2">Accuracy, Sources &amp; Corrections</h2>
		</div>
		<div class="card-grid">
			<article class="info-card">
				<h3>1. AI Assistance &amp; Human Responsibility</h3>
				<p>
					AI is used to develop website code, copy, charts, and demonstrations. AI output can
					contain factual mistakes, misleading explanations, unsupported claims, and unfinished
					behavior. Publishing a preview does not establish accuracy. Material claims should be
					checked against authoritative sources before reliance.
				</p>
			</article>
			<article class="info-card">
				<h3>2. Evidence &amp; Illustrative Demonstrations</h3>
				<p>
					Primary regulator, exchange, and product documentation should support financial and
					technical claims. Demonstrations and sample prices are illustrative unless expressly
					documented otherwise; they are not live signals, verified trading results, or customer
					outcomes. No strategy or proposed tool guarantees a return.
				</p>
			</article>
			<article class="info-card">
				<h3>3. Corrections &amp; Proposed Services</h3>
				<p>
					Please <a href={resolve('/contact')}>report suspected errors</a> with the relevant page and
					source. Proposed features, compatibility, and future availability remain subject to development
					and verification. None of the proposed products or paid subscriptions is currently offered for
					sale.
				</p>
			</article>
		</div>
	</section>

	<aside class="disclaimer-strip" aria-label="Educational risk disclaimer">
		<p>
			<strong>Editorial Disclosure:</strong> Content on Revolution Trading Pros is for educational purposes
			only and does not constitute personalized investment advice. Trading involves substantial risk of
			loss.
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
