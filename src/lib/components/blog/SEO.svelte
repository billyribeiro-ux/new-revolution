<script lang="ts">
	import { JsonLd } from 'svelte-meta-tags';
	import { BRAND_NAME, SITE_ORIGIN } from '#lib/seo/structured-data';

	interface Props {
		schema?: Record<string, unknown> | null;
	}

	let { schema = null }: Props = $props();
</script>

<svelte:head>
	<link
		rel="alternate"
		type="application/rss+xml"
		title={`${BRAND_NAME} RSS Feed`}
		href={`${SITE_ORIGIN}/rss.xml`}
	/>
</svelte:head>

{#if schema}
	<JsonLd {schema} />
{/if}
