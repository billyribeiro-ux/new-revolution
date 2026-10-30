<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowUpRightIcon from 'phosphor-svelte/lib/ArrowUpRightIcon';
	import { revealOnScroll } from '#lib/attachments/reveal.ts';
	import { CLOSING_CONTENT, type ClosingContent } from '#lib/data/homepage.ts';

	interface Props {
		content?: ClosingContent;
		onPreviewNavigate?: (href: string, targetId?: string, event?: MouseEvent) => void;
	}

	let { content = CLOSING_CONTENT, onPreviewNavigate }: Props = $props();
</script>

<!-- 11 / CLOSING -->
<section class="closing" aria-labelledby="closing-title">
	<div class="container">
		<div class="closing-content reveal" {@attach revealOnScroll}>
			<div class="eyebrow">{content.eyebrow}</div>
			<h2 id="closing-title">
				{content.headlineLead}
				<span class="closing-underline">{content.headlineUnderline}</span>
			</h2>
			<p>{content.description}</p>
			<div class="closing-actions">
				<a
					class="btn btn-dark"
					href={resolve(content.primaryCta.href as '/')}
					onclick={(e) =>
						onPreviewNavigate?.(content.primaryCta.href, content.primaryCta.previewTarget, e)}
				>
					<span>{content.primaryCta.label}</span>
					<span class="arrow" aria-hidden="true">
						<ArrowUpRightIcon size={16} weight="bold" />
					</span>
				</a>
				<a
					class="btn btn-outline-dark"
					href={resolve(content.secondaryCta.href as '/')}
					onclick={(e) =>
						onPreviewNavigate?.(content.secondaryCta.href, content.secondaryCta.previewTarget, e)}
				>
					<span>{content.secondaryCta.label}</span>
					<span class="arrow" aria-hidden="true">
						<ArrowUpRightIcon size={16} weight="bold" />
					</span>
				</a>
			</div>
		</div>
	</div>
</section>

<style>
	.closing {
		background: var(--surface-closing);
		color: #111810;
		padding-block: 71px;
		position: relative;
		overflow: hidden;
	}

	.closing::after {
		content: 'REVOLUTION';
		position: absolute;
		inset-block-end: -30px;
		inset-inline-start: 50%;
		transform: translateX(-50%);
		font-family: var(--font-display);
		font-weight: 900;
		font-size: clamp(100px, 15vw, 230px);
		line-height: 0.8;
		white-space: nowrap;
		letter-spacing: -0.06em;
		color: #11181009;
		pointer-events: none;
		display: none;
	}

	.closing-content {
		max-inline-size: 1090px;
		position: relative;
		z-index: 1;
	}

	.closing h2 {
		font-size: clamp(2.1rem, 4.5vw, 3.6rem);
		line-height: 1.04;
		margin-block: 23px 27px;
		max-inline-size: 28ch;
	}

	.closing-underline {
		text-decoration: underline;
		text-decoration-thickness: 5px;
		text-underline-offset: 10px;
	}

	.closing p {
		font-size: 1.0625rem;
		line-height: 1.75;
		max-inline-size: min(70ch, 680px);
	}

	.closing-actions {
		display: grid;
		gap: 12px;
		margin-block-start: 31px;
	}

	.closing-actions .btn {
		inline-size: 100%;
		max-inline-size: none;
	}

	.closing .eyebrow {
		color: #324d10;
	}

	@media (min-width: 640px) {
		.closing-actions {
			display: flex;
			flex-wrap: wrap;
		}

		.closing-actions .btn {
			inline-size: auto;
			max-inline-size: 380px;
		}
	}

	@media (min-width: 768px) {
		.closing {
			padding-block: 100px;
		}

		.closing::after {
			display: block;
		}
	}
</style>
