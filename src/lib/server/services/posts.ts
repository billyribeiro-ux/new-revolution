import {
	and,
	asc,
	count,
	desc,
	eq,
	gt,
	ilike,
	inArray,
	isNotNull,
	isNull,
	lt,
	ne,
	or
} from 'drizzle-orm';
import { sanitizePostHtml } from '../../sanitize-post-html';
import {
	postAutosaveSchema,
	postCreateSchema,
	postPatchSchema,
	postQuickUpdateSchema,
	postUpdateSchema,
	type PostAutosaveInput,
	type PostCreateInput,
	type PostPatchInput,
	type PostQuickUpdateInput,
	type PostUpdateInput
} from '../../shared/schemas/posts';
import { applyPostAutofill } from '../../shared/seo/autofill';
import {
	applyContentSeoTransforms,
	replaceEmEnDashesInHtml,
	replaceEmEnDashesInPlainText,
	type MediaDimensionLookupItem
} from '../../shared/seo/content-transform';
import { enforcePublishSeoGate } from '../../shared/seo/score';
import {
	computeReadingTime,
	countContentWords,
	extractTocFromHtml,
	normalizePostHeadings
} from '../../shared/seo/toc';
import { writeAuditLog } from '../audit';
import { ensureDbReady } from '../db';
import {
	AUTOSAVE_RETENTION_LIMIT,
	pruneAutosaveRevisions,
	savePostWithRedirect
} from '../db/save-post';
import {
	authors,
	categories,
	media,
	postCategories,
	posts,
	postTags,
	redirects,
	relatedPosts,
	revisions,
	tags
} from '../db/schema';
import { invalidatePublicBlogCache, notifySearchEnginesAsync } from '../posts/cache';
import {
	buildLockedPostPayload,
	hashPostPassword,
	isPostLiveAtReadTime,
	isPubliclyIndexablePost,
	publicIndexablePostPredicate,
	stripPasswordFromPostRow
} from '../posts/visibility';

export const INTERNAL_LINK_PRIORITY_SLUGS = new Set([
	'ultimate-guide-to-options-greeks',
	'how-we-shorted-oxy-put-options-600-percent-overnight',
	'growing-a-500-dollar-small-options-account-without-blowing-up'
]);

async function lookupActiveMediaByUrls(
	urls: string[]
): Promise<Map<string, MediaDimensionLookupItem>> {
	const map = new Map<string, MediaDimensionLookupItem>();
	if (urls.length === 0) return map;

	const db = await ensureDbReady();
	const rows = await db
		.select({
			blobUrl: media.blobUrl,
			width: media.width,
			height: media.height,
			altText: media.altText
		})
		.from(media)
		.where(and(inArray(media.blobUrl, urls), isNull(media.deletedAt)));

	for (const r of rows) {
		map.set(r.blobUrl, {
			blobUrl: r.blobUrl,
			width: r.width,
			height: r.height,
			altText: r.altText
		});
	}
	return map;
}

async function resolveCoverDimensions(
	coverUrl: string | null | undefined
): Promise<{ width: number | null; height: number | null }> {
	if (!coverUrl || !coverUrl.trim()) return { width: null, height: null };
	const map = await lookupActiveMediaByUrls([coverUrl.trim()]);
	const hit = map.get(coverUrl.trim());
	return {
		width: hit?.width ?? null,
		height: hit?.height ?? null
	};
}

export async function checkSlugAvailable(slug: string, excludePostId?: number): Promise<boolean> {
	const clean = slug.trim().toLowerCase();
	if (!clean) return false;
	const db = await ensureDbReady();
	const rows = await db
		.select({ id: posts.id })
		.from(posts)
		.where(
			excludePostId
				? and(eq(posts.slug, clean), ne(posts.id, excludePostId))
				: eq(posts.slug, clean)
		)
		.limit(1);
	return rows.length === 0;
}

export async function getPostById(id: number) {
	const db = await ensureDbReady();
	// MUST filter `deleted_at IS NULL` so trashed posts cannot be loaded into the editor (Section 5.4)
	const rows = await db
		.select()
		.from(posts)
		.where(and(eq(posts.id, id), isNull(posts.deletedAt)))
		.limit(1);

	const post = rows[0];
	if (!post) return null;

	const [catRows, tagRows, relRows] = await Promise.all([
		db
			.select({ categoryId: postCategories.categoryId })
			.from(postCategories)
			.where(eq(postCategories.postId, id)),
		db.select({ tagId: postTags.tagId }).from(postTags).where(eq(postTags.postId, id)),
		db
			.select({ relatedPostId: relatedPosts.relatedPostId })
			.from(relatedPosts)
			.where(eq(relatedPosts.postId, id))
			.orderBy(asc(relatedPosts.sortOrder))
	]);

	return {
		...stripPasswordFromPostRow(post),
		categoryIds: catRows.map((c) => c.categoryId),
		tagIds: tagRows.map((t) => t.tagId),
		relatedPostIds: relRows.map((r) => r.relatedPostId)
	};
}

export async function listAdminPosts() {
	const db = await ensureDbReady();
	const rows = await db
		.select({
			post: posts,
			authorName: authors.name,
			categoryName: categories.name
		})
		.from(posts)
		.leftJoin(authors, eq(posts.authorId, authors.id))
		.leftJoin(categories, eq(posts.categoryId, categories.id))
		.where(isNull(posts.deletedAt))
		.orderBy(desc(posts.updatedAt), desc(posts.id));

	return rows.map(({ post, authorName, categoryName }) => ({
		...stripPasswordFromPostRow(post),
		authorName: authorName ?? null,
		categoryName: categoryName ?? null
	}));
}

export async function listTrashedPosts() {
	const db = await ensureDbReady();
	const rows = await db
		.select({
			post: posts,
			authorName: authors.name,
			categoryName: categories.name
		})
		.from(posts)
		.leftJoin(authors, eq(posts.authorId, authors.id))
		.leftJoin(categories, eq(posts.categoryId, categories.id))
		.where(isNotNull(posts.deletedAt))
		.orderBy(desc(posts.deletedAt), desc(posts.id));

	return rows.map(({ post, authorName, categoryName }) => ({
		...stripPasswordFromPostRow(post),
		authorName: authorName ?? null,
		categoryName: categoryName ?? null
	}));
}

