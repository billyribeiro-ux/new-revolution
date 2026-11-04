<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import CatalogGrid from '../CatalogGrid.svelte';

	interface Item {
		id: string;
		name: string;
		lead?: boolean;
	}

	// Specialize the generic inside Svelte, where both the language server and
	// svelte-check can read its props, rather than plain tsc's *.svelte fallback.
	let props: ComponentProps<typeof CatalogGrid<Item>> = $props();
</script>

<CatalogGrid {...props} />
