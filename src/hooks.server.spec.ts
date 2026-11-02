import { describe, expect, it } from 'vite-plus/test';
import { isNonProductionHost, shouldPreload } from './hooks.server';

describe('isNonProductionHost (IDX-09)', () => {
	it('flags preview and staging hosts', () => {
		expect(isNonProductionHost('my-app-git-x.vercel.app')).toBe(true);
		expect(isNonProductionHost('staging.revolutiontradingpros.com')).toBe(true);
		expect(isNonProductionHost('preview.revolutiontradingpros.com')).toBe(true);
	});

	it('leaves the production host alone', () => {
		expect(isNonProductionHost('revolutiontradingpros.com')).toBe(false);
	});
});

describe('shouldPreload (PERF-05: font preload budget)', () => {
	const font = (file: string) => ({
		type: 'font',
		path: `/_app/immutable/assets/${file}`,
		filename: `node_modules/@fontsource-variable/x/files/${file.replace(/\.[A-Za-z0-9_-]{8}\./, '.')}`
	});

	it('still preloads scripts and styles', () => {
		expect(shouldPreload({ type: 'js', path: '/_app/immutable/chunks/a.js' })).toBe(true);
		expect(shouldPreload({ type: 'css', path: '/_app/immutable/assets/a.css' })).toBe(true);
		expect(shouldPreload({ type: 'asset', path: '/_app/immutable/assets/logo.png' })).toBe(false);
	});

	it('preloads exactly the two upright Latin faces', () => {
		expect(shouldPreload(font('montserrat-latin-wght-normal.l_AIctKy.woff2'))).toBe(true);
		expect(shouldPreload(font('sofia-sans-latin-wght-normal.B9fg0t1U.woff2'))).toBe(true);
	});

	it.each([
		'montserrat-latin-ext-wght-normal.BsZE-iaG.woff2',
		'montserrat-cyrillic-wght-normal.EAA9jha_.woff2',
		'montserrat-cyrillic-ext-wght-normal.CO5hGrJv.woff2',
		'montserrat-vietnamese-wght-normal.k7S-YeeD.woff2',
		'montserrat-latin-wght-italic.jzfX-GOl.woff2',
		'sofia-sans-greek-wght-normal.BVXOQ11m.woff2',
		'sofia-sans-latin-ext-wght-normal.WAXdtJoO.woff2',
		'sofia-sans-latin-wght-italic.BgGMKfL-.woff2'
	])('does not preload %s (fetched on demand via unicode-range)', (file) => {
		expect(shouldPreload(font(file))).toBe(false);
	});
});
