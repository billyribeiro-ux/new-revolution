import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { getClientIp } from '#lib/server/auth-guard';
import { ensureDbReady } from '#lib/server/db';
import { pageViews } from '#lib/server/db/schema';
import type { RequestHandler } from './$types';

export const prerender = false;

const pageviewSchema = z.object({
	path: z.string().min(1).max(300),
	referrer: z.string().max(1000).optional()
});

const DEDUPE_WINDOW_MS = 5_000;
const MAX_DEDUPE_ENTRIES = 1_024;
const recentPageviewsByClient = new Map<string, { path: string; recordedAt: number }>();

export const POST: RequestHandler = async (event) => {
	try {
		const raw = await event.request.json();
		const parsed = pageviewSchema.safeParse(raw);
		if (!parsed.success) {
			return json({ ok: false, error: 'Invalid pageview payload.' }, { status: 400 });
		}

		// Drop consecutive duplicates from the same client IP + path within a short window (Section 10.9)
		const clientIp = getClientIp(event);
		const now = Date.now();
		const prev = recentPageviewsByClient.get(clientIp);
		if (prev && prev.path === parsed.data.path && now - prev.recordedAt < DEDUPE_WINDOW_MS) {
			return json({ ok: true, deduplicated: true });
		}

		if (
			recentPageviewsByClient.size >= MAX_DEDUPE_ENTRIES &&
			!recentPageviewsByClient.has(clientIp)
		) {
			const oldestKey = recentPageviewsByClient.keys().next().value;
			if (oldestKey !== undefined) {
				recentPageviewsByClient.delete(oldestKey);
			}
		}
		recentPageviewsByClient.set(clientIp, { path: parsed.data.path, recordedAt: now });

		const db = await ensureDbReady();
		await db.insert(pageViews).values({
			path: parsed.data.path,
			referrer: parsed.data.referrer ?? null
		});

		return json({ ok: true });
	} catch (err) {
		console.debug('[/api/analytics/pageview] Failed to process pageview:', err);
		return json({ ok: false }, { status: 400 });
	}
};
