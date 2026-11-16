<script lang="ts">
	import { BRAND } from '#lib/config/brand';
	import {
		calculateIntradayMargin,
		type IntradayTradeStructure,
		type MarginAccountMode
	} from '#lib/utils/intraday-margin';

	interface Props {
		headingLevel?: 'h2' | 'h3';
		canonicalPath?: string;
	}

	let { headingLevel = 'h2', canonicalPath = '/resources/intraday-margin-calculator' }: Props =
		$props();

	let accountMode = $state<MarginAccountMode>('margin');
	let structure = $state<IntradayTradeStructure>('long_option_0dte');
	let accountEquity = $state<number>(3500);
	let settledCash = $state<number>(3500);
	let contractOrSharePrice = $state<number>(2.4);
	let spreadWidth = $state<number>(5);
	let stopLossPct = $state<number>(25);
	let maxAccountRiskPct = $state<number>(2);
	let maintenancePct = $state<number>(25);
	let plannedQuantity = $state<number>(2);
	let copiedCitation = $state<boolean>(false);

	const calc = $derived(
		calculateIntradayMargin({
			accountMode,
			structure,
			accountEquity,
			settledCash,
			contractOrSharePrice,
			spreadWidth,
			plannedQuantity,
			maintenancePct,
			stopLossPct,
			maxAccountRiskPct
		})
	);

	const citationHtml = $derived(
		`<a href="${BRAND.domain}${canonicalPath}">FINRA Rule 4210 Intraday Margin &amp; Options Sizing Calculator — ${BRAND.name}</a>`
	);

	async function copyCitation(): Promise<void> {
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			await navigator.clipboard.writeText(
				`<a href="${BRAND.domain}${canonicalPath}">FINRA Rule 4210 Intraday Margin & Options Sizing Calculator — ${BRAND.name}</a>`
			);
			copiedCitation = true;
			setTimeout(() => {
				copiedCitation = false;
			}, 2500);
		}
	}
</script>

