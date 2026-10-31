import type {
	PostStatus,
	PostVisibility,
	PostSchemaType,
	TwitterCardType,
	PostTemplate,
	PostFormat
} from '#lib/shared/schemas/posts';

export interface FaqFormItem {
	question: string;
	answer: string;
}

export interface CustomFieldFormItem {
	key: string;
	value: string;
}

export interface PostEditorFormState {
	id: number | null;
	title: string;
	slug: string;
	slugManuallyEdited: boolean;
	subtitle: string;
	excerpt: string;
	content: string;
	coverImage: string;
	coverImageAlt: string;
	coverImageCaption: string;
	categoryId: number | null;
	categoryIds: number[];
	tagIds: number[];
	relatedPostIds: number[];
	authorId: number | null;
	coAuthorIds: string;
	status: PostStatus;
	visibility: PostVisibility;
	passwordPlaintext: string;
	clearPassword: boolean;
	hasExistingPassword: boolean;
	featured: boolean;
	featuredOrder: number;
	isPillar: boolean;
	isSticky: boolean;
	pinned: boolean;
	commentsEnabled: boolean;
	allowComments: boolean;
	pingbacksEnabled: boolean;
	excludeFromSearch: boolean;
	enableToc: boolean;
	readingTime: number;
	wordCount: number;
	metaTitle: string;
	metaDescription: string;
	focusKeyword: string;
	secondaryKeywords: string[];
	canonicalUrl: string;
	ogTitle: string;
	ogDescription: string;
	ogImage: string;
	twitterTitle: string;
	twitterDescription: string;
	twitterImage: string;
	twitterCardType: TwitterCardType;
	robotsNoindex: boolean;
	robotsNofollow: boolean;
	noindex: boolean;
	nofollow: boolean;
	noarchive: boolean;
	nosnippet: boolean;
	maxImagePreview: string;
	maxSnippet: number;
	schemaType: PostSchemaType;
	faqItems: FaqFormItem[];
	customJsonLd: string;
	seoScore: number;
	readabilityScore: number;
	template: PostTemplate;
	postFormat: PostFormat;
	format: PostFormat;
	language: string;
	translations: string;
	seriesName: string;
	seriesOrder: number | null;
	customCss: string;
	customFields: CustomFieldFormItem[];
	publishedAt: string;
	scheduledAt: string;
	expiresAt: string;
	lastEditedBy: string;
	revisionNotes: string;
	expectedUpdatedAt: string | null;
}

export const DEFAULT_NEW_POST_SCAFFOLD =
	'<h2>Key Takeaways</h2><ul><li>Summarize the primary trading setup and risk parameters.</li><li>Highlight key execution levels and invalidation criteria.</li></ul><h2>Core Strategy Overview</h2><p>Outline the market structure, institutional order flow context, and entry rules.</p><p>IMAGE PLACEHOLDER (replace with a real image before publishing)</p><h2>Execution &amp; Risk Management</h2><p>Detail position sizing, stop placement, and target scaling.</p>';

const repeaterRowKeys = new WeakMap<object, number>();
let nextRepeaterRowKey = 1;

/**
 * Stable WeakMap row key generator for repeater items (FAQ rows, custom fields)
 * so deleting or reordering items never shifts focus or DOM identity by index.
 */
export function getObjectRowKey(item: object): number {
	let existing = repeaterRowKeys.get(item);
	if (existing === undefined) {
		existing = nextRepeaterRowKey++;
		repeaterRowKeys.set(item, existing);
	}
	return existing;
}

export const MAIN_EDITOR_TAB_VALUES = [
	'content',
	'seo',
	'faq',
	'twitter',
	'advanced',
	'readability'
] as const;
export type MainEditorTab = (typeof MAIN_EDITOR_TAB_VALUES)[number];

export const MAIN_EDITOR_TAB_STORAGE_KEY = 'wp-editor-active-tab';

export function loadActiveMainTab(): MainEditorTab {
	if (typeof localStorage === 'undefined') return 'content';
	try {
		const raw = localStorage.getItem(MAIN_EDITOR_TAB_STORAGE_KEY);
		if (raw && (MAIN_EDITOR_TAB_VALUES as readonly string[]).includes(raw)) {
			return raw as MainEditorTab;
		}
	} catch {
		// ignore storage errors
	}
	return 'content';
}

