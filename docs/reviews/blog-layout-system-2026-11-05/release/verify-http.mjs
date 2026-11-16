import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
	options: {
		origin: { type: 'string' },
		sha: { type: 'string' },
		out: { type: 'string' },
		'cookie-file': { type: 'string' }
	}
});
assert(values.origin && values.sha && values.out, 'Require --origin, --sha and --out');
const origin = new URL(values.origin).origin;
const canonicalOrigin = 'https://www.revolutiontradingpros.com';
let cookies = [];
if (values['cookie-file']) {
	const parsed = JSON.parse(await readFile(values['cookie-file'], 'utf8'));
	cookies = Array.isArray(parsed) ? parsed : parsed.cookies;
	assert(Array.isArray(cookies));
}
const cookie = cookies.map(({ name, value }) => `${name}=${value}`).join('; ');
const redact = (message) =>
	cookies.reduce((text, item) => text.replaceAll(item.value, '[redacted]'), String(message));
const inventory = await readFile(new URL('../../../../urls.md', import.meta.url), 'utf8');
const eligibleSection = inventory
	.split('## Public pages eligible for indexing (19)')[1]
	.split('## Public pages marked noindex (33)')[0];
const excludedSection = inventory
	.split('## Public pages marked noindex (33)')[1]
	.split('## Evidence and scope')[0];
const urlsIn = (text) =>
	[...text.matchAll(/^- (https:\/\/www\.revolutiontradingpros\.com[^\s]*)/gm)].map(
		(match) => match[1]
	);
const eligible = urlsIn(eligibleSection),
	excluded = urlsIn(excludedSection);
