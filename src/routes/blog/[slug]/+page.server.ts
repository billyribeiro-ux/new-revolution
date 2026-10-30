import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq, isNull } from 'drizzle-orm';
import {
	buildBlogPageMetaTags,
	buildBlogPostJsonLd,
	resolvePostModifiedIso
} from '#lib/seo/blog-seo';
import { getClientIp } from '#lib/server/auth-guard';
import { ensureDbReady } from '#lib/server/db';
import { media, posts } from '#lib/server/db/schema';
import { setNoStoreCache, setPublicReadCache } from '#lib/server/posts/cache';
import { highlightPostCodeBlocks } from '#lib/server/posts/highlight';
import {
	getPostPasswordCookieName,
	isPostLiveAtReadTime,
	signPostUnlockToken,
	verifyDraftPreviewToken,
	verifyPostPassword,
	verifyPostUnlockToken
} from '#lib/server/posts/visibility';
import {
	consumeRateLimit,
	RATE_LIMIT_PASSWORD_UNLOCK_ATTEMPTS,
	RATE_LIMIT_PASSWORD_UNLOCK_WINDOW_MS
} from '#lib/server/rate-limit';
import { getPublicPostViewBySlug } from '#lib/server/services/posts';
import type { Actions, PageServerLoad } from './$types';

export const prerender = false;

function lazyifyAndDimensionContentImages(
	html: string,
	mediaDimensionsByUrl: ReadonlyMap<string, { width: number; height: number }>
): string {
	return html.replace(/<img\b([^>]*)>/gi, (full, attrs: string) => {
		let updatedAttrs = attrs;
		if (!/\bloading\s*=/i.test(updatedAttrs)) {
			updatedAttrs += ' loading="lazy"';
		}
		if (!/\bdecoding\s*=/i.test(updatedAttrs)) {
			updatedAttrs += ' decoding="async"';
		}
		if (!/\bwidth\s*=/i.test(updatedAttrs) || !/\bheight\s*=/i.test(updatedAttrs)) {
			const srcMatch = updatedAttrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
			const dims = srcMatch ? mediaDimensionsByUrl.get(srcMatch[1]) : undefined;
			if (dims) {
				if (!/\bwidth\s*=/i.test(updatedAttrs)) {
					updatedAttrs += ` width="${dims.width}"`;
				}
				if (!/\bheight\s*=/i.test(updatedAttrs)) {
					updatedAttrs += ` height="${dims.height}"`;
				}
			}
		}
		return `<img${updatedAttrs}>`;
	});
}

