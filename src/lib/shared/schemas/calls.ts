import { z } from 'zod';

export const callStatusSchema = z.enum(['scheduled', 'canceled', 'completed']);

/** Admin scheduled-calls list filters. */
export const callListFiltersSchema = z.object({
	status: callStatusSchema.optional(),
	search: z.string().trim().max(200).optional(),
	limit: z.number().int().positive().max(1000).default(250),
	offset: z.number().int().nonnegative().default(0)
});

export type CallListFiltersInput = z.infer<typeof callListFiltersSchema>;
