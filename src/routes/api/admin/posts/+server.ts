import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin } from '#lib/server/auth-guard';
import { listAdminPosts, listTrashedPosts, createPost } from '#lib/server/services/posts';
import { toRestErrorResponse } from '#lib/server/posts/error-mapper';

export const GET: RequestHandler = async (event) => {
	try {
		requireAdmin(event);
		const onlyTrash = event.url.searchParams.get('onlyTrash') === 'true';
		const posts = onlyTrash ? await listTrashedPosts() : await listAdminPosts();
		return json({ posts, total: posts.length });
	} catch (err) {
		return toRestErrorResponse(err);
	}
};

export const POST: RequestHandler = async (event) => {
	try {
		const admin = requireAdmin(event);
		const body = await event.request.json().catch(() => ({}));
		const post = await createPost(body, admin.id);
		return json({ post }, { status: 201 });
	} catch (err) {
		return toRestErrorResponse(err);
	}
};
