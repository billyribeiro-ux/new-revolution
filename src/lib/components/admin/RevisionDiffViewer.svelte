<script lang="ts">
	import { computeWordDiff } from './post-editor/diff';

	export interface RevisionSnapshot {
		id: number;
		titleSnapshot: string;
		excerptSnapshot: string | null;
		contentSnapshot?: string;
		wordCount: number;
		wordCountDelta: number;
		changeType: string;
		createdAt: Date | string;
	}

	export type RevisionRecord = RevisionSnapshot;

	interface Props {
		open: boolean;
		revision: RevisionSnapshot | null;
		currentTitle: string;
		currentExcerpt: string;
		currentContent: string;
		onRestore: (revisionId: number) => void;
		onClose: () => void;
	}

	let { open, revision, currentTitle, currentExcerpt, currentContent, onRestore, onClose }: Props =
		$props();

	let viewMode = $state<'inline' | 'side-by-side'>('inline');
	let activeTab = $state<'all' | 'content' | 'title' | 'excerpt'>('all');

	function htmlToStructuredText(html: string): string {
		if (!html) return '';
		return html
			.replace(/<img\b[^>]*alt=["']([^"']*)["'][^>]*>/gi, (_, alt: string) =>
				alt.trim() ? ` [IMAGE: ${alt.trim()}] ` : ' [IMAGE] '
			)
			.replace(/<img\b[^>]*>/gi, ' [IMAGE] ')
			.replace(
				/<a\b[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
				(_, href: string, text: string) => {
					const cleanText = text.replace(/<[^>]+>/g, '').trim();
					return `${cleanText} [LINK: ${href}]`;
				}
			)
			.replace(/<\/(p|h[1-6]|li|blockquote|div|pre|tr)>/gi, '\n')
			.replace(/<br\s*\/?>/gi, '\n')
			.replace(/<[^>]+>/g, ' ')
			.replace(/[ \t]+/g, ' ')
			.replace(/\n\s+/g, '\n')
			.trim();
	}

	let titleDiff = $derived(revision ? computeWordDiff(revision.titleSnapshot, currentTitle) : []);
	let excerptDiff = $derived(
		revision ? computeWordDiff(revision.excerptSnapshot ?? '', currentExcerpt) : []
	);
	let contentDiff = $derived(
		revision
			? computeWordDiff(
					htmlToStructuredText(revision.contentSnapshot ?? ''),
					htmlToStructuredText(currentContent)
				)
			: []
	);

	let diffSummaryCounts = $derived.by(() => {
		let added = 0;
		let removed = 0;
		for (const chunk of contentDiff) {
			const count = chunk.text.trim() ? chunk.text.trim().split(/\s+/).length : 0;
			if (chunk.type === 'insert') added += count;
			else if (chunk.type === 'delete') removed += count;
		}
		return { added, removed };
	});

	function focusModal(node: HTMLElement) {
		const closeBtn = node.querySelector<HTMLElement>('.btn-close, button');
		(closeBtn ?? node).focus();
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			onClose();
			return;
		}
		if (e.key === 'Tab') {
			const container = e.currentTarget as HTMLElement | null;
			if (!container) return;
			const focusable = Array.from(
				container.querySelectorAll<HTMLElement>(
					'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
				)
			);
			if (focusable.length === 0) return;
			const first = focusable[0]!;
			const last = focusable[focusable.length - 1]!;
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}
</script>

{#if open && revision}
	<div
		{@attach focusModal}
		class="diff-modal-backdrop"
		role="dialog"
		aria-modal="true"
		aria-labelledby="diff-modal-title"
		tabindex="-1"
		onkeydown={handleKeyDown}
	>
		<div class="diff-modal-shell">
			<header class="diff-header">
				<div>
					<h2 id="diff-modal-title" class="diff-title">
						Revision #{revision.id} ({revision.changeType})
					</h2>
					<span class="diff-meta">
						Saved {new Date(revision.createdAt).toLocaleString()} · {revision.wordCount} words ({revision.wordCountDelta >=
						0
							? `+${revision.wordCountDelta}`
							: revision.wordCountDelta}) · +{diffSummaryCounts.added} / -{diffSummaryCounts.removed}
						words vs current
					</span>
				</div>

				<div class="diff-header-actions">
					<button
						type="button"
						class={['btn-mode', { 'is-active': activeTab === 'all' }]}
						onclick={() => (activeTab = 'all')}
					>
						All
					</button>
					<button
						type="button"
						class={['btn-mode', { 'is-active': activeTab === 'content' }]}
						onclick={() => (activeTab = 'content')}
					>
						Content
					</button>
					<button
						type="button"
						class={['btn-mode', { 'is-active': activeTab === 'title' }]}
						onclick={() => (activeTab = 'title')}
					>
						Title
					</button>
					<button
						type="button"
						class={['btn-mode', { 'is-active': activeTab === 'excerpt' }]}
						onclick={() => (activeTab = 'excerpt')}
					>
						Excerpt
					</button>
					<button
						type="button"
						class={['btn-mode', { 'is-active': viewMode === 'inline' }]}
						onclick={() => (viewMode = 'inline')}
					>
						Inline Diff
					</button>
					<button
						type="button"
						class={['btn-mode', { 'is-active': viewMode === 'side-by-side' }]}
						onclick={() => (viewMode = 'side-by-side')}
					>
						Side by Side
					</button>
					<button type="button" class="btn-restore" onclick={() => onRestore(revision.id)}>
						Restore This Revision
					</button>
					<button type="button" class="btn-close" onclick={onClose}> Close </button>
				</div>
			</header>

			<div class="diff-body">
				{#if activeTab === 'all' || activeTab === 'title'}
					<section class="diff-section">
						<h3 class="diff-section-label">Title Comparison</h3>
						{#if viewMode === 'inline'}
							<div class="diff-inline-box">
								{#each titleDiff as chunk, i (i)}
									{#if chunk.type === 'delete'}
										<del class="diff-del">{chunk.text}</del>
									{:else if chunk.type === 'insert'}
										<ins class="diff-ins">{chunk.text}</ins>
									{:else}
										<span>{chunk.text}</span>
									{/if}
								{/each}
							</div>
						{:else}
							<div class="diff-split-grid">
								<div class="diff-split-pane">
									<span class="pane-label">Revision Snapshot</span>
									<p>{revision.titleSnapshot}</p>
								</div>
								<div class="diff-split-pane">
									<span class="pane-label">Current Draft</span>
									<p>{currentTitle}</p>
								</div>
							</div>
						{/if}
					</section>
				{/if}

				{#if activeTab === 'all' || activeTab === 'excerpt'}
					<section class="diff-section">
						<h3 class="diff-section-label">Excerpt Comparison</h3>
						{#if viewMode === 'inline'}
							<div class="diff-inline-box">
								{#each excerptDiff as chunk, i (i)}
									{#if chunk.type === 'delete'}
										<del class="diff-del">{chunk.text}</del>
									{:else if chunk.type === 'insert'}
										<ins class="diff-ins">{chunk.text}</ins>
									{:else}
										<span>{chunk.text}</span>
									{/if}
								{/each}
							</div>
						{:else}
							<div class="diff-split-grid">
								<div class="diff-split-pane">
									<span class="pane-label">Revision Snapshot</span>
									<p>{revision.excerptSnapshot || '(Empty)'}</p>
								</div>
								<div class="diff-split-pane">
									<span class="pane-label">Current Draft</span>
									<p>{currentExcerpt || '(Empty)'}</p>
								</div>
							</div>
						{/if}
					</section>
				{/if}

				{#if activeTab === 'all' || activeTab === 'content'}
					<section class="diff-section">
						<h3 class="diff-section-label">Content Comparison</h3>
						{#if viewMode === 'inline'}
							<div class="diff-inline-box diff-code">
								{#each contentDiff as chunk, i (i)}
									{#if chunk.type === 'delete'}
										<del class="diff-del">{chunk.text}</del>
									{:else if chunk.type === 'insert'}
										<ins class="diff-ins">{chunk.text}</ins>
									{:else}
										<span>{chunk.text}</span>
									{/if}
								{/each}
							</div>
						{:else}
							<div class="diff-split-grid">
								<div class="diff-split-pane diff-code">
									<span class="pane-label">Revision Snapshot</span>
									<pre>{htmlToStructuredText(revision.contentSnapshot ?? '')}</pre>
								</div>
								<div class="diff-split-pane diff-code">
									<span class="pane-label">Current Draft</span>
									<pre>{htmlToStructuredText(currentContent)}</pre>
								</div>
							</div>
						{/if}
					</section>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.diff-modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 1150;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		background: rgba(11, 14, 18, 0.84);
		backdrop-filter: blur(4px);
	}

	.diff-modal-shell {
		width: 100%;
		max-width: 1120px;
		max-height: 88vh;
		display: flex;
		flex-direction: column;
		background: var(--panel);
		border: 1px solid var(--line-strong);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: var(--shadow-lg);
	}

	.diff-header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.35rem;
		background: var(--bg-soft);
		border-bottom: 1px solid var(--line);
	}

	.diff-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.05rem;
		font-weight: 700;
		color: var(--text);
	}

	.diff-meta {
		font-size: 0.78rem;
		color: var(--muted);
	}

	.diff-header-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn-mode,
	.btn-close,
	.btn-restore {
		padding: 0.42rem 0.85rem;
		border-radius: 6px;
		font-family: var(--font-sans);
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
		border: 1px solid var(--line);
		background: var(--panel2);
		color: var(--text);
	}

	.btn-mode.is-active {
		border-color: var(--acid);
		color: var(--acid);
	}

	.btn-restore {
		background: var(--acid);
		border-color: var(--acid);
		color: var(--ink);
		font-weight: 700;
	}

	.diff-body {
		padding: 1.25rem 1.35rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.diff-section-label {
		margin: 0 0 0.45rem;
		font-family: var(--font-display);
		font-size: 0.85rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--muted);
	}

	.diff-inline-box {
		padding: 0.9rem 1rem;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: var(--bg);
		font-size: 0.9rem;
		line-height: 1.65;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.diff-code {
		font-family: var(--font-mono);
		font-size: 0.82rem;
	}

	.diff-del {
		background: rgba(255, 121, 105, 0.22);
		color: var(--coral);
		text-decoration: line-through;
	}

	.diff-ins {
		background: rgba(220, 255, 101, 0.22);
		color: var(--acid);
		text-decoration: none;
	}

	.diff-split-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.85rem;
	}

	.diff-split-pane {
		padding: 0.85rem 1rem;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: var(--bg);
		overflow-x: auto;
	}

	.diff-split-pane pre {
		margin: 0;
		white-space: pre-wrap;
		word-break: break-word;
		font-family: var(--font-mono);
		font-size: 0.8rem;
	}

	.pane-label {
		display: block;
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		color: var(--muted);
		margin-bottom: 0.4rem;
	}
</style>
