<!-- src/routes/mentorship/+page.svelte -->
<script lang="ts">
	import '#lib/styles/inner-page.css';
	import { resolve } from '$app/paths';
	import ArrowDownIcon from 'phosphor-svelte/lib/ArrowDownIcon';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import CheckCircleIcon from 'phosphor-svelte/lib/CheckCircleIcon';
	import XCircleIcon from 'phosphor-svelte/lib/XCircleIcon';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import { MENTORSHIP_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type CandidateTrackId = 'portfolio-manager' | 'professional-trader' | 'struggling-trader';

	interface MentorshipTrack {
		id: CandidateTrackId;
		trackCode: string;
		badge: string;
		title: string;
		subtitle: string;
		coreProblem: string;
		institutionalSolution: string;
		deliverables: string[];
		ctaText: string;
	}

	interface ProtocolPhase {
		phase: string;
		durationTag: string;
		title: string;
		summary: string;
		outcomes: string[];
	}

	const mentorshipTracks: MentorshipTrack[] = [
		{
			id: 'portfolio-manager',
			trackCode: 'Track 01 // Institutional & Capital Allocators',
			badge: 'Portfolio Managers & Family Offices',
			title: 'Portfolio Managers & Desk Leads',
			subtitle: 'Macro Regime Timing, Asymmetric Options Overlays & Drawdown Protection',
			coreProblem:
				'Conventional buy-and-hold models and lagging street research leave portfolios exposed at major macro inflection points—suffering severe drawdowns during liquidity cascades like 2020 and 2022 while missing asymmetric contrarian opportunities.',
			institutionalSolution:
				'We install the exact proprietary macro cycle and order-flow framework passed down by former Goldman Sachs legend Mark "Goldfinger" McGoldrick—the same methodology that called the 2020 COVID top and bottom, the 2022 bull top and bear bottom, and our 600% overnight OXY Put Options trade against Warren Buffett’s long position.',
			deliverables: [
				'Macro Regime & Liquidity Inflection Framework: Identify institutional distribution tops and capitulation bottoms before consensus research reacts.',
				'Asymmetric Options Hedging & Alpha Overlays: Structure defined-risk put spreads, collars, and volatility skew trades to monetize downside cascades.',
				'Execution & Liquidity Sweep Telemetry: Enter and exit large equity, ETF, and index options positions using institutional absorption zones.',
				'Direct 1-on-1 Desk Consultation: Private weekly strategy reviews tailored to your mandate, risk tolerance, and capital allocation rules.'
			],
			ctaText: 'Apply Under the Portfolio Manager Track'
		},
		{
			id: 'professional-trader',
			trackCode: 'Track 02 // Full-Time & Prop Execution',
			badge: 'Professional & Active Traders',
			title: 'Professional Traders',
			subtitle: 'Breaking PnL Plateaus, Scaling Size & Mastering Institutional Order Flow',
			coreProblem:
				'You already know how to read charts and generate winning weeks, but you hit an invisible ceiling when scaling contract or share size—giving back weeks of gains on low-quality chop days or hesitating on A+ institutional setups.',
			institutionalSolution:
				'We perform a forensic audit of your trade ledger, strip out low-expectancy setups, and upgrade your execution with zero-repaint institutional telemetry, options volatility structuring, and Goldman Sachs prop-desk sizing mathematics.',
			deliverables: [
				'Forensic Trade Ledger & Expectancy Audit: Pinpoint the exact time-of-day, instrument, and behavioral leaks capping your equity curve.',
				'Institutional Order Flow & Trap Recognition: Spot where retail breakout traders are trapped and execute alongside smart-money liquidity sweeps.',
				'Conviction Sizing & Scaling Architecture: Mathematical rules for pressing A+ setups with size while keeping B-grade chop exposure near zero.',
				'Live Market Co-Execution Drills: Real-time 1-on-1 feedback on entries, tiered profit scaling, and dynamic stop management.'
			],
			ctaText: 'Apply Under the Professional Trader Track'
		},
		{
			id: 'struggling-trader',
			trackCode: 'Track 03 // Complete Retail Turnaround',
			badge: 'Struggling Traders Seeking Rescue',
			title: 'Struggling Traders',
			subtitle: 'Stop the Bleeding, Unlearn Fake Guru Lies & Rebuild With Mechanical Discipline',
			coreProblem:
				'You have bought overpriced courses and fake "holy grail" repainted indicators, jumped from strategy to strategy, and watched your hard-earned account bleed out through FOMO, hesitation, and undefined risk.',
			institutionalSolution:
				'Because our founder stood on the losing end in the past before being mentored by Mark "Goldfinger" McGoldrick, we know exactly how to pull you out of the retail trap. We strip away every fake indicator, rebuild your foundation from zero, and give you a mechanical checklist with exact entries, exits, and hard stops.',
			deliverables: [
				'Total Retail Detox & Account Stabilization: Immediately halt account bleed by eliminating repainted indicators and impulse trades.',
				'Mechanical Pre-Trade Checklist Installation: Never enter a stock or option trade without a predefined trigger price, profit target, and hard stop-loss.',
				'Right-Sized Capital Compounding ($500+ to Six Figures): Position-sizing rules built for your exact current account balance and 9-to-5 schedule.',
				'1-on-1 Psychological & Execution Accountability: Direct mentorship to eradicate revenge trading, fear of pulling the trigger, and early profit-taking.'
			],
			ctaText: 'Apply Under the Struggling Trader Track'
		}
	];

	const protocolPhases: ProtocolPhase[] = [
		{
			phase: 'Phase 01',
			durationTag: 'Diagnostic & Detox',
			title: 'Forensic Execution Autopsy & Eliminating the Bleed',
			summary:
				'Before adding a single new setup, we audit your historical trades, portfolio structure, and chart layout. We ruthlessly strip out lagging retail oscillators, repainted "holy grail" scripts, and destructive sizing habits.',
			outcomes: [
				'Complete diagnostic breakdown of your past 90 days of execution or portfolio allocation',
				'Immediate removal of low-probability setups and emotional triggers',
				'Custom risk-per-trade and daily/weekly drawdown circuit breakers'
			]
		},
		{
			phase: 'Phase 02',
			durationTag: 'Institutional Foundation',
			title: 'Installing the Goldman Sachs Prop-Desk Market Framework',
			summary:
				'You learn to read the market the way former Goldman Sachs legend Mark "Goldfinger" McGoldrick taught our founder: tracking institutional accumulation, distribution, liquidity sweeps, and abandoned price bars across stocks, ETFs, and indexes.',
			outcomes: [
				'Mastery of institutional supply/demand zones and smart-money liquidity traps',
				'Top-down macro cycle and sector rotation alignment (the 2020 & 2022 inflection playbook)',
				'Integration of our 100% non-repainting custom indicators and live scanners'
			]
		},
		{
			phase: 'Phase 03',
			durationTag: 'Precision Structuring',
			title: 'Asymmetric Options & Equity Trade Structuring (Entries, Targets & Stops)',
			summary:
				'Great market direction still loses money if you buy the wrong option contract or set stops in retail liquidity pools. We train you to structure asymmetric reward-to-risk trades with mathematical precision.',
			outcomes: [
				'Exact contract, strike, expiration, and implied volatility selection (single-leg, spreads, diagonals, hedges)',
				'Mechanical mapping of targeted entries, tiered profit-taking exits, and hard invalidation stops',
				'Case-study deconstruction of our live +600% overnight OXY Put Options execution vs. Warren Buffett'
			]
		},
		{
			phase: 'Phase 04',
			durationTag: 'Live Mastery & Scale',
			title: '1-on-1 Live Market Calibration & Independent Execution',
			summary:
				'Our goal is never to make you dependent on us forever—it is to make you a self-sufficient, fearless institutional executor. We review your live trades one-on-one until your discipline is automatic.',
			outcomes: [
				'Private 1-on-1 trade review sessions grading your adherence to your custom playbook',
				'Structured capital scaling roadmap as your win rate and profit factor stabilize',
				'Full access to our live trading rooms and video watchlists to reinforce daily preparation'
			]
		}
	];

	let selectedTrack = $state<CandidateTrackId>('professional-trader');
	let fullName = $state('');
	let email = $state('');
	let phone = $state('');
	let country = $state('United States');
	let capitalTier = $state('$25,000 – $100,000 (Active / Full-Time)');
	let primaryBottleneck = $state('');
	let coachabilityConfirmed = $state(false);
	let applicationSubmitted = $state(false);

	function selectTrackAndScroll(trackId: CandidateTrackId) {
		selectedTrack = trackId;
		document.getElementById('application-dossier')?.scrollIntoView({ behavior: 'smooth' });
	}

	function handleApplicationSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!coachabilityConfirmed) return;
		applicationSubmitted = true;
	}
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#mentorship-page">Skip to content</a>

