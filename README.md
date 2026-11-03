# Revolution Trading Pros

A SvelteKit application using Svelte 5, TypeScript, Vite+ and the Vercel adapter. The project already uses Vite+; it does not need to be scaffolded or migrated again.

For agent instructions and project standards, start with [`AGENTS.md`](AGENTS.md). For the installed toolchain, command semantics and upgrade procedure, read [`docs/VITE_PLUS_WORKFLOW.md`](docs/VITE_PLUS_WORKFLOW.md). New marketing routes and components also follow [`docs/NEW_PAGE_PLAYBOOK.md`](docs/NEW_PAGE_PLAYBOOK.md) and [`docs/CSS_STANDARDS.md`](docs/CSS_STANDARDS.md).

## Setup and development

The repository uses **pnpm only**, with the Node and pnpm versions declared in `package.json`. The workspace catalog and overrides live in `pnpm-workspace.yaml`.

```sh
pnpm install --frozen-lockfile
pnpm exec vp --version
pnpm exec vp toolchain
pnpm dev
# To open a browser when starting the dev server:
pnpm dev --open
```

Use the project-local Vite+ CLI through `pnpm exec vp` when calling a built-in directly. No global CLI installation is needed.

## Checks and tests

```sh
pnpm check:css
pnpm check              # SvelteKit sync and svelte-check
pnpm lint               # Oxfmt check, Oxlint, then ESLint for Svelte
pnpm test:unit --run    # Vitest server and browser-component projects
pnpm test:seo           # Playwright SEO gate
pnpm test:e2e           # Playwright install followed by configured E2E tests
```

`pnpm test` runs both the unit and E2E scripts. When browsers are already installed, `pnpm exec playwright test` runs the configured E2E tests without the install step. For an individual unit spec, use `pnpm exec vp test run path/to/file.spec.ts`.

`pnpm exec vp check` is an additional Vite+ check, not a replacement for the project gates: this configuration has Vite+ compiler diagnostics disabled and retains `svelte-check` and Svelte-specific ESLint checks separately. Report actual failures, warnings and skips; do not assume a command passed because another check did.

## Build and preview

```sh
pnpm build
pnpm check:pages
pnpm preview
```

Use `pnpm build` for the complete build: its package script runs Vite+ **and** the maintenance-output step. The bare `pnpm exec vp build` built-in does not run that additional step. See [`docs/MAINTENANCE.md`](docs/MAINTENANCE.md) for the deployment-time maintenance switch and preview limitations.

The source-of-truth versions are `package.json`, `pnpm-workspace.yaml` and `pnpm-lock.yaml`; use `pnpm exec vp toolchain` to inspect the locally selected Vite+ tools.
