import { json, type RequestHandler } from '@sveltejs/kit';
import { getClientIp, requireAdmin } from '#lib/server/auth-guard';
import { consumeRateLimit, RATE_LIMIT_POST_WRITES_PER_MIN } from '#lib/server/rate-limit';
import {
	getPostById,
	updatePost,
	patchPost,
	trashPost,
	restoreTrashedPost,
	permanentlyDeletePost
} from '#lib/server/services/posts';
import { toRestErrorResponse } from '#lib/server/posts/error-mapper';

function parsePostIdParam(raw: string | undefined): number | null {
	const num = Number(raw);
	return Number.isInteger(num) && num > 0 ? num : null;
}

async function enforceWriteRateLimit(
	event: Parameters<typeof getClientIp>[0]
): Promise<Response | null> {
	const rl = await consumeRateLimit({
		key: `rest_post_write:${getClientIp(event)}`,
		limit: RATE_LIMIT_POST_WRITES_PER_MIN,
		windowMs: 60_000
	});
	if (!rl.allowed) {
		return json(
			{ code: 'RATE_LIMITED', error: 'Rate limit exceeded (max 60 write requests per minute).' },
			{ status: 429 }
		);
	}
	return null;
}

export const GET: RequestHandler = async (event) => {
	try {
		requireAdmin(event);
		const id = parsePostIdParam(event.params.id);
		if (!id) {
			return json({ code: 'VALIDATION_ERROR', error: 'Invalid post ID.' }, { status: 400 });
		}
		const post = await getPostById(id);
		if (!post) {
			return json({ code: 'POST_NOT_FOUND', error: 'Post not found.' }, { status: 404 });
		}
		return json({ post });
	} catch (err) {
		return toRestErrorResponse(err);
	}
};

export const PUT: RequestHandler = async (event) => {
	try {
		const admin = requireAdmin(event);
		const limited = await enforceWriteRateLimit(event);
		if (limited) return limited;
		const id = parsePostIdParam(event.params.id);
		if (!id) {
			return json({ code: 'VALIDATION_ERROR', error: 'Invalid post ID.' }, { status: 400 });
		}
		const body = await event.request.json().catch(() => ({}));
		const post = await updatePost({ ...body, id }, admin.id);
		return json({ post });
	} catch (err) {
		return toRestErrorResponse(err);
	}
};

export const PATCH: RequestHandler = async (event) => {
	try {
		const admin = requireAdmin(event);
		const limited = await enforceWriteRateLimit(event);
		if (limited) return limited;
		const id = parsePostIdParam(event.params.id);
		if (!id) {
			return json({ code: 'VALIDATION_ERROR', error: 'Invalid post ID.' }, { status: 400 });
		}
		const body = await event.request.json().catch(() => ({}));
		if (body && typeof body === 'object' && 'action' in body && body.action === 'restore') {
			const post = await restoreTrashedPost(id, admin.id);
			return json({ post });
		}
		const post = await patchPost({ ...body, id }, admin.id);
		return json({ post });
	} catch (err) {
		return toRestErrorResponse(err);
	}
};

export const DELETE: RequestHandler = async (event) => {
	try {
		const admin = requireAdmin(event);
		const limited = await enforceWriteRateLimit(event);
		if (limited) return limited;
		const id = parsePostIdParam(event.params.id);
		if (!id) {
			return json({ code: 'VALIDATION_ERROR', error: 'Invalid post ID.' }, { status: 400 });
		}
		const permanent =
			event.url.searchParams.get('permanent') === 'true' ||
			event.url.searchParams.get('permanent') === '1';

		if (permanent) {
			await permanentlyDeletePost(id, admin.id);
		} else {
			await trashPost(id, admin.id);
		}
		return new Response(null, { status: 204 });
	} catch (err) {
		return toRestErrorResponse(err);
	}
};
