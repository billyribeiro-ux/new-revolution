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

## Published Production and protected development

Published on 2026-11-04 (America/New_York), with public checks completed on 2026-11-05 UTC.

- Application/source squash merge: [PR #25](https://github.com/billyribeiro-ux/new-revolution/pull/25),
  `6c35cf2b7fb15aee7492aa1bef142f3fee28c5fa`. Its tree exactly equals reviewed head `8560523`.
  Vercel build, Agent Review and Preview Comments all succeeded, with zero review suggestions,
  annotations or unresolved feedback. The completed CLS fix from PR #24 is included.
- Exact Production deployment: `dpl_4r3cshbeVdWiba3ZhWzBPLiRFYJo`,
  `new-revolution-244o1ejg5-will-ribeiros-projects.vercel.app`. Confirmed `READY`/Production and
  exact SHA before acceptance, then explicitly promoted. The project target was checked again
  after promotion; automatic custom-domain assignment remains disabled.
- Both the staged URL and public `https://www.revolutiontradingpros.com` passed eight HTTP checks:
  root, nested page and admin page 503/no-store; blocked admin API 503; signup GET 405; disabled
  signup POST 503 without any real address; privacy page 200; health 503 with `db.ok=false` and
  version `6c35cf2`. Production database readiness is deliberately deferred, not reported as healthy.
- Both stages passed six browser cases: Chromium, Firefox and WebKit at 320px and 1440px.
  Verified visible disabled form, green/red chart tokens and rendering, historical crosshair data,
  pause/restart/resume, reduced motion, keyboard skip-link focus/contrast, unique identified controls,
  dimensioned emblem, no unsized lazy images, zero horizontal overflow, same-origin loaded fonts,
  immutable assets 200, zero page errors and zero failed requests. Desktop/mobile screenshots were
  visually reviewed. The bare domain independently returned 308 to www, then the current 503 body.
- [Protected development Preview](https://new-revolution-development-will-ribeiros-projects.vercel.app):
  pins `dpl_2ZHf4QWgjxv2DpiZSQFFzA88vHtx`, head `8560523` (same application tree as merged `main`).
  Ten checks passed: unauthenticated paths 302 to Vercel SSO; authenticated `/` and `/about` 200
  with normal website titles; maintenance marker 200/false/no-store; health 200/database healthy;
  Chromium root/about loads without page errors. SSO remains `all_except_custom_domains`.
  The alias is a verified snapshot; [repoint it after later Preview verification](../../WAITLIST_SETUP.md).

The final integrated source was independently rechecked after the CLS merge: the complete Vite+
checks, all 559 unit/component tests, 47 page contracts, 3 SEO tests, 39 authenticated browser tests,
27 three-engine maintenance cases and 4 generated-output tests passed without skips. A missing
changelog blank line from the merge was formatted in this documentation follow-up; no application
source changed. The throwaway local PGlite admin was revoked.

Local artifacts: `/private/tmp/revolution-publish-results.json`,
`/private/tmp/revolution-ready-staged-proof.json`, `/private/tmp/revolution-ready-public-proof.json`,
`/private/tmp/revolution-development-alias-proof.json` and
`/private/tmp/revolution-ready-{staged,public}-{320,1440}.png`. These paths are local review evidence,
not hosted visitor links; private configuration files are excluded from the repository.

Real provider/domain verification, mailbox delivery and Production database configuration remain
owner-deferred. No live email or Production migration was performed. Enabling capture requires the
checks and a new complete build described in [the setup guide](../../WAITLIST_SETUP.md).
