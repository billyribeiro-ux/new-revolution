import { and, desc, eq, inArray, isNull, ne } from 'drizzle-orm';
import { ensureDbReady, type AppDatabase } from './index';
import { postCategories, posts, postTags, redirects, relatedPosts, revisions } from './schema';

export const AUTOSAVE_RETENTION_LIMIT = 20;

export interface AtomicSavePostParams {
	mode: 'create' | 'update' | 'quick_update';
	id?: number;
	actorUserId?: string | null;
	expectedUpdatedAt?: string | Date | null;
	forceOverwrite?: boolean;
	values: Partial<typeof posts.$inferInsert> & {
		title: string;
		slug: string;
		content: string;
	};
	categoryIds?: number[];
	tagIds?: number[];
	relatedPostIds?: number[];
	writeRevision?: boolean;
	revisionChangeType?: 'manual' | 'publish' | 'autosave' | 'restore';
}

export interface AtomicSavePostResult {
	post: typeof posts.$inferSelect;
	renamedFromSlug: string | null;
	prevPublished: boolean;
	newlyPublished: boolean;
	unpublishedFromLive: boolean;
	rewrittenInternalLinksCount: number;
	categoryIds: number[];
	tagIds: number[];
	relatedPostIds: number[];
}

function normalizeBlogPath(slugOrPath: string): string {
	const clean = slugOrPath.trim().toLowerCase().replace(/\/+$/, '');
	return clean.startsWith('/blog/') ? clean : `/blog/${clean.replace(/^\/+/, '')}`;
}

export async function pruneAutosaveRevisions(
	tx: Pick<AppDatabase, 'select' | 'delete'>,
	postId: number,
	keepCount: number = AUTOSAVE_RETENTION_LIMIT
): Promise<void> {
	const autosaves = await tx
		.select({ id: revisions.id })
		.from(revisions)
		.where(and(eq(revisions.postId, postId), eq(revisions.changeType, 'autosave')))
		.orderBy(desc(revisions.createdAt), desc(revisions.id));

	if (autosaves.length > keepCount) {
		const idsToDelete = autosaves.slice(keepCount).map((r) => r.id);
		await tx.delete(revisions).where(inArray(revisions.id, idsToDelete));
	}
}

