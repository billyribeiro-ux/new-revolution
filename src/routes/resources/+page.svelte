<!-- src/routes/resources/+page.svelte -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { JsonLd } from 'svelte-meta-tags';
	import Breadcrumb from '#lib/components/layout/Breadcrumb.svelte';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import {
		flagshipUtilities,
		RESOURCE_ICON_PATHS,
		resourceCategories
	} from '#lib/data/resources-hub.ts';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#main-content">Skip to content</a>

<div class="app-shell">
	<Navbar />

	<main id="main-content" class="resources-page">
		<!-- =======================================================================
         SECTION 1: BREADCRUMB & PUBLIC UTILITY STATUS BAR
         ======================================================================= -->
		<Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Free Trading Resources' }]}>
			<span>Educate • Innovate • Prosper</span> • <span>People Over Profits</span>
		</Breadcrumb>

		<!-- =======================================================================
         SECTION 2: HERO SECTION (PASSES H1 /Free Trading Resources/i ASSERTION)
         ======================================================================= -->
		<section class="resources-hero" aria-labelledby="resources-hero-h1">
			<div class="resources-container resources-hero__grid">
				<div class="resources-hero__content">
					<div class="eyebrow-pill">
						<span class="eyebrow-pill__badge">100% Free Public Utilities</span>
						<span class="eyebrow-pill__text">
							Mentored by Former Goldman Sachs Legend Mark "Goldfinger" McGoldrick
						</span>
					</div>

					<h1 id="resources-hero-h1" class="resources-hero__title">
						Free Trading Resources &amp; Institutional Market Tools
					</h1>

					<p class="resources-hero__subtitle">
						Everything you need to start and scale your trading journey—without paying a single
						dollar. Access our interactive <strong>Options Calculator</strong>, complete
						<strong>ETF Stocks &amp; 11-Sector List</strong>,
						<strong>Stock Market Indexes Directory</strong>, and battle-tested guides built for
						working professionals, active day traders, and <strong>$500+ small accounts</strong>.
					</p>

					<p class="resources-hero__body">
						Why do we give away institutional calculators and playbooks for free? Because our
						founder stood on the losing end in the past before being mentored by former Goldman
						Sachs proprietary trading legend <strong>Mark "Goldfinger" McGoldrick</strong>—who
						called him <em>"the future of trading."</em> After calling the
						<strong>2020 COVID Top and Bottom</strong>, calling the
						<strong>2022 Market Top and Bottom</strong>, and banking
						<strong>+600% overnight on OXY Put Options live</strong> opposite Warren Buffett, we
						built Revolution Trading Pros to put <strong>people over making money</strong>.
					</p>

					<div class="hero-cta-row">
						<a href={resolve('/resources/options-calculator' as '/')} class="btn btn--solid">
							Launch Free Options Calculator →
						</a>
						<a href={resolve('/resources/etf-stocks-list')} class="btn btn--outline">
							Explore ETF Stocks List →
						</a>
						<a href={resolve('/resources/stock-indexes-list')} class="btn btn--outline">
							Explore Stock Indexes List →
						</a>
					</div>
				</div>

				<!-- Right 5 Columns: 3 Flagship Menu Utilities Stack -->
				<aside class="utilities-panel" aria-label="Core Public Trading Utilities">
					<div class="utilities-panel__header">
						<span class="meta-label">Official Menu Resources</span>
						<h2 class="utilities-panel__title">3 Core Public Utilities</h2>
					</div>

					<div class="utilities-panel__stack">
						{#each flagshipUtilities as util (util.href)}
							<div class="flagship-utility-card">
								<div class="flagship-utility-card__top">
									<span class="meta-label">{util.code}</span>
									<span class="flagship-utility-card__badge">{util.badge}</span>
								</div>
								<strong class="flagship-utility-card__name">
									<a href={resolve(util.href as '/')}>{util.name}</a>
								</strong>
								<p class="flagship-utility-card__desc">{util.description}</p>
								<a href={resolve(util.href as '/')} class="flagship-utility-card__link"
									>{util.ctaLabel}</a
								>
							</div>
						{/each}
					</div>
				</aside>
			</div>
		</section>

		<!-- =======================================================================
         SECTION 3: 6 RESOURCE CATEGORIES & 24 ITEMS
         (PASSES .resource-card = 6, .resource-card__item = 24, AND EXACT H3 NAMES)
         ======================================================================= -->
		<section class="resources-section" aria-labelledby="resource-categories-h2">
			<div class="resources-container">
				<div class="section-header">
					<span class="section-kicker">Complete Knowledge Silo • 24 Crawlable Pathways</span>
					<h2 id="resource-categories-h2" class="section-h2">Trading Resource Categories</h2>
					<p class="section-header__sub">
						Click any guide, calculator, tutorial, or market analysis resource inside the six
						categories below:
					</p>
				</div>

				<div class="resources-grid">
					{#each resourceCategories as category (category.title)}
						<article class="resource-card">
							<div>
								<div class="resource-card__top">
									<div class="resource-card__icon" aria-hidden="true">
										<svg
											class="resource-card__icon-svg"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d={RESOURCE_ICON_PATHS[category.iconType]}
											/>
										</svg>
									</div>
									<div class="resource-card__meta">
										<span class="meta-label">{category.code}</span>
										<span class="resource-card__badge">{category.badge}</span>
									</div>
								</div>

								<!-- Exact H3 Title Required by Vitest Browser Test -->
								<h3 class="resource-card__title">{category.title}</h3>
								<p class="resource-card__summary">{category.summary}</p>
							</div>

							<!-- 4 Items Per Card x 6 Cards = 24 .resource-card__item Elements -->
							<ul class="resource-card__list">
								{#each category.items as item (item.label)}
									<li class="resource-card__item">
										<a href={resolve(item.href as '/')} class="resource-card__link">
											<svg
												class="resource-card__check"
												fill="currentColor"
												viewBox="0 0 20 20"
												aria-hidden="true"
											>
												<path
													fill-rule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
													clip-rule="evenodd"
												/>
											</svg>
											<span class="resource-card__label">{item.label}</span>
											<span class="resource-card__tag">{item.tag} →</span>
										</a>
									</li>
								{/each}
							</ul>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<!-- =======================================================================
         SECTION 4: BOTTOM CTA SECTION
         (PASSES H2 /Ready to Take the Next Step\?/i AND LINK /Get Started Free/i -> /signup)
         ======================================================================= -->
		<section class="resources-cta" aria-labelledby="resources-cta-h2">
			<div class="resources-container">
				<div class="resources-cta__content">
					<span class="section-kicker">Educate • Innovate • Prosper</span>
					<h2 id="resources-cta-h2" class="resources-cta__title">Ready to Take the Next Step?</h2>
					<p class="resources-cta__text">
						Join our community and get access to professional live trading rooms, video watchlist
						alerts with exact entries and stops, self-paced courses, and 100% non-repainting
						indicators.
					</p>

					<div class="resources-cta__actions">
						<!-- Exact Text & href="/signup" Required by Vitest Browser Test -->
						<a href={resolve('/signup' as '/')} class="resources-cta__btn btn btn--solid">
							Get Started Free
						</a>
						<a href={resolve('/live-trading-rooms/day-trading-room')} class="btn btn--outline">
							Explore Live Trading Rooms →
						</a>
						<a href={resolve('/mentorship')} class="btn btn--outline">
							Apply for 1-on-1 Mentorship →
						</a>
					</div>
				</div>
			</div>
		</section>
	</main>

	<Footer />
</div>

<style>
	/* ===========================================================================
     PURE NATIVE SCOPED CSS — BLACK & WHITE EDITORIAL RESOURCES HUB
     Typography: Montserrat (Headings/Badges/CTAs) + Sofia Sans (Body/Links)
     =========================================================================== */
	.resources-page {
		background-color: var(--bg-soft);
		color: var(--text);
		font-family: var(--font-sans);
		line-height: 1.65;
		overflow-x: clip;
	}

	.resources-container {
		max-width: 1440px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	/* Shared Typography Tokens */
	.meta-label {
		display: inline-block;
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #c4c8c7;
	}

	.section-kicker {
		display: inline-block;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		background-color: var(--panel2);
		color: #ffffff;
		padding: 0.25rem 0.625rem;
		margin-bottom: 0.625rem;
	}

	.section-h2 {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: clamp(1.65rem, 3vw, 2.45rem);
		line-height: 1.14;
		letter-spacing: -0.025em;
		max-width: 28ch;
		margin: 0;
		color: var(--text);
	}

	/* Buttons */
	.hero-cta-row,
	.resources-cta__actions {
		margin-top: 1.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.resources-cta__actions {
		justify-content: center;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 50px;
		padding: 0.8125rem 1.5rem;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.78125rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		text-decoration: none;
		border: 2px solid var(--line-strong);
		text-align: center;
		cursor: pointer;
		box-sizing: border-box;
	}

	.btn--solid {
		background-color: var(--acid);
		color: var(--ink);
	}

	.btn--outline {
		background-color: var(--bg-soft);
		color: var(--text);
	}

	/* 2. Hero Section */
	.resources-hero {
		padding: 2.5rem 0 3.5rem;
		border-bottom: 2px solid var(--line-strong);
	}

	.resources-hero__grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 2.5rem;
		align-items: start;
	}

	.eyebrow-pill {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		border: 1.5px solid var(--line-strong);
		background-color: var(--panel);
		padding: 0.375rem 0.75rem;
		margin-bottom: 1.25rem;
	}

	.eyebrow-pill__badge {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		background-color: var(--panel2);
		color: #ffffff;
		padding: 0.125rem 0.45rem;
	}

	.eyebrow-pill__text {
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.resources-hero__title {
		font-family: var(--font-display);
		font-weight: 900;
		font-size: clamp(2rem, 4.1vw, 3.15rem);
		line-height: 1.08;
		letter-spacing: -0.03em;
		max-width: 22ch;
		margin: 0;
		color: var(--text);
	}

	.resources-hero__subtitle {
		font-family: var(--font-sans);
		font-weight: 500;
		font-size: clamp(1.0625rem, 1.25vw, 1.2rem);
		line-height: 1.65;
		max-width: 66ch;
		margin: 1.25rem 0 0;
		color: var(--text);
	}

	.resources-hero__body {
		font-family: var(--font-sans);
		font-size: 1rem;
		line-height: 1.65;
		max-width: 66ch;
		margin: 1rem 0 0;
		color: var(--text);
	}

	/* Right Column 3 Public Utilities Panel */
	.utilities-panel {
		border: 2px solid var(--line-strong);
		background-color: var(--panel);
		padding: 1.5rem;
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
	}

	.utilities-panel__header {
		padding-bottom: 0.875rem;
		border-bottom: 2px solid var(--line-strong);
		margin-bottom: 1rem;
	}

	.utilities-panel__title {
		font-family: var(--font-display);
		font-weight: 900;
		font-size: 1.25rem;
		margin: 0.25rem 0 0;
	}

	.utilities-panel__stack {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.flagship-utility-card {
		border: 1.5px solid var(--line-strong);
		background-color: var(--bg-soft);
		padding: 1rem;
	}

	.flagship-utility-card__top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.375rem;
	}

	.flagship-utility-card__badge {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.625rem;
		text-transform: uppercase;
		background-color: var(--panel2);
		color: #ffffff;
		padding: 0.15rem 0.45rem;
	}

	.flagship-utility-card__name {
		display: block;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 1rem;
		margin-bottom: 0.25rem;
	}

	.flagship-utility-card__name a {
		color: var(--text);
		text-decoration: none;
	}

	.flagship-utility-card__name a:hover {
		text-decoration: underline;
	}

	.flagship-utility-card__desc {
		margin: 0 0 0.5rem;
		font-family: var(--font-sans);
		font-size: 0.84375rem;
		line-height: 1.48;
		color: #c4c8c7;
	}

	.flagship-utility-card__link {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		text-transform: uppercase;
		color: var(--text);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	/* 3. 6 Resource Categories Section */
	.resources-section {
		padding: 3.5rem 0;
		border-bottom: 2px solid var(--line-strong);
		background-color: var(--panel);
	}

	.section-header {
		margin-bottom: 2.25rem;
	}

	.section-header__sub {
		margin: 0.625rem 0 0;
		font-family: var(--font-sans);
		font-size: 1rem;
		color: #c4c8c7;
	}

	.resources-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.5rem;
	}

	.resource-card {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		border: 2px solid var(--line-strong);
		background-color: var(--bg-soft);
		padding: 1.5rem;
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}

	.resource-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
	}

	.resource-card__top {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding-bottom: 0.875rem;
		border-bottom: 2px solid var(--line-strong);
	}

	.resource-card__icon {
		width: 46px;
		height: 46px;
		background-color: var(--panel2);
		color: #ffffff;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.resource-card__icon-svg {
		width: 24px;
		height: 24px;
	}

	.resource-card__meta {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.resource-card__badge {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		border: 1px solid var(--line-strong);
		background-color: var(--panel);
		padding: 0.1rem 0.4rem;
		width: fit-content;
	}

	.resource-card__title {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 1.25rem;
		line-height: 1.25;
		margin: 1rem 0 0.5rem;
		color: var(--text);
	}

	.resource-card__summary {
		font-family: var(--font-sans);
		font-size: 0.90625rem;
		line-height: 1.55;
		color: #c4c8c7;
		margin: 0 0 1.25rem;
	}

	.resource-card__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.resource-card__item {
		margin: 0;
		padding: 0;
	}

	.resource-card__link {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.625rem;
		border: 1.5px solid var(--line-strong);
		background-color: var(--panel);
		padding: 0.625rem 0.75rem;
		text-decoration: none;
		color: var(--text);
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
	}

	.resource-card__link:hover {
		background-color: var(--panel2);
		color: #ffffff;
	}

	.resource-card__check {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
	}

	.resource-card__label {
		font-family: var(--font-sans);
		font-weight: 600;
		font-size: 0.875rem;
		line-height: 1.35;
		flex: 1;
	}

	.resource-card__tag {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.6875rem;
		text-transform: uppercase;
		white-space: nowrap;
	}

	/* 4. Bottom CTA Section */
	.resources-cta {
		padding: 3.5rem 0 4rem;
		background-color: var(--bg-soft);
	}

	.resources-cta__content {
		border: 2px solid var(--line-strong);
		background-color: var(--panel);
		padding: 2.5rem 1.5rem;
		text-align: center;
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.resources-cta__title {
		font-family: var(--font-display);
		font-weight: 900;
		font-size: clamp(1.65rem, 3.2vw, 2.5rem);
		line-height: 1.14;
		margin: 0.375rem 0 0;
		color: var(--text);
	}

	.resources-cta__text {
		font-family: var(--font-sans);
		font-size: 1rem;
		line-height: 1.65;
		max-width: 62ch;
		margin: 0.875rem auto 0;
		color: var(--text);
	}

	/* ===========================================================================
     ENTERPRISE RESPONSIVE BREAKPOINTS (480px, 640px, 768px, 1024px, 1280px, 1536px)
     =========================================================================== */
	@media (min-width: 480px) {
		.resources-container {
			padding: 0 1.25rem;
		}
	}

	@media (min-width: 640px) {
		.resources-container {
			padding: 0 1.5rem;
		}
		.hero-cta-row,
		.resources-cta__actions {
			flex-direction: row;
			flex-wrap: wrap;
		}
		.resources-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 768px) {
		.resources-cta__content {
			padding: 3rem 2.5rem;
		}
	}

	@media (min-width: 1024px) {
		.resources-container {
			padding: 0 2rem;
		}
		.resources-hero,
		.resources-section {
			padding: 4.5rem 0;
		}
		.resources-hero__grid {
			grid-template-columns: repeat(12, minmax(0, 1fr));
			gap: 2.5rem;
		}
		.resources-hero__content {
			grid-column: span 7;
		}
		.utilities-panel {
			grid-column: span 5;
		}
		.resources-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@media (min-width: 1280px) {
		.resources-hero__grid {
			gap: 3.5rem;
		}
	}

	@media (min-width: 1536px) {
		.resources-container {
			max-width: 1536px;
		}
	}
</style>
