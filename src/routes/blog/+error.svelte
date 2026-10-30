<script lang="ts">
	import '#lib/styles/inner-page.css';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';

	let status = $derived(page.status);
	let heading = $derived(
		status === 404
			? 'Article not found'
			: status === 403
				? "This post isn't available"
				: 'Something went wrong on our end'
	);
	let subtext = $derived(
		status === 404
			? 'The article or archive you requested may have moved or been unpublished.'
			: status === 403
				? 'This article is restricted to authorized members or editors.'
				: 'Please try refreshing the page or return to the blog index in a moment.'
	);
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<a class="skip" href="#blog-error-page">Skip to main content</a>
<Navbar />

<main id="blog-error-page" class="inner-page blog-error-page">
	<section class="content-section error-box" aria-labelledby="error-h1">
		<span class="error-code">HTTP {status}</span>
		<h1 id="error-h1" class="error-h1">{heading}</h1>
		<p class="error-sub">{subtext}</p>

		<form method="GET" action={resolve('/blog')} class="error-search" role="search">
			<label for="error-search-input" class="sr-only">Search the blog</label>
			<input
				id="error-search-input"
				type="search"
				name="search"
				placeholder="Search articles..."
				class="error-search-input"
			/>
			<button type="submit" class="error-search-btn">Search</button>
		</form>

		<div class="error-actions">
			<a href={resolve('/blog')} class="btn-back-blog">Back to all articles</a>
		</div>
	</section>
</main>

<Footer />

<style>
	.error-box {
		max-width: 620px;
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
		margin-bottom: 1.5rem;
	}

	.error-search {
		display: flex;
		max-width: 420px;
		margin: 0 auto 1.5rem;
		gap: 0.5rem;
	}

	.error-search-input {
		flex: 1;
		padding: 0.6rem 0.85rem;
		border-radius: 8px;
		background: var(--bg-soft);
		border: 1px solid var(--line-strong);
		color: var(--text);
		font-family: var(--font-sans);
	}

	.error-search-btn {
		padding: 0.6rem 1.1rem;
		border-radius: 8px;
		background: var(--acid);
		color: var(--ink);
		font-weight: 700;
		border: none;
		cursor: pointer;
	}

	.btn-back-blog {
		color: var(--acid);
		font-weight: 700;
		text-decoration: none;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
