# Maintenance experience and verified waitlist implementation plan

> **Layout, typography and copy contract: November 5, 2026.** Follow the [shared 2440px, two-font and blog interaction contract](blog/LAYOUT_AND_CONTENT_CONTRACT.md). This supersedes older width, editor-family and automatic dash-replacement recipes.

> **Blog work — November 5, 2026:** Read the [mandatory blog handoff](BLOG_AGENT_HANDOFF.md) before adding or changing articles, editor workflows, blog SEO or automation. It distinguishes the existing CMS workflow from the proposed intake tooling.

> **Fonts and article fragments — November 5, 2026:** Follow the [verified policy](FONT_AND_FRAGMENT_POLICY.md). Same-origin font hrefs and native TOC anchors are valid; verify request origins and keep section fragments out of page canonicals.

Date: 2026-11-03. Baseline: `d943b106ac8547ee088f9992219d50b5bd1928a7`.
Status: approved by the owner on 2026-11-04; implemented locally on this branch.
See [implementation evidence](reviews/maintenance-waitlist/VERIFICATION.md) and
[operations](reviews/maintenance-waitlist/OPERATIONS.md). Public rollout remains separate.
The owner subsequently requested continuous playback; the implementation labels its
demonstration candles as simulated and does not claim exchange data.

## Outcome

Replace the small static chart with a credible, interactive market chart and make the
maintenance page collect genuine, verified email subscriptions. Keep the public site in
maintenance while the normal application continues on the protected development Preview.

The finished page should feel like a carefully designed trading desk: generous chart
space, precise market typography, readable price action and a prominent, simple signup.
The backend must retain submissions through provider failures and prove email delivery
through provider events. Submission, ownership confirmation and paid membership are
distinct states.

## Verified starting point

