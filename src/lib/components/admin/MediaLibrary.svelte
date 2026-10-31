<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { SvelteMap, SvelteURLSearchParams } from 'svelte/reactivity';
	import {
		formatMaxUploadMb,
		MEDIA_UPLOAD_MAX_BYTES,
		type MediaItem
	} from '#lib/shared/media-upload';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import MediaBulkBar from './MediaBulkBar.svelte';
	import MediaGrid from './MediaGrid.svelte';
	import MediaModalHeader from './MediaModalHeader.svelte';
	import MediaSidebar, { type InsertAlign, type InsertSize } from './MediaSidebar.svelte';
	import MediaToolbar from './MediaToolbar.svelte';
	import MediaUploadPanel from './MediaUploadPanel.svelte';
	import MediaUploadQueue, { type QueueEntry } from './MediaUploadQueue.svelte';
	import {
		deleteMediaRequest,
		MEDIA_BULK_CONCURRENCY,
		MediaRequestError,
		moveMediaRequest,
		runBounded,
		uploadWithProgress,
		type BulkResult,
		type MediaUsageRef
	} from './media-client';
	import './media-library.css';

	/** Payload shape and value names are a contract: docs/MEDIA_UI_CONTRACT.md. */
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

	interface FailureRow {
		id: string;
		name: string;
		message: string;
		usage: MediaUsageRef[];
	}

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
	let failureRows = $state.raw<FailureRow[]>([]);

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

	let insertSize = $state<InsertSize>('full');
	let insertAlign = $state<InsertAlign>('center');
	let insertLinkUrl = $state('');

	/** Bulk selection: id -> filename (any page). Failed items stay ticked so they can be retried. */
	const checked = new SvelteMap<string, string>();
	let lastCheckedId: string | null = null;
	let bulkBusy = $state(false);

	let uploadFolder = $state('');
	let uploadAltText = $state('');
	let uploadQueue = $state<QueueEntry[]>([]);
	let uploading = $state(false);
	const pendingFiles = new SvelteMap<string, File>();
	let queueSeq = 0;

	let confirmKind = $state<'single' | 'bulk' | null>(null);
	let confirmOpener: HTMLElement | null = null;
	let rootEl: HTMLElement | undefined;
	let inUseConflictList = $state.raw<MediaUsageRef[]>([]);

	let initialized = $state(false);
	let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
	let loadGeneration = 0;

	let totalPages = $derived(Math.max(1, Math.ceil(total / perPage)));
	let canInsert = $derived(mode === 'modal' && !!onSelect);

	function clearMessages() {
		errorMessage = '';
		statusMessage = '';
		failureRows = [];
		inUseConflictList = [];
	}

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
		const generation = ++loadGeneration;
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
			// A newer request (search typing, filter change) superseded this one: drop the stale response.
			if (generation !== loadGeneration) return;
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
			if (generation !== loadGeneration) return;
			errorMessage = err instanceof Error ? err.message : 'Network error loading media.';
		} finally {
			if (generation === loadGeneration) loading = false;
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
		clearMessages();
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
			await fetchLibrary(1);
			statusMessage = `Folder "${data.folder}" created.`;
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to create folder.';
		} finally {
			creatingFolder = false;
		}
	}

	/* ---------------------------------------------------------------- upload queue */

	/** Adds files to the queue and starts the (single, sequential) worker if it is idle. */
	function enqueueFiles(fileList: FileList | File[]) {
		const files = Array.from(fileList);
		if (files.length === 0) return;
		clearMessages();
		showTrash = false;

		const fresh: QueueEntry[] = files.map((f) => {
			const tooLarge = f.size > MEDIA_UPLOAD_MAX_BYTES;
			const entry: QueueEntry = {
				id: `upload-${++queueSeq}`,
				name: f.name,
				size: f.size,
				status: tooLarge ? 'error' : 'pending',
				progress: 0,
				error: tooLarge ? `File exceeds ${formatMaxUploadMb()} limit.` : undefined
			};
			if (!tooLarge) pendingFiles.set(entry.id, f);
			return entry;
		});
		// A finished batch is replaced; a running one is appended to.
		uploadQueue = uploading ? [...uploadQueue, ...fresh] : fresh;
		const rejected = fresh.filter((e) => e.status === 'error').length;
		if (rejected > 0) {
			errorMessage = `${rejected} file(s) skipped: larger than ${formatMaxUploadMb()}.`;
		}
		if (!uploading) void processQueue();
	}

	function targetUploadFolder(): string {
		return uploadFolder.trim() || selectedFolder || '';
	}

	async function processQueue() {
		if (uploading) return;
		uploading = true;
		let uploaded = 0;
		let failed = 0;
		let lastUploaded: MediaItem | null = null;
		try {
			for (;;) {
				const entry = uploadQueue.find((e) => e.status === 'pending');
				if (!entry) break;
				const file = pendingFiles.get(entry.id);
				pendingFiles.delete(entry.id);
				if (!file) {
					entry.status = 'error';
					entry.error = 'The selected file is no longer available.';
					failed += 1;
					continue;
				}
				entry.status = 'uploading';
				entry.progress = 0;
				try {
					lastUploaded = await uploadWithProgress(
						file,
						{ folder: targetUploadFolder(), alt_text: uploadAltText },
						(percent) => {
							entry.progress = percent;
						}
					);
					entry.status = 'done';
					entry.progress = 100;
					uploaded += 1;
				} catch (err) {
					entry.status = 'error';
					entry.error = err instanceof Error ? err.message : 'Upload failed.';
					failed += 1;
				}
			}
		} finally {
			uploading = false;
		}

		if (uploaded > 0) {
			activeTab = 'library';
			await fetchLibrary(1);
			if (lastUploaded)
				syncEditorFields(items.find((i) => i.id === lastUploaded!.id) ?? lastUploaded);
			statusMessage = `Uploaded ${uploaded} file(s).`;
		}
		if (failed > 0) {
			errorMessage = `${failed} file(s) failed to upload. See the upload list for each reason.`;
		}
	}

	function clearQueue() {
		if (uploading) return;
		uploadQueue = [];
	}

	/* ---------------------------------------------------------------- single item actions */

	async function handleSaveMetadata() {
		if (!selectedItem) return;
		savingMeta = true;
		clearMessages();
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
		closeConfirm();
		if (!selectedItem) return;
		const target = selectedItem;
		clearMessages();
		try {
			await deleteMediaRequest(target.id);
			checked.delete(target.id);
			syncEditorFields(null);
			await fetchLibrary(page);
			statusMessage = `Deleted "${target.filename}".`;
		} catch (err) {
			if (err instanceof MediaRequestError && err.status === 409) inUseConflictList = err.usage;
			errorMessage = err instanceof Error ? err.message : 'Failed to delete media item.';
		}
	}

	async function handleCopyUrl() {
		if (!selectedItem) return;
		if (!navigator.clipboard) {
			errorMessage = 'Clipboard access is not available in this browser context.';
			return;
		}
		try {
			await navigator.clipboard.writeText(selectedItem.urls.original);
			statusMessage = 'Copied original URL to clipboard.';
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Could not copy the URL.';
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

	function openItem(item: MediaItem) {
		syncEditorFields(item);
		if (canInsert) handleInsertSelected();
	}

	/* ---------------------------------------------------------------- bulk selection and actions */

	function handleCheck(item: MediaItem, isChecked: boolean, shiftKey: boolean) {
		if (shiftKey && lastCheckedId) {
			const from = items.findIndex((i) => i.id === lastCheckedId);
			const to = items.findIndex((i) => i.id === item.id);
			if (from >= 0 && to >= 0) {
				const [lo, hi] = from < to ? [from, to] : [to, from];
				for (const it of items.slice(lo, hi + 1)) {
					if (isChecked) checked.set(it.id, it.filename);
					else checked.delete(it.id);
				}
				lastCheckedId = item.id;
				return;
			}
		}
		if (isChecked) checked.set(item.id, item.filename);
		else checked.delete(item.id);
		lastCheckedId = item.id;
	}

	function checkPage(isChecked: boolean) {
		for (const it of items) {
			if (isChecked) checked.set(it.id, it.filename);
			else checked.delete(it.id);
		}
	}

	function clearChecked() {
		checked.clear();
		lastCheckedId = null;
	}

	function failuresFrom(results: BulkResult<{ id: string; name: string }>[]): FailureRow[] {
		const rows: FailureRow[] = [];
		for (const r of results) {
			if (r.ok) continue;
			rows.push({
				id: r.item.id,
				name: r.item.name,
				message: r.error.message || 'Unknown error',
				usage: r.error instanceof MediaRequestError ? r.error.usage : []
			});
		}
		return rows;
	}

	async function refreshAfterBulk() {
		await fetchLibrary(page);
		if (items.length === 0 && page > 1) await fetchLibrary(page - 1);
	}

	async function runBulkDelete() {
		closeConfirm();
		if (checked.size === 0 || bulkBusy) return;
		const targets = Array.from(checked, ([id, name]) => ({ id, name }));
		bulkBusy = true;
		clearMessages();
		try {
			const results = await runBounded(targets, MEDIA_BULK_CONCURRENCY, (t) =>
				deleteMediaRequest(t.id)
			);
			let deleted = 0;
			for (const r of results) {
				if (r.ok) {
					deleted += 1;
					checked.delete(r.item.id);
					if (selectedItem?.id === r.item.id) syncEditorFields(null);
				}
			}
			const failures = failuresFrom(results);
			await refreshAfterBulk();
			if (deleted > 0) statusMessage = `Deleted ${deleted} item(s).`;
			if (failures.length > 0) {
				failureRows = failures;
				errorMessage = `${failures.length} of ${targets.length} item(s) could not be deleted. They stay selected.`;
			}
		} finally {
			bulkBusy = false;
		}
	}

	async function runBulkMove(folder: string) {
		if (checked.size === 0 || bulkBusy) return;
		const targets = Array.from(checked, ([id, name]) => ({ id, name }));
		bulkBusy = true;
		clearMessages();
		try {
			const results = await runBounded(targets, MEDIA_BULK_CONCURRENCY, (t) =>
				moveMediaRequest(t.id, folder)
			);
			let moved = 0;
			for (const r of results) {
				if (r.ok) {
					moved += 1;
					checked.delete(r.item.id);
				}
			}
			const failures = failuresFrom(results);
			await refreshAfterBulk();
			if (moved > 0) statusMessage = `Moved ${moved} item(s) to ${folder || 'Root'}.`;
			if (failures.length > 0) {
				failureRows = failures;
				errorMessage = `${failures.length} of ${targets.length} item(s) could not be moved. They stay selected.`;
			}
		} finally {
			bulkBusy = false;
		}
	}

	/* ---------------------------------------------------------------- confirm dialog */

	function openConfirm(kind: 'single' | 'bulk') {
		confirmOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		confirmKind = kind;
	}

	/** Closes the confirm dialog and puts focus back where it was (or on the picker if that is gone). */
	function closeConfirm() {
		const opener = confirmOpener;
		confirmOpener = null;
		confirmKind = null;
		void tick().then(() => {
			if (opener?.isConnected) opener.focus();
			else rootEl?.focus();
		});
	}

	let confirmTitle = $derived(
		confirmKind === 'bulk'
			? `Delete ${checked.size} item${checked.size === 1 ? '' : 's'}?`
			: 'Delete Media Asset'
	);
	let confirmMessage = $derived.by(() => {
		if (confirmKind === 'bulk') {
			const names = Array.from(checked.values());
			const shown = names.slice(0, 5).join(', ');
			const more = names.length > 5 ? ` and ${names.length - 5} more` : '';
			return `Delete ${shown}${more}? Files referenced by posts are refused and listed afterwards.`;
		}
		return selectedItem
			? `Are you sure you want to delete "${selectedItem.filename}"? Active posts referencing this image will block deletion.`
			: 'Delete this item?';
	});

	/* ---------------------------------------------------------------- modal behaviour */

	const FOCUSABLE = 'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]';

	function focusableWithin(container: HTMLElement): HTMLElement[] {
		return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
			(el) =>
				!el.hasAttribute('disabled') &&
				el.getAttribute('tabindex') !== '-1' &&
				el.offsetParent !== null
		);
	}

	/**
	 * Root attachment: loads data once, and in modal mode traps Tab, closes on Escape, keeps keystrokes
	 * from reaching editor shortcuts underneath, and restores focus to the opener on teardown.
	 */
	function pickerRoot(node: HTMLElement) {
		rootEl = node;
		untrack(ensureLoaded);
		if (mode !== 'modal') return () => (rootEl = undefined);

		const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const firstFocus =
			node.querySelector<HTMLElement>('input[type="search"]') ??
			node.querySelector<HTMLElement>('button:not([disabled])');
		firstFocus?.focus();

		function onKeydown(e: KeyboardEvent) {
			e.stopPropagation();
			if (e.key === 'Escape') {
				e.preventDefault();
				if (confirmKind) return;
				if (checked.size > 0) {
					clearChecked();
					return;
				}
				onClose?.();
				return;
			}
			if (e.key !== 'Tab') return;
			const focusable = focusableWithin(node);
			if (focusable.length === 0) return;
			const first = focusable[0]!;
			const last = focusable[focusable.length - 1]!;
			const active = document.activeElement as HTMLElement | null;
			if (e.shiftKey) {
				if (!active || active === first || !node.contains(active)) {
					e.preventDefault();
					last.focus();
				}
			} else if (!active || active === last || !node.contains(active)) {
				e.preventDefault();
				first.focus();
			}
		}
		node.addEventListener('keydown', onKeydown);

		return () => {
			node.removeEventListener('keydown', onKeydown);
			rootEl = undefined;
			if (opener && opener !== document.body && opener.isConnected) opener.focus();
		};
	}
</script>

{#if mode === 'page' || isOpen}
	<div
		{@attach pickerRoot}
		class={['media-library-root', { 'is-modal': mode === 'modal' }]}
		role={mode === 'modal' ? 'dialog' : undefined}
		aria-modal={mode === 'modal' ? 'true' : undefined}
		aria-label={mode === 'modal' ? 'Media Library Picker' : undefined}
		tabindex="-1"
	>
		<div class="media-shell">
			<MediaModalHeader
				{total}
				{activeTab}
				{showTrash}
				canClose={mode === 'modal' && !!onClose}
				onTab={(tab) => (activeTab = tab)}
				onToggleTrash={() => {
					showTrash = !showTrash;
					clearChecked();
					syncEditorFields(null);
					void fetchLibrary(1);
				}}
				onClose={() => onClose?.()}
			/>

			<div role="alert">
				{#if errorMessage}
					<div class="ml-banner is-error">
						<span>{errorMessage}</span>
						{#if inUseConflictList.length > 0}
							<ul>
								{#each inUseConflictList as usage (usage.id)}
									<li>Referenced in: <strong>{usage.title}</strong> (/{usage.slug})</li>
								{/each}
							</ul>
						{/if}
						{#if failureRows.length > 0}
							<ul>
								{#each failureRows as row (row.id)}
									<li>
										<strong>{row.name}</strong>: {row.message}
										{#if row.usage.length > 0}
											<ul>
												{#each row.usage as usage (usage.id)}
													<li>Referenced in: <strong>{usage.title}</strong> (/{usage.slug})</li>
												{/each}
											</ul>
										{/if}
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				{/if}
			</div>

			<div role="status">
				{#if statusMessage}
					<div class="ml-banner is-status">{statusMessage}</div>
				{/if}
			</div>

			{#if activeTab === 'upload'}
				<MediaUploadPanel
					bind:folder={uploadFolder}
					bind:altText={uploadAltText}
					entries={uploadQueue}
					busy={uploading}
					onFiles={enqueueFiles}
					onClearQueue={clearQueue}
				/>
			{:else}
				<MediaToolbar
					{searchQuery}
					{selectedFolder}
					{selectedMime}
					{selectedSort}
					{viewMode}
					{folders}
					{newFolderName}
					{creatingFolder}
					onSearch={handleSearchInput}
					onFolder={(f) => {
						selectedFolder = f;
						void fetchLibrary(1);
					}}
					onMime={(m) => {
						selectedMime = m;
						void fetchLibrary(1);
					}}
					onSort={(s) => {
						selectedSort = s;
						void fetchLibrary(1);
					}}
					onView={(v) => (viewMode = v)}
					onNewFolderName={(v) => (newFolderName = v)}
					onCreateFolder={handleCreateFolder}
				/>

				{#if checked.size > 0 && !showTrash}
					<MediaBulkBar
						selectedCount={checked.size}
						pageCount={items.length}
						{folders}
						busy={bulkBusy}
						onSelectPage={() => checkPage(true)}
						onClear={clearChecked}
						onMove={(folder) => void runBulkMove(folder)}
						onDelete={() => openConfirm('bulk')}
					/>
				{/if}

				{#if uploadQueue.length > 0}
					<div class="ml-queue-strip">
						<MediaUploadQueue entries={uploadQueue} busy={uploading} onClear={clearQueue} />
					</div>
				{/if}

				<div class="library-body">
					<MediaGrid
						{items}
						{viewMode}
						{loading}
						{showTrash}
						inspectedId={selectedItem?.id ?? null}
						{checked}
						{page}
						{totalPages}
						onInspect={syncEditorFields}
						onOpen={openItem}
						onCheck={handleCheck}
						onCheckPage={checkPage}
						onPage={(p) => void fetchLibrary(p)}
						onFiles={enqueueFiles}
					/>

					<MediaSidebar
						item={selectedItem}
						{showTrash}
						{canInsert}
						{savingMeta}
						bind:editTitle
						bind:editAltText
						bind:editCaption
						bind:editDescription
						bind:editFolder
						bind:editFilename
						bind:insertSize
						bind:insertAlign
						bind:insertLinkUrl
						onSave={handleSaveMetadata}
						onDelete={() => openConfirm('single')}
						onInsert={handleInsertSelected}
						onCopyUrl={handleCopyUrl}
					/>
				</div>
			{/if}
		</div>
	</div>
{/if}

<ConfirmDialog
	open={confirmKind !== null}
	title={confirmTitle}
	message={confirmMessage}
	confirmLabel={confirmKind === 'bulk' ? 'Delete Selected' : 'Delete Asset'}
	variant="danger"
	onConfirm={() => (confirmKind === 'bulk' ? void runBulkDelete() : void executeDeleteSelected())}
	onCancel={closeConfirm}
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

	.media-library-root:focus {
		outline: none;
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

	.ml-queue-strip {
		flex-shrink: 0;
		padding: 0.75rem 1.25rem;
		border-bottom: 1px solid var(--line);
		background: var(--bg-soft);
		max-height: min(15rem, 30vh);
		overflow-y: auto;
	}

	.library-body {
		display: grid;
		grid-template-columns: 1fr 330px;
		min-height: 460px;
		max-height: calc(90vh - 130px);
		overflow: hidden;
	}

	@media (max-width: 900px) {
		.library-body {
			grid-template-columns: 1fr;
			overflow: visible;
			max-height: none;
			min-height: 0;
			flex-shrink: 0;
		}
	}

	@media (max-width: 900px) {
		.media-library-root.is-modal {
			padding: 0.5rem;
		}

		.media-shell {
			max-height: 96vh;
			overflow-y: auto;
		}
	}
</style>
