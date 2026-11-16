import { readFile, readdir } from 'node:fs/promises';
import postgres from 'postgres';

const args = process.argv.slice(2);
if (args.some((arg) => arg !== '--apply') || args.length > 1)
	throw new Error('Usage: node --env-file-if-exists=.env scripts/waitlist-migrate.mjs [--apply]');
const connection = process.env.DATABASE_URL;
if (!connection || !/^postgres(?:ql)?:/.test(connection) || connection.includes('user:password@'))
	throw new Error('Configure the intended Postgres DATABASE_URL explicitly.');
let target;
try {
	target = new URL(connection);
} catch {
	throw new Error('Configure a valid Postgres DATABASE_URL; connection values are not logged.');
}
const files = (await readdir('drizzle')).filter((name) => /^\d{4}_.+\.sql$/.test(name)).sort();
console.log(
	JSON.stringify({
		host: target.hostname,
		database: target.pathname.slice(1),
		migrations: files,
		apply: args.includes('--apply')
	})
);
if (args.includes('--apply')) {
	try {
		const client = postgres(connection, { max: 1 });
		try {
			await client.begin(async (transaction) => {
				for (const file of files)
					await transaction.unsafe(await readFile(`drizzle/${file}`, 'utf8'));
			});
		} finally {
			await client.end();
		}
		console.log('Forward migrations applied successfully.');
	} catch {
		console.error(
			'Migration failed. Check database access and migration compatibility; connection values are not logged.'
		);
		process.exitCode = 1;
	}
}