export async function savePostWithRedirect(
	params: AtomicSavePostParams
): Promise<AtomicSavePostResult> {
	const db = await ensureDbReady();

	try {
		return await db.transaction(async (tx) => {
			let existingRow: typeof posts.$inferSelect | null = null;

			if (params.mode !== 'create') {
				if (!params.id) {
					throw new Error('POST_ID_REQUIRED: Post ID is required for updates.');
				}

				const lockedRows = await tx
					.select()
					.from(posts)
					.where(and(eq(posts.id, params.id), isNull(posts.deletedAt)))
					.for('update');

				existingRow = lockedRows[0] ?? null;
				if (!existingRow) {
					throw new Error('POST_NOT_FOUND: Post does not exist or is in Trash.');
				}

				if (params.expectedUpdatedAt && !params.forceOverwrite) {
					const expectedMs =
						params.expectedUpdatedAt instanceof Date
							? params.expectedUpdatedAt.getTime()
							: Date.parse(params.expectedUpdatedAt);
					const actualMs = existingRow.updatedAt.getTime();
					if (!Number.isNaN(expectedMs) && Math.abs(expectedMs - actualMs) > 1) {
						throw new Error(
							'STALE_WRITE: This post was modified by another session. Reload latest or overwrite.'
						);
					}
				}
			}

			// Check duplicate slug explicitly before insert/update
			const targetSlug = params.values.slug.trim().toLowerCase();
			const dupSlugRows = await tx
				.select({ id: posts.id })
				.from(posts)
				.where(
					existingRow
						? and(eq(posts.slug, targetSlug), ne(posts.id, existingRow.id))
						: eq(posts.slug, targetSlug)
				)
				.limit(1);

			if (dupSlugRows.length > 0) {
				throw new Error(`DUPLICATE_SLUG: A post with slug "${targetSlug}" already exists.`);
			}

			const now = new Date();
			const targetStatus = params.values.status ?? existingRow?.status ?? 'draft';
			const isPublished = targetStatus === 'published';
			const prevPublished = Boolean(
				existingRow && (existingRow.published || existingRow.status === 'published')
			);
			const newlyPublished = isPublished && !prevPublished;
			const unpublishedFromLive = prevPublished && !isPublished;

			// Determine primary category and category pivot set (Section 7.10)
			let nextCategoryIds: number[] | undefined;
			let primaryCategoryId: number | null =
				params.values.categoryId !== undefined
					? (params.values.categoryId ?? null)
					: (existingRow?.categoryId ?? null);

			if (params.categoryIds !== undefined) {
				const dedupedCats = [...new Set(params.categoryIds.filter((id) => id > 0))];
				if (primaryCategoryId && !dedupedCats.includes(primaryCategoryId)) {
					if (dedupedCats.length === 0) {
						dedupedCats.push(primaryCategoryId);
					} else {
						primaryCategoryId = dedupedCats[0];
					}
				} else if (!primaryCategoryId && dedupedCats.length > 0) {
					primaryCategoryId = dedupedCats[0];
				}
				if (dedupedCats.length === 0) {
					primaryCategoryId = null;
				}
				nextCategoryIds = dedupedCats;
			} else if (params.mode === 'create' && primaryCategoryId) {
				nextCategoryIds = [primaryCategoryId];
			}

			// Scoped featured demotion (Section 7.9):
			// Demote others ONLY when the saved post itself is `published` and not deleted.
			// Run BEFORE inserting/updating `featured = true` so the partial unique index is never violated.
			const targetFeatured = params.values.featured ?? existingRow?.featured ?? false;
			if (targetFeatured && isPublished) {
				if (existingRow) {
					await tx
						.update(posts)
						.set({ featured: false })
						.where(and(eq(posts.featured, true), ne(posts.id, existingRow.id)));
				} else {
					await tx.update(posts).set({ featured: false }).where(eq(posts.featured, true));
				}
			}

			// Determine `content_updated_at` (Section 7.8):
			// Bumps on create or whenever title or body text changed (including quick-update title changes).
			const titleOrContentChanged =
				!existingRow ||
				existingRow.title !== params.values.title ||
				existingRow.content !== params.values.content;

			const contentUpdatedAt = titleOrContentChanged
				? now
				: (existingRow?.contentUpdatedAt ?? existingRow?.updatedAt ?? now);

			const publishedAt = isPublished
				? (existingRow?.publishedAt ?? params.values.publishedAt ?? now)
				: (existingRow?.publishedAt ?? null);

			const rowToSave: typeof posts.$inferInsert = {
				...params.values,
				slug: targetSlug,
				categoryId: primaryCategoryId,
				status: targetStatus,
				published: isPublished,
				featured: targetFeatured,
				publishedAt,
				contentUpdatedAt,
				updatedAt: now
			};

			let savedPost: typeof posts.$inferSelect;
			if (!existingRow) {
				const inserted = await tx
					.insert(posts)
					.values({
						...rowToSave,
						createdAt: now
					})
					.returning();
				savedPost = inserted[0];
			} else {
				const updated = await tx
					.update(posts)
					.set(rowToSave)
					.where(eq(posts.id, existingRow.id))
					.returning();
				savedPost = updated[0];
			}

			// Handle slug rename redirects & internal link rewrites (Section 7.11)
			let renamedFromSlug: string | null = null;
			let rewrittenInternalLinksCount = 0;

			if (existingRow && prevPublished && existingRow.slug !== savedPost.slug) {
				renamedFromSlug = existingRow.slug;
				const oldPath = normalizeBlogPath(existingRow.slug);
				const newPath = normalizeBlogPath(savedPost.slug);

				// 1. Repoint existing active redirects whose target_path === oldPath -> newPath (collapse chains)
				await tx
					.update(redirects)
					.set({ targetPath: newPath })
					.where(and(eq(redirects.targetPath, oldPath), eq(redirects.isActive, true)));

				// 2. Deactivate any active redirect whose source_path === newPath (rename-back case)
				await tx
					.update(redirects)
					.set({ isActive: false })
					.where(and(eq(redirects.sourcePath, newPath), eq(redirects.isActive, true)));

				// 3. Insert new 301 redirect oldPath -> newPath if no active redirect from oldPath exists
				const existingActiveSource = await tx
					.select({ id: redirects.id })
					.from(redirects)
					.where(and(eq(redirects.sourcePath, oldPath), eq(redirects.isActive, true)))
					.limit(1);

				if (existingActiveSource.length === 0) {
					await tx.insert(redirects).values({
						sourcePath: oldPath,
						targetPath: newPath,
						type: 301,
						hits: 0,
						isActive: true,
						createdAt: now
					});
				} else {
					await tx
						.update(redirects)
						.set({ targetPath: newPath, type: 301 })
						.where(eq(redirects.id, existingActiveSource[0].id));
				}

				// 4. Rewrite internal links in other posts' bodies referencing `/blog/<oldSlug>`
				const otherPosts = await tx
					.select({ id: posts.id, content: posts.content })
					.from(posts)
					.where(and(ne(posts.id, savedPost.id), isNull(posts.deletedAt)));

				const oldLinkPattern = new RegExp(
					`(href=["'](?:https?:\\/\\/revolutiontradingpros\\.com)?\\/blog\\/)${existingRow.slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(["'/#?])`,
					'gi'
				);

				for (const other of otherPosts) {
					if (oldLinkPattern.test(other.content)) {
						const nextContent = other.content.replace(oldLinkPattern, `$1${savedPost.slug}$2`);
						if (nextContent !== other.content) {
							await tx.update(posts).set({ content: nextContent }).where(eq(posts.id, other.id));
							rewrittenInternalLinksCount += 1;
						}
					}
				}
			}

			// Update category pivots
			let finalCategoryIds: number[];
			if (nextCategoryIds !== undefined) {
				await tx.delete(postCategories).where(eq(postCategories.postId, savedPost.id));
				if (nextCategoryIds.length > 0) {
					await tx.insert(postCategories).values(
						nextCategoryIds.map((categoryId) => ({
							postId: savedPost.id,
							categoryId
						}))
					);
				}
				finalCategoryIds = nextCategoryIds;
			} else if (params.mode === 'quick_update' && primaryCategoryId) {
				// Quick update with categoryId: add primary category to the pivot set without collapsing existing categories
				const existingCats = await tx
					.select({ categoryId: postCategories.categoryId })
					.from(postCategories)
					.where(eq(postCategories.postId, savedPost.id));
				const existingSet = new Set(existingCats.map((r) => r.categoryId));
				if (!existingSet.has(primaryCategoryId)) {
					await tx.insert(postCategories).values({
						postId: savedPost.id,
						categoryId: primaryCategoryId
					});
					existingSet.add(primaryCategoryId);
				}
				finalCategoryIds = [...existingSet];
			} else {
				const existingCats = await tx
					.select({ categoryId: postCategories.categoryId })
					.from(postCategories)
					.where(eq(postCategories.postId, savedPost.id));
				finalCategoryIds = existingCats.map((r) => r.categoryId);
			}

			// Update tag pivots
			let finalTagIds: number[];
			if (params.tagIds !== undefined) {
				const dedupedTags = [...new Set(params.tagIds.filter((id) => id > 0))];
				await tx.delete(postTags).where(eq(postTags.postId, savedPost.id));
				if (dedupedTags.length > 0) {
					await tx.insert(postTags).values(
						dedupedTags.map((tagId) => ({
							postId: savedPost.id,
							tagId
						}))
					);
				}
				finalTagIds = dedupedTags;
			} else {
				const existingTags = await tx
					.select({ tagId: postTags.tagId })
					.from(postTags)
					.where(eq(postTags.postId, savedPost.id));
				finalTagIds = existingTags.map((r) => r.tagId);
			}

			// Update related posts pivots (excluding self, preserving sortOrder)
			let finalRelatedIds: number[];
			if (params.relatedPostIds !== undefined) {
				const dedupedRelated = [
					...new Set(params.relatedPostIds.filter((id) => id > 0 && id !== savedPost.id))
				];
				await tx.delete(relatedPosts).where(eq(relatedPosts.postId, savedPost.id));
				if (dedupedRelated.length > 0) {
					await tx.insert(relatedPosts).values(
						dedupedRelated.map((relatedPostId, idx) => ({
							postId: savedPost.id,
							relatedPostId,
							sortOrder: idx
						}))
					);
				}
				finalRelatedIds = dedupedRelated;
			} else {
				const existingRel = await tx
					.select({ relatedPostId: relatedPosts.relatedPostId })
					.from(relatedPosts)
					.where(eq(relatedPosts.postId, savedPost.id))
					.orderBy(relatedPosts.sortOrder);
				finalRelatedIds = existingRel.map((r) => r.relatedPostId);
			}

			// Write revision snapshot (Section 7.7)
			const shouldWriteRevision =
				params.writeRevision ??
				(params.mode === 'create' ||
					params.mode === 'update' ||
					(params.mode === 'quick_update' &&
						Boolean(existingRow && existingRow.title !== savedPost.title)));

			if (shouldWriteRevision) {
				const newWordCount = savedPost.wordCount ?? 0;
				const wordCountDelta = existingRow ? newWordCount - (existingRow.wordCount ?? 0) : 0;
				const changeType = params.revisionChangeType ?? (newlyPublished ? 'publish' : 'manual');

				await tx.insert(revisions).values({
					postId: savedPost.id,
					userId: params.actorUserId ?? null,
					contentSnapshot: savedPost.content,
					titleSnapshot: savedPost.title,
					excerptSnapshot: savedPost.excerpt ?? null,
					wordCount: newWordCount,
					wordCountDelta,
					changeType,
					createdAt: now
				});
			}

			return {
				post: savedPost,
				renamedFromSlug,
				prevPublished,
				newlyPublished,
				unpublishedFromLive,
				rewrittenInternalLinksCount,
				categoryIds: finalCategoryIds,
				tagIds: finalTagIds,
				relatedPostIds: finalRelatedIds
			};
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		const pgCode = (err as { code?: string })?.code;
		if (pgCode === '23505' || /posts_slug_unique|posts_slug_key|duplicate key/i.test(message)) {
			throw new Error(`DUPLICATE_SLUG: A post with slug "${params.values.slug}" already exists.`, {
				cause: err
			});
		}
		throw err;
	}
}
