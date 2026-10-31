<!-- src/lib/components/ui/FilterChips.svelte -->
<script lang="ts" generics="T extends string">
	import type { ClassValue } from 'svelte/elements';

	/**
	 * A single-choice filter rendered as a group of toggle buttons (`aria-pressed`), not an ARIA tablist:
	 * the buttons filter a list in place, they do not switch between tab panels.
	 * Usage: `<FilterChips label="Filter courses" options={options} bind:value />`.
	 */
	interface Option {
		id: T;
		label: string;
	}

	interface Props {
		options: readonly Option[];
		value: T;
		/** Accessible name of the group. */
		label: string;
		class?: ClassValue;
	}

	let { options, value = $bindable(), label, class: className }: Props = $props();
</script>

<div class={['filter-chips', className]} role="group" aria-label={label}>
	{#each options as option (option.id)}
		<button
			type="button"
			class="filter-chips__chip"
			aria-pressed={value === option.id}
			onclick={() => (value = option.id)}
		>
			{option.label}
		</button>
	{/each}
</div>

<style>
	.filter-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.filter-chips__chip {
		flex: 1 1 auto;
		min-block-size: 44px;
		padding: 8px 14px;
		border: 2px solid var(--line-strong);
		background: var(--bg-soft);
		color: var(--text);
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 0.75rem;
		line-height: 1.2;
		letter-spacing: 0.04em;
		text-align: center;
		text-transform: uppercase;
		cursor: pointer;
		transition:
			background-color 0.15s var(--ease-out),
			border-color 0.15s var(--ease-out),
			color 0.15s var(--ease-out);
	}

	@media (hover: hover) and (pointer: fine) {
		.filter-chips__chip:hover {
			border-color: var(--muted);
		}
	}

	/* The pressed state is styled from the accessible state so the two cannot diverge. */
	.filter-chips__chip[aria-pressed='true'] {
		border-color: var(--acid);
		background: var(--acid);
		color: var(--ink);
	}

	/* Chips stop stretching once there is room for a tidy row. */
	@media (min-width: 640px) {
		.filter-chips__chip {
			flex: 0 0 auto;
		}
	}
</style>
