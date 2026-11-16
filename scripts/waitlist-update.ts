import { readFile, stat } from 'node:fs/promises';
import { queueUpdate } from '../src/lib/server/waitlist/service.ts';

const args = process.argv.slice(2);
const positional = args.filter((value) => !value.startsWith('--'));
if (
	positional.length !== 2 ||
	args.filter((value) => value === '--commit').length > 1 ||
	args.some((value) => value.startsWith('--') && value !== '--commit')
)
	throw new Error(
		'Usage: node --env-file-if-exists=.env scripts/waitlist-update.ts CAMPAIGN MESSAGE_FILE [--commit]'
	);
if (
	!process.env.DATABASE_URL ||
	!/^postgres(?:ql)?:/.test(process.env.DATABASE_URL) ||
	process.env.DATABASE_URL.includes('user:password@')
)
	throw new Error('Configure the intended Postgres database explicitly.');
const [campaign, file] = positional;
if ((await stat(file)).size > 16384) throw new Error('Update message file exceeds 16 KiB.');
const content: unknown = JSON.parse(await readFile(file, 'utf8'));
console.log(JSON.stringify(await queueUpdate(campaign, content, args.includes('--commit'))));
// Queue only. Delivery remains the authenticated worker's responsibility.
process.exit(0);
