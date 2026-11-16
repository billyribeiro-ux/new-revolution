# Repository Audit

**Audit date:** November 16, 2026  
**Baseline:** `bc73303` on `main`  
**Status:** Discovery complete; remediation items below remain open.

This file preserves the end-to-end discovery and provides a running follow-up checklist. Counts and test results describe the audited baseline; re-verify them after implementation changes. Follow [AGENTS.md](AGENTS.md) and the active domain standards in `docs/` when addressing findings.

## Assessment

The repository has a working public education and publishing application and a substantial authenticated CMS/CRM. Its local verification baseline passes. Customer account, membership comparison, admissions, and enrollment journeys remain incomplete: **67 of the 99 prerendered pages are explicit TODO shells**. Passing the current gates does not establish commercial launch readiness.

The discovery covered repository instructions, configuration, routes, shared components and styles, authentication, database selection, publishing, media, leads/email, analytics, maintenance, deployment output, and verification tooling. All eight project verification commands were executed, followed by a dependency audit and additional local HTTP and cross-browser layout probes.

## Stack and inventory

| Area                    | Verified baseline                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| Runtime                 | Node `26.13.0`, pnpm `12.16.1`                                                                              |
| Application             | Svelte `5.57.3`, SvelteKit `3.2.0`, TypeScript `6.0.3`                                                      |
| Toolchain               | Vite+ `1.6.0`, Vitest `5.1.0`, Playwright `1.65.1`                                                          |
| Hosting target          | Vercel functions using `nodejs24.x`                                                                         |
| Source                  | 921 files under `src/`                                                                                      |
| Routes                  | 62 page templates, 38 HTTP endpoint templates, 16 remote-function modules                                   |
| Unit/component coverage | 105 spec files, 750 passing tests                                                                           |
| Database schema         | 55 tables: 46 application/legacy, four Better Auth, five waitlist                                           |
| Migrations              | Five forward-only SQL files, `0000` through `0004`                                                          |
| Content packages        | 43 Markdown article packages under `content/blog-posts/`                                                    |
| SEO inventory           | 124 entries: 31 indexable, 93 nonindexable                                                                  |
| Prerendered output      | 99 pages: 26 indexable, 73 nonindexable                                                                     |
| TODO shells             | 67: 33 store, 22 resources, eight enrollment, plus login, register, memberships, and mentorship application |

Installed versions were checked against `package.json`, the lockfile, and `pnpm list --depth 0`. SvelteKit configuration lives in [vite.config.ts](vite.config.ts). Article packages on disk do not establish their publication status in a hosted CMS. The SEO inventory includes local fixture URLs and does not represent a live production content inventory.

## Application map

| System          | Main locations                                                                                                                                                                    | Current behavior                                                                                                                                                                                                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public site     | `src/routes/`, `src/lib/data/`, `src/lib/components/home/`                                                                                                                        | Marketing pages, methodology, room/alert overviews, legal/editorial pages, reference directories, and two public calculators. Homepage/blog use SSR; stable marketing/catalog destinations are prerendered.                                                                                              |
| Publishing      | [posts service](src/lib/server/services/posts.ts), [atomic save](src/lib/server/db/save-post.ts), [blog discovery](src/lib/server/services/blog-discovery.ts), `src/routes/blog/` | Shared validation and content preparation, SEO publish gate, atomic writes, revisions, search projections, slug redirects, scheduling, and public eligibility filters. Listings update through SSR. Article/feed cache policies and tags exist; hosted CDN purge remains unwired.                        |
| Admin           | `src/routes/admin/`, `src/lib/remote/admin/`                                                                                                                                      | Dashboard, editor, media, leads/subscribers, sequences/email analytics, calls, inbox, notifications, analytics, consent, campaigns, and integrations. Better Auth sessions, admin roles, mutation-origin checks, and login rate limiting protect workflows. REST and remote-function transports coexist. |
| Media           | [media service](src/lib/server/services/media.ts), [storage drivers](src/lib/server/media-storage.ts)                                                                             | Upload validation, WebP variants, cover crops, disk/Blob storage, and shared editor/public prose image contracts. Production uploads have no implicit ephemeral disk fallback.                                                                                                                           |
| Leads and email | `src/lib/server/services/`, `src/lib/server/email/`, `src/lib/server/waitlist/`                                                                                                   | Database-backed contact/lead services, Resend delivery/webhooks, recoverable sequence delivery ledger, and encrypted waitlist/token/outbox operations. Current `/contact` renders conditional email/phone channels rather than the existing contact-form remote service.                                 |
| Operations      | [server hooks](src/hooks.server.ts), [maintenance build](scripts/maintenance-build.mjs), [Vercel configuration](vercel.json)                                                      | Request/session guards, indexing headers, redirects, commerce blocking, maintenance responses, standalone brand CSS, health, cron, unsubscribe, consent, and tracking endpoints.                                                                                                                         |

