// Configuration preflight only: never prints values, connects to a database, or sends mail.
const required = [
	'DATABASE_URL',
	'WAITLIST_ORIGIN',
	'WAITLIST_FROM_EMAIL',
	'WAITLIST_REPLY_TO',
	'RESEND_API_KEY',
	'RESEND_WEBHOOK_SECRET',
	'CRON_SECRET',
	'WAITLIST_ENCRYPTION_KEY',
	'WAITLIST_RATE_LIMIT_KEY'
];
const missing = required.filter((name) => !process.env[name]?.trim());
const invalid = [];
if (process.env.WAITLIST_ORIGIN) {
	try {
		const origin = new URL(process.env.WAITLIST_ORIGIN);
		if (origin.protocol !== 'https:' || origin.origin !== process.env.WAITLIST_ORIGIN)
			invalid.push('WAITLIST_ORIGIN');
	} catch {
		invalid.push('WAITLIST_ORIGIN');
	}
}
if (process.env.DATABASE_URL) {
	try {
		const url = new URL(process.env.DATABASE_URL);
		if (
			!['postgres:', 'postgresql:'].includes(url.protocol) ||
			['localhost', '127.0.0.1', 'host'].includes(url.hostname) ||
			process.env.DATABASE_URL.includes('user:password@')
		)
			invalid.push('DATABASE_URL');
	} catch {
		invalid.push('DATABASE_URL');
	}
}
if (
	process.env.WAITLIST_ENCRYPTION_KEY &&
	!/^[a-f\d]{64}$/i.test(process.env.WAITLIST_ENCRYPTION_KEY)
)
	invalid.push('WAITLIST_ENCRYPTION_KEY');
for (const name of ['WAITLIST_RATE_LIMIT_KEY', 'CRON_SECRET']) {
	if (process.env[name] && process.env[name].length < 32) invalid.push(name);
}
const configured = missing.length === 0 && invalid.length === 0;
console.log(
	JSON.stringify(
		{
			configured,
			captureEnabled: process.env.WAITLIST_SIGNUPS_ENABLED === 'true',
			missing,
			invalid,
			providerAndMailboxVerification: 'Required separately before enabling capture',
			migrations: ['0000', '0001', '0002', '0003'],
			worker: '/api/cron/waitlist-email'
		},
		null,
		2
	)
);
process.exitCode = configured ? 0 : 1;
