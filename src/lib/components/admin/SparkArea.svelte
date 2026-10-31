<script lang="ts">
	import { area, curveBasis, line, max, scaleLinear, select } from 'd3';

	let {
		data = [],
		color = '#c5a059',
		width = 200,
		height = 80,
		strokeWidth = 2,
		gradientOpacity = 0.3
	}: {
		data: number[];
		color?: string;
		width?: number;
		height?: number;
		strokeWidth?: number;
		gradientOpacity?: number;
	} = $props();

	const gradientId = `sparkGrad-${Math.random().toString(36).slice(2, 8)}`;

	interface Inputs {
		data: number[];
		color: string;
		width: number;
		height: number;
		strokeWidth: number;
		gradientOpacity: number;
	}

	function render(
		svgEl: SVGSVGElement,
		{ data, color, width, height, strokeWidth, gradientOpacity }: Inputs
	) {
		const svg = select(svgEl);
		// Clear first: returning before the clear left the previous chart drawn.
		svg.selectAll('*').remove();
		if (data.length < 2) return;

		const padTop = 4;
		const padBottom = 2;
		const w = width;
		const h = height;

		const x = scaleLinear()
			.domain([0, data.length - 1])
			.range([0, w]);

		const y = scaleLinear()
			.domain([0, max(data) ?? 1])
			.range([h - padBottom, padTop]);

		const areaPath = area<number>()
			.x((_, i) => x(i))
			.y0(h)
			.y1((d) => y(d))
			.curve(curveBasis);

		const linePath = line<number>()
			.x((_, i) => x(i))
			.y((d) => y(d))
			.curve(curveBasis);

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
			.attr('stop-opacity', gradientOpacity);
		gradient
			.append('stop')
			.attr('offset', '100%')
			.attr('stop-color', color)
			.attr('stop-opacity', 0.02);

		// Area fill
		svg.append('path').datum(data).attr('d', areaPath).attr('fill', `url(#${gradientId})`);

		// Stroke line
		svg
			.append('path')
			.datum(data)
			.attr('d', linePath)
			.attr('fill', 'none')
			.attr('stroke', color)
			.attr('stroke-width', strokeWidth)
			.attr('stroke-linecap', 'round');

		// End dot
		const lastVal = data[data.length - 1]!;
		svg
			.append('circle')
			.attr('cx', x(data.length - 1))
			.attr('cy', y(lastVal))
			.attr('r', 3)
			.attr('fill', color)
			.attr('opacity', 0.8);
	}

	function chart(svgEl: SVGSVGElement) {
		let first = true;
		$effect(() => {
			// Read every input now. Values read inside the setTimeout below are not
			// tracked, so after the first redraw only `data` was a dependency and
			// later color or size changes were ignored.
			const inputs = { data: [...data], color, width, height, strokeWidth, gradientOpacity };
			if (first) {
				first = false;
				render(svgEl, inputs);
				return;
			}
			// Debounce re-renders to prevent visual thrashing from rapid updates.
			// Inner $effect cleanup cancels the pending timer on dep change or unmount.
			const t = setTimeout(() => render(svgEl, inputs), 50);
			return () => clearTimeout(t);
		});
	}
</script>

<svg
	{@attach chart}
	viewBox="0 0 {width} {height}"
	preserveAspectRatio="none"
	class="spark-area"
	role="img"
	aria-label="Trend sparkline"
></svg>

<style>
	.spark-area {
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
