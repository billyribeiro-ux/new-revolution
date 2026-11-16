# Gemini & Antigravity Workspace Configuration (`GEMINI.md`)

This file is the workspace entrypoint for Gemini / Antigravity agents. **All architectural, CSS, typography, Svelte 5 / SvelteKit 3, SEO, blog, and operational rules live in [`AGENTS.md`](AGENTS.md) (the single canonical rulebook).** Read [`AGENTS.md`](AGENTS.md) and [`docs/VITE_PLUS_WORKFLOW.md`](docs/VITE_PLUS_WORKFLOW.md) before running commands or editing files.

## Verified Environment Snapshot

- **Language & Runtime:** TypeScript `6.0.3`, Node.js `26.13.0` (`26.x` engine range; Vercel adapter `nodejs24.x`)
- **Package Manager:** `pnpm` **ONLY** (`pnpm@12.16.1` enforced by `packageManager`, `devEngines.packageManager`, `.npmrc` `engine-strict=true`, and `scripts/check-package-manager.mjs`; `npm`, `npx`, `yarn`, and `bun` are strictly blocked)
- **Branch Policy:** Sole branch `main` locally and on `origin` (coordinate active session claims in [`docs/TEMPORARY.md`](docs/TEMPORARY.md))
- **Toolchain:** Vite+ `1.6.0` (`Vite 8.3.7`, `Rolldown 1.2.18`, `Vitest 5.1.0`, `Oxfmt`, `Oxlint`) + `ESLint 10.15.0` for Svelte-specific rules (`svelte/*` and `vite-plus/prefer-vite-plus-imports`). Always run `pnpm build` (not bare `vp build`), `pnpm check`, and `pnpm lint`.
- **Core Stack:** `svelte@5.57.3` (forced Runes mode in `vite.config.ts`), `@sveltejs/kit@3.2.0` (`#lib` subpath alias, `$app/state`, typed `resolve()`), `@sveltejs/adapter-vercel@7.0.3`, `@sveltejs/enhanced-img`, `svelte-meta-tags@5.0.3`, `drizzle-orm@0.45.4`, `better-auth@1.7.25`, `@tiptap/*@3.34.0`, `d3@7.9.2`, `gsap@3.15.1`, `phosphor-svelte@3.1.1`.
- **Archived Docs Ignore Rule:** `retired/` holds archived historical `.md` files for audit provenance only. Never read `retired/` for active rules; read only the 12 canonical `.md` files mapped in [`README.md`](README.md) and [`AGENTS.md`](AGENTS.md).

---

## Mandatory Svelte MCP Server Workflow

You have access to the Svelte MCP server for official Svelte 5 and SvelteKit documentation and static code verification:

### 1. `list-sections`

Use this **FIRST** to discover all available Svelte 5 and SvelteKit documentation sections (`title`, `use_cases`, `path`) whenever working on Svelte or SvelteKit code.

### 2. `get-documentation`

After analyzing `list-sections` (especially `use_cases`), fetch **ALL** documentation sections relevant to the task before authoring or modifying `.svelte`, `.svelte.ts`, or SvelteKit route files.

### 3. `svelte-autofixer`

Analyzes Svelte code (`desired_svelte_version: "5.57.3"`) and returns issues and suggestions. You **MUST** run `svelte-autofixer` on every created or modified `.svelte` / `.svelte.ts` file and resolve findings until zero issues or suggestions remain before finishing.

### 4. `playground-link`

Generates a Svelte Playground link for standalone snippets. **NEVER** call `playground-link` when code was written to files in this project; for standalone chat-only snippets, ask the user for confirmation first.
