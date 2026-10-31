import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { eq } from 'drizzle-orm';
import { createTestDatabase, setActiveDbForTest } from '../src/lib/server/db';
import { media, posts } from '../src/lib/server/db/schema';
import {
	BACKFILL_MAX_DOWNLOAD_BYTES,
	backfillBlogImageVariants,
	isAllowedBlobUrl,
	isAlreadyVariantUrl,
	parseBackfillCliArgs
} from './backfill-blog-image-variants';
import type { BlobStorageDriver } from '../src/lib/server/services/media';

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
