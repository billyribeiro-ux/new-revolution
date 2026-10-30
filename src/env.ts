import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	DATABASE_URL: {
		description: 'The database connection string.',
		schema: (value) => value || 'postgres://user:password@localhost:5432/db-name'
	},
	ORIGIN: {
		description: 'The app origin (base URL), e.g. `http://localhost:5173`.',
		schema: (value) => value || 'http://localhost:5173'
	},
	BETTER_AUTH_SECRET: {
		description:
			'Secret used to sign tokens. For production use 32 characters generated with high entropy. See [Better Auth installation](https://www.better-auth.com/docs/installation).',
		schema: (value) => value || 'dev-only-better-auth-secret-32-chars-minimum'
	}
});
