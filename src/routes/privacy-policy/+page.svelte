<script lang="ts">
	import { resolve } from '$app/paths';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
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
				<span>Data Protection</span> • <span>Zero Third-Party Data Sales</span>
			</p>
		</div>
	</nav>

	<section class="page-hero" aria-labelledby="privacy-h1">
		<div class="hero-inner">
			<span class="section-kicker">Data Protection &amp; Development Privacy</span>
			<h1 id="privacy-h1" class="hero-h1">Privacy Policy &amp; Data Security</h1>
			<p class="lead-copy">
				Revolution Trading Pros respects your privacy and never sells personal data to third-party
				brokers, lead lists, or marketing networks.
			</p>
			<p class="meta-byline">
				Reviewed by <a href={resolve('/about')}>Billy Ribeiro</a> • Effective
				<time datetime="2026-11-11">November 11, 2026</time>
			</p>
		</div>
	</section>

	<section class="content-section" aria-labelledby="data-practices-h2">
		<div class="section-header">
			<span class="section-kicker">Transparency &amp; Security</span>
			<h2 id="data-practices-h2" class="section-h2">How We Handle Your Information</h2>
		</div>
		<div class="card-grid">
			<article class="info-card">
				<h3>1. Information We Collect</h3>
				<p>
					We collect information you voluntarily provide through enabled development email signup or
					contact channels, such as an email address. Staff authentication uses session cookies.
					Purchases, paid subscriptions, and paid enrollment are unavailable; no payment card
					information is requested.
				</p>
			</article>
			<article class="info-card">
				<h3>Development Email Updates</h3>
				<p>
					When you request waitlist emails, we store your email address, consent version, request
					date and confirmation status. We first send a thank-you email with a confirmation link.
					After confirmation, the current signup permission covers occasional launch progress
					updates and a reopening notification. Earlier reopening-only permission stays limited to
					the reopening notification. Resend processes these emails on our behalf when email capture
					is enabled. Joining does not create a paid membership or enroll you in an unrelated sales
					sequence.
				</p>
				<p>
					Unconfirmed requests are removed after 30 days. Processed email payloads are removed after
					seven days and delivery metadata after 90 days. We retain confirmed subscriptions until
					the reopening notification or your opt-out. Launch updates use the same subscription and
					do not extend retention beyond reopening. We keep minimal suppression records to respect
					opt-outs, bounces and complaints. Short-lived hashed abuse controls do not retain your raw
					IP address. Every waitlist email includes an unsubscribe link.
				</p>
			</article>
			<article class="info-card">
				<h3>2. No Payment Collection</h3>
				<p>
					Purchases and paid subscriptions have never been made available. We accept no orders,
					payments, deposits, or paid enrollment and do not request payment card details.
					Development email signup does not purchase or reserve access, a price, or a future launch
					date.
				</p>
			</article>
			<article class="info-card">
				<h3>3. Your Rights &amp; Contact</h3>
				<p>
					Visitors may request data access, correction, or deletion at any time via our <a
						href={resolve('/contact')}>Contact Desk</a
					>. See also our
					<a href={resolve('/terms-of-service')}>Terms of Service</a> and
					<a href={resolve('/refund-policy')}>Refund Policy</a>.
				</p>
			</article>
		</div>
	</section>

	<aside class="disclaimer-strip" aria-label="Educational risk disclaimer">
		<p>
			<strong>Privacy &amp; Risk Notice:</strong> Revolution Trading Pros is an educational publishing
			platform, not a registered broker-dealer or investment adviser. Trading involves substantial risk
			of loss.
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
