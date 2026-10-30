import { Node } from '@tiptap/core';

export interface ParsedTweetUrl {
	url: string;
	author: string;
	tweetId: string;
}

export function normalizeTweetUrl(rawUrl: string): ParsedTweetUrl | null {
	if (!rawUrl || typeof rawUrl !== 'string') return null;
	const trimmed = rawUrl.trim();
	const match = trimmed.match(
		/^https?:\/\/(?:www\.|mobile\.)?(?:twitter\.com|x\.com)\/([A-Za-z0-9_]{1,30})\/status\/(\d+)/i
	);
	if (!match) return null;
	const author = match[1];
	const tweetId = match[2];
	return {
		url: `https://x.com/${author}/status/${tweetId}`,
		author,
		tweetId
	};
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		tweet: {
			setTweetEmbed: (options: { url: string }) => ReturnType;
		};
	}
}

export const Tweet = Node.create({
	name: 'tweet',
	group: 'block',
	atom: true,
	draggable: true,

	addAttributes() {
		return {
			url: {
				default: null
			},
			author: {
				default: null
			},
			tweetId: {
				default: null
			}
		};
	},

	parseHTML() {
		return [
			{
				tag: 'div[data-tweet-url]',
				getAttrs: (node) => {
					const el = node as HTMLElement;
					const rawUrl =
						el.getAttribute('data-tweet-url') || el.querySelector('a')?.getAttribute('href') || '';
					const parsed = normalizeTweetUrl(rawUrl);
					if (!parsed) return false;
					return {
						url: parsed.url,
						author: parsed.author,
						tweetId: parsed.tweetId
					};
				}
			},
			{
				tag: 'blockquote.twitter-tweet',
				getAttrs: (node) => {
					const el = node as HTMLElement;
					const rawUrl = el.querySelector('a')?.getAttribute('href') || '';
					const parsed = normalizeTweetUrl(rawUrl);
					if (!parsed) return false;
					return {
						url: parsed.url,
						author: parsed.author,
						tweetId: parsed.tweetId
					};
				}
			}
		];
	},

	renderHTML({ HTMLAttributes }) {
		const parsed = normalizeTweetUrl(String(HTMLAttributes.url || ''));
		if (!parsed) {
			return ['div', { class: 'tweet-embed' }];
		}

		return [
			'div',
			{
				class: 'tweet-embed',
				'data-tweet-url': parsed.url,
				'data-tweet-id': parsed.tweetId,
				'data-tweet-author': parsed.author
			},
			[
				'blockquote',
				{ class: 'twitter-tweet' },
				['p', {}, `Post on X by @${parsed.author}`],
				[
					'a',
					{
						href: parsed.url,
						target: '_blank',
						rel: 'noopener noreferrer'
					},
					'View post on X'
				]
			]
		];
	},

	addCommands() {
		return {
			setTweetEmbed:
				(options) =>
				({ commands }) => {
					const parsed = normalizeTweetUrl(options.url);
					if (!parsed) return false;
					return commands.insertContent({
						type: this.name,
						attrs: {
							url: parsed.url,
							author: parsed.author,
							tweetId: parsed.tweetId
						}
					});
				}
		};
	}
});
