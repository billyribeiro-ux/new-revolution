<script lang="ts">
	/**
	 * Reusable shimmer skeleton block. Used while async data is loading
	 * to prevent layout jank — the placeholder reserves the same vertical
	 * space the eventual content will occupy.
	 *
	 * Sizing via `height`, `width`, `rounded` props. Multiple stacked via
	 * `count` so a list of N rows is one component, not N.
	 *
	 * Defaults: full width, 1rem high, sm border-radius (matches typical
	 * line-of-text rendering). Accepts a `class` override via `data-extra`
	 * style hook for any one-off positioning need without forking the
	 * component.
	 */
	interface Props {
		width?: string;
		height?: string;
		rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
		count?: number;
		gap?: string;
		label?: string;
	}

	let {
		width = '100%',
		height = '1rem',
		rounded = 'sm',
		count = 1,
		gap = '0.5rem',
		label = 'Loading'
	}: Props = $props();

	const radiusMap = {
		none: '0',
		sm: '0.25rem',
		md: '0.5rem',
		lg: '0.85rem',
		full: '999px'
	} as const;

	let items = $derived(Array.from({ length: count }, (_, i) => i));
</script>

<div
	class="skeleton-stack"
	role="status"
	aria-live="polite"
	aria-busy="true"
	aria-label={label}
	style:gap
>
	{#each items as i (i)}
		<div class="skeleton" style:width style:height style:border-radius={radiusMap[rounded]}></div>
	{/each}
</div>

<style>
	.skeleton-stack {
		display: flex;
		flex-direction: column;
	}

	.skeleton {
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.04) 0%,
			rgba(255, 255, 255, 0.1) 50%,
			rgba(255, 255, 255, 0.04) 100%
		);
		background-size: 200% 100%;
		animation: skeleton-shimmer 1.4s ease-in-out infinite;
	}

	@keyframes skeleton-shimmer {
		from {
			background-position: 200% 0;
		}
		to {
			background-position: -200% 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.skeleton {
			animation: none;
			background: rgba(255, 255, 255, 0.06);
		}
	}
</style>
