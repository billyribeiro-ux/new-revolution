<script lang="ts">
	import { max, scaleLinear, select } from 'd3';

	interface DayData {
		date: string; // YYYY-MM-DD
		value: number;
	}

	interface Props {
		data: DayData[];
		weeks?: number;
	}

	let { data, weeks = 26 }: Props = $props();

	let svgEl: SVGSVGElement | undefined;
	let tooltipEl: HTMLDivElement | undefined;

	const cellSize = 13;
	const cellGap = 3;
	const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
	const labelW = 28;
	const noDataFill = 'rgba(255,255,255,0.015)';

	/**
	 * Key a cell by its LOCAL calendar date. Date#toISOString converts to
	 * UTC first, so for any operator west of UTC every cell looked up the
	 * previous day's bucket and the whole heatmap shifted by one day
	 * (audit 2026-06-11).
	 */
	function localDateKey(d: Date): string {
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${y}-${m}-${day}`;
	}

	function render() {
		if (!svgEl) return;

		const svg = select(svgEl);
		svg.selectAll('*').remove();

		const today = new Date();
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- transient local, not reactive state
		const startDate = new Date(today);
		startDate.setDate(startDate.getDate() - weeks * 7);
		startDate.setDate(startDate.getDate() - startDate.getDay()); // Align to Sunday

		// Build a map of date -> value
		const map = new Map(data.map((d) => [d.date, d.value]));
		const maxVal = max(data, (d) => d.value) ?? 1;
		// Earliest bucket the caller actually fetched. The series is dense
		// (gap-filled) inside the selected range, so anything older was
		// never queried: render it as "no data", never as a fake zero.
		const minDate =
			data.length > 0 ? data.reduce((m, d) => (d.date < m ? d.date : m), data[0]!.date) : null;

		// Color scale (dark theme)
		const colorScale = scaleLinear<string>()
			.domain([0, maxVal * 0.25, maxVal * 0.5, maxVal])
			.range(['rgba(255,255,255,0.04)', '#2d4a22', '#5a8a3c', '#86efac'])
			.clamp(true);

		const w = labelW + weeks * (cellSize + cellGap) + 8;
		const h = 7 * (cellSize + cellGap) + 30;
		svg.attr('width', w).attr('height', h);

		// Day labels (Mon, Wed, Fri)
		const g = svg.append('g').attr('transform', `translate(0, 22)`);
		dayLabels.forEach((label, i) => {
			if (!label) return;
			g.append('text')
				.attr('x', labelW - 6)
				.attr('y', i * (cellSize + cellGap) + cellSize - 2)
				.attr('text-anchor', 'end')
				.attr('fill', 'rgba(255,255,255,0.3)')
				.attr('font-size', '9px')
				.text(label);
		});

		// Month labels
		let lastMonth = -1;
		const cellsG = g.append('g').attr('transform', `translate(${labelW}, 0)`);

		// Generate day cells
		const totalDays = weeks * 7;
		for (let d = 0; d < totalDays; d++) {
			// eslint-disable-next-line svelte/prefer-svelte-reactivity -- transient local, not reactive state
			const date = new Date(startDate);
			date.setDate(startDate.getDate() + d);
			if (date > today) continue;

			const weekIdx = Math.floor(d / 7);
			const dayIdx = d % 7;
			const dateStr = localDateKey(date);
			// Cells older than the fetched window have no data, which is not
			// the same thing as zero views.
			const hasData = minDate !== null && dateStr >= minDate;
			const val = hasData ? (map.get(dateStr) ?? 0) : 0;

			// Month label (first occurrence of a new month in row 0)
			if (dayIdx === 0 && date.getMonth() !== lastMonth) {
				lastMonth = date.getMonth();
				cellsG
					.append('text')
					.attr('x', weekIdx * (cellSize + cellGap))
					.attr('y', -6)
					.attr('fill', 'rgba(255,255,255,0.35)')
					.attr('font-size', '9px')
					.text(date.toLocaleString('default', { month: 'short' }));
			}

			const dateLabel = date.toLocaleDateString('en-US', {
				weekday: 'short',
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			});
			const tooltipHtml = hasData
				? `<strong>${val.toLocaleString()} views</strong><br/>${dateLabel}`
				: `<strong>no data</strong> (outside selected range)<br/>${dateLabel}`;

			cellsG
				.append('rect')
				.attr('x', weekIdx * (cellSize + cellGap))
				.attr('y', dayIdx * (cellSize + cellGap))
				.attr('width', cellSize)
				.attr('height', cellSize)
				.attr('rx', 2.5)
				.attr('fill', hasData ? (val > 0 ? colorScale(val) : 'rgba(255,255,255,0.04)') : noDataFill)
				.attr('stroke', hasData ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)')
				.attr('stroke-width', 0.5)
				.style('cursor', 'pointer')
				.on('mouseenter', function (event: MouseEvent) {
					select(this).attr('stroke', 'rgba(255,255,255,0.3)').attr('stroke-width', 1.5);
					if (tooltipEl) {
						// Content first: offsetWidth/Height are only meaningful once the
						// tooltip has its markup and is displayed.
						tooltipEl.innerHTML = tooltipHtml;
						tooltipEl.style.display = 'block';

						// Clamp to the container on BOTH axes. This had no clamping at
						// all: cells in the rightmost weeks pushed the tooltip past the
						// right edge, and the top row drove `offsetY - 30` negative, so it
						// rendered above the chart. Same defect class as the area chart's
						// unclamped `top` (2026-07-28 audit).
						const host = tooltipEl.parentElement;
						const maxLeft = (host?.clientWidth ?? 0) - tooltipEl.offsetWidth;
						const maxTop = (host?.clientHeight ?? 0) - tooltipEl.offsetHeight;
						const left = Math.max(0, Math.min(event.offsetX + 10, Math.max(0, maxLeft)));
						const top = Math.max(0, Math.min(event.offsetY - 30, Math.max(0, maxTop)));
						tooltipEl.style.left = `${left}px`;
						tooltipEl.style.top = `${top}px`;
					}
				})
				.on('mouseleave', function () {
					select(this)
						.attr('stroke', hasData ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)')
						.attr('stroke-width', 0.5);
					if (tooltipEl) tooltipEl.style.display = 'none';
				});
		}

		// Legend
		const legend = svg.append('g').attr('transform', `translate(${w - 130}, ${h - 12})`);
		legend
			.append('text')
			.attr('x', 0)
			.attr('y', 5)
			.attr('fill', 'rgba(255,255,255,0.3)')
			.attr('font-size', '9px')
			.text('Less');
		const legendSteps = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];
		legendSteps.forEach((v, i) => {
			legend
				.append('rect')
				.attr('x', 28 + i * (cellSize + 2))
				.attr('y', -3)
				.attr('width', cellSize - 1)
				.attr('height', cellSize - 1)
				.attr('rx', 2)
				.attr('fill', colorScale(v));
		});
		legend
			.append('text')
			.attr('x', 28 + legendSteps.length * (cellSize + 2) + 4)
			.attr('y', 5)
			.attr('fill', 'rgba(255,255,255,0.3)')
			.attr('font-size', '9px')
			.text('More');
	}

	function chart(wrap: HTMLDivElement) {
		svgEl = wrap.querySelector<SVGSVGElement>('svg') ?? undefined;
		tooltipEl = wrap.querySelector<HTMLDivElement>('.heatmap-tooltip') ?? undefined;

		$effect(() => {
			void data;
			void weeks;
			render();
		});

		return () => {
			svgEl = undefined;
			tooltipEl = undefined;
		};
	}
</script>

<div class="heatmap-wrap" {@attach chart}>
	<svg role="img" aria-label="Activity heatmap"></svg>
	<div class="heatmap-tooltip"></div>
</div>

<style>
	.heatmap-wrap {
		position: relative;
		overflow-x: auto;
		padding-block: 0.25rem;
	}
	.heatmap-tooltip {
		display: none;
		position: absolute;
		background: #1a1a1a;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 6px;
		padding: 0.4rem 0.6rem;
		font-size: 0.72rem;
		color: #fff;
		pointer-events: none;
		z-index: 10;
		white-space: nowrap;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
	}
</style>
