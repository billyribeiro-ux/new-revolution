# Changelog

All notable changes to this repository. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Newest first. **Every PR adds an entry under `[Unreleased]`** (agents: see
[`docs/AGENT_COORDINATION.md`](docs/AGENT_COORDINATION.md)). Entries that add anything
**temporary** are tagged `TEMPORARY` and must also appear in [`docs/TEMPORARY.md`](docs/TEMPORARY.md).

Categories: Added, Changed, Deprecated, Removed, Fixed, Security, Docs.

## [Unreleased]

### Docs

- Add `docs/ADMIN_AUTH_PLAN.md`: evidence-based audit of the admin/auth/blog backend and the phased plan
  to make `/admin` reachable (Better Auth login, temporary admin account). (docs/admin-auth-plan)
- Add `docs/TEMPORARY.md` (registry of temporary code, credentials and bypasses with removal criteria)
  and `docs/AGENT_COORDINATION.md` (multi-session protocol and active-work board).
- Add this `CHANGELOG.md`.

### Security (findings recorded, not yet fixed; see `docs/ADMIN_AUTH_PLAN.md` section 2)

- F2: `role` is not returned by Better Auth, so `requireAdmin` rejects every real user (403).
- F3: `x-rtp-e2e-test` header grants an admin session whenever `DATABASE_URL` is unset or a placeholder.

## [0.1.0-pre] - 2026-10-30 to 2026-10-31

Entries reconstructed from `git log` (merged PRs #1 to #6), not written at the time.

### Added

- Dynamic blog system and admin dashboard (TipTap editor, SEO tools, media library) - `350e8c7`.
- `CatalogCard` shell and `CourseCard`, `IndicatorCard`, `BlogCard` (PR #4, #6).
- SEO evidence log, new-page playbook, CSS standards docs.

### Changed

- `@sveltejs/kit` 3.1.0 to 3.1.1, `@sveltejs/adapter-vercel` 7.0.1 to 7.0.2 (security fixes) - PR #5.

> Open, unmerged: PR #7 `feat/blog-cover-cards` (image-background blog cards, mock covers).