export const load: PageServerLoad = async ({
	params,
	url,
	locals,
	request,
	cookies,
	setHeaders
}) => {
	const slug = params.slug.trim().toLowerCase();
	const isAdmin =
		Boolean(locals.user) && (locals.user as { role?: string } | undefined)?.role === 'admin';

	const db = await ensureDbReady();
	const previewParam = url.searchParams.get('preview');
	let hasValidPreviewToken = false;

	if (previewParam) {
		const [candidate] = await db
			.select({ id: posts.id })
			.from(posts)
			.where(and(eq(posts.slug, slug), isNull(posts.deletedAt)))
			.limit(1);
		if (candidate && verifyDraftPreviewToken(previewParam, candidate.id)) {
			hasValidPreviewToken = true;
		}
	}

	const viewResult = await getPublicPostViewBySlug(slug, {
		isAdmin,
		hasValidPreviewToken,
		isPasswordUnlocked: (postId, storedPasswordHash) => {
			const cookieVal = cookies.get(getPostPasswordCookieName(postId));
			return verifyPostUnlockToken(cookieVal, postId, storedPasswordHash);
		}
	});

	if (viewResult.status === 404) {
		throw error(404, 'Article not found');
	}

	if (viewResult.status === 403) {
		setNoStoreCache(setHeaders);
		throw error(403, "This post isn't available");
	}

	if (viewResult.locked) {
		setNoStoreCache(setHeaders);
		const lockedPayload = viewResult.payload;
		const metaTags = buildBlogPageMetaTags({
			title: lockedPayload.title,
			description: lockedPayload.notice,
			pathname: `/blog/${lockedPayload.slug}`,
			indexable: false,
			nofollow: true
		});
		const jsonLdSchema = buildBlogPostJsonLd({
			locked: true,
			slug: lockedPayload.slug,
			title: lockedPayload.title
		});

		return {
			...metaTags,
			jsonLdSchema,
			locked: true as const,
			payload: lockedPayload,
			post: null
		};
	}

	const post = viewResult.post;
	const isPrivateView =
		isAdmin || hasValidPreviewToken || post.visibility !== 'public' || !post.isIndexable;

	if (isPrivateView) {
		setNoStoreCache(setHeaders);
	} else {
		setPublicReadCache(setHeaders, locals, request);
	}

	// Look up stored media dimensions for cover and body images
	const allMediaRows = await db
		.select({
			blobUrl: media.blobUrl,
			width: media.width,
			height: media.height
		})
		.from(media)
		.where(isNull(media.deletedAt));

	const mediaDimensionsByUrl = new Map<string, { width: number; height: number }>();
	for (const m of allMediaRows) {
		if (m.width && m.height) {
			mediaDimensionsByUrl.set(m.blobUrl, { width: m.width, height: m.height });
		}
	}

	const coverDims = post.coverImage ? (mediaDimensionsByUrl.get(post.coverImage) ?? null) : null;

	const highlightedHtml = await highlightPostCodeBlocks(post.content);
	const finalBodyHtml = lazyifyAndDimensionContentImages(highlightedHtml, mediaDimensionsByUrl);

	let parsedFaqs: Array<{ question: string; answer: string }> = [];
	if (post.faqItems) {
		try {
			const raw = JSON.parse(post.faqItems);
			if (Array.isArray(raw)) {
				parsedFaqs = raw.filter((f): f is { question: string; answer: string } =>
					Boolean(
						f &&
						typeof f === 'object' &&
						typeof f.question === 'string' &&
						typeof f.answer === 'string' &&
						f.question.trim() &&
						f.answer.trim()
					)
				);
			}
		} catch (err) {
			console.warn(`[/blog/${post.slug}] Malformed FAQ JSON on post #${post.id}:`, err);
		}
	}

	let parsedSecondaryKeywords: string[] = [];
	if (post.secondaryKeywords) {
		try {
			const raw = JSON.parse(post.secondaryKeywords);
			if (Array.isArray(raw)) {
				parsedSecondaryKeywords = raw.map((s) => String(s).trim()).filter(Boolean);
			}
		} catch (err) {
			console.warn(
				`[/blog/${post.slug}] Malformed secondaryKeywords JSON on post #${post.id}:`,
				err
			);
		}
	}

	const effectiveTitle = (post.metaTitle || post.title).trim();
	const effectiveDescription = (post.metaDescription || post.excerpt || post.title).trim();
	const modifiedIso = resolvePostModifiedIso(post);
	const publishedIso = post.publishedAt ? new Date(post.publishedAt).toISOString() : modifiedIso;

	const metaTags = buildBlogPageMetaTags({
		title: effectiveTitle,
		description: effectiveDescription,
		pathname: `/blog/${post.slug}`,
		indexable: post.isIndexable && !hasValidPreviewToken,
		nofollow: post.robotsNofollow,
		ogType: 'article',
		ogTitle: post.ogTitle,
		ogDescription: post.ogDescription,
		ogImage: post.ogImage || post.coverImage,
		ogImageAlt: post.coverImageAlt || post.title,
		ogImageWidth: coverDims?.width ?? null,
		ogImageHeight: coverDims?.height ?? null,
		twitterCard: post.twitterCardType === 'summary' ? 'summary' : 'summary_large_image',
		twitterTitle: post.twitterTitle,
		twitterDescription: post.twitterDescription,
		twitterImage: post.twitterImage || post.ogImage || post.coverImage,
		twitterImageAlt: post.coverImageAlt || post.title,
		authorName: post.author?.name ?? null,
		publishedTime: publishedIso,
		modifiedTime: modifiedIso,
		section: post.category?.name ?? null,
		tags: post.tags.map((t) => t.name)
	});

	const jsonLdSchema = buildBlogPostJsonLd({
		locked: false,
		slug: post.slug,
		title: post.title,
		description: effectiveDescription,
		coverImage: post.coverImage,
		coverImageCaption: post.coverImageCaption,
		coverImageWidth: coverDims?.width ?? null,
		coverImageHeight: coverDims?.height ?? null,
		publishedAt: post.publishedAt,
		updatedAt: post.updatedAt,
		contentUpdatedAt: post.contentUpdatedAt,
		createdAt: post.createdAt,
		wordCount: post.wordCount,
		isPillar: post.isPillar,
		schemaType: post.schemaType,
		focusKeyword: post.focusKeyword,
		secondaryKeywords: parsedSecondaryKeywords,
		category: post.category ? { name: post.category.name, slug: post.category.slug } : null,
		author: post.author
			? {
					name: post.author.name,
					slug: post.author.slug,
					jobTitle: post.author.jobTitle,
					shortBio: post.author.shortBio,
					bio: post.author.bio,
					avatar: post.author.avatar,
					linkedin: post.author.linkedin,
					twitter: post.author.twitter,
					website: post.author.website,
					expertise: post.author.expertise
				}
			: null,
		faqItems: parsedFaqs
	});

	return {
		...metaTags,
		jsonLdSchema,
		locked: false as const,
		payload: null,
		post: {
			...post,
			content: finalBodyHtml,
			coverWidth: coverDims?.width ?? 1200,
			coverHeight: coverDims?.height ?? 675,
			faqList: parsedFaqs,
			isPreview: hasValidPreviewToken
		}
	};
};

