<!-- src/routes/live-trading-rooms/small-accounts-room/+page.svelte -->
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
	import { SMALL_ACCOUNTS_ROOM_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	interface CompoundingPhase {
		stageCode: string;
		capitalBracket: string;
		title: string;
		description: string;
		rules: string[];
	}

	interface SmallAccountPlaybook {
		code: string;
		instrumentTag: string;
		title: string;
		whySmallAccountsBlowUp: string;
		ourInstitutionalFix: string;
		riskCap: string;
	}

	interface ComparisonRow {
		criterion: string;
		fakeGuruChallenges: string;
		revolutionSmallRoom: string;
	}

	const compoundingRoadmap: CompoundingPhase[] = [
		{
			stageCode: 'Stage 01 // Survival & Stabilization',
			capitalBracket: '$500 to $1,500 Capital',
			title: 'Halting Account Bleed, T+1 Cash Account Rotation & Contract Affordability',
			description:
				'When you start with $500, a single reckless $300 loss destroys 60% of your buying power and requires a 150% gain just to get back to breakeven. Stage 01 installs ironclad capital protection and teaches you how to rotate settled cash daily under T+1 settlement rules without triggering Pattern Day Trader (PDT) locks.',
			rules: [
				'Strict contract price ceiling so no single option contract consumes your account',
				'T+1 Cash Account buying-power partitioning (trading 30% to 50% of settled cash per session)',
				'Mandatory hard stop-losses placed in the system the second an order fills'
			]
		},
		{
			stageCode: 'Stage 02 // Structured Compounding',
			capitalBracket: '$1,500 to $5,000 Capital',
			title: 'Asymmetric 3R+ Setups, Vertical Spreads & Runner Mechanics',
			description:
				'Once your base capital is protected and growing, you unlock multi-contract scaling and defined-risk vertical debit/credit spreads. Instead of binary "all-in / all-out" trades, you learn to lock in profit on Contract 1 to finance a risk-free runner.',
			rules: [
				'Transitioning from single-contract entries to 2-contract scale-out structures',
				'Using vertical debit spreads to cap maximum dollar risk and neutralize Theta decay',
				'Moving stops to breakeven immediately after Target 1 is achieved'
			]
		},
		{
			stageCode: 'Stage 03 // Multi-Strategy Expansion',
			capitalBracket: '$5,000 to $15,000 Capital',
			title: 'Combining Intraday Liquidity Sweeps With Multi-Day Institutional Swings',
			description:
				'With a $5,000+ cushion, your account no longer depends solely on intraday scalps. We teach you to allocate a core bucket to multi-day institutional swing setups while keeping a tactical bucket for high-velocity opening bell setups.',
			rules: [
				'Splitting capital between intraday cash-flow setups and multi-day swing runners',
				'Applying the macro regime framework behind our 2020 and 2022 top and bottom calls',
				'Strict daily drawdown circuit breakers to protect weeks of accumulated gains'
			]
		},
		{
			stageCode: 'Stage 04 // Institutional Graduation',
			capitalBracket: '$15,000 to $25,000+ Capital',
			title: 'Crossing the $25,000 Threshold Without Developing Reckless Size Habits',
			description:
				'Many traders work hard to grow a small account to $25,000, unlock margin day trading, and immediately blow it up by 5x-ing their position size overnight. We guide your transition into full institutional sizing with mathematical precision.',
			rules: [
				'Gradual percentage-based position scaling so emotions never spike with dollar size',
				'Full integration with our main Day Trading Room and Swing Trading Room playbooks',
				'Portfolio-level hedging using index puts and contrarian distribution setups'
			]
		}
	];

	const smallAccountPlaybooks: SmallAccountPlaybook[] = [
		{
			code: 'Playbook 01 // T+1 Cash Account Liquidity Sweeps',
			instrumentTag: 'Liquid Options & ETFs',
			title: 'High-Probability Opening Bell Reversals Priced for $500+ Accounts',
			whySmallAccountsBlowUp:
				'Small account traders chase expensive, high-implied-volatility options contracts ($8.00 to $15.00 per contract) right as retail FOMO peaks at the open.',
			ourInstitutionalFix:
				'Using the proprietary order-flow methodology passed down by former Goldman Sachs legend Mark "Goldfinger" McGoldrick, we wait for institutional liquidity sweeps on liquid ETFs and stocks where clean, tight-spread options contracts cost a fraction of the price.',
			riskCap:
				'Tight structural invalidation levels just beyond the sweep high/low—keeping dollar risk small while targeting 200% to 300% asymmetric expansions.'
		},
		{
			code: 'Playbook 02 // Defined-Risk Vertical Spreads',
			instrumentTag: 'Debit & Credit Spreads',
			title: 'Capping Maximum Risk & Defeating Options Time Decay (Theta)',
			whySmallAccountsBlowUp:
				'Beginners buy cheap, far out-of-the-money weekly lottery-ticket calls or puts that have a 95% probability of expiring worthless due to rapid time decay.',
			ourInstitutionalFix:
				'We teach small accounts how to pair a long option with a short option (vertical spreads)—drastically lowering the cost of entry, neutralizing time decay, and profitable execution even on moderate price moves.',
			riskCap:
				'Maximum possible loss is 100% locked in and known before entry—zero margin surprises and zero Theta bleed traps.'
		},
		{
			code: 'Playbook 03 // Contrarian Distribution Puts',
			instrumentTag: 'The +600% OXY Blueprint',
			title: 'Turning Small Defined Risk Into Explosive Gains When Hype Collapses',
			whySmallAccountsBlowUp:
				'Retail traders with $500 accounts buy late into media hype—becoming exit liquidity for billionaires and institutional desks.',
			ourInstitutionalFix:
				'This is the exact blueprint behind our famous Occidental Petroleum (OXY) trade: while Warren Buffett bought millions of dollars on the long side and retail chased the headline, we spotted institutional distribution and bought affordable OXY Put Options live for a 600% overnight gain.',
			riskCap:
				'Strictly defined premium risk on liquid put contracts when institutional volume confirms buyer exhaustion at major resistance.'
		},
		{
			code: 'Playbook 04 // High-Velocity Small-Cap & ETF Swings',
			instrumentTag: 'Shares & Multi-Day Options',
			title: 'Capturing 3-to-5 Day Compression Breakouts Without PDT Restrictions',
			whySmallAccountsBlowUp:
				'Traders in margin accounts under $25,000 get locked by the 3-day-trade Pattern Day Trader (PDT) rule—or hold losing day trades overnight hoping to avoid a PDT strike.',
			ourInstitutionalFix:
				'We provide pre-planned 2-to-5 day swing setups with exact entry triggers, profit targets, and hard stops that don’t count as day trades—allowing you to compound smoothly whether you use a cash account or a small margin account.',
			riskCap:
				'Pre-calculated share or contract sizing using our free Options Calculator so every trade respects your exact account balance.'
		}
	];

	const comparisonData: ComparisonRow[] = [
		{
			criterion: 'Cost vs. Your Trading Capital',
			fakeGuruChallenges:
				'Charges $2,500 to $5,000 for courses—wiping out your entire $500 trading budget before you place a single trade.',
			revolutionSmallRoom:
				'People Over Profits: Kept genuinely affordable so your hard-earned money stays inside your brokerage account.'
		},
		{
			criterion: '"Small Account Challenge" Honesty',
			fakeGuruChallenges:
				'Gambles 100% per trade across 10 hidden accounts, blows up 9 in secret, and markets the 1 lucky account on social media.',
			revolutionSmallRoom:
				'100% real, repeatable risk management taught by the trader Mark "Goldfinger" McGoldrick called "the future of trading."'
		},
		{
			criterion: 'Contract Price Selection',
			fakeGuruChallenges:
				'Calls out $12.00 ($1,200 per contract) options that a $500 to $1,500 account cannot even afford to buy.',
			revolutionSmallRoom:
				'Hand-selected setups priced specifically for small-account affordability, tight bid-ask spreads, and high liquidity.'
		},
		{
			criterion: 'PDT & T+1 Cash Account Rules',
			fakeGuruChallenges:
				'Ignores Pattern Day Trader locks and cash settlement rules, leaving small accounts stranded with unsettled funds.',
			revolutionSmallRoom:
				'Built-in daily buying-power allocation and T+1 cash rotation so you can trade consistently every market day.'
		},
		{
			criterion: 'Pre-Trade Risk Definition',
			fakeGuruChallenges:
				'Shouts "lotto calls" with zero stop-loss and tells members "only risk what you can afford to lose" when it goes to zero.',
			revolutionSmallRoom:
				'Every setup specifies the exact entry trigger, tiered profit targets, and hard invalidation stop-loss ahead of time.'
		}
	];
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#small-accounts-room-page">Skip to content</a>

<Navbar />

<main id="small-accounts-room-page" class="inner-page small-room-page">
	<!-- =========================================================================
       SECTION 1: BREADCRUMB & SMALL ACCOUNT TELEMETRY BAR
       ========================================================================= -->
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true" class="crumb-sep"><CaretRightIcon size={12} weight="bold" /></li>
				<li><span>Live Trading Rooms</span></li>
				<li aria-hidden="true" class="crumb-sep"><CaretRightIcon size={12} weight="bold" /></li>
				<li aria-current="page">Small Accounts Room</li>
			</ol>
			<p class="breadcrumb-bar__telemetry">
				<span>Accounts Starting at $500+</span> • <span>T+1 Cash &amp; PDT Mastery</span> •
				<span>US &amp; Canada</span>
			</p>
		</div>
	</nav>

	<!-- =========================================================================
       SECTION 2: ABOVE-THE-FOLD HERO SECTION (12-COLUMN ASYMMETRIC SPLIT)
       ========================================================================= -->
	<section class="section hero-section" aria-labelledby="small-room-h1">
		<div class="container hero-section__grid">
			<!-- Left 7 Columns: Search-Intent H1 + Empathy & Pedigree Narrative -->
			<div class="hero-section__main">
				<div class="eyebrow-pill">
					<span class="eyebrow-pill__badge">Accounts Starting as Low as $500</span>
					<span class="eyebrow-pill__text">
						People Over Profits • Zero Fake "Holy Grail" Indicators
					</span>
				</div>

				<h1 id="small-room-h1" class="hero-h1">
					<span class="hero-h1__seo-kicker seo-kicker">
						Small Accounts Stock &amp; Options Trading Room • $500+ Compounding &amp; Risk Control
					</span>
					<span class="hero-h1__display">
						You Don’t Need $25,000 to Trade Like an Institution. You Need a Playbook Built for $500+
						Reality.
					</span>
				</h1>

				<p class="lead-copy">
					When you log into our <strong>Small Accounts Room</strong>, you immediately know you
					finally found what you have been searching for—not a reckless internet marketer telling
					you to gamble your last $500 on lottery-ticket options, and not an overpriced course that
					drains your savings, but
					<strong
						>a disciplined, mathematical roadmap engineered specifically for accounts starting as
						low as $500</strong
					>.
				</p>

				<p class="body-copy">
					<strong
						>I know how devastating it feels to blow up a small trading account, because I stood on
						the losing end myself in the past.</strong
					>
					Most trading rooms destroy small accounts because they call out $1,000+ options contracts meant
					for six-figure portfolios—where one normal dip wipes out 50% of a beginner's capital. Even worse,
					fake gurus charge $3,000 for repainted "holy grail" indicators, stealing the very capital you
					needed to trade with. That is why I built Revolution Trading Pros on one unbreakable rule:
					<strong>we focus on PEOPLE, not making money.</strong>
				</p>

				<p class="body-copy">
					Mentored directly by former Wall Street Goldman Sachs proprietary trading legend
					<strong>Mark "Goldfinger" McGoldrick</strong>—who called me
					<em>"the future of trading"</em>—I became the only retail trader feared by Wall Street:
					calling the <strong>2020 COVID Top and Bottom</strong>, calling the
					<strong>2022 Market Top and Bottom</strong>, and embarrassing
					<strong>Warren Buffett live on Occidental Petroleum (OXY)</strong> when he went long
					millions of dollars and I shorted with Put Options for a
					<strong>600% overnight gain</strong>. In this room, we apply that exact institutional
					discipline to help you protect and compound a $500+ account step by step.
				</p>

				<blockquote class="editorial-quote">
					"Educate, Innovate, and Prosper. A $500 account traded with Goldman Sachs risk discipline
					will beat an undisciplined $50,000 gambler every single time. We are the revolution!"
				</blockquote>

				<div class="cta-row">
					<a href="#join-small-accounts-room" class="btn btn-primary">
						Join the Small Accounts Room
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</a>
					<a href="#compounding-roadmap" class="btn btn-outline">
						See the $500 to $25,000+ Roadmap
					</a>
				</div>

				<!-- 4-Column Telemetry Strip -->
				<dl class="hero-metrics">
					<div class="hero-metrics__item">
						<dt>Starting Capital</dt>
						<dd>Built for $500+ Accounts</dd>
					</div>
					<div class="hero-metrics__item">
						<dt>PDT &amp; Settlement</dt>
						<dd>T+1 Cash Account Mastery</dd>
					</div>
					<div class="hero-metrics__item">
						<dt>Contract Selection</dt>
						<dd>Affordable &amp; High Liquidity</dd>
					</div>
					<div class="hero-metrics__item">
						<dt>Risk Architecture</dt>
						<dd>Exact Entries, Targets &amp; Stops</dd>
					</div>
				</dl>
			</div>

			<!-- Right 5 Columns: $500+ Small Account Survival & Compounding Dossier -->
			<aside class="survival-card" aria-label="Small Account Survival and Compounding Rules">
				<div class="survival-card__header">
					<div>
						<span class="meta-label">Small-Capital Engineering</span>
						<h2 class="survival-card__title">The 4 Laws of $500+ Account Survival</h2>
					</div>
					<span class="survival-card__tag">Zero Gambling</span>
				</div>

				<p class="survival-card__intro">
					Why do 90% of small accounts fail in their first 30 days? Because they copy big-account
					sizing. Every setup in our Small Accounts Room obeys four non-negotiable laws:
				</p>

				<div class="survival-rules">
					<div class="survival-rule">
						<div class="survival-rule__head">
							<span class="survival-rule__code">Law 01 // Strict Contract Affordability</span>
							<span class="survival-rule__pill">No Oversized Contracts</span>
						</div>
						<p>
							We filter specifically for liquid stock, ETF, and options setups where contract
							premiums or vertical spreads fit cleanly inside a $500 to $2,500 budget.
						</p>
					</div>

					<div class="survival-rule">
						<div class="survival-rule__head">
							<span class="survival-rule__code">Law 02 // T+1 Cash Account Rotation</span>
							<span class="survival-rule__pill">Bypass PDT Locks</span>
						</div>
						<p>
							Learn how to partition your settled cash under T+1 overnight settlement so you can
							execute intraday setups every morning without needing $25,000 margin.
						</p>
					</div>

					<div class="survival-rule">
						<div class="survival-rule__head">
							<span class="survival-rule__code">Law 03 // Asymmetric 3R to 5R Payoffs</span>
							<span class="survival-rule__pill">Defined Risk Only</span>
						</div>
						<p>
							By entering at institutional liquidity sweeps with tight invalidation stops, your
							downside is capped to a small fraction while winners compound aggressively.
						</p>
					</div>

					<div class="survival-rule">
						<div class="survival-rule__head">
							<span class="survival-rule__code"
								>Law 04 // Pre-Planned Entries, Exits &amp; Stops</span
							>
							<span class="survival-rule__pill">Zero Guesswork</span>
						</div>
						<p>
							Every trade includes the exact entry trigger, profit target, and hard stop-loss level
							before we enter—eliminating emotional panic selling.
						</p>
					</div>
				</div>

				<div class="survival-card__footer">
					<p class="survival-card__note">
						Want to calculate exact contract risk before entering? Use our free
						<a href={resolve('/resources/options-calculator' as '/')}>Options Calculator →</a>
					</p>
				</div>
			</aside>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 3: THE 4-STAGE SMALL ACCOUNT COMPOUNDING ROADMAP ($500 TO $25K+)
       ========================================================================= -->
	<section id="compounding-roadmap" class="section roadmap-section" aria-labelledby="roadmap-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Step-by-Step Capital Scaling • Mathematical Discipline</span>
				<h2 id="roadmap-h2">The 4-Stage Small Account Compounding Blueprint ($500 to $25,000+)</h2>
				<p class="body-copy section-header__sub">
					You don’t grow a $500 account by swinging for home runs on every candle. You grow it by
					graduating through four distinct capital brackets—each with its own position-sizing and
					risk rules:
				</p>
			</div>

			<div class="roadmap-grid">
				{#each compoundingRoadmap as phase (phase.stageCode)}
					<article class="roadmap-card">
						<div>
							<div class="roadmap-card__top">
								<span class="meta-label">{phase.stageCode}</span>
								<span class="roadmap-card__bracket">{phase.capitalBracket}</span>
							</div>

							<h3 class="roadmap-card__title">{phase.title}</h3>
							<p class="roadmap-card__desc">{phase.description}</p>
						</div>

						<div class="roadmap-card__rules">
							<span class="meta-label">Mandatory Bracket Rules:</span>
							<ul class="check-list">
								{#each phase.rules as rule (rule)}
									<li>
										<span class="deliverable-check" aria-hidden="true"
											><CheckCircleIcon size={18} weight="fill" /></span
										>
										<span>{rule}</span>
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
       SECTION 4: THE 4 INSTITUTIONAL PLAYBOOKS FOR $500+ ACCOUNTS (2x2 BENTO)
       ========================================================================= -->
	<section class="section is-light playbooks-section" aria-labelledby="playbooks-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Goldman Sachs Mentored Execution • Right-Sized for Small Capital</span
				>
				<h2 id="playbooks-h2">
					Four Institutional Setups Engineered Specifically for $500+ Accounts
				</h2>
				<p class="body-copy section-header__sub">
					We never water down our institutional edge for small accounts—we right-size the vehicle.
					Here are the four core playbooks we execute inside the Small Accounts Room:
				</p>
			</div>

			<div class="playbooks-grid">
				{#each smallAccountPlaybooks as playbook (playbook.code)}
					<article class="playbook-card">
						<div class="playbook-card__header">
							<span class="meta-label">{playbook.code}</span>
							<span class="playbook-card__badge">{playbook.instrumentTag}</span>
						</div>

						<h3 class="playbook-card__title">{playbook.title}</h3>

						<dl class="playbook-card__specs">
							<div>
								<dt>Why Most $500 Accounts Blow Up Here:</dt>
								<dd>{playbook.whySmallAccountsBlowUp}</dd>
							</div>
							<div>
								<dt>Our Institutional Small-Account Solution:</dt>
								<dd>{playbook.ourInstitutionalFix}</dd>
							</div>
							<div class="playbook-card__risk">
								<dt>Capital Protection &amp; Risk Cap:</dt>
								<dd>{playbook.riskCap}</dd>
							</div>
						</dl>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 5: FAKE GURU "CHALLENGES" VS. OUR SMALL ACCOUNTS ROOM (TABLE)
       ========================================================================= -->
	<section class="section comparison-section" aria-labelledby="comparison-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Exposing the Industry Scam • Hard Evidence</span>
				<h2 id="comparison-h2">
					Fake Guru "$500 Challenges" vs. The Revolution Trading Pros Small Accounts Room
				</h2>
				<p class="body-copy section-header__sub">
					Before you risk a single dollar of your starting capital, compare how social media
					marketers exploit small accounts versus how we protect and grow yours:
				</p>
			</div>

			<div class="table-wrapper" role="region" aria-labelledby="comparison-h2">
				<table class="comparison-table">
					<thead>
						<tr>
							<th scope="col">Protection Standard</th>
							<th scope="col">Fake Guru "$500 to $50K Challenges"</th>
							<th scope="col">Revolution Trading Pros Small Accounts Room</th>
						</tr>
					</thead>
					<tbody>
						{#each comparisonData as row (row.criterion)}
							<tr>
								<th scope="row" class="comparison-table__feature">{row.criterion}</th>
								<td class="comparison-table__negative">
									<XCircleIcon
										size={18}
										weight="fill"
										class="ic-mark ic-mark--no"
										aria-hidden="true"
									/>
									{row.fakeGuruChallenges}
								</td>
								<td class="comparison-table__positive">
									<CheckCircleIcon
										size={18}
										weight="fill"
										class="ic-mark ic-mark--yes"
										aria-hidden="true"
									/>
									{row.revolutionSmallRoom}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 6: HONEST FIT CHECK & ROOM ROUTING
       ========================================================================= -->
	<section
		id="join-small-accounts-room"
		class="section is-light routing-section"
		aria-labelledby="routing-h2"
	>
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">People Over Making Money • Start in the Right Room</span>
				<h2 id="routing-h2">
					Enroll in the Small Accounts Room—Or Compare Our Other Trading Rooms &amp; Alerts
				</h2>
				<p class="body-copy section-header__sub">
					Our mission is to make sure every trader is placed in the exact environment built for
					their capital and daily routine:
				</p>
			</div>

			<div class="routing-grid">
				<!-- Primary Selection: Small Accounts Room -->
				<article class="route-card route-card--featured">
					<div>
						<div class="route-card__top">
							<span class="meta-label">You Are Here // $500+ Capital</span>
							<span class="route-card__badge">Built for Small Accounts</span>
						</div>
						<h3 class="route-card__title">Small Accounts Room</h3>
						<p class="route-card__copy">
							Engineered specifically for traders starting with <strong>$500 to $5,000</strong>. Get
							live guidance, affordable stock and options setups, T+1 cash account buying-power
							rotation, defined-risk vertical spreads, and strict stop-loss discipline.
						</p>
					</div>
					<a href={resolve('/contact' as '/')} class="btn btn-dark btn--full">
						Enroll in the Small Accounts Room
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</a>
				</article>

				<!-- Option 2: Working Professionals / Alert-Only Video Watchlists -->
				<article class="route-card">
					<div>
						<div class="route-card__top">
							<span class="meta-label">Working a 9-to-5 Job or Want Alerts Only?</span>
						</div>
						<h3 class="route-card__title">Swing Room &amp; Explosive Swings</h3>
						<p class="route-card__copy">
							Cannot watch screens during market hours? Join our
							<a href={resolve('/live-trading-rooms/swing-trading-room' as '/')}
								>Swing Trading Room</a
							>
							or our ultra-affordable
							<a href={resolve('/alert-services/explosive-swings' as '/')}>Explosive Swings</a>
							video watchlist alert tier for pre-planned multi-day entries, targets, and stops.
						</p>
					</div>
					<a
						href={resolve('/alert-services/explosive-swings' as '/')}
						class="btn btn-outline-dark btn--full"
					>
						Explore Video Watchlist Alerts
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</a>
				</article>

				<!-- Option 3: Full-Capital Intraday Day Trading Room -->
				<article class="route-card">
					<div>
						<div class="route-card__top">
							<span class="meta-label">Trading a Larger Intraday Account?</span>
						</div>
						<h3 class="route-card__title">Live Day Trading Room</h3>
						<p class="route-card__copy">
							Already trading with larger capital and want our full-throttle intraday floor? Step
							into the
							<a href={resolve('/live-trading-rooms/day-trading-room' as '/')}>Day Trading Room</a>
							or
							<a href={resolve('/alert-services/spx-profit-pulse' as '/')}>SPX Profit Pulse</a>
							for real-time voice, live screen sharing, and institutional order flow.
						</p>
					</div>
					<a
						href={resolve('/live-trading-rooms/day-trading-room' as '/')}
						class="btn btn-outline-dark btn--full"
					>
						Explore the Day Trading Room
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</a>
				</article>
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 7: SMALL ACCOUNTS ROOM FAQ ACCORDION (SEO & AI OVERVIEW OPTIMIZED)
       ========================================================================= -->
	<section id="faq" class="section faq-section" aria-labelledby="small-faq-h2">
		<div class="container faq-container">
			<div class="section-heading">
				<span class="eyebrow">Direct Answers • Zero Hype</span>
				<h2 id="small-faq-h2">Frequently Asked Questions About Growing a $500+ Small Account</h2>
			</div>

			<div class="faq-list">
				{#each SMALL_ACCOUNTS_ROOM_FAQ_ITEMS as item, index (item.id)}
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
				We Are the Present and the Future. We Are the Revolution!
			</h2>
			<p class="body-copy final-banner__copy">
				Stop letting fake gurus convince you to gamble your hard-earned savings on repainted
				indicators and lottery tickets. Build and compound your $500+ account with real
				institutional risk discipline.
			</p>
			<div class="cta-row cta-row--centered">
				<a href={resolve('/contact' as '/')} class="btn btn-dark">
					Join the Small Accounts Room
					<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
				</a>
				<a href={resolve('/alert-services/explosive-swings' as '/')} class="btn btn-outline-dark">
					Explosive Swings Video Watchlist
				</a>
				<a href={resolve('/resources/options-calculator' as '/')} class="btn btn-outline-dark">
					Free Options Risk Calculator
				</a>
			</div>
		</div>
	</section>
</main>

<Footer />
