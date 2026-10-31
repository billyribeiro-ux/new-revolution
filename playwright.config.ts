import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'pnpm run build && pnpm run preview',
		port: 4173,
		env: {
			...process.env,
			// The preview origin: media URLs are absolute (<ORIGIN>/media/...), so ORIGIN must match it.
			ORIGIN: 'http://localhost:4173',
			BETTER_AUTH_SECRET:
				process.env.BETTER_AUTH_SECRET || 'dev-only-better-auth-secret-32-chars-minimum',
			DATABASE_URL: process.env.DATABASE_URL || 'postgres://user:password@host:port/db-name',
			// vite preview runs with NODE_ENV=production, where the media driver has no implicit disk fallback.
			MEDIA_STORAGE: 'disk',
			POST_PASSWORD_SECRET:
				process.env.POST_PASSWORD_SECRET || 'e2e-blog-password-secret-minimum-32-chars'
		}
	},
	testMatch: '**/*.e2e.{ts,js}'
});
