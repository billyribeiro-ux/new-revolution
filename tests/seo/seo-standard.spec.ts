import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

interface InventoryEntry {
	app: string;
	route: string;
	url: string;
	indexable: boolean;
	template: string;
	paramSource: string;
}

const INVENTORY_PATH = resolve(process.cwd(), 'docs/seo/audit/02-inventory.json');
const INVENTORY: InventoryEntry[] = JSON.parse(readFileSync(INVENTORY_PATH, 'utf8'));
const ORIGIN = 'https://revolutiontradingpros.com';

const FORBIDDEN_SCHEMA_TYPES = new Set([
	'FAQPage',
	'HowTo',
	'Course',
	'CourseInstance',
	'SpeakableSpecification',
	'SpecialAnnouncement',
	'ClaimReview'
]);

function collectSchemaTypes(node: unknown, out: Set<string>): void {
	if (Array.isArray(node)) {
		for (const item of node) collectSchemaTypes(item, out);
	} else if (node && typeof node === 'object') {
		const rec = node as Record<string, unknown>;
		const t = rec['@type'];
		if (typeof t === 'string') out.add(t);
		else if (Array.isArray(t)) {
			for (const entry of t) if (typeof entry === 'string') out.add(entry);
		}
		for (const val of Object.values(rec)) collectSchemaTypes(val, out);
	}
}

