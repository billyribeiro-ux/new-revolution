# Build and CI warning evidence — November 11, 2026

This is a dated verification record, not a replacement workflow. Use [the Vite+ workflow](../../VITE_PLUS_WORKFLOW.md), [coordination](../../AGENT_COORDINATION.md), and the [blog handoff](../../BLOG_AGENT_HANDOFF.md) for current operations. Only `main` is retained; the QA checkout is detached.

## Baseline and primary evidence

Starting source: `4696a3f362eb6846778c55c85808ca6ecde03568`. The actual Vercel deployment `new-revolution-3rtipb21l-will-ribeiros-projects.vercel.app` is READY and its build logs contain the owner's exact warning timestamps, 10:34–10:35 America/New_York (15:34–15:35 UTC). That build used four cores and 8 GB; the separately failing CI task's memory configuration is not exposed in the supplied log. CI run `r0bb7rPghfG50lbMawgW3HCc` records failed `lint` and skipped `typecheck` with reason `script_not_found`.

- [Vercel Node selection](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions) supports major ranges such as `26.x`; patch versions are platform-managed. `engines.bun` made the project advertise two runtime engines. The replacement keeps exact local pins in `.node-version` and `.nvmrc`, uses `26.x` for deployment, and enforces pnpm through `packageManager`, `devEngines.packageManager` and the local preinstall guard. The adapter and maintenance functions retain their existing Node 24 runtime; this is not a function-runtime migration.
- [Oxlint issue #20331](https://github.com/oxc-project/oxc/issues/20331) reports the identical Linux panic. [The allocator source](https://github.com/oxc-project/oxc/blob/main/crates/oxc_allocator/src/pool/fixed_size.rs) distinguishes the fixed-size JS-plugin arena from native-rule allocation. [The Unix fix PR](https://github.com/oxc-project/oxc/pull/27356) was still a draft when checked; upgrading without a released fix would not establish remediation.
- [Rolldown code-splitting documentation](https://rolldown.rs/reference/OutputOptions.codeSplitting) supports bounded dependency groups. The profile identifies the large client chunk as the admin editor, led by Tiptap core and ProseMirror view/model. Existing dynamic route imports are retained.
- [Sharp bundler guidance](https://sharp.pixelplumbing.com/install/#bundlers) requires preserving the native package. No cross-platform binaries, React renderer, or tracing SDK were added merely to clear optional-dependency diagnostics.

## Controlled Linux lint reproduction

A disposable `node:26-bookworm-slim` container reported Node 26.13.0 on Linux arm64, two CPUs, a 4 GiB memory limit and no additional container swap. Both commands ran with the same per-process virtual-address-space cap: `ulimit -v 10485760` (10 GiB). Host sysctls were not modified; this reproduces allocation sensitivity, not the unknown hosted runner's exact memory/sysctl configuration.

Original `pnpm lint`:

```text
All matched files use the correct format.
Finished in 3439ms on 814 files using 2 threads.
thread 'tokio-rt-worker' (309) panicked at crates/oxc_allocator/src/pool/fixed_size.rs:112:67:
called `Result::unwrap()` on an `Err` value: ()
[ELIFECYCLE] Command failed with exit code 134.
```

Fixed `pnpm lint` under the identical limit:

```text
All matched files use the correct format.
Finished in 3588ms on 816 files using 2 threads.
Found 0 warnings and 0 errors.
Finished in 1.8s on 522 files with 133 rules using 2 threads.
exit 0
```

The native/type-aware Oxlint rules retain their configuration. ESLint executes the same installed Vite+ import visitor and all 37 explicit Svelte rules with the original severities, including Svelte modules. Regression tests check effective rule configuration, missing each-block keys and import/export/dynamic-import diagnostics. No warning/error thresholds or inline suppressions were added. The local formatter file count differs because new guard/rule-policy files are included.

## Client chunk measurement

| Measurement                            | Baseline              | Fixed                         |
| -------------------------------------- | --------------------- | ----------------------------- |
| Largest emitted client JavaScript file | 798,843 bytes         | 339,070 bytes                 |
| Largest file label                     | combined admin editor | dynamically loaded PostEditor |
| Default chunk warning threshold        | 500 kB                | 500 kB, unchanged             |
| Oversized-client-chunk warning         | present               | absent                        |

Profiled baseline rendered modules include Tiptap core (198,124 bytes), ProseMirror view (171,819 bytes) and ProseMirror model (73,644 bytes). These are transformed module sizes, not minified transfer sizes. Splitting Tiptap/ProseMirror dependencies into bounded editor groups eliminates the oversized combined chunk; it does not remove editor features. Browser tests check that public homepage/blog requests do not load these editor chunks and exercise actual authenticated editor behavior.

## Dependency tracer: required capabilities versus optional branches

The actual warning lists three classes:

| Import                                                                        | Source evidence                                                                                                 | Verification/decision                                                                                                                                                                  |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@opentelemetry/api`                                                          | Better Auth's generated `loadOpenTelemetryAPI()` catches absent optional instrumentation and uses its no-op API | Preserve that fallback; generated handler/auth requests are tested. No tracing SDK is required by the application.                                                                     |
| `@react-email/render`                                                         | Resend dynamically imports it only for React email rendering                                                    | Application delivery uses HTML/text. The packaged SDK's HTML/text request is exercised with a mocked fetch; no email is sent.                                                          |
| Other-platform Sharp bindings, wasm fallbacks and development libvips headers | Sharp 0.35.5's runtime-platform switch and guarded build helpers reference all these alternatives               | Keep the selected platform's native binary. Test actual decode, resize and WebP encoding from the generated function package. Do not install other operating systems' native packages. |

The installed NFT Sharp special case recognizes the old `sharp/lib/index.js` layout, while Sharp 0.35.5 uses `dist/index.mjs` / `dist/index.cjs`. The adapter has no public configuration for selectively filtering these warnings. The warnings remain visible and are not presented as proof of missing required modules or hidden with a blanket filter.

`pnpm build` now adds a required-capability check after maintenance output generation. It resolves Sharp and Resend **inside the generated function artifact**, supports the differing common-ancestor directory layouts produced locally and on Linux, converts PNG to a 6×4 WebP, and sends an HTML/text SDK request through an offline mock. Missing required dependencies or codecs fail the build. Negative coverage verifies that a package without Sharp fails this gate.

The Linux packaged function also passed the final build gate: `platform=linux-arm64`, `width=6`, `height=4`, `format=webp`, `emailRequests=1`, with network transport mocked and no email sent. The same gate passed on Darwin arm64 and inside the generated-function browser regression. No hosted CMS content, real email transport, payment configuration or production promotion is part of this repair.

## Final validation

Local verification completed on the sole `main` working tree and a detached, environment-free QA checkout:

- `pnpm lint`: pass; formatting, unchanged native/type-aware rules and migrated ESLint rules pass. Constrained Linux baseline exits 134; fixed command exits 0 under identical limits.
- `pnpm check` and the new `pnpm typecheck` alias: zero errors/warnings locally and on Linux.
- `pnpm check:css`: 122 token references declared; static font policy passes.
- `pnpm test:unit --run`: 685 tests pass, including five tooling policy/negative-artifact regressions.
- `pnpm build`: complete build and packaged-runtime smoke gate pass on the isolated QA checkout; Linux build and packaged capability probe also pass.
- `pnpm check:pages`: 46 prerendered contracts pass.
- Full `pnpm test:e2e`: 73 pass, two known baseline blog layout cases fail, and two later serial media cases do not run. The three SEO cases, client chunk/public-isolation test, generated handler test and packaged-dependency test pass.
- A follow-up `pnpm exec playwright test` run against the already-built output passes eight editor/media/deployment cases, including the two media cases blocked in the full run. Its ignored temporary config uses `pnpm preview` and explicitly excludes only the known blog-card geometry failure. Both disposable administrators are revoked.

The unchanged failures are a 1361px lead card versus the existing <=1200px assertion and a 1521px frame versus the existing 1536px assertion at a 1536px viewport with stable scrollbars. Both exact measurements reproduce on the untouched baseline, as documented in coordination. No related CSS/components/tests or thresholds were changed for this task.

## Hosted verification

Application commit `ceb653d955a596f21cd365a245a4bc2c3e6c778e` is pushed to the sole `main` branch. The Vercel deployment [new-revolution-8cucv7zrl](https://new-revolution-8cucv7zrl-will-ribeiros-projects.vercel.app) is READY. Its actual build log contains neither ambiguous Node/Bun detection, exact-patch Node selection, nor oversized-client-chunk warnings. The optional dependency-tracer diagnostics remain visible, followed by the new successful required-capability gate:

```text
2026-11-11T16:08:52.213Z Required server dependencies verified: {"platform":"linux-x64","width":6,"height":4,"format":"webp","emailRequests":1,"network":"mocked; no email sent"}
```

Actual Vercel CI run `AJFrg01Cnh0KdLoB3Ky4hALC`, attempt 1, for that exact commit is **succeeded**:

| Job       | Result    | Duration  |
| --------- | --------- | --------- |
| lint      | succeeded | 68,746 ms |
| typecheck | succeeded | 41,793 ms |

The first repair commit `bf5735272e60e3bc6b82b67165c78c64340ca439` also passed both hosted jobs in run `7l8cfKpLuXUrtQTnD2n5AEYA`; the final helper refinement replaces generic object stringification with explicit URL/body validation and passes five focused regressions plus local and Linux artifact probes.

These hosted results were read with `vercel ci inspect` and `vercel inspect --logs`, not inferred from local success. No CI machine-size increase, task bypass, blanket warning filter, dependency upgrade or function-runtime migration was used. The final evidence-only documentation commit changes no application/build/lint implementation bytes.

Both disposable QA administrators were revoked and the task-owned Linux container was removed. No hosted CMS changes, real email sends or manual production promotion commands were performed.
