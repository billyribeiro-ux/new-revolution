// Opt-in integration against a disposable loopback Postgres, never a shared environment.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { setActiveDbForTest } from '../../src/lib/server/db/index.ts';
import * as schema from '../../src/lib/server/db/schema.ts';
import {
	signup,
	applyToken,
	processOutbox,
	recordEvent
} from '../../src/lib/server/waitlist/service.ts';
import { unseal } from '../../src/lib/server/waitlist/crypto.ts';
import type { WaitlistEmail } from '../../src/lib/server/waitlist/email.ts';
const url = process.env.WAITLIST_PG_TEST_URL;
if (!url || new URL(url).hostname !== '127.0.0.1' || new URL(url).port !== '55449')
	throw new Error('Use only the disposable loopback test server on port 55449.');
const client = postgres(url, { max: 12 });
try {
	for (const file of readdirSync('drizzle')
		.filter((n) => /^\d{4}_.+\.sql$/.test(n))
		.sort())
		await client.unsafe(readFileSync(`drizzle/${file}`, 'utf8'));
	const db = drizzle(client, { schema });
	setActiveDbForTest(db);
	const now = new Date();
	await Promise.all(
		Array.from({ length: 10 }, (_, i) => signup('concurrent@example.test', `ip-${i}`, now))
	);
	assert.equal((await db.select().from(schema.waitlistSubscriptions)).length, 1);
	const [job] = await db.select().from(schema.waitlistOutbox);
	assert.ok(job);
	assert.equal((await db.select().from(schema.waitlistOutbox)).length, 1);
	let sends = 0;
	await Promise.all(
		Array.from({ length: 8 }, () =>
			processOutbox(
				async () => {
					sends++;
					await new Promise((resolve) => setTimeout(resolve, 100));
					return 'pg-provider';
				},
				{ now }
			)
		)
	);
	assert.equal(sends, 1);
	const payload: WaitlistEmail = JSON.parse(unseal(job.ciphertext!, job.id));
	const token = new URL(payload.text.match(/Confirm email: (\S+)/)![1]).searchParams.get('token')!;
	const confirmations = await Promise.allSettled([
		applyToken(token, 'confirm'),
		applyToken(token, 'confirm')
	]);
	assert.equal(confirmations.filter((r) => r.status === 'fulfilled').length, 1);
	assert.equal(
		(
			await db
				.select()
				.from(schema.waitlistOutbox)
				.where(eq(schema.waitlistOutbox.purpose, 'receipt'))
		).length,
		1
	);
	// Recover a claim abandoned by a crashed worker.
	const [receipt] = await db
		.select()
		.from(schema.waitlistOutbox)
		.where(eq(schema.waitlistOutbox.purpose, 'receipt'));
	await db
		.update(schema.waitlistOutbox)
		.set({ leaseToken: 'crashed', leaseUntil: new Date(now.getTime() - 1000) })
		.where(eq(schema.waitlistOutbox.id, receipt.id));
	await processOutbox(async () => 'pg-recovered');
	assert.equal(
		(
			await db.select().from(schema.waitlistOutbox).where(eq(schema.waitlistOutbox.id, receipt.id))
		)[0].state,
		'sent'
	);
	await recordEvent('pg-bounce', 'pg-recovered', 'bounced');
	await recordEvent('pg-delivered-late', 'pg-recovered', 'delivered');
	assert.equal((await db.select().from(schema.waitlistSubscriptions))[0].status, 'suppressed');
	console.log(
		'Postgres 18: concurrent signup, worker fencing, single-use confirmation, expired-lease recovery and terminal suppression passed.'
	);
} finally {
	await client.end();
}
