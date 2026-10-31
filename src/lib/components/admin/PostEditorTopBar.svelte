<script lang="ts">
	import type { PostStatus } from '#lib/shared/schemas/posts';

	interface Props {
		postId: number | null;
		slug: string;
		status: PostStatus;
		words: number;
		chars: number;
		readingTime: number;
		seoScore: number;
		blockingCount: number;
		autosaveStatus: 'idle' | 'saving' | 'saved' | 'error';
		lastSavedAt?: string;
		isDirty: boolean;
		isSaving: boolean;
		isFocusMode: boolean;
		previewToken?: string;
		onBack: () => void;
		onToggleFocusMode: () => void;
		onSaveAndStay?: () => void;
		onSaveDraft: () => void;
		onPrimarySubmit: () => void;
		onRetryAutosave?: () => void;
	}

	let {
		postId,
		slug,
		status,
		words,
		chars,
		readingTime,
		seoScore,
		blockingCount,
		autosaveStatus,
		lastSavedAt = '',
		isDirty,
		isSaving,
		isFocusMode,
		previewToken = '',
		onBack,
		onToggleFocusMode,
		onSaveAndStay,
		onSaveDraft,
		onPrimarySubmit,
		onRetryAutosave
	}: Props = $props();

	let previewHref = $derived(
		postId && slug
			? `/blog/${slug}${previewToken ? `?preview=${encodeURIComponent(previewToken)}` : ''}`
			: ''
	);

	let primaryButtonLabel = $derived.by(() => {
		if (isSaving) return 'Saving...';
		// The primary button publishes whenever the status is not "scheduled" (see handlePrimarySubmitRequest),
		// so it must not say "Update" for a draft: that label hid the fact that the click makes the post live.
		if (status === 'scheduled') return 'Schedule';
		if (status === 'published' && postId) return 'Update and close';
		return 'Publish';
	});
</script>

