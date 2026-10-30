import { randomBytes, randomUUID } from 'node:crypto';
import { del as vercelBlobDel, put as vercelBlobPut } from '@vercel/blob';
import { and, asc, count, desc, eq, ilike, isNotNull, isNull, or } from 'drizzle-orm';
import sharp from 'sharp';
import {
	MEDIA_ALLOWED_MIME_TYPES,
	MEDIA_VARIANT_WIDTHS,
	MEDIA_WEBP_QUALITY,
	normaliseMediaFolder,
	type AllowedMediaMimeType,
	type MediaAvailableSize,
	type MediaItem
} from '../../shared/media-upload';
import {
	mediaListQuerySchema,
	mediaPatchSchema,
	type MediaListQuery
} from '../../shared/schemas/media';
import { replaceEmEnDashesInPlainText } from '../../shared/seo/content-transform';
import { writeAuditLog } from '../audit';
import { ensureDbReady } from '../db';
import { media, mediaFolders, posts, type MediaVariantRecord } from '../db/schema';

export interface BlobStorageDriver {
	put(
		pathname: string,
		body: Buffer,
		options: { contentType: string }
	): Promise<{ url: string; pathname: string }>;
	del(urlsOrPathnames: string | string[]): Promise<void>;
}

const localBlobStore = new Map<string, Buffer>();

const defaultStorageDriver: BlobStorageDriver = {
	async put(pathname, body, options) {
		if (process.env.BLOB_READ_WRITE_TOKEN) {
			const res = await vercelBlobPut(pathname, body, {
				access: 'public',
				addRandomSuffix: false,
				contentType: options.contentType
			});
			return { url: res.url, pathname: res.pathname };
		}
		const cleanPath = pathname.replace(/^\/+/, '');
		const url = `https://revolutiontradingpros.com/media/${cleanPath}`;
		localBlobStore.set(url, body);
		return { url, pathname: cleanPath };
	},
	async del(urlsOrPathnames) {
		if (process.env.BLOB_READ_WRITE_TOKEN) {
			await vercelBlobDel(urlsOrPathnames);
			return;
		}
		const list = Array.isArray(urlsOrPathnames) ? urlsOrPathnames : [urlsOrPathnames];
		for (const item of list) {
			localBlobStore.delete(item);
		}
	}
};

let activeStorageDriver: BlobStorageDriver = defaultStorageDriver;

export function setMediaStorageDriverForTest(driver: BlobStorageDriver | null): void {
	activeStorageDriver = driver ?? defaultStorageDriver;
}

export function getMediaStorageDriver(): BlobStorageDriver {
	return activeStorageDriver;
}

export function getLocalBlobBuffer(url: string): Buffer | undefined {
	return localBlobStore.get(url);
}

/**
 * Sniffs the true MIME type from magic bytes (Section 9.3 step 4).
 */
