<script lang="ts">
	import { resolve } from '$app/paths';
	import ConfirmDialog from '#lib/components/admin/ConfirmDialog.svelte';
	import { attachBeforeUnloadGuard } from '#lib/components/admin/post-editor/form-actions';
	import { rpcErrorMessage } from '#lib/components/admin/post-editor/rpc-error';
	import { POST_STATUSES, type PostStatus } from '#lib/shared/schemas/posts';
	import { META_DESCRIPTION_MAX, META_TITLE_MAX } from '#lib/shared/seo/meta-budget';
	import { generateSlug, normaliseSlug } from '#lib/shared/seo/slug';
	import {
		quickUpdatePostRpc,
		deletePostRpc,
		restorePostRpc,
		emptyTrashRpc,
		createAuthorRpc,
		updateAuthorRpc,
		deleteAuthorRpc,
		createCategoryRpc,
		updateCategoryRpc,
		deleteCategoryRpc,
		createTagRpc,
		updateTagRpc,
		deleteTagRpc
	} from './posts.remote';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	type AdminView = 'posts' | 'trash' | 'authors' | 'categories' | 'tags';
	let activeView = $state<AdminView>('posts');
	let pendingViewSwitch = $state<AdminView | null>(null);

	let posts = $state<PageData['posts']>([]);
	let trashedPosts = $state<PageData['trashedPosts']>([]);
	let categories = $state<PageData['categories']>([]);
	let tags = $state<PageData['tags']>([]);
	let authors = $state<PageData['authors']>([]);

	function hydrateData() {
		posts = [...data.posts];
		trashedPosts = [...data.trashedPosts];
		categories = [...data.categories];
		tags = [...data.tags];
		authors = [...data.authors];
		if (typeof window !== 'undefined') {
			return attachBeforeUnloadGuard(window, () => anySubFormDirty);
		}
		return undefined;
	}

	// Filters for Posts view
	let searchQuery = $state('');
	let statusFilter = $state<string>('all');
	let categoryFilter = $state<number | 'all'>('all');
	let authorFilter = $state<number | 'all'>('all');

	let bannerError = $state('');
	let bannerStatus = $state('');

	// Quick edit state
	let quickEditId = $state<number | null>(null);
	let quickEditTitle = $state('');
	let quickEditSlug = $state('');
	let quickEditStatus = $state<PostStatus>('draft');
	let quickEditAuthorId = $state<number | null>(null);
	let quickEditCategoryId = $state<number | null>(null);
	let quickEditFeatured = $state(false);
	let quickEditPillar = $state(false);
	let quickEditSticky = $state(false);
	let quickEditError = $state('');
	let quickEditSaving = $state(false);

	// Selection & confirm dialogs for Posts / Trash
	let selectedPostIds = $state<number[]>([]);
	let confirmTrashPostId = $state<number | null>(null);
	let confirmPermanentDeleteId = $state<number | null>(null);
	let confirmRestoreId = $state<number | null>(null);
	let confirmEmptyTrashOpen = $state(false);
	let confirmDeleteAuthorId = $state<number | null>(null);
	let confirmDeleteCategoryId = $state<number | null>(null);
	let confirmDeleteTagId = $state<number | null>(null);

	// Author form state (Section 8.8)
	let editingAuthorId = $state<number | null>(null);
	let authorName = $state('');
	let authorSlug = $state('');
	let authorEmail = $state('');
	let authorJobTitle = $state('');
	let authorCompany = $state('');
	let authorCredentials = $state('');
	let authorExpertise = $state('');
	let authorYearsExperience = $state<number | ''>('');
	let authorShortBio = $state('');
	let authorBio = $state('');
	let authorAvatar = $state('');
	let authorAvatarAlt = $state('');
	let authorLinkedin = $state('');
	let authorTwitter = $state('');
	let authorWebsite = $state('');
	let authorIsActive = $state(true);
	let authorDirty = $state(false);

	// Category form state (Section 8.8)
	let editingCategoryId = $state<number | null>(null);
	let categoryName = $state('');
	let categorySlug = $state('');
	let categoryParentId = $state<number | null>(null);
	let categoryDescription = $state('');
	let categoryMetaTitle = $state('');
	let categoryMetaDescription = $state('');
	let categoryPillarContent = $state('');
	let categoryColor = $state('#dcff65');
	let categoryIsActive = $state(true);
	let categoryDirty = $state(false);

	// Tag form state (Section 8.8)
	let editingTagId = $state<number | null>(null);
	let tagName = $state('');
	let tagSlug = $state('');
	let tagDescription = $state('');
	let tagDirty = $state(false);

	let anySubFormDirty = $derived(authorDirty || categoryDirty || tagDirty);

	let filteredPosts = $derived(
		posts.filter((p) => {
			if (statusFilter !== 'all' && p.status !== statusFilter) return false;
			if (categoryFilter !== 'all' && p.categoryId !== categoryFilter) return false;
			if (authorFilter !== 'all' && p.authorId !== authorFilter) return false;
			if (searchQuery.trim()) {
				const q = searchQuery.trim().toLowerCase();
				if (!p.title.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) {
					return false;
				}
			}
			return true;
		})
	);

	function requestViewSwitch(nextView: AdminView) {
		if (nextView === activeView) return;
		if (anySubFormDirty) {
			pendingViewSwitch = nextView;
			return;
		}
		activeView = nextView;
	}

	function openQuickEdit(post: PageData['posts'][number]) {
		quickEditId = post.id;
		quickEditTitle = post.title;
		quickEditSlug = post.slug;
		quickEditStatus = post.status as PostStatus;
		quickEditAuthorId = post.authorId;
		quickEditCategoryId = post.categoryId;
		quickEditFeatured = Boolean(post.featured);
		quickEditPillar = Boolean(post.isPillar);
		quickEditSticky = Boolean(post.isSticky);
		quickEditError = '';
	}

	async function saveQuickEdit(postId: number) {
		quickEditSaving = true;
		quickEditError = '';
		try {
			const res = await quickUpdatePostRpc({
				id: postId,
				title: quickEditTitle,
				slug: normaliseSlug(quickEditSlug),
				status: quickEditStatus,
				authorId: quickEditAuthorId,
				categoryId: quickEditCategoryId,
				featured: quickEditFeatured,
				isPillar: quickEditPillar,
				isSticky: quickEditSticky
			});
			posts = posts.map((p) => (p.id === postId ? { ...p, ...res.post } : p));
			quickEditId = null;
			bannerStatus = 'Post updated via quick edit.';
		} catch (err) {
			quickEditError = rpcErrorMessage(err, 'Quick edit failed.');
		} finally {
			quickEditSaving = false;
		}
	}

	async function handleTrashPost(postId: number) {
		confirmTrashPostId = null;
		bannerError = '';
		try {
			const target = posts.find((p) => p.id === postId);
			await deletePostRpc({ id: postId, permanent: false });
			posts = posts.filter((p) => p.id !== postId);
			if (target) {
				trashedPosts = [{ ...target, deletedAt: new Date() }, ...trashedPosts];
			}
			bannerStatus = 'Post moved to Trash.';
		} catch (err) {
			bannerError = rpcErrorMessage(err, 'Failed to move post to Trash.');
		}
	}

	async function handleBulkTrash() {
		if (selectedPostIds.length === 0) return;
		const failed: number[] = [];
		for (const id of selectedPostIds) {
			try {
				const target = posts.find((p) => p.id === id);
				await deletePostRpc({ id, permanent: false });
				posts = posts.filter((p) => p.id !== id);
				if (target) {
					trashedPosts = [{ ...target, deletedAt: new Date() }, ...trashedPosts];
				}
			} catch {
				failed.push(id);
			}
		}
		selectedPostIds = failed;
		if (failed.length > 0) {
			bannerError = `Failed to trash ${failed.length} post(s). Kept failed items selected.`;
		} else {
			bannerStatus = 'Selected posts moved to Trash.';
		}
	}

	async function handleRestorePost(postId: number) {
		confirmRestoreId = null;
		bannerError = '';
		try {
			const res = await restorePostRpc({ id: postId });
			trashedPosts = trashedPosts.filter((p) => p.id !== postId);
			posts = [res.post as PageData['posts'][number], ...posts];
			bannerStatus = 'Post restored from Trash.';
		} catch (err) {
			bannerError = rpcErrorMessage(err, 'Failed to restore post.');
		}
	}

	async function handlePermanentDelete(postId: number) {
		confirmPermanentDeleteId = null;
		bannerError = '';
		try {
			await deletePostRpc({ id: postId, permanent: true });
			trashedPosts = trashedPosts.filter((p) => p.id !== postId);
			bannerStatus = 'Post permanently deleted.';
		} catch (err) {
			bannerError = rpcErrorMessage(err, 'Failed to delete post.');
		}
	}

	async function handleEmptyTrash() {
		confirmEmptyTrashOpen = false;
		bannerError = '';
		try {
			const res = await emptyTrashRpc();
			trashedPosts = [];
			bannerStatus = `Emptied Trash (${res.deletedCount} post(s) permanently deleted).`;
		} catch (err) {
			bannerError = rpcErrorMessage(err, 'Failed to empty Trash.');
		}
	}

	// Author CRUD handlers
	function resetAuthorForm() {
		editingAuthorId = null;
		authorName = '';
		authorSlug = '';
		authorEmail = '';
		authorJobTitle = '';
		authorCompany = '';
		authorCredentials = '';
		authorExpertise = '';
		authorYearsExperience = '';
		authorShortBio = '';
		authorBio = '';
		authorAvatar = '';
		authorAvatarAlt = '';
		authorLinkedin = '';
		authorTwitter = '';
		authorWebsite = '';
		authorIsActive = true;
		authorDirty = false;
	}

	let pendingDiscardAction = $state<(() => void) | null>(null);

	function applyAuthorFields(a: PageData['authors'][number]) {
		editingAuthorId = a.id;
		authorName = a.name;
		authorSlug = a.slug;
		authorEmail = a.email ?? '';
		authorJobTitle = a.jobTitle ?? '';
		authorCompany = a.company ?? '';
		authorCredentials = a.credentials ?? '';
		authorExpertise = a.expertise ?? '';
		authorYearsExperience = a.yearsExperience ?? '';
		authorShortBio = a.shortBio ?? '';
		authorBio = a.bio ?? '';
		authorAvatar = a.avatar ?? '';
		authorAvatarAlt = a.avatarAlt ?? '';
		authorLinkedin = a.linkedin ?? '';
		authorTwitter = a.twitter ?? '';
		authorWebsite = a.website ?? '';
		authorIsActive = a.isActive;
		authorDirty = false;
	}

	function editAuthor(a: PageData['authors'][number]) {
		if (authorDirty && editingAuthorId !== a.id) {
			pendingDiscardAction = () => applyAuthorFields(a);
			return;
		}
		applyAuthorFields(a);
	}

	async function saveAuthor() {
		bannerError = '';
		try {
			const payload = {
				name: authorName.trim(),
				slug: normaliseSlug(authorSlug || generateSlug(authorName)),
				email: authorEmail.trim() || null,
				jobTitle: authorJobTitle.trim() || null,
				company: authorCompany.trim() || null,
				credentials: authorCredentials.trim() || null,
				expertise: authorExpertise.trim() || null,
				yearsExperience: authorYearsExperience === '' ? null : Number(authorYearsExperience),
				shortBio: authorShortBio.trim() || null,
				bio: authorBio.trim() || null,
				avatar: authorAvatar.trim() || null,
				avatarAlt: authorAvatarAlt.trim() || null,
				linkedin: authorLinkedin.trim() || null,
				twitter: authorTwitter.trim() || null,
				website: authorWebsite.trim() || null,
				isActive: authorIsActive
			};
			if (editingAuthorId) {
				const res = await updateAuthorRpc({ id: editingAuthorId, ...payload });
				authors = authors.map((a) => (a.id === editingAuthorId ? res.author : a));
				bannerStatus = 'Author updated.';
			} else {
				const res = await createAuthorRpc(payload);
				authors = [...authors, res.author];
				bannerStatus = 'Author created.';
			}
			resetAuthorForm();
		} catch (err) {
			bannerError = rpcErrorMessage(err, 'Failed to save author.');
		}
	}

	async function handleDeleteAuthor(id: number) {
		confirmDeleteAuthorId = null;
		try {
			await deleteAuthorRpc({ id });
			authors = authors.filter((a) => a.id !== id);
			bannerStatus = 'Author deleted.';
		} catch (err) {
			bannerError = rpcErrorMessage(err, 'Failed to delete author.');
		}
	}

	// Category CRUD handlers
	function resetCategoryForm() {
		editingCategoryId = null;
		categoryName = '';
		categorySlug = '';
		categoryParentId = null;
		categoryDescription = '';
		categoryMetaTitle = '';
		categoryMetaDescription = '';
		categoryPillarContent = '';
		categoryColor = '#dcff65';
		categoryIsActive = true;
		categoryDirty = false;
	}

	function applyCategoryFields(c: PageData['categories'][number]) {
		editingCategoryId = c.id;
		categoryName = c.name;
		categorySlug = c.slug;
		categoryParentId = c.parentId ?? null;
		categoryDescription = c.description ?? '';
		categoryMetaTitle = c.metaTitle ?? '';
		categoryMetaDescription = c.metaDescription ?? '';
		categoryPillarContent = c.pillarContent ?? '';
		categoryColor = c.color ?? '#dcff65';
		categoryIsActive = c.isActive;
		categoryDirty = false;
	}

	function editCategory(c: PageData['categories'][number]) {
		if (categoryDirty && editingCategoryId !== c.id) {
			pendingDiscardAction = () => applyCategoryFields(c);
			return;
		}
		applyCategoryFields(c);
	}

	async function saveCategory() {
		bannerError = '';
		try {
			const payload = {
				name: categoryName.trim(),
				slug: normaliseSlug(categorySlug || generateSlug(categoryName)),
				parentId: categoryParentId,
				description: categoryDescription.trim() || null,
				metaTitle: categoryMetaTitle.trim() || null,
				metaDescription: categoryMetaDescription.trim() || null,
				pillarContent: categoryPillarContent.trim() || null,
				color: categoryColor || '#dcff65',
				isActive: categoryIsActive
			};
			if (editingCategoryId) {
				const res = await updateCategoryRpc({ id: editingCategoryId, ...payload });
				categories = categories.map((c) => (c.id === editingCategoryId ? res.category : c));
				bannerStatus = 'Category updated.';
			} else {
				const res = await createCategoryRpc(payload);
				categories = [...categories, res.category];
				bannerStatus = 'Category created.';
			}
			resetCategoryForm();
		} catch (err) {
			bannerError = rpcErrorMessage(err, 'Failed to save category.');
		}
	}

	async function handleDeleteCategory(id: number) {
		confirmDeleteCategoryId = null;
		try {
			await deleteCategoryRpc({ id });
			categories = categories.filter((c) => c.id !== id);
			bannerStatus = 'Category deleted.';
		} catch (err) {
			bannerError = rpcErrorMessage(err, 'Failed to delete category.');
		}
	}

	// Tag CRUD handlers
	function resetTagForm() {
		editingTagId = null;
		tagName = '';
		tagSlug = '';
		tagDescription = '';
		tagDirty = false;
	}

	function applyTagFields(t: PageData['tags'][number]) {
		editingTagId = t.id;
		tagName = t.name;
		tagSlug = t.slug;
		tagDescription = t.description ?? '';
		tagDirty = false;
	}

	function editTag(t: PageData['tags'][number]) {
		if (tagDirty && editingTagId !== t.id) {
			pendingDiscardAction = () => applyTagFields(t);
			return;
		}
		applyTagFields(t);
	}

	async function saveTag() {
		bannerError = '';
		try {
			const payload = {
				name: tagName.trim(),
				slug: normaliseSlug(tagSlug || generateSlug(tagName)),
				description: tagDescription.trim() || null
			};
			if (editingTagId) {
				const res = await updateTagRpc({ id: editingTagId, ...payload });
				tags = tags.map((t) => (t.id === editingTagId ? res.tag : t));
				bannerStatus = 'Tag updated.';
			} else {
				const res = await createTagRpc(payload);
				tags = [...tags, res.tag];
				bannerStatus = 'Tag created.';
			}
			resetTagForm();
		} catch (err) {
			bannerError = rpcErrorMessage(err, 'Failed to save tag.');
		}
	}

	async function handleDeleteTag(id: number) {
		confirmDeleteTagId = null;
		try {
			await deleteTagRpc({ id });
			tags = tags.filter((t) => t.id !== id);
			bannerStatus = 'Tag deleted.';
		} catch (err) {
			bannerError = rpcErrorMessage(err, 'Failed to delete tag.');
		}
	}
