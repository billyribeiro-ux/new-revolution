<script lang="ts">
	import { resolve } from '$app/paths';
	import { coverSrcsetFromUrl } from '#lib/shared/cover-srcset';

	export interface PostCardItem {
		id: number;
		title: string;
		slug: string;
		excerpt?: string | null;
		coverImage?: string | null;
		coverImageAlt?: string | null;
		publishedAt?: Date | string | null;
		updatedAt?: Date | string | null;
		contentUpdatedAt?: Date | string | null;
		readingTime?: number | null;
		featured?: boolean;
		isPillar?: boolean;
		category?: {
			id?: number;
			name: string;
			slug: string;
			color?: string | null;
		} | null;
		author?: {
			id?: number;
			name: string;
			slug: string;
			jobTitle?: string | null;
		} | null;
	}

	interface Props {
		post: PostCardItem;
		eager?: boolean;
		headingLevel?: 'h2' | 'h3';
	}

	let { post, eager = false, headingLevel = 'h3' }: Props = $props();

	let srcset = $derived(coverSrcsetFromUrl(post.coverImage));
	let displayDate = $derived(post.publishedAt ?? post.contentUpdatedAt ?? post.updatedAt ?? null);
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

<article class={['blog-post-card', { 'is-featured': post.featured }]} data-post-id={post.id}>
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
				sizes={srcset ? '(max-width: 640px) 100vw, (max-width: 1080px) 50vw, 400px' : undefined}
				alt={post.coverImageAlt || post.title}
				width="800"
				height="450"
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
			<a href={resolve('/blog/[slug]', { slug: post.slug })} class="card-read-link">
				Read Article
			</a>
		</div>
	</div>
</article>

<style>
	.blog-post-card {
		display: flex;
		flex-direction: column;
		background: var(--panel);
		border: 1px solid var(--line);
		border-radius: 14px;
		overflow: hidden;
		transition:
			border-color 0.2s ease,
			transform 0.2s ease;
	}

	.blog-post-card:hover {
		border-color: var(--line-strong);
	}

	.blog-post-card.is-featured {
		border-color: rgba(220, 255, 101, 0.35);
	}

	.card-media-link {
		display: block;
		aspect-ratio: 16 / 9;
		background: var(--bg-soft);
		overflow: hidden;
	}

	.card-cover-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.card-body {
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
		font-size: 0.74rem;
	}

	.card-category-badge {
		padding: 0.18rem 0.55rem;
		border-radius: 999px;
		background: rgba(220, 255, 101, 0.12);
		color: var(--acid);
		text-decoration: none;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.card-pillar-badge {
		padding: 0.18rem 0.55rem;
		border-radius: 999px;
		background: var(--bg-soft);
		border: 1px solid var(--line-strong);
		color: var(--text);
		font-size: 0.7rem;
	}

	.card-reading-time {
		color: var(--muted);
		margin-left: auto;
	}

	.card-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.2rem;
		font-weight: 800;
		line-height: 1.3;
	}

	.card-title a {
		color: var(--text);
		text-decoration: none;
	}

	.card-title a:hover {
		color: var(--acid);
	}

	.card-excerpt {
		margin: 0;
		font-size: 0.92rem;
		line-height: 1.55;
		color: var(--muted);
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-footer {
		margin-top: auto;
		padding-top: 0.75rem;
		border-top: 1px solid var(--line);
		display: flex;
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
		color: var(--muted);
	}

	.card-author {
		font-weight: 600;
		color: var(--text);
	}

	.card-read-link {
		color: var(--acid);
		font-weight: 700;
		text-decoration: none;
		white-space: nowrap;
	}

	@media (prefers-reduced-motion: reduce) {
		.blog-post-card {
			transition: none;
		}
	}
</style>
