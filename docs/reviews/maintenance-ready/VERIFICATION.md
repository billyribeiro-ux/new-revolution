# Green/red market playback and prepared waitlist

Date: 2026-11-04 (America/New_York). The owner requested realistic green/red chart behavior, a
visible email section, immediate thanks and progress updates, while normal website development
continues separately. The owner explicitly chose to connect services later. No service provisioning,
Production migration or actual email send is claimed by this preparation.

## Implementation

- Green/red candle bodies, wicks and volume use maintenance-scoped tokens. Bounded deterministic
  ticks make reversals, grow candle extremes/volume and finish at exact OHLC. Crosshair inspection
  shows historical OHLCV. Simulation labels, attribution, pause/restart, reduced motion and the
  equivalent candle table remain.
- The completed waitlist form is always visible. Without explicit capture activation, a disabled
  native fieldset and availability note prevent submissions; client initialization also checks state.
- Shared consent text/version controls generated markup and server acceptance. Immediate mail
  thanks the requester and asks for confirmation. Confirmation targets its specific welcome receipt.
  Deferred provider failures remain in the encrypted outbox.
- Progress-update campaigns use new explicit permission, dry-run-first queueing, fixed campaign
  keys, suppression/unsubscribe checks and forward migration `0003_waitlist_updates.sql`. Older
  reopening-only permission remains restricted. No public bulk-send endpoint is added.
- The worker has its own minute cron entry and requires the configured secret. Setup, configuration
  preflight and explicit migration helper are documented in [WAITLIST_SETUP.md](../../WAITLIST_SETUP.md).

## Verification

| Check                               | Result                                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `pnpm check:css`                    | 90 declared properties, pass                                                                            |
| `pnpm check`                        | 0 errors, 0 warnings                                                                                    |
| `pnpm lint`                         | Oxfmt, Oxlint and Svelte ESLint pass                                                                    |
| `pnpm test:unit --run`              | 76 files, 559 tests pass                                                                                |
| `pnpm build`                        | Complete Vite+ build including maintenance generation passes                                            |
| `pnpm check:pages`                  | 47 prerendered-page contracts pass                                                                      |
| SEO browser gate                    | 3 pass                                                                                                  |
| Complete authenticated E2E          | 39 pass, no skips                                                                                       |
| Chromium/Firefox/WebKit maintenance | 27 pass, no skips; palette, crosshair, both capture states, keyboard, reduced motion and native markup  |
| Node generated-output tests         | 4 pass; emitted function and both static HTML copies, all capture flag states                           |
| Privacy Svelte autofixer            | 0 issues, 0 suggestions                                                                                 |
| Operator helper fixtures            | Configuration-only preflight and non-connecting migration dry-run pass without printing fixture secrets |
| Desktop/mobile visual check         | 1440px and 320px: visible disabled form, green/red chart, zero overflow or page errors                  |

Authenticated tests used a unique local PGlite account, revoked after the run. The other CLS session
owned port 4173, so ignored copies of the same tests changed only localhost origins to port 4198.
No assertions or thresholds were weakened. Existing build chunk/optional dependency tracing
notices remain; no toolchain packages were changed.

## Production versus development

Read-only Vercel checks confirmed normal authenticated Preview `/` and `/about` return200, the
marker is `{ "maintenance": false }`, and its database health is200. Unauthenticated Preview
requests redirect to Vercel SSO. Public Production `/` and `/about` return maintenance503/no-store.
A Production `.vercel.app` alias is also a maintenance build and is not a development URL.

Before publication, verify the exact merged Production SHA and the built green/red chart/disabled
form; promote only that build, then repeat public HTTP and three-engine checks. Give the owner a
normal protected Preview alias for website work. Keep public automatic promotion disabled and the
active CLS worktree intact.

Real provider/domain verification, mailbox delivery and Production database configuration remain
owner-deferred. Enabling capture requires those checks and a new build as documented.
