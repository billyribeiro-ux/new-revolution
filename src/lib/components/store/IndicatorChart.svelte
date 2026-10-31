<!-- src/lib/components/store/IndicatorChart.svelte -->
<script lang="ts">
	import type { IndicatorChartPattern } from '#lib/data/indicators.ts';

	/**
	 * Decorative wireframe of what an indicator plots. Purely illustrative (not market data), so it is
	 * hidden from assistive technology. Colors come from design tokens (no hard-coded hex); the signal
	 * markers pick up the card accent (`--card-accent`, default acid) through `--_accent`.
	 */
	let { pattern }: { pattern: IndicatorChartPattern } = $props();
</script>

<svg
	class="chart"
	viewBox="0 0 320 96"
	width="320"
	height="96"
	aria-hidden="true"
	focusable="false"
>
	{#if pattern === 'reversal'}
		<line class="guide" x1="0" y1="22" x2="320" y2="22" />
		<line class="guide" x1="0" y1="74" x2="320" y2="74" />
		<polyline class="line" points="10,65 55,48 95,54 140,14 175,38 220,58 265,78 305,82" />
		<circle class="marker" cx="140" cy="14" r="5" />
		<rect class="pill" x="94" y="0" width="98" height="18" />
		<text class="pill-text" x="143" y="13">SWEEP TRAP ▼</text>
	{:else if pattern === 'squeeze'}
		<path class="band-line" d="M 10,25 Q 90,44 170,45 T 310,10" />
		<path class="band-line" d="M 10,71 Q 90,52 170,51 T 310,86" />
		<polyline class="line" points="10,50 60,47 110,49 160,48 205,32 255,18 305,12" />
		<circle class="dot" cx="90" cy="48" r="3.5" />
		<circle class="dot" cx="115" cy="48" r="3.5" />
		<circle class="dot" cx="140" cy="48" r="3.5" />
		<circle class="marker" cx="165" cy="48" r="4.5" />
		<rect class="pill" x="170" y="56" width="92" height="18" />
		<text class="pill-text" x="216" y="69">IGNITION ▲</text>
	{:else if pattern === 'levels'}
		<rect class="zone" x="0" y="14" width="320" height="12" />
		<rect class="zone" x="0" y="68" width="320" height="12" />
		<line class="guide guide--solid" x1="0" y1="47" x2="320" y2="47" />
		<polyline class="line" points="12,72 58,47 104,56 156,20 208,45 260,22 308,42" />
		<circle class="marker" cx="12" cy="72" r="4" />
		<circle class="marker" cx="156" cy="20" r="4" />
	{:else}
		<rect class="bar bar--low" x="20" y="58" width="16" height="28" />
		<rect class="bar bar--low" x="52" y="50" width="16" height="36" />
		<rect class="bar bar--low" x="84" y="64" width="16" height="22" />
		<rect class="bar bar--high" x="116" y="28" width="16" height="58" />
		<rect class="bar bar--high" x="148" y="18" width="16" height="68" />
		<rect class="bar bar--mid" x="180" y="34" width="16" height="52" />
		<rect class="bar bar--high" x="212" y="22" width="16" height="64" />
		<rect class="bar bar--high" x="244" y="12" width="16" height="74" />
		<rect class="bar bar--high" x="276" y="26" width="16" height="60" />
		<line class="guide guide--solid" x1="10" y1="42" x2="310" y2="42" />
	{/if}
</svg>

<style>
	.chart {
		display: block;
		inline-size: 100%;
		max-inline-size: 440px; /* the lead card is wide; a larger chart would just scale its labels up */
		margin-inline: auto;
		block-size: auto;
		aspect-ratio: 320 / 96;
		overflow: visible;
	}

	.guide {
		stroke: var(--line-strong);
		stroke-width: 1;
		stroke-dasharray: 4 4;
	}

	.guide--solid {
		stroke: var(--text-secondary);
		stroke-width: 1.5;
		stroke-dasharray: 6 4;
	}

	.band-line {
		fill: none;
		stroke: var(--muted);
		stroke-width: 1.5;
	}

	.line {
		fill: none;
		stroke: var(--text);
		stroke-width: 2.5;
	}

	.zone {
		fill: var(--line);
	}

	.dot,
	.marker,
	.pill {
		fill: var(--_accent, var(--acid));
	}

	.marker {
		stroke: var(--bg);
		stroke-width: 2;
	}

	.pill-text {
		fill: var(--ink);
		font-family: var(--font-display);
		font-size: 11px;
		font-weight: 900;
		text-anchor: middle;
	}

	.bar--low {
		fill: var(--muted);
	}

	.bar--mid {
		fill: var(--text-secondary);
	}

	.bar--high {
		fill: var(--text);
	}
</style>
