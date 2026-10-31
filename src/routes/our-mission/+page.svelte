<!-- src/routes/our-mission/+page.svelte -->
<script lang="ts">
	import '#lib/styles/inner-page.css';
	import { resolve } from '$app/paths';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import { MISSION_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	interface MissionPillar {
		step: string;
		verb: string;
		tagline: string;
		headline: string;
		description: string;
		proofPoint: string;
		routes: {
			label: string;
			href: string;
		}[];
	}

	interface MemberCommitment {
		number: string;
		badge: string;
		title: string;
		problemSolved: string;
		ourPledge: string;
	}

	interface ProtectedTraderGroup {
		tag: string;
		title: string;
		painPoint: string;
		solution: string;
		primaryLinkLabel: string;
		primaryLinkHref: string;
		secondaryLinkLabel: string;
		secondaryLinkHref: string;
	}

	const missionPillars: MissionPillar[] = [
		{
			step: 'Pillar 01',
			verb: 'Educate',
			tagline: 'Truth Over Textbook Theory',
			headline: 'Teach Real Institutional Market Mechanics—Never Recycled Retail Hype',
			description:
				'Retail traders lose because they are taught lagging retail patterns that institutional algorithms actively hunt. We educate our members using the exact order flow, liquidity exhaustion, and asymmetric risk principles passed down from former Goldman Sachs proprietary trading legend Mark "Goldfinger" McGoldrick.',
			proofPoint:
				'From $500 starter accounts to full-time professionals, every member learns why a trade works before risking a single dollar.',
			routes: [
				{ label: 'Structured Trading Courses', href: '/store/courses' },
				{ label: 'Small Accounts Room ($500+)', href: '/live-trading-rooms/small-accounts-room' },
				{ label: 'Market Intelligence Blogs', href: '/blog' }
			]
		},
		{
			step: 'Pillar 02',
			verb: 'Innovate',
			tagline: 'Zero-Repaint Precision Telemetry',
			headline: 'Build Honest, Non-Repainting Indicators, Scanners & Free Public Tools',
			description:
				'The trading industry is flooded with $2,000 "holy grail" indicators engineered to repaint arrows after the candle closes so marketers can film fake promotional videos. We innovate by building 100% non-repainting custom indicators, live institutional scanners, and free public calculators that print objective truth in real time.',
			proofPoint:
				'Every signal, liquidity zone, and abandoned price bar prints live and stays on the chart permanently—giving you verifiable clarity.',
			routes: [
				{ label: 'Custom Non-Repainting Indicators', href: '/store/indicators' },
				{ label: 'Institutional Market Scanners', href: '/store/scanners' },
				{ label: 'Free Options Calculator', href: '/resources/options-calculator' }
			]
		},
		{
			step: 'Pillar 03',
			verb: 'Prosper',
			tagline: 'People Over Making Money',
			headline: 'Deliver Affordable Live Execution & Exact Video Watchlists So Members Thrive',
			description:
				'Education and tools mean nothing if subscription fees drain your trading capital. We keep our live trading rooms and alert services genuinely affordable—delivering real-time intraday execution and detailed video watchlists with exact targeted entries, profit exits, and hard stop-losses.',
			proofPoint:
				'Whether you trade live with us at the opening bell or execute swings around a 9-to-5 career, our only metric of success is your consistency.',
			routes: [
				{ label: 'Live Day Trading Room', href: '/live-trading-rooms/day-trading-room' },
				{ label: 'Swing Trading Room', href: '/live-trading-rooms/swing-trading-room' },
				{ label: 'Explosive Swings Video Watchlist', href: '/alert-services/explosive-swings' }
			]
		}
	];

	const memberCommitments: MemberCommitment[] = [
		{
			number: '01',
			badge: 'Ethical Pricing Standard',
			title: 'Radical Affordability: Keep Your Capital in Your Brokerage Account',
			problemSolved:
				'Fake gurus charge $3,000 to $10,000 for basic courses, stripping new traders of the very capital they need to trade.',
			ourPledge:
				'We price our Live Trading Rooms, Alert Services (SPX Profit Pulse & Explosive Swings), Courses, Indicators, and Scanners for maximum accessibility—because we make our living from the market, not from gouging students.'
		},
		{
			number: '02',
			badge: 'Zero Repainting Law',
			title: 'No Fake "Holy Grail" Indicators—Ever',
			problemSolved:
				'Predatory indicator sellers market scripts that erase losing signals in hindsight and leave traders trapped in live market chop.',
			ourPledge:
				'We will never sell you a "magic buy/sell arrow" fantasy. Every custom indicator and scanner in our Store is 100% non-repainting and built on real institutional volume, price structure, and liquidity exhaustion.'
		},
		{
			number: '03',
			badge: 'Pre-Trade Accountability',
			title: 'Exact Entries, Profit Targets & Hard Stops Before the Move Happens',
			problemSolved:
				'Internet marketers post winning screenshots after the market closes without ever defining risk ahead of time.',
			ourPledge:
				'Every setup called in our rooms or delivered in our video watchlists defines the exact entry trigger, tiered profit targets, and hard invalidation stop-loss before execution—the same standard behind our 2020, 2022, and +600% OXY Put Options calls.'
		},
		{
			number: '04',
			badge: 'Complete Inclusivity',
			title: 'No Trader Left Behind: From $500 Small Accounts to Working Pros',
			problemSolved:
				'Most trading rooms force a single reckless style that blows up $500 accounts and excludes people with full-time 9-to-5 jobs.',
			ourPledge:
				'We maintain dedicated environments for every reality: the Small Accounts Room for $500+ capital, the Swing Trading Room and Explosive Swings alerts for working professionals, and the Day Trading Room and SPX Profit Pulse for intraday traders.'
		},
		{
			number: '05',
			badge: 'Merit Over Money',
			title: '1-on-1 Mentorship by Application and Approval Only',
			problemSolved:
				'Traditional coaching programs accept anyone whose credit card clears, regardless of whether the student is ready.',
			ourPledge:
				'You cannot buy your way into our 1-on-1 Mentorship off the shelf. Every applicant is manually reviewed and approved based on coachability, discipline, and work ethic—proving we care about transformation over revenue.'
		},
		{
			number: '06',
			badge: 'Earned Authority',
			title: 'Battle-Tested Wall Street Lineage & Live Market Proof',
			problemSolved:
				'Unqualified educators teach theory they have never executed against institutional order flow.',
			ourPledge:
				'Every lesson we teach is anchored in lived market combat—forged by standing on the losing side first, being mentored by Goldman Sachs legend Mark "Goldfinger" McGoldrick, and executing live through the 2020 and 2022 macro turns.'
		}
	];

	const protectedGroups: ProtectedTraderGroup[] = [
		{
			tag: '9-to-5 Careers & Busy Schedules',
			title: 'Working Professionals',
			painPoint:
				'You work hard at your career and cannot sit glued to 1-minute charts for six hours a day—yet you refuse to settle for 7% index returns while inflation erodes your future.',
			solution:
				'Our Swing Trading Room and Explosive Swings video watchlists hand you institutional multi-day stock and options setups with pre-planned entries, exits, and stops you can execute in 15 minutes.',
			primaryLinkLabel: 'Explore Swing Trading Room',
			primaryLinkHref: '/live-trading-rooms/swing-trading-room',
			secondaryLinkLabel: 'View Explosive Swings Alerts',
			secondaryLinkHref: '/alert-services/explosive-swings'
		},
		{
			tag: 'Starting Capital as Low as $500',
			title: '$500+ Small Account Traders',
			painPoint:
				'You have $500 to $2,500 to start, and you are tired of rooms calling $15.00 options contracts where one normal pullback wipes out half your account.',
			solution:
				'Our Small Accounts Room is built specifically for $500+ accounts—teaching strict position sizing, cash-account T+1 rotation, and high-probability setups priced for small-account survival and compounding.',
			primaryLinkLabel: 'Explore Small Accounts Room',
			primaryLinkHref: '/live-trading-rooms/small-accounts-room',
			secondaryLinkLabel: 'Try Free Options Calculator',
			secondaryLinkHref: '/resources/options-calculator'
		},
		{
			tag: 'Intraday Velocity & Scalping',
			title: 'Day Traders, Scalpers & Full-Time Pros',
			painPoint:
				'You are tired of delayed chatroom text messages and hesitant moderators who only talk after the candle has already broken out.',
			solution:
				'Our Day Trading Room and SPX Profit Pulse alerts deliver live pre-market game plans, real-time voice execution, live screen sharing, and institutional order-flow reads on stocks, ETFs, and SPX options.',
			primaryLinkLabel: 'Explore Day Trading Room',
			primaryLinkHref: '/live-trading-rooms/day-trading-room',
			secondaryLinkLabel: 'View SPX Profit Pulse',
			secondaryLinkHref: '/alert-services/spx-profit-pulse'
		},
		{
			tag: 'Serious Career Transformation',
			title: '1-on-1 Mentorship Candidates',
			painPoint:
				'You want direct, personalized guidance from a trader mentored by Goldman Sachs legend Mark "Goldfinger" McGoldrick—not a generic pre-recorded webinar.',
			solution:
				'Our application-only 1-on-1 Mentorship pairs approved traders directly with our desk to rebuild your execution, psychology, and risk management from the ground up.',
			primaryLinkLabel: 'Apply for 1-on-1 Mentorship',
			primaryLinkHref: '/mentorship',
			secondaryLinkLabel: 'Read Founder Story & Track Record',
			secondaryLinkHref: '/about'
		}
	];
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#our-mission-page">Skip to content</a>

<Navbar />

<main id="our-mission-page" class="inner-page mission-page">
	<!-- =========================================================================
       SECTION 1: BREADCRUMB & MISSION CHARTER BAR
       ========================================================================= -->
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true" class="crumb-sep"><CaretRightIcon size={12} weight="bold" /></li>
				<li aria-current="page">Our Mission</li>
			</ol>
			<p class="breadcrumb-bar__mandate">
				<span>Educate • Innovate • Prosper</span> • <span>People Over Making Money</span>
			</p>
		</div>
	</nav>

	<!-- =========================================================================
       SECTION 2: MISSION HERO SECTION (12-COLUMN ASYMMETRIC SPLIT)
       ========================================================================= -->
	<section class="section hero-section" aria-labelledby="mission-h1">
		<div class="container hero-section__grid">
			<!-- Left 7 Columns: Search-Intent H1 + Core Manifesto -->
			<div class="hero-section__main">
				<div class="eyebrow-pill">
					<span class="eyebrow-pill__tag">The Anti-Guru Charter</span>
					<span class="eyebrow-pill__text">Why We Focus on People—Not Making Money</span>
				</div>

				<h1 id="mission-h1" class="hero-h1">
					<span class="hero-h1__kicker seo-kicker">
						Our Mission: Honest Stock &amp; Options Trading Education, Live Execution &amp; Member
						Success
					</span>
					<span class="hero-h1__display">
						Our Goal Is to Help You Achieve Your Dreams—Never to Steal Your Money.
					</span>
				</h1>

				<p class="lead-copy">
					Most trading education services are built with a single, predatory goal: extract as much
					money from you as possible by selling overpriced courses and fake "holy grail" indicators. <strong
						>Revolution Trading Pros was built to burn that model to the ground.</strong
					>
				</p>

				<p class="body-copy">
					Because I have stood on the losing end of the market in the past, I know the sickening
					feeling of trusting a "guru" only to realize their indicators repaint and their trade
					calls are hindsight lies. When former Wall Street Goldman Sachs legend <strong
						>Mark "Goldfinger" McGoldrick</strong
					>
					mentored me directly and called me <em>"the future of trading,"</em> I made a vow: I would bring
					real Wall Street execution to everyday people at a price anyone can afford.
				</p>

				<p class="body-copy">
					Whether we are calling the <strong>2020 COVID Top and Bottom</strong>, calling the
					<strong>2022 Market Top and Bottom</strong>, or shorting
					<strong>OXY on Put Options live for a 600% overnight gain</strong>
					while Warren Buffett went long millions of dollars, our mission never changes:
					<strong>Educate, Innovate, and Prosper. We focus on PEOPLE, not making money.</strong>
				</p>

				<blockquote class="mission-quote">
					"We are the present and the future—we are the revolution! When you step inside our rooms,
					you finally know you found what you have been searching for."
				</blockquote>

				<div class="cta-group">
					<a href={resolve('/live-trading-rooms/day-trading-room' as '/')} class="btn btn-primary">
						Explore Our Live Trading Rooms
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</a>
					<a href={resolve('/alert-services/explosive-swings' as '/')} class="btn btn-outline">
						See Video Watchlist &amp; Alert Tiers
					</a>
				</div>
			</div>

			<!-- Right 5 Columns: The People Over Profits Charter Ledger -->
			<aside id="charter" class="charter-box" aria-label="The People Over Profits Ethical Charter">
				<div class="charter-box__header">
					<div>
						<span class="meta-tag">Official Ethical Standard</span>
						<h2 class="charter-box__title">The "People Over Profits" Charter</h2>
					</div>
					<span class="charter-box__seal">Non-Negotiable</span>
				</div>

				<ol class="charter-list">
					<li class="charter-list__item">
						<span class="charter-list__num">01</span>
						<div>
							<strong>Zero Fake "Holy Grail" Indicators</strong>
							<p>
								We never build, sell, or promote repainted scripts or fake "100% win-rate" arrows.
							</p>
						</div>
					</li>
					<li class="charter-list__item">
						<span class="charter-list__num">02</span>
						<div>
							<strong>Zero Overpriced Guru Courses</strong>
							<p>
								We keep our rooms, alerts, and store items accessible so your money stays in your
								trading account.
							</p>
						</div>
					</li>
					<li class="charter-list__item">
						<span class="charter-list__num">03</span>
						<div>
							<strong>Exact Entries, Exits &amp; Stops Ahead of Time</strong>
							<p>
								No hindsight cherry-picking. Every live call and video watchlist defines risk before
								price moves.
							</p>
						</div>
					</li>
					<li class="charter-list__item">
						<span class="charter-list__num">04</span>
						<div>
							<strong>Built for $500+ Small Accounts &amp; Working Pros</strong>
							<p>
								Dedicated rooms and video alerts so busy 9-to-5 professionals and $500 starter
								accounts thrive.
							</p>
						</div>
					</li>
					<li class="charter-list__item">
						<span class="charter-list__num">05</span>
						<div>
							<strong>1-on-1 Mentorship by Approval Only</strong>
							<p>
								You cannot buy your way into 1-on-1 coaching. We vet and approve every candidate by
								hand.
							</p>
						</div>
					</li>
				</ol>

				<div class="charter-box__footer">
					<a href={resolve('/about' as '/')} class="text-link">
						Inspect Our Founder’s Goldman Sachs Pedigree &amp; Track Record
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</a>
				</div>
			</aside>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 3: WHY THE RETAIL TRADING INDUSTRY IS BROKEN (AND HOW WE FIX IT)
       ========================================================================= -->
	<section class="section is-light crisis-section" aria-labelledby="crisis-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Exposing the Industry Lie • Hard Evidence</span>
				<h2 id="crisis-h2" class="section-h2">
					Why 95% of Trading Education Services Want You to Stay Dependent—And Why We Refuse
				</h2>
				<p class="body-copy section-intro__desc">
					To understand our mission, you have to confront the ugly truth about how most online
					trading educators in the United States and Canada actually make their money.
				</p>
			</div>

			<div class="crisis-grid">
				<article class="crisis-card">
					<div class="crisis-card__header">
						<span class="meta-tag">Industry Trap #1</span>
						<span class="crisis-card__status">Exposed</span>
					</div>
					<h3 class="crisis-card__title">The $2,500 "Holy Grail" Indicator Scam</h3>
					<p class="crisis-card__body">
						Marketers code lagging oscillators that rewrite their signals <em>after</em> the candle closes,
						slap a "94% Accuracy" label on a sales page, and charge desperate traders thousands of dollars.
						When you load that indicator in a live market, it whipsaws your account to zero.
					</p>
					<div class="crisis-card__resolution">
						<strong>Our Solution:</strong> Every indicator (<a
							href={resolve('/store/indicators' as '/')}
							>Store <CaretRightIcon
								size={12}
								weight="bold"
								class="ic-inline-sm"
								aria-hidden="true"
							/> Indicators</a
						>) and scanner (<a href={resolve('/store/scanners' as '/')}
							>Store <CaretRightIcon
								size={12}
								weight="bold"
								class="ic-inline-sm"
								aria-hidden="true"
							/> Scanners</a
						>) we engineer is <strong>100% non-repainting</strong>—built to expose real
						institutional order flow, abandoned price bars, and liquidity sweeps at a fair price.
					</div>
				</article>

				<article class="crisis-card">
					<div class="crisis-card__header">
						<span class="meta-tag">Industry Trap #2</span>
						<span class="crisis-card__status">Exposed</span>
					</div>
					<h3 class="crisis-card__title">Vague Alerts With No Stops or Risk Parameters</h3>
					<p class="crisis-card__body">
						Most alert rooms shout out 20 tickers at the open with zero entry triggers and zero
						stop-loss levels. If 18 fail and 2 go up, the guru brags about the 2 winners all week
						while members silently bleed out on the 18 losers.
					</p>
					<div class="crisis-card__resolution">
						<strong>Our Solution:</strong> In our live rooms and our affordable alert-only tiers (<a
							href={resolve('/alert-services/explosive-swings' as '/')}>Explosive Swings</a
						>
						&amp;
						<a href={resolve('/alert-services/spx-profit-pulse' as '/')}>SPX Profit Pulse</a>), we
						deliver detailed video watchlists with
						<strong>exact targeted entries, profit exits, and hard invalidation stops</strong> ahead of
						time.
					</div>
				</article>

				<article class="crisis-card">
					<div class="crisis-card__header">
						<span class="meta-tag">Industry Trap #3</span>
						<span class="crisis-card__status">Exposed</span>
					</div>
					<h3 class="crisis-card__title">Pricing Out $500 Accounts &amp; Working Families</h3>
					<p class="crisis-card__body">
						Traditional trading rooms cater exclusively to wealthy day traders who can sit at six
						monitors all day and absorb $2,000 drawdowns—leaving working parents and $500 starter
						accounts to blow up trying to copy oversized trades.
					</p>
					<div class="crisis-card__resolution">
						<strong>Our Solution:</strong> We built the
						<a href={resolve('/live-trading-rooms/small-accounts-room' as '/')}
							>Small Accounts Room</a
						>
						specifically for accounts starting as low as <strong>$500</strong>, and the
						<a href={resolve('/live-trading-rooms/swing-trading-room' as '/')}>Swing Trading Room</a
						> for working professionals who need multi-day precision.
					</div>
				</article>
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 4: THE "EDUCATE • INNOVATE • PROSPER" 3-PILLAR ARCHITECTURE
       ========================================================================= -->
	<section class="section pillars-section" aria-labelledby="pillars-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Our Core Slogan in Action</span>
				<h2 id="pillars-h2" class="section-h2">
					Educate. Innovate. Prosper. How Our Three Pillars Transform Traders
				</h2>
				<p class="body-copy section-intro__desc">
					"Educate, Innovate, and Prosper" isn't a marketing catchphrase—it is the exact three-stage
					engineering blueprint behind every room, alert service, and tool at Revolution Trading
					Pros.
				</p>
			</div>

			<div class="pillars-grid">
				{#each missionPillars as pillar (pillar.verb)}
					<article class="pillar-card">
						<div class="pillar-card__top">
							<div class="pillar-card__title-group">
								<span class="meta-tag">{pillar.step} // {pillar.tagline}</span>
								<h3 class="pillar-card__verb">{pillar.verb}.</h3>
							</div>
						</div>

						<h4 class="pillar-card__headline">{pillar.headline}</h4>
						<p class="pillar-card__desc">{pillar.description}</p>

						<div class="pillar-card__proof">
							<strong>The Member Outcome:</strong>
							{pillar.proofPoint}
						</div>

						<div class="pillar-card__links">
							<span class="meta-tag">Direct Ecosystem Pathways:</span>
							<ul class="pillar-link-list">
								{#each pillar.routes as route (route.href)}
									<li>
										<a href={resolve(route.href as '/')} class="text-link"
											>{route.label}
											<ArrowRightIcon size={16} weight="bold" aria-hidden="true" /></a
										>
									</li>
								{/each}
							</ul>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 5: OUR 6 IRONCLAD COMMITMENTS TO EVERY MEMBER (2x3 BENTO GRID)
       ========================================================================= -->
	<section class="section is-light commitments-section" aria-labelledby="commitments-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Accountability Written in Stone</span>
				<h2 id="commitments-h2" class="section-h2">
					Six Ironclad Promises We Make to Every Trader Who Walks Through Our Doors
				</h2>
				<p class="body-copy section-intro__desc">
					When you join Revolution Trading Pros, you are not buying a subscription—you are entering
					an institution governed by six unbreakable commitments to your success.
				</p>
			</div>

			<div class="commitments-grid">
				{#each memberCommitments as item (item.number)}
					<article class="commitment-card">
						<div class="commitment-card__header">
							<span class="commitment-card__num">Commitment #{item.number}</span>
							<span class="meta-tag">{item.badge}</span>
						</div>

						<h3 class="commitment-card__title">{item.title}</h3>

						<dl class="commitment-card__body">
							<div>
								<dt>What Broken Services Do:</dt>
								<dd>{item.problemSolved}</dd>
							</div>
							<div>
								<dt>Our Ironclad Commitment to You:</dt>
								<dd>{item.ourPledge}</dd>
							</div>
						</dl>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 6: WHO OUR MISSION PROTECTS (4-PERSONA ROUTING MATRIX)
       ========================================================================= -->
	<section class="section protection-section" aria-labelledby="protection-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Find Your Exact Starting Point</span>
				<h2 id="protection-h2" class="section-h2">
					Built Around Your Real Life, Your Schedule, and Your Starting Capital
				</h2>
				<p class="body-copy section-intro__desc">
					Because we focus on people rather than maximizing fees, we structured our ecosystem so
					every trader—from a $500 beginner or a busy working parent to a full-time options
					scalper—has a dedicated home.
				</p>
			</div>

			<div class="protection-grid">
				{#each protectedGroups as group (group.title)}
					<article class="protection-card">
						<div>
							<span class="meta-tag">{group.tag}</span>
							<h3 class="protection-card__title">{group.title}</h3>

							<div class="protection-card__block">
								<strong>The Struggle You Know Too Well:</strong>
								<p>{group.painPoint}</p>
							</div>

							<div class="protection-card__block protection-card__block--highlight">
								<strong>How Our Mission Covers You:</strong>
								<p>{group.solution}</p>
							</div>
						</div>

						<div class="protection-card__actions">
							<a href={resolve(group.primaryLinkHref as '/')} class="btn btn-primary btn--full">
								{group.primaryLinkLabel}
								<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
							</a>
							<a href={resolve(group.secondaryLinkHref as '/')} class="btn btn-outline btn--full">
								{group.secondaryLinkLabel}
								<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
							</a>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 7: MISSION & ETHICAL STANDARDS FAQ ACCORDION
       ========================================================================= -->
	<section id="faq" class="section faq-section" aria-labelledby="mission-faq-h2">
		<div class="container faq-container">
			<div class="section-heading">
				<span class="eyebrow">Straight Answers • Zero Marketing Spin</span>
				<h2 id="mission-faq-h2" class="section-h2">
					Frequently Asked Questions About Our Mission &amp; Trading Standards
				</h2>
			</div>

			<div class="faq-list">
				{#each MISSION_FAQ_ITEMS as item, index (item.id)}
					<details class="faq-item" open={index === 0}>
						<summary class="faq-item__question">
							<span>{item.question}</span>
							<span class="faq-item__icon" aria-hidden="true">+</span>
						</summary>
						<p class="faq-item__answer">{item.answer}</p>
					</details>
				{/each}
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 8: FINAL MOVEMENT BANNER
       ========================================================================= -->
	<section class="section final-cta" aria-labelledby="final-cta-h2">
		<div class="container final-cta__inner">
			<span class="eyebrow">Educate • Innovate • Prosper</span>
			<h2 id="final-cta-h2" class="final-cta__h2">
				We Are the Present and the Future. We Are the Revolution!
			</h2>
			<p class="body-copy final-cta__copy">
				You no longer have to guess which indicator works, which guru is lying, or whether your
				schedule and account size can succeed. Step into a transparent trading family built for your
				victory.
			</p>
			<div class="cta-group cta-group--centered">
				<a href={resolve('/live-trading-rooms/day-trading-room' as '/')} class="btn btn-dark">
					Join Our Live Trading Rooms
					<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
				</a>
				<a href={resolve('/alert-services/explosive-swings' as '/')} class="btn btn-outline-dark">
					Get Video Watchlist &amp; Alerts
				</a>
				<a href={resolve('/mentorship' as '/')} class="btn btn-outline-dark">
					Apply for 1-on-1 Mentorship
				</a>
			</div>
		</div>
	</section>
</main>

<Footer />
