import { and, inArray, isNull } from 'drizzle-orm';
import { sanitizePostHtml } from '#lib/sanitize-post-html';
import { ensureDbReady } from '#lib/server/db';
import { media } from '#lib/server/db/schema';
import { createFeedErrorResponse, createXmlFeedResponse } from '#lib/server/posts/cache';
import { listPublicPosts } from '#lib/server/services/posts';
import { buildRssFeedXml } from '#lib/shared/seo/rss';
import type { RequestHandler } from './$types';

export const prerender = false;

export const GET: RequestHandler = async ({ request }) => {
	try {
		const [postsPage, db] = await Promise.all([
			listPublicPosts({ page: 1, perPage: 50 }),
			ensureDbReady()
		]);

		const coverUrls = Array.from(
			new Set(postsPage.items.map((p) => p.coverImage).filter((u): u is string => Boolean(u)))
		);

		const mediaRows =
			coverUrls.length > 0
				? await db
						.select({
							blobUrl: media.blobUrl,
							mimeType: media.mimeType,
							sizeBytes: media.sizeBytes
						})
						.from(media)
						.where(and(isNull(media.deletedAt), inArray(media.blobUrl, coverUrls)))
				: [];

		const mediaByUrl = new Map<string, { mimeType: string; sizeBytes: number }>();
		for (const m of mediaRows) {
			if (m.mimeType && m.sizeBytes > 0) {
				mediaByUrl.set(m.blobUrl, {
					mimeType: m.mimeType,
					sizeBytes: m.sizeBytes
				});
			}
		}

		const xml = buildRssFeedXml({
			items: postsPage.items.map((p) => {
				const enc = p.coverImage ? mediaByUrl.get(p.coverImage) : undefined;
				return {
					title: p.title,
					slug: p.slug,
					excerpt: p.excerpt,
					metaDescription: p.metaDescription,
					content: sanitizePostHtml(p.content),
					authorName: p.authorName,
					categoryNames: p.categoryName ? [p.categoryName] : [],
					publishedAt: p.publishedAt,
					createdAt: p.createdAt,
					contentUpdatedAt: p.contentUpdatedAt,
					updatedAt: p.updatedAt,
					enclosure:
						p.coverImage && enc
							? {
									url: p.coverImage,
									type: enc.mimeType,
									length: enc.sizeBytes
								}
							: null
				};
			})
		});

		return createXmlFeedResponse(xml, request, 3600);
	} catch (err) {
		console.error('[/rss.xml] Failed to generate RSS feed:', err);
		return createFeedErrorResponse();
	}
};
