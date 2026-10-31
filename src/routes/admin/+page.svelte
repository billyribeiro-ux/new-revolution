<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const STATUS_LABEL: Record<string, string> = {
		draft: 'Draft',
		review: 'In review',
		scheduled: 'Scheduled',
		published: 'Published',
		archived: 'Archived'
	};

	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		dateStyle: 'medium',
		timeStyle: 'short',
		timeZone: 'UTC'
	});

	const stats = $derived([
		{ label: 'Drafts', value: data.counts.drafts },
		{ label: 'Scheduled', value: data.counts.scheduled },
		{ label: 'Published', value: data.counts.published },
		{ label: 'Trashed', value: data.counts.trashed },
		{ label: 'In review', value: data.counts.inReview },
		{ label: 'Archived', value: data.counts.archived }
	]);
</script>

<svelte:head>
	<title>Dashboard | Admin | Revolution Trading Pros</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="admin-dashboard">
	<header class="dashboard-header">
		<p class="dashboard-kicker">Content administration</p>
		<h1 class="dashboard-title">Dashboard</h1>
	</header>

	<section class="dashboard-section" aria-labelledby="dashboard-stats-heading">
		<h2 id="dashboard-stats-heading" class="section-title">Posts</h2>
		<dl class="stat-grid">
			{#each stats as stat (stat.label)}
				<div class="stat">
					<dt>{stat.label}</dt>
					<dd>{stat.value}</dd>
				</div>
			{/each}
		</dl>
		<p class="stat-note">
			{#if data.counts.activeTotal === 0 && data.counts.trashed === 0}
				No posts exist yet.
			{:else}
				{data.counts.activeTotal} active {data.counts.activeTotal === 1 ? 'post' : 'posts'}, not
				counting the trash.
			{/if}
		</p>
	</section>

	<section class="dashboard-section" aria-labelledby="dashboard-links-heading">
		<h2 id="dashboard-links-heading" class="section-title">Quick links</h2>
		<ul class="quick-links">
			<li>
				<a class="quick-link quick-link--primary" href={resolve('/admin/posts/new')}>New post</a>
			</li>
			<li><a class="quick-link" href={resolve('/admin/posts')}>All posts</a></li>
			<li><a class="quick-link" href={resolve('/admin/media')}>Media</a></li>
		</ul>
	</section>

	<section class="dashboard-section" aria-labelledby="dashboard-recent-heading">
		<h2 id="dashboard-recent-heading" class="section-title">Recently updated</h2>

		{#if data.recent.length === 0}
			<p class="empty-state">
				No posts yet. <a href={resolve('/admin/posts/new')}>Write the first one</a>.
			</p>
		{:else}
			<ol class="recent-list">
				{#each data.recent as post (post.id)}
					<li class="recent-item">
						<a class="recent-title" href={resolve('/admin/posts/[id]', { id: String(post.id) })}>
							{post.title || 'Untitled post'}
						</a>
						<span class="recent-meta">
							<span class="recent-status">{STATUS_LABEL[post.status] ?? post.status}</span>
							<time datetime={post.updatedAt.toISOString()}>
								Updated {dateFormatter.format(post.updatedAt)} UTC
							</time>
						</span>
					</li>
				{/each}
			</ol>
		{/if}
	</section>
</main>

<style>
	.admin-dashboard {
		max-width: 960px;
		margin: 0 auto;
		color: var(--text);
		font-family: var(--font-sans);
	}

	.dashboard-header {
		margin-bottom: 24px;
	}

	.dashboard-kicker {
		margin: 0 0 6px;
		font-family: var(--font-display);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.dashboard-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 28px;
		font-weight: 700;
		line-height: 1.2;
	}

	.dashboard-section {
		margin-bottom: 32px;
	}

	.section-title {
		margin: 0 0 12px;
		font-family: var(--font-display);
		font-size: 18px;
		font-weight: 700;
	}

	.stat-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1px;
		margin: 0;
		background: var(--line);
		border: 1px solid var(--line);
	}

	.stat {
		display: grid;
		gap: 4px;
		padding: 14px 16px;
		background: var(--panel);
	}

	.stat dt {
		font-size: 13px;
		color: var(--muted);
	}

	.stat dd {
		margin: 0;
		font-family: var(--font-display);
		font-size: 26px;
		font-weight: 700;
		color: var(--text);
	}

	.stat-note {
		margin: 8px 0 0;
		font-size: 14px;
		color: var(--muted);
	}

	.quick-links {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.quick-link {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0 16px;
		font-family: var(--font-display);
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
		text-decoration: none;
		background: var(--panel2);
		border: 1px solid var(--line-strong);
	}

	.quick-link:hover {
		background: var(--btn-dark-hover);
	}

	.quick-link--primary {
		color: var(--ink);
		background: var(--acid);
		border-color: var(--acid);
	}

	.quick-link--primary:hover {
		background: var(--btn-acid-hover);
	}

	.empty-state {
		margin: 0;
		padding: 16px;
		background: var(--panel);
		border: 1px solid var(--line);
		color: var(--text-secondary);
	}

	.empty-state a {
		color: var(--acid);
	}

	.recent-list {
		margin: 0;
		padding: 0;
		list-style: none;
		border: 1px solid var(--line);
	}

	.recent-item {
		display: grid;
		gap: 4px;
		padding: 12px 16px;
		background: var(--panel);
		border-bottom: 1px solid var(--line);
	}

	.recent-item:last-child {
		border-bottom: none;
	}

	.recent-title {
		font-family: var(--font-display);
		font-size: 16px;
		font-weight: 600;
		color: var(--text);
		text-decoration: none;
		overflow-wrap: anywhere;
	}

	.recent-title:hover {
		text-decoration: underline;
	}

	.recent-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 12px;
		font-size: 13px;
		color: var(--muted);
	}

	.recent-status {
		color: var(--text-secondary);
	}

	@media (min-width: 640px) {
		.stat-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@media (min-width: 1024px) {
		.stat-grid {
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}
	}
</style>
