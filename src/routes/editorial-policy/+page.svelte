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
			<span class="section-kicker">Research Integrity &amp; YMYL Governance</span>
			<h1 id="editorial-h1" class="hero-h1">Editorial Policy &amp; Standards</h1>
			<p class="lead-copy">
				Every educational guide, options structure breakdown, and market analysis published by
				Revolution Trading Pros follows strict verification, primary-source citation, and risk
				disclosure standards.
			</p>
			<p class="meta-byline">
				Authored by <a href={resolve('/about')}>Billy Ribeiro</a> • Updated
				<time datetime="2026-10-31">October 31, 2026</time>
			</p>
		</div>
	</section>

	<section class="content-section" aria-labelledby="verification-h2">
		<div class="section-header">
			<span class="section-kicker">People Over Profits</span>
			<h2 id="verification-h2" class="section-h2">Our Three Editorial Commitments</h2>
		</div>
		<div class="card-grid">
			<article class="info-card">
				<h3>1. Primary Regulatory &amp; Exchange Sources</h3>
				<p>
					All contract specifications, settlement rules (such as T+1 equity/options settlement and
					European cash settlement on SPX), and tax references cite primary sources including Cboe,
					CME Group, SEC, FINRA, OSC, and IRS Section 1256 documentation.
				</p>
			</article>
			<article class="info-card">
				<h3>2. Asymmetric Risk &amp; Drawdown Transparency</h3>
				<p>
					No strategy, indicator, or alert service is ever presented as a guaranteed return. Every
					case study and setup specifies hard invalidation stop-losses, position-sizing limits, and
					realistic drawdown risks for both $500+ small accounts and full-time desks.
				</p>
			</article>
			<article class="info-card">
				<h3>3. Zero Repainting &amp; Reproducible Signals</h3>
				<p>
					Technical claims regarding our <a href={resolve('/store/indicators')}>Custom Indicators</a
					>
					and <a href={resolve('/store/scanners')}>Institutional Scanners</a> require bar-close signal
					permanence with zero historical repainting.
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
