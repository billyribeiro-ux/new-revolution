<script lang="ts">
	export interface QueueEntry {
		/** Generated, unique per queued file; never derived from the file name. */
		id: string;
		name: string;
		size: number;
		status: 'pending' | 'uploading' | 'done' | 'error';
		/** 0-100 from XMLHttpRequest upload progress. 100 while uploading means the server is converting. */
		progress: number;
		error?: string;
	}

	interface Props {
		entries: QueueEntry[];
		busy: boolean;
		onClear: () => void;
	}

	let { entries, busy, onClear }: Props = $props();

	function formatBytes(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
	}

	function statusText(entry: QueueEntry): string {
		if (entry.status === 'error') return entry.error ?? 'Upload failed.';
		if (entry.status === 'uploading') {
			return entry.progress >= 100 ? 'Processing...' : `Uploading ${entry.progress}%`;
		}
		if (entry.status === 'done') return 'Done';
		return 'Waiting';
	}
</script>

{#if entries.length > 0}
	<div class="ml-queue">
		<ul class="ml-queue-list" aria-label="Upload queue">
			{#each entries as entry (entry.id)}
				<li class="ml-queue-item">
					<div class="ml-queue-row">
						<span class="ml-queue-name">{entry.name} ({formatBytes(entry.size)})</span>
						<span class={['ml-queue-status', `is-${entry.status}`]}>{statusText(entry)}</span>
					</div>
					{#if entry.status === 'uploading' || entry.status === 'done'}
						<progress
							class="ml-queue-bar"
							max="100"
							value={entry.status === 'done' ? 100 : entry.progress}
							aria-label={`Upload progress for ${entry.name}`}
						></progress>
					{/if}
				</li>
			{/each}
		</ul>
		{#if !busy}
			<button type="button" class="ml-btn" onclick={onClear}>Clear list</button>
		{/if}
	</div>
{/if}

<style>
	.ml-queue {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.6rem;
	}

	.ml-queue-list {
		list-style: none;
		margin: 0;
		padding: 0;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.ml-queue-item {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding: 0.55rem 0.85rem;
		background: var(--panel2);
		border-radius: 6px;
		font-size: 0.85rem;
		color: var(--text);
	}

	.ml-queue-row {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.ml-queue-name {
		overflow-wrap: anywhere;
	}

	.ml-queue-status {
		flex-shrink: 0;
		text-align: right;
		color: var(--muted);
	}

	.ml-queue-status.is-done {
		color: var(--acid);
	}

	.ml-queue-status.is-error {
		color: var(--coral);
	}

	.ml-queue-bar {
		width: 100%;
		height: 6px;
		accent-color: var(--acid);
	}
</style>
