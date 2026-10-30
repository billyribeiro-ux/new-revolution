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
		isDirty: boolean;
		isSaving: boolean;
		isFocusMode: boolean;
		previewToken?: string;
		onBack: () => void;
		onToggleFocusMode: () => void;
		onSaveDraft: () => void;
		onPrimarySubmit: () => void;
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
		isDirty,
		isSaving,
		isFocusMode,
		previewToken = '',
		onBack,
		onToggleFocusMode,
		onSaveDraft,
		onPrimarySubmit
	}: Props = $props();

	let previewHref = $derived(
		postId && slug
			? `/blog/${slug}${previewToken ? `?preview=${encodeURIComponent(previewToken)}` : ''}`
			: ''
	);

	let primaryButtonLabel = $derived.by(() => {
		if (isSaving) return 'Saving...';
		if (status === 'published') return postId ? 'Update Live Post' : 'Publish Now';
		if (status === 'scheduled') return 'Schedule Post';
		return postId ? 'Save Changes' : 'Save Post';
	});
</script>

<header class="editor-topbar">
	<div class="topbar-left">
		<button type="button" class="btn-topbar" onclick={onBack}> Back to Posts </button>

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
		<span class="autosave-indicator" aria-live="polite">
			{#if autosaveStatus === 'saving'}
				Autosaving...
			{:else if autosaveStatus === 'saved' && !isDirty}
				All changes saved
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

		<button type="button" class="btn-topbar" disabled={isSaving} onclick={onSaveDraft}>
			Save Draft
		</button>

		<button type="button" class="btn-primary-submit" disabled={isSaving} onclick={onPrimarySubmit}>
			{primaryButtonLabel}
		</button>
	</div>
</header>

<style>
	.editor-topbar {
		position: sticky;
		top: 0;
		z-index: 60;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.85rem;
		padding: 0.75rem 1.35rem;
		background: var(--bg-soft);
		border-bottom: 1px solid var(--line-strong);
	}

	.topbar-left,
	.topbar-right {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem;
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
