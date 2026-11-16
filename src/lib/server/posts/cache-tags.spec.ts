import { describe, expect, it } from 'vite-plus/test';
import {
	articleCacheTags,
	cacheTagHeaderValue,
	isValidCacheTag,
	normalizeCacheTags,
	tagsForInvalidatedPaths
} from './cache-tags';

describe('isValidCacheTag', () => {
	it.each(['blog-lists', 'blog-post:my-slug', 'a'])('accepts %s', (tag) => {
		expect(isValidCacheTag(tag)).toBe(true);
	});

	it.each(['', 'a,b', 'has space', 'tab\there', 'nul\u0000', 'del\u007f', 'x'.repeat(257)])(
		'rejects %j',
		(tag) => {
			expect(isValidCacheTag(tag)).toBe(false);
		}
	);

	it('measures the limit in UTF-8 bytes, not characters', () => {
		expect(isValidCacheTag('é'.repeat(128))).toBe(true);
		expect(isValidCacheTag('é'.repeat(129))).toBe(false);
	});
});

describe('normalizeCacheTags / cacheTagHeaderValue', () => {
	it('drops invalid tags, de-duplicates and keeps order', () => {
		expect(normalizeCacheTags(['b', 'a,b', 'b', 'a', ''])).toEqual(['b', 'a']);
		expect(cacheTagHeaderValue(['b', 'a,b', 'a'])).toBe('b,a');
	});

	it('caps a response at 128 tags', () => {
		const many = Array.from({ length: 300 }, (_, i) => `t${i}`);
		expect(normalizeCacheTags(many)).toHaveLength(128);
	});
});

describe('articleCacheTags', () => {
	it('carries the post tag and the lists tag', () => {
		expect(articleCacheTags('gamma-flip')).toEqual(['blog-post:gamma-flip', 'blog-lists']);
	});
});

describe('tagsForInvalidatedPaths', () => {
	it('maps the paths a publish event invalidates', () => {
		expect(
			tagsForInvalidatedPaths(['/blog', '/blog/gamma-flip', '/rss.xml', '/sitemap.xml'])
		).toEqual(['blog-lists', 'blog-post:gamma-flip', 'blog-feed', 'blog-sitemap']);
	});

	it('maps a rename: both the new and the old article path', () => {
		expect(tagsForInvalidatedPaths(['/blog/new-slug', '/blog/old-slug'])).toEqual([
			'blog-post:new-slug',
			'blog-lists',
			'blog-post:old-slug'
		]);
	});

	it('maps archive paths to the lists tag and ignores query strings', () => {
		expect(
			tagsForInvalidatedPaths(['/blog/category/market-structure', '/blog/tag/spx?page=2'])
		).toEqual(['blog-lists']);
	});

	it('never treats the taxonomy roots or unrelated paths as articles', () => {
		expect(tagsForInvalidatedPaths(['/blog/category', '/blog/tag', '/about', '/blog/a/b'])).toEqual(
			[]
		);
	});

	it('drops only the post tag when a slug cannot form a valid tag; the lists tag still purges', () => {
		expect(tagsForInvalidatedPaths(['/blog/bad,slug'])).toEqual(['blog-lists']);
	});
});
