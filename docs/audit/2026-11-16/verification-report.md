# Audit Claim Verification

**Date:** November 16, 2026

**Inspected commit:** `592f440de2d59ac380ad82181313cb5e9e41541a`

**Purpose:** Verify the claims in [audit.md](../../../audit.md) before remediation.

## Conclusion

The twelve findings have an evidence basis, within the limits below. They are not twelve independently demonstrated production failures. Some are reproducible implementation defects, some are missing configuration or incomplete product work, and some require an owner decision about launch scope.

The verification strengthens several original findings and corrects three details:

1. **A07 is broader than a missing assignment:** the PATCH schema also omits `minorEdit`. Both the schema and the mapping require attention if PATCH is intended to support minor edits.
2. **A08 is viewport and content dependent:** real axe-core reproduces keyboard-scroll defects on six routes at 320px/375px, and 30 unnamed SVGs on the index directory. The local seeded blog article did **not** reproduce those violations at the tested widths. The hidden-dialog heading issue is a limitation of the heuristic selector, not a reproduced current-page failure.
3. **A11 needs a scope distinction:** deployment-promotion documentation is demonstrably stale, but “three steps before flipping live” does not establish whether the author meant opening indexing or completing the commercial product. Unfinished shells do not, by themselves, prove that already-built pages cannot be published.

**Owner clarification:** the main custom domain was deliberately removed. That is **not a defect**. Hosted checks used `new-revolution-fawn.vercel.app`; no request was made to the former custom domain. Vercel's current project-domain response lists only that Vercel domain. See [domain evidence](evidence-index.md).

No application fixes were made during this verification.

## Evidence standard and provenance

- **Source evidence:** current implementation and configuration, with exact lines and SHA-256 hashes in [source-evidence.json](evidence-index.md). The original audit and roadmap are claims to test, not independent proof.
- **Behavioral evidence:** calls to the real production-generated auth module, real database/seed functions, actual article loader, and actual post-update services. Database mutations used disposable local PGlite fixtures only.
- **Hosted evidence:** authenticated **GET** queries to Vercel/GitHub configuration APIs, plus a public missing-image GET. Saved responses contain selected configuration fields, not environment secrets.
- **Dependency evidence:** fresh package audit, installed package versions/dependency paths, and primary GitHub Advisory Database records.
- **Accessibility evidence:** actual axe-core `4.11.0`, obtained from its pinned official npm distribution and checksum-verified, running in Chromium against local pages. This replaces inference from the repository's heuristic lab output for this verification.
- **Historical execution evidence:** original command logs were copied into the evidence directory. They are identified as prior executions; they are not represented as newly rerun full-suite checks.

The hosted production target inspected through Vercel reports `READY` and Git source SHA `592f440de2d59ac380ad82181313cb5e9e41541a`. Therefore its image response and configuration observations correspond to the same application snapshot as the source review. “Production target” is Vercel's deployment label; it does not mean the removed custom domain is attached or the public indexing flag is enabled.

## Claim-by-claim verdicts

