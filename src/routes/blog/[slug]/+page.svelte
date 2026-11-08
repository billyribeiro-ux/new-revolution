<script lang="ts">
	import '#lib/styles/prose.css';
	import { resolve } from '$app/paths';
	import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import PostCard from '#lib/components/blog/PostCard.svelte';
	import SEO from '#lib/components/blog/SEO.svelte';
	import { SITE_ORIGIN } from '#lib/seo/structured-data';
	import { buildTocTree, type TocNode } from '#lib/shared/seo/toc';
	import { attachArticleNavigation } from '#lib/attachments/article-toc';
	import { parsePostCustomFields } from '#lib/shared/blog/search';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
		form?: ActionData;
	}

	let { data, form }: Props = $props();

	let readingProgress = $state(0);
	let activeHeadingId = $state('');
	let copyLinkStatus = $state('');
	let canNativeShare = $state(false);

	// Server (getPublicPostViewBySlug) already runs normalizePostHeadings once (SSOT)
	// and supplies 1:1 synchronized heading IDs and TOC items.
	let toc = $derived((data.post?.toc ?? []).filter((item) => item.level === 2));
	let tocTree = $derived(buildTocTree(toc));
	let processedContent = $derived(data.post?.content ?? '');
	let customFields = $derived(parsePostCustomFields(data.post?.customFields));
	let isTocEnabled = $derived(customFields.values.get('__enableToc') !== 'false');
	let showToc = $derived(isTocEnabled && toc.length >= 3);

	// Real files only: the server derives the srcset from the media row's stored variants.
	let coverSrcset = $derived(data.post?.coverSrcset ?? undefined);
	const coverSizes =
		'(min-width: 96rem) 1424px, (min-width: 80rem) calc(100vw - 64px), (min-width: 64rem) calc(100vw - 40px), (min-width: 48rem) calc(100vw - 56px), (min-width: 40rem) calc(100vw - 44px), (min-width: 30rem) calc(100vw - 36px), calc(100vw - 24px)';

	let shareUrl = $derived(
		data.post
			? `${SITE_ORIGIN}/blog/${data.post.slug}`
			: data.payload
				? `${SITE_ORIGIN}/blog/${data.payload.slug}`
				: `${SITE_ORIGIN}/blog`
	);

	let shareTitle = $derived(data.post?.title ?? data.payload?.title ?? 'Revolution Trading Pros');

	function setupArticleInteractions() {
		const activeSlug = data.post?.slug;
		void activeSlug;
		if (typeof window === 'undefined') return;

		activeHeadingId = toc[0]?.id ?? '';
		canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

		// Pageview analytics tracking (Section 10.9)
		if (data.post && !data.post.isPreview) {
			const path = window.location.pathname;
			fetch('/api/analytics/pageview', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					path,
					referrer: document.referrer || undefined
				}),
				keepalive: true
			}).catch((err) => {
				console.debug('[pageview] Failed to record pageview:', err);
			});
		}

		function onScroll() {
			const doc = document.documentElement;
			const scrollTop = window.scrollY || doc.scrollTop;
			const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
			readingProgress = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
		}

		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', onScroll);
		};
	}

	function setupArticleNavigation(article: HTMLElement) {
		return attachArticleNavigation(article, {
			items: toc,
			onActiveHeadingChange: (id) => {
				activeHeadingId = id;
			}
		});
	}

	async function handleCopyShareLink() {
		try {
			await navigator.clipboard.writeText(shareUrl);
			copyLinkStatus = 'Link copied to clipboard.';
			setTimeout(() => {
				copyLinkStatus = '';
			}, 3000);
		} catch (err) {
			console.warn('[share] Clipboard copy failed:', err);
			copyLinkStatus = 'Could not copy link.';
		}
	}

	async function handleNativeShare() {
		if (!navigator.share) return;
		try {
			await navigator.share({
				title: shareTitle,
				url: shareUrl
			});
		} catch (err) {
			console.debug('[share] Native share cancelled or failed:', err);
		}
	}
