<script lang="ts">
	import type { PostEditorFormState } from './post-editor/form-actions';
	import { POST_STATUS_VALUES, POST_VISIBILITY_VALUES } from '#lib/shared/schemas/posts';

	interface CategoryOption {
		id: number;
		name: string;
		slug: string;
	}

	interface TagOption {
		id: number;
		name: string;
		slug: string;
	}

	interface AuthorOption {
		id: number;
		name: string;
		jobTitle?: string | null;
	}

	interface RelatedPostOption {
		id: number;
		title: string;
		slug: string;
	}

	interface RevisionItem {
		id: number;
		titleSnapshot: string;
		excerptSnapshot: string | null;
		contentSnapshot?: string;
		wordCount: number;
		wordCountDelta: number;
		changeType: string;
		createdAt: Date | string;
	}

	interface Props {
		form: PostEditorFormState;
		categories: CategoryOption[];
		tags: TagOption[];
		authors: AuthorOption[];
		allPosts: RelatedPostOption[];
		revisions: RevisionItem[];
		isSaving: boolean;
		onSaveDraft: () => void;
		onPrimarySubmit: () => void;
		onQuickCreateCategory: (name: string) => Promise<void>;
		onQuickCreateTag: (name: string) => Promise<void>;
		onOpenRevisionDiff: (rev: RevisionItem) => void;
	}

	let {
		form = $bindable(),
		categories,
		tags,
		authors,
		allPosts,
		revisions,
		isSaving,
		onSaveDraft,
		onPrimarySubmit,
		onQuickCreateCategory,
		onQuickCreateTag,
		onOpenRevisionDiff
	}: Props = $props();

	let newCategoryName = $state('');
	let newTagName = $state('');
	let creatingCat = $state(false);
	let creatingTag = $state(false);

	function toggleCategory(catId: number) {
		if (form.categoryIds.includes(catId)) {
			form.categoryIds = form.categoryIds.filter((id) => id !== catId);
			if (form.categoryId === catId) {
				form.categoryId = form.categoryIds[0] ?? null;
			}
		} else {
			form.categoryIds = [...form.categoryIds, catId];
			if (!form.categoryId) {
				form.categoryId = catId;
			}
		}
	}

	function toggleTag(tagId: number) {
		if (form.tagIds.includes(tagId)) {
			form.tagIds = form.tagIds.filter((id) => id !== tagId);
		} else {
			form.tagIds = [...form.tagIds, tagId];
		}
	}

	function toggleRelatedPost(postId: number) {
		if (form.relatedPostIds.includes(postId)) {
			form.relatedPostIds = form.relatedPostIds.filter((id) => id !== postId);
		} else if (form.relatedPostIds.length < 3) {
			form.relatedPostIds = [...form.relatedPostIds, postId];
		}
	}

	async function handleAddCategory() {
		const clean = newCategoryName.trim();
		if (!clean) return;
		creatingCat = true;
		try {
			await onQuickCreateCategory(clean);
			newCategoryName = '';
		} finally {
			creatingCat = false;
		}
	}

	async function handleAddTag() {
		const clean = newTagName.trim();
		if (!clean) return;
		creatingTag = true;
		try {
			await onQuickCreateTag(clean);
			newTagName = '';
		} finally {
			creatingTag = false;
		}
	}

	function toDatetimeLocalValue(iso: string): string {
		if (!iso) return '';
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return '';
		const pad = (n: number) => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	}

	function fromDatetimeLocalValue(localVal: string): string {
		if (!localVal) return '';
		const d = new Date(localVal);
		return Number.isNaN(d.getTime()) ? '' : d.toISOString();
	}

	let candidateRelatedPosts = $derived(allPosts.filter((p) => p.id !== form.id).slice(0, 40));
</script>

