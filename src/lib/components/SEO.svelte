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
		description = 'Revolution Trading Pros Admin Dashboard',
		canonical,
		noindex = false,
		nofollow = false
	}: Props = $props();

	const robotsContent = $derived(
		[noindex ? 'noindex' : 'index', nofollow ? 'nofollow' : 'follow'].join(', ')
	);
	const fullTitle = $derived(
		title.includes('Revolution Trading Pros') ? title : `${title} | Revolution Trading Pros`
	);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	{#if canonical && !noindex}
		<link rel="canonical" href={canonical} />
	{/if}
	<meta name="robots" content={robotsContent} />
</svelte:head>
