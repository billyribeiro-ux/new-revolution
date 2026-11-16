<script lang="ts">
	import ListBulletsIcon from 'phosphor-svelte/lib/ListBulletsIcon';
	import LinkSimpleIcon from 'phosphor-svelte/lib/LinkSimpleIcon';
	import {
		isCtaHeadingText,
		normaliseComparisonText,
		normalizePostHeadings,
		type TocEntry
	} from '#lib/shared/seo/toc';
	import { toast } from '#lib/stores/toast.svelte.js';

	interface Props {
		content: string;
		title?: string;
		enableToc?: boolean;
		onScrollToHeading?: (text: string, level: number, index: number) => void;
	}

	let { content, title = '', enableToc = $bindable(true), onScrollToHeading }: Props = $props();

	let copyStatus = $state<'idle' | 'copied' | 'error'>('idle');
	let copyStatusText = $state('');

	let tocItems = $derived.by((): TocEntry[] => {
		if (!content) return [];
		return normalizePostHeadings(content, title).toc;
	});

	function handleSelectHeading(item: TocEntry, index: number) {
		if (onScrollToHeading) {
			onScrollToHeading(item.text, item.level, index);
			return;
		}
		if (typeof document === 'undefined') return;
		const proseRoot =
			document.querySelector('.rte-wrapper .prose-base') ??
			document.querySelector('.post-editor-shell');
		if (!proseRoot) return;
		const allHeadings = Array.from(proseRoot.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter(
			(el) => Boolean((el.textContent ?? '').trim())
		);
		const normalizedTitle = normaliseComparisonText(title);
		const afterLeadStrip =
			allHeadings.length > 0 &&
			(allHeadings[0].tagName === 'H1' || allHeadings[0].tagName === 'H2') &&
			normalizedTitle &&
			normaliseComparisonText(allHeadings[0].textContent ?? '') === normalizedTitle
				? allHeadings.slice(1)
				: allHeadings;
		const bodyHeadings = afterLeadStrip.filter((el) => !isCtaHeadingText(el.textContent ?? ''));

		const normalizedTarget = normaliseComparisonText(item.text);
		let targetEl: Element | undefined = bodyHeadings[index];
		if (!targetEl || normaliseComparisonText(targetEl.textContent ?? '') !== normalizedTarget) {
			const sameTextOccurrence = tocItems
				.slice(0, index + 1)
				.filter((entry) => normaliseComparisonText(entry.text) === normalizedTarget).length;
			let seen = 0;
			targetEl = bodyHeadings.find((el) => {
				if (normaliseComparisonText(el.textContent ?? '') === normalizedTarget) {
					seen += 1;
					return seen === sameTextOccurrence;
				}
				return false;
			});
		}

		if (targetEl) {
			const prefersReduced =
				typeof window !== 'undefined' &&
				typeof window.matchMedia === 'function' &&
				window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			targetEl.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'center' });
		}
	}

	async function copyMarkdown() {
		if (tocItems.length === 0) return;
		const md = tocItems
			.map((item) => `${'  '.repeat(Math.max(0, item.level - 2))}- [${item.text}](#${item.id})`)
			.join('\n');
		try {
			if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
				throw new Error('Clipboard API unavailable');
			}
			await navigator.clipboard.writeText(md);
			copyStatus = 'copied';
			copyStatusText = 'Table of contents copied as Markdown.';
			toast.success('Table of contents copied as Markdown.');
		} catch {
			copyStatus = 'error';
			copyStatusText =
				'Could not copy the table of contents. Allow clipboard access and try again.';
			toast.error('Could not copy the table of contents. Allow clipboard access and try again.');
		}
	}
</script>

