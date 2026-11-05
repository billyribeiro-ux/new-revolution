<script lang="ts">
	import '#lib/styles/inner-page.css';
	import { resolve } from '$app/paths';
	import { pageHref } from '#lib/shared/blog/pagination';
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
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true">/</li>
				<li aria-current="page">Blog</li>
			</ol>
		</div>
	</nav>

	<section class="section page-hero blog-hero" aria-labelledby="blog-index-h1">
		<div class="container hero-inner">
			<div class="hero-copy">
				<span class="section-kicker">Market Intelligence &amp; Research</span>
				<h1 id="blog-index-h1" class="hero-h1">Institutional Stock &amp; Options Trading Blog</h1>
				<p class="hero-sub">
					Explore market structure, options and risk management with
					<a href={resolve('/about')}>Billy Ribeiro</a> and the Revolution Trading Pros desk.
				</p>
			</div>

			<div class="hero-tools">
				<div class="journal-index">
					<span class="journal-index-label">The research journal</span>
					<span class="journal-count"
						>{data.pagination.total}
						{data.pagination.total === 1 ? 'article' : 'articles'}{data.search
							? ' found'
							: ''}</span
					>
				</div>
				<form method="GET" action={resolve('/blog')} class="blog-search-form" role="search">
					<label for="blog-search-input" class="search-label">Search the journal</label>
					<div class="search-controls">
						<input
							id="blog-search-input"
							type="search"
							name="search"
							value={data.search}
							placeholder="Search by keyword"
							class="blog-search-input"
						/>
						<button type="submit" class="blog-search-btn">Search</button>
					</div>
				</form>
			</div>
		</div>
	</section>

	<section class="section content-section blog-library" aria-label="Blog navigation and articles">
		<div class="container">
			<div class="library-toolbar">
				<span class="toolbar-label">Browse by topic</span>
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
			</div>

			{#if data.featuredPosts.length > 0}
				<section class="featured-section" aria-labelledby="featured-articles-heading">
					<div class="section-title-row">
						<div>
							<p class="section-overline">From the journal</p>
							<h2 id="featured-articles-heading" class="section-h2">Featured Article</h2>
						</div>
						<span class="section-index" aria-hidden="true">01 / FEATURED</span>
					</div>
					<div class="featured-grid">
						{#each data.featuredPosts as post, idx (post.id)}
							<PostCard {post} eager={idx === 0} headingLevel="h3" lead />
						{/each}
					</div>
				</section>
				<hr class="blog-divider" />
			{/if}

			<section class="all-articles-section" aria-labelledby="all-articles-heading">
				<div class="section-title-row">
					<div>
						<p class="section-overline">Keep exploring</p>
						<h2 id="all-articles-heading" class="section-h2">
							{data.search
								? `Search Results for "${data.search}"`
								: data.featuredPosts.length > 0
									? 'More Articles'
									: 'All Articles'}
						</h2>
					</div>
					<span class="section-index" aria-hidden="true"
						>{data.featuredPosts.length > 0 ? '02' : '01'} / ARTICLES</span
					>
				</div>

				{#if data.posts.length === 0}
					<div class="empty-blog-box">
						<p>
							{data.featuredPosts.length > 0
								? 'More articles will appear here once published.'
								: 'No published articles match your query yet.'}
						</p>
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
					<nav class="pagination-nav" aria-label="Blog pagination">
						{#if data.pagination.page > 1}
							<a
								href={resolve(
									pageHref(
										'/blog',
										data.pagination.page - 1,
										data.search ? { search: data.search } : {}
									)
								)}
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
								href={resolve(
									pageHref(
										'/blog',
										data.pagination.page + 1,
										data.search ? { search: data.search } : {}
									)
								)}
								class="page-btn"
							>
								Next Page
							</a>
						{/if}
					</nav>
				{/if}
			</section>
		</div>
	</section>
</main>

<Footer />

<style>
	.blog-hero {
		padding-block: clamp(3.5rem, 6vw, 5.5rem) clamp(2.5rem, 4vw, 3.5rem);
	}

	.hero-inner {
		display: grid;
		gap: 2.5rem;
		align-items: end;
	}

	.hero-copy {
		min-inline-size: 0;
	}

	.hero-copy .hero-h1 {
		max-inline-size: 17ch;
		margin-block: 0.65rem 1rem;
	}

	.hero-sub {
		max-inline-size: 62ch;
		margin: 0;
		color: var(--text-secondary);
		font-size: clamp(1.05rem, 1.2vw, 1.18rem);
		line-height: 1.6;
	}

	.hero-sub a {
		color: var(--text);
		text-underline-offset: 0.2em;
	}
	.hero-sub a:hover {
		color: var(--acid);
	}

	.hero-tools {
		min-inline-size: 0;
		padding: clamp(1.25rem, 2.2vw, 2rem);
		border: 1px solid var(--line-strong);
		background: var(--panel);
	}

	.journal-index {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		padding-block-end: 1rem;
		border-block-end: 1px solid var(--line-strong);
	}

	.journal-index-label,
	.toolbar-label,
	.section-overline {
		font-family: var(--font-display);
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		line-height: 1.4;
		text-transform: uppercase;
	}

	.journal-index-label,
	.section-overline {
		color: var(--acid);
	}
	.journal-count,
	.section-index {
		color: var(--muted);
		font-family: var(--font-mono);
		font-size: 0.75rem;
	}
	.blog-search-form {
		margin-block-start: 1.25rem;
	}
	.search-label {
		display: block;
		margin-block-end: 0.5rem;
		color: var(--text);
		font-size: 0.9rem;
		font-weight: 700;
	}
	.search-controls {
		display: flex;
		gap: 0.5rem;
	}
	.blog-search-input {
		min-width: 0;
		flex: 1;
		padding: 0.75rem 0.9rem;
		background: var(--bg);
		border: 1px solid var(--line-strong);
		color: var(--text);
		font-family: var(--font-sans);
		font-size: 1rem;
	}
	.blog-search-btn {
		min-block-size: 48px;
		padding: 0.7rem 1.25rem;
		background: var(--acid);
		color: var(--ink);
		font-family: var(--font-sans);
		font-weight: 700;
		border: 1px solid var(--acid);
		cursor: pointer;
	}
	.blog-search-btn:hover {
		background: var(--btn-acid-hover);
	}

	.blog-library {
		padding-block: 0 clamp(4rem, 7vw, 6rem);
	}
	.library-toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 1.25rem;
		padding-block: 1.25rem;
		border-block: 1px solid var(--line);
	}
	.toolbar-label {
		color: var(--muted);
	}
	.category-pill-nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.category-pill {
		display: inline-flex;
		align-items: center;
		min-block-size: 44px;
		padding: 0.45rem 0.9rem;
		border: 1px solid var(--line-strong);
		color: var(--text-secondary);
		text-decoration: none;
		font-size: 0.85rem;
		font-weight: 700;
	}
	.category-pill.is-active,
	.category-pill:hover {
		background: var(--acid);
		color: var(--ink);
		border-color: var(--acid);
	}

	.featured-section {
		margin-block-start: clamp(2.5rem, 5vw, 4.25rem);
	}
	.section-title-row {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 1rem;
	}
	.section-overline {
		margin: 0 0 0.55rem;
	}
	.section-title-row > div {
		min-width: 0;
	}

	.section-title-row .section-h2 {
		margin: 0;
		overflow-wrap: anywhere;
	}
	.section-index {
		padding-block-end: 0.3rem;
		white-space: nowrap;
	}
	.featured-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		margin-top: 1.5rem;
	}
	.articles-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
		gap: 1.5rem;
		margin-top: 1.5rem;
	}
	.blog-divider {
		border: none;
		border-top: 1px solid var(--line);
		margin: clamp(2.5rem, 5vw, 4rem) 0;
	}
	.empty-blog-box {
		padding-block: 1.5rem;
		border-block-end: 1px solid var(--line);
		color: var(--text-secondary);
		margin-top: 0.5rem;
	}
	.empty-blog-box p {
		margin: 0;
	}
	.reset-search-link {
		display: inline-block;
		margin-top: 0.75rem;
		color: var(--acid);
		font-weight: 700;
	}

	@media (min-width: 900px) {
		.hero-inner {
			grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.7fr);
			gap: clamp(3rem, 7vw, 7rem);
		}
	}

	@media (max-width: 479px) {
		.section-index {
			display: none;
		}
		.journal-index {
			flex-wrap: wrap;
		}
		.search-controls {
			flex-wrap: wrap;
		}
		.blog-search-input {
			flex-basis: 10rem;
		}
	}

	.pagination-nav {
		margin-top: 2.5rem;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}

	.page-btn {
		display: inline-flex;
		align-items: center;
		min-block-size: 44px;
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
</style>
