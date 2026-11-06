# Agent Coordination (multiple sessions, one repository)

> **Blog work — November 5, 2026:** Read the [mandatory blog handoff](BLOG_AGENT_HANDOFF.md) before adding or changing articles, editor workflows, blog SEO or automation. It distinguishes the existing CMS workflow from the proposed intake tooling.

The owner runs several AI sessions at once against this repo. They share one checkout and one remote.
This file is how they avoid colliding. Read it **before** you start; update it **when** you start and finish.

## Rules

1. **Work in your own git worktree + branch**, never the shared checkout:
   `git worktree add /tmp/wt-<topic> -b <type>/<topic> origin/main`.
2. **Never `git stash` bare** (the stash is shared). Never push to `main`; open a PR.
3. **Claim before you edit.** Add a row to "Active work" with the files/areas you will touch. If a row
   already claims them, do not edit them; pick other work or ask the owner.
4. **Log every change** in `CHANGELOG.md` under `[Unreleased]`. Anything temporary also gets a row in
   `docs/TEMPORARY.md`.
5. **Evidence over assumption.** Cite file:line, a command and its output, or an official doc. State what you
   did not verify.
6. **Test what changed**; run the full gate once, right before pushing (`AGENTS.md` section 4, step 4).
7. Merging and pushing are separate acts. The owner decides when to merge.
8. When done, move your row to "Recently finished" with the PR number.

## Active work

Release verification claim: `docs/blog-index-release-20261105` — Codex — staged/public indexing verification, URL inventory, publishing handoff and changelog (2026-11-05).

| Branch | Owner session | Area / files claimed | Started | Status |
| ------ | ------------- | -------------------- | ------- | ------ |

## Recently finished

