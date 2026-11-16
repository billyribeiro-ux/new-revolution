import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import { resolveRobotsAndSecurityHeaders } from '../../hooks.server.ts';
import { _buildLlmsTxt } from '../../routes/llms.txt/+server.ts';
import { _buildRobotsTxt } from '../../routes/robots.txt/+server.ts';
import { load as homeLoad } from '../../routes/+page.ts';
import { load as aboutLoad } from '../../routes/about/+page.ts';
import { load as alertHubLoad } from '../../routes/alert-services/+page.ts';
import { load as spxLoad } from '../../routes/alert-services/spx-profit-pulse/+page.ts';
import { load as sundayLoad } from '../../routes/alert-services/sunday-alpha-protocol/+page.ts';
import { load as contactLoad } from '../../routes/contact/+page.ts';
import { load as editorialLoad } from '../../routes/editorial-policy/+page.ts';
import { load as roomsHubLoad } from '../../routes/live-trading-rooms/+page.ts';
import { load as dayRoomLoad } from '../../routes/live-trading-rooms/day-trading-room/+page.ts';
import { load as smallRoomLoad } from '../../routes/live-trading-rooms/small-accounts-room/+page.ts';
import { load as swingRoomLoad } from '../../routes/live-trading-rooms/swing-trading-room/+page.ts';
import { load as mentorshipLoad } from '../../routes/mentorship/+page.ts';
import { load as methodologyLoad } from '../../routes/methodology/+page.ts';
import { load as missionLoad } from '../../routes/our-mission/+page.ts';
import { load as privacyLoad } from '../../routes/privacy-policy/+page.ts';
import { load as refundLoad } from '../../routes/refund-policy/+page.ts';
import { load as resourcesHubLoad } from '../../routes/resources/+page.ts';
import { load as bestRoomsLoad } from '../../routes/resources/best-live-options-and-day-trading-rooms/+page.ts';
import { load as bestAlertsLoad } from '../../routes/resources/best-spx-0dte-and-options-alert-services/+page.ts';
import { load as etfListLoad } from '../../routes/resources/etf-stocks-list/+page.ts';
import { load as finraGuideLoad } from '../../routes/resources/finra-intraday-margin-rule-2026/+page.ts';
import { load as marginCalcLoad } from '../../routes/resources/intraday-margin-calculator/+page.ts';
import { load as optionsCalcLoad } from '../../routes/resources/options-calculator/+page.ts';
import { load as stockIndexesLoad } from '../../routes/resources/stock-indexes-list/+page.ts';
import { load as riskDisclosureLoad } from '../../routes/risk-disclosure/+page.ts';
import { load as termsLoad } from '../../routes/terms-of-service/+page.ts';
import { load as trackRecordLoad } from '../../routes/track-record/+page.ts';
import { computeRenderedTitle } from '#lib/shared/seo/meta-budget.ts';

function walkRuntimeSource(dir: string, out: string[] = []): string[] {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) {
			walkRuntimeSource(full, out);
		} else if (
			/\.(?:ts|svelte|js|mjs)$/.test(entry.name) &&
			!entry.name.endsWith('.spec.ts') &&
			!entry.name.endsWith('.e2e.ts')
		) {
			out.push(full);
		}
	}
	return out;
}

const INDEXABLE_ROUTE_LOADERS = [
	['/', homeLoad],
	['/methodology', methodologyLoad],
	['/live-trading-rooms', roomsHubLoad],
	['/live-trading-rooms/day-trading-room', dayRoomLoad],
	['/live-trading-rooms/swing-trading-room', swingRoomLoad],
	['/live-trading-rooms/small-accounts-room', smallRoomLoad],
	['/alert-services', alertHubLoad],
	['/alert-services/spx-profit-pulse', spxLoad],
	['/alert-services/sunday-alpha-protocol', sundayLoad],
	['/mentorship', mentorshipLoad],
	['/track-record', trackRecordLoad],
	['/about', aboutLoad],
	['/our-mission', missionLoad],
	['/resources', resourcesHubLoad],
	['/resources/options-calculator', optionsCalcLoad],
	['/resources/intraday-margin-calculator', marginCalcLoad],
	['/resources/etf-stocks-list', etfListLoad],
	['/resources/stock-indexes-list', stockIndexesLoad],
	['/resources/finra-intraday-margin-rule-2026', finraGuideLoad],
	['/resources/best-live-options-and-day-trading-rooms', bestRoomsLoad],
	['/resources/best-spx-0dte-and-options-alert-services', bestAlertsLoad],
	['/risk-disclosure', riskDisclosureLoad],
	['/editorial-policy', editorialLoad],
	['/terms-of-service', termsLoad],
	['/privacy-policy', privacyLoad],
	['/refund-policy', refundLoad],
	['/contact', contactLoad]
] as const;

