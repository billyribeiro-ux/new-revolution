<script lang="ts">
	import { arc, interpolate, pie, select, sum, type PieArcDatum } from 'd3';

	interface DataItem {
		label: string;
		value: number;
		color?: string;
	}

	interface Props {
		data: DataItem[];
		centerLabel?: string;
		centerValue?: string;
		size?: number;
	}

	let { data, centerLabel = '', centerValue = '', size = 200 }: Props = $props();

	const uid = Math.random().toString(36).slice(2, 8);
	const palette = [
		'#c5a059',
		'#60a5fa',
		'#86efac',
		'#fcd34d',
		'#fca5a5',
		'#c084fc',
		'#67e8f9',
		'#fb923c'
	];

	function getColor(i: number, item: DataItem): string {
		return item.color ?? palette[i % palette.length] ?? '#c5a059';
	}

	function render(svgEl: SVGSVGElement, animate = true) {
		const svg = select(svgEl);
		// Clear first: returning before the clear left the previous chart drawn.
		svg.selectAll('*').remove();
		if (!data.length) return;

		const total = sum(data, (d) => d.value);
		if (total === 0) return;

		const radius = size / 2;
		const innerRadius = radius * 0.62;
		const outerRadius = radius - 4;

		const g = svg
			.attr('width', size)
			.attr('height', size)
			.append('g')
			.attr('transform', `translate(${radius},${radius})`);

		// Gradient defs for each arc
		const defs = svg.append('defs');
		data.forEach((item, i) => {
			const grad = defs
				.append('radialGradient')
				.attr('id', `donut-grad-${uid}-${i}`)
				.attr('cx', '50%')
				.attr('cy', '50%')
				.attr('r', '50%');
			const c = getColor(i, item);
			grad.append('stop').attr('offset', '0%').attr('stop-color', c).attr('stop-opacity', 1);
			grad.append('stop').attr('offset', '100%').attr('stop-color', c).attr('stop-opacity', 0.7);
		});

		const pieLayout = pie<DataItem>()
			.value((d) => d.value)
			.sort(null)
			.padAngle(0.025);
		const arcPath = arc<PieArcDatum<DataItem>>()
			.innerRadius(innerRadius)
			.outerRadius(outerRadius)
			.cornerRadius(3);
		const hoverArc = arc<PieArcDatum<DataItem>>()
			.innerRadius(innerRadius - 2)
			.outerRadius(outerRadius + 4)
			.cornerRadius(3);

		const arcs = g
			.selectAll('path')
			.data(pieLayout(data))
			.enter()
			.append('path')
			.attr('d', arcPath)
			.attr('fill', (_, i) => `url(#donut-grad-${uid}-${i})`)
			.attr('stroke', 'rgba(0,0,0,0.3)')
			.attr('stroke-width', 1)
			.style('cursor', 'pointer')
			.style('transition', 'opacity 0.15s');

		// Hover effects
		arcs
			.on('mouseenter', function (_, d) {
				select(this)
					.transition()
					.duration(150)
					.attr('d', hoverArc(d) ?? '');
				g.select('.donut-center-value').text(d.data.value.toLocaleString());
				g.select('.donut-center-label').text(
					`${d.data.label} (${((d.data.value / total) * 100).toFixed(1)}%)`
				);
			})
			.on('mouseleave', function (_, d) {
				select(this)
					.transition()
					.duration(150)
					.attr('d', arcPath(d) ?? '');
				g.select('.donut-center-value').text(centerValue || total.toLocaleString());
				g.select('.donut-center-label').text(centerLabel || 'Total');
			});

		// Entrance animation
		if (animate) {
			arcs
				.transition()
				.duration(320)
				.attrTween('d', function (d) {
					const interp = interpolate({ startAngle: d.startAngle, endAngle: d.startAngle }, d);
					return (t: number) => arcPath(interp(t) as PieArcDatum<DataItem>) ?? '';
				});
		}

		// Center text
		g.append('text')
			.attr('class', 'donut-center-value')
			.attr('text-anchor', 'middle')
			.attr('dy', '-0.15em')
			.attr('fill', '#fff')
			.attr('font-size', `${Math.round(size * 0.11)}px`)
			.attr('font-weight', '700')
			.text(centerValue || total.toLocaleString());

		g.append('text')
			.attr('class', 'donut-center-label')
			.attr('text-anchor', 'middle')
			.attr('dy', '1.2em')
			.attr('fill', 'rgba(255,255,255,0.45)')
			.attr('font-size', `${Math.round(size * 0.058)}px`)
			.text(centerLabel || 'Total');
	}

	function chart(svgEl: SVGSVGElement) {
		let first = true;
		$effect(() => {
			void data;
			void size;
			render(svgEl, first);
			first = false;
		});
	}
</script>

<div class="donut-wrap">
	<svg {@attach chart} role="img" aria-label="Donut chart"></svg>
	{#if data.length > 0}
		<ul class="donut-legend">
			{#each data as item, i (item.label)}
				<li>
					<span class="donut-legend__dot" style="background:{getColor(i, item)}"></span>
					<span class="donut-legend__label">{item.label}</span>
					<span class="donut-legend__val">{item.value.toLocaleString()}</span>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.donut-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}
	.donut-legend {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
		justify-content: center;
	}
	.donut-legend li {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.6);
	}
	.donut-legend__dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.donut-legend__val {
		color: rgba(255, 255, 255, 0.35);
	}
</style>