export async function createPost(
	rawInput: PostCreateInput,
	actorUserId?: string | null,
	waitUntil?: (p: Promise<unknown>) => void
) {
	const parsed = postCreateSchema.parse(rawInput);

	// 1. Run content & SEO transforms BEFORE sanitise, autofill, and gate (Section 7.4)
	const transformRes = await applyContentSeoTransforms(parsed, lookupActiveMediaByUrls);
	const transformed = transformRes.data;

	// 2. Run HTML sanitiser
	const sanitizedContent = sanitizePostHtml(transformed.content);
	if (!sanitizedContent.trim()) {
		throw new Error('VALIDATION_ERROR: Post content cannot be empty after sanitization.');
	}

	// 3. Run autofill on blank fields only
	const autofilled = applyPostAutofill({
		...transformed,
		content: sanitizedContent
	});

	// 4. Compute metrics
	const wordCount = countContentWords(autofilled.content);
	const readingTime = computeReadingTime(wordCount);
	const toc = extractTocFromHtml(autofilled.content, autofilled.title);

	// 5. Determine primary category & dedupe taxonomy IDs
	const dedupedCategoryIds = [...new Set((autofilled.categoryIds ?? []).filter((id) => id > 0))];
	let primaryCategoryId = autofilled.categoryId ?? null;
	if (primaryCategoryId && !dedupedCategoryIds.includes(primaryCategoryId)) {
		dedupedCategoryIds.unshift(primaryCategoryId);
	} else if (!primaryCategoryId && dedupedCategoryIds.length > 0) {
		primaryCategoryId = dedupedCategoryIds[0];
	}
	const dedupedTagIds = [...new Set((autofilled.tagIds ?? []).filter((id) => id > 0))];
	const dedupedRelatedIds = [...new Set((autofilled.relatedPostIds ?? []).filter((id) => id > 0))];

	// 6. Enforce publish SEO gate on FINAL values when status is published or scheduled (Section 7.6)
	const targetStatus = autofilled.status ?? 'draft';
	if (targetStatus === 'published' || targetStatus === 'scheduled') {
		enforcePublishSeoGate({
			...autofilled,
			categoryId: primaryCategoryId,
			categoryIds: dedupedCategoryIds,
			tagIds: dedupedTagIds
		});
	}

	// 7. Password handling (hash when password_protected, clear otherwise)
	const passwordToStore =
		autofilled.visibility === 'password_protected' && autofilled.password
			? hashPostPassword(autofilled.password)
			: null;

	const coverDims = await resolveCoverDimensions(autofilled.coverImage);

	// 8. Atomic transaction save
	const saveResult = await savePostWithRedirect({
		mode: 'create',
		actorUserId,
		values: {
			title: autofilled.title,
			slug: autofilled.slug,
			excerpt: autofilled.excerpt ?? null,
			content: autofilled.content,
			authorId: autofilled.authorId ?? null,
			coAuthorIds: autofilled.coAuthorIds ?? null,
			categoryId: primaryCategoryId,
			coverImage: autofilled.coverImage || null,
			coverImageAlt: autofilled.coverImageAlt ?? null,
			coverImageCaption: autofilled.coverImageCaption ?? null,
			coverImageWidth: coverDims.width,
			coverImageHeight: coverDims.height,
			metaTitle: autofilled.metaTitle ?? null,
			metaDescription: autofilled.metaDescription ?? null,
			ogTitle: autofilled.ogTitle ?? null,
			ogDescription: autofilled.ogDescription ?? null,
			ogImage: autofilled.ogImage || null,
			canonicalUrl: autofilled.canonicalUrl || null,
			focusKeyword: autofilled.focusKeyword ?? null,
			secondaryKeywords: autofilled.secondaryKeywords ?? null,
			robotsNoindex: autofilled.robotsNoindex ?? false,
			robotsNofollow: autofilled.robotsNofollow ?? false,
			schemaType: autofilled.schemaType ?? 'BlogPosting',
			twitterCardType: autofilled.twitterCardType ?? 'summary_large_image',
			twitterTitle: autofilled.twitterTitle ?? null,
			twitterDescription: autofilled.twitterDescription ?? null,
			twitterImage: autofilled.twitterImage || null,
			readingTime,
			wordCount,
			tableOfContents: JSON.stringify(toc),
			faqItems: autofilled.faqItems ?? null,
			status: targetStatus,
			visibility: autofilled.visibility ?? 'public',
			password: passwordToStore,
			template: autofilled.template ?? 'default',
			postFormat: autofilled.postFormat ?? 'standard',
			customFields: autofilled.customFields ?? null,
			featured: autofilled.featured ?? false,
			isPillar: autofilled.isPillar ?? false,
			isSticky: autofilled.isSticky ?? false,
			commentsEnabled: autofilled.commentsEnabled ?? true,
			pingbacksEnabled: autofilled.pingbacksEnabled ?? false,
			language: autofilled.language ?? 'en',
			translationOfId: autofilled.translationOfId ?? null,
			seriesId: autofilled.seriesId ?? null,
			seriesOrder: autofilled.seriesOrder ?? null,
			isFixture: autofilled.isFixture ?? false,
			scheduledAt: autofilled.scheduledAt ? new Date(autofilled.scheduledAt) : null,
			expiresAt: autofilled.expiresAt ? new Date(autofilled.expiresAt) : null
		},
		categoryIds: dedupedCategoryIds,
		tagIds: dedupedTagIds,
		relatedPostIds: dedupedRelatedIds,
		writeRevision: true,
		revisionChangeType: 'manual'
	});

	if (transformRes.changes.length > 0) {
		await writeAuditLog({
			actorUserId,
			action: 'post.content_transforms',
			entityType: 'post',
			entityId: saveResult.post.id,
			summary: { changes: transformRes.changes }
		});
	}

	await writeAuditLog({
		actorUserId,
		action: 'post.create',
		entityType: 'post',
		entityId: saveResult.post.id,
		summary: {
			slug: saveResult.post.slug,
			status: saveResult.post.status
		}
	});

	if (saveResult.post.status === 'published') {
		invalidatePublicBlogCache([
			'/blog',
			`/blog/${saveResult.post.slug}`,
			'/rss.xml',
			'/sitemap.xml'
		]);
		notifySearchEnginesAsync([`https://revolutiontradingpros.com/blog/${saveResult.post.slug}`], {
			waitUntil
		});
	}

	return {
		...stripPasswordFromPostRow(saveResult.post),
		categoryIds: saveResult.categoryIds,
		tagIds: saveResult.tagIds,
		relatedPostIds: saveResult.relatedPostIds,
		renamedFromSlug: saveResult.renamedFromSlug,
		rewrittenInternalLinksCount: saveResult.rewrittenInternalLinksCount
	};
}