<section class="iml-calc" aria-labelledby="iml-calc-heading">
	<header class="iml-calc__header">
		<p class="eyebrow">FINRA REGULATORY NOTICE 26-10 · AMENDED RULE 4210(d)(2) ENGINE</p>
		{#if headingLevel === 'h3'}
			<h3 id="iml-calc-heading" class="iml-calc__title">
				FINRA 2026 Intraday Margin &amp; Asymmetric Position Sizer
			</h3>
		{:else}
			<h2 id="iml-calc-heading" class="iml-calc__title">
				FINRA 2026 Intraday Margin &amp; Asymmetric Position Sizer
			</h2>
		{/if}
		<p class="iml-calc__lead">
			Verify your real-time <strong>Intraday Margin Level (IML)</strong> across 0DTE options, defined-risk
			vertical spreads, or liquid shares — and calculate disciplined contract size from your structural
			invalidation stop.
		</p>
	</header>

	<div class="iml-calc__grid">
		<div class="iml-calc__controls">
			<div class="mode-toggle" role="group" aria-label="Account Mode">
				<button
					type="button"
					class={['mode-btn', { 'is-active': accountMode === 'margin' }]}
					aria-pressed={accountMode === 'margin'}
					onclick={() => (accountMode = 'margin')}
				>
					Margin Account ($2,000+ Floor)
				</button>
				<button
					type="button"
					class={['mode-btn', { 'is-active': accountMode === 'cash' }]}
					aria-pressed={accountMode === 'cash'}
					onclick={() => (accountMode = 'cash')}
				>
					Cash Account ($500+ T+1)
				</button>
			</div>

			<label class="calc-field">
				<span class="calc-field__label">Instrument &amp; Structure</span>
				<select bind:value={structure} autocomplete="off">
					<option value="long_option_0dte">Single-Leg Option / SPX 0DTE (100x)</option>
					<option value="defined_spread">Defined-Risk Vertical Spread (100x)</option>
					<option value="margin_equity">Liquid Stock / ETF Shares (1x)</option>
				</select>
			</label>

			<div class="calc-field-row">
				<label class="calc-field">
					<span class="calc-field__label">Account Equity ($)</span>
					<input type="number" min="100" step="100" autocomplete="off" bind:value={accountEquity} />
				</label>

				{#if accountMode === 'cash'}
					<label class="calc-field">
						<span class="calc-field__label">Settled Cash Available ($)</span>
						<input type="number" min="0" step="100" autocomplete="off" bind:value={settledCash} />
					</label>
				{:else if structure === 'margin_equity'}
					<label class="calc-field">
						<span class="calc-field__label">Broker Intraday Maintenance (%)</span>
						<input
							type="number"
							min="25"
							max="100"
							step="5"
							autocomplete="off"
							bind:value={maintenancePct}
						/>
					</label>
				{/if}
			</div>

			<div class="calc-field-row">
				<label class="calc-field">
					<span class="calc-field__label">
						{structure === 'margin_equity' ? 'Share Entry ($)' : 'Contract / Spread Price ($)'}
					</span>
					<input
						type="number"
						min="0.05"
						step="0.05"
						autocomplete="off"
						bind:value={contractOrSharePrice}
					/>
				</label>

				{#if structure === 'defined_spread'}
					<label class="calc-field">
						<span class="calc-field__label">Strike Width ($)</span>
						<input type="number" min="1" step="1" autocomplete="off" bind:value={spreadWidth} />
					</label>
				{/if}

				<label class="calc-field">
					<span class="calc-field__label">
						Planned {structure === 'margin_equity' ? 'Shares' : 'Contracts'}
					</span>
					<input type="number" min="1" step="1" autocomplete="off" bind:value={plannedQuantity} />
				</label>
			</div>

			<div class="calc-field-row">
				<label class="calc-field">
					<span class="calc-field__label">Structural Invalidation Stop (% Loss)</span>
					<input
						type="number"
						min="5"
						max="100"
						step="5"
						autocomplete="off"
						bind:value={stopLossPct}
					/>
				</label>
				<label class="calc-field">
					<span class="calc-field__label">Max Account Risk Per Setup (%)</span>
					<input
						type="number"
						min="0.25"
						max="10"
						step="0.25"
						autocomplete="off"
						bind:value={maxAccountRiskPct}
					/>
				</label>
			</div>
		</div>

		<div class="iml-calc__results">
			<div class="status-box" data-status={calc.status.code} role="status" aria-live="polite">
				<strong class="status-box__title">{calc.status.label}</strong>
				<p class="status-box__detail">{calc.status.detail}</p>
			</div>

			<dl class="kpi-grid">
				<div class="kpi-tile">
					<dt>Committed Capital / Exposure</dt>
					<dd class="tabular-nums">
						${calc.totalExposure.toLocaleString('en-US', {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2
						})}
					</dd>
				</div>

				<div class="kpi-tile">
					<dt>
						{accountMode === 'cash' ? 'Remaining Settled Cash' : 'Intraday Margin Level (IML)'}
					</dt>
					<dd
						class={[
							'tabular-nums',
							{
								'is-negative':
									(accountMode === 'cash' ? calc.remainingSettledCash : calc.intradayMarginLevel) <
									0
							}
						]}
					>
						${(accountMode === 'cash'
							? calc.remainingSettledCash
							: calc.intradayMarginLevel
						).toLocaleString('en-US', {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2
						})}
					</dd>
				</div>

				<div class="kpi-tile">
					<dt>Rule 4210 De Minimis Cap</dt>
					<dd class="tabular-nums">
						${calc.deMinimisLimit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
					</dd>
				</div>

				<div class="kpi-tile is-highlight">
					<dt>Disciplined Max Size ({maxAccountRiskPct}% Risk)</dt>
					<dd class="tabular-nums">
						{calc.safeMaxUnits}
						{structure === 'margin_equity' ? 'shs' : 'ct'}
						<small>(${calc.maxDollarRiskAllowed.toFixed(0)} max stop loss)</small>
					</dd>
				</div>
			</dl>

			<div class="cite-panel">
				<span class="cite-panel__label">Writers &amp; Educators — Cite This Free Utility:</span>
				<div class="cite-panel__row">
					<code>{citationHtml}</code>
					<button type="button" class="cite-btn" onclick={copyCitation}>
						{copiedCitation ? 'Copied' : 'Copy Link HTML'}
					</button>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.iml-calc {
		background: var(--panel);
		border: 1px solid var(--line-strong);
		padding: clamp(1.25rem, 1.01rem + 1.03vi, 2.25rem);
		color: var(--text);
	}

	.iml-calc__header {
		margin-block-end: 1.75rem;
	}

	.iml-calc__title {
		font-family: var(--font-display);
		font-size: var(--step-h2);
		font-weight: var(--weight-extrabold);
		line-height: var(--leading-section-h2);
		letter-spacing: var(--tracking-section-h2);
		margin: 0.5rem 0 0.75rem;
		color: var(--text);
	}

	.iml-calc__lead {
		font-family: var(--font-sans);
		font-size: var(--step-body);
		line-height: 1.6;
		color: var(--text-secondary);
		max-inline-size: 52rem;
		margin: 0;
	}

	.iml-calc__grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.75rem;
		align-items: start;
	}

	@media (min-width: 1024px) {
		.iml-calc__grid {
			grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
		}
	}

	.iml-calc__controls,
	.iml-calc__results {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.mode-toggle {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.5rem;
		background: var(--bg);
		padding: 0.375rem;
		border: 1px solid var(--line);
	}

	@media (min-width: 480px) {
		.mode-toggle {
			grid-template-columns: 1fr 1fr;
		}
	}

	.mode-btn {
		min-block-size: 44px;
		padding: 0.625rem 0.75rem;
		background: transparent;
		border: 1px solid transparent;
		color: var(--muted);
		font-family: var(--font-display);
		font-size: var(--step-caption);
		font-weight: var(--weight-bold);
		cursor: pointer;
		transition:
			background-color 0.16s var(--ease-out),
			color 0.16s var(--ease-out);
	}

	.mode-btn.is-active,
	.mode-btn[aria-pressed='true'] {
		background: var(--acid);
		color: var(--ink);
	}

	.calc-field-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 10.5rem), 1fr));
		gap: 0.875rem;
	}

	.calc-field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.calc-field__label {
		font-family: var(--font-mono);
		font-size: var(--step-xs);
		font-weight: var(--weight-semibold);
		letter-spacing: 0.03em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.calc-field input,
	.calc-field select {
		min-block-size: 44px;
		background: var(--bg);
		border: 1px solid var(--line-strong);
		padding: 0.625rem 0.75rem;
		color: var(--text);
		font-family: var(--font-mono);
		font-size: var(--step-body);
		font-weight: var(--weight-medium);
		font-variant-numeric: tabular-nums;
	}

	.status-box {
		padding: 1rem 1.125rem;
		background: var(--panel2);
		border: 1px solid var(--line-strong);
		border-inline-start: 4px solid var(--acid);
	}

	.status-box[data-status='WARN'] {
		border-inline-start-color: var(--acid2);
	}

	.status-box[data-status='BLOCK'] {
		border-inline-start-color: var(--coral);
	}

	.status-box__title {
		display: block;
		font-family: var(--font-display);
		font-size: var(--step-body);
		font-weight: var(--weight-bold);
		color: var(--text);
		margin-block-end: 0.35rem;
	}

	.status-box__detail {
		margin: 0;
		font-family: var(--font-sans);
		font-size: var(--step-body-sm);
		line-height: 1.55;
		color: var(--text-secondary);
	}

	.kpi-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr));
		gap: 0.875rem;
		margin: 0;
	}

	.kpi-tile {
		background: var(--bg);
		border: 1px solid var(--line);
		padding: 0.9rem 1rem;
	}

	.kpi-tile.is-highlight {
		border-color: var(--acid);
	}

	.kpi-tile dt {
		font-family: var(--font-mono);
		font-size: var(--step-xs);
		font-weight: var(--weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--muted);
		margin-block-end: 0.375rem;
	}

	.kpi-tile dd {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--step-sub);
		font-weight: var(--weight-extrabold);
		line-height: 1.3;
		color: var(--text);
	}

	.kpi-tile dd.is-negative {
		color: var(--coral);
	}

	.kpi-tile dd small {
		display: block;
		margin-block-start: 0.25rem;
		font-family: var(--font-mono);
		font-size: var(--step-xs);
		font-weight: var(--weight-medium);
		color: var(--muted);
	}

	.cite-panel {
		background: var(--bg);
		border: 1px dashed var(--line-strong);
		padding: 0.875rem 1rem;
	}

	.cite-panel__label {
		display: block;
		font-family: var(--font-mono);
		font-size: var(--step-xs);
		font-weight: var(--weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--muted);
		margin-block-end: 0.5rem;
	}

	.cite-panel__row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.625rem;
		align-items: center;
	}

	.cite-panel__row code {
		flex: 1 1 14rem;
		min-inline-size: 0;
		overflow-x: auto;
		white-space: nowrap;
		font-family: var(--font-mono);
		font-size: var(--step-xs);
		padding: 0.5rem 0.625rem;
		background: var(--panel2);
		border: 1px solid var(--line);
		color: var(--text-secondary);
	}

	.cite-btn {
		min-block-size: 44px;
		padding: 0.5rem 0.875rem;
		background: var(--acid);
		color: var(--ink);
		border: 1px solid var(--acid);
		font-family: var(--font-display);
		font-size: var(--step-xs);
		font-weight: var(--weight-extrabold);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		cursor: pointer;
	}
</style>
