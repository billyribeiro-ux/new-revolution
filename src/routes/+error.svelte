<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';

	let status = $derived(page.status);
	let heading = $derived(
		status === 404 ? 'Page Not Found' : status === 403 ? 'Access Restricted' : 'Unexpected Error'
	);
	let subtext = $derived(
		status === 404
			? 'The page or resource you requested may have moved, been renamed, or been retired.'
			: status === 403
				? 'This area is restricted to authorized Revolution Trading Pros members or staff.'
				: 'Please try refreshing the page or use the links below to navigate to our active hubs.'
	);
</script>

<a class="skip" href="#error-page">Skip to main content</a>
<Navbar />

<main id="error-page" class="inner-page error-page">
	<section class="content-section error-box" aria-labelledby="error-h1">
		<span class="error-code">HTTP {status}</span>
		<h1 id="error-h1" class="error-h1">{heading}</h1>
		<p class="error-sub">{subtext}</p>

		<div class="error-actions">
			<a href={resolve('/')} class="btn-primary-error">Return to Homepage</a>
			<a href={resolve('/live-trading-rooms/day-trading-room')} class="btn-secondary-error">
				Day Trading Room
			</a>
			<a href={resolve('/blog')} class="btn-secondary-error">Trading Blog</a>
			<a href={resolve('/contact')} class="btn-secondary-error">Contact Support</a>
		</div>
	</section>
</main>

<Footer />

<style>
	.error-box {
		max-width: 680px;
		margin: 4rem auto;
		padding: 2.5rem;
		background: var(--panel);
		border: 1px solid var(--line);
		border-radius: 14px;
		text-align: center;
	}

	.error-code {
		display: inline-block;
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--acid);
		text-transform: uppercase;
		margin-bottom: 0.5rem;
	}

	.error-h1 {
		margin: 0 0 0.75rem;
		font-family: var(--font-display);
		font-size: 2rem;
	}

	.error-sub {
		color: var(--muted);
		line-height: 1.6;
		margin-bottom: 1.75rem;
	}

	.error-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.75rem;
	}

	.btn-primary-error,
	.btn-secondary-error {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 40px;
		padding: 0.6rem 1.15rem;
		border-radius: 8px;
		font-weight: 700;
		text-decoration: none;
	}

	.btn-primary-error {
		background: var(--acid);
		color: var(--ink);
	}

	.btn-secondary-error {
		background: var(--bg-soft);
		color: var(--text);
		border: 1px solid var(--line-strong);
	}
</style>
