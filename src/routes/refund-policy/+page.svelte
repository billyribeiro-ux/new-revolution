<script lang="ts">
	import { resolve } from '$app/paths';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#refund-policy-page">Skip to main content</a>
<Navbar />

<main id="refund-policy-page" class="inner-page refund-policy-page">
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true">/</li>
				<li aria-current="page">Refund Policy</li>
			</ol>
			<p class="breadcrumb-bar__telemetry">
				<span>Concept Preview</span> • <span>No Purchases Available</span>
			</p>
		</div>
	</nav>

	<section class="page-hero" aria-labelledby="refund-h1">
		<div class="hero-inner">
			<span class="section-kicker">Concept Status &amp; Purchase Availability</span>
			<h1 id="refund-h1" class="hero-h1">Cancellation &amp; Refund Policy</h1>
			<p class="lead-copy">
				Purchases and paid subscriptions have never been made available. This concept website
				accepts no orders, payments, deposits, or paid enrollment.
			</p>
			<p class="meta-byline">
				Published by <a href={resolve('/about')}>Billy Ribeiro</a> • Effective
				<time datetime="2026-11-11">November 11, 2026</time>
			</p>
		</div>
	</section>

	<section class="content-section" aria-labelledby="refund-terms-h2">
		<div class="section-header">
			<span class="section-kicker">Clear Member Terms</span>
			<h2 id="refund-terms-h2" class="section-h2">No Current Billing or Paid Enrollment</h2>
		</div>
		<div class="card-grid">
			<article class="info-card">
				<h3>1. No Purchases or Paid Subscriptions</h3>
				<p>
					Trading rooms, alerts, mentorship, courses, indicators, and scanners are proposed concepts
					under development. No checkout, paid subscription, or payment collection is available.
					Offer controls display an informational concept notice.
				</p>
			</article>
			<article class="info-card">
				<h3>2. Future Terms Are Not Yet Offered</h3>
				<p>
					No current price, promotional rate, delivery date, software license, billing cycle, or
					refund arrangement is offered. Any future launch would require accurate purchase terms and
					appropriate review before payments could be enabled. Do not send money or payment card
					details.
				</p>
			</article>
			<article class="info-card">
				<h3>3. Questions &amp; Unrecognized Payment Requests</h3>
				<p>
					If you encounter a payment request claiming to be from this project, <a
						href={resolve('/contact')}>contact us</a
					>
					for clarification. Requesting development emails or sending feedback creates no purchase or
					reservation. See our <a href={resolve('/terms-of-service')}>development terms</a> and
					<a href={resolve('/privacy-policy')}>Privacy Policy</a>.
				</p>
			</article>
		</div>
	</section>

	<aside class="disclaimer-strip" aria-label="Educational risk disclaimer">
		<p>
			<strong>Billing &amp; Risk Notice:</strong> Review our
			<a href={resolve('/terms-of-service')}>Terms of Service</a> and
			<a href={resolve('/privacy-policy')}>Privacy Policy</a> for this development preview. Trading involves
			substantial risk of loss.
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
