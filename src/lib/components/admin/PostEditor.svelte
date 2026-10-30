<script lang="ts">
	import PostEditorTopBar from './PostEditorTopBar.svelte';
	import PostEditorMainColumn from './PostEditorMainColumn.svelte';
	import PostEditorSidebar from './PostEditorSidebar.svelte';
	import MediaLibrary, { type MediaInsertPayload } from './MediaLibrary.svelte';
	import RevisionDiffViewer from './RevisionDiffViewer.svelte';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import {
		createEmptyForm,
		hydrateFromFullPost,
		buildPostPayload,
		canonicalFieldsAfterSave,
		saveLocalDraftSnapshot,
		readLocalDraftSnapshot,
		clearLocalDraftSnapshot,
		attachEditorShortcuts,
		attachBeforeUnloadGuard,
		type PostEditorFormState
	} from './post-editor/form-actions';
	import { generateSlug, normaliseSlug, isValidSlug } from '#lib/shared/seo/slug';
	import { getSeoScore } from '#lib/shared/seo/score';
	import {
		createPostRpc,
		updatePostRpc,
		autosavePostRpc,
		checkSlugAvailableRpc,
		restoreRevisionRpc,
		createCategoryRpc,
		createTagRpc,
		getPostFull
	} from '../../../routes/admin/posts/posts.remote';

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
		initialPost?: Record<string, unknown> | null;
		initialRevisions?: RevisionItem[];
		initialPreviewToken?: string;
		categories: CategoryOption[];
		tags: TagOption[];
		authors: AuthorOption[];
		allPosts?: RelatedPostOption[];
		onBack: () => void;
		onPostCreated?: (newPostId: number) => void;
	}

	let {
		initialPost = null,
		initialRevisions = [],
		initialPreviewToken = '',
		categories: initialCategories,
		tags: initialTags,
		authors,
		allPosts = [],
		onBack,
		onPostCreated
	}: Props = $props();

	let form = $state<PostEditorFormState>(createEmptyForm());
	let categories = $state<CategoryOption[]>([]);
	let tags = $state<TagOption[]>([]);
	let revisions = $state<RevisionItem[]>([]);
	let previewToken = $state('');
	let originalServerStatus = $state<string>('draft');

	let words = $state(0);
	let chars = $state(0);
	let readingTime = $state(1);

	let isDirty = $state(false);
	let isSaving = $state(false);
	let isFocusMode = $state(false);
	let autosaveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');

	let errorMessage = $state('');
	let statusMessage = $state('');
	let staleConflictDetected = $state(false);

	let slugAvailable = $state<boolean | null>(null);
	let slugChecking = $state(false);
	let slugDebounceTimer: ReturnType<typeof setTimeout> | null = null;

	let localRecoveryCandidate = $state<{
		savedAt: string;
		form: PostEditorFormState;
	} | null>(null);

	let mediaModalOpen = $state(false);
	let mediaPickerCallback = $state<((payload: MediaInsertPayload) => void) | null>(null);

	let activeDiffRevision = $state<RevisionItem | null>(null);
	let confirmLeaveOpen = $state(false);
	let confirmUnpublishOpen = $state(false);

	let initializedForPostId = $state<number | 'new' | null>(null);

	function hydrateInitialState() {
		const targetKey = initialPost && typeof initialPost.id === 'number' ? initialPost.id : 'new';
		if (initializedForPostId === targetKey) return;
		initializedForPostId = targetKey;

		categories = [...initialCategories];
		tags = [...initialTags];
		revisions = [...initialRevisions];
		previewToken = initialPreviewToken;

		if (initialPost) {
			form = hydrateFromFullPost(initialPost);
			originalServerStatus = String(initialPost.status ?? 'draft');
			words = form.wordCount;
			readingTime = form.readingTime;
		} else {
			form = createEmptyForm();
			originalServerStatus = 'draft';
		}

		// Check localStorage for unsaved draft snapshot newer than server updatedAt
		const snapshot = readLocalDraftSnapshot(form.id);
		if (snapshot) {
			const snapMs = Date.parse(snapshot.savedAt);
			const serverMs = form.expectedUpdatedAt ? Date.parse(form.expectedUpdatedAt) : 0;
			if (!Number.isNaN(snapMs) && snapMs > serverMs) {
				localRecoveryCandidate = snapshot;
			}
		}
	}

	let seoEvaluation = $derived(
		getSeoScore({
			title: form.title,
			slug: form.slug,
			content: form.content,
			excerpt: form.excerpt,
			metaTitle: form.metaTitle,
			metaDescription: form.metaDescription,
			coverImage: form.coverImage,
			coverImageAlt: form.coverImageAlt,
			coverImageCaption: form.coverImageCaption,
			ogTitle: form.ogTitle,
			ogDescription: form.ogDescription,
			ogImage: form.ogImage,
			twitterTitle: form.twitterTitle,
			twitterDescription: form.twitterDescription,
			authorId: form.authorId,
			categoryId: form.categoryId ?? form.categoryIds[0] ?? null,
			categoryIds: form.categoryIds,
			tagIds: form.tagIds,
			focusKeyword: form.focusKeyword,
			secondaryKeywords: JSON.stringify(form.secondaryKeywords),
			faqItems: JSON.stringify(form.faqItems),
			publishedAt: form.publishedAt || null
		})
	);

	let blockingCount = $derived(seoEvaluation.issues.filter((i) => i.blocking).length);

	function scheduleSlugCheck(slug: string) {
		if (slugDebounceTimer) clearTimeout(slugDebounceTimer);
		if (!slug || !isValidSlug(slug)) {
			slugAvailable = slug ? false : null;
			slugChecking = false;
			return;
		}
		slugChecking = true;
		slugDebounceTimer = setTimeout(async () => {
			try {
				const res = await checkSlugAvailableRpc({
					slug,
					excludePostId: form.id ?? undefined
				});
				slugAvailable = res.available;
			} catch {
				slugAvailable = null;
			} finally {
				slugChecking = false;
			}
		}, 300);
	}

	function handleTitleChange(nextTitle: string) {
		form.title = nextTitle;
		isDirty = true;
		if (!form.slugManuallyEdited) {
			const autoSlug = generateSlug(nextTitle);
			form.slug = autoSlug;
			scheduleSlugCheck(autoSlug);
		}
		saveLocalDraftSnapshot(form.id, form);
	}

	function handleSlugChange(rawSlug: string) {
		form.slugManuallyEdited = true;
		const normalized = normaliseSlug(rawSlug);
		form.slug = normalized;
		isDirty = true;
		scheduleSlugCheck(normalized);
		saveLocalDraftSnapshot(form.id, form);
	}

	function handleResetSlugFromTitle() {
		form.slugManuallyEdited = false;
		const autoSlug = generateSlug(form.title);
		form.slug = autoSlug;
		isDirty = true;
		scheduleSlugCheck(autoSlug);
	}

	function handleContentChange(html: string) {
		if (form.content === html) return;
		form.content = html;
		isDirty = true;
		saveLocalDraftSnapshot(form.id, form);
	}

	function handleStatsChange(stats: { words: number; chars: number; readingTime: number }) {
		words = stats.words;
		chars = stats.chars;
		readingTime = stats.readingTime;
		form.wordCount = stats.words;
		form.readingTime = stats.readingTime;
	}

	async function performSave(overrideStatus?: 'draft') {
		if (isSaving) return;
		isSaving = true;
		errorMessage = '';
		statusMessage = '';
		staleConflictDetected = false;

		try {
			const payload = buildPostPayload(
				form,
				overrideStatus ? { status: overrideStatus } : undefined
			);

			if (!form.id) {
				const res = await createPostRpc(payload as unknown as Parameters<typeof createPostRpc>[0]);
				const created = res.post as unknown as Record<string, unknown>;
				form = canonicalFieldsAfterSave(form, created);
				originalServerStatus = form.status;
				previewToken = res.previewToken ?? '';
				isDirty = false;
				autosaveStatus = 'saved';
				clearLocalDraftSnapshot(null);
				clearLocalDraftSnapshot(form.id);
				statusMessage = 'Post created and saved.';
				if (form.id && onPostCreated) {
					onPostCreated(form.id);
				}
			} else {
				const res = await updatePostRpc(payload as unknown as Parameters<typeof updatePostRpc>[0]);
				const updated = res.post as unknown as Record<string, unknown>;
				form = canonicalFieldsAfterSave(form, updated);
				originalServerStatus = form.status;
				if (res.revisions) revisions = res.revisions;
				if (res.previewToken) previewToken = res.previewToken;
				isDirty = false;
				autosaveStatus = 'saved';
				clearLocalDraftSnapshot(form.id);
				statusMessage =
					form.status === 'published' ? 'Published article updated.' : 'Changes saved.';
			}
		} catch (err) {
			const msg =
				err && typeof err === 'object' && 'body' in err
					? String((err as { body?: { message?: string } }).body?.message ?? 'Save failed.')
					: err instanceof Error
						? err.message
						: 'Save failed.';
			if (msg.includes('STALE_WRITE')) {
				staleConflictDetected = true;
			}
			errorMessage = msg;
		} finally {
			isSaving = false;
		}
	}

	function handlePrimarySubmitRequest() {
		// Section 13 #40: Warn when unpublishing a currently published live post
		if (
			form.id &&
			originalServerStatus === 'published' &&
			(form.status === 'draft' || form.status === 'archived')
		) {
			confirmUnpublishOpen = true;
			return;
		}
		void performSave();
	}

	async function runBackgroundAutosave() {
		if (!isDirty || isSaving) return;
		saveLocalDraftSnapshot(form.id, form);
		if (!form.id) return;

		autosaveStatus = 'saving';
		try {
			await autosavePostRpc({
				id: form.id,
				title: form.title,
				excerpt: form.excerpt || null,
				content: form.content,
				expectedUpdatedAt: form.expectedUpdatedAt ?? undefined
			});
			autosaveStatus = 'saved';
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			if (msg.includes('STALE_WRITE')) {
				staleConflictDetected = true;
			}
			autosaveStatus = 'error';
		}
	}

	async function handleReloadLatestFromServer() {
		if (!form.id) return;
		staleConflictDetected = false;
		errorMessage = '';
		try {
			const res = await getPostFull({ id: form.id });
			form = hydrateFromFullPost(res.post as unknown as Record<string, unknown>);
			revisions = res.revisions ?? [];
			previewToken = res.previewToken ?? '';
			originalServerStatus = form.status;
			isDirty = false;
			clearLocalDraftSnapshot(form.id);
			statusMessage = 'Reloaded latest version from server.';
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Could not reload server version.';
		}
	}

	async function handleRestoreRevision(revisionId: number) {
		if (!form.id) return;
		activeDiffRevision = null;
		errorMessage = '';
		try {
			const res = await restoreRevisionRpc({ postId: form.id, revisionId });
			form = hydrateFromFullPost(res.post as unknown as Record<string, unknown>);
			revisions = res.revisions ?? [];
			isDirty = false;
			statusMessage = `Restored revision #${revisionId}.`;
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to restore revision.';
		}
	}

	async function handleQuickCreateCategory(name: string) {
		try {
			const slug = generateSlug(name);
			const res = await createCategoryRpc({ name, slug });
			categories = [...categories, res.category];
			if (!form.categoryIds.includes(res.category.id)) {
				form.categoryIds = [...form.categoryIds, res.category.id];
			}
			if (!form.categoryId) {
				form.categoryId = res.category.id;
			}
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to create category.';
		}
	}

	async function handleQuickCreateTag(name: string) {
		try {
			const slug = generateSlug(name);
			const res = await createTagRpc({ name, slug });
			tags = [...tags, res.tag];
			if (!form.tagIds.includes(res.tag.id)) {
				form.tagIds = [...form.tagIds, res.tag.id];
			}
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to create tag.';
		}
	}

	function openMediaModalFor(onPicked: (payload: MediaInsertPayload) => void) {
		mediaPickerCallback = (payload) => {
			onPicked(payload);
			mediaModalOpen = false;
			mediaPickerCallback = null;
		};
		mediaModalOpen = true;
	}

	function setupLifecycleHooks() {
		hydrateInitialState();
		const detachShortcuts = attachEditorShortcuts(window, {
			onSaveDraft: () => void performSave('draft'),
			onPublishOrSave: () => handlePrimarySubmitRequest(),
			onEscape: () => {
				if (mediaModalOpen) mediaModalOpen = false;
				if (activeDiffRevision) activeDiffRevision = null;
			}
		});
		const detachUnload = attachBeforeUnloadGuard(window, () => isDirty);
		const interval = setInterval(() => {
			void runBackgroundAutosave();
		}, 30_000);

		return () => {
			detachShortcuts();
			detachUnload();
			clearInterval(interval);
		};
	}
