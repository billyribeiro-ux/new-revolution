import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { CONSENT_VERSION, CONSENT_TEXT } from '../../src/lib/shared/waitlist-consent.ts';

const script = resolve('scripts/maintenance-build.mjs');
const canonicalCss = await readFile('src/app.css', 'utf8');
async function build(enabled, check, signupSetting) {
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
			`${canonicalCss}\n@font-face{src:url(./font.woff2)}\n@font-face{src:url(data:font/woff2;base64,${Buffer.from('wOF2fixture').toString('base64')})}`
		);
		await writeFile(join(client, '_app/immutable/assets/font.woff2'), 'fixture');
		await writeFile(
			join(dir, '.vercel/output/config.json'),
			JSON.stringify({ version: 3, routes: [{ handle: 'filesystem' }] })
		);
		const env = { ...process.env, MAINTENANCE_MODE: enabled ? 'true' : 'false' };
		if (signupSetting === undefined) delete env.WAITLIST_SIGNUPS_ENABLED;
		else env.WAITLIST_SIGNUPS_ENABLED = signupSetting;
		execFileSync(process.execPath, [script], {
			cwd: dir,
			env
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
void test('normal deployment leaves pages available and exposes an uncached state', async () => {
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
		const css = await readFile(join(dir, '.svelte-kit/output/client/brand-ui.css'), 'utf8');
		assert.match(css, /url\("\/_app\/immutable\/assets\/font.woff2"\)/);
		assert.equal(css, await readFile(join(dir, '.vercel/output/static/brand-ui.css'), 'utf8'));
		assert.doesNotMatch(css, /data:font\/woff2/);
		const subset = css.match(/\/_app\/immutable\/assets\/brand-subset-[a-f0-9]+\.woff2/)[0];
		assert.equal(
			(await readFile(join(dir, '.svelte-kit/output/client', subset))).toString(),
			'wOF2fixture'
		);
		assert.equal(
			(await readFile(join(dir, '.vercel/output/static', subset))).toString(),
			'wOF2fixture'
		);
		assert.equal(match(routes, '/brand-ui.css').headers['cache-control'], 'no-cache');
	});
});

void test('emitted waitlist stays visible while capture activates only when explicitly enabled', async () => {
	for (const signupSetting of [undefined, 'false', '1', 'true']) {
		await build(
			true,
			async (routes, dir) => {
				const documents = [
					invoke(dir, match(routes, '/').dest).body,
					await readFile(join(dir, '.svelte-kit/output/client/maintenance/index.html'), 'utf8'),
					await readFile(join(dir, '.vercel/output/static/maintenance/index.html'), 'utf8')
				];
				for (const html of documents) {
					assert.doesNotMatch(html, /<!-- maintenance:/);
					assert.match(html, /mailto:support@revolutiontradingpros\.com/);
					assert.match(html, /id="market-chart"/);
					assert.match(html, /<img\b[^>]*width="40"[^>]*height="40"/);
					const inputs = [...html.matchAll(/<input\b[^>]*>/g)].map((match) => match[0]);
					assert.match(html, /id="waitlist-form"/);
					assert.match(html, /action="\/api\/waitlist\/signup"/);
					assert.equal(inputs.length, 4);
					assert.ok(html.includes(`value="${CONSENT_VERSION}"`));
					assert.ok(html.includes(CONSENT_TEXT));
					const ids = inputs.map((input) => {
						assert.match(input, /\bname="[^"]+"/);
						const id = input.match(/\bid="([^"]+)"/)?.[1];
						assert.ok(id, `Missing input id: ${input}`);
						return id;
					});
					assert.equal(new Set(ids).size, ids.length);
					if (signupSetting === 'true') {
						assert.match(html, /Leave your email/);
						assert.match(html, /The signup works without JavaScript/);
						assert.match(html, /data-waitlist-enabled="true"/);
						assert.doesNotMatch(html, /<fieldset\b[^>]*\bdisabled\b/);
					} else {
						assert.match(html, /data-waitlist-enabled="false"/);
						assert.match(html, /<fieldset\b[^>]*\bdisabled\b/);
						assert.match(html, /Email signup is not available yet/);
						assert.doesNotMatch(html, /Leave your email|The signup works without JavaScript/);
					}
				}
			},
			signupSetting
		);
	}
});
void test('maintenance deployment blocks pages, API, auth and nested routes before filesystem', async () => {
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
		assert.match(invoke(dir, match(routes, '/').dest).body, /A stronger trading experience/);
		assert.match(invoke(dir, match(routes, '/api/lead').dest).headers['content-type'], /json/);
		assert.equal(invoke(dir, match(routes, '/').dest, 'HEAD').body, undefined);
		assert.equal(match(routes, '/api/health'), undefined);
		assert.equal(match(routes, '/api/health/'), undefined);
		assert.equal(invoke(dir, match(routes, '/api/healthcheck').dest).status, 503);
		assert.equal(match(routes, '/_app/immutable/chunks/test.js'), undefined);
		assert.equal(match(routes, '/brand-ui.css').dest, undefined);
		assert.equal(match(routes, '/brand-ui.css').headers['cache-control'], 'no-cache');
		assert.equal(invoke(dir, match(routes, '/brand-ui.css/extra').dest).status, 503);
		assert.equal(invoke(dir, match(routes, '/_app/version.json').dest).status, 503);
	});
});

// Exceptions are exact; no namespace-wide API or document bypass is introduced.
void test('waitlist operations bypass maintenance while lookalike routes stay blocked', async () => {
	await build(true, async (routes) => {
		for (const path of [
			'/api/waitlist/signup',
			'/api/waitlist/confirm',
			'/api/waitlist/unsubscribe',
			'/waitlist/confirm',
			'/waitlist/unsubscribe',
			'/api/cron/waitlist-email',
			'/api/webhooks/resend',
			'/privacy-policy'
		]) {
			assert.equal(match(routes, path), undefined, path);
			assert.equal(match(routes, path + '/'), undefined, path + '/');
			assert.ok(match(routes, path + '/extra'), path + '/extra');
		}
		for (const path of [
			'/api/waitlist',
			'/waitlist',
			'/privacy-policy-other',
			'/api/cron/email',
			'/api/webhooks/other'
		])
			assert.ok(match(routes, path), path);
	});
});
