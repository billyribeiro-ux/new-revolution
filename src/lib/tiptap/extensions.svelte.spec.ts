import { describe, expect, it } from 'vitest';
import { Editor } from '@tiptap/core';
import {
	createBlogEditorExtensions,
	resolveEditorLinkAttributes,
	syncEditorContent
} from './index';
import { extractVimeoId, buildVimeoEmbedUrl } from './vimeo';
import { normalizeTweetUrl } from './tweet';
import { filterSlashCommands } from './slash-commands';
import { sanitizePostHtml } from '../sanitize-post-html';

function createHeadlessEditor(initialContent = '<p>Hello world</p>'): Editor {
	return new Editor({
		extensions: createBlogEditorExtensions(),
		content: initialContent
	});
}

describe('TipTap 3 Custom Extensions Suite', () => {
	it('renders ImageWithDimensions with class="blog-image", figure/figcaption wrapper, and link wrapper without data-caption on img', () => {
		const html =
			'<p>Intro</p><figure class="blog-image-figure alignright"><a href="https://revolutiontradingpros.com/alerts" target="_blank" rel="noopener noreferrer"><img src="https://revolutiontradingpros.com/media/spx-800w.webp" alt="SPX breakout" width="800" height="450" data-size="medium" data-media-id="media-123"></a><figcaption>Daily SPX chart</figcaption></figure>';
		const editor = createHeadlessEditor(html);
		const out = editor.getHTML();

		expect(out).toContain('class="blog-image"');
		expect(out).toContain('width="800"');
		expect(out).toContain('height="450"');
		expect(out).toContain('data-align="right"');
		expect(out).toContain('data-size="medium"');
		expect(out).toContain('data-media-id="media-123"');
		expect(out).toContain('<figure class="blog-image-figure">');
		expect(out).toContain('<figcaption>Daily SPX chart</figcaption>');
		expect(out).toContain(
			'<a href="https://revolutiontradingpros.com/alerts" target="_blank" rel="noopener noreferrer">'
		);
		expect(out).not.toContain('data-caption=');
		editor.destroy();
	});

	it('parses legacy blog-image--{align} and align{align} classes into data-align on ImageWithDimensions', () => {
		const editor = createHeadlessEditor(
			'<img src="https://revolutiontradingpros.com/media/chart.webp" alt="Chart" class="blog-image--left">'
		);
		const out = editor.getHTML();
		expect(out).toContain('class="blog-image"');
		expect(out).toContain('data-align="left"');
		editor.destroy();
	});

	it('round-trips internal links without target/rel and external links with explicit target/rel via resolveEditorLinkAttributes', () => {
		const internalAttrs = resolveEditorLinkAttributes({
			href: '/courses/day-trading',
			newTab: false,
			nofollow: false
		});
		expect(internalAttrs).toEqual({
			href: '/courses/day-trading',
			target: null,
			rel: null
		});

		const externalNewTabAttrs = resolveEditorLinkAttributes({
			href: 'https://www.cmegroup.com',
			newTab: true,
			nofollow: false
		});
		expect(externalNewTabAttrs).toEqual({
			href: 'https://www.cmegroup.com',
			target: '_blank',
			rel: 'noopener noreferrer'
		});

		const externalNofollowAttrs = resolveEditorLinkAttributes({
			href: 'https://example.com/sponsor',
			newTab: true,
			nofollow: true
		});
		expect(externalNofollowAttrs).toEqual({
			href: 'https://example.com/sponsor',
			target: '_blank',
			rel: 'noopener noreferrer nofollow'
		});

		const editor = createHeadlessEditor('<p>Read our guide</p>');
		editor.commands.selectAll();
		editor.commands.setLink(internalAttrs);
		const internalHtml = editor.getHTML();
		expect(internalHtml).toContain('<a href="/courses/day-trading">Read our guide</a>');
		expect(internalHtml).not.toContain('target=');
		expect(internalHtml).not.toContain('rel=');

		editor.commands.selectAll();
		editor.commands.setLink(externalNofollowAttrs);
		const externalHtml = editor.getHTML();
		expect(externalHtml).toContain('href="https://example.com/sponsor"');
		expect(externalHtml).toContain('target="_blank"');
		expect(externalHtml).toContain('rel="noopener noreferrer nofollow"');
		editor.destroy();
	});

	it('supports H1 through H6 headings and justify text alignment on paragraph, heading, and image', () => {
		const editor = createHeadlessEditor('<p>Heading test</p>');
		for (const level of [1, 2, 3, 4, 5, 6] as const) {
			editor.commands.selectAll();
			editor.commands.setHeading({ level });
			expect(editor.getHTML()).toContain(`<h${level}>Heading test</h${level}>`);
		}

		editor.commands.selectAll();
		editor.commands.setParagraph();
		editor.commands.setTextAlign('justify');
		expect(editor.getHTML()).toContain('text-align: justify');
		editor.destroy();
	});

	it('surgically updates external content via syncEditorContent without firing onUpdate or losing caret on prefix', () => {
		let updateFired = 0;
		const editor = new Editor({
			extensions: createBlogEditorExtensions(),
			content: '<p>Alpha Beta Gamma</p>',
			onUpdate() {
				updateFired += 1;
			}
		});

		// Position caret inside "Alpha" (pos 3)
		editor.commands.setTextSelection(3);
		expect(editor.state.selection.from).toBe(3);

		// Replace suffix "Gamma" -> "Delta" via syncEditorContent
		syncEditorContent(editor, '<p>Alpha Beta Delta</p>');

		expect(editor.getHTML()).toBe('<p>Alpha Beta Delta</p>');
		expect(updateFired).toBe(0);
		expect(editor.state.selection.from).toBe(3);
		editor.destroy();
	});

	it('parses, toggles, and renders Callout nodes for info, tip, warning, and danger', () => {
		const editor = createHeadlessEditor('<p>Important risk management rule.</p>');
		editor.commands.selectAll();
		editor.commands.setCallout({ type: 'warning' });

		const out = editor.getHTML();
		expect(out).toContain('data-callout="warning"');
		expect(out).toContain('class="callout callout-warning"');

		editor.commands.unsetCallout();
		expect(editor.getHTML()).not.toContain('data-callout');
		editor.destroy();
	});

	it('extracts Vimeo IDs and round-trips Vimeo embed blocks', () => {
		expect(extractVimeoId('https://vimeo.com/987654321')).toBe('987654321');
		expect(extractVimeoId('https://player.vimeo.com/video/12345678?h=abc')).toBe('12345678');
		expect(extractVimeoId('https://evil.example.com/12345')).toBeNull();
		expect(buildVimeoEmbedUrl('https://vimeo.com/555666777')).toBe(
			'https://player.vimeo.com/video/555666777?dnt=1'
		);

		const editor = createHeadlessEditor('<p>Video below:</p>');
		editor.commands.setVimeoVideo({
			src: 'https://vimeo.com/555666777',
			width: 640,
			height: 360,
			title: 'SPX Recap'
		});
		const out = editor.getHTML();
		expect(out).toContain('data-vimeo-video=""');
		expect(out).toContain('https://player.vimeo.com/video/555666777?dnt=1');
		editor.destroy();
	});

	it('normalizes X/Twitter URLs and preserves div.tweet-embed[data-tweet-url] on round-trip', () => {
		const parsed = normalizeTweetUrl('https://twitter.com/RevTradingPros/status/185001234567890');
		expect(parsed).toEqual({
			url: 'https://x.com/RevTradingPros/status/185001234567890',
			author: 'RevTradingPros',
			tweetId: '185001234567890'
		});
		expect(normalizeTweetUrl('https://example.com/status/123')).toBeNull();

		const initialHtml =
			'<div class="tweet-embed" data-tweet-url="https://x.com/RevTradingPros/status/185001234567890"><blockquote class="twitter-tweet"><a href="https://x.com/RevTradingPros/status/185001234567890">View</a></blockquote></div>';
		const editor = createHeadlessEditor(initialHtml);
		const roundTripped = editor.getHTML();
		expect(roundTripped).toContain('class="tweet-embed"');
		expect(roundTripped).toContain(
			'data-tweet-url="https://x.com/RevTradingPros/status/185001234567890"'
		);
		editor.destroy();
	});

	it('applies FontSize, FontFamily, and BlockStyle attributes and rejects unsafe values', () => {
		const editor = createHeadlessEditor('<p>Styled trading commentary</p>');
		editor.commands.selectAll();
		editor.commands.setFontSize('20px');
		editor.commands.setFontFamily("'Montserrat Variable', system-ui, -apple-system, sans-serif");
		editor.commands.setBlockStyle({
			backgroundColor: '#151a20',
			borderColor: '#dcff65',
			padding: '16px',
			borderRadius: '8px'
		});

		const html = editor.getHTML();
		expect(html).toContain('font-size: 20px');
		expect(html).toContain('Montserrat Variable');
		expect(html).toContain('data-bg-color="#151a20"');
		expect(html).toContain('data-border-color="#dcff65"');
		expect(html).toContain('data-padding="16px"');
		expect(html).toContain('data-border-radius="8px"');

		// Unsafe injection attempt is rejected
		expect(editor.commands.setFontSize('20px; background:url(javascript:alert(1))')).toBe(false);

		editor.commands.unsetFontSize();
		editor.commands.unsetFontFamily();
		editor.commands.unsetBlockStyle();
		const cleared = editor.getHTML();
		expect(cleared).not.toContain('font-size: 20px');
		expect(cleared).not.toContain('data-bg-color');
		editor.destroy();
	});

	it('performs FindAndReplace and undoes replaceAllMatches in a single undo step', () => {
		const editor = createHeadlessEditor(
			'<p>Gamma exposure drives SPX gamma pinning when gamma is positive.</p>'
		);

		editor.commands.setSearchTerm('gamma');
		editor.commands.setCaseSensitive(false);
		expect(editor.storage.findAndReplace.results).toHaveLength(3);

		editor.commands.setReplaceTerm('delta');
		editor.commands.replaceAllMatches();

		const replacedHtml = editor.getHTML();
		expect(replacedHtml).toBe(
			'<p>delta exposure drives SPX delta pinning when delta is positive.</p>'
		);

		// Single undo step restores all 3 occurrences at once!
		editor.commands.undo();
		expect(editor.getHTML()).toBe(
			'<p>Gamma exposure drives SPX gamma pinning when gamma is positive.</p>'
		);
		editor.destroy();
	});

	it('filters slash commands and returns an empty list on zero matches', () => {
		const callouts = filterSlashCommands('callout');
		expect(callouts.length).toBeGreaterThanOrEqual(4);

		const zeroMatches = filterSlashCommands('nonexistentxyzcommand');
		expect(zeroMatches).toEqual([]);
	});

	it('round-trips Callout, Vimeo, Tweet, and standalone linked ImageWithDimensions through sanitizePostHtml without data loss', () => {
		const editor = createHeadlessEditor(
			[
				'<div data-callout-type="warning" class="callout callout--warning"><p>Watch gamma walls.</p></div>',
				'<div class="vimeo-embed" data-vimeo-id="555666777" data-width="640" data-height="360"><iframe src="https://player.vimeo.com/video/555666777?dnt=1" width="640" height="360"></iframe></div>',
				'<blockquote class="twitter-embed" data-tweet-url="https://x.com/RevTradingPros/status/185001234567890"><a href="https://x.com/RevTradingPros/status/185001234567890">View post on X</a></blockquote>',
				'<p><a href="https://revolutiontradingpros.com/courses" target="_blank" rel="noopener noreferrer"><img src="https://revolutiontradingpros.com/media/setup-800w.webp" alt="Setup chart" width="800" height="450"></a></p>'
			].join('')
		);

		const sanitized = sanitizePostHtml(editor.getHTML());
		const reloaded = createHeadlessEditor(sanitized);
		const reloadedHtml = reloaded.getHTML();

		expect(reloadedHtml).toContain('data-callout-type="warning"');
		expect(reloadedHtml).toContain('data-vimeo-id="555666777"');
		expect(reloadedHtml).toContain(
			'data-tweet-url="https://x.com/RevTradingPros/status/185001234567890"'
		);
		expect(reloadedHtml).toContain('href="https://revolutiontradingpros.com/courses"');
		expect(reloadedHtml).toContain('class="blog-image"');

		editor.destroy();
		reloaded.destroy();
	});
});
