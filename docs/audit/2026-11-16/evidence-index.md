# Audit evidence index

The claim-verification report describes the immutable `592f440` baseline. Raw captures and characterization probes are retained outside the checkout to keep generated JSON and logs out of Git. Application fixes are recorded separately in `frontend-implementation.md`.

**Local archive:** `/Users/billyribeiro/dev/new-revolution-audit-evidence/2026-11-16-592f440/snapshot`

The archive includes the original report, source citations, probe scripts, baseline gate logs, and its original SHA-256 evidence manifest. This index records the hash of each archived capture or probe at the time it was moved. It does not turn the snapshot probes (which assert known defects) into product regression tests.

For reproduction, copy the six top-level probe/config scripts from the archive back into `docs/audit/2026-11-16/` in an isolated checkout of `592f440`, then use the commands in the verification report. Use an in-memory database and disabled external providers. Current accessibility regressions instead run with `pnpm exec playwright test tests/accessibility/frontend.e2e.ts`; their generated output belongs in ignored `test-results/`.

| Archived path                               | SHA-256                                                            |
| ------------------------------------------- | ------------------------------------------------------------------ |
| `browser-run.mjs`                           | `f89368157ebcd833d9b816eb56561bd59f5a9e0520b7513938c4846e5c341ae2` |
| `cms.probe.mjs`                             | `d92703cfe830954d84c97e06085ecdb11552677e9d9cc02db92d100cec164961` |
| `collect-static.py`                         | `67dec13ea1282eb9df8cada2ba4d8fddbf8004c564a478cc05c7f6c53bccebf7` |
| `database.probe.mjs`                        | `0b9fe0d6b72f53f1f83f144cb5496f1fceea4d8763f8eb2c784b27358ab2651e` |
| `evidence/A01-production-auth.json`         | `2479fc9399c5f14a5a50c07984d6160fd51157d82b840329e02fbec0ab9142ad` |
| `evidence/A04-database.json`                | `55a4f751942a64d00fb8c2dabac5996ed9037a57da294f8c49ef62eab9722b0f` |
| `evidence/A05-hosted-image.json`            | `2362e5e8f84c2226335f17bcfbdbc999fa073c9154dd4459d6789b6f2978a1d6` |
| `evidence/A06-schema.json`                  | `daf449d95da754df9bc2e09244a0434e8e4c12020cf293a6a290c2a1ad6bc140` |
| `evidence/A07-minor-edit.json`              | `a98a8380420e38ea6c48d9156a952a4ed4e993c6be4bef15b5894d1983e02600` |
| `evidence/A08-real-axe.json`                | `e8dd08912bedc9779b4a9abc8741c14431ad138ef26477f3fe1ca02553fb60c5` |
| `evidence/A09-ci-files.json`                | `6cce52a9c064c51c1e8557e0887f318431e4ed45c6ff2f12fdd489696ec39641` |
| `evidence/axe-engine.json`                  | `2328ed4393f5adcf76821f363794f3a8597e481d2787e60785d77dbc58027a33` |
| `evidence/baseline-gates/build.log`         | `c15290c3ba7c19c221bc0d30323a04d265f1f20aa907d7f9f958007c4d8f88fa` |
| `evidence/baseline-gates/check.log`         | `a9511de3a6eb583800b04c4895e0e2c336798c96701fce45b88bd4cc668677f4` |
| `evidence/baseline-gates/css.log`           | `73174c0dc69f10f81c08fcc7c3ae5f3d0a8cc7b5e373a7a5c8708b3677011a8b` |
| `evidence/baseline-gates/e2e.log`           | `469e378a8ea4781e84571bdc98ee21baa7752ca68936f669d50c88f80b550059` |
| `evidence/baseline-gates/lint.log`          | `3dbde405409792d29d08f0a4925ede49a4d3c6f1d7b653aff8d93bb73fbab825` |
| `evidence/baseline-gates/pages.log`         | `d8e66bca715679e0ca1278491f6ae67bec6ec8b3566a68bcc8856e0a5c4484f5` |
| `evidence/baseline-gates/results.json`      | `0a9f7b732571d8a9ebc2b79f2fd72ef2ee73a91d7618cf516ba316589a69c4d0` |
| `evidence/baseline-gates/seo.log`           | `b1810fc9da8d698b882cd04d7a6d0b73a5d038a8738f6697feb3c3cc938d8560` |
| `evidence/baseline-gates/unit.log`          | `ddaeb4693a507977725f550199397eeabcb19df0b95fe6fbb353a594659ac4cb` |
| `evidence/browser-run.log`                  | `0d05f3b5459221ca24013022e1010662c1860f91005d3853b14bb30c214d7483` |
| `evidence/dependency-audit.json`            | `9286d49a5fea868ad648fdfe50d5a39ae1459d7e9478a4d4267b068463c4ad2b` |
| `evidence/dependency-tree.json`             | `78af313f0c49af07cfe7200874c39493901d58082733589e8fc9ff923cc779a3` |
| `evidence/domain-context.json`              | `f16fee677179325d08fe324fb7c59739bdae9cb261da32dc685158e294846400` |
| `evidence/evidence-manifest.json`           | `c538dcf36c61d7c85b471fb00041ff4800a41a8b64aba80bf6e301afd9bdaa29` |
| `evidence/execution-record.json`            | `875a5dd0baab4ca460f0b0a5d4bf4580459a3905619a2e80f2c69ffae924d9fb` |
| `evidence/history-tree-proof.json`          | `926b9ed9ed50408e4a03368449ab1cf1832171c5378c0c75b8475ea727cc0bbd` |
| `evidence/hosted-configuration.json`        | `dbe1c5ef1c9716094c1f971ffc186279795b62bc7b41555a09326d4169bb3363` |
| `evidence/installed-advisory-packages.json` | `5a2d68529dd6dcad230b7c4830ed9f58a9a0f609f8b0304a54a36181d5a656df` |
| `evidence/inventory.json`                   | `cb18dfb729dd1ddf0f25c7a84b5dafcc3d5fb74d7ce7ae12631170b31abc0ca0` |
| `evidence/original-runtime-matrix.json`     | `d47e83022458857e797a148ffc2a6d48b3c19836842c83388497f6d91b9f4fd5` |
| `evidence/original-unit-retry.log`          | `9f7ab6f5742e01fbf9bcd1c24255a2e0e08b046338126ed2e5a3064c3427939f` |
| `evidence/original-unit.log`                | `8664d53b2cc7945c1af31b8e0ed09860f8862230cb51de97333a9253350bc216` |
| `evidence/primary-advisories.json`          | `6a2185df22b4e8ad9df09aae7bee2dd7b39ffa065eefe5b9336522caeb3ce59a` |
| `evidence/probe-run-01.log`                 | `d235fdb1e69568352ac4dcd40e04091c6364c515ecd78f797f0b45fa9b652cc6` |
| `evidence/probe-run-02.log`                 | `147c37d888dc793012bf6e0a84a68ce4b9033e79598ea19e5cf2097cfbf74739` |
| `evidence/runtime-versions.json`            | `a7afeac3e2ac35fdf4d500dd773e88f3da3d10aa839a549fc74a978009f98bc7` |
| `evidence/source-evidence.json`             | `d6e50fa2c87a4e569dfa78429c6a1406ab2c5e457bb5361831f9067e15ddff38` |
| `production-run.mjs`                        | `4f2615a31411ce578d6d6c35453b71e3d5a6e4ea08009cfd27c2e2e56bd4210a` |
| `verification.config.mjs`                   | `183b687ac5777c1c659acf197907ca11a1b1d59314238d73d40cca9071b1a4fa` |

## Frontend implementation verification

The completed repair batch has a separate `implementation/` directory beside `snapshot/`, containing final gate logs, real axe output for nine templates, Svelte MCP validation, screenshots, and earlier diagnostic runs. Its `manifest.json` records 38 file hashes; the manifest SHA-256 is `ad28788ad030e1cd746327942f65d9f40d24ca693cd61cb543913d8298abbe93`. The eight final gate commands all exited `0`. See [the implementation ledger](frontend-implementation.md) for scope, counts, skips, and remaining work.
