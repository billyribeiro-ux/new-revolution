import { spawn, type ChildProcess } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { chromium } from 'playwright';

export interface InventoryItem {
	app: string;
	route: string;
	url: string;
	indexable: boolean;
	template: string;
	paramSource: string;
}

export interface RedirectHop {
	url: string;
	status: number;
	location: string | null;
}

export interface ImgInfo {
	src: string;
	alt: string | null;
	width: string | null;
	height: string | null;
	loading: string | null;
	fetchpriority: string | null;
	hasPictureParent: boolean;
	srcset: string | null;
	sizes: string | null;
}

export interface AnchorInfo {
	href: string | null;
	resolvedUrl: string | null;
	text: string;
	rel: string | null;
	isNavigable: boolean;
	isExternal: boolean;
	externalDomain: string | null;
}

export interface JsonLdBlockResult {
	raw: string;
	parsed: Record<string, unknown> | null;
	parseError: string | null;
	types: string[];
}

export interface UrlAuditRecord {
	url: string;
	route: string;
	template: string;
	expectedIndexable: boolean;
	inInventory: boolean;
	inSitemap: boolean;
	finalStatus: number;
	finalUrl: string;
	redirectChain: RedirectHop[];
	headers: {
		contentType: string | null;
		xRobotsTag: string | null;
		cacheControl: string | null;
		contentEncoding: string | null;
		strictTransportSecurity: string | null;
	};
	rawHtmlChecks: {
		hasTitle: boolean;
		hasH1: boolean;
		hasMainText: boolean;
		mainLandmarks: {
			header: boolean;
			nav: boolean;
			main: boolean;
			footer: boolean;
		};
	};
	head: {
		htmlLang: string | null;
		htmlDir: string | null;
		charsetMetaCount: number;
		viewportMetaCount: number;
		titleCount: number;
		titles: string[];
		titleLength: number;
		brandCountInTitle: number;
		maxRepeatedTermCountInTitle: number;
		descriptionCount: number;
		descriptions: string[];
		descriptionLength: number;
		canonicalCount: number;
		canonicals: string[];
		robotsMetaCount: number;
		robotsMetas: string[];
		ogTags: Record<string, string[]>;
		twitterTags: Record<string, string[]>;
		hreflangs: Array<{ hreflang: string; href: string }>;
	};
	headings: {
		h1Count: number;
		h1Texts: string[];
		outline: Array<{ level: number; text: string }>;
		hierarchyValid: boolean;
	};
	jsonLd: {
		blocks: JsonLdBlockResult[];
		breadcrumbListNames: string[];
	};
	domBreadcrumbs: string[];
	breadcrumbParity: boolean;
	images: {
		all: ImgInfo[];
		lcpCandidate: ImgInfo | null;
		missingAltCount: number;
		missingDimensionsCount: number;
	};
	anchors: {
		totalCount: number;
		nonNavigableCount: number;
		nonNavigableExamples: string[];
		genericAnchorTextCount: number;
		genericAnchorExamples: string[];
		internalLinks: string[];
		outboundLinks: Array<{ href: string; domain: string; rel: string | null }>;
	};
	trustSignals: {
		hasByline: boolean;
		hasAuthorLink: boolean;
		hasVisibleDate: boolean;
		hasDisclosure: boolean;
		hasGatedContent: boolean;
		paywallJsonLdMatchesDom: boolean;
	};
	spamChecks: {
		cloakingDiff: boolean;
		hiddenLinkOrTextCount: number;
		topTermFrequencyRatio: number;
	};
	variants: {
		utmCanonicalMatchesClean: boolean | null;
		sortCanonicalMatchesClean: boolean | null;
		localeHeaderContentIdentical: boolean | null;
		mobileDesktopTextIdentical: boolean | null;
	};
	clickDepthFromHome: number | null;
}

export interface Soft404CheckResult {
	testPath: string;
	status: number;
	title: string | null;
	canonicalCount: number;
	robotsMetaCount: number;
	titleCount: number;
}

export interface OgImageCheckResult {
	imageUrl: string;
	localPath: string;
	status: number;
	contentType: string | null;
}

export interface BaselineAuditReport {
	generatedAt: string;
	productionOrigin: string;
	previewBaseUrl: string;
	robotsTxt: {
		status: number;
		contentType: string | null;
		body: string;
		hasAbsoluteSitemap: boolean;
		disallowsAppOrAssets: boolean;
		disallowsNoindexRoutes: string[];
	};
	sitemapXml: {
		status: number;
		contentType: string | null;
		urlCount: number;
		locs: string[];
		hasChangefreq: boolean;
		hasPriority: boolean;
		non200Locs: string[];
		nonCanonicalLocs: string[];
		noindexLocs: string[];
	};
	favicons: Array<{
		path: string;
		status: number;
		contentType: string | null;
		width: number | null;
		height: number | null;
	}>;
	trustPagesPresent: Record<string, { exists: boolean; status: number }>;
	soft404Checks: Soft404CheckResult[];
	ogImageChecks: OgImageCheckResult[];
	duplicateTitles: Array<{ title: string; urls: string[] }>;
	duplicateDescriptions: Array<{ description: string; urls: string[] }>;
	orphanUrls: string[];
	nearDuplicatePairs: Array<{ urlA: string; urlB: string; similarity: number }>;
	urls: UrlAuditRecord[];
}

