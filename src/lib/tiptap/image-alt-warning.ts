import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const IMAGE_ALT_WARNING_LABEL = 'Add alt text';

export interface ImageAltWarningOptions {
	/** Called with the image node position when the author activates the chip. */
	onActivate: (position: number) => void;
}

export const imageAltWarningKey = new PluginKey<DecorationSet>('imageAltWarning');

/**
 * Editor-only warning for images without alt text. Alt is never invented, so an image with an
 * empty alt gets a visible chip (a widget decoration) and an `is-missing-alt` class. Decorations
 * are not part of the document, so nothing here reaches `getHTML()` or the saved post.
 */
export const ImageAltWarning = Extension.create<ImageAltWarningOptions>({
	name: 'imageAltWarning',

	addOptions() {
		return { onActivate: () => {} };
	},

	addProseMirrorPlugins() {
		const { onActivate } = this.options;
		return [
			new Plugin<DecorationSet>({
				key: imageAltWarningKey,
				state: {
					init: (_config, state) => build(state.doc, onActivate),
					apply: (tr, previous, _old, state) =>
						tr.docChanged ? build(state.doc, onActivate) : previous
				},
				props: {
					decorations(state) {
						return imageAltWarningKey.getState(state);
					}
				}
			})
		];
	}
});

function build(
	doc: import('@tiptap/pm/model').Node,
	onActivate: (position: number) => void
): DecorationSet {
	const decorations: Decoration[] = [];
	doc.descendants((node, pos) => {
		if (node.type.name !== 'image') return;
		const alt = typeof node.attrs['alt'] === 'string' ? node.attrs['alt'].trim() : '';
		if (alt) return;
		decorations.push(Decoration.node(pos, pos + node.nodeSize, { class: 'is-missing-alt' }));
		decorations.push(
			Decoration.widget(
				pos,
				() => {
					const chip = document.createElement('button');
					chip.type = 'button';
					chip.className = 'image-alt-chip';
					chip.contentEditable = 'false';
					chip.textContent = IMAGE_ALT_WARNING_LABEL;
					chip.setAttribute('aria-label', `${IMAGE_ALT_WARNING_LABEL}: this image has no alt text`);
					// mousedown must not move the editor selection before the click handler runs.
					chip.addEventListener('mousedown', (event) => event.preventDefault());
					chip.addEventListener('click', (event) => {
						event.preventDefault();
						onActivate(pos);
					});
					return chip;
				},
				{ side: -1, key: `alt-chip-${pos}`, ignoreSelection: true }
			)
		);
	});
	return DecorationSet.create(doc, decorations);
}
