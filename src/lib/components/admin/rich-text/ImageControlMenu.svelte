<script lang="ts">
	import { untrack } from 'svelte';
	import type { ImageAlign } from '#lib/tiptap/image-with-dimensions';
	import { IMAGE_WIDTH_PRESETS, type ImageWidthPreset } from '#lib/tiptap/image-actions';

	const ALIGNMENTS: { value: ImageAlign; label: string }[] = [
		{ value: 'left', label: 'Left' },
		{ value: 'center', label: 'Center' },
		{ value: 'right', label: 'Right' },
		{ value: 'full', label: 'Full width' },
		{ value: null, label: 'No align' }
	];

	interface Props {
		visible: boolean;
		x: number;
		y: number;
		anchor?: HTMLImageElement | null;
		alignment: ImageAlign;
		/** Current width attribute of the selected image (px) or null. */
		width: number | null;
		alt: string;
		title: string;
		caption: string;
		/** Increment to open the alt editor from outside (the editor's "Add alt text" chip). */
		altEditRequest?: number;
		onAlign: (alignment: ImageAlign) => void;
		onWidth: (preset: ImageWidthPreset) => void;
		/** Persist edited alt/title/caption onto the selected image node. */
		onEditDetails: (details: { alt: string; title: string; caption: string }) => void;
		/** Swap the selected image's file (alt/title/caption are kept). */
		onReplace: () => void;
		onRemove: () => void;
		/** Escape pressed inside the menu: hand focus back to the editor. */
		onEscape?: () => void;
	}

	let {
		visible,
		x,
		y,
		anchor = null,
		alignment,
		width,
		alt,
		title,
		caption,
		altEditRequest = 0,
		onAlign,
		onWidth,
		onEditDetails,
		onReplace,
		onRemove,
		onEscape
	}: Props = $props();

	function positionMenu(menu: HTMLDivElement) {
		const image = anchor;
		const fallbackX = x;
		const fallbackY = y;
		const viewport = window.visualViewport;
		const margin = 8;
		const gap = 12;
		function updatePosition() {
			const viewportLeft = viewport?.offsetLeft ?? 0;
			const viewportTop = viewport?.offsetTop ?? 0;
			const viewportWidth = viewport?.width ?? window.innerWidth;
			const viewportHeight = viewport?.height ?? window.innerHeight;
			menu.style.maxWidth = `${Math.max(0, viewportWidth - margin * 2)}px`;
			menu.style.maxHeight = `${Math.max(0, viewportHeight - margin * 2)}px`;
			const bounds = menu.getBoundingClientRect();
			const imageBounds = image?.getBoundingClientRect();
			const center = imageBounds ? imageBounds.left + imageBounds.width / 2 : fallbackX;
			const above = (imageBounds?.top ?? fallbackY) - bounds.height - gap;
			const below = (imageBounds?.bottom ?? fallbackY) + gap;
			const top = above >= viewportTop + margin ? above : below;
			menu.style.left = `${Math.max(
				viewportLeft + margin,
				Math.min(center - bounds.width / 2, viewportLeft + viewportWidth - bounds.width - margin)
			)}px`;
			menu.style.top = `${Math.max(
				viewportTop + margin,
				Math.min(top, viewportTop + viewportHeight - bounds.height - margin)
			)}px`;
		}

		// The alt editor changes the menu height: re-measure, and follow the image on scroll/resize.
		const observer = new ResizeObserver(updatePosition);
		observer.observe(menu);
		if (image) observer.observe(image);
		window.addEventListener('scroll', updatePosition, true);
		window.addEventListener('resize', updatePosition);
		viewport?.addEventListener('scroll', updatePosition);
		viewport?.addEventListener('resize', updatePosition);
		updatePosition();
		return () => {
			observer.disconnect();
			window.removeEventListener('scroll', updatePosition, true);
			window.removeEventListener('resize', updatePosition);
			viewport?.removeEventListener('scroll', updatePosition);
			viewport?.removeEventListener('resize', updatePosition);
		};
	}

	// The editor stays open for the <img> it was opened on (`editingFor`). When the anchor changes
	// (another image selected) it reads as closed, so drafts typed for image A can never be saved
	// onto image B.
	let editing = $state(false);
	let editingFor = $state.raw<HTMLImageElement | null>(null);
	let draftAlt = $state('');
	let draftTitle = $state('');
	let draftCaption = $state('');
	let seenAltRequest = 0;
	const editingDetails = $derived(visible && editing && editingFor === anchor);
	const missingAlt = $derived(alt.trim() === '');

	function focusField(input: HTMLInputElement) {
		input.focus({ preventScroll: true });
	}

	function openEditor() {
		draftAlt = alt;
		draftTitle = title;
		draftCaption = caption;
		editingFor = anchor;
		editing = true;
	}
	function cancelEditor() {
		editing = false;
	}
	function saveEditor() {
		if (!editingDetails) return;
		onEditDetails({
			alt: draftAlt.trim(),
			title: draftTitle.trim(),
			caption: draftCaption.trim()
		});
		editing = false;
	}
	function align(next: ImageAlign) {
		const keepEditing = editingDetails;
		onAlign(next);
		// An alignment change rebuilds the same image's <img>; follow the new element, keep drafts.
		if (keepEditing) editingFor = anchor;
	}
	function remove() {
		editing = false;
		onRemove();
	}
	function fieldKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			saveEditor();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			cancelEditor();
		}
	}
	function menuKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && !event.defaultPrevented) {
			event.preventDefault();
			// The post editor's global Escape shortcut leaves the editor; this Escape only closes the menu focus.
			event.stopPropagation();
			onEscape?.();
		}
	}

	$effect(() => {
		const request = altEditRequest;
		if (request !== seenAltRequest) {
			seenAltRequest = request;
			if (visible && request > 0) untrack(openEditor);
		}
	});
