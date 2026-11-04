export const SLUG_MIN_LEN = 3;
export const SLUG_TARGET_LEN = 70;
export const SLUG_MAX_LEN = 75;

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * 22 trailing stub words stripped by save-time `generateSlug` (Section 7.3).
 * Kept separate from the 17-word SEO gate stop-word list in `score.ts` (Section 7.6).
 */
export const SLUG_TRAILING_STUB_WORDS = new Set([
	'a',
	'an',
	'and',
	'at',
	'be',
	'but',
	'by',
	'for',
	'from',
	'in',
	'is',
	'it',
	'of',
	'on',
	'or',
	'our',
	'so',
	'the',
	'to',
	'we',
	'with',
	'you'
]);

export const RESERVED_SLUGS = new Set([
	'admin',
	'api',
	'archive',
	'author',
	'authors',
	'blog',
	'blogs',
	'categories',
	'category',
	'create',
	'delete',
	'draft',
	'edit',
	'feed',
	'index',
	'login',
	'logout',
	'media',
	'new',
	'page',
	'preview',
	'publish',
	'register',
	'rss',
	'rss-xml',
	'search',
	'settings',
	'sitemap',
	'sitemap-xml',
	'tag',
	'tags',
	'trash'
]);

export function isReservedSlug(slug: string): boolean {
	return RESERVED_SLUGS.has(slug.trim().toLowerCase());
}

/**
 * Typing-time slug normaliser:
 * - lowercase
 * - strip diacritics
 * - collapse non-alphanumerics to hyphens
 * - trim leading/trailing hyphens
 * - clip at a hyphen if one lies beyond 50% of maxLen, else hard-clip and trim trailing hyphens
 */
export function normaliseSlug(text: string, maxLen: number = SLUG_MAX_LEN): string {
	let cleaned = text
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

	if (cleaned.length > maxLen) {
		const truncated = cleaned.slice(0, maxLen);
		const lastHyphen = truncated.lastIndexOf('-');
		if (lastHyphen >= Math.floor(maxLen * 0.5)) {
			cleaned = truncated.slice(0, lastHyphen);
		} else {
			cleaned = truncated;
		}
		cleaned = cleaned.replace(/-+$/g, '');
	}

	return cleaned;
}

/**
 * Save-time slug generator:
 * - runs `normaliseSlug(text, maxLen)`
 * - strips trailing stub words (Section 7.3) while keeping length >= SLUG_MIN_LEN
 */
export function generateSlug(text: string, maxLen: number = SLUG_MAX_LEN): string {
	const base = normaliseSlug(text, maxLen);
	if (!base) return '';

	const parts = base.split('-').filter(Boolean);
	while (parts.length > 1 && SLUG_TRAILING_STUB_WORDS.has(parts[parts.length - 1])) {
		const candidate = parts.slice(0, -1).join('-');
		if (candidate.length < SLUG_MIN_LEN) break;
		parts.pop();
	}

	return parts.join('-');
}

export function isValidSlug(slug: string): boolean {
	if (slug.length < SLUG_MIN_LEN || slug.length > SLUG_MAX_LEN) return false;
	if (isReservedSlug(slug)) return false;
	return SLUG_REGEX.test(slug);
}
