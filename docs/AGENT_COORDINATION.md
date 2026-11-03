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

| Branch                       | Owner session                                      | Area / files claimed                                                                                                                                                                                                                                                                                                                                                                                            | Started    | Status                                                        |
| ---------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------- |
| `feat/ymyl-launch-hardening` | Claude (YMYL / launch-readiness audit, 2026-11-02) | `src/lib/data/launch-gate.ts` (new), `src/lib/data/homepage.ts`, `src/routes/+page.svelte`, home sections (`HeroSection`, `CaseStudiesSection`), `Navbar.svelte`, `Footer.svelte`, `src/lib/seo/structured-data.ts` (`isNoIndexRoute`, founder/org entities), `src/routes/sitemap.xml/+server.ts`, `src/hooks.server.ts` (font preload filter), `vercel.json`, `docs/seo/*`, `docs/seo/audit/02-inventory.json` | 2026-11-02 | ready for review (no PR yet)                                  |
| `chore/deps-bump-2026-11`    | Claude (dependency update, 2026-11-03)             | `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` (catalog), `README.md`, `GEMINI.md`, `CHANGELOG.md`, `docs/BLOG_ADAPTATION_MAP.md`, `docs/ADMIN_AUTH_PLAN.md`, `docs/seo/audit/00-environment.md` (addendum)                                                                                                                                                                                            | 2026-11-03 | ready for review (no PR yet); worktree `/tmp/wt-deps-2026-11` |

## Recently finished

| PR  | What                                                                                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| —   | Phases 1–5 Admin/Editor/TOC/Blog Hardening, `/blogs` -> `/blog` unification (`T5`), and 40 Markdown posts moved to `content/blog-posts/` (`f3556da7`) |
| #6  | Indicator + blog cards; dead CSS removal                                                                                                              |
| #5  | kit 3.1.1 / adapter-vercel 7.0.2 security bump                                                                                                        |
| #4  | Course cards                                                                                                                                          |

## Hot files (high collision risk; claim explicitly)

`src/hooks.server.ts`, `src/lib/server/auth.ts`, `src/lib/server/db/schema.ts`, `drizzle/*.sql`,
`src/app.css`, `package.json`, `pnpm-lock.yaml`, `src/lib/seo/structured-data.ts`.
Migrations are forward-only: never edit a shipped migration, add a new numbered file.
