<script lang="ts">
	import TodoPageShell from '#lib/components/layout/TodoPageShell.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<TodoPageShell spec={data.todoSpec} />
