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

## 8. Publishing checklist

Publishing runs the SEO gate on the server (`enforcePublishSeoGate`, `src/lib/shared/seo/score.ts`). When it refuses,
`/admin/posts/<id>` shows the reasons in a red alert at the top of the editor and opens the SEO panel. The gate applies
when a post is created as published or scheduled, when an update moves a post to published, and on any save that sets
it to scheduled. A post that is already live is not re-checked on edit. Scores come from the same function as the
panel, so a fix is visible in the "SEO n/100" pill before you click Publish.

A post can be published when the score is **80 or more** and **none** of these blocking items is present:

| Needed                      | Blocks when missing or wrong                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| Meta title                  | empty, or starts with a lowercase letter                                                        |
| Meta description            | empty                                                                                           |
| Cover image, or an OG image | neither is set                                                                                  |
| Cover alt text              | cover set but alt blank, or alt equal to the post title                                         |
| Author                      | none selected (sidebar "Author" panel)                                                          |
| Category                    | none selected (sidebar "Categories" panel)                                                      |
| Tags                        | none (one tag is a warning only)                                                                |
| Body length                 | fewer than 300 words (300 to 599 is a warning)                                                  |
| External links              | fewer than 2 distinct external domains (1 is an error that lowers the score)                    |
| No placeholder              | the text `IMAGE PLACEHOLDER` is still in the body                                               |
| No dashes                   | any em dash or en dash in title, body, meta, excerpt, cover alt or caption, OG, Twitter, or FAQ |

Warnings lower the score without blocking: meta title under 30 or over 60 characters; meta description under 70 or over
155; no excerpt; focus keyword missing from the meta title, meta description, slug or body; no focus keyword (an error,
-8); no FAQ, or 1 or 2 FAQ items, or answers under 40 characters; a body heading equal to the title; slug over 70
characters or with 3 or more stop words; body images without width and height.

Notes:

- On save, the server fills blank meta title, meta description, excerpt, and OG fields from the content before it
  gates. The editor's SEO panel scores what is typed, so it can show one extra blocking item (for example "Missing meta
  title") that the server would fill. Type the field yourself to see the real count.
- Restoring a published post from Trash makes it published again without a gate check (it was live before it was
  trashed). Restore keeps the stored status.

## 9. Adding images (inline and featured)

**Inline image.** Click in the body where the image should go, then use the toolbar **Image** button (or type `/image`).
The media library opens: pick a file (or **Upload Files** first), choose the size and alignment, and **Insert Into Post**.
Uploads, drag and drop onto the editor, and pasting an image also work; those insert the original at 100% width, centred.

**Image controls.** Click an image to select it; a floating toolbar appears over it:

- **Left / Center / Right / Full width / No align**: Full width fills the article column, the same on the public post.
- **25% / 50% / 75% / 100%**: width presets; height follows the aspect ratio. 100% restores the natural size.
- **Alt / Add alt text**: alt text, title (hover tooltip) and visible caption. Save with Enter or **Save**, Escape cancels.
- **Replace**: opens the same media library; the new file keeps the alt, title, alignment, caption and link.
- **Remove**: deletes the image from the body (the media file stays in the library).

Keyboard: Tab from the editor into the toolbar, Escape returns to the editor. On touch screens tapping an image selects it
and the buttons are larger.

**Alt text is never filled in for you.** An image with empty alt shows a red dashed outline and an **Add alt text** chip in
the editor (the chip is not saved). Click it to open the alt field. The media item's own alt (set in the library) is used
when it has one; the media title is not used as a stand-in.

**Featured image.** Sidebar **Featured Image**: **Choose from Media Library** fills the URL, the alt and the caption from the
item. The `large` (1200w) variant is used unless you picked another size in the library (an original narrower than 1200 px
is used as is). The preview shows the saved URL and the real dimensions; **Alt Text** is required to publish (it must also
differ from the post title). **Remove** clears the URL, alt and caption. The server stores the cover's width and height
from the media library on save; the public post uses them for `width`/`height` and builds the `srcset` from the files that
exist.

**Check it.** Save Draft, reload the editor (image, alt and the featured panel must still be there), publish following
section 8, then open `/blog/<slug>`: the cover `<img>` carries `width`, `height`, `srcset`, `alt`, `loading="eager"` and
`fetchpriority="high"`, and `og:image` plus the JSON-LD `image` point at the cover.

## 10. Running the admin e2e (image flow)

`src/routes/admin/image-flow.e2e.ts` (and the admin tests in `blog-system.e2e.ts`) sign in through the real login page and are
skipped with a reason when `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` are absent. They need the seeded local admin (section 2) in the
local PGlite. Without echoing the values:

```bash
(set -a; . ./.env; set +a; \
  E2E_ADMIN_EMAIL=$ADMIN_SEED_EMAIL E2E_ADMIN_PASSWORD=$ADMIN_SEED_PASSWORD \
  pnpm exec playwright test src/routes/admin/image-flow.e2e.ts)
```

The config builds, then previews on 4173 with `ORIGIN=http://localhost:4173` and `MEDIA_STORAGE=disk` (docs/MEDIA_STORAGE.md); stop any
other process holding 4173 or the PGlite directory first. The spec logs in once (login is limited to 10 per email per 15 minutes) and
removes the post, tag and media it creates.
