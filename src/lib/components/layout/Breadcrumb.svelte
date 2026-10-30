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
	<div class={['breadcrumb-bar__inner', className]}>
		<ol class="breadcrumb-list">
			{#each items as item (item.label)}
				<li>
					{#if item.href}
						<!-- resolve() overloads are per-route; a RouteId union needs this single, contained cast. -->
						<a href={resolve(item.href as '/')}>{item.label}</a>
					{:else}
						<span aria-current="page">{item.label}</span>
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
		background-color: var(--panel);
		border-bottom: 1.5px solid var(--line-strong);
		padding: 0.625rem 0;
	}

	.breadcrumb-bar__inner {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		justify-content: space-between;
		max-width: 1440px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.breadcrumb-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Decorative separator drawn in CSS so it is not a fake list item; the empty alt text hides it from AT. */
	.breadcrumb-list li + li::before {
		content: '/';
		content: '/' / '';
		margin-inline-end: 0.5rem;
	}

	.breadcrumb-list a {
		color: var(--text);
		text-decoration: underline;
	}

	.breadcrumb-bar__telemetry {
		margin: 0;
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #c4c8c7;
	}

	@media (min-width: 480px) {
		.breadcrumb-bar__inner {
			padding: 0 1.25rem;
		}
	}

	@media (min-width: 640px) {
		.breadcrumb-bar__inner {
			padding: 0 1.5rem;
		}
	}

	@media (min-width: 768px) {
		.breadcrumb-bar__inner {
			flex-direction: row;
			align-items: center;
		}
	}

	@media (min-width: 1024px) {
		.breadcrumb-bar__inner {
			padding: 0 2rem;
		}
	}

	@media (min-width: 1536px) {
		.breadcrumb-bar__inner {
			max-width: 1536px;
		}
	}
</style>
