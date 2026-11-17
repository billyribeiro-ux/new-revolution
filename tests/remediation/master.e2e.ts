import { expect, test } from '@playwright/test';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { auditAccessibility } from '../accessibility/axe';

const ORIGIN = 'https://www.revolutiontradingpros.com';
const ROOT = '.svelte-kit/output/prerendered/pages';
function htmlPaths(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		return entry.isDirectory() ? htmlPaths(path) : path.endsWith('.html') ? [path] : [];
	});
}

test('hero headings keep context outside the primary heading on every affected public route', async ({
	page
}) => {
	test.setTimeout(90_000);
	for (const path of [
		'/',
		'/about',
		'/alert-services',
		'/alert-services/spx-profit-pulse',
		'/alert-services/sunday-alpha-protocol',
		'/live-trading-rooms',
		'/live-trading-rooms/day-trading-room',
		'/live-trading-rooms/swing-trading-room',
		'/live-trading-rooms/small-accounts-room',
		'/mentorship',
		'/methodology',
		'/our-mission',
		'/resources/etf-stocks-list',
		'/resources/finra-intraday-margin-rule-2026',
		'/resources/intraday-margin-calculator',
		'/resources/options-calculator',
		'/resources/best-live-options-and-day-trading-rooms',
		'/resources/best-spx-0dte-and-options-alert-services',
		'/track-record'
	]) {
		expect((await page.goto(path))?.status(), path).toBe(200);
		await expect(page.locator('h1'), path).toHaveCount(1);
		await expect(page.locator('h1 .seo-kicker, h1 .h1-query, h1 button'), path).toHaveCount(0);
		await expect(page.locator('hgroup > h1'), path).toHaveCount(1);
	}
});

test('full rendered public crawl has clean availability copy, canonicals, links and entity graphs', async ({
	request
}, testInfo) => {
	test.setTimeout(180_000);
	const seeds = htmlPaths(ROOT).map((path) =>
		path
			.slice(ROOT.length)
			.replace(/\/index\.html$/, '/')
			.replace(/\.html$/, '')
	);
	const queue = [...new Set([...seeds, '/', '/blog', '/admin/login'])].map((path) => ({
		path,
		depth: 0
	}));
	const visited = new Set<string>();
	const failures: string[] = [];
	const samples: Array<{ path: string; status: number; canonical?: string }> = [];
	while (queue.length) {
		const item = queue.shift()!;
		if (visited.has(item.path)) continue;
		visited.add(item.path);
		const response = await request.get(item.path);
		if (response.status() >= 400) {
			failures.push(`${item.path}: HTTP ${response.status()}`);
			continue;
		}
		if (!response.headers()['content-type']?.includes('text/html')) continue;
		const html = await response.text();
		const canonical = /<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/.exec(html)?.[1];
		samples.push({ path: item.path, status: response.status(), canonical });
		if (!canonical?.startsWith(ORIGIN)) failures.push(`${item.path}: missing/foreign canonical`);
		for (const tag of html.matchAll(/<(title|h1)\b[^>]*>([\s\S]*?)<\/\1>/g))
			if (/TODO/.test(tag[2])) failures.push(`${item.path}: TODO in ${tag[1]}`);
		if (
			/Planned Build Scope|PAGE PENDING IMPLEMENTATION|Replaces temporary \/contact routing/.test(
				html.replace(/<script\b[\s\S]*?<\/script>/g, '')
			)
		)
			failures.push(`${item.path}: developer copy`);
		for (const match of html.matchAll(
			/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
		)) {
			const definitions = new Set<string>();
			const references: string[] = [];
			function inspect(value: unknown) {
				if (Array.isArray(value)) return value.forEach(inspect);
				if (!value || typeof value !== 'object') return;
				const node = value as Record<string, unknown>;
				if (typeof node['@id'] === 'string') {
					if (Object.keys(node).length > 1) {
						if (definitions.has(node['@id']))
							failures.push(`${item.path}: duplicate entity ${node['@id']}`);
						definitions.add(node['@id']);
					} else references.push(node['@id']);
				}
				if (node['@type'] === 'Product' && !node.offers)
					failures.push(`${item.path}: Product without offers`);
				Object.values(node).forEach(inspect);
			}
			inspect(JSON.parse(match[1]));
			for (const id of references)
				if (id.startsWith(ORIGIN) && !definitions.has(id))
					failures.push(`${item.path}: unresolved entity ${id}`);
		}
		if (item.depth < 3)
			for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
				const url = new URL(match[1].replaceAll('&amp;', '&'), response.url());
				if (url.origin !== new URL(response.url()).origin && url.origin !== ORIGIN) continue;
				if (url.pathname.startsWith('/admin/') && url.pathname !== '/admin/login') continue;
				queue.push({ path: url.pathname + url.search, depth: item.depth + 1 });
			}
	}
	const reportPath = testInfo.outputPath('rendered-crawl.json');
	mkdirSync(dirname(reportPath), { recursive: true });
	writeFileSync(reportPath, JSON.stringify({ samples, failures }, null, 2));
	await testInfo.attach('rendered-crawl', {
		body: JSON.stringify({ samples, failures }, null, 2),
		contentType: 'application/json'
	});
	expect(samples.length).toBeGreaterThanOrEqual(100);
	expect(failures).toEqual([]);
});

