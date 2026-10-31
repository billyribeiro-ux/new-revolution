import { randomBytes } from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
import { and, eq, isNull, like, ne, or, sql } from 'drizzle-orm';
import { ensureDbReady } from '../src/lib/server/db';
import { media, posts, type MediaVariantRecord } from '../src/lib/server/db/schema';
import {
	getActiveDiskMediaDriver,
	getMediaStorageDriver,
	MEDIA_PUBLIC_PREFIX,
	type BlobStorageDriver
} from '../src/lib/server/media-storage';
import { cropVariantKey, isCropVariant, planCoverCrops } from '../src/lib/shared/cover-crops';
import { coverCropVariantRecord, encodeCoverCrops } from '../src/lib/server/services/media';
import { MEDIA_VARIANT_WIDTHS, MEDIA_WEBP_QUALITY } from '../src/lib/shared/media-upload';

export const BACKFILL_MAX_DOWNLOAD_BYTES = 15 * 1024 * 1024; // 15 MiB
export const BACKFILL_FETCH_TIMEOUT_MS = 30_000; // 30 seconds
export const ALREADY_VARIANT_URL_PATTERN = /-(?:480|800|1200|\d+)w\.webp(?:\?.*)?$/i;

const DEFAULT_ALLOWED_BLOB_HOSTS = [
	'revolutiontradingpros.com',
	'.revolutiontradingpros.com',
	'.public.blob.vercel-storage.com',
	'.blob.vercel-storage.com',
	'localhost',
	'127.0.0.1'
];

export interface BackfillOptions {
	dryRun?: boolean;
	limit?: number;
	concurrency?: number;
	allowedHosts?: string[];
	fetchSourceBuffer?: (url: string) => Promise<Buffer>;
	storageDriver?: BlobStorageDriver;
}

export interface BackfillResult {
	scanned: number;
	updated: number;
	skipped: number;
	failed: number;
	errors: Array<{ id: string; url: string; error: string }>;
}

export function isAllowedBlobUrl(url: string, extraAllowedHosts: string[] = []): boolean {
	if (!url || typeof url !== 'string') return false;
	// Relative URLs written by the local disk driver (`/media/<path>`); never protocol-relative (`//host`).
	if (url.startsWith(MEDIA_PUBLIC_PREFIX)) return true;
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		return false;
	}
	if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
		return false;
	}
	const host = parsed.hostname.toLowerCase();
	const allowList = [
		...DEFAULT_ALLOWED_BLOB_HOSTS,
		...extraAllowedHosts.map((h) => h.toLowerCase())
	];
	for (const pattern of allowList) {
		if (pattern.startsWith('.')) {
			if (host.endsWith(pattern) || host === pattern.slice(1)) {
				return true;
			}
		} else if (host === pattern) {
			return true;
		}
	}
	return false;
}

export function isAlreadyVariantUrl(urlOrFilename: string): boolean {
	return ALREADY_VARIANT_URL_PATTERN.test(urlOrFilename.trim());
}

