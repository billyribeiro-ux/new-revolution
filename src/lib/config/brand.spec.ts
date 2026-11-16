import { describe, expect, it } from 'vite-plus/test';
import { BRAND, resolveBrandName, resolveBrandShortName, resolveIsProduction } from './brand.ts';
import { resolveSiteOrigin } from '#lib/shared/site-origin.ts';

describe('BRAND SSOT & Zero-Leak Staging Shield', () => {
	it('locks verified founder, methodology, and Goldman Sachs GSSG / Mount Kellett lineage', () => {
		expect(BRAND.methodology).toBe('The Move Prior to The Move™');
		expect(BRAND.founder.name).toBe('Billy Ribeiro');
		expect(BRAND.founder.legalName).toBe('Welber "Billy" Ribeiro');
		expect(BRAND.founder.mentorshipLineage).toContain(
			'Goldman Sachs Global Special Situations Group'
		);
		expect(BRAND.founder.mentorshipLineage).toContain('Mount Kellett Capital Management');
		expect(BRAND.founder.mentorshipLineage.toLowerCase()).not.toContain('prop');
		expect(BRAND.founder.corroborationUrls).toContain(
			'https://www.tradinggreats.com/traders/billy-ribeiro'
		);
		expect(BRAND.philosophyQuotes).toEqual([
			'I do not use indicators, I use my system.',
			'I trade the charts and not the noise.',
			'I buy into weakness and sell into strength.'
		]);
	});

	it('resolves dynamic brand name, initials, site origin, and fail-closed production flag', () => {
		expect(resolveBrandName('Placeholder Desk')).toBe('Placeholder Desk');
		expect(resolveBrandShortName('Placeholder Desk')).toBe('PD');
		expect(resolveSiteOrigin('https://example.org///')).toBe('https://example.org');
		expect(resolveIsProduction(undefined)).toBe(false);
		expect(resolveIsProduction('development')).toBe(false);
		expect(resolveIsProduction('staging')).toBe(false);
		expect(resolveIsProduction('production')).toBe(true);
		expect(resolveIsProduction('PRODUCTION')).toBe(true);
	});
});
