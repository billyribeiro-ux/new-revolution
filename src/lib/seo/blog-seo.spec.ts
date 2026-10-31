import { describe, expect, it } from 'vitest';
import { buildBlogPostJsonLd } from './blog-seo';

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
});
