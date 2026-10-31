<!-- src/lib/components/ui/CatalogCard.svelte -->
<script lang="ts">
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import type { Snippet } from 'svelte';
	import type { ClassValue, HTMLAttributes } from 'svelte/elements';

	/**
	 * Shared shell for the store/blog catalog cards (CourseCard, IndicatorCard, BlogCard).
	 * It owns everything that must be identical across them: box, hover, focus ring, body layout,
	 * footer + CTA, tap-target and type-size floors, and the SSOT breakpoints (480 / 768 / 1280).
	 * The consumer owns the content, through snippets.
	 *
	 * Whole-card click: `title` MUST render a single `<a class="catalog-card__link" href={resolve(...)}>`.
	 * The shell stretches that link over the card, so nothing is nested and the CTA stays decorative.
	 * The `href` is resolved by the consumer on purpose: `resolve()` is typed per route, and the
	 * `svelte/no-navigation-without-resolve` lint rule needs to see it where the anchor is written.
	 *
	 * Any `<a>`, `<button>` or `<summary>` inside a snippet is raised above the stretched link
	 * automatically; wrap other interactive containers (e.g. `<details>`) in `position: relative; z-index: 1`.
	 *
	 * Theming: set `--card-accent` on a parent (default `var(--acid)`), or pass `tone="light"` on a light section.
	 * Consumers style with the semantic internals (`--_text`, `--_text-2`, `--_muted`, `--_line`, `--_line-strong`,
	 * `--_band`, `--_inset`, `--_accent`, `--_accent-text`) so one rule works on both tones.
	 * `featured` assumes the host gives the card two grid columns from 768px up.
	 */
	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'class' | 'title'> {
		/** Renders the stretched title link (see above). */
		title: Snippet;
		headingLevel?: 2 | 3 | 4;
		featured?: boolean;
		/** `light` re-themes the card for light sections (white card, ink text, AA accent text). */
		tone?: 'dark' | 'light';
		/** Visible label of the decorative call-to-action (the title link is the accessible link). */
		ctaLabel?: string;
		/** Flush, full-bleed media at the top (images). */
		media?: Snippet;
		/** Padded header band above the body. */
		top?: Snippet;
		/** Small uppercase label above the title. */
		eyebrow?: Snippet;
		/** Text under the title. */
		intro?: Snippet;
		/** Detail column; sits beside the intro on a featured card. */
		children?: Snippet;
		/** Extra footer content to the left of the CTA. */
		footer?: Snippet;
		class?: ClassValue;
	}

	let {
		title,
		headingLevel = 3,
		featured = false,
		tone = 'dark',
		ctaLabel = 'Learn more',
		media,
		top,
		eyebrow,
		intro,
		children,
		footer,
		class: className,
		...rest
	}: Props = $props();

	const uid = $props.id();

	const heading = $derived(`h${headingLevel}` as const);
</script>

<article
	{...rest}
	class={['catalog-card', { 'is-featured': featured, 'is-light': tone === 'light' }, className]}
	aria-labelledby="{uid}-title"
