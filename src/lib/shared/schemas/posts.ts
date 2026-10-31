import { z } from 'zod';
import {
	META_DESCRIPTION_MAX,
	META_TITLE_MAX,
	OG_DESCRIPTION_MAX,
	OG_TITLE_MAX,
	TWITTER_DESCRIPTION_MAX,
	TWITTER_TITLE_MAX
} from '../seo/meta-budget';
import { isReservedSlug, SLUG_MAX_LEN, SLUG_MIN_LEN, SLUG_REGEX } from '../seo/slug';

export const POST_STATUS_VALUES = [
	'draft',
	'review',
	'scheduled',
	'published',
	'archived'
] as const;
export const POST_STATUSES = POST_STATUS_VALUES;
export type PostStatus = (typeof POST_STATUS_VALUES)[number];

export const POST_VISIBILITY_VALUES = ['public', 'members', 'password_protected'] as const;
export type PostVisibility = (typeof POST_VISIBILITY_VALUES)[number];

export const POST_SCHEMA_TYPE_VALUES = ['Article', 'BlogPosting', 'NewsArticle', 'HowTo'] as const;
export type PostSchemaType = (typeof POST_SCHEMA_TYPE_VALUES)[number];

export const TWITTER_CARD_TYPE_VALUES = ['summary', 'summary_large_image'] as const;
export type TwitterCardType = (typeof TWITTER_CARD_TYPE_VALUES)[number];

export const POST_TEMPLATE_VALUES = [
	'default',
	'full_width',
	'sidebar_left',
	'sidebar_right',
	'landing'
] as const;
export type PostTemplate = (typeof POST_TEMPLATE_VALUES)[number];

export const POST_FORMAT_VALUES = [
	'standard',
	'aside',
	'image',
	'link',
	'quote',
	'status',
	'video',
	'audio',
	'gallery',
	'chat'
] as const;
export type PostFormat = (typeof POST_FORMAT_VALUES)[number];

export const POST_PASSWORD_MIN_LEN = 4;
export const SCHEDULE_GRACE_MS = 60_000;

export const slugSchema = z
	.string()
	.min(SLUG_MIN_LEN, `Slug must be at least ${SLUG_MIN_LEN} characters.`)
	.max(SLUG_MAX_LEN, `Slug must be at most ${SLUG_MAX_LEN} characters.`)
	.regex(SLUG_REGEX, 'Slug must contain only lowercase letters, numbers, and single hyphens.')
	.refine((val) => !isReservedSlug(val), 'This slug is reserved by the system.');

export const optionalUrlSchema = z
	.union([z.string().url('Must be a valid URL.'), z.literal('')])
	.nullish()
	.transform((v) => v ?? '');

export const uniquePositiveIntArraySchema = z
	.array(z.number().int().positive())
	.refine((items) => new Set(items).size === items.length, {
		message: 'ID array must not contain duplicate values.'
	});

function isValidSecondaryKeywordsJson(raw: string | null | undefined): boolean {
	if (!raw || raw.trim() === '') return true;
	try {
		const parsed: unknown = JSON.parse(raw);
		return Array.isArray(parsed) && parsed.every((item) => typeof item === 'string');
	} catch {
		return false;
	}
}

function isValidFaqItemsJson(raw: string | null | undefined): boolean {
	if (!raw || raw.trim() === '') return true;
	try {
		const parsed: unknown = JSON.parse(raw);
		if (!Array.isArray(parsed)) return false;
		return parsed.every(
			(item) =>
				typeof item === 'object' &&
				item !== null &&
				!Array.isArray(item) &&
				typeof (item as Record<string, unknown>).question === 'string' &&
				typeof (item as Record<string, unknown>).answer === 'string'
		);
	} catch {
		return false;
	}
}

