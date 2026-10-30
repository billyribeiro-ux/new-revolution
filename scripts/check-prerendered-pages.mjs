#!/usr/bin/env node
/**
 * Prerendered-page contract check (run with `pnpm check:pages [route ...]` AFTER `pnpm build`).
 *
 * Reads `.svelte-kit/output/prerendered/pages/**.html` (no server needed) and fails when a page:
 *   - does not have exactly one <h1>
 *   - has no `<a class="skip" href="#id">` whose target id exists on the page
 *   - has no canonical URL on https://revolutiontradingpros.com, or leaks localhost / the prerender host
 *   - has a JSON-LD FAQPage whose questions or answers are not visible in the page text (1:1 parity,
 *     AGENTS.md section 3.3)
 *   - has JSON-LD that does not parse
 * With no arguments every prerendered page is checked. Routes: `/resources` `/resources/etf-stocks-list`.
 * See docs/NEW_PAGE_PLAYBOOK.md.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('../.svelte-kit/output/prerendered/pages', import.meta.url).pathname;
const ORIGIN = 'https://revolutiontradingpros.com';

if (!existsSync(ROOT)) {
	console.error('No prerendered output. Run `pnpm build` first.');
	process.exit(2);
}

function walk(dir, out = []) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) walk(full, out);
		else if (full.endsWith('.html')) out.push(full);
	}
	return out;
}

const decode = (html) =>
	html
		.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&#39;|&apos;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/\s+/g, ' ')
		.trim();

/** Whitespace-insensitive: stripping inline tags (links, <strong>) leaves stray spaces before punctuation. */
const squash = (value) => value.replace(/\s+/g, '');

const requested = process.argv.slice(2).map((r) => r.replace(/^\/|\/$/g, '') || 'index');
const files = walk(ROOT).filter((file) => {
	if (requested.length === 0) return true;
	return requested.includes(relative(ROOT, file).replace(/\.html$/, ''));
});

if (files.length === 0) {
	console.error('No matching prerendered pages.');
	process.exit(2);
}

let failures = 0;
for (const file of files) {
	const route =
		'/' +
		relative(ROOT, file)
			.replace(/\.html$/, '')
			.replace(/^index$/, '');
	const html = readFileSync(file, 'utf8');
	const problems = [];

	const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
	if (h1s !== 1) problems.push(`expected exactly 1 <h1>, found ${h1s}`);

	const skip =
		html.match(/<a[^>]*class="skip"[^>]*href="#([^"]+)"/) ??
		html.match(/<a[^>]*href="#([^"]+)"[^>]*class="skip"/);
	if (!skip) problems.push('missing <a class="skip" href="#...">');
	else if (!html.includes(`id="${skip[1]}"`))
		problems.push(`skip link target #${skip[1]} does not exist`);

	const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
	if (!canonical || !canonical.startsWith(ORIGIN))
		problems.push(`canonical is ${canonical ?? 'missing'}`);
	for (const leak of ['localhost', 'sveltekit-prerender']) {
		if (html.includes(leak)) problems.push(`leaks "${leak}"`);
	}

	const text = squash(decode(html));
	for (const [, raw] of html.matchAll(
		/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
	)) {
		let json;
		try {
			json = JSON.parse(raw);
		} catch {
			problems.push('JSON-LD does not parse');
			continue;
		}
		for (const node of json['@graph'] ?? [json]) {
			if (node['@type'] !== 'FAQPage') continue;
			for (const q of node.mainEntity ?? []) {
				const question = squash(decode(q.name));
				const answer = squash(decode(q.acceptedAnswer?.text ?? ''));
				if (!text.includes(question))
					problems.push(`FAQ question not visible: "${question.slice(0, 60)}"`);
				if (!text.includes(answer))
					problems.push(`FAQ answer not visible: "${answer.slice(0, 60)}"`);
			}
		}
	}

	if (problems.length > 0) {
		failures++;
		console.error(`FAIL ${route}`);
		for (const p of problems) console.error(`  - ${p}`);
	} else {
		console.log(`ok   ${route}`);
	}
}

if (failures > 0) process.exit(1);
console.log(`\n${files.length} prerendered page(s) satisfy the contract.`);
