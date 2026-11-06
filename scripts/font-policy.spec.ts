import { describe, expect, it } from 'vite-plus/test';
import { findFontPolicyViolations } from './font-policy.mjs';

describe('self-hosted font source policy', () => {
	it.each([
		[
			'<link href="https://fonts.googleapis.com/css2?family=Example" rel="stylesheet">',
			'external font provider reference'
		],
		['@font-face{src:url(https://assets.example.net/custom.woff2)}', 'external font file URL'],
		['@import url("//assets.example.net/typography.css");', 'external CSS import'],
		[
			'<link href="https://assets.example.net/style.css" rel="stylesheet">',
			'externally hosted stylesheet link'
		],
		["import '@fontsource-variable/montserrat/wght.css';", 'Fontsource import outside src/app.css'],
		[
			"selection.attr('font-family', 'Unregistered Display, sans-serif')",
			'chart font bypasses the shared font tokens'
		]
	])('rejects unsafe runtime input %s', (source, expected) => {
		expect(findFontPolicyViolations('src/lib/Example.svelte', source)).toContain(expected);
	});

	it('allows bundled font imports only at their owner and permits same-origin font preloads', () => {
		expect(
			findFontPolicyViolations('src/app.css', "@import '@fontsource-variable/montserrat/wght.css';")
		).toEqual([]);
		expect(
			findFontPolicyViolations(
				'src/routes/+layout.svelte',
				'<link rel="preload" as="font" href="/_app/immutable/assets/font.woff2" crossorigin="anonymous">'
			)
		).toEqual([]);
		expect(
			findFontPolicyViolations(
				'src/routes/watchlist/+page.svelte',
				"selection.attr('font-family', 'var(--font-mono)')"
			)
		).toEqual([]);
	});

	it('accepts absolute canonical-origin assets while rejecting an external lookalike host', () => {
		expect(
			findFontPolicyViolations(
				'src/app.css',
				'@font-face{src:url(https://www.revolutiontradingpros.com/_app/immutable/assets/font.woff2)}'
			)
		).toEqual([]);
		expect(
			findFontPolicyViolations(
				'src/app.css',
				'@import url("//www.revolutiontradingpros.com/typography.css");'
			)
		).toEqual([]);
		expect(
			findFontPolicyViolations(
				'src/app.html',
				'<link rel="stylesheet" href="https://www.revolutiontradingpros.com/typography.css">'
			)
		).toEqual([]);
		expect(
			findFontPolicyViolations(
				'src/app.css',
				'@font-face{src:url(https://www.revolutiontradingpros.com.example.net/font.woff2)}'
			)
		).toContain('external font file URL');
	});

	it('does not treat deliberately unsafe test fixtures as executable font imports', () => {
		expect(
			findFontPolicyViolations('src/example.spec.ts', 'https://fonts.googleapis.com/css2')
		).toEqual([]);
	});
});