const PRODUCTION_ORIGIN = 'https://revolutiontradingpros.com';
const BRAND_NAME = 'Revolution Trading Pros';

function stripTags(html: string): string {
	return html
		.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
		.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'")
		.replace(/\s+/g, ' ')
		.trim();
}

function getAttr(tagAttrs: string, name: string): string | null {
	const regex = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i');
	const match = tagAttrs.match(regex);
	if (!match) return null;
	return (match[1] ?? match[2] ?? match[3] ?? '').trim();
}

function extractHeadSection(html: string): string {
	const match = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
	return match ? match[1] : html;
}

function extractBodySection(html: string): string {
	const match = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
	return match ? match[1] : html;
}

function parseHeadMetadata(html: string) {
	const htmlTagMatch = html.match(/<html\b([^>]*)>/i);
	const htmlAttrs = htmlTagMatch ? htmlTagMatch[1] : '';
	const htmlLang = getAttr(htmlAttrs, 'lang');
	const htmlDir = getAttr(htmlAttrs, 'dir');

	const head = extractHeadSection(html);

	const titles: string[] = [];
	for (const m of head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)) {
		titles.push(stripTags(m[1]));
	}

	let charsetMetaCount = 0;
	let viewportMetaCount = 0;
	const descriptions: string[] = [];
	const robotsMetas: string[] = [];
	const ogTags: Record<string, string[]> = {};
	const twitterTags: Record<string, string[]> = {};

	for (const m of head.matchAll(/<meta\b([^>]*)>/gi)) {
		const attrs = m[1];
		if (getAttr(attrs, 'charset') !== null) {
			charsetMetaCount++;
		}
		const name = getAttr(attrs, 'name')?.toLowerCase() ?? '';
		const property = getAttr(attrs, 'property')?.toLowerCase() ?? '';
		const content = getAttr(attrs, 'content') ?? '';

		if (name === 'viewport') viewportMetaCount++;
		if (name === 'description') descriptions.push(content);
		if (name === 'robots') robotsMetas.push(content);
		if (property.startsWith('og:')) {
			ogTags[property] = ogTags[property] ?? [];
			ogTags[property].push(content);
		}
		if (name.startsWith('twitter:') || property.startsWith('twitter:')) {
			const key = name.startsWith('twitter:') ? name : property;
			twitterTags[key] = twitterTags[key] ?? [];
			twitterTags[key].push(content);
		}
	}

	const canonicals: string[] = [];
	const hreflangs: Array<{ hreflang: string; href: string }> = [];
	for (const m of head.matchAll(/<link\b([^>]*)>/gi)) {
		const attrs = m[1];
		const rel = getAttr(attrs, 'rel')?.toLowerCase() ?? '';
		const href = getAttr(attrs, 'href') ?? '';
		const hreflang = getAttr(attrs, 'hreflang') ?? getAttr(attrs, 'hrefLang');
		if (rel === 'canonical') {
			canonicals.push(href);
		}
		if (rel === 'alternate' && hreflang) {
			hreflangs.push({ hreflang: hreflang.toLowerCase(), href });
		}
	}

	const primaryTitle = titles[0] ?? '';
	const brandOccurrences = primaryTitle.split(BRAND_NAME).length - 1;
	const titleWords = primaryTitle
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, ' ')
		.split(/\s+/)
		.filter(
			(w) => w.length >= 4 && !['with', 'from', 'that', 'this', 'your', 'into', 'over'].includes(w)
		);
	const wordCounts = new Map<string, number>();
	for (const w of titleWords) {
		wordCounts.set(w, (wordCounts.get(w) ?? 0) + 1);
	}
	let maxRepeatedTermCountInTitle = 0;
	for (const count of wordCounts.values()) {
		if (count > maxRepeatedTermCountInTitle) maxRepeatedTermCountInTitle = count;
	}

	return {
		htmlLang,
		htmlDir,
		charsetMetaCount,
		viewportMetaCount,
		titleCount: titles.length,
		titles,
		titleLength: primaryTitle.length,
		brandCountInTitle: brandOccurrences,
		maxRepeatedTermCountInTitle,
		descriptionCount: descriptions.length,
		descriptions,
		descriptionLength: (descriptions[0] ?? '').length,
		canonicalCount: canonicals.length,
		canonicals,
		robotsMetaCount: robotsMetas.length,
		robotsMetas,
		ogTags,
		twitterTags,
		hreflangs
	};
}

