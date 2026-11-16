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
				<span>Commercial Publisher Terms</span> •
				<span>U.S. &amp; Canadian Regulatory Governance</span>
			</p>
		</div>
	</nav>

	<section class="page-hero" aria-labelledby="terms-h1">
		<div class="hero-inner">
			<span class="section-kicker">Subscriber &amp; Visitor Agreement</span>
			<h1 id="terms-h1" class="hero-h1">Terms of Service &amp; User Agreement</h1>
			<p class="lead-copy">
				These Terms of Service govern your access to {BRAND.name}, including our public options and
				FINRA Rule 4210 calculators, market-structure research, live trading rooms, video alert
				blueprints, and mentorship programs across the United States and Canada.
			</p>
			<p class="meta-byline">
				Published by <a href={resolve('/about')}>{BRAND.founder.name}</a> • Effective
				<time datetime="2026-11-16">November 16, 2026</time>
			</p>
		</div>
	</section>

	<section class="content-section" aria-labelledby="terms-sections-h2">
		<div class="section-header">
			<span class="section-kicker">U.S. &amp; Canadian Regulatory Scope</span>
			<h2 id="terms-sections-h2" class="section-h2">
				Educational Publisher Scope, Intellectual Property &amp; Risk Allocation
			</h2>
		</div>
		<div class="card-grid">
			<article class="info-card">
				<h3>1. Impersonal Educational Publisher Status</h3>
				<p>
					{BRAND.name} operates exclusively as an impersonal financial trading education and market-structure
					research publisher under 15 U.S.C. § 80b-2(a)(11)(D) and comparable Canadian provincial securities
					exemptions. {BRAND.name} is not registered as a broker-dealer, investment adviser, or futures
					commission merchant with the SEC, FINRA, CFTC, or Canadian CSA/CIRO regulators. Nothing on this
					platform constitutes personalized investment, legal, or tax advice.
				</p>
			</article>
			<article class="info-card">
				<h3>2. Self-Directed Execution &amp; Capital Risk</h3>
				<p>
					Every user remains 100% responsible for their own brokerage orders, strike selection,
					position sizing, and risk controls. Trading equities, sector ETFs, and listed options
					(including 0DTE cash-settled index contracts) involves substantial risk of loss up to or
					exceeding capital committed. Past market calls or ledger outcomes never promise future
					results. Review our <a href={resolve('/risk-disclosure')}>Risk Disclosure</a> before using any
					room, watchlist, or calculator.
				</p>
			</article>
			<article class="info-card">
				<h3>3. Proprietary Methodology &amp; License Restrictions</h3>
				<p>
					All live broadcasts, video watchlists, written research, calculators, and frameworks
					associated with <strong>{BRAND.methodology}</strong> are proprietary intellectual property
					of
					{BRAND.name}. Access is personal and non-transferable; recording, rebroadcasting,
					scraping, or redistributing member room streams or alert dispatches is strictly
					prohibited.
				</p>
			</article>
			<article class="info-card">
				<h3>4. Enrollment Governance, Privacy &amp; Billing</h3>
				<p>
					Member room, alert, and mentorship enrollments are governed by the terms published at
					enrollment activation alongside our <a href={resolve('/privacy-policy')}>Privacy Policy</a
					>
					and <a href={resolve('/refund-policy')}>Cancellation &amp; Refund Policy</a>. For desk
					inquiries or compliance notices, reach our team through the
					<a href={resolve('/contact')}>Contact Desk</a>.
				</p>
			</article>
		</div>
	</section>

	<aside class="disclaimer-strip" aria-label="Educational risk disclaimer">
		<p>
			<strong>Substantial Risk Warning:</strong> Never trade with capital you cannot afford to lose. Past
			performance of any trading system or methodology is not indicative of future results.
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
