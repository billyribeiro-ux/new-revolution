<script lang="ts">
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import {
		formatMaxUploadMb,
		MEDIA_UPLOAD_MAX_BYTES,
		type MediaItem
	} from '#lib/shared/media-upload';
	import ConfirmDialog from './ConfirmDialog.svelte';

	export interface MediaInsertPayload {
		item: MediaItem;
		url: string;
		width: number | null;
		height: number | null;
		alt: string;
		caption: string;
		size: 'thumbnail' | 'medium' | 'large' | 'full';
		align: 'left' | 'center' | 'right' | 'full';
		linkUrl: string;
	}

	interface Props {
		mode?: 'modal' | 'page';
		isOpen?: boolean;
		initialItems?: MediaItem[];
		initialFolders?: string[];
		initialTotal?: number;
		onSelect?: (payload: MediaInsertPayload) => void;
		onClose?: () => void;
	}

	let {
		mode = 'page',
		isOpen = true,
		initialItems = [],
		initialFolders = [],
		initialTotal = 0,
		onSelect,
		onClose
	}: Props = $props();

	let activeTab = $state<'library' | 'upload'>('library');
	let viewMode = $state<'grid' | 'list'>('grid');
	let showTrash = $state(false);

	let items = $state.raw<MediaItem[]>([]);
	let folders = $state.raw<string[]>([]);
	let total = $state(0);
	let page = $state(1);
	let perPage = $state(24);
	let loading = $state(false);
	let errorMessage = $state('');
	let statusMessage = $state('');

	let searchQuery = $state('');
	let selectedFolder = $state<string | undefined>(undefined);
	let selectedMime = $state('');
	let selectedSort = $state<'newest' | 'oldest' | 'title' | 'size' | 'filename'>('newest');

	let newFolderName = $state('');
	let creatingFolder = $state(false);

	let selectedItem = $state<MediaItem | null>(null);
	let editTitle = $state('');
	let editAltText = $state('');
	let editCaption = $state('');
	let editDescription = $state('');
	let editFolder = $state('');
	let editFilename = $state('');
	let savingMeta = $state(false);

	let insertSize = $state<'thumbnail' | 'medium' | 'large' | 'full'>('full');
	let insertAlign = $state<'left' | 'center' | 'right' | 'full'>('center');
	let insertLinkUrl = $state('');

	let uploadFolder = $state('');
	let uploadAltText = $state('');
	let uploadQueue = $state<
		Array<{
			name: string;
			size: number;
			status: 'pending' | 'uploading' | 'done' | 'error';
			error?: string;
		}>
	>([]);
	let isDragging = $state(false);

	let confirmDeleteOpen = $state(false);
	let inUseConflictList = $state<Array<{ id: number; title: string; slug: string }>>([]);

	let initialized = $state(false);
	let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

	function syncEditorFields(item: MediaItem | null) {
		selectedItem = item;
		inUseConflictList = [];
		if (!item) {
			editTitle = '';
			editAltText = '';
			editCaption = '';
			editDescription = '';
			editFolder = '';
			editFilename = '';
			return;
		}
		editTitle = item.title ?? '';
		editAltText = item.alt_text ?? '';
		editCaption = item.caption ?? '';
		editDescription = item.description ?? '';
		editFolder = item.folder ?? '';
		editFilename = item.filename ?? '';
		insertSize = 'full';
		insertAlign = 'center';
		insertLinkUrl = '';
	}

	async function fetchLibrary(targetPage = page) {
		loading = true;
		errorMessage = '';
		try {
			const params = new SvelteURLSearchParams();
			if (showTrash) {
				params.set('trashed', 'true');
			} else {
				params.set('page', String(targetPage));
				params.set('per_page', String(perPage));
				if (searchQuery.trim()) params.set('search', searchQuery.trim());
				if (selectedFolder !== undefined) params.set('folder', selectedFolder);
				if (selectedMime) params.set('mime_type', selectedMime);
				params.set('sort', selectedSort);
			}

			const res = await fetch(`/api/media/list?${params.toString()}`);
			const data = await res.json();
			if (!res.ok) {
				errorMessage = data.error ?? 'Failed to load media items.';
				return;
			}
			items = data.items ?? [];
			total = data.total ?? 0;
			folders = data.folders ?? [];
			page = data.page ?? targetPage;

			if (selectedItem) {
				const refreshed = items.find((i) => i.id === selectedItem?.id) ?? null;
				syncEditorFields(refreshed);
			}
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Network error loading media.';
		} finally {
			loading = false;
		}
	}

	function ensureLoaded() {
		if (initialized) return;
		initialized = true;
		if (initialItems.length > 0 || initialTotal > 0) {
			items = initialItems;
			folders = initialFolders;
			total = initialTotal;
		} else {
			void fetchLibrary(1);
		}
	}

	function handleSearchInput(value: string) {
		searchQuery = value;
		if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
		searchDebounceTimer = setTimeout(() => {
			void fetchLibrary(1);
		}, 300);
	}

	async function handleCreateFolder() {
		const clean = newFolderName.trim();
		if (!clean) return;
		creatingFolder = true;
		errorMessage = '';
		try {
			const res = await fetch('/api/media/folders', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ name: clean })
			});
			const data = await res.json();
			if (!res.ok) {
				errorMessage = data.error ?? 'Could not create folder.';
				return;
			}
			newFolderName = '';
			statusMessage = `Folder "${data.folder}" created.`;
			await fetchLibrary(1);
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to create folder.';
		} finally {
			creatingFolder = false;
		}
	}

	async function handleFilesSelected(fileList: FileList | File[]) {
		const files = Array.from(fileList);
		if (files.length === 0) return;

		errorMessage = '';
		statusMessage = '';
		uploadQueue = files.map((f) => ({
			name: f.name,
			size: f.size,
			status: f.size > MEDIA_UPLOAD_MAX_BYTES ? 'error' : 'pending',
			error:
				f.size > MEDIA_UPLOAD_MAX_BYTES ? `File exceeds ${formatMaxUploadMb()} limit.` : undefined
		}));

		let uploadedCount = 0;
		let lastUploaded: MediaItem | null = null;

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (!file || uploadQueue[i]?.status === 'error') continue;

			uploadQueue[i].status = 'uploading';
			uploadQueue = [...uploadQueue];

			try {
				const fd = new FormData();
				fd.set('file', file);
				if (uploadFolder.trim()) fd.set('folder', uploadFolder.trim());
				if (uploadAltText.trim()) fd.set('alt_text', uploadAltText.trim());

				const res = await fetch('/api/media/upload', {
					method: 'POST',
					body: fd
				});
				const data = await res.json();
				if (!res.ok) {
					uploadQueue[i].status = 'error';
					uploadQueue[i].error = data.error ?? `Upload failed (${res.status})`;
				} else {
					uploadQueue[i].status = 'done';
					uploadedCount += 1;
					lastUploaded = data.item ?? data;
				}
			} catch (err) {
				uploadQueue[i].status = 'error';
				uploadQueue[i].error = err instanceof Error ? err.message : 'Upload failed.';
			}
			uploadQueue = [...uploadQueue];
		}

		if (uploadedCount > 0) {
			statusMessage = `Uploaded ${uploadedCount} file(s).`;
			activeTab = 'library';
			await fetchLibrary(1);
			if (lastUploaded) {
				syncEditorFields(lastUploaded);
			}
		}
	}

	async function handleSaveMetadata() {
		if (!selectedItem) return;
		savingMeta = true;
		errorMessage = '';
		statusMessage = '';
		try {
			const res = await fetch(`/api/media/${selectedItem.id}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					title: editTitle,
					alt_text: editAltText,
					caption: editCaption,
					description: editDescription,
					folder: editFolder,
					filename: editFilename
				})
			});
			const data = await res.json();
			if (!res.ok) {
				errorMessage = data.error ?? 'Failed to save metadata.';
				return;
			}
			const updated: MediaItem = data.item ?? data;
			items = items.map((i) => (i.id === updated.id ? updated : i));
			syncEditorFields(updated);
			statusMessage = 'Metadata saved.';
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to save metadata.';
		} finally {
			savingMeta = false;
		}
	}

	async function executeDeleteSelected() {
		confirmDeleteOpen = false;
		if (!selectedItem) return;
		errorMessage = '';
		statusMessage = '';
		inUseConflictList = [];
		try {
			const res = await fetch(`/api/media/${selectedItem.id}`, {
				method: 'DELETE'
			});
			if (res.status === 204) {
				statusMessage = `Deleted "${selectedItem.filename}".`;
				syncEditorFields(null);
				await fetchLibrary(page);
				return;
			}
			const data = await res.json().catch((err: unknown) => {
				console.warn('Failed to parse media delete response JSON:', err);
				return {} as {
					error?: string;
					details?: Array<{ id: number; title: string; slug: string }>;
				};
			});
			if (res.status === 409 && Array.isArray(data.details)) {
				inUseConflictList = data.details;
			}
			errorMessage = data.error ?? 'Could not delete media item.';
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to delete media item.';
		}
	}

	async function handleRestoreSelected() {
		if (!selectedItem) return;
		errorMessage = '';
		statusMessage = '';
		try {
			const res = await fetch(`/api/media/${selectedItem.id}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ action: 'restore' })
			});
			const data = await res.json();
			if (!res.ok) {
				errorMessage = data.error ?? 'Failed to restore item.';
				return;
			}
			statusMessage = `Restored "${selectedItem.filename}".`;
			syncEditorFields(null);
			await fetchLibrary(1);
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to restore item.';
		}
	}

	function handleInsertSelected() {
		if (!selectedItem || !onSelect) return;
		const chosenSize =
			selectedItem.available_sizes.find((s) => s.value === insertSize && s.available) ??
			selectedItem.available_sizes.find((s) => s.value === 'full');

		onSelect({
			item: selectedItem,
			url: chosenSize?.url ?? selectedItem.urls.original,
			width: chosenSize?.width ?? selectedItem.width,
			height: chosenSize?.height ?? selectedItem.height,
			alt: editAltText.trim() || selectedItem.alt_text || selectedItem.title,
			caption: editCaption.trim() || selectedItem.caption,
			size: insertSize,
			align: insertAlign,
			linkUrl: insertLinkUrl.trim()
		});
	}

	function formatBytes(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
	}

	function handleModalKeydown(e: KeyboardEvent) {
		if (mode !== 'modal') return;
		if (e.key === 'Escape' && !confirmDeleteOpen) {
			e.preventDefault();
			onClose?.();
			return;
		}
		if (e.key === 'Tab') {
			const container = e.currentTarget as HTMLElement | null;
			if (!container) return;
			const focusable = Array.from(
				container.querySelectorAll<HTMLElement>(
					'button:not([disabled]), [href], input:not([disabled]):not(.sr-only-input), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
				)
			);
			if (focusable.length === 0) return;
			const first = focusable[0]!;
			const last = focusable[focusable.length - 1]!;
			const active = document.activeElement as HTMLElement | null;
			if (e.shiftKey) {
				if (!active || active === first || !container.contains(active)) {
					e.preventDefault();
					last.focus();
				}
			} else if (!active || active === last || !container.contains(active)) {
				e.preventDefault();
				first.focus();
			}
		}
	}

	let totalPages = $derived(Math.max(1, Math.ceil(total / perPage)));
