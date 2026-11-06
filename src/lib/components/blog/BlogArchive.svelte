<script lang="ts">
	import '#lib/styles/inner-page.css';
	import '#lib/styles/prose.css';
	import { resolve } from '$app/paths';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import SEO from './SEO.svelte';
	import ArchiveControls from './ArchiveControls.svelte';
	import ArchiveResults from './ArchiveResults.svelte';
	import type { BlogListing } from '#lib/shared/blog/discovery';
	import type { ArchivePath, ArchiveTopic } from './archive';

	interface Props {
		listing: BlogListing;
		basePath: ArchivePath;
		title: string;
		kicker: string;
		description?: string | null;
		topics: readonly ArchiveTopic[];
		topicLabel?: string;
		breadcrumb?: string;
		/** Only category loader output that has passed sanitizePostHtml. */
		sanitizedPillarHtml?: string | null;
		schema?: Record<string, unknown> | null;
	}
	let {
		listing,
		basePath,
		title,
		kicker,
		description,
		topics,
		topicLabel,
		breadcrumb,
		sanitizedPillarHtml,
		schema
	}: Props = $props();
</script>

<SEO {schema} />
<a class="skip" href="#blog-archive">Skip to main content</a>
<Navbar />
<main id="blog-archive" class="inner-page blog-archive-page">
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true">/</li>
				{#if breadcrumb}<li><a href={resolve('/blog')}>Blog</a></li>
					<li aria-hidden="true">/</li>
					<li aria-current="page">{breadcrumb}</li>{:else}<li aria-current="page">Blog</li>{/if}
			</ol>
		</div>
	</nav>
	<section class="page-hero archive-hero" aria-labelledby="archive-h1">
		<div class="container">
			<div class="archive-header">
				<span class="section-kicker">{kicker}</span>
				<h1 id="archive-h1" class="hero-h1">{title}</h1>
				{#if description}<p class="archive-summary">
						{description}
					</p>{:else if basePath === '/blog'}<p class="archive-summary">
						Explore market structure, options and risk management with <a href={resolve('/about')}
							>Billy Ribeiro</a
						> and the Revolution Trading Pros desk.
					</p>{/if}
			</div>
		</div>
	</section>
	<section class="archive-library" aria-label="Blog navigation and articles">
		<div class="container archive-library-inner">
			<ArchiveControls
				{basePath}
				search={listing.search}
				{topics}
				{topicLabel}
			/>{#if sanitizedPillarHtml && !listing.search}<div class="pillar-intro prose-base">
					<!-- CMS markup passes the shared allowlist before this deliberate HTML rendering boundary. -->
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html sanitizedPillarHtml}
				</div>{/if}<ArchiveResults {listing} {basePath} />
		</div>
	</section>
</main>
<Footer />

<style>
	.inner-page .archive-hero {
		padding-block: clamp(2rem, 4vw, 3.5rem) 2rem;
	}
	.archive-header {
		min-inline-size: 0;
	}
	.archive-header h1 {
		max-inline-size: 24ch;
		margin-block: 0.65rem 1rem;
	}
	.archive-summary {
		max-inline-size: 65ch;
		color: var(--text-secondary);
		font-size: clamp(1.05rem, 1.2vw, 1.18rem);
		line-height: 1.65;
		margin: 0;
	}
	.archive-summary a {
		color: var(--text);
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}
	.archive-library {
		padding-block: 0 clamp(3rem, 6vw, 5rem);
	}
	.archive-library-inner {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		min-inline-size: 0;
		gap: clamp(2rem, 3vw, 3rem);
	}
	.pillar-intro {
		max-inline-size: 900px;
	}
</style>
