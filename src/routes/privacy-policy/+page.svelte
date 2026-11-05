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

<a class="skip" href="#privacy-policy-page">Skip to main content</a>
<Navbar />

<main id="privacy-policy-page" class="inner-page privacy-policy-page">
	<section class="page-hero" aria-labelledby="privacy-h1">
		<div class="hero-inner">
			<nav class="breadcrumb-nav" aria-label="Breadcrumb">
				<ol>
					<li><a href={resolve('/')}>Home</a></li>
					<li aria-current="page">Privacy Policy</li>
				</ol>
			</nav>
			<span class="section-kicker">Data Protection &amp; Member Privacy</span>
			<h1 id="privacy-h1" class="hero-h1">Privacy Policy &amp; Data Security</h1>
			<p class="lead-copy">
				Revolution Trading Pros respects your privacy and never sells member personal data to
				third-party brokers, lead lists, or marketing networks.
			</p>
			<p class="meta-byline">
				Reviewed by <a href={resolve('/about')}>Billy Ribeiro</a> • Effective
				<time datetime="2026-11-04">November 4, 2026</time>
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
					We collect only the account information you voluntarily provide when subscribing to our
					trading rooms, alert services, or newsletter (such as name and email address), plus
					privacy-preserving session cookies required for authentication.
				</p>
			</article>
			<article class="info-card">
				<h3>Reopening Waitlist</h3>
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
				<h3>2. Payment Processing &amp; Encryption</h3>
				<p>
					All billing transactions are processed via PCI-DSS Level 1 encrypted payment
					infrastructure (Stripe). Revolution Trading Pros never stores raw credit card numbers on
					our servers.
				</p>
			</article>
			<article class="info-card">
				<h3>3. Your Rights &amp; Contact</h3>
				<p>
					U.S. and Canadian members may request data access, correction, or deletion at any time via
					our <a href={resolve('/contact')}>Contact Desk</a>. See also our
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
