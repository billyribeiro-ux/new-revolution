import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

/** Exercise the real build switch while serving the same compiled assets as the preview. */
export async function buildEnabledMaintenancePage(): Promise<string> {
	const directory = await mkdtemp(join(tmpdir(), 'maintenance-enabled-'));
	try {
		await cp('.svelte-kit/output/client', join(directory, '.svelte-kit/output/client'), {
			recursive: true
		});
		await mkdir(join(directory, '.vercel/output'), { recursive: true });
		await writeFile(
			join(directory, '.vercel/output/config.json'),
			JSON.stringify({ version: 3, routes: [{ handle: 'filesystem' }] })
		);
		execFileSync(process.execPath, [resolve('scripts/maintenance-build.mjs')], {
			cwd: directory,
			env: { ...process.env, WAITLIST_SIGNUPS_ENABLED: 'true' },
			stdio: 'pipe'
		});
		return await readFile(
			join(directory, '.svelte-kit/output/client/maintenance/index.html'),
			'utf8'
		);
	} finally {
		await rm(directory, { recursive: true, force: true });
	}
}
