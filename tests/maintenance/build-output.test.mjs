import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const script = resolve('scripts/maintenance-build.mjs');
const canonicalCss = await readFile('src/app.css', 'utf8');
async function build(enabled, check) {
	const dir = await mkdtemp(join(tmpdir(), 'maintenance-test-'));
	try {
		await mkdir(join(dir, '.vercel/output'), { recursive: true });
		const client = join(dir, '.svelte-kit/output/client');
		await mkdir(join(client, '.vite'), { recursive: true });
		await mkdir(join(client, '_app/immutable/assets'), { recursive: true });
		await writeFile(
			join(client, '.vite/manifest.json'),
			JSON.stringify({
				'root.js': { name: 'nodes/0', css: ['_app/immutable/assets/theme.css'] }
			})
		);
		await writeFile(
			join(client, '_app/immutable/assets/theme.css'),
			`${canonicalCss}\n@font-face{src:url(./font.woff2)}`
		);
		await writeFile(join(client, '_app/immutable/assets/font.woff2'), 'fixture');
		await writeFile(
			join(dir, '.vercel/output/config.json'),
			JSON.stringify({ version: 3, routes: [{ handle: 'filesystem' }] })
		);
		execFileSync(process.execPath, [script], {
			cwd: dir,
			env: { ...process.env, MAINTENANCE_MODE: enabled ? 'true' : 'false' }
		});
		const routes = JSON.parse(
			await readFile(join(dir, '.vercel/output/config.json'), 'utf8')
		).routes;
		await check(routes, dir);
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
}
function match(routes, path) {
	return routes.find((route) => route.src && new RegExp(route.src).test(path));
}
function invoke(dir, dest, method = 'GET') {
	const handler = createRequire(import.meta.url)(
		join(dir, '.vercel/output/functions', `${dest.slice(1)}.func/index.cjs`)
	);
	const result = {};
	handler(
		{ method },
		{
			writeHead(status, headers) {
				result.status = status;
				result.headers = headers;
			},
			end(body) {
				result.body = body;
			}
		}
	);
	return result;
}
test('normal deployment leaves pages available and exposes an uncached state', async () => {
	await build(false, async (routes, dir) => {
		assert.equal(match(routes, '/'), undefined);
		assert.equal(match(routes, '/blog/article'), undefined);
		const state = invoke(dir, match(routes, '/maintenance-state.json').dest);
		assert.equal(state.status, 200);
		assert.equal(state.headers['cache-control'], 'no-store, max-age=0');
		const preview = await readFile(
			join(dir, '.svelte-kit/output/client/maintenance/index.html'),
			'utf8'
		);
		assert.match(preview, /data-maintenance-theme/);
		assert.match(preview, /url\("\/_app\/immutable\/assets\/font.woff2"\)/);
		assert.match(preview, /data:image\/png;base64,/);
		assert.doesNotMatch(preview, /<!-- maintenance:/);
	});
});
test('maintenance deployment blocks pages, API, auth and nested routes before filesystem', async () => {
	await build(true, async (routes, dir) => {
		for (const path of [
			'/',
			'/blog/article',
			'/admin/login',
			'/api/auth/sign-in',
			'/api/cron/publish-scheduled',
			'/maintenance-state.json'
		]) {
			const response = invoke(dir, match(routes, path).dest);
			assert.equal(response.status, 503, path);
			assert.equal(response.headers['cache-control'], 'no-store, max-age=0');
			assert.equal(response.headers['vercel-cdn-cache-control'], 'no-store');
			assert.equal(response.headers['retry-after'], undefined);
		}
		assert.match(invoke(dir, match(routes, '/').dest).body, /Platform maintenance\./);
		assert.match(invoke(dir, match(routes, '/api/lead').dest).headers['content-type'], /json/);
		assert.equal(invoke(dir, match(routes, '/').dest, 'HEAD').body, undefined);
		assert.equal(match(routes, '/api/health'), undefined);
		assert.equal(match(routes, '/api/health/'), undefined);
		assert.equal(invoke(dir, match(routes, '/api/healthcheck').dest).status, 503);
		assert.equal(match(routes, '/_app/immutable/chunks/test.js'), undefined);
		assert.equal(invoke(dir, match(routes, '/_app/version.json').dest).status, 503);
	});
});
