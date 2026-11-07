<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowUpRightIcon from 'phosphor-svelte/lib/ArrowUpRightIcon';
	import PostCard from '#lib/components/blog/PostCard.svelte';
	import { homeBlogPageHref, type BlogListing } from '#lib/shared/blog/discovery';

	interface Props {
		listing: BlogListing;
		unavailable?: boolean;
	}

	let { listing, unavailable = false }: Props = $props();
	let regularTotal = $derived(Math.max(0, listing.pagination.total - 1));
</script>

<section class="section blog" id="blog" aria-labelledby="blog-title">
	<div class="container">
		<div class="blog-header">
			<div class="section-heading">
				<div class="eyebrow dark">MARKET INTELLIGENCE / FREE EDUCATION</div>
				<h2 id="blog-title">
					The latest from <span class="manifesto-accent">our desk.</span>
				</h2>
				<p class="copy dark">
					Stock and options breakdowns, small-account risk management, and practical trade planning
					for working professionals.
				</p>
			</div>
			<a href={resolve('/blog')} class="btn btn-outline-dark">
				<span>See All Blogs</span>
				<span class="arrow" aria-hidden="true">
					<ArrowUpRightIcon size={16} weight="bold" />
				</span>
			</a>
		</div>

		{#if unavailable}
			<p class="blog-empty" role="status">
				Articles are temporarily unavailable. Please try again later.
			</p>
		{:else if listing.pagination.total === 0}
			<p class="blog-empty">Articles will appear here once published.</p>
		{:else}
			{#each listing.featuredPosts as post (post.id)}
				<div class="blog-featured" data-testid="home-featured-post">
					<p class="blog-featured-label">Featured article</p>
					<PostCard
						{post}
						tone="light"
						lead
						sizes="(min-width: 48rem) min(37.5rem, 50vw), min(75rem, 100vw)"
					/>
				</div>
			{/each}

			{#if listing.posts.length > 0}
				<p class="blog-count">Showing {listing.posts.length} of {regularTotal} more articles</p>
				<div class="blog-articles" aria-label="More articles">
					{#each listing.posts as post (post.id)}<PostCard {post} tone="light" />{/each}
				</div>
			{/if}

			{#if listing.pagination.totalPages > 1}
				<nav class="blog-pagination" aria-label="Homepage blog pagination">
					{#if listing.pagination.page > 1}
						<a
							class="blog-page-link"
							href={resolve(homeBlogPageHref('/', listing.pagination.page - 1))}
						>
							Newer articles
						</a>
					{/if}
					<span class="blog-page-status">
						Page {listing.pagination.page} of {listing.pagination.totalPages}
					</span>
					{#if listing.pagination.page < listing.pagination.totalPages}
						<a
							class="blog-page-link"
							href={resolve(homeBlogPageHref('/', listing.pagination.page + 1))}
						>
							Older articles
						</a>
					{/if}
				</nav>
			{/if}
		{/if}
	</div>
</section>

<style>
	.blog {
		background: var(--off);
		color: var(--ink);
	}

	.blog-header {
		display: block;
		margin-block-end: 45px;
	}

	.blog-header .section-heading {
		margin: 0;
	}

	.blog-header .btn {
		flex: none;
		margin-block-start: 23px;
	}

	.blog-featured {
		margin-block-end: 32px;
		max-inline-size: 75rem;
	}

	.blog-count {
		color: var(--lightmuted);
		font-size: 0.875rem;
		margin-block: 0 1rem;
	}
	.blog-articles {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
	}
	.blog-articles :global(.blog-post-card) {
		flex: 1 1 20rem;
		min-inline-size: min(100%, 20rem);
		max-inline-size: 25rem;
	}

	.blog-featured-label {
		color: var(--acid-text-on-light);
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 0.8125rem;
		line-height: 1.5rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		margin: 0 0 12px;
	}

	.blog-empty {
		padding: 32px;
		border: 1px solid var(--card-light-border);
		color: var(--lightmuted);
		line-height: 1.5rem;
	}

	.blog-pagination {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 12px 24px;
		margin-block-start: 32px;
	}

	.blog-page-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-block-size: 44px;
		padding: 8px 16px;
		border: 1px solid var(--btn-outline-light-border);
		color: var(--ink);
		font-weight: 700;
		text-decoration: none;
	}

	.blog-page-link:focus-visible {
		outline-color: var(--acid-text-on-light);
	}

	.blog-page-status {
		color: var(--lightmuted);
		font-size: 0.875rem;
	}

	@media (min-width: 640px) {
		.blog-header {
			display: flex;
			justify-content: space-between;
			align-items: end;
			gap: 35px;
		}

		.blog-header .btn {
			margin-block-start: 0;
		}
	}
</style>