<header class="editor-topbar">
	<div class="topbar-main-row">
		<div class="topbar-left">
			<button type="button" class="btn-topbar" onclick={onBack}> Back to Posts </button>

			<span class="topbar-title">
				{postId ? 'Edit Post' : 'Add New Post'}
				{#if isDirty}
					<span class="dirty-dot" title="Unsaved changes">
						<span class="sr-only">Unsaved changes</span>
					</span>
				{/if}
			</span>

			<span class={['status-pill', `status-${status}`]}>
				{status.toUpperCase()}
			</span>

			<span class="stats-pill">
				{words} words · {chars} chars · {readingTime} min read
			</span>

			<span
				class={[
					'seo-pill',
					{
						'is-good': seoScore >= 80 && blockingCount === 0,
						'is-warn': seoScore >= 50 && (seoScore < 80 || blockingCount > 0),
						'is-bad': seoScore < 50
					}
				]}
				title={blockingCount > 0
					? `${blockingCount} publish-blocking SEO issue(s)`
					: 'All publish-gate checks passing'}
			>
				SEO {seoScore}/100{blockingCount > 0 ? ` (${blockingCount} blocking)` : ''}
			</span>
		</div>

		<div class="topbar-right">
			<span class="autosave-indicator" role="status" aria-live="polite">
				{#if autosaveStatus === 'saving'}
					Autosaving...
				{:else if autosaveStatus === 'saved' && !isDirty}
					All changes saved{lastSavedAt ? ` (${lastSavedAt})` : ''}
				{:else if autosaveStatus === 'error'}
					Autosave failed (saved locally)
				{:else if isDirty}
					Unsaved changes
				{:else}
					Ready
				{/if}
			</span>

			<button
				type="button"
				class={['btn-topbar', { 'is-active': isFocusMode }]}
				aria-pressed={isFocusMode}
				onclick={onToggleFocusMode}
			>
				{isFocusMode ? 'Exit Focus' : 'Focus Mode'}
			</button>

			{#if previewHref}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={previewHref} target="_blank" rel="noopener noreferrer" class="btn-topbar">
					Preview
				</a>
			{/if}

			<button
				type="button"
				class="btn-topbar"
				title="Save (⌘S)"
				disabled={isSaving}
				onclick={() => (onSaveAndStay ? onSaveAndStay() : onSaveDraft())}
			>
				Save
			</button>

			<button type="button" class="btn-topbar" disabled={isSaving} onclick={onSaveDraft}>
				Save Draft
			</button>

			<button
				type="button"
				class="btn-primary-submit"
				disabled={isSaving}
				onclick={onPrimarySubmit}
			>
				{primaryButtonLabel}
			</button>
		</div>
	</div>

	{#if autosaveStatus === 'error'}
		<div class="autosave-failure-slot" role="alert">
			<span>
				Autosave failed. Draft preserved in browser storage. Last saved: {lastSavedAt ||
					'Not yet saved on server'}.
			</span>
			{#if onRetryAutosave}
				<button type="button" class="btn-topbar" disabled={isSaving} onclick={onRetryAutosave}>
					Retry
				</button>
			{/if}
		</div>
	{/if}
</header>

<style>
	.editor-topbar {
		position: sticky;
		top: 0;
		z-index: 60;
		display: flex;
		flex-direction: column;
		min-height: 3.5rem;
		background: var(--bg-soft);
		border-bottom: 1px solid var(--line-strong);
	}

	.topbar-main-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.85rem;
		min-height: 3.5rem;
		padding: 0.75rem 1.35rem;
	}

	.topbar-left,
	.topbar-right {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem;
	}

	.topbar-title {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		font-family: var(--font-display);
		font-size: 0.9rem;
		font-weight: 800;
		color: var(--text);
	}

	.dirty-dot {
		display: inline-block;
		width: 8px;
		height: 8px;
		border-radius: 999px;
		background: var(--status-amber-text);
		box-shadow: 0 0 0 2px rgba(222, 195, 161, 0.25);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.status-pill,
	.stats-pill,
	.seo-pill {
		padding: 0.28rem 0.65rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 700;
		border: 1px solid var(--line);
		background: var(--panel);
		color: var(--text-secondary);
	}

	.status-pill.status-published {
		background: rgba(220, 255, 101, 0.15);
		border-color: var(--acid);
		color: var(--acid);
	}

	.status-pill.status-scheduled {
		background: rgba(222, 195, 161, 0.15);
		border-color: var(--status-amber-border);
		color: var(--status-amber-text);
	}

	.seo-pill.is-good {
		border-color: var(--acid);
		color: var(--acid);
	}

	.seo-pill.is-warn {
		border-color: var(--status-amber-border);
		color: var(--status-amber-text);
	}

	.seo-pill.is-bad {
		border-color: var(--coral);
		color: var(--coral);
	}

	.autosave-indicator {
		font-size: 0.78rem;
		color: var(--muted);
		margin-right: 0.25rem;
	}

	.autosave-failure-slot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		min-height: 3.5rem;
		padding: 0.55rem 1.35rem;
		background: rgba(255, 121, 105, 0.14);
		border-top: 1px solid var(--coral);
		color: var(--coral);
		font-size: 0.82rem;
		font-weight: 600;
	}

	.btn-topbar {
		padding: 0.45rem 0.85rem;
		border-radius: 6px;
		border: 1px solid var(--line-strong);
		background: var(--panel);
		color: var(--text);
		font-family: var(--font-sans);
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
	}

	.btn-topbar.is-active {
		border-color: var(--acid);
		color: var(--acid);
	}

	.btn-primary-submit {
		padding: 0.48rem 1rem;
		border-radius: 6px;
		border: 1px solid var(--acid);
		background: var(--acid);
		color: var(--ink);
		font-family: var(--font-sans);
		font-size: 0.84rem;
		font-weight: 800;
		cursor: pointer;
	}

	.btn-primary-submit:disabled,
	.btn-topbar:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
