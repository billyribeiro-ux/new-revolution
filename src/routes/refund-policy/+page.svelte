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
				<span>Transparent Billing</span> • <span>One-Click Self-Service Cancellation</span>
			</p>
		</div>
	</nav>

	<section class="page-hero" aria-labelledby="refund-h1">
		<div class="hero-inner">
			<span class="section-kicker">Transparent Billing &amp; Self-Service Cancellation</span>
			<h1 id="refund-h1" class="hero-h1">Cancellation &amp; Refund Policy</h1>
			<p class="lead-copy">
				We put people over profits. Every recurring membership and alert service includes one-click
				self-service cancellation with zero hidden lock-ins or retention traps.
			</p>
			<p class="meta-byline">
				Reviewed by <a href={resolve('/about')}>Billy Ribeiro</a> • Effective
				<time datetime="2026-10-31">October 31, 2026</time>
			</p>
		</div>
	</section>

	<section class="content-section" aria-labelledby="refund-terms-h2">
		<div class="section-header">
			<span class="section-kicker">Clear Member Terms</span>
			<h2 id="refund-terms-h2" class="section-h2">Subscription &amp; Digital Software Terms</h2>
		</div>
		<div class="card-grid">
			<article class="info-card">
				<h3>1. Recurring Rooms &amp; Watchlist Alerts</h3>
				<p>
					You may cancel any monthly, quarterly, or annual membership (including the Day Trading
					Room, Swing Trading Room, Small Accounts Room, SPX Profit Pulse, and
					<a href={resolve('/sunday-alpha-alerts')}>Sunday Alpha Alerts</a>) at any time prior to
					your next billing date. Access continues through the end of your paid billing period.
				</p>
			</article>
			<article class="info-card">
				<h3>2. Digital Courses &amp; Non-Repainting Scripts</h3>
				<p>
					Because our <a href={resolve('/store/courses')}>Trading Courses</a>,
					<a href={resolve('/store/indicators')}>Custom Indicators</a>, and
					<a href={resolve('/store/scanners')}>Institutional Scanners</a> deliver immediate, downloadable
					proprietary source code and lifetime on-demand video modules upon enrollment, all digital software
					and course sales are final once accessed.
				</p>
			</article>
			<article class="info-card">
				<h3>3. Billing Support &amp; Dispute Resolution</h3>
				<p>
					If you experience an accidental duplicate charge or billing error, contact our support
					desk via <a href={resolve('/contact')}>Contact</a> within 7 calendar days and we will resolve
					it promptly.
				</p>
			</article>
		</div>
	</section>

	<aside class="disclaimer-strip" aria-label="Educational risk disclaimer">
		<p>
			<strong>Billing &amp; Risk Notice:</strong> Review our
			<a href={resolve('/terms-of-service')}>Terms of Service</a> and
			<a href={resolve('/privacy-policy')}>Privacy Policy</a> before enrolling. Trading involves substantial
			risk of loss.
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
