# Dependency update verification — November 15, 2026

Scope: the owner's 45-row package list plus verification of TypeScript compatibility with SvelteKit 3. The starting commit is `8f14dbeb83dad7dfda467af23899c2e4be68a48a`. Work stays on the sole `main` branch. Production CMS records, hosted configuration and indexing policies are unchanged by this dependency work.

## Release and TypeScript decisions

Every requested target was checked against official npm registry metadata and installed at the requested version. [Requested releases](requested-releases.json) record upstream peers, engines, repositories and integrity hashes; [installed releases](installed-releases.json) record the direct version comparison. The additional direct `d3-transition@^3.0.2` dependency makes an existing chart runtime requirement explicit.

TypeScript **6.0.3 remains pinned**. The registry's `latest` tag is 7.0.2, but the only stable 6.x releases are 6.0.2 and 6.0.3. The intersection of the current supported ranges includes 6.0.3 and excludes 7:

| Tool                     | Declared TypeScript peer |
| ------------------------ | ------------------------ |
| SvelteKit 3.2.0          | `^6.0.0`                 |
| Svelte Check 4.7.8       | `^5.0.0                  |     | ^6.0.0` |
| typescript-eslint 8.72.2 | `>=4.8.4 <6.1.0`         |

Primary metadata: [Kit](sveltejs_kit-metadata.json), [Svelte Check](svelte-check-metadata.json), [typescript-eslint](typescript-eslint-metadata.json), [TypeScript registry tags](typescript-metadata.json). The installed Kit package also uses `typescript: ~6.0.3` for its own development. Retain `$app/tsconfig`, strict mode and the workspace TypeScript SDK; no TypeScript 7 preview or compatibility suppression was introduced.

## Vite+ upgrade

Read the official upgrade, migration, migration-rules and Vitest 5 guides before changing dependencies. Ran the target CLI first:

```bash
pnpm dlx --package=vite-plus@1.6.0 vp help migrate
pnpm dlx --package=vite-plus@1.6.0 vp migrate --no-interactive --no-hooks --no-agent --no-editor
```

The upgrade-only migrator updated the existing catalog and lockfile, with no BLOCK/REVIEW findings, first-time setup, generated v4/tsdown compatibility settings, source rewrites or changes to `vite.config.ts`. Preserved the complete build script, all 37 explicit Svelte lint rules, the existing ESLint Vite+ import-policy bridge, test assertions, time limits, budgets and runtime pins. The obsolete PGlite 0.5.15 release-age exception was removed after moving to 0.5.16. Frozen installation and `pnpm peers check` pass.

Verified installed toolchain: Node 26.13.0, pnpm 12.16.1, Vite+ 1.6.0, Vite 8.3.7, Rolldown 1.2.18, Vitest/browser provider 5.1.0, Oxlint 1.93.0, Oxfmt 0.78.0 and tsdown 0.23.4. Current stack references in `AGENTS.md`, `GEMINI.md` and `docs/VITE_PLUS_WORKFLOW.md` were refreshed. T15 remains in place; this run does not claim a constrained Linux allocator fix or hosted CI verification.

## Regression found and repaired

The unchanged starting lockfile passes **79/79 authenticated browser tests**, including the dashboard. The initial updated stack passed 69 cases but failed dashboard initialization and blocked nine later serial admin cases. The first diagnostic run also saw a transient enlarged-text overflow; that case passed in the independently installed update snapshot and baseline, with its assertion unchanged.

The dashboard HTML response was HTTP 200 with the correct title, but browser hydration logged `TypeError: t.selectAll(...).interrupt is not a function` and rendered the 500 error page. D3 7.9.2 re-exports `d3-transition` through a side-effect-free barrel; production tree shaking omitted selection prototype initialization when only other exports were used. `src/lib/charts/d3.ts` explicitly imports `d3-transition` and re-exports D3. All four charts that call `.transition()` or `.interrupt()` use that shared entry. Chart data, rendering behavior and appearance are preserved.

The existing authenticated dashboard test caught the production-only failure, so its assertion and coverage are preserved. Full source for all four changed components was checked with the official Svelte autofixer: zero issues; three had zero suggestions. The donut's conditional advisory about calling a function inside `$effect` was reviewed: `render` reads props and mutates D3 DOM, with no Svelte state reassignment, so its documented ignore condition applies. No unrelated component refactor was made.

