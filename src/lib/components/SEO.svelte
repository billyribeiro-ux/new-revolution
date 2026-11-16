<script lang="ts">
	interface Props {
		title: string;
		description?: string;
		canonical?: string;
		noindex?: boolean;
		nofollow?: boolean;
	}

	let {
		title,
		description = '',
		canonical = '',
		noindex = false,
		nofollow = false
	}: Props = $props();
</script>

{#if false}
	<span>{title}{description}{canonical}{noindex}{nofollow}</span>
{/if}
