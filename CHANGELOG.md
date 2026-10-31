# Changelog

All notable changes to this repository. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Newest first. **Every PR adds an entry under `[Unreleased]`** (agents: see
[`docs/AGENT_COORDINATION.md`](docs/AGENT_COORDINATION.md)). Entries that add anything
**temporary** are tagged `TEMPORARY` and must also appear in [`docs/TEMPORARY.md`](docs/TEMPORARY.md).

Categories: Added, Changed, Deprecated, Removed, Fixed, Security, Docs.

## [Unreleased]

### Added

- `TEMPORARY` `pnpm db:seed-admin` (`scripts/seed-admin.ts`): creates or repairs a local admin account from
  `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`; `--reset-password` and `--revoke`; refuses when `NODE_ENV=production`
  or `VERCEL` is set unless the database is the local PGlite file; never prints the password. Registered as T2.
  Spec: `scripts/seed-admin.spec.ts`. How-to: `docs/ADMIN_LOCAL_LOGIN.md`.
- `.env.example`: `TEMPORARY` placeholder keys `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD`.
- Admin sign-in at `/admin/login` (P2): form action on Better Auth `signInEmail`; generic
  "Email or password is incorrect." message; rate limit per client IP and per hashed email (`consumeRateLimit`);
  non-admin accounts get 403 and their session is revoked; `next` is accepted only through `safeAdminNext()`
  (`src/routes/admin/login/safe-next.ts`, open-redirect rules documented there). Specs:
  `safe-next.spec.ts`, `admin-access.spec.ts`, `login-page.svelte.spec.ts`.
- Admin shell (P2): `src/routes/admin/+layout.server.ts` redirects anonymous visitors to login (303, `next` kept),
  returns 403 for non-admins, and sends `X-Robots-Tag: noindex, nofollow` on every `/admin/**` page. `+layout.svelte`
  adds a skip link, nav (Dashboard, Posts, Media, View site) with `aria-current`, and a POST sign-out form
  (`src/routes/admin/logout/+server.ts`).
- Admin dashboard (P2) at `/admin`: counts of drafts, scheduled, published, trashed (plus in review and archived so the
  totals add up), and the five most recently updated posts, computed from `listAdminPosts` and `listTrashedPosts`.
  Quick links: New post, All posts, Media.

### Changed

- Better Auth options shared by `src/lib/server/auth.ts` and the seed script now live in
  `src/lib/server/auth-options.ts` (`userAdditionalFields`, `emailAndPasswordOptions`). Behaviour unchanged.

### Removed

- `/demo/better-auth` scaffold (`TEMPORARY` T6, now `removed`): it had a public sign-up form and linked to a
  non-existent `/auth/verification-success`. Replaced by `/admin/login`. The `/demo` index no longer lists it.

### Docs

- Add `docs/ADMIN_AUTH_PLAN.md`: evidence-based audit of the admin/auth/blog backend and the phased plan
  to make `/admin` reachable (Better Auth login, temporary admin account). (docs/admin-auth-plan)
- Add `docs/TEMPORARY.md` (registry of temporary code, credentials and bypasses with removal criteria)
  and `docs/AGENT_COORDINATION.md` (multi-session protocol and active-work board).
- Add this `CHANGELOG.md`.

### Security (see `docs/ADMIN_AUTH_PLAN.md` section 2)

- F2 fixed: Better Auth now exposes `user.role` (`additionalFields`, `input: false`), so `requireAdmin` accepts real admins.
  `App.Locals.user` is typed from `auth.$Infer`. Regression test: `src/lib/server/auth-role.db.spec.ts`.
- F3 fixed: removed the `x-rtp-e2e-test` header bypass from `src/hooks.server.ts` (`TEMPORARY` T1, now `removed`). Admin e2e
  tests log in through `/admin/login` and skip when `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` are unset.
- F5 fixed: `requireAdmin` now runs the CSRF origin check on every non-GET/HEAD/OPTIONS request, so a mutation with neither
  `Origin` nor `Referer` gets 403. Unit tests: `src/lib/server/auth-guard.spec.ts`.

## [0.1.0-pre] - 2026-10-30 to 2026-10-31

Entries reconstructed from `git log` (merged PRs #1 to #6), not written at the time.

### Added

- Dynamic blog system and admin dashboard (TipTap editor, SEO tools, media library) - `350e8c7`.
- `CatalogCard` shell and `CourseCard`, `IndicatorCard`, `BlogCard` (PR #4, #6).
- SEO evidence log, new-page playbook, CSS standards docs.

### Changed

- `@sveltejs/kit` 3.1.0 to 3.1.1, `@sveltejs/adapter-vercel` 7.0.1 to 7.0.2 (security fixes) - PR #5.

> Open, unmerged: PR #7 `feat/blog-cover-cards` (image-background blog cards, mock covers).
