<script lang="ts">
	import '#lib/styles/inner-page.css';
	import '#lib/styles/prose.css';
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

<a class="skip" href="#blog-category-page">Skip to main content</a>
<Navbar />

<main id="blog-category-page" class="inner-page blog-taxonomy-page">
	<section class="page-hero" aria-labelledby="cat-h1">
		<div class="hero-inner">
			<nav class="taxonomy-breadcrumbs" aria-label="Breadcrumb">
				<ol>
					<li><a href={resolve('/')}>Home</a></li>
					<li><a href={resolve('/blog')}>Blog</a></li>
					<li aria-current="page">{data.category.name}</li>
				</ol>
			</nav>
			<span class="section-kicker">Topic Archive</span>
			<h1 id="cat-h1" class="hero-h1">{data.category.name}</h1>
			{#if data.category.description}
				<p class="hero-sub">{data.category.description}</p>
			{/if}
		</div>
	</section>

	<section class="content-section taxonomy-layout">
		<div class="taxonomy-main">
			{#if data.category.pillarHtml}
				<div class="pillar-intro prose-base">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html data.category.pillarHtml}
				</div>
			{/if}

			<div class="taxonomy-grid">
				{#each data.posts as post, idx (post.id)}
					<PostCard {post} eager={idx === 0} headingLevel="h2" />
				{/each}
			</div>

			{#if data.pagination.totalPages > 1}
				<!-- eslint-disable svelte/no-navigation-without-resolve -- query-string pagination on resolved route -->
				<nav class="pagination-nav" aria-label="Category pagination">
					{#if data.pagination.page > 1}
						<a
							href={`${resolve('/blog/category/[slug]', { slug: data.category.slug })}?page=${data.pagination.page - 1}`}
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
							href={`${resolve('/blog/category/[slug]', { slug: data.category.slug })}?page=${data.pagination.page + 1}`}
							class="page-btn"
						>
							Next Page
						</a>
					{/if}
				</nav>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			{/if}
		</div>

		<aside class="taxonomy-sidebar" aria-label="Categories navigation">
			<h2 class="sidebar-h2">Categories</h2>
			<ul class="sidebar-list">
				{#each data.sidebarCategories as cat (cat.id)}
					<li>
						<a
							href={resolve('/blog/category/[slug]', { slug: cat.slug })}
							class={['sidebar-link', { 'is-active': cat.id === data.category.id }]}
							aria-current={cat.id === data.category.id ? 'page' : undefined}
						>
							<span>{cat.name}</span>
							<span class="sidebar-count">{cat.postCount}</span>
						</a>
					</li>
				{/each}
			</ul>
			<a href={resolve('/blog')} class="back-all-link">All Blog Articles</a>
		</aside>
	</section>
</main>

<Footer />

<style>
	.hero-inner {
		max-width: 820px;
		margin: 0 auto;
	}

	.taxonomy-breadcrumbs ol {
		display: flex;
		gap: 0.5rem;
		list-style: none;
		padding: 0;
		margin: 0 0 0.75rem;
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--muted);
	}

	.taxonomy-breadcrumbs li + li::before {
		content: '/';
		margin-right: 0.5rem;
	}

	.taxonomy-breadcrumbs a {
		color: var(--muted);
		text-decoration: none;
	}

	.hero-sub {
		color: var(--muted);
		font-size: 1.05rem;
		line-height: 1.6;
		margin-top: 0.75rem;
	}

	.taxonomy-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 280px;
		gap: 2.5rem;
		align-items: start;
	}

	.pillar-intro {
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: var(--panel);
		border: 1px solid var(--line);
		border-radius: 12px;
	}

	.taxonomy-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.taxonomy-sidebar {
		background: var(--panel);
		border: 1px solid var(--line);
		border-radius: 12px;
		padding: 1.25rem;
	}

	.sidebar-h2 {
		margin: 0 0 0.85rem;
		font-family: var(--font-display);
		font-size: 1.05rem;
	}

	.sidebar-list {
		list-style: none;
		padding: 0;
		margin: 0 0 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.sidebar-link {
		display: flex;
		justify-content: space-between;
		padding: 0.45rem 0.65rem;
		border-radius: 7px;
		color: var(--muted);
		text-decoration: none;
		font-size: 0.88rem;
	}

	.sidebar-link.is-active,
	.sidebar-link:hover {
		background: rgba(220, 255, 101, 0.14);
		color: var(--acid);
		font-weight: 700;
	}

	.back-all-link {
		display: block;
		text-align: center;
		padding-top: 0.75rem;
		border-top: 1px solid var(--line);
		color: var(--acid);
		text-decoration: none;
		font-size: 0.84rem;
		font-weight: 700;
	}

	.pagination-nav {
		margin-top: 2rem;
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
		font-size: 0.86rem;
	}

	.page-indicator {
		font-family: var(--font-mono);
		font-size: 0.82rem;
		color: var(--muted);
	}

	@media (max-width: 960px) {
		.taxonomy-layout {
			grid-template-columns: 1fr;
		}
	}
</style>