test.describe('SEO_STANDARD.md Full-Inventory E2E Gate (TOOL-03)', () => {
	test('verifies robots.txt, sitemap.xml, rss.xml, and 404 error page contract', async ({
		page,
		request
	}) => {
		// 1. robots.txt (IDX-08, IDX-10, MON-03)
		const robotsRes = await request.get('/robots.txt');
		expect(robotsRes.status()).toBe(200);
		const robotsTxt = await robotsRes.text();
		expect(robotsTxt).toContain('User-agent: *');
		expect(robotsTxt).toContain('Allow: /');
		expect(robotsTxt).toContain('Disallow: /api/');
		expect(robotsTxt).toContain('User-agent: Google-Extended');
		expect(robotsTxt).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
		for (const noindexPrefix of ['/login', '/register', '/dashboard', '/admin', '/checkout']) {
			expect(robotsTxt).not.toContain(`Disallow: ${noindexPrefix}`);
		}

		// 2. sitemap.xml (MAP-01..06, I18N-03)
		const sitemapRes = await request.get('/sitemap.xml');
		expect(sitemapRes.status()).toBe(200);
		expect(sitemapRes.headers()['x-robots-tag']).toBe('noindex');
		const sitemapXml = await sitemapRes.text();
		expect(sitemapXml).not.toContain('hreflang=');

		const sitemapLocs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
		const indexableUrls = INVENTORY.filter((e) => e.indexable).map((e) =>
			e.url === '/' ? ORIGIN : `${ORIGIN}${e.url}`
		);
		expect(new Set(sitemapLocs)).toEqual(new Set(indexableUrls));

		// 3. rss.xml (MEDIA-06)
		const rssRes = await request.get('/rss.xml');
		expect(rssRes.status()).toBe(200);
		expect(rssRes.headers()['content-type']).toMatch(/application\/(rss\+)?xml/);

		// 4. 404 page (IDX-06)
		const res404 = await page.goto('/does-not-exist-__seo_probe__');
		expect(res404?.status()).toBe(404);
		await expect(page.locator('head meta[name="robots"]')).toHaveAttribute(
			'content',
			'noindex, nofollow'
		);
		await expect(page.locator('head link[rel="canonical"]')).toHaveCount(0);
	});

	test('crawls every indexable URL in 02-inventory.json and enforces metadata, canonical, JSON-LD, breadcrumb, image, and YMYL rules', async ({
		page
	}) => {
		test.setTimeout(120_000);
		const indexableEntries = INVENTORY.filter((e) => e.indexable);
		const seenTitles = new Map<string, string>();
		const seenDescriptions = new Map<string, string>();

		for (const entry of indexableEntries) {
			const res = await page.goto(entry.url);
			expect(res?.status(), `${entry.url} must return HTTP 200`).toBe(200);

			// HTML lang="en" and zero single-locale hreflang (I18N-02, I18N-03)
			await expect(page.locator('html')).toHaveAttribute('lang', 'en');
			await expect(page.locator('head link[rel="alternate"][hreflang]')).toHaveCount(0);

			// Single head tags (META-05)
			await expect(page.locator('head title')).toHaveCount(1);
			await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
			await expect(page.locator('head meta[name="robots"]')).toHaveCount(1);
			await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);

			const title = (await page.title()).trim();
			const description =
				(await page.locator('head meta[name="description"]').getAttribute('content'))?.trim() ?? '';
			const canonical = await page.locator('head link[rel="canonical"]').getAttribute('href');
			const robots = (await page.locator('head meta[name="robots"]').getAttribute('content')) ?? '';

			expect(title.length, `${entry.url} title length (${title.length})`).toBeGreaterThanOrEqual(
				15
			);
			expect(title.length, `${entry.url} title length (${title.length})`).toBeLessThanOrEqual(65);
			expect(
				description.length,
				`${entry.url} description length (${description.length})`
			).toBeGreaterThanOrEqual(70);
			expect(
				description.length,
				`${entry.url} description length (${description.length})`
			).toBeLessThanOrEqual(158);

			expect(seenTitles.has(title), `Duplicate title "${title}" on ${entry.url}`).toBe(false);
			seenTitles.set(title, entry.url);
			expect(
				seenDescriptions.has(description),
				`Duplicate description "${description}" on ${entry.url}`
			).toBe(false);
			seenDescriptions.set(description, entry.url);

			const expectedCanonical = entry.url === '/' ? ORIGIN : `${ORIGIN}${entry.url}`;
			expect(canonical, `${entry.url} canonical`).toBe(expectedCanonical);
			expect(robots, `${entry.url} robots`).not.toContain('noindex');

			// Single H1 (SEM-02)
			await expect(page.locator('h1')).toHaveCount(1);

			// JSON-LD validation (SD-01..SD-15)
			const jsonLdTexts = await page
				.locator('script[type="application/ld+json"]')
				.allTextContents();
			expect(jsonLdTexts.length, `${entry.url} must emit JSON-LD`).toBeGreaterThanOrEqual(1);

			const types = new Set<string>();
			let breadcrumbJsonNames: string[] = [];
			for (const raw of jsonLdTexts) {
				const parsed = JSON.parse(raw) as Record<string, unknown>;
				collectSchemaTypes(parsed, types);
				const graph = (parsed['@graph'] as Array<Record<string, unknown>>) ?? [parsed];
				for (const node of graph) {
					if (node['@type'] === 'BreadcrumbList' && Array.isArray(node.itemListElement)) {
						breadcrumbJsonNames = (node.itemListElement as Array<{ name?: string }>).map((i) =>
							(i.name ?? '').trim()
						);
					}
				}
			}

			for (const forbidden of FORBIDDEN_SCHEMA_TYPES) {
				expect(types.has(forbidden), `${entry.url} must not emit ${forbidden} in JSON-LD`).toBe(
					false
				);
			}

			// Breadcrumb parity (SD-05)
			if (entry.url !== '/' && breadcrumbJsonNames.length > 0) {
				const visibleCrumbs = (
					await page
						.locator('nav[aria-label="Breadcrumb"] li:not([aria-hidden="true"])')
						.allTextContents()
				).map((t) => t.trim());
				expect(visibleCrumbs, `${entry.url} visible breadcrumb parity`).toEqual(
					breadcrumbJsonNames
				);
			}

			// Images must have alt and dimensions (MEDIA-01, MEDIA-02)
			const missingImgAttrs = await page
				.locator('img')
				.evaluateAll((imgs) =>
					imgs
						.filter(
							(img) =>
								img.getAttribute('alt') === null ||
								!img.getAttribute('width') ||
								!img.getAttribute('height')
						)
						.map((img) => img.outerHTML)
				);
			expect(missingImgAttrs, `${entry.url} images missing alt/width/height`).toEqual([]);

			// Footer YMYL trust links and risk box (YMYL-02, YMYL-07)
			const legalHrefs = await page
				.locator('nav[aria-labelledby="footer-legal"] a')
				.evaluateAll((els) => els.map((el) => el.getAttribute('href')));
			expect(legalHrefs, `${entry.url} footer legal links`).toEqual([
				'/contact',
				'/editorial-policy',
				'/privacy-policy',
				'/terms-of-service',
				'/refund-policy'
			]);
		}
	});

	test('enforces noindex and no canonical on non-indexable routes in 02-inventory.json (IDX-08)', async ({
		page
	}) => {
		for (const nonIndexUrl of [
			'/demo/playwright',
			'/blog/private-desk-quarterly-gamma-levels-briefing',
			'/blog/tag/spx-options',
			'/store/courses/move-prior-to-the-move-masterclass',
			'/store/indicators/move-prior-to-the-move-pro',
			'/store/scanners/move-prior-to-the-move-radar',
			'/admin/login'
		]) {
			const res = await page.goto(nonIndexUrl);
			expect(res?.status(), `${nonIndexUrl} status`).toBe(200);
			const robots = (await page.locator('head meta[name="robots"]').getAttribute('content')) ?? '';
			expect(robots, `${nonIndexUrl} must be noindex`).toContain('noindex');
			await expect(
				page.locator('head link[rel="canonical"]'),
				`${nonIndexUrl} must not emit rel="canonical"`
			).toHaveCount(0);
		}
	});
});
