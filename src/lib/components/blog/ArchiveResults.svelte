<script lang="ts">
	import { resolve } from '$app/paths';

	import type { BlogListing } from '#lib/shared/blog/discovery';
	import { archiveHref } from './archive';
	import type { ArchivePath } from './archive';
	import PostCard from './PostCard.svelte';

	interface Props {
		listing: BlogListing;
		basePath: ArchivePath;
	}
	let { listing, basePath }: Props = $props();
	const uid = $props.id();
	let remainderTotal = $derived(
		Math.max(0, listing.pagination.total - listing.featuredPosts.length)
	);
</script>

<div class="archive-results">
	{#if listing.featuredPosts.length}
		<section class="featured-section" aria-labelledby={`${uid}-featured`}>
			<h2 id={`${uid}-featured`}>Featured article</h2>
			<div class="featured-grid">
				{#each listing.featuredPosts as post, i (post.id)}<PostCard
						{post}
						lead
						eager={i === 0}
					/>{/each}
			</div>
		</section>
	{/if}
	{#if !listing.featuredPosts.length || remainderTotal > 0}
		<section class="articles-section" aria-labelledby={`${uid}-articles`}>
			<div class="results-heading">
				<h2 id={`${uid}-articles`}>
					{listing.search
						? `Results for “${listing.search}”`
						: listing.featuredPosts.length
							? 'More articles'
							: 'Articles'}
				</h2>
				<p role="status">
					{remainderTotal}
					{remainderTotal === 1 ? 'article' : 'articles'}{listing.search ? ' found' : ''}
				</p>
			</div>
			{#if listing.posts.length}
				<div class={['articles-grid', { 'is-single': listing.posts.length === 1 }]}>
					{#each listing.posts as post, i (post.id)}<PostCard
							{post}
							lead={listing.posts.length === 1}
							eager={!listing.featuredPosts.length && i === 0}
						/>{/each}
				</div>
			{:else}
				<div class="archive-empty">
					<p>
						{listing.search
							? 'No published articles match this search.'
							: listing.featuredPosts.length
								? 'More articles will appear here once published.'
								: 'Articles will appear here once published.'}
					</p>
					{#if listing.search}<a href={resolve(archiveHref(basePath))}
							>Clear search and browse this archive</a
						>{/if}
				</div>
			{/if}
			{#if listing.pagination.totalPages > 1}
				<nav class="pagination-nav" aria-label="Blog pagination">
					{#if listing.pagination.page > 1}<a
							href={resolve(archiveHref(basePath, listing.pagination.page - 1, listing.search))}
							>Previous page</a
						>{/if}
					<span>Page {listing.pagination.page} of {listing.pagination.totalPages}</span>
					{#if listing.pagination.page < listing.pagination.totalPages}<a
							href={resolve(archiveHref(basePath, listing.pagination.page + 1, listing.search))}
							>Next page</a
						>{/if}
				</nav>
			{/if}
		</section>
	{/if}
</div>

<style>
	.archive-results {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		min-inline-size: 0;
		gap: 3rem;
	}
	h2 {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.35rem, 2vw, 1.8rem);
		overflow-wrap: anywhere;
	}
	.featured-grid,
	.articles-grid {
		margin-block-start: 1.25rem;
	}
	.featured-grid,
	.articles-grid.is-single {
		display: grid;
		max-inline-size: 75rem;
	}
	.articles-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		align-items: stretch;
	}
	.articles-grid:not(.is-single) :global(.blog-post-card) {
		flex: 1 1 20rem;
		min-inline-size: min(100%, 20rem);
		max-inline-size: 25rem;
	}
	.articles-grid.is-single {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}
	.results-heading {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.5rem 1.5rem;
	}
	.results-heading p {
		color: var(--muted);
		margin: 0;
		font-size: 0.9rem;
	}
	.archive-empty {
		padding-block: 1.25rem;
		border-block-end: 1px solid var(--line);
		color: var(--text-secondary);
	}
	.archive-empty p {
		margin: 0;
	}
	.archive-empty a {
		display: inline-flex;
		align-items: center;
		min-block-size: 44px;
		margin-block-start: 0.5rem;
		color: var(--acid);
		font-weight: 700;
	}
	.pagination-nav {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem 1.5rem;
		margin-block-start: 2rem;
	}
	.pagination-nav a {
		display: inline-flex;
		align-items: center;
		min-block-size: 44px;
		padding: 0.5rem 1rem;
		border: 1px solid var(--line-strong);
		color: var(--text);
		font-weight: 700;
	}
	.pagination-nav span {
		color: var(--muted);
		font-size: 0.875rem;
	}
</style>
