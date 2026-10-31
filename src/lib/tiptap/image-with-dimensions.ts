import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';
import type { DOMOutputSpec } from '@tiptap/pm/model';

export type ImageAlign = 'left' | 'center' | 'right' | 'full' | null;

function resolveImgElement(element: HTMLElement): HTMLElement {
	if (element.tagName.toLowerCase() === 'img') {
		return element;
	}
	return element.querySelector('img') ?? element;
}

function resolveFigureElement(element: HTMLElement, img: HTMLElement): HTMLElement | null {
	if (element.tagName.toLowerCase() === 'figure') {
		return element;
	}
	return img.closest('figure');
}

function resolveAnchorElement(element: HTMLElement, img: HTMLElement): HTMLElement | null {
	if (element.tagName.toLowerCase() === 'a' && element.hasAttribute('href')) {
		return element;
	}
	return img.closest('a[href]') ?? element.querySelector('a[href]');
}

function normalizeImageAlign(raw: unknown): ImageAlign {
	if (typeof raw !== 'string') return null;
	const lower = raw.trim().toLowerCase();
	if (lower === 'left' || lower === 'center' || lower === 'right' || lower === 'full') {
		return lower;
	}
	return null;
}

function parseImageAlignFromDom(element: HTMLElement): ImageAlign {
	const img = resolveImgElement(element);
	const figure = resolveFigureElement(element, img);

	const directAttr = normalizeImageAlign(
		img.getAttribute('data-align') ?? figure?.getAttribute('data-align')
	);
	if (directAttr) {
		return directAttr;
	}

	const imgClass = img.getAttribute('class') ?? '';
	const blogImgMatch = imgClass.match(/\bblog-image--(left|center|right|full)\b/i);
	if (blogImgMatch?.[1]) {
		return normalizeImageAlign(blogImgMatch[1]);
	}

	const alignImgMatch = imgClass.match(/\balign(left|center|right|full)\b/i);
	if (alignImgMatch?.[1]) {
		return normalizeImageAlign(alignImgMatch[1]);
	}

	const figClass = figure?.getAttribute('class') ?? '';
	const alignFigMatch = figClass.match(/\balign(left|center|right|full)\b/i);
	if (alignFigMatch?.[1]) {
		return normalizeImageAlign(alignFigMatch[1]);
	}

	return null;
}

