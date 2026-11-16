# Frontend implementation ledger

The owner authorized implementation on November 16, 2026. This ledger separates verified repairs from unfinished product work. The discovery and claim-verification reports remain historical baseline evidence.

## Batch 1: accessibility and trustworthy verification

Implemented:

- Retained `phosphor-svelte@3.1.1` and the existing per-icon import facade; removed unused `carbon-icons-svelte`. Decorative icons beside equivalent text on the stock-index directory now have `aria-hidden="true"` and `focusable="false"`. Meaningful chart SVGs retain their accessible names.
- Added named regions, native `tabindex="0"`, and inset three-pixel focus rings to the six confirmed table scroll regions. Applied the same fix to three additional gated store templates. The narrow Svelte compiler suppression explains the intentional keyboard focus on native overflow containers; no custom keyboard handling is needed.
- Fixed enlarged-text overflow in shared room/course headers, status badges, narrow grid tracks, and ETF card labels/links. Copy in the affected public page families can break long words when necessary; protected blog typography and layout are preserved. The regression checks rendered text bounds as well as page width so clipping cannot hide an unreadable label. Scroll regions have distinct names from their containing sections.
- Replaced the handwritten accessibility checks and arbitrary score in `tests/seo/lab.ts` with pinned `axe-core@4.11.0`. Lab output retains engine identity, rule/node details, and incomplete checks requiring human review. Tap-size measurements remain separately labeled usability observations. Default output is ignored `test-results/accessibility-lab/`.
- Added product regressions for actual axe results, narrow/wide reflow, native arrow scrolling, entering/leaving table regions by Tab, and JavaScript-disabled rendering. A synthetic negative control reproduces both original rule failures and demonstrates their removal. Hidden controls do not produce false positives.
- Moved the raw historical audit captures and characterization probes to the checksum-verified archive documented in [evidence-index.md](evidence-index.md). Curated reports stay in Git.

The first targeted Chromium run passed **17 tests**, including **28 axe samples** (seven routes at 320, 375, 1440, and 1584 CSS pixels) and twelve native keyboard checks with JavaScript on/off. The expanded checks identified and drove the enlarged-text fix. WebKit requires a nonzero key duration to exercise native animated scrolling, so the regression uses a 150ms arrow press. Final cross-browser and repository-gate results are recorded below. Automated scans do not establish complete WCAG conformance.

`pnpm audit:frontend` was also exercised across all nine representative templates and emitted actual axe-core 4.11.0 engine results. It surfaced moderate best-practice findings involving existing complementary/announcement landmarks; these are retained in the reports rather than converted into a green numeric score. The product gate rejects serious/critical findings; broader manual accessibility review remains open.

## Remaining frontend work

| Workstream                    | Completion requirement                                                                                                                                                                | State                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Customer entry and enrollment | Membership comparison, login, register, mentorship application, and eight enrollment destinations with reviewed states, validation, error recovery, and accurate service availability | Open; backend contracts are separate dependencies               |
| Resources                     | Replace 22 TODO shells with useful route-specific content/tools and their accessibility/SEO evidence                                                                                  | Open                                                            |
| Store                         | Complete 33 gated catalog/product shells with actual supplied product facts, assets, and reviewed interaction states                                                                  | Open; commerce remains disabled                                 |
| Authentic proof/media         | Supply the three historical chart receipts and real portrait; verify source, captions, licensing, dimensions, and alternatives                                                        | Waiting for owner-supplied material; no fabricated replacements |
| Accessibility follow-up       | Review remaining moderate complementary/announcement landmark findings and perform manual assistive-technology checks                                                                 | Open                                                            |
| Release verification          | Validate completed workflows across supported browsers, keyboard, text enlargement, spacing overrides, and no-JavaScript behavior; preserve metadata/indexing and layout contracts    | Batch-specific evidence required                                |

New or redesigned workflows need a reviewable prototype and approved acceptance criteria before production implementation. Completing frontend states does not establish backend integration. TODO/noindex and commerce gates stay in place until the corresponding work and owner authorization are complete. The intentionally removed custom domain is outside remediation scope.

## Verification

The final gate completed with an explicit in-memory database, disk media, disabled external providers, and the local preview origin. Each command exited `0`.

| Command                     | Result                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| `pnpm check:css`            | Font policy and all 130 CSS token references passed                                       |
| `pnpm check`                | Zero errors and warnings                                                                  |
| `pnpm lint`                 | Formatting, Oxlint, and ESLint passed                                                     |
| `pnpm test:unit --run`      | 105 files, 750 tests passed                                                               |
| `pnpm build`                | Production build, maintenance output, native sharp, and offline email verification passed |
| `pnpm check:pages`          | 99 page contracts passed                                                                  |
| `pnpm test:seo`             | Three tests passed                                                                        |
| `pnpm exec playwright test` | 78 passed, 19 expected skips                                                              |

The 19 skips are the existing 17 authenticated-admin cases without configured credentials and two concept-preview cases with the gate disabled. No authenticated customer/backend integration coverage is claimed.

The final 12 accessibility tests include 28 real axe route/width samples, 36 native keyboard route/browser/JavaScript combinations across Chromium, Firefox, and WebKit, a defect-detecting negative control, and enlarged-text/spacing checks on seven routes. These pass with zero serious/critical axe findings. All nine changed Svelte components passed the official Svelte MCP autofixer with zero issues or suggestions.

Visual inspection covered the stock-index table focus indicator at 320px, enlarged ETF card copy at 320px, the swing-room layout at 1584px, and the protected article/TOC at 1920px. The wide public container remains 1536px. Earlier failed enlarged-text runs drove the wrapping corrections; the protected article's short-viewport unit test also passes after limiting word wrapping to the affected page families.

Raw final gate logs, real lab results, screenshots, and their SHA-256 manifest are retained under `/Users/billyribeiro/dev/new-revolution-audit-evidence/2026-11-16-592f440/implementation/`. Generated evidence is excluded from the commit.