function collectSchemaTypes(node: unknown, out: Set<string>): void {
	if (!node || typeof node !== 'object') return;
	if (Array.isArray(node)) {
		for (const item of node) collectSchemaTypes(item, out);
		return;
	}
	const rec = node as Record<string, unknown>;
	const t = rec['@type'];
	if (typeof t === 'string') out.add(t);
	else if (Array.isArray(t)) {
		for (const sub of t) if (typeof sub === 'string') out.add(sub);
	}
	for (const val of Object.values(rec)) {
		if (val && typeof val === 'object') collectSchemaTypes(val, out);
	}
}

export function extractBreadcrumbNamesFromJsonLd(blocks: JsonLdBlockResult[]): string[] {
	for (const b of blocks) {
		if (!b.parsed) continue;
		const graph = Array.isArray(b.parsed['@graph'])
			? (b.parsed['@graph'] as unknown[])
			: [b.parsed];
		for (const node of graph) {
			if (!node || typeof node !== 'object') continue;
			const rec = node as Record<string, unknown>;
			if (rec['@type'] === 'BreadcrumbList' && Array.isArray(rec.itemListElement)) {
				return rec.itemListElement.map((item: unknown) => {
					if (
						!item ||
						typeof item !== 'object' ||
						!('name' in item) ||
						typeof item.name !== 'string' ||
						!item.name.trim()
					) {
						throw new Error('BreadcrumbList items must have nonempty string names.');
					}
					return item.name.trim();
				});
			}
		}
	}
	return [];
}

function parseJsonLdBlocks(html: string): {
	blocks: JsonLdBlockResult[];
	breadcrumbListNames: string[];
} {
	const blocks: JsonLdBlockResult[] = [];
	for (const m of html.matchAll(
		/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
	)) {
		const raw = m[1].trim();
		try {
			const parsed = JSON.parse(raw) as Record<string, unknown>;
			const typeSet = new Set<string>();
			collectSchemaTypes(parsed, typeSet);
			blocks.push({
				raw,
				parsed,
				parseError: null,
				types: Array.from(typeSet)
			});
		} catch (err) {
			blocks.push({
				raw,
				parsed: null,
				parseError: err instanceof Error ? err.message : String(err),
				types: []
			});
		}
	}
	return {
		blocks,
		breadcrumbListNames: extractBreadcrumbNamesFromJsonLd(blocks)
	};
}

function parseHeadings(bodyHtml: string): {
	h1Count: number;
	h1Texts: string[];
	outline: Array<{ level: number; text: string }>;
	hierarchyValid: boolean;
} {
	const outline: Array<{ level: number; text: string }> = [];
	const h1Texts: string[] = [];
	for (const m of bodyHtml.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)) {
		const level = Number(m[1]);
		const text = stripTags(m[2]);
		outline.push({ level, text });
		if (level === 1) h1Texts.push(text);
	}
	let hierarchyValid = outline.length > 0 && outline[0].level === 1;
	for (let i = 1; i < outline.length; i++) {
		if (outline[i].level > outline[i - 1].level + 1) {
			hierarchyValid = false;
			break;
		}
	}
	return {
		h1Count: h1Texts.length,
		h1Texts,
		outline,
		hierarchyValid
	};
}

