import vitePlusPlugin from 'vite-plus/oxlint-plugin';
import { svelteLintRules } from './scripts/svelte-lint-rules.mjs';
import prettier from 'eslint-config-prettier';
import path from 'node:path';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

// Run the installed Vite+ visitors per file through ESLint's shared context API.
// Oxlint retains native/type-aware rules without its raw-transfer JS-plugin arena.
const vitePlusEslintPlugin = {
	meta: vitePlusPlugin.meta,
	rules: Object.fromEntries(
		Object.entries(vitePlusPlugin.rules).map(([name, rule]) => [
			name,
			{ meta: rule.meta, create: rule.createOnce }
		])
	)
};
const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	{
		plugins: { 'vite-plus': vitePlusEslintPlugin, svelte },
		rules: { 'vite-plus/prefer-vite-plus-imports': 'error' }
	},
	{ files: ['**/*.svelte.ts', '**/*.svelte.js'], rules: svelteLintRules },
	// Non-Svelte files retain their native Oxlint rules. ESLint parses TypeScript
	// here to run the Vite+ import policy that previously ran as an Oxlint JS plugin.
	{ files: ['**/*.{ts,tsx,mts,cts}'], languageOptions: { parser: ts.parser } },
	{
		files: ['**/*.svelte'],
		extends: [
			js.configs.recommended,
			ts.configs.recommended,
			svelte.configs.recommended,
			prettier,
			svelte.configs.prettier
		],
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
			parserOptions: { projectService: true, extraFileExtensions: ['.svelte'], parser: ts.parser }
		},
		rules: {
			// TypeScript handles unresolved identifiers in Svelte scripts.
			'no-undef': 'off',
			...svelteLintRules
		}
	}
);
