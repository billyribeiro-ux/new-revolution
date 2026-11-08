<!-- src/lib/components/layout/Breadcrumb.svelte -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import type { RouteId } from '$app/types';
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	interface Crumb {
		label: string;
		/** Route pathname, resolved with `resolve()` here. Omit on the current page. */
		href?: RouteId;
	}

	/** `class` lands on the inner content box, so a page can align it with its own container (e.g. the global `container`). */
	let {
		items,
		children,
		class: className
	}: { items: Crumb[]; children?: Snippet; class?: ClassValue } = $props();
</script>

<nav class="breadcrumb-bar" aria-label="Breadcrumb">
	<div class={['container', 'breadcrumb-bar__inner', className]}>
		<ol class="breadcrumb-list">
			{#each items as item (item.label)}
				<li aria-current={item.href ? undefined : 'page'}>
					{#if item.href}
						<!-- resolve() overloads are per-route; a RouteId union needs this single, contained cast. -->
						<a href={resolve(item.href as '/')}>{item.label}</a>
					{:else}
						<span>{item.label}</span>
					{/if}
				</li>
			{/each}
		</ol>
		{#if children}
			<p class="breadcrumb-bar__telemetry">{@render children()}</p>
		{/if}
	</div>
</nav>

<style>
	.breadcrumb-bar {
		background-color: var(--bg-soft);
		border-block-end: 1px solid #2b3239;
		padding-block: 8px;
	}

	@media (min-width: 768px) {
		.breadcrumb-bar {
			padding-block: 10px;
		}
	}

	.breadcrumb-bar__inner {
		display: flex;
		flex-direction: column;
		gap: 6px;
		justify-content: space-between;
	}

	.breadcrumb-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}

	.breadcrumb-list li,
	.breadcrumb-list a,
	.breadcrumb-list span {
		font-family: var(--font-mono);
		font-weight: 600;
		font-size: var(--text-breadcrumb);
		text-transform: uppercase;
		letter-spacing: var(--tracking-breadcrumb);
		line-height: 1.4;
		color: var(--muted);
		max-inline-size: none;
	}

	.breadcrumb-list li {
		display: inline-flex;
		align-items: center;
	}

	/* Decorative separator drawn in CSS so it is not a fake list item; the empty alt text hides it from AT. */
	.breadcrumb-list li + li::before {
		content: '/';
		content: '/' / '';
		margin-inline-end: 0.5rem;
		color: var(--muted);
	}

	.breadcrumb-list a,
	.breadcrumb-bar__telemetry :global(a) {
		display: inline-flex;
		align-items: center;
		min-block-size: 24px;
		min-inline-size: 24px;
		color: var(--text);
		text-decoration: underline;
		text-decoration-color: #4a525a;
		text-underline-offset: 4px;
		transition: color 0.2s var(--ease-out);
	}

	.breadcrumb-list a:hover,
	.breadcrumb-bar__telemetry :global(a:hover) {
		color: var(--acid);
	}

	.breadcrumb-list [aria-current='page'] {
		color: var(--acid);
	}

	.breadcrumb-bar__telemetry {
		margin: 0;
		font-family: var(--font-mono);
		font-weight: 600;
		font-size: var(--text-breadcrumb);
		text-transform: uppercase;
		letter-spacing: var(--tracking-breadcrumb);
		line-height: 1.4;
		color: var(--muted);
	}

	.breadcrumb-bar__telemetry :global(span:first-child) {
		color: var(--acid);
	}

	@media (min-width: 1024px) {
		.breadcrumb-bar__inner {
			flex-direction: row;
			align-items: center;
		}
	}
</style>
