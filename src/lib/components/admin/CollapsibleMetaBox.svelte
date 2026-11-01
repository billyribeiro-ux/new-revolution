<script lang="ts">
	import { untrack } from 'svelte';
	import CaretUpIcon from 'phosphor-svelte/lib/CaretUpIcon';
	import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon';

	let {
		title,
		id,
		defaultOpen = true,
		pinned = false,
		children
	}: {
		title: string;
		id: string;
		defaultOpen?: boolean;
		pinned?: boolean;
		children: import('svelte').Snippet;
	} = $props();

	let storageKey = $derived(`wp-metabox-${id}`);

	function getInitialOpen(): boolean {
		if (pinned) return defaultOpen;
		if (typeof window !== 'undefined') {
			try {
				const saved = window.localStorage.getItem(`wp-metabox-${id}`);
				if (saved !== null) return saved === 'true';
			} catch {
				// storage unavailable (Safari private mode, quota exceeded)
			}
		}
		return defaultOpen;
	}

	let isOpen = $state(untrack(() => getInitialOpen()));

	function toggle() {
		if (pinned) return;
		isOpen = !isOpen;
		try {
			localStorage.setItem(storageKey, String(isOpen));
		} catch {
			/* ignore */
		}
	}
</script>

<!--
	Disclosure pattern: the <h3> holds the button (a heading inside a button
	loses its heading role), and the body stays in the DOM while collapsed so
	`aria-controls` resolves; it used to be removed, leaving a dangling id.
-->
<div class={['wp-panel', { 'wp-panel--collapsed': !isOpen }]}>
	<h3 class="wp-panel__heading">
		<button
			type="button"
			class="wp-panel__header"
			onclick={toggle}
			aria-expanded={isOpen}
			aria-controls="wp-panel-body-{id}"
			disabled={pinned}
		>
			<span class="wp-panel__title">{title}</span>
			{#if !pinned}
				<span class="wp-panel__toggle" aria-hidden="true">
					{#if isOpen}
						<CaretUpIcon size={12} />
					{:else}
						<CaretDownIcon size={12} />
					{/if}
				</span>
			{/if}
		</button>
	</h3>
	<div class="wp-panel__body" id="wp-panel-body-{id}" hidden={!isOpen}>
		{#if isOpen}
			{@render children()}
		{/if}
	</div>
</div>

<style>
	.wp-panel {
		background: var(--wp-surface, #2c3338);
		border: 1px solid var(--wp-border, #3c434a);
		border-radius: 0;
	}
	.wp-panel__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 8px 12px;
		background: var(--wp-surface-alt, #1d2327);
		border: none;
		border-bottom: 1px solid var(--wp-border, #3c434a);
		cursor: pointer;
		user-select: none;
		text-align: left;
		color: var(--wp-text, #f0f0f1);
	}
	.wp-panel__header:disabled {
		cursor: default;
	}
	.wp-panel__heading {
		margin: 0;
		font: inherit;
		letter-spacing: inherit;
		color: inherit;
	}
	/* What the <h3> inside the button used to look like. */
	.wp-panel__title {
		font-family: var(--font-heading);
		letter-spacing: var(--tracking-h3);
		font-size: 13px;
		font-weight: 600;
		color: var(--wp-text, #f0f0f1);
		line-height: 1.4;
	}
	.wp-panel__toggle {
		color: var(--wp-text-muted, #a7aaad);
		display: flex;
		align-items: center;
	}
	.wp-panel--collapsed .wp-panel__header {
		border-bottom: none;
	}
	.wp-panel__body {
		padding: 12px;
	}
	.wp-panel__body[hidden] {
		display: none;
	}
</style>
