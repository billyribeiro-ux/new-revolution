import path from 'node:path';
import sharp from 'sharp';
import { and, eq, isNull, like, ne, or, sql } from 'drizzle-orm';
import { ensureDbReady } from '../src/lib/server/db';
import { media, type MediaVariantRecord } from '../src/lib/server/db/schema';
import {
	getMediaStorageDriver,
	getLocalBlobBuffer,
	type BlobStorageDriver
} from '../src/lib/server/services/media';
import { MEDIA_VARIANT_WIDTHS, MEDIA_WEBP_QUALITY } from '../src/lib/shared/media-upload';

export interface BackfillOptions {
	dryRun?: boolean;
	limit?: number;
	concurrency?: number;
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

async function defaultFetchSourceBuffer(url: string): Promise<Buffer> {
	const local = getLocalBlobBuffer(url);
	if (local) {
		return local;
	}
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Failed to fetch source image (${res.status}): ${url}`);
	}
	return Buffer.from(await res.arrayBuffer());
}

export function parseBackfillCliArgs(argv: string[]): {
	dryRun: boolean;
	limit?: number;
	concurrency: number;
} {
	let dryRun = false;
	let limit: number | undefined;
	let concurrency = 3;

	for (const arg of argv) {
		if (arg === '--dry-run') {
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
	const dryRun = options.dryRun ?? false;
	const concurrency = Math.max(1, options.concurrency ?? 3);
	const fetchSource = options.fetchSourceBuffer ?? defaultFetchSourceBuffer;
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

			if (dryRun) {
				result.updated++;
				continue;
			}

			const uploadedVariantUrls: string[] = [];
			try {
				const sourceBuffer = await fetchSource(row.blobUrl);
				const meta = await sharp(sourceBuffer).metadata();
				const origWidth = meta.width ?? row.width ?? 0;
				const origHeight = meta.height ?? row.height ?? 0;

				const targetVariantWidths = MEDIA_VARIANT_WIDTHS.filter((vw) => vw < origWidth);
				if (!origWidth || !origHeight || targetVariantWidths.length === 0) {
					result.skipped++;
					continue;
				}

				const parsedFilename = path.parse(row.blobPathname || row.filename || 'image.webp');
				const stem = parsedFilename.name || row.id;

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

				await db
					.update(media)
					.set({
						variantsJson: variants,
						width: row.width ?? origWidth,
						height: row.height ?? origHeight,
						updatedAt: new Date()
					})
					.where(eq(media.id, row.id));

				result.updated++;
			} catch (err) {
				if (uploadedVariantUrls.length > 0) {
					await driver.del(uploadedVariantUrls).catch(() => {});
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
			console.log(
				JSON.stringify({
					status: 'completed',
					dryRun: cli.dryRun,
					...res
				})
			);
			if (res.failed > 0) {
				process.exitCode = 1;
			}
		})
		.catch((err) => {
			console.error('Backfill failed:', err);
			process.exitCode = 1;
		});
}
