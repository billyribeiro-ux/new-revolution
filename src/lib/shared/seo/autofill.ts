import {
	META_DESCRIPTION_MAX,
	META_DESCRIPTION_MIN,
	META_TITLE_MAX,
	OG_DESCRIPTION_MAX,
	OG_TITLE_MAX,
	TWITTER_DESCRIPTION_MAX,
	TWITTER_TITLE_MAX
} from './meta-budget';
import { normaliseComparisonText, stripHtmlToText } from './toc';

const AUTOFILL_STOP_WORDS = new Set([
	'a',
	'an',
	'and',
	'are',
	'as',
	'at',
	'be',
	'by',
	'for',
	'from',
	'how',
	'in',
	'into',
	'is',
	'it',
	'of',
	'on',
	'or',
	'our',
	'that',
	'the',
	'their',
	'this',
	'to',
	'what',
	'when',
	'where',
	'why',
	'with',
	'you',
	'your'
]);

export function truncateAtWordBoundary(text: string, maxLen: number): string {
	const trimmed = text.replace(/\s+/g, ' ').trim();
	if (trimmed.length <= maxLen) return trimmed;

	const slice = trimmed.slice(0, maxLen);
	const lastSpace = slice.lastIndexOf(' ');
	if (lastSpace >= Math.floor(maxLen * 0.5)) {
		return slice.slice(0, lastSpace).replace(/[,:;.\s]+$/, '');
	}
	return slice.trim();
}

export function deriveMetaDescriptionFromText(excerpt: string, htmlContent: string): string {
	const sourceText = (excerpt?.trim() || stripHtmlToText(htmlContent)).replace(/\s+/g, ' ').trim();
	if (!sourceText) return '';

	const firstSentenceMatch = sourceText.match(/^[^.!?]+[.!?]/);
	const firstSentence = firstSentenceMatch ? firstSentenceMatch[0].trim() : sourceText;

	if (
		firstSentence.length >= META_DESCRIPTION_MIN &&
		firstSentence.length <= META_DESCRIPTION_MAX
	) {
		return firstSentence;
	}

	if (firstSentence.length > META_DESCRIPTION_MAX) {
		return truncateAtWordBoundary(firstSentence, META_DESCRIPTION_MAX);
	}

	// Shorter than 70 chars: take a truncated chunk from the full text up to 155
	return truncateAtWordBoundary(sourceText, META_DESCRIPTION_MAX);
}

export function deriveFocusKeywordFromTitle(title: string): string {
	const words = title
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, ' ')
		.split(/\s+/)
		.filter((w) => w.length >= 2 && !AUTOFILL_STOP_WORDS.has(w));

	return words.slice(0, 2).join(' ');
}

export interface AutofillablePostFields {
	title: string;
	content: string;
	excerpt?: string | null;
	metaTitle?: string | null;
	metaDescription?: string | null;
	ogTitle?: string | null;
	ogDescription?: string | null;
	ogImage?: string | null;
	twitterCardType?: 'summary' | 'summary_large_image' | null;
	twitterTitle?: string | null;
	twitterDescription?: string | null;
	twitterImage?: string | null;
	coverImage?: string | null;
	coverImageAlt?: string | null;
	coverImageCaption?: string | null;
	focusKeyword?: string | null;
	schemaType?: 'Article' | 'BlogPosting' | 'NewsArticle' | 'HowTo' | null;
	language?: string | null;
	canonicalUrl?: string | null;
}

function isBlank(val: string | null | undefined): boolean {
	return !val || val.trim() === '';
}

/**
 * Autofills blank SEO/social fields without ever overwriting non-blank operator values (Section 7.5).
 * Cover alt falls back to caption only when caption does not equal the title, and NEVER defaults to the title.
 * Canonical URL is never filled.
 */
export function applyPostAutofill<T extends AutofillablePostFields>(
	input: T
): T & AutofillablePostFields {
	const out: T & AutofillablePostFields = { ...input };

	if (isBlank(out.metaTitle) && !isBlank(out.title)) {
		out.metaTitle = truncateAtWordBoundary(out.title, META_TITLE_MAX);
	}

	if (isBlank(out.metaDescription)) {
		const derivedDesc = deriveMetaDescriptionFromText(out.excerpt ?? '', out.content);
		if (derivedDesc) {
			out.metaDescription = derivedDesc;
		}
	}

	if (isBlank(out.excerpt) && !isBlank(out.metaDescription)) {
		out.excerpt = out.metaDescription;
	}

	if (isBlank(out.ogTitle) && !isBlank(out.metaTitle)) {
		out.ogTitle = truncateAtWordBoundary(out.metaTitle ?? '', OG_TITLE_MAX);
	}

	if (isBlank(out.ogDescription) && !isBlank(out.metaDescription)) {
		out.ogDescription = truncateAtWordBoundary(out.metaDescription ?? '', OG_DESCRIPTION_MAX);
	}

	if (isBlank(out.ogImage) && !isBlank(out.coverImage)) {
		out.ogImage = out.coverImage;
	}

	if (!out.twitterCardType) {
		out.twitterCardType = 'summary_large_image';
	}

	if (isBlank(out.twitterTitle) && !isBlank(out.ogTitle)) {
		out.twitterTitle = truncateAtWordBoundary(out.ogTitle ?? '', TWITTER_TITLE_MAX);
	}

	if (isBlank(out.twitterDescription) && !isBlank(out.ogDescription)) {
		out.twitterDescription = truncateAtWordBoundary(
			out.ogDescription ?? '',
			TWITTER_DESCRIPTION_MAX
		);
	}

	if (isBlank(out.twitterImage) && !isBlank(out.ogImage)) {
		out.twitterImage = out.ogImage;
	}

	// Cover alt: from caption only if non-empty and not equal to title; never default to title
	if (isBlank(out.coverImageAlt) && !isBlank(out.coverImageCaption)) {
		const caption = (out.coverImageCaption ?? '').trim();
		if (normaliseComparisonText(caption) !== normaliseComparisonText(out.title)) {
			out.coverImageAlt = caption;
		}
	}

	if (isBlank(out.focusKeyword) && !isBlank(out.title)) {
		const kw = deriveFocusKeywordFromTitle(out.title);
		if (kw) {
			out.focusKeyword = kw;
		}
	}

	if (!out.schemaType) {
		out.schemaType = 'BlogPosting';
	}

	if (isBlank(out.language)) {
		out.language = 'en';
	}

	return out;
}