function isValidCustomFieldsJson(raw: string | null | undefined): boolean {
	if (!raw || raw.trim() === '') return true;
	try {
		const parsed: unknown = JSON.parse(raw);
		if (Array.isArray(parsed)) {
			return parsed.every(
				(item) =>
					typeof item === 'object' &&
					item !== null &&
					typeof (item as Record<string, unknown>).key === 'string' &&
					typeof (item as Record<string, unknown>).value === 'string'
			);
		}
		if (typeof parsed === 'object' && parsed !== null) {
			return Object.entries(parsed).every(
				([k, v]) => typeof k === 'string' && typeof v === 'string'
			);
		}
		return false;
	} catch {
		return false;
	}
}

function isValidCoAuthorIdsJson(raw: string | null | undefined): boolean {
	if (!raw || raw.trim() === '') return true;
	try {
		const parsed: unknown = JSON.parse(raw);
		return (
			Array.isArray(parsed) &&
			parsed.every((id) => typeof id === 'number' && Number.isInteger(id) && id > 0)
		);
	} catch {
		return false;
	}
}

const parseableDateOrEmptySchema = z
	.string()
	.nullish()
	.refine(
		(val) => {
			if (!val || val.trim() === '') return true;
			const ms = Date.parse(val);
			return !Number.isNaN(ms);
		},
		{ message: 'Must be a valid ISO date string.' }
	);

const postBaseObjectSchema = z.object({
	title: z.string().trim().min(1, 'Title is required.'),
	slug: slugSchema,
	excerpt: z.string().nullish(),
	content: z.string().min(1, 'Content cannot be empty.'),
	authorId: z.number().int().positive().nullish(),
	coAuthorIds: z
		.string()
		.nullish()
		.refine(isValidCoAuthorIdsJson, 'coAuthorIds must be a JSON array of positive integer IDs.'),
	categoryId: z.number().int().positive().nullish(),
	categoryIds: uniquePositiveIntArraySchema.optional().default([]),
	tagIds: uniquePositiveIntArraySchema.optional().default([]),
	relatedPostIds: uniquePositiveIntArraySchema.optional().default([]),

	coverImage: optionalUrlSchema,
	coverImageAlt: z.string().max(300).nullish(),
	coverImageCaption: z.string().max(500).nullish(),

	metaTitle: z
		.string()
		.max(META_TITLE_MAX, `Meta title cannot exceed ${META_TITLE_MAX} characters.`)
		.nullish(),
	metaDescription: z
		.string()
		.max(META_DESCRIPTION_MAX, `Meta description cannot exceed ${META_DESCRIPTION_MAX} characters.`)
		.nullish(),
	ogTitle: z
		.string()
		.max(OG_TITLE_MAX, `OG title cannot exceed ${OG_TITLE_MAX} characters.`)
		.nullish(),
	ogDescription: z
		.string()
		.max(OG_DESCRIPTION_MAX, `OG description cannot exceed ${OG_DESCRIPTION_MAX} characters.`)
		.nullish(),
	ogImage: optionalUrlSchema,
	canonicalUrl: optionalUrlSchema,
	focusKeyword: z.string().max(120).nullish(),
	secondaryKeywords: z
		.string()
		.nullish()
		.refine(
			isValidSecondaryKeywordsJson,
			'secondaryKeywords must be a valid JSON array of strings.'
		),
	robotsNoindex: z.boolean().optional().default(false),
	robotsNofollow: z.boolean().optional().default(false),
	schemaType: z.enum(POST_SCHEMA_TYPE_VALUES).optional().default('BlogPosting'),

	twitterCardType: z.enum(TWITTER_CARD_TYPE_VALUES).optional().default('summary_large_image'),
	twitterTitle: z
		.string()
		.max(TWITTER_TITLE_MAX, `Twitter title cannot exceed ${TWITTER_TITLE_MAX} characters.`)
		.nullish(),
	twitterDescription: z
		.string()
		.max(
			TWITTER_DESCRIPTION_MAX,
			`Twitter description cannot exceed ${TWITTER_DESCRIPTION_MAX} characters.`
		)
		.nullish(),
	twitterImage: optionalUrlSchema,

	faqItems: z
		.string()
		.nullish()
		.refine(
			isValidFaqItemsJson,
			'faqItems must be a valid JSON array of { question: string, answer: string } objects.'
		),

	status: z.enum(POST_STATUS_VALUES).optional().default('draft'),
	visibility: z.enum(POST_VISIBILITY_VALUES).optional().default('public'),
	password: z.string().nullish(),
	template: z.enum(POST_TEMPLATE_VALUES).optional().default('default'),
	postFormat: z.enum(POST_FORMAT_VALUES).optional().default('standard'),
	customFields: z
		.string()
		.nullish()
		.refine(isValidCustomFieldsJson, 'customFields must be a valid JSON key/value structure.'),

	featured: z.boolean().optional().default(false),
	isPillar: z.boolean().optional().default(false),
	isSticky: z.boolean().optional().default(false),
	commentsEnabled: z.boolean().optional().default(true),
	pingbacksEnabled: z.boolean().optional().default(false),

	language: z.string().max(16).optional().default('en'),
	translationOfId: z.number().int().positive().nullish(),
	seriesId: z.number().int().positive().nullish(),
	seriesOrder: z.number().int().nonnegative().nullish(),
	isFixture: z.boolean().optional().default(false),

	scheduledAt: parseableDateOrEmptySchema,
	expiresAt: parseableDateOrEmptySchema
});

