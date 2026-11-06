import { describe, expect, it } from 'vite-plus/test';
import { normalizeBrandFont, BRAND_FONT_BODY, BRAND_FONT_DISPLAY } from './brand-font';
import { sanitizePostHtml } from '../sanitize-post-html';

describe('two brand font roles', () => {
	it.each([
		["'Montserrat Variable', system-ui, sans-serif", BRAND_FONT_DISPLAY],
		['Montserrat', BRAND_FONT_DISPLAY],
		['"Sofia Sans", Arial, sans-serif', BRAND_FONT_BODY],
		['Sofia Sans Variable', BRAND_FONT_BODY],
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
		'Montserrat; color:red',
		'url(https://example.net/font)',
		'Montserrat/*x*/',
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
