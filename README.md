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

Once you've created a project and installed dependencies with `pnpm install`, start a development server:

```sh
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev --open
```

## Building

To create a production version of your app:

```sh
pnpm run build
```

You can preview the production build with `pnpm run preview`.