<aside class="editor-sidebar">
	<!-- Publish & Visibility Box -->
	<section class="sidebar-card">
		<h2 class="sidebar-h2">Publish & Visibility</h2>

		<label class="side-field">
			<span class="side-label">Status</span>
			<select class="side-select" bind:value={form.status}>
				{#each POST_STATUS_VALUES as st (st)}
					<option value={st}>{st.toUpperCase()}</option>
				{/each}
			</select>
		</label>

		{#if form.status === 'scheduled'}
			<label class="side-field">
				<span class="side-label">Schedule Publish Time (Required)</span>
				<input
					type="datetime-local"
					class="side-input"
					value={toDatetimeLocalValue(form.scheduledAt)}
					onchange={(e) => {
						form.scheduledAt = fromDatetimeLocalValue((e.currentTarget as HTMLInputElement).value);
					}}
				/>
			</label>
		{/if}

		<label class="side-field">
			<span class="side-label">Visibility</span>
			<select class="side-select" bind:value={form.visibility}>
				{#each POST_VISIBILITY_VALUES as vis (vis)}
					<option value={vis}>{vis.replace('_', ' ')}</option>
				{/each}
			</select>
		</label>

		{#if form.visibility === 'password_protected'}
			<div class="password-box">
				{#if form.hasExistingPassword && !form.clearPassword}
					<p class="pw-note">
						A password is currently set. Leave blank to keep the existing password, or enter a new
						one below.
					</p>
				{/if}
				<label class="side-field">
					<span class="side-label">Access Password (min 4 chars)</span>
					<input
						type="password"
						class="side-input"
						placeholder={form.hasExistingPassword
							? 'Keep existing password...'
							: 'Enter password...'}
						bind:value={form.passwordPlaintext}
					/>
				</label>
				{#if form.hasExistingPassword}
					<label class="chk-row">
						<input type="checkbox" bind:checked={form.clearPassword} />
						<span>Clear existing password</span>
					</label>
				{/if}
			</div>
		{/if}

		<label class="side-field">
			<span class="side-label">Expiration Date (optional)</span>
			<input
				type="datetime-local"
				class="side-input"
				value={toDatetimeLocalValue(form.expiresAt)}
				onchange={(e) => {
					form.expiresAt = fromDatetimeLocalValue((e.currentTarget as HTMLInputElement).value);
				}}
			/>
		</label>

		<div class="toggle-group">
			<label class="chk-row">
				<input type="checkbox" bind:checked={form.featured} />
				<span>Featured Post (Top 3 Hero)</span>
			</label>
			<label class="chk-row">
				<input type="checkbox" bind:checked={form.pinned} />
				<span>Pin to Top of Feed</span>
			</label>
			<label class="chk-row">
				<input type="checkbox" bind:checked={form.enableToc} />
				<span>Show Table of Contents</span>
			</label>
			<label class="chk-row">
				<input type="checkbox" bind:checked={form.excludeFromSearch} />
				<span>Exclude from Site Search</span>
			</label>
		</div>

		<label class="side-field">
			<span class="side-label">Revision Note (optional)</span>
			<input
				type="text"
				class="side-input"
				placeholder="Summary of changes..."
				bind:value={form.revisionNotes}
			/>
		</label>

		<div class="publish-actions">
			<button type="button" class="btn-side-secondary" disabled={isSaving} onclick={onSaveDraft}>
				Save Draft
			</button>
			<button type="button" class="btn-side-primary" disabled={isSaving} onclick={onPrimarySubmit}>
				{form.status === 'published'
					? 'Publish / Update'
					: form.status === 'scheduled'
						? 'Schedule'
						: 'Save Post'}
			</button>
		</div>
	</section>

	<!-- Author Assignment Box -->
	<section class="sidebar-card">
		<h2 class="sidebar-h2">Author (E-E-A-T)</h2>
		<label class="side-field">
			<span class="side-label">Primary Author (Required to Publish)</span>
			<select
				class="side-select"
				value={form.authorId ?? ''}
				onchange={(e) => {
					const val = (e.currentTarget as HTMLSelectElement).value;
					form.authorId = val ? Number(val) : null;
				}}
			>
				<option value="">Select Author...</option>
				{#each authors as a (a.id)}
					<option value={a.id}>
						{a.name}{a.jobTitle ? ` (${a.jobTitle})` : ''}
					</option>
				{/each}
			</select>
		</label>
	</section>

	<!-- Categories Box -->
	<section class="sidebar-card">
		<h2 class="sidebar-h2">Categories (Required to Publish)</h2>

		{#if form.categoryIds.length > 1}
			<label class="side-field">
				<span class="side-label">Primary Category</span>
				<select
					class="side-select"
					value={form.categoryId ?? ''}
					onchange={(e) => {
						const v = (e.currentTarget as HTMLSelectElement).value;
						form.categoryId = v ? Number(v) : null;
					}}
				>
					{#each categories.filter((c) => form.categoryIds.includes(c.id)) as c (c.id)}
						<option value={c.id}>{c.name}</option>
					{/each}
				</select>
			</label>
		{/if}

		<div class="tax-checklist">
			{#each categories as cat (cat.id)}
				<label class="chk-row">
					<input
						type="checkbox"
						checked={form.categoryIds.includes(cat.id)}
						onchange={() => toggleCategory(cat.id)}
					/>
					<span>{cat.name}</span>
				</label>
			{/each}
		</div>

		<div class="quick-add-row">
			<input
				type="text"
				class="side-input"
				placeholder="New category name..."
				bind:value={newCategoryName}
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						void handleAddCategory();
					}
				}}
			/>
			<button
				type="button"
				class="btn-quick-add"
				disabled={creatingCat || !newCategoryName.trim()}
				onclick={handleAddCategory}
			>
				+ Add
			</button>
		</div>
	</section>

	<!-- Tags Box -->
	<section class="sidebar-card">
		<h2 class="sidebar-h2">Tags</h2>
		<div class="tax-checklist">
			{#each tags as t (t.id)}
				<label class="chk-row">
					<input
						type="checkbox"
						checked={form.tagIds.includes(t.id)}
						onchange={() => toggleTag(t.id)}
					/>
					<span>#{t.name}</span>
				</label>
			{/each}
		</div>

		<div class="quick-add-row">
			<input
				type="text"
				class="side-input"
				placeholder="New tag name..."
				bind:value={newTagName}
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						void handleAddTag();
					}
				}}
			/>
			<button
				type="button"
				class="btn-quick-add"
				disabled={creatingTag || !newTagName.trim()}
				onclick={handleAddTag}
			>
				+ Add
			</button>
		</div>
	</section>

	<!-- Related Posts Box -->
	{#if candidateRelatedPosts.length > 0}
		<section class="sidebar-card">
			<h2 class="sidebar-h2">
				Related Articles ({form.relatedPostIds.length}/3)
			</h2>
			<div class="tax-checklist">
				{#each candidateRelatedPosts as rel (rel.id)}
					<label class="chk-row">
						<input
							type="checkbox"
							checked={form.relatedPostIds.includes(rel.id)}
							disabled={!form.relatedPostIds.includes(rel.id) && form.relatedPostIds.length >= 3}
							onchange={() => toggleRelatedPost(rel.id)}
						/>
						<span>{rel.title}</span>
					</label>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Revision History Box -->
	{#if revisions.length > 0}
		<section class="sidebar-card">
			<h2 class="sidebar-h2">Revision History ({revisions.length})</h2>
			<ul class="revision-list">
				{#each revisions as rev (rev.id)}
					<li class="revision-item">
						<div class="rev-meta">
							<strong>#{rev.id} · {rev.changeType}</strong>
							<span>{new Date(rev.createdAt).toLocaleString()}</span>
							<span>
								{rev.wordCount} words ({rev.wordCountDelta >= 0
									? `+${rev.wordCountDelta}`
									: rev.wordCountDelta})
							</span>
						</div>
						<button type="button" class="btn-quick-add" onclick={() => onOpenRevisionDiff(rev)}>
							Compare
						</button>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
</aside>

<style>
	.editor-sidebar {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		width: 100%;
	}

	.sidebar-card {
		background: var(--panel);
		border: 1px solid var(--line-strong);
		border-radius: 12px;
		padding: 1.1rem 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.sidebar-h2 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.92rem;
		font-weight: 700;
		color: var(--text);
		border-bottom: 1px solid var(--line);
		padding-bottom: 0.5rem;
	}

	.side-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.side-label {
		font-size: 0.76rem;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.side-input,
	.side-select {
		padding: 0.45rem 0.65rem;
		border-radius: 6px;
		border: 1px solid var(--line-strong);
		background: var(--bg);
		color: var(--text);
		font-family: var(--font-sans);
		font-size: 0.84rem;
	}

	.password-box {
		padding: 0.65rem;
		border-radius: 8px;
		background: var(--bg-soft);
		border: 1px solid var(--line);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.pw-note {
		margin: 0;
		font-size: 0.75rem;
		color: var(--acid);
	}

	.toggle-group,
	.tax-checklist {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		max-height: 190px;
		overflow-y: auto;
	}

	.chk-row {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.82rem;
		color: var(--text);
		cursor: pointer;
	}

	.publish-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}

	.btn-side-primary,
	.btn-side-secondary {
		padding: 0.52rem 0.75rem;
		border-radius: 6px;
		font-family: var(--font-sans);
		font-size: 0.83rem;
		font-weight: 700;
		cursor: pointer;
		border: 1px solid transparent;
	}

	.btn-side-primary {
		background: var(--acid);
		color: var(--ink);
	}

	.btn-side-secondary {
		background: var(--panel2);
		border-color: var(--line-strong);
		color: var(--text);
	}

	.quick-add-row {
		display: flex;
		gap: 0.4rem;
	}

	.quick-add-row .side-input {
		flex: 1;
	}

	.btn-quick-add {
		padding: 0.4rem 0.65rem;
		border-radius: 6px;
		border: 1px solid var(--line-strong);
		background: var(--panel2);
		color: var(--text);
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
	}

	.revision-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-height: 240px;
		overflow-y: auto;
	}

	.revision-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.5rem 0.6rem;
		border-radius: 6px;
		background: var(--bg-soft);
		border: 1px solid var(--line);
		font-size: 0.76rem;
	}

	.rev-meta {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		color: var(--text-secondary);
	}
</style>
