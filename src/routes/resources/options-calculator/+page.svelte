<!-- src/routes/resources/options-calculator/+page.svelte -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import { BRAND } from '#lib/config/brand';
	import { OPTIONS_CALCULATOR_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import { calculateOptionsScenario, type OptionStrategyKind } from '#lib/utils/options-calculator';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let strategy = $state<OptionStrategyKind>('long_call');
	let spotPrice = $state<number>(580);
	let primaryStrike = $state<number>(582);
	let hedgeStrike = $state<number>(590);
	let daysToExpiration = $state<number>(7);
	let impliedVolatilityPct = $state<number>(18);
	let riskFreeRatePct = $state<number>(4.25);
	let contracts = $state<number>(1);
	let entryPriceOverride = $state<number>(0);
	let accountEquity = $state<number>(2500);
	let maxRiskPct = $state<number>(2);
	let stopLossPct = $state<number>(25);
	let copiedCitation = $state<boolean>(false);

	let isSpread = $derived(strategy === 'bull_call_spread' || strategy === 'bear_put_spread');

	let result = $derived(
		calculateOptionsScenario({
			strategy,
			spotPrice,
			primaryStrike,
			hedgeStrike,
			daysToExpiration,
			impliedVolatilityPct,
			riskFreeRatePct,
			contracts,
			entryPriceOverride: entryPriceOverride > 0 ? entryPriceOverride : null,
			accountEquity,
			maxRiskPct,
			stopLossPct
		})
	);

	const CHART_W = 640;
	const CHART_H = 220;
	const PAD_X = 48;
	const PAD_Y = 24;

	let chartCoords = $derived.by(() => {
		const pts = result.samples;
		const minX = pts[0]?.underlyingPrice ?? spotPrice - 10;
		const maxX = pts[pts.length - 1]?.underlyingPrice ?? spotPrice + 10;
		const allY = pts.flatMap((p) => [p.expirationPnl, p.midLifePnl, 0]);
		const minY = Math.min(...allY, -50);
		const maxY = Math.max(...allY, 50);
		const spanX = Math.max(1, maxX - minX);
		const spanY = Math.max(1, maxY - minY);

		const toX = (px: number) => PAD_X + ((px - minX) / spanX) * (CHART_W - PAD_X * 2);
		const toY = (pnl: number) => CHART_H - PAD_Y - ((pnl - minY) / spanY) * (CHART_H - PAD_Y * 2);

		const expLine = pts
			.map((p) => `${toX(p.underlyingPrice).toFixed(1)},${toY(p.expirationPnl).toFixed(1)}`)
			.join(' ');
		const midLine = pts
			.map((p) => `${toX(p.underlyingPrice).toFixed(1)},${toY(p.midLifePnl).toFixed(1)}`)
			.join(' ');

		return {
			expLine,
			midLine,
			zeroY: toY(0),
			beX: Math.min(CHART_W - PAD_X, Math.max(PAD_X, toX(result.breakevenPrice))),
			minX,
			maxX
		};
	});

	let citationSnippet = $derived(
		`<a href="${BRAND.domain}/resources/options-calculator">Black-Scholes Options Profit &amp; Greeks Calculator — ${BRAND.name}</a>`
	);

	async function copyBacklinkHtml(): Promise<void> {
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			await navigator.clipboard.writeText(
				`<a href="${BRAND.domain}/resources/options-calculator">Black-Scholes Options Profit & Greeks Calculator — ${BRAND.name}</a>`
			);
			copiedCitation = true;
			setTimeout(() => {
				copiedCitation = false;
			}, 2500);
		}
	}
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#options-calculator-page">Skip to content</a>

<Navbar />