export async function updatePost(
	rawInput: PostUpdateInput,
	actorUserId?: string | null,
	waitUntil?: (p: Promise<unknown>) => void
) {
	const parsed = postUpdateSchema.parse(rawInput);
	const db = await ensureDbReady();

	const existingRows = await db
		.select()
		.from(posts)
		.where(and(eq(posts.id, parsed.id), isNull(posts.deletedAt)))
		.limit(1);

	const existingPost = existingRows[0];
	if (!existingPost) {
		throw new Error('POST_NOT_FOUND: Post does not exist or is in Trash.');
	}

	// 1. Content & SEO transforms
	const transformRes = await applyContentSeoTransforms(parsed, lookupActiveMediaByUrls);
	const transformed = transformRes.data;

	// 2. Sanitise body
	const sanitizedContent = sanitizePostHtml(transformed.content);
	if (!sanitizedContent.trim()) {
		throw new Error('VALIDATION_ERROR: Post content cannot be empty after sanitization.');
	}

	// 3. Autofill blank fields
	const autofilled = applyPostAutofill({
		...transformed,
		content: sanitizedContent
	});

	// 4. Metrics
	const wordCount = countContentWords(autofilled.content);
	const readingTime = computeReadingTime(wordCount);
	const toc = extractTocFromHtml(autofilled.content, autofilled.title);

	const dedupedCategoryIds = [...new Set((autofilled.categoryIds ?? []).filter((id) => id > 0))];
	let primaryCategoryId = autofilled.categoryId ?? null;
	if (primaryCategoryId && !dedupedCategoryIds.includes(primaryCategoryId)) {
		dedupedCategoryIds.unshift(primaryCategoryId);
	} else if (!primaryCategoryId && dedupedCategoryIds.length > 0) {
		primaryCategoryId = dedupedCategoryIds[0];
	}
	const dedupedTagIds = [...new Set((autofilled.tagIds ?? []).filter((id) => id > 0))];
	const dedupedRelatedIds = [
		...new Set((autofilled.relatedPostIds ?? []).filter((id) => id > 0 && id !== parsed.id))
	];

	// 5. Gate placement (Section 7.6):
	// Runs on update when transitioning to published, or any save with status scheduled.
	// Already-live posts (existingPost.status === 'published' && targetStatus === 'published') are NOT re-gated.
	const targetStatus = autofilled.status ?? existingPost.status;
	const isTransitionToPublished =
		targetStatus === 'published' && existingPost.status !== 'published';
	if (isTransitionToPublished || targetStatus === 'scheduled') {
		enforcePublishSeoGate({
			...autofilled,
			categoryId: primaryCategoryId,
			categoryIds: dedupedCategoryIds,
			tagIds: dedupedTagIds,
			publishedAt: existingPost.publishedAt,
			updatedAt: existingPost.updatedAt
		});
	}

	// 6. Password handling: clear when visibility !== 'password_protected'
	let passwordToStore: string | null = null;
	if (autofilled.visibility === 'password_protected') {
		if (autofilled.password && autofilled.password.trim()) {
			passwordToStore = hashPostPassword(autofilled.password);
		} else if (existingPost.password) {
			passwordToStore = existingPost.password;
		} else {
			throw new Error(
				'VALIDATION_ERROR: Password is required when visibility is password_protected.'
			);
		}
	}

	const coverDims = await resolveCoverDimensions(autofilled.coverImage);

	const saveResult = await savePostWithRedirect({
		mode: 'update',
		id: parsed.id,
		actorUserId,
		expectedUpdatedAt: parsed.expectedUpdatedAt,
		forceOverwrite: parsed.forceOverwrite,
		values: {
			title: autofilled.title,
			slug: autofilled.slug,
			excerpt: autofilled.excerpt ?? null,
			content: autofilled.content,
			authorId: autofilled.authorId ?? null,
			coAuthorIds: autofilled.coAuthorIds ?? null,
			categoryId: primaryCategoryId,
			coverImage: autofilled.coverImage || null,
			coverImageAlt: autofilled.coverImageAlt ?? null,
			coverImageCaption: autofilled.coverImageCaption ?? null,
			coverImageWidth: coverDims.width ?? existingPost.coverImageWidth ?? null,
			coverImageHeight: coverDims.height ?? existingPost.coverImageHeight ?? null,
			metaTitle: autofilled.metaTitle ?? null,
			metaDescription: autofilled.metaDescription ?? null,
			ogTitle: autofilled.ogTitle ?? null,
			ogDescription: autofilled.ogDescription ?? null,
			ogImage: autofilled.ogImage || null,
			canonicalUrl: autofilled.canonicalUrl || null,
			focusKeyword: autofilled.focusKeyword ?? null,
			secondaryKeywords: autofilled.secondaryKeywords ?? null,
			robotsNoindex: autofilled.robotsNoindex ?? false,
			robotsNofollow: autofilled.robotsNofollow ?? false,
			schemaType: autofilled.schemaType ?? 'BlogPosting',
			twitterCardType: autofilled.twitterCardType ?? 'summary_large_image',
			twitterTitle: autofilled.twitterTitle ?? null,
			twitterDescription: autofilled.twitterDescription ?? null,
			twitterImage: autofilled.twitterImage || null,
			readingTime,
			wordCount,
			tableOfContents: JSON.stringify(toc),
			faqItems: autofilled.faqItems ?? null,
			status: targetStatus,
			visibility: autofilled.visibility ?? 'public',
			password: passwordToStore,
			template: autofilled.template ?? 'default',
			postFormat: autofilled.postFormat ?? 'standard',
			customFields: autofilled.customFields ?? null,
			featured: autofilled.featured ?? false,
			isPillar: autofilled.isPillar ?? false,
			isSticky: autofilled.isSticky ?? false,
			commentsEnabled: autofilled.commentsEnabled ?? true,
			pingbacksEnabled: autofilled.pingbacksEnabled ?? false,
			language: autofilled.language ?? 'en',
			translationOfId: autofilled.translationOfId ?? null,
			seriesId: autofilled.seriesId ?? null,
			seriesOrder: autofilled.seriesOrder ?? null,
			isFixture: autofilled.isFixture ?? existingPost.isFixture ?? false,
			scheduledAt: autofilled.scheduledAt ? new Date(autofilled.scheduledAt) : null,
			expiresAt: autofilled.expiresAt ? new Date(autofilled.expiresAt) : null
		},
		categoryIds: dedupedCategoryIds,
		tagIds: dedupedTagIds,
		relatedPostIds: dedupedRelatedIds,
		writeRevision: true
	});

	if (transformRes.changes.length > 0) {
		await writeAuditLog({
			actorUserId,
			action: 'post.content_transforms',
			entityType: 'post',
			entityId: saveResult.post.id,
			summary: { changes: transformRes.changes }
		});
	}

	await writeAuditLog({
		actorUserId,
		action: 'post.update',
		entityType: 'post',
		entityId: saveResult.post.id,
		summary: {
			slug: saveResult.post.slug,
			renamedFromSlug: saveResult.renamedFromSlug,
			status: saveResult.post.status,
			rewrittenInternalLinksCount: saveResult.rewrittenInternalLinksCount
		}
	});

	const notifyUrls: string[] = [];
	const cachePaths: string[] = [
		'/blog',
		`/blog/${saveResult.post.slug}`,
		'/rss.xml',
		'/sitemap.xml'
	];
	if (saveResult.renamedFromSlug) {
		cachePaths.push(`/blog/${saveResult.renamedFromSlug}`);
		notifyUrls.push(`https://revolutiontradingpros.com/blog/${saveResult.renamedFromSlug}`);
	}
	if (
		saveResult.post.status === 'published' ||
		saveResult.newlyPublished ||
		saveResult.unpublishedFromLive
	) {
		notifyUrls.push(`https://revolutiontradingpros.com/blog/${saveResult.post.slug}`);
		invalidatePublicBlogCache(cachePaths);
		notifySearchEnginesAsync(notifyUrls, { waitUntil });
	}

	return {
		...stripPasswordFromPostRow(saveResult.post),
		categoryIds: saveResult.categoryIds,
		tagIds: saveResult.tagIds,
		relatedPostIds: saveResult.relatedPostIds,
		renamedFromSlug: saveResult.renamedFromSlug,
		rewrittenInternalLinksCount: saveResult.rewrittenInternalLinksCount
	};
}

/**
 * Partial update (PATCH semantics): omitted `tagIds`, `categoryIds`, or `relatedPostIds` leave existing pivot rows untouched.
 */
