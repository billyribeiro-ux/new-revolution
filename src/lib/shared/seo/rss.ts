export const DEFAULT_FEED_ORIGIN = 'https://revolutiontradingpros.com';

export function escapeXml(raw: string | null | undefined): string {
	if (!raw) return '';
	return raw
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export function wrapCdata(raw: string | null | undefined): string {
	if (!raw) return '<![CDATA[]]>';
	const safe = raw.replace(/\]\]>/g, ']]]]><![CDATA[>');
	return `<![CDATA[${safe}]]>`;
}

export function absoluteUrl(pathOrUrl: string, origin: string = DEFAULT_FEED_ORIGIN): string {
	const cleanOrigin = origin.replace(/\/+$/, '');
	if (!pathOrUrl) return cleanOrigin;
	if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
	const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
	return `${cleanOrigin}${cleanPath === '/' ? '' : cleanPath}`;
}

export function resolvePostModifiedDate(post: {
	contentUpdatedAt?: Date | string | null;
	updatedAt?: Date | string | null;
	publishedAt?: Date | string | null;
	createdAt?: Date | string | null;
}): Date | null {
	const candidate =
		post.contentUpdatedAt ?? post.updatedAt ?? post.publishedAt ?? post.createdAt ?? null;
	if (!candidate) return null;
	const date = candidate instanceof Date ? candidate : new Date(candidate);
	return Number.isNaN(date.getTime()) ? null : date;
}

export interface RssFeedItemInput {
	title: string;
	slug: string;
	excerpt?: string | null;
	metaDescription?: string | null;
	content: string;
	authorName?: string | null;
	categoryNames?: string[];
	publishedAt?: Date | string | null;
	createdAt?: Date | string | null;
	contentUpdatedAt?: Date | string | null;
	updatedAt?: Date | string | null;
	enclosure?: {
		url: string;
		type: string;
		length: number;
	} | null;
}

export interface BuildRssFeedOptions {
	origin?: string;
	title?: string;
	description?: string;
	language?: string;
	feedPath?: string;
	logoPath?: string;
	items: RssFeedItemInput[];
}

export function buildRssFeedXml(options: BuildRssFeedOptions): string {
	const origin = options.origin ?? DEFAULT_FEED_ORIGIN;
	const channelTitle = options.title ?? 'Revolution Trading Pros Blog';
	const channelDesc =
		options.description ??
		'Institutional stock and options trading education, Options Greeks breakdowns, and risk discipline.';
	const language = options.language ?? 'en-us';
	const feedUrl = absoluteUrl(options.feedPath ?? '/rss.xml', origin);
	const blogUrl = absoluteUrl('/blog', origin);
	const logoUrl = absoluteUrl(options.logoPath ?? '/logo.png', origin);

	// Newest modified date across all items (never fabricate `new Date()` when items exist)
	let newestModified: Date | null = null;
	for (const item of options.items.slice(0, 50)) {
		const mod = resolvePostModifiedDate(item);
		if (mod && (!newestModified || mod.getTime() > newestModified.getTime())) {
			newestModified = mod;
		}
	}

	const itemNodes = options.items.slice(0, 50).map((item) => {
		const itemUrl = absoluteUrl(`/blog/${item.slug}`, origin);
		const summary = (item.excerpt ?? item.metaDescription ?? '').trim();
		const pubCandidate = item.publishedAt ?? item.createdAt ?? null;
		const pubDateObj = pubCandidate
			? pubCandidate instanceof Date
				? pubCandidate
				: new Date(pubCandidate)
			: null;
		const pubDateLine =
			pubDateObj && !Number.isNaN(pubDateObj.getTime())
				? `      <pubDate>${pubDateObj.toUTCString()}</pubDate>`
				: '';

		const categoriesXml = (item.categoryNames ?? [])
			.filter(Boolean)
			.map((cat) => `      <category>${escapeXml(cat)}</category>`)
			.join('\n');

		const enclosureXml =
			item.enclosure &&
			item.enclosure.url &&
			item.enclosure.type &&
			typeof item.enclosure.length === 'number' &&
			item.enclosure.length > 0
				? `      <enclosure url="${escapeXml(absoluteUrl(item.enclosure.url, origin))}" type="${escapeXml(item.enclosure.type)}" length="${item.enclosure.length}" />`
				: '';

		return [
			'    <item>',
			`      <title>${escapeXml(item.title)}</title>`,
			`      <link>${escapeXml(itemUrl)}</link>`,
			`      <guid isPermaLink="true">${escapeXml(itemUrl)}</guid>`,
			`      <description>${escapeXml(summary)}</description>`,
			`      <content:encoded>${wrapCdata(item.content)}</content:encoded>`,
			pubDateLine,
			item.authorName ? `      <dc:creator>${escapeXml(item.authorName)}</dc:creator>` : '',
			categoriesXml,
			enclosureXml,
			'    </item>'
		]
			.filter(Boolean)
			.join('\n');
	});

	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
		'  <channel>',
		`    <title>${escapeXml(channelTitle)}</title>`,
		`    <link>${escapeXml(blogUrl)}</link>`,
		`    <description>${escapeXml(channelDesc)}</description>`,
		`    <language>${escapeXml(language)}</language>`,
		newestModified ? `    <lastBuildDate>${newestModified.toUTCString()}</lastBuildDate>` : '',
		`    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
		'    <image>',
		`      <url>${escapeXml(logoUrl)}</url>`,
		`      <title>${escapeXml(channelTitle)}</title>`,
		`      <link>${escapeXml(blogUrl)}</link>`,
		'    </image>',
		...itemNodes,
		'  </channel>',
		'</rss>'
	]
		.filter(Boolean)
		.join('\n');
}