</script>

<SEO schema={data.jsonLdSchema} />

<svelte:head>
	{#if data.post?.coverImage}
		<link
			rel="preload"
			as="image"
			href={data.post.coverImage}
			imagesrcset={coverSrcset}
			imagesizes={coverSrcset ? coverSizes : undefined}
			fetchpriority="high"
		/>
	{/if}
</svelte:head>

<a class="skip" href="#blog-article-page">Skip to main content</a>
<Navbar />

<div
	class="reading-progress-track"
	role="progressbar"
	aria-label="Reading progress"
	aria-valuemin={0}
	aria-valuemax={100}
	aria-valuenow={Math.round(readingProgress)}
>
	<div class="reading-progress-fill" style={`width: ${readingProgress}%`}></div>
</div>

<main
	{@attach setupArticleInteractions}
	id="blog-article-page"
	class="inner-page blog-article-page"
>
	{#if data.locked && data.payload}
		<nav class="breadcrumb-bar" aria-label="Breadcrumb">
			<div class="container breadcrumb-bar__inner">
				<ol class="breadcrumb-list">
					<li><a href={resolve('/')}>Home</a></li>
					<li aria-hidden="true">/</li>
					<li><a href={resolve('/blog')}>Blog</a></li>
					<li aria-hidden="true">/</li>
					<li aria-current="page">{data.payload.title}</li>
				</ol>
			</div>
		</nav>

		<section class="section content-section locked-article-section" aria-labelledby="locked-h1">
			<div class="container">
				<div class="locked-card">
					<span class="locked-badge">Protected Article</span>
					<h1 id="locked-h1" class="article-h1">{data.payload.title}</h1>
					<p class="locked-notice">{data.payload.notice}</p>

					{#if form?.unlockError}
						<div class="unlock-error" role="alert">
							{form.unlockError}
						</div>
					{/if}

					<form method="POST" action="?/unlock" class="unlock-form">
						<label for="unlock-password-input" class="unlock-label"> Access Password </label>
						<div class="unlock-input-row">
							<input
								id="unlock-password-input"
								type="password"
								name="password"
								autocomplete="current-password"
								required
								class="unlock-input"
								placeholder="Enter password..."
							/>
							<button type="submit" class="unlock-submit-btn"> Unlock Article </button>
						</div>
					</form>
				</div>
			</div>
		</section>
	{:else if data.post}
		{#if data.post.isPreview}
			<div class="preview-banner" role="status">
				Draft Preview Mode: This article is not publicly indexed unless published.
			</div>
		{/if}

		<nav class="breadcrumb-bar" aria-label="Breadcrumb">
			<div class="container breadcrumb-bar__inner">
				<ol class="breadcrumb-list">
					<li><a href={resolve('/')}>Home</a></li>
					<li aria-hidden="true">/</li>
					<li><a href={resolve('/blog')}>Blog</a></li>
					<li aria-hidden="true">/</li>
					{#if data.post.category}
						<li>
							<a href={resolve('/blog/category/[slug]', { slug: data.post.category.slug })}>
								{data.post.category.name}
							</a>
						</li>
						<li aria-hidden="true">/</li>
					{/if}
					<li aria-current="page">{data.post.title}</li>
				</ol>
			</div>
		</nav>

		<article
			{@attach setupArticleNavigation}
			class={['container', 'article-container', { 'has-toc': showToc }]}
		>
			<header class="article-header">
				<div class="article-meta-badges">
					{#if data.post.category}
						<a
							href={resolve('/blog/category/[slug]', { slug: data.post.category.slug })}
							class="article-category-badge"
						>
							{data.post.category.name}
						</a>
					{/if}
					{#if data.post.seriesName}
						<span class="article-pillar-badge">{data.post.seriesName}</span>
					{/if}
					{#if data.post.isPillar}
						<span class="article-pillar-badge">Cornerstone Guide</span>
					{/if}
					<span class="article-reading-time">{data.post.readingTime} min read</span>
				</div>

				<h1 class="article-h1">{data.post.title}</h1>

				{#if data.post.subtitle}
					<p class="article-subtitle">{data.post.subtitle}</p>
				{/if}

				{#if data.post.excerpt}
					<p class="article-excerpt">{data.post.excerpt}</p>
				{/if}

				<div class="article-byline-row">
					{#if data.post.author}
						<div class="byline-author">
							<a href={resolve('/about')} class="byline-author-link">
								<strong>{data.post.author.name}</strong>
							</a>
							{#if data.post.author.jobTitle}
								<span class="byline-role">{data.post.author.jobTitle}</span>
							{/if}
						</div>
					{/if}
					{#if data.post.publishedAt}
						<time class="byline-date" datetime={new Date(data.post.publishedAt).toISOString()}>
							Published {new Date(data.post.publishedAt).toLocaleDateString('en-US', {
								month: 'long',
								day: 'numeric',
								year: 'numeric',
								timeZone: 'UTC'
							})}
						</time>
					{/if}
					{#if data.post.contentUpdatedAt && (!data.post.publishedAt || new Date(data.post.contentUpdatedAt).getTime() - new Date(data.post.publishedAt).getTime() > 60_000)}
						<time class="byline-date" datetime={new Date(data.post.contentUpdatedAt).toISOString()}>
							Updated {new Date(data.post.contentUpdatedAt).toLocaleDateString('en-US', {
								month: 'long',
								day: 'numeric',
								year: 'numeric',
								timeZone: 'UTC'
							})}
						</time>
					{/if}
				</div>

				{#if data.post.tags.length > 0}
					<ul class="article-tag-list article-tags" aria-label="Article tags">
						{#each data.post.tags as tag, index (tag.id)}
							<li>
								{#if index > 0}<span class="sr-only">, </span>{/if}<a
									href={resolve('/blog/tag/[slug]', { slug: tag.slug })}
									class="article-tag-chip"
								>
									{tag.name}
								</a>
							</li>
						{/each}
					</ul>
				{/if}
			</header>

			{#if data.post.coverImage}
				{#key data.post.slug}
					<figure class="article-cover-figure">
						<img
							src={data.post.coverImage}
							srcset={coverSrcset}
							sizes={coverSrcset ? coverSizes : undefined}
							alt={data.post.coverImageAlt || data.post.title}
							width={data.post.coverWidth ?? 1600}
							height={data.post.coverHeight ?? 900}
							loading="eager"
							fetchpriority="high"
							decoding="async"
							class="article-cover-img"
						/>
						{#if data.post.coverImageCaption}
							<figcaption class="article-cover-caption">
								{data.post.coverImageCaption}
							</figcaption>
						{/if}
					</figure>
				{/key}
			{/if}

			{#if showToc}
				<aside class="article-toc-aside" aria-label="Table of contents">
					<details class="toc-details" open>
						<summary class="toc-summary">
							<span>Table of Contents</span>
							<span class="toc-toggle-icon" aria-hidden="true">
								<CaretDownIcon class="toc-caret" size={16} weight="bold" />
							</span>
						</summary>
						<nav aria-label="Article sections">
							{#snippet renderTocItems(items: TocNode[])}
								{#each items as item (item.id)}
									<li class="toc-item">
										<a
											href={`#${item.id}`}
											data-toc-id={item.id}
											class={['toc-link', { 'toc-link--active': activeHeadingId === item.id }]}
											aria-current={activeHeadingId === item.id ? 'location' : undefined}
											onclick={() => {
												activeHeadingId = item.id;
											}}>{item.text}</a
										>
										{#if item.children.length > 0}
											<ol>{@render renderTocItems(item.children)}</ol>
										{/if}
									</li>
								{/each}
							{/snippet}
							<ol class="toc-list">{@render renderTocItems(tocTree)}</ol>
						</nav>
					</details>
				</aside>
			{/if}
			<div class={['article-body-layout', { 'has-toc': showToc }]}>
				<div class="article-main-column">
					<div class="prose-base article-prose blog-prose">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html processedContent}
					</div>

					<section class="article-service-cta" aria-labelledby="service-cta-h2">
						<span class="section-kicker">Trade Live With Our Desk</span>
						<h2 id="service-cta-h2">Execute Institutional Order Flow With Defined Risk</h2>
						<p>
							Join our live stock, ETF, and options trading rooms or follow our pre-planned video
							watchlists built for working professionals and small accounts.
						</p>
						<div class="service-cta-links">
							<a href={resolve('/live-trading-rooms/day-trading-room')} class="btn-cta-primary">
								Explore Live Trading Rooms
							</a>
							<a href={resolve('/store/indicators')} class="btn-cta-secondary">
								View Custom Indicators
							</a>
						</div>
					</section>

					{#if data.post.faqList.length > 0}
						<section class="article-faq-section" aria-labelledby="article-faq-h2">
							<h2 id="article-faq-h2">Frequently Asked Questions</h2>
							<div class="faq-accordion">
								{#each data.post.faqList as faq, idx (faq.question)}
									<details class="faq-details" open={idx === 0}>
										<summary class="faq-summary">
											<h3 class="faq-question">{faq.question}</h3>
										</summary>
										<div class="faq-answer">
											<p>{faq.answer}</p>
										</div>
									</details>
								{/each}
							</div>
						</section>
					{/if}

					{#if data.post.author}
						<section class="author-bio-box" aria-label="About the author">
							{#if data.post.author.avatar}
								<img
									src={data.post.author.avatar}
									alt={data.post.author.avatarAlt || data.post.author.name}
									width="72"
									height="72"
									loading="lazy"
									decoding="async"
									class="author-avatar"
								/>
							{/if}
							<div class="author-bio-content">
								<div class="author-bio-header">
									<h2 class="author-name">
										<a href={resolve('/about')} class="author-name-link">{data.post.author.name}</a>
									</h2>
									{#if data.post.author.jobTitle}
										<span class="author-role">{data.post.author.jobTitle}</span>
									{/if}
									{#if data.post.author.credentials}
										<span class="author-creds">
											({data.post.author.credentials})
										</span>
									{/if}
								</div>
								{#if data.post.author.bio || data.post.author.shortBio}
									<p class="author-description">
										{data.post.author.bio || data.post.author.shortBio}
									</p>
								{/if}
								<div class="author-links">
									<!-- eslint-disable svelte/no-navigation-without-resolve -- external author profile URLs -->
									{#if data.post.author.linkedin}
										<a href={data.post.author.linkedin} target="_blank" rel="noopener noreferrer">
											LinkedIn (opens in new tab)
										</a>
									{/if}
									{#if data.post.author.twitter}
										<a href={data.post.author.twitter} target="_blank" rel="noopener noreferrer">
											X (opens in new tab)
										</a>
									{/if}
									{#if data.post.author.website}
										<a href={data.post.author.website} target="_blank" rel="noopener noreferrer">
											Website (opens in new tab)
										</a>
									{/if}
									<!-- eslint-enable svelte/no-navigation-without-resolve -->
								</div>
							</div>
						</section>
					{/if}

					<section class="article-share-bar" aria-label="Share this article">
						<span class="share-label">Share Article:</span>
						<div class="share-buttons">
							<a
								href={`https://x.com/intent/post?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Share on X (opens in new tab)"
								class="share-btn"
							>
								X
							</a>
							<a
								href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Share on LinkedIn (opens in new tab)"
								class="share-btn"
							>
								LinkedIn
							</a>
							<a
								href={`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Share via Email (opens in new tab)"
								class="share-btn"
							>
								Email
							</a>
							<button type="button" class="share-btn" onclick={handleCopyShareLink}>
								Copy Link
							</button>
							{#if canNativeShare}
								<button type="button" class="share-btn" onclick={handleNativeShare}> Share </button>
							{/if}
						</div>
						{#if copyLinkStatus}
							<span class="copy-status" role="status">{copyLinkStatus}</span>
						{/if}
					</section>

					{#if data.post.previousPost || data.post.nextPost}
						<nav class="prev-next-nav" aria-label="Previous and next articles">
							{#if data.post.previousPost}
								<a
									href={resolve('/blog/[slug]', { slug: data.post.previousPost.slug })}
									class="prev-next-card is-prev"
								>
									<span class="pn-label">Previous Article</span>
									<strong class="pn-title">{data.post.previousPost.title}</strong>
								</a>
							{/if}
							{#if data.post.nextPost}
								<a
									href={resolve('/blog/[slug]', { slug: data.post.nextPost.slug })}
									class="prev-next-card is-next"
								>
									<span class="pn-label">Next Article</span>
									<strong class="pn-title">{data.post.nextPost.title}</strong>
								</a>
							{/if}
						</nav>
					{/if}
				</div>
			</div>

			{#if data.post.relatedPosts.length > 0}
				<section class="related-articles-section" aria-labelledby="related-h2">
					<h2 id="related-h2" class="section-h2">Related Articles</h2>
					<div class="related-grid">
						{#each data.post.relatedPosts as rel (rel.id)}
							<PostCard
								post={{
									id: rel.id,
									title: rel.title,
									slug: rel.slug,
									excerpt: rel.excerpt,
									coverImage: rel.coverImage,
									coverImageAlt: rel.coverImageAlt,
									readingTime: rel.readingTime,
									publishedAt: rel.publishedAt,
									category:
										rel.categoryName && rel.categorySlug
											? {
													name: rel.categoryName,
													slug: rel.categorySlug
												}
											: null
								}}
								headingLevel="h3"
							/>
						{/each}
					</div>
				</section>
			{/if}

			<div class="back-to-blog-row">
				<a href={resolve('/blog')} class="back-to-blog-link"> Back to all articles </a>
			</div>
		</article>
	{/if}
</main>

<Footer />

<style>
	.reading-progress-track {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: transparent;
		z-index: 90;
	}

	.reading-progress-fill {
		height: 100%;
		background: var(--acid);
		transition: width 0.1s linear;
	}

	.preview-banner {
		background: rgba(222, 195, 161, 0.16);
		border-bottom: 1px solid var(--status-amber-text);
		color: var(--status-amber-text);
		padding: 0.65rem 1.25rem;
		text-align: center;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.article-container {
		--article-header-height: calc(var(--nav-height) + 1px);
		--article-anchor-offset: calc(var(--article-header-height) + 1.5rem);
		padding-block: 2.5rem 5rem;
	}

	.article-container :global([id]) {
		scroll-margin-block-start: var(--article-anchor-offset);
	}

	.byline-author-link,
	.author-name-link {
		color: var(--text);
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		min-height: 24px;
	}

	.byline-author-link:hover,
	.author-name-link:hover {
		color: var(--acid);
	}

	.article-header {
		min-inline-size: 0;
		width: 100%;
		max-width: 100%;
		margin: 0 0 2rem;
		overflow-wrap: anywhere;
	}

	.article-meta-badges {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.85rem;
		font-family: var(--font-mono);
		font-size: 0.76rem;
	}

	.article-category-badge {
		display: inline-flex;
		align-items: center;
		min-height: 28px;
		padding: 0.22rem 0.65rem;
		border-radius: 999px;
		background: rgba(220, 255, 101, 0.14);
		color: var(--acid);
		text-decoration: none;
		font-weight: 700;
		text-transform: uppercase;
	}

	.article-pillar-badge {
		padding: 0.22rem 0.65rem;
		border-radius: 999px;
		background: var(--panel);
		border: 1px solid var(--line-strong);
		color: var(--text);
	}

	.article-reading-time {
		color: var(--muted);
	}

	.article-h1 {
		max-inline-size: 100%;
		margin: 0 0 1rem;
		font-family: var(--font-display);
		font-size: clamp(1.9rem, 3.8vw, 2.85rem);
		font-weight: 900;
		line-height: 1.15;
		color: var(--text);
	}

	.article-subtitle {
		max-inline-size: 100%;
		margin: -0.35rem 0 0.9rem;
		font-family: var(--font-display);
		font-size: clamp(1.15rem, 2vw, 1.45rem);
		font-weight: 700;
		line-height: 1.35;
		color: var(--text);
	}

	.article-excerpt {
		max-inline-size: 100%;
		margin: 0 0 1.25rem;
		font-size: 1.12rem;
		line-height: 1.6;
		color: var(--muted);
	}

	.article-byline-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem 0.75rem;
		padding: 0.85rem 0;
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
		font-size: 0.88rem;
	}

	.byline-author {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: baseline;
		column-gap: 0.5rem;
		row-gap: 0.15rem;
		min-inline-size: 0;
	}

	.byline-role,
	.byline-date {
		color: var(--muted);
	}

	.article-tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		list-style: none;
		padding: 0;
		margin: 0.85rem 0 0;
	}

	.article-tag-chip {
		display: inline-flex;
		align-items: center;
		min-height: 28px;
		padding: 0.2rem 0.55rem;
		border-radius: 6px;
		background: var(--panel);
		border: 1px solid var(--line);
		color: var(--muted);
		text-decoration: none;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
	}

	.article-cover-figure {
		min-inline-size: 0;
		width: 100%;
		max-width: 100%;
		margin: 0 0 2.5rem;
	}

	.article-cover-img {
		width: 100%;
		height: auto;
		aspect-ratio: 16 / 9;
		object-fit: contain;
		background: var(--bg-soft);
		border-radius: 0;
		border: 1px solid var(--line);
		display: block;
	}

	.article-cover-caption {
		margin-top: 0.55rem;
		text-align: center;
		font-size: 0.82rem;
		color: var(--muted);
	}

	.article-body-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 2.5rem;
		align-items: start;
		min-inline-size: 0;
		width: 100%;
	}

	.article-toc-aside {
		display: none;
	}

	@media (min-width: 118.75rem) {
		.article-container.has-toc {
			display: grid;
			grid-template-columns: minmax(0, 1fr);
			column-gap: 0;
		}

		.article-container.has-toc > .article-header,
		.article-container.has-toc > .article-cover-figure {
			grid-column: 1;
			width: 100%;
			max-width: 100%;
			margin-inline: 0;
		}

		.article-container.has-toc > .article-header {
			grid-row: 1;
		}
		.article-container.has-toc > .article-cover-figure {
			grid-row: 2;
		}
		.article-container.has-toc > .article-body-layout {
			grid-column: 1;
			grid-row: 3;
		}
		.article-container.has-toc > .related-articles-section {
			grid-column: 1 / -1;
			grid-row: 4;
		}
		.article-container.has-toc > .back-to-blog-row {
			grid-column: 1 / -1;
			grid-row: 5;
		}

		.article-toc-aside {
			--toc-left-space: calc((100vw - 1424px) / 2);
			--toc-width: clamp(194px, calc(var(--toc-left-space) - 2.75rem), 260px);
			--toc-gap: clamp(1.75rem, calc(var(--toc-left-space) - var(--toc-width) - 1rem), 2.5rem);
			display: block;
			grid-column: 1;
			grid-row: 1 / 4;
			justify-self: start;
			align-self: stretch;
			width: var(--toc-width);
			margin-inline-start: calc(-1 * (var(--toc-width) + var(--toc-gap)));
			min-width: 0;
			z-index: 20;
		}

		.toc-details {
			position: sticky;
			top: calc(var(--article-header-height) + 0.5rem);
		}
	}

	.toc-details {
		--toc-nav-limit: calc(100dvh - var(--article-header-height) - 5.375rem);
		background: var(--panel);
		border: 1px solid var(--line-strong);
	}

	.toc-summary {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text);
		min-height: 60px;
		padding: 0.75rem 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		cursor: pointer;
		list-style: none;
	}

	.toc-summary::-webkit-details-marker {
		display: none;
	}

	.toc-summary:focus-visible {
		outline: 3px solid var(--acid);
		outline-offset: -3px;
	}

	.toc-summary:hover .toc-toggle-icon {
		border-color: var(--acid);
		color: var(--acid);
	}

	.toc-toggle-icon {
		display: grid;
		place-items: center;
		flex: 0 0 32px;
		width: 32px;
		height: 32px;
		border: 1px solid var(--line-strong);
		color: var(--text);
	}

	.toc-summary :global(.toc-caret) {
		transition: transform 0.2s ease;
	}

	.toc-details[open] .toc-summary :global(.toc-caret) {
		transform: rotate(180deg);
	}

	.toc-details:not([open]) > nav {
		display: none;
	}

	.toc-details > nav {
		max-height: max(0px, var(--toc-nav-limit));
		overflow-y: auto;
		overscroll-behavior-y: auto;
		scrollbar-width: thin;
		border-top: 1px solid var(--line);
		padding: 0.65rem 0.65rem 0.85rem;
	}

	.toc-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		font-size: 0.84rem;
	}

	.toc-item a {
		color: var(--muted);
		text-decoration: none;
		display: block;
		padding: 0.55rem 0.65rem 0.55rem 0.85rem;
		border-left: 2px solid transparent;
		line-height: 1.4;
		font-weight: 600;
		overflow-wrap: anywhere;
		transition:
			color 0.15s ease,
			background 0.15s ease,
			border-color 0.15s ease;
	}

	.toc-item a[aria-current='location'],
	.toc-item a.toc-link--active,
	.toc-item a:hover,
	.toc-item a:focus-visible {
		color: var(--text);
		border-left-color: var(--acid);
		background: rgba(220, 255, 101, 0.08);
	}

	.toc-item ol {
		list-style: none;
		margin: 0;
		padding-inline-start: 0.75rem;
	}

	.article-main-column {
		min-width: 0;
		max-width: 100%;
		width: 100%;
		overflow-wrap: anywhere;
	}

	/* CMS HTML has no Svelte scope class; keep wide semantic tables locally scrollable. */
	.article-prose :global(.table-scroll) {
		max-inline-size: 100%;
		overflow-x: auto;
	}

	.article-service-cta {
		margin: 3rem 0;
		padding: 1.75rem;
		background: var(--panel);
		border: 1px solid var(--line-strong);
		border-radius: 14px;
	}

	.article-service-cta h2 {
		max-inline-size: 100%;
		margin: 0.35rem 0 0.65rem;
		font-family: var(--font-display);
		font-size: 1.35rem;
	}

	.article-service-cta p {
		max-inline-size: 100%;
	}

	.service-cta-links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1.15rem;
	}

	.btn-cta-primary,
	.btn-cta-secondary {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0.6rem 1.15rem;
		border-radius: 8px;
		font-weight: 700;
		text-decoration: none;
		font-size: 0.88rem;
	}

	.btn-cta-primary {
		background: var(--acid);
		color: var(--ink);
	}

	.btn-cta-secondary {
		background: var(--bg-soft);
		border: 1px solid var(--line-strong);
		color: var(--text);
	}

	.article-faq-section {
		margin: 2.5rem 0;
	}

	.article-faq-section h2 {
		max-inline-size: 100%;
	}

	.faq-accordion {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.faq-details {
		background: var(--panel);
		border: 1px solid var(--line);
		border-radius: 10px;
		padding: 0.9rem 1.1rem;
	}

	.faq-summary {
		cursor: pointer;
	}

	.faq-question {
		max-inline-size: 100%;
		display: inline;
		margin: 0;
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
	}

	.faq-answer p {
		max-inline-size: 100%;
		margin: 0.65rem 0 0;
		color: var(--muted);
		line-height: 1.6;
	}

	.author-bio-box {
		margin: 2.5rem 0;
		padding: 1.35rem;
		background: var(--panel);
		border: 1px solid var(--line);
		border-radius: 12px;
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: flex-start;
	}

	.author-bio-content {
		flex: 1 1 14rem;
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}

	.author-avatar {
		border-radius: 50%;
		object-fit: cover;
		flex-shrink: 0;
	}

	.author-name {
		max-inline-size: 100%;
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.1rem;
	}

	.author-role,
	.author-creds {
		font-size: 0.82rem;
		color: var(--muted);
	}

	.author-description {
		max-inline-size: 100%;
		margin: 0.5rem 0;
		font-size: 0.9rem;
		color: var(--muted);
		line-height: 1.55;
	}

	.author-links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.85rem;
		font-size: 0.82rem;
	}

	.author-links a {
		color: var(--acid);
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		min-height: 24px;
		min-width: 24px;
	}

	.article-share-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.65rem;
		padding: 1rem 0;
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
		margin: 2rem 0;
	}

	.share-label {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--muted);
	}

	.share-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
	}

	.share-btn {
		display: inline-flex;
		align-items: center;
		min-height: 36px;
		padding: 0.38rem 0.8rem;
		border-radius: 6px;
		background: var(--panel);
		border: 1px solid var(--line-strong);
		color: var(--text);
		font-family: var(--font-sans);
		font-size: 0.8rem;
		font-weight: 600;
		text-decoration: none;
		cursor: pointer;
	}

	.copy-status {
		font-size: 0.8rem;
		color: var(--acid);
	}

	.prev-next-nav {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
		gap: 1rem;
		margin: 2rem 0;
	}

	.prev-next-card {
		min-inline-size: 0;
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--line);
		border-radius: 10px;
		text-decoration: none;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		overflow-wrap: anywhere;
	}

	.pn-label {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		text-transform: uppercase;
		color: var(--muted);
	}

	.pn-title {
		color: var(--text);
		font-size: 0.95rem;
	}

	.related-articles-section {
		min-inline-size: 0;
		margin-top: 3.5rem;
		padding-top: 2rem;
		border-top: 1px solid var(--line);
	}

	.related-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		align-items: stretch;
		margin-top: 1.25rem;
	}

	.related-grid :global(.blog-post-card) {
		flex: 1 1 20rem;
		min-inline-size: min(100%, 20rem);
		max-inline-size: 25rem;
	}

	.back-to-blog-row {
		margin-top: 2.5rem;
		text-align: center;
	}

	.back-to-blog-link {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: var(--acid);
		font-weight: 700;
		text-decoration: none;
	}

	.locked-card {
		max-width: 580px;
		margin: 2rem auto;
		padding: 2rem;
		background: var(--panel);
		border: 1px solid var(--line-strong);
		border-radius: 14px;
	}

	.locked-badge {
		display: inline-block;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		text-transform: uppercase;
		color: var(--acid);
		margin-bottom: 0.5rem;
	}

	.locked-notice {
		color: var(--muted);
		line-height: 1.55;
		margin-bottom: 1.25rem;
	}

	.unlock-error {
		padding: 0.65rem 0.9rem;
		margin-bottom: 1rem;
		border-radius: 8px;
		background: rgba(255, 121, 105, 0.14);
		border: 1px solid var(--coral);
		color: var(--coral);
		font-size: 0.86rem;
	}

	.unlock-label {
		display: block;
		font-size: 0.84rem;
		font-weight: 600;
		margin-bottom: 0.4rem;
	}

	.unlock-input-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.unlock-input {
		min-inline-size: 0;
		flex: 1 1 12rem;
		padding: 0.6rem 0.85rem;
		border-radius: 8px;
		background: var(--bg-soft);
		border: 1px solid var(--line-strong);
		color: var(--text);
		font-family: var(--font-sans);
	}

	.unlock-submit-btn {
		padding: 0.6rem 1.15rem;
		border-radius: 8px;
		background: var(--acid);
		color: var(--ink);
		font-weight: 700;
		border: none;
		cursor: pointer;
	}

	@media (prefers-reduced-motion: reduce) {
		.reading-progress-fill,
		.toc-item a,
		.toc-summary :global(.toc-caret) {
			transition: none;
		}
	}
</style>