export async function patchPost(
	rawInput: PostPatchInput,
	actorUserId?: string | null,
	waitUntil?: (p: Promise<unknown>) => void
) {
	const existing = await getPostById(rawInput.id);
	if (!existing) {
		throw new Error('POST_NOT_FOUND: Post does not exist or is in Trash.');
	}

	const merged: PostUpdateInput = {
		id: existing.id,
		title: rawInput.title ?? existing.title,
		slug: rawInput.slug ?? existing.slug,
		excerpt: rawInput.excerpt !== undefined ? rawInput.excerpt : existing.excerpt,
		content: rawInput.content ?? existing.content,
		authorId: rawInput.authorId !== undefined ? rawInput.authorId : existing.authorId,
		coAuthorIds: rawInput.coAuthorIds !== undefined ? rawInput.coAuthorIds : existing.coAuthorIds,
		categoryId: rawInput.categoryId !== undefined ? rawInput.categoryId : existing.categoryId,
		categoryIds: rawInput.categoryIds !== undefined ? rawInput.categoryIds : existing.categoryIds,
		tagIds: rawInput.tagIds !== undefined ? rawInput.tagIds : existing.tagIds,
		relatedPostIds:
			rawInput.relatedPostIds !== undefined ? rawInput.relatedPostIds : existing.relatedPostIds,
		coverImage:
			rawInput.coverImage !== undefined ? rawInput.coverImage : (existing.coverImage ?? ''),
		coverImageAlt:
			rawInput.coverImageAlt !== undefined ? rawInput.coverImageAlt : existing.coverImageAlt,
		coverImageCaption:
			rawInput.coverImageCaption !== undefined
				? rawInput.coverImageCaption
				: existing.coverImageCaption,
		metaTitle: rawInput.metaTitle !== undefined ? rawInput.metaTitle : existing.metaTitle,
		metaDescription:
			rawInput.metaDescription !== undefined ? rawInput.metaDescription : existing.metaDescription,
		ogTitle: rawInput.ogTitle !== undefined ? rawInput.ogTitle : existing.ogTitle,
		ogDescription:
			rawInput.ogDescription !== undefined ? rawInput.ogDescription : existing.ogDescription,
		ogImage: rawInput.ogImage !== undefined ? rawInput.ogImage : (existing.ogImage ?? ''),
		canonicalUrl:
			rawInput.canonicalUrl !== undefined ? rawInput.canonicalUrl : (existing.canonicalUrl ?? ''),
		focusKeyword:
			rawInput.focusKeyword !== undefined ? rawInput.focusKeyword : existing.focusKeyword,
		secondaryKeywords:
			rawInput.secondaryKeywords !== undefined
				? rawInput.secondaryKeywords
				: existing.secondaryKeywords,
		robotsNoindex:
			rawInput.robotsNoindex !== undefined ? rawInput.robotsNoindex : existing.robotsNoindex,
		robotsNofollow:
			rawInput.robotsNofollow !== undefined ? rawInput.robotsNofollow : existing.robotsNofollow,
		schemaType:
			(rawInput.schemaType ?? (existing.schemaType as PostUpdateInput['schemaType'])) ||
			'BlogPosting',
		twitterCardType:
			(rawInput.twitterCardType ??
				(existing.twitterCardType as PostUpdateInput['twitterCardType'])) ||
			'summary_large_image',
		twitterTitle:
			rawInput.twitterTitle !== undefined ? rawInput.twitterTitle : existing.twitterTitle,
		twitterDescription:
			rawInput.twitterDescription !== undefined
				? rawInput.twitterDescription
				: existing.twitterDescription,
		twitterImage:
			rawInput.twitterImage !== undefined ? rawInput.twitterImage : (existing.twitterImage ?? ''),
		faqItems: rawInput.faqItems !== undefined ? rawInput.faqItems : existing.faqItems,
		status: (rawInput.status ?? (existing.status as PostUpdateInput['status'])) || 'draft',
		visibility:
			(rawInput.visibility ?? (existing.visibility as PostUpdateInput['visibility'])) || 'public',
		password: rawInput.password,
		template:
			(rawInput.template ?? (existing.template as PostUpdateInput['template'])) || 'default',
		postFormat:
			(rawInput.postFormat ?? (existing.postFormat as PostUpdateInput['postFormat'])) || 'standard',
		customFields:
			rawInput.customFields !== undefined ? rawInput.customFields : existing.customFields,
		featured: rawInput.featured !== undefined ? rawInput.featured : existing.featured,
		isPillar: rawInput.isPillar !== undefined ? rawInput.isPillar : existing.isPillar,
		isSticky: rawInput.isSticky !== undefined ? rawInput.isSticky : existing.isSticky,
		commentsEnabled:
			rawInput.commentsEnabled !== undefined ? rawInput.commentsEnabled : existing.commentsEnabled,
		pingbacksEnabled:
			rawInput.pingbacksEnabled !== undefined
				? rawInput.pingbacksEnabled
				: existing.pingbacksEnabled,
		language: rawInput.language ?? existing.language ?? 'en',
		translationOfId:
			rawInput.translationOfId !== undefined ? rawInput.translationOfId : existing.translationOfId,
		seriesId: rawInput.seriesId !== undefined ? rawInput.seriesId : existing.seriesId,
		seriesOrder: rawInput.seriesOrder !== undefined ? rawInput.seriesOrder : existing.seriesOrder,
		isFixture: rawInput.isFixture !== undefined ? rawInput.isFixture : existing.isFixture,
		scheduledAt:
			rawInput.scheduledAt !== undefined
				? rawInput.scheduledAt
				: (existing.scheduledAt?.toISOString() ?? null),
		expiresAt:
			rawInput.expiresAt !== undefined
				? rawInput.expiresAt
				: (existing.expiresAt?.toISOString() ?? null),
		expectedUpdatedAt: rawInput.expectedUpdatedAt,
		forceOverwrite: rawInput.forceOverwrite ?? false
	};

	const validatedPatch = postPatchSchema.parse(rawInput);
	void validatedPatch;

	return updatePost(merged, actorUserId, waitUntil);
}

