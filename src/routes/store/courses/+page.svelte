<!-- src/routes/store/courses/+page.svelte -->
<script lang="ts">
	import '#lib/styles/inner-page.css';
	import { resolve } from '$app/paths';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import { COURSES_STORE_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type CourseTrack =
		'all' | 'small-accounts' | 'options-greeks' | 'intraday-orderflow' | 'swing-macro';

	interface TradingCourse {
		id: string;
		code: string;
		title: string;
		track: CourseTrack;
		trackLabel: string;
		level: string;
		modulesCount: string;
		hook: string;
		coreOutcome: string;
		syllabus: string[];
		recommendedRoomLabel: string;
		recommendedRoomHref: string;
	}

	interface LearningDeliverable {
		num: string;
		badge: string;
		title: string;
		description: string;
	}

	interface ComparisonRow {
		criterion: string;
		fakeGuruCourses: string;
		revolutionCourses: string;
	}

	interface RoomCta {
		badge: string;
		title: string;
		description: string;
		ctaLabel: string;
		href: string;
	}

	const trackFilters: { id: CourseTrack; label: string }[] = [
		{ id: 'all', label: 'All Courses (8)' },
		{ id: 'small-accounts', label: '$500+ Small Accounts & Foundation' },
		{ id: 'options-greeks', label: 'Options & Greeks Mastery' },
		{ id: 'intraday-orderflow', label: 'Intraday Order Flow & Scalping' },
		{ id: 'swing-macro', label: 'Swing Trading & Macro Cycles' }
	];

	const coursesCatalog: TradingCourse[] = [
		{
			id: 'move-prior-to-the-move-masterclass',
			code: 'Course 01 // Flagship Institutional System',
			title: 'The Move Prior to The Move™: Institutional Order Flow & Price Action',
			track: 'intraday-orderflow',
			trackLabel: 'Intraday Order Flow & Scalping',
			level: 'All Levels to Pro',
			modulesCount: '12 Modules • On-Demand HD',
			hook: 'Discover how Billy Ribeiro anticipates institutional accumulation and distribution before the retail breakout candle even prints.',
			coreOutcome:
				'Master the proprietary system praised by former Goldman Sachs legend Mark "Goldfinger" McGoldrick—replacing lagging retail patterns with real-time liquidity and volume structure.',
			syllabus: [
				'Module 1: Why 95% of Retail Chart Patterns Are Engineered Liquidity Traps',
				'Module 2: Reading Institutional Absorption, Abandoned Bars & Exhaustion Sweeps',
				'Module 3: Mapping Pre-Trade Entry Triggers, Tiered Profit Targets & Hard Stops',
				'Module 4: Live Tape Execution Across Liquid Stocks, ETFs & Index Options'
			],
			recommendedRoomLabel: 'Pairs With: Day Trading Room →',
			recommendedRoomHref: '/live-trading-rooms/day-trading-room'
		},
		{
			id: 'small-account-compounding-blueprint',
			code: 'Course 02 // $500+ Capital Engineering',
			title: 'The $500+ Small Account Compounding & T+1 Cash Rotation Blueprint',
			track: 'small-accounts',
			trackLabel: '$500+ Small Accounts & Foundation',
			level: 'Beginner to Intermediate',
			modulesCount: '8 Modules • Includes Workbook',
			hook: 'Proven mathematical strategies for protecting and growing a small trading account starting as low as $500 without gambling.',
			coreOutcome:
				'Eliminate small-account blowups by mastering T+1 cash-account settlement rotation, Pattern Day Trader (PDT) bypass rules, contract price ceilings, and strict drawdown caps.',
			syllabus: [
				'Module 1: The Mathematics of $500 Account Survival & Why "All-In" Challenges Fail',
				'Module 2: T+1 Cash Account Partitioning for Daily Buying Power Without $25K Margin',
				'Module 3: Selecting Affordable, High-Liquidity Options Contracts & Tight Spreads',
				'Module 4: The 4-Stage Scaling Roadmap from $500 to $25,000+ Institutional Sizing'
			],
			recommendedRoomLabel: 'Pairs With: Small Accounts Room →',
			recommendedRoomHref: '/live-trading-rooms/small-accounts-room'
		},
		{
			id: 'options-greeks-and-volatility-mastery',
			code: 'Course 03 // Options Pricing & Asymmetry',
			title: 'Options Greeks Mastery: Delta, Gamma, Theta & Vega Execution',
			track: 'options-greeks',
			trackLabel: 'Options & Greeks Mastery',
			level: 'Beginner to Advanced',
			modulesCount: '10 Modules • Cheat Sheets Included',
			hook: 'Stop losing money when you are right on direction. Master the four primary Greeks to structure asymmetric options trades.',
			coreOutcome:
				'Learn how to select optimal strikes and expirations, avoid post-earnings implied volatility (Vega) crush, and harness 30–45 DTE Theta decay like an institutional desk.',
			syllabus: [
				'Module 1: Delta as Directional Speedometer, Probability Gauge & Position Sizer',
				'Module 2: Harnessing Gamma Acceleration on Long Plays & Avoiding Expiration Blowups',
				'Module 3: The Theta Time-Decay Machine: Structuring 15–20 Delta Credit Spreads',
				'Module 4: Vega & Volatility Regimes: Buying Low IV vs. Selling High IV'
			],
			recommendedRoomLabel: 'Try Free: Options Calculator →',
			recommendedRoomHref: '/resources/options-calculator'
		},
		{
			id: 'working-pro-swing-trading-system',
			code: 'Course 04 // 9-to-5 Schedule Architecture',
			title: 'Multi-Day Swing Trading for Working Professionals (20-Minute Routine)',
			track: 'swing-macro',
			trackLabel: 'Swing Trading & Macro Cycles',
			level: 'All Levels',
			modulesCount: '9 Modules • Conditional Order Templates',
			hook: 'Learn how to capture explosive 3-to-15 day stock and options moves in 20 minutes a day without watching screens at work.',
			coreOutcome:
				'Install a repeatable evening and pre-market routine using conditional triggers, multi-day options structures that survive overnight Theta, and trailing structural stops.',
			syllabus: [
				'Module 1: Building Your Sunday & Evening 20-Minute Institutional Watchlist',
				'Module 2: Multi-Timeframe Volatility Squeeze & Sector Rotation Alignment',
				'Module 3: Structuring Multi-Day Calls, Puts, Verticals & Diagonals',
				'Module 4: Automated Order Execution (Limit, Stop-Limit & OCO Bracket Orders)'
			],
			recommendedRoomLabel: 'Pairs With: Swing Trading Room →',
			recommendedRoomHref: '/live-trading-rooms/swing-trading-room'
		},
		{
			id: 'spx-0dte-and-index-gamma-execution',
			code: 'Course 05 // High-Velocity Index Options',
			title: 'SPX & Index Options Execution: Dealer Gamma Walls & Intraday Flow',
			track: 'options-greeks',
			trackLabel: 'Options & Greeks Mastery',
			level: 'Intermediate to Pro',
			modulesCount: '8 Modules • Live Tape Replays',
			hook: 'Identify institutional dealer hedging levels, gamma magnet strikes, and A+ intraday reversals on SPX, SPY, and QQQ.',
			coreOutcome:
				'Understand how market-maker Delta and Gamma hedging drives intraday index moves—and how to structure defined-risk index options trades during key session windows.',
			syllabus: [
				'Module 1: How Dealer Gamma Exposure (GEX) Pins or Accelerates the S&P 500',
				'Module 2: Mapping Pre-Market Call Walls, Put Walls & Liquidity Sweep Zones',
				'Module 3: Single-Leg vs. Vertical Spread Structuring on SPX Index Options',
				'Module 4: Avoiding Midday Theta Chop & Executing Power-Hour Inflections'
			],
			recommendedRoomLabel: 'Pairs With: SPX Profit Pulse →',
			recommendedRoomHref: '/alert-services/spx-profit-pulse'
		},
		{
			id: 'contrarian-distribution-and-shorting',
			code: 'Course 06 // The +600% OXY Put Playbook',
			title: 'Contrarian Distribution & Put Options: Fading Retail Euphoria Live',
			track: 'intraday-orderflow',
			trackLabel: 'Intraday Order Flow & Scalping',
			level: 'Intermediate to Pro',
			modulesCount: '7 Modules • Full OXY Case Autopsy',
			hook: 'Deconstruct the exact institutional distribution playbook behind our live +600% overnight OXY Put Options trade vs. Warren Buffett.',
			coreOutcome:
				'Learn how to spot when breaking news and retail buying frenzy are actually institutional exit liquidity—and how to strike with defined-risk Put Options.',
			syllabus: [
				'Module 1: Anatomy of a Liquidity Trap: Why Retail Chases Headlines at the Top',
				'Module 2: Tick-by-Tick Autopsy of Our +600% Overnight OXY Put Options Execution',
				'Module 3: Identifying climax Volume, Abandoned Tops & Failed Breakout Candles',
				'Module 4: Structuring Put Contracts & Debit Spreads for Asymmetric Downside Velocity'
			],
			recommendedRoomLabel: 'Pairs With: Explosive Swings →',
			recommendedRoomHref: '/alert-services/explosive-swings'
		},
		{
			id: 'macro-cycle-inflection-mastery',
			code: 'Course 07 // 2020 & 2022 Top/Bottom Playbook',
			title: 'Macro Cycle Inflection Timing: Calling Generational Tops & Bottoms',
			track: 'swing-macro',
			trackLabel: 'Swing Trading & Macro Cycles',
			level: 'Intermediate to Institutional',
			modulesCount: '10 Modules • Macro Case Ledger',
			hook: 'Learn the exact top-down macro breadth, liquidity, and volatility framework that called the 2020 COVID and 2022 market tops and bottoms.',
			coreOutcome:
				'Protect your portfolio before major bear market liquidations and position aggressively at generational capitulation bottoms when mainstream pundits are paralyzed.',
			syllabus: [
				'Module 1: The Goldman Sachs Prop Framework for Macro Regime Detection',
				'Module 2: Case Study: How We Called the Feb 2020 Crash Top & March 2020 Bottom',
				'Module 3: Case Study: Calling the Jan 2022 Bull Top & Oct 2022 Accumulation Low',
				'Module 4: Portfolio Hedging & Sector Rotation Across Bull and Bear Regimes'
			],
			recommendedRoomLabel: 'Pairs With: 1-on-1 Mentorship →',
			recommendedRoomHref: '/mentorship'
		},
		{
			id: 'institutional-risk-and-trader-psychology',
			code: 'Course 08 // Mechanical Discipline & Mindset',
			title: 'Ironclad Risk Architecture & Eradicating Retail Self-Sabotage',
			track: 'small-accounts',
			trackLabel: '$500+ Small Accounts & Foundation',
			level: 'Mandatory for All Traders',
			modulesCount: '6 Modules • Pre-Trade Checklists',
			hook: 'Eliminate FOMO, revenge trading, hesitation, and early profit-taking by installing a mechanical pre-trade execution protocol.',
			coreOutcome:
				'Built by a founder who stood on the losing end in the past—this course replaces emotional guessing with mathematical position sizing and drawdown circuit breakers.',
			syllabus: [
				'Module 1: Why Smart People Self-Sabotage in Live Markets (And How to Stop)',
				'Module 2: The Pre-Trade Checklist: Never Entering Without Entry, Target & Stop',
				'Module 3: Daily & Weekly Drawdown Circuit Breakers to Prevent Tilt Days',
				'Module 4: Journaling & Expectancy Audits: Scaling Size Without Scaling Emotion'
			],
			recommendedRoomLabel: 'Read: Our Anti-Guru Mission →',
			recommendedRoomHref: '/our-mission'
		}
	];

	const courseDeliverables: LearningDeliverable[] = [
		{
			num: '01',
			badge: 'Self-Paced HD Curriculum',
			title: 'Bite-Sized, Actionable Video Modules (Zero Fluff)',
			description:
				'Every course is broken down into focused, high-definition training modules you can study on your desktop, tablet, or phone—at your own pace, 24/7.'
		},
		{
			num: '02',
			badge: 'Pre-Trade Execution Checklists',
			title: 'Written Playbooks With Exact Entry, Target & Stop Rules',
			description:
				'You receive downloadable PDF playbooks and mechanical checklists showing the exact conditions required before you ever click buy or sell.'
		},
		{
			num: '03',
			badge: 'Real Market Case Autopsies',
			title: 'Bar-by-Bar Breakdowns of Verified Live Market Calls',
			description:
				'Study the actual charts, options structures, and order-flow signals behind our 2020 COVID top/bottom, 2022 top/bottom, and +600% OXY Put Options trade.'
		},
		{
			num: '04',
			badge: 'Zero-Repaint Tool Integration',
			title: 'Seamless Alignment With Our Indicators & Scanners',
			description:
				'Learn how to read raw price action first, and how to pair it with our 100% non-repainting custom indicators (/store/indicators) and scanners (/store/scanners).'
		},
		{
			num: '05',
			badge: 'Right-Sized for Every Account',
			title: 'Dedicated Position-Sizing Formulas ($500+ to Pro)',
			description:
				'Every strategy includes specific position-sizing rules for $500+ cash accounts, working professional swing accounts, and full-time day trading desks.'
		},
		{
			num: '06',
			badge: 'Live Trading Floor Bridge',
			title: 'Watch the Curriculum Executed Live Every Market Day',
			description:
				'Unlike isolated theory courses, everything taught in our curriculum is executed live on screen every day inside our Trading Rooms and Video Watchlist Alerts.'
		}
	];

	const comparisonRows: ComparisonRow[] = [
		{
			criterion: 'Primary Instructor Lineage',
			fakeGuruCourses:
				'10+ disjointed marketers teaching conflicting retail indicators with zero Wall Street pedigree.',
			revolutionCourses:
				'One unified institutional system taught by Billy Ribeiro—mentored by Goldman Sachs legend Mark "Goldfinger" McGoldrick.'
		},
		{
			criterion: 'Course Pricing Philosophy',
			fakeGuruCourses:
				'Charges $2,500 to $5,000+ for basic theory—wiping out a beginner’s trading capital.',
			revolutionCourses:
				'People Over Profits: Kept genuinely accessible so your capital stays inside your brokerage account.'
		},
		{
			criterion: 'Indicator & Strategy Honesty',
			fakeGuruCourses:
				'Pushes repainted "holy grail" arrows and cherry-picked hindsight screenshots.',
			revolutionCourses:
				'100% non-repainting order flow, Options Greeks mathematics, and pre-planned entries, exits, and stops.'
		},
		{
			criterion: 'Small Account ($500+) Reality',
			fakeGuruCourses:
				'Teaches reckless position sizes that blow up accounts under $25,000 in weeks.',
			revolutionCourses:
				'Dedicated $500+ compounding rules, T+1 cash account rotation, and defined-risk options structures.'
		},
		{
			criterion: 'Verified Track Record Proof',
			fakeGuruCourses: 'Unverified claims and expired promotional webinars.',
			revolutionCourses:
				'Backed by live calls on the 2020 & 2022 market tops and bottoms and +600% overnight on OXY Put Options.'
		}
	];

	const bottomRoomCards: RoomCta[] = [
		{
			badge: 'Live Intraday Floor',
			title: 'Day Trading Room',
			description:
				'Watch our course curriculum executed live on screen with real-time voice commentary.',
			ctaLabel: 'Learn More →',
			href: '/live-trading-rooms/day-trading-room'
		},
		{
			badge: 'Working Professionals',
			title: 'Swing Trading Room',
			description:
				'Apply our multi-day swing curriculum with pre-planned entries, targets, and stops.',
			ctaLabel: 'Learn More →',
			href: '/live-trading-rooms/swing-trading-room'
		},
		{
			badge: '$500+ Starting Capital',
			title: 'Small Accounts Room',
			description:
				'Live guidance to execute our $500+ small account compounding and T+1 cash playbook.',
			ctaLabel: 'Learn More →',
			href: '/live-trading-rooms/small-accounts-room'
		},
		{
			badge: '0DTE & Index Options',
			title: 'SPX Profit Pulse Alerts',
			description: 'High-conviction SPX index options alerts with institutional Gamma levels.',
			ctaLabel: 'Explore Alerts →',
			href: '/alert-services/spx-profit-pulse'
		},
		{
			badge: 'Video Watchlist Tier',
			title: 'Explosive Swings Alerts',
			description:
				'Affordable alert-only video watchlists with exact entries, profit exits, and stops.',
			ctaLabel: 'Explore Alerts →',
			href: '/alert-services/explosive-swings'
		}
	];

	let activeTrack = $state<CourseTrack>('all');
	let openSyllabusId = $state<string | null>('move-prior-to-the-move-masterclass');

	const filteredCourses = $derived(
		activeTrack === 'all'
			? coursesCatalog
			: coursesCatalog.filter((course) => course.track === activeTrack)
	);

	function selectTrackAndScroll(track: CourseTrack) {
		activeTrack = track;
		const gridEl = document.getElementById('popular-courses-catalog');
		if (gridEl) {
			gridEl.scrollIntoView({ behavior: 'smooth' });
		}
	}

	function toggleSyllabus(id: string) {
		openSyllabusId = openSyllabusId === id ? null : id;
	}
</script>

<JsonLd schema={data.jsonLdSchema} />

<div class="app-shell">
	<Navbar />

	<main id="courses-store-page" class="inner-page courses-page">
		<!-- =========================================================================
       SECTION 1: BREADCRUMB & CURRICULUM TELEMETRY BAR
       ========================================================================= -->
		<nav class="breadcrumb-bar" aria-label="Breadcrumb">
			<div class="container breadcrumb-bar__inner">
				<ol class="breadcrumb-list">
					<li><a href={resolve('/')}>Home</a></li>
					<li aria-hidden="true">
						<CaretRightIcon size={12} weight="bold" />
					</li>
					<li><span>Store</span></li>
					<li aria-hidden="true">
						<CaretRightIcon size={12} weight="bold" />
					</li>
					<li aria-current="page">Courses from Revolution Trading Pros</li>
				</ol>
				<p class="breadcrumb-bar__telemetry">
					<span>Goldman Sachs Prop Lineage</span> • <span>Self-Paced On-Demand HD</span> •
					<span>People Over Profits</span>
				</p>
			</div>
		</nav>

		<!-- =========================================================================
       SECTION 2: ABOVE-THE-FOLD HERO + "NOT SURE WHERE TO START?" ROUTER
       ========================================================================= -->
		<section class="hero-section" aria-labelledby="courses-h1">
			<div class="container hero-section__grid">
				<!-- Left 7 Columns: Dual-Layer H1 + Anti-Guru Education Manifesto -->
				<div class="hero-section__main">
					<div class="eyebrow-pill">
						<span class="eyebrow-pill__badge">Educate • Master the Craft</span>
						<span class="eyebrow-pill__text">
							Mentored by Former Goldman Sachs Legend Mark "Goldfinger" McGoldrick
						</span>
					</div>

					<h1 id="courses-h1" class="hero-h1">
						<span class="hero-h1__seo-kicker">
							Self-Paced Stock, ETF &amp; Options Trading Courses • Institutional Curriculum
						</span>
						<span class="hero-h1__display">
							Stop Paying $3,000 for Recycled Retail Theory. Learn Real Wall Street Execution.
						</span>
					</h1>

					<p class="lead-copy">
						When you step inside our <strong>Stock &amp; Options Trading Courses</strong>, you
						immediately know you finally found what you have been searching for—not a marketer
						reading basic candlestick slides off a screen, and not a sales pitch for a fake "holy
						grail" indicator, but
						<strong
							>a complete, step-by-step institutional curriculum built to make you a self-sufficient
							trader</strong
						>.
					</p>

					<p class="body-copy">
						<strong
							>I know how infuriating it is to waste money on trading courses that don't work in
							live markets, because I stood on the losing end myself in the past.</strong
						>
						Most trading education companies charge $2,500 to $5,000 for basic retail patterns that Wall
						Street algorithms actively hunt for liquidity. That is why I built Revolution Trading Pros
						on one unbreakable rule:
						<strong>we focus on PEOPLE, not making money.</strong>
					</p>

					<p class="body-copy">
						Personally mentored by former Wall Street Goldman Sachs proprietary trading legend
						<strong>Mark "Goldfinger" McGoldrick</strong>—who described me as
						<em>"the future of trading"</em>—I codified our entire methodology (<strong
							>"The Move Prior to The Move™"</strong
						>) into structured, accessible courses. You learn the exact institutional order flow,
						Options Greeks mathematics, and macro cycle rules behind our live calls on the
						<strong>2020 COVID Top and Bottom</strong>, the
						<strong>2022 Market Top and Bottom</strong>, and our
						<strong>+600% overnight gain on OXY Put Options live</strong> opposite Warren Buffett.
					</p>

					<div class="cta-row">
						<a href="#popular-courses-catalog" class="btn btn--solid">
							Explore Popular Courses ↓
						</a>
						<a href={resolve('/store/indicators' as '/')} class="btn btn--outline">
							View Non-Repainting Indicators →
						</a>
					</div>
				</div>

				<!-- Right 5 Columns: Upgraded "Not Sure Where to Start?" Diagnostic Router -->
				<aside class="starter-router" aria-label="Not Sure Where to Start Course Selector">
					<div class="starter-router__header">
						<div>
							<span class="meta-label">Guided Learning Path</span>
							<h2 class="starter-router__title">Not Sure Where to Start?</h2>
						</div>
						<span class="starter-router__badge">Pick Your Profile</span>
					</div>

					<p class="starter-router__intro">
						Don't guess which course fits your schedule or capital. Click your trader profile below
						to filter the exact curriculum track engineered for you:
					</p>

					<div class="router-options">
						<button
							type="button"
							class="router-option"
							onclick={() => selectTrackAndScroll('small-accounts')}
						>
							<div class="router-option__top">
								<span class="router-option__tag">Track 01 // Starting at $500+ Capital</span>
								<span class="router-option__arrow">Select →</span>
							</div>
							<strong>Small Account &amp; Foundation Traders</strong>
							<p>
								Start with Course 02 ($500+ Compounding &amp; T+1 Cash Rotation) + Course 08 (Risk
								Architecture).
							</p>
						</button>

						<button
							type="button"
							class="router-option"
							onclick={() => selectTrackAndScroll('swing-macro')}
						>
							<div class="router-option__top">
								<span class="router-option__tag">Track 02 // Busy 9-to-5 Careers</span>
								<span class="router-option__arrow">Select →</span>
							</div>
							<strong>Working Professionals &amp; Swing Traders</strong>
							<p>
								Start with Course 04 (20-Minute Working Pro Swing System) + Course 07 (Macro Cycle
								Timing).
							</p>
						</button>

						<button
							type="button"
							class="router-option"
							onclick={() => selectTrackAndScroll('options-greeks')}
						>
							<div class="router-option__top">
								<span class="router-option__tag">Track 03 // Options &amp; SPX Execution</span>
								<span class="router-option__arrow">Select →</span>
							</div>
							<strong>Options &amp; Greeks Strategists</strong>
							<p>
								Start with Course 03 (Options Greeks Mastery) + Course 05 (SPX &amp; Index Dealer
								Gamma Levels).
							</p>
						</button>

						<button
							type="button"
							class="router-option"
							onclick={() => selectTrackAndScroll('intraday-orderflow')}
						>
							<div class="router-option__top">
								<span class="router-option__tag">Track 04 // Intraday Velocity</span>
								<span class="router-option__arrow">Select →</span>
							</div>
							<strong>Active Day Traders &amp; Scalpers</strong>
							<p>
								Start with Course 01 (The Move Prior to The Move™) + Course 06 (+600% OXY Contrarian
								Playbook).
							</p>
						</button>
					</div>
				</aside>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 3: POPULAR COURSES CATALOG GRID
       Header Split: "Popular Courses:" (Left) + "See All Courses" (Top Right)
       ========================================================================= -->
		<section
			id="popular-courses-catalog"
			class="catalog-section"
			aria-labelledby="popular-courses-h2"
		>
			<div class="container">
				<!-- Top Header Split (Simpler Trading Pattern — Without Duplicate DOM Bug) -->
				<div class="catalog-top-bar">
					<div class="catalog-top-bar__left">
						<span class="section-kicker">Educate • Innovate • Prosper</span>
						<h2 id="popular-courses-h2" class="section-h2">Popular Courses:</h2>
						<p class="catalog-top-bar__sub">
							Every course includes on-demand HD video modules, mechanical entry/exit/stop
							checklists, and real market case studies.
						</p>
					</div>

					<div class="catalog-top-bar__right">
						<button
							type="button"
							class="btn btn--solid"
							onclick={() => selectTrackAndScroll('all')}
						>
							See All Courses ({coursesCatalog.length}) →
						</button>
					</div>
				</div>

				<!-- Interactive Track Filter Bar -->
				<div class="filter-bar" role="tablist" aria-label="Filter courses by learning track">
					{#each trackFilters as tab (tab.id)}
						<button
							type="button"
							role="tab"
							aria-selected={activeTrack === tab.id}
							class="filter-tab"
							class:filter-tab--active={activeTrack === tab.id}
							onclick={() => (activeTrack = tab.id)}
						>
							{tab.label}
						</button>
					{/each}
				</div>

				<!-- 8-Card Course Catalog Grid (Crawlable H3 Titles + Expandable 4-Module Syllabus) -->
				<div class="courses-grid">
					{#each filteredCourses as course (course.id)}
						<article id={course.id} class="course-card">
							<!-- Card Top Banner -->
							<div class="course-card__banner">
								<div class="course-card__banner-top">
									<span class="course-card__code">{course.code}</span>
									<span class="course-card__level">{course.level}</span>
								</div>
								<div class="course-card__banner-bottom">
									<span class="course-card__track">{course.trackLabel}</span>
									<span class="course-card__modules">{course.modulesCount}</span>
								</div>
							</div>

							<!-- Card Body -->
							<div class="course-card__body">
								<h3 class="course-card__title">
									{course.title}
								</h3>

								<!-- Punchy 1-Sentence Hook -->
								<p class="course-card__hook">
									{course.hook}
								</p>

								<!-- Core Curriculum Outcome Box -->
								<div class="course-card__outcome-box">
									<strong>What You Will Master:</strong>
									<p>{course.coreOutcome}</p>
								</div>

								<!-- Expandable 4-Module Syllabus -->
								{#if openSyllabusId === course.id}
									<div class="course-card__syllabus">
										<span class="meta-label">Included Course Syllabus:</span>
										<ul class="syllabus-list">
											{#each course.syllabus as mod (mod)}
												<li>{mod}</li>
											{/each}
										</ul>
									</div>
								{/if}

								<div class="course-card__room-bridge">
									<a href={resolve(course.recommendedRoomHref as '/')} class="bridge-link">
										{course.recommendedRoomLabel}
									</a>
								</div>
							</div>

							<!-- Card Footer -->
							<div class="course-card__footer">
								<button
									type="button"
									class="btn btn--outline btn--full course-card__syllabus-btn"
									aria-expanded={openSyllabusId === course.id}
									onclick={() => toggleSyllabus(course.id)}
								>
									{openSyllabusId === course.id
										? 'Hide Course Syllabus −'
										: 'Inspect 4-Module Syllabus +'}
								</button>
								<a
									href={resolve('/contact' as '/')}
									class="btn btn--solid btn--full"
									aria-label={`Learn more and enroll in ${course.title}`}
								>
									Learn More →
								</a>
							</div>
						</article>
					{/each}
				</div>

				<!-- Bottom Store Navigation Bar -->
				<div class="catalog-bottom-bar">
					<button type="button" class="btn btn--solid" onclick={() => selectTrackAndScroll('all')}>
						See All Courses ({coursesCatalog.length})
					</button>
					<a href={resolve('/store/indicators' as '/')} class="btn btn--outline">
						Explore Custom Indicators →
					</a>
					<a href={resolve('/store/scanners' as '/')} class="btn btn--outline">
						Explore Institutional Scanners →
					</a>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 4: ONE UNIFIED INSTITUTIONAL MENTOR VS. 11 CONFLICTING GURUS
       (Replaces Simpler's "Browse Courses by 11 Traders" Confusion)
       ========================================================================= -->
		<section class="lineage-section" aria-labelledby="lineage-h2">
			<div class="container">
				<div class="lineage-grid">
					<div class="lineage-content">
						<span class="section-kicker">One Cohesive System • Zero Contradictions</span>
						<h2 id="lineage-h2" class="section-h2">
							Why Learning One Unified Goldman Sachs-Mentored System Beats Buying 10 Conflicting
							Guru Courses
						</h2>
						<p class="body-copy">
							On most trading websites, you are told to "browse courses by 11 different
							traders"—where one moderator tells you to buy breakout candles, another tells you to
							fade breakouts, and a third sells you a lagging oscillator. That contradiction is why
							retail traders freeze when the opening bell rings.
						</p>
						<p class="body-copy">
							At <strong>Revolution Trading Pros</strong>, every course in our curriculum is built
							around a single, battle-tested institutional architecture created by
							<strong>Billy Ribeiro</strong> under the direct mentorship of former Goldman Sachs
							proprietary trading legend <strong>Mark "Goldfinger" McGoldrick</strong>. Whether you
							are studying our $500+ Small Account course, our Options Greeks masterclass, or our
							Macro Cycle course, every module speaks the exact same language:
						</p>
						<ul class="lineage-list">
							<li>
								<strong>1. Price &amp; Liquidity Structure First:</strong> Identifying where retail stops
								are pooled and where institutional balance sheets are absorbing supply or demand.
							</li>
							<li>
								<strong>2. Mathematical Options &amp; Greeks Structuring:</strong> Selecting the exact
								Delta, Gamma, Theta, and Vega profile that gives you asymmetric 3R to 5R reward-to-risk.
							</li>
							<li>
								<strong>3. Pre-Planned Entries, Exits &amp; Hard Stops:</strong> Never entering a single
								trade without an objective trigger price, tiered profit targets, and a hard invalidation
								stop-loss.
							</li>
						</ul>
					</div>

					<div class="lineage-card">
						<span class="meta-label">Instructor Pedigree Dossier</span>
						<h3 class="lineage-card__name">Billy Ribeiro</h3>
						<p class="lineage-card__role">
							Founder &amp; Head Institutional Strategist • Mentored by Mark "Goldfinger" McGoldrick
						</p>
						<p class="lineage-card__copy">
							Named <strong>"The Future of Trading"</strong> by Goldman Sachs’s most successful
							proprietary investor in history. Creator of
							<strong>"The Move Prior to The Move™"</strong> and the only retail educator feared by
							Wall Street after calling the 2020 COVID top and bottom, the 2022 bull top and bear
							bottom, and executing a live
							<strong>+600% overnight gain on OXY Put Options</strong> while Warren Buffett went long
							millions of dollars.
						</p>
						<div class="lineage-card__links">
							<a href={resolve('/about' as '/')} class="btn btn--outline btn--full">
								Read Full Track Record &amp; Story →
							</a>
							<a href={resolve('/mentorship' as '/')} class="btn btn--solid btn--full">
								Apply for 1-on-1 Mentorship →
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 5: WHAT YOU GET WITH EVERY COURSE (6 DELIVERABLES BENTO GRID)
       (Upgrades Simpler Trading's "What You'll Get" Section)
       ========================================================================= -->
		<section class="deliverables-section" aria-labelledby="deliverables-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">Complete Execution Package • Zero Fluff</span>
					<h2 id="deliverables-h2" class="section-h2">
						What You Get Inside Every Revolution Trading Pros Course
					</h2>
					<p class="body-copy section-header__sub">
						We don’t hand you abstract theory and wish you luck. Every course is engineered as a
						complete field manual for live market execution:
					</p>
				</div>

				<div class="deliverables-grid">
					{#each courseDeliverables as item (item.num)}
						<article class="deliverable-card">
							<div class="deliverable-card__top">
								<span class="deliverable-card__num">{item.num}</span>
								<span class="meta-label">{item.badge}</span>
							</div>
							<h3 class="deliverable-card__title">{item.title}</h3>
							<p class="deliverable-card__desc">{item.description}</p>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 6: $3,000 GURU COURSES VS. OUR CURRICULUM (COMPARISON TABLE)
       ========================================================================= -->
		<section class="comparison-section" aria-labelledby="comparison-h2">
			<div class="container">
				<div class="section-header">
					<span class="section-kicker">The Anti-Guru Standard • Hard Evidence</span>
					<h2 id="comparison-h2" class="section-h2">
						Overpriced "Guru" Courses vs. The Revolution Trading Pros Curriculum
					</h2>
				</div>

				<div class="table-wrapper" role="region" aria-labelledby="comparison-h2">
					<table class="comparison-table">
						<thead>
							<tr>
								<th scope="col">Evaluation Standard</th>
								<th scope="col">Typical $3,000 "Trading Guru" Courses</th>
								<th scope="col">Revolution Trading Pros Courses</th>
							</tr>
						</thead>
						<tbody>
							{#each comparisonRows as row (row.criterion)}
								<tr>
									<th scope="row" class="comparison-table__feature">{row.criterion}</th>
									<td class="comparison-table__negative">✕ {row.fakeGuruCourses}</td>
									<td class="comparison-table__positive">✓ {row.revolutionCourses}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 7: COURSES FAQ ACCORDION (SEO & AI OVERVIEW OPTIMIZED)
       ========================================================================= -->
		<section id="faq" class="faq-section" aria-labelledby="courses-faq-h2">
			<div class="container faq-container">
				<div class="section-header">
					<span class="section-kicker">Direct Answers • Zero Marketing Spin</span>
					<h2 id="courses-faq-h2" class="section-h2">
						Frequently Asked Questions About Our Trading Courses
					</h2>
				</div>

				<div class="faq-list">
					{#each COURSES_STORE_FAQ_ITEMS as faq, idx (faq.id)}
						<details id={`faq-${faq.id}`} class="faq-item" open={idx === 0}>
							<summary class="faq-item__question">
								<h3 class="faq-item__heading">{faq.question}</h3>
								<span class="faq-item__icon" aria-hidden="true">+</span>
							</summary>
							{#if faq.id === 'beginner-500-account'}
								<p class="faq-item__answer">
									Start with
									<strong
										>Course 02 (The $500+ Small Account Compounding &amp; T+1 Cash Rotation
										Blueprint)</strong
									>
									paired with <strong>Course 08 (Ironclad Risk Architecture)</strong>. They give you
									the exact mathematical position-sizing rules, cash-account settlement rotation,
									and pre-trade checklists we execute daily inside our
									<a href={resolve('/live-trading-rooms/small-accounts-room' as '/')}
										>Small Accounts Room</a
									>.
								</p>
							{:else if faq.id === 'indicators-scanners-optional'}
								<p class="faq-item__answer">
									<strong>No—raw price, volume, and Options Greeks come first.</strong> Every course
									teaches you how to read institutional market structure on any standard charting
									platform. Our 100% non-repainting
									<a href={resolve('/store/indicators' as '/')}>Custom Indicators</a> and
									<a href={resolve('/store/scanners' as '/')}>Institutional Scanners</a> are optional
									accelerators designed to spot those exact setups faster across multiple timeframes.
								</p>
							{:else if faq.id === 'courses-vs-mentorship-rooms'}
								<p class="faq-item__answer">
									Our <strong>Courses</strong> give you permanent, on-demand video modules and
									written playbooks to study at your own pace. Our
									<a href={resolve('/live-trading-rooms/day-trading-room' as '/')}
										>Live Trading Rooms</a
									>
									and
									<a href={resolve('/alert-services/explosive-swings' as '/')}>Alert Services</a>
									let you execute those playbooks alongside our desk in real time. Our
									<a href={resolve('/mentorship' as '/')}>1-on-1 Mentorship</a> is an application-and-approval-only
									private coaching partnership for Portfolio Managers, Pro Traders, and Struggling Traders
									seeking direct personal transformation.
								</p>
							{:else}
								<p class="faq-item__answer">
									Yes. Our curriculum covers US-listed stocks, ETFs, and options contracts traded by
									members across both the United States and Canada—including US Pattern Day Trader
									(PDT) and T+1 cash settlement rules as well as Canadian margin and registered
									account considerations.
								</p>
							{/if}
						</details>
					{/each}
				</div>
			</div>
		</section>

		<!-- =========================================================================
       SECTION 8: START TRADING LIKE A PROFESSIONAL (5 ROOM & ALERT CTA CARDS)
       ========================================================================= -->
		<section class="pro-cta-section" aria-labelledby="pro-cta-h2">
			<div class="container">
				<div class="pro-cta-box">
					<div class="pro-cta-box__header">
						<span class="section-kicker">Educate • Innovate • Prosper</span>
						<h2 id="pro-cta-h2" class="section-h2 pro-cta-box__h2">
							Combine Self-Paced Mastery With Live Market Execution
						</h2>
						<p class="body-copy pro-cta-box__sub">
							Watch every concept from our curriculum executed live in real time inside our Trading
							Rooms and Video Watchlist Alert Services:
						</p>
					</div>

					<div class="room-cta-grid">
						{#each bottomRoomCards as room (room.href)}
							<article class="room-cta-card">
								<div>
									<span class="room-cta-card__badge">{room.badge}</span>
									<h3 class="room-cta-card__title">{room.title}</h3>
									<p class="room-cta-card__desc">{room.description}</p>
								</div>
								<a href={resolve(room.href as '/')} class="btn btn--solid btn--full">
									{room.ctaLabel}
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
