import { hasEmOrEnDash } from './content-transform';
import {
	CONTENT_MIN_WORDS,
	CONTENT_THIN_WORDS,
	META_DESCRIPTION_MAX,
	META_DESCRIPTION_MIN,
	META_TITLE_MAX,
	META_TITLE_MIN,
	PUBLISH_GATE_MIN_SCORE
} from './meta-budget';
import { SLUG_TARGET_LEN } from './slug';
import { countContentWords, normaliseComparisonText, stripHtmlToText } from './toc';

export const PLACEHOLDER_SENTINEL =
	'IMAGE PLACEHOLDER (replace with a real image before publishing)';

/**
 * 17-word stop-word set used ONLY by the SEO gate's slug stop-word check (Section 7.6).
 * Kept separate from the 22-word trailing-stub list in `slug.ts`.
 */
export const GATE_SLUG_STOP_WORDS = new Set([
	'the',
	'and',
	'for',
	'are',
	'but',
	'not',
	'you',
	'all',
	'can',
	'had',
	'her',
	'was',
	'one',
	'our',
	'out',
	'with',
	'from'
]);

const EXCLUDED_EXTERNAL_AUTHORITY_DOMAINS = new Set([
	'facebook.com',
	'instagram.com',
	'linkedin.com',
	'pinterest.com',
	'reddit.com',
	'threads.net',
	'tiktok.com',
	'twitter.com',
	'x.com',
	'youtube.com',
	'youtu.be',
	't.co',
	'bit.ly',
	'goo.gl',
	'tinyurl.com'
]);

export type SeoIssueSeverity = 'error' | 'warn';

export interface SeoIssue {
	id: string;
	severity: SeoIssueSeverity;
	points: number;
	blocking: boolean;
	message: string;
}

export type SeoRatingBand = 'good' | 'warning' | 'bad';

export interface SeoScoreResult {
	score: number;
	publishable: boolean;
	band: SeoRatingBand;
	label: 'Excellent' | 'Needs Work' | 'Poor';
	issues: SeoIssue[];
	wordCount: number;
	externalAuthorityDomains: string[];
}

export interface SeoScoreInput {
	title: string;
	slug: string;
	content: string;
	excerpt?: string | null;
	metaTitle?: string | null;
	metaDescription?: string | null;
	coverImage?: string | null;
	coverImageAlt?: string | null;
	coverImageCaption?: string | null;
	ogTitle?: string | null;
	ogDescription?: string | null;
	ogImage?: string | null;
	twitterTitle?: string | null;
	twitterDescription?: string | null;
	authorId?: number | null;
	categoryId?: number | null;
	categoryIds?: number[];
	tagIds?: number[];
	focusKeyword?: string | null;
	secondaryKeywords?: string | null;
	faqItems?: string | null;
	publishedAt?: string | Date | null;
	updatedAt?: string | Date | null;
	ownDomain?: string;
}

export function getSeoScoreBand(score: number): {
	band: SeoRatingBand;
	label: 'Excellent' | 'Needs Work' | 'Poor';
} {
	if (score >= PUBLISH_GATE_MIN_SCORE) {
		return { band: 'good', label: 'Excellent' };
	}
	if (score >= 50) {
		return { band: 'warning', label: 'Needs Work' };
	}
	return { band: 'bad', label: 'Poor' };
}

function getAttrFromTag(tag: string, attrName: string): string | undefined {
	const regex = new RegExp(`\\b${attrName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>"']+))`, 'i');
	const match = tag.match(regex);
	if (!match) return undefined;
	return match[1] ?? match[2] ?? match[3] ?? '';
}

function extractBodyImages(html: string): Array<{
	width?: string;
	height?: string;
	alt?: string;
}> {
	const out: Array<{ width?: string; height?: string; alt?: string }> = [];
	for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
		const tag = match[0];
		out.push({
			width: getAttrFromTag(tag, 'width')?.trim(),
			height: getAttrFromTag(tag, 'height')?.trim(),
			alt: getAttrFromTag(tag, 'alt')
		});
	}
	return out;
}