export async function quickUpdatePost(
	rawInput: PostQuickUpdateInput,
	actorUserId?: string | null,
	waitUntil?: (p: Promise<unknown>) => void
) {
	const parsed = postQuickUpdateSchema.parse(rawInput);
	const existing = await getPostById(parsed.id);
	if (!existing) {
		throw new Error('POST_NOT_FOUND: Post does not exist or is in Trash.');
	}

	const nextTitle =
		parsed.title !== undefined ? replaceEmEnDashesInPlainText(parsed.title) : existing.title;
	const nextSlug = parsed.slug ?? existing.slug;
	const nextStatus =
		parsed.status ?? (existing.status as PostQuickUpdateInput['status']) ?? 'draft';
	const nextAuthorId = parsed.authorId !== undefined ? parsed.authorId : existing.authorId;
	const nextCategoryId = parsed.categoryId !== undefined ? parsed.categoryId : existing.categoryId;
	const nextFeatured = parsed.featured !== undefined ? parsed.featured : existing.featured;
	const nextIsPillar = parsed.isPillar !== undefined ? parsed.isPillar : existing.isPillar;
	const nextIsSticky = parsed.isSticky !== undefined ? parsed.isSticky : existing.isSticky;

	const nextScheduledAt =
		parsed.scheduledAt !== undefined
			? parsed.scheduledAt
				? new Date(parsed.scheduledAt)
				: null
			: existing.scheduledAt;
	const nextExpiresAt =
		parsed.expiresAt !== undefined
			? parsed.expiresAt
				? new Date(parsed.expiresAt)
				: null
			: existing.expiresAt;

	if (nextStatus === 'scheduled') {
		if (!nextScheduledAt || nextScheduledAt.getTime() < Date.now() - 60_000) {
			throw new Error(
				'VALIDATION_ERROR: A scheduled post requires a scheduledAt timestamp not more than 60 seconds in the past.'
			);
		}
	}

	const categoryIdsForGate = [
		...new Set([...existing.categoryIds, ...(nextCategoryId ? [nextCategoryId] : [])])
	];

	const isTransitionToPublished = nextStatus === 'published' && existing.status !== 'published';
	if (isTransitionToPublished || nextStatus === 'scheduled') {
		enforcePublishSeoGate({
			title: nextTitle,
			slug: nextSlug,
			content: existing.content,
			excerpt: existing.excerpt,
			metaTitle: existing.metaTitle,
			metaDescription: existing.metaDescription,
			coverImage: existing.coverImage,
			coverImageAlt: existing.coverImageAlt,
			coverImageCaption: existing.coverImageCaption,
			ogTitle: existing.ogTitle,
			ogDescription: existing.ogDescription,
			ogImage: existing.ogImage,
			twitterTitle: existing.twitterTitle,
			twitterDescription: existing.twitterDescription,
			authorId: nextAuthorId,
			categoryId: nextCategoryId,
			categoryIds: categoryIdsForGate,
			tagIds: existing.tagIds,
			focusKeyword: existing.focusKeyword,
			secondaryKeywords: existing.secondaryKeywords,
			faqItems: existing.faqItems,
			publishedAt: existing.publishedAt,
			updatedAt: existing.updatedAt
		});
	}

	const toc = extractTocFromHtml(existing.content, nextTitle);

	const saveResult = await savePostWithRedirect({
		mode: 'quick_update',
		id: existing.id,
		actorUserId,
		expectedUpdatedAt: parsed.expectedUpdatedAt,
		values: {
			title: nextTitle,
			slug: nextSlug,
			content: existing.content,
			status: nextStatus,
			authorId: nextAuthorId,
			categoryId: nextCategoryId,
			featured: nextFeatured,
			isPillar: nextIsPillar,
			isSticky: nextIsSticky,
			tableOfContents: JSON.stringify(toc),
			scheduledAt: nextScheduledAt,
			expiresAt: nextExpiresAt
		}
	});

	await writeAuditLog({
		actorUserId,
		action: 'post.quick_update',
		entityType: 'post',
		entityId: saveResult.post.id,
		summary: {
			slug: saveResult.post.slug,
			renamedFromSlug: saveResult.renamedFromSlug,
			status: saveResult.post.status
		}
	});

	if (
		saveResult.post.status === 'published' ||
		saveResult.newlyPublished ||
		saveResult.unpublishedFromLive ||
		saveResult.renamedFromSlug
	) {
		const paths = ['/blog', `/blog/${saveResult.post.slug}`, '/rss.xml', '/sitemap.xml'];
		const urls = [`https://revolutiontradingpros.com/blog/${saveResult.post.slug}`];
		if (saveResult.renamedFromSlug) {
			paths.push(`/blog/${saveResult.renamedFromSlug}`);
			urls.push(`https://revolutiontradingpros.com/blog/${saveResult.renamedFromSlug}`);
		}
		invalidatePublicBlogCache(paths);
		notifySearchEnginesAsync(urls, { waitUntil });
	}

	return {
		...stripPasswordFromPostRow(saveResult.post),
		categoryIds: saveResult.categoryIds,
		tagIds: saveResult.tagIds,
		relatedPostIds: saveResult.relatedPostIds,
		renamedFromSlug: saveResult.renamedFromSlug
	};
}

export async function autosavePost(
	rawInput: PostAutosaveInput,
	actorUserId?: string | null
): Promise<{
	saved: true;
	deduplicated: boolean;
	revisionId: number;
	createdAt: Date;
}> {
	const parsed = postAutosaveSchema.parse(rawInput);
	const db = await ensureDbReady();

	return db.transaction(async (tx) => {
		const rows = await tx
			.select()
			.from(posts)
			.where(and(eq(posts.id, parsed.id), isNull(posts.deletedAt)))
			.limit(1);

		const existingPost = rows[0];
		if (!existingPost) {
			throw new Error('POST_NOT_FOUND: Post does not exist or is in Trash.');
		}

		if (parsed.expectedUpdatedAt) {
			const expectedMs = Date.parse(parsed.expectedUpdatedAt);
			const actualMs = existingPost.updatedAt.getTime();
			if (!Number.isNaN(expectedMs) && Math.abs(expectedMs - actualMs) > 1) {
				throw new Error(
					'STALE_WRITE: This post was modified by another session. Reload latest or overwrite.'
				);
			}
		}

		// Strip dashes and sanitize content before storing snapshot (Section 7.4 & 8.2)
		const cleanTitle = replaceEmEnDashesInPlainText(parsed.title ?? '');
		const cleanExcerpt =
			parsed.excerpt !== null && parsed.excerpt !== undefined
				? replaceEmEnDashesInPlainText(parsed.excerpt)
				: null;
		const cleanContent = sanitizePostHtml(replaceEmEnDashesInHtml(parsed.content ?? ''));

		// Dedupe: skip insert when snapshot matches the latest revision (Section 7.7)
		const latestRevs = await tx
			.select()
			.from(revisions)
			.where(eq(revisions.postId, parsed.id))
			.orderBy(desc(revisions.createdAt), desc(revisions.id))
			.limit(1);

		const latest = latestRevs[0];
		if (
			latest &&
			latest.titleSnapshot === cleanTitle &&
			latest.contentSnapshot === cleanContent &&
			(latest.excerptSnapshot ?? '') === (cleanExcerpt ?? '')
		) {
			return {
				saved: true,
				deduplicated: true,
				revisionId: latest.id,
				createdAt: latest.createdAt
			};
		}

		const newWordCount = countContentWords(cleanContent);
		const wordCountDelta = newWordCount - (existingPost.wordCount ?? 0);

		const inserted = await tx
			.insert(revisions)
			.values({
				postId: parsed.id,
				userId: actorUserId ?? null,
				titleSnapshot: cleanTitle,
				contentSnapshot: cleanContent,
				excerptSnapshot: cleanExcerpt,
				wordCount: newWordCount,
				wordCountDelta,
				changeType: 'autosave'
			})
			.returning();

		await pruneAutosaveRevisions(tx, parsed.id, AUTOSAVE_RETENTION_LIMIT);

		return {
			saved: true,
			deduplicated: false,
			revisionId: inserted[0].id,
			createdAt: inserted[0].createdAt
		};
	});
}

export async function listPostRevisions(postId: number) {
	const db = await ensureDbReady();
	// Latest 50 WITHOUT full content_snapshot (Section 7.7)
	return db
		.select({
			id: revisions.id,
			postId: revisions.postId,
			userId: revisions.userId,
			titleSnapshot: revisions.titleSnapshot,
			excerptSnapshot: revisions.excerptSnapshot,
			wordCount: revisions.wordCount,
			wordCountDelta: revisions.wordCountDelta,
			changeType: revisions.changeType,
			createdAt: revisions.createdAt
		})
		.from(revisions)
		.where(eq(revisions.postId, postId))
		.orderBy(desc(revisions.createdAt), desc(revisions.id))
		.limit(50);
}

export async function getPostRevisionById(postId: number, revisionId: number) {
	const db = await ensureDbReady();
	const rows = await db
		.select()
		.from(revisions)
		.where(and(eq(revisions.id, revisionId), eq(revisions.postId, postId)))
		.limit(1);

	return rows[0] ?? null;
}

