# Blog System Adaptation Map (`tx-360` to `new-revolution-web`)

| `tx-360` Concept | `new-revolution-web` Equivalent / Adaptation |
|---|---|
| Framework | SvelteKit `^3.1.0` + Svelte `^5.57.3` with compiler runes enforced (`vite.config.ts`) and experimental `remoteFunctions: true` + `async: true`. |
| Database & Driver | Drizzle ORM (`drizzle-orm@^0.45.4`) with `postgres` (`postgres-js`, `drizzle-orm/postgres-js`) for production/TCP Postgres (interactive `db.transaction` supported) and `@electric-sql/pglite` (`drizzle-orm/pglite`) fallback when `DATABASE_URL` is the placeholder `postgres://user:password@host:port/db-name` or in hermetic test suites. |
| Authentication & Admin Guard | `better-auth@^1.7.14` (`src/lib/server/auth.ts`, `src/lib/server/db/auth.schema.ts`, `src/hooks.server.ts`). `user.id` is `text` PK; added `role` (`'user' \| 'admin'`) to `user` table and `requireAdmin(event)` guard in `src/lib/server/auth-guard.ts`. `revisions.user_id` and `audit_log.actor_user_id` reference `user.id` (`text`, `ON DELETE SET NULL`). |
| Validation | `zod@^4.6.7` in `src/lib/shared/schemas/` (Standard Schema compatible with SvelteKit 3 remote functions and server routes). |
| Rich Text Editor | TipTap `^3.32.1` (`@tiptap/core`, `@tiptap/starter-kit`, etc.) + custom extensions in `src/lib/tiptap/`. |
| HTML Sanitizer | `sanitize-html@^2.18.1` centralized in `src/lib/sanitize-post-html.ts`. |
| Image Pipeline & Storage | `sharp@^0.35.5` + `@vercel/blob@^2.8.2` (with local filesystem/data-URL fallback in dev/test when `BLOB_READ_WRITE_TOKEN` is unset). |
| Code Highlighting | `shiki@^4.5.0` (`github-dark` theme) in `src/lib/server/posts/highlight.ts` with promise reset on initialization failure. |
| Typography & Fonts | Per `AGENTS.md` Section 1, zero external Google Fonts requests are permitted. Uses self-hosted `@fontsource-variable/montserrat` (`'Montserrat Variable'`) and `@fontsource-variable/sofia-sans` (`'Sofia Sans Variable'`) plus local/system stacks across the 24 editor font options. |
| Styling & Design Tokens | Native CSS cascade layers (`@layer reset, tokens, base, typography, layout, components, utilities, responsive;`) in `src/app.css`, shared `.prose-base` in `src/lib/styles/prose.css`, validated by `pnpm check:css` (`scripts/check-css-tokens.mjs`). |
| Public Blog Routes | Dynamic DB-backed blog lives at `/blog`, `/blog/[slug]`, `/blog/category/[slug]`, `/blog/tag/[slug]`, `/blog/+error.svelte`, `/rss.xml`, and `/sitemap.xml`. The existing static marketing hub at `/blogs` (`src/routes/blogs/+page.svelte`) is preserved so existing unit and E2E tests (`src/routes/blogs/page.svelte.spec.ts`, `src/routes/page.svelte.e2e.ts`) continue to pass without modification. |
| Icons | `phosphor-svelte@^3.1.1` per-icon imports. |
| Testing | Vitest `5.0.5` (`server` node project + `client` browser playwright project) and Playwright `^1.64.1` (`*.e2e.ts`). |
