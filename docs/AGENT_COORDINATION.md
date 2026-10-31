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

| Branch                  | Owner session      | Area / files claimed                                                                                                    | Started    | Status                     |
| ----------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------- | ---------- | -------------------------- |
| `feat/blog-cover-cards` | cards session      | `CatalogCard`, `BlogCard`, `blog-hub.ts`, `static/blog-mocks/`                                                          | 2026-10-31 | PR #7 open, awaiting merge |
| `docs/admin-auth-plan`  | admin/auth session | `docs/ADMIN_AUTH_PLAN.md`, tracking docs; later `src/hooks.server.ts`, `src/lib/server/auth*.ts`, `src/routes/admin/**` | 2026-10-31 | Phase P0 (docs)            |

## Recently finished

| PR  | What                                           |
| --- | ---------------------------------------------- |
| #6  | Indicator + blog cards; dead CSS removal       |
| #5  | kit 3.1.1 / adapter-vercel 7.0.2 security bump |
| #4  | Course cards                                   |

## Hot files (high collision risk; claim explicitly)

`src/hooks.server.ts`, `src/lib/server/auth.ts`, `src/lib/server/db/schema.ts`, `drizzle/*.sql`,
`src/app.css`, `package.json`, `pnpm-lock.yaml`, `src/lib/seo/structured-data.ts`.
Migrations are forward-only: never edit a shipped migration, add a new numbered file.
