import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { writeAuditLog } from '#lib/server/audit';
import type { RequestHandler } from './$types';

export const prerender = false;

const pageviewSchema = z.object({
	path: z.string().min(1).max(300),
	referrer: z.string().max(1000).optional()
});

let lastRecordedKey = '';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const raw = await request.json();
		const parsed = pageviewSchema.safeParse(raw);
		if (!parsed.success) {
			return json({ ok: false, error: 'Invalid pageview payload.' }, { status: 400 });
		}

		// Drop consecutive duplicates from same path within short window (Section 10.9)
		const dedupeKey = `${parsed.data.path}`;
		if (dedupeKey === lastRecordedKey) {
			return json({ ok: true, deduplicated: true });
		}
		lastRecordedKey = dedupeKey;

		await writeAuditLog({
			actorUserId: null,
			action: 'analytics.pageview',
			entityType: 'page',
			entityId: parsed.data.path,
			summary: {
				path: parsed.data.path,
				referrer: parsed.data.referrer ?? null
			}
		});

		return json({ ok: true });
	} catch (err) {
		console.debug('[/api/analytics/pageview] Failed to process pageview:', err);
		return json({ ok: false }, { status: 400 });
	}
};
