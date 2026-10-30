<!-- src/routes/resources/+page.svelte -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type ResourceCategoryFilter =
		| 'all'
		| 'free-tools'
		| 'beginner-small-accounts'
		| 'video-tutorials'
		| 'market-analysis'
		| 'psychology-risk'
		| 'faq-support';

	interface FlagshipUtility {
		code: string;
		badge: string;
		title: string;
		subtitle: string;
		description: string;
		highlights: string[];
		ctaLabel: string;
		href: string;
		svgType: 'calculator' | 'etf-list' | 'index-list';
	}

	interface ResourceVaultCategory {
		id: ResourceCategoryFilter;
		code: string;
		badge: string;
		title: string;
		summary: string;
		iconType: 'book' | 'calculator' | 'video' | 'chart' | 'mindset' | 'support';
		items: {
			label: string;
			tag: string;
			href: string;
		}[];
	}

	interface FaqItem {
		question: string;
		answer: string;
	}

	interface RoomCta {
		badge: string;
		title: string;
		description: string;
		ctaLabel: string;
		href: string;
	}

	/* ===========================================================================
     THE 3 CANONICAL MENU RESOURCES (TOP PRIORITY INTERNAL LINK SILO)
     =========================================================================== */
	const flagshipUtilities: FlagshipUtility[] = [
		{
			code: 'Public Utility 01 // Interactive Risk & Greeks Engine',
			badge: '100% Free Tool',
			title: 'Options Profit, Risk & Greeks Calculator',
			subtitle: 'Position Sizing, Delta/Theta Simulation & Breakeven Mapping',
			description:
				'Never enter an options trade blind. Calculate your exact maximum dollar risk, breakeven price, reward-to-risk ratio, and Options Greeks (Delta, Gamma, Theta, Vega) sensitivity before submitting your order.',
			highlights: [
				'Supports single-leg Calls/Puts, Vertical Credit/Debit Spreads & Iron Condors',
				'Built-in $500+ Small Account max-risk-per-trade position sizer',
				'Models implied volatility (Vega) crush and daily time decay (Theta)'
			],
			ctaLabel: 'Launch Options Calculator →',
			href: '/resources/options-calculator',
			svgType: 'calculator'
		},
		{
			code: 'Public Utility 02 // Institutional Sector & Liquidity Map',
			badge: '12 Core + 11 Sectors',
			title: 'Complete ETF Stocks & Sector Directory',
			subtitle: 'SPY, QQQ, IWM, GLD & All 11 Official S&P 500 GICS Sectors',
			description:
				'Explore the most liquid Exchange-Traded Funds in the market. Compare intraday options liquidity, $500+ small account contract affordability, and institutional sector rotation across all 11 S&P 500 sectors.',
			highlights: [
				'Direct live TradingView chart links mapped to exact NYSE Arca & Nasdaq exchanges',
				'Complete 11-sector GICS breakdown (XLK, XLF, XLE, XLV, SMH, XBI & more)',
				'Side-by-side ETFs vs. Mutual Funds execution and tax comparison matrix'
			],
			ctaLabel: 'Explore ETF Stocks List →',
			href: '/resources/etf-stocks-list',
			svgType: 'etf-list'
		},
		{
			code: 'Public Utility 03 // Macro & Index Benchmark Guide',
			badge: 'SPX • NDX • DJI • RUT • VIX',
			title: 'Stock Market Indexes Directory',
			subtitle: 'Cash-Settled Index Mechanics, Section 1256 Taxes & Dealer Gamma',
			description:
				'Understand the major U.S. and global stock market indexes that drive institutional order flow—including the S&P 500 (SPX), Nasdaq-100 (NDX), Dow Jones (DJI), Russell 2000 (RUT), and the VIX Volatility Index.',
			highlights: [
				'Explains European cash settlement, zero early assignment risk & Section 1256 60/40 tax rules',
				'Compares full-sized index options (SPX/NDX) vs. mini-index (XSP) and ETF options (SPY/QQQ)',
				'Shows how we read VIX regimes and index breadth to call macro market turns'
			],
			ctaLabel: 'Explore Stock Indexes List →',
			href: '/resources/stock-indexes-list',
			svgType: 'index-list'
		}
	];

	/* ===========================================================================
     UPGRADED 6-CATEGORY RESOURCE VAULT (EVERY ITEM IS A CRAWLABLE <A> LINK)
     =========================================================================== */
	const resourceCategories: ResourceVaultCategory[] = [
		{
			id: 'free-tools',
			code: 'Category 01 // Calculators & Reference Lists',
			badge: 'Interactive Utilities',
			title: 'Free Calculators & Market Lists',
			summary:
				'Institutional-grade utilities and ticker directories to plan position size, select liquid contracts, and track sector rotation.',
			iconType: 'calculator',
			items: [
				{
					label: 'Interactive Options Profit, Greeks & Position Size Calculator',
					tag: 'Live Tool',
					href: '/resources/options-calculator'
				},
				{
					label: 'Complete ETF Stocks List & 11 S&P 500 Sector Directory',
					tag: 'Directory',
					href: '/resources/etf-stocks-list'
				},
				{
					label: 'Stock Market Indexes List (SPX, NDX, RUT, DJI & VIX Guide)',
					tag: 'Directory',
					href: '/resources/stock-indexes-list'
				},
				{
					label: 'Non-Repainting Market Scanners & Live Radar Suite',
					tag: 'Store Tool',
					href: '/store/scanners'
				}
			]
		},
		{
			id: 'beginner-small-accounts',
			code: 'Category 02 // Foundation & $500+ Accounts',
			badge: 'Starter Playbooks',
			title: 'Beginner & $500+ Small Account Guides',
			summary:
				'Step-by-step foundational guides built to protect new traders from fake guru traps and compound small accounts safely.',
			iconType: 'book',
			items: [
				{
					label: 'The Ultimate Guide to Options Greeks (Delta, Gamma, Theta, Vega)',
					tag: 'Masterclass',
					href: '/blogs/ultimate-guide-to-options-greeks'
				},
				{
					label: 'Growing a $500+ Small Account With T+1 Cash Rotation (No PDT)',
					tag: '$500+ Guide',
					href: '/blogs/growing-a-500-dollar-small-options-account-without-blowing-up'
				},
				{
					label: 'Inside the $500+ Small Accounts Live Trading Room',
					tag: 'Live Room',
					href: '/live-trading-rooms/small-accounts-room'
				},
				{
					label: 'Self-Paced Foundation & Small Account Compounding Courses',
					tag: 'Curriculum',
					href: '/store/courses'
				}
			]
		},
		{
			id: 'video-tutorials',
			code: 'Category 03 // Visual Execution Walk-Throughs',
			badge: 'On-Demand Video',
			title: 'Video Tutorials & Trade Walk-Throughs',
			summary:
				'Watch how we configure ThinkorSwim and TradingView, map pre-market gamma levels, and execute live options trades.',
			iconType: 'video',
			items: [
				{
					label: 'ThinkorSwim & TradingView Non-Repainting Indicator Setup',
					tag: 'Platform Setup',
					href: '/store/indicators'
				},
				{
					label: 'How 9-to-5 Working Professionals Execute 20-Minute Video Watchlists',
					tag: '9-to-5 Routine',
					href: '/blogs/swing-trading-options-with-a-full-time-job-watchlist-routine'
				},
				{
					label: 'Case Autopsy: How We Shorted OXY Put Options for +600% Overnight',
					tag: '+600% Trade',
					href: '/blogs/how-we-shorted-oxy-put-options-600-percent-overnight'
				},
				{
					label: 'Explosive Swings Video Watchlist & Alert Service Walkthrough',
					tag: 'Video Alerts',
					href: '/alert-services/explosive-swings'
				}
			]
		},
		{
			id: 'market-analysis',
			code: 'Category 04 // Institutional Order Flow & Macro',
			badge: 'Market Intelligence',
			title: 'Market Analysis & Sector Rotation',
			summary:
				'Top-down institutional research covering S&P 500 dealer gamma walls, macro inflection cycles, and sector money flow.',
			iconType: 'chart',
			items: [
				{
					label: 'Latest Market Intelligence Breakdowns & Weekly Recaps',
					tag: 'Trading Blog',
					href: '/blogs'
				},
				{
					label: 'How We Called the 2020 COVID & 2022 Market Tops and Bottoms',
					tag: 'Track Record',
					href: '/about#verified-calls'
				},
				{
					label: 'SPX Profit Pulse: Daily S&P 500 Dealer Gamma Levels & 0DTE Flow',
					tag: 'SPX Analysis',
					href: '/alert-services/spx-profit-pulse'
				},
				{
					label: 'Live Pre-Market Bell Preparation & Intraday Order-Flow Floor',
					tag: 'Live Desk',
					href: '/live-trading-rooms/day-trading-room'
				}
			]
		},
		{
			id: 'psychology-risk',
			code: 'Category 05 // Mental Game & Capital Protection',
			badge: 'Risk Architecture',
			title: 'Trading Psychology & Risk Discipline',
			summary:
				'Eliminate FOMO, revenge trading, and hesitation by installing Goldman Sachs prop-desk risk rules and pre-trade checklists.',
			iconType: 'mindset',
			items: [
				{
					label: 'Risk Management Essentials: Position Sizing & Hard Stop-Losses',
					tag: 'Risk Rules',
					href: '/blogs/risk-management-essentials-for-active-traders'
				},
				{
					label: 'Why Repainted "Holy Grail" Indicators Destroy Retail Psychology',
					tag: 'Anti-Guru',
					href: '/blogs/why-repainted-holy-grail-indicators-destroy-retail-accounts'
				},
				{
					label: 'Our Anti-Guru Mission: Why We Put People Over Making Money',
					tag: 'Charter',
					href: '/our-mission'
				},
				{
					label: 'Application-Only 1-on-1 Turnaround & Executive Mentorship',
					tag: '1-on-1 Coaching',
					href: '/mentorship'
				}
			]
		},
		{
			id: 'faq-support',
			code: 'Category 06 // Direct Desk Assistance',
			badge: 'Member Support',
			title: 'FAQ, Pedigree & Direct Desk Support',
			summary:
				'Get straight answers on how our trading rooms, alert services, and tools work—or speak directly with our support team.',
			iconType: 'support',
			items: [
				{
					label: 'About Billy Ribeiro & Our Goldman Sachs Mentorship Lineage',
					tag: 'Who We Are',
					href: '/about'
				},
				{
					label: 'Swing Trading Room for Working Professionals (FAQ & Schedule)',
					tag: 'Swing FAQ',
					href: '/live-trading-rooms/swing-trading-room'
				},
				{
					label: 'Terms of Service, Risk Disclosures & Community Standards',
					tag: 'Compliance',
					href: '/terms-of-service'
				},
				{
					label: 'Contact Our Desk Directly (Phone & Email Support)',
					tag: 'Contact Us',
					href: '/contact'
				}
			]
		}
	];

	const faqs: FaqItem[] = [
		{
			question:
				'Are the Options Calculator, ETF Stocks List, and Stock Indexes List 100% free to use?',
			answer:
				'Yes. Because Revolution Trading Pros focuses on people over making money, our interactive Options Calculator (/resources/options-calculator), our ETF Stocks & 11-Sector Directory (/resources/etf-stocks-list), our Stock Indexes List (/resources/stock-indexes-list), and our educational blog articles (/blogs) are 100% free public utilities with no credit card required.'
		},
		{
			question: 'Where should I start if I am a beginner or trading with a $500 small account?',
			answer:
				'Start by bookmarking our free Options Calculator so you always know your exact dollar risk before entering a trade. Next, read our Ultimate Guide to Options Greeks and our $500+ Small Account Blueprint on the Blog, and explore our dedicated Small Accounts Room (/live-trading-rooms/small-accounts-room).'
		},
		{
			question: 'Which free resources are best for 9-to-5 working professionals?',
			answer:
				'Working professionals should start with our ETF Stocks List (/resources/etf-stocks-list)—specifically the 11 S&P 500 GICS Sector ETFs (XLK, XLE, XLF, XLV, SMH), which allow you to trade multi-day institutional sector rotations without single-stock overnight earnings gap risk. Pair that with our Swing Trading Room (/live-trading-rooms/swing-trading-room) or Explosive Swings video watchlists (/alert-services/explosive-swings).'
		},
		{
			question: 'Who created the educational frameworks and tools inside the Resources hub?',
			answer:
				'Every calculator, directory, and trading playbook at Revolution Trading Pros is engineered by founder Billy Ribeiro—who stood on the losing end early in his career before being mentored directly by former Wall Street Goldman Sachs proprietary trading legend Mark "Goldfinger" McGoldrick (who called Billy "the future of trading").'
		}
	];

	const bottomRoomCards: RoomCta[] = [
		{
			badge: 'Live Intraday Floor',
			title: 'Day Trading Room',
			description:
				'Trade opening-bell stocks, ETFs, and options live with real-time voice and screen sharing.',
			ctaLabel: 'Learn More →',
			href: '/live-trading-rooms/day-trading-room'
		},
		{
			badge: 'Working Professionals',
			title: 'Swing Trading Room',
			description:
				'Multi-day stock, ETF, and options swing setups engineered for busy 9-to-5 schedules.',
			ctaLabel: 'Learn More →',
			href: '/live-trading-rooms/swing-trading-room'
		},
		{
			badge: '$500+ Starting Capital',
			title: 'Small Accounts Room',
			description:
				'Strict risk control, T+1 cash rotation, and affordable setups for $500+ accounts.',
			ctaLabel: 'Learn More →',
			href: '/live-trading-rooms/small-accounts-room'
		},
		{
			badge: '0DTE & Index Options',
			title: 'SPX Profit Pulse Alerts',
			description:
				'Real-time S&P 500 index options alerts with pre-market video watchlists and gamma walls.',
			ctaLabel: 'Explore Alerts →',
			href: '/alert-services/spx-profit-pulse'
		},
		{
			badge: 'Video Watchlist Tier',
			title: 'Explosive Swings Alerts',
			description:
				'Affordable alert-only video watchlists with exact targeted entries, exits, and stops.',
			ctaLabel: 'Explore Alerts →',
			href: '/alert-services/explosive-swings'
		}
	];

	let activeCategory = $state<ResourceCategoryFilter>('all');
	let leadFirstName = $state('');
	let leadEmail = $state('');
	let leadProfile = $state('Working Professional (9-to-5 Swing)');
	let leadSubmitted = $state(false);

	const displayedCategories = $derived(
		activeCategory === 'all'
			? resourceCategories
			: resourceCategories.filter((cat) => cat.id === activeCategory)
	);

	function handleLeadSubmit(e: SubmitEvent) {
		e.preventDefault();
		leadSubmitted = true;
	}
