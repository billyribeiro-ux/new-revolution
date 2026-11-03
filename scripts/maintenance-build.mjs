import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, posix } from 'node:path';

// Resolve assets from this build, never from hardcoded hashes or a second font import.
async function renderMaintenancePage() {
	const clientDir = '.svelte-kit/output/client';
	const manifest = JSON.parse(await readFile(`${clientDir}/.vite/manifest.json`, 'utf8'));
	const root = Object.entries(manifest).find(([, entry]) => entry.name === 'nodes/0');
	if (!root) throw new Error('Maintenance assets missing: root layout');
	const visited = new Set();
	const styles = new Set();
	function collectStyles(key) {
		if (visited.has(key)) return;
		visited.add(key);
		const entry = manifest[key];
		if (!entry) throw new Error(`Missing manifest entry: ${key}`);
		for (const imported of entry.imports ?? []) collectStyles(imported);
		for (const css of entry.css ?? []) styles.add(css);
	}
	collectStyles(root[0]);
	if (!styles.size) throw new Error('Maintenance assets missing: root stylesheet');
	let theme = '';
	for (const file of styles) {
		const css = await readFile(join(clientDir, file), 'utf8');
		// CSS is embedded to keep tokens available even if a font request fails.
		const assets = [];
		theme += css.replace(/url\(([^)]+)\)/g, (match, raw) => {
			const url = raw.trim().replace(/^['"]|['"]$/g, '');
			if (url.startsWith('data:') || url.startsWith('#')) return match;
			const path = posix.normalize(posix.join(posix.dirname(file), url));
			if (!path.startsWith('_app/immutable/')) {
				throw new Error(`Maintenance stylesheet references an unexpected asset: ${url}`);
			}
			assets.push(path);
			return `url("/${path}")`;
		});
		await Promise.all(assets.map((path) => access(join(clientDir, path))));
	}
	const template = await readFile(new URL('./templates/maintenance.html', import.meta.url), 'utf8');
	for (const match of template.matchAll(/var\((--[\w-]+)/g)) {
		if (!theme.includes(`${match[1]}:`))
			throw new Error(`Undeclared maintenance token: ${match[1]}`);
	}
	if (/<\/style/i.test(theme)) throw new Error('Unexpected closing style tag in root stylesheet');
	// The existing square emblem avoids shrinking the full horizontal wordmark
	// into an unreadable 40px image. Embed it so the brand survives network failures.
	const data = (await readFile(new URL('../static/icon-192.png', import.meta.url))).toString(
		'base64'
	);
	const html = template
		.replace('<!-- maintenance:theme -->', () => `<style data-maintenance-theme>${theme}</style>`)
		.replace(
			'<!-- maintenance:emblem -->',
			() =>
				`<img class="maintenance-emblem" src="data:image/png;base64,${data}" alt="" width="40" height="40" />`
		);
	for (const output of [
		`${clientDir}/maintenance/index.html`,
		'.vercel/output/static/maintenance/index.html'
	]) {
		await mkdir(dirname(output), { recursive: true });
		await writeFile(output, html);
	}
	return html;
}

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
const maintenanceHtml = await renderMaintenancePage();
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
	await createFunction('__maintenance_page', 503, 'text/html; charset=utf-8', maintenanceHtml);
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
