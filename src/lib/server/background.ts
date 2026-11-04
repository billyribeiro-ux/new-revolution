import { logger } from '#lib/server/logger.js';

/**
 * Keep post-response work alive on a serverless instance.
 */
export function backgroundTask(op: string, task: Promise<unknown>): void {
	const wrapped = task.catch((err: unknown) => {
		logger.error({ err, op }, `[background] ${op} failed`);
	});

	try {
		const ctxSymbol = Symbol.for('@vercel/request-context');
		const holder = (
			globalThis as Record<symbol, { get?: () => { waitUntil?: (p: Promise<unknown>) => void } }>
		)[ctxSymbol];
		const waitUntil = holder?.get?.()?.waitUntil;
		if (typeof waitUntil === 'function') {
			waitUntil(wrapped);
		}
	} catch {
		// Non-Vercel runtime; promise settles in the Node event loop.
	}
}
