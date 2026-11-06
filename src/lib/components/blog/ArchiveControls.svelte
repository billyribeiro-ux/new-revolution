<script lang="ts">
	import { resolve } from '$app/paths';

	import { archiveHref } from './archive';
	import type { ArchivePath, ArchiveTopic } from './archive';

	interface Props {
		basePath: ArchivePath;
		search: string;
		topics: readonly ArchiveTopic[];
		topicLabel?: string;
	}
	let { basePath, search, topics, topicLabel = 'Browse by topic' }: Props = $props();
	const uid = $props.id();
</script>

<div class="archive-controls">
	<form method="GET" action={resolve(archiveHref(basePath))} role="search" class="archive-search">
		<label for={`${uid}-search`}>Search articles</label>
		<div class="search-fields">
			<input
				id={`${uid}-search`}
				type="search"
				name="search"
				value={search}
				placeholder="Search the journal"
			/>
			<button type="submit">Search</button>
			{#if search}<a class="clear-search" href={resolve(archiveHref(basePath))}>Clear search</a
				>{/if}
		</div>
	</form>
	<nav class="archive-topics" aria-label={topicLabel}>
		<span class="topic-label">{topicLabel}</span>
		<ul>
			<li>
				<a
					href={resolve(archiveHref('/blog', 1, search))}
					aria-current={basePath === '/blog' ? 'page' : undefined}>All articles</a
				>
			</li>
			{#each topics as topic (topic.id)}
				<li>
					<a
						href={resolve(archiveHref(topic.path, 1, search))}
						aria-current={basePath === topic.path ? 'page' : undefined}
						>{topic.name} <span>({topic.postCount})</span></a
					>
				</li>
			{/each}
		</ul>
	</nav>
</div>

<style>
	.archive-controls {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		min-inline-size: 0;
		gap: 1.5rem;
		padding-block: 1.5rem;
		border-block: 1px solid var(--line);
	}
	.archive-search {
		min-inline-size: 0;
		max-inline-size: 48rem;
	}
	.archive-search label {
		display: block;
		margin-block-end: 0.5rem;
		font-weight: 700;
	}
	.search-fields {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	input {
		flex: 1 1 12rem;
		inline-size: 100%;
		max-inline-size: 100%;
		min-inline-size: 0;
		min-block-size: 48px;
		padding: 0.7rem 0.9rem;
		border: 1px solid var(--line-strong);
		background: var(--bg);
		color: var(--text);
		font: inherit;
	}
	button {
		min-block-size: 48px;
		padding: 0.7rem 1.25rem;
		border: 1px solid var(--acid);
		background: var(--acid);
		color: var(--ink);
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}
	button:hover {
		background: var(--btn-acid-hover);
	}
	.clear-search {
		display: inline-flex;
		align-items: center;
		min-block-size: 44px;
		padding: 0.5rem 0.75rem;
		color: var(--acid);
		font-weight: 700;
	}
	.archive-topics {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 0.75rem 1.25rem;
	}
	.topic-label {
		color: var(--muted);
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: 0.07em;
		text-transform: uppercase;
	}
	ul {
		min-inline-size: 0;
		max-inline-size: 100%;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}
	li {
		min-inline-size: 0;
		max-inline-size: 100%;
	}
	.archive-topics a {
		max-inline-size: 100%;
		display: inline-flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.3em;
		min-block-size: 44px;
		padding: 0.5rem 0.85rem;
		border: 1px solid var(--line-strong);
		color: var(--text-secondary);
		font-size: 0.875rem;
		font-weight: 700;
		overflow-wrap: anywhere;
	}
	.archive-topics a:hover,
	.archive-topics a[aria-current='page'] {
		background: var(--acid);
		border-color: var(--acid);
		color: var(--ink);
	}
</style>