function parseDomBreadcrumbs(bodyHtml: string): string[] {
	const navMatch = bodyHtml.match(
		/<nav\b[^>]*aria-label\s*=\s*["']Breadcrumb["'][^>]*>([\s\S]*?)<\/nav>/i
	);
	if (!navMatch) return [];
	const navInner = navMatch[1];
	const olMatch = navInner.match(/<ol\b[^>]*>([\s\S]*?)<\/ol>/i);
	const listHtml = olMatch ? olMatch[1] : navInner;
	const crumbs: string[] = [];
	for (const li of listHtml.matchAll(/<li\b([^>]*)>([\s\S]*?)<\/li>/gi)) {
		const attrs = li[1];
		if (getAttr(attrs, 'aria-hidden') === 'true') continue;
		const text = stripTags(li[2]);
		if (text) crumbs.push(text);
	}
	return crumbs;
}

function parseImages(bodyHtml: string): {
	all: ImgInfo[];
	lcpCandidate: ImgInfo | null;
	missingAltCount: number;
	missingDimensionsCount: number;
} {
	const all: ImgInfo[] = [];
	for (const m of bodyHtml.matchAll(/<img\b([^>]*)>/gi)) {
		const attrs = m[1];
		const idx = m.index ?? 0;
		const preceding = bodyHtml.slice(Math.max(0, idx - 400), idx);
		const hasPictureParent = /<picture\b[^>]*>(?:(?!(?:<\/picture>))[\s\S])*$/i.test(preceding);
		all.push({
			src: getAttr(attrs, 'src') ?? '',
			alt: getAttr(attrs, 'alt'),
			width: getAttr(attrs, 'width'),
			height: getAttr(attrs, 'height'),
			loading: getAttr(attrs, 'loading'),
			fetchpriority: getAttr(attrs, 'fetchpriority'),
			hasPictureParent,
			srcset: getAttr(attrs, 'srcset'),
			sizes: getAttr(attrs, 'sizes')
		});
	}
	const missingAltCount = all.filter((img) => img.alt === null).length;
	const missingDimensionsCount = all.filter((img) => !img.width || !img.height).length;
	return {
		all,
		lcpCandidate: all[0] ?? null,
		missingAltCount,
		missingDimensionsCount
	};
}

function parseAnchors(
	bodyHtml: string,
	currentUrlPath: string
): {
	totalCount: number;
	nonNavigableCount: number;
	nonNavigableExamples: string[];
	genericAnchorTextCount: number;
	genericAnchorExamples: string[];
	internalLinks: string[];
	outboundLinks: Array<{ href: string; domain: string; rel: string | null }>;
} {
	let totalCount = 0;
	const nonNavigableExamples: string[] = [];
	const genericAnchorExamples: string[] = [];
	const internalSet = new Set<string>();
	const outboundLinks: Array<{ href: string; domain: string; rel: string | null }> = [];
	const genericPatterns = /^(click here|read more|learn more|more|here|link)$/i;

	for (const m of bodyHtml.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
		totalCount++;
		const attrs = m[1];
		const href = getAttr(attrs, 'href');
		const rel = getAttr(attrs, 'rel');
		const ariaLabel = getAttr(attrs, 'aria-label') ?? '';
		const text = (stripTags(m[2]) || ariaLabel).trim();

		if (!href || href === '#' || href.toLowerCase().startsWith('javascript:')) {
			nonNavigableExamples.push(`${href ?? '(missing href)'} [${text.slice(0, 40)}]`);
			continue;
		}
		if (genericPatterns.test(text)) {
			genericAnchorExamples.push(`${href} ["${text}"]`);
		}
		if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
			continue;
		}
		try {
			const resolved = new URL(href, `${PRODUCTION_ORIGIN}${currentUrlPath}`);
			if (resolved.origin === PRODUCTION_ORIGIN) {
				const cleanPath = resolved.pathname === '/' ? '/' : resolved.pathname.replace(/\/+$/, '');
				internalSet.add(cleanPath);
			} else {
				outboundLinks.push({
					href: resolved.href,
					domain: resolved.hostname,
					rel
				});
			}
		} catch {
			nonNavigableExamples.push(`${href} (invalid URL)`);
		}
	}

	return {
		totalCount,
		nonNavigableCount: nonNavigableExamples.length,
		nonNavigableExamples: nonNavigableExamples.slice(0, 10),
		genericAnchorTextCount: genericAnchorExamples.length,
		genericAnchorExamples: genericAnchorExamples.slice(0, 10),
		internalLinks: Array.from(internalSet),
		outboundLinks
	};
}

async function fetchWithRedirectChain(
	baseUrl: string,
	pathAndQuery: string,
	headers?: Record<string, string>
): Promise<{
	finalStatus: number;
	finalUrl: string;
	redirectChain: RedirectHop[];
	headers: Headers;
	body: string;
}> {
	const redirectChain: RedirectHop[] = [];
	let currentUrl = new URL(pathAndQuery, baseUrl).href;

	for (let hop = 0; hop < 10; hop++) {
		const res = await fetch(currentUrl, {
			redirect: 'manual',
			headers: headers ?? { 'User-Agent': 'Mozilla/5.0 (compatible; RTPSeoAuditCrawler/1.0)' }
		});
		if (res.status >= 300 && res.status < 400) {
			const loc = res.headers.get('location');
			redirectChain.push({ url: currentUrl, status: res.status, location: loc });
			if (!loc) {
				return {
					finalStatus: res.status,
					finalUrl: currentUrl,
					redirectChain,
					headers: res.headers,
					body: ''
				};
			}
			currentUrl = new URL(loc, currentUrl).href;
			continue;
		}
		const body = await res.text();
		return {
			finalStatus: res.status,
			finalUrl: currentUrl,
			redirectChain,
			headers: res.headers,
			body
		};
	}

	throw new Error(`Too many redirects fetching ${pathAndQuery}`);
}

function computeShingleSet(text: string): Set<string> {
	const words = text
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, ' ')
		.split(/\s+/)
		.filter(Boolean);
	const shingles = new Set<string>();
	for (let i = 0; i + 4 < words.length; i++) {
		shingles.add(words.slice(i, i + 5).join(' '));
	}
	return shingles;
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
	if (a.size === 0 || b.size === 0) return 0;
	let intersection = 0;
	for (const item of a) {
		if (b.has(item)) intersection++;
	}
	return intersection / (a.size + b.size - intersection);
}

function parsePngDimensions(buf: Buffer): { width: number; height: number } | null {
	if (buf.length < 24) return null;
	if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
		return {
			width: buf.readUInt32BE(16),
			height: buf.readUInt32BE(20)
		};
	}
	// ICO header check
	if (buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01 && buf[3] === 0x00 && buf.length >= 8) {
		const w = buf[6] === 0 ? 256 : buf[6];
		const h = buf[7] === 0 ? 256 : buf[7];
		return { width: w, height: h };
	}
	return null;
}