export async function defaultFetchSourceBuffer(
	url: string,
	allowedHosts: string[] = []
): Promise<Buffer> {
	if (!isAllowedBlobUrl(url, allowedHosts)) {
		throw new Error(`Disallowed blob host for URL: ${url}`);
	}

	// Files written by the local disk driver are read straight from disk (dev). No silent fallback to the
	// network: a missing local file is a real error.
	const diskDriver = getActiveDiskMediaDriver();
	const mediaPath = url.startsWith(MEDIA_PUBLIC_PREFIX)
		? url.slice(MEDIA_PUBLIC_PREFIX.length)
		: diskDriver
			? new URL(url).pathname.startsWith(MEDIA_PUBLIC_PREFIX)
				? decodeURIComponent(new URL(url).pathname.slice(MEDIA_PUBLIC_PREFIX.length))
				: null
			: null;
	if (mediaPath !== null) {
		if (!diskDriver) {
			throw new Error(
				`Local media URL ${url} cannot be read: the disk media driver is not active.`
			);
		}
		const file = await diskDriver.read(mediaPath);
		if (!file) throw new Error(`Local media file not found: ${url}`);
		if (file.size > BACKFILL_MAX_DOWNLOAD_BYTES) {
			throw new Error(
				`Source image exceeds maximum download size (${file.size} > ${BACKFILL_MAX_DOWNLOAD_BYTES} bytes)`
			);
		}
		return file.buffer;
	}

	const res = await fetch(url, {
		signal: AbortSignal.timeout(BACKFILL_FETCH_TIMEOUT_MS)
	});
	if (!res.ok) {
		throw new Error(`Failed to fetch source image (${res.status}): ${url}`);
	}

	const contentLengthHeader = res.headers.get('content-length');
	if (contentLengthHeader !== null) {
		const declaredBytes = Number(contentLengthHeader);
		if (Number.isFinite(declaredBytes) && declaredBytes > BACKFILL_MAX_DOWNLOAD_BYTES) {
			throw new Error(`Source image Content-Length (${declaredBytes}) exceeds 15 MiB cap: ${url}`);
		}
	}

	if (!res.body) {
		const buf = Buffer.from(await res.arrayBuffer());
		if (buf.byteLength > BACKFILL_MAX_DOWNLOAD_BYTES) {
			throw new Error(`Source image exceeds 15 MiB cap (${buf.byteLength} bytes): ${url}`);
		}
		return buf;
	}

	const reader = res.body.getReader();
	const chunks: Uint8Array[] = [];
	let totalBytes = 0;

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			if (value) {
				totalBytes += value.byteLength;
				if (totalBytes > BACKFILL_MAX_DOWNLOAD_BYTES) {
					await reader.cancel('Download exceeded 15 MiB cap').catch((cancelErr: unknown) => {
						console.warn('[backfill] Failed to cancel oversized download stream:', cancelErr);
					});
					throw new Error(`Source image stream exceeded 15 MiB cap: ${url}`);
				}
				chunks.push(value);
			}
		}
	} finally {
		reader.releaseLock();
	}

	return Buffer.concat(chunks, totalBytes);
}

export function parseBackfillCliArgs(argv: string[]): {
	dryRun: boolean;
	limit?: number;
	concurrency: number;
} {
	// Dry run by default; require --apply to write (Section 9.7)
	let dryRun = true;
	let limit: number | undefined;
	let concurrency = 3;

	for (const arg of argv) {
		if (arg === '--apply') {
			dryRun = false;
		} else if (arg === '--dry-run') {
			dryRun = true;
		} else if (arg.startsWith('--limit=')) {
			const val = Number(arg.slice('--limit='.length));
			if (Number.isInteger(val) && val > 0) {
				limit = val;
			}
		} else if (arg.startsWith('--concurrency=')) {
			const val = Number(arg.slice('--concurrency='.length));
			if (Number.isInteger(val) && val > 0 && val <= 32) {
				concurrency = val;
			}
		}
	}

	return { dryRun, limit, concurrency };
}

