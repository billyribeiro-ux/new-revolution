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
				<span>{BRAND.location.region}</span> • <span>{BRAND.contact.deskHours}</span>
			</p>
		</div>
	</nav>

	<section class="page-hero" aria-labelledby="contact-h1">
		<div class="hero-inner">
			<span class="section-kicker">Member Support, Editorial &amp; Mentorship Desk</span>
			<h1 id="contact-h1" class="hero-h1">Contact {BRAND.name}</h1>
			<p class="lead-copy">
				Reach the {BRAND.name} desk for questions regarding our Live Trading Rooms, SPX Profit Pulse and
				Sunday Alpha Protocol watchlists, 1-on-1 mentorship applications, or primary-source editorial
				feedback across the United States and Canada.
			</p>
			<p class="meta-byline">
				Led by <a href={resolve('/about')}>{BRAND.founder.name}</a> • Desk Hours:
				<span>{BRAND.contact.deskHours}</span> • Updated
				<time datetime="2026-11-16">November 16, 2026</time>
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
				<h3>1. Room, Alert &amp; Calculator Support</h3>
				<p>
					Questions about room schedules, FINRA Rule 4210(d)(2) intraday margin tools, or Options
					Greeks workflows?
					{#if BRAND.contact.email}
						Email <a href="mailto:{BRAND.contact.email}">{BRAND.contact.email}</a>
					{:else}
						Reach our support desk during live U.S. market hours ({BRAND.contact.deskHours})
					{/if}
					{#if BRAND.contact.phone}
						or call <a href="tel:{BRAND.contact.phone}">{BRAND.contact.phone}</a>
					{/if}. Never transmit brokerage passwords, account numbers, or payment card credentials
					over email.
				</p>
			</article>
			<article class="info-card">
				<h3>2. 1-on-1 Mentorship Inquiries</h3>
				<p>
					Private 1-on-1 coaching in <strong>{BRAND.methodology}</strong> is strictly by application
					and selective review. Review full program criteria on our
					<a href={resolve('/mentorship')}>1-on-1 Mentorship</a> page before submitting your trading background
					and risk objectives.
				</p>
			</article>
			<article class="info-card">
				<h3>3. Editorial Corrections &amp; Legal Governance</h3>
				<p>
					To report a primary-source regulatory update or factual correction, review our
					<a href={resolve('/editorial-policy')}>Editorial Policy</a>. For subscriber terms, data
					privacy, and risk disclosures, see our
					<a href={resolve('/terms-of-service')}>Terms of Service</a>,
					<a href={resolve('/privacy-policy')}>Privacy Policy</a>,
					<a href={resolve('/refund-policy')}>Refund Policy</a>, and
					<a href={resolve('/risk-disclosure')}>Risk Disclosure</a>.
				</p>
			</article>
		</div>
	</section>

	<aside class="disclaimer-strip" aria-label="Educational risk disclaimer">
		<p>
			<strong>Risk Disclosure:</strong>
			{BRAND.name} provides impersonal financial education and market-structure research only — never
			personalized investment, legal, or tax advice. Trading stocks, ETFs, and options involves substantial
			risk of loss.
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
