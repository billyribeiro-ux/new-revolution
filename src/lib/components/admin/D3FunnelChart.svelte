<script lang="ts">
	import { select } from 'd3';
	import type { Attachment } from 'svelte/attachments';

	interface FunnelStage {
		label: string;
		value: number;
		color?: string;
	}

	interface Props {
		stages: FunnelStage[];
		height?: number;
	}

	let { stages, height = 280 }: Props = $props();

	const uid = Math.random().toString(36).slice(2, 8);
	const palette = ['#c5a059', '#60a5fa', '#86efac', '#fcd34d', '#fca5a5'];

	type FunnelParams = {
		stages: FunnelStage[];
		height: number;
	};

	function finiteValue(value: number): number {
		return Number.isFinite(value) && value > 0 ? value : 0;
	}

	function render(node: HTMLDivElement, params: FunnelParams) {
		const svgNode = node.querySelector('svg');
		if (!svgNode) return;

		const svg = select(svgNode);
		svg.selectAll('*').remove();

		const safeStages = params.stages.map((stage) => ({
			...stage,
			value: finiteValue(Number(stage.value))
		}));
		if (!safeStages.length) return;

		const w = Math.max(320, node.clientWidth || 400);
		const h = Number.isFinite(params.height) && params.height > 0 ? params.height : 280;
		const maxVal = Math.max(...safeStages.map((stage) => stage.value), 1);
		const stageH = h / safeStages.length;
		const margin = { left: 96, right: 72 };
		const chartLeft = margin.left;
		const chartRight = Math.max(chartLeft + 48, w - margin.right);
		const chartInnerWidth = chartRight - chartLeft;

		svg.attr('width', w).attr('height', h);

		// Gradient defs
		const defs = svg.append('defs');
		safeStages.forEach((stage, i) => {
			const c = stage.color ?? palette[i % palette.length] ?? '#c5a059';
			const grad = defs
				.append('linearGradient')
				.attr('id', `funnel-grad-${uid}-${i}`)
				.attr('x1', '0')
				.attr('y1', '0')
				.attr('x2', '1')
				.attr('y2', '0');
			grad.append('stop').attr('offset', '0%').attr('stop-color', c).attr('stop-opacity', 0.85);
			grad.append('stop').attr('offset', '100%').attr('stop-color', c).attr('stop-opacity', 0.45);
		});

		const g = svg.append('g');

		safeStages.forEach((stage, i) => {
			const ratio = Math.min(1, Math.max(0, stage.value / maxVal));
			const nextValue =
				i < safeStages.length - 1 ? (safeStages[i + 1]?.value ?? 0) : stage.value * 0.6;
			const nextRatio = Math.min(1, Math.max(0, nextValue / maxVal));
			const barW = Math.max(30, chartInnerWidth * ratio);
			const nextBarW = Math.max(24, chartInnerWidth * nextRatio);
			const x = chartLeft + (chartInnerWidth - barW) / 2;
			const nextX = chartLeft + (chartInnerWidth - nextBarW) / 2;
			const y = i * stageH;

			// Trapezoid path
			const topLeft = x;
			const topRight = x + barW;
			const botLeft = nextX;
			const botRight = nextX + nextBarW;
			const trapH = stageH - 3;

			g.append('path')
				.attr(
					'd',
					`M${topLeft},${y} L${topRight},${y} L${botRight},${y + trapH} L${botLeft},${y + trapH} Z`
				)
				.attr('fill', `url(#funnel-grad-${uid}-${i})`)
				.attr('rx', 4)
				.attr('stroke', 'rgba(255,255,255,0.08)')
				.attr('stroke-width', 1)
				.style('opacity', 0)
				.transition()
				.delay(i * 80)
				.duration(400)
				.style('opacity', 1);

			// Label (left)
			g.append('text')
				.attr('x', topLeft - 6)
				.attr('y', y + trapH / 2)
				.attr('text-anchor', 'end')
				.attr('dominant-baseline', 'middle')
				.attr('fill', 'rgba(255,255,255,0.6)')
				.attr('font-size', '11px')
				.text(stage.label);

			// Value (center)
			g.append('text')
				.attr('x', chartLeft + chartInnerWidth / 2)
				.attr('y', y + trapH / 2)
				.attr('text-anchor', 'middle')
				.attr('dominant-baseline', 'middle')
				.attr('fill', '#fff')
				.attr('font-size', '13px')
				.attr('font-weight', '600')
				.text(stage.value.toLocaleString());

			// Dropoff indicator (right)
			if (i > 0) {
				const prev = safeStages[i - 1]?.value ?? 0;
				const dropoff = prev > 0 ? (((prev - stage.value) / prev) * 100).toFixed(1) : '0';
				g.append('text')
					.attr('x', Math.min(w - 4, topRight + 8))
					.attr('y', y + trapH / 2)
					.attr('text-anchor', 'start')
					.attr('dominant-baseline', 'middle')
					.attr('fill', 'rgba(239,68,68,0.6)')
					.attr('font-size', '10px')
					.text(`−${dropoff}%`);
			}
		});
	}

	function funnelChart(params: FunnelParams): Attachment<HTMLDivElement> {
		return (node) => {
			const renderCurrent = () => render(node, params);
			renderCurrent();
			const ro = new ResizeObserver(renderCurrent);
			ro.observe(node);

			return () => {
				ro.disconnect();
			};
		};
	}
</script>

<div class="funnel-wrap" {@attach funnelChart({ stages, height })}>
	<svg role="img" aria-label="Funnel chart"></svg>
</div>

<style>
	.funnel-wrap {
		width: 100%;
		overflow: visible;
	}
	.funnel-wrap svg {
		display: block;
		overflow: visible;
	}
</style>
