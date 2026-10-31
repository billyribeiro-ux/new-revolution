import { describe, expect, it } from 'vitest';
import { isGoogleDocsHtml, isWordHtml, sanitizePostHtml } from './sanitize-post-html';

describe('sanitizePostHtml (Section 7.1)', () => {
	it('preserves heading levels h1 through h6 and strips all id attributes', () => {
		const input = [
			'<h1 id="h1-id">Heading 1</h1>',
			'<h2 id="h2-id">Heading 2</h2>',
			'<h3 id="h3-id">Heading 3</h3>',
			'<h4 id="h4-id">Heading 4</h4>',
			'<h5 id="h5-id">Heading 5</h5>',
			'<h6 id="h6-id">Heading 6</h6>'
		].join('');

		const out = sanitizePostHtml(input);
		expect(out).toBe(
			'<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3><h4>Heading 4</h4><h5>Heading 5</h5><h6>Heading 6</h6>'
		);
		expect(out).not.toContain('id=');
	});

	it('rejects javascript:, data:, vbscript:, protocol-relative, entity-encoded, and control-char-split schemes on links', () => {
		const cases = [
			'<a href="javascript:alert(1)">Click</a>',
			'<a href="JaVaScRiPt:alert(1)">Click</a>',
			'<a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert(1)">Click</a>',
			'<a href="&#x6a;avascript:alert(1)">Click</a>',
			'<a href="java\t\n\rscript:alert(1)">Click</a>',
			'<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">Click</a>',
			'<a href="//evil.example.com/payload">Click</a>'
		];

		for (const html of cases) {
			const clean = sanitizePostHtml(html);
			expect(clean).toBe('<a>Click</a>');
		}
	});

	it('allows https, http, mailto, tel, and relative URLs on links and enforces noopener noreferrer on _blank without adding nofollow', () => {
		const externalBlank = sanitizePostHtml(
			'<a href="https://example.com/guide" target="_blank">Guide</a>'
		);
		expect(externalBlank).toBe(
			'<a href="https://example.com/guide" target="_blank" rel="noopener noreferrer">Guide</a>'
		);

		const externalNofollow = sanitizePostHtml(
			'<a href="https://example.com/sponsor" target="_blank" rel="nofollow">Sponsor</a>'
		);
		expect(externalNofollow).toContain('rel="nofollow noopener noreferrer"');

		const internal = sanitizePostHtml('<a href="/blog/options-greeks" target="_self">Internal</a>');
		expect(internal).toBe('<a href="/blog/options-greeks" target="_self">Internal</a>');

		const mailto = sanitizePostHtml('<a href="mailto:support@revolutiontradingpros.com">Email</a>');
		expect(mailto).toBe('<a href="mailto:support@revolutiontradingpros.com">Email</a>');
	});

	it('keeps data-align="full" and a plain-text title on images, and still rejects unknown alignments', () => {
		const out = sanitizePostHtml(
			'<img src="https://revolutiontradingpros.com/a-1200w.webp" alt="" title="Hover text" width="1200" height="675" data-align="full" />'
		);
		expect(out).toContain('data-align="full"');
		expect(out).toContain('title="Hover text"');
		expect(out).toContain('alt=""');
		expect(
			sanitizePostHtml(
				'<img src="https://revolutiontradingpros.com/a.webp" alt="x" data-align="wide" />'
			)
		).not.toContain('data-align');
		expect(
			sanitizePostHtml(
				'<img src="https://revolutiontradingpros.com/a.webp" alt="x" title="&quot;><script>alert(1)</script>" />'
			)
		).not.toContain('<script');
	});

	it('allows safe base64 raster data: URLs on img src, rejects svg data URLs and protocol-relative src, and drops srcset containing data:', () => {
		const validPng =
			'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
		const imgOk = sanitizePostHtml(
			`<img src="${validPng}" alt="Pixel" width="1200" height="675" loading="lazy" decoding="async" data-align="center" />`
		);
		expect(imgOk).toContain(`src="${validPng}"`);
		expect(imgOk).toContain('width="1200"');
		expect(imgOk).toContain('height="675"');
		expect(imgOk).toContain('data-align="center"');

		const svgData = sanitizePostHtml(
			'<img src="data:image/svg+xml;base64,PHN2Zz48c2NyaXB0PmFsZXJ0KDEpPC9zY3JpcHQ+PC9zdmc+" alt="bad" />'
		);
		expect(svgData).not.toContain('src=');

		const dataSrcset = sanitizePostHtml(
			'<img src="https://revolutiontradingpros.com/a.webp" srcset="data:image/png;base64,AAAA 1x, https://revolutiontradingpros.com/a-800w.webp 800w" alt="chart" />'
		);
		expect(dataSrcset).not.toContain('srcset=');

		const validSrcset = sanitizePostHtml(
			'<img src="https://revolutiontradingpros.com/a.webp" srcset="https://revolutiontradingpros.com/a-480w.webp 480w, https://revolutiontradingpros.com/a-800w.webp 800w" sizes="(max-width: 768px) 100vw, 800px" alt="chart" />'
		);
		expect(validSrcset).toContain('srcset="https://revolutiontradingpros.com/a-480w.webp 480w');
		expect(validSrcset).toContain('sizes="(max-width: 768px) 100vw, 800px"');
	});

	it('enforces strict iframe host, path, port, credentials, srcdoc, and allow rules', () => {
		const validYoutube = sanitizePostHtml(
			'<div data-youtube-video=""><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" width="640" height="360" allow="autoplay; fullscreen; camera; microphone; picture-in-picture" allowfullscreen></iframe></div>'
		);
		expect(validYoutube).toContain('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"');
		expect(validYoutube).toContain('allow="autoplay; fullscreen; picture-in-picture"');
		expect(validYoutube).not.toContain('camera');

		const validVimeo = sanitizePostHtml(
			'<div class="vimeo-embed" data-vimeo-id="123456789" data-width="640" data-height="360"><iframe src="https://player.vimeo.com/video/123456789?badge=0" width="640" height="360" allowfullscreen></iframe></div>'
		);
		expect(validVimeo).toContain('data-vimeo-id="123456789"');
		expect(validVimeo).toContain('src="https://player.vimeo.com/video/123456789?badge=0"');

		// Host spoofing in query string, credentials, port, non-embed path, srcdoc
		const spoofed = [
			'<iframe src="https://evil.com/?host=www.youtube.com/embed/abc"></iframe>',
			'<iframe src="https://user:pass@www.youtube.com/embed/abc"></iframe>',
			'<iframe src="https://www.youtube.com:8443/embed/abc"></iframe>',
			'<iframe src="https://www.youtube.com/watch?v=abc"></iframe>',
			'<iframe src="http://www.youtube.com/embed/abc"></iframe>',
			'<iframe srcdoc="<script>alert(1)</script>"></iframe>',
			'<iframe></iframe>'
		];

		for (const bad of spoofed) {
			expect(sanitizePostHtml(bad)).toBe('');
		}
	});

	it('preserves task lists AND task item checkbox inputs while stripping text/button inputs', () => {
		const taskHtml =
			'<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked disabled onclick="alert(1)" name="steal"><span>Check Delta exposure</span></label><p>Verify Gamma risk</p></li></ul><input type="text" value="hack" />';
		const clean = sanitizePostHtml(taskHtml);
		expect(clean).toContain('<ul data-type="taskList">');
		expect(clean).toContain('<li data-type="taskItem" data-checked="true">');
		expect(clean).toContain('<input type="checkbox" checked="checked" disabled="disabled" />');
		expect(clean).not.toContain('onclick');
		expect(clean).not.toContain('type="text"');
	});

	it('filters classes strictly, allowing callout, media, embed, and code language-* classes while stripping ProseMirror classes', () => {
		const html =
			'<div data-callout-type="warning" class="callout callout--warning ProseMirror-selectednode custom-hack"><p>Risk notice</p></div><pre><code class="language-typescript evil-class">const x = 1;</code></pre>';
		const clean = sanitizePostHtml(html);
		expect(clean).toContain(
			'<div class="callout callout--warning" data-callout-type="warning"><p>Risk notice</p></div>'
		);
		expect(clean).toContain('<code class="language-typescript">const x = 1;</code>');
		expect(clean).not.toContain('ProseMirror-selectednode');
		expect(clean).not.toContain('evil-class');
	});

	it('validates inline styles against CSS injection, url(), expression(), escapes, and disallowed layout properties', () => {
		const html =
			'<p style="color: #dcff65; font-size: 18px; position: fixed; top: 0; margin: 999px; background-image: url(https://evil.com/x)">Styled</p>';
		// Because `url(` is present in the style string, the entire style is rejected or sanitized
		expect(sanitizePostHtml(html)).toBe('<p>Styled</p>');

		const safeStyle =
			'<p style="color: #dcff65; background-color: rgb(17, 21, 26); font-family: \'Montserrat Variable\', sans-serif; font-size: 1.125rem; text-align: center; position: absolute; float: left">Clean</p>';
		const clean = sanitizePostHtml(safeStyle);
		expect(clean).toContain('color: #dcff65');
		expect(clean).toContain('background-color: rgb(17, 21, 26)');
		expect(clean).toContain("font-family: 'Montserrat Variable', sans-serif");
		expect(clean).toContain('text-align: center');
		expect(clean).not.toContain('position');
		expect(clean).not.toContain('float');
	});

	it('preserves table geometry attributes and table/col width styles only on table elements', () => {
		const tableHtml =
			'<table style="width: 100%; min-width: 480px"><colgroup span="2"><col span="1" width="200" style="width: 200px" /></colgroup><thead><tr><th colspan="2" rowspan="1" colwidth="200,300" scope="col">Ticker</th></tr></thead><tbody><tr><td colspan="2" colwidth="200,300">SPX</td></tr></tbody></table>';
		const clean = sanitizePostHtml(tableHtml);
		expect(clean).toContain('<table style="width: 100%; min-width: 480px">');
		expect(clean).toContain('<th colspan="2" rowspan="1" colwidth="200,300" scope="col">');
		expect(clean).toContain('<td colspan="2" colwidth="200,300">');
	});

	it('cleans Word and Google Docs markup, unwraps attribute-less spans, and drops dangerous subtrees', () => {
		const wordAndDocs = [
			'<!--[if gte mso 9]><xml><w:WordDocument></w:WordDocument></xml><![endif]-->',
			'<p class="MsoNormal" style="mso-margin-top-alt:auto; color: #ffffff"><b id="docs-internal-guid-123" style="font-weight:normal"><span>Institutional execution</span></b><o:p></o:p></p>',
			'<script>alert("xss")</script>',
			'<svg onload="alert(1)"><circle r="10"/></svg>',
			'<math><mtext>x</mtext></math>',
			'<form><button>Submit</button></form>'
		].join('');

		expect(isWordHtml(wordAndDocs)).toBe(true);
		expect(isGoogleDocsHtml(wordAndDocs)).toBe(true);

		const clean = sanitizePostHtml(wordAndDocs);
		expect(clean).toBe('<p style="color: #ffffff">Institutional execution</p>');
	});

	it('converts 3+ consecutive <br> inside a <p> into paragraph breaks, removes empty/NBSP paragraphs, and is strictly idempotent', () => {
		const input =
			'<p>First paragraph<br><br><br>Second paragraph</p><p>&nbsp;</p><p>   </p><p><br></p>';
		const once = sanitizePostHtml(input);
		const twice = sanitizePostHtml(once);
		expect(once).toBe('<p>First paragraph</p><p>Second paragraph</p>');
		expect(twice).toBe(once);
	});
});
