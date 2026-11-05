// Read-only source probes. Run from the repository root after installing the locked dependencies:
// node docs/reviews/blog-audit-2026-11-05/source-probe.mjs /absolute/path/to/0DTE-spx-options-strategy.md
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { createServer } from 'vite';

const draftPath = process.argv[2];
if (!draftPath) throw new Error('Pass the absolute path of the original article brief.');
const server = await createServer({
	logLevel: 'silent',
	server: { middlewareMode: true, ws: false },
	ssr: { external: ['sanitize-html', 'htmlparser2'] }
});
try {
	const { parseMarkdownPostFile } = await server.ssrLoadModule('/scripts/import-markdown-posts.ts');
	const { getSeoScore } = await server.ssrLoadModule('/src/lib/shared/seo/score.ts');
	const { postCreateSchema } = await server.ssrLoadModule('/src/lib/shared/schemas/posts.ts');
	const { sanitizePostHtml } = await server.ssrLoadModule('/src/lib/sanitize-post-html.ts');
	const { dropRestrictedJsonLdNodes, buildBlogPostJsonLd } = await server.ssrLoadModule(
		'/src/lib/seo/blog-seo.ts'
	);
	const input = readFileSync(draftPath);
	const raw = (draftPath.endsWith('.gz') ? gunzipSync(input) : input).toString('utf8');
	const parsed = parseMarkdownPostFile('0DTE-spx-options-strategy.md', raw);
	const files = readdirSync('content/blog-posts').filter((f) => /^blog-post-\d+-.+\.md$/.test(f));
	const archived = files.map((file) =>
		parseMarkdownPostFile(file, readFileSync(resolve('content/blog-posts', file), 'utf8'))
	);
	const title = raw.match(/^\* \*\*Title Tag[^\n]*?`([^`\n]+)`/m)?.[1] ?? '';
	const description = raw.match(/^\* \*\*Meta Description[^\n]*?`([^`\n]+)`/m)?.[1] ?? '';
	const sample = {
		title: '0DTE SPX Options Strategy Guide',
		slug: '0dte-spx-options-strategy-guide',
		content:
			'<h2>0DTE SPX options risk</h2><p>' +
			'0DTE SPX options risk discipline. '.repeat(130) +
			'</p><img src="/images/blog/not-a-real-file.webp" alt="0DTE SPX options hypothetical chart" width="1200" height="675"><a href="https://www.cboe.com/">Exchange reference</a><a href="https://www.irs.gov/">Tax reference</a>',
		metaTitle: '0DTE SPX Options Strategy Guide',
		metaDescription:
			'Study a 0DTE SPX options strategy with defined-risk spread examples, settlement mechanics, gamma assumptions, execution costs, and clear position limits.',
		excerpt: 'Educational options examples and risk limits.',
		coverImage: '/images/blog/not-a-real-file.webp',
		coverImageAlt: 'Hypothetical SPX chart with clearly marked risk levels',
		focusKeyword: '0DTE SPX options',
		authorId: 1,
		categoryId: 1,
		tagIds: [1, 2],
		faqItems: JSON.stringify(
			[1, 2, 3].map((n) => ({
				question: `Risk question ${n}?`,
				answer: 'This is an educational example; fees and execution affect realized outcomes.'
			}))
		)
	};
	const offsetless = postCreateSchema.safeParse({
		...sample,
		status: 'scheduled',
		scheduledAt: '2099-11-05T09:00:00'
	});
	const nested = { '@type': 'WebPage', mainEntity: { '@type': 'FAQPage', mainEntity: [] } };
	const graph = buildBlogPostJsonLd({
		slug: sample.slug,
		title: sample.title,
		isPillar: true,
		schemaType: 'BlogPosting',
		author: { name: 'Billy Ribeiro', slug: 'billy-ribeiro' }
	});
	console.log(
		JSON.stringify(
			{
				draft: {
					inputFilename: '0DTE-spx-options-strategy.md',
					discoveredByImporterFilenamePattern: /^blog-post-\d+-.+\.md$/.test(
						'0DTE-spx-options-strategy.md'
					),
					parsedTitle: parsed.title,
					parsedSlug: parsed.slug,
					parsedBodyLength: parsed.contentHtml.length,
					parsedImageSpecs: parsed.images.length,
					parsedMetaDescription: parsed.metaDescription,
					actualProposedTitle: title,
					actualProposedTitleLength: title.length,
					actualProposedDescription: description,
					actualProposedDescriptionLength: description.length,
					proposedDescriptionAcceptedByCms: postCreateSchema.safeParse({
						...sample,
						metaDescription: description
					}).success
				},
				archive: {
					files: archived.length,
					nonemptyBodies: archived.filter((p) => p.contentHtml).length,
					imageSpecs: archived.reduce((n, p) => n + p.images.length, 0),
					descriptionsOutsideHouseRange: archived
						.filter((p) => p.metaDescription.length < 140 || p.metaDescription.length > 155)
						.map((p) => ({ slug: p.slug, length: p.metaDescription.length }))
				},
				placeholderGate: getSeoScore(sample),
				offsetlessScheduleAccepted: offsetless.success,
				nestedRestrictedSchemaAfterFilter: dropRestrictedJsonLdNodes([nested]),
				pillarArticleTypes: graph['@graph'].map((n) => n['@type']),
				blogAuthorEntityId: graph['@graph'].find((n) => n['@type'] === 'Person')?.['@id'],
				sanitizer: {
					literalMath: sanitizePostHtml('<p>$$\\frac{700}{1000}$$</p>'),
					nativeDetails: sanitizePostHtml(
						'<details><summary>Risk?</summary><p>Answer</p></details>'
					),
					scriptedPayload: sanitizePostHtml(
						'<p>Safe</p><script>alert(1)</script><img src="x" onerror="alert(1)">'
					)
				}
			},
			null,
			2
		)
	);
} finally {
	await server.close();
}