export function saveActiveMainTab(tab: MainEditorTab): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(MAIN_EDITOR_TAB_STORAGE_KEY, tab);
	} catch {
		// ignore storage errors
	}
}

export interface SidebarPanelState {
	publish: boolean;
	author: boolean;
	categories: boolean;
	featuredImage: boolean;
	tags: boolean;
	postAttributes: boolean;
	toc: boolean;
	customFields: boolean;
}

export const DEFAULT_SIDEBAR_PANEL_STATE: SidebarPanelState = {
	publish: true,
	author: true,
	categories: true,
	featuredImage: true,
	tags: true,
	postAttributes: true,
	toc: false,
	customFields: false
};

export const SIDEBAR_PANELS_STORAGE_KEY = 'wp-editor-panels';

export function loadSidebarPanelState(): SidebarPanelState {
	if (typeof localStorage === 'undefined') return { ...DEFAULT_SIDEBAR_PANEL_STATE };
	try {
		const raw = localStorage.getItem(SIDEBAR_PANELS_STORAGE_KEY);
		if (!raw) return { ...DEFAULT_SIDEBAR_PANEL_STATE };
		const parsed = JSON.parse(raw) as Partial<Record<keyof SidebarPanelState, unknown>>;
		if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_SIDEBAR_PANEL_STATE };
		return {
			publish:
				typeof parsed.publish === 'boolean' ? parsed.publish : DEFAULT_SIDEBAR_PANEL_STATE.publish,
			author:
				typeof parsed.author === 'boolean' ? parsed.author : DEFAULT_SIDEBAR_PANEL_STATE.author,
			categories:
				typeof parsed.categories === 'boolean'
					? parsed.categories
					: DEFAULT_SIDEBAR_PANEL_STATE.categories,
			featuredImage:
				typeof parsed.featuredImage === 'boolean'
					? parsed.featuredImage
					: DEFAULT_SIDEBAR_PANEL_STATE.featuredImage,
			tags: typeof parsed.tags === 'boolean' ? parsed.tags : DEFAULT_SIDEBAR_PANEL_STATE.tags,
			postAttributes:
				typeof parsed.postAttributes === 'boolean'
					? parsed.postAttributes
					: DEFAULT_SIDEBAR_PANEL_STATE.postAttributes,
			toc: typeof parsed.toc === 'boolean' ? parsed.toc : DEFAULT_SIDEBAR_PANEL_STATE.toc,
			customFields:
				typeof parsed.customFields === 'boolean'
					? parsed.customFields
					: DEFAULT_SIDEBAR_PANEL_STATE.customFields
		};
	} catch {
		return { ...DEFAULT_SIDEBAR_PANEL_STATE };
	}
}

export function saveSidebarPanelState(state: SidebarPanelState): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(SIDEBAR_PANELS_STORAGE_KEY, JSON.stringify(state));
	} catch {
		// ignore storage errors
	}
}

/**
 * Serializes `{ form, postFormat, customFields }` excluding transient server timestamps
 * so `PostEditor` can compare pre-save vs post-save state and preserve `isDirty = true`
 * when the operator types while a save request is in flight (Section 4.9).
 */
export function serializeEditorSnapshot(form: PostEditorFormState): string {
	return JSON.stringify({
		form: {
			...form,
			expectedUpdatedAt: null,
			seoScore: 0,
			readabilityScore: 0,
			readingTime: 0,
			wordCount: 0
		},
		postFormat: form.postFormat || form.format,
		customFields: form.customFields
	});
}