export function extractExternalAuthorityDomains(
	html: string,
	ownDomain: string = 'revolutiontradingpros.com'
): string[] {
	const cleanOwn = ownDomain.toLowerCase().replace(/^www\./, '');
	const domains = new Set<string>();

	for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
		const href = getAttrFromTag(match[0], 'href')?.trim();
		if (!href || !/^https?:\/\//i.test(href)) continue;

		try {
			const url = new URL(href);
			if (url.protocol !== 'http:' && url.protocol !== 'https:') continue;
			const host = url.hostname.toLowerCase().replace(/^www\./, '');
			if (!host) continue;
			if (host === cleanOwn || host.endsWith(`.${cleanOwn}`)) continue;
			if (host === 'localhost' || host.endsWith('.local') || host === '127.0.0.1') continue;

			let isExcludedSocial = false;
			for (const social of EXCLUDED_EXTERNAL_AUTHORITY_DOMAINS) {
				if (host === social || host.endsWith(`.${social}`)) {
					isExcludedSocial = true;
					break;
				}
			}
			if (!isExcludedSocial) {
				domains.add(host);
			}
		} catch {
			// Ignore malformed URLs
		}
	}

	return [...domains];
}

function hasDuplicateHeadingMatchingTitle(html: string, title: string): boolean {
	const normTitle = normaliseComparisonText(title);
	if (!normTitle) return false;

	for (const match of html.matchAll(/<h([12])\b[^>]*>([\s\S]*?)<\/h\1>/gis)) {
		if (normaliseComparisonText(stripHtmlToText(match[2])) === normTitle) {
			return true;
		}
	}
	return false;
}

function parseFaqItemsList(
	rawFaq: string | null | undefined
): Array<{ question: string; answer: string }> {
	if (!rawFaq || !rawFaq.trim()) return [];
	try {
		const parsed: unknown = JSON.parse(rawFaq);
		if (!Array.isArray(parsed)) return [];
		return parsed
			.filter(
				(item): item is { question: string; answer: string } =>
					typeof item === 'object' &&
					item !== null &&
					typeof (item as { question?: unknown }).question === 'string' &&
					typeof (item as { answer?: unknown }).answer === 'string'
			)
			.filter((item) => item.question.trim().length > 0 || item.answer.trim().length > 0);
	} catch {
		return [];
	}
}

function hasAnyEmOrEnDashInPost(input: SeoScoreInput): boolean {
	const stringsToCheck = [
		input.content,
		input.title,
		input.metaTitle,
		input.metaDescription,
		input.excerpt,
		input.coverImageAlt,
		input.coverImageCaption,
		input.ogTitle,
		input.ogDescription,
		input.twitterTitle,
		input.twitterDescription,
		input.faqItems
	];
	return stringsToCheck.some((s) => hasEmOrEnDash(s));
}