export async function restorePostRevision(
	postId: number,
	revisionId: number,
	actorUserId?: string | null
) {
	const db = await ensureDbReady();

	return db.transaction(async (tx) => {
		const postRows = await tx
			.select()
			.from(posts)
			.where(and(eq(posts.id, postId), isNull(posts.deletedAt)))
			.for('update');

		const currentPost = postRows[0];
		if (!currentPost) {
			throw new Error('POST_NOT_FOUND: Post does not exist or is in Trash.');
		}

		const revRows = await tx
			.select()
			.from(revisions)
			.where(and(eq(revisions.id, revisionId), eq(revisions.postId, postId)))
			.limit(1);

		const rev = revRows[0];
		if (!rev) {
			throw new Error('REVISION_NOT_FOUND: Revision does not belong to this post.');
		}

		// Strip dashes and sanitize restored snapshot (Section 7.4 & 7.7)
		const restoredTitle = replaceEmEnDashesInPlainText(rev.titleSnapshot);
		const restoredExcerpt =
			rev.excerptSnapshot !== null ? replaceEmEnDashesInPlainText(rev.excerptSnapshot) : null;
		const restoredContent = sanitizePostHtml(replaceEmEnDashesInHtml(rev.contentSnapshot));

		const newWordCount = countContentWords(restoredContent);
		const newReadingTime = computeReadingTime(newWordCount);
		const newToc = extractTocFromHtml(restoredContent, restoredTitle);

		// Re-gate ONLY if currently scheduled (Section 7.6 & 7.7)
		if (currentPost.status === 'scheduled') {
			const [catRows, tagRows] = await Promise.all([
				tx
					.select({ categoryId: postCategories.categoryId })
					.from(postCategories)
					.where(eq(postCategories.postId, postId)),
				tx.select({ tagId: postTags.tagId }).from(postTags).where(eq(postTags.postId, postId))
			]);

			enforcePublishSeoGate({
				title: restoredTitle,
				slug: currentPost.slug,
				content: restoredContent,
				excerpt: restoredExcerpt,
				metaTitle: currentPost.metaTitle,
				metaDescription: currentPost.metaDescription,
				coverImage: currentPost.coverImage,
				coverImageAlt: currentPost.coverImageAlt,
				coverImageCaption: currentPost.coverImageCaption,
				ogTitle: currentPost.ogTitle,
				ogDescription: currentPost.ogDescription,
				ogImage: currentPost.ogImage,
				twitterTitle: currentPost.twitterTitle,
				twitterDescription: currentPost.twitterDescription,
				authorId: currentPost.authorId,
				categoryId: currentPost.categoryId,
				categoryIds: catRows.map((c) => c.categoryId),
				tagIds: tagRows.map((t) => t.tagId),
				focusKeyword: currentPost.focusKeyword,
				secondaryKeywords: currentPost.secondaryKeywords,
				faqItems: currentPost.faqItems,
				publishedAt: currentPost.publishedAt,
				updatedAt: currentPost.updatedAt
			});
		}

		const now = new Date();
		const wordCountDelta = newWordCount - (currentPost.wordCount ?? 0);

		const updatedRows = await tx
			.update(posts)
			.set({
				title: restoredTitle,
				content: restoredContent,
				excerpt: restoredExcerpt,
				wordCount: newWordCount,
				readingTime: newReadingTime,
				tableOfContents: JSON.stringify(newToc),
				contentUpdatedAt: now,
				updatedAt: now
			})
			.where(eq(posts.id, postId))
			.returning();

		await tx.insert(revisions).values({
			postId,
			userId: actorUserId ?? null,
			titleSnapshot: restoredTitle,
			contentSnapshot: restoredContent,
			excerptSnapshot: restoredExcerpt,
			wordCount: newWordCount,
			wordCountDelta,
			changeType: 'restore',
			createdAt: now
		});

		await writeAuditLog(
			{
				actorUserId,
				action: 'post.restore_revision',
				entityType: 'post',
				entityId: postId,
				summary: { revisionId }
			},
			tx
		);

		return stripPasswordFromPostRow(updatedRows[0]);
	});
}

export async function trashPost(
	postId: number,
	actorUserId?: string | null,
	waitUntil?: (p: Promise<unknown>) => void
) {
	const db = await ensureDbReady();
	const now = new Date();

	const result = await db.transaction(async (tx) => {
		const rows = await tx
			.select()
			.from(posts)
			.where(and(eq(posts.id, postId), isNull(posts.deletedAt)))
			.limit(1);

		const existing = rows[0];
		if (!existing) {
			throw new Error('POST_NOT_FOUND: Post not found or already in Trash.');
		}

		const updated = await tx
			.update(posts)
			.set({
				deletedAt: now,
				featured: false,
				updatedAt: now
			})
			.where(eq(posts.id, postId))
			.returning();

		// Deactivate redirects pointing at the trashed post's path (Section 7.11)
		const targetPath = `/blog/${existing.slug}`;
		await tx
			.update(redirects)
			.set({ isActive: false })
			.where(and(eq(redirects.targetPath, targetPath), eq(redirects.isActive, true)));

		await writeAuditLog(
			{
				actorUserId,
				action: 'post.trash',
				entityType: 'post',
				entityId: postId,
				summary: { slug: existing.slug }
			},
			tx
		);

		return updated[0];
	});

	if (result.published) {
		invalidatePublicBlogCache(['/blog', `/blog/${result.slug}`, '/rss.xml', '/sitemap.xml']);
		notifySearchEnginesAsync([`https://revolutiontradingpros.com/blog/${result.slug}`], {
			waitUntil
		});
	}

	return stripPasswordFromPostRow(result);
}

export async function restoreTrashedPost(
	postId: number,
	actorUserId?: string | null,
	waitUntil?: (p: Promise<unknown>) => void
) {
	const db = await ensureDbReady();
	const now = new Date();

	const result = await db.transaction(async (tx) => {
		const rows = await tx
			.select()
			.from(posts)
			.where(and(eq(posts.id, postId), isNotNull(posts.deletedAt)))
			.limit(1);

		const existing = rows[0];
		if (!existing) {
			throw new Error('POST_NOT_FOUND: Post is not in Trash.');
		}

		// Strip dashes on restore (Section 7.4)
		const cleanTitle = replaceEmEnDashesInPlainText(existing.title);
		const cleanContent = sanitizePostHtml(replaceEmEnDashesInHtml(existing.content));
		const cleanExcerpt =
			existing.excerpt !== null ? replaceEmEnDashesInPlainText(existing.excerpt) : null;

		// Re-gate on restore when currently scheduled (Section 7.6)
		if (existing.status === 'scheduled') {
			const [catRows, tagRows] = await Promise.all([
				tx
					.select({ categoryId: postCategories.categoryId })
					.from(postCategories)
					.where(eq(postCategories.postId, postId)),
				tx.select({ tagId: postTags.tagId }).from(postTags).where(eq(postTags.postId, postId))
			]);

			enforcePublishSeoGate({
				title: cleanTitle,
				slug: existing.slug,
				content: cleanContent,
				excerpt: cleanExcerpt,
				metaTitle: existing.metaTitle,
				metaDescription: existing.metaDescription,
				coverImage: existing.coverImage,
				coverImageAlt: existing.coverImageAlt,
				coverImageCaption: existing.coverImageCaption,
				ogTitle: existing.ogTitle,
				ogDescription: existing.ogDescription,
				ogImage: existing.ogImage,
				twitterTitle: existing.twitterTitle,
				twitterDescription: existing.twitterDescription,
				authorId: existing.authorId,
				categoryId: existing.categoryId,
				categoryIds: catRows.map((c) => c.categoryId),
				tagIds: tagRows.map((t) => t.tagId),
				focusKeyword: existing.focusKeyword,
				secondaryKeywords: existing.secondaryKeywords,
				faqItems: existing.faqItems,
				publishedAt: existing.publishedAt,
				updatedAt: existing.updatedAt
			});
		}

		const updated = await tx
			.update(posts)
			.set({
				title: cleanTitle,
				content: cleanContent,
				excerpt: cleanExcerpt,
				deletedAt: null,
				updatedAt: now
			})
			.where(eq(posts.id, postId))
			.returning();

		await writeAuditLog(
			{
				actorUserId,
				action: 'post.restore_from_trash',
				entityType: 'post',
				entityId: postId,
				summary: { slug: existing.slug }
			},
			tx
		);

		return updated[0];
	});

	if (result.published) {
		invalidatePublicBlogCache(['/blog', `/blog/${result.slug}`, '/rss.xml', '/sitemap.xml']);
		notifySearchEnginesAsync([`https://revolutiontradingpros.com/blog/${result.slug}`], {
			waitUntil
		});
	}

	return stripPasswordFromPostRow(result);
}

