import { describe, expect, it } from 'vite-plus/test';
import { isPageOutOfRange, pageHref, pageLabel, parsePageParam } from './pagination';

describe('parsePageParam', () => {
	it('treats an absent parameter as page 1', () => {
		expect(parsePageParam(null)).toEqual({ ok: true, page: 1 });
	});

	it.each(['1', '2', '17', '99999'])('accepts %s', (raw) => {
		expect(parsePageParam(raw)).toEqual({ ok: true, page: Number(raw) });
	});

	it.each(['', '0', '-1', '+2', '01', '1.5', '1e3', 'abc', ' 2', '2 ', '999999', '１２', '2\n'])(
		'rejects %j',
		(raw) => {
			expect(parsePageParam(raw)).toEqual({ ok: false });
		}
	);
});

describe('isPageOutOfRange', () => {
	it('keeps page 1 valid for an empty collection (the empty state)', () => {
		expect(isPageOutOfRange(1, 0)).toBe(false);
		expect(isPageOutOfRange(2, 0)).toBe(true);
	});

	it('is inclusive of the last page and exclusive beyond it', () => {
		expect(isPageOutOfRange(3, 3)).toBe(false);
		expect(isPageOutOfRange(4, 3)).toBe(true);
	});
});

describe('pageHref', () => {
	it('gives page 1 a single bare URL', () => {
		expect(pageHref('/blog', 1)).toBe('/blog');
		expect(pageHref('/blog', 0)).toBe('/blog');
	});

	it('adds ?page= from page 2', () => {
		expect(pageHref('/blog', 2)).toBe('/blog?page=2');
		expect(pageHref('/blog/tag/spx-options', 5)).toBe('/blog/tag/spx-options?page=5');
	});

	it('keeps and encodes other parameters, and never emits page=1', () => {
		expect(pageHref('/blog', 1, { search: 'gamma flip' })).toBe('/blog?search=gamma+flip');
		expect(pageHref('/blog', 2, { search: 'a&b' })).toBe('/blog?search=a%26b&page=2');
	});
});

describe('pageLabel', () => {
	it('is empty on page 1 and distinguishes later pages', () => {
		expect(pageLabel(1)).toBe('');
		expect(pageLabel(2)).toBe(' (Page 2)');
	});
});
