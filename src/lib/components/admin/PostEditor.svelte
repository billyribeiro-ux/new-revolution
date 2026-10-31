<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { beforeNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import PostEditorTopBar from './PostEditorTopBar.svelte';
	import PostEditorMainColumn from './PostEditorMainColumn.svelte';
	import PostEditorSidebar from './PostEditorSidebar.svelte';
	import MediaLibrary, { type MediaInsertPayload } from './MediaLibrary.svelte';
	import RevisionDiffViewer from './RevisionDiffViewer.svelte';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import {
		DEFAULT_NEW_POST_SCAFFOLD,
		createEmptyForm,
		hydrateFromFullPost,
		buildPostPayload,
		canonicalFieldsAfterSave,
		serializeEditorSnapshot,
		saveLocalDraftSnapshot,
		readLocalDraftSnapshot,
		clearLocalDraftSnapshot,
		attachEditorShortcuts,
		attachBeforeUnloadGuard,
		type PostEditorFormState
	} from './post-editor/form-actions';
	import { parsePublishGateRefusal, type PublishGateRefusal } from './post-editor/publish-gate';
	import { rpcErrorMessage } from './post-editor/rpc-error';
	import { pickedAlt, resolveCoverFromPick } from './post-editor/image-pick';
	import { generateSlug, normaliseSlug, isValidSlug } from '#lib/shared/seo/slug';
	import { applyPostAutofill } from '#lib/shared/seo/autofill';
	import { META_TITLE_MAX } from '#lib/shared/seo/meta-budget';
	import { getSeoScore } from '#lib/shared/seo/score';
	import type { PostStatus } from '#lib/shared/schemas/posts';
	import {
		createPostRpc,
		updatePostRpc,
		deletePostRpc,
		autosavePostRpc,
		checkSlugAvailableRpc,
		getPostRevisionDiffRpc,
		restoreRevisionRpc,
		createAuthorRpc,
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
		authors: initialAuthors,
		allPosts = [],
		onBack,
		onPostCreated
	}: Props = $props();

	let form = $state<PostEditorFormState>(createEmptyForm());
	let categories = $state<CategoryOption[]>([]);
	let tags = $state<TagOption[]>([]);
	let authorsList = $state<AuthorOption[]>([]);
	let revisions = $state.raw<RevisionItem[]>([]);
	let previewToken = $state('');
	let originalServerStatus = $state<string>('draft');
	let originalServerSlug = $state<string>('');
	let lastSavedAt = $state<string>('');

	// Non-reactive tracker (Section 4.3 & 4.9):
	// Tracks the last value copied from `form.title` into `form.metaTitle`.
	// Reset to `null` when hydrating an existing post or when the operator edits `metaTitle` manually.
	let metaTitleCopiedFrom: string | null = '';

	let mainColumnRef = $state<ReturnType<typeof PostEditorMainColumn> | null>(null);
	let gateRefusal = $state<PublishGateRefusal | null>(null);
	let gateAlertEl = $state<HTMLElement | null>(null);

	let words = $state(0);
	let chars = $state(0);
	let readingTime = $state(1);

	let isDirty = $state(false);
	let isDirtySinceAutosave = $state(false);
	let isSaving = $state(false);
	let isFocusMode = $state(false);
	let autosaveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');

	let errorMessage = $state('');
	let statusMessage = $state('');
	let staleConflictDetected = $state(false);

	let slugAvailable = $state<boolean | null>(null);
	let slugChecking = $state(false);
	let slugDebounceTimer: ReturnType<typeof setTimeout> | null = null;
	let localDraftDebounceTimer: ReturnType<typeof setTimeout> | null = null;

	let lastCleanSnapshot = '';
	let lastObservedSnapshot = '';
	let currentSnapshot = $derived(serializeEditorSnapshot(form));

	let localRecoveryCandidate = $state<{
		savedAt: string;
		form: PostEditorFormState;
	} | null>(null);

	let mediaModalOpen = $state(false);
	/** Real dimensions of the picked cover, for the sidebar preview (the server stores them on save). */
	let coverMeta = $state<{ url: string; width: number | null; height: number | null } | null>(null);
	let mediaPickerCallback = $state<((payload: MediaInsertPayload) => void) | null>(null);

	let activeDiffRevision = $state.raw<RevisionItem | null>(null);
	let pendingRestoreRevisionId = $state<number | null>(null);
	let confirmLeaveOpen = $state(false);
	let confirmTrashOpen = $state(false);
	let leaveConfirmed = false;
	let pendingClientNavigation: (() => void) | null = null;

	try {
		beforeNavigate((nav) => {
			if (!isDirty || leaveConfirmed) return;
			if (nav.type === 'leave') return;
			const destUrl = nav.to?.url;
			if (!destUrl) return;
			nav.cancel();
			const targetHref = `${destUrl.pathname}${destUrl.search}${destUrl.hash}`;
			pendingClientNavigation = () => {
				void goto(resolve(targetHref as '/'));
			};
			confirmLeaveOpen = true;
		});
	} catch {
		// Mounted outside a SvelteKit router context (e.g., standalone Vitest component test)
	}

	let pendingSaveAction = $state<{
		overrideStatus?: PostStatus;
		closeAfter?: boolean;
		forceOverwrite?: boolean;
		confirmedUnpublish?: boolean;
		confirmedSlugRename?: boolean;
	} | null>(null);
	let confirmUnpublishOpen = $state(false);
	let confirmSlugRenameOpen = $state(false);

	let customConfirmDialog = $state<{
		title: string;
		message: string;
		confirmLabel: string;
		onConfirm: () => Promise<void> | void;
	} | null>(null);

	let initializedForPostId = $state<number | 'new' | null>(null);

	function scheduleLocalDraftBackup() {
		if (localDraftDebounceTimer) {
			clearTimeout(localDraftDebounceTimer);
		}
		localDraftDebounceTimer = setTimeout(() => {
			localDraftDebounceTimer = null;
			saveLocalDraftSnapshot(form.id, form);
		}, 2000);
	}

	function markCleanSnapshot(snap = serializeEditorSnapshot(form)) {
		lastCleanSnapshot = snap;
		lastObservedSnapshot = snap;
		isDirty = false;
		isDirtySinceAutosave = false;
		if (localDraftDebounceTimer) {
			clearTimeout(localDraftDebounceTimer);
			localDraftDebounceTimer = null;
		}
	}

	function markDirty() {
		isDirty = true;
		isDirtySinceAutosave = true;
		lastObservedSnapshot = serializeEditorSnapshot(form);
		scheduleLocalDraftBackup();
	}

	function syncDirtyStateFromSnapshot(snap: string) {
		untrack(() => {
			if (snap === lastObservedSnapshot) return;
			lastObservedSnapshot = snap;
			if (snap !== lastCleanSnapshot) {
				isDirty = true;
				isDirtySinceAutosave = true;
				scheduleLocalDraftBackup();
			}
		});
	}

	function hydrateInitialState() {
		const targetKey = initialPost && typeof initialPost.id === 'number' ? initialPost.id : 'new';
		const currentPost = initialPost;
		const nextCategories = initialCategories;
		const nextTags = initialTags;
		const nextAuthors = initialAuthors;
		const nextRevisions = initialRevisions;
		const nextPreviewToken = initialPreviewToken;

		untrack(() => {
			if (initializedForPostId === targetKey) return;
			initializedForPostId = targetKey;

			categories = [...nextCategories];
			tags = [...nextTags];
			authorsList = [...nextAuthors];
			revisions = [...nextRevisions];
			previewToken = nextPreviewToken;

			if (currentPost) {
				form = hydrateFromFullPost(currentPost);
				originalServerStatus = String(currentPost.status ?? 'draft');
				originalServerSlug = String(currentPost.slug ?? '');
				metaTitleCopiedFrom = null;
				words = form.wordCount;
				readingTime = form.readingTime;
				if (form.expectedUpdatedAt) {
					lastSavedAt = new Date(form.expectedUpdatedAt).toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit'
					});
				}
			} else {
				form = createEmptyForm();
				originalServerStatus = 'draft';
				originalServerSlug = '';
				metaTitleCopiedFrom = '';
			}

			markCleanSnapshot(serializeEditorSnapshot(form));
			mainColumnRef?.refreshActiveTabFromStorage?.();

			// Check localStorage for unsaved draft snapshot newer than server updatedAt
			const snapshot = readLocalDraftSnapshot(form.id);
			if (snapshot) {
				const snapMs = Date.parse(snapshot.savedAt);
				const serverMs = form.expectedUpdatedAt ? Date.parse(form.expectedUpdatedAt) : 0;
				if (!Number.isNaN(snapMs) && snapMs > serverMs) {
					localRecoveryCandidate = snapshot;
				}
			}
		});
	}

	let seoEvaluation = $derived.by(() => {
		const autofilled = applyPostAutofill({
			title: form.title,
			content: form.content,
			excerpt: form.excerpt,
			metaTitle: form.metaTitle,
			metaDescription: form.metaDescription,
			ogTitle: form.ogTitle,
			ogDescription: form.ogDescription,
			ogImage: form.ogImage,
			twitterCardType: form.twitterCardType,
			twitterTitle: form.twitterTitle,
			twitterDescription: form.twitterDescription,
			twitterImage: form.twitterImage,
			coverImage: form.coverImage,
			coverImageAlt: form.coverImageAlt,
			coverImageCaption: form.coverImageCaption,
			focusKeyword: form.focusKeyword,
			schemaType: form.schemaType,
			language: form.language,
			canonicalUrl: form.canonicalUrl
		});

		return getSeoScore({
			title: autofilled.title,
			slug: form.slug,
			content: autofilled.content,
			excerpt: autofilled.excerpt ?? '',
			metaTitle: autofilled.metaTitle ?? '',
			metaDescription: autofilled.metaDescription ?? '',
			coverImage: autofilled.coverImage ?? '',
			coverImageAlt: autofilled.coverImageAlt ?? '',
			coverImageCaption: autofilled.coverImageCaption ?? '',
			ogTitle: autofilled.ogTitle ?? '',
			ogDescription: autofilled.ogDescription ?? '',
			ogImage: autofilled.ogImage ?? '',
			twitterTitle: autofilled.twitterTitle ?? '',
			twitterDescription: autofilled.twitterDescription ?? '',
			authorId: form.authorId,
			categoryId: form.categoryId ?? form.categoryIds[0] ?? null,
			categoryIds: form.categoryIds,
			tagIds: form.tagIds,
			focusKeyword: autofilled.focusKeyword ?? '',
			secondaryKeywords: JSON.stringify(form.secondaryKeywords),
			faqItems: JSON.stringify(form.faqItems),
			publishedAt: form.publishedAt || null
		});
	});

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
		markDirty();
		// Meta title auto-follows post title until manually edited (Section 4.3)
		if (metaTitleCopiedFrom !== null && form.metaTitle === metaTitleCopiedFrom) {
			const nextMeta = nextTitle.slice(0, META_TITLE_MAX);
			form.metaTitle = nextMeta;
			metaTitleCopiedFrom = nextMeta;
		}
		// New posts auto-derive slug from title until manually edited (Section 7.3)
		if (!form.id && !form.slugManuallyEdited) {
			const autoSlug = generateSlug(nextTitle);
			form.slug = autoSlug;
			scheduleSlugCheck(autoSlug);
		}
	}

	function handleMetaTitleManualEdit(nextMetaTitle: string) {
		form.metaTitle = nextMetaTitle;
		metaTitleCopiedFrom = null;
		markDirty();
	}

	function handleSlugChange(rawSlug: string) {
		form.slugManuallyEdited = true;
		const normalized = normaliseSlug(rawSlug);
		form.slug = normalized;
		markDirty();
		scheduleSlugCheck(normalized);
	}

	function handleSlugBlur() {
		if (!form.slug.trim() && form.title.trim()) {
			form.slug = generateSlug(form.title);
		} else if (form.slug.trim()) {
			form.slug = generateSlug(form.slug) || normaliseSlug(form.slug);
		}
		scheduleSlugCheck(form.slug);
	}

	function handleResetSlugFromTitle() {
		form.slugManuallyEdited = false;
		const autoSlug = generateSlug(form.title);
		form.slug = autoSlug;
		markDirty();
		scheduleSlugCheck(autoSlug);
	}

	function handleContentChange(html: string) {
		if (form.content === html) return;
		const wasUntouchedScaffold = !form.id && !isDirty && form.content === DEFAULT_NEW_POST_SCAFFOLD;
		form.content = html;
		if (wasUntouchedScaffold && html === DEFAULT_NEW_POST_SCAFFOLD) {
			return;
		}
		markDirty();
	}

	function handleStatsChange(stats: { words: number; chars: number; readingTime: number }) {
		words = stats.words;
		chars = stats.chars;
		readingTime = stats.readingTime;
		form.wordCount = stats.words;
		form.readingTime = stats.readingTime;
	}

	function requestSave(options: {
		overrideStatus?: PostStatus;
		closeAfter?: boolean;
		forceOverwrite?: boolean;
		confirmedUnpublish?: boolean;
		confirmedSlugRename?: boolean;
	}) {
		if (isSaving) return;

		// Pre-normalize slug before checks so rename detection is accurate
		if (!form.slug.trim() && form.title.trim()) {
			form.slug = generateSlug(form.title);
		} else if (form.slug.trim()) {
			form.slug = generateSlug(form.slug) || normaliseSlug(form.slug);
		}

		const targetStatus = options.overrideStatus ?? form.status;

		// 1. Confirm before unpublishing a currently live post (Section 8.3)
		if (
			!options.confirmedUnpublish &&
			form.id &&
			originalServerStatus === 'published' &&
			(targetStatus === 'draft' || targetStatus === 'archived')
		) {
			pendingSaveAction = options;
			confirmUnpublishOpen = true;
			return;
		}

		// 2. Confirm before renaming the slug of a published post (Section 7.11)
		if (
			!options.confirmedSlugRename &&
			form.id &&
			originalServerStatus === 'published' &&
			originalServerSlug.length > 0 &&
			form.slug !== originalServerSlug
		) {
			pendingSaveAction = options;
			confirmSlugRenameOpen = true;
			return;
		}

		void performSave(options);
	}

	async function performSave(
		options: {
			overrideStatus?: PostStatus;
			closeAfter?: boolean;
			forceOverwrite?: boolean;
		} = {}
	) {
		if (isSaving) return;
		errorMessage = '';
		gateRefusal = null;
		statusMessage = '';
		staleConflictDetected = false;

		// Pre-checks (Section 8.1)
		if (!form.title.trim()) {
			errorMessage = 'Post title is required.';
			return;
		}
		if (!form.slug.trim()) {
			form.slug = generateSlug(form.title);
		} else {
			form.slug = generateSlug(form.slug) || normaliseSlug(form.slug);
		}
		if (!isValidSlug(form.slug)) {
			errorMessage = 'Slug must be 3 to 75 lowercase alphanumeric characters separated by hyphens.';
			return;
		}
		const trimmedBody = form.content.trim();
		if (!trimmedBody || trimmedBody === '<p></p>') {
			errorMessage = 'Post content cannot be empty.';
			return;
		}

		isSaving = true;
		const snapshotBeforeSave = serializeEditorSnapshot(form);

		try {
			const payload = buildPostPayload(form, {
				...(options.overrideStatus ? { status: options.overrideStatus } : {}),
				...(options.forceOverwrite ? { forceOverwrite: true } : {})
			});

			if (!form.id) {
				const res = await createPostRpc(payload as unknown as Parameters<typeof createPostRpc>[0]);
				const created = res.post as unknown as Record<string, unknown>;
				const snapshotAfterSave = serializeEditorSnapshot(form);
				const modifiedDuringInFlightSave = snapshotBeforeSave !== snapshotAfterSave;

				if (!modifiedDuringInFlightSave) {
					form = canonicalFieldsAfterSave(form, created, { preserveBlankAutofillFields: true });
					if (options.overrideStatus) {
						form.status = (created.status as PostStatus) || options.overrideStatus;
					}
					markCleanSnapshot(serializeEditorSnapshot(form));
				} else {
					// Preserve user's in-flight edits; only adopt server ID and optimistic concurrency timestamp
					form.id = typeof created.id === 'number' ? created.id : form.id;
					if (typeof created.updatedAt === 'string') {
						form.expectedUpdatedAt = created.updatedAt;
					}
					lastCleanSnapshot = snapshotBeforeSave;
					lastObservedSnapshot = serializeEditorSnapshot(form);
					isDirty = true;
				}

				originalServerStatus = String(created.status ?? form.status);
				originalServerSlug = String(created.slug ?? form.slug);
				previewToken = res.previewToken ?? '';
				autosaveStatus = 'saved';
				lastSavedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
				clearLocalDraftSnapshot(null);
				if (!isDirty) {
					clearLocalDraftSnapshot(form.id);
				}
				statusMessage = 'Post created and saved.';
				if (options.closeAfter && !isDirty) {
					leaveConfirmed = true;
					onBack();
				} else if (form.id && onPostCreated) {
					leaveConfirmed = true;
					onPostCreated(form.id);
				}
			} else {
				const res = await updatePostRpc(payload as unknown as Parameters<typeof updatePostRpc>[0]);
				const updated = res.post as unknown as Record<string, unknown>;
				const snapshotAfterSave = serializeEditorSnapshot(form);
				const modifiedDuringInFlightSave = snapshotBeforeSave !== snapshotAfterSave;

				if (!modifiedDuringInFlightSave) {
					form = canonicalFieldsAfterSave(form, updated, { preserveBlankAutofillFields: true });
					if (options.overrideStatus) {
						form.status = (updated.status as PostStatus) || options.overrideStatus;
					}
					markCleanSnapshot(serializeEditorSnapshot(form));
				} else {
					if (typeof updated.updatedAt === 'string') {
						form.expectedUpdatedAt = updated.updatedAt;
					}
					lastCleanSnapshot = snapshotBeforeSave;
					lastObservedSnapshot = serializeEditorSnapshot(form);
					isDirty = true;
				}

				originalServerStatus = String(updated.status ?? form.status);
				originalServerSlug = String(updated.slug ?? form.slug);
				if (res.revisions) revisions = res.revisions;
				if (res.previewToken) previewToken = res.previewToken;
				autosaveStatus = 'saved';
				lastSavedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
				if (!isDirty) {
					clearLocalDraftSnapshot(form.id);
				}
				statusMessage =
					form.status === 'published' ? 'Published article updated.' : 'Changes saved.';
				if (options.closeAfter && !isDirty) {
					leaveConfirmed = true;
					onBack();
				}
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
			const refusal = parsePublishGateRefusal(msg);
			if (refusal) {
				await showGateRefusal(refusal);
			} else {
				errorMessage = msg;
			}
		} finally {
			isSaving = false;
		}
	}

	/**
	 * Shows a publish-gate refusal where the owner can see it: in an alert at the top of the editor, with each issue
	 * listed, and the SEO panel opened. Focus moves to the alert so screen reader users hear it.
	 */
	async function showGateRefusal(refusal: PublishGateRefusal) {
		gateRefusal = refusal;
		mainColumnRef?.revealSeoPanel();
		await tick();
		gateAlertEl?.scrollIntoView({ block: 'center' });
		gateAlertEl?.focus();
	}

	function handleSaveAndStay() {
		requestSave({ closeAfter: false });
	}

	function handleSaveDraft() {
		requestSave({ overrideStatus: 'draft', closeAfter: false });
	}

	function handlePrimarySubmitRequest() {
		const targetStatus: PostStatus = form.status === 'scheduled' ? 'scheduled' : 'published';
		requestSave({ overrideStatus: targetStatus, closeAfter: true });
	}

	async function handleMoveToTrashConfirmed() {
		if (!form.id || isSaving) return;
		confirmTrashOpen = false;
		isSaving = true;
		errorMessage = '';
		try {
			await deletePostRpc({ id: form.id, permanent: false });
			clearLocalDraftSnapshot(form.id);
			markCleanSnapshot(serializeEditorSnapshot(form));
			leaveConfirmed = true;
			onBack();
		} catch (err) {
			errorMessage = rpcErrorMessage(err, 'Failed to move post to trash.');
		} finally {
			isSaving = false;
		}
	}

	async function runBackgroundAutosave() {
		if (!isDirtySinceAutosave || isSaving) return;
		saveLocalDraftSnapshot(form.id, form);
		if (!form.id) {
			isDirtySinceAutosave = false;
			return;
		}

		autosaveStatus = 'saving';
		try {
			await autosavePostRpc({
				id: form.id,
				title: form.title,
				excerpt: form.excerpt || null,
				content: form.content,
				expectedUpdatedAt: form.expectedUpdatedAt ?? undefined
			});
			isDirtySinceAutosave = false;
			autosaveStatus = 'saved';
			lastSavedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
			originalServerSlug = form.slug;
			metaTitleCopiedFrom = null;
			markCleanSnapshot(serializeEditorSnapshot(form));
			clearLocalDraftSnapshot(form.id);
			statusMessage = 'Reloaded latest version from server.';
		} catch (err) {
			errorMessage = rpcErrorMessage(err, 'Could not reload server version.');
		}
	}

	async function handleOpenRevisionDiff(rev: RevisionItem) {
		if (rev.contentSnapshot !== undefined || !form.id) {
			activeDiffRevision = rev;
			return;
		}
		try {
			const res = await getPostRevisionDiffRpc({
				postId: form.id,
				revisionId: rev.id
			});
			activeDiffRevision = res.revision;
		} catch {
			activeDiffRevision = rev;
		}
	}

	async function handleRestoreRevision(revisionId: number) {
		if (!form.id) return;
		pendingRestoreRevisionId = null;
		activeDiffRevision = null;
		errorMessage = '';
		try {
			const res = await restoreRevisionRpc({ postId: form.id, revisionId });
			form = hydrateFromFullPost(res.post as unknown as Record<string, unknown>);
			revisions = res.revisions ?? [];
			metaTitleCopiedFrom = null;
			markCleanSnapshot(serializeEditorSnapshot(form));
			statusMessage = `Restored revision #${revisionId}.`;
		} catch (err) {
			errorMessage = rpcErrorMessage(err, 'Failed to restore revision.');
		}
	}

	async function handleQuickCreateAuthor(name: string) {
		try {
			const slug = generateSlug(name);
			const res = await createAuthorRpc({ name, slug });
			authorsList = [...authorsList, res.author];
			form.authorId = res.author.id;
			markDirty();
		} catch (err) {
			errorMessage = rpcErrorMessage(err, 'Failed to create author.');
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
			markDirty();
		} catch (err) {
			errorMessage = rpcErrorMessage(err, 'Failed to create category.');
		}
	}

	async function handleQuickCreateTag(name: string) {
		try {
			const slug = generateSlug(name);
			const res = await createTagRpc({ name, slug });
			tags = [...tags, res.tag];
			if (!form.tagIds.includes(res.tag.id)) {
				form.tagIds = Array.from(new Set([...form.tagIds, res.tag.id]));
			}
			markDirty();
		} catch (err) {
			errorMessage = rpcErrorMessage(err, 'Failed to create tag.');
		}
	}

	/** Featured image picked from the library: default variant is `large`; alt is never invented. */
	function handlePickCoverImage() {
		openMediaModalFor((payload) => {
			const cover = resolveCoverFromPick(payload);
			form.coverImage = cover.url;
			form.coverImageAlt = cover.alt;
			form.coverImageCaption = cover.caption;
			coverMeta = { url: cover.url, width: cover.width, height: cover.height };
			if (!form.ogImage) {
				form.ogImage = cover.url;
			}
			markDirty();
		});
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
		return untrack(() => {
			const detachShortcuts = attachEditorShortcuts(window, {
				onSaveDraft: () => handleSaveAndStay(),
				onSaveDraftShortcut: () => handleSaveDraft(),
				onPublishOrSave: () => handlePrimarySubmitRequest(),
				isModalOpen: () =>
					mediaModalOpen ||
					activeDiffRevision !== null ||
					pendingRestoreRevisionId !== null ||
					confirmLeaveOpen ||
					confirmUnpublishOpen ||
					confirmSlugRenameOpen ||
					confirmTrashOpen ||
					customConfirmDialog !== null,
				onEscape: () => {
					if (customConfirmDialog !== null) {
						customConfirmDialog = null;
						return;
					}
					if (confirmUnpublishOpen) {
						confirmUnpublishOpen = false;
						pendingSaveAction = null;
						return;
					}
					if (confirmSlugRenameOpen) {
						confirmSlugRenameOpen = false;
						pendingSaveAction = null;
						return;
					}
					if (confirmTrashOpen) {
						confirmTrashOpen = false;
						return;
					}
					if (confirmLeaveOpen) {
						confirmLeaveOpen = false;
						pendingClientNavigation = null;
						return;
					}
					if (pendingRestoreRevisionId !== null) {
						pendingRestoreRevisionId = null;
						return;
					}
					if (mediaModalOpen) {
						mediaModalOpen = false;
						return;
					}
					if (activeDiffRevision) {
						activeDiffRevision = null;
						return;
					}
					if (isDirty) {
						confirmLeaveOpen = true;
					} else {
						onBack();
					}
				}
			});
			const detachUnload = attachBeforeUnloadGuard(window, () => isDirty);
			const interval = setInterval(() => {
				void runBackgroundAutosave();
			}, 60_000);

			return () => {
				detachShortcuts();
				detachUnload();
				clearInterval(interval);
				if (slugDebounceTimer) clearTimeout(slugDebounceTimer);
				if (localDraftDebounceTimer) clearTimeout(localDraftDebounceTimer);
			};
		});
	}
</script>

<div
	{@attach () => {
		hydrateInitialState();
	}}
	{@attach () => {
		syncDirtyStateFromSnapshot(currentSnapshot);
	}}
	{@attach setupLifecycleHooks}
	class="post-editor-shell"
>
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
		{lastSavedAt}
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
		onSaveAndStay={handleSaveAndStay}
		onSaveDraft={handleSaveDraft}
		onPrimarySubmit={handlePrimarySubmitRequest}
		onRetryAutosave={() => {
			isDirtySinceAutosave = true;
			void runBackgroundAutosave();
		}}
	/>

	{#if localRecoveryCandidate}
		<div class="editor-alert is-recovery" role="region" aria-label="Local draft recovery">
			<span>
				Recovered unsaved draft from {new Date(localRecoveryCandidate.savedAt).toLocaleString()},
				Restore or Discard.
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
							markDirty();
							localRecoveryCandidate = null;
						}
					}}
				>
					Restore
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
					Reload latest
				</button>
				<button
					type="button"
					class="btn-alert-secondary"
					onclick={() =>
						requestSave({
							forceOverwrite: true,
							confirmedUnpublish: true,
							confirmedSlugRename: true
						})}
				>
					Overwrite
				</button>
			</div>
		</div>
	{/if}

	{#if gateRefusal}
		<div
			{@attach (node) => {
				gateAlertEl = node;
				return () => {
					gateAlertEl = null;
				};
			}}
			class="editor-alert is-error is-gate"
			role="alert"
			tabindex="-1"
			aria-labelledby="gate-refusal-title"
		>
			<div class="gate-refusal">
				<p id="gate-refusal-title" class="gate-refusal-title">
					Publishing is blocked by the SEO check. {gateRefusal.summary}
				</p>
				{#if gateRefusal.errors.length > 0}
					<p class="gate-refusal-label">Fix these before publishing (blocking items are marked):</p>
					<ul class="gate-refusal-list">
						{#each gateRefusal.errors as issue, i (i)}
							<li>
								<span class="gate-tag">{issue.blocking ? 'Blocking' : 'Error'}</span>
								{issue.message}{issue.points === null ? '' : ` (-${issue.points})`}
							</li>
						{/each}
					</ul>
				{/if}
				{#if gateRefusal.warnings.length > 0}
					<p class="gate-refusal-label">Warnings:</p>
					<ul class="gate-refusal-list">
						{#each gateRefusal.warnings as issue, i (i)}
							<li>
								<span class="gate-tag">Warning</span>
								{issue.message}{issue.points === null ? '' : ` (-${issue.points})`}
							</li>
						{/each}
					</ul>
				{/if}
				<p class="gate-refusal-label">
					The full checklist is in the SEO &amp; Search Preview panel.
				</p>
			</div>
			<button type="button" class="btn-alert-secondary" onclick={() => (gateRefusal = null)}>
				Dismiss
			</button>
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
			bind:this={mainColumnRef}
			bind:form
			{seoEvaluation}
			{slugAvailable}
			{slugChecking}
			{revisions}
			onTitleChange={handleTitleChange}
			onSlugChange={handleSlugChange}
			onSlugBlur={handleSlugBlur}
			onResetSlugFromTitle={handleResetSlugFromTitle}
			onMetaTitleManualEdit={handleMetaTitleManualEdit}
			onContentChange={handleContentChange}
			onStatsChange={handleStatsChange}
			onInspectRevision={(rev) => void handleOpenRevisionDiff(rev)}
			onPickCoverImage={handlePickCoverImage}
			onPickOgImage={() => {
				openMediaModalFor((payload) => {
					form.ogImage = payload.url;
					markDirty();
				});
			}}
			onPickTwitterImage={() => {
				openMediaModalFor((payload) => {
					form.twitterImage = payload.url;
					markDirty();
				});
			}}
			onOpenEditorMediaPicker={(cb) => {
				openMediaModalFor((payload) => {
					cb({
						url: payload.url,
						alt: pickedAlt(payload),
						width: payload.width,
						height: payload.height,
						caption: payload.caption,
						size: payload.size,
						align: payload.align,
						linkUrl: payload.linkUrl,
						mediaId: payload.item.id
					});
				});
			}}
		/>

		{#if !isFocusMode}
			<PostEditorSidebar
				bind:form
				coverDimensions={coverMeta && coverMeta.url === form.coverImage
					? { width: coverMeta.width, height: coverMeta.height }
					: null}
				{categories}
				{tags}
				authors={authorsList}
				{allPosts}
				{revisions}
				{isSaving}
				{previewToken}
				onSaveDraft={handleSaveDraft}
				onPrimarySubmit={handlePrimarySubmitRequest}
				onMoveToTrash={() => (confirmTrashOpen = true)}
				onPickCoverImage={handlePickCoverImage}
				onQuickCreateAuthor={handleQuickCreateAuthor}
				onQuickCreateCategory={handleQuickCreateCategory}
				onQuickCreateTag={handleQuickCreateTag}
				onOpenRevisionDiff={(rev) => void handleOpenRevisionDiff(rev)}
				onRequestConfirm={(opts) => {
					customConfirmDialog = opts;
				}}
			/>
		{/if}
	</div>

	<!-- Sticky Mobile Bottom Action Bar (<= 960px, Section 4.1) -->
	<div class="mobile-sticky-action-bar" role="region" aria-label="Mobile quick actions">
		<button
			type="button"
			class="btn-alert-secondary"
			disabled={isSaving}
			onclick={handleSaveAndStay}
		>
			Save
		</button>
		<button
			type="button"
			class="btn-alert-primary"
			disabled={isSaving}
			onclick={handlePrimarySubmitRequest}
		>
			{form.status === 'scheduled'
				? 'Schedule'
				: form.id && form.status === 'published'
					? 'Update and close'
					: 'Publish'}
		</button>
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
	onRestore={(revId) => {
		pendingRestoreRevisionId = revId;
	}}
	onClose={() => (activeDiffRevision = null)}
/>

<ConfirmDialog
	open={pendingRestoreRevisionId !== null}
	title="Restore this revision?"
	message="Any unsaved changes in the editor will be lost."
	confirmLabel="Restore"
	variant="warning"
	onConfirm={() => {
		if (pendingRestoreRevisionId !== null) {
			void handleRestoreRevision(pendingRestoreRevisionId);
		}
	}}
	onCancel={() => (pendingRestoreRevisionId = null)}
/>

<ConfirmDialog
	open={confirmLeaveOpen}
	title="Discard unsaved changes?"
	message="You have unsaved edits in this article. Leave without saving?"
	confirmLabel="Discard"
	variant="warning"
	onConfirm={() => {
		confirmLeaveOpen = false;
		leaveConfirmed = true;
		const replay = pendingClientNavigation;
		pendingClientNavigation = null;
		if (replay) {
			replay();
		} else {
			onBack();
		}
	}}
	onCancel={() => {
		confirmLeaveOpen = false;
		pendingClientNavigation = null;
	}}
/>

<ConfirmDialog
	open={confirmUnpublishOpen}
	title="Unpublish Live Article"
	message="This unpublishes the post and notifies search engines"
	confirmLabel="Unpublish Article"
	variant="danger"
	onConfirm={() => {
		confirmUnpublishOpen = false;
		const next = pendingSaveAction ?? {};
		pendingSaveAction = null;
		requestSave({ ...next, confirmedUnpublish: true });
	}}
	onCancel={() => {
		confirmUnpublishOpen = false;
		pendingSaveAction = null;
	}}
/>

<ConfirmDialog
	open={confirmSlugRenameOpen}
	title="Rename Published Post URL"
	message="Renaming a published post creates a permanent redirect from the old URL"
	confirmLabel="Rename & Create Redirect"
	variant="warning"
	onConfirm={() => {
		confirmSlugRenameOpen = false;
		const next = pendingSaveAction ?? {};
		pendingSaveAction = null;
		requestSave({ ...next, confirmedSlugRename: true });
	}}
	onCancel={() => {
		confirmSlugRenameOpen = false;
		pendingSaveAction = null;
	}}
/>

<ConfirmDialog
	open={confirmTrashOpen}
	title="Move post to Trash?"
	message="This post will be soft-deleted and removed from public blog listings."
	confirmLabel="Move to Trash"
	variant="danger"
	onConfirm={() => {
		void handleMoveToTrashConfirmed();
	}}
	onCancel={() => (confirmTrashOpen = false)}
/>

<ConfirmDialog
	open={customConfirmDialog !== null}
	title={customConfirmDialog?.title ?? 'Confirm Action'}
	message={customConfirmDialog?.message ?? ''}
	confirmLabel={customConfirmDialog?.confirmLabel ?? 'Confirm'}
	variant="warning"
	onConfirm={() => {
		const cb = customConfirmDialog?.onConfirm;
		customConfirmDialog = null;
		if (cb) void cb();
	}}
	onCancel={() => (customConfirmDialog = null)}
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

	.gate-refusal {
		display: grid;
		gap: 0.35rem;
		flex: 1 1 auto;
		min-width: 0;
	}

	.gate-refusal-title,
	.gate-refusal-label {
		margin: 0;
	}

	.gate-refusal-list {
		margin: 0;
		padding-left: 1.25rem;
	}

	.gate-tag {
		font-weight: 700;
		text-transform: uppercase;
		font-size: 0.75em;
		letter-spacing: 0.04em;
		margin-right: 0.35rem;
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
		grid-template-columns: minmax(0, 1fr) minmax(280px, 320px);
		gap: 1.35rem;
		align-items: start;
	}

	.editor-workspace.is-focus-mode {
		grid-template-columns: minmax(0, 960px);
		justify-content: center;
	}

	.mobile-sticky-action-bar {
		display: none;
	}

	@media (max-width: 960px) {
		.editor-workspace {
			grid-template-columns: 1fr;
			padding-bottom: 5.5rem;
		}

		.mobile-sticky-action-bar {
			position: sticky;
			bottom: 0;
			z-index: 55;
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 0.75rem;
			padding: 0.75rem 1.25rem;
			background: var(--panel);
			border-top: 1px solid var(--line-strong);
		}

		.mobile-sticky-action-bar button {
			flex: 1;
			padding: 0.55rem 0.9rem;
		}
	}

	@media (max-width: 768px) {
		.editor-workspace {
			padding: 1rem 0.95rem 5.5rem;
		}
	}

	@media (max-width: 640px) {
		.editor-workspace {
			padding: 0.75rem 0.65rem 5.5rem;
		}
	}
</style>
