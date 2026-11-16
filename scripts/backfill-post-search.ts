import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureDbReady } from '../src/lib/server/db/index.ts';
import { backfillPostSearchProjections } from '../src/lib/server/posts/search-persistence.ts';

/** Dry run unless --apply is explicit. Uses the operator's existing DATABASE_URL; never exports it. */
export function parseSearchBackfillArgs(args: string[]) {
	let dryRun = true;
	let batchSize = 100;
	let limit: number | undefined;
	for (const arg of args) {
		if (arg === '--apply') dryRun = false;
		else if (arg === '--dry-run') dryRun = true;
		else if (/^--batch-size=[1-9]\d{0,2}$/.test(arg)) {
			batchSize = Number(arg.slice('--batch-size='.length));
			if (batchSize > 500) throw new Error('batch-size must be between 1 and 500.');
		} else if (/^--limit=[1-9]\d*$/.test(arg)) {
			limit = Number(arg.slice('--limit='.length));
			if (!Number.isSafeInteger(limit)) throw new Error('limit must be a safe positive integer.');
		} else throw new Error(`Unknown or invalid argument: ${arg}`);
	}
	return { dryRun, batchSize, limit };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const options = parseSearchBackfillArgs(process.argv.slice(2));
	try {
		const result = await backfillPostSearchProjections(await ensureDbReady(), options);
		console.log(JSON.stringify(result));
		process.exit(0);
	} catch (error) {
		console.error('[search-backfill]', error instanceof Error ? error.message : 'Unknown failure');
		process.exit(1);
	}
}
