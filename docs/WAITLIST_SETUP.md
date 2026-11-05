# Connect the maintenance waitlist

The page and mail workflow are implemented; the owner chose to connect services later. Until then,
the email section stays visible with disabled native controls and a clear unavailable note. No request
is accepted and no message is claimed as sent. Use the existing [Vite+ workflow](VITE_PLUS_WORKFLOW.md)
for all project checks/builds.

## 1. Keep Production and development separate

Public Production uses `MAINTENANCE_MODE=true`. Authenticated Vercel Preview uses
`MAINTENANCE_MODE=false` and its own database. Local development uses `pnpm dev`. Keep the
Production database and email credentials scoped to Production; do not reuse Preview data or
remove Preview authentication. A Production `.vercel.app` alias is also a maintenance deployment;
use the normal Preview URL for development.

## 2. Connect the services

Create a dedicated Production Postgres database and a verified Resend sending domain. Configure
these in Vercel → `new-revolution` → Production (never commit real values):

| Variable                   | Purpose                                                         |
| -------------------------- | --------------------------------------------------------------- |
| `DATABASE_URL`             | Dedicated Production Postgres URL                               |
| `WAITLIST_ORIGIN`          | `https://www.revolutiontradingpros.com`, with no trailing slash |
| `WAITLIST_FROM_EMAIL`      | Brand name and email on your verified sending domain            |
| `WAITLIST_REPLY_TO`        | Support inbox you monitor                                       |
| `RESEND_API_KEY`           | Sending/provider API credential                                 |
| `RESEND_WEBHOOK_SECRET`    | Signing secret for `/api/webhooks/resend`                       |
| `CRON_SECRET`              | Independently generated secret of at least 32 characters        |
| `WAITLIST_ENCRYPTION_KEY`  | Independent 32 random bytes encoded as 64 hex characters        |
| `WAITLIST_RATE_LIMIT_KEY`  | Independent random secret of at least 32 characters             |
| `WAITLIST_SIGNUPS_ENABLED` | Keep `false` until all checks below pass                        |

Generate each secret independently using Node's `crypto.randomBytes`; do not reuse auth secrets.
Keep private operator environment files outside Git. `.env.example` lists the required names.
Resend domain verification requires the sender's DNS records. Configure delivery, bounce and
complaint callbacks to `https://www.revolutiontradingpros.com/api/webhooks/resend`.

## 3. Initialize the intended database

With a private operator `.env` containing the intended URL, first review the target and migration list:

```sh
node --env-file-if-exists=.env scripts/waitlist-migrate.mjs
```

This default run prints only the host, database name and file names; it does not connect or write.
Confirm this is the new Production database, then explicitly apply:

```sh
node --env-file-if-exists=.env scripts/waitlist-migrate.mjs --apply
```

The command applies all numbered forward migrations in order in one transaction, including
`0003_waitlist_updates.sql`. Existing migrations are preserved. Do not use `db:push`.
The app's automatic local PGlite initialization does **not** migrate a real Postgres database.

## 4. Verify configuration and delivery before capture

```sh
node --env-file-if-exists=.env scripts/waitlist-check.mjs
pnpm build
```

The preflight reports missing/invalid variable names without printing secrets. A green configuration
report is not evidence of DNS verification, database readiness or mailbox delivery.

The worker is already scheduled in `vercel.json` at `/api/cron/waitlist-email` every minute on the
current Pro team. It requires the configured Bearer `CRON_SECRET`; without it the endpoint refuses
requests. Verify the account still supports this frequency before activating on another plan.

Use an isolated staged deployment and a mailbox you control to verify: durable signup, immediate
thank-you/confirmation delivery, the confirmation POST, the targeted welcome receipt, one-use links,
unsubscribe, signed callbacks and retry scheduling. Outside Production, set `WAITLIST_TEST_RECIPIENTS`
to only the controlled test inboxes. Do not test by emailing an unrelated address.

After those checks, set `WAITLIST_SIGNUPS_ENABLED=true`, create a new complete `pnpm build` deployment,
and follow the [Production verification/promotion checklist](MAINTENANCE.md). This flag controls both
the native fieldset and runtime acceptance. Environment changes alone do not update the live page.

## 5. Keep confirmed people posted

The current consent version is `reopening-updates-2026-11-04`: occasional launch updates and the
reopening notification. Earlier reopening-only consent remains reopening-only. Every email includes
unsubscribe; unsubscribed/suppressed addresses are checked when queueing and again before delivery.

For a progress update, create a reviewed UTF-8 JSON file with only `subject` and `body` plain-text fields:

```json
{
	"subject": "A quick update from Revolution Trading Pros",
	"body": "Thank you for being here. We are preparing the next chapter of the platform and will share more as it is ready."
}
```

First preview eligibility, then explicitly queue that exact campaign:

```sh
node --env-file-if-exists=.env scripts/waitlist-update.ts progress-01 /private/path/update.json
node --env-file-if-exists=.env scripts/waitlist-update.ts progress-01 /private/path/update.json --commit
```

The default is dry-run; `--commit` queues encrypted messages for the authenticated worker. A campaign
ID deduplicates per subscriber and freezes its message. Use a new ID for a new reviewed update.
Updates go only to confirmed people with the new permission; legacy subscribers are excluded.

The reopening campaign uses the existing `scripts/waitlist-launch.ts CAMPAIGN [--commit]`.
Reopening ends this waitlist's retention purpose; follow the [operations/retention guide](reviews/maintenance-waitlist/OPERATIONS.md).

No Production credential, mailbox verification or actual email delivery has been supplied or claimed
by this preparation change.
