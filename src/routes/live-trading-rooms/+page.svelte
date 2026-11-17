<!-- src/routes/live-trading-rooms/+page.svelte -->
<script lang="ts">
	import { BRAND } from '#lib/config/brand.ts';
	import { resolve } from '$app/paths';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import ArrowUpRightIcon from 'phosphor-svelte/lib/ArrowUpRightIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';
	import { JsonLd } from 'svelte-meta-tags';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import {
		CAPITAL_CHOICES,
		DESK_PROTOCOL_STEPS,
		ECOSYSTEM_BRIDGE_CARDS,
		LIVE_TRADING_ROOMS_CARDS,
		SCHEDULE_CHOICES,
		THREE_ROOM_MATRIX_ROWS,
		UNIQUE_ROOM_RECOMMENDATIONS,
		resolveRoomRecommendation,
		type AccountSizeBracket,
		type ScheduleAvailability
	} from '#lib/data/live-trading-rooms-hub.ts';
	import { LIVE_TRADING_ROOMS_HUB_FAQ_ITEMS } from '#lib/seo/structured-data.ts';
	import { CONCEPT_PREVIEW, openConceptOffer } from '#lib/shared/development-status.ts';
	import { scrollToSection } from '#lib/utils/scroll.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let selectedSchedule = $state<ScheduleAvailability>('morning-bell');
	let selectedCapital = $state<AccountSizeBracket>('2500-to-25k');

	let recommendation = $derived(resolveRoomRecommendation(selectedSchedule, selectedCapital));
	let selectedRoom = $state<string | null>(null);
	const activeRoom = $derived(
		LIVE_TRADING_ROOMS_CARDS.find(
			(room) => room.id === (selectedRoom ?? recommendation.primaryRoomId)
		) ?? LIVE_TRADING_ROOMS_CARDS[0]
	);
	function handleRoomKey(event: KeyboardEvent) {
		const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
		if (!keys.includes(event.key)) return;
		event.preventDefault();
		const index = LIVE_TRADING_ROOMS_CARDS.findIndex((room) => room.id === activeRoom.id);
		const next =
			event.key === 'Home'
				? 0
				: event.key === 'End'
					? LIVE_TRADING_ROOMS_CARDS.length - 1
					: (index + (event.key === 'ArrowRight' ? 1 : -1) + LIVE_TRADING_ROOMS_CARDS.length) %
						LIVE_TRADING_ROOMS_CARDS.length;
		selectedRoom = LIVE_TRADING_ROOMS_CARDS[next].id;
		const list = (event.currentTarget as HTMLElement).parentElement;
		list?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
	}
</script>

<JsonLd schema={data.jsonLdSchema} />

<a class="skip" href="#live-trading-rooms-page">Skip to content</a>

<Navbar />

