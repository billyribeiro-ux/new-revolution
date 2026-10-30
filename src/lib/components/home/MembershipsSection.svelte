<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowUpRightIcon from 'phosphor-svelte/lib/ArrowUpRightIcon';
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';
	import { revealOnScroll } from '#lib/attachments/reveal.ts';
	import { MEMBERSHIP_TIERS, type MembershipTier } from '#lib/data/homepage.ts';

	interface Props {
		tiers?: readonly MembershipTier[];
		onPreviewNavigate?: (href: string, targetId?: string, event?: MouseEvent) => void;
	}

	let { tiers = MEMBERSHIP_TIERS, onPreviewNavigate }: Props = $props();
</script>

<!-- 05 / MEMBERSHIPS -->
<section class="section memberships" id="memberships" aria-labelledby="member-title">
	<div class="container">
		<div class="section-heading reveal" {@attach revealOnScroll}>
			<div class="eyebrow dark">REAL-TIME ROOMS / STRUCTURED MENTORSHIP / VIDEO ALERTS</div>
			<h2 id="member-title">
				Four ways to trade smarter.
				<span class="manifesto-accent">One people-first philosophy.</span>
			</h2>
			<p class="copy dark">
				Whether you trade actively, work a 9-to-5, have a limited account, or prefer prepared
				watchlists, choose a membership path tailored to your goals. Pricing is intentionally not
				shown in this blueprint.
			</p>
		</div>

		<div class="membership-grid">
			{#each tiers as tier (tier.index)}
				<article
					class={['membership', 'reveal', { featured: tier.featured }]}
					{@attach revealOnScroll}
				>
					<div class="member-top">
						<span class="membership-index">{tier.index}</span>
						<span class="member-tag">{tier.tag}</span>
					</div>
					<h3>{tier.title}</h3>
					<p class="member-description">{tier.description}</p>
					<ul class="member-list">
						{#each tier.bullets as bullet (bullet.lead)}
							<li>
								<span class="check-icon" aria-hidden="true">
									<CheckIcon size={16} weight="bold" />
								</span>
								<span>
									<strong>{bullet.lead}</strong>
									{bullet.body}
								</span>
							</li>
						{/each}
					</ul>
					<a
						class={['btn', { 'btn-primary': tier.featured }]}
						href={resolve(tier.href as '/')}
						onclick={(e) => onPreviewNavigate?.(tier.href, tier.previewTarget, e)}
					>
						<span>{tier.ctaLabel}</span>
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
	.memberships {
		background: var(--off);
		color: var(--ink);
	}

	.membership-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 18px;
	}

	.membership {
		background: var(--card-white);
		border: 1px solid var(--card-light-border);
		padding: 27px 23px;
		display: flex;
		flex-direction: column;
		min-block-size: 0;
		position: relative;
		overflow: hidden;
	}

	.membership.featured {
		border-color: var(--card-featured-border);
		background: var(--card-featured-bg);
	}

	.membership.featured::before {
		content: '';
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: 0;
		inline-size: 100%;
		block-size: 5px;
		background: var(--card-featured-strip);
	}

	.member-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 15px;
		margin-block-end: 28px;
	}

	.membership-index {
		color: #5b6551;
	}

	.member-tag {
		background: #e8ebdf;
		color: #38422f;
		padding: 6px 9px;
		text-align: right;
	}

	.membership.featured .member-tag {
		background: var(--card-featured-badge);
	}

	.member-description {
		color: var(--lightmuted);
		margin-block-end: 20px;
	}

	.member-list {
		list-style: none;
		padding: 0;
		margin: 0 0 28px;
	}

	.member-list li {
		padding-block: 12px;
		border-block-start: 1px solid #e2e5de;
		display: grid;
		grid-template-columns: 20px 1fr;
		gap: 11px;
		font-family: var(--font-sans);
		font-weight: 400;
		font-stretch: 100%;
		font-size: 0.9375rem;
		line-height: 1.65;
		letter-spacing: 0.005em;
		max-inline-size: 60ch;
		color: #46504e;
	}

	.member-list li .check-icon {
		margin-block-start: 4px;
		color: #596c30;
	}

	.member-list strong {
		font-family: var(--font-sans);
		font-weight: 700;
		color: #1c2425;
	}

	.membership .btn {
		margin-block-start: auto;
		inline-size: 100%;
		max-inline-size: none;
		justify-content: space-between;
	}

	.membership .btn:not(.btn-primary) {
		background: var(--ink);
		color: #f5f5f2;
	}

	.membership .btn:not(.btn-primary):hover {
		background: var(--btn-dark-hover);
	}

	@media (min-width: 768px) {
		.membership-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.membership {
			padding: 29px;
		}
	}

	@media (min-width: 1024px) {
		.membership {
			padding: 37px;
			min-block-size: 610px;
		}
	}

	@media (min-width: 1536px) {
		.membership-grid {
			gap: 24px;
		}
	}
</style>
