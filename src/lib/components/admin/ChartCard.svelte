<!--
@component
ChartCard — the single source of truth for an admin chart panel.

Before this existed there were TWO of them: `.chart-card` on /admin and
`.an-chart-card` on /admin/analytics. Same design, two CSS blocks, and they
drifted exactly the way duplicated definitions always do. `.chart-card` carried
`overflow: hidden` for its rounded corners, which clipped the D3AreaChart hover
tooltip at the card edge. The dashboard grid renders that chart ~124px wide, so
the tooltip is WIDER than the chart and has to float over the card to be legible
at all: on /admin it was cut mid-word, on /admin/analytics the identical
component read fine (2026-07-28 audit).

The rule the duplication kept losing: a chart panel MUST NOT clip its children.
Hover tooltips, focus rings and dropdowns all need to escape the box. Rounded
corners come from `border-radius` on the background alone; nothing here needs
`overflow` to look right.

Props:
  - `title`:    Panel heading text.
  - `icon`:     Optional snippet rendered before the title (a phosphor icon).
  - `meta`:     Optional snippet rendered at the right of the header (legend,
                total, badge).
  - `children`: The chart itself.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		icon,
		meta,
		children
	}: {
		title: string;
		icon?: Snippet;
		meta?: Snippet;
		children: Snippet;
	} = $props();
</script>

<div class="chart-card">
	<div class="chart-card__hd">
		<h3 class="chart-card__title">
			{#if icon}{@render icon()}{/if}
			{title}
		</h3>
		{#if meta}
			<div class="chart-card__meta">{@render meta()}</div>
		{/if}
	</div>
	{@render children()}
</div>

<style>
	.chart-card {
		margin-top: 1.25rem;
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.035) 0%,
			rgba(255, 255, 255, 0.015) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 1rem;
		padding: 1.25rem;
		position: relative;
		transition: border-color 0.25s ease;
		/* Deliberately NO `overflow`. See the component doc above: clipping here
		   is what cut the chart tooltip off on /admin. Do not add it back to
		   "fix" a rounded corner. */
	}
	.chart-card:hover {
		border-color: rgba(255, 255, 255, 0.1);
	}
	.chart-card__hd {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
		flex-wrap: wrap;
	}
	.chart-card__title {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		margin: 0;
		font-size: 0.9rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.85);
	}
	.chart-card__meta {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.45);
	}
</style>
