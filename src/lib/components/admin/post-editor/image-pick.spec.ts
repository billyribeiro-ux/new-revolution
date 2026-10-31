import { describe, expect, it } from 'vitest';
import type { MediaItem } from '#lib/shared/media-upload';
import { pickedAlt, resolveCoverFromPick, type PickedMedia } from './image-pick';

function item(overrides: Partial<MediaItem> = {}): MediaItem {
	const size = (value: 'thumbnail' | 'medium' | 'large' | 'full', w: number, h: number) => ({
		value,
		label: value,
		url: `https://cdn.test/${value}-${w}w.webp`,
		width: w,
		height: h,
		available: true
	});
	return {
		id: 'm1',
		filename: 'chart.webp',
		slug: 'chart',
		mime_type: 'image/webp',
		size_bytes: 1,
		width: 2400,
		height: 1350,
		title: 'Chart Title',
		alt_text: '',
		description: '',
		caption: '',
		folder: '',
		urls: {
			original: 'https://cdn.test/full-2400w.webp',
			large: 'https://cdn.test/large-1200w.webp',
			medium: 'https://cdn.test/medium-800w.webp',
			thumbnail: 'https://cdn.test/thumbnail-480w.webp',
			webp: 'https://cdn.test/full-2400w.webp'
		},
		available_sizes: [
			size('thumbnail', 480, 270),
			size('medium', 800, 450),
			size('large', 1200, 675),
			size('full', 2400, 1350)
		],
		created_at: '',
		updated_at: '',
		...overrides
	};
}

function pick(overrides: Partial<PickedMedia> = {}, mediaItem = item()): PickedMedia {
	return {
		item: mediaItem,
		url: 'https://cdn.test/full-2400w.webp',
		width: 2400,
		height: 1350,
		alt: '',
		caption: '',
		size: 'full',
		...overrides
	};
}

describe('pickedAlt', () => {
	it('drops the picker title fallback: no real alt means empty alt', () => {
		expect(pickedAlt(pick({ alt: 'Chart Title' }))).toBe('');
	});
	it('keeps a real item alt and a typed alt', () => {
		expect(pickedAlt(pick({ alt: 'SPX gamma wall' }, item({ alt_text: 'SPX gamma wall' })))).toBe(
			'SPX gamma wall'
		);
		expect(pickedAlt(pick({ alt: 'Typed by the author' }))).toBe('Typed by the author');
	});
	it('keeps alt equal to the title when the item really carries that alt', () => {
		expect(pickedAlt(pick({ alt: 'Chart Title' }, item({ alt_text: 'Chart Title' })))).toBe(
			'Chart Title'
		);
	});
});

describe('resolveCoverFromPick', () => {
	it('defaults to the large (1200w) variant and its real dimensions when the picker default size is full', () => {
		expect(resolveCoverFromPick(pick())).toEqual({
			url: 'https://cdn.test/large-1200w.webp',
			width: 1200,
			height: 675,
			alt: '',
			caption: ''
		});
	});
	it('respects an explicit non-full size chosen in the picker', () => {
		const out = resolveCoverFromPick(
			pick({ size: 'medium', url: 'https://cdn.test/medium-800w.webp', width: 800, height: 450 })
		);
		expect(out.url).toBe('https://cdn.test/medium-800w.webp');
		expect([out.width, out.height]).toEqual([800, 450]);
	});
	it('falls back to the picked url when no large variant exists (small originals)', () => {
		const small = item({
			width: 800,
			height: 450,
			available_sizes: item().available_sizes.map((s) =>
				s.value === 'large' ? { ...s, available: false } : s
			)
		});
		const out = resolveCoverFromPick(
			pick({ url: 'https://cdn.test/full-800w.webp', width: 800, height: 450 }, small)
		);
		expect(out.url).toBe('https://cdn.test/full-800w.webp');
		expect([out.width, out.height]).toEqual([800, 450]);
	});
	it('keeps alt empty when the item has none (never the title)', () => {
		expect(resolveCoverFromPick(pick({ alt: 'Chart Title' })).alt).toBe('');
	});
});
