<!-- src/lib/components/store/IndicatorCard.svelte -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon';
	import ShieldCheckIcon from 'phosphor-svelte/lib/ShieldCheckIcon';
	import SlidersHorizontalIcon from 'phosphor-svelte/lib/SlidersHorizontalIcon';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';
	import CatalogCard from '#lib/components/ui/CatalogCard.svelte';
	import type { IndicatorProduct } from '#lib/data/indicators.ts';
	import IndicatorChart from './IndicatorChart.svelte';

	/**
	 * One indicator in the catalog, built on the shared CatalogCard shell (whole-card click through the
	 * title link, focus ring, hover, footer CTA, breakpoints). This component owns indicator content only.
	 * The technical specs are a native <details>, so they are in the server-rendered HTML.
	 * Theming: `--card-accent` on a parent. `indicator.featured` needs a host that gives it two columns from 768px.
	 */
	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'class' | 'title'> {
		indicator: IndicatorProduct;
		headingLevel?: 2 | 3 | 4;
		class?: ClassValue;
	}

	let { indicator, headingLevel = 3, class: className, ...rest }: Props = $props();

	// Typed against the route manifest: a wrong param key fails `pnpm check`.
	const detailHref = $derived(resolve('/store/indicators/[slug]', { slug: indicator.slug }));
	const platforms = $derived(indicator.platforms.split(' • '));
</script>

<CatalogCard
	{...rest}
	id={indicator.id}
	class={['indicator-card', className]}
	{headingLevel}
	featured={indicator.featured}
>
	{#snippet top()}
		<div class="indicator-card__head">
			<p class="indicator-card__code">{indicator.codeName}</p>
			<span class="indicator-card__badge">
				<ShieldCheckIcon size={14} weight="bold" aria-hidden="true" />
				Zero Repaint
			</span>
		</div>
		<IndicatorChart pattern={indicator.chartPattern} />
		<ul class="indicator-card__platforms" aria-label="Supported platforms">
			{#each platforms as platform (platform)}
				<li>{platform}</li>
			{/each}
		</ul>
	{/snippet}

	{#snippet eyebrow()}{indicator.categoryLabel}{/snippet}

	{#snippet title()}
		<a class="catalog-card__link" href={detailHref}>{indicator.name}</a>
	{/snippet}

	{#snippet intro()}
		<p class="indicator-card__hook">{indicator.hook}</p>
	{/snippet}

	<div class="indicator-card__exposes">
		<strong>What It Exposes</strong>
		<p>{indicator.whatItExposes}</p>
	</div>

	<details class="indicator-card__specs" open={indicator.featured}>
		<summary>
			<SlidersHorizontalIcon size={18} weight="bold" aria-hidden="true" />
			<span>View technical specs</span>
			<CaretDownIcon class="indicator-card__caret" size={16} weight="bold" aria-hidden="true" />
		</summary>
		<dl class="indicator-card__spec-list">
			<div>
				<dt>Supported timeframes</dt>
				<dd>{indicator.timeframes}</dd>
			</div>
			<div>
				<dt>Ideal trader fit</dt>
				<dd>{indicator.bestFor}</dd>
			</div>
			<div>
				<dt>Execution standard</dt>
				<dd>100% non-repainting • Includes setup guide &amp; alert triggers</dd>
			</div>
		</dl>
	</details>
</CatalogCard>

<style>
	/* Indicator content only; layout, hover, focus and the CTA live in CatalogCard. */
	.indicator-card__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px 12px;
		flex-wrap: wrap;
	}

	.indicator-card__code {
		margin: 0;
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--_muted);
	}

	.indicator-card__badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		border: 1px solid color-mix(in srgb, var(--_accent) 40%, var(--_line-strong));
		background: color-mix(in srgb, var(--_accent) 10%, transparent);
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--_accent-text);
	}

	.indicator-card__platforms {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.indicator-card__platforms li {
		padding: 4px 10px;
		border: 1px solid var(--_line-strong);
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.75rem;
		line-height: 1.2;
		letter-spacing: 0.03em;
		color: var(--_text-2);
	}

	.indicator-card__hook {
		margin: 0;
		font-family: var(--font-sans);
		font-weight: 600;
		font-size: 1rem;
		line-height: 1.5;
		color: var(--_text);
		text-wrap: pretty;
	}

	.indicator-card__exposes {
		padding: 12px 14px;
		border-inline-start: 3px solid var(--_accent);
		background: var(--_inset);
	}

	.indicator-card__exposes strong {
		display: block;
		margin-block-end: 4px;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--_accent-text);
	}

	.indicator-card__exposes p {
		margin: 0;
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		line-height: 1.5;
		color: var(--_text-2);
	}

	/* ---- specs (native disclosure) ---- */
	.indicator-card__specs {
		position: relative; /* above the stretched link */
		z-index: 1;
		border: 1px solid var(--_line-strong);
		background: var(--_inset);
	}

	.indicator-card__specs summary {
		display: flex;
		align-items: center;
		gap: 10px;
		min-block-size: 48px;
		padding: 8px 14px;
		cursor: pointer;
		list-style: none;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.8125rem;
		letter-spacing: 0.03em;
		color: var(--_text);
	}

	.indicator-card__specs summary::-webkit-details-marker {
		display: none;
	}

	.indicator-card__specs summary > span {
		flex: 1;
	}

	.indicator-card__specs summary :global(.indicator-card__caret) {
		flex-shrink: 0;
		color: var(--_muted);
		transition: transform 0.2s var(--ease-out);
	}

	.indicator-card__specs[open] {
		border-color: color-mix(in srgb, var(--_accent) 50%, var(--_line-strong));
	}

	.indicator-card__specs[open] summary :global(.indicator-card__caret) {
		transform: rotate(180deg);
	}

	.indicator-card__spec-list {
		display: grid;
		gap: 12px;
		margin: 0;
		padding: 4px 14px 16px;
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		line-height: 1.45;
	}

	.indicator-card__spec-list dt {
		margin-block-end: 2px;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--_accent-text);
	}

	.indicator-card__spec-list dd {
		margin: 0;
		color: var(--_text-2);
	}

	@media (min-width: 768px) {
		:global(.catalog-card.is-featured) .indicator-card__hook {
			font-size: 1.0625rem;
		}
	}
</style>
