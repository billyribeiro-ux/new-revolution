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
	pinned: boolean;
	allowComments: boolean;
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

export function createEmptyForm(): PostEditorFormState {
	return {
		id: null,
		title: '',
		slug: '',
		slugManuallyEdited: false,
		subtitle: '',
		excerpt: '',
		content: '',
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
		pinned: false,
		allowComments: true,
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
		noindex: false,
		nofollow: false,
		noarchive: false,
		nosnippet: false,
		maxImagePreview: 'large',
		maxSnippet: -1,
		schemaType: 'Article',
		faqItems: [],
		customJsonLd: '',
		seoScore: 0,
		readabilityScore: 0,
		template: 'default',
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
		pinned: Boolean(post.pinned),
		allowComments: post.allowComments !== false,
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
		noindex: Boolean(post.noindex),
		nofollow: Boolean(post.nofollow),
		noarchive: Boolean(post.noarchive),
		nosnippet: Boolean(post.nosnippet),
		maxImagePreview: String(post.maxImagePreview ?? 'large'),
		maxSnippet: typeof post.maxSnippet === 'number' ? post.maxSnippet : -1,
		schemaType: (post.schemaType as PostSchemaType) || 'Article',
		faqItems: parseFaqItemsJson(post.faqItems as string | null),
		customJsonLd: String(post.customJsonLd ?? ''),
		seoScore: typeof post.seoScore === 'number' ? post.seoScore : 0,
		readabilityScore: typeof post.readabilityScore === 'number' ? post.readabilityScore : 0,
		template: (post.template as PostTemplate) || 'default',
		format: (post.format as PostFormat) || 'standard',
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
	overrides?: { status?: PostStatus }
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
		pinned: form.pinned,
		allowComments: form.allowComments,
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
		noindex: form.noindex,
		nofollow: form.nofollow,
		noarchive: form.noarchive,
		nosnippet: form.nosnippet,
		maxImagePreview: form.maxImagePreview || 'large',
		maxSnippet: form.maxSnippet,
		schemaType: form.schemaType,
		faqItems: cleanFaq.length > 0 ? JSON.stringify(cleanFaq) : null,
		customJsonLd: form.customJsonLd || null,
		template: form.template,
		format: form.format,
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
		...(form.expectedUpdatedAt ? { expectedUpdatedAt: form.expectedUpdatedAt } : {})
	};

	return payload;
}

/**
 * Syncs server-normalized and autofilled fields back into client state after save (Section 11.4 / Section 13 #44).
 */
export function canonicalFieldsAfterSave(
	current: PostEditorFormState,
	saved: Record<string, unknown>
): PostEditorFormState {
	const updatedIso = toIsoOrEmpty(saved.updatedAt as Date | string | null);
	return {
		...current,
		id: typeof saved.id === 'number' ? saved.id : current.id,
		title: typeof saved.title === 'string' ? saved.title : current.title,
		slug: typeof saved.slug === 'string' ? saved.slug : current.slug,
		subtitle: typeof saved.subtitle === 'string' ? saved.subtitle : current.subtitle,
		excerpt: typeof saved.excerpt === 'string' ? saved.excerpt : current.excerpt,
		content: typeof saved.content === 'string' ? saved.content : current.content,
		coverImage: typeof saved.coverImage === 'string' ? saved.coverImage : current.coverImage,
		coverImageAlt:
			typeof saved.coverImageAlt === 'string' ? saved.coverImageAlt : current.coverImageAlt,
		coverImageCaption:
			typeof saved.coverImageCaption === 'string'
				? saved.coverImageCaption
				: current.coverImageCaption,
		status: (saved.status as PostStatus) || current.status,
		visibility: (saved.visibility as PostVisibility) || current.visibility,
		passwordPlaintext: '',
		clearPassword: false,
		hasExistingPassword: Boolean(saved.hasPassword || saved.visibility === 'password_protected'),
		metaTitle: typeof saved.metaTitle === 'string' ? saved.metaTitle : current.metaTitle,
		metaDescription:
			typeof saved.metaDescription === 'string' ? saved.metaDescription : current.metaDescription,
		ogTitle: typeof saved.ogTitle === 'string' ? saved.ogTitle : current.ogTitle,
		ogDescription:
			typeof saved.ogDescription === 'string' ? saved.ogDescription : current.ogDescription,
		ogImage: typeof saved.ogImage === 'string' ? saved.ogImage : current.ogImage,
		twitterTitle:
			typeof saved.twitterTitle === 'string' ? saved.twitterTitle : current.twitterTitle,
		twitterDescription:
			typeof saved.twitterDescription === 'string'
				? saved.twitterDescription
				: current.twitterDescription,
		twitterImage:
			typeof saved.twitterImage === 'string' ? saved.twitterImage : current.twitterImage,
		canonicalUrl:
			typeof saved.canonicalUrl === 'string' ? saved.canonicalUrl : current.canonicalUrl,
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
		localStorage.setItem(getDraftStorageKey(postId), JSON.stringify(snapshot));
	} catch {
		// Ignore quota errors
	}
}

export function readLocalDraftSnapshot(
	postId: number | null
): { savedAt: string; form: PostEditorFormState } | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		const raw = localStorage.getItem(getDraftStorageKey(postId));
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
	} catch {
		// Ignore storage errors
	}
}

export function attachEditorShortcuts(
	target: Window | HTMLElement,
	callbacks: {
		onSaveDraft: () => void;
		onPublishOrSave: () => void;
		onPreview?: () => void;
		onEscape?: () => void;
	}
): () => void {
	function onKeyDown(event: Event) {
		const e = event as KeyboardEvent;
		const mod = e.metaKey || e.ctrlKey;
		if (mod && !e.shiftKey && e.key.toLowerCase() === 's') {
			e.preventDefault();
			callbacks.onSaveDraft();
		} else if (mod && e.key === 'Enter') {
			e.preventDefault();
			callbacks.onPublishOrSave();
		} else if (mod && e.shiftKey && e.key.toLowerCase() === 'p') {
			e.preventDefault();
			callbacks.onPreview?.();
		} else if (e.key === 'Escape') {
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
