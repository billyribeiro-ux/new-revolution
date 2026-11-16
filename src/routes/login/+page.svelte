<script lang="ts">
	import TodoPageShell from '#lib/components/layout/TodoPageShell.svelte';
	import { STATIC_TODO_PAGES } from '#lib/data/todo-pages.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const spec = $derived(data.todoSpec ?? STATIC_TODO_PAGES['/login']);
</script>

<TodoPageShell {spec} />
