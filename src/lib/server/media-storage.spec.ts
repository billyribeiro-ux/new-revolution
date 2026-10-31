import { mkdtemp, readdir, rm, writeFile, mkdir, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
	assertSafeMediaPathname,
	createDiskStorageDriver,
	getActiveDiskMediaDriver,
	selectMediaStorageDriver,
	setMediaStorageDriverForTest
} from './media-storage';

let root: string;

beforeEach(async () => {
	root = await mkdtemp(path.join(os.tmpdir(), 'media-disk-'));
});

afterEach(async () => {
	setMediaStorageDriverForTest(null);
	await rm(root, { recursive: true, force: true });
});

describe('disk media driver', () => {
	it('puts, overwrites, reads and returns an absolute <ORIGIN>/media URL', async () => {
		const driver = createDiskStorageDriver(root, { origin: 'http://localhost:5199/' });
		const res = await driver.put('a/chart-1.webp', Buffer.from('one'), {
			contentType: 'image/webp'
		});
		expect(res).toEqual({
			url: 'http://localhost:5199/media/a/chart-1.webp',
			pathname: 'a/chart-1.webp'
		});
		expect((await readFile(path.join(root, 'a/chart-1.webp'))).toString()).toBe('one');

		await driver.put('a/chart-1.webp', Buffer.from('two!'), { contentType: 'image/webp' });
		const file = await driver.read('a/chart-1.webp');
		expect(file?.buffer.toString()).toBe('two!');
		expect(file?.size).toBe(4);
		// atomic write leaves no temp files behind
		expect(await readdir(path.join(root, 'a'))).toEqual(['chart-1.webp']);
	});

	it('read returns null for a missing file', async () => {
		expect(await createDiskStorageDriver(root).read('nope.webp')).toBeNull();
	});

	it('rejects traversal, absolute, NUL, backslash and empty segments in put/del/read', async () => {
		const driver = createDiskStorageDriver(root);
		const bad = [
			'../x.webp',
			'a/../../x.webp',
			'/etc/passwd',
			'a\\b.webp',
			'a\0b.webp',
			'a//b.webp',
			'',
			'.',
			'a/./b'
		];
		for (const p of bad) {
			await expect(driver.put(p, Buffer.from('x'), { contentType: 'image/webp' })).rejects.toThrow(
				/INVALID_MEDIA_PATH/
			);
			await expect(driver.del(p)).rejects.toThrow(/INVALID_MEDIA_PATH/);
			await expect(driver.read(p)).rejects.toThrow(/INVALID_MEDIA_PATH/);
		}
		expect(() => assertSafeMediaPathname('C:/x')).toThrow(/INVALID_MEDIA_PATH/);
		expect(assertSafeMediaPathname('ok/file.webp')).toBe('ok/file.webp');
		expect(await readdir(root)).toEqual([]);
	});

	it('del removes files by pathname, /media URL and absolute /media URL; ignores ENOENT only', async () => {
		const driver = createDiskStorageDriver(root);
		for (const n of ['a.webp', 'b.webp', 'c.webp']) {
			await driver.put(n, Buffer.from(n), { contentType: 'image/webp' });
		}
		await driver.del(['a.webp', '/media/b.webp', 'https://example.test/media/c.webp']);
		expect(await readdir(root)).toEqual([]);
		// missing file: no error
		await expect(driver.del('missing.webp')).resolves.toBeUndefined();
	});

	it('del throws for errors other than ENOENT (EISDIR when the target is a directory)', async () => {
		const driver = createDiskStorageDriver(root);
		await mkdir(path.join(root, 'dir.webp'));
		await writeFile(path.join(root, 'dir.webp', 'f'), 'x');
		await expect(driver.del('dir.webp')).rejects.toThrow();
	});
});

describe('selectMediaStorageDriver', () => {
	const isDisk = (d: unknown) => (d as { kind?: string }).kind === 'disk';

	it('token set selects Blob (not disk)', () => {
		expect(isDisk(selectMediaStorageDriver({ BLOB_READ_WRITE_TOKEN: 'tok' }))).toBe(false);
		expect(
			isDisk(selectMediaStorageDriver({ BLOB_READ_WRITE_TOKEN: 'tok', NODE_ENV: 'production' }))
		).toBe(false);
	});

	it('no token in development/test selects disk', () => {
		expect(isDisk(selectMediaStorageDriver({}, { diskRoot: root }))).toBe(true);
		expect(isDisk(selectMediaStorageDriver({ NODE_ENV: 'development' }, { diskRoot: root }))).toBe(
			true
		);
	});

	it('no token on Vercel or in production throws a clear error', () => {
		expect(() => selectMediaStorageDriver({ VERCEL: '1' })).toThrow(/not configured/);
		expect(() => selectMediaStorageDriver({ NODE_ENV: 'production' })).toThrow(
			/BLOB_READ_WRITE_TOKEN/
		);
	});

	it('MEDIA_STORAGE=disk is honoured explicitly, including in production', () => {
		expect(
			isDisk(
				selectMediaStorageDriver(
					{ NODE_ENV: 'production', MEDIA_STORAGE: 'disk' },
					{ diskRoot: root }
				)
			)
		).toBe(true);
		expect(
			isDisk(
				selectMediaStorageDriver(
					{ BLOB_READ_WRITE_TOKEN: 'tok', MEDIA_STORAGE: 'disk' },
					{ diskRoot: root }
				)
			)
		).toBe(true);
	});

	it('MEDIA_STORAGE=blob without a token, or an unknown value, throws', () => {
		expect(() => selectMediaStorageDriver({ MEDIA_STORAGE: 'blob' })).toThrow(
			/requires BLOB_READ_WRITE_TOKEN/
		);
		expect(() => selectMediaStorageDriver({ MEDIA_STORAGE: 's3' })).toThrow(/"blob" or "disk"/);
	});

	it('getActiveDiskMediaDriver honours the test override', () => {
		const disk = createDiskStorageDriver(root);
		setMediaStorageDriverForTest(disk);
		expect(getActiveDiskMediaDriver()).toBe(disk);
		setMediaStorageDriverForTest({
			put: async () => ({ url: '', pathname: '' }),
			del: async () => {}
		});
		expect(getActiveDiskMediaDriver()).toBeNull();
	});
});
