import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { del as vercelBlobDel, put as vercelBlobPut } from '@vercel/blob';

/**
 * Media byte storage. Two real drivers, no in-memory fallback:
 * - Vercel Blob (production; needs `BLOB_READ_WRITE_TOKEN`)
 * - local disk under `<repo>/.data/media` (development / explicit `MEDIA_STORAGE=disk`), served by
 *   `src/routes/media/[...path]/+server.ts`. See docs/MEDIA_STORAGE.md.
 */

export interface BlobStorageDriver {
	put(
		pathname: string,
		body: Buffer,
		options: { contentType: string }
	): Promise<{ url: string; pathname: string }>;
	del(urlsOrPathnames: string | string[]): Promise<void>;
}

export interface DiskMediaFile {
	buffer: Buffer;
	size: number;
	mtimeMs: number;
}

export interface DiskMediaStorageDriver extends BlobStorageDriver {
	readonly kind: 'disk';
	readonly root: string;
	/** Returns the stored file or null when it does not exist (ENOENT only; every other error throws). */
	read(pathname: string): Promise<DiskMediaFile | null>;
}

/** Public URL prefix under which the disk driver's files are served. */
export const MEDIA_PUBLIC_PREFIX = '/media/';

export function defaultMediaDiskRoot(): string {
	return path.resolve(process.cwd(), '.data', 'media');
}

/**
 * Validates a storage pathname and returns its normalised form. Rejects empty, NUL, backslash, absolute,
 * and any `.`/`..`/empty segment. Throws on invalid input (callers decide how to surface it).
 */
export function assertSafeMediaPathname(pathname: unknown): string {
	if (typeof pathname !== 'string' || pathname.length === 0) {
		throw new Error('INVALID_MEDIA_PATH: path must be a non-empty string.');
	}
	if (pathname.includes('\0')) throw new Error('INVALID_MEDIA_PATH: NUL byte in path.');
	if (pathname.includes('\\')) throw new Error('INVALID_MEDIA_PATH: backslash in path.');
	if (pathname.startsWith('/') || /^[a-zA-Z]:/.test(pathname)) {
		throw new Error('INVALID_MEDIA_PATH: absolute path.');
	}
	const segments = pathname.split('/');
	for (const segment of segments) {
		if (segment === '' || segment === '.' || segment === '..') {
			throw new Error('INVALID_MEDIA_PATH: path traversal or empty segment.');
		}
	}
	return segments.join('/');
}

function resolveInsideRoot(root: string, pathname: string): string {
	const safe = assertSafeMediaPathname(pathname);
	const resolvedRoot = path.resolve(root);
	const target = path.resolve(resolvedRoot, safe);
	if (!target.startsWith(resolvedRoot + path.sep)) {
		throw new Error('INVALID_MEDIA_PATH: resolved path escapes the media root.');
	}
	return target;
}

/** Accepts a pathname, a relative `/media/...` URL, or an absolute URL whose path is `/media/...`. */
function toStoragePathname(item: string): string {
	if (item.startsWith(MEDIA_PUBLIC_PREFIX)) return item.slice(MEDIA_PUBLIC_PREFIX.length);
	if (/^https?:\/\//i.test(item)) {
		const url = new URL(item);
		if (url.pathname.startsWith(MEDIA_PUBLIC_PREFIX)) {
			return decodeURIComponent(url.pathname.slice(MEDIA_PUBLIC_PREFIX.length));
		}
	}
	return item;
}

function isEnoent(err: unknown): boolean {
	return typeof err === 'object' && err !== null && (err as { code?: unknown }).code === 'ENOENT';
}

/**
 * URLs are ABSOLUTE (`<ORIGIN>/media/<path>`), not root-relative: post `coverImage`/`ogImage`/`twitterImage`
 * are validated as absolute URLs (`optionalUrlSchema`) and Open Graph needs absolute image URLs. The origin
 * comes from the `ORIGIN` env var (same default as src/env.ts), never a hard-coded production host.
 */
