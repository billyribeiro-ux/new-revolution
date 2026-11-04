import { Extension } from '@tiptap/core';
import '@tiptap/extension-text-style';

export const EDITOR_FONT_SIZES = [
	'12px',
	'14px',
	'15px',
	'16px',
	'18px',
	'20px',
	'24px',
	'28px',
	'32px',
	'36px',
	'42px',
	'48px'
] as const;

const SAFE_FONT_SIZE_RE = /^(?:\d{1,3}(?:\.\d+)?px|[0-9]+(?:\.[0-9]+)?(?:rem|em))$/i;

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		fontSize: {
			setFontSize: (fontSize: string) => ReturnType;
			unsetFontSize: () => ReturnType;
		};
	}
}

export const FontSize = Extension.create({
	name: 'fontSize',

	addOptions() {
		return {
			types: ['textStyle']
		};
	},

	addGlobalAttributes() {
		return [
			{
				types: this.options.types,
				attributes: {
					fontSize: {
						default: null,
						parseHTML: (element) => {
							const raw = element.style.fontSize?.trim();
							return raw && SAFE_FONT_SIZE_RE.test(raw) ? raw : null;
						},
						renderHTML: (attributes) => {
							if (!attributes.fontSize || !SAFE_FONT_SIZE_RE.test(String(attributes.fontSize))) {
								return {};
							}
							return {
								style: `font-size: ${attributes.fontSize}`
							};
						}
					}
				}
			}
		];
	},

	addCommands() {
		return {
			setFontSize:
				(fontSize: string) =>
				({ chain }) => {
					const clean = fontSize.trim();
					if (!SAFE_FONT_SIZE_RE.test(clean)) return false;
					return chain().setMark('textStyle', { fontSize: clean }).run();
				},
			unsetFontSize:
				() =>
				({ chain }) => {
					return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
				}
		};
	}
});
