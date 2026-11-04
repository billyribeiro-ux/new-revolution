import { randomUUID } from 'node:crypto';
import { and, eq, gt, isNull, lt, lte, or, sql } from 'drizzle-orm';
import { ensureDbReady, type AppDatabase } from '../db/index.ts';
import {
	emailSuppressions,
	waitlistSubscriptions as subs,
	waitlistTokens as tokens,
	waitlistOutbox as jobs,
	waitlistBuckets as buckets,
	waitlistEvents as events
} from '../db/schema.ts';
import { newToken, privateBucket, seal, tokenHash, unseal } from './crypto.ts';
import { prepareEmail, type WaitlistEmail } from './email.ts';
export const CONSENT_VERSION = 'reopening-2026-11-04';
export const CONSENT_TEXT = 'Email me when Revolution Trading Pros reopens. Unsubscribe anytime.';
type Tx = Parameters<Parameters<AppDatabase['transaction']>[0]>[0];
export class WaitlistError extends Error {
	status: number;
	retryAfter?: number;
	constructor(status: number, message: string, retryAfter?: number) {
		super(message);
		this.status = status;
		this.retryAfter = retryAfter;
	}
}
async function suppressed(tx: Tx, email: string) {
	return (
		(await tx.select().from(emailSuppressions).where(eq(emailSuppressions.email, email)).limit(1))
			.length > 0
	);
}
async function bucket(
	tx: Tx,
	purpose: string,
	value: string,
	limit: number,
	duration: number,
	now: Date
) {
	const start = Math.floor(now.getTime() / duration) * duration;
	const expiresAt = new Date(start + duration);
	const key = privateBucket(purpose, `${value}:${start}`);
	const [row] = await tx
		.insert(buckets)
		.values({ key, count: 1, expiresAt })
		.onConflictDoUpdate({ target: buckets.key, set: { count: sql`${buckets.count} + 1` } })
		.returning();
	return {
		allowed: row.count <= limit,
		retryAfter: Math.ceil((expiresAt.getTime() - now.getTime()) / 1000)
	};
}
async function token(
	tx: Tx,
	subscriptionId: string,
	purpose: 'confirm' | 'unsubscribe',
	now: Date
) {
	const raw = newToken();
	await tx.insert(tokens).values({
		hash: tokenHash(raw),
		subscriptionId,
		purpose,
		expiresAt: new Date(now.getTime() + (purpose === 'confirm' ? 86400000 : 10 * 365 * 86400000))
	});
	return raw;
}
async function enqueue(
	tx: Tx,
	sub: typeof subs.$inferSelect,
	purpose: 'confirm' | 'receipt' | 'launch',
	key: string,
	now: Date,
	challenge = ''
) {
	const unsubscribe = await token(tx, sub.id, 'unsubscribe', now),
		id = randomUUID();
	const payload = prepareEmail(sub.email, purpose, challenge, unsubscribe);
	await tx
		.insert(jobs)
		.values({
			id,
			subscriptionId: sub.id,
			purpose,
			deliveryKey: key,
			ciphertext: seal(JSON.stringify(payload), id),
			nextAttemptAt: now,
			createdAt: now
		})
		.onConflictDoNothing({ target: jobs.deliveryKey });
	return id;
}
export async function signup(
	emailInput: string,
	ip: string,
	now = new Date()
): Promise<string | null> {
	const email = emailInput.trim().toLowerCase();
	if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email))
		throw new WaitlistError(400, 'Enter a valid email address.');
	const db = await ensureDbReady();
	const rate = await db.transaction((tx) => bucket(tx, 'ip', ip, 5, 900000, now));
	if (!rate.allowed)
		throw new WaitlistError(429, 'Please wait before trying again.', rate.retryAfter);
	return db.transaction(async (tx) => {
		await tx
			.insert(subs)
			.values({ id: randomUUID(), email, consentVersion: CONSENT_VERSION, createdAt: now })
			.onConflictDoNothing({ target: subs.email });
		const [sub] = await tx.select().from(subs).where(eq(subs.email, email)).for('update');
		if (sub.status !== 'pending' || (await suppressed(tx, email))) return null;
		const active = await tx
			.select()
			.from(tokens)
			.where(
				and(
					eq(tokens.subscriptionId, sub.id),
					eq(tokens.purpose, 'confirm'),
					gt(tokens.expiresAt, now),
					isNull(tokens.consumedAt)
				)
			)
			.limit(1);
		if (active.length) return null;
		const cooldown = await bucket(tx, 'email-short', email, 1, 900000, now);
		const daily = await bucket(tx, 'email-day', email, 3, 86400000, now);
		if (!cooldown.allowed || !daily.allowed) return null;
		const raw = await token(tx, sub.id, 'confirm', now);
		return enqueue(tx, sub, 'confirm', `confirm:${tokenHash(raw)}`, now, raw);
	});
}
export async function applyToken(
	raw: string,
	purpose: 'confirm' | 'unsubscribe',
	now = new Date()
): Promise<void> {
	if (!/^[A-Za-z0-9_-]{43}$/.test(raw))
		throw new WaitlistError(400, 'This link is invalid or has expired.');
	const db = await ensureDbReady();
	await db.transaction(async (tx) => {
		const [found] = await tx
			.select()
			.from(tokens)
			.where(
				and(eq(tokens.hash, tokenHash(raw)), eq(tokens.purpose, purpose), gt(tokens.expiresAt, now))
			)
			.limit(1);
		if (!found) throw new WaitlistError(400, 'This link is invalid or has expired.');
		const [sub] = await tx
			.select()
			.from(subs)
			.where(eq(subs.id, found.subscriptionId))
			.for('update');
		const [used] = await tx
			.update(tokens)
			.set({ consumedAt: now })
			.where(and(eq(tokens.hash, found.hash), isNull(tokens.consumedAt)))
			.returning();
		if (!used) {
			if (purpose === 'unsubscribe') return;
			throw new WaitlistError(400, 'This confirmation link has already been used.');
		}
		if (purpose === 'unsubscribe') {
			await tx
				.update(subs)
				.set({ status: 'unsubscribed', unsubscribedAt: now })
				.where(eq(subs.id, sub.id));
			await tx
				.update(jobs)
				.set({ state: 'cancelled', ciphertext: null })
				.where(and(eq(jobs.subscriptionId, sub.id), eq(jobs.state, 'pending')));
			return;
		}
		if (sub.status !== 'pending' || (await suppressed(tx, sub.email)))
			throw new WaitlistError(400, 'This request can no longer be confirmed.');
		await tx.update(subs).set({ status: 'confirmed', confirmedAt: now }).where(eq(subs.id, sub.id));
		await enqueue(tx, sub, 'receipt', `receipt:${sub.id}`, now);
	});
}
export type Sender = (payload: WaitlistEmail, key: string) => Promise<string>;
export async function processOutbox(
	send: Sender,
	options: { now?: Date; limit?: number; jobId?: string } = {}
) {
	const now = options.now ?? new Date(),
		db = await ensureDbReady();
	const due = await db
		.select()
		.from(jobs)
		.where(
			and(
				eq(jobs.state, 'pending'),
				lte(jobs.nextAttemptAt, now),
				or(isNull(jobs.leaseUntil), lte(jobs.leaseUntil, now)),
				options.jobId ? eq(jobs.id, options.jobId) : undefined
			)
		)
		.limit(Math.min(options.limit ?? 20, 50));
	const result = { sent: 0, retry: 0, review: 0, cancelled: 0 };
	for (const candidate of due) {
		const lease = randomUUID();
		const [job] = await db
			.update(jobs)
			.set({
				leaseToken: lease,
				leaseUntil: new Date(now.getTime() + 300000),
				attempts: sql`${jobs.attempts} + 1`,
				firstAttemptAt: sql`coalesce(${jobs.firstAttemptAt}, ${now.toISOString()}::timestamptz)`
			})
			.where(
				and(
					eq(jobs.id, candidate.id),
					eq(jobs.state, 'pending'),
					or(isNull(jobs.leaseUntil), lte(jobs.leaseUntil, now))
				)
			)
			.returning();
		if (!job) continue;
		const owned = and(eq(jobs.id, job.id), eq(jobs.leaseToken, lease));
		if (job.firstAttemptAt && now.getTime() - job.firstAttemptAt.getTime() >= 23 * 3600000) {
			await db
				.update(jobs)
				.set({
					state: 'review',
					failureCategory: 'idempotency-window',
					leaseToken: null,
					leaseUntil: null
				})
				.where(owned);
			result.review++;
			continue;
		}
		try {
			const [sub] = await db.select().from(subs).where(eq(subs.id, job.subscriptionId));
			const suppression = await db
				.select()
				.from(emailSuppressions)
				.where(eq(emailSuppressions.email, sub.email))
				.limit(1);
			if (
				suppression.length ||
				(job.purpose === 'confirm' ? sub.status !== 'pending' : sub.status !== 'confirmed')
			) {
				await db
					.update(jobs)
					.set({ state: 'cancelled', ciphertext: null, leaseToken: null, leaseUntil: null })
					.where(owned);
				result.cancelled++;
				continue;
			}
			if (job.purpose === 'confirm' && now.getTime() - job.createdAt.getTime() >= 86400000) {
				await db
					.update(jobs)
					.set({ state: 'expired', ciphertext: null, leaseToken: null, leaseUntil: null })
					.where(owned);
				result.cancelled++;
				continue;
			}
			if (!job.ciphertext) throw new Error('Payload unavailable');
			const payload: WaitlistEmail = JSON.parse(unseal(job.ciphertext, job.id));
			const providerId = await send(payload, job.deliveryKey);
			if (!providerId) throw new Error('Provider ID unavailable');
			await db
				.update(jobs)
				.set({
					state: sql`CASE WHEN ${jobs.state} = 'cancelled' THEN 'cancelled' ELSE 'sent' END`,
					providerId,
					sentAt: now,
					leaseToken: null,
					leaseUntil: null,
					failureCategory: null
				})
				.where(owned);
			await reconcileEvents(providerId);
			result.sent++;
		} catch (error) {
			const permanent = error instanceof PermanentDeliveryError;
			await db
				.update(jobs)
				.set({
					state: permanent ? 'failed' : 'pending',
					nextAttemptAt: new Date(
						now.getTime() +
							Math.min(3600000, 30000 * 2 ** Math.min(job.attempts, 7)) +
							Math.floor(Math.random() * 10000)
					),
					leaseToken: null,
					leaseUntil: null,
					failureCategory: permanent ? 'provider-permanent' : 'delivery-unavailable'
				})
				.where(owned);
			result.retry++;
		}
	}
	return result;
}
export class PermanentDeliveryError extends Error {}
export async function recordEvent(id: string, providerId: string, kind: string) {
	const db = await ensureDbReady();
	await db.insert(events).values({ id, providerId, kind }).onConflictDoNothing();
	await reconcileEvents(providerId);
}
async function reconcileEvents(providerId: string) {
	const db = await ensureDbReady();
	await db.transaction(async (tx) => {
		const [found] = await tx.select().from(jobs).where(eq(jobs.providerId, providerId));
		if (!found) return;
		// Match the subscription-before-job lock order used by confirmation and opt-out.
		const [lockedSub] = await tx
			.select()
			.from(subs)
			.where(eq(subs.id, found.subscriptionId))
			.for('update');
		const [job] = await tx.select().from(jobs).where(eq(jobs.id, found.id)).for('update');
		if (!job) return;
		const received = await tx.select().from(events).where(eq(events.providerId, providerId));
		const terminal = received.some((e) => ['bounced', 'complained'].includes(e.kind));
		const state = terminal
			? 'suppressed'
			: received.some((e) => e.kind === 'delivered')
				? 'delivered'
				: null;
		if (!state) return;
		await tx.update(jobs).set({ deliveryState: state }).where(eq(jobs.id, job.id));
		if (terminal) {
			const sub = lockedSub;
			await tx.update(subs).set({ status: 'suppressed' }).where(eq(subs.id, sub.id));
			await tx
				.insert(emailSuppressions)
				.values({ email: sub.email, reason: 'waitlist-provider-suppression' })
				.onConflictDoNothing();
			await tx
				.update(jobs)
				.set({ state: 'cancelled', ciphertext: null })
				.where(and(eq(jobs.subscriptionId, sub.id), eq(jobs.state, 'pending')));
		}
	});
}
export async function queueLaunch(campaign: string, commit = false) {
	if (!/^[a-z0-9-]{1,60}$/.test(campaign)) throw new Error('Invalid campaign ID');
	const db = await ensureDbReady();
	const eligible = await db.select().from(subs).where(eq(subs.status, 'confirmed'));
	let count = 0;
	for (const sub of eligible) {
		await db.transaction(async (tx) => {
			const [current] = await tx.select().from(subs).where(eq(subs.id, sub.id)).for('update');
			if (current.status !== 'confirmed' || (await suppressed(tx, current.email))) return;
			const exists = await tx
				.select()
				.from(jobs)
				.where(eq(jobs.deliveryKey, `launch:${campaign}:${sub.id}`))
				.limit(1);
			if (exists.length) return;
			count++;
			if (commit) await enqueue(tx, current, 'launch', `launch:${campaign}:${sub.id}`, new Date());
		});
	}
	return { eligible: count, committed: commit };
}
export async function retainWaitlist(now = new Date()) {
	const db = await ensureDbReady();
	await db.delete(buckets).where(lt(buckets.expiresAt, now));
	await db
		.update(jobs)
		.set({ ciphertext: null })
		.where(
			and(
				lt(jobs.createdAt, new Date(now.getTime() - 7 * 86400000)),
				sql`${jobs.state} <> 'pending'`
			)
		);
	await db
		.delete(subs)
		.where(
			and(eq(subs.status, 'pending'), lt(subs.createdAt, new Date(now.getTime() - 30 * 86400000)))
		);
	await db.delete(events).where(lt(events.createdAt, new Date(now.getTime() - 90 * 86400000)));
	await db
		.delete(jobs)
		.where(
			and(
				sql`${jobs.state} <> 'pending'`,
				lt(jobs.createdAt, new Date(now.getTime() - 90 * 86400000))
			)
		);
}
