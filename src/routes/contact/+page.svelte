<script lang="ts">
	import '#lib/styles/inner-page.css';
	import { resolve } from '$app/paths';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#contact-page">Skip to main content</a>
<Navbar />

<main id="contact-page" class="inner-page contact-page">
	<section class="page-hero" aria-labelledby="contact-h1">
		<div class="hero-inner">
			<nav class="breadcrumb-nav" aria-label="Breadcrumb">
				<ol>
					<li><a href={resolve('/')}>Home</a></li>
					<li aria-current="page">Contact</li>
				</ol>
			</nav>
			<span class="section-kicker">Member Support &amp; Desk Inquiries</span>
			<h1 id="contact-h1" class="hero-h1">Contact Our Trading Desk</h1>
			<p class="lead-copy">
				Reach the Revolution Trading Pros desk for live trading room support, ThinkorSwim and
				TradingView indicator installation help, 1-on-1 mentorship applications, or billing
				assistance.
			</p>
			<p class="meta-byline">
				Reviewed by <a href={resolve('/about')}>Billy Ribeiro</a> • Updated
				<time datetime="2026-10-31">October 31, 2026</time>
			</p>
		</div>
	</section>

	<section class="content-section" aria-labelledby="support-channels-h2">
		<div class="section-header">
			<span class="section-kicker">Direct Desk Channels</span>
			<h2 id="support-channels-h2" class="section-h2">How to Reach Our Team</h2>
		</div>
		<div class="card-grid">
			<article class="info-card">
				<h3>Member &amp; Technical Support</h3>
				<p>
					Need assistance configuring our non-repainting indicators on ThinkorSwim or TradingView,
					or accessing your live room dashboard? Email
					<a href="mailto:support@revolutiontradingpros.com">support@revolutiontradingpros.com</a>
					during market hours (Monday–Friday, 8:30 AM – 5:00 PM EST).
				</p>
			</article>
			<article class="info-card">
				<h3>1-on-1 Mentorship Applications</h3>
				<p>
					Private 1-on-1 mentorship with Billy Ribeiro is strictly by application and manual review.
					Review our <a href={resolve('/mentorship')}>1-on-1 Trading Mentorship</a> criteria before submitting
					your trading background.
				</p>
			</article>
			<article class="info-card">
				<h3>Billing, Cancellations &amp; Governance</h3>
				<p>
					Manage subscriptions anytime or review our
					<a href={resolve('/refund-policy')}>Cancellation &amp; Refund Policy</a>,
					<a href={resolve('/editorial-policy')}>Editorial Policy</a>,
					<a href={resolve('/privacy-policy')}>Privacy Policy</a>, and
					<a href={resolve('/terms-of-service')}>Terms of Service</a>.
				</p>
			</article>
		</div>
	</section>

	<aside class="disclaimer-strip" aria-label="Educational risk disclaimer">
		<p>
			<strong>Risk Disclosure:</strong> Revolution Trading Pros provides financial education and market
			research only. Trading stocks, ETFs, and options involves substantial risk of loss and is not suitable
			for every investor. Past performance is not indicative of future results.
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
