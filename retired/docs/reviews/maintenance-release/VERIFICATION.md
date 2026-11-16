# Maintenance release verification

Date: 2026-11-04. Owner authorized repairing, committing, pushing, squash-merging and publishing after verification.

## Confirmed defects

- The public domain redirected to `www` and returned the older November 3 maintenance HTML (503, no-store). A clean Chromium browser rendered it without page errors, failed resource requests, unnamed controls or lazy images lacking dimensions.
- Vercel reported `dpl_A7dnFG1hp9gczTQdDXxKG71FsPM3` as promoted. Newer `main` builds were READY while `autoAssignCustomDomains=false`; merging did not switch the public domains.
- Production environment names contained only `MAINTENANCE_MODE`, `ORIGIN`, `BETTER_AUTH_SECRET` and `POST_PASSWORD_SECRET`. No Production waitlist database, provider or capture configuration was present. The newer template nevertheless always advertised the form, while the API rejected disabled capture.

## Repair

The actual maintenance generator now includes the form, invitation and signup-specific no-JavaScript promise only for the exact `WAITLIST_SIGNUPS_ENABLED=true` value. Other values retain the support notice, chart and retry. Each enabled input has a unique identifier and name with associated visible labels. The generated emblem has explicit 40 by 40 dimensions. Unresolved template markers fail the build.

The Vite+ contract now governs new documentation and command examples. The release runbook distinguishes a Git merge, a READY staged Production build, promotion and independent public-domain verification.

## Local results

| Command / verification                                  | Result                                                                                                      |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `pnpm check:css`                                        | Pass: 90 declared properties                                                                                |
| `pnpm check`                                            | Pass: 0 errors, 0 warnings                                                                                  |
| `pnpm lint`                                             | Pass: Oxfmt, Oxlint, Svelte ESLint                                                                          |
| `pnpm test:unit --run`                                  | 75 files, 549 tests passed                                                                                  |
| `pnpm build`                                            | Pass: full Vite+ build plus maintenance generation                                                          |
| `pnpm check:pages`                                      | 47 prerendered-page contracts passed                                                                        |
| `pnpm test:seo`                                         | 3 passed                                                                                                    |
| `pnpm test:e2e`                                         | 38 passed, no skips, including authenticated admin coverage                                                 |
| `node --test tests/maintenance/build-output.test.mjs`   | 4 passed, no skips; actual function and both static outputs checked for unset/false/1/true capture settings |
| Additional Chromium / Firefox / WebKit maintenance pass | 24 passed, no skips                                                                                         |

The full browser suite used a unique throwaway account with a local PGlite database; the account was revoked after the suite. Both capture variants use the real generator; the enabled browser fixture rebuilds into a temporary directory and uses the same compiled assets. Form-response mocks verify UI behavior, not actual storage or inbox delivery.

Another session occupied port 4173 before the additional three-engine pass. That session was left running. The identical maintenance assertions were run from an ignored temporary harness with only the localhost origin changed to port 4197. No assertion, timeout or threshold was weakened.

The build retains existing large application-chunk and optional Sharp tracing notices. A successful build does not certify those unrelated notices as fixed.

## Production acceptance

Before promotion, inspect the merged commit's exact Production deployment and verify it through authenticated Vercel access: new hero, chart assets, disabled capture/support fallback, nested-route 503s, blocked APIs, privacy exception and no-store headers. Then promote that exact build and repeat browser/HTTP checks on both public hostnames. Save the deployment ID and public verification output in the release handoff.

Production waitlist capture stays off until the separate database, provider, scheduler and real-mailbox prerequisites in [the waitlist operations guide](../maintenance-waitlist/OPERATIONS.md) pass. This release does not claim that email collection or delivery is configured.

## Keyboard contrast follow-up

The first public deployment exposed a separate contrast defect during final screenshot/keyboard QA:
the focused skip link computed to `rgb(244, 245, 240)` on `rgb(220, 255, 101)`. The unlayered
`.maintenance-page a:not(.maintenance-action)` rule overrode the shared layered skip-link ink color.
Excluding `.skip` from that selector restores `var(--ink)` without duplicating the token value.

The new focused-state browser assertion first failed with the white text, then passed with the
corrected selector. The required local gates and the additional three-engine maintenance pass were
rerun, including all 38 authenticated browser tests with no skips and 24 maintenance cases. Because
the CLS session still owned port 4173, this follow-up used an ignored copy of the full test tree with
only localhost origins changed to port 4198; test assertions and thresholds remained identical.