<main id="options-calculator-page" class="inner-page options-calculator-page">
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true" class="crumb-sep"><CaretRightIcon size={12} weight="bold" /></li>
				<li><a href={resolve('/resources')}>Free Trading Resources</a></li>
				<li aria-hidden="true" class="crumb-sep"><CaretRightIcon size={12} weight="bold" /></li>
				<li aria-current="page">Options Profit &amp; Greeks Calculator</li>
			</ol>
			<p class="breadcrumb-bar__telemetry">
				<span>100% Free Public Utility · $0</span> · <span>Analytical Black-Scholes</span> ·
				<span>Zero Sign-Up Wall</span>
			</p>
		</div>
	</nav>

	<!-- SECTION 1: HERO -->
	<section class="section hero-section" aria-labelledby="opt-calc-h1">
		<div class="container hero-section__grid">
			<div class="hero-section__main">
				<div class="eyebrow-pill">
					<span class="eyebrow-pill__badge">Interactive Utility · $0</span>
					<span class="eyebrow-pill__text">Black-Scholes Greeks · Vertical Spreads · Sizing</span>
				</div>

				<hgroup>
					<p class="hero-h1__seo-kicker seo-kicker">
						Options Profit, Breakeven &amp; Greeks Calculator
					</p>
					<h1 id="opt-calc-h1" class="hero-h1">
						<span class="hero-h1__display">
							Model Delta, Daily Theta Bleed &amp; Small-Account Risk Before You Route an Order.
						</span>
					</h1>
				</hgroup>

				<p class="lead-copy">
					Calling the structural direction on a chart is half the battle — overpaying for implied
					volatility or holding a short-dated option through midday theta bleed turns right theses
					into losing fills. Simulate single-leg calls/puts and defined-risk vertical spreads below
					with zero registration wall.
				</p>
			</div>
		</div>
	</section>

	<!-- SECTION 2: INTERACTIVE BLACK-SCHOLES WORKBENCH -->
	<section class="section calls-section" aria-labelledby="workbench-h2">
		<div class="container">
			<div class="opt-workbench">
				<div class="opt-controls">
					<h2 id="workbench-h2" class="opt-panel-title">01 · Contract &amp; Risk Parameters</h2>

					<div class="opt-strategy-pills" role="group" aria-label="Option Strategy">
						{#each [['long_call', 'Long Call'], ['long_put', 'Long Put'], ['bull_call_spread', 'Bull Call Spread'], ['bear_put_spread', 'Bear Put Spread']] as [id, label] (id)}
							<button
								type="button"
								class={['opt-pill', { 'is-active': strategy === id }]}
								aria-pressed={strategy === id}
								onclick={() => (strategy = id as OptionStrategyKind)}
							>
								{label}
							</button>
						{/each}
					</div>

					<div class="opt-input-grid">
						<label class="opt-field">
							<span>Spot / Index Price ($)</span>
							<input type="number" min="1" step="0.5" bind:value={spotPrice} />
						</label>
						<label class="opt-field">
							<span>Primary Strike ($)</span>
							<input type="number" min="1" step="0.5" bind:value={primaryStrike} />
						</label>
						{#if isSpread}
							<label class="opt-field">
								<span>Short Hedge Strike ($)</span>
								<input type="number" min="1" step="0.5" bind:value={hedgeStrike} />
							</label>
						{/if}
						<label class="opt-field">
							<span>Days to Expiration (0 = 0DTE)</span>
							<input type="number" min="0" max="730" step="1" bind:value={daysToExpiration} />
						</label>
						<label class="opt-field">
							<span>Implied Volatility (%)</span>
							<input type="number" min="5" max="250" step="1" bind:value={impliedVolatilityPct} />
						</label>
						<label class="opt-field">
							<span>Contracts Quantity</span>
							<input type="number" min="1" max="500" step="1" bind:value={contracts} />
						</label>
						<label class="opt-field">
							<span>Custom Entry Debit ($, 0 = Auto BS)</span>
							<input type="number" min="0" step="0.05" bind:value={entryPriceOverride} />
						</label>
						<label class="opt-field">
							<span>Account Equity ($)</span>
							<input type="number" min="100" step="100" bind:value={accountEquity} />
						</label>
						<label class="opt-field">
							<span>Max Account Risk / Trade (%)</span>
							<input type="number" min="0.5" max="20" step="0.5" bind:value={maxRiskPct} />
						</label>
						<label class="opt-field">
							<span>Planned Stop-Loss (% of Debit)</span>
							<input type="number" min="5" max="100" step="5" bind:value={stopLossPct} />
						</label>
					</div>
				</div>

				<div class="opt-telemetry" aria-live="polite">
					<h2 class="opt-panel-title">02 · Live Payoff, Greeks &amp; Position Sizing</h2>

					<div class="opt-kpi-grid tabular-nums">
						<div class="opt-kpi">
							<span class="opt-kpi__label">Est. Unit Debit</span>
							<strong class="opt-kpi__val">${result.unitDebit.toFixed(2)}</strong>
							<span class="opt-kpi__sub"
								>${result.totalCommittedCapital.toFixed(0)} total outlay</span
							>
						</div>
						<div class="opt-kpi">
							<span class="opt-kpi__label">Expiration Breakeven</span>
							<strong class="opt-kpi__val">${result.breakevenPrice.toFixed(2)}</strong>
							<span class="opt-kpi__sub">Underlying target to clear debit</span>
						</div>
						<div class="opt-kpi">
							<span class="opt-kpi__label">Stop-Out Risk ({stopLossPct}%)</span>
							<strong class="opt-kpi__val">${result.stopLossUsd.toFixed(2)}</strong>
							<span class="opt-kpi__sub">Max loss cap: ${result.maxLossUsd.toFixed(0)}</span>
						</div>
						<div class="opt-kpi">
							<span class="opt-kpi__label">Max Safe Contracts</span>
							<strong class="opt-kpi__val">{result.recommendedMaxContracts}</strong>
							<span class="opt-kpi__sub">
								Within ${result.maxAccountRiskUsd.toFixed(0)} ({maxRiskPct}% budget)
							</span>
						</div>
					</div>

					<div class="opt-greeks-bar tabular-nums">
						<div>
							<span>Delta (Δ)</span>
							<strong>{result.greeks.delta.toFixed(3)}</strong>
						</div>
						<div>
							<span>Gamma (Γ)</span>
							<strong>{result.greeks.gamma.toFixed(4)}</strong>
						</div>
						<div>
							<span>Theta / Day (Θ)</span>
							<strong>${(result.greeks.thetaPerDay * 100 * contracts).toFixed(2)}</strong>
						</div>
						<div>
							<span>Vega / 1% IV (ν)</span>
							<strong>${(result.greeks.vegaPerPct * 100 * contracts).toFixed(2)}</strong>
						</div>
						<div>
							<span>Max Profit</span>
							<strong>
								{result.maxProfitUsd === null ? 'Uncapped' : `$${result.maxProfitUsd.toFixed(0)}`}
							</strong>
						</div>
					</div>

					<figure class="opt-chart-box">
						<svg
							viewBox={`0 0 ${CHART_W} ${CHART_H}`}
							role="img"
							aria-label="Options expiration and mid-life profit and loss curve across underlying prices"
						>
							<rect x="0" y="0" width={CHART_W} height={CHART_H} fill="#0e1318" />
							<line
								x1={PAD_X}
								y1={chartCoords.zeroY}
								x2={CHART_W - PAD_X}
								y2={chartCoords.zeroY}
								stroke="#3e4852"
								stroke-dasharray="4 4"
							/>
							<line
								x1={chartCoords.beX}
								y1={PAD_Y}
								x2={chartCoords.beX}
								y2={CHART_H - PAD_Y}
								stroke="#dcff65"
								stroke-dasharray="3 3"
							/>
							<polyline
								fill="none"
								stroke="#8be9fd"
								stroke-width="2"
								points={chartCoords.midLine}
							/>
							<polyline
								fill="none"
								stroke="#dcff65"
								stroke-width="2.5"
								points={chartCoords.expLine}
							/>
							<text x={PAD_X} y={CHART_H - 6} fill="#9aa3ab" font-size="11">
								${chartCoords.minX.toFixed(1)}
							</text>
							<text x={CHART_W - PAD_X - 48} y={CHART_H - 6} fill="#9aa3ab" font-size="11">
								${chartCoords.maxX.toFixed(1)}
							</text>
							<text x={PAD_X + 6} y={PAD_Y + 10} fill="#dcff65" font-size="11" font-weight="700">
								Lime: Expiration P&amp;L · Cyan: Mid-Life (50% DTE)
							</text>
						</svg>
						<figcaption>
							Simulated analytical Black-Scholes payoff (excludes brokerage commissions, live
							bid-ask slippage, and early assignment; see <a href={resolve('/risk-disclosure')}
								>CFTC Rule 4.41 notice</a
							>).
						</figcaption>
					</figure>

					<div class="cite-box">
						<div class="cite-box__head">
							<span>Cite or Link to This Free Public Utility:</span>
							<button type="button" class="cite-btn" onclick={copyBacklinkHtml}>
								{copiedCitation ? 'Copied HTML Link' : 'Copy Citation HTML'}
							</button>
						</div>
						<code>{citationSnippet}</code>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- SECTION 3: FAQ + HUB-AND-SPOKE CTA -->
	<section class="section faq-section" aria-labelledby="opt-faq-h2">
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Options Math &amp; Greeks FAQ</span>
				<h2 id="opt-faq-h2">Questions About Options Greeks, Spreads &amp; Small-Account Sizing</h2>
			</div>

			<div class="faq-list">
				{#each OPTIONS_CALCULATOR_FAQ_ITEMS as item, index (item.id)}
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

	<section class="section final-banner" aria-labelledby="opt-final-h2">
		<div class="container final-banner__inner">
			<span class="eyebrow">Pair Options Math With Pure Price Structure</span>
			<h2 id="opt-final-h2" class="final-banner__h2">
				Check Your FINRA 2026 Intraday Margin or Watch Live Structural Execution.
			</h2>
			<div class="cta-row opt-cta-row">
				<a href={resolve('/resources/intraday-margin-calculator')} class="btn btn-dark">
					<span>FINRA 2026 Margin Calculator</span>
					<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
				</a>
				<a href={resolve('/alert-services/spx-profit-pulse')} class="btn btn-outline-dark">
					SPX Profit Pulse Blueprints
				</a>
				<a href={resolve('/live-trading-rooms/day-trading-room')} class="btn btn-outline-dark">
					Live Day Trading Room
				</a>
				<a href={resolve('/live-trading-rooms/swing-trading-room')} class="btn btn-outline-dark">
					Swing Trading Room
				</a>
				<a href={resolve('/live-trading-rooms/small-accounts-room')} class="btn btn-outline-dark">
					Small Accounts Room ($500+)
				</a>
			</div>
		</div>
	</section>
</main>

<Footer />

<style>
	.opt-workbench {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
		gap: 1.5rem;
		align-items: start;
	}

	.opt-controls,
	.opt-telemetry {
		padding: clamp(1.25rem, 2.5vw, 1.75rem);
		background: #141a20;
		border: 1px solid #2f3740;
	}

	.opt-panel-title {
		margin: 0 0 1rem;
		font-family: var(--font-display);
		font-weight: var(--weight-bold);
		font-size: var(--step-h3);
		line-height: var(--leading-card-h3);
		color: var(--text);
	}

	.opt-strategy-pills {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.5rem;
		margin-block-end: 1.15rem;
	}

	.opt-pill {
		padding: 0.65rem 0.75rem;
		background: #0f1419;
		border: 1px solid #2d353e;
		color: var(--text-secondary);
		font-family: var(--font-mono);
		font-weight: var(--weight-semibold);
		font-size: 0.75rem;
		line-height: 1.35;
		cursor: pointer;
	}

	.opt-pill.is-active {
		background: var(--acid);
		border-color: var(--acid);
		color: var(--ink);
		font-weight: var(--weight-bold);
	}

	.opt-input-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr));
		gap: 0.85rem;
	}

	.opt-field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.opt-field span {
		font-family: var(--font-mono);
		font-weight: var(--weight-semibold);
		font-size: 0.75rem;
		line-height: 1.4;
		color: var(--muted);
	}

	.opt-field input {
		padding: 0.6rem 0.75rem;
		background: #0d1217;
		border: 1px solid #333c45;
		color: var(--text);
		font-family: var(--font-mono);
		font-size: var(--step-sm);
		line-height: 1.4;
	}

	.opt-kpi-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
		margin-block-end: 1rem;
	}

	.opt-kpi {
		padding: 0.85rem 1rem;
		background: #0e1318;
		border: 1px solid #2a323a;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.opt-kpi__label {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		line-height: 1.4;
		color: var(--muted);
		text-transform: uppercase;
	}

	.opt-kpi__val {
		font-family: var(--font-display);
		font-weight: var(--weight-bold);
		font-size: var(--step-h3);
		line-height: 1.25;
		color: var(--acid);
	}

	.opt-kpi__sub {
		font-size: 0.75rem;
		line-height: 1.4;
		color: var(--text-secondary);
	}

	.opt-greeks-bar {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 6.5rem), 1fr));
		gap: 0.5rem;
		padding: 0.75rem;
		margin-block-end: 1rem;
		background: #0e1318;
		border: 1px solid #2a323a;
	}

	.opt-greeks-bar div {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.opt-greeks-bar span {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		line-height: 1.35;
		color: var(--muted);
	}

	.opt-greeks-bar strong {
		font-family: var(--font-mono);
		font-weight: var(--weight-bold);
		font-size: var(--step-sm);
		line-height: 1.4;
		color: var(--text);
	}

	.opt-chart-box {
		margin: 0 0 1rem;
	}

	.opt-chart-box svg {
		display: block;
		inline-size: 100%;
		block-size: auto;
		border: 1px solid #2a323a;
	}

	.opt-chart-box figcaption {
		margin-block-start: 0.5rem;
		font-size: 0.75rem;
		line-height: 1.55;
		color: var(--muted);
	}

	.opt-chart-box figcaption a {
		color: var(--acid);
		text-decoration: underline;
	}

	.cite-box {
		padding: 0.85rem 1rem;
		background: #0d1217;
		border: 1px solid #2b333c;
	}

	.cite-box__head {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		margin-block-end: 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		line-height: 1.4;
		color: var(--muted);
	}

	.cite-btn {
		padding: 0.35rem 0.7rem;
		background: var(--acid);
		border: 0;
		color: var(--ink);
		font-family: var(--font-mono);
		font-weight: var(--weight-bold);
		font-size: 0.75rem;
		line-height: 1.3;
		cursor: pointer;
	}

	.cite-box code {
		display: block;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		line-height: 1.5;
		color: var(--text-secondary);
		overflow-wrap: anywhere;
	}

	.opt-cta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.opt-cta-row :global(.btn) {
		inline-size: auto;
	}
</style>
