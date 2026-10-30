<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowUpRightIcon from 'phosphor-svelte/lib/ArrowUpRightIcon';
	import {
		PROOF_DOSSIER_ITEMS,
		TRUST_BAR_METRICS,
		type ProofDossierItem,
		type TrustMetric
	} from '#lib/data/homepage.ts';

	interface DeskStatus {
		edition: string;
		statusLabel: string;
	}

	interface Props {
		deskStatus: DeskStatus;
		proofItems?: readonly ProofDossierItem[];
		trustMetrics?: readonly TrustMetric[];
		onPreviewNavigate?: (href: string, targetId?: string, event?: MouseEvent) => void;
	}

	let {
		deskStatus,
		proofItems = PROOF_DOSSIER_ITEMS,
		trustMetrics = TRUST_BAR_METRICS,
		onPreviewNavigate
	}: Props = $props();
</script>

<!-- 01 / HERO: ONE semantic h1 with explicit whitespace separation between keyword and emotional spans -->
<section class="hero" aria-labelledby="hero-title">
	<div class="container hero-grid">
		<div class="hero-copy">
			<div class="eyebrow">WALL STREET THINKING. BUILT FOR MAIN STREET TRADERS.</div>
			<h1 class="hero-h1" id="hero-title">
				<span class="h1-query seo-kicker">
					Live Stock &amp; Options Trading Room, Mentorship &amp; Custom Indicators
				</span>
				<span class="h1-emotional">
					You Finally Found What You’ve Been Searching For.
					<em>Zero Hype. People Over Profits.</em>
				</span>
			</h1>
			<p class="hero-lead">
				Tired of expensive promises, hindsight screenshots, and indicators that look perfect only
				after the move? Revolution Trading Pros is built around a different idea: practical
				education, transparent trade planning, defined risk, and a genuine commitment to people.
			</p>
			<p class="hero-authority">
				Our founder’s story includes reported mentorship from Mark “Goldfinger” McGoldrick, advance
				market calls during 2020 and 2022, and a reported overnight OXY put-options return. These
				claims belong in documented, timestamped case studies—not unquestioned marketing slogans.
			</p>
			<blockquote class="hero-slogan">
				“Educate. Innovate. Prosper.”<br />
				Wall Street Protects Its Own. Mark “Goldfinger” McGoldrick Called Us the Future of Trading.
				<span class="highlight">We Are the Revolution.</span>
			</blockquote>
			<div class="hero-ctas">
				<a
					class="btn btn-primary"
					href={resolve('/memberships' as '/')}
					onclick={(e) => onPreviewNavigate?.('/memberships', 'memberships', e)}
				>
					Explore Our Memberships
					<span class="arrow" aria-hidden="true">
						<ArrowUpRightIcon size={16} weight="bold" />
					</span>
				</a>
				<a
					class="btn btn-outline"
					href={resolve('/about' as '/')}
					onclick={(e) => onPreviewNavigate?.('/about', 'track-record', e)}
				>
					See Track Record &amp; Evidence
					<span class="arrow" aria-hidden="true">
						<ArrowUpRightIcon size={16} weight="bold" />
					</span>
				</a>
			</div>
			<p class="hero-note">
				Educational services only. Trading can result in substantial losses, including loss of the
				entire amount invested.
			</p>
		</div>

		<aside class="proof-panel" aria-label="Founder-reported track record overview">
			<div class="panel-top">
				<div>
					<div class="panel-top-title">{deskStatus.edition}</div>
					<div class="panel-top-sub">Founder-reported history • Evidence publication pending</div>
				</div>
				<span class="panel-badge">{deskStatus.statusLabel}</span>
			</div>

			<div class="chart-illus" aria-label="Stylized, non-data market chart illustration">
				<span class="chart-illus-label">MARKET STRUCTURE / CONCEPTUAL</span>
				<span class="chart-illus-label r">NOT LIVE PRICE DATA</span>
				<svg viewBox="0 0 400 142" preserveAspectRatio="none" aria-hidden="true">
					<defs>
						<linearGradient id="lineShade" x1="0" x2="0" y1="0" y2="1">
							<stop stop-color="#dcff65" stop-opacity=".23" />
							<stop offset="1" stop-color="#dcff65" stop-opacity="0" />
						</linearGradient>
					</defs>
					<path d="M0 118H400M0 88H400M0 58H400M0 28H400" stroke="#344039" stroke-dasharray="3 5" />
					<path
						d="M0 127L24 117 42 120 63 87 88 94 114 63 133 76 156 93 176 73 196 86 224 43 243 65 265 51 286 66 310 31 332 48 351 37 372 28 400 12V142H0Z"
						fill="url(#lineShade)"
					/>
					<path
						d="M0 127L24 117 42 120 63 87 88 94 114 63 133 76 156 93 176 73 196 86 224 43 243 65 265 51 286 66 310 31 332 48 351 37 372 28 400 12"
						stroke="#dcff65"
						stroke-width="2.6"
						fill="none"
					/>
					<circle cx="310" cy="31" r="4.2" fill="#dcff65" stroke="#1b2820" stroke-width="3" />
				</svg>
			</div>

			<div class="panel-content">
				<h2 class="panel-head">The story behind<br />the desk.</h2>
				{#each proofItems as item (item.number)}
					<div class="proof-item">
						<span class="proof-number">{item.number}</span>
						<div>
							<h3>{item.title}</h3>
							<p>{item.description}</p>
						</div>
					</div>
				{/each}
			</div>

			<div class="proof-foot">
				<a
					class="text-link acid"
					href={resolve('/about' as '/')}
					onclick={(e) => onPreviewNavigate?.('/about', 'track-record', e)}
				>
					Explore the case studies
					<span class="arrow" aria-hidden="true">
						<ArrowUpRightIcon size={14} weight="bold" />
					</span>
				</a>
				<span class="evidence-flag">PROOF PENDING</span>
			</div>
		</aside>
	</div>

	<div class="trust-bar">
		<div class="container trust-grid">
			{#each trustMetrics as metric (metric.label)}
				<div class="trust-item">
					<div class="trust-label">{metric.label}</div>
					<div class="trust-value">{metric.value}</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.hero {
		position: relative;
		overflow: hidden;
		padding-block: 54px 0;
		background:
			radial-gradient(ellipse at 83% 15%, rgba(195, 231, 83, 0.1), transparent 28%), var(--bg);
	}

	.hero::before {
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

	.hero-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 12px;
		align-items: center;
		position: relative;
		z-index: 1;
	}

	.hero-copy {
		padding-block-end: 27px;
	}

	.hero .eyebrow {
		margin-block-end: 23px;
	}

	.h1-query {
		display: block;
		margin-block-end: 20px;
	}

	.h1-emotional {
		display: block;
	}

	.h1-emotional em {
		font-style: normal;
		color: var(--acid);
	}

	.hero-authority {
		color: #949ba1;
		font-family: var(--font-sans);
		font-weight: 400;
		font-size: 1rem;
		line-height: 1.78;
		letter-spacing: 0.005em;
		max-inline-size: min(70ch, 680px);
		margin-block-end: 24px;
	}

	.hero-slogan {
		margin-block: 27px 30px;
	}

	.hero-ctas {
		display: grid;
		gap: 12px;
	}

	.hero-ctas .btn {
		inline-size: 100%;
		max-inline-size: none;
	}

	.hero-note {
		font-family: var(--font-sans);
		font-weight: 400;
		font-stretch: 92%;
		font-variation-settings: 'wdth' 92;
		font-size: 0.75rem;
		line-height: 1.65;
		letter-spacing: 0.01em;
		color: #8b939b;
		margin-block-start: 19px;
		max-inline-size: 65ch;
	}

	.proof-panel {
		border: 1px solid var(--line-strong);
		background: linear-gradient(155deg, #1d242a, #12171b 68%);
		position: relative;
		box-shadow: 0 28px 72px rgba(0, 0, 0, 0.31);
		max-inline-size: 650px;
		margin: 0 auto 45px;
		inline-size: 100%;
	}

	.proof-panel::before {
		content: '';
		position: absolute;
		inset: -4px -4px auto auto;
		inline-size: 125px;
		block-size: 125px;
		border-block-start: 1px solid rgba(220, 255, 101, 0.5);
		border-inline-end: 1px solid rgba(220, 255, 101, 0.5);
		pointer-events: none;
	}

	.panel-top {
		padding: 20px;
		border-block-end: 1px solid #30363c;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 12px;
	}

	.panel-top-title {
		color: var(--acid);
	}

	.panel-top-sub {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		color: #858e92;
		margin-block-start: 4px;
	}

	.panel-badge {
		padding: 5px 8px;
		background: #2e3328;
		color: #d2e79a;
		white-space: nowrap;
	}

	.chart-illus {
		block-size: 141px;
		border-block-end: 1px solid #30363c;
		position: relative;
		overflow: hidden;
		padding-inline: 25px;
	}

	.chart-illus svg {
		inline-size: 100%;
		block-size: 100%;
	}

	.chart-illus-label {
		position: absolute;
		inset-block-start: 14px;
		inset-inline-start: 20px;
		font-family: var(--font-sans);
		font-weight: 700;
		font-stretch: 87.5%;
		font-variation-settings: 'wdth' 87.5;
		font-size: 0.6875rem;
		color: #8b938e;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.chart-illus-label.r {
		inset-block-start: 34px;
		inset-inline-start: 20px;
		inset-inline-end: auto;
		color: var(--acid);
	}

	.panel-content {
		padding: 20px;
	}

	.panel-head {
		font-size: clamp(1.35rem, 2vw, 1.65rem);
		line-height: 1.1;
		margin-block: 0 16px;
	}

	.proof-item {
		display: grid;
		grid-template-columns: 32px 1fr;
		gap: 10px;
		padding-block: 16px;
		border-block-start: 1px solid #333a41;
	}

	.proof-number {
		color: var(--acid);
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		padding-block-start: 3px;
		font-variant-numeric: tabular-nums;
	}

	.proof-item h3 {
		font-size: 1rem;
		line-height: 1.35;
		letter-spacing: -0.015em;
		margin-block: 0 6px;
	}

	.proof-item p {
		font-size: 0.875rem;
		line-height: 1.6;
		color: #aeb4b6;
		margin: 0;
	}

	.proof-foot {
		border-block-start: 1px solid #30363c;
		padding: 18px 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
	}

	.evidence-flag {
		color: var(--status-amber-text);
	}

	.trust-bar {
		border-block-start: 1px solid #2b3239;
		background: var(--bg-soft);
		position: relative;
		z-index: 1;
	}

	.trust-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}

	.trust-item {
		padding: 16px 0;
	}

	.trust-item:not(:first-child) {
		border-inline-start: 0;
		padding-inline-start: 0;
		border-block-start: 1px solid #2b3239;
	}

	.trust-label {
		color: var(--acid);
		margin-block-end: 7px;
	}

	.trust-value {
		color: var(--text);
	}

	@media (min-width: 480px) {
		.chart-illus-label {
			inset-inline-start: 25px;
		}

		.chart-illus-label.r {
			inset-block-start: 14px;
			inset-inline-start: auto;
			inset-inline-end: 25px;
		}

		.trust-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.trust-item {
			padding: 18px 13px 18px 0;
		}

		.trust-item:nth-child(2) {
			border-block-start: 0;
			border-inline-start: 1px solid #2b3239;
			padding-inline-start: 14px;
		}

		.trust-item:nth-child(3) {
			border-inline-start: 0;
			padding-inline-start: 0;
			border-block-start: 1px solid #2b3239;
		}

		.trust-item:nth-child(4) {
			border-inline-start: 1px solid #2b3239;
			padding-inline-start: 14px;
			border-block-start: 1px solid #2b3239;
		}
	}

	@media (min-width: 640px) {
		.hero-ctas {
			display: flex;
			flex-wrap: wrap;
		}

		.hero-ctas .btn {
			inline-size: auto;
			max-inline-size: 380px;
		}

		.proof-panel::before {
			inset: -9px -9px auto auto;
		}
	}

	@media (min-width: 768px) {
		.hero {
			padding-block-start: 69px;
		}

		.hero .eyebrow {
			margin-block-end: 31px;
		}

		.hero-copy {
			padding-block-end: 37px;
		}

		.proof-panel {
			margin-block-end: 60px;
		}

		.panel-top {
			padding: 23px 25px 18px;
		}

		.panel-content {
			padding: 22px 25px 21px;
		}

		.proof-foot {
			padding: 18px 25px;
		}

		.trust-item {
			padding: 25px 18px 29px 0;
		}

		.trust-item:nth-child(even) {
			padding-inline-start: 30px;
		}
	}

	@media (min-width: 1024px) {
		.hero {
			padding-block-start: 89px;
		}

		.hero-grid {
			grid-template-columns: minmax(0, 1.17fr) minmax(395px, 0.83fr);
			gap: 38px;
		}

		.hero-copy {
			padding-block-end: 90px;
		}

		.proof-panel {
			max-inline-size: none;
			margin: 0 0 90px;
		}

		.trust-grid {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}

		.trust-item:not(:first-child) {
			border-inline-start: 1px solid #2b3239;
			border-block-start: 0;
			padding-inline-start: 30px;
		}
	}

	@media (min-width: 1280px) {
		.hero-grid {
			gap: 68px;
		}
	}

	@media (min-width: 1536px) {
		.hero-grid {
			gap: 84px;
		}
	}
</style>