export function createEmptyForm(): PostEditorFormState {
	return {
		id: null,
		title: '',
		slug: '',
		slugManuallyEdited: false,
		subtitle: '',
		excerpt: '',
		content: DEFAULT_NEW_POST_SCAFFOLD,
		coverImage: '',
		coverImageAlt: '',
		coverImageCaption: '',
		categoryId: null,
		categoryIds: [],
		tagIds: [],
		relatedPostIds: [],
		authorId: null,
		coAuthorIds: '',
		status: 'draft',
		visibility: 'public',
		passwordPlaintext: '',
		clearPassword: false,
		hasExistingPassword: false,
		featured: false,
		featuredOrder: 0,
		isPillar: false,
		isSticky: false,
		pinned: false,
		commentsEnabled: true,
		allowComments: true,
		pingbacksEnabled: false,
		excludeFromSearch: false,
		enableToc: true,
		readingTime: 1,
		wordCount: 0,
		metaTitle: '',
		metaDescription: '',
		focusKeyword: '',
		secondaryKeywords: [],
		canonicalUrl: '',
		ogTitle: '',
		ogDescription: '',
		ogImage: '',
		twitterTitle: '',
		twitterDescription: '',
		twitterImage: '',
		twitterCardType: 'summary_large_image',
		robotsNoindex: false,
		robotsNofollow: false,
		noindex: false,
		nofollow: false,
		noarchive: false,
		nosnippet: false,
		maxImagePreview: 'large',
		maxSnippet: -1,
		schemaType: 'BlogPosting',
		faqItems: [],
		customJsonLd: '',
		seoScore: 0,
		readabilityScore: 0,
		template: 'default',
		postFormat: 'standard',
		format: 'standard',
		language: 'en',
		translations: '',
		seriesName: '',
		seriesOrder: null,
		customCss: '',
		customFields: [],
		publishedAt: '',
		scheduledAt: '',
		expiresAt: '',
		lastEditedBy: '',
		revisionNotes: '',
		expectedUpdatedAt: null
	};
}

function parseJsonStringArray(raw: string | null | undefined): string[] {
	if (!raw || !raw.trim()) return [];
	try {
		const parsed: unknown = JSON.parse(raw);
		if (Array.isArray(parsed)) {
			return parsed.filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
		}
	} catch {
		// Fallback to comma-separated if legacy
		return raw
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
	}
	return [];
}

function parseFaqItemsJson(raw: string | null | undefined): FaqFormItem[] {
	if (!raw || !raw.trim()) return [];
	try {
		const parsed: unknown = JSON.parse(raw);
		if (Array.isArray(parsed)) {
			return parsed
				.filter(
					(item): item is Record<string, unknown> =>
						typeof item === 'object' && item !== null && !Array.isArray(item)
				)
				.map((item) => ({
					question: typeof item.question === 'string' ? item.question : '',
					answer: typeof item.answer === 'string' ? item.answer : ''
				}));
		}
	} catch {
		// ignore malformed
	}
	return [];
}

function parseCustomFieldsJson(raw: string | null | undefined): CustomFieldFormItem[] {
	if (!raw || !raw.trim()) return [];
	try {
		const parsed: unknown = JSON.parse(raw);
		if (Array.isArray(parsed)) {
			return parsed
				.filter(
					(item): item is Record<string, unknown> =>
						typeof item === 'object' && item !== null && !Array.isArray(item)
				)
				.map((item) => ({
					key: typeof item.key === 'string' ? item.key : '',
					value: typeof item.value === 'string' ? item.value : ''
				}));
		}
		if (typeof parsed === 'object' && parsed !== null) {
			return Object.entries(parsed as Record<string, unknown>).map(([key, val]) => ({
				key,
				value: typeof val === 'string' ? val : String(val ?? '')
			}));
		}
	} catch {
		// ignore malformed
	}
	return [];
}

function toIsoOrEmpty(val: Date | string | null | undefined): string {
	if (!val) return '';
	if (val instanceof Date) return val.toISOString();
	const d = new Date(val);
	return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}

