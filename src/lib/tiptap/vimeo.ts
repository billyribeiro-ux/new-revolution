import { Node, mergeAttributes } from '@tiptap/core';

export function extractVimeoId(rawUrl: string): string | null {
	if (!rawUrl || typeof rawUrl !== 'string') return null;
	const trimmed = rawUrl.trim();
	const match =
		trimmed.match(
			/^https?:\/\/(?:www\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|video\/|)(\d+)(?:|\/\?)/i
		) || trimmed.match(/^https?:\/\/player\.vimeo\.com\/video\/(\d+)/i);
	return match?.[1] ?? null;
}

export function buildVimeoEmbedUrl(rawUrl: string): string | null {
	const id = extractVimeoId(rawUrl);
	if (!id) return null;
	return `https://player.vimeo.com/video/${id}?dnt=1`;
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		vimeo: {
			setVimeoVideo: (options: {
				src: string;
				width?: number;
				height?: number;
				title?: string;
			}) => ReturnType;
		};
	}
}

export const Vimeo = Node.create({
	name: 'vimeo',
	group: 'block',
	atom: true,
	draggable: true,

	addAttributes() {
		return {
			src: {
				default: null
			},
			width: {
				default: 640
			},
			height: {
				default: 360
			},
			title: {
				default: 'Vimeo video player'
			}
		};
	},

	parseHTML() {
		return [
			{
				tag: 'div[data-vimeo-video]',
				getAttrs: (node) => {
					const el = node as HTMLElement;
					const iframe = el.querySelector('iframe');
					const rawSrc = iframe?.getAttribute('src') || el.getAttribute('data-src') || '';
					const embedUrl = buildVimeoEmbedUrl(rawSrc);
					if (!embedUrl) return false;
					return {
						src: embedUrl,
						width: Number(iframe?.getAttribute('width') || 640),
						height: Number(iframe?.getAttribute('height') || 360),
						title: iframe?.getAttribute('title') || 'Vimeo video player'
					};
				}
			},
			{
				tag: 'iframe[src*="player.vimeo.com/video/"]',
				getAttrs: (node) => {
					const el = node as HTMLElement;
					const rawSrc = el.getAttribute('src') || '';
					const embedUrl = buildVimeoEmbedUrl(rawSrc);
					if (!embedUrl) return false;
					return {
						src: embedUrl,
						width: Number(el.getAttribute('width') || 640),
						height: Number(el.getAttribute('height') || 360),
						title: el.getAttribute('title') || 'Vimeo video player'
					};
				}
			}
		];
	},

	renderHTML({ HTMLAttributes }) {
		const embedUrl = buildVimeoEmbedUrl(String(HTMLAttributes.src || ''));
		if (!embedUrl) {
			return ['div', { 'data-vimeo-video': '', class: 'vimeo-embed' }];
		}
		return [
			'div',
			{ 'data-vimeo-video': '', class: 'vimeo-embed' },
			[
				'iframe',
				mergeAttributes({
					src: embedUrl,
					width: String(HTMLAttributes.width || 640),
					height: String(HTMLAttributes.height || 360),
					frameborder: '0',
					allow: 'autoplay; fullscreen; picture-in-picture',
					allowfullscreen: 'true',
					loading: 'lazy',
					title: String(HTMLAttributes.title || 'Vimeo video player')
				})
			]
		];
	},

	addCommands() {
		return {
			setVimeoVideo:
				(options) =>
				({ commands }) => {
					const embedUrl = buildVimeoEmbedUrl(options.src);
					if (!embedUrl) return false;
					return commands.insertContent({
						type: this.name,
						attrs: {
							src: embedUrl,
							width: options.width ?? 640,
							height: options.height ?? 360,
							title: options.title ?? 'Vimeo video player'
						}
					});
				}
		};
	}
});
