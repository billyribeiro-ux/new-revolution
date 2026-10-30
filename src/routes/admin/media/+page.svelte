<script lang="ts">
	import { resolve } from '$app/paths';
	import MediaLibrary from '#lib/components/admin/MediaLibrary.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Media Library | Admin | Revolution Trading Pros</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="admin-media-page">
	<div class="admin-media-topbar">
		<div>
			<span class="admin-kicker">Content Administration</span>
			<h1 class="admin-h1">Media Library</h1>
		</div>
		<a class="btn-back" href={resolve('/admin/posts')}>Back to Posts</a>
	</div>

	<MediaLibrary
		mode="page"
		initialItems={data.items}
		initialFolders={data.folders}
		initialTotal={data.total}
	/>
</main>

<style>
	.admin-media-page {
		max-width: 1440px;
		margin: 0 auto;
		padding: 2rem 1.5rem 4rem;
	}

	.admin-media-topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.admin-kicker {
		display: block;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--acid);
		margin-bottom: 0.25rem;
	}

	.admin-h1 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.65rem;
		font-weight: 800;
		color: var(--text);
	}

	.btn-back {
		padding: 0.5rem 0.95rem;
		border-radius: 6px;
		border: 1px solid var(--line-strong);
		background: var(--panel);
		color: var(--text);
		font-size: 0.85rem;
		font-weight: 600;
	}
</style>