| Claim                                        | Verdict                                                | Direct evidence                                                                                                                               | Boundary                                                                                                |
| -------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| A01: Production secret validation            | Confirmed configuration behavior                       | Production-generated auth accepts a missing-secret fallback and an eight-character secret; negative control rejects Better Auth's own default | Actual hosted secret strength/value was not inspected; no live compromise is claimed                    |
| A02: Three dependency advisories             | Confirmed                                              | Fresh audit, installed versions, dependency paths, primary advisory records                                                                   | Vulnerable dependency presence does not prove an exploitable public request path                        |
| A03: Missing job schedules                   | Confirmed for repo and Vercel                          | Both list only publish-scheduled and waitlist-email                                                                                           | An unrelated external scheduler could still invoke the other handlers; none was inspected               |
| A04: Authenticated E2E isolation recipe      | Confirmed by execution                                 | Requested PGlite path is ignored by seed/app; resolved Playwright database is `memory://e2e` without its own override                         | Probe used a fresh OS temporary directory and created no admin account                                  |
| A05: Missing image returns placeholder `200` | Confirmed on current deployment                        | Nonexistent `.webp` URL returns `200 image/svg+xml` with placeholder label                                                                    | This is implemented fallback behavior, not proof every published image is missing                       |
| A06: Custom schema filtering                 | Confirmed through actual loader                        | Top-level control removed; nested prohibited node retained; organization ID appears twice                                                     | Uses isolated synthetic content, not a finding that live CMS articles contain these payloads            |
| A07: PATCH minor-edit date                   | Confirmed and expanded                                 | Full update preserves date; PATCH moves it; PATCH schema drops the field                                                                      | Applies to a caller intending `minorEdit: true`; normal editorial PATCH changes should move the date    |
| A08: Accessibility tooling/defects           | Confirmed with narrower route/viewport scope           | Heuristic source plus real axe results at three widths                                                                                        | No comprehensive WCAG certification; seeded article did not reproduce the historical scroll finding     |
| A09: Versioned GitHub CI workflow            | Confirmed                                              | No tracked workflow files; GitHub Actions API reports zero workflows                                                                          | Vercel deployment/build automation still exists; absence of all external CI is not claimed              |
| A10: 67 incomplete destination shells        | Confirmed in generated HTML                            | Exact route list, counts, robots metadata, and canonical checks                                                                               | Intentional unfinished scope, not 67 crashed pages or 67 currently indexed public URLs                  |
| A11: Operational documentation drift         | Confirmed promotion mismatch; launch wording qualified | Current Vercel flag is `true`; runbook says `false`                                                                                           | Main-domain removal is deliberate; indexing launch and commercial launch are distinct                   |
| A12: Evidence/portrait assets pending        | Confirmed in current source                            | Empty verified-case array, three null chart slots, emblem portrait fallback                                                                   | Does not establish whether evidence exists outside the repo or whether historical claims are true/false |

### A01 — Where the production-secret claim comes from

[src/env.ts:16–19][auth-env] substitutes a known development string when the signing secret is absent. [auth.ts:10–16][auth-config] passes that resolved value to Better Auth. [runtime.ts:36–39][runtime-validation] contains no validation beyond an early-return flag.

[A01-production-auth.json](evidence-index.md) records two fresh Node child processes with `NODE_ENV=production`, `VERCEL=1`, and no Vitest flag. Each initializes the **actual generated application auth export**:

| Input                                              | Observed result                                                                    |
| -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Missing `BETTER_AUTH_SECRET`                       | Framework resolves the repository's development fallback; auth context initializes |
| Eight-character test secret                        | Auth context initializes; library emits length/entropy warnings                    |
| Better Auth's own default secret, negative control | Library rejects it in the same production-mode process                             |

Network sockets and `fetch` are blocked in the child; both cases record **zero network attempts**. The database URL is a deliberately unusable local test address. The test establishes configuration acceptance, not successful login/session forgery or use of a weak secret on Vercel. Node 26 was used locally; the Vercel Node 24 runtime was not directly executed.

### A02 — Where the advisory claim comes from

[dependency-audit.json](evidence-index.md) is a fresh `pnpm audit --json` capture: exit `1`, **one high, two moderate, zero critical**. [dependency-tree.json](evidence-index.md) records `pnpm why zod glob minimatch --json`; [installed-advisory-packages.json](evidence-index.md) independently reads installed package metadata.

| Installed affected copy                          | Primary advisory                                                         | Reported affected range | Reported patched version |
| ------------------------------------------------ | ------------------------------------------------------------------------ | ----------------------- | ------------------------ |
| `zod@4.1.11`, via Blob/OIDC/CLI config           | [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) | `<4.6.6`                | `4.6.6`                  |
| `glob@13.0.6`, via adapter/NFT                   | [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) | `>=9.0.0 <=14.0.1`      | `14.0.2`                 |
| `minimatch@10.2.6`, via adapter and lint tooling | [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) | `>=7.0.0 <11.0.1`       | `11.0.1`                 |

The installed top-level `zod@4.6.7` and another `minimatch@11.0.8` copy are distinct from the affected copies. [Primary advisory metadata](evidence-index.md) corroborates the audit feed. The audit marks the Zod path as non-development and the Glob/Minimatch paths as development dependencies. No denial-of-service payload was run against the application or hosted services; remote reachability remains unproven.

