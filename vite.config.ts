import { mdsvex } from 'mdsvex';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';

/**
 * Sections of the site that are linked from the navigation/footer but not built yet.
 * A 404 for these paths must not fail the build; any other broken link still does.
 */
const PLANNED_ROUTE_PATTERN =
	/^\/(live-trading-rooms|alert-services|store|resources|blogs|memberships|login|signup|register|contact|privacy-policy|terms-of-service)(\/|$)/;

export default defineConfig({
	plugins: [
		enhancedImages(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
				experimental: { async: true }
			},
			adapter: adapter({ runtime: 'nodejs24.x' }),
			prerender: {
				handleHttpError: ({ status, path, referrer, message }) => {
					if (status === 404 && PLANNED_ROUTE_PATTERN.test(path)) {
						console.warn(
							`[prerender] planned route not built yet: ${path} (linked from ${referrer})`
						);
						return;
					}
					throw new Error(message);
				}
			},
			preprocess: [mdsvex({ extensions: ['.svx', '.md'] })],
			extensions: ['.svelte', '.svx', '.md'],
			experimental: { remoteFunctions: true }
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				optimizeDeps: {
					include: ['@tiptap/pm/model']
				},
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}', 'scripts/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
