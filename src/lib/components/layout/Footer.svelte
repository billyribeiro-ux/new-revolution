<script lang="ts">
	import { resolve } from '$app/paths';
	import logo from '#lib/assets/REvolution-Trading-Pros-logo.png?enhanced';
	import { FOOTER_COLUMNS } from '#lib/data/homepage.ts';
	import PreFooter from './PreFooter.svelte';
	import EnvelopeIcon from 'phosphor-svelte/lib/EnvelopeIcon';
	import FileTextIcon from 'phosphor-svelte/lib/FileTextIcon';
	import ShieldCheckIcon from 'phosphor-svelte/lib/ShieldCheckIcon';
	import TreeStructureIcon from 'phosphor-svelte/lib/TreeStructureIcon';
	import WarningIcon from 'phosphor-svelte/lib/WarningIcon';

	interface Props {
		currentYear?: number;
		/** Show the recognition strip above "Have Questions?" (homepage only). */
		showPress?: boolean;
		/** Set false on non-marketing pages to hide the support and social blocks. */
		showPreFooter?: boolean;
		onPreviewNavigate?: (href: string, targetId?: string, event?: MouseEvent) => void;
	}

	let {
		currentYear = 2026,
		showPress = false,
		showPreFooter = true,
		onPreviewNavigate
	}: Props = $props();

	const bottomLinks = [
		{ label: 'Privacy Policy', href: '/privacy-policy', icon: ShieldCheckIcon },
		{ label: 'Terms of Service', href: '/terms-of-service', icon: FileTextIcon },
		{ label: 'Contact', href: '/contact', icon: EnvelopeIcon },
		{ label: 'Sitemap', href: '/sitemap.xml', icon: TreeStructureIcon }
	] as const;

	function handleClick(href: string, targetId: string | undefined, event: MouseEvent) {
		onPreviewNavigate?.(href, targetId, event);
	}
</script>

