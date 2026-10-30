<script lang="ts">
	import { untrack } from 'svelte';
	import { Editor } from '@tiptap/core';
	import { sanitizePostHtml } from '#lib/sanitize-post-html';
	import { computeReadingTime, countContentWords } from '#lib/shared/seo/toc';
	import { createBlogEditorExtensions, CODE_BLOCK_LANGUAGES } from '#lib/tiptap/index';
	import { EDITOR_FONT_SIZES } from '#lib/tiptap/font-size';
	import { EDITOR_FONT_FAMILIES } from '#lib/tiptap/font-family';
	import { CALLOUT_TYPES, type CalloutType } from '#lib/tiptap/callout';
	import { filterSlashCommands, type SlashCommandItem } from '#lib/tiptap/slash-commands';
	import '#lib/styles/prose.css';

	interface Props {
		content: string;
		placeholder?: string;
		onChange: (html: string) => void;
		onStatsChange?: (stats: { words: number; chars: number; readingTime: number }) => void;
		onOpenMediaPicker?: (
			callback: (payload: {
				url: string;
				alt: string;
				width?: number | null;
				height?: number | null;
				caption?: string;
				size?: string;
				align?: string;
				mediaId?: string;
			}) => void
		) => void;
	}

	let {
		content,
		placeholder = 'Write your article or type "/" for commands...',
		onChange,
		onStatsChange,
		onOpenMediaPicker
	}: Props = $props();

	let editor = $state.raw<Editor | null>(null);
	let editorVersion = $state(0);

	let showAdvancedToolbar = $state(false);
	let htmlSourceMode = $state(false);
	let rawHtmlBuffer = $state('');

	let activePopover = $state<
		null | 'link' | 'color' | 'highlight' | 'callout' | 'table' | 'blockStyle' | 'embed'
	>(null);

	let linkInputUrl = $state('');
	let embedKind = $state<'youtube' | 'vimeo' | 'tweet'>('youtube');
	let embedInputUrl = $state('');

	let blockBgColor = $state('#151a20');
	let blockBorderColor = $state('#dcff65');
	let blockPadding = $state('16px');
	let blockRadius = $state('8px');

	let findBarOpen = $state(false);
	let findQuery = $state('');
	let replaceQuery = $state('');
	let findCaseSensitive = $state(false);
	let findMatchCount = $state(0);
	let findCurrentIndex = $state(0);

	let slashMenuOpen = $state(false);
	let slashQuery = $state('');
	let slashRange = $state<{ from: number; to: number } | null>(null);
	let slashIndex = $state(0);

	let selectedImageAlt = $state('');
	let selectedImageCaption = $state('');
	let selectedImageAlign = $state<'left' | 'center' | 'right' | 'full'>('center');

	let uploadErrorBanner = $state('');
	let uploadingInlineImage = $state(false);

	let lastEmittedHtml = '';

	const TEXT_COLORS = [
		{ label: 'Default', value: '' },
		{ label: 'Acid Lime', value: '#dcff65' },
		{ label: 'Coral Red', value: '#ff7969' },
		{ label: 'Amber', value: '#dec3a1' },
		{ label: 'Muted Gray', value: '#a0a7ad' },
		{ label: 'Pure White', value: '#ffffff' }
	] as const;

	const HIGHLIGHT_COLORS = [
		{ label: 'None', value: '' },
		{ label: 'Acid Highlight', value: 'rgba(220, 255, 101, 0.25)' },
		{ label: 'Coral Highlight', value: 'rgba(255, 121, 105, 0.25)' },
		{ label: 'Amber Highlight', value: 'rgba(222, 195, 161, 0.25)' }
	] as const;

	let filteredSlashItems = $derived(filterSlashCommands(slashQuery));

	function syncStatsAndSelection(ed: Editor) {
		untrack(() => {
			editorVersion += 1;
			const html = ed.getHTML();
			const words = countContentWords(html);
			const chars = ed.storage.characterCount?.characters?.() ?? ed.state.doc.textContent.length;
			const readingTime = computeReadingTime(words);
			onStatsChange?.({ words, chars, readingTime });

			if (ed.storage.findAndReplace) {
				findMatchCount = ed.storage.findAndReplace.results?.length ?? 0;
				findCurrentIndex = ed.storage.findAndReplace.currentIndex ?? 0;
			}

			if (ed.isActive('image')) {
				const attrs = ed.getAttributes('image');
				selectedImageAlt = attrs.alt ?? '';
				selectedImageCaption = attrs.caption ?? '';
				selectedImageAlign = attrs.align ?? 'center';
			}

			// Detect slash command trigger at current cursor
			const { selection } = ed.state;
			if (selection.empty) {
				const resolvedFrom = selection.$from;
				const textBefore = resolvedFrom.parent.textBetween(
					0,
					resolvedFrom.parentOffset,
					undefined,
					'\ufffc'
				);
				const slashMatch = textBefore.match(/(?:^|\s)\/([a-zA-Z0-9-]*)$/);
				if (slashMatch && resolvedFrom.parent.type.name === 'paragraph') {
					const query = slashMatch[1] ?? '';
					const startPos = resolvedFrom.pos - query.length - 1;
					slashQuery = query;
					slashRange = { from: startPos, to: resolvedFrom.pos };
					slashMenuOpen = true;
					if (slashIndex >= filterSlashCommands(query).length) {
						slashIndex = 0;
					}
				} else {
					slashMenuOpen = false;
					slashRange = null;
				}
			} else {
				slashMenuOpen = false;
				slashRange = null;
			}
		});
	}

	async function uploadAndInsertFile(file: File) {
		uploadErrorBanner = '';
		uploadingInlineImage = true;
		try {
			const fd = new FormData();
			fd.set('file', file);
			const res = await fetch('/api/media/upload', {
				method: 'POST',
				body: fd
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				uploadErrorBanner = data.error ?? `Image upload failed (${res.status}).`;
				return;
			}
			const item = data.item ?? data;
			const url = item.urls?.original ?? data.url;
			if (editor && url) {
				editor
					.chain()
					.focus()
					.setImage({
						src: url,
						alt: item.alt_text || item.filename || 'Article image',
						title: item.title || undefined
					})
					.updateAttributes('image', {
						width: item.width ?? null,
						height: item.height ?? null,
						mediaId: item.id ?? null,
						align: 'center',
						size: 'full'
					})
					.run();
			}
		} catch (err) {
			uploadErrorBanner = err instanceof Error ? err.message : 'Network error uploading image.';
		} finally {
			uploadingInlineImage = false;
		}
	}

	function executeSlashCommand(item: SlashCommandItem) {
		if (!editor) return;
		if (slashRange) {
			editor.chain().focus().deleteRange(slashRange).run();
		}
		slashMenuOpen = false;
		slashRange = null;
		slashQuery = '';
		item.execute(editor, {
			openMediaModal: () => triggerMediaPicker(),
			openEmbedDialog: (kind) => {
				embedKind = kind;
				embedInputUrl = '';
				activePopover = 'embed';
			}
		});
	}

	function triggerMediaPicker() {
		if (onOpenMediaPicker) {
			onOpenMediaPicker((payload) => {
				if (!editor) return;
				editor
					.chain()
					.focus()
					.setImage({
						src: payload.url,
						alt: payload.alt || 'Article image'
					})
					.updateAttributes('image', {
						width: payload.width ?? null,
						height: payload.height ?? null,
						caption: payload.caption || null,
						size: payload.size || 'full',
						align: payload.align || 'center',
						mediaId: payload.mediaId || null
					})
					.run();
			});
		}
	}

	function mountEditor(container: HTMLElement) {
		const instance = untrack(
			() =>
				new Editor({
					element: container,
					extensions: createBlogEditorExtensions({ placeholder }),
					content: content || '<p></p>',
					editorProps: {
						attributes: {
							class: 'prose-base editor-canvas-inner',
							role: 'textbox',
							'aria-multiline': 'true',
							'aria-label': 'Post content'
						},
						transformPastedHTML(html) {
							return sanitizePostHtml(html);
						},
						handleDrop(_view, event, _slice, moved) {
							if (moved || !event.dataTransfer?.files?.length) return false;
							const file = event.dataTransfer.files[0];
							if (file && file.type.startsWith('image/')) {
								event.preventDefault();
								void uploadAndInsertFile(file);
								return true;
							}
							return false;
						},
						handlePaste(_view, event) {
							const files = event.clipboardData?.files;
							if (files && files.length > 0) {
								const file = files[0];
								if (file && file.type.startsWith('image/')) {
									event.preventDefault();
									void uploadAndInsertFile(file);
									return true;
								}
							}
							return false;
						},
						handleKeyDown(_view, event) {
							if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'f') {
								event.preventDefault();
								findBarOpen = true;
								return true;
							}

							if (slashMenuOpen) {
								const list = filterSlashCommands(slashQuery);
								if (event.key === 'ArrowDown') {
									if (list.length > 0) {
										event.preventDefault();
										slashIndex = (slashIndex + 1) % list.length;
										return true;
									}
								} else if (event.key === 'ArrowUp') {
									if (list.length > 0) {
										event.preventDefault();
										slashIndex = (slashIndex - 1 + list.length) % list.length;
										return true;
									}
								} else if (event.key === 'Enter') {
									if (list.length === 0) {
										slashMenuOpen = false;
										slashRange = null;
										return false;
									}
									const chosen = list[slashIndex] ?? list[0];
									if (chosen) {
										event.preventDefault();
										executeSlashCommand(chosen);
										return true;
									}
								} else if (event.key === 'Escape') {
									event.preventDefault();
									slashMenuOpen = false;
									slashRange = null;
									return true;
								}
							}
							return false;
						}
					},
					onUpdate({ editor: ed }) {
						const html = ed.getHTML();
						lastEmittedHtml = html;
						rawHtmlBuffer = html;
						onChange(html);
						syncStatsAndSelection(ed);
					},
					onSelectionUpdate({ editor: ed }) {
						syncStatsAndSelection(ed);
					}
				})
		);

		untrack(() => {
			editor = instance;
			lastEmittedHtml = instance.getHTML();
			rawHtmlBuffer = lastEmittedHtml;
			syncStatsAndSelection(instance);
		});

		return () => {
			instance.destroy();
			editor = null;
		};
	}

	function syncExternalContent(nextContent: string) {
		untrack(() => {
			if (editor && nextContent !== lastEmittedHtml) {
				lastEmittedHtml = nextContent;
				rawHtmlBuffer = nextContent;
				editor.commands.setContent(nextContent || '<p></p>', { emitUpdate: false });
				syncStatsAndSelection(editor);
			}
		});
	}

	function handlePopoverFocusOut(e: FocusEvent) {
		const currentTarget = e.currentTarget as HTMLElement | null;
		const related = e.relatedTarget as Node | null;
		if (currentTarget && related && currentTarget.contains(related)) {
			return;
		}
		activePopover = null;
	}

	function toggleHtmlSourceMode() {
		if (!editor) return;
		if (!htmlSourceMode) {
			rawHtmlBuffer = editor.getHTML();
			htmlSourceMode = true;
		} else {
			const clean = sanitizePostHtml(rawHtmlBuffer);
			rawHtmlBuffer = clean;
			lastEmittedHtml = clean;
			editor.commands.setContent(clean || '<p></p>', { emitUpdate: false });
			onChange(clean);
			syncStatsAndSelection(editor);
			htmlSourceMode = false;
		}
	}

	function applyLink() {
		if (!editor) return;
		const url = linkInputUrl.trim();
		if (!url) {
			editor.chain().focus().extendMarkRange('link').unsetLink().run();
		} else {
			editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
		}
		activePopover = null;
	}

	function applyEmbed() {
		if (!editor) return;
		const url = embedInputUrl.trim();
		if (!url) return;

		if (embedKind === 'youtube') {
			editor.chain().focus().setYoutubeVideo({ src: url, width: 640, height: 360 }).run();
		} else if (embedKind === 'vimeo') {
			editor.chain().focus().setVimeoVideo({ src: url, width: 640, height: 360 }).run();
		} else if (embedKind === 'tweet') {
			editor.chain().focus().setTweetEmbed({ url }).run();
		}
		embedInputUrl = '';
		activePopover = null;
	}

	function applyFindUpdate() {
		if (!editor) return;
		editor.commands.setSearchTerm(findQuery);
		editor.commands.setReplaceTerm(replaceQuery);
		editor.commands.setCaseSensitive(findCaseSensitive);
		findMatchCount = editor.storage.findAndReplace?.results?.length ?? 0;
		findCurrentIndex = editor.storage.findAndReplace?.currentIndex ?? 0;
	}

	function updateSelectedImageAttributes() {
		if (!editor || !editor.isActive('image')) return;
		editor
			.chain()
			.focus()
			.updateAttributes('image', {
				alt: selectedImageAlt.trim(),
				caption: selectedImageCaption.trim() || null,
				align: selectedImageAlign
			})
			.run();
	}

	function resizeSelectedImage(widthPx: number | null, sizePreset: string) {
		if (!editor || !editor.isActive('image')) return;
		editor
			.chain()
			.focus()
			.updateAttributes('image', {
				width: widthPx,
				size: sizePreset
			})
			.run();
	}

	let currentHeadingValue = $derived.by(() => {
		void editorVersion;
		if (!editor) return 'p';
		if (editor.isActive('heading', { level: 2 })) return 'h2';
		if (editor.isActive('heading', { level: 3 })) return 'h3';
		if (editor.isActive('heading', { level: 4 })) return 'h4';
		return 'p';
	});

	let isCodeBlockActive = $derived.by(() => {
		void editorVersion;
		return Boolean(editor?.isActive('codeBlock'));
	});

	let currentCodeLanguage = $derived.by(() => {
		void editorVersion;
		if (!editor || !editor.isActive('codeBlock')) return 'plaintext';
		return (editor.getAttributes('codeBlock').language as string) || 'plaintext';
	});

	let isImageSelected = $derived.by(() => {
		void editorVersion;
		return Boolean(editor?.isActive('image'));
	});

	let hasNonEmptyTextSelection = $derived.by(() => {
		void editorVersion;
		if (!editor) return false;
		const { empty } = editor.state.selection;
		return !empty && !editor.isActive('image');
	});
