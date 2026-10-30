<!-- src/routes/about/+page.svelte -->
<script lang="ts">
	import '#lib/styles/inner-page.css';
	import { resolve } from '$app/paths';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import CheckCircleIcon from 'phosphor-svelte/lib/CheckCircleIcon';
	import XCircleIcon from 'phosphor-svelte/lib/XCircleIcon';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import { ABOUT_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	interface HistoricalCall {
		id: string;
		cycle: string;
		metric: string;
		title: string;
		thesis: string;
		outcome: string;
		mechanics: string;
	}

	interface EcosystemPillar {
		category: string;
		badge: string;
		items: {
			name: string;
			href: string;
			audience: string;
			summary: string;
		}[];
	}

	const historicalCalls: HistoricalCall[] = [
		{
			id: 'goldman-lineage',
			cycle: 'Pillar 01 // Wall Street Institutional Lineage',
			metric: 'Goldman Sachs Prop Mentorship',
			title: 'Mentored Directly by Former Goldman Sachs Legend Mark "Goldfinger" McGoldrick',
			thesis:
				'Retail trading education fails because it is taught by marketers who have never sat near an institutional desk or managed real order flow.',
			outcome:
				'Trained directly under Mark "Goldfinger" McGoldrick—one of the highest-earning proprietary traders in Goldman Sachs history—who explicitly called our founder "the future of trading."',
			mechanics:
				'Institutional Order Flow • Smart-Money Liquidity Traps • Asymmetric Risk Structuring'
		},
		{
			id: 'oxy-buffett-trade',
			cycle: 'Pillar 02 // Live Single-Stock Options Execution',
			metric: '+600% Overnight on OXY Puts',
			title: 'Embarrassed Warren Buffett Live on Occidental Petroleum (OXY) With Put Options',
			thesis:
				'When mainstream financial media celebrated Warren Buffett buying millions of dollars of OXY stock on the long side, retail traders blindly chased the headline at the top of the liquidity sweep.',
			outcome:
				'Reading institutional distribution and buyer exhaustion in real time, we stepped in on the opposite side live with defined-risk OXY Put Options and locked in a 600% overnight gain.',
			mechanics:
				'Liquidity Sweep Recognition • Institutional Distribution Tape • Defined-Risk Put Options'
		},
		{
			id: 'covid-2020-call',
			cycle: 'Pillar 03 // 2020 Macro Inflection Timing',
			metric: '2020 Top & Bottom Called Live',
			title: 'Called the Exact 2020 COVID Crash Top and Generational Market Bottom',
			thesis:
				'Before the February–March 2020 liquidation cascaded across global indexes, retail gurus told traders to buy every dip on the way down—and then panicked into cash at the March bottom.',
			outcome:
				'We warned traders of the structural breakdown at the 2020 top before the crash accelerated, and then pivoted at the exact March 2020 capitulation low to capture the generational recovery.',
			mechanics:
				'Volatility Regime Expansion • Capitulation Volume Exhaustion • Macro Cycle Inflection'
		},
		{
			id: 'bear-2022-call',
			cycle: 'Pillar 04 // 2022 Macro Inflection Timing',
			metric: '2022 Top & Bottom Called Live',
			title: 'Repeated the Feat: Called the 2022 Bull Market Top and Bear Market Bottom',
			thesis:
				'Calling one macro cycle could be dismissed by skeptics as luck. Repeating it in the very next cycle proves a repeatable, institutional methodology.',
			outcome:
				'Called the macro distribution top at the start of 2022 before growth and index equities plunged, and identified the October 2022 institutional accumulation bottom while Wall Street pundits predicted another crash.',
			mechanics:
				'Multi-Cycle Repeatability • Institutional Accumulation Zones • Breadth & Liquidity Divergence'
		}
	];

	const ecosystemDirectory: EcosystemPillar[] = [
		{
			category: 'Live Trading Rooms',
			badge: 'Real-Time Execution',
			items: [
				{
					name: 'Day Trading Room',
					href: '/live-trading-rooms/day-trading-room',
					audience: 'Day Traders, Options Scalpers & Pros',
					summary:
						'Live daily pre-market prep, real-time voice commentary, screen sharing, and intraday stock, ETF, and options execution.'
				},
				{
					name: 'Swing Trading Room',
					href: '/live-trading-rooms/swing-trading-room',
					audience: 'Working Professionals & Multi-Day Traders',
					summary:
						'High-probability multi-day stock and options swing setups structured so 9-to-5 professionals can execute without watching screens all day.'
				},
				{
					name: 'Small Accounts Room',
					href: '/live-trading-rooms/small-accounts-room',
					audience: 'Accounts Starting as Low as $500',
					summary:
						'Strict capital preservation, cash-account rotation, and defined-risk compounding engineered specifically for $500+ accounts.'
				}
			]
		},
		{
			category: 'Alert Services & Video Watchlists',
			badge: 'Targeted Entries, Exits & Stops',
			items: [
				{
					name: 'SPX Profit Pulse',
					href: '/alert-services/spx-profit-pulse',
					audience: 'Index & SPX Options Traders',
					summary:
						'High-precision S&P 500 index options alerts delivering institutional inflection levels, exact entries, profit targets, and hard stops.'
				},
				{
					name: 'Explosive Swings',
					href: '/alert-services/explosive-swings',
					audience: 'Self-Directed & Busy Traders',
					summary:
						'Accessible alert-only membership delivering detailed video watchlists with exact targeted entries, exits, and stop-loss levels.'
				}
			]
		},
		{
			category: 'Store, Mentorship & Free Resources',
			badge: 'Tools, Curriculum & 1-on-1',
			items: [
				{
					name: '1-on-1 Mentorship (Application Only)',
					href: '/mentorship',
					audience: 'By Application & Approval Only',
					summary:
						'Private one-on-one executive trading mentorship. You cannot buy your way in—every applicant is vetted for coachability and work ethic.'
				},
				{
					name: 'Courses, Non-Repainting Indicators & Scanners',
					href: '/store/courses',
					audience: 'Complete Institutional Toolkit',
					summary:
						'Self-paced trading courses (/store/courses), 100% non-repainting custom indicators (/store/indicators), and live order-flow scanners (/store/scanners).'
				},
				{
					name: 'Free Trader Resources & Market Lists',
					href: '/resources/options-calculator',
					audience: '100% Free Public Utilities',
					summary:
						'Access our Options Calculator (/resources/options-calculator), ETF Stocks List (/resources/etf-stocks-list), and Stock Indexes List (/resources/stock-indexes-list).'
				}
			]
		}
	];
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#about-page">Skip to content</a>

<Navbar />

<main id="about-page" class="inner-page about-page">
	<!-- =========================================================================
       SECTION 1: BREADCRUMB & INSTITUTIONAL VERIFICATION STRIP
       ========================================================================= -->
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true" class="crumb-sep"><CaretRightIcon size={12} weight="bold" /></li>
				<li aria-current="page">About Revolution Trading Pros</li>
			</ol>
			<p class="breadcrumb-bar__status">
				<span>Institutional Pedigree Verified</span> •
				<span>Serving US &amp; Canadian Traders</span>
			</p>
		</div>
	</nav>

	<!-- =========================================================================
       SECTION 2: ABOVE-THE-FOLD ABOUT HERO (12-COLUMN ASYMMETRIC SPLIT)
       ========================================================================= -->
	<section class="section hero-section" aria-labelledby="about-h1">
		<div class="container hero-section__grid">
			<!-- Left 7 Columns: Search-Intent H1 + Core Origin Narrative -->
			<div class="hero-section__content">
				<div class="eyebrow-box">
					<span class="eyebrow-box__badge">People Over Profits</span>
					<span class="eyebrow-box__text">The True Story Behind Revolution Trading Pros</span>
				</div>

				<h1 id="about-h1" class="hero-h1">
					<span class="hero-h1__kicker seo-kicker">
						About Revolution Trading Pros • Institutional Stock &amp; Options Trading Lineage
					</span>
					<span class="hero-h1__display">
						I Stood on the Losing Side First. Now I’m the Only Trader Feared by Wall Street—Fighting
						for You.
					</span>
				</h1>

				<p class="lead-paragraph">
					When you log into our website, my #1 goal is that you immediately know you finally found
					what you have been searching for—not based on hype, rented lifestyles, or lies, but on
					<strong>undeniable truth and hard market evidence</strong>.
				</p>

				<p class="body-paragraph">
					Most trading education companies exist for one reason: to extract money from hopeful
					traders by selling overpriced courses and fake, repainted "holy grail" indicators that
					fail the moment real volatility hits.
					<strong>
						I hate what this industry does to everyday people because I have been on the losing end
						myself in the past.
					</strong>
					I know the frustration of watching hard-earned money disappear while internet gurus profit off
					subscription fees.
				</p>

				<p class="body-paragraph">
					Everything changed when I was mentored directly by former Wall Street Goldman Sachs
					proprietary trading legend <strong>Mark "Goldfinger" McGoldrick</strong>—who called me
					<em>"the future of trading."</em> Armed with real institutional execution, I went on to
					call the <strong>2020 COVID Top and Bottom</strong>, call the
					<strong>2022 Market Top and Bottom</strong>, and embarrass
					<strong>Warren Buffett live on OXY</strong> when he went long millions of dollars and I
					shorted with Put Options for a <strong>600% overnight gain</strong>. I built Revolution
					Trading Pros not to steal your money, but to help you achieve your dreams.
				</p>

				<blockquote class="editorial-quote">
					"Mark 'Goldfinger' McGoldrick called us the future of trading. Educate, Innovate, and
					Prosper—we are the present and the future, we are the revolution!"
				</blockquote>

				<div class="cta-row">
					<a href={resolve('/live-trading-rooms/day-trading-room' as '/')} class="btn btn-primary">
						Explore Our Live Trading Rooms
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</a>
					<a href={resolve('/mentorship' as '/')} class="btn btn-outline">
						Apply for 1-on-1 Mentorship
					</a>
				</div>
			</div>

			<!-- Right 5 Columns: Institutional Identity & Credentials Dossier -->
			<aside class="credentials-card" aria-label="Institutional Identity and Credentials Summary">
				<div class="credentials-card__header">
					<div>
						<span class="meta-label">Institutional Verification Record</span>
						<h2 class="credentials-card__title">At-a-Glance Authority</h2>
					</div>
					<span class="status-tag">100% Real Execution</span>
				</div>

				<dl class="credentials-list">
					<div class="credentials-list__row">
						<dt>Wall Street Mentorship Lineage</dt>
						<dd>
							Mentored directly by former <strong>Goldman Sachs</strong> proprietary trading legend
							<strong>Mark "Goldfinger" McGoldrick</strong>.
						</dd>
					</div>
					<div class="credentials-list__row">
						<dt>Mentor Endorsement</dt>
						<dd>
							Explicitly recognized by Mark "Goldfinger" McGoldrick as
							<strong>"the future of trading."</strong>
						</dd>
					</div>
					<div class="credentials-list__row">
						<dt>Macro Cycle Track Record</dt>
						<dd>
							Called both the <strong>2020 COVID Crash Top &amp; Bottom</strong> and the
							<strong>2022 Bull Market Top &amp; Bear Bottom</strong> live.
						</dd>
					</div>
					<div class="credentials-list__row">
						<dt>Single-Stock Options Proof</dt>
						<dd>
							Shorted <strong
								>Occidental Petroleum (OXY) on Put Options live for +600% overnight</strong
							>
							while Warren Buffett bought millions long.
						</dd>
					</div>
					<div class="credentials-list__row">
						<dt>Traders We Serve</dt>
						<dd>
							Working Professionals (9-to-5), Day Traders/Scalpers, Small Accounts starting as low
							as <strong>$500</strong>, and Video Watchlist Alert members.
						</dd>
					</div>
					<div class="credentials-list__row">
						<dt>Core Ethical Mandate</dt>
						<dd>
							<strong>People Over Making Money.</strong> Affordable access, zero fake holy grail indicators,
							and application-only 1-on-1 mentorship.
						</dd>
					</div>
				</dl>

				<div class="credentials-card__footer">
					<a href={resolve('/our-mission' as '/')} class="text-link">
						Read Our Full Anti-Guru Mission Statement
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</a>
				</div>
			</aside>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 3: THE ORIGIN STORY & GOLDMAN SACHS MENTORSHIP LINEAGE
       ========================================================================= -->
	<section class="section is-light origin-section" aria-labelledby="origin-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">
					The Turning Point • From Retail Scars to Institutional Mastery
				</span>
				<h2 id="origin-h2" class="section-h2">
					Why Having Stood on the Losing Side Makes Us Different From Every "Guru" Online
				</h2>
			</div>

			<div class="origin-grid">
				<!-- Left 7 Columns: Deep Narrative -->
				<div class="origin-narrative">
					<h3 class="subsection-h3">1. The Pain of the Retail Trap: Why I Refuse to Sell Hype</h3>
					<p class="body-paragraph">
						Nobody starts trading expecting to be lied to. Early in my journey, I experienced the
						exact pain that millions of retail traders in the US and Canada go through every single
						day. I saw how the retail trading industry operates behind the curtain: flashy marketers
						selling overpriced courses filled with basic textbook theory and peddling repainted
						"magic arrow" indicators that look perfect in hindsight screenshots—but bleed your
						account dry in live market chop.
					</p>
					<p class="body-paragraph">
						Standing on the losing end taught me a lesson I never forgot:
						<strong>
							retail traders don’t fail because they lack work ethic; they fail because they are fed
							retail garbage designed to make educators rich while keeping traders trapped as exit
							liquidity for Wall Street.
						</strong>
					</p>

					<h3 class="subsection-h3 origin-narrative__spaced">
						2. The Goldman Sachs Mentorship: Learning From Mark "Goldfinger" McGoldrick
					</h3>
					<p class="body-paragraph">
						The breakthrough that changed my life forever didn't come from a retail chatroom—it came
						from the highest level of institutional proprietary trading. I was mentored directly by
						former Wall Street Goldman Sachs legend <strong>Mark "Goldfinger" McGoldrick</strong>,
						widely known on Wall Street as one of the most profitable proprietary traders in Goldman
						Sachs history before founding Mount Kellett Capital.
					</p>
					<p class="body-paragraph">
						Mark didn't teach lagging retail oscillators or meme-stock gambling. He taught me how
						institutional balance sheets actually move price: how smart money accumulates at
						capitulation bottoms, how institutions engineer liquidity sweeps at market tops to trap
						retail buyers, and how to structure asymmetric risk using options. Watching how I
						synthesized his institutional playbook with modern technical execution, Mark
						"Goldfinger" McGoldrick called me <strong>"the future of trading."</strong>
					</p>

					<h3 class="subsection-h3 origin-narrative__spaced">
						3. Bringing Wall Street’s Playbook to Main Street
					</h3>
					<p class="body-paragraph">
						Wall Street hates when everyday traders learn how the game is actually rigged. Instead
						of locking that institutional edge behind a hedge fund door—or charging extortionate
						fees like fake internet gurus—I founded <strong>Revolution Trading Pros</strong> to put
						that exact weapon into the hands of working professionals, full-time day traders, and
						small-account traders starting with as little as <strong>$500</strong>.
					</p>
				</div>

				<!-- Right 5 Columns: Side-by-Side Pedigree Comparison -->
				<div class="pedigree-comparison">
					<div class="comparison-block comparison-block--negative">
						<span class="meta-label">What We Reject</span>
						<h3 class="comparison-block__title">The Predatory "Fake Guru" Model</h3>
						<ul class="comparison-list">
							<li>
								<strong
									><XCircleIcon
										size={18}
										weight="fill"
										class="ic-mark ic-mark--no"
										aria-hidden="true"
									/> Overpriced "Holy Grail" Indicators:</strong
								> Selling lagging, repainted scripts for exorbitant fees that fail in live volatility.
							</li>
							<li>
								<strong
									><XCircleIcon
										size={18}
										weight="fill"
										class="ic-mark ic-mark--no"
										aria-hidden="true"
									/> Zero Institutional Pedigree:</strong
								> Self-proclaimed "experts" who have never been trained by an institutional prop trader
								or called a major macro turn.
							</li>
							<li>
								<strong
									><XCircleIcon
										size={18}
										weight="fill"
										class="ic-mark ic-mark--no"
										aria-hidden="true"
									/> Profiting Off Losses:</strong
								> Making millions from subscription churn while members blow up their brokerage accounts.
							</li>
							<li>
								<strong
									><XCircleIcon
										size={18}
										weight="fill"
										class="ic-mark ic-mark--no"
										aria-hidden="true"
									/> Ignoring Small Accounts &amp; Working Pros:</strong
								> Teaching reckless sizing that destroys $500 accounts and impossible schedules for 9-to-5
								workers.
							</li>
						</ul>
					</div>

					<div class="comparison-block comparison-block--positive">
						<span class="meta-label">What We Built</span>
						<h3 class="comparison-block__title">The Revolution Trading Pros Standard</h3>
						<ul class="comparison-list">
							<li>
								<strong
									><CheckCircleIcon
										size={18}
										weight="fill"
										class="ic-mark ic-mark--yes"
										aria-hidden="true"
									/> Goldman Sachs Mentored Edge:</strong
								> Direct lineage from Mark "Goldfinger" McGoldrick—built on real institutional order flow
								and liquidity mechanics.
							</li>
							<li>
								<strong
									><CheckCircleIcon
										size={18}
										weight="fill"
										class="ic-mark ic-mark--yes"
										aria-hidden="true"
									/> People Over Making Money:</strong
								> Kept intentionally affordable so your capital stays in your trading account where it
								belongs.
							</li>
							<li>
								<strong
									><CheckCircleIcon
										size={18}
										weight="fill"
										class="ic-mark ic-mark--yes"
										aria-hidden="true"
									/> Exact Entries, Exits &amp; Stops Ahead of Time:</strong
								> Every live trade and video watchlist maps out clear trigger levels, targets, and hard
								stops before price moves.
							</li>
							<li>
								<strong
									><CheckCircleIcon
										size={18}
										weight="fill"
										class="ic-mark ic-mark--yes"
										aria-hidden="true"
									/> Application-Only 1-on-1 Mentorship:</strong
								> You cannot simply buy 1-on-1 coaching; we approve only committed, coachable traders.
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 4: VERIFIED HISTORICAL MARKET CALLS (2x2 HARD EVIDENCE LEDGER)
       ========================================================================= -->
	<section id="verified-calls" class="section calls-section" aria-labelledby="calls-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Hard Evidence • Recorded Live in Front of Traders</span>
				<h2 id="calls-h2" class="section-h2">
					Why We Are the Only Retail Desk Feared by Wall Street
				</h2>
				<p class="body-paragraph section-header__sub">
					Anyone can post a winning screenshot in a bull market. True institutional mastery is
					proven at generational macro turning points and when going head-to-head against Wall
					Street’s biggest billionaires in real time.
				</p>
			</div>

			<div class="calls-grid">
				{#each historicalCalls as call (call.id)}
					<article class="call-card">
						<div class="call-card__top">
							<span class="meta-label">{call.cycle}</span>
							<span class="call-card__metric">{call.metric}</span>
						</div>

						<h3 class="call-card__title">{call.title}</h3>

						<dl class="call-card__details">
							<div>
								<dt>The Market Setup &amp; Retail Trap:</dt>
								<dd>{call.thesis}</dd>
							</div>
							<div>
								<dt>Our Real-Time Institutional Execution:</dt>
								<dd>{call.outcome}</dd>
							</div>
						</dl>

						<div class="call-card__footer">
							<span class="meta-label">Core Mechanics: {call.mechanics}</span>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 5: BUILT FOR EVERY TRADER PROFILE ($500+ ACCOUNTS TO WORKING PROS)
       ========================================================================= -->
	<section class="section avatars-section" aria-labelledby="avatars-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">No Trader Left Behind • Built Around Your Real Life</span>
				<h2 id="avatars-h2" class="section-h2">
					How We Serve Working Professionals, Day Traders, and Small Accounts Starting at $500
				</h2>
				<p class="body-paragraph section-header__sub">
					Because our mission is helping people achieve their dreams rather than chasing high-ticket
					fees, we engineered our rooms and alert services so every trader has a clear, realistic
					path forward—regardless of schedule or starting capital.
				</p>
			</div>

			<div class="avatars-grid">
				<article class="avatar-card">
					<span class="meta-label">01 // Busy 9-to-5 Careers</span>
					<h3 class="avatar-card__title">Working Professionals</h3>
					<p class="avatar-card__copy">
						You don’t need to quit your job or stare at 1-minute charts for six hours a day to trade
						like an institution. Through our <strong>Swing Trading Room</strong> and our
						<strong>Explosive Swings</strong> video watchlists, you receive complete trade plans with
						exact targeted entries, profit exits, and hard stop-losses you can set and manage around your
						workday.
					</p>
					<a href={resolve('/live-trading-rooms/swing-trading-room' as '/')} class="text-link">
						Explore the Swing Trading Room
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</a>
				</article>

				<article class="avatar-card">
					<span class="meta-label">02 // Starting Capital as Low as $500</span>
					<h3 class="avatar-card__title">$500+ Small Account Traders</h3>
					<p class="avatar-card__copy">
						Most trading services alienate small accounts by calling out oversized contracts that
						require high-margin accounts. Our dedicated <strong>Small Accounts Room</strong> teaches
						traders starting with as little as <strong>$500</strong> how to select affordable, liquid
						setups, navigate cash-account T+1 settlement rules, and enforce ironclad risk management so
						you compound safely.
					</p>
					<a href={resolve('/live-trading-rooms/small-accounts-room' as '/')} class="text-link">
						Explore the Small Accounts Room
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</a>
				</article>

				<article class="avatar-card">
					<span class="meta-label">03 // Intraday Velocity &amp; Scalping</span>
					<h3 class="avatar-card__title">Day Traders, Scalpers &amp; Pros</h3>
					<p class="avatar-card__copy">
						Trade the opening bell, intraday momentum shifts, and institutional options flow live
						with us every morning in the <strong>Day Trading Room</strong>—or capture rapid index
						moves with <strong>SPX Profit Pulse</strong>. Watch and hear our exact execution on
						entries, scaling out, and trailing stops in real time.
					</p>
					<a href={resolve('/live-trading-rooms/day-trading-room' as '/')} class="text-link">
						Explore the Day Trading Room
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</a>
				</article>

				<article class="avatar-card">
					<span class="meta-label">04 // Affordable Alert-Only Access</span>
					<h3 class="avatar-card__title">Video Watchlist &amp; Alert Members</h3>
					<p class="avatar-card__copy">
						Want our institutional chart preparation without sitting in a live room? Our affordable
						alert-only tiers (<strong>Explosive Swings</strong> and
						<strong>SPX Profit Pulse</strong>) send you detailed video watchlists breaking down the
						exact thesis, entry triggers, profit targets, and invalidation stops before the move
						happens.
					</p>
					<a href={resolve('/alert-services/explosive-swings' as '/')} class="text-link">
						Explore Video Watchlist Alerts
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</a>
				</article>
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 6: COMPLETE ECOSYSTEM DIRECTORY (INTERNAL SEO SILO ROUTING)
       ========================================================================= -->
	<section class="section ecosystem-section" aria-labelledby="ecosystem-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Educate • Innovate • Prosper</span>
				<h2 id="ecosystem-h2" class="section-h2">
					Explore the Complete Revolution Trading Pros Ecosystem
				</h2>
				<p class="body-paragraph section-header__sub">
					Every room, alert service, custom indicator, course, scanner, and free resource under one
					roof—built to take you from uncertain retail trader to disciplined institutional
					execution.
				</p>
			</div>

			<div class="ecosystem-columns">
				{#each ecosystemDirectory as group (group.category)}
					<div class="ecosystem-column">
						<div class="ecosystem-column__header">
							<span class="meta-label">{group.badge}</span>
							<p class="ecosystem-column__title">{group.category}</p>
						</div>

						<div class="ecosystem-column__list">
							{#each group.items as item (item.href)}
								<article class="ecosystem-item">
									<span class="meta-label">{item.audience}</span>
									<h3 class="ecosystem-item__name">
										<a href={resolve(item.href as '/')}>{item.name}</a>
									</h3>
									<p class="ecosystem-item__summary">{item.summary}</p>
									<a href={resolve(item.href as '/')} class="text-link"
										>View Details <ArrowRightIcon size={16} weight="bold" aria-hidden="true" /></a
									>
								</article>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 7: ABOUT PAGE E-E-A-T FAQ ACCORDION
       ========================================================================= -->
	<section class="section faq-section" aria-labelledby="about-faq-h2">
		<div class="container faq-container">
			<div class="section-heading">
				<span class="eyebrow">Direct Transparency • Zero Evasion</span>
				<h2 id="about-faq-h2" class="section-h2">
					Frequently Asked Questions About Our Founder, Track Record &amp; Ethics
				</h2>
			</div>

			<div class="faq-list">
				{#each ABOUT_FAQ_ITEMS as item, index (item.id)}
					<details class="faq-item" open={index === 0}>
						<summary class="faq-item__question">
							<h3 class="faq-item__heading">{item.question}</h3>
							<span class="faq-item__icon" aria-hidden="true">+</span>
						</summary>
						<p class="faq-item__answer">{item.answer}</p>
					</details>
				{/each}
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 8: FINAL MOVEMENT CTA BANNER
       ========================================================================= -->
	<section class="section final-banner" aria-labelledby="final-banner-h2">
		<div class="container final-banner__inner">
			<span class="eyebrow">Educate • Innovate • Prosper</span>
			<h2 id="final-banner-h2" class="final-banner__h2">
				Wall Street Protects Its Own. Mark "Goldfinger" McGoldrick Called Us the Future of Trading.
				We Are the Revolution!
			</h2>
			<p class="body-paragraph final-banner__copy">
				Stop handing your money to fake gurus selling repainted holy grail indicators. Join a
				transparent trading institution built by someone who has walked in your shoes, conquered
				Wall Street, and puts your success first.
			</p>
			<div class="cta-row cta-row--centered">
				<a href={resolve('/live-trading-rooms/day-trading-room' as '/')} class="btn btn-dark">
					Join Our Live Trading Rooms
					<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
				</a>
				<a href={resolve('/alert-services/explosive-swings' as '/')} class="btn btn-outline-dark">
					Explore Video Watchlist Alerts
				</a>
				<a href={resolve('/mentorship' as '/')} class="btn btn-outline-dark">
					Apply for 1-on-1 Mentorship
				</a>
			</div>
		</div>
	</section>
</main>

<Footer />
