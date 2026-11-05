import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Read-only checks, except this dated report. No database or hosted writes.
const root = fileURLToPath(new URL('../../../', import.meta.url));
const base = `${root}content/articles/0dte-spx-options-strategy-guide/`;
const read = (p) => readFileSync(p, 'utf8');
const hash = (b) => createHash('sha256').update(b).digest('hex');
const post = JSON.parse(read(`${base}post.json`));
const body = read(`${base}article.html`);
assert.equal(hash(readFileSync(`${root}${post.source.file}`)), post.source.sha256);
assert(post.metaTitle.length >= 30 && post.metaTitle.length <= 33);
assert(post.metaDescription.length >= 140 && post.metaDescription.length <= 155);
assert.equal(post.status, 'draft');
assert.equal(post.publishedAt, null);
assert.equal(post.isPillar, false);
assert.equal(post.featured, true);
assert.equal(post.schemaType, 'BlogPosting');
assert.equal((body.match(/<h1\b/g) ?? []).length, 0);
assert.equal((body.match(/<h2\b/g) ?? []).length, 8);
assert.equal((body.match(/<table>/g) ?? []).length, 2);
assert.equal((body.match(/<figure\b/g) ?? []).length, 4);
assert.equal(post.faqItems.length, 5);
assert(!/<script\b|<style\b|\$\$|THINKSCRIPT_BODY|undefined|TODO/.test(body));
const bindings = [...body.matchAll(/src="asset:([a-z-]+)"/g)].map((m) => m[1]);
assert.equal(bindings.length, 4);
const manifest = JSON.parse(read(`${base}assets.json`));
const images = [];
for (const m of manifest) {
	const b = readFileSync(`${base}${m.file}`);
	const d = await sharp(b).metadata();
	assert.equal(d.format, 'webp');
	assert.equal(d.width, m.width);
	assert.equal(d.height, m.height);
	assert.equal(hash(b), m.sha256);
	assert.equal(b.length, m.bytes);
	assert(b.length < m.maxBytes);
	images.push({ key: m.key, width: d.width, height: d.height, bytes: b.length, sha256: hash(b) });
}
for (const key of bindings) assert(manifest.some((m) => m.key === key));
assert(read(`${base}assets/FONT-LICENSE.txt`).includes('SIL OPEN FONT LICENSE'));
const close = (a, b) => assert(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
// Independent settlement scenarios verify the stated extrema and roots.
const put = (s, k) => Math.max(k - s, 0);
const call = (s, k) => Math.max(s - k, 0);
const condor = (s) => (3 + put(s, 7645) - put(s, 7655) - call(s, 7745) + call(s, 7755)) * 100;
for (const [s, expected] of [
	[7600, -700],
	[7645, -700],
	[7652, 0],
	[7655, 300],
	[7700, 300],
	[7745, 300],
	[7748, 0],
	[7755, -700],
	[7800, -700]
])
	close(condor(s), expected);
const bearPut = (s) => (put(s, 7710) - put(s, 7700) - 3.2) * 100;
for (const [s, expected] of [
	[7600, 680],
	[7700, 680],
	[7706.8, 0],
	[7710, -320],
	[7800, -320]
])
	close(bearPut(s), expected);
const fly = (s) => (call(s, 7720) - 2 * call(s, 7735) + call(s, 7750) - 1.4) * 100;
for (const [s, expected] of [
	[7600, -140],
	[7720, -140],
	[7721.4, 0],
	[7735, 1360],
	[7748.6, 0],
	[7750, -140],
	[7800, -140]
])
	close(fly(s), expected);
close(0.6 * 20 + 0.4 * 37, 26.8);
close(100000 * (0.37 - 0.268), 10200);
close(700 / (700 + 300), 0.7);
close((700 + 15) / 1000, 0.715);
close(0.68 * 300 - 0.32 * 700, -20);
close(680 / 320, 2.125);
close(1360 / 140, 9.714285714285714);
close(0.014 * 45000 * 100 * 7700 ** 2 * 0.01, 37352700000);
assert.equal(750 - 500 - 150, 100);
const review = read(`${base}review.html`);
assert(!review.includes('asset:'));
const report = {
	checkedAt: new Date().toISOString(),
	sourcePreserved: true,
	titleLength: post.metaTitle.length,
	descriptionLength: post.metaDescription.length,
	bodySha256: hash(body),
	metadataSha256: hash(read(`${base}post.json`)),
	figures: 5,
	inlineFigures: 4,
	tables: 2,
	faqs: 5,
	images,
	independentSettlementScenarios: 21,
	taxAndBudgetArithmetic: true,
	ownerPublicationDecision: 'not inferred by this verifier',
	thinkorswimRuntime: 'not tested'
};
writeFileSync(
	new URL('./package-check.json', import.meta.url),
	`${JSON.stringify(report, null, 2)}\n`
);
console.log(
	JSON.stringify({ packageChecks: 'passed', images: images.length, sourcePreserved: true })
);
