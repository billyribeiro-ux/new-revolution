import { beforeAll, afterAll, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { eq, sql } from 'drizzle-orm';
import { createTestDatabase, setActiveDbForTest, setSimulatedDbFailure } from '../db/index.ts';
import {
	waitlistSubscriptions as subs,
	waitlistOutbox as jobs,
	waitlistTokens as tokens,
	emailSuppressions
} from '../db/schema.ts';
import {
	CONSENT_VERSION,
	signup,
	applyToken,
	processOutbox,
	recordEvent,
	queueLaunch,
	queueUpdate
} from './service.ts';
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
		expect(payload.text).toContain('Thank you for requesting a spot');
		expect(payload.text).toContain('You are not subscribed until you confirm.');
		expect(payload.text).toContain('occasional launch updates');
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
		const receiptId = await applyToken(c.token, 'confirm', now);
		await expect(applyToken(c.token, 'confirm', now)).rejects.toThrow('already been used');
		expect((await env.db.select().from(subs))[0].status).toBe('confirmed');
		expect((await env.db.select().from(jobs)).filter((j) => j.purpose === 'receipt')).toHaveLength(
			1
		);
		const [receipt] = await env.db.select().from(jobs).where(eq(jobs.purpose, 'receipt'));
		expect(receiptId).toBe(receipt.id);
		const payload: WaitlistEmail = JSON.parse(unseal(receipt.ciphertext!, receipt.id));
		expect(payload.text).toContain('Thank you for joining');
		expect(payload.text).toContain('Your email address is confirmed.');
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
	it('preserves legacy reopening-only consent on resubmission and in its confirmation receipt', async () => {
		const c = await challenge();
		await env.db.update(subs).set({ consentVersion: 'reopening-2026-11-04' });
		await signup('person@example.com', 'another-ip', now);
		expect((await env.db.select().from(subs))[0].consentVersion).toBe('reopening-2026-11-04');
		await applyToken(c.token, 'confirm', now);
		const [receipt] = await env.db.select().from(jobs).where(eq(jobs.purpose, 'receipt'));
		const payload: WaitlistEmail = JSON.parse(unseal(receipt.ciphertext!, receipt.id));
		expect(payload.text).toContain('our reopening notification');
		expect(payload.text).not.toContain('launch updates');
		expect(await queueUpdate('progress', { subject: 'Progress', body: 'An update.' })).toEqual({
			eligible: 0,
			committed: false
		});
		expect(await queueLaunch('reopening')).toEqual({ eligible: 1, committed: false });
	});
	it('queues updates only for confirmed update consent, defaults to dry-run, and freezes escaped content', async () => {
		await env.db.insert(subs).values([
			{
				id: 'eligible',
				email: 'new@example.com',
				status: 'confirmed',
				consentVersion: CONSENT_VERSION
			},
			{
				id: 'legacy',
				email: 'old@example.com',
				status: 'confirmed',
				consentVersion: 'reopening-2026-11-04'
			},
			{ id: 'pending', email: 'pending@example.com', consentVersion: CONSENT_VERSION },
			{
				id: 'unsubscribed',
				email: 'out@example.com',
				status: 'unsubscribed',
				consentVersion: CONSENT_VERSION
			},
			{
				id: 'suppressed',
				email: 'bad@example.com',
				status: 'confirmed',
				consentVersion: CONSENT_VERSION
			}
		]);
		await env.db
			.insert(emailSuppressions)
			.values({ email: 'bad@example.com', reason: 'test-bounce' });
		const content = {
			subject: 'Launch <progress>',
			body: 'Thanks for waiting.\n\n<script>alert("x")</script> & more'
		};
		expect(await queueUpdate('progress-1', content)).toEqual({ eligible: 1, committed: false });
		expect(await env.db.select().from(jobs)).toHaveLength(0);
		expect(await env.db.select().from(tokens)).toHaveLength(0);
		await Promise.all([
			queueUpdate('progress-1', content, true),
			queueUpdate('progress-1', content, true)
		]);
		const [job] = await env.db.select().from(jobs);
		expect(await env.db.select().from(jobs)).toHaveLength(1);
		expect(job).toMatchObject({
			purpose: 'update',
			subscriptionId: 'eligible',
			deliveryKey: 'update:progress-1:eligible'
		});
		const payload: WaitlistEmail = JSON.parse(unseal(job.ciphertext!, job.id));
		expect(payload.subject).toBe(content.subject);
		expect(payload.text).toContain(content.body);
		expect(payload.html).toContain('Launch &lt;progress&gt;');
		expect(payload.html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; more');
		expect(payload.html).not.toContain('<script>');
		expect(payload.headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
		await queueUpdate('progress-1', { subject: 'Changed', body: 'Changed' }, true);
		expect((await env.db.select().from(jobs))[0].ciphertext).toBe(job.ciphertext);
	});
	it('rechecks update consent and global suppression immediately before delivery', async () => {
		await env.db.insert(subs).values([
			{
				id: 'consent',
				email: 'consent@example.com',
				status: 'confirmed',
				consentVersion: CONSENT_VERSION
			},
			{
				id: 'suppression',
				email: 'suppression@example.com',
				status: 'confirmed',
				consentVersion: CONSENT_VERSION
			}
		]);
		await queueUpdate('progress', { subject: 'Progress', body: 'An update.' }, true);
		await env.db
			.update(subs)
			.set({ consentVersion: 'reopening-2026-11-04' })
			.where(eq(subs.id, 'consent'));
		await env.db
			.insert(emailSuppressions)
			.values({ email: 'suppression@example.com', reason: 'test-bounce' });
		const send = vi.fn(async () => 'must-not-send');
		expect((await processOutbox(send)).cancelled).toBe(2);
		expect(send).not.toHaveBeenCalled();
	});
	it('honors an update email unsubscribe link and blocks future update campaigns', async () => {
		await env.db.insert(subs).values({
			id: 'member',
			email: 'member@example.com',
			status: 'confirmed',
			consentVersion: CONSENT_VERSION
		});
		await queueUpdate('progress', { subject: 'Progress', body: 'An update.' }, true);
		const [job] = await env.db.select().from(jobs);
		const payload: WaitlistEmail = JSON.parse(unseal(job.ciphertext!, job.id));
		const optOut = new URL(payload.text.match(/Unsubscribe: (\S+)/)![1]);
		await applyToken(optOut.searchParams.get('token')!, 'unsubscribe');
		expect((await env.db.select().from(jobs))[0]).toMatchObject({
			state: 'cancelled',
			ciphertext: null
		});
		expect(
			await queueUpdate('progress-2', { subject: 'Progress', body: 'An update.' }, true)
		).toEqual({ eligible: 0, committed: true });
		const send = vi.fn(async () => 'must-not-send');
		await processOutbox(send);
		expect(send).not.toHaveBeenCalled();
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
					consentVersion: CONSENT_VERSION
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
				consentVersion: CONSENT_VERSION
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
