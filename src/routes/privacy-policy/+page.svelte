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

<a class="skip" href="#privacy-policy-page">Skip to main content</a>
<Navbar />

<main id="privacy-policy-page" class="inner-page privacy-policy-page">
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true">/</li>
				<li aria-current="page">Privacy Policy</li>
			</ol>
			<p class="breadcrumb-bar__telemetry">
				<span>Data Protection</span> • <span>Zero Third-Party Lead Sales</span>
			</p>
		</div>
	</nav>

	<section class="page-hero" aria-labelledby="privacy-h1">
		<div class="hero-inner">
			<span class="section-kicker">Data Protection &amp; Member Privacy</span>
			<h1 id="privacy-h1" class="hero-h1">Privacy Policy &amp; Data Security</h1>
			<p class="lead-copy">
				{BRAND.name} protects visitor and subscriber privacy and never sells, rents, or brokers personal
				contact data to third-party brokerages, lead lists, or ad networks.
			</p>
			<p class="meta-byline">
				Reviewed by <a href={resolve('/about')}>{BRAND.founder.name}</a> • Effective
				<time datetime="2026-11-16">November 16, 2026</time>
			</p>
		</div>
	</section>

	<section class="content-section" aria-labelledby="data-practices-h2">
		<div class="section-header">
			<span class="section-kicker">Transparency &amp; Security</span>
			<h2 id="data-practices-h2" class="section-h2">How {BRAND.name} Handles Your Information</h2>
		</div>
		<div class="card-grid">
			<article class="info-card">
				<h3>1. Information You Provide</h3>
				<p>
					We collect only the information you voluntarily submit through contact forms, mentorship
					inquiries, email list confirmations, or member account authentication (such as name, email
					address, and session credentials). Interactive public calculators run directly in your
					browser without storing personal brokerage balances on our servers.
				</p>
			</article>
			<article class="info-card">
				<h3>2. Double Opt-In Email &amp; Retention</h3>
				<p>
					When you opt into desk updates or waitlist notifications, we record your email address,
					consent version, request timestamp, and confirmation status using double opt-in
					verification. Unconfirmed requests expire automatically after 30 days, and every outbound
					dispatch includes a one-click unsubscribe link with immediate suppression honoring
					opt-outs, bounces, and complaints.
				</p>
			</article>
			<article class="info-card">
				<h3>3. Cookies, Security &amp; Encryption</h3>
				<p>
					Authenticated sessions use HTTP-only, signed cookies over TLS (`HTTPS`), and rate-limiting
					protections hash transient network identifiers without retaining raw visitor IP logs for
					marketing profiling. When billing processors are active, payment card credentials are
					tokenized directly by PCI-DSS Level 1 processors and never stored on {BRAND.name} databases.
				</p>
			</article>
			<article class="info-card">
				<h3>4. U.S. &amp; Canadian Privacy Rights</h3>
				<p>
					Residents of the United States and Canada (including CCPA/CPRA, Connecticut CTDPA, and
					Canadian PIPEDA jurisdictions) may request data access, correction, or deletion at any
					time via our <a href={resolve('/contact')}>Contact Desk</a>. Also review our
					<a href={resolve('/terms-of-service')}>Terms of Service</a> and
					<a href={resolve('/refund-policy')}>Refund Policy</a>.
				</p>
			</article>
		</div>
	</section>

	<aside class="disclaimer-strip" aria-label="Educational risk disclaimer">
		<p>
			<strong>Privacy &amp; Regulatory Notice:</strong>
			{BRAND.name} is an educational publishing platform, not a registered broker-dealer or investment
			adviser. Trading involves substantial risk of loss.
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