### Design and layout contract

[src/app.css](src/app.css) is the shared stylesheet, token, and font source imported by the root layout. At the baseline it contains 8,777 lines, including the cascade order and shared inner-page primitives. Component styles use native scoped Svelte CSS; raw CMS prose and selected domain styles have documented exceptions.

The documented project container is **96rem / 1536px**, including padding, with **1424px inner width** at the wide breakpoint. This project convention takes precedence over the personal default of 99rem. Font roles are self-hosted **Plus Jakarta Sans**, **Inter**, and **Geist Mono**, with optional font display and calibrated fallbacks. Blog prose remains container-flush; its external sticky TOC starts at **1900px**. Navigation measures content fit and switches to compact mode.

See [CSS standards](docs/CSS_STANDARDS.md) and the [blog contract](docs/BLOG_CONTRACT.md).

### Environment and active gates

- Local configuration was classified without displaying credentials: `.env` contains a placeholder database; `.env.local` configures hosted PostgreSQL, a Blob token, and `PUBLIC_ENV=development`. Ordinary `pnpm dev` can therefore use hosted data/media.
- Audit verification used explicit in-memory databases and disabled external email, Blob, and search integrations.
- `COMMERCE_ENABLED=false`, `CONCEPT_PREVIEW=false`, store launch gating, and free eBook unavailability remain in effect. Local `/checkout` returned `403`.
- Hosted deployment settings, actual hosted signing secrets, and external scheduler configuration were not inspected.

## Open findings and follow-up checklist

### A01 — Production auth-secret validation

- [ ] Reject missing, placeholder, and inadequate signing secrets in hosted production; add meaningful regression coverage.

[src/env.ts](src/env.ts) supplies a known development secret when `BETTER_AUTH_SECRET` is missing, and [auth.ts](src/lib/server/auth.ts) passes it to Better Auth. [assertProductionEnv()](src/lib/server/config/runtime.ts) currently performs no validation. An isolated in-memory Better Auth probe accepted the repository fallback under `NODE_ENV=production`.

This confirms a missing-configuration risk. It does not establish which secret a hosted deployment actually uses. The implementation is weaker than the fail-closed behavior described in the operational documentation.

### A02 — Transitive dependency advisories

- [ ] Review affected dependency paths and safely remediate the current advisories; rerun `pnpm audit --json` and applicable gates.

The November 16 audit returned exit `1`, with **one high and two moderate advisories**, zero critical:

| Severity | Package     | Affected path                                            | Reported patched range |
| -------- | ----------- | -------------------------------------------------------- | ---------------------- |
| High     | `zod`       | `@vercel/blob → @vercel/oidc → @vercel/cli-config → zod` | `>=4.6.6`              |
| Moderate | `glob`      | `@sveltejs/adapter-vercel → @vercel/nft → glob`          | `>=14.0.2`             |
| Moderate | `minimatch` | Adapter/NFT/Glob and TypeScript ESLint dependency paths  | `>=11.0.1`             |

The top-level `zod@4.6.7` is not the affected nested copy. No dependency versions were changed during discovery. These results are dated; obtain fresh advisory data before remediation.

### A03 — Operational scheduling

- [ ] Verify external scheduling or add the missing checked-in schedules for daily/weekly analytics and sequence email delivery.

[vercel.json](vercel.json) schedules only `publish-scheduled` and `waitlist-email`. Handlers exist for `analytics-daily`, `analytics-weekly`, and `send-sequence-emails`, but no schedules for those handlers are checked in. Daily aggregation, consent-retention enforcement, and email-sequence processing depend on those jobs being invoked. External scheduler state remains unverified.

### A04 — Authenticated E2E database isolation

