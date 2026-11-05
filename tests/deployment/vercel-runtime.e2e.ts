import { test, expect } from '@playwright/test';
import { execFile } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { promisify } from 'node:util';

const execute = promisify(execFile);

test('generated Vercel handler renders the SSR homepage and blog without Vite asset fallbacks', async () => {
	test.setTimeout(60_000);
	const functionDirectory = resolve('.vercel/output/functions/![-]/catchall.func');
	const config = JSON.parse(
		await readFile(resolve(functionDirectory, '.vc-config.json'), 'utf8')
	) as {
		handler: string;
	};
	const handler = resolve(functionDirectory, config.handler);
	const probe = `
		import { pathToFileURL } from 'node:url';
		const { default: handler } = await import(pathToFileURL(process.env.ADAPTER_PROBE_HANDLER).href);
		for (const pathname of ['/', '/blog']) {
			const response = await handler.fetch(new Request('https://adapter-probe.example.invalid' + pathname, {
				headers: { 'x-forwarded-for': '127.0.0.1' }
			}));
			const html = await response.text();
			console.log('ADAPTER_RESULT:' + JSON.stringify({
				pathname, status: response.status,
				deskStatus: html.includes('THE EXECUTION DOSSIER / 001') && html.includes('RISK FIRST'),
				blogHeading: html.includes('Institutional Stock &amp; Options Trading Blog')
			}));
		}
		process.exit(0);
	`;
	const { stdout, stderr } = await execute(
		process.execPath,
		['--input-type=module', '--eval', probe],
		{
			timeout: 45_000,
			maxBuffer: 2_000_000,
			env: {
				...process.env,
				NODE_ENV: 'production',
				VERCEL: '1',
				DATABASE_URL: 'memory://adapter-runtime-regression',
				ORIGIN: 'https://adapter-probe.example.invalid',
				BETTER_AUTH_SECRET: randomBytes(32).toString('hex'),
				POST_PASSWORD_SECRET: randomBytes(32).toString('hex'),
				MEDIA_STORAGE: 'disk',
				ADAPTER_PROBE_HANDLER: handler
			}
		}
	);
	const results = stdout
		.split('\n')
		.filter((line) => line.startsWith('ADAPTER_RESULT:'))
		.map(
			(line) =>
				JSON.parse(line.slice('ADAPTER_RESULT:'.length)) as {
					pathname: string;
					status: number;
					deskStatus: boolean;
					blogHeading: boolean;
				}
		);
	expect(
		results.map(({ pathname, status }) => ({ pathname, status })),
		stderr
	).toEqual([
		{ pathname: '/', status: 200 },
		{ pathname: '/blog', status: 200 }
	]);
	expect(results[0].deskStatus).toBe(true);
	expect(results[1].blogHeading).toBe(true);
	expect(stderr).not.toContain('remote_prerender_not_dynamic');
});
