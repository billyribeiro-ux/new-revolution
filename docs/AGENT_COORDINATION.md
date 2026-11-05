# Agent Coordination (multiple sessions, one repository)

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

| Branch                             | Owner session | Area / files claimed                                                                                                                                                                                     | Started    | Status                                                                                      |
| ---------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------- |
| `feat/maintenance-waitlist-launch` | Codex         | Maintenance chart/template, waitlist email/consent/campaign helpers, `src/lib/server/db/waitlist-schema.ts`, forward migration `drizzle/0003_waitlist_updates.sql`, privacy copy, release tests and docs | 2026-11-04 | Green/red market playback, visible ready-to-connect waitlist, protected development Preview |

## Recently finished

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
