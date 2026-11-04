import { z } from 'zod';

/** Schema for identifying a category by ID */
export const categoryIdSchema = z.object({
	id: z.number().int().positive('Invalid category ID')
});

/** Schema for creating a new category */
export const categoryCreateSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	slug: z.string().min(1, 'Slug is required'),
	description: z.string().nullish(),
	metaTitle: z.string().nullish(),
	// Google truncates at ~155–160; hard-cap at the schema layer so admins
	// can't ship a description that gets truncated in the SERP snippet.
	metaDescription: z.string().max(160, 'metaDescription must be ≤160 chars').nullish(),
	pillarContent: z.string().nullish(),
	icon: z.string().nullish(),
	color: z.string().nullish(),
	image: z.string().nullish(),
	imageAlt: z.string().nullish(),
	parentId: z.number().int().positive().nullish(),
	sortOrder: z.number().int().optional()
});

/** Schema for updating an existing category */
export const categoryUpdateSchema = categoryCreateSchema.extend({
	id: z.number().int().positive('Invalid category ID'),
	isActive: z.boolean()
});

export type CategoryIdInput = z.infer<typeof categoryIdSchema>;
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