export function sniffMediaMimeType(buffer: Buffer): AllowedMediaMimeType | null {
	if (!buffer || buffer.length < 4) return null;

	// PNG: 89 50 4E 47 0D 0A 1A 0A
	if (
		buffer.length >= 8 &&
		buffer[0] === 0x89 &&
		buffer[1] === 0x50 &&
		buffer[2] === 0x4e &&
		buffer[3] === 0x47 &&
		buffer[4] === 0x0d &&
		buffer[5] === 0x0a &&
		buffer[6] === 0x1a &&
		buffer[7] === 0x0a
	) {
		return 'image/png';
	}

	// JPEG: FF D8 FF
	if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
		return 'image/jpeg';
	}

	// GIF: GIF87a or GIF89a
	if (
		buffer.length >= 6 &&
		buffer[0] === 0x47 &&
		buffer[1] === 0x49 &&
		buffer[2] === 0x46 &&
		buffer[3] === 0x38 &&
		(buffer[4] === 0x37 || buffer[4] === 0x39) &&
		buffer[5] === 0x61
	) {
		return 'image/gif';
	}

	// WebP: RIFF....WEBP
	if (
		buffer.length >= 12 &&
		buffer[0] === 0x52 &&
		buffer[1] === 0x49 &&
		buffer[2] === 0x46 &&
		buffer[3] === 0x46 &&
		buffer[8] === 0x57 &&
		buffer[9] === 0x45 &&
		buffer[10] === 0x42 &&
		buffer[11] === 0x50
	) {
		return 'image/webp';
	}

	// AVIF: ....ftypavif or ....ftypavis
	if (
		buffer.length >= 12 &&
		buffer[4] === 0x66 &&
		buffer[5] === 0x74 &&
		buffer[6] === 0x79 &&
		buffer[7] === 0x70
	) {
		const brand = buffer.subarray(8, 12).toString('ascii');
		if (brand === 'avif' || brand === 'avis' || brand === 'mif1') {
			return 'image/avif';
		}
	}

	// SVG: text prologue containing <svg
	const headText = buffer.subarray(0, Math.min(buffer.length, 2048)).toString('utf8').trimStart();
	if (
		(headText.startsWith('<svg') ||
			headText.startsWith('<?xml') ||
			headText.startsWith('<!DOCTYPE svg')) &&
		/<svg[\s>]/i.test(headText)
	) {
		return 'image/svg+xml';
	}

	return null;
}

/**
 * Sanitises SVG content by stripping scripts, foreignObject, event handlers, and external references (Section 9.3 step 4).
 */
