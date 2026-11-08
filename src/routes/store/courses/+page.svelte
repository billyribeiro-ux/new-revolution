<!-- src/routes/store/courses/+page.svelte -->
<script lang="ts">
	import '#lib/styles/inner-page.css';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { scrollToSection } from '#lib/utils/scroll.ts';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import CourseCard from '#lib/components/store/CourseCard.svelte';
	import CatalogGrid from '#lib/components/ui/CatalogGrid.svelte';
	import FilterChips from '#lib/components/ui/FilterChips.svelte';
	import { coursesCatalog, trackFilters, type CourseTrackFilter } from '#lib/data/courses.ts';
	import { COURSES_STORE_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let showDraftCatalog = $state(
		typeof window !== 'undefined' && page.url.searchParams.get('preview') === '1'
	);

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

	const courseDeliverables: LearningDeliverable[] = [
		{
			num: '01',
			badge: 'Self-Paced HD Curriculum',
			title: 'Bite-Sized, Actionable Video Modules (Zero Fluff)',
			description:
				'Every course is broken down into focused, high-definition training modules you can study on your desktop, tablet, or phone at your own pace, 24/7.'
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
				'Learn how to read raw price action first, and how to pair it with our 100% non-repainting custom indicators and scanners.'
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
				'One unified institutional system taught by Billy Ribeiro, mentored by Goldman Sachs legend Mark "Goldfinger" McGoldrick.'
		},
		{
			criterion: 'Course Pricing Philosophy',
			fakeGuruCourses:
				'Charges $2,500 to $5,000+ for basic theory, wiping out a beginner’s trading capital.',
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
			title: 'Sunday Alpha Protocol',
			description:
				'Affordable alert-only video watchlists with exact entries, profit exits, and stops.',
			ctaLabel: 'Explore Alerts →',
			href: '/alert-services/sunday-alpha-protocol'
		}
	];

	let activeTrack = $state<CourseTrackFilter>('all');

	const filteredCourses = $derived(
		activeTrack === 'all'
			? coursesCatalog
			: coursesCatalog.filter((course) => course.track === activeTrack)
	);

	function selectTrackAndScroll(track: CourseTrackFilter) {
		activeTrack = track;
		showDraftCatalog = true;
		const gridEl = document.getElementById('popular-courses-catalog');
		if (gridEl) {
			gridEl.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#courses-store-page">Skip to content</a>

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
					<li aria-current="page">Trading Courses</li>
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
						immediately know you finally found what you have been searching for: not a marketer
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
						<strong>we put people over profits.</strong>
					</p>

					<p class="body-copy">
						Personally mentored by former Wall Street Goldman Sachs proprietary trading legend
						<strong>Mark "Goldfinger" McGoldrick</strong>, who described me as
						<em>"the future of trading"</em>, I codified our entire methodology (<strong
							>"The Move Prior to The Move™"</strong
						>) into structured, accessible courses. You learn the exact institutional order flow,
						Options Greeks mathematics, and macro cycle rules behind our live calls on the
						<strong>2020 COVID Top and Bottom</strong>, the
						<strong>2022 Market Top and Bottom</strong>, and our
						<strong>+600% overnight gain on OXY Put Options live</strong> opposite Warren Buffett.
					</p>

					<div class="cta-row">
						<button
							type="button"
							class="btn btn--solid"
							onclick={() => scrollToSection('popular-courses-catalog')}
						>
							Explore Popular Courses ↓
						</button>
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

				<div class="courses-coming-soon-box" role="region" aria-label="Courses Coming Soon">
					<div class="courses-coming-soon-badge-row">
						<span class="courses-coming-soon-badge">Curriculum in Active Production</span>
						<span class="courses-coming-soon-badge-sub"
							>High-Definition Video Modules • Spring 2027</span
						>
					</div>
					<h3 class="courses-coming-soon__title">COURSES COMING SOON!</h3>
					<p class="courses-coming-soon__sub">
						Comprehensive Institutional Trading Masterclasses Codifying "The Move Prior to The
						Move™"
					</p>
					<p class="courses-coming-soon__copy">
						We are currently producing and polishing our complete on-demand institutional video
						curriculum. Codifying Billy Ribeiro’s proprietary Goldman Sachs trading desk lineage,
						each course features mechanical entry and stop checklists, real verified trade
						autopsies, and risk architectures right-sized from $500 cash accounts to full-time
						proprietary desks.
					</p>
					<p class="courses-coming-soon__secondary-copy">
						Because we put <strong>People Over Profits</strong>, we refuse to release rushed or
						unverified material. In the meantime, the exact trading strategies, gamma levels, and
						order-flow disciplines taught in this curriculum are executed live on screen every
						market day inside our Live Trading Rooms, delivered in our Video Watchlist Alerts, or
						taught directly in 1-on-1 Mentorship.
					</p>
					<div class="courses-coming-soon__actions">
						<a href={resolve('/live-trading-rooms/day-trading-room')} class="btn btn--solid">
							Explore Live Trading Rooms →
						</a>
						<a href={resolve('/mentorship')} class="btn btn--outline">
							Apply for 1-on-1 Mentorship →
						</a>
						<a href={resolve('/store/indicators')} class="btn btn--outline">
							View Non-Repainting Indicators →
						</a>
					</div>

					<div class="courses-coming-soon__grid">
						<div class="courses-coming-soon__item">
							<span class="courses-coming-soon__item-num">01 // FOUNDATIONS</span>
							<strong class="courses-coming-soon__item-title"
								>Core Foundations &amp; Order Flow</strong
							>
							<p>
								The Move Prior to The Move™ methodology and institutional accumulation footprints.
							</p>
						</div>
						<div class="courses-coming-soon__item">
							<span class="courses-coming-soon__item-num">02 // COMPOUNDING</span>
							<strong class="courses-coming-soon__item-title">$500+ Small Account Blueprint</strong>
							<p>T+1 cash account rotation, risk budgeting, and asymmetric options compounding.</p>
						</div>
						<div class="courses-coming-soon__item">
							<span class="courses-coming-soon__item-num">03 // DERIVATIVES</span>
							<strong class="courses-coming-soon__item-title">Options Greeks Mastery</strong>
							<p>Delta, Gamma, Theta, and Vega architecture decoded for retail execution.</p>
						</div>
						<div class="courses-coming-soon__item">
							<span class="courses-coming-soon__item-num">04 // 9-TO-5 CAREERS</span>
							<strong class="courses-coming-soon__item-title">Working Pro 20-Min Swing</strong>
							<p>
								Pre-market and evening analysis routines built specifically for 9-to-5
								professionals.
							</p>
						</div>
					</div>
				</div>

				<FilterChips
					label="Filter courses by learning track"
					options={trackFilters}
					bind:value={activeTrack}
				/>

				<!-- Catalog: crawlable h3 titles; every syllabus is in the server-rendered HTML (native <details>). -->
				<CatalogGrid
					items={filteredCourses}
					key={(course) => course.id}
					isFeatured={(course) => course.featured === true}
					total={coursesCatalog.length}
					noun="courses"
					emptyMessage="No courses match this track."
				>
					{#snippet children(course)}
						<CourseCard {course} />
					{/snippet}
				</CatalogGrid>
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
							On most trading websites, you are told to "browse courses by 11 different traders",
							where one moderator tells you to buy breakout candles, another tells you to fade
							breakouts, and a third sells you a lagging oscillator. That contradiction is why
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
							<strong>"The Move Prior to The Move™"</strong>, bringing institutional order-flow
							discipline to self-directed traders after calling the 2020 COVID top and bottom, the
							2022 bull top and bear bottom, and executing a contrarian defined-risk
							<strong>OXY put options trade for a reported +600% overnight gain</strong> during high-volume
							institutional distribution (past performance does not guarantee future results).
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
									<strong>No. Raw price, volume, and Options Greeks come first.</strong> Every
									course teaches you how to read institutional market structure on any standard
									charting platform. Our 100% non-repainting
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
									<a href={resolve('/alert-services/sunday-alpha-protocol' as '/')}
										>Alert Services</a
									>
									let you execute those playbooks alongside our desk in real time. Our
									<a href={resolve('/mentorship' as '/')}>1-on-1 Mentorship</a> is an application-and-approval-only
									private coaching partnership for Portfolio Managers, Pro Traders, and Struggling Traders
									seeking direct personal transformation.
								</p>
							{:else}
								<p class="faq-item__answer">
									Yes. Our curriculum covers US-listed stocks, ETFs, and options contracts traded by
									members across both the United States and Canada, including US Pattern Day Trader
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

<style>
	.courses-coming-soon-box {
		border: 1px solid var(--line-strong);
		background:
			radial-gradient(800px 300px at 50% 0%, rgba(220, 255, 101, 0.05), transparent 70%),
			linear-gradient(180deg, var(--panel) 0%, var(--surface-cases) 100%);
		padding: clamp(32px, 5vw, 64px) clamp(20px, 4vw, 48px);
		margin-block-start: 24px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.courses-coming-soon-badge-row {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
		justify-content: center;
		margin-block-end: 20px;
	}

	.courses-coming-soon-badge {
		display: inline-block;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		background: var(--acid);
		color: var(--ink);
		padding: 4px 12px;
	}

	.courses-coming-soon-badge-sub {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text-secondary);
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.courses-coming-soon__title {
		font-family: var(--font-display);
		font-size: var(--step-h1);
		color: var(--text);
		margin: 0 0 16px;
		letter-spacing: -0.01em;
	}

	.courses-coming-soon__sub {
		font-family: var(--font-sans);
		font-size: var(--step-lead);
		color: var(--acid);
		margin: 0 0 24px;
		max-inline-size: 68ch;
		line-height: var(--leading-lead);
	}

	.courses-coming-soon__copy {
		font-family: var(--font-sans);
		font-size: var(--step-body);
		color: var(--text-secondary);
		margin: 0 auto 16px;
		max-inline-size: 75ch;
		line-height: var(--leading-body);
	}

	.courses-coming-soon__secondary-copy {
		font-family: var(--font-sans);
		font-size: var(--step-body);
		color: var(--muted);
		margin: 0 auto 32px;
		max-inline-size: 75ch;
		line-height: var(--leading-body);
	}

	.courses-coming-soon__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		justify-content: center;
		margin-block-end: 48px;
	}

	.courses-coming-soon__grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 16px;
		inline-size: 100%;
		text-align: start;
		padding-block-start: 36px;
		border-block-start: 1px solid var(--line);
	}

	@media (min-width: 640px) {
		.courses-coming-soon__grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 1024px) {
		.courses-coming-soon__grid {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

	.courses-coming-soon__item {
		border: 1px solid var(--line);
		background: var(--bg-soft);
		padding: 24px 20px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.courses-coming-soon__item-num {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 700;
		color: var(--acid);
		letter-spacing: 0.05em;
	}

	.courses-coming-soon__item-title {
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: 700;
		color: var(--text);
		margin: 0;
	}

	.courses-coming-soon__item p {
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		color: var(--text-secondary);
		margin: 0;
		line-height: 1.5;
	}
</style>
