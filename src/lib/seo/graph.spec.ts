import { describe, expect, it } from 'vite-plus/test';
import { buildSundayAlphaProtocolJsonLd } from './structured-data';
import { buildBlogIndexJsonLd, buildBlogPostJsonLd, dropRestrictedJsonLdNodes } from './blog-seo';
import { consolidateJsonLdGraph } from './graph';

const origin = 'https://www.revolutiontradingpros.com';

describe('entity identity across service and publishing graphs', () => {
	it('merges rich service definitions without duplicating catalog entities', () => {
		const graph = buildSundayAlphaProtocolJsonLd(origin)['@graph'];
		const services = graph.filter(
			(node) => node['@id'] === `${origin}/alert-services/sunday-alpha-protocol#service`
		);
		expect(services).toHaveLength(1);
		expect(services[0]).toHaveProperty('audience');
		expect(graph.filter((node) => node['@type'] === 'Person')).toHaveLength(1);
		expect(graph.some((node) => node['@type'] === 'Product')).toBe(false);
		const ids = graph.map((node) => node['@id']);
		expect(new Set(ids).size).toBe(ids.length);
	});
	it('closes blog base references and reuses the canonical founder for the byline', () => {
		const graph = buildBlogPostJsonLd(
			{
				slug: 'example',
				title: 'Example',
				author: { name: 'Billy Ribeiro', slug: 'billy-ribeiro' }
			},
			origin
		)['@graph'];
		expect(graph.filter((node) => node['@type'] === 'Person').map((node) => node['@id'])).toEqual([
			`${origin}/#founder`
		]);
		for (const suffix of ['organization', 'website', 'founder', 'offer-catalog'])
			expect(graph.some((node) => node['@id'] === `${origin}/#${suffix}`)).toBe(true);
		const index = buildBlogIndexJsonLd(
			[
				{
					title: 'Example',
					slug: 'example',
					author: { name: 'Billy Ribeiro', slug: 'billy-ribeiro' }
				}
			],
			origin
		)['@graph'];
		expect(JSON.stringify(index)).not.toContain('#author-billy-ribeiro');
	});
	it('retains distinct authors and merges complementary fields on one entity', () => {
		const graph = consolidateJsonLdGraph({
			'@graph': [
				{ '@id': '#item', '@type': 'Service', name: 'Name' },
				{ '@id': '#item', description: 'Description' }
			]
		})['@graph'];
		expect(graph).toEqual([
			{ '@id': '#item', '@type': 'Service', name: 'Name', description: 'Description' }
		]);
		const post = buildBlogPostJsonLd(
			{ slug: 'example', title: 'Example', author: { name: 'Other Author', slug: 'other-author' } },
			origin
		);
		expect(post['@graph'].some((node) => node['@id'] === `${origin}/#author-other-author`)).toBe(
			true
		);
	});
	it('removes prohibited nested payloads and protects shared entities from custom overrides', () => {
		const result = dropRestrictedJsonLdNodes(
			[
				{ '@type': 'Thing', subjectOf: { '@type': 'FAQPage', name: 'Disallowed' } },
				{ '@type': 'SearchAction', target: 'https://example.test/search' },
				{ '@type': 'Product', name: 'Unpriced' },
				{ '@id': `${origin}/#founder`, '@type': 'Person', name: 'Override' }
			],
			new Set([`${origin}/#founder`])
		);
		expect(result).toEqual([{ '@type': 'Thing' }, { '@id': `${origin}/#founder` }]);
	});

	it('removes internal references to filtered and missing definitions while preserving valid references', () => {
		const founder = `${origin}/#founder`;
		const faq = `${origin}/blog/example#faq`;
		const dataset = `${origin}/blog/example#dataset`;
		const result = dropRestrictedJsonLdNodes(
			[
				{ '@type': 'FAQPage', '@id': faq },
				{
					'@type': 'Dataset',
					'@id': dataset,
					name: 'Study',
					subjectOf: { '@id': faq },
					about: { '@id': `${origin}/#missing` },
					author: { '@id': founder },
					citation: { '@id': 'https://external.example/study' }
				},
				{ '@type': 'Thing', subjectOf: { '@id': dataset } },
				{ '@id': '#missing-relative' }
			],
			new Set([founder])
		);
		expect(result).toEqual([
			{
				'@type': 'Dataset',
				'@id': dataset,
				name: 'Study',
				author: { '@id': founder },
				citation: { '@id': 'https://external.example/study' }
			},
			{ '@type': 'Thing', subjectOf: { '@id': dataset } }
		]);
	});

	it('removes references whose definitions collapse after an unknown reference is removed', () => {
		expect(
			dropRestrictedJsonLdNodes([
				{ '@id': '#empty', about: { '@id': '#missing' } },
				{ '@type': 'Thing', subjectOf: { '@id': '#empty' } }
			])
		).toEqual([{ '@type': 'Thing' }]);
	});
});