</script>

<div {@attach setupLifecycleHooks} class="post-editor-shell">
	<PostEditorTopBar
		postId={form.id}
		slug={form.slug}
		status={form.status}
		{words}
		{chars}
		{readingTime}
		seoScore={seoEvaluation.score}
		{blockingCount}
		{autosaveStatus}
		{isDirty}
		{isSaving}
		{isFocusMode}
		{previewToken}
		onBack={() => {
			if (isDirty) {
				confirmLeaveOpen = true;
			} else {
				onBack();
			}
		}}
		onToggleFocusMode={() => (isFocusMode = !isFocusMode)}
		onSaveDraft={() => void performSave('draft')}
		onPrimarySubmit={handlePrimarySubmitRequest}
	/>

	{#if localRecoveryCandidate}
		<div class="editor-alert is-recovery" role="region" aria-label="Local draft recovery">
			<span>
				Unsaved local draft found from {new Date(localRecoveryCandidate.savedAt).toLocaleString()}.
			</span>
			<div class="alert-actions">
				<button
					type="button"
					class="btn-alert-primary"
					onclick={() => {
						if (localRecoveryCandidate) {
							form = {
								...localRecoveryCandidate.form,
								expectedUpdatedAt: form.expectedUpdatedAt
							};
							isDirty = true;
							localRecoveryCandidate = null;
						}
					}}
				>
					Restore Local Draft
				</button>
				<button
					type="button"
					class="btn-alert-secondary"
					onclick={() => {
						clearLocalDraftSnapshot(form.id);
						localRecoveryCandidate = null;
					}}
				>
					Discard
				</button>
			</div>
		</div>
	{/if}

	{#if staleConflictDetected}
		<div class="editor-alert is-conflict" role="alert">
			<span>
				Conflict detected (STALE_WRITE): This post was modified in another tab or session.
			</span>
			<div class="alert-actions">
				<button type="button" class="btn-alert-primary" onclick={handleReloadLatestFromServer}>
					Reload Latest Server Version
				</button>
			</div>
		</div>
	{/if}

	{#if errorMessage}
		<div class="editor-alert is-error" role="alert">
			<span class="error-pre">{errorMessage}</span>
			<button type="button" class="btn-alert-secondary" onclick={() => (errorMessage = '')}>
				Dismiss
			</button>
		</div>
	{/if}

	{#if statusMessage}
		<div class="editor-alert is-status" role="status">
			<span>{statusMessage}</span>
			<button type="button" class="btn-alert-secondary" onclick={() => (statusMessage = '')}>
				Dismiss
			</button>
		</div>
	{/if}

	<div class={['editor-workspace', { 'is-focus-mode': isFocusMode }]}>
		<PostEditorMainColumn
			bind:form
			{seoEvaluation}
			{slugAvailable}
			{slugChecking}
			onTitleChange={handleTitleChange}
			onSlugChange={handleSlugChange}
			onResetSlugFromTitle={handleResetSlugFromTitle}
			onContentChange={handleContentChange}
			onStatsChange={handleStatsChange}
			onPickCoverImage={() => {
				openMediaModalFor((payload) => {
					form.coverImage = payload.url;
					if (!form.coverImageAlt && payload.alt) {
						form.coverImageAlt = payload.alt;
					}
					if (!form.coverImageCaption && payload.caption) {
						form.coverImageCaption = payload.caption;
					}
					isDirty = true;
				});
			}}
			onPickOgImage={() => {
				openMediaModalFor((payload) => {
					form.ogImage = payload.url;
					isDirty = true;
				});
			}}
			onPickTwitterImage={() => {
				openMediaModalFor((payload) => {
					form.twitterImage = payload.url;
					isDirty = true;
				});
			}}
			onOpenEditorMediaPicker={(cb) => {
				openMediaModalFor((payload) => {
					cb({
						url: payload.url,
						alt: payload.alt,
						width: payload.width,
						height: payload.height,
						caption: payload.caption,
						size: payload.size,
						align: payload.align,
						mediaId: payload.item.id
					});
				});
			}}
		/>

		{#if !isFocusMode}
			<PostEditorSidebar
				bind:form
				{categories}
				{tags}
				{authors}
				{allPosts}
				{revisions}
				{isSaving}
				onSaveDraft={() => void performSave('draft')}
				onPrimarySubmit={handlePrimarySubmitRequest}
				onQuickCreateCategory={handleQuickCreateCategory}
				onQuickCreateTag={handleQuickCreateTag}
				onOpenRevisionDiff={(rev) => (activeDiffRevision = rev)}
			/>
		{/if}
	</div>
</div>

<MediaLibrary
	mode="modal"
	isOpen={mediaModalOpen}
	onSelect={(payload) => mediaPickerCallback?.(payload)}
	onClose={() => {
		mediaModalOpen = false;
		mediaPickerCallback = null;
	}}
/>

<RevisionDiffViewer
	open={activeDiffRevision !== null}
	revision={activeDiffRevision}
	currentTitle={form.title}
	currentExcerpt={form.excerpt}
	currentContent={form.content}
	onRestore={handleRestoreRevision}
	onClose={() => (activeDiffRevision = null)}
/>

<ConfirmDialog
	open={confirmLeaveOpen}
	title="Unsaved Changes"
	message="You have unsaved edits in this article. Leave without saving?"
	confirmLabel="Leave Editor"
	variant="warning"
	onConfirm={() => {
		confirmLeaveOpen = false;
		onBack();
	}}
	onCancel={() => (confirmLeaveOpen = false)}
/>

<ConfirmDialog
	open={confirmUnpublishOpen}
	title="Unpublish Live Article"
	message="This article is currently live on /blog. Switching its status to Draft or Archived will remove it from public listings. Continue?"
	confirmLabel="Unpublish Article"
	variant="danger"
	onConfirm={() => {
		confirmUnpublishOpen = false;
		void performSave();
	}}
	onCancel={() => (confirmUnpublishOpen = false)}
/>

<style>
	.post-editor-shell {
		min-height: 100vh;
		background: var(--bg);
		display: flex;
		flex-direction: column;
	}

	.editor-alert {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.75rem 1.35rem;
		border-bottom: 1px solid var(--line);
		font-size: 0.86rem;
	}

	.editor-alert.is-recovery,
	.editor-alert.is-conflict {
		background: rgba(222, 195, 161, 0.14);
		color: var(--status-amber-text);
	}

	.editor-alert.is-error {
		background: rgba(255, 121, 105, 0.14);
		color: var(--coral);
	}

	.editor-alert.is-status {
		background: rgba(220, 255, 101, 0.12);
		color: var(--acid);
	}

	.error-pre {
		white-space: pre-line;
	}

	.alert-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-alert-primary,
	.btn-alert-secondary {
		padding: 0.38rem 0.75rem;
		border-radius: 6px;
		font-family: var(--font-sans);
		font-size: 0.8rem;
		font-weight: 700;
		cursor: pointer;
		border: 1px solid transparent;
	}

	.btn-alert-primary {
		background: var(--acid);
		color: var(--ink);
	}

	.btn-alert-secondary {
		background: var(--panel);
		border-color: var(--line-strong);
		color: var(--text);
	}

	.editor-workspace {
		max-width: 1480px;
		width: 100%;
		margin: 0 auto;
		padding: 1.5rem 1.35rem 4rem;
		display: grid;
		grid-template-columns: minmax(0, 1fr) 360px;
		gap: 1.35rem;
		align-items: start;
	}

	.editor-workspace.is-focus-mode {
		grid-template-columns: minmax(0, 960px);
		justify-content: center;
	}

	@media (max-width: 1080px) {
		.editor-workspace {
			grid-template-columns: 1fr;
		}
	}
</style>