</script>

<div
	{@attach visible && positionMenu}
	class={['image-control-menu', { 'is-hidden': !visible }]}
	role="toolbar"
	aria-label="Image controls"
	data-testid="image-control-menu"
	tabindex="-1"
	onkeydown={menuKeydown}
>
	<!-- mousedown preventDefault keeps the editor selection (the image stays selected). The detail
	     editor below intentionally has none, so its inputs can take focus. -->
	<div class="menu-row" role="presentation" onmousedown={(event) => event.preventDefault()}>
		<div class="menu-group" role="group" aria-label="Alignment">
			{#each ALIGNMENTS as option (option.label)}
				<button
					type="button"
					class={['menu-btn', { active: alignment === option.value }]}
					aria-pressed={alignment === option.value}
					onclick={() => align(option.value)}
				>
					{option.label}
				</button>
			{/each}
		</div>
		<span class="menu-divider" aria-hidden="true"></span>
		<div class="menu-group" role="group" aria-label="Width">
			{#each IMAGE_WIDTH_PRESETS as preset (preset.label)}
				{@const active =
					preset.px === null
						? width === null || !IMAGE_WIDTH_PRESETS.some((p) => p.px === width)
						: width === preset.px}
				<button
					type="button"
					class={['menu-btn', { active }]}
					aria-pressed={active}
					aria-label={`Width ${preset.label}`}
					onclick={() => onWidth(preset)}
				>
					{preset.label}
				</button>
			{/each}
		</div>
		<span class="menu-divider" aria-hidden="true"></span>
		<button
			type="button"
			class={['menu-btn', { active: editingDetails, flag: missingAlt }]}
			aria-pressed={editingDetails}
			title={missingAlt
				? 'Add alt text (missing: hurts SEO and accessibility)'
				: 'Edit alt text, title and caption'}
			onclick={() => (editingDetails ? cancelEditor() : openEditor())}
		>
			{missingAlt ? 'Add alt text' : 'Alt'}
		</button>
		<button
			type="button"
			class="menu-btn"
			title="Replace this image with a different file from the media library"
			onclick={onReplace}
		>
			Replace
		</button>
		<span class="menu-divider" aria-hidden="true"></span>
		<button type="button" class="menu-btn danger" onclick={remove}>Remove</button>
	</div>

	{#if editingDetails}
		<div class="menu-editor">
			<label>
				<span>Alt text <em>(required for SEO)</em></span>
				<input
					type="text"
					{@attach focusField}
					bind:value={draftAlt}
					placeholder="Describe the image for search engines and screen readers"
					onkeydown={fieldKeydown}
				/>
			</label>
			<label>
				<span>Title <em>(optional)</em></span>
				<input
					type="text"
					bind:value={draftTitle}
					placeholder="Tooltip text shown on hover"
					onkeydown={fieldKeydown}
				/>
			</label>
			<label>
				<span>Caption <em>(optional)</em></span>
				<input
					type="text"
					bind:value={draftCaption}
					placeholder="Visible figure caption"
					onkeydown={fieldKeydown}
				/>
			</label>
			<div class="menu-editor-actions">
				<button type="button" class="menu-btn primary" onclick={saveEditor}>Save</button>
				<button type="button" class="menu-btn" onclick={cancelEditor}>Cancel</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.image-control-menu {
		position: fixed;
		z-index: 60;
		box-sizing: border-box;
		overflow: auto;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.35rem;
		background: var(--panel);
		border: 1px solid var(--line-strong);
		border-radius: 0.55rem;
		box-shadow: var(--shadow-md);
	}

	.image-control-menu.is-hidden {
		display: none;
	}

	.menu-row,
	.menu-group {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem;
	}

	.menu-btn {
		min-height: 2rem;
		padding: 0 0.6rem;
		border: 0;
		border-radius: 0.4rem;
		background: transparent;
		color: var(--text-secondary);
		font: inherit;
		font-size: 0.76rem;
		font-weight: 700;
		cursor: pointer;
		white-space: nowrap;
	}

	.menu-btn:hover,
	.menu-btn.active,
	.menu-btn.primary {
		background: var(--acid);
		color: var(--ink);
	}

	.menu-btn:focus-visible {
		outline: 2px solid var(--acid);
		outline-offset: 2px;
	}

	.menu-btn.flag {
		color: var(--coral);
		outline: 1px solid var(--coral);
	}

	.menu-btn.flag:hover,
	.menu-btn.flag.active {
		background: var(--coral);
		color: var(--ink);
	}

	.menu-btn.danger {
		color: var(--coral);
	}

	.menu-btn.danger:hover {
		background: var(--coral);
		color: var(--ink);
	}

	.menu-divider {
		width: 1px;
		height: 1.35rem;
		background: var(--line-strong);
		margin: 0 0.1rem;
	}

	.menu-editor {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		margin-top: 0.4rem;
		padding-top: 0.4rem;
		border-top: 1px solid var(--line-strong);
		min-width: 0;
	}

	.menu-editor label {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--text-secondary);
	}

	.menu-editor label em {
		font-weight: 500;
		font-style: normal;
		color: var(--muted);
	}

	.menu-editor input {
		min-width: 0;
		padding: 0.4rem 0.5rem;
		background: var(--bg-soft);
		border: 1px solid var(--line-strong);
		border-radius: 0.35rem;
		color: var(--text);
		font: inherit;
		font-size: 0.78rem;
		font-weight: 400;
	}

	.menu-editor input:focus {
		outline: 2px solid var(--acid);
		outline-offset: 1px;
	}

	.menu-editor-actions {
		display: flex;
		gap: 0.3rem;
	}

	/* Touch: bigger hit targets (WCAG 2.5.8 target size). */
	@media (pointer: coarse) {
		.menu-btn {
			min-height: 2.75rem;
			padding: 0 0.85rem;
		}
	}
</style>
