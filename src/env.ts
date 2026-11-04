import { defineEnvVars } from '@sveltejs/kit/env';

const optional = (value: string | undefined) => value;

export const variables = defineEnvVars({
	DATABASE_URL: {
		description: 'The database connection string.',
		schema: (value) => value || 'postgres://user:password@localhost:5432/db-name'
	},
	DIRECT_URL: { schema: optional },
	NEON_HTTP_FETCH_ENDPOINT: { schema: optional },
	ORIGIN: {
		description: 'The app origin (base URL), e.g. `http://localhost:5173`.',
		schema: (value) => value || 'http://localhost:5173'
	},
	BETTER_AUTH_SECRET: {
		description:
			'Secret used to sign tokens. For production use 32 characters generated with high entropy. See [Better Auth installation](https://www.better-auth.com/docs/installation).',
		schema: (value) => value || 'dev-only-better-auth-secret-32-chars-minimum'
	},
	BLOB_READ_WRITE_TOKEN: {
		description:
			'Vercel Blob read/write token for media uploads. Optional in development (local disk is used); required in production unless MEDIA_STORAGE=disk. See docs/MEDIA_STORAGE.md.',
		schema: (value) => value || ''
	},
	MEDIA_STORAGE: {
		description:
			'Optional media storage override: `blob` or `disk`. Unset = Blob if the token is set, else local disk in development. See docs/MEDIA_STORAGE.md.',
		schema: (value) => value || ''
	},

	// ── Auth and crypto ───────────────────────────────────────────────────
	AUTH_SECRET: { schema: optional },
	SESSION_SECRET: { schema: optional },
	INTEGRATION_ENCRYPTION_KEY: { schema: optional },
	POST_PASSWORD_COOKIE_SECRET: { schema: optional },
	UNSUBSCRIBE_SECRET: { schema: optional },
	ADMIN_PASSWORD: { schema: optional },

	// ── Webhooks and cron ─────────────────────────────────────────────────
	CALENDLY_WEBHOOK_SIGNING_KEY: { schema: optional },
	RESEND_WEBHOOK_SECRET: { schema: optional },
	CRON_SECRET: { schema: optional },

	WAITLIST_SIGNUPS_ENABLED: { schema: optional },
	WAITLIST_ORIGIN: { schema: optional },
	WAITLIST_FROM_EMAIL: { schema: optional },
	WAITLIST_REPLY_TO: { schema: optional },
	WAITLIST_ENCRYPTION_KEY: { schema: optional },
	WAITLIST_PREVIOUS_ENCRYPTION_KEY: { schema: optional },
	WAITLIST_RATE_LIMIT_KEY: { schema: optional },
	WAITLIST_TEST_RECIPIENTS: { schema: optional },
	// ── Email ─────────────────────────────────────────────────────────────
	RESEND_API_KEY: { schema: optional },
	LEAD_FROM_EMAIL: { schema: optional },
	LEAD_FROM_NAME: { schema: optional },
	LEAD_NOTIFY_EMAIL: { schema: optional },
	ADMIN_FROM_EMAIL: { schema: optional },
	ADMIN_FROM_NAME: { schema: optional },

	// ── Analytics ─────────────────────────────────────────────────────────
	ANALYTICS_FINGERPRINT_SALT: {
		schema: (value) => value || 'dev-revolution-analytics-salt-32-chars'
	},

	// ── SEO integrations ──────────────────────────────────────────────────
	GSC_SERVICE_ACCOUNT_JSON: { schema: optional },
	GSC_SITE_URL: { schema: optional },
	INDEXNOW_API_KEY: { schema: optional },

	// ── Platform / runtime ────────────────────────────────────────────────
	LOG_LEVEL: { schema: optional },
	VERCEL_URL: { schema: optional },
	VERCEL_PROJECT_PRODUCTION_URL: { schema: optional },
	VERCEL_GIT_COMMIT_SHA: { schema: optional },

	// ── Public ────────────────────────────────────────────────────────────
	PUBLIC_APP_NAME: { public: true, schema: optional },
	PUBLIC_APP_URL: { public: true, schema: optional },
	PUBLIC_BING_SITE_VERIFICATION: { public: true, schema: optional },
	PUBLIC_CALENDLY_URL: { public: true, schema: optional },
	PUBLIC_CONTACT_EMAIL: { public: true, schema: optional },
	PUBLIC_CONTACT_PHONE: { public: true, schema: optional },
	PUBLIC_LINKEDIN_URL: { public: true, schema: optional },
	PUBLIC_TWITTER_URL: { public: true, schema: optional },
	PUBLIC_GA4_MEASUREMENT_ID: { public: true, schema: optional },
	PUBLIC_GOOGLE_SITE_VERIFICATION: { public: true, schema: optional },
	PUBLIC_GOOGLE_TAG_ID: { public: true, schema: optional },
	PUBLIC_GTM_CONTAINER_ID: { public: true, schema: optional }
});
