<!-- src/routes/blogs/+page.svelte -->
<script lang="ts">
	import '#lib/styles/inner-page.css';
	import { resolve } from '$app/paths';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import BlogCard from '#lib/components/blog/BlogCard.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import CatalogGrid from '#lib/components/ui/CatalogGrid.svelte';
	import FilterChips from '#lib/components/ui/FilterChips.svelte';
	import { blogCategories, blogPosts } from '#lib/data/blog-hub.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	interface FeaturedTopic {
		category: string;
		title: string;
		href: string;
		readTime: string;
		publishedDisplay: string;
	}

	interface RoomCtaCard {
		badge: string;
		title: string;
		description: string;
		ctaText: string;
		href: string;
	}

	const featuredTopics: FeaturedTopic[] = [
		{
			category: 'Case Study • +600% Overnight',
			title: 'How We Shorted OXY Put Options Live While Warren Buffett Bought Millions Long',
			href: '/blogs/how-we-shorted-oxy-put-options-600-percent-overnight',
			readTime: '7 min read',
			publishedDisplay: 'Oct 28, 2026'
		},
		{
			category: '$500+ Small Accounts',
			title: 'The $500 Small Account Blueprint: T+1 Cash Rotation Without Blowing Up',
			href: '/blogs/growing-a-500-dollar-small-options-account-without-blowing-up',
			readTime: '9 min read',
			publishedDisplay: 'Oct 24, 2026'
		},
		{
			category: 'Working Professionals',
			title: 'How 9-to-5 Professionals Trade Institutional Swings Using Pre-Set Stops',
			href: '/blogs/swing-trading-options-with-a-full-time-job-watchlist-routine',
			readTime: '6 min read',
			publishedDisplay: 'Oct 20, 2026'
		},
		{
			category: 'Macro Cycle Timing',
			title: 'Inside "The Move Prior to The Move": How We Called the 2020 & 2022 Tops and Bottoms',
			href: '/blogs/the-move-prior-to-the-move-2020-2022-market-calls',
			readTime: '11 min read',
			publishedDisplay: 'Oct 15, 2026'
		}
	];

	const roomCtaCards: RoomCtaCard[] = [
		{
			badge: 'Live Intraday Floor',
			title: 'Day Trading Room',
			description:
				'For active traders seeking real-time voice, live screen sharing, and intraday stock & options execution.',
			ctaText: 'Learn More →',
			href: '/live-trading-rooms/day-trading-room'
		},
		{
			badge: '9-to-5 Friendly',
			title: 'Swing Trading Room',
			description:
				'For working professionals focused on multi-day stock and options moves with pre-planned entries and stops.',
			ctaText: 'Learn More →',
			href: '/live-trading-rooms/swing-trading-room'
		},
		{
			badge: '$500+ Starting Capital',
			title: 'Small Accounts Room',
			description:
				'Strict risk control, T+1 cash rotation, and affordable setups engineered to grow a $500+ small account.',
			ctaText: 'Learn More →',
			href: '/live-trading-rooms/small-accounts-room'
		},
		{
			badge: 'Index Options Alerts',
			title: 'SPX Profit Pulse Alerts',
			description:
				'Get our highest-conviction institutional setups and exact levels for SPX index options.',
			ctaText: 'Explore Alerts →',
			href: '/alert-services/spx-profit-pulse'
		},
		{
			badge: 'Video Watchlist Alerts',
			title: 'Explosive Swings Alerts',
			description:
				'Affordable alert-only membership delivering detailed video watchlists with exact entries, exits, and stops.',
			ctaText: 'Explore Alerts →',
			href: '/alert-services/explosive-swings'
		}
	];

	let activeCategory = $state('all');
	let searchQuery = $state('');

	const heroPost = $derived(blogPosts[0]);

	const gridPosts = blogPosts.slice(1);

	const filteredPosts = $derived.by(() => {
		const query = searchQuery.trim().toLowerCase();
		return gridPosts.filter((post) => {
			const matchesCategory = activeCategory === 'all' || post.categorySlug === activeCategory;
			const matchesSearch =
				query === '' ||
				post.title.toLowerCase().includes(query) ||
				post.excerpt.toLowerCase().includes(query) ||
				post.category.toLowerCase().includes(query);
			return matchesCategory && matchesSearch;
		});
	});
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#blogs-hub">Skip to content</a>

