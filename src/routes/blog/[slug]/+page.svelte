<script lang="ts">
	import '#lib/styles/inner-page.css';
	import '#lib/styles/prose.css';
	import { resolve } from '$app/paths';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import PostCard from '#lib/components/blog/PostCard.svelte';
	import SEO from '#lib/components/blog/SEO.svelte';
	import { SITE_ORIGIN } from '#lib/seo/structured-data';
	import type { ActionData, PageData } from './$types';

	interface Props {
		data: PageData;
		form?: ActionData;
	}

	let { data, form }: Props = $props();

	let readingProgress = $state(0);
	let activeHeadingId = $state('');
	let tocDetailsOpen = $state(true);
	let copyLinkStatus = $state('');
	let canNativeShare = $state(false);

	function deriveVariantSrcset(url: string | null | undefined): string | undefined {
		if (!url) return undefined;
		const match = url.match(/^(.*)-(?:480|800|1200|1[3-9]\d\d|[2-9]\d{3,})w\.webp$/i);
		if (!match) return undefined;
		const prefix = match[1];
		return `${prefix}-480w.webp 480w, ${prefix}-800w.webp 800w, ${prefix}-1200w.webp 1200w`;
	}

	let coverSrcset = $derived(data.post ? deriveVariantSrcset(data.post.coverImage) : undefined);

	let shareUrl = $derived(
		data.post
			? `${SITE_ORIGIN}/blog/${data.post.slug}`
			: data.payload
				? `${SITE_ORIGIN}/blog/${data.payload.slug}`
				: `${SITE_ORIGIN}/blog`
	);

	let shareTitle = $derived(data.post?.title ?? data.payload?.title ?? 'Revolution Trading Pros');

	function setupArticleInteractions() {
		if (typeof window === 'undefined') return;

		if (window.innerWidth < 768) {
			tocDetailsOpen = false;
		}
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

			if (data.post && data.post.toc.length >= 3) {
				let currentId = data.post.toc[0]?.id ?? '';
				for (const item of data.post.toc) {
					const el = document.getElementById(item.id);
					if (el && el.offsetTop <= scrollTop + 150) {
						currentId = item.id;
					}
				}
				activeHeadingId = currentId;
			}
		}

		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', onScroll);
		};
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
		<section class="content-section locked-article-section" aria-labelledby="locked-h1">
			<nav class="article-breadcrumbs" aria-label="Breadcrumb">
				<ol>
					<li><a href={resolve('/')}>Home</a></li>
					<li><a href={resolve('/blog')}>Blog</a></li>
					<li aria-current="page">{data.payload.title}</li>
				</ol>
			</nav>

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
		</section>
	{:else if data.post}
		{#if data.post.isPreview}
			<div class="preview-banner" role="status">
				Draft Preview Mode: This article is not publicly indexed unless published.
			</div>
		{/if}

		<article class="article-container">
			<header class="article-header">
				<nav class="article-breadcrumbs" aria-label="Breadcrumb">
					<ol>
						<li><a href={resolve('/')}>Home</a></li>
						<li><a href={resolve('/blog')}>Blog</a></li>
						{#if data.post.category}
							<li>
								<a href={resolve('/blog/category/[slug]', { slug: data.post.category.slug })}>
									{data.post.category.name}
								</a>
							</li>
						{/if}
						<li aria-current="page">{data.post.title}</li>
					</ol>
				</nav>

				<div class="article-meta-badges">
					{#if data.post.category}
						<a
							href={resolve('/blog/category/[slug]', { slug: data.post.category.slug })}
							class="article-category-badge"
						>
							{data.post.category.name}
						</a>
					{/if}
					{#if data.post.isPillar}
						<span class="article-pillar-badge">Cornerstone Guide</span>
					{/if}
					<span class="article-reading-time">{data.post.readingTime} min read</span>
				</div>

				<h1 class="article-h1">{data.post.title}</h1>

				{#if data.post.excerpt}
					<p class="article-excerpt">{data.post.excerpt}</p>
				{/if}

				<div class="article-byline-row">
					{#if data.post.author}
						<div class="byline-author">
							<strong>{data.post.author.name}</strong>
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
								year: 'numeric'
							})}
						</time>
					{/if}
				</div>

				{#if data.post.tags.length > 0}
					<div class="article-tag-list" aria-label="Article tags">
						{#each data.post.tags as tag (tag.id)}
							<a href={resolve('/blog/tag/[slug]', { slug: tag.slug })} class="article-tag-chip">
								#{tag.name}
							</a>
						{/each}
					</div>
				{/if}
			</header>

			{#if data.post.coverImage}
				<figure class="article-cover-figure">
					<picture>
						{#if coverSrcset}
							<source
								type="image/webp"
								srcset={coverSrcset}
								sizes="(max-width: 960px) 100vw, 900px"
							/>
						{/if}
						<img
							src={data.post.coverImage}
							srcset={coverSrcset}
							sizes={coverSrcset ? '(max-width: 960px) 100vw, 900px' : undefined}
							alt={data.post.coverImageAlt || data.post.title}
							width={data.post.coverWidth}
							height={data.post.coverHeight}
							loading="eager"
							fetchpriority="high"
							decoding="async"
							class="article-cover-img"
						/>
					</picture>
					{#if data.post.coverImageCaption}
						<figcaption class="article-cover-caption">
							{data.post.coverImageCaption}
						</figcaption>
					{/if}
				</figure>
			{/if}

			<div class={['article-body-layout', { 'has-toc': data.post.toc.length >= 3 }]}>
				{#if data.post.toc.length >= 3}
					<aside class="article-toc-aside" aria-label="Table of contents">
						<details class="toc-details" bind:open={tocDetailsOpen}>
							<summary class="toc-summary">Table of Contents</summary>
							<ol class="toc-list">
								{#each data.post.toc as item (item.id)}
									<li class={`toc-item toc-level-${item.level}`}>
										<a
											href={`#${item.id}`}
											aria-current={activeHeadingId === item.id ? 'location' : undefined}
											onclick={(e) => {
												e.preventDefault();
												const target = document.getElementById(item.id);
												if (target) {
													target.scrollIntoView({ behavior: 'smooth' });
													activeHeadingId = item.id;
												}
											}}
										>
											{item.text}
										</a>
									</li>
								{/each}
							</ol>
						</details>
					</aside>
				{/if}

				<div class="article-main-column">
					<div class="prose-base article-prose">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html data.post.content}
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
								{#each data.post.faqList as faq, idx (idx)}
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
									<h2 class="author-name">{data.post.author.name}</h2>
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
		max-width: 1280px;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 5rem;
	}

	.article-breadcrumbs ol {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		list-style: none;
		padding: 0;
		margin: 0 0 1.25rem;
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--muted);
	}

	.article-breadcrumbs li + li::before {
		content: '/';
		margin-right: 0.5rem;
		color: var(--line-strong);
	}

	.article-breadcrumbs a {
		color: var(--muted);
		text-decoration: none;
	}

	.article-breadcrumbs a:hover {
		color: var(--acid);
	}

	.article-header {
		max-width: 900px;
		margin: 0 auto 2rem;
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
		margin: 0 0 1rem;
		font-family: var(--font-display);
		font-size: clamp(1.9rem, 3.8vw, 2.85rem);
		font-weight: 900;
		line-height: 1.15;
		color: var(--text);
	}

	.article-excerpt {
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
		gap: 0.75rem;
		padding: 0.85rem 0;
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
		font-size: 0.88rem;
	}

	.byline-role,
	.byline-date {
		color: var(--muted);
		margin-left: 0.5rem;
	}

	.article-tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		margin-top: 0.85rem;
	}

	.article-tag-chip {
		padding: 0.2rem 0.55rem;
		border-radius: 6px;
		background: var(--panel);
		border: 1px solid var(--line);
		color: var(--muted);
		text-decoration: none;
		font-family: var(--font-mono);
		font-size: 0.74rem;
	}

	.article-cover-figure {
		max-width: 960px;
		margin: 0 auto 2.5rem;
	}

	.article-cover-img {
		width: 100%;
		height: auto;
		border-radius: 14px;
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
		grid-template-columns: minmax(0, 900px);
		justify-content: center;
		gap: 2.5rem;
		align-items: start;
	}

	@media (min-width: 1180px) {
		.article-body-layout.has-toc {
			grid-template-columns: 260px minmax(0, 900px);
		}

		.article-toc-aside {
			position: sticky;
			top: 96px;
		}
	}

	.toc-details {
		background: var(--panel);
		border: 1px solid var(--line);
		border-radius: 12px;
		padding: 1rem;
	}

	.toc-summary {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 0.9rem;
		cursor: pointer;
	}

	.toc-list {
		list-style: none;
		padding: 0;
		margin: 0.75rem 0 0;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		font-size: 0.83rem;
	}

	@media (min-width: 768px) and (max-width: 1179px) {
		.toc-list {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 0.5rem 1rem;
		}
	}

	.toc-item a {
		color: var(--muted);
		text-decoration: none;
		display: block;
		line-height: 1.35;
	}

	.toc-item a[aria-current='location'],
	.toc-item a:hover {
		color: var(--acid);
		font-weight: 700;
	}

	.toc-level-3 {
		padding-inline-start: 0.85rem;
	}

	.toc-level-4,
	.toc-level-5,
	.toc-level-6 {
		padding-inline-start: 1.5rem;
	}

	.article-main-column {
		max-width: 900px;
		width: 100%;
	}

	.article-service-cta {
		margin: 3rem 0;
		padding: 1.75rem;
		background: var(--panel);
		border: 1px solid var(--line-strong);
		border-radius: 14px;
	}

	.article-service-cta h2 {
		margin: 0.35rem 0 0.65rem;
		font-family: var(--font-display);
		font-size: 1.35rem;
	}

	.service-cta-links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1.15rem;
	}

	.btn-cta-primary,
	.btn-cta-secondary {
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
		display: inline;
		margin: 0;
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
	}

	.faq-answer p {
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
		gap: 1rem;
		align-items: flex-start;
	}

	.author-avatar {
		border-radius: 50%;
		object-fit: cover;
	}

	.author-name {
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
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1rem;
		margin: 2rem 0;
	}

	.prev-next-card {
		padding: 1rem;
		background: var(--panel);
		border: 1px solid var(--line);
		border-radius: 10px;
		text-decoration: none;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.pn-label {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		text-transform: uppercase;
		color: var(--muted);
	}

	.pn-title {
		color: var(--text);
		font-size: 0.95rem;
	}

	.related-articles-section {
		margin-top: 3.5rem;
		padding-top: 2rem;
		border-top: 1px solid var(--line);
	}

	.related-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.35rem;
		margin-top: 1.25rem;
	}

	.back-to-blog-row {
		margin-top: 2.5rem;
		text-align: center;
	}

	.back-to-blog-link {
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
		font-size: 0.72rem;
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
		gap: 0.5rem;
	}

	.unlock-input {
		flex: 1;
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
		.reading-progress-fill {
			transition: none;
		}
	}
</style>
