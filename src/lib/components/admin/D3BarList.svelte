<script lang="ts">
	import { easeCubicOut, max, select } from 'd3';
	import type { Attachment } from 'svelte/attachments';

	type BarItem = { label: string; value: number; secondary?: string };

	let {
		items = [],
		color = '#c5a059',
		maxItems = 8
	}: {
		items?: BarItem[];
		color?: string;
		maxItems?: number;
	} = $props();

	type ChartParams = { items: BarItem[]; color: string; maxItems: number };
	let first = true;
	function render(
		containerEl: HTMLDivElement,
		{ items, color, maxItems }: ChartParams,
		animate = true
	) {
		const el = select(containerEl);
		el.selectAll('*').interrupt().remove();
		if (items.length === 0) return;

		const displayItems = items.slice(0, maxItems);
		const maxVal = Math.max(1, max(displayItems, (d) => d.value) ?? 0);

		const rows = el
			.selectAll('.bar-row')
			.data(displayItems)
			.join('div')
			.attr('class', 'bar-row')
			.style('display', 'grid')
			.style('grid-template-columns', '1fr 120px 52px')
			.style('align-items', 'center')
			.style('gap', '0.75rem')
			.style('padding', '0.375rem 0')
			.style('opacity', '0')
			.style('transform', 'translateX(-8px)');

		// Animate in staggered
		if (animate) {
			rows
				.transition()
				.duration(220)
				.delay((_, i) => i * 30)
				.ease(easeCubicOut)
				.style('opacity', '1')
				.style('transform', 'translateX(0)');
		} else {
			rows.style('opacity', '1').style('transform', 'translateX(0)');
		}

		// Label
		rows
			.append('div')
			.style('font-size', '0.8rem')
			.style('color', 'rgba(255,255,255,0.65)')
			.style('white-space', 'nowrap')
			.style('overflow', 'hidden')
			.style('text-overflow', 'ellipsis')
			.attr('title', (d) => d.label)
			.text((d) => d.label);

		// Bar wrapper
		const barWrap = rows
			.append('div')
			.style('height', '6px')
			.style('background', 'rgba(255,255,255,0.04)')
			.style('border-radius', '3px')
			.style('overflow', 'hidden');

		// Animated bar fill
		const fills = barWrap
			.append('div')
			.style('height', '100%')
			.style('border-radius', '3px')
			.style('background', `linear-gradient(90deg, ${color}99, ${color})`);

		if (animate) {
			fills
				.style('width', '0%')
				.transition()
				.duration(320)
				.delay((_, i) => 80 + i * 30)
				.ease(easeCubicOut)
				.style('width', (d) => `${(d.value / maxVal) * 100}%`);
		} else {
			fills.style('width', (d) => `${(d.value / maxVal) * 100}%`);
		}

		// Value
		rows
			.append('div')
			.style('font-size', '0.8rem')
			.style('color', 'rgba(255,255,255,0.4)')
			.style('text-align', 'right')
			.style('font-variant-numeric', 'tabular-nums')
			.text((d) => {
				if (d.value >= 10000) return (d.value / 1000).toFixed(0) + 'k';
				if (d.value >= 1000) return (d.value / 1000).toFixed(1) + 'k';
				return d.value.toLocaleString();
			});
	}

	function chart(params: ChartParams): Attachment<HTMLDivElement> {
		return (containerEl) => {
			render(containerEl, params, first);
			first = false;
			return () => {
				select(containerEl).selectAll('*').interrupt();
			};
		};
	}
</script>

<div class="d3-bar-list" {@attach chart({ items, color, maxItems })}></div>

<style>
	.d3-bar-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
</style>
