import sharp from 'sharp';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestDatabase, setActiveDbForTest } from '../db';
import { media, user } from '../db/schema';
import { setMediaStorageDriverForTest, type BlobStorageDriver } from '../media-storage';
import { deleteMediaItem, restoreMediaItem, uploadMediaAsset } from './media';

const auditState = vi.hoisted(() => ({ fail: false }));
vi.mock('../audit', async (importOriginal) => {
	const original = await importOriginal<typeof import('../audit')>();
	return {
		...original,
		writeAuditLog: async (...args: Parameters<typeof original.writeAuditLog>) => {
			if (auditState.fail) throw new Error('AUDIT_DOWN');
			return original.writeAuditLog(...args);
		}
	};
});

/** In-memory driver used only inside this spec to observe exactly what is stored/deleted. */
function trackingDriver(options: { failPutMatching?: RegExp; failAllPuts?: boolean } = {}) {
	const stored = new Map<string, Buffer>();
	const driver: BlobStorageDriver = {
		async put(pathname, body) {
			if (
				options.failAllPuts ||
				(options.failPutMatching && options.failPutMatching.test(pathname))
			) {
				throw new Error(`PUT_FAILED ${pathname}`);
			}
			stored.set(`/media/${pathname}`, body);
			return { url: `/media/${pathname}`, pathname };
		},
		async del(urls) {
			for (const u of Array.isArray(urls) ? urls : [urls]) stored.delete(u);
		}
	};
	return { driver, stored };
}

describe('media pipeline: orphans, audit failure, restore', () => {
	let testEnv: Awaited<ReturnType<typeof createTestDatabase>>;
	const actorUserId = 'admin-pipeline-1';
	let png: Buffer;

	beforeAll(async () => {
		testEnv = await createTestDatabase();
		setActiveDbForTest(testEnv.db);
		await testEnv.db.insert(user).values({
			id: actorUserId,
			name: 'Admin',
			email: 'pipeline-admin@example.test',
			emailVerified: true,
			role: 'admin'
		});
		png = await sharp({
			create: { width: 1400, height: 800, channels: 3, background: { r: 1, g: 2, b: 3 } }
		})
			.png()
			.toBuffer();
	});

	beforeEach(() => {
		auditState.fail = false;
		vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterAll(async () => {
		setMediaStorageDriverForTest(null);
		vi.restoreAllMocks();
		await testEnv.cleanup();
	});

	it('partial variant put failure deletes the puts that succeeded, rethrows, and writes no row', async () => {
		const { driver, stored } = trackingDriver({ failPutMatching: /-800w\.webp$/ });
		setMediaStorageDriverForTest(driver);
		const before = (await testEnv.db.select().from(media)).length;
		await expect(
			uploadMediaAsset({ filename: 'partial.png', buffer: png, actorUserId })
		).rejects.toThrow(/PUT_FAILED .*800w\.webp/);
		expect(stored.size).toBe(0);
		expect((await testEnv.db.select().from(media)).length).toBe(before);
	});

	it('storage failure on every put returns an error and writes no row', async () => {
		const { driver, stored } = trackingDriver({ failAllPuts: true });
		setMediaStorageDriverForTest(driver);
		const before = (await testEnv.db.select().from(media)).length;
		await expect(uploadMediaAsset({ filename: 'x.png', buffer: png, actorUserId })).rejects.toThrow(
			/PUT_FAILED/
		);
		expect(stored.size).toBe(0);
		expect((await testEnv.db.select().from(media)).length).toBe(before);
	});

	it('an audit-log failure after a successful insert keeps the row AND its blobs', async () => {
		const { driver, stored } = trackingDriver();
		setMediaStorageDriverForTest(driver);
		auditState.fail = true;
		const item = await uploadMediaAsset({ filename: 'audit.png', buffer: png, actorUserId });
		expect(item.urls.original).toMatch(/^\/media\/audit-.*-1400w\.webp$/);
		expect(stored.size).toBe(7); // original + 480/800/1200 + 3 crops
		expect(stored.has(item.urls.original)).toBe(true);
		const rows = await testEnv.db.select().from(media);
		expect(rows.some((r) => r.id === item.id)).toBe(true);
		expect(console.error).toHaveBeenCalled();
	});

	it('restore is refused with MEDIA_RESTORE_UNAVAILABLE because delete removes the files', async () => {
		const { driver, stored } = trackingDriver();
		setMediaStorageDriverForTest(driver);
		const item = await uploadMediaAsset({ filename: 'gone.png', buffer: png, actorUserId });
		await deleteMediaItem(item.id, actorUserId);
		expect(stored.size).toBe(0);
		await expect(restoreMediaItem(item.id)).rejects.toThrow(/^MEDIA_RESTORE_UNAVAILABLE:/);
		// row stays trashed
		const row = (await testEnv.db.select().from(media)).find((r) => r.id === item.id);
		expect(row?.deletedAt).not.toBeNull();
		// unknown id -> null
		expect(await restoreMediaItem('does-not-exist')).toBeNull();
	});
});
