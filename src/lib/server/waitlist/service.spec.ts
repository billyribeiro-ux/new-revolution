import { beforeAll, afterAll, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { eq, sql } from 'drizzle-orm';
import { createTestDatabase, setActiveDbForTest, setSimulatedDbFailure } from '../db/index.ts';
import {
	waitlistSubscriptions as subs,
	waitlistOutbox as jobs,
	waitlistTokens as tokens
} from '../db/schema.ts';
import { signup, applyToken, processOutbox, recordEvent, queueLaunch } from './service.ts';
import { unseal, seal } from './crypto.ts';
import type { WaitlistEmail } from './email.ts';
import { signupHandler, tokenDocument } from './http.ts';
import type { RequestEvent } from '@sveltejs/kit';

describe('durable waitlist', () => {
	let env: Awaited<ReturnType<typeof createTestDatabase>>;
	const now = new Date('2026-11-04T12:00:00Z');
	beforeAll(async () => {
		env = await createTestDatabase();
		setActiveDbForTest(env.db, env.client);
	});
	afterAll(async () => {
		vi.unstubAllEnvs();
		await env.cleanup();
	});
	beforeEach(async () => {
		vi.stubEnv('WAITLIST_ENCRYPTION_KEY', 'ab'.repeat(32));
		vi.stubEnv('WAITLIST_RATE_LIMIT_KEY', 'rate-key-'.repeat(8));
		vi.stubEnv('WAITLIST_FROM_EMAIL', 'desk@example.com');
		vi.stubEnv('WAITLIST_REPLY_TO', 'support@example.com');
		await env.db.execute(
			sql`TRUNCATE waitlist_subscriptions,waitlist_email_outbox,waitlist_tokens,waitlist_abuse_buckets,waitlist_delivery_events,email_suppressions CASCADE`
		);
	});
	async function challenge(email = 'person@example.com') {
		const id = await signup(email, '127.0.0.1', now);
		const [job] = await env.db.select().from(jobs).where(eq(jobs.id, id!));
		const payload: WaitlistEmail = JSON.parse(unseal(job.ciphertext!, job.id));
		return {
			job,
			payload,
			token: new URL(payload.text.match(/Confirm email: (\S+)/)![1]).searchParams.get('token')!
		};
	}
	it('normalizes and deduplicates concurrent subscriptions and freezes encrypted HTML/text payloads', async () => {
		const { job, payload } = await challenge(' Person@Example.com ');
		await Promise.all([
			signup('person@example.com', '2', now),
			signup('person@example.com', '3', now)
		]);
		expect(await env.db.select().from(subs)).toHaveLength(1);
		expect(await env.db.select().from(jobs)).toHaveLength(1);
		expect(job.ciphertext).not.toContain('person@example.com');
		expect(payload.html).toContain('Confirm my email address');
		expect(payload.text).toContain('24 hours');
		expect(() => unseal(job.ciphertext!, 'another-row')).toThrow();
	});
	it('rolls back the entire signup if encryption fails', async () => {
		vi.stubEnv('WAITLIST_ENCRYPTION_KEY', '');
		await expect(signup('a@example.com', '1', now)).rejects.toThrow();
		expect(await env.db.select().from(subs)).toHaveLength(0);
		expect(await env.db.select().from(tokens)).toHaveLength(0);
		expect(await env.db.select().from(jobs)).toHaveLength(0);
	});
	it('GET confirmation is read-only; POST consumes the challenge and queues one receipt', async () => {
		const c = await challenge();
		const before = await env.db.select().from(tokens);
		expect(
			tokenDocument(new URL(`https://example.com/waitlist/confirm?token=${c.token}`), 'confirm')
				.status
		).toBe(200);
		expect(await env.db.select().from(tokens)).toEqual(before);
		await applyToken(c.token, 'confirm', now);
		await expect(applyToken(c.token, 'confirm', now)).rejects.toThrow('already been used');
		expect((await env.db.select().from(subs))[0].status).toBe('confirmed');
		expect((await env.db.select().from(jobs)).filter((j) => j.purpose === 'receipt')).toHaveLength(
			1
		);
	});
	it('rejects malformed, expired, and wrong-purpose tokens', async () => {
		const c = await challenge();
		await expect(applyToken('malformed', 'confirm', now)).rejects.toThrow();
		await expect(applyToken(c.token, 'unsubscribe', now)).rejects.toThrow();
		await expect(
			applyToken(c.token, 'confirm', new Date(now.getTime() + 86400001))
		).rejects.toThrow();
	});
	it('retains provider failures and retries the identical payload/key inside the safe window', async () => {
		const { job } = await challenge();
		const calls: { payload: WaitlistEmail; key: string }[] = [];
		const send = vi.fn(async (payload: WaitlistEmail, key: string) => {
			calls.push({ payload, key });
			if (calls.length === 1) throw new Error('outage');
			return 'provider-1';
		});
		expect((await processOutbox(send, { now })).retry).toBe(1);
		expect((await env.db.select().from(jobs))[0].state).toBe('pending');
		expect((await processOutbox(send, { now: new Date(now.getTime() + 3600000) })).sent).toBe(1);
		expect(calls[1]).toEqual(calls[0]);
		expect(calls[0].key).toBe(job.deliveryKey);
	});
	it('claims jobs atomically across concurrent workers', async () => {
		await challenge();
		const send = vi.fn(async () => 'provider-concurrent');
		await Promise.all([processOutbox(send, { now }), processOutbox(send, { now })]);
		expect(send).toHaveBeenCalledTimes(1);
	});
	it('requires review for ambiguous delivery outside the provider idempotency window', async () => {
		await challenge();
		await processOutbox(
			async () => {
				throw new Error('lost response');
			},
			{ now }
		);
		const send = vi.fn(async () => 'must-not-send');
		expect(
			(await processOutbox(send, { now: new Date(now.getTime() + 23 * 3600000) })).review
		).toBe(1);
		expect(send).not.toHaveBeenCalled();
	});
	it('handles early and out-of-order events without resurrecting suppressed subscribers', async () => {
		await challenge();
		await recordEvent('bounce-first', 'early-provider', 'bounced');
		await processOutbox(async () => 'early-provider', { now });
		await recordEvent('late-delivered', 'early-provider', 'delivered');
		await recordEvent('bounce-first', 'early-provider', 'bounced');
		expect((await env.db.select().from(subs))[0].status).toBe('suppressed');
		expect((await env.db.select().from(jobs))[0].deliveryState).toBe('suppressed');
		await signup('person@example.com', 'another', now);
		expect(await env.db.select().from(jobs)).toHaveLength(1);
	});
	it('unsubscribe cancels pending jobs and cannot be cleared by public signup', async () => {
		const c = await challenge();
		const url = new URL(c.payload.text.match(/Unsubscribe: (\S+)/)![1]);
		await applyToken(url.searchParams.get('token')!, 'unsubscribe', now);
		await signup('person@example.com', '2', now);
		expect((await env.db.select().from(subs))[0].status).toBe('unsubscribed');
		const send = vi.fn(async () => 'never');
		await processOutbox(send, { now });
		expect(send).not.toHaveBeenCalled();
	});
	it('launch is dry-run-first and campaign jobs deduplicate', async () => {
		const c = await challenge();
		await applyToken(c.token, 'confirm', now);
		expect(await queueLaunch('reopening')).toEqual({ eligible: 1, committed: false });
		expect(await env.db.select().from(jobs)).toHaveLength(2);
		await queueLaunch('reopening', true);
		await queueLaunch('reopening', true);
		expect((await env.db.select().from(jobs)).filter((j) => j.purpose === 'launch')).toHaveLength(
			1
		);
	});
	it('enforces durable IP limits', async () => {
		for (let i = 0; i < 5; i++) await signup(`p${i}@example.com`, 'same-ip', now);
		await expect(signup('p6@example.com', 'same-ip', now)).rejects.toMatchObject({
			status: 429,
			retryAfter: 900
		});
	});
	it('returns 503 without a false saved-success on database failure', async () => {
		vi.stubEnv('WAITLIST_SIGNUPS_ENABLED', 'true');
		setSimulatedDbFailure(new Error('offline'));
		try {
			const request = new Request('https://revolutiontradingpros.com/api/waitlist/signup', {
				method: 'POST',
				headers: {
					origin: 'https://revolutiontradingpros.com',
					accept: 'application/json',
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					email: 'p@example.com',
					consent: true,
					consentVersion: 'reopening-2026-11-04'
				})
			});
			const response = await signupHandler({
				request,
				getClientAddress: () => '1'
			} as RequestEvent);
			expect(response.status).toBe(503);
			expect(await response.json()).not.toHaveProperty('accepted');
		} finally {
			setSimulatedDbFailure(null);
		}
	});
	it('fails closed for cross-origin forms and oversized input', async () => {
		vi.stubEnv('WAITLIST_SIGNUPS_ENABLED', 'true');
		for (const [origin, body, status] of [
			['https://evil.example', '{}', 403],
			['https://revolutiontradingpros.com', 'x'.repeat(4097), 413]
		] as const) {
			const request = new Request('https://revolutiontradingpros.com/api/waitlist/signup', {
				method: 'POST',
				headers: { origin, 'content-type': 'application/json', accept: 'application/json' },
				body
			});
			expect(
				(await signupHandler({ request, getClientAddress: () => '1' } as RequestEvent)).status
			).toBe(status);
		}
	});
	it('native signup returns a saved receipt without JavaScript while email is unavailable', async () => {
		vi.stubEnv('WAITLIST_SIGNUPS_ENABLED', 'true');
		vi.stubEnv('RESEND_API_KEY', '');
		const request = new Request('https://revolutiontradingpros.com/api/waitlist/signup', {
			method: 'POST',
			headers: {
				origin: 'https://revolutiontradingpros.com',
				'content-type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				email: 'native@example.test',
				consent: 'on',
				consentVersion: 'reopening-2026-11-04'
			})
		});
		const response = await signupHandler({
			request,
			getClientAddress: () => 'native-ip'
		} as RequestEvent);
		expect(response.status).toBe(202);
		expect(response.headers.get('cache-control')).toContain('no-store');
		expect(await response.text()).toContain('Request saved');
		expect((await env.db.select().from(jobs))[0].state).toBe('pending');
	});
	it('encryption round-trips and rejects altered ciphertext', () => {
		const value = seal('secret', 'row');
		expect(unseal(value, 'row')).toBe('secret');
		expect(() => unseal(value.replace(/.$/, '!'), 'row')).toThrow();
	});
});
