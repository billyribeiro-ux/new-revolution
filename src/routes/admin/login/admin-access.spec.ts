import { describe, expect, it } from 'vitest';
import { decideAdminAccess, ADMIN_LOGIN_PATH } from './admin-access.ts';

const admin = { name: 'Billy Ribeiro', email: 'owner@example.com', role: 'admin' };

describe('decideAdminAccess', () => {
	it('leaves the login route public, even without a user', () => {
		expect(
			decideAdminAccess({
				routeId: '/admin/login',
				pathname: '/admin/login',
				search: '?next=%2Fadmin',
				user: null
			})
		).toEqual({ kind: 'public' });
	});

	it('redirects an anonymous visitor to login with the full path and query as next', () => {
		expect(
			decideAdminAccess({
				routeId: '/admin/posts/[id]',
				pathname: '/admin/posts/12',
				search: '?tab=seo&x=a b',
				user: null
			})
		).toEqual({
			kind: 'redirect',
			location: `${ADMIN_LOGIN_PATH}?next=${encodeURIComponent('/admin/posts/12?tab=seo&x=a b')}`
		});
	});

	it('forbids a signed-in user whose role is not admin', () => {
		expect(
			decideAdminAccess({
				routeId: '/admin',
				pathname: '/admin',
				search: '',
				user: { name: 'Reader', email: 'r@example.com', role: 'user' }
			})
		).toEqual({ kind: 'forbidden' });
	});

	it('forbids a signed-in user with no role value', () => {
		expect(
			decideAdminAccess({
				routeId: '/admin',
				pathname: '/admin',
				search: '',
				user: { name: 'No Role', email: 'n@example.com' }
			})
		).toEqual({ kind: 'forbidden' });
	});

	it('allows an admin and returns only name and email', () => {
		expect(
			decideAdminAccess({
				routeId: '/admin/media',
				pathname: '/admin/media',
				search: '',
				user: admin
			})
		).toEqual({ kind: 'allow', admin: { name: 'Billy Ribeiro', email: 'owner@example.com' } });
	});

	it('guards an unmatched route id like any other admin page', () => {
		expect(
			decideAdminAccess({ routeId: null, pathname: '/admin/nope', search: '', user: null }).kind
		).toBe('redirect');
	});
});