export const actions: Actions = {
	unlock: async (event) => {
		const slug = event.params.slug.trim().toLowerCase();
		const formData = await event.request.formData();
		const password = String(formData.get('password') ?? '').trim();

		if (!password) {
			return fail(400, {
				unlockError: 'Please enter the article password.'
			});
		}

		// Rate limit 10 attempts per 10 minutes per IP per slug BEFORE revealing 404 (Section 7.15)
		const ip = getClientIp(event);
		const rl = await consumeRateLimit({
			key: `pw_unlock:${ip}:${slug}`,
			limit: RATE_LIMIT_PASSWORD_UNLOCK_ATTEMPTS,
			windowMs: RATE_LIMIT_PASSWORD_UNLOCK_WINDOW_MS
		});

		if (!rl.allowed) {
			return fail(429, {
				unlockError: 'Too many unlock attempts. Please wait 10 minutes before trying again.'
			});
		}

		const db = await ensureDbReady();
		const [row] = await db
			.select()
			.from(posts)
			.where(and(eq(posts.slug, slug), isNull(posts.deletedAt)))
			.limit(1);

		if (
			!row ||
			!isPostLiveAtReadTime(row) ||
			row.visibility !== 'password_protected' ||
			!row.password
		) {
			throw error(404, 'Article not found');
		}

		if (!verifyPostPassword(password, row.password)) {
			return fail(401, {
				unlockError: 'Incorrect password. Please check and try again.'
			});
		}

		let token: string;
		try {
			token = signPostUnlockToken(row.id, row.password);
		} catch (err) {
			console.error('[unlock] Cannot sign password unlock cookie:', err);
			return fail(500, {
				unlockError: 'Password unlock is temporarily unavailable.'
			});
		}

		event.cookies.set(getPostPasswordCookieName(row.id), token, {
			httpOnly: true,
			sameSite: 'lax',
			secure: event.url.protocol === 'https:' || process.env.NODE_ENV === 'production',
			path: `/blog/${row.slug}`,
			maxAge: 24 * 60 * 60
		});

		throw redirect(303, `/blog/${row.slug}`);
	}
};
