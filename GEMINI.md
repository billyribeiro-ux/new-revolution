## Project Configuration

- **Language**: TypeScript (`6.0.3`, Node `26.13.0`)
- **Package Manager**: `pnpm` ONLY (`pnpm@12.16.1` enforced via `.npmrc` `engine-strict=true` and `package.json#engines`; `npm`, `yarn`, and `bun` are strictly blocked)
- **Toolchain**: Vite+ `1.4.0` (Vite `8.3.5`, Vitest `5.0.5`, Oxfmt, Oxlint); ESLint remains required for Svelte-specific rules. The `vite` dependency is the Vite+ core alias through the pnpm catalog.
- **Add-ons**: Playwright, enhanced-img, adapter-vercel, Drizzle, Better Auth, mdsvex, ai-tools, experimental
- **Key Dependencies**: `svelte@^5.57.3`, `@sveltejs/kit@^3.1.1`, `@threlte/core@^8.7.0`, `@threlte/extras@^9.23.1`, `three@^0.187.0`, `@types/node@^26.6.6`, `gsap@^3.15.0`, `phosphor-svelte@^3.1.1`, `svelte-meta-tags@^5.0.3`, `drizzle-orm@^0.45.4`, `better-auth@^1.7.15`

Read [`AGENTS.md`](AGENTS.md) and [`docs/VITE_PLUS_WORKFLOW.md`](docs/VITE_PLUS_WORKFLOW.md) before choosing project build, test, lint, formatting or upgrade commands. Use `pnpm build`, not bare `vp build`, for the complete production build, and retain `pnpm check` and `pnpm lint` as the Svelte/type and lint gates.

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
