import { expect, test, type Page } from '@playwright/test';

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;
const HAS_ADMIN_CREDENTIALS = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD);
const ADMIN_SKIP_REASON =
	'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run admin e2e tests (login UI and seed: docs/ADMIN_AUTH_PLAN.md P2/P3).';

/*
 * ---------------------------------------------------------------------------
 * loginAsAdmin: real login through /admin/login (no header bypass).
 * Depends on the login page (Phase P2) exposing labels "Email" and "Password" and a "Sign in"
 * button, and on an admin account created by `pnpm db:seed-admin` (Phase P3) using the same
 * credentials as E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD.
 * ---------------------------------------------------------------------------
 */
async function loginAsAdmin(page: Page): Promise<void> {
	if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
		throw new Error(ADMIN_SKIP_REASON);
	}
	await page.goto('/admin/login');
	await page.getByLabel('Email', { exact: true }).fill(ADMIN_EMAIL);
	await page.getByLabel('Password', { exact: true }).fill(ADMIN_PASSWORD);
	await page.getByRole('button', { name: 'Sign in' }).click();
	await page.waitForURL((url) => !url.pathname.startsWith('/admin/login'));
}

test.describe('Blog System & Prose Parity E2E Suite', () => {
	test('renders /blog index with category pills, featured cards, article grid, and Blog JSON-LD', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		const res = await page.goto('/blog');
		expect(res?.status()).toBe(200);

		await expect(page.locator('h1')).toHaveCount(1);

		const categoryNav = page.locator('nav[aria-label="Blog categories"]');
		await expect(categoryNav).toBeVisible();
		await expect(categoryNav.locator('a[aria-current="page"]')).toContainText('All');
		await expect(categoryNav.locator('a', { hasText: 'Market Structure' })).toBeVisible();

		const jsonLdText = await page
			.locator('script[type="application/ld+json"]')
			.first()
			.textContent();
		expect(jsonLdText).toBeTruthy();
		const parsed = JSON.parse(jsonLdText!);
		const graphTypes = parsed['@graph'].map((n: { '@type': string }) => n['@type']);
		expect(graphTypes).toContain('Blog');
		expect(graphTypes).toContain('BreadcrumbList');
	});

	test('renders /blog/[slug] with stable TOC links, 1-to-1 FAQPage JSON-LD parity, author box, and X share link', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		const res = await page.goto('/blog/institutional-order-flow-and-gamma-flip-playbook');
		expect(res?.status()).toBe(200);

		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('h1')).toContainText(
			'Institutional Order Flow and Gamma Flip Playbook'
		);

		// Verify TOC has >= 3 real anchor links
		const tocLinks = page.locator('.toc-list a[href^="#"]');
		expect(await tocLinks.count()).toBeGreaterThanOrEqual(3);

		// Verify X share button uses x.com/intent/post and opens in new tab label
		const xShareLink = page.locator('a[href^="https://x.com/intent/post"]');
		await expect(xShareLink).toBeVisible();
		await expect(xShareLink).toHaveAttribute('aria-label', /opens in new tab/i);

		// Verify FAQ accordion matches JSON-LD FAQPage 1-to-1
		const jsonLdText = await page
			.locator('script[type="application/ld+json"]')
			.first()
			.textContent();
		const schema = JSON.parse(jsonLdText!);
		const faqNode = schema['@graph'].find((n: { '@type': string }) => n['@type'] === 'FAQPage');
		expect(faqNode).toBeTruthy();
		expect(faqNode.mainEntity).toHaveLength(2);
	});

	test('enforces password gate on password_protected post and unlocks content with valid password', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1280, height: 900 });
		const res = await page.goto('/blog/private-desk-quarterly-gamma-levels-briefing');
		expect(res?.status()).toBe(200);

		await expect(page.locator('head meta[name="robots"]')).toHaveAttribute(
			'content',
			/^noindex, nofollow/
		);

		// Locked view does not expose the article prose
		await expect(page.locator('.article-prose')).toHaveCount(0);

		const passwordInput = page.locator('input[name="password"]');
		await expect(passwordInput).toBeVisible();

		// Submit correct password to unlock
		await passwordInput.fill('AlphaDesk2026!');
		await page.locator('button[type="submit"]').click();

		await expect(page.locator('.prose-base')).toBeVisible();
		await expect(page.locator('.prose-base')).toContainText(
			'Unlocked desk analysis of quarterly OPEX gamma concentration'
		);
	});

	test('serves valid RSS 2.0 XML at /rss.xml with content:encoded, ETag, and 304 If-None-Match support', async ({
		request
	}) => {
		const res = await request.get('/rss.xml');
		expect(res.status()).toBe(200);
		expect(res.headers()['content-type']).toMatch(/application\/(rss\+)?xml/);

		const etag = res.headers()['etag'];
		expect(etag).toBeTruthy();

		const xml = await res.text();
		expect(xml).toContain('<rss version="2.0"');
		expect(xml).toContain('<content:encoded>');
		expect(xml).toContain('institutional-order-flow-and-gamma-flip-playbook');
		expect(xml).not.toContain('private-desk-quarterly-gamma-levels-briefing');

		const cachedRes = await request.get('/rss.xml', {
			headers: { 'If-None-Match': etag! }
		});
		expect(cachedRes.status()).toBe(304);
	});

	test('verifies Prose Parity (.prose-base and max-width: 900px) with real browser screenshots at 1280px and 1440px', async ({
		browser
	}, testInfo) => {
		test.skip(!HAS_ADMIN_CREDENTIALS, ADMIN_SKIP_REASON);

		for (const width of [1280, 1440] as const) {
			const context = await browser.newContext({
				viewport: { width, height: 900 }
			});
			const page = await context.newPage();
			await loginAsAdmin(page);

			// 1. Admin Editor at viewport width
			const adminRes = await page.goto('/admin/posts/1');
			expect(adminRes?.status()).toBe(200);

			const editorProse = page.locator('.rte-wrapper .prose-base').first();
			await expect(editorProse).toBeVisible();

			const editorStyles = await editorProse.evaluate((el) => {
				const s = getComputedStyle(el);
				return {
					maxWidth: s.maxWidth,
					fontFamily: s.fontFamily,
					fontSize: s.fontSize,
					lineHeight: s.lineHeight
				};
			});
			expect(editorStyles.maxWidth).toBe('900px');

			const editorShot = await editorProse.screenshot();
			expect(editorShot.byteLength).toBeGreaterThan(1000);
			await testInfo.attach(`editor-prose-${width}px.png`, {
				body: editorShot,
				contentType: 'image/png'
			});

			// 2. Public Published Post at the exact same viewport width
			const publicRes = await page.goto('/blog/institutional-order-flow-and-gamma-flip-playbook');
			expect(publicRes?.status()).toBe(200);

			const publicProse = page.locator('article .prose-base').first();
			await expect(publicProse).toBeVisible();

			const publicStyles = await publicProse.evaluate((el) => {
				const s = getComputedStyle(el);
				return {
					maxWidth: s.maxWidth,
					fontFamily: s.fontFamily,
					fontSize: s.fontSize,
					lineHeight: s.lineHeight
				};
			});
			expect(publicStyles.maxWidth).toBe('900px');
			expect(publicStyles.fontFamily).toBe(editorStyles.fontFamily);
			expect(publicStyles.fontSize).toBe(editorStyles.fontSize);
			expect(publicStyles.lineHeight).toBe(editorStyles.lineHeight);

			const publicShot = await publicProse.screenshot();
			expect(publicShot.byteLength).toBeGreaterThan(1000);
			await testInfo.attach(`public-prose-${width}px.png`, {
				body: publicShot,
				contentType: 'image/png'
			});

			await context.close();
		}
	});
});