export function hydrateFromFullPost(post: Record<string, unknown>): PostEditorFormState {
	const empty = createEmptyForm();
	const catIds = Array.isArray(post.categoryIds)
		? (post.categoryIds as number[]).filter((n) => Number.isInteger(n) && n > 0)
		: typeof post.categoryId === 'number' && post.categoryId > 0
			? [post.categoryId]
			: [];
	const primaryCatId =
		typeof post.categoryId === 'number' && post.categoryId > 0
			? post.categoryId
			: (catIds[0] ?? null);

	const updatedAtIso = toIsoOrEmpty(post.updatedAt as Date | string | null);
	const isStickyVal = Boolean(post.isSticky ?? post.pinned);
	const isPillarVal = Boolean(post.isPillar);
	const commentsVal =
		post.commentsEnabled !== undefined
			? post.commentsEnabled !== false
			: post.allowComments !== false;
	const pingbacksVal = Boolean(post.pingbacksEnabled);
	const noindexVal = Boolean(
		post.robotsNoindex ?? post.noindex ?? (post.isIndexable === false ? true : false)
	);
	const nofollowVal = Boolean(post.robotsNofollow ?? post.nofollow);
	const formatVal = ((post.postFormat ?? post.format) as PostFormat) || 'standard';

	return {
		...empty,
		id: typeof post.id === 'number' ? post.id : null,
		title: String(post.title ?? ''),
		slug: String(post.slug ?? ''),
		slugManuallyEdited: Boolean(post.slug),
		subtitle: String(post.subtitle ?? ''),
		excerpt: String(post.excerpt ?? ''),
		content: String(post.content ?? ''),
		coverImage: String(post.coverImage ?? ''),
		coverImageAlt: String(post.coverImageAlt ?? ''),
		coverImageCaption: String(post.coverImageCaption ?? ''),
		categoryId: primaryCatId,
		categoryIds: catIds.length > 0 ? catIds : primaryCatId ? [primaryCatId] : [],
		tagIds: Array.isArray(post.tagIds)
			? (post.tagIds as number[]).filter((n) => Number.isInteger(n) && n > 0)
			: [],
		relatedPostIds: Array.isArray(post.relatedPostIds)
			? (post.relatedPostIds as number[]).filter((n) => Number.isInteger(n) && n > 0)
			: [],
		authorId: typeof post.authorId === 'number' && post.authorId > 0 ? post.authorId : null,
		coAuthorIds: String(post.coAuthorIds ?? ''),
		status: (post.status as PostStatus) || 'draft',
		visibility: (post.visibility as PostVisibility) || 'public',
		passwordPlaintext: '',
		clearPassword: false,
		hasExistingPassword: Boolean(post.hasPassword || post.visibility === 'password_protected'),
		featured: Boolean(post.featured),
		featuredOrder: typeof post.featuredOrder === 'number' ? post.featuredOrder : 0,
		isPillar: isPillarVal,
		isSticky: isStickyVal,
		pinned: isStickyVal,
		commentsEnabled: commentsVal,
		allowComments: commentsVal,
		pingbacksEnabled: pingbacksVal,
		excludeFromSearch: Boolean(post.excludeFromSearch),
		enableToc: post.enableToc !== false,
		readingTime: typeof post.readingTime === 'number' ? post.readingTime : 1,
		wordCount: typeof post.wordCount === 'number' ? post.wordCount : 0,
		metaTitle: String(post.metaTitle ?? ''),
		metaDescription: String(post.metaDescription ?? ''),
		focusKeyword: String(post.focusKeyword ?? ''),
		secondaryKeywords: parseJsonStringArray(post.secondaryKeywords as string | null),
		canonicalUrl: String(post.canonicalUrl ?? ''),
		ogTitle: String(post.ogTitle ?? ''),
		ogDescription: String(post.ogDescription ?? ''),
		ogImage: String(post.ogImage ?? ''),
		twitterTitle: String(post.twitterTitle ?? ''),
		twitterDescription: String(post.twitterDescription ?? ''),
		twitterImage: String(post.twitterImage ?? ''),
		twitterCardType:
			(post.twitterCardType as TwitterCardType) === 'summary' ? 'summary' : 'summary_large_image',
		robotsNoindex: noindexVal,
		robotsNofollow: nofollowVal,
		noindex: noindexVal,
		nofollow: nofollowVal,
		noarchive: Boolean(post.noarchive),
		nosnippet: Boolean(post.nosnippet),
		maxImagePreview: String(post.maxImagePreview ?? 'large'),
		maxSnippet: typeof post.maxSnippet === 'number' ? post.maxSnippet : -1,
		schemaType: (post.schemaType as PostSchemaType) || 'BlogPosting',
		faqItems: parseFaqItemsJson(post.faqItems as string | null),
		customJsonLd: String(post.customJsonLd ?? ''),
		seoScore: typeof post.seoScore === 'number' ? post.seoScore : 0,
		readabilityScore: typeof post.readabilityScore === 'number' ? post.readabilityScore : 0,
		template: (post.template as PostTemplate) || 'default',
		postFormat: formatVal,
		format: formatVal,
		language: String(post.language ?? 'en'),
		translations: String(post.translations ?? ''),
		seriesName: String(post.seriesName ?? ''),
		seriesOrder: typeof post.seriesOrder === 'number' ? post.seriesOrder : null,
		customCss: String(post.customCss ?? ''),
		customFields: parseCustomFieldsJson(post.customFields as string | null),
		publishedAt: toIsoOrEmpty(post.publishedAt as Date | string | null),
		scheduledAt: toIsoOrEmpty(post.scheduledAt as Date | string | null),
		expiresAt: toIsoOrEmpty(post.expiresAt as Date | string | null),
		lastEditedBy: String(post.lastEditedBy ?? ''),
		revisionNotes: String(post.revisionNotes ?? ''),
		expectedUpdatedAt: updatedAtIso || null
	};
}