- **Blog indexing release (Codex, November 5; PR #35):** application `33a1346` is promoted as `dpl_BsMg9eQAp53q2NAAbhG58Fc9TZyj`. Both requested blog URLs are index-eligible; all 19 sitemap URLs and 24 public browser cases pass. The follow-up release evidence branch owns the current documentation refresh. See `docs/reviews/blog-indexing-release-2026-11-05/VERIFICATION.md`.

- **Article TOC release evidence (Codex, November 5):** PR #33 squash `63ca12c` is live as `dpl_HLkaHmeEwoQsh3iL5zEBjn2wvN2f`; the public 0DTE article passed 24 viewport, no-JavaScript and reduced-motion cases across three browser engines. Maintenance remains off. Evidence: `docs/reviews/article-toc-2026-11-05/VERIFICATION.md`.

- **Article layout and desktop TOC (Codex, November 5; [PR #33](https://github.com/billyribeiro-ux/new-revolution/pull/33)):** align the article reading column and add a responsive, keyboard-operable sticky TOC with semantic heading hierarchy. Local real-article rendering, 576 unit tests, 48 Chromium, 24 Firefox, 23 WebKit and separate WebKit HTTPS unlock checks pass. Plugin parity limitations and full evidence: `docs/reviews/article-toc-2026-11-05/VERIFICATION.md`.

- **Blog design release evidence (Codex, November 5):** PR #31 squash `7e31730` is live as `dpl_9LaYzMKyN2JVb3eZrawor6Ntcfue`; 27 public browser cases pass across homepage, archive and article, three widths and three engines. Maintenance remains off. Evidence: `docs/reviews/blog-design-2026-11-05/VERIFICATION.md`.

- **Blog archive and footer refinement (Codex, November 5; [PR #31](https://github.com/billyribeiro-ux/new-revolution/pull/31)):** redesign the archive hierarchy and lead media and align the full risk disclosure with the shared container; preserve CMS discovery and disclosure wording. Local visual audit, 575 unit tests, 44 Chromium E2E, 15 Firefox and 15 WebKit, 3 SEO checks, build and page contracts pass. Two unchanged source drafts fail repository-wide formatting. Evidence: `docs/reviews/blog-design-2026-11-05/VERIFICATION.md`.

- **First article published (Codex, November 5; [PR #30](https://github.com/billyribeiro-ux/new-revolution/pull/30), implementation [PR #29](https://github.com/billyribeiro-ux/new-revolution/pull/29)):** owner explicitly chose publish after verification. Production post 1 is live and featured on homepage/archive at `/blog/0dte-spx-options-strategy-guide`; 3,199 words, six real Blob media originals and actual generated variants/crops. Exact merged source `e94fc23` is served by `dpl_EbGSBSiqZEEQnmTdKQ21TQpTnhEg`. Hosted draft acceptance: 15 rendered/seven HTTP checks; public acceptance: 27 rendered/seven HTTP checks plus eight taxonomy/CTA links, without bypass credentials. Maintenance stays off; indexing stays gated. No admin account or schema migration was added. Changelog and current publishing/admin/media handoffs updated. Evidence: `docs/reviews/first-blog-2026-11-05/production.json` and `VERIFICATION.md`.

- **First article preparation (Codex, November 5; [draft PR #29](https://github.com/billyribeiro-ux/new-revolution/pull/29)):** prepare the owner-selected `blogs/first-blog.md` as a complete 3,199-word reviewed candidate with five original diagrams, two derivatives and a primary-source claim ledger. Preserve the source brief. Fix rich-table mobile overflow and add the authenticated regression. Gates: 575 unit tests, 44 full authenticated E2E, 15 Firefox, 15 WebKit, 3 SEO, complete build and 46 static contracts. Exact article: 15 production-preview draft cases, 18 local publication cases, decoded images/crops, featured homepage/archive placement, schema dates, RSS and withdrawal. Final local state is draft; no hosted content or indexing launch. Full lint flags only two inherited references; owned formatting/Oxlint/Svelte ESLint and official MCP pass. Evidence: `docs/reviews/first-blog-2026-11-05/VERIFICATION.md`.

- **Public blog release evidence (Codex, November 5; [PR #28](https://github.com/billyribeiro-ux/new-revolution/pull/28)):** PR #27 squash `b19c91f` is published as Production `dpl_5QU1Tz3sngobduDUb1jKoqmaggpF` with maintenance off. Staged Production and public acceptance each pass 18 browser cases and eight HTTP checks. Private Preview remains SSO-protected. Save exact release/source identity, screenshots and updated operational handoff; application bytes are unchanged. Release documents, Oxlint and Svelte ESLint pass; repository-wide lint flags only two inherited article drafts, preserved untouched. Original article/assets remain deferred to the next discussion. Evidence: `docs/reviews/blog-layout-release-2026-11-05/VERIFICATION.md`.

- **Blog layout/discovery/runtime implementation (Codex, November 5; [PR #27](https://github.com/billyribeiro-ux/new-revolution/pull/27), squash `b19c91f`):** source implementation merged after 575 unit tests, 43 full E2E, 14 Firefox and 14 WebKit cases, CSS/diagnostic/lint/build, 46 static contracts and 3 SEO checks. Actual corrected Preview passes 18 rendered cases and eight HTTP checks; private alias repointed. Production is promoted and public acceptance passes 18 browser cases and eight HTTP checks; final evidence is recorded in PR #28. Original article/assets remain deferred by the owner.

- **Automatic CMS blog discovery (Codex, 2026-11-05; [draft PR #27](https://github.com/billyribeiro-ux/new-revolution/pull/27)):** share homepage/archive discovery, one selected-or-newest lead, paginated remaining posts, real media and no mock fallback. Add the owner-requested homepage SSR/discovery exceptions while preserving maintenance and other launch protections. Final gates pass: 575 unit/component tests, 40 authenticated E2E without skips, 3 SEO tests, 46 static contracts, clean four-component Svelte MCP and reviewed mobile/desktop screenshots. Evidence: `docs/reviews/blog-discovery-2026-11-05/VERIFICATION.md`. No hosted content publication or Production promotion.

- **Blog handoff coverage (Codex, 2026-11-05; `docs/blog-audit-20261105`, no PR):** add the shared handoff and dated references across 40 agent-facing Markdown entry points, explicitly import it in Claude, update the changelog and correct the missing static blog-data-file recipe. Verify all handoff references/links, front matter, SEO-standard parity, preserved reference artifacts, formatting and whitespace. Documentation only; no application, CMS or deployment changes.

- **Blog automation design (Codex, 2026-11-05; `docs/blog-audit-20261105`, no PR):** review all 164 official Svelte/Kit MCP sections; add a source-based package/validator/draft-import/preview plan and documentation coverage ledger. Clarify that JSON-LD already derives from CMS content. Validate changed-file formatting, local links, package-script examples, ledger partition and whitespace. No application implementation, content import, dependency upgrade or deployment.

- **Blog audit and 0DTE plan (Codex, 2026-11-05; local branch `docs/blog-audit-20261105`, no PR requested):** document the complete CMS workflow and 17 engineering findings, review the original brief against current primary sources, and add the agent publishing guide linked from `AGENTS.md`. Evidence: `docs/reviews/blog-audit-2026-11-05/`. Final unit repeat: 559 passed; authenticated E2E: 39 passed without skips; standalone SEO: 3 passed; 47 static page contracts; Svelte MCP: 30 components. Four dependency advisories and the recorded content/launch blockers remain open. No application, hosted data or deployment changes; local throwaway admin revoked.

- **Published maintenance and development handoff (Codex, 2026-11-04; PR #26):** promote exact verified application `6c35cf2` as `dpl_4r3cshbeVdWiba3ZhWzBPLiRFYJo`; staged and public acceptance each pass eight HTTP checks and six three-engine mobile/desktop cases. Provide a stable authenticated normal Preview, record final integrated gates and clarify isolated/staged/canonical email activation tests. Owner-deferred Production services remain disconnected, with visible disabled capture. No live email or Production migration performed. Evidence: `docs/reviews/maintenance-ready/VERIFICATION.md`.

- **Green/red market playback and prepared waitlist (Codex, 2026-11-04; PR #25):** integrated in `6c35cf2` after the completed CLS fix (PR #24). Visible disabled form, realistic simulated candle behavior, immediate confirmation/receipt and consented update queue are implemented. Provider/database hookup and real delivery remain owner-deferred. Source evidence: `docs/reviews/maintenance-ready/VERIFICATION.md`.

- **Maintenance keyboard contrast (Codex, 2026-11-04; PR #23):** a final deployed-browser check found the shared layered skip-link color overridden by unlayered maintenance anchor styling. Exclude the skip link from the generic anchor override so its shared `var(--ink)` color wins, and assert its computed focused color. Preserve the separate active CLS worktree.

- **Maintenance release repair (Codex, 2026-11-04; PR #22):** add configuration-aware maintenance markup, unique form identifiers, enabled/disabled generated-output regressions, explicit Production promotion/public-verification instructions and the Vite+ documentation policy. Local gates passed: 549 unit/component tests, 38 authenticated browser tests (no skips), 3 SEO tests, 47 page contracts, 4 build-output tests and 24 additional three-engine maintenance cases. Production capture remains off until its service prerequisites pass. Evidence: `docs/reviews/maintenance-release/VERIFICATION.md`.

- **Vite+ documentation policy (Codex, 2026-11-04; included in PR #22):** require current pnpm scripts and the project-local Vite+ CLI throughout operational docs and agent prompts. Correct remaining actionable npx examples, media-preview wording and the missing full build in CSS verification; keep dated command evidence intact. Verified changed-file Oxfmt, added local links, package-script alignment, identical SEO-standard copies and whitespace. The policy itself changes documentation only; it is included in the verified maintenance release. No toolchain migration or dependency changes.

- **Repository consolidation (Codex, 2026-11-04; direct owner request, no PR):** confirmed every remaining branch's work was already integrated on `main`, replaced its complete history with one root commit and retired all other local/remote branches. Original history: `.git/backups/before-consolidation-20261104.bundle`. Existing worktree folders and local configuration are preserved; their checkouts are detached for branch removal. Validation: CSS checks, Svelte diagnostics, lint, 549 unit/component tests, production build, 47 prerendered-page contracts and 3 SEO tests passed. Full E2E: 23 passed, 13 skipped because no admin credentials were supplied; authenticated admin behavior was not verified in this run. The historical `develop` Preview branch is retired; no Vercel configuration was changed.

- **YMYL / launch-readiness audit (Claude, 2026-11-02):** implementation was merged into the previous `main` history (`e482fa9`); the stale active-work claim is closed during the owner's branch consolidation.

- **Maintenance chart and verified waitlist (Codex, 2026-11-04; former branch `docs/maintenance-chart-waitlist-plan`, PR #21):** implementation and local verification complete. Sources, migration, operational handlers, queue, chart and privacy updates are integrated on `main`. Production/Resend setup, supported scheduling, real mailbox delivery and staged Vercel verification remain release prerequisites. Evidence: `docs/reviews/maintenance-waitlist/VERIFICATION.md`.

- **Maintenance chart / verified waitlist planning (Codex, 2026-11-03; no PR):** `docs/maintenance-chart-waitlist-plan` adds `docs/MAINTENANCE_EXPERIENCE_PLAN.md` and a changelog entry. Verified installed packages, source behavior, official API guidance and Vercel environment scopes; Markdown formatting and whitespace checked. Planning only: no application, schema, email sends or deployment changes.

- **Production maintenance / Preview rollout (Codex, 2026-11-03; PR #20):** public maintenance deployed and verified; separate protected `develop` Preview with a new free-plan Neon database. Fixed deployed sanitizer module loading through SSR bundling; all required gates passed (529 unit tests, 35 browser tests, 3 SEO tests, 47 page contracts). Evidence: `docs/reviews/maintenance-design/PRODUCTION_DEPLOYMENT.md`.

- **Repository diagnostics repair (Codex, 2026-11-03; PR #19):** fixed generic test typing, included SEO tooling in type checks, cleared all lint findings, and verified authenticated E2E with a unique throwaway admin. All 529 unit tests, 35 browser tests (no skips), 3 SEO tests and 47 page contracts passed. Evidence: `docs/reviews/repository-diagnostics/VERIFICATION.md`. Vercel project remains paused.

- **Vite+ agent documentation (Codex, 2026-11-03; PR #18):** added `docs/VITE_PLUS_WORKFLOW.md` and updated agent entry points and stale tooling/SEO-command references. Verified the local toolchain, Markdown formatting and links, `pnpm check`, and one Vite+ unit spec. No toolchain migration or dependency changes performed.

- **Maintenance desk notice (Codex, 2026-11-03; no PR):** implemented the approved responsive design, canonical typography, direct support and retry behavior; 15 cross-browser maintenance checks, 520 unit tests, 22 full browser tests and 47 prerendered pages passed. Evidence: `docs/reviews/maintenance-design/IMPLEMENTATION.md`. No deployment performed; Vercel preview remains outstanding.

| PR  | What                                                                                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| #13 | Dependency update: threlte, better-auth, pglite, shiki, svelte-check, globals (vitest held at 5.0.5 by vite-plus pin)                                 |
| —   | Phases 1–5 Admin/Editor/TOC/Blog Hardening, `/blogs` -> `/blog` unification (`T5`), and 40 Markdown posts moved to `content/blog-posts/` (`f3556da7`) |
| #6  | Indicator + blog cards; dead CSS removal                                                                                                              |
| #5  | kit 3.1.1 / adapter-vercel 7.0.2 security bump                                                                                                        |
| #4  | Course cards                                                                                                                                          |

## Hot files (high collision risk; claim explicitly)

`src/hooks.server.ts`, `src/lib/server/auth.ts`, `src/lib/server/db/schema.ts`, `drizzle/*.sql`,
`src/app.css`, `package.json`, `pnpm-lock.yaml`, `src/lib/seo/structured-data.ts`.
Migrations are forward-only: never edit a shipped migration, add a new numbered file.