function applyPostLifecycleRefinements<
	T extends {
		status?: PostStatus;
		visibility?: PostVisibility;
		password?: string | null;
		scheduledAt?: string | null;
		expiresAt?: string | null;
		id?: number;
		relatedPostIds?: number[];
	}
>(schema: z.ZodType<T>, options: { requirePasswordWhenProtected?: boolean } = {}) {
	const requirePassword = options.requirePasswordWhenProtected ?? true;
	return schema.superRefine((data, ctx) => {
		if (data.visibility === 'password_protected') {
			const hasPasswordField = data.password !== undefined && data.password !== null;
			const pw = (data.password ?? '').trim();
			if (requirePassword || hasPasswordField) {
				if (pw.length < POST_PASSWORD_MIN_LEN) {
					ctx.addIssue({
						code: 'custom',
						path: ['password'],
						message: `Password is required (min ${POST_PASSWORD_MIN_LEN} characters) when visibility is password_protected.`
					});
				}
			}
		}

		if (data.status === 'scheduled') {
			const rawSched = (data.scheduledAt ?? '').trim();
			if (!rawSched) {
				ctx.addIssue({
					code: 'custom',
					path: ['scheduledAt'],
					message: 'A scheduled post requires a scheduledAt timestamp.'
				});
			} else {
				const schedMs = Date.parse(rawSched);
				if (Number.isNaN(schedMs) || schedMs < Date.now() - SCHEDULE_GRACE_MS) {
					ctx.addIssue({
						code: 'custom',
						path: ['scheduledAt'],
						message: 'scheduledAt cannot be more than 60 seconds in the past.'
					});
				}
			}
		}

		const rawSched = (data.scheduledAt ?? '').trim();
		const rawExp = (data.expiresAt ?? '').trim();
		if (rawSched && rawExp) {
			const schedMs = Date.parse(rawSched);
			const expMs = Date.parse(rawExp);
			if (!Number.isNaN(schedMs) && !Number.isNaN(expMs) && expMs <= schedMs) {
				ctx.addIssue({
					code: 'custom',
					path: ['expiresAt'],
					message: 'expiresAt must be strictly after scheduledAt.'
				});
			}
		}

		if (
			typeof data.id === 'number' &&
			Array.isArray(data.relatedPostIds) &&
			data.relatedPostIds.includes(data.id)
		) {
			ctx.addIssue({
				code: 'custom',
				path: ['relatedPostIds'],
				message: 'A post cannot reference itself in relatedPostIds.'
			});
		}
	});
}

