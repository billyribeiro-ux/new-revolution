type DatabaseEnvironment = Record<string, string | undefined>;

/** Hosted functions must use the durable CMS, never an empty local preview database. */
export function assertHostedDatabaseConfig(environment: DatabaseEnvironment): void {
	if (environment.VERCEL !== '1') return;
	let valid = false;
	try {
		const url = new URL(environment.DATABASE_URL ?? '');
		valid =
			['postgres:', 'postgresql:'].includes(url.protocol) &&
			Boolean(url.username && url.password && url.hostname && url.pathname.length > 1) &&
			url.hostname !== 'host' &&
			url.pathname !== '/db-name';
	} catch {
		// Deliberately omit connection strings from errors and hosted logs.
	}
	if (!valid) {
		throw new Error(
			'Hosted CMS requires a real PostgreSQL DATABASE_URL. Reconnect the existing CMS database to this Vercel environment. Local PGlite fallback is unavailable on Vercel.'
		);
	}
}
