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

### P4 results: write and publish a post through `/admin` (2026-10-31)

Browser: Playwright (Chromium) against `vite dev` on port 5199, local PGlite, seeded temporary admin. Test content is
labelled "P4 smoke test"; every test row (post 37, 9 authors, 5 categories, 10 tags, 2 media files) was deleted at the end
and the redirect rows of the deleted post are gone (old URL 404). Scripts live in `/tmp/fc/p4-*.mjs`, not in the repo.

| Step                                                                     | Result                                          | Evidence                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1 sign in                                                               | PASS                                            | redirected to `/admin` after the seed login                                                                                                                                                                                                                                                                               |
| S2 blocked Publish                                                       | PASS after fix                                  | Alert `role=alert` with 10 items (blocking marked), focus on alert, SEO panel opened, URL stays `/admin/posts/new`, no row created. Before the fix the reasons were a raw string at the top of the page only and the SEO list was in a hidden tab. `/tmp/fc/p4-blocked-publish.png`                                       |
| S3 create author and assign                                              | PASS (the earlier failure was a duplicate name) | Create gives rpc 200, select and header show the new author. Re-using a name gives `DUPLICATE_SLUG` (409), shown before as "Failed to create author." and now as `Author slug "billy-ribeiro" already exists.` (`/tmp/fc/p4-dup.mjs`)                                                                                     |
| S4 create category, assign                                               | PASS                                            | rpc 200, checkbox checked                                                                                                                                                                                                                                                                                                 |
| S5 create two tags                                                       | PASS                                            | tags panel shows both                                                                                                                                                                                                                                                                                                     |
| S6 body                                                                  | PASS with a warning                             | HTML Source mode, placeholder removed, 2 external https links. 462 words: above the 300 minimum, below 600, so a -3 warning                                                                                                                                                                                               |
| S7 excerpt, meta title (41 chars), meta description (129), focus keyword | PASS                                            | fields accepted                                                                                                                                                                                                                                                                                                           |
| S8 FAQ, 3 items                                                          | PASS                                            | three question and answer pairs entered                                                                                                                                                                                                                                                                                   |
| S9 cover image                                                           | PASS for upload, GAP for display                | `POST /api/media/upload` 201, converted to WebP with variants; cover URL is `https://revolutiontradingpros.com/media/...`. Without `BLOB_READ_WRITE_TOKEN` the bytes go to an in-memory map and that URL is not served: local `GET /media/...` is 404 and the library thumbnails are broken (`/tmp/fc/p4-media-page.png`) |
| S10 Save Draft                                                           | PASS                                            | post 37 created as draft, SEO 97/100                                                                                                                                                                                                                                                                                      |
| Publish                                                                  | PASS                                            | admin list row `PUBLISHED`; the label bug below is fixed (the click used the "Publish" label on a draft)                                                                                                                                                                                                                  |
| Public page                                                              | PASS                                            | `GET /blog/p4-smoke-test-publishing-checklist` 200, title present, canonical on `https://revolutiontradingpros.com`                                                                                                                                                                                                       |
| JSON-LD                                                                  | PASS                                            | one `@graph`: EducationalOrganization, WebSite, BreadcrumbList, Person, BlogPosting, FAQPage. FAQPage has 3 items and the page has 3 `<details>`, identical question and answer text, 1:1                                                                                                                                 |
| `/blog`, `/rss.xml`, `/sitemap.xml`                                      | PASS                                            | status 200 on `/blog`; slug present in RSS and sitemap                                                                                                                                                                                                                                                                    |
| Edit and update                                                          | PASS                                            | Save on the live post: Revision History 2 to 3; "Compare & Restore" opens the diff dialog (`/tmp/fc/p4-c2-diff.png`)                                                                                                                                                                                                      |
| Move to Trash                                                            | PASS                                            | redirected to the list, no live row                                                                                                                                                                                                                                                                                       |
| Restore                                                                  | PASS, status question                           | Post is back in the list with status **PUBLISHED**, not draft (restore keeps the stored status, `restoreTrashedPost`). Public again without a gate check. Open decision                                                                                                                                                   |
| Rename slug                                                              | PASS                                            | rename dialog, rpc 200; `GET` old URL 301 to `/blog/p4-smoke-test-publishing-checklist-renamed`; new URL 200                                                                                                                                                                                                              |
| Permanent delete                                                         | PASS                                            | new URL 404, old URL 404 (redirect rows removed)                                                                                                                                                                                                                                                                          |

Open items from P1 to P3, resolved:

- **(a) Blocked Publish gave no visible reason: RESOLVED.** Cause: the server refusal was rendered only in the top alert
  and the issue list was inside the SEO tab, hidden unless it was the open tab. Fix: S2 above; test
  `post-editor/publish-gate.spec.ts`.
- **(b) "Add New Author" did not assign: RESOLVED, not an assignment bug.** A failing run re-used the name of an author
  created earlier, so the server returned 409 `DUPLICATE_SLUG` and the UI showed a generic message. The 409 message is
  now shown (`post-editor/rpc-error.ts`, test `rpc-error.spec.ts`). Assignment itself worked on every fresh name (3 of 3
  runs, select and header agree after the response). Open UX gap: a duplicate name is refused, not selected.
- **(c) Login form submitted before hydration sent no POST: RESOLVED.** Plain HTML POST works with JavaScript disabled
  (`javaScriptEnabled: false`: POST `/admin/login`, server answered "Email or password is incorrect."). The pre-hydration
  case was a race: the email input had `value={form?.email}`, and hydration reset the typed email to empty. The
  `required` field then blocked the native submit. Before the fix 3 of 6 attempts sent no POST and the email was cleared;
  after changing to `defaultValue` 6 of 6 sent the POST and kept the email (`/tmp/fc/p4-c4.mjs`).

New defects found and status:

- **"Update and close" on a draft published it.** Fixed: a draft shows "Publish" (top bar, sidebar and mobile bar); "Update
  and close" only for a published post. Autofixer clean; verified in the publish step: the button labelled "Publish" on draft 37 published it.
- **Cover images do not display without `BLOB_READ_WRITE_TOKEN`.** Open. Needs either the Blob token in dev or a local
  `/media/` route; not changed because it is a storage decision.
- **Media picker sets cover alt to the media title when alt is blank** (`MediaLibrary.svelte`, `handleInsertSelected`).
  The spec says `alt_text || ''`. Open, low risk: the gate blocks it with a clear reason if the title equals the post title.
- **Restore from Trash keeps status PUBLISHED.** Open decision for the owner (restore as draft, or keep).
- **Editor score counts fields before server autofill**, so the editor can show one more blocking item than the server
  (seen: "8 blocking" in the pill, 7 in the server refusal). Documented in `docs/ADMIN_LOCAL_LOGIN.md` section 8. Open.
- **Remote errors arrive as HTTP 200** with `{"type":"error"}`, including the SEO refusal. Works in the UI, but any
  monitoring by status code will not see them. Open, observation.
- **Sign-in rate limit is stored in the database and survives restarts.** 10 attempts per email per 15 minutes was hit by
  scripted testing; wait or use another email when re-running. Observation, not a change.

Not verified in P4: the media library thumbnails and cover image rendering on the public page (no servable URL locally);
the cover image in OG/Twitter output; the full gate run (`pnpm build` and `pnpm test:e2e` were not run, per instructions);
the other browsers; mobile widths; the publish of a scheduled post; the dashboard count query.
