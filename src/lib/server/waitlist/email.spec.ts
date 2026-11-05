import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { parseWaitlistUpdate, prepareEmail } from './email.ts';

afterEach(() => vi.unstubAllEnvs());

describe('waitlist email content', () => {
	it('rejects malformed, oversized and header-injected update messages', () => {
		for (const value of [
			null,
			[],
			{ subject: 'Missing body' },
			{ subject: 'Subject', body: 'Body', html: '<p>untrusted</p>' },
			{ subject: 'Subject\r\nBcc: other@example.com', body: 'Body' },
			{ subject: 's'.repeat(121), body: 'Body' },
			{ subject: 'Subject', body: 'b'.repeat(4001) },
			{ subject: 'Subject', body: ' ' },
			{ subject: 'Subject', body: String.fromCodePoint(0) }
		])
			expect(() => parseWaitlistUpdate(value)).toThrow();
	});
	it('requires explicit update consent when preparing an update', () => {
		vi.stubEnv('WAITLIST_FROM_EMAIL', 'desk@example.com');
		vi.stubEnv('WAITLIST_REPLY_TO', 'support@example.com');
		expect(() =>
			prepareEmail('member@example.com', 'update', '', 'token', {
				update: { subject: 'Progress', body: 'An update.' }
			})
		).toThrow('update consent');
	});
});
