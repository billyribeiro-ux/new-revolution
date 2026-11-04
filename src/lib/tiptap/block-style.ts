import { Extension } from '@tiptap/core';

export interface BlockStyleAttrs {
	backgroundColor?: string | null;
	borderColor?: string | null;
	padding?: string | null;
	borderRadius?: string | null;
}

const SAFE_COLOR_RE =
	/^(?:#[0-9a-fA-F]{3,8}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)|hsla?\([^)]+\))$/;
const SAFE_DIMENSION_RE =
	/^(?:\d{1,3}(?:\.\d+)?(?:px|rem|em|%))(?:\s+\d{1,3}(?:\.\d+)?(?:px|rem|em|%)){0,3}$/;

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		blockStyle: {
			setBlockStyle: (attrs: BlockStyleAttrs) => ReturnType;
			unsetBlockStyle: () => ReturnType;
		};
	}
}

export const BlockStyle = Extension.create({
	name: 'blockStyle',

	addOptions() {
		return {
			types: ['paragraph', 'heading', 'blockquote', 'callout']
		};
	},

	addGlobalAttributes() {
		return [
			{
				types: this.options.types,
				attributes: {
					backgroundColor: {
						default: null,
						parseHTML: (element) =>
							element.getAttribute('data-bg-color') || element.style.backgroundColor || null,
						renderHTML: (attrs) => {
							if (!attrs.backgroundColor || !SAFE_COLOR_RE.test(String(attrs.backgroundColor))) {
								return {};
							}
							return {
								'data-bg-color': String(attrs.backgroundColor),
								style: `background-color: ${attrs.backgroundColor}`
							};
						}
					},
					borderColor: {
						default: null,
						parseHTML: (element) =>
							element.getAttribute('data-border-color') || element.style.borderColor || null,
						renderHTML: (attrs) => {
							if (!attrs.borderColor || !SAFE_COLOR_RE.test(String(attrs.borderColor))) {
								return {};
							}
							return {
								'data-border-color': String(attrs.borderColor),
								style: `border-left: 4px solid ${attrs.borderColor}`
							};
						}
					},
					padding: {
						default: null,
						parseHTML: (element) =>
							element.getAttribute('data-padding') || element.style.padding || null,
						renderHTML: (attrs) => {
							if (!attrs.padding || !SAFE_DIMENSION_RE.test(String(attrs.padding))) {
								return {};
							}
							return {
								'data-padding': String(attrs.padding),
								style: `padding: ${attrs.padding}`
							};
						}
					},
					borderRadius: {
						default: null,
						parseHTML: (element) =>
							element.getAttribute('data-border-radius') || element.style.borderRadius || null,
						renderHTML: (attrs) => {
							if (!attrs.borderRadius || !SAFE_DIMENSION_RE.test(String(attrs.borderRadius))) {
								return {};
							}
							return {
								'data-border-radius': String(attrs.borderRadius),
								style: `border-radius: ${attrs.borderRadius}`
							};
						}
					}
				}
			}
		];
	},

	addCommands() {
		return {
			setBlockStyle:
				(attrs) =>
				({ state, tr, dispatch }) => {
					const { from, to } = state.selection;
					let modified = false;
					state.doc.nodesBetween(from, to, (node, pos) => {
						if (this.options.types.includes(node.type.name)) {
							tr.setNodeMarkup(pos, undefined, {
								...node.attrs,
								...attrs
							});
							modified = true;
						}
					});
					if (modified && dispatch) {
						dispatch(tr);
					}
					return modified;
				},
			unsetBlockStyle:
				() =>
				({ state, tr, dispatch }) => {
					const { from, to } = state.selection;
					let modified = false;
					state.doc.nodesBetween(from, to, (node, pos) => {
						if (this.options.types.includes(node.type.name)) {
							tr.setNodeMarkup(pos, undefined, {
								...node.attrs,
								backgroundColor: null,
								borderColor: null,
								padding: null,
								borderRadius: null
							});
							modified = true;
						}
					});
					if (modified && dispatch) {
						dispatch(tr);
					}
					return modified;
				}
		};
	}
});
