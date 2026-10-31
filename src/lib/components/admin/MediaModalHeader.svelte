<script lang="ts">
	interface Props {
		total: number;
		activeTab: 'library' | 'upload';
		showTrash: boolean;
		/** Renders the Close button when the picker is a modal that has an `onClose` handler. */
		canClose: boolean;
		onTab: (tab: 'library' | 'upload') => void;
		onToggleTrash: () => void;
		onClose: () => void;
	}

	let { total, activeTab, showTrash, canClose, onTab, onToggleTrash, onClose }: Props = $props();
</script>

<header class="ml-header">
	<div class="ml-header-group">
		<h2 class="ml-title">Media Library</h2>
		<div class="ml-tabs" role="tablist" aria-label="Media sections">
			<button
				type="button"
				role="tab"
				aria-selected={activeTab === 'library'}
				class={['ml-btn', { 'is-active': activeTab === 'library' }]}
				onclick={() => onTab('library')}
			>
				Library ({total})
			</button>
			<button
				type="button"
				role="tab"
				aria-selected={activeTab === 'upload'}
				class={['ml-btn', { 'is-active': activeTab === 'upload' }]}
				onclick={() => onTab('upload')}
			>
				Upload Files
			</button>
		</div>
	</div>

	<div class="ml-header-group">
		<button
			type="button"
			class={['ml-btn', { 'is-active': showTrash }]}
			aria-pressed={showTrash}
			onclick={onToggleTrash}
		>
			{showTrash ? 'Viewing Trash' : 'Trash'}
		</button>
		{#if canClose}
			<button type="button" class="ml-btn" onclick={onClose} aria-label="Close Media Library">
				Close
			</button>
		{/if}
	</div>
</header>

<style>
	.ml-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1rem;
		padding: 0.9rem 1.25rem;
		background: var(--bg-soft);
		border-bottom: 1px solid var(--line);
	}

	.ml-header-group {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.85rem;
	}

	.ml-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.08rem;
		font-weight: 700;
		color: var(--text);
	}

	.ml-tabs {
		display: flex;
		gap: 0.4rem;
	}
</style>
