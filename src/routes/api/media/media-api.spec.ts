import { beforeEach, describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { createTestDatabase, setActiveDbForTest } from '#lib/server/db';
import { media, user } from '#lib/server/db/schema';
import { POST as uploadHandler } from './upload/+server';
import { GET as listHandler } from './list/+server';
import { GET as foldersGetHandler, POST as foldersPostHandler } from './folders/+server';
import {
	GET as itemGetHandler,
	PATCH as itemPatchHandler,
	DELETE as itemDeleteHandler
} from './[id]/+server';
import { createPost, permanentlyDeletePost } from '#lib/server/services/posts';
import {
	backfillBlogImageVariants,
	parseBackfillCliArgs
} from '../../../../scripts/backfill-blog-image-variants';

const ADMIN_LOCALS = {
	user: {
		id: 'admin-test-1',
		email: 'admin@revolutiontradingpros.com',
		name: 'Admin User',
		role: 'admin'
	},
	session: { id: 'sess-1' }
};

function makeEvent(options: {
	url?: string;
	method?: string;
	request?: Request;
	params?: Record<string, string>;
	locals?: Record<string, unknown>;
}): Parameters<typeof uploadHandler>[0] {
	const urlObj = new URL(options.url ?? 'https://revolutiontradingpros.com/api/media/upload');
	const req =
		options.request ??
		new Request(urlObj.toString(), {
			method: options.method ?? 'GET'
		});
	return {
		url: urlObj,
		request: req,
		params: options.params ?? {},
		locals: (options.locals ?? ADMIN_LOCALS) as App.Locals,
		getClientAddress: () => '127.0.0.1'
	} as unknown as Parameters<typeof uploadHandler>[0];
}

describe('Media REST API & Backfill Pipeline', () => {
	beforeEach(async () => {
		const { db } = await createTestDatabase();
		setActiveDbForTest(db);
		await db.insert(user).values({
			id: 'admin-test-1',
			name: 'Admin User',
			email: 'admin@revolutiontradingpros.com',
			emailVerified: true,
			role: 'admin'
		});
	});

	it('rejects non-multipart requests with 415 and oversized Content-Length or streamed bodies with 413', async () => {
		// 1. 415 Unsupported Media Type
		const badTypeReq = new Request('https://revolutiontradingpros.com/api/media/upload', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ hello: 'world' })
		});
		const res415 = await uploadHandler(makeEvent({ request: badTypeReq }));
		expect(res415.status).toBe(415);

		// 2. 413 via Content-Length header > 4.4MB
		const overHeaderReq = new Request('https://revolutiontradingpros.com/api/media/upload', {
			method: 'POST',
			headers: {
				'content-type': 'multipart/form-data; boundary=---xyz',
				'content-length': String(5 * 1024 * 1024)
			},
			body: 'small'
		});
		const res413Header = await uploadHandler(makeEvent({ request: overHeaderReq }));
		expect(res413Header.status).toBe(413);

		// 3. 413 via streamed body > 4.4MB without Content-Length header
		const hugeChunk = new Uint8Array(Math.ceil(4.5 * 1024 * 1024));
		const stream = new ReadableStream<Uint8Array>({
			start(controller) {
				controller.enqueue(hugeChunk);
				controller.close();
			}
		});
		const streamedReq = new Request('https://revolutiontradingpros.com/api/media/upload', {
			method: 'POST',
			headers: {
				'content-type': 'multipart/form-data; boundary=---xyz'
			},
			body: stream,
			// @ts-expect-error Node fetch duplex option
			duplex: 'half'
		});
		const res413Stream = await uploadHandler(makeEvent({ request: streamedReq }));
		expect(res413Stream.status).toBe(413);
	});

	it('validates multipart fields, metadata 16KB cap, empty files, and magic-byte sniffing', async () => {
		const validPng = await sharp({
			create: { width: 100, height: 100, channels: 3, background: { r: 20, g: 40, b: 60 } }
		})
			.png()
			.toBuffer();

		// 1. Unknown form field -> 400
		const fdUnknown = new FormData();
		fdUnknown.set('file', new File([validPng], 'chart.png', { type: 'image/png' }));
		fdUnknown.set('evilField', 'unexpected');
		const resUnknown = await uploadHandler(
			makeEvent({
				request: new Request('https://revolutiontradingpros.com/api/media/upload', {
					method: 'POST',
					body: fdUnknown
				})
			})
		);
		expect(resUnknown.status).toBe(400);

		// 2. Metadata field > 16KB -> 413
		const fdBigMeta = new FormData();
		fdBigMeta.set('file', new File([validPng], 'chart.png', { type: 'image/png' }));
		fdBigMeta.set('description', 'x'.repeat(17 * 1024));
		const resBigMeta = await uploadHandler(
			makeEvent({
				request: new Request('https://revolutiontradingpros.com/api/media/upload', {
					method: 'POST',
					body: fdBigMeta
				})
			})
		);
		expect(resBigMeta.status).toBe(413);

		// 3. Empty file -> 400
		const fdEmpty = new FormData();
		fdEmpty.set('file', new File([new Uint8Array(0)], 'empty.png', { type: 'image/png' }));
		const resEmpty = await uploadHandler(
			makeEvent({
				request: new Request('https://revolutiontradingpros.com/api/media/upload', {
					method: 'POST',
					body: fdEmpty
				})
			})
		);
		expect(resEmpty.status).toBe(400);

		// 4. Spoofed MIME with invalid magic bytes -> 415
		const fdSpoof = new FormData();
		fdSpoof.set(
			'file',
			new File([Buffer.from('not-an-image-at-all')], 'fake.png', { type: 'image/png' })
		);
		const resSpoof = await uploadHandler(
			makeEvent({
				request: new Request('https://revolutiontradingpros.com/api/media/upload', {
					method: 'POST',
					body: fdSpoof
				})
			})
		);
		expect(resSpoof.status).toBe(415);

		// 5. Malicious SVG with script -> sanitized on upload
		const fdSvg = new FormData();
		fdSvg.set(
			'file',
			new File(
				[
					'<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80"/></svg>'
				],
				'diagram.svg',
				{ type: 'image/svg+xml' }
			)
		);
		const resSvg = await uploadHandler(
			makeEvent({
				request: new Request('https://revolutiontradingpros.com/api/media/upload', {
					method: 'POST',
					body: fdSvg
				})
			})
		);
		expect(resSvg.status).toBe(201);

		// 6. Multiple file fields -> 400
		const fdMultiFile = new FormData();
		fdMultiFile.append('file', new File([validPng], 'one.png', { type: 'image/png' }));
		fdMultiFile.append('file', new File([validPng], 'two.png', { type: 'image/png' }));
		const resMultiFile = await uploadHandler(
			makeEvent({
				request: new Request('https://revolutiontradingpros.com/api/media/upload', {
					method: 'POST',
					body: fdMultiFile
				})
			})
		);
		expect(resMultiFile.status).toBe(400);

		// 7. Duplicate metadata keys -> 400
		const fdDupMeta = new FormData();
		fdDupMeta.set('file', new File([validPng], 'one.png', { type: 'image/png' }));
		fdDupMeta.append('title', 'First');
		fdDupMeta.append('title', 'Second');
		const resDupMeta = await uploadHandler(
			makeEvent({
				request: new Request('https://revolutiontradingpros.com/api/media/upload', {
					method: 'POST',
					body: fdDupMeta
				})
			})
		);
		expect(resDupMeta.status).toBe(400);

		// 8. Cross-site Origin header -> 403 CSRF rejection
		const fdCsrf = new FormData();
		fdCsrf.set('file', new File([validPng], 'one.png', { type: 'image/png' }));
		const resCsrf = await uploadHandler(
			makeEvent({
				request: new Request('https://revolutiontradingpros.com/api/media/upload', {
					method: 'POST',
					headers: { origin: 'https://evil-attacker.example' },
					body: fdCsrf
				})
			})
		);
		expect(resCsrf.status).toBe(403);
	});

	it('uploads raster image, generates WebP variants, lists/filters media, updates metadata, and enforces 409 in-use delete protection', async () => {
		const pngBuffer = await sharp({
			create: { width: 900, height: 600, channels: 3, background: { r: 220, g: 255, b: 101 } }
		})
			.png()
			.toBuffer();

		const fd = new FormData();
		fd.set('file', new File([pngBuffer], 'spx-setup.png', { type: 'image/png' }));
		fd.set('folder', 'charts');
		fd.set('alt_text', 'SPX setup — daily chart');
		fd.set('caption', 'Key breakout – level');

		const uploadRes = await uploadHandler(
			makeEvent({
				request: new Request('https://revolutiontradingpros.com/api/media/upload', {
					method: 'POST',
					body: fd
				})
			})
		);
		expect(uploadRes.status).toBe(201);
		const uploaded = await uploadRes.json();
		expect(uploaded.mime_type).toBe('image/webp');
		expect(uploaded.alt_text).toBe('SPX setup, daily chart');
		expect(uploaded.caption).toBe('Key breakout, level');
		expect(uploaded.urls.original).toContain('.webp');
		expect(uploaded.urls.thumbnail).toContain('480w.webp');
		expect(uploaded.urls.medium).toContain('800w.webp');

		// List endpoint
		const listRes = await listHandler(
			makeEvent({
				url: 'https://revolutiontradingpros.com/api/media/list?folder=charts'
			})
		);
		expect(listRes.status).toBe(200);
		const listed = await listRes.json();
		expect(listed.total).toBe(1);
		expect(listed.items[0].id).toBe(uploaded.id);
		expect(listed.folders).toContain('charts');

		// Folders endpoint
		const folderCreateRes = await foldersPostHandler(
			makeEvent({
				url: 'https://revolutiontradingpros.com/api/media/folders',
				method: 'POST',
				request: new Request('https://revolutiontradingpros.com/api/media/folders', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ name: 'webinars' })
				})
			})
		);
		expect(folderCreateRes.status).toBe(201);

		const foldersGetRes = await foldersGetHandler(
			makeEvent({ url: 'https://revolutiontradingpros.com/api/media/folders' })
		);
		const foldersData = await foldersGetRes.json();
		expect(foldersData.folders).toEqual(expect.arrayContaining(['charts', 'webinars']));

		// Reference a variant URL (800w medium) in a post and verify both GET usage and 409 delete block
		const post = await createPost(
			{
				title: 'Post Referencing Uploaded Image',
				slug: 'post-referencing-uploaded-image',
				content: `<p><img src="${uploaded.urls.medium}" alt="SPX setup"></p>`,
				status: 'draft'
			},
			'admin-test-1'
		);

		const getRes = await itemGetHandler(
			makeEvent({
				url: `https://revolutiontradingpros.com/api/media/${uploaded.id}`,
				params: { id: uploaded.id }
			})
		);
		expect(getRes.status).toBe(200);
		const getBody = await getRes.json();
		expect(getBody.usage).toHaveLength(1);
		expect(getBody.usage[0].id).toBe(post.id);

		const del409 = await itemDeleteHandler(
			makeEvent({
				url: `https://revolutiontradingpros.com/api/media/${uploaded.id}`,
				method: 'DELETE',
				params: { id: uploaded.id }
			})
		);
		expect(del409.status).toBe(409);
		const del409Body = await del409.json();
		expect(del409Body.code).toBe('MEDIA_IN_USE');
		expect(del409Body.details).toHaveLength(1);

		// Patch metadata
		const patchRes = await itemPatchHandler(
			makeEvent({
				url: `https://revolutiontradingpros.com/api/media/${uploaded.id}`,
				method: 'PATCH',
				params: { id: uploaded.id },
				request: new Request(`https://revolutiontradingpros.com/api/media/${uploaded.id}`, {
					method: 'PATCH',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ alt_text: 'Updated alt — text' })
				})
			})
		);
		expect(patchRes.status).toBe(200);
		const patchedBody = await patchRes.json();
		expect(patchedBody.alt_text).toBe('Updated alt, text');

		// Remove post reference and delete media
		await permanentlyDeletePost(post.id, 'admin-test-1');
		const del204 = await itemDeleteHandler(
			makeEvent({
				url: `https://revolutiontradingpros.com/api/media/${uploaded.id}`,
				method: 'DELETE',
				params: { id: uploaded.id }
			})
		);
		expect(del204.status).toBe(204);
	});

	it('backfills missing variants idempotently with --dry-run, --limit, and --concurrency support', async () => {
		expect(parseBackfillCliArgs(['--dry-run', '--limit=5', '--concurrency=2'])).toEqual({
			dryRun: true,
			limit: 5,
			concurrency: 2
		});

		const db = (await createTestDatabase()).db;
		setActiveDbForTest(db);

		const sourceBuffer = await sharp({
			create: { width: 1400, height: 900, channels: 3, background: { r: 50, g: 120, b: 200 } }
		})
			.webp()
			.toBuffer();

		const [legacyRow] = await db
			.insert(media)
			.values({
				id: 'legacy-media-1',
				filename: 'legacy-chart.webp',
				slug: 'legacy-chart.webp',
				mimeType: 'image/webp',
				sizeBytes: sourceBuffer.byteLength,
				blobUrl: 'https://revolutiontradingpros.com/media/legacy-chart.webp',
				blobPathname: 'legacy-chart.webp',
				width: 1400,
				height: 900,
				variantsJson: null
			})
			.returning();

		// Dry run does not mutate DB
		const dryResult = await backfillBlogImageVariants({
			dryRun: true,
			fetchSourceBuffer: async () => sourceBuffer
		});
		expect(dryResult.scanned).toBe(1);
		expect(dryResult.updated).toBe(1);

		// Real run generates 480w, 800w, 1200w variants
		const realResult = await backfillBlogImageVariants({
			dryRun: false,
			concurrency: 2,
			fetchSourceBuffer: async () => sourceBuffer
		});
		expect(realResult.scanned).toBe(1);
		expect(realResult.updated).toBe(1);
		expect(realResult.failed).toBe(0);

		// Second run is idempotent (0 scanned because variantsJson is now populated)
		const secondRun = await backfillBlogImageVariants({
			dryRun: false,
			fetchSourceBuffer: async () => sourceBuffer
		});
		expect(secondRun.scanned).toBe(0);
		expect(secondRun.updated).toBe(0);
		expect(legacyRow.id).toBe('legacy-media-1');
	});
});
