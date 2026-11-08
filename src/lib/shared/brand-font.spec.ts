import { describe, expect, it } from 'vite-plus/test';
import { normalizeBrandFont, BRAND_FONT_BODY, BRAND_FONT_DISPLAY } from './brand-font';
import { sanitizePostHtml } from '../sanitize-post-html';

describe('two brand font roles', () => {
	it.each([
		["'Plus Jakarta Sans Variable', system-ui, sans-serif", BRAND_FONT_DISPLAY],
		['Plus Jakarta Sans', BRAND_FONT_DISPLAY],
		['"Inter", Arial, sans-serif', BRAND_FONT_BODY],
		['Inter Variable', BRAND_FONT_BODY],
		[BRAND_FONT_DISPLAY, BRAND_FONT_DISPLAY],
		[BRAND_FONT_BODY, BRAND_FONT_BODY]
	])('normalizes supported legacy input %s', (input, expected) => {
		expect(normalizeBrandFont(input)).toBe(expected);
	});
	it.each([
		'Georgia',
		'ui-monospace',
		'system-ui',
		'var(--external)',
		'Helvetica; color:red',
		'url(https://example.net/font)',
		'Helvetica/*x*/',
		null
	])('rejects unsupported input %s', (input) => {
		expect(normalizeBrandFont(input)).toBeNull();
	});
	it('preserves content and other formatting while dropping unsupported families', () => {
		const source =
			'<p><span style="font-family: Georgia; color: #123456; font-size: 18px">Authored text</span></p>';
		const clean = sanitizePostHtml(source);
		expect(clean).toContain('Authored text');
		expect(clean).toContain('color: #123456');
		expect(clean).toContain('font-size: 18px');
		expect(clean).not.toContain('font-family');
		expect(sanitizePostHtml(clean)).toBe(clean);
	});
	it('retains only exact brand variables without admitting arbitrary CSS functions', () => {
		const clean = sanitizePostHtml(
			'<p><span style="font-family: var(--font-display); color: #123456">Display</span><span style="font-family: var(--external); font-size: 18px">Body</span></p>'
		);
		expect(clean).toContain('font-family: var(--font-display)');
		expect(clean).not.toContain('--external');
		expect(clean).toContain('font-size: 18px');
	});
});
