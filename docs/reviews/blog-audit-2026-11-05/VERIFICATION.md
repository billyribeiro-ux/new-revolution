# Blog audit verification

**2026-11-05 · baseline `e896ebc` · branch `docs/blog-audit-20261105`**

Work was isolated in `/private/tmp/wt-blog-audit-20261105`. The original checkout's pre-existing untracked `blogs/`, `first-blog.md` and `full-blog.md` were preserved. No application source, dependency manifest/lockfile, auth policy, launch flag or deployment was changed by the final patch. Two reproducible audit scripts accompany the documentation and evidence.

## Environment and setup

Read the repository's engineering/tooling/coordination, CSS, new-page, admin/auth, temporary-item and relevant SEO policies before selecting commands. Official Svelte MCP `list_sections` and relevant `get_documentation` calls succeeded. Installed packages were read directly:

| Package            | Installed evidence                                                                     |
| ------------------ | -------------------------------------------------------------------------------------- |
| Node               | `node --version`: 26.13.0                                                              |
| pnpm               | `pnpm --version`: 12.16.1                                                              |
| Svelte             | `node_modules/svelte/package.json`: 5.57.3                                             |
| SvelteKit          | `node_modules/@sveltejs/kit/package.json`: 3.1.1                                       |
| adapter-vercel     | `node_modules/@sveltejs/adapter-vercel/package.json`: 7.0.2                            |
| Vite+              | `node_modules/vite-plus/package.json`: 1.4.0                                           |
| Vite package alias | `vite` resolves to `@voidzero-dev/vite-plus-core@1.4.0`, per catalog/installed package |
| Vitest             | `node_modules/vitest/package.json`: 5.0.5                                              |
| TypeScript         | `node_modules/typescript/package.json`: 6.0.3                                          |
| svelte-meta-tags   | `node_modules/svelte-meta-tags/package.json`: 5.0.3                                    |

`pnpm install --frozen-lockfile --offline` failed because the isolated temporary store lacked a tarball. Normal dependency verification also attempted registry fetches blocked by sandbox DNS. The existing installed `node_modules` was copied into the isolated worktree, and `verifyDepsBeforeRun: false` was used **temporarily in that worktree only** so pnpm could run the existing locked toolchain without reinstalling it. No package was upgraded. That setting was removed from the final patch. Setup failures are not represented as a successful frozen install. Earlier interrupted dependency-fetch attempts and the sandbox browser-port refusal are environment failures, not passed checks.

After restoring the original workspace configuration, the last lint repeat used `pnpm --config.verify-deps-before-run=false lint` with the already installed Node/pnpm binaries on PATH. This command changes dependency-install verification for that process only; it still runs the complete project lint script. The earlier ordinary `pnpm lint` also passed. No final repository configuration disables dependency verification.

The first component-test attempt hit `listen EPERM` in the sandbox. Browser-dependent gates were then run with local browser/server permissions. Local auth testing used fresh randomly generated credentials and secrets in an untracked temporary shell file, `DATABASE_URL=pglite://blog-audit`, `MEDIA_STORAGE=disk`, and `ORIGIN=http://localhost:4173`; no existing secrets were copied or printed. The seed and application shared this worktree's local PGlite file. The standalone SEO run used the configured local memory fixtures.

## Commands and outcomes

The full project commands below were actually run. Logs are in [logs/](logs/); trailing line whitespace and extra final blank lines were normalized for repository whitespace checks. The compressed input snapshot preserves the original bytes exactly. Later documentation edits were checked with the final full lint and link/whitespace/checksum validation; the application tests were not claimed to validate financial copy.

| Command                          | Exit/result                                                                            | Scope and limits                                                                                                                                                                                                                                         |
| -------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm check:css`                 | 0; 90 custom properties declared                                                       | Source-token governance, not visual proof                                                                                                                                                                                                                |
| `pnpm check`                     | 0; 0 errors, 0 warnings                                                                | Svelte/TypeScript diagnostics                                                                                                                                                                                                                            |
| `pnpm lint`                      | 0 on final owned files/tree                                                            | Complete Oxfmt + Oxlint + Svelte ESLint script. An earlier run flagged the new coordination-table formatting; that was formatted and rechecked.                                                                                                          |
| `pnpm test:unit --run`           | Final repeat: 0; **76 files, 559 tests passed**                                        | The first unsandboxed run had 558 passes and one 5-second timeout in the unrelated maintenance-data test while other work ran. Repeated the entire unchanged suite without competing builds; all 559 passed. No thresholds/timeouts/tests were weakened. |
| `pnpm build`                     | 0; complete build including maintenance-output script                                  | Existing chunk-size and optional dependency-tracing warnings remain in build log; not described as a warning-free build.                                                                                                                                 |
| `pnpm check:pages`               | 0; **47 prerendered pages** satisfy contract                                           | Blog templates are SSR and are not among those 47 static page contracts.                                                                                                                                                                                 |
| `pnpm test:e2e`                  | 0; **39 passed, zero skipped**                                                         | Includes real admin login, draft/save/publish/image lifecycle and all 3 SEO tests. Uses isolated local data; does not verify production accounts/storage.                                                                                                |
| `pnpm test:seo`                  | 0; **3 passed** in separate command                                                    | Current gated inventory, not certification of the unimplemented 0DTE article or launch-ready archive metadata.                                                                                                                                           |
| `pnpm db:import-posts --dry-run` | 0; **40 imported, 0 updated, 201 image placeholders** in the command's dry-run summary | Non-writing parse/count; does not certify source claims, media existence or the non-dry-run write path.                                                                                                                                                  |
| `pnpm audit --json`              | 1; **1 high, 2 moderate, 1 low**                                                       | Registry advisory response retained in `dependencies.json`. Sandbox DNS attempt failed; successful network query then reported these findings. No dependency changes made.                                                                               |
| Svelte MCP `svelte_autofixer`    | 30 component results, 0 issues; 1 suggestion                                           | Full per-file results and manual image-menu review in `svelte-mcp.json`; async enabled because the project config enables it.                                                                                                                            |

## Reproducible audit probes

These inspect existing implementation and local fixtures, without publishing editorial content. Page loading can record ordinary analytics in the disposable local database.

```bash
# Run from the repository root with the locked dependencies available.
node docs/reviews/blog-audit-2026-11-05/source-probe.mjs \
  docs/reviews/blog-audit-2026-11-05/draft-reviewed.txt.gz

