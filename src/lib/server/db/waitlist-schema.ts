import { pgTable, text, integer, timestamp, index } from 'drizzle-orm/pg-core';

export const waitlistSubscriptions = pgTable('waitlist_subscriptions', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	status: text('status')
		.$type<'pending' | 'confirmed' | 'unsubscribed' | 'suppressed'>()
		.notNull()
		.default('pending'),
	consentVersion: text('consent_version').notNull(),
	source: text('source').notNull().default('maintenance'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
	unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true })
});
export const waitlistTokens = pgTable('waitlist_tokens', {
	hash: text('hash').primaryKey(),
	subscriptionId: text('subscription_id')
		.notNull()
		.references(() => waitlistSubscriptions.id, { onDelete: 'cascade' }),
	purpose: text('purpose').$type<'confirm' | 'unsubscribe'>().notNull(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	consumedAt: timestamp('consumed_at', { withTimezone: true })
});
export const waitlistOutbox = pgTable(
	'waitlist_email_outbox',
	{
		id: text('id').primaryKey(),
		subscriptionId: text('subscription_id')
			.notNull()
			.references(() => waitlistSubscriptions.id, { onDelete: 'cascade' }),
		purpose: text('purpose').$type<'confirm' | 'receipt' | 'launch' | 'update'>().notNull(),
		deliveryKey: text('delivery_key').notNull().unique(),
		ciphertext: text('ciphertext'),
		state: text('state').notNull().default('pending'),
		providerId: text('provider_id').unique(),
		attempts: integer('attempts').notNull().default(0),
		firstAttemptAt: timestamp('first_attempt_at', { withTimezone: true }),
		nextAttemptAt: timestamp('next_attempt_at', { withTimezone: true }).notNull().defaultNow(),
		leaseToken: text('lease_token'),
		leaseUntil: timestamp('lease_until', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		sentAt: timestamp('sent_at', { withTimezone: true }),
		deliveryState: text('delivery_state'),
		failureCategory: text('failure_category')
	},
	(t) => [index('waitlist_outbox_due_idx').on(t.state, t.nextAttemptAt)]
);
export const waitlistBuckets = pgTable('waitlist_abuse_buckets', {
	key: text('key').primaryKey(),
	count: integer('count').notNull(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull()
});
export const waitlistEvents = pgTable(
	'waitlist_delivery_events',
	{
		id: text('id').primaryKey(),
		providerId: text('provider_id').notNull(),
		kind: text('kind').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [index('waitlist_events_provider_idx').on(t.providerId)]
);
