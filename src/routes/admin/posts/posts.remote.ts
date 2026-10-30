import { z } from 'zod';
import { query, command, getRequestEvent } from '$app/server';
import { requireAdmin } from '#lib/server/auth-guard';
import { consumeRateLimit, RATE_LIMIT_POST_WRITES_PER_MIN } from '#lib/server/rate-limit';
import { throwRpcServiceError } from '#lib/server/posts/error-mapper';
import { signDraftPreviewToken } from '#lib/server/posts/visibility';
import {
	listAdminPosts,
	listTrashedPosts,
	getPostById,
	checkSlugAvailable,
	createPost,
	updatePost,
	quickUpdatePost,
	autosavePost,
	trashPost,
	restoreTrashedPost,
	permanentlyDeletePost,
	emptyTrash,
	listPostRevisions,
	getPostRevisionById,
	restorePostRevision
} from '#lib/server/services/posts';
import {
	listCategories,
	createCategory,
	updateCategory,
	deleteCategory
} from '#lib/server/services/categories';
import { listTags, createTag, updateTag, deleteTag } from '#lib/server/services/tags';
import {
	listAuthors,
	createAuthor,
	updateAuthor,
	deleteAuthor
} from '#lib/server/services/authors';
import type {
	CategoryCreateInput,
	CategoryUpdateInput,
	TagCreateInput,
	TagUpdateInput
} from '#lib/shared/schemas/taxonomy';
import type { AuthorCreateInput, AuthorUpdateInput } from '#lib/shared/schemas/authors';
import type {
	PostCreateInput,
	PostUpdateInput,
	PostQuickUpdateInput,
	PostAutosaveInput
} from '#lib/shared/schemas/posts';

async function guardWriteRateLimit(adminId: string): Promise<void> {
	const rl = await consumeRateLimit({
		key: `post_write:${adminId}`,
		limit: RATE_LIMIT_POST_WRITES_PER_MIN,
		windowMs: 60_000
	});
	if (!rl.allowed) {
		throw new Error('VALIDATION_ERROR: Rate limit exceeded (max 60 write operations per minute).');
	}
}

export const getPosts = query(async () => {
	try {
		const event = getRequestEvent();
		requireAdmin(event);
		const [posts, trashed, categories, tags, authors] = await Promise.all([
			listAdminPosts(),
			listTrashedPosts(),
			listCategories(),
			listTags(),
			listAuthors()
		]);
		return {
			posts,
			trashedCount: trashed.length,
			categories,
			tags,
			authors
		};
	} catch (err) {
		throwRpcServiceError(err);
	}
});

export const getTrashedPosts = query(async () => {
	try {
		const event = getRequestEvent();
		requireAdmin(event);
		const posts = await listTrashedPosts();
		return { posts };
	} catch (err) {
		throwRpcServiceError(err);
	}
});

export const getPostFull = query(z.object({ id: z.number().int().positive() }), async ({ id }) => {
	try {
		const event = getRequestEvent();
		requireAdmin(event);
		const [post, revisions] = await Promise.all([getPostById(id), listPostRevisions(id)]);
		if (!post) {
			throw new Error('POST_NOT_FOUND: Post not found.');
		}
		const previewToken = signDraftPreviewToken(post.id);
		return {
			post,
			revisions,
			previewToken
		};
	} catch (err) {
		throwRpcServiceError(err);
	}
});

export const checkSlugAvailableRpc = query(
	z.object({
		slug: z.string().min(1).max(200),
		excludePostId: z.number().int().positive().optional()
	}),
	async ({ slug, excludePostId }) => {
		try {
			const event = getRequestEvent();
			requireAdmin(event);
			const available = await checkSlugAvailable(slug, excludePostId);
			return { available };
		} catch (err) {
			throwRpcServiceError(err);
		}
	}
);

export const createPostRpc = command('unchecked', async (payload: PostCreateInput) => {
	try {
		const event = getRequestEvent();
		const admin = requireAdmin(event);
		await guardWriteRateLimit(admin.id);
		const post = await createPost(payload, admin.id);
		const previewToken = signDraftPreviewToken(post.id);
		await getPosts().refresh();
		return { post, previewToken };
	} catch (err) {
		throwRpcServiceError(err);
	}
});

