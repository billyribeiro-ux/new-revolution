<script lang="ts">
	type SortValue = 'newest' | 'oldest' | 'title' | 'size' | 'filename';

	interface Props {
		searchQuery: string;
		/** `undefined` means "All Folders"; `''` means Root. */
		selectedFolder: string | undefined;
		selectedMime: string;
		selectedSort: SortValue;
		viewMode: 'grid' | 'list';
		folders: string[];
		newFolderName: string;
		creatingFolder: boolean;
		onSearch: (value: string) => void;
		onFolder: (folder: string | undefined) => void;
		onMime: (mime: string) => void;
		onSort: (sort: SortValue) => void;
		onView: (view: 'grid' | 'list') => void;
		onNewFolderName: (value: string) => void;
		onCreateFolder: () => void;
	}

	let {
		searchQuery,
		selectedFolder,
		selectedMime,
		selectedSort,
		viewMode,
		folders,
		newFolderName,
		creatingFolder,
		onSearch,
		onFolder,
		onMime,
		onSort,
		onView,
		onNewFolderName,
		onCreateFolder
	}: Props = $props();
</script>

<div class="ml-toolbar">
	<input
		type="search"
		class="ml-input ml-search"
		placeholder="Search filename, title, alt text, caption..."
		aria-label="Search media"
		value={searchQuery}
		oninput={(e) => onSearch(e.currentTarget.value)}
	/>

	<select
		class="ml-input"
		aria-label="Filter by folder"
		value={selectedFolder === undefined ? '__ALL__' : selectedFolder}
		onchange={(e) => {
			const val = e.currentTarget.value;
			onFolder(val === '__ALL__' ? undefined : val);
		}}
	>
		<option value="__ALL__">All Folders</option>
		<option value="">Root</option>
		{#each folders as f (f)}
			<option value={f}>{f}</option>
		{/each}
	</select>

	<select
		class="ml-input"
		aria-label="Filter by MIME type"
		value={selectedMime}
		onchange={(e) => onMime(e.currentTarget.value)}
	>
		<option value="">All Formats</option>
		<option value="image/webp">WebP</option>
		<option value="image/png">PNG</option>
		<option value="image/jpeg">JPEG</option>
		<option value="image/gif">GIF</option>
		<option value="image/svg+xml">SVG</option>
	</select>

	<select
		class="ml-input"
		aria-label="Sort media"
		value={selectedSort}
		onchange={(e) => onSort(e.currentTarget.value as SortValue)}
	>
		<option value="newest">Newest First</option>
		<option value="oldest">Oldest First</option>
		<option value="title">Title (A-Z)</option>
		<option value="filename">Filename (A-Z)</option>
		<option value="size">Largest First</option>
	</select>

	<div class="ml-inline" role="group" aria-label="View mode">
		<button
			type="button"
			class={['ml-btn', { 'is-active': viewMode === 'grid' }]}
			aria-pressed={viewMode === 'grid'}
			onclick={() => onView('grid')}
		>
			Grid
		</button>
		<button
			type="button"
			class={['ml-btn', { 'is-active': viewMode === 'list' }]}
			aria-pressed={viewMode === 'list'}
			onclick={() => onView('list')}
		>
			List
		</button>
	</div>

	<div class="ml-inline">
		<input
			type="text"
			class="ml-input ml-folder-input"
			placeholder="New folder..."
			aria-label="New folder name"
			value={newFolderName}
			oninput={(e) => onNewFolderName(e.currentTarget.value)}
		/>
		<button
			type="button"
			class="ml-btn"
			disabled={creatingFolder || !newFolderName.trim()}
			onclick={onCreateFolder}
		>
			+ Folder
		</button>
	</div>
</div>

<style>
	.ml-toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem;
		padding: 0.75rem 1.25rem;
		background: var(--panel2);
		border-bottom: 1px solid var(--line);
	}

	.ml-search {
		flex: 1 1 220px;
	}

	.ml-inline {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.ml-folder-input {
		width: 135px;
	}
</style>
