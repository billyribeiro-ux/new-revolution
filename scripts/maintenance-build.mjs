import { access, mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import { dirname, join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import { demonstrationBars } from '../src/lib/maintenance/data.ts';

const sourceRoot = fileURLToPath(new URL('../', import.meta.url));
const entry = await build({
	configFile: false,
	base: '/_app/immutable/maintenance/',
	root: sourceRoot,
	publicDir: false,
	logLevel: 'warn',
	build: {
		outDir: resolve('.svelte-kit/output/client/_app/immutable/maintenance'),
		emptyOutDir: true,
		manifest: true,
		rollupOptions: {
			input: join(sourceRoot, 'src/lib/maintenance/client.ts'),
			output: { entryFileNames: 'desk-[hash].js', chunkFileNames: '[name]-[hash].js' }
		}
	}
});
if (!entry || Array.isArray(entry) || !('output' in entry))
	throw new Error('Unexpected maintenance bundle');
const clientEntry = entry.output.find((item) => item.type === 'chunk' && item.isEntry)?.fileName;
if (!clientEntry) throw new Error('Missing maintenance entry');
await mkdir('.vercel/output/static/_app/immutable', { recursive: true });
await cp(
	'.svelte-kit/output/client/_app/immutable/maintenance',
	'.vercel/output/static/_app/immutable/maintenance',
	{ recursive: true }
);

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
	// The public page must not invite submissions while the API deliberately rejects them.
	const signupsEnabled = process.env.WAITLIST_SIGNUPS_ENABLED === 'true';
	const html = template
		.replace('<!-- maintenance:introduction -->', () =>
			signupsEnabled
				? 'We’re working on the next chapter of Revolution Trading Pros. Leave your email and we’ll let you know when the platform reopens.'
				: 'We’re working on the next chapter of Revolution Trading Pros. Please check back soon. Our support desk is here if you need assistance.'
		)
		.replace(
			/<!-- maintenance:signup:start -->([\s\S]*?)<!-- maintenance:signup:end -->/,
			(_, form) => (signupsEnabled ? form : '')
		)
		.replace('<!-- maintenance:noscript -->', () =>
			signupsEnabled
				? 'The signup works without JavaScript. Refresh this page to check whether access has been restored.'
				: 'Refresh this page to check whether access has been restored.'
		)
		.replace(
			'<!-- maintenance:client -->',
			() => `<script type="module" src="/_app/immutable/maintenance/${clientEntry}"></script>`
		)
		.replace('<!-- maintenance:table -->', () =>
			demonstrationBars()
				.slice(60, 160)
				.map(
					(b) =>
						`<tr><th scope="row">${new Date(b.time * 1000).toISOString().slice(11, 16)}</th><td>${b.open.toFixed(2)}</td><td>${b.high.toFixed(2)}</td><td>${b.low.toFixed(2)}</td><td>${b.close.toFixed(2)}</td><td>${b.volume}</td></tr>`
				)
				.join('')
		)
		.replace('<!-- maintenance:theme -->', () => `<style data-maintenance-theme>${theme}</style>`)
		.replace(
			'<!-- maintenance:emblem -->',
			() =>
				`<img class="maintenance-emblem" src="data:image/png;base64,${data}" alt="" width="40" height="40" />`
		);
	if (/<!-- maintenance:/.test(html)) throw new Error('Unresolved maintenance template marker');
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
	// Only exact health, waitlist, provider-event and privacy paths escape the gate.
	// Admin, auth, unrelated APIs and other cron jobs remain unavailable.
	config.routes.unshift(
		{
			src: '^/api/(?!health/?$|waitlist/(signup|confirm|unsubscribe)/?$|cron/waitlist-email/?$|webhooks/resend/?$).*',
			dest: '/__maintenance_api'
		},
		{
			src: '^/(?!api/(health/?$|waitlist/(signup|confirm|unsubscribe)/?$|cron/waitlist-email/?$|webhooks/resend/?$)|waitlist/(confirm|unsubscribe)/?$|privacy-policy/?$|_app/immutable/).*',
			dest: '/__maintenance_page'
		}
	);
	console.log('Maintenance routes installed in Vercel build output.');
}
await writeFile(filename, `${JSON.stringify(config, null, '\t')}\n`);
