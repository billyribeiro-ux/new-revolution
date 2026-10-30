<script lang="ts">
	import '#lib/styles/inner-page.css';
	import { resolve } from '$app/paths';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import PostCard from '#lib/components/blog/PostCard.svelte';
	import SEO from '#lib/components/blog/SEO.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<SEO schema={data.jsonLdSchema} />

<a class="skip" href="#blog-page">Skip to main content</a>
<Navbar />

<main id="blog-page" class="inner-page blog-index-page">
	<section class="page-hero" aria-labelledby="blog-index-h1">
		<div class="hero-inner">
			<span class="section-kicker">Market Intelligence & Research</span>
			<h1 id="blog-index-h1" class="hero-h1">Institutional Stock & Options Trading Blog</h1>
			<p class="hero-sub">
				In-depth market structure analysis, Options Greeks breakdowns, small-account risk
				management, and execution playbooks authored by the Revolution Trading Pros desk.
			</p>

			<form method="GET" action={resolve('/blog')} class="blog-search-form" role="search">
				<label for="blog-search-input" class="sr-only">Search articles</label>
				<input
					id="blog-search-input"
					type="search"
					name="search"
					value={data.search}
					placeholder="Search articles by keyword..."
					class="blog-search-input"
				/>
				<button type="submit" class="blog-search-btn">Search</button>
			</form>
		</div>
	</section>

	<section class="content-section" aria-label="Blog navigation and articles">
		<nav class="category-pill-nav" aria-label="Blog categories">
			<a href={resolve('/blog')} class="category-pill is-active" aria-current="page">
				All Articles
			</a>
			{#each data.categories as cat (cat.id)}
				<a href={resolve('/blog/category/[slug]', { slug: cat.slug })} class="category-pill">
					{cat.name} ({cat.postCount})
				</a>
			{/each}
		</nav>

		{#if data.featuredPosts.length > 0}
			<section class="featured-section" aria-labelledby="featured-articles-heading">
				<h2 id="featured-articles-heading" class="section-h2">Featured Articles</h2>
				<div class="featured-grid">
					{#each data.featuredPosts as post, idx (post.id)}
						<PostCard {post} eager={idx === 0} headingLevel="h3" />
					{/each}
				</div>
			</section>
			<hr class="blog-divider" />
		{/if}

		<section class="all-articles-section" aria-labelledby="all-articles-heading">
			<h2 id="all-articles-heading" class="section-h2">
				{data.search ? `Search Results for "${data.search}"` : 'All Articles'}
			</h2>

			{#if data.posts.length === 0}
				<div class="empty-blog-box">
					<p>No published articles match your query yet.</p>
					{#if data.search}
						<a href={resolve('/blog')} class="reset-search-link">Clear search filter</a>
					{/if}
				</div>
			{:else}
				<div class="articles-grid">
					{#each data.posts as post, idx (post.id)}
						<PostCard
							{post}
							eager={data.featuredPosts.length === 0 && idx === 0}
							headingLevel="h3"
						/>
					{/each}
				</div>
			{/if}

			{#if data.pagination.totalPages > 1}
				<!-- eslint-disable svelte/no-navigation-without-resolve -- query-string pagination on resolved route -->
				<nav class="pagination-nav" aria-label="Blog pagination">
					{#if data.pagination.page > 1}
						<a
							href={`${resolve('/blog')}?page=${data.pagination.page - 1}${data.search ? `&search=${encodeURIComponent(data.search)}` : ''}`}
							class="page-btn"
						>
							Previous Page
						</a>
					{/if}
					<span class="page-indicator">
						Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} articles)
					</span>
					{#if data.pagination.page < data.pagination.totalPages}
						<a
							href={`${resolve('/blog')}?page=${data.pagination.page + 1}${data.search ? `&search=${encodeURIComponent(data.search)}` : ''}`}
							class="page-btn"
						>
							Next Page
						</a>
					{/if}
				</nav>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			{/if}
		</section>
	</section>
</main>

<Footer />

<style>
	.hero-inner {
		max-width: 820px;
		margin: 0 auto;
		text-align: center;
	}

	.hero-sub {
		color: var(--muted);
		font-size: 1.05rem;
		line-height: 1.6;
		margin: 0.75rem auto 1.5rem;
	}

	.blog-search-form {
		display: flex;
		max-width: 520px;
		margin: 0 auto;
		gap: 0.5rem;
	}

	.blog-search-input {
		flex: 1;
		padding: 0.65rem 0.9rem;
		border-radius: 8px;
		background: var(--panel);
		border: 1px solid var(--line-strong);
		color: var(--text);
		font-family: var(--font-sans);
		font-size: 0.92rem;
	}

	.blog-search-btn {
		padding: 0.65rem 1.2rem;
		border-radius: 8px;
		background: var(--acid);
		color: var(--ink);
		font-family: var(--font-sans);
		font-weight: 700;
		border: none;
		cursor: pointer;
	}

	.category-pill-nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 2rem;
	}

	.category-pill {
		padding: 0.45rem 0.9rem;
		border-radius: 999px;
		background: var(--panel);
		border: 1px solid var(--line);
		color: var(--muted);
		text-decoration: none;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.category-pill.is-active,
	.category-pill:hover {
		background: var(--acid);
		color: var(--ink);
		border-color: var(--acid);
	}

	.featured-grid,
	.articles-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
		margin-top: 1.25rem;
	}

	.blog-divider {
		border: none;
		border-top: 1px solid var(--line);
		margin: 2.5rem 0;
	}

	.empty-blog-box {
		padding: 2.5rem;
		text-align: center;
		background: var(--panel);
		border: 1px solid var(--line);
		border-radius: 12px;
		color: var(--muted);
		margin-top: 1.25rem;
	}

	.reset-search-link {
		display: inline-block;
		margin-top: 0.75rem;
		color: var(--acid);
		font-weight: 700;
	}

	.pagination-nav {
		margin-top: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}

	.page-btn {
		padding: 0.5rem 1rem;
		border-radius: 8px;
		background: var(--panel);
		border: 1px solid var(--line-strong);
		color: var(--text);
		text-decoration: none;
		font-weight: 600;
		font-size: 0.86rem;
	}

	.page-indicator {
		font-family: var(--font-mono);
		font-size: 0.82rem;
		color: var(--muted);
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