</script>

{#if mode === 'page' || isOpen}
	<div
		{@attach (node) => {
			ensureLoaded();
			if (mode === 'modal') {
				const firstFocusable = node.querySelector<HTMLElement>(
					'input[type="search"], button:not([disabled]), select:not([disabled])'
				);
				firstFocusable?.focus();
			}
		}}
		class={['media-library-root', { 'is-modal': mode === 'modal' }]}
		role={mode === 'modal' ? 'dialog' : undefined}
		aria-modal={mode === 'modal' ? 'true' : undefined}
		aria-label={mode === 'modal' ? 'Media Library Picker' : undefined}
		onkeydown={handleModalKeydown}
	>
		<div class="media-shell">
			<header class="media-header">
				<div class="media-header-left">
					<h2 class="media-title">Media Library</h2>
					<div class="media-tabs" role="tablist">
						<button
							type="button"
							role="tab"
							aria-selected={activeTab === 'library'}
							class={['tab-btn', { 'is-active': activeTab === 'library' }]}
							onclick={() => {
								activeTab = 'library';
							}}
						>
							Library ({total})
						</button>
						<button
							type="button"
							role="tab"
							aria-selected={activeTab === 'upload'}
							class={['tab-btn', { 'is-active': activeTab === 'upload' }]}
							onclick={() => {
								activeTab = 'upload';
							}}
						>
							Upload Files
						</button>
					</div>
				</div>

				<div class="media-header-right">
					<button
						type="button"
						class={['btn-chip', { 'is-active': showTrash }]}
						onclick={() => {
							showTrash = !showTrash;
							syncEditorFields(null);
							void fetchLibrary(1);
						}}
					>
						{showTrash ? 'Viewing Trash' : 'Trash'}
					</button>
					{#if mode === 'modal' && onClose}
						<button
							type="button"
							class="btn-close"
							onclick={onClose}
							aria-label="Close Media Library"
						>
							Close
						</button>
					{/if}
				</div>
			</header>

			{#if errorMessage}
				<div class="banner-error" role="alert">
					<span>{errorMessage}</span>
					{#if inUseConflictList.length > 0}
						<ul class="conflict-list">
							{#each inUseConflictList as usage (usage.id)}
								<li>Referenced in: <strong>{usage.title}</strong> (/{usage.slug})</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/if}

			{#if statusMessage}
				<div class="banner-status" role="status">{statusMessage}</div>
			{/if}

			{#if activeTab === 'upload'}
				<div class="upload-view">
					<div class="upload-meta-row">
						<label class="field-label">
							<span>Target Folder</span>
							<input
								type="text"
								class="text-input"
								placeholder="e.g. charts (leave blank for Root)"
								bind:value={uploadFolder}
							/>
						</label>
						<label class="field-label">
							<span>Default Alt Text (optional)</span>
							<input
								type="text"
								class="text-input"
								placeholder="Descriptive alt text for uploaded images"
								bind:value={uploadAltText}
							/>
						</label>
					</div>

					<label
						class={['dropzone', { 'is-dragging': isDragging }]}
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
							if (e.dataTransfer?.files) {
								void handleFilesSelected(e.dataTransfer.files);
							}
						}}
					>
						<input
							type="file"
							multiple
							accept="image/png,image/jpeg,image/gif,image/webp,image/avif,image/svg+xml"
							class="sr-only-input"
							onchange={(e) => {
								const input = e.currentTarget as HTMLInputElement;
								if (input.files) {
									void handleFilesSelected(input.files);
								}
							}}
						/>
						<span class="dropzone-headline">Drag and drop images here, or click to browse</span>
						<span class="dropzone-sub">
							Allowed: PNG, JPEG, GIF, WebP, AVIF, SVG. Max file size: {formatMaxUploadMb()}. Raster
							images auto-convert to WebP with 480w, 800w, and 1200w responsive variants.
						</span>
					</label>

					{#if uploadQueue.length > 0}
						<ul class="upload-queue">
							{#each uploadQueue as qItem (qItem.name)}
								<li class="upload-queue-item">
									<span>{qItem.name} ({formatBytes(qItem.size)})</span>
									<span class={['queue-badge', `status-${qItem.status}`]}>
										{qItem.error ? qItem.error : qItem.status}
									</span>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{:else}
				<div class="library-controls">
					<input
						type="search"
						class="text-input search-input"
						placeholder="Search filename, title, alt text, caption..."
						value={searchQuery}
						oninput={(e) => handleSearchInput((e.currentTarget as HTMLInputElement).value)}
					/>

					<select
						class="select-input"
						aria-label="Filter by folder"
						value={selectedFolder === undefined ? '__ALL__' : selectedFolder}
						onchange={(e) => {
							const val = (e.currentTarget as HTMLSelectElement).value;
							selectedFolder = val === '__ALL__' ? undefined : val;
							void fetchLibrary(1);
						}}
					>
						<option value="__ALL__">All Folders</option>
						<option value="">Root</option>
						{#each folders as f (f)}
							<option value={f}>{f}</option>
						{/each}
					</select>

					<select
						class="select-input"
						aria-label="Filter by MIME type"
						bind:value={selectedMime}
						onchange={() => void fetchLibrary(1)}
					>
						<option value="">All Formats</option>
						<option value="image/webp">WebP</option>
						<option value="image/png">PNG</option>
						<option value="image/jpeg">JPEG</option>
						<option value="image/gif">GIF</option>
						<option value="image/svg+xml">SVG</option>
					</select>

					<select
						class="select-input"
						aria-label="Sort media"
						bind:value={selectedSort}
						onchange={() => void fetchLibrary(1)}
					>
						<option value="newest">Newest First</option>
						<option value="oldest">Oldest First</option>
						<option value="title">Title (A-Z)</option>
						<option value="filename">Filename (A-Z)</option>
						<option value="size">Largest First</option>
					</select>

					<div class="view-toggle">
						<button
							type="button"
							class={['btn-chip', { 'is-active': viewMode === 'grid' }]}
							onclick={() => (viewMode = 'grid')}
						>
							Grid
						</button>
						<button
							type="button"
							class={['btn-chip', { 'is-active': viewMode === 'list' }]}
							onclick={() => (viewMode = 'list')}
						>
							List
						</button>
					</div>

					<div class="new-folder-box">
						<input
							type="text"
							class="text-input folder-input"
							placeholder="New folder..."
							bind:value={newFolderName}
						/>
						<button
							type="button"
							class="btn-chip"
							disabled={creatingFolder || !newFolderName.trim()}
							onclick={handleCreateFolder}
						>
							+ Folder
						</button>
					</div>
				</div>

				<div class="library-body">
					<div class="library-main">
						{#if loading}
							<p class="empty-state">Loading media assets...</p>
						{:else if items.length === 0}
							<p class="empty-state">
								No media items found. Switch to "Upload Files" to add images.
							</p>
						{:else if viewMode === 'grid'}
							<div class="media-grid">
								{#each items as item (item.id)}
									<button
										type="button"
										class={['media-card', { 'is-selected': selectedItem?.id === item.id }]}
										onclick={() => syncEditorFields(item)}
										ondblclick={() => {
											syncEditorFields(item);
											if (mode === 'modal' && onSelect) {
												handleInsertSelected();
											}
										}}
									>
										<div class="media-thumb-wrap">
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
										</div>
										<div class="media-card-meta">
											<span class="media-card-name">{item.filename}</span>
											<span class="media-card-sub">
												{item.width && item.height
													? `${item.width}x${item.height} · `
													: ''}{formatBytes(item.size_bytes)}
											</span>
										</div>
									</button>
								{/each}
							</div>
						{:else}
							<table class="media-table">
								<thead>
									<tr>
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
											class={{ 'is-selected': selectedItem?.id === item.id }}
											onclick={() => syncEditorFields(item)}
											ondblclick={() => {
												syncEditorFields(item);
												if (mode === 'modal' && onSelect) {
													handleInsertSelected();
												}
											}}
										>
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
											<td>{item.filename}</td>
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
							<div class="pagination-bar">
								<button
									type="button"
									class="btn-chip"
									disabled={page <= 1}
									onclick={() => void fetchLibrary(page - 1)}
								>
									Previous
								</button>
								<span class="page-info">Page {page} of {totalPages}</span>
								<button
									type="button"
									class="btn-chip"
									disabled={page >= totalPages}
									onclick={() => void fetchLibrary(page + 1)}
								>
									Next
								</button>
							</div>
						{/if}
					</div>

					<aside class="library-inspector">
						{#if selectedItem}
							<div class="inspector-preview">
								<img
									src={selectedItem.urls.medium}
									alt={selectedItem.alt_text || selectedItem.filename}
									class="inspector-img"
								/>
								<div class="inspector-specs">
									<span>{selectedItem.mime_type}</span>
									{#if selectedItem.width && selectedItem.height}
										<span>{selectedItem.width} x {selectedItem.height} px</span>
									{/if}
									<span>{formatBytes(selectedItem.size_bytes)}</span>
									<span>Used in {selectedItem.usage_count ?? 0} post(s)</span>
								</div>
								<button
									type="button"
									class="btn-chip"
									onclick={() => {
										if (selectedItem && navigator.clipboard) {
											void navigator.clipboard.writeText(selectedItem.urls.original);
											statusMessage = 'Copied original URL to clipboard.';
										}
									}}
								>
									Copy Original URL
								</button>
							</div>

							<div class="inspector-fields">
								<label class="field-label">
									<span>Alt Text {!editAltText.trim() ? '(Required for SEO)' : ''}</span>
									<input type="text" class="text-input" bind:value={editAltText} />
								</label>

								<label class="field-label">
									<span>Title</span>
									<input type="text" class="text-input" bind:value={editTitle} />
								</label>

								<label class="field-label">
									<span>Caption</span>
									<input type="text" class="text-input" bind:value={editCaption} />
								</label>

								<label class="field-label">
									<span>Description</span>
									<textarea class="textarea-input" rows="2" bind:value={editDescription}></textarea>
								</label>

								<label class="field-label">
									<span>Folder</span>
									<input
										type="text"
										class="text-input"
										placeholder="Root"
										bind:value={editFolder}
									/>
								</label>

								<label class="field-label">
									<span>Filename</span>
									<input type="text" class="text-input" bind:value={editFilename} />
								</label>

								<div class="inspector-actions">
									{#if showTrash}
										<button type="button" class="btn-primary" onclick={handleRestoreSelected}>
											Restore Item
										</button>
									{:else}
										<button
											type="button"
											class="btn-secondary"
											disabled={savingMeta}
											onclick={handleSaveMetadata}
										>
											{savingMeta ? 'Saving...' : 'Save Metadata'}
										</button>
										<button
											type="button"
											class="btn-danger"
											onclick={() => (confirmDeleteOpen = true)}
										>
											Delete
										</button>
									{/if}
								</div>

								{#if mode === 'modal' && onSelect && !showTrash}
									<hr class="inspector-divider" />
									<div class="insert-settings">
										<label class="field-label">
											<span>Insert Size</span>
											<select class="select-input" bind:value={insertSize}>
												{#each selectedItem.available_sizes as s (s.value)}
													<option value={s.value} disabled={!s.available}>
														{s.label}{!s.available ? ' (Not needed)' : ''}
													</option>
												{/each}
											</select>
										</label>

										<label class="field-label">
											<span>Alignment</span>
											<select class="select-input" bind:value={insertAlign}>
												<option value="center">Center</option>
												<option value="left">Float Left</option>
												<option value="right">Float Right</option>
												<option value="full">Full Width</option>
											</select>
										</label>

										<label class="field-label">
											<span>Link URL (optional)</span>
											<input
												type="url"
												class="text-input"
												placeholder="https://..."
												bind:value={insertLinkUrl}
											/>
										</label>

										<button
											type="button"
											class="btn-primary btn-insert"
											onclick={handleInsertSelected}
										>
											Insert Into Post
										</button>
									</div>
								{/if}
							</div>
						{:else}
							<p class="empty-inspector">Select an image to view or edit its metadata.</p>
						{/if}
					</aside>
				</div>
			{/if}
		</div>
	</div>
{/if}

<ConfirmDialog
	open={confirmDeleteOpen}
	title="Delete Media Asset"
	message={selectedItem
		? `Are you sure you want to delete "${selectedItem.filename}"? Active posts referencing this image will block deletion.`
		: 'Delete this item?'}
	confirmLabel="Delete Asset"
	variant="danger"
	onConfirm={executeDeleteSelected}
	onCancel={() => (confirmDeleteOpen = false)}
/>

<style>
	.media-library-root.is-modal {
		position: fixed;
		inset: 0;
		z-index: 1100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		background: rgba(11, 14, 18, 0.82);
		backdrop-filter: blur(5px);
	}

	.media-shell {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 1360px;
		max-height: 90vh;
		background: var(--panel);
		border: 1px solid var(--line-strong);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: var(--shadow-lg);
	}

	.media-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.9rem 1.25rem;
		background: var(--bg-soft);
		border-bottom: 1px solid var(--line);
	}

	.media-header-left,
	.media-header-right {
		display: flex;
		align-items: center;
		gap: 0.85rem;
	}

	.media-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.08rem;
		font-weight: 700;
		color: var(--text);
	}

	.media-tabs {
		display: flex;
		gap: 0.4rem;
	}

	.tab-btn,
	.btn-chip,
	.btn-close {
		padding: 0.42rem 0.85rem;
		border-radius: 6px;
		border: 1px solid var(--line);
		background: var(--panel2);
		color: var(--text-secondary);
		font-family: var(--font-sans);
		font-size: 0.83rem;
		font-weight: 600;
		cursor: pointer;
	}

	.tab-btn.is-active,
	.btn-chip.is-active {
		background: var(--acid);
		border-color: var(--acid);
		color: var(--ink);
	}

	.banner-error,
	.banner-status {
		padding: 0.65rem 1.25rem;
		font-size: 0.86rem;
		border-bottom: 1px solid var(--line);
	}

	.banner-error {
		background: rgba(255, 121, 105, 0.14);
		color: var(--coral);
	}

	.banner-status {
		background: rgba(220, 255, 101, 0.12);
		color: var(--acid);
	}

	.conflict-list {
		margin: 0.4rem 0 0;
		padding-left: 1.2rem;
	}

	.upload-view {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		overflow-y: auto;
	}

	.upload-meta-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1rem;
	}

	.dropzone {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 2.75rem 1.5rem;
		border: 2px dashed var(--line-strong);
		border-radius: 12px;
		background: var(--bg-soft);
		text-align: center;
		cursor: pointer;
	}

	.dropzone.is-dragging {
		border-color: var(--acid);
		background: rgba(220, 255, 101, 0.06);
	}

	.sr-only-input {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		pointer-events: none;
	}

	.dropzone-headline {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 700;
		color: var(--text);
	}

	.dropzone-sub {
		font-size: 0.85rem;
		color: var(--muted);
		max-width: 580px;
	}

	.upload-queue {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.upload-queue-item {
		display: flex;
		justify-content: space-between;
		padding: 0.55rem 0.85rem;
		background: var(--panel2);
		border-radius: 6px;
		font-size: 0.85rem;
	}

	.queue-badge.status-done {
		color: var(--acid);
	}

	.queue-badge.status-error {
		color: var(--coral);
	}

	.library-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem;
		padding: 0.75rem 1.25rem;
		background: var(--panel2);
		border-bottom: 1px solid var(--line);
	}

	.search-input {
		flex: 1 1 220px;
	}

	.text-input,
	.select-input,
	.textarea-input {
		padding: 0.45rem 0.7rem;
		border-radius: 6px;
		border: 1px solid var(--line-strong);
		background: var(--bg);
		color: var(--text);
		font-family: var(--font-sans);
		font-size: 0.86rem;
	}

	.new-folder-box,
	.view-toggle {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.folder-input {
		width: 135px;
	}

	.library-body {
		display: grid;
		grid-template-columns: 1fr 330px;
		min-height: 460px;
		max-height: calc(90vh - 130px);
		overflow: hidden;
	}

	.library-main {
		padding: 1rem 1.25rem;
		overflow-y: auto;
	}

	.media-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 0.85rem;
	}

	.media-card {
		display: flex;
		flex-direction: column;
		padding: 0;
		background: var(--panel2);
		border: 2px solid var(--line);
		border-radius: 8px;
		overflow: hidden;
		cursor: pointer;
		text-align: left;
	}

	.media-card.is-selected {
		border-color: var(--acid);
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
		font-size: 0.7rem;
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
		font-size: 0.72rem;
		color: var(--muted);
	}

	.media-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.84rem;
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

	.table-thumb {
		width: 48px;
		height: 36px;
		object-fit: cover;
		border-radius: 4px;
	}

	.pagination-bar {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		margin-top: 1.25rem;
	}

	.page-info {
		font-size: 0.84rem;
		color: var(--muted);
	}

	.library-inspector {
		padding: 1rem;
		background: var(--bg-soft);
		border-left: 1px solid var(--line);
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.inspector-preview {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}

	.inspector-img {
		width: 100%;
		max-height: 180px;
		object-fit: contain;
		background: var(--bg);
		border-radius: 6px;
		border: 1px solid var(--line);
	}

	.inspector-specs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		font-size: 0.76rem;
		color: var(--muted);
	}

	.inspector-fields,
	.insert-settings {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}

	.field-label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.inspector-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.35rem;
	}

	.btn-primary,
	.btn-secondary,
	.btn-danger {
		padding: 0.5rem 0.85rem;
		border-radius: 6px;
		font-family: var(--font-sans);
		font-size: 0.84rem;
		font-weight: 700;
		cursor: pointer;
		border: 1px solid transparent;
	}

	.btn-primary {
		background: var(--acid);
		color: var(--ink);
	}

	.btn-secondary {
		background: var(--panel2);
		border-color: var(--line-strong);
		color: var(--text);
		flex: 1;
	}

	.btn-danger {
		background: rgba(255, 121, 105, 0.16);
		border-color: var(--coral);
		color: var(--coral);
	}

	.btn-insert {
		width: 100%;
		margin-top: 0.35rem;
	}

	.inspector-divider {
		border: 0;
		border-top: 1px solid var(--line);
		margin: 0.5rem 0;
	}

	.empty-state,
	.empty-inspector {
		color: var(--muted);
		font-size: 0.88rem;
		text-align: center;
		padding: 2rem 1rem;
	}

	@media (max-width: 900px) {
		.library-body {
			grid-template-columns: 1fr;
		}
		.library-inspector {
			border-left: 0;
			border-top: 1px solid var(--line);
		}
	}
</style>
