<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import type { MediaItem } from '#lib/shared/media-upload';

	interface Props {
		items: MediaItem[];
		viewMode: 'grid' | 'list';
		loading: boolean;
		/** Trash view: no bulk checkboxes, no drop upload. */
		showTrash: boolean;
		inspectedId: string | null;
		/** Ids currently ticked for bulk actions (any page). */
		checked: ReadonlyMap<string, string>;
		page: number;
		totalPages: number;
		onInspect: (item: MediaItem) => void;
		onOpen: (item: MediaItem) => void;
		onCheck: (item: MediaItem, checked: boolean, shiftKey: boolean) => void;
		onCheckPage: (checked: boolean) => void;
		onPage: (page: number) => void;
		onFiles: (files: File[]) => void;
	}

	let {
		items,
		viewMode,
		loading,
		showTrash,
		inspectedId,
		checked,
		page,
		totalPages,
		onInspect,
		onOpen,
		onCheck,
		onCheckPage,
		onPage,
		onFiles
	}: Props = $props();

	let dragDepthActive = $state(false);
	let allChecked = $derived(items.length > 0 && items.every((i) => checked.has(i.id)));

	function formatBytes(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
	}

	function hasFiles(e: DragEvent): boolean {
		return Array.from(e.dataTransfer?.types ?? []).includes('Files');
	}

	/** Arrow keys move focus between card buttons (reference parity: TC MediaLibrary.svelte). */
	const gridKeys: Attachment<HTMLElement> = (grid) => {
		function onKeydown(e: KeyboardEvent) {
			if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
			const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-media-card]'));
			const index = cards.indexOf(document.activeElement as HTMLElement);
			if (index < 0) return;
			const cols = Math.max(1, getComputedStyle(grid).gridTemplateColumns.split(' ').length);
			const delta =
				e.key === 'ArrowRight'
					? 1
					: e.key === 'ArrowLeft'
						? -1
						: e.key === 'ArrowDown'
							? cols
							: -cols;
			const next = cards[index + delta];
			if (next) {
				e.preventDefault();
				next.focus();
			}
		}
		grid.addEventListener('keydown', onKeydown);
		return () => grid.removeEventListener('keydown', onKeydown);
	};
</script>

<div
	role="presentation"
	class={['ml-main', { 'is-drop-target': dragDepthActive }]}
	ondragover={(e) => {
		if (showTrash || !hasFiles(e)) return;
		e.preventDefault();
		dragDepthActive = true;
	}}
	ondragleave={(e) => {
		if (e.currentTarget === e.target) dragDepthActive = false;
	}}
	ondrop={(e) => {
		if (showTrash || !hasFiles(e)) return;
		e.preventDefault();
		dragDepthActive = false;
		const files = Array.from(e.dataTransfer?.files ?? []);
		if (files.length > 0) onFiles(files);
	}}