export function sanitizeSvgBuffer(buffer: Buffer): {
	buffer: Buffer;
	width: number | null;
	height: number | null;
} {
	const raw = buffer.toString('utf8');
	if (!/<svg[\s>]/i.test(raw)) {
		throw new Error('ENCODE_FAILED: Invalid SVG document.');
	}

	const cleaned = raw
		.replace(/<script[\s\S]*?<\/script>/gi, '')
		.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
		.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
		.replace(
			/\s+(?:xlink:)?href\s*=\s*(?:"\s*(?:javascript:|https?:|\/\/)[^"]*"|'\s*(?:javascript:|https?:|\/\/)[^']*')/gi,
			''
		);

	if (!/<svg[\s>]/i.test(cleaned)) {
		throw new Error('ENCODE_FAILED: SVG empty after sanitization.');
	}

	let width: number | null = null;
	let height: number | null = null;
	const svgTagMatch = cleaned.match(/<svg\b[^>]*>/i);
	if (svgTagMatch) {
		const tag = svgTagMatch[0];
		const wMatch = tag.match(/\bwidth\s*=\s*["'](\d+(?:\.\d+)?)(?:px)?["']/i);
		const hMatch = tag.match(/\bheight\s*=\s*["'](\d+(?:\.\d+)?)(?:px)?["']/i);
		if (wMatch) width = Math.round(Number(wMatch[1]));
		if (hMatch) height = Math.round(Number(hMatch[1]));
		if ((!width || !height) && /\bviewBox\s*=\s*["']([^"']+)["']/i.test(tag)) {
			const vb = tag
				.match(/\bviewBox\s*=\s*["']([^"']+)["']/i)?.[1]
				.trim()
				.split(/[\s,]+/);
			if (vb && vb.length === 4) {
				const vbW = Math.round(Number(vb[2]));
				const vbH = Math.round(Number(vb[3]));
				if (vbW > 0 && vbH > 0) {
					width = width ?? vbW;
					height = height ?? vbH;
				}
			}
		}
	}

	return {
		buffer: Buffer.from(cleaned, 'utf8'),
		width,
		height
	};
}

export function sanitiseMediaFileStem(filename: string): string {
	const withoutExt = filename.replace(/\.[a-zA-Z0-9]+$/, '');
	const clean = withoutExt
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 60);
	return clean || 'media';
}

export function formatMediaRowToItem(
	row: typeof media.$inferSelect,
	usageCount?: number
): MediaItem {
	const variants = row.variantsJson ?? {};
	const thumbVariant = variants['480'];
	const mediumVariant = variants['800'];
	const largeVariant = variants['1200'];

	const availableSizes: MediaAvailableSize[] = [
		{
			value: 'thumbnail',
			label: 'Thumbnail (480w)',
			url: thumbVariant?.url ?? row.blobUrl,
			width: thumbVariant?.width ?? null,
			height: thumbVariant?.height ?? null,
			available: Boolean(thumbVariant)
		},
		{
			value: 'medium',
			label: 'Medium (800w)',
			url: mediumVariant?.url ?? row.blobUrl,
			width: mediumVariant?.width ?? null,
			height: mediumVariant?.height ?? null,
			available: Boolean(mediumVariant)
		},
		{
			value: 'large',
			label: 'Large (1200w)',
			url: largeVariant?.url ?? row.blobUrl,
			width: largeVariant?.width ?? null,
			height: largeVariant?.height ?? null,
			available: Boolean(largeVariant)
		},
		{
			value: 'full',
			label: row.width && row.height ? `Full (${row.width}x${row.height})` : 'Full (Original)',
			url: row.blobUrl,
			width: row.width ?? null,
			height: row.height ?? null,
			available: true
		}
	];

	return {
		id: row.id,
		filename: row.filename,
		slug: row.slug,
		mime_type: row.mimeType,
		size_bytes: row.sizeBytes,
		width: row.width ?? null,
		height: row.height ?? null,
		title: row.title,
		alt_text: row.altText,
		description: row.description,
		caption: row.caption,
		folder: row.folder,
		urls: {
			original: row.blobUrl,
			large: largeVariant?.url ?? row.blobUrl,
			medium: mediumVariant?.url ?? row.blobUrl,
			thumbnail: thumbVariant?.url ?? row.blobUrl,
			webp: row.mimeType === 'image/webp' ? row.blobUrl : (largeVariant?.url ?? row.blobUrl)
		},
		available_sizes: availableSizes,
		usage_count: usageCount,
		created_at: row.createdAt.toISOString(),
		updated_at: row.updatedAt.toISOString()
	};
}

export interface UploadMediaParams {
	filename: string;
	buffer: Buffer;
	declaredMimeType?: string;
	metadata?: {
		title?: string;
		alt_text?: string;
		description?: string;
		caption?: string;
		folder?: string;
	};
	actorUserId?: string | null;
}

/**
 * Full upload, conversion, variant generation, and atomic cleanup pipeline (Section 9.3).
 */
export async function uploadMediaAsset(params: UploadMediaParams): Promise<MediaItem> {
	const sniffedMime = sniffMediaMimeType(params.buffer);
	if (!sniffedMime || !MEDIA_ALLOWED_MIME_TYPES.includes(sniffedMime)) {
		throw new Error(
			'UNSUPPORTED_MEDIA_TYPE: File magic bytes do not match an allowed image format (PNG, JPEG, GIF, WebP, AVIF, SVG).'
		);
	}

	let finalBuffer: Buffer;
	let finalMimeType: string = sniffedMime;
	let width: number | null = null;
	let height: number | null = null;

	if (sniffedMime === 'image/svg+xml') {
		const sanitizedSvg = sanitizeSvgBuffer(params.buffer);
		finalBuffer = sanitizedSvg.buffer;
		width = sanitizedSvg.width;
		height = sanitizedSvg.height;
	} else if (sniffedMime === 'image/gif' || sniffedMime === 'image/webp') {
		finalBuffer = params.buffer;
		try {
			const meta = await sharp(finalBuffer).metadata();
			width = meta.width ?? null;
			height = meta.height ?? null;
		} catch (err) {
			if (sniffedMime === 'image/webp') {
				console.warn('[media] Could not read WebP dimensions:', err);
			}
		}
	} else {
		// PNG, JPEG, AVIF -> rotate() + WebP quality 82; reject with 422 on encode failure (never fail open!)
		try {
			const pipeline = sharp(params.buffer).rotate().webp({ quality: MEDIA_WEBP_QUALITY });
			const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
			finalBuffer = data;
			finalMimeType = 'image/webp';
			width = info.width ?? null;
			height = info.height ?? null;
		} catch {
			throw new Error('ENCODE_FAILED: Image could not be decoded or converted to WebP.');
		}
	}

	const stem = sanitiseMediaFileStem(params.filename);
	const hex12 = randomBytes(6).toString('hex');
	const ext =
		finalMimeType === 'image/webp'
			? 'webp'
			: finalMimeType === 'image/svg+xml'
				? 'svg'
				: finalMimeType === 'image/gif'
					? 'gif'
					: 'bin';

	const driver = getMediaStorageDriver();
	const uploadedUrls: string[] = [];
	const variantsMap: Record<string, MediaVariantRecord> = {};
	let originalBlob: { url: string; pathname: string } | null = null;

	if (finalMimeType === 'image/webp' && width !== null && height !== null && width > 480) {
		const targetVariantWidths = MEDIA_VARIANT_WIDTHS.filter((vw) => vw < width!);
		try {
			const variantBuffers = await Promise.all(
				targetVariantWidths.map(async (vw) => {
					const resized = await sharp(finalBuffer)
						.resize({ width: vw, withoutEnlargement: true })
						.webp({ quality: MEDIA_WEBP_QUALITY })
						.toBuffer({ resolveWithObject: true });
					return {
						width: resized.info.width,
						height: resized.info.height,
						buffer: resized.data,
						pathname: `${stem}-${hex12}-${vw}w.webp`
					};
				})
			);

			const originalPathname = `${stem}-${hex12}-${width}w.webp`;
			const [origPut, ...variantPuts] = await Promise.all([
				driver.put(originalPathname, finalBuffer, { contentType: 'image/webp' }),
				...variantBuffers.map((vb) =>
					driver.put(vb.pathname, vb.buffer, { contentType: 'image/webp' })
				)
			]);

			originalBlob = origPut;
			uploadedUrls.push(origPut.url);
			for (let i = 0; i < variantBuffers.length; i++) {
				const vb = variantBuffers[i];
				const putRes = variantPuts[i];
				uploadedUrls.push(putRes.url);
				variantsMap[String(targetVariantWidths[i])] = {
					width: vb.width,
					height: vb.height,
					url: putRes.url,
					pathname: putRes.pathname
				};
			}
		} catch (variantErr) {
			console.warn(
				'[media] Variant upload failed, cleaning siblings and falling back to single put:',
				variantErr
			);
			if (uploadedUrls.length > 0) {
				try {
					await driver.del(uploadedUrls);
				} catch (delErr) {
					console.warn('[media] Cleanup of partial variant uploads failed:', delErr);
				}
				uploadedUrls.length = 0;
			}
			for (const k of Object.keys(variantsMap)) delete variantsMap[k];
			originalBlob = null;
		}
	}

	if (!originalBlob) {
		const singlePathname =
			finalMimeType === 'image/webp' && width
				? `${stem}-${hex12}-${width}w.webp`
				: `${stem}-${hex12}.${ext}`;
		originalBlob = await driver.put(singlePathname, finalBuffer, {
			contentType: finalMimeType
		});
		uploadedUrls.push(originalBlob.url);
	}

	const db = await ensureDbReady();
	const id = randomUUID();
	const now = new Date();
	const folder = normaliseMediaFolder(params.metadata?.folder);
	const displayFilename =
		finalMimeType === 'image/webp' && !params.filename.toLowerCase().endsWith('.webp')
			? `${params.filename.replace(/\.[a-zA-Z0-9]+$/, '')}.webp`
			: params.filename;

	try {
		const inserted = await db
			.insert(media)
			.values({
				id,
				filename: displayFilename,
				slug: originalBlob.pathname,
				mimeType: finalMimeType,
				sizeBytes: finalBuffer.byteLength,
				width,
				height,
				title: replaceEmEnDashesInPlainText((params.metadata?.title ?? '').trim()),
				altText: replaceEmEnDashesInPlainText((params.metadata?.alt_text ?? '').trim()),
				description: replaceEmEnDashesInPlainText((params.metadata?.description ?? '').trim()),
				caption: replaceEmEnDashesInPlainText((params.metadata?.caption ?? '').trim()),
				folder,
				blobUrl: originalBlob.url,
				blobPathname: originalBlob.pathname,
				variantsJson: Object.keys(variantsMap).length > 0 ? variantsMap : null,
				createdAt: now,
				updatedAt: now
			})
			.returning();

		if (folder) {
			await db.insert(mediaFolders).values({ name: folder, createdAt: now }).onConflictDoNothing();
		}

		await writeAuditLog({
			actorUserId: params.actorUserId,
			action: 'media.upload',
			entityType: 'media',
			entityId: id,
			summary: {
				filename: displayFilename,
				mimeType: finalMimeType,
				sizeBytes: finalBuffer.byteLength,
				variants: Object.keys(variantsMap)
			}
		});

		return formatMediaRowToItem(inserted[0], 0);
	} catch (dbErr) {
		// Delete uploaded blobs if DB insert fails so blobs are never orphaned (Section 9.3 step 7)
		if (uploadedUrls.length > 0) {
			try {
				await driver.del(uploadedUrls);
			} catch (cleanupErr) {
				console.error('[media] Failed to clean up blobs after DB insert failure:', cleanupErr);
			}
		}
		throw dbErr;
	}
}

export async function getMediaUsageInPosts(
	mediaRow: Pick<typeof media.$inferSelect, 'blobUrl' | 'variantsJson'>
): Promise<Array<{ id: number; title: string; slug: string }>> {
	const db = await ensureDbReady();
	const candidateUrls = new Set<string>([mediaRow.blobUrl]);
	if (mediaRow.variantsJson) {
		for (const v of Object.values(mediaRow.variantsJson)) {
			if (v?.url) candidateUrls.add(v.url);
		}
	}

	const allPosts = await db
		.select({
			id: posts.id,
			title: posts.title,
			slug: posts.slug,
			coverImage: posts.coverImage,
			ogImage: posts.ogImage,
			twitterImage: posts.twitterImage,
			content: posts.content
		})
		.from(posts)
		.where(isNull(posts.deletedAt));

	const matchingPosts: Array<{ id: number; title: string; slug: string }> = [];
	for (const p of allPosts) {
		let used = false;
		for (const u of candidateUrls) {
			if (p.coverImage === u || p.ogImage === u || p.twitterImage === u || p.content.includes(u)) {
				used = true;
				break;
			}
		}
		if (used) {
			matchingPosts.push({ id: p.id, title: p.title, slug: p.slug });
		}
	}

	return matchingPosts;
}

export async function getMediaById(id: string): Promise<MediaItem | null> {
	const db = await ensureDbReady();
	const rows = await db
		.select()
		.from(media)
		.where(and(eq(media.id, id), isNull(media.deletedAt)))
		.limit(1);

	const row = rows[0];
	if (!row) return null;

	const usage = await getMediaUsageInPosts(row);
	return formatMediaRowToItem(row, usage.length);
}

/**
 * Lists media items with escaped ILIKE search, exact folder, MIME prefix, and usage counts (Section 9.4).
 */
export async function listMediaItems(rawQuery: Partial<MediaListQuery> = {}) {
	const query = mediaListQuerySchema.parse(rawQuery);
	const db = await ensureDbReady();

	const filters = [isNull(media.deletedAt)];

	if (query.search && query.search.trim()) {
		// Escape `%`, `_`, and `\` before ILIKE (Section 9.4)
		const escaped = query.search.trim().replace(/[%_\\]/g, '\\$&');
		const pattern = `%${escaped}%`;
		filters.push(
			or(
				ilike(media.filename, pattern),
				ilike(media.title, pattern),
				ilike(media.altText, pattern),
				ilike(media.caption, pattern)
			)!
		);
	}

	if (query.folder !== undefined) {
		filters.push(eq(media.folder, query.folder));
	}

	if (query.mime_type && query.mime_type.trim()) {
		const escapedMime = query.mime_type.trim().replace(/[%_\\]/g, '\\$&');
		filters.push(ilike(media.mimeType, `${escapedMime}%`));
	}

	const whereClause = and(...filters)!;

	const orderByClause =
		query.sort === 'filename'
			? [asc(media.filename), desc(media.createdAt)]
			: query.sort === 'title'
				? [asc(media.title), desc(media.createdAt)]
				: query.sort === 'size'
					? [desc(media.sizeBytes), desc(media.createdAt)]
					: query.sort === 'oldest'
						? [asc(media.createdAt), asc(media.id)]
						: [desc(media.createdAt), desc(media.id)];

	const offset = (query.page - 1) * query.per_page;

	const [totalRows, itemRows, activePosts] = await Promise.all([
		db.select({ total: count() }).from(media).where(whereClause),
		db
			.select()
			.from(media)
			.where(whereClause)
			.orderBy(...orderByClause)
			.limit(query.per_page)
			.offset(offset),
		db
			.select({
				coverImage: posts.coverImage,
				ogImage: posts.ogImage,
				twitterImage: posts.twitterImage,
				content: posts.content
			})
			.from(posts)
			.where(isNull(posts.deletedAt))
	]);

	const items = itemRows.map((row) => {
		const urlsToCheck = [row.blobUrl];
		if (row.variantsJson) {
			for (const v of Object.values(row.variantsJson)) {
				if (v?.url) urlsToCheck.push(v.url);
			}
		}
		let usageCount = 0;
		for (const p of activePosts) {
			if (
				urlsToCheck.some(
					(u) =>
						p.coverImage === u || p.ogImage === u || p.twitterImage === u || p.content.includes(u)
				)
			) {
				usageCount += 1;
			}
		}
		return formatMediaRowToItem(row, usageCount);
	});

	return {
		items,
		total: Number(totalRows[0]?.total ?? 0),
		page: query.page,
		per_page: query.per_page
	};
}

/**
 * Single atomic `UPDATE ... WHERE id AND deleted_at IS NULL RETURNING` with dash transform (Section 9.5).
 */
export async function updateMediaMetadata(
	id: string,
	rawPatch: unknown,
	actorUserId?: string | null
): Promise<MediaItem | null> {
	const parsed = mediaPatchSchema.parse(rawPatch);
	const db = await ensureDbReady();

	const updateValues: Partial<typeof media.$inferInsert> = {
		updatedAt: new Date()
	};

	if (parsed.title !== undefined) {
		updateValues.title = replaceEmEnDashesInPlainText(parsed.title);
	}
	if (parsed.alt_text !== undefined) {
		updateValues.altText = replaceEmEnDashesInPlainText(parsed.alt_text);
	}
	if (parsed.description !== undefined) {
		updateValues.description = replaceEmEnDashesInPlainText(parsed.description);
	}
	if (parsed.caption !== undefined) {
		updateValues.caption = replaceEmEnDashesInPlainText(parsed.caption);
	}
	if (parsed.folder !== undefined) {
		updateValues.folder = normaliseMediaFolder(parsed.folder);
		if (updateValues.folder) {
			await db.insert(mediaFolders).values({ name: updateValues.folder }).onConflictDoNothing();
		}
	}
	if (parsed.filename !== undefined) {
		updateValues.filename = replaceEmEnDashesInPlainText(parsed.filename);
	}

	const updatedRows = await db
		.update(media)
		.set(updateValues)
		.where(and(eq(media.id, id), isNull(media.deletedAt)))
		.returning();

	const row = updatedRows[0];
	if (!row) return null;

	await writeAuditLog({
		actorUserId,
		action: 'media.update',
		entityType: 'media',
		entityId: id,
		summary: { updatedFields: Object.keys(parsed) }
	});

	const usage = await getMediaUsageInPosts(row);
	return formatMediaRowToItem(row, usage.length);
}

/**
 * Deletes a media item:
 * - Refuses with 409 (`MEDIA_IN_USE`) if referenced by any active post
 * - Deletes blob and variant siblings BEFORE soft-deleting in DB; aborts if blob delete fails (Section 9.5)
 */
export async function deleteMediaItem(
	id: string,
	actorUserId?: string | null
): Promise<{ deleted: true; id: string }> {
	const db = await ensureDbReady();
	const rows = await db
		.select()
		.from(media)
		.where(and(eq(media.id, id), isNull(media.deletedAt)))
		.limit(1);

	const row = rows[0];
	if (!row) {
		throw new Error('MEDIA_NOT_FOUND: Media item not found.');
	}

	const usage = await getMediaUsageInPosts(row);
	if (usage.length > 0) {
		const titles = usage.map((u) => `"${u.title}"`).join(', ');
		const err = new Error(
			`MEDIA_IN_USE: Cannot delete "${row.filename}" because it is used in ${usage.length} post(s): ${titles}.`
		) as Error & { usage?: typeof usage };
		err.usage = usage;
		throw err;
	}

	const urlsToDelete = [row.blobUrl];
	if (row.variantsJson) {
		for (const v of Object.values(row.variantsJson)) {
			if (v?.url) urlsToDelete.push(v.url);
		}
	}

	// Delete blobs BEFORE soft-deleting in DB; abort if blob deletion throws (Section 9.5)
	const driver = getMediaStorageDriver();
	await driver.del(urlsToDelete);

	const now = new Date();
	await db.update(media).set({ deletedAt: now, updatedAt: now }).where(eq(media.id, id));

	await writeAuditLog({
		actorUserId,
		action: 'media.delete',
		entityType: 'media',
		entityId: id,
		summary: { filename: row.filename }
	});

	return { deleted: true, id };
}

export async function restoreMediaItem(
	id: string,
	actorUserId?: string | null
): Promise<MediaItem | null> {
	const db = await ensureDbReady();
	const now = new Date();
	const updated = await db
		.update(media)
		.set({ deletedAt: null, updatedAt: now })
		.where(and(eq(media.id, id), isNotNull(media.deletedAt)))
		.returning();

	const row = updated[0];
	if (!row) return null;

	await writeAuditLog({
		actorUserId,
		action: 'media.restore',
		entityType: 'media',
		entityId: id,
		summary: { filename: row.filename }
	});

	return formatMediaRowToItem(row, 0);
}

export async function listTrashedMediaItems(): Promise<MediaItem[]> {
	const db = await ensureDbReady();
	const rows = await db
		.select()
		.from(media)
		.where(isNotNull(media.deletedAt))
		.orderBy(desc(media.deletedAt));

	return rows.map((r) => formatMediaRowToItem(r, 0));
}

export async function listDistinctMediaFolders(): Promise<string[]> {
	const db = await ensureDbReady();
	const [fromMedia, fromFolders] = await Promise.all([
		db.selectDistinct({ folder: media.folder }).from(media).where(isNull(media.deletedAt)),
		db.select({ folder: mediaFolders.name }).from(mediaFolders)
	]);

	const set = new Set<string>();
	for (const r of [...fromMedia, ...fromFolders]) {
		const norm = normaliseMediaFolder(r.folder);
		if (norm) set.add(norm);
	}
	return [...set].sort((a, b) => a.localeCompare(b));
}

export async function createMediaFolderRecord(
	rawFolderName: string,
	actorUserId?: string | null
): Promise<string> {
	const folder = normaliseMediaFolder(rawFolderName);
	if (!folder) {
		throw new Error('VALIDATION_ERROR: Folder name cannot be empty.');
	}
	const db = await ensureDbReady();
	await db.insert(mediaFolders).values({ name: folder }).onConflictDoNothing();

	await writeAuditLog({
		actorUserId,
		action: 'media.folder_create',
		entityType: 'media',
		entityId: folder,
		summary: { folder }
	});

	return folder;
}
