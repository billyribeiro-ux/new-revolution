<script lang="ts">
	interface Props {
		selectedCount: number;
		/** Selected items visible on the current page, used to word "Select page". */
		pageCount: number;
		folders: string[];
		busy: boolean;
		onSelectPage: () => void;
		onClear: () => void;
		onMove: (folder: string) => void;
		onDelete: () => void;
	}

	let { selectedCount, pageCount, folders, busy, onSelectPage, onClear, onMove, onDelete }: Props =
		$props();

	const ROOT = '__ROOT__';
</script>

<div class="ml-bulk" role="toolbar" aria-label="Bulk actions">
	<span class="ml-bulk-count">{selectedCount} selected</span>
	<div class="ml-bulk-actions">
		<button type="button" class="ml-btn" onclick={onSelectPage} disabled={busy || pageCount === 0}>
			Select all on page
		</button>
		<button type="button" class="ml-btn" onclick={onClear} disabled={busy}>Clear selection</button>
		<label class="ml-sr-only" for="ml-bulk-move">Move selected to folder</label>
		<select
			id="ml-bulk-move"
			class="ml-input"
			disabled={busy}
			onchange={(e) => {
				const value = e.currentTarget.value;
				// Back to the placeholder so the same destination can be picked again for the next batch.
				e.currentTarget.value = '';
				if (value) onMove(value === ROOT ? '' : value);
			}}
		>
			<option value="">Move to folder...</option>
			<option value={ROOT}>Root</option>
			{#each folders as f (f)}
				<option value={f}>{f}</option>
			{/each}
		</select>
		<button type="button" class="ml-btn is-danger" onclick={onDelete} disabled={busy}>
			Delete ({selectedCount})
		</button>
	</div>
</div>

<style>
	.ml-bulk {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem;
		padding: 0.55rem 1.25rem;
		background: rgba(220, 255, 101, 0.08);
		border-bottom: 1px solid var(--line);
	}

	.ml-bulk-count {
		font-size: 0.86rem;
		font-weight: 700;
		color: var(--text);
	}

	.ml-bulk-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}
</style>