export async function backfillBlogImageVariants(
	options: BackfillOptions = {}
): Promise<BackfillResult> {
	const db = await ensureDbReady();
	const dryRun = options.dryRun ?? true;
	const concurrency = Math.max(1, options.concurrency ?? 3);
	const allowedHosts = options.allowedHosts ?? [];
	const fetchSource =
		options.fetchSourceBuffer ?? ((url: string) => defaultFetchSourceBuffer(url, allowedHosts));
	const driver = options.storageDriver ?? getMediaStorageDriver();

	const baseQuery = db
		.select()
		.from(media)
		.where(
			and(
				like(media.mimeType, 'image/%'),
				ne(media.mimeType, 'image/svg+xml'),
				isNull(media.deletedAt),
				or(isNull(media.variantsJson), sql`${media.variantsJson} = '{}'::jsonb`)
			)
		)
		.orderBy(media.createdAt);

	const rows =
		options.limit && options.limit > 0 ? await baseQuery.limit(options.limit) : await baseQuery;

	const result: BackfillResult = {
		scanned: rows.length,
		updated: 0,
		skipped: 0,
		failed: 0,
		errors: []
	};

	if (rows.length === 0) {
		return result;
	}

	let cursor = 0;

	async function worker(): Promise<void> {
		while (cursor < rows.length) {
			const idx = cursor++;
			const row = rows[idx];
			if (!row) continue;

			const existingVariants = row.variantsJson;
			if (
				existingVariants &&
				typeof existingVariants === 'object' &&
				Object.keys(existingVariants).length > 0
			) {
				result.skipped++;
				continue;
			}

			// Skip non-raster images, images already following the width naming convention, or known <= 480px
			if (
				!row.mimeType.startsWith('image/') ||
				row.mimeType === 'image/svg+xml' ||
				row.mimeType === 'image/gif' ||
				isAlreadyVariantUrl(row.blobUrl) ||
				isAlreadyVariantUrl(row.blobPathname) ||
				isAlreadyVariantUrl(row.filename) ||
				(typeof row.width === 'number' && row.width > 0 && row.width <= 480)
			) {
				result.skipped++;
				continue;
			}

			if (!isAllowedBlobUrl(row.blobUrl, allowedHosts)) {
				result.failed++;
				result.errors.push({
					id: row.id,
					url: row.blobUrl,
					error: `Disallowed blob host for URL: ${row.blobUrl}`
				});
				continue;
			}

			if (dryRun) {
				result.updated++;
				continue;
			}

			const uploadedVariantUrls: string[] = [];
			try {
				const sourceBuffer = await fetchSource(row.blobUrl);
				if (sourceBuffer.byteLength > BACKFILL_MAX_DOWNLOAD_BYTES) {
					throw new Error(
						`Source image exceeds 15 MiB cap (${sourceBuffer.byteLength} bytes): ${row.blobUrl}`
					);
				}

				const meta = await sharp(sourceBuffer).metadata();
				const origWidth = meta.width ?? row.width ?? 0;
				const origHeight = meta.height ?? row.height ?? 0;

				const targetVariantWidths = MEDIA_VARIANT_WIDTHS.filter((vw) => vw < origWidth);
				if (!origWidth || !origHeight || origWidth <= 480 || targetVariantWidths.length === 0) {
					result.skipped++;
					continue;
				}

				const parsedFilename = path.parse(row.blobPathname || row.filename || 'image.webp');
				const stem = (parsedFilename.name || row.id).replace(/-(?:480|800|1200|\d+)w$/i, '');

				// Convert primary image to WebP with width suffix so srcset derivation works seamlessly
				const primaryWebp = await sharp(sourceBuffer)
					.rotate()
					.webp({ quality: MEDIA_WEBP_QUALITY })
					.toBuffer({ resolveWithObject: true });

				const primaryPath = `${stem}-${origWidth}w.webp`;
				const primaryUploaded = await driver.put(primaryPath, primaryWebp.data, {
					contentType: 'image/webp'
				});
				uploadedVariantUrls.push(primaryUploaded.url);

				const variants: Record<string, MediaVariantRecord> = {};

				for (const vw of targetVariantWidths) {
					const resized = await sharp(sourceBuffer)
						.rotate()
						.resize({
							width: vw,
							withoutEnlargement: true
						})
						.webp({ quality: MEDIA_WEBP_QUALITY })
						.toBuffer({ resolveWithObject: true });

					const vPath = `${stem}-${vw}w.webp`;
					const uploaded = await driver.put(vPath, resized.data, {
						contentType: 'image/webp'
					});
					uploadedVariantUrls.push(uploaded.url);

					variants[String(vw)] = {
						width: resized.info.width,
						height: resized.info.height,
						url: uploaded.url,
						pathname: uploaded.pathname
					};
				}

				const oldUrl = row.blobUrl;
				const newUrl = primaryUploaded.url;

				// Conditional UPDATE on oldUrl for idempotency; never delete oldUrl blob (Section 9.7)
				await db
					.update(media)
					.set({
						blobUrl: newUrl,
						blobPathname: primaryUploaded.pathname,
						mimeType: 'image/webp',
						variantsJson: variants,
						width: row.width ?? origWidth,
						height: row.height ?? origHeight,
						updatedAt: new Date()
					})
					.where(and(eq(media.id, row.id), eq(media.blobUrl, oldUrl)));

				// Also update posts.cover_image, posts.og_image, and posts.content body references conditional on oldUrl
				if (newUrl !== oldUrl) {
					await db
						.update(posts)
						.set({
							coverImage: newUrl,
							coverImageWidth: origWidth,
							coverImageHeight: origHeight
						})
						.where(eq(posts.coverImage, oldUrl));

					await db
						.update(posts)
						.set({
							ogImage: newUrl
						})
						.where(eq(posts.ogImage, oldUrl));

					await db
						.update(posts)
						.set({
							content: sql`replace(${posts.content}, ${oldUrl}, ${newUrl})`
						})
						.where(like(posts.content, `%${oldUrl}%`));
				}

				result.updated++;
			} catch (err) {
				if (uploadedVariantUrls.length > 0) {
					await driver.del(uploadedVariantUrls).catch((cleanupErr: unknown) => {
						console.warn('[backfill] Failed to clean up partial variant uploads:', cleanupErr);
					});
				}
				result.failed++;
				result.errors.push({
					id: row.id,
					url: row.blobUrl,
					error: err instanceof Error ? err.message : String(err)
				});
			}
		}
	}

	const workers = Array.from({ length: Math.min(concurrency, rows.length) }, () => worker());
	await Promise.all(workers);

	return result;
}

