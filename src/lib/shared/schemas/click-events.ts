/**
 * Public click-beacon payload schema.
 *
 * The browser delegates click capture to `+layout.svelte`, batches up to
 * 10 events or 2 seconds (whichever fires first), and POSTs the batch
 * to `/api/track/click`. The endpoint validates with this schema before
 * inserting.
 *
 * Hard caps mirror the table column types (text, no length cap) plus
 * what's defensible from a public/untrusted source:
 *   - source_path / target_path: must start with '/' OR be absolute http
 *     URLs; capped at 2 KiB so a single oversized payload can't burn
 *     the function memory budget.
 *   - link_text: trimmed to 240 chars at the source; server still
 *     re-truncates to 120 on insert as belt-and-suspenders.
 *   - session_id: 64 hex chars max (matches the page_views fingerprint
 *     shape).
 *   - clicks array: max 20 per request; the throttle on the client
 *     keeps batches well below this in normal use.
 */
import { z } from 'zod';

const pathLike = z
	.string()
	.min(1)
	.max(2048)
	.refine(
		(s) => s.startsWith('/') || /^https?:\/\//i.test(s),
		'expected absolute URL or path starting with /'
	);

export const clickEventSchema = z.object({
	sourcePath: pathLike,
	targetPath: pathLike,
	targetHost: z.string().max(253).nullable().optional(),
	linkText: z.string().max(240).nullable().optional(),
	sessionId: z
		.string()
		.regex(/^[a-f0-9]{8,64}$/i, 'expected hex fingerprint')
		.optional()
});

export const clickEventsBatchSchema = z.object({
	clicks: z.array(clickEventSchema).min(1).max(20)
});

export type ClickEventInput = z.infer<typeof clickEventSchema>;
export type ClickEventsBatchInput = z.infer<typeof clickEventsBatchSchema>;
