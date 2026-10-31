import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { eq } from 'drizzle-orm';
import { createTestDatabase, setActiveDbForTest } from '../src/lib/server/db';
import { media, posts } from '../src/lib/server/db/schema';
import {
	BACKFILL_MAX_DOWNLOAD_BYTES,
	backfillBlogImageVariants,
	backfillCoverCrops,
	defaultFetchSourceBuffer,
	isAllowedBlobUrl,
	isAlreadyVariantUrl,
	parseBackfillCliArgs
} from './backfill-blog-image-variants';
import {
	createDiskStorageDriver,
	setMediaStorageDriverForTest,
	type BlobStorageDriver
} from '../src/lib/server/media-storage';

describe('scripts/backfill-blog-image-variants', () => {
	it('defaults CLI args to dryRun=true and requires --apply to write', () => {
		expect(parseBackfillCliArgs([])).toEqual({
			dryRun: true,
			limit: undefined,
			concurrency: 3
		});

		expect(parseBackfillCliArgs(['--apply', '--limit=10', '--concurrency=4'])).toEqual({
			dryRun: false,
			limit: 10,
			concurrency: 4
		});

		expect(parseBackfillCliArgs(['--apply', '--dry-run'])).toEqual({
			dryRun: true,
			limit: undefined,
			concurrency: 3
		});
	});

	it('validates allowed blob hosts and detects already-variant URLs', () => {
		expect(isAllowedBlobUrl('https://revolutiontradingpros.com/media/chart.png')).toBe(true);
		expect(isAllowedBlobUrl('https://abc123.public.blob.vercel-storage.com/chart-abc.png')).toBe(
			true
		);
		expect(isAllowedBlobUrl('http://localhost:5173/media/chart.png')).toBe(true);
		expect(isAllowedBlobUrl('https://evil.example.com/chart.png')).toBe(false);
		expect(isAllowedBlobUrl('ftp://revolutiontradingpros.com/chart.png')).toBe(false);

		expect(isAlreadyVariantUrl('https://revolutiontradingpros.com/media/chart-1200w.webp')).toBe(
			true
		);
		expect(isAlreadyVariantUrl('chart-abc-480w.webp')).toBe(true);
		expect(isAlreadyVariantUrl('chart-abc-1600w.webp')).toBe(true);
		expect(isAlreadyVariantUrl('chart-abc.webp')).toBe(false);
		expect(isAlreadyVariantUrl('chart-abc.png')).toBe(false);
	});

	it('skips variant-named, non-raster, and <=480px images and rejects disallowed hosts or >15 MiB files', async () => {
		const { db } = await createTestDatabase();
		setActiveDbForTest(db);

		const largeBuffer = await sharp({
			create: { width: 1400, height: 900, channels: 3, background: { r: 20, g: 80, b: 140 } }
		})
			.png()
			.toBuffer();

		const smallBuffer = await sharp({
			create: { width: 400, height: 300, channels: 3, background: { r: 20, g: 80, b: 140 } }
		})
			.png()
			.toBuffer();

		await db.insert(media).values([
			{
				id: 'skip-already-variant',
				filename: 'hero-1200w.webp',
				slug: 'hero-1200w.webp',
				mimeType: 'image/webp',
				sizeBytes: 1024,
				blobUrl: 'https://revolutiontradingpros.com/media/hero-1200w.webp',
				blobPathname: 'hero-1200w.webp',
				width: 1200,
				height: 800,
				variantsJson: null
			},
			{
				id: 'skip-small-480',
				filename: 'small.png',
				slug: 'small.png',
				mimeType: 'image/png',
				sizeBytes: smallBuffer.byteLength,
				blobUrl: 'https://revolutiontradingpros.com/media/small.png',
				blobPathname: 'small.png',
				width: 480,
				height: 320,
				variantsJson: null
			},
			{
				id: 'skip-gif',
				filename: 'anim.gif',
				slug: 'anim.gif',
				mimeType: 'image/gif',
				sizeBytes: 2048,
				blobUrl: 'https://revolutiontradingpros.com/media/anim.gif',
				blobPathname: 'anim.gif',
				width: 1000,
				height: 800,
				variantsJson: null
			},
			{
				id: 'fail-disallowed-host',
				filename: 'external.png',
				slug: 'external.png',
				mimeType: 'image/png',
				sizeBytes: largeBuffer.byteLength,
				blobUrl: 'https://untrusted-cdn.example.org/external.png',
				blobPathname: 'external.png',
				width: 1400,
				height: 900,
				variantsJson: null
			},
			{
				id: 'fail-oversized',
				filename: 'huge.png',
				slug: 'huge.png',
				mimeType: 'image/png',
				sizeBytes: BACKFILL_MAX_DOWNLOAD_BYTES + 100,
				blobUrl: 'https://revolutiontradingpros.com/media/huge.png',
				blobPathname: 'huge.png',
				width: 1400,
				height: 900,
				variantsJson: null
			}
		]);

		const res = await backfillBlogImageVariants({
			dryRun: false,
			fetchSourceBuffer: async (url) => {
				if (url.endsWith('/huge.png')) {
					return Buffer.alloc(BACKFILL_MAX_DOWNLOAD_BYTES + 10);
				}
				return largeBuffer;
			}
		});

		expect(res.scanned).toBe(5);
		expect(res.skipped).toBe(3);
		expect(res.failed).toBe(2);
		expect(res.updated).toBe(0);
		expect(res.errors.map((e) => e.id).sort()).toEqual(['fail-disallowed-host', 'fail-oversized']);
	});

	it('updates media row, posts.coverImage, posts.ogImage, and posts.content idempotently without deleting old blob', async () => {
		const { db } = await createTestDatabase();
		setActiveDbForTest(db);

		const sourcePng = await sharp({
			create: { width: 1500, height: 1000, channels: 3, background: { r: 30, g: 160, b: 90 } }
		})
			.png()
			.toBuffer();

		const oldUrl = 'https://revolutiontradingpros.com/media/legacy-spx-setup.png';

		await db.insert(media).values({
			id: 'media-backfill-1',
			filename: 'legacy-spx-setup.png',
			slug: 'legacy-spx-setup.png',
			mimeType: 'image/png',
			sizeBytes: sourcePng.byteLength,
			blobUrl: oldUrl,
			blobPathname: 'legacy-spx-setup.png',
			width: null,
			height: null,
			variantsJson: null
		});

		const [createdPost] = await db
			.insert(posts)
			.values({
				title: 'SPX Setup Guide',
				slug: 'spx-setup-guide',
				content: `<p>Chart analysis:</p><img src="${oldUrl}" alt="SPX Chart" class="blog-image">`,
				coverImage: oldUrl,
				ogImage: oldUrl,
				status: 'published',
				published: true,
				visibility: 'public'
			})
			.returning();

		const uploadedPaths: string[] = [];
		const deletedPaths: string[] = [];

		const mockDriver: BlobStorageDriver = {
			async put(pathname) {
				uploadedPaths.push(pathname);
				return {
					url: `https://revolutiontradingpros.com/media/${pathname}`,
					pathname
				};
			},
			async del(urls) {
				const list = Array.isArray(urls) ? urls : [urls];
				deletedPaths.push(...list);
			}
		};

		// Default dryRun = true does not write or upload
		const dryRes = await backfillBlogImageVariants({
			fetchSourceBuffer: async () => sourcePng,
			storageDriver: mockDriver
		});
		expect(dryRes.updated).toBe(1);
		expect(uploadedPaths).toHaveLength(0);

		// Apply run (dryRun: false) uploads primary + 480/800/1200 variants and updates media + posts
		const applyRes = await backfillBlogImageVariants({
			dryRun: false,
			fetchSourceBuffer: async () => sourcePng,
			storageDriver: mockDriver
		});

		expect(applyRes.updated).toBe(1);
		expect(applyRes.failed).toBe(0);
		expect(deletedPaths).toHaveLength(0); // Never delete old blob
		expect(uploadedPaths).toEqual([
			'legacy-spx-setup-1500w.webp',
			'legacy-spx-setup-480w.webp',
			'legacy-spx-setup-800w.webp',
			'legacy-spx-setup-1200w.webp'
		]);

		const newPrimaryUrl = 'https://revolutiontradingpros.com/media/legacy-spx-setup-1500w.webp';

		const [updatedMedia] = await db.select().from(media).where(eq(media.id, 'media-backfill-1'));
		expect(updatedMedia?.blobUrl).toBe(newPrimaryUrl);
		expect(updatedMedia?.mimeType).toBe('image/webp');
		expect(updatedMedia?.width).toBe(1500);
		expect(updatedMedia?.height).toBe(1000);
		expect(Object.keys(updatedMedia?.variantsJson ?? {}).sort()).toEqual(['1200', '480', '800']);

		const [updatedPost] = await db.select().from(posts).where(eq(posts.id, createdPost!.id));
		expect(updatedPost?.coverImage).toBe(newPrimaryUrl);
		expect(updatedPost?.coverImageWidth).toBe(1500);
		expect(updatedPost?.coverImageHeight).toBe(1000);
		expect(updatedPost?.ogImage).toBe(newPrimaryUrl);
		expect(updatedPost?.content).toContain(`src="${newPrimaryUrl}"`);
		expect(updatedPost?.content).not.toContain(oldUrl);

		// Second apply run is a no-op
		const secondRes = await backfillBlogImageVariants({
			dryRun: false,
			fetchSourceBuffer: async () => sourcePng,
			storageDriver: mockDriver
		});
		expect(secondRes.scanned).toBe(0);
		expect(secondRes.updated).toBe(0);
	});
});

