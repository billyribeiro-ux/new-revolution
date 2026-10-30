<script lang="ts">
	import '../app.css';

	import { asset } from '$app/paths';
	import { page } from '$app/state';
	import { MetaTags, deepMerge } from 'svelte-meta-tags';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	let metaTags = $derived(deepMerge(data.baseMetaTags, page.data.pageMetaTags));
</script>

<svelte:head>
	<!-- Brand emblem icons (static/). Google requires favicon sizes that are multiples of 48px. -->
	<link rel="icon" href={asset('favicon.ico')} sizes="48x48" />
	<link rel="icon" href={asset('favicon-48x48.png')} type="image/png" sizes="48x48" />
	<link rel="icon" href={asset('icon-192.png')} type="image/png" sizes="192x192" />
	<link rel="apple-touch-icon" href={asset('apple-touch-icon.png')} />
</svelte:head>

<MetaTags {...metaTags} />

{@render children()}
