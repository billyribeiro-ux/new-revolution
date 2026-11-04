<script lang="ts">
	import { max, scaleBand, scaleLinear, select } from 'd3';

	let {
		data = [],
		color = '#c5a059',
		width = 200,
		height = 80,
		barRadius = 2
	}: {
		data: number[];
		color?: string;
		width?: number;
		height?: number;
		barRadius?: number;
	} = $props();

	interface Inputs {
		data: number[];
		color: string;
		width: number;
		height: number;
		barRadius: number;
	}

	function render(svgEl: SVGSVGElement, { data, color, width, height, barRadius }: Inputs) {
		const svg = select(svgEl);
		// Clear first: returning before the clear left the previous chart drawn.
		svg.selectAll('*').remove();
		if (data.length < 1) return;

		const padTop = 4;
		const padBottom = 2;

		const x = scaleBand<number>()
			.domain(data.map((_, i) => i))
			.range([0, width])
			.paddingInner(0.25)
			.paddingOuter(0.1);

		// `|| 1`, not `?? 1`: an all-zero series has max 0, and a [0, 0] domain makes d3 draw every value mid-range.
		const y = scaleLinear()
			.domain([0, max(data) || 1])
			.range([height - padBottom, padTop]);

		svg
			.selectAll('rect')
			.data(data)
			.join('rect')
			.attr('x', (_, i) => x(i) ?? 0)
			// A true zero is a 1px hairline: present on the axis, never mistaken for a value.
			.attr('y', (d) => (d > 0 ? y(d) : height - padBottom - 1))
			.attr('width', x.bandwidth())
			.attr('height', (d) => (d > 0 ? height - padBottom - y(d) : 1))
			.attr('rx', barRadius)
			.attr('fill', color)
			// A single bar is the latest one: full strength, not 0 / 0.
			.attr('opacity', (_, i) => 0.3 + 0.7 * (data.length > 1 ? i / (data.length - 1) : 1));
	}

	function chart(svgEl: SVGSVGElement) {
		let first = true;
		$effect(() => {
			// Read every input now: values read inside the setTimeout are not
			// tracked, so later color or size changes were ignored.
			const inputs = { data: [...data], color, width, height, barRadius };
			if (first) {
				first = false;
				render(svgEl, inputs);
				return;
			}
			const t = setTimeout(() => render(svgEl, inputs), 50);
			return () => clearTimeout(t);
		});
	}
</script>

<svg
	{@attach chart}
	viewBox="0 0 {width} {height}"
	preserveAspectRatio="none"
	class="spark-bar"
	role="img"
	aria-label="Bar sparkline"
></svg>

<style>
	.spark-bar {
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
