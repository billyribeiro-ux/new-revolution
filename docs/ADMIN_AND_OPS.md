# Admin Authentication, Maintenance, Waitlist & Operations (`docs/ADMIN_AND_OPS.md`)

> **Applies To:** `/admin/**`, `src/lib/server/{auth,auth-options,auth-guard,auth-guards}.ts`, `scripts/seed-admin.ts`, `scripts/maintenance-build.mjs`, `src/lib/server/waitlist/**`, `src/routes/api/{health,cron/*,webhooks/*}`, and [`src/env.ts`](../src/env.ts).

---

## 1. `/admin` Architecture & Better Auth (`better-auth@1.7.25`)

1. **Authentication & Role Model (`src/lib/server/auth.ts`, `src/lib/server/auth-options.ts`):**
   - Uses `drizzleAdapter(db, { provider: 'pg' })` with `emailAndPassword` (`disableSignUp: process.env.NODE_ENV === 'production'`).
   - Exposes `user.role` via `userAdditionalFields` (`{ type: 'string', defaultValue: 'user', input: false }` — `input: false` prevents self-promotion on sign-up, and `App.Locals.user` is typed from `auth.$Infer.Session.user`).
2. **Defense-in-Depth Admin Guards:**
   - **Layout Guard (`src/routes/admin/+layout.server.ts`):** Redirects unauthenticated requests (`303`) to `/admin/login?next=<validated-admin-path>` (`safeAdminNext` rejects `//` and non-`/admin` targets), returns `403` and revokes session for non-`admin` users, and sets `X-Robots-Tag: noindex, nofollow` on every `/admin/**` response (while [`src/routes/robots.txt/+server.ts`](../src/routes/robots.txt/+server.ts) intentionally omits `Disallow: /admin` in production per `IDX-08` so crawlers can observe `noindex`).
   - **Handler & RPC Guard (`requireAdmin` in `src/lib/server/auth-guard.ts` & `auth-guards.ts`):** Enforced on all 26+ remote functions (`posts.remote.ts`, `src/lib/remote/admin/*.remote.ts`) and `/api/admin/*` + `/api/media/*` endpoints, running strict CSRF `Origin`/`Referer` verification on every non-`GET`/`HEAD`/`OPTIONS` mutation (`request.url` host comparison, never `event.url` inside remote queries).
   - **Sign-In Rate Limit:** `/admin/login` enforces durable DB rate limits (`30`/IP and `10`/hashed-email per 15 minutes) with generic `"Email or password is incorrect."` messaging and `defaultValue` form hydration stability.
3. **14-Section Executive Admin Shell (`src/routes/admin/**`):**
   - `Overview` (Executive D3 KPI & Funnel Dashboard — uses explicit `d3-transition` setup for D3 `7.9.2` hydration safety), `Posts` & TipTap `PostEditor`, `Media`, `Leads`, `Subscribers`, `Sequences`, `Email Analytics`, `Calls`, `Inbox`, `Notifications`, `Analytics`, `Consent`, `Campaigns`, and encrypted `Integrations`.
   - All CSV exports (`leads`, `email-sequences`, `scheduled-calls`, `consent`) sanitize leading `=`, `+`, `-`, `@`, `\t`, `\r` cells to prevent spreadsheet formula injection.

---

## 2. Local Temporary Admin Account (`pnpm db:seed-admin`, `T2`)

Registered as **`T2`** in [`docs/TEMPORARY.md`](TEMPORARY.md). Never deploy `ADMIN_SEED_*` variables to Production.

### 2.1 Setup & Commands

1. Copy `.env.example` to `.env` (gitignored) and set your own local values:
   - `ADMIN_SEED_EMAIL`: valid email address
   - `ADMIN_SEED_PASSWORD`: at least **12 characters**
2. Stop `pnpm dev` before seeding if using local single-process PGlite (`.svelte-kit/pglite-blog`), then run:

| Command                               | Behavior                                                                                                                                                                     |
| :------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm db:seed-admin`                  | Idempotently creates the user via Better Auth (or repairs `role='admin'` & `email_verified=true` without overwriting an existing password). Never logs the password or hash. |
| `pnpm db:seed-admin --reset-password` | Overwrites the stored password with `ADMIN_SEED_PASSWORD`.                                                                                                                   |
| `pnpm db:seed-admin --revoke`         | Deletes the user (`ON DELETE CASCADE` removes `session` and `account` rows).                                                                                                 |

3. Start `pnpm dev` and sign in at `http://localhost:5173/admin/login`.

### 2.2 Production Refusals & Pre-Production `T2` Checklist

- `scripts/seed-admin.ts` exits non-zero **before opening any DB connection** when `NODE_ENV=production` or `VERCEL` is set unless `DATABASE_URL` points to local PGlite.
- Hosted Production (`revolution-production` Neon DB) and Preview (`revolution-preview` Neon DB) reject missing or placeholder `DATABASE_URL` values at build/runtime (`T3`) and require a high-entropy 32+ character `BETTER_AUTH_SECRET` (`T7`).
- For authenticated Playwright E2E runs (`admin-shell.e2e.ts`, `image-flow.e2e.ts`, `blog-system.e2e.ts`), always seed and revoke a disposable admin against an isolated `pglite://` path as documented in [`docs/VITE_PLUS_WORKFLOW.md`](VITE_PLUS_WORKFLOW.md) §3.