export const updatePostRpc = command('unchecked', async (payload: PostUpdateInput) => {
	try {
		const event = getRequestEvent();
		const admin = requireAdmin(event);
		await guardWriteRateLimit(admin.id);
		const post = await updatePost(payload, admin.id);
		const previewToken = signDraftPreviewToken(post.id);
		const revisions = await listPostRevisions(post.id);
		await getPosts().refresh();
		return { post, revisions, previewToken };
	} catch (err) {
		throwRpcServiceError(err);
	}
});

export const quickUpdatePostRpc = command('unchecked', async (payload: PostQuickUpdateInput) => {
	try {
		const event = getRequestEvent();
		const admin = requireAdmin(event);
		await guardWriteRateLimit(admin.id);
		const post = await quickUpdatePost(payload, admin.id);
		await getPosts().refresh();
		return { post };
	} catch (err) {
		throwRpcServiceError(err);
	}
});

export const autosavePostRpc = command('unchecked', async (payload: PostAutosaveInput) => {
	try {
		const event = getRequestEvent();
		const admin = requireAdmin(event);
		await guardWriteRateLimit(admin.id);
		const result = await autosavePost(payload, admin.id);
		return result;
	} catch (err) {
		throwRpcServiceError(err);
	}
});

export const deletePostRpc = command(
	z.object({
		id: z.number().int().positive(),
		permanent: z.boolean().optional()
	}),
	async ({ id, permanent }) => {
		try {
			const event = getRequestEvent();
			const admin = requireAdmin(event);
			await guardWriteRateLimit(admin.id);
			if (permanent) {
				await permanentlyDeletePost(id, admin.id);
			} else {
				await trashPost(id, admin.id);
			}
			await getPosts().refresh();
			await getTrashedPosts().refresh();
			return { deleted: true, id };
		} catch (err) {
			throwRpcServiceError(err);
		}
	}
);

export const restorePostRpc = command(
	z.object({ id: z.number().int().positive() }),
	async ({ id }) => {
		try {
			const event = getRequestEvent();
			const admin = requireAdmin(event);
			await guardWriteRateLimit(admin.id);
			const post = await restoreTrashedPost(id, admin.id);
			await getPosts().refresh();
			await getTrashedPosts().refresh();
			return { post };
		} catch (err) {
			throwRpcServiceError(err);
		}
	}
);

export const emptyTrashRpc = command(async () => {
	try {
		const event = getRequestEvent();
		const admin = requireAdmin(event);
		await guardWriteRateLimit(admin.id);
		const res = await emptyTrash(admin.id);
		await getPosts().refresh();
		await getTrashedPosts().refresh();
		return res;
	} catch (err) {
		throwRpcServiceError(err);
	}
});

export const getPostRevisionsRpc = query(
	z.object({ postId: z.number().int().positive() }),
	async ({ postId }) => {
		try {
			const event = getRequestEvent();
			requireAdmin(event);
			const revisions = await listPostRevisions(postId);
			return { revisions };
		} catch (err) {
			throwRpcServiceError(err);
		}
	}
);

export const getPostRevisionDiffRpc = query(
	z.object({
		postId: z.number().int().positive(),
		revisionId: z.number().int().positive()
	}),
	async ({ postId, revisionId }) => {
		try {
			const event = getRequestEvent();
			requireAdmin(event);
			const revision = await getPostRevisionById(postId, revisionId);
			if (!revision) {
				throw new Error('REVISION_NOT_FOUND: Revision not found.');
			}
			return { revision };
		} catch (err) {
			throwRpcServiceError(err);
		}
	}
);

export const restoreRevisionRpc = command(
	z.object({
		postId: z.number().int().positive(),
		revisionId: z.number().int().positive()
	}),
	async ({ postId, revisionId }) => {
		try {
			const event = getRequestEvent();
			const admin = requireAdmin(event);
			await guardWriteRateLimit(admin.id);
			const post = await restorePostRevision(postId, revisionId, admin.id);
			const revisions = await listPostRevisions(postId);
			await getPosts().refresh();
			return { post, revisions };
		} catch (err) {
			throwRpcServiceError(err);
		}
	}
);

