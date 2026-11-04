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
	 *
	 * Layouts: `stack` (default) is a header band, body and footer. `cover` makes the `media` image the card
	 * background: `eyebrow` + `title` sit over the top, `children` + `footer` over the bottom, each on its own scrim
	 * that follows the text block (so contrast does not depend on the image). Per-card tuning is by custom
	 * property, set by the consumer: `--card-scrim` (0.7-0.95, scrim opacity), `--card-focus` (CSS object-position
	 * of the cover, e.g. `30% 20%`), `--card-accent`.
	 */
	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'class' | 'title'> {
		/** Renders the stretched title link (see above). */
		title: Snippet;
		headingLevel?: 2 | 3 | 4;
		featured?: boolean;
		/** `light` re-themes the card for light sections (white card, ink text, AA accent text). */
		tone?: 'dark' | 'light';
		/** `cover` = image-background card with the title over the top part. */
		layout?: 'stack' | 'cover';
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
		layout = 'stack',
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
	class={[
		'catalog-card',
		{ 'is-featured': featured, 'is-light': tone === 'light', 'is-cover': layout === 'cover' },
		className
	]}
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
			<span class="catalog-card__cta-label">{ctaLabel}</span>
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

	/* ---- cover layout: the image is the card, the title sits over the top part ---- */
	.catalog-card.is-cover {
		--_scrim: var(--card-scrim, 0.86);
		--_text: var(--text);
		--_text-2: var(
			--off2
		); /* near-white: secondary text must stay AA over the weakest (soft) scrim */
		--_muted: var(--off2);
		--_line: color-mix(in srgb, var(--text) 18%, transparent);
		--_line-strong: color-mix(in srgb, var(--text) 30%, transparent);

		isolation: isolate;
		justify-content: space-between;
		/* Proportions follow the SSOT breakpoints so the artwork keeps a visible window between the two text blocks:
		   3:4 on phones, 1:1 on large phones / small tablets (one wide column), 4:5 once the grid has 2+ columns. */
		aspect-ratio: 3 / 4;
		/* `100%` would pin the card to the aspect-ratio height; `auto` + stretch lets it grow to its content while the
		   grid item (display: grid) keeps row-mates equal. Aspect-ratio boxes only stretch when asked explicitly. */
		block-size: auto;
		/* A definite width: when content forces the card taller than its ratio height, the browser would otherwise
		   transfer that height back through aspect-ratio and make the card WIDER than its column. */
		inline-size: 100%;
		align-self: stretch;
		/* `clip`, not `hidden`: hidden makes a scroll container, which drops the automatic minimum size and lets a
		   long title push the footer out of the card. Clip keeps the aspect-ratio as a floor, never a cap. */
		overflow: clip;
		background: var(--bg);
		border-color: var(--line-strong);
		box-shadow: var(--shadow-md);
	}

	.catalog-card.is-cover .catalog-card__media {
		position: absolute;
		inset: 0;
		z-index: -1;
		border: 0;
	}

	/* The cover image is consumer-authored (a snippet), so it needs :global to be sized from here. */
	.catalog-card.is-cover .catalog-card__media :global(img) {
		display: block;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		object-position: var(--card-focus, 50% 50%);
		transition: transform 0.6s var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.catalog-card.is-cover:hover .catalog-card__media :global(img) {
			transform: scale(1.04);
		}
	}

	.catalog-card.is-cover .catalog-card__body {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 0;
		padding: 0;
	}

	/* Top scrim: solid behind the whole eyebrow + title block, then a fixed 44px fade into the image. */
	.catalog-card.is-cover .catalog-card__intro {
		padding: var(--_pad) var(--_pad) 44px;
		background: linear-gradient(
			to bottom,
			rgb(8 10 13 / var(--_scrim)) 0,
			rgb(8 10 13 / var(--_scrim)) calc(100% - 44px),
			transparent
		);
	}

	.catalog-card.is-cover .catalog-card__title {
		font-size: clamp(1.25rem, 1.05rem + 0.8vw, 1.5rem);
		line-height: 1.2;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		overflow: hidden;
	}

	/* Bottom scrim: the details fade in from the image, the footer continues the same solid tone. */
	.catalog-card.is-cover .catalog-card__detail {
		margin-block-start: auto;
		padding: 56px var(--_pad) 4px;
		background: linear-gradient(to bottom, transparent, rgb(8 10 13 / var(--_scrim)) 56px);
	}

	.catalog-card.is-cover .catalog-card__footer {
		margin: 0;
		padding: 8px var(--_pad) var(--_pad);
		border: 0;
		background: rgb(8 10 13 / var(--_scrim));
	}

	/* The cover CTA is a compact chip: the title link is the real affordance. Icon-only on narrow screens. */
	.catalog-card.is-cover .catalog-card__cta {
		inline-size: 44px;
		min-block-size: 44px;
		padding-inline: 0;
		margin-inline-start: auto;
	}

	.catalog-card.is-cover .catalog-card__cta-label {
		display: none;
	}

	/* ---- xs: large phones ---- */
	@media (min-width: 480px) {
		.catalog-card {
			--_pad: 20px;
		}

		.catalog-card.is-cover {
			aspect-ratio: 1 / 1;
		}

		.catalog-card.is-cover .catalog-card__cta {
			inline-size: auto;
			padding-inline: 20px;
		}

		.catalog-card.is-cover .catalog-card__cta-label {
			display: inline;
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

		.catalog-card.is-cover {
			aspect-ratio: 4 / 5;
		}

		/* A featured cover keeps the overlay layout (not two columns) and goes wide. */
		.catalog-card.is-featured.is-cover {
			aspect-ratio: 16 / 9;
		}

		.catalog-card.is-featured.is-cover .catalog-card__body {
			display: flex;
			column-gap: 0;
		}

		.catalog-card.is-featured.is-cover .catalog-card__title {
			font-size: clamp(1.5rem, 1.1rem + 1vw, 2rem);
			-webkit-line-clamp: 3;
			line-clamp: 3;
		}
	}

	/* ---- xl: wide desktops ---- */
	@media (min-width: 1280px) {
		.catalog-card {
			--_pad: 24px;
		}
	}
</style>
