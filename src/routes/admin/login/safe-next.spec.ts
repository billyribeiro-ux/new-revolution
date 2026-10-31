import { describe, expect, it } from 'vitest';
import { ADMIN_HOME_PATH, safeAdminNext } from './safe-next.ts';

describe('safeAdminNext', () => {
	it.each([
		['/admin'],
		['/admin/'],
		['/admin/posts'],
		['/admin/posts/new'],
		['/admin/posts/12?tab=seo'],
		['/admin/media#top']
	])('accepts the same-origin admin path %s unchanged', (input) => {
		expect(safeAdminNext(input)).toBe(input);
	});

	it.each([
		['null', null],
		['undefined', undefined],
		['empty string', ''],
		['no leading slash', 'admin'],
		['absolute https URL', 'https://evil.com'],
		['javascript: URL', 'javascript:alert(1)'],
		['protocol-relative //', '//evil.com'],
		['triple slash', '///evil.com'],
		['backslash after slash', '/\\evil.com'],
		['double backslash', '/\\/evil.com'],
		['leading backslashes', '\\\\evil.com'],
		['tab trick that browsers turn into //', '/\t/evil.com'],
		['newline inside', '/admin\nx'],
		['leading space', ' /admin'],
		['dot-dot escape from admin', '/admin/../x'],
		['trailing dot-dot', '/admin/..'],
		['single dot segment', '/admin/./x'],
		['encoded slash and dot-dot', '/admin%2F..%2Fx'],
		['encoded dots', '/admin%2e%2e/x'],
		['encoded backslash', '/admin%5c..'],
		['prefix that is not the admin segment', '/adminx'],
		['public blog path', '/blog'],
		['site root', '/'],
		['colon in query (rule: no colon)', '/admin?next=https://evil.com']
	])('rejects %s and falls back to /admin', (_label, input) => {
		expect(safeAdminNext(input)).toBe(ADMIN_HOME_PATH);
		expect(ADMIN_HOME_PATH).toBe('/admin');
	});
});