>
	{#if dragDepthActive}
		<p class="ml-drop-hint">Drop images to upload</p>
	{/if}

	{#if loading}
		<p class="ml-empty">Loading media assets...</p>
	{:else if items.length === 0}
		<p class="ml-empty">
			{showTrash
				? 'Trash is empty.'
				: 'No media items found. Switch to "Upload Files" or drop images here to add them.'}
		</p>
	{:else if viewMode === 'grid'}
		<div class="media-grid" {@attach gridKeys}>
			{#each items as item (item.id)}
				<div class="media-card-wrap">
					<button
						type="button"
						data-media-card
						class={['media-card', { 'is-selected': inspectedId === item.id }]}
						aria-pressed={inspectedId === item.id}
						onclick={() => onInspect(item)}
						ondblclick={() => onOpen(item)}
					>
						<span class="media-thumb-wrap">
							<img
								src={item.urls.thumbnail}
								alt={item.alt_text || item.filename}
								width="300"
								height="300"
								loading="lazy"
								class="media-thumb"
							/>
							{#if !item.alt_text}
								<span class="badge-missing-alt" title="Missing alt text">No Alt</span>
							{/if}
						</span>
						<span class="media-card-meta">
							<span class="media-card-name">{item.filename}</span>
							<span class="media-card-sub">
								{item.width && item.height ? `${item.width}x${item.height} · ` : ''}{formatBytes(
									item.size_bytes
								)}
							</span>
						</span>
					</button>
					{#if !showTrash}
						<input
							type="checkbox"
							class="ml-check media-card-check"
							aria-label={`Select ${item.filename} for bulk actions`}
							checked={checked.has(item.id)}
							onclick={(e) => onCheck(item, e.currentTarget.checked, e.shiftKey)}
						/>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<table class="media-table">
			<thead>
				<tr>
					{#if !showTrash}
						<th class="col-check">
							<input
								type="checkbox"
								class="ml-check"
								aria-label="Select all items on this page"
								checked={allChecked}
								onclick={(e) => onCheckPage(e.currentTarget.checked)}
							/>
						</th>
					{/if}
					<th>Preview</th>
					<th>Filename</th>
					<th>Alt Text</th>
					<th>Folder</th>
					<th>Dimensions</th>
					<th>Size</th>
					<th>Used</th>
				</tr>
			</thead>
			<tbody>
				{#each items as item (item.id)}
					<tr
						class={{ 'is-selected': inspectedId === item.id }}
						onclick={() => onInspect(item)}
						ondblclick={() => onOpen(item)}
					>
						{#if !showTrash}
							<td class="col-check">
								<input
									type="checkbox"
									class="ml-check"
									aria-label={`Select ${item.filename} for bulk actions`}
									checked={checked.has(item.id)}
									onclick={(e) => {
										e.stopPropagation();
										onCheck(item, e.currentTarget.checked, e.shiftKey);
									}}
								/>
							</td>
						{/if}
						<td>
							<img
								src={item.urls.thumbnail}
								alt={item.alt_text || item.filename}
								width="48"
								height="48"
								loading="lazy"
								class="table-thumb"
							/>
						</td>
						<td>
							<button
								type="button"
								class="ml-linkbtn"
								aria-pressed={inspectedId === item.id}
								onclick={(e) => {
									e.stopPropagation();
									onInspect(item);
								}}
							>
								{item.filename}
							</button>
						</td>
						<td>{item.alt_text || 'Missing alt text'}</td>
						<td>{item.folder || 'Root'}</td>
						<td>{item.width && item.height ? `${item.width}x${item.height}` : 'N/A'}</td>
						<td>{formatBytes(item.size_bytes)}</td>
						<td>{item.usage_count ?? 0}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}

	{#if totalPages > 1 && !showTrash}
		<div class="ml-pagination">
			<button type="button" class="ml-btn" disabled={page <= 1} onclick={() => onPage(page - 1)}>
				Previous
			</button>
			<span class="ml-page-info">Page {page} of {totalPages}</span>
			<button
				type="button"
				class="ml-btn"
				disabled={page >= totalPages}
				onclick={() => onPage(page + 1)}
			>
				Next
			</button>
		</div>
	{/if}
</div>

<style>
	.ml-main {
		position: relative;
		padding: 1rem 1.25rem;
		overflow-y: auto;
	}

	.ml-main.is-drop-target {
		outline: 2px dashed var(--acid);
		outline-offset: -6px;
		background: rgba(220, 255, 101, 0.05);
	}

	.ml-drop-hint {
		margin: 0 0 0.75rem;
		text-align: center;
		font-weight: 700;
		color: var(--acid);
	}

	.media-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 0.85rem;
	}

	.media-card-wrap {
		position: relative;
	}

	.media-card {
		display: flex;
		flex-direction: column;
		width: 100%;
		padding: 0;
		background: var(--panel2);
		border: 2px solid var(--line);
		border-radius: 8px;
		overflow: hidden;
		cursor: pointer;
		text-align: left;
		color: inherit;
	}

	.media-card:focus-visible {
		outline: 2px solid var(--acid);
		outline-offset: 2px;
	}

	.media-card.is-selected {
		border-color: var(--acid);
	}

	.media-card-check {
		position: absolute;
		top: 8px;
		left: 8px;
		width: 20px;
		height: 20px;
		margin: 0;
		accent-color: var(--acid);
		cursor: pointer;
	}

	.media-thumb-wrap {
		position: relative;
		width: 100%;
		aspect-ratio: 4 / 3;
		background: var(--bg);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.media-thumb {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.badge-missing-alt {
		position: absolute;
		top: 6px;
		right: 6px;
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
		background: var(--coral);
		color: var(--ink);
		font-size: 0.75rem;
		font-weight: 700;
	}

	.media-card-meta {
		padding: 0.5rem 0.65rem;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.media-card-name {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.media-card-sub {
		font-size: 0.75rem;
		color: var(--muted);
	}

	.media-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.84rem;
		color: var(--text);
	}

	.media-table th,
	.media-table td {
		padding: 0.5rem 0.65rem;
		border-bottom: 1px solid var(--line);
		text-align: left;
	}

	.media-table tr.is-selected {
		background: rgba(220, 255, 101, 0.08);
	}

	.ml-linkbtn {
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
		text-decoration: underline;
	}

	.ml-linkbtn:focus-visible {
		outline: 2px solid var(--acid);
		outline-offset: 2px;
	}

	.col-check {
		width: 2rem;
	}

	.table-thumb {
		width: 48px;
		height: 36px;
		object-fit: cover;
		border-radius: 4px;
	}

	.ml-pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		margin-top: 1.25rem;
	}

	.ml-page-info {
		font-size: 0.84rem;
		color: var(--muted);
	}

	.ml-empty {
		color: var(--muted);
		font-size: 0.88rem;
		text-align: center;
		padding: 2rem 1rem;
	}
</style>