assert.equal(eligible.length, 19);
assert.equal(excluded.length, 33);
const report = {
	origin,
	expectedSha: values.sha,
	generatedAt: new Date().toISOString(),
	protectedStage: Boolean(cookie),
	checks: []
};
const data = new Map();
async function get(path) {
	if (data.has(path)) return data.get(path);
	const response = await fetch(`${origin}${path}`, {
		redirect: 'manual',
		headers: cookie ? { cookie } : {}
	});
	const body = await response.text();
	const record = {
		status: response.status,
		contentType: response.headers.get('content-type'),
		cacheControl: response.headers.get('cache-control'),
		xRobotsTag: response.headers.get('x-robots-tag'),
		location: response.headers.get('location'),
		body
	};
	data.set(path, record);
	return record;
}
async function check(name, action) {
	try {
		report.checks.push({ name, status: 'passed', evidence: await action() });
	} catch (error) {
		report.checks.push({ name, status: 'failed', error: redact(error.message) });
	}
}
function metadata(body) {
	const attrs = (tag) =>
		Object.fromEntries(
			[...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)].map((match) => [
				match[1].toLowerCase(),
				match[3]
			])
		);
	const canonicals = [...body.matchAll(/<link\b[^>]*>/gi)]
		.map((match) => attrs(match[0]))
		.filter((item) => item.rel === 'canonical')
		.map((item) => item.href);
	const robots = [...body.matchAll(/<meta\b[^>]*>/gi)]
		.map((match) => attrs(match[0]))
		.filter((item) => item.name === 'robots')
		.map((item) => item.content);
	const graphs = [...body.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
		.filter((match) => attrs(match[1]).type === 'application/ld+json')
		.map((match) => JSON.parse(match[2]));
	return { canonicals, robots, graphs };
}
for (const [indexable, urls] of [
	[true, eligible],
	[false, excluded]
]) {
	for (const url of urls)
		await check(url, async () => {
			const path = new URL(url).pathname,
				response = await get(path),
				meta = metadata(response.body);
			assert.equal(response.status, 200);
			assert.match(response.contentType, /text\/html/);
			assert.equal(meta.graphs.length, 1, 'Exactly one unified graph');
			assert(Array.isArray(meta.graphs[0]['@graph']));
			if (indexable) {
				assert.deepEqual(meta.canonicals, [url]);
				assert(!meta.robots.some((item) => /noindex/i.test(item)));
				if (origin === canonicalOrigin) assert(!/noindex/i.test(response.xRobotsTag ?? ''));
			} else {
				assert.deepEqual(meta.canonicals, []);
				assert(meta.robots.some((item) => /noindex/i.test(item)));
			}
			return {
				status: response.status,
				canonical: meta.canonicals,
				robots: meta.robots,
				xRobotsTag: response.xRobotsTag,
				jsonLdBlocks: meta.graphs.length
			};
		});
}
await check('health identity', async () => {
	const response = await get('/api/health'),
		body = JSON.parse(response.body);
	assert.equal(response.status, 200);
	assert.equal(body.db.ok, true);
	assert.equal(body.version, values.sha.slice(0, 7));
	return body;
});
await check('maintenance disabled', async () => {
	const response = await get('/maintenance-state.json'),
		body = JSON.parse(response.body);
	assert.equal(response.status, 200);
	assert.equal(body.maintenance, false);
	return body;
});
await check('anonymous admin protection', async () => {
	const response = await get('/api/admin/posts');
	assert.equal(response.status, 401);
	return { status: response.status };
});
await check('unknown article', async () => {
	const response = await get('/blog/nonexistent-layout-verification-20261105');
	assert.equal(response.status, 404);
	return { status: response.status };
});
await check('canonical sitemap inventory', async () => {
	const response = await get('/sitemap.xml');
	assert.equal(response.status, 200);
	const urls = [...response.body.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
	assert.deepEqual(
		[...urls].sort((left, right) => left.localeCompare(right)),
		[...eligible].sort((left, right) => left.localeCompare(right))
	);
	return urls;
});
await check('robots blog crawlability', async () => {
	const response = await get('/robots.txt');
	assert.equal(response.status, 200);
	assert(response.body.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`));
	assert(!/^Disallow:\s*(?:\/\s*$|\/blog)/im.test(response.body));
	return { status: response.status, body: response.body };
});
await check('standalone compiled brand CSS', async () => {
	const response = await get('/brand-ui.css');
	assert.equal(response.status, 200);
	assert.match(response.contentType, /text\/css/);
	assert.match(response.cacheControl ?? '', /no-cache|max-age=0/);
	assert(response.body.includes('Sofia Sans Variable'));
	return {
		status: response.status,
		cacheControl: response.cacheControl,
		bytes: Buffer.byteLength(response.body)
	};
});
for (const path of [
	'/blog?search=gamma',
	'/blog/category/spx-options?search=gamma',
	'/blog/tag/risk-management?search=gamma'
])
	await check(`search policy ${path}`, async () => {
		const response = await get(path),
			meta = metadata(response.body);
		assert.equal(response.status, 200);
		assert.deepEqual(meta.canonicals, []);
		assert(meta.robots.some((item) => /noindex/.test(item)));
		assert.match(response.cacheControl ?? '', /no-store/);
		return { status: response.status, cacheControl: response.cacheControl, robots: meta.robots };
	});
await check('legacy product redirect', async () => {
	const path = '/watchlist?ref=release-check',
		response = await get(path);
	assert.equal(response.status, 308);
	const location = new URL(response.location, `${origin}${path}`);
	assert.equal(location.origin, origin);
	assert.equal(location.pathname, '/sunday-alpha-alerts');
	assert.equal(location.search, '?ref=release-check');
	return { status: response.status, location: response.location };
});
report.passed = report.checks.filter((item) => item.status === 'passed').length;
report.failed = report.checks.filter((item) => item.status === 'failed').length;
await writeFile(values.out, redact(JSON.stringify(report, null, 2)) + '\n');
console.log(JSON.stringify({ passed: report.passed, failed: report.failed, report: values.out }));
process.exitCode = report.failed ? 1 : 0;
