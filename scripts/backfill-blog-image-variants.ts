import path from 'node:path';
import sharp from 'sharp';
import { and, eq, isNull, like, ne, or, sql } from 'drizzle-orm';
import { ensureDbReady } from '../src/lib/server/db';
import { media, posts, type MediaVariantRecord } from '../src/lib/server/db/schema';
import {
	getMediaStorageDriver,
	getLocalBlobBuffer,
	type BlobStorageDriver
} from '../src/lib/server/services/media';
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

	const local = getLocalBlobBuffer(url);
	if (local) {
		if (local.byteLength > BACKFILL_MAX_DOWNLOAD_BYTES) {
			throw new Error(
				`Source image exceeds maximum download size (${local.byteLength} > ${BACKFILL_MAX_DOWNLOAD_BYTES} bytes)`
			);
		}
		return local;
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

const isMainModule =
	typeof process !== 'undefined' &&
	process.argv[1] &&
	process.argv[1].endsWith('backfill-blog-image-variants.ts');

if (isMainModule) {
	const cli = parseBackfillCliArgs(process.argv.slice(2));
	backfillBlogImageVariants(cli)
		.then((res) => {
			process.stdout.write(
				`${JSON.stringify({
					status: 'completed',
					dryRun: cli.dryRun,
					...res
				})}\n`
			);
			if (res.failed > 0) {
				process.exitCode = 1;
			}
		})
		.catch((err: unknown) => {
			console.error('Backfill failed:', err);
			process.exitCode = 1;
		});
}
