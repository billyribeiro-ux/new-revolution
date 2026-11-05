# Maintenance waitlist operations

The implementation was merged from the former `docs/maintenance-chart-waitlist-plan` branch.
That implementation did not configure Production services or send live email. The maintenance
page can be published with capture off; provider setup, live mailbox verification and Production
migration remain separate prerequisites for enabling email capture.

The owner requested continuous playback on 2026-11-04. The current dataset is deterministic
**simulated demonstration data**, explicitly labeled in the panel and accessible table.
It contains no SPY or exchange-price claim. This replaces the plan's user-initiated historical
session pending a licensed dataset. Animation begins automatically unless reduced motion is
requested, pauses when hidden/offscreen, and can be paused or restarted. Panning stops automatic
following. The form initializes independently of chart/GSAP loading.

## Enable capture

1. Select a separate Production Postgres database. Never reuse the protected Preview database.
   Review the existing migration process in `src/lib/server/db/index.ts`; apply the existing
   numbered migrations including `drizzle/0002_waitlist.sql` and `drizzle/0003_waitlist_updates.sql` on the intended database. The migration
   is idempotent and forward-only. Do not use `db:push` or modify shipped migrations.
2. Configure `WAITLIST_ORIGIN`, `WAITLIST_FROM_EMAIL`, `WAITLIST_REPLY_TO`, `RESEND_API_KEY`,
   `RESEND_WEBHOOK_SECRET`, `CRON_SECRET`, `WAITLIST_ENCRYPTION_KEY`, and `WAITLIST_RATE_LIMIT_KEY`.
   Keys must be independently generated. The AES key is exactly 32 bytes encoded as 64 hex
   characters. No fallback to auth secrets exists. Outside `VERCEL_ENV=production`, deliveries
   require `WAITLIST_TEST_RECIPIENTS`; use only controlled mailboxes.
3. Verify sender-domain ownership, SPF/DKIM and DMARC in the intended Resend account. Connect
   its signed webhook to `/api/webhooks/resend`. Confirm actual mailbox delivery for both
   confirmation and receipt, correlating provider IDs with delivery events. Mock tests cannot
   prove inbox delivery. Never record credentials or token URLs in logs/screenshots.
4. Configure a supported scheduler to GET `/api/cron/waitlist-email` with the cron Bearer
   secret. The worker is bounded to 20 jobs/run. The authenticated worker is scheduled every minute in `vercel.json` on the current Pro team;
   confirm the plan still supports that frequency before activation or moving accounts.
   Do not rely on the unrelated publisher cron or background promises. Daily-only scheduling
   does not provide prompt retries. Configure sufficient function duration for the batch.
