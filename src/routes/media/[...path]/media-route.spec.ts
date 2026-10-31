import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDiskStorageDriver, setMediaStorageDriverForTest } from '#lib/server/media-storage';
import { GET, HEAD } from './+server';

let root: string;

function call(handler: typeof GET, p: string, init?: RequestInit) {
	return handler({
		params: { path: p },
		request: new Request(`http://localhost:5173/media/${p}`, init)
	} as unknown as Parameters<typeof GET>[0]);
}

beforeEach(async () => {
	root = await mkdtemp(path.join(os.tmpdir(), 'media-route-'));
	setMediaStorageDriverForTest(createDiskStorageDriver(root));
});

afterEach(async () => {
	setMediaStorageDriverForTest(null);
	await rm(root, { recursive: true, force: true });
});

describe('GET/HEAD /media/[...path]', () => {
	it('serves a stored file with type, cache and nosniff headers', async () => {
		const bytes = Buffer.from('RIFFxxxxWEBPdata');
		await createDiskStorageDriver(root).put('x/pic-1.webp', bytes, { contentType: 'image/webp' });
		const res = await call(GET, 'x/pic-1.webp');
		expect(res.status).toBe(200);
		expect(res.headers.get('content-type')).toBe('image/webp');
		expect(res.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
		expect(res.headers.get('x-content-type-options')).toBe('nosniff');
		expect(res.headers.get('content-length')).toBe(String(bytes.length));
		expect(Buffer.from(await res.arrayBuffer()).equals(bytes)).toBe(true);
	});

	it('HEAD returns headers without a body', async () => {
		await createDiskStorageDriver(root).put('pic.png', Buffer.from('png'), {
			contentType: 'image/png'
		});
		const res = await call(HEAD, 'pic.png', { method: 'HEAD' });
		expect(res.status).toBe(200);
		expect(res.headers.get('content-type')).toBe('image/png');
		expect(await res.text()).toBe('');
	});

	it('returns 304 when If-None-Match matches the weak etag', async () => {
		await createDiskStorageDriver(root).put('pic.webp', Buffer.from('abc'), {
			contentType: 'image/webp'
		});
		const first = await call(GET, 'pic.webp');
		const etag = first.headers.get('etag');
		expect(etag).toMatch(/^W\/"/);
		const second = await call(GET, 'pic.webp', { headers: { 'if-none-match': etag! } });
		expect(second.status).toBe(304);
		expect(await second.text()).toBe('');
		const third = await call(GET, 'pic.webp', { headers: { 'if-none-match': 'W/"nope"' } });
		expect(third.status).toBe(200);
	});

	it('adds a locked-down CSP to svg', async () => {
		await createDiskStorageDriver(root).put('d.svg', Buffer.from('<svg/>'), {
			contentType: 'image/svg+xml'
		});
		const res = await call(GET, 'd.svg');
		expect(res.headers.get('content-type')).toBe('image/svg+xml');
		expect(res.headers.get('content-security-policy')).toBe(
			"default-src 'none'; style-src 'unsafe-inline'; sandbox"
		);
	});

	it('404s for missing files, traversal, NUL, disallowed extensions and temp files', async () => {
		await createDiskStorageDriver(root).put('secret.txt', Buffer.from('s'), {
			contentType: 'text/plain'
		});
		for (const p of [
			'missing.webp',
			'../etc/passwd.png',
			'a/../b.png',
			'a\\b.png',
			'a\0b.png',
			'secret.txt',
			'noext',
			'x.webp.tmp',
			''
		]) {
			expect((await call(GET, p)).status, p).toBe(404);
		}
	});

	it('404s when the active driver is not the disk driver', async () => {
		await createDiskStorageDriver(root).put('pic.webp', Buffer.from('abc'), {
			contentType: 'image/webp'
		});
		setMediaStorageDriverForTest({
			put: async () => ({ url: '', pathname: '' }),
			del: async () => {}
		});
		expect((await call(GET, 'pic.webp')).status).toBe(404);
	});
});
