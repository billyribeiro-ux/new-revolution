<script lang="ts">
	import { revealOnScroll } from '#lib/attachments/reveal.ts';
	import { CASE_STUDIES, type CaseStudy } from '#lib/data/homepage.ts';

	interface Props {
		studies?: readonly CaseStudy[];
	}

	let { studies = CASE_STUDIES }: Props = $props();
</script>

<!-- 02 / CASE STUDIES -->
<section class="section cases" id="track-record" aria-labelledby="cases-title">
	<div class="container">
		<div class="section-heading reveal" {@attach revealOnScroll}>
			<div class="eyebrow">THE RECEIPTS SHOULD SPEAK</div>
			<h2 id="cases-title">
				Market history deserves <span class="highlight">real evidence.</span>
			</h2>
			<p class="copy">
				A serious trading case study should show what was communicated, when it was communicated,
				how the instrument worked, and what could have gone wrong. This preview reserves room for
				that documentation.
			</p>
		</div>

		<div class="case-grid">
			{#each studies as study (study.kicker)}
				<article class="case reveal" {@attach revealOnScroll}>
					<div class="case-top">
						<span class="case-kicker">{study.kicker}</span>
						<span class="case-state">{study.state}</span>
					</div>
					<h3>{study.title}</h3>
					<p>{study.description}</p>
					<div class="case-evidence">
						<strong>Publish:</strong>
						{study.evidenceRequirement}
					</div>
				</article>
			{/each}
		</div>

		<p class="cases-foot">
			Evidence standard: performance examples are not typical results and do not imply that similar
			returns can be repeated. No track record has been independently authenticated in this design
			preview.
		</p>
	</div>
</section>

<style>
	.cases {
		background: var(--surface-cases);
	}

	.case-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 16px;
	}

	.case {
		border: 1px solid #333b43;
		background: var(--surface-case-card);
		padding: 28px;
		min-block-size: 0;
		display: flex;
		flex-direction: column;
		transition:
			transform 0.25s var(--ease-out),
			border-color 0.25s var(--ease-out);
	}

	.case:hover {
		transform: translateY(-4px);
		border-color: #66764d;
	}

	.case-top {
		display: flex;
		justify-content: space-between;
		gap: 10px;
		align-items: center;
		margin-block-end: 22px;
	}

	.case-kicker {
		color: var(--acid);
	}

	.case-state {
		color: var(--status-amber-text);
		border: 1px solid var(--status-amber-border);
		padding: 5px 8px;
	}

	.case p {
		color: #b3bbc0;
		margin-block-end: 20px;
	}

	.case-evidence {
		border-block-start: 1px solid #333b43;
		margin-block-start: auto;
		padding-block-start: 16px;
		font-family: var(--font-sans);
		font-size: 0.8125rem;
		line-height: 1.65;
		color: #9fa8a8;
	}

	.case-evidence strong {
		color: #e7e9e4;
		font-weight: 700;
	}

	.cases-foot {
		margin-block-start: 24px;
		font-size: 0.875rem;
		line-height: 1.7;
		color: #a4a9a8;
		max-inline-size: 910px;
	}

	@media (min-width: 1024px) {
		.case-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 16px;
		}

		.case {
			min-block-size: 310px;
		}

		.case-top {
			margin-block-end: 32px;
		}
	}

	@media (min-width: 1536px) {
		.case-grid {
			gap: 24px;
		}
	}
</style>
