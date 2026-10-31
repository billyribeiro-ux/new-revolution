<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowUpRightIcon from 'phosphor-svelte/lib/ArrowUpRightIcon';
	import { revealOnScroll } from '#lib/attachments/reveal.ts';
	import { BLOG_ARTICLES, type BlogArticle } from '#lib/data/homepage.ts';

	interface Props {
		articles?: readonly BlogArticle[];
		onPreviewNavigate?: (href: string, targetId?: string, event?: MouseEvent) => void;
	}

	let { articles = BLOG_ARTICLES, onPreviewNavigate }: Props = $props();
</script>

<!-- 09 / BLOG -->
<section class="section blog" id="blog" aria-labelledby="blog-title">
	<div class="container">
		<div class="blog-header reveal" {@attach revealOnScroll}>
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
			<a
				href={resolve('/blog')}
				class="btn btn-outline-dark"
				onclick={(e) => onPreviewNavigate?.('/blog', 'blog', e)}
			>
				<span>See All Blogs</span>
				<span class="arrow" aria-hidden="true">
					<ArrowUpRightIcon size={16} weight="bold" />
				</span>
			</a>
		</div>

		<div class="blog-grid">
			{#each articles as article (article.id)}
				<article class="blog-card reveal" {@attach revealOnScroll}>
					<div
						class={[
							'blog-cover',
							{
								cover2: article.coverVariant === 'cover2',
								cover3: article.coverVariant === 'cover3'
							}
						]}
					>
						<div class="figure">
							{#if article.coverVariant === 'cover1'}
								<svg viewBox="0 0 300 180" fill="none" aria-hidden="true">
									<path
										d="M5 149H295M5 105H295M5 61H295M5 17H295"
										stroke="#374a41"
										stroke-dasharray="4 7"
									/>
									<path
										d="M0 39 40 45 65 53 90 48 115 68 137 98 160 111 180 95 210 135 235 121 264 150 300 139"
										stroke="#dcff65"
										stroke-width="3"
									/>
									<circle cx="210" cy="135" r="8" fill="#dcff65" />
									<path d="M210 135V73H277" stroke="#aaca67" stroke-dasharray="5 5" />
									<text x="5" y="27" font-size="14" fill="#dbefa9" font-family="monospace">
										OXY / PUTS
									</text>
								</svg>
							{:else if article.coverVariant === 'cover2'}
								<svg viewBox="0 0 300 180" fill="none" aria-hidden="true">
									<rect x="45" y="21" width="210" height="137" rx="2" stroke="#98a98b" />
									<text
										x="69"
										y="80"
										font-family="monospace"
										font-size="45"
										font-weight="700"
										fill="#dcff65"
									>
										$500
									</text>
									<path d="M70 109h165M70 122h123M70 135h91" stroke="#a4bd8a" stroke-width="2" />
								</svg>
							{:else}
								<svg viewBox="0 0 300 180" fill="none" aria-hidden="true">
									<rect x="47" y="18" width="206" height="144" rx="3" stroke="#90ab9b" />
									<path d="M47 57H253" stroke="#90ab9b" />
									<text x="67" y="44" font-family="monospace" font-size="12" fill="#d8f29d">
										SWING TRADE PLAN
									</text>
									<path
										d="M70 131 100 115 127 122 158 79 184 88 213 66 236 70"
										stroke="#dcff65"
										stroke-width="3"
									/>
									<path d="M72 138h163" stroke="#a8bd9d" stroke-dasharray="4 5" />
									<circle cx="213" cy="66" r="5" fill="#dcff65" />
								</svg>
							{/if}
						</div>
						<span class="cover-label">{article.coverLabel}</span>
					</div>

					<div class="blog-body">
						<div class="blog-meta">{article.meta}</div>
						<h3>{article.title}</h3>
						<p>{article.excerpt}</p>
						<a
							class="text-link dark"
							href={resolve(article.href as '/')}
							onclick={(e) => onPreviewNavigate?.(article.href, 'blog', e)}
						>
							<span>Read Full Article</span>
							<span class="arrow" aria-hidden="true">
								<ArrowUpRightIcon size={14} weight="bold" />
							</span>
						</a>
					</div>
				</article>
			{/each}
		</div>

		<p class="blog-editorial-note">
			Article cards are proposed editorial content; complete articles and cited evidence must be
			authored before launch.
		</p>
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

	.blog-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 11px;
	}

	.blog-card {
		background: var(--card-white);
		border: 1px solid #d9dbd5;
		display: flex;
		flex-direction: column;
	}

	.blog-cover {
		block-size: 185px;
		background: #151b1f;
		overflow: hidden;
		position: relative;
	}

	.blog-cover::before {
		content: '';
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(#ffffff0a 1px, transparent 1px),
			linear-gradient(90deg, #ffffff0a 1px, transparent 1px);
		background-size: 38px 38px;
	}

	.blog-cover .figure {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
	}

	.blog-cover svg {
		inline-size: 80%;
		block-size: 78%;
	}

	.blog-cover .cover-label {
		position: absolute;
		inset-inline-start: 22px;
		inset-block-end: 17px;
		color: #c8e991;
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.blog-cover.cover2 {
		background: #292f24;
	}

	.blog-cover.cover3 {
		background: #202936;
	}

	.blog-body {
		padding: 24px;
		display: flex;
		flex-direction: column;
		flex: 1;
		min-block-size: 0;
	}

	.blog-meta {
		color: #4f5c3f;
		margin-block-end: 15px;
	}

	.blog-card h3 {
		margin-block-end: 12px;
	}

	.blog-card p {
		color: var(--lightmuted);
		margin-block-end: 25px;
	}

	.blog-card .text-link {
		margin-block-start: auto;
	}

	.blog-editorial-note {
		font-size: 0.8125rem;
		color: var(--lightmuted);
		line-height: 1.75;
		margin: 22px 0 0;
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

	@media (min-width: 768px) {
		.blog-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 16px;
		}

		.blog-cover {
			block-size: 225px;
		}
	}

	@media (min-width: 1024px) {
		.blog-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 18px;
		}

		.blog-body {
			padding: 25px 26px 29px;
			min-block-size: 288px;
		}
	}

	@media (min-width: 1536px) {
		.blog-grid {
			gap: 24px;
		}
	}
</style>
