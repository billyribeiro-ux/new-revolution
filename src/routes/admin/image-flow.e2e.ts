import {
	expect,
	test,
	type APIRequestContext,
	type BrowserContext,
	type Page
} from '@playwright/test';
import sharp from 'sharp';

/*
 * Owner-critical image flow, end to end through the real UI:
 * sign in, new post, featured image + inline image from the media library (upload a generated PNG),
 * publishing checklist (docs/ADMIN_LOCAL_LOGIN.md section 8), Save Draft, reload, Publish, then the public
 * /blog/<slug> (cover img, srcset, og:image, JSON-LD image crops, sitemap). Cleans up after itself.
 *
 * One login for the whole file (login is rate limited to 10 per email per 15 minutes).
 * Needs E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD and the e2e webServer env in playwright.config.ts
 * (ORIGIN = preview origin, MEDIA_STORAGE=disk).
 */

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;
const HAS_ADMIN_CREDENTIALS = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD);
const ADMIN_SKIP_REASON =
	'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run the admin image-flow e2e (seed: pnpm db:seed-admin, docs/ADMIN_LOCAL_LOGIN.md).';

const LABEL = 'E2E image flow';
const TITLE = `${LABEL} publishing check`;
const TAG = 'e2e image flow tag';
const COVER_ALT = 'Generated magenta test rectangle used as the featured image';
const INLINE_ALT = 'Generated magenta test rectangle used as the body image';
const PNG_W = 1600;
const PNG_H = 900;

async function loginAsAdmin(page: Page): Promise<void> {
	if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error(ADMIN_SKIP_REASON);
	await page.goto('/admin/login');
	await page.waitForLoadState('networkidle');
	await page.getByLabel('Email', { exact: true }).fill(ADMIN_EMAIL);
	await page.getByLabel('Password', { exact: true }).fill(ADMIN_PASSWORD);
	await page.getByRole('button', { name: 'Sign in' }).click();
	await page.waitForURL((url) => !url.pathname.startsWith('/admin/login'));
	await page.waitForLoadState('networkidle');
}

async function openSide(page: Page, id: string): Promise<void> {
	const toggle = page.locator(`button[aria-controls="sidebar-panel-${id}"]`);
	if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
}

async function openMain(page: Page, id: string): Promise<void> {
	const toggle = page.locator(`button[aria-controls="panel-${id}"]`);
	if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
}

/** A PNG with real detail (noise would bloat it; stripes + gradient keep it small and crop-able). */
async function makePng(): Promise<Buffer> {
	const raw = Buffer.alloc(PNG_W * PNG_H * 3);
	for (let y = 0; y < PNG_H; y++) {
		for (let x = 0; x < PNG_W; x++) {
			const o = (y * PNG_W + x) * 3;
			raw[o] = (x * 255) / PNG_W;
			raw[o + 1] = ((x >> 6) & 1) * 120 + 30;
			raw[o + 2] = (y * 255) / PNG_H;
		}
	}
	return sharp(raw, { raw: { width: PNG_W, height: PNG_H, channels: 3 } })
		.png()
		.toBuffer();
}

function bodyHtml(): string {
	const para = (n: number) =>
		`<p>${LABEL} paragraph ${n}. Dealer gamma exposure shapes intraday support and resistance on index futures, and traders who track it plan entries around risk defined levels. Position sizing discipline keeps losses small while winners run, and journaling each session builds a measurable edge over hundreds of samples that can be reviewed later.</p>`;
	return (
		'<h2>Gamma walls explained</h2>' +
		Array.from({ length: 9 }, (_, i) => para(i + 1)).join('') +
		'<p>See <a href="https://www.cboe.com/" target="_blank" rel="noopener noreferrer">Cboe</a> and <a href="https://www.sec.gov/" target="_blank" rel="noopener noreferrer">the SEC</a> for market structure data.</p>' +
		Array.from({ length: 3 }, (_, i) => para(i + 10)).join('')
	);
}

