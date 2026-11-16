import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @param {string | undefined} userAgent */
export function requirePnpm(userAgent) {
	if (typeof userAgent !== 'string' || !userAgent.startsWith('pnpm/')) {
		throw new Error('This repository requires pnpm. Run pnpm install --frozen-lockfile.');
	}
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	requirePnpm(process.env.npm_config_user_agent);
}
