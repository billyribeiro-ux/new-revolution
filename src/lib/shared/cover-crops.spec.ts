import { describe, expect, it } from 'vitest';
import { coverSrcsetFromMedia } from './cover-srcset';
import { extractCoverCrops, isCropVariant, planCoverCrops } from './cover-crops';

describe('planCoverCrops', () => {
	it('1600x1000 gives 1200x675, 1200x900, 1000x1000', () => {
		expect(planCoverCrops(1600, 1000)).toEqual([
			{ aspect: '16x9', width: 1200, height: 675 },
			{ aspect: '4x3', width: 1200, height: 900 },
			{ aspect: '1x1', width: 1000, height: 1000 }
		]);
	});
	it('never upscales and always keeps exact ratios and >= 50,000 px', () => {
		for (const [w, h] of [
			[800, 600],
			[333, 777],
			[2400, 400],
			[480, 270],
			[301, 301]
		]) {
			for (const p of planCoverCrops(w, h)) {
				expect(p.width).toBeLessThanOrEqual(w);
				expect(p.height).toBeLessThanOrEqual(h);
				expect(p.width * p.height).toBeGreaterThanOrEqual(50_000);
			}
		}
	});
	it('skips crops a small source cannot fill and returns [] for tiny/unknown sources', () => {
		expect(planCoverCrops(200, 200)).toEqual([]);
		expect(planCoverCrops(null, 500)).toEqual([]);
		// 2400x400: 16x9 limited by height (711x400=284k ok), 1x1 400x400=160k ok
		expect(planCoverCrops(2400, 400).map((p) => p.aspect)).toEqual(['16x9', '4x3', '1x1']);
		// 600x200: 1x1 is 200x200=40k, skipped
		expect(planCoverCrops(600, 200).map((p) => p.aspect)).toEqual(['16x9', '4x3']);
	});
});

describe('crops vs srcset consumers', () => {
	const variants = {
		'480': { width: 480, height: 300, url: 'u480', pathname: 'p' },
		'crop-16x9': {
			width: 1200,
			height: 675,
			url: 'ucrop',
			pathname: 'p',
			kind: 'crop' as const,
			aspect: '16x9' as const
		}
	};
	it('extractCoverCrops reads only valid crop entries', () => {
		expect(extractCoverCrops(variants)).toEqual([
			{ aspect: '16x9', url: 'ucrop', width: 1200, height: 675 }
		]);
		expect(extractCoverCrops(null)).toEqual([]);
		expect(isCropVariant(variants['480'])).toBe(false);
	});
	it('coverSrcsetFromMedia never lists a crop', () => {
		const srcset = coverSrcsetFromMedia('uorig', {
			blobUrl: 'uorig',
			width: 1600,
			variantsJson: variants
		});
		expect(srcset).toBe('u480 480w, uorig 1600w');
		expect(srcset).not.toContain('ucrop');
	});
});
