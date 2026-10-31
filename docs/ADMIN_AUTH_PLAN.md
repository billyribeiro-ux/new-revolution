# Admin Access, Better Auth and Blog Backend: Audit and Implementation Plan

Status: **plan, nothing implemented yet** (branch `docs/admin-auth-plan`, base `origin/main` 5517043, 2026-10-31).
Companion files: [`CHANGELOG.md`](../CHANGELOG.md), [`TEMPORARY.md`](TEMPORARY.md),
[`AGENT_COORDINATION.md`](AGENT_COORDINATION.md), [`BLOG_ADAPTATION_MAP.md`](BLOG_ADAPTATION_MAP.md),
spec `src/blog-editor-implementation-prompt.md`.

Goal: the owner can sign in to a real `/admin`, write, edit, schedule and publish posts and manage media,
using Better Auth, with a clearly marked temporary admin account. Everything temporary is registered in
`TEMPORARY.md` and removed before production.

## 1. What exists (evidence)

| Area                               | Evidence                                                                                                                                                                                                                                                                                      |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Better Auth is installed and wired | `better-auth@1.7.14`; `src/lib/server/auth.ts` (`drizzleAdapter(db,{provider:'pg'})`, `emailAndPassword.enabled`, `sveltekitCookies` last); `hooks.server.ts` calls `auth.api.getSession` and `svelteKitHandler`                                                                              |
| Auth tables + `role` column        | `src/lib/server/db/auth.schema.ts` (`user.role text default 'user'`); `drizzle/0000_blog_system.sql` lines 4-15                                                                                                                                                                               |
| Admin UI                           | `src/routes/admin/{posts,posts/new,posts/[id],media}`; `src/lib/components/admin/*` (PostEditor, RichTextEditor, MediaLibrary, RevisionDiffViewer)                                                                                                                                            |
| Admin server surface is guarded    | `posts.remote.ts`: 26 remote functions, 26 `requireAdmin(` calls; `api/admin/posts*`, `api/media/{list,folders,[id],upload}` each call `requireAdmin`; cron route uses `verifyCronAuthorization` (`CRON_SECRET`); hook returns JSON 401 for unauthenticated `/api/admin/*` and `/api/media/*` |
| Public blog                        | `src/routes/blog/**`, `rss.xml`, `sitemap.xml`; `robots.txt` has `Disallow: /admin`                                                                                                                                                                                                           |
| Data layer                         | Drizzle + `postgres-js` (real URL) or PGlite (placeholder URL) in `src/lib/server/db/index.ts`                                                                                                                                                                                                |

## 2. Findings (each reproducible)

**F1. There is no way to log in or reach the admin.** `ls src/routes` has no `login`; `src/routes/admin/` has only
`media` and `posts` (no `+layout`, no index page, no sign-out). The only auth UI is `src/routes/demo/better-auth/**`
(generated sample). `requireAdmin` throws a raw 401/403 error page instead of redirecting to a login.

**F2. (Blocker) Even a real admin would be rejected: Better Auth does not return `role`.** `auth.ts` declares no
`user.additionalFields`. Reproduced with the repo's exact options on PGlite plus the repo migration: sign up, set
`role='admin'` in SQL, call `auth.api.getSession`:

```
current config (as in repo)      -> session.user.role = undefined | keys: name,email,emailVerified,image,createdAt,updatedAt,id
with user.additionalFields.role  -> session.user.role = admin     | keys: ...,role,id
```

`requireAdmin` reads `user.role !== 'admin'` and returns 403 for everyone. The existing tests pass only because the
e2e bypass (F3) injects a user object that already has `role`. Fix: declare
`user: { additionalFields: { role: { type: 'string', defaultValue: 'user', input: false } } }`
(`input:false` stops a client from self-assigning `admin` at sign-up) and type `App.Locals.user` from
`typeof auth.$Infer.Session.user` so `role` is typed instead of cast.

**F3. (Security) Header-triggered admin bypass.** `hooks.server.ts`: if there is no user, `isPlaceholderDatabaseUrl(process.env.DATABASE_URL)`
and header `x-rtp-e2e-test: 1`, `locals.user` becomes an admin. `isPlaceholderDatabaseUrl(undefined)` returns `true`, so a
production deploy with a missing `DATABASE_URL` serves a fully open CMS to anyone who sends the header (and the site would
run on an ephemeral PGlite). `.env.example` ships a placeholder URL, so a copied local env behaves the same. Registered as T1.