<div class="app-shell">
	<Navbar />

	<main id="blogs-hub" class="inner-page blogs-page">
		<!-- =========================================================================
       SECTION 1: BREADCRUMB BAR
       ========================================================================= -->
		<nav class="breadcrumb-bar" aria-label="Breadcrumb">
			<div class="container breadcrumb-bar__inner">
				<ol class="breadcrumb-list">
					<li><a href={resolve('/')}>Home</a></li>
					<li aria-hidden="true">
						<CaretRightIcon size={12} weight="bold" />
					</li>
					<li aria-current="page">Blogs</li>
				</ol>
				<p class="breadcrumb-bar__status">
					<span>Educate • Innovate • Prosper</span> • <span>Written by Billy Ribeiro</span>
				</p>
			</div>
		</nav>

		<!-- =========================================================================
       SECTION 2: BLOG HEADER & SIMPLER-STYLE ASYMMETRIC HERO (7 LEFT / 5 RIGHT)
       ========================================================================= -->
		<section class="hero-hub" aria-labelledby="blogs-h1">
			<div class="container">
				<div class="hub-intro">
					<h1 id="blogs-h1" class="hub-h1">
						<span class="hub-h1__kicker">
							Revolution Trading Pros Market Intelligence &amp; Education Hub
						</span>
						<span class="hub-h1__display"> Institutional Stock &amp; Options Trading Blog </span>
					</h1>
					<p class="hub-intro__sub">
						No recycled textbook fluff. Read battle-tested breakdowns on Options Greeks,
						institutional order flow, $500+ small account risk management, and macro cycle
						timing—written by a trader mentored by former Goldman Sachs legend
						<strong>Mark "Goldfinger" McGoldrick</strong>.
					</p>
				</div>

				<!-- 12-Column Asymmetric Split: Left 7 Cols Flagship Post + Right 5 Cols Featured Topics -->
				<div class="hero-hub__grid">
					<!-- Left 7 Columns: Flagship Featured Blog Card -->
					<article class="hero-post-card" itemscope itemtype="https://schema.org/BlogPosting">
						<a
							href={resolve(`/blogs/${heroPost.slug}` as '/')}
							class="hero-post-card__media"
							itemprop="url"
						>
							<img
								src={heroPost.image.src}
								alt={heroPost.image.alt}
								width="1024"
								height="683"
								loading="eager"
								itemprop="image"
								class="hero-post-card__img"
							/>
							<span class="hero-post-card__CornerBadge">Flagship Masterclass</span>
						</a>

						<div class="hero-post-card__body">
							<div class="card-meta-row">
								<span class="category-pill">{heroPost.category}</span>
								<time datetime={heroPost.publishedDate} itemprop="datePublished" class="meta-time">
									{heroPost.publishedDisplay}
								</time>
								<span class="meta-time">• {heroPost.readTime}</span>
								{#if heroPost.hasAudio}
									<span class="audio-pill">🎧 Audio Included</span>
								{/if}
							</div>

							<h2 class="hero-post-card__title" itemprop="headline">
								<a href={resolve(`/blogs/${heroPost.slug}` as '/')}>{heroPost.title}</a>
							</h2>

							<p class="hero-post-card__excerpt" itemprop="description">
								{heroPost.excerpt}
							</p>

							<div class="hero-post-card__takeaway">
								<strong>Billy’s Key Takeaway:</strong> "{heroPost.keyTakeaway}"
							</div>

							<hr class="card-divider" />

							<!-- Author Footer Row -->
							<div class="card-author-row">
								<div
									class="author-chip"
									itemprop="author"
									itemscope
									itemtype="https://schema.org/Person"
								>
									<img
										src="https://revolutiontradingpros.com/wp-content/uploads/2025/05/Billy-no-grey-768x768.png.webp"
										alt="Billy Ribeiro"
										width="48"
										height="48"
										class="author-chip__avatar"
									/>
									<div>
										<span class="author-chip__name" itemprop="name">Billy Ribeiro</span>
										<span class="author-chip__role">
											Founder • Mentored by Mark "Goldfinger" McGoldrick
										</span>
									</div>
								</div>

								<a href={resolve(`/blogs/${heroPost.slug}` as '/')} class="btn btn--solid">
									Read Full Guide →
								</a>
							</div>
						</div>
					</article>

					<!-- Right 5 Columns: Featured Topics Stack + Free Cheat Sheet Opt-in -->
					<aside class="featured-sidebar" aria-label="Featured Trading Topics and Free Cheat Sheet">
						<div class="featured-topics-box">
							<div class="featured-topics-box__header">
								<span class="meta-label">Must-Read Pillars</span>
								<h2 class="featured-topics-box__title">Featured Topics</h2>
							</div>

							<div class="featured-topics-list">
								{#each featuredTopics as topic (topic.href)}
									<a href={resolve(topic.href as '/')} class="featured-topic-item">
										<span class="featured-topic-item__cat">{topic.category}</span>
										<h3 class="featured-topic-item__title">{topic.title}</h3>
										<div class="featured-topic-item__meta">
											<span>{topic.publishedDisplay}</span>
											<span>•</span>
											<span>{topic.readTime}</span>
											<span class="featured-topic-item__arrow">Read →</span>
										</div>
									</a>
								{/each}
							</div>
						</div>

						<!-- Sidebar Lead Magnet Box -->
						<div class="sidebar-lead-box">
							<span class="section-kicker">Free Instant PDF</span>
							<h3 class="sidebar-lead-box__title">
								Get Our Options Greeks &amp; Execution Cheat Sheet Sent to Your Inbox
							</h3>
							<p class="sidebar-lead-box__copy">
								Includes our exact Delta/Theta selection matrix, $500+ small account sizing rules,
								and pre-trade checklist.
							</p>
							<form method="POST" action="?/claimOptionsCheatSheet" class="sidebar-lead-form">
								<label for="blog-hub-email" class="sr-only">Email Address</label>
								<input
									type="email"
									id="blog-hub-email"
									name="email"
									required
									placeholder="Enter your best email..."
									class="sidebar-lead-form__input"
								/>
								<button type="submit" class="btn btn--solid btn--full">
									Send Me the Free Cheat Sheet →
								</button>
							</form>
						</div>
					</aside>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 3: RECENT BLOGS + CATEGORY FILTER PILLS + 3-COLUMN BLOG CARD GRID
       ========================================================================= -->
		<section id="recent-blogs" class="recent-blogs-section" aria-labelledby="recent-blogs-h2">
			<div class="container">
				<!-- Header & Search Row -->
				<div class="recent-header">
					<div>
						<span class="section-kicker">People Over Profits • 100% Free Education</span>
						<h2 id="recent-blogs-h2" class="section-h2">Recent Blogs &amp; Market Breakdowns</h2>
					</div>

					<div class="search-box">
						<label for="blog-search-input" class="meta-label">Search Articles:</label>
						<input
							type="search"
							id="blog-search-input"
							bind:value={searchQuery}
							placeholder="Search Options Greeks, OXY, $500 account..."
							class="search-box__input"
						/>
					</div>
				</div>

				<FilterChips
					label="Filter blogs by topic"
					options={blogCategories}
					bind:value={activeCategory}
					tone="light"
				/>

				<!-- Card grid: crawlable h3 titles; the whole card is one stretched link to the article. -->
				<CatalogGrid
					items={filteredPosts}
					key={(post) => post.slug}
					total={gridPosts.length}
					noun="articles"
					emptyMessage="No articles match your search."
					tone="light"
				>
					{#snippet children(post)}
						<BlogCard {post} tone="light" />
					{/snippet}
				</CatalogGrid>

				<!-- Crawlable SEO Pagination Bar (Fixes Simpler Trading's JS-Only "Show More" Flaw) -->
				<nav class="pagination-bar" aria-label="Blog Pagination">
					<a
						href={resolve('/blogs?page=1' as '/')}
						aria-current="page"
						class="pagination-link pagination-link--active"
					>
						1
					</a>
					<a href={resolve('/blogs?page=2' as '/')} class="pagination-link">2</a>
					<a href={resolve('/blogs?page=3' as '/')} class="pagination-link">3</a>
					<a href={resolve('/blogs?page=2' as '/')} class="pagination-link pagination-link--next">
						Next Page →
					</a>
				</nav>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 4: START TRADING LIKE A PROFESSIONAL (5 ROOM & ALERT CTA CARDS)
       ========================================================================= -->
		<section class="pro-cta-section" aria-labelledby="pro-cta-h2">
			<div class="container">
				<div class="pro-cta-box">
					<div class="pro-cta-box__header">
						<span class="section-kicker">Educate • Innovate • Prosper</span>
						<h2 id="pro-cta-h2" class="section-h2 pro-cta-box__h2">
							Start Trading Like a Professional
						</h2>
						<p class="body-copy pro-cta-box__sub">
							Ready to apply what you read in live market conditions? Join our transparent trading
							community for real-time execution, video watchlists with exact entries and stops, and
							$500+ small account mentorship.
						</p>
					</div>

					<div class="room-cta-grid">
						{#each roomCtaCards as card (card.href)}
							<article class="room-cta-card">
								<div>
									<span class="room-cta-card__badge">{card.badge}</span>
									<h3 class="room-cta-card__title">{card.title}</h3>
									<p class="room-cta-card__desc">{card.description}</p>
								</div>
								<a href={resolve(card.href as '/')} class="btn btn--solid btn--full">
									{card.ctaText}
								</a>
							</article>
						{/each}
					</div>
				</div>
			</div>
		</section>
	</main>

	<Footer />
</div>
