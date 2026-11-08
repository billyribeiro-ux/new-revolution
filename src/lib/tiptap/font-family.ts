import { Extension } from '@tiptap/core';
import '@tiptap/extension-text-style';

export interface EditorFontOption {
	label: string;
	value: string;
}

import { BRAND_FONT_BODY, BRAND_FONT_DISPLAY, normalizeBrandFont } from '../shared/brand-font';

/** Both families are bundled once by app.css and served statically from our origin. */
export const EDITOR_FONT_FAMILIES: readonly EditorFontOption[] = [
	{ label: 'Geist Sans (Body)', value: BRAND_FONT_BODY },
	{ label: 'Geist Mono (Display)', value: BRAND_FONT_DISPLAY }
] as const;

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		fontFamily: {
			setFontFamily: (fontFamily: string) => ReturnType;
			unsetFontFamily: () => ReturnType;
		};
	}
}

export const FontFamily = Extension.create({
	name: 'fontFamily',

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
					fontFamily: {
						default: null,
						parseHTML: (element) => {
							const raw = element.style.fontFamily?.trim();
							return normalizeBrandFont(raw);
						},
						renderHTML: (attributes) => {
							const family = normalizeBrandFont(attributes.fontFamily);
							return family ? { style: `font-family: ${family}` } : {};
						}
					}
				}
			}
		];
	},

	addCommands() {
		return {
			setFontFamily:
				(fontFamily: string) =>
				({ chain }) => {
					const clean = normalizeBrandFont(fontFamily);
					if (!clean) return false;
					return chain().setMark('textStyle', { fontFamily: clean }).run();
				},
			unsetFontFamily:
				() =>
				({ chain }) => {
					return chain().setMark('textStyle', { fontFamily: null }).removeEmptyTextStyle().run();
				}
		};
	}
});