- [ ] Align database/seed path selection, `PLAYWRIGHT_DATABASE_URL`, and the authenticated E2E runbook; prove a disposable seeded admin/server share the same isolated database and are cleaned up afterward.

[The runbook](docs/VITE_PLUS_WORKFLOW.md) instructs a disposable `pglite://` path, but [database selection](src/lib/server/db/index.ts) and [seed-admin.ts](scripts/seed-admin.ts) always choose `.svelte-kit/pglite-blog` for filesystem PGlite. [playwright.config.ts](playwright.config.ts) uses `PLAYWRIGHT_DATABASE_URL`, defaulting to `memory://e2e`, rather than inheriting `DATABASE_URL` as the documented recipe assumes.

Following the recipe does not create the promised isolated shared seed/server target. No admin account was seeded during this discovery; 17 credential-dependent E2E cases remained skipped.

### A05 — Missing blog images return successful placeholders

- [ ] Separate development/test placeholder rendering from production missing-media behavior and verify publishable media independently of HTTP success alone.

`GET /images/blog/discovery-file-does-not-exist.webp` returned **`200 image/svg+xml`** containing a generated placeholder. [The handler](src/routes/images/blog/[...file]/+server.ts) does not restrict this fallback to development/test. Missing images can therefore pass status/image checks without the intended asset existing. This also corresponds to roadmap finding `F13`.

### A06 — Custom blog JSON-LD validation

- [ ] Recursively validate custom JSON-LD, reject prohibited nested types and duplicate/conflicting identifiers, and cover the resulting graph in tests.

[dropRestrictedJsonLdNodes()](src/lib/seo/blog-seo.ts) filters restricted types at the top level only. [The article loader](src/routes/blog/[slug]/+page.server.ts) appends custom nodes without recursive restriction or duplicate-ID validation. Related roadmap findings: `F03` and `F11`.

### A07 — PATCH minor-edit propagation

- [ ] Forward `minorEdit` through `patchPost` into the save path and verify editorial modification-date behavior with unit/database coverage.

[patchPost()](src/lib/server/services/posts.ts) constructs the update payload without forwarding `minorEdit`. This remains roadmap finding `F12`.

### A08 — Accessibility audit tooling

- [ ] Run actual `axe-core`, fix confirmed accessibility defects, and make heuristic output clearly distinguishable from axe results.

[tests/seo/lab.ts](tests/seo/lab.ts) writes `axe.json` from handwritten DOM checks rather than an actual axe-core run. Its heading checks also include hidden dialog headings. A green local gate does not establish comprehensive WCAG compliance. Real accessibility remediation and verification remain in roadmap findings `F04` and `F05`.

### A09 — Versioned CI enforcement

- [ ] Add a versioned CI workflow enforcing the eight project gates with isolated test data and explicit handling of authenticated E2E coverage.

No versioned workflow exists under `.github/workflows/` to run the required sequence on each push. This remains roadmap finding `F14`.

### A10 — Incomplete customer journeys

- [ ] Complete the memberships comparison, member login/registration, admissions, and enrollment journeys before enabling commerce; track remaining resource/store shells separately.

Prominent membership/login destinations lead to TODO shells. The generated output contains 67 such shells. The current gates correctly keep these destinations nonindexable, but their existence does not make the customer workflows usable. See the [TODO registry](src/lib/data/todo-pages.ts), [launch gates](src/lib/data/launch-gate.ts), and [roadmap](todo.md).

### A11 — Operational documentation drift

- [ ] Reconcile deployment promotion instructions with verified hosted settings, repair the test runbook, and replace the incomplete launch summary with the actual remaining work.

[ADMIN_AND_OPS.md](docs/ADMIN_AND_OPS.md) describes `autoAssignCustomDomains=false`, while the latest changelog/temporary registry records enabling automatic aliasing. [remaining.md](remaining.md) says only three non-code launch steps remain despite the confirmed shells and open engineering work. Hosted deployment settings were not queried. Some roadmap entries are stale in the opposite direction: placeholder contact defaults have already been removed from the current config.

### A12 — Outstanding evidence assets

- [ ] Supply and review the historical primary evidence and founder portrait before representing them as verified published assets.

