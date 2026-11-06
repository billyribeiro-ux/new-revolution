import { defineConfig } from '@playwright/test';

const previewPort = Number(process.env.PLAYWRIGHT_PORT ?? 4173);
if (!Number.isInteger(previewPort) || previewPort < 1 || previewPort > 65535) {
	throw new Error('PLAYWRIGHT_PORT must be an integer between 1 and 65535.');
}

export default defineConfig({
	use: { baseURL: `http://localhost:${previewPort}` },
	webServer: {
		command: `pnpm run build && pnpm run preview --port ${previewPort}`,
		port: previewPort,
		env: {
			...process.env,
			// The preview origin: media URLs are absolute (<ORIGIN>/media/...), so ORIGIN must match it.
			ORIGIN: `http://localhost:${previewPort}`,
			BETTER_AUTH_SECRET:
				process.env.BETTER_AUTH_SECRET || 'dev-only-better-auth-secret-32-chars-minimum',
			DATABASE_URL: process.env.DATABASE_URL || 'memory://e2e',
			// vite preview runs with NODE_ENV=production, where the media driver has no implicit disk fallback.
			MEDIA_STORAGE: 'disk',
			POST_PASSWORD_SECRET:
				process.env.POST_PASSWORD_SECRET || 'e2e-blog-password-secret-minimum-32-chars'
		}
	},
	testMatch: ['**/*.e2e.{ts,js}', 'tests/seo/seo-standard.spec.ts']
});