export async function permanentlyDeletePost(postId: number, actorUserId?: string | null) {
	const db = await ensureDbReady();

	return db.transaction(async (tx) => {
		const rows = await tx.select().from(posts).where(eq(posts.id, postId)).limit(1);
		const existing = rows[0];
		if (!existing) {
			throw new Error('POST_NOT_FOUND: Post does not exist.');
		}

		const targetPath = `/blog/${existing.slug}`;
		await tx
			.update(redirects)
			.set({ isActive: false })
			.where(and(eq(redirects.targetPath, targetPath), eq(redirects.isActive, true)));

		await tx.delete(posts).where(eq(posts.id, postId));

		await writeAuditLog(
			{
				actorUserId,
				action: 'post.delete_permanently',
				entityType: 'post',
				entityId: postId,
				summary: { slug: existing.slug }
			},
			tx
		);

		return { deleted: true, id: postId, slug: existing.slug };
	});
}

export async function emptyTrash(actorUserId?: string | null) {
	const db = await ensureDbReady();
	return db.transaction(async (tx) => {
		const trashedRows = await tx
			.select({ id: posts.id, slug: posts.slug })
			.from(posts)
			.where(isNotNull(posts.deletedAt));

		if (trashedRows.length === 0) {
			return { deletedCount: 0 };
		}

		const targetPaths = trashedRows.map((r) => `/blog/${r.slug}`);
		await tx
			.update(redirects)
			.set({ isActive: false })
			.where(and(inArray(redirects.targetPath, targetPaths), eq(redirects.isActive, true)));

		const ids = trashedRows.map((r) => r.id);
		await tx.delete(posts).where(inArray(posts.id, ids));

		await writeAuditLog(
			{
				actorUserId,
				action: 'post.empty_trash',
				entityType: 'post',
				entityId: 'trash',
				summary: { deletedCount: trashedRows.length, ids }
			},
			tx
		);

		return { deletedCount: trashedRows.length };
	});
}

export async function listFeaturedPosts(limit: number = 3) {
	const db = await ensureDbReady();
	const now = new Date();
	const rows = await db
		.select({
			post: posts,
			authorName: authors.name,
			authorSlug: authors.slug,
			authorAvatar: authors.avatar,
			categoryName: categories.name,
			categorySlug: categories.slug
		})
		.from(posts)
		.leftJoin(authors, eq(posts.authorId, authors.id))
		.leftJoin(categories, eq(posts.categoryId, categories.id))
		.where(and(publicIndexablePostPredicate(now), eq(posts.featured, true)))
		.orderBy(desc(posts.publishedAt), desc(posts.id))
		.limit(limit);

	return rows.map((r) => ({
		...stripPasswordFromPostRow(r.post),
		authorName: r.authorName,
		authorSlug: r.authorSlug,
		authorAvatar: r.authorAvatar,
		categoryName: r.categoryName,
		categorySlug: r.categorySlug
	}));
}

export async function listPublicPosts(options?: {
	page?: number;
	perPage?: number;
	categoryId?: number;
	tagId?: number;
	search?: string;
}) {
	const db = await ensureDbReady();
	const now = new Date();
	const page = Math.max(1, options?.page ?? 1);
	const perPage = Math.max(1, Math.min(50, options?.perPage ?? 12));
	const offset = (page - 1) * perPage;

	const filters = [publicIndexablePostPredicate(now)];

	if (options?.categoryId) {
		const catId = options.categoryId;
		const pivotPostIds = db
			.select({ postId: postCategories.postId })
			.from(postCategories)
			.where(eq(postCategories.categoryId, catId));
		filters.push(or(eq(posts.categoryId, catId), inArray(posts.id, pivotPostIds))!);
	}

	if (options?.tagId) {
		const pivotPostIds = db
			.select({ postId: postTags.postId })
			.from(postTags)
			.where(eq(postTags.tagId, options.tagId));
		filters.push(inArray(posts.id, pivotPostIds));
	}

	if (options?.search && options.search.trim()) {
		const escaped = options.search.trim().replace(/[%_\\]/g, '\\$&');
		const pattern = `%${escaped}%`;
		filters.push(or(ilike(posts.title, pattern), ilike(posts.excerpt, pattern))!);
	}

	const whereClause = and(...filters)!;

	const [totalRows, items] = await Promise.all([
		db.select({ total: count() }).from(posts).where(whereClause),
		db
			.select({
				post: posts,
				authorName: authors.name,
				authorSlug: authors.slug,
				authorAvatar: authors.avatar,
				authorJobTitle: authors.jobTitle,
				categoryName: categories.name,
				categorySlug: categories.slug,
				categoryColor: categories.color
			})
			.from(posts)
			.leftJoin(authors, eq(posts.authorId, authors.id))
			.leftJoin(categories, eq(posts.categoryId, categories.id))
			.where(whereClause)
			.orderBy(desc(posts.isSticky), desc(posts.publishedAt), desc(posts.id))
			.limit(perPage)
			.offset(offset)
	]);

	const total = Number(totalRows[0]?.total ?? 0);

	return {
		items: items.map((r) => ({
			...stripPasswordFromPostRow(r.post),
			authorName: r.authorName,
			authorSlug: r.authorSlug,
			authorAvatar: r.authorAvatar,
			authorJobTitle: r.authorJobTitle,
			categoryName: r.categoryName,
			categorySlug: r.categorySlug,
			categoryColor: r.categoryColor
		})),
		total,
		page,
		perPage,
		totalPages: Math.max(1, Math.ceil(total / perPage))
	};
}

export interface RelatedCandidate {
	id: number;
	slug: string;
	title: string;
	excerpt?: string | null;
	coverImage?: string | null;
	coverImageAlt?: string | null;
	readingTime?: number;
	categoryId: number | null;
	categoryName?: string | null;
	categorySlug?: string | null;
	tagIds: number[];
	publishedAt: Date | string | null;
}

/**
 * Pure related-post ranking function (Section 10.4):
 * Score = shared tags * 2 + 3 (if same primary category) + 4 (if slug in prioritySlugs).
 * Ties broken by newest `publishedAt`, then lower `id`. Top 3.
 */
export function rankRelatedPosts<T extends RelatedCandidate>(
	current: {
		id: number;
		categoryId: number | null;
		tagIds: number[];
	},
	candidates: T[],
	prioritySlugs: ReadonlySet<string> = INTERNAL_LINK_PRIORITY_SLUGS
): T[] {
	const currentTagSet = new Set(current.tagIds);

	const scored = candidates
		.filter((c) => c.id !== current.id)
		.map((candidate) => {
			let sharedTags = 0;
			for (const tid of candidate.tagIds) {
				if (currentTagSet.has(tid)) sharedTags += 1;
			}
			const sameCategoryBonus =
				current.categoryId !== null && candidate.categoryId === current.categoryId ? 3 : 0;
			const priorityBonus = prioritySlugs.has(candidate.slug) ? 4 : 0;
			const score = sharedTags * 2 + sameCategoryBonus + priorityBonus;
			const pubMs = candidate.publishedAt
				? candidate.publishedAt instanceof Date
					? candidate.publishedAt.getTime()
					: Date.parse(candidate.publishedAt)
				: 0;

			return {
				candidate,
				score,
				pubMs: Number.isNaN(pubMs) ? 0 : pubMs
			};
		});

	scored.sort((a, b) => {
		if (b.score !== a.score) return b.score - a.score;
		if (b.pubMs !== a.pubMs) return b.pubMs - a.pubMs;
		return a.candidate.id - b.candidate.id;
	});

	return scored.slice(0, 3).map((s) => s.candidate);
}