export function buildPostPayload(
	form: PostEditorFormState,
	overrides?: { status?: PostStatus; forceOverwrite?: boolean }
): Record<string, unknown> {
	const targetStatus = overrides?.status ?? form.status;

	const cleanCategoryIds = Array.from(
		new Set(
			(form.categoryIds.length > 0
				? form.categoryIds
				: form.categoryId
					? [form.categoryId]
					: []
			).filter((n) => Number.isInteger(n) && n > 0)
		)
	);
	const primaryCategoryId =
		form.categoryId && cleanCategoryIds.includes(form.categoryId)
			? form.categoryId
			: (cleanCategoryIds[0] ?? null);

	const cleanFaq = form.faqItems
		.map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
		.filter((f) => f.question.length > 0 && f.answer.length > 0);

	const cleanCustomFields = form.customFields
		.map((cf) => ({ key: cf.key.trim(), value: cf.value.trim() }))
		.filter((cf) => cf.key.length > 0);

	const cleanSecondaryKeywords = form.secondaryKeywords.map((kw) => kw.trim()).filter(Boolean);

	// Password semantics (Section 13 #36):
	// Omit password (`undefined`) when visibility is password_protected and passwordPlaintext is empty
	// unless clearPassword is true.
	let passwordField: string | undefined = undefined;
	if (form.visibility !== 'password_protected' || form.clearPassword) {
		passwordField = '';
	} else if (form.passwordPlaintext.trim().length > 0) {
		passwordField = form.passwordPlaintext.trim();
	}

	const resolvedSticky = Boolean(form.isSticky || form.pinned);
	const resolvedComments = Boolean(form.commentsEnabled && form.allowComments);
	const resolvedNoindex = Boolean(form.robotsNoindex || form.noindex);
	const resolvedNofollow = Boolean(form.robotsNofollow || form.nofollow);
	const resolvedFormat: PostFormat =
		form.postFormat !== 'standard'
			? form.postFormat
			: form.format !== 'standard'
				? form.format
				: 'standard';

	const payload: Record<string, unknown> = {
		...(form.id ? { id: form.id } : {}),
		title: form.title,
		slug: form.slug,
		subtitle: form.subtitle || null,
		excerpt: form.excerpt || null,
		content: form.content,
		coverImage: form.coverImage || null,
		coverImageAlt: form.coverImageAlt || null,
		coverImageCaption: form.coverImageCaption || null,
		categoryId: primaryCategoryId,
		categoryIds: cleanCategoryIds,
		tagIds: Array.from(new Set(form.tagIds.filter((n) => Number.isInteger(n) && n > 0))),
		relatedPostIds: Array.from(
			new Set(form.relatedPostIds.filter((n) => Number.isInteger(n) && n > 0 && n !== form.id))
		),
		authorId: form.authorId,
		coAuthorIds: form.coAuthorIds || null,
		status: targetStatus,
		visibility: form.visibility,
		...(passwordField !== undefined ? { password: passwordField } : {}),
		featured: form.featured,
		featuredOrder: form.featuredOrder,
		isPillar: Boolean(form.isPillar),
		isSticky: resolvedSticky,
		pinned: resolvedSticky,
		commentsEnabled: resolvedComments,
		allowComments: resolvedComments,
		pingbacksEnabled: Boolean(form.pingbacksEnabled),
		excludeFromSearch: form.excludeFromSearch,
		enableToc: form.enableToc,
		metaTitle: form.metaTitle || null,
		metaDescription: form.metaDescription || null,
		focusKeyword: form.focusKeyword || null,
		secondaryKeywords:
			cleanSecondaryKeywords.length > 0 ? JSON.stringify(cleanSecondaryKeywords) : null,
		canonicalUrl: form.canonicalUrl || null,
		ogTitle: form.ogTitle || null,
		ogDescription: form.ogDescription || null,
		ogImage: form.ogImage || null,
		twitterTitle: form.twitterTitle || null,
		twitterDescription: form.twitterDescription || null,
		twitterImage: form.twitterImage || null,
		twitterCardType: form.twitterCardType,
		robotsNoindex: resolvedNoindex,
		robotsNofollow: resolvedNofollow,
		noindex: resolvedNoindex,
		nofollow: resolvedNofollow,
		noarchive: form.noarchive,
		nosnippet: form.nosnippet,
		maxImagePreview: form.maxImagePreview || 'large',
		maxSnippet: form.maxSnippet,
		schemaType: form.schemaType,
		faqItems: cleanFaq.length > 0 ? JSON.stringify(cleanFaq) : null,
		customJsonLd: form.customJsonLd || null,
		template: form.template,
		postFormat: resolvedFormat,
		format: resolvedFormat,
		language: form.language || 'en',
		translations: form.translations || null,
		seriesName: form.seriesName || null,
		seriesOrder: form.seriesOrder,
		customCss: form.customCss || null,
		customFields: cleanCustomFields.length > 0 ? JSON.stringify(cleanCustomFields) : null,
		publishedAt: form.publishedAt || null,
		scheduledAt: form.scheduledAt || null,
		expiresAt: form.expiresAt || null,
		lastEditedBy: form.lastEditedBy || null,
		revisionNotes: form.revisionNotes || null,
		...(form.expectedUpdatedAt ? { expectedUpdatedAt: form.expectedUpdatedAt } : {}),
		...(overrides?.forceOverwrite ? { forceOverwrite: true } : {})
	};

	return payload;
}