**F4. Public sign-up is open.** `emailAndPassword.enabled` with no `disableSignUp`, so `POST /api/auth/sign-up/email` works for
anyone (they only get `role='user'`, but it is attack surface and clutter). `disableSignUp` exists under `emailAndPassword`
(`@better-auth/core` `init-options.d.mts` line 704). Plan: allow only in dev/seed, disable for production.

**F5. CSRF check has a dead branch.** `requireAdmin` only calls `verifyCsrfOrigin` when `Origin` or `Referer` is present, so
the "both missing" error inside `verifyCsrfOrigin` is unreachable through it. SvelteKit's own form-origin check and
SameSite cookies still apply; low severity, fix by deciding policy explicitly (Phase P1).

**F6. Production database is undefined.** With a placeholder `DATABASE_URL` the app silently uses PGlite on local disk
(`.svelte-kit/pglite-blog`). On Vercel this is not durable. Target stack per `~/.claude/CLAUDE.md` is Postgres (Railway/Neon).

**F7. No migration journal.** `drizzle/` contains only `0000_blog_system.sql` (no `meta/_journal.json`), so `pnpm db:migrate`
cannot run it; `package.json` offers `db:push`. Decision needed in P5 (generate a baseline journal vs. push-only). Until
then, new schema work must be additive, idempotent SQL in a new numbered file.

**F8. Seed data and a known password.** `seedPreviewBaselineIfEmpty` inserts demo posts, one password-protected with plaintext
`AlphaDesk2026!`. The spec (section 0.5) requires fixtures flagged `is_fixture`. Registered as T4.

**F9. Scaffold leftovers.** `/demo/better-auth/**` posts to a non-existent `/auth/verification-success` and exposes a public
sign-up form. Registered as T6.

**Not yet verified** (do not assume): that the blog/DB test suites (`blog-system.e2e.ts`, `posts.db.spec.ts`,
`blog-routes.spec.ts`) pass on this tree; that the editor works in a real browser; that media upload works without
`BLOB_READ_WRITE_TOKEN`; spec phases 1-14 completion. Phase P4 settles these with evidence.

## 3. Design decisions

| Decision         | Choice                                                                                                                                                   | Why                                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Auth library     | Better Auth (already installed), email + password                                                                                                        | Owner request; already wired                                                                              |
| Role source      | `user.role` column exposed via `additionalFields` (not the Better Auth `admin` plugin)                                                                   | Column and `requireAdmin` already exist; avoids a schema change. Revisit plugin if roles/permissions grow |
| Login surface    | `/admin/login` (form action calling `auth.api.signInEmail`), logout action                                                                               | Server-rendered, works without JS, matches `/demo` pattern                                                |
| Redirect target  | `?next=` accepted only if it starts with `/admin` and not `//`                                                                                           | Prevent open redirect                                                                                     |
| Guard placement  | `src/routes/admin/+layout.server.ts` redirects unauthenticated to login and 403s non-admins; `requireAdmin` stays on every handler                       | Defence in depth: layout guards pages, handlers guard data                                                |
| Login protection | Existing `rate-limit.ts` keyed by IP + email, plus generic error message                                                                                 | Brute force; no account enumeration                                                                       |
| Indexing         | `X-Robots-Tag: noindex, nofollow` on `/admin/**` via layout/hook, `robots.txt` Disallow kept                                                             | Disallow alone does not prevent indexing                                                                  |
| Temporary admin  | Created by `scripts/seed-admin.ts` from `ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD`; refuses when `NODE_ENV=production`; password never committed or logged | Owner can test; credentials are not in git                                                                |
| E2E auth         | Playwright logs in once, saves `storageState`; hook bypass deleted                                                                                       | Tests exercise the real guard                                                                             |

## 4. Phases

Each phase: own branch/PR off `origin/main`, targeted tests while working, full gate once before push, changelog entry,
`TEMPORARY.md` updated, row updated in `AGENT_COORDINATION.md`. Svelte files go through the Svelte MCP (docs first,
autofixer last).

**P0. Tracking and plan (this PR).** Docs only.

**P1. Auth foundation (fixes F2, F3, F5).**

- `auth.ts`: `additionalFields.role`; type `App.Locals` from `$Infer`; remove casts in `auth-guard.ts`.
- Delete the header bypass in `hooks.server.ts` (T1 to `removed`).
- Decide and test CSRF policy for mutating requests with neither header.
- Tests: unit tests for `requireAdmin` (no user 401, `user` 403, `admin` ok); a PGlite integration test that signs up, promotes,
  and asserts `getSession().user.role === 'admin'` (the F2 reproduction becomes a regression test).
- Update `blog-system.e2e.ts` to use `storageState` from P2/P3 (or keep it red-free by landing P1 and P2/P3 together).

