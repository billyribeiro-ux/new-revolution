import { mkdir, readFile, writeFile } from 'node:fs/promises';

// Run after adapter-vercel and add small, independent Build Output API functions.
const filename = '.vercel/output/config.json';
const config = JSON.parse(await readFile(filename, 'utf8'));
if (config.version !== 3 || !Array.isArray(config.routes)) {
	throw new Error('Unexpected Vercel Build Output API configuration');
}
const noStore = {
	'cache-control': 'no-store, max-age=0',
	'cdn-cache-control': 'no-store',
	'vercel-cdn-cache-control': 'no-store',
	'x-content-type-options': 'nosniff'
};
async function createFunction(name, status, contentType, body) {
	const dir = `.vercel/output/functions/${name}.func`;
	await mkdir(dir, { recursive: true });
	await writeFile(
		`${dir}/.vc-config.json`,
		JSON.stringify({ runtime: 'nodejs24.x', handler: 'index.cjs' })
	);
	const headers = { ...noStore, 'content-type': contentType };
	if (status === 503) headers['x-robots-tag'] = 'noindex, nofollow';
	const code = `module.exports = (req, res) => {\n  res.writeHead(${status}, ${JSON.stringify(headers)});\n  res.end(req.method === 'HEAD' ? undefined : ${JSON.stringify(body)});\n};\n`;
	await writeFile(`${dir}/index.cjs`, code);
}
await createFunction(
	'__maintenance_state',
	200,
	'application/json; charset=utf-8',
	'{"maintenance":false}'
);
// The marker must be dynamic: Vercel's static handler can replace cache headers.
config.routes.unshift({ src: '^/maintenance-state\\.json$', dest: '/__maintenance_state' });
if (process.env.MAINTENANCE_MODE === 'true') {
	const html = await readFile(new URL('../static/maintenance/index.html', import.meta.url), 'utf8');
	await createFunction('__maintenance_page', 503, 'text/html; charset=utf-8', html);
	await createFunction(
		'__maintenance_api',
		503,
		'application/json; charset=utf-8',
		'{"error":"Service temporarily unavailable for maintenance"}'
	);
	// The health probe and immutable application assets remain available. All other
	// paths, including auth, cron, webhooks and admin, are unavailable during the window.
	config.routes.unshift(
		{ src: '^/api/(?!health/?$).*', dest: '/__maintenance_api' },
		{ src: '^/(?!api/health/?$|_app/immutable/).*', dest: '/__maintenance_page' }
	);
	console.log('Maintenance routes installed in Vercel build output.');
}
await writeFile(filename, `${JSON.stringify(config, null, '\t')}\n`);