export const postCreateSchema = applyPostLifecycleRefinements(postBaseObjectSchema);
export type PostCreateInput = z.input<typeof postBaseObjectSchema>;

/**
 * Full-replace update schema (PUT semantics).
 * Note: Omitting `tagIds`, `categoryIds`, or `relatedPostIds` defaults them to `[]` and replaces
 * the pivot rows accordingly. Use `postPatchSchema` or `postQuickUpdateSchema` for partial updates.
 */
export const postUpdateObjectSchema = postBaseObjectSchema.extend({
	id: z.number().int().positive(),
	expectedUpdatedAt: z.string().nullish(),
	forceOverwrite: z.boolean().optional().default(false)
});

export const postUpdateSchema = applyPostLifecycleRefinements(postUpdateObjectSchema, {
	requirePasswordWhenProtected: false
});
export type PostUpdateInput = z.input<typeof postUpdateObjectSchema>;

/**
 * Partial update schema (PATCH semantics) where omitted arrays leave pivots untouched.
 */
export const postPatchObjectSchema = postBaseObjectSchema.partial().extend({
	id: z.number().int().positive(),
	expectedUpdatedAt: z.string().nullish(),
	forceOverwrite: z.boolean().optional().default(false)
});

export const postPatchSchema = applyPostLifecycleRefinements(postPatchObjectSchema, {
	requirePasswordWhenProtected: false
});
export type PostPatchInput = z.input<typeof postPatchObjectSchema>;

/**
 * Autosave schema: allows empty `title` and `content` so untitled drafts can be autosaved.
 */
export const postAutosaveSchema = z.object({
	id: z.number().int().positive(),
	title: z.string().default(''),
	content: z.string().default(''),
	excerpt: z.string().nullish(),
	expectedUpdatedAt: z.string().nullish()
});
export type PostAutosaveInput = z.input<typeof postAutosaveSchema>;

export const postQuickUpdateSchema = z
	.object({
		id: z.number().int().positive(),
		title: z.string().trim().min(1, 'Title cannot be empty.').optional(),
		slug: slugSchema.optional(),
		status: z.enum(POST_STATUS_VALUES).optional(),
		authorId: z.number().int().positive().nullish(),
		categoryId: z.number().int().positive().nullish(),
		featured: z.boolean().optional(),
		isPillar: z.boolean().optional(),
		isSticky: z.boolean().optional(),
		scheduledAt: parseableDateOrEmptySchema,
		expiresAt: parseableDateOrEmptySchema,
		expectedUpdatedAt: z.string().nullish()
	})
	.superRefine((data, ctx) => {
		if (data.status === 'scheduled' && data.scheduledAt !== undefined) {
			const rawSched = (data.scheduledAt ?? '').trim();
			if (!rawSched) {
				ctx.addIssue({
					code: 'custom',
					path: ['scheduledAt'],
					message: 'A scheduled post requires a scheduledAt timestamp.'
				});
			} else {
				const schedMs = Date.parse(rawSched);
				if (Number.isNaN(schedMs) || schedMs < Date.now() - SCHEDULE_GRACE_MS) {
					ctx.addIssue({
						code: 'custom',
						path: ['scheduledAt'],
						message: 'scheduledAt cannot be more than 60 seconds in the past.'
					});
				}
			}
		}
		const rawSched = (data.scheduledAt ?? '').trim();
		const rawExp = (data.expiresAt ?? '').trim();
		if (rawSched && rawExp) {
			const schedMs = Date.parse(rawSched);
			const expMs = Date.parse(rawExp);
			if (!Number.isNaN(schedMs) && !Number.isNaN(expMs) && expMs <= schedMs) {
				ctx.addIssue({
					code: 'custom',
					path: ['expiresAt'],
					message: 'expiresAt must be strictly after scheduledAt.'
				});
			}
		}
	});
export type PostQuickUpdateInput = z.input<typeof postQuickUpdateSchema>;
