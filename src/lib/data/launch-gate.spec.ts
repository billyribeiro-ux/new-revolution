import { describe, expect, it } from 'vite-plus/test';
import {
	FREE_EBOOK_AVAILABLE,
	UNLAUNCHED_ROUTE_PREFIXES,
	isLaunchedHref,
	isUnlaunchedRoute
} from './launch-gate.ts';

describe('launch gate', () => {
	it('gates the store and the unwritten eBook while the blog is launched', () => {
		expect([...UNLAUNCHED_ROUTE_PREFIXES]).toEqual(['/store']);
		expect(FREE_EBOOK_AVAILABLE).toBe(false);
	});

	it('matches a prefix only on a path-segment boundary', () => {
		expect(isUnlaunchedRoute('/store')).toBe(true);
		expect(isUnlaunchedRoute('/store/courses/x')).toBe(true);
		expect(isUnlaunchedRoute('/blog/category/market-structure')).toBe(false);
		expect(isUnlaunchedRoute('/storefront')).toBe(false);
		expect(isUnlaunchedRoute('/blogger')).toBe(false);
		expect(isUnlaunchedRoute('/')).toBe(false);
	});

	it('ignores query strings and hashes when judging an href', () => {
		expect(isLaunchedHref('/store/courses#reviews')).toBe(false);
		expect(isLaunchedHref('/blog?page=2')).toBe(true);
		expect(isLaunchedHref('/resources#resource-categories-h2')).toBe(true);
		expect(isLaunchedHref('/terms-of-service#options-leverage-risk-disclosure')).toBe(true);
	});
});