export function stripDuplicateLeadImage(
	html: string,
	coverImageUrl: string | null | undefined
): string {
	if (!html || !coverImageUrl) return html;
	const getFileStem = (url: string) => {
		const filename = url.split('/').pop()?.split('?')[0] ?? '';
		return filename
			.replace(/-(?:480|800|1200)w\.(?:webp|png|jpe?g|avif)$/i, '')
			.replace(/\.[a-z0-9]+$/i, '')
			.toLowerCase();
	};
	const coverStem = getFileStem(coverImageUrl);
	if (!coverStem) return html;

	return html.replace(
		/^\s*(?:<p>\s*)?<img\b[^>]*?\bsrc=["']([^"']+)["'][^>]*>\s*(?:<\/p>)?/i,
		(full, imgSrc: string) => {
			if (getFileStem(imgSrc) === coverStem) {
				return '';
			}
			return full;
		}
	);
}

export async function getPublicPostViewBySlug(
	slug: string,
	options?: {
		isAdmin?: boolean;
		hasValidPreviewToken?: boolean;
		isPasswordUnlocked?: (postId: number, storedPasswordHash: string | null) => boolean;
	}
) {
	const db = await ensureDbReady();
	const now = new Date();
	const cleanSlug = slug.trim().toLowerCase();

	const rows = await db
		.select({
			post: posts,
			author: authors,
			category: categories
		})
		.from(posts)
		.leftJoin(authors, eq(posts.authorId, authors.id))
		.leftJoin(categories, eq(posts.categoryId, categories.id))
		.where(and(eq(posts.slug, cleanSlug), isNull(posts.deletedAt)))
		.limit(1);

	const row = rows[0];
	if (!row) {
		return { status: 404 as const };
	}

	const { post, author, category } = row;
	const canBypassLiveCheck = Boolean(options?.isAdmin || options?.hasValidPreviewToken);

	if (!canBypassLiveCheck && !isPostLiveAtReadTime(post, now)) {
		return { status: 404 as const };
	}

	// Members visibility -> 403 for non-admins (Section 7.15)
	if (post.visibility === 'members' && !options?.isAdmin) {
		return { status: 403 as const, title: post.title, slug: post.slug };
	}

	// Password-protected branch (Section 7.15)
	if (post.visibility === 'password_protected' && !options?.isAdmin) {
		const unlocked = options?.isPasswordUnlocked
			? options.isPasswordUnlocked(post.id, post.password)
			: false;

		if (!unlocked) {
			return {
				status: 200 as const,
				locked: true as const,
				payload: buildLockedPostPayload(post)
			};
		}
	}

	// Fetch tags, manual related posts (ordered by sort_order, capped at 3), and prev/next posts
	const [postTagRows, manualRelRows, prevRows, nextRows] = await Promise.all([
		db
			.select({
				id: tags.id,
				name: tags.name,
				slug: tags.slug
			})
			.from(postTags)
			.innerJoin(tags, eq(postTags.tagId, tags.id))
			.where(eq(postTags.postId, post.id)),
		db
			.select({
				post: posts,
				categoryName: categories.name,
				categorySlug: categories.slug,
				sortOrder: relatedPosts.sortOrder
			})
			.from(relatedPosts)
			.innerJoin(posts, eq(relatedPosts.relatedPostId, posts.id))
			.leftJoin(categories, eq(posts.categoryId, categories.id))
			.where(and(eq(relatedPosts.postId, post.id), publicIndexablePostPredicate(now)))
			.orderBy(asc(relatedPosts.sortOrder))
			.limit(3),
		post.publishedAt
			? db
					.select({ title: posts.title, slug: posts.slug })
					.from(posts)
					.where(
						and(
							publicIndexablePostPredicate(now),
							ne(posts.id, post.id),
							lt(posts.publishedAt, post.publishedAt)
						)
					)
					.orderBy(desc(posts.publishedAt), desc(posts.id))
					.limit(1)
			: Promise.resolve([]),
		post.publishedAt
			? db
					.select({ title: posts.title, slug: posts.slug })
					.from(posts)
					.where(
						and(
							publicIndexablePostPredicate(now),
							ne(posts.id, post.id),
							gt(posts.publishedAt, post.publishedAt)
						)
					)
					.orderBy(asc(posts.publishedAt), asc(posts.id))
					.limit(1)
			: Promise.resolve([])
	]);

	let finalRelated = manualRelRows.map((r) => ({
		id: r.post.id,
		slug: r.post.slug,
		title: r.post.title,
		excerpt: r.post.excerpt,
		coverImage: r.post.coverImage,
		coverImageAlt: r.post.coverImageAlt,
		readingTime: r.post.readingTime,
		categoryId: r.post.categoryId,
		categoryName: r.categoryName,
		categorySlug: r.categorySlug,
		publishedAt: r.post.publishedAt
	}));

	if (finalRelated.length === 0) {
		const candidateRows = await db
			.select({
				post: posts,
				categoryName: categories.name,
				categorySlug: categories.slug
			})
			.from(posts)
			.leftJoin(categories, eq(posts.categoryId, categories.id))
			.where(and(publicIndexablePostPredicate(now), ne(posts.id, post.id)))
			.orderBy(desc(posts.publishedAt), desc(posts.id))
			.limit(40);

		const candidateIds = candidateRows.map((c) => c.post.id);
		const candidateTagRows =
			candidateIds.length > 0
				? await db
						.select({ postId: postTags.postId, tagId: postTags.tagId })
						.from(postTags)
						.where(inArray(postTags.postId, candidateIds))
				: [];

		const tagsByPost = new Map<number, number[]>();
		for (const tr of candidateTagRows) {
			const arr = tagsByPost.get(tr.postId) ?? [];
			arr.push(tr.tagId);
			tagsByPost.set(tr.postId, arr);
		}

		const ranked = rankRelatedPosts(
			{
				id: post.id,
				categoryId: post.categoryId,
				tagIds: postTagRows.map((t) => t.id)
			},
			candidateRows.map((c) => ({
				id: c.post.id,
				slug: c.post.slug,
				title: c.post.title,
				excerpt: c.post.excerpt,
				coverImage: c.post.coverImage,
				coverImageAlt: c.post.coverImageAlt,
				readingTime: c.post.readingTime,
				categoryId: c.post.categoryId,
				categoryName: c.categoryName,
				categorySlug: c.categorySlug,
				tagIds: tagsByPost.get(c.post.id) ?? [],
				publishedAt: c.post.publishedAt
			}))
		);

		finalRelated = ranked;
	}

	const sanitizedBody = stripDuplicateLeadImage(sanitizePostHtml(post.content), post.coverImage);
	const { html: normalizedHtml, toc } = normalizePostHeadings(sanitizedBody, post.title);

	return {
		status: 200 as const,
		locked: false as const,
		post: {
			...stripPasswordFromPostRow(post),
			content: normalizedHtml,
			toc,
			author: author ?? null,
			category: category ?? null,
			tags: postTagRows,
			relatedPosts: finalRelated,
			previousPost: prevRows[0] ?? null,
			nextPost: nextRows[0] ?? null,
			isIndexable: isPubliclyIndexablePost(post, now)
		}
	};
}
