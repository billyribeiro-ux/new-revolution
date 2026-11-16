<script lang="ts">
	import { resolve } from '$app/paths';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import { BRAND } from '#lib/config/brand.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
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
				<span>Billing Governance</span> • <span>Transparent Cancellation Rules</span>
			</p>
		</div>
	</nav>

	<section class="page-hero" aria-labelledby="refund-h1">
		<div class="hero-inner">
			<span class="section-kicker">Subscription &amp; Digital Access Governance</span>
			<h1 id="refund-h1" class="hero-h1">Cancellation &amp; Refund Policy</h1>
			<p class="lead-copy">
				{BRAND.name} maintains transparent, plain-English billing and cancellation standards across all
				digital trading rooms, alert services, educational courses, and selective 1-on-1 mentorship enrollments.
			</p>
			<p class="meta-byline">
				Published by <a href={resolve('/about')}>{BRAND.founder.name}</a> • Effective
				<time datetime="2026-11-16">November 16, 2026</time>
			</p>
		</div>
	</section>

	<section class="content-section" aria-labelledby="refund-terms-h2">
		<div class="section-header">
			<span class="section-kicker">Clear Member Terms</span>
			<h2 id="refund-terms-h2" class="section-h2">
				Subscription Cancellation, Digital Delivery &amp; Billing Support
			</h2>
		</div>
		<div class="card-grid">
			<article class="info-card">
				<h3>1. Self-Service Subscription Cancellation</h3>
				<p>
					Recurring memberships for Live Trading Rooms and Alert Services may be canceled prior to
					the next billing renewal cycle without penalty or lock-in contracts. Upon cancellation,
					member access remains active through the end of the current paid billing period and no
					subsequent renewal charges are processed.
				</p>
			</article>
			<article class="info-card">
				<h3>2. Immediate Digital Delivery &amp; Proration</h3>
				<p>
					Because live market broadcasts, proprietary video watchlists, and on-demand curriculum
					modules deliver immediate proprietary educational content upon access, completed billing
					cycles and downloaded digital coursework are non-refundable unless required by applicable
					U.S. state or Canadian provincial consumer protection statutes.
				</p>
			</article>
			<article class="info-card">
				<h3>3. Billing Verification &amp; Desk Support</h3>
				<p>
					While direct checkout gates remain paused prior to scheduled enrollment windows, no card
					charges or deposits are collected on {BRAND.name}. If you ever have a billing question,
					duplicate charge inquiry, or unrecognized payment request, contact our support team
					directly via the <a href={resolve('/contact')}>Contact Desk</a>. See also our
					<a href={resolve('/terms-of-service')}>Terms of Service</a> and
					<a href={resolve('/privacy-policy')}>Privacy Policy</a>.
				</p>
			</article>
		</div>
	</section>

	<aside class="disclaimer-strip" aria-label="Educational risk disclaimer">
		<p>
			<strong>Billing &amp; Risk Notice:</strong> Review our
			<a href={resolve('/terms-of-service')}>Terms of Service</a> and
			<a href={resolve('/risk-disclosure')}>Risk Disclosure</a> prior to any enrollment. Trading involves
			substantial risk of loss.
		</p>
	</aside>
</main>

<Footer />

<style>
	.meta-byline {
		margin-top: 1rem;
		font-size: var(--step-body-sm);
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