### A03 — Where the scheduling claim comes from

[vercel.json:2–11][cron-config] contains exactly two definitions. [hosted-configuration.json](evidence-index.md) independently shows the same two definitions in both the project cron configuration and the production deployment: `/api/cron/publish-scheduled` and `/api/cron/waitlist-email`.

The three other handlers exist in source. Daily analytics invokes consent retention, and the sequence-email handler invokes due-enrollment processing. A repository search found no alternate active application scheduler for them. This establishes missing **Vercel/repository schedules**. It does not establish that another provider never calls the endpoints, nor does it prove a specific email or retention job has already been missed.

### A04 — Where the E2E isolation claim comes from

The [documented recipe][e2e-runbook] supplies `DATABASE_URL=pglite://...`. [The seed helper][seed-path] and [application database selector][db-path] instead choose the fixed `.svelte-kit/pglite-blog` directory. [Playwright configuration][playwright-db] reads `PLAYWRIGHT_DATABASE_URL` for the server and otherwise supplies `memory://e2e`.

[A04-database.json](evidence-index.md) comes from calls to the real helper and selector, with `process.cwd()` scoped to a fresh temporary directory. The requested directory is not created; the fixed directory is created; the application successfully queries that local database. The evaluated Playwright configuration resolves to `memory://e2e` despite `DATABASE_URL` containing the requested PGlite URL. Cleanup closes the clients and deletes only that temporary directory.

This proves the runbook cannot produce its promised shared disposable seed/server target as written.

### A05 — Where the missing-image claim comes from

[The image handler][image-handler] generates an SVG fallback and returns status `200` without a production-only exclusion. [A05-hosted-image.json](evidence-index.md) records a GET to a deliberately nonexistent image on the current Vercel domain:

```text
status: 200
content-type: image/svg+xml; charset=utf-8
contains "IMAGE PLACEHOLDER": true
```

The body length and SHA-256 are retained; the embedded font/data URI is not duplicated in the report. The concern is that successful status/image decoding can conceal absent intended media. It is not a claim that fallback generation was accidental or that the intentionally removed custom domain must be restored.

### A06 — Where the custom JSON-LD claim comes from

[The filter][schema-filter] checks only each top-level node's `@type`. [The loader][schema-loader] appends the surviving custom nodes to the generated graph. The probe inserts a synthetic public article into an **in-memory** database and invokes that actual loader.

[A06-schema.json](evidence-index.md) preserves the inputs/outputs and resulting graph:

- Top-level `FAQPage` control: removed.
- `Thing.subjectOf` containing `FAQPage`: retained.
- A conflicting custom `Person` with the generated organization's `@id`: retained; that ID occurs **twice**.

“Prohibited” here refers to the repository's schema contract. This verification does not independently certify every external search-engine policy asserted by the project documentation. No such payload was written to the hosted CMS.

### A07 — Where the minor-edit claim comes from

[The update schema][patch-schema] declares `minorEdit`; the PATCH schema does not. [The PATCH mapping][patch-mapping] also omits it, while [the update save call][update-mapping] forwards it. [The save implementation][date-save] preserves the editorial date when that flag is true.

The actual service comparison in [A07-minor-edit.json](evidence-index.md) starts two isolated draft fixtures with the same fixed editorial date:

```text
Before:                  2020-01-02T03:04:05.000Z
Full update, minor edit: 2020-01-02T03:04:05.000Z (preserved)
PATCH, same intention:   2026-11-16T22:11:17.329Z (advanced)
PATCH schema retains minorEdit: false
```

The exact recorded PATCH timestamp is authoritative in the JSON; the material comparison is preserved versus advanced. The earlier audit's proposal to “forward `minorEdit`” was incomplete: intended PATCH support also requires declaring the field in its schema.

### A08 — Where the accessibility claim comes from

[The lab implementation][lab-heuristics] manually constructs violations and [writes them as `axe.json`][lab-output]; it does not call axe-core. Its heading selector does not filter visibility. That proves a tooling/labeling limitation, not that every page has hidden-heading violations.

The independent [real axe output](evidence-index.md) covers seven routes at **320px, 375px, and 1440px**: 21 samples, WCAG 2 A/AA, 2.1 AA, and 2.2 AA rule tags, Chromium, reduced motion, local seed content. [The engine record](evidence-index.md) identifies the pinned distribution and checksum.