export function getSeoScore(input: SeoScoreInput): SeoScoreResult {
	const issues: SeoIssue[] = [];
	const addIssue = (
		id: string,
		severity: SeoIssueSeverity,
		points: number,
		blocking: boolean,
		message: string
	) => {
		issues.push({ id, severity, points, blocking, message });
	};

	const metaTitle = (input.metaTitle ?? '').trim();
	const metaDescription = (input.metaDescription ?? '').trim();
	const coverImage = (input.coverImage ?? '').trim();
	const ogImage = (input.ogImage ?? '').trim();
	const coverAlt = (input.coverImageAlt ?? '').trim();
	const excerpt = (input.excerpt ?? '').trim();
	const focusKeyword = (input.focusKeyword ?? '').trim();
	const slug = (input.slug ?? '').trim();
	const content = input.content ?? '';
	const plainBody = stripHtmlToText(content);
	const wordCount = countContentWords(content);

	// 1. Meta title checks
	if (!metaTitle) {
		addIssue('missing_meta_title', 'error', 10, true, 'Missing meta title.');
	} else {
		if (metaTitle.length > META_TITLE_MAX) {
			addIssue(
				'meta_title_too_long',
				'warn',
				5,
				false,
				`Meta title exceeds ${META_TITLE_MAX} characters (${metaTitle.length}/${META_TITLE_MAX}).`
			);
		}
		if (metaTitle.length < META_TITLE_MIN) {
			addIssue(
				'meta_title_too_short',
				'warn',
				5,
				false,
				`Meta title is shorter than ${META_TITLE_MIN} characters (${metaTitle.length}/${META_TITLE_MIN}).`
			);
		}
		if (/^[a-z]/.test(metaTitle)) {
			addIssue(
				'meta_title_lowercase',
				'error',
				10,
				true,
				'Meta title starts with a lowercase letter.'
			);
		}
	}

	// 2. Meta description checks
	if (!metaDescription) {
		addIssue('missing_meta_description', 'error', 10, true, 'Missing meta description.');
	} else {
		if (metaDescription.length > META_DESCRIPTION_MAX) {
			addIssue(
				'meta_description_too_long',
				'warn',
				5,
				false,
				`Meta description exceeds ${META_DESCRIPTION_MAX} characters (${metaDescription.length}/${META_DESCRIPTION_MAX}).`
			);
		}
		if (metaDescription.length < META_DESCRIPTION_MIN) {
			addIssue(
				'meta_description_too_short',
				'warn',
				5,
				false,
				`Meta description is shorter than ${META_DESCRIPTION_MIN} characters (${metaDescription.length}/${META_DESCRIPTION_MIN}).`
			);
		}
	}

	// 3. Cover & OG image checks
	if (!coverImage && !ogImage) {
		addIssue(
			'missing_cover_and_og_image',
			'error',
			10,
			true,
			'Missing both cover image and Open Graph image.'
		);
	}
	if (coverImage) {
		if (!coverAlt) {
			addIssue(
				'missing_cover_alt',
				'error',
				10,
				true,
				'Cover image is set, but cover alt text is blank.'
			);
		} else if (
			input.title.trim() &&
			normaliseComparisonText(coverAlt) === normaliseComparisonText(input.title)
		) {
			addIssue(
				'cover_alt_equals_title',
				'error',
				10,
				true,
				'Cover image alt text must describe the image, not duplicate the post title.'
			);
		}
	}

	// 4. Body image checks
	const bodyImages = extractBodyImages(content);
	if (bodyImages.some((img) => !img.width || !img.height)) {
		addIssue(
			'body_img_missing_dimensions',
			'warn',
			4,
			false,
			'One or more body images are missing explicit width or height attributes.'
		);
	}
	if (bodyImages.length > 0 && focusKeyword) {
		const kwLower = focusKeyword.toLowerCase();
		const anyHasKeyword = bodyImages.some((img) => (img.alt ?? '').toLowerCase().includes(kwLower));
		if (!anyHasKeyword) {
			addIssue(
				'body_img_missing_keyword_alt',
				'warn',
				3,
				false,
				`No body image alt text includes the focus keyword "${focusKeyword}".`
			);
		}
	}

	// 5. Excerpt check
	if (!excerpt) {
		addIssue('missing_excerpt', 'warn', 5, false, 'Missing post excerpt.');
	}

	// 6. Author, category, tags checks
	if (!input.authorId) {
		addIssue('missing_author', 'error', 8, true, 'Post must have an assigned author.');
	}

	const hasCategory =
		Boolean(input.categoryId) || (Array.isArray(input.categoryIds) && input.categoryIds.length > 0);
	if (!hasCategory) {
		addIssue('missing_category', 'error', 5, true, 'Post must have at least one category.');
	}

	const tagCount = Array.isArray(input.tagIds) ? new Set(input.tagIds).size : 0;
	if (tagCount === 0) {
		addIssue('zero_tags', 'error', 5, true, 'Post must have at least one tag.');
	} else if (tagCount === 1) {
		addIssue('single_tag', 'warn', 2, false, 'Add at least 2 tags for stronger topic clustering.');
	}

	// 7. Focus keyword checks
	if (!focusKeyword) {
		addIssue('missing_focus_keyword', 'error', 8, false, 'Missing focus keyword.');
	} else {
		const kwLower = focusKeyword.toLowerCase();
		const kwSlug = kwLower.replace(/\s+/g, '-');

		if (metaTitle && !metaTitle.toLowerCase().includes(kwLower)) {
			addIssue(
				'keyword_missing_in_meta_title',
				'warn',
				5,
				false,
				`Focus keyword "${focusKeyword}" is missing from the meta title.`
			);
		}
		if (!metaDescription.toLowerCase().includes(kwLower)) {
			addIssue(
				'keyword_missing_in_meta_description',
				'warn',
				5,
				false,
				`Focus keyword "${focusKeyword}" is missing from the meta description.`
			);
		}
		if (!slug.toLowerCase().includes(kwSlug)) {
			addIssue(
				'keyword_missing_in_slug',
				'warn',
				3,
				false,
				`Focus keyword "${kwSlug}" is missing from the URL slug.`
			);
		}
		if (!plainBody.toLowerCase().includes(kwLower)) {
			addIssue(
				'keyword_missing_in_body',
				'warn',
				5,
				false,
				`Focus keyword "${focusKeyword}" does not appear in the post body.`
			);
		}
	}

	// 8. Word count checks
	if (wordCount < CONTENT_THIN_WORDS) {
		addIssue(
			'words_below_300',
			'error',
			10,
			true,
			`Content has ${wordCount} words; minimum required to publish is ${CONTENT_THIN_WORDS} words.`
		);
	} else if (wordCount < CONTENT_MIN_WORDS) {
		addIssue(
			'words_below_600',
			'warn',
			3,
			false,
			`Content has ${wordCount} words; aim for ${CONTENT_MIN_WORDS}+ words for comprehensive depth.`
		);
	}

	// 9. Body h1/h2 duplicate title check
	if (hasDuplicateHeadingMatchingTitle(content, input.title)) {
		addIssue(
			'duplicate_title_heading',
			'warn',
			3,
			false,
			'Body contains an H1 or H2 heading that duplicates the post title.'
		);
	}

	// 10. Slug length & stop words checks
	if (slug.length > SLUG_TARGET_LEN) {
		addIssue(
			'slug_over_70',
			'warn',
			3,
			false,
			`Slug is ${slug.length} characters; keep slugs at or under ${SLUG_TARGET_LEN} characters.`
		);
	}
	if (slug) {
		const slugTokens = slug.toLowerCase().split('-').filter(Boolean);
		const stopWordHits = slugTokens.filter((token) => GATE_SLUG_STOP_WORDS.has(token));
		if (stopWordHits.length >= 3) {
			addIssue(
				'slug_too_many_stop_words',
				'warn',
				3,
				false,
				`Slug contains ${stopWordHits.length} stop words (${stopWordHits.join(', ')}); keep stop words under 3.`
			);
		}
	}

	// 11. External authority links
	const externalAuthorityDomains = extractExternalAuthorityDomains(content, input.ownDomain);
	if (externalAuthorityDomains.length === 0) {
		addIssue(
			'zero_external_authority_domains',
			'error',
			12,
			true,
			'Content must link to at least 1 external authority domain.'
		);
	} else if (externalAuthorityDomains.length === 1) {
		addIssue(
			'one_external_authority_domain',
			'error',
			8,
			false,
			'Content links to only 1 external authority domain; 2+ distinct domains are recommended.'
		);
	}

	// 12. FAQ checks
	const faqList = parseFaqItemsList(input.faqItems);
	if (faqList.length === 0) {
		addIssue('no_faq_items', 'warn', 5, false, 'No FAQ items added; aim for 3 or more Q&A pairs.');
	} else if (faqList.length < 3) {
		addIssue(
			'fewer_than_3_faq_items',
			'warn',
			3,
			false,
			`Only ${faqList.length} FAQ item(s) configured; aim for 3 or more.`
		);
	} else if (faqList.some((item) => item.answer.trim().length < 40)) {
		addIssue(
			'short_faq_answer',
			'warn',
			2,
			false,
			'One or more FAQ answers are shorter than 40 characters.'
		);
	}

	// 13. Freshness check (evaluated only when both publishedAt and updatedAt are supplied)
	if (input.publishedAt && input.updatedAt) {
		const pubMs =
			input.publishedAt instanceof Date
				? input.publishedAt.getTime()
				: Date.parse(input.publishedAt);
		const updMs =
			input.updatedAt instanceof Date ? input.updatedAt.getTime() : Date.parse(input.updatedAt);

		if (!Number.isNaN(pubMs) && !Number.isNaN(updMs)) {
			const within24h = Math.abs(updMs - pubMs) <= 24 * 60 * 60 * 1000;
			const ageDays = (Date.now() - pubMs) / (24 * 60 * 60 * 1000);
			if (within24h && ageDays > 180) {
				addIssue(
					'stale_unupdated_post',
					'warn',
					4,
					false,
					'Post was published over 180 days ago and has not been updated after its initial 24-hour window.'
				);
			}
		}
	}

	// 14. Unresolved placeholder sentinel check (-100, blocking: true)
	if (content.includes(PLACEHOLDER_SENTINEL)) {
		addIssue(
			'unresolved_placeholder_sentinel',
			'error',
			100,
			true,
			`Content contains an unresolved placeholder ("${PLACEHOLDER_SENTINEL}").`
		);
	}

	// 15. Em or en dash check (-25, blocking: true)
	if (hasAnyEmOrEnDashInPost(input)) {
		addIssue(
			'contains_em_or_en_dash',
			'error',
			25,
			true,
			'Content or metadata contains an em dash or en dash. Replace with commas, colons, parentheses, or "to".'
		);
	}

	// Sort issues so blocking issues appear first, then non-blocking errors, then warnings
	issues.sort((a, b) => {
		if (a.blocking !== b.blocking) return a.blocking ? -1 : 1;
		if (a.severity !== b.severity) return a.severity === 'error' ? -1 : 1;
		return b.points - a.points;
	});

	const totalDeductions = issues.reduce((acc, issue) => acc + issue.points, 0);
	const score = Math.max(0, Math.min(100, 100 - totalDeductions));
	const hasBlockingIssue = issues.some((issue) => issue.blocking);
	const publishable = score >= PUBLISH_GATE_MIN_SCORE && !hasBlockingIssue;
	const { band, label } = getSeoScoreBand(score);

	return {
		score,
		publishable,
		band,
		label,
		issues,
		wordCount,
		externalAuthorityDomains
	};
}

export function enforcePublishSeoGate(input: SeoScoreInput): SeoScoreResult {
	const result = getSeoScore(input);
	if (result.publishable) {
		return result;
	}

	const errorIssues = result.issues.filter((i) => i.blocking || i.severity === 'error');
	const warnIssues = result.issues.filter((i) => !i.blocking && i.severity === 'warn').slice(0, 3);

	const lines: string[] = [
		`SEO_GATE_BLOCKED: SEO score is ${result.score}/100 (minimum required: ${PUBLISH_GATE_MIN_SCORE}/100 with zero blocking errors).`
	];

	if (errorIssues.length > 0) {
		lines.push('', 'Errors (items marked [BLOCKING] stop publishing on their own):');
		for (const err of errorIssues) {
			const tag = err.blocking ? '[BLOCKING] ' : '';
			lines.push(`- ${tag}${err.message} (-${err.points})`);
		}
	}

	if (warnIssues.length > 0) {
		lines.push('', 'Top warnings:');
		for (const warn of warnIssues) {
			lines.push(`- ${warn.message} (-${warn.points})`);
		}
	}

	throw new Error(lines.join('\n'));
}
