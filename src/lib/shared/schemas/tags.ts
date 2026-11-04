import { z } from 'zod';

/** Schema for identifying a tag by ID */
export const tagIdSchema = z.object({
	id: z.number().int().positive('Invalid tag ID')
});

/** Schema for creating a new tag */
export const tagCreateSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	slug: z.string().min(1, 'Slug is required'),
	description: z.string().nullish()
});

/** Schema for updating an existing tag */
export const tagUpdateSchema = tagCreateSchema.extend({
	id: z.number().int().positive('Invalid tag ID')
});

export type TagIdInput = z.infer<typeof tagIdSchema>;
export type TagCreateInput = z.infer<typeof tagCreateSchema>;
export type TagUpdateInput = z.infer<typeof tagUpdateSchema>;
