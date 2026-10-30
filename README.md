# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
pnpm dlx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
pnpm dlx sv@1.1.1 create --template minimal --types ts --add prettier eslint vitest="usages:unit,component" playwright="demo:yes" enhanced-img sveltekit-adapter="adapter:vercel" drizzle="database:postgresql+postgresql:postgres.js+docker:no" better-auth="demo:password" mdsvex ai-tools="ide:claude-code,gemini+delivery:plugin+tools:mcp,svelte-code-writer,svelte-core-bestpractices,svelte-file-editor+mcpSetup:local" experimental="features:async,remoteFunctions" --install pnpm new-revolution-web
```

## Adding features

Add features to your project with `sv add`:

```sh
pnpm dlx sv add
```

For example, to add Tailwind CSS:

```sh
pnpm dlx sv add tailwindcss
```

## Developing

> **Note:** This project strictly enforces **`pnpm` (`pnpm@12.16.1`)** via `.npmrc` (`engine-strict=true`) and `package.json#engines`. Running `npm`, `yarn`, or `bun` is blocked.

Once you've installed dependencies with `pnpm install`, start the development server:

```sh
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev --open
```

## Typechecking, Linting & Testing

```sh
pnpm run check
pnpm run lint
pnpm run format
pnpm run test:unit --run
pnpm run test:e2e
```

## Building

To create a production version of your app:

```sh
pnpm run build
```

You can preview the production build with `pnpm run preview`.

## Key Dependency Versions

| Package            | Version    |
| :----------------- | :--------- |
| `svelte`           | `^5.57.3`  |
| `@sveltejs/kit`    | `^3.1.0`   |
| `vite`             | `^8.3.5`   |
| `typescript`       | `6.0.3`    |
| `@types/node`      | `^26.6.6`  |
| `@threlte/core`    | `^8.6.1`   |
| `@threlte/extras`  | `^9.22.4`  |
| `three`            | `^0.186.1` |
| `gsap`             | `^3.15.0`  |
| `phosphor-svelte`  | `^3.1.1`   |
| `svelte-meta-tags` | `^5.0.3`   |
| `drizzle-orm`      | `^0.45.4`  |
| `better-auth`      | `^1.7.14`  |
