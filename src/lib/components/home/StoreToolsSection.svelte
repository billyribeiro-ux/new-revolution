<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowUpRightIcon from 'phosphor-svelte/lib/ArrowUpRightIcon';
	import { revealOnScroll } from '#lib/attachments/reveal.ts';
	import { STORE_TOOLS, type StoreToolCard } from '#lib/data/homepage.ts';

	interface Props {
		tools?: readonly StoreToolCard[];
		onPreviewNavigate?: (href: string, targetId?: string, event?: MouseEvent) => void;
	}

	let { tools = STORE_TOOLS, onPreviewNavigate }: Props = $props();
</script>

<!-- 06 / STORE: TOOLS & EDUCATION -->
<section class="section tools" id="tools" aria-labelledby="tools-title">
	<div class="container">
		<div class="section-heading reveal" {@attach revealOnScroll}>
			<div class="eyebrow">EDUCATE / INNOVATE</div>
			<h2 id="tools-title">
				Better tools. <span class="highlight">Deeper understanding.</span>
			</h2>
			<p class="copy">
				Technology should help you see market conditions clearly—not sell false certainty. Combine
				transparent indicator behavior with structured learning.
			</p>
		</div>

		<div class="tools-grid">
			{#each tools as tool (tool.id)}
				<article class="tool-card reveal" {@attach revealOnScroll}>
					<div class="tool-visual">
						<span class="visual-corner">{tool.visualCorner}</span>
						{#if tool.visualVariant === 'indicators'}
							<svg viewBox="0 0 480 170" fill="none" aria-hidden="true">
								<path
									d="M15 135H465M15 95H465M15 55H465M15 15H465"
									stroke="#34413a"
									stroke-dasharray="3 6"
								/>
								<g stroke-width="2">
									<path
										d="M45 115V66M70 125V73M95 112V50M120 104V34M145 101V43M170 122V76M195 128V87M220 103V66M245 111V69M270 83V38M295 63V22M320 84V42M345 76V30M370 70V35M395 52V16M420 47V7"
										stroke="#a6c0a8"
									/>
									<path
										d="M38 90h14v18H38zM63 85h14v24H63zM88 61h14v31H88zM113 48h14v31h-14zM138 65h14v21h-14zM163 84h14v29h-14zM188 95h14v25h-14zM213 72h14v20h-14zM238 78h14v23h-14zM263 52h14v23h-14zM288 31h14v27h-14zM313 57h14v17h-14zM338 45h14v19h-14zM363 49h14v17h-14zM388 25h14v22h-14zM413 18h14v22h-14z"
										fill="#293b2f"
										stroke="#a9c899"
									/>
								</g>
								<path
									d="M24 116 81 116 81 90 151 90 151 112 210 112 210 83 259 83 259 60 309 60 309 70 364 70 364 39 445 39"
									stroke="#dcff65"
									stroke-width="2.7"
								/>
								<circle cx="260" cy="60" r="5" fill="#dcff65" />
								<circle cx="365" cy="39" r="5" fill="#dcff65" />
							</svg>
						{:else}
							<svg viewBox="0 0 480 170" fill="none" aria-hidden="true">
								<rect
									x="85"
									y="22"
									width="310"
									height="126"
									rx="3"
									stroke="#6f826c"
									stroke-width="1.6"
									fill="#1e2a28"
								/>
								<rect x="101" y="36" width="102" height="96" fill="#344c36" />
								<path
									d="M115 59h75M115 72h61M115 85h68M115 98h47M115 111h57"
									stroke="#adca96"
									stroke-width="2"
								/>
								<rect x="220" y="36" width="159" height="14" fill="#547343" />
								<path
									d="M220 64h137M220 77h118M220 90h131M220 103h102"
									stroke="#74877e"
									stroke-width="3"
								/>
								<path d="M220 119h85" stroke="#dcff65" stroke-width="3" />
								<path d="M300 15v35M282 32h37" stroke="#dcff65" stroke-width="2" />
							</svg>
						{/if}
						<span class="visual-stamp">{tool.visualStamp}</span>
					</div>
					<div class="tool-body">
						<div class="tool-tag">{tool.tag}</div>
						<h3>{tool.title}</h3>
						<p>{tool.description}</p>
						<ul>
							{#each tool.bullets as bullet (bullet)}
								<li>{bullet}</li>
							{/each}
						</ul>
						<a
							class="text-link acid"
							href={resolve(tool.href as '/')}
							onclick={(e) => onPreviewNavigate?.(tool.href, tool.previewTarget, e)}
						>
							{tool.ctaLabel}
							<span class="arrow" aria-hidden="true">
								<ArrowUpRightIcon size={14} weight="bold" />
							</span>
						</a>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	.tools {
		background: var(--surface-tools);
	}

	.tools-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 17px;
	}

	.tool-card {
		border: 1px solid #343c44;
		overflow: hidden;
		background: var(--surface-tool-card);
		display: flex;
		flex-direction: column;
	}

	.tool-visual {
		block-size: 165px;
		position: relative;
		overflow: hidden;
		border-block-end: 1px solid #303941;
		background: var(--surface-tool-visual);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tool-visual::before {
		content: '';
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(220, 255, 101, 0.07) 1px, transparent 1px),
			linear-gradient(90deg, rgba(220, 255, 101, 0.07) 1px, transparent 1px);
		background-size: 32px 32px;
	}

	.tool-visual svg {
		position: relative;
		z-index: 2;
		max-inline-size: 84%;
		max-block-size: 88%;
	}

	.visual-stamp {
		position: absolute;
		inset-inline-start: 24px;
		inset-block-end: 19px;
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #c5dc84;
		z-index: 3;
	}

	.visual-corner {
		position: absolute;
		inset-inline-end: 22px;
		inset-block-start: 19px;
		color: #859e5a;
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.tool-body {
		padding: 25px;
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.tool-tag {
		color: var(--acid);
		margin-block-end: 13px;
	}

	.tool-body p {
		color: #aeb8bb;
	}

	.tool-body ul {
		margin-block: 10px 23px;
		padding-inline-start: 18px;
		color: #c8cecc;
	}

	.tool-body li {
		padding-inline-start: 2px;
		margin-block-end: 8px;
		font-family: var(--font-sans);
		font-weight: 400;
		font-size: 0.9375rem;
		line-height: 1.7;
		letter-spacing: 0.005em;
		max-inline-size: 60ch;
	}

	.tool-body li::marker {
		color: var(--acid);
	}

	.tool-body .text-link {
		margin-block-start: auto;
	}

	@media (min-width: 768px) {
		.tools-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.tool-visual {
			block-size: 215px;
		}

		.tool-body {
			padding: 35px 37px 34px;
		}
	}

	@media (min-width: 1536px) {
		.tools-grid {
			gap: 24px;
		}
	}
</style>