test('assets, security headers, critical fonts, and anonymous article caching satisfy the spec', async ({
	page,
	request
}) => {
	for (const path of ['/og-image.png', '/logo.png', '/icon-192.png', '/favicon-48x48.png'])
		expect((await request.get(path)).status(), path).toBe(200);
	const manifest = await request.get('/manifest.webmanifest');
	expect(manifest.status()).toBe(200);
	expect(await manifest.json()).toMatchObject({
		name: 'Revolution Trading Pros',
		short_name: 'RTP',
		display: 'standalone'
	});
	const security = await request.get('/.well-known/security.txt');
	expect(security.status()).toBe(200);
	expect(await security.text()).toContain('Expires: 2027-11-17T00:00:00.000Z');
	const response = await page.goto('/blog/institutional-order-flow-and-gamma-flip-playbook');
	expect(response?.status()).toBe(200);
	expect(response?.headers()['cache-control']).toContain('s-maxage=300');
	expect(response?.headers()['content-security-policy']).toContain("object-src 'none'");
	expect(response?.headers()['permissions-policy']).toBe(
		'camera=(), microphone=(), geolocation=(), payment=()'
	);
	await expect(page.locator('link[rel="preload"][as="font"]')).toHaveCount(2);
});

test('room tabs have clean headings and native keyboard selection', async ({ page }) => {
	await page.goto('/live-trading-rooms');
	const tabs = page.getByRole('tablist', { name: 'Compare live trading rooms' });
	await expect(tabs.getByRole('tab')).toHaveCount(3);
	await tabs.getByRole('tab').first().focus();
	await page.keyboard.press('End');
	await expect(tabs.getByRole('tab').last()).toBeFocused();
	await expect(tabs.getByRole('tab').last()).toHaveAttribute('aria-selected', 'true');
	await expect(page.getByRole('tabpanel').getByRole('heading', { level: 3 })).toHaveText(
		/Small Accounts/
	);
	await page.keyboard.press('Home');
	await expect(tabs.getByRole('tab').first()).toHaveAttribute('aria-selected', 'true');
	await expect(page.locator('h1 .seo-kicker, h3 button, h3 [aria-hidden="true"]')).toHaveCount(0);
});

test('membership and utility pages remain readable, honest, and accessible at narrow/wide sizes', async ({
	page
}, testInfo) => {
	test.setTimeout(120_000);
	for (const width of [320, 768, 1584]) {
		await page.setViewportSize({ width, height: 1000 });
		for (const path of [
			'/memberships',
			'/login',
			'/register',
			'/enroll/day-trading-room',
			'/mentorship/apply',
			'/resources'
		]) {
			await page.goto(path);
			await page.evaluate(() => document.fonts.ready);
			expect(
				await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
				path
			).toBe(true);
			const result = await auditAccessibility(page);
			await testInfo.attach(`${path.replaceAll('/', '_')}-${width}-axe`, {
				body: JSON.stringify(result),
				contentType: 'application/json'
			});
			expect(
				result.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'),
				path
			).toEqual([]);
		}
	}
	await page.goto('/memberships');
	await expect(page.locator('.membership-grid article')).toHaveCount(6);
	await expect(page.locator('form')).toHaveCount(0);
	await page.goto('/resources');
	await expect(page.locator('.resource-card__list [aria-disabled="true"]')).toHaveCount(18);
	await expect(page.locator('.resource-card__list [aria-disabled="true"] a')).toHaveCount(0);
});
