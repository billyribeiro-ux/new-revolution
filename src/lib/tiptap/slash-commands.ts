import type { Editor } from '@tiptap/core';

export interface SlashCommandItem {
	id: string;
	title: string;
	description: string;
	keywords: string[];
	execute: (
		editor: Editor,
		hooks?: {
			openMediaModal?: () => void;
			openEmbedDialog?: (kind: 'youtube' | 'vimeo' | 'tweet') => void;
		}
	) => void;
}

export const SLASH_COMMAND_ITEMS: readonly SlashCommandItem[] = [
	{
		id: 'h2',
		title: 'Heading 2',
		description: 'Major section heading',
		keywords: ['h2', 'heading', 'title', 'section'],
		execute: (editor) => {
			editor.chain().focus().toggleHeading({ level: 2 }).run();
		}
	},
	{
		id: 'h3',
		title: 'Heading 3',
		description: 'Subsection heading',
		keywords: ['h3', 'subheading', 'heading'],
		execute: (editor) => {
			editor.chain().focus().toggleHeading({ level: 3 }).run();
		}
	},
	{
		id: 'h4',
		title: 'Heading 4',
		description: 'Minor topic heading',
		keywords: ['h4', 'heading'],
		execute: (editor) => {
			editor.chain().focus().toggleHeading({ level: 4 }).run();
		}
	},
	{
		id: 'bullet-list',
		title: 'Bullet List',
		description: 'Unordered list with bullet points',
		keywords: ['ul', 'bullet', 'list'],
		execute: (editor) => {
			editor.chain().focus().toggleBulletList().run();
		}
	},
	{
		id: 'ordered-list',
		title: 'Numbered List',
		description: 'Ordered list with numbers',
		keywords: ['ol', 'ordered', 'numbered', 'list'],
		execute: (editor) => {
			editor.chain().focus().toggleOrderedList().run();
		}
	},
	{
		id: 'task-list',
		title: 'Task Checklist',
		description: 'Interactive checklist items',
		keywords: ['todo', 'task', 'checklist', 'checkbox'],
		execute: (editor) => {
			editor.chain().focus().toggleTaskList().run();
		}
	},
	{
		id: 'blockquote',
		title: 'Blockquote',
		description: 'Editorial pull quote block',
		keywords: ['quote', 'blockquote', 'citation'],
		execute: (editor) => {
			editor.chain().focus().toggleBlockquote().run();
		}
	},
	{
		id: 'callout-info',
		title: 'Callout (Info)',
		description: 'Highlighted informational note',
		keywords: ['callout', 'info', 'note', 'box'],
		execute: (editor) => {
			editor.chain().focus().toggleCallout({ type: 'info' }).run();
		}
	},
	{
		id: 'callout-tip',
		title: 'Callout (Tip)',
		description: 'Actionable trading tip or best practice',
		keywords: ['callout', 'tip', 'pro'],
		execute: (editor) => {
			editor.chain().focus().toggleCallout({ type: 'tip' }).run();
		}
	},
	{
		id: 'callout-warning',
		title: 'Callout (Warning)',
		description: 'Risk warning or caution callout',
		keywords: ['callout', 'warning', 'caution', 'risk'],
		execute: (editor) => {
			editor.chain().focus().toggleCallout({ type: 'warning' }).run();
		}
	},
	{
		id: 'callout-danger',
		title: 'Callout (Danger)',
		description: 'Critical stop-loss or compliance alert',
		keywords: ['callout', 'danger', 'alert'],
		execute: (editor) => {
			editor.chain().focus().toggleCallout({ type: 'danger' }).run();
		}
	},
	{
		id: 'code-block',
		title: 'Code Block',
		description: 'Syntax-highlighted code snippet',
		keywords: ['code', 'pre', 'snippet', 'script'],
		execute: (editor) => {
			editor.chain().focus().toggleCodeBlock().run();
		}
	},
	{
		id: 'table',
		title: 'Table (3x3)',
		description: 'Insert a 3x3 data table with header row',
		keywords: ['table', 'grid', 'spreadsheet'],
		execute: (editor) => {
			editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
		}
	},
	{
		id: 'image',
		title: 'Image from Media Library',
		description: 'Browse or upload responsive WebP images',
		keywords: ['image', 'photo', 'picture', 'media', 'chart'],
		execute: (_editor, hooks) => {
			hooks?.openMediaModal?.();
		}
	},
	{
		id: 'youtube',
		title: 'YouTube Video',
		description: 'Embed a privacy-enhanced YouTube video',
		keywords: ['youtube', 'video', 'embed'],
		execute: (_editor, hooks) => {
			hooks?.openEmbedDialog?.('youtube');
		}
	},
	{
		id: 'vimeo',
		title: 'Vimeo Video',
		description: 'Embed a Vimeo video player',
		keywords: ['vimeo', 'video', 'embed'],
		execute: (_editor, hooks) => {
			hooks?.openEmbedDialog?.('vimeo');
		}
	},
	{
		id: 'tweet',
		title: 'X / Post Embed',
		description: 'Embed a post from X (Twitter)',
		keywords: ['tweet', 'twitter', 'x', 'social', 'embed'],
		execute: (_editor, hooks) => {
			hooks?.openEmbedDialog?.('tweet');
		}
	},
	{
		id: 'divider',
		title: 'Horizontal Divider',
		description: 'Visual section break line',
		keywords: ['hr', 'divider', 'rule', 'line'],
		execute: (editor) => {
			editor.chain().focus().setHorizontalRule().run();
		}
	}
] as const;

export function filterSlashCommands(query: string): SlashCommandItem[] {
	const q = query.trim().toLowerCase();
	if (!q) return [...SLASH_COMMAND_ITEMS];
	return SLASH_COMMAND_ITEMS.filter(
		(item) =>
			item.title.toLowerCase().includes(q) ||
			item.description.toLowerCase().includes(q) ||
			item.keywords.some((k) => k.includes(q))
	);
}
