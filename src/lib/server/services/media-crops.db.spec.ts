import { mkdtemp, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { createTestDatabase, setActiveDbForTest } from '../db';
import { media, posts, user } from '../db/schema';
import {
	createDiskStorageDriver,
	setMediaStorageDriverForTest,
	type BlobStorageDriver
} from '../media-storage';
import { coverSrcsetFromMedia } from '../../shared/cover-srcset';
import {
	deleteMediaItem,
	getMediaCropsForUrl,
	getMediaUsageInPosts,
	uploadMediaAsset
} from './media';

function trackingDriver(options: { failPutMatching?: RegExp } = {}) {
	const stored = new Map<string, Buffer>();
	const driver: BlobStorageDriver = {
		async put(pathname, body) {
			if (options.failPutMatching?.test(pathname)) throw new Error(`PUT_FAILED ${pathname}`);
			stored.set(`/media/${pathname}`, body);
			return { url: `/media/${pathname}`, pathname };
		},
		async del(urls) {
			for (const u of Array.isArray(urls) ? urls : [urls]) stored.delete(u);
		}
	};
	return { driver, stored };
}

async function png(width: number, height: number) {
	return sharp({
		create: { width, height, channels: 3, background: { r: 200, g: 40, b: 40 } }
	})
		.png()
		.toBuffer();
}

describe('cover crops at upload', () => {
	let env: Awaited<ReturnType<typeof createTestDatabase>>;
	const actorUserId = 'admin-crops-1';

	beforeAll(async () => {
		env = await createTestDatabase();
		setActiveDbForTest(env.db);
		await env.db.insert(user).values({
			id: actorUserId,
			name: 'Admin',
			email: 'crops-admin@example.test',
			emailVerified: true,
			role: 'admin'
		});
	});
	beforeEach(() => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});
	afterAll(async () => {
		setMediaStorageDriverForTest(null);
		vi.restoreAllMocks();
		await env.cleanup();
	});

	it('1600x1000 PNG: three exact-ratio crops, >= 50K px, named -crop-<aspect>.webp, real dimensions', async () => {
		const { driver, stored } = trackingDriver();
		setMediaStorageDriverForTest(driver);
		const item = await uploadMediaAsset({
			filename: 'Big Chart.png',
			buffer: await png(1600, 1000),
			actorUserId
		});
		const row = (await env.db.select().from(media).where(eq(media.id, item.id)))[0];
		const v = row.variantsJson!;
		expect(Object.keys(v).sort()).toEqual(
			['1200', '480', '800', 'crop-16x9', 'crop-1x1', 'crop-4x3'].sort()
		);
		const expected = { '16x9': [1200, 675], '4x3': [1200, 900], '1x1': [1000, 1000] } as const;
		for (const aspect of ['16x9', '4x3', '1x1'] as const) {
			const rec = v[`crop-${aspect}`];
			expect(rec.kind).toBe('crop');
			expect(rec.aspect).toBe(aspect);
			expect(rec.pathname).toMatch(new RegExp(`^big-chart-[0-9a-f]{12}-crop-${aspect}\\.webp$`));
			const meta = await sharp(stored.get(rec.url)!).metadata();
			expect([meta.width, meta.height]).toEqual(expected[aspect]);
			expect(meta.format).toBe('webp');
			expect(meta.width! * meta.height!).toBeGreaterThanOrEqual(50_000);
			expect([rec.width, rec.height]).toEqual(expected[aspect]);
		}
		// Consumers: width ladders and the library item are unaffected by crops.
		expect(item.available_sizes.map((s) => s.available)).toEqual([true, true, true, true]);
		const srcset = coverSrcsetFromMedia(row.blobUrl, row)!;
		expect(srcset).not.toContain('crop');
		expect(srcset.split(', ').map((p) => p.split(' ')[1])).toEqual([
			'480w',
			'800w',
			'1200w',
			'1600w'
		]);
		// Service contract: resolvable from original, a width variant, or a crop URL.
		const crops = await getMediaCropsForUrl(row.blobUrl);
		expect(crops.map((c) => c.aspect)).toEqual(['16x9', '4x3', '1x1']);
		expect(await getMediaCropsForUrl(v['800'].url)).toEqual(crops);
		expect(await getMediaCropsForUrl(v['crop-1x1'].url)).toEqual(crops);
		expect(await getMediaCropsForUrl('/media/unknown.webp')).toEqual([]);
		expect(await getMediaCropsForUrl(null)).toEqual([]);
	});

	it('small source skips crops it cannot fill and records nothing for them', async () => {
		const { driver } = trackingDriver();
		setMediaStorageDriverForTest(driver);
		// 600x200: 1x1 would be 200x200 = 40,000 px -> skipped
		const item = await uploadMediaAsset({
			filename: 'banner.png',
			buffer: await png(600, 200),
			actorUserId
		});
		const row = (await env.db.select().from(media).where(eq(media.id, item.id)))[0];
		expect(
			Object.keys(row.variantsJson!)
				.filter((k) => k.startsWith('crop-'))
				.sort()
		).toEqual(['crop-16x9', 'crop-4x3']);
		// 200x200: no crop at all, single original put and no variants
		const tiny = await uploadMediaAsset({
			filename: 'tiny.png',
			buffer: await png(200, 200),
			actorUserId
		});
		const tinyRow = (await env.db.select().from(media).where(eq(media.id, tiny.id)))[0];
		expect(tinyRow.variantsJson).toBeNull();
	});

	it('a crop put failure deletes every put that succeeded and writes no row', async () => {
		const { driver, stored } = trackingDriver({ failPutMatching: /-crop-4x3\.webp$/ });
		setMediaStorageDriverForTest(driver);
		const before = (await env.db.select().from(media)).length;
		await expect(
			uploadMediaAsset({ filename: 'fail.png', buffer: await png(1600, 1000), actorUserId })
		).rejects.toThrow(/PUT_FAILED .*crop-4x3/);
		expect(stored.size).toBe(0);
		expect((await env.db.select().from(media)).length).toBe(before);
	});

	it('delete removes crops and a post using only a crop URL blocks deletion', async () => {
		const { driver, stored } = trackingDriver();
		setMediaStorageDriverForTest(driver);
		const item = await uploadMediaAsset({
			filename: 'del.png',
			buffer: await png(1600, 1000),
			actorUserId
		});
		expect(stored.size).toBe(7);
		const row = (await env.db.select().from(media).where(eq(media.id, item.id)))[0];
		const cropUrl = row.variantsJson!['crop-16x9'].url;
		expect((await getMediaUsageInPosts(row)).length).toBe(0);
		await env.db.insert(posts).values({
			slug: 'uses-crop',
			title: 'Uses crop',
			excerpt: 'x',
			content: `<img src="${cropUrl}" alt="a">`
		});
		expect((await getMediaUsageInPosts(row)).map((p) => p.slug)).toEqual(['uses-crop']);
		await expect(deleteMediaItem(item.id, actorUserId)).rejects.toThrow(/^MEDIA_IN_USE:/);
		await env.db.delete(posts).where(eq(posts.slug, 'uses-crop'));
		await deleteMediaItem(item.id, actorUserId);
		expect(stored.size).toBe(0);
	});

	it('runtime proof on the real disk driver: files exist with sharp-measured dimensions', async () => {
		const root = await mkdtemp(path.join(os.tmpdir(), 'media-crops-'));
		try {
			const disk = createDiskStorageDriver(root, { origin: 'http://localhost:5196' });
			setMediaStorageDriverForTest(disk);
			const item = await uploadMediaAsset({
				filename: 'proof.png',
				buffer: await png(1600, 1000),
				actorUserId
			});
			const files = (await readdir(root)).sort();
			const measured: Record<string, string> = {};
			for (const f of files) {
				const m = await sharp(path.join(root, f)).metadata();
				measured[f.replace(/-[0-9a-f]{12}/, '-<hex>')] = `${m.width}x${m.height}`;
			}
			console.info('[crops runtime proof]', JSON.stringify(measured));
			expect(files.filter((f) => f.includes('-crop-'))).toHaveLength(3);
			expect(measured['proof-<hex>-crop-16x9.webp']).toBe('1200x675');
			expect(item.urls.original).toMatch(/^http:\/\/localhost:5196\/media\/proof-/);
			await deleteMediaItem(item.id, actorUserId);
			expect(await readdir(root)).toEqual([]);
		} finally {
			setMediaStorageDriverForTest(null);
			await rm(root, { recursive: true, force: true });
		}
	});
});
