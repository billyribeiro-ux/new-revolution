import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

/**
 * Verify required capabilities from the artifact, not the development node_modules.
 * @param {string} functionDirectory
 */
export async function verifyServerRuntime(functionDirectory) {
	const manifests = readdirSync(functionDirectory, { recursive: true, withFileTypes: true }).filter(
		(entry) => entry.isFile() && entry.name === 'package.json'
	);
	/** @param {string} name */
	function packageRoot(name) {
		const entry = manifests.find((entry) => entry.parentPath.endsWith(join('node_modules', name)));
		if (!entry) throw new Error(`Missing packaged dependency: ${name}`);
		return entry.parentPath;
	}
	const { default: sharp } = await import(
		pathToFileURL(join(packageRoot('sharp'), 'dist/index.mjs')).href
	);
	const png = await sharp({
		create: { width: 3, height: 2, channels: 3, background: '#abcdef' }
	})
		.png()
		.toBuffer();
	const webp = await sharp(png).resize({ width: 6 }).webp().toBuffer();
	const image = await sharp(webp).metadata();
	if (image.width !== 6 || image.height !== 4 || image.format !== 'webp') {
		throw new Error('Packaged native image transform failed.');
	}

	// Exercise the application's HTML/text SDK path entirely offline.
	const originalFetch = globalThis.fetch;
	let requests = 0;
	try {
		globalThis.fetch = async (url, options) => {
			if (String(url) !== 'https://api.resend.com/emails') {
				throw new Error('Unexpected email endpoint in offline smoke check.');
			}
			const body = JSON.parse(String(options?.body));
			if (body.react || !body.html || !body.text) {
				throw new Error('Expected the application HTML/text email path.');
			}
			requests++;
			return Response.json({ id: 'offline-package-proof' });
		};
		const { Resend } = await import(
			pathToFileURL(join(packageRoot('resend'), 'dist/index.mjs')).href
		);
		const email = await new Resend('test-only-offline-key').emails.send({
			from: 'sender@example.invalid',
			to: ['reader@example.invalid'],
			subject: 'Offline dependency proof',
			html: '<p>Concept update</p>',
			text: 'Concept update'
		});
		if (email.error || email.data?.id !== 'offline-package-proof' || requests !== 1) {
			throw new Error('Packaged HTML/text email SDK failed its offline smoke check.');
		}
	} finally {
		globalThis.fetch = originalFetch;
	}
	return {
		platform: `${process.platform}-${process.arch}`,
		width: image.width,
		height: image.height,
		format: image.format,
		emailRequests: requests,
		network: 'mocked; no email sent'
	};
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const result = await verifyServerRuntime(
		resolve(process.argv[2] ?? '.vercel/output/functions/![-]/catchall.func')
	);
	console.log(`Required server dependencies verified: ${JSON.stringify(result)}`);
}
