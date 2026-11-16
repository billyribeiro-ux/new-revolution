import { queueLaunch } from '../src/lib/server/waitlist/service.ts';
const args = process.argv.slice(2);
const campaign = args.find((value) => !value.startsWith('--'));
if (!campaign || args.some((value) => value.startsWith('--') && value !== '--commit'))
	throw new Error(
		'Usage: node --env-file-if-exists=.env scripts/waitlist-launch.ts CAMPAIGN [--commit]'
	);
if (
	!process.env.DATABASE_URL ||
	!/^postgres(?:ql)?:/.test(process.env.DATABASE_URL) ||
	process.env.DATABASE_URL.includes('user:password@')
)
	throw new Error('Configure the intended Postgres database explicitly.');
console.log(JSON.stringify(await queueLaunch(campaign, args.includes('--commit'))));
// postgres-js retains a pool; this operator command has finished all awaited work.
process.exit(0);
