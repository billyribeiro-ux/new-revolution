import sanitizeHtml from 'sanitize-html';
import { normalizeBlogSearch, parsePostCustomFields } from '../../shared/blog/search.ts';
import { preparePublicPostContent } from './prepared-content.ts';

export interface PostSearchSource {
	title: string;
	content: string;
	excerpt?: string | null;
	customFields?: string | null;
	faqItems?: string | null;
	coverImage?: string | null;
	coverImageCaption?: string | null;
}

const BLOCK_BOUNDARIES = new Set(
	'h1 h2 h3 h4 h5 h6 p div br hr blockquote pre ul ol li dl dt dd figure figcaption table caption thead tbody tfoot tr th td'.split(
		' '
	)
);
const TEXT_ESCAPES: Readonly<Record<string, string>> = { '&amp;': '&', '&lt;': '<', '&gt;': '>' };

/** Parser-backed text: inline nodes remain joined, blocks separate, and attributes never become text. */
export function extractVisiblePostText(preparedHtml: string): string {
	const chunks: string[] = [];
	sanitizeHtml(preparedHtml, {
		allowedTags: [],
		allowedAttributes: {},
		nonTextTags: [
			'head',
			'script',
			'style',
			'textarea',
			'noscript',
			'template',
			'svg',
			'math',
			'iframe'
		],
		onOpenTag(tag) {
			if (BLOCK_BOUNDARIES.has(tag)) chunks.push(' ');
		},
		onCloseTag(tag) {
			if (BLOCK_BOUNDARIES.has(tag)) chunks.push(' ');
		},
		textFilter(text) {
			// sanitize-html already decodes every HTML entity, then escapes exactly &, < and > for this
			// callback. Undo that escaping ONCE; parsing the resulting text as HTML would lose literals.
			chunks.push(text.replace(/&amp;|&lt;|&gt;/g, (entity) => TEXT_ESCAPES[entity]));
			return '';
		}
	});
	return normalizeBlogSearch(chunks.join(''));
}

export function buildPostSearchProjection(source: PostSearchSource): {
	searchText: string;
	searchExcluded: boolean;
} {
	const custom = parsePostCustomFields(source.customFields);
	const body = preparePublicPostContent(source.content, source.title, source.coverImage);
	const authored = [
		source.title,
		source.excerpt ?? '',
		custom.values.get('__subtitle') ?? '',
		custom.values.get('__seriesName') ?? '',
		source.coverImage ? (source.coverImageCaption ?? '') : '',
		extractVisiblePostText(body.html)
	];
	if (source.faqItems) {
		try {
			const faqs: unknown = JSON.parse(source.faqItems);
			if (Array.isArray(faqs))
				for (const faq of faqs) {
					if (
						typeof faq === 'object' &&
						faq !== null &&
						'question' in faq &&
						'answer' in faq &&
						typeof faq.question === 'string' &&
						typeof faq.answer === 'string' &&
						faq.question.trim() &&
						faq.answer.trim()
					) {
						authored.push(faq.question, faq.answer);
					}
				}
		} catch {
			/* Malformed FAQs are also omitted by the public renderer. */
		}
	}
	return {
		searchText: normalizeBlogSearch(authored.join(' ')),
		searchExcluded: custom.excludeFromSearch
	};
}