| Evidence                                                             | Finding and consequence                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Installed `node_modules/*/package.json`, read on 2026-11-03          | GSAP `3.15.0`, Lightweight Charts `5.2.1`, Drizzle ORM `0.45.4`, Resend `6.37.0`. Use these existing dependencies.                                                                                                                                                                                                            |
| `package.json`, `pnpm-lock.yaml`, `docs/VITE_PLUS_WORKFLOW.md`       | Svelte `5.57.3`, SvelteKit `3.1.1`, adapter-vercel `7.0.2`; pnpm and the local Vite+ toolchain. Preserve `#lib`, strict types and the existing complete build script.                                                                                                                                                         |
| `scripts/templates/maintenance.html`                                 | Current chart is an SVG illustration, with an illustrative disclaimer; it is hidden below the desktop breakpoint. No real chart integration exists here.                                                                                                                                                                      |
| `scripts/maintenance-build.mjs:99–112`                               | Maintenance routing precedes normal routing. Only exact health probes and immutable application assets escape the gate. Signup, confirmation, cron and webhooks would currently return 503.                                                                                                                                   |
| `src/lib/server/services/lead-email.ts:52–77`                        | Lead capture can continue to email after database persistence fails. Its email delivers a PDF guide; duplicate submissions deliberately resend the guide. Do not use this flow for waitlist capture.                                                                                                                          |
| `src/lib/server/db/schema.ts:846–900`, `services/email-sequences.ts` | Existing email sends belong to drip enrollments. Reuse the delivery reliability patterns and global suppression checks, without creating fake sequence enrollments for waitlist subscribers.                                                                                                                                  |
| Read-only Vercel project API, 2026-11-03                             | Project `new-revolution` is resumed. `DATABASE_URL` is configured for Preview only. No project environment entries were present for `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `LEAD_FROM_EMAIL`, `CRON_SECRET` or `INTEGRATION_ENCRYPTION_KEY`. Only configuration names/scopes were inspected; no credentials are recorded. |
| `docs/reviews/maintenance-design/PRODUCTION_DEPLOYMENT.md`           | Production remains public maintenance; Preview has its own Neon database and protected development URL. Production provisioning is separate work.                                                                                                                                                                             |
| Available tool inventory                                             | No Svelte MCP analysis/autofix tools are exposed in this session. Discover again at implementation time; use them if available and otherwise record that limitation alongside the real diagnostics.                                                                                                                           |

The Vercel environment listing does not establish whether a sender domain is already
verified in a different Resend account or whether externally managed secrets exist.
Verify the intended account and sender before configuration; do not reuse another
project's credentials or database implicitly.

## 1. Visual direction: a professional market desk

### Layout and copy

- Retain the existing emblem, Montserrat/Sofia Sans fonts and project CSS tokens.
  Use deep charcoal surfaces, clear off-white typography, subtle separators and the
  existing lime accent for the primary action. Check actual candle and text contrast.
- Desktop: a restrained brand/status bar, then a roughly 40/60 split. The left contains
  a concise maintenance headline, one useful paragraph, the waitlist and direct support.
  The right is a substantial chart panel, approximately 480–560 pixels high at a normal
  desktop viewport. Avoid oversized empty hero space and tiny decorative chart cards.
- Proposed copy: **“A stronger trading experience is on the way.”** Supporting copy must
  describe only work actually being delivered. Primary button: **“Notify me when we reopen.”**
  Consent copy: **“Email me when Revolution Trading Pros reopens. Unsubscribe anytime.”**
  Include a working privacy link and explain that joining creates no paid membership.
- Mobile: put the form before a compact, still usable chart. Keep the chart visible at
  320 pixels and above; simplify peripheral readouts rather than removing the chart.
- Show real maintenance status without an invented launch date, countdown, subscriber
  count or financial result.

### The actual chart

Use Lightweight Charts v5: `createChart`, `addSeries(CandlestickSeries, ...)` and a
`HistogramSeries` in a separate volume pane. These APIs and pane support are documented
in the [v5.2 guide](https://tradingview.github.io/lightweight-charts/docs) and
[pane documentation](https://tradingview.github.io/lightweight-charts/docs/panes).

- Display a real, fixed historical OHLCV session with instrument, interval, session date,
  timezone and source visibly identified. Proposed default: SPY, five-minute bars, one
  representative session. Final instrument/date depend on a source whose public display
  and redistribution terms have been verified. No market-data provider was established
  by this audit; sourcing a permitted dataset is a prerequisite, not a fabricated fixture.
- Include proper price/time axes, crosshair, readable OHLCV values, restrained grid lines,
  consistent candle widths and a separate volume pane. Render values with instrument-
  appropriate precision. Store timestamps in UTC; format exchange/session time explicitly.
- Add one correctly calculated 20-period EMA with sufficient preceding bars for warm-up.
  Label it accurately. Avoid unsupported VWAP, arbitrary entry arrows and invented results.
- Provide **Replay / Pause / Restart** controls. Start with a useful, static chart; replay
  is user initiated. Advance through recorded bars using the chart update API, preserving
  the real sequence. Respect manual panning instead of continually snapping the viewport.
- Put the historical-replay disclosure beside the instrument. Include TradingView creator
  attribution, the upstream NOTICE text and the required TradingView link. The library
  supplies rendering, not a bundled licensed stock-market data feed.
- Provide an equivalent textual summary and an expandable OHLCV table. Native controls
  and table navigation must make the experience useful without manipulating a canvas.

### GSAP motion

Use GSAP for the panel entrance, a short stagger of the static instrument readouts and
form success transitions. Target a single, restrained entrance under one second; keep
content visible if JavaScript fails. Do not animate financial values independently of
their underlying data.

Scope animation with `gsap.context()` and use `gsap.matchMedia()` for responsive and
reduced-motion behavior. Revert contexts on cleanup; stop replay when hidden/offscreen,
disconnect observers and call `chart.remove()` on teardown. Under reduced motion, show
the completed layout immediately and retain explicit replay controls. These lifecycle
patterns follow [GSAP context](<https://gsap.com/docs/v3/GSAP/gsap.context()/>) and
[matchMedia](<https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/>).

## 2. Preserve the independent maintenance architecture

The maintenance experience is intentionally independent HTML, not a normal hydrated
marketing route. Preserve that property: its notice and form must render even if the
chart bundle, auth service or database is unavailable.

- Add a small TypeScript browser entry under `src/lib/maintenance/` for chart rendering,
  scoped motion and progressive form enhancement. Import the chart only in the browser.
- Extend `scripts/maintenance-build.mjs` to bundle the entry with the installed Vite
  toolchain using a separate config that does not reload the SvelteKit build. Confirm
  the installed programmatic build export before choosing its import path. Emit hashed
  assets under `/_app/immutable/maintenance/` into both local preview and Vercel output.
  Keep all fonts and scripts first party; do not introduce CDN script tags.
- Render the native form and fallback chart summary before JavaScript. Enhance the form
  with `fetch`, inline validation and a status announcement. A chart initialization error
  must be isolated from form handling.
- Implement backend endpoints as typed SvelteKit `+server.ts` handlers and server-only
  services. Operational confirmation/receipt/unsubscribe documents can use a small
  server HTML renderer following the existing unsubscribe endpoint pattern, with shared
  brand styles and escaped content, avoiding the normal marketing layout.
- Keep maintenance documents HTTP 503 with `noindex` and browser/CDN `no-store` headers.
  Operational successful requests return their real success statuses. Do not add a
  canonical or sitemap entry to token-bearing operational documents. Only include
  `Retry-After` on maintenance responses when an actual retry time is configured.

## 3. Durable Drizzle/Postgres model

Add a forward-only migration after the latest numbered migration (currently `0002` is
next), following the repository's existing explicit migration process. Inspect migration
tracking before running commands; do not use `db:push` against Production or edit shipped
migrations. Confirm transaction APIs against installed Drizzle `0.45.4`; the current
[official transaction guide](https://orm.drizzle.team/docs/transactions) also covers newer
releases and is not a reason to upgrade.

| Table                    | Required behavior                                                                                                                                                                                                                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `waitlist_subscriptions` | UUID, unique normalized email, pending/confirmed/unsubscribed/suppressed status, consent text version and timestamp, fixed source, created/confirmed/unsubscribed timestamps. Keep original display email if necessary. Follow existing trim/case-fold convention without Gmail dot/plus rewrites. |
| `waitlist_tokens`        | Subscription, purpose, SHA-256 token hash, expiry, consumed timestamp and challenge version. Generate 32 cryptographically random bytes; confirmation expires after 24 hours. Atomically consume once.                                                                                             |
| `waitlist_email_outbox`  | Subscription, message purpose/version, unique delivery key, encrypted frozen payload, provider message ID, attempt timestamps, next attempt, lease/fencing state and failure category. Unique constraints prevent duplicate jobs for the same challenge/receipt/launch campaign.                   |
| Durable abuse buckets    | Atomic per-IP and per-email limits, purpose-scoped HMAC keys and short retention. Reuse suitable existing infrastructure after verifying its multi-instance behavior; process memory is insufficient.                                                                                              |

Persist subscription, consent, token hash and the confirmation outbox job in **one
transaction**. If the transaction fails, return 503 and never display a saved/subscribed
success. Network calls to Resend happen after commit, outside the database transaction.

Retries need the original confirmation URL. Store lookup tokens as hashes, but preserve
the frozen email payload containing that URL **encrypted** in the outbox using AES-256-GCM,
a dedicated versioned server key and purpose/row-bound authenticated data. Do not claim
that the raw token is never persisted: it exists inside that encrypted payload until
delivery/expiry cleanup. Follow the existing crypto implementation's primitives without
coupling this key to auth credentials. Specify rotation and retention before release.

Proposed retention defaults: remove expired pending subscriptions after 30 days; remove
processed payload ciphertext after seven days; retain minimal delivery metadata for
90 days; retain suppression records sufficient to prevent accidental re-enrollment.
Align the actual published privacy notice with these settings before accepting addresses.

## 4. Signup, confirmation and notification behavior

1. Visitor submits an email and explicit reopening-notification consent. Validate on the
   server, apply durable abuse limits and atomically save the request plus email job.
   An enhanced submission receives 202 after commit. Native form submission receives a
   branded receipt document, with no email address in its URL.
2. Attempt the first queued send within a bounded request budget; await the attempt.
   A dedicated authenticated worker retries remaining jobs. Do not depend on an unawaited
   promise or a serverless process remaining alive.
3. Send an HTML **and plain-text** email: **“Confirm your Revolution Trading Pros waitlist
   request.”** Acknowledge receipt, explain the single reopening notification, and include
   a confirmation button, support and opt-out. No PDF guide, sales sequence or membership
   account is created.
4. Email-link GET displays a confirmation page. Its explicit POST consumes the token and
   changes status to confirmed atomically, then queues one receipt: **“You’re on the
   Revolution Trading Pros waitlist.”** GET must never mutate consent; mailbox scanners
   frequently visit links.
5. Duplicate submissions receive a generic accepted message. Keep an existing valid
   challenge usable; enforce resend cooldowns and do not send another receipt to an
   already confirmed subscriber on every submission. Never anonymously clear an opt-out
   or a bounce/complaint suppression. Document a separate verified re-consent flow if
   rejoining is later required.
6. Unsubscribe uses a purpose-specific opaque token. GET shows the choice; POST applies
   the opt-out and cancels unsent jobs. Include signed one-click POST headers where
   applicable; test scanners and actual mailbox unsubscribe behavior separately.
7. At reopening, an authenticated operator runs a purpose-specific, dry-run-first launch
   batch against confirmed, non-suppressed subscriptions. Create one outbox job per
   subscriber/campaign with a unique constraint and recheck eligibility before each send.
   A protected CLI is sufficient initially; a new admin dashboard is outside this scope.

Website feedback must distinguish **request saved**, **confirmation requested** and
**address confirmed**. Provider acceptance is not inbox delivery; delivery webhooks are
evidence of the latter. Pending subscribers are retained even during an email outage.

## 5. Email delivery, abuse controls and observability

- Use the existing Resend SDK and appropriate server configuration resolver, with an
  explicitly configured waitlist sender and reply-to. Verify ownership and sender setup
  in the intended account. Configure SPF/DKIM and appropriate DMARC. Resend requires a
  [verified sending domain](https://resend.com/docs/dashboard/domains/introduction).
- Reuse the existing delivery service's lease and frozen-payload patterns in the dedicated
  queue. Concurrent workers must claim atomically and use fencing on completion. Retry
  transient failures with backoff/jitter, respect provider throttling and stop permanent
  failures. Recheck global suppression and subscription eligibility immediately before send.
- Keep each retry's payload and provider idempotency key identical. Resend retains
  [idempotency keys for 24 hours](https://resend.com/docs/dashboard/emails/idempotency-keys).
  An ambiguous attempt past that window requires reconciliation/operator review rather
  than an automatic duplicate. Never promise unlimited exactly-once external delivery.
- Extend the existing signed Resend webhook to resolve waitlist message IDs, preserve
  existing lead behavior, deduplicate events and apply delivery/bounce/complaint states
  without reverting terminal states on out-of-order events. Use the raw body for
  [signature verification](https://resend.com/docs/webhooks/verify-webhooks-requests).
  Persist unmatched early events and reconcile them after provider IDs are committed.
- Validate a bounded request body (initially 4 KiB), content type, email length and consent
  version. Return 400/413/415 for invalid input, 405 for unsupported operational methods,
  and 429 with a real reset interval for throttling. Avoid recipient-existence disclosure.
- Enforce same-origin form requests for the configured apex/www origins and explicit
  protected Preview origin. Do not trust a client-supplied source or arbitrary Referer.
  Keep webhook signature auth and cron bearer auth separate from browser origin checks.
- Initial abuse policy: five attempts per IP per 15 minutes; at most one confirmation
  email per address per 15 minutes and three per day. Use a honeypot as a secondary
  signal, not the sole control. Tune with real aggregate evidence; add a server-verified
  challenge only if needed. Do not add an unconfigured CAPTCHA dependency.
- Never log raw recipient addresses, form bodies, tokens, token URLs or decrypted provider
  payloads. Avoid analytics on token pages and use `Referrer-Policy: no-referrer` there.
  All keys and authorization decisions stay in server-only modules.
- Expose aggregate queue depth, oldest pending age, permanent failures and confirmed
  counts through authenticated operations. Alert on stalled delivery; avoid fake public
  counters. Document safe inspection, retry, deletion/export and encryption-key rotation.

## 6. Exact maintenance exceptions

Add narrowly anchored exceptions before the maintenance catch-all and route them to
the adapter's actual generated handlers. Do not merely let them fall into the same
503 catch-all or assume generated function names. Preserve query strings for token views.
Vercel documents [method-specific Build Output routes](https://vercel.com/docs/build-output-api/configuration).

| Path                                  | Allowed operation during maintenance                                           |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| `/api/waitlist`                       | POST validated signup; native and enhanced responses                           |
| `/waitlist/confirm`                   | GET/HEAD confirmation document; no mutation                                    |
| `/api/waitlist/confirm`               | POST single-use confirmation                                                   |
| `/waitlist/unsubscribe`               | GET/HEAD opt-out document; no mutation                                         |
| `/api/waitlist/unsubscribe`           | POST signed opt-out, including supported one-click request                     |
| `/api/webhooks/resend`                | POST verified provider events only                                             |
| `/api/cron/waitlist-email`            | GET with required cron bearer authentication                                   |
| `/privacy-policy`                     | GET/HEAD existing public privacy information; ensure its linked resources work |
| `/api/health` and `/_app/immutable/*` | Preserve existing probes/assets; verify methods and caching                    |

Unsupported methods on these operational paths must deliberately return 405 without
opening other application methods. Test exact trailing-slash handling and ensure deeper
lookalike routes still return maintenance 503. Keep admin/auth, unrelated cron jobs,
lead capture, other APIs and public marketing content blocked. Responses containing
submission/token state must be no-store at browser and CDN layers.

Add a dedicated worker schedule only after verifying the Vercel team's plan and schedule
limits. The existing every-minute publisher cron does not prove that waitlist retries are
configured. [Hobby cron is limited to daily execution](https://vercel.com/docs/cron-jobs/usage-and-pricing);
if that is the actual plan, select an appropriate supported scheduler before promising
prompt retries. Do not unblock the existing marketing drip worker to solve this.

## 7. Files and implementation order

1. **Visual prototype and dataset:** replace `scripts/templates/maintenance.html`; add
   `src/lib/maintenance/{client,chart,replay}.ts` and a sourced, validated data fixture with
   provenance/license notes. Extend `scripts/maintenance-build.mjs` for hashed assets.
   Review rendered desktop/mobile screenshots and actual interactions before treating
   the visual work as complete.
2. **Persistence and delivery:** claim `src/lib/server/db/schema.ts`, add the next migration,
   implement `src/lib/server/services/waitlist.ts`, a dedicated outbox worker, token/crypto
   helpers and HTML/text email templates under `src/lib/server/email/`. Keep shared helper
   extraction small and justified; do not refactor the existing drip system wholesale.
3. **Operational endpoints:** add the exact handlers above, extend the signed webhook,
   implement native receipt/confirmation/opt-out documents and wire form enhancement.
   Add durable rate limiting using the existing infrastructure where suitable.
4. **Maintenance routing and operations:** add the allowlist to the build script and the
   dedicated worker to `vercel.json`; document configuration in `.env.example` with
   placeholders only and update `docs/MAINTENANCE.md`, the relevant backend plan and
   changelog. `vercel.json` is currently claimed by `feat/ymyl-launch-hardening`; coordinate
   that edit before implementation. Preserve existing work in hooks and other hot files.
5. **Verification and rollout:** complete the tests below, provision isolated Production
   dependencies, and prepare a concrete staged deployment for review. Public promotion
   requires deployment authorization; this planning task changes no deployment.

## 8. Acceptance tests and release evidence

| Area             | Required proof                                                                                                                                                                                                                                                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Market data      | Provenance and redistribution permission; strictly increasing unique timestamps; finite OHLC values with valid high/low bounds; nonnegative volume; verified session/timezone and EMA warm-up.                                                                                                                                               |
| Browser/UI       | Actual rendered page at 320, 375, 768 and 1440+ pixels in Chromium, Firefox and WebKit; no horizontal overflow, broken assets or application errors; chart uses genuine v5 canvas rendering. Record bundle transfer sizes and ensure chart loading does not delay usable form content.                                                       |
| Accessibility    | Keyboard controls and focus, labeled email/consent/errors, status announcement only for form state, semantic headings, contrast, 200%/400% zoom, reduced motion, no-JS native signup and readable chart alternative. No rapidly updating live region for prices.                                                                             |
| Persistence      | Duplicate and concurrent signups create one subscription and bounded jobs; transaction failure returns 503 with no false success; provider outage retains jobs; lease expiry/crash recovery is safe; identical-key retry does not duplicate sends. Exercise concurrent claims against real isolated Postgres as well as fast PGlite tests.   |
| Tokens           | Expired, malformed, replayed and wrong-purpose tokens fail safely; link-scanner GET creates no writes; confirmation and receipt deduplicate atomically; unsubscribe cancels pending messages; suppression is never cleared by public signup.                                                                                                 |
| Provider         | Unit/sandbox tests for both HTML/text messages; unsigned/replayed/out-of-order/early webhooks; throttling and the 24-hour idempotency boundary. A controlled real mailbox receives both confirmation and receipt; correlate message IDs with delivery events. Provider acceptance alone is insufficient.                                     |
| Routing/cache    | Activated/deactivated build tests, direct/nested requests and SPA-to-maintenance navigation; blocked paths503, exact exceptions functional, unsupported methods405, unauthenticated cron rejected, signed webhook verified, health/fonts/chart chunks available. Test CDN no-store and restoration after deactivation on real Vercel output. |
| Privacy/security | Production/Preview isolation, test recipient allowlist, no credentials in client assets, no raw email/token logs, no token referrer/analytics leaks, published purpose/retention and functional privacy link.                                                                                                                                |

Extend `tests/maintenance/build-output.test.mjs`, add focused service/endpoint tests and
Playwright maintenance/signup coverage. Run the complete existing gate without lowering
thresholds or skipping credential-gated suites; report real counts and any skips:

```bash
pnpm check:css
pnpm check
pnpm lint
pnpm test:unit --run
pnpm build
pnpm check:pages
pnpm test:seo
pnpm test:e2e
node --test tests/maintenance/build-output.test.mjs
```

A local `pnpm preview` is not Vercel's routing engine. Verify exact production-output
allowlisting on a staged cloud deployment as well. Keep the deployed Node 24 sanitizer
SSR bundling fix intact. Rediscover Svelte MCP and analyze/autofix any changed Svelte
files when available; do not report unavailable tools as having run.

## 9. Production prerequisites and rollback

- Provision a distinct Production Postgres/Neon database; do not connect Production to
  the Preview database. Apply the existing baseline plus the new migration through the
  verified repository migration process. Back up and inspect any nonempty database first.
- Configure Production-only provider credentials, verified sender/reply-to, webhook secret,
  cron secret and dedicated outbox encryption/rate-limit keys. Preview sends must be
  restricted to controlled recipients and must not contact real subscribers.
- Verify the market-data display rights, cron plan, full privacy copy, real mailbox
  delivery and suppression before exposing the signup button publicly.
- Retain Production maintenance and the protected normal development URL. Keep automatic
  production-domain promotion disabled during development; final cloud rollout is a
  separate explicit deployment step.
- Add a server-controlled `WAITLIST_SIGNUPS_ENABLED` switch for capture. Turning capture
  off must not break existing confirmation, unsubscribe, webhook or queue operations.
  Document which switches require a Vercel redeployment.
- Roll back visual code independently from subscriber data. Never drop subscriber tables
  or remove operational routes while outstanding confirmation links or emails exist.
  At normal-site reopening, keep operational handlers available, send only the approved
  reopening campaign and verify ordinary application responses return after maintenance
  is disabled.

## Verification of this planning change

This plan is based on source inspection, installed package metadata, official documentation
and a read-only Vercel configuration audit. It does not establish that signup, chart,
confirmation or delivery acceptance tests have passed: those features are not implemented.
Application tests and builds are implementation gates, not results of writing this plan.
