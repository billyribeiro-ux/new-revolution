import { describe, expect, it } from 'vite-plus/test';
import { buildBlogPageMetaTags, buildBlogPostJsonLd, dropRestrictedJsonLdNodes } from './blog-seo';

const ORIGIN = 'https://revolutiontradingpros.com';
const base = {
	slug: 'post',
	title: 'A post',
	coverImage: `${ORIGIN}/media/a-1600w.webp`,
	coverImageWidth: 1600,
	coverImageHeight: 1000
};

function article(input: Parameters<typeof buildBlogPostJsonLd>[0]) {
	const graph = buildBlogPostJsonLd(input)['@graph'] as Array<Record<string, unknown>>;
	return graph.find((n) => n['@type'] === 'BlogPosting') as Record<string, unknown>;
}

describe('buildBlogPostJsonLd image crops', () => {
	it('falls back to the single cover ImageObject without crops', () => {
		const image = article(base).image as Record<string, unknown>;
		expect(Array.isArray(image)).toBe(false);
		expect(image.url).toBe(base.coverImage);
		expect(image.width).toBe(1600);
	});

	it('falls back when every crop is under 50,000 px', () => {
		const image = article({
			...base,
			coverImageCrops: [{ aspect: '16x9', url: '/media/s.webp', width: 200, height: 112 }]
		}).image as Record<string, unknown>;
		expect(Array.isArray(image)).toBe(false);
		expect(image.url).toBe(base.coverImage);
	});

	it('emits ImageObjects ordered 16x9, 4x3, 1x1 regardless of input order, absolute URLs', () => {
		const a = article({
			...base,
			coverImageCrops: [
				{ aspect: '1x1', url: `${ORIGIN}/media/a-crop-1x1.webp`, width: 1000, height: 1000 },
				{ aspect: '16x9', url: '/media/a-crop-16x9.webp', width: 1200, height: 675 },
				{ aspect: '4x3', url: `${ORIGIN}/media/a-crop-4x3.webp`, width: 1200, height: 900 }
			]
		});
		const image = a.image as Array<Record<string, unknown>>;
		expect(image.map((i) => i.url)).toEqual([
			`${ORIGIN}/media/a-crop-16x9.webp`,
			`${ORIGIN}/media/a-crop-4x3.webp`,
			`${ORIGIN}/media/a-crop-1x1.webp`
		]);
		expect(image.every((i) => i['@type'] === 'ImageObject')).toBe(true);
		expect(image.map((i) => [i.width, i.height])).toEqual([
			[1200, 675],
			[1200, 900],
			[1000, 1000]
		]);
		for (const i of image) {
			expect((i.width as number) * (i.height as number)).toBeGreaterThanOrEqual(50_000);
		}
		// thumbnailUrl stays the cover itself
		expect(a.thumbnailUrl).toBe(base.coverImage);
	});

	it('drops only the crops under 50,000 px and keeps the rest', () => {
		const image = article({
			...base,
			coverImageCrops: [
				{ aspect: '16x9', url: '/media/a.webp', width: 288, height: 162 },
				{ aspect: '1x1', url: '/media/b.webp', width: 300, height: 300 }
			]
		}).image as Array<Record<string, unknown>>;
		expect(image).toHaveLength(1);
		expect(image[0].url).toBe(`${ORIGIN}/media/b.webp`);
	});

	it('emits no image at all without a cover', () => {
		const a = article({ slug: 'p', title: 't' });
		expect(a.image).toBeUndefined();
	});

	it('includes a WebPage node and honors explicit schemaType overrides, Person.url, and mainEntityOfPage.@id', () => {
		const jsonLd = buildBlogPostJsonLd({
			...base,
			isPillar: true,
			schemaType: 'TechArticle',
			author: {
				name: 'Billy Ribeiro',
				slug: 'billy-ribeiro',
				website: 'https://revolutiontradingpros.com/about'
			}
		});
		const graph = jsonLd['@graph'] as Array<Record<string, unknown>>;
		const webPage = graph.find((n) => n['@type'] === 'WebPage');
		const techArticle = graph.find((n) => n['@type'] === 'TechArticle');
		const person = graph.find((n) => n['@type'] === 'Person');
		expect(webPage).toBeDefined();
		expect(webPage?.['@id']).toBe(`${ORIGIN}/blog/post#webpage`);
		expect(techArticle).toBeDefined();
		expect(techArticle?.mainEntityOfPage).toEqual({
			'@type': 'WebPage',
			'@id': `${ORIGIN}/blog/post#webpage`
		});
		expect(person?.url).toBe('https://revolutiontradingpros.com/about');
	});
});

describe('dropRestrictedJsonLdNodes', () => {
	it('drops restricted types, including array @type, and keeps the rest', () => {
		const kept = { '@type': 'Dataset' };
		expect(
			dropRestrictedJsonLdNodes([
				{ '@type': 'FAQPage' },
				{ '@type': ['Thing', 'HowTo'] },
				{ name: 'no type' },
				kept
			])
		).toEqual([{ name: 'no type' }, kept]);
	});
});

describe('buildBlogPostJsonLd retired schema types', () => {
	it('never emits HowTo, even for a legacy schemaType value (SD-15)', () => {
		const graph = buildBlogPostJsonLd({ ...base, schemaType: 'HowTo' })['@graph'] as Array<
			Record<string, unknown>
		>;
		expect(graph.some((n) => n['@type'] === 'HowTo')).toBe(false);
		expect(graph.some((n) => n['@type'] === 'BlogPosting')).toBe(true);
	});
});

describe('buildBlogPageMetaTags', () => {
	it('honors canonicalOverride, preview nofollow, noarchive, and nosnippet directives', () => {
		const overridden = buildBlogPageMetaTags({
			title: 'SPX 0DTE Guide',
			description: 'Educational breakdown of SPX 0DTE gamma exposure and execution risk.',
			pathname: '/blog/spx-0dte-guide',
			canonicalOverride: 'https://revolutiontradingpros.com/blog/flagship-spx-guide',
			noarchive: true,
			nosnippet: true
		});
		expect(overridden.pageMetaTags.canonical).toBe(
			'https://revolutiontradingpros.com/blog/flagship-spx-guide'
		);
		expect(overridden.pageMetaTags.robots).toBe('index, follow, noarchive, nosnippet');

		const previewMeta = buildBlogPageMetaTags({
			title: 'Draft Preview',
			description: 'Draft preview description.',
			pathname: '/blog/draft-preview',
			indexable: false,
			nofollow: true
		});
		expect(previewMeta.pageMetaTags.robots).toBe('noindex, nofollow');
		expect(previewMeta.pageMetaTags.canonical).toBeUndefined();
	});
});
