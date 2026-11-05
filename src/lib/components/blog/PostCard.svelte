<script lang="ts">
	import { resolve } from '$app/paths';
	import { coverSrcsetFromUrl } from '#lib/shared/cover-srcset';
	import type { BlogCardPost } from '#lib/shared/blog/discovery';

	export type PostCardItem = BlogCardPost;

	interface Props {
		post: PostCardItem;
		eager?: boolean;
		headingLevel?: 'h2' | 'h3';
		tone?: 'dark' | 'light';
		lead?: boolean;
	}

	let { post, eager = false, headingLevel = 'h3', tone = 'dark', lead = false }: Props = $props();

	let srcset = $derived(coverSrcsetFromUrl(post.coverImage));
	let displayDate = $derived(post.publishedAt ?? post.contentUpdatedAt ?? null);
	let formattedDate = $derived(
		displayDate
			? new Date(displayDate).toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric',
					timeZone: 'UTC'
				})
			: ''
	);
</script>

<article
	class={[
		'blog-post-card',
		{
			'is-featured': post.featured,
			'is-light': tone === 'light',
			'is-lead': lead,
			'has-cover': Boolean(post.coverImage)
		}
	]}
	data-post-id={post.id}
>
	{#if post.coverImage}
		<a
			href={resolve('/blog/[slug]', { slug: post.slug })}
			class="card-media-link"
			tabindex="-1"
			aria-hidden="true"
		>
			<img
				src={post.coverImage}
				{srcset}
				sizes={srcset
					? lead
						? '(max-width: 767px) 100vw, 50vw'
						: '(max-width: 640px) 100vw, (max-width: 1080px) 50vw, 400px'
					: undefined}
				alt={post.coverImageAlt || post.title}
				width={post.coverImageWidth || 800}
				height={post.coverImageHeight || 450}
				loading={eager ? 'eager' : 'lazy'}
				fetchpriority={eager ? 'high' : 'auto'}
				decoding="async"
				class="card-cover-img"
			/>
		</a>
	{/if}

	<div class="card-body">
		<div class="card-meta-top">
			{#if post.category}
				<a
					href={resolve('/blog/category/[slug]', { slug: post.category.slug })}
					class="card-category-badge"
				>
					{post.category.name}
				</a>
			{/if}
			{#if post.isPillar}
				<span class="card-pillar-badge">Cornerstone Guide</span>
			{/if}
			{#if post.readingTime}
				<span class="card-reading-time">{post.readingTime} min read</span>
			{/if}
		</div>

		{#if headingLevel === 'h2'}
			<h2 class="card-title">
				<a href={resolve('/blog/[slug]', { slug: post.slug })}>{post.title}</a>
			</h2>
		{:else}
			<h3 class="card-title">
				<a href={resolve('/blog/[slug]', { slug: post.slug })}>{post.title}</a>
			</h3>
		{/if}

		{#if post.excerpt}
			<p class="card-excerpt">{post.excerpt}</p>
		{/if}

		<div class="card-footer">
			<div class="card-byline">
				{#if post.author}
					<span class="card-author">{post.author.name}</span>
				{/if}
				{#if formattedDate}
					<time class="card-date" datetime={new Date(displayDate!).toISOString()}>
						{formattedDate}
					</time>
				{/if}
			</div>
			<a
				href={resolve('/blog/[slug]', { slug: post.slug })}
				class="card-read-link"
				aria-label={`Read Article: ${post.title}`}
			>
				Read Article
			</a>
		</div>
	</div>
</article>

<style>
	.blog-post-card {
		--post-card-bg: var(--panel);
		--post-card-text: var(--text);
		--post-card-muted: var(--muted);
		--post-card-line: var(--line);
		--post-card-line-strong: var(--line-strong);
		--post-card-accent: var(--acid);
		--post-card-inset: var(--bg-soft);
		--post-card-badge: color-mix(in srgb, var(--acid) 12%, transparent);
		display: flex;
		flex-direction: column;
		min-inline-size: 0;
		background: var(--post-card-bg);
		color: var(--post-card-text);
		border: 1px solid var(--post-card-line);
		border-radius: 0;
		overflow: hidden;
		transition:
			border-color 0.2s ease,
			transform 0.2s ease;
	}

	.blog-post-card:hover {
		border-color: var(--post-card-line-strong);
	}

	.blog-post-card.is-featured {
		border-color: color-mix(in srgb, var(--post-card-accent) 45%, var(--post-card-line));
	}

	.blog-post-card.is-light {
		--post-card-bg: var(--card-white);
		--post-card-text: var(--ink);
		--post-card-muted: var(--lightmuted);
		--post-card-line: var(--card-light-border);
		--post-card-line-strong: var(--btn-outline-light-border);
		--post-card-accent: var(--acid-text-on-light);
		--post-card-inset: var(--off2);
		--post-card-badge: var(--off2);
	}

	.blog-post-card :where(a):focus-visible {
		outline-color: var(--post-card-accent);
	}

	.card-media-link {
		display: block;
		aspect-ratio: 16 / 9;
		background: var(--post-card-inset);
		overflow: hidden;
	}

	.card-cover-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.card-body {
		min-inline-size: 0;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		flex: 1;
	}

	.card-meta-top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
	}

	.card-category-badge {
		display: inline-flex;
		align-items: center;
		min-block-size: 44px;
		padding: 0.18rem 0.55rem;
		border-radius: 999px;
		background: var(--post-card-badge);
		color: var(--post-card-accent);
		text-decoration: none;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		overflow-wrap: anywhere;
	}

	.card-pillar-badge {
		padding: 0.18rem 0.55rem;
		border-radius: 999px;
		background: var(--post-card-inset);
		border: 1px solid var(--post-card-line-strong);
		color: var(--post-card-text);
		font-size: 0.75rem;
	}

	.card-reading-time {
		color: var(--post-card-muted);
		margin-left: auto;
	}

	.card-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.2rem;
		font-weight: 800;
		line-height: 1.3;
		overflow-wrap: anywhere;
	}

	.card-title a {
		display: block;
		min-block-size: 44px;
		color: var(--post-card-text);
		text-decoration: none;
	}

	.card-title a:hover {
		color: var(--post-card-accent);
	}

	.card-excerpt {
		margin: 0;
		font-size: 0.92rem;
		line-height: 1.55;
		color: var(--post-card-muted);
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-footer {
		margin-top: auto;
		padding-top: 0.75rem;
		border-top: 1px solid var(--post-card-line);
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		font-size: 0.8rem;
	}

	.card-byline {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		color: var(--post-card-muted);
	}

	.card-author {
		font-weight: 600;
		color: var(--post-card-text);
	}

	.card-read-link {
		color: var(--post-card-accent);
		display: inline-flex;
		align-items: center;
		min-block-size: 44px;
		font-weight: 700;
		text-decoration: none;
		white-space: nowrap;
	}

	@media (min-width: 768px) {
		.blog-post-card.is-lead.has-cover {
			display: grid;
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		}

		.is-lead .card-media-link {
			aspect-ratio: auto;
			min-block-size: 280px;
		}

		.is-lead .card-cover-img {
			position: absolute;
			inset: 0;
		}

		.is-lead .card-media-link {
			position: relative;
		}

		.is-lead .card-title {
			font-size: clamp(1.3rem, 2.2vw, 2rem);
		}

		.is-lead .card-body {
			padding: 2rem;
		}
	}
</style>