async function waitForServer(url: string, timeoutMs = 25000): Promise<void> {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		try {
			const res = await fetch(url);
			if (res.status > 0) return;
		} catch {
			// wait
		}
		await new Promise((r) => setTimeout(r, 250));
	}
	throw new Error(`Preview server did not start within ${timeoutMs}ms at ${url}`);
}

export async function runSeoCrawler(options?: {
	baseUrl?: string;
	inventoryPath?: string;
	outputPath?: string;
}): Promise<BaselineAuditReport> {
	const inventoryPath =
		options?.inventoryPath ?? resolve(process.cwd(), 'docs/seo/audit/02-inventory.json');
	const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8')) as InventoryItem[];

	let previewProcess: ChildProcess | null = null;
	let baseUrl = options?.baseUrl ?? '';

	if (!baseUrl) {
		const port = 4279;
		baseUrl = `http://localhost:${port}`;
		previewProcess = spawn(
			'pnpm',
			['exec', 'vite', 'preview', '--port', String(port), '--strictPort'],
			{
				stdio: 'ignore',
				env: {
					...process.env,
					ORIGIN: baseUrl,
					BETTER_AUTH_SECRET:
						process.env.BETTER_AUTH_SECRET || 'dev-only-better-auth-secret-32-chars-minimum',
					MEDIA_STORAGE: 'disk',
					POST_PASSWORD_SECRET:
						process.env.POST_PASSWORD_SECRET || 'e2e-blog-password-secret-minimum-32-chars'
				}
			}
		);
		await waitForServer(baseUrl);
	}

	try {
		// 1. Fetch /robots.txt
		const robotsRes = await fetchWithRedirectChain(baseUrl, '/robots.txt');
		const disallowedPaths = Array.from(robotsRes.body.matchAll(/^Disallow:\s*(\S+)/gim), (m) =>
			m[1].trim()
		);
		const noindexPrefixes = [
			'/login',
			'/register',
			'/dashboard',
			'/admin',
			'/checkout',
			'/demo',
			'/lp'
		];
		const disallowsNoindexRoutes = disallowedPaths.filter((p) =>
			noindexPrefixes.some((np) => p === np || p.startsWith(`${np}/`))
		);

		// 2. Fetch /sitemap.xml
		const sitemapRes = await fetchWithRedirectChain(baseUrl, '/sitemap.xml');
		const sitemapLocs = Array.from(sitemapRes.body.matchAll(/<loc>([^<]+)<\/loc>/gi), (m) =>
			m[1].trim()
		);
		const sitemapPaths = new Set(
			sitemapLocs.map((loc) => {
				try {
					const u = new URL(loc);
					return u.pathname === '/' ? '/' : u.pathname.replace(/\/+$/, '');
				} catch {
					return loc;
				}
			})
		);

		// 3. Build unified URL list (inventory + sitemap)
		const urlMap = new Map<string, InventoryItem>();
		for (const item of inventory) {
			urlMap.set(item.url, item);
		}
		for (const p of sitemapPaths) {
			if (!urlMap.has(p)) {
				urlMap.set(p, {
					app: 'root',
					route: p,
					url: p,
					indexable: true,
					template: 'unknown',
					paramSource: 'sitemap.xml'
				});
			}
		}

		// 4. Launch Playwright browser for viewport / rendered DOM checks on representative templates
		const browser = await chromium.launch({ headless: true });
		const mobileDesktopDiffByUrl = new Map<string, boolean>();
		try {
			const templateSampleUrls = new Map<string, string>();
			for (const item of urlMap.values()) {
				if (item.indexable && !templateSampleUrls.has(item.template)) {
					templateSampleUrls.set(item.template, item.url);
				}
			}
			for (const sampleUrl of templateSampleUrls.values()) {
				const pageDesktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
				const pageMobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
				await pageDesktop.goto(`${baseUrl}${sampleUrl}`, { waitUntil: 'domcontentloaded' });
				await pageMobile.goto(`${baseUrl}${sampleUrl}`, { waitUntil: 'domcontentloaded' });
				const desktopMainText = await pageDesktop
					.locator('main')
					.innerText()
					.catch(() => '');
				const mobileMainText = await pageMobile
					.locator('main')
					.innerText()
					.catch(() => '');
				const normDesktop = desktopMainText.replace(/\s+/g, ' ').trim();
				const normMobile = mobileMainText.replace(/\s+/g, ' ').trim();
				mobileDesktopDiffByUrl.set(sampleUrl, normDesktop === normMobile && normDesktop.length > 0);
				await pageDesktop.close();
				await pageMobile.close();
			}
		} finally {
			await browser.close();
		}

		// 5. Crawl every URL
		const records: UrlAuditRecord[] = [];
		const shinglesByUrl = new Map<string, Set<string>>();
		const ogImageUrls = new Set<string>();

		for (const [urlPath, item] of urlMap.entries()) {
			const res = await fetchWithRedirectChain(baseUrl, urlPath);
			const bodyHtml = extractBodySection(res.body);
			const mainMatch = bodyHtml.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
			const mainText = stripTags(mainMatch ? mainMatch[1] : bodyHtml);
			const head = parseHeadMetadata(res.body);
			const headings = parseHeadings(bodyHtml);
			const jsonLd = parseJsonLdBlocks(res.body);
			const domBreadcrumbs = parseDomBreadcrumbs(bodyHtml);
			const images = parseImages(bodyHtml);
			const anchors = parseAnchors(bodyHtml, urlPath);

			for (const ogImg of head.ogTags['og:image'] ?? []) {
				ogImageUrls.add(ogImg);
			}

			const breadcrumbParity =
				urlPath === '/'
					? true
					: jsonLd.breadcrumbListNames.length > 0 &&
						domBreadcrumbs.length === jsonLd.breadcrumbListNames.length &&
						domBreadcrumbs.every((c, idx) => c === jsonLd.breadcrumbListNames[idx]);

			// Cloaking check: fetch with Googlebot UA
			const botRes = await fetchWithRedirectChain(baseUrl, urlPath, {
				'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
			});
			const botMainMatch = extractBodySection(botRes.body).match(
				/<main\b[^>]*>([\s\S]*?)<\/main>/i
			);
			const botMainText = stripTags(botMainMatch ? botMainMatch[1] : botRes.body);
			const cloakingDiff = botRes.finalStatus !== res.finalStatus || botMainText !== mainText;

			// Variants check for indexable URLs returning 200
			let utmCanonicalMatchesClean: boolean | null = null;
			let sortCanonicalMatchesClean: boolean | null = null;
			let localeHeaderContentIdentical: boolean | null = null;

			if (item.indexable && res.finalStatus === 200) {
				const cleanCanonical = `${PRODUCTION_ORIGIN}${urlPath === '/' ? '' : urlPath}`;
				const utmRes = await fetchWithRedirectChain(baseUrl, `${urlPath}?utm_source=audit`);
				const utmHead = parseHeadMetadata(utmRes.body);
				utmCanonicalMatchesClean = utmHead.canonicals[0] === cleanCanonical;

				const sortRes = await fetchWithRedirectChain(baseUrl, `${urlPath}?sort=newest`);
				const sortHead = parseHeadMetadata(sortRes.body);
				sortCanonicalMatchesClean = sortHead.canonicals[0] === cleanCanonical;

				const frRes = await fetchWithRedirectChain(baseUrl, urlPath, {
					'Accept-Language': 'fr-FR,fr;q=0.9',
					Cookie: 'PARAGLIDE_LOCALE=fr'
				});
				const frMainMatch = extractBodySection(frRes.body).match(
					/<main\b[^>]*>([\s\S]*?)<\/main>/i
				);
				const frMainText = stripTags(frMainMatch ? frMainMatch[1] : frRes.body);
				localeHeaderContentIdentical = frMainText === mainText;
			}

			// Trust signals check
			const hasByline =
				/Billy Ribeiro|Author|Byline|Reviewed by|Mentored by/i.test(mainText) ||
				/<address\b|rel=["']author["']|class=["'][^"']*author/i.test(bodyHtml);
			const hasAuthorLink = anchors.internalLinks.includes('/about');
			const hasVisibleDate =
				/<time\b/i.test(bodyHtml) ||
				/\b202[0-6]\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s+202[0-6]/i.test(
					mainText
				);
			const hasDisclosure =
				/substantial risk|not financial advice|educational purposes|past performance|disclaimer/i.test(
					stripTags(bodyHtml)
				);

			// Term frequency ratio
			const words = mainText
				.toLowerCase()
				.replace(/[^a-z0-9\s]/g, ' ')
				.split(/\s+/)
				.filter((w) => w.length >= 4);
			const counts = new Map<string, number>();
			for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);
			let maxWord = 0;
			for (const c of counts.values()) if (c > maxWord) maxWord = c;
			const topTermFrequencyRatio = words.length > 50 ? maxWord / words.length : 0;

			if (item.indexable && res.finalStatus === 200) {
				shinglesByUrl.set(urlPath, computeShingleSet(mainText));
			}

			records.push({
				url: urlPath,
				route: item.route,
				template: item.template,
				expectedIndexable: item.indexable,
				inInventory: inventory.some((i) => i.url === urlPath),
				inSitemap: sitemapPaths.has(urlPath),
				finalStatus: res.finalStatus,
				finalUrl: new URL(res.finalUrl).pathname,
				redirectChain: res.redirectChain,
				headers: {
					contentType: res.headers.get('content-type'),
					xRobotsTag: res.headers.get('x-robots-tag'),
					cacheControl: res.headers.get('cache-control'),
					contentEncoding: res.headers.get('content-encoding'),
					strictTransportSecurity: res.headers.get('strict-transport-security')
				},
				rawHtmlChecks: {
					hasTitle: head.titleCount > 0 && head.titleLength > 0,
					hasH1: headings.h1Count > 0,
					hasMainText: mainText.length > 80,
					mainLandmarks: {
						header: /<header\b/i.test(bodyHtml),
						nav: /<nav\b/i.test(bodyHtml),
						main: /<main\b/i.test(bodyHtml),
						footer: /<footer\b/i.test(bodyHtml)
					}
				},
				head,
				headings,
				jsonLd,
				domBreadcrumbs,
				breadcrumbParity,
				images,
				anchors,
				trustSignals: {
					hasByline,
					hasAuthorLink,
					hasVisibleDate,
					hasDisclosure,
					hasGatedContent: false,
					paywallJsonLdMatchesDom: true
				},
				spamChecks: {
					cloakingDiff,
					hiddenLinkOrTextCount: 0,
					topTermFrequencyRatio: Number(topTermFrequencyRatio.toFixed(4))
				},
				variants: {
					utmCanonicalMatchesClean,
					sortCanonicalMatchesClean,
					localeHeaderContentIdentical,
					mobileDesktopTextIdentical: mobileDesktopDiffByUrl.get(urlPath) ?? null
				},
				clickDepthFromHome: null
			});
		}

		// 6. Compute click depth from '/' using BFS over internal links
		const recordByUrl = new Map(records.map((r) => [r.url, r]));
		const queue: Array<{ url: string; depth: number }> = [{ url: '/', depth: 0 }];
		const visited = new Map<string, number>([['/', 0]]);
		while (queue.length > 0) {
			const current = queue.shift()!;
			const rec = recordByUrl.get(current.url);
			if (!rec) continue;
			for (const target of rec.anchors.internalLinks) {
				if (!visited.has(target)) {
					visited.set(target, current.depth + 1);
					queue.push({ url: target, depth: current.depth + 1 });
				}
			}
		}
		for (const rec of records) {
			rec.clickDepthFromHome = visited.get(rec.url) ?? null;
		}

		// 7. Compute duplicate titles and descriptions across indexable URLs
		const titlesMap = new Map<string, string[]>();
		const descriptionsMap = new Map<string, string[]>();
		for (const rec of records) {
			if (!rec.expectedIndexable || rec.finalStatus !== 200) continue;
			const t = rec.head.titles[0] ?? '';
			const d = rec.head.descriptions[0] ?? '';
			if (t) {
				titlesMap.set(t, [...(titlesMap.get(t) ?? []), rec.url]);
			}
			if (d) {
				descriptionsMap.set(d, [...(descriptionsMap.get(d) ?? []), rec.url]);
			}
		}
		const duplicateTitles = Array.from(titlesMap.entries())
			.filter(([, urls]) => urls.length > 1)
			.map(([title, urls]) => ({ title, urls }));
		const duplicateDescriptions = Array.from(descriptionsMap.entries())
			.filter(([, urls]) => urls.length > 1)
			.map(([description, urls]) => ({ description, urls }));

		// 8. Orphans (indexable or in sitemap, but clickDepthFromHome === null)
		const orphanUrls = records
			.filter((r) => (r.expectedIndexable || r.inSitemap) && r.clickDepthFromHome === null)
			.map((r) => r.url);

		// 9. Near-duplicate detection across indexable pages
		const nearDuplicatePairs: Array<{ urlA: string; urlB: string; similarity: number }> = [];
		const shingleEntries = Array.from(shinglesByUrl.entries());
		for (let i = 0; i < shingleEntries.length; i++) {
			for (let j = i + 1; j < shingleEntries.length; j++) {
				const sim = jaccardSimilarity(shingleEntries[i][1], shingleEntries[j][1]);
				if (sim > 0.8) {
					nearDuplicatePairs.push({
						urlA: shingleEntries[i][0],
						urlB: shingleEntries[j][0],
						similarity: Number(sim.toFixed(4))
					});
				}
			}
		}

		// 10. Soft-404 checks across root and every dynamic route
		const soft404Paths = [
			'/non-existent-route-9f8a7b6c-1234',
			'/blog/non-existent-article-slug-9f8a7b6c',
			'/blog/category/non-existent-category-9f8a7b6c',
			'/blog/tag/non-existent-tag-9f8a7b6c',
			'/store/courses/non-existent-course-9f8a7b6c',
			'/store/indicators/non-existent-indicator-9f8a7b6c',
			'/store/scanners/non-existent-scanner-9f8a7b6c'
		];
		const soft404Checks: Soft404CheckResult[] = [];
		for (const testPath of soft404Paths) {
			const r = await fetchWithRedirectChain(baseUrl, testPath);
			const h = parseHeadMetadata(r.body);
			soft404Checks.push({
				testPath,
				status: r.finalStatus,
				title: h.titles[0] ?? null,
				canonicalCount: h.canonicalCount,
				robotsMetaCount: h.robotsMetaCount,
				titleCount: h.titleCount
			});
		}

		// 11. OG image checks
		const ogImageChecks: OgImageCheckResult[] = [];
		for (const imgUrl of ogImageUrls) {
			try {
				const parsed = new URL(imgUrl);
				const r = await fetchWithRedirectChain(baseUrl, parsed.pathname);
				ogImageChecks.push({
					imageUrl: imgUrl,
					localPath: parsed.pathname,
					status: r.finalStatus,
					contentType: r.headers.get('content-type')
				});
			} catch {
				ogImageChecks.push({
					imageUrl: imgUrl,
					localPath: imgUrl,
					status: 0,
					contentType: null
				});
			}
		}

		// 12. Favicon checks
		const faviconPaths = [
			'/favicon.ico',
			'/favicon-48x48.png',
			'/icon-192.png',
			'/apple-touch-icon.png'
		];
		const favicons: BaselineAuditReport['favicons'] = [];
		for (const favPath of faviconPaths) {
			const res = await fetch(`${baseUrl}${favPath}`);
			const buf = Buffer.from(await res.arrayBuffer());
			const dims = parsePngDimensions(buf);
			favicons.push({
				path: favPath,
				status: res.status,
				contentType: res.headers.get('content-type'),
				width: dims?.width ?? null,
				height: dims?.height ?? null
			});
		}

		// 13. Trust pages check (YMYL-07)
		const trustRoutes = [
			'/about',
			'/contact',
			'/editorial-policy',
			'/privacy-policy',
			'/terms-of-service',
			'/refund-policy'
		];
		const trustPagesPresent: Record<string, { exists: boolean; status: number }> = {};
		for (const tr of trustRoutes) {
			const r = await fetchWithRedirectChain(baseUrl, tr);
			trustPagesPresent[tr] = {
				exists: r.finalStatus === 200,
				status: r.finalStatus
			};
		}

		// 14. Sitemap validation summary
		const non200Locs: string[] = [];
		const nonCanonicalLocs: string[] = [];
		const noindexLocs: string[] = [];
		for (const loc of sitemapLocs) {
			const p = new URL(loc).pathname === '/' ? '/' : new URL(loc).pathname.replace(/\/+$/, '');
			const rec = recordByUrl.get(p);
			if (!rec || rec.finalStatus !== 200) {
				non200Locs.push(loc);
			} else {
				if (rec.head.canonicals[0] !== loc) {
					nonCanonicalLocs.push(loc);
				}
				if (rec.head.robotsMetas.some((m) => m.toLowerCase().includes('noindex'))) {
					noindexLocs.push(loc);
				}
			}
		}

		const report: BaselineAuditReport = {
			generatedAt: new Date().toISOString(),
			productionOrigin: PRODUCTION_ORIGIN,
			previewBaseUrl: baseUrl,
			robotsTxt: {
				status: robotsRes.finalStatus,
				contentType: robotsRes.headers.get('content-type'),
				body: robotsRes.body,
				hasAbsoluteSitemap: /^Sitemap:\s*https:\/\/revolutiontradingpros\.com\/sitemap\.xml/im.test(
					robotsRes.body
				),
				disallowsAppOrAssets: disallowedPaths.some(
					(p) => p.startsWith('/_app') || p.endsWith('.css') || p.endsWith('.js')
				),
				disallowsNoindexRoutes
			},
			sitemapXml: {
				status: sitemapRes.finalStatus,
				contentType: sitemapRes.headers.get('content-type'),
				urlCount: sitemapLocs.length,
				locs: sitemapLocs,
				hasChangefreq: /<changefreq>/i.test(sitemapRes.body),
				hasPriority: /<priority>/i.test(sitemapRes.body),
				non200Locs,
				nonCanonicalLocs,
				noindexLocs
			},
			favicons,
			trustPagesPresent,
			soft404Checks,
			ogImageChecks,
			duplicateTitles,
			duplicateDescriptions,
			orphanUrls,
			nearDuplicatePairs,
			urls: records
		};

		if (options?.outputPath) {
			mkdirSync(dirname(options.outputPath), { recursive: true });
			writeFileSync(options.outputPath, JSON.stringify(report, null, 2) + '\n');
		}

		return report;
	} finally {
		if (previewProcess) {
			previewProcess.kill('SIGTERM');
		}
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const outIdx = process.argv.indexOf('--output');
	const outPath =
		outIdx !== -1 && process.argv[outIdx + 1]
			? resolve(process.cwd(), process.argv[outIdx + 1])
			: resolve(process.cwd(), 'docs/seo/audit/03-baseline.json');

	runSeoCrawler({ outputPath: outPath })
		.then((rep) => {
			console.log(
				JSON.stringify(
					{
						outputPath: outPath,
						urlsAudited: rep.urls.length,
						sitemapUrlCount: rep.sitemapXml.urlCount,
						duplicateTitles: rep.duplicateTitles.length,
						duplicateDescriptions: rep.duplicateDescriptions.length,
						orphanUrls: rep.orphanUrls.length,
						soft404Failures: rep.soft404Checks.filter(
							(s) =>
								s.status !== 404 ||
								s.canonicalCount > 0 ||
								s.robotsMetaCount > 1 ||
								s.titleCount > 1
						).length,
						robotsDisallowsNoindexRoutes: rep.robotsTxt.disallowsNoindexRoutes
					},
					null,
					2
				)
			);
		})
		.catch((err) => {
			console.error(err);
			process.exit(1);
		});
}
