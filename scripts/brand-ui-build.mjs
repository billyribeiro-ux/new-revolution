import { createHash } from 'node:crypto';
import { access, readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, posix } from 'node:path';

/** Use this build's root stylesheet, including its only Fontsource imports. */
export async function collectRootTheme(clientDir) {
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
		const embeddedFonts = new Map();
		theme += css.replace(/url\(([^)]+)\)/g, (match, raw) => {
			const url = raw.trim().replace(/^['"]|['"]$/g, '');
			// Small Fontsource subsets may be inlined by Vite. Give standalone
			// documents self-hosted files instead of widening their font CSP to data:.
			if (url.startsWith('data:font/woff2;base64,')) {
				const bytes = Buffer.from(url.slice('data:font/woff2;base64,'.length), 'base64');
				if (bytes.toString('ascii', 0, 4) !== 'wOF2') throw new Error('Invalid bundled WOFF2');
				const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 20);
				const path = `_app/immutable/assets/brand-subset-${hash}.woff2`;
				embeddedFonts.set(path, bytes);
				assets.push(path);
				return `url("/${path}")`;
			}
			if (url.startsWith('data:') || url.startsWith('#')) return match;
			const path = posix.normalize(posix.join(posix.dirname(file), url));
			if (!path.startsWith('_app/immutable/')) {
				throw new Error(`Maintenance stylesheet references an unexpected asset: ${url}`);
			}
			assets.push(path);
			return `url("/${path}")`;
		});
		for (const [path, bytes] of embeddedFonts) {
			for (const directory of [clientDir, '.vercel/output/static']) {
				await mkdir(join(directory, posix.dirname(path)), { recursive: true });
				await writeFile(join(directory, path), bytes);
			}
		}
		await Promise.all(assets.map((path) => access(join(clientDir, path))));
	}
	return theme;
}

export async function writeBrandUiCss(clientDir, theme) {
	for (const dir of [clientDir, '.vercel/output/static']) {
		await mkdir(dir, { recursive: true });
		await writeFile(join(dir, 'brand-ui.css'), theme);
	}
}
