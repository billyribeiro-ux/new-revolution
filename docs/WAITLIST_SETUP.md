# Connect the maintenance waitlist

> **Blog work — November 5, 2026:** Read the [mandatory blog handoff](BLOG_AGENT_HANDOFF.md) before adding or changing articles, editor workflows, blog SEO or automation. It distinguishes the existing CMS workflow from the proposed intake tooling.

The page and mail workflow are implemented; the owner chose to connect services later. Until then,
the email section stays visible with disabled native controls and a clear unavailable note. No request
is accepted and no message is claimed as sent. Use the existing [Vite+ workflow](VITE_PLUS_WORKFLOW.md)
for all project checks/builds.

## 1. Keep Production and development separate

Public Production uses `MAINTENANCE_MODE=true`. Authenticated Vercel Preview uses
`MAINTENANCE_MODE=false` and its own database. Local development uses `pnpm dev`. Keep the
Production database and email credentials scoped to Production; do not reuse Preview data or
remove Preview authentication. A Production `.vercel.app` alias is also a maintenance deployment;
use the [protected development Preview](https://new-revolution-development-will-ribeiros-projects.vercel.app) for development.
This alias requires Vercel sign-in and points to the verified normal Preview from PR #25. It is a
snapshot, not an automatically advancing branch: after testing a newer normal Preview, repoint it
with `vercel alias set <verified-preview-url> new-revolution-development-will-ribeiros-projects.vercel.app --scope will-ribeiros-projects`.
Verify unauthenticated requests still redirect to Vercel SSO and the authenticated maintenance marker
remains `false` after each change. Never point this alias at a Production maintenance build.

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

Keep the live Production capture flag `false` while completing these stages:

1. **Isolated native-flow test:** create a separate protected test deployment and test database; do
   not repurpose the normal development Preview or Production data. For this test deployment only,
   use `MAINTENANCE_MODE=true`, `WAITLIST_SIGNUPS_ENABLED=true` at build and runtime, and
   `WAITLIST_ORIGIN` equal to the exact HTTPS test hostname used in the browser (no path/trailing
   slash). A known, protected `.vercel.app` test alias can supply a stable origin before building.
   Outside `VERCEL_ENV=production`, set `WAITLIST_TEST_RECIPIENTS` to only inboxes you control.
   Apply the forward migrations to the test database. Verify durable signup, immediate thank-you/
   confirmation delivery, native confirmation POST, targeted welcome receipt, one-use links and
   unsubscribe. A false flag rejects signup; a canonical Production origin on a test-host form
   causes 403. Do not relax the origin check or remove Vercel authentication to make a test pass.
2. **Final staged Production build:** after the isolated checks pass, use the dedicated Production
   database/credentials, canonical `WAITLIST_ORIGIN=https://www.revolutiontradingpros.com`,
   `MAINTENANCE_MODE=true` and `WAITLIST_SIGNUPS_ENABLED=true` in a new complete `pnpm build`
   deployment. Keep automatic custom-domain assignment disabled. Verify the exact build's methods,
   cache rules, active fieldset, configuration and database readiness before promotion. Its native
   form on the generated staged hostname is expected to reject that hostname; emailed canonical
   links point to the currently public deployment until cutover. An authorized operator API smoke
   test may target the exact protected deployment with the configured canonical `Origin` header,
   using only a controlled inbox, but that is not proof of the canonical browser flow.
3. **Canonical delivery proof:** follow the [Production promotion checklist](MAINTENANCE.md), then
   immediately repeat the complete controlled-mailbox native flow on www. Verify actual signed
   provider callbacks and scheduled retries, too. Vercel SSO can block external callbacks and cron
   execution on a protected test host; do not remove protection to work around this. Only the final
   public Production check proves those integrations. If any required check fails, restore the last
   verified maintenance deployment with capture off and reconcile queued jobs before retrying.

Never email an unrelated address during testing, record raw token URLs or claim delivery from a
202 response alone. The flag controls both emitted native markup and runtime acceptance;
environment changes alone do not update the live page.

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