</script>

<JsonLd schema={data.jsonLdSchema} />

<div class="app-shell">
	<Navbar />

	<main id="resources-hub-page" class="resources-page">
		<!-- =========================================================================
       SECTION 1: BREADCRUMB & PUBLIC UTILITY STATUS BAR
       ========================================================================= -->
		<nav class="breadcrumb-bar" aria-label="Breadcrumb">
			<div class="container breadcrumb-bar__inner">
				<ol class="breadcrumb-list">
					<li><a href={resolve('/')}>Home</a></li>
					<li aria-hidden="true">/</li>
					<li aria-current="page">Free Trading Resources</li>
				</ol>
				<p class="breadcrumb-bar__telemetry">
					<span>100% Free Public Utilities</span> • <span>People Over Profits</span> •
					<span>US &amp; Canada</span>
				</p>
			</div>
		</nav>

		<!-- =========================================================================
       SECTION 2: ABOVE-THE-FOLD HERO + 3 CANONICAL RESOURCE QUICK-LAUNCHPAD
       ========================================================================= -->
		<section class="hero-section" aria-labelledby="resources-h1">
			<div class="container hero-section__grid">
				<!-- Left 7 Columns: Search-Intent H1 + Institutional Context -->
				<div class="hero-section__main">
					<div class="eyebrow-pill">
						<span class="eyebrow-pill__badge">Educate • Innovate • Prosper</span>
						<span class="eyebrow-pill__text">
							100% Free Calculators, Market Directories &amp; Institutional Playbooks
						</span>
					</div>

					<h1 id="resources-h1" class="hero-h1">
						<span class="hero-h1__kicker">
							Free Stock, ETF &amp; Options Trading Resources • Public Utilities &amp; Guides
						</span>
						<span class="hero-h1__display">
							Real Institutional Tools &amp; Playbooks—Given Away Free Because We Put People Over
							Profits.
						</span>
					</h1>

					<p class="lead-copy">
						Everything you need to plan risk, select liquid contracts, and understand institutional
						market structure—without paying a single dollar. Explore our interactive
						<strong>Options Calculator</strong>, our complete
						<strong>ETF Stocks &amp; 11-Sector List</strong>, our
						<strong>Stock Market Indexes Directory</strong>, and our library of battle-tested
						trading guides.
					</p>

					<p class="body-copy">
						<strong
							>Why do we give away institutional calculators and directories for free while internet
							gurus lock basic PDFs behind a paywall? Because I have stood on the losing end myself
							in the past.</strong
						>
						When former Wall Street Goldman Sachs proprietary trading legend
						<strong>Mark "Goldfinger" McGoldrick</strong> mentored me directly and called me
						<em>"the future of trading,"</em> I learned that retail traders don’t fail from a lack of
						effort—they fail because nobody gives them objective risk mathematics and institutional market
						maps.
					</p>

					<p class="body-copy">
						These are the exact public reference tools and options-sizing frameworks we use
						alongside our live rooms—the same foundation that powered our live calls on the
						<strong>2020 COVID Top and Bottom</strong>, the
						<strong>2022 Bull Market Top and Bear Bottom</strong>, and our
						<strong>+600% overnight gain on OXY Put Options live</strong> opposite Warren Buffett.
					</p>

					<div class="cta-row">
						<a href={resolve('/resources/options-calculator' as '/')} class="btn btn--solid">
							Launch Free Options Calculator →
						</a>
						<a href="#resource-vault-categories" class="btn btn--outline">
							Browse All 6 Resource Categories ↓
						</a>
					</div>
				</div>

				<!-- Right 5 Columns: Direct Quick-Access Launchpad for the 3 Submenu Routes -->
				<aside class="launchpad-card" aria-label="Direct Access to Core Public Utilities">
					<div class="launchpad-card__header">
						<div>
							<span class="meta-label">Official Menu Utilities</span>
							<h2 class="launchpad-card__title">Core Public Trading Tools</h2>
						</div>
						<span class="launchpad-card__tag">No Login Required</span>
					</div>

					<p class="launchpad-card__intro">
						Jump straight into any of our three primary public trading utilities from our main
						navigation menu:
					</p>

					<div class="launchpad-links">
						<a href={resolve('/resources/options-calculator' as '/')} class="launchpad-item">
							<div class="launchpad-item__top">
								<span class="launchpad-item__code">01 // Interactive Risk Engine</span>
								<span class="launchpad-item__go">Open Tool →</span>
							</div>
							<strong>Options Calculator</strong>
							<p>
								Calculate exact option profit targets, breakeven levels, Delta/Theta/Vega
								sensitivity, and $500+ small account position sizing.
							</p>
						</a>

						<a href={resolve('/resources/etf-stocks-list')} class="launchpad-item">
							<div class="launchpad-item__top">
								<span class="launchpad-item__code">02 // Sector &amp; Liquidity Directory</span>
								<span class="launchpad-item__go">Open List →</span>
							</div>
							<strong>ETF Stocks List</strong>
							<p>
								Inspect SPY, QQQ, IWM, GLD, and all 11 S&amp;P 500 GICS sector ETFs with live
								TradingView chart links and options liquidity tiers.
							</p>
						</a>

						<a href={resolve('/resources/stock-indexes-list')} class="launchpad-item">
							<div class="launchpad-item__top">
								<span class="launchpad-item__code">03 // Cash-Settled Index Guide</span>
								<span class="launchpad-item__go">Open List →</span>
							</div>
							<strong>Stock Indexes List</strong>
							<p>
								Master SPX, NDX, DJI, RUT, and VIX mechanics—including European cash settlement,
								Section 1256 60/40 tax rules, and mini-SPX (XSP).
							</p>
						</a>
					</div>
				</aside>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 3: THE 3 FLAGSHIP PUBLIC UTILITIES (DEEP-DIVE CARDS + SVG DIAGRAMS)
       ========================================================================= -->
		<section class="utilities-section" aria-labelledby="utilities-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">Interactive Reference Suite • 100% Free</span>
					<h2 id="utilities-h2" class="section-h2">
						Three Institutional Reference Tools Every Trader Should Bookmark
					</h2>
					<p class="body-copy section-header__sub">
						Whether you are sizing a single option contract in a $500 cash account or rotating a
						six-figure portfolio across S&amp;P 500 sectors, start with these three core tools:
					</p>
				</div>

				<div class="utilities-grid">
					{#each flagshipUtilities as util (util.href)}
						<article class="utility-card">
							<div>
								<div class="utility-card__banner">
									<div class="utility-card__banner-top">
										<span class="utility-card__code">{util.code}</span>
										<span class="utility-card__badge">{util.badge}</span>
									</div>

									<!-- High-Contrast Inline SVG Schematic -->
									<div class="utility-card__svg-wrap" aria-hidden="true">
										{#if util.svgType === 'calculator'}
											<svg viewBox="0 0 320 82" class="util-svg">
												<rect
													x="8"
													y="8"
													width="96"
													height="66"
													fill="#111111"
													stroke="#ffffff"
													stroke-width="1"
												/>
												<text
													x="56"
													y="28"
													font-size="8"
													font-weight="800"
													text-anchor="middle"
													fill="#cccccc">MAX RISK</text
												>
												<text
													x="56"
													y="50"
													font-size="14"
													font-weight="900"
													text-anchor="middle"
													fill="#ffffff">100% CAPPED</text
												>
												<rect
													x="112"
													y="8"
													width="96"
													height="66"
													fill="#111111"
													stroke="#ffffff"
													stroke-width="1"
												/>
												<text
													x="160"
													y="28"
													font-size="8"
													font-weight="800"
													text-anchor="middle"
													fill="#cccccc">GREEKS READ</text
												>
												<text
													x="160"
													y="50"
													font-size="12"
													font-weight="900"
													text-anchor="middle"
													fill="#ffffff">Δ • Γ • Θ • ν</text
												>
												<rect x="216" y="8" width="96" height="66" fill="#ffffff" />
												<text
													x="264"
													y="28"
													font-size="8"
													font-weight="900"
													text-anchor="middle"
													fill="#000000">ASYMMETRY</text
												>
												<text
													x="264"
													y="52"
													font-size="15"
													font-weight="900"
													text-anchor="middle"
													fill="#000000">3R – 5R+</text
												>
											</svg>
										{:else if util.svgType === 'etf-list'}
											<svg viewBox="0 0 320 82" class="util-svg">
												<rect x="8" y="10" width="304" height="20" fill="#222222" />
												<text x="16" y="23" font-size="8" font-weight="800" fill="#ffffff">
													CORE &amp; 11 GICS SECTORS: SPY • QQQ • IWM • XLK • XLE • XLF • SMH
												</text>
												<rect x="8" y="38" width="72" height="34" fill="#ffffff" />
												<text
													x="44"
													y="59"
													font-size="11"
													font-weight="900"
													text-anchor="middle"
													fill="#000000">SPY</text
												>
												<rect x="86" y="38" width="72" height="34" fill="#ffffff" />
												<text
													x="122"
													y="59"
													font-size="11"
													font-weight="900"
													text-anchor="middle"
													fill="#000000">QQQ</text
												>
												<rect x="164" y="38" width="72" height="34" fill="#ffffff" />
												<text
													x="200"
													y="59"
													font-size="11"
													font-weight="900"
													text-anchor="middle"
													fill="#000000">IWM</text
												>
												<rect
													x="242"
													y="38"
													width="70"
													height="34"
													fill="#111111"
													stroke="#ffffff"
													stroke-width="1"
												/>
												<text
													x="277"
													y="59"
													font-size="10"
													font-weight="900"
													text-anchor="middle"
													fill="#ffffff">11 SECTORS</text
												>
											</svg>
										{:else}
											<svg viewBox="0 0 320 82" class="util-svg">
												<rect x="8" y="10" width="304" height="20" fill="#222222" />
												<text x="16" y="23" font-size="8" font-weight="800" fill="#ffffff">
													MAJOR INDEX BENCHMARKS: SEC 1256 (60/40 TAX) • CASH SETTLED
												</text>
												<polyline
													fill="none"
													stroke="#ffffff"
													stroke-width="2.5"
													points="14,68 72,56 130,60 188,42 246,36 306,32"
												/>
												<text x="24" y="50" font-size="9" font-weight="900" fill="#ffffff"
													>SPX • NDX • RUT • DJI • VIX</text
												>
											</svg>
										{/if}
									</div>
								</div>

								<div class="utility-card__body">
									<h3 class="utility-card__title">
										<a href={resolve(util.href as '/')}>{util.title}</a>
									</h3>
									<p class="utility-card__sub">{util.subtitle}</p>
									<p class="utility-card__desc">{util.description}</p>

									<ul class="utility-card__list">
										{#each util.highlights as pt (pt)}
											<li>
												<span class="check-mark" aria-hidden="true">✓</span>
												<span>{pt}</span>
											</li>
										{/each}
									</ul>
								</div>
							</div>

							<div class="utility-card__footer">
								<a href={resolve(util.href as '/')} class="btn btn--solid btn--full">
									{util.ctaLabel}
								</a>
							</div>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 4: 6-CATEGORY RESOURCE VAULT (UPGRADED WITH CRAWLABLE <A> LINKS)
       ========================================================================= -->
		<section id="resource-vault-categories" class="vault-section" aria-labelledby="vault-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">Complete Knowledge Silo • 100% Crawlable Pathways</span>
					<h2 id="vault-h2" class="section-h2">Browse All 6 Trading Resource Categories</h2>
					<p class="body-copy section-header__sub">
						Filter by category below or click any guide, tool, or walkthrough to open it directly:
					</p>
				</div>

				<!-- Interactive Category Filter Tabs -->
				<div class="filter-bar" role="tablist" aria-label="Filter resource categories">
					<button
						type="button"
						role="tab"
						aria-selected={activeCategory === 'all'}
						class="filter-tab"
						class:filter-tab--active={activeCategory === 'all'}
						onclick={() => (activeCategory = 'all')}
					>
						All 6 Categories
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={activeCategory === 'free-tools'}
						class="filter-tab"
						class:filter-tab--active={activeCategory === 'free-tools'}
						onclick={() => (activeCategory = 'free-tools')}
					>
						Free Tools &amp; Lists
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={activeCategory === 'beginner-small-accounts'}
						class="filter-tab"
						class:filter-tab--active={activeCategory === 'beginner-small-accounts'}
						onclick={() => (activeCategory = 'beginner-small-accounts')}
					>
						Beginner &amp; $500+ Guides
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={activeCategory === 'video-tutorials'}
						class="filter-tab"
						class:filter-tab--active={activeCategory === 'video-tutorials'}
						onclick={() => (activeCategory = 'video-tutorials')}
					>
						Video Tutorials
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={activeCategory === 'market-analysis'}
						class="filter-tab"
						class:filter-tab--active={activeCategory === 'market-analysis'}
						onclick={() => (activeCategory = 'market-analysis')}
					>
						Market Analysis
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={activeCategory === 'psychology-risk'}
						class="filter-tab"
						class:filter-tab--active={activeCategory === 'psychology-risk'}
						onclick={() => (activeCategory = 'psychology-risk')}
					>
						Psychology &amp; Risk
					</button>
				</div>

				<!-- 6-Card Resource Category Grid -->
				<div class="vault-grid">
					{#each displayedCategories as cat (cat.id)}
						<article class="vault-card">
							<div>
								<div class="vault-card__top">
									<div class="vault-card__icon-box" aria-hidden="true">
										{#if cat.iconType === 'calculator'}
											<svg
												viewBox="0 0 24 24"
												width="22"
												height="22"
												fill="none"
												stroke="currentColor"
												stroke-width="2.2"
											>
												<rect x="4" y="2" width="16" height="20" rx="2" />
												<line x1="8" y1="6" x2="16" y2="6" />
												<line x1="8" y1="11" x2="10" y2="11" />
												<line x1="14" y1="11" x2="16" y2="11" />
												<line x1="8" y1="16" x2="10" y2="16" />
												<line x1="14" y1="16" x2="16" y2="16" />
											</svg>
										{:else if cat.iconType === 'book'}
											<svg
												viewBox="0 0 24 24"
												width="22"
												height="22"
												fill="none"
												stroke="currentColor"
												stroke-width="2.2"
											>
												<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
												<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
											</svg>
										{:else if cat.iconType === 'video'}
											<svg
												viewBox="0 0 24 24"
												width="22"
												height="22"
												fill="none"
												stroke="currentColor"
												stroke-width="2.2"
											>
												<polygon points="23 7 16 12 23 17 23 7" />
												<rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
											</svg>
										{:else if cat.iconType === 'chart'}
											<svg
												viewBox="0 0 24 24"
												width="22"
												height="22"
												fill="none"
												stroke="currentColor"
												stroke-width="2.2"
											>
												<line x1="18" y1="20" x2="18" y2="10" />
												<line x1="12" y1="20" x2="12" y2="4" />
												<line x1="6" y1="20" x2="6" y2="14" />
											</svg>
										{:else if cat.iconType === 'mindset'}
											<svg
												viewBox="0 0 24 24"
												width="22"
												height="22"
												fill="none"
												stroke="currentColor"
												stroke-width="2.2"
											>
												<path
													d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"
												/>
												<line x1="9" y1="21" x2="15" y2="21" />
											</svg>
										{:else}
											<svg
												viewBox="0 0 24 24"
												width="22"
												height="22"
												fill="none"
												stroke="currentColor"
												stroke-width="2.2"
											>
												<circle cx="12" cy="12" r="10" />
												<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
												<line x1="12" y1="17" x2="12.01" y2="17" />
											</svg>
										{/if}
									</div>
									<div class="vault-card__meta">
										<span class="meta-label">{cat.code}</span>
										<span class="vault-card__badge">{cat.badge}</span>
									</div>
								</div>

								<h3 class="vault-card__title">{cat.title}</h3>
								<p class="vault-card__summary">{cat.summary}</p>
							</div>

							<!-- Crawlable Resource Links List (Fixes Old Page's Dead <span> Bug) -->
							<ul class="vault-link-list">
								{#each cat.items as item (item.label)}
									<li>
										<a href={resolve(item.href as '/')} class="vault-link">
											<span class="vault-link__check" aria-hidden="true">✓</span>
											<span class="vault-link__text">{item.label}</span>
											<span class="vault-link__tag">{item.tag} →</span>
										</a>
									</li>
								{/each}
							</ul>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 5: FREE EBOOK & OPTIONS CHEAT SHEET BUNDLE OPT-IN
       ========================================================================= -->
		<section class="ebook-section" aria-labelledby="ebook-h2">
			<div class="container">
				<div class="ebook-box">
					<div class="ebook-box__header">
						<span class="section-kicker">Instant Digital Download • 100% Free</span>
						<h2 id="ebook-h2" class="section-h2">
							Download Our Free Institutional Trading eBook &amp; Options Greeks Cheat Sheet
						</h2>
						<p class="body-copy">
							Get Billy Ribeiro’s complete field manual sent straight to your inbox—covering our
							pre-trade checklist, Delta/Theta strike selection rules, and how we structure setups
							for 9-to-5 working professionals and $500+ small accounts.
						</p>
					</div>

					{#if leadSubmitted}
						<div class="ebook-confirmation" role="status" aria-live="polite">
							<strong>✓ Your Free Institutional Trading Bundle Is on Its Way!</strong>
							<p>
								Check your inbox at <strong>{leadEmail}</strong> for your downloadable PDF eBook and Options
								Greeks Cheat Sheet.
							</p>
						</div>
					{:else}
						<form
							method="POST"
							action="?/claimFreeResourceBundle"
							class="ebook-form"
							onsubmit={handleLeadSubmit}
						>
							<div class="ebook-form__field">
								<label for="res-first-name">First Name *</label>
								<input
									type="text"
									id="res-first-name"
									name="firstName"
									bind:value={leadFirstName}
									required
									placeholder="Your first name"
								/>
							</div>

							<div class="ebook-form__field">
								<label for="res-email">Primary Email Address *</label>
								<input
									type="email"
									id="res-email"
									name="email"
									bind:value={leadEmail}
									required
									placeholder="you@domain.com"
								/>
							</div>

							<div class="ebook-form__field">
								<label for="res-profile">Your Primary Trading Profile *</label>
								<select id="res-profile" name="traderProfile" bind:value={leadProfile}>
									<option value="Working Professional (9-to-5 Swing)"
										>Working Professional (9-to-5 Swing)</option
									>
									<option value="$500+ Small Account Trader">$500+ Small Account Trader</option>
									<option value="Active Day Trader / Options Scalper"
										>Active Day Trader / Options Scalper</option
									>
									<option value="SPX & Index Options Trader">SPX &amp; Index Options Trader</option>
								</select>
							</div>

							<div class="ebook-form__submit">
								<button type="submit" class="btn btn--solid btn--full">
									Send Me the Free eBook &amp; Cheat Sheet →
								</button>
							</div>
						</form>
					{/if}
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 6: RESOURCES FAQ ACCORDION
       ========================================================================= -->
		<section class="faq-section" aria-labelledby="resources-faq-h2">
			<div class="container faq-container">
				<div class="section-header">
					<span class="section-kicker">Direct Answers • Zero Fluff</span>
					<h2 id="resources-faq-h2" class="section-h2">
						Frequently Asked Questions About Our Free Trading Resources
					</h2>
				</div>

				<div class="faq-list">
					{#each faqs as faq, idx (faq.question)}
						<details class="faq-item" open={idx === 0}>
							<summary class="faq-item__question">
								<span>{faq.question}</span>
								<span class="faq-item__icon" aria-hidden="true">+</span>
							</summary>
							<p class="faq-item__answer">{faq.answer}</p>
						</details>
					{/each}
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 7: READY TO TAKE THE NEXT STEP? (5 ROOM & ALERT CTA CARDS)
       ========================================================================= -->
		<section class="pro-cta-section" aria-labelledby="pro-cta-h2">
			<div class="container">
				<div class="pro-cta-box">
					<div class="pro-cta-box__header">
						<span class="section-kicker">Educate • Innovate • Prosper</span>
						<h2 id="pro-cta-h2" class="section-h2 pro-cta-box__h2">
							Ready to Take the Next Step Into Live Institutional Execution?
						</h2>
						<p class="body-copy pro-cta-box__sub">
							Step inside our Live Trading Rooms or Video Watchlist Alert Services to watch us apply
							these tools in real market conditions:
						</p>
					</div>

					<div class="room-cta-grid">
						{#each bottomRoomCards as card (card.href)}
							<article class="room-cta-card">
								<div>
									<span class="room-cta-card__badge">{card.badge}</span>
									<h3 class="room-cta-card__title">{card.title}</h3>
									<p class="room-cta-card__desc">{card.description}</p>
								</div>
								<a href={resolve(card.href as '/')} class="btn btn--solid btn--full">
									{card.ctaLabel}
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

<style>
	/* ===========================================================================
     PURE NATIVE SCOPED CSS — BLACK & WHITE EDITORIAL RESOURCES HUB
     Typography: Montserrat (Headings/Badges/CTAs) + Sofia Sans (Body/Links)
     =========================================================================== */
	.resources-page {
		background-color: #ffffff;
		color: #000000;
		font-family:
			'Sofia Sans',
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			sans-serif;
		line-height: 1.65;
		overflow-x: clip;
	}

	.container {
		max-width: 1440px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	/* Shared Typography Tokens */
	.meta-label {
		display: inline-block;
		font-family: 'Sofia Sans', sans-serif;
		font-weight: 700;
		font-stretch: 87.5%;
		font-variation-settings: 'wdth' 87.5;
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #333333;
	}

	.section-kicker {
		display: inline-block;
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		background-color: #000000;
		color: #ffffff;
		padding: 0.25rem 0.625rem;
		margin-bottom: 0.625rem;
	}

	.section-h2 {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: clamp(1.65rem, 3vw, 2.45rem);
		line-height: 1.14;
		letter-spacing: -0.025em;
		max-width: 28ch;
		margin: 0;
		color: #000000;
	}

	.lead-copy {
		font-family: 'Sofia Sans', sans-serif;
		font-weight: 500;
		font-variation-settings: 'wdth' 100;
		font-size: clamp(1.0625rem, 1.25vw, 1.2rem);
		line-height: 1.65;
		max-width: 66ch;
		margin: 1.25rem 0 0;
		color: #000000;
	}

	.body-copy {
		font-family: 'Sofia Sans', sans-serif;
		font-weight: 400;
		font-variation-settings: 'wdth' 100;
		font-size: 1rem;
		line-height: 1.65;
		max-width: 66ch;
		margin: 1rem 0 0;
		color: #111111;
	}

	.lead-copy strong,
	.body-copy strong {
		font-weight: 700;
		color: #000000;
	}

	.check-mark {
		font-family: 'Montserrat', sans-serif;
		font-weight: 900;
		flex-shrink: 0;
	}

	/* Buttons */
	.cta-row {
		margin-top: 1.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 48px;
		padding: 0.75rem 1.35rem;
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		text-decoration: none;
		border: 2px solid #000000;
		text-align: center;
		cursor: pointer;
		box-sizing: border-box;
	}

	.btn--solid {
		background-color: #000000;
		color: #ffffff;
	}

	.btn--outline {
		background-color: #ffffff;
		color: #000000;
	}

	.btn--full {
		width: 100%;
	}

	/* 1. Breadcrumb Bar */
	.breadcrumb-bar {
		background-color: #f7f7f7;
		border-bottom: 1.5px solid #000000;
		padding: 0.625rem 0;
	}

	.breadcrumb-bar__inner {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		justify-content: space-between;
	}

	.breadcrumb-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		font-family: 'Sofia Sans', sans-serif;
		font-weight: 700;
		font-stretch: 87.5%;
		font-variation-settings: 'wdth' 87.5;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.breadcrumb-list a {
		color: #000000;
		text-decoration: underline;
	}

	.breadcrumb-bar__telemetry {
		margin: 0;
		font-family: 'Sofia Sans', sans-serif;
		font-weight: 700;
		font-stretch: 87.5%;
		font-variation-settings: 'wdth' 87.5;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #333333;
	}

	/* 2. Hero Section & 3-Tool Launchpad */
	.hero-section {
		padding: 2.5rem 0 3.5rem;
		border-bottom: 2px solid #000000;
	}

	.hero-section__grid {
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
		border: 1.5px solid #000000;
		background-color: #f5f5f5;
		padding: 0.375rem 0.75rem;
		margin-bottom: 1.25rem;
	}

	.eyebrow-pill__badge {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		background-color: #000000;
		color: #ffffff;
		padding: 0.125rem 0.45rem;
	}

	.eyebrow-pill__text {
		font-family: 'Sofia Sans', sans-serif;
		font-weight: 700;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.hero-h1 {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.hero-h1__kicker {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.09em;
		color: #333333;
		border-left: 3px solid #000000;
		padding-left: 0.625rem;
		max-width: 65ch;
	}

	.hero-h1__display {
		font-family: 'Montserrat', sans-serif;
		font-weight: 900;
		font-size: clamp(2rem, 4.1vw, 3.15rem);
		line-height: 1.08;
		letter-spacing: -0.03em;
		max-width: 22ch;
		color: #000000;
	}

	/* Right Column Launchpad Card */
	.launchpad-card {
		border: 2px solid #000000;
		background-color: #fafafa;
		padding: 1.5rem;
		box-shadow: 6px 6px 0 #000000;
	}

	.launchpad-card__header {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid #000000;
	}

	.launchpad-card__title {
		font-family: 'Montserrat', sans-serif;
		font-weight: 900;
		font-size: 1.25rem;
		margin: 0.25rem 0 0;
	}

	.launchpad-card__tag {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 0.6875rem;
		text-transform: uppercase;
		background-color: #000000;
		color: #ffffff;
		padding: 0.25rem 0.5rem;
		white-space: nowrap;
	}

	.launchpad-card__intro {
		font-family: 'Sofia Sans', sans-serif;
		font-size: 0.90625rem;
		line-height: 1.5;
		margin: 1rem 0;
		color: #111111;
	}

	.launchpad-links {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.launchpad-item {
		display: block;
		border: 1.5px solid #000000;
		background-color: #ffffff;
		padding: 0.875rem 1rem;
		text-decoration: none;
		color: #000000;
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
	}

	.launchpad-item:hover {
		background-color: #000000;
		color: #ffffff;
	}

	.launchpad-item__top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}

	.launchpad-item__code {
		font-family: 'Sofia Sans', sans-serif;
		font-weight: 700;
		font-stretch: 87.5%;
		font-variation-settings: 'wdth' 87.5;
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		opacity: 0.85;
	}

	.launchpad-item__go {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 0.6875rem;
		text-transform: uppercase;
	}

	.launchpad-item strong {
		display: block;
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 1rem;
		margin-bottom: 0.2rem;
	}

	.launchpad-item p {
		margin: 0;
		font-family: 'Sofia Sans', sans-serif;
		font-size: 0.8125rem;
		line-height: 1.45;
		opacity: 0.9;
	}

	/* 3. Three Flagship Public Utilities Section */
	.utilities-section {
		padding: 3.5rem 0;
		border-bottom: 2px solid #000000;
		background-color: #f7f7f7;
	}

	.section-header {
		margin-bottom: 2.25rem;
	}

	.section-header__sub {
		margin-top: 0.625rem;
	}

	.utilities-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.5rem;
	}

	.utility-card {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		border: 2px solid #000000;
		background-color: #ffffff;
		box-shadow: 6px 6px 0 #000000;
	}

	.utility-card__banner {
		background-color: #000000;
		color: #ffffff;
		padding: 0.875rem 1rem;
		border-bottom: 2px solid #000000;
	}

	.utility-card__banner-top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.625rem;
	}

	.utility-card__code {
		font-family: 'Sofia Sans', sans-serif;
		font-weight: 700;
		font-stretch: 87.5%;
		font-variation-settings: 'wdth' 87.5;
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #cccccc;
	}

	.utility-card__badge {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 0.625rem;
		text-transform: uppercase;
		background-color: #ffffff;
		color: #000000;
		padding: 0.15rem 0.45rem;
	}

	.utility-card__svg-wrap {
		border: 1px solid #333333;
		background-color: #111111;
		padding: 0.375rem;
	}

	.util-svg {
		width: 100%;
		height: 70px;
		display: block;
	}

	.utility-card__body {
		padding: 1.35rem;
	}

	.utility-card__title {
		font-family: 'Montserrat', sans-serif;
		font-weight: 900;
		font-size: 1.25rem;
		line-height: 1.22;
		margin: 0 0 0.375rem;
	}

	.utility-card__title a {
		color: #000000;
		text-decoration: none;
	}

	.utility-card__title a:hover {
		text-decoration: underline;
	}

	.utility-card__sub {
		font-family: 'Montserrat', sans-serif;
		font-weight: 700;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: #444444;
		margin: 0 0 0.75rem;
	}

	.utility-card__desc {
		font-family: 'Sofia Sans', sans-serif;
		font-size: 0.9375rem;
		line-height: 1.58;
		color: #111111;
		margin: 0 0 1rem;
	}

	.utility-card__list {
		list-style: none;
		margin: 0;
		padding: 0.875rem 0 0;
		border-top: 1px solid #dddddd;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.utility-card__list li {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		font-family: 'Sofia Sans', sans-serif;
		font-size: 0.84375rem;
		line-height: 1.45;
	}

	.utility-card__footer {
		padding: 0 1.35rem 1.35rem;
	}

	/* 4. 6-Category Resource Vault Section */
	.vault-section {
		padding: 3.5rem 0;
		border-bottom: 2px solid #000000;
	}

	.filter-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding-bottom: 1.5rem;
		border-bottom: 2px solid #000000;
		margin-bottom: 2rem;
	}

	.filter-tab {
		min-height: 42px;
		padding: 0.5rem 1rem;
		border: 2px solid #000000;
		background-color: #ffffff;
		color: #000000;
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		cursor: pointer;
	}

	.filter-tab--active,
	.filter-tab:hover {
		background-color: #000000;
		color: #ffffff;
	}

	.vault-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.5rem;
	}

	.vault-card {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		border: 2px solid #000000;
		background-color: #fafafa;
		padding: 1.5rem;
	}

	.vault-card__top {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding-bottom: 0.875rem;
		border-bottom: 2px solid #000000;
	}

	.vault-card__icon-box {
		width: 46px;
		height: 46px;
		background-color: #000000;
		color: #ffffff;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.vault-card__meta {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.vault-card__badge {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		border: 1px solid #000000;
		background-color: #ffffff;
		padding: 0.1rem 0.4rem;
		width: fit-content;
	}

	.vault-card__title {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 1.25rem;
		line-height: 1.25;
		margin: 1rem 0 0.5rem;
	}

	.vault-card__summary {
		font-family: 'Sofia Sans', sans-serif;
		font-size: 0.90625rem;
		line-height: 1.55;
		color: #222222;
		margin: 0 0 1.25rem;
	}

	.vault-link-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.vault-link {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.625rem;
		border: 1.5px solid #000000;
		background-color: #ffffff;
		padding: 0.625rem 0.75rem;
		text-decoration: none;
		color: #000000;
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
	}

	.vault-link:hover {
		background-color: #000000;
		color: #ffffff;
	}

	.vault-link__check {
		font-family: 'Montserrat', sans-serif;
		font-weight: 900;
		font-size: 0.8125rem;
		flex-shrink: 0;
	}

	.vault-link__text {
		font-family: 'Sofia Sans', sans-serif;
		font-weight: 600;
		font-size: 0.875rem;
		line-height: 1.35;
		flex: 1;
	}

	.vault-link__tag {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 0.6875rem;
		text-transform: uppercase;
		white-space: nowrap;
	}

	/* 5. Free eBook & Cheat Sheet Opt-in Section */
	.ebook-section {
		padding: 3.5rem 0;
		border-bottom: 2px solid #000000;
		background-color: #f5f5f5;
	}

	.ebook-box {
		border: 2px solid #000000;
		background-color: #ffffff;
		padding: 2rem 1.5rem;
		box-shadow: 8px 8px 0 #000000;
	}

	.ebook-box__header {
		margin-bottom: 1.5rem;
	}

	.ebook-form {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1rem;
		align-items: end;
	}

	.ebook-form__field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.ebook-form__field label {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.ebook-form__field input,
	.ebook-form__field select {
		padding: 0.75rem 0.875rem;
		border: 2px solid #000000;
		background-color: #ffffff;
		font-family: 'Sofia Sans', sans-serif;
		font-size: 0.9375rem;
		width: 100%;
		box-sizing: border-box;
	}

	.ebook-confirmation {
		border: 2px solid #000000;
		background-color: #f7f7f7;
		padding: 1.25rem;
	}

	.ebook-confirmation p {
		margin: 0.375rem 0 0;
	}

	/* 6. FAQ Section */
	.faq-section {
		padding: 3.5rem 0;
		border-bottom: 2px solid #000000;
	}

	.faq-container {
		max-width: 960px;
	}

	.faq-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.faq-item {
		border: 2px solid #000000;
		background-color: #fafafa;
		padding: 1.25rem 1.5rem;
	}

	.faq-item__question {
		list-style: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		font-family: 'Montserrat', sans-serif;
		font-weight: 700;
		font-size: 1.0625rem;
	}

	.faq-item__question::-webkit-details-marker {
		display: none;
	}

	.faq-item__icon {
		font-family: 'Montserrat', sans-serif;
		font-weight: 900;
		font-size: 1.25rem;
	}

	.faq-item__answer {
		margin: 1rem 0 0;
		padding-top: 1rem;
		border-top: 1px solid #cccccc;
		font-family: 'Sofia Sans', sans-serif;
		font-size: 0.96875rem;
		line-height: 1.65;
	}

	/* 7. Bottom 5-Card Room & Alert CTA Section */
	.pro-cta-section {
		padding: 3.5rem 0 4rem;
		background-color: #ffffff;
	}

	.pro-cta-box {
		border: 2px solid #000000;
		background-color: #f7f7f7;
		padding: 2rem 1.25rem;
	}

	.pro-cta-box__header {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 2rem;
	}

	.pro-cta-box__h2 {
		text-align: center;
	}

	.pro-cta-box__sub {
		text-align: center;
		margin: 0.75rem auto 0;
	}

	.room-cta-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.25rem;
	}

	.room-cta-card {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		border: 2px solid #000000;
		background-color: #ffffff;
		padding: 1.35rem;
		text-align: center;
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}

	.room-cta-card:hover {
		transform: translateY(-4px);
		box-shadow: 5px 5px 0 #000000;
	}

	.room-cta-card__badge {
		display: inline-block;
		font-family: 'Sofia Sans', sans-serif;
		font-weight: 700;
		font-stretch: 87.5%;
		font-variation-settings: 'wdth' 87.5;
		font-size: 0.6875rem;
		text-transform: uppercase;
		border: 1px solid #000000;
		background-color: #f5f5f5;
		padding: 0.15rem 0.5rem;
	}

	.room-cta-card__title {
		font-family: 'Montserrat', sans-serif;
		font-weight: 800;
		font-size: 1.125rem;
		margin: 0.75rem 0 0.5rem;
	}

	.room-cta-card__desc {
		font-family: 'Sofia Sans', sans-serif;
		font-size: 0.875rem;
		line-height: 1.5;
		color: #222222;
		margin: 0 0 1.25rem;
	}

	/* ===========================================================================
     ENTERPRISE RESPONSIVE BREAKPOINTS (480px, 640px, 768px, 1024px, 1280px, 1536px)
     =========================================================================== */
	@media (min-width: 480px) {
		.container {
			padding: 0 1.25rem;
		}
	}

	@media (min-width: 640px) {
		.container {
			padding: 0 1.5rem;
		}
		.cta-row {
			flex-direction: row;
			flex-wrap: wrap;
		}
		.vault-grid,
		.ebook-form,
		.room-cta-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 768px) {
		.breadcrumb-bar__inner {
			flex-direction: row;
			align-items: center;
		}
		.ebook-box,
		.pro-cta-box {
			padding: 2.5rem 2rem;
		}
	}

	@media (min-width: 1024px) {
		.container {
			padding: 0 2rem;
		}
		.hero-section,
		.utilities-section,
		.vault-section,
		.ebook-section,
		.faq-section {
			padding: 4.5rem 0;
		}
		.hero-section__grid {
			grid-template-columns: repeat(12, 1fr);
			gap: 2.5rem;
		}
		.hero-section__main {
			grid-column: span 7;
		}
		.launchpad-card {
			grid-column: span 5;
		}
		.utilities-grid,
		.vault-grid,
		.room-cta-grid {
			grid-template-columns: repeat(3, 1fr);
		}
		.ebook-form {
			grid-template-columns: 1fr 1.2fr 1.2fr auto;
		}
	}

	@media (min-width: 1280px) {
		.hero-section__grid {
			gap: 3.5rem;
		}
		.room-cta-grid {
			grid-template-columns: repeat(5, 1fr);
		}
	}

	@media (min-width: 1536px) {
		.container {
			max-width: 1536px;
		}
	}
</style>
