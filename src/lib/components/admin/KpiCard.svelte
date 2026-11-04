<script lang="ts">
	import { area, curveBasis, line, max, scaleLinear, select } from 'd3';
	import TrendUpIcon from 'phosphor-svelte/lib/TrendUpIcon';
	import TrendDownIcon from 'phosphor-svelte/lib/TrendDownIcon';
	import type { Snippet } from 'svelte';

	let {
		label = '',
		value = 0,
		previousValue = 0,
		trend,
		suffix = '',
		subtitle = '',
		color = '#c5a059',
		icon,
		sparkData = [],
		sparkDates = [],
		sparkValueLabel = '',
		sparkType = 'area'
	}: {
		label?: string;
		value?: number;
		previousValue?: number;
		/** A server-calculated percentage; null means no comparable prior period. */
		trend?: number | null;
		suffix?: string;
		subtitle?: string;
		color?: string;
		icon?: Snippet;
		sparkData?: number[];
		/**
		 * Optional ISO date strings (`YYYY-MM-DD`) one per `sparkData` point.
		 * When present, hovering the sparkline shows a tooltip with the date
		 * and value. When absent, the sparkline behaves as before (no
		 * interaction). Length must match `sparkData.length` exactly.
		 */
		sparkDates?: string[];
		/**
		 * Singular noun for the tooltip value, e.g. `'view'` or `'visitor'`.
		 * Pluralised by the tooltip ("1 view" / "2 views"). Ignored when
		 * `sparkDates` is empty.
		 */
		sparkValueLabel?: string;
		sparkType?: 'area' | 'bar';
	} = $props();

	// Attachments rerun when the sparkline props read by renderSpark change.
	let sparkEl: SVGSVGElement | undefined;
	let sparkContainerEl: HTMLDivElement | undefined;
	let hoverIdx = $state<number | null>(null);
	const componentId = $props.id();
	const gradientId = `${componentId}-kpi-grad`;
	const sparkW = 120;
	const sparkH = 40;

	/**
	 * Hover-tooltip support is opt-in: pass `sparkDates` AND have at least
	 * 2 points. When this is `true` the sparkline gets a transparent
	 * pointer-capture overlay and a floating tooltip showing the date +
	 * value at the nearest data point. We deliberately DO NOT render a
	 * vertical guide line — the request was for a "just the values"
	 * affordance to mirror the combined chart below it on the analytics
	 * page, but without the line.
	 */
	let hoverEnabled = $derived(sparkDates.length === sparkData.length && sparkData.length > 1);

	let hoveredValue = $derived(
		hoverIdx !== null && hoverIdx >= 0 && hoverIdx < sparkData.length
			? (sparkData[hoverIdx] ?? 0)
			: null
	);
	let hoveredDate = $derived(
		hoverIdx !== null && hoverIdx >= 0 && hoverIdx < sparkDates.length ? sparkDates[hoverIdx] : null
	);

	/**
	 * Map the cursor's pixel-x to the nearest sparkData index. The SVG is
	 * width:100% with viewBox=`0 0 sparkW sparkH`, so we work in CSS pixels
	 * via the container's clientWidth.
	 */
	function handleSparkPointerMove(event: PointerEvent): void {
		if (!hoverEnabled || !sparkContainerEl) return;
		const rect = sparkContainerEl.getBoundingClientRect();
		const ratio = (event.clientX - rect.left) / rect.width;
		const clamped = Math.max(0, Math.min(1, ratio));
		const idx = Math.round(clamped * (sparkData.length - 1));
		hoverIdx = idx;
	}
	function handleSparkPointerLeave(): void {
		hoverIdx = null;
	}

	/**
	 * Format a date string for the tooltip. We accept ISO dates
	 * (`YYYY-MM-DD`) or anything `Date` can parse. Falls back to the raw
	 * string if parsing fails so we never silently render `Invalid Date`.
	 */
	function formatHoverDate(iso: string): string {
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return iso;
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	// Trend calculation
	let trendPct = $derived(
		trend !== undefined
			? Math.round(trend ?? 0)
			: previousValue > 0
				? Math.round(((value - previousValue) / previousValue) * 100)
				: 0
	);

	/**
	 * The displayed figure IS the value. No count-up scrub.
	 *
	 * This used to animate 0 -> value over ~400ms on first paint, driven by a
	 * `$state` + `requestAnimationFrame` loop. On a finance admin that is
	 * actively harmful: the operator watches a figure climb through numbers
	 * that were never true, and for those ~400ms the screen states a
	 * falsehood. It also fought every screenshot and ignored
	 * `prefers-reduced-motion`. A KPI is a fact, not a reveal (2026-07-28).
	 */
	let displayValue = $derived(value);

	/**
	 * D3 sparkline. Renders its final shape immediately, always.
	 *
	 * This took an `animate` flag that ran a line-draw + area-fade + pulse-ring
	 * entrance (~800ms) on first paint. Removed: it is decoration layered over
	 * financial data, it delays the operator reading the trend, and being
	 * D3-driven it ignored `prefers-reduced-motion` entirely (2026-07-28).
	 */
	function renderSpark() {
		if (!sparkEl || sparkData.length < 2) return;

		const svg = select(sparkEl);
		svg.selectAll('*').remove();

		const pad = 2;

		const x = scaleLinear()
			.domain([0, sparkData.length - 1])
			.range([0, sparkW]);

		// `|| 1`, not `?? 1`: an all-zero series has max 0, and a [0, 0] domain makes d3 draw every value mid-range.
		const y = scaleLinear()
			.domain([0, max(sparkData) || 1])
			.range([sparkH - pad, pad]);

		if (sparkType === 'area') {
			// Gradient
			const defs = svg.append('defs');
			const gradient = defs
				.append('linearGradient')
				.attr('id', gradientId)
				.attr('x1', '0')
				.attr('y1', '0')
				.attr('x2', '0')
				.attr('y2', '1');
			gradient
				.append('stop')
				.attr('offset', '0%')
				.attr('stop-color', color)
				.attr('stop-opacity', 0.35);
			gradient
				.append('stop')
				.attr('offset', '100%')
				.attr('stop-color', color)
				.attr('stop-opacity', 0.02);

			const areaPath = area<number>()
				.x((_, i) => x(i))
				.y0(sparkH)
				.y1((d) => y(d))
				.curve(curveBasis);

			const linePath = line<number>()
				.x((_, i) => x(i))
				.y((d) => y(d))
				.curve(curveBasis);

			svg.append('path').datum(sparkData).attr('d', areaPath).attr('fill', `url(#${gradientId})`);

			svg
				.append('path')
				.datum(sparkData)
				.attr('d', linePath)
				.attr('fill', 'none')
				.attr('stroke', color)
				.attr('stroke-width', 1.5)
				.attr('stroke-linecap', 'round');

			const lastVal = sparkData[sparkData.length - 1]!;
			const dotX = x(sparkData.length - 1);
			const dotY = y(lastVal);

			svg.append('circle').attr('cx', dotX).attr('cy', dotY).attr('r', 2.5).attr('fill', color);
		} else {
			// Bar sparkline
			const barWidth = sparkW / sparkData.length - 1;
			const bars = svg
				.selectAll('rect')
				.data(sparkData)
				.join('rect')
				.attr('x', (_, i) => x(i) - barWidth / 2)
				.attr('width', Math.max(barWidth, 2))
				.attr('rx', 1)
				.attr('fill', color)
				.attr('opacity', (_, i) => 0.3 + 0.7 * (i / (sparkData.length - 1)));

			// A true zero is a 1px hairline: present on the axis, never mistaken for a value.
			bars
				.attr('y', (d) => (d > 0 ? y(d) : sparkH - pad - 1))
				.attr('height', (d) => (d > 0 ? sparkH - pad - y(d) : 1));
		}
	}

	function sparkContainerAttach(el: HTMLDivElement) {
		sparkContainerEl = el;
		return () => {
			if (sparkContainerEl === el) sparkContainerEl = undefined;
		};
	}

	function sparkSvgAttach(el: SVGSVGElement) {
		void sparkData;
		void sparkType;
		void color;
		sparkEl = el;
		renderSpark();
		return () => {
			if (sparkEl === el) sparkEl = undefined;
		};
	}

	function fmtDisplay(n: number): string {
		if (n >= 10000) return (n / 1000).toFixed(0) + 'k';
		if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
		return n.toLocaleString();
	}
</script>

<div class="kpi-card" style="--kpi-accent: {color}">
	<div class="kpi-card__accent"></div>
	<div class="kpi-card__header">
		{#if icon}
			<span class="kpi-card__icon">
				{@render icon()}
			</span>
		{/if}
		<span class="kpi-card__label">{label}</span>
	</div>
	<div class="kpi-card__value">
		{fmtDisplay(displayValue)}{#if suffix}<span class="kpi-card__suffix">{suffix}</span>{/if}
	</div>
	<!--
		`role="figure"` is always set because the sparkline IS a chart even
		when not interactive — screen readers should announce it as such.
		The aria-label only carries an interaction hint when hover-tooltips
		are wired up via `sparkDates`.
	-->
	<div
		class={['kpi-card__spark', { 'kpi-card__spark--interactive': hoverEnabled }]}
		{@attach sparkContainerAttach}
		onpointermove={handleSparkPointerMove}
		onpointerleave={handleSparkPointerLeave}
		role="figure"
		aria-label={hoverEnabled
			? `${label}: daily ${sparkValueLabel || 'value'} sparkline; hover for values`
			: `${label} sparkline`}
	>
		{#if sparkData.length > 1}
			<svg
				{@attach sparkSvgAttach}
				viewBox="0 0 {sparkW} {sparkH}"
				preserveAspectRatio="none"
				role="img"
				aria-label="KPI trend sparkline"
			></svg>
		{/if}
		{#if hoverEnabled && hoverIdx !== null && hoveredValue !== null}
			{@const ratio = sparkData.length > 1 ? hoverIdx / (sparkData.length - 1) : 0}
			{@const maxVal = Math.max(1, ...sparkData)}
			{@const yRatio = 1 - hoveredValue / maxVal}
			<!-- Focus dot — sized in CSS so it stays crisp at any container width.
			     Positioned in PERCENT (not viewBox px) because the SVG stretches
			     responsively; using % keeps the dot pinned to the curve point. -->
			<span
				class="kpi-card__spark-dot"
				style="left: {ratio * 100}%; top: {yRatio * 100}%; --kpi-accent: {color};"
				aria-hidden="true"
			></span>
			<!-- Tooltip — anchored to the same %x; flips to the LEFT of the dot
			     when the dot is past 60% of the chart so the bubble stays
			     inside the card. CSS handles the offset above the dot. -->
			<div
				class={['kpi-card__spark-tooltip', { 'kpi-card__spark-tooltip--flip': ratio > 0.6 }]}
				style="left: {ratio * 100}%;"
				role="tooltip"
			>
				<span class="kpi-card__spark-tooltip-date">{formatHoverDate(hoveredDate ?? '')}</span>
				<span class="kpi-card__spark-tooltip-value">
					{hoveredValue.toLocaleString()}
					{sparkValueLabel ? (hoveredValue === 1 ? sparkValueLabel : `${sparkValueLabel}s`) : ''}
				</span>
			</div>
		{/if}
	</div>
	<div class="kpi-card__footer">
		{#if trendPct !== 0}
			<span class={['kpi-card__trend', { up: trendPct > 0, down: trendPct < 0 }]}>
				{#if trendPct > 0}<TrendUpIcon size={12} weight="bold" />{:else}<TrendDownIcon
						size={12}
						weight="bold"
					/>{/if}
				{Math.abs(trendPct)}%
			</span>
		{/if}
		{#if subtitle}
			<span class="kpi-card__sub">{subtitle}</span>
		{/if}
	</div>
</div>

<style>
	.kpi-card {
		position: relative;
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.04) 0%,
			rgba(255, 255, 255, 0.015) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 1rem;
		padding: 1.25rem 1.25rem 0.75rem;
		overflow: hidden;
		/* Border only. The card used to lift 2px and cast a shadow on hover:
		   a KPI is not a button, nothing happens when you click it, and a
		   figure that moves under the cursor is harder to read, not easier
		   (2026-07-28). */
		transition: border-color 0.25s ease;
	}
	.kpi-card:hover {
		border-color: rgba(255, 255, 255, 0.12);
	}
	.kpi-card__accent {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, transparent 0%, var(--kpi-accent) 50%, transparent 100%);
		opacity: 0.6;
	}
	.kpi-card__header {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-bottom: 0.5rem;
	}
	.kpi-card__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--kpi-accent);
		opacity: 0.85;
	}
	.kpi-card__label {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: rgba(255, 255, 255, 0.4);
	}
	.kpi-card__value {
		font-family: var(--font-heading, system-ui);
		font-size: 2rem;
		font-weight: 800;
		color: #fff;
		line-height: 1;
		letter-spacing: -0.03em;
		font-variant-numeric: tabular-nums;
	}
	.kpi-card__suffix {
		font-size: 1.25rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.5);
		margin-left: 0.125rem;
	}
	.kpi-card__spark {
		position: relative;
		height: 40px;
		margin: 0.5rem 0 0.25rem;
	}
	.kpi-card__spark svg {
		width: 100%;
		height: 100%;
		display: block;
	}
	/* When the sparkline accepts hover (sparkDates supplied), the container
	   captures pointer events and shows a value-bubble. Crosshair cursor
	   matches the combined chart below. */
	.kpi-card__spark--interactive {
		cursor: crosshair;
	}
	.kpi-card__spark-dot {
		position: absolute;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--kpi-accent, #c5a059);
		box-shadow:
			0 0 0 2px #131318,
			0 0 0 3px rgba(255, 255, 255, 0.08);
		transform: translate(-50%, -50%);
		pointer-events: none;
		transition:
			left 0.06s linear,
			top 0.06s linear;
	}
	.kpi-card__spark-tooltip {
		position: absolute;
		bottom: calc(100% + 6px);
		display: inline-flex;
		flex-direction: column;
		gap: 0.0625rem;
		padding: 0.375rem 0.5rem;
		background: rgba(15, 15, 20, 0.94);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.375rem;
		backdrop-filter: blur(8px);
		white-space: nowrap;
		pointer-events: none;
		z-index: 5;
		transform: translateX(-50%);
		/* Default anchor = below cursor's x; --flip variant pins the bubble
		   to the LEFT of the dot so it stays inside the card on the right edge. */
	}
	.kpi-card__spark-tooltip--flip {
		transform: translateX(-100%);
	}
	.kpi-card__spark-tooltip-date {
		font-size: 0.65rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.5);
		letter-spacing: 0.02em;
	}
	.kpi-card__spark-tooltip-value {
		font-size: 0.78rem;
		font-weight: 700;
		color: #fff;
		font-variant-numeric: tabular-nums;
	}
	.kpi-card__footer {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 1.125rem;
	}
	.kpi-card__trend {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		font-size: 0.7rem;
		font-weight: 700;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-variant-numeric: tabular-nums;
	}
	.kpi-card__trend.up {
		color: #34d399;
		background: rgba(52, 211, 153, 0.1);
	}
	.kpi-card__trend.down {
		color: #f87171;
		background: rgba(248, 113, 113, 0.1);
	}
	.kpi-card__sub {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.3);
	}
</style>