/**
 * Syncs server-normalized and autofilled fields back into client state after save (Section 4.9 / Section 11.4 / Section 13 #44).
 * When `options.preserveBlankAutofillFields` is true, server-autofilled SEO/excerpt/OG/Twitter/canonical fields
 * are only adopted if the client's field was already non-blank prior to save, preventing server autofill defaults
 * from becoming frozen user overrides on subsequent edits.
 */
export function canonicalFieldsAfterSave(
	current: PostEditorFormState,
	saved: Record<string, unknown>,
	options?: { preserveBlankAutofillFields?: boolean }
): PostEditorFormState {
	const updatedIso = toIsoOrEmpty(saved.updatedAt as Date | string | null);
	const preserveBlank = Boolean(options?.preserveBlankAutofillFields);

	const adoptOptionalString = (currentVal: string, savedVal: unknown): string => {
		if (typeof savedVal !== 'string') return currentVal;
		if (preserveBlank && currentVal.trim().length === 0) return currentVal;
		return savedVal;
	};

	return {
		...current,
		id: typeof saved.id === 'number' ? saved.id : current.id,
		title: typeof saved.title === 'string' ? saved.title : current.title,
		slug: typeof saved.slug === 'string' ? saved.slug : current.slug,
		subtitle: adoptOptionalString(current.subtitle, saved.subtitle),
		excerpt: adoptOptionalString(current.excerpt, saved.excerpt),
		content: typeof saved.content === 'string' ? saved.content : current.content,
		coverImage: typeof saved.coverImage === 'string' ? saved.coverImage : current.coverImage,
		coverImageAlt: adoptOptionalString(current.coverImageAlt, saved.coverImageAlt),
		coverImageCaption: adoptOptionalString(current.coverImageCaption, saved.coverImageCaption),
		status: (saved.status as PostStatus) || current.status,
		visibility: (saved.visibility as PostVisibility) || current.visibility,
		passwordPlaintext: '',
		clearPassword: false,
		hasExistingPassword: Boolean(saved.hasPassword || saved.visibility === 'password_protected'),
		metaTitle: adoptOptionalString(current.metaTitle, saved.metaTitle),
		metaDescription: adoptOptionalString(current.metaDescription, saved.metaDescription),
		ogTitle: adoptOptionalString(current.ogTitle, saved.ogTitle),
		ogDescription: adoptOptionalString(current.ogDescription, saved.ogDescription),
		ogImage: adoptOptionalString(current.ogImage, saved.ogImage),
		twitterTitle: adoptOptionalString(current.twitterTitle, saved.twitterTitle),
		twitterDescription: adoptOptionalString(current.twitterDescription, saved.twitterDescription),
		twitterImage: adoptOptionalString(current.twitterImage, saved.twitterImage),
		canonicalUrl: adoptOptionalString(current.canonicalUrl, saved.canonicalUrl),
		seoScore: typeof saved.seoScore === 'number' ? saved.seoScore : current.seoScore,
		readingTime: typeof saved.readingTime === 'number' ? saved.readingTime : current.readingTime,
		wordCount: typeof saved.wordCount === 'number' ? saved.wordCount : current.wordCount,
		publishedAt: toIsoOrEmpty(saved.publishedAt as Date | string | null) || current.publishedAt,
		scheduledAt: toIsoOrEmpty(saved.scheduledAt as Date | string | null) || current.scheduledAt,
		expectedUpdatedAt: updatedIso || current.expectedUpdatedAt
	};
}