## Verification and diagnostic history

The final configuration also bounds Vitest concurrency to four workers; see the diagnostic history and final results below. Raw command evidence is in [logs](logs/).

- `pnpm check:css`: pass; 122 tokens, self-hosted font-source policy passes.
- `pnpm check`: pass; zero errors and warnings, including after the D3 fix.
- `pnpm exec tsc --noEmit`: pass before the D3 fix; final result recorded below.
- `pnpm lint`: pass after formatting owned documentation; final result recorded below. Formatter-only failures on newly written coordination/registry/cleanup evidence were corrected without changing source enforcement.
- `pnpm test:unit --run`: initial runs each passed 687 tests and hit the existing 5-second cold ESLint startup timeout in `scripts/tooling-policy.spec.ts`. That unchanged spec passes all five cases in isolation. `pnpm test:unit --run --maxWorkers=4` passes all 89 files / 688 tests. No assertion or timeout was changed to obtain that result. After three reproducible unrestricted-worker timeouts, the project now sets `test.maxWorkers: 4` so the standard script uses the verified concurrency budget without extra flags. This changes scheduling only, preserving all collected cases and test time limits.
- `pnpm build`: pass before the chart fix; complete maintenance and packaged runtime checks run. The native image check produced resized WebP and the email check used a mocked transport, sending no email. Final result recorded below.
- `pnpm check:pages`: all 46 prerendered contracts pass before the chart fix; final result recorded below.
- Baseline `pnpm test:e2e`: all 79 authenticated cases pass.
- Updated pre-fix `pnpm test:e2e`: 69 pass, one dashboard failure, nine serial cases not run. The first shared-install diagnostic run had 68 pass/two failures/nine not run; both records are retained rather than reported as passing.

Browser verification uses isolated tracked-source snapshots under `/tmp`, each with its own frozen dependency installation, local `pglite://` database, generated test-only secrets and unique disposable admin. No production database or provider credentials are used. Every seeded diagnostic/test admin is revoked in `finally`, with cascade removal verified in the logs. No real email is sent. The initial shared-install diagnostic snapshot was replaced with its own installation before the baseline comparison and final run.

## Security and deployment limits

`pnpm audit --json` still reports the same four transitive advisories recorded by the preceding repository audit: one high (`zod@4.1.11` through Blob → OIDC → cli-config), two moderate (`glob@13.0.6`, `minimatch@10.2.6`) and one low (`deepmerge@4.3.1`, no published patched version). Direct Zod is already 4.6.7. The requested direct updates do not resolve these paths. [Audit detail](audit.json) retains exact paths and advisory links; no unverified cross-major overrides or advisory suppression was added.

Local native verification is macOS arm64. Optional dependency-tracer notices and the inherited NO_COLOR/FORCE_COLOR warning remain visible. This evidence does not establish Linux x64 hosted runtime success, a production deployment, Search Console acceptance or resolution of the earlier SEO audit's open findings.

Primary documentation and registry URLs: [sources](sources.json).

## Final acceptance

The standard `pnpm test:unit --run` command now passes **89 files / 688 tests** with the configured four-worker limit and no extra CLI flags. `pnpm check:css`, `pnpm check` (zero errors/warnings), `pnpm exec tsc --noEmit`, the complete `pnpm build`, all **46** `pnpm check:pages` contracts and **three** `pnpm test:seo` cases pass after the source fix. The final complete authenticated `pnpm test:e2e` run passes **79/79**, with no skips; the subsequent change is limited to Vitest scheduling and its documentation.

All disposable accounts are revoked. A separate database query confirms **zero users, sessions and account rows in both snapshots**; see [cleanup proof](account-cleanup.json). No tests, assertion coverage, timeouts or performance budgets were reduced. The final lint command and repository integration are recorded in the completion note below.

Completion note: `pnpm lint` passes after the completed changelog, coordination and verification evidence are formatted. The final gate results are recorded in [final status](final-status.json). A scan of all 75 changed/new files found no private keys, provider tokens or credential-bearing PostgreSQL URLs. The owner authorized committing and pushing on the sole `main`; no separate branch/PR merge or manual production promotion is required.
