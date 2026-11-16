import type { Editor } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import type { ImageAlign } from './image-with-dimensions';

/** What the media picker hands the editor (see MediaLibrary's MediaInsertPayload + PostEditor wiring). */
export interface PickedImagePayload {
	url: string;
	alt: string;
	width?: number | null;
	height?: number | null;
	caption?: string;
	size?: string;
	align?: string;
	linkUrl?: string;
	mediaId?: string;
}

/** Every alignment value the picker can emit, including 'full' (Full Width). */
export function mapPickerAlign(raw: string | null | undefined): ImageAlign {
	return raw === 'left' || raw === 'center' || raw === 'right' || raw === 'full' ? raw : null;
}

/** Width presets. `px` null means 100% (natural size). `size` is the data-size hint stored on the node. */
export const IMAGE_WIDTH_PRESETS = [
	{ label: '25%', px: 320, size: 'thumbnail' },
	{ label: '50%', px: 480, size: 'thumbnail' },
	{ label: '75%', px: 800, size: 'medium' },
	{ label: '100%', px: null, size: 'full' }
] as const;

export type ImageWidthPreset = (typeof IMAGE_WIDTH_PRESETS)[number];

export interface ImageDims {
	width: number | null;
	height: number | null;
}

function positive(value: unknown): number | null {
	const n = typeof value === 'string' ? Number.parseInt(value, 10) : Number(value);
	return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

/**
 * New width/height for a width preset. The aspect ratio of the image is kept so the
 * `width`/`height` attributes keep reserving the right box (no layout shift).
 *
 * - `targetWidth` null means "100%": restore the natural size when it is known.
 * - A preset never exceeds the natural width (no upscaling hints).
 * - When the aspect ratio is unknown, both attributes are cleared rather than left stale.
 */
export function resizedImageDims(
	current: ImageDims,
	natural: ImageDims | null,
	targetWidth: number | null
): ImageDims {
	const cw = positive(current.width);
	const ch = positive(current.height);
	const nw = positive(natural?.width);
	const nh = positive(natural?.height);
	const ratio = nw && nh ? nh / nw : cw && ch ? ch / cw : null;
	if (!ratio) return { width: null, height: null };
	const baseWidth = nw ?? null;
	if (targetWidth === null) {
		if (baseWidth) return { width: baseWidth, height: Math.round(baseWidth * ratio) };
		return { width: null, height: null };
	}
	const width = baseWidth ? Math.min(targetWidth, baseWidth) : targetWidth;
	return { width, height: Math.round(width * ratio) };
}

/** Alt text is never invented: an empty alt stays empty (the editor warns, the publish gate flags). */
export function buildInsertedImageAttrs(payload: PickedImagePayload) {
	return {
		src: payload.url,
		alt: payload.alt ?? '',
		width: payload.width ?? null,
		height: payload.height ?? null,
		caption: payload.caption || null,
		size: payload.size || 'full',
		dataAlign: mapPickerAlign(payload.align),
		linkHref: payload.linkUrl || null,
		mediaId: payload.mediaId || null
	};
}

/**
 * Swap the selected image's file for a picked one. Keeps the author's alt, title, alignment,
 * caption and link; re-derives src, width, height, size and mediaId. A node that no longer
 * is the same image (deleted/changed while the picker was open) is left untouched.
 */
export function replaceImageAt(
	editor: Editor,
	position: number,
	originalSrc: string,
	payload: PickedImagePayload
): boolean {
	if (editor.isDestroyed) return false;
	const node = editor.state.doc.nodeAt(position);
	if (node?.type.name !== 'image' || node.attrs['src'] !== originalSrc) return false;
	const existingAlt = typeof node.attrs['alt'] === 'string' ? node.attrs['alt'].trim() : '';
	const patch = {
		src: payload.url,
		alt: existingAlt ? node.attrs['alt'] : (payload.alt ?? ''),
		width: payload.width ?? null,
		height: payload.height ?? null,
		size: payload.size || node.attrs['size'] || 'full',
		mediaId: payload.mediaId || null
	};
	return editor.commands.command(({ tr }) => {
		tr.setNodeMarkup(position, undefined, { ...node.attrs, ...patch });
		tr.setSelection(NodeSelection.create(tr.doc, position));
		return true;
	});
}

/** Position + src of the currently selected image node, or null. */
export function selectedImageTarget(editor: Editor): { pos: number; src: string } | null {
	const { selection } = editor.state;
	if (!(selection instanceof NodeSelection) || selection.node.type.name !== 'image') return null;
	return { pos: selection.from, src: String(selection.node.attrs['src'] ?? '') };
}
