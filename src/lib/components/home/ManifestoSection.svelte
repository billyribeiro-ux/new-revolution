<script lang="ts">
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import { revealOnScroll } from '#lib/attachments/reveal.ts';
	import {
		MANIFESTO_NEGATIVE_POINTS,
		MANIFESTO_POSITIVE_POINTS,
		type ComparisonPoint
	} from '#lib/data/homepage.ts';

	interface Props {
		negativePoints?: readonly ComparisonPoint[];
		positivePoints?: readonly ComparisonPoint[];
	}

	let {
		negativePoints = MANIFESTO_NEGATIVE_POINTS,
		positivePoints = MANIFESTO_POSITIVE_POINTS
	}: Props = $props();
</script>

<!-- 03 / MANIFESTO -->
<section class="section manifesto" id="why-us" aria-labelledby="manifesto-title">
	<div class="container">
		<div class="manifesto-intro reveal" {@attach revealOnScroll}>
			<div>
				<div class="eyebrow dark">PEOPLE OVER PROFITS / THE ANTI-HYPE STANDARD</div>
				<h2 id="manifesto-title">
					Not another trading guru. <span class="manifesto-accent">A different standard.</span>
				</h2>
			</div>
			<p class="copy dark">
				If you’ve been burned by expensive courses, unreliable signals, or after-the-fact trade
				screenshots, you deserve a more useful alternative: clear education, accountability,
				accessible options, and risk-aware trade plans.
			</p>
		</div>

		<div class="manifesto-grid">
			<article class="manifesto-card negative reveal" {@attach revealOnScroll}>
				<div class="comparison-label">WHAT YOU LEAVE BEHIND / THE HYPE TRAP</div>
				<h3>Less storytelling after the trade. More clarity before it.</h3>
				<ul class="comparison-list">
					{#each negativePoints as item (item.lead)}
						<li>
							<span class="mark" aria-hidden="true">
								<XIcon size={18} weight="bold" />
							</span>
							<span>
								<strong>{item.lead}</strong>
								<em>{item.detail}</em>
							</span>
						</li>
					{/each}
				</ul>
			</article>

			<article class="manifesto-card positive reveal" {@attach revealOnScroll}>
				<div class="comparison-label">WHAT WE AIM TO DELIVER / THE REVOLUTION STANDARD</div>
				<h3>Pre-planned setups. Honest education. A path that fits.</h3>
				<ul class="comparison-list">
					{#each positivePoints as item (item.lead)}
						<li>
							<span class="mark" aria-hidden="true">
								<CheckIcon size={18} weight="bold" />
							</span>
							<span>
								<strong>{item.lead}</strong>
								<em>{item.detail}</em>
							</span>
						</li>
					{/each}
				</ul>
			</article>
		</div>
	</div>
</section>

<style>
	.manifesto {
		background: var(--off);
		color: var(--ink);
	}

	.manifesto-intro {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 25px;
		align-items: end;
		margin-block-end: 54px;
	}

	.manifesto h2 {
		margin-block-end: 0;
	}

	.manifesto .copy {
		margin: 0;
	}

	.manifesto-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 12px;
	}

	.manifesto-card {
		padding: 25px;
		min-block-size: 0;
	}

	.manifesto-card.negative {
		background: var(--card-negative-bg);
		border: 1px solid var(--card-negative-border);
	}

	.manifesto-card.positive {
		background: var(--ink);
		color: var(--text);
	}

	.manifesto-card h3 {
		margin-block-end: 28px;
	}

	.comparison-label {
		margin-block-end: 15px;
	}

	.negative .comparison-label {
		color: var(--card-negative-label);
	}

	.positive .comparison-label {
		color: var(--acid);
	}

	.comparison-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.comparison-list li {
		display: grid;
		grid-template-columns: 24px 1fr;
		gap: 12px;
		padding-block: 17px;
		border-block-start: 1px solid rgba(30, 36, 42, 0.14);
		font-family: var(--font-sans);
		font-weight: 400;
		font-size: 0.9375rem;
		line-height: 1.65;
		letter-spacing: 0.005em;
		max-inline-size: 60ch;
	}

	.positive .comparison-list li {
		border-color: #333941;
		color: #c8cec9;
	}

	.comparison-list .mark {
		display: inline-flex;
		align-items: center;
		color: var(--card-negative-label);
		margin-block-start: 3px;
	}

	.positive .comparison-list .mark {
		color: var(--acid);
	}

	.comparison-list strong {
		display: block;
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.9375rem;
		margin-block-end: 4px;
	}

	.comparison-list em {
		font-style: normal;
		color: #4f565e;
	}

	.positive .comparison-list em {
		color: #a5b0b0;
	}

	@media (min-width: 768px) {
		.manifesto-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.manifesto-card {
			padding: 26px;
		}
	}

	@media (min-width: 1024px) {
		.manifesto-intro {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 65px;
		}

		.manifesto-grid {
			gap: 16px;
		}

		.manifesto-card {
			padding: 39px 42px 40px;
			min-block-size: 520px;
		}
	}

	@media (min-width: 1536px) {
		.manifesto-grid {
			gap: 24px;
		}
	}
</style>