# In a separate terminal after a complete build, using the intended local DB/environment:
pnpm preview --host 127.0.0.1 --port 4173 --strictPort

BLOG_PROBE_EXTRA='/blog/institutional-order-flow-and-gamma-flip-playbook,/blog/zero-dte-risk-management-and-position-sizing-rules,/blog/private-desk-quarterly-gamma-levels-briefing,/blog/category/market-structure,/blog/tag/spx-options,/blog/0dte-spx-options-strategy-guide' \
  node scripts/blog-coverage-probe.mjs http://127.0.0.1:4173 --json

node docs/reviews/blog-audit-2026-11-05/browser-probe.mjs http://127.0.0.1:4173
```

The source probe loads TypeScript through the existing configured Vite+ alias and temporarily externalizes the sanitizer for this Node source inspection. It does not modify the production SSR bundling configuration. Initial probe harness attempts without the Svelte condition/bundling configuration failed and were corrected; only successful final probe data is used for findings.

| Artifact                                                                 | What it proves                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source.json`                                                            | Incompatible target Markdown parsing; all 40 archived packages parse; 201 image specs; draft title 58/description 157 and schema rejection; synthetic placeholder score 100; offsetless schedule accepted; nested restricted node survives; current pillar/article and author-ID behavior; literal math and sanitized HTML results |
| `http.json`                                                              | 19 requests, gate/meta/canonical/status/cache observations; public missing article 404; protected no-store; legacy hub 308                                                                                                                                                                                                         |
| `browser-results.json`                                                   | Four template families × four widths; one H1 each; matching DOM/schema breadcrumb names; no page errors; all observed font URLs local; a 4px related-card overflow at 320px; 15 resolved link/asset checks including the three draft CTA 404s and placeholder image responses                                                      |
| `index-375.png`, `index-1440.png`, `article-375.png`, `article-1440.png` | Actual rendered baseline screenshots, visually inspected. They show demo content, not the proposed new article.                                                                                                                                                                                                                    |
| `dependencies.json`                                                      | Actual advisory IDs, installed vulnerable versions and dependency paths; not an exploitation finding                                                                                                                                                                                                                               |
| `input.json`, `draft-reviewed.txt.gz`                                    | Exact reviewed draft identity; original copy preserved                                                                                                                                                                                                                                                                             |
| `svelte-mcp.json`                                                        | Official tool results for the 30 reviewed blog/editor/media components                                                                                                                                                                                                                                                             |

Browser JSON-LD/heading/image observations complement the existing end-to-end tests. The source probes are intentionally descriptive: they must not become regressions that assert the defects are the desired behavior. Several baseline fields/claims fail the intended publication standard even though repository gates pass.

## Cleanup and outstanding verification

- Stopped the manually started audit previews. A preview briefly selected port 4174 because 4173 was occupied during test-server teardown; it was stopped, and all retained custom HTTP/browser evidence used the explicit `127.0.0.1:4173` preview.
- Ran `pnpm db:seed-admin --revoke`: the throwaway admin, its four sessions and account row were removed. Temporary credentials were removed from `/private/tmp` after testing. Local ignored fixture DB/media may remain inside the audit worktree for reproducibility; none is committed.
- Removed the temporary dependency-verification setting; no final tooling configuration diff remains. Only requested documentation, policy links, read-only audit instruments and evidence are retained.
- The SHA-256 of the original draft and the decompressed `draft-reviewed.txt.gz` both match `input.json`. Repository links in the new guide/report were checked; whitespace and final tracked diff were reviewed.
- Still open: the findings in `AUDIT.md`, actual owner/author/desk evidence, broker-specific permissions, deployed storage/cron/cache behavior, the final article draft, and separately authorized section launch. No production or search-indexing claim is made.
