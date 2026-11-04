import { z } from 'zod';

/** Granular consent categories. `necessary` is always true (strictly required). */
export const consentCategoriesSchema = z.object({
	necessary: z.literal(true),
	analytics: z.boolean(),
	marketing: z.boolean()
});

/** Public payload posted by the cookie-consent banner on a decision. */
export const consentRecordSchema = z.object({
	anonId: z.string().trim().min(1).max(200),
	categories: consentCategoriesSchema,
	policyVersion: z.number().int().positive().default(1)
});

/** Admin consent records list filters. */
export const consentListFiltersSchema = z.object({
	limit: z.number().int().positive().max(1000).default(250),
	offset: z.number().int().nonnegative().default(0)
});

export type ConsentCategoriesInput = z.infer<typeof consentCategoriesSchema>;
export type ConsentRecordInput = z.infer<typeof consentRecordSchema>;
export type ConsentListFiltersInput = z.infer<typeof consentListFiltersSchema>;
