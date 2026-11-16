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
import { DOMParser as ProseMirrorDOMParser } from '@tiptap/pm/model';
import { TextSelection } from '@tiptap/pm/state';
import type { AnyExtension, Editor } from '@tiptap/core';

import { ImageWithDimensions } from './image-with-dimensions';
import { Callout } from './callout';
import { Vimeo } from './vimeo';
import { Tweet } from './tweet';
import { FontSize } from './font-size';
import { FontFamily } from './font-family';
import { BlockStyle } from './block-style';
import { FindAndReplace } from './find-replace';
import { ImageAltWarning } from './image-alt-warning';

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
	/** When set, images without alt text get an editor-only "Add alt text" chip that calls this. */
	onImageAltActivate?: (position: number) => void;
}

export function resolveEditorLinkAttributes(options: {
	href: string;
	newTab: boolean;
	nofollow: boolean;
}): { href: string; target: string | null; rel: string | null } {
	const href = options.href.trim();
	const target = options.newTab ? '_blank' : null;
	const relParts: string[] = [];
	if (options.newTab) {
		relParts.push('noopener', 'noreferrer');
	}
	if (options.nofollow) {
		relParts.push('nofollow');
	}
	const rel = relParts.length > 0 ? relParts.join(' ') : null;
	return { href, target, rel };
}

/**
 * Syncs external HTML into a TipTap editor by replacing only the ProseMirror diff range
 * (`findDiffStart` / `findDiffEnd`) with `preventUpdate: true` so the user's caret is preserved.
 */
export function syncEditorContent(editor: Editor, nextHtml: string): boolean {
	const normalized = nextHtml || '<p></p>';
	if (editor.getHTML() === normalized) {
		return false;
	}

	const container = document.createElement('div');
	container.innerHTML = normalized;
	const nextDoc = ProseMirrorDOMParser.fromSchema(editor.schema).parse(container);
	const currentDoc = editor.state.doc;

	const diffStart = currentDoc.content.findDiffStart(nextDoc.content);
	if (diffStart === null) {
		return false;
	}
	const diffEnd = currentDoc.content.findDiffEnd(nextDoc.content);
	if (!diffEnd) {
		return false;
	}

	let { a: endA, b: endB } = diffEnd;
	const overlap = diffStart - Math.min(endA, endB);
	if (overlap > 0) {
		endA += overlap;
		endB += overlap;
	}

	const prevAnchor = editor.state.selection.anchor;
	const prevHead = editor.state.selection.head;

	const slice = nextDoc.slice(diffStart, endB);
	const tr = editor.state.tr
		.replace(diffStart, endA, slice)
		.setMeta('preventUpdate', true)
		.setMeta('addToHistory', false);

	if (prevHead <= diffStart || (endA === endB && prevHead <= tr.doc.content.size)) {
		const clampedAnchor = Math.min(Math.max(1, prevAnchor), tr.doc.content.size);
		const clampedHead = Math.min(Math.max(1, prevHead), tr.doc.content.size);
		try {
			tr.setSelection(TextSelection.create(tr.doc, clampedAnchor, clampedHead));
		} catch {
			// Keep mapped selection if clamped offset is not a text position
		}
	}

	editor.view.dispatch(tr);
	return true;
}

/**
 * Exact TipTap 3 extension registration order specified in Section 6.1.
 */
export function createBlogEditorExtensions(
	options: CreateBlogExtensionsOptions = {}
): AnyExtension[] {
	const placeholderText = options.placeholder ?? 'Start writing your blog post...';

	return [
		StarterKit.configure({
			heading: { levels: [1, 2, 3, 4, 5, 6] },
			link: false,
			underline: false
		}),
		Underline,
		Link.configure({
			openOnClick: false,
			autolink: true,
			linkOnPaste: true,
			HTMLAttributes: {
				target: null,
				rel: null,
				class: null
			}
		}),
		ImageWithDimensions.configure({
			inline: false,
			allowBase64: false,
			HTMLAttributes: {
				class: 'blog-image',
				loading: 'lazy'
			}
		}),
		Placeholder.configure({
			placeholder: placeholderText,
			emptyEditorClass: 'is-editor-empty'
		}),
		TextAlign.configure({
			types: ['heading', 'paragraph', 'image'],
			alignments: ['left', 'center', 'right', 'justify']
		}),
		Highlight.configure({
			multicolor: true
		}),
		Superscript,
		Subscript,
		Table.configure({
			resizable: true
		}),
		TableRow,
		TableCell,
		TableHeader,
		Typography,
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
		TextStyle,
		Color,
		FontSize,
		FontFamily,
		BlockStyle,
		TaskList,
		TaskItem.configure({
			nested: true
		}),
		Callout,
		Vimeo,
		Tweet,
		FindAndReplace,
		...(options.onImageAltActivate
			? [ImageAltWarning.configure({ onActivate: options.onImageAltActivate })]
			: [])
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
