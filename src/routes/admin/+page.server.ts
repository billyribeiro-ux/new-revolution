import { requireAdmin } from '#lib/server/auth-guard';
import { listAdminPosts, listTrashedPosts } from '#lib/server/services/posts';
import { POST_STATUSES, type PostStatus } from '#lib/shared/schemas/posts';
import type { PageServerLoad } from './$types';

export const prerender = false;

const RECENT_LIMIT = 5;

/**
 * Counts come from the existing services: `listAdminPosts` returns every non-trashed post and
 * `listTrashedPosts` returns the trash. There is no SQL count helper in `services/posts.ts`, so the counts are
 * computed in memory from those lists. Load errors are not caught here, so a failing query shows the error page
 * instead of zeros.
 */
export const load: PageServerLoad = async (event) => {
	requireAdmin(event);

	const [active, trashed] = await Promise.all([listAdminPosts(), listTrashedPosts()]);

	const byStatus: Record<PostStatus, number> = {
		draft: 0,
		review: 0,
		scheduled: 0,
		published: 0,
		archived: 0
	};
	for (const post of active) {
		if (!(POST_STATUSES as readonly string[]).includes(post.status)) {
			throw new Error(`Unknown post status "${post.status}" on post ${post.id}`);
		}
		byStatus[post.status as PostStatus] += 1;
	}

	return {
		counts: {
			drafts: byStatus.draft,
			inReview: byStatus.review,
			scheduled: byStatus.scheduled,
			published: byStatus.published,
			archived: byStatus.archived,
			trashed: trashed.length,
			activeTotal: active.length
		},
		recent: active.slice(0, RECENT_LIMIT).map((post) => ({
			id: post.id,
			title: post.title,
			status: post.status as PostStatus,
			updatedAt: post.updatedAt
		}))
	};
};
