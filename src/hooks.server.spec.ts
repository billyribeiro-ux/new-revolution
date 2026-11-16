import { describe, expect, it } from 'vite-plus/test';
import {
	isNonProductionHost,
	resolveRobotsAndSecurityHeaders,
	shouldPreload
} from './hooks.server';

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

describe('resolveRobotsAndSecurityHeaders (Zero-Leak Staging Shield)', () => {
	it('emits noindex, nofollow, noarchive, nosnippet when PUBLIC_ENV !== "production"', () => {
		const headers = resolveRobotsAndSecurityHeaders({
			pathname: '/methodology',
			hostname: 'www.revolutiontradingpros.com',
			status: 200,
			isProduction: false,
			existingRobotsTag: null
		});
		expect(headers['X-Robots-Tag']).toBe('noindex, nofollow, noarchive, nosnippet');
		expect(headers['Strict-Transport-Security']).toBeUndefined();
	});

	it('emits index, follow + max-snippet/image/video + HSTS on indexable production routes', () => {
		const headers = resolveRobotsAndSecurityHeaders({
			pathname: '/methodology',
			hostname: 'www.revolutiontradingpros.com',
			status: 200,
			isProduction: true,
			existingRobotsTag: null
		});
		expect(headers['X-Robots-Tag']).toBe(
			'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
		);
		expect(headers['Strict-Transport-Security']).toBe(
			'max-age=63072000; includeSubDomains; preload'
		);
	});

	it('keeps noindex, nofollow on non-indexable routes and 404 responses even in production', () => {
		expect(
			resolveRobotsAndSecurityHeaders({
				pathname: '/admin/login',
				hostname: 'www.revolutiontradingpros.com',
				status: 200,
				isProduction: true,
				existingRobotsTag: null
			})['X-Robots-Tag']
		).toBe('noindex, nofollow');

		expect(
			resolveRobotsAndSecurityHeaders({
				pathname: '/unknown-page',
				hostname: 'www.revolutiontradingpros.com',
				status: 404,
				isProduction: true,
				existingRobotsTag: null
			})['X-Robots-Tag']
		).toBe('noindex, nofollow');
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