export function getDraftStorageKey(postId: number | null): string {
	return postId ? `post-draft:${postId}` : 'post-draft:new';
}

function getRtpDraftStorageKey(postId: number | null): string {
	return `rtp-post-draft-${postId ?? 'new'}`;
}

export function saveLocalDraftSnapshot(postId: number | null, form: PostEditorFormState): void {
	if (typeof localStorage === 'undefined') return;
	try {
		const snapshot = {
			savedAt: new Date().toISOString(),
			form: {
				...form,
				passwordPlaintext: ''
			}
		};
		const serialized = JSON.stringify(snapshot);
		localStorage.setItem(getDraftStorageKey(postId), serialized);
		localStorage.setItem(getRtpDraftStorageKey(postId), serialized);
	} catch {
		// Ignore quota errors
	}
}

export function readLocalDraftSnapshot(
	postId: number | null
): { savedAt: string; form: PostEditorFormState } | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		const raw =
			localStorage.getItem(getDraftStorageKey(postId)) ??
			localStorage.getItem(getRtpDraftStorageKey(postId));
		if (!raw) return null;
		const parsed = JSON.parse(raw) as { savedAt?: string; form?: PostEditorFormState };
		if (!parsed || typeof parsed.savedAt !== 'string' || !parsed.form) return null;
		return { savedAt: parsed.savedAt, form: parsed.form };
	} catch {
		return null;
	}
}

export function clearLocalDraftSnapshot(postId: number | null): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.removeItem(getDraftStorageKey(postId));
		localStorage.removeItem(getRtpDraftStorageKey(postId));
	} catch {
		// Ignore storage errors
	}
}

export function attachEditorShortcuts(
	target: Window | HTMLElement,
	callbacks: {
		onSaveDraft: () => void;
		onPublishOrSave: () => void;
		onSaveDraftShortcut?: () => void;
		onPreview?: () => void;
		onEscape?: () => void;
		isModalOpen?: () => boolean;
	}
): () => void {
	function onKeyDown(event: Event) {
		const e = event as KeyboardEvent;
		const mod = e.metaKey || e.ctrlKey;
		const keyLower = (e.key || '').toLowerCase();
		if (mod && !e.shiftKey && keyLower === 's') {
			e.preventDefault();
			callbacks.onSaveDraft();
		} else if (mod && e.key === 'Enter') {
			e.preventDefault();
			callbacks.onPublishOrSave();
		} else if (mod && e.shiftKey && keyLower === 'p') {
			e.preventDefault();
			if (callbacks.onPreview) {
				callbacks.onPreview();
			} else {
				callbacks.onPublishOrSave();
			}
		} else if (mod && e.shiftKey && keyLower === 'd') {
			e.preventDefault();
			if (callbacks.onSaveDraftShortcut) {
				callbacks.onSaveDraftShortcut();
			} else {
				callbacks.onSaveDraft();
			}
		} else if (e.key === 'Escape') {
			const modalOpen = callbacks.isModalOpen?.() ?? false;
			if (!modalOpen) {
				const el = (e.target as HTMLElement | null) ?? null;
				const tag = el?.tagName?.toUpperCase();
				if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable) {
					return;
				}
			}
			callbacks.onEscape?.();
		}
	}

	target.addEventListener('keydown', onKeyDown);
	return () => {
		target.removeEventListener('keydown', onKeyDown);
	};
}

export function attachBeforeUnloadGuard(target: Window, isDirty: () => boolean): () => void {
	function onBeforeUnload(e: BeforeUnloadEvent) {
		if (isDirty()) {
			e.preventDefault();
			e.returnValue = '';
		}
	}
	target.addEventListener('beforeunload', onBeforeUnload);
	return () => {
		target.removeEventListener('beforeunload', onBeforeUnload);
	};
}
