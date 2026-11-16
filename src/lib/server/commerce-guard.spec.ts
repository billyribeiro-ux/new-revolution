import { describe, expect, it } from 'vite-plus/test';
import { conceptCommerceResponse } from './commerce-guard';

describe('public concept commerce boundary', () => {
	it('blocks direct cart, checkout and payment requests regardless of nested endpoint', async () => {
		for (const path of [
			'/cart',
			'/checkout',
			'/checkout/session',
			'/api/checkout/session',
			'/api/payments',
			'/api/subscriptions/create',
			'/billing',
			'/subscribe'
		]) {
			const response = conceptCommerceResponse(path);
			expect(response?.status, path).toBe(403);
			expect(response?.headers.get('x-robots-tag')).toBe('noindex, nofollow');
			expect(response?.headers.get('cache-control')).toContain('no-store');
			expect(await response?.json()).toMatchObject({ code: 'CONCEPT_ONLY' });
		}
	});

	it('leaves educational pages, updates signup and administration available', () => {
		for (const path of [
			'/',
			'/blog',
			'/store/indicators',
			'/api/waitlist/signup',
			'/api/lead',
			'/admin/subscribers',
			'/subscription-guide'
		]) {
			expect(conceptCommerceResponse(path), path).toBeNull();
		}
	});
});