async function fetchImage(
	request: APIRequestContext,
	url: string
): Promise<{ type: string; pixels: number; width: number; height: number }> {
	const res = await request.get(url);
	expect(res.status(), `GET ${url}`).toBe(200);
	const type = res.headers()['content-type'] ?? '';
	const meta = await sharp(await res.body()).metadata();
	return {
		type,
		width: meta.width ?? 0,
		height: meta.height ?? 0,
		pixels: (meta.width ?? 0) * (meta.height ?? 0)
	};
}

test.describe.serial('Admin image flow: upload, feature, insert, publish, public page', () => {
	test.skip(!HAS_ADMIN_CREDENTIALS, ADMIN_SKIP_REASON);
	test.setTimeout(240_000);

	let context: BrowserContext;
	let page: Page;
	let mediaId: string | null = null;
	let postId: string | null = null;
	let slug = '';
	let coverUrl = '';

	test.beforeAll(async ({ browser }) => {
		context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
		page = await context.newPage();
		page.setDefaultTimeout(20_000);
		await loginAsAdmin(page);
	});

	test.afterAll(async ({ baseURL }) => {
		// Leave no data: permanently delete the post (UI), the tag (UI), then the media row and files (API).
		const confirm = (name: string) =>
			page.getByRole('dialog').last().getByRole('button', { name, exact: true });
		const view = async (label: string) => {
			await page.locator('.admin-view-tabs button', { hasText: label }).first().click();
		};
		try {
			if (postId) {
				await page.goto(`/admin/posts/${postId}`);
				await page.waitForLoadState('networkidle');
				await page.getByRole('button', { name: 'Move to Trash', exact: true }).first().click();
				await confirm('Move to Trash').click();
				await page.waitForURL((u) => u.pathname === '/admin/posts');
				await page.waitForLoadState('networkidle');
				await view('Trash');
				const row = page.locator('tr', { hasText: TITLE }).first();
				await row.getByRole('button', { name: 'Delete Permanently', exact: true }).click();
				await confirm('Delete Permanently').click();
				await expect(page.locator('tr', { hasText: TITLE })).toHaveCount(0);
			}
			await page.goto('/admin/posts');
			await page.waitForLoadState('networkidle');
			await view('Tags');
			const tagRow = page.locator('.entity-row', { hasText: TAG }).first();
			await expect(tagRow).toBeVisible();
			await tagRow.getByRole('button', { name: 'Delete', exact: true }).click();
			await confirm('Delete Tag').click();
			await expect(page.locator('.entity-row', { hasText: TAG })).toHaveCount(0);
			if (mediaId) {
				const res = await context.request.delete(`/api/media/${mediaId}`, {
					headers: { Origin: new URL(baseURL ?? 'http://localhost:4173').origin }
				});
				expect(res.status(), 'DELETE /api/media/<id>').toBe(204);
			}
		} finally {
			await context.close();
		}
	});

	test('creates a post with featured and inline images, saves a draft, reloads, and publishes', async () => {
		await page.goto('/admin/posts/new');
		await page.waitForLoadState('networkidle');
		await page.locator('#post-title').fill(TITLE);

		// Author (existing), category (existing), new tag.
		await openSide(page, 'author');
		const authorSelect = page.locator('#sidebar-panel-author select');
		const authorValue = await authorSelect
			.locator('option:not([value=""])')
			.first()
			.getAttribute('value');
		expect(authorValue, 'at least one author exists').toBeTruthy();
		await authorSelect.selectOption(authorValue!);
		await openSide(page, 'categories');
		await page.locator('#sidebar-panel-categories input[type="checkbox"]').first().check();
		await openSide(page, 'tags');
		await page.getByLabel('New tag name').fill(TAG);
		await page.getByLabel('New tag name').press('Enter');
		await expect(page.locator('#sidebar-panel-tags')).toContainText(TAG);

		// Body (clear the placeholder first), then excerpt, SEO, FAQ.
		await page.locator('.tiptap').first().click();
		await page.keyboard.press('ControlOrMeta+A');
		await page.keyboard.press('Delete');
		await page.getByRole('button', { name: 'HTML Source' }).click();
		await page.getByLabel('HTML source').fill(bodyHtml());
		await page.getByRole('button', { name: 'Visual Mode' }).click();
		await expect(page.locator('.tiptap').first()).toContainText(`${LABEL} paragraph 12`);
		await page
			.locator('#post-excerpt')
			.fill(`${LABEL}: a generated post that checks images end to end.`);
		await openMain(page, 'seo');
		await page.locator('#post-meta-title').fill(`${LABEL} publishing check`);
		await page.locator('#post-meta-title').press('Tab');
		await page
			.locator('textarea[maxlength="155"]')
			.fill(
				`${LABEL}: a generated test post that proves the featured image, the inline image and the structured data work from upload to public page.`
			);
		await page.getByLabel('Focus Keyword').fill('e2e image flow');
		await openMain(page, 'faq');
		for (let i = 1; i <= 3; i++) {
			await page.getByRole('button', { name: '+ Add FAQ Item' }).click();
			await page
				.getByLabel(`FAQ question ${i}`)
				.fill(`${LABEL} question ${i}: what does this check?`);
			await page
				.getByLabel(`FAQ answer ${i}`)
				.fill(
					`${LABEL} answer ${i}: this check confirms the FAQ text is visible on the page and in the structured data.`
				);
		}

		// Featured image: upload a generated PNG in the media library, select it, set alt.
		await openSide(page, 'featuredImage');
		await page.getByRole('button', { name: 'Choose from Media Library' }).click();
		const library = page.locator('.media-library-root').first();
		await library.getByRole('tab', { name: 'Upload Files' }).click();
		const [upload] = await Promise.all([
			page.waitForResponse(
				(r) => r.url().includes('/api/media/upload') && r.request().method() === 'POST'
			),
			library.locator('input[type="file"]').setInputFiles({
				name: 'e2e-image-flow.png',
				mimeType: 'image/png',
				buffer: await makePng()
			})
		]);
		expect(upload.status()).toBe(201);
		const uploaded = (await upload.json()) as { id?: string; item?: { id?: string } };
		mediaId = uploaded.id ?? uploaded.item?.id ?? null;
		expect(mediaId, 'upload response carries the media id').toBeTruthy();
		await page.waitForLoadState('networkidle');
		await library.locator('button.media-card').first().click();
		await library.getByRole('button', { name: 'Insert Into Post' }).click();
		await expect(library).toHaveCount(0);
		const panel = page.getByTestId('featured-image-panel');
		coverUrl = await panel.getByLabel('Cover Image URL').inputValue();
		expect(coverUrl).toMatch(/\/media\//);
		await panel.getByLabel(/Alt Text/).fill(COVER_ALT);

		// Inline image through the toolbar Image button and the same library item.
		await page.locator('.tiptap p').first().click();
		await page.getByRole('button', { name: 'Image', exact: true }).click();
		const inlineLibrary = page.locator('.media-library-root').first();
		await inlineLibrary.locator('button.media-card').first().click();
		await inlineLibrary.getByRole('button', { name: 'Insert Into Post' }).click();
		await expect(inlineLibrary).toHaveCount(0);
		const editorImg = page.locator('.tiptap img').first();
		await expect(editorImg).toBeVisible();
		await page.getByRole('button', { name: /Add alt text: this image/ }).click();
		const menu = page.getByTestId('image-control-menu');
		await menu.getByLabel(/Alt text/).fill(INLINE_ALT);
		await menu.getByRole('button', { name: 'Save', exact: true }).click();
		await expect(editorImg).toHaveAttribute('alt', INLINE_ALT);

		// Save Draft: the editor moves to /admin/posts/<id>.
		await page.getByRole('button', { name: 'Save Draft', exact: true }).first().click();
		await page.waitForURL(/\/admin\/posts\/\d+$/);
		await page.waitForLoadState('networkidle');
		postId = new URL(page.url()).pathname.split('/').pop()!;

		// Reload: featured image + inline image persisted.
		await page.reload();
		await page.waitForLoadState('networkidle');
		const reloadedPanel = page.getByTestId('featured-image-panel');
		await expect(reloadedPanel.getByLabel('Cover Image URL')).toHaveValue(coverUrl);
		await expect(reloadedPanel.getByLabel(/Alt Text/)).toHaveValue(COVER_ALT);
		const reloadedImg = page.locator('.tiptap img').first();
		await expect(reloadedImg).toBeVisible();
		await expect(reloadedImg).toHaveAttribute('alt', INLINE_ALT);
		expect(
			await reloadedImg.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth)
		).toBeGreaterThan(0);

		// Publish (the SEO gate must pass).
		slug = await page.locator('#post-slug').inputValue();
		expect(slug).toBeTruthy();
		await page.getByRole('button', { name: 'Publish', exact: true }).first().click();
		const gate = page.locator('.editor-alert.is-gate');
		await expect
			.poll(
				async () =>
					(await gate.count())
						? 'blocked: ' + (await gate.innerText())
						: new URL(page.url()).pathname,
				{ timeout: 20_000 }
			)
			.not.toMatch(/^\/admin\/posts\/\d+$/);
		expect(await gate.count(), 'publish gate did not block').toBe(0);
		await page.waitForLoadState('networkidle');
		await expect(page.locator('tr', { hasText: TITLE }).first()).toContainText(/published/i);
	});

	test('public post serves the cover, srcset, og:image, 3 JSON-LD crops, body image and sitemap image', async () => {
		const request = context.request;
		const res = await page.goto(`/blog/${slug}`);
		expect(res?.status()).toBe(200);
		await page.waitForLoadState('networkidle');

		const cover = page.locator('.article-cover-img').first();
		const src = await cover.getAttribute('src');
		expect(src).toContain('/media/');
		expect(Number(await cover.getAttribute('width'))).toBeGreaterThan(0);
		expect(Number(await cover.getAttribute('height'))).toBeGreaterThan(0);
		expect((await cover.getAttribute('alt'))?.trim()).toBe(COVER_ALT);
		const srcset = await cover.getAttribute('srcset');
		expect(srcset, 'cover has a srcset').toBeTruthy();
		const entries = srcset!.split(',').map((s) => s.trim().split(/\s+/)[0]);
		expect(entries.length).toBeGreaterThanOrEqual(1);
		for (const url of entries) {
			const img = await fetchImage(request, url);
			expect(img.type, url).toContain('image/webp');
		}

		const og = await page.locator('meta[property="og:image"]').first().getAttribute('content');
		expect(og).toBe(coverUrl);

		const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
		const nodes = ld.flatMap((t) => {
			const data = JSON.parse(t) as { '@graph'?: Record<string, unknown>[] };
			return data['@graph'] ?? [data as Record<string, unknown>];
		});
		const posting = nodes.find((n) => n['@type'] === 'BlogPosting') as
			{ image?: { '@type': string; url: string; width?: number; height?: number }[] } | undefined;
		expect(posting, 'BlogPosting node').toBeTruthy();
		const images = posting!.image;
		expect(Array.isArray(images)).toBe(true);
		expect(images).toHaveLength(3);
		const ratios: number[] = [];
		for (const image of images!) {
			expect(image['@type']).toBe('ImageObject');
			const got = await fetchImage(request, image.url);
			expect(got.type, image.url).toContain('image/');
			expect(got.pixels, `${image.url} pixels`).toBeGreaterThanOrEqual(50_000);
			ratios.push(got.width / got.height);
		}
		const near = (a: number, b: number) => Math.abs(a - b) < 0.02;
		expect(ratios.some((r) => near(r, 16 / 9))).toBe(true);
		expect(ratios.some((r) => near(r, 4 / 3))).toBe(true);
		expect(ratios.some((r) => near(r, 1))).toBe(true);

		const bodyImg = page.locator('.prose-base img').first();
		await expect(bodyImg).toHaveAttribute('src', /\/media\//);
		await expect(bodyImg).toHaveAttribute('alt', INLINE_ALT);
		const bodySrc = (await bodyImg.getAttribute('src'))!;
		expect((await fetchImage(request, bodySrc)).pixels).toBeGreaterThan(0);

		const sitemap = await (await request.get('/sitemap.xml')).text();
		expect(sitemap).toContain(`<image:loc>${coverUrl}</image:loc>`);
		expect(sitemap).not.toContain('<image:title>');
	});
});
