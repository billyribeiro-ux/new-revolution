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

describe('shouldPreload (static font policy: zero font href preloads)', () => {
	const font = (file: string) => ({
		type: 'font',
		path: `/_app/immutable/assets/${file}`,
		filename: `src/lib/assets/fonts/${file}`
	});

	it('preloads scripts and styles only', () => {
		expect(shouldPreload({ type: 'js', path: '/_app/immutable/chunks/a.js' })).toBe(true);
		expect(shouldPreload({ type: 'css', path: '/_app/immutable/assets/a.css' })).toBe(true);
		expect(shouldPreload({ type: 'asset', path: '/_app/immutable/assets/logo.png' })).toBe(false);
	});

	it('never emits <link rel="preload" as="font" href="..."> for any font file', () => {
		expect(shouldPreload(font('geist-mono-latin-700-normal.woff2'))).toBe(false);
		expect(shouldPreload(font('geist-sans-latin-400-normal.woff2'))).toBe(false);
	});
});