<main id="live-trading-rooms-page" class="inner-page rooms-hub-page">
	<!-- =========================================================================
       BREADCRUMB & DESK DIRECTORY BAR
       ========================================================================= -->
	<nav class="breadcrumb-bar" aria-label="Breadcrumb">
		<div class="container breadcrumb-bar__inner">
			<ol class="breadcrumb-list">
				<li><a href={resolve('/')}>Home</a></li>
				<li aria-hidden="true" class="crumb-sep"><CaretRightIcon size={12} weight="bold" /></li>
				<li aria-current="page">Live Trading Rooms</li>
			</ol>
			<p class="breadcrumb-bar__telemetry">
				<span>3 Dedicated Desks</span> · <span>Stocks, ETFs &amp; Options</span> ·
				<span>US &amp; Canada</span>
			</p>
		</div>
	</nav>

	<!-- =========================================================================
       SECTION 1: COMPACT DARK ROUTING HERO + INLINE ROOM FIT SELECTOR
       ========================================================================= -->
	<section class="section hero-section hub-hero" aria-labelledby="rooms-hub-h1">
		<div class="container hub-hero__grid">
			<div class="hub-hero__main">
				<div class="eyebrow-pill">
					<span class="eyebrow-pill__badge">Live Trading Rooms</span>
					<span class="eyebrow-pill__text">Defined Risk Parameters · Recorded Archives</span>
				</div>

				<hgroup>
					<p class="hero-h1__seo-kicker seo-kicker">Stock, ETF &amp; Options Trading Rooms</p>
					<h1 id="rooms-hub-h1" class="hero-h1">
						<span class="hero-h1__display">
							Three Dedicated Rooms. Structured Around Your Schedule and Capital.
						</span>
					</h1>
				</hgroup>

				<p class="lead-copy hub-hero__lead">
					Intraday execution at the 9:30 AM ET opening bell, multi-day swing planning outside work
					hours, and $500+ small-account risk management require separate preparation schedules and
					position-sizing rules. Review all three rooms side by side below, or select your schedule
					and account bracket to highlight the room structured for your routine.
				</p>

				<div class="cta-row">
					<button
						type="button"
						class="btn btn-primary"
						onclick={() => scrollToSection('three-live-rooms')}
					>
						<span>Compare All 3 Rooms</span>
						<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
					</button>
					<button
						type="button"
						class="btn btn-outline"
						onclick={() => scrollToSection('side-by-side-matrix')}
					>
						View 7-Point Specifications
					</button>
				</div>

				<p class="hub-byline">
					Reviewed by the
					<a href={resolve('/about')}>{BRAND.name} Editorial &amp; Trading Desk</a>
					· Updated <time datetime="2026-11-15">November 15, 2026</time> · Educational market research;
					trading equities and options involves substantial risk of loss.
				</p>
			</div>

			<!-- Inline 2-Click Fit Selector -->
			<aside id="room-fit-selector" class="fit-selector" aria-labelledby="fit-selector-h2">
				<div class="fit-selector__header">
					<div>
						<span class="fit-selector__kicker">Room Fit Guide</span>
						<h2 id="fit-selector-h2" class="fit-selector__title">
							Match by Schedule &amp; Account Size
						</h2>
					</div>
					<span class="fit-selector__tag">Interactive</span>
				</div>

				<div class="fit-selector__controls">
					<div class="fit-group">
						<span id="fit-schedule-label" class="fit-group__label"> 01 / Market Availability </span>
						<div class="fit-group__pills" role="group" aria-labelledby="fit-schedule-label">
							{#each SCHEDULE_CHOICES as choice (choice.id)}
								<button
									type="button"
									class={['fit-pill', { 'is-selected': selectedSchedule === choice.id }]}
									aria-pressed={selectedSchedule === choice.id}
									onclick={() => {
										selectedSchedule = choice.id;
										selectedRoom = null;
									}}
								>
									<span class="fit-pill__label">{choice.label}</span>
									<span class="fit-pill__sub">{choice.sublabel}</span>
								</button>
							{/each}
						</div>
					</div>

					<div class="fit-group">
						<span id="fit-capital-label" class="fit-group__label">
							02 / Starting Account Bracket
						</span>
						<div class="fit-group__pills" role="group" aria-labelledby="fit-capital-label">
							{#each CAPITAL_CHOICES as choice (choice.id)}
								<button
									type="button"
									class={['fit-pill', { 'is-selected': selectedCapital === choice.id }]}
									aria-pressed={selectedCapital === choice.id}
									onclick={() => {
										selectedCapital = choice.id;
										selectedRoom = null;
									}}
								>
									<span class="fit-pill__label">{choice.label}</span>
									<span class="fit-pill__sub">{choice.sublabel}</span>
								</button>
							{/each}
						</div>
					</div>
				</div>

				<div class="fit-result" aria-live="polite">
					<div class="fit-result__head">
						{#each UNIQUE_ROOM_RECOMMENDATIONS as item (`badge-${item.primaryBadge}|${item.rationale}`)}
							<span class="fit-result__badge fit-result__ghost" aria-hidden="true">
								{item.primaryBadge}
							</span>
						{/each}
						<span class="fit-result__badge fit-result__live">{recommendation.primaryBadge}</span>
					</div>

					<div class="room-tabs" role="tablist" aria-label="Compare live trading rooms">
						{#each LIVE_TRADING_ROOMS_CARDS as room (room.id)}<button
								type="button"
								role="tab"
								id={`room-tab-${room.id}`}
								aria-selected={activeRoom.id === room.id}
								aria-controls="room-fit-panel"
								tabindex={activeRoom.id === room.id ? 0 : -1}
								onclick={() => (selectedRoom = room.id)}
								onkeydown={handleRoomKey}>{room.title}</button
							>{/each}
					</div>
					<div
						role="tabpanel"
						id="room-fit-panel"
						aria-labelledby={`room-tab-${activeRoom.id}`}
						tabindex="0"
					>
						<h3 class="fit-result__title">
							<span class="fit-result__live">{activeRoom.title}</span>
						</h3>
						<p class="fit-result__copy">{activeRoom.summary}</p>
						<a class="fit-result__alt" href={resolve(activeRoom.href)}
							>Explore {activeRoom.title} →</a
						>
					</div>

					<!-- Pure CSS Grid 1/1 Intrinsic Prose Stack: identical <p> tags guarantee 0px height delta across all 9 states -->
					<div class="fit-result__prose-stack">
						{#each UNIQUE_ROOM_RECOMMENDATIONS as item (`${item.primaryBadge}|${item.rationale}`)}
							<div class="fit-result__prose-layer fit-result__ghost" aria-hidden="true">
								<p class="fit-result__copy">{item.rationale}</p>
								<p class="fit-result__risk">{item.riskNote}</p>
							</div>
						{/each}
						<div class="fit-result__prose-layer fit-result__live">
							<p class="fit-result__copy">{recommendation.rationale}</p>
							<p class="fit-result__risk">{recommendation.riskNote}</p>
						</div>
					</div>

					<div class="fit-result__footer">
						<a href={resolve(recommendation.primaryHref)} class="btn btn-primary fit-result__cta">
							<span class="fit-result__cta-stack">
								{#each LIVE_TRADING_ROOMS_CARDS as room (`cta-${room.id}`)}
									<span class="fit-result__ghost" aria-hidden="true">{room.ctaLabel}</span>
								{/each}
								<span class="fit-result__live">{recommendation.primaryCtaLabel}</span>
							</span>
							<ArrowUpRightIcon size={16} weight="bold" aria-hidden="true" />
						</a>
						<a href={resolve(recommendation.secondaryHref)} class="fit-result__alt">
							{recommendation.secondaryLabel}: {recommendation.secondaryTitle}
						</a>
					</div>
				</div>
			</aside>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 2: THE 3 LIVE TRADING ROOMS SHOWCASE (WARM CREAM --off SURFACE)
       ========================================================================= -->
	<section
		id="three-live-rooms"
		class="section is-light rooms-light-section"
		aria-labelledby="three-rooms-h2"
	>
		<div class="container">
			<div class="section-heading rooms-light-heading">
				<span class="eyebrow">Dedicated Desk Formats · Side-by-Side Overview</span>
				<h2 id="three-rooms-h2">Our Three Live Trading Rooms</h2>
				<p class="body-copy section-header__sub">
					Each room focuses on liquid US large-cap equities, index and sector ETFs, and options with
					stated invalidation levels, separated so hold duration and position sizing match your
					daily routine.
				</p>
			</div>

			<div class="rooms-light-grid">
				{#each LIVE_TRADING_ROOMS_CARDS as room (room.id)}
					{@const isMatched = room.id === recommendation.primaryRoomId}
					<article class={['room-light-card', { 'is-matched': isMatched }]}>
						<div class="room-light-card__top">
							<div class="room-light-card__status-row">
								<span class="room-light-card__index">{room.indexLabel}</span>
								<span
									class={['room-light-card__match', { 'is-visible': isMatched }]}
									aria-hidden={!isMatched ? 'true' : undefined}
								>
									Matched to Selection
								</span>
							</div>
							<div class="room-light-card__tag-row">
								<span class="room-light-card__tag">{room.tag}</span>
							</div>
						</div>

						<h3 class="room-light-card__title">
							<a href={resolve(room.href)} class="room-light-card__title-link">{room.title}</a>
						</h3>
						<p class="room-light-card__summary">{room.summary}</p>

						<dl class="room-light-specs">
							{#each room.specs as spec (spec.label)}
								<div class="room-light-specs__row">
									<dt>{spec.label}</dt>
									<dd>{spec.value}</dd>
								</div>
							{/each}
						</dl>

						<ul class="room-light-bullets">
							{#each room.bullets as bullet (bullet.lead)}
								<li>
									<span class="room-light-bullets__check" aria-hidden="true">
										<CheckIcon size={16} weight="bold" />
									</span>
									<span>
										<strong>{bullet.lead}</strong>
										{bullet.body}
									</span>
								</li>
							{/each}
						</ul>

						<div class="room-light-card__footer">
							{#if CONCEPT_PREVIEW}
								<button
									type="button"
									data-concept-offer
									class={['btn', 'room-light-card__btn', { 'btn-primary': isMatched }]}
									onclick={openConceptOffer}
								>
									<span>{room.ctaLabel}</span>
									<ArrowUpRightIcon size={16} weight="bold" aria-hidden="true" />
								</button>
							{:else}
								<a
									href={resolve(room.href)}
									class={['btn', 'room-light-card__btn', { 'btn-primary': isMatched }]}
								>
									<span>{room.ctaLabel}</span>
									<ArrowUpRightIcon size={16} weight="bold" aria-hidden="true" />
								</a>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 3: OPERATING & RISK PROTOCOL (DARK ARCHITECTURAL GRID)
       ========================================================================= -->
	<section class="section desk-protocol-section" aria-labelledby="desk-protocol-h2">
		<div class="container">
			<div class="desk-protocol-frame">
				<div class="desk-protocol-frame__intro">
					<span class="eyebrow">Desk Operating Discipline · Shared Standards</span>
					<h2 id="desk-protocol-h2">
						How Sessions &amp; Risk Management Operate Across Every Room
					</h2>
					<p class="desk-protocol-frame__copy">
						Whether you participate at the 9:30 AM ET opening bell, review swing briefings after
						work, or manage a $500+ starting balance, all three rooms follow the same preparation,
						liquidity, and post-trade review standards.
					</p>
				</div>

				<div class="desk-protocol-grid">
					{#each DESK_PROTOCOL_STEPS as step (step.number)}
						<article class="desk-protocol-card">
							<span class="desk-protocol-card__num">{step.number}</span>
							<h3 class="desk-protocol-card__title">{step.title}</h3>
							<p class="desk-protocol-card__desc">{step.description}</p>
						</article>
					{/each}
				</div>

				<div class="desk-protocol-bar">
					<p>
						Evaluate position sizing and contract risk independently using our free educational
						<a href={resolve('/resources/[slug]', { slug: 'position-size-calculator' })}
							>Position Size Calculator</a
						>
						and
						<a href={resolve('/resources/options-calculator')}>Options Risk Calculator</a>, or
						review our <a href={resolve('/about')}>Editorial &amp; Desk Standards</a>.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 4: 7-POINT SIDE-BY-SIDE SPECIFICATION MATRIX (WARM CREAM --off)
       ========================================================================= -->
	<section
		id="side-by-side-matrix"
		class="section is-light matrix-light-section"
		aria-labelledby="matrix-h2"
	>
		<div class="container">
			<div class="section-heading">
				<span class="eyebrow">Analytical Comparison · 7 Core Specifications</span>
				<h2 id="matrix-h2">
					Day Trading vs. Swing Trading vs. Small Accounts Specification Matrix
				</h2>
				<p class="body-copy section-header__sub">
					Compare daily time requirements, hold horizons, FINRA Rule 4210 intraday margin vs. T+1
					cash settlement structures, instrument focus, and primary risk guardrails side by side.
				</p>
			</div>

			<div class="hub-matrix-wrap" role="region" aria-labelledby="matrix-h2">
				<table class="hub-matrix-table">
					<thead>
						<tr>
							<th scope="col">Specification</th>
							<th
								scope="col"
								class={{ 'is-col-matched': recommendation.primaryRoomId === 'day-trading-room' }}
							>
								Live Day Trading Room
							</th>
							<th
								scope="col"
								class={{ 'is-col-matched': recommendation.primaryRoomId === 'swing-trading-room' }}
							>
								Live Swing Trading Room
							</th>
							<th
								scope="col"
								class={{
									'is-col-matched': recommendation.primaryRoomId === 'small-accounts-room'
								}}
							>
								Small Accounts Room ($500+)
							</th>
						</tr>
					</thead>
					<tbody>
						{#each THREE_ROOM_MATRIX_ROWS as row (row.dimension)}
							<tr>
								<th scope="row" class="hub-matrix-table__dim">{row.dimension}</th>
								<td
									class={{ 'is-col-matched': recommendation.primaryRoomId === 'day-trading-room' }}
								>
									{row.dayRoom}
								</td>
								<td
									class={{
										'is-col-matched': recommendation.primaryRoomId === 'swing-trading-room'
									}}
								>
									{row.swingRoom}
								</td>
								<td
									class={{
										'is-col-matched': recommendation.primaryRoomId === 'small-accounts-room'
									}}
								>
									{row.smallRoom}
								</td>
							</tr>
						{/each}
					</tbody>
					<tfoot>
						<tr>
							<th scope="row" class="hub-matrix-table__dim">Room Overview</th>
							<td>
								<a href={resolve('/live-trading-rooms/day-trading-room')} class="hub-matrix-link">
									<span>View Day Trading Room</span>
									<ArrowRightIcon size={14} weight="bold" aria-hidden="true" />
								</a>
							</td>
							<td>
								<a href={resolve('/live-trading-rooms/swing-trading-room')} class="hub-matrix-link">
									<span>View Swing Trading Room</span>
									<ArrowRightIcon size={14} weight="bold" aria-hidden="true" />
								</a>
							</td>
							<td>
								<a
									href={resolve('/live-trading-rooms/small-accounts-room')}
									class="hub-matrix-link"
								>
									<span>View Small Accounts Room</span>
									<ArrowRightIcon size={14} weight="bold" aria-hidden="true" />
								</a>
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 5: ALTERNATIVE FORMATS + HUB FAQ (DARK SURFACE)
       ========================================================================= -->
	<section class="section hub-faq-bridge-section" aria-labelledby="ecosystem-bridge-h2">
		<div class="container">
			<div class="bridge-block">
				<div class="section-heading">
					<span class="eyebrow">Related Formats · Non-Room Memberships &amp; Coaching</span>
					<h2 id="ecosystem-bridge-h2">
						Prefer Prepared Video Watchlists or Private 1-on-1 Coaching?
					</h2>
					<p class="body-copy section-header__sub">
						An interactive trading room is not necessary for every workflow. If you prefer concise
						outside-hours video watchlists or individualized review, explore these formats:
					</p>
				</div>

				<div class="bridge-grid">
					{#each ECOSYSTEM_BRIDGE_CARDS as card (card.href)}
						<article class={['bridge-card', { 'bridge-card--featured': card.featured }]}>
							<div>
								<div class="bridge-card__top">
									<span class="bridge-card__index">{card.indexLabel}</span>
									<span class="bridge-card__tag">{card.tag}</span>
								</div>
								<h3 class="bridge-card__title">{card.title}</h3>
								<p class="bridge-card__copy">{card.copy}</p>
							</div>
							<a
								href={resolve(card.href)}
								class={['btn', card.featured ? 'btn-primary' : 'btn-outline', 'bridge-card__btn']}
							>
								<span>{card.ctaLabel}</span>
								<ArrowUpRightIcon size={16} weight="bold" aria-hidden="true" />
							</a>
						</article>
					{/each}
				</div>
			</div>

			<div id="faq" class="hub-faq-block" aria-labelledby="rooms-hub-faq-h2">
				<div class="section-heading">
					<span class="eyebrow">Frequently Asked Questions · Room Selection &amp; Rules</span>
					<h2 id="rooms-hub-faq-h2">Questions About Our Three Live Trading Rooms</h2>
				</div>

				<div class="faq-list">
					{#each LIVE_TRADING_ROOMS_HUB_FAQ_ITEMS as item, index (item.id)}
						<details class="faq-item" open={index === 0}>
							<summary class="faq-item__question">
								<h3 class="faq-item__heading">{item.question}</h3>
								<span class="faq-item__icon" aria-hidden="true">+</span>
							</summary>
							<p class="faq-item__answer">{item.answer}</p>
						</details>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- =========================================================================
       SECTION 6: CLOSING BANNER (HOMEPAGE ACID SURFACE)
       ========================================================================= -->
	<section class="section final-banner" aria-labelledby="final-banner-h2">
		<div class="container final-banner__inner">
			<span class="eyebrow">Structured Market Education · Defined Risk</span>
			<h2 id="final-banner-h2" class="final-banner__h2">
				Review the Schedule, Workflow, and Risk Rules Inside Each Room.
			</h2>
			<p class="body-copy final-banner__copy">
				Select a trading room below to examine its daily session timetable, instrument focus, and
				position-sizing framework in detail.
			</p>
			<div class="cta-row">
				<a href={resolve('/live-trading-rooms/day-trading-room')} class="btn btn-dark">
					<span>Live Day Trading Room</span>
					<ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
				</a>
				<a href={resolve('/live-trading-rooms/swing-trading-room')} class="btn btn-outline-dark">
					Live Swing Trading Room
				</a>
				<a href={resolve('/live-trading-rooms/small-accounts-room')} class="btn btn-outline-dark">
					Small Accounts Room ($500+)
				</a>
			</div>
		</div>
	</section>
</main>

<Footer />

<style>
	.room-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-block: 1rem;
	}
	.room-tabs button {
		font: inherit;
		font-size: var(--step-sm);
		color: var(--text);
		background: var(--panel);
		border: 1px solid var(--line);
		padding: 0.75rem;
		cursor: pointer;
	}
	.room-tabs button[aria-selected='true'] {
		color: var(--ink);
		background: var(--acid);
	}

	/* ---------- Section 1: Compact Hero + Inline Room Fit Selector ---------- */
	.hub-hero {
		padding-block: 44px 56px;
	}

	.hub-hero__grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 2rem;
		align-items: start;
		position: relative;
		z-index: 1;
	}

	.hub-hero__lead {
		margin-block: 0 1.5rem;
		max-inline-size: 62ch;
	}

	.hub-byline {
		margin-block: 1.5rem 0;
		padding-block-start: 1rem;
		border-block-start: 1px solid var(--line);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		line-height: 1.65;
		letter-spacing: 0.02em;
		color: var(--muted);
		max-inline-size: 66ch;
	}

	.hub-byline a {
		color: var(--text);
		font-weight: 600;
		text-decoration: underline;
		text-decoration-color: var(--acid2);
		text-underline-offset: 3px;
	}

	.hub-byline a:hover {
		color: var(--acid);
	}

	.hub-byline time {
		color: var(--text);
		font-weight: 600;
	}

	/* Right-hand Room Fit Selector */
	.fit-selector {
		position: relative;
		background: var(--panel);
		border: 1px solid var(--line-strong);
		padding: 1.375rem;
		box-shadow: var(--shadow-md);
	}

	.fit-selector__header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
		padding-block-end: 1rem;
		margin-block-end: 1rem;
		border-block-end: 1px solid var(--line);
	}

	.fit-selector__kicker {
		display: block;
		font-family: var(--font-mono);
		font-size: var(--step-xs);
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--acid);
		margin-block-end: 0.25rem;
	}

	.fit-selector__title {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--step-lead);
		line-height: 1.25;
		color: var(--text);
	}

	.fit-selector__tag {
		padding: 0.25rem 0.55rem;
		border: 1px solid var(--line-strong);
		background: var(--bg-soft);
		font-family: var(--font-mono);
		font-size: var(--step-xs);
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-secondary);
		white-space: nowrap;
	}

	.fit-selector__controls {
		display: grid;
		gap: 1rem;
		margin-block-end: 1.125rem;
	}

	.fit-group {
		display: grid;
		gap: 0.5rem;
	}

	.fit-group__label {
		font-family: var(--font-mono);
		font-size: var(--step-xs);
		font-weight: 600;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}

	.fit-group__pills {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 0.5rem;
	}

	.fit-pill {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.15rem;
		padding: 0.625rem 0.75rem;
		border: 1px solid var(--line-strong);
		background: var(--bg-soft);
		color: var(--text);
		text-align: start;
		cursor: pointer;
		transition:
			border-color 0.18s var(--ease-out),
			background-color 0.18s var(--ease-out);
	}

	.fit-pill:hover {
		border-color: var(--acid2);
	}

	.fit-pill.is-selected {
		border-color: var(--acid);
		background: var(--panel2);
		box-shadow: inset 3px 0 0 var(--acid);
	}

	.fit-pill__label {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--step-caption);
		line-height: 1.3;
		color: var(--text);
	}

	.fit-pill__sub {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		line-height: 1.35;
		color: var(--muted);
	}

	.fit-result {
		display: flex;
		flex-direction: column;
		padding: 1rem 1.125rem;
		background: var(--bg-soft);
		border: 1px solid var(--line-strong);
		border-inline-start: 3px solid var(--acid2);
	}

	.fit-result__head,
	.fit-result__title,
	.fit-result__prose-stack,
	.fit-result__cta-stack {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}

	.fit-result__head {
		justify-items: start;
		margin-block-end: 0.5rem;
	}

	.fit-result__cta-stack {
		text-align: start;
	}

	.fit-result__ghost,
	.fit-result__live,
	.fit-result__prose-layer {
		grid-area: 1 / 1;
		min-inline-size: 0;
	}

	.fit-result__ghost {
		visibility: hidden;
		pointer-events: none;
		user-select: none;
	}

	.fit-result__badge {
		display: inline-block;
		padding: 0.2rem 0.55rem;
		background: var(--acid);
		color: var(--ink);
		font-family: var(--font-display);
		font-weight: 800;
		font-size: var(--step-xs);
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.fit-result__title {
		margin: 0 0 0.4rem;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--step-lead);
		line-height: 1.3;
		color: var(--text);
	}

	.fit-result__copy {
		margin: 0 0 0.625rem;
		font-family: var(--font-sans);
		font-size: var(--step-sm);
		line-height: 1.6;
		color: var(--text-secondary);
		max-inline-size: none;
	}

	.fit-result__risk {
		margin: 0 0 0.875rem;
		font-family: var(--font-sans);
		font-size: 0.75rem;
		line-height: 1.55;
		color: var(--muted);
		max-inline-size: none;
	}

	.fit-result__footer {
		display: grid;
		gap: 0.625rem;
		margin-block-start: auto;
	}

	.fit-result__cta {
		inline-size: 100%;
		justify-content: space-between;
	}

	.fit-result__alt {
		display: block;
		font-family: var(--font-mono);
		font-size: var(--step-xs);
		line-height: 1.4;
		color: var(--text-secondary);
		text-decoration: underline;
		text-underline-offset: 3px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.fit-result__alt:hover {
		color: var(--acid);
	}

	/* ---------- Section 2: Warm Cream (--off) 3-Room Showcase ---------- */
	.rooms-light-heading {
		margin-block-end: 2.25rem;
	}

	.rooms-light-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.25rem;
	}

	.room-light-card {
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		min-inline-size: 0;
		min-block-size: 0;
		padding: 1.75rem 1.5rem;
		background: var(--card-white);
		border: 1px solid var(--card-light-border);
		color: var(--ink);
		transition: border-color 0.2s var(--ease-out);
	}

	.room-light-card.is-matched {
		background: var(--card-featured-bg);
		border-color: var(--card-featured-border);
	}

	.room-light-card.is-matched::before {
		content: '';
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: 0;
		inline-size: 100%;
		block-size: 5px;
		background: var(--card-featured-strip);
	}

	.room-light-card__top {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 0.5rem;
		margin-block-end: 1.25rem;
	}

	.room-light-card__status-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.room-light-card__index {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #5b6551;
	}

	.room-light-card__match {
		visibility: hidden;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: var(--step-xs);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 0.3rem 0.55rem;
		background: var(--ink);
		color: var(--text);
		max-inline-size: 100%;
	}

	.room-light-card__match.is-visible {
		visibility: visible;
	}

	.room-light-card__tag-row {
		display: flex;
	}

	.room-light-card__tag {
		display: inline-block;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: var(--step-xs);
		letter-spacing: 0.07em;
		text-transform: uppercase;
		background: #e8ebdf;
		color: #38422f;
		padding: 0.32rem 0.55rem;
	}

	.room-light-card.is-matched .room-light-card__tag {
		background: var(--card-featured-badge);
	}

	.room-light-card__title {
		margin: 0 0 0.625rem;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--step-h3);
		line-height: 1.25;
		color: var(--ink);
	}

	.room-light-card__title-link {
		color: var(--ink);
		text-decoration: none;
	}

	.room-light-card__title-link:hover {
		text-decoration: underline;
		text-decoration-color: var(--card-featured-border);
		text-underline-offset: 4px;
	}

	.room-light-card__summary {
		margin: 0 0 1.25rem;
		font-family: var(--font-sans);
		font-size: var(--step-body-sm);
		line-height: 1.65;
		color: var(--lightmuted);
		max-inline-size: none;
	}

	.room-light-specs {
		margin: 0 0 1.25rem;
		padding: 0.875rem 1rem;
		background: var(--off);
		border: 1px solid var(--card-light-border);
		display: grid;
		gap: 0.625rem;
	}

	.room-light-card.is-matched .room-light-specs {
		background: var(--card-white);
	}

	.room-light-specs__row {
		padding-block-end: 0.5rem;
		border-block-end: 1px solid #e2e5de;
	}

	.room-light-specs__row:last-child {
		padding-block-end: 0;
		border-block-end: 0;
	}

	.room-light-specs dt {
		font-family: var(--font-mono);
		font-weight: 600;
		font-size: var(--step-xs);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--acid-text-on-light);
	}

	.room-light-specs dd {
		margin: 0.2rem 0 0;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--step-sm);
		line-height: 1.4;
		color: var(--ink);
	}

	.room-light-bullets {
		list-style: none;
		padding: 0;
		margin: 0 0 1.75rem;
	}

	.room-light-bullets li {
		padding-block: 0.7rem;
		border-block-start: 1px solid #e2e5de;
		display: grid;
		grid-template-columns: 20px 1fr;
		gap: 0.65rem;
		font-family: var(--font-sans);
		font-weight: 500;
		font-size: var(--step-body-sm);
		line-height: 1.6;
		color: #46504e;
	}

	.room-light-bullets__check {
		margin-block-start: 3px;
		color: #596c30;
	}

	.room-light-bullets strong {
		font-family: var(--font-sans);
		font-weight: 700;
		color: var(--ink);
	}

	.room-light-card__footer {
		margin-block-start: auto;
	}

	.room-light-card__btn {
		inline-size: 100%;
		max-inline-size: none;
		justify-content: space-between;
	}

	.room-light-card__btn:not(.btn-primary) {
		background: var(--ink);
		color: #f5f5f2;
	}

	.room-light-card__btn:not(.btn-primary):hover {
		background: var(--btn-dark-hover);
	}

	/* ---------- Section 3: Operating & Risk Protocol (Dark Grid) ---------- */
	.desk-protocol-section {
		position: relative;
		background: var(--surface-mentorship);
	}

	.desk-protocol-section::before {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.022) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.022) 1px, transparent 1px);
		background-size: 66px 66px;
		mask-image: linear-gradient(to bottom, #000, transparent 85%);
	}

	.desk-protocol-frame {
		position: relative;
		z-index: 1;
		border: 1px solid #576747;
		background:
			linear-gradient(120deg, rgba(195, 232, 112, 0.06), transparent 55%),
			var(--surface-mentor-frame);
		padding: 2rem 1.5rem;
	}

	.desk-protocol-frame::before,
	.desk-protocol-frame::after {
		content: '';
		position: absolute;
		inline-size: 16px;
		block-size: 16px;
		border-color: var(--acid);
		border-style: solid;
	}

	.desk-protocol-frame::before {
		inset-block-start: -2px;
		inset-inline-start: -2px;
		border-width: 2px 0 0 2px;
	}

	.desk-protocol-frame::after {
		inset-block-end: -2px;
		inset-inline-end: -2px;
		border-width: 0 2px 2px 0;
	}

	.desk-protocol-frame__intro {
		margin-block-end: 2rem;
		max-inline-size: 72ch;
	}

	.desk-protocol-frame__copy {
		margin: 0.75rem 0 0;
		font-family: var(--font-sans);
		font-size: var(--step-body);
		line-height: var(--leading-body);
		color: var(--text-secondary);
		max-inline-size: 68ch;
	}

	.desk-protocol-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.25rem;
	}

	.desk-protocol-card {
		padding: 1.5rem;
		background: var(--bg-soft);
		border: 1px solid var(--line-strong);
	}

	.desk-protocol-card__num {
		display: inline-block;
		margin-block-end: 0.75rem;
		padding: 0.2rem 0.55rem;
		border: 1px solid #4d5d38;
		background: rgba(220, 255, 101, 0.08);
		font-family: var(--font-mono);
		font-weight: 700;
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		color: var(--acid);
	}

	.desk-protocol-card__title {
		margin: 0 0 0.625rem;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--step-lead);
		line-height: 1.3;
		color: var(--text);
	}

	.desk-protocol-card__desc {
		margin: 0;
		font-family: var(--font-sans);
		font-size: var(--step-body-sm);
		line-height: 1.65;
		color: var(--text-secondary);
		max-inline-size: none;
	}

	.desk-protocol-bar {
		margin-block-start: 1.5rem;
		padding-block-start: 1.25rem;
		border-block-start: 1px solid var(--line);
	}

	.desk-protocol-bar p {
		margin: 0;
		font-family: var(--font-sans);
		font-size: var(--step-sm);
		line-height: 1.6;
		color: var(--muted);
		max-inline-size: none;
	}

	.desk-protocol-bar a {
		color: var(--acid);
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	/* ---------- Section 4: Light-Surface Specification Matrix ---------- */
	.hub-matrix-wrap {
		inline-size: 100%;
		overflow-x: auto;
		border: 1px solid var(--card-light-border);
		background: var(--card-white);
	}

	.hub-matrix-table {
		inline-size: 100%;
		min-inline-size: 780px;
		border-collapse: collapse;
		text-align: start;
	}

	.hub-matrix-table th,
	.hub-matrix-table td {
		padding: 1.05rem 1.25rem;
		border-block-end: 1px solid var(--card-light-border);
		border-inline-end: 1px solid var(--card-light-border);
		vertical-align: top;
	}

	.hub-matrix-table th:last-child,
	.hub-matrix-table td:last-child {
		border-inline-end: 0;
	}

	.hub-matrix-table thead th {
		background: var(--ink);
		color: var(--text);
		font-family: var(--font-display);
		font-weight: 800;
		font-size: var(--step-caption);
		letter-spacing: 0.05em;
		text-transform: uppercase;
		border-block-end: 3px solid var(--card-featured-strip);
	}

	.hub-matrix-table thead th.is-col-matched {
		color: var(--acid);
	}

	.hub-matrix-table__dim {
		inline-size: 20%;
		background: var(--off2);
		color: var(--ink);
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--step-sm);
		line-height: 1.45;
	}

	.hub-matrix-table tbody td {
		inline-size: 26.666%;
		font-family: var(--font-sans);
		font-size: var(--step-body-sm);
		line-height: 1.65;
		color: var(--ink);
		background: var(--card-white);
	}

	.hub-matrix-table tbody td.is-col-matched {
		background: var(--card-featured-bg);
	}

	.hub-matrix-table tfoot th,
	.hub-matrix-table tfoot td {
		background: var(--off2);
		border-block-end: 0;
	}

	.hub-matrix-link {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: var(--step-caption);
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--ink);
		text-decoration: underline;
		text-decoration-color: var(--card-featured-border);
		text-decoration-thickness: 2px;
		text-underline-offset: 4px;
	}

	.hub-matrix-link:hover {
		color: var(--acid-text-on-light);
	}

	/* ---------- Section 5: Alternative Formats + Hub FAQ ---------- */
	.hub-faq-bridge-section {
		background: var(--surface-faq);
	}

	.bridge-block {
		padding-block-end: 4rem;
		margin-block-end: 4rem;
		border-block-end: 1px solid var(--line);
	}

	.bridge-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.25rem;
	}

	.bridge-card {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 1.5rem;
		padding: 1.625rem;
		background: var(--panel);
		border: 1px solid var(--line-strong);
	}

	.bridge-card--featured {
		border-color: #576747;
		background: var(--panel2);
	}

	.bridge-card__top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-block-end: 1rem;
	}

	.bridge-card__index {
		font-family: var(--font-mono);
		font-size: var(--step-xs);
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.bridge-card__tag {
		padding: 0.25rem 0.55rem;
		background: var(--bg-soft);
		border: 1px solid var(--line-strong);
		font-family: var(--font-display);
		font-size: var(--step-xs);
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}

	.bridge-card__title {
		margin: 0 0 0.625rem;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--step-sub);
		line-height: 1.3;
		color: var(--text);
	}

	.bridge-card__copy {
		margin: 0;
		font-family: var(--font-sans);
		font-size: var(--step-body-sm);
		line-height: 1.65;
		color: var(--text-secondary);
		max-inline-size: none;
	}

	.bridge-card__btn {
		inline-size: 100%;
		justify-content: space-between;
	}

	/* ---------- Responsive Breakpoints ---------- */
	@media (min-width: 640px) {
		.fit-group__pills {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@media (min-width: 768px) {
		.room-light-card {
			padding: 2rem;
		}

		.desk-protocol-frame {
			padding: 2.5rem;
		}
	}

	@media (min-width: 1024px) {
		.hub-hero__grid {
			grid-template-columns: repeat(12, minmax(0, 1fr));
			gap: 2.25rem;
		}

		.hub-hero__main {
			grid-column: span 7;
		}

		.fit-selector {
			grid-column: span 5;
		}

		.rooms-light-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.desk-protocol-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.bridge-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@media (min-width: 1536px) {
		.rooms-light-grid,
		.desk-protocol-grid,
		.bridge-grid {
			gap: 1.5rem;
		}
	}
</style>
