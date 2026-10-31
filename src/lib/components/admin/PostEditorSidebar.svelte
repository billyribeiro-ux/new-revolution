<script lang="ts">
	import {
		getObjectRowKey,
		loadSidebarPanelState,
		saveSidebarPanelState,
		type PostEditorFormState,
		type SidebarPanelState
	} from './post-editor/form-actions';
	import {
		POST_STATUS_VALUES,
		POST_VISIBILITY_VALUES,
		POST_FORMAT_VALUES,
		POST_TEMPLATE_VALUES
	} from '#lib/shared/schemas/posts';
	import { normalizePostHeadings } from '#lib/shared/seo/toc';
	import FeaturedImagePanel from './FeaturedImagePanel.svelte';

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
		previewToken?: string;
		onSaveDraft: () => void;
		onPrimarySubmit: () => void;
		onMoveToTrash?: () => void;
		onPickCoverImage?: () => void;
		/** Real dimensions of the picked cover, when known. */
		coverDimensions?: { width: number | null; height: number | null } | null;
		onQuickCreateAuthor?: (name: string) => Promise<void>;
		onQuickCreateCategory: (name: string) => Promise<void>;
		onQuickCreateTag: (name: string) => Promise<void>;
		onOpenRevisionDiff: (rev: RevisionItem) => void;
		onRequestConfirm?: (opts: {
			title: string;
			message: string;
			confirmLabel: string;
			onConfirm: () => Promise<void> | void;
		}) => void;
	}

	let {
		form = $bindable(),
		categories,
		tags,
		authors,
		allPosts,
		revisions,
		isSaving,
		previewToken = '',
		onSaveDraft,
		onPrimarySubmit,
		onMoveToTrash,
		onPickCoverImage,
		coverDimensions = null,
		onQuickCreateAuthor,
		onQuickCreateCategory,
		onQuickCreateTag,
		onOpenRevisionDiff,
		onRequestConfirm
	}: Props = $props();

	let panelState = $state.raw<SidebarPanelState>(loadSidebarPanelState());

	let newAuthorName = $state('');
	let newCategoryName = $state('');
	let newTagName = $state('');
	let creatingAuthor = $state(false);
	let creatingCat = $state(false);
	let creatingTag = $state(false);
	let tocCopyStatus = $state('');

	function toggleSidebarPanel(key: keyof SidebarPanelState) {
		const updated: SidebarPanelState = {
			...panelState,
			[key]: !panelState[key]
		};
		panelState = updated;
		saveSidebarPanelState(updated);
	}

	function toggleCategory(catId: number) {
		if (form.categoryIds.includes(catId)) {
			const remaining = form.categoryIds.filter((id) => id !== catId);
			form.categoryIds = remaining;
			if (form.categoryId === catId) {
				form.categoryId = remaining[0] ?? null;
			}
		} else {
			const updated = [...form.categoryIds, catId];
			form.categoryIds = updated;
			if (!form.categoryId) {
				form.categoryId = catId;
			}
		}
	}

	function setPrimaryCategory(catId: number) {
		if (!form.categoryIds.includes(catId)) {
			form.categoryIds = [...form.categoryIds, catId];
		}
		form.categoryId = catId;
	}

	function addTagId(tagId: number) {
		if (!form.tagIds.includes(tagId)) {
			form.tagIds = Array.from(new Set([...form.tagIds, tagId]));
		}
	}

	function removeTagId(tagId: number) {
		form.tagIds = form.tagIds.filter((id) => id !== tagId);
	}

	function toggleRelatedPost(postId: number) {
		if (form.relatedPostIds.includes(postId)) {
			form.relatedPostIds = form.relatedPostIds.filter((id) => id !== postId);
		} else if (form.relatedPostIds.length < 3) {
			form.relatedPostIds = [...form.relatedPostIds, postId];
		}
	}

	async function handleAddAuthor() {
		const clean = newAuthorName.trim();
		if (!clean || !onQuickCreateAuthor) return;
		creatingAuthor = true;
		try {
			await onQuickCreateAuthor(clean);
			newAuthorName = '';
		} finally {
			creatingAuthor = false;
		}
	}

	async function executeCategoryBatchCreate(brandNewNames: string[]) {
		creatingCat = true;
		try {
			for (const name of brandNewNames) {
				await onQuickCreateCategory(name);
			}
			newCategoryName = '';
		} finally {
			creatingCat = false;
		}
	}

	async function handleAddCategory() {
		const rawNames = newCategoryName
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		if (rawNames.length === 0) return;

		const brandNewNames: string[] = [];
		for (const candidate of rawNames) {
			const existing = categories.find((c) => c.name.toLowerCase() === candidate.toLowerCase());
			if (existing) {
				if (!form.categoryIds.includes(existing.id)) {
					toggleCategory(existing.id);
				}
			} else if (!brandNewNames.some((n) => n.toLowerCase() === candidate.toLowerCase())) {
				brandNewNames.push(candidate);
			}
		}

		if (brandNewNames.length === 0) {
			newCategoryName = '';
			return;
		}

		if (brandNewNames.length > 2 && onRequestConfirm) {
			onRequestConfirm({
				title: 'Create Multiple Categories?',
				message: `You are about to create ${brandNewNames.length} new categories (${brandNewNames.join(', ')}). Continue?`,
				confirmLabel: `Create ${brandNewNames.length} Categories`,
				onConfirm: async () => {
					await executeCategoryBatchCreate(brandNewNames);
				}
			});
			return;
		}

		await executeCategoryBatchCreate(brandNewNames);
	}

	async function handleAddTag() {
		const clean = newTagName.trim();
		if (!clean) return;
		const existing = tags.find((t) => t.name.toLowerCase() === clean.toLowerCase());
		if (existing) {
			addTagId(existing.id);
			newTagName = '';
			return;
		}
		creatingTag = true;
		try {
			await onQuickCreateTag(clean);
			newTagName = '';
		} finally {
			creatingTag = false;
		}
	}

	function addCustomFieldRow() {
		form.customFields = [...form.customFields, { key: '', value: '' }];
	}

	function removeCustomFieldRow(target: { key: string; value: string }) {
		form.customFields = form.customFields.filter((cf) => cf !== target);
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

	function handleScheduleChange(localVal: string) {
		const iso = fromDatetimeLocalValue(localVal);
		form.scheduledAt = iso;
		if (iso && form.status !== 'published') {
			form.status = 'scheduled';
		} else if (!iso && form.status === 'scheduled') {
			form.status = 'draft';
		}
	}

	let localTimezone = $derived.by(() => {
		try {
			return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
		} catch {
			return 'UTC';
		}
	});

	let formattedScheduleSummary = $derived.by(() => {
		if (!form.scheduledAt) return '';
		const d = new Date(form.scheduledAt);
		if (Number.isNaN(d.getTime())) return '';
		return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${localTimezone})`;
	});

	let primaryPublishLabel = $derived.by(() => {
		if (isSaving) return 'Saving...';
		// Same rule as the top bar: a draft (or any non-scheduled status) is published by this button.
		if (form.status === 'scheduled') return 'Schedule';
		if (form.id && form.status === 'published') return 'Update and close';
		return 'Publish';
	});

	let previewHref = $derived(
		form.id && form.slug
			? `/blog/${form.slug}${form.status !== 'published' && previewToken ? `?preview=${encodeURIComponent(previewToken)}` : ''}`
			: ''
	);

	let selectedTagObjects = $derived(tags.filter((t) => form.tagIds.includes(t.id)));
	let availableTagObjects = $derived(tags.filter((t) => !form.tagIds.includes(t.id)));

	let derivedToc = $derived(normalizePostHeadings(form.content, form.title).toc);

	async function copyTocMarkdown() {
		if (derivedToc.length === 0) return;
		const md = derivedToc
			.map((entry) => `${'  '.repeat(Math.max(0, entry.level - 2))}- [${entry.text}](#${entry.id})`)
			.join('\n');
		try {
			if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(md);
				tocCopyStatus = 'Copied Markdown TOC';
			} else {
				tocCopyStatus = 'Clipboard unavailable in this browser';
			}
		} catch (err) {
			console.warn('[PostEditorSidebar] Failed to copy TOC markdown:', err);
			tocCopyStatus = 'Failed to copy TOC to clipboard';
		}
	}

	let candidateRelatedPosts = $derived(allPosts.filter((p) => p.id !== form.id).slice(0, 40));
</script>

<aside class="editor-sidebar">
	<!-- 1. Publish Box -->
	<section class="sidebar-card">
		<h3 class="sidebar-h3">
			<button
				type="button"
				class="sidebar-toggle"
				aria-expanded={panelState.publish}
				aria-controls="sidebar-panel-publish"
				onclick={() => toggleSidebarPanel('publish')}
			>
				<span>Publish</span>
				<span class="sidebar-sub">{form.status.toUpperCase()}</span>
			</button>
		</h3>

		<div id="sidebar-panel-publish" class="sidebar-body" hidden={!panelState.publish}>
			<label class="side-field">
				<span class="side-label">Status</span>
				<select class="side-select" bind:value={form.status}>
					{#each POST_STATUS_VALUES as st (st)}
						<option value={st}>{st.toUpperCase()}</option>
					{/each}
				</select>
			</label>

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
							A password is set. Leave blank to keep the existing password, or enter a new one.
						</p>
					{/if}
					<label class="side-field">
						<span class="side-label">Post Password (min 4 chars)</span>
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
				<span class="side-label">Schedule Publish Time ({localTimezone})</span>
				<input
					type="datetime-local"
					class="side-input"
					value={toDatetimeLocalValue(form.scheduledAt)}
					onchange={(e) => handleScheduleChange((e.currentTarget as HTMLInputElement).value)}
				/>
			</label>
			{#if formattedScheduleSummary}
				<p class="schedule-summary">Scheduled for: {formattedScheduleSummary}</p>
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
				<button
					type="button"
					class="btn-side-primary"
					title="Publish or Update (⌘⇧P)"
					disabled={isSaving}
					onclick={onPrimarySubmit}
				>
					{primaryPublishLabel}
				</button>
			</div>

			<div class="publish-secondary-row">
				{#if previewHref}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={previewHref} target="_blank" rel="noopener noreferrer" class="btn-side-link">
						Preview
					</a>
				{/if}
				{#if form.id !== null && onMoveToTrash}
					<button type="button" class="btn-side-trash" disabled={isSaving} onclick={onMoveToTrash}>
						Move to Trash
					</button>
				{/if}
			</div>
		</div>
	</section>

	<!-- 2. Author Panel -->
	<section class="sidebar-card">
		<h3 class="sidebar-h3">
			<button
				type="button"
				class="sidebar-toggle"
				aria-expanded={panelState.author}
				aria-controls="sidebar-panel-author"
				onclick={() => toggleSidebarPanel('author')}
			>
				<span>Author</span>
				<span class="sidebar-sub">
					{authors.find((a) => a.id === form.authorId)?.name ?? 'Unassigned'}
				</span>
			</button>
		</h3>

		<div id="sidebar-panel-author" class="sidebar-body" hidden={!panelState.author}>
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

			{#if onQuickCreateAuthor}
				<div class="quick-add-row">
					<input
						type="text"
						class="side-input"
						aria-label="New author name"
						placeholder="Add New Author name..."
						bind:value={newAuthorName}
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								void handleAddAuthor();
							}
						}}
					/>
					<button
						type="button"
						class="btn-quick-add"
						disabled={creatingAuthor || !newAuthorName.trim()}
						onclick={handleAddAuthor}
					>
						Add New Author
					</button>
				</div>
			{/if}
		</div>
	</section>

	<!-- 3. Categories Panel -->
	<section class="sidebar-card">
		<h3 class="sidebar-h3">
			<button
				type="button"
				class="sidebar-toggle"
				aria-expanded={panelState.categories}
				aria-controls="sidebar-panel-categories"
				onclick={() => toggleSidebarPanel('categories')}
			>
				<span>Categories</span>
				<span class="sidebar-sub">{form.categoryIds.length} selected</span>
			</button>
		</h3>

		<div id="sidebar-panel-categories" class="sidebar-body" hidden={!panelState.categories}>
			<div class="tax-checklist">
				{#each categories as cat (cat.id)}
					{@const isChecked = form.categoryIds.includes(cat.id)}
					{@const isPrimary = form.categoryId === cat.id}
					<div class="cat-item-row">
						<label class="chk-row">
							<input type="checkbox" checked={isChecked} onchange={() => toggleCategory(cat.id)} />
							<span>{cat.name}</span>
						</label>
						{#if isChecked}
							{#if isPrimary}
								<span class="primary-badge">Primary</span>
							{:else}
								<button
									type="button"
									class="btn-set-primary"
									onclick={() => setPrimaryCategory(cat.id)}
								>
									Set as primary
								</button>
							{/if}
						{/if}
					</div>
				{/each}
			</div>

			<div class="quick-add-row">
				<input
					type="text"
					class="side-input"
					aria-label="New category name"
					placeholder="New category (comma list supported)..."
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
		</div>
	</section>

	<!-- 4. Featured Image Panel -->
	<section class="sidebar-card">
		<h3 class="sidebar-h3">
			<button
				type="button"
				class="sidebar-toggle"
				aria-expanded={panelState.featuredImage}
				aria-controls="sidebar-panel-featuredImage"
				onclick={() => toggleSidebarPanel('featuredImage')}
			>
				<span>Featured Image</span>
				<span class="sidebar-sub">{form.coverImage ? 'Set' : 'None'}</span>
			</button>
		</h3>

		<div id="sidebar-panel-featuredImage" class="sidebar-body" hidden={!panelState.featuredImage}>
			<FeaturedImagePanel
				bind:coverImage={form.coverImage}
				bind:coverImageAlt={form.coverImageAlt}
				bind:coverImageCaption={form.coverImageCaption}
				title={form.title}
				dimensions={coverDimensions}
				onPick={onPickCoverImage}
			/>
		</div>
	</section>

	<!-- 5. Tags Panel -->
	<section class="sidebar-card">
		<h3 class="sidebar-h3">
			<button
				type="button"
				class="sidebar-toggle"
				aria-expanded={panelState.tags}
				aria-controls="sidebar-panel-tags"
				onclick={() => toggleSidebarPanel('tags')}
			>
				<span>Tags</span>
				<span class="sidebar-sub">{form.tagIds.length} selected</span>
			</button>
		</h3>

		<div id="sidebar-panel-tags" class="sidebar-body" hidden={!panelState.tags}>
			{#if tags.length === 0}
				<p class="empty-note">No tags yet</p>
			{:else}
				{#if selectedTagObjects.length > 0}
					<div class="tag-chip-list">
						{#each selectedTagObjects as t (t.id)}
							<span class="tag-chip">
								<span>{t.name}</span>
								<button
									type="button"
									class="tag-chip-remove"
									aria-label="Remove tag {t.name}"
									onclick={() => removeTagId(t.id)}
								>
									x
								</button>
							</span>
						{/each}
					</div>
				{/if}

				{#if availableTagObjects.length > 0}
					<div class="available-tags-list">
						{#each availableTagObjects as t (t.id)}
							<button type="button" class="btn-avail-tag" onclick={() => addTagId(t.id)}>
								+ {t.name}
							</button>
						{/each}
					</div>
				{/if}
			{/if}

			<div class="quick-add-row">
				<input
					type="text"
					class="side-input"
					aria-label="New tag name"
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
					Add
				</button>
			</div>
		</div>
	</section>

	<!-- 6. Post Attributes Panel -->
	<section class="sidebar-card">
		<h3 class="sidebar-h3">
			<button
				type="button"
				class="sidebar-toggle"
				aria-expanded={panelState.postAttributes}
				aria-controls="sidebar-panel-postAttributes"
				onclick={() => toggleSidebarPanel('postAttributes')}
			>
				<span>Post Attributes</span>
				<span class="sidebar-sub">{form.postFormat}</span>
			</button>
		</h3>

		<div id="sidebar-panel-postAttributes" class="sidebar-body" hidden={!panelState.postAttributes}>
			<label class="side-field">
				<span class="side-label">Post Format</span>
				<select
					class="side-select"
					bind:value={form.postFormat}
					onchange={() => {
						form.format = form.postFormat;
					}}
				>
					{#each POST_FORMAT_VALUES as fmt (fmt)}
						<option value={fmt}>{fmt}</option>
					{/each}
				</select>
			</label>

			<label class="side-field">
				<span class="side-label">Template</span>
				<select class="side-select" bind:value={form.template}>
					{#each POST_TEMPLATE_VALUES as tpl (tpl)}
						<option value={tpl}>{tpl}</option>
					{/each}
				</select>
			</label>

			<div class="toggle-group">
				<label class="chk-row">
					<input type="checkbox" bind:checked={form.featured} />
					<span>Featured</span>
				</label>
				<label class="chk-row">
					<input type="checkbox" bind:checked={form.isPillar} />
					<span>Pillar Content</span>
				</label>
				<label class="chk-row">
					<input
						type="checkbox"
						bind:checked={form.isSticky}
						onchange={() => {
							form.pinned = form.isSticky;
						}}
					/>
					<span>Sticky</span>
				</label>
				<label class="chk-row">
					<input
						type="checkbox"
						bind:checked={form.commentsEnabled}
						onchange={() => {
							form.allowComments = form.commentsEnabled;
						}}
					/>
					<span>Comments</span>
				</label>
			</div>

			{#if candidateRelatedPosts.length > 0}
				<div class="side-field">
					<span class="side-label">Related Articles ({form.relatedPostIds.length}/3)</span>
					<div class="tax-checklist">
						{#each candidateRelatedPosts as rel (rel.id)}
							<label class="chk-row">
								<input
									type="checkbox"
									checked={form.relatedPostIds.includes(rel.id)}
									disabled={!form.relatedPostIds.includes(rel.id) &&
										form.relatedPostIds.length >= 3}
									onchange={() => toggleRelatedPost(rel.id)}
								/>
								<span>{rel.title}</span>
							</label>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</section>

	<!-- 7. Table of Contents Panel -->
	<section class="sidebar-card">
		<h3 class="sidebar-h3">
			<button
				type="button"
				class="sidebar-toggle"
				aria-expanded={panelState.toc}
				aria-controls="sidebar-panel-toc"
				onclick={() => toggleSidebarPanel('toc')}
			>
				<span>Table of Contents</span>
				<span class="sidebar-sub">{derivedToc.length} heading(s)</span>
			</button>
		</h3>

		<div id="sidebar-panel-toc" class="sidebar-body" hidden={!panelState.toc}>
			<div class="toc-header-row">
				<label class="chk-row">
					<input type="checkbox" bind:checked={form.enableToc} />
					<span>Show TOC on Post</span>
				</label>
				<button
					type="button"
					class="btn-quick-add"
					disabled={derivedToc.length === 0}
					onclick={copyTocMarkdown}
				>
					Copy MD
				</button>
			</div>

			{#if tocCopyStatus}
				<p class="pw-note" role="status">{tocCopyStatus}</p>
			{/if}

			{#if derivedToc.length === 0}
				<p class="empty-note">Add H1-H6 headings in the article body to generate a TOC.</p>
			{:else}
				<ul class="toc-preview-list">
					{#each derivedToc as item (item.id)}
						<li
							class="toc-preview-item"
							style="padding-left: {Math.max(0, item.level - 2) * 0.75}rem"
						>
							<span class="toc-level-tag">H{item.level}</span>
							<span class="toc-item-text">{item.text}</span>
							<code class="toc-item-id">#{item.id}</code>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</section>

	<!-- 8. Custom Fields Panel -->
	<section class="sidebar-card">
		<h3 class="sidebar-h3">
			<button
				type="button"
				class="sidebar-toggle"
				aria-expanded={panelState.customFields}
				aria-controls="sidebar-panel-customFields"
				onclick={() => toggleSidebarPanel('customFields')}
			>
				<span>Custom Fields</span>
				<span class="sidebar-sub">{form.customFields.length}</span>
			</button>
		</h3>

		<div id="sidebar-panel-customFields" class="sidebar-body" hidden={!panelState.customFields}>
			<button type="button" class="btn-quick-add" onclick={addCustomFieldRow}>
				+ Add Custom Field
			</button>

			{#if form.customFields.length === 0}
				<p class="empty-note">No custom metadata fields configured.</p>
			{:else}
				<div class="cf-list">
					{#each form.customFields as cf (getObjectRowKey(cf))}
						<div class="cf-row">
							<input
								type="text"
								class="side-input"
								aria-label="Custom field key"
								placeholder="Key"
								bind:value={cf.key}
							/>
							<input
								type="text"
								class="side-input"
								aria-label="Custom field value"
								placeholder="Value"
								bind:value={cf.value}
							/>
							<button type="button" class="btn-side-trash" onclick={() => removeCustomFieldRow(cf)}>
								Remove
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<!-- Quick Revision Compare shortcut if revisions exist -->
	{#if revisions.length > 0}
		<section class="sidebar-card">
			<div class="sidebar-body">
				<strong class="side-label">Recent Revisions ({revisions.length})</strong>
				<ul class="revision-list">
					{#each revisions.slice(0, 5) as rev (rev.id)}
						<li class="revision-item">
							<div class="rev-meta">
								<strong>#{rev.id} · {rev.changeType}</strong>
								<span>{new Date(rev.createdAt).toLocaleString()}</span>
							</div>
							<button type="button" class="btn-quick-add" onclick={() => onOpenRevisionDiff(rev)}>
								Diff
							</button>
						</li>
					{/each}
				</ul>
			</div>
		</section>
	{/if}
</aside>

<style>
	.editor-sidebar {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
		width: 100%;
	}

	.sidebar-card {
		background: var(--panel);
		border: 1px solid var(--line-strong);
		border-radius: 12px;
		overflow: hidden;
	}

	.sidebar-h3 {
		margin: 0;
		font-size: 0.9rem;
	}

	.sidebar-toggle {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.85rem 1.1rem;
		border: 0;
		background: var(--panel);
		color: var(--text);
		font-family: var(--font-display);
		font-size: 0.88rem;
		font-weight: 700;
		text-align: left;
		cursor: pointer;
	}

	.sidebar-toggle:hover {
		background: var(--panel2);
	}

	.sidebar-sub {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--muted);
	}

	.sidebar-body {
		padding: 0.95rem 1.1rem 1.1rem;
		border-top: 1px solid var(--line);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.sidebar-body[hidden] {
		display: none;
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

	.pw-note,
	.schedule-summary {
		margin: 0;
		font-size: 0.75rem;
		color: var(--acid);
	}

	.empty-note {
		margin: 0;
		font-size: 0.8rem;
		color: var(--muted);
	}

	.toggle-group,
	.tax-checklist {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		max-height: 190px;
		overflow-y: auto;
	}

	.cat-item-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.4rem;
	}

	.primary-badge {
		padding: 0.12rem 0.45rem;
		border-radius: 999px;
		background: rgba(220, 255, 101, 0.15);
		color: var(--acid);
		font-size: 0.68rem;
		font-weight: 700;
	}

	.btn-set-primary {
		padding: 0.12rem 0.45rem;
		border-radius: 4px;
		border: 1px solid var(--line);
		background: var(--bg-soft);
		color: var(--text-secondary);
		font-size: 0.68rem;
		cursor: pointer;
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

	.publish-secondary-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
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

	.btn-side-link {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--acid);
		text-decoration: underline;
	}

	.btn-side-trash {
		padding: 0.35rem 0.65rem;
		border-radius: 6px;
		border: 1px solid var(--coral);
		background: transparent;
		color: var(--coral);
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
	}

	.tag-chip-list,
	.available-tags-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.tag-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
		background: rgba(220, 255, 101, 0.14);
		border: 1px solid var(--acid);
		color: var(--acid);
		font-size: 0.75rem;
		font-weight: 600;
	}

	.tag-chip-remove {
		border: 0;
		background: transparent;
		color: var(--coral);
		cursor: pointer;
		font-weight: 700;
	}

	.btn-avail-tag {
		padding: 0.2rem 0.5rem;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: var(--bg-soft);
		color: var(--text-secondary);
		font-size: 0.74rem;
		cursor: pointer;
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

	.toc-header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.toc-preview-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		max-height: 220px;
		overflow-y: auto;
	}

	.toc-preview-item {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.78rem;
		color: var(--text);
	}

	.toc-level-tag {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		color: var(--acid);
		font-weight: 700;
	}

	.toc-item-text {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.toc-item-id {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		color: var(--muted);
	}

	.cf-list {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.cf-row {
		display: grid;
		grid-template-columns: 1fr 1fr auto;
		gap: 0.35rem;
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
