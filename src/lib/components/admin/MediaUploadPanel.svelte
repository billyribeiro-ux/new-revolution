<script lang="ts">
	import { formatMaxUploadMb } from '#lib/shared/media-upload';
	import MediaUploadQueue, { type QueueEntry } from './MediaUploadQueue.svelte';

	interface Props {
		folder: string;
		altText: string;
		entries: QueueEntry[];
		busy: boolean;
		onFiles: (files: File[]) => void;
		onClearQueue: () => void;
	}

	let {
		folder = $bindable(),
		altText = $bindable(),
		entries,
		busy,
		onFiles,
		onClearQueue
	}: Props = $props();

	let isDragging = $state(false);
	let fileInput: HTMLInputElement | undefined = $state();
	const ACCEPT = 'image/png,image/jpeg,image/gif,image/webp,image/avif,image/svg+xml';

	function pick(list: FileList | null) {
		if (list && list.length > 0) onFiles(Array.from(list));
	}
</script>

<div class="ml-upload">
	<div class="ml-upload-meta">
		<label class="ml-field">
			<span>Target Folder</span>
			<input
				type="text"
				class="ml-input"
				placeholder="e.g. charts (leave blank for Root)"
				bind:value={folder}
			/>
		</label>
		<label class="ml-field">
			<span>Default Alt Text (optional)</span>
			<input
				type="text"
				class="ml-input"
				placeholder="Descriptive alt text for uploaded images"
				bind:value={altText}
			/>
		</label>
	</div>

	<!-- The drop target is a plain region; the file button below is the keyboard path. -->
	<div
		role="presentation"
		class={['ml-dropzone', { 'is-dragging': isDragging }]}
		ondragover={(e) => {
			e.preventDefault();
			isDragging = true;
		}}
		ondragleave={() => {
			isDragging = false;
		}}
		ondrop={(e) => {
			e.preventDefault();
			isDragging = false;
			pick(e.dataTransfer?.files ?? null);
		}}
	>
		<input
			bind:this={fileInput}
			id="ml-upload-input"
			type="file"
			multiple
			accept={ACCEPT}
			class="ml-sr-only"
			tabindex="-1"
			aria-label="Choose image files to upload"
			onchange={(e) => {
				pick(e.currentTarget.files);
				e.currentTarget.value = '';
			}}
		/>
		<span class="ml-dropzone-headline">Drag and drop images here</span>
		<button type="button" class="ml-btn is-primary" onclick={() => fileInput?.click()}>
			Choose files
		</button>
		<span class="ml-dropzone-sub">
			Allowed: PNG, JPEG, GIF, WebP, AVIF, SVG. Max file size: {formatMaxUploadMb()}. Raster images
			auto-convert to WebP with 480w, 800w, and 1200w responsive variants.
		</span>
	</div>

	<MediaUploadQueue {entries} {busy} onClear={onClearQueue} />
</div>

<style>
	.ml-upload {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		overflow-y: auto;
	}

	.ml-upload-meta {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1rem;
	}

	.ml-dropzone {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 2.5rem 1.5rem;
		border: 2px dashed var(--line-strong);
		border-radius: 12px;
		background: var(--bg-soft);
		text-align: center;
	}

	.ml-dropzone.is-dragging {
		border-color: var(--acid);
		background: rgba(220, 255, 101, 0.06);
	}

	.ml-dropzone-headline {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
		color: var(--text);
	}

	.ml-dropzone-sub {
		font-size: 0.85rem;
		color: var(--muted);
		max-width: 580px;
	}
</style>
