import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

interface ManifestEntry {
	file: string;
	name?: string;
}

test('client chunks stay below the existing warning budget and public pages do not load the editor', async ({
	page
}) => {
	const manifest: Record<string, ManifestEntry> = JSON.parse(
		await readFile(resolve('.svelte-kit/output/client/.vite/manifest.json'), 'utf8')
	);
	const javascript = Object.values(manifest).filter((entry) => entry.file.endsWith('.js'));
	const editorFiles = new Set(
		javascript
			.filter((entry) => entry.name === 'editor-engine' || entry.name === 'PostEditor')
			.map((entry) => `/${entry.file}`)
	);
	expect(editorFiles.size).toBeGreaterThan(1);
	for (const file of new Set(javascript.map((entry) => entry.file))) {
		expect((await stat(resolve('.svelte-kit/output/client', file))).size, file).toBeLessThanOrEqual(
			500_000
		);
	}
	const requested = new Set<string>();
	page.on('request', (request) => requested.add(new URL(request.url()).pathname));
	for (const path of ['/', '/blog']) {
		await page.goto(path);
		await expect(page.locator('main h1')).toBeVisible();
	}
	expect([...requested].filter((file) => editorFiles.has(file))).toEqual([]);
});