/** Base name for crop files: strips a trailing `-<w>w` and extension; adds a fresh hex when the name has none. */
export function cropBaseFromPathname(pathname: string, fallbackId: string): string {
	const parsed = path.parse(pathname || fallbackId);
	const base = (parsed.name || fallbackId).replace(/-\d{2,5}w$/i, '');
	return /-[0-9a-f]{12}$/.test(base) ? base : `${base}-${randomBytes(6).toString('hex')}`;
}

/**
 * Adds the Article-image crops (16x9, 4x3, 1x1; >= 50,000 px) to existing raster media rows that have none.
 * Dry-run by default; idempotent (rows that already have any crop, or whose dimensions cannot yield a
 * 50K px crop, are skipped without fetching). The crop source is the stored original (already WebP, so one
 * extra lossy pass: the upload bytes no longer exist). Only variants_json is written; no URL changes.
 */
export async function backfillCoverCrops(options: BackfillOptions = {}): Promise<BackfillResult> {
	const db = await ensureDbReady();
	const dryRun = options.dryRun ?? true;
	const concurrency = Math.max(1, options.concurrency ?? 3);
	const allowedHosts = options.allowedHosts ?? [];
	const fetchSource =
		options.fetchSourceBuffer ?? ((url: string) => defaultFetchSourceBuffer(url, allowedHosts));
	const driver = options.storageDriver ?? getMediaStorageDriver();

	const candidates = await db
		.select()
		.from(media)
		.where(
			and(
				like(media.mimeType, 'image/%'),
				ne(media.mimeType, 'image/svg+xml'),
				ne(media.mimeType, 'image/gif'),
				isNull(media.deletedAt)
			)
		)
		.orderBy(media.createdAt);

	const result: BackfillResult = { scanned: 0, updated: 0, skipped: 0, failed: 0, errors: [] };
	const rows = candidates.filter(
		(r) => !Object.values(r.variantsJson ?? {}).some((v) => isCropVariant(v))
	);
	const limited = options.limit && options.limit > 0 ? rows.slice(0, options.limit) : rows;
	result.scanned = limited.length;

	let cursor = 0;
	async function worker(): Promise<void> {
		while (cursor < limited.length) {
			const row = limited[cursor++];
			if (!row) continue;

			const knownDims = Boolean(row.width && row.height);
			if (knownDims && planCoverCrops(row.width, row.height).length === 0) {
				result.skipped++;
				continue;
			}
			if (!isAllowedBlobUrl(row.blobUrl, allowedHosts)) {
				result.failed++;
				result.errors.push({
					id: row.id,
					url: row.blobUrl,
					error: `Disallowed blob host for URL: ${row.blobUrl}`
				});
				continue;
			}
			if (dryRun) {
				result.updated++;
				continue;
			}

			const uploaded: string[] = [];
			try {
				const source = await fetchSource(row.blobUrl);
				if (source.byteLength > BACKFILL_MAX_DOWNLOAD_BYTES) {
					throw new Error(`Source image exceeds 15 MiB cap (${source.byteLength} bytes)`);
				}
				const meta = await sharp(source).metadata();
				const crops = await encodeCoverCrops(source, meta.width ?? null, meta.height ?? null);
				if (crops.length === 0) {
					result.skipped++;
					continue;
				}
				const base = cropBaseFromPathname(row.blobPathname || row.filename, row.id);
				const settled = await Promise.allSettled(
					crops.map((c) =>
						driver.put(`${base}-crop-${c.aspect}.webp`, c.buffer, { contentType: 'image/webp' })
					)
				);
				for (const r of settled) if (r.status === 'fulfilled') uploaded.push(r.value.url);
				const rejected = settled.find((r): r is PromiseRejectedResult => r.status === 'rejected');
				if (rejected) throw rejected.reason;

				const merged: Record<string, MediaVariantRecord> = { ...(row.variantsJson ?? {}) };
				crops.forEach((c, i) => {
					merged[cropVariantKey(c.aspect)] = coverCropVariantRecord(
						c,
						(settled[i] as PromiseFulfilledResult<{ url: string; pathname: string }>).value
					);
				});
				const updated = await db
					.update(media)
					.set({ variantsJson: merged, updatedAt: new Date() })
					.where(and(eq(media.id, row.id), isNull(media.deletedAt)))
					.returning();
				if (updated.length === 0) {
					throw new Error('Row was deleted during backfill; crops discarded.');
				}
				result.updated++;
			} catch (err) {
				if (uploaded.length > 0) {
					await driver.del(uploaded).catch((cleanupErr: unknown) => {
						console.warn('[backfill] Failed to clean up partial crop uploads:', cleanupErr);
					});
				}
				result.failed++;
				result.errors.push({
					id: row.id,
					url: row.blobUrl,
					error: err instanceof Error ? err.message : String(err)
				});
			}
		}
	}
	await Promise.all(Array.from({ length: Math.min(concurrency, limited.length) }, () => worker()));
	return result;
}

const isMainModule =
	typeof process !== 'undefined' &&
	process.argv[1] &&
	process.argv[1].endsWith('backfill-blog-image-variants.ts');

if (isMainModule) {
	const cli = parseBackfillCliArgs(process.argv.slice(2));
	backfillBlogImageVariants(cli)
		.then(async (res) => {
			const crops = await backfillCoverCrops(cli);
			process.stdout.write(
				`${JSON.stringify({
					status: 'completed',
					dryRun: cli.dryRun,
					...res,
					crops
				})}\n`
			);
			if (res.failed > 0 || crops.failed > 0) {
				process.exitCode = 1;
			}
		})
		.catch((err: unknown) => {
			console.error('Backfill failed:', err);
			process.exitCode = 1;
		});
}