>
	{#if media}
		<div class="catalog-card__media">{@render media()}</div>
	{/if}

	{#if top}
		<header class="catalog-card__top">{@render top()}</header>
	{/if}

	<div class="catalog-card__body">
		<div class="catalog-card__intro">
			{#if eyebrow}
				<p class="catalog-card__eyebrow">{@render eyebrow()}</p>
			{/if}
			<svelte:element this={heading} id="{uid}-title" class="catalog-card__title">
				{@render title()}
			</svelte:element>
			{@render intro?.()}
		</div>

		{#if children}
			<div class="catalog-card__detail">{@render children()}</div>
		{/if}
	</div>

	<footer class="catalog-card__footer">
		{@render footer?.()}
		<!-- Decorative: the title link is the single, named link to the detail page. -->
		<span class="catalog-card__cta" aria-hidden="true">
			{ctaLabel}
			<ArrowRightIcon size={16} weight="bold" />
		</span>
	</footer>
</article>

<style>
	/* Mobile-first on the SSOT breakpoints (docs/CSS_STANDARDS.md 5.1): 480 / 640 / 768 / 1024 / 1280 / 1536. */
	.catalog-card {
		--_accent: var(--card-accent, var(--acid));
		--_accent-text: var(--_accent);
		--_text: var(--text);
		--_text-2: var(--text-secondary);
		--_muted: var(--muted);
		--_line: var(--line);
		--_line-strong: var(--line-strong);
		--_band: color-mix(in srgb, var(--bg) 92%, transparent);
		--_inset: color-mix(in srgb, var(--bg) 70%, transparent);
		--_pad: 18px;

		position: relative;
		display: flex;
		flex-direction: column;
		block-size: 100%;
		min-inline-size: 0;
		overflow: hidden;
		background: linear-gradient(180deg, var(--panel), var(--bg-soft));
		border: 1px solid var(--_line);
		box-shadow: var(--shadow-md);
		transition:
			transform 0.2s var(--ease-out),
			border-color 0.2s var(--ease-out),
			box-shadow 0.2s var(--ease-out);
	}

	/* Light sections: white card, ink text, and an accent text colour that passes AA on white. */
	.catalog-card.is-light {
		--_accent-text: var(--acid-text-on-light);
		--_text: var(--ink);
		--_text-2: var(--lightmuted);
		--_muted: var(--lightmuted);
		--_line: var(--card-light-border);
		--_line-strong: color-mix(in srgb, var(--ink) 30%, var(--card-white));
		--_band: var(--off);
		--_inset: var(--card-featured-bg);

		background: var(--card-white);
		box-shadow: none;
	}

	.catalog-card.is-featured {
		border-color: color-mix(in srgb, var(--_accent) 45%, var(--_line));
		border-block-start: 3px solid var(--_accent);
	}

	/* Hover lift only where hover exists, so touch devices never get a sticky raised card. */
	@media (hover: hover) and (pointer: fine) {
		.catalog-card:hover {
			transform: translateY(-4px);
			border-color: var(--_line-strong);
			box-shadow: var(--shadow-lg);
		}
	}

	/* Keyboard focus ring on the whole card (the link's own outline is replaced by this larger one). */
	.catalog-card:has(:global(.catalog-card__link:focus-visible)) {
		/* `--_accent-text`, not `--_accent`: acid on a white card is ~1.2:1, below the 3:1 non-text minimum. */
		outline: 3px solid var(--_accent-text);
		outline-offset: 3px;
	}

	/* ---- media / top band ---- */
	.catalog-card__media {
		position: relative;
		min-inline-size: 0;
		border-block-end: 1px solid var(--_line);
	}

	.catalog-card__top {
		display: grid;
		gap: 10px;
		padding: 14px var(--_pad);
		background: var(--_band);
		border-block-end: 1px solid var(--_line);
	}

	/* ---- body ---- */
	.catalog-card__body {
		display: grid;
		flex: 1;
		align-content: start;
		gap: 16px;
		padding: var(--_pad);
	}

	.catalog-card__intro,
	.catalog-card__detail {
		display: grid;
		align-content: start;
		gap: 12px;
		min-inline-size: 0;
	}

	.catalog-card__eyebrow {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--_accent-text);
	}

	.catalog-card__title {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: clamp(1.125rem, 1rem + 0.7vw, 1.375rem);
		line-height: 1.25;
		letter-spacing: -0.015em;
		color: var(--_text);
		text-wrap: balance;
	}

	/* The link is authored by the consumer (a snippet), so it needs :global to be styled from here. */
	.catalog-card :global(.catalog-card__link) {
		color: inherit;
		text-decoration: none;
	}

	/* Stretched link: the pseudo-element makes the entire card clickable without nesting links. */
	.catalog-card :global(.catalog-card__link)::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 0;
	}

	.catalog-card :global(.catalog-card__link:focus-visible) {
		outline: none;
	}

	/* Interactive children stay clickable above the stretched link. */
	.catalog-card :global(a:not(.catalog-card__link)) {
		position: relative;
		z-index: 1;
	}

	.catalog-card :global(button) {
		position: relative;
		z-index: 1;
	}

	.catalog-card :global(summary) {
		position: relative;
		z-index: 1;
	}

	/* ---- footer ---- */
	.catalog-card__footer {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px 16px;
		margin-block-start: auto;
		padding: 12px var(--_pad) var(--_pad);
		border-block-start: 1px solid var(--_line);
	}

	.catalog-card__cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		min-block-size: 48px;
		padding-inline: 20px;
		background: var(--_accent);
		color: var(--ink);
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.8125rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		inline-size: 100%;
		transition: gap 0.2s var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.catalog-card:hover .catalog-card__cta {
			gap: 12px;
		}
	}

	/* ---- xs: large phones ---- */
	@media (min-width: 480px) {
		.catalog-card {
			--_pad: 20px;
		}
	}

	/* ---- md: tablets ---- */
	@media (min-width: 768px) {
		.catalog-card {
			--_pad: 22px;
		}

		/* Featured card spans the full row on tablets: lay its body out in two columns. */
		.catalog-card.is-featured .catalog-card__body {
			grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
			column-gap: 28px;
			align-items: start;
		}

		.catalog-card.is-featured .catalog-card__title {
			font-size: clamp(1.375rem, 1rem + 1vw, 1.75rem);
		}

		/* The lead card has the room for a single footer row: related link left, CTA right. */
		.catalog-card.is-featured .catalog-card__cta {
			inline-size: auto;
			margin-inline-start: auto;
		}
	}

	/* ---- xl: wide desktops ---- */
	@media (min-width: 1280px) {
		.catalog-card {
			--_pad: 24px;
		}
	}
</style>
