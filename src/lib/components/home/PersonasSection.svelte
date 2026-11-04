<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowUpRightIcon from 'phosphor-svelte/lib/ArrowUpRightIcon';
	import BriefcaseIcon from 'phosphor-svelte/lib/BriefcaseIcon';
	import LightningIcon from 'phosphor-svelte/lib/LightningIcon';
	import TargetIcon from 'phosphor-svelte/lib/TargetIcon';
	import WalletIcon from 'phosphor-svelte/lib/WalletIcon';
	import { revealOnScroll } from '#lib/attachments/reveal.ts';
	import { TRADER_PERSONAS, type PersonaIcon, type TraderPersona } from '#lib/data/homepage.ts';

	interface Props {
		personas?: readonly TraderPersona[];
		onPreviewNavigate?: (href: string, targetId?: string, event?: MouseEvent) => void;
	}

	let { personas = TRADER_PERSONAS, onPreviewNavigate }: Props = $props();

	const personaIcons = {
		briefcase: BriefcaseIcon,
		wallet: WalletIcon,
		lightning: LightningIcon,
		target: TargetIcon
	} satisfies Record<PersonaIcon, unknown>;
</script>

<!-- 04 / PERSONAS -->
<section class="section audience" id="audiences" aria-labelledby="audience-title">
	<div class="container">
		<div class="section-heading reveal" {@attach revealOnScroll}>
			<div class="eyebrow">ENGINEERED FOR DIFFERENT TRADERS</div>
			<h2 id="audience-title">
				Your time. Your capital. <span class="highlight">Your next step.</span>
			</h2>
			<p class="copy">
				You don’t need to fit a single trader stereotype. Start with the format and education that
				match your life—while staying realistic about the risks.
			</p>
		</div>

		<div class="audience-grid">
			{#each personas as persona (persona.title)}
				{@const PersonaGlyph = personaIcons[persona.icon]}
				<article class="audience-card reveal" {@attach revealOnScroll}>
					<div class="persona-head" aria-hidden="true">
						<span class="persona-icon"><PersonaGlyph size={28} weight="duotone" /></span>
						<span class="persona-graphic">{persona.graphic}</span>
					</div>
					<div class="persona-tag">{persona.tag}</div>
					<h3>{persona.title}</h3>
					<p>{persona.description}</p>
					<a
						class="text-link acid"
						href={resolve(persona.href as '/')}
						onclick={(e) => onPreviewNavigate?.(persona.href, persona.previewTarget, e)}
					>
						<span>{persona.ctaLabel}</span>
						<span class="arrow" aria-hidden="true">
							<ArrowUpRightIcon size={16} weight="bold" />
						</span>
					</a>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	.audience {
		background: var(--surface-audience);
	}

	.audience .section-heading {
		margin-block-end: 33px;
	}

	.audience-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 13px;
	}

	.audience-card {
		min-block-size: 0;
		padding: 25px;
		border: 1px solid #353b43;
		background: linear-gradient(#181d23, #12171c);
		display: flex;
		flex-direction: column;
		transition:
			transform 0.2s var(--ease-out),
			border-color 0.2s var(--ease-out);
	}

	.audience-card:hover,
	.audience-card:focus-within {
		transform: translateY(-6px);
		border-color: var(--acid);
		background: linear-gradient(#1c232a, #141a20);
		box-shadow:
			0 22px 48px rgba(0, 0, 0, 0.38),
			0 0 0 1px rgba(220, 255, 101, 0.18);
	}

	.persona-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-block-end: 22px;
	}

	.persona-icon {
		display: inline-grid;
		place-items: center;
		inline-size: 56px;
		block-size: 56px;
		color: var(--acid);
		border: 1px solid rgba(220, 255, 101, 0.4);
		background: rgba(220, 255, 101, 0.07);
		transition:
			background-color 0.22s var(--ease-out),
			color 0.22s var(--ease-out),
			border-color 0.22s var(--ease-out);
	}

	.audience-card:hover .persona-icon,
	.audience-card:focus-within .persona-icon {
		background: var(--acid);
		border-color: var(--acid);
		color: var(--ink);
	}

	.persona-graphic {
		color: var(--acid);
		white-space: nowrap;
	}

	.persona-tag {
		color: var(--acid);
		margin-block-end: 16px;
	}

	.audience-card p {
		color: #aeb5b8;
		margin-block-end: 23px;
	}

	.audience-card .text-link {
		margin-block-start: auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 14px 16px;
		border: 1px solid rgba(220, 255, 101, 0.45);
		background: rgba(220, 255, 101, 0.05);
		line-height: 1.35;
		transition:
			background-color 0.2s var(--ease-out),
			color 0.2s var(--ease-out),
			border-color 0.2s var(--ease-out);
	}

	.audience-card .text-link .arrow {
		display: inline-grid;
		place-items: center;
		flex: none;
		inline-size: 28px;
		block-size: 28px;
		margin: 0;
		border: 1px solid currentColor;
		transition: transform 0.2s var(--ease-out);
	}

	.audience-card .text-link:hover,
	.audience-card .text-link:focus-visible {
		gap: 12px;
		background: var(--acid);
		border-color: var(--acid);
		color: var(--ink);
	}

	.audience-card .text-link:hover .arrow,
	.audience-card .text-link:focus-visible .arrow {
		transform: translate(2px, -2px);
	}

	.audience-card .text-link:active {
		background: var(--btn-acid-hover);
	}

	@media (min-width: 640px) {
		.audience-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.audience-card {
			min-block-size: 300px;
		}
	}

	@media (min-width: 768px) {
		.audience .section-heading {
			margin-block-end: 42px;
		}
	}

	@media (min-width: 1024px) {
		.audience-grid {
			grid-template-columns: repeat(4, minmax(0, 1fr));
			gap: 13px;
		}

		.audience-card {
			min-block-size: 360px;
			padding: 24px 19px;
		}
	}

	@media (min-width: 1280px) {
		.audience-card {
			padding: 28px 25px;
		}
	}

	@media (min-width: 1536px) {
		.audience-grid {
			gap: 20px;
		}
	}
</style>
