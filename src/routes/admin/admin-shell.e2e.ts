import { expect, test, type Page } from '@playwright/test';

/*
 * Admin shell coherence: every admin page names itself (tab title, history, route announcements),
 * stays private (noindex) without inheriting the marketing meta, the editor has a heading, and
 * checkboxes meet WCAG 2.2 SC 2.5.8 (24x24 CSS px).
 * Needs E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD and a seeded admin (docs/ADMIN_LOCAL_LOGIN.md).
 * One login for the file: login is rate limited to 10 per email per 15 minutes.
 */
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;
test.skip(
	!ADMIN_EMAIL || !ADMIN_PASSWORD,
	'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (seed: pnpm db:seed-admin, docs/ADMIN_LOCAL_LOGIN.md).'
);

async function loginAsAdmin(page: Page): Promise<void> {
	await page.goto('/admin/login');
	await page.waitForLoadState('networkidle');
	await page.getByLabel('Email', { exact: true }).fill(ADMIN_EMAIL ?? '');
	await page.getByLabel('Password', { exact: true }).fill(ADMIN_PASSWORD ?? '');
	await page.getByRole('button', { name: 'Sign in' }).click();
	await page.waitForURL((url) => !url.pathname.startsWith('/admin/login'));
	await page.waitForLoadState('networkidle');
}

const TITLES: [path: string, title: string][] = [
	['/admin', 'Dashboard | Admin | Revolution Trading Pros'],
	['/admin/posts', 'Posts | Admin | Revolution Trading Pros'],
	['/admin/posts/new', 'New post | Admin | Revolution Trading Pros'],
	['/admin/media', 'Media | Admin | Revolution Trading Pros'],
	['/admin/leads', 'Leads | Admin | Revolution Trading Pros'],
	['/admin/integrations', 'Integrations | Admin | Revolution Trading Pros']
];

test.describe('Admin shell', () => {
	test.describe.configure({ mode: 'serial' });
	let page: Page;

	test.beforeAll(async ({ browser }) => {
		page = await browser.newPage();
		await loginAsAdmin(page);
	});
	test.afterAll(async () => {
		await page.close();
	});

	for (const [path, title] of TITLES) {
		test(`${path} has its own title, a noindex robots meta and no marketing meta`, async () => {
			await page.goto(path);
			await page.waitForLoadState('networkidle');
			await expect(page).toHaveTitle(title);
			await expect(page.locator('meta[name="robots"]')).toHaveCount(1);
			await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
				'content',
				'noindex, nofollow'
			);
			await expect(page.locator('meta[name="description"]')).toHaveCount(0);
			await expect(page.locator('meta[property="og:title"]')).toHaveCount(0);
			await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
		});
	}

	test('an unknown admin URL is a real 404 with its own title and noindex', async () => {
		const response = await page.goto('/admin/does-not-exist');
		expect(response?.status()).toBe(404);
		await expect(page).toHaveTitle(/404/);
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
	});

	test('the blog editor has exactly one h1', async () => {
		await page.goto('/admin/posts/new');
		await page.waitForLoadState('networkidle');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Add New Post/);
	});

	test('admin checkboxes are at least 24x24 CSS px (WCAG 2.2 SC 2.5.8)', async () => {
		for (const path of ['/admin/posts', '/admin/posts/new', '/admin/media']) {
			await page.goto(path);
			await page.waitForLoadState('networkidle');
			const small = await page.evaluate(() =>
				[...document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')]
					.filter((el) => !el.closest('.ProseMirror'))
					.map((el) => el.getBoundingClientRect())
					.filter((r) => r.width > 0 && (r.width < 24 || r.height < 24))
					.map((r) => `${Math.round(r.width)}x${Math.round(r.height)}`)
			);
			expect(small, `${path} has undersized checkboxes`).toEqual([]);
		}
	});

	test('Lead Captures shows an empty state, never bars, when the period has no leads', async () => {
		await page.goto('/admin');
		await page.waitForLoadState('networkidle');
		const card = page.locator('.chart-card').filter({ hasText: 'Lead Captures' });
		const total = Number(
			((await card.locator('.chart-card__total').textContent()) ?? '')
				.match(/[\d,]+/)?.[0]
				?.replace(/,/g, '')
		);
		expect(Number.isFinite(total)).toBe(true);
		if (total === 0) {
			await expect(card.getByText('No leads captured in this period.')).toBeVisible();
			await expect(card.locator('svg.spark-bar')).toHaveCount(0);
		} else {
			await expect(card.locator('svg.spark-bar rect').first()).toBeVisible();
		}
	});
});
