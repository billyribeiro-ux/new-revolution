<script lang="ts">
	import AvailabilityPage from './AvailabilityPage.svelte';
	import type { TodoPageSpec } from '#lib/data/todo-pages.ts';
	let { spec }: { spec: TodoPageSpec } = $props();
</script>

<AvailabilityPage {spec} />
