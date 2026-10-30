import Image from '@tiptap/extension-image';

export const ImageWithDimensions = Image.extend({
	name: 'image',

	addAttributes() {
		return {
			...this.parent?.(),
			width: {
				default: null,
				parseHTML: (element) => {
					const attr = element.getAttribute('width');
					if (!attr) return null;
					const parsed = Number.parseInt(attr, 10);
					return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
				},
				renderHTML: (attributes) => {
					if (!attributes.width) return {};
					return { width: String(attributes.width) };
				}
			},
			height: {
				default: null,
				parseHTML: (element) => {
					const attr = element.getAttribute('height');
					if (!attr) return null;
					const parsed = Number.parseInt(attr, 10);
					return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
				},
				renderHTML: (attributes) => {
					if (!attributes.height) return {};
					return { height: String(attributes.height) };
				}
			},
			align: {
				default: 'center',
				parseHTML: (element) => element.getAttribute('data-align') || 'center',
				renderHTML: (attributes) => {
					const align = attributes.align || 'center';
					return { 'data-align': align };
				}
			},
			caption: {
				default: null,
				parseHTML: (element) => element.getAttribute('data-caption') || null,
				renderHTML: (attributes) => {
					if (!attributes.caption) return {};
					return { 'data-caption': String(attributes.caption) };
				}
			},
			size: {
				default: 'full',
				parseHTML: (element) => element.getAttribute('data-size') || 'full',
				renderHTML: (attributes) => {
					if (!attributes.size) return {};
					return { 'data-size': String(attributes.size) };
				}
			},
			mediaId: {
				default: null,
				parseHTML: (element) => element.getAttribute('data-media-id') || null,
				renderHTML: (attributes) => {
					if (!attributes.mediaId) return {};
					return { 'data-media-id': String(attributes.mediaId) };
				}
			}
		};
	}
});
