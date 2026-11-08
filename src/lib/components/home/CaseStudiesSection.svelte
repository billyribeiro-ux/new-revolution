<script lang="ts">
	import { revealOnScroll } from '#lib/attachments/reveal.ts';
	import {
		VERIFIED_CASE_STUDIES,
		isPublishableCaseStudy,
		type VerifiedCaseStudy
	} from '#lib/data/homepage.ts';

	interface Props {
		studies?: readonly VerifiedCaseStudy[];
	}

	let { studies = VERIFIED_CASE_STUDIES }: Props = $props();

	// Only fully documented trades render. An incomplete record is dropped rather than shown as "pending".
	let published = $derived(studies.filter(isPublishableCaseStudy));

	// Fixed zone so the server render and the browser agree (US market time).
	const instantFormat = new Intl.DateTimeFormat('en-US', {
		dateStyle: 'medium',
		timeStyle: 'short',
		timeZone: 'America/New_York'
	});
	const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });

	const formatInstant = (iso: string) => instantFormat.format(new Date(iso));
	const formatDate = (iso: string) => dateFormat.format(new Date(`${iso}T00:00:00Z`));
</script>

<!-- 02 / CASE STUDIES: renders nothing until at least one trade is fully documented -->
{#if published.length > 0}
	<section class="section cases" id="track-record" aria-labelledby="cases-title">
		<div class="container">
			<div class="section-heading reveal" {@attach revealOnScroll}>
				<div class="eyebrow">DOCUMENTED TRADES</div>
				<h2 id="cases-title">
					Market history deserves <span class="highlight">real evidence.</span>
				</h2>
				<p class="copy">
					Each record lists the exact contract, the entry and exit times, the position size and the
					maximum risk, next to the chart as it was communicated.
				</p>
			</div>

			<div class="case-grid">
				{#each published as study (study.id)}
					<article class="case reveal" {@attach revealOnScroll}>
						<div class="case-top">
							<span class="case-kicker">{study.kicker}</span>
						</div>
						<h3>{study.title}</h3>
						<p>{study.summary}</p>
						<img
							class="case-chart"
							src={study.chart.src}
							width={study.chart.width}
							height={study.chart.height}
							alt={study.chart.alt}
							loading="lazy"
							decoding="async"
						/>
						<dl class="case-facts">
							<div>
								<dt>Contract</dt>
								<dd>{study.contractSymbol}</dd>
							</div>
							<div>
								<dt>Strike</dt>
								<dd>{study.strike}</dd>
							</div>
							<div>
								<dt>Expiration</dt>
								<dd><time datetime={study.expiration}>{formatDate(study.expiration)}</time></dd>
							</div>
							<div>
								<dt>Entered</dt>
								<dd><time datetime={study.enteredAt}>{formatInstant(study.enteredAt)}</time></dd>
							</div>
							<div>
								<dt>Exited</dt>
								<dd><time datetime={study.exitedAt}>{formatInstant(study.exitedAt)}</time></dd>
							</div>
							<div>
								<dt>Position size</dt>
								<dd>{study.positionSize}</dd>
							</div>
							<div>
								<dt>Maximum risk</dt>
								<dd>{study.maxRisk}</dd>
							</div>
							<div>
								<dt>Result</dt>
								<dd>{study.result}</dd>
							</div>
						</dl>
					</article>
				{/each}
			</div>

			<p class="cases-foot">
				Evidence standard: performance examples are not typical results and do not imply that
				similar returns can be repeated. These records are published by Revolution Trading Pros and
				have not been independently audited.
			</p>
		</div>
	</section>
{/if}

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
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--acid);
	}

	.case h3 {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--step-h3);
		line-height: var(--leading-card-h3);
		letter-spacing: var(--tracking-h3);
		margin-block-end: 8px;
	}

	.case p {
		font-family: var(--font-sans);
		font-weight: 450;
		font-size: 0.9375rem;
		line-height: 1.6;
		color: #b3bbc0;
		margin-block-end: 20px;
	}

	.case-chart {
		inline-size: 100%;
		block-size: auto;
		aspect-ratio: 16 / 9;
		border: 1px solid #333b43;
		margin-block-end: 20px;
	}

	.case-facts {
		border-block-start: 1px solid #333b43;
		margin: auto 0 0;
		padding-block-start: 16px;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px 16px;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		line-height: 1.5;
	}

	.case-facts dt {
		color: #9fa8a8;
		font-weight: 500;
	}

	.case-facts dd {
		margin: 0;
		color: #e7e9e4;
		font-weight: 700;
		overflow-wrap: anywhere;
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
