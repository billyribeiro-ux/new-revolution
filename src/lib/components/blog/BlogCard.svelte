<!-- src/lib/components/blog/BlogCard.svelte -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import HeadphonesIcon from 'phosphor-svelte/lib/HeadphonesIcon';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';
	import CatalogCard from '#lib/components/ui/CatalogCard.svelte';
	import { BLOG_HUB_AUTHOR, type BlogCardPost } from '#lib/data/blog-hub.ts';

	/**
	 * One article in a blog listing, built on the shared CatalogCard shell (whole-card click through the
	 * title link, focus ring, hover, footer CTA, breakpoints). Emits schema.org BlogPosting microdata for
	 * the fields it shows, exactly as the previous hub markup did.
	 * `post.featured` needs a host that gives the card two grid columns from 768px up.
	 * Theming: `--card-accent` on a parent.
	 */
	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'class' | 'title'> {
		post: BlogCardPost;
		headingLevel?: 2 | 3 | 4;
		/** Load the cover eagerly with high priority (use for an above-the-fold card only). */
		eager?: boolean;
		/** `light` for light sections (the /blogs list). */
		tone?: 'dark' | 'light';
		class?: ClassValue;
	}

	let {
		post,
		headingLevel = 3,
		eager = false,
		tone = 'dark',
		class: className,
		...rest
	}: Props = $props();

	// `/blogs/[slug]` is a planned route that does not exist yet, so the typed overload is not available;
	// the cast is contained here and goes away when the route is built.
	const href = $derived(resolve(`/blogs/${post.slug}` as '/'));
	const initials = $derived(
		BLOG_HUB_AUTHOR.name
			.split(' ')
			.map((part) => part[0])
			.join('')
			.slice(0, 2)
	);
</script>

<CatalogCard
	{...rest}
	class={['blog-card', className]}
	{headingLevel}
	featured={post.featured}
	{tone}
	ctaLabel="Read article"
	itemscope
	itemtype="https://schema.org/BlogPosting"
>
	{#snippet media()}
		<img
			class="blog-card__img"
			src={post.image.src}
			alt={post.image.alt}
			width={post.image.width}
			height={post.image.height}
			loading={eager ? 'eager' : 'lazy'}
			fetchpriority={eager ? 'high' : 'auto'}
			decoding="async"
			itemprop="image"
		/>
		<div class="blog-card__badges">
			<span class="blog-card__category">{post.category}</span>
			{#if post.hasAudio}
				<span class="blog-card__audio">
					<HeadphonesIcon size={14} weight="bold" aria-hidden="true" />
					Audio
				</span>
			{/if}
		</div>
	{/snippet}

	{#snippet eyebrow()}
		<time datetime={post.publishedDate} itemprop="datePublished">{post.publishedDisplay}</time>
		<span aria-hidden="true">•</span>
		<span>{post.readTime}</span>
	{/snippet}

	{#snippet title()}
		<a class="catalog-card__link" {href} itemprop="url">
			<span itemprop="headline">{post.title}</span>
		</a>
	{/snippet}

	{#snippet intro()}
		<p class="blog-card__excerpt" itemprop="description">{post.excerpt}</p>
	{/snippet}

	<p class="blog-card__takeaway">
		<strong>Key takeaway</strong>
		{post.keyTakeaway}
	</p>

	{#snippet footer()}
		<div class="blog-card__author" itemprop="author" itemscope itemtype="https://schema.org/Person">
			<span class="blog-card__avatar" aria-hidden="true">{initials}</span>
			<span class="blog-card__author-name" itemprop="name">{BLOG_HUB_AUTHOR.name}</span>
		</div>
	{/snippet}
</CatalogCard>

<style>
	/* Blog content only; layout, hover, focus and the CTA live in CatalogCard. */
	.blog-card__img {
		display: block;
		inline-size: 100%;
		block-size: auto;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		background: var(--bg-soft);
	}

	.blog-card__badges {
		position: absolute;
		inset-block-start: 12px;
		inset-inline: 12px;
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		pointer-events: none;
	}

	.blog-card__category,
	.blog-card__audio {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.blog-card__category {
		background: var(--_accent);
		color: var(--ink);
	}

	/* Sits on the (always dark) cover image, so it keeps fixed dark-surface colors on both tones. */
	.blog-card__audio {
		background: var(--bg);
		color: var(--text);
		border: 1px solid var(--line-strong);
	}

	.blog-card__excerpt {
		margin: 0;
		font-family: var(--font-sans);
		font-size: 1rem;
		line-height: 1.55;
		color: var(--_text);
		text-wrap: pretty;
	}

	.blog-card__takeaway {
		margin: 0;
		padding: 12px 14px;
		border-inline-start: 3px solid var(--_accent);
		background: var(--_inset);
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		line-height: 1.5;
		color: var(--_text-2);
	}

	.blog-card__takeaway strong {
		display: block;
		margin-block-end: 4px;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--_accent-text);
	}

	.blog-card__author {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		min-block-size: 44px;
	}

	.blog-card__avatar {
		display: inline-grid;
		place-items: center;
		inline-size: 38px;
		block-size: 38px;
		border-radius: 50%;
		background: var(--_accent);
		color: var(--ink);
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.04em;
	}

	.blog-card__author-name {
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.875rem;
		color: var(--_text);
	}

	/* Featured: a wider, shorter cover so the lead card does not tower over its row. */
	@media (min-width: 768px) {
		:global(.catalog-card.is-featured) .blog-card__img {
			aspect-ratio: 21 / 9;
		}
	}
</style>
