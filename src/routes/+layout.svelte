<script lang="ts">
	import '../app.css';

	import { asset } from '$app/paths';
	import { page } from '$app/state';
	import { MetaTags, deepMerge } from 'svelte-meta-tags';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const isAdminArea = $derived(
		page.url.pathname === '/admin' || page.url.pathname.startsWith('/admin/')
	);

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
	<!-- Brand emblem icons (static/). Google: square favicon, larger than 48x48 recommended, crawlable at a stable URL. -->
	<link rel="icon" href={asset('favicon.ico')} sizes="48x48" />
	<link rel="icon" href={asset('favicon-48x48.png')} type="image/png" sizes="48x48" />
	<link rel="icon" href={asset('icon-192.png')} type="image/png" sizes="192x192" />
	<link rel="apple-touch-icon" href={asset('apple-touch-icon.png')} />
</svelte:head>

<!-- The admin tree is noindex and sets its own title and robots (admin/+layout.svelte), so it must not inherit the marketing meta.
	 Its error pages render without that layout and still need the error title from MetaTags. -->
{#if !isAdminArea || page.error}
	<MetaTags {...metaTags} />
{/if}

{@render children()}