export function createDiskStorageDriver(
	root: string = defaultMediaDiskRoot(),
	options: { origin?: string } = {}
): DiskMediaStorageDriver {
	const origin = () => (options.origin || 'http://localhost:5173').replace(/\/+$/, '');
	return {
		kind: 'disk',
		root,
		async put(pathname, body) {
			const target = resolveInsideRoot(root, pathname);
			await mkdir(path.dirname(target), { recursive: true });
			// Atomic write: temp file in the same directory, then rename over the target.
			const tmp = `${target}.${randomUUID()}.tmp`;
			try {
				await writeFile(tmp, body);
				await rename(tmp, target);
			} catch (err) {
				await unlink(tmp).catch((unlinkErr: unknown) => {
					if (!isEnoent(unlinkErr)) {
						console.error('[media-storage] Failed to remove temp file:', tmp, unlinkErr);
					}
				});
				throw err;
			}
			return { url: `${origin()}${MEDIA_PUBLIC_PREFIX}${pathname}`, pathname };
		},
		async del(urlsOrPathnames) {
			const list = Array.isArray(urlsOrPathnames) ? urlsOrPathnames : [urlsOrPathnames];
			for (const item of list) {
				const target = resolveInsideRoot(root, toStoragePathname(item));
				try {
					await unlink(target);
				} catch (err) {
					if (!isEnoent(err)) throw err;
				}
			}
		},
		async read(pathname) {
			const target = resolveInsideRoot(root, pathname);
			try {
				const [buffer, info] = await Promise.all([readFile(target), stat(target)]);
				return { buffer, size: info.size, mtimeMs: info.mtimeMs };
			} catch (err) {
				if (isEnoent(err)) return null;
				// EISDIR (path names a directory) is also "not a file"
				if ((err as { code?: unknown })?.code === 'EISDIR') return null;
				throw err;
			}
		}
	};
}

export function createBlobStorageDriver(): BlobStorageDriver {
	return {
		async put(pathname, body, options) {
			const res = await vercelBlobPut(pathname, body, {
				access: 'public',
				addRandomSuffix: false,
				contentType: options.contentType
			});
			return { url: res.url, pathname: res.pathname };
		},
		async del(urlsOrPathnames) {
			await vercelBlobDel(urlsOrPathnames);
		}
	};
}

export interface MediaStorageEnv {
	ORIGIN?: string;
	BLOB_READ_WRITE_TOKEN?: string;
	VERCEL?: string;
	NODE_ENV?: string;
	MEDIA_STORAGE?: string;
}

/**
 * Picks the driver from the environment. Explicit `MEDIA_STORAGE` wins; otherwise a Blob token selects
 * Blob; otherwise disk in development/test; on Vercel or NODE_ENV=production without an explicit choice it
 * THROWS (no silent fallback that would lose uploads).
 */
export function selectMediaStorageDriver(
	env: MediaStorageEnv,
	options: { diskRoot?: string } = {}
): BlobStorageDriver {
	const explicit = env.MEDIA_STORAGE?.trim().toLowerCase();
	if (explicit && explicit !== 'blob' && explicit !== 'disk') {
		throw new Error(`MEDIA_STORAGE must be "blob" or "disk" (got "${env.MEDIA_STORAGE}").`);
	}
	const hasToken = Boolean(env.BLOB_READ_WRITE_TOKEN);

	if (explicit === 'disk') return createDiskStorageDriver(options.diskRoot, { origin: env.ORIGIN });
	if (explicit === 'blob') {
		if (!hasToken) throw new Error('MEDIA_STORAGE=blob requires BLOB_READ_WRITE_TOKEN to be set.');
		return createBlobStorageDriver();
	}
	if (hasToken) return createBlobStorageDriver();
	if (env.VERCEL || env.NODE_ENV === 'production') {
		throw new Error(
			'Media storage is not configured: set BLOB_READ_WRITE_TOKEN (Vercel Blob) or, for a single self-hosted server with a persistent disk, MEDIA_STORAGE=disk.'
		);
	}
	return createDiskStorageDriver(options.diskRoot, { origin: env.ORIGIN });
}

function isDiskDriver(driver: BlobStorageDriver): driver is DiskMediaStorageDriver {
	return (driver as Partial<DiskMediaStorageDriver>).kind === 'disk';
}

/** Env-driven driver resolved lazily on every call, so misconfiguration throws at first use. */
const lazyEnvDriver: BlobStorageDriver = {
	put: (pathname, body, options) =>
		selectMediaStorageDriver(process.env).put(pathname, body, options),
	del: (urlsOrPathnames) => selectMediaStorageDriver(process.env).del(urlsOrPathnames)
};

let overrideDriver: BlobStorageDriver | null = null;

export function setMediaStorageDriverForTest(driver: BlobStorageDriver | null): void {
	overrideDriver = driver;
}

export function getMediaStorageDriver(): BlobStorageDriver {
	return overrideDriver ?? lazyEnvDriver;
}

/** The active disk driver, or null when the active driver is not disk (or the env is misconfigured). */
export function getActiveDiskMediaDriver(): DiskMediaStorageDriver | null {
	if (overrideDriver) return isDiskDriver(overrideDriver) ? overrideDriver : null;
	try {
		const driver = selectMediaStorageDriver(process.env);
		return isDiskDriver(driver) ? driver : null;
	} catch {
		// Misconfiguration surfaces loudly on upload (put/del throw); serving simply has nothing to serve.
		return null;
	}
}