<Navbar />

<main id="mentorship-page" class="inner-page mentorship-page">
	<!-- =========================================================================
       SECTION 1: BREADCRUMB & APPLICATION STATUS BAR
       ========================================================================= -->
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true" class="crumb-sep"><CaretRightIcon size={12} weight="bold" /></li>
				<li aria-current="page">1-on-1 Mentorship</li>
			</ol>
			<p class="breadcrumb-bar__status">
				<span>Admissions Status:</span> Strictly By Application &amp; Manual Approval Only
			</p>
		</div>
	</nav>

	<!-- =========================================================================
       SECTION 2: ABOVE-THE-FOLD HERO SECTION (12-COLUMN ASYMMETRIC SPLIT)
       ========================================================================= -->
	<section class="section hero-section" aria-labelledby="mentorship-h1">
		<div class="container hero-section__grid">
			<!-- Left 7 Columns: Search-Intent H1 + 3-Avatar Authority Hook -->
			<div class="hero-section__content">
				<div class="eyebrow-banner">
					<span class="eyebrow-banner__tag">Strictly By Application &amp; Approval Only</span>
					<span class="eyebrow-banner__text">
						Goldman Sachs Prop Lineage • People Over Making Money
					</span>
				</div>

				<h1 id="mentorship-h1" class="hero-h1">
					<span class="hero-h1__kicker seo-kicker">
						Private 1-on-1 Stock &amp; Options Trading Mentorship for Portfolio Managers, Pro
						Traders &amp; Struggling Traders
					</span>
					<span class="hero-h1__display">
						You Cannot Buy Your Way Into This Room. You Have to Be Approved.
					</span>
				</h1>

				<p class="lead-copy">
					If our goal were making quick money off subscriptions, there would be a "Buy Now" checkout
					button on this page. <strong
						>There isn’t one—because at Revolution Trading Pros, we care about people, not
						collecting fees.</strong
					>
				</p>

				<p class="body-copy">
					Whether you are a <strong>Portfolio Manager</strong> seeking macro inflection timing and
					asymmetric options hedging, a <strong>Full-Time Professional Trader</strong> fighting to
					break through a six- or seven-figure PnL plateau, or a <strong>Struggling Trader</strong>
					exhausted from losing money to fake "holy grail" indicators—I know exactly where you stand.
					<strong>I have stood on the losing end myself in the past</strong>
					before being mentored directly by former Wall Street Goldman Sachs proprietary trading legend
					<strong>Mark "Goldfinger" McGoldrick</strong>, who called me
					<em>"the future of trading."</em>
				</p>

				<p class="body-copy">
					That direct 1-on-1 mentorship transformed me into the only trader feared by Wall Street:
					calling the <strong>2020 COVID Top and Bottom</strong>, calling the
					<strong>2022 Market Top and Bottom</strong>, and embarrassing
					<strong>Warren Buffett live on Occidental Petroleum (OXY)</strong>
					by shorting with Put Options for a <strong>600% overnight gain</strong> while he went long millions
					of dollars. Now, we open a strictly limited number of private 1-on-1 seats each quarter to pass
					that exact institutional edge directly to you.
				</p>

				<blockquote class="hero-quote">
					"Mark 'Goldfinger' McGoldrick passed down the Goldman Sachs proprietary playbook through
					direct 1-on-1 mentorship. Educate, Innovate, and Prosper—we are the present and the
					future, we are the revolution!"
				</blockquote>

				<div class="cta-row">
					<a href="#application-dossier" class="btn btn-primary">
						Submit Your 1-on-1 Application
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</a>
					<a href="#three-mentorship-tracks" class="btn btn-outline">
						Compare the 3 Candidate Tracks
					</a>
				</div>
			</div>

			<!-- Right 5 Columns: Admissions & Vetting Dossier Card -->
			<aside class="admissions-card" aria-label="1-on-1 Mentorship Admissions Protocol">
				<div class="admissions-card__header">
					<div>
						<span class="meta-label">Admissions Committee Dossier</span>
						<h2 class="admissions-card__title">1-on-1 Mentorship Vetting Protocol</h2>
					</div>
					<span class="admissions-card__badge">No Checkout Button</span>
				</div>

				<dl class="admissions-specs">
					<div class="admissions-specs__row">
						<dt>01 // Who This Is Engineered For</dt>
						<dd>
							<strong>Portfolio Managers</strong> (Macro &amp; Options Hedging),
							<strong>Professional Traders</strong>
							(Scaling &amp; Order Flow), and <strong>Struggling Traders</strong> (Complete Mechanical
							Turnaround).
						</dd>
					</div>
					<div class="admissions-specs__row">
						<dt>02 // Institutional Lineage</dt>
						<dd>
							Direct proprietary trading methodology passed down by former <strong
								>Goldman Sachs legend Mark "Goldfinger" McGoldrick</strong
							>.
						</dd>
					</div>
					<div class="admissions-specs__row">
						<dt>03 // Verified Execution Proof</dt>
						<dd>
							<strong>2020 COVID Top/Bottom</strong> • <strong>2022 Bull Top/Bear Bottom</strong> •
							<strong>+600% Overnight on OXY Put Options</strong> live vs. Warren Buffett.
						</dd>
					</div>
					<div class="admissions-specs__row">
						<dt>04 // Why Approval Is Mandatory</dt>
						<dd>
							1-on-1 mentorship requires intense personal time from our desk. We reject anyone
							looking for a lazy "magic indicator" shortcut and accept only 100% coachable
							candidates.
						</dd>
					</div>
				</dl>

				<div class="admissions-card__steps">
					<span class="meta-label">4-Step Admissions Sequence:</span>
					<ol class="step-inline-list">
						<li><span>Step 1:</span> Select Your Candidate Track Below</li>
						<li><span>Step 2:</span> Submit Your Written Application Dossier</li>
						<li><span>Step 3:</span> Desk Review &amp; Diagnostic Audit</li>
						<li><span>Step 4:</span> Final Approval &amp; 1-on-1 Onboarding</li>
					</ol>
				</div>

				<div class="admissions-card__footer">
					<a href="#application-dossier" class="btn btn-primary btn--full">
						Proceed to Application Dossier
						<ArrowDownIcon size={16} weight="bold" class="ic-down" aria-hidden="true" />
					</a>
				</div>
			</aside>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 3: THE 3 DEDICATED MENTORSHIP TRACKS (PMs | PRO TRADERS | STRUGGLING)
       ========================================================================= -->
	<section id="three-mentorship-tracks" class="section tracks-section" aria-labelledby="tracks-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Three Distinct Tracks • Customized 1-on-1 Execution</span>
				<h2 id="tracks-h2">
					Built for Portfolio Managers, Professional Traders, and Struggling Traders Ready to Turn
					the Corner
				</h2>
				<p class="body-copy section-header__desc">
					A group webinar forces everyone into the same box. Because our mentorship is strictly <strong
						>1-on-1</strong
					>, your curriculum, risk architecture, and live drills are custom-engineered around one of
					three dedicated tracks:
				</p>
			</div>

			<div class="tracks-grid">
				{#each mentorshipTracks as track (track.id)}
					<article class="track-card">
						<div>
							<div class="track-card__top">
								<span class="meta-label">{track.trackCode}</span>
								<span class="track-card__badge">{track.badge}</span>
							</div>

							<h3 class="track-card__title">{track.title}</h3>
							<p class="track-card__subtitle">{track.subtitle}</p>

							<div class="track-card__box">
								<strong>The Bottleneck Holding You Back:</strong>
								<p>{track.coreProblem}</p>
							</div>

							<div class="track-card__box track-card__box--solution">
								<strong>Our 1-on-1 Institutional Intervention:</strong>
								<p>{track.institutionalSolution}</p>
							</div>

							<div class="track-card__deliverables">
								<span class="meta-label">Core 1-on-1 Deliverables:</span>
								<ul class="deliverable-list">
									{#each track.deliverables as item (item)}
										<li>
											<span class="deliverable-check" aria-hidden="true"
												><CheckCircleIcon size={18} weight="fill" /></span
											>
											<span>{item}</span>
										</li>
									{/each}
								</ul>
							</div>
						</div>

						<div class="track-card__footer">
							<button
								type="button"
								class="btn btn-primary btn--full"
								onclick={() => selectTrackAndScroll(track.id)}
							>
								{track.ctaText}
								<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
							</button>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 4: WHY INSTITUTIONAL PROS RESPECT US & STRUGGLING TRADERS TRUST US
       ========================================================================= -->
	<section class="section is-light pedigree-section" aria-labelledby="pedigree-h2">
		<div class="container">
			<div class="pedigree-grid">
				<!-- Left 6 Columns: The Dual Authority Narrative -->
				<div class="pedigree-narrative">
					<span class="eyebrow">Earned In Live Market Combat</span>
					<h2 id="pedigree-h2">
						Why Portfolio Managers Respect Our Edge—And Why Struggling Traders Finally Feel Safe
						Here
					</h2>

					<p class="body-copy">
						Very few traders in the world have lived on both sides of the market divide. Early on, I
						experienced the exact retail heartbreak that struggling traders face every day—being
						lied to by marketers selling repainted "holy grail" indicators and watching hard-earned
						capital vanish.
					</p>

					<p class="body-copy">
						Then I was mentored by former Goldman Sachs proprietary trading giant <strong
							>Mark "Goldfinger" McGoldrick</strong
						>. He didn't teach me how to sell courses; he taught me how Wall Street balance sheets
						hunt retail stops, how institutional liquidity dries up at macro tops, and how to deploy
						options with ruthless mathematical asymmetry.
					</p>

					<p class="body-copy">
						When you sit across from us in <strong>1-on-1 Mentorship</strong>, you get a mentor who
						possesses the <strong>institutional firepower</strong> to advise Portfolio Managers and
						Professional Traders on macro cycle turns—combined with the
						<strong>genuine human empathy</strong> to take a struggling trader by the hand and rebuild
						their confidence and execution brick by brick.
					</p>
				</div>

				<!-- Right 6 Columns: 4-Box Hard Evidence Matrix -->
				<div class="proof-matrix">
					<div class="proof-box">
						<span class="meta-label">Proof 01 // Wall Street Pedigree</span>
						<p class="proof-box__metric">Goldman Sachs Lineage</p>
						<h3 class="proof-box__title">Mentored by Mark "Goldfinger" McGoldrick</h3>
						<p class="proof-box__copy">
							Trained directly by one of the highest-earning proprietary traders in Goldman Sachs
							history, who explicitly called our founder <strong>"the future of trading."</strong>
						</p>
					</div>

					<div class="proof-box">
						<span class="meta-label">Proof 02 // Contrarian Options Execution</span>
						<p class="proof-box__metric">+600% Overnight on OXY</p>
						<h3 class="proof-box__title">Shorted OXY Live vs. Warren Buffett’s Long</h3>
						<p class="proof-box__copy">
							While Warren Buffett bought millions in Occidental Petroleum (OXY) and retail chased
							the headline, we spotted institutional distribution and banked <strong
								>600% overnight on OXY Put Options live</strong
							>.
						</p>
					</div>

					<div class="proof-box">
						<span class="meta-label">Proof 03 // 2020 Macro Cycle Call</span>
						<p class="proof-box__metric">2020 Top &amp; Bottom</p>
						<h3 class="proof-box__title">Called the COVID Crash &amp; Generational Low</h3>
						<p class="proof-box__copy">
							Warned traders of structural breakdown before the February 2020 crash cascaded, then
							pivoted at the exact March 2020 capitulation bottom.
						</p>
					</div>

					<div class="proof-box">
						<span class="meta-label">Proof 04 // 2022 Macro Cycle Call</span>
						<p class="proof-box__metric">2022 Top &amp; Bottom</p>
						<h3 class="proof-box__title">Called the 2022 Bull Top &amp; Bear Bottom</h3>
						<p class="proof-box__copy">
							Repeated the feat in the very next cycle—calling the January 2022 distribution top and
							the October 2022 institutional accumulation bottom.
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 5: INSIDE THE 4-PHASE 1-ON-1 MENTORSHIP ARCHITECTURE
       ========================================================================= -->
	<section class="section protocol-section" aria-labelledby="protocol-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Educate • Innovate • Prosper</span>
				<h2 id="protocol-h2">Inside the 4-Phase 1-on-1 Transformation Architecture</h2>
				<p class="body-copy section-header__desc">
					Once your application is approved, we do not hand you a login to pre-recorded fluff and
					disappear. Every accepted mentee progresses through a structured, four-phase institutional
					rebuild:
				</p>
			</div>

			<div class="protocol-grid">
				{#each protocolPhases as item (item.phase)}
					<article class="protocol-card">
						<div class="protocol-card__header">
							<span class="protocol-card__phase">{item.phase}</span>
							<span class="meta-label">{item.durationTag}</span>
						</div>

						<h3 class="protocol-card__title">{item.title}</h3>
						<p class="protocol-card__summary">{item.summary}</p>

						<div class="protocol-card__outcomes">
							<span class="meta-label">Verified Phase Benchmarks:</span>
							<ul class="outcome-list">
								{#each item.outcomes as outcome (outcome)}
									<li>
										<span class="outcome-bullet" aria-hidden="true"
											><CaretRightIcon size={14} weight="fill" /></span
										>
										<span>{outcome}</span>
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
       SECTION 6: WHO GETS APPROVED VS. WHO GETS REJECTED (MERITOCRACY MATRIX)
       ========================================================================= -->
	<section class="section is-light vetting-section" aria-labelledby="vetting-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Strict Meritocracy • Read Before Applying</span>
				<h2 id="vetting-h2">Who We Approve vs. Applications We Immediately Reject</h2>
				<p class="body-copy section-header__desc">
					We protect the integrity of our desk and our mentees’ results. Before filling out the
					application dossier below, verify where you stand:
				</p>
			</div>

			<div class="vetting-grid">
				<!-- Rejected Column -->
				<div class="vetting-card vetting-card--rejected">
					<div class="vetting-card__header">
						<span class="meta-label">Automatic Disqualification</span>
						<h3 class="vetting-card__title">Who We Reject</h3>
					</div>
					<ul class="vetting-list">
						<li>
							<strong
								><XCircleIcon
									size={18}
									weight="fill"
									class="ic-mark ic-mark--no"
									aria-hidden="true"
								/> "Holy Grail" Shortcut Seekers:</strong
							> Anyone looking for a magic repainting arrow indicator so they never have to learn price
							structure or risk management.
						</li>
						<li>
							<strong
								><XCircleIcon
									size={18}
									weight="fill"
									class="ic-mark ic-mark--no"
									aria-hidden="true"
								/> Uncoachable Egos:</strong
							> Traders who refuse to journal their trades, ignore hard stop-loss levels, or blame the
							market instead of taking ownership.
						</li>
						<li>
							<strong
								><XCircleIcon
									size={18}
									weight="fill"
									class="ic-mark ic-mark--no"
									aria-hidden="true"
								/> Lottery-Ticket Gamblers:</strong
							> Applicants looking to bet 100% of their rent money on a single 0DTE option trade overnight
							without risk controls.
						</li>
						<li>
							<strong
								><XCircleIcon
									size={18}
									weight="fill"
									class="ic-mark ic-mark--no"
									aria-hidden="true"
								/> Zero Time Commitment:</strong
							> Anyone unwilling to show up prepared for their scheduled 1-on-1 trade reviews and execution
							drills.
						</li>
					</ul>
				</div>

				<!-- Approved Column -->
				<div class="vetting-card vetting-card--approved">
					<div class="vetting-card__header">
						<span class="meta-label">Ideal Mentorship Candidates</span>
						<h3 class="vetting-card__title">Who We Approve</h3>
					</div>
					<ul class="vetting-list">
						<li>
							<strong
								><CheckCircleIcon
									size={18}
									weight="fill"
									class="ic-mark ic-mark--yes"
									aria-hidden="true"
								/> Portfolio Managers &amp; Desk Leads:</strong
							> Seeking institutional macro inflection timing, liquidity-sweep telemetry, and asymmetric
							options hedging overlays.
						</li>
						<li>
							<strong
								><CheckCircleIcon
									size={18}
									weight="fill"
									class="ic-mark ic-mark--yes"
									aria-hidden="true"
								/> Full-Time &amp; Developing Pro Traders:</strong
							> Ready to audit their execution leaks, scale contract/share sizing mathematically, and
							master order flow.
						</li>
						<li>
							<strong
								><CheckCircleIcon
									size={18}
									weight="fill"
									class="ic-mark ic-mark--yes"
									aria-hidden="true"
								/> Coachable Struggling Traders:</strong
							> Honest about past losses, ready to throw away fake guru habits, and committed to following
							a mechanical entry/exit/stop checklist.
						</li>
						<li>
							<strong
								><CheckCircleIcon
									size={18}
									weight="fill"
									class="ic-mark ic-mark--yes"
									aria-hidden="true"
								/> Long-Term Builders ($500+ to $10M+):</strong
							> Regardless of starting capital, traders who treat this as an elite profession and put
							in the work.
						</li>
					</ul>
				</div>
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 7: INTERACTIVE 1-ON-1 MENTORSHIP APPLICATION DOSSIER FORM
       ========================================================================= -->
	<section
		id="application-dossier"
		class="section application-section"
		aria-labelledby="application-h2"
	>
		<div class="container">
			<div class="application-wrapper">
				<div class="application-header">
					<span class="eyebrow">Official Admissions Portal • Manual Review</span>
					<h2 id="application-h2">Submit Your 1-on-1 Mentorship Application Dossier</h2>
					<p class="body-copy">
						Complete every field below with 100% honesty. No payment is collected on this page.
						Every application is reviewed personally by our desk to determine if we can genuinely
						help you achieve your goals.
					</p>
				</div>

				{#if applicationSubmitted}
					<div class="submission-confirmation" role="status" aria-live="polite">
						<span class="eyebrow">Application Logged</span>
						<h3 class="submission-confirmation__title">
							Your 1-on-1 Mentorship Dossier Has Been Received for Manual Review.
						</h3>
						<p class="body-copy">
							Thank you, <strong>{fullName}</strong>. Our admissions desk has logged your
							application under the
							<strong>{selectedTrack.replaceAll('-', ' ').toUpperCase()}</strong>
							track. We review all applications manually and will reach out to
							<strong>{email}</strong> if your profile is approved for a 1-on-1 diagnostic call.
						</p>
					</div>
				{:else}
					<form
						method="POST"
						action="?/submitMentorshipApplication"
						class="application-form"
						onsubmit={handleApplicationSubmit}
					>
						<!-- Step 1: Candidate Track Radio Selector -->
						<fieldset class="form-fieldset">
							<legend class="form-legend">01 // Select Your Candidate Track (Required)</legend>
							<div class="track-selector-grid">
								<label
									class="track-radio-card"
									class:track-radio-card--active={selectedTrack === 'portfolio-manager'}
								>
									<input
										type="radio"
										name="candidateTrack"
										value="portfolio-manager"
										bind:group={selectedTrack}
										required
									/>
									<span class="track-radio-card__tag">Track 01</span>
									<strong class="track-radio-card__title">Portfolio Manager / Allocator</strong>
									<span class="track-radio-card__desc"
										>Macro cycle timing, options hedging &amp; institutional execution</span
									>
								</label>

								<label
									class="track-radio-card"
									class:track-radio-card--active={selectedTrack === 'professional-trader'}
								>
									<input
										type="radio"
										name="candidateTrack"
										value="professional-trader"
										bind:group={selectedTrack}
									/>
									<span class="track-radio-card__tag">Track 02</span>
									<strong class="track-radio-card__title">Professional / Active Trader</strong>
									<span class="track-radio-card__desc"
										>Breaking PnL plateaus, scaling size &amp; order-flow mastery</span
									>
								</label>

								<label
									class="track-radio-card"
									class:track-radio-card--active={selectedTrack === 'struggling-trader'}
								>
									<input
										type="radio"
										name="candidateTrack"
										value="struggling-trader"
										bind:group={selectedTrack}
									/>
									<span class="track-radio-card__tag">Track 03</span>
									<strong class="track-radio-card__title">Struggling Trader Turnaround</strong>
									<span class="track-radio-card__desc"
										>Stop the bleeding, unlearn fake guru habits &amp; rebuild mechanically</span
									>
								</label>
							</div>
						</fieldset>

						<!-- Step 2: Candidate Contact & Location -->
						<fieldset class="form-fieldset">
							<legend class="form-legend">02 // Candidate Identification &amp; Jurisdiction</legend>
							<div class="form-grid-2">
								<div class="form-field">
									<label for="applicant-name">Full Legal Name *</label>
									<input
										type="text"
										id="applicant-name"
										name="fullName"
										bind:value={fullName}
										required
										autocomplete="name"
										placeholder="Enter your full name"
									/>
								</div>

								<div class="form-field">
									<label for="applicant-email">Primary Email Address *</label>
									<input
										type="email"
										id="applicant-email"
										name="email"
										bind:value={email}
										required
										autocomplete="email"
										placeholder="you@domain.com"
									/>
								</div>

								<div class="form-field">
									<label for="applicant-phone">Direct Phone Number (For Admissions Call) *</label>
									<input
										type="tel"
										id="applicant-phone"
										name="phone"
										bind:value={phone}
										required
										autocomplete="tel"
										placeholder="+1 (555) 000-0000"
									/>
								</div>

								<div class="form-field">
									<label for="applicant-country">Country / Market Jurisdiction *</label>
									<select id="applicant-country" name="country" bind:value={country} required>
										<option value="United States">United States</option>
										<option value="Canada">Canada</option>
										<option value="United Kingdom / Europe">United Kingdom / Europe</option>
										<option value="Other International">Other International</option>
									</select>
								</div>
							</div>
						</fieldset>

						<!-- Step 3: Trading Profile & Diagnostic Audit -->
						<fieldset class="form-fieldset">
							<legend class="form-legend"
								>03 // Capital Mandate, Markets Traded &amp; Diagnostic Audit</legend
							>
							<div class="form-grid-2">
								<div class="form-field">
									<label for="applicant-capital">Current Trading Capital or AUM Tier *</label>
									<select
										id="applicant-capital"
										name="capitalTier"
										bind:value={capitalTier}
										required
									>
										<option value="$500 – $5,000 (Small Account Turnaround)"
											>$500 – $5,000 (Small Account Turnaround)</option
										>
										<option value="$5,000 – $25,000 (Developing Trader)"
											>$5,000 – $25,000 (Developing Trader)</option
										>
										<option value="$25,000 – $100,000 (Active / Full-Time)"
											>$25,000 – $100,000 (Active / Full-Time)</option
										>
										<option value="$100,000 – $1,000,000 (Professional Desk)"
											>$100,000 – $1,000,000 (Professional Desk)</option
										>
										<option value="$1,000,000+ (Portfolio Manager / Institutional / Family Office)"
											>$1,000,000+ (Portfolio Manager / Institutional / Family Office)</option
										>
									</select>
								</div>

								<div class="form-field">
									<label for="applicant-schedule"
										>Primary Trading Schedule &amp; Availability *</label
									>
									<select id="applicant-schedule" name="scheduleType" required>
										<option value="Full-Time Market Hours (9:30 AM – 4:00 PM ET)"
											>Full-Time Market Hours (9:30 AM – 4:00 PM ET)</option
										>
										<option value="Portfolio Manager / Institutional Mandate"
											>Portfolio Manager / Institutional Mandate</option
										>
										<option value="Working Professional (9-to-5 / Swing & Pre-Planned Execution)"
											>Working Professional (9-to-5 / Swing &amp; Pre-Planned Execution)</option
										>
										<option value="Opening Bell Only (First 60–90 Minutes)"
											>Opening Bell Only (First 60–90 Minutes)</option
										>
									</select>
								</div>
							</div>

							<div class="form-field form-field--full">
								<label for="applicant-bottleneck">
									Be Brutally Honest: What Is Your #1 Trading Bottleneck, Goal, or Reason for
									Applying Right Now? *
								</label>
								<textarea
									id="applicant-bottleneck"
									name="primaryBottleneck"
									rows="4"
									bind:value={primaryBottleneck}
									required
									placeholder="Describe your current execution struggles, portfolio mandate, or what has held you back from consistent profitability..."
								></textarea>
							</div>
						</fieldset>

						<!-- Step 4: Coachability Pledge & Submit -->
						<div class="form-pledge-box">
							<label class="checkbox-label">
								<input
									type="checkbox"
									name="coachabilityPledge"
									bind:checked={coachabilityConfirmed}
									required
								/>
								<span>
									<strong>Mandatory Candidate Pledge:</strong> I understand that Revolution Trading Pros
									1-on-1 Mentorship is strictly by application and approval only. If accepted, I commit
									to being 100% coachable, abandoning fake "holy grail" indicator shortcuts, and following
									strict institutional risk and stop-loss rules.
								</span>
							</label>
						</div>

						<div class="form-submit-row">
							<button type="submit" class="btn btn-primary btn--full btn--large">
								Submit 1-on-1 Mentorship Application for Review
								<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
							</button>
							<p class="form-privacy-note">
								Strict Confidentiality: All Portfolio Manager, Professional Trader, and Turnaround
								applications are reviewed under strict non-disclosure by our senior desk.
							</p>
						</div>
					</form>
				{/if}
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 8: MENTORSHIP FAQ ACCORDION (SEO & AI OVERVIEW OPTIMIZED)
       ========================================================================= -->
	<section class="section faq-section" aria-labelledby="mentorship-faq-h2">
		<div class="container faq-container">
			<div class="section-heading">
				<span class="eyebrow">Direct Answers • Zero Evasion</span>
				<h2 id="mentorship-faq-h2">
					Frequently Asked Questions About 1-on-1 Mentorship Admissions
				</h2>
			</div>

			<div class="faq-list">
				{#each MENTORSHIP_FAQ_ITEMS as item, index (item.id)}
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
       SECTION 9: IMMEDIATE ECOSYSTEM ACCESS BANNER (WHILE AWAITING REVIEW)
       ========================================================================= -->
	<section class="section ecosystem-banner" aria-labelledby="ecosystem-banner-h2">
		<div class="container ecosystem-banner__inner">
			<span class="eyebrow">Educate • Innovate • Prosper</span>
			<h2 id="ecosystem-banner-h2" class="ecosystem-banner__h2">
				Want Immediate Access to Our Desk While Your 1-on-1 Application Is Reviewed?
			</h2>
			<p class="body-copy ecosystem-banner__copy">
				Explore our affordable Live Trading Rooms, Video Watchlist Alert Services, and 100%
				Non-Repainting Indicators built for working professionals, active day traders, and $500+
				small accounts.
			</p>
			<div class="cta-row">
				<a href={resolve('/live-trading-rooms/day-trading-room' as '/')} class="btn btn-dark">
					Live Day Trading Room
					<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
				</a>
				<a
					href={resolve('/live-trading-rooms/small-accounts-room' as '/')}
					class="btn btn-outline-dark"
				>
					Small Accounts Room ($500+)
				</a>
				<a href={resolve('/alert-services/explosive-swings' as '/')} class="btn btn-outline-dark">
					Explosive Swings Video Watchlist
				</a>
				<a href={resolve('/store/indicators' as '/')} class="btn btn-outline-dark">
					Non-Repainting Indicators
				</a>
			</div>
		</div>
	</section>
</main>

<Footer />