`VERIFIED_CASE_STUDIES` is empty in [homepage.ts](src/lib/data/homepage.ts), all three historical `chartImage` slots are null in [methodology.ts](src/lib/data/methodology.ts), and the founder portrait uses an emblem fallback in [site.ts](src/lib/data/site.ts). The trade ledger does not fabricate verified rows. These overlap owner evidence tasks and temporary items `T9`/`T11`.

## Executed verification

These results belong to the discovery baseline. The documentation-only addition of this audit does not represent a new application verification run.

| Command                     | Result                                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| `pnpm check:css`            | Passed; 130 referenced custom properties declared; font policy passed                           |
| `pnpm check`                | Passed; zero errors, zero warnings                                                              |
| `pnpm lint`                 | Passed; formatting, Oxlint, and ESLint exited `0`                                               |
| `pnpm test:unit --run`      | Passed on rerun; 105 files, 750 tests                                                           |
| `pnpm build`                | Passed; complete SvelteKit/Vercel/maintenance build and native Sharp/offline email verification |
| `pnpm check:pages`          | Passed; 99 page contracts                                                                       |
| `pnpm test:seo`             | Passed; three tests against the checked-in local inventory                                      |
| `pnpm exec playwright test` | Passed; 66 passed, 19 skipped, zero failures                                                    |
| `pnpm audit --json`         | Exit `1`; one high and two moderate transitive advisories                                       |

The 19 browser skips comprise **17 admin-dependent cases without credentials** and **two concept-only cases inactive with `CONCEPT_PREVIEW=false`**.

The first unit attempt applied `PUBLIC_ENV=production` too broadly and encountered the sandbox's localhost listen restriction. Rerunning with `PUBLIC_ENV=development` and approved local browser/server access passed the unchanged suite. The initial failure was retained in the discovery logs. No application code was changed to make checks pass.

The build still emits optional cross-platform Sharp trace warnings. Required native Sharp and mocked offline email checks passed on **Darwin ARM64 / Node 26**; this is not a Linux Node 24 runtime verification.

### Additional browser and HTTP checks

- **108 layout samples** across Chromium, Firefox, and WebKit: eight routes at 320, 768, 1584, and 1920px (96 samples), plus four routes per engine at 200% root text size (12 samples).
- Routes: `/`, `/about`, `/live-trading-rooms`, `/resources/options-calculator`, `/blog`, `/blog/institutional-order-flow-and-gamma-flip-playbook`, `/memberships`, and `/admin/login`. The text-enlargement subset used home, about, the options calculator, and the article.
- No document horizontal overflow in those samples; no page errors on the 96 normal-size samples. Representative layout coverage is not an exhaustive accessibility certification.
- Local health returned `200`; unauthenticated admin/media APIs returned `401`; commerce returned `403`. Checks used isolated local data.
- Screenshots were inspected for the 320px and 1584px homepage and the 1920px article/TOC layout. An admin login screenshot was also captured.

Original logs, raw advisory results, measurements, and screenshots were saved under `/private/tmp/new-revolution-discovery-y57rom8v/`. That directory is temporary and unversioned; this file preserves the findings and results independently of its availability.

## Recommended work order

1. Address production secret validation and transitive dependency exposure (`A01`, `A02`).
2. Establish reliable scheduling, CI, and authenticated test isolation (`A03`, `A04`, `A09`).
3. Close CMS media/schema/date gaps and perform a real accessibility audit (`A05`–`A08`).
4. Complete the core customer journeys, then expand the remaining resource/store pages (`A10`). Preserve launch gates until explicitly authorized.
5. Reconcile operational/launch documentation and attach reviewed evidence assets (`A11`, `A12`).

For each completed item, record the change, relevant verification, and completion date here, and update [todo.md](todo.md), [CHANGELOG.md](CHANGELOG.md), and [docs/TEMPORARY.md](docs/TEMPORARY.md) where applicable.

## Git history consolidation — November 16, 2026

The owner authorized replacing the 98-commit `main` history with one clean baseline, preserving the current project and this audit. The original discovery baseline `bc73303` and historical commit identifiers in existing documentation refer to the preserved history.

A full Git bundle and copies of the pending audit documentation were saved outside the checkout at `/Users/billyribeiro/dev/new-revolution-history-backups/2026-11-16-m4jewsz3/`. The backup directory includes restoration instructions. Remote publication uses an explicit force-with-lease against the inspected GitHub head so an intervening update cannot be overwritten silently. The open application findings above are unaffected by history consolidation.