</script>

<div class="rte-wrapper">
	<!-- Primary Sticky Toolbar -->
	<div class="rte-toolbar" role="toolbar" aria-label="Post content formatting">
		<div class="toolbar-group">
			<button
				type="button"
				class="tool-btn"
				title="Undo (Cmd/Ctrl+Z)"
				aria-label="Undo"
				disabled={!editor || (editorVersion >= 0 && !editor.can().undo())}
				onclick={() => editor?.chain().focus().undo().run()}
			>
				Undo
			</button>
			<button
				type="button"
				class="tool-btn"
				title="Redo (Cmd/Ctrl+Shift+Z)"
				aria-label="Redo"
				disabled={!editor || (editorVersion >= 0 && !editor.can().redo())}
				onclick={() => editor?.chain().focus().redo().run()}
			>
				Redo
			</button>
		</div>

		<div class="toolbar-group">
			<select
				class="tool-select"
				aria-label="Block heading level"
				value={currentHeadingValue}
				onchange={(e) => {
					const val = (e.currentTarget as HTMLSelectElement).value;
					if (!editor) return;
					if (val === 'h2') editor.chain().focus().setHeading({ level: 2 }).run();
					else if (val === 'h3') editor.chain().focus().setHeading({ level: 3 }).run();
					else if (val === 'h4') editor.chain().focus().setHeading({ level: 4 }).run();
					else editor.chain().focus().setParagraph().run();
				}}
			>
				<option value="p">Paragraph</option>
				<option value="h2">Heading 2 (H2)</option>
				<option value="h3">Heading 3 (H3)</option>
				<option value="h4">Heading 4 (H4)</option>
			</select>
		</div>

		<div class="toolbar-group">
			<button
				type="button"
				aria-label="Bold (Cmd+B)"
				class={['tool-btn', { 'is-active': editorVersion >= 0 && editor?.isActive('bold') }]}
				aria-pressed={editorVersion >= 0 && Boolean(editor?.isActive('bold'))}
				onclick={() => editor?.chain().focus().toggleBold().run()}
			>
				<strong>B</strong>
			</button>
			<button
				type="button"
				aria-label="Italic (Cmd+I)"
				class={['tool-btn', { 'is-active': editorVersion >= 0 && editor?.isActive('italic') }]}
				aria-pressed={editorVersion >= 0 && Boolean(editor?.isActive('italic'))}
				onclick={() => editor?.chain().focus().toggleItalic().run()}
			>
				<em>I</em>
			</button>
			<button
				type="button"
				aria-label="Underline (Cmd+U)"
				class={['tool-btn', { 'is-active': editorVersion >= 0 && editor?.isActive('underline') }]}
				aria-pressed={editorVersion >= 0 && Boolean(editor?.isActive('underline'))}
				onclick={() => editor?.chain().focus().toggleUnderline().run()}
			>
				<u>U</u>
			</button>
			<button
				type="button"
				aria-label="Strikethrough"
				class={['tool-btn', { 'is-active': editorVersion >= 0 && editor?.isActive('strike') }]}
				aria-pressed={editorVersion >= 0 && Boolean(editor?.isActive('strike'))}
				onclick={() => editor?.chain().focus().toggleStrike().run()}
			>
				<s>S</s>
			</button>
			<button
				type="button"
				class={['tool-btn', { 'is-active': editorVersion >= 0 && editor?.isActive('code') }]}
				aria-pressed={editorVersion >= 0 && Boolean(editor?.isActive('code'))}
				onclick={() => editor?.chain().focus().toggleCode().run()}
			>
				Code
			</button>
		</div>

		<div class="toolbar-group">
			<button
				type="button"
				class={['tool-btn', { 'is-active': editorVersion >= 0 && editor?.isActive('bulletList') }]}
				aria-pressed={editorVersion >= 0 && Boolean(editor?.isActive('bulletList'))}
				onclick={() => editor?.chain().focus().toggleBulletList().run()}
			>
				• List
			</button>
			<button
				type="button"
				class={['tool-btn', { 'is-active': editorVersion >= 0 && editor?.isActive('orderedList') }]}
				aria-pressed={editorVersion >= 0 && Boolean(editor?.isActive('orderedList'))}
				onclick={() => editor?.chain().focus().toggleOrderedList().run()}
			>
				1. List
			</button>
			<button
				type="button"
				class={['tool-btn', { 'is-active': editorVersion >= 0 && editor?.isActive('taskList') }]}
				aria-pressed={editorVersion >= 0 && Boolean(editor?.isActive('taskList'))}
				onclick={() => editor?.chain().focus().toggleTaskList().run()}
			>
				Checklist
			</button>
			<button
				type="button"
				class={['tool-btn', { 'is-active': editorVersion >= 0 && editor?.isActive('blockquote') }]}
				aria-pressed={editorVersion >= 0 && Boolean(editor?.isActive('blockquote'))}
				onclick={() => editor?.chain().focus().toggleBlockquote().run()}
			>
				Quote
			</button>
			<button
				type="button"
				class={['tool-btn', { 'is-active': isCodeBlockActive }]}
				aria-pressed={isCodeBlockActive}
				onclick={() => editor?.chain().focus().toggleCodeBlock().run()}
			>
				Code Block
			</button>
		</div>

		<!-- Link Popover -->
		<div class="toolbar-group popover-anchor" onfocusout={handlePopoverFocusOut}>
			<button
				type="button"
				class={['tool-btn', { 'is-active': editorVersion >= 0 && editor?.isActive('link') }]}
				aria-expanded={activePopover === 'link'}
				aria-haspopup="dialog"
				onclick={() => {
					linkInputUrl = (editor?.getAttributes('link').href as string) || '';
					activePopover = activePopover === 'link' ? null : 'link';
				}}
			>
				Link
			</button>
			{#if activePopover === 'link'}
				<div class="toolbar-popover" role="dialog" aria-label="Insert or edit link">
					<input
						type="url"
						class="popover-input"
						placeholder="https://revolutiontradingpros.com/..."
						bind:value={linkInputUrl}
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								applyLink();
							} else if (e.key === 'Escape') {
								activePopover = null;
							}
						}}
					/>
					<div class="popover-actions">
						<button type="button" class="btn-pop-primary" onclick={applyLink}>Apply</button>
						<button
							type="button"
							class="btn-pop-secondary"
							onclick={() => {
								editor?.chain().focus().unsetLink().run();
								activePopover = null;
							}}
						>
							Unlink
						</button>
					</div>
				</div>
			{/if}
		</div>

		<!-- Media & Embeds -->
		<div class="toolbar-group">
			<button type="button" class="tool-btn" onclick={triggerMediaPicker}> Image </button>

			<div class="popover-anchor" onfocusout={handlePopoverFocusOut}>
				<button
					type="button"
					class="tool-btn"
					aria-expanded={activePopover === 'embed'}
					aria-haspopup="dialog"
					onclick={() => (activePopover = activePopover === 'embed' ? null : 'embed')}
				>
					Embed
				</button>
				{#if activePopover === 'embed'}
					<div class="toolbar-popover" role="dialog" aria-label="Insert embed">
						<select class="popover-select" bind:value={embedKind}>
							<option value="youtube">YouTube Video</option>
							<option value="vimeo">Vimeo Video</option>
							<option value="tweet">X / Twitter Post</option>
						</select>
						<input
							type="url"
							class="popover-input"
							placeholder={embedKind === 'tweet'
								? 'https://x.com/user/status/123...'
								: 'https://...'}
							bind:value={embedInputUrl}
							onkeydown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									applyEmbed();
								} else if (e.key === 'Escape') {
									activePopover = null;
								}
							}}
						/>
						<div class="popover-actions">
							<button type="button" class="btn-pop-primary" onclick={applyEmbed}>
								Insert Embed
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Right Controls: Find/Replace, Advanced Row, HTML Source -->
		<div class="toolbar-group toolbar-right">
			<button
				type="button"
				class={['tool-btn', { 'is-active': findBarOpen }]}
				aria-pressed={findBarOpen}
				onclick={() => (findBarOpen = !findBarOpen)}
			>
				Find
			</button>
			<button
				type="button"
				class={['tool-btn', { 'is-active': showAdvancedToolbar }]}
				aria-expanded={showAdvancedToolbar}
				onclick={() => (showAdvancedToolbar = !showAdvancedToolbar)}
			>
				Advanced
			</button>
			<button
				type="button"
				class={['tool-btn', { 'is-active': htmlSourceMode }]}
				aria-pressed={htmlSourceMode}
				onclick={toggleHtmlSourceMode}
			>
				{htmlSourceMode ? 'Visual Mode' : 'HTML Source'}
			</button>
		</div>
	</div>

	<!-- Code Block Language Bar (visible when cursor is inside a codeBlock, Section 13 #30) -->
	{#if isCodeBlockActive && !htmlSourceMode}
		<div class="code-lang-bar">
			<label class="code-lang-label">
				<span>Code Language:</span>
				<select
					class="tool-select"
					value={currentCodeLanguage}
					onchange={(e) => {
						const lang = (e.currentTarget as HTMLSelectElement).value;
						editor?.chain().focus().updateAttributes('codeBlock', { language: lang }).run();
					}}
				>
					{#each CODE_BLOCK_LANGUAGES as lang (lang.value)}
						<option value={lang.value}>{lang.label}</option>
					{/each}
				</select>
			</label>
		</div>
	{/if}

	<!-- Collapsible Advanced Formatting Row -->
	{#if showAdvancedToolbar && !htmlSourceMode}
		<div
			class="rte-toolbar rte-toolbar-advanced"
			role="toolbar"
			aria-label="Advanced formatting toolbar"
		>
			<div class="toolbar-group">
				<select
					class="tool-select"
					aria-label="Font family"
					onchange={(e) => {
						const val = (e.currentTarget as HTMLSelectElement).value;
						if (!val) editor?.chain().focus().unsetFontFamily().run();
						else editor?.chain().focus().setFontFamily(val).run();
					}}
				>
					<option value="">Default Font</option>
					{#each EDITOR_FONT_FAMILIES as fam (fam.label)}
						<option value={fam.value}>{fam.label}</option>
					{/each}
				</select>

				<select
					class="tool-select"
					aria-label="Font size"
					onchange={(e) => {
						const val = (e.currentTarget as HTMLSelectElement).value;
						if (!val) editor?.chain().focus().unsetFontSize().run();
						else editor?.chain().focus().setFontSize(val).run();
					}}
				>
					<option value="">Default Size</option>
					{#each EDITOR_FONT_SIZES as sz (sz)}
						<option value={sz}>{sz}</option>
					{/each}
				</select>
			</div>

			<div class="toolbar-group">
				<button
					type="button"
					class={[
						'tool-btn',
						{ 'is-active': editorVersion >= 0 && editor?.isActive({ textAlign: 'left' }) }
					]}
					aria-pressed={editorVersion >= 0 && Boolean(editor?.isActive({ textAlign: 'left' }))}
					onclick={() => editor?.chain().focus().setTextAlign('left').run()}
				>
					Left
				</button>
				<button
					type="button"
					class={[
						'tool-btn',
						{ 'is-active': editorVersion >= 0 && editor?.isActive({ textAlign: 'center' }) }
					]}
					aria-pressed={editorVersion >= 0 && Boolean(editor?.isActive({ textAlign: 'center' }))}
					onclick={() => editor?.chain().focus().setTextAlign('center').run()}
				>
					Center
				</button>
				<button
					type="button"
					class={[
						'tool-btn',
						{ 'is-active': editorVersion >= 0 && editor?.isActive({ textAlign: 'right' }) }
					]}
					aria-pressed={editorVersion >= 0 && Boolean(editor?.isActive({ textAlign: 'right' }))}
					onclick={() => editor?.chain().focus().setTextAlign('right').run()}
				>
					Right
				</button>
				<button
					type="button"
					class={['tool-btn', { 'is-active': editorVersion >= 0 && editor?.isActive('subscript') }]}
					aria-pressed={editorVersion >= 0 && Boolean(editor?.isActive('subscript'))}
					onclick={() => editor?.chain().focus().toggleSubscript().run()}
				>
					Sub
				</button>
				<button
					type="button"
					class={[
						'tool-btn',
						{ 'is-active': editorVersion >= 0 && editor?.isActive('superscript') }
					]}
					aria-pressed={editorVersion >= 0 && Boolean(editor?.isActive('superscript'))}
					onclick={() => editor?.chain().focus().toggleSuperscript().run()}
				>
					Sup
				</button>
			</div>

			<!-- Text Color & Highlight Popovers -->
			<div class="toolbar-group popover-anchor" onfocusout={handlePopoverFocusOut}>
				<button
					type="button"
					class="tool-btn"
					aria-expanded={activePopover === 'color'}
					onclick={() => (activePopover = activePopover === 'color' ? null : 'color')}
				>
					Text Color
				</button>
				{#if activePopover === 'color'}
					<div class="toolbar-popover swatch-popover" role="dialog" aria-label="Text color">
						{#each TEXT_COLORS as c (c.label)}
							<button
								type="button"
								class="swatch-btn"
								onclick={() => {
									if (!c.value) editor?.chain().focus().unsetColor().run();
									else editor?.chain().focus().setColor(c.value).run();
									activePopover = null;
								}}
							>
								{c.label}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<div class="toolbar-group popover-anchor" onfocusout={handlePopoverFocusOut}>
				<button
					type="button"
					class={['tool-btn', { 'is-active': editorVersion >= 0 && editor?.isActive('highlight') }]}
					aria-expanded={activePopover === 'highlight'}
					onclick={() => (activePopover = activePopover === 'highlight' ? null : 'highlight')}
				>
					Highlight
				</button>
				{#if activePopover === 'highlight'}
					<div class="toolbar-popover swatch-popover" role="dialog" aria-label="Highlight color">
						{#each HIGHLIGHT_COLORS as h (h.label)}
							<button
								type="button"
								class="swatch-btn"
								onclick={() => {
									if (!h.value) editor?.chain().focus().unsetHighlight().run();
									else editor?.chain().focus().setHighlight({ color: h.value }).run();
									activePopover = null;
								}}
							>
								{h.label}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Callouts Popover -->
			<div class="toolbar-group popover-anchor" onfocusout={handlePopoverFocusOut}>
				<button
					type="button"
					class={['tool-btn', { 'is-active': editorVersion >= 0 && editor?.isActive('callout') }]}
					aria-expanded={activePopover === 'callout'}
					onclick={() => (activePopover = activePopover === 'callout' ? null : 'callout')}
				>
					Callout
				</button>
				{#if activePopover === 'callout'}
					<div class="toolbar-popover swatch-popover" role="dialog" aria-label="Callout type">
						{#each CALLOUT_TYPES as ct (ct)}
							<button
								type="button"
								class="swatch-btn"
								onclick={() => {
									editor
										?.chain()
										.focus()
										.toggleCallout({ type: ct as CalloutType })
										.run();
									activePopover = null;
								}}
							>
								Callout: {ct.toUpperCase()}
							</button>
						{/each}
						<button
							type="button"
							class="swatch-btn"
							onclick={() => {
								editor?.chain().focus().unsetCallout().run();
								activePopover = null;
							}}
						>
							Remove Callout
						</button>
					</div>
				{/if}
			</div>

			<!-- Table Popover -->
			<div class="toolbar-group popover-anchor" onfocusout={handlePopoverFocusOut}>
				<button
					type="button"
					class="tool-btn"
					aria-expanded={activePopover === 'table'}
					onclick={() => (activePopover = activePopover === 'table' ? null : 'table')}
				>
					Table
				</button>
				{#if activePopover === 'table'}
					<div class="toolbar-popover swatch-popover" role="dialog" aria-label="Table actions">
						<button
							type="button"
							class="swatch-btn"
							onclick={() => {
								editor
									?.chain()
									.focus()
									.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
									.run();
								activePopover = null;
							}}
						>
							Insert 3x3 Table
						</button>
						<button
							type="button"
							class="swatch-btn"
							onclick={() => editor?.chain().focus().addColumnAfter().run()}
						>
							+ Column After
						</button>
						<button
							type="button"
							class="swatch-btn"
							onclick={() => editor?.chain().focus().addRowAfter().run()}
						>
							+ Row After
						</button>
						<button
							type="button"
							class="swatch-btn"
							onclick={() => editor?.chain().focus().deleteTable().run()}
						>
							Delete Table
						</button>
					</div>
				{/if}
			</div>

			<!-- Block Style Popover -->
			<div class="toolbar-group popover-anchor" onfocusout={handlePopoverFocusOut}>
				<button
					type="button"
					class="tool-btn"
					aria-expanded={activePopover === 'blockStyle'}
					onclick={() => (activePopover = activePopover === 'blockStyle' ? null : 'blockStyle')}
				>
					Block Style
				</button>
				{#if activePopover === 'blockStyle'}
					<div class="toolbar-popover" role="dialog" aria-label="Block box styling">
						<label class="pop-field">
							<span>Background</span>
							<input type="text" class="popover-input" bind:value={blockBgColor} />
						</label>
						<label class="pop-field">
							<span>Border Accent</span>
							<input type="text" class="popover-input" bind:value={blockBorderColor} />
						</label>
						<label class="pop-field">
							<span>Padding</span>
							<input type="text" class="popover-input" bind:value={blockPadding} />
						</label>
						<div class="popover-actions">
							<button
								type="button"
								class="btn-pop-primary"
								onclick={() => {
									editor?.commands.setBlockStyle({
										backgroundColor: blockBgColor,
										borderColor: blockBorderColor,
										padding: blockPadding,
										borderRadius: blockRadius
									});
									activePopover = null;
								}}
							>
								Apply
							</button>
							<button
								type="button"
								class="btn-pop-secondary"
								onclick={() => {
									editor?.commands.unsetBlockStyle();
									activePopover = null;
								}}
							>
								Clear
							</button>
						</div>
					</div>
				{/if}
			</div>

			<div class="toolbar-group">
				<button
					type="button"
					class="tool-btn"
					onclick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
				>
					Clear Formatting
				</button>
			</div>
		</div>
	{/if}

	<!-- Find & Replace Bar (Cmd/Ctrl+F) -->
	{#if findBarOpen && !htmlSourceMode}
		<div class="find-replace-bar" role="region" aria-label="Find and replace">
			<input
				type="search"
				class="popover-input find-input"
				placeholder="Find in article..."
				bind:value={findQuery}
				oninput={applyFindUpdate}
			/>
			<input
				type="text"
				class="popover-input find-input"
				placeholder="Replace with..."
				bind:value={replaceQuery}
				oninput={applyFindUpdate}
			/>
			<label class="case-toggle">
				<input type="checkbox" bind:checked={findCaseSensitive} onchange={applyFindUpdate} />
				<span>Aa</span>
			</label>
			<span class="find-count">
				{findMatchCount > 0 ? `${findCurrentIndex + 1} / ${findMatchCount}` : '0 matches'}
			</span>
			<button
				type="button"
				class="tool-btn"
				disabled={findMatchCount === 0}
				onclick={() => {
					editor?.commands.previousSearchResult();
					findCurrentIndex = editor?.storage.findAndReplace?.currentIndex ?? 0;
				}}
			>
				Prev
			</button>
			<button
				type="button"
				class="tool-btn"
				disabled={findMatchCount === 0}
				onclick={() => {
					editor?.commands.nextSearchResult();
					findCurrentIndex = editor?.storage.findAndReplace?.currentIndex ?? 0;
				}}
			>
				Next
			</button>
			<button
				type="button"
				class="tool-btn"
				disabled={findMatchCount === 0}
				onclick={() => {
					editor?.commands.replaceCurrentMatch();
					findMatchCount = editor?.storage.findAndReplace?.results?.length ?? 0;
				}}
			>
				Replace
			</button>
			<button
				type="button"
				class="tool-btn"
				disabled={findMatchCount === 0}
				onclick={() => {
					editor?.commands.replaceAllMatches();
					findMatchCount = 0;
				}}
			>
				Replace All
			</button>
			<button
				type="button"
				class="tool-btn"
				onclick={() => {
					findBarOpen = false;
					editor?.commands.clearSearch();
				}}
			>
				Close
			</button>
		</div>
	{/if}

	<!-- Upload Status / Error Banner (Section 13 #33) -->
	{#if uploadingInlineImage}
		<div class="editor-banner is-info" role="status">Uploading and optimizing image to WebP...</div>
	{/if}
	{#if uploadErrorBanner}
		<div class="editor-banner is-error" role="alert">
			<span>{uploadErrorBanner}</span>
			<button type="button" class="tool-btn" onclick={() => (uploadErrorBanner = '')}>
				Dismiss
			</button>
		</div>
	{/if}

	<!-- Contextual Selection Bubble Bar -->
	{#if hasNonEmptyTextSelection && !htmlSourceMode}
		<div class="selection-bubble-bar" role="toolbar" aria-label="Selection quick formatting">
			<button
				type="button"
				class={['tool-btn', { 'is-active': editor?.isActive('bold') }]}
				aria-pressed={Boolean(editor?.isActive('bold'))}
				onclick={() => editor?.chain().focus().toggleBold().run()}
			>
				Bold
			</button>
			<button
				type="button"
				class={['tool-btn', { 'is-active': editor?.isActive('italic') }]}
				aria-pressed={Boolean(editor?.isActive('italic'))}
				onclick={() => editor?.chain().focus().toggleItalic().run()}
			>
				Italic
			</button>
			<button
				type="button"
				class={['tool-btn', { 'is-active': editor?.isActive('underline') }]}
				aria-pressed={Boolean(editor?.isActive('underline'))}
				onclick={() => editor?.chain().focus().toggleUnderline().run()}
			>
				Underline
			</button>
			<button
				type="button"
				class={['tool-btn', { 'is-active': editor?.isActive('highlight') }]}
				aria-pressed={Boolean(editor?.isActive('highlight'))}
				onclick={() => editor?.chain().focus().toggleHighlight().run()}
			>
				Highlight
			</button>
		</div>
	{/if}

	<!-- Contextual Image Inspector Bar -->
	{#if isImageSelected && !htmlSourceMode}
		<div class="image-inspector-bar" role="region" aria-label="Selected image controls">
			<div class="img-bar-row">
				<span class="img-bar-label">Align:</span>
				{#each ['left', 'center', 'right', 'full'] as const as al (al)}
					<button
						type="button"
						class={['tool-btn', { 'is-active': selectedImageAlign === al }]}
						aria-pressed={selectedImageAlign === al}
						onclick={() => {
							selectedImageAlign = al;
							updateSelectedImageAttributes();
						}}
					>
						{al}
					</button>
				{/each}

				<span class="img-bar-label">Width:</span>
				<button
					type="button"
					class="tool-btn"
					onclick={() => resizeSelectedImage(320, 'thumbnail')}
				>
					25%
				</button>
				<button
					type="button"
					class="tool-btn"
					onclick={() => resizeSelectedImage(480, 'thumbnail')}
				>
					50%
				</button>
				<button type="button" class="tool-btn" onclick={() => resizeSelectedImage(800, 'medium')}>
					75%
				</button>
				<button type="button" class="tool-btn" onclick={() => resizeSelectedImage(null, 'full')}>
					100%
				</button>

				<button
					type="button"
					class="tool-btn is-danger"
					onclick={() => editor?.chain().focus().deleteSelection().run()}
				>
					Remove Image
				</button>
			</div>

			<div class="img-bar-row">
				<input
					type="text"
					class="popover-input img-meta-input"
					placeholder="Image alt text (required for SEO)..."
					bind:value={selectedImageAlt}
					onchange={updateSelectedImageAttributes}
				/>
				<input
					type="text"
					class="popover-input img-meta-input"
					placeholder="Optional figure caption..."
					bind:value={selectedImageCaption}
					onchange={updateSelectedImageAttributes}
				/>
			</div>
		</div>
	{/if}

	<!-- Slash Command Listbox -->
	{#if slashMenuOpen && !htmlSourceMode}
		<div
			class="slash-command-menu"
			role="listbox"
			tabindex="-1"
			aria-label="Slash commands"
			aria-activedescendant={filteredSlashItems[slashIndex]
				? `slash-item-${filteredSlashItems[slashIndex].id}`
				: undefined}
		>
			{#if filteredSlashItems.length === 0}
				<div class="slash-empty">No matching commands. Press Enter to continue typing.</div>
			{:else}
				{#each filteredSlashItems as item, idx (item.id)}
					<button
						type="button"
						id="slash-item-{item.id}"
						role="option"
						aria-selected={idx === slashIndex}
						class={['slash-option', { 'is-active': idx === slashIndex }]}
						onclick={() => executeSlashCommand(item)}
					>
						<span class="slash-option-title">{item.title}</span>
						<span class="slash-option-desc">{item.description}</span>
					</button>
				{/each}
			{/if}
		</div>
	{/if}

	<!-- Editor Canvas or Raw HTML Source Mode -->
	<div class="rte-canvas-wrap">
		<div
			{@attach mountEditor}
			{@attach () => {
				syncExternalContent(content);
			}}
			class={['rte-canvas', { 'is-hidden': htmlSourceMode }]}
		></div>

		{#if htmlSourceMode}
			<textarea
				class="html-source-textarea"
				aria-label="HTML source code editor"
				bind:value={rawHtmlBuffer}
				rows="24"></textarea>
		{/if}
	</div>
</div>

<style>
	.rte-wrapper {
		position: relative;
		display: flex;
		flex-direction: column;
		border: 1px solid var(--line-strong);
		border-radius: 12px;
		background: var(--bg);
		overflow: visible;
	}

	.rte-toolbar {
		position: sticky;
		top: 0;
		z-index: 40;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.45rem;
		padding: 0.55rem 0.85rem;
		background: var(--panel);
		border-bottom: 1px solid var(--line);
		border-radius: 12px 12px 0 0;
	}

	.rte-toolbar-advanced {
		position: static;
		border-radius: 0;
		background: var(--panel2);
	}

	.toolbar-group {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding-right: 0.45rem;
		border-right: 1px solid var(--line);
	}

	.toolbar-right {
		margin-left: auto;
		border-right: 0;
		padding-right: 0;
	}

	.tool-btn,
	.tool-select {
		padding: 0.35rem 0.6rem;
		border-radius: 6px;
		border: 1px solid var(--line);
		background: var(--bg-soft);
		color: var(--text-secondary);
		font-family: var(--font-sans);
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
	}

	.tool-btn:hover:not(:disabled) {
		background: var(--btn-dark-hover);
		color: var(--text);
	}

	.tool-btn:disabled {
		opacity: 0.42;
		cursor: not-allowed;
	}

	.tool-btn.is-active {
		background: var(--acid);
		border-color: var(--acid);
		color: var(--ink);
	}

	.tool-btn.is-danger {
		color: var(--coral);
		border-color: var(--coral);
	}

	.popover-anchor {
		position: relative;
	}

	.toolbar-popover {
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		z-index: 80;
		min-width: 240px;
		padding: 0.75rem;
		border-radius: 8px;
		border: 1px solid var(--line-strong);
		background: var(--panel);
		box-shadow: var(--shadow-md);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.swatch-popover {
		min-width: 170px;
	}

	.swatch-btn {
		padding: 0.4rem 0.65rem;
		border-radius: 6px;
		border: 1px solid var(--line);
		background: var(--panel2);
		color: var(--text);
		font-size: 0.8rem;
		text-align: left;
		cursor: pointer;
	}

	.swatch-btn:hover {
		border-color: var(--acid);
	}

	.popover-input,
	.popover-select {
		padding: 0.42rem 0.65rem;
		border-radius: 6px;
		border: 1px solid var(--line-strong);
		background: var(--bg);
		color: var(--text);
		font-family: var(--font-sans);
		font-size: 0.83rem;
	}

	.popover-actions {
		display: flex;
		gap: 0.4rem;
		justify-content: flex-end;
	}

	.btn-pop-primary,
	.btn-pop-secondary {
		padding: 0.35rem 0.7rem;
		border-radius: 6px;
		font-size: 0.78rem;
		font-weight: 700;
		cursor: pointer;
		border: 1px solid transparent;
	}

	.btn-pop-primary {
		background: var(--acid);
		color: var(--ink);
	}

	.btn-pop-secondary {
		background: var(--panel2);
		border-color: var(--line);
		color: var(--text);
	}

	.pop-field {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.code-lang-bar,
	.find-replace-bar,
	.selection-bubble-bar,
	.image-inspector-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.85rem;
		background: var(--bg-soft);
		border-bottom: 1px solid var(--line);
		font-size: 0.82rem;
	}

	.code-lang-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--acid);
		font-weight: 600;
	}

	.find-input {
		width: 170px;
	}

	.case-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		color: var(--text-secondary);
		cursor: pointer;
	}

	.find-count {
		font-size: 0.78rem;
		color: var(--muted);
		min-width: 72px;
	}

	.editor-banner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.55rem 0.95rem;
		font-size: 0.84rem;
		border-bottom: 1px solid var(--line);
	}

	.editor-banner.is-info {
		background: rgba(220, 255, 101, 0.1);
		color: var(--acid);
	}

	.editor-banner.is-error {
		background: rgba(255, 121, 105, 0.14);
		color: var(--coral);
	}

	.image-inspector-bar {
		flex-direction: column;
		align-items: stretch;
	}

	.img-bar-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
	}

	.img-bar-label {
		font-size: 0.76rem;
		font-weight: 700;
		color: var(--muted);
		margin-left: 0.35rem;
	}

	.img-meta-input {
		flex: 1 1 220px;
	}

	.slash-command-menu {
		margin: 0.5rem 1.25rem 0;
		max-height: 260px;
		overflow-y: auto;
		border-radius: 8px;
		border: 1px solid var(--line-strong);
		background: var(--panel);
		box-shadow: var(--shadow-md);
		display: flex;
		flex-direction: column;
	}

	.slash-option {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.12rem;
		padding: 0.55rem 0.85rem;
		border: 0;
		border-bottom: 1px solid var(--line);
		background: transparent;
		color: var(--text);
		text-align: left;
		cursor: pointer;
	}

	.slash-option.is-active {
		background: rgba(220, 255, 101, 0.12);
	}

	.slash-option-title {
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--acid);
	}

	.slash-option-desc {
		font-size: 0.76rem;
		color: var(--muted);
	}

	.slash-empty {
		padding: 0.75rem 1rem;
		font-size: 0.82rem;
		color: var(--muted);
	}

	.rte-canvas-wrap {
		padding: 1.75rem 1.5rem;
		min-height: 520px;
	}

	.rte-canvas.is-hidden {
		display: none;
	}

	.rte-canvas :global(.ProseMirror) {
		min-height: 460px;
		outline: none;
	}

	.html-source-textarea {
		width: 100%;
		min-height: 480px;
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: var(--bg-soft);
		color: var(--acid);
		font-family: var(--font-mono);
		font-size: 0.86rem;
		line-height: 1.6;
		resize: vertical;
	}
</style>