---

## 3. Deployment-Time Maintenance Mode & Staged Vercel Promotion

**Current Live State:** `MAINTENANCE_MODE` is **off** (`false`) in both Production and Preview (`/maintenance-state.json` returns `{"maintenance":false}`).

1. **Build-Time Mechanism (`scripts/maintenance-build.mjs`):**
   - Maintenance mode is a **deployment-time** switch wired into `pnpm build` using the Vercel Build Output API (`.vercel/output/config.json` + `__maintenance_page.func` / `__maintenance_api.func`). Editing an environment variable in Vercel has zero effect until a new deployment is built and promoted.
   - When `MAINTENANCE_MODE=true` at build time, page requests return HTTP `503` (`Cache-Control: no-store`, no `Retry-After`) with a self-contained branded HTML document (`scripts/templates/maintenance.html`) embedding compiled tokens, emblem, and a simulated Lightweight Charts/GSAP market playback panel (explicitly labeled simulated data, paused under `prefers-reduced-motion` and offscreen, with accessible candle table).
   - Exact bypasses remain active for immutable `/_app/*` & `/fonts/*` assets, `/api/health`, `/privacy-policy`, and exact waitlist/Resend/worker routes; `/admin/**` and general APIs stay blocked during maintenance.
   - Normal deployments serve `/maintenance-state.json` (`no-store`), checked on client navigation in `src/routes/+layout.svelte` (`onNavigate`).
   - Local inspection: `MAINTENANCE_MODE=true pnpm build` + `node --test tests/maintenance/build-output.test.mjs` (re-run `pnpm build` unset afterward; `pnpm preview` does not run Vercel's `.vercel/output/config.json` router).
2. **Staged Production Promotion Protocol (`autoAssignCustomDomains=false`):**
   - Merging/pushing to `main` creates a **staged** Vercel Production build; it does **not** automatically repoint `www.revolutiontradingpros.com`.
   - When the owner explicitly authorizes promoting a Production deployment:
     1. Run all local gates (`AGENTS.md` §5) and confirm the target commit SHA.
     2. Inspect the deployment: `vercel inspect <deployment-id> --json` (`READY`, `target: "production"`).
     3. Smoke-check the staged build with `vercel curl / --deployment <deployment-id>` (headers, SSR `/` & `/blog`, `/api/health`, unauthenticated `/api/admin/posts` → `401`).
     4. Promote: `vercel promote <deployment-id> --scope will-ribeiros-projects`.
     5. Verify `https://www.revolutiontradingpros.com` and `https://revolutiontradingpros.com` (`308` → `www`) in HTTP + clean browser.

---

## 4. Reopening Waitlist Operations (`T13`)

Implemented in `src/lib/server/waitlist/` with forward-only migrations `0002_waitlist.sql` and `0003_waitlist_updates.sql`. **Currently disabled (`WAITLIST_SIGNUPS_ENABLED=false`)** — when maintenance HTML is rendered, the waitlist `<fieldset>` stays visibly disabled with an honest availability note until provider setup is completed.

### Required Production Variables (`src/env.ts` & `.env.example`)

`DATABASE_URL`, `WAITLIST_ORIGIN` (`https://www.revolutiontradingpros.com`), `WAITLIST_FROM_EMAIL` (verified Resend domain), `WAITLIST_REPLY_TO`, `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET` (`/api/webhooks/resend`), `CRON_SECRET` (≥ 32 chars, authenticates `/api/cron/waitlist-email` scheduled in `vercel.json`), `WAITLIST_ENCRYPTION_KEY` (64 hex chars / 32 random bytes), `WAITLIST_RATE_LIMIT_KEY` (≥ 32 chars), and `WAITLIST_SIGNUPS_ENABLED`.

### Operational Helper Scripts

```sh
# Dry-run / apply forward SQL migrations on a target Postgres DB (never use db:push in prod):
node --env-file-if-exists=.env scripts/waitlist-migrate.mjs [--apply]

# Validate required waitlist env vars without printing secrets:
node --env-file-if-exists=.env scripts/waitlist-check.mjs

# Dry-run / commit encrypted progress-update or reopening campaigns:
node --env-file-if-exists=.env scripts/waitlist-update.ts <campaign-id> /path/to/update.json [--commit]
node --env-file-if-exists=.env scripts/waitlist-launch.ts <campaign-id> [--commit]
```

---

## 5. Health, Cron Security & Data-Retention Observability

1. **Health Endpoint (`GET /api/health`, `src/routes/api/health/+server.ts`):** Returns structured status envelope (`status`, deployment/version metadata from `VERCEL_GIT_COMMIT_SHA` or `package.json`, and DB connectivity probe) with `no-store` headers.
2. **Authenticated Cron Endpoints (`src/routes/api/cron/*`):**
   - `/api/cron/analytics-daily`, `/api/cron/analytics-weekly`, `/api/cron/send-sequence-emails`, `/api/cron/publish-scheduled` (blog), and `/api/cron/waitlist-email` require `Authorization: Bearer <CRON_SECRET>` (`verifyCronAuthorization`).
3. **Consent IP Retention Note (`src/routes/admin/consent/+page.svelte` & `analytics-daily`):** Raw consent IP anonymization after retention window runs inside `/api/cron/analytics-daily` rather than an unreachable standalone manual button so retention enforcement is automatic once daily cron runs.
