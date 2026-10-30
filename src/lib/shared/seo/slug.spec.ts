import { describe, expect, it } from 'vitest';
import { computeRenderedTitle } from './meta-budget';
import {
	generateSlug,
	isReservedSlug,
	isValidSlug,
	normaliseSlug,
	SLUG_MAX_LEN
} from './slug';
import { isCategoryIndexable, isTagIndexable } from './taxonomy';

describe('Slug, Meta Budget & Taxonomy Helpers (Sections 7.3, 7.6, 10.5)', () => {
	it('normalises diacritics, punctuation, and clips cleanly at a hyphen boundary beyond 50% of maxLen', () => {
		expect(normaliseSlug('  Café & Options: Delta/Gamma Strategy!  ')).toBe(
			'cafe-options-delta-gamma-strategy'
		);

		const longText =
			'institutional-options-order-flow-and-gamma-exposure-hedging-playbook-for-active-traders';
		const clipped = normaliseSlug(longText, SLUG_MAX_LEN);
		expect(clipped.length).toBeLessThanOrEqual(SLUG_MAX_LEN);
		expect(clipped.endsWith('-')).toBe(false);
	});

	it('strips trailing stub words in generateSlug while keeping minimum slug length', () => {
		expect(generateSlug('Options Greeks Guide for the and with you')).toBe('options-greeks-guide');
		expect(generateSlug('in the')).toBe('in-the');
	});

	it('rejects reserved slugs and out-of-range lengths in isValidSlug', () => {
		expect(isReservedSlug('admin')).toBe(true);
		expect(isValidSlug('admin')).toBe(false);
		expect(isValidSlug('ab')).toBe(false);
		expect(isValidSlug('valid-trading-slug')).toBe(true);
	});

	it('computes rendered title with brand suffix only when total length stays within 60 chars', () => {
		const short = computeRenderedTitle('Options Greeks Guide');
		expect(short.brandAppended).toBe(true);
		expect(short.renderedTitle).toBe('Options Greeks Guide | Revolution Trading Pros');
		expect(short.length).toBeLessThanOrEqual(60);

		const long = computeRenderedTitle('Complete Institutional Guide to Options Delta and Gamma');
		expect(long.brandAppended).toBe(false);
		expect(long.renderedTitle).toBe('Complete Institutional Guide to Options Delta and Gamma');
	});

	it('evaluates category and tag indexability thresholds accurately', () => {
		expect(isCategoryIndexable(0)).toBe(false);
		expect(isCategoryIndexable(1)).toBe(false);
		expect(isCategoryIndexable(2)).toBe(true);

		expect(isTagIndexable(4, 20)).toBe(false);
		expect(isTagIndexable(5, 20)).toBe(true);
		expect(isTagIndexable(15, 20)).toBe(true); // 15 <= 0.75 * 20
		expect(isTagIndexable(16, 20)).toBe(false); // 16 > 0.75 * 20
	});
});
