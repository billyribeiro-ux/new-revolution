/**
 * Email sequence (drip / follow-up) service.
 *
 * Model:
 *   - A `email_sequences` row is a named series; its `email_sequence_steps`
 *     are the ordered weekly emails (delayDays from the prior step).
 *   - A lead is enrolled (`email_enrollments`) on signup. `nextSendAt` is when
 *     the cron should send the recipient's `currentStep`.
 *   - The `send-sequence-emails` cron calls `processDueEnrollments`, which is
 *     recoverable: a unique delivery ledger, leases, and a frozen provider
 *     payload/key distinguish pending attempts from accepted messages.
 *
 * Suppression: Resend only auto-suppresses unsubscribes for Broadcasts/
 * Audiences — NOT the transactional emails.send API used here. So every send
 * checks `email_suppressions` first.
 */
import { db } from '#lib/server/db/index.js';
import {
	emailSequences,
	emailSequenceSteps,
	emailEnrollments,
	emailSends,
	emailSuppressions,
	leads
} from '#lib/server/db/schema.js';
import { and, asc, desc, eq, gte, inArray, isNull, lte, or, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import type { SequenceStepEmail } from '#lib/server/email/sequence-step.js';
import { logger } from '#lib/server/logger.js';
import { NotFoundError } from '#lib/server/service-errors.js';
import { sequenceCreateSchema, sequenceUpdateSchema } from '#lib/shared/schemas/sequences.js';

/** Add days to a date, returning a new Date. */
function addDays(from: Date, days: number): Date {
	const d = new Date(from.getTime());
	d.setUTCDate(d.getUTCDate() + days);
	return d;
}

/** The active sequence for a trigger (e.g. 'lead_magnet'), or null. */
export async function getActiveSequence(triggerSource = 'lead_magnet') {
	const rows = await db
		.select()
		.from(emailSequences)
		.where(and(eq(emailSequences.triggerSource, triggerSource), eq(emailSequences.isActive, true)))
		.limit(1);
	return rows[0] ?? null;
}

/** Ordered, active steps for a sequence. */
export async function getSequenceSteps(sequenceId: number) {
	return db
		.select()
		.from(emailSequenceSteps)
		.where(
			and(eq(emailSequenceSteps.sequenceId, sequenceId), eq(emailSequenceSteps.isActive, true))
		)
		.orderBy(asc(emailSequenceSteps.stepIndex));
}

/** True if the email is on the suppression list. */
export async function isSuppressed(email: string): Promise<boolean> {
	const rows = await db
		.select({ id: emailSuppressions.id })
		.from(emailSuppressions)
		.where(eq(emailSuppressions.email, email.trim().toLowerCase()))
		.limit(1);
	return rows.length > 0;
}

/** Add an email to the suppression list (idempotent on the unique email idx). */
export async function suppressEmail(
	email: string,
	reason: 'unsubscribed' | 'bounced' | 'complained'
): Promise<void> {
	await db
		.insert(emailSuppressions)
		.values({ email: email.trim().toLowerCase(), reason })
		.onConflictDoNothing({ target: emailSuppressions.email });
}

/**
 * Enroll a lead into a sequence. Idempotent: the unique (lead, sequence)
 * index means a duplicate enroll is a no-op. `nextSendAt` for step 0 is
 * `now + step0.delayDays` (the first follow-up lands delayDays after signup).
 * Returns the enrollment id, or null if there's no active sequence/steps.
 */
export async function enrollLead(
	leadId: number,
	opts?: { sequenceId?: number; triggerSource?: string; now?: Date }
): Promise<number | null> {
	const now = opts?.now ?? new Date();
	let sequenceId = opts?.sequenceId;
	if (!sequenceId) {
		const seq = await getActiveSequence(opts?.triggerSource ?? 'lead_magnet');
		if (!seq) return null;
		sequenceId = seq.id;
	}

	const steps = await getSequenceSteps(sequenceId);
	if (steps.length === 0) return null;
	const firstDelay = steps[0]?.delayDays ?? 7;

	const inserted = await db
		.insert(emailEnrollments)
		.values({
			leadId,
			sequenceId,
			currentStep: steps[0]!.stepIndex,
			status: 'active',
			nextSendAt: addDays(now, firstDelay)
		})
		.onConflictDoNothing({
			target: [emailEnrollments.leadId, emailEnrollments.sequenceId]
		})
		.returning({ id: emailEnrollments.id });

	return inserted[0]?.id ?? null;
}

/** Mark an enrollment unsubscribed (used by the one-click unsubscribe flow). */
export async function unsubscribeByEmail(email: string): Promise<void> {
	const normalized = email.trim().toLowerCase();
	await suppressEmail(normalized, 'unsubscribed');
	// Pause every active enrollment for any lead with this email.
	await db
		.update(emailEnrollments)
		.set({ status: 'unsubscribed', updatedAt: new Date() })
		.where(
			and(
				eq(emailEnrollments.status, 'active'),
				sql`${emailEnrollments.leadId} IN (SELECT ${leads.id} FROM ${leads} WHERE lower(${leads.email}) = ${normalized})`
			)
		)
		.catch((err: unknown) => {
			// The suppression above is durable and every send checks it. A stale
			// enrollment label must not turn an accepted unsubscribe into a 503.
			logger.error(
				{ errorName: err instanceof Error ? err.name : 'unknown' },
				'[email-sequences] enrollment pause failed; durable suppression remains active'
			);
		});
}

/** A due enrollment joined with the lead's email/name and step content. */
type DueRow = {
	enrollmentId: number;
	leadId: number;
	sequenceId: number;
	currentStep: number;
	email: string;
	name: string | null;
};

/** Provider adapter. A missing message ID is a failed attempt. */
export type StepSender = (
	payload: SequenceStepEmail,
	options: { idempotencyKey: string }
) => Promise<string | null>;
export type StepPreparer = (args: {
	email: string;
	name: string | null;
	subject: string;
	bodyHtml: string;
}) => SequenceStepEmail;

export type ProcessResult = {
	due: number;
	sent: number;
	skippedSuppressed: number;
	completed: number;
	errors: number;
	needsReview: number;
};

// Retry inside the provider's 24h window, leaving an hour for clock/queue skew.
const SAFE_RETRY_WINDOW_MS = 23 * 60 * 60 * 1000;
const DELIVERY_LEASE_MS = 5 * 60 * 1000;

/** Normalize accepted baseline writes that can finish after migration 0028. */
async function reconcileAcceptedLegacyDeliveries(): Promise<void> {
	await db.execute(sql`
		UPDATE email_sends SET
			status = 'sent',
			sent_at = coalesce(sent_at, first_attempt_at),
			first_attempt_at = coalesce(first_attempt_at, sent_at),
			lease_token = NULL, lease_until = NULL, last_error = NULL
		WHERE payload IS NULL AND resend_message_id IS NOT NULL
			AND (status <> 'sent' OR sent_at IS NULL)
	`);
	// Do not resume paused/unsubscribed enrollments. A late accepted legacy
	// claim can be normalized without overriding an operator's pause decision.
}

/** Recoverable, leased delivery with a frozen payload and provider idempotency. */
export async function processDueEnrollments(
	delivery: { prepare: StepPreparer; send: StepSender },
	opts?: { now?: Date; limit?: number }
): Promise<ProcessResult> {
	const now = opts?.now ?? new Date();
	const result: ProcessResult = {
		due: 0,
		sent: 0,
		skippedSuppressed: 0,
		completed: 0,
		errors: 0,
		needsReview: 0
	};
	// The old deployment can advance or complete an enrollment after writing
	// its provider ID, so compatibility cannot depend on the current due step.
	await reconcileAcceptedLegacyDeliveries();
	const dueRows: DueRow[] = await db
		.select({
			enrollmentId: emailEnrollments.id,
			leadId: emailEnrollments.leadId,
			sequenceId: emailEnrollments.sequenceId,
			currentStep: emailEnrollments.currentStep,
			email: leads.email,
			name: leads.name
		})
		.from(emailEnrollments)
		.innerJoin(leads, eq(emailEnrollments.leadId, leads.id))
		.innerJoin(emailSequences, eq(emailEnrollments.sequenceId, emailSequences.id))
		.where(
			and(
				eq(emailEnrollments.status, 'active'),
				lte(emailEnrollments.nextSendAt, now),
				isNull(leads.deletedAt),
				eq(emailSequences.isActive, true)
			)
		)
		.orderBy(asc(emailEnrollments.nextSendAt))
		.limit(opts?.limit ?? 200);
	result.due = dueRows.length;

	for (const row of dueRows) {
		let lease: { id: number; token: string } | undefined;
		try {
			if (await isSuppressed(row.email)) {
				await db
					.update(emailEnrollments)
					.set({ status: 'unsubscribed', updatedAt: now })
					.where(
						and(eq(emailEnrollments.id, row.enrollmentId), eq(emailEnrollments.status, 'active'))
					);
				result.skippedSuppressed++;
				continue;
			}
			const previous = (
				await db
					.select()
					.from(emailSends)
					.where(
						and(
							eq(emailSends.enrollmentId, row.enrollmentId),
							eq(emailSends.stepIndex, row.currentStep)
						)
					)
					.limit(1)
			)[0];
			if (previous?.resendMessageId) {
				// An old invocation may finish between migration and deployment.
				// Its provider ID is proof of acceptance; a bare claim is not.
				if (previous.status !== 'sent')
					await db
						.update(emailSends)
						.set({ status: 'sent', sentAt: previous.sentAt ?? now, lastError: null })
						.where(eq(emailSends.id, previous.id));
				await advanceAcceptedDelivery(row, previous.id);
				continue;
			}
			if (
				previous &&
				(!previous.payload ||
					previous.status === 'needs_review' ||
					(previous.firstAttemptAt &&
						previous.firstAttemptAt.getTime() <= now.getTime() - SAFE_RETRY_WINDOW_MS))
			) {
				await db.batch([
					db
						.update(emailSends)
						.set({
							status: 'needs_review',
							lastError: 'Provider idempotency window elapsed; verify delivery before retrying.'
						})
						.where(and(eq(emailSends.id, previous.id), sql`${emailSends.status} <> 'sent'`)),
					db
						.update(emailEnrollments)
						.set({ status: 'paused', updatedAt: now })
						.where(
							and(
								eq(emailEnrollments.id, row.enrollmentId),
								eq(emailEnrollments.status, 'active'),
								sql`EXISTS (SELECT 1 FROM email_sends WHERE id = ${previous.id} AND status = 'needs_review')`
							)
						)
				]);
				result.needsReview++;
				continue;
			}
			const steps = await getSequenceSteps(row.sequenceId);
			const step = steps.find((item) => item.stepIndex === row.currentStep);
			if (!step && !previous?.payload) {
				const next = steps.find((item) => item.stepIndex > row.currentStep);
				await db
					.update(emailEnrollments)
					.set(
						next
							? {
									currentStep: next.stepIndex,
									nextSendAt: addDays(now, next.delayDays),
									updatedAt: now
								}
							: { status: 'completed', nextSendAt: null, updatedAt: now }
					)
					.where(
						and(
							eq(emailEnrollments.id, row.enrollmentId),
							eq(emailEnrollments.currentStep, row.currentStep),
							eq(emailEnrollments.status, 'active')
						)
					);
				if (!next) result.completed++;
				continue;
			}
			const payload =
				previous?.payload ??
				delivery.prepare({
					email: row.email,
					name: row.name,
					subject: step!.subject,
					bodyHtml: step!.bodyHtml
				});
			await db
				.insert(emailSends)
				.values({
					enrollmentId: row.enrollmentId,
					stepIndex: row.currentStep,
					payload,
					status: 'pending'
				})
				.onConflictDoNothing({ target: [emailSends.enrollmentId, emailSends.stepIndex] });
			const token = randomUUID();
			const claimed = await db
				.update(emailSends)
				.set({
					status: 'sending',
					leaseToken: token,
					leaseUntil: new Date(now.getTime() + DELIVERY_LEASE_MS),
					firstAttemptAt: sql`coalesce(${emailSends.firstAttemptAt}, ${now.toISOString()}::timestamptz)`,
					attempts: sql`${emailSends.attempts} + 1`,
					lastError: null
				})
				.where(
					and(
						eq(emailSends.enrollmentId, row.enrollmentId),
						eq(emailSends.stepIndex, row.currentStep),
						inArray(emailSends.status, ['pending', 'retry', 'sending']),
						or(isNull(emailSends.leaseUntil), lte(emailSends.leaseUntil, now)),
						or(
							isNull(emailSends.firstAttemptAt),
							gte(emailSends.firstAttemptAt, new Date(now.getTime() - SAFE_RETRY_WINDOW_MS))
						),
						sql`EXISTS (SELECT 1 FROM email_enrollments e JOIN leads l ON l.id = e.lead_id
					JOIN email_sequences s ON s.id = e.sequence_id
					WHERE e.id = ${row.enrollmentId} AND e.current_step = ${row.currentStep}
					AND e.status = 'active' AND l.deleted_at IS NULL AND s.is_active = true
					AND NOT EXISTS (SELECT 1 FROM email_suppressions WHERE email = lower(l.email)))`
					)
				)
				.returning();
			const claim = claimed[0];
			if (!claim?.payload) continue;
			lease = { id: claim.id, token };
			const messageId = await delivery.send(claim.payload, {
				idempotencyKey: `rtp/sequence/${claim.id}`
			});
			if (!messageId) throw new Error('Email provider did not accept the message');
			// Persist acceptance and progression in one transaction. A crash after
			// provider acceptance retries the identical payload/key until this commits.
			const [accepted] = await db.batch([
				db
					.update(emailSends)
					.set({
						status: 'sent',
						resendMessageId: messageId,
						sentAt: now,
						leaseToken: null,
						leaseUntil: null,
						lastError: null
					})
					.where(and(eq(emailSends.id, claim.id), eq(emailSends.leaseToken, token)))
					.returning({ id: emailSends.id }),
				advanceAcceptedDeliveryQuery(row, claim.id)
			]);
			if (accepted.length) result.sent++;
		} catch (err) {
			result.errors++;
			if (lease)
				await db
					.update(emailSends)
					.set({
						status: 'retry',
						leaseToken: null,
						leaseUntil: new Date(now.getTime() + 60 * 60 * 1000),
						lastError: 'Delivery attempt failed; retry with the same provider key.'
					})
					.where(and(eq(emailSends.id, lease.id), eq(emailSends.leaseToken, lease.token)))
					.catch((writeError: unknown) =>
						logger.error({ err: writeError }, '[email-sequences] failed to record retry')
					);
			logger.error(
				{ err, enrollmentId: row.enrollmentId },
				'[email-sequences] failed to process enrollment'
			);
		}
	}
	return result;
}

function advanceAcceptedDeliveryQuery(row: DueRow, deliveryId: number) {
	return db.execute(sql`
		WITH next_step AS (
			SELECT step_index, delay_days FROM email_sequence_steps
			WHERE sequence_id = ${row.sequenceId} AND step_index > ${row.currentStep} AND is_active = true
			ORDER BY step_index LIMIT 1
		), accepted AS (SELECT sent_at FROM email_sends WHERE id = ${deliveryId} AND status = 'sent')
		UPDATE email_enrollments SET
			current_step = coalesce((SELECT step_index FROM next_step), ${row.currentStep + 1}),
			status = CASE WHEN EXISTS (SELECT 1 FROM next_step) THEN 'active' ELSE 'completed' END,
			next_send_at = (SELECT sent_at FROM accepted) + (SELECT delay_days FROM next_step) * interval '1 day',
			updated_at = clock_timestamp()
		WHERE id = ${row.enrollmentId} AND current_step = ${row.currentStep} AND status = 'active'
			AND EXISTS (SELECT 1 FROM accepted)
	`);
}

async function advanceAcceptedDelivery(row: DueRow, deliveryId: number) {
	await advanceAcceptedDeliveryQuery(row, deliveryId);
}

// ─── Admin: sequence management ────────────────────────────────────────

/** List all sequences with their step counts (admin sequences index). */
export async function listSequences() {
	const seqs = await db.select().from(emailSequences).orderBy(asc(emailSequences.id));
	const counts = await db
		.select({
			sequenceId: emailSequenceSteps.sequenceId,
			steps: sql<number>`count(*)::int`
		})
		.from(emailSequenceSteps)
		.groupBy(emailSequenceSteps.sequenceId);
	const countMap = new Map(counts.map((c) => [c.sequenceId, c.steps]));
	return seqs.map((s) => ({ ...s, stepCount: countMap.get(s.id) ?? 0 }));
}

/** A sequence with its ordered steps (admin editor load). */
export async function getSequenceWithSteps(id: number) {
	const rows = await db.select().from(emailSequences).where(eq(emailSequences.id, id)).limit(1);
	const seq = rows[0];
	if (!seq) return null;
	const steps = await db
		.select()
		.from(emailSequenceSteps)
		.where(eq(emailSequenceSteps.sequenceId, id))
		.orderBy(asc(emailSequenceSteps.stepIndex));
	return { ...seq, steps };
}

type StepInput = {
	stepIndex: number;
	delayDays: number;
	subject: string;
	bodyHtml: string;
	isActive: boolean;
};

/**
 * Create a sequence and replace its steps in one transaction. If `isActive`
 * is true, deactivate any other sequence on the same trigger first (one
 * active sequence per trigger is the operating invariant).
 */
export async function createSequence(data: {
	name: string;
	triggerSource: string;
	isActive: boolean;
	steps: StepInput[];
}): Promise<number> {
	data = sequenceCreateSchema.parse(data);
	const [, , created] = await db.batch([
		// Serialize activation changes across triggers. This is a tiny admin-only
		// transaction, and avoids lock-order inversions when changing triggers.
		db.execute(sql`SELECT pg_advisory_xact_lock(740360, 1)`),
		db
			.update(emailSequences)
			.set({ isActive: false, updatedAt: new Date() })
			.where(and(eq(emailSequences.triggerSource, data.triggerSource), sql`${data.isActive}`)),
		db.execute<{ id: number }>(sql`
			WITH created AS (
				INSERT INTO email_sequences (name, trigger_source, is_active)
				VALUES (${data.name}, ${data.triggerSource}, ${data.isActive}) RETURNING id
			), steps AS (
				INSERT INTO email_sequence_steps (sequence_id, step_index, delay_days, subject, body_html, is_active)
				SELECT created.id, step."stepIndex", step."delayDays", step.subject, step."bodyHtml", step."isActive"
				FROM created CROSS JOIN jsonb_to_recordset(${JSON.stringify(data.steps)}::jsonb)
					AS step("stepIndex" int, "delayDays" int, subject text, "bodyHtml" text, "isActive" boolean)
				RETURNING id
			) SELECT id FROM created
		`)
	]);
	const id = created.rows[0]?.id;
	if (!id) throw new Error('Failed to create sequence');
	return id;
}

/** Metadata, activation and step replacement commit together. */
export async function updateSequence(data: {
	id: number;
	name: string;
	triggerSource: string;
	isActive: boolean;
	steps: StepInput[];
}): Promise<void> {
	data = sequenceUpdateSchema.parse(data);
	const [, , updated] = await db.batch([
		db.execute(sql`SELECT pg_advisory_xact_lock(740360, 1)`),
		db
			.update(emailSequences)
			.set({ isActive: false, updatedAt: new Date() })
			.where(
				and(
					eq(emailSequences.triggerSource, data.triggerSource),
					sql`${data.isActive}`,
					sql`${emailSequences.id} <> ${data.id}`,
					sql`EXISTS (SELECT 1 FROM email_sequences WHERE id = ${data.id})`
				)
			),
		db
			.update(emailSequences)
			.set({
				name: data.name,
				triggerSource: data.triggerSource,
				isActive: data.isActive,
				updatedAt: new Date()
			})
			.where(eq(emailSequences.id, data.id))
			.returning({ id: emailSequences.id }),
		db.delete(emailSequenceSteps).where(eq(emailSequenceSteps.sequenceId, data.id)),
		db.execute(sql`
			INSERT INTO email_sequence_steps (sequence_id, step_index, delay_days, subject, body_html, is_active)
			SELECT ${data.id}, step."stepIndex", step."delayDays", step.subject, step."bodyHtml", step."isActive"
			FROM jsonb_to_recordset(${JSON.stringify(data.steps)}::jsonb)
				AS step("stepIndex" int, "delayDays" int, subject text, "bodyHtml" text, "isActive" boolean)
		`)
	]);
	if (!updated.length) throw new NotFoundError('Sequence not found');
}

/** Delete a sequence (cascade removes its steps + enrollments). */
export async function deleteSequence(id: number): Promise<void> {
	await db.batch([
		db.execute(sql`SELECT pg_advisory_xact_lock(740360, 1)`),
		db.delete(emailSequences).where(eq(emailSequences.id, id))
	]);
}

// ─── Admin: subscribers (PDF lead-magnet signups) ──────────────────────

/**
 * Subscribers roster: active leads from the lead-magnet, newest first, with
 * their drip status. This is the clean "who signed up" view (name/email/
 * date/time) distinct from the leads engagement dashboard.
 *
 * Returns the (possibly capped) page of rows PLUS the true alive-only
 * total (of matches, when searching) so the UI can say "N subscribers,
 * showing first M" instead of
 * silently reporting the cap as the population (audit 2026-06-11). The
 * count uses the same filter as the rows (leads.deleted_at IS NULL) and
 * is cast ::int so neon-http returns a JS number, not a string.
 */
export async function listSubscribers(filters?: {
	limit?: number;
	offset?: number;
	/** Case-insensitive substring of email or name; `%` and `_` match literally. */
	search?: string | undefined;
}) {
	const limit = filters?.limit ?? 250;
	const offset = filters?.offset ?? 0;
	const search = filters?.search?.trim();
	const pattern = search ? `%${search.replace(/[\\%_]/g, (c) => `\\${c}`)}%` : null;
	const where = pattern
		? and(
				isNullDeleted(),
				or(sql`${leads.email} ILIKE ${pattern}`, sql`coalesce(${leads.name}, '') ILIKE ${pattern}`)
			)
		: isNullDeleted();
	const [subscribers, totalRows] = await Promise.all([
		db
			.select({
				id: leads.id,
				email: leads.email,
				name: leads.name,
				source: leads.source,
				createdAt: leads.createdAt,
				enrollmentStatus: emailEnrollments.status,
				currentStep: emailEnrollments.currentStep
			})
			.from(leads)
			.leftJoin(emailEnrollments, eq(emailEnrollments.leadId, leads.id))
			.where(where)
			.orderBy(desc(leads.createdAt))
			.limit(limit)
			.offset(offset),
		db
			.select({ count: sql<number>`count(*)::int` })
			.from(leads)
			.where(where)
	]);
	return { subscribers, total: Number(totalRows[0]?.count ?? 0) };
}

function csvCell(val: unknown): string {
	const raw = String(val ?? '').replace(/"/g, '""');
	return /^[=+\-@\t\r]/.test(raw) ? `"'${raw}"` : `"${raw}"`;
}

/** Export subscribers as CSV (name, email, date, drip status). */
export async function exportSubscribersCsv(): Promise<string> {
	const { subscribers: rows } = await listSubscribers({ limit: 10_000, offset: 0 });
	const header = 'Name,Email,Signed Up,Drip Status,Step\n';
	const body = rows
		.map((r) =>
			[
				csvCell(r.name ?? ''),
				csvCell(r.email),
				csvCell(r.createdAt?.toISOString() ?? ''),
				csvCell(r.enrollmentStatus ?? 'not_enrolled'),
				csvCell(r.currentStep ?? '')
			].join(',')
		)
		.join('\n');
	return header + body;
}

/** drizzle predicate: leads.deleted_at IS NULL */
function isNullDeleted() {
	return sql`${leads.deletedAt} IS NULL`;
}
