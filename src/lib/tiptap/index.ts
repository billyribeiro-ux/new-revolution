import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Typography from '@tiptap/extension-typography';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import CharacterCount from '@tiptap/extension-character-count';
import Youtube from '@tiptap/extension-youtube';
import type { AnyExtension } from '@tiptap/core';

import { ImageWithDimensions } from './image-with-dimensions';
import { Callout } from './callout';
import { Vimeo } from './vimeo';
import { Tweet } from './tweet';
import { FontSize } from './font-size';
import { FontFamily } from './font-family';
import { BlockStyle } from './block-style';
import { FindAndReplace } from './find-replace';

export const CODE_BLOCK_LANGUAGES = [
	{ value: 'plaintext', label: 'Plain Text' },
	{ value: 'typescript', label: 'TypeScript' },
	{ value: 'javascript', label: 'JavaScript' },
	{ value: 'python', label: 'Python' },
	{ value: 'sql', label: 'SQL' },
	{ value: 'json', label: 'JSON' },
	{ value: 'bash', label: 'Bash / Shell' },
	{ value: 'html', label: 'HTML' },
	{ value: 'css', label: 'CSS' }
] as const;

export interface CreateBlogExtensionsOptions {
	placeholder?: string;
}

/**
 * Exact TipTap 3 extension registration order specified in Section 10.1.
 */
export function createBlogEditorExtensions(
	options: CreateBlogExtensionsOptions = {}
): AnyExtension[] {
	const placeholderText = options.placeholder ?? 'Write your article or type "/" for commands...';

	return [
		StarterKit.configure({
			heading: { levels: [2, 3, 4] },
			link: false,
			underline: false
		}),
		ImageWithDimensions.configure({
			inline: false,
			allowBase64: false,
			HTMLAttributes: {
				class: 'editor-image',
				loading: 'lazy'
			}
		}),
		Link.configure({
			openOnClick: false,
			autolink: true,
			linkOnPaste: true,
			HTMLAttributes: {
				class: 'editor-link'
			}
		}),
		Placeholder.configure({
			placeholder: placeholderText,
			emptyEditorClass: 'is-editor-empty'
		}),
		Underline,
		TextAlign.configure({
			types: ['heading', 'paragraph']
		}),
		Highlight.configure({
			multicolor: true
		}),
		TextStyle,
		Color,
		FontSize,
		FontFamily,
		BlockStyle,
		Subscript,
		Superscript,
		Typography,
		TaskList,
		TaskItem.configure({
			nested: true
		}),
		Table.configure({
			resizable: true
		}),
		TableRow,
		TableHeader,
		TableCell,
		CharacterCount,
		Youtube.configure({
			inline: false,
			width: 640,
			height: 360,
			nocookie: true,
			HTMLAttributes: {
				class: 'youtube-embed'
			}
		}),
		Callout,
		Vimeo,
		Tweet,
		FindAndReplace
	];
}

export {
	ImageWithDimensions,
	Callout,
	Vimeo,
	Tweet,
	FontSize,
	FontFamily,
	BlockStyle,
	FindAndReplace
};
