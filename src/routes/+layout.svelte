<script lang="ts">
	import '../app.css';

	import { asset } from '$app/paths';
	import { page } from '$app/state';
	import { MetaTags, deepMerge } from 'svelte-meta-tags';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	let metaTags = $derived.by(() => {
		const merged = deepMerge(data.baseMetaTags, page.data.pageMetaTags);
		if (page.error || page.status >= 400) {
			return {
				...merged,
				title: `${page.status} — Page Not Found`,
				description:
					'The requested page could not be found on Revolution Trading Pros. Return to our live trading rooms, educational courses, indicators, or blog.',
				robots: 'noindex, nofollow',
				additionalRobotsProps: undefined,
				canonical: undefined
			};
		}
		if (typeof merged.robots === 'string' && merged.robots.includes('noindex')) {
			return {
				...merged,
				additionalRobotsProps: undefined,
				canonical: undefined
			};
		}
		return merged;
	});
</script>

<svelte:head>
	<!-- Brand emblem icons (static/). Google requires favicon sizes that are multiples of 48px. -->
	<link rel="icon" href={asset('favicon.ico')} sizes="48x48" />
	<link rel="icon" href={asset('favicon-48x48.png')} type="image/png" sizes="48x48" />
	<link rel="icon" href={asset('icon-192.png')} type="image/png" sizes="192x192" />
	<link rel="apple-touch-icon" href={asset('apple-touch-icon.png')} />
</svelte:head>

{#if !page.url.pathname.startsWith('/admin/login')}
	<MetaTags {...metaTags} />
{/if}

{@render children()}