<div class="toc-panel" data-testid="toc-panel">
	<div class="toc-controls-row">
		<label class="toc-toggle-label" for="toc-enable-checkbox">
			<input id="toc-enable-checkbox" name="enableToc" type="checkbox" bind:checked={enableToc} />
			<span>Show TOC on Post</span>
		</label>
		{#if tocItems.length > 0}
			<button
				type="button"
				class="toc-copy"
				onclick={copyMarkdown}
				title="Copy Table of Contents as Markdown"
			>
				<LinkSimpleIcon size={13} aria-hidden="true" />
				<span>Copy MD</span>
			</button>
		{/if}
	</div>

	{#if copyStatusText}
		<p class={['toc-status', { 'is-error': copyStatus === 'error' }]} role="status">
			{copyStatusText}
		</p>
	{/if}

	{#if tocItems.length === 0}
		<div class="toc-empty">
			<ListBulletsIcon size={28} weight="light" aria-hidden="true" />
			<p>Add headings (H2, H3...) to your post to generate a table of contents.</p>
		</div>
	{:else}
		<div class="toc-header">
			<span class="toc-count">
				{tocItems.length} heading{tocItems.length !== 1 ? 's' : ''}
				{#if tocItems.length < 3}
					(min 3 required for public sidebar)
				{/if}
			</span>
		</div>
		<ol class="toc-list">
			{#each tocItems as item, idx (item.id)}
				<li
					class={`toc-item toc-item--h${item.level}`}
					style={`--depth: ${Math.max(0, item.level - 2)}`}
				>
					<button
						type="button"
						class="toc-item__btn"
						onclick={() => handleSelectHeading(item, idx)}
						title={`Jump to "${item.text}" (#${item.id})`}
					>
						<span class="toc-item__level">H{item.level}</span>
						<span class="toc-item__text">{item.text}</span>
						<code class="toc-item__id">#{item.id}</code>
					</button>
				</li>
			{/each}
		</ol>
		<p class="toc-note">
			Click any heading to jump to it in the editor. Anchor IDs match the live article.
		</p>
	{/if}
</div>

<style>
	.toc-panel {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}

	.toc-controls-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.toc-toggle-label {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.82rem;
		color: var(--text);
		cursor: pointer;
	}

	.toc-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.toc-count {
		font-size: 0.75rem;
		color: var(--muted);
	}

	.toc-copy {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.74rem;
		font-weight: 600;
		color: var(--text);
		background: var(--panel2);
		border: 1px solid var(--line-strong);
		border-radius: 6px;
		padding: 0.3rem 0.6rem;
		cursor: pointer;
		transition: background 0.12s ease;
	}

	.toc-copy:hover {
		background: var(--acid);
		color: var(--ink);
		border-color: var(--acid);
	}

	.toc-status {
		margin: 0;
		font-size: 0.75rem;
		color: var(--acid);
	}

	.toc-status.is-error {
		color: var(--coral);
	}

	.toc-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.65rem;
		padding: 1.5rem 0.75rem;
		color: var(--muted);
		text-align: center;
		font-size: 0.8rem;
	}

	.toc-empty p {
		margin: 0;
	}

	.toc-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 3px;
		max-height: 260px;
		overflow-y: auto;
	}

	.toc-item {
		border-radius: 4px;
		background: var(--bg-soft);
		border-left: 2px solid transparent;
	}

	.toc-item--h1,
	.toc-item--h2 {
		border-left-color: var(--acid);
	}

	.toc-item--h3 {
		border-left-color: var(--acid2);
	}

	.toc-item--h4,
	.toc-item--h5,
	.toc-item--h6 {
		border-left-color: var(--line-strong);
	}

	.toc-item__btn {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
		width: 100%;
		padding: 0.35rem 0.5rem;
		padding-left: calc(0.5rem + (var(--depth, 0) * 0.85rem));
		border: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
		transition: background 0.12s ease;
	}

	.toc-item__btn:hover,
	.toc-item__btn:focus-visible {
		background: var(--panel2);
	}

	.toc-item__level {
		font-family: var(--font-mono);
		font-size: 0.66rem;
		font-weight: 700;
		color: var(--acid);
		flex-shrink: 0;
		width: 1.5rem;
	}

	.toc-item__text {
		flex: 1;
		font-size: 0.78rem;
		color: var(--text);
		line-height: 1.35;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.toc-item__id {
		font-family: var(--font-mono);
		font-size: 0.66rem;
		color: var(--muted);
		flex-shrink: 0;
	}

	.toc-note {
		font-size: 0.7rem;
		color: var(--muted);
		margin: 0;
	}
</style>
