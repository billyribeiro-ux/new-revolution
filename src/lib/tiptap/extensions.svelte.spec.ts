import { describe, expect, it } from 'vitest';
import { Editor } from '@tiptap/core';
import { createBlogEditorExtensions } from './index';
import { extractVimeoId, buildVimeoEmbedUrl } from './vimeo';
import { normalizeTweetUrl } from './tweet';
import { filterSlashCommands } from './slash-commands';

function createHeadlessEditor(initialContent = '<p>Hello world</p>'): Editor {
	return new Editor({
		extensions: createBlogEditorExtensions(),
		content: initialContent
	});
}

describe('TipTap 3 Custom Extensions Suite', () => {
	it('preserves ImageWithDimensions attributes (width, height, data-align, data-caption, data-size) on round-trip', () => {
		const html =
			'<p>Intro</p><img src="https://revolutiontradingpros.com/media/spx-800w.webp" alt="SPX breakout" width="800" height="450" data-align="left" data-caption="Daily SPX chart" data-size="medium" data-media-id="media-123">';
		const editor = createHeadlessEditor(html);
		const out = editor.getHTML();

		expect(out).toContain('width="800"');
		expect(out).toContain('height="450"');
		expect(out).toContain('data-align="left"');
		expect(out).toContain('data-caption="Daily SPX chart"');
		expect(out).toContain('data-size="medium"');
		expect(out).toContain('data-media-id="media-123"');
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
});
