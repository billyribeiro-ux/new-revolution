import { describe, expect, it } from 'vite-plus/test';
import { applyPostAutofill } from './autofill';
import { applyContentSeoTransforms } from './content-transform';
import { normalizePostHeadings } from './toc';

describe('applyContentSeoTransforms, applyPostAutofill & normalizePostHeadings', () => {
	it('preserves authored punctuation while preparing headings and real media', async () => {
		const mediaMap = new Map([
			[
				'https://revolutiontradingpros.com/media/spx-gamma.webp',
				{
					blobUrl: 'https://revolutiontradingpros.com/media/spx-gamma.webp',
					width: 1200,
					height: 675,
					altText: 'SPX Gamma Exposure Profile'
				}
			]
		]);

		const input = {
			title: `Options Greeks \u2014 Institutional Playbook`,
			content: [
				`<h1>Options Greeks \u2014 Institutional Playbook</h1>`,
				`<p>\u2014 Leading dash dropped; sell 15\u201320 Delta in the $500\u2014$1,000 range \u2014 not lottery tickets.</p>`,
				`<pre><code class="language-ts">const range = "15\u201320 \u2014 untouched inside code";</code></pre>`,
				`<p><a href="https://example.com/path\u2014with\u2013dashes" title="Title\u2014attr">https://example.com/url\u2014in\u2013text</a></p>`,
				`<img src="https://revolutiontradingpros.com/media/spx-gamma.webp" alt="" />`
			].join(''),
			metaTitle: `Options Greeks \u2014 Guide`,
			metaDescription: `Trade 30\u201345 DTE structures \u2014 with strict risk.`,
			faqItems: JSON.stringify([
				{
					question: `What is Delta \u2014 and why does it matter?`,
					answer: `Target 15\u201320 Delta contracts \u2014 never gamble.`
				}
			])
		};

		const { data, changes } = await applyContentSeoTransforms(input, () => mediaMap);

		expect(data.title).toBe(input.title);
		// Step 1: duplicate lead h1 stripped
		expect(data.content).not.toContain('<h1>');
		// Step 3 & 4: width, height, and empty alt backfilled from media lookup
		expect(data.content).toContain('width="1200"');
		expect(data.content).toContain('height="675"');
		expect(data.content).toContain('alt="SPX Gamma Exposure Profile"');
		// Save preparation must not mechanically rewrite prose, code, URLs or metadata.
		expect(data.content).toContain(input.content.match(/<p>[\s\S]*?<\/p>/)![0]);
		expect(data.content).toContain(`const range = "15\u201320 \u2014 untouched inside code";`);
		expect(data.content).toContain(`href="https://example.com/path\u2014with\u2013dashes"`);
		expect(data.metaTitle).toBe(input.metaTitle);
		expect(data.metaDescription).toBe(input.metaDescription);
		expect(data.faqItems).toBe(input.faqItems);
		expect(changes).toEqual([
			'stripped_duplicate_lead_heading',
			'injected_img_dimensions',
			'backfilled_img_alt'
		]);
	});

	it('autofills blank fields without overwriting existing values and never defaults coverImageAlt to title', () => {
		const filled = applyPostAutofill({
			title: 'Institutional Options Order Flow and Gamma Hedging',
			content:
				'<p>Institutional options desks hedge gamma exposure dynamically across intraday S&P 500 price levels to remain delta neutral during high-volatility sessions.</p>',
			coverImage: 'https://revolutiontradingpros.com/media/cover.webp',
			coverImageCaption: 'Institutional Options Order Flow and Gamma Hedging'
		});

		expect(filled.metaTitle).toBe('Institutional Options Order Flow and Gamma Hedging');
		expect(filled.metaDescription?.length).toBeGreaterThanOrEqual(70);
		expect(filled.excerpt).toBe(filled.metaDescription);
		expect(filled.ogTitle).toBe(filled.metaTitle);
		expect(filled.ogImage).toBe(filled.coverImage);
		expect(filled.twitterCardType).toBe('summary_large_image');
		expect(filled.focusKeyword).toBe('institutional options');
		// Caption equalled title, so coverImageAlt must remain undefined rather than duplicating title
		expect(filled.coverImageAlt).toBeUndefined();
		expect(filled.canonicalUrl).toBeUndefined();
	});

	it('normalises post headings, demotes h1 to h2, deduplicates slug IDs, and excludes CTA headings from TOC', () => {
		const html = [
			'<h1>My Post Title</h1>',
			'<h1 id="custom-id">Why Gamma Matters</h1>',
			'<h3>Why Gamma Matters</h3>',
			'<h2>Call to Action</h2>',
			'<h4>Position Sizing\nRules</h4>'
		].join('');

		const { html: outHtml, toc } = normalizePostHeadings(html, 'My Post Title');
		expect(outHtml).not.toContain('My Post Title');
		expect(outHtml).toContain('<h2 id="why-gamma-matters">Why Gamma Matters</h2>');
		expect(outHtml).toContain('<h3 id="why-gamma-matters-2">Why Gamma Matters</h3>');
		expect(outHtml).toContain('<h2 id="call-to-action">Call to Action</h2>');
		expect(outHtml).toContain('<h4 id="position-sizing-rules">Position Sizing\nRules</h4>');

		expect(toc).toEqual([
			{ id: 'why-gamma-matters', text: 'Why Gamma Matters', level: 2 },
			{ id: 'why-gamma-matters-2', text: 'Why Gamma Matters', level: 3 },
			{ id: 'position-sizing-rules', text: 'Position Sizing Rules', level: 4 }
		]);
	});
});
