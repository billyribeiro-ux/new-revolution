import { z } from 'zod';
import { optionalUrlSchema, slugSchema } from './posts';

const optionalEmailSchema = z
	.union([z.string().email('Must be a valid email address.'), z.literal('')])
	.nullish()
	.transform((v) => v ?? '');

export const authorCreateSchema = z.object({
	name: z.string().trim().min(1, 'Author name is required.').max(120),
	slug: slugSchema,
	email: optionalEmailSchema,
	bio: z.string().max(5000).nullish(),
	shortBio: z.string().max(500).nullish(),
	jobTitle: z.string().max(160).nullish(),
	company: z.string().max(160).nullish(),
	credentials: z.string().max(300).nullish(),
	expertise: z.string().max(500).nullish(),
	yearsExperience: z.number().int().min(0).max(80).nullish(),
	linkedin: optionalUrlSchema,
	twitter: optionalUrlSchema,
	website: optionalUrlSchema,
	avatar: optionalUrlSchema,
	avatarAlt: z.string().max(300).nullish(),
	isActive: z.boolean().optional().default(true)
});
export type AuthorCreateInput = z.infer<typeof authorCreateSchema>;

export const authorUpdateSchema = authorCreateSchema.omit({ isActive: true }).extend({
	id: z.number().int().positive(),
	isActive: z.boolean().optional()
});
export type AuthorUpdateInput = z.infer<typeof authorUpdateSchema>;
