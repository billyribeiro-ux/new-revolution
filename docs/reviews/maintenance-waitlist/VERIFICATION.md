# Maintenance chart and waitlist implementation evidence

Date: 2026-11-04. Worktree: `/private/tmp/wt-maintenance-chart-waitlist-plan`.
Branch: `docs/maintenance-chart-waitlist-plan`, baseline `d943b10`.
This evidence records pre-merge implementation verification. Public deployment, provider
configuration, production database migration, and live email delivery are separate release steps.

## Implemented behavior

- Independent maintenance HTML with an email/consent form before the mobile chart; same-origin
  Fontsource assets and existing CSS tokens. Fonts are still imported only by `src/app.css`.
- First-party Lightweight Charts 5.2.1 rendering: candlesticks, separate volume pane, EMA 20,
  axes/readouts, continuous playback, pause/restart, manual panning and a native candle table.
  The owner requested automatic continuous playback after approving the earlier plan.
  Candles are visibly labeled **simulated demonstration data**, never real or live prices.
- GSAP entrance and form success motion, reduced-motion preference, offscreen/hidden pauses,
  scoped cleanup and independent form initialization. No chart dependency can block the native form.
- Dedicated Drizzle subscription, token, abuse-bucket, outbox and provider-event tables, plus
  forward-only migration `0002_waitlist.sql`. Subscription/challenge/job commit atomically.
- Hashed purpose-specific tokens; explicit confirmation/unsubscribe POSTs; GETs do not mutate
  subscription state. Encrypted HTML/text mail payloads are authenticated to their outbox rows.
- Durable rate limits, frozen retry keys/payloads, bounded first sends, atomic worker claims,
  fencing/lease recovery, 23-hour ambiguous-delivery review, suppression and early-event reconciliation.
- Signed webhook integration preserves existing lead handling. Confirmation queues one receipt;
  reopening is a dry-run-first, campaign-deduplicated operator command. No auth account is created.
- Exact maintenance exceptions; explicit unsupported-method 405s with no-store headers.
  Production capture defaults disabled until `WAITLIST_SIGNUPS_ENABLED=true` is configured.

## Verification results

| Check                                                         | Result                                                                                                                                          |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm check:css`                                              | Pass: 90 properties, all declared                                                                                                               |
| `pnpm check`                                                  | Pass: 0 errors, 0 warnings                                                                                                                      |
| Svelte MCP autofixer, privacy page, Svelte 5.57.3             | No issues or suggestions                                                                                                                        |
| `pnpm lint`                                                   | Pass: formatting, source lint and Svelte ESLint                                                                                                 |
| `pnpm test:unit --run`                                        | 74 files, 547 tests passed                                                                                                                      |
| Focused waitlist/data rerun after final queue-lock adjustment | 18 tests passed                                                                                                                                 |
| `pnpm build`                                                  | Pass, including separate hashed maintenance assets                                                                                              |
| `pnpm check:pages`                                            | 47 page contracts passed                                                                                                                        |
| `pnpm test:e2e`                                               | 36 passed, no skips; includes all 3 SEO specs and authenticated admin coverage                                                                  |
| `node --test tests/maintenance/build-output.test.mjs`         | 3 passed: activation/deactivation, 503/cache behavior, exact exceptions/lookalikes                                                              |
| Disposable local PostgreSQL 18.6                              | Concurrent signup/worker claims, one-use confirmation, crashed-lease recovery and terminal suppression passed                                   |
| Actual built HTTP handlers                                    | 11 method/cache/auth checks passed; [results](http-contracts.json)                                                                              |
| Chromium, Firefox, WebKit                                     | 320/375/768/1440 px: no overflow or page/console/request errors; canvas rendered; pause and reduced motion pass. [Results](browser-matrix.json) |
| Visual inspection                                             | [Desktop](chromium-1440.png), [mobile](chromium-375.png)                                                                                        |
| `git diff --check`                                            | Pass                                                                                                                                            |

The full browser run uses unique throwaway admin credentials in this worktree's local PGlite
store. Both test admins were revoked afterward. No credentials are saved with this evidence.
The focused native-form test verifies a 202 receipt and retained outbox job during provider outage.

A browser test caught an incorrect Vite preload base: chart/GSAP chunks were requested at the
site root. The separate build now explicitly uses `/_app/immutable/maintenance/`; the browser
checks verify those lazy requests succeed. The build still reports existing large application
chunks and adapter tracing notices about optional Sharp platform binaries. It exits successfully;
no thresholds were changed to suppress these notices.

Maintenance bundle sizes (raw / gzip): entry 2,949 / 1,467 bytes; chart 173,493 / 55,800 bytes;
GSAP 69,566 / 27,055 bytes. Chart loading is deferred from the form's small entry. These are
local bundle measurements, not deployed transfer measurements or a Core Web Vitals claim.

## Repeatable targeted checks

```sh
pnpm exec vp test run src/lib/server/waitlist/service.spec.ts src/lib/maintenance/data.spec.ts
node --test tests/maintenance/build-output.test.mjs
# With pnpm preview --host 127.0.0.1 --port 4195 running:
node tests/maintenance/browser-matrix.mjs
```

`tests/maintenance/postgres.ts` is opt-in and rejects everything except a disposable loopback
Postgres on port 55449 via `WAITLIST_PG_TEST_URL`. The verification run created a new temporary
cluster, applied the repository migrations, ran the tests, then stopped and deleted the cluster.
Do not point that script at an existing database.

## Outstanding release evidence

Production database provisioning/migration, verified Resend sender and credentials, actual
confirmation/receipt mailbox delivery and signed provider callbacks, supported retry scheduling,
and staged Vercel/CDN activation/deactivation verification remain outstanding. Local preview is
not Vercel's routing engine, and mocked acceptance is not inbox delivery.

No licensed historical dataset has been supplied. The current simulated chart satisfies the
continuous-demonstration behavior without claiming exchange history. Replace it with a licensed
source before labeling it historical instrument data. Actual browser 200%/400% zoom and deployed
transfer/CWV measurements were not independently certified by these local viewport checks.

See [operations and rollout requirements](OPERATIONS.md). The browser handoff host was unavailable;
local preview and the saved screenshots remain available for review.

## Pre-merge revalidation

[PR #21](https://github.com/billyribeiro-ux/new-revolution/pull/21) contains the implementation.
Application revision `fab86a3` was rebased onto `origin/main` at `f8bb878` without conflicts.
The full required gate was rerun before pushing: CSS tokens passed; Svelte/type diagnostics
reported 0 errors and 0 warnings; lint passed; 75 unit/component files with 549 tests passed;
`pnpm build` passed; 47 prerendered page contracts passed; all 3 standalone SEO tests passed;
all 36 full browser tests passed with no skips; and 3 maintenance build-output tests passed.

The first standalone SEO attempt encountered another process temporarily using port 4173.
That process exited; the unmodified suite was rerun successfully. No test thresholds or
assertions changed. A unique local test admin was revoked after the full authenticated run.
Public capture and production migration remain subject to the operations prerequisites.
