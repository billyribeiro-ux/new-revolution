<script lang="ts">
	import {
		area,
		axisBottom,
		axisLeft,
		bisector,
		curveMonotoneX,
		easeCubicOut,
		extent,
		line,
		max,
		pointer,
		scaleLinear,
		scaleTime,
		select,
		timeFormat,
		timeParse
	} from 'd3';

	type DataPoint = { date: string; views: number; visitors: number };

	let {
		data = [],
		height = 220,
		seriesLabels = { views: 'views', visitors: 'visitors' }
	}: {
		data?: DataPoint[];
		height?: number;
		seriesLabels?: { views: string; visitors: string };
	} = $props();

	// The attachment reruns when chart data or dimensions change.
	let containerEl: HTMLDivElement | undefined;
	let svgEl: SVGSVGElement | undefined;
	let tooltipEl: HTMLDivElement | undefined;
	let chartWidth = 600;

	// Unique gradient IDs per instance to prevent SVG ID collisions
	const uid = Math.random().toString(36).slice(2, 8);
	const viewsGradId = `chartViewsGrad-${uid}`;
	const visitorsGradId = `chartVisitorsGrad-${uid}`;

	const margin = { top: 12, right: 16, bottom: 28, left: 42 };

	function render(animate = true) {
		if (!svgEl || !containerEl) return;

		const svg = select(svgEl);
		svg.selectAll('*').interrupt().remove();
		if (tooltipEl) tooltipEl.style.opacity = '0';
		if (data.length < 2) return;

		chartWidth = containerEl.clientWidth;
		const w = chartWidth - margin.left - margin.right;
		const h = height - margin.top - margin.bottom;

		svg.attr('width', chartWidth).attr('height', height);

		const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

		// Scales
		const parseDate = timeParse('%Y-%m-%d');
		const dates = data.map((d) => parseDate(d.date) ?? new Date(d.date));

		const x = scaleTime()
			.domain(extent(dates) as [Date, Date])
			.range([0, w]);
		const maxVal = Math.max(1, max(data, (d) => Math.max(d.views, d.visitors)) ?? 0);
		const y = scaleLinear()
			.domain([0, maxVal * 1.1])
			.range([h, 0])
			.nice();

		// Grid lines
		const yTicks = y.ticks(5);
		g.selectAll('.grid-line')
			.data(yTicks)
			.join('line')
			.attr('class', 'grid-line')
			.attr('x1', 0)
			.attr('x2', w)
			.attr('y1', (d) => y(d))
			.attr('y2', (d) => y(d))
			.attr('stroke', 'rgba(255,255,255,0.04)')
			.attr('stroke-dasharray', '3,3');

		// Y axis
		g.append('g')
			.call(
				axisLeft(y)
					.ticks(5)
					.tickFormat((d) => {
						const n = d as number;
						return n >= 1000 ? `${(n / 1000).toFixed(0)}k` : String(n);
					})
					.tickSize(0)
			)
			.call((sel) => sel.select('.domain').remove())
			.selectAll('text')
			.attr('fill', 'rgba(255,255,255,0.25)')
			.attr('font-size', '10px')
			.attr('dx', '-4');

		// X axis
		const xTickCount = Math.min(data.length, 7);
		g.append('g')
			.attr('transform', `translate(0,${h})`)
			.call(
				axisBottom(x)
					.ticks(xTickCount)
					.tickFormat((d) => timeFormat('%b %d')(d as Date))
					.tickSize(0)
			)
			.call((sel) => sel.select('.domain').remove())
			.selectAll('text')
			.attr('fill', 'rgba(255,255,255,0.25)')
			.attr('font-size', '10px')
			.attr('dy', '10');

		// Gradient defs
		const defs = svg.append('defs');

		// Views gradient
		const viewsGrad = defs
			.append('linearGradient')
			.attr('id', viewsGradId)
			.attr('x1', '0')
			.attr('y1', '0')
			.attr('x2', '0')
			.attr('y2', '1');
		viewsGrad
			.append('stop')
			.attr('offset', '0%')
			.attr('stop-color', '#c5a059')
			.attr('stop-opacity', 0.25);
		viewsGrad
			.append('stop')
			.attr('offset', '100%')
			.attr('stop-color', '#c5a059')
			.attr('stop-opacity', 0.02);

		// Visitors gradient
		const visitorsGrad = defs
			.append('linearGradient')
			.attr('id', visitorsGradId)
			.attr('x1', '0')
			.attr('y1', '0')
			.attr('x2', '0')
			.attr('y2', '1');
		visitorsGrad
			.append('stop')
			.attr('offset', '0%')
			.attr('stop-color', '#60a5fa')
			.attr('stop-opacity', 0.15);
		visitorsGrad
			.append('stop')
			.attr('offset', '100%')
			.attr('stop-color', '#60a5fa')
			.attr('stop-opacity', 0.01);

		// Area generators
		const viewsArea = area<DataPoint>()
			.x((d) => x(parseDate(d.date) ?? new Date(d.date)))
			.y0(h)
			.y1((d) => y(d.views))
			.curve(curveMonotoneX);

		const visitorsArea = area<DataPoint>()
			.x((d) => x(parseDate(d.date) ?? new Date(d.date)))
			.y0(h)
			.y1((d) => y(d.visitors))
			.curve(curveMonotoneX);

		// Line generators
		const viewsLine = line<DataPoint>()
			.x((d) => x(parseDate(d.date) ?? new Date(d.date)))
			.y((d) => y(d.views))
			.curve(curveMonotoneX);

		const visitorsLine = line<DataPoint>()
			.x((d) => x(parseDate(d.date) ?? new Date(d.date)))
			.y((d) => y(d.visitors))
			.curve(curveMonotoneX);

		// Draw areas with fade-in
		const viewsAreaPath = g
			.append('path')
			.datum(data)
			.attr('d', viewsArea)
			.attr('fill', `url(#${viewsGradId})`)
			.attr('opacity', animate ? 0 : 1);

		if (animate) {
			viewsAreaPath.transition().duration(250).attr('opacity', 1);
		}

		const visitorsAreaPath = g
			.append('path')
			.datum(data)
			.attr('d', visitorsArea)
			.attr('fill', `url(#${visitorsGradId})`)
			.attr('opacity', animate ? 0 : 1);

		if (animate) {
			visitorsAreaPath.transition().duration(250).attr('opacity', 1);
		}

		// Draw lines with animated stroke
		const viewsPath = g
			.append('path')
			.datum(data)
			.attr('d', viewsLine)
			.attr('fill', 'none')
			.attr('stroke', '#c5a059')
			.attr('stroke-width', 2.5)
			.attr('stroke-linecap', 'round');

		if (animate) {
			const viewsLen = (viewsPath.node() as SVGPathElement)?.getTotalLength() ?? 0;
			viewsPath
				.attr('stroke-dasharray', `${viewsLen} ${viewsLen}`)
				.attr('stroke-dashoffset', viewsLen)
				.transition()
				.duration(350)
				.ease(easeCubicOut)
				.attr('stroke-dashoffset', 0);
		}

		const visitorsPath = g
			.append('path')
			.datum(data)
			.attr('d', visitorsLine)
			.attr('fill', 'none')
			.attr('stroke', '#60a5fa')
			.attr('stroke-width', 2)
			.attr('stroke-linecap', 'round')
			.attr('stroke-dasharray', '6 3');

		if (animate) {
			const visitorsLen = (visitorsPath.node() as SVGPathElement)?.getTotalLength() ?? 0;
			visitorsPath
				.attr('stroke-dasharray', `${visitorsLen} ${visitorsLen}`)
				.attr('stroke-dashoffset', visitorsLen)
				.transition()
				.duration(350)
				.ease(easeCubicOut)
				.attr('stroke-dashoffset', 0)
				.on('end', function () {
					select(this).attr('stroke-dasharray', '6 3');
				});
		}

		// Interactive overlay for tooltips
		const bisect = bisector((d: DataPoint) => parseDate(d.date) ?? new Date(d.date)).left;

		const focus = g.append('g').style('display', 'none');
		focus
			.append('line')
			.attr('class', 'hover-line')
			.attr('y1', 0)
			.attr('y2', h)
			.attr('stroke', 'rgba(255,255,255,0.15)')
			.attr('stroke-width', 1)
			.attr('stroke-dasharray', '4,4');

		focus
			.append('circle')
			.attr('r', 4)
			.attr('fill', '#c5a059')
			.attr('stroke', '#0a0a0f')
			.attr('stroke-width', 2);
		focus
			.append('circle')
			.attr('class', 'visitor-dot')
			.attr('r', 3.5)
			.attr('fill', '#60a5fa')
			.attr('stroke', '#0a0a0f')
			.attr('stroke-width', 2);

		g.append('rect')
			.attr('width', w)
			.attr('height', h)
			.attr('fill', 'transparent')
			.style('cursor', 'crosshair')
			.on('mouseenter', () => {
				focus.style('display', null);
				if (tooltipEl) tooltipEl.style.opacity = '1';
			})
			.on('mouseleave', () => {
				focus.style('display', 'none');
				if (tooltipEl) tooltipEl.style.opacity = '0';
			})
			.on('mousemove', (event: MouseEvent) => {
				const [mx] = pointer(event);
				const date = x.invert(mx);
				const idx = bisect(data, date, 1);
				const d0 = data[idx - 1];
				const d1 = data[idx];
				if (!d0) return;
				const d =
					d1 &&
					date.getTime() - (parseDate(d0.date) ?? new Date()).getTime() >
						(parseDate(d1.date) ?? new Date()).getTime() - date.getTime()
						? d1
						: d0;

				const px = x(parseDate(d.date) ?? new Date(d.date));
				const pyViews = y(d.views);
				const pyVisitors = y(d.visitors);

				focus.select('.hover-line').attr('x1', px).attr('x2', px);
				focus.select('circle').attr('cx', px).attr('cy', pyViews);
				focus.select('.visitor-dot').attr('cx', px).attr('cy', pyVisitors);

				if (tooltipEl) {
					tooltipEl.innerHTML = `
						<div class="tooltip-date" style="font-weight:600;color:rgba(255,255,255,0.6);font-size:0.7rem;margin-bottom:0.25rem"></div>
						<div style="display:flex;align-items:center;gap:0.375rem;margin-bottom:0.125rem">
							<span style="width:8px;height:3px;border-radius:2px;background:#c5a059"></span>
							<span class="tooltip-primary" style="color:rgba(255,255,255,0.75);font-size:0.8rem"></span>
						</div>
						<div style="display:flex;align-items:center;gap:0.375rem">
							<span style="width:8px;height:3px;border-radius:2px;background:#60a5fa"></span>
							<span class="tooltip-secondary" style="color:rgba(255,255,255,0.75);font-size:0.8rem"></span>
						</div>
					`;
					const tooltip = select(tooltipEl);
					tooltip.select('.tooltip-date').text(d.date);
					tooltip
						.select('.tooltip-primary')
						.text(`${d.views.toLocaleString()} ${seriesLabels.views}`);
					tooltip
						.select('.tooltip-secondary')
						.text(`${d.visitors.toLocaleString()} ${seriesLabels.visitors}`);
					const tooltipW = tooltipEl.offsetWidth;
					const tooltipH = tooltipEl.offsetHeight;

					let left = px + margin.left + 12;
					if (left + tooltipW > chartWidth) left = px + margin.left - tooltipW - 12;
					if (left < 0) left = 0;

					// Vertical clamp. `left` has always been clamped; `top` was not, so
					// the tooltip was positioned from the data point and allowed to run
					// off the bottom of the chart. Low values sit near the chart floor,
					// which is exactly where it spilled: measured 25 to 37px past the
					// container on EVERY point of a low-traffic series (2026-07-28).
					let top = pyViews + margin.top - 20;
					const maxTop = height - tooltipH;
					if (top > maxTop) top = maxTop; // flip up rather than overflow
					if (top < 0) top = 0; // and never above the chart either
					tooltipEl.style.left = `${left}px`;
					tooltipEl.style.top = `${top}px`;
				}
			});
	}

	let first = true;
	function chart(container: HTMLDivElement) {
		void data;
		void height;
		void seriesLabels;
		containerEl = container;
		svgEl = container.querySelector<SVGSVGElement>('svg') ?? undefined;
		tooltipEl = container.querySelector<HTMLDivElement>('.d3-chart__tooltip') ?? undefined;

		let renderTimeout: ReturnType<typeof setTimeout> | null = null;
		render(first);
		first = false;

		const ro = new ResizeObserver(() => {
			if (renderTimeout) clearTimeout(renderTimeout);
			renderTimeout = setTimeout(() => render(false), 120);
		});
		ro.observe(container);

		return () => {
			ro.disconnect();
			if (renderTimeout) clearTimeout(renderTimeout);
			if (svgEl) select(svgEl).selectAll('*').interrupt();
			containerEl = undefined;
			svgEl = undefined;
			tooltipEl = undefined;
		};
	}
</script>

<div class="d3-chart" {@attach chart}>
	<svg role="img" aria-label="Area chart"></svg>
	<div class="d3-chart__tooltip"></div>
</div>

<style>
	.d3-chart {
		position: relative;
		width: 100%;
	}
	.d3-chart svg {
		display: block;
		width: 100%;
	}
	.d3-chart__tooltip {
		position: absolute;
		pointer-events: none;
		background: rgba(15, 15, 20, 0.92);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.5rem;
		padding: 0.5rem 0.75rem;
		backdrop-filter: blur(8px);
		opacity: 0;
		transition: opacity 0.15s ease;
		z-index: 10;
		white-space: nowrap;
	}
</style>
