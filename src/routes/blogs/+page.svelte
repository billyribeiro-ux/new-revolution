<!-- src/routes/blogs/+page.svelte -->
<script lang="ts">
	import '#lib/styles/inner-page.css';
	import { resolve } from '$app/paths';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	interface BlogPostCard {
		slug: string;
		category: string;
		categorySlug: string;
		title: string;
		excerpt: string;
		keyTakeaway: string;
		publishedDate: string;
		publishedDisplay: string;
		readTime: string;
		imageUrl: string;
		imageAlt: string;
		hasAudio: boolean;
		featured?: boolean;
	}

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

	const categories = [
		{ id: 'all', label: 'All Market Intelligence' },
		{ id: 'options-mastery', label: 'Options & Greeks Mastery' },
		{ id: 'institutional-execution', label: 'Institutional Order Flow' },
		{ id: 'small-accounts', label: '$500+ Small Accounts' },
		{ id: 'working-professionals', label: 'Swing & Working Pros' },
		{ id: 'trading-psychology', label: 'Risk & Psychology' }
	];

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

	const blogPosts: BlogPostCard[] = [
		{
			slug: 'ultimate-guide-to-options-greeks',
			category: 'Options & Greeks Mastery',
			categorySlug: 'options-mastery',
			title: 'The Ultimate Guide to Options Greeks: Delta, Gamma, Theta, Vega & Rho',
			excerpt:
				'90% of retail options failures stem from Greeks ignorance. Master how Delta, Gamma, Theta, and Vega interact so you structure trades like an institutional desk instead of buying lottery tickets.',
			keyTakeaway:
				'The Greeks are not predictions—they are mathematical risk measurements that govern every options trade.',
			publishedDate: '2026-10-29',
			publishedDisplay: 'Oct 29, 2026',
			readTime: '18 min read',
			imageUrl:
				'https://revolutiontradingpros.com/wp-content/uploads/2025/08/ChatGPT-Image-Aug-28-2025-04_19_20-AM-1024x683.png',
			imageAlt: 'The Ultimate Guide to Options Greeks Graph and Risk Curve',
			hasAudio: true,
			featured: true
		},
		{
			slug: 'how-we-shorted-oxy-put-options-600-percent-overnight',
			category: 'Institutional Order Flow',
			categorySlug: 'institutional-execution',
			title: 'Anatomy of a 600% Overnight Options Trade: Shorting OXY Live Opposite Warren Buffett',
			excerpt:
				'When mainstream headlines celebrated Warren Buffett buying millions in Occidental Petroleum (OXY), retail chased the top. Here is how we spotted institutional distribution and banked 600% overnight on OXY Puts.',
			keyTakeaway:
				'Never follow billionaire headlines blindly—read institutional liquidity exhaustion and volume structure.',
			publishedDate: '2026-10-28',
			publishedDisplay: 'Oct 28, 2026',
			readTime: '7 min read',
			imageUrl: 'https://placehold.co/800x450/000000/ffffff?text=OXY+600%25+Put+Options+Case+Study',
			imageAlt: 'Chart breakdown of Occidental Petroleum OXY Put Options 600% overnight gain',
			hasAudio: true
		},
		{
			slug: 'growing-a-500-dollar-small-options-account-without-blowing-up',
			category: '$500+ Small Accounts',
			categorySlug: 'small-accounts',
			title: 'The $500 Small Account Playbook: Compounding Options & Stocks Without Gambling',
			excerpt:
				'Most small accounts blow up because they copy position sizes meant for $100,000 portfolios. Learn our exact contract price ceilings, T+1 cash settlement rotation, and defined-risk vertical spreads.',
			keyTakeaway:
				'Protect your first $500 with ironclad stop-losses and T+1 cash rotation before swinging for size.',
			publishedDate: '2026-10-24',
			publishedDisplay: 'Oct 24, 2026',
			readTime: '9 min read',
			imageUrl: 'https://placehold.co/800x450/111111/ffffff?text=%24500+Small+Account+Playbook',
			imageAlt: '$500 Small Account Options Compounding Blueprint',
			hasAudio: false
		},
		{
			slug: 'swing-trading-options-with-a-full-time-job-watchlist-routine',
			category: 'Swing & Working Pros',
			categorySlug: 'working-professionals',
			title: 'How Working Professionals Trade Institutional Swings in 20 Minutes a Day',
			excerpt:
				'You do not need six monitors or eight free hours a day to capture multi-day moves. Discover how to combine evening video watchlists with conditional orders and hard invalidation stops.',
			keyTakeaway:
				'Pre-planned entries, profit targets, and hard stops eliminate 9-to-5 screen addiction.',
			publishedDate: '2026-10-20',
			publishedDisplay: 'Oct 20, 2026',
			readTime: '6 min read',
			imageUrl: 'https://placehold.co/800x450/000000/ffffff?text=Working+Pro+Swing+Routine',
			imageAlt: 'Multi-day swing trading routine for working professionals',
			hasAudio: true
		},
		{
			slug: 'why-repainted-holy-grail-indicators-destroy-retail-accounts',
			category: 'Institutional Order Flow',
			categorySlug: 'institutional-execution',
			title: 'Exposed: How Repainted "Holy Grail" Indicators Trick Traders—And What Works Instead',
			excerpt:
				'Predatory marketers charge $2,500 for scripts that erase losing arrows after the candle closes. Learn how to spot repainting code and how non-repainting volume and liquidity telemetry works.',
			keyTakeaway:
				'If an indicator rewrites its signal after the bar closes, it is a marketing toy—not a trading tool.',
			publishedDate: '2026-10-16',
			publishedDisplay: 'Oct 16, 2026',
			readTime: '8 min read',
			imageUrl:
				'https://placehold.co/800x450/111111/ffffff?text=Zero-Repaint+Institutional+Telemetry',
			imageAlt: 'Comparison of repainted guru indicators vs non-repainting institutional telemetry',
			hasAudio: false
		},
		{
			slug: '3-best-options-strategies-for-consistent-income',
			category: 'Options & Greeks Mastery',
			categorySlug: 'options-mastery',
			title: '3 Institutional Options Strategies for Consistent Theta Income in Any Market Regime',
			excerpt:
				'Stop buying out-of-the-money weekly lottery tickets that expire worthless 85% of the time. Here are the three Theta-positive credit and diagonal structures we use to get paid while time passes.',
			keyTakeaway:
				'Sell 15–20 Delta premium in the 30–45 DTE window to capture accelerating Theta without expiration-week Gamma blowups.',
			publishedDate: '2026-10-12',
			publishedDisplay: 'Oct 12, 2026',
			readTime: '12 min read',
			imageUrl:
				'https://placehold.co/800x450/000000/ffffff?text=3+Institutional+Options+Strategies',
			imageAlt: '3 Institutional Options Strategies for Consistent Theta Income',
			hasAudio: true
		},
		{
			slug: 'risk-management-essentials-for-active-traders',
			category: 'Risk & Psychology',
			categorySlug: 'trading-psychology',
			title: 'Risk Management Essentials: The Goldman Sachs Prop Sizing Rules That Prevent Blowups',
			excerpt:
				'Having stood on the losing end early in my career before being mentored by Mark "Goldfinger" McGoldrick, I learned that offense wins trades, but risk mathematics saves careers.',
			keyTakeaway:
				'Size every position by maximum Greek and stop-loss dollar risk—never by gut conviction.',
			publishedDate: '2026-10-08',
			publishedDisplay: 'Oct 08, 2026',
			readTime: '10 min read',
			imageUrl: 'https://placehold.co/800x450/111111/ffffff?text=Institutional+Risk+Architecture',
			imageAlt: 'Institutional Risk Management and Position Sizing Matrix',
			hasAudio: false
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

	const filteredPosts = $derived(
		blogPosts.slice(1).filter((post) => {
			const matchesCategory = activeCategory === 'all' || post.categorySlug === activeCategory;
			const matchesSearch =
				searchQuery.trim() === '' ||
				post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
				post.category.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesCategory && matchesSearch;
		})
	);
</script>

<JsonLd schema={data.jsonLdSchema} />

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
								src={heroPost.imageUrl}
								alt={heroPost.imageAlt}
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

				<!-- Category Filter Bar (Simpler Trading Category Silo Pattern) -->
				<div class="category-bar" role="tablist" aria-label="Filter blogs by topic">
					{#each categories as cat (cat.id)}
						<button
							type="button"
							role="tab"
							aria-selected={activeCategory === cat.id}
							class="category-tab"
							class:category-tab--active={activeCategory === cat.id}
							onclick={() => (activeCategory = cat.id)}
						>
							{cat.label}
						</button>
					{/each}
				</div>

				<!-- 3-Column Blog Card Grid (Focus on High-Conversion Blog Card Anatomy) -->
				<div class="blog-cards-grid">
					{#each filteredPosts as post (post.slug)}
						<article class="blog-card" itemscope itemtype="https://schema.org/BlogPosting">
							<!-- Top Media & Category Overlay -->
							<a
								href={resolve(`/blogs/${post.slug}` as '/')}
								class="blog-card__media"
								itemprop="url"
							>
								<img
									src={post.imageUrl}
									alt={post.imageAlt}
									width="640"
									height="360"
									loading="lazy"
									decoding="async"
									itemprop="image"
									class="blog-card__img"
								/>
								<div class="blog-card__badges">
									<span class="blog-card__cat-badge">{post.category}</span>
									{#if post.hasAudio}
										<span class="blog-card__audio-badge" title="Includes Audio Narration">
											🎧 Audio
										</span>
									{/if}
								</div>
							</a>

							<!-- Card Body -->
							<div class="blog-card__body">
								<div class="blog-card__meta">
									<time datetime={post.publishedDate} itemprop="datePublished">
										{post.publishedDisplay}
									</time>
									<span>•</span>
									<span>{post.readTime}</span>
								</div>

								<h3 class="blog-card__title" itemprop="headline">
									<a href={resolve(`/blogs/${post.slug}` as '/')}>{post.title}</a>
								</h3>

								<p class="blog-card__excerpt" itemprop="description">
									{post.excerpt}
								</p>

								<!-- Billy's Key Takeaway Micro-Box Inside Card -->
								<div class="blog-card__takeaway">
									<strong>Key Takeaway:</strong>
									{post.keyTakeaway}
								</div>
							</div>

							<!-- Card Footer: HR Divider + Billy Ribeiro Avatar + Read CTA -->
							<div class="blog-card__footer">
								<div
									class="blog-card__author"
									itemprop="author"
									itemscope
									itemtype="https://schema.org/Person"
								>
									<img
										src="https://revolutiontradingpros.com/wp-content/uploads/2025/05/Billy-no-grey-768x768.png.webp"
										alt="Billy Ribeiro"
										width="38"
										height="38"
										loading="lazy"
										class="blog-card__avatar"
									/>
									<div class="blog-card__author-info">
										<span class="blog-card__author-name" itemprop="name"> Billy Ribeiro </span>
										<span class="blog-card__author-meta">{post.readTime}</span>
									</div>
								</div>

								<a
									href={resolve(`/blogs/${post.slug}` as '/')}
									class="blog-card__read-btn"
									aria-label={`Read ${post.title}`}
								>
									Read Article →
								</a>
							</div>
						</article>
					{/each}
				</div>

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
