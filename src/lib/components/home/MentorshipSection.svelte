<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowUpRightIcon from 'phosphor-svelte/lib/ArrowUpRightIcon';
	import { revealOnScroll } from '#lib/attachments/reveal.ts';
	import { MENTORSHIP_STEPS, type MentorshipStep } from '#lib/data/homepage.ts';

	interface Props {
		steps?: readonly MentorshipStep[];
		onPreviewNavigate?: (href: string, targetId?: string, event?: MouseEvent) => void;
	}

	let { steps = MENTORSHIP_STEPS, onPreviewNavigate }: Props = $props();
</script>

<!-- 07 / PRIVATE MENTORSHIP -->
<section class="section mentorship section-grid" id="mentorship" aria-labelledby="mentor-title">
	<div class="container">
		<div class="mentor-frame reveal" {@attach revealOnScroll}>
			<div>
				<div class="eyebrow">STRICTLY BY APPLICATION &amp; APPROVAL</div>
				<h2 id="mentor-title">
					Private 1-on-1 Mentorship.
					<span class="highlight">You cannot just buy your way in.</span>
				</h2>
				<p>
					Personal mentoring should be built on genuine fit, mutual commitment, and realistic
					objectives. Our founder’s reported personal mentorship experience inspired this selective
					program.
				</p>
				<p>
					There is no instant “buy now” checkout for private 1-on-1 sessions. Candidates describe
					their background, challenges, goals, and ability to commit to the process. Applications
					are reviewed before any offer is made.
				</p>
				<blockquote class="mentor-quote">
					The standard is commitment to the process—not the size of your credit card.
				</blockquote>
			</div>

			<div class="mentor-steps">
				<h3>How the application works.</h3>
				{#each steps as step (step.number)}
					<div class="mentor-step">
						<span>{step.number}</span>
						<div>
							<strong>{step.title}</strong>
							<p>{step.description}</p>
						</div>
					</div>
				{/each}
				<a
					class="btn btn-primary"
					href={resolve('/mentorship' as '/')}
					onclick={(e) => onPreviewNavigate?.('/mentorship', 'mentorship', e)}
				>
					<span>Apply for 1-on-1 Mentorship</span>
					<span class="arrow" aria-hidden="true">
						<ArrowUpRightIcon size={16} weight="bold" />
					</span>
				</a>
				<p class="mentor-micro">
					Application only. Acceptance is not guaranteed. No promise of investment results.
				</p>
			</div>
		</div>
	</div>
</section>

<style>
	.mentorship {
		background: var(--surface-mentorship);
	}

	.section-grid::before {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.022) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.022) 1px, transparent 1px);
		background-size: 66px 66px;
		mask-image: linear-gradient(to bottom, #000, transparent 80%);
	}

	.mentor-frame {
		border: 1px solid #576747;
		position: relative;
		background:
			linear-gradient(120deg, rgba(195, 232, 112, 0.07), transparent 55%),
			var(--surface-mentor-frame);
		padding: 29px 20px;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 32px;
	}

	.mentor-frame::before,
	.mentor-frame::after {
		content: '';
		position: absolute;
		inline-size: 17px;
		block-size: 17px;
		border-color: var(--acid);
		border-style: solid;
	}

	.mentor-frame::before {
		inset-block-start: -2px;
		inset-inline-start: -2px;
		border-width: 2px 0 0 2px;
	}

	.mentor-frame::after {
		inset-block-end: -2px;
		inset-inline-end: -2px;
		border-width: 0 2px 2px 0;
	}

	.mentor-frame p {
		color: #b1b9b8;
	}

	.mentor-quote {
		margin-block-start: 28px;
	}

	.mentor-steps {
		padding: 24px 19px;
		background: #0f1417;
		border: 1px solid #333d39;
	}

	.mentor-steps h3 {
		margin-block-end: 24px;
	}

	.mentor-step {
		display: grid;
		grid-template-columns: 48px 1fr;
		gap: 9px;
		padding-block: 18px;
		border-block-start: 1px solid #2c3632;
	}

	.mentor-step span {
		font-family: var(--font-display);
		font-weight: 900;
		font-size: 1.05rem;
		color: var(--acid);
		font-variant-numeric: tabular-nums;
	}

	.mentor-step strong {
		display: block;
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.9375rem;
		color: var(--text);
		margin-block-end: 5px;
	}

	.mentor-step p {
		font-size: 0.875rem;
		line-height: 1.65;
		margin: 0;
	}

	.mentor-steps .btn {
		inline-size: 100%;
		max-inline-size: none;
		margin-block-start: 22px;
	}

	.mentor-micro {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		line-height: 1.6;
		color: #9ea69b;
		margin: 14px 0 0;
		text-align: center;
	}

	@media (min-width: 768px) {
		.mentor-frame {
			padding: 45px;
		}

		.mentor-steps {
			padding: 28px;
		}
	}

	@media (min-width: 1024px) {
		.mentor-frame {
			grid-template-columns: minmax(0, 1.14fr) minmax(0, 0.86fr);
			gap: 35px;
			padding: 45px;
		}
	}

	@media (min-width: 1280px) {
		.mentor-frame {
			gap: 75px;
			padding: 53px 57px;
		}
	}
</style>
