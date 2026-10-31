import { afterEach, describe, expect, it } from 'vitest';
import { Editor } from '@tiptap/core';
import { createBlogEditorExtensions } from './index';
import {
	buildInsertedImageAttrs,
	mapPickerAlign,
	replaceImageAt,
	resizedImageDims,
	selectedImageTarget
} from './image-actions';
import { sanitizePostHtml } from '../sanitize-post-html';

let editor: Editor | undefined;
afterEach(() => {
	editor?.destroy();
	editor = undefined;
	document.body.replaceChildren();
});

function mount(content: string, onImageAltActivate?: (pos: number) => void) {
	const element = document.createElement('div');
	document.body.append(element);
	editor = new Editor({
		element,
		extensions: createBlogEditorExtensions({ onImageAltActivate }),
		content
	});
	return editor;
}

function imageAttrs(ed: Editor) {
	const out: Record<string, unknown>[] = [];
	ed.state.doc.descendants((n) => {
		if (n.type.name === 'image') out.push(n.attrs);
	});
	return out;
}

describe('mapPickerAlign (every value the picker emits)', () => {
	it('keeps left/center/right/full and maps anything else to null', () => {
		expect(mapPickerAlign('left')).toBe('left');
		expect(mapPickerAlign('center')).toBe('center');
		expect(mapPickerAlign('right')).toBe('right');
		expect(mapPickerAlign('full')).toBe('full');
		expect(mapPickerAlign('none')).toBeNull();
		expect(mapPickerAlign(undefined)).toBeNull();
	});
});

describe('Full Width alignment', () => {
	it('is stored on the node, rendered as data-align="full", and survives server sanitisation', () => {
		const ed = mount('<p>x</p>');
		const attrs = buildInsertedImageAttrs({
			url: 'https://cdn.test/a-1200w.webp',
			alt: '',
			width: 1200,
			height: 675,
			align: 'full'
		});
		ed.chain().insertContent({ type: 'image', attrs }).run();
		const html = ed.getHTML();
		expect(html).toContain('data-align="full"');
		expect(html).toContain('width="1200"');
		expect(html).toContain('height="675"');
		expect(html).toContain('alt=""');
		const clean = sanitizePostHtml(html);
		expect(clean).toContain('data-align="full"');
		// Reloading the saved HTML keeps it.
		ed.commands.setContent(clean);
		expect(imageAttrs(ed)[0]?.['dataAlign']).toBe('full');
	});
});

describe('alt is never invented', () => {
	it('keeps an empty picker alt empty on insert', () => {
		expect(buildInsertedImageAttrs({ url: 'https://cdn.test/a.webp', alt: '' }).alt).toBe('');
	});

	it('marks images without alt with a visible chip and class, outside the saved HTML', () => {
		const activated: number[] = [];
		const ed = mount(
			'<img src="https://cdn.test/a.webp" width="10" height="10"><img src="https://cdn.test/b.webp" alt="Has alt">',
			(pos) => activated.push(pos)
		);
		const chips = ed.view.dom.querySelectorAll('button.image-alt-chip');
		expect(chips).toHaveLength(1);
		expect(chips[0]?.textContent).toBe('Add alt text');
		expect(ed.view.dom.querySelectorAll('img.is-missing-alt')).toHaveLength(1);
		expect(ed.getHTML()).not.toContain('image-alt-chip');
		expect(ed.getHTML()).not.toContain('is-missing-alt');
		(chips[0] as HTMLButtonElement).click();
		expect(activated).toEqual([0]);
	});

	it('clears the chip once alt text is set', () => {
		const ed = mount('<img src="https://cdn.test/a.webp">');
		ed.commands.setNodeSelection(0);
		ed.chain().updateAttributes('image', { alt: 'A chart' }).run();
		expect(ed.view.dom.querySelectorAll('button.image-alt-chip')).toHaveLength(0);
	});
});

describe('resizedImageDims keeps the aspect ratio', () => {
	it('updates height along with width for each preset', () => {
		const current = { width: 1200, height: 675 };
		expect(resizedImageDims(current, null, 320)).toEqual({ width: 320, height: 180 });
		expect(resizedImageDims(current, null, 480)).toEqual({ width: 480, height: 270 });
		expect(resizedImageDims(current, null, 800)).toEqual({ width: 800, height: 450 });
	});
	it('100% restores the natural size, and presets never exceed it', () => {
		const natural = { width: 1200, height: 675 };
		expect(resizedImageDims({ width: 320, height: 180 }, natural, null)).toEqual({
			width: 1200,
			height: 675
		});
		expect(resizedImageDims({ width: 320, height: 180 }, { width: 600, height: 300 }, 800)).toEqual(
			{
				width: 600,
				height: 300
			}
		);
	});
	it('clears both attributes rather than leaving a stale pair when the ratio is unknown', () => {
		expect(resizedImageDims({ width: null, height: null }, null, 480)).toEqual({
			width: null,
			height: null
		});
		expect(resizedImageDims({ width: 320, height: 180 }, null, null)).toEqual({
			width: null,
			height: null
		});
	});
});

describe('replaceImageAt (Replace image via the picker)', () => {
	const picked = {
		url: 'https://cdn.test/new-1200w.webp',
		alt: 'Picker alt',
		width: 1200,
		height: 600,
		size: 'large',
		mediaId: 'media-new'
	};

	it('swaps src/dimensions/mediaId and keeps the existing alt, title, alignment, caption and link', () => {
		const ed = mount(
			'<figure class="blog-image-figure"><a href="https://example.com/x" target="_blank" rel="noopener noreferrer"><img src="https://cdn.test/old.webp" alt="Original alt" title="Original title" width="320" height="180" data-align="right" data-media-id="old"></a><figcaption>Cap</figcaption></figure><img src="https://cdn.test/two.webp" alt="Two">'
		);
		ed.commands.setNodeSelection(0);
		const target = selectedImageTarget(ed)!;
		expect(replaceImageAt(ed, target.pos, target.src, picked)).toBe(true);
		const [first, second] = imageAttrs(ed);
		expect(first).toMatchObject({
			src: 'https://cdn.test/new-1200w.webp',
			alt: 'Original alt',
			title: 'Original title',
			width: 1200,
			height: 600,
			dataAlign: 'right',
			caption: 'Cap',
			linkHref: 'https://example.com/x',
			mediaId: 'media-new'
		});
		expect(second?.['src']).toBe('https://cdn.test/two.webp');
	});

	it('takes the picker alt only when the image had none', () => {
		const ed = mount('<img src="https://cdn.test/old.webp">');
		ed.commands.setNodeSelection(0);
		const target = selectedImageTarget(ed)!;
		replaceImageAt(ed, target.pos, target.src, picked);
		expect(imageAttrs(ed)[0]?.['alt']).toBe('Picker alt');
	});

	it('refuses when the image at that position is no longer the same image', () => {
		const ed = mount('<img src="https://cdn.test/old.webp" alt="a"><p>end</p>');
		ed.commands.setNodeSelection(0);
		const target = selectedImageTarget(ed)!;
		ed.commands.deleteSelection();
		expect(replaceImageAt(ed, target.pos, target.src, picked)).toBe(false);
		expect(ed.getHTML()).not.toContain('new-1200w');
	});
});