| Route                 | 320px / 375px                                                     | 1440px                         |
| --------------------- | ----------------------------------------------------------------- | ------------------------------ |
| Day trading room      | One serious `scrollable-region-focusable` node                    | No violations reported         |
| Swing trading room    | One serious `scrollable-region-focusable` node                    | No violations reported         |
| Small accounts room   | One serious `scrollable-region-focusable` node                    | No violations reported         |
| ETF/stocks list       | One serious `scrollable-region-focusable` node                    | No violations reported         |
| Store courses         | One serious `scrollable-region-focusable` node                    | No violations reported         |
| Stock-index directory | One serious scroll-region node and 30 serious `svg-img-alt` nodes | 30 serious `svg-img-alt` nodes |
| Seeded blog article   | No violations reported                                            | No violations reported         |

Examples are the day-room `.table-wrapper` region and unnamed icon SVGs such as `.hero__badge > svg` in the index directory. Full selectors, HTML snippets, failure summaries, and incomplete/manual-review results are preserved in the JSON. The 30 SVG counts are per rendering; they are not 90 distinct SVG defects across the three widths.

Zero automated violations on one seeded article does not clear every CMS article, interactive state, keyboard workflow, browser, or WCAG criterion. None of these samples contained hidden closed-dialog H2s; a current-page hidden-heading failure was not reproduced.

### A09 — Where the CI claim comes from

[A09-ci-files.json](evidence-index.md) records an empty `git ls-files .github/workflows` result. [GitHub API evidence](evidence-index.md) separately reports `total_count: 0` for Actions workflows and zero check-runs on the inspected commit.

This supports the precise claim that no versioned GitHub workflow enforces the eight commands. It does not mean there is no automation: the same evidence identifies a successful Vercel production-target deployment. No assertion is made about every external CI service or legacy status context.

### A10 — Where the unfinished-shell claim comes from

[inventory.json](evidence-index.md) parses the **generated HTML**, rather than trusting the roadmap count. It lists all 99 routes and content hashes. Exactly **67** contain the TODO shell marker: 33 store, 22 resources, eight enrollment, plus login, register, memberships, and mentorship/apply. All 67 contain `noindex` metadata and none emits a canonical.

The inventory's “26 indexable” count means **26 prerendered files have indexable metadata**, not that Google currently indexes 26 deployed URLs. Deployment-host robots headers, environment flags, and the intentionally absent custom domain remain separate. TODO shells are implemented placeholders; their unfinished state is intentional scope recorded in the registry. Whether a specific incomplete journey blocks a particular launch is an owner/product decision.

### A11 — Where the documentation-drift claim comes from

[The operating runbook][promotion-doc] explicitly describes `autoAssignCustomDomains=false` and manual promotion. The authenticated current Vercel project response in [hosted-configuration.json](evidence-index.md) reports **`autoAssignCustomDomains: true`**. That contradiction is confirmed independently of the changelog.

[remaining.md][remaining-doc] describes “only three non-code steps.” Its intended launch scope is ambiguous; this verification does not assert that all 67 placeholders must be finished before indexing existing pages. It also does not endorse its time-dependent Google-update instructions. The domain removal is an intentional owner decision, corroborated by [current domain bindings](evidence-index.md), and must not be “fixed” by reattaching the former domain.

### A12 — Where the evidence-asset claim comes from

Current source has an [empty `VERIFIED_CASE_STUDIES` array][case-array], three [null historical chart slots][chart-slots], and an [emblem portrait fallback][portrait-slot]. These exact excerpts and hashes are retained in [source-evidence.json](evidence-index.md).

This establishes the repository's asset state. It does not establish that primary receipts or a real portrait do not exist elsewhere. The empty verified-case guard also does not authenticate or disprove biographies, historical trading claims, or financial/regulatory statements; those were outside this technical verification.

## Verification of the earlier inventory and test claims

The independent inventory reproduces 921 source files, 62 page templates, 38 endpoint templates, 16 remote modules, 55 schema tables, five SQL migrations, 43 article packages, 124 SEO inventory entries, 99 generated pages, and 67 TODO shells. See [inventory.json](evidence-index.md).

