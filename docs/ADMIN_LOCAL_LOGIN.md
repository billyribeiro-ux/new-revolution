# Local admin login (temporary seed account)

**TEMPORARY.** This account exists only for local testing. It is registered as **T2** in
[`TEMPORARY.md`](TEMPORARY.md). Do not deploy it, and do not reuse its credentials anywhere else.

Status: the seed script is implemented on branch `feat/admin-auth` (Phase P3 of
[`ADMIN_AUTH_PLAN.md`](ADMIN_AUTH_PLAN.md)). The `/admin/login` page is being built in the same branch (Phase P2). This
document does not describe its UI; check the page itself once it lands.

## 1. Set up the credentials

1. Copy the example env file: `cp .env.example .env`
2. Open `.env` and set both seed variables. Choose your own values; the example values are placeholders.
   - `ADMIN_SEED_EMAIL`: the email you will sign in with.
   - `ADMIN_SEED_PASSWORD`: at least 12 characters.
3. `.env` is git-ignored. Do not paste the password into any tracked file, issue, or chat.

## 2. Create the account

```bash
pnpm install
pnpm db:seed-admin
```

Real output from a first run against the local PGlite database (throwaway values, final P3 code). A second run reports `action=unchanged`:

```
Database: PGlite (local file) /private/tmp/wt-auth/.svelte-kit/pglite-blog
Account created: role=admin, email verified.
email=seed-check@example.test id=R87pH1nLJh6YviCBHEgwxuETczSMP4i9 role=admin action=created
```

The script prints the email, user id, role, and database location. It never prints the password or a hash.

What the script does:

- Creates the account through Better Auth's sign-up API, then sets `role = 'admin'` and `email_verified = true`.
- Is idempotent: running it again on an existing account only repairs role and verification and changes nothing else.
- Uses the local PGlite file `.svelte-kit/pglite-blog` when `DATABASE_URL` is unset or a placeholder. This is the same
  database `pnpm dev` uses. Stop `pnpm dev` before running the script (not verified here: PGlite is a single-process
  database, so a second process may fail to open it).
- Applies the same forward-only SQL migration the app runs on boot before writing.

## 3. Run the app and sign in

```bash
pnpm dev
```

Open `http://localhost:5173/admin/login` and sign in with `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD`.

## 4. Other options

| Command                               | Effect                                                                                          |
| ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `pnpm db:seed-admin`                  | Create the account, or repair role and verification of an existing one.                         |
| `pnpm db:seed-admin --reset-password` | Also overwrite the stored password with `ADMIN_SEED_PASSWORD`. Without it the password is kept. |
| `pnpm db:seed-admin --revoke`         | Delete the account. Its sessions and account rows are removed by `ON DELETE CASCADE`.           |

Change the password: set the new `ADMIN_SEED_PASSWORD`, then run `pnpm db:seed-admin --reset-password`.

## 5. Revoke the account

```bash
pnpm db:seed-admin --revoke
```

Running it again reports `No account for ...; nothing to revoke.` (verified in the P3 run).

## 6. Refusals

The script exits non-zero and prints the reason when:

- `ADMIN_SEED_EMAIL` or `ADMIN_SEED_PASSWORD` is missing, the email is invalid, or the password is shorter than 12 characters.
- `NODE_ENV=production` or `VERCEL` is set and the database is not the local PGlite file. It refuses before opening any
  connection. The seed never runs against a real database in production.

Because of the refusal, `--revoke` cannot be used against a production database. For a remote database, delete the
account with SQL instead (not verified against a real database; check the table and email first):

```sql
DELETE FROM "user" WHERE email = 'the-seed-email@example.com';
```

## 7. Pre-production checklist (T2 removal)

Before the first real deploy, every item below must be done. Each is tracked in [`TEMPORARY.md`](TEMPORARY.md).

- [ ] Delete the seed account in the production database (SQL above, or the production admin tooling once it exists).
- [ ] Set `emailAndPassword.disableSignUp: true` for production (Phase P5). **Caveat:** the seed script builds its own
      Better Auth instance from `src/lib/server/auth-options.ts`. If `disableSignUp` is added to the shared fragment, the
      seed may stop being able to create accounts (not verified; check before P5). Keep any production-only setting out of
      the shared fragment, or give the seed its own path.
- [ ] Create the real admin account by a production-safe method.
- [ ] Rotate `BETTER_AUTH_SECRET` to a generated 32+ character value (T7). Never reuse the `.env.example` value.
- [ ] Remove `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` from every production environment.
- [ ] Confirm T1 (header bypass) is `removed` and T2 is `removed` in `TEMPORARY.md`.