5. Follow the [three-stage activation sequence](../../WAITLIST_SETUP.md#4-verify-configuration-and-delivery-before-capture):
   enable capture only on a dedicated protected test deployment with its exact test-host
   `WAITLIST_ORIGIN` to prove the native flow while live capture stays off. Then build staged
   Production with the canonical www origin and enabled capture. Verify its configuration/API
   before promotion; native staged-host POSTs intentionally fail origin checks. Immediately after
   promotion, verify the complete canonical controlled-mailbox flow, actual signed callbacks and
   scheduler retries. Restore the previous verified capture-off deployment if a required check fails.
   External callbacks and cron execution may be blocked by SSO in a protected test environment;
   preserve that protection and prove those integrations on final public Production.
   This value controls emitted signup markup during `pnpm build` as well as runtime acceptance.
   Without the exact value `true`, the page keeps the email section visible with native disabled
   controls and an explicit availability note. Changes require a new build. Verify and promote the exact Production deployment;
   merging to `main` alone does not update the public domains.

The POST signup response is 202 only after durable storage; it does not claim delivery or
confirmed membership. A database error yields 503. The first send is bounded to 8 seconds
and awaited. Provider errors leave encrypted jobs durable for the worker. Confirmation and
unsubscribe GETs render documents without mutating state; POST applies the change. Native
forms work without JavaScript. Duplicate confirmed/opted-out/suppressed addresses receive a
generic response and do not get repeated confirmation receipts or anonymous re-enrollment.

## Recovery and retention

Worker claims use database conditional updates, five-minute leases and fencing. Retry payloads
and provider keys stay frozen. After 23 hours from the first attempt, an ambiguous job enters
`review`; reconcile it with Resend before any operator retry. The provider's 24-hour key window
is not an unlimited exactly-once guarantee. Permanent validation failures enter `failed`.
Suppression is checked before send. An already in-flight provider request cannot be recalled
when an unsubscribe arrives; pending work is cancelled and future sends are blocked.

Early provider events are stored and reconciled when the message ID becomes available.
Bounce/complaint is terminal even if delivery arrives later. Existing lead ingestion and global
suppression remain active. The worker deletes expired abuse buckets; removes pending subscribers
after 30 days, processed ciphertext after seven days, and event/job delivery metadata after
90 days. Keep scheduler health monitored so retention actually runs. Confirmed subscriptions
remain until the reopening notification or opt-out. After completing reopening delivery, export
necessary minimal audit counts and remove confirmed addresses through a reviewed retention job.

For encryption rotation, stop the worker and capture, retain the old key as
`WAITLIST_PREVIOUS_ENCRYPTION_KEY`, and relabel existing `v1.` ciphertext prefixes as `v0.` in
one controlled database transaction. Set the new primary key, verify decrypt/re-encrypt on an
isolated copy, and resume. Drain or re-encrypt old payloads before removing the previous key.
The encrypted payload contains raw confirmation/unsubscribe URLs; only token lookup values
are hashes. AES-GCM authenticates each payload to its outbox row.

## Reopening campaign

Use the protected operator environment, with the intended database configured. First run:

```sh
node --env-file-if-exists=.env scripts/waitlist-launch.ts reopening-2026
```

Review the eligible count, then repeat with `--commit` to queue that exact campaign. The command
queues only; the authenticated worker sends. Repeating the same campaign cannot create duplicate
jobs. Use one approved campaign ID and verify recipients before committing. Eligibility and global
suppression are rechecked immediately before every send. Do not drop operational routes or subscriber
tables when maintenance is disabled; issued links must keep working.

## Release evidence still required

- The disposable local Postgres concurrency/lease recovery checks pass; hosted Production database configuration and migration remain outstanding.
- Verified provider configuration, real confirmation/receipt mailbox delivery, signed callbacks.
- Supported scheduler and Production-only configuration.
- Staged Vercel exact-method routing, browser/CDN no-store and maintenance-off restoration.
- Licensed historical data if replacing the clearly labeled simulated market study.

## Progress updates and current hookup status

The owner chose to connect services later. [WAITLIST_SETUP.md](../../WAITLIST_SETUP.md) contains
the complete environment checklist, dry-run migration helper, configuration preflight and activation
steps. No Production credentials, migration or live mail delivery are supplied by this preparation.

A new signup receives a thank-you/confirmation email through the existing bounded immediate send.
After confirmation, the handler targets that subscriber's welcome receipt job directly rather than
allowing an unrelated pending job to occupy the one-job immediate batch. Failures remain durable
for the worker; neither provider acceptance nor a mock test proves inbox placement.

`reopening-updates-2026-11-04` permits occasional launch progress updates plus reopening mail.
Older consent remains reopening-only. `scripts/waitlist-update.ts CAMPAIGN MESSAGE_FILE [--commit]`
accepts reviewed plain-text subject/body JSON and defaults to dry-run. Queueing and sending both
recheck consent, confirmation and suppression. A campaign ID deduplicates and freezes each payload.
Unsubscribe cancels all pending waitlist mail. Progress updates do not extend subscription retention
beyond reopening.