// Categories RPC
export const getCategoriesRpc = query(async () => {
	try {
		const event = getRequestEvent();
		requireAdmin(event);
		const categories = await listCategories();
		return { categories };
	} catch (err) {
		throwRpcServiceError(err);
	}
});

export const createCategoryRpc = command('unchecked', async (payload: unknown) => {
	try {
		const event = getRequestEvent();
		const admin = requireAdmin(event);
		const category = await createCategory(payload as CategoryCreateInput, admin.id);
		await getPosts().refresh();
		return { category };
	} catch (err) {
		throwRpcServiceError(err);
	}
});

export const updateCategoryRpc = command('unchecked', async (payload: unknown) => {
	try {
		const event = getRequestEvent();
		const admin = requireAdmin(event);
		const category = await updateCategory(payload as CategoryUpdateInput, admin.id);
		await getPosts().refresh();
		return { category };
	} catch (err) {
		throwRpcServiceError(err);
	}
});

export const deleteCategoryRpc = command(
	z.object({ id: z.number().int().positive() }),
	async ({ id }) => {
		try {
			const event = getRequestEvent();
			const admin = requireAdmin(event);
			const res = await deleteCategory(id, admin.id);
			await getPosts().refresh();
			return res;
		} catch (err) {
			throwRpcServiceError(err);
		}
	}
);

// Tags RPC
export const getTagsRpc = query(async () => {
	try {
		const event = getRequestEvent();
		requireAdmin(event);
		const tags = await listTags();
		return { tags };
	} catch (err) {
		throwRpcServiceError(err);
	}
});

export const createTagRpc = command('unchecked', async (payload: unknown) => {
	try {
		const event = getRequestEvent();
		const admin = requireAdmin(event);
		const tag = await createTag(payload as TagCreateInput, admin.id);
		await getPosts().refresh();
		return { tag };
	} catch (err) {
		throwRpcServiceError(err);
	}
});

export const updateTagRpc = command('unchecked', async (payload: unknown) => {
	try {
		const event = getRequestEvent();
		const admin = requireAdmin(event);
		const tag = await updateTag(payload as TagUpdateInput, admin.id);
		await getPosts().refresh();
		return { tag };
	} catch (err) {
		throwRpcServiceError(err);
	}
});

export const deleteTagRpc = command(
	z.object({ id: z.number().int().positive() }),
	async ({ id }) => {
		try {
			const event = getRequestEvent();
			const admin = requireAdmin(event);
			const res = await deleteTag(id, admin.id);
			await getPosts().refresh();
			return res;
		} catch (err) {
			throwRpcServiceError(err);
		}
	}
);

// Authors RPC
export const getAuthorsRpc = query(async () => {
	try {
		const event = getRequestEvent();
		requireAdmin(event);
		const authors = await listAuthors();
		return { authors };
	} catch (err) {
		throwRpcServiceError(err);
	}
});

export const createAuthorRpc = command('unchecked', async (payload: unknown) => {
	try {
		const event = getRequestEvent();
		const admin = requireAdmin(event);
		const author = await createAuthor(payload as AuthorCreateInput, admin.id);
		await getPosts().refresh();
		return { author };
	} catch (err) {
		throwRpcServiceError(err);
	}
});

export const updateAuthorRpc = command('unchecked', async (payload: unknown) => {
	try {
		const event = getRequestEvent();
		const admin = requireAdmin(event);
		const author = await updateAuthor(payload as AuthorUpdateInput, admin.id);
		await getPosts().refresh();
		return { author };
	} catch (err) {
		throwRpcServiceError(err);
	}
});

export const deleteAuthorRpc = command(
	z.object({ id: z.number().int().positive() }),
	async ({ id }) => {
		try {
			const event = getRequestEvent();
			const admin = requireAdmin(event);
			const res = await deleteAuthor(id, admin.id);
			await getPosts().refresh();
			return res;
		} catch (err) {
			throwRpcServiceError(err);
		}
	}
);