describe('defaultFetchSourceBuffer with the local disk driver', () => {
	afterEach(() => setMediaStorageDriverForTest(null));

	it('reads relative and absolute /media URLs from disk and fails loudly when the file is missing', async () => {
		const root = mkdtempSync(path.join(os.tmpdir(), 'backfill-disk-'));
		try {
			const driver = createDiskStorageDriver(root, { origin: 'http://localhost:5199' });
			setMediaStorageDriverForTest(driver);
			const put = await driver.put('a-1.webp', Buffer.from('bytes'), { contentType: 'image/webp' });
			expect(isAllowedBlobUrl('/media/a-1.webp')).toBe(true);
			expect(isAllowedBlobUrl('//evil.example/media/a.webp')).toBe(false);
			expect((await defaultFetchSourceBuffer('/media/a-1.webp')).toString()).toBe('bytes');
			expect((await defaultFetchSourceBuffer(put.url)).toString()).toBe('bytes');
			await expect(defaultFetchSourceBuffer('/media/missing.webp')).rejects.toThrow(/not found/);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});

describe('scripts/backfill-blog-image-variants: cover crops', () => {
	it('adds crops to rows without them: dry-run writes nothing, apply is idempotent, small rows skipped, failure cleans up', async () => {
		const { db } = await createTestDatabase();
		setActiveDbForTest(db);
		const big = await sharp({
			create: { width: 1600, height: 1000, channels: 3, background: { r: 9, g: 99, b: 199 } }
		})
			.webp()
			.toBuffer();
		const tiny = await sharp({
			create: { width: 200, height: 200, channels: 3, background: { r: 9, g: 99, b: 199 } }
		})
			.webp()
			.toBuffer();
		const bigUrl = 'https://revolutiontradingpros.com/media/hero-0123456789ab-1600w.webp';
		await db.insert(media).values([
			{
				id: 'crop-big',
				filename: 'hero.webp',
				slug: 'hero-0123456789ab-1600w.webp',
				mimeType: 'image/webp',
				sizeBytes: big.byteLength,
				blobUrl: bigUrl,
				blobPathname: 'hero-0123456789ab-1600w.webp',
				width: 1600,
				height: 1000,
				variantsJson: {
					'480': { width: 480, height: 300, url: 'https://x.test/a', pathname: 'a' }
				}
			},
			{
				id: 'crop-tiny',
				filename: 'tiny.webp',
				slug: 'tiny.webp',
				mimeType: 'image/webp',
				sizeBytes: tiny.byteLength,
				blobUrl: 'https://revolutiontradingpros.com/media/tiny-200w.webp',
				blobPathname: 'tiny-200w.webp',
				width: 200,
				height: 200,
				variantsJson: null
			}
		]);

		const putPaths: string[] = [];
		const deleted: string[] = [];
		let failMatch: RegExp | null = null;
		const driver: BlobStorageDriver = {
			async put(pathname) {
				if (failMatch?.test(pathname)) throw new Error(`PUT_FAILED ${pathname}`);
				putPaths.push(pathname);
				return { url: `https://revolutiontradingpros.com/media/${pathname}`, pathname };
			},
			async del(urls) {
				deleted.push(...(Array.isArray(urls) ? urls : [urls]));
			}
		};
		const opts = { fetchSourceBuffer: async () => big, storageDriver: driver };

		const dry = await backfillCoverCrops(opts);
		expect(dry).toMatchObject({ scanned: 2, updated: 1, skipped: 1, failed: 0 });
		expect(putPaths).toHaveLength(0);

		failMatch = /crop-1x1/;
		const failed = await backfillCoverCrops({ ...opts, dryRun: false });
		expect(failed.failed).toBe(1);
		expect(deleted.sort()).toEqual(
			putPaths.map((p) => `https://revolutiontradingpros.com/media/${p}`).sort()
		);
		const [unchanged] = await db.select().from(media).where(eq(media.id, 'crop-big'));
		expect(Object.keys(unchanged!.variantsJson!)).toEqual(['480']);

		failMatch = null;
		putPaths.length = 0;
		const ok = await backfillCoverCrops({ ...opts, dryRun: false });
		expect(ok).toMatchObject({ updated: 1, skipped: 1, failed: 0 });
		expect(putPaths.sort()).toEqual([
			'hero-0123456789ab-crop-16x9.webp',
			'hero-0123456789ab-crop-1x1.webp',
			'hero-0123456789ab-crop-4x3.webp'
		]);
		const [row] = await db.select().from(media).where(eq(media.id, 'crop-big'));
		expect(Object.keys(row!.variantsJson!).sort()).toEqual([
			'480',
			'crop-16x9',
			'crop-1x1',
			'crop-4x3'
		]);
		expect(row!.variantsJson!['crop-16x9']).toMatchObject({
			kind: 'crop',
			aspect: '16x9',
			width: 1200,
			height: 675
		});
		expect(row!.blobUrl).toBe(bigUrl); // no URL change

		putPaths.length = 0;
		const again = await backfillCoverCrops({ ...opts, dryRun: false });
		expect(again.scanned).toBe(1); // only the tiny row (no crops recorded for it)
		expect(again.updated).toBe(0);
		expect(putPaths).toHaveLength(0);
	});
});
