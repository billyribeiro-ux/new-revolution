<script lang="ts">
	import { revealOnScroll } from '#lib/attachments/reveal.ts';
	import { FAQ_ITEMS, type FaqItem } from '#lib/data/homepage.ts';

	interface Props {
		faqs?: readonly FaqItem[];
	}

	let { faqs = FAQ_ITEMS }: Props = $props();
</script>

<!-- 10 / FAQ (<h3> inside <summary>) -->
<section class="section faq" id="faq" aria-labelledby="faq-title">
	<div class="container faq-grid">
		<div class="reveal" {@attach revealOnScroll}>
			<div class="eyebrow">QUESTIONS / STRAIGHT ANSWERS</div>
			<h2 id="faq-title">
				Good questions deserve <span class="highlight">clear answers.</span>
			</h2>
			<p class="faq-note">
				Find the membership structure that fits your schedule and level, understand the approval
				process, and review risk before making a decision.
			</p>
		</div>

		<div class="faqs reveal" {@attach revealOnScroll}>
			{#each faqs as faq (faq.id)}
				<details>
					<summary>
						<h3 class="faq-question">{faq.question}</h3>
					</summary>
					<p>{faq.answer}</p>
				</details>
			{/each}
		</div>
	</div>
</section>

<style>
	.faq {
		background: var(--surface-faq);
	}

	.faq-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 24px;
	}

	.faq-note {
		color: #a5adb1;
	}

	.faqs {
		border-block-start: 1px solid #3c4449;
	}

	.faqs details {
		border-block-end: 1px solid #3c4449;
	}

	.faqs summary {
		list-style: none;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 26px;
		padding-block: 23px;
		cursor: pointer;
		font-family: var(--font-display);
		font-weight: 700;
		font-stretch: 100%;
		font-size: clamp(1.0625rem, 1.3vw, 1.1875rem);
		line-height: 1.45;
		letter-spacing: -0.01em;
		color: var(--text);
	}

	.faqs summary::-webkit-details-marker {
		display: none;
	}

	.faqs summary .faq-question {
		font-family: var(--font-display);
		font-weight: 700;
		font-stretch: 100%;
		font-size: clamp(1.0625rem, 1.3vw, 1.1875rem);
		line-height: 1.45;
		letter-spacing: -0.01em;
		max-inline-size: min(65ch, 820px);
		margin: 0;
		color: var(--text);
	}

	.faqs summary::after {
		content: '+';
		color: var(--acid);
		font-family: var(--font-display);
		font-weight: 500;
		font-size: 1.75rem;
		line-height: 1;
		flex: none;
	}

	.faqs details[open] summary::after {
		content: '−';
	}

	.faqs details p {
		margin: -4px 40px 25px 0;
		color: #aab3b7;
		font-family: var(--font-sans);
		font-weight: 400;
		font-stretch: 100%;
		font-size: 0.96875rem;
		line-height: 1.8;
		letter-spacing: 0.005em;
		max-inline-size: min(68ch, 780px);
	}

	@media (min-width: 1024px) {
		.faq-grid {
			grid-template-columns: minmax(0, 0.75fr) minmax(0, 1.25fr);
			gap: 78px;
		}
	}
</style>
