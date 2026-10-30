import { z } from 'zod';
import { META_DESCRIPTION_MAX, META_TITLE_MAX } from '../seo/meta-budget';
import { optionalUrlSchema, slugSchema } from './posts';

export const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
export const DEFAULT_CATEGORY_COLOR = '#4b5f1d';

export const categoryCreateSchema = z.object({
	name: z.string().trim().min(1, 'Category name is required.').max(120),
	slug: slugSchema,
	description: z.string().max(1000).nullish(),
	metaTitle: z
		.string()
		.max(META_TITLE_MAX, `Meta title cannot exceed ${META_TITLE_MAX} characters.`)
		.nullish(),
	metaDescription: z
		.string()
		.max(
			META_DESCRIPTION_MAX,
			`Meta description cannot exceed ${META_DESCRIPTION_MAX} characters.`
		)
		.nullish(),
	pillarContent: z.string().nullish(),
	icon: z.string().max(80).nullish(),
	color: z
		.string()
		.regex(HEX_COLOR_REGEX, 'Color must be a valid 3- or 6-digit hex color.')
		.optional()
		.default(DEFAULT_CATEGORY_COLOR),
	image: optionalUrlSchema,
	imageAlt: z.string().max(300).nullish(),
	parentId: z.number().int().positive().nullish(),
	sortOrder: z.number().int().optional().default(0),
	isActive: z.boolean().optional().default(true)
});
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;

export const categoryUpdateSchema = categoryCreateSchema
	.omit({ isActive: true })
	.extend({
		id: z.number().int().positive(),
		// Preserve existing `is_active` when omitted instead of forcing true (Section 8.8)
		isActive: z.boolean().optional()
	})
	.refine((data) => !data.parentId || data.parentId !== data.id, {
		path: ['parentId'],
		message: 'A category cannot be its own parent.'
	});
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;

export const tagCreateSchema = z.object({
	name: z.string().trim().min(1, 'Tag name is required.').max(100),
	slug: slugSchema,
	description: z.string().max(500).nullish()
});
export type TagCreateInput = z.infer<typeof tagCreateSchema>;

export const tagUpdateSchema = tagCreateSchema.extend({
	id: z.number().int().positive()
});
export type TagUpdateInput = z.infer<typeof tagUpdateSchema>;