The prior full pre-push run is preserved under [baseline-gates](evidence-index.md). Its actual recorded results are:

| Command                     | Recorded result                                                   |
| --------------------------- | ----------------------------------------------------------------- |
| `pnpm check:css`            | Exit `0`; 130 referenced tokens, font policy passed               |
| `pnpm check`                | Exit `0`; zero errors and warnings                                |
| `pnpm lint`                 | Exit `0`                                                          |
| `pnpm test:unit --run`      | Exit `0`; 105 files, 750 tests                                    |
| `pnpm build`                | Exit `0`; complete build and packaged native/offline-email checks |
| `pnpm check:pages`          | Exit `0`; 99 contracts                                            |
| `pnpm test:seo`             | Exit `0`; three tests                                             |
| `pnpm exec playwright test` | Exit `0`; 66 passed, 19 skipped                                   |

The 19 skips remain 17 admin-dependent and two disabled concept-only cases. No claim of authenticated browser coverage is made. The original failed unit attempt and successful rerun are also retained separately; the failed attempt must not be presented as a clean pass.

[The original runtime matrix](evidence-index.md) contains 108 samples: 96 regular-width samples across three engines and 12 text-enlargement samples. The no-overflow and no-page-error claims are scoped to those samples. Those observations do not imply that all accessibility checks pass, as the new real axe results demonstrate.

## Reproduction and limits

Raw captures and probe scripts were moved to a checksum-verified external archive after verification. See [the evidence index](evidence-index.md) for their locations and restoration instructions. Commands below describe their original paths in an isolated baseline checkout.

The probes are evidence fixtures for this snapshot, **not new product regression gates**. Their assertions deliberately record current defects. They are archived outside the checkout and normal `src/`/`scripts/` test discovery so fixing a defect does not make the product suite require broken behavior.

| Evidence                                              | Reproduction                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source excerpts and inventory                         | `python3 docs/audit/2026-11-16/collect-static.py`                                                                                                                                                                                                                                                                     |
| Real seed/app path, loader graph, and date comparison | `DATABASE_URL=memory://audit-evidence PUBLIC_ENV=development MEDIA_STORAGE=disk BLOB_READ_WRITE_TOKEN= RESEND_API_KEY= pnpm exec vp test run --config docs/audit/2026-11-16/verification.config.mjs`                                                                                                                  |
| Production-mode auth acceptance                       | After `pnpm build` with an isolated database: `node docs/audit/2026-11-16/production-run.mjs`                                                                                                                                                                                                                         |
| Real axe                                              | Start preview with explicit `DATABASE_URL=memory://audit-evidence`, `MEDIA_STORAGE=disk`, and external providers disabled; use port 4288. Download the pinned npm archive in `axe-engine.json`, extract only `package/axe.min.js`, then run `node docs/audit/2026-11-16/browser-run.mjs /absolute/path/to/axe.min.js` |
| Dependency feed                                       | `pnpm audit --json`; `pnpm why zod glob minimatch --json`                                                                                                                                                                                                                                                             |
| Hosted configuration                                  | Authenticated Vercel GET project/deployment/domain endpoints recorded in the evidence; GitHub GET Actions/check-runs endpoints                                                                                                                                                                                        |

New database/loader probes passed **three tests in two files**. Production auth probes passed both cases with their negative controls. `pnpm check` passed with zero errors/warnings and `pnpm lint` exited `0` after adding the report and probe files. These are new validation results; the eight-command table above remains explicitly the preserved baseline run.

The initial production harness attempted to invoke a framework-normalized schema as a raw function; the harness was corrected, not the application. The first axe source-file download returned 404; the official pinned npm distribution was used instead, with both URLs recorded.

Checks performed here do not inspect hosted secret values, mutate hosted content, send emails, change deployment settings, or restore the removed domain. JSON records, logs, and characterization probes are retained in the external archive documented by [the evidence index](evidence-index.md); [evidence-manifest.json](evidence-index.md) binds their file contents to SHA-256 hashes.

