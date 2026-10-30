#!/usr/bin/env node
/**
 * CSS governance check (run with `pnpm check:css`).
 *
 * Fails when a stylesheet or Svelte <style> block reads `var(--token)` without a fallback and that
 * token is never declared anywhere in src/. An undeclared custom property silently invalidates the
 * whole declaration at computed-value time (e.g. invisible text, missing borders), which is exactly
 * the defect this guard exists to prevent. It also fails on a literal 'Montserrat' / 'Sofia Sans'
 * family name: Fontsource registers only the '* Variable' families, so the bare names never match a
 * loaded face and silently fall back to system fonts. Use var(--font-display) / var(--font-sans).
 * See docs/CSS_STANDARDS.md.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('../src', import.meta.url).pathname;
const EXTENSIONS = ['.css', '.svelte', '.ts'];

function walk(dir, out = []) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) walk(full, out);
		else if (EXTENSIONS.some((ext) => full.endsWith(ext))) out.push(full);
	}
	return out;
}

const files = walk(ROOT);
const declared = new Set();
const uses = new Map();
const bareFonts = [];

for (const file of files) {
	const text = readFileSync(file, 'utf8');
	if (/(['"])(Montserrat|Sofia Sans)\1/.test(text)) bareFonts.push(relative(ROOT, file));
	for (const match of text.matchAll(/(--[\w-]+)\s*:/g)) declared.add(match[1]);
	for (const match of text.matchAll(/var\(\s*(--[\w-]+)\s*(,[^)]*)?\)/g)) {
		if (match[2]) continue; // an explicit fallback is a deliberate contract
		const list = uses.get(match[1]) ?? [];
		list.push(relative(ROOT, file));
		uses.set(match[1], list);
	}
}

if (bareFonts.length > 0) {
	console.error(
		"Unregistered font family name ('Montserrat' / 'Sofia Sans'); use var(--font-display) or var(--font-sans):"
	);
	for (const file of bareFonts) console.error(`  ${file}`);
	process.exit(1);
}

const undeclared = [...uses].filter(([token]) => !declared.has(token));

if (undeclared.length > 0) {
	console.error(
		'Undeclared CSS custom properties (declare them in src/app.css or add a fallback):'
	);
	for (const [token, where] of undeclared) {
		console.error(`  ${token} used in ${[...new Set(where)].join(', ')}`);
	}
	process.exit(1);
}

console.log(`CSS tokens OK: ${uses.size} custom properties in use, all declared.`);
