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
				<span>Primary-Source Verification</span> •
				<span>YMYL Financial Research Standards</span>
			</p>
		</div>
	</nav>

	<section class="page-hero" aria-labelledby="editorial-h1">
		<div class="hero-inner">
			<span class="section-kicker">Financial Research &amp; Verification Charter</span>
			<h1 id="editorial-h1" class="hero-h1">Editorial Policy &amp; Verification Standards</h1>
			<p class="lead-copy">
				Every market-structure playbook, regulatory breakdown, comparison guide, and interactive
				calculator published by {BRAND.name} is governed by strict primary-source verification, CFTC Rule
				4.41 transparency, and practitioner review.
			</p>
			<p class="meta-byline">
				Reviewed by <a href={resolve('/about')}>{BRAND.founder.name}</a> • Updated
				<time datetime="2026-11-16">November 16, 2026</time>
			</p>
		</div>
	</section>

	<section class="content-section" aria-labelledby="verification-h2">
		<div class="section-header">
			<span class="section-kicker">People Over Profits</span>
			<h2 id="verification-h2" class="section-h2">
				Primary Sources, Separation of Commercial &amp; Research Claims, and Corrections
			</h2>
		</div>
		<div class="card-grid">
			<article class="info-card">
				<h3>1. Primary Regulatory &amp; Exchange Citations</h3>
				<p>
					All margin, settlement, options contract, and tax explanations must trace directly to
					primary notices and rulebooks — including FINRA Rule 4210(d)(2) (Regulatory Notice 26-10),
					Cboe SPX/XSP contract specifications, the OCC Options Disclosure Document, and Internal
					Revenue Code Section 1256. Whenever rules update, `dateModified` advances only after human
					fact-checking.
				</p>
			</article>
			<article class="info-card">
				<h3>2. Zero Hindsight Cherry-Picking &amp; CFTC 4.41 Parity</h3>
				<p>
					Illustrative schematics and calculator scenarios are labeled explicitly as educational
					models rather than live fills. Historical dislocation case studies on our
					<a href={resolve('/track-record')}>Public Trade Ledger</a> always carry adjacent non-typicality
					disclosures and retain stopped-out invalidations alongside winning setups.
				</p>
			</article>
			<article class="info-card">
				<h3>3. Objective Comparisons &amp; Rapid Corrections</h3>
				<p>
					Category comparison guides evaluate competitors strictly on verifiable public criteria
					(chart methodology, underlying liquidity, execution format, and small-account suitability)
					without paid placement or undisclosed affiliate bias. To report a factual update or
					request an editorial correction, contact our desk via <a href={resolve('/contact')}
						>Contact Support</a
					>.
				</p>
			</article>
		</div>
	</section>

	<aside class="disclaimer-strip" aria-label="Educational risk disclaimer">
		<p>
			<strong>Editorial Disclosure:</strong> Content published by {BRAND.name} is for educational purposes
			only and does not constitute personalized investment advice. Trading involves substantial risk of
			loss.
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