[auth-env]: https://github.com/billyribeiro-ux/new-revolution/blob/592f440de2d59ac380ad82181313cb5e9e41541a/src/env.ts#L16-L19
[auth-config]: https://github.com/billyribeiro-ux/new-revolution/blob/592f440de2d59ac380ad82181313cb5e9e41541a/src/lib/server/auth.ts#L10-L16
[runtime-validation]: https://github.com/billyribeiro-ux/new-revolution/blob/592f440de2d59ac380ad82181313cb5e9e41541a/src/lib/server/config/runtime.ts#L36-L39
[cron-config]: https://github.com/billyribeiro-ux/new-revolution/blob/592f440de2d59ac380ad82181313cb5e9e41541a/vercel.json#L2-L11
[e2e-runbook]: https://github.com/billyribeiro-ux/new-revolution/blob/592f440de2d59ac380ad82181313cb5e9e41541a/docs/VITE_PLUS_WORKFLOW.md#L71-L82
[seed-path]: https://github.com/billyribeiro-ux/new-revolution/blob/592f440de2d59ac380ad82181313cb5e9e41541a/scripts/seed-admin.ts#L258-L288
[db-path]: https://github.com/billyribeiro-ux/new-revolution/blob/592f440de2d59ac380ad82181313cb5e9e41541a/src/lib/server/db/index.ts#L87-L108
[playwright-db]: https://github.com/billyribeiro-ux/new-revolution/blob/592f440de2d59ac380ad82181313cb5e9e41541a/playwright.config.ts#L19-L32
[image-handler]: https://github.com/billyribeiro-ux/new-revolution/blob/592f440de2d59ac380ad82181313cb5e9e41541a/src/routes/images/blog/%5B...file%5D/+server.ts
[schema-filter]: https://github.com/billyribeiro-ux/new-revolution/blob/592f440de2d59ac380ad82181313cb5e9e41541a/src/lib/seo/blog-seo.ts#L281-L299
[schema-loader]: https://github.com/billyribeiro-ux/new-revolution/blob/592f440de2d59ac380ad82181313cb5e9e41541a/src/routes/blog/%5Bslug%5D/+page.server.ts#L367-L398
[patch-schema]: https://github.com/billyribeiro-ux/new-revolution/blob/592f440de2d59ac380ad82181313cb5e9e41541a/src/lib/shared/schemas/posts.ts#L337-L364
[patch-mapping]: https://github.com/billyribeiro-ux/new-revolution/blob/592f440de2d59ac380ad82181313cb5e9e41541a/src/lib/server/services/posts.ts#L613-L719
[update-mapping]: https://github.com/billyribeiro-ux/new-revolution/blob/592f440de2d59ac380ad82181313cb5e9e41541a/src/lib/server/services/posts.ts#L492-L498
[date-save]: https://github.com/billyribeiro-ux/new-revolution/blob/592f440de2d59ac380ad82181313cb5e9e41541a/src/lib/server/db/save-post.ts#L178-L193
[lab-heuristics]: https://github.com/billyribeiro-ux/new-revolution/blob/592f440de2d59ac380ad82181313cb5e9e41541a/tests/seo/lab.ts#L261-L277
[lab-output]: https://github.com/billyribeiro-ux/new-revolution/blob/592f440de2d59ac380ad82181313cb5e9e41541a/tests/seo/lab.ts#L469-L475
[promotion-doc]: https://github.com/billyribeiro-ux/new-revolution/blob/592f440de2d59ac380ad82181313cb5e9e41541a/docs/ADMIN_AND_OPS.md#L59-L68
[remaining-doc]: https://github.com/billyribeiro-ux/new-revolution/blob/592f440de2d59ac380ad82181313cb5e9e41541a/remaining.md
[case-array]: https://github.com/billyribeiro-ux/new-revolution/blob/592f440de2d59ac380ad82181313cb5e9e41541a/src/lib/data/homepage.ts#L371
[chart-slots]: https://github.com/billyribeiro-ux/new-revolution/blob/592f440de2d59ac380ad82181313cb5e9e41541a/src/lib/data/methodology.ts#L178-L220
[portrait-slot]: https://github.com/billyribeiro-ux/new-revolution/blob/592f440de2d59ac380ad82181313cb5e9e41541a/src/lib/data/site.ts#L39-L49
