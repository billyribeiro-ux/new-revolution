import { describe, expect, it } from 'vite-plus/test';
import { normalizeBlogSearch, parsePostCustomFields } from '../../shared/blog/search';
import { buildPostSearchProjection, extractVisiblePostText } from './search-projection';
import { preparePublicPostContent } from './prepared-content';

describe('Prepared visible article search', () => {
	it('preserves inline words and separates blocks, cells and line breaks', () => {
		expect(
			extractVisiblePostText(
				'<p>pre<strong>mium</strong> risk</p><p>management<br>rules</p><table><tr><td>one</td><td>two</td></tr></table>'
			)
		).toBe('premium risk management rules one two');
	});
	it('decodes full entities once while preserving literal encoded markup', () => {
		expect(
			extractVisiblePostText(
				'<p>AT&amp;T&nbsp;&#82;isk &#x6d;anagement &copy; &Delta; &amp;#82;isk &lt;b&gt;literal&lt;/b&gt;</p>'
			)
		).toBe('AT&T Risk management © Δ &#82;isk <b>literal</b>');
	});
	it('ignores attributes, metadata and embedded script/style/iframe content', () => {
		expect(
			extractVisiblePostText(
				'<p title="hidden title"><a href="https://hidden.example">visible</a><img src="/hidden.png" alt="hidden alt"></p><script>hidden script</script><style>hidden css</style><iframe>hidden video</iframe>'
			)
		).toBe('visible');
	});
	it('normalizes query and corpus Unicode whitespace equally without changing punctuation', () => {
		expect(normalizeBlogSearch('  ＳＰＸ\u00a0 risk\n  10%_\\  ')).toBe('SPX risk 10%_\\');
		expect(normalizeBlogSearch('legacy\u0000text')).toBe('legacy\uFFFDtext');
	});
	it('uses public body preparation and adds displayed authored fields, never SEO-only metadata', () => {
		const source = {
			title: 'Risk guide',
			excerpt: 'Summary <literal>',
			content:
				'<img src="/cover-800w.webp"><h1>Risk guide</h1><p>pre<strong>mium</strong> rules</p>',
			coverImage: '/cover.webp',
			coverImageCaption: 'Cover context',
			customFields: JSON.stringify([
				{ key: '__subtitle', value: 'Desk subtitle' },
				{ key: '__seriesName', value: 'Research series' },
				{ key: 'privateNote', value: 'hidden metadata' }
			]),
			faqItems: JSON.stringify([
				{ question: 'Question?', answer: 'Authored answer.' },
				{ question: '', answer: 'not displayed' }
			])
		};
		expect(preparePublicPostContent(source.content, source.title, source.coverImage).html).toBe(
			'<p>pre<strong>mium</strong> rules</p>'
		);
		const result = buildPostSearchProjection(source);
		expect(result.searchText).toBe(
			'Risk guide Summary <literal> Desk subtitle Research series Cover context premium rules Question? Authored answer.'
		);
		expect(result.searchExcluded).toBe(false);
	});
	it.each([
		'[{"key":"__excludeFromSearch","value":"true"}]',
		'[\n { "value": "true", "key": "__excludeFromSearch" }\n]',
		'{"__excludeFromSearch":"true"}',
		'[{"key":"__excludeFromSearch","value":"false"},{"key":"__excludeFromSearch","value":"true"}]'
	])('parses exclusion semantically for accepted shape %s', (raw) => {
		expect(parsePostCustomFields(raw).excludeFromSearch).toBe(true);
	});
	it.each([
		null,
		'',
		'  ',
		'{}',
		'[]',
		'{"__excludeFromSearch":"false"}',
		'[{"key":"other","value":"__excludeFromSearch true"}]'
	])('keeps a valid searchable value %s', (raw) => {
		expect(parsePostCustomFields(raw).excludeFromSearch).toBe(false);
	});
	it.each(['{', 'null', '42', '{"__excludeFromSearch":true}', '[{"key":"__excludeFromSearch"}]'])(
		'fails closed on malformed legacy metadata %s',
		(raw) => {
			const parsed = parsePostCustomFields(raw);
			expect(parsed.malformed).toBe(true);
			expect(parsed.excludeFromSearch).toBe(true);
		}
	);
});
