import { Extension } from '@tiptap/core';
import '@tiptap/extension-text-style';

export interface EditorFontOption {
	label: string;
	value: string;
}

/**
 * Self-hosted Fontsource variable families and system stacks (AGENTS.md Section 1).
 *Zero runtime dependencies on Google Fonts or external font CDNs.
 */
export const EDITOR_FONT_FAMILIES: readonly EditorFontOption[] = [
	{
		label: 'Sofia Sans (Body)',
		value: "'Sofia Sans Variable', system-ui, -apple-system, sans-serif"
	},
	{
		label: 'Montserrat (Display)',
		value: "'Montserrat Variable', system-ui, -apple-system, sans-serif"
	},
	{
		label: 'Editorial Serif',
		value: "Georgia, 'Times New Roman', serif"
	},
	{
		label: 'Monospace Code',
		value: "ui-monospace, 'SFMono-Regular', Menlo, Monaco, Consolas, monospace"
	},
	{
		label: 'System UI',
		value: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
	}
] as const;

const SAFE_FONT_FAMILY_RE = /^[A-Za-z0-9\s,'"-]+$/;

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
							return raw && SAFE_FONT_FAMILY_RE.test(raw) ? raw : null;
						},
						renderHTML: (attributes) => {
							if (
								!attributes.fontFamily ||
								!SAFE_FONT_FAMILY_RE.test(String(attributes.fontFamily))
							) {
								return {};
							}
							return {
								style: `font-family: ${attributes.fontFamily}`
							};
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
					const clean = fontFamily.trim();
					if (!SAFE_FONT_FAMILY_RE.test(clean)) return false;
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