**P2. Login, logout, admin shell.**

- `src/routes/admin/login/{+page.server.ts,+page.svelte}`; `src/routes/admin/+layout.server.ts` (guard + `noindex`);
  `src/routes/admin/+layout.svelte` (nav: Dashboard, Posts, Media, View site, Sign out); `src/routes/admin/+page.svelte` (dashboard:
  counts of drafts/scheduled/published from existing services, recent posts, links).
- Remove `/demo/better-auth` (T6). Styles use SSOT tokens only; `pnpm check:css`.
- Tests: component tests for the form; route tests for redirect (`next` validation), wrong password, non-admin user.

**P3. Temporary admin account (T2).**

- `scripts/seed-admin.ts` + `pnpm db:seed-admin`: `signUpEmail`, then `UPDATE "user" SET role='admin'`; idempotent; prints the email, never the password;
  refuses in production; `--revoke` deletes the account.
- `.env.example`: `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD` (placeholder values only). `README`/this doc: how to log in locally.

**P4. Prove the backend end to end (evidence, then fix what breaks).**

- Real-browser run: login, create post, edit with TipTap, upload media, set SEO/FAQ, save draft, autosave, schedule, publish,
  view `/blog/<slug>`, check JSON-LD and RSS/sitemap entry, revisions diff and restore, trash and restore, slug rename redirect.
- Run `blog-system.e2e.ts`, `posts.db.spec.ts`, `blog-routes.spec.ts`, `form-actions.spec.ts`; record results.
- Audit against `src/blog-editor-implementation-prompt.md` phases; produce a table done / partial / missing with file evidence; log
  defects in `CHANGELOG.md` and fix in small PRs.

**P5. Production hardening (before any real deploy).**

- Require a real `DATABASE_URL` and `BETTER_AUTH_SECRET` in production (fail loud at startup); no PGlite in production (T3).
- `emailAndPassword.disableSignUp: true` in production; create the real admin; revoke T2; rotate secrets (T7).
- Better Auth `rateLimit`, `trustedOrigins`, secure cookie settings reviewed against its docs.
- Decide migration strategy (F7); fixture flag for seed data (T4/F8); `CRON_SECRET` set on Vercel.
- Replace mock blog hub with DB posts (T5); `/blogs/<slug>` vs `/blog/<slug>` URL decision.

## 5. Done means

A phase is done only with: tests for what changed passing, the gate run once before push, runtime evidence (screenshot or
curl output for UI/HTTP changes), `CHANGELOG.md` and `TEMPORARY.md` updated, and an honest "not verified" list.

## 6. Progress log

### P1 to P3 implemented on `feat/admin-auth` (2026-10-31)

Runtime evidence (Chromium against `vite dev`, local PGlite, seeded temporary admin):

- Anonymous `/admin/posts` redirects to `/admin/login?next=%2Fadmin%2Fposts`; `/api/admin/posts` returns 401;
  `x-rtp-e2e-test: 1` no longer grants access (303 to login); `/admin/login` sends `X-Robots-Tag: noindex, nofollow`.
- Wrong password shows "Email or password is incorrect."; the right one lands on `/admin/posts` (`next` honoured).
- Editor loads; typing title/excerpt/body and **Save Draft** creates post id 4 with no failed non-GET request (the stricter
  CSRF check does not break remote functions in a browser).
- Negative control: with `userAdditionalFields.role` removed, 3 of 3 tests in `auth-role.db.spec.ts` fail; restored, they pass.

Open items found while testing, to be settled in P4 (not fixed yet):

- **Publish gives no visible reason when blocked.** Clicking Publish on the draft (SEO 0/100, 7 blocking) left the page
  unchanged with status "Ready"; the post stayed `DRAFT` and `/blog/<slug>` returned 404. The gate is by design
  (`src/lib/shared/seo/score.ts`), but the blocking reasons must be shown to the user.
- **"Add New Author" did not assign an author** in the scripted run (select still "Unassigned"); not yet determined whether
  that is a race in the script or a defect.
- Login form submitted before hydration in one dev run did not POST (script clicked right after `goto`); passed once the page
  was idle. Not reproduced by hand; check progressive enhancement in P4.
- Dashboard loads full post rows to count them; add a count query (`services/posts.ts`).
- Login rate limits (30/IP, 10/email per 15 min) are custom, not Better Auth's limiter; revisit in P5.
- `getClientIp()` in `auth-guard.ts` trusts the first `x-forwarded-for` value (client-controllable); the login action uses
  `getClientAddress()` instead. Decide for the other callers in P5.