{#if showPreFooter}
	<PreFooter {showPress} {onPreviewNavigate} />
{/if}

<footer class="footer" id="footer">
	<div class="container">
		<div class="footer-grid">
			<div class="footer-brand">
				<a
					class="brand"
					href={resolve('/')}
					aria-label="Revolution Trading Pros homepage"
					onclick={(e) => handleClick('/', 'top', e)}
				>
					<span class="brand-logo-wrap">
						<enhanced:img src={logo} alt="Revolution Trading Pros emblem" />
					</span>
					<span class="brand-text">
						<span class="brand-name">REVOLUTION<br />TRADING PROS</span>
						<span class="brand-tagline">EDUCATE • INNOVATE • PROSPER</span>
					</span>
				</a>
				<p>
					Education, innovative tools, and a community approach grounded in transparent risk. People
					over profits.
				</p>
			</div>

			{#each FOOTER_COLUMNS as col (col.id)}
				<nav class="footer-col" aria-labelledby={col.id}>
					<p class="footer-col-title" id={col.id}>{col.title}</p>
					<ul>
						{#each col.links as link (link.href)}
							<li>
								<a
									href={resolve(link.href as '/')}
									onclick={(e) => handleClick(link.href, link.previewTarget, e)}
								>
									{link.label}
								</a>
							</li>
						{/each}
					</ul>
				</nav>
			{/each}
		</div>

		<div class="risk-box">
			<p class="risk-box-title">IMPORTANT RISK DISCLOSURE / UNITED STATES &amp; CANADA</p>
			<p>
				Revolution Trading Pros is a financial education and market research publisher and is not
				registered as a broker-dealer, investment adviser, or futures commission merchant with the
				U.S. Securities and Exchange Commission (SEC), Commodity Futures Trading Commission (CFTC),
				Financial Industry Regulatory Authority (FINRA), or Canadian provincial securities
				regulators including the Ontario Securities Commission (OSC), British Columbia Securities
				Commission (BCSC), and Alberta Securities Commission (ASC). Trading stocks and options
				involves significant risk and is not suitable for everyone. Options can expire worthless and
				may result in a total loss of premium; some strategies can expose traders to losses greater
				than their initial investment. Leverage, short-term trading, market volatility, and
				liquidity can increase the risk of loss. Educational content, hypothetical examples, trade
				ideas, alerts, and commentary are not guarantees of performance. Past performance does not
				predict future results. Consult appropriately registered professionals where needed. The
				regulatory status, geographic eligibility, and full legal disclosures of any offered
				services must be reviewed before launch.
			</p>
		</div>

		<div class="footer-bottom">
			<p class="footer-copy">
				© <span id="year">{currentYear}</span> Revolution Trading Pros. All rights reserved.
				<span class="accent">Educate • Innovate • Prosper.</span>
			</p>

			<nav class="footer-legal-links" aria-label="Legal and site information">
				<ul>
					{#each bottomLinks as link (link.href)}
						<li>
							<a
								href={resolve(link.href as '/')}
								onclick={(e) => handleClick(link.href, 'footer', e)}
							>
								<link.icon size={14} weight="bold" aria-hidden="true" />
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</nav>

			<p class="footer-note">
				<WarningIcon size={14} weight="bold" aria-hidden="true" />
				Educational content only. Not investment advice. Trading involves substantial risk of loss.
			</p>
		</div>
	</div>
</footer>

<style>
	.footer {
		background: var(--surface-footer);
		padding-block: 59px 24px;
	}

	.footer-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 27px;
	}

	.footer-brand {
		grid-column: 1 / -1;
		grid-row: auto;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
		min-inline-size: 0;
		margin-block-end: 22px;
	}

	.brand-logo-wrap {
		inline-size: 36px;
		block-size: 36px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.brand-logo-wrap :global(picture),
	.brand-logo-wrap :global(img) {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		object-position: left center;
	}

	.brand-text {
		display: flex;
		flex-direction: column;
	}

	.brand-name {
		display: block;
		font-family: var(--font-display);
		font-weight: 900;
		font-size: 0.9375rem;
		line-height: 1.02;
		letter-spacing: -0.025em;
		text-transform: uppercase;
		inline-size: fit-content;
		color: var(--text);
	}

	.brand-tagline {
		display: block;
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.52rem;
		line-height: 1.1;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		inline-size: fit-content;
		color: var(--acid);
		margin-block-start: 3px;
	}

	.footer-brand p {
		font-size: 0.875rem;
		line-height: 1.75;
		color: #9ba4a8;
		max-inline-size: 32ch;
	}

	.footer-col-title {
		color: #f3f6ef;
		margin-block: 0 20px;
	}

	.footer-col ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.footer-col li {
		margin-block-end: 13px;
	}

	.footer-col a {
		font-family: var(--font-sans);
		font-weight: 500;
		font-size: 0.875rem;
		line-height: 1.5;
		color: #9ba4a8;
		transition: color 0.18s;
	}

	.footer-col a:hover {
		color: var(--acid);
	}

	.risk-box {
		margin-block-start: 65px;
		padding-block: 25px 20px;
		border-block-start: 1px solid #2c333a;
		border-block-end: 1px solid #2c333a;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.risk-box p {
		font-family: var(--font-sans);
		font-weight: 400;
		font-size: 0.75rem;
		line-height: 1.85;
		letter-spacing: 0.01em;
		max-inline-size: min(110ch, 1200px);
		color: #949b9e;
		margin-block: 0;
		margin-inline: auto;
		text-align: center;
	}

	.risk-box .risk-box-title {
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.75rem;
		line-height: 1.5;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #d8dfd1;
		inline-size: 100%;
		max-inline-size: min(110ch, 1200px);
		margin-block: 0 10px;
		margin-inline: auto;
		text-align: center;
	}

	.footer-bottom {
		display: grid;
		gap: 16px;
		align-items: center;
		padding-block-start: 24px;
		color: #8e979a;
		font-family: var(--font-sans);
		font-size: 0.8125rem;
		line-height: 1.6;
		letter-spacing: 0.01em;
	}

	.footer-bottom p {
		margin: 0;
		max-inline-size: none;
	}

	.footer-copy .accent {
		display: inline-block;
		color: var(--acid);
		font-weight: 600;
	}

	.footer-legal-links ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 8px 8px;
	}

	.footer-legal-links a {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-block-size: 36px;
		padding: 6px 12px;
		color: #aab2b6;
		font-weight: 600;
		border: 1px solid #2c333a;
		transition:
			color 0.18s var(--ease-out),
			border-color 0.18s var(--ease-out),
			background-color 0.18s var(--ease-out);
	}

	.footer-legal-links a:hover,
	.footer-legal-links a:focus-visible {
		color: var(--acid);
		border-color: rgba(220, 255, 101, 0.5);
		background: rgba(220, 255, 101, 0.06);
	}

	.footer-note {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		color: #8e979a;
		font-size: 0.75rem;
	}

	.footer-note :global(svg) {
		flex: none;
		margin-block-start: 3px;
		color: var(--status-amber-text);
	}

	@media (min-width: 480px) {
		.brand {
			gap: 0.75rem;
		}

		.brand-name {
			font-size: clamp(1.05rem, 1.5vw, 1.35rem);
		}

		.brand-tagline {
			font-size: 0.65rem;
			letter-spacing: 0.16em;
			margin-block-start: 5px;
		}

		.footer-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 640px) {
		.brand-logo-wrap {
			inline-size: 46px;
			block-size: 46px;
		}

		.footer-bottom {
			grid-template-columns: minmax(0, 1fr) auto;
		}

		.footer-note {
			grid-column: 1 / -1;
		}
	}

	@media (min-width: 768px) {
		.footer {
			padding-block-start: 79px;
		}

		.footer-grid {
			grid-template-columns: 1.5fr repeat(3, minmax(0, 1fr));
			row-gap: 32px;
		}

		.footer-brand {
			grid-column: auto;
			grid-row: span 2;
		}
	}

	@media (min-width: 1024px) {
		.footer-grid {
			grid-template-columns: 1.65fr repeat(5, minmax(0, 1fr));
			gap: 21px;
		}

		.footer-brand {
			grid-row: auto;
		}
	}

	@media (min-width: 1280px) {
		.footer-grid {
			gap: 35px;
		}
	}

	@media (min-width: 1536px) {
		.footer-grid {
			gap: 42px;
		}
	}
</style>
