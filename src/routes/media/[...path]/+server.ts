import type { RequestHandler } from './$types';
import { assertSafeMediaPathname, getActiveDiskMediaDriver } from '#lib/server/media-storage';

export const prerender = false;

/**
 * Serves files written by the local disk media driver (docs/MEDIA_STORAGE.md). Only active when the disk
 * driver is the active storage driver; with Vercel Blob the URLs are absolute and this route returns 404.
 */
const CONTENT_TYPES: Record<string, string> = {
	webp: 'image/webp',
	png: 'image/png',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	gif: 'image/gif',
	avif: 'image/avif',
	svg: 'image/svg+xml'
};

function notFound(): Response {
	return new Response('Not found', {
		status: 404,
		headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' }
	});
}

const serve: RequestHandler = async ({ params, request }) => {
	const driver = getActiveDiskMediaDriver();
	if (!driver) return notFound();

	let pathname: string;
	try {
		pathname = assertSafeMediaPathname(params.path);
	} catch {
		// Traversal / malformed path: indistinguishable from "missing" on purpose.
		return notFound();
	}

	const ext = pathname.slice(pathname.lastIndexOf('.') + 1).toLowerCase();
	const contentType = pathname.includes('.') ? CONTENT_TYPES[ext] : undefined;
	if (!contentType) return notFound();

	const file = await driver.read(pathname);
	if (!file) return notFound();

	const etag = `W/"${file.size.toString(16)}-${Math.floor(file.mtimeMs).toString(16)}"`;
	const headers = new Headers({
		'Content-Type': contentType,
		'Cache-Control': 'public, max-age=31536000, immutable',
		'X-Content-Type-Options': 'nosniff',
		ETag: etag
	});
	if (ext === 'svg') {
		headers.set(
			'Content-Security-Policy',
			"default-src 'none'; style-src 'unsafe-inline'; sandbox"
		);
	}

	const ifNoneMatch = request.headers.get('if-none-match');
	if (ifNoneMatch) {
		const candidates = ifNoneMatch.split(',').map((v) => v.trim().replace(/^W\//, ''));
		if (ifNoneMatch.trim() === '*' || candidates.includes(etag.replace(/^W\//, ''))) {
			return new Response(null, { status: 304, headers });
		}
	}

	headers.set('Content-Length', String(file.size));
	if (request.method === 'HEAD') return new Response(null, { status: 200, headers });
	return new Response(new Uint8Array(file.buffer), { status: 200, headers });
};

export const GET: RequestHandler = serve;
export const HEAD: RequestHandler = serve;