export const ImageWithDimensions = Image.extend({
	name: 'image',

	parseHTML() {
		return [
			{
				tag: 'figure',
				getAttrs: (node) => {
					const el = node as HTMLElement;
					return el.querySelector('img[src]') ? null : false;
				}
			},
			{
				tag: 'a[href]',
				getAttrs: (node) => {
					const el = node as HTMLElement;
					const img = el.querySelector('img[src]');
					if (!img) return false;
					if ((el.textContent ?? '').trim().length > 0) return false;
					return null;
				}
			},
			{
				tag: 'img[src]'
			}
		];
	},

	addAttributes() {
		return {
			...this.parent?.(),
			src: {
				default: null,
				parseHTML: (element) => resolveImgElement(element).getAttribute('src')
			},
			alt: {
				default: null,
				parseHTML: (element) => resolveImgElement(element).getAttribute('alt')
			},
			title: {
				default: null,
				parseHTML: (element) => resolveImgElement(element).getAttribute('title')
			},
			class: {
				default: 'blog-image',
				parseHTML: () => 'blog-image',
				renderHTML: () => ({ class: 'blog-image' })
			},
			width: {
				default: null,
				parseHTML: (element) => {
					const attr = resolveImgElement(element).getAttribute('width');
					if (!attr) return null;
					const parsed = Number.parseInt(attr, 10);
					return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
				},
				renderHTML: (attributes) => {
					if (!attributes.width) return {};
					return { width: String(attributes.width) };
				}
			},
			height: {
				default: null,
				parseHTML: (element) => {
					const attr = resolveImgElement(element).getAttribute('height');
					if (!attr) return null;
					const parsed = Number.parseInt(attr, 10);
					return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
				},
				renderHTML: (attributes) => {
					if (!attributes.height) return {};
					return { height: String(attributes.height) };
				}
			},
			dataAlign: {
				default: null,
				parseHTML: (element) => parseImageAlignFromDom(element),
				renderHTML: (attributes) => {
					const align = normalizeImageAlign(attributes.dataAlign ?? attributes.align);
					if (!align) return {};
					return { 'data-align': align };
				}
			},
			align: {
				default: null,
				parseHTML: (element) => parseImageAlignFromDom(element),
				renderHTML: () => ({})
			},
			linkHref: {
				default: null,
				parseHTML: (element) => {
					const img = resolveImgElement(element);
					const anchor = resolveAnchorElement(element, img);
					const href = anchor?.getAttribute('href')?.trim();
					return href || null;
				},
				renderHTML: () => ({})
			},
			linkTarget: {
				default: null,
				parseHTML: (element) => {
					const img = resolveImgElement(element);
					const anchor = resolveAnchorElement(element, img);
					const target = anchor?.getAttribute('target')?.trim();
					return target || null;
				},
				renderHTML: () => ({})
			},
			linkRel: {
				default: null,
				parseHTML: (element) => {
					const img = resolveImgElement(element);
					const anchor = resolveAnchorElement(element, img);
					const rel = anchor?.getAttribute('rel')?.trim();
					return rel || null;
				},
				renderHTML: () => ({})
			},
			caption: {
				default: null,
				parseHTML: (element) => {
					const img = resolveImgElement(element);
					const figure = resolveFigureElement(element, img);
					const capEl = figure?.querySelector('figcaption, .wp-caption-text');
					const capText = capEl?.textContent?.trim();
					if (capText) return capText;
					const legacyAttr = img.getAttribute('data-caption')?.trim();
					return legacyAttr || null;
				},
				renderHTML: () => ({})
			},
			size: {
				default: null,
				parseHTML: (element) => resolveImgElement(element).getAttribute('data-size') || null,
				renderHTML: (attributes) => {
					if (!attributes.size) return {};
					return { 'data-size': String(attributes.size) };
				}
			},
			mediaId: {
				default: null,
				parseHTML: (element) => resolveImgElement(element).getAttribute('data-media-id') || null,
				renderHTML: (attributes) => {
					if (!attributes.mediaId) return {};
					return { 'data-media-id': String(attributes.mediaId) };
				}
			}
		};
	},

	renderHTML({ node, HTMLAttributes }) {
		const align = normalizeImageAlign(node.attrs.dataAlign ?? node.attrs.align);
		const imgAttrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
			class: 'blog-image',
			...(align ? { 'data-align': align } : {})
		});
		delete (imgAttrs as Record<string, unknown>)['data-caption'];

		const imgSpec: DOMOutputSpec = ['img', imgAttrs];

		const linkHref =
			typeof node.attrs.linkHref === 'string' && node.attrs.linkHref.trim().length > 0
				? node.attrs.linkHref.trim()
				: null;

		const linkedSpec: DOMOutputSpec = linkHref
			? [
					'a',
					{
						href: linkHref,
						target:
							typeof node.attrs.linkTarget === 'string' && node.attrs.linkTarget.trim().length > 0
								? node.attrs.linkTarget.trim()
								: '_blank',
						rel:
							typeof node.attrs.linkRel === 'string' && node.attrs.linkRel.trim().length > 0
								? node.attrs.linkRel.trim()
								: 'noopener noreferrer'
					},
					imgSpec
				]
			: imgSpec;

		const caption =
			typeof node.attrs.caption === 'string' && node.attrs.caption.trim().length > 0
				? node.attrs.caption.trim()
				: null;

		if (caption) {
			return ['figure', { class: 'blog-image-figure' }, linkedSpec, ['figcaption', {}, caption]];
		}

		return linkedSpec;
	}
});
