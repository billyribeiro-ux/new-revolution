import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'pnpm run build && pnpm run preview',
		port: 4173,
		env: {
			...process.env,
			POST_PASSWORD_SECRET:
				process.env.POST_PASSWORD_SECRET || 'e2e-blog-password-secret-minimum-32-chars'
		}
	},
	testMatch: '**/*.e2e.{ts,js}'
});
