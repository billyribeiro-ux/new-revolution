import { describe, expect, it } from 'vite-plus/test';
import { extractBreadcrumbNamesFromJsonLd, type JsonLdBlockResult } from '../tests/seo/crawler';

function breadcrumbBlock(names: unknown[]): JsonLdBlockResult[] {
	return [
		{
			raw: '',
			parsed: {
				'@graph': [{ '@type': 'BreadcrumbList', itemListElement: names.map((name) => ({ name })) }]
			},
			parseError: null,
			types: ['BreadcrumbList']
		}
	];
}

describe('SEO crawler breadcrumb names', () => {
	it('preserves the position and text of valid names', () => {
		expect(extractBreadcrumbNamesFromJsonLd(breadcrumbBlock([' Home ', 'About']))).toEqual([
			'Home',
			'About'
		]);
	});

	it.each([{}, null, undefined, 42, ''])(
		'refuses invalid names instead of silently dropping them: %j',
		(name) => {
			expect(() => extractBreadcrumbNamesFromJsonLd(breadcrumbBlock(['Home', name]))).toThrow(
				'BreadcrumbList items must have nonempty string names.'
			);
		}
	);
});
