<!-- src/lib/components/ui/CatalogGrid.svelte -->
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	/**
	 * Responsive list of catalog cards with a live "Showing N of M" status and an empty state.
	 * Mobile-first on the SSOT breakpoints (docs/CSS_STANDARDS.md 5.1): 1 column below 768px,
	 * 2 columns from 768px, 3 columns from 1280px (a 4th column would starve text-heavy cards).
	 * A featured item takes a full row on tablets and two of three columns on desktop.
	 */
	interface Props {
		items: readonly T[];
		/** Stable unique key per item (never the index). */
		key: (item: T) => string;
		isFeatured?: (item: T) => boolean;
		/** Size of the unfiltered list, for the status line. */
		total: number;
		/** Plural noun for the status line, e.g. "courses". */
		noun: string;
		emptyMessage?: string;
		/** `light` for light sections (readable status and empty-state colors). */
		tone?: 'dark' | 'light';
		children: Snippet<[T]>;
	}

	let {
		items,
		key,
		isFeatured,
		total,
		noun,
		emptyMessage = `No ${noun} match this filter.`,
		tone = 'dark',
		children
	}: Props = $props();
</script>

<p class={['catalog-grid__status', { 'is-light': tone === 'light' }]} role="status">
	Showing {items.length} of {total}
	{noun}
</p>

<ul class={['catalog-grid', { 'is-light': tone === 'light' }]}>
	{#each items as item (key(item))}
		<li class={['catalog-grid__item', { 'is-featured': isFeatured?.(item) }]}>
			{@render children(item)}
		</li>
	{:else}
		<li class="catalog-grid__empty">{emptyMessage}</li>
	{/each}
</ul>

<style>
	.catalog-grid__status {
		margin: 16px 0;
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.8125rem;
		line-height: 1.5rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}

	.catalog-grid__status.is-light,
	.catalog-grid.is-light .catalog-grid__empty {
		color: var(--lightmuted);
	}

	.catalog-grid.is-light .catalog-grid__empty {
		border-color: var(--card-light-border);
	}

	.catalog-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 16px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* A one-cell grid: the card fills the (row-stretched) item, so cards in a row stay equal height even when
	   a card must grow beyond its aspect-ratio to fit its content. */
	.catalog-grid__item {
		display: grid;
		min-inline-size: 0;
	}

	.catalog-grid__empty {
		padding: 32px 16px;
		border: 2px dashed var(--line-strong);
		text-align: center;
		color: var(--text-secondary);
	}

	@media (min-width: 480px) {
		.catalog-grid {
			gap: 20px;
		}
	}

	@media (min-width: 768px) {
		.catalog-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 24px;
		}

		.catalog-grid__item.is-featured,
		.catalog-grid__empty {
			grid-column: 1 / -1;
		}
	}

	@media (min-width: 1280px) {
		.catalog-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 28px;
		}

		.catalog-grid__item.is-featured {
			grid-column: span 2;
		}
	}
</style>
