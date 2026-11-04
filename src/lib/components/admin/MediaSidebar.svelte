<script lang="ts">
	import type { MediaItem } from '#lib/shared/media-upload';

	export type InsertSize = 'thumbnail' | 'medium' | 'large' | 'full';
	/** Alignment names emitted to the editor. Contract: docs/MEDIA_UI_CONTRACT.md. */
	export type InsertAlign = 'left' | 'center' | 'right' | 'full';

	interface Props {
		item: MediaItem | null;
		showTrash: boolean;
		/** Modal with an `onSelect` handler: shows the insert settings and button. */
		canInsert: boolean;
		savingMeta: boolean;
		editTitle: string;
		editAltText: string;
		editCaption: string;
		editDescription: string;
		editFolder: string;
		editFilename: string;
		insertSize: InsertSize;
		insertAlign: InsertAlign;
		insertLinkUrl: string;
		onSave: () => void;
		onDelete: () => void;
		onInsert: () => void;
		onCopyUrl: () => void;
	}

	let {
		item,
		showTrash,
		canInsert,
		savingMeta,
		editTitle = $bindable(),
		editAltText = $bindable(),
		editCaption = $bindable(),
		editDescription = $bindable(),
		editFolder = $bindable(),
		editFilename = $bindable(),
		insertSize = $bindable(),
		insertAlign = $bindable(),
		insertLinkUrl = $bindable(),
		onSave,
		onDelete,
		onInsert,
		onCopyUrl
	}: Props = $props();

	function formatBytes(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
	}
</script>

<aside class="ml-inspector" aria-label="Selected media details">
	{#if item}
		<div class="ml-preview">
			<img
				src={item.urls.medium}
				alt={item.alt_text || item.filename}
				width={item.width ?? 800}
				height={item.height ?? 450}
				class="ml-preview-img"
			/>
			<div class="ml-specs">
				<span>{item.mime_type}</span>
				{#if item.width && item.height}
					<span>{item.width} x {item.height} px</span>
				{/if}
				<span>{formatBytes(item.size_bytes)}</span>
				<span>Used in {item.usage_count ?? 0} post(s)</span>
			</div>
			<button type="button" class="ml-btn" onclick={onCopyUrl}>Copy Original URL</button>
		</div>

		<div class="ml-fields">
			<label class="ml-field">
				<span>Alt Text {!editAltText.trim() ? '(Required for SEO)' : ''}</span>
				<input type="text" class="ml-input" bind:value={editAltText} />
			</label>

			<label class="ml-field">
				<span>Title</span>
				<input type="text" class="ml-input" bind:value={editTitle} />
			</label>

			<label class="ml-field">
				<span>Caption</span>
				<input type="text" class="ml-input" bind:value={editCaption} />
			</label>

			<label class="ml-field">
				<span>Description</span>
				<textarea class="ml-input" rows="2" bind:value={editDescription}></textarea>
			</label>

			<label class="ml-field">
				<span>Folder</span>
				<input type="text" class="ml-input" placeholder="Root" bind:value={editFolder} />
			</label>

			<label class="ml-field">
				<span>Filename</span>
				<input type="text" class="ml-input" bind:value={editFilename} />
			</label>

			<div class="ml-actions">
				{#if showTrash}
					<p class="ml-hint" role="note">
						Trashed items cannot be restored: their files are deleted with the item. Upload the
						image again.
					</p>
				{:else}
					<button type="button" class="ml-btn ml-grow" disabled={savingMeta} onclick={onSave}>
						{savingMeta ? 'Saving...' : 'Save Metadata'}
					</button>
					<button type="button" class="ml-btn is-danger" onclick={onDelete}>Delete</button>
				{/if}
			</div>

			{#if canInsert && !showTrash}
				<hr class="ml-divider" />
				<div class="ml-fields">
					<label class="ml-field">
						<span>Insert Size</span>
						<select class="ml-input" bind:value={insertSize}>
							{#each item.available_sizes as s (s.value)}
								<option value={s.value} disabled={!s.available}>
									{s.label}{!s.available ? ' (Not needed)' : ''}
								</option>
							{/each}
						</select>
					</label>

					<label class="ml-field">
						<span>Alignment</span>
						<select class="ml-input" bind:value={insertAlign}>
							<option value="center">Center</option>
							<option value="left">Float Left</option>
							<option value="right">Float Right</option>
							<option value="full">Full Width</option>
						</select>
					</label>

					<label class="ml-field">
						<span>Link URL (optional)</span>
						<input
							type="url"
							class="ml-input"
							placeholder="https://..."
							bind:value={insertLinkUrl}
						/>
					</label>

					<button type="button" class="ml-btn is-primary is-block" onclick={onInsert}>
						Insert Into Post
					</button>
				</div>
			{/if}
		</div>
	{:else}
		<p class="ml-empty-inspector">Select an image to view or edit its metadata.</p>
	{/if}
</aside>

<style>
	.ml-inspector {
		padding: 1rem;
		background: var(--bg-soft);
		border-left: 1px solid var(--line);
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	@media (max-width: 900px) {
		.ml-inspector {
			border-left: 0;
			border-top: 1px solid var(--line);
		}
	}

	.ml-preview {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}

	.ml-preview-img {
		width: 100%;
		max-height: 180px;
		object-fit: contain;
		background: var(--bg);
		border-radius: 6px;
		border: 1px solid var(--line);
	}

	.ml-specs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		font-size: 0.78rem;
		color: var(--muted);
	}

	.ml-fields {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}

	.ml-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.35rem;
	}

	.ml-grow {
		flex: 1;
	}

	.ml-divider {
		border: 0;
		border-top: 1px solid var(--line);
		margin: 0.5rem 0;
	}

	.ml-empty-inspector {
		color: var(--muted);
		font-size: 0.88rem;
		text-align: center;
		padding: 2rem 1rem;
	}
</style>
