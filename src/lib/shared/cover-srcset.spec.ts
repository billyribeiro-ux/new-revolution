import { describe, expect, it } from 'vitest';
import { coverSrcsetFromMedia, coverSrcsetFromUrl } from './cover-srcset';

const BASE = 'https://cdn.example.test/media/chart-abc123def456';

describe('coverSrcsetFromUrl (naming-convention fallback)', () => {
	it('never lists a -1200w file for an 800w original (only 480w + itself)', () => {
		const out = coverSrcsetFromUrl(`${BASE}-800w.webp`);
		expect(out).toBe(`${BASE}-480w.webp 480w, ${BASE}-800w.webp 800w`);
		expect(out).not.toContain('1200w');
	});

	it('lists 480/800 plus the 1200w original itself', () => {
		expect(coverSrcsetFromUrl(`${BASE}-1200w.webp`)).toBe(
			`${BASE}-480w.webp 480w, ${BASE}-800w.webp 800w, ${BASE}-1200w.webp 1200w`
		);
	});

	it('lists all three variants plus a wider original at its own width', () => {
		expect(coverSrcsetFromUrl(`${BASE}-2400w.webp`)).toBe(
			`${BASE}-480w.webp 480w, ${BASE}-800w.webp 800w, ${BASE}-1200w.webp 1200w, ${BASE}-2400w.webp 2400w`
		);
	});

	it('returns undefined when there is nothing to choose between (<=480w or not a sized webp)', () => {
		expect(coverSrcsetFromUrl(`${BASE}-480w.webp`)).toBeUndefined();
		expect(coverSrcsetFromUrl(`${BASE}-300w.webp`)).toBeUndefined();
		expect(coverSrcsetFromUrl('https://cdn.example.test/a.jpg')).toBeUndefined();
		expect(coverSrcsetFromUrl(null)).toBeUndefined();
		expect(coverSrcsetFromUrl('')).toBeUndefined();
	});
});

describe('coverSrcsetFromMedia (real stored files)', () => {
	const row = {
		blobUrl: `${BASE}-2400w.webp`,
		width: 2400,
		variantsJson: {
			'480': { width: 480, url: `${BASE}-480w.webp` },
			'800': { width: 800, url: `${BASE}-800w.webp` },
			'1200': { width: 1200, url: `${BASE}-1200w.webp` }
		}
	};

	it('caps the srcset at the chosen cover (large 1200w) so the editor choice stays the largest', () => {
		expect(coverSrcsetFromMedia(`${BASE}-1200w.webp`, row)).toBe(
			`${BASE}-480w.webp 480w, ${BASE}-800w.webp 800w, ${BASE}-1200w.webp 1200w`
		);
	});

	it('includes the original when the original is the cover', () => {
		expect(coverSrcsetFromMedia(`${BASE}-2400w.webp`, row)).toContain(`${BASE}-2400w.webp 2400w`);
	});

	it('for an 800w original with a single 480w variant never invents 1200w', () => {
		const small = {
			blobUrl: `${BASE}-800w.webp`,
			width: 800,
			variantsJson: { '480': { width: 480, url: `${BASE}-480w.webp` } }
		};
		expect(coverSrcsetFromMedia(`${BASE}-800w.webp`, small)).toBe(
			`${BASE}-480w.webp 480w, ${BASE}-800w.webp 800w`
		);
	});

	it('skips fixed-ratio crops stored in the same variants map', () => {
		const withCrop = {
			...row,
			variantsJson: {
				...row.variantsJson,
				'crop-16x9': { width: 1200, url: `${BASE}-crop-16x9.webp`, kind: 'crop' }
			}
		};
		const out = coverSrcsetFromMedia(`${BASE}-1200w.webp`, withCrop);
		expect(out).not.toContain('crop');
		expect(out).toBe(`${BASE}-480w.webp 480w, ${BASE}-800w.webp 800w, ${BASE}-1200w.webp 1200w`);
	});

	it('returns undefined for no row, a row without variants, or a cover that is not one of its files', () => {
		expect(coverSrcsetFromMedia(`${BASE}-800w.webp`, undefined)).toBeUndefined();
		expect(
			coverSrcsetFromMedia(`${BASE}-800w.webp`, {
				blobUrl: `${BASE}-800w.webp`,
				width: 800,
				variantsJson: null
			})
		).toBeUndefined();
		expect(coverSrcsetFromMedia('https://other.test/x.webp', row)).toBeUndefined();
	});
});