</script>

<main {@attach hydrateData} class="admin-posts-page">
	<header class="admin-header">
		<div class="admin-header-titles">
			<span class="admin-kicker">Content Management</span>
			<h1>Blog Administration</h1>
		</div>
		<div class="admin-header-actions">
			<a href={resolve('/admin/media')} class="btn-secondary">Media Library</a>
			<a href={resolve('/admin/posts/new')} class="btn-primary">+ New Post</a>
		</div>
	</header>

	{#if data.loadError}
		<div class="admin-banner is-error" role="alert">
			<span>{data.loadError}</span>
		</div>
	{/if}

	{#if bannerError}
		<div class="admin-banner is-error" role="alert">
			<span>{bannerError}</span>
			<button type="button" class="btn-dismiss" onclick={() => (bannerError = '')}>
				Dismiss
			</button>
		</div>
	{/if}

	{#if bannerStatus}
		<div class="admin-banner is-status" role="status">
			<span>{bannerStatus}</span>
			<button type="button" class="btn-dismiss" onclick={() => (bannerStatus = '')}>
				Dismiss
			</button>
		</div>
	{/if}

	<nav class="admin-view-tabs" aria-label="Blog management views">
		<button
			type="button"
			class={['view-tab', { 'is-active': activeView === 'posts' }]}
			aria-pressed={activeView === 'posts'}
			onclick={() => requestViewSwitch('posts')}
		>
			Posts ({posts.length})
		</button>
		<button
			type="button"
			class={['view-tab', { 'is-active': activeView === 'trash' }]}
			aria-pressed={activeView === 'trash'}
			onclick={() => requestViewSwitch('trash')}
		>
			Trash ({trashedPosts.length})
		</button>
		<button
			type="button"
			class={['view-tab', { 'is-active': activeView === 'authors' }]}
			aria-pressed={activeView === 'authors'}
			onclick={() => requestViewSwitch('authors')}
		>
			Authors ({authors.length})
		</button>
		<button
			type="button"
			class={['view-tab', { 'is-active': activeView === 'categories' }]}
			aria-pressed={activeView === 'categories'}
			onclick={() => requestViewSwitch('categories')}
		>
			Categories ({categories.length})
		</button>
		<button
			type="button"
			class={['view-tab', { 'is-active': activeView === 'tags' }]}
			aria-pressed={activeView === 'tags'}
			onclick={() => requestViewSwitch('tags')}
		>
			Tags ({tags.length})
		</button>
	</nav>

	{#if activeView === 'posts'}
		<section class="admin-section" aria-label="Posts list">
			<div class="filter-bar">
				<input
					type="search"
					class="admin-input"
					aria-label="Search posts by title or slug"
					placeholder="Search title or slug..."
					bind:value={searchQuery}
				/>
				<select class="admin-select" aria-label="Filter by status" bind:value={statusFilter}>
					<option value="all">All Statuses</option>
					{#each POST_STATUSES as st (st)}
						<option value={st}>{st}</option>
					{/each}
				</select>
				<select class="admin-select" aria-label="Filter by category" bind:value={categoryFilter}>
					<option value="all">All Categories</option>
					{#each categories as cat (cat.id)}
						<option value={cat.id}>{cat.name}</option>
					{/each}
				</select>
				<select class="admin-select" aria-label="Filter by author" bind:value={authorFilter}>
					<option value="all">All Authors</option>
					{#each authors as auth (auth.id)}
						<option value={auth.id}>{auth.name}</option>
					{/each}
				</select>
				{#if selectedPostIds.length > 0}
					<button type="button" class="btn-danger" onclick={handleBulkTrash}>
						Move Selected ({selectedPostIds.length}) to Trash
					</button>
				{/if}
			</div>

			{#if filteredPosts.length === 0}
				<p class="empty-state">No posts match the current filters.</p>
			{:else}
				<div class="table-wrap">
					<table class="admin-table">
						<thead>
							<tr>
								<th scope="col" class="col-check">
									<input
										type="checkbox"
										aria-label="Select all visible posts"
										checked={selectedPostIds.length === filteredPosts.length &&
											filteredPosts.length > 0}
										onchange={(e) => {
											if ((e.currentTarget as HTMLInputElement).checked) {
												selectedPostIds = filteredPosts.map((p) => p.id);
											} else {
												selectedPostIds = [];
											}
										}}
									/>
								</th>
								<th scope="col">Title & Slug</th>
								<th scope="col">Status</th>
								<th scope="col">Flags</th>
								<th scope="col">Updated</th>
								<th scope="col">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredPosts as post (post.id)}
								<tr>
									<td>
										<input
											type="checkbox"
											aria-label={`Select ${post.title}`}
											checked={selectedPostIds.includes(post.id)}
											onchange={(e) => {
												if ((e.currentTarget as HTMLInputElement).checked) {
													selectedPostIds = [...selectedPostIds, post.id];
												} else {
													selectedPostIds = selectedPostIds.filter((id) => id !== post.id);
												}
											}}
										/>
									</td>
									<td>
										<a
											href={resolve('/admin/posts/[id]', { id: String(post.id) })}
											class="post-title-link"
										>
											{post.title}
										</a>
										<div class="post-slug-sub">/blog/{post.slug}</div>
									</td>
									<td>
										<span class={`status-pill status-${post.status}`}>
											{post.status}
										</span>
									</td>
									<td>
										<div class="flag-chips">
											{#if post.featured}
												<span class="flag-chip">Featured</span>
											{/if}
											{#if post.isPillar}
												<span class="flag-chip">Pillar</span>
											{/if}
											{#if post.isSticky}
												<span class="flag-chip">Sticky</span>
											{/if}
										</div>
									</td>
									<td class="col-date">
										{new Date(post.updatedAt).toLocaleDateString()}
									</td>
									<td>
										<div class="row-actions">
											<a
												href={resolve('/admin/posts/[id]', { id: String(post.id) })}
												class="btn-row"
											>
												Edit
											</a>
											<button type="button" class="btn-row" onclick={() => openQuickEdit(post)}>
												Quick Edit
											</button>
											<button
												type="button"
												class="btn-row is-danger"
												onclick={() => (confirmTrashPostId = post.id)}
											>
												Trash
											</button>
										</div>
									</td>
								</tr>

								{#if quickEditId === post.id}
									<tr class="quick-edit-row">
										<td colspan="6">
											{#if quickEditError}
												<div class="quick-edit-error" role="alert">
													{quickEditError}
												</div>
											{/if}
											<div class="quick-edit-grid">
												<label class="qe-field">
													<span>Title</span>
													<input type="text" class="admin-input" bind:value={quickEditTitle} />
												</label>
												<label class="qe-field">
													<span>Slug</span>
													<input type="text" class="admin-input" bind:value={quickEditSlug} />
												</label>
												<label class="qe-field">
													<span>Status</span>
													<select class="admin-select" bind:value={quickEditStatus}>
														{#each POST_STATUSES as st (st)}
															<option value={st}>{st}</option>
														{/each}
													</select>
												</label>
												<label class="qe-field">
													<span>Author</span>
													<select
														class="admin-select"
														value={quickEditAuthorId ?? ''}
														onchange={(e) => {
															const v = (e.currentTarget as HTMLSelectElement).value;
															quickEditAuthorId = v ? Number(v) : null;
														}}
													>
														<option value="">None</option>
														{#each authors as a (a.id)}
															<option value={a.id}>{a.name}</option>
														{/each}
													</select>
												</label>
												<label class="qe-field">
													<span>Primary Category</span>
													<select
														class="admin-select"
														value={quickEditCategoryId ?? ''}
														onchange={(e) => {
															const v = (e.currentTarget as HTMLSelectElement).value;
															quickEditCategoryId = v ? Number(v) : null;
														}}
													>
														<option value="">None</option>
														{#each categories as c (c.id)}
															<option value={c.id}>{c.name}</option>
														{/each}
													</select>
												</label>
												<div class="qe-flags">
													<label>
														<input type="checkbox" bind:checked={quickEditFeatured} />
														Featured
													</label>
													<label>
														<input type="checkbox" bind:checked={quickEditPillar} />
														Pillar
													</label>
													<label>
														<input type="checkbox" bind:checked={quickEditSticky} />
														Sticky
													</label>
												</div>
											</div>
											<div class="quick-edit-actions">
												<button
													type="button"
													class="btn-primary"
													disabled={quickEditSaving}
													onclick={() => saveQuickEdit(post.id)}
												>
													{quickEditSaving ? 'Saving...' : 'Save Quick Edit'}
												</button>
												<button
													type="button"
													class="btn-secondary"
													onclick={() => (quickEditId = null)}
												>
													Cancel
												</button>
											</div>
										</td>
									</tr>
								{/if}
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</section>
	{:else if activeView === 'trash'}
		<section class="admin-section" aria-label="Trashed posts">
			<div class="filter-bar">
				<span>{trashedPosts.length} item(s) in Trash</span>
				{#if trashedPosts.length > 0}
					<button type="button" class="btn-danger" onclick={() => (confirmEmptyTrashOpen = true)}>
						Delete All Permanently ({trashedPosts.length})
					</button>
				{/if}
			</div>

			{#if trashedPosts.length === 0}
				<p class="empty-state">Trash is empty.</p>
			{:else}
				<div class="table-wrap">
					<table class="admin-table">
						<thead>
							<tr>
								<th scope="col">Title</th>
								<th scope="col">Slug</th>
								<th scope="col">Deleted At</th>
								<th scope="col">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each trashedPosts as post (post.id)}
								<tr>
									<td>{post.title}</td>
									<td>/blog/{post.slug}</td>
									<td>
										{post.deletedAt ? new Date(post.deletedAt).toLocaleString() : ''}
									</td>
									<td>
										<div class="row-actions">
											<button
												type="button"
												class="btn-row"
												onclick={() => (confirmRestoreId = post.id)}
											>
												Restore
											</button>
											<button
												type="button"
												class="btn-row is-danger"
												onclick={() => (confirmPermanentDeleteId = post.id)}
											>
												Delete Permanently
											</button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</section>
	{:else if activeView === 'authors'}
		<section class="admin-section two-col" aria-label="Manage authors">
			<div class="form-card">
				<h2>{editingAuthorId ? 'Edit Author' : 'Add Author'}</h2>
				<div class="form-grid">
					<label class="field-label">
						<span>Name *</span>
						<input
							type="text"
							class="admin-input"
							bind:value={authorName}
							oninput={() => {
								authorDirty = true;
								if (!editingAuthorId) authorSlug = generateSlug(authorName);
							}}
						/>
					</label>
					<label class="field-label">
						<span>Slug *</span>
						<input
							type="text"
							class="admin-input"
							bind:value={authorSlug}
							oninput={() => (authorDirty = true)}
						/>
					</label>
					<label class="field-label">
						<span>Job Title</span>
						<input
							type="text"
							class="admin-input"
							bind:value={authorJobTitle}
							oninput={() => (authorDirty = true)}
						/>
					</label>
					<label class="field-label">
						<span>Company</span>
						<input
							type="text"
							class="admin-input"
							bind:value={authorCompany}
							oninput={() => (authorDirty = true)}
						/>
					</label>
					<label class="field-label">
						<span>Credentials</span>
						<input
							type="text"
							class="admin-input"
							bind:value={authorCredentials}
							oninput={() => (authorDirty = true)}
						/>
					</label>
					<label class="field-label">
						<span>Expertise</span>
						<input
							type="text"
							class="admin-input"
							bind:value={authorExpertise}
							oninput={() => (authorDirty = true)}
						/>
					</label>
					<label class="field-label">
						<span>Years of Experience</span>
						<input
							type="number"
							min="0"
							max="80"
							class="admin-input"
							bind:value={authorYearsExperience}
							oninput={() => (authorDirty = true)}
						/>
					</label>
					<label class="field-label">
						<span>Email</span>
						<input
							type="email"
							class="admin-input"
							bind:value={authorEmail}
							oninput={() => (authorDirty = true)}
						/>
					</label>
					<label class="field-label">
						<span>Avatar URL</span>
						<input
							type="url"
							class="admin-input"
							bind:value={authorAvatar}
							oninput={() => (authorDirty = true)}
						/>
					</label>
					<label class="field-label">
						<span>Avatar Alt Text</span>
						<input
							type="text"
							class="admin-input"
							bind:value={authorAvatarAlt}
							oninput={() => (authorDirty = true)}
						/>
					</label>
					<label class="field-label">
						<span>LinkedIn URL</span>
						<input
							type="url"
							class="admin-input"
							bind:value={authorLinkedin}
							oninput={() => (authorDirty = true)}
						/>
					</label>
					<label class="field-label">
						<span>X / Twitter URL</span>
						<input
							type="url"
							class="admin-input"
							bind:value={authorTwitter}
							oninput={() => (authorDirty = true)}
						/>
					</label>
					<label class="field-label">
						<span>Website URL</span>
						<input
							type="url"
							class="admin-input"
							bind:value={authorWebsite}
							oninput={() => (authorDirty = true)}
						/>
					</label>
					<label class="field-label full-span">
						<span>Short Bio</span>
						<textarea
							rows="2"
							class="admin-textarea"
							bind:value={authorShortBio}
							oninput={() => (authorDirty = true)}></textarea>
					</label>
					<label class="field-label full-span">
						<span>Full Bio</span>
						<textarea
							rows="4"
							class="admin-textarea"
							bind:value={authorBio}
							oninput={() => (authorDirty = true)}></textarea>
					</label>
					<label class="field-check full-span">
						<input
							type="checkbox"
							bind:checked={authorIsActive}
							onchange={() => (authorDirty = true)}
						/>
						<span>Active Author</span>
					</label>
				</div>
				<div class="form-actions">
					<button type="button" class="btn-primary" onclick={saveAuthor}>
						{editingAuthorId ? 'Update Author' : 'Create Author'}
					</button>
					{#if editingAuthorId}
						<button type="button" class="btn-secondary" onclick={resetAuthorForm}> Cancel </button>
					{/if}
				</div>
			</div>

			<div class="list-card">
				<h2>Existing Authors</h2>
				{#each authors as author (author.id)}
					<div class="entity-row">
						<div>
							<strong>{author.name}</strong>
							<div class="post-slug-sub">
								{author.jobTitle || author.slug}
								{author.isActive ? '' : '(Inactive)'}
							</div>
						</div>
						<div class="row-actions">
							<button type="button" class="btn-row" onclick={() => editAuthor(author)}>
								Edit
							</button>
							<button
								type="button"
								class="btn-row is-danger"
								onclick={() => (confirmDeleteAuthorId = author.id)}
							>
								Delete
							</button>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{:else if activeView === 'categories'}
		<section class="admin-section two-col" aria-label="Manage categories">
			<div class="form-card">
				<h2>{editingCategoryId ? 'Edit Category' : 'Add Category'}</h2>
				<div class="form-grid">
					<label class="field-label">
						<span>Name *</span>
						<input
							type="text"
							class="admin-input"
							bind:value={categoryName}
							oninput={() => {
								categoryDirty = true;
								if (!editingCategoryId) categorySlug = generateSlug(categoryName);
							}}
						/>
					</label>
					<label class="field-label">
						<span>Slug *</span>
						<input
							type="text"
							class="admin-input"
							bind:value={categorySlug}
							oninput={() => (categoryDirty = true)}
						/>
					</label>
					<label class="field-label">
						<span>Parent Category</span>
						<select
							class="admin-select"
							value={categoryParentId ?? ''}
							onchange={(e) => {
								const v = (e.currentTarget as HTMLSelectElement).value;
								categoryParentId = v ? Number(v) : null;
								categoryDirty = true;
							}}
						>
							<option value="">None (Top Level)</option>
							{#each categories.filter((c) => c.id !== editingCategoryId) as cat (cat.id)}
								<option value={cat.id}>{cat.name}</option>
							{/each}
						</select>
					</label>
					<label class="field-label">
						<span>Badge Color</span>
						<input
							type="color"
							class="admin-input"
							bind:value={categoryColor}
							oninput={() => (categoryDirty = true)}
						/>
					</label>
					<label class="field-label full-span">
						<span>Description</span>
						<textarea
							rows="2"
							class="admin-textarea"
							bind:value={categoryDescription}
							oninput={() => (categoryDirty = true)}></textarea>
					</label>
					<label class="field-label full-span">
						<span>Meta Title (max {META_TITLE_MAX} chars)</span>
						<input
							type="text"
							maxlength={META_TITLE_MAX}
							class="admin-input"
							bind:value={categoryMetaTitle}
							oninput={() => (categoryDirty = true)}
						/>
					</label>
					<label class="field-label full-span">
						<span>Meta Description (max {META_DESCRIPTION_MAX} chars)</span>
						<textarea
							rows="2"
							maxlength={META_DESCRIPTION_MAX}
							class="admin-textarea"
							bind:value={categoryMetaDescription}
							oninput={() => (categoryDirty = true)}></textarea>
					</label>
					<label class="field-label full-span">
						<span>Pillar Hub Content (HTML/Prose)</span>
						<textarea
							rows="4"
							class="admin-textarea"
							bind:value={categoryPillarContent}
							oninput={() => (categoryDirty = true)}></textarea>
					</label>
					<label class="field-check full-span">
						<input
							type="checkbox"
							bind:checked={categoryIsActive}
							onchange={() => (categoryDirty = true)}
						/>
						<span>Active Category</span>
					</label>
				</div>
				<div class="form-actions">
					<button type="button" class="btn-primary" onclick={saveCategory}>
						{editingCategoryId ? 'Update Category' : 'Create Category'}
					</button>
					{#if editingCategoryId}
						<button type="button" class="btn-secondary" onclick={resetCategoryForm}>
							Cancel
						</button>
					{/if}
				</div>
			</div>

			<div class="list-card">
				<h2>Existing Categories</h2>
				{#each categories as cat (cat.id)}
					<div class="entity-row">
						<div>
							<strong>{cat.name}</strong>
							<div class="post-slug-sub">
								/blog/category/{cat.slug}
								{cat.isActive ? '' : '(Inactive)'}
							</div>
						</div>
						<div class="row-actions">
							<button type="button" class="btn-row" onclick={() => editCategory(cat)}>
								Edit
							</button>
							<button
								type="button"
								class="btn-row is-danger"
								onclick={() => (confirmDeleteCategoryId = cat.id)}
							>
								Delete
							</button>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{:else if activeView === 'tags'}
		<section class="admin-section two-col" aria-label="Manage tags">
			<div class="form-card">
				<h2>{editingTagId ? 'Edit Tag' : 'Add Tag'}</h2>
				<div class="form-grid">
					<label class="field-label full-span">
						<span>Name *</span>
						<input
							type="text"
							class="admin-input"
							bind:value={tagName}
							oninput={() => {
								tagDirty = true;
								if (!editingTagId) tagSlug = generateSlug(tagName);
							}}
						/>
					</label>
					<label class="field-label full-span">
						<span>Slug *</span>
						<input
							type="text"
							class="admin-input"
							bind:value={tagSlug}
							oninput={() => (tagDirty = true)}
						/>
					</label>
					<label class="field-label full-span">
						<span>Description</span>
						<textarea
							rows="3"
							class="admin-textarea"
							bind:value={tagDescription}
							oninput={() => (tagDirty = true)}></textarea>
					</label>
				</div>
				<div class="form-actions">
					<button type="button" class="btn-primary" onclick={saveTag}>
						{editingTagId ? 'Update Tag' : 'Create Tag'}
					</button>
					{#if editingTagId}
						<button type="button" class="btn-secondary" onclick={resetTagForm}> Cancel </button>
					{/if}
				</div>
			</div>

			<div class="list-card">
				<h2>Existing Tags</h2>
				{#each tags as t (t.id)}
					<div class="entity-row">
						<div>
							<strong>{t.name}</strong>
							<div class="post-slug-sub">/blog/tag/{t.slug}</div>
						</div>
						<div class="row-actions">
							<button type="button" class="btn-row" onclick={() => editTag(t)}> Edit </button>
							<button
								type="button"
								class="btn-row is-danger"
								onclick={() => (confirmDeleteTagId = t.id)}
							>
								Delete
							</button>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</main>

<ConfirmDialog
	open={pendingViewSwitch !== null || pendingDiscardAction !== null}
	title="Discard Unsaved Changes?"
	message="You have unsaved edits in the current form. Discard them and continue?"
	confirmLabel="Discard"
	variant="warning"
	onConfirm={() => {
		if (pendingDiscardAction) {
			const fn = pendingDiscardAction;
			pendingDiscardAction = null;
			fn();
			return;
		}
		resetAuthorForm();
		resetCategoryForm();
		resetTagForm();
		if (pendingViewSwitch) activeView = pendingViewSwitch;
		pendingViewSwitch = null;
	}}
	onCancel={() => {
		pendingViewSwitch = null;
		pendingDiscardAction = null;
	}}
/>

<ConfirmDialog
	open={confirmTrashPostId !== null}
	title="Move Post to Trash?"
	message="This post will be soft-deleted and hidden from public listings. You can restore it from the Trash tab."
	confirmLabel="Move to Trash"
	variant="warning"
	onConfirm={() => {
		if (confirmTrashPostId !== null) void handleTrashPost(confirmTrashPostId);
	}}
	onCancel={() => (confirmTrashPostId = null)}
/>

<ConfirmDialog
	open={confirmRestoreId !== null}
	title="Restore Post from Trash?"
	message="This post will be restored to your active posts list."
	confirmLabel="Restore Post"
	variant="default"
	onConfirm={() => {
		if (confirmRestoreId !== null) void handleRestorePost(confirmRestoreId);
	}}
	onCancel={() => (confirmRestoreId = null)}
/>

<ConfirmDialog
	open={confirmPermanentDeleteId !== null}
	title="Delete Post Permanently?"
	message="This action cannot be undone. All revisions and taxonomy associations for this post will be permanently removed."
	confirmLabel="Delete Permanently"
	variant="danger"
	onConfirm={() => {
		if (confirmPermanentDeleteId !== null) {
			void handlePermanentDelete(confirmPermanentDeleteId);
		}
	}}
	onCancel={() => (confirmPermanentDeleteId = null)}
/>

<ConfirmDialog
	open={confirmEmptyTrashOpen}
	title="Empty Trash?"
	message={`Permanently delete all ${trashedPosts.length} trashed post(s)? This cannot be undone.`}
	confirmLabel="Delete All Permanently"
	variant="danger"
	onConfirm={handleEmptyTrash}
	onCancel={() => (confirmEmptyTrashOpen = false)}
/>

<ConfirmDialog
	open={confirmDeleteAuthorId !== null}
	title="Delete Author?"
	message="Delete this author profile?"
	confirmLabel="Delete Author"
	variant="danger"
	onConfirm={() => {
		if (confirmDeleteAuthorId !== null) void handleDeleteAuthor(confirmDeleteAuthorId);
	}}
	onCancel={() => (confirmDeleteAuthorId = null)}
/>

<ConfirmDialog
	open={confirmDeleteCategoryId !== null}
	title="Delete Category?"
	message="Delete this category? Categories assigned to scheduled posts cannot be deleted until reassigned."
	confirmLabel="Delete Category"
	variant="danger"
	onConfirm={() => {
		if (confirmDeleteCategoryId !== null) {
			void handleDeleteCategory(confirmDeleteCategoryId);
		}
	}}
	onCancel={() => (confirmDeleteCategoryId = null)}
/>

<ConfirmDialog
	open={confirmDeleteTagId !== null}
	title="Delete Tag?"
	message="Delete this tag from all posts?"
	confirmLabel="Delete Tag"
	variant="danger"
	onConfirm={() => {
		if (confirmDeleteTagId !== null) void handleDeleteTag(confirmDeleteTagId);
	}}
	onCancel={() => (confirmDeleteTagId = null)}
/>

<style>
	.admin-posts-page {
		min-height: 100vh;
		background: var(--bg);
		color: var(--text);
		padding: 2rem 1.5rem 5rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.admin-header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.admin-kicker {
		display: block;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--acid);
		margin-bottom: 0.25rem;
	}

	.admin-header h1 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.85rem;
		font-weight: 800;
	}

	.admin-header-actions {
		display: flex;
		gap: 0.75rem;
	}

	.admin-banner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		font-size: 0.88rem;
	}

	.admin-banner.is-error {
		background: rgba(255, 121, 105, 0.14);
		border: 1px solid var(--coral);
		color: var(--coral);
	}

	.admin-banner.is-status {
		background: rgba(220, 255, 101, 0.12);
		border: 1px solid var(--acid);
		color: var(--acid);
	}

	.btn-dismiss {
		background: transparent;
		border: 1px solid currentColor;
		color: inherit;
		padding: 0.25rem 0.6rem;
		border-radius: 5px;
		cursor: pointer;
	}

	.admin-view-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		border-bottom: 1px solid var(--line);
		padding-bottom: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.view-tab {
		padding: 0.5rem 1rem;
		background: var(--panel);
		border: 1px solid var(--line);
		border-radius: 8px;
		color: var(--muted);
		font-family: var(--font-sans);
		font-size: 0.86rem;
		font-weight: 600;
		cursor: pointer;
	}

	.view-tab.is-active {
		background: var(--acid);
		color: var(--ink);
		border-color: var(--acid);
	}

	.filter-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.25rem;
	}

	.admin-input,
	.admin-select,
	.admin-textarea {
		padding: 0.52rem 0.75rem;
		background: var(--panel);
		border: 1px solid var(--line-strong);
		border-radius: 7px;
		color: var(--text);
		font-family: var(--font-sans);
		font-size: 0.86rem;
	}

	.table-wrap {
		overflow-x: auto;
		background: var(--panel);
		border: 1px solid var(--line);
		border-radius: 12px;
	}

	.admin-table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
		font-size: 0.88rem;
	}

	.admin-table th,
	.admin-table td {
		padding: 0.85rem 1rem;
		border-bottom: 1px solid var(--line);
		vertical-align: middle;
	}

	.admin-table th {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--muted);
	}

	.post-title-link {
		color: var(--text);
		font-weight: 700;
		text-decoration: none;
	}

	.post-title-link:hover {
		color: var(--acid);
	}

	.post-slug-sub {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--muted);
		margin-top: 0.2rem;
	}

	.status-pill {
		display: inline-block;
		padding: 0.2rem 0.55rem;
		border-radius: 999px;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		text-transform: uppercase;
		background: var(--bg-soft);
		border: 1px solid var(--line-strong);
	}

	.status-published {
		color: var(--acid);
		border-color: var(--acid);
	}

	.flag-chips {
		display: flex;
		gap: 0.35rem;
		flex-wrap: wrap;
	}

	.flag-chip {
		font-size: 0.7rem;
		padding: 0.15rem 0.45rem;
		border-radius: 4px;
		background: var(--bg-soft);
		color: var(--muted);
	}

	.row-actions {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
	}

	.btn-row {
		padding: 0.3rem 0.6rem;
		border-radius: 5px;
		background: var(--bg-soft);
		border: 1px solid var(--line-strong);
		color: var(--text);
		font-size: 0.78rem;
		text-decoration: none;
		cursor: pointer;
	}

	.btn-row.is-danger {
		color: var(--coral);
	}

	.quick-edit-row td {
		background: var(--bg-soft);
	}

	.quick-edit-error {
		padding: 0.5rem 0.75rem;
		margin-bottom: 0.75rem;
		border-radius: 6px;
		background: rgba(255, 121, 105, 0.14);
		color: var(--coral);
	}

	.quick-edit-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.qe-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.78rem;
		color: var(--muted);
	}

	.qe-flags {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		font-size: 0.82rem;
	}

	.quick-edit-actions {
		display: flex;
		gap: 0.5rem;
	}

	.two-col {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 1.5rem;
		align-items: start;
	}

	.form-card,
	.list-card {
		background: var(--panel);
		border: 1px solid var(--line);
		border-radius: 12px;
		padding: 1.25rem;
	}

	.form-card h2,
	.list-card h2 {
		margin: 0 0 1rem;
		font-family: var(--font-display);
		font-size: 1.15rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.85rem;
	}

	.field-label {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-size: 0.8rem;
		color: var(--muted);
	}

	.field-label.full-span,
	.field-check.full-span {
		grid-column: 1 / -1;
	}

	.field-check {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
	}

	.form-actions {
		display: flex;
		gap: 0.6rem;
		margin-top: 1rem;
	}

	.entity-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--line);
	}

	.btn-primary,
	.btn-secondary,
	.btn-danger {
		padding: 0.5rem 0.95rem;
		border-radius: 7px;
		font-family: var(--font-sans);
		font-size: 0.84rem;
		font-weight: 700;
		text-decoration: none;
		cursor: pointer;
		border: 1px solid transparent;
	}

	.btn-primary {
		background: var(--acid);
		color: var(--ink);
	}

	.btn-secondary {
		background: var(--panel);
		border-color: var(--line-strong);
		color: var(--text);
	}

	.btn-danger {
		background: var(--coral);
		color: var(--ink);
	}

	.empty-state {
		padding: 2rem;
		text-align: center;
		color: var(--muted);
		background: var(--panel);
		border: 1px solid var(--line);
		border-radius: 12px;
	}

	@media (max-width: 960px) {
		.two-col {
			grid-template-columns: 1fr;
		}
	}
</style>