describe('Phase 4 Automated SEO, Brand SSOT & YMYL Certification Gate', () => {
	it('enforces 0 forbidden strings, 0 Cloudflare imports, and 0 navigable # fragments across src/', () => {
		const runtimeFiles = walkRuntimeSource(join(process.cwd(), 'src'));
		const brandFilesAllowlist = new Set([join(process.cwd(), 'src/lib/config/brand.ts')]);
		const forbiddenRepaintTerm = new RegExp('non-' + 'repainting', 'i');

		const violations: string[] = [];

		for (const file of runtimeFiles) {
			const content = readFileSync(file, 'utf8');

			if (!brandFilesAllowlist.has(file)) {
				if (
					/Revolution\s+Trading\s+Pros|revolutiontradingpros\.com|We Are the Revolution|EDUCATE • INNOVATE/is.test(
						content
					)
				) {
					violations.push(`Hardcoded legacy brand/domain/slogan in ${file}`);
				}
			}

			if (
				/Concept preview|Concept only|purchases unavailable|developed with AI|Proposed Tools|Explore Membership Concepts|Marketing statements are not a substitute/i.test(
					content
				)
			) {
				violations.push(`Stale concept/AI disclaimer in ${file}`);
			}

			if (/prop-desk|proprietary trader|prop trading|proprietary desk/i.test(content)) {
				violations.push(`Prohibited prop-desk lineage term in ${file}`);
			}

			if (forbiddenRepaintTerm.test(content)) {
				violations.push(`Prohibited repainting-indicator buzzword in ${file}`);
			}

			if (
				file.includes('/src/routes/') &&
				!file.includes('/src/routes/store/') &&
				/\/store\/indicators/i.test(content)
			) {
				violations.push(`Unlaunched /store/indicators link leak in public route ${file}`);
			}

			if (/\b(?:predict|predicts|guaranteed|certainty|risk-free|easy money)\b/i.test(content)) {
				violations.push(`Prohibited FTC/YMYL promotional word in ${file}`);
			}

			if (/@sveltejs\/adapter-cloudflare|wrangler/i.test(content)) {
				violations.push(`Prohibited Cloudflare dependency in ${file}`);
			}

			for (const match of content.matchAll(/<a\b[^>]*\bhref=["'](#[^"']*)["'][^>]*>/gi)) {
				const tag = match[0];
				if (!/\bclass=["'][^"']*\b(?:skip|admin-skip-link)\b/.test(tag)) {
					violations.push(`Navigable # fragment link (${match[1]}) in ${file}`);
				}
			}
		}

		expect(violations).toEqual([]);
	});

	it('certifies title (<= 60 chars with 16-char brand), description (135-160 chars), WebSite-on-/-only, BreadcrumbList, and GSSG Person lineage across all 27 prerendered indexable routes', () => {
		const realistic16CharBrand = 'Placeholder Desk';

		for (const [pathname, loader] of INDEXABLE_ROUTE_LOADERS) {
			const result = loader({
				url: new URL(`https://www.revolutiontradingpros.com${pathname}`),
				data: { blogListing: { featuredPosts: [], posts: [] }, blogUnavailable: false }
			} as never) as {
				pageMetaTags: { title: string; description: string };
				jsonLdSchema: { '@graph': Array<Record<string, unknown>> };
			};

			const rawTitle = result.pageMetaTags.title;
			const rendered16 = computeRenderedTitle(rawTitle, realistic16CharBrand);
			expect(
				rendered16.length,
				`${pathname} rendered title "${rendered16.renderedTitle}" (${rendered16.length} chars)`
			).toBeLessThanOrEqual(60);

			const desc = result.pageMetaTags.description;
			expect(desc.length, `${pathname} description length (${desc.length})`).toBeGreaterThanOrEqual(
				135
			);
			expect(desc.length, `${pathname} description length (${desc.length})`).toBeLessThanOrEqual(
				160
			);

			const graph = result.jsonLdSchema['@graph'];
			expect(Array.isArray(graph), `${pathname} @graph array`).toBe(true);

			const hasWebSite = graph.some((n) => n['@type'] === 'WebSite');
			const hasBreadcrumb = graph.some((n) => n['@type'] === 'BreadcrumbList');
			const hasFaqPage = graph.some((n) => n['@type'] === 'FAQPage');
			const founder = graph.find((n) => n['@type'] === 'Person');

			if (pathname === '/') {
				expect(hasWebSite, '/ must emit WebSite').toBe(true);
				expect(hasBreadcrumb, '/ must omit BreadcrumbList').toBe(false);
			} else {
				expect(hasWebSite, `${pathname} must omit WebSite`).toBe(false);
				expect(hasBreadcrumb, `${pathname} must emit BreadcrumbList`).toBe(true);
			}

			expect(hasFaqPage, `${pathname} must omit retired FAQPage schema`).toBe(false);
			expect(founder, `${pathname} must include #founder Person node`).toBeDefined();
			expect(JSON.stringify(founder)).toContain('Goldman Sachs Global Special Situations Group');
			expect(JSON.stringify(founder)).toContain(
				'https://www.tradinggreats.com/traders/billy-ribeiro'
			);
		}
	});

	it('certifies Zero-Leak Staging Shield headers, dynamic /robots.txt, and dynamic /llms.txt', () => {
		const stagingHeaders = resolveRobotsAndSecurityHeaders({
			pathname: '/',
			hostname: 'localhost',
			status: 200,
			isProduction: false,
			existingRobotsTag: null
		});
		expect(stagingHeaders['X-Robots-Tag']).toBe('noindex, nofollow, noarchive, nosnippet');

		const prodHeaders = resolveRobotsAndSecurityHeaders({
			pathname: '/',
			hostname: 'www.revolutiontradingpros.com',
			status: 200,
			isProduction: true,
			existingRobotsTag: null
		});
		expect(prodHeaders['X-Robots-Tag']).toContain('index, follow');
		expect(prodHeaders['Strict-Transport-Security']).toContain('max-age=63072000');

		expect(_buildRobotsTxt({ isProduction: false, domain: 'https://placeholder.example' })).toBe(
			'User-agent: *\nDisallow: /\n'
		);
		const prodRobots = _buildRobotsTxt({
			isProduction: true,
			domain: 'https://placeholder.example',
			brandName: 'Placeholder Desk'
		});
		expect(prodRobots).toContain('# Placeholder Desk — Production robots.txt');
		expect(prodRobots).not.toContain('Revolution Trading Pros');
		expect(prodRobots).not.toContain('revolutiontradingpros.com');
		for (const bot of [
			'Googlebot',
			'Google-Extended',
			'OAI-SearchBot',
			'ChatGPT-User',
			'PerplexityBot',
			'Claude-SearchBot'
		]) {
			expect(prodRobots).toContain(`User-agent: ${bot}`);
		}
		expect(prodRobots).toContain('Sitemap: https://placeholder.example/sitemap.xml');

		const llms = _buildLlmsTxt({
			brandName: 'Placeholder Desk',
			domain: 'https://placeholder.example'
		});
		expect(llms).toContain('# Placeholder Desk');
		expect(llms).toContain('The Move Prior to The Move™');
		expect(llms).toContain('Goldman Sachs Global Special Situations Group');
		expect(llms).toContain('https://placeholder.example/resources/intraday-margin-calculator');
	});
});
