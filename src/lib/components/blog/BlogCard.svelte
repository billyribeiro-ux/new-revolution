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

	/** Scrim opacity behind the text. Every value keeps white text >= 4.5:1 even over a white image. */
	const SCRIM = { soft: 0.72, standard: 0.86, strong: 0.94 } as const;
	const ACCENT = { acid: 'var(--acid)', acid2: 'var(--acid2)', coral: 'var(--coral)' } as const;

	// `/blogs/[slug]` is a planned route that does not exist yet, so the typed overload is not available;
	// the cast is contained here and goes away when the route is built.
	const href = $derived(resolve(`/blogs/${post.slug}` as '/'));

	// Per-card tuning -> the shell's custom properties.
	const style = $derived(
		[
			`--card-scrim: ${SCRIM[post.presentation?.overlay ?? 'standard']}`,
			post.presentation?.focus &&
				`--card-focus: ${post.presentation.focus[0]}% ${post.presentation.focus[1]}%`,
			post.presentation?.accent && `--card-accent: ${ACCENT[post.presentation.accent]}`
		]
			.filter(Boolean)
			.join('; ')
	);
</script>

<CatalogCard
	{...rest}
	{style}
	class={['blog-card', className]}
	{headingLevel}
	featured={post.featured}
	{tone}
	layout="cover"
	ctaLabel="Read"
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
	{/snippet}

	{#snippet eyebrow()}
		<span class="blog-card__category">{post.category}</span>
		{#if post.hasAudio}
			<span class="blog-card__audio">
				<HeadphonesIcon size={14} weight="bold" aria-hidden="true" />
				Audio
			</span>
		{/if}
	{/snippet}

	{#snippet title()}
		<a class="catalog-card__link" {href} itemprop="url">
			<span itemprop="headline">{post.title}</span>
		</a>
	{/snippet}

	<p class="blog-card__excerpt" itemprop="description">{post.excerpt}</p>

	{#snippet footer()}
		<p class="blog-card__meta">
			<span itemprop="author" itemscope itemtype="https://schema.org/Person">
				<span itemprop="name">{BLOG_HUB_AUTHOR.name}</span>
			</span>
			<span aria-hidden="true">•</span>
			<time datetime={post.publishedDate} itemprop="datePublished">{post.publishedDisplay}</time>
			<span aria-hidden="true">•</span>
			<span>{post.readTime}</span>
		</p>
	{/snippet}
</CatalogCard>

<style>
	/* Blog content only; the cover layout, scrims, hover, focus and CTA live in CatalogCard. */
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

	.blog-card__audio {
		border: 1px solid var(--_line-strong);
		color: var(--_text);
	}

	.blog-card__excerpt {
		margin: 0;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		line-clamp: 1;
		overflow: hidden;
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		line-height: 1.5;
		color: var(--_text-2);
	}

	.blog-card__meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 8px;
		margin: 0;
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.75rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--_text-2);
	}

	@media (min-width: 480px) {
		.blog-card__excerpt {
			-webkit-line-clamp: 2;
			line-clamp: 2;
		}
	}

	@media (min-width: 768px) {
		:global(.catalog-card.is-featured) .blog-card__excerpt {
			-webkit-line-clamp: 3;
			line-clamp: 3;
			font-size: 1rem;
		}
	}
</style>
