<script lang="ts">
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
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true">/</li>
				<li aria-current="page">Contact</li>
			</ol>
			<p class="breadcrumb-bar__telemetry">
				<span>Project Feedback</span> • <span>Concept in Progress</span>
			</p>
		</div>
	</nav>

	<section class="page-hero" aria-labelledby="contact-h1">
		<div class="hero-inner">
			<span class="section-kicker">Project Feedback &amp; Development Questions</span>
			<h1 id="contact-h1" class="hero-h1">Contact the Project</h1>
			<p class="lead-copy">
				Contact the Revolution Trading Pros project about browser testing, accessibility,
				inaccuracies, or proposed concepts. Purchases, paid subscriptions, and enrollment are
				unavailable.
			</p>
			<p class="meta-byline">
				Published by <a href={resolve('/about')}>Billy Ribeiro</a> • Updated
				<time datetime="2026-11-11">November 11, 2026</time>
			</p>
		</div>
	</section>

	<section class="content-section" aria-labelledby="support-channels-h2">
		<div class="section-header">
			<span class="section-kicker">Direct Desk Channels</span>
			<h2 id="support-channels-h2" class="section-h2">How to Contact the Project</h2>
		</div>
		<div class="card-grid">
			<article class="info-card">
				<h3>Browser Testing &amp; Accuracy Feedback</h3>
				<p>
					Found a broken interaction, accessibility issue, inaccurate statement, or misleading
					example? Email <a href="mailto:support@revolutiontradingpros.com"
						>support@revolutiontradingpros.com</a
					> and describe the page and issue. Do not send account passwords, payment details, or sensitive
					financial records.
				</p>
			</article>
			<article class="info-card">
				<h3>Proposed Products &amp; Mentorship</h3>
				<p>
					The services shown on this site are development concepts. We are not accepting enrollment,
					orders, deposits, or payments. Questions and feedback are welcome, but contacting us does
					not reserve access or create an advisory or mentorship relationship.
				</p>
			</article>
			<article class="info-card">
				<h3>Development Information &amp; Privacy</h3>
				<p>
					Review our <a href={resolve('/terms-of-service')}>development terms and AI disclosures</a
					>, <a href={resolve('/refund-policy')}>purchase availability notice</a>,
					<a href={resolve('/editorial-policy')}>Editorial Policy</a>, and
					<a href={resolve('/privacy-policy')}>Privacy Policy</a>. Any development email signup is
					separate from paid subscriptions.
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
