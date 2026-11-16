import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
	options: {
		origin: { type: 'string' },
		out: { type: 'string' },
		'cookie-file': { type: 'string' }
	}
});
assert(values.origin && values.out, 'Require --origin and --out');
const origin = new URL(values.origin).origin;
let cookie;
if (values['cookie-file']) {
	const parsed = JSON.parse(await readFile(values['cookie-file'], 'utf8'));
	cookie = (Array.isArray(parsed) ? parsed : parsed.cookies)
		.map(({ name, value }) => `${name}=${value}`)
		.join('; ');
}
const response = await fetch(`${origin}/blog`, { headers: cookie ? { cookie } : {} });
assert.equal(response.status, 200);
const body = await response.text();
const cards = [
	...body.matchAll(/<article\b[^>]*class="[^"]*\bblog-post-card\b[^"]*"[^>]*>[\s\S]*?<\/article>/g)
];
const featuredSection = /<section\b[^>]*class="[^"]*\bfeatured-section\b/.test(body);
const remainderSection = /<section\b[^>]*class="[^"]*\barticles-section\b/.test(body);
// This dated acceptance fixture is the one actual publication verified in the migration evidence.
// If the owner publishes more articles, use the general archive regressions instead of pretending
// this particular sole-lead scenario was exercised.
assert.equal(cards.length, 1, 'The dated one-publication acceptance fixture has changed');
assert(featuredSection, 'Missing featured lead');
assert(!remainderSection, 'Sole lead must not render an empty remainder section');
const report = {
	origin,
	generatedAt: new Date().toISOString(),
	status: 'passed',
	httpStatus: response.status,
	visibleCards: cards.length,
	featuredSection,
	remainderSection,
	hostedWrites: 0
};
await writeFile(values.out, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ status: report.status, report: values.out }));
