import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { verifyServerRuntime } from './verify-server-runtime.mjs';
import { describe, expect, it } from 'vite-plus/test';
import { ESLint } from 'eslint';
import { requirePnpm } from './check-package-manager.mjs';
import { svelteLintRules } from './svelte-lint-rules.mjs';

describe('package manager enforcement without runtime ambiguity', () => {
	it('accepts pnpm and rejects other or missing installer agents', () => {
		expect(() => requirePnpm('pnpm/12.16.1 node/v26.13.0 darwin arm64')).not.toThrow();
		for (const agent of ['npm/11.0.0', 'yarn/4.0.0', 'bun/1.4.0', undefined]) {
			expect(() => requirePnpm(agent)).toThrow('requires pnpm');
		}
	});
});

describe('ESLint coverage after moving JavaScript plugins out of Oxlint', () => {
	it('keeps all 37 explicit Svelte rules and their original severities', async () => {
		const eslint = new ESLint();
		const config = await eslint.calculateConfigForFile('src/lib/components/layout/Navbar.svelte');
		expect(Object.keys(svelteLintRules)).toHaveLength(37);
		for (const [name, severity] of Object.entries(svelteLintRules)) {
			expect(config.rules[name][0], name).toBe(severity === 'error' ? 2 : 1);
		}
	});

	it('continues to detect missing Svelte each-block keys', async () => {
		const eslint = new ESLint();
		const [result] = await eslint.lintText(
			'<script>let items = $state([1]);</script>{#each items as item}<p>{item}</p>{/each}',
			{ filePath: 'src/lib/components/layout/Navbar.svelte' }
		);
		expect(result.messages.some((message) => message.ruleId === 'svelte/require-each-key')).toBe(
			true
		);
	});

	it('reports the same Vite+ import policy for imports, exports and dynamic imports', async () => {
		const eslint = new ESLint();
		const [result] = await eslint.lintText(
			"import { describe } from 'vitest'; export { expect } from 'vitest'; void import('vitest'); describe('example', () => {});",
			{ filePath: 'scripts/tooling-policy-fixture.ts' }
		);
		expect(
			result.messages.filter((message) => message.ruleId === 'vite-plus/prefer-vite-plus-imports')
		).toHaveLength(3);
	});
});

describe('required server artifact dependencies', () => {
	it('fails the build check when native image processing is absent from the package', async () => {
		const directory = mkdtempSync(join(tmpdir(), 'rtp-required-dependencies-'));
		try {
			await expect(verifyServerRuntime(directory)).rejects.toThrow(
				'Missing packaged dependency: sharp'
			);
		} finally {
			rmSync(directory, { recursive: true, force: true });
		}
	});
});
